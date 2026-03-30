import asyncio
import json
import logging

from .base_agent import BaseAgent
from .utils import extract_json, load_prompt, fetch_structural_gaps, fetch_policy_opportunities, compute_ssbci_deployment

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT_FALLBACK = """You are a senior economist and startup ecosystem analyst preparing a weekly intelligence brief
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

    async def _gather_agent_insights(self, pool):
        """Fetch recent outputs from other agents to enrich the brief.

        Queries analysis_results and scenario_results for the latest
        company narratives, risk assessments, causal evaluations, and
        ecosystem forecasts.  Each query is wrapped in try/except so that
        missing data never breaks the brief.

        Returns a dict with keys: recent_company_analyses, latest_risks,
        causal_insights, ecosystem_forecast.  Any key whose query returned
        no data is omitted.
        """
        insights: dict = {}

        # Sections 1-4: independent analysis_results fetches, run in parallel
        async def _fetch_company_analyses():
            try:
                rows = await pool.fetch(
                    """SELECT entity_id, content, created_at
                       FROM analysis_results
                       WHERE analysis_type = 'company_narrative'
                       ORDER BY created_at DESC
                       LIMIT 5"""
                )
                if rows:
                    analyses = []
                    for r in rows:
                        content = r["content"]
                        if isinstance(content, str):
                            content = json.loads(content)
                        analyses.append({
                            "entity_id": r["entity_id"],
                            "summary": content.get("executive_summary", "N/A"),
                            "recommendation": content.get("recommendation", "N/A"),
                            "created_at": str(r["created_at"]),
                        })
                    return ("recent_company_analyses", analyses)
            except Exception:
                logger.debug("Could not fetch company analyses for weekly brief.", exc_info=True)
            return None

        async def _fetch_risk_assessment():
            try:
                rows = await pool.fetch(
                    """SELECT content, created_at
                       FROM analysis_results
                       WHERE analysis_type = 'risk_assessment'
                       ORDER BY created_at DESC
                       LIMIT 1"""
                )
                if rows:
                    content = rows[0]["content"]
                    if isinstance(content, str):
                        content = json.loads(content)
                    risks = content.get("risks", [])
                    if risks:
                        return ("latest_risks", risks)
            except Exception:
                logger.debug("Could not fetch risk assessment for weekly brief.", exc_info=True)
            return None

        async def _fetch_causal_evaluations():
            try:
                rows = await pool.fetch(
                    """SELECT entity_id, content, created_at
                       FROM analysis_results
                       WHERE analysis_type = 'causal_evaluation'
                       ORDER BY created_at DESC
                       LIMIT 3"""
                )
                if rows:
                    causal = []
                    for r in rows:
                        content = r["content"]
                        if isinstance(content, str):
                            content = json.loads(content)
                        analyses = content.get("analyses", {})
                        did = analyses.get("accelerator_did", {})
                        causal.append({
                            "entity_id": r["entity_id"],
                            "att": did.get("att"),
                            "is_accelerated": did.get("is_significant", False),
                        })
                    return ("causal_insights", causal)
            except Exception:
                logger.debug("Could not fetch causal evaluations for weekly brief.", exc_info=True)
            return None

        async def _fetch_ecosystem_forecast():
            try:
                scenario = await pool.fetchrow(
                    """SELECT id FROM scenarios
                       WHERE status = 'complete'
                       ORDER BY updated_at DESC
                       LIMIT 1"""
                )
                if scenario:
                    agg = await pool.fetchrow(
                        """SELECT
                             SUM(CASE WHEN metric_name = 'funding_m' THEN value END) AS total_funding,
                             SUM(CASE WHEN metric_name = 'employees' THEN value END) AS total_employees,
                             AVG(CASE WHEN metric_name = 'momentum' THEN value END) AS avg_momentum
                           FROM scenario_results
                           WHERE scenario_id = $1""",
                        scenario["id"],
                    )
                    if agg and any(
                        agg[k] is not None
                        for k in ("total_funding", "total_employees", "avg_momentum")
                    ):
                        return ("ecosystem_forecast", {
                            "total_funding": (
                                float(agg["total_funding"])
                                if agg["total_funding"] is not None
                                else None
                            ),
                            "total_employees": (
                                float(agg["total_employees"])
                                if agg["total_employees"] is not None
                                else None
                            ),
                            "avg_momentum": (
                                round(float(agg["avg_momentum"]), 1)
                                if agg["avg_momentum"] is not None
                                else None
                            ),
                        })
            except Exception:
                logger.debug("Could not fetch ecosystem forecast for weekly brief.", exc_info=True)
            return None

        parallel_results = await asyncio.gather(
            _fetch_company_analyses(),
            _fetch_risk_assessment(),
            _fetch_causal_evaluations(),
            _fetch_ecosystem_forecast(),
        )
        for result in parallel_results:
            if result is not None:
                insights[result[0]] = result[1]

        # 5. Structural hole analysis (shared helper handles errors)
        holes = await fetch_structural_gaps(pool, limit=10)
        if holes:
            disconnected_count = sum(1 for h in holes if h["metric_name"] == "accelerator_connectivity_gap")
            max_severity = max((float(h["value"]) for h in holes if h["metric_name"] == "structural_hole_severity"), default=0)
            insights["structural_gaps"] = {
                "disconnected_companies": disconnected_count,
                "max_hole_severity": round(max_severity, 2),
                "top_gaps": [{"entity": h["entity_id"], "metric": h["metric_name"], "value": float(h["value"])} for h in holes[:5]]
            }

        # 6. Policy opportunity scores (shared helper handles errors)
        policies = await fetch_policy_opportunities(pool, limit=5)
        if policies:
            insights["policy_opportunities"] = [
                {"gap": p["entity_id"], "score": float(p["value"])} for p in policies
            ]

        # 7. Interstate comparison
        try:
            benchmarks = await pool.fetch(
                """SELECT entity_id, metric_name, value FROM metric_snapshots
                   WHERE metric_name IN ('vc_deployed_annual_m', 'accelerator_program_count', 'tech_workforce_pct')
                   AND entity_type = 'state'
                   ORDER BY entity_id, metric_name"""
            )
            if benchmarks:
                by_state = {}
                for b in benchmarks:
                    state = b["entity_id"]
                    by_state.setdefault(state, {})[b["metric_name"]] = float(b["value"])
                insights["interstate_benchmarks"] = by_state
        except Exception:
            logger.debug("Could not fetch interstate benchmarks for weekly brief.", exc_info=True)

        return insights

    @staticmethod
    def _format_agent_insights(insights):
        """Format the agent insights dict into a prompt section string.

        Only includes subsections for which data was gathered.  Returns an
        empty string when *insights* is empty.
        """
        if not insights:
            return ""

        parts = ["\n## Agent Intelligence (from automated analysis)"]

        if "recent_company_analyses" in insights:
            lines = []
            for a in insights["recent_company_analyses"]:
                lines.append(
                    f"- {a['entity_id']}: {a['summary']} "
                    f"(Recommendation: {a['recommendation']}, as of {a['created_at']})"
                )
            parts.append("\n### Recent Company Analyses\n" + "\n".join(lines))

        if "latest_risks" in insights:
            lines = []
            for r in insights["latest_risks"]:
                sev = r.get("severity", "unknown")
                title = r.get("title", "Untitled")
                desc = r.get("description", "")
                lines.append(f"- [{sev.upper()}] {title}: {desc}")
            parts.append("\n### Current Risk Alerts\n" + "\n".join(lines))

        if "causal_insights" in insights:
            lines = []
            for c in insights["causal_insights"]:
                att_str = f"ATT={c['att']}" if c["att"] is not None else "ATT=N/A"
                sig = "significant" if c["is_accelerated"] else "not significant"
                lines.append(f"- {c['entity_id'] or 'ecosystem'}: {att_str} ({sig})")
            parts.append("\n### Causal Insights\n" + "\n".join(lines))

        if "ecosystem_forecast" in insights:
            ef = insights["ecosystem_forecast"]
            lines = []
            if ef.get("total_funding") is not None:
                lines.append(f"- Projected total funding: ${ef['total_funding']:.1f}M")
            if ef.get("total_employees") is not None:
                lines.append(f"- Projected total employees: {ef['total_employees']:,.0f}")
            if ef.get("avg_momentum") is not None:
                lines.append(f"- Projected avg momentum: {ef['avg_momentum']}/100")
            if lines:
                parts.append("\n### Ecosystem Forecast\n" + "\n".join(lines))

        if "structural_gaps" in insights:
            sg = insights["structural_gaps"]
            parts.append(f"\n### Structural Gaps\n- {sg['disconnected_companies']} companies lack accelerator connections\n- Max structural hole severity: {sg['max_hole_severity']}")

        if "policy_opportunities" in insights:
            lines = [f"- {p['gap']}: score {p['score']}" for p in insights["policy_opportunities"]]
            parts.append("\n### Policy Opportunities\n" + "\n".join(lines))

        if "interstate_benchmarks" in insights:
            lines = []
            for state, metrics in insights["interstate_benchmarks"].items():
                vc = metrics.get("vc_deployed_annual_m", "N/A")
                acc = metrics.get("accelerator_program_count", "N/A")
                lines.append(f"- {state}: VC ${vc}M, {acc} accelerators")
            parts.append("\n### Interstate Benchmarks\n" + "\n".join(lines))

        return "\n".join(parts) if len(parts) > 1 else ""

    async def run(self, pool):
        companies, funds, recent_events, scores = await asyncio.gather(
            pool.fetch("SELECT name, funding_m, employees, momentum, sectors FROM companies ORDER BY momentum DESC"),
            pool.fetch("SELECT name, fund_type, allocated_m, deployed_m FROM funds"),
            pool.fetch("SELECT event_date, company_name, detail FROM timeline_events ORDER BY event_date DESC LIMIT 10"),
            pool.fetch("""SELECT cs.irs_score, cs.grade, c.name FROM computed_scores cs
               JOIN companies c ON c.id = cs.company_id
               ORDER BY cs.irs_score DESC NULLS LAST LIMIT 10"""),
        )

        total_funding = sum(float(c["funding_m"]) for c in companies)
        total_employees = sum(c["employees"] for c in companies)
        avg_momentum = (
            sum(c["momentum"] for c in companies) / len(companies)
            if companies
            else 0
        )
        ssbci_stats = compute_ssbci_deployment(funds)
        ssbci_deployed = ssbci_stats["total_deploy"]
        ssbci_allocated = ssbci_stats["total_alloc"]
        deploy_pct = ssbci_stats["deploy_pct"]

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

        # Gather recent outputs from other agents
        agent_insights = await self._gather_agent_insights(pool)
        agent_section = self._format_agent_insights(agent_insights)

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
{agent_section}

Return JSON with:
- "week_ending": today's date string
- "headline": one compelling headline (under 80 chars)
- "inputs": object with "summary" and "highlights" (array of strings)
- "capacities": object with "summary" and "highlights"
- "outputs": object with "summary" and "highlights"
- "impact": object with "summary" and "highlights"
- "ssbci_update": brief SSBCI deployment status
- "action_items": array of 2-3 recommended actions for stakeholders"""

        system_prompt = load_prompt("weekly_brief") or _SYSTEM_PROMPT_FALLBACK
        response_text = await self.call_claude(system_prompt, user_prompt)

        content = extract_json(response_text)
        if content is None:
            content = {"raw_brief": response_text}

        await self.save_analysis(
            pool,
            analysis_type="weekly_brief",
            content=content,
        )

        return {"brief": content}
