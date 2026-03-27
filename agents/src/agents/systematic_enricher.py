"""SystematicEnricher agent — methodically fills data gaps across nodes and edges."""

import json
from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a data enrichment analyst for the Nevada startup ecosystem.
Given an entity with missing fields, fill in verifiable data based on your knowledge.

CRITICAL RULES:
- Only provide data you are confident about
- Every fact must be verifiable from public sources
- Set confidence appropriately (0.9+ only for well-known facts)
- If you don't know, say so — do not guess
- Output valid JSON"""

ENRICH_NODE_TOOL = {
    "name": "enrich_entity",
    "description": "Fill missing data fields for an entity",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City location"},
            "region": {"type": "string", "enum": ["las_vegas", "reno", "henderson", "rural", "other"]},
            "founded": {"type": "integer", "description": "Year founded"},
            "description": {"type": "string", "description": "One-line description"},
            "website": {"type": "string", "description": "Official website URL"},
            "sectors": {"type": "array", "items": {"type": "string"}},
            "stage": {
                "type": "string",
                "enum": ["pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth", "public"],
            },
            "employee_estimate": {"type": "integer"},
            "funding_estimate_m": {"type": "number"},
            "confidence": {"type": "number", "description": "Confidence in the enrichment 0.0-1.0"},
            "source_url": {"type": "string", "description": "URL that verifies this data"},
            "skipped_fields": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Fields you could not fill",
            },
        },
        "required": ["confidence"],
    },
}

ENRICH_EDGE_TOOL = {
    "name": "enrich_edge",
    "description": "Fill missing data for a graph relationship",
    "input_schema": {
        "type": "object",
        "properties": {
            "note": {"type": "string", "description": "Descriptive note about the relationship"},
            "event_year": {"type": "integer", "description": "Year the relationship was established"},
            "event_date": {"type": "string", "description": "ISO date YYYY-MM-DD if known"},
            "source_url": {"type": "string", "description": "URL that verifies this relationship"},
            "confidence": {"type": "number"},
            "skipped_fields": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["confidence"],
    },
}


class SystematicEnricher(BaseAgent):
    """Methodically fills gaps in node and edge data."""

    def __init__(self):
        super().__init__("systematic_enricher")

    async def run(self, pool, mode: str = "both", limit: int = 25):
        results = {
            "nodes_checked": 0,
            "nodes_enriched": 0,
            "edges_checked": 0,
            "edges_enriched": 0,
            "fields_filled": 0,
        }

        if mode in ("nodes", "both"):
            node_results = await self._enrich_nodes(pool, limit)
            results["nodes_checked"] = node_results["checked"]
            results["nodes_enriched"] = node_results["enriched"]
            results["fields_filled"] += node_results["fields_filled"]

        if mode in ("edges", "both"):
            edge_results = await self._enrich_edges(pool, limit)
            results["edges_checked"] = edge_results["checked"]
            results["edges_enriched"] = edge_results["enriched"]
            results["fields_filled"] += edge_results["fields_filled"]

        return results

    async def _enrich_nodes(self, pool, limit):
        """Find and fill gaps in entity data."""
        rows = await pool.fetch(
            """SELECT er.canonical_id, er.entity_type, er.label, er.confidence,
                      er.source_table, er.source_table_id,
                      c.description, c.city, c.region, c.stage, c.sectors,
                      c.funding_m, c.employees, c.founded,
                      e.note AS ext_note, e.entity_type AS ext_type
               FROM entity_registry er
               LEFT JOIN companies c
                 ON er.source_table = 'companies'
                 AND er.source_table_id = c.id::text
               LEFT JOIN externals e
                 ON er.source_table = 'externals'
                 AND er.source_table_id = e.id
               WHERE er.merged_into IS NULL
               AND er.entity_type IN ('company', 'external', 'accelerator')
               AND (
                 (er.source_table = 'companies'
                  AND (c.description IS NULL OR c.description = ''
                       OR c.founded IS NULL))
                 OR (er.source_table = 'externals'
                     AND (e.note IS NULL OR e.note = ''))
                 OR er.confidence IS NULL
                 OR er.confidence < 0.5
               )
               ORDER BY
                 CASE WHEN er.entity_type = 'company' THEN 0 ELSE 1 END,
                 er.confidence ASC NULLS FIRST
               LIMIT $1""",
            limit,
        )

        checked = 0
        enriched = 0
        fields_filled = 0

        for row in rows:
            checked += 1
            r = dict(row)
            canonical_id = r["canonical_id"]
            label = r["label"]
            entity_type = r["entity_type"]

            # Build gap description
            missing = []
            if r.get("source_table") == "companies":
                if not r.get("description"):
                    missing.append("description")
                if not r.get("founded"):
                    missing.append("founded year")
                if not r.get("sectors") or len(r.get("sectors", [])) == 0:
                    missing.append("sectors")
                if not r.get("city"):
                    missing.append("city")
            elif r.get("source_table") == "externals":
                if not r.get("ext_note"):
                    missing.append("note/description")

            if not missing:
                continue

            prompt = (
                f"Enrich this Nevada ecosystem entity with missing data:\n\n"
                f"Name: {label}\n"
                f"Type: {entity_type}\n"
                f"Current data: {json.dumps({k: v for k, v in r.items() if v is not None and k not in ('canonical_id', 'source_table', 'source_table_id')}, default=str)}\n\n"
                f"Missing fields: {', '.join(missing)}\n\n"
                f"Fill in what you can verify. Leave skipped_fields for anything uncertain."
            )

            try:
                response = self.call_claude_with_tools(
                    SYSTEM_PROMPT, prompt, tools=[ENRICH_NODE_TOOL]
                )

                for block in response.content:
                    if block.type == "tool_use" and block.name == "enrich_entity":
                        data = block.input
                        if data.get("confidence", 0) < 0.4:
                            continue

                        updates = []
                        params = []
                        idx = 1

                        # Update companies table
                        if r.get("source_table") == "companies":
                            company_id = int(r["source_table_id"])
                            if data.get("description") and not r.get("description"):
                                updates.append(f"description = ${idx}")
                                params.append(data["description"])
                                idx += 1
                                fields_filled += 1
                            if data.get("founded") and not r.get("founded"):
                                updates.append(f"founded = ${idx}")
                                params.append(data["founded"])
                                idx += 1
                                fields_filled += 1
                            if data.get("city") and not r.get("city"):
                                updates.append(f"city = ${idx}")
                                params.append(data["city"])
                                idx += 1
                                fields_filled += 1
                            if data.get("sectors") and (
                                not r.get("sectors")
                                or len(r.get("sectors", [])) == 0
                            ):
                                updates.append(f"sectors = ${idx}")
                                params.append(data["sectors"])
                                idx += 1
                                fields_filled += 1

                            if updates:
                                params.append(company_id)
                                await pool.execute(
                                    f"UPDATE companies SET {', '.join(updates)} WHERE id = ${idx}",
                                    *params,
                                )
                                enriched += 1

                        # Update externals table
                        elif r.get("source_table") == "externals":
                            if data.get("note") or data.get("description"):
                                note = data.get("note") or data.get("description", "")
                                await pool.execute(
                                    "UPDATE externals SET note = $1 WHERE id = $2",
                                    note,
                                    r["source_table_id"],
                                )
                                fields_filled += 1
                                enriched += 1

                        # Update confidence on entity_registry
                        new_conf = data.get("confidence", 0.6)
                        if new_conf > (r.get("confidence") or 0):
                            await pool.execute(
                                "UPDATE entity_registry SET confidence = $1, updated_at = NOW() WHERE canonical_id = $2",
                                new_conf,
                                canonical_id,
                            )

                        # Log the enrichment
                        filled_fields = [
                            f
                            for f in ["description", "founded", "city", "sectors", "note"]
                            if data.get(f)
                        ]
                        await self.log_search(
                            pool,
                            canonical_id,
                            "enrichment",
                            query_text=f"Enrich {label} — missing: {', '.join(missing)}",
                            result_summary=f"Filled {len(filled_fields)} fields",
                            sources_checked=[data.get("source_url")]
                            if data.get("source_url")
                            else [],
                            findings=data,
                            confidence_before=r.get("confidence"),
                            confidence_after=new_conf,
                        )

            except Exception as e:
                print(f"[enricher] Node enrichment failed for {canonical_id}: {e}")

        return {"checked": checked, "enriched": enriched, "fields_filled": fields_filled}

    async def _enrich_edges(self, pool, limit):
        """Find and fill gaps in edge data."""
        rows = await pool.fetch(
            """SELECT ge.id, ge.source_id, ge.target_id, ge.rel, ge.note,
                      ge.event_year, ge.event_date, ge.source_url, ge.confidence,
                      er_s.label AS source_label, er_t.label AS target_label
               FROM graph_edges ge
               LEFT JOIN entity_registry er_s ON er_s.canonical_id = ge.source_id
               LEFT JOIN entity_registry er_t ON er_t.canonical_id = ge.target_id
               WHERE ge.edge_category = 'historical'
                 AND (ge.note IS NULL OR ge.note = ''
                      OR ge.source_url IS NULL
                      OR ge.event_year IS NULL)
               ORDER BY ge.confidence DESC NULLS LAST
               LIMIT $1""",
            limit,
        )

        checked = 0
        enriched = 0
        fields_filled = 0

        for row in rows:
            checked += 1
            r = dict(row)

            missing = []
            if not r.get("note"):
                missing.append("note/description")
            if not r.get("source_url"):
                missing.append("source_url")
            if not r.get("event_year"):
                missing.append("event_year")

            if not missing:
                continue

            prompt = (
                f"Fill missing data for this relationship in the Nevada ecosystem graph:\n\n"
                f"{r['source_label']} --[{r['rel']}]--> {r['target_label']}\n"
                f"Current note: {r.get('note') or 'MISSING'}\n"
                f"Current event_year: {r.get('event_year') or 'MISSING'}\n"
                f"Current source_url: {r.get('source_url') or 'MISSING'}\n\n"
                f"Missing: {', '.join(missing)}\n\n"
                f"Provide what you can verify. Use real URLs from known domains."
            )

            try:
                response = self.call_claude_with_tools(
                    SYSTEM_PROMPT, prompt, tools=[ENRICH_EDGE_TOOL]
                )

                for block in response.content:
                    if block.type == "tool_use" and block.name == "enrich_edge":
                        data = block.input
                        if data.get("confidence", 0) < 0.4:
                            continue

                        updates = []
                        params = []
                        idx = 1

                        if data.get("note") and not r.get("note"):
                            updates.append(f"note = ${idx}")
                            params.append(data["note"])
                            idx += 1
                            fields_filled += 1
                        if data.get("source_url") and not r.get("source_url"):
                            updates.append(f"source_url = ${idx}")
                            params.append(data["source_url"])
                            idx += 1
                            fields_filled += 1
                        if data.get("event_year") and not r.get("event_year"):
                            updates.append(f"event_year = ${idx}")
                            params.append(data["event_year"])
                            idx += 1
                            fields_filled += 1
                        if data.get("event_date") and not r.get("event_date"):
                            updates.append(f"event_date = ${idx}::date")
                            params.append(data["event_date"])
                            idx += 1
                            fields_filled += 1

                        if updates:
                            params.append(r["id"])
                            await pool.execute(
                                f"UPDATE graph_edges SET {', '.join(updates)} WHERE id = ${idx}",
                                *params,
                            )
                            enriched += 1

                        # Log the search
                        await self.log_search(
                            pool,
                            r["source_id"],
                            "enrichment",
                            query_text=f"Enrich edge {r['source_label']} -> {r['target_label']} ({r['rel']})",
                            result_summary=f"Filled {len(updates)} fields",
                            sources_checked=[data.get("source_url")]
                            if data.get("source_url")
                            else [],
                            findings=data,
                        )

            except Exception as e:
                print(f"[enricher] Edge enrichment failed for edge {r['id']}: {e}")

        return {"checked": checked, "enriched": enriched, "fields_filled": fields_filled}
