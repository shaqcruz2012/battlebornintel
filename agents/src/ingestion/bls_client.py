"""BLS QCEW (Quarterly Census of Employment and Wages) API client.

Uses the BLS public QCEW data API to fetch regional employment and wages
data for Nevada regions and industry sectors.

API docs: https://www.bls.gov/cew/about-data/downloadable-file-layouts/quarterly/naics-based-quarterly-layout.htm
QCEW Open Data API: https://data.bls.gov/cew/doc/access/csv_data_slices.htm
"""

import asyncio
import csv
import io
import logging
import os
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# BLS QCEW CSV Data Slices API (no key required)
QCEW_BASE_URL = "https://data.bls.gov/cew/data/api"

# BLS Public Data API v2 (optional key for higher rate limits)
BLS_API_V2_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Rate limiting: 25 requests per 10 seconds (unregistered), 50 with key
RATE_LIMIT_DELAY = 0.5  # seconds between requests (conservative)

# FIPS codes for Nevada regions
AREA_FIPS = {
    "nevada": "32000",        # Nevada statewide
    "clark_county": "32003",  # Clark County (Las Vegas metro)
    "washoe_county": "32031", # Washoe County (Reno-Sparks metro)
}

# Mapping from FIPS to region names matching the regions table
FIPS_TO_REGION_NAME = {
    "32000": "Nevada",
    "32003": "Las Vegas",
    "32031": "Reno-Sparks",
}

# QCEW ownership code: 5 = private, 0 = total (all ownerships)
OWNERSHIP_CODE_TOTAL = "0"
OWNERSHIP_CODE_PRIVATE = "5"

# QCEW size code: 0 = all establishment sizes
SIZE_CODE_ALL = "0"

# Fields we extract from QCEW CSV responses
QCEW_METRIC_FIELDS = {
    "qtrly_estabs": ("bls_establishments", "count"),
    "month3_emplvl": ("bls_employment", "count"),
    "total_qtrly_wages": ("bls_total_quarterly_wages", "usd"),
    "avg_wkly_wage": ("bls_avg_weekly_wage", "usd"),
}


@dataclass
class QCEWRecord:
    """A single QCEW data point."""

    area_fips: str
    industry_code: str
    year: int
    quarter: int
    metric_name: str
    value: float
    unit: str


class BLSQCEWClient:
    """Async client for BLS QCEW data.

    Uses the QCEW CSV Data Slices API which requires no registration.
    Falls back gracefully on errors.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BLS_API_KEY", "")
        self._client: Optional[httpx.AsyncClient] = None
        self._request_count = 0

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                headers={"User-Agent": "BattleBornIntel/1.0 (economic-research)"},
                follow_redirects=True,
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def _rate_limit(self):
        """Simple rate limiter to stay within BLS limits."""
        self._request_count += 1
        if self._request_count > 1:
            await asyncio.sleep(RATE_LIMIT_DELAY)

    async def fetch_area_data(
        self,
        year: int,
        quarter: int,
        area_fips: str,
    ) -> list[QCEWRecord]:
        """Fetch QCEW data for a specific area, year, and quarter.

        Uses the CSV data slices endpoint:
            GET /YEAR/QTR/area/AREA_FIPS.csv

        Returns parsed QCEWRecord list.
        """
        url = f"{QCEW_BASE_URL}/{year}/{quarter}/area/{area_fips}.csv"
        logger.info("Fetching QCEW data: %s", url)

        await self._rate_limit()
        client = await self._get_client()

        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.warning(
                "BLS API HTTP error %s for %s: %s",
                e.response.status_code, url, e,
            )
            return []
        except httpx.RequestError as e:
            logger.warning("BLS API request error for %s: %s", url, e)
            return []

        return self._parse_csv_response(response.text, year, quarter)

    async def fetch_industry_data(
        self,
        year: int,
        quarter: int,
        industry_code: str,
    ) -> list[QCEWRecord]:
        """Fetch QCEW data for a specific industry across all areas.

        Uses the CSV data slices endpoint:
            GET /YEAR/QTR/industry/INDUSTRY_CODE.csv

        Returns parsed QCEWRecord list filtered to Nevada FIPS codes.
        """
        url = f"{QCEW_BASE_URL}/{year}/{quarter}/industry/{industry_code}.csv"
        logger.info("Fetching QCEW industry data: %s", url)

        await self._rate_limit()
        client = await self._get_client()

        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.warning(
                "BLS API HTTP error %s for %s: %s",
                e.response.status_code, url, e,
            )
            return []
        except httpx.RequestError as e:
            logger.warning("BLS API request error for %s: %s", url, e)
            return []

        # Filter to only Nevada area FIPS codes
        nv_fips = set(AREA_FIPS.values())
        records = self._parse_csv_response(response.text, year, quarter)
        return [r for r in records if r.area_fips in nv_fips]

    def _parse_csv_response(
        self, csv_text: str, year: int, quarter: int
    ) -> list[QCEWRecord]:
        """Parse a QCEW CSV response into QCEWRecord objects.

        The CSV has columns like: area_fips, own_code, industry_code,
        agglvl_code, size_code, year, qtr, qtrly_estabs, month3_emplvl,
        total_qtrly_wages, avg_wkly_wage, etc.
        """
        records: list[QCEWRecord] = []

        try:
            reader = csv.DictReader(io.StringIO(csv_text))
        except Exception:
            logger.warning("Failed to parse BLS CSV response")
            return records

        for row in reader:
            # Skip rows that are not "all sizes" or have missing data
            area_fips = (row.get("area_fips") or "").strip().strip('"')
            industry_code = (row.get("industry_code") or "").strip().strip('"')
            own_code = (row.get("own_code") or "").strip().strip('"')

            # Only take total ownership (all) rows to avoid double-counting
            if own_code != OWNERSHIP_CODE_TOTAL:
                continue

            for csv_field, (metric_name, unit) in QCEW_METRIC_FIELDS.items():
                raw_value = (row.get(csv_field) or "").strip().strip('"')
                if not raw_value or raw_value in ("", "0"):
                    # Skip zero/empty values (BLS uses 0 for suppressed data)
                    continue
                try:
                    value = float(raw_value)
                except (ValueError, TypeError):
                    continue

                # Skip suppressed/zero values
                if value == 0:
                    continue

                records.append(
                    QCEWRecord(
                        area_fips=area_fips,
                        industry_code=industry_code,
                        year=year,
                        quarter=quarter,
                        metric_name=metric_name,
                        value=value,
                        unit=unit,
                    )
                )

        logger.info("Parsed %d QCEW records from CSV", len(records))
        return records

    async def fetch_region_totals(
        self, year: int, quarter: int
    ) -> list[QCEWRecord]:
        """Fetch total (all-industry) QCEW data for all Nevada regions.

        Returns records with industry_code '10' (total, all industries).
        """
        all_records: list[QCEWRecord] = []
        for region_name, fips in AREA_FIPS.items():
            records = await self.fetch_area_data(year, quarter, fips)
            # Filter to total all industries (industry_code '10')
            total_records = [
                r for r in records if r.industry_code == "10"
            ]
            logger.info(
                "Region %s (%s): %d total-industry records",
                region_name, fips, len(total_records),
            )
            all_records.extend(total_records)
        return all_records

    async def fetch_sector_data_for_regions(
        self,
        year: int,
        quarter: int,
        naics_codes: list[str],
    ) -> list[QCEWRecord]:
        """Fetch QCEW data for specific NAICS codes across Nevada regions.

        Fetches area-level data for each Nevada region and filters to the
        requested NAICS industry codes.
        """
        all_records: list[QCEWRecord] = []
        naics_set = set(naics_codes)

        for region_name, fips in AREA_FIPS.items():
            records = await self.fetch_area_data(year, quarter, fips)
            sector_records = [
                r for r in records if r.industry_code in naics_set
            ]
            logger.info(
                "Region %s (%s): %d sector records for NAICS %s",
                region_name, fips, len(sector_records), naics_codes,
            )
            all_records.extend(sector_records)
        return all_records
