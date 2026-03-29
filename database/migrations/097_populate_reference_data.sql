-- Migration 097: Populate reference data columns across regions, sectors, universities
--
-- These columns were created in 002_reference_tables.sql and 003_entity_tables.sql
-- but never filled with actual data. This migration populates them with real
-- (approximate) Nevada economic and institutional data for the analytical layer.
--
-- Data sources:
--   - U.S. Census Bureau 2024 estimates (population)
--   - Bureau of Economic Analysis 2024 GDP by state/metro (gdp_b)
--   - NSF HERD Survey 2023 (university research budgets)
--   - NAICS Association (sector codes)
--   - SHEAT scores from frontend/src/data/constants.js (strategic_priority)
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/097_populate_reference_data.sql

BEGIN;

-- ============================================================
-- 1. REGIONS — populate population and gdp_b on existing rows
-- ============================================================
-- Source: U.S. Census Bureau 2024 population estimates; BEA GDP 2023.
-- Confidence: ~0.9 (publicly available, rounded to nearest thousand)

-- Nevada (state level)
UPDATE regions SET
  population = 3200000,
  gdp_b      = 220.00
WHERE name = 'Nevada' AND level = 'state';

-- Las Vegas metro (Clark County core)
UPDATE regions SET
  population = 2300000,
  gdp_b      = 150.00
WHERE name = 'Las Vegas' AND level = 'metro';

-- Reno-Sparks metro (Washoe County core)
UPDATE regions SET
  population = 500000,
  gdp_b      = 35.00
WHERE name = 'Reno-Sparks' AND level = 'metro';

-- Henderson (city within Clark County)
UPDATE regions SET
  population = 330000
WHERE name = 'Henderson' AND level = 'city';

-- Carson City (independent city/county)
UPDATE regions SET
  population = 58000
WHERE name = 'Carson City' AND level = 'city';

-- Set parent_id references: metros and cities belong to Nevada state
UPDATE regions SET parent_id = (SELECT id FROM regions WHERE name = 'Nevada' AND level = 'state')
WHERE level IN ('metro', 'city') AND parent_id IS NULL;


-- ============================================================
-- 2. SECTORS — insert all SHEAT sectors with NAICS codes,
--    maturity stage, and strategic priority
-- ============================================================
-- Source: NAICS Association (naics.com), BLS industry codes
-- Strategic priority mapped directly from SHEAT scores in constants.js
-- Maturity stages assigned based on Nevada market presence:
--   'emerging'  = <3 years mainstream in NV or nascent market
--   'growth'    = rapidly scaling, significant recent investment
--   'mature'    = established NV presence, stable market

INSERT INTO sectors (name, slug, naics_codes, maturity_stage, strategic_priority, description) VALUES
  -- Tier 1: Strategic priorities >= 80
  ('Artificial Intelligence',    'AI',               ARRAY['5112','5415'],       'growth',    95,
    'AI/ML platforms, generative AI, autonomous systems. NAICS 5112 (Software Publishers), 5415 (Computer Systems Design).'),
  ('Cybersecurity',              'Cybersecurity',    ARRAY['5415'],              'growth',    88,
    'InfoSec, threat detection, identity management. NAICS 5415 (Computer Systems Design & Related).'),
  ('Defense',                    'Defense',          ARRAY['3364','9271'],       'mature',    85,
    'Defense contracting, military systems, homeland security. NAICS 3364 (Aerospace Product & Parts), 9271 (Space Research & Technology).'),
  ('Cleantech',                  'Cleantech',        ARRAY['2211','3241'],       'growth',    82,
    'Clean energy, sustainable materials, carbon capture. NAICS 2211 (Electric Power), 3241 (Petroleum & Coal Products).'),
  ('Semiconductors',             'Semiconductors',   ARRAY['3344'],              'growth',    82,
    'Chip design, fabrication, packaging. NAICS 3344 (Semiconductor & Electronic Component Mfg).'),
  ('Satellite',                  'Satellite',        ARRAY['3342','5174'],       'growth',    82,
    'Satellite communications, earth observation, ground systems. NAICS 3342 (Communications Equipment), 5174 (Satellite Telecom).'),
  ('Aerospace',                  'Aerospace',        ARRAY['3364'],              'growth',    80,
    'Commercial space, launch vehicles, propulsion. NAICS 3364 (Aerospace Product & Parts Mfg).'),
  ('Cloud',                      'Cloud',            ARRAY['5182','5415'],       'mature',    80,
    'Cloud infrastructure, SaaS, PaaS. NAICS 5182 (Data Processing & Hosting), 5415 (Computer Systems Design).'),
  ('Data Center',                'Data Center',      ARRAY['5182'],              'mature',    80,
    'Colocation, hyperscale, edge computing facilities. NAICS 5182 (Data Processing, Hosting & Related).'),
  ('Identity',                   'Identity',         ARRAY['5415'],              'growth',    80,
    'Digital identity, verification, identity resolution. NAICS 5415 (Computer Systems Design & Related).'),

  -- Tier 2: Strategic priorities 70-79
  ('Mining',                     'Mining',           ARRAY['2122'],              'mature',    78,
    'Lithium, gold, silver, copper extraction. NAICS 2122 (Metal Ore Mining). NV is top US mining state.'),
  ('Energy',                     'Energy',           ARRAY['2211','2212'],       'mature',    78,
    'Utilities, power generation, grid infrastructure. NAICS 2211 (Electric Power), 2212 (Natural Gas Distribution).'),
  ('Robotics',                   'Robotics',         ARRAY['3339','5415'],       'growth',    78,
    'Industrial robots, autonomous vehicles, warehouse automation. NAICS 3339 (Other General Purpose Machinery), 5415.'),
  ('Solar',                      'Solar',            ARRAY['2211','3344'],       'growth',    75,
    'Solar panel mfg, utility-scale solar, distributed generation. NAICS 2211 (Electric Power), 3344 (Semiconductor).'),
  ('Drones',                     'Drones',           ARRAY['3364','3369'],       'growth',    75,
    'UAS platforms, drone delivery, aerial surveying. NAICS 3364 (Aerospace Products), 3369 (Other Transportation Equipment).'),
  ('Analytics',                  'Analytics',        ARRAY['5182','5415'],       'growth',    75,
    'Data analytics, business intelligence, data science platforms. NAICS 5182, 5415.'),
  ('Biotech',                    'Biotech',          ARRAY['3254','5417'],       'emerging',  72,
    'Biopharma, gene therapy, personalized medicine. NAICS 3254 (Pharmaceutical & Medicine Mfg), 5417 (Scientific R&D).'),
  ('Water',                      'Water',            ARRAY['2213','5417'],       'growth',    72,
    'Water treatment, conservation tech, desalination. NAICS 2213 (Water, Sewage & Other Systems), 5417 (Scientific R&D).'),
  ('Materials Science',          'Materials Science', ARRAY['3279','3259'],      'emerging',  70,
    'Advanced materials, composites, nanomaterials. NAICS 3279 (Other Nonmetallic Mineral Products), 3259 (Other Chemical Products).'),
  ('Computing',                  'Computing',        ARRAY['3341','5415'],       'growth',    70,
    'Quantum computing, HPC, edge computing. NAICS 3341 (Computer & Peripheral Equipment), 5415.'),
  ('Fintech',                    'Fintech',          ARRAY['5223','5415'],       'growth',    70,
    'Digital payments, neobanking, lending platforms. NAICS 5223 (Activities Related to Credit Intermediation), 5415.'),
  ('Healthcare',                 'Healthcare',       ARRAY['6211','6214'],       'mature',    70,
    'Digital health, telehealth, health IT. NAICS 6211 (Offices of Physicians), 6214 (Outpatient Care Centers).'),

  -- Tier 3: Strategic priorities 60-69
  ('Gaming',                     'Gaming',           ARRAY['7132','5112'],       'mature',    68,
    'Casino tech, iGaming, sports betting platforms. NAICS 7132 (Gambling Industries), 5112 (Software Publishers).'),
  ('Payments',                   'Payments',         ARRAY['5223','5222'],       'mature',    68,
    'Payment processing, POS systems, digital wallets. NAICS 5223, 5222 (Nondepository Credit Intermediation).'),
  ('Construction',               'Construction',     ARRAY['2361','2362'],       'mature',    65,
    'Construction tech, modular building, smart buildings. NAICS 2361 (Residential Building), 2362 (Nonresidential Building).'),
  ('Logistics',                  'Logistics',        ARRAY['4931','4921'],       'mature',    65,
    'Supply chain tech, last-mile delivery, freight. NAICS 4931 (Warehousing & Storage), 4921 (Couriers & Express Delivery).'),
  ('IoT',                        'IoT',              ARRAY['3342','5415'],       'growth',    65,
    'Internet of Things, connected devices, smart infrastructure. NAICS 3342 (Communications Equipment), 5415.'),
  ('AdTech',                     'AdTech',           ARRAY['5418','5415'],       'mature',    65,
    'Advertising technology, programmatic, marketing platforms. NAICS 5418 (Advertising & Related), 5415.'),
  ('Enterprise',                 'Enterprise',       ARRAY['5112','5415'],       'mature',    65,
    'Enterprise software, ERP, workflow automation. NAICS 5112 (Software Publishers), 5415.'),
  ('Education',                  'Education',        ARRAY['6111','6112'],       'growth',    62,
    'EdTech, online learning, workforce development. NAICS 6111 (Elementary & Secondary Schools), 6112 (Junior Colleges).'),
  ('Manufacturing',              'Manufacturing',    ARRAY['3111','3399'],       'mature',    60,
    'Advanced manufacturing, 3D printing, smart factories. NAICS 3111-3399 (Manufacturing).'),
  ('Hospitality',                'Hospitality',      ARRAY['7211','7212'],       'mature',    60,
    'Hospitality tech, hotel management, travel platforms. NAICS 7211 (Traveler Accommodation), 7212 (RV Parks & Camps).'),
  ('Fitness',                    'Fitness',          ARRAY['7139','7112'],       'growth',    60,
    'Fitness tech, wearables, wellness platforms. NAICS 7139 (Other Amusement & Recreation), 7112 (Spectator Sports).'),
  ('HR Tech',                    'HR Tech',          ARRAY['5613','5415'],       'growth',    60,
    'HR software, recruiting platforms, workforce management. NAICS 5613 (Employment Services), 5415.'),

  -- Tier 4: Strategic priorities < 60
  ('Media',                      'Media',            ARRAY['5121','5191'],       'mature',    58,
    'Digital media, streaming, content platforms. NAICS 5121 (Motion Picture & Video), 5191 (Other Information Services).'),
  ('Mobile',                     'Mobile',           ARRAY['5112','5174'],       'mature',    58,
    'Mobile apps, mobile-first platforms. NAICS 5112 (Software Publishers), 5174 (Satellite Telecom).'),
  ('Consumer',                   'Consumer',         ARRAY['4541','4539'],       'mature',    55,
    'Consumer tech, D2C, e-commerce. NAICS 4541 (Electronic Shopping), 4539 (Other Misc Store Retailers).'),
  ('Banking',                    'Banking',          ARRAY['5221','5222'],       'mature',    55,
    'Banking tech, core banking, digital banking. NAICS 5221 (Depository Credit Intermediation), 5222.'),
  ('Retail',                     'Retail',           ARRAY['4529','4541'],       'mature',    52,
    'Retail tech, point of sale, inventory management. NAICS 4529 (Other General Merchandise), 4541 (Electronic Shopping).'),
  ('Blockchain',                 'Blockchain',       ARRAY['5112'],              'emerging',  50,
    'Blockchain protocols, DeFi, Web3 infrastructure. NAICS 5112 (Software Publishers).'),
  ('Real Estate',                'Real Estate',      ARRAY['5311','5312'],       'mature',    50,
    'PropTech, real estate platforms, smart buildings. NAICS 5311 (Lessors of Real Estate), 5312 (Real Estate Agents & Brokers).'),
  ('Cannabis',                   'Cannabis',         ARRAY['1119','4539'],       'emerging',  45,
    'Cannabis tech, cultivation systems, dispensary platforms. NAICS 1119 (Other Crop Farming), 4539 (Other Misc Store Retailers).')
ON CONFLICT (slug) DO UPDATE SET
  naics_codes        = EXCLUDED.naics_codes,
  maturity_stage     = EXCLUDED.maturity_stage,
  strategic_priority = EXCLUDED.strategic_priority,
  description        = EXCLUDED.description;


-- ============================================================
-- 3. UNIVERSITIES — insert Nevada research institutions
-- ============================================================
-- Source: NSF HERD Survey 2023 (research budgets), AUTM (tech transfer),
--         institutional websites (spinout counts approximate).
-- Confidence: ~0.85 (publicly available, rounded)
--
-- Legacy external IDs (after migration 068 consolidation):
--   UNR  → u_unr
--   UNLV → u_unlv
--   DRI  → u_dri
--   NSC  → u_nsc

-- UNR — University of Nevada, Reno
-- R1 research university, strong engineering and mining programs
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, region_id, legacy_external_id, confidence, verified)
VALUES (
  'unr',
  'University of Nevada, Reno',
  180.00,
  true,
  15,
  (SELECT id FROM regions WHERE name = 'Reno-Sparks' AND level = 'metro'),
  'u_unr',
  0.85,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m    = EXCLUDED.research_budget_m,
  tech_transfer_office = EXCLUDED.tech_transfer_office,
  spinout_count        = EXCLUDED.spinout_count,
  region_id            = EXCLUDED.region_id,
  legacy_external_id   = EXCLUDED.legacy_external_id,
  confidence           = EXCLUDED.confidence,
  updated_at           = NOW();

-- UNLV — University of Nevada, Las Vegas
-- R1 research university, Harry Reid Research & Technology Park host
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, region_id, legacy_external_id, confidence, verified)
VALUES (
  'unlv',
  'University of Nevada, Las Vegas',
  120.00,
  true,
  10,
  (SELECT id FROM regions WHERE name = 'Las Vegas' AND level = 'metro'),
  'u_unlv',
  0.85,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m    = EXCLUDED.research_budget_m,
  tech_transfer_office = EXCLUDED.tech_transfer_office,
  spinout_count        = EXCLUDED.spinout_count,
  region_id            = EXCLUDED.region_id,
  legacy_external_id   = EXCLUDED.legacy_external_id,
  confidence           = EXCLUDED.confidence,
  updated_at           = NOW();

-- DRI — Desert Research Institute
-- NSHE research branch; climate, water, atmospheric sciences
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, region_id, legacy_external_id, confidence, verified)
VALUES (
  'dri',
  'Desert Research Institute',
  50.00,
  true,
  5,
  (SELECT id FROM regions WHERE name = 'Reno-Sparks' AND level = 'metro'),
  'u_dri',
  0.80,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m    = EXCLUDED.research_budget_m,
  tech_transfer_office = EXCLUDED.tech_transfer_office,
  spinout_count        = EXCLUDED.spinout_count,
  region_id            = EXCLUDED.region_id,
  legacy_external_id   = EXCLUDED.legacy_external_id,
  confidence           = EXCLUDED.confidence,
  updated_at           = NOW();

-- NSC — Nevada State College (now Nevada State University)
-- Teaching-focused institution with nascent research programs
INSERT INTO universities (slug, name, research_budget_m, tech_transfer_office, spinout_count, region_id, legacy_external_id, confidence, verified)
VALUES (
  'nsc',
  'Nevada State University',
  5.00,
  false,
  0,
  (SELECT id FROM regions WHERE name = 'Henderson' AND level = 'city'),
  'u_nsc',
  0.75,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  research_budget_m    = EXCLUDED.research_budget_m,
  tech_transfer_office = EXCLUDED.tech_transfer_office,
  spinout_count        = EXCLUDED.spinout_count,
  region_id            = EXCLUDED.region_id,
  legacy_external_id   = EXCLUDED.legacy_external_id,
  confidence           = EXCLUDED.confidence,
  updated_at           = NOW();


-- ============================================================
-- VERIFICATION QUERIES (commented out — uncomment to validate)
-- ============================================================
-- SELECT name, level, population, gdp_b, parent_id FROM regions ORDER BY id;
-- SELECT name, slug, naics_codes, maturity_stage, strategic_priority FROM sectors ORDER BY strategic_priority DESC;
-- SELECT slug, name, research_budget_m, tech_transfer_office, spinout_count, region_id, legacy_external_id FROM universities ORDER BY research_budget_m DESC;

COMMIT;
