"""FRED macro-economic data ingestion agent."""

import logging
import time
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

from ..agents.base_model_agent import BaseModelAgent
from .fred_client import FredClient, FRED_SERIES

logger = logging.getLogger(__name__)


def _period_end(obs_date: date, granularity: str) -> date:
    """Compute period_end from a date and granularity."""
    if granularity == "day":
        return obs_date
    elif granularity == "week":
        return obs_date + timedelta(days=6)
    elif granularity == "month":
        return (obs_date + relativedelta(months=1)) - timedelta(days=1)
    elif granularity == "quarter":
        return (obs_date + relativedelta(months=3)) - timedelta(days=1)
    elif granularity == "year":
        return (obs_date + relativedelta(years=1)) - timedelta(days=1)
    else:
        return obs_date


class FredIngestor(BaseModelAgent):
    """Fetches FRED macro-economic series and stores them in metric_snapshots."""

    def __init__(self):
        super().__init__("fred_ingestor", model_version="1.0.0")
        self.client = FredClient()

    async def run(self, pool, years_back: int = 5, **kwargs):
        """Fetch all configured FRED series and insert into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("FredIngestor.run starting (years_back=%d).", years_back)

        if not self.client.available:
            logger.warning("FRED_API_KEY not configured — skipping FRED ingestion")
            return {"status": "skipped", "reason": "no_api_key"}

        end_date = date.today()
        start_date = end_date - relativedelta(years=years_back)

        total_inserted = 0
        series_results = {}

        for series_id, (entity_type, entity_id, granularity, unit) in FRED_SERIES.items():
            observations = await self.client.fetch_series(series_id, start_date, end_date)

            if not observations:
                series_results[series_id] = 0
                continue

            rows = []
            for obs in observations:
                obs_date = date.fromisoformat(obs["date"])
                p_end = _period_end(obs_date, granularity)
                rows.append((
                    entity_type, entity_id, series_id.lower(),
                    obs["value"], unit, obs_date, p_end, granularity,
                    self.agent_name, 1.0, True,
                ))

            await pool.executemany(
                """INSERT INTO metric_snapshots
                   (entity_type, entity_id, metric_name, value, unit,
                    period_start, period_end, granularity, agent_id,
                    confidence, verified)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                   ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
                   DO NOTHING""",
                rows,
            )
            inserted = len(rows)

            series_results[series_id] = inserted
            total_inserted += inserted
            logger.info(
                "FRED %s: inserted %d new data points", series_id, inserted
            )

        elapsed = time.perf_counter() - _t0
        logger.info(
            "FRED ingestion complete in %.2fs: %d total new data points",
            elapsed, total_inserted,
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "series": series_results,
            "elapsed_s": round(elapsed, 3),
        }
