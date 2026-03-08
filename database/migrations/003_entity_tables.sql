-- Migration 003: New Entity Tables (vc_firms, angels, ssbci_funds, corporations,
--               universities, gov_agencies, programs)
-- Phase 2 — Additive only. No existing tables or columns touched.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/003_entity_tables.sql

-- ============================================================
-- VC FIRMS
-- Distinct from the existing graph_funds / funds tables, which
-- track deployed capital. vc_firms tracks the firm identity.
-- A future migration will add vc_firm_id FK to funds/graph_funds.
-- ============================================================
CREATE TABLE IF NOT EXISTS vc_firms (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(60) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  aum_m         NUMERIC(12,2),          -- assets under management, millions USD
  fund_size_m   NUMERIC(12,2),          -- latest fund size
  fund_count    INTEGER DEFAULT 1,
  thesis        TEXT,
  stage_focus   TEXT[],                 -- e.g. '{seed, series_a}'
  hq_region_id  INTEGER REFERENCES regions(id),
  website       TEXT,
  -- agent metadata (populated when source is an agent; NULL for manual records)
  confidence    FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id     INTEGER REFERENCES sources(id),
  agent_id      VARCHAR(60),
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_vc_firms_hq_region ON vc_firms(hq_region_id);
CREATE INDEX IF NOT EXISTS idx_vc_firms_stage_focus ON vc_firms USING GIN (stage_focus);

-- ============================================================
-- ANGELS
-- ============================================================
CREATE TABLE IF NOT EXISTS angels (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(60) UNIQUE NOT NULL,
  name            VARCHAR(120) NOT NULL,
  check_size_min  NUMERIC(10,2),
  check_size_max  NUMERIC(10,2),
  sectors         TEXT[],
  hq_region_id    INTEGER REFERENCES regions(id),
  linkedin_url    TEXT,
  -- agent metadata
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id       INTEGER REFERENCES sources(id),
  agent_id        VARCHAR(60),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_angels_hq_region ON angels(hq_region_id);
CREATE INDEX IF NOT EXISTS idx_angels_sectors ON angels USING GIN (sectors);

-- ============================================================
-- SSBCI FUNDS
-- Structured version of the existing funds rows where
-- fund_type = 'SSBCI'. Both tables coexist; a view bridges them.
-- ============================================================
CREATE TABLE IF NOT EXISTS ssbci_funds (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(60) UNIQUE NOT NULL,
  name            VARCHAR(120) NOT NULL,
  allocated_m     NUMERIC(12,2) NOT NULL,
  deployed_m      NUMERIC(12,2) NOT NULL DEFAULT 0,
  leverage_ratio  NUMERIC(5,2),
  program_phase   VARCHAR(20) CHECK (program_phase IN ('1', '2', '3', 'planning', 'active', 'closed')),
  target_regions  TEXT[],              -- region slugs or 'statewide'
  target_sectors  TEXT[],
  -- link back to the legacy funds row for backward compat
  legacy_fund_id  VARCHAR(20) REFERENCES funds(id),
  -- agent metadata
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id       INTEGER REFERENCES sources(id),
  agent_id        VARCHAR(60),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ssbci_phase ON ssbci_funds(program_phase);
CREATE INDEX IF NOT EXISTS idx_ssbci_regions ON ssbci_funds USING GIN (target_regions);

-- ============================================================
-- CORPORATIONS
-- Decomposed from externals where entity_type = 'corporation'
-- ============================================================
CREATE TABLE IF NOT EXISTS corporations (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(80) UNIQUE NOT NULL,
  name            VARCHAR(150) NOT NULL,
  industry        VARCHAR(80),
  market_cap_b    NUMERIC(14,2),
  nv_presence     BOOLEAN NOT NULL DEFAULT FALSE,
  innovation_units TEXT[],            -- names of R&D labs, venture arms, etc.
  hq_region_id    INTEGER REFERENCES regions(id),
  ticker          VARCHAR(10),
  exchange_id     INTEGER REFERENCES exchanges(id),
  -- link to legacy externals row
  legacy_external_id VARCHAR(40) REFERENCES externals(id),
  -- agent metadata
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id       INTEGER REFERENCES sources(id),
  agent_id        VARCHAR(60),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_corporations_hq ON corporations(hq_region_id);
CREATE INDEX IF NOT EXISTS idx_corporations_nv ON corporations(nv_presence) WHERE nv_presence = TRUE;

-- ============================================================
-- UNIVERSITIES
-- Decomposed from externals where entity_type = 'university'
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id                    SERIAL PRIMARY KEY,
  slug                  VARCHAR(80) UNIQUE NOT NULL,
  name                  VARCHAR(150) NOT NULL,
  research_budget_m     NUMERIC(12,2),
  tech_transfer_office  BOOLEAN NOT NULL DEFAULT FALSE,
  spinout_count         INTEGER DEFAULT 0,
  region_id             INTEGER REFERENCES regions(id),
  -- link to legacy externals row
  legacy_external_id    VARCHAR(40) REFERENCES externals(id),
  -- agent metadata
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id             INTEGER REFERENCES sources(id),
  agent_id              VARCHAR(60),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_universities_region ON universities(region_id);

-- ============================================================
-- GOVERNMENT AGENCIES
-- Decomposed from externals where entity_type = 'gov_agency'
-- and ecosystem_orgs where entity_type indicates government
-- ============================================================
CREATE TABLE IF NOT EXISTS gov_agencies (
  id                    SERIAL PRIMARY KEY,
  slug                  VARCHAR(80) UNIQUE NOT NULL,
  name                  VARCHAR(150) NOT NULL,
  jurisdiction_level    VARCHAR(20) NOT NULL CHECK (jurisdiction_level IN ('federal', 'state', 'county', 'city')),
  jurisdiction_region_id INTEGER REFERENCES regions(id),
  programs_count        INTEGER DEFAULT 0,
  -- link to legacy externals or ecosystem_orgs row
  legacy_external_id    VARCHAR(40) REFERENCES externals(id),
  legacy_eco_id         VARCHAR(30) REFERENCES ecosystem_orgs(id),
  -- agent metadata
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id             INTEGER REFERENCES sources(id),
  agent_id              VARCHAR(60),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_gov_agencies_level ON gov_agencies(jurisdiction_level);
CREATE INDEX IF NOT EXISTS idx_gov_agencies_region ON gov_agencies(jurisdiction_region_id);

-- ============================================================
-- PROGRAMS
-- Grants, accelerator cohorts, loan programs, etc.
-- Uses owner_entity_type + owner_entity_id for polymorphic FK
-- rather than a hard FK to avoid coupling to a single parent.
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(80) UNIQUE NOT NULL,
  name              VARCHAR(150) NOT NULL,
  program_type      VARCHAR(40) NOT NULL CHECK (program_type IN (
                      'grant', 'loan', 'equity', 'accelerator_cohort',
                      'incubator', 'mentorship', 'procurement', 'other')),
  -- polymorphic owner (gov_agency, vc_firm, university, ssbci_fund, etc.)
  owner_entity_type VARCHAR(40),
  owner_entity_id   INTEGER,
  start_date        DATE,
  end_date          DATE,
  budget_m          NUMERIC(12,2),
  target_sectors    TEXT[],
  target_stages     TEXT[],
  target_regions    TEXT[],
  description       TEXT,
  -- agent metadata
  confidence        FLOAT CHECK (confidence BETWEEN 0 AND 1),
  source_id         INTEGER REFERENCES sources(id),
  agent_id          VARCHAR(60),
  verified          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_programs_type ON programs(program_type);
CREATE INDEX IF NOT EXISTS idx_programs_owner ON programs(owner_entity_type, owner_entity_id);
CREATE INDEX IF NOT EXISTS idx_programs_dates ON programs(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_programs_sectors ON programs USING GIN (target_sectors);
CREATE INDEX IF NOT EXISTS idx_programs_stages ON programs USING GIN (target_stages);
