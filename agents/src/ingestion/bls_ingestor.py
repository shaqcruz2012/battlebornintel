"""BLS QCEW ingestion agent — fetches employment/wages data into metric_snapshots.

Fetches Quarterly Census of Employment and Wages data from the BLS public API
for Nevada regions and NAICS-mapped sectors, then stores each metric in
the metric_snapshots table.

Scheduled monthly (1st of month, 3 AM) since QCEW data updates quarterly
with approximately a 6-month lag.
"""

import logging
from datetime import date, datetime, timezone

from ..agents.base_model_agent import BaseModelAgent
from .bls_client import (
    AREA_FIPS,
    BLSQCEWClient,
    FIPS_TO_REGION_NAME,
    QCEWRecord,
)

logger = logging.getLogger(__name__)

# Quarter end-month mapping: Q1->Mar, Q2->Jun, Q3->Sep, Q4->Dec
QUARTER_END_MONTH = {1: 3, 2: 6, 3: 9, 4: 12}
QUARTER_START_MONTH = {1: 1, 2: 4, 3: 7, 4: 10}

# How far back QCEW data is typically available (~6 month lag)
QCEW_LAG_QUARTERS = 2


def _quarter_dates(year: int, quarter: int) -> tuple[date, date]:
    """Return (period_start, period_end) for a given year/quarter."""
    start_month = QUARTER_START_MONTH[quarter]
    end_month = QUARTER_END_MONTH[quarter]
    period_start = date(year, start_month, 1)
    # End of quarter: last day of the end month
    if end_month == 12:
        period_end = date(year, 12, 31)
    else:
        period_end = date(year, end_month + 1, 1).replace(day=1)
        # Go back one day to get last day of end_month
        from datetime import timedelta
        period_end = period_end - timedelta(days=1)
    return period_start, period_end


def _latest_available_quarter() -> tuple[int, int]:
    """Determine the most recent quarter likely to have QCEW data.

    QCEW data has roughly a 6-month (2 quarter) publication lag.
    """
    today = date.today()
    current_quarter = (today.month - 1) // 3 + 1
    year = today.year

    # Go back by the lag
    target_quarter = current_quarter - QCEW_LAG_QUARTERS
    if target_quarter <= 0:
        target_quarter += 4
        year -= 1

    return year, target_quarter


class BLSIngestor(BaseModelAgent):
    """Ingests BLS QCEW data into metric_snapshots.

    Fetches quarterly employment, wages, and establishment counts for:
    - Nevada regions (state, Clark County, Washoe County)
    - NAICS sectors from the sectors table
    """

    def __init__(self):
        super().__init__(agent_name="bls_ingestor", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        """Execute BLS QCEW data ingestion."""
        year = kwargs.get("year")
        quarter = kwargs.get("quarter")

        if year is None or quarter is None:
            year, quarter = _latest_available_quarter()

        logger.info("BLS QCEW ingestion starting for %dQ%d", year, quarter)

        client = BLSQCEWClient()
        stats = {
            "year": year,
            "quarter": quarter,
            "region_records": 0,
            "sector_records": 0,
            "skipped": 0,
            "errors": 0,
        }

        try:
            # 1. Fetch region-level totals (all industries)
            region_records = await client.fetch_region_totals(year, quarter)
            region_map = await self._load_region_map(pool)
            stats["region_records"] = await self._store_region_records(
                pool, region_records, region_map, year, quarter
            )

            # 2. Fetch sector-level data by NAICS code
            sectors = await self._load_sectors(pool)
            if sectors:
                all_naics = []
                for sector in sectors:
                    all_naics.extend(sector["naics_codes"])
                unique_naics = list(set(all_naics))

                sector_records = await client.fetch_sector_data_for_regions(
                    year, quarter, unique_naics
                )
                stats["sector_records"] = await self._store_sector_records(
                    pool, sector_records, sectors, year, quarter
                )
        except Exception as e:
            logger.error("BLS QCEW ingestion error: %s", e, exc_info=True)
            stats["errors"] += 1
            raise
        finally:
            await client.close()

        logger.info(
            "BLS QCEW ingestion complete: %d region, %d sector records stored",
            stats["region_records"],
            stats["sector_records"],
        )
        return stats

    async def _load_region_map(self, pool) -> dict[str, str]:
        """Load mapping of region name -> region id from the regions table."""
        rows = await pool.fetch(
            "SELECT id, name FROM regions WHERE name = ANY($1)",
            list(FIPS_TO_REGION_NAME.values()),
        )
        return {row["name"]: str(row["id"]) for row in rows}

    async def _load_sectors(self, pool) -> list[dict]:
        """Load sectors with their NAICS codes from the sectors table."""
        rows = await pool.fetch(
            "SELECT id, slug, name, naics_codes FROM sectors WHERE naics_codes IS NOT NULL"
        )
        return [
            {
                "id": str(row["id"]),
                "slug": row["slug"],
                "name": row["name"],
                "naics_codes": list(row["naics_codes"]),
            }
            for row in rows
        ]

    async def _store_region_records(
        self,
        pool,
        records: list[QCEWRecord],
        region_map: dict[str, str],
        year: int,
        quarter: int,
    ) -> int:
        """Store region-level QCEW records into metric_snapshots."""
        period_start, period_end = _quarter_dates(year, quarter)
        stored = 0

        for record in records:
            region_name = FIPS_TO_REGION_NAME.get(record.area_fips)
            if not region_name:
                continue
            entity_id = region_map.get(region_name)
            if not entity_id:
                logger.warning(
                    "Region '%s' not found in regions table, skipping",
                    region_name,
                )
                continue

            try:
                await pool.execute(
                    """INSERT INTO metric_snapshots
                       (entity_type, entity_id, metric_name, value, unit,
                        period_start, period_end, granularity, confidence,
                        verified, agent_id)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                       ON CONFLICT (entity_type, entity_id, metric_name,
                                    period_start, period_end)
                       DO NOTHING""",
                    "region",
                    entity_id,
                    record.metric_name,
                    record.value,
                    record.unit,
                    period_start,
                    period_end,
                    "quarter",
                    0.95,
                    False,
                    "bls_ingestor",
                )
                stored += 1
            except Exception as e:
                logger.warning(
                    "Failed to store region record %s/%s: %s",
                    region_name, record.metric_name, e,
                )

        logger.info("Stored %d region metric snapshots", stored)
        return stored

    async def _store_sector_records(
        self,
        pool,
        records: list[QCEWRecord],
        sectors: list[dict],
        year: int,
        quarter: int,
    ) -> int:
        """Store sector-level QCEW records into metric_snapshots.

        Maps NAICS industry codes back to sector IDs.
        Multiple NAICS codes can map to a single sector; we store the
        record under the first matching sector.
        """
        period_start, period_end = _quarter_dates(year, quarter)

        # Build reverse mapping: naics_code -> sector_id
        naics_to_sector: dict[str, str] = {}
        for sector in sectors:
            for code in sector["naics_codes"]:
                # First sector to claim a NAICS code wins
                if code not in naics_to_sector:
                    naics_to_sector[code] = sector["id"]

        stored = 0
        for record in records:
            sector_id = naics_to_sector.get(record.industry_code)
            if not sector_id:
                continue

            try:
                await pool.execute(
                    """INSERT INTO metric_snapshots
                       (entity_type, entity_id, metric_name, value, unit,
                        period_start, period_end, granularity, confidence,
                        verified, agent_id)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                       ON CONFLICT (entity_type, entity_id, metric_name,
                                    period_start, period_end)
                       DO NOTHING""",
                    "sector",
                    sector_id,
                    record.metric_name,
                    record.value,
                    record.unit,
                    period_start,
                    period_end,
                    "quarter",
                    0.95,
                    False,
                    "bls_ingestor",
                )
                stored += 1
            except Exception as e:
                logger.warning(
                    "Failed to store sector record %s/%s: %s",
                    record.industry_code, record.metric_name, e,
                )

        logger.info("Stored %d sector metric snapshots", stored)
        return stored
