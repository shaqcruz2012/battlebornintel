# Data Ingestion Agent Context

Use this when creating or modifying ingestion agents in `agents/src/ingestion/`.

## Pattern

Ingestion agents inherit from `BaseModelAgent` and write to `metric_snapshots`.

```python
from ..agents.base_model_agent import BaseModelAgent

class MyIngestor(BaseModelAgent):
    def __init__(self):
        super().__init__(agent_name="my_ingestor", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        client = MyAPIClient()
        try:
            records = await client.fetch_data(...)
            stored = await self._store_records(pool, records)
            return {"records_stored": stored}
        finally:
            await client.close()
```

## metric_snapshots INSERT Pattern
```sql
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING
```

## Entity Type Conventions
| entity_type | entity_id examples | Use case |
|-------------|-------------------|----------|
| macro | US | National indicators (FRED) |
| region | NV, clark_county, washoe_county | Regional data (BLS, Census) |
| sector | tech, healthcare, mining | Sector-level metrics |
| company | 123 (company.id) | Company-level metrics |

## Existing Ingestors

### FRED (fred_ingestor.py + fred_client.py)
- 9 series: FEDFUNDS, UNRATE, NVURN, GDPC1, NVRGSP, DFF, T10Y2Y, CPIAUCSL, ICSA
- Uses httpx async client with rate limiting (120 req/min)
- Requires `FRED_API_KEY` env variable
- Granularity: day/week/month/quarter/year per series

### BLS QCEW (bls_ingestor.py + bls_client.py)
- Quarterly Census of Employment and Wages
- Area FIPS: 32000 (NV state), 32003 (Clark), 32031 (Washoe)
- Metrics: bls_employment, bls_avg_weekly_wage, bls_establishments, bls_total_wages
- ~6 month publication lag (fetches latest available quarter)

### Freshness Checker (freshness.py) — NOTE: inherits from BaseAgent, not BaseModelAgent
- Audits data staleness across tables
- Writes to analysis_results (not metric_snapshots)
- Classified as an audit agent, not a data ingestor

## After Creating an Ingestor
1. Add to runner.py AGENT_REGISTRY
2. Add to scheduler.py SCHEDULES
3. If new metric_names, add them to migration 098 economic_indicators_latest WHERE clause
4. Run `SELECT refresh_economic_indicators()` to update materialized views
