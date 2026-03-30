-- Migration 125: Expand graph edges with temporal data for under-connected node types
-- Adds edges for universities→companies (spinouts), programs→companies (funded_by_program),
-- regions→companies (headquartered_in), sectors→companies (in_sector), and backfills
-- valid_from/valid_to on accelerator and pitch edges.
--
-- All INSERTs use ON CONFLICT DO NOTHING (unique index on source_id, target_id, rel
-- where edge_category IS NOT NULL — migration 104).
-- All operations are idempotent. Gracefully returns 0 rows if tables are empty.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/125_expand_graph_edges_temporal.sql

BEGIN;

-- ============================================================
-- 1. University → Company spinout edges
-- ============================================================
-- Link universities (x_unr, x_unlv) to companies that are known spinouts.
-- Derives from existing edges where universities appear as source/target,
-- and from companies with university-related notes.

-- 1a. UNR spinouts: find companies already connected to x_unr and create
--     spinout_of edges if they don't exist yet.
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  ge.target_id AS source_id,   -- the company (c_*)
  'x_unr'      AS target_id,   -- UNR
  'spinout_of'  AS rel,
  'University spinout linkage derived from existing UNR edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.7           AS edge_weight,
  0.65          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.source_id = 'x_unr'
  AND ge.target_id LIKE 'c_%'
  AND ge.rel IN ('employees_from', 'partnered_with', 'collaborated_with', 'spinout_of')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ex
    WHERE ex.source_id = ge.target_id
      AND ex.target_id = 'x_unr'
      AND ex.rel = 'spinout_of'
  )
ON CONFLICT DO NOTHING;

-- Also handle edges where UNR is target
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  ge.source_id AS source_id,   -- the company (c_*)
  'x_unr'      AS target_id,
  'spinout_of'  AS rel,
  'University spinout linkage derived from existing UNR edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.7           AS edge_weight,
  0.65          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.target_id = 'x_unr'
  AND ge.source_id LIKE 'c_%'
  AND ge.rel IN ('employees_from', 'partnered_with', 'collaborated_with')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ex
    WHERE ex.source_id = ge.source_id
      AND ex.target_id = 'x_unr'
      AND ex.rel = 'spinout_of'
  )
ON CONFLICT DO NOTHING;

-- 1b. UNLV spinouts: same pattern for x_unlv
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  ge.target_id AS source_id,
  'x_unlv'     AS target_id,
  'spinout_of'  AS rel,
  'University spinout linkage derived from existing UNLV edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.7           AS edge_weight,
  0.65          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.source_id = 'x_unlv'
  AND ge.target_id LIKE 'c_%'
  AND ge.rel IN ('employees_from', 'partnered_with', 'collaborated_with', 'spinout_of')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ex
    WHERE ex.source_id = ge.target_id
      AND ex.target_id = 'x_unlv'
      AND ex.rel = 'spinout_of'
  )
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  ge.source_id AS source_id,
  'x_unlv'     AS target_id,
  'spinout_of'  AS rel,
  'University spinout linkage derived from existing UNLV edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.7           AS edge_weight,
  0.65          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.target_id = 'x_unlv'
  AND ge.source_id LIKE 'c_%'
  AND ge.rel IN ('employees_from', 'partnered_with', 'collaborated_with')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ex
    WHERE ex.source_id = ge.source_id
      AND ex.target_id = 'x_unlv'
      AND ex.rel = 'spinout_of'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. Program → Company edges (funded_by_program)
-- ============================================================
-- Link SSBCI and SBIR program nodes to companies that received funding.
-- Derives from existing edges where program/government nodes connect to companies.

-- 2a. SSBCI program → companies: find companies connected to SSBCI-related nodes
--     (v_ssbci, pr_ssbci, or fund nodes with SSBCI in their id/note)
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'pr_ssbci'   AS source_id,
  ge.target_id AS target_id,
  'funded_by_program' AS rel,
  'SSBCI program funding linkage derived from existing fund/program edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.8           AS edge_weight,
  0.75          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  NULL          AS valid_to,   -- ongoing relationship
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.source_id IN (
    SELECT DISTINCT source_id FROM graph_edges
    WHERE source_id LIKE 'f_ssbci%' OR source_id = 'v_ssbci' OR source_id = 'pr_ssbci'
  )
  AND ge.target_id LIKE 'c_%'
  AND ge.rel IN ('invested_in', 'funded', 'funded_by_program')
ON CONFLICT DO NOTHING;

-- Also handle cases where company is source and fund/program is target
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'pr_ssbci'    AS source_id,
  ge.source_id  AS target_id,
  'funded_by_program' AS rel,
  'SSBCI program funding linkage derived from existing fund/program edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.8           AS edge_weight,
  0.75          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  NULL          AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.target_id IN (
    SELECT DISTINCT source_id FROM graph_edges
    WHERE source_id LIKE 'f_ssbci%' OR source_id = 'v_ssbci' OR source_id = 'pr_ssbci'
  )
  AND ge.source_id LIKE 'c_%'
  AND ge.rel IN ('qualifies_for', 'funded_by', 'funded_by_program')
ON CONFLICT DO NOTHING;

-- 2b. SBIR program → companies: find companies connected to SBIR nodes
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'pr_sbir'    AS source_id,
  ge.target_id AS target_id,
  'funded_by_program' AS rel,
  'SBIR program funding linkage derived from existing SBIR edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.8           AS edge_weight,
  0.75          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  NULL          AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.source_id IN ('v_sbir', 'v_sbir_af', 'pr_sbir')
  AND ge.target_id LIKE 'c_%'
  AND ge.rel IN ('invested_in', 'funded', 'funded_by_program', 'awarded_grant')
ON CONFLICT DO NOTHING;

-- SBIR: company as source
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'pr_sbir'    AS source_id,
  ge.source_id AS target_id,
  'funded_by_program' AS rel,
  'SBIR program funding linkage derived from existing SBIR edges.' AS note,
  ge.event_year,
  'historical'  AS edge_category,
  0.8           AS edge_weight,
  0.75          AS confidence,
  CASE WHEN ge.event_year IS NOT NULL THEN make_date(ge.event_year, 1, 1) END AS valid_from,
  NULL          AS valid_to,
  'migration-125' AS agent_id,
  FALSE         AS verified
FROM graph_edges ge
WHERE ge.target_id IN ('v_sbir', 'v_sbir_af', 'pr_sbir')
  AND ge.source_id LIKE 'c_%'
  AND ge.rel IN ('qualifies_for', 'funded_by', 'funded_by_program', 'received_grant')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. Accelerator temporal completion
-- ============================================================
-- Ensure all accelerated_by edges have valid_from/valid_to.
-- accelerated_by: valid_from = Jan 1 of event_year, valid_to = +6 months
-- (Migration 116 already did this, but catch any new edges since then)

UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)
WHERE rel = 'accelerated_by'
  AND valid_from IS NULL
  AND event_year IS NOT NULL;

UPDATE graph_edges
SET valid_to = (valid_from + INTERVAL '6 months')::DATE
WHERE rel = 'accelerated_by'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;

-- won_pitch: valid_from = Jan 1 of event_year, valid_to = +1 year
UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)
WHERE rel = 'won_pitch'
  AND valid_from IS NULL
  AND event_year IS NOT NULL;

UPDATE graph_edges
SET valid_to = (valid_from + INTERVAL '1 year')::DATE
WHERE rel = 'won_pitch'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;


-- ============================================================
-- 4. Region → Company edges (headquartered_in)
-- ============================================================
-- Link region nodes to companies based on company city/region data.
-- Uses the companies table if populated; gracefully returns 0 rows if empty.

-- 4a. Nevada-based companies → r_nv
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'c_' || c.id::TEXT AS source_id,
  'r_nv'             AS target_id,
  'headquartered_in' AS rel,
  'Company headquartered in Nevada (city: ' || COALESCE(c.city, 'unknown') || ').' AS note,
  EXTRACT(YEAR FROM c.created_at)::INTEGER AS event_year,
  'historical'       AS edge_category,
  0.9                AS edge_weight,
  0.90               AS confidence,
  COALESCE(
    CASE WHEN c.founded IS NOT NULL THEN make_date(c.founded, 1, 1) END,
    c.created_at::DATE
  ) AS valid_from,
  NULL               AS valid_to,   -- still headquartered there
  'migration-125'    AS agent_id,
  FALSE              AS verified
FROM companies c
WHERE c.region IN ('Nevada', 'NV', 'nevada')
   OR c.city IN ('Reno', 'Las Vegas', 'Henderson', 'Sparks', 'Carson City', 'North Las Vegas', 'Elko', 'Mesquite', 'Boulder City', 'Fernley', 'Fallon', 'Winnemucca', 'Incline Village')
ON CONFLICT DO NOTHING;

-- 4b. Reno-area companies → r_reno (if region node exists)
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'c_' || c.id::TEXT AS source_id,
  'r_reno'           AS target_id,
  'headquartered_in' AS rel,
  'Company headquartered in Reno metro area.' AS note,
  EXTRACT(YEAR FROM c.created_at)::INTEGER AS event_year,
  'historical'       AS edge_category,
  0.9                AS edge_weight,
  0.85               AS confidence,
  COALESCE(
    CASE WHEN c.founded IS NOT NULL THEN make_date(c.founded, 1, 1) END,
    c.created_at::DATE
  ) AS valid_from,
  NULL               AS valid_to,
  'migration-125'    AS agent_id,
  FALSE              AS verified
FROM companies c
WHERE c.city IN ('Reno', 'Sparks')
ON CONFLICT DO NOTHING;

-- 4c. Las Vegas-area companies → r_vegas (if region node exists)
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'c_' || c.id::TEXT AS source_id,
  'r_vegas'          AS target_id,
  'headquartered_in' AS rel,
  'Company headquartered in Las Vegas metro area.' AS note,
  EXTRACT(YEAR FROM c.created_at)::INTEGER AS event_year,
  'historical'       AS edge_category,
  0.9                AS edge_weight,
  0.85               AS confidence,
  COALESCE(
    CASE WHEN c.founded IS NOT NULL THEN make_date(c.founded, 1, 1) END,
    c.created_at::DATE
  ) AS valid_from,
  NULL               AS valid_to,
  'migration-125'    AS agent_id,
  FALSE              AS verified
FROM companies c
WHERE c.city IN ('Las Vegas', 'Henderson', 'North Las Vegas', 'Boulder City')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. Sector → Company edges (in_sector)
-- ============================================================
-- Link sector nodes to companies using companies.sectors[] array.
-- Uses the sectors table to map sector names to node IDs (s_<slug>).

INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'c_' || c.id::TEXT    AS source_id,
  's_' || s.slug        AS target_id,
  'in_sector'           AS rel,
  'Company operates in ' || s.name || ' sector.' AS note,
  EXTRACT(YEAR FROM c.created_at)::INTEGER AS event_year,
  'historical'          AS edge_category,
  0.85                  AS edge_weight,
  0.85                  AS confidence,
  COALESCE(
    CASE WHEN c.founded IS NOT NULL THEN make_date(c.founded, 1, 1) END,
    c.created_at::DATE
  ) AS valid_from,
  NULL                  AS valid_to,   -- ongoing sector membership
  'migration-125'       AS agent_id,
  FALSE                 AS verified
FROM companies c
  CROSS JOIN LATERAL unnest(c.sectors) AS sector_name
  JOIN sectors s ON s.name = sector_name
ON CONFLICT DO NOTHING;

-- Fallback: also match by case-insensitive slug for sectors not matched above
INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  edge_category, edge_weight, confidence,
  valid_from, valid_to,
  agent_id, verified
)
SELECT DISTINCT
  'c_' || c.id::TEXT    AS source_id,
  's_' || s.slug        AS target_id,
  'in_sector'           AS rel,
  'Company operates in ' || s.name || ' sector (slug match).' AS note,
  EXTRACT(YEAR FROM c.created_at)::INTEGER AS event_year,
  'historical'          AS edge_category,
  0.85                  AS edge_weight,
  0.80                  AS confidence,
  COALESCE(
    CASE WHEN c.founded IS NOT NULL THEN make_date(c.founded, 1, 1) END,
    c.created_at::DATE
  ) AS valid_from,
  NULL                  AS valid_to,
  'migration-125'       AS agent_id,
  FALSE                 AS verified
FROM companies c
  CROSS JOIN LATERAL unnest(c.sectors) AS sector_name
  JOIN sectors s ON LOWER(s.slug) = LOWER(REPLACE(REPLACE(sector_name, ' ', '_'), '/', '_'))
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ex
  WHERE ex.source_id = 'c_' || c.id::TEXT
    AND ex.target_id = 's_' || s.slug
    AND ex.rel = 'in_sector'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 6. Backfill valid_from for all edges missing it
-- ============================================================
-- Use event_year to derive valid_from where missing.
-- This catches any edges inserted by other migrations that didn't set temporal fields.

UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)
WHERE valid_from IS NULL
  AND event_year IS NOT NULL;

-- Set valid_to for bounded relationship types that were just inserted
-- (spinout_of is a point event)
UPDATE graph_edges
SET valid_to = valid_from
WHERE rel = 'spinout_of'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;


-- ============================================================
-- 7. Update statistics
-- ============================================================
ANALYZE graph_edges;

COMMIT;


-- ============================================================
-- VERIFICATION QUERIES (run outside transaction)
-- ============================================================

-- New edges added by this migration
SELECT
  rel,
  COUNT(*) AS edge_count,
  COUNT(*) FILTER (WHERE valid_from IS NOT NULL) AS has_valid_from,
  COUNT(*) FILTER (WHERE valid_to IS NOT NULL)   AS has_valid_to
FROM graph_edges
WHERE agent_id = 'migration-125'
GROUP BY rel
ORDER BY rel;

-- Overall temporal coverage after migration
SELECT
  COUNT(*)                                          AS total_edges,
  COUNT(*) FILTER (WHERE valid_from IS NOT NULL)    AS has_valid_from,
  COUNT(*) FILTER (WHERE valid_to IS NOT NULL)      AS has_valid_to,
  COUNT(*) FILTER (WHERE valid_from IS NULL AND event_year IS NOT NULL) AS missing_valid_from_with_year,
  ROUND(100.0 * COUNT(*) FILTER (WHERE valid_from IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS pct_temporal
FROM graph_edges;

-- Under-connected node type connectivity check
SELECT
  node_type,
  COUNT(DISTINCT node_id) AS unique_nodes,
  COUNT(*) AS total_edges
FROM (
  SELECT
    CASE
      WHEN source_id LIKE 'p_%'  THEN 'person'
      WHEN source_id LIKE 'x_%'  THEN 'external/university'
      WHEN source_id LIKE 'pr_%' THEN 'program'
      WHEN source_id LIKE 'a_%'  THEN 'accelerator'
      WHEN source_id LIKE 'r_%'  THEN 'region'
      WHEN source_id LIKE 's_%'  THEN 'sector'
      ELSE 'other'
    END AS node_type,
    source_id AS node_id
  FROM graph_edges
  UNION ALL
  SELECT
    CASE
      WHEN target_id LIKE 'p_%'  THEN 'person'
      WHEN target_id LIKE 'x_%'  THEN 'external/university'
      WHEN target_id LIKE 'pr_%' THEN 'program'
      WHEN target_id LIKE 'a_%'  THEN 'accelerator'
      WHEN target_id LIKE 'r_%'  THEN 'region'
      WHEN target_id LIKE 's_%'  THEN 'sector'
      ELSE 'other'
    END AS node_type,
    target_id AS node_id
  FROM graph_edges
) sub
GROUP BY node_type
ORDER BY node_type;
