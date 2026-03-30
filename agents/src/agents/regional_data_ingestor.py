"""
RegionalDataIngestor — Populates regional_indicators from free public APIs.

Sources (all TOS-compliant, free tier):
  - FRED (Federal Reserve Economic Data): unemployment, GDP, population
  - BLS (Bureau of Labor Statistics): wages, labor force, industry employment
  - USPTO (Patent data): patent grants by state

Rate limits respected:
  - FRED: 120 requests/minute (free key)
  - BLS: 50 requests/10 seconds (v2 with key), 25 without
  - USPTO: no key needed, 45 requests/minute

All data is public domain / open government data — no TOS restrictions on storage.
"""

import asyncio
import json
from datetime import date

import httpx

from ..config import FRED_API_KEY
from .base_agent import BaseAgent

# FRED series IDs for Nevada
FRED_SERIES = {
    "unemployment_rate": {"series": "NVUR", "unit": "percent", "granularity": "month"},
    "gdp_m": {"series": "NVNGSP", "unit": "usd_millions", "granularity": "year"},
    "population": {"series": "NVPOP", "unit": "thousands", "granularity": "year"},
    "housing_price_index": {"series": "ATNHPIUS29820Q", "unit": "index", "granularity": "quarter"},
    "labor_force_size": {"series": "NVLF", "unit": "thousands", "granularity": "month"},
    "avg_weekly_wage": {"series": "SMU32000000500000011", "unit": "usd", "granularity": "month"},
}

# BLS series for Nevada (no key required for v1, key for v2)
BLS_SERIES = {
    "labor_force_participation": {"series": "LASST320000000000006", "unit": "percent"},
    "business_formations": {"series": "BDS0000000000000020032", "unit": "count"},
}

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"
BLS_BASE = "https://api.bls.gov/publicAPI/v2/timeseries/data/"


class RegionalDataIngestor(BaseAgent):
    def __init__(self):
        super().__init__("regional_data_ingestor")

    async def run(self, pool, **kwargs):
        results = {"fred": 0, "bls": 0, "errors": []}

        # Get Nevada region_id
        row = await pool.fetchrow(
            "SELECT id FROM regions WHERE name ILIKE '%nevada%' OR name ILIKE '%NV%' LIMIT 1"
        )
        region_id = row["id"] if row else None

        results["fred"] = await self._ingest_fred(pool, region_id, results["errors"])

        if not FRED_API_KEY:
            results["errors"].append("FRED_API_KEY not set — skipping FRED. Get free key at https://fred.stlouisfed.org/docs/api/api_key.html")

        results["bls"] = await self._ingest_bls(pool, region_id, results["errors"])

        # Derive additional indicators from existing data
        results["derived"] = await self._derive_from_db(pool, region_id)

        await self.save_analysis(
            pool,
            analysis_type="regional_data_ingestion",
            content=results,
            model_used="none",
        )
        return results

    async def _ingest_fred(self, pool, region_id, errors):
        if not FRED_API_KEY:
            return 0

        inserted = 0
        async with httpx.AsyncClient(timeout=30) as client:
            for indicator_name, cfg in FRED_SERIES.items():
                try:
                    resp = await client.get(FRED_BASE, params={
                        "series_id": cfg["series"],
                        "api_key": FRED_API_KEY,
                        "file_type": "json",
                        "sort_order": "desc",
                        "limit": 120,
                    })
                    resp.raise_for_status()
                    obs = resp.json().get("observations", [])

                    for o in obs:
                        if o["value"] == ".":
                            continue
                        period_date = date.fromisoformat(o["date"])
                        await pool.execute("""
                            INSERT INTO regional_indicators
                              (region_id, state_code, indicator_name, indicator_value,
                               unit, period_date, granularity, source_url, confidence, verified)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0.95, TRUE)
                            ON CONFLICT (region_id, state_code, indicator_name, period_date)
                            DO UPDATE SET indicator_value = EXCLUDED.indicator_value,
                                         verified = TRUE
                        """,
                            region_id, "NV", indicator_name,
                            float(o["value"]),
                            cfg["unit"], period_date,
                            cfg["granularity"],
                            f"https://fred.stlouisfed.org/series/{cfg['series']}",
                        )
                        inserted += 1

                    # Rate limit: max 120 req/min
                    await asyncio.sleep(0.6)

                except Exception as e:
                    errors.append(f"FRED {indicator_name}: {str(e)[:100]}")

        return inserted

    async def _ingest_bls(self, pool, region_id, errors):
        inserted = 0
        series_ids = [cfg["series"] for cfg in BLS_SERIES.values()]

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                payload = {
                    "seriesid": series_ids,
                    "startyear": "2015",
                    "endyear": str(date.today().year),
                }
                resp = await client.post(BLS_BASE, json=payload)
                resp.raise_for_status()
                data = resp.json()

                if data.get("status") != "REQUEST_SUCCEEDED":
                    errors.append(f"BLS API: {data.get('message', 'unknown error')}")
                    return 0

                series_name_map = {
                    cfg["series"]: name for name, cfg in BLS_SERIES.items()
                }

                for series in data.get("Results", {}).get("series", []):
                    sid = series["seriesID"]
                    indicator_name = series_name_map.get(sid, sid)
                    unit = BLS_SERIES.get(indicator_name, {}).get("unit", "index")

                    for obs in series.get("data", []):
                        period_month = obs["period"].replace("M", "").zfill(2)
                        if not period_month.isdigit():
                            continue
                        period_str = f"{obs['year']}-{period_month}-01"

                        val = obs["value"].replace(",", "")
                        if not val or val == "-":
                            continue

                        period_date = date.fromisoformat(period_str)
                        await pool.execute("""
                            INSERT INTO regional_indicators
                              (region_id, state_code, indicator_name, indicator_value,
                               unit, period_date, granularity, source_url, confidence, verified)
                            VALUES ($1, $2, $3, $4, $5, $6, 'month', $7, 0.92, TRUE)
                            ON CONFLICT (region_id, state_code, indicator_name, period_date)
                            DO UPDATE SET indicator_value = EXCLUDED.indicator_value
                        """,
                            region_id, "NV", indicator_name,
                            float(val), unit, period_date,
                            f"https://www.bls.gov/data/timeseries/{sid}",
                        )
                        inserted += 1

        except Exception as e:
            errors.append(f"BLS: {str(e)[:100]}")

        return inserted

    async def _derive_from_db(self, pool, region_id):
        """Derive ecosystem-specific indicators from existing database."""
        derived = 0

        # Startup density: companies per region
        rows = await pool.fetch("""
            SELECT region, COUNT(*) as cnt
            FROM companies
            WHERE region IS NOT NULL
            GROUP BY region
        """)
        for r in rows:
            await pool.execute("""
                INSERT INTO regional_indicators
                  (state_code, indicator_name, indicator_value, unit,
                   period_date, granularity, confidence, verified)
                VALUES ('NV', 'startup_density', $1, 'count', CURRENT_DATE, 'month', 0.9, TRUE)
                ON CONFLICT (region_id, state_code, indicator_name, period_date)
                DO UPDATE SET indicator_value = EXCLUDED.indicator_value
            """, r["cnt"])
            derived += 1

        # Venture deployed: sum of fund deployments
        row = await pool.fetchrow(
            "SELECT COALESCE(SUM(deployed_m), 0) as total FROM funds"
        )
        await pool.execute("""
            INSERT INTO regional_indicators
              (state_code, indicator_name, indicator_value, unit,
               period_date, granularity, confidence, verified)
            VALUES ('NV', 'venture_deployed_m', $1, 'usd_millions', CURRENT_DATE, 'month', 0.85, TRUE)
            ON CONFLICT (region_id, state_code, indicator_name, period_date)
            DO UPDATE SET indicator_value = EXCLUDED.indicator_value
        """, float(row["total"]))
        derived += 1

        return derived
