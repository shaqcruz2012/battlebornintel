import json
from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are an expert startup ecosystem analyst for the Nevada (Battle Born) startup ecosystem.
You produce concise, data-driven company analyses for government economic development stakeholders.

Your analysis should follow the MIT REAP framework dimensions:
- Inputs: capital, talent, infrastructure
- Capacities: innovation, entrepreneurship, risk capital
- Outputs: new firms, jobs, patents, products
- Impact: economic growth, GDP contribution, cluster effects

Be specific with numbers. Be direct. No fluff. Output valid JSON."""


class CompanyAnalyst(BaseAgent):
    """Generates AI-powered company narratives and analysis."""

    def __init__(self):
        super().__init__("company_analyst")

    async def run(self, pool, company_id: int | None = None):
        if company_id:
            return await self._analyze_one(pool, company_id)
        else:
            # Analyze all companies
            rows = await pool.fetch("SELECT id FROM companies ORDER BY id")
            results = []
            for row in rows:
                r = await self._analyze_one(pool, row["id"])
                results.append(r)
            return {"analyzed": len(results)}

    async def _analyze_one(self, pool, company_id: int):
        # Fetch company data
        company = await pool.fetchrow(
            "SELECT * FROM companies WHERE id = $1", company_id
        )
        if not company:
            raise ValueError(f"Company {company_id} not found")

        # Fetch edges with names from unified entity_registry
        node_id = f"c_{company_id}"
        edges = await pool.fetch(
            """SELECT ge.source_id, ge.target_id, ge.rel, ge.note,
                      er.label AS connected_name
               FROM graph_edges ge
               LEFT JOIN entity_registry er
                 ON er.canonical_id = CASE
                      WHEN ge.source_id = $1 THEN ge.target_id
                      ELSE ge.source_id
                    END
               WHERE ge.source_id = $1 OR ge.target_id = $1""",
            node_id,
        )

        # Fetch computed score
        score = await pool.fetchrow(
            """SELECT * FROM computed_scores
               WHERE company_id = $1 ORDER BY computed_at DESC LIMIT 1""",
            company_id,
        )

        # Build prompt
        sectors = ", ".join(company["sectors"]) if company["sectors"] else "N/A"
        eligible = ", ".join(company["eligible"]) if company["eligible"] else "None"
        connections = [
            f"{e['rel']}: {e['connected_name'] or 'unknown'} ({e['note'] or ''})"
            for e in edges
            if e["connected_name"]
        ]

        user_prompt = f"""Analyze this Nevada startup company:

Company: {company['name']}
Stage: {company['stage']}
Sectors: {sectors}
City: {company['city']}, Region: {company['region']}
Funding: ${company['funding_m']}M
Employees: {company['employees']}
Founded: {company['founded']}
Description: {company['description'] or 'N/A'}
Fund Eligibility: {eligible}
IRS Score: {score['irs_score'] if score else 'N/A'} / Grade: {score['grade'] if score else 'N/A'}
Network Connections ({len(connections)}): {'; '.join(connections[:15])}

Return JSON with these keys:
- "executive_summary": 2-3 sentence overview
- "growth_trajectory": assessment of growth path and stage progression
- "competitive_position": how they sit in the NV and national landscape
- "risk_factors": top 2-3 risks
- "reap_assessment": object with keys "inputs", "capacities", "outputs", "impact" (1 sentence each)
- "recommendation": one-line investment/support recommendation"""

        response_text = self.call_claude(SYSTEM_PROMPT, user_prompt)

        # Parse JSON from response
        try:
            # Try to extract JSON from response
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            content = json.loads(response_text[start:end])
        except (json.JSONDecodeError, ValueError):
            content = {"raw_analysis": response_text}

        await self.save_analysis(
            pool,
            analysis_type="company_narrative",
            content=content,
            entity_type="company",
            entity_id=node_id,
        )

        return {"company_id": company_id, "name": company["name"], "analysis": content}
