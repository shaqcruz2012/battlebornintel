"""
Nodes router — CRUD operations for graph nodes.

GET    /api/nodes           — list nodes (filterable, paginated)
GET    /api/nodes/{node_id} — single node with connections
POST   /api/nodes           — create node
PATCH  /api/nodes/{node_id} — update node label/data
"""
import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.db import fetch, fetchrow, execute, fetchval
from app.models import (
    VALID_NODE_TYPES,
    NodeCreate, NodeUpdate, NodeResponse,
)

logger = logging.getLogger("bbi.routers.nodes")

router = APIRouter(prefix="/api/nodes", tags=["nodes"])


@router.get("", response_model=list[NodeResponse])
async def list_nodes(
    type: Optional[str] = Query(None, description="Filter by node type"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List nodes with optional type filter and pagination."""
    if type and type not in VALID_NODE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid node type: {type}. Valid: {sorted(VALID_NODE_TYPES)}")

    if type:
        rows = await fetch(
            """
            SELECT id, type, label, data, confidence, source, created_at, updated_at
            FROM nodes
            WHERE type = $1
            ORDER BY label
            LIMIT $2 OFFSET $3
            """,
            type, limit, offset,
        )
    else:
        rows = await fetch(
            """
            SELECT id, type, label, data, confidence, source, created_at, updated_at
            FROM nodes
            ORDER BY label
            LIMIT $1 OFFSET $2
            """,
            limit, offset,
        )

    return [
        NodeResponse(
            id=r["id"],
            type=r["type"],
            label=r["label"],
            data=r["data"] or {},
            confidence=r["confidence"],
            source=r["source"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
        )
        for r in rows
    ]


@router.get("/{node_id}", response_model=dict)
async def get_node(node_id: str):
    """
    Get a single node with its connections (edges + neighbor labels).
    Returns the node plus inbound and outbound edges.
    """
    row = await fetchrow(
        "SELECT id, type, label, data, confidence, source, created_at, updated_at FROM nodes WHERE id = $1",
        node_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")

    node = NodeResponse(
        id=row["id"],
        type=row["type"],
        label=row["label"],
        data=row["data"] or {},
        confidence=row["confidence"],
        source=row["source"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )

    # Fetch edges where this node is source or target
    edge_rows = await fetch(
        """
        SELECT e.id, e.source_id, e.target_id, e.rel, e.note, e.year,
               e.confidence, e.source, e.status,
               ns.label AS source_label, ns.type AS source_type,
               nt.label AS target_label, nt.type AS target_type
        FROM edges e
        LEFT JOIN nodes ns ON ns.id = e.source_id
        LEFT JOIN nodes nt ON nt.id = e.target_id
        WHERE (e.source_id = $1 OR e.target_id = $1)
          AND e.status = 'approved'
        ORDER BY e.year DESC
        """,
        node_id,
    )

    connections = [
        {
            "id": er["id"],
            "source_id": er["source_id"],
            "target_id": er["target_id"],
            "rel": er["rel"],
            "note": er["note"],
            "year": er["year"],
            "confidence": er["confidence"],
            "source": er["source"],
            "source_label": er["source_label"],
            "source_type": er["source_type"],
            "target_label": er["target_label"],
            "target_type": er["target_type"],
        }
        for er in edge_rows
    ]

    return {"node": node.model_dump(), "connections": connections}


@router.post("", response_model=NodeResponse, status_code=201)
async def create_node(body: NodeCreate):
    """Create a new graph node. Validates type against VALID_NODE_TYPES."""
    if body.type not in VALID_NODE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid node type: {body.type}. Valid: {sorted(VALID_NODE_TYPES)}")

    # Check for duplicate
    existing = await fetchval("SELECT id FROM nodes WHERE id = $1", body.id)
    if existing:
        raise HTTPException(status_code=409, detail=f"Node {body.id} already exists")

    await execute(
        """
        INSERT INTO nodes (id, type, label, data, confidence, source)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        body.id, body.type, body.label,
        json.dumps(body.data), body.confidence, body.source,
    )

    row = await fetchrow(
        "SELECT id, type, label, data, confidence, source, created_at, updated_at FROM nodes WHERE id = $1",
        body.id,
    )

    logger.info(f"Created node {body.id} ({body.type}: {body.label})")

    return NodeResponse(
        id=row["id"],
        type=row["type"],
        label=row["label"],
        data=row["data"] or {},
        confidence=row["confidence"],
        source=row["source"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


@router.patch("/{node_id}", response_model=NodeResponse)
async def update_node(node_id: str, body: NodeUpdate):
    """Update a node's label, data, or confidence."""
    existing = await fetchrow("SELECT id FROM nodes WHERE id = $1", node_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")

    # Build SET clause dynamically
    updates: list[str] = []
    params: list = []
    param_idx = 1

    if body.label is not None:
        updates.append(f"label = ${param_idx}")
        params.append(body.label)
        param_idx += 1

    if body.data is not None:
        updates.append(f"data = ${param_idx}")
        params.append(json.dumps(body.data))
        param_idx += 1

    if body.confidence is not None:
        updates.append(f"confidence = ${param_idx}")
        params.append(body.confidence)
        param_idx += 1

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates.append(f"updated_at = NOW()")
    params.append(node_id)

    query = f"UPDATE nodes SET {', '.join(updates)} WHERE id = ${param_idx}"
    await execute(query, *params)

    row = await fetchrow(
        "SELECT id, type, label, data, confidence, source, created_at, updated_at FROM nodes WHERE id = $1",
        node_id,
    )

    logger.info(f"Updated node {node_id}")

    return NodeResponse(
        id=row["id"],
        type=row["type"],
        label=row["label"],
        data=row["data"] or {},
        confidence=row["confidence"],
        source=row["source"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
