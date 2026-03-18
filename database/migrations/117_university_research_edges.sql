-- Migration 117: University Research Institution Edges — UNLV, UNR, DRI
-- Adds new externals, graph edges, and timeline events for research institution
-- connections discovered through web research (March 2026).
--
-- Sources:
--   UNLV: Black Fire Innovation, Harry Reid Tech Park, NSF SWSIE, InnovateNV
--   UNR:  NVRIC spinouts, NCAR, Nevada Tech Hub ($21M EDA), Nevada Autonomous
--   DRI:  WaterStart, SWSIE, Cumulus Weather Solutions, DASCO biochar license
--
-- Run: docker exec battlebornintel-postgres-1 psql -U bbi -d battlebornintel \
--        -f /docker-entrypoint-initdb.d/117_university_research_edges.sql

BEGIN;

-- ============================================================
-- SECTION 1: NEW EXTERNALS
-- ============================================================

INSERT INTO externals (id, name, entity_type, note, verified)
VALUES
  -- Federal agencies
  ('gov_eda',           'U.S. Economic Development Administration', 'Government',
   'EDA Tech Hubs program; $21M to UNR-led Nevada Tech Hub for lithium/EV materials loop.',
   true),
  ('gov_doe_nnss',      'DOE NNSS / Nevada National Security Site', 'Government',
   'DOE Nevada National Security Site; UNLV MSIPP Consortia partner.',
   true),

  -- NSHE system-level
  ('x_nshe',            'Nevada System of Higher Education',        'Government',
   'NSHE governs UNLV, UNR, DRI, NSU, CSN, TMCC, GBC, WNC.',
   true),
  ('x_nvric',           'Nevada Research & Innovation Corp (NVRIC)','Research Org',
   'UNR nonprofit for tech transfer, commercialization, and spinout support. Founded 2017.',
   true),
  ('x_ncar',            'Nevada Center for Applied Research (NCAR)','Research Org',
   'UNR applied R&D center. 600+ company engagements since 2013; $201M VC raised by affiliates.',
   true),
  ('x_nv_autonomous',   'Nevada Autonomous',                       'Research Org',
   'UNR/NCAR program for autonomous vehicles, UAS, and robotics commercialization.',
   true),
  ('x_nv_uas',          'Nevada UAS Test Site',                    'Research Org',
   'FAA-designated UAS test site managed by UNR. Eagle Field Airport partnership 2026.',
   true),

  -- UNR spinout companies (not already in DB)
  ('x_lidar_matrix',    'LiDAR Matrix Inc.',                       'Corporation',
   'UNR spinout — LiDAR + AI for transit safety. Patented roadside LiDAR technology.',
   true),
  ('x_dxdiscovery',     'DxDiscovery',                             'Corporation',
   'UNR spinout — rapid diagnostics for infectious disease.',
   true),
  ('x_renogenyx',       'Renogenyx',                               'Corporation',
   'UNR spinout — gene therapy for neuromuscular conditions.',
   true),
  ('x_strykagen',       'Strykagen',                               'Corporation',
   'UNR spinout — DMD/BMD therapeutics.',
   true),
  ('x_bioelectronica',  'Bioelectronica',                          'Corporation',
   'UNR/NCAR graduate — biosensor diagnostics.',
   true),
  ('x_nextech_batt',    'NexTech Batteries',                       'Corporation',
   'UNR/NCAR graduate — advanced battery technology.',
   true),
  ('x_lactalogics',     'LactaLogics',                             'Corporation',
   'UNR/NCAR graduate — human milk biotech.',
   true),
  ('x_abtc',            'American Battery Technology Co.',          'Corporation',
   'NCAR co-located; lithium-ion recycling and primary extraction. NYSE: ABAT.',
   true),

  -- DRI spinout/license companies
  ('x_cumulus_weather',  'Cumulus Weather Solutions LLC',           'Corporation',
   'DRI-born startup — weather decision support for wind/solar energy. Licensed DRI IP.',
   true),
  ('x_dasco',           'DASCO Inc.',                              'Corporation',
   'Licensed DRI biochar technology for water nutrient removal.',
   true),
  ('x_hydrosat',        'Hydrosat',                                'Corporation',
   'Satellite thermal imaging; DRI/SWSIE-funded evaporation research on Colorado River.',
   true),

  -- UNLV corporate research tenants (at Harry Reid Tech Park)
  ('x_geocomply',       'GeoComply',                               'Corporation',
   'Geolocation compliance for gaming. UNLV Harry Reid Tech Park unicorn tenant.',
   true),
  ('x_sightline',       'Sightline Payments',                      'Corporation',
   'Cashless gaming payments. UNLV Harry Reid Tech Park unicorn tenant.',
   true),
  ('x_tmobile_cx',      'T-Mobile Business CX Center',             'Corporation',
   'T-Mobile customer experience center at UNLV Harry Reid Tech Park.',
   true),

  -- SWSIE
  ('x_swsie',           'SW Sustainability Innovation Engine',     'Research Org',
   'NSF Regional Innovation Engine — DRI + UNLV + ASU. $15M initial; up to $160M/10yr.',
   true)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 2: GRAPH EDGES — UNLV
-- ============================================================

-- --- UNLV institutional structure ---
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, verified, source_url, edge_category, source_type, target_type)
VALUES
  -- UNLV ↔ Black Fire Innovation
  ('u_unlv', 'a_blackfire', 'partners_with',
   'UNLV co-founded Black Fire Innovation with Caesars Entertainment at Harry Reid Tech Park (2020). 43,000 sq ft gaming/hospitality living lab.',
   2020, 0.95, true,
   'https://www.unlv.edu/econdev/black-fire-innovation',
   'historical', 'university', 'accelerator'),

  -- UNLV ↔ Harry Reid Tech Park
  ('u_unlv', 'e_unlvtech', 'partners_with',
   'UNLV manages Harry Reid Research & Technology Park via UNLV Research Foundation. 122 acres, 100+ companies, 1,000+ employees. Gardner Company master developer.',
   2004, 0.95, true,
   'https://unlvtechpark.com/',
   'historical', 'university', 'ecosystem'),

  -- Black Fire → UNLV (program_of)
  ('a_blackfire', 'u_unlv', 'program_of',
   'Black Fire Innovation is an UNLV initiative within the Office of Economic Development.',
   2020, 0.95, true,
   'https://www.unlv.edu/unit/black-fire-innovation',
   'historical', 'accelerator', 'university'),

  -- UNLV ↔ NSHE
  ('u_unlv', 'x_nshe', 'program_of',
   'UNLV is a member institution of the Nevada System of Higher Education.',
   1957, 0.99, true,
   'https://nshe.nevada.edu/',
   'historical', 'university', 'government'),

  -- UNLV unicorn tenants at Tech Park
  ('x_geocomply', 'e_unlvtech', 'housed_at',
   'GeoComply ($1B+ unicorn) headquartered at UNLV Harry Reid Research & Technology Park.',
   2020, 0.90, true,
   'https://www.reviewjournal.com/business/unlvs-tech-park-still-growing-targets-high-profile-companies-3034013/',
   'historical', 'corporation', 'ecosystem'),

  ('x_sightline', 'e_unlvtech', 'housed_at',
   'Sightline Payments ($1B+ unicorn) headquartered at UNLV Harry Reid Research & Technology Park.',
   2021, 0.90, true,
   'https://www.reviewjournal.com/business/unlvs-tech-park-still-growing-targets-high-profile-companies-3034013/',
   'historical', 'corporation', 'ecosystem'),

  ('x_tmobile_cx', 'e_unlvtech', 'housed_at',
   'T-Mobile Business Customer Experience Center at UNLV Harry Reid Tech Park.',
   2019, 0.85, true,
   'https://www.reviewjournal.com/business/unlvs-tech-park-still-growing-targets-high-profile-companies-3034013/',
   'historical', 'corporation', 'ecosystem'),

  -- UNLV corporate research partners at Tech Park
  ('x_lockheed-martin', 'u_unlv', 'partners_with',
   'Lockheed Martin Advanced Research Lab at UNLV (25,000 sq ft). Defense R&D collaboration.',
   2018, 0.85, true,
   'https://www.unlv.edu/econdev/facilities',
   'historical', 'corporation', 'university'),

  ('x_raytheon-technologies', 'u_unlv', 'partners_with',
   'Raytheon Technologies Nevada Lab at UNLV (18,000 sq ft). Defense systems research.',
   2019, 0.85, true,
   'https://www.unlv.edu/econdev/facilities',
   'historical', 'corporation', 'university'),

  ('x_panasonic-energy', 'u_unlv', 'partners_with',
   'Panasonic Energy 12,000 sq ft lab at UNLV for battery/energy R&D.',
   2020, 0.85, true,
   'https://www.unlv.edu/econdev/facilities',
   'historical', 'corporation', 'university'),

  ('x_ibm-research', 'u_unlv', 'partners_with',
   'IBM Research quantum computing partnership with UNLV. Co-investment in $18M Quantum Computing Center.',
   2026, 0.80, true,
   'https://www.unlv.edu/news/release/switch-supernap-intel-partner-unlv-boost-scientific-research-and-economic-development',
   'historical', 'corporation', 'university'),

  -- UNLV ↔ Switch supercomputer
  ('u_unlv', 'c_58', 'partners_with',
   'Switch SUPERNAP hosts UNLV Cherry Creek supercomputer (10,000 cores). Intel donation, Switch donated data center space.',
   2021, 0.95, true,
   'https://www.switch.com/switch-supernap-intel-collaborate-unlv-boost-scientific-research-economic-development/',
   'historical', 'university', 'company'),

  -- UNLV ↔ NSF I-Corps
  ('x_nsf-icorps-nv', 'u_unlv', 'partners_with',
   'NSF I-Corps at UNLV — supports high-risk tech startups. Up to $150K Phase 1, $1M Phase 2.',
   2020, 0.90, true,
   'https://www.unlv.edu/econdev/researchers-faculty/nsf-icorps',
   'historical', 'government', 'university'),

  -- UNLV InnovateNV SBIR accelerator
  ('u_unlv', 'gov_nsf_sbir', 'partners_with',
   'UNLV InnovateNV 9-week SBIR/STTR Proposal Accelerator + $5K Phase 0 microgrants. First cohort April 2025.',
   2025, 0.90, true,
   'https://www.unlv.edu/econdev/researchers-faculty/innovatenv',
   'historical', 'university', 'government'),

  -- DOE MSIPP grants to UNLV
  ('x_doe', 'u_unlv', 'grants_to',
   'DOE MSIPP Consortia grant $5.6M/year (2025-2030) for Nevada National Security Consortium at UNLV. Also $2M/year nuclear sciences & engineering (2024-2031).',
   2025, 0.90, true,
   'https://goed.nv.gov/wp-content/uploads/2025/03/AIC-ARC-Knowledge-Fund-Report-October-2024-Final.pdf',
   'historical', 'government', 'university'),

  -- UNLV ↔ SWSIE
  ('x_swsie', 'u_unlv', 'partners_with',
   'UNLV is core academic partner in NSF Southwest Sustainability Innovation Engine (SWSIE). Water innovation, workforce development.',
   2024, 0.90, true,
   'https://www.unlv.edu/news/release/unlv-dri-partner-regional-climate-innovation-consortium',
   'historical', 'research_org', 'university')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 3: GRAPH EDGES — UNR
-- ============================================================

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, verified, source_url, edge_category, source_type, target_type)
VALUES
  -- UNR institutional structure
  ('u_unr', 'x_nshe', 'program_of',
   'UNR is a member institution of the Nevada System of Higher Education.',
   1874, 0.99, true,
   'https://nshe.nevada.edu/',
   'historical', 'university', 'government'),

  -- UNR ↔ NVRIC
  ('u_unr', 'x_nvric', 'partners_with',
   'Nevada Research & Innovation Corporation (NVRIC) is UNR nonprofit for tech transfer. Founded 2017 to support spinouts and licensing.',
   2017, 0.95, true,
   'https://nvric.org/',
   'historical', 'university', 'research_org'),

  -- UNR ↔ NCAR
  ('u_unr', 'x_ncar', 'partners_with',
   'Nevada Center for Applied Research (NCAR) at UNR. 600+ company engagements since 2013; $201M VC raised by affiliated companies; 725+ jobs created.',
   2013, 0.95, true,
   'https://www.unr.edu/ncar',
   'historical', 'university', 'research_org'),

  -- UNR ↔ Nevada Autonomous
  ('u_unr', 'x_nv_autonomous', 'partners_with',
   'Nevada Autonomous at UNR/NCAR commercializes autonomous systems, UAS, and robotics tech. FAA-designated test state.',
   2016, 0.90, true,
   'https://www.unr.edu/ncar/programs/nevada-autonomous',
   'historical', 'university', 'research_org'),

  -- UNR ↔ Nevada UAS Test Site
  ('u_unr', 'x_nv_uas', 'partners_with',
   'UNR manages FAA-designated Nevada UAS Test Site. Eagle Field Airport strategic partnership formed 2026.',
   2015, 0.90, true,
   'https://www.unr.edu/nevada-today/news/2026/nv-uas-and-eagle-field-airport-form-partnership',
   'historical', 'university', 'research_org'),

  -- UNR ↔ Innevation Center
  ('u_unr', 'e_innevation', 'partners_with',
   'UNR Innevation Center coworking/incubator hub. Hosts gener8tor Reno, InNEVator, and multiple startup events.',
   2014, 0.95, true,
   'https://www.unr.edu/nevada-today/news/2024/2024-reno-startup-week',
   'historical', 'university', 'ecosystem'),

  -- EDA Tech Hub → UNR ($21M)
  ('gov_eda', 'u_unr', 'grants_to',
   'EDA awards $21M to UNR-led Nevada Tech Hub (July 2024). Lithium Batteries & EV Materials Loop — full lifecycle from extraction to recycling.',
   2024, 0.95, true,
   'https://www.eda.gov/news/press-release/2024/07/02/Nevada-Tech-Hub',
   'historical', 'government', 'university'),

  -- Nevada state $7.5M match for Tech Hub
  ('e_goed', 'u_unr', 'grants_to',
   'Nevada Interim Finance Committee approves $7.5M state match for UNR-led Nevada Tech Hub (2024).',
   2024, 0.90, true,
   'https://www.unr.edu/nevada-today/news/2024/tech-hub',
   'historical', 'government', 'university'),

  -- UNR NVRIC spinouts
  ('u_unr', 'x_lidar_matrix', 'spinout_of',
   'LiDAR Matrix Inc. — UNR faculty spinout. Roadside LiDAR + patented AI for transit safety.',
   2020, 0.90, true,
   'https://www.unr.edu/enterprise/spin-outs',
   'historical', 'university', 'corporation'),

  ('u_unr', 'x_dxdiscovery', 'spinout_of',
   'DxDiscovery — UNR spinout. Rapid diagnostics for infectious disease.',
   2018, 0.85, true,
   'https://www.unr.edu/enterprise/spin-outs',
   'historical', 'university', 'corporation'),

  ('u_unr', 'x_renogenyx', 'spinout_of',
   'Renogenyx — UNR spinout. Gene therapy for neuromuscular conditions (DMD, LGMD).',
   2019, 0.85, true,
   'https://www.unr.edu/enterprise/spin-outs',
   'historical', 'university', 'corporation'),

  ('u_unr', 'x_strykagen', 'spinout_of',
   'Strykagen — UNR spinout. Therapeutics for Duchenne/Becker muscular dystrophy.',
   2019, 0.85, true,
   'https://www.unr.edu/enterprise/spin-outs',
   'historical', 'university', 'corporation'),

  -- NCAR graduate companies
  ('x_ncar', 'x_bioelectronica', 'spinout_of',
   'Bioelectronica graduated from NCAR incubation at UNR. Biosensor diagnostics.',
   2020, 0.85, true,
   'https://www.unr.edu/nevada-today/news/2020/ncar-business-graduates',
   'historical', 'research_org', 'corporation'),

  ('x_ncar', 'x_nextech_batt', 'spinout_of',
   'NexTech Batteries graduated from NCAR incubation at UNR. Advanced battery technology.',
   2020, 0.85, true,
   'https://www.unr.edu/nevada-today/news/2020/ncar-business-graduates',
   'historical', 'research_org', 'corporation'),

  ('x_ncar', 'x_lactalogics', 'spinout_of',
   'LactaLogics graduated from NCAR incubation at UNR. Human milk biotech.',
   2020, 0.85, true,
   'https://www.unr.edu/nevada-today/news/2020/ncar-business-graduates',
   'historical', 'research_org', 'corporation'),

  -- NCAR ↔ ABTC co-location
  ('x_ncar', 'x_abtc', 'partners_with',
   'American Battery Technology Co. (ABTC) co-located at NCAR Applied Research Facility. Li-ion recycling and primary extraction R&D.',
   2022, 0.90, true,
   'https://www.unr.edu/nevada-today/news/2022/ncar-partners-with-american-battery-technology-company',
   'historical', 'research_org', 'corporation'),

  -- UNR ↔ Redwood Materials (lithium/EV ecosystem via Tech Hub)
  ('u_unr', 'c_1', 'partners_with',
   'Redwood Materials is a Nevada Tech Hub consortium partner. UNR-led lithium lifecycle ecosystem includes battery recycling.',
   2024, 0.80, true,
   'https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf',
   'historical', 'university', 'company'),

  -- UNR ↔ Ioneer (lithium/EV ecosystem)
  ('u_unr', 'c_49', 'partners_with',
   'Ioneer Rhyolite Ridge lithium project is part of UNR-led Nevada Tech Hub lithium lifecycle ecosystem.',
   2024, 0.80, true,
   'https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf',
   'historical', 'university', 'company'),

  -- UNR ↔ Dragonfly Energy (lithium/battery manufacturing)
  ('u_unr', 'c_50', 'partners_with',
   'Dragonfly Energy solid-state battery production in Reno aligns with UNR Nevada Tech Hub lithium/EV materials loop.',
   2024, 0.75, true,
   'https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf',
   'historical', 'university', 'company')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: GRAPH EDGES — DRI
-- ============================================================

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, verified, source_url, edge_category, source_type, target_type)
VALUES
  -- DRI institutional structure
  ('u_dri', 'x_nshe', 'program_of',
   'Desert Research Institute is the research branch of the Nevada System of Higher Education.',
   1959, 0.99, true,
   'https://en.wikipedia.org/wiki/Desert_Research_Institute',
   'historical', 'university', 'government'),

  -- DRI ↔ WaterStart (already has partners_with c_56; add structural edge)
  ('u_dri', 'c_56', 'spinout_of',
   'WaterStart founded 2013 as DRI-housed public-private partnership for water technology commercialization. Funded by GOED.',
   2013, 0.95, true,
   'https://www.dri.edu/goed-investment-in-waterstart-marks-decisive-support-for-the-development-of-water-technologies/',
   'historical', 'university', 'company'),

  -- DRI → Cumulus Weather Solutions (licensed IP)
  ('u_dri', 'x_cumulus_weather', 'spinout_of',
   'Cumulus Weather Solutions LLC — DRI-born startup. Weather decision support for wind/solar energy. Licensed DRI IP (Dr. Craig Smith).',
   2018, 0.90, true,
   'https://www.unlv.edu/news/release/unlv-desert-research-institute-partner-help-nevada-scientists-commercialize-discovery',
   'historical', 'university', 'corporation'),

  -- DRI → DASCO biochar license
  ('u_dri', 'x_dasco', 'partners_with',
   'DASCO Inc. licensed DRI biochar technology for engineered nutrient removal from water. DRI Environmental Engineering Lab.',
   2023, 0.85, true,
   'https://goed.nv.gov/wp-content/uploads/2025/03/DRI_semi-annual_report_Oct2024_Final.pdf',
   'historical', 'university', 'corporation'),

  -- DRI ↔ SWSIE
  ('x_swsie', 'u_dri', 'partners_with',
   'DRI is core academic partner in NSF Southwest Sustainability Innovation Engine. Water, energy, and carbon expertise.',
   2024, 0.90, true,
   'https://www.dri.edu/dri-unlv-to-partner-on-regional-climate-innovation-consortium/',
   'historical', 'research_org', 'university'),

  -- DRI ↔ UNLV tech transfer partnership
  ('u_dri', 'u_unlv', 'partners_with',
   'DRI-UNLV joint tech transfer partnership enables cross-institution commercialization. First product: Cumulus Weather Solutions.',
   2018, 0.90, true,
   'https://www.unlv.edu/news/release/unlv-desert-research-institute-partner-help-nevada-scientists-commercialize-discovery',
   'historical', 'university', 'university'),

  -- DRI ↔ Hydrosat (SWSIE-funded research)
  ('u_dri', 'x_hydrosat', 'partners_with',
   'SWSIE funding enables DRI to use Hydrosat satellite thermal data for Colorado River evaporation research. Launched Aug 2024.',
   2024, 0.85, true,
   'https://goed.nv.gov/wp-content/uploads/2025/03/DRI_semi-annual_report_Oct2024_Final.pdf',
   'historical', 'university', 'corporation'),

  -- DRI ↔ SNWA
  ('x_snwa', 'u_dri', 'partners_with',
   'Southern Nevada Water Authority partners with DRI via WaterStart on leak detection, treatment, and real-time water quality monitoring.',
   2013, 0.90, true,
   'https://goed.nv.gov/newsroom/dris-waterstart-program-goed-knowledge-fund-success-story/',
   'historical', 'corporation', 'university'),

  -- NSF climate tech grant to DRI
  ('x_nsf-climate-tech', 'u_dri', 'grants_to',
   'NSF $12M climate technology research grant to DRI (award #2601847).',
   2024, 0.85, true,
   'https://nshe.nevada.edu/system-administration/news/2024/02/nshe-institutions-dri-unlv-to-partner-on-regional-climate-innovation-consortium/',
   'historical', 'government', 'university'),

  -- GOED $1.8M WaterStart investment
  ('e_goed', 'u_dri', 'grants_to',
   'GOED $1.8M investment in DRI WaterStart program. American Rescue Plan + Nevada Knowledge Fund.',
   2023, 0.90, true,
   'https://goed.nv.gov/newsroom/1-8-million-goed-investment-in-waterstart-marks-decisive-support-for-the-development-of-water-technologies-in-nevada-and-the-southwest/',
   'historical', 'government', 'university')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: CROSS-INSTITUTION EDGES
-- ============================================================

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, confidence, verified, source_url, edge_category, source_type, target_type)
VALUES
  -- SWSIE connects DRI + UNLV + StartUpNV + Switch + NV5 + GOED
  ('x_swsie', 'a_startupnv', 'partners_with',
   'StartUpNV is a SWSIE partner for startup mentorship and commercialization pipeline.',
   2024, 0.85, true,
   'https://swsie.asu.edu/',
   'historical', 'research_org', 'accelerator'),

  ('x_swsie', 'c_58', 'partners_with',
   'Switch is a SWSIE Nevada partner for data center infrastructure and sustainability.',
   2024, 0.80, true,
   'https://swsie.asu.edu/',
   'historical', 'research_org', 'company'),

  ('x_swsie', 'c_75', 'partners_with',
   'NV5 Global is a SWSIE Nevada partner for infrastructure and environmental engineering.',
   2024, 0.80, true,
   'https://swsie.asu.edu/',
   'historical', 'research_org', 'company'),

  -- SWSIE funded WAVR Technologies
  ('x_swsie', 'c_124', 'funded',
   'WAVR Technologies received SWSIE innovation grant for atmospheric water harvesting from NSF-funded research at UNLV Engineering.',
   2024, 0.85, true,
   'https://www.unlv.edu/news/unlvtoday/unlv-startup-earns-funding-nsf-southwest-sustainability-innovation-engine',
   'historical', 'research_org', 'company'),

  -- Nevada Autonomous ↔ DRI collaboration
  ('x_nv_autonomous', 'u_dri', 'partners_with',
   'Nevada Autonomous collaborates with DRI on aeronautical and autonomous vehicle research.',
   2018, 0.80, true,
   'https://www.unr.edu/ncar/programs/nevada-autonomous',
   'historical', 'research_org', 'university'),

  -- NCAR ↔ GOED Knowledge Fund
  ('e_goed', 'x_ncar', 'funds',
   'GOED Nevada Knowledge Fund supports Nevada Center for Applied Research at UNR.',
   2013, 0.90, true,
   'https://goed.nv.gov/wp-content/uploads/2025/03/Final_NCAR-KF_Semiannual_Report__February_1_2024_to_July_31_2024_-NF-FW.pdf',
   'historical', 'government', 'research_org'),

  -- NVRIC ↔ Innevation Center collaboration
  ('x_nvric', 'e_innevation', 'partners_with',
   'NVRIC collaborates with Innevation Center for startup commercialization and licensing support.',
   2017, 0.85, true,
   'https://www.unr.edu/nevada-today/news/2021/commercialization-made-easier',
   'historical', 'research_org', 'ecosystem')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 6: TIMELINE EVENTS
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, source_url, verified)
VALUES
  -- EDA Tech Hub award to UNR
  ('2024-07-02', 'grant', 'UNR',
   'U.S. EDA awards $21M to UNR-led Nevada Tech Hub for lithium batteries and EV materials loop. One of 12 Tech Hub designees funded nationally.',
   'award',
   'https://www.eda.gov/news/press-release/2024/07/02/Nevada-Tech-Hub',
   true),

  -- Nevada $7.5M match
  ('2024-10-15', 'grant', 'UNR',
   'Nevada Interim Finance Committee approves $7.5M state match for UNR-led Nevada Tech Hub, complementing federal $21M EDA award.',
   'award',
   'https://www.unr.edu/nevada-today/news/2024/tech-hub',
   true),

  -- GOED $1.8M WaterStart
  ('2023-09-15', 'grant', 'DRI',
   'GOED invests $1.8M in DRI WaterStart program for water technology development. American Rescue Plan + Knowledge Fund.',
   'award',
   'https://goed.nv.gov/newsroom/1-8-million-goed-investment-in-waterstart-marks-decisive-support-for-the-development-of-water-technologies-in-nevada-and-the-southwest/',
   true),

  -- DRI-UNLV Climate Innovation Consortium
  ('2024-02-01', 'partnership', 'DRI',
   'DRI and UNLV partner on NSF Regional Climate Innovation Consortium as part of Southwest Sustainability Innovation Engine (SWSIE).',
   'partnership',
   'https://www.dri.edu/dri-unlv-to-partner-on-regional-climate-innovation-consortium/',
   true),

  -- SWSIE Innovation Grants
  ('2025-03-01', 'grant', 'UNLV',
   'NSF SWSIE awards $1.5M in innovation grants to 8 startups and 15 catalyst grants across Nevada, Utah, Arizona. WAVR Technologies among recipients.',
   'award',
   'https://www.unlv.edu/news/unlvtoday/unlv-startup-earns-funding-nsf-southwest-sustainability-innovation-engine',
   true),

  -- UNR NCAR milestone
  ('2024-06-01', 'milestone', 'UNR',
   'Nevada Center for Applied Research (NCAR) at UNR surpasses 600 company engagements since 2013, with affiliated companies raising $201M in VC and creating 725+ jobs.',
   'trending',
   'https://www.unr.edu/ncar',
   true),

  -- NCAR-ABTC partnership
  ('2022-09-01', 'partnership', 'UNR',
   'American Battery Technology Co. (ABTC) co-locates R&D labs at UNR NCAR Applied Research Facility for lithium-ion recycling and extraction.',
   'partnership',
   'https://www.unr.edu/nevada-today/news/2022/ncar-partners-with-american-battery-technology-company',
   true),

  -- Nevada UAS + Eagle Field 2026
  ('2026-01-15', 'partnership', 'UNR',
   'Nevada UAS Test Site (managed by UNR) and Eagle Field Airport form strategic partnership for UAS and Advanced Air Mobility R&D.',
   'partnership',
   'https://www.unr.edu/nevada-today/news/2026/nv-uas-and-eagle-field-airport-form-partnership',
   true),

  -- UNLV InnovateNV launch
  ('2025-04-01', 'launch', 'UNLV',
   'UNLV launches InnovateNV SBIR/STTR Proposal Accelerator — 9-week program with $5K Phase 0 microgrants for first cohort.',
   'rocket',
   'https://www.unlv.edu/econdev/researchers-faculty/innovatenv',
   true),

  -- DOE MSIPP grant to UNLV
  ('2025-01-15', 'grant', 'UNLV',
   'DOE awards UNLV $5.6M/year MSIPP Consortia Grant (2025-2030) for Nevada National Security Consortium. Separate $2M/year nuclear sciences grant (2024-2031).',
   'award',
   'https://goed.nv.gov/wp-content/uploads/2025/03/AIC-ARC-Knowledge-Fund-Report-October-2024-Final.pdf',
   true),

  -- Cumulus Weather Solutions DRI spinout
  ('2018-06-01', 'launch', 'DRI',
   'DRI spins out Cumulus Weather Solutions LLC — weather decision support for wind and solar energy. First product of DRI-UNLV joint tech transfer partnership.',
   'rocket',
   'https://www.unlv.edu/news/release/unlv-desert-research-institute-partner-help-nevada-scientists-commercialize-discovery',
   true)

ON CONFLICT (company_name, event_type, event_date) DO NOTHING;


-- ============================================================
-- SECTION 7: STAKEHOLDER ACTIVITIES
-- ============================================================

INSERT INTO stakeholder_activities (
  activity_date, activity_type, company_id, description,
  location, source, data_quality, stakeholder_type,
  display_name, source_url
)
VALUES
  ('2024-07-02', 'Grant', 'u_unr',
   'EDA awards $21M to UNR-led Nevada Lithium Batteries & EV Materials Loop Tech Hub. One of 12 funded nationally.',
   'Reno', 'U.S. EDA', 'VERIFIED', 'gov_policy',
   'UNR Nevada Tech Hub — $21M EDA Award',
   'https://www.eda.gov/news/press-release/2024/07/02/Nevada-Tech-Hub'),

  ('2024-02-01', 'Partnership', 'u_dri',
   'DRI and UNLV partner on NSF Southwest Sustainability Innovation Engine (SWSIE) for climate and water innovation.',
   'Las Vegas', 'NSHE', 'VERIFIED', 'university',
   'DRI-UNLV Climate Innovation Consortium',
   'https://www.dri.edu/dri-unlv-to-partner-on-regional-climate-innovation-consortium/'),

  ('2025-04-01', 'Launch', 'u_unlv',
   'UNLV launches InnovateNV 9-week SBIR/STTR Proposal Accelerator with $5K Phase 0 microgrants.',
   'Las Vegas', 'UNLV', 'VERIFIED', 'university',
   'UNLV InnovateNV SBIR Accelerator Launch',
   'https://www.unlv.edu/econdev/researchers-faculty/innovatenv'),

  ('2026-01-15', 'Partnership', 'u_unr',
   'UNR-managed Nevada UAS Test Site and Eagle Field Airport form strategic partnership for UAS and Advanced Air Mobility R&D.',
   'Reno', 'UNR', 'VERIFIED', 'university',
   'Nevada UAS Test Site — Eagle Field Partnership',
   'https://www.unr.edu/nevada-today/news/2026/nv-uas-and-eagle-field-airport-form-partnership'),

  ('2025-03-01', 'Grant', 'u_unlv',
   'NSF SWSIE distributes $1.5M in innovation grants to 8 startups including WAVR Technologies; 15 catalyst grants across NV/UT/AZ.',
   'Las Vegas', 'NSF', 'VERIFIED', 'gov_policy',
   'SWSIE $1.5M Innovation Grants',
   'https://www.unlv.edu/news/unlvtoday/unlv-startup-earns-funding-nsf-southwest-sustainability-innovation-engine'),

  ('2023-09-15', 'Grant', 'u_dri',
   'GOED invests $1.8M in DRI WaterStart program for water technology development via American Rescue Plan + Knowledge Fund.',
   'Las Vegas', 'GOED', 'VERIFIED', 'gov_policy',
   'GOED $1.8M WaterStart Investment',
   'https://goed.nv.gov/newsroom/1-8-million-goed-investment-in-waterstart-marks-decisive-support-for-the-development-of-water-technologies-in-nevada-and-the-southwest/'),

  ('2025-01-15', 'Grant', 'u_unlv',
   'DOE awards UNLV $5.6M/year MSIPP Consortia Grant (2025-2030) for Nevada National Security Consortium.',
   'Las Vegas', 'DOE', 'VERIFIED', 'gov_policy',
   'DOE $5.6M/yr MSIPP Grant to UNLV',
   'https://goed.nv.gov/wp-content/uploads/2025/03/AIC-ARC-Knowledge-Fund-Report-October-2024-Final.pdf')

ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

COMMIT;
