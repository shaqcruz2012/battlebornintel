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
FRED_SERIES = {
    "FEDFUNDS": ("macro", "US", "month", "percent"),
    "UNRATE": ("macro", "US", "month", "percent"),
    "NVURN": ("region", "NV", "month", "percent"),
    "GDPC1": ("macro", "US", "quarter", "usd_billions"),
    "NVRGSP": ("region", "NV", "year", "usd_millions"),
    "DFF": ("macro", "US", "day", "percent"),
    "T10Y2Y": ("macro", "US", "day", "percent"),
    "CPIAUCSL": ("macro", "US", "month", "index"),
    "ICSA": ("macro", "US", "week", "count"),
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

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                resp = await client.get(
                    f"{FRED_BASE_URL}/series/observations",
                    params=params,
                )
                resp.raise_for_status()
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "FRED API error for %s: %s %s",
                    series_id,
                    exc.response.status_code,
                    exc.response.text[:200],
                )
                return []
            except httpx.RequestError as exc:
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
