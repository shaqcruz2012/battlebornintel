-- Migration 127: Historical Metric Time-Series for T-GNN Temporal Training
--
-- Purpose: Build multi-year time-series in metric_snapshots so the Temporal
--          Graph Neural Network has multiple time points per entity, not just
--          the latest snapshot from migration 124.
--
-- Data sources:
--   Population:    Census Bureau Vintage 2024 intercensal estimates
--   GDP:           BEA (SAGDP2N via FRED: NVNGSP)
--   Unemployment:  BLS LAUS annual averages
--   University R&D: NSF HERD survey (gap-fill for years missing in migration 124)
--   Fund deployment: SSBCI quarterly reports, BBV/FundNV filings (estimated)
--
-- Confidence tiers:
--   0.95 — Census / BEA / BLS / NSF official releases
--   0.85 — Interpolated between two known data points
--   0.70 — Estimated / projected values
--
-- All INSERTs use ON CONFLICT DO NOTHING for idempotency.
-- Entity IDs follow migration 124 conventions:
--   region  entity_id '1' = Nevada, '2' = Clark County, '3' = Washoe County
--   fund    entity_id = funds.id (e.g. 'f_bbv', 'f_fundnv')

BEGIN;

-- ============================================================
-- 1. NEVADA POPULATION HISTORY (entity_type='region', entity_id='1')
--    Source: Census Bureau Vintage 2024 intercensal estimates
--    Note: 2024 already in migration 124; included here for completeness
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', '1', 'population', 3104614, 'persons', '2020-01-01', '2020-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'population', 3143991, 'persons', '2021-01-01', '2021-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'population', 3177772, 'persons', '2022-01-01', '2022-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'population', 3194176, 'persons', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. NEVADA GDP HISTORY (billion USD, nominal)
--    Source: BEA / FRED NVNGSP
--    Note: 2024 already in migration 124 as gdp_nominal=269.01
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', '1', 'gdp_nominal', 172.20, 'billion_usd', '2020-01-01', '2020-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'gdp_nominal', 198.20, 'billion_usd', '2021-01-01', '2021-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'gdp_nominal', 228.60, 'billion_usd', '2022-01-01', '2022-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'gdp_nominal', 249.80, 'billion_usd', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. NEVADA UNEMPLOYMENT RATE HISTORY
--    Source: BLS LAUS annual averages
--    Note: 2024 already in migration 124 as unemployment_rate=5.2
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', '1', 'unemployment_rate', 13.5, 'percent', '2020-01-01', '2020-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'unemployment_rate',  7.4, 'percent', '2021-01-01', '2021-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'unemployment_rate',  5.4, 'percent', '2022-01-01', '2022-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '1', 'unemployment_rate',  5.3, 'percent', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. CLARK COUNTY POPULATION HISTORY (entity_id='2')
--    Source: Census Bureau Vintage 2024
--    Note: 2024 already in migration 124
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', '2', 'population', 2265461, 'persons', '2020-01-01', '2020-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '2', 'population', 2292476, 'persons', '2021-01-01', '2021-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '2', 'population', 2330564, 'persons', '2022-01-01', '2022-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '2', 'population', 2361409, 'persons', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. WASHOE COUNTY POPULATION HISTORY (entity_id='3')
--    Source: Census Bureau Vintage 2024
--    Note: 2024 already in migration 124
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', '3', 'population', 486492, 'persons', '2020-01-01', '2020-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '3', 'population', 490996, 'persons', '2021-01-01', '2021-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '3', 'population', 496657, 'persons', '2022-01-01', '2022-12-31', 'year', 0.95, true, 'migration-127'),
  ('region', '3', 'population', 502458, 'persons', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. UNLV R&D TIME SERIES — Gap-fill for years missing in migration 124
--    Migration 124 covers: FY2015, FY2017, FY2018, FY2023, FY2024
--    Missing: FY2016, FY2019, FY2020, FY2021, FY2022
--
--    FY2016 ($54.0M): interpolated between FY2015 $42.0M and FY2017 $66.0M
--    FY2019 ($88.5M): NSF HERD FY2019 estimate (growth from $83.8M FY2018)
--    FY2020 ($80.0M): COVID-impacted, estimated dip
--    FY2021 ($85.0M): partial recovery, estimated
--    FY2022 ($92.0M): interpolated between FY2021 est and FY2023 $98.75M
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 54.0,  'usd_millions', '2015-07-01', '2016-06-30', 'year', 0.85, false, 'migration-127'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 88.5,  'usd_millions', '2018-07-01', '2019-06-30', 'year', 0.85, false, 'migration-127'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 80.0,  'usd_millions', '2019-07-01', '2020-06-30', 'year', 0.70, false, 'migration-127'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 85.0,  'usd_millions', '2020-07-01', '2021-06-30', 'year', 0.70, false, 'migration-127'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 92.0,  'usd_millions', '2021-07-01', '2022-06-30', 'year', 0.85, false, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. UNR R&D TIME SERIES — Gap-fill for years missing in migration 124
--    Migration 124 covers: FY2017, FY2018, FY2019, FY2020, FY2021, FY2024, FY2025
--    Missing: FY2022, FY2023
--
--    FY2022 ($182.0M): interpolated between FY2021 $175.39M and FY2024 $194.1M
--    FY2023 ($188.0M): interpolated between FY2022 est and FY2024 $194.1M
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 182.0, 'usd_millions', '2021-07-01', '2022-06-30', 'year', 0.85, false, 'migration-127'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 188.0, 'usd_millions', '2022-07-01', '2023-06-30', 'year', 0.85, false, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. FUND DEPLOYMENT SNAPSHOTS — Quarterly estimates for SSBCI funds
--    BBV (Battle Born Venture): deployed_m growing $5M (2022 Q1) → $25M (2025 Q4)
--    FundNV: deployed_m growing $2M (2022 Q1) → $15M (2025 Q4)
--
--    Quarterly progression modeled as roughly linear ramp with
--    acceleration in later quarters as deal flow matures.
--    Confidence: 0.70 for estimates, 0.85 for quarters near known totals.
-- ============================================================

-- 8a. BBV (Battle Born Venture) — deployed_m quarterly snapshots
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  -- 2022: Ramp-up year ($5M → $8M)
  ('fund', 'f_bbv', 'deployed_m',  5.0, 'usd_millions', '2022-01-01', '2022-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m',  5.8, 'usd_millions', '2022-04-01', '2022-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m',  6.8, 'usd_millions', '2022-07-01', '2022-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m',  8.0, 'usd_millions', '2022-10-01', '2022-12-31', 'quarter', 0.70, false, 'migration-127'),
  -- 2023: Steady deployment ($9.2M → $13.5M)
  ('fund', 'f_bbv', 'deployed_m',  9.2, 'usd_millions', '2023-01-01', '2023-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 10.5, 'usd_millions', '2023-04-01', '2023-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 12.0, 'usd_millions', '2023-07-01', '2023-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 13.5, 'usd_millions', '2023-10-01', '2023-12-31', 'quarter', 0.70, false, 'migration-127'),
  -- 2024: Accelerating ($15.0M → $20.5M)
  ('fund', 'f_bbv', 'deployed_m', 15.0, 'usd_millions', '2024-01-01', '2024-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 16.8, 'usd_millions', '2024-04-01', '2024-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 18.5, 'usd_millions', '2024-07-01', '2024-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 20.5, 'usd_millions', '2024-10-01', '2024-12-31', 'quarter', 0.85, false, 'migration-127'),
  -- 2025: Approaching full deployment ($22.0M → $25.0M)
  ('fund', 'f_bbv', 'deployed_m', 22.0, 'usd_millions', '2025-01-01', '2025-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 23.0, 'usd_millions', '2025-04-01', '2025-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 24.0, 'usd_millions', '2025-07-01', '2025-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_bbv', 'deployed_m', 25.0, 'usd_millions', '2025-10-01', '2025-12-31', 'quarter', 0.70, false, 'migration-127')
ON CONFLICT DO NOTHING;

-- 8b. FundNV — deployed_m quarterly snapshots
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  -- 2022: Early deployment ($2M → $3.5M)
  ('fund', 'f_fundnv', 'deployed_m',  2.0, 'usd_millions', '2022-01-01', '2022-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  2.5, 'usd_millions', '2022-04-01', '2022-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  3.0, 'usd_millions', '2022-07-01', '2022-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  3.5, 'usd_millions', '2022-10-01', '2022-12-31', 'quarter', 0.70, false, 'migration-127'),
  -- 2023: Growing ($4.2M → $7.0M)
  ('fund', 'f_fundnv', 'deployed_m',  4.2, 'usd_millions', '2023-01-01', '2023-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  5.0, 'usd_millions', '2023-04-01', '2023-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  6.0, 'usd_millions', '2023-07-01', '2023-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  7.0, 'usd_millions', '2023-10-01', '2023-12-31', 'quarter', 0.70, false, 'migration-127'),
  -- 2024: Steady ($8.2M → $11.5M)
  ('fund', 'f_fundnv', 'deployed_m',  8.2, 'usd_millions', '2024-01-01', '2024-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m',  9.3, 'usd_millions', '2024-04-01', '2024-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m', 10.4, 'usd_millions', '2024-07-01', '2024-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m', 11.5, 'usd_millions', '2024-10-01', '2024-12-31', 'quarter', 0.85, false, 'migration-127'),
  -- 2025: Approaching target ($12.5M → $15.0M)
  ('fund', 'f_fundnv', 'deployed_m', 12.5, 'usd_millions', '2025-01-01', '2025-03-31', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m', 13.2, 'usd_millions', '2025-04-01', '2025-06-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m', 14.0, 'usd_millions', '2025-07-01', '2025-09-30', 'quarter', 0.70, false, 'migration-127'),
  ('fund', 'f_fundnv', 'deployed_m', 15.0, 'usd_millions', '2025-10-01', '2025-12-31', 'quarter', 0.70, false, 'migration-127')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Verification: Row counts per entity_type + metric_name
-- ============================================================

SELECT entity_type, metric_name, COUNT(*) AS rows, MIN(period_start) AS earliest, MAX(period_end) AS latest
FROM metric_snapshots
WHERE agent_id = 'migration-127'
GROUP BY entity_type, metric_name
ORDER BY entity_type, metric_name;

COMMIT;
