-- Migration 069: Fix reversed relationship directions in graph_edges
--
-- FINDINGS:
--
-- 1. Six edges have c_96 (FanUp) as source with `invested_in` pointing to
--    investor nodes (i_*). This is impossible: companies do not invest in
--    investors. The correct direction is investor -> company.
--
--    Reversed edges:
--      c_96 -> i_carpenter_family  | invested_in (2021)
--      c_96 -> i_john_albright     | invested_in (2021)
--      c_96 -> i_ozone_ventures    | invested_in (2020)
--      c_96 -> i_reno_seed_fund    | invested_in (2020)
--      c_96 -> i_ruttenberg_gordon | invested_in (2021)
--      c_96 -> i_value_asset_mgmt  | invested_in (2020)
--
--    Fix: swap source_id <-> target_id so the direction becomes i_* -> c_96.
--    No duplicates exist (verified: the only correct i_* -> c_96 edges are
--    i_accomplice_vc and i_alumni_ventures, which are different investors).
--
-- 2. Two edges have companies investing in x_linico (LiNiCo Corp):
--      c_33 (Comstock Mining) -> x_linico | invested_in  "64% stake" (2021)
--      c_73 (Aqua Metals)    -> x_linico | invested_in  "10% stake" (2023)
--
--    LiNiCo Corp is a joint venture between Comstock and Aqua Metals for
--    lithium-ion battery recycling. These are equity stakes in a JV, not
--    traditional VC investments. The direction is correct (company -> entity),
--    but the relationship type should be `partners_with` to reflect the JV.
--
-- 3. Two edges reference non-existent company slugs as targets (same class
--    of issue fixed in migration 061):
--      x_202 -> vaultgrid-technologies | invested_in
--      x_201 -> arcadeiq-ai           | invested_in
--
--    Neither company exists in the companies table. These are dangling edges.
--    Fix: delete them (note text preserved below for audit).
--
-- NOTE CONTENTS OF DELETED EDGES (preserved for audit):
--   x_202 -> vaultgrid-technologies : "Switch Ventures $1.7M into VaultGrid
--     Technologies (data-center infrastructure)"
--   x_201 -> arcadeiq-ai : "Station Casinos Ventures leads $6M seed in
--     ArcadeIQ AI (gaming-AI)"
--
-- Run: PGPASSWORD=bbi_dev_password psql -h localhost -p 5433 -U bbi \
--        -d battlebornintel \
--        -f database/migrations/069_fix_reversed_relationships.sql

BEGIN;

-- ============================================================
-- 1. Swap reversed c_96 -> i_* invested_in edges
--    Only swap if the reversed edge exists AND the correct
--    direction does not already exist (idempotent).
-- ============================================================

-- Swap source_id and target_id for all c_96 -> i_* invested_in edges
-- where the correct direction (i_* -> c_96) does not yet exist.
UPDATE graph_edges
SET source_id = target_id,
    target_id = source_id,
    source_type = target_type,
    target_type = source_type
WHERE source_id = 'c_96'
  AND target_id LIKE 'i_%'
  AND rel = 'invested_in'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges AS dup
    WHERE dup.source_id = graph_edges.target_id
      AND dup.target_id = graph_edges.source_id
      AND dup.rel = 'invested_in'
  );

-- ============================================================
-- 2. Change c_33/c_73 -> x_linico from invested_in to partners_with
--    (idempotent: only update if still invested_in)
-- ============================================================

UPDATE graph_edges
SET rel = 'partners_with'
WHERE source_id IN ('c_33', 'c_73')
  AND target_id = 'x_linico'
  AND rel = 'invested_in';

-- ============================================================
-- 3. Remove dangling edges with non-existent company slug targets
--    (idempotent: DELETE is a no-op if rows don't exist)
-- ============================================================

DELETE FROM graph_edges
WHERE target_id = 'vaultgrid-technologies'
  AND rel = 'invested_in';

DELETE FROM graph_edges
WHERE target_id = 'arcadeiq-ai'
  AND rel = 'invested_in';

-- ============================================================
-- Verification: no c_* -> i_* invested_in edges should remain
-- ============================================================

DO $$
DECLARE
  bad_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bad_count
  FROM graph_edges
  WHERE source_id LIKE 'c_%'
    AND target_id LIKE 'i_%'
    AND rel = 'invested_in';

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'VERIFICATION FAILED: % reversed c_* -> i_* invested_in edges still exist', bad_count;
  END IF;
END $$;

-- Verification: no dangling slug targets should remain
DO $$
DECLARE
  dangling_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dangling_count
  FROM graph_edges
  WHERE target_id IN ('vaultgrid-technologies', 'arcadeiq-ai');

  IF dangling_count > 0 THEN
    RAISE EXCEPTION 'VERIFICATION FAILED: % dangling slug-target edges still exist', dangling_count;
  END IF;
END $$;

COMMIT;
