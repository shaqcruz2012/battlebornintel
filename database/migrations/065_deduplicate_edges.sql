-- Migration 065: Deduplicate graph_edges and remove self-referential edge
--
-- AUDIT FINDINGS (post-061 migration series, run 2026-03-09):
--
-- 1. DUPLICATE EDGES: 155 exact (source_id, target_id, rel) duplicates found
--    across 155 unique (source, target, rel) combinations. Every duplicate has
--    exactly 2 copies (dupe_count = 2), meaning 155 rows are surplus. Root
--    cause: migrations 052-060 re-inserted rows that overlapped with earlier
--    migrations (046-051) without ON CONFLICT guards. Strategy: keep the row
--    with the LOWER id (the earlier insert) and delete the higher-id copy.
--
-- 2. SELF-REFERENTIAL EDGE: 1 row where source_id = target_id.
--    id=4907  x_nevada-state → x_nevada-state  rel=awarded
--    Note: "Nevada State University raises $5M endowment for Center for Tech
--    Entrepreneurship — 50 student startup grants/year (Feb 2026)"
--    This is a valid event but malformed as a self-loop. The external node
--    x_nevada-state represents the university itself; a self-loop is
--    meaningless in the graph renderer and breaks cycle-detection heuristics.
--    Fix: delete the edge (the event fact is preserved in this comment).
--
-- SCOPE OF DUPLICATES BY SOURCE PREFIX (informational):
--   f_bbv/*         : 16 pairs  (BBV→portco invested_in)
--   c_76..c_99/*    : 44 pairs  (portco relationship edges)
--   i_*             : 34 pairs  (external investor→portco invested_in)
--   x_*, u_*, v_*   : 34 pairs  (external partner/university/grant edges)
--   a_*             : 4 pairs   (accelerator→portco invested_in)
--   e_goed          : 2 pairs   (GOED→portco funded/invested_in)
--   f_fundnv        : 3 pairs   (Fund Nevada→portco invested_in)
--
-- IMPACT: After this migration, graph_edges will have:
--   Before: 4815 rows  →  After: 4815 - 155 - 1 = 4659 rows
--   Edge resolution rate remains 100.0% (no valid nodes are removed)
--
-- Run: psql -U bbi -d battlebornintel -h localhost -p 5433 \
--        -f database/migrations/065_deduplicate_edges.sql

BEGIN;

-- ============================================================
-- SECTION 1: Pre-flight assertions
-- ============================================================

DO $$
DECLARE
  v_total       INTEGER;
  v_self_loops  INTEGER;
  v_dupes       INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total      FROM graph_edges;
  SELECT COUNT(*) INTO v_self_loops FROM graph_edges WHERE source_id = target_id;

  SELECT SUM(cnt - 1) INTO v_dupes
  FROM (
    SELECT COUNT(*) AS cnt
    FROM graph_edges
    GROUP BY source_id, target_id, rel
    HAVING COUNT(*) > 1
  ) sub;

  RAISE NOTICE 'Pre-flight: total_edges=%, self_loops=%, surplus_duplicate_rows=%',
    v_total, v_self_loops, COALESCE(v_dupes, 0);

  IF v_total < 4000 THEN
    RAISE EXCEPTION 'Unexpected low edge count (%). Migration may have already run or data is missing.', v_total;
  END IF;
END;
$$;

-- ============================================================
-- SECTION 2: Remove self-referential edge
-- ============================================================
-- id=4907  x_nevada-state → x_nevada-state  rel=awarded
-- Event preserved in migration header comment above.

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM graph_edges WHERE source_id = target_id;
  IF v_count = 0 THEN
    RAISE NOTICE 'Section 2: no self-referential edges found — already cleaned up.';
  ELSE
    RAISE NOTICE 'Section 2: deleting % self-referential edge(s).', v_count;
  END IF;
END;
$$;

DELETE FROM graph_edges
WHERE source_id = target_id;

-- ============================================================
-- SECTION 3: Deduplicate — keep lowest id per (source, target, rel)
-- ============================================================
-- For each group of duplicates, the row with MIN(id) is the original
-- insert from the earliest migration; higher ids are re-inserts from
-- later migrations. We delete every row that is NOT the minimum id
-- for its (source_id, target_id, rel) group.

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM graph_edges ge
  WHERE ge.id > (
    SELECT MIN(ge2.id)
    FROM graph_edges ge2
    WHERE ge2.source_id = ge.source_id
      AND ge2.target_id = ge.target_id
      AND ge2.rel       = ge.rel
  );

  IF v_count = 0 THEN
    RAISE NOTICE 'Section 3: no duplicate edges found — already cleaned up.';
  ELSE
    RAISE NOTICE 'Section 3: deleting % surplus duplicate edge(s).', v_count;
  END IF;
END;
$$;

DELETE FROM graph_edges
WHERE id > (
  SELECT MIN(ge2.id)
  FROM graph_edges ge2
  WHERE ge2.source_id = graph_edges.source_id
    AND ge2.target_id = graph_edges.target_id
    AND ge2.rel       = graph_edges.rel
);

-- ============================================================
-- SECTION 4: Post-run verification
-- ============================================================

-- 4a. No duplicates remain
SELECT
  'duplicate (source, target, rel) groups' AS check_name,
  COUNT(*)                                 AS count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM (
  SELECT source_id, target_id, rel
  FROM graph_edges
  GROUP BY source_id, target_id, rel
  HAVING COUNT(*) > 1
) dupes;

-- 4b. No self-referential edges remain
SELECT
  'self-referential edges'                 AS check_name,
  COUNT(*)                                 AS count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM graph_edges
WHERE source_id = target_id;

-- 4c. Edge resolution rate — must remain 100%
SELECT
  'edge resolution rate'  AS check_name,
  ROUND(100.0 * resolved_endpoints / total_endpoints, 1) AS resolution_pct,
  CASE
    WHEN ROUND(100.0 * resolved_endpoints / total_endpoints, 1) = 100.0
    THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM (
  WITH all_endpoints AS (
    SELECT source_id AS node_id FROM graph_edges
    UNION ALL
    SELECT target_id FROM graph_edges
  ),
  resolved AS (
    SELECT node_id FROM all_endpoints WHERE
        node_id IN (SELECT 'c_' || id::text FROM companies)
        OR node_id IN (SELECT 'f_' || id::text FROM graph_funds)
        OR node_id IN (SELECT id FROM externals)
        OR node_id IN (SELECT id FROM accelerators)
        OR node_id IN (SELECT id FROM ecosystem_orgs)
        OR node_id IN (SELECT id FROM people)
        OR node_id IN (SELECT 'p_' || id::text FROM programs)
  )
  SELECT
    COUNT(*)                              AS total_endpoints,
    (SELECT COUNT(*) FROM resolved)       AS resolved_endpoints
  FROM all_endpoints
) counts;

-- 4d. Final edge count
SELECT
  'final edge count' AS check_name,
  COUNT(*)           AS total_edges
FROM graph_edges;

COMMIT;
