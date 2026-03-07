import json
from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a senior economist and startup ecosystem analyst preparing a weekly intelligence brief
for the Nevada Governor's Office of Economic Development (GOED) and SSBCI fund managers.

Structure the brief using the MIT REAP framework:
1. Inputs (capital flows, new funding)
2. Capacities (talent, infrastructure, programs)
3. Outputs (new companies, products, partnerships)
4. Impact (jobs, economic growth, ecosystem health)

Be concise, data-driven, and actionable. Output valid JSON."""


class WeeklyBrief(BaseAgent):
    """Generates weekly intelligence briefs for the BBI dashboard."""

    def __init__(self):
        super().__init__("weekly_brief")

    async def run(self, pool):
        # Aggregate data for the brief
        companies = await pool.fetch(
            "SELECT * FROM companies ORDER BY momentum DESC"
        )
        funds = await pool.fetch("SELECT * FROM funds")
        recent_events = await pool.fetch(
            "SELECT * FROM timeline_events ORDER BY event_date DESC LIMIT 10"
        )
        scores = await pool.fetch(
            """SELECT cs.*, c.name FROM computed_scores cs
               JOIN companies c ON c.id = cs.company_id
               ORDER BY cs.irs_score DESC NULLS LAST LIMIT 10"""
        )

        # Build summary stats
        total_funding = sum(float(c["funding_m"]) for c in companies)
        total_employees = sum(c["employees"] for c in companies)
        avg_momentum = (
            sum(c["momentum"] for c in companies) / len(companies)
            if companies
            else 0
        )
        ssbci_funds = [f for f in funds if f["fund_type"] == "SSBCI"]
        ssbci_deployed = sum(float(f["deployed_m"]) for f in ssbci_funds)
        ssbci_allocated = sum(
            float(f["allocated_m"]) for f in ssbci_funds if f["allocated_m"]
        )
        deploy_pct = (
            round(ssbci_deployed / ssbci_allocated * 100) if ssbci_allocated else 0
        )

        top_movers = [
            f"{c['name']} (momentum: {c['momentum']})"
            for c in companies[:5]
        ]
        top_scored = [
            f"{s['name']} (IRS: {s['irs_score']}, {s['grade']})"
            for s in scores[:5]
        ]
        events_text = "\n".join(
            f"- {e['event_date']}: {e['company_name']} - {e['detail']}"
            for e in recent_events
        )

        user_prompt = f"""Generate a weekly intelligence brief for Nevada's startup ecosystem.

ECOSYSTEM STATS:
- Total companies tracked: {len(companies)}
- Total funding: ${total_funding:.0f}M
- Total employees: {total_employees:,}
- Average momentum score: {avg_momentum:.0f}/100
- SSBCI deployment: ${ssbci_deployed:.1f}M of ${ssbci_allocated:.0f}M ({deploy_pct}%)

TOP MOMENTUM COMPANIES:
{chr(10).join(f'- {m}' for m in top_movers)}

TOP IRS-SCORED COMPANIES:
{chr(10).join(f'- {s}' for s in top_scored)}

RECENT EVENTS:
{events_text}

Return JSON with:
- "week_ending": today's date string
- "headline": one compelling headline (under 80 chars)
- "inputs": object with "summary" and "highlights" (array of strings)
- "capacities": object with "summary" and "highlights"
- "outputs": object with "summary" and "highlights"
- "impact": object with "summary" and "highlights"
- "ssbci_update": brief SSBCI deployment status
- "action_items": array of 2-3 recommended actions for stakeholders"""

        response_text = self.call_claude(SYSTEM_PROMPT, user_prompt)

        try:
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            content = json.loads(response_text[start:end])
        except (json.JSONDecodeError, ValueError):
            content = {"raw_brief": response_text}

        await self.save_analysis(
            pool,
            analysis_type="weekly_brief",
            content=content,
        )

        return {"brief": content}
