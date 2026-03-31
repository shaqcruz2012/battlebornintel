-- Migration 122: Node Feature Vectors for T-GNN Training
-- Builds a standardized numeric feature vector materialized view from graph_edges
-- and entity tables, providing ready-to-use input features for graph neural networks.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/122_node_feature_vectors.sql

-- ============================================================
-- 1. Materialized view: node_features
-- ============================================================
-- Drop existing view if present (idempotent re-run support)
DROP MATERIALIZED VIEW IF EXISTS node_features;

CREATE MATERIALIZED VIEW node_features AS
WITH
-- Enumerate all unique node IDs from graph_edges
all_nodes AS (
  SELECT source_id AS node_id FROM graph_edges
  UNION
  SELECT target_id AS node_id FROM graph_edges
),

-- Degree counts
degree_stats AS (
  SELECT
    n.node_id,
    COALESCE(out_d.cnt, 0) + COALESCE(in_d.cnt, 0) AS degree,
    COALESCE(in_d.cnt, 0)  AS in_degree,
    COALESCE(out_d.cnt, 0) AS out_degree
  FROM all_nodes n
  LEFT JOIN (
    SELECT source_id, COUNT(*) AS cnt FROM graph_edges GROUP BY source_id
  ) out_d ON out_d.source_id = n.node_id
  LEFT JOIN (
    SELECT target_id, COUNT(*) AS cnt FROM graph_edges GROUP BY target_id
  ) in_d ON in_d.target_id = n.node_id
),

-- Edge type diversity: count of distinct rel types per node
edge_diversity AS (
  SELECT node_id, COUNT(DISTINCT rel) AS edge_type_diversity
  FROM (
    SELECT source_id AS node_id, rel FROM graph_edges
    UNION ALL
    SELECT target_id AS node_id, rel FROM graph_edges
  ) e
  GROUP BY node_id
),

-- Earliest edge year per node (fallback for years_active)
earliest_edge AS (
  SELECT node_id, MIN(event_year) AS first_edge_year
  FROM (
    SELECT source_id AS node_id, event_year FROM graph_edges WHERE event_year IS NOT NULL
    UNION ALL
    SELECT target_id AS node_id, event_year FROM graph_edges WHERE event_year IS NOT NULL
  ) ey
  GROUP BY node_id
),

-- Timeline event existence per company name
timeline_flag AS (
  SELECT DISTINCT company_name, 1 AS has_events
  FROM timeline_events
)

SELECT
  n.node_id,

  -- node_type encoded from prefix, with table-existence fallback
  CASE
    WHEN n.node_id LIKE 'c\_%'  ESCAPE '\' THEN 1   -- company
    WHEN n.node_id LIKE 'f\_%'  ESCAPE '\' THEN 2   -- fund
    WHEN n.node_id LIKE 's\_%'  ESCAPE '\' THEN 3   -- sector
    WHEN n.node_id LIKE 'r\_%'  ESCAPE '\' THEN 4   -- region
    WHEN n.node_id LIKE 'p\_%'  ESCAPE '\' THEN 5   -- person
    WHEN n.node_id LIKE 'x\_%'  ESCAPE '\' THEN 6   -- external
    WHEN n.node_id LIKE 'ex\_%' ESCAPE '\' THEN 7   -- exchange
    WHEN n.node_id LIKE 'a\_%'  ESCAPE '\' THEN 8   -- accelerator
    WHEN n.node_id LIKE 'e\_%'  ESCAPE '\' THEN 9   -- ecosystem
    WHEN n.node_id LIKE 'pr\_%' ESCAPE '\' THEN 10  -- program
    -- Fallback: check if the node_id exists in a known table
    WHEN co.id IS NOT NULL       THEN 1
    WHEN fu.id IS NOT NULL       THEN 2
    WHEN pe.id IS NOT NULL       THEN 5
    WHEN ex.id IS NOT NULL       THEN 6
    WHEN ac.id IS NOT NULL       THEN 8
    WHEN eo.id IS NOT NULL       THEN 9
    ELSE 0  -- unknown
  END::SMALLINT AS node_type,

  -- Degree features
  ds.degree::INTEGER,
  ds.in_degree::INTEGER,
  ds.out_degree::INTEGER,

  -- Company features (NULL for non-company nodes)
  co.funding_m::NUMERIC,
  co.employees::INTEGER,
  co.momentum::INTEGER,
  co.founded::INTEGER AS founded_year,
  CASE co.stage
    WHEN 'pre_seed'      THEN 1
    WHEN 'seed'          THEN 2
    WHEN 'series_a'      THEN 3
    WHEN 'series_b'      THEN 4
    WHEN 'series_c_plus' THEN 5
    WHEN 'growth'        THEN 6
    WHEN 'public'        THEN 7
    ELSE NULL
  END::SMALLINT AS stage_encoded,

  -- Fund features (NULL for non-fund nodes)
  fu.allocated_m::NUMERIC,
  fu.deployed_m::NUMERIC,
  fu.company_count::INTEGER AS fund_company_count,

  -- Sector count for company nodes
  CASE
    WHEN co.id IS NOT NULL THEN COALESCE(array_length(co.sectors, 1), 0)
    ELSE NULL
  END::INTEGER AS sector_count,

  -- Edge type diversity
  ed.edge_type_diversity::INTEGER,

  -- Has timeline events (company nodes matched by name)
  CASE
    WHEN co.id IS NOT NULL THEN COALESCE(tf.has_events, 0)
    ELSE NULL
  END::SMALLINT AS has_timeline_events,

  -- Years active: current year minus founded (company) or first edge year
  CASE
    WHEN co.founded IS NOT NULL THEN (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - co.founded)
    WHEN ee.first_edge_year IS NOT NULL THEN (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - ee.first_edge_year)
    ELSE NULL
  END::INTEGER AS years_active

FROM all_nodes n
JOIN  degree_stats ds ON ds.node_id = n.node_id
LEFT JOIN edge_diversity ed ON ed.node_id = n.node_id
LEFT JOIN earliest_edge ee ON ee.node_id = n.node_id

-- Join to entity tables via slug / id for feature enrichment and type detection
LEFT JOIN companies co
  ON (n.node_id = 'c_' || co.slug)
LEFT JOIN funds fu
  ON (n.node_id = fu.id)
LEFT JOIN people pe
  ON (n.node_id = pe.id)
LEFT JOIN externals ex
  ON (n.node_id = ex.id)
LEFT JOIN accelerators ac
  ON (n.node_id = ac.id)
LEFT JOIN ecosystem_orgs eo
  ON (n.node_id = eo.id)

-- Timeline events matched by company name
LEFT JOIN timeline_flag tf
  ON co.id IS NOT NULL AND tf.company_name = co.name;


-- ============================================================
-- 2. Indexes on node_features
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_node_features_node_id
  ON node_features (node_id);

CREATE INDEX IF NOT EXISTS idx_node_features_node_type
  ON node_features (node_type);

CREATE INDEX IF NOT EXISTS idx_node_features_degree
  ON node_features (degree DESC);


-- ============================================================
-- 3. Refresh helper function
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_node_features() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY node_features;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 4. Initial refresh
-- ============================================================
REFRESH MATERIALIZED VIEW node_features;


-- ============================================================
-- Update statistics
-- ============================================================
ANALYZE node_features;
