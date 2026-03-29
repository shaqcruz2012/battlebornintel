from .base_agent import BaseAgent
from .utils import extract_json, load_prompt


_SYSTEM_PROMPT_FALLBACK = """You are a risk analyst for Nevada's startup ecosystem investment portfolio.
Identify and assess risks to public-private investment outcomes.
Be specific with numbers and company names. Output valid JSON."""


class RiskAssessor(BaseAgent):
    """Monitors portfolio risks and generates risk assessments."""

    def __init__(self):
        super().__init__("risk_assessor")

    async def run(self, pool):
        companies = await pool.fetch("SELECT * FROM companies")
        funds = await pool.fetch("SELECT * FROM funds")
        scores = await pool.fetch(
            """SELECT cs.*, c.name, c.funding_m, c.momentum
               FROM computed_scores cs
               JOIN companies c ON c.id = cs.company_id
               ORDER BY cs.computed_at DESC"""
        )

        # Identify risk signals
        ssbci = [f for f in funds if f["fund_type"] == "SSBCI"]
        total_alloc = sum(float(f["allocated_m"]) for f in ssbci if f["allocated_m"])
        total_deploy = sum(float(f["deployed_m"]) for f in ssbci)
        deploy_pct = round(total_deploy / total_alloc * 100) if total_alloc else 0

        low_momentum = [
            c for c in companies
            if float(c["funding_m"]) >= 10 and c["momentum"] < 30
        ]
        sector_counts = {}
        for c in companies:
            for s in (c["sectors"] or []):
                sector_counts[s] = sector_counts.get(s, 0) + 1
        top_sector = max(sector_counts.items(), key=lambda x: x[1]) if sector_counts else ("N/A", 0)
        concentration = round(top_sector[1] / len(companies) * 100) if companies else 0

        user_prompt = f"""Assess risks for Nevada's startup ecosystem portfolio:

SSBCI DEPLOYMENT:
- Total allocated: ${total_alloc:.0f}M across {len(ssbci)} SSBCI funds
- Total deployed: ${total_deploy:.1f}M ({deploy_pct}%)
- Individual: {', '.join(f"{f['name']}: ${float(f['deployed_m']):.1f}M/{float(f['allocated_m']):.0f}M" for f in ssbci if f['allocated_m'])}

STALLED COMPANIES ({len(low_momentum)} with funding >$10M but momentum <30):
{chr(10).join(f"- {c['name']}: ${float(c['funding_m']):.1f}M funding, {c['momentum']} momentum" for c in low_momentum[:5])}

CONCENTRATION:
- Top sector: {top_sector[0]} ({concentration}% of portfolio)
- Total tracked: {len(companies)} companies

Return JSON array of risk objects, each with:
- "severity": "critical" | "high" | "medium" | "low"
- "category": short category name
- "title": risk title (under 60 chars)
- "description": 2-3 sentence explanation
- "recommendation": actionable mitigation step"""

        system_prompt = load_prompt("risk_assessor") or _SYSTEM_PROMPT_FALLBACK
        response_text = self.call_claude(system_prompt, user_prompt)

        parsed = extract_json(response_text)
        if parsed is None:
            risks = [{"raw": response_text}]
        elif isinstance(parsed, list):
            risks = parsed
        else:
            risks = [parsed]

        await self.save_analysis(
            pool,
            analysis_type="risk_assessment",
            content={"risks": risks, "deploy_pct": deploy_pct},
        )

        return {"risks_identified": len(risks)}
