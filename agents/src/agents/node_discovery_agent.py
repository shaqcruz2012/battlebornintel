"""Node Discovery Agent — identifies missing nodes and edges in the knowledge graph."""

import json
import logging
import re

from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a knowledge-graph analyst for Nevada's startup/innovation ecosystem.
Given text snippets from graph edge notes and timeline events, extract entity mentions that
are NOT already tracked as graph nodes. For each entity, return JSON (no markdown fences):
{
  "entities": [
    {"name": "...", "type": "person|company|fund|program|accelerator|external",
     "evidence": "quote or summary", "confidence": 0.0-1.0}
  ],
  "edges": [
    {"source_name": "...", "target_name": "...", "rel": "...",
     "evidence": "quote or summary", "confidence": 0.0-1.0}
  ]
}
Only include entities you are reasonably sure exist based on the text. Use the established
node types: company, fund, person, program, accelerator, external.
Return valid JSON only."""


class NodeDiscoveryAgent(BaseAgent):
    """Discover missing nodes and edges from text analysis of the graph."""

    name = "node_discovery"

    def __init__(self):
        super().__init__(self.name)

    async def run(self, pool, **kwargs):
        orphans = await self._find_orphans(pool)
        missing_intermediaries = await self._find_missing_intermediaries(pool)
        text_snippets = await self._collect_text_snippets(pool)
        existing_names = await self._get_existing_node_names(pool)

        # Use Claude to extract implied entities from text
        extracted = await self._extract_entities(text_snippets, existing_names)

        # Build discovery report
        report = {
            "orphan_nodes": orphans,
            "missing_intermediaries": missing_intermediaries,
            "discovered_entities": extracted.get("entities", []),
            "discovered_edges": extracted.get("edges", []),
            "summary": {
                "orphan_count": len(orphans),
                "intermediary_gaps": len(missing_intermediaries),
                "new_entities": len(extracted.get("entities", [])),
                "new_edges": len(extracted.get("edges", [])),
            },
        }

        # Rank discoveries by confidence and potential impact
        report["priority_ranked"] = self._rank_discoveries(report)

        await self.save_analysis(
            pool,
            analysis_type="node_discovery",
            content=report,
            entity_type="ecosystem",
            entity_id="e_nv",
        )

        logger.info(
            "Node discovery complete: %d orphans, %d intermediary gaps, "
            "%d new entities, %d new edges",
            report["summary"]["orphan_count"],
            report["summary"]["intermediary_gaps"],
            report["summary"]["new_entities"],
            report["summary"]["new_edges"],
        )
        return report

    async def _find_orphans(self, pool):
        """Find nodes with only 1 connection (likely missing edges)."""
        rows = await pool.fetch("""
            WITH node_degrees AS (
                SELECT node_id, COUNT(*) AS degree FROM (
                    SELECT source_id AS node_id FROM graph_edges
                    UNION ALL
                    SELECT target_id AS node_id FROM graph_edges
                ) sub
                GROUP BY node_id
            )
            SELECT node_id, degree
            FROM node_degrees
            WHERE degree = 1
            ORDER BY node_id
            LIMIT 50
        """)
        return [{"node_id": r["node_id"], "degree": r["degree"]} for r in rows]

    async def _find_missing_intermediaries(self, pool):
        """Find company pairs in the same sector/region with no shared connections."""
        rows = await pool.fetch("""
            WITH company_pairs AS (
                SELECT a.id AS c1, b.id AS c2, a.region, a.sectors[1] AS sector
                FROM companies a
                JOIN companies b ON a.id < b.id
                    AND a.region = b.region
                    AND a.sectors && b.sectors
                WHERE a.status = 'active' AND b.status = 'active'
            )
            SELECT cp.c1, cp.c2, cp.region, cp.sector
            FROM company_pairs cp
            WHERE NOT EXISTS (
                SELECT 1 FROM graph_edges e1
                JOIN graph_edges e2 ON (
                    (e1.target_id = e2.target_id OR e1.target_id = e2.source_id)
                    AND e1.source_id != e2.source_id
                    AND e1.source_id != e2.target_id
                )
                WHERE e1.source_id = 'c_' || cp.c1
                  AND (e2.source_id = 'c_' || cp.c2 OR e2.target_id = 'c_' || cp.c2)
            )
            LIMIT 30
        """)
        return [
            {"company_1": r["c1"], "company_2": r["c2"],
             "region": r["region"], "sector": r["sector"]}
            for r in rows
        ]

    async def _collect_text_snippets(self, pool):
        """Gather text fields that may mention untracked entities."""
        edge_notes = await pool.fetch("""
            SELECT source_id, target_id, rel, note
            FROM graph_edges
            WHERE note IS NOT NULL AND note != ''
            LIMIT 200
        """)
        timeline = await pool.fetch("""
            SELECT entity_type, entity_id, event_type, detail
            FROM timeline_events
            WHERE detail IS NOT NULL AND detail != ''
            ORDER BY event_date DESC
            LIMIT 200
        """)
        snippets = []
        for r in edge_notes:
            snippets.append(
                f"[edge {r['source_id']}->{r['target_id']} ({r['rel']})]: {r['note']}"
            )
        for r in timeline:
            snippets.append(
                f"[event {r['entity_type']}/{r['entity_id']} ({r['event_type']})]: {r['detail']}"
            )
        return snippets

    async def _get_existing_node_names(self, pool):
        """Get all known node names for dedup."""
        names = set()
        for table, col in [
            ("companies", "name"), ("funds", "name"), ("programs", "name"),
            ("universities", "name"), ("regions", "name"),
        ]:
            try:
                rows = await pool.fetch(f"SELECT {col} FROM {table}")
                names.update(r[col].lower() for r in rows if r[col])
            except Exception:
                pass
        # Also pull person names from graph nodes with p_ prefix
        rows = await pool.fetch("""
            SELECT DISTINCT source_id FROM graph_edges WHERE source_id LIKE 'p_%'
            UNION
            SELECT DISTINCT target_id FROM graph_edges WHERE target_id LIKE 'p_%'
        """)
        names.update(r["source_id"] for r in rows)
        return names

    async def _extract_entities(self, snippets, existing_names):
        """Use Claude to find entity mentions not in the graph."""
        if not snippets:
            return {"entities": [], "edges": []}

        # Batch snippets to fit context
        batch_text = "\n".join(snippets[:150])
        existing_list = ", ".join(sorted(list(existing_names))[:200])

        user_prompt = (
            f"Known entities (already tracked):\n{existing_list}\n\n"
            f"Text snippets from graph edges and timeline events:\n{batch_text}\n\n"
            "Extract entities mentioned in the text that are NOT in the known list. "
            "Also suggest edges between discovered and existing entities."
        )

        raw = self.call_claude(SYSTEM_PROMPT, user_prompt, max_tokens=4096)

        # Parse JSON from response
        try:
            # Strip markdown fences if present
            cleaned = re.sub(r"```json?\s*", "", raw)
            cleaned = re.sub(r"```", "", cleaned).strip()
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("Failed to parse Claude response as JSON")
            return {"entities": [], "edges": [], "raw_response": raw[:500]}

    def _rank_discoveries(self, report):
        """Rank all discoveries by confidence and potential graph impact."""
        ranked = []
        for ent in report.get("discovered_entities", []):
            ranked.append({
                "type": "new_node",
                "name": ent.get("name"),
                "node_type": ent.get("type"),
                "confidence": ent.get("confidence", 0.5),
                "evidence": ent.get("evidence"),
            })
        for edge in report.get("discovered_edges", []):
            ranked.append({
                "type": "new_edge",
                "source": edge.get("source_name"),
                "target": edge.get("target_name"),
                "rel": edge.get("rel"),
                "confidence": edge.get("confidence", 0.5),
                "evidence": edge.get("evidence"),
            })
        for orphan in report.get("orphan_nodes", []):
            ranked.append({
                "type": "orphan",
                "node_id": orphan["node_id"],
                "confidence": 1.0,
                "evidence": "Single connection in graph",
            })
        ranked.sort(key=lambda x: x.get("confidence", 0), reverse=True)
        return ranked
