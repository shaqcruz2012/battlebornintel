"""Data freshness checker — flags stale company records."""

from ..agents.base_agent import BaseAgent


class FreshnessChecker(BaseAgent):
    """Identifies companies with stale data (>30 days since update)."""

    def __init__(self):
        super().__init__("freshness_checker")

    async def run(self, pool, days_threshold: int = 30):
        rows = await pool.fetch(
            """SELECT id, name, updated_at,
                      EXTRACT(DAY FROM NOW() - updated_at) as days_stale
               FROM companies
               WHERE updated_at < NOW() - INTERVAL '1 day' * $1
               ORDER BY updated_at ASC""",
            days_threshold,
        )

        stale = [
            {
                "id": r["id"],
                "name": r["name"],
                "days_stale": int(r["days_stale"]),
                "updated_at": str(r["updated_at"]),
            }
            for r in rows
        ]

        if stale:
            await self.save_analysis(
                pool,
                analysis_type="freshness_report",
                content={"stale_companies": stale, "threshold_days": days_threshold},
            )

        return {"stale_count": len(stale), "threshold": days_threshold}
