-- Migration 004: Enrich Existing Tables
-- Phase 3 — ADD columns to existing tables only. No columns removed.
-- All new columns are nullable or have safe defaults so existing
-- INSERT / SELECT queries continue to work without modification.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/004_enrich_existing_tables.sql
--
-- AGENT METADATA PATTERN (applied consistently to all agent-writable tables):
--   confidence       FLOAT CHECK (confidence BETWEEN 0 AND 1)  -- agent certainty
--   source_id        INTEGER REFERENCES sources(id)            -- provenance FK
--   agent_id         VARCHAR(60)                               -- which agent wrote this
--   verified         BOOLEAN NOT NULL DEFAULT FALSE            -- human-reviewed flag
--   extracted_at     TIMESTAMPTZ                               -- when agent extracted data
-- NOTE: graph_edges uses provenance_source_id instead of source_id
-- because source_id is already the graph node reference column.

-- ============================================================
-- companies: structural enrichment + agent metadata
-- Existing columns queried by API:
--   id, slug, name, stage, sectors, city, region, funding_m,
--   momentum, employees, founded, description, eligible, lat, lng
-- ============================================================
ALTER TABLE companies
  -- business data
  ADD COLUMN IF NOT EXISTS revenue_m          NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS website            TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS crunchbase_url     TEXT,
  -- normalised FK linkages (NULL until back-fill migration 006 runs)
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS source_url         TEXT,
  ADD COLUMN IF NOT EXISTS source_type        VARCHAR(30),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

-- Partial index: unverified rows are the agent work queue
CREATE INDEX IF NOT EXISTS idx_companies_unverified
  ON companies(id) WHERE verified = FALSE;

CREATE INDEX IF NOT EXISTS idx_companies_region_id
  ON companies(region_id);

-- ============================================================
-- people: affiliations + expertise + agent metadata
-- Existing columns: id, name, role, company_id, note
-- ============================================================
ALTER TABLE people
  ADD COLUMN IF NOT EXISTS affiliations       TEXT[],    -- other org IDs this person is linked to
  ADD COLUMN IF NOT EXISTS expertise_sectors  TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url       TEXT,
  ADD COLUMN IF NOT EXISTS is_angel           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_people_company_id ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_is_angel   ON people(is_angel) WHERE is_angel = TRUE;
CREATE INDEX IF NOT EXISTS idx_people_sectors    ON people USING GIN (expertise_sectors);

-- ============================================================
-- externals: type refinement + agent metadata
-- Existing columns: id, name, entity_type, note
-- ============================================================
ALTER TABLE externals
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  ADD COLUMN IF NOT EXISTS website            TEXT,
  -- typed FK to decomposed tables (populated by migration 006)
  ADD COLUMN IF NOT EXISTS corporation_id     INTEGER REFERENCES corporations(id),
  ADD COLUMN IF NOT EXISTS university_id      INTEGER REFERENCES universities(id),
  ADD COLUMN IF NOT EXISTS gov_agency_id      INTEGER REFERENCES gov_agencies(id),
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

-- ============================================================
-- accelerators: program details + agent metadata
-- Existing columns: id, name, accel_type, city, region, founded, note
-- ============================================================
ALTER TABLE accelerators
  ADD COLUMN IF NOT EXISTS program_type       VARCHAR(30),  -- 'pre_seed', 'seed', 'growth', 'corporate'
  ADD COLUMN IF NOT EXISTS cohort_size        INTEGER,
  ADD COLUMN IF NOT EXISTS cohort_frequency   VARCHAR(20),  -- 'annual', 'biannual', 'rolling'
  ADD COLUMN IF NOT EXISTS stage_focus        TEXT[],
  ADD COLUMN IF NOT EXISTS target_sectors     TEXT[],
  ADD COLUMN IF NOT EXISTS equity_taken       NUMERIC(4,2), -- percentage
  ADD COLUMN IF NOT EXISTS stipend_k          NUMERIC(8,2), -- stipend in thousands USD
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  ADD COLUMN IF NOT EXISTS website            TEXT,
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_accelerators_region_id    ON accelerators(region_id);
CREATE INDEX IF NOT EXISTS idx_accelerators_stage_focus  ON accelerators USING GIN (stage_focus);

-- ============================================================
-- ecosystem_orgs: region FK + agent metadata
-- Existing columns: id, name, entity_type, city, region, note
-- ============================================================
ALTER TABLE ecosystem_orgs
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  ADD COLUMN IF NOT EXISTS website            TEXT,
  ADD COLUMN IF NOT EXISTS member_count       INTEGER,
  -- typed FK to decomposed gov_agencies table
  ADD COLUMN IF NOT EXISTS gov_agency_id      INTEGER REFERENCES gov_agencies(id),
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

-- ============================================================
-- funds: vc_firm linkage + agent metadata
-- Existing columns: id, name, fund_type, allocated_m, deployed_m,
--                   leverage, company_count, thesis
-- ============================================================
ALTER TABLE funds
  ADD COLUMN IF NOT EXISTS vc_firm_id         INTEGER REFERENCES vc_firms(id),
  ADD COLUMN IF NOT EXISTS ssbci_fund_id      INTEGER REFERENCES ssbci_funds(id),
  ADD COLUMN IF NOT EXISTS stage_focus        TEXT[],
  ADD COLUMN IF NOT EXISTS target_sectors     TEXT[],
  ADD COLUMN IF NOT EXISTS vintage_year       INTEGER,
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_funds_vc_firm    ON funds(vc_firm_id);
CREATE INDEX IF NOT EXISTS idx_funds_ssbci      ON funds(ssbci_fund_id);
CREATE INDEX IF NOT EXISTS idx_funds_fund_type  ON funds(fund_type);

-- ============================================================
-- graph_funds: vc_firm linkage + agent metadata
-- Existing columns: id, name, fund_type
-- ============================================================
ALTER TABLE graph_funds
  ADD COLUMN IF NOT EXISTS vc_firm_id         INTEGER REFERENCES vc_firms(id),
  ADD COLUMN IF NOT EXISTS fund_id            VARCHAR(20) REFERENCES funds(id),
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

-- ============================================================
-- graph_edges: weight payload + node type hints + agent metadata
-- Existing columns: id, source_id, target_id, rel, note, event_year
-- The existing indexes on source_id, target_id, rel remain valid.
-- ============================================================
ALTER TABLE graph_edges
  -- typed edge properties (deal_size_m, round_type, ownership_pct, etc.)
  ADD COLUMN IF NOT EXISTS weight             JSONB,
  -- node type hints enable efficient polymorphic lookups without
  -- needing to parse the id prefix at query time
  ADD COLUMN IF NOT EXISTS source_type        VARCHAR(30),
  ADD COLUMN IF NOT EXISTS target_type        VARCHAR(30),
  -- agent provenance
  -- NOTE: source_id is already used for graph node reference (VARCHAR(40))
  -- so we use provenance_source_id for the FK to sources table
  ADD COLUMN IF NOT EXISTS confidence              FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS provenance_source_id    INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id                VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified                BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at            TIMESTAMPTZ;

-- Composite index for polymorphic typed lookups
CREATE INDEX IF NOT EXISTS idx_edges_typed_source
  ON graph_edges(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_edges_typed_target
  ON graph_edges(target_type, target_id);
-- Partial index: unverified agent edges need review
CREATE INDEX IF NOT EXISTS idx_edges_unverified
  ON graph_edges(id) WHERE verified = FALSE;
-- GIN index for querying inside the weight payload
CREATE INDEX IF NOT EXISTS idx_edges_weight
  ON graph_edges USING GIN (weight);

-- ============================================================
-- timeline_events: occurred_at + delta metrics + region FK
-- Existing columns: id, event_date, event_type, company_name, detail, icon
-- ============================================================
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS occurred_at        TIMESTAMPTZ,  -- precise timestamp when known
  ADD COLUMN IF NOT EXISTS delta_jobs         INTEGER,
  ADD COLUMN IF NOT EXISTS delta_capital_m    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS region_id          INTEGER REFERENCES regions(id),
  ADD COLUMN IF NOT EXISTS company_id         INTEGER REFERENCES companies(id),
  -- agent provenance
  ADD COLUMN IF NOT EXISTS confidence         FLOAT CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS source_id          INTEGER REFERENCES sources(id),
  ADD COLUMN IF NOT EXISTS agent_id           VARCHAR(60),
  ADD COLUMN IF NOT EXISTS verified           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS extracted_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_timeline_company ON timeline_events(company_id);
CREATE INDEX IF NOT EXISTS idx_timeline_region  ON timeline_events(region_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type    ON timeline_events(event_type);
