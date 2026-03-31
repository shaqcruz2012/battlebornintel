"""Census ACS (American Community Survey) data ingestion agent."""

import asyncio
import logging
import os
import time
from datetime import date
from typing import Optional

import httpx

from ..agents.base_model_agent import BaseModelAgent
from ..config import ROOT

logger = logging.getLogger(__name__)

CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
if not CENSUS_API_KEY:
    logger.warning("CENSUS_API_KEY is not set — Census ingestion will be skipped")

CENSUS_BASE_URL = "https://api.census.gov/data"

# Nevada FIPS codes
STATE_FIPS = "32"
COUNTY_FIPS = {
    "32003": "NV-Clark",     # Clark County (Las Vegas)
    "32031": "NV-Washoe",    # Washoe County (Reno)
}

# ACS 5-year variable definitions
# Simple variables (single field)
SIMPLE_VARIABLES = {
    "B01003_001E": "population",
    "B19013_001E": "median_household_income",
    "B25001_001E": "housing_units",
}

# Computed variables (ratios requiring multiple fields)
# poverty_rate = B17001_002E / B17001_001E
# bachelors_degree_pct = (B15003_022E + B15003_023E + B15003_024E + B15003_025E) / B15003_001E
RATIO_VARIABLES = {
    "poverty_rate": {
        "numerator": ["B17001_002E"],
        "denominator": "B17001_001E",
        "unit": "percent",
    },
    "bachelors_degree_pct": {
        "numerator": ["B15003_022E", "B15003_023E", "B15003_024E", "B15003_025E"],
        "denominator": "B15003_001E",
        "unit": "percent",
    },
}

# All raw ACS variable codes we need to fetch
ALL_VARIABLE_CODES = list(SIMPLE_VARIABLES.keys()) + [
    "B17001_001E", "B17001_002E",
    "B15003_001E", "B15003_022E", "B15003_023E", "B15003_024E", "B15003_025E",
]

UNITS = {
    "population": "count",
    "median_household_income": "usd",
    "housing_units": "count",
    "poverty_rate": "percent",
    "bachelors_degree_pct": "percent",
}

# Census API rate limit: ~500 requests/day, be conservative
_MAX_REQUESTS_PER_MINUTE = 20
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce conservative Census API rate limiting."""
    now = time.monotonic()
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_MINUTE:
        wait = 60 - (now - _request_timestamps[0])
        if wait > 0:
            logger.info("Census rate limit reached, sleeping %.1f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


class CensusIngestor(BaseModelAgent):
    """Fetches ACS 5-year estimates and stores them in metric_snapshots."""

    def __init__(self):
        super().__init__("census_ingestor", model_version="1.0.0")
        self.api_key = CENSUS_API_KEY

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def _fetch_acs(
        self,
        year: int,
        geo: str,
        geo_filter: Optional[str] = None,
    ) -> list[dict]:
        """Fetch ACS 5-year data for a given geography.

        Args:
            year: ACS vintage year (e.g. 2022 for 2018-2022 estimates).
            geo: Geography specification (e.g. "state:32", "county:003").
            geo_filter: Optional geo filter (e.g. "state:32" for county queries).

        Returns list of dicts with variable values keyed by variable code.
        """
        await _rate_limit()

        variables = ",".join(ALL_VARIABLE_CODES)
        params = {
            "get": f"NAME,{variables}",
            "for": geo,
            "key": self.api_key,
        }
        if geo_filter:
            params["in"] = geo_filter

        url = f"{CENSUS_BASE_URL}/{year}/acs/acs5"
        max_retries = 2
        retryable_codes = {429, 500, 502, 503}

        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(max_retries + 1):
                try:
                    resp = await client.get(url, params=params)
                    resp.raise_for_status()
                    break
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code in retryable_codes and attempt < max_retries:
                        logger.warning(
                            "Census API transient error (HTTP %d), retry %d/%d",
                            exc.response.status_code,
                            attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "Census API error: %s %s",
                        exc.response.status_code,
                        exc.response.text[:200],
                    )
                    return []
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        logger.warning(
                            "Census request error (%s), retry %d/%d",
                            exc, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error("Census request failed: %s", exc)
                    return []

        data = resp.json()
        if len(data) < 2:
            return []

        headers = data[0]
        results = []
        for row in data[1:]:
            record = dict(zip(headers, row))
            results.append(record)

        return results

    def _extract_metrics(self, record: dict) -> dict[str, Optional[float]]:
        """Extract named metrics from a raw Census API record.

        Returns dict mapping metric_name -> value (float or None).
        """
        metrics: dict[str, Optional[float]] = {}

        # Simple variables
        for var_code, metric_name in SIMPLE_VARIABLES.items():
            raw = record.get(var_code)
            try:
                metrics[metric_name] = float(raw)
            except (ValueError, TypeError):
                metrics[metric_name] = None

        # Ratio variables
        for metric_name, spec in RATIO_VARIABLES.items():
            try:
                numerator = sum(
                    float(record.get(v, 0)) for v in spec["numerator"]
                )
                denominator = float(record.get(spec["denominator"], 0))
                if denominator > 0:
                    metrics[metric_name] = round(
                        (numerator / denominator) * 100, 2
                    )
                else:
                    metrics[metric_name] = None
            except (ValueError, TypeError):
                metrics[metric_name] = None

        return metrics

    async def run(self, pool, years_back: int = 3, **kwargs):
        """Fetch ACS 5-year estimates for Nevada regions and insert into metric_snapshots."""
        _t0 = time.perf_counter()
        logger.info("CensusIngestor.run starting (years_back=%d).", years_back)

        if not self.available:
            logger.warning("CENSUS_API_KEY not configured — skipping Census ingestion")
            return {"status": "skipped", "reason": "no_api_key"}

        current_year = date.today().year
        # ACS 5-year data typically released ~1 year after reference year
        # Try recent vintage years
        vintage_years = list(range(current_year - years_back - 1, current_year))

        total_inserted = 0
        year_results = {}

        for year in vintage_years:
            year_inserted = 0

            # Fetch state-level data (Nevada)
            try:
                state_data = await self._fetch_acs(
                    year, geo=f"state:{STATE_FIPS}"
                )
            except Exception as exc:
                logger.error("Census state fetch failed for %d: %s", year, exc)
                state_data = []

            if state_data:
                rows = self._build_rows(state_data[0], "NV", year)
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
                    year_inserted += len(rows)

            # Fetch county-level data
            try:
                county_data = await self._fetch_acs(
                    year,
                    geo="county:*",
                    geo_filter=f"state:{STATE_FIPS}",
                )
            except Exception as exc:
                logger.error("Census county fetch failed for %d: %s", year, exc)
                county_data = []

            for record in county_data:
                state_code = record.get("state", "")
                county_code = record.get("county", "")
                fips = f"{state_code}{county_code}"

                if fips not in COUNTY_FIPS:
                    continue

                entity_id = COUNTY_FIPS[fips]
                rows = self._build_rows(record, entity_id, year)
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
                    year_inserted += len(rows)

            year_results[year] = year_inserted
            total_inserted += year_inserted
            logger.info("Census ACS %d: inserted %d data points", year, year_inserted)

        elapsed = time.perf_counter() - _t0
        logger.info(
            "Census ingestion complete in %.2fs: %d total new data points",
            elapsed, total_inserted,
        )
        return {
            "status": "completed",
            "total_inserted": total_inserted,
            "years": year_results,
            "elapsed_s": round(elapsed, 3),
        }

    def _build_rows(
        self, record: dict, entity_id: str, year: int
    ) -> list[tuple]:
        """Build metric_snapshots rows from a Census API record."""
        metrics = self._extract_metrics(record)
        period_start = date(year, 1, 1)
        period_end = date(year, 12, 31)

        rows = []
        for metric_name, value in metrics.items():
            if value is None:
                continue
            rows.append((
                "region",
                entity_id,
                f"acs_{metric_name}",
                value,
                UNITS.get(metric_name, "unknown"),
                period_start,
                period_end,
                "year",
                self.agent_name,
                0.98,
                True,
            ))
        return rows
