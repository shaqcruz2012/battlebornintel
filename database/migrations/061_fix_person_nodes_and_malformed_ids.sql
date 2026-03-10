-- Migration 061: Fix p_ node resolution and malformed graph_edge target IDs
--
-- FINDINGS:
--
-- 1. p_1 through p_25 in graph_edges are PROGRAM nodes (not people).
--    Migration 020 correctly uses the convention `p_<program.id>` with
--    target_type = 'program'. All 25 programs exist in the programs table.
--    The graph API never fetches program rows, so they render as 'unknown'
--    placeholder nodes when opportunity/fund_opportunity edges are loaded.
--    Fix: add program nodes to graph_edges node-resolution (handled in API
--    layer — see api/src/db/queries/graph.js). This migration validates the
--    data integrity so the API fix has a clean foundation.
--
-- 2. Three graph_edges rows reference company targets by raw slug instead of
--    the `c_<id>` convention:
--      peakhealth-analytics  (x_204 → peakhealth-analytics, invested_in)
--      neoncore-systems      (x_202 → neoncore-systems,     invested_in)
--      quantumedge-ai        (x_209 → quantumedge-ai,       invested_in)
--    None of these companies exist in the companies table — they are
--    out-of-state or pre-data-load companies referenced only in edge notes.
--    Fix: remove these three invalid edges (the note text is preserved in
--    this comment for auditability).
--
-- 3. slug:nevadavolt-energy — already absent from graph_edges (previously
--    fixed by migration 051). No action needed.
--
-- NOTE CONTENTS OF DELETED EDGES (preserved for audit):
--   x_202 → peakhealth-analytics : "Intermountain Ventures Group leads $3M
--     seed in PeakHealth Analytics (Reno healthtech)"
--   x_202 → neoncore-systems     : "Switch Ventures $1.8M into NeonCore
--     Systems (data-center infrastructure)"
--   x_209 → quantumedge-ai       : "Goldman Sachs PE $30M growth equity in
--     QuantumEdge AI at $180M valuation"
--
-- Run: psql -U bbi -d battlebornintel -h localhost -p 5433 \
--        -f database/migrations/061_fix_person_nodes_and_malformed_ids.sql

BEGIN;

-- ============================================================
-- SECTION 1: Verify all p_1..p_25 program nodes resolve correctly
-- ============================================================
-- Assert every p_<n> node referenced in graph_edges has a matching
-- programs row. Raises an exception and rolls back if any are missing.
DO $$
DECLARE
  v_missing INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_missing
  FROM (
    SELECT DISTINCT target_id AS node_id
    FROM graph_edges
    WHERE target_id ~ '^p_[0-9]+$' AND rel IN ('qualifies_for', 'fund_opportunity')
    UNION
    SELECT DISTINCT source_id AS node_id
    FROM graph_edges
    WHERE source_id ~ '^p_[0-9]+$'
  ) nodes
  LEFT JOIN programs p
    ON p.id = CAST(REPLACE(nodes.node_id, 'p_', '') AS INTEGER)
  WHERE p.id IS NULL;

  IF v_missing > 0 THEN
    RAISE EXCEPTION
      'Migration 061 aborted: % p_<n> node(s) in graph_edges have no matching programs row. '
      'Run migration 019 first to populate the programs table.',
      v_missing;
  END IF;

  RAISE NOTICE 'Section 1 passed: all p_<n> graph_edges nodes resolve to programs rows.';
END;
$$;

-- ============================================================
-- SECTION 2: Remove malformed company-slug target edges
-- ============================================================
-- These three edges reference companies by slug (raw name-derived string)
-- instead of the canonical `c_<numeric_id>` format. The companies they
-- reference do not exist in the companies table, making them unresolvable
-- by the graph API and causing 'unknown' placeholder nodes in the graph.

-- Record a count before deletion for the NOTICE below.
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM graph_edges
  WHERE target_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai')
     OR source_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai');

  IF v_count = 0 THEN
    RAISE NOTICE 'Section 2: no malformed slug edges found — already cleaned up.';
  ELSE
    RAISE NOTICE 'Section 2: deleting % malformed slug edge(s).', v_count;
  END IF;
END;
$$;

DELETE FROM graph_edges
WHERE target_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai')
   OR source_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai');

-- ============================================================
-- SECTION 3: Confirm slug:nevadavolt-energy is absent
-- ============================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM graph_edges
  WHERE source_id LIKE 'slug:%' OR target_id LIKE 'slug:%';

  IF v_count > 0 THEN
    RAISE WARNING
      'Section 3: found % residual slug:-prefixed edge(s) not cleaned by migration 051. '
      'Investigate and add targeted DELETEs above.',
      v_count;
  ELSE
    RAISE NOTICE 'Section 3 passed: no slug:-prefixed edges remain.';
  END IF;
END;
$$;

-- ============================================================
-- SECTION 4: Rebuild v_company_opportunities view
-- ============================================================
-- Recreate the view to ensure the p_<id> → programs join is current
-- and uses ON CONFLICT-safe logic (drop + create is idempotent).
DROP VIEW IF EXISTS v_company_opportunities;

CREATE VIEW v_company_opportunities AS
SELECT
  ge.source_id                                       AS company_id,
  ge.target_id                                       AS program_node_id,
  p.id                                               AS program_id,
  p.slug                                             AS program_slug,
  p.name                                             AS program_name,
  p.program_type,
  ge.matching_score,
  (ge.matching_criteria->>'stage_match')::NUMERIC    AS stage_match,
  (ge.matching_criteria->>'sector_match')::NUMERIC   AS sector_match,
  (ge.matching_criteria->>'region_match')::NUMERIC   AS region_match,
  NULL::NUMERIC                                      AS team_match,
  ge.matching_criteria->>'estimated_award'           AS estimated_award,
  ge.matching_criteria->>'deadline'                  AS deadline,
  ge.eligible_since,
  ge.eligible_until,
  ge.created_at,
  CASE
    WHEN ge.matching_score >= 0.85 THEN 'Excellent'
    WHEN ge.matching_score >= 0.70 THEN 'Good'
    WHEN ge.matching_score >= 0.50 THEN 'Fair'
    ELSE 'Poor'
  END                                                AS match_quality
FROM graph_edges ge
JOIN programs p
  ON p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
WHERE ge.rel = 'qualifies_for'
  AND (ge.eligible_until IS NULL OR ge.eligible_until >= CURRENT_DATE)
  AND (ge.eligible_since IS NULL OR ge.eligible_since <= CURRENT_DATE);

-- ============================================================
-- SECTION 5: Verification queries
-- ============================================================

-- 5a. Confirm no unresolvable p_<n> nodes remain
SELECT
  'p_<n> unresolvable nodes' AS check_name,
  COUNT(*) AS count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM (
  SELECT DISTINCT target_id AS node_id
  FROM graph_edges
  WHERE target_id ~ '^p_[0-9]+$'
  UNION
  SELECT DISTINCT source_id
  FROM graph_edges
  WHERE source_id ~ '^p_[0-9]+$'
) nodes
LEFT JOIN programs p
  ON p.id = CAST(REPLACE(nodes.node_id, 'p_', '') AS INTEGER)
WHERE p.id IS NULL;

-- 5b. Confirm no malformed company-slug edges remain
SELECT
  'malformed company-slug edges' AS check_name,
  COUNT(*) AS count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM graph_edges
WHERE target_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai')
   OR source_id IN ('peakhealth-analytics', 'neoncore-systems', 'quantumedge-ai');

-- 5c. Confirm no slug:-prefixed edges remain
SELECT
  'slug:-prefixed edges' AS check_name,
  COUNT(*) AS count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM graph_edges
WHERE source_id LIKE 'slug:%' OR target_id LIKE 'slug:%';

-- 5d. Program node summary — all 25 programs are referenced and resolvable
SELECT
  ge.target_id         AS graph_node_id,
  p.id                 AS program_id,
  p.name               AS program_name,
  COUNT(DISTINCT ge.source_id) AS qualifying_companies
FROM graph_edges ge
JOIN programs p
  ON p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
WHERE ge.rel = 'qualifies_for'
GROUP BY ge.target_id, p.id, p.name
ORDER BY p.id;

-- 5e. Total edge counts post-cleanup
SELECT
  rel,
  COUNT(*) AS edge_count
FROM graph_edges
WHERE rel IN ('qualifies_for', 'fund_opportunity')
GROUP BY rel
ORDER BY rel;

COMMIT;
