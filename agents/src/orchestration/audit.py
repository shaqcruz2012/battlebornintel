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


async def compute_agent_metrics(pool, days=7):
    """Compute agent performance metrics for the last N days."""
    rows = await pool.fetch(
        """SELECT agent_name AS agent_type,
               COUNT(*) AS total_runs,
               COUNT(*) FILTER (WHERE status = 'completed') AS successful,
               COUNT(*) FILTER (WHERE status = 'failed') AS failed,
               COUNT(*) FILTER (WHERE error_message LIKE '%%timed out%%') AS timed_out,
               AVG(duration_ms)::int AS avg_duration_ms,
               PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::int AS p95_duration_ms
        FROM agent_runs
        WHERE started_at >= NOW() - ($1 || ' days')::interval
        GROUP BY agent_name
        ORDER BY agent_name
    """, str(days))
    return [dict(r) for r in rows]


async def get_unresolved_dead_letters(pool, limit=50):
    """Fetch unresolved dead letter entries."""
    rows = await pool.fetch(
        """SELECT id, agent_type, error_message, error_class, attempts,
                  first_failed_at, last_failed_at, input_params
           FROM agent_dead_letters
           WHERE resolved = FALSE
           ORDER BY last_failed_at DESC
           LIMIT $1""",
        limit
    )
    return [dict(r) for r in rows]
