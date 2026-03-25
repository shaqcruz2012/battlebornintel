"""Node rotation scheduler — ensures all entities are queried within a 7-day window.

697 entities / 7 days = ~100 entities per day.
Entities are ordered by least-recently-queried so stale nodes are prioritised.
"""

from ..db import get_pool

# 697 entities / 7 days = ~100 entities per day
DAILY_BATCH_SIZE = 100


async def get_next_batch(batch_size=DAILY_BATCH_SIZE):
    """Get the next batch of entities to query, ordered by least-recently-queried."""
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT canonical_id, entity_type, label, confidence, verified, last_queried_at
           FROM entity_registry
           ORDER BY last_queried_at ASC NULLS FIRST, confidence ASC NULLS FIRST
           LIMIT $1""",
        batch_size,
    )
    return [dict(r) for r in rows]


async def get_rotation_stats():
    """Get stats on rotation coverage."""
    pool = await get_pool()
    stats = await pool.fetchrow("""
        SELECT
            count(*) AS total,
            count(last_queried_at) AS ever_queried,
            count(CASE WHEN last_queried_at > NOW() - INTERVAL '7 days' THEN 1 END) AS queried_this_week,
            count(CASE WHEN last_queried_at > NOW() - INTERVAL '1 day' THEN 1 END) AS queried_today,
            min(last_queried_at) AS oldest_query,
            max(last_queried_at) AS newest_query
        FROM entity_registry
    """)
    return dict(stats)
