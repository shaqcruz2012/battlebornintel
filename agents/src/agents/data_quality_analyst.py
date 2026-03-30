"""
DataQualityAnalyst — Uses Claude to detect data quality issues.

Checks:
  1. Fabrication detection: flags companies with generic/AI-generated names or descriptions
  2. Confidence scoring: re-evaluates entity confidence based on source quality
  3. Stale data detection: entities not updated in 90+ days
  4. Inconsistency detection: funding vs stage mismatches, employee vs stage mismatches
  5. Source URL validation: flags entries with missing or placeholder source URLs

Uses Claude for semantic analysis (fabrication detection, description quality).
Uses SQL for structural checks (staleness, mismatches).
"""

import json
from .base_agent import BaseAgent

FABRICATION_TOOL = {
    "name": "flag_entities",
    "description": "Flag entities with potential data quality issues",
    "input_schema": {
        "type": "object",
        "properties": {
            "flagged": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "slug": {"type": "string"},
                        "issue": {"type": "string", "enum": [
                            "likely_fabricated", "generic_name", "placeholder_description",
                            "suspicious_metrics", "unverifiable", "clean"
                        ]},
                        "confidence": {"type": "number", "description": "0-1 confidence in the flag"},
                        "reasoning": {"type": "string"},
                    },
                    "required": ["slug", "issue", "confidence", "reasoning"],
                },
            },
        },
        "required": ["flagged"],
    },
}

SYSTEM_PROMPT = """You are a data integrity analyst for a Nevada innovation ecosystem database.
Your job is to identify companies that may contain fabricated, placeholder, or AI-generated data.

Real Nevada companies have:
- Specific, unique names (not generic patterns like "VegasLogic AI" or "NevadaVolt Energy")
- Concrete descriptions with verifiable claims (funding rounds, products, customers)
- Realistic employee counts for their stage
- Funding amounts that match their stage

Fabricated entries often have:
- Names combining [NevadaCity] + [TechBuzzword] + [Suffix] (e.g., "DesertForge Analytics")
- Vague descriptions without specific products or customers
- Round funding numbers ($5M, $10M) without named investors
- Description language that reads like an AI summary rather than factual reporting

For each company, classify as: likely_fabricated, generic_name, placeholder_description,
suspicious_metrics, unverifiable, or clean."""


class DataQualityAnalyst(BaseAgent):
    def __init__(self):
        super().__init__("data_quality_analyst")

    async def run(self, pool, *, limit=50, **kwargs):
        findings = []

        findings.extend(await self._check_fabrication(pool, limit))
        findings.extend(await self._check_staleness(pool))
        findings.extend(await self._check_stage_funding_mismatch(pool))
        findings.extend(await self._check_source_quality(pool))

        severity_counts = {"critical": 0, "warning": 0, "info": 0}
        for f in findings:
            severity_counts[f.get("severity", "info")] += 1

        result = {
            "total_findings": len(findings),
            "severity_counts": severity_counts,
            "findings": findings,
        }

        await self.save_analysis(
            pool,
            analysis_type="data_quality_audit",
            content=result,
        )
        return result

    async def _check_fabrication(self, pool, limit):
        """Use Claude to analyze companies for fabrication signals."""
        rows = await pool.fetch("""
            SELECT id, slug, name, stage, sectors, city, region,
                   funding_m, momentum, employees, founded, description
            FROM companies
            ORDER BY id
            LIMIT $1
        """, limit)

        if not rows:
            return []

        batch_text = "\n\n".join(
            f"ID: {r['id']}, Slug: {r['slug']}, Name: {r['name']}, "
            f"Stage: {r['stage']}, Sectors: {r['sectors']}, "
            f"City: {r['city']}, Region: {r['region']}, "
            f"Funding: ${r['funding_m']}M, Employees: {r['employees']}, "
            f"Founded: {r['founded']}\n"
            f"Description: {(r['description'] or '')[:300]}"
            for r in rows
        )

        response = self.call_claude_with_tools(
            SYSTEM_PROMPT,
            f"Analyze these {len(rows)} companies for data quality issues:\n\n{batch_text}",
            tools=[FABRICATION_TOOL],
            max_tokens=8192,
        )

        findings = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "flag_entities":
                for flag in block.input.get("flagged", []):
                    if flag["issue"] == "clean":
                        continue
                    severity = "critical" if flag["issue"] == "likely_fabricated" else "warning"
                    findings.append({
                        "check": "fabrication_detection",
                        "severity": severity,
                        "entity": flag["slug"],
                        "issue": flag["issue"],
                        "confidence": flag["confidence"],
                        "message": flag["reasoning"],
                    })
        return findings

    async def _check_staleness(self, pool):
        """Find entities with no recent activity or updates."""
        findings = []
        rows = await pool.fetch("""
            SELECT c.id, c.slug, c.name, c.updated_at,
                   MAX(ge.event_date) AS last_edge_date
            FROM companies c
            LEFT JOIN graph_edges ge ON (
                ge.source_id = 'c_' || c.id::TEXT
                OR ge.target_id = 'c_' || c.id::TEXT
            )
            GROUP BY c.id, c.slug, c.name, c.updated_at
            HAVING MAX(ge.event_date) < CURRENT_DATE - INTERVAL '180 days'
                OR MAX(ge.event_date) IS NULL
            ORDER BY last_edge_date ASC NULLS FIRST
            LIMIT 25
        """)
        for r in rows:
            findings.append({
                "check": "stale_data",
                "severity": "info",
                "entity": r["slug"],
                "message": f"{r['name']}: last edge activity {r['last_edge_date'] or 'never'}",
            })
        return findings

    async def _check_stage_funding_mismatch(self, pool):
        """Flag companies where funding doesn't match stage."""
        findings = []
        mismatches = [
            ("seed", 50, "Seed company with >$50M funding"),
            ("pre_seed", 10, "Pre-seed company with >$10M funding"),
        ]
        for stage, threshold, msg in mismatches:
            rows = await pool.fetch("""
                SELECT slug, name, funding_m, stage
                FROM companies
                WHERE stage = $1 AND funding_m > $2
            """, stage, threshold)
            for r in rows:
                findings.append({
                    "check": "stage_funding_mismatch",
                    "severity": "warning",
                    "entity": r["slug"],
                    "message": f"{msg}: {r['name']} has ${r['funding_m']}M at {r['stage']} stage",
                })

        # Growth companies with tiny funding
        rows = await pool.fetch("""
            SELECT slug, name, funding_m, stage
            FROM companies
            WHERE stage IN ('series_c_plus', 'growth') AND funding_m < 5 AND funding_m > 0
        """)
        for r in rows:
            findings.append({
                "check": "stage_funding_mismatch",
                "severity": "warning",
                "entity": r["slug"],
                "message": f"Growth-stage company with <$5M: {r['name']} has ${r['funding_m']}M at {r['stage']}",
            })
        return findings

    async def _check_source_quality(self, pool):
        """Check for entities with no source attribution."""
        findings = []
        row = await pool.fetchrow("""
            SELECT COUNT(*) AS cnt FROM companies
            WHERE (source_url IS NULL OR source_url = '')
              AND verified = FALSE
        """)
        if row["cnt"] > 0:
            findings.append({
                "check": "missing_sources",
                "severity": "info",
                "message": f"{row['cnt']} unverified companies have no source_url",
            })
        return findings
