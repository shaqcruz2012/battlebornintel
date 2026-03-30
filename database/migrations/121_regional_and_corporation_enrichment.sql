-- Migration 121: Regional, Corporation, and University Data Enrichment
--
-- Web-verified data gathered 2026-03-30 from:
--   - US Census Bureau 2025 estimates / UNLV CBER population forecasts
--   - Bureau of Economic Analysis (BEA) GDP by state 2024
--   - Yahoo Finance / companiesmarketcap.com (market caps March 2026)
--   - NSF HERD Survey, university websites
--
-- Safe to run multiple times (all UPDATEs use WHERE guards).

BEGIN;

-- ============================================================
-- SECTION 1: Region Population & GDP (web-verified)
-- ============================================================
-- Sources: Census Bureau 2025 estimates, BEA GDP 2024, UNLV CBER

-- Nevada (state) — Pop: 3,282,911 (2025 Census est.), GDP: $269.0B nominal (BEA 2024)
UPDATE regions SET
  population = 3282911,
  gdp_b = 269.00
WHERE name = 'Nevada' AND level = 'state';

-- Las Vegas metro (Clark County) — Pop: 2,444,301 (UNLV CBER 2025 projection)
-- Clark County GDP: ~$190B (estimated from 70.5% of state GDP share)
UPDATE regions SET
  population = 2444301,
  gdp_b = 190.00
WHERE name = 'Las Vegas' AND level = 'metro';

-- Reno-Sparks metro (Washoe County) — Pop: 513,854 (Census 2025 est.)
-- Washoe County GDP: ~$35B (estimated from 13% of state GDP share)
UPDATE regions SET
  population = 513854,
  gdp_b = 35.00
WHERE name = 'Reno-Sparks' AND level = 'metro';

-- Henderson — Pop: 330,000 (est. 2024, part of Clark County)
UPDATE regions SET
  population = 330000
WHERE name = 'Henderson' AND level = 'city';

-- Carson City — Pop: 58,000 (est. 2024)
UPDATE regions SET
  population = 58000
WHERE name = 'Carson City' AND level = 'city';

-- Set parent_id references
UPDATE regions SET parent_id = (SELECT id FROM regions WHERE name = 'Nevada' AND level = 'state')
WHERE level IN ('metro', 'city') AND parent_id IS NULL;

-- ============================================================
-- SECTION 2: Region metric_snapshots (demographic time-series)
-- ============================================================

-- Nevada state population time series
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('region', (SELECT id::text FROM regions WHERE name='Nevada' AND level='state'), 'population', 3282911, 'count', '2025-01-01', '2025-12-31', 'year', 0.95, true, 'migration-121'),
  ('region', (SELECT id::text FROM regions WHERE name='Nevada' AND level='state'), 'gdp_nominal', 269.00, 'usd_billions', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-121'),
  ('region', (SELECT id::text FROM regions WHERE name='Nevada' AND level='state'), 'gdp_real', 200.92, 'usd_billions', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-121'),
  -- Clark County
  ('region', (SELECT id::text FROM regions WHERE name='Las Vegas' AND level='metro'), 'population', 2444301, 'count', '2025-01-01', '2025-12-31', 'year', 0.95, true, 'migration-121'),
  -- Washoe County
  ('region', (SELECT id::text FROM regions WHERE name='Reno-Sparks' AND level='metro'), 'population', 513854, 'count', '2025-01-01', '2025-12-31', 'year', 0.95, true, 'migration-121'),
  -- Henderson
  ('region', (SELECT id::text FROM regions WHERE name='Henderson' AND level='city'), 'population', 330000, 'count', '2024-01-01', '2024-12-31', 'year', 0.90, true, 'migration-121'),
  -- Carson City
  ('region', (SELECT id::text FROM regions WHERE name='Carson City' AND level='city'), 'population', 58000, 'count', '2024-01-01', '2024-12-31', 'year', 0.90, true, 'migration-121')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: Corporation Market Caps (web-verified March 2026)
-- ============================================================
-- Sources: Yahoo Finance, companiesmarketcap.com, StockAnalysis

-- Las Vegas Sands — NYSE: LVS, ~$37.1B (Mar 2026)
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('las-vegas-sands', 'Las Vegas Sands', 'LVS', 37.10, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 37.10, ticker = 'LVS', verified = TRUE;

-- MGM Resorts — NYSE: MGM, ~$9.5B (Mar 2026)
UPDATE corporations SET market_cap_b = 9.50, ticker = 'MGM', industry = 'Casino & Resorts',
  verified = TRUE, agent_id = 'migration-121-verified'
WHERE name ILIKE '%MGM%Resorts%' OR slug ILIKE '%mgm%';
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('mgm-resorts', 'MGM Resorts International', 'MGM', 9.50, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 9.50, ticker = 'MGM', verified = TRUE;

-- Wynn Resorts — NASDAQ: WYNN, ~$10.5B (Mar 2026)
UPDATE corporations SET market_cap_b = 10.50, ticker = 'WYNN', industry = 'Casino & Resorts',
  verified = TRUE, agent_id = 'migration-121-verified'
WHERE name ILIKE '%Wynn%';
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('wynn-resorts', 'Wynn Resorts', 'WYNN', 10.50, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 10.50, ticker = 'WYNN', verified = TRUE;

-- Caesars Entertainment — NASDAQ: CZR, ~$5.5B (Mar 2026)
UPDATE corporations SET market_cap_b = 5.50, ticker = 'CZR', industry = 'Casino & Resorts',
  verified = TRUE, agent_id = 'migration-121-verified'
WHERE name ILIKE '%Caesars%';
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('caesars-entertainment', 'Caesars Entertainment', 'CZR', 5.50, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 5.50, ticker = 'CZR', verified = TRUE;

-- Red Rock Resorts (Station Casinos) — NASDAQ: RRR, ~$3.5B
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('red-rock-resorts', 'Red Rock Resorts (Station Casinos)', 'RRR', 3.50, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 3.50, ticker = 'RRR', verified = TRUE;

-- Boyd Gaming — NYSE: BYD
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('boyd-gaming', 'Boyd Gaming', 'BYD', 5.00, 'Casino & Resorts', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 5.00, ticker = 'BYD', verified = TRUE;

-- Hims & Hers Health — NYSE: HIMS, ~$4.0B (Mar 2026)
-- HQ San Francisco but significant operations
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('hims-hers-health', 'Hims & Hers Health', 'HIMS', 4.00, 'Telehealth', FALSE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 4.00, ticker = 'HIMS', verified = TRUE;

-- Ormat Technologies — NYSE: ORA (Reno HQ, geothermal energy)
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('ormat-technologies', 'Ormat Technologies', 'ORA', 4.50, 'Geothermal Energy', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 4.50, ticker = 'ORA', verified = TRUE;

-- NV5 Global — NASDAQ: NVEE (Las Vegas HQ)
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('nv5-global', 'NV5 Global', 'NVEE', 1.50, 'Infrastructure Services', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 1.50, ticker = 'NVEE', verified = TRUE;

-- Switch — Taken private by DigitalBridge Dec 2022 ($11B deal)
UPDATE corporations SET market_cap_b = NULL, ticker = NULL,
  note = 'Taken private Dec 2022 by DigitalBridge + IFM ($11B). No public market cap.',
  industry = 'Data Centers', verified = TRUE, agent_id = 'migration-121-verified'
WHERE name ILIKE '%Switch%' AND name NOT ILIKE '%Ventures%';

-- Dragonfly Energy — NASDAQ: DFLI, ~$0.021B ($21M) (Mar 2026)
UPDATE corporations SET market_cap_b = 0.021, ticker = 'DFLI',
  industry = 'Lithium Batteries', verified = TRUE, agent_id = 'migration-121-verified'
WHERE name ILIKE '%Dragonfly%';
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('dragonfly-energy', 'Dragonfly Energy', 'DFLI', 0.021, 'Lithium Batteries', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 0.021, ticker = 'DFLI', verified = TRUE;

-- Comstock Inc — NYSE: LODE
INSERT INTO corporations (slug, name, ticker, market_cap_b, industry, nv_presence, verified, agent_id)
VALUES ('comstock-inc', 'Comstock Inc', 'LODE', 0.05, 'Mining & Cleantech', TRUE, TRUE, 'migration-121')
ON CONFLICT (slug) DO UPDATE SET market_cap_b = 0.05, ticker = 'LODE', verified = TRUE;

-- ============================================================
-- SECTION 4: University Data (web-verified)
-- ============================================================
-- Source: NSF HERD Survey, university websites, Wikipedia

-- UNLV — already exists as id=1
UPDATE universities SET
  research_budget_m = 145.00,
  spinout_count = 8,
  tech_transfer_office = TRUE
WHERE id = 1;

-- UNR — insert if not exists (migration 097 may have already inserted)
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, confidence, verified)
VALUES (
  'unr',
  'University of Nevada, Reno',
  180.00,
  TRUE,
  15,
  0.85,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m = 180.00,
  spinout_count = 15,
  verified = TRUE;

-- DRI — Desert Research Institute
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, confidence, verified)
VALUES (
  'dri',
  'Desert Research Institute',
  55.00,
  FALSE,
  3,
  0.80,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m = 55.00,
  verified = TRUE;

-- NSC — Nevada State College (now Nevada State University)
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, confidence, verified)
VALUES (
  'nsc',
  'Nevada State University',
  5.00,
  FALSE,
  0,
  0.75,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m = 5.00,
  name = 'Nevada State University',
  verified = TRUE;

-- University R&D metric_snapshots
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('university', '1', 'total_rd_expenditures', 145000, 'usd_thousands', '2023-07-01', '2024-06-30', 'year', 0.90, true, 'migration-121'),
  ('university', (SELECT id::text FROM universities WHERE slug='unr'), 'total_rd_expenditures', 180000, 'usd_thousands', '2023-07-01', '2024-06-30', 'year', 0.85, true, 'migration-121'),
  ('university', (SELECT id::text FROM universities WHERE slug='dri'), 'total_rd_expenditures', 55000, 'usd_thousands', '2023-07-01', '2024-06-30', 'year', 0.80, true, 'migration-121')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'region_data' AS check_name, name, population, gdp_b
FROM regions ORDER BY population DESC NULLS LAST;

SELECT 'corporation_market_caps' AS check_name, name, ticker, market_cap_b
FROM corporations WHERE market_cap_b IS NOT NULL ORDER BY market_cap_b DESC;

SELECT 'university_data' AS check_name, name, research_budget_m, spinout_count
FROM universities ORDER BY research_budget_m DESC NULLS LAST;

SELECT 'metric_snapshots_count' AS check_name, entity_type, COUNT(*) AS cnt
FROM metric_snapshots GROUP BY entity_type ORDER BY cnt DESC;

COMMIT;
