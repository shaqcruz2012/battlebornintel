"""
FundingRoundIngestor — Populates funding_rounds from existing data + free public APIs.

Strategy (no paid APIs required):
  1. Derive rounds from existing graph_edges (invested_in with deal metadata)
  2. Parse SBIR/STTR awards into grant-type rounds (SBIR API — free, public)
  3. Extract funding events from timeline_events and stakeholder_activities
  4. Use Claude to parse unstructured notes into structured round data

All sources are either internal DB data or free government APIs.
"""

import json
import re
from datetime import date

import httpx

from .base_agent import BaseAgent

SBIR_API = "https://api.sbir.gov/awards/all"

ROUND_EXTRACT_TOOL = {
    "name": "extract_rounds",
    "description": "Extract structured funding round data from text",
    "input_schema": {
        "type": "object",
        "properties": {
            "rounds": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "round_type": {"type": "string", "enum": [
                            "pre_seed", "seed", "series_a", "series_b",
                            "series_c", "series_d_plus", "growth",
                            "grant", "debt", "convertible_note", "unknown"
                        ]},
                        "raise_amount_m": {"type": "number"},
                        "lead_investor": {"type": "string"},
                        "year": {"type": "integer"},
                        "confidence": {"type": "number"},
                    },
                    "required": ["round_type", "confidence"],
                },
            },
        },
        "required": ["rounds"],
    },
}

SYSTEM_PROMPT = """You are a funding round data extractor. Given a company's description,
investment edges, and event notes, extract discrete funding rounds.

Rules:
- Only extract rounds you have evidence for (edge notes, descriptions mentioning "$XM Series A")
- Set confidence 0.9 for explicit mentions, 0.6 for inferred from stage/funding total
- Do NOT fabricate rounds — if you only know total funding, create one 'unknown' round
- Parse "$147M" as 147.0, "$4.17B" as 4170.0"""


class FundingRoundIngestor(BaseAgent):
    def __init__(self):
        super().__init__("funding_round_ingestor")

    async def run(self, pool, *, limit=50, **kwargs):
        results = {"from_edges": 0, "from_sbir": 0, "from_claude": 0, "errors": []}

        results["from_edges"] = await self._derive_from_edges(pool)
        results["from_sbir"] = await self._ingest_sbir(pool, results["errors"])
        results["from_claude"] = await self._extract_from_descriptions(
            pool, limit, results["errors"]
        )

        await self.save_analysis(
            pool,
            analysis_type="funding_round_ingestion",
            content=results,
            model_used="claude-sonnet-4-20250514",
        )
        return results

    async def _derive_from_edges(self, pool):
        """Derive funding rounds from invested_in edges with capital_m or note data."""
        result = await pool.execute("""
            INSERT INTO funding_rounds
              (company_id, round_type, announced_date, raise_amount_m,
               lead_investor_id, round_notes, source_url, confidence, verified, agent_id)
            SELECT
              c.id,
              COALESCE(
                CASE
                  WHEN ge.note ~* 'series a' THEN 'series_a'
                  WHEN ge.note ~* 'series b' THEN 'series_b'
                  WHEN ge.note ~* 'series c' THEN 'series_c'
                  WHEN ge.note ~* 'seed' THEN 'seed'
                  WHEN ge.note ~* 'pre.seed' THEN 'pre_seed'
                  WHEN ge.note ~* 'growth' THEN 'growth'
                  WHEN ge.note ~* 'grant' OR ge.rel = 'grants_to' THEN 'grant'
                  ELSE 'unknown'
                END,
                'unknown'
              ),
              ge.event_date,
              ge.capital_m,
              ge.source_id,
              ge.note,
              ge.source_url,
              COALESCE(ge.confidence, 0.7),
              FALSE,
              'funding_round_ingestor'
            FROM graph_edges ge
            JOIN companies c ON ge.target_id = 'c_' || c.id::TEXT
            WHERE ge.rel IN ('invested_in', 'funded', 'grants_to')
              AND ge.capital_m IS NOT NULL
              AND ge.capital_m > 0
              AND NOT EXISTS (
                SELECT 1 FROM funding_rounds fr
                WHERE fr.company_id = c.id
                  AND fr.announced_date = ge.event_date
                  AND fr.lead_investor_id = ge.source_id
              )
        """)
        # Parse affected rows from CommandComplete tag
        count = int(result.split()[-1]) if result and result.split()[-1].isdigit() else 0
        return count

    async def _ingest_sbir(self, pool, errors):
        """Fetch SBIR/STTR awards for Nevada companies — free public API."""
        inserted = 0
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(SBIR_API, params={
                    "keyword": "Nevada",
                    "rows": 100,
                    "start": 0,
                })
                resp.raise_for_status()
                awards = resp.json()

                for award in awards:
                    company_name = award.get("firm", "")
                    amount = award.get("award", 0)
                    if not company_name or not amount:
                        continue

                    # Match to existing company
                    row = await pool.fetchrow(
                        "SELECT id FROM companies WHERE name ILIKE $1 LIMIT 1",
                        f"%{company_name}%"
                    )
                    if not row:
                        continue

                    amount_m = amount / 1_000_000
                    award_year = award.get("year", date.today().year)
                    phase = award.get("phase", "")
                    round_type = "grant"

                    await pool.execute("""
                        INSERT INTO funding_rounds
                          (company_id, round_type, announced_date, raise_amount_m,
                           round_notes, source_url, confidence, verified, agent_id)
                        VALUES ($1, $2, $3, $4, $5, $6, 0.95, TRUE, 'funding_round_ingestor')
                        ON CONFLICT DO NOTHING
                    """,
                        row["id"], round_type,
                        f"{award_year}-01-01",
                        amount_m,
                        f"SBIR {phase}: {award.get('agency', '')} — {award.get('title', '')}"[:500],
                        f"https://www.sbir.gov/node/{award.get('award_id', '')}",
                    )
                    inserted += 1

        except Exception as e:
            errors.append(f"SBIR: {str(e)[:100]}")

        return inserted

    async def _extract_from_descriptions(self, pool, limit, errors):
        """Use Claude to parse funding rounds from company descriptions and edge notes."""
        rows = await pool.fetch("""
            SELECT c.id, c.slug, c.name, c.stage, c.funding_m, c.description,
                   ARRAY_AGG(ge.note) FILTER (WHERE ge.note IS NOT NULL) as edge_notes
            FROM companies c
            LEFT JOIN graph_edges ge ON ge.target_id = 'c_' || c.id::TEXT
              AND ge.rel IN ('invested_in', 'funded', 'funded_by')
            WHERE c.funding_m > 0
              AND NOT EXISTS (SELECT 1 FROM funding_rounds fr WHERE fr.company_id = c.id)
            GROUP BY c.id
            ORDER BY c.funding_m DESC
            LIMIT $1
        """, limit)

        if not rows:
            return 0

        inserted = 0
        # Process in batches of 10
        for i in range(0, len(rows), 10):
            batch = rows[i:i+10]
            batch_text = "\n\n".join(
                f"Company: {r['name']} (id={r['id']})\n"
                f"Stage: {r['stage']}, Total Funding: ${r['funding_m']}M\n"
                f"Description: {(r['description'] or 'none')[:300]}\n"
                f"Investment notes: {'; '.join(r['edge_notes'] or ['none'])[:300]}"
                for r in batch
            )

            try:
                response = self.call_claude_with_tools(
                    SYSTEM_PROMPT,
                    f"Extract funding rounds for these {len(batch)} companies:\n\n{batch_text}",
                    tools=[ROUND_EXTRACT_TOOL],
                    max_tokens=4096,
                )

                # Map rounds back to companies by index
                round_idx = 0
                for block in response.content:
                    if block.type != "tool_use" or block.name != "extract_rounds":
                        continue
                    for rd in block.input.get("rounds", []):
                        if rd.get("confidence", 0) < 0.5:
                            continue
                        company = batch[min(round_idx, len(batch) - 1)]
                        round_idx += 1
                        await pool.execute("""
                            INSERT INTO funding_rounds
                              (company_id, round_type, raise_amount_m,
                               lead_investor_id, confidence, agent_id)
                            VALUES ($1, $2, $3, $4, $5, 'funding_round_ingestor')
                            ON CONFLICT DO NOTHING
                        """,
                            company["id"],
                            rd.get("round_type", "unknown"),
                            rd.get("raise_amount_m"),
                            rd.get("lead_investor"),
                            rd.get("confidence", 0.6),
                        )
                        inserted += 1

            except Exception as e:
                errors.append(f"Claude extraction batch {i}: {str(e)[:100]}")

        return inserted
