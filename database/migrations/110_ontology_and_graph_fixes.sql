-- Migration 110: Ontology and Graph Fixes
-- Addresses data-audit findings: FK linkage, score history, bidirectional edges,
-- inverse pair consistency, and external entity clarity.
-- All statements are idempotent.

BEGIN;

-- ============================================================
-- 1. People–Angels FK linkage
-- ============================================================

ALTER TABLE people
  ADD COLUMN IF NOT EXISTS angel_id INTEGER REFERENCES angels(id);

CREATE INDEX IF NOT EXISTS idx_people_angel_id ON people(angel_id);

-- Back-link existing angel people to their angels record by name match
UPDATE people p
SET angel_id = a.id
FROM angels a
WHERE p.is_angel = TRUE
  AND p.angel_id IS NULL
  AND LOWER(TRIM(p.name)) = LOWER(TRIM(a.name));


-- ============================================================
-- 2. Computed scores history (time-series tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS computed_scores_history (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL REFERENCES companies(id),
  irs_score     INTEGER,
  grade         VARCHAR(3),
  triggers      TEXT[],
  dims          JSONB,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_history_company
  ON computed_scores_history(company_id);
CREATE INDEX IF NOT EXISTS idx_scores_history_computed_at
  ON computed_scores_history(computed_at);

-- Trigger function: copy row into history on every UPDATE
CREATE OR REPLACE FUNCTION fn_computed_scores_to_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO computed_scores_history
    (company_id, irs_score, grade, triggers, dims, computed_at)
  VALUES
    (NEW.company_id, NEW.irs_score, NEW.grade, NEW.triggers, NEW.dims, NEW.computed_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to stay idempotent
DROP TRIGGER IF EXISTS trg_computed_scores_history ON computed_scores;

CREATE TRIGGER trg_computed_scores_history
  AFTER UPDATE ON computed_scores
  FOR EACH ROW
  EXECUTE FUNCTION fn_computed_scores_to_history();

-- Seed history with current scores so the timeline starts now
INSERT INTO computed_scores_history (company_id, irs_score, grade, triggers, dims, computed_at)
SELECT company_id, irs_score, grade, triggers, dims, computed_at
FROM computed_scores
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. Bidirectional edge enforcement
-- ============================================================

CREATE OR REPLACE FUNCTION ensure_bidirectional_edge()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act on symmetrical relationship types
  IF NEW.rel IN ('partners_with', 'co_invested') THEN
    INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, edge_weight)
    VALUES (NEW.target_id, NEW.source_id, NEW.rel, NEW.note, NEW.event_year,
            COALESCE(NEW.edge_category, 'historical'),
            COALESCE(NEW.edge_weight, 1.0))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bidirectional_edge ON graph_edges;

CREATE TRIGGER trg_bidirectional_edge
  AFTER INSERT ON graph_edges
  FOR EACH ROW
  EXECUTE FUNCTION ensure_bidirectional_edge();

-- Backfill missing inverse edges for partners_with
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, edge_weight)
SELECT e.target_id, e.source_id, e.rel, e.note, e.event_year,
       COALESCE(e.edge_category, 'historical'),
       COALESCE(e.edge_weight, 1.0)
FROM graph_edges e
WHERE e.rel = 'partners_with'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges inv
    WHERE inv.source_id = e.target_id
      AND inv.target_id = e.source_id
      AND inv.rel = e.rel
  )
ON CONFLICT DO NOTHING;

-- Backfill missing inverse edges for co_invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, edge_weight)
SELECT e.target_id, e.source_id, e.rel, e.note, e.event_year,
       COALESCE(e.edge_category, 'historical'),
       COALESCE(e.edge_weight, 1.0)
FROM graph_edges e
WHERE e.rel = 'co_invested'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges inv
    WHERE inv.source_id = e.target_id
      AND inv.target_id = e.source_id
      AND inv.rel = e.rel
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. Inverse pair consistency
-- ============================================================

-- Backfill founded_by where founder_of exists but inverse doesn't
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, edge_weight)
SELECT e.target_id, e.source_id, 'founded_by', e.note, e.event_year,
       COALESCE(e.edge_category, 'historical'),
       COALESCE(e.edge_weight, 1.0)
FROM graph_edges e
WHERE e.rel = 'founder_of'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges inv
    WHERE inv.source_id = e.target_id
      AND inv.target_id = e.source_id
      AND inv.rel = 'founded_by'
  )
ON CONFLICT DO NOTHING;

-- Backfill employed_by where worked_at exists but inverse doesn't
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, edge_weight)
SELECT e.target_id, e.source_id, 'employed_by', e.note, e.event_year,
       COALESCE(e.edge_category, 'historical'),
       COALESCE(e.edge_weight, 1.0)
FROM graph_edges e
WHERE e.rel = 'worked_at'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges inv
    WHERE inv.source_id = e.target_id
      AND inv.target_id = e.source_id
      AND inv.rel = 'employed_by'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. External entity clarity
-- ============================================================

COMMENT ON TABLE externals IS
  'Graph node proxy for entities that live outside the core BBI schema — '
  'corporations, universities, government agencies, and other external orgs. '
  'Each row provides a stable node ID (x_*) for graph_edges while the '
  'canonical_entity_type/canonical_entity_id columns link back to the '
  'decomposed domain tables (universities, programs, etc.) when applicable.';

ALTER TABLE externals
  ADD COLUMN IF NOT EXISTS canonical_entity_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS canonical_entity_id   INTEGER;

COMMENT ON COLUMN externals.canonical_entity_type IS
  'Domain table name the external maps to (e.g. universities, programs)';
COMMENT ON COLUMN externals.canonical_entity_id IS
  'PK in the canonical domain table';

CREATE INDEX IF NOT EXISTS idx_externals_canonical
  ON externals(canonical_entity_type, canonical_entity_id)
  WHERE canonical_entity_type IS NOT NULL;

COMMIT;
