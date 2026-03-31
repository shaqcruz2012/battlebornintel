"""NSF HERD (Higher Education R&D) Survey data ingestion agent."""

import asyncio
import logging
import time
from datetime import date

import httpx

from ..agents.base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

NCSES_API_BASE = "https://ncsesdata.nsf.gov/ids/api"

USER_AGENT = "BattleBornIntel/1.0 (Nevada Innovation Ecosystem Research)"

# HERD survey institution mappings
# unitid is the IPEDS unit ID used by NCSES
UNIVERSITY_CONFIG = {
    "UNR": {
        "name": "University of Nevada, Reno",
        "unitid": "182290",
    },
    "UNLV": {
        "name": "University of Nevada, Las Vegas",
        "unitid": "182281",
    },
}

# Metrics to fetch from HERD survey data
# (metric_name, herd_field_key, unit)
HERD_METRICS = [
    ("total_rd_expenditures", "total_rd", "usd_thousands"),
    ("federal_rd_expenditures", "federal_rd", "usd_thousands"),
    ("nonfederal_rd_expenditures", "nonfederal_rd", "usd_thousands"),
]

# NCSES rate limit: be conservative (10 requests per minute)
_MAX_REQUESTS_PER_MINUTE = 10
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce conservative rate limit for NCSES API."""
    now = time.monotonic()
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_MINUTE:
        wait = 60 - (now - _request_timestamps[0])
        if wait > 0:
            logger.info("NCSES rate limit reached, sleeping %.1f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


class NsfIngestor(BaseModelAgent):
    """Fetches NSF HERD survey R&D expenditure data for Nevada universities."""

    def __init__(self):
        super().__init__("nsf_ingestor", model_version="1.0.0")

    async def run(self, pool, years_back: int = 10, **kwargs):
        """Fetch HERD data and insert into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("NsfIngestor.run starting (years_back=%d).", years_back)

        end_year = date.today().year
        start_year = end_year - years_back

        total_inserted = 0
        results_summary = {}

        for entity_id, config in UNIVERSITY_CONFIG.items():
            uni_rows = await self._fetch_herd_data(
                entity_id, config, start_year, end_year
            )

            if not uni_rows:
                results_summary[entity_id] = 0
                continue

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
            results_summary[entity_id] = len(uni_rows)
            total_inserted += len(uni_rows)
            logger.info(
                "NSF HERD %s: inserted %d data points", entity_id, len(uni_rows)
            )

            # Update universities.research_budget_m with latest total R&D value
            await self._update_research_budget(pool, entity_id, uni_rows)

        elapsed = time.perf_counter() - _t0
        logger.info(
            "NSF HERD ingestion complete in %.2fs: %d total rows inserted",
            elapsed, total_inserted,
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "details": results_summary,
            "elapsed_s": round(elapsed, 3),
        }

    async def _fetch_herd_data(
        self, entity_id: str, config: dict,
        start_year: int, end_year: int,
    ) -> list[tuple]:
        """Fetch HERD survey data for a single institution."""
        await _rate_limit()

        params = {
            "unitid": config["unitid"],
            "survey": "herd",
            "start_year": str(start_year),
            "end_year": str(end_year),
        }

        max_retries = 2
        retryable_codes = {429, 500, 502, 503}
        data = None

        async with httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            for attempt in range(max_retries + 1):
                try:
                    resp = await client.get(
                        f"{NCSES_API_BASE}/herd/institution",
                        params=params,
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    break
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code in retryable_codes and attempt < max_retries:
                        logger.warning(
                            "NCSES API transient error for %s (HTTP %d), retry %d/%d",
                            entity_id, exc.response.status_code,
                            attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "NCSES API error for %s: %s %s",
                        entity_id, exc.response.status_code,
                        exc.response.text[:200],
                    )
                    return []
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        logger.warning(
                            "NCSES request error for %s (%s), retry %d/%d",
                            entity_id, exc, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "NCSES request failed for %s: %s", entity_id, exc
                    )
                    return []

        if not data:
            return []

        # Parse response: expect a list of yearly records
        records = data if isinstance(data, list) else data.get("data", [])
        rows = []

        for record in records:
            year = record.get("year") or record.get("fiscal_year")
            if year is None:
                continue
            year = int(year)
            if year < start_year or year > end_year:
                continue

            p_start = date(year, 1, 1)
            p_end = date(year, 12, 31)

            for metric_name, herd_key, unit in HERD_METRICS:
                value = record.get(herd_key)
                if value is None:
                    continue
                try:
                    value = float(value)
                except (ValueError, TypeError):
                    continue

                rows.append((
                    "university", entity_id, metric_name,
                    value, unit, p_start, p_end, "year",
                    self.agent_name, 0.98, True,
                ))

        logger.info(
            "NCSES HERD %s: fetched %d data points across %d years",
            entity_id, len(rows), len(set(r[5].year for r in rows)) if rows else 0,
        )
        return rows

    async def _update_research_budget(
        self, pool, entity_id: str, rows: list[tuple]
    ):
        """Update universities.research_budget_m with the latest total_rd value."""
        # Filter to total_rd_expenditures rows and find the latest year
        total_rd_rows = [r for r in rows if r[2] == "total_rd_expenditures"]
        if not total_rd_rows:
            return

        # Sort by period_start descending to get latest
        latest = max(total_rd_rows, key=lambda r: r[5])
        value_thousands = latest[3]
        # Convert from thousands to millions
        value_millions = value_thousands / 1000.0

        uni_name = UNIVERSITY_CONFIG[entity_id]["name"]
        result = await pool.execute(
            """UPDATE universities
               SET research_budget_m = $1
               WHERE name ILIKE $2""",
            value_millions,
            f"%{uni_name}%",
        )
        logger.info(
            "Updated research_budget_m for %s to %.2fM: %s",
            entity_id, value_millions, result,
        )
