"""Lightweight async FRED API client."""

import asyncio
import logging
import time
from datetime import date
from typing import Optional

import httpx

from ..config import FRED_API_KEY

logger = logging.getLogger(__name__)

FRED_BASE_URL = "https://api.stlouisfed.org/fred"

# Series definitions: series_id -> (entity_type, entity_id, granularity, unit)
# All series are publicly available via FRED (Federal Reserve Economic Data).
# See https://fred.stlouisfed.org/ for documentation.
FRED_SERIES = {
    # ── Existing series ──────────────────────────────────────────
    "FEDFUNDS": ("macro", "US", "month", "percent"),       # Federal Funds Effective Rate
    "UNRATE": ("macro", "US", "month", "percent"),          # US Unemployment Rate
    "NVURN": ("region", "NV", "month", "percent"),          # Nevada Unemployment Rate
    "GDPC1": ("macro", "US", "quarter", "usd_billions"),    # Real GDP
    "NVRGSP": ("region", "NV", "year", "usd_millions"),     # Nevada Real GSP
    "DFF": ("macro", "US", "day", "percent"),               # Daily Federal Funds Rate
    "T10Y2Y": ("macro", "US", "day", "percent"),            # 10Y-2Y Treasury Spread
    "CPIAUCSL": ("macro", "US", "month", "index"),          # CPI All Urban Consumers
    "ICSA": ("macro", "US", "week", "count"),               # Initial Jobless Claims

    # ── P0-6 Expansion: Nevada-specific + venture/innovation ─────
    "NVNA": ("region", "NV", "month", "count"),             # Nevada All Employees (Total Nonfarm)
    "NVCONS": ("region", "NV", "month", "count"),           # Nevada Construction Employment
    "NVINFO": ("region", "NV", "month", "count"),           # Nevada Information Sector Employment
    "NVPBSV": ("region", "NV", "month", "count"),           # Nevada Professional & Business Services
    "LAUCN320030000000005": ("region", "NV-Clark", "month", "percent"),  # Clark County Unemployment
    "LAUCN320310000000005": ("region", "NV-Washoe", "month", "percent"),  # Washoe County Unemployment
    "PERMIT": ("macro", "US", "month", "count"),            # New Private Housing Permits (US)
    "NVBPPRIVSA": ("region", "NV", "month", "count"),       # Nevada Building Permits (Private Housing)
    "BAAFFM": ("macro", "US", "month", "percent"),          # BAA Corporate Bond Spread (credit risk)
    "VIXCLS": ("macro", "US", "day", "index"),              # CBOE Volatility Index (VIX)
}

# FRED rate limit: 120 requests per minute
_MAX_REQUESTS_PER_MINUTE = 120
_request_timestamps: list[float] = []


async def _rate_limit():
    """Enforce FRED's 120 requests/minute rate limit."""
    now = time.monotonic()
    # Prune timestamps older than 60 seconds
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= _MAX_REQUESTS_PER_MINUTE:
        wait = 60 - (now - _request_timestamps[0])
        if wait > 0:
            logger.info("FRED rate limit reached, sleeping %.1f seconds", wait)
            await asyncio.sleep(wait)

    _request_timestamps.append(time.monotonic())


class FredClient:
    """Async client for the FRED API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or FRED_API_KEY
        if not self.api_key:
            logger.warning("FRED_API_KEY not set — FRED ingestion will be skipped")

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    async def fetch_series(
        self,
        series_id: str,
        start_date: date,
        end_date: date,
    ) -> list[dict]:
        """Fetch observations for a FRED series.

        Returns list of {"date": "YYYY-MM-DD", "value": float} dicts.
        Observations with non-numeric values (e.g. ".") are skipped.
        """
        if not self.available:
            return []

        await _rate_limit()

        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
            "observation_start": start_date.isoformat(),
            "observation_end": end_date.isoformat(),
        }

        max_retries = 2
        retryable_codes = {429, 500, 502, 503}

        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(max_retries + 1):
                try:
                    resp = await client.get(
                        f"{FRED_BASE_URL}/series/observations",
                        params=params,
                    )
                    resp.raise_for_status()
                    break
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code in retryable_codes and attempt < max_retries:
                        logger.warning(
                            "FRED API transient error for %s (HTTP %d), retry %d/%d",
                            series_id, exc.response.status_code,
                            attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error(
                        "FRED API error for %s: %s %s",
                        series_id,
                        exc.response.status_code,
                        exc.response.text[:200],
                    )
                    return []
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        logger.warning(
                            "FRED request error for %s (%s), retry %d/%d",
                            series_id, exc, attempt + 1, max_retries,
                        )
                        await asyncio.sleep(2 * (attempt + 1))
                        continue
                    logger.error("FRED request failed for %s: %s", series_id, exc)
                    return []

        data = resp.json()
        observations = data.get("observations", [])

        results: list[dict] = []
        for obs in observations:
            raw_value = obs.get("value", "")
            try:
                value = float(raw_value)
            except (ValueError, TypeError):
                # FRED uses "." for missing values
                continue
            results.append({"date": obs["date"], "value": value})

        logger.info("FRED %s: fetched %d observations", series_id, len(results))
        return results
