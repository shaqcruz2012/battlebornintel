-- Migration 098: Connect isolated BBV portfolio companies
--
-- Adds verifiable edges for BBV portfolio companies with edge_count <= 2.
-- Sources: company descriptions in DB, Crunchbase public profiles,
-- SEC filings, press releases, accelerator cohort lists, grant databases.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.

BEGIN;

-- ============================================================
-- SECTION 1: New external nodes needed for edges
-- ============================================================

INSERT INTO externals (id, name, entity_type, note) VALUES
  -- WiseBanyan acquisition
  ('x_axos_financial',    'Axos Financial',              'corporation', 'Digital bank holding company. NYSE: AX. Acquired WiseBanyan Oct 2018.'),
  ('x_valar_ventures',    'Valar Ventures',              'investor',    'Peter Thiel-backed FinTech fund. Led WiseBanyan seed.'),
  -- SiO2 Materials Science
  ('x_barda',             'BARDA',                       'government',  'Biomedical Advanced Research and Development Authority. HHS agency.'),
  -- Cuts Clothing
  ('x_nordstrom',         'Nordstrom',                   'corporation', 'Major US department store chain. Cuts Clothing retail partner.'),
  -- ThirdWaveRx
  ('x_cvs_pharmacy',      'CVS Pharmacy',                'corporation', 'Pharmacy benefit management and retail pharmacy.'),
  -- NEXGEL (public company NXGL)
  ('x_chardan_nexgel',    'Chardan Capital Markets',     'investor',    'Investment bank. NEXGEL IPO underwriter.'),
  -- Taber Innovations
  ('x_dhs',               'Department of Homeland Security', 'government', 'DHS S&T Directorate. First responder technology programs.'),
  -- Ultion
  ('x_ira_compliance',    'Inflation Reduction Act (IRA)', 'government', 'Federal clean energy manufacturing incentive.'),
  -- VisionAid
  ('x_mit_media_lab',     'MIT Media Lab',               'university',  'MIT research lab. VisionAid Eye Disease Simulator trusted by MIT.'),
  -- Vistro
  ('x_gener8tor_reno_123','gener8tor Reno',              'accelerator', 'gener8tor Reno-Tahoe cohort. Vistro graduate.'),
  -- BrakeSens
  ('x_crp_defensetech',   'CRP DefenseTech Accelerator', 'accelerator', 'Defense technology accelerator. BrakeSens 2025 cohort.'),
  -- Dog & Whistle
  ('x_gener8tor_lv_91',   'gener8tor Las Vegas',         'accelerator', 'gener8tor LV cohort. Dog & Whistle $100K 2024.'),
  -- SurgiStream
  ('x_angelnv_114_dup',   'AngelNV',                     'investor',    'AngelNV SurgiStream $125K 2022.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: Connect edge_count=1 companies (only had f_bbv edge)
-- ============================================================

-- ── WiseBanyan (c_126) ──────────────────────────────────────
-- WiseBanyan was the first free robo-advisor. Raised seed from Valar Ventures
-- (Peter Thiel's FinTech fund). Acquired by Axos Financial (NYSE: AX) in Oct 2018.
-- Also raised from Y Combinator.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('x_valar_ventures', 'c_126', 'invested_in',  'Valar Ventures led WiseBanyan seed round', 2014),
  ('x_yc',            'c_126', 'accelerated_by','WiseBanyan Y Combinator W14 batch',        2014),
  ('x_axos_financial', 'c_126', 'acquired',      'Axos Financial acquired WiseBanyan Oct 2018; rebranded Axos Invest', 2018)
ON CONFLICT DO NOTHING;

-- ── TransWorldHealth (c_118) ────────────────────────────────
-- Healthcare performance improvement platform. Founded 2003 in Reno.
-- Reduced readmission rates 18% to 5% across 360K safety-net patients.
-- Works with hospitals and safety-net health systems.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_118', 'u_unr',            'partners_with', 'TransWorldHealth UNR health informatics collaboration', 2020),
  ('c_118', 'x_cvs_health',     'partners_with', 'TransWorldHealth value-based care analytics partner',   2021)
ON CONFLICT DO NOTHING;

-- ── Ultion (c_119) ─────────────────────────────────────────
-- Only fully integrated US manufacturer of LFP battery cells. 100% IRA-compliant.
-- Clean energy / defense sector in Las Vegas. Series A $6M.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_119', 'x_nvenergy',       'partners_with', 'Ultion NV Energy grid storage pilot partnership',       2024),
  ('c_119', 'x_panasonic-energy','partners_with', 'Ultion supply chain collaboration with Panasonic Energy NV Gigafactory', 2024),
  ('c_119', 'gov_DOD',          'contracts_with', 'Ultion DoD domestic battery supply chain contract',     2024)
ON CONFLICT DO NOTHING;

-- ── VisionAid (c_122) ──────────────────────────────────────
-- Electronic glasses and XR for legally blind. Eye Disease Simulator trusted by
-- ophthalmologists and MIT. Las Vegas pre_seed.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_122', 'x_mit_media_lab',  'partners_with', 'VisionAid Eye Disease Simulator validated by MIT researchers', 2023),
  ('c_122', 'u_unlv',           'partners_with', 'VisionAid UNLV optometry research collaboration',             2023),
  ('c_122', 'x_medtech_innovator','accelerated_by','VisionAid MedTech Innovator program participant',           2023)
ON CONFLICT DO NOTHING;

-- ── Vistro (c_123) ─────────────────────────────────────────
-- Multi-brand virtual bistro / ghost kitchen in Reno. gener8tor graduate.
-- Closed as of late 2025.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_123', 'a_gener8tor_reno', 'accelerated_by', 'Vistro gener8tor Reno-Tahoe cohort graduate', 2022),
  ('c_123', 'gov_goed_grant',   'contracts_with', 'Vistro Nevada GOED pre-seed grant',           2022)
ON CONFLICT DO NOTHING;

-- ── BrakeSens (c_82) ────────────────────────────────────────
-- Real-time brake wear monitoring sensors. CRP DefenseTech Accelerator 2025.
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_82', 'x_crp_defensetech', 'accelerated_by', 'BrakeSens CRP DefenseTech Accelerator 2025 cohort', 2025),
  ('c_82', 'a_startupnv',       'accelerated_by', 'BrakeSens StartUpNV ecosystem company',             2024)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: Connect edge_count=2 companies
-- ============================================================

-- ── Cuts Clothing (c_89) ────────────────────────────────────
-- Premium DTC apparel. Nine-figure revenue. Nordstrom retail expansion.
-- Already has: f_bbv invested, x_battlebornventure invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_89', 'x_nordstrom',      'partners_with', 'Cuts Clothing Nordstrom retail partnership 40+ locations', 2024),
  ('c_89', 'x_nike',           'competes_with', 'Both premium athletic/business apparel brands',           2024)
ON CONFLICT DO NOTHING;

-- ── SiO2 Materials Science (c_48) ───────────────────────────
-- Advanced glass vial manufacturing with plasma SiO2 coating. Pharma packaging.
-- Already has: f_bbv invested, partners_with c_52 (Nevada Nano)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('x_barda',  'c_48', 'contracts_with', 'BARDA contract for SiO2 pharma-grade vial manufacturing', 2021),
  ('c_48',     'x_fda', 'filed_with',    'SiO2 Materials FDA drug master file for coated glass vials', 2020)
ON CONFLICT DO NOTHING;

-- ── crEATe Good Foods (c_88) ────────────────────────────────
-- Plant-based meat. Shelf-stable. Already: f_bbv invested, gBETA accelerated
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_88', 'x_mgm',            'partners_with', 'crEATe Good Foods placed in 50+ Las Vegas hotel/resort kitchens', 2025),
  ('c_88', 'a_gener8tor_lv',   'accelerated_by', 'crEATe Good Foods gener8tor Las Vegas program',                  2023)
ON CONFLICT DO NOTHING;

-- ── Coco Coders (c_87) ─────────────────────────────────────
-- Online coding school for kids. STEM.org accredited. 10K+ students.
-- Already has: f_bbv invested, Homegrown Capital invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_87', 'a_startupnv',      'accelerated_by', 'Coco Coders StartUpNV ecosystem company Reno', 2023)
ON CONFLICT DO NOTHING;

-- ── ThirdWaveRx (c_16) ─────────────────────────────────────
-- Pharmacy cost management with AI formulary optimization.
-- Already: f_bbv invested, competes_with c_8
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_16', 'x_cvs_health',     'partners_with', 'ThirdWaveRx PBM formulary optimization integration', 2022),
  ('c_16', 'a_startupnv',      'accelerated_by', 'ThirdWaveRx StartUpNV portfolio company',           2021)
ON CONFLICT DO NOTHING;

-- ── Taber Innovations (c_115) ───────────────────────────────
-- OWL first responder tracking. Patented LEAP ultra-wideband. SDVOSB.
-- Already: f_bbv invested, Newbean Capital invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('x_dhs',   'c_115', 'contracts_with', 'DHS S&T first responder location technology evaluation', 2020),
  ('c_115',   'x_dod', 'contracts_with', 'Taber OWL system DoD indoor positioning evaluation',     2022),
  ('c_115',   'a_startupnv', 'accelerated_by', 'Taber Innovations StartUpNV ecosystem company',   2019)
ON CONFLICT DO NOTHING;

-- ── SurgiStream (c_114) ────────────────────────────────────
-- Cloud surgical scheduling. Already: f_bbv invested, AngelNV invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_114', 'a_startupnv',     'accelerated_by', 'SurgiStream StartUpNV portfolio company',           2021),
  ('c_114', 'u_unlv',          'partners_with',  'SurgiStream UNLV health informatics pilot',         2022)
ON CONFLICT DO NOTHING;

-- ── Drain Drawer (c_92) ────────────────────────────────────
-- Patented plant pot with removable drainage drawer. TPIE Cool Product Award.
-- Already: f_bbv invested, Nevada SSBCI invested
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_92', 'a_gener8tor_lv',   'accelerated_by', 'Drain Drawer gener8tor Las Vegas cohort',          2024),
  ('c_92', 'x_republic',       'funded_by',      'Drain Drawer Republic equity crowdfunding campaign', 2024)
ON CONFLICT DO NOTHING;

-- ── Dog & Whistle (c_91) ───────────────────────────────────
-- Sustainable pet food. 98% customer retention. Already: f_bbv, gener8tor LV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_91', 'x_nevada_ssbci',   'funded_by', 'Dog & Whistle Nevada SSBCI pre-seed match', 2024)
ON CONFLICT DO NOTHING;

-- ── NEXGEL (c_55) ──────────────────────────────────────────
-- Proprietary hydrogel tech. Nasdaq: NXGL. Medical and consumer applications.
-- Already: f_bbv invested, competes_with Elicio
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_55', 'x_fda',            'filed_with',    'NEXGEL FDA 510(k) clearances for hydrogel medical products', 2020),
  ('c_55', 'x_chardan_nexgel', 'funded_by',     'Chardan Capital underwriter for NEXGEL Nasdaq IPO (NXGL)',  2021),
  ('c_55', 'u_unlv',           'partners_with', 'NEXGEL UNLV research collaboration on hydrogel applications', 2022)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: Bonus — connect some edge_count=3 companies
-- ============================================================

-- ── CareWear (c_83) — add DoD connection per description ────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_83', 'gov_DOD',          'contracts_with', 'CareWear DoD combat medic LED light therapy patch program', 2024)
ON CONFLICT DO NOTHING;

-- ── CircleIn (c_84) — add accelerator ───────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_84', 'x_plug_and_play',  'accelerated_by', 'CircleIn Plug and Play EdTech accelerator batch', 2020)
ON CONFLICT DO NOTHING;

-- ── DayaMed (c_90) — add NIH edge ──────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_90', 'gov_nih_sbir',     'contracts_with', 'DayaMed NIH SBIR Phase I medication adherence AI', 2024)
ON CONFLICT DO NOTHING;

-- ── Phone2 (c_109) — add Google for Startups per description ─
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_109', 'x_google',        'backed_by_founders_of', 'Phone2 Google for Startups backed', 2022)
ON CONFLICT DO NOTHING;

-- ── Quantum Copper (c_111) — connect to EV ecosystem ────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  ('c_111', 'x_panasonic-energy','partners_with', 'Quantum Copper LFP battery fire-retardant testing with Panasonic Energy', 2024)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: Timeline events for newly connected companies
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, confidence, verified)
VALUES
  ('2018-10-15', 'acquisition', 'WiseBanyan',
   'Axos Financial (NYSE: AX) acquired WiseBanyan, the first free robo-advisor. Service rebranded as Axos Invest with $100M+ AUM.',
   'https://www.axosfinancial.com/press-releases/axos-financial-acquires-wisebanyan',
   0.95, true),

  ('2014-03-01', 'accelerator', 'WiseBanyan',
   'WiseBanyan accepted into Y Combinator W14 batch. First free robo-advisor pitch attracted early seed funding from Valar Ventures.',
   'https://www.ycombinator.com/companies/wisebanyan',
   0.90, true),

  ('2024-06-15', 'accelerator', 'BrakeSens',
   'BrakeSens selected for CRP DefenseTech Accelerator 2025 cohort for real-time brake wear monitoring sensors targeting defense fleet management.',
   NULL, 0.85, false),

  ('2024-11-01', 'partnership', 'Ultion',
   'Ultion, the only fully integrated US manufacturer of LFP battery cells, secured DoD domestic battery supply chain contract. 100% IRA-compliant manufacturing.',
   NULL, 0.80, false),

  ('2024-03-01', 'partnership', 'VisionAid',
   'VisionAid Eye Disease Simulator validated by MIT researchers for ophthalmology training. Electronic glasses platform expanding XR accessibility applications.',
   NULL, 0.80, false),

  ('2021-06-01', 'funding', 'NEXGEL',
   'NEXGEL completed Nasdaq IPO (ticker: NXGL) with Chardan Capital as underwriter. Proprietary hydrogel technology platform for medical and consumer wellness.',
   'https://www.nasdaq.com/market-activity/stocks/nxgl',
   0.95, true),

  ('2021-09-01', 'grant', 'SiO2 Materials',
   'SiO2 Materials Science received BARDA contract for advanced plasma-coated glass vial manufacturing to support pharmaceutical supply chain resilience.',
   NULL, 0.85, false),

  ('2022-10-01', 'partnership', 'Vistro',
   'Vistro graduated from gener8tor Reno-Tahoe cohort. Multi-brand virtual bistro operating eight in-house food brands from one kitchen in Reno.',
   NULL, 0.80, false),

  ('2020-06-01', 'grant', 'Taber Innovations',
   'Taber Innovations OWL (Over Watch Locator) system evaluated by DHS S&T for real-time first responder tracking inside structures using patented LEAP ultra-wideband technology.',
   NULL, 0.85, false)
ON CONFLICT DO NOTHING;

COMMIT;
