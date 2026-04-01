-- Migration 152: Remove fabricated entities and scrub unverified claims (Wave 4)
--
-- Migrations 043/044/050 caught wave 1. Migration 112 caught wave 2.
-- Migration 115 caught wave 3. This migration removes the FOURTH wave
-- discovered via comprehensive audit on 2026-03-31.
--
-- FABRICATED OR NON-NEVADA COMPANIES (to DELETE):
--   id 36, slug 'tilt-ai'         — Tilt AI: zero web presence, implausible claims
--   id 31, slug 'fibrx'           — fibrX: zero web presence
--   id 72, slug 'skydio-gov'      — Skydio Gov: not a real entity (Skydio is real, "Skydio Gov" is not)
--   id 13, slug 'protect-ai'      — Protect AI: real company but HQ Seattle, not Nevada
--   id 64, slug 'nuvve-corp'      — Nuvve Corp: real company but HQ San Diego, not Nevada
--   id 48, slug 'sio2-materials'  — SiO2 Materials: real company but HQ Auburn AL, not Nevada
--   id 43, slug 'sapien'          — Sapien: real company but HQ San Francisco, not Nevada
--   id 25, slug 'cognizer-ai'     — Cognizer AI: real company but HQ Bay Area, not Nevada
--
-- FABRICATED EXTERNAL ENTITIES (to DELETE):
--   x_200 — Wynn Family Office: unverified "$10M anchor LP" claim
--   x_211 — CalPERS Innovation Fund: unverified specific vehicle name
--
-- REAL EXTERNAL ENTITIES WITH FABRICATED CLAIMS (SCRUB notes only):
--   x_205 — UNLV Foundation: remove fabricated note claims
--   x_206 — UNR Foundation: remove fabricated note claims
--   x_221 — MGM Resorts: remove fabricated partnership claims
--   x_222 — Tesla Gigafactory Nevada: remove "$8M Battery Lab" claim
--   x_225 — eBay: remove fabricated expansion claims
--   x_231 — Nevada GOED: remove fabricated MOU claim
--   x_233 — UNLV: remove fabricated research center claims
--
-- Safe to run multiple times (all DELETEs are idempotent, UPDATEs use WHERE guards).

BEGIN;

-- ============================================================
-- SECTION 1: Remove graph_edges referencing companies to be deleted
-- (Must happen before company deletion due to potential FK constraints)
-- ============================================================

-- Company node IDs use c_ID format
DELETE FROM graph_edges
WHERE source_id IN ('c_36', 'c_31', 'c_72', 'c_13', 'c_64', 'c_48', 'c_43', 'c_25')
   OR target_id IN ('c_36', 'c_31', 'c_72', 'c_13', 'c_64', 'c_48', 'c_43', 'c_25');

-- External node edges for entities being deleted
DELETE FROM graph_edges
WHERE source_id IN ('x_200', 'x_211')
   OR target_id IN ('x_200', 'x_211');

-- ============================================================
-- SECTION 2: Remove computed_scores for deleted companies
-- ============================================================

DELETE FROM computed_scores
WHERE company_id IN (36, 31, 72, 13, 64, 48, 43, 25);

-- ============================================================
-- SECTION 3: Remove stage_transitions for deleted companies
-- ============================================================

DELETE FROM stage_transitions
WHERE company_id IN (36, 31, 72, 13, 64, 48, 43, 25);

-- ============================================================
-- SECTION 4: Remove analysis_results for deleted companies
-- ============================================================

DELETE FROM analysis_results
WHERE entity_id IN ('36', '31', '72', '13', '64', '48', '43', '25')
  AND entity_type = 'company';

-- ============================================================
-- SECTION 5: Remove metric_snapshots for deleted entities
-- ============================================================

-- Company metric_snapshots
DELETE FROM metric_snapshots
WHERE entity_id IN ('36', '31', '72', '13', '64', '48', '43', '25')
  AND entity_type = 'company';

-- External entity metric_snapshots
DELETE FROM metric_snapshots
WHERE entity_id IN ('x_200', 'x_211');

-- ============================================================
-- SECTION 6: Remove computed_scores_history for deleted companies
-- ============================================================

DELETE FROM computed_scores_history
WHERE company_id IN (36, 31, 72, 13, 64, 48, 43, 25);

-- ============================================================
-- SECTION 7: Remove graph_metrics_cache for deleted nodes
-- ============================================================

DELETE FROM graph_metrics_cache
WHERE node_id IN (
  'c_36', 'c_31', 'c_72', 'c_13', 'c_64', 'c_48', 'c_43', 'c_25',
  'x_200', 'x_211'
);

-- ============================================================
-- SECTION 8: Remove timeline_events for deleted companies
-- ============================================================

DELETE FROM timeline_events
WHERE company_name IN (
  'Tilt AI', 'fibrX', 'Skydio Gov', 'Protect AI',
  'Nuvve Corp', 'SiO2 Materials', 'Sapien', 'Cognizer AI'
);

-- ============================================================
-- SECTION 9: Remove stakeholder_activities for deleted companies
-- ============================================================

DELETE FROM stakeholder_activities
WHERE company_id IN (
  'tilt-ai', 'fibrx', 'skydio-gov', 'protect-ai',
  'nuvve-corp', 'sio2-materials', 'sapien', 'cognizer-ai'
);

-- ============================================================
-- SECTION 10: Delete fabricated companies
-- ============================================================

DELETE FROM companies WHERE id = 36 AND slug = 'tilt-ai';          -- zero web presence
DELETE FROM companies WHERE id = 31 AND slug = 'fibrx';            -- zero web presence
DELETE FROM companies WHERE id = 72 AND slug = 'skydio-gov';       -- not a real entity
DELETE FROM companies WHERE id = 13 AND slug = 'protect-ai';       -- Seattle, not Nevada
DELETE FROM companies WHERE id = 64 AND slug = 'nuvve-corp';       -- San Diego, not Nevada
DELETE FROM companies WHERE id = 48 AND slug = 'sio2-materials';   -- Auburn AL, not Nevada
DELETE FROM companies WHERE id = 43 AND slug = 'sapien';           -- San Francisco, not Nevada
DELETE FROM companies WHERE id = 25 AND slug = 'cognizer-ai';      -- Bay Area, not Nevada

-- ============================================================
-- SECTION 11: Delete fabricated external entities
-- ============================================================

DELETE FROM externals WHERE id = 'x_200';  -- Wynn Family Office (unverified "$10M anchor LP" claim)
DELETE FROM externals WHERE id = 'x_211';  -- CalPERS Innovation Fund (unverified specific vehicle name)

-- ============================================================
-- SECTION 12: Scrub fabricated claims from real external entities
-- (Keep the entities, clear the fabricated note text)
-- ============================================================

-- x_205: UNLV Foundation — real entity, remove fabricated note claims
UPDATE externals
SET note = NULL
WHERE id = 'x_205';

-- x_206: UNR Foundation — real entity, remove fabricated note claims
UPDATE externals
SET note = NULL
WHERE id = 'x_206';

-- x_221: MGM Resorts — real entity, remove fabricated partnership claims
UPDATE externals
SET note = NULL
WHERE id = 'x_221';

-- x_222: Tesla Gigafactory Nevada — real entity, remove "$8M Battery Lab" claim
UPDATE externals
SET note = NULL
WHERE id = 'x_222';

-- x_225: eBay — real entity, remove fabricated expansion claims
UPDATE externals
SET note = NULL
WHERE id = 'x_225';

-- x_231: Nevada GOED — real entity, remove fabricated MOU claim
UPDATE externals
SET note = NULL
WHERE id = 'x_231';

-- x_233: UNLV — real entity, remove fabricated research center claims
UPDATE externals
SET note = NULL
WHERE id = 'x_233';

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Confirm deleted companies are gone
SELECT 'deleted_companies_remaining' AS check_name,
  COUNT(*) AS count
FROM companies
WHERE id IN (36, 31, 72, 13, 64, 48, 43, 25);

-- Confirm deleted externals are gone
SELECT 'deleted_externals_remaining' AS check_name,
  COUNT(*) AS count
FROM externals
WHERE id IN ('x_200', 'x_211');

-- Confirm no orphaned edges reference deleted nodes
SELECT 'orphaned_edges_remaining' AS check_name,
  COUNT(*) AS count
FROM graph_edges
WHERE source_id IN ('c_36', 'c_31', 'c_72', 'c_13', 'c_64', 'c_48', 'c_43', 'c_25', 'x_200', 'x_211')
   OR target_id IN ('c_36', 'c_31', 'c_72', 'c_13', 'c_64', 'c_48', 'c_43', 'c_25', 'x_200', 'x_211');

-- Confirm scrubbed externals still exist but with cleared notes
SELECT id, name, note IS NULL AS note_cleared
FROM externals
WHERE id IN ('x_205', 'x_206', 'x_221', 'x_222', 'x_225', 'x_231', 'x_233')
ORDER BY id;

COMMIT;
