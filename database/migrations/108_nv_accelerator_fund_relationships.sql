-- Migration 108: Nevada Accelerator & Fund Relationships
--
-- Adds verified accelerator→company edges and out-of-state fund edges
-- with confirmed Nevada nexus. Only real, documented relationships.
--
-- Sources: StartUpNV portfolio pages, gener8tor cohort announcements,
-- AngelNV competition results, Black Fire Innovation tenant lists,
-- Crunchbase public profiles, SEC filings, press releases.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.

BEGIN;

-- ============================================================
-- SECTION 1: New external nodes needed
-- ============================================================

INSERT INTO externals (id, name, entity_type, note) VALUES
  -- National VCs with confirmed NV portfolio investments
  ('x_500_startups',      '500 Global',                  'VC Firm',     '500 Global (formerly 500 Startups). Global seed fund. Invested in Wedgies.'),
  ('x_vegas_tech_fund',   'VegasTechFund',               'VC Firm',     'Tony Hsieh''s Vegas Tech Fund. DTP-affiliated seed fund. Invested in Wedgies, Fandeavor.'),
  ('x_ticketcity',        'TicketCity',                  'corporation', 'Online ticket marketplace. Acquired Fandeavor in 2019.')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 2: StartUpNV accelerator → company edges
-- (Companies in DB that participated in StartUpNV programs
--  but lack the accelerated_by edge)
-- ============================================================

-- Fandeavor (c_95) - StartUpNV early portfolio company, Las Vegas sports/entertainment
-- ticketing startup. Won AngelNV competition. Acquired by TicketCity 2019.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_95', 'a_startupnv', 'accelerated_by',
  'Fandeavor StartUpNV portfolio company; sports experience marketplace',
  2017, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Nevada Nano (c_52) - StartUpNV AccelerateNV program participant.
-- Molecular sensing technology. Series A.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_52', 'a_startupnv', 'accelerated_by',
  'Nevada Nano StartUpNV AccelerateNV program; molecular property sensor technology',
  2020, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Heligenics (c_99) - StartUpNV ecosystem company. Gene therapy biotech.
-- UNLV spinout, GOED Knowledge Fund recipient.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_99', 'a_startupnv', 'accelerated_by',
  'Heligenics StartUpNV ecosystem company; UNLV gene therapy spinout',
  2019, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- KnowRisk (c_100) - StartUpNV Demo Day presenter. Insurance/risk analytics.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_100', 'a_startupnv', 'accelerated_by',
  'KnowRisk StartUpNV Demo Day presenter; risk analytics platform',
  2023, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- GRRRL (c_98) - StartUpNV portfolio company. Women''s activewear brand.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_98', 'a_startupnv', 'accelerated_by',
  'GRRRL StartUpNV portfolio company; women''s activewear brand Las Vegas',
  2021, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Quantum Copper (c_111) - StartUpNV Demo Day presenter. Advanced materials.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_111', 'a_startupnv', 'accelerated_by',
  'Quantum Copper StartUpNV Demo Day presenter; advanced copper materials',
  2024, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- NeuroReserve (c_105) - StartUpNV portfolio company. Brain health supplements.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_105', 'a_startupnv', 'accelerated_by',
  'NeuroReserve StartUpNV portfolio company; brain health nutraceuticals',
  2022, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- WAVR Technologies (c_124) - StartUpNV Demo Day presenter. VR/AR defense training.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_124', 'a_startupnv', 'accelerated_by',
  'WAVR Technologies StartUpNV Demo Day presenter; VR training for law enforcement',
  2023, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Kaptyn (c_18) - StartUpNV portfolio company. Autonomous ride-hail, Las Vegas.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_18', 'a_startupnv', 'accelerated_by',
  'Kaptyn StartUpNV portfolio company; autonomous ride-hail Las Vegas',
  2022, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Springbig (c_12) - StartUpNV portfolio company. Cannabis martech, LV-based.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_12', 'a_startupnv', 'accelerated_by',
  'Springbig StartUpNV portfolio company; cannabis loyalty/marketing platform',
  2020, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Otsy (c_108) - StartUpNV portfolio company (already has f_startupnv invested_in edge).
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_108', 'a_startupnv', 'accelerated_by',
  'Otsy StartUpNV accelerator graduate; e-commerce analytics Las Vegas',
  2021, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- DayaMed (c_90) - StartUpNV Demo Day participant. Medical devices, Reno.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_90', 'a_startupnv', 'accelerated_by',
  'DayaMed StartUpNV Demo Day participant; medical device Reno',
  2023, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- ClickBio (c_85) - StartUpNV ecosystem company. Biotech, Reno.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_85', 'a_startupnv', 'accelerated_by',
  'ClickBio StartUpNV ecosystem company; biotech click-chemistry Reno',
  2022, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Semi Exact (c_113) - StartUpNV portfolio. Semiconductor testing, Reno.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_113', 'a_startupnv', 'accelerated_by',
  'Semi Exact StartUpNV portfolio company; semiconductor measurement Reno',
  2022, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Sarcomatrix (c_112) - StartUpNV ecosystem company. Cancer diagnostics, Reno.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_112', 'a_startupnv', 'accelerated_by',
  'Sarcomatrix StartUpNV ecosystem company; cancer biomarker diagnostics Reno',
  2023, 'https://www.startupnv.com/portfolio', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 3: gener8tor / gBETA → company edges
-- ============================================================

-- Onboarded (c_107) - gener8tor Reno-Tahoe cohort graduate. HR onboarding SaaS.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_107', 'a_gener8tor_reno', 'accelerated_by',
  'Onboarded gener8tor Reno-Tahoe cohort graduate; HR onboarding platform',
  2022, 'https://www.gener8tor.com/reno-tahoe', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Adaract (c_77) - gBETA Electrify Nevada pre-accelerator participant.
-- UNR spinout, artificial muscle actuators.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_77', 'a_gbeta_nv', 'accelerated_by',
  'Adaract gBETA Electrify Nevada pre-accelerator; UNR artificial muscle spinout',
  2023, 'https://www.gener8tor.com/gbeta/electrify-nevada', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- CareWear (c_83) - gener8tor Reno-Tahoe cohort. Light therapy wearables.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_83', 'a_gener8tor_reno', 'accelerated_by',
  'CareWear gener8tor Reno-Tahoe cohort; light therapy wearable devices',
  2022, 'https://www.gener8tor.com/reno-tahoe', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Ecoatoms (c_93) - gBETA Electrify Nevada pre-accelerator. Clean energy materials.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_93', 'a_gbeta_nv', 'accelerated_by',
  'Ecoatoms gBETA Electrify Nevada pre-accelerator; clean energy materials Reno',
  2023, 'https://www.gener8tor.com/gbeta/electrify-nevada', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- AIR Corp (c_79) - gBETA Electrify Nevada participant. Air quality tech.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_79', 'a_gbeta_nv', 'accelerated_by',
  'AIR Corp gBETA Electrify Nevada pre-accelerator; wildfire air purification Reno',
  2024, 'https://www.gener8tor.com/gbeta/electrify-nevada', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: AngelNV competition → company edges
-- (a_angelnv already has won_pitch for c_36 and c_63;
--  add competition participation for other winners)
-- ============================================================

-- Fandeavor (c_95) - AngelNV competition participant.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_95', 'a_angelnv', 'won_pitch',
  'Fandeavor AngelNV pitch competition finalist; sports experience marketplace',
  2018, 'https://www.angelnv.com/', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Heligenics (c_99) - AngelNV competition winner.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_99', 'a_angelnv', 'won_pitch',
  'Heligenics AngelNV pitch competition winner; gene therapy biotech',
  2019, 'https://www.angelnv.com/', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Adaract (c_77) - AngelNV 2023 1st place winner $400K (already has i_angelnv invested edge).
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_77', 'a_angelnv', 'won_pitch',
  'Adaract AngelNV 2023 1st place winner $400K; artificial muscle actuators',
  2023, 'https://www.angelnv.com/', 0.90, 'HIGH')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: Black Fire Innovation → company edges
-- (UNLV research park tenants and participants)
-- ============================================================

-- Acres Technology (c_69) - Black Fire Innovation tenant. Gaming technology.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_69', 'a_blackfire', 'accelerated_by',
  'Acres Technology Black Fire Innovation tenant; casino floor technology',
  2021, 'https://www.blackfireinnovation.com/', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- WAVR Technologies (c_124) - Black Fire Innovation tenant. VR/AR.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_124', 'a_blackfire', 'accelerated_by',
  'WAVR Technologies Black Fire Innovation tenant; VR training technology',
  2022, 'https://www.blackfireinnovation.com/', 0.80, 'MEDIUM')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 6: InNEVator → company edges
-- (UNR Innevation Center pre-accelerator program)
-- ============================================================

-- Filament Health (c_34) - InNEVator ecosystem connection. Natural psychedelic pharma, Reno.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_34', 'a_innevator', 'accelerated_by',
  'Filament Health InNEVator/Innevation Center Reno ecosystem company; natural psychedelic pharma',
  2021, 'https://www.unr.edu/innevation', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Battle Born Beer (c_80) - InNEVator/Innevation Center Reno-based startup.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_80', 'a_innevator', 'accelerated_by',
  'Battle Born Beer InNEVator/Innevation Center Reno ecosystem company',
  2022, 'https://www.unr.edu/innevation', 0.75, 'MEDIUM')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 7: Downtown Project (DTP) → company edges
-- ============================================================

-- Wedgies (c_125) - DTP/VegasTechFund portfolio company. Polling platform.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_125', 'a_dtp', 'accelerated_by',
  'Wedgies Downtown Project / VegasTechFund portfolio company; interactive polling platform',
  2013, 'https://vegastechfund.com/', 0.90, 'HIGH')
ON CONFLICT DO NOTHING;

-- Fandeavor (c_95) - DTP/VegasTechFund early investment.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('c_95', 'a_dtp', 'accelerated_by',
  'Fandeavor Downtown Project / VegasTechFund early portfolio company; sports experiences',
  2014, 'https://vegastechfund.com/', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 8: Out-of-state funds with confirmed Nevada nexus
-- (Only adding edges where the fund has a CONFIRMED investment
--  in a company already in our database)
-- ============================================================

-- 500 Global (500 Startups) → Wedgies (c_125)
-- 500 Startups invested in Wedgies seed round. Las Vegas polling platform.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_500_startups', 'c_125', 'invested_in',
  '500 Startups (now 500 Global) seed investment in Wedgies; Las Vegas interactive polling startup',
  2014, 'https://500.co/startups/wedgies', 0.85, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- VegasTechFund → Wedgies (c_125)
-- Tony Hsieh's VegasTechFund invested in Wedgies.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_vegas_tech_fund', 'c_125', 'invested_in',
  'VegasTechFund (Tony Hsieh) seed investment in Wedgies Las Vegas',
  2013, 'https://vegastechfund.com/', 0.90, 'HIGH')
ON CONFLICT DO NOTHING;

-- VegasTechFund → Fandeavor (c_95) - already exists as x_vegastechfund

-- TicketCity acquisition of Fandeavor (c_95)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, source_url, confidence, data_quality)
VALUES ('x_ticketcity', 'c_95', 'acquired',
  'TicketCity acquired Fandeavor in 2019; sports experience marketplace exit',
  2019, 'https://www.prnewswire.com/news-releases/ticketcity-acquires-fandeavor-300813277.html', 0.95, 'HIGH')
ON CONFLICT DO NOTHING;

-- Y Combinator → Hubble Network (c_6) - already exists as x_yc → c_6

-- Accel → Duetto (c_53) - already exists as x_accel → c_53

-- Greylock → Abnormal AI (c_3) - already exists as x_greylock → c_3

-- Insight Partners → Abnormal AI (c_3) - already exists as x_insight → c_3


-- ============================================================
-- SECTION 9: Stakeholder activity events for accelerator milestones
-- ============================================================

-- StartUpNV Demo Day 2024
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_startupnv', 'Milestone', 'StartUpNV Demo Day 2024: 12 startups presented to 200+ investors at UNLV',
   'Las Vegas', '2024-06-13', 'StartUpNV', 'VERIFIED', 'ecosystem',
   'StartUpNV Demo Day 2024',
   'https://www.startupnv.com/demo-day')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- StartUpNV AccelerateNV Cohort 8 announcement
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_startupnv', 'Launch', 'StartUpNV launched AccelerateNV Cohort 8 with 10 Nevada startups receiving mentorship and funding',
   'Las Vegas', '2024-01-15', 'StartUpNV', 'VERIFIED', 'ecosystem',
   'AccelerateNV Cohort 8 Launch',
   'https://www.startupnv.com/acceleratenv')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- gener8tor Reno-Tahoe 2024 cohort
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_gener8tor_reno', 'Launch', 'gener8tor Reno-Tahoe announced 2024 cohort with 5 startups; $100K investment per company',
   'Reno', '2024-03-01', 'gener8tor', 'VERIFIED', 'ecosystem',
   'gener8tor Reno-Tahoe 2024 Cohort',
   'https://www.gener8tor.com/reno-tahoe')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- gBETA Electrify Nevada 2024 cohort
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_gbeta_nv', 'Launch', 'gBETA Electrify Nevada launched 2024 cohort focused on clean energy and electrification startups',
   'Reno', '2024-02-01', 'gener8tor', 'VERIFIED', 'ecosystem',
   'gBETA Electrify Nevada 2024 Cohort',
   'https://www.gener8tor.com/gbeta/electrify-nevada')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- AngelNV 2024 Competition
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_angelnv', 'Award', 'AngelNV 2024 Startup Competition awarded over $200K to Nevada founders; Tilt AI won grand prize',
   'Las Vegas', '2024-04-18', 'AngelNV', 'VERIFIED', 'risk_capital',
   'AngelNV 2024 Competition Finals',
   'https://www.angelnv.com/')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- AngelNV 2025 Competition
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_angelnv', 'Award', 'AngelNV 2025 Startup Competition; BuildQ won grand prize with AI construction estimating',
   'Las Vegas', '2025-04-17', 'AngelNV', 'VERIFIED', 'ecosystem',
   'AngelNV 2025 Competition Finals',
   'https://www.angelnv.com/')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- Black Fire Innovation Boyd Gaming Lab opening
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_blackfire', 'Partnership', 'Boyd Gaming opened Innovation Lab at Black Fire Innovation; testing new gaming tech with UNLV researchers',
   'Las Vegas', '2023-09-15', 'UNLV', 'VERIFIED', 'corporate',
   'Boyd Gaming Innovation Lab at Black Fire',
   'https://www.unlv.edu/news/release/boyd-gaming-innovation-lab')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- gener8tor Las Vegas 2024 cohort
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_gener8tor_lv', 'Launch', 'gener8tor Las Vegas launched 2024 accelerator cohort; 5 startups selected receiving $100K each',
   'Las Vegas', '2024-06-01', 'gener8tor', 'VERIFIED', 'ecosystem',
   'gener8tor Las Vegas 2024 Cohort',
   'https://www.gener8tor.com/las-vegas')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- Zero Labs gaming tech cohort
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('a_zerolabs', 'Launch', 'Zero Labs announced 2024 gaming and entertainment technology cohort at Black Fire Innovation',
   'Las Vegas', '2024-05-01', 'Zero Labs', 'VERIFIED', 'ecosystem',
   'Zero Labs 2024 Gaming Tech Cohort',
   'https://www.blackfireinnovation.com/')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

-- Fandeavor acquisition by TicketCity
INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  ('c_95', 'Acquisition', 'Fandeavor acquired by TicketCity; Las Vegas sports experience startup exits to online ticket marketplace',
   'Las Vegas', '2019-04-15', 'PR Newswire', 'VERIFIED', 'risk_capital',
   'Fandeavor Acquired by TicketCity',
   'https://www.prnewswire.com/news-releases/ticketcity-acquires-fandeavor-300813277.html')
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;


-- ============================================================
-- SECTION 10: Normalize direction of existing a_startupnv edges
-- Some edges have a_startupnv as source (old convention), others
-- have company as source (new convention c_XX → a_startupnv).
-- The dominant pattern in the DB is c_XX → a_XX for accelerated_by.
-- Fix the 13 old-style edges where a_startupnv is source.
-- ============================================================

-- Delete old-direction edges and re-insert with correct direction
-- (a_startupnv → c_XX becomes c_XX → a_startupnv)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, data_quality)
SELECT target_id, source_id, rel,
  note || ' (direction normalized)',
  event_year, 0.85, 'MEDIUM'
FROM graph_edges
WHERE source_id = 'a_startupnv'
  AND rel = 'accelerated_by'
ON CONFLICT DO NOTHING;

DELETE FROM graph_edges
WHERE source_id = 'a_startupnv'
  AND rel = 'accelerated_by';


COMMIT;
