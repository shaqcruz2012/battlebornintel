import asyncio
import logging

from .base_agent import BaseAgent
from .utils import extract_json, load_prompt

logger = logging.getLogger(__name__)


_SYSTEM_PROMPT_FALLBACK = """You are a risk analyst for Nevada's startup ecosystem investment portfolio.
Identify and assess risks to public-private investment outcomes, including structural
and network risks (connectivity gaps, structural holes in the ecosystem graph),
IP concentration, capital flow bottlenecks, and policy opportunity alignment.
Be specific with numbers and company names. Output valid JSON."""


class RiskAssessor(BaseAgent):
    """Monitors portfolio risks and generates risk assessments."""

    def __init__(self):
        super().__init__("risk_assessor")

    async def run(self, pool):
        companies, funds = await asyncio.gather(
            pool.fetch("SELECT id, name, funding_m, momentum, sectors FROM companies"),
            pool.fetch("SELECT name, fund_type, allocated_m, deployed_m FROM funds"),
        )

        # Identify risk signals
        ssbci = [f for f in funds if f["fund_type"] == "SSBCI"]
        total_alloc = sum(float(f["allocated_m"]) for f in ssbci if f["allocated_m"])
        total_deploy = sum(float(f["deployed_m"]) for f in ssbci)
        deploy_pct = round(total_deploy / total_alloc * 100) if total_alloc > 0 else 0

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

        # --- Fetch metric_snapshots queries in parallel ---
        async def _fetch_connectivity():
            try:
                return await pool.fetch(
                    """SELECT entity_id, metric_name, value FROM metric_snapshots
                       WHERE entity_type = 'company'
                       AND metric_name IN ('accelerator_connectivity_gap', 'rural_isolation_flag')
                       AND value > 0"""
                )
            except Exception:
                logger.debug("Could not fetch connectivity metrics.", exc_info=True)
                return []

        async def _fetch_ip_domains():
            try:
                return await pool.fetch(
                    """SELECT value AS tech_domain, COUNT(*) AS cnt FROM metric_snapshots
                       WHERE entity_type = 'company' AND metric_name = 'tech_domain_code'
                       GROUP BY value ORDER BY cnt DESC"""
                )
            except Exception:
                logger.debug("Could not fetch IP domain metrics.", exc_info=True)
                return []

        async def _fetch_leverage():
            try:
                return await pool.fetch(
                    """SELECT entity_id, value FROM metric_snapshots
                       WHERE metric_name = 'ssbci_leverage_ratio' AND entity_type = 'fund'"""
                )
            except Exception:
                logger.debug("Could not fetch leverage metrics.", exc_info=True)
                return []

        async def _fetch_policy():
            try:
                return await pool.fetch(
                    """SELECT entity_id, value FROM metric_snapshots
                       WHERE metric_name = 'policy_opportunity_score' AND entity_type = 'policy'
                       ORDER BY value DESC LIMIT 3"""
                )
            except Exception:
                logger.debug("Could not fetch policy metrics.", exc_info=True)
                return []

        connectivity_rows, ip_domain_rows, leverage_rows, policy_rows = await asyncio.gather(
            _fetch_connectivity(),
            _fetch_ip_domains(),
            _fetch_leverage(),
            _fetch_policy(),
        )

        # --- Structural hole / connectivity risk ---
        disconnected_companies = []
        rural_isolated = []
        for row in connectivity_rows:
            if row["metric_name"] == "accelerator_connectivity_gap":
                disconnected_companies.append(row["entity_id"])
            elif row["metric_name"] == "rural_isolation_flag":
                rural_isolated.append(row["entity_id"])

        # --- IP concentration risk ---
        top_ip_domain = ip_domain_rows[0] if ip_domain_rows else None
        ip_total = sum(int(r["cnt"]) for r in ip_domain_rows) if ip_domain_rows else 0
        ip_concentration_pct = (
            round(int(top_ip_domain["cnt"]) / ip_total * 100)
            if top_ip_domain and ip_total > 0
            else 0
        )

        # --- Capital flow risk ---
        low_leverage_funds = [r for r in leverage_rows if float(r["value"]) < 1.0]

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

STRUCTURAL HOLE / CONNECTIVITY RISK (T-GNN):
- Companies with accelerator connectivity gap: {len(disconnected_companies)}
- Rural-isolated companies: {len(rural_isolated)}
- Total structurally at-risk: {len(set(disconnected_companies + rural_isolated))}

IP CONCENTRATION RISK:
- Top tech domain: {top_ip_domain['tech_domain'] if top_ip_domain else 'N/A'} ({ip_concentration_pct}% of portfolio, {int(top_ip_domain['cnt']) if top_ip_domain else 0} companies)
- Total domains tracked: {len(ip_domain_rows)}
{chr(10).join(f"- {r['tech_domain']}: {r['cnt']} companies" for r in ip_domain_rows[:5]) if ip_domain_rows else '- No IP domain data available'}

CAPITAL FLOW RISK:
- Funds with leverage ratio < 1.0x: {len(low_leverage_funds)} of {len(leverage_rows)} tracked
{chr(10).join(f"- Fund {r['entity_id']}: leverage {float(r['value']):.2f}x" for r in low_leverage_funds[:5]) if low_leverage_funds else '- All tracked funds meet minimum leverage'}

POLICY OPPORTUNITY CONTEXT:
{chr(10).join(f"- {r['entity_id']}: opportunity score {float(r['value']):.1f}" for r in policy_rows) if policy_rows else '- No policy opportunity data available'}

Return JSON array of risk objects, each with:
- "severity": "critical" | "high" | "medium" | "low"
- "category": short category name
- "title": risk title (under 60 chars)
- "description": 2-3 sentence explanation
- "recommendation": actionable mitigation step"""

        system_prompt = load_prompt("risk_assessor") or _SYSTEM_PROMPT_FALLBACK
        response_text = await self.call_claude(system_prompt, user_prompt)

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
            content={
                "risks": risks,
                "deploy_pct": deploy_pct,
                "disconnected_companies": len(disconnected_companies),
                "rural_isolated": len(rural_isolated),
                "ip_concentration_pct": ip_concentration_pct,
                "low_leverage_funds": len(low_leverage_funds),
            },
        )

        return {"risks_identified": len(risks)}
