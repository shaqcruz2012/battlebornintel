"""SEC EDGAR filing data ingestion agent."""

import asyncio
import logging
import time
from datetime import date, timedelta
from typing import Optional

import httpx

from ..agents.base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

EDGAR_SEARCH_URL = "https://efts.sec.gov/LATEST/search-index"
EDGAR_FULLTEXT_URL = "https://efts.sec.gov/LATEST/search"
EDGAR_COMPANY_URL = "https://data.sec.gov/submissions"

# Required by SEC — must identify your application
SEC_USER_AGENT = "BattleBornIntel admin@battlebornintel.com"

# Filing types to track
FILING_TYPES = ["10-K", "10-Q", "8-K"]
FORM4_TYPE = "4"

# Nevada-connected public companies to track (CIK numbers)
# These are well-known Nevada-incorporated or Nevada-HQ'd public companies
NEVADA_COMPANIES = {
    "1318605": {"name": "Tesla Inc", "entity_id": "x_tesla"},
    "1001039": {"name": "MGM Resorts International", "entity_id": "x_mgm"},
    "1524358": {"name": "Wynn Resorts", "entity_id": "x_wynn"},
    "858339": {"name": "Las Vegas Sands", "entity_id": "x_lvs"},
    "1370946": {"name": "Caesars Entertainment", "entity_id": "x_caesars"},
    "1060349": {"name": "Switch Inc", "entity_id": "x_switch"},
    "811156": {"name": "Southwest Gas Holdings", "entity_id": "x_swgas"},
    "1528396": {"name": "Allegiant Travel", "entity_id": "x_allegiant"},
    "1590895": {"name": "International Game Technology", "entity_id": "x_igt"},
    "1575515": {"name": "Full House Resorts", "entity_id": "x_fhr"},
}

# SEC EDGAR rate limit: 10 requests per second
_MAX_REQUESTS_PER_SECOND = 10
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce SEC EDGAR's 10 requests/second rate limit."""
    now = time.monotonic()
    while _request_timestamps and _request_timestamps[0] < now - 1.0:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_SECOND:
        wait = 1.0 - (now - _request_timestamps[0])
        if wait > 0:
            logger.debug("SEC rate limit reached, sleeping %.2f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


class SecIngestor(BaseModelAgent):
    """Fetches SEC EDGAR filing data and stores counts in metric_snapshots."""

    def __init__(self):
        super().__init__("sec_ingestor", model_version="1.0.0")

    async def _fetch_company_filings(
        self,
        client: httpx.AsyncClient,
        cik: str,
    ) -> Optional[dict]:
        """Fetch filing history for a company from SEC EDGAR.

        Args:
            client: Shared httpx client with proper headers.
            cik: SEC Central Index Key (zero-padded to 10 digits).

        Returns parsed JSON response or None on error.
        """
        await _rate_limit()

        padded_cik = cik.zfill(10)
        url = f"{EDGAR_COMPANY_URL}/CIK{padded_cik}.json"

        max_retries = 2
        retryable_codes = {429, 500, 502, 503}

        for attempt in range(max_retries + 1):
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as exc:
                if exc.response.status_code in retryable_codes and attempt < max_retries:
                    logger.warning(
                        "SEC API transient error for CIK %s (HTTP %d), retry %d/%d",
                        cik, exc.response.status_code,
                        attempt + 1, max_retries,
                    )
                    await asyncio.sleep(2 * (attempt + 1))
                    continue
                logger.error(
                    "SEC API error for CIK %s: %s %s",
                    cik, exc.response.status_code,
                    exc.response.text[:200],
                )
                return None
            except httpx.RequestError as exc:
                if attempt < max_retries:
                    logger.warning(
                        "SEC request error for CIK %s (%s), retry %d/%d",
                        cik, exc, attempt + 1, max_retries,
                    )
                    await asyncio.sleep(2 * (attempt + 1))
                    continue
                logger.error("SEC request failed for CIK %s: %s", cik, exc)
                return None

        return None

    def _count_filings(
        self,
        submissions: dict,
        form_types: list[str],
        since_date: date,
    ) -> int:
        """Count filings of specified types since a given date.

        Parses the SEC EDGAR submissions JSON structure which contains
        recent filings in submissions['filings']['recent'].
        """
        recent = submissions.get("filings", {}).get("recent", {})
        forms = recent.get("form", [])
        filing_dates = recent.get("filingDate", [])

        if not forms or not filing_dates:
            return 0

        count = 0
        since_str = since_date.isoformat()
        for form, filed in zip(forms, filing_dates):
            if form in form_types and filed >= since_str:
                count += 1

        return count

    async def run(self, pool, lookback_days: int = 90, **kwargs):
        """Fetch SEC EDGAR filings for Nevada companies and insert counts into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("SecIngestor.run starting (lookback_days=%d).", lookback_days)

        since_date = date.today() - timedelta(days=lookback_days)
        period_start = since_date
        period_end = date.today()

        total_inserted = 0
        company_results = {}

        headers = {
            "User-Agent": SEC_USER_AGENT,
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            for cik, info in NEVADA_COMPANIES.items():
                entity_id = info["entity_id"]
                company_name = info["name"]

                submissions = await self._fetch_company_filings(client, cik)
                if submissions is None:
                    company_results[entity_id] = {"status": "error"}
                    continue

                rows = []

                # Count standard filings (10-K, 10-Q, 8-K)
                for form_type in FILING_TYPES:
                    count = self._count_filings(
                        submissions, [form_type], since_date
                    )
                    rows.append((
                        "corporation",
                        entity_id,
                        f"sec_filing_count_{form_type.lower().replace('-', '')}",
                        float(count),
                        "count",
                        period_start,
                        period_end,
                        "quarter",
                        self.agent_name,
                        0.99,
                        True,
                    ))

                # Count Form 4 insider transactions
                form4_count = self._count_filings(
                    submissions, [FORM4_TYPE], since_date
                )
                rows.append((
                    "corporation",
                    entity_id,
                    "sec_form4_insider_transactions",
                    float(form4_count),
                    "count",
                    period_start,
                    period_end,
                    "quarter",
                    self.agent_name,
                    0.99,
                    True,
                ))

                # Total filing count across all types
                total_count = self._count_filings(
                    submissions, FILING_TYPES + [FORM4_TYPE], since_date
                )
                rows.append((
                    "corporation",
                    entity_id,
                    "sec_total_filing_count",
                    float(total_count),
                    "count",
                    period_start,
                    period_end,
                    "quarter",
                    self.agent_name,
                    0.99,
                    True,
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
                company_results[entity_id] = {
                    "name": company_name,
                    "filings_inserted": inserted,
                }
                total_inserted += inserted
                logger.info(
                    "SEC %s (%s): inserted %d metric rows",
                    company_name, entity_id, inserted,
                )

        elapsed = time.perf_counter() - _t0
        logger.info(
            "SEC ingestion complete in %.2fs: %d total metric rows for %d companies",
            elapsed, total_inserted, len(NEVADA_COMPANIES),
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "companies": company_results,
            "elapsed_s": round(elapsed, 3),
        }
