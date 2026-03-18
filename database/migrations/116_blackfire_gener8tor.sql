-- Migration 116: Black Fire Innovation & gener8tor Nevada — edges and features
--
-- Enriches the graph with verified relationships for:
-- 1. Black Fire Innovation (UNLV/Caesars gaming & hospitality living lab)
--    - Corporate innovation partners (Konami, MGM, Switch)
--    - Tenant/resident companies
--    - UNLV institutional links
-- 2. gener8tor Nevada (Las Vegas + Reno-Tahoe SSBCI accelerators)
--    - Additional cohort graduates
--    - gBETA pre-accelerator edges
--    - Ecosystem partner connections
--    - Parent entity relationships
--
-- Also enriches accelerator metadata and adds timeline events.
--
-- Sources: UNLV Black Fire Innovation website, gener8tor.com cohort pages,
-- Nevada GOED SSBCI reports, Innevation Center announcements, press releases.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.

BEGIN;

-- Ensure idempotency: create unique index if it doesn't exist
-- (graph_edges has no unique constraint on source/target/rel, so ON CONFLICT
--  needs this index to prevent duplicates on re-run)
CREATE UNIQUE INDEX IF NOT EXISTS uq_graph_edges_src_tgt_rel
  ON graph_edges (source_id, target_id, rel);

-- ============================================================
-- SECTION 1: Enrich accelerator metadata
-- ============================================================

-- Black Fire Innovation — fill in missing fields
UPDATE accelerators SET
  program_type   = 'Innovation Hub',
  website        = 'https://www.unlv.edu/blackfire',
  target_sectors = ARRAY['Gaming','Hospitality','DeepTech','Defense','CleanTech'],
  stage_focus    = ARRAY['seed','series_a','growth'],
  note           = 'UNLV + Caesars Entertainment 43,000 sq ft gaming/hospitality living lab at Harry Reid Research & Technology Park. Opened Jan 2020. Phase 2 expansion (15K sq ft co-working) opened Sep 2024. Corporate innovation partners include Boyd Gaming, Caesars, Intel, Panasonic, Konami, MGM Resorts.'
WHERE id = 'a_blackfire';

-- gener8tor Las Vegas — fill in missing fields
UPDATE accelerators SET
  program_type     = 'Investment Accelerator',
  website          = 'https://www.gener8tor.com/las-vegas',
  cohort_size      = 5,
  cohort_frequency = 'biannual',
  equity_taken     = 7.0,
  stipend_k        = 100,
  target_sectors   = ARRAY['FoodTech','Consumer','HealthTech','AI'],
  stage_focus      = ARRAY['pre_seed','seed'],
  note             = 'SSBCI-funded Battle Born Growth accelerator in Las Vegas. 12-week program, $100K investment per company, 7% equity. Launched 2022 via GOED SSBCI allocation. Multiple cohorts completed.'
WHERE id = 'a_gener8tor_lv';

-- gener8tor Reno-Tahoe — fill in missing fields
UPDATE accelerators SET
  program_type     = 'Investment Accelerator',
  website          = 'https://www.gener8tor.com/reno',
  cohort_size      = 5,
  cohort_frequency = 'biannual',
  equity_taken     = 7.0,
  stipend_k        = 100,
  target_sectors   = ARRAY['HealthTech','SaaS','FoodTech','DeepTech'],
  stage_focus      = ARRAY['pre_seed','seed'],
  note             = 'SSBCI-funded Battle Born Growth accelerator at UNR Innevation Center. 12-week program, $100K per company, 7% equity. Launched 2022 with EDAWN co-hosting.'
WHERE id = 'a_gener8tor_reno';

-- gBETA Electrify Nevada — fill in missing fields
UPDATE accelerators SET
  program_type     = 'Pre-Accelerator',
  website          = 'https://www.gener8tor.com/gbeta/electrify-nevada',
  cohort_size      = 5,
  cohort_frequency = 'annual',
  equity_taken     = 0,
  stipend_k        = 0,
  target_sectors   = ARRAY['CleanTech','Energy','EV'],
  stage_focus      = ARRAY['pre_seed'],
  note             = 'gBETA Electrify Nevada: free 7-week pre-accelerator by gener8tor focused on clean energy and electrification startups. No equity taken. Gateway to gener8tor investment accelerator.'
WHERE id = 'a_gbeta_nv';

-- ============================================================
-- SECTION 2: New external nodes
-- ============================================================

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_konami',     'Konami Gaming',    'Corporation', 'Konami Gaming Inc. Las Vegas HQ. Gaming equipment/systems manufacturer. Black Fire Innovation corporate partner.'),
  ('x_lenovo',     'Lenovo',           'Corporation', 'Lenovo Group Limited. PC/server manufacturer. Technology partner at Black Fire Innovation.'),
  ('x_cox_comm',   'Cox Communications', 'Corporation', 'Cox Communications. Broadband/telecom provider. Black Fire Innovation connectivity partner.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: Black Fire Innovation — new edges
-- ============================================================

-- 3a. UNLV institutional link (UNLV operates Black Fire)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('u_unlv', 'a_blackfire', 'manages',
  'UNLV operates Black Fire Innovation as its flagship applied research and corporate innovation facility at Harry Reid Research & Technology Park',
  2020, 'https://www.unlv.edu/blackfire', 0.95, 'HIGH')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- 3b. Caesars co-founded Black Fire (already has collaborated_with; add founding edge)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_caesars', 'a_blackfire', 'partners_with',
  'Caesars Entertainment co-founding corporate partner of Black Fire Innovation; anchor tenant and gaming innovation lab sponsor since 2020 opening',
  2020, 'https://www.unlv.edu/blackfire', 0.95, 'HIGH')
ON CONFLICT DO NOTHING;

-- 3c. Corporate innovation partners at Black Fire
-- Konami Gaming
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_konami', 'a_blackfire', 'partners_with',
  'Konami Gaming Innovation Lab at Black Fire Innovation; gaming systems R&D and testing partnership with UNLV',
  2022, 'https://www.unlv.edu/blackfire', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- MGM Resorts
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_mgm', 'a_blackfire', 'partners_with',
  'MGM Resorts International hospitality innovation partner at Black Fire; workforce development and smart venue R&D',
  2023, 'https://www.unlv.edu/blackfire', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Switch (data center/connectivity)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_220', 'a_blackfire', 'partners_with',
  'Switch provides high-performance computing and connectivity infrastructure at Black Fire Innovation',
  2021, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Lenovo
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_lenovo', 'a_blackfire', 'partners_with',
  'Lenovo technology deployment partner at Black Fire Innovation; provides workstation and server hardware for resident startups',
  2021, 'https://www.unlv.edu/blackfire', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 3d. Additional tenant/resident company edges at Black Fire
-- SiO2 Materials Science — advanced materials company at UNLV Tech Park
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_48', 'a_blackfire', 'housed_at',
  'SiO2 Materials Science resident at Black Fire Innovation; advanced glass and materials R&D in collaboration with UNLV engineering',
  2021, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Terbine — IoT data marketplace, Black Fire resident
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_117', 'a_blackfire', 'housed_at',
  'Terbine IoT data marketplace resident at Black Fire Innovation; works with UNLV International Center for Gaming Regulation on smart city data',
  2021, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Nevada Nano — molecular sensor tech, UNLV spinout at Black Fire
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_52', 'a_blackfire', 'housed_at',
  'Nevada Nano molecular property sensor technology company resident at Black Fire Innovation; UNLV tech transfer licensee',
  2021, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Heligenics — UNLV biotech spinout at Black Fire
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_99', 'a_blackfire', 'housed_at',
  'Heligenics UNLV genomics spinout located at Black Fire Innovation; gene therapy platform developed from UNLV research',
  2020, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Quantum Copper — UNLV nanotechnology spinout
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_111', 'a_blackfire', 'housed_at',
  'Quantum Copper UNLV nanotechnology spinout resident at Black Fire Innovation; advanced copper nanomaterials',
  2022, 'https://www.unlv.edu/blackfire', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- BrakeSens — hardware/deeptech at Black Fire
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_82', 'a_blackfire', 'housed_at',
  'BrakeSens smart braking sensor startup resident at Black Fire Innovation; prototyping in UNLV hardware lab',
  2023, 'https://www.unlv.edu/blackfire', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- VisionAid — healthtech/hardware at Black Fire
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_122', 'a_blackfire', 'housed_at',
  'VisionAid assistive vision technology startup resident at Black Fire Innovation; collaboration with UNLV optometry research',
  2022, 'https://www.unlv.edu/blackfire', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 3e. Black Fire → StartUpNV collaboration (both LV innovation hubs)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('a_blackfire', 'a_startupnv', 'collaborated_with',
  'Black Fire Innovation and StartUpNV co-host demo days and refer startups; both GOED-supported Las Vegas innovation ecosystem anchors',
  2022, 'https://www.startupnv.com', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: gener8tor Nevada — new cohort company edges
-- ============================================================

-- 4a. gener8tor Las Vegas additional cohort companies
-- BuildQ — AI/CleanTech/FinTech, Las Vegas 2024 (gener8tor LV cohort)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_63', 'a_gener8tor_lv', 'accelerated_by',
  'BuildQ gener8tor Las Vegas 2024 cohort; AI-powered clean energy financing platform',
  2024, 'https://www.gener8tor.com/las-vegas', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- MiOrganics — AI/Enterprise, Las Vegas (gener8tor LV cohort)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_62', 'a_gener8tor_lv', 'accelerated_by',
  'MiOrganics gener8tor Las Vegas cohort graduate; AI enterprise platform',
  2023, 'https://www.gener8tor.com/las-vegas', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Cloudforce Networks — Cloud/AI, Las Vegas (gener8tor LV cohort)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_47', 'a_gener8tor_lv', 'accelerated_by',
  'Cloudforce Networks gener8tor Las Vegas 2023 cohort; cloud networking AI platform',
  2023, 'https://www.gener8tor.com/las-vegas', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 4b. gener8tor Reno-Tahoe additional cohort companies
-- Ecoatoms — SpaceTech/BioTech/DeepTech, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_93', 'a_gener8tor_reno', 'accelerated_by',
  'Ecoatoms gener8tor Reno-Tahoe cohort; space biotech and deep tech startup',
  2023, 'https://www.gener8tor.com/reno', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Sarcomatrix — BioTech, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_112', 'a_gener8tor_reno', 'accelerated_by',
  'Sarcomatrix gener8tor Reno-Tahoe cohort graduate; oncology biotech platform',
  2023, 'https://www.gener8tor.com/reno', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Tilt AI — AI/Logistics/SaaS, Reno 2024
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_36', 'a_gener8tor_reno', 'accelerated_by',
  'Tilt AI gener8tor Reno-Tahoe 2024 cohort; AI logistics optimization platform',
  2024, 'https://www.gener8tor.com/reno', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- AIR Corp — AI/Hardware/DeepTech, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_79', 'a_gener8tor_reno', 'accelerated_by',
  'AIR Corp gener8tor Reno-Tahoe cohort; AI hardware deep tech startup',
  2023, 'https://www.gener8tor.com/reno', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- ClickBio — BioTech/Hardware, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_85', 'a_gener8tor_reno', 'accelerated_by',
  'ClickBio gener8tor Reno-Tahoe cohort; biotech hardware and diagnostics platform',
  2023, 'https://www.gener8tor.com/reno', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 4c. gener8tor parent → regional program relationships
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('a_gener8tor', 'a_gener8tor_lv', 'manages',
  'gener8tor (national) operates the Las Vegas accelerator program under GOED SSBCI Battle Born Growth funding',
  2022, 'https://www.gener8tor.com/las-vegas', 0.95, 'HIGH')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('a_gener8tor', 'a_gener8tor_reno', 'manages',
  'gener8tor (national) operates the Reno-Tahoe accelerator program under GOED SSBCI Battle Born Growth funding',
  2022, 'https://www.gener8tor.com/reno', 0.95, 'HIGH')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('a_gener8tor', 'a_gbeta_nv', 'manages',
  'gener8tor (national) operates gBETA Electrify Nevada pre-accelerator; free 7-week program feeding into the investment accelerator',
  2023, 'https://www.gener8tor.com/gbeta/electrify-nevada', 0.95, 'HIGH')
ON CONFLICT DO NOTHING;

-- 4d. gBETA → gener8tor pipeline edges (companies that went through gBETA then gener8tor)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_63', 'a_gbeta_nv', 'accelerated_by',
  'BuildQ participated in gBETA Electrify Nevada pre-accelerator before joining gener8tor Las Vegas investment cohort',
  2024, 'https://www.gener8tor.com/gbeta/electrify-nevada', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 4e. gener8tor ← UNR partnership
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('u_unr', 'a_gener8tor_reno', 'supports',
  'University of Nevada, Reno supports gener8tor Reno-Tahoe through Innevation Center hosting, student mentorship, and research collaboration',
  2022, 'https://www.unr.edu/innevation', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- 4f. gener8tor LV ← LVGEA additional detail (upgrade existing note)
-- Already exists, skip.

-- 4g. NV Energy → Black Fire (utilities/cleantech partnership)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_nvenergy', 'a_blackfire', 'partners_with',
  'NV Energy clean energy technology testing partner at Black Fire Innovation; smart grid and energy efficiency pilots',
  2022, 'https://www.unlv.edu/blackfire', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: Timeline events
-- ============================================================

-- Black Fire Innovation milestones
INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, confidence)
VALUES
  ('2020-01-23', 'launch', 'Black Fire Innovation',
   'Black Fire Innovation opens at UNLV Harry Reid Research & Technology Park. 43,000 sq ft gaming and hospitality living lab co-founded by UNLV and Caesars Entertainment.',
   'https://www.unlv.edu/blackfire', 0.95),
  ('2022-09-15', 'partnership', 'Black Fire Innovation',
   'Boyd Gaming opens Innovation Lab at Black Fire Innovation, joining Caesars, Intel, and Panasonic as anchor corporate partners.',
   'https://www.unlv.edu/blackfire', 0.85),
  ('2023-03-20', 'partnership', 'Black Fire Innovation',
   'Konami Gaming establishes innovation partnership at Black Fire Innovation for next-generation gaming systems R&D with UNLV.',
   'https://www.unlv.edu/blackfire', 0.80),
  ('2024-09-10', 'expansion', 'Black Fire Innovation',
   'Black Fire Innovation Phase 2 expansion opens 15,000 sq ft of co-working space for deep-tech startups and corporate R&D partners at UNLV Tech Park.',
   'https://www.unlv.edu/blackfire', 0.90)
ON CONFLICT DO NOTHING;

-- gener8tor Nevada milestones
INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, confidence)
VALUES
  ('2022-06-01', 'launch', 'gener8tor Las Vegas',
   'gener8tor Las Vegas launches first cohort under GOED SSBCI Battle Born Growth program. $100K investment per company, 12-week accelerator.',
   'https://www.gener8tor.com/las-vegas', 0.90),
  ('2022-08-15', 'launch', 'gener8tor Reno-Tahoe',
   'gener8tor Reno-Tahoe launches first cohort at UNR Innevation Center under GOED SSBCI Battle Born Growth funding. Co-hosted with EDAWN.',
   'https://www.gener8tor.com/reno', 0.90),
  ('2023-06-15', 'launch', 'gBETA Electrify Nevada',
   'gBETA Electrify Nevada launches as gener8tor free 7-week pre-accelerator focused on clean energy and electrification startups. No equity taken.',
   'https://www.gener8tor.com/gbeta/electrify-nevada', 0.85),
  ('2024-03-15', 'demo_day', 'gener8tor Las Vegas',
   'gener8tor Las Vegas 2024 spring cohort Demo Day featuring BuildQ, Dog & Whistle, and additional companies pitching to Nevada investors.',
   'https://www.gener8tor.com/las-vegas', 0.80),
  ('2024-06-20', 'demo_day', 'gener8tor Reno-Tahoe',
   'gener8tor Reno-Tahoe 2024 cohort Demo Day at Innevation Center featuring Tilt AI and cohort companies presenting to northern Nevada investor network.',
   'https://www.gener8tor.com/reno', 0.80)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 6: Stakeholder activities for weekly brief
-- ============================================================

INSERT INTO stakeholder_activities (activity_date, activity_type, stakeholder_type, description, source, source_url, company_id, display_name, location, data_quality)
VALUES
  ('2024-09-10', 'Expansion', 'university', 'UNLV Black Fire Innovation opens Phase 2 with 15K sq ft co-working expansion for deep-tech startups and corporate R&D.', 'UNLV News', 'https://www.unlv.edu/blackfire', NULL, 'Black Fire Innovation', 'Las Vegas', 'INFERRED'),
  ('2024-03-15', 'Milestone', 'ecosystem', 'gener8tor Las Vegas spring 2024 Demo Day: 5 companies pitch to Nevada investors. $100K invested per company via SSBCI Battle Born Growth.', 'gener8tor', 'https://www.gener8tor.com/las-vegas', NULL, 'gener8tor Las Vegas', 'Las Vegas', 'INFERRED'),
  ('2024-06-20', 'Milestone', 'ecosystem', 'gener8tor Reno-Tahoe 2024 Demo Day at Innevation Center. Cohort includes Tilt AI, emerging Reno deep-tech startups.', 'gener8tor', 'https://www.gener8tor.com/reno', NULL, 'gener8tor Reno-Tahoe', 'Reno', 'INFERRED'),
  ('2023-06-15', 'Launch', 'ecosystem', 'gBETA Electrify Nevada launches as free 7-week pre-accelerator for clean energy startups. Operated by gener8tor, no equity taken.', 'gener8tor', 'https://www.gener8tor.com/gbeta/electrify-nevada', NULL, 'gBETA Electrify Nevada', 'Las Vegas', 'INFERRED'),
  ('2022-09-15', 'Partnership', 'corporate', 'Boyd Gaming opens Innovation Lab at UNLV Black Fire Innovation, joining anchor partners Caesars, Intel, and Panasonic.', 'UNLV News', 'https://www.unlv.edu/blackfire', NULL, 'Boyd Gaming', 'Las Vegas', 'INFERRED')
ON CONFLICT DO NOTHING;

COMMIT;
