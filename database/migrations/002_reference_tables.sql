-- Migration 002: Reference Tables (regions, sectors, exchanges, sources)
-- Phase 1 — Pure additions. Zero risk to existing queries.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/002_reference_tables.sql

-- ============================================================
-- REGIONS
-- Replaces the free-text region/city columns on companies,
-- accelerators, ecosystem_orgs. The old text columns are NOT
-- removed here — removal happens in a future migration after
-- all FK back-fills are confirmed.
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  level         VARCHAR(20) NOT NULL CHECK (level IN ('state', 'metro', 'county', 'city')),
  iso_code      VARCHAR(10),           -- e.g. 'US-NV'
  fips          VARCHAR(10),           -- U.S. FIPS code
  population    BIGINT,
  gdp_b         NUMERIC(12,2),         -- GDP in billions USD
  parent_id     INTEGER REFERENCES regions(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_regions_level ON regions(level);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_id);

-- Seed Nevada reference data
INSERT INTO regions (name, level, iso_code, fips) VALUES
  ('Nevada',        'state', 'US-NV', '32'),
  ('Las Vegas',     'metro',  NULL,   '32003'),
  ('Reno-Sparks',   'metro',  NULL,   '32031'),
  ('Henderson',     'city',   NULL,   '3231900'),
  ('Carson City',   'city',   NULL,   '3210400')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTORS
-- Formalises the free-text sectors TEXT[] on companies.
-- The original array column stays; a lookup join is added later.
-- ============================================================
CREATE TABLE IF NOT EXISTS sectors (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(80) NOT NULL UNIQUE,
  slug              VARCHAR(80) NOT NULL UNIQUE,   -- matches values in companies.sectors[]
  description       TEXT,
  naics_codes       TEXT[],
  maturity_stage    VARCHAR(30),                  -- 'emerging', 'growth', 'mature'
  strategic_priority INTEGER DEFAULT 50 CHECK (strategic_priority BETWEEN 0 AND 100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sectors_slug ON sectors(slug);

-- ============================================================
-- EXCHANGES
-- Replaces the free-text exchange column on listings.
-- ============================================================
CREATE TABLE IF NOT EXISTS exchanges (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  country     VARCHAR(40) NOT NULL DEFAULT 'US',
  mic_code    VARCHAR(10) UNIQUE,    -- ISO 10383 Market Identifier Code
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed known exchanges referenced by listings
INSERT INTO exchanges (name, country, mic_code) VALUES
  ('NASDAQ', 'US', 'XNAS'),
  ('NYSE',   'US', 'XNYS'),
  ('OTC',    'US', 'OTCM')
ON CONFLICT (mic_code) DO NOTHING;

-- ============================================================
-- SOURCES
-- Tracks provenance for every agent-written record.
-- Referenced by the confidence metadata columns added in 004.
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id            SERIAL PRIMARY KEY,
  url           TEXT,
  source_type   VARCHAR(30) NOT NULL CHECK (source_type IN (
                  'web', 'sec_filing', 'press_release', 'crunchbase',
                  'linkedin', 'pitchbook', 'internal', 'manual', 'agent')),
  publisher     VARCHAR(120),
  published_at  TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_excerpt   TEXT,                  -- relevant snippet the agent parsed
  UNIQUE (url)
);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_published ON sources(published_at DESC);

-- ============================================================
-- MODELS  (for scenario/prediction layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS models (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL UNIQUE,
  objective        TEXT NOT NULL,
  input_variables  JSONB NOT NULL DEFAULT '[]',
  output_variables JSONB NOT NULL DEFAULT '[]',
  version          VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
