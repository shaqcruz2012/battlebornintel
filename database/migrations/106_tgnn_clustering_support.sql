-- Migration 106: T-GNN and Clustering Support
-- Adds temporal validity to graph_edges, node embedding storage,
-- clustering results, and time-series graph metrics.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/106_tgnn_clustering_support.sql

-- ============================================================
-- 1. Temporal validity columns on graph_edges
-- ============================================================
-- Enables temporal graph neural network (T-GNN) training by marking
-- when edges were active. Backfilled from event_year where available.

ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS valid_from DATE;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS valid_to DATE;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS edge_weight NUMERIC(6,4) DEFAULT 1.0;
ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS confidence FLOAT;

CREATE INDEX IF NOT EXISTS idx_graph_edges_temporal
  ON graph_edges (valid_from, valid_to)
  WHERE valid_from IS NOT NULL;

-- ============================================================
-- 2. node_embeddings — learned vector representations
-- ============================================================
-- Stores embeddings from T-GNN, node2vec, or feature-based models.
-- Uses FLOAT8[] to avoid pgvector dependency.

CREATE TABLE IF NOT EXISTS node_embeddings (
  id          BIGSERIAL PRIMARY KEY,
  node_id     VARCHAR(40)  NOT NULL,
  model_name  VARCHAR(60)  NOT NULL,
  embedding   FLOAT8[]     NOT NULL,
  dimension   INTEGER      NOT NULL,
  computed_at TIMESTAMPTZ  DEFAULT NOW(),
  metadata    JSONB,
  CONSTRAINT uq_node_embeddings_node_model UNIQUE (node_id, model_name)
);

CREATE INDEX IF NOT EXISTS idx_node_embeddings_model
  ON node_embeddings (model_name);

-- ============================================================
-- 3. clustering_results — k-means and other clustering outputs
-- ============================================================
-- Each run_id groups all node assignments from a single clustering run.
-- run_params stores k, features_used, silhouette_score, etc.

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

CREATE INDEX IF NOT EXISTS idx_clustering_results_model_cluster
  ON clustering_results (model_name, cluster_id);

-- ============================================================
-- 4. graph_metrics_temporal — time-series of graph metrics
-- ============================================================
-- Tracks how node centrality and community membership evolve over time.
-- Complements the existing graph_metrics_cache (latest-only) table.

CREATE TABLE IF NOT EXISTS graph_metrics_temporal (
  id               BIGSERIAL    PRIMARY KEY,
  node_id          VARCHAR(40)  NOT NULL,
  snapshot_date    DATE         NOT NULL,
  pagerank         NUMERIC(10,4),
  betweenness      NUMERIC(10,4),
  clustering_coeff NUMERIC(6,4),
  degree           INTEGER,
  community_id     INTEGER,
  computed_at      TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT uq_graph_metrics_temporal_node_date UNIQUE (node_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_graph_metrics_temporal_snapshot
  ON graph_metrics_temporal (snapshot_date);

-- ============================================================
-- 5. Backfill valid_from from event_year on existing edges
-- ============================================================

UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)
WHERE event_year IS NOT NULL
  AND valid_from IS NULL;

-- ============================================================
-- Update statistics for affected tables
-- ============================================================
ANALYZE graph_edges;
