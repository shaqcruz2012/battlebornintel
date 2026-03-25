"""DataScout agent — discovers new companies, funding, and relationships from external sources."""

import json
from datetime import datetime, timezone

import httpx

from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a research analyst for the Nevada startup ecosystem.
You analyze raw data from public sources (business filings, SBIR awards, press releases)
and extract structured information about companies, funding rounds, and relationships.

CRITICAL: Only extract facts that are explicitly stated in the source data.
Do not infer or fabricate information. If a field is uncertain, set confidence lower.

Output valid JSON."""

# Public data source configs
SOURCES = {
    "sbir": {
        "name": "SBIR/STTR Awards",
        "base_url": "https://api.sbir.gov/awards/all",
        "reliability": 0.9,
    },
    "sec_edgar": {
        "name": "SEC EDGAR",
        "base_url": "https://efts.sec.gov/LATEST/search-index",
        "reliability": 0.95,
    },
}

EXTRACT_COMPANY_TOOL = {
    "name": "extract_company",
    "description": "Extract structured company data from raw source text",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Company legal name"},
            "city": {"type": "string", "description": "City in Nevada"},
            "sectors": {"type": "array", "items": {"type": "string"}, "description": "Industry sectors"},
            "stage": {"type": "string", "enum": ["pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth", "public"], "description": "Company stage"},
            "description": {"type": "string", "description": "One-line description"},
            "source_url": {"type": "string", "description": "URL where this data was found"},
            "confidence": {"type": "number", "description": "Confidence 0.0-1.0 in extracted data"},
        },
        "required": ["name", "confidence"],
    },
}

EXTRACT_FUNDING_TOOL = {
    "name": "extract_funding",
    "description": "Extract funding round data from raw source text",
    "input_schema": {
        "type": "object",
        "properties": {
            "company_name": {"type": "string"},
            "amount_m": {"type": "number", "description": "Amount in millions USD"},
            "round_type": {"type": "string"},
            "investor_names": {"type": "array", "items": {"type": "string"}},
            "date": {"type": "string", "description": "ISO date YYYY-MM-DD"},
            "source_url": {"type": "string"},
            "confidence": {"type": "number"},
        },
        "required": ["company_name", "confidence"],
    },
}


class DataScout(BaseAgent):
    """Discovers new companies, funding rounds, and relationships from public sources."""

    def __init__(self):
        super().__init__("data_scout")

    async def run(self, pool, source: str | None = None):
        results = {"discovered": 0, "queued": 0, "sources_checked": []}

        sources_to_check = [source] if source else list(SOURCES.keys())

        for src_key in sources_to_check:
            if src_key not in SOURCES:
                continue
            src_cfg = SOURCES[src_key]
            results["sources_checked"].append(src_key)

            if src_key == "sbir":
                found = await self._check_sbir(pool, src_cfg)
                results["discovered"] += found

        results["queued"] = results["discovered"]
        return results

    async def _check_sbir(self, pool, src_cfg: dict) -> int:
        """Check SBIR/STTR awards for Nevada companies."""
        discovered = 0
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Query SBIR API for Nevada awards from recent years
                resp = await client.get(
                    src_cfg["base_url"],
                    params={
                        "keyword": "Nevada",
                        "rows": 50,
                        "start": 0,
                    },
                )
                if resp.status_code != 200:
                    print(f"[data_scout] SBIR API returned {resp.status_code}")
                    return 0

                data = resp.json()
                awards = data if isinstance(data, list) else data.get("results", data.get("awards", []))

        except Exception as e:
            print(f"[data_scout] SBIR fetch failed: {e}")
            return 0

        # Process each award through Claude for structured extraction
        for award in awards[:20]:  # Cap per run to control API costs
            award_text = json.dumps(award, default=str)

            # Check if we already know this company
            company_name = award.get("firm", award.get("company", ""))
            if not company_name:
                continue

            existing = await self.search_entities(pool, company_name, entity_type="company", limit=1)
            if existing:
                continue  # Already in ecosystem

            # Use Claude to extract structured data
            try:
                response = self.call_claude_with_tools(
                    SYSTEM_PROMPT,
                    f"Extract company data from this SBIR/STTR award record:\n\n{award_text}",
                    tools=[EXTRACT_COMPANY_TOOL],
                )

                for block in response.content:
                    if block.type == "tool_use" and block.name == "extract_company":
                        extracted = block.input
                        if extracted.get("confidence", 0) < 0.3:
                            continue

                        await self.queue_ingestion(
                            pool,
                            entity_type="company",
                            entity_data={
                                "name": extracted["name"],
                                "city": extracted.get("city", ""),
                                "sectors": extracted.get("sectors", []),
                                "stage": extracted.get("stage", "seed"),
                                "description": extracted.get("description", ""),
                                "region": "las_vegas" if "vegas" in extracted.get("city", "").lower() else "reno",
                            },
                            source="sbir",
                            source_url=extracted.get("source_url", "https://sbir.gov"),
                            confidence=extracted.get("confidence", 0.5) * src_cfg["reliability"],
                        )
                        discovered += 1

            except Exception as e:
                print(f"[data_scout] Claude extraction failed for {company_name}: {e}")
                continue

        return discovered

    async def _check_nv_sos(self, pool) -> int:
        """Check Nevada Secretary of State for new business filings.
        Placeholder for Phase 2 — requires NV SOS API access."""
        return 0
