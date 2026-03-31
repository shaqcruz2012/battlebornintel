"""USPTO patent data ingestion agent via PatentsView API."""

import asyncio
import logging
import time
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

import httpx

from ..agents.base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

PATENTSVIEW_BASE_URL = "https://api.patentsview.org/patents/query"

USER_AGENT = "BattleBornIntel/1.0 (Nevada Innovation Ecosystem Research)"

# Mapping of university names to entity_ids used in metric_snapshots
UNIVERSITY_ASSIGNEES = {
    "University of Nevada, Reno": "UNR",
    "Board of Regents of the Nevada System of Higher Education": "UNR",
    "University of Nevada, Las Vegas": "UNLV",
}

# PatentsView rate limit: 45 requests per minute
_MAX_REQUESTS_PER_MINUTE = 45
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce PatentsView rate limit."""
    now = time.monotonic()
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_MINUTE:
        wait = 60 - (now - _request_timestamps[0])
        if wait > 0:
            logger.info("PatentsView rate limit reached, sleeping %.1f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


def _period_for_year(year: int) -> tuple[date, date]:
    """Return (period_start, period_end) for a calendar year."""
    return date(year, 1, 1), date(year, 12, 31)


class UsptoIngestor(BaseModelAgent):
    """Fetches USPTO patent data for Nevada and stores counts in metric_snapshots."""

    def __init__(self):
        super().__init__("uspto_ingestor", model_version="1.0.0")

    async def run(self, pool, years_back: int = 5, **kwargs):
        """Fetch Nevada patent grants/applications and insert into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("UsptoIngestor.run starting (years_back=%d).", years_back)

        end_year = date.today().year
        start_year = end_year - years_back

        total_inserted = 0
        results_summary = {}

        # 1. Fetch state-level NV patent grants by year
        nv_rows = await self._fetch_state_patents(start_year, end_year)
        if nv_rows:
            await pool.executemany(
                """INSERT INTO metric_snapshots
                   (entity_type, entity_id, metric_name, value, unit,
                    period_start, period_end, granularity, agent_id,
                    confidence, verified)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                   ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
                   DO NOTHING""",
                nv_rows,
            )
            total_inserted += len(nv_rows)
            results_summary["state_level"] = len(nv_rows)

        # 2. Fetch university-level patent counts
        for assignee_name, entity_id in UNIVERSITY_ASSIGNEES.items():
            uni_rows = await self._fetch_assignee_patents(
                assignee_name, entity_id, start_year, end_year
            )
            if uni_rows:
                await pool.executemany(
                    """INSERT INTO metric_snapshots
                       (entity_type, entity_id, metric_name, value, unit,
                        period_start, period_end, granularity, agent_id,
                        confidence, verified)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                       ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
                       DO NOTHING""",
                    uni_rows,
                )
                total_inserted += len(uni_rows)
                results_summary[f"university_{entity_id}"] = len(uni_rows)

        elapsed = time.perf_counter() - _t0
        logger.info(
            "USPTO ingestion complete in %.2fs: %d total rows inserted",
            elapsed, total_inserted,
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "details": results_summary,
            "elapsed_s": round(elapsed, 3),
        }

    async def _fetch_state_patents(
        self, start_year: int, end_year: int
    ) -> list[tuple]:
        """Fetch patent grant counts for Nevada by year."""
        rows = []
        for year in range(start_year, end_year + 1):
            count = await self._query_patent_count(
                {"_and": [
                    {"inventor_state": "NV"},
                    {"patent_date": f"{year}-01-01:{year}-12-31"},
                ]}
            )
            if count is not None:
                p_start, p_end = _period_for_year(year)
                rows.append((
                    "region", "NV", "patent_grants",
                    float(count), "count", p_start, p_end, "year",
                    self.agent_name, 0.95, True,
                ))
                logger.info("NV patent_grants %d: %d", year, count)
        return rows

    async def _fetch_assignee_patents(
        self, assignee_name: str, entity_id: str,
        start_year: int, end_year: int,
    ) -> list[tuple]:
        """Fetch patent grant counts for a specific assignee by year."""
        rows = []
        for year in range(start_year, end_year + 1):
            count = await self._query_patent_count(
                {"_and": [
                    {"assignee_organization": assignee_name},
                    {"patent_date": f"{year}-01-01:{year}-12-31"},
                ]}
            )
            if count is not None:
                p_start, p_end = _period_for_year(year)
                rows.append((
                    "university", entity_id, "patent_grants",
                    float(count), "count", p_start, p_end, "year",
                    self.agent_name, 0.95, True,
                ))
                logger.info(
                    "%s patent_grants %d: %d", entity_id, year, count
                )
        return rows

    async def _query_patent_count(self, query_filter: dict) -> int | None:
        """Query PatentsView API and return total_patent_count, or None on error."""
        await _rate_limit()

        payload = {
            "q": query_filter,
            "f": ["patent_number"],
            "o": {"per_page": 1},
        }

        max_retries = 2
        retryable_codes = {429, 500, 502, 503}

        async with httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            for attempt in range(max_retries + 1):
                try:
                    resp = await client.post(PATENTSVIEW_BASE_URL, json=payload)
                    resp.raise_for_status()
                    break
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code in retryable_codes and attempt < max_retries:
                        logger.warning(
                            "PatentsView transient error (HTTP %d), retry %d/%d",
                            exc.response.status_code, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "PatentsView API error: %s %s",
                        exc.response.status_code, exc.response.text[:200],
                    )
                    return None
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        logger.warning(
                            "PatentsView request error (%s), retry %d/%d",
                            exc, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error("PatentsView request failed: %s", exc)
                    return None

        data = resp.json()
        return data.get("total_patent_count", 0)
