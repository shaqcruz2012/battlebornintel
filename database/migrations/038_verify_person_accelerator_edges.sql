-- Migration 038: Verify and Fix Person and Accelerator Edges
-- Audits all edges whose source_id or target_id starts with 'p_' (person) or
-- 'a_' (accelerator), then applies correct confidence scores, source
-- attribution, event_year defaults, and edge_category to each.
--
-- Schema context (all columns exist from prior migrations):
--   graph_edges.confidence          FLOAT           — agent certainty (0–1)
--   graph_edges.source_name         VARCHAR(100)    — human-readable attribution
--   graph_edges.source_type         VARCHAR(30)     — node type of source
--   graph_edges.target_type         VARCHAR(30)     — node type of target
--   graph_edges.event_year          INTEGER
--   graph_edges.edge_category       VARCHAR(20)     — 'historical'|'opportunity'|'projected'
--   graph_edges.data_quality        VARCHAR(6)      — 'HIGH'|'MEDIUM'|'LOW'
--   graph_edges.weight              JSONB           — typed payload
--   graph_edges.agent_id            VARCHAR(60)
--   graph_edges.verified            BOOLEAN
--
-- Person rel types covered : founded_by, employed_by, board_member, advises, formerly_of
-- Accelerator rel types covered: accelerated_by, invested_in, partners_with
--
-- Safe to run multiple times (all UPDATE statements use IS DISTINCT FROM guards).
-- Run: psql -U bbi -d battlebornintel -f database/migrations/038_verify_person_accelerator_edges.sql

-- ============================================================
-- SECTION 1: AUDIT — person edges baseline
-- ============================================================

-- 1a. Person edge counts by rel type
SELECT
  rel,
  COUNT(*)                                                     AS total_edges,
  COUNT(*) FILTER (WHERE confidence IS NOT NULL)               AS have_confidence,
  COUNT(*) FILTER (WHERE confidence IS NULL)                   AS missing_confidence,
  COUNT(*) FILTER (WHERE event_year IS NOT NULL)               AS have_event_year,
  COUNT(*) FILTER (WHERE event_year IS NULL)                   AS missing_event_year,
  COUNT(*) FILTER (WHERE source_name IS NOT NULL)              AS have_source_name,
  COUNT(*) FILTER (WHERE edge_category = 'historical')         AS is_historical
FROM graph_edges
WHERE source_id LIKE 'p_%'
   OR target_id LIKE 'p_%'
GROUP BY rel
ORDER BY total_edges DESC;

-- 1b. Confidence score distribution across all person edges
SELECT
  CASE
    WHEN confidence IS NULL        THEN 'NULL (unset)'
    WHEN confidence >= 0.90        THEN '>= 0.90'
    WHEN confidence >= 0.80        THEN '0.80 – 0.89'
    WHEN confidence >= 0.70        THEN '0.70 – 0.79'
    ELSE                                '< 0.70'
  END                                   AS confidence_band,
  COUNT(*)                              AS edge_count
FROM graph_edges
WHERE source_id LIKE 'p_%'
   OR target_id LIKE 'p_%'
GROUP BY confidence_band
ORDER BY MIN(COALESCE(confidence, -1)) DESC;

-- 1c. Orphaned person nodes: p_ nodes that appear in people table but have no edges
SELECT
  p.id                                  AS person_id,
  p.name                                AS person_name,
  p.role
FROM people p
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = p.id
     OR ge.target_id = p.id
)
ORDER BY p.id;

-- ============================================================
-- SECTION 2: AUDIT — accelerator edges baseline
-- ============================================================

-- 2a. Accelerator edge counts by rel type
SELECT
  rel,
  COUNT(*)                                                     AS total_edges,
  COUNT(*) FILTER (WHERE confidence IS NOT NULL)               AS have_confidence,
  COUNT(*) FILTER (WHERE confidence IS NULL)                   AS missing_confidence,
  COUNT(*) FILTER (WHERE source_name IS NOT NULL)              AS have_source_name,
  COUNT(*) FILTER (WHERE edge_category = 'historical')         AS is_historical
FROM graph_edges
WHERE source_id LIKE 'a_%'
   OR target_id LIKE 'a_%'
GROUP BY rel
ORDER BY total_edges DESC;

-- 2b. Verify key accelerator nodes have edges
--     Checks: StartUpNV (a_startupnv), NV Angel Network (a_angelnv),
--             VegasTechFund (a_vtf)
SELECT
  a.id                                  AS accel_id,
  a.name                                AS accel_name,
  COUNT(ge.id)                          AS edge_count,
  CASE WHEN COUNT(ge.id) = 0 THEN 'MISSING EDGES' ELSE 'OK' END AS status
FROM accelerators a
LEFT JOIN graph_edges ge
  ON ge.source_id = a.id
  OR ge.target_id = a.id
WHERE a.id IN ('a_startupnv', 'a_angelnv', 'a_vtf')
GROUP BY a.id, a.name
ORDER BY a.id;

-- ============================================================
-- SECTION 3: FIX — person edge confidence scores
-- ============================================================
-- Rule matrix (applied in priority order; once a row is updated
-- its confidence already satisfies the DISTINCT FROM guard):
--
--   founded_by   → 0.95  (Nevada SoS registrations are directly verifiable)
--   board_member → 0.88  (public SEC/state disclosure filings)
--   employed_by  → 0.82  (LinkedIn verifiable, job titles change)
--   formerly_of  → 0.85  (verifiable via historical records)
--   advises      → 0.72  (advisory roles often informal / unverified)

UPDATE graph_edges
SET
  confidence = 0.95,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'founded_by'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND confidence IS DISTINCT FROM 0.95;

UPDATE graph_edges
SET
  confidence = 0.88,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'board_member'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND confidence IS DISTINCT FROM 0.88;

UPDATE graph_edges
SET
  confidence = 0.85,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'formerly_of'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND confidence IS DISTINCT FROM 0.85;

UPDATE graph_edges
SET
  confidence = 0.82,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'employed_by'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND confidence IS DISTINCT FROM 0.82;

UPDATE graph_edges
SET
  confidence = 0.72,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'advises'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND confidence IS DISTINCT FROM 0.72;

-- ============================================================
-- SECTION 4: FIX — accelerator edge confidence scores
-- ============================================================
-- Rule matrix:
--   accelerated_by  → 0.90  (portfolio pages are publicly maintained)
--   invested_in     → 0.88  (when accelerator is the source investor)
--   partners_with   → 0.80  (partnership agreements, often less formal)

UPDATE graph_edges
SET
  confidence = 0.90,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'accelerated_by'
  AND (source_id LIKE 'a_%' OR target_id LIKE 'a_%')
  AND confidence IS DISTINCT FROM 0.90;

UPDATE graph_edges
SET
  confidence = 0.88,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'invested_in'
  AND source_id LIKE 'a_%'
  AND confidence IS DISTINCT FROM 0.88;

UPDATE graph_edges
SET
  confidence = 0.80,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel = 'partners_with'
  AND (source_id LIKE 'a_%' OR target_id LIKE 'a_%')
  AND confidence IS DISTINCT FROM 0.80;

-- ============================================================
-- SECTION 5: FIX — person edge source attribution
-- ============================================================
-- Writes source_name directly on the row (pattern established in
-- migration 034) AND merges source_name into weight JSONB for
-- parity with the weight->>'source_name' pattern used in
-- migration 032.
--
--   founded_by   → Nevada Secretary of State  (https://esos.nv.gov)
--   board_member → LinkedIn / Crunchbase
--   employed_by  → LinkedIn / Crunchbase
--   formerly_of  → LinkedIn / Crunchbase
--   advises      → BBI Primary Research

-- 5a. founded_by — Nevada SoS
UPDATE graph_edges
SET
  source_name = 'Nevada Secretary of State',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'Nevada Secretary of State',
                  'source_url',  'https://esos.nv.gov'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE rel = 'founded_by'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND source_name IS DISTINCT FROM 'Nevada Secretary of State';

-- 5b. board_member — LinkedIn / Crunchbase
UPDATE graph_edges
SET
  source_name = 'LinkedIn / Crunchbase',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'LinkedIn / Crunchbase'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE rel = 'board_member'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND source_name IS DISTINCT FROM 'LinkedIn / Crunchbase';

-- 5c. employed_by — LinkedIn / Crunchbase
UPDATE graph_edges
SET
  source_name = 'LinkedIn / Crunchbase',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'LinkedIn / Crunchbase'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE rel = 'employed_by'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND source_name IS DISTINCT FROM 'LinkedIn / Crunchbase';

-- 5d. formerly_of — LinkedIn / Crunchbase
UPDATE graph_edges
SET
  source_name = 'LinkedIn / Crunchbase',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'LinkedIn / Crunchbase'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE rel = 'formerly_of'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND source_name IS DISTINCT FROM 'LinkedIn / Crunchbase';

-- 5e. advises — BBI Primary Research
UPDATE graph_edges
SET
  source_name = 'BBI Primary Research',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'BBI Primary Research'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE rel = 'advises'
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND source_name IS DISTINCT FROM 'BBI Primary Research';

-- ============================================================
-- SECTION 6: FIX — accelerator edge source attribution
-- ============================================================
-- Accelerator source_name keyed by the specific accelerator node:
--   a_startupnv  → StartUpNV Portfolio 2025
--   a_angelnv    → AngelNV Portfolio 2025
--   a_vtf        → VTF Portfolio 2025
-- All other accelerator nodes fall back to 'BBI Research'.

-- 6a. StartUpNV (a_startupnv)
UPDATE graph_edges
SET
  source_name = 'StartUpNV Portfolio 2025',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'StartUpNV Portfolio 2025'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE (source_id = 'a_startupnv' OR target_id = 'a_startupnv')
  AND source_name IS DISTINCT FROM 'StartUpNV Portfolio 2025';

-- 6b. NV Angel Network (a_angelnv)
UPDATE graph_edges
SET
  source_name = 'AngelNV Portfolio 2025',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'AngelNV Portfolio 2025'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE (source_id = 'a_angelnv' OR target_id = 'a_angelnv')
  AND source_name IS DISTINCT FROM 'AngelNV Portfolio 2025';

-- 6c. VegasTechFund (a_vtf)
UPDATE graph_edges
SET
  source_name = 'VTF Portfolio 2025',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'VTF Portfolio 2025'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE (source_id = 'a_vtf' OR target_id = 'a_vtf')
  AND source_name IS DISTINCT FROM 'VTF Portfolio 2025';

-- 6d. All remaining accelerator edges with no source attribution
UPDATE graph_edges
SET
  source_name = 'BBI Research',
  weight      = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
                  'source_name', 'BBI Research'
                ),
  agent_id    = COALESCE(agent_id, 'migration-038')
WHERE (source_id LIKE 'a_%' OR target_id LIKE 'a_%')
  AND source_name IS NULL
  -- Exclude the three named accelerators already updated above
  AND source_id NOT IN ('a_startupnv', 'a_angelnv', 'a_vtf')
  AND target_id NOT IN ('a_startupnv', 'a_angelnv', 'a_vtf');

-- ============================================================
-- SECTION 7: FIX — event_year defaults on person edges
-- ============================================================
-- Person-role edges with no recorded year default to 2024 (conservative
-- recent estimate).  Existing non-NULL event_year values are not touched.

UPDATE graph_edges
SET
  event_year = 2024,
  agent_id   = COALESCE(agent_id, 'migration-038')
WHERE rel IN ('founded_by', 'employed_by', 'board_member', 'advises', 'formerly_of')
  AND (source_id LIKE 'p_%' OR target_id LIKE 'p_%')
  AND event_year IS NULL;

-- ============================================================
-- SECTION 8: FIX — edge_category for person and accelerator edges
-- ============================================================
-- All person and accelerator relationship edges represent documented
-- historical facts (not opportunity projections), so edge_category
-- must be 'historical'.  The ALTER TABLE DEFAULT in migration 021
-- should have caught new inserts, but rows inserted before migration
-- 021 or with an explicit NULL may still be wrong.

UPDATE graph_edges
SET
  edge_category = 'historical',
  agent_id      = COALESCE(agent_id, 'migration-038')
WHERE (
    source_id LIKE 'p_%'
    OR target_id LIKE 'p_%'
    OR source_id LIKE 'a_%'
    OR target_id LIKE 'a_%'
  )
  AND (edge_category IS NULL OR edge_category IS DISTINCT FROM 'historical')
  -- Do not override opportunity/projected categories if they were
  -- intentionally set by another migration on a non-historical rel type.
  AND rel NOT IN ('qualifies_for', 'fund_opportunity', 'potential_lp');

-- ============================================================
-- SECTION 9: FIX — data_quality backfill for person and accelerator edges
-- ============================================================
-- Applies the same rules established in migration 032:
--   verified = true AND confidence >= 0.85  → 'HIGH'
--   confidence >= 0.70                      → 'MEDIUM'
--   confidence <  0.70                      → 'LOW'

UPDATE graph_edges
SET
  data_quality = CASE
    WHEN verified = TRUE AND COALESCE(confidence, 0) >= 0.85 THEN 'HIGH'
    WHEN COALESCE(confidence, 0) >= 0.70                     THEN 'MEDIUM'
    ELSE                                                           'LOW'
  END,
  agent_id = COALESCE(agent_id, 'migration-038')
WHERE (
    source_id LIKE 'p_%'
    OR target_id LIKE 'p_%'
    OR source_id LIKE 'a_%'
    OR target_id LIKE 'a_%'
  )
  AND data_quality IS DISTINCT FROM (
    CASE
      WHEN verified = TRUE AND COALESCE(confidence, 0) >= 0.85 THEN 'HIGH'
      WHEN COALESCE(confidence, 0) >= 0.70                     THEN 'MEDIUM'
      ELSE                                                           'LOW'
    END
  );

-- ============================================================
-- SECTION 10: INDEXES
-- ============================================================

-- Efficient lookup of all person edges by node prefix
CREATE INDEX IF NOT EXISTS idx_edges_person_source
  ON graph_edges(source_id)
  WHERE source_id LIKE 'p_%';

CREATE INDEX IF NOT EXISTS idx_edges_person_target
  ON graph_edges(target_id)
  WHERE target_id LIKE 'p_%';

-- Efficient lookup of all accelerator edges
CREATE INDEX IF NOT EXISTS idx_edges_accel_source
  ON graph_edges(source_id)
  WHERE source_id LIKE 'a_%';

CREATE INDEX IF NOT EXISTS idx_edges_accel_target
  ON graph_edges(target_id)
  WHERE target_id LIKE 'a_%';

-- Composite for person-rel queries (supports graph neighbour expansion)
CREATE INDEX IF NOT EXISTS idx_edges_person_rel
  ON graph_edges(rel, confidence DESC)
  WHERE source_id LIKE 'p_%' OR target_id LIKE 'p_%';

-- Composite for accelerator-rel queries
CREATE INDEX IF NOT EXISTS idx_edges_accel_rel
  ON graph_edges(rel, confidence DESC)
  WHERE source_id LIKE 'a_%' OR target_id LIKE 'a_%';

-- ============================================================
-- SECTION 11: POST-FIX VERIFICATION QUERIES
-- ============================================================

-- 11a. Person edge quality summary after update
SELECT
  rel,
  COUNT(*)                                                    AS total,
  ROUND(AVG(confidence), 3)                                   AS avg_confidence,
  COUNT(*) FILTER (WHERE confidence IS NULL)                  AS missing_confidence,
  COUNT(*) FILTER (WHERE source_name IS NOT NULL)             AS have_source_name,
  COUNT(*) FILTER (WHERE event_year IS NOT NULL)              AS have_event_year,
  COUNT(*) FILTER (WHERE edge_category = 'historical')        AS is_historical,
  COUNT(*) FILTER (WHERE data_quality = 'HIGH')               AS dq_high,
  COUNT(*) FILTER (WHERE data_quality = 'MEDIUM')             AS dq_medium,
  COUNT(*) FILTER (WHERE data_quality = 'LOW')                AS dq_low
FROM graph_edges
WHERE source_id LIKE 'p_%'
   OR target_id LIKE 'p_%'
GROUP BY rel
ORDER BY total DESC;

-- 11b. Accelerator edge quality summary after update
SELECT
  rel,
  source_name,
  COUNT(*)                                                    AS total,
  ROUND(AVG(confidence), 3)                                   AS avg_confidence,
  COUNT(*) FILTER (WHERE edge_category = 'historical')        AS is_historical,
  COUNT(*) FILTER (WHERE data_quality = 'HIGH')               AS dq_high,
  COUNT(*) FILTER (WHERE data_quality = 'MEDIUM')             AS dq_medium
FROM graph_edges
WHERE source_id LIKE 'a_%'
   OR target_id LIKE 'a_%'
GROUP BY rel, source_name
ORDER BY rel, total DESC;

-- 11c. Key accelerator nodes — edge and confidence coverage
SELECT
  a.id                                                        AS accel_id,
  a.name                                                      AS accel_name,
  ge.rel,
  COUNT(ge.id)                                                AS edge_count,
  ROUND(AVG(ge.confidence), 3)                               AS avg_confidence,
  COUNT(*) FILTER (WHERE ge.source_name IS NOT NULL)          AS have_source_name,
  COUNT(*) FILTER (WHERE ge.edge_category = 'historical')     AS is_historical
FROM accelerators a
JOIN graph_edges ge
  ON ge.source_id = a.id
  OR ge.target_id = a.id
WHERE a.id IN ('a_startupnv', 'a_angelnv', 'a_vtf')
GROUP BY a.id, a.name, ge.rel
ORDER BY a.id, ge.rel;

-- 11d. Orphaned person check post-fix (should still match pre-fix result;
--      this migration does not insert people or edges, only updates existing ones)
SELECT COUNT(*) AS orphaned_person_count
FROM people p
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = p.id
     OR ge.target_id = p.id
);

-- 11e. Overall coverage: any remaining NULL confidence on person/accel edges
SELECT
  CASE
    WHEN source_id LIKE 'p_%' OR target_id LIKE 'p_%' THEN 'person'
    WHEN source_id LIKE 'a_%' OR target_id LIKE 'a_%' THEN 'accelerator'
  END                                                          AS node_type,
  COUNT(*) FILTER (WHERE confidence IS NULL)                   AS null_confidence,
  COUNT(*) FILTER (WHERE source_name IS NULL)                  AS null_source_name,
  COUNT(*) FILTER (WHERE edge_category IS NULL)                AS null_edge_category,
  COUNT(*) FILTER (WHERE event_year IS NULL
                     AND rel IN ('founded_by','employed_by',
                                 'board_member','advises','formerly_of')) AS null_event_year_person,
  COUNT(*)                                                     AS total
FROM graph_edges
WHERE source_id LIKE 'p_%'
   OR target_id LIKE 'p_%'
   OR source_id LIKE 'a_%'
   OR target_id LIKE 'a_%'
GROUP BY node_type
ORDER BY node_type;
