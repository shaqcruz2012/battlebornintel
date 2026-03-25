"""RelationshipMapper agent — discovers missing graph edges via semantic reasoning."""

import json

from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a graph relationship analyst for the Nevada startup ecosystem.
Given information about a company and its known connections, identify relationships
that likely exist but are missing from the graph.

CRITICAL:
- Only suggest relationships you are confident about based on the evidence.
- Each suggestion must include the relationship type, the connected entity, and why you believe it exists.
- Set confidence conservatively. 0.9+ only for clearly stated facts.
- Never fabricate relationships.

Output valid JSON."""

RELATIONSHIP_TOOL = {
    "name": "suggest_relationships",
    "description": "Suggest missing graph relationships for a company",
    "input_schema": {
        "type": "object",
        "properties": {
            "relationships": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "target_label": {"type": "string", "description": "Name of the connected entity"},
                        "target_type": {"type": "string", "enum": ["company", "fund", "external", "accelerator", "program", "person"]},
                        "rel": {"type": "string", "description": "Relationship type (invested_in, partners_with, accelerated_by, etc.)"},
                        "direction": {"type": "string", "enum": ["outgoing", "incoming"]},
                        "confidence": {"type": "number", "description": "Confidence 0.0-1.0"},
                        "evidence": {"type": "string", "description": "Why this relationship likely exists"},
                        "year": {"type": "integer", "description": "Approximate year of relationship"},
                    },
                    "required": ["target_label", "rel", "confidence", "evidence"],
                },
            },
        },
        "required": ["relationships"],
    },
}


class RelationshipMapper(BaseAgent):
    """Discovers missing graph relationships between existing entities."""

    def __init__(self):
        super().__init__("relationship_mapper")

    async def run(self, pool, company_id: int | None = None, limit: int = 20):
        if company_id:
            companies = await pool.fetch(
                "SELECT id, name, stage, sectors, city, region, funding_m, description FROM companies WHERE id = $1",
                company_id,
            )
        else:
            # Focus on companies with few connections (likely missing edges)
            companies = await pool.fetch(
                """SELECT c.id, c.name, c.stage, c.sectors, c.city, c.region,
                          c.funding_m, c.description,
                          COUNT(ge.id) AS edge_count
                   FROM companies c
                   LEFT JOIN graph_edges ge ON ge.source_id = 'c_' || c.id OR ge.target_id = 'c_' || c.id
                   GROUP BY c.id
                   ORDER BY COUNT(ge.id) ASC
                   LIMIT $1""",
                limit,
            )

        results = {"analyzed": 0, "edges_created": 0, "edges_skipped": 0}

        for company in companies:
            created, skipped = await self._map_company(pool, dict(company))
            results["analyzed"] += 1
            results["edges_created"] += created
            results["edges_skipped"] += skipped

        return results

    async def _map_company(self, pool, company: dict) -> tuple[int, int]:
        node_id = f"c_{company['id']}"
        created = 0
        skipped = 0

        # Get existing connections
        existing_edges = await pool.fetch(
            """SELECT source_id, target_id, rel FROM graph_edges
               WHERE source_id = $1 OR target_id = $1""",
            node_id,
        )
        existing_connections = set()
        for e in existing_edges:
            other = e["target_id"] if e["source_id"] == node_id else e["source_id"]
            existing_connections.add(f"{other}|{e['rel']}")

        edge_summary = [
            f"{e['rel']}: {e['target_id'] if e['source_id'] == node_id else e['source_id']}"
            for e in existing_edges
        ]

        sectors = ", ".join(company.get("sectors") or [])
        user_prompt = f"""Analyze this Nevada company and suggest missing relationships:

Company: {company['name']}
Stage: {company['stage']}
Sectors: {sectors}
City: {company['city']}, Region: {company['region']}
Funding: ${company.get('funding_m', 0)}M
Description: {company.get('description') or 'N/A'}

Current connections ({len(existing_edges)}):
{chr(10).join(edge_summary[:20]) if edge_summary else 'None'}

Based on the company profile and stage, suggest relationships that are likely missing.
Consider: investors, accelerators, partners, government programs, and ecosystem orgs."""

        try:
            response = self.call_claude_with_tools(
                SYSTEM_PROMPT,
                user_prompt,
                tools=[RELATIONSHIP_TOOL],
            )

            for block in response.content:
                if block.type == "tool_use" and block.name == "suggest_relationships":
                    suggestions = block.input.get("relationships", [])

                    for suggestion in suggestions:
                        if suggestion.get("confidence", 0) < 0.5:
                            skipped += 1
                            continue

                        # Try to match target to an existing entity
                        target_label = suggestion["target_label"]
                        target_type = suggestion.get("target_type")
                        matches = await self.search_entities(
                            pool, target_label,
                            entity_type=target_type,
                            limit=3,
                        )

                        if not matches:
                            skipped += 1
                            continue

                        target_id = matches[0]["canonical_id"]
                        rel = suggestion["rel"]

                        # Skip if edge already exists
                        edge_key = f"{target_id}|{rel}"
                        reverse_key = f"{target_id}|{rel}"
                        if edge_key in existing_connections or reverse_key in existing_connections:
                            skipped += 1
                            continue

                        # Determine direction
                        if suggestion.get("direction") == "incoming":
                            src, tgt = target_id, node_id
                        else:
                            src, tgt = node_id, target_id

                        await self.create_edge(
                            pool, src, tgt, rel,
                            note=suggestion.get("evidence", ""),
                            event_year=suggestion.get("year"),
                            confidence=suggestion["confidence"],
                            source_name=f"relationship_mapper/{self.agent_name}",
                            data_quality="medium" if suggestion["confidence"] >= 0.7 else "low",
                            edge_category="projected",
                        )
                        created += 1
                        existing_connections.add(edge_key)

        except Exception as e:
            print(f"[relationship_mapper] Failed for {company['name']}: {e}")

        return created, skipped
