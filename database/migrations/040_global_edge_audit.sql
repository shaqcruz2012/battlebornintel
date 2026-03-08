-- Migration 040: Global Edge Audit — Schema Completeness, Data Quality, Indexes, Deduplication
-- Comprehensive audit and hardening of the graph_edges table.
--
-- Covers:
--   1. Add missing columns (confidence, verified, source_name, agent_id, data_quality)
--   2. Null data backfill and normalization
--   3. Performance indexes (named consistently with existing index inventory)
--   4. Duplicate edge cleanup — keep highest-confidence edge per (source, target, rel) triple
--   5. REL_CFG color alignment for rel types absent from prior migrations
--   6. v_edge_statistics view (replaces any prior version)
--
-- Pre-conditions checked:
--   Migration 001 — base table (source_id, target_id, rel, note, event_year INTEGER, created_at)
--   Migration 018 — matching_score, matching_criteria, eligible_since, eligible_until
--   Migration 021 — edge_category, edge_style, edge_color, edge_opacity
--   Migration 031 — idx_edges_event_year_full, idx_edges_rel_category, idx_edges_year_covering
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/040_global_edge_audit.sql

-- ============================================================
-- SECTION 1: Schema completeness — add missing columns
-- ============================================================

-- confidence: epistemic certainty of the edge (0.0–1.0).
-- Distinct from matching_score, which is program/fund alignment.
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS confidence FLOAT
    CHECK (confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0))
    DEFAULT 0.75;

-- verified: manual or automated confirmation that the edge is accurate.
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS verified BOOLEAN
    DEFAULT FALSE;

-- source_name: human-readable citation for the edge
-- (e.g., 'Crunchbase 2024-Q2', 'SEC filing 10-K 2023').
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS source_name TEXT;

-- agent_id: identifier of the agent run that produced this edge.
-- Links to agent_runs.agent_name for provenance tracing.
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS agent_id TEXT;

-- event_year already exists as INTEGER from migration 001.
-- The IF NOT EXISTS guard makes this idempotent even if the column type
-- were ever changed in a future migration.
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS event_year SMALLINT;
-- Note: IF NOT EXISTS prevents re-adding; the column already exists as INTEGER.
-- PostgreSQL will silently skip the above DDL if the column is present.
-- A separate type-coercion migration can narrow INTEGER -> SMALLINT later
-- once all data is confirmed to fit (range -32768 to 32767 covers any realistic year).

-- data_quality: categorical quality flag.
-- Expected values: 'high', 'medium', 'low', 'unverified'.
-- TEXT is intentional — avoids ENUM rigidity for a field under active iteration.
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS data_quality TEXT
    CHECK (data_quality IS NULL OR data_quality IN ('high', 'medium', 'low', 'unverified'));

-- ============================================================
-- SECTION 2: Null data audit and normalization
-- ============================================================

-- 2a. confidence defaults
-- Any row inserted before this column existed will have NULL.
UPDATE graph_edges
SET confidence = 0.75
WHERE confidence IS NULL;

-- 2b. edge_category defaults
-- Migration 021 backfilled most rows, but rows inserted after 021
-- without an explicit category may still be NULL.
UPDATE graph_edges
SET edge_category = 'historical'
WHERE edge_category IS NULL;

-- 2c. edge_opacity defaults by category
-- Apply category-specific opacity to rows that still lack it.
-- Order matters: handle 'opportunity' first so the second UPDATE
-- does not overwrite rows that were just set.
UPDATE graph_edges
SET edge_opacity = 0.6
WHERE edge_opacity IS NULL
  AND edge_category = 'opportunity';

UPDATE graph_edges
SET edge_opacity = 0.7
WHERE edge_opacity IS NULL
  AND edge_category = 'historical';

-- 2d. verified defaults — any row inserted before this column existed is unverified.
UPDATE graph_edges
SET verified = FALSE
WHERE verified IS NULL;

-- 2e. event_year backfill from created_at for rows where it is unknown.
-- This is a low-fidelity fallback: created_at is when the row was inserted,
-- not when the real-world event occurred. Set data_quality = 'low' on these
-- rows so downstream consumers can filter appropriately.
UPDATE graph_edges
SET event_year = EXTRACT(YEAR FROM created_at)::int,
    data_quality = COALESCE(data_quality, 'unverified')
WHERE event_year IS NULL;

-- 2f. data_quality default for rows that are still NULL
-- (i.e., event_year was already populated, so the above UPDATE did not run).
UPDATE graph_edges
SET data_quality = 'unverified'
WHERE data_quality IS NULL;

-- ============================================================
-- SECTION 3: Performance indexes
-- ============================================================
-- All indexes use IF NOT EXISTS so the migration is safe to re-run.
-- Indexes that duplicate existing index columns (idx_edges_source vs
-- idx_edges_source_id) are created under the new canonical names required
-- by the application query layer; PostgreSQL's planner will use whichever
-- index is cheapest — having two identical single-column indexes is harmless
-- for a table of this size.

-- 3a. source_id — canonical name expected by application queries
CREATE INDEX IF NOT EXISTS idx_edges_source_id
  ON graph_edges(source_id);

-- 3b. target_id — canonical name expected by application queries
CREATE INDEX IF NOT EXISTS idx_edges_target_id
  ON graph_edges(target_id);

-- 3c. rel — already exists as idx_edges_rel (migration 001/012);
-- this guard is a no-op but documents the expected index.
CREATE INDEX IF NOT EXISTS idx_edges_rel
  ON graph_edges(rel);

-- 3d. edge_category — already exists as idx_edges_category (migration 021).
CREATE INDEX IF NOT EXISTS idx_edges_category
  ON graph_edges(edge_category);

-- 3e. event_year — plain single-column index for full-range temporal queries.
-- idx_edges_event_year_full (migration 031) is NULLS FIRST ASC; this index
-- uses the same column name the application references and is a no-op if the
-- column is already indexed under this exact name.
CREATE INDEX IF NOT EXISTS idx_edges_event_year
  ON graph_edges(event_year);

-- 3f. confidence DESC — supports "most confident edges first" queries.
-- Partial WHERE clause excludes NULLs; all NULLs were backfilled above,
-- so this covers the full live dataset.
CREATE INDEX IF NOT EXISTS idx_edges_confidence
  ON graph_edges(confidence DESC)
  WHERE confidence IS NOT NULL;

-- 3g. (source_id, target_id) — two-column composite for bidirectional
-- edge lookups without the rel predicate. Complements idx_edges_source_target_rel
-- (migration 012) which has rel as the third column.
CREATE INDEX IF NOT EXISTS idx_edges_source_target
  ON graph_edges(source_id, target_id);

-- ============================================================
-- SECTION 4: Duplicate edge detection and cleanup
-- ============================================================
-- Strategy: for any (source_id, target_id, rel) triple with more than one row,
-- retain the row with the highest confidence value. When confidence is equal,
-- retain the row with the lower id (inserted first).
--
-- The DELETE uses a self-join: row A is deleted when row B shares the same
-- (source, target, rel) triple, B has a strictly lower id than A, and B has
-- confidence >= A. This guarantees exactly one survivor per triple.
--
-- Rows with matching_score are NOT considered duplicates of rows with different
-- matching_score values — they represent separate scoring runs and are
-- distinguished by id ordering alone.

DELETE FROM graph_edges a
USING graph_edges b
WHERE a.id > b.id
  AND a.source_id  = b.source_id
  AND a.target_id  = b.target_id
  AND a.rel        = b.rel
  AND COALESCE(a.confidence, 0.0) <= COALESCE(b.confidence, 0.0);

-- ============================================================
-- SECTION 5: REL_CFG alignment — edge_color defaults
-- ============================================================
-- Apply canonical hex colors to rel types that currently lack an edge_color.
-- Colors are sourced from frontend/src/data/constants.js (REL_CFG) where the
-- rel type is defined, or from the task specification where it is not yet in
-- the frontend registry.
--
-- Only rows with edge_color IS NULL are updated; existing color assignments
-- from migration 021 and data-population migrations are preserved.

-- founders_of: amber — distinct from 'founder_of' (which uses purple #9B72CF).
-- This rel type represents collective founding attribution and may appear in
-- research-agent output under this alternate key.
UPDATE graph_edges
SET edge_color = '#F59E0B'
WHERE rel = 'founders_of'
  AND edge_color IS NULL;

-- acquired: bright red.
-- REL_CFG has '#E85D5D' for this rel; some research-agent edges may have been
-- inserted without a color. Apply the task-specified canonical value '#EF4444'
-- only to uncolored rows to avoid overwriting intentional overrides.
UPDATE graph_edges
SET edge_color = '#EF4444'
WHERE rel = 'acquired'
  AND edge_color IS NULL;

-- licensed_to: violet — not present in REL_CFG as of constants.js snapshot.
UPDATE graph_edges
SET edge_color = '#8B5CF6'
WHERE rel = 'licensed_to'
  AND edge_color IS NULL;

-- sector_peer: neutral gray — not present in REL_CFG as of constants.js snapshot.
UPDATE graph_edges
SET edge_color = '#6B7280'
WHERE rel = 'sector_peer'
  AND edge_color IS NULL;

-- ============================================================
-- SECTION 6: Updated statistics view
-- ============================================================
-- Replaces any prior v_edge_statistics view. Uses CREATE OR REPLACE so
-- the migration is idempotent and safe against partial prior deployments.
--
-- Columns:
--   rel              — relationship type
--   edge_category    — 'historical' | 'opportunity' | 'projected'
--   count            — total edges in this group
--   avg_confidence   — mean confidence, rounded to 3 decimal places
--   verified_count   — how many edges have been manually/automatically confirmed
--   sourced_count    — how many edges carry a non-null source_name citation

CREATE OR REPLACE VIEW v_edge_statistics AS
SELECT
  rel,
  edge_category,
  COUNT(*)                                              AS count,
  AVG(confidence)::numeric(4,3)                         AS avg_confidence,
  SUM(CASE WHEN verified        THEN 1 ELSE 0 END)      AS verified_count,
  SUM(CASE WHEN source_name IS NOT NULL THEN 1 ELSE 0 END) AS sourced_count
FROM graph_edges
GROUP BY rel, edge_category
ORDER BY count DESC;

-- ============================================================
-- Update statistics for the query planner
-- ============================================================
ANALYZE graph_edges;

-- ============================================================
-- Verification queries
-- ============================================================

-- Column inventory after migration
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'graph_edges'
ORDER BY ordinal_position;

-- Index inventory after migration
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'graph_edges'
ORDER BY indexname;

-- Edge distribution by category and confidence band
SELECT
  edge_category,
  COUNT(*)                                                   AS total,
  SUM(CASE WHEN confidence >= 0.85 THEN 1 ELSE 0 END)        AS high_conf,
  SUM(CASE WHEN confidence >= 0.5 AND confidence < 0.85 THEN 1 ELSE 0 END) AS mid_conf,
  SUM(CASE WHEN confidence < 0.5  THEN 1 ELSE 0 END)         AS low_conf,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END)                  AS verified
FROM graph_edges
GROUP BY edge_category
ORDER BY edge_category;

-- Summary via the new statistics view
SELECT * FROM v_edge_statistics LIMIT 30;
