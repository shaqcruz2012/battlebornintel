-- Migration 071: Remove duplicate invested_in edges from alias nodes
--
-- Problem: Several external entities have 2+ IDs in the externals table,
-- each with its own invested_in edge to the same portfolio company. This
-- creates duplicate investment records in the graph.
--
-- After migration 068 consolidated some duplicate externals, 7 alias pairs
-- remain where both IDs have an invested_in edge to the same target company:
--
--   x_gs            -> c_1   (dup of x_goldman    -> c_1,  Goldman Sachs)
--   x_iagcapital    -> c_11  (dup of x_iag        -> c_11, IAG Capital)
--   x_evolution_equity -> c_13 (dup of x_evolution -> c_13, Evolution Equity)
--   x_okapi_ventures   -> c_14 (dup of x_okapi    -> c_14, Okapi Venture Capital)
--   x_microsoft_climate -> c_17 (dup of x_msft_climate -> c_17, Microsoft Climate Fund)
--   x_mgm_resorts   -> c_27  (dup of x_mgm        -> c_27, MGM Resorts)
--   x_stellantis_ventures -> c_29 (dup of x_stellantis -> c_29, Stellantis)
--
-- Strategy:
--   1. Delete invested_in edges from alias IDs where the canonical ID also
--      has an invested_in edge to the same target (safe: only removes true duplicates)
--   2. Reassign any remaining edges from alias IDs to canonical IDs
--   3. Delete orphaned alias externals rows
--   4. General dedup: remove any edges with identical (source_id, target_id, rel),
--      keeping the lowest id
--
-- This migration is IDEMPOTENT: safe to run multiple times.

BEGIN;

-- ============================================================
-- STEP 1: Define alias -> canonical mappings
-- ============================================================
CREATE TEMP TABLE alias_map (alias_id VARCHAR(40) PRIMARY KEY, canonical_id VARCHAR(40) NOT NULL)
ON COMMIT DROP;

INSERT INTO alias_map (alias_id, canonical_id) VALUES
  ('x_gs',                  'x_goldman'),       -- Goldman Sachs -> Goldman Sachs AM
  ('x_iagcapital',          'x_iag'),           -- IAG Capital -> IAG Capital Partners
  ('x_evolution_equity',    'x_evolution'),      -- Evolution Equity Partners -> Evolution Equity
  ('x_okapi_ventures',      'x_okapi'),          -- Okapi Venture Capital -> Okapi VC
  ('x_microsoft_climate',   'x_msft_climate'),   -- Microsoft Climate Innovation Fund -> Microsoft Climate Fund
  ('x_mgm_resorts',         'x_mgm'),            -- MGM Resorts International -> MGM Resorts
  ('x_stellantis_ventures', 'x_stellantis')      -- Stellantis Ventures -> Stellantis
ON CONFLICT (alias_id) DO NOTHING;

-- ============================================================
-- STEP 2: Delete duplicate invested_in edges from alias nodes
-- ============================================================
-- Only delete an alias edge if the canonical ID also has an invested_in
-- edge to the SAME target (safety guard: never removes a unique investment).
DELETE FROM graph_edges ge
USING alias_map am
WHERE ge.source_id = am.alias_id
  AND ge.rel = 'invested_in'
  AND EXISTS (
    SELECT 1 FROM graph_edges canon
    WHERE canon.source_id = am.canonical_id
      AND canon.target_id = ge.target_id
      AND canon.rel = 'invested_in'
  );

-- ============================================================
-- STEP 3: Reassign any remaining edges from alias IDs to canonical IDs
-- ============================================================
-- (In case alias nodes have non-invested_in edges added in the future)
UPDATE graph_edges ge
SET source_id = am.canonical_id
FROM alias_map am
WHERE ge.source_id = am.alias_id;

UPDATE graph_edges ge
SET target_id = am.canonical_id
FROM alias_map am
WHERE ge.target_id = am.alias_id;

-- ============================================================
-- STEP 4: General dedup — remove any edges with identical (source_id, target_id, rel)
-- ============================================================
-- Keeps the edge with the lowest id (oldest), deletes later duplicates.
-- This catches any duplicates created by Step 3's reassignment.
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
-- STEP 5: Clean up orphaned alias externals
-- ============================================================
-- Only delete if no remaining edges reference this alias ID.
DELETE FROM externals
WHERE id IN (SELECT alias_id FROM alias_map)
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges WHERE source_id = externals.id OR target_id = externals.id
  );

COMMIT;
