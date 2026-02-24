"""
Ingestion router — trigger data pipelines for edge discovery.

POST /api/ingest/edgar — trigger SEC EDGAR Form D pipeline
POST /api/ingest/sbir  — trigger SBIR/STTR grant database pipeline
POST /api/ingest/news  — trigger news enrichment pipeline

Each creates an agent_runs row. For now, stubs that immediately complete.
Actual pipeline logic will be wired in when the ingestion engine is integrated.
"""
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from app.db import fetchrow, fetchval
from app.models import AgentRunResponse

logger = logging.getLogger("bbi.routers.ingest")

router = APIRouter(prefix="/api/ingest", tags=["ingest"])


async def _create_run(run_type: str, source_label: str) -> AgentRunResponse:
    """
    Create an agent_runs entry for an ingestion pipeline.
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
        json.dumps({"source": source_label, "edges_proposed": 0, "edges_approved": 0}),
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

    logger.info(f"Ingestion run {run_id} ({run_type}) created — stub completed")

    return AgentRunResponse(
        id=row["id"],
        run_type=row["run_type"],
        status=row["status"],
        stats=row["stats"] if isinstance(row["stats"], dict) else json.loads(row["stats"] or "{}"),
        started_at=row["started_at"],
        completed_at=row["completed_at"],
        error=row["error"],
    )


@router.post("/edgar", response_model=AgentRunResponse, status_code=201)
async def trigger_edgar():
    """
    Trigger SEC EDGAR Form D ingestion pipeline.
    Scans recent private placement filings for Nevada-connected entities,
    proposes new edges with evidence citations.

    Stub: creates a completed run with empty stats.
    """
    return await _create_run("ingest_edgar", "SEC EDGAR Form D")


@router.post("/sbir", response_model=AgentRunResponse, status_code=201)
async def trigger_sbir():
    """
    Trigger SBIR/STTR federal grant database pipeline.
    Scans recent awards for Nevada companies, proposes grants_to edges.

    Stub: creates a completed run with empty stats.
    """
    return await _create_run("ingest_sbir", "SBIR/STTR Database")


@router.post("/news", response_model=AgentRunResponse, status_code=201)
async def trigger_news():
    """
    Trigger news enrichment pipeline.
    Queries NewsAPI for recent articles about tracked companies,
    extracts relationships and proposes new edges.

    Stub: creates a completed run with empty stats.
    """
    return await _create_run("ingest_news", "NewsAPI Enrichment")
