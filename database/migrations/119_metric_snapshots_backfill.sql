-- Migration 119: Backfill metric_snapshots with company & fund time-series data
--
-- Extends migration 095 by:
--   1. Extracting dollar amounts from timeline_events.detail text for Funding
--      events that lack delta_capital_m values
--   2. Extracting job counts from timeline_events.detail text for Hiring events
--      that lack delta_jobs values
--   3. Re-inserting current company snapshots (funding_m, employees, momentum)
--   4. Re-inserting fund snapshots (deployed_m, allocated_m, leverage_ratio)
--
-- All INSERTs use ON CONFLICT DO NOTHING so the migration is fully idempotent.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/118_backfill_metric_snapshots_from_details.sql

BEGIN;

-- ============================================================
-- STEP 0: Backfill company_id on timeline_events rows from migration 093
--         that may still have NULL company_id
-- ============================================================

UPDATE timeline_events te
SET company_id = c.id
FROM companies c
WHERE te.company_id IS NULL
  AND LOWER(TRIM(te.company_name)) = LOWER(TRIM(c.name));

UPDATE timeline_events te
SET company_id = c.id
FROM companies c
WHERE te.company_id IS NULL
  AND LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(te.company_name), '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g')) = c.slug;

-- ============================================================
-- STEP 1: Backfill delta_capital_m from detail text where missing
--         Pattern: $NNN or $N.NM or $NNNM or $NNNK in detail
-- ============================================================

UPDATE timeline_events
SET delta_capital_m = extracted.amount
FROM (
  SELECT
    id,
    CASE
      -- Match "$100M" / "$4.5M" / "$18.5M" style (M = millions)
      WHEN detail ~ '\$[\d,.]+\s*[Mm]' THEN
        CAST(REGEXP_REPLACE(
          (REGEXP_MATCH(detail, '\$([\d,.]+)\s*[Mm]'))[1],
          ',', '', 'g'
        ) AS NUMERIC)
      -- Match "$2B" style (B = billions -> convert to millions)
      WHEN detail ~ '\$[\d,.]+\s*[Bb]' THEN
        CAST(REGEXP_REPLACE(
          (REGEXP_MATCH(detail, '\$([\d,.]+)\s*[Bb]'))[1],
          ',', '', 'g'
        ) AS NUMERIC) * 1000
      -- Match "$200K" style (K = thousands -> convert to millions)
      WHEN detail ~ '\$[\d,.]+\s*[Kk]' THEN
        CAST(REGEXP_REPLACE(
          (REGEXP_MATCH(detail, '\$([\d,.]+)\s*[Kk]'))[1],
          ',', '', 'g'
        ) AS NUMERIC) / 1000
      ELSE NULL
    END AS amount
  FROM timeline_events
  WHERE event_type IN ('Funding', 'Investment', 'Grant')
    AND delta_capital_m IS NULL
    AND detail ~ '\$[\d]'
) extracted
WHERE timeline_events.id = extracted.id
  AND extracted.amount IS NOT NULL;

-- ============================================================
-- STEP 2: Backfill delta_jobs from detail text where missing
--         Pattern: "200+" or "60+" or "1,000+" preceding job-related words
-- ============================================================

UPDATE timeline_events
SET delta_jobs = extracted.jobs
FROM (
  SELECT
    id,
    CAST(REGEXP_REPLACE(
      (REGEXP_MATCH(detail, '([\d,]+)\+?\s*(?:new\s+)?(?:manufacturing|engineering|technical|healthcare|sales|operations|DevOps|Linux|security|product|RF|systems|professional|EV|ad-tech)?\s*(?:positions?|roles?|engineers?|jobs?|technicians?|employees?|drivers?|researchers?|clinicians?)', 'i'))[1],
      ',', '', 'g'
    ) AS INTEGER) AS jobs
  FROM timeline_events
  WHERE event_type = 'Hiring'
    AND delta_jobs IS NULL
    AND detail ~ '[\d,]+\+?\s*'
) extracted
WHERE timeline_events.id = extracted.id
  AND extracted.jobs IS NOT NULL
  AND extracted.jobs > 0;

-- ============================================================
-- SECTION 1: Current company snapshots (Q1 2026)
-- ============================================================

-- 1a. funding_m
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'company',
  CAST(c.id AS VARCHAR),
  'funding_m',
  c.funding_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM companies c
WHERE c.funding_m IS NOT NULL AND c.funding_m > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 1b. employees
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'company',
  CAST(c.id AS VARCHAR),
  'employees',
  c.employees,
  'count',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM companies c
WHERE c.employees IS NOT NULL AND c.employees > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 1c. momentum
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'company',
  CAST(c.id AS VARCHAR),
  'momentum',
  c.momentum,
  'score',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM companies c
WHERE c.momentum IS NOT NULL AND c.momentum > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- SECTION 2: Historical funding events from timeline_events
--            Uses delta_capital_m (now backfilled from detail text above)
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'company',
  CAST(te.company_id AS VARCHAR),
  'funding_round_m',
  te.delta_capital_m,
  'usd_millions',
  te.event_date,
  te.event_date,
  'day',
  0.70,
  'migration-118'
FROM timeline_events te
WHERE te.event_type IN ('Funding', 'Investment', 'Grant')
  AND te.delta_capital_m IS NOT NULL
  AND te.company_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- SECTION 3: Historical hiring events from timeline_events
--            Uses delta_jobs (now backfilled from detail text above)
-- ============================================================

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'company',
  CAST(te.company_id AS VARCHAR),
  'delta_jobs',
  te.delta_jobs,
  'count',
  te.event_date,
  te.event_date,
  'day',
  0.65,
  'migration-118'
FROM timeline_events te
WHERE te.event_type = 'Hiring'
  AND te.delta_jobs IS NOT NULL
  AND te.company_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- SECTION 4: Fund-level snapshots (Q1 2026)
-- ============================================================

-- 4a. deployed_m
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'fund',
  f.id,
  'deployed_m',
  f.deployed_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM funds f
WHERE f.deployed_m IS NOT NULL AND f.deployed_m > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 4b. allocated_m
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'fund',
  f.id,
  'allocated_m',
  f.allocated_m,
  'usd_millions',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM funds f
WHERE f.allocated_m IS NOT NULL AND f.allocated_m > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- 4c. leverage_ratio
INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, agent_id)
SELECT
  'fund',
  f.id,
  'leverage_ratio',
  f.leverage,
  'ratio',
  '2026-01-01'::DATE,
  '2026-03-31'::DATE,
  'quarter',
  0.80,
  'migration-118'
FROM funds f
WHERE f.leverage IS NOT NULL AND f.leverage > 0
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
DO NOTHING;

-- ============================================================
-- Verification: Row counts per metric_name
-- ============================================================

SELECT metric_name, COUNT(*) AS rows
FROM metric_snapshots
WHERE agent_id = 'migration-118'
GROUP BY metric_name
ORDER BY metric_name;

COMMIT;
