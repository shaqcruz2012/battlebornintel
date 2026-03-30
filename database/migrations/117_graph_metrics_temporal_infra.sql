-- Migration 116: Graph Metrics Temporal Infrastructure & Backfill
--
-- Extends tables created in 106_tgnn_clustering_support.sql with
-- additional columns required by the graph-analytics agent, then
-- backfills an initial temporal snapshot from graph_metrics_cache
-- and computes degree metrics from graph_edges.
--
-- Fully idempotent — safe to re-run.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/116_graph_metrics_temporal_infra.sql

BEGIN;

-- ============================================================
-- 1. graph_metrics_temporal — add missing columns
-- ============================================================
-- Table was created in migration 106 but lacked in_degree,
-- out_degree, and agent_id columns.

CREATE TABLE IF NOT EXISTS graph_metrics_temporal (
  id               BIGSERIAL    PRIMARY KEY,
  node_id          VARCHAR(40)  NOT NULL,
  snapshot_date    DATE         NOT NULL,
  pagerank         NUMERIC(10,6),
  betweenness      NUMERIC(10,6),
  clustering_coeff NUMERIC(10,6),
  degree           INTEGER,
  in_degree        INTEGER,
  out_degree       INTEGER,
  community_id     INTEGER,
  agent_id         VARCHAR(60),
  computed_at      TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT uq_graph_metrics_temporal_node_date UNIQUE (node_id, snapshot_date)
);

-- Add columns that migration 106's version did not include
ALTER TABLE graph_metrics_temporal ADD COLUMN IF NOT EXISTS in_degree  INTEGER;
ALTER TABLE graph_metrics_temporal ADD COLUMN IF NOT EXISTS out_degree INTEGER;
ALTER TABLE graph_metrics_temporal ADD COLUMN IF NOT EXISTS agent_id   VARCHAR(60);

-- Widen precision on pagerank/betweenness from (10,4) to (10,6)
-- if the columns already exist at lower precision. ALTER TYPE is
-- safe when widening numeric scale.
ALTER TABLE graph_metrics_temporal
  ALTER COLUMN pagerank TYPE NUMERIC(10,6),
  ALTER COLUMN betweenness TYPE NUMERIC(10,6),
  ALTER COLUMN clustering_coeff TYPE NUMERIC(10,6);

CREATE INDEX IF NOT EXISTS idx_graph_metrics_temporal_snapshot
  ON graph_metrics_temporal (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_graph_metrics_temporal_node
  ON graph_metrics_temporal (node_id);

-- ============================================================
-- 2. node_embeddings — ensure table & add model_version
-- ============================================================
-- Migration 106 created this table but without model_version.

CREATE TABLE IF NOT EXISTS node_embeddings (
  id          BIGSERIAL    PRIMARY KEY,
  node_id     VARCHAR(40)  NOT NULL,
  model_name  VARCHAR(60)  NOT NULL,
  model_version VARCHAR(20),
  embedding   FLOAT8[]     NOT NULL,
  dimension   INTEGER      NOT NULL,
  computed_at TIMESTAMPTZ  DEFAULT NOW(),
  metadata    JSONB,
  CONSTRAINT uq_node_embeddings_node_model UNIQUE (node_id, model_name)
);

ALTER TABLE node_embeddings ADD COLUMN IF NOT EXISTS model_version VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_node_embeddings_model
  ON node_embeddings (model_name);

-- ============================================================
-- 3. clustering_results — ensure table exists
-- ============================================================
-- Migration 106 created a per-node row design. We also create a
-- summary table for bulk algorithm results with JSONB assignments.

CREATE TABLE IF NOT EXISTS clustering_results (
  id                    SERIAL       PRIMARY KEY,
  run_id                UUID         DEFAULT gen_random_uuid(),
  model_name            VARCHAR(60)  NOT NULL,
  node_id               VARCHAR(40)  NOT NULL,
  cluster_id            INTEGER      NOT NULL,
  distance_to_centroid  NUMERIC(10,4),
  membership_confidence NUMERIC(5,4),
  computed_at           TIMESTAMPTZ  DEFAULT NOW(),
  run_params            JSONB,
  CONSTRAINT uq_clustering_results_run_node UNIQUE (run_id, node_id)
);

CREATE TABLE IF NOT EXISTS clustering_run_summary (
  id           SERIAL       PRIMARY KEY,
  algorithm    VARCHAR(40)  NOT NULL,
  params       JSONB,
  num_clusters INTEGER,
  modularity   NUMERIC(8,6),
  assignments  JSONB,           -- {node_id: cluster_id, ...}
  computed_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clustering_run_summary_algo
  ON clustering_run_summary (algorithm);

-- ============================================================
-- 4. Backfill initial temporal snapshot from graph_metrics_cache
-- ============================================================
-- Seeds graph_metrics_temporal with the current cache state so
-- there is at least one historical data point to trend from.

INSERT INTO graph_metrics_temporal
  (node_id, snapshot_date, pagerank, betweenness, community_id, agent_id)
SELECT
  node_id,
  CURRENT_DATE,
  pagerank,
  betweenness,
  community_id,
  'migration-117'
FROM graph_metrics_cache
WHERE node_id IS NOT NULL
ON CONFLICT (node_id, snapshot_date) DO NOTHING;

-- ============================================================
-- 5. Compute degree metrics from graph_edges
-- ============================================================
-- Fills in degree, in_degree, out_degree for today's snapshot rows.

UPDATE graph_metrics_temporal gmt
SET
  degree     = sub.deg,
  out_degree = sub.out_deg,
  in_degree  = sub.in_deg
FROM (
  SELECT
    node_id,
    COUNT(*)                                    AS deg,
    COUNT(*) FILTER (WHERE dir = 'out')         AS out_deg,
    COUNT(*) FILTER (WHERE dir = 'in')          AS in_deg
  FROM (
    SELECT source_id AS node_id, 'out' AS dir FROM graph_edges
    UNION ALL
    SELECT target_id AS node_id, 'in'  AS dir FROM graph_edges
  ) edges
  GROUP BY node_id
) sub
WHERE gmt.node_id = sub.node_id
  AND gmt.snapshot_date = CURRENT_DATE;

-- ============================================================
-- 6. Refresh statistics
-- ============================================================

ANALYZE graph_metrics_temporal;
ANALYZE node_embeddings;
ANALYZE clustering_results;
ANALYZE clustering_run_summary;

COMMIT;
