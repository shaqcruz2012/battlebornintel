-- Migration 135: Data Validation Views
-- Adds views to detect data conflicts, orphan edges, duplicates,
-- temporal gaps, and feature coverage issues.
--
-- All views are CREATE OR REPLACE for idempotency. No data modification.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/135_data_validation_views.sql

BEGIN;

-- ============================================================
-- 1. v_orphan_edges — edges where source_id or target_id
--    doesn't match any known entity across all entity tables
-- ============================================================

CREATE OR REPLACE VIEW v_orphan_edges AS
SELECT ge.id, ge.source_id, ge.target_id, ge.rel
FROM graph_edges ge
WHERE NOT EXISTS (
  SELECT 1 FROM companies     WHERE 'c_'  || id = ge.source_id
  UNION ALL
  SELECT 1 FROM funds         WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM graph_funds   WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM people        WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM externals     WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM accelerators  WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM ecosystem_orgs WHERE id = ge.source_id
  UNION ALL
  SELECT 1 FROM regions       WHERE id::text = ge.source_id
  UNION ALL
  SELECT 1 FROM sectors       WHERE id::text = ge.source_id
  UNION ALL
  SELECT 1 FROM universities  WHERE id::text = ge.source_id
  UNION ALL
  SELECT 1 FROM programs      WHERE id::text = ge.source_id
  UNION ALL
  SELECT 1 FROM ssbci_funds   WHERE id::text = ge.source_id
  UNION ALL
  SELECT 1 FROM exchanges     WHERE id::text = ge.source_id
)
OR NOT EXISTS (
  SELECT 1 FROM companies     WHERE 'c_'  || id = ge.target_id
  UNION ALL
  SELECT 1 FROM funds         WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM graph_funds   WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM people        WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM externals     WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM accelerators  WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM ecosystem_orgs WHERE id = ge.target_id
  UNION ALL
  SELECT 1 FROM regions       WHERE id::text = ge.target_id
  UNION ALL
  SELECT 1 FROM sectors       WHERE id::text = ge.target_id
  UNION ALL
  SELECT 1 FROM universities  WHERE id::text = ge.target_id
  UNION ALL
  SELECT 1 FROM programs      WHERE id::text = ge.target_id
  UNION ALL
  SELECT 1 FROM ssbci_funds   WHERE id::text = ge.target_id
  UNION ALL
  SELECT 1 FROM exchanges     WHERE id::text = ge.target_id
);

-- ============================================================
-- 2. v_duplicate_edges — edges that appear more than once
--    (same source, target, rel)
-- ============================================================

CREATE OR REPLACE VIEW v_duplicate_edges AS
SELECT source_id, target_id, rel, COUNT(*) AS cnt
FROM graph_edges
GROUP BY source_id, target_id, rel
HAVING COUNT(*) > 1;

-- ============================================================
-- 3. v_data_conflicts — companies where metric_snapshots values
--    diverge from the companies table for the same metric
-- ============================================================

CREATE OR REPLACE VIEW v_data_conflicts AS
SELECT
  c.id                          AS company_id,
  c.name                        AS company_name,
  ms.metric_name,
  CASE ms.metric_name
    WHEN 'funding_m'  THEN c.funding_m::float
    WHEN 'employees'  THEN c.employees::float
    WHEN 'momentum'   THEN c.momentum::float
  END                           AS table_value,
  ms.value                      AS snapshot_value,
  ms.period_start,
  ms.period_end,
  ms.confidence,
  ms.verified
FROM companies c
JOIN metric_snapshots ms
  ON  ms.entity_type  = 'company'
  AND ms.entity_id    = c.id::text
  AND ms.metric_name IN ('funding_m', 'employees', 'momentum')
WHERE CASE ms.metric_name
        WHEN 'funding_m'  THEN c.funding_m::float
        WHEN 'employees'  THEN c.employees::float
        WHEN 'momentum'   THEN c.momentum::float
      END IS DISTINCT FROM ms.value;

-- ============================================================
-- 4. v_entity_counts — summary of all entity counts for
--    a quick data health check
-- ============================================================

CREATE OR REPLACE VIEW v_entity_counts AS
SELECT 'companies'      AS entity, COUNT(*) AS cnt FROM companies
UNION ALL
SELECT 'graph_edges',              COUNT(*)        FROM graph_edges
UNION ALL
SELECT 'people',                   COUNT(*)        FROM people
UNION ALL
SELECT 'externals',                COUNT(*)        FROM externals
UNION ALL
SELECT 'funds',                    COUNT(*)        FROM funds
UNION ALL
SELECT 'graph_funds',              COUNT(*)        FROM graph_funds
UNION ALL
SELECT 'ssbci_funds',              COUNT(*)        FROM ssbci_funds
UNION ALL
SELECT 'accelerators',             COUNT(*)        FROM accelerators
UNION ALL
SELECT 'ecosystem_orgs',           COUNT(*)        FROM ecosystem_orgs
UNION ALL
SELECT 'regions',                  COUNT(*)        FROM regions
UNION ALL
SELECT 'sectors',                  COUNT(*)        FROM sectors
UNION ALL
SELECT 'universities',             COUNT(*)        FROM universities
UNION ALL
SELECT 'programs',                 COUNT(*)        FROM programs
UNION ALL
SELECT 'exchanges',                COUNT(*)        FROM exchanges
UNION ALL
SELECT 'metric_snapshots',         COUNT(*)        FROM metric_snapshots
UNION ALL
SELECT 'analysis_results',         COUNT(*)        FROM analysis_results
UNION ALL
SELECT 'agent_runs',               COUNT(*)        FROM agent_runs
UNION ALL
SELECT 'computed_scores',          COUNT(*)        FROM computed_scores
UNION ALL
SELECT 'node_embeddings',          COUNT(*)        FROM node_embeddings
UNION ALL
SELECT 'clustering_results',       COUNT(*)        FROM clustering_results;

-- ============================================================
-- 5. v_temporal_gaps — edges that have an event_year but are
--    missing the valid_from temporal column added in migration 106
-- ============================================================

CREATE OR REPLACE VIEW v_temporal_gaps AS
SELECT id, source_id, target_id, rel, event_year
FROM graph_edges
WHERE valid_from IS NULL
  AND event_year IS NOT NULL;

-- ============================================================
-- 6. v_feature_coverage — percentage of non-null important
--    fields per company (10 tracked fields)
-- ============================================================

CREATE OR REPLACE VIEW v_feature_coverage AS
SELECT
  id,
  name,
  (
    (CASE WHEN funding_m   IS NOT NULL AND funding_m   > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN employees   IS NOT NULL AND employees   > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN momentum    IS NOT NULL AND momentum    > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN founded     IS NOT NULL                     THEN 1 ELSE 0 END) +
    (CASE WHEN description IS NOT NULL                     THEN 1 ELSE 0 END) +
    (CASE WHEN stage       IS NOT NULL                     THEN 1 ELSE 0 END) +
    (CASE WHEN sectors     IS NOT NULL AND sectors != '{}'  THEN 1 ELSE 0 END) +
    (CASE WHEN eligible    IS NOT NULL AND eligible != '{}' THEN 1 ELSE 0 END) +
    (CASE WHEN lat         IS NOT NULL                     THEN 1 ELSE 0 END) +
    (CASE WHEN lng         IS NOT NULL                     THEN 1 ELSE 0 END)
  )::float / 10.0 * 100 AS coverage_pct
FROM companies;

COMMIT;
