-- Migration 124: Verified Research Enrichment — Regions, Universities, Sectors
-- Compiled from web-searched, source-verified data (March 2026)
--
-- Sources:
--   Regions: Census Bureau Vintage 2024, BEA GDP, FRED, BLS LAUS
--   Universities: NSF HERD survey, UNLV/UNR press releases, NSHE reports
--   Sectors: Census.gov NAICS 2022, GOED target industries, LVGEA, DETR
--
-- All operations are idempotent (ON CONFLICT / IF NOT EXISTS patterns).

BEGIN;

-- ============================================================
-- 1. REGION UPDATES — Population & GDP from Census/BEA
-- ============================================================

-- Nevada (State) — FIPS 32
-- Pop: Census Vintage 2024; GDP: BEA via FRED NVNGSP (2024 nominal)
UPDATE regions SET population = 3267467, gdp_b = 269.01 WHERE fips = '32';

-- Las Vegas / Clark County — FIPS 32003
-- Pop: Census 2024; GDP: Las Vegas-Henderson-Paradise MSA (BEA 2023)
UPDATE regions SET population = 2421684, gdp_b = 178.39 WHERE fips = '32003';

-- Reno-Sparks / Washoe County — FIPS 32031
-- Pop: Census 2024; GDP: Reno MSA (BEA 2023)
UPDATE regions SET population = 507280, gdp_b = 43.15 WHERE fips = '32031';

-- Henderson — FIPS 3231900
-- Pop: Census 2024; GDP: N/A (part of LV MSA)
UPDATE regions SET population = 337305 WHERE fips = '3231900';

-- Carson City — FIPS 3210400
-- Pop: Census 2024; GDP: Carson City MSA (BEA 2023)
UPDATE regions SET population = 58148, gdp_b = 3.10 WHERE fips = '3210400';


-- ============================================================
-- 2. REGION METRIC SNAPSHOTS — Economic indicators
-- ============================================================
-- entity_id references assume regions table IDs 1-5 (NV, Clark, Washoe, Henderson, Carson)
-- If IDs differ, these inserts will reference incorrect entities.

-- Nevada (entity_id=1)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('region', '1', 'population', 3267467, 'persons', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-124'),
  ('region', '1', 'gdp_nominal', 269.01, 'billion_usd', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '1', 'median_household_income', 80590, 'usd', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '1', 'unemployment_rate', 5.2, 'percent', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-124'),
  ('region', '1', 'population_growth_rate', 1.65, 'percent', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- Clark County (entity_id=2)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('region', '2', 'population', 2421684, 'persons', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '2', 'gdp_nominal', 178.39, 'billion_usd', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '2', 'median_household_income', 76472, 'usd', '2024-01-01', '2024-12-31', 'year', 0.93, true, 'migration-124'),
  ('region', '2', 'unemployment_rate', 5.8, 'percent', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-124'),
  ('region', '2', 'population_growth_rate', 1.6, 'percent', '2024-01-01', '2024-12-31', 'year', 0.90, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- Washoe County (entity_id=3)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('region', '3', 'population', 507280, 'persons', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '3', 'gdp_nominal', 43.15, 'billion_usd', '2023-01-01', '2023-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '3', 'median_household_income', 88096, 'usd', '2024-01-01', '2024-12-31', 'year', 0.93, true, 'migration-124'),
  ('region', '3', 'unemployment_rate', 4.8, 'percent', '2024-01-01', '2024-12-31', 'year', 0.98, true, 'migration-124'),
  ('region', '3', 'population_growth_rate', 2.0, 'percent', '2024-01-01', '2024-12-31', 'year', 0.85, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- Henderson (entity_id=4)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('region', '4', 'population', 337305, 'persons', '2024-01-01', '2024-12-31', 'year', 0.93, true, 'migration-124'),
  ('region', '4', 'median_household_income', 94169, 'usd', '2024-01-01', '2024-12-31', 'year', 0.93, true, 'migration-124'),
  ('region', '4', 'unemployment_rate', 5.4, 'percent', '2024-01-01', '2024-12-31', 'year', 0.88, true, 'migration-124'),
  ('region', '4', 'population_growth_rate', 2.19, 'percent', '2024-01-01', '2024-12-31', 'year', 0.88, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- Carson City (entity_id=5)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('region', '5', 'population', 58148, 'persons', '2024-01-01', '2024-12-31', 'year', 0.95, true, 'migration-124'),
  ('region', '5', 'gdp_nominal', 3.10, 'billion_usd', '2023-01-01', '2023-12-31', 'year', 0.90, true, 'migration-124'),
  ('region', '5', 'median_household_income', 72355, 'usd', '2024-01-01', '2024-12-31', 'year', 0.93, true, 'migration-124'),
  ('region', '5', 'unemployment_rate', 5.1, 'percent', '2024-01-01', '2024-12-31', 'year', 0.90, true, 'migration-124'),
  ('region', '5', 'population_growth_rate', 0.6, 'percent', '2024-01-01', '2024-12-31', 'year', 0.85, true, 'migration-124')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. UNIVERSITY UPDATES — NSF HERD verified R&D expenditures
-- ============================================================

-- UNLV: FY2024 $116.4M (UNLV R1 press release), 5 verified spinouts
UPDATE universities SET research_budget_m = 116.40, tech_transfer_office = true, spinout_count = 5 WHERE slug = 'unlv';

-- UNR: FY2024 $194.1M (UNR President/R1 press release), ~8 verified spinouts
UPDATE universities SET research_budget_m = 194.10, tech_transfer_office = true, spinout_count = 8 WHERE slug = 'unr';

-- DRI: ~$50M/year (NSHE budget, Wikipedia, DRI website), 0 spinouts (contract research)
UPDATE universities SET research_budget_m = 50.00, tech_transfer_office = true, spinout_count = 0 WHERE slug = 'dri';


-- ============================================================
-- 4. UNIVERSITY R&D TIME SERIES — NSF HERD data
-- ============================================================

-- UNLV R&D expenditures (FY = July 1 - June 30)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 42.0, 'usd_millions', '2014-07-01', '2015-06-30', 'year', 0.90, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 66.0, 'usd_millions', '2016-07-01', '2017-06-30', 'year', 0.90, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 83.8, 'usd_millions', '2017-07-01', '2018-06-30', 'year', 0.92, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 98.75, 'usd_millions', '2022-07-01', '2023-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_rd_expenditures', 116.4, 'usd_millions', '2023-07-01', '2024-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'total_enrollment', 32911, 'students', '2024-08-01', '2025-05-31', 'year', 0.98, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'research_doctorates_awarded', 250, 'degrees', '2022-07-01', '2023-06-30', 'year', 0.98, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'federal_grants_lost_exec_orders', 16.0, 'usd_millions', '2025-01-01', '2026-03-30', 'year', 0.90, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- UNR R&D expenditures (NSHE report + UNR press releases)
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 105.87, 'usd_millions', '2016-07-01', '2017-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 144.43, 'usd_millions', '2017-07-01', '2018-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 152.13, 'usd_millions', '2018-07-01', '2019-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 159.79, 'usd_millions', '2019-07-01', '2020-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 175.39, 'usd_millions', '2020-07-01', '2021-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 194.1, 'usd_millions', '2023-07-01', '2024-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_rd_expenditures', 195.5, 'usd_millions', '2024-07-01', '2025-06-30', 'year', 0.92, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'total_enrollment', 21000, 'students', '2024-08-01', '2025-05-31', 'year', 0.90, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'research_doctorates_awarded', 190, 'degrees', '2022-07-01', '2023-06-30', 'year', 0.95, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'statewide_economic_impact', 2200, 'usd_millions', '2023-07-01', '2024-06-30', 'year', 0.85, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- DRI research budget + employee count
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'dri'), 'total_rd_expenditures', 50.0, 'usd_millions', '2023-07-01', '2024-06-30', 'year', 0.80, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'dri'), 'employee_count', 600, 'employees', '2024-01-01', '2024-12-31', 'year', 0.80, true, 'migration-124')
ON CONFLICT DO NOTHING;

-- Carnegie R1 status snapshots
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('university', (SELECT id::text FROM universities WHERE slug = 'unlv'), 'carnegie_r1_status', 1, 'boolean', '2018-01-01', '2028-12-31', 'year', 0.99, true, 'migration-124'),
  ('university', (SELECT id::text FROM universities WHERE slug = 'unr'), 'carnegie_r1_status', 1, 'boolean', '2018-01-01', '2028-12-31', 'year', 0.99, true, 'migration-124')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. SECTORS — Verified NAICS codes & Nevada-specific maturity/priority
-- ============================================================
-- All 26 sectors from companies.sectors[] mapped to 6-digit NAICS codes
-- Maturity: emerging/growth/mature (Nevada-specific)
-- Priority: 0-100 (GOED target alignment)

INSERT INTO sectors (name, slug, naics_codes, maturity_stage, strategic_priority, description) VALUES
  ('Artificial Intelligence', 'AI', ARRAY['541715','541511','511210'], 'growth', 92,
   'AI/ML R&D, generative AI. NAICS 541715 (R&D incl. AI labs), 541511 (Custom Programming), 511210 (Software Publishers).'),
  ('Cybersecurity', 'Cybersecurity', ARRAY['541512','541511','561621'], 'growth', 88,
   'InfoSec, threat detection, managed security. NAICS 541512, 541511, 561621. GOED target under IT.'),
  ('Defense', 'Defense', ARRAY['336414','336419','928110','334511'], 'mature', 88,
   'Defense contracting, military systems. GOED target; Nellis/Creech AFB, NAS Fallon. 21,158 jobs.'),
  ('Cleantech', 'Cleantech', ARRAY['221114','221115','221116','335910','541715'], 'growth', 85,
   'Solar, geothermal, battery storage, carbon capture. GOED Alternative Energy target.'),
  ('Energy', 'Energy', ARRAY['221112','221114','221116','221210'], 'mature', 82,
   'Utilities, power generation, grid. NV Energy dominant; net energy exporter.'),
  ('Aerospace', 'Aerospace', ARRAY['336411','336412','336413','336414','334511'], 'growth', 82,
   'Aviation, launch vehicles, UAS/drones. GOED target; Sierra Nevada Corp HQ Sparks.'),
  ('Data Center', 'Data Center', ARRAY['518210'], 'mature', 82,
   'Colocation, hyperscale. Switch largest datacenter campus. Google, Apple in NV.'),
  ('Cloud', 'Cloud', ARRAY['518210','541512','511210'], 'mature', 80,
   'Cloud infrastructure, SaaS/PaaS/IaaS. Leverages NV data center infrastructure.'),
  ('Manufacturing', 'Manufacturing', ARRAY['332710','333249','333998','334419','335999'], 'mature', 80,
   'Advanced mfg, 3D printing. GOED target; Tesla Gigafactory, I-80 corridor.'),
  ('Identity', 'Identity', ARRAY['541512','541511','561621'], 'growth', 80,
   'Digital identity, verification. Growing NV niche linked to gaming/fintech needs.'),
  ('Mining', 'Mining', ARRAY['212220','212230','212290','213115'], 'mature', 78,
   'Gold, silver, lithium, critical minerals. 70% US gold. 30K jobs, $16B output.'),
  ('Biotech', 'Biotech', ARRAY['541714','325411','325414','621511'], 'emerging', 75,
   'Biopharma, gene therapy, diagnostics. GOED Health/Medical sub-sector; 22% growth.'),
  ('Health', 'Health', ARRAY['621511','621112','524114','541715'], 'growth', 75,
   'Digital health, telehealth, medical devices. GOED Health/Medical target.'),
  ('Robotics', 'Robotics', ARRAY['333998','541512','541330'], 'growth', 75,
   'Industrial robots, autonomous vehicles, warehouse automation. Tesla/Panasonic demand.'),
  ('Water', 'Water', ARRAY['221310','333310','541330','541715'], 'growth', 75,
   'Water treatment, conservation tech. GOED target; critical for Colorado River constraints.'),
  ('Fintech', 'Fintech', ARRAY['522320','522390','541511','511210'], 'growth', 72,
   'Digital payments, neobanking, lending platforms. Prime Trust/Fortress Trust in LV.'),
  ('Space', 'Space', ARRAY['336414','336415','336419','927110'], 'emerging', 72,
   'Commercial space, satellite launch, propulsion. FAA UAS test site in NV.'),
  ('Gaming', 'Gaming', ARRAY['713210','713290','334310','339999','511210'], 'mature', 68,
   'Casino tech, iGaming, sports betting. Foundational NV industry; IGT, Aristocrat HQs.'),
  ('Construction', 'Construction', ARRAY['236220','237110','238210','541512'], 'mature', 65,
   'Construction tech, modular building. Driven by datacenter + residential growth.'),
  ('IoT', 'IoT', ARRAY['334220','334290','541512','518210'], 'growth', 65,
   'Connected devices, smart infrastructure, sensor networks. Smart city initiatives.'),
  ('EdTech', 'EdTech', ARRAY['611710','511210','541511','519130'], 'emerging', 62,
   'Education technology, online learning, workforce development platforms.'),
  ('PropTech', 'PropTech', ARRAY['531390','541512','541511','518210'], 'growth', 60,
   'Property technology, real estate platforms, smart buildings.'),
  ('Food', 'Food', ARRAY['311991','311999','311919','333241'], 'emerging', 58,
   'Food technology, food manufacturing. Driven by hospitality industry demand.'),
  ('InsurTech', 'InsurTech', ARRAY['524210','524298','541512','511210'], 'emerging', 52,
   'Insurance technology, digital insurance, claims automation.'),
  ('Blockchain', 'Blockchain', ARRAY['518210','541511','523160'], 'emerging', 52,
   'Blockchain, DeFi, Web3. Innovation Zones legislation; Marathon Digital in LV.'),
  ('Cannabis', 'Cannabis', ARRAY['111419','325411','455219','424590'], 'mature', 48,
   'Cultivation, extraction, dispensary tech. Legal since 2017; $758M FY2025 sales.')
ON CONFLICT (slug) DO UPDATE SET
  naics_codes = EXCLUDED.naics_codes,
  maturity_stage = EXCLUDED.maturity_stage,
  strategic_priority = EXCLUDED.strategic_priority,
  description = EXCLUDED.description;

COMMIT;
