-- Migration 082: Generate timeline_events from verified graph_edges for companies 49-64
--
-- Companies: Ioneer(49), Dragonfly Energy(50), Sierra Nevada Corp(51), Nevada Nano(52),
--   Duetto(53), GAN Limited(54), NEXGEL(55), WaterStart(56), Now Ads(57), Switch Inc(58),
--   Talentel(59), Elicio Therapeutics(60), Canyon Ranch(61), MiOrganics(62), BuildQ(63),
--   Nuvve Corp(64)
--
-- Mapping: invested_in->Funding, grants_to->Grant, acquired->Acquisition,
--   accelerated_by->Milestone, partners_with->Partnership, contracts_with->Partnership,
--   loaned_to->Funding, won_pitch->Award
--
-- event_date = MAKE_DATE(event_year, month, 15) with month staggering for same-type same-year
-- detail = note field from graph_edges (no invented information)
-- Idempotent: ON CONFLICT DO NOTHING
--
-- Run: PGPASSWORD=bbi_dev_password psql -h localhost -p 5433 -U bbi -d battlebornintel -f database/migrations/082_timeline_from_edges_batch4.sql

BEGIN;

-- ============================================================
-- Ioneer (c_49, id=49)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in edges (company is target) -> Funding
  ('2021-06-15', 'Funding', 'Ioneer', 'Sibanye-Stillwater 6% equity. JV withdrawn Feb 2025.', '💰', 49, 0.7, false),
  ('2022-06-15', 'Funding', 'Ioneer', 'BBV portfolio company', '💰', 49, 0.7, false),
  ('2023-06-15', 'Funding', 'Ioneer', 'DOE ATVM loan $996M Ioneer Jan 2025', '💰', 49, 0.7, false),
  -- loaned_to edge -> Funding (stagger to July since 2025 already has no Funding)
  ('2025-06-15', 'Funding', 'Ioneer', 'DOE $996M loan guarantee Jan 2025.', '💰', 49, 0.7, false),
  -- partners_with -> Partnership
  ('2024-06-15', 'Partnership', 'Ioneer', 'GOED supports Ioneer Rhyolite Ridge.', '🤝', 49, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Dragonfly Energy (c_50, id=50)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in edges -> Funding (3 in 2022, 1 in 2023: stagger months)
  ('2022-03-15', 'Funding', 'Dragonfly Energy', 'BBV portfolio company', '💰', 50, 0.7, false),
  ('2022-06-15', 'Funding', 'Dragonfly Energy', 'Thor Industries $15M strategic investment Jul 2022.', '💰', 50, 0.7, false),
  ('2022-09-15', 'Funding', 'Dragonfly Energy', 'Chardan NexTech SPAC merged with Dragonfly Oct 2022.', '💰', 50, 0.7, false),
  ('2023-06-15', 'Funding', 'Dragonfly Energy', 'Energy Impact Partners led $75M term loan.', '💰', 50, 0.7, false),
  -- partners_with -> Partnership
  ('2023-03-15', 'Partnership', 'Dragonfly Energy', 'LOI for lithium hydroxide supply', '🤝', 50, 0.7, false),
  ('2024-06-15', 'Partnership', 'Dragonfly Energy', 'Stryten Energy $30M licensing deal.', '🤝', 50, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Sierra Nevada Corp (c_51, id=51)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- contracts_with -> Partnership (4 contracts across years; 2004 has 1, 2020/2022/2023/2024 each 1)
  ('2020-06-15', 'Partnership', 'Sierra Nevada Corp', 'Unmanned Orbital Outpost space station 2020', '🤝', 51, 0.7, false),
  ('2022-06-15', 'Partnership', 'Sierra Nevada Corp', 'Dream Chaser spaceplane ISS cargo contract.', '🤝', 51, 0.7, false),
  ('2023-03-15', 'Partnership', 'Sierra Nevada Corp', 'Multi-billion defense & national security contractor.', '🤝', 51, 0.7, false),
  ('2024-06-15', 'Partnership', 'Sierra Nevada Corp', 'HADES surveillance aircraft $991.3M 2024', '🤝', 51, 0.7, false),
  -- invested_in -> Funding
  ('2023-06-15', 'Funding', 'Sierra Nevada Corp', 'Eren & Fatih Ozmen 100% owners since 1994.', '💰', 51, 0.7, false),
  -- partners_with -> Partnership (stagger: 2023 already has a Partnership at 03-15)
  ('2023-09-15', 'Partnership', 'Sierra Nevada Corp', 'Sierra Space + Blue Origin Orbital Reef partnership.', '🤝', 51, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Nevada Nano (c_52, id=52)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- contracts_with -> Partnership (2 in 2004: stagger months)
  ('2004-03-15', 'Partnership', 'Nevada Nano', 'DARPA sensor tech development 2004', '🤝', 52, 0.7, false),
  ('2004-06-15', 'Partnership', 'Nevada Nano', 'Department of Defense MPS sensor 2004', '🤝', 52, 0.7, false),
  -- invested_in -> Funding (1 in 2022, 2 in 2023: stagger 2023)
  ('2022-06-15', 'Funding', 'Nevada Nano', 'BBV portfolio company', '💰', 52, 0.7, false),
  ('2023-03-15', 'Funding', 'Nevada Nano', 'Honeywell Ventures Series C co-lead $30M 2023', '💰', 52, 0.7, false),
  ('2023-06-15', 'Funding', 'Nevada Nano', 'Emerson Ventures Series C co-lead $30M 2023', '💰', 52, 0.7, false),
  -- partners_with -> Partnership (2004 already has 2; 2023 has 1 from c_48)
  ('2004-09-15', 'Partnership', 'Nevada Nano', 'UNR MPS sensor tech commercialization 2004', '🤝', 52, 0.7, false),
  ('2023-09-15', 'Partnership', 'Nevada Nano', 'Both NV deep-tech materials/sensor companies.', '🤝', 52, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Duetto (c_53, id=53)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- acquired -> Acquisition
  ('2024-06-15', 'Acquisition', 'Duetto', 'Acquired Duetto Jun 2024', '🏢', 53, 0.7, false),
  -- invested_in -> Funding (2019, 2022, 2 in 2023, 1 in 2024: stagger)
  ('2019-06-15', 'Funding', 'Duetto', 'Led Duetto Series B $21M', '💰', 53, 0.7, false),
  ('2022-06-15', 'Funding', 'Duetto', 'BBV portfolio company', '💰', 53, 0.7, false),
  ('2023-03-15', 'Funding', 'Duetto', 'Led Duetto Series A $10M', '💰', 53, 0.7, false),
  ('2023-06-15', 'Funding', 'Duetto', 'Led Duetto Series D $80M', '💰', 53, 0.7, false),
  ('2024-03-15', 'Funding', 'Duetto', 'GrowthCurve Capital Duetto acquisition 2024', '💰', 53, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- GAN Limited (c_54, id=54)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- acquired -> Acquisition
  ('2025-06-15', 'Acquisition', 'GAN Limited', 'SEGA SAMMY acquired GAN May 2025.', '🏢', 54, 0.7, false),
  -- partners_with -> Partnership
  ('2023-06-15', 'Partnership', 'GAN Limited', 'Station Casinos GameSTACK partnership 2023', '🤝', 54, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- NEXGEL (c_55, id=55)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in -> Funding
  ('2022-06-15', 'Funding', 'NEXGEL', 'BBV portfolio company', '💰', 55, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- WaterStart (c_56, id=56)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- grants_to -> Grant
  ('2025-06-15', 'Grant', 'WaterStart', 'GOED $1.8M grant to WaterStart 2025.', '🏆', 56, 0.7, false),
  -- invested_in -> Funding
  ('2022-03-15', 'Funding', 'WaterStart', 'BBV portfolio company', '💰', 56, 0.7, false),
  -- partners_with -> Partnership (2013 has 3: stagger; 2022 has 2: stagger)
  ('2013-03-15', 'Partnership', 'WaterStart', 'Desert Research Institute WaterStart co-founder 2013', '🤝', 56, 0.7, false),
  ('2013-06-15', 'Partnership', 'WaterStart', 'Southern Nevada Water Authority partner 2013', '🤝', 56, 0.7, false),
  ('2013-09-15', 'Partnership', 'WaterStart', 'UNLV public-private partnership 2013', '🤝', 56, 0.7, false),
  ('2022-06-15', 'Partnership', 'WaterStart', 'GOED supports WaterStart.', '🤝', 56, 0.7, false),
  ('2022-09-15', 'Partnership', 'WaterStart', 'WaterStart partners with UNR.', '🤝', 56, 0.7, false),
  ('2023-06-15', 'Partnership', 'WaterStart', 'Water tech deployment', '🤝', 56, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Now Ads (c_57, id=57)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in -> Funding
  ('2023-06-15', 'Funding', 'Now Ads', 'FundNV investment in Now Ads.', '💰', 57, 0.7, false),
  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'Now Ads', 'Adams Hub company', '⭐', 57, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Switch Inc (c_58, id=58)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- acquired -> Acquisition
  ('2022-03-15', 'Acquisition', 'Switch Inc', 'DigitalBridge took Switch private 2022. $11B deal.', '🏢', 58, 0.7, false),
  -- invested_in -> Funding (2 in 2022: stagger; 1 in 2024)
  ('2022-06-15', 'Funding', 'Switch Inc', 'DigitalBridge take-private $11B with IFM 2022', '💰', 58, 0.7, false),
  ('2022-09-15', 'Funding', 'Switch Inc', 'IFM Investors take-private $11B with DigitalBridge 2022', '💰', 58, 0.7, false),
  ('2024-06-15', 'Funding', 'Switch Inc', 'Aware Super $500M investment 2024', '💰', 58, 0.7, false),
  -- partners_with -> Partnership (2014, 2021, 2023, 2026: each 1)
  ('2014-06-15', 'Partnership', 'Switch Inc', 'Intel Cherry Creek supercomputer partnership 2014', '🤝', 58, 0.7, false),
  ('2021-06-15', 'Partnership', 'Switch Inc', 'UNLV sports innovation supercomputer 2021', '🤝', 58, 0.7, false),
  ('2023-06-15', 'Partnership', 'Switch Inc', 'NV Energy provides power to Switch data centers.', '🤝', 58, 0.7, false),
  ('2026-06-15', 'Partnership', 'Switch Inc', 'Ormat 20-year PPA with Switch for 13MW geothermal.', '🤝', 58, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Talentel (c_59, id=59)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in -> Funding
  ('2023-06-15', 'Funding', 'Talentel', 'FundNV investment in Talentel.', '💰', 59, 0.7, false),
  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'Talentel', 'Adams Hub company', '⭐', 59, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Elicio Therapeutics (c_60, id=60)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- invested_in -> Funding (2019, 2022, 2023, 2025: each 1)
  ('2019-06-15', 'Funding', 'Elicio Therapeutics', 'Elicio Therapeutics Series B $33M Oct 2019.', '💰', 60, 0.7, false),
  ('2022-06-15', 'Funding', 'Elicio Therapeutics', 'BBV portfolio company', '💰', 60, 0.7, false),
  ('2023-06-15', 'Funding', 'Elicio Therapeutics', 'Elicio Series B.', '💰', 60, 0.7, false),
  ('2025-06-15', 'Funding', 'Elicio Therapeutics', 'GKCC LLC senior secured note $10M 2025', '💰', 60, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Canyon Ranch (c_61, id=61)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- acquired -> Acquisition
  ('2017-06-15', 'Acquisition', 'Canyon Ranch', 'John Goff acquired Canyon Ranch 2017.', '🏢', 61, 0.7, false),
  -- invested_in -> Funding (2 in 2023: stagger)
  ('2023-03-15', 'Funding', 'Canyon Ranch', 'VICI Properties $500M growth partnership.', '💰', 61, 0.7, false),
  ('2023-06-15', 'Funding', 'Canyon Ranch', 'Goff Capital co-investor founder John Goff 2023', '💰', 61, 0.7, false),
  -- partners_with -> Partnership (company as source)
  ('2023-09-15', 'Partnership', 'Canyon Ranch', 'Both premium NV wellness brands.', '🤝', 61, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- MiOrganics (c_62, id=62)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'MiOrganics', 'StartUpNV portfolio company.', '⭐', 62, 0.7, false),
  -- invested_in -> Funding (2 in 2023: stagger)
  ('2023-06-15', 'Funding', 'MiOrganics', '1864 Fund investment in MiOrganics.', '💰', 62, 0.7, false),
  ('2023-09-15', 'Funding', 'MiOrganics', 'FundNV investment in MiOrganics.', '💰', 62, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- BuildQ (c_63, id=63)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- accelerated_by -> Milestone
  ('2023-06-15', 'Milestone', 'BuildQ', 'StartUpNV portfolio company.', '⭐', 63, 0.7, false),
  -- contracts_with -> Partnership
  ('2025-03-15', 'Partnership', 'BuildQ', 'Battle Born Growth SSBCI match $200K 2025', '🤝', 63, 0.7, false),
  -- invested_in -> Funding (2 in 2023, 1 in 2024: stagger 2023)
  ('2023-03-15', 'Funding', 'BuildQ', 'FundNV investment in BuildQ.', '💰', 63, 0.7, false),
  ('2023-09-15', 'Funding', 'BuildQ', '1864 Fund investment in BuildQ.', '💰', 63, 0.7, false),
  ('2024-06-15', 'Funding', 'BuildQ', 'BBV portfolio — BuildQ', '💰', 63, 0.7, false),
  -- won_pitch -> Award (stagger: 2025 already has Partnership at 03-15)
  ('2025-06-15', 'Award', 'BuildQ', '2025 winner', '🏆', 63, 0.7, false),
  -- AccelerateNV note (different from the StartUpNV one, stagger to 2023-09 if needed)
  ('2023-12-15', 'Milestone', 'BuildQ', 'AccelerateNV + FundNV2 $200K', '⭐', 63, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Nuvve Corp (c_64, id=64)
-- ============================================================
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  -- acquired (SPAC merger) -> Acquisition
  ('2021-03-15', 'Acquisition', 'Nuvve Corp', 'SPAC merger Mar 2021.', '🏢', 64, 0.7, false),
  -- contracts_with -> Partnership
  ('2020-03-15', 'Partnership', 'Nuvve Corp', 'California Energy Commission $7.9M V2G 2020', '🤝', 64, 0.7, false),
  -- invested_in -> Funding (2 in 2017, 1 in 2021, 1 in 2022: stagger 2017)
  ('2017-03-15', 'Funding', 'Nuvve Corp', 'EDF Renewables. Nuvve Series A.', '💰', 64, 0.7, false),
  ('2017-06-15', 'Funding', 'Nuvve Corp', 'Toyota Tsusho. Nuvve Series A.', '💰', 64, 0.7, false),
  ('2021-06-15', 'Funding', 'Nuvve Corp', 'Nuvve NASDAQ NVVE PIPE $18M 2021', '💰', 64, 0.7, false),
  ('2022-06-15', 'Funding', 'Nuvve Corp', 'BBV portfolio company', '💰', 64, 0.7, false),
  -- partners_with -> Partnership (4 in 2020: stagger)
  ('2020-06-15', 'Partnership', 'Nuvve Corp', 'UCSD V2G demonstration $4.2M grant 2020', '🤝', 64, 0.7, false),
  ('2020-09-15', 'Partnership', 'Nuvve Corp', 'Nissan EV charging INVENT 2020', '🤝', 64, 0.7, false),
  ('2020-12-15', 'Partnership', 'Nuvve Corp', 'SDG&E power utility INVENT partner 2020', '🤝', 64, 0.7, false),
  ('2021-09-15', 'Partnership', 'Nuvve Corp', 'BMW INVENT project partner UC San Diego 2020', '🤝', 64, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

COMMIT;
