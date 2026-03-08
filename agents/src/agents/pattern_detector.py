import json
from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a graph analytics expert analyzing Nevada's startup ecosystem network.
Identify structural patterns, emerging clusters, bridge companies, and temporal changes.
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

        # Identify structural patterns
        bridges = [m for m in metrics if m["betweenness"] and m["betweenness"] > 60]
        hubs = [m for m in metrics if m["pagerank"] and m["pagerank"] > 50]

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

        user_prompt = f"""Analyze these graph structure patterns in Nevada's startup ecosystem:

BRIDGE NODES (high betweenness centrality, >60):
{chr(10).join(f"- {b['node_id']}: {b['company_name'] or 'non-company'} (betweenness: {b['betweenness']}, PR: {b['pagerank']})" for b in bridges[:10])}

HUB NODES (high PageRank, >50):
{chr(10).join(f"- {h['node_id']}: {h['company_name'] or 'non-company'} (PR: {h['pagerank']}, betweenness: {h['betweenness']})" for h in hubs[:10])}

COMMUNITY CLUSTERS ({len(community_summary)} detected):
{chr(10).join(f"- Cluster {cs['community_id']}: {cs['size']} members, top: {', '.join(cs['top_members'][:3])}" for cs in community_summary[:8])}

Total nodes analyzed: {len(metrics)}

Return JSON with:
- "patterns": array of identified structural patterns
- "emerging_clusters": notable cluster developments
- "bridge_analysis": significance of key bridge nodes
- "anomalies": unexpected structural features
- "recommendations": 2-3 ecosystem development suggestions based on structure"""

        response_text = self.call_claude(SYSTEM_PROMPT, user_prompt)

        try:
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            content = json.loads(response_text[start:end])
        except (json.JSONDecodeError, ValueError):
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
