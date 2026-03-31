-- Migration 104: Add missing integrity constraints
-- Purpose: Strengthen data integrity with CASCADE deletes for orphan-prone FKs,
--          CHECK constraints on enumerated columns, unique index to prevent
--          duplicate graph edges, and length limits on unbounded TEXT columns.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/104_integrity_constraints.sql

-- ============================================================
-- 1. CASCADE deletes for orphan-prone foreign keys
--    When a company is deleted, its people and listings should be
--    cleaned up automatically. Timeline events use SET NULL to
--    preserve the historical record.
-- ============================================================

-- people.company_id -> CASCADE
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_company_id_fkey;
ALTER TABLE people ADD CONSTRAINT people_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- listings.company_id -> CASCADE
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_company_id_fkey;
ALTER TABLE listings ADD CONSTRAINT listings_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- timeline_events.company_id -> SET NULL (preserve event history)
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_company_id_fkey;
ALTER TABLE timeline_events ADD CONSTRAINT timeline_events_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;


-- ============================================================
-- 2. CHECK constraint on programs.owner_entity_type
--    Restrict polymorphic owner to known entity types.
-- ============================================================

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_owner_type_valid;
ALTER TABLE programs ADD CONSTRAINT programs_owner_type_valid
  CHECK (owner_entity_type IS NULL OR owner_entity_type IN (
    'gov_agency', 'vc_firm', 'university', 'ssbci_fund', 'corporation', 'nonprofit'
  ));


-- ============================================================
-- 3. CHECK constraint on companies.stage
--    Valid stages derived from STAGE_ORDER in survival_analyzer.py.
--    Includes both 'pre_seed' and 'pre-seed' since both forms are
--    used in the codebase (STAGE_ORDER maps both to ordinal 1).
-- ============================================================

ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_stage_valid;
ALTER TABLE companies ADD CONSTRAINT companies_stage_valid
  CHECK (stage IN (
    'pre_seed', 'pre-seed', 'seed', 'series_a', 'series_b',
    'series_c_plus', 'growth', 'public'
  ));


-- ============================================================
-- 4. Unique index on graph_edges to prevent duplicate edges
--    Only enforced where edge_category is set (non-NULL), so
--    legacy rows without a category are not affected.
--    Uses CONCURRENTLY to avoid locking the table.
-- ============================================================

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_graph_edges_unique_rel
  ON graph_edges (source_id, target_id, rel)
  WHERE edge_category IS NOT NULL;


-- ============================================================
-- 5. Length constraints on unbounded TEXT columns
--    Prevents accidental insertion of extremely large values
--    (e.g., from a runaway agent or bad API input).
-- ============================================================

ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_description_length;
ALTER TABLE companies ADD CONSTRAINT companies_description_length
  CHECK (description IS NULL OR char_length(description) <= 10000);

ALTER TABLE graph_edges DROP CONSTRAINT IF EXISTS graph_edges_note_length;
ALTER TABLE graph_edges ADD CONSTRAINT graph_edges_note_length
  CHECK (note IS NULL OR char_length(note) <= 5000);
