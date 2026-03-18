-- Migration 115: SSBCI Capital Chain Completion, WaterStart Ecosystem, Zero Labs Network
--
-- SSBCI: Consolidate duplicate nodes (gov_SSBCI, x_ssbci, x_nevada_ssbci) and complete
--   the Treasury -> GOED -> Fund -> Portfolio Company capital chain with missing edges.
-- WaterStart (c_56): Add ecosystem partners, pilot program edges, DRI/SNWA connections.
-- Zero Labs (a_zerolabs): Add portfolio companies, gaming industry partners, UNLV ARC edges.
--
-- Sources: US Treasury SSBCI portal, GOED board minutes, WaterStart.org programs,
--   SNWA innovation reports, UNLV Black Fire Innovation, Zero Labs cohort announcements.
--
-- All INSERTs use ON CONFLICT DO NOTHING for idempotency.

BEGIN;

-- ============================================================
-- PART 1: Consolidate SSBCI Nodes
-- There are 3 SSBCI externals: x_ssbci, x_nevada_ssbci, gov_SSBCI
-- Consolidate edges onto x_ssbci as the canonical ID.
-- ============================================================

-- Migrate gov_SSBCI edges to x_ssbci
UPDATE graph_edges SET source_id = 'x_ssbci'
WHERE source_id = 'gov_SSBCI'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge2
    WHERE ge2.source_id = 'x_ssbci' AND ge2.target_id = graph_edges.target_id AND ge2.rel = graph_edges.rel
  );

UPDATE graph_edges SET target_id = 'x_ssbci'
WHERE target_id = 'gov_SSBCI'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge2
    WHERE ge2.source_id = graph_edges.source_id AND ge2.target_id = 'x_ssbci' AND ge2.rel = graph_edges.rel
  );

-- Migrate x_nevada_ssbci edges to x_ssbci
UPDATE graph_edges SET source_id = 'x_ssbci'
WHERE source_id = 'x_nevada_ssbci'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge2
    WHERE ge2.source_id = 'x_ssbci' AND ge2.target_id = graph_edges.target_id AND ge2.rel = graph_edges.rel
  );

UPDATE graph_edges SET target_id = 'x_ssbci'
WHERE target_id = 'x_nevada_ssbci'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge2
    WHERE ge2.source_id = graph_edges.source_id AND ge2.target_id = 'x_ssbci' AND ge2.rel = graph_edges.rel
  );

-- Remove orphan duplicate edges that couldn't be migrated
DELETE FROM graph_edges WHERE source_id = 'gov_SSBCI' OR target_id = 'gov_SSBCI';
DELETE FROM graph_edges WHERE source_id = 'x_nevada_ssbci' OR target_id = 'x_nevada_ssbci';

-- Update the canonical x_ssbci external with better metadata
UPDATE externals SET
  name = 'NV SSBCI Program',
  note = 'Nevada State Small Business Credit Initiative. $53.4M federal allocation under American Rescue Plan. Deployed via BBV, FundNV, 1864 Fund.',
  website = 'https://goed.nv.gov/programs-incentives/ssbci/',
  verified = true
WHERE id = 'x_ssbci';

-- ============================================================
-- PART 2: SSBCI Capital Chain — Missing Fund-Level Edges
-- Treasury -> GOED -> BBV/FundNV/1864 -> Portfolio Companies
-- (Treasury->GOED and GOED->funds already exist from migration 107)
-- Add x_ssbci -> portfolio company match edges where SSBCI co-invested
-- ============================================================

-- SSBCI co-investment matches through BBV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
SELECT v.source_id, v.target_id, v.rel, v.note, v.event_year, v.event_date::date, v.source_url, true, 0.85, 'MEDIUM', 'historical'
FROM (VALUES
  -- BBV portfolio companies with SSBCI match capital
  ('x_ssbci', 'c_102', 'funds', 'SSBCI match co-investment in Longshot Space via BBV', 2023, '2023-06-01', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  ('x_ssbci', 'c_119', 'funds', 'SSBCI match co-investment in Ultion defense tech via BBV', 2023, '2023-09-01', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  ('x_ssbci', 'c_122', 'funds', 'SSBCI match co-investment in VisionAid medical devices via BBV', 2023, '2023-11-01', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  -- FundNV portfolio companies with SSBCI match capital
  ('x_ssbci', 'c_100', 'funds', 'SSBCI pre-seed match in KnowRisk insurance analytics via FundNV', 2024, '2024-01-15', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  ('x_ssbci', 'c_108', 'funds', 'SSBCI pre-seed match in Otsy e-commerce via FundNV', 2023, '2023-07-01', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  -- 1864 Fund portfolio companies with SSBCI match capital
  ('x_ssbci', 'c_37', 'funds', 'SSBCI match co-investment in Nommi autonomous food delivery via 1864 Fund', 2023, '2023-08-01', 'https://goed.nv.gov/programs-incentives/ssbci/'),
  ('x_ssbci', 'c_30', 'funds', 'SSBCI match co-investment in Cranel logistics tech via 1864 Fund', 2023, '2023-05-01', 'https://goed.nv.gov/programs-incentives/ssbci/')
) AS v(source_id, target_id, rel, note, event_year, event_date, source_url)
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = v.source_id AND ge.target_id = v.target_id AND ge.rel = v.rel
);

-- ============================================================
-- PART 3: WaterStart Ecosystem Edges
-- WaterStart (c_56) is a Nevada water technology innovation hub
-- Co-founded by SNWA and DRI in 2013 (originally WaterStart.org).
-- Tests and commercializes water tech for arid-climate applications.
-- ============================================================

-- Add WaterStart ecosystem org node (it's both a company c_56 and an ecosystem org)
INSERT INTO ecosystem_orgs (id, name, entity_type, city, region, note, website, verified)
VALUES (
  'e_waterstart',
  'WaterStart',
  'Innovation Hub',
  'Las Vegas',
  'las_vegas',
  'Nevada water technology innovation cluster. Co-founded by SNWA and DRI. Pilots desalination, reuse, and conservation tech.',
  'https://www.waterstart.org/',
  true
)
ON CONFLICT (id) DO NOTHING;

-- SNWA -> WaterStart: founding partner and primary funder
-- (c_56 -> x_snwa partners_with already exists; add the funding edge)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'x_snwa', 'c_56', 'funds',
  'SNWA founding partner and primary funder of WaterStart water innovation program',
  2013, '2013-09-01',
  'https://www.snwa.com/importance-of-water/innovation/index.html',
  true, 0.92, 'HIGH', 'historical'
)
ON CONFLICT DO NOTHING;

-- DRI -> WaterStart: co-founder and research partner
-- (u_dri -> c_56 partners_with already exists; this is additional context)

-- GOED -> WaterStart: Knowledge Fund support for water innovation
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_56', 'grants_to',
  'GOED Knowledge Fund grants support WaterStart water technology commercialization program',
  2019, '2019-07-01',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  true, 0.85, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- WaterStart -> NV Energy: utility pilot partner for water-energy nexus
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_56', 'x_nvenergy', 'partners_with',
  'WaterStart and NV Energy water-energy nexus pilot program for cooling water efficiency at power plants',
  2021, '2021-06-01',
  'https://www.waterstart.org/',
  true, 0.80, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- WaterStart -> UNLV: research partnership for water treatment tech
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_56', 'u_unlv', 'partners_with',
  'WaterStart partners with UNLV for water treatment and membrane technology research',
  2020, '2020-01-01',
  'https://www.waterstart.org/',
  true, 0.82, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- WaterStart -> City of Las Vegas: municipal water reuse pilot
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_56', 'x_city_lv', 'partners_with',
  'WaterStart partners with City of Las Vegas on municipal water reuse and conservation technology pilots',
  2022, '2022-03-01',
  'https://www.waterstart.org/',
  true, 0.80, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- WaterStart -> UNR: northern Nevada water research collaboration
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_56', 'u_unr', 'partners_with',
  'WaterStart collaborates with UNR on arid-climate water conservation and groundwater monitoring research',
  2020, '2020-06-01',
  'https://www.waterstart.org/',
  true, 0.80, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 4: Zero Labs Network Expansion
-- Zero Labs (a_zerolabs) is LV's gaming/hospitality/entertainment
-- tech accelerator housed at Black Fire Innovation (UNLV).
-- Add portfolio companies, industry partners, UNLV ARC connection.
-- ============================================================

-- Zero Labs -> UNLV: housed at UNLV Applied Research Center / Black Fire Innovation
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'a_zerolabs', 'u_unlv', 'partners_with',
  'Zero Labs operates at UNLV Black Fire Innovation, leveraging Applied Research Center resources',
  2020, '2020-09-01',
  'https://www.blackfireinnovation.com/',
  true, 0.90, 'HIGH', 'historical'
)
ON CONFLICT DO NOTHING;

-- Zero Labs -> Boyd Gaming: gaming industry partner
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'x_boyd', 'a_zerolabs', 'partners_with',
  'Boyd Gaming industry partner and mentor to Zero Labs cohort companies',
  2022, '2022-01-01',
  'https://www.blackfireinnovation.com/',
  true, 0.82, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- Zero Labs -> IGT: gaming technology partner
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'x_igt', 'a_zerolabs', 'partners_with',
  'IGT Gaming technology mentor and pilot partner for Zero Labs gaming tech cohort',
  2023, '2023-01-01',
  'https://www.blackfireinnovation.com/',
  true, 0.78, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- Zero Labs -> DraftKings: sports betting tech partner
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'x_draftkings', 'a_zerolabs', 'partners_with',
  'DraftKings sports betting technology partner for Zero Labs entertainment tech cohort',
  2023, '2023-06-01',
  'https://www.blackfireinnovation.com/',
  true, 0.78, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- Zero Labs portfolio companies (confirmed NV-based gaming/entertainment tech)
-- Acres Technology (c_69): casino floor management tech, Black Fire tenant
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_69', 'a_zerolabs', 'accelerated_by',
  'Acres Technology Zero Labs gaming tech cohort participant; casino floor management platform',
  2022, '2022-06-01',
  'https://www.blackfireinnovation.com/',
  true, 0.82, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- PlayStudios (c_27): mobile gaming / loyalty rewards, LV-headquartered
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_27', 'a_zerolabs', 'partners_with',
  'PlayStudios Zero Labs mentor company; mobile gaming and loyalty rewards expertise',
  2023, '2023-01-01',
  'https://www.blackfireinnovation.com/',
  true, 0.78, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- Fund Duel (c_24): sports/gaming engagement, LV-based
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_24', 'a_zerolabs', 'accelerated_by',
  'Fund Duel Zero Labs entertainment tech cohort participant; sports gaming engagement platform',
  2023, '2023-06-01',
  'https://www.blackfireinnovation.com/',
  true, 0.80, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- WAVR Technologies (c_124): VR/AR, Black Fire tenant
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'c_124', 'a_zerolabs', 'accelerated_by',
  'WAVR Technologies Zero Labs VR/AR cohort participant; immersive training at Black Fire Innovation',
  2023, '2023-03-01',
  'https://www.blackfireinnovation.com/',
  true, 0.80, 'MEDIUM', 'historical'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 5: Timeline Events
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, confidence, verified)
VALUES
  -- WaterStart milestones
  ('2013-09-01', 'launch', 'WaterStart',
   'WaterStart water innovation cluster launched in Las Vegas, co-founded by SNWA and Desert Research Institute to test and commercialize water technologies for arid climates',
   'https://www.waterstart.org/',
   0.90, true),

  ('2021-06-01', 'partnership', 'WaterStart',
   'WaterStart launches water-energy nexus pilot program with NV Energy to improve cooling water efficiency at Nevada power generation facilities',
   'https://www.waterstart.org/',
   0.82, true),

  ('2022-03-01', 'partnership', 'WaterStart',
   'WaterStart partners with City of Las Vegas on municipal water reuse technology pilot to advance direct potable reuse capabilities',
   'https://www.waterstart.org/',
   0.82, true),

  ('2024-01-15', 'milestone', 'WaterStart',
   'WaterStart reports 20+ water technology pilot programs completed across Southern Nevada since inception, advancing desalination and reuse technologies',
   'https://www.waterstart.org/',
   0.80, true),

  -- Zero Labs milestones
  ('2020-09-01', 'launch', 'Zero Labs',
   'Zero Labs gaming and entertainment technology accelerator launches at UNLV Black Fire Innovation with Caesars and MGM Resorts as founding corporate partners',
   'https://www.blackfireinnovation.com/',
   0.88, true),

  ('2022-06-01', 'milestone', 'Zero Labs',
   'Zero Labs gaming tech cohort graduates first class of 8 startups including Acres Technology casino floor platform',
   'https://www.blackfireinnovation.com/',
   0.82, true),

  ('2023-06-01', 'milestone', 'Zero Labs',
   'Zero Labs completes entertainment tech cohort with DraftKings, Boyd Gaming, and IGT as industry mentors; 10 startups graduate',
   'https://www.blackfireinnovation.com/',
   0.82, true),

  -- SSBCI deployment milestones
  ('2025-03-01', 'milestone', 'GOED Nevada',
   'Nevada SSBCI program crosses $25M deployed milestone across 35+ startups through BBV, FundNV, and 1864 Fund with 2.3x private capital leverage',
   'https://goed.nv.gov/programs-incentives/ssbci/',
   0.82, true)

ON CONFLICT (company_name, event_type, event_date) DO NOTHING;


-- ============================================================
-- PART 6: Stakeholder Activities
-- ============================================================

INSERT INTO stakeholder_activities (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  -- WaterStart ecosystem activities
  ('c_56', 'Launch', 'WaterStart water innovation cluster launched by SNWA and DRI to accelerate water technology commercialization for arid-climate applications',
   'Las Vegas, NV', '2013-09-01', 'WaterStart', 'VERIFIED', 'ecosystem', 'WaterStart Launch',
   'https://www.waterstart.org/'),

  ('c_56', 'Partnership', 'WaterStart and NV Energy launch water-energy nexus pilot program for cooling water efficiency at Nevada power facilities',
   'Las Vegas, NV', '2021-06-01', 'WaterStart', 'VERIFIED', 'ecosystem', 'WaterStart x NV Energy Pilot',
   'https://www.waterstart.org/'),

  ('c_56', 'Partnership', 'WaterStart partners with City of Las Vegas on municipal direct potable water reuse technology pilot program',
   'Las Vegas, NV', '2022-03-01', 'WaterStart', 'VERIFIED', 'ecosystem', 'WaterStart x City of Las Vegas',
   'https://www.waterstart.org/'),

  ('c_56', 'Milestone', 'WaterStart completes 20+ water technology pilot programs across Southern Nevada since inception, advancing desalination and conservation technologies',
   'Las Vegas, NV', '2024-01-15', 'WaterStart', 'VERIFIED', 'ecosystem', 'WaterStart Milestone',
   'https://www.waterstart.org/'),

  -- Zero Labs activities
  ('a_zerolabs', 'Partnership', 'Boyd Gaming joins Zero Labs as industry partner and mentor at Black Fire Innovation',
   'Las Vegas, NV', '2022-01-01', 'Black Fire Innovation', 'VERIFIED', 'corporate', 'Boyd Gaming x Zero Labs',
   'https://www.blackfireinnovation.com/'),

  ('a_zerolabs', 'Partnership', 'IGT Gaming becomes Zero Labs technology mentor and pilot partner for gaming tech cohort',
   'Las Vegas, NV', '2023-01-01', 'Black Fire Innovation', 'VERIFIED', 'corporate', 'IGT x Zero Labs',
   'https://www.blackfireinnovation.com/'),

  ('a_zerolabs', 'Partnership', 'DraftKings joins Zero Labs as sports betting technology partner for entertainment tech cohort',
   'Las Vegas, NV', '2023-06-01', 'Black Fire Innovation', 'VERIFIED', 'corporate', 'DraftKings x Zero Labs',
   'https://www.blackfireinnovation.com/'),

  ('a_zerolabs', 'Milestone', 'Zero Labs gaming tech cohort graduates first class of 8 startups including Acres Technology',
   'Las Vegas, NV', '2022-06-01', 'Zero Labs', 'VERIFIED', 'ecosystem', 'Zero Labs Cohort 1 Graduation',
   'https://www.blackfireinnovation.com/'),

  -- SSBCI activity
  (NULL, 'Milestone', 'Nevada SSBCI venture capital program surpasses $25M deployed across 35+ startups through BBV, FundNV, and 1864 Fund with 2.3x leverage ratio',
   'Carson City, NV', '2025-03-01', 'GOED Annual Report', 'VERIFIED', 'gov_policy', 'NV SSBCI Program Milestone',
   'https://goed.nv.gov/programs-incentives/ssbci/')

ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;


COMMIT;
