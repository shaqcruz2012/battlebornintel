-- Migration 071: Remove cross-table duplicate externals
--
-- After migration 068 consolidated intra-externals duplicates, 10 external nodes
-- still duplicate entities that exist in proper entity tables (accelerators,
-- graph_funds). This migration:
--
--   1. Reassigns graph_edges from duplicate external IDs to proper entity IDs
--   2. Deletes redundant edges where the proper entity already has the same
--      (source_id, target_id, rel) combination
--   3. Removes the duplicate external rows
--   4. Refreshes the graph_data_snapshot materialized view
--
-- Entities handled:
--   External ID            -> Proper ID       Table
--   i_angelnv              -> f_angelnv        graph_funds (fund)
--   x_battlebornventure    -> f_bbv            graph_funds (fund)
--   x_desert_forge         -> f_dfv            graph_funds (fund)
--   x_fundnv               -> f_fundnv         graph_funds (fund)
--   x_startupnv_113        -> f_startupnv      graph_funds (fund)
--   x_stripes              -> f_stripes        graph_funds (fund)
--   x_234 (Sierra Angels)  -> f_sierra         graph_funds (fund)
--   x_gener8tor            -> a_gener8tor      accelerators
--   x_gener8tor_lv         -> a_gener8tor_lv   accelerators
--   x_techstars            -> a_techstars      accelerators
--
-- NOT handled (no proper entity exists):
--   x_vegastechfund — remains in externals
--
-- Skipped (already handled in migration 067):
--   x_goed — reassigned to e_goed and deleted
--
-- All statements are IDEMPOTENT. Safe to run multiple times.

BEGIN;

-- ============================================================
-- STEP 1: Delete redundant edges where the proper entity
--         already has an identical (source_id, target_id, rel)
-- ============================================================
-- These duplicate edges would cause duplicates after reassignment.
-- We delete the external's edge since the proper entity's edge is
-- authoritative.

-- x_battlebornventure -> c_107 invested_in (f_bbv -> c_107 invested_in exists)
DELETE FROM graph_edges
 WHERE source_id = 'x_battlebornventure'
   AND target_id = 'c_107'
   AND rel       = 'invested_in';

-- x_battlebornventure -> c_41 invested_in (f_bbv -> c_41 invested_in exists)
DELETE FROM graph_edges
 WHERE source_id = 'x_battlebornventure'
   AND target_id = 'c_41'
   AND rel       = 'invested_in';

-- x_battlebornventure -> c_89 invested_in (f_bbv -> c_89 invested_in exists)
DELETE FROM graph_edges
 WHERE source_id = 'x_battlebornventure'
   AND target_id = 'c_89'
   AND rel       = 'invested_in';

-- x_fundnv -> c_63 invested_in (f_fundnv -> c_63 invested_in exists)
DELETE FROM graph_edges
 WHERE source_id = 'x_fundnv'
   AND target_id = 'c_63'
   AND rel       = 'invested_in';

-- x_gener8tor -> c_81 accelerated_by (a_gener8tor -> c_81 accelerated_by exists)
DELETE FROM graph_edges
 WHERE source_id = 'x_gener8tor'
   AND target_id = 'c_81'
   AND rel       = 'accelerated_by';

-- ============================================================
-- STEP 2: Reassign invested_in edges to proper fund IDs (f_*)
-- ============================================================

-- AngelNV: i_angelnv -> f_angelnv
-- Edges: i_angelnv -> c_77 invested_in, i_angelnv -> c_114 invested_in
UPDATE graph_edges
   SET source_id   = 'f_angelnv',
       source_type = 'fund'
 WHERE source_id = 'i_angelnv'
   AND rel = 'invested_in';

-- FundNV: x_fundnv -> f_fundnv
-- Remaining edges: x_fundnv -> c_100, c_101, c_108 invested_in (c_63 deleted above)
UPDATE graph_edges
   SET source_id   = 'f_fundnv',
       source_type = 'fund'
 WHERE source_id = 'x_fundnv'
   AND rel = 'invested_in';

-- Desert Forge Ventures: x_desert_forge -> f_dfv
-- Edges: x_desert_forge -> c_121, c_124 invested_in
UPDATE graph_edges
   SET source_id   = 'f_dfv',
       source_type = 'fund'
 WHERE source_id = 'x_desert_forge'
   AND rel = 'invested_in';

-- StartUpNV: x_startupnv_113 -> f_startupnv
-- Edges: x_startupnv_113 -> c_113 invested_in
UPDATE graph_edges
   SET source_id   = 'f_startupnv',
       source_type = 'fund'
 WHERE source_id = 'x_startupnv_113'
   AND rel = 'invested_in';

-- Stripes: x_stripes -> f_stripes
-- Edges: x_stripes -> c_10 invested_in
UPDATE graph_edges
   SET source_id   = 'f_stripes',
       source_type = 'fund'
 WHERE source_id = 'x_stripes'
   AND rel = 'invested_in';

-- ============================================================
-- STEP 3: Reassign Sierra Angels edges (partners_with)
-- ============================================================
-- x_234 (Sierra Angels) -> f_sierra
-- Edge: x_234 -> x_235 partners_with
UPDATE graph_edges
   SET source_id   = 'f_sierra',
       source_type = 'fund'
 WHERE source_id = 'x_234'
   AND rel = 'partners_with';

-- Also fix the reverse direction: x_235 -> x_234 partners_with
UPDATE graph_edges
   SET target_id   = 'f_sierra',
       target_type = 'fund'
 WHERE target_id = 'x_234'
   AND rel = 'partners_with';

-- ============================================================
-- STEP 4: Reassign accelerated_by edges to accelerator IDs (a_*)
-- ============================================================

-- gener8tor: x_gener8tor -> a_gener8tor
-- Remaining edges: x_gener8tor -> c_104, c_109 accelerated_by (c_81 deleted above)
UPDATE graph_edges
   SET source_id   = 'a_gener8tor',
       source_type = 'accelerator'
 WHERE source_id = 'x_gener8tor'
   AND rel = 'accelerated_by';

-- gener8tor Las Vegas: x_gener8tor_lv -> a_gener8tor_lv
-- Edges: x_gener8tor_lv -> c_91 accelerated_by
UPDATE graph_edges
   SET source_id   = 'a_gener8tor_lv',
       source_type = 'accelerator'
 WHERE source_id = 'x_gener8tor_lv'
   AND rel = 'accelerated_by';

-- Techstars: x_techstars -> a_techstars
-- Edges: x_techstars -> c_86 accelerated_by
UPDATE graph_edges
   SET source_id   = 'a_techstars',
       source_type = 'accelerator'
 WHERE source_id = 'x_techstars'
   AND rel = 'accelerated_by';

-- ============================================================
-- STEP 5: Catch-all — reassign any remaining edges from these
--         external IDs (covers unexpected edge cases)
-- ============================================================
-- Battle Born Venture: all invested_in edges were deleted in Step 1,
-- but handle any other rels defensively
UPDATE graph_edges
   SET source_id   = 'f_bbv',
       source_type = 'fund'
 WHERE source_id = 'x_battlebornventure';

UPDATE graph_edges
   SET target_id   = 'f_bbv',
       target_type = 'fund'
 WHERE target_id = 'x_battlebornventure';

-- Catch-all for any remaining i_angelnv edges (non invested_in)
UPDATE graph_edges
   SET source_id   = 'f_angelnv',
       source_type = 'fund'
 WHERE source_id = 'i_angelnv';

UPDATE graph_edges
   SET target_id   = 'f_angelnv',
       target_type = 'fund'
 WHERE target_id = 'i_angelnv';

-- Catch-all for x_fundnv
UPDATE graph_edges
   SET source_id   = 'f_fundnv',
       source_type = 'fund'
 WHERE source_id = 'x_fundnv';

UPDATE graph_edges
   SET target_id   = 'f_fundnv',
       target_type = 'fund'
 WHERE target_id = 'x_fundnv';

-- Catch-all for x_desert_forge
UPDATE graph_edges
   SET source_id   = 'f_dfv',
       source_type = 'fund'
 WHERE source_id = 'x_desert_forge';

UPDATE graph_edges
   SET target_id   = 'f_dfv',
       target_type = 'fund'
 WHERE target_id = 'x_desert_forge';

-- Catch-all for x_startupnv_113
UPDATE graph_edges
   SET source_id   = 'f_startupnv',
       source_type = 'fund'
 WHERE source_id = 'x_startupnv_113';

UPDATE graph_edges
   SET target_id   = 'f_startupnv',
       target_type = 'fund'
 WHERE target_id = 'x_startupnv_113';

-- Catch-all for x_stripes
UPDATE graph_edges
   SET source_id   = 'f_stripes',
       source_type = 'fund'
 WHERE source_id = 'x_stripes';

UPDATE graph_edges
   SET target_id   = 'f_stripes',
       target_type = 'fund'
 WHERE target_id = 'x_stripes';

-- Catch-all for x_234
UPDATE graph_edges
   SET source_id   = 'f_sierra',
       source_type = 'fund'
 WHERE source_id = 'x_234';

UPDATE graph_edges
   SET target_id   = 'f_sierra',
       target_type = 'fund'
 WHERE target_id = 'x_234';

-- Catch-all for x_gener8tor
UPDATE graph_edges
   SET source_id   = 'a_gener8tor',
       source_type = 'accelerator'
 WHERE source_id = 'x_gener8tor';

UPDATE graph_edges
   SET target_id   = 'a_gener8tor',
       target_type = 'accelerator'
 WHERE target_id = 'x_gener8tor';

-- Catch-all for x_gener8tor_lv
UPDATE graph_edges
   SET source_id   = 'a_gener8tor_lv',
       source_type = 'accelerator'
 WHERE source_id = 'x_gener8tor_lv';

UPDATE graph_edges
   SET target_id   = 'a_gener8tor_lv',
       target_type = 'accelerator'
 WHERE target_id = 'x_gener8tor_lv';

-- Catch-all for x_techstars
UPDATE graph_edges
   SET source_id   = 'a_techstars',
       source_type = 'accelerator'
 WHERE source_id = 'x_techstars';

UPDATE graph_edges
   SET target_id   = 'a_techstars',
       target_type = 'accelerator'
 WHERE target_id = 'x_techstars';

-- ============================================================
-- STEP 6: Clear legacy_external_id FK references (if any)
-- ============================================================
-- Currently none exist for these IDs, but guard defensively
UPDATE corporations SET legacy_external_id = NULL
 WHERE legacy_external_id IN (
   'i_angelnv', 'x_battlebornventure', 'x_desert_forge', 'x_fundnv',
   'x_startupnv_113', 'x_stripes', 'x_234',
   'x_gener8tor', 'x_gener8tor_lv', 'x_techstars'
 );

UPDATE gov_agencies SET legacy_external_id = NULL
 WHERE legacy_external_id IN (
   'i_angelnv', 'x_battlebornventure', 'x_desert_forge', 'x_fundnv',
   'x_startupnv_113', 'x_stripes', 'x_234',
   'x_gener8tor', 'x_gener8tor_lv', 'x_techstars'
 );

UPDATE universities SET legacy_external_id = NULL
 WHERE legacy_external_id IN (
   'i_angelnv', 'x_battlebornventure', 'x_desert_forge', 'x_fundnv',
   'x_startupnv_113', 'x_stripes', 'x_234',
   'x_gener8tor', 'x_gener8tor_lv', 'x_techstars'
 );

-- ============================================================
-- STEP 7: Delete duplicate external rows
-- ============================================================
-- Only delete externals that have proper entity representations.
-- x_vegastechfund is intentionally kept (no proper entity exists).
DELETE FROM externals WHERE id = 'i_angelnv';
DELETE FROM externals WHERE id = 'x_battlebornventure';
DELETE FROM externals WHERE id = 'x_desert_forge';
DELETE FROM externals WHERE id = 'x_fundnv';
DELETE FROM externals WHERE id = 'x_startupnv_113';
DELETE FROM externals WHERE id = 'x_stripes';
DELETE FROM externals WHERE id = 'x_234';
DELETE FROM externals WHERE id = 'x_gener8tor';
DELETE FROM externals WHERE id = 'x_gener8tor_lv';
DELETE FROM externals WHERE id = 'x_techstars';

-- ============================================================
-- STEP 8: Refresh materialized view
-- ============================================================
REFRESH MATERIALIZED VIEW CONCURRENTLY graph_data_snapshot;

COMMIT;
