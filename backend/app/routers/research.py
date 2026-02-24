"""
Research router — AI agent endpoints for graph intelligence.

POST /api/research/discover — run discovery agent (find new entities + edges)
POST /api/research/verify   — run verification agent (validate existing edges)
POST /api/research/enrich   — run enrichment agent (add data to existing nodes)
GET  /api/research/runs     — list agent run history with pagination
"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query

from app.db import fetch, fetchrow, fetchval
from app.models import AgentRunResponse

logger = logging.getLogger("bbi.routers.research")

router = APIRouter(prefix="/api/research", tags=["research"])


async def _create_agent_run(run_type: str) -> AgentRunResponse:
    """
    Create an agent_runs entry for a research agent.
    Stub implementation: immediately marks as completed with empty stats.
    """
    run_id = await fetchval(
        """
        INSERT INTO agent_runs (run_type, status, stats, started_at, completed_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        """,
        run_type,
        "completed",
        json.dumps({"nodes_processed": 0, "edges_proposed": 0, "edges_approved": 0}),
        datetime.now(timezone.utc),
        datetime.now(timezone.utc),
    )

    row = await fetchrow(
        """
        SELECT id, run_type, status, stats, started_at, completed_at, error
        FROM agent_runs WHERE id = $1
        """,
        run_id,
    )

    logger.info(f"Research run {run_id} ({run_type}) created — stub completed")

    return AgentRunResponse(
        id=row["id"],
        run_type=row["run_type"],
        status=row["status"],
        stats=row["stats"] if isinstance(row["stats"], dict) else json.loads(row["stats"] or "{}"),
        started_at=row["started_at"],
        completed_at=row["completed_at"],
        error=row["error"],
    )


@router.post("/discover", response_model=AgentRunResponse, status_code=201)
async def run_discovery():
    """
    Run the discovery agent.
    Searches external sources to find new entities and relationships
    connected to the Nevada startup ecosystem. Proposes new nodes and edges.

    Stub: creates a completed run with empty stats.
    """
    return await _create_agent_run("discovery")


@router.post("/verify", response_model=AgentRunResponse, status_code=201)
async def run_verification():
    """
    Run the verification agent.
    Reviews existing edges with lower confidence scores, attempts to
    find corroborating evidence, and updates confidence accordingly.

    Stub: creates a completed run with empty stats.
    """
    return await _create_agent_run("verification")


@router.post("/enrich", response_model=AgentRunResponse, status_code=201)
async def run_enrichment():
    """
    Run the enrichment agent.
    Adds missing data to existing nodes (funding amounts, employee counts,
    descriptions, sector tags) by querying external sources.

    Stub: creates a completed run with empty stats.
    """
    return await _create_agent_run("enrichment")


@router.get("/runs", response_model=list[AgentRunResponse])
async def list_runs(
    run_type: Optional[str] = Query(None, description="Filter by run type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List agent run history with optional type filter and pagination."""
    if run_type:
        rows = await fetch(
            """
            SELECT id, run_type, status, stats, started_at, completed_at, error
            FROM agent_runs
            WHERE run_type = $1
            ORDER BY started_at DESC
            LIMIT $2 OFFSET $3
            """,
            run_type, limit, offset,
        )
    else:
        rows = await fetch(
            """
            SELECT id, run_type, status, stats, started_at, completed_at, error
            FROM agent_runs
            ORDER BY started_at DESC
            LIMIT $1 OFFSET $2
            """,
            limit, offset,
        )

    return [
        AgentRunResponse(
            id=r["id"],
            run_type=r["run_type"],
            status=r["status"],
            stats=r["stats"] if isinstance(r["stats"], dict) else json.loads(r["stats"] or "{}"),
            started_at=r["started_at"],
            completed_at=r["completed_at"],
            error=r["error"],
        )
        for r in rows
    ]
