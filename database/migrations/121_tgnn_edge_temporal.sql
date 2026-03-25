-- Migration 121: T-GNN temporal metadata on graph_edges
-- Adds valid_from / valid_to temporal windows for temporal graph neural network training.
-- Backfills valid_from from existing event_date and event_year columns.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/121_tgnn_edge_temporal.sql

BEGIN;

-- Temporal validity window
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ;

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS valid_to TIMESTAMPTZ;

-- Snapshot of edge properties at creation time (for T-GNN feature evolution)
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS state_snapshot JSONB;

-- Backfill valid_from from event_date (most precise)
UPDATE graph_edges
SET valid_from = event_date::timestamptz
WHERE event_date IS NOT NULL AND valid_from IS NULL;

-- Backfill from event_year for remaining rows
UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)::timestamptz
WHERE event_year IS NOT NULL AND valid_from IS NULL;

-- Default remaining to created_at
UPDATE graph_edges
SET valid_from = created_at
WHERE valid_from IS NULL;

-- Index for temporal range queries (T-GNN snapshot queries)
CREATE INDEX IF NOT EXISTS idx_edges_temporal_range ON graph_edges(valid_from, valid_to);

COMMIT;
