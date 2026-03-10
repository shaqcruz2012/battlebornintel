-- Migration 072: Final audit sweep — comprehensive data integrity cleanup
--
-- This migration runs LAST (after 066-070) and performs a final sweep for
-- any remaining data integrity issues in graph_edges.
--
-- Issues found and fixed:
--
--   1. ORPHANED EDGES (5 edges): 'goed-nv' is referenced as source/target but
--      does not exist in any entity table. Migration 067 deleted the external
--      entry but missed reassigning its edges. Fix: remap goed-nv -> e_goed.
--
--   2. IMPOSSIBLE RELATIONSHIPS (5 edges): f_bbv, f_fundnv, f_angelnv, f_sierra,
--      f_startupnv all have 'invested_in' edges pointing to e_nevada-ecosystem.
--      Funds invest in companies, not ecosystem orgs. These describe fund activity
--      supporting the ecosystem. Fix: change rel from 'invested_in' to 'supports'.
--
--   3. SINGLETON REL TYPE NORMALIZATION (9 edges): Several relationship types
--      appear as one-off variants of canonical types:
--        a. 'invests_in' (1 edge) -> 'invested_in' (canonical per REL_CFG)
--        b. 'spun_out_from' (1 edge) -> 'spinout_of' (canonical; 10 existing)
--        c. 'contracted_with' (1 edge) -> 'contracts_with' (canonical per REL_CFG)
--        d. 'partnered_with' (6 edges) -> 'partners_with' (canonical per REL_CFG; 134 existing)
--
--   4. SELF-LOOPS: 0 found (clean)
--   5. DUPLICATE EDGES: 0 found (clean, fixed by migration 065)
--   6. NULL/EMPTY FIELDS: 0 found (clean)
--   7. BBV PORTFOLIO VERIFICATION: c_79 (AIR Corp) and c_99 (Heligenics) are
--      legitimate companies in the companies table. Confirmed valid.
--   8. University invested_in: u_unlv_rebel -> c_127 is VALID (UNLV Rebel Fund
--      is a student-run VC fund that makes actual seed investments).
--
-- All statements are idempotent.

BEGIN;

-- ============================================================
-- FIX 1: Remap orphaned goed-nv edges to canonical e_goed
-- Migration 067 deleted the goed-nv external but missed these 5 edges.
-- ============================================================

-- 1a. Edges where goed-nv is the source (2 edges)
UPDATE graph_edges
   SET source_id   = 'e_goed',
       source_type = 'ecosystem_org'
 WHERE source_id = 'goed-nv'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = 'e_goed'
        AND dup.target_id = graph_edges.target_id
        AND dup.rel       = graph_edges.rel
   );

-- 1b. Edges where goed-nv is the target (3 edges)
UPDATE graph_edges
   SET target_id   = 'e_goed',
       target_type = 'ecosystem_org'
 WHERE target_id = 'goed-nv'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = graph_edges.source_id
        AND dup.target_id = 'e_goed'
        AND dup.rel       = graph_edges.rel
   );

-- 1c. Delete any remaining goed-nv edges that couldn't be remapped
--     (would be duplicates of existing e_goed edges)
DELETE FROM graph_edges WHERE source_id = 'goed-nv';
DELETE FROM graph_edges WHERE target_id = 'goed-nv';

-- ============================================================
-- FIX 2: Funds -> e_nevada-ecosystem 'invested_in' -> 'supports'
-- Funds don't invest in ecosystem orgs; they support/participate in them.
-- ============================================================

UPDATE graph_edges
   SET rel = 'supports'
 WHERE target_id = 'e_nevada-ecosystem'
   AND rel = 'invested_in'
   AND source_id LIKE 'f_%';

-- ============================================================
-- FIX 3a: Normalize 'invests_in' -> 'invested_in'
-- 1 edge: x_223 -> c_5 (Station Casinos $25M venture fund -> 1047 Games)
-- ============================================================

UPDATE graph_edges
   SET rel = 'invested_in'
 WHERE rel = 'invests_in'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = graph_edges.source_id
        AND dup.target_id = graph_edges.target_id
        AND dup.rel = 'invested_in'
   );

-- ============================================================
-- FIX 3b: Normalize 'spun_out_from' -> 'spinout_of'
-- 1 edge: c_99 -> u_unlv (Heligenics spinoff from UNLV)
-- ============================================================

UPDATE graph_edges
   SET rel = 'spinout_of'
 WHERE rel = 'spun_out_from'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = graph_edges.source_id
        AND dup.target_id = graph_edges.target_id
        AND dup.rel = 'spinout_of'
   );

-- ============================================================
-- FIX 3c: Normalize 'contracted_with' -> 'contracts_with'
-- 1 edge: c_77 -> x_usaf (Adaract SBIR Air Force contract)
-- ============================================================

UPDATE graph_edges
   SET rel = 'contracts_with'
 WHERE rel = 'contracted_with'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = graph_edges.source_id
        AND dup.target_id = graph_edges.target_id
        AND dup.rel = 'contracts_with'
   );

-- ============================================================
-- FIX 3d: Normalize 'partnered_with' -> 'partners_with'
-- 6 edges (c_76->x_caesars, c_76->x_mgm, c_79->x_nasa,
--          c_80->x_parlay6, c_94->u_cedars_sinai, c_99->u_roseman_univ)
-- ============================================================

UPDATE graph_edges
   SET rel = 'partners_with'
 WHERE rel = 'partnered_with'
   AND NOT EXISTS (
     SELECT 1 FROM graph_edges AS dup
      WHERE dup.source_id = graph_edges.source_id
        AND dup.target_id = graph_edges.target_id
        AND dup.rel = 'partners_with'
   );

-- ============================================================
-- SAFETY NET: Delete any remaining self-loops (defensive)
-- ============================================================

DELETE FROM graph_edges WHERE source_id = target_id;

-- ============================================================
-- SAFETY NET: Delete any remaining null/empty endpoints (defensive)
-- ============================================================

DELETE FROM graph_edges WHERE source_id IS NULL OR source_id = '';
DELETE FROM graph_edges WHERE target_id IS NULL OR target_id = '';

-- ============================================================
-- SAFETY NET: Deduplicate any remaining (source_id, target_id, rel)
-- triples, keeping the row with the lowest id (defensive).
-- ============================================================

DELETE FROM graph_edges
 WHERE id NOT IN (
   SELECT MIN(id)
   FROM graph_edges
   GROUP BY source_id, target_id, rel
 );

-- ============================================================
-- VERIFICATION BLOCK: Assert zero issues remain
-- ============================================================

DO $$
DECLARE
  v_self_loops     INTEGER;
  v_duplicates     INTEGER;
  v_null_endpoints INTEGER;
  v_goed_nv        INTEGER;
BEGIN
  -- Self-loops
  SELECT COUNT(*) INTO v_self_loops
    FROM graph_edges WHERE source_id = target_id;
  IF v_self_loops > 0 THEN
    RAISE EXCEPTION 'AUDIT FAILED: % self-loop edges remain', v_self_loops;
  END IF;

  -- Duplicate (source_id, target_id, rel) triples
  SELECT COUNT(*) INTO v_duplicates FROM (
    SELECT source_id, target_id, rel
      FROM graph_edges
     GROUP BY source_id, target_id, rel
    HAVING COUNT(*) > 1
  ) sub;
  IF v_duplicates > 0 THEN
    RAISE EXCEPTION 'AUDIT FAILED: % duplicate edge triples remain', v_duplicates;
  END IF;

  -- Null/empty endpoints
  SELECT COUNT(*) INTO v_null_endpoints
    FROM graph_edges
   WHERE source_id IS NULL OR source_id = ''
      OR target_id IS NULL OR target_id = '';
  IF v_null_endpoints > 0 THEN
    RAISE EXCEPTION 'AUDIT FAILED: % null/empty endpoint edges remain', v_null_endpoints;
  END IF;

  -- goed-nv orphan
  SELECT COUNT(*) INTO v_goed_nv
    FROM graph_edges
   WHERE source_id = 'goed-nv' OR target_id = 'goed-nv';
  IF v_goed_nv > 0 THEN
    RAISE EXCEPTION 'AUDIT FAILED: % goed-nv orphan edges remain', v_goed_nv;
  END IF;

  RAISE NOTICE 'AUDIT PASSED: All integrity checks clean.';
END $$;

-- ============================================================
-- REFRESH materialized view for the API/frontend
-- ============================================================

REFRESH MATERIALIZED VIEW graph_data_snapshot;

COMMIT;
