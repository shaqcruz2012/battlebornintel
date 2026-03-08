-- Migration 032: Verify and Remediate Investment Edge Quality
-- Audits all invested_in edges in graph_edges, then updates confidence scores,
-- source attribution, event_year, and data_quality based on evidence quality rules.
--
-- Schema context:
--   graph_edges.confidence          FLOAT   — agent certainty score (0–1)
--   graph_edges.weight              JSONB   — typed payload; carries source_name, source key
--   graph_edges.provenance_source_id INTEGER — FK to sources(id)
--   graph_edges.verified            BOOLEAN
--   graph_edges.event_year          INTEGER
--   graph_edges.source_id           VARCHAR(40) — graph node ref (e.g. 'f_bbv', 'c_12')
--   graph_edges.target_id           VARCHAR(40) — graph node ref
--   data_quality                    VARCHAR(6)  — added by this migration (HIGH/MEDIUM/LOW)
--
-- BBV portfolio companies: source_id LIKE 'c_%' where numeric part BETWEEN 1 AND 60
--   i.e. target_id IN ('c_1' … 'c_60')
-- FundNV companies:        edges where source_id = 'f_fundnv'
--
-- Safe to run multiple times (all statements are idempotent WHERE guards).
-- Run: psql -U bbi -d battlebornintel -f database/migrations/032_verify_investment_edges.sql

-- ============================================================
-- SECTION 0: Extend graph_edges with data_quality column
-- ============================================================
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS data_quality VARCHAR(6)
    CHECK (data_quality IN ('HIGH', 'MEDIUM', 'LOW'));

CREATE INDEX IF NOT EXISTS idx_edges_data_quality
  ON graph_edges(data_quality)
  WHERE rel = 'invested_in';

CREATE INDEX IF NOT EXISTS idx_edges_invested_in_source
  ON graph_edges(source_id, target_id)
  WHERE rel = 'invested_in';

-- ============================================================
-- SECTION 1: Audit report — baseline state before any changes
-- ============================================================

-- 1a. Overall invested_in edge count and completeness
SELECT
  COUNT(*)                                                  AS total_invested_in_edges,
  COUNT(*) FILTER (WHERE confidence IS NOT NULL)            AS have_confidence,
  COUNT(*) FILTER (WHERE confidence IS NULL)                AS missing_confidence,
  COUNT(*) FILTER (WHERE weight IS NOT NULL
                     AND (weight ? 'source'
                       OR weight ? 'source_name'))          AS have_source_in_weight,
  COUNT(*) FILTER (WHERE provenance_source_id IS NOT NULL)  AS have_provenance_source_id,
  COUNT(*) FILTER (WHERE (weight IS NULL
                      OR (NOT weight ? 'source'
                         AND NOT weight ? 'source_name'))
                     AND provenance_source_id IS NULL)      AS missing_all_source,
  COUNT(*) FILTER (WHERE event_year IS NOT NULL)            AS have_event_year,
  COUNT(*) FILTER (WHERE event_year IS NULL)                AS missing_event_year,
  COUNT(*) FILTER (WHERE source_id IS NULL)                 AS missing_source_id,
  COUNT(*) FILTER (WHERE target_id IS NULL)                 AS missing_target_id
FROM graph_edges
WHERE rel = 'invested_in';

-- 1b. Confidence distribution before update
SELECT
  CASE
    WHEN confidence IS NULL          THEN 'NULL (unset)'
    WHEN confidence >= 0.90          THEN '>= 0.90'
    WHEN confidence >= 0.85          THEN '0.85 – 0.89'
    WHEN confidence >= 0.70          THEN '0.70 – 0.84'
    ELSE                                  '< 0.70'
  END                                     AS confidence_bucket,
  COUNT(*)                                AS edge_count
FROM graph_edges
WHERE rel = 'invested_in'
GROUP BY confidence_bucket
ORDER BY MIN(COALESCE(confidence, -1)) DESC;

-- 1c. Source name distribution before update
SELECT
  COALESCE(
    weight->>'source_name',
    weight->>'source',
    'NULL / not set'
  )                                       AS source_label,
  COUNT(*)                                AS edge_count
FROM graph_edges
WHERE rel = 'invested_in'
GROUP BY source_label
ORDER BY edge_count DESC
LIMIT 20;

-- 1d. Rows with NULL source_id or target_id (data integrity alert)
SELECT id, source_id, target_id, rel, confidence, event_year
FROM graph_edges
WHERE rel = 'invested_in'
  AND (source_id IS NULL OR target_id IS NULL);

-- ============================================================
-- SECTION 2: Update confidence scores based on source evidence
-- ============================================================
-- Priority order (most specific first):
--   co_invested rel handled separately below.
--   For invested_in:
--     2a. Crunchbase or SEC source → 0.92
--     2b. press_release source     → 0.85
--     2c. INFERRED or null source  → 0.70  (floor; won't overwrite higher values)

-- 2a. Crunchbase-sourced edges → confidence = 0.92
UPDATE graph_edges
SET
  confidence = 0.92,
  agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND (
    (weight->>'source') ILIKE '%crunchbase%'
    OR (weight->>'source_name') ILIKE '%crunchbase%'
    OR EXISTS (
      SELECT 1 FROM sources s
      WHERE s.id = provenance_source_id
        AND (s.publisher ILIKE '%crunchbase%'
          OR s.source_type = 'crunchbase')
    )
  )
  AND COALESCE(confidence, 0) < 0.92;

-- 2b. SEC-sourced edges → confidence = 0.92
UPDATE graph_edges
SET
  confidence = 0.92,
  agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND (
    (weight->>'source') ILIKE '%sec%'
    OR (weight->>'source_name') ILIKE '%sec%'
    OR EXISTS (
      SELECT 1 FROM sources s
      WHERE s.id = provenance_source_id
        AND (s.publisher ILIKE '%sec%'
          OR s.source_type = 'sec_filing')
    )
  )
  AND COALESCE(confidence, 0) < 0.92;

-- 2c. Press release sourced edges → confidence = 0.85
UPDATE graph_edges
SET
  confidence = 0.85,
  agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND (
    (weight->>'source') ILIKE '%press%'
    OR (weight->>'source_name') ILIKE '%press%'
    OR (weight->>'source') ILIKE '%press_release%'
    OR EXISTS (
      SELECT 1 FROM sources s
      WHERE s.id = provenance_source_id
        AND s.source_type = 'press_release'
    )
  )
  AND COALESCE(confidence, 0) < 0.85;

-- 2d. INFERRED or null source → confidence = 0.70 (only if not already set higher)
UPDATE graph_edges
SET
  confidence = 0.70,
  agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND (
    confidence IS NULL
    OR (weight->>'source') ILIKE '%inferred%'
    OR (weight->>'source_name') ILIKE '%inferred%'
    OR (
      confidence < 0.70
      AND provenance_source_id IS NULL
      AND (weight IS NULL
        OR (NOT weight ? 'source' AND NOT weight ? 'source_name'))
    )
  )
  AND COALESCE(confidence, 0) < 0.70;

-- 2e. co_invested edges → confidence = 0.88
UPDATE graph_edges
SET
  confidence = 0.88,
  agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'co_invested'
  AND COALESCE(confidence, 0) < 0.88;

-- ============================================================
-- SECTION 3: Add source attribution to edges missing it
-- ============================================================
-- Source attribution is stored in weight JSONB as 'source_name' key,
-- consistent with the existing weight payload pattern (weight->>'source').
-- We only update rows where BOTH provenance_source_id is NULL
-- AND no source_name / source key exists in weight.

-- 3a. BBV portfolio companies (target_id c_1 through c_60)
--     source_name = 'BBV Portfolio Report 2025'
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb)
             || jsonb_build_object('source_name', 'BBV Portfolio Report 2025'),
    agent_id = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND provenance_source_id IS NULL
  AND (
    weight IS NULL
    OR (NOT weight ? 'source_name' AND NOT weight ? 'source')
  )
  AND (
    -- target is a BBV portfolio company (c_1 to c_60)
    (
      target_id ~ '^c_[0-9]+$'
      AND CAST(SUBSTRING(target_id FROM 3) AS INTEGER) BETWEEN 1 AND 60
    )
    OR
    -- source is the BBV fund itself
    source_id = 'f_bbv'
  );

-- 3b. FundNV portfolio companies: source_id = 'f_fundnv'
--     source_name = 'FundNV SSBCI Report 2025'
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb)
             || jsonb_build_object('source_name', 'FundNV SSBCI Report 2025'),
    agent_id = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND source_id = 'f_fundnv'
  AND provenance_source_id IS NULL
  AND (
    weight IS NULL
    OR (NOT weight ? 'source_name' AND NOT weight ? 'source')
  );

-- 3c. All remaining invested_in edges with no source attribution
--     source_name = 'BBI Research'
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb)
             || jsonb_build_object('source_name', 'BBI Research'),
    agent_id = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND provenance_source_id IS NULL
  AND (
    weight IS NULL
    OR (NOT weight ? 'source_name' AND NOT weight ? 'source')
  );

-- ============================================================
-- SECTION 4: Fix NULL event_year on invested_in edges
-- ============================================================
-- Set event_year = 2025 for historical investments without a recorded year.
-- Only touches invested_in edges; does not alter co_invested or others.

UPDATE graph_edges
SET event_year = 2025,
    agent_id   = COALESCE(agent_id, 'migration-032')
WHERE rel = 'invested_in'
  AND event_year IS NULL;

-- ============================================================
-- SECTION 5: Populate data_quality on invested_in edges
-- ============================================================
-- Rules:
--   verified = true AND confidence >= 0.85  →  'HIGH'
--   confidence >= 0.70                      →  'MEDIUM'
--   confidence <  0.70                      →  'LOW'
-- Applied to both invested_in and co_invested for completeness.

UPDATE graph_edges
SET data_quality = CASE
    WHEN verified = TRUE AND COALESCE(confidence, 0) >= 0.85 THEN 'HIGH'
    WHEN COALESCE(confidence, 0) >= 0.70                     THEN 'MEDIUM'
    ELSE                                                           'LOW'
  END,
  agent_id = COALESCE(agent_id, 'migration-032')
WHERE rel IN ('invested_in', 'co_invested')
  AND (
    data_quality IS NULL
    OR data_quality IS DISTINCT FROM (
      CASE
        WHEN verified = TRUE AND COALESCE(confidence, 0) >= 0.85 THEN 'HIGH'
        WHEN COALESCE(confidence, 0) >= 0.70                     THEN 'MEDIUM'
        ELSE                                                           'LOW'
      END
    )
  );

-- ============================================================
-- SECTION 6: Post-remediation verification report
-- ============================================================

-- 6a. Summary by data_quality tier
SELECT
  rel,
  data_quality,
  COUNT(*)                              AS edge_count,
  ROUND(AVG(confidence), 3)            AS avg_confidence,
  COUNT(*) FILTER (WHERE verified)     AS verified_count,
  COUNT(*) FILTER (WHERE event_year IS NOT NULL) AS have_year
FROM graph_edges
WHERE rel IN ('invested_in', 'co_invested')
GROUP BY rel, data_quality
ORDER BY rel, data_quality;

-- 6b. Source attribution coverage after update
SELECT
  rel,
  COALESCE(
    weight->>'source_name',
    weight->>'source',
    CASE WHEN provenance_source_id IS NOT NULL THEN 'sources FK' END,
    'UNATTRIBUTED'
  )                                     AS attribution,
  COUNT(*)                              AS edge_count
FROM graph_edges
WHERE rel IN ('invested_in', 'co_invested')
GROUP BY rel, attribution
ORDER BY rel, edge_count DESC;

-- 6c. event_year coverage after update
SELECT
  rel,
  COUNT(*) FILTER (WHERE event_year IS NOT NULL) AS have_year,
  COUNT(*) FILTER (WHERE event_year IS NULL)     AS missing_year,
  MIN(event_year)                                AS earliest_year,
  MAX(event_year)                                AS latest_year
FROM graph_edges
WHERE rel IN ('invested_in', 'co_invested')
GROUP BY rel;

-- 6d. Remaining integrity issues (NULL source_id / target_id)
SELECT COUNT(*)
FROM graph_edges
WHERE rel = 'invested_in'
  AND (source_id IS NULL OR target_id IS NULL);

-- 6e. Full quality breakdown
SELECT
  data_quality,
  COUNT(*)                              AS edges,
  ROUND(AVG(confidence), 3)            AS avg_confidence,
  ROUND(MIN(confidence), 3)            AS min_confidence,
  ROUND(MAX(confidence), 3)            AS max_confidence,
  ROUND(COUNT(*) * 100.0
    / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct_of_total
FROM graph_edges
WHERE rel = 'invested_in'
GROUP BY data_quality
ORDER BY
  CASE data_quality WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END;
