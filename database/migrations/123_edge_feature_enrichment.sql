-- Migration 123: Edge Feature Enrichment for T-GNN / ML Graph Analysis
--
-- Adds computed edge features to graph_edges and creates a materialized view
-- combining all edge attributes needed for temporal graph neural networks.
--
-- New columns: time_delta_years, source_degree, target_degree, rel_encoded, category_encoded
-- New view:    edge_features (materialized)
-- New indexes: ML query patterns on encoded columns
--
-- All operations are idempotent.

BEGIN;

-- ============================================================
-- 1. Add computed edge feature columns
-- ============================================================

ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS time_delta_years NUMERIC(6,2);
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS source_degree INTEGER;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS target_degree INTEGER;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS rel_encoded SMALLINT;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS category_encoded SMALLINT;

COMMENT ON COLUMN graph_edges.time_delta_years IS
  'Years between edge valid_from and reference date (2026-01-01). Negative = before reference. Used as temporal feature for T-GNN.';
COMMENT ON COLUMN graph_edges.source_degree IS
  'Total degree of source node at time of edge creation. Snapshot for ML feature.';
COMMENT ON COLUMN graph_edges.target_degree IS
  'Total degree of target node at time of edge creation. Snapshot for ML feature.';
COMMENT ON COLUMN graph_edges.rel_encoded IS
  'Numeric encoding of rel type for ML models. See rel_type_encoding table or migration 123 for mapping.';
COMMENT ON COLUMN graph_edges.category_encoded IS
  'Numeric encoding of edge_category: historical=1, opportunity=2, projected=3.';

-- ============================================================
-- 2. Rel type encoding reference table
-- ============================================================
-- Persistent lookup for decoding predictions back to human-readable labels.

CREATE TABLE IF NOT EXISTS rel_type_encoding (
  rel         TEXT PRIMARY KEY,
  encoded     SMALLINT NOT NULL UNIQUE,
  description TEXT
);

-- Idempotent insert of the full mapping
INSERT INTO rel_type_encoding (rel, encoded, description) VALUES
  ('invested_in',             1,  'Direct investment relationship'),
  ('co_invested',             2,  'Co-investment alongside another investor'),
  ('accelerated_by',          3,  'Participated in accelerator program'),
  ('founded_by',              4,  'Company founded by person'),
  ('founder_of',              5,  'Person is founder of company'),
  ('employed_at',             6,  'Currently employed at'),
  ('worked_at',               7,  'Previously worked at'),
  ('acquired',                8,  'Acquired another entity'),
  ('acquired_by',             9,  'Was acquired by another entity'),
  ('partners_with',          10,  'Active partnership'),
  ('contracts_with',         11,  'Contractual relationship'),
  ('qualifies_for',          12,  'Qualifies for program/fund'),
  ('won_pitch',              13,  'Won a pitch competition'),
  ('spinout_of',             14,  'Spun out from parent entity'),
  ('mentored',               15,  'Mentoring relationship'),
  ('research_partnership',   16,  'Joint research collaboration'),
  ('grants_to',              17,  'Provides grant funding to'),
  ('funded_by',              18,  'Received funding from'),
  ('committed_to',           19,  'Capital commitment to fund'),
  ('supports',               20,  'General support relationship'),
  ('hosts_tenant',           21,  'Landlord/tenant or incubator hosting'),
  ('backed_by_founders_of',  22,  'Backed by founders of another company'),
  ('awards',                 23,  'Award or recognition given'),
  ('participated_in',        24,  'Participated in event/program'),
  ('employees_from',         25,  'Hired employees from another entity'),
  ('funds',                  26,  'Provides ongoing funding'),
  ('potential_partner',      27,  'Potential future partnership'),
  ('other',                  99,  'Uncategorized relationship type')
ON CONFLICT (rel) DO UPDATE SET
  encoded = EXCLUDED.encoded,
  description = EXCLUDED.description;

-- ============================================================
-- 3. Backfill rel_encoded
-- ============================================================

UPDATE graph_edges ge
SET rel_encoded = rte.encoded
FROM rel_type_encoding rte
WHERE ge.rel = rte.rel
  AND (ge.rel_encoded IS NULL OR ge.rel_encoded IS DISTINCT FROM rte.encoded);

-- Edges with rel types not in the mapping get code 99 (other)
UPDATE graph_edges
SET rel_encoded = 99
WHERE rel_encoded IS NULL;

-- ============================================================
-- 4. Backfill category_encoded
-- ============================================================
-- historical=1, opportunity=2, projected=3

UPDATE graph_edges
SET category_encoded = CASE edge_category
    WHEN 'historical' THEN 1
    WHEN 'opportunity' THEN 2
    WHEN 'projected'   THEN 3
    ELSE 0  -- unknown/null
  END
WHERE category_encoded IS NULL
   OR category_encoded IS DISTINCT FROM (
     CASE edge_category
       WHEN 'historical' THEN 1
       WHEN 'opportunity' THEN 2
       WHEN 'projected'   THEN 3
       ELSE 0
     END
   );

-- ============================================================
-- 5. Backfill time_delta_years
-- ============================================================
-- Reference date: 2026-01-01 (start of current analysis year)
-- Formula: (valid_from - reference) / 365.25

UPDATE graph_edges
SET time_delta_years = ROUND(
    (valid_from - DATE '2026-01-01')::NUMERIC / 365.25,
    2
  )
WHERE valid_from IS NOT NULL
  AND (time_delta_years IS NULL OR time_delta_years IS DISTINCT FROM
       ROUND((valid_from - DATE '2026-01-01')::NUMERIC / 365.25, 2));

-- Edges without valid_from: use event_year as fallback
UPDATE graph_edges
SET time_delta_years = ROUND(
    (make_date(event_year, 7, 1) - DATE '2026-01-01')::NUMERIC / 365.25,
    2
  )
WHERE valid_from IS NULL
  AND event_year IS NOT NULL
  AND time_delta_years IS NULL;

-- ============================================================
-- 6. Backfill source_degree and target_degree
-- ============================================================
-- Degree = total number of edges incident on a node (as source or target).

-- Precompute node degrees into a temp table
CREATE TEMP TABLE IF NOT EXISTS _node_degrees AS
SELECT node_id, COUNT(*) AS degree
FROM (
  SELECT source_id AS node_id FROM graph_edges
  UNION ALL
  SELECT target_id AS node_id FROM graph_edges
) sub
GROUP BY node_id;

CREATE INDEX ON _node_degrees (node_id);

-- Backfill source_degree
UPDATE graph_edges ge
SET source_degree = nd.degree
FROM _node_degrees nd
WHERE ge.source_id = nd.node_id
  AND (ge.source_degree IS NULL OR ge.source_degree IS DISTINCT FROM nd.degree);

-- Backfill target_degree
UPDATE graph_edges ge
SET target_degree = nd.degree
FROM _node_degrees nd
WHERE ge.target_id = nd.node_id
  AND (ge.target_degree IS NULL OR ge.target_degree IS DISTINCT FROM nd.degree);

DROP TABLE IF EXISTS _node_degrees;

-- ============================================================
-- 7. Materialized view: edge_features
-- ============================================================
-- Combines all edge attributes needed for ML feature vectors.
-- Refreshed on demand after graph mutations.

DROP MATERIALIZED VIEW IF EXISTS edge_features;

CREATE MATERIALIZED VIEW edge_features AS
SELECT
  ge.id                                        AS edge_id,
  ge.source_id,
  ge.target_id,
  ge.rel,
  COALESCE(ge.edge_weight, 1.0)               AS edge_weight,
  COALESCE(ge.confidence, 0.5)                 AS confidence,
  COALESCE(ge.matching_score, 0.0)             AS matching_score,
  COALESCE(ge.rel_encoded, 99)                 AS rel_encoded,
  COALESCE(ge.category_encoded, 0)             AS category_encoded,
  ge.time_delta_years,
  COALESCE(ge.source_degree, 0)                AS source_degree,
  COALESCE(ge.target_degree, 0)                AS target_degree,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM graph_edges ge2
      WHERE ge2.source_id = ge.target_id
        AND ge2.target_id = ge.source_id
    ) THEN 1
    ELSE 0
  END                                          AS is_bidirectional
FROM graph_edges ge;

COMMENT ON MATERIALIZED VIEW edge_features IS
  'Precomputed edge feature vectors for T-GNN and ML graph analysis. '
  'Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY edge_features;';

-- Unique index required for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_edge_features_edge_id
  ON edge_features (edge_id);

-- ============================================================
-- 8. Indexes for ML query patterns
-- ============================================================

-- Encoded rel type for filtering by relationship class
CREATE INDEX IF NOT EXISTS idx_graph_edges_rel_encoded
  ON graph_edges (rel_encoded);

-- Category encoding for filtering historical vs opportunity vs projected
CREATE INDEX IF NOT EXISTS idx_graph_edges_category_encoded
  ON graph_edges (category_encoded);

-- Time delta for temporal windowing queries
CREATE INDEX IF NOT EXISTS idx_graph_edges_time_delta
  ON graph_edges (time_delta_years)
  WHERE time_delta_years IS NOT NULL;

-- Composite index for ML feature lookups by node
CREATE INDEX IF NOT EXISTS idx_graph_edges_source_features
  ON graph_edges (source_id, rel_encoded, category_encoded);

CREATE INDEX IF NOT EXISTS idx_graph_edges_target_features
  ON graph_edges (target_id, rel_encoded, category_encoded);

-- Edge features view indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_edge_features_source
  ON edge_features (source_id);

CREATE INDEX IF NOT EXISTS idx_edge_features_target
  ON edge_features (target_id);

CREATE INDEX IF NOT EXISTS idx_edge_features_rel_encoded
  ON edge_features (rel_encoded);

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES (run outside transaction)
-- ============================================================

-- Column population stats
SELECT
  COUNT(*)                                            AS total_edges,
  COUNT(*) FILTER (WHERE rel_encoded IS NOT NULL)     AS has_rel_encoded,
  COUNT(*) FILTER (WHERE category_encoded IS NOT NULL) AS has_category_encoded,
  COUNT(*) FILTER (WHERE time_delta_years IS NOT NULL) AS has_time_delta,
  COUNT(*) FILTER (WHERE source_degree IS NOT NULL)   AS has_source_degree,
  COUNT(*) FILTER (WHERE target_degree IS NOT NULL)   AS has_target_degree
FROM graph_edges;

-- Rel encoding distribution
SELECT rte.rel, rte.encoded, COUNT(ge.id) AS edge_count
FROM rel_type_encoding rte
LEFT JOIN graph_edges ge ON ge.rel = rte.rel
GROUP BY rte.rel, rte.encoded
ORDER BY rte.encoded;

-- Category encoding distribution
SELECT
  category_encoded,
  CASE category_encoded
    WHEN 1 THEN 'historical'
    WHEN 2 THEN 'opportunity'
    WHEN 3 THEN 'projected'
    ELSE 'unknown'
  END AS category_label,
  COUNT(*) AS edge_count
FROM graph_edges
GROUP BY category_encoded
ORDER BY category_encoded;

-- Time delta range
SELECT
  MIN(time_delta_years) AS earliest_delta,
  MAX(time_delta_years) AS latest_delta,
  AVG(time_delta_years)::NUMERIC(6,2) AS avg_delta
FROM graph_edges
WHERE time_delta_years IS NOT NULL;

-- Degree stats
SELECT
  AVG(source_degree)::NUMERIC(6,1) AS avg_source_degree,
  MAX(source_degree) AS max_source_degree,
  AVG(target_degree)::NUMERIC(6,1) AS avg_target_degree,
  MAX(target_degree) AS max_target_degree
FROM graph_edges;

-- Edge features view row count
SELECT COUNT(*) AS edge_features_rows FROM edge_features;

-- Bidirectional edge count
SELECT
  is_bidirectional,
  COUNT(*) AS cnt
FROM edge_features
GROUP BY is_bidirectional;
