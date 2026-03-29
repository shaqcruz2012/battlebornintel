from .base_agent import BaseAgent
from .utils import extract_json, load_prompt, batch_async


_SYSTEM_PROMPT_FALLBACK = """You are an expert startup ecosystem analyst for the Nevada (Battle Born) startup ecosystem.
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
            results = await batch_async(
                lambda row: self._analyze_one(pool, row["id"]),
                rows,
                max_concurrency=3,
            )
            return {"analyzed": len(results)}

    async def _analyze_one(self, pool, company_id: int):
        # Fetch company data
        company = await pool.fetchrow(
            "SELECT * FROM companies WHERE id = $1", company_id
        )
        if not company:
            raise ValueError(f"Company {company_id} not found")

        # Fetch edges
        node_id = f"c_{company_id}"
        edges = await pool.fetch(
            """SELECT ge.*,
                      COALESCE(e.name, a.name, eo.name, p.name) as connected_name
               FROM graph_edges ge
               LEFT JOIN externals e ON (e.id = ge.source_id OR e.id = ge.target_id) AND e.id != $1
               LEFT JOIN accelerators a ON (a.id = ge.source_id OR a.id = ge.target_id) AND a.id != $1
               LEFT JOIN ecosystem_orgs eo ON (eo.id = ge.source_id OR eo.id = ge.target_id) AND eo.id != $1
               LEFT JOIN people p ON (p.id = ge.source_id OR p.id = ge.target_id) AND p.id != $1
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

        system_prompt = load_prompt("company_analyst") or _SYSTEM_PROMPT_FALLBACK
        response_text = self.call_claude(system_prompt, user_prompt)

        # Parse JSON from response
        content = extract_json(response_text)
        if content is None:
            content = {"raw_analysis": response_text}

        await self.save_analysis(
            pool,
            analysis_type="company_narrative",
            content=content,
            entity_type="company",
            entity_id=node_id,
        )

        return {"company_id": company_id, "name": company["name"], "analysis": content}
