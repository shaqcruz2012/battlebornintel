-- Migration 076: Deduplicate stakeholder_activities
-- Removes duplicate rows (same company_id + activity_type + activity_date),
-- keeping the row with the lowest id (oldest insert).
-- Adds a unique index to prevent future duplicates.

BEGIN;

-- 1. Delete duplicate rows, keeping the one with the lowest id
DELETE FROM stakeholder_activities a
USING stakeholder_activities b
WHERE a.company_id = b.company_id
  AND a.activity_type = b.activity_type
  AND a.activity_date = b.activity_date
  AND a.id > b.id;

-- 2. Add unique index to prevent future duplicates (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_stakeholder_activity
  ON stakeholder_activities (company_id, activity_type, activity_date);

COMMIT;
