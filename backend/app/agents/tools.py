"""
Tool definitions for the BBI agentic researcher.

Each tool follows the Anthropic tool-use format with:
  - name, description, input_schema (JSON Schema)
  - An async execute function that performs the action

Tools are used by the Claude researcher agent to interact with the BBI graph
and external data sources during discovery, verification, and enrichment runs.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import settings
from app.db import execute, fetch, fetchrow, fetchval
from app.services.validator import (
    validate_edge_proposal,
    fuzzy_match_company,
    normalize_entity_id,
)

logger = logging.getLogger("bbi.agents.tools")

REQUEST_TIMEOUT = 15.0


# ═══════════════════════════════════════════════════════════════
# TOOL DEFINITIONS (Anthropic tool-use format)
# ═══════════════════════════════════════════════════════════════

TOOLS: list[dict[str, Any]] = [
    {
        "name": "search_web",
        "description": (
            "Search the internet for information about Nevada startups, "
            "venture capital, business relationships, or specific companies. "
            "Returns a list of search results with titles, snippets, and URLs."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Search query. Be specific and include relevant context "
                        "like 'Nevada', company names, or relationship types."
                    ),
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "query_graph",
        "description": (
            "Look up a node in the BBI graph and return its details along with "
            "all connected edges. Use this to understand a node's current "
            "connections before proposing new ones."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "node_id": {
                    "type": "string",
                    "description": (
                        "The node ID to look up (e.g., 'c_switch', 'f_bbv', 'x_doe'). "
                        "Can also pass a company name for fuzzy matching."
                    ),
                },
            },
            "required": ["node_id"],
        },
    },
    {
        "name": "list_companies",
        "description": (
            "List companies in the BBI graph matching optional criteria. "
            "Returns node IDs, labels, and basic metadata. Use this to browse "
            "existing companies or find specific ones."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "sector": {
                    "type": "string",
                    "description": "Filter by sector (e.g., 'cleantech', 'AI', 'defense').",
                },
                "stage": {
                    "type": "string",
                    "description": "Filter by funding stage (e.g., 'seed', 'series_a').",
                },
                "min_edges": {
                    "type": "integer",
                    "description": "Only return companies with at least this many edges.",
                },
                "max_edges": {
                    "type": "integer",
                    "description": "Only return companies with at most this many edges.",
                },
                "search": {
                    "type": "string",
                    "description": "Search company names (fuzzy match).",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max results to return (default: 20).",
                },
            },
            "required": [],
        },
    },
    {
        "name": "propose_edge",
        "description": (
            "Submit a new relationship (edge) to the BBI graph. The edge will "
            "be validated and assigned a status based on confidence: "
            ">0.85 auto-approved, 0.6-0.85 pending review, <0.6 rejected. "
            "IMPORTANT: Use correct directionality. For 'invested_in', the "
            "investor is source_id and the company is target_id."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "source_id": {
                    "type": "string",
                    "description": "ID of the source node (e.g., 'f_bbv' for an investor).",
                },
                "target_id": {
                    "type": "string",
                    "description": "ID of the target node (e.g., 'c_switch' for a company).",
                },
                "rel": {
                    "type": "string",
                    "description": (
                        "Relationship type. Must be one of: invested_in, partners_with, "
                        "accelerated_by, competes_with, acquired, funds, collaborated_with, "
                        "supports, contracts_with, won_pitch, grants_to, approved_by, "
                        "filed_with, program_of, housed_at, manages, loaned_to, "
                        "eligible_for, operates_in, headquartered_in, founder_of, "
                        "listed_on, incubated_by."
                    ),
                },
                "note": {
                    "type": "string",
                    "description": "Human-readable note about this relationship.",
                },
                "year": {
                    "type": "integer",
                    "description": "Year the relationship was established (2000-2027).",
                },
                "confidence": {
                    "type": "number",
                    "description": "Confidence score 0.0-1.0 based on evidence quality.",
                },
                "evidence_url": {
                    "type": "string",
                    "description": "URL of the source supporting this relationship.",
                },
                "evidence_title": {
                    "type": "string",
                    "description": "Title of the source document or article.",
                },
                "evidence_snippet": {
                    "type": "string",
                    "description": "Relevant quote or summary from the source.",
                },
            },
            "required": ["source_id", "target_id", "rel", "confidence"],
        },
    },
    {
        "name": "propose_node",
        "description": (
            "Submit a new entity (node) to the BBI graph. Use this when you "
            "discover a company, fund, or organization not yet in the graph. "
            "The node will be created if it doesn't already exist."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Human-readable name of the entity.",
                },
                "entity_type": {
                    "type": "string",
                    "enum": [
                        "company", "fund", "accelerator", "ecosystem",
                        "external", "person",
                    ],
                    "description": "Type of entity.",
                },
                "data": {
                    "type": "object",
                    "description": (
                        "Additional metadata. For companies: sector, stage, city, "
                        "funding amount. For funds: fund type, AUM. For externals: "
                        "etype (investor, corporate, government)."
                    ),
                },
                "confidence": {
                    "type": "number",
                    "description": "Confidence that this entity exists and is correctly typed (0.0-1.0).",
                },
            },
            "required": ["name", "entity_type", "confidence"],
        },
    },
    {
        "name": "get_edges_needing_verification",
        "description": (
            "Get a batch of edges that have default timestamps (y:2023) and "
            "need real dates verified through research. Used in verification mode."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Max number of edges to return (default: 10).",
                },
            },
            "required": [],
        },
    },
]


# ═══════════════════════════════════════════════════════════════
# TOOL EXECUTION
# ═══════════════════════════════════════════════════════════════


async def execute_tool(name: str, input_data: dict[str, Any]) -> str:
    """
    Execute a tool by name with the given input and return a JSON string result.

    Args:
        name: Tool name (must match one of the TOOLS definitions).
        input_data: Tool input parameters.

    Returns:
        JSON string with the tool's result.
    """
    try:
        handler = _TOOL_HANDLERS.get(name)
        if not handler:
            return json.dumps({"error": f"Unknown tool: {name}"})

        result = await handler(input_data)
        return json.dumps(result, default=str)

    except Exception as e:
        logger.error(f"Tool execution error [{name}]: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


# ── Individual tool handlers ──


async def _handle_search_web(input_data: dict[str, Any]) -> dict[str, Any]:
    """
    Search the web using SerpAPI (Google Search) or fall back to a simple
    web search.
    """
    query = input_data.get("query", "")
    if not query:
        return {"error": "query is required"}

    # Try SerpAPI if key is available
    if settings.serp_api_key:
        return await _search_serpapi(query)

    # Fallback: return a message indicating no search API is configured
    logger.warning("[tools] No SERP_API_KEY configured; web search unavailable")
    return {
        "results": [],
        "message": (
            "Web search is not available (no SERP_API_KEY configured). "
            "Use query_graph and list_companies to work with existing data."
        ),
    }


async def _search_serpapi(query: str) -> dict[str, Any]:
    """Execute a search via SerpAPI."""
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                "https://serpapi.com/search",
                params={
                    "q": query,
                    "api_key": settings.serp_api_key,
                    "engine": "google",
                    "num": 10,
                },
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get("organic_results", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                })

            return {"results": results, "query": query}

    except httpx.HTTPStatusError as e:
        return {"error": f"Search API error: {e.response.status_code}", "results": []}
    except httpx.RequestError as e:
        return {"error": f"Search request failed: {e}", "results": []}


async def _handle_query_graph(input_data: dict[str, Any]) -> dict[str, Any]:
    """Look up a node and its connections in the BBI graph."""
    node_id = input_data.get("node_id", "")
    if not node_id:
        return {"error": "node_id is required"}

    # Try direct ID lookup first
    node = await fetchrow("SELECT * FROM nodes WHERE id = $1", node_id)

    # If not found, try fuzzy matching
    if not node:
        matches = await fuzzy_match_company(node_id)
        if matches and matches[0][1] >= 70:
            matched_id = matches[0][0]
            node = await fetchrow("SELECT * FROM nodes WHERE id = $1", matched_id)
            if node:
                node_id = matched_id

    if not node:
        return {"error": f"Node '{input_data.get('node_id')}' not found"}

    # Get all connected edges
    edges_out = await fetch(
        """SELECT e.*, n.label as target_label, n.type as target_type
           FROM edges e
           JOIN nodes n ON n.id = e.target_id
           WHERE e.source_id = $1 AND e.status = 'approved'""",
        node_id,
    )
    edges_in = await fetch(
        """SELECT e.*, n.label as source_label, n.type as source_type
           FROM edges e
           JOIN nodes n ON n.id = e.source_id
           WHERE e.target_id = $1 AND e.status = 'approved'""",
        node_id,
    )

    return {
        "node": {
            "id": node["id"],
            "type": node["type"],
            "label": node["label"],
            "data": json.loads(node["data"]) if isinstance(node["data"], str) else node.get("data", {}),
        },
        "edges_outgoing": [
            {
                "target_id": e["target_id"],
                "target_label": e["target_label"],
                "rel": e["rel"],
                "year": e["year"],
                "note": e.get("note"),
            }
            for e in edges_out
        ],
        "edges_incoming": [
            {
                "source_id": e["source_id"],
                "source_label": e["source_label"],
                "rel": e["rel"],
                "year": e["year"],
                "note": e.get("note"),
            }
            for e in edges_in
        ],
        "total_connections": len(edges_out) + len(edges_in),
    }


async def _handle_list_companies(input_data: dict[str, Any]) -> dict[str, Any]:
    """List companies matching optional criteria."""
    limit = min(input_data.get("limit", 20), 50)
    search = input_data.get("search", "")
    sector = input_data.get("sector", "")
    stage = input_data.get("stage", "")
    min_edges = input_data.get("min_edges")
    max_edges = input_data.get("max_edges")

    # Base query
    query = """
        SELECT n.id, n.label, n.data,
               COUNT(DISTINCT e.id) as edge_count
        FROM nodes n
        LEFT JOIN edges e ON (e.source_id = n.id OR e.target_id = n.id) AND e.status = 'approved'
        WHERE n.type = 'company'
    """
    params: list[Any] = []
    param_idx = 1

    # Apply search filter
    if search:
        query += f" AND n.label ILIKE ${param_idx}"
        params.append(f"%{search}%")
        param_idx += 1

    query += " GROUP BY n.id, n.label, n.data"

    # Apply edge count filters (in HAVING clause)
    having_clauses = []
    if min_edges is not None:
        having_clauses.append(f"COUNT(DISTINCT e.id) >= ${param_idx}")
        params.append(min_edges)
        param_idx += 1
    if max_edges is not None:
        having_clauses.append(f"COUNT(DISTINCT e.id) <= ${param_idx}")
        params.append(max_edges)
        param_idx += 1
    if having_clauses:
        query += " HAVING " + " AND ".join(having_clauses)

    query += f" ORDER BY edge_count DESC LIMIT ${param_idx}"
    params.append(limit)

    rows = await fetch(query, *params)

    companies = []
    for row in rows:
        data = json.loads(row["data"]) if isinstance(row["data"], str) else row.get("data", {})

        # Apply sector/stage filters in Python (since data is JSONB)
        if sector and sector.lower() not in json.dumps(data.get("sector", [])).lower():
            continue
        if stage and data.get("stage", "") != stage:
            continue

        companies.append({
            "id": row["id"],
            "label": row["label"],
            "edge_count": row["edge_count"],
            "sector": data.get("sector", []),
            "stage": data.get("stage", ""),
            "funding": data.get("funding", 0),
            "city": data.get("city", ""),
        })

    return {"companies": companies, "count": len(companies)}


async def _handle_propose_edge(input_data: dict[str, Any]) -> dict[str, Any]:
    """Propose a new edge to the BBI graph."""
    source_id = input_data.get("source_id", "")
    target_id = input_data.get("target_id", "")
    rel = input_data.get("rel", "")
    confidence = input_data.get("confidence", 0.5)
    note = input_data.get("note")
    year = input_data.get("year", 2023)

    # Build evidence from tool input
    evidence = []
    if input_data.get("evidence_url"):
        evidence.append({
            "url": input_data["evidence_url"],
            "title": input_data.get("evidence_title", ""),
            "snippet": input_data.get("evidence_snippet", ""),
            "source": "agent_research",
        })

    # Validate
    proposal = {
        "source_id": source_id,
        "target_id": target_id,
        "rel": rel,
        "year": year,
        "confidence": confidence,
    }
    validation = await validate_edge_proposal(proposal)
    if not validation["valid"]:
        return {
            "status": "invalid",
            "errors": validation["errors"],
            "warnings": validation["warnings"],
        }

    # Determine status based on confidence
    if confidence >= settings.confidence_auto_approve:
        status = "approved"
    elif confidence >= settings.confidence_review_threshold:
        status = "pending"
    else:
        status = "rejected"

    # Insert
    edge_id = await fetchval(
        """INSERT INTO edges
           (source_id, target_id, rel, note, year, confidence, source, evidence, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'agent', $7, $8)
           RETURNING id""",
        source_id,
        target_id,
        rel,
        note,
        year,
        confidence,
        json.dumps(evidence),
        status,
    )

    return {
        "status": status,
        "edge_id": edge_id,
        "message": f"Edge {source_id} --[{rel}]--> {target_id} proposed with status '{status}'",
    }


async def _handle_propose_node(input_data: dict[str, Any]) -> dict[str, Any]:
    """Propose a new node to the BBI graph."""
    name = input_data.get("name", "").strip()
    entity_type = input_data.get("entity_type", "external")
    data = input_data.get("data", {})
    confidence = input_data.get("confidence", 0.5)

    if not name:
        return {"error": "name is required"}

    # Generate ID
    try:
        node_id = normalize_entity_id(name, entity_type)
    except ValueError as e:
        return {"error": str(e)}

    # Check if node already exists
    existing = await fetchrow("SELECT id, label FROM nodes WHERE id = $1", node_id)
    if existing:
        return {
            "status": "exists",
            "node_id": existing["id"],
            "label": existing["label"],
            "message": f"Node '{name}' already exists as '{existing['id']}'",
        }

    # Also check fuzzy match to avoid near-duplicates
    matches = await fuzzy_match_company(name)
    if matches and matches[0][1] >= 90:
        return {
            "status": "near_duplicate",
            "existing_id": matches[0][0],
            "match_score": matches[0][1],
            "message": (
                f"A similar node already exists: '{matches[0][0]}' "
                f"(match score: {matches[0][1]}). Use the existing node."
            ),
        }

    # Insert
    await execute(
        """INSERT INTO nodes (id, type, label, data, confidence, source)
           VALUES ($1, $2, $3, $4, $5, 'agent')""",
        node_id,
        entity_type,
        name,
        json.dumps(data),
        confidence,
    )

    return {
        "status": "created",
        "node_id": node_id,
        "message": f"Node '{name}' created as '{node_id}' (type: {entity_type})",
    }


async def _handle_get_edges_needing_verification(
    input_data: dict[str, Any],
) -> dict[str, Any]:
    """Get edges that have default timestamps and need verification."""
    limit = min(input_data.get("limit", 10), 50)

    rows = await fetch(
        """SELECT e.id, e.source_id, e.target_id, e.rel, e.year, e.note,
                  s.label as source_label, s.type as source_type,
                  t.label as target_label, t.type as target_type
           FROM edges e
           JOIN nodes s ON s.id = e.source_id
           JOIN nodes t ON t.id = e.target_id
           WHERE e.year = 2023
             AND e.status = 'approved'
             AND e.source != 'manual'
           ORDER BY random()
           LIMIT $1""",
        limit,
    )

    edges = [
        {
            "edge_id": r["id"],
            "source_id": r["source_id"],
            "source_label": r["source_label"],
            "source_type": r["source_type"],
            "target_id": r["target_id"],
            "target_label": r["target_label"],
            "target_type": r["target_type"],
            "rel": r["rel"],
            "year": r["year"],
            "note": r.get("note"),
        }
        for r in rows
    ]

    return {
        "edges": edges,
        "count": len(edges),
        "message": (
            f"Found {len(edges)} edges with default year=2023 that need verification. "
            "Research the actual dates for these relationships."
        ),
    }


# ── Handler registry ──

_TOOL_HANDLERS: dict[str, Any] = {
    "search_web": _handle_search_web,
    "query_graph": _handle_query_graph,
    "list_companies": _handle_list_companies,
    "propose_edge": _handle_propose_edge,
    "propose_node": _handle_propose_node,
    "get_edges_needing_verification": _handle_get_edges_needing_verification,
}
