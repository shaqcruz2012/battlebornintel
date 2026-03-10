-- Migration 077: Backfill timeline_events.company_id from company_name
--
-- Problem: All 250 rows in timeline_events have company_id = NULL even though
-- they have company_name values that can be matched to companies.
--
-- Strategy:
--   1. Match by exact name (case-insensitive): company_name = companies.name
--   2. Match by derived slug: slugify(company_name) = companies.slug
--   3. Remaining unmatched rows are mostly orgs/institutions not in companies table

BEGIN;

-- Step 1: Backfill by exact name match (case-insensitive)
UPDATE timeline_events te
SET company_id = c.id
FROM companies c
WHERE te.company_id IS NULL
  AND LOWER(TRIM(te.company_name)) = LOWER(TRIM(c.name));

-- Step 2: Backfill by slug match for any remaining NULLs
-- Convert company_name to slug format: lowercase, strip non-alphanumeric (keep spaces/hyphens),
-- replace spaces with hyphens
UPDATE timeline_events te
SET company_id = c.id
FROM companies c
WHERE te.company_id IS NULL
  AND LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(te.company_name), '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g')) = c.slug;

COMMIT;
