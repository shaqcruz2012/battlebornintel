-- Migration 075: Normalize stakeholder_activities.company_id to slug format
--
-- Problem: company_id column contains mixed formats:
--   - Numeric IDs referencing companies.id (e.g. '1', '2', '3')
--   - Slug-format strings (e.g. 'abnormal-ai', 'boxabl')
--   - Special case: '1864' which refers to '1864 Capital', not company id #1864
--
-- This migration converts all numeric company_ids to their corresponding
-- company slug, making the column consistently use slug format.

BEGIN;

-- Step 1: Log current state before changes
DO $$
DECLARE
  total_rows    INTEGER;
  numeric_rows  INTEGER;
  matched_rows  INTEGER;
  unmatched_numeric INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM stakeholder_activities;
  SELECT COUNT(*) INTO numeric_rows FROM stakeholder_activities WHERE company_id ~ '^[0-9]+$';
  SELECT COUNT(*) INTO matched_rows
    FROM stakeholder_activities sa
    JOIN companies c ON c.id = sa.company_id::integer
    WHERE sa.company_id ~ '^[0-9]+$';
  unmatched_numeric := numeric_rows - matched_rows;

  RAISE NOTICE '=== Migration 075: Normalize stakeholder company_ids ===';
  RAISE NOTICE 'Total stakeholder_activities rows: %', total_rows;
  RAISE NOTICE 'Rows with numeric company_id: %', numeric_rows;
  RAISE NOTICE '  - With matching company: %', matched_rows;
  RAISE NOTICE '  - Without matching company (will handle separately): %', unmatched_numeric;
END $$;

-- Step 2: Convert numeric company_ids that match a company record to their slug
UPDATE stakeholder_activities sa
SET company_id = c.slug
FROM companies c
WHERE sa.company_id ~ '^[0-9]+$'
  AND c.id = sa.company_id::integer;

-- Step 3: Handle special case - '1864' refers to '1864 Capital', not company id 1864
-- Convert to slug format '1864-capital' for consistency with other references
UPDATE stakeholder_activities
SET company_id = '1864-capital'
WHERE company_id = '1864';

-- Step 4: Log results after changes
DO $$
DECLARE
  remaining_numeric INTEGER;
  slug_count        INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_numeric
    FROM stakeholder_activities
    WHERE company_id ~ '^[0-9]+$';
  SELECT COUNT(DISTINCT company_id) INTO slug_count
    FROM stakeholder_activities;

  RAISE NOTICE '=== Post-migration results ===';
  RAISE NOTICE 'Remaining numeric company_ids: % (should be 0)', remaining_numeric;
  RAISE NOTICE 'Distinct company_id values (all slug format now): %', slug_count;
END $$;

COMMIT;
