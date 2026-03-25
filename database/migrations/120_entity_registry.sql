-- Migration 120: Unified Entity Registry
-- Single source of truth for all graph nodes. Every entity table syncs here
-- via triggers. graph.js and graph-traversal.js resolve nodes from this table
-- instead of dispatching to 7+ tables.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/120_entity_registry.sql

BEGIN;

-- ============================================================
-- ENTITY REGISTRY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS entity_registry (
  id              BIGSERIAL PRIMARY KEY,
  canonical_id    VARCHAR(80) UNIQUE NOT NULL,   -- e.g. 'c_42', 'f_ssbci-1', 'x_google'
  entity_type     VARCHAR(30) NOT NULL,          -- company, fund, person, program, accelerator, etc.
  label           VARCHAR(200) NOT NULL,         -- display name
  source_table    VARCHAR(40) NOT NULL,          -- origin table (companies, graph_funds, etc.)
  source_table_id VARCHAR(80) NOT NULL,          -- PK in origin table (cast to text)

  -- Data provenance (matches generation-2 entity pattern)
  confidence      FLOAT CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  source_id       INTEGER,
  agent_id        VARCHAR(60),

  -- Temporal metadata for T-GNN node lifetimes
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to        TIMESTAMPTZ,                   -- NULL = still active

  -- Full-text search
  search_vector   TSVECTOR,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core lookup indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_er_canonical ON entity_registry(canonical_id);
CREATE INDEX IF NOT EXISTS idx_er_type ON entity_registry(entity_type);
CREATE INDEX IF NOT EXISTS idx_er_source ON entity_registry(source_table, source_table_id);
CREATE INDEX IF NOT EXISTS idx_er_search ON entity_registry USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_er_temporal ON entity_registry(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_er_label ON entity_registry(label);

-- ============================================================
-- BACKFILL FROM ALL ENTITY TABLES
-- ============================================================

-- 1. companies (prefix: c_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, valid_from, updated_at)
SELECT
  'c_' || id,
  'company',
  name,
  'companies',
  id::text,
  CASE WHEN founded IS NOT NULL THEN make_date(founded, 1, 1)::timestamptz ELSE created_at END,
  updated_at
FROM companies
ON CONFLICT (canonical_id) DO NOTHING;

-- 2. graph_funds (prefix: f_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id)
SELECT
  'f_' || id,
  'fund',
  name,
  'graph_funds',
  id
FROM graph_funds
ON CONFLICT (canonical_id) DO NOTHING;

-- 3. people (ID is already the canonical form, e.g. 'p_john-doe' or bare slug)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id)
SELECT
  id,
  'person',
  name,
  'people',
  id
FROM people
ON CONFLICT (canonical_id) DO NOTHING;

-- 4. programs (prefix: p_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id, valid_from)
SELECT
  'p_' || id,
  'program',
  name,
  'programs',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id,
  COALESCE(start_date::timestamptz, created_at)
FROM programs
ON CONFLICT (canonical_id) DO NOTHING;

-- 5. externals (ID is already prefixed, e.g. 'x_google', 'i_a16z')
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id)
SELECT
  id,
  'external',
  name,
  'externals',
  id
FROM externals
ON CONFLICT (canonical_id) DO NOTHING;

-- 6. accelerators (ID is already prefixed, e.g. 'a_startupnv')
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             valid_from)
SELECT
  id,
  'accelerator',
  name,
  'accelerators',
  id,
  CASE WHEN founded IS NOT NULL THEN make_date(founded, 1, 1)::timestamptz ELSE NOW() END
FROM accelerators
ON CONFLICT (canonical_id) DO NOTHING;

-- 7. ecosystem_orgs (ID is already prefixed, e.g. 'e_edawn')
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id)
SELECT
  id,
  'ecosystem_org',
  name,
  'ecosystem_orgs',
  id
FROM ecosystem_orgs
ON CONFLICT (canonical_id) DO NOTHING;

-- 8. vc_firms (prefix: v_)
-- If a vc_firm has no legacy external, create new canonical_id; otherwise skip (external already registered)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  'v_' || slug,
  'vc_firm',
  name,
  'vc_firms',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM vc_firms
ON CONFLICT (canonical_id) DO NOTHING;

-- 9. angels (prefix: angel_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  'angel_' || slug,
  'angel',
  name,
  'angels',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM angels
ON CONFLICT (canonical_id) DO NOTHING;

-- 10. ssbci_funds (prefix: sf_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  'sf_' || slug,
  'ssbci_fund',
  name,
  'ssbci_funds',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM ssbci_funds
ON CONFLICT (canonical_id) DO NOTHING;

-- 11. corporations (prefix: corp_)
-- Use legacy_external_id as canonical_id if it exists (preserves graph_edges references)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  COALESCE(legacy_external_id, 'corp_' || slug),
  'corporation',
  name,
  'corporations',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM corporations
ON CONFLICT (canonical_id) DO UPDATE SET
  entity_type = 'corporation',
  source_table = 'corporations',
  source_table_id = EXCLUDED.source_table_id,
  updated_at = NOW();

-- 12. universities (prefix: uni_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  COALESCE(legacy_external_id, 'uni_' || slug),
  'university',
  name,
  'universities',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM universities
ON CONFLICT (canonical_id) DO UPDATE SET
  entity_type = 'university',
  source_table = 'universities',
  source_table_id = EXCLUDED.source_table_id,
  updated_at = NOW();

-- 13. gov_agencies (prefix: gov_)
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id,
                             confidence, verified, source_id, agent_id)
SELECT
  COALESCE(legacy_external_id, COALESCE(legacy_eco_id, 'gov_' || slug)),
  'gov_agency',
  name,
  'gov_agencies',
  id::text,
  confidence,
  verified,
  source_id,
  agent_id
FROM gov_agencies
ON CONFLICT (canonical_id) DO UPDATE SET
  entity_type = 'gov_agency',
  source_table = 'gov_agencies',
  source_table_id = EXCLUDED.source_table_id,
  updated_at = NOW();

-- ============================================================
-- POPULATE SEARCH VECTORS
-- ============================================================
UPDATE entity_registry SET search_vector = to_tsvector('english', label)
WHERE search_vector IS NULL;

-- ============================================================
-- SYNC TRIGGERS
-- Keep entity_registry in sync when source tables change.
-- ============================================================

-- Generic upsert helper
CREATE OR REPLACE FUNCTION er_upsert(
  p_canonical_id VARCHAR(80),
  p_entity_type VARCHAR(30),
  p_label VARCHAR(200),
  p_source_table VARCHAR(40),
  p_source_table_id VARCHAR(80),
  p_valid_from TIMESTAMPTZ DEFAULT NOW()
) RETURNS VOID AS $$
BEGIN
  INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, valid_from, search_vector, updated_at)
  VALUES (p_canonical_id, p_entity_type, p_label, p_source_table, p_source_table_id, p_valid_from,
          to_tsvector('english', p_label), NOW())
  ON CONFLICT (canonical_id) DO UPDATE SET
    label = EXCLUDED.label,
    search_vector = to_tsvector('english', EXCLUDED.label),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- companies
CREATE OR REPLACE FUNCTION trg_sync_companies() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    'c_' || NEW.id,
    'company',
    NEW.name,
    'companies',
    NEW.id::text,
    CASE WHEN NEW.founded IS NOT NULL THEN make_date(NEW.founded, 1, 1)::timestamptz ELSE NOW() END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_companies_er ON companies;
CREATE TRIGGER trg_companies_er AFTER INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION trg_sync_companies();

-- graph_funds
CREATE OR REPLACE FUNCTION trg_sync_graph_funds() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert('f_' || NEW.id, 'fund', NEW.name, 'graph_funds', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_graph_funds_er ON graph_funds;
CREATE TRIGGER trg_graph_funds_er AFTER INSERT OR UPDATE ON graph_funds
  FOR EACH ROW EXECUTE FUNCTION trg_sync_graph_funds();

-- people
CREATE OR REPLACE FUNCTION trg_sync_people() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(NEW.id, 'person', NEW.name, 'people', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_people_er ON people;
CREATE TRIGGER trg_people_er AFTER INSERT OR UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION trg_sync_people();

-- programs
CREATE OR REPLACE FUNCTION trg_sync_programs() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    'p_' || NEW.id,
    'program',
    NEW.name,
    'programs',
    NEW.id::text,
    COALESCE(NEW.start_date::timestamptz, NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_programs_er ON programs;
CREATE TRIGGER trg_programs_er AFTER INSERT OR UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION trg_sync_programs();

-- externals
CREATE OR REPLACE FUNCTION trg_sync_externals() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(NEW.id, 'external', NEW.name, 'externals', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_externals_er ON externals;
CREATE TRIGGER trg_externals_er AFTER INSERT OR UPDATE ON externals
  FOR EACH ROW EXECUTE FUNCTION trg_sync_externals();

-- accelerators
CREATE OR REPLACE FUNCTION trg_sync_accelerators() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    NEW.id,
    'accelerator',
    NEW.name,
    'accelerators',
    NEW.id,
    CASE WHEN NEW.founded IS NOT NULL THEN make_date(NEW.founded, 1, 1)::timestamptz ELSE NOW() END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_accelerators_er ON accelerators;
CREATE TRIGGER trg_accelerators_er AFTER INSERT OR UPDATE ON accelerators
  FOR EACH ROW EXECUTE FUNCTION trg_sync_accelerators();

-- ecosystem_orgs
CREATE OR REPLACE FUNCTION trg_sync_ecosystem_orgs() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(NEW.id, 'ecosystem_org', NEW.name, 'ecosystem_orgs', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_ecosystem_orgs_er ON ecosystem_orgs;
CREATE TRIGGER trg_ecosystem_orgs_er AFTER INSERT OR UPDATE ON ecosystem_orgs
  FOR EACH ROW EXECUTE FUNCTION trg_sync_ecosystem_orgs();

-- vc_firms
CREATE OR REPLACE FUNCTION trg_sync_vc_firms() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert('v_' || NEW.slug, 'vc_firm', NEW.name, 'vc_firms', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_vc_firms_er ON vc_firms;
CREATE TRIGGER trg_vc_firms_er AFTER INSERT OR UPDATE ON vc_firms
  FOR EACH ROW EXECUTE FUNCTION trg_sync_vc_firms();

-- angels
CREATE OR REPLACE FUNCTION trg_sync_angels() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert('angel_' || NEW.slug, 'angel', NEW.name, 'angels', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_angels_er ON angels;
CREATE TRIGGER trg_angels_er AFTER INSERT OR UPDATE ON angels
  FOR EACH ROW EXECUTE FUNCTION trg_sync_angels();

-- ssbci_funds
CREATE OR REPLACE FUNCTION trg_sync_ssbci_funds() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert('sf_' || NEW.slug, 'ssbci_fund', NEW.name, 'ssbci_funds', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_ssbci_funds_er ON ssbci_funds;
CREATE TRIGGER trg_ssbci_funds_er AFTER INSERT OR UPDATE ON ssbci_funds
  FOR EACH ROW EXECUTE FUNCTION trg_sync_ssbci_funds();

-- corporations
CREATE OR REPLACE FUNCTION trg_sync_corporations() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    COALESCE(NEW.legacy_external_id, 'corp_' || NEW.slug),
    'corporation',
    NEW.name,
    'corporations',
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_corporations_er ON corporations;
CREATE TRIGGER trg_corporations_er AFTER INSERT OR UPDATE ON corporations
  FOR EACH ROW EXECUTE FUNCTION trg_sync_corporations();

-- universities
CREATE OR REPLACE FUNCTION trg_sync_universities() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    COALESCE(NEW.legacy_external_id, 'uni_' || NEW.slug),
    'university',
    NEW.name,
    'universities',
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_universities_er ON universities;
CREATE TRIGGER trg_universities_er AFTER INSERT OR UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION trg_sync_universities();

-- gov_agencies
CREATE OR REPLACE FUNCTION trg_sync_gov_agencies() RETURNS TRIGGER AS $$
BEGIN
  PERFORM er_upsert(
    COALESCE(NEW.legacy_external_id, COALESCE(NEW.legacy_eco_id, 'gov_' || NEW.slug)),
    'gov_agency',
    NEW.name,
    'gov_agencies',
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_gov_agencies_er ON gov_agencies;
CREATE TRIGGER trg_gov_agencies_er AFTER INSERT OR UPDATE ON gov_agencies
  FOR EACH ROW EXECUTE FUNCTION trg_sync_gov_agencies();

COMMIT;
