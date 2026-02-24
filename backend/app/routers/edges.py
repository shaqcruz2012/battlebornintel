"""
Edges router — proposal, review workflow, and listing.

GET  /api/edges              — list edges (filterable)
POST /api/edges/propose      — propose edge (auto-route by confidence)
POST /api/edges/{id}/review  — human review (approve/reject)
GET  /api/edges/review-queue — pending edges sorted by confidence desc
"""
import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.db import fetch, fetchrow, execute, fetchval
from app.models import (
    VALID_REL_TYPES, VALID_EDGE_STATUSES,
    EdgeProposal, EdgeReviewRequest, EdgeResponse,
)

logger = logging.getLogger("bbi.routers.edges")

router = APIRouter(prefix="/api/edges", tags=["edges"])


def _row_to_response(r: dict) -> EdgeResponse:
    """Convert a DB row dict to an EdgeResponse model."""
    evidence = r.get("evidence") or []
    if isinstance(evidence, str):
        evidence = json.loads(evidence)
    return EdgeResponse(
        id=r["id"],
        source_id=r["source_id"],
        target_id=r["target_id"],
        rel=r["rel"],
        note=r["note"],
        year=r["year"],
        confidence=r["confidence"],
        source=r["source"],
        evidence=evidence,
        status=r["status"],
        reviewed_by=r.get("reviewed_by"),
        created_at=r["created_at"],
    )


@router.get("", response_model=list[EdgeResponse])
async def list_edges(
    status: Optional[str] = Query(None, description="Filter by status: approved, pending, rejected"),
    confidence: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum confidence"),
    source: Optional[str] = Query(None, description="Filter by source: seed, edgar, sbir, news, agent, manual"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """List edges with optional filters and pagination."""
    if status and status not in VALID_EDGE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}. Valid: {sorted(VALID_EDGE_STATUSES)}")

    conditions: list[str] = []
    params: list = []
    param_idx = 1

    if status:
        conditions.append(f"status = ${param_idx}")
        params.append(status)
        param_idx += 1

    if confidence is not None:
        conditions.append(f"confidence >= ${param_idx}")
        params.append(confidence)
        param_idx += 1

    if source:
        conditions.append(f"source = ${param_idx}")
        params.append(source)
        param_idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    params.append(limit)
    limit_idx = param_idx
    param_idx += 1

    params.append(offset)
    offset_idx = param_idx

    query = f"""
        SELECT id, source_id, target_id, rel, note, year,
               confidence, source, evidence, status, reviewed_by, created_at
        FROM edges
        {where}
        ORDER BY created_at DESC
        LIMIT ${limit_idx} OFFSET ${offset_idx}
    """

    rows = await fetch(query, *params)
    return [_row_to_response(r) for r in rows]


@router.get("/review-queue", response_model=list[EdgeResponse])
async def review_queue(
    limit: int = Query(50, ge=1, le=200),
):
    """Get pending edges sorted by confidence descending (highest first for review)."""
    rows = await fetch(
        """
        SELECT id, source_id, target_id, rel, note, year,
               confidence, source, evidence, status, reviewed_by, created_at
        FROM edges
        WHERE status = 'pending'
        ORDER BY confidence DESC
        LIMIT $1
        """,
        limit,
    )
    return [_row_to_response(r) for r in rows]


@router.post("/propose", response_model=EdgeResponse, status_code=201)
async def propose_edge(body: EdgeProposal):
    """
    Propose a new edge from ingestion pipeline or agent.
    Auto-routes by confidence:
      > 0.85 : auto-approve  (status='approved')
      0.6-0.85: pending review (status='pending')
      < 0.6  : rejected      (status='rejected')
    """
    # Validate rel type
    if body.rel not in VALID_REL_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid rel type: {body.rel}. Valid: {sorted(VALID_REL_TYPES)}")

    # Validate source_id and target_id exist
    source_exists = await fetchval("SELECT id FROM nodes WHERE id = $1", body.source_id)
    if not source_exists:
        raise HTTPException(status_code=400, detail=f"Source node {body.source_id} does not exist")

    target_exists = await fetchval("SELECT id FROM nodes WHERE id = $1", body.target_id)
    if not target_exists:
        raise HTTPException(status_code=400, detail=f"Target node {body.target_id} does not exist")

    # Check for duplicate edge (same source+target+rel)
    dup = await fetchval(
        "SELECT id FROM edges WHERE source_id = $1 AND target_id = $2 AND rel = $3",
        body.source_id, body.target_id, body.rel,
    )
    if dup:
        raise HTTPException(status_code=409, detail=f"Edge {body.source_id}->{body.target_id} ({body.rel}) already exists (id={dup})")

    # Auto-route by confidence threshold
    if body.confidence > settings.confidence_auto_approve:
        status = "approved"
    elif body.confidence >= settings.confidence_review_threshold:
        status = "pending"
    else:
        status = "rejected"

    edge_id = await fetchval(
        """
        INSERT INTO edges (source_id, target_id, rel, note, year, confidence, source, evidence, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
        """,
        body.source_id, body.target_id, body.rel, body.note, body.year,
        body.confidence, body.source, json.dumps(body.evidence), status,
    )

    logger.info(f"Proposed edge {edge_id}: {body.source_id}->{body.target_id} ({body.rel}) confidence={body.confidence} -> status={status}")

    # Notify via PostgreSQL LISTEN/NOTIFY if approved
    if status == "approved":
        await execute(
            "SELECT pg_notify('graph_changed', $1)",
            json.dumps({"event": "edge_added", "edge_id": edge_id}),
        )

    row = await fetchrow(
        """
        SELECT id, source_id, target_id, rel, note, year,
               confidence, source, evidence, status, reviewed_by, created_at
        FROM edges WHERE id = $1
        """,
        edge_id,
    )
    return _row_to_response(row)


@router.post("/{edge_id}/review", response_model=EdgeResponse)
async def review_edge(edge_id: int, body: EdgeReviewRequest):
    """
    Human review of a proposed edge. Creates an audit entry in edge_reviews.
    """
    if body.action not in {"approved", "rejected", "needs_info"}:
        raise HTTPException(status_code=400, detail="action must be 'approved', 'rejected', or 'needs_info'")

    row = await fetchrow(
        "SELECT id, status FROM edges WHERE id = $1",
        edge_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail=f"Edge {edge_id} not found")

    # Determine new status
    new_status = body.action if body.action in {"approved", "rejected"} else "pending"

    # Update edge
    update_params = [new_status, body.reviewer]
    update_parts = ["status = $1", "reviewed_by = $2"]
    param_idx = 3

    if body.confidence is not None:
        update_parts.append(f"confidence = ${param_idx}")
        update_params.append(body.confidence)
        param_idx += 1

    update_params.append(edge_id)
    query = f"UPDATE edges SET {', '.join(update_parts)} WHERE id = ${param_idx}"
    await execute(query, *update_params)

    # Insert audit trail in edge_reviews
    # Get the old confidence for the audit trail
    old_confidence = await fetchval(
        "SELECT confidence FROM edges WHERE id = $1", edge_id,
    )
    await execute(
        """
        INSERT INTO edge_reviews (edge_id, action, confidence_before, confidence_after, reviewer, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        edge_id, body.action, old_confidence, body.confidence, body.reviewer, body.notes,
    )

    logger.info(f"Edge {edge_id} reviewed: {body.action} by {body.reviewer}")

    # Notify if newly approved
    if new_status == "approved":
        await execute(
            "SELECT pg_notify('graph_changed', $1)",
            json.dumps({"event": "edge_approved", "edge_id": edge_id}),
        )

    updated = await fetchrow(
        """
        SELECT id, source_id, target_id, rel, note, year,
               confidence, source, evidence, status, reviewed_by, created_at
        FROM edges WHERE id = $1
        """,
        edge_id,
    )
    return _row_to_response(updated)
