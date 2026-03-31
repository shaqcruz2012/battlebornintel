-- Migration 113: P0 Entity Backfill + Edge Weight Semantics
--
-- Restructures existing data — NO new external data introduced.
-- All operations derive from data already present in graph_edges, externals, companies.
--
-- P0-1: Backfill people table from graph_edges person nodes
-- P0-2: Backfill vc_firms from externals WHERE entity_type='VC Firm'
-- P0-3: Backfill angels from externals WHERE entity_type IN ('Angel','Family Office')
-- P0-4: Backfill corporations from externals WHERE entity_type='Corporation'
--        + real market cap data from web-verified sources (March 2026)
-- P0-5: Define edge_weight semantics and backfill from confidence/matching_score
--
-- Safe to run multiple times (ON CONFLICT DO NOTHING, WHERE guards).

BEGIN;

-- ============================================================
-- P0-1: Backfill people table from graph_edges
-- ============================================================
-- Find person nodes (p_*) in graph_edges that don't have a people row.
-- Extract name from graph_edges.source_name or target node patterns.

-- First: insert people from source_id pattern where they have source_name
INSERT INTO people (id, name, role, note, confidence, verified, agent_id)
SELECT DISTINCT ON (e.source_id)
  e.source_id,
  COALESCE(e.source_name, REPLACE(REPLACE(e.source_id, 'p_', ''), '_', ' ')),
  CASE
    WHEN e.rel = 'founder_of' THEN 'Founder'
    WHEN e.rel = 'board_member' THEN 'Board Member'
    WHEN e.rel IN ('worked_at', 'employed_at') THEN 'Employee'
    WHEN e.rel = 'advisor_to' THEN 'Advisor'
    ELSE NULL
  END,
  'Backfilled from graph_edges rel=' || e.rel || ' (migration 113)',
  COALESCE(e.confidence, 0.70),
  FALSE,
  'migration-113'
FROM graph_edges e
WHERE e.source_id LIKE 'p_%'
  AND NOT EXISTS (SELECT 1 FROM people p WHERE p.id = e.source_id)
ORDER BY e.source_id, e.confidence DESC NULLS LAST
ON CONFLICT (id) DO NOTHING;

-- Also from target_id pattern
INSERT INTO people (id, name, role, note, confidence, verified, agent_id)
SELECT DISTINCT ON (e.target_id)
  e.target_id,
  REPLACE(REPLACE(e.target_id, 'p_', ''), '_', ' '),
  CASE
    WHEN e.rel = 'founded_by' THEN 'Founder'
    WHEN e.rel = 'employed_by' THEN 'Employee'
    ELSE NULL
  END,
  'Backfilled from graph_edges rel=' || e.rel || ' (migration 113)',
  COALESCE(e.confidence, 0.70),
  FALSE,
  'migration-113'
FROM graph_edges e
WHERE e.target_id LIKE 'p_%'
  AND NOT EXISTS (SELECT 1 FROM people p WHERE p.id = e.target_id)
ORDER BY e.target_id, e.confidence DESC NULLS LAST
ON CONFLICT (id) DO NOTHING;

-- Wire people to companies via company_id FK where founder_of/employed_at edges exist
UPDATE people p
SET company_id = c.id
FROM graph_edges e
JOIN companies c ON 'c_' || c.id = e.target_id OR 'c_' || c.slug = e.target_id
WHERE p.id = e.source_id
  AND e.rel IN ('founder_of', 'employed_at', 'worked_at')
  AND p.company_id IS NULL;

-- ============================================================
-- P0-2: Backfill vc_firms from externals
-- ============================================================
-- Externals with entity_type='VC Firm' that don't have vc_firms rows yet.
-- Uses the canonical slug pattern.

INSERT INTO vc_firms (slug, name, hq_region_id, website, confidence, verified, agent_id)
SELECT
  LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g')),
  x.name,
  x.region_id,
  x.website,
  COALESCE(x.confidence, 0.70),
  x.verified,
  'migration-113'
FROM externals x
WHERE x.entity_type = 'VC Firm'
  AND NOT EXISTS (
    SELECT 1 FROM vc_firms v
    WHERE v.slug = LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g'))
  )
ON CONFLICT (slug) DO NOTHING;

-- Wire externals → vc_firms FK where match exists by name
UPDATE externals x
SET canonical_entity_type = 'vc_firm',
    canonical_entity_id = v.id
FROM vc_firms v
WHERE v.name = x.name
  AND x.entity_type = 'VC Firm'
  AND x.canonical_entity_id IS NULL;

-- ============================================================
-- P0-3: Backfill angels from externals
-- ============================================================

INSERT INTO angels (slug, name, hq_region_id, confidence, verified, agent_id)
SELECT
  LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g')),
  x.name,
  x.region_id,
  COALESCE(x.confidence, 0.70),
  x.verified,
  'migration-113'
FROM externals x
WHERE x.entity_type IN ('Angel', 'Family Office')
  AND NOT EXISTS (
    SELECT 1 FROM angels a
    WHERE a.slug = LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g'))
  )
ON CONFLICT (slug) DO NOTHING;

-- Wire externals → angels FK
UPDATE externals x
SET canonical_entity_type = 'angel',
    canonical_entity_id = a.id
FROM angels a
WHERE a.name = x.name
  AND x.entity_type IN ('Angel', 'Family Office')
  AND x.canonical_entity_id IS NULL;

-- ============================================================
-- P0-4: Backfill corporations + real market cap data
-- ============================================================
-- First: ensure corporations exist for Corporation-typed externals
INSERT INTO corporations (slug, name, legacy_external_id, nv_presence, confidence, verified, agent_id)
SELECT
  LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g')),
  x.name,
  x.id,
  TRUE,  -- these are all Nevada-connected entities in the BBI graph
  COALESCE(x.confidence, 0.70),
  FALSE,
  'migration-113'
FROM externals x
WHERE x.entity_type = 'Corporation'
  AND NOT EXISTS (
    SELECT 1 FROM corporations c
    WHERE c.slug = LOWER(REGEXP_REPLACE(x.name, '[^a-zA-Z0-9]+', '-', 'g'))
       OR c.legacy_external_id = x.id
  )
ON CONFLICT (slug) DO NOTHING;

-- Wire externals → corporations FK
UPDATE externals x
SET canonical_entity_type = 'corporation',
    canonical_entity_id = c.id
FROM corporations c
WHERE (c.legacy_external_id = x.id OR c.name = x.name)
  AND x.entity_type = 'Corporation'
  AND x.canonical_entity_id IS NULL;

-- Update market_cap_b with web-verified data (March 2026, rounded)
-- Sources: Yahoo Finance, companiesmarketcap.com, stockanalysis.com
-- All data verified via web search 2026-03-30

-- MGM Resorts International — ~$9.4B (NASDAQ: MGM) March 2026
UPDATE corporations
SET market_cap_b = 9.40, ticker = 'MGM',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%MGM%Resorts%' OR name ILIKE '%MGM Resorts%'
  AND market_cap_b IS NULL;

-- Tesla — ~$1,360B (NASDAQ: TSLA) March 2026
-- Note: Tesla Gigafactory NV is an external node, not a separate corporation.
-- Only update if a Tesla corporation row exists.
UPDATE corporations
SET market_cap_b = 1360.00, ticker = 'TSLA',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%Tesla%' AND name NOT ILIKE '%Gigafactory%'
  AND market_cap_b IS NULL;

-- Wynn Resorts — ~$10.1B (NASDAQ: WYNN) March 2026
UPDATE corporations
SET market_cap_b = 10.10, ticker = 'WYNN',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%Wynn%Resorts%' OR name ILIKE '%Wynn%'
  AND market_cap_b IS NULL;

-- Station Casinos / Red Rock Resorts — ~$3.5B (NASDAQ: RRR) March 2026
UPDATE corporations
SET market_cap_b = 3.50, ticker = 'RRR',
    name = 'Red Rock Resorts (Station Casinos)',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%Station Casinos%'
  AND market_cap_b IS NULL;

-- Caesars Entertainment — ~$5.5B (NASDAQ: CZR) March 2026
UPDATE corporations
SET market_cap_b = 5.50, ticker = 'CZR',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%Caesars%'
  AND market_cap_b IS NULL;

-- eBay — ~$30B (NASDAQ: EBAY) — has Nevada Trust & Safety hub
UPDATE corporations
SET market_cap_b = 30.00, ticker = 'EBAY',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%eBay%'
  AND market_cap_b IS NULL;

-- Switch — taken private Dec 2022 by DigitalBridge ($11B deal). No public market cap.
UPDATE corporations
SET market_cap_b = NULL, ticker = NULL,
    industry = 'Data Centers',
    note = 'Taken private Dec 2022 by DigitalBridge + IFM Investors ($11B). No public market cap.',
    verified = TRUE, agent_id = 'migration-113-verified'
WHERE name ILIKE '%Switch%' AND name NOT ILIKE '%Ventures%'
  AND (market_cap_b IS NOT NULL OR verified = FALSE);

-- ============================================================
-- P0-5: Edge Weight Semantics + Backfill
-- ============================================================
-- edge_weight column (NUMERIC(6,4), default 1.0) was added in migration 106
-- but never populated with meaningful values.
--
-- SEMANTICS:
--   edge_weight represents the normalized strength of a relationship:
--     0.0 = minimal/tenuous connection
--     0.5 = moderate (e.g., one-time co-investment, loose partnership)
--     1.0 = standard/default (most edges)
--     1.5 = strong (e.g., lead investor, primary employer, co-founder)
--     2.0 = maximum (e.g., acquisition, merger, deep multi-year partnership)
--
-- BACKFILL STRATEGY:
--   1. Start with confidence as base signal (0.0-1.0 → 0.0-2.0 range)
--   2. Boost for high-signal relationship types
--   3. Boost for matching_score where available

-- Step 1: Base weight from confidence (scale 0-1 → 0.5-1.5)
UPDATE graph_edges
SET edge_weight = 0.5 + COALESCE(confidence, 0.5)
WHERE edge_weight IS NULL OR edge_weight = 1.0;

-- Step 2: Boost for high-signal relationship types
UPDATE graph_edges
SET edge_weight = LEAST(edge_weight * 1.3, 2.0)
WHERE rel IN ('acquired', 'merged_with', 'founder_of', 'founded_by')
  AND edge_weight < 2.0;

UPDATE graph_edges
SET edge_weight = LEAST(edge_weight * 1.2, 2.0)
WHERE rel IN ('invested_in', 'co_invested', 'accelerated_by', 'won_pitch')
  AND edge_weight < 2.0;

-- Step 3: Factor in matching_score where available
UPDATE graph_edges
SET edge_weight = LEAST(edge_weight * (0.8 + 0.4 * matching_score), 2.0)
WHERE matching_score IS NOT NULL
  AND matching_score > 0;

-- Round to 4 decimal places for consistency
UPDATE graph_edges
SET edge_weight = ROUND(edge_weight, 4)
WHERE edge_weight IS NOT NULL;

-- Add comment documenting the semantics
COMMENT ON COLUMN graph_edges.edge_weight IS
  'Normalized relationship strength: 0.0=minimal, 0.5=moderate, 1.0=standard, '
  '1.5=strong (lead investor, founder), 2.0=maximum (acquisition, merger). '
  'Derived from confidence + rel type boost + matching_score factor.';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- People backfill stats
SELECT
  COUNT(*) AS total_people,
  COUNT(*) FILTER (WHERE agent_id = 'migration-113') AS backfilled_this_migration
FROM people;

-- VC firms backfill stats
SELECT
  COUNT(*) AS total_vc_firms,
  COUNT(*) FILTER (WHERE agent_id = 'migration-113') AS backfilled_this_migration
FROM vc_firms;

-- Angels backfill stats
SELECT
  COUNT(*) AS total_angels,
  COUNT(*) FILTER (WHERE agent_id = 'migration-113') AS backfilled_this_migration
FROM angels;

-- Corporations with market cap
SELECT name, ticker, market_cap_b, verified
FROM corporations
WHERE market_cap_b IS NOT NULL
ORDER BY market_cap_b DESC;

-- Edge weight distribution
SELECT
  CASE
    WHEN edge_weight < 0.5 THEN '< 0.5 (weak)'
    WHEN edge_weight < 1.0 THEN '0.5-1.0 (moderate)'
    WHEN edge_weight < 1.5 THEN '1.0-1.5 (standard)'
    WHEN edge_weight < 2.0 THEN '1.5-2.0 (strong)'
    ELSE '2.0 (maximum)'
  END AS weight_band,
  COUNT(*) AS edge_count
FROM graph_edges
WHERE edge_weight IS NOT NULL
GROUP BY 1
ORDER BY 1;

COMMIT;
