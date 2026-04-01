-- Migration 157: Add region column to funds table
--
-- Part of the region audit series (156-161). Every other entity type already
-- has a region assignment; funds was the missing piece.
--
-- The existing region filter for funds (api/src/db/queries/funds.js) works by
-- checking portfolio companies' regions via the eligible array. Adding a direct
-- region column lets us:
--   1. Filter funds even when they have no portfolio companies in the DB yet
--   2. Show fund HQ location in the UI
--   3. Keep consistency with companies, accelerators, ecosystem_orgs, etc.
--
-- Region values follow the same convention as companies.region:
--   las_vegas, henderson, reno, carson_city, statewide
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, UPDATE with WHERE guards.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Add the region column (nullable — some funds may be out-of-state)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE funds ADD COLUMN IF NOT EXISTS region VARCHAR(30);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Assign regions based on known HQ locations
-- ══════════════════════════════════════════════════════════════════════════════

-- SSBCI funds — all statewide Nevada programs
UPDATE funds SET region = 'las_vegas'     WHERE id = 'bbv'       AND region IS NULL;   -- Battle Born Venture (Las Vegas HQ, statewide mandate)
UPDATE funds SET region = 'las_vegas'     WHERE id = 'fundnv'    AND region IS NULL;   -- FundNV (Las Vegas, StartUpNV ecosystem)
UPDATE funds SET region = 'las_vegas'     WHERE id = '1864'      AND region IS NULL;   -- 1864 Fund (Las Vegas SSBCI fund)

-- Angel groups
UPDATE funds SET region = 'las_vegas'     WHERE id = 'angelnv'   AND region IS NULL;   -- AngelNV (Las Vegas angel network)
UPDATE funds SET region = 'reno'          WHERE id = 'sierra'    AND region IS NULL;   -- Sierra Angels (Reno angel group)

-- Accelerator
UPDATE funds SET region = 'las_vegas'     WHERE id = 'startupnv' AND region IS NULL;   -- StartUpNV (Las Vegas accelerator)

-- Federal program
UPDATE funds SET region = 'statewide'     WHERE id = 'sbir'      AND region IS NULL;   -- SBIR/STTR (federal, statewide applicability)

-- VC funds — Las Vegas based
UPDATE funds SET region = 'las_vegas'     WHERE id = 'dfv'       AND region IS NULL;   -- Desert Forge Ventures (Las Vegas defense VC)
UPDATE funds SET region = 'las_vegas'     WHERE id = 'vtf'       AND region IS NULL;   -- VTF Capital (Las Vegas, Downtown Project successor)
UPDATE funds SET region = 'las_vegas'     WHERE id = 'bomcap'    AND region IS NULL;   -- Bombardier Capital Group (Las Vegas PE/VC)

-- VC funds — Reno / Northern NV based
UPDATE funds SET region = 'reno'          WHERE id = 'nvangels'  AND region IS NULL;   -- Nevada Angels (Reno angel group)
UPDATE funds SET region = 'reno'          WHERE id = 'renoseed'  AND region IS NULL;   -- Reno Seed Fund (Reno pre-seed/seed)
UPDATE funds SET region = 'carson_city'   WHERE id = 'nvcic'     AND region IS NULL;   -- Nevada Capital Investment Corp (Carson City)

-- Out-of-state VC firms with NV investments (is_local = FALSE)
UPDATE funds SET region = 'out_of_state'  WHERE id = 'dcvc'      AND region IS NULL;   -- DCVC (San Francisco deep tech VC)
UPDATE funds SET region = 'out_of_state'  WHERE id = 'stripes'   AND region IS NULL;   -- Stripes (NYC growth equity)

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Create index for region-based queries
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_funds_region ON funds(region);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Verification query
-- ══════════════════════════════════════════════════════════════════════════════

SELECT id, name, fund_type, region, is_local
FROM funds
ORDER BY region NULLS LAST, name;

COMMIT;
