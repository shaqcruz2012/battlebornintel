-- Migration 070: Fix accelerator relationship types
--
-- Accelerators (a_*) don't "invest" in companies — they accelerate, mentor,
-- and incubate them. Two edges incorrectly use "invested_in":
--
--   a_gener8tor → c_81 | invested_in  →  accelerated_by
--   a_techstars → c_94 | invested_in  →  accelerated_by
--
-- We use "accelerated_by" (not "accelerated") because that is the established
-- convention throughout the database and frontend (constants.js, graph-builder.js,
-- KnowledgeFundPanel.jsx, stakeholders.js, edges.js). The rel label describes
-- the nature of the relationship; direction is captured by source/target.
--
-- Audit summary (all a_* edges reviewed 2026-03-09):
--   - accelerated_by : 15 edges (13 from a_startupnv + 2 being fixed here)
--   - collaborated_with : 4 edges (inter-accelerator partnerships)
--   - housed_at : 2 edges (a_blackfire → e_unlvtech, a_innevator → e_innevation)
--   - invested_in : 2 edges (THE TWO BEING FIXED)
--   - program_of : 4 edges (sub-program relationships)
--
-- Previously fixed by migration 067:
--   - x_goed → c_56 | invested_in → grants_to (and reassigned to e_goed)
--   - e_goed → c_99 | invested_in → grants_to
--
-- All statements are idempotent (WHERE conditions match only current state).

BEGIN;

-- ============================================================
-- Fix 1: a_gener8tor → c_81 "invested_in" → "accelerated_by"
-- gener8tor is an accelerator, not an investor. It accelerated
-- Beloit Kombucha through its program.
-- ============================================================
UPDATE graph_edges
   SET rel  = 'accelerated_by',
       note = 'gener8tor accelerator program — Beloit Kombucha seed cohort 2023.'
 WHERE source_id = 'a_gener8tor'
   AND target_id = 'c_81'
   AND rel = 'invested_in';

-- ============================================================
-- Fix 2: a_techstars → c_94 "invested_in" → "accelerated_by"
-- Techstars is an accelerator. Elly Health participated in
-- their healthcare accelerator program.
-- ============================================================
UPDATE graph_edges
   SET rel  = 'accelerated_by',
       note = 'Techstars healthcare accelerator program participant.'
 WHERE source_id = 'a_techstars'
   AND target_id = 'c_94'
   AND rel = 'invested_in';

-- ============================================================
-- Verification: no accelerator entity should use "invested_in"
-- ============================================================
DO $$
DECLARE
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count
    FROM graph_edges
   WHERE source_id LIKE 'a_%'
     AND rel = 'invested_in';

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: % accelerator edge(s) still use invested_in', bad_count;
  END IF;
END $$;

COMMIT;
