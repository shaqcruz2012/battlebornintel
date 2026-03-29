-- Migration 095: Backfill metric_snapshots with historical data
--
-- Populates the metric_snapshots table (created in migration 005) by
-- extracting quantitative data from existing tables:
--
--   1. companies  -> funding_m, employees, momentum  (Q1 2026 snapshot)
--   2. timeline_events (Funding/Investment) -> funding_event (daily)
--   3. timeline_events (Hiring) -> hiring_event (daily)
--   4. funds     -> deployed_m, allocated_m, leverage_ratio (Q1 2026 snapshot)
--   5. stakeholder_activities -> activity_count per company per quarter
--
-- All INSERTs use ON CONFLICT ... DO NOTHING so the migration is idempotent.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/095_backfill_metric_snapshots.sql

BEGIN;

-- ============================================================
-- 1. COMPANIES — current snapshot as Q1 2026
-- ============================================================

-- 1a. funding_m
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(id AS VARCHAR),
  'funding_m',
  funding_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM companies
WHERE funding_m IS NOT NULL AND funding_m > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 1b. employees
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(id AS VARCHAR),
  'employees',
  employees,
  'count',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM companies
WHERE employees IS NOT NULL AND employees > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 1c. momentum
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(id AS VARCHAR),
  'momentum',
  momentum,
  'score',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM companies
WHERE momentum IS NOT NULL AND momentum > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- 2. TIMELINE EVENTS — historical funding events (daily grain)
--    delta_capital_m was added in migration 004.
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(te.company_id AS VARCHAR),
  'funding_event',
  te.delta_capital_m,
  'usd_millions',
  te.event_date,
  te.event_date,
  'day',
  0.7,
  FALSE
FROM timeline_events te
WHERE te.event_type IN ('Funding', 'Investment')
  AND te.delta_capital_m IS NOT NULL
  AND te.company_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- 3. TIMELINE EVENTS — historical hiring events (daily grain)
--    delta_jobs was added in migration 004.
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(te.company_id AS VARCHAR),
  'hiring_event',
  te.delta_jobs,
  'count',
  te.event_date,
  te.event_date,
  'day',
  0.7,
  FALSE
FROM timeline_events te
WHERE te.event_type = 'Hiring'
  AND te.delta_jobs IS NOT NULL
  AND te.company_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- 4. FUNDS — deployment snapshot as Q1 2026
-- ============================================================

-- 4a. deployed_m
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'fund',
  id,
  'deployed_m',
  deployed_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM funds
WHERE deployed_m IS NOT NULL AND deployed_m > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 4b. allocated_m (only when not null)
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'fund',
  id,
  'allocated_m',
  allocated_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM funds
WHERE allocated_m IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 4c. leverage_ratio (only when not null)
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'fund',
  id,
  'leverage_ratio',
  leverage,
  'ratio',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.8,
  FALSE
FROM funds
WHERE leverage IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- 5. STAKEHOLDER ACTIVITIES — activity count by company+quarter
--    company_id in stakeholder_activities is VARCHAR (slug/external id).
--    We join to companies to get the integer id for entity_id consistency.
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified)
SELECT
  'company',
  CAST(c.id AS VARCHAR),
  'activity_count',
  COUNT(*)::NUMERIC,
  'count',
  DATE_TRUNC('quarter', sa.activity_date)::DATE AS period_start,
  (DATE_TRUNC('quarter', sa.activity_date) + INTERVAL '3 months' - INTERVAL '1 day')::DATE AS period_end,
  'quarter',
  0.6,
  FALSE
FROM stakeholder_activities sa
JOIN companies c
  ON LOWER(TRIM(sa.company_id)) = LOWER(TRIM(c.slug))
WHERE sa.company_id IS NOT NULL
  AND sa.activity_date IS NOT NULL
GROUP BY c.id, DATE_TRUNC('quarter', sa.activity_date)
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

COMMIT;
