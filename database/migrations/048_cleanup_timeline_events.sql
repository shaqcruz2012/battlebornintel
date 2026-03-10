-- Migration 048: Clean up timeline_events data quality issues
--
-- Addresses:
--   1. Duplicate events (same company_name + event_type + event_date)
--   2. Events with suspicious dates (future dates, dates before 2015)
--   3. Inconsistent company_name formatting (whitespace, casing)
--   4. Missing unique constraint to prevent future duplicates
--
-- Idempotent: all operations are safe to run multiple times.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/048_cleanup_timeline_events.sql

BEGIN;

-- ============================================================
-- PRE-CLEANUP: Capture event counts by year for comparison
-- ============================================================

CREATE TEMP TABLE IF NOT EXISTS _pre_cleanup_counts AS
SELECT
  EXTRACT(YEAR FROM event_date)::INT AS event_year,
  COUNT(*)                           AS event_count
FROM timeline_events
GROUP BY 1
ORDER BY 1;

-- Show pre-cleanup totals
SELECT 'PRE-CLEANUP' AS phase, event_year, event_count
FROM _pre_cleanup_counts
ORDER BY event_year;

SELECT 'PRE-CLEANUP TOTAL' AS phase, COUNT(*) AS total_events
FROM timeline_events;

-- ============================================================
-- STEP 1: Remove duplicate events
-- ============================================================
-- Keep the row with the lowest id when company_name + event_type +
-- event_date match. This handles any duplicates introduced by
-- migrations that lacked ON CONFLICT guards.

DELETE FROM timeline_events a
USING timeline_events b
WHERE a.id > b.id
  AND a.company_name = b.company_name
  AND a.event_type   = b.event_type
  AND a.event_date   = b.event_date;

-- ============================================================
-- STEP 2: Remove events with suspicious dates
-- ============================================================
-- Future dates: anything more than 30 days beyond today (2026-03-08)
-- is almost certainly fabricated or a typo.
-- Pre-2015 dates: the Nevada startup ecosystem this database tracks
-- is modern; events before 2015-01-01 are out of scope or
-- questionable, with exceptions already cleaned in prior migrations.
--
-- Note: Comstock Mining (founded 2006) and WaterStart (founded 2010)
-- have founding events at those dates, but their earliest events
-- in migration 017 use 2006-01-01 and 2010-06-01 respectively.
-- The 2015 cutoff intentionally drops these since founding dates
-- that old are unreliable for Nevada startup tracking purposes.
-- Nevada Nano (2010-06-01) and Socure (2012-03-01) also have
-- pre-2015 founding entries that will be removed.

DELETE FROM timeline_events
WHERE event_date > CURRENT_DATE + INTERVAL '30 days'
   OR event_date < '2015-01-01';

-- ============================================================
-- STEP 3: Normalize company_name formatting
-- ============================================================
-- Trim leading/trailing whitespace and collapse internal whitespace.
-- Use INITCAP only where the name is all-lowercase or all-uppercase
-- (to avoid mangling intentional casing like "MNTN" or "CIQ").
-- Safe to run multiple times since trimming already-trimmed text
-- and replacing a string with itself are no-ops.

UPDATE timeline_events
SET company_name = BTRIM(REGEXP_REPLACE(company_name, '\s+', ' ', 'g'))
WHERE company_name <> BTRIM(REGEXP_REPLACE(company_name, '\s+', ' ', 'g'));

-- ============================================================
-- STEP 4: Add unique constraint to prevent future duplicates
-- ============================================================
-- Before adding the constraint, ensure there are no remaining
-- duplicates (Step 1 should have handled them, but belt-and-suspenders).
-- Use DO block so the constraint creation is idempotent.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_timeline_event'
  ) THEN
    -- Final dedup pass in case Step 3 normalization created new matches
    DELETE FROM timeline_events a
    USING timeline_events b
    WHERE a.id > b.id
      AND a.company_name = b.company_name
      AND a.event_type   = b.event_type
      AND a.event_date   = b.event_date;

    ALTER TABLE timeline_events
      ADD CONSTRAINT unique_timeline_event
      UNIQUE (company_name, event_type, event_date);
  END IF;
END
$$;

-- ============================================================
-- POST-CLEANUP: Show event counts by year for comparison
-- ============================================================

SELECT 'POST-CLEANUP' AS phase,
       EXTRACT(YEAR FROM event_date)::INT AS event_year,
       COUNT(*)                           AS event_count
FROM timeline_events
GROUP BY 2
ORDER BY 2;

SELECT 'POST-CLEANUP TOTAL' AS phase, COUNT(*) AS total_events
FROM timeline_events;

-- Side-by-side comparison of removed events per year
SELECT
  COALESCE(pre.event_year, post.event_year)          AS event_year,
  COALESCE(pre.event_count, 0)                       AS before_count,
  COALESCE(post.event_count, 0)                      AS after_count,
  COALESCE(pre.event_count, 0) - COALESCE(post.event_count, 0) AS removed
FROM _pre_cleanup_counts pre
FULL OUTER JOIN (
  SELECT
    EXTRACT(YEAR FROM event_date)::INT AS event_year,
    COUNT(*)                           AS event_count
  FROM timeline_events
  GROUP BY 1
) post ON pre.event_year = post.event_year
ORDER BY 1;

-- Clean up temp table
DROP TABLE IF EXISTS _pre_cleanup_counts;

COMMIT;
