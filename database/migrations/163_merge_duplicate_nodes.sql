-- Migration 163: Merge duplicate/redundant nodes across entity tables
--
-- Audit found the following duplicate groups still present after previous
-- dedup migrations (067, 068, 071, 115):
--
--   GROUP 1 — GOED variants (5 node IDs for one real-world org):
--     e_goed           (ecosystem_orgs)  ← CANONICAL
--     x_goed           (externals)       — re-seeded in 131 after deletion in 067
--     gov_NEVADA_GOED  (externals)       — "Nevada GOED" from 054
--     gov_goed_grant   (externals)       — "Nevada GOED Pre-Seed Grant" from 054
--     NOTE: x_ssbci is kept as a separate node (the SSBCI *program*, not GOED itself).
--           The relationship e_goed → x_ssbci 'manages' already exists.
--
--   GROUP 2 — UNR (2 node IDs for the same university):
--     u_unr            (universities)    ← CANONICAL
--     x_unr            (externals)       — "UNR" from 131 seed, still has many edges
--     NOTE: u_unr_space, u_unr_medical are separate departments — NOT duplicates.
--
--   UNLV — NO remaining duplicates. u_unlv, e_unlvtech, u_unlv_biotech,
--     u_unlv_engineering, u_unlv_nanotechnology, u_unlv_rebel are all distinct.
--     Previous merges (068) already handled x_233, x_unlv, unlv → u_unlv.
--
--   StartUpNV, EDAWN, LVGEA — already clean from prior migrations.
--
-- Strategy per group:
--   1. Reassign graph_edges source_id/target_id from duplicate → canonical
--   2. Delete edges that became duplicates after reassignment
--   3. Update entity_registry if rows reference old IDs
--   4. Delete redundant externals rows
--   5. Refresh materialized view
--
-- All statements are IDEMPOTENT. Safe to run multiple times.

BEGIN;

-- ============================================================
-- TEMP TABLE: duplicate → canonical mappings
-- ============================================================
CREATE TEMP TABLE dup_merge (
  dup_id       VARCHAR(40) PRIMARY KEY,
  canonical_id VARCHAR(40) NOT NULL,
  entity_type  VARCHAR(30) NOT NULL   -- type of the canonical node
) ON COMMIT DROP;

INSERT INTO dup_merge (dup_id, canonical_id, entity_type) VALUES
  -- GROUP 1: GOED variants → e_goed
  ('x_goed',          'e_goed', 'ecosystem_org'),
  ('gov_NEVADA_GOED', 'e_goed', 'ecosystem_org'),
  ('gov_goed_grant',  'e_goed', 'ecosystem_org'),

  -- GROUP 2: UNR duplicate → u_unr
  ('x_unr',           'u_unr',  'university')
ON CONFLICT (dup_id) DO NOTHING;

-- ============================================================
-- STEP 1: Reassign graph_edges source_id
-- ============================================================
UPDATE graph_edges ge
SET    source_id   = dm.canonical_id,
       source_type = dm.entity_type
FROM   dup_merge dm
WHERE  ge.source_id = dm.dup_id;

-- ============================================================
-- STEP 2: Reassign graph_edges target_id
-- ============================================================
UPDATE graph_edges ge
SET    target_id   = dm.canonical_id,
       target_type = dm.entity_type
FROM   dup_merge dm
WHERE  ge.target_id = dm.dup_id;

-- ============================================================
-- STEP 3: Fix edge rel types that were wrong for GOED
-- gov_goed_grant edges used 'contracts_with' but GOED gives grants
-- ============================================================
UPDATE graph_edges
SET    rel  = 'grants_to',
       note = COALESCE(note, '') || ' (corrected from contracts_with)'
WHERE  source_id = 'e_goed'
  AND  rel = 'contracts_with';

-- ============================================================
-- STEP 4: Deduplicate edges that became identical after merging
-- Keep the edge with the lowest id (oldest).
-- Two edges are "identical" if they share (source_id, target_id, rel).
-- ============================================================
DELETE FROM graph_edges
WHERE id IN (
  SELECT ge.id
  FROM graph_edges ge
  INNER JOIN (
    SELECT source_id, target_id, rel, MIN(id) AS keep_id
    FROM graph_edges
    GROUP BY source_id, target_id, rel
    HAVING COUNT(*) > 1
  ) dups
    ON ge.source_id = dups.source_id
   AND ge.target_id = dups.target_id
   AND ge.rel       = dups.rel
   AND ge.id        > dups.keep_id
);

-- ============================================================
-- STEP 5: Update entity_registry rows that reference old IDs
-- ============================================================
-- Delete duplicate entity_registry rows (the canonical should already exist)
DELETE FROM entity_registry
WHERE canonical_id IN (SELECT dup_id FROM dup_merge);

-- ============================================================
-- STEP 6: Clear legacy_external_id FK references
-- ============================================================
UPDATE corporations SET legacy_external_id = dm.canonical_id
FROM   dup_merge dm
WHERE  corporations.legacy_external_id = dm.dup_id;

UPDATE universities SET legacy_external_id = dm.canonical_id
FROM   dup_merge dm
WHERE  universities.legacy_external_id = dm.dup_id;

UPDATE gov_agencies SET legacy_external_id = dm.canonical_id
FROM   dup_merge dm
WHERE  gov_agencies.legacy_external_id = dm.dup_id;

-- ============================================================
-- STEP 7: Update stakeholder_activities that reference old IDs
-- ============================================================
UPDATE stakeholder_activities
SET    company_id = dm.canonical_id
FROM   dup_merge dm
WHERE  stakeholder_activities.company_id = dm.dup_id;

-- ============================================================
-- STEP 8: Update timeline_events that reference old IDs
-- ============================================================
UPDATE timeline_events
SET    company_id = dm.canonical_id
FROM   dup_merge dm
WHERE  timeline_events.company_id = dm.dup_id;

-- ============================================================
-- STEP 9: Update graph_metrics_cache
-- ============================================================
DELETE FROM graph_metrics_cache
WHERE node_id IN (SELECT dup_id FROM dup_merge);

-- ============================================================
-- STEP 10: Delete duplicate externals rows
-- ============================================================
DELETE FROM externals WHERE id IN (SELECT dup_id FROM dup_merge);

-- ============================================================
-- STEP 11: Refresh materialized views
-- ============================================================
REFRESH MATERIALIZED VIEW IF EXISTS graph_data_snapshot;

-- ============================================================
-- VERIFICATION: Count remaining GOED and UNR node references
-- ============================================================
DO $$
DECLARE
  goed_ext_count INTEGER;
  unr_ext_count  INTEGER;
  goed_edge_count INTEGER;
  unr_edge_count INTEGER;
BEGIN
  -- No GOED variants should remain in externals
  SELECT COUNT(*) INTO goed_ext_count
  FROM externals
  WHERE id IN ('x_goed', 'gov_NEVADA_GOED', 'gov_goed_grant');

  -- No x_unr should remain in externals
  SELECT COUNT(*) INTO unr_ext_count
  FROM externals
  WHERE id = 'x_unr';

  -- All GOED edges should point to e_goed
  SELECT COUNT(*) INTO goed_edge_count
  FROM graph_edges
  WHERE source_id IN ('x_goed', 'gov_NEVADA_GOED', 'gov_goed_grant')
     OR target_id IN ('x_goed', 'gov_NEVADA_GOED', 'gov_goed_grant');

  -- All UNR edges should point to u_unr
  SELECT COUNT(*) INTO unr_edge_count
  FROM graph_edges
  WHERE source_id = 'x_unr' OR target_id = 'x_unr';

  IF goed_ext_count > 0 OR unr_ext_count > 0 THEN
    RAISE WARNING 'Merge incomplete: % GOED externals, % UNR externals still exist',
      goed_ext_count, unr_ext_count;
  END IF;

  IF goed_edge_count > 0 OR unr_edge_count > 0 THEN
    RAISE WARNING 'Orphan edges: % GOED edges, % UNR edges still reference old IDs',
      goed_edge_count, unr_edge_count;
  END IF;

  RAISE NOTICE 'Migration 163 verification: GOED externals=%, UNR externals=%, GOED orphan edges=%, UNR orphan edges=%',
    goed_ext_count, unr_ext_count, goed_edge_count, unr_edge_count;
END
$$;

COMMIT;
