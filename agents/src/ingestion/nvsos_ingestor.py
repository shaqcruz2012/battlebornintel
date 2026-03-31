"""Nevada Secretary of State business entity data ingestion agent."""

import asyncio
import logging
import re
import time
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

import httpx

from ..agents.base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

NVSOS_BASE_URL = "https://esos.nv.gov/EntitySearch"
NVSOS_API_URL = f"{NVSOS_BASE_URL}/OnlineEntitySearch"

USER_AGENT = "BattleBornIntel/1.0 (Nevada Innovation Ecosystem Research)"

# NV SOS rate limit: be conservative (5 requests per minute for government site)
_MAX_REQUESTS_PER_MINUTE = 5
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce conservative rate limit for NV SOS website."""
    now = time.monotonic()
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_MINUTE:
        wait = 60 - (now - _request_timestamps[0])
        if wait > 0:
            logger.info("NV SOS rate limit reached, sleeping %.1f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


def _month_range(year: int, month: int) -> tuple[date, date]:
    """Return (first_day, last_day) for a given year/month."""
    first = date(year, month, 1)
    last = (first + relativedelta(months=1)) - timedelta(days=1)
    return first, last


class NvsosIngestor(BaseModelAgent):
    """Fetches NV Secretary of State business formation/dissolution data.

    Note: The NV SOS may not expose a clean REST API. This ingestor
    attempts to use the search endpoint and falls back to HTML parsing
    if needed. If the page format changes, a warning is logged so
    the data team can investigate.
    """

    def __init__(self):
        super().__init__("nvsos_ingestor", model_version="1.0.0")

    async def run(self, pool, months_back: int = 12, **kwargs):
        """Fetch business formation/dissolution counts and insert into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("NvsosIngestor.run starting (months_back=%d).", months_back)

        # Resolve NV region entity_id from the regions table
        nv_region = await pool.fetchrow(
            "SELECT id FROM regions WHERE UPPER(iso_code) = 'NV' OR UPPER(name) = 'NEVADA' LIMIT 1"
        )
        nv_entity_id = str(nv_region["id"]) if nv_region else "NV"

        today = date.today()
        total_inserted = 0
        monthly_results = {}

        for i in range(months_back):
            target = today - relativedelta(months=i + 1)
            year, month = target.year, target.month
            p_start, p_end = _month_range(year, month)
            month_key = f"{year}-{month:02d}"

            formations = await self._fetch_formation_count(year, month)
            dissolutions = await self._fetch_dissolution_count(year, month)

            if formations is None and dissolutions is None:
                logger.warning(
                    "NV SOS: no data retrieved for %s, skipping", month_key
                )
                monthly_results[month_key] = 0
                continue

            rows = []

            if formations is not None:
                rows.append((
                    "region", nv_entity_id, "business_formations",
                    float(formations), "count", p_start, p_end, "month",
                    self.agent_name, 0.95, True,
                ))

            if dissolutions is not None:
                rows.append((
                    "region", nv_entity_id, "business_dissolutions",
                    float(dissolutions), "count", p_start, p_end, "month",
                    self.agent_name, 0.95, True,
                ))

            # Compute net growth if both values available
            if formations is not None and dissolutions is not None:
                net = formations - dissolutions
                rows.append((
                    "region", nv_entity_id, "net_business_growth",
                    float(net), "count", p_start, p_end, "month",
                    self.agent_name, 0.95, True,
                ))

            if rows:
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
                total_inserted += len(rows)
                monthly_results[month_key] = len(rows)
                logger.info(
                    "NV SOS %s: inserted %d metrics (formations=%s, dissolutions=%s)",
                    month_key, len(rows), formations, dissolutions,
                )

        elapsed = time.perf_counter() - _t0
        logger.info(
            "NV SOS ingestion complete in %.2fs: %d total rows inserted",
            elapsed, total_inserted,
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "months": monthly_results,
            "elapsed_s": round(elapsed, 3),
        }

    async def _fetch_formation_count(self, year: int, month: int) -> int | None:
        """Fetch new business entity filing count for a given month.

        Tries the NV SOS search endpoint. If a structured JSON response
        is unavailable, falls back to parsing the HTML result count.
        """
        return await self._fetch_entity_count(year, month, status="Active")

    async def _fetch_dissolution_count(self, year: int, month: int) -> int | None:
        """Fetch business dissolution count for a given month."""
        return await self._fetch_entity_count(year, month, status="Dissolved")

    async def _fetch_entity_count(
        self, year: int, month: int, status: str
    ) -> int | None:
        """Query NV SOS for entity count by status and date range.

        Attempts a POST to the search endpoint. Falls back to HTML
        parsing if no JSON API is available.
        """
        await _rate_limit()

        p_start, p_end = _month_range(year, month)

        # Attempt structured search via form POST
        form_data = {
            "StartDate": p_start.strftime("%m/%d/%Y"),
            "EndDate": p_end.strftime("%m/%d/%Y"),
            "Status": status,
        }

        max_retries = 2
        retryable_codes = {429, 500, 502, 503}

        async with httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": USER_AGENT},
            follow_redirects=True,
        ) as client:
            for attempt in range(max_retries + 1):
                try:
                    resp = await client.post(
                        NVSOS_API_URL,
                        data=form_data,
                    )
                    resp.raise_for_status()
                    break
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code in retryable_codes and attempt < max_retries:
                        logger.warning(
                            "NV SOS transient error (HTTP %d), retry %d/%d",
                            exc.response.status_code, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "NV SOS API error: %s %s",
                        exc.response.status_code, exc.response.text[:200],
                    )
                    return None
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        logger.warning(
                            "NV SOS request error (%s), retry %d/%d",
                            exc, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error("NV SOS request failed: %s", exc)
                    return None

        content_type = resp.headers.get("content-type", "")

        # Try JSON response first
        if "application/json" in content_type:
            try:
                data = resp.json()
                count = data.get("totalResults") or data.get("count") or data.get("total")
                if count is not None:
                    return int(count)
            except (ValueError, KeyError) as exc:
                logger.warning("NV SOS JSON parse issue: %s", exc)

        # Fall back to HTML parsing
        return self._parse_html_count(resp.text, status, year, month)

    def _parse_html_count(
        self, html: str, status: str, year: int, month: int
    ) -> int | None:
        """Extract result count from NV SOS HTML search results.

        Looks for common patterns like "X results found" or
        "Showing 1-25 of X". Logs a warning if the format is
        unrecognized so the team can update the parser.
        """
        # Pattern 1: "X results found" or "X records found"
        match = re.search(r"([\d,]+)\s+(?:results?|records?)\s+found", html, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))

        # Pattern 2: "Showing 1-25 of X"
        match = re.search(r"of\s+([\d,]+)", html, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))

        # Pattern 3: "Total: X" or "Total Records: X"
        match = re.search(r"Total(?:\s+Records?)?\s*:\s*([\d,]+)", html, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))

        logger.warning(
            "NV SOS: could not parse %s count from HTML for %d-%02d. "
            "The page format may have changed. Review the HTML response "
            "and update the parser accordingly.",
            status, year, month,
        )
        return None
