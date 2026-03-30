import logging

from .base_agent import BaseAgent
from .utils import extract_json, load_prompt, fetch_structural_gaps, fetch_policy_opportunities

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT_FALLBACK = """You are a graph analytics expert analyzing Nevada's startup ecosystem network.
Identify structural patterns, emerging clusters, bridge companies, and temporal changes.
Use the structural hole and connectivity gap data to highlight ecosystem weaknesses.
Be specific with company names and metrics. Output valid JSON."""


class PatternDetector(BaseAgent):
    """Analyzes graph structure for patterns, clusters, and anomalies."""

    def __init__(self):
        super().__init__("pattern_detector")

    async def run(self, pool):
        # Fetch graph metrics
        metrics = await pool.fetch(
            """SELECT gmc.*, c.name as company_name, c.funding_m, c.momentum
               FROM graph_metrics_cache gmc
               LEFT JOIN companies c ON c.id = CAST(
                 CASE WHEN gmc.node_id LIKE 'c_%'
                      THEN SUBSTRING(gmc.node_id FROM 3)
                      ELSE NULL END AS INTEGER)
               WHERE gmc.computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)"""
        )

        if not metrics:
            await self.save_analysis(
                pool,
                analysis_type="pattern_detection",
                content={"raw_analysis": "No graph metrics available for analysis."},
            )
            return {"bridges": 0, "hubs": 0, "communities": 0}

        # Use data-driven thresholds (75th percentile) instead of hardcoded values
        betweenness_vals = [float(m["betweenness"]) for m in metrics if m["betweenness"]]
        pagerank_vals = [float(m["pagerank"]) for m in metrics if m["pagerank"]]

        bridge_threshold = sorted(betweenness_vals)[min(int(len(betweenness_vals) * 0.75), len(betweenness_vals) - 1)] if betweenness_vals else 60
        hub_threshold = sorted(pagerank_vals)[min(int(len(pagerank_vals) * 0.75), len(pagerank_vals) - 1)] if pagerank_vals else 50

        bridges = [m for m in metrics if m["betweenness"] and float(m["betweenness"]) > bridge_threshold]
        hubs = [m for m in metrics if m["pagerank"] and float(m["pagerank"]) > hub_threshold]

        # Community analysis
        communities = {}
        for m in metrics:
            cid = m["community_id"]
            if cid is not None:
                communities.setdefault(cid, []).append({
                    "node_id": m["node_id"],
                    "name": m["company_name"],
                    "pagerank": m["pagerank"],
                })

        community_summary = []
        for cid, members in sorted(communities.items(), key=lambda x: -len(x[1])):
            named = [m for m in members if m["name"]]
            community_summary.append({
                "community_id": cid,
                "size": len(members),
                "top_members": [m["name"] for m in sorted(named, key=lambda x: -(x["pagerank"] or 0))[:5]],
            })

        # Fetch structural hole data from metric_snapshots
        structural_holes_text = ""
        holes = await fetch_structural_gaps(pool, limit=15)
        if holes:
            disconnected = sum(1 for h in holes if h["metric_name"] == "accelerator_connectivity_gap")
            rural = sum(1 for h in holes if h["metric_name"] == "rural_isolation_flag")
            structural_holes_text = f"""

STRUCTURAL GAPS (from T-GNN analysis):
- Companies without accelerator connections: {disconnected}
- Rural-isolated companies: {rural}
- Top structural holes: {', '.join(f"{h['entity_id']}({h['metric_name']}={h['value']})" for h in holes[:5])}"""

        # Fetch policy opportunity context
        policy_text = ""
        policies = await fetch_policy_opportunities(pool, limit=3)
        if policies:
            policy_text = f"""

POLICY OPPORTUNITIES:
{chr(10).join(f"- {p['entity_id']}: score {float(p['value']):.1f}" for p in policies)}"""

        user_prompt = f"""Analyze these graph structure patterns in Nevada's startup ecosystem:

BRIDGE NODES (top 25% betweenness, threshold={bridge_threshold:.1f}):
{chr(10).join(f"- {b['node_id']}: {b['company_name'] or 'non-company'} (betweenness: {b['betweenness']}, PR: {b['pagerank']})" for b in bridges[:10])}

HUB NODES (top 25% PageRank, threshold={hub_threshold:.1f}):
{chr(10).join(f"- {h['node_id']}: {h['company_name'] or 'non-company'} (PR: {h['pagerank']}, betweenness: {h['betweenness']})" for h in hubs[:10])}

COMMUNITY CLUSTERS ({len(community_summary)} detected):
{chr(10).join(f"- Cluster {cs['community_id']}: {cs['size']} members, top: {', '.join(cs['top_members'][:3])}" for cs in community_summary[:8])}

Total nodes analyzed: {len(metrics)}
{structural_holes_text}{policy_text}

Return JSON with:
- "patterns": array of identified structural patterns
- "emerging_clusters": notable cluster developments
- "bridge_analysis": significance of key bridge nodes
- "structural_gaps": identified ecosystem connectivity weaknesses
- "anomalies": unexpected structural features
- "recommendations": 2-3 ecosystem development suggestions based on structure"""

        system_prompt = load_prompt("pattern_detector") or _SYSTEM_PROMPT_FALLBACK
        response_text = await self.call_claude(system_prompt, user_prompt)

        content = extract_json(response_text)
        if content is None:
            content = {"raw_analysis": response_text}

        await self.save_analysis(
            pool,
            analysis_type="pattern_detection",
            content=content,
        )

        return {
            "bridges": len(bridges),
            "hubs": len(hubs),
            "communities": len(community_summary),
        }
