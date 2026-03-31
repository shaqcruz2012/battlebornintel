"""Feature discovery and auto-fill agent.

Audits entity data completeness, prioritizes gaps by importance,
computes derivable features, and reports remaining gaps for manual research.
"""

import json
import logging
from datetime import date, datetime, timezone

import pandas as pd

from .base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

# Features that can be computed from existing data
COMPUTABLE_FEATURES = {
    "sector_count": "array_length(sectors, 1)",
    "edge_count": "(SELECT COUNT(*) FROM graph_edges WHERE source_id = c.id OR target_id = c.id)",
    "years_active": f"EXTRACT(YEAR FROM CURRENT_DATE) - founded",
    "funding_per_employee": "CASE WHEN employees > 0 THEN funding_m / employees ELSE NULL END",
}

# Core fields every company should have (highest priority)
REQUIRED_FIELDS = ["name", "stage", "sectors", "city", "region", "status"]
# High-value fields (second priority)
HIGH_VALUE_FIELDS = ["funding_m", "employees", "founded", "momentum"]


class FeatureDiscoveryAgent(BaseModelAgent):
    """Discovers missing features, computes derivable ones, reports gaps."""

    name = "feature_discovery"

    def __init__(self):
        super().__init__(agent_name="feature_discovery", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        # 1. Load completeness data and graph importance
        completeness = await self._assess_completeness(pool)
        graph_df = await self.load_graph_features(pool, node_types=["c"])
        priorities = self._prioritize(completeness, graph_df)

        # 2. Compute derivable features
        computed = await self._compute_features(pool)

        # 3. Save computed features to metric_snapshots
        saved_count = await self._save_computed(pool, computed)

        # 4. Build gap report for features needing manual research
        gap_report = self._build_gap_report(priorities)

        # 5. Save analysis summary
        summary = {
            "entities_audited": len(completeness),
            "features_computed": saved_count,
            "gaps_remaining": len(gap_report),
            "top_gaps": gap_report[:20],
            "run_date": datetime.now(timezone.utc).isoformat(),
        }
        await self.save_analysis(pool, "feature_discovery", summary)

        logger.info(
            "Feature discovery complete: %d audited, %d computed, %d gaps",
            len(completeness), saved_count, len(gap_report),
        )
        return summary

    async def _assess_completeness(self, pool) -> list[dict]:
        """Query companies and score each for data completeness."""
        rows = await pool.fetch(
            """SELECT id, name, slug, stage, sectors, employees,
                      funding_m, momentum, founded, city, region, status
               FROM companies
               ORDER BY id"""
        )
        results = []
        all_fields = REQUIRED_FIELDS + HIGH_VALUE_FIELDS
        for r in rows:
            row = dict(r)
            missing = [f for f in all_fields if row.get(f) is None]
            total = len(all_fields)
            filled = total - len(missing)
            row["completeness"] = filled / total if total else 1.0
            row["missing_fields"] = missing
            results.append(row)
        return results

    def _prioritize(self, completeness: list[dict], graph_df: pd.DataFrame) -> list[dict]:
        """Score and rank entities by importance * incompleteness."""
        pagerank_map = {}
        if not graph_df.empty and "pagerank" in graph_df.columns:
            for node_id, pr in graph_df["pagerank"].items():
                # node_id is like "c_123", extract numeric id
                try:
                    eid = int(str(node_id).split("_", 1)[1])
                    pagerank_map[eid] = float(pr) if pd.notna(pr) else 0.0
                except (ValueError, IndexError):
                    pass

        max_pr = max(pagerank_map.values()) if pagerank_map else 1.0
        for entity in completeness:
            pr = pagerank_map.get(entity["id"], 0.0)
            norm_pr = pr / max_pr if max_pr > 0 else 0.0
            incompleteness = 1.0 - entity["completeness"]
            # Required fields missing get a bigger penalty
            req_missing = sum(1 for f in entity["missing_fields"] if f in REQUIRED_FIELDS)
            req_penalty = req_missing / len(REQUIRED_FIELDS) if REQUIRED_FIELDS else 0
            entity["priority_score"] = round(
                (0.4 * norm_pr) + (0.3 * incompleteness) + (0.3 * req_penalty), 4
            )

        completeness.sort(key=lambda e: e["priority_score"], reverse=True)
        return completeness

    async def _compute_features(self, pool) -> list[dict]:
        """Compute derivable features for all companies."""
        rows = await pool.fetch(
            """SELECT c.id,
                      array_length(c.sectors, 1) AS sector_count,
                      (SELECT COUNT(*)::int FROM graph_edges g
                       WHERE g.source_id = c.id OR g.target_id = c.id) AS edge_count,
                      CASE WHEN c.founded IS NOT NULL
                           THEN EXTRACT(YEAR FROM CURRENT_DATE)::int - c.founded
                           ELSE NULL END AS years_active,
                      CASE WHEN c.employees > 0
                           THEN ROUND((c.funding_m / c.employees)::numeric, 4)
                           ELSE NULL END AS funding_per_employee
               FROM companies c"""
        )
        # Also compute graph_centrality_rank from PageRank
        pr_rows = await pool.fetch(
            """SELECT node_id,
                      RANK() OVER (ORDER BY pagerank DESC) AS centrality_rank
               FROM graph_metrics_cache
               WHERE node_id LIKE 'c\\_%'
                 AND computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)"""
        )
        rank_map = {}
        for pr in pr_rows:
            try:
                eid = int(str(pr["node_id"]).split("_", 1)[1])
                rank_map[eid] = int(pr["centrality_rank"])
            except (ValueError, IndexError):
                pass

        computed = []
        feature_names = ["sector_count", "edge_count", "years_active",
                         "funding_per_employee", "graph_centrality_rank"]
        for r in rows:
            cid = r["id"]
            values = {
                "sector_count": r["sector_count"],
                "edge_count": r["edge_count"],
                "years_active": r["years_active"],
                "funding_per_employee": float(r["funding_per_employee"]) if r["funding_per_employee"] is not None else None,
                "graph_centrality_rank": rank_map.get(cid),
            }
            for fname, val in values.items():
                if val is not None:
                    computed.append({
                        "entity_type": "company",
                        "entity_id": str(cid),
                        "metric_name": fname,
                        "value": float(val),
                    })
        return computed

    async def _save_computed(self, pool, computed: list[dict]) -> int:
        """Insert computed features into metric_snapshots."""
        if not computed:
            return 0
        today = date.today()
        async with pool.acquire() as conn:
            async with conn.transaction():
                await conn.executemany(
                    """INSERT INTO metric_snapshots
                       (entity_type, entity_id, metric_name, value, unit,
                        period_start, period_end, granularity, confidence,
                        verified, agent_id)
                       VALUES ($1, $2, $3, $4, 'count', $5, $6, 'monthly',
                               0.95, TRUE, $7)
                       ON CONFLICT DO NOTHING""",
                    [
                        (
                            r["entity_type"], r["entity_id"], r["metric_name"],
                            r["value"], today, today, self.run_id,
                        )
                        for r in computed
                    ],
                )
        logger.info("Saved %d computed features to metric_snapshots", len(computed))
        return len(computed)

    def _build_gap_report(self, priorities: list[dict]) -> list[dict]:
        """Return gaps that cannot be auto-computed and need research."""
        non_computable = set(REQUIRED_FIELDS + HIGH_VALUE_FIELDS) - set(COMPUTABLE_FEATURES.keys())
        gaps = []
        for entity in priorities:
            for field in entity["missing_fields"]:
                if field in non_computable:
                    gaps.append({
                        "entity_id": entity["id"],
                        "entity_name": entity["name"],
                        "missing_field": field,
                        "priority_score": entity["priority_score"],
                        "source": "manual_research",
                    })
        gaps.sort(key=lambda g: g["priority_score"], reverse=True)
        return gaps
