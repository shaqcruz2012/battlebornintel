"""Audit trail querying for agent runs."""

from ..db import get_pool


async def get_recent_runs(limit: int = 20):
    """Get the most recent agent runs."""
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT id, agent_name, status, started_at, completed_at,
                  output_summary, error_message, records_affected
           FROM agent_runs
           ORDER BY started_at DESC
           LIMIT $1""",
        limit,
    )
    return [dict(r) for r in rows]


async def get_agent_history(agent_name: str, limit: int = 10):
    """Get run history for a specific agent."""
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT id, status, started_at, completed_at,
                  output_summary, error_message
           FROM agent_runs
           WHERE agent_name = $1
           ORDER BY started_at DESC
           LIMIT $2""",
        agent_name,
        limit,
    )
    return [dict(r) for r in rows]


async def get_run_stats():
    """Get aggregate stats for agent runs."""
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT agent_name,
                  COUNT(*) as total_runs,
                  COUNT(*) FILTER (WHERE status = 'completed') as completed,
                  COUNT(*) FILTER (WHERE status = 'failed') as failed,
                  MAX(started_at) as last_run
           FROM agent_runs
           GROUP BY agent_name
           ORDER BY agent_name"""
    )
    return [dict(r) for r in rows]
