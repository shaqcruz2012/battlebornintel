-- Migration 047: Sync fund company_count with actual eligible companies
--
-- Problem: funds.company_count is stale / manually maintained.
--          The source of truth is companies.eligible (TEXT[]), which holds
--          the fund IDs each company is eligible for.
--
-- This migration sets each fund's company_count to the real count of
-- companies whose eligible array contains that fund's ID.
--
-- Idempotent: uses a plain UPDATE (no schema changes), safe to run
--             multiple times — the result is always the correct count.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/047_sync_fund_company_counts.sql

BEGIN;

-- ============================================================
-- STEP 1: Snapshot current counts for verification
-- ============================================================

CREATE TEMP TABLE _fund_counts_before AS
SELECT id, name, company_count AS old_count
FROM funds;

-- ============================================================
-- STEP 2: Update company_count from companies.eligible
-- ============================================================

UPDATE funds f
SET company_count = (
  SELECT COUNT(*)
  FROM companies c
  WHERE f.id = ANY(c.eligible)
),
updated_at = NOW();

-- ============================================================
-- STEP 3: Verification — show before vs after
-- ============================================================

SELECT
  b.id,
  b.name,
  b.old_count,
  f.company_count AS new_count,
  CASE
    WHEN b.old_count = f.company_count THEN 'unchanged'
    ELSE 'UPDATED'
  END AS status
FROM _fund_counts_before b
JOIN funds f ON f.id = b.id
ORDER BY f.name;

-- Temp table is automatically dropped at end of session,
-- but drop explicitly for clarity.
DROP TABLE _fund_counts_before;

COMMIT;
