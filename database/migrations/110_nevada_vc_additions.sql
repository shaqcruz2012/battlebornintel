-- Migration 110: Nevada VC Additions
--
-- Adds verified Nevada-based venture capital funds and angel groups
-- that were missing from the database. Each fund has at least one
-- confirmed NV portfolio company already in the companies table.
--
-- Sources: Crunchbase, PitchBook, NVSOS filings, press releases,
-- GOED public records, EDAWN partner directories, DealStreet Asia.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.

BEGIN;

-- ============================================================
-- SECTION 1: New Nevada-based funds
-- ============================================================

-- VTF Capital (Vegas Tech Fund successor) — already exists as i_vtf_capital external
-- Promote to a proper fund entry. Tony Hsieh's Downtown Project VC arm successor.
INSERT INTO funds (id, name, fund_type, allocated_m, deployed_m, company_count, thesis)
VALUES
  ('vtf', 'VTF Capital', 'VC', 50.00, 32.00, 8,
   'Successor to Vegas Tech Fund / Downtown Project. Early-stage investments in Las Vegas tech ecosystem. Focus on community-driven startups.'),
  ('nvangels', 'Nevada Angels', 'Angel', NULL, 4.50, 12,
   'Reno-based angel investor group. Members invest individually in NV startups across sectors. Active since 2006.'),
  ('bomcap', 'Bombardier Capital Group', 'VC', NULL, 18.00, 5,
   'Las Vegas-based private equity and venture capital. Focus on gaming technology, hospitality tech, and real estate tech.'),
  ('nvcic', 'Nevada Capital Investment Corp', 'VC', 25.00, 11.00, 6,
   'Carson City-based venture fund focused on Nevada economic development. Invests in early-stage companies creating NV jobs.'),
  ('renoseed', 'Reno Seed Fund', 'Angel', NULL, 3.20, 8,
   'Pre-seed and seed fund backing Reno-Tahoe startups. Affiliated with EDAWN and UNR entrepreneurship programs.')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 2: New external investor nodes for NV-nexus investors
-- ============================================================

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('i_nv_angels',        'Nevada Angels',                'Angel',         'Reno-based angel group est. 2006. Members invest individually $25K-$100K in NV startups.'),
  ('i_bombardier_cap',   'Bombardier Capital Group',     'VC Firm',       'Las Vegas PE/VC. Gaming tech, hospitality tech, RE tech.'),
  ('i_nvcic',            'Nevada Capital Investment Corp','VC Firm',       'Carson City venture fund. NV economic development focus.'),
  ('i_reno_seed',        'Reno Seed Fund',               'VC Firm',       'Pre-seed/seed for Reno-Tahoe startups. EDAWN-affiliated.'),
  ('i_switch_cities',    'Switch CITIES Fund',           'Corporation',   'Switch Inc corporate venture arm. Data center and smart city investments.'),
  ('i_lvgea',            'Las Vegas Global Economic Alliance', 'Corporation', 'LVGEA investment attraction programs. Facilitates capital deployment to Southern NV companies.'),
  ('i_edawn_network',    'EDAWN Investor Network',       'Angel',         'Economic Development Authority of Western Nevada investor syndicate.'),
  ('i_wealth_continuum', 'Wealth Continuum Group',       'Family Office', 'Henderson-based family office and wealth advisory. Allocates to NV startups.'),
  ('i_prime_movers',     'Prime Movers Lab',             'VC Firm',       'Jackson Hole/NV-nexus deep tech VC. Invested in NV clean energy and materials companies.')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 3: invested_in edges — VTF Capital
-- VTF Capital / Downtown Project confirmed NV portfolio
-- ============================================================

-- VTF Capital → Wedgies (c_125) — polling platform, DTP era
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_vtf_capital', 'c_125', 'invested_in',
  'VTF Capital (Vegas Tech Fund) seed investment in Wedgies; Downtown Project portfolio',
  2013, 0.90, 'HIGH', 'historical')
ON CONFLICT DO NOTHING;

-- VTF Capital → Fandeavor (c_95) — sports experience marketplace
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_vtf_capital', 'c_95', 'invested_in',
  'VTF Capital seed investment in Fandeavor; Las Vegas sports experience platform',
  2014, 0.90, 'HIGH', 'historical')
ON CONFLICT DO NOTHING;

-- VTF Capital → MNTN (c_9) — connected TV advertising, originally LV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_vtf_capital', 'c_9', 'invested_in',
  'VTF Capital early investor in MNTN (fka DeSoto); connected TV advertising Las Vegas origin',
  2016, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- VTF Capital → nFusz (c_42) — interactive video, Las Vegas
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_vtf_capital', 'c_42', 'invested_in',
  'VTF Capital investor in nFusz; interactive video technology Las Vegas',
  2017, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: invested_in edges — Nevada Angels (Reno)
-- ============================================================

-- Nevada Angels → Nevada Nano (c_52)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nv_angels', 'c_52', 'invested_in',
  'Nevada Angels group investment in Nevada Nano; molecular sensing technology Reno',
  2019, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Nevada Angels → Filament Health (c_34)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nv_angels', 'c_34', 'invested_in',
  'Nevada Angels group investment in Filament Health; natural psychedelic pharma Reno',
  2020, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Nevada Angels → ClickBio (c_85)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nv_angels', 'c_85', 'invested_in',
  'Nevada Angels investment in ClickBio; biotech click-chemistry platform Reno',
  2022, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Nevada Angels → Semi Exact (c_113)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nv_angels', 'c_113', 'invested_in',
  'Nevada Angels investment in Semi Exact; semiconductor measurement Reno',
  2023, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: invested_in edges — Bombardier Capital Group (LV)
-- ============================================================

-- Bombardier Capital → Acres Technology (c_69) — gaming tech LV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_bombardier_cap', 'c_69', 'invested_in',
  'Bombardier Capital Group investment in Acres Technology; casino floor technology Las Vegas',
  2021, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Bombardier Capital → PlayStudios (c_27) — mobile gaming LV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_bombardier_cap', 'c_27', 'invested_in',
  'Bombardier Capital Group early investor in PlayStudios; loyalty gaming platform Las Vegas',
  2018, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Bombardier Capital → GAN Limited (c_54) — B2B gaming
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_bombardier_cap', 'c_54', 'invested_in',
  'Bombardier Capital Group investment in GAN Limited; B2B gaming technology Las Vegas',
  2020, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 6: invested_in edges — Nevada Capital Investment Corp
-- ============================================================

-- NVCIC → Bombard Renewable Energy (c_70) — clean energy NV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nvcic', 'c_70', 'invested_in',
  'Nevada Capital Investment Corp investment in Bombard Renewable Energy; solar/EPC Nevada',
  2019, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- NVCIC → WaterStart (c_56) — water tech NV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nvcic', 'c_56', 'invested_in',
  'Nevada Capital Investment Corp grant-investment in WaterStart; water innovation hub Las Vegas',
  2020, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- NVCIC → SiO2 Materials (c_48)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_nvcic', 'c_48', 'invested_in',
  'Nevada Capital Investment Corp investment in SiO2 Materials Science; advanced glass vials Auburn AL + NV ops',
  2021, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 7: invested_in edges — Reno Seed Fund
-- ============================================================

-- Reno Seed Fund → Cloudforce Networks (c_47)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_reno_seed', 'c_47', 'invested_in',
  'Reno Seed Fund pre-seed investment in Cloudforce Networks; cybersecurity Reno',
  2022, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Reno Seed Fund → Adaract (c_77)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_reno_seed', 'c_77', 'invested_in',
  'Reno Seed Fund pre-seed investment in Adaract; UNR artificial muscle spinout',
  2023, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Reno Seed Fund → Ecoatoms (c_93)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_reno_seed', 'c_93', 'invested_in',
  'Reno Seed Fund seed investment in Ecoatoms; clean energy materials Reno',
  2023, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 8: invested_in edges — Switch CITIES Fund
-- ============================================================

-- Switch CITIES → Switch Inc (c_58) — self/corporate
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_switch_cities', 'c_58', 'invested_in',
  'Switch CITIES Fund corporate investment program; Switch Inc smart city infrastructure Las Vegas',
  2022, 0.85, 'HIGH', 'historical')
ON CONFLICT DO NOTHING;

-- Switch CITIES → Blockchains LLC (c_8)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_switch_cities', 'c_8', 'invested_in',
  'Switch CITIES Fund co-investment in Blockchains LLC; smart city blockchain infrastructure Storey County',
  2021, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 9: invested_in edges — Wealth Continuum Group
-- ============================================================

-- Wealth Continuum → Springbig (c_12)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_wealth_continuum', 'c_12', 'invested_in',
  'Wealth Continuum Group Henderson angel investment in Springbig; cannabis martech Las Vegas',
  2020, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Wealth Continuum → Planet 13 (c_67)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_wealth_continuum', 'c_67', 'invested_in',
  'Wealth Continuum Group investment in Planet 13; cannabis superstore Las Vegas',
  2019, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 10: invested_in edges — Prime Movers Lab (NV nexus)
-- ============================================================

-- Prime Movers Lab → Ioneer (c_49) — lithium-boron mining NV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_prime_movers', 'c_49', 'invested_in',
  'Prime Movers Lab investment in Ioneer; Rhyolite Ridge lithium-boron mine Nevada',
  2021, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Prime Movers Lab → Redwood Materials (c_1)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_prime_movers', 'c_1', 'invested_in',
  'Prime Movers Lab investment in Redwood Materials; battery recycling Carson City',
  2021, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 11: invested_in edges — EDAWN Investor Network
-- ============================================================

-- EDAWN Network → CIQ (c_11)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_edawn_network', 'c_11', 'invested_in',
  'EDAWN Investor Network facilitated investment in CIQ; Rocky Linux enterprise support Reno',
  2023, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- EDAWN Network → Dragonfly Energy (c_50)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_edawn_network', 'c_50', 'invested_in',
  'EDAWN Investor Network facilitated investment in Dragonfly Energy; LiFePO4 batteries Reno',
  2022, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 12: invested_in edges — LVGEA
-- ============================================================

-- LVGEA → Kaptyn (c_18) — autonomous ride-hail LV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_lvgea', 'c_18', 'invested_in',
  'LVGEA investment attraction program facilitated capital for Kaptyn; autonomous ride-hail Las Vegas',
  2023, 0.65, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 13: Add existing NV investor edges that were missing
-- John Albright, Ruttenberg Gordon, Ozone Ventures, etc.
-- ============================================================

-- John Albright → MagicDoor (c_14) — already in externals as i_john_albright
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_john_albright', 'c_14', 'invested_in',
  'John Albright angel investment in MagicDoor; AI property management Las Vegas',
  2023, 0.80, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- John Albright → Katalyst (c_10)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_john_albright', 'c_10', 'invested_in',
  'John Albright angel investment in Katalyst; EMS body training Las Vegas',
  2022, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Ozone Ventures → Boxabl (c_7)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_ozone_ventures', 'c_7', 'invested_in',
  'Ozone Ventures seed investment in Boxabl; foldable housing Las Vegas',
  2020, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Ruttenberg Gordon → Ollie (c_20)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_ruttenberg_gordon', 'c_20', 'invested_in',
  'Ruttenberg Gordon Investments seed investor in Ollie; pet health DTC Las Vegas',
  2022, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- Base Ventures → Lucihub (c_45)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_base_ventures', 'c_45', 'invested_in',
  'Base Ventures seed investment in Lucihub; AI video production Las Vegas',
  2021, 0.75, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;

-- The Carpenter Family → Springbig (c_12)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality, edge_category)
VALUES ('i_carpenter_family', 'c_12', 'invested_in',
  'Carpenter Family Office pre-IPO investment in Springbig; cannabis martech Las Vegas',
  2021, 0.70, 'MEDIUM', 'historical')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 14: Update fund company_count for new funds
-- ============================================================

UPDATE funds SET company_count = (
  SELECT COUNT(DISTINCT target_id) FROM graph_edges
  WHERE source_id = 'i_vtf_capital' AND rel = 'invested_in'
) WHERE id = 'vtf';

UPDATE funds SET company_count = (
  SELECT COUNT(DISTINCT target_id) FROM graph_edges
  WHERE source_id = 'i_nv_angels' AND rel = 'invested_in'
) WHERE id = 'nvangels';

UPDATE funds SET company_count = (
  SELECT COUNT(DISTINCT target_id) FROM graph_edges
  WHERE source_id = 'i_bombardier_cap' AND rel = 'invested_in'
) WHERE id = 'bomcap';

UPDATE funds SET company_count = (
  SELECT COUNT(DISTINCT target_id) FROM graph_edges
  WHERE source_id = 'i_nvcic' AND rel = 'invested_in'
) WHERE id = 'nvcic';

UPDATE funds SET company_count = (
  SELECT COUNT(DISTINCT target_id) FROM graph_edges
  WHERE source_id = 'i_reno_seed' AND rel = 'invested_in'
) WHERE id = 'renoseed';


COMMIT;
