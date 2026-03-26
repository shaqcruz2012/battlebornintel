import json
from datetime import date
from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a senior economist and startup ecosystem analyst preparing a weekly intelligence brief
for the Nevada Governor's Office of Economic Development (GOED) and SSBCI fund managers.

Your brief must be data-driven and actionable.  You receive pre-aggregated data sections
and must synthesise them into a single JSON object that matches the schema below EXACTLY.

Use the MIT REAP framework for the "reap_assessment" section:
1. Inputs   — capital flows, new funding, investor activity
2. Capacities — talent, infrastructure, programs, accelerators
3. Outputs  — new companies, products, partnerships, deals closed
4. Impact   — jobs, economic growth, ecosystem health metrics

Rules:
- Every claim must be traceable to the data provided.  Do NOT fabricate companies, numbers, or URLs.
- If a section has no data, return an empty array or a brief "No activity this period." summary.
- Return ONLY the JSON object — no markdown fences, no preamble.

Required JSON schema:
{
  "week_ending": "YYYY-MM-DD",
  "headline": "<compelling headline, under 80 chars>",
  "key_metrics": {
    "total_companies": N,
    "total_funding_m": N,
    "avg_momentum": N,
    "ssbci_deployed_pct": N,
    "new_edges_this_week": N,
    "verified_events_this_week": N
  },
  "top_movers": [
    {"name": "...", "momentum_delta": N, "trigger": "..."}
  ],
  "recent_events": [
    {"date": "...", "type": "...", "company": "...", "detail": "...", "source_url": "..."}
  ],
  "risk_alerts": [
    {"severity": "...", "title": "...", "recommendation": "..."}
  ],
  "ecosystem_pulse": {
    "new_entities": N,
    "new_edges": N,
    "communities": N,
    "bridge_nodes": ["...", "..."]
  },
  "reap_assessment": {
    "inputs": "...",
    "capacities": "...",
    "outputs": "...",
    "impact": "..."
  },
  "action_items": ["...", "..."]
}"""


class WeeklyBrief(BaseAgent):
    """Generates weekly intelligence briefs for the BBI dashboard."""

    def __init__(self):
        super().__init__("weekly_brief")

    # ── Data gathering helpers ────────────────────────────────────────────

    async def _fetch_company_stats(self, pool):
        """Portfolio-level stats and top movers by momentum."""
        companies = await pool.fetch(
            "SELECT id, name, stage, momentum, funding_m, employees "
            "FROM companies ORDER BY momentum DESC"
        )
        # Previous-week momentum via computed_scores history
        scored = await pool.fetch(
            """SELECT cs.company_id, cs.irs_score, c.name, c.momentum
               FROM computed_scores cs
               JOIN companies c ON c.id = cs.company_id
               ORDER BY cs.irs_score DESC NULLS LAST
               LIMIT 10"""
        )
        return companies, scored

    async def _fetch_fund_stats(self, pool):
        """SSBCI deployment tracking."""
        return await pool.fetch("SELECT * FROM funds")

    async def _fetch_verified_events(self, pool):
        """Verified events from the consolidated events table (last 7 days)."""
        return await pool.fetch(
            """SELECT event_date, event_type, company_name, description,
                      source_url, amount_m
               FROM events
               WHERE verified = TRUE
                 AND event_date >= CURRENT_DATE - INTERVAL '7 days'
               ORDER BY event_date DESC
               LIMIT 25"""
        )

    async def _fetch_graph_pulse(self, pool):
        """Community stats, bridge nodes, and recent edge activity."""
        # New edges created this week
        new_edges_row = await pool.fetchrow(
            """SELECT COUNT(*) AS cnt FROM graph_edges
               WHERE created_at >= NOW() - INTERVAL '7 days'"""
        )
        new_edges = new_edges_row["cnt"] if new_edges_row else 0

        # Community count from graph_metrics_cache
        community_row = await pool.fetchrow(
            """SELECT COUNT(DISTINCT community_id) AS cnt
               FROM graph_metrics_cache
               WHERE community_id IS NOT NULL"""
        )
        communities = community_row["cnt"] if community_row else 0

        # Bridge nodes = highest betweenness centrality
        bridge_rows = await pool.fetch(
            """SELECT gmc.node_id, er.label
               FROM graph_metrics_cache gmc
               LEFT JOIN entity_registry er ON er.canonical_id = gmc.node_id
               WHERE gmc.betweenness IS NOT NULL
               ORDER BY gmc.betweenness DESC
               LIMIT 5"""
        )
        bridge_nodes = [
            r["label"] or r["node_id"] for r in bridge_rows
        ]

        return {
            "new_edges": new_edges,
            "communities": communities,
            "bridge_nodes": bridge_nodes,
        }

    async def _fetch_entity_changes(self, pool):
        """Recent entity state history — stage transitions, funding rounds, etc."""
        return await pool.fetch(
            """SELECT esh.canonical_id, er.label, esh.change_type,
                      esh.property_name, esh.old_value, esh.new_value,
                      esh.changed_at
               FROM entity_state_history esh
               LEFT JOIN entity_registry er ON er.canonical_id = esh.canonical_id
               WHERE esh.changed_at >= NOW() - INTERVAL '7 days'
                 AND esh.change_type != 'created'
               ORDER BY esh.changed_at DESC
               LIMIT 20"""
        )

    async def _fetch_new_entities(self, pool):
        """Count of entities registered in the last 7 days."""
        row = await pool.fetchrow(
            """SELECT COUNT(*) AS cnt FROM entity_registry
               WHERE created_at >= NOW() - INTERVAL '7 days'"""
        )
        return row["cnt"] if row else 0

    async def _fetch_risk_signals(self, pool):
        """Identify risk conditions from current data."""
        # Momentum decay candidates
        decay_rows = await pool.fetch(
            """SELECT c.id, c.name, c.momentum, cs.irs_score,
                      LAG(cs.irs_score) OVER (
                          PARTITION BY cs.company_id
                          ORDER BY cs.computed_at
                      ) AS prev_irs
               FROM computed_scores cs
               JOIN companies c ON c.id = cs.company_id
               ORDER BY cs.computed_at DESC"""
        )
        signals = []
        seen = set()
        for r in decay_rows:
            if r["id"] in seen:
                continue
            seen.add(r["id"])
            if r["prev_irs"] is not None and r["irs_score"] is not None:
                delta = r["irs_score"] - r["prev_irs"]
                if delta <= -10:
                    severity = (
                        "critical" if delta <= -20
                        else "high" if delta <= -15
                        else "medium"
                    )
                    signals.append({
                        "severity": severity,
                        "title": f"Momentum Decay: {r['name']}",
                        "recommendation": (
                            f"IRS score declined {abs(delta)} pts "
                            f"({r['prev_irs']} -> {r['irs_score']}). "
                            f"Review recent activity for {r['name']}."
                        ),
                    })

        # SSBCI deployment pace risk
        funds = await pool.fetch(
            "SELECT * FROM funds WHERE fund_type = 'SSBCI'"
        )
        total_alloc = sum(
            float(f["allocated_m"]) for f in funds if f["allocated_m"]
        )
        total_deployed = sum(float(f["deployed_m"]) for f in funds)
        if total_alloc > 0:
            pct = total_deployed / total_alloc * 100
            if pct < 40:
                signals.append({
                    "severity": "high",
                    "title": "SSBCI Deployment Behind Pace",
                    "recommendation": (
                        f"Only {pct:.0f}% of SSBCI capital deployed "
                        f"(${total_deployed:.1f}M of ${total_alloc:.0f}M). "
                        "Accelerate deal pipeline review."
                    ),
                })

        return signals[:10]

    async def _fetch_rotation_stats(self, pool):
        """How many entities were queried by agents this week."""
        row = await pool.fetchrow(
            """SELECT COUNT(DISTINCT canonical_id) AS cnt
               FROM agent_search_log
               WHERE searched_at >= NOW() - INTERVAL '7 days'"""
        )
        return row["cnt"] if row else 0

    # ── Main run ──────────────────────────────────────────────────────────

    async def run(self, pool):
        # Gather all data
        companies, scored = await self._fetch_company_stats(pool)
        funds = await self._fetch_fund_stats(pool)
        verified_events = await self._fetch_verified_events(pool)
        graph_pulse = await self._fetch_graph_pulse(pool)
        entity_changes = await self._fetch_entity_changes(pool)
        new_entity_count = await self._fetch_new_entities(pool)
        risk_signals = await self._fetch_risk_signals(pool)
        rotation_count = await self._fetch_rotation_stats(pool)

        # Build summary stats
        total_funding = sum(float(c["funding_m"]) for c in companies)
        total_employees = sum(c["employees"] for c in companies)
        avg_momentum = (
            sum(c["momentum"] for c in companies) / len(companies)
            if companies else 0
        )

        ssbci_funds = [f for f in funds if f["fund_type"] == "SSBCI"]
        ssbci_deployed = sum(float(f["deployed_m"]) for f in ssbci_funds)
        ssbci_allocated = sum(
            float(f["allocated_m"]) for f in ssbci_funds if f["allocated_m"]
        )
        deploy_pct = (
            round(ssbci_deployed / ssbci_allocated * 100)
            if ssbci_allocated else 0
        )

        # Format top movers
        top_movers_text = "\n".join(
            f"- {c['name']} | momentum={c['momentum']} | "
            f"stage={c['stage']} | funding=${float(c['funding_m']):.1f}M"
            for c in companies[:8]
        )

        # Format top IRS-scored
        top_scored_text = "\n".join(
            f"- {s['name']} (IRS: {s['irs_score']}, momentum: {s['momentum']})"
            for s in scored[:5]
        )

        # Format verified events
        events_text = "\n".join(
            f"- {e['event_date']}: [{e['event_type']}] "
            f"{e['company_name'] or 'N/A'} - {e['description']}"
            + (f" (${float(e['amount_m']):.1f}M)" if e["amount_m"] else "")
            + (f" [source: {e['source_url']}]" if e["source_url"] else "")
            for e in verified_events
        ) or "No verified events this week."

        # Format entity state changes
        changes_text = "\n".join(
            f"- {r['label'] or r['canonical_id']}: "
            f"{r['change_type']} on {r['property_name'] or 'N/A'} "
            f"({r['old_value']} -> {r['new_value']}) at {r['changed_at']}"
            for r in entity_changes
        ) or "No entity state changes this week."

        # Format risk signals
        risk_text = "\n".join(
            f"- [{s['severity'].upper()}] {s['title']}: {s['recommendation']}"
            for s in risk_signals
        ) or "No risk signals this week."

        # Format graph pulse
        bridge_text = ", ".join(
            graph_pulse["bridge_nodes"][:5]
        ) or "None identified"

        today_str = date.today().isoformat()

        user_prompt = f"""Generate a weekly intelligence brief for Nevada's startup ecosystem.
Week ending: {today_str}

-------------------------------------------------------------------
PORTFOLIO STATS
-------------------------------------------------------------------
- Total companies tracked: {len(companies)}
- Total funding: ${total_funding:.1f}M
- Total employees: {total_employees:,}
- Average momentum score: {avg_momentum:.0f}/100
- SSBCI deployment: ${ssbci_deployed:.1f}M of ${ssbci_allocated:.0f}M ({deploy_pct}%)

-------------------------------------------------------------------
TOP MOMENTUM COMPANIES
-------------------------------------------------------------------
{top_movers_text}

-------------------------------------------------------------------
TOP IRS-SCORED COMPANIES
-------------------------------------------------------------------
{top_scored_text}

-------------------------------------------------------------------
VERIFIED EVENTS (LAST 7 DAYS)
-------------------------------------------------------------------
{events_text}

-------------------------------------------------------------------
ENTITY STATE CHANGES (LAST 7 DAYS)
-------------------------------------------------------------------
{changes_text}

-------------------------------------------------------------------
RISK SIGNALS
-------------------------------------------------------------------
{risk_text}

-------------------------------------------------------------------
ECOSYSTEM GRAPH PULSE
-------------------------------------------------------------------
- New entities this week: {new_entity_count}
- New edges this week: {graph_pulse['new_edges']}
- Active communities: {graph_pulse['communities']}
- Top bridge nodes: {bridge_text}
- Entities queried by agents this week: {rotation_count}

-------------------------------------------------------------------
INSTRUCTIONS
-------------------------------------------------------------------
Produce a JSON object matching the required schema from the system prompt.
For "top_movers", infer momentum_delta from the data and identify the trigger (stage, funding round, event).
For "risk_alerts", include all signals above plus any you infer from the data.
For "reap_assessment", write 1-2 sentences per dimension grounded in the data.
For "action_items", give 3-5 specific, actionable recommendations for GOED/fund managers.

Populate key_metrics with:
- total_companies: {len(companies)}
- total_funding_m: {total_funding:.1f}
- avg_momentum: {avg_momentum:.0f}
- ssbci_deployed_pct: {deploy_pct}
- new_edges_this_week: {graph_pulse['new_edges']}
- verified_events_this_week: {len(verified_events)}

Return ONLY the JSON object."""

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
