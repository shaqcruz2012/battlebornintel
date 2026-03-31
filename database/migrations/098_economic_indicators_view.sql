-- Migration 098: Economic Indicators Materialized View and Summary
-- Provides fast access to macro economic data ingested by FRED/BLS ingestors.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/098_economic_indicators_view.sql

-- ============================================================
-- MATERIALIZED VIEW: Latest economic indicators
-- Pre-filters metric_snapshots to only macro-economic series
-- for fast dashboard and API queries.
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS economic_indicators_latest AS
SELECT
  entity_type,
  entity_id,
  metric_name,
  value,
  unit,
  period_start,
  period_end,
  granularity,
  confidence
FROM metric_snapshots
WHERE metric_name IN (
  'fedfunds', 'unrate', 'nvurn', 'gdpc1', 'nvrgsp',
  'dff', 't10y2y', 'cpiaucsl', 'icsa',
  'bls_employment', 'bls_avg_weekly_wage', 'bls_establishments', 'bls_total_wages'
)
ORDER BY metric_name, period_start DESC;

-- Indexes on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_econ_ind_latest_pk
  ON economic_indicators_latest (metric_name, entity_type, entity_id, period_start);

CREATE INDEX IF NOT EXISTS idx_econ_ind_latest_metric
  ON economic_indicators_latest (metric_name, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_econ_ind_latest_entity
  ON economic_indicators_latest (entity_type, entity_id, metric_name);

-- ============================================================
-- REFRESH FUNCTION
-- Call via: SELECT refresh_economic_indicators();
-- Also usable from the admin API endpoint.
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_economic_indicators()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY economic_indicators_latest;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CONVENIENCE VIEW: Pivot latest value per indicator
-- One row per (metric_name, entity_type, entity_id) with the
-- most recent value.
-- ============================================================
CREATE OR REPLACE VIEW economic_indicators_pivot AS
SELECT DISTINCT ON (metric_name, entity_type, entity_id)
  metric_name,
  entity_type,
  entity_id,
  value       AS latest_value,
  unit,
  period_start,
  period_end,
  granularity,
  confidence
FROM economic_indicators_latest
ORDER BY metric_name, entity_type, entity_id, period_start DESC;

-- ============================================================
-- SUMMARY VIEW: One row per indicator with latest value and trend
-- Shows latest_value, previous_value, pct_change, period, granularity.
-- ============================================================
CREATE OR REPLACE VIEW economic_indicators_summary AS
WITH ranked AS (
  SELECT
    metric_name,
    entity_type,
    entity_id,
    value,
    unit,
    period_start,
    period_end,
    granularity,
    confidence,
    ROW_NUMBER() OVER (
      PARTITION BY metric_name, entity_type, entity_id
      ORDER BY period_start DESC
    ) AS rn
  FROM economic_indicators_latest
)
SELECT
  cur.metric_name,
  cur.entity_type,
  cur.entity_id,
  cur.value                                          AS latest_value,
  cur.unit,
  prev.value                                         AS previous_value,
  CASE
    WHEN prev.value IS NOT NULL AND prev.value != 0
    THEN ROUND(((cur.value - prev.value) / prev.value) * 100, 2)
    ELSE NULL
  END                                                AS pct_change,
  cur.period_start                                   AS period,
  cur.period_end,
  cur.granularity,
  cur.confidence
FROM ranked cur
LEFT JOIN ranked prev
  ON  prev.metric_name  = cur.metric_name
  AND prev.entity_type  = cur.entity_type
  AND prev.entity_id    = cur.entity_id
  AND prev.rn           = 2
WHERE cur.rn = 1;
