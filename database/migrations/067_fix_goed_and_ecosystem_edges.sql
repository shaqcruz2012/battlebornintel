-- Migration 067: Fix impossible GOED relationships and deduplicate GOED nodes
--
-- Problems addressed:
--   1. e_goed → c_99 (Heligenics) has rel "invested_in" — GOED doesn't invest;
--      this was a Knowledge Fund grant. Change to "grants_to".
--   2. e_goed → c_79 (AIR Corp) has rel "funded" — GOED provides grants/incentives,
--      not direct VC-style funding. Change to "grants_to".
--   3. x_goed → c_56 (WaterStart) has rel "invested_in" — same problem.
--      Change to "grants_to".
--   4. Duplicate GOED nodes: x_goed and goed-nv in externals duplicate the
--      canonical e_goed in ecosystem_orgs. Reassign all x_goed edges to e_goed,
--      then delete both duplicate external entries.
--
-- All statements are idempotent.

BEGIN;

-- ============================================================
-- Fix 1: e_goed → c_99 "invested_in" → "grants_to"
-- GOED $2.5M Knowledge Fund grant to Heligenics is a grant, not an investment.
-- ============================================================
UPDATE graph_edges
   SET rel  = 'grants_to',
       note = 'GOED $2.5M Knowledge Fund grant to Heligenics.'
 WHERE source_id = 'e_goed'
   AND target_id = 'c_99'
   AND rel = 'invested_in';

-- ============================================================
-- Fix 2: e_goed → c_79 "funded" → "grants_to"
-- GOED provides grants/incentives, not direct VC-style funding.
-- ============================================================
UPDATE graph_edges
   SET rel  = 'grants_to',
       note = 'Nevada GOED strategic grant/incentive for AIR Corp autonomous robotics.'
 WHERE source_id = 'e_goed'
   AND target_id = 'c_79'
   AND rel = 'funded';

-- ============================================================
-- Fix 3: x_goed → c_56 "invested_in" → "grants_to"
-- Governor's Office WaterStart relationship is a grant, not investment.
-- (This edge will also be reassigned to e_goed in Fix 4 below.)
-- ============================================================
UPDATE graph_edges
   SET rel  = 'grants_to',
       note = 'GOED $1.8M grant to WaterStart 2025.'
 WHERE source_id = 'x_goed'
   AND target_id = 'c_56'
   AND rel = 'invested_in';

-- ============================================================
-- Fix 4: Reassign all x_goed edges to canonical e_goed
-- x_goed is a duplicate external node that should not exist.
-- Reassign source_id and source_type for all its edges.
-- ============================================================
UPDATE graph_edges
   SET source_id   = 'e_goed',
       source_type = 'ecosystem_org'
 WHERE source_id = 'x_goed';

-- Also reassign any edges where x_goed is the target (none expected, but safe)
UPDATE graph_edges
   SET target_id   = 'e_goed',
       target_type = 'ecosystem_org'
 WHERE target_id = 'x_goed';

-- ============================================================
-- Fix 5: Reassign any goed-nv edges to canonical e_goed
-- goed-nv has no edges currently, but this is defensive.
-- ============================================================
UPDATE graph_edges
   SET source_id   = 'e_goed',
       source_type = 'ecosystem_org'
 WHERE source_id = 'goed-nv';

UPDATE graph_edges
   SET target_id   = 'e_goed',
       target_type = 'ecosystem_org'
 WHERE target_id = 'goed-nv';

-- ============================================================
-- Fix 6: Delete duplicate GOED external entries
-- The canonical GOED is e_goed in ecosystem_orgs.
-- x_goed and goed-nv in externals are duplicates.
-- ============================================================
DELETE FROM externals WHERE id = 'x_goed';
DELETE FROM externals WHERE id = 'goed-nv';

COMMIT;
