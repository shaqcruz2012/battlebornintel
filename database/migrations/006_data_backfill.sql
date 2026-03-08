-- Migration 006: Data Back-fill and FK Linkage
-- Phase 5 — Migrates existing data into new tables and wires FK columns.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING or IF NOT EXISTS).
-- Run AFTER migrations 002-005 are applied.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/006_data_backfill.sql

-- ============================================================
-- 1. Populate sectors table from companies.sectors[] values
-- ============================================================
INSERT INTO sectors (name, slug)
  SELECT DISTINCT s, s
  FROM companies, UNNEST(sectors) AS s
  WHERE s IS NOT NULL AND s <> ''
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Populate regions.id back-reference on companies
--    Maps the free-text companies.region column to regions.id
-- ============================================================
UPDATE companies c
SET region_id = r.id
FROM regions r
WHERE r.name ILIKE
  CASE c.region
    WHEN 'las_vegas'   THEN 'Las Vegas'
    WHEN 'reno'        THEN 'Reno-Sparks'
    WHEN 'henderson'   THEN 'Henderson'
    WHEN 'carson_city' THEN 'Carson City'
    ELSE c.region
  END
  AND c.region_id IS NULL;

-- ============================================================
-- 3. Populate regions.id on accelerators
-- ============================================================
UPDATE accelerators a
SET region_id = r.id
FROM regions r
WHERE r.name ILIKE
  CASE a.region
    WHEN 'las_vegas'   THEN 'Las Vegas'
    WHEN 'reno'        THEN 'Reno-Sparks'
    WHEN 'henderson'   THEN 'Henderson'
    ELSE a.region
  END
  AND a.region_id IS NULL;

-- ============================================================
-- 4. Populate regions.id on ecosystem_orgs
-- ============================================================
UPDATE ecosystem_orgs o
SET region_id = r.id
FROM regions r
WHERE r.name ILIKE
  CASE o.region
    WHEN 'las_vegas'   THEN 'Las Vegas'
    WHEN 'reno'        THEN 'Reno-Sparks'
    WHEN 'henderson'   THEN 'Henderson'
    ELSE o.region
  END
  AND o.region_id IS NULL;

-- ============================================================
-- 5. Populate company_id on timeline_events from company_name
--    Best-effort match — unmatched rows remain with company_id NULL
-- ============================================================
UPDATE timeline_events t
SET company_id = c.id
FROM companies c
WHERE c.name = t.company_name
  AND t.company_id IS NULL;

-- ============================================================
-- 6. Populate occurred_at on timeline_events from event_date
--    Use midnight UTC for all existing rows; agents refine later
-- ============================================================
UPDATE timeline_events
SET occurred_at = event_date::TIMESTAMPTZ
WHERE occurred_at IS NULL;

-- ============================================================
-- 7. Decompose externals into typed tables
--    Only rows whose entity_type clearly maps to a new table.
--    Uses INSERT ... ON CONFLICT to be re-runnable.
-- ============================================================

-- 7a. Corporations
INSERT INTO corporations (slug, name, legacy_external_id, verified)
  SELECT
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
    name,
    id,
    FALSE
  FROM externals
  WHERE entity_type IN ('Corporation')
ON CONFLICT (slug) DO NOTHING;

-- Wire the FK back to externals
UPDATE externals e
SET corporation_id = c.id
FROM corporations c
WHERE c.legacy_external_id = e.id
  AND e.corporation_id IS NULL;

-- 7b. Universities
INSERT INTO universities (slug, name, legacy_external_id, verified)
  SELECT
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
    name,
    id,
    FALSE
  FROM externals
  WHERE entity_type IN ('University')
ON CONFLICT (slug) DO NOTHING;

UPDATE externals e
SET university_id = u.id
FROM universities u
WHERE u.legacy_external_id = e.id
  AND e.university_id IS NULL;

-- 7c. Government agencies
INSERT INTO gov_agencies (slug, name, jurisdiction_level, legacy_external_id, verified)
  SELECT
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
    name,
    'state',   -- conservative default; agents will refine
    id,
    FALSE
  FROM externals
  WHERE entity_type IN ('Government')
ON CONFLICT (slug) DO NOTHING;

UPDATE externals e
SET gov_agency_id = g.id
FROM gov_agencies g
WHERE g.legacy_external_id = e.id
  AND e.gov_agency_id IS NULL;

-- 7d. Government agencies from ecosystem_orgs
INSERT INTO gov_agencies (slug, name, jurisdiction_level, legacy_eco_id, verified)
  SELECT
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
    name,
    'state',
    id,
    FALSE
  FROM ecosystem_orgs
  WHERE entity_type IN ('Government')
ON CONFLICT (slug) DO NOTHING;

UPDATE ecosystem_orgs o
SET gov_agency_id = g.id
FROM gov_agencies g
WHERE g.legacy_eco_id = o.id
  AND o.gov_agency_id IS NULL;

-- ============================================================
-- 8. Promote SSBCI fund rows into ssbci_funds table
-- ============================================================
INSERT INTO ssbci_funds (slug, name, allocated_m, deployed_m, leverage_ratio, legacy_fund_id, verified)
  SELECT
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
    name,
    COALESCE(allocated_m, 0),
    deployed_m,
    leverage,
    id,
    FALSE
  FROM funds
  WHERE fund_type = 'SSBCI'
ON CONFLICT (slug) DO NOTHING;

-- Wire FK on funds table
UPDATE funds f
SET ssbci_fund_id = s.id
FROM ssbci_funds s
WHERE s.legacy_fund_id = f.id
  AND f.ssbci_fund_id IS NULL;

-- ============================================================
-- 9. Set source_type on graph_edges based on id prefix patterns
--    Infers node type so future queries avoid string parsing.
-- ============================================================
UPDATE graph_edges
SET source_type =
  CASE
    WHEN source_id LIKE 'c_%'   THEN 'company'
    WHEN source_id LIKE 'f_%'   THEN 'fund'
    WHEN source_id LIKE 'p_%'   THEN 'person'
    WHEN source_id LIKE 'x_%'   THEN 'external'
    WHEN source_id LIKE 'a_%'   THEN 'accelerator'
    WHEN source_id LIKE 'e_%'   THEN 'ecosystem'
    WHEN source_id LIKE 's_%'   THEN 'sector'
    WHEN source_id LIKE 'r_%'   THEN 'region'
    ELSE 'unknown'
  END
WHERE source_type IS NULL;

UPDATE graph_edges
SET target_type =
  CASE
    WHEN target_id LIKE 'c_%'   THEN 'company'
    WHEN target_id LIKE 'f_%'   THEN 'fund'
    WHEN target_id LIKE 'p_%'   THEN 'person'
    WHEN target_id LIKE 'x_%'   THEN 'external'
    WHEN target_id LIKE 'a_%'   THEN 'accelerator'
    WHEN target_id LIKE 'e_%'   THEN 'ecosystem'
    WHEN target_id LIKE 's_%'   THEN 'sector'
    WHEN target_id LIKE 'r_%'   THEN 'region'
    ELSE 'unknown'
  END
WHERE target_type IS NULL;
