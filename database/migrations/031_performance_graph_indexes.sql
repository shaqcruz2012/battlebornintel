-- Migration 031: Graph Performance Indexes
-- Fixes missing indexes for edge_category queries and the full-range event_year scan.
--
-- Problems addressed:
--   1. idx_edges_event_year_null_recent (from migration 012) is a PARTIAL index
--      covering only event_year >= 2020. The query:
--        WHERE (event_year IS NULL OR event_year <= $1)
--      cannot use a partial index that excludes pre-2020 rows. PostgreSQL falls back
--      to a sequential scan. A plain B-tree index on event_year covers the full range.
--
--   2. Migration 021 created idx_edges_category_rel (edge_category, rel) but NOT
--      idx_edges_rel_category (rel, edge_category). For queries that filter by a
--      known rel value first and optionally by category, the leading column must be
--      rel. The absent index causes a sequential scan on rel-first predicates.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/031_performance_graph_indexes.sql

-- ============================================================
-- 1. Full-range event_year index (replaces the partial-index gap)
-- ============================================================
-- Covers: WHERE (event_year IS NULL OR event_year <= $1) for ANY $1 value.
-- NULLS FIRST ensures NULL rows appear at the start of the index so PostgreSQL
-- can satisfy the IS NULL branch without a separate scan.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edges_event_year_full
  ON graph_edges(event_year ASC NULLS FIRST);

-- ============================================================
-- 2. rel-leading composite index for category filtering
-- ============================================================
-- Covers: WHERE rel = $1 AND edge_category = $2
-- Column order: rel first (highest selectivity for known relationship types),
-- then edge_category. This is the reverse of idx_edges_category_rel from
-- migration 021 and is needed for rel-first predicate patterns.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edges_rel_category
  ON graph_edges(rel, edge_category);

-- ============================================================
-- 3. Covering index for the main graph edges SELECT
-- ============================================================
-- The getGraphData() query is:
--   SELECT source_id, target_id, rel, note, event_year,
--          edge_category, edge_style, edge_color, edge_opacity
--   FROM graph_edges
--   WHERE (event_year IS NULL OR event_year <= $1)
--
-- Including the projected columns in the index allows index-only scans,
-- eliminating heap fetches for each matching row.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edges_year_covering
  ON graph_edges(event_year ASC NULLS FIRST)
  INCLUDE (source_id, target_id, rel, edge_category, edge_style, edge_color, edge_opacity);

-- ============================================================
-- Update statistics
-- ============================================================
ANALYZE graph_edges;

-- ============================================================
-- Verification queries
-- ============================================================
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'graph_edges'
  AND indexname IN (
    'idx_edges_event_year_full',
    'idx_edges_rel_category',
    'idx_edges_year_covering'
  )
ORDER BY indexname;
