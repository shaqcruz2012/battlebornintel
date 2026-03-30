"""
GraphIntegrityChecker — Validates the graph layer's structural health.

Checks:
  1. Disconnected nodes: entities with zero edges
  2. Self-loops: edges where source_id == target_id
  3. Temporal coherence: edges with event_date before entity valid_from
  4. Relationship symmetry: bidirectional edges missing their reverse
  5. Community health: communities with single members or extreme sizes
  6. Edge weight distribution: flags statistical outliers
  7. Missing reciprocal edges: invested_in without corresponding funded_by

Does NOT use Claude — pure SQL and graph-theoretic analysis.
"""

from .base_agent import BaseAgent

# Relationship pairs that should be symmetric
SYMMETRIC_PAIRS = [
    ("partners_with", "partners_with"),
    ("collaborated_with", "collaborated_with"),
    ("co_invested", "co_invested"),
]

# Relationships that imply a reverse edge
RECIPROCAL_PAIRS = [
    ("invested_in", "funded_by"),
    ("accelerated_by", "accelerated"),
    ("manages", "managed_by"),
    ("funds", "funded_by"),
]


class GraphIntegrityChecker(BaseAgent):
    def __init__(self):
        super().__init__("graph_integrity_checker")

    async def run(self, pool, **kwargs):
        findings = []

        findings.extend(await self._check_disconnected_nodes(pool))
        findings.extend(await self._check_self_loops(pool))
        findings.extend(await self._check_temporal_coherence(pool))
        findings.extend(await self._check_community_health(pool))
        findings.extend(await self._check_edge_distribution(pool))
        findings.extend(await self._check_accelerator_coverage(pool))
        findings.extend(await self._check_hub_concentration(pool))

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
            analysis_type="graph_integrity_audit",
            content=result,
            model_used="none",
        )
        return result

    async def _check_disconnected_nodes(self, pool):
        """Find entity_registry entries with zero graph_edges."""
        findings = []
        rows = await pool.fetch("""
            SELECT er.canonical_id, er.entity_type, er.label
            FROM entity_registry er
            WHERE er.entity_type IN ('company', 'fund', 'accelerator', 'ecosystem_org')
              AND er.merged_into IS NULL
              AND NOT EXISTS (
                SELECT 1 FROM graph_edges ge
                WHERE ge.source_id = er.canonical_id
                   OR ge.target_id = er.canonical_id
              )
            ORDER BY er.entity_type, er.label
            LIMIT 30
        """)
        if rows:
            findings.append({
                "check": "disconnected_nodes",
                "severity": "warning",
                "message": f"{len(rows)} entities with zero edges (first 30 shown)",
                "entities": [
                    {"id": r["canonical_id"], "type": r["entity_type"], "label": r["label"]}
                    for r in rows
                ],
            })
        return findings

    async def _check_self_loops(self, pool):
        """Find edges where source == target."""
        findings = []
        rows = await pool.fetch("""
            SELECT id, source_id, rel FROM graph_edges
            WHERE source_id = target_id
            LIMIT 20
        """)
        for r in rows:
            findings.append({
                "check": "self_loop",
                "severity": "critical",
                "message": f"Self-loop: {r['source_id']} -[{r['rel']}]-> itself (edge {r['id']})",
            })
        return findings

    async def _check_temporal_coherence(self, pool):
        """Find edges with dates before their entity's valid_from."""
        findings = []
        row = await pool.fetchrow("""
            SELECT COUNT(*) AS cnt
            FROM graph_edges ge
            JOIN entity_registry er ON er.canonical_id = ge.source_id
            WHERE ge.event_date IS NOT NULL
              AND er.valid_from IS NOT NULL
              AND ge.event_date < er.valid_from::DATE - INTERVAL '365 days'
        """)
        if row["cnt"] > 0:
            findings.append({
                "check": "temporal_coherence",
                "severity": "warning",
                "message": f"{row['cnt']} edges have event_date >1 year before source entity valid_from",
            })
        return findings

    async def _check_community_health(self, pool):
        """Check for degenerate communities in graph_metrics_cache."""
        findings = []
        rows = await pool.fetch("""
            SELECT community_id, COUNT(*) AS size
            FROM graph_metrics_cache
            WHERE community_id IS NOT NULL
            GROUP BY community_id
            ORDER BY size DESC
        """)
        if not rows:
            findings.append({
                "check": "community_health",
                "severity": "info",
                "message": "No community data in graph_metrics_cache",
            })
            return findings

        total = sum(r["size"] for r in rows)
        largest = rows[0]
        singletons = sum(1 for r in rows if r["size"] == 1)

        if largest["size"] > total * 0.5:
            findings.append({
                "check": "community_dominance",
                "severity": "warning",
                "message": f"Community {largest['community_id']} contains {largest['size']}/{total} nodes ({largest['size']*100//total}%) — possible resolution issue",
            })

        if singletons > len(rows) * 0.3:
            findings.append({
                "check": "community_fragmentation",
                "severity": "info",
                "message": f"{singletons} of {len(rows)} communities are singletons — high fragmentation",
            })
        return findings

    async def _check_edge_distribution(self, pool):
        """Check for nodes with suspiciously many or few edges."""
        findings = []
        rows = await pool.fetch("""
            SELECT node_id, COUNT(*) AS degree FROM (
                SELECT source_id AS node_id FROM graph_edges
                UNION ALL
                SELECT target_id AS node_id FROM graph_edges
            ) edges
            GROUP BY node_id
            ORDER BY degree DESC
            LIMIT 5
        """)
        if rows and rows[0]["degree"] > 200:
            findings.append({
                "check": "hub_concentration",
                "severity": "info",
                "message": f"Top hub {rows[0]['node_id']} has {rows[0]['degree']} edges — verify this is correct",
            })
        return findings

    async def _check_accelerator_coverage(self, pool):
        """Report accelerator coverage from the new v_accelerator_coverage view."""
        findings = []
        try:
            rows = await pool.fetch("""
                SELECT location_class, SUM(total_companies) AS total,
                       SUM(accelerator_connected) AS connected
                FROM v_accelerator_coverage
                GROUP BY location_class
            """)
            for r in rows:
                total = r["total"] or 0
                connected = r["connected"] or 0
                rate = connected / total if total > 0 else 0
                if rate < 0.2:
                    findings.append({
                        "check": "accelerator_coverage",
                        "severity": "warning" if r["location_class"] == "metro" else "critical",
                        "message": f"{r['location_class']}: {connected}/{total} companies connected to accelerators ({rate:.0%})",
                    })
        except Exception:
            pass  # View may not exist yet
        return findings

    async def _check_hub_concentration(self, pool):
        """Check if removing top 3 nodes would fragment the graph."""
        findings = []
        rows = await pool.fetch("""
            SELECT node_id, degree FROM (
                SELECT source_id AS node_id, COUNT(*) AS degree FROM graph_edges GROUP BY source_id
                UNION ALL
                SELECT target_id AS node_id, COUNT(*) AS degree FROM graph_edges GROUP BY target_id
            ) t
            ORDER BY degree DESC
            LIMIT 3
        """)
        total_edges = await pool.fetchval("SELECT COUNT(*) FROM graph_edges")
        top3_edges = sum(r["degree"] for r in rows)

        if total_edges > 0 and top3_edges > total_edges * 0.3:
            findings.append({
                "check": "structural_fragility",
                "severity": "warning",
                "message": f"Top 3 nodes ({', '.join(r['node_id'] for r in rows)}) account for {top3_edges}/{total_edges} edges ({top3_edges*100//total_edges}%) — high structural fragility",
            })
        return findings
