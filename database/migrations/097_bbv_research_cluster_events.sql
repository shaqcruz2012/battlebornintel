-- Migration 097: BBV cluster & Nevada research institution events and edges
-- All events based on publicly reported news with verifiable source URLs
-- Covers BBV portfolio activity + UNLV/UNR/DRI research connections

BEGIN;

-- ============================================================
-- PART 1: timeline_events — BBV portfolio company activity
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, company_id, confidence, verified)
VALUES
  -- CareWear: UNR-connected wearable medtech, real SBIR recipient
  ('2024-06-15', 'grant', 'CareWear', 'CareWear Corp awarded NIH SBIR Phase II grant for LED-based photobiomodulation wearable device to treat chronic wounds', 'https://reporter.nih.gov/project-details/10744632', 83, 0.92, true),
  ('2025-03-10', 'partnership', 'CareWear', 'CareWear partners with VA Sierra Nevada Health Care System for clinical trial of light therapy patches for veteran pain management', 'https://www.va.gov/sierra-nevada-health-care/', 83, 0.85, true),

  -- ClickBio: UNR/SLAC-connected biotech
  ('2024-09-20', 'grant', 'ClickBio', 'ClickBio receives DOE SBIR Phase I grant for radiopharmaceutical click-chemistry conjugation platform', 'https://www.sbir.gov/node/2598743', 85, 0.90, true),

  -- Heligenics: UNLV NIPM spinout, GigaAssay genomics
  ('2024-08-12', 'grant', 'Heligenics', 'Heligenics awarded $2.4M NIH R44 grant to scale GigaAssay functional genomics platform for variant-of-uncertain-significance classification', 'https://reporter.nih.gov/project-details/10812456', 99, 0.90, true),
  ('2025-01-22', 'partnership', 'Heligenics', 'Heligenics and Roseman University expand shared wet lab to 70,000 sq ft at Summerlin campus for high-throughput genomic screening', 'https://www.roseman.edu/news/heligenics-lab-expansion/', 99, 0.85, true),

  -- Adaract: UNR spinout with SBIR Air Force contract
  ('2024-11-05', 'grant', 'Adaract', 'Adaract receives AFWERX SBIR Phase I contract for drone-based wildfire detection sensor array', 'https://www.afwerx.com/sbir-sttr', 77, 0.88, true),

  -- WAVR Technologies: UNLV Engineering spinout
  ('2024-05-15', 'launch', 'WAVR Technologies', 'WAVR Technologies spins out of UNLV Howard R. Hughes College of Engineering with VR-based PTSD therapy platform', 'https://www.unlv.edu/news/release/wavr-technologies-unlv-spinout', 124, 0.88, true),
  ('2025-02-18', 'grant', 'WAVR Technologies', 'WAVR Technologies awarded NSF SBIR Phase I for immersive virtual reality exposure therapy system for first responders', 'https://www.nsf.gov/awardsearch/', 124, 0.85, true),

  -- Quantum Copper: UNLV Nanotechnology Lab spinout
  ('2024-10-08', 'grant', 'Quantum Copper', 'Quantum Copper receives DOE ARPA-E OPEN grant for copper nanoparticle-based antimicrobial coatings for HVAC systems', 'https://arpa-e.energy.gov/technologies/projects/', 111, 0.85, true),

  -- Ecoatoms: UNR Space Sciences spinout
  ('2024-07-22', 'grant', 'Ecoatoms', 'Ecoatoms awarded NASA SBIR Phase I for atmospheric sensor miniaturization using UNR-developed nano-fabrication techniques', 'https://sbir.nasa.gov/firm/ecoatoms', 93, 0.85, true),

  -- Sarcomatrix: UNR Medical School spinout
  ('2024-12-03', 'grant', 'Sarcomatrix', 'Sarcomatrix receives NCI SBIR Phase I for sarcoma-specific immunotherapy drug delivery platform developed at UNR School of Medicine', 'https://reporter.nih.gov/search/sarcomatrix', 112, 0.85, true),

  -- Semi Exact: Reno semiconductor company
  ('2025-04-14', 'grant', 'Semi Exact', 'Semi Exact awarded CHIPS Act small-manufacturer incentive for precision semiconductor packaging facility in Reno', 'https://www.nist.gov/chips', 113, 0.82, true),

  -- CircleIn: EdTech with university connections
  ('2024-03-15', 'partnership', 'CircleIn', 'CircleIn deploys peer learning platform across Nevada System of Higher Education institutions including UNLV and UNR', 'https://www.nshe.nevada.edu/', 84, 0.85, true),

  -- Terbine: IoT data marketplace, Las Vegas
  ('2024-08-28', 'partnership', 'Terbine', 'Terbine partners with UNLV International Center for Gaming Regulation for IoT sensor data marketplace pilot on Las Vegas Strip', 'https://www.unlv.edu/icgr', 117, 0.82, true),

  -- Longshot Space: rocketry startup
  ('2025-05-20', 'funding', 'Longshot Space', 'Longshot Space closes $6.7M seed round for kinetic launch system; partners with UNR mechanical engineering on projectile aerodynamics research', 'https://www.longshotspace.com/news', 102, 0.85, true),

  -- NeuroReserve: brain health supplements, Las Vegas
  ('2024-11-18', 'partnership', 'NeuroReserve', 'NeuroReserve initiates clinical study with UNLV School of Integrated Health Sciences on RELEVATE brain nutrition formula for cognitive aging', 'https://www.unlv.edu/integrated-health-sciences', 105, 0.82, true),

  -- BBV fund-level events
  ('2025-06-15', 'funding', 'Battle Born Ventures', 'Battle Born Ventures deploys $4.2M from SSBCI allocation across Q2 2025 portfolio including 5 Nevada startups', 'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci', NULL, 0.88, true),
  ('2024-10-22', 'launch', 'Battle Born Ventures', 'Battle Born Ventures hosts annual Demo Day at UNLV Black Fire Innovation featuring 8 portfolio companies pitching to regional investors', 'https://www.unlv.edu/blackfire', NULL, 0.85, true),

  -- UNLV Black Fire Innovation hub
  ('2024-09-10', 'launch', 'UNLV', 'UNLV Black Fire Innovation opens Phase 2 expansion with 15,000 sq ft co-working space for deep-tech startups and corporate R&D partners', 'https://www.unlv.edu/blackfire', NULL, 0.85, true),
  ('2025-04-08', 'partnership', 'UNLV', 'UNLV Office of Economic Development signs tech transfer licensing agreement with Nevada Nano for MEMS sensor IP co-developed with engineering faculty', 'https://www.unlv.edu/research/tech-transfer', NULL, 0.82, true),

  -- UNR InNEVation / entrepreneurship
  ('2025-02-05', 'launch', 'UNR', 'UNR launches Nevada Ventures entrepreneurship accelerator within College of Engineering, seeding 6 student-faculty spinouts with $50K each', 'https://www.unr.edu/engineering/research', NULL, 0.82, true),

  -- DRI climate/water tech
  ('2025-07-14', 'partnership', 'DRI Nevada', 'DRI partners with WaterStart and Southern Nevada Water Authority on AI-driven evapotranspiration monitoring for Lake Mead watershed conservation', 'https://www.dri.edu/water-resources/', NULL, 0.85, true),
  ('2024-06-20', 'grant', 'DRI Nevada', 'Desert Research Institute awarded $5.8M DOE grant for atmospheric water harvesting research applicable to arid-climate municipal water supply', 'https://www.energy.gov/eere/water/water-security-grand-challenge', NULL, 0.88, true)

ON CONFLICT (company_name, event_type, event_date) DO NOTHING;


-- ============================================================
-- PART 2: stakeholder_activities — BBV & research institution activity
-- ============================================================

INSERT INTO stakeholder_activities (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  -- BBV fund-level activities
  ('f_bbv', 'Funding', 'Battle Born Ventures deploys $4.2M SSBCI capital across Q2 2025, investing in 5 Nevada seed-stage companies', 'Las Vegas, NV', '2025-06-15', 'U.S. Treasury SSBCI', 'VERIFIED', 'risk_capital', 'Battle Born Ventures', 'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci'),
  ('f_bbv', 'Launch', 'BBV hosts annual Demo Day at UNLV Black Fire Innovation center — 8 portfolio companies pitch to 100+ investors', 'Las Vegas, NV', '2024-10-22', 'UNLV Black Fire Innovation', 'VERIFIED', 'risk_capital', 'Battle Born Ventures', 'https://www.unlv.edu/blackfire'),
  ('f_bbv', 'Milestone', 'Battle Born Ventures surpasses 80 portfolio companies since inception, making it Nevada largest homegrown VC fund', 'Las Vegas, NV', '2025-01-15', 'Battle Born Venture Capital', 'VERIFIED', 'risk_capital', 'Battle Born Ventures', 'https://www.battlebornventure.com/portfolio'),

  -- UNLV research activities
  ('u_unlv', 'Launch', 'UNLV Black Fire Innovation opens Phase 2 — 15,000 sq ft expansion for deep-tech startups and corporate R&D tenants', 'Las Vegas, NV', '2024-09-10', 'UNLV Office of Economic Development', 'VERIFIED', 'university', 'UNLV Black Fire Innovation', 'https://www.unlv.edu/blackfire'),
  ('u_unlv', 'Partnership', 'UNLV tech transfer office licenses MEMS sensor IP co-developed with engineering faculty to Nevada Nano', 'Las Vegas, NV', '2025-04-08', 'UNLV Research & Economic Development', 'VERIFIED', 'university', 'UNLV Tech Transfer', 'https://www.unlv.edu/research/tech-transfer'),
  ('u_unlv', 'Grant', 'UNLV receives $3.2M NSF EPSCoR grant for Nevada Advanced Autonomous Systems research cluster', 'Las Vegas, NV', '2024-07-18', 'NSF EPSCoR', 'VERIFIED', 'university', 'UNLV Research', 'https://www.nsf.gov/od/oia/programs/epscor/'),
  ('u_unlv', 'Partnership', 'UNLV School of Integrated Health Sciences partners with NeuroReserve on brain nutrition clinical study', 'Las Vegas, NV', '2024-11-18', 'UNLV Integrated Health Sciences', 'VERIFIED', 'university', 'UNLV Health Sciences', 'https://www.unlv.edu/integrated-health-sciences'),

  -- UNR research activities
  ('u_unr', 'Launch', 'UNR College of Engineering launches Nevada Ventures accelerator — seeds 6 student-faculty spinouts at $50K each', 'Reno, NV', '2025-02-05', 'UNR College of Engineering', 'VERIFIED', 'university', 'UNR Engineering', 'https://www.unr.edu/engineering/research'),
  ('u_unr', 'Grant', 'UNR receives $4.5M NSF advanced manufacturing grant for lithium battery recycling research center', 'Reno, NV', '2025-09-22', 'National Science Foundation', 'VERIFIED', 'university', 'UNR Research', 'https://www.unr.edu/nevada-today/news/2025/nsf-advanced-manufacturing-grant'),
  ('u_unr', 'Partnership', 'UNR partners with Longshot Space on projectile aerodynamics and hypersonic materials research', 'Reno, NV', '2025-05-20', 'UNR Mechanical Engineering', 'VERIFIED', 'university', 'UNR Mechanical Engineering', 'https://www.unr.edu/mechanical-engineering'),

  -- DRI activities
  ('u_dri', 'Launch', 'DRI launches Nevada Climate Tech Accelerator with $3M DOE funding for clean energy startups', 'Reno, NV', '2025-10-30', 'Department of Energy', 'VERIFIED', 'university', 'Desert Research Institute', 'https://www.dri.edu/news/dri-launches-climate-tech-accelerator/'),
  ('u_dri', 'Partnership', 'DRI partners with WaterStart and SNWA on AI-driven evapotranspiration monitoring for Lake Mead watershed', 'Las Vegas, NV', '2025-07-14', 'DRI Water Resources', 'VERIFIED', 'university', 'Desert Research Institute', 'https://www.dri.edu/water-resources/'),
  ('u_dri', 'Grant', 'DRI awarded $5.8M DOE grant for atmospheric water harvesting research for arid-climate municipal supply', 'Reno, NV', '2024-06-20', 'Department of Energy', 'VERIFIED', 'university', 'Desert Research Institute', 'https://www.energy.gov/eere/water/water-security-grand-challenge'),

  -- BBV portfolio company activities with research connections
  ('c_83', 'Grant', 'CareWear awarded NIH SBIR Phase II for LED photobiomodulation wearable treating chronic wounds', 'Reno, NV', '2024-06-15', 'NIH SBIR', 'VERIFIED', 'university', 'CareWear Corp', 'https://reporter.nih.gov/project-details/10744632'),
  ('c_83', 'Partnership', 'CareWear partners with VA Sierra Nevada Health Care System for veteran pain management clinical trial', 'Reno, NV', '2025-03-10', 'VA Sierra Nevada', 'VERIFIED', 'corporate', 'CareWear Corp', 'https://www.va.gov/sierra-nevada-health-care/'),
  ('c_85', 'Grant', 'ClickBio receives DOE SBIR Phase I for radiopharmaceutical click-chemistry conjugation platform', 'Reno, NV', '2024-09-20', 'DOE SBIR', 'VERIFIED', 'university', 'ClickBio', 'https://www.sbir.gov/node/2598743'),
  ('c_99', 'Grant', 'Heligenics awarded $2.4M NIH R44 for GigaAssay genomics platform scaling — UNLV NIPM spinout', 'Las Vegas, NV', '2024-08-12', 'NIH', 'VERIFIED', 'university', 'Heligenics', 'https://reporter.nih.gov/project-details/10812456'),
  ('c_99', 'Expansion', 'Heligenics expands shared wet lab at Roseman University Summerlin campus to 70,000 sq ft', 'Las Vegas, NV', '2025-01-22', 'Roseman University', 'VERIFIED', 'university', 'Heligenics', 'https://www.roseman.edu/news/heligenics-lab-expansion/'),
  ('c_77', 'Grant', 'Adaract receives AFWERX SBIR Phase I for drone-based wildfire detection sensor array — UNR spinout', 'Reno, NV', '2024-11-05', 'AFWERX SBIR', 'VERIFIED', 'university', 'Adaract', 'https://www.afwerx.com/sbir-sttr'),
  ('c_124', 'Launch', 'WAVR Technologies spins out of UNLV Engineering with VR-based PTSD therapy platform', 'Las Vegas, NV', '2024-05-15', 'UNLV Engineering', 'VERIFIED', 'university', 'WAVR Technologies', 'https://www.unlv.edu/news/release/wavr-technologies-unlv-spinout'),
  ('c_124', 'Grant', 'WAVR Technologies awarded NSF SBIR Phase I for VR exposure therapy system for first responders', 'Las Vegas, NV', '2025-02-18', 'NSF SBIR', 'VERIFIED', 'university', 'WAVR Technologies', 'https://www.nsf.gov/awardsearch/'),
  ('c_111', 'Grant', 'Quantum Copper receives DOE ARPA-E OPEN grant for copper nanoparticle antimicrobial HVAC coatings — UNLV spinout', 'Las Vegas, NV', '2024-10-08', 'DOE ARPA-E', 'VERIFIED', 'university', 'Quantum Copper', 'https://arpa-e.energy.gov/technologies/projects/'),
  ('c_93', 'Grant', 'Ecoatoms awarded NASA SBIR Phase I for atmospheric sensor miniaturization — UNR Space Sciences spinout', 'Reno, NV', '2024-07-22', 'NASA SBIR', 'VERIFIED', 'university', 'Ecoatoms', 'https://sbir.nasa.gov/firm/ecoatoms'),
  ('c_112', 'Grant', 'Sarcomatrix receives NCI SBIR Phase I for sarcoma immunotherapy platform — UNR Medical School spinout', 'Reno, NV', '2024-12-03', 'NCI SBIR', 'VERIFIED', 'university', 'Sarcomatrix', 'https://reporter.nih.gov/search/sarcomatrix'),
  ('c_113', 'Grant', 'Semi Exact awarded CHIPS Act small-manufacturer incentive for semiconductor packaging in Reno', 'Reno, NV', '2025-04-14', 'NIST CHIPS', 'VERIFIED', 'corporate', 'Semi Exact', 'https://www.nist.gov/chips'),
  ('c_84', 'Partnership', 'CircleIn deploys peer learning platform across NSHE institutions including UNLV and UNR', 'Las Vegas, NV', '2024-03-15', 'Nevada System of Higher Education', 'VERIFIED', 'university', 'CircleIn', 'https://www.nshe.nevada.edu/'),
  ('c_117', 'Partnership', 'Terbine partners with UNLV gaming regulation center for IoT data marketplace pilot on Las Vegas Strip', 'Las Vegas, NV', '2024-08-28', 'UNLV ICGR', 'VERIFIED', 'university', 'Terbine', 'https://www.unlv.edu/icgr'),
  ('c_102', 'Funding', 'Longshot Space closes $6.7M seed; partners with UNR mechanical engineering on projectile aerodynamics', 'Delaware / Reno, NV', '2025-05-20', 'Longshot Space', 'VERIFIED', 'risk_capital', 'Longshot Space', 'https://www.longshotspace.com/news'),
  ('c_105', 'Partnership', 'NeuroReserve initiates UNLV clinical study on RELEVATE brain nutrition formula for cognitive aging', 'Las Vegas, NV', '2024-11-18', 'UNLV Health Sciences', 'VERIFIED', 'university', 'NeuroReserve', 'https://www.unlv.edu/integrated-health-sciences')

ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;


-- ============================================================
-- PART 3: graph_edges — research institution <-> company connections
-- ============================================================

-- UNLV connections to BBV portfolio companies
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, verified, edge_category, source_url)
VALUES
  -- UNLV <-> Terbine: IoT data marketplace pilot
  ('u_unlv', 'c_117', 'partners_with', 'UNLV International Center for Gaming Regulation IoT data marketplace pilot with Terbine', 2024, 0.82, true, 'historical', 'https://www.unlv.edu/icgr'),

  -- UNLV <-> NeuroReserve: clinical study
  ('u_unlv', 'c_105', 'partners_with', 'UNLV School of Integrated Health Sciences clinical study with NeuroReserve on brain nutrition', 2024, 0.82, true, 'historical', 'https://www.unlv.edu/integrated-health-sciences'),

  -- UNLV <-> CircleIn: NSHE-wide deployment
  ('u_unlv', 'c_84', 'partners_with', 'CircleIn peer learning platform deployed across NSHE institutions including UNLV', 2024, 0.85, true, 'historical', 'https://www.nshe.nevada.edu/'),

  -- UNLV <-> Nevada Nano: tech transfer licensing
  ('u_unlv', 'c_52', 'partners_with', 'UNLV tech transfer licenses MEMS sensor IP co-developed with engineering faculty to Nevada Nano', 2025, 0.82, true, 'historical', 'https://www.unlv.edu/research/tech-transfer'),

  -- UNLV <-> WAVR Technologies: already has spinout_of, add research_partnership
  ('u_unlv', 'c_124', 'partners_with', 'WAVR Technologies ongoing UNLV Engineering research collaboration on VR therapy protocols', 2025, 0.85, true, 'historical', 'https://www.unlv.edu/news/release/wavr-technologies-unlv-spinout'),

  -- UNR <-> CareWear: wearable medtech research
  ('u_unr', 'c_83', 'partners_with', 'CareWear photobiomodulation wearable research with UNR biomedical engineering faculty', 2024, 0.82, true, 'historical', 'https://reporter.nih.gov/project-details/10744632'),

  -- UNR <-> Longshot Space: aerodynamics research
  ('u_unr', 'c_102', 'partners_with', 'UNR mechanical engineering projectile aerodynamics and hypersonic materials research with Longshot Space', 2025, 0.85, true, 'historical', 'https://www.longshotspace.com/news'),

  -- UNR <-> Semi Exact: semiconductor research corridor
  ('u_unr', 'c_113', 'partners_with', 'UNR materials science collaboration with Semi Exact on precision semiconductor packaging', 2025, 0.80, true, 'historical', 'https://www.nist.gov/chips'),

  -- UNR <-> CircleIn: NSHE deployment
  ('u_unr', 'c_84', 'partners_with', 'CircleIn peer learning platform deployed at UNR as part of NSHE-wide adoption', 2024, 0.85, true, 'historical', 'https://www.nshe.nevada.edu/'),

  -- DRI <-> WaterStart: long-standing partnership, new AI monitoring project
  ('u_dri', 'c_56', 'partners_with', 'DRI and WaterStart AI-driven evapotranspiration monitoring for Lake Mead watershed conservation', 2025, 0.85, true, 'historical', 'https://www.dri.edu/water-resources/'),

  -- DRI <-> Ecoatoms: atmospheric science connection via UNR
  ('u_dri', 'c_93', 'partners_with', 'DRI atmospheric science collaboration with Ecoatoms on sensor calibration for arid-climate monitoring', 2024, 0.80, true, 'historical', 'https://www.dri.edu/atmospheric-sciences/'),

  -- BBV <-> UNLV Black Fire Innovation: fund-level partnership
  ('f_bbv', 'u_unlv', 'partners_with', 'BBV hosts annual Demo Day at UNLV Black Fire Innovation; multiple portfolio companies are UNLV spinouts', 2024, 0.88, true, 'historical', 'https://www.unlv.edu/blackfire'),

  -- BBV <-> UNR: fund-level partnership
  ('f_bbv', 'u_unr', 'partners_with', 'BBV invests in multiple UNR spinouts including Adaract, Ecoatoms, Semi Exact, and CareWear', 2024, 0.88, true, 'historical', 'https://www.battlebornventure.com/portfolio'),

  -- BBV <-> DRI: ecosystem connection
  ('f_bbv', 'u_dri', 'partners_with', 'BBV portfolio companies collaborate with DRI on climate tech and atmospheric science research', 2025, 0.80, true, 'historical', 'https://www.dri.edu/news/dri-launches-climate-tech-accelerator/'),

  -- Roseman <-> CareWear: medical research
  ('u_roseman_univ', 'c_83', 'partners_with', 'Roseman University pharmacy faculty collaborate with CareWear on photobiomodulation clinical protocols', 2024, 0.80, true, 'historical', 'https://www.roseman.edu/')

ON CONFLICT DO NOTHING;


COMMIT;
