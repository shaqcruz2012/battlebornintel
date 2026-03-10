-- Migration 073: Fix timeline_events event_type casing inconsistencies
--
-- The timeline_events table has mixed casing for event_type values.
-- Proper Title Case entries (correct): Award, Expansion, Founding, Funding,
-- Grant, Hiring, Launch, Milestone, Partnership, Patent.
--
-- Lowercase entries (wrong) need to be normalized:
--   'accelerator' -> 'Milestone'  (accelerator activities are milestones)
--   'award'       -> 'Award'
--   'funding'     -> 'Funding'
--   'grant'       -> 'Grant'
--   'hiring'      -> 'Hiring'
--   'launch'      -> 'Launch'
--   'milestone'   -> 'Milestone'
--   'momentum'    -> 'Milestone'  (momentum events are milestones)
--   'partnership' -> 'Partnership'
--   'patent'      -> 'Patent'
--
-- The UNIQUE constraint on (company_name, event_type, event_date) means that
-- updating casing can cause conflicts when a Title Case row already exists
-- for the same company + date. In those cases the lowercase duplicate is
-- deleted rather than updated.
--
-- Conflict analysis (27 rows have a matching Title Case sibling):
--   These lowercase rows will be DELETED because the correct Title Case
--   version already exists for the same (company_name, event_date).
--
-- Non-conflict rows (33 rows) will be UPDATED to Title Case directly.

BEGIN;

-- ============================================================
-- Step 1: DELETE lowercase rows that would conflict with
--         existing Title Case rows on the unique constraint
-- ============================================================
DELETE FROM timeline_events
WHERE id IN (
  SELECT lo.id
  FROM timeline_events lo
  JOIN timeline_events hi
    ON lo.company_name = hi.company_name
    AND lo.event_date  = hi.event_date
  WHERE
    (lo.event_type = 'award'       AND hi.event_type = 'Award')
    OR (lo.event_type = 'funding'     AND hi.event_type = 'Funding')
    OR (lo.event_type = 'grant'       AND hi.event_type = 'Grant')
    OR (lo.event_type = 'hiring'      AND hi.event_type = 'Hiring')
    OR (lo.event_type = 'launch'      AND hi.event_type = 'Launch')
    OR (lo.event_type = 'milestone'   AND hi.event_type = 'Milestone')
    OR (lo.event_type = 'partnership' AND hi.event_type = 'Partnership')
    OR (lo.event_type = 'patent'      AND hi.event_type = 'Patent')
    OR (lo.event_type = 'accelerator' AND hi.event_type = 'Milestone')
    OR (lo.event_type = 'momentum'    AND hi.event_type = 'Milestone')
);

-- ============================================================
-- Step 2: UPDATE remaining lowercase rows to Title Case
-- ============================================================

-- Map 'accelerator' to 'Milestone'
UPDATE timeline_events SET event_type = 'Milestone' WHERE event_type = 'accelerator';

-- Map 'momentum' to 'Milestone'
UPDATE timeline_events SET event_type = 'Milestone' WHERE event_type = 'momentum';

-- Direct casing fixes
UPDATE timeline_events SET event_type = 'Award'       WHERE event_type = 'award';
UPDATE timeline_events SET event_type = 'Funding'     WHERE event_type = 'funding';
UPDATE timeline_events SET event_type = 'Grant'       WHERE event_type = 'grant';
UPDATE timeline_events SET event_type = 'Hiring'      WHERE event_type = 'hiring';
UPDATE timeline_events SET event_type = 'Launch'      WHERE event_type = 'launch';
UPDATE timeline_events SET event_type = 'Milestone'   WHERE event_type = 'milestone';
UPDATE timeline_events SET event_type = 'Partnership' WHERE event_type = 'partnership';
UPDATE timeline_events SET event_type = 'Patent'      WHERE event_type = 'patent';

COMMIT;
