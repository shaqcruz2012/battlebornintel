-- Migration 074: Classify NULL stakeholder_type values in stakeholder_activities
--
-- Problem: 588 of 632 stakeholder_activities rows have NULL stakeholder_type.
-- The stakeholder_type column has a CHECK constraint allowing:
--   'gov_policy', 'university', 'corporate', 'risk_capital', 'ecosystem'
--
-- Classification rules (by activity_type):
--   Funding      -> 'risk_capital'   (venture funding rounds)
--   Partnership  -> 'corporate'      (corporate partnerships)
--   Award        -> 'gov_policy'     (government/GOED awards)
--   Acquisition  -> 'corporate'      (corporate acquisitions)
--   Expansion    -> 'corporate'      (corporate expansions)
--   Hiring       -> 'corporate'      (corporate hiring activity)
--   Milestone    -> 'ecosystem'      (ecosystem milestones)
--   Grant        -> 'gov_policy'     (government grants)
--   Launch       -> 'ecosystem'      (ecosystem launches)
--   Patent       -> 'ecosystem'      (ecosystem IP activity)
--
-- Safety: Only updates rows WHERE stakeholder_type IS NULL.
-- All statements are idempotent.

BEGIN;

-- ============================================================
-- CLASSIFY: Map activity_type -> stakeholder_type for NULL rows
-- ============================================================

-- risk_capital: Funding rounds
UPDATE stakeholder_activities
   SET stakeholder_type = 'risk_capital'
 WHERE stakeholder_type IS NULL
   AND activity_type = 'Funding';

-- corporate: Partnership, Acquisition, Expansion, Hiring
UPDATE stakeholder_activities
   SET stakeholder_type = 'corporate'
 WHERE stakeholder_type IS NULL
   AND activity_type IN ('Partnership', 'Acquisition', 'Expansion', 'Hiring');

-- gov_policy: Award, Grant
UPDATE stakeholder_activities
   SET stakeholder_type = 'gov_policy'
 WHERE stakeholder_type IS NULL
   AND activity_type IN ('Award', 'Grant');

-- ecosystem: Milestone, Launch, Patent
UPDATE stakeholder_activities
   SET stakeholder_type = 'ecosystem'
 WHERE stakeholder_type IS NULL
   AND activity_type IN ('Milestone', 'Launch', 'Patent');

-- ============================================================
-- VERIFICATION: Assert zero NULL stakeholder_type rows remain
-- ============================================================

DO $$
DECLARE
  v_null_count INTEGER;
  v_total      INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_null_count
    FROM stakeholder_activities
   WHERE stakeholder_type IS NULL;

  IF v_null_count > 0 THEN
    RAISE EXCEPTION 'CLASSIFICATION FAILED: % rows still have NULL stakeholder_type', v_null_count;
  END IF;

  SELECT COUNT(*) INTO v_total FROM stakeholder_activities;
  RAISE NOTICE 'CLASSIFICATION PASSED: All % stakeholder_activities rows have a stakeholder_type.', v_total;
END $$;

COMMIT;
