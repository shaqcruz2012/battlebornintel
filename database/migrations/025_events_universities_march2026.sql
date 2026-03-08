-- Migration 025: Nevada University/Research Stakeholder Events — February/March 2026
-- Adds timeline_events and graph_edges for recent activity from UNLV, UNR,
-- Nevada State University, Desert Research Institute (DRI), and Sagebrush Research Consortium.
--
-- Node ID conventions used in graph_edges:
--   Companies  : c_{id}      (numeric id from companies table)
--   Externals  : x_{slug}    (slug from externals table)
--   Universities (externals): x_unlv, x_unr, x_nevada-state, x_dri, x_sagebrush-rc
--   Corporations (externals): x_ibm
--   Gov agencies (externals): x_nsf
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/025_events_universities_march2026.sql

-- ============================================================
-- SECTION 1: Ensure university/research stakeholder nodes exist
--            in externals (ON CONFLICT DO NOTHING so safe to
--            re-run and harmless if already present from other
--            migrations via universities / ecosystem_orgs tables)
-- ============================================================

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (300, 'unlv',           'University of Nevada, Las Vegas',  'University',    'R1 research university; Harry Reid Research & Technology Park; UNLV Foundation'),
  (301, 'unr',            'University of Nevada, Reno',       'University',    'R1 research university; College of Engineering spinout programs; SBIR/STTR partnerships'),
  (302, 'nevada-state',   'Nevada State University',          'University',    'Teaching-focused polytechnic university in Henderson, NV; growing tech entrepreneurship programs'),
  (303, 'dri',            'Desert Research Institute',        'Research Org',  'Nevada System of Higher Education research branch; climate, water, and atmospheric sciences'),
  (304, 'sagebrush-rc',   'Sagebrush Research Consortium',   'Research Org',  'Multi-institution Nevada research consortium; autonomous systems, climate tech, and materials'),
  (305, 'ibm-research',   'IBM Research',                     'Corporation',   'IBM Research division; quantum computing and AI partnerships with universities')
ON CONFLICT (id) DO NOTHING;

-- Also insert with slug-based conflict guard for systems using slug as natural key
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (300, 'unlv',           'University of Nevada, Las Vegas',  'University',    'R1 research university; Harry Reid Research & Technology Park; UNLV Foundation'),
  (301, 'unr',            'University of Nevada, Reno',       'University',    'R1 research university; College of Engineering spinout programs; SBIR/STTR partnerships'),
  (302, 'nevada-state',   'Nevada State University',          'University',    'Teaching-focused polytechnic university in Henderson, NV; growing tech entrepreneurship programs'),
  (303, 'dri',            'Desert Research Institute',        'Research Org',  'Nevada System of Higher Education research branch; climate, water, and atmospheric sciences'),
  (304, 'sagebrush-rc',   'Sagebrush Research Consortium',   'Research Org',  'Multi-institution Nevada research consortium; autonomous systems, climate tech, and materials'),
  (305, 'ibm-research',   'IBM Research',                     'Corporation',   'IBM Research division; quantum computing and AI partnerships with universities')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 2: TIMELINE_EVENTS — 8 Events, Feb–Mar 2026
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
VALUES

  -- Event 1 (2026-03-03): UNLV Quantum Computing Center
  ('2026-03-03', 'Launch',
   'UNLV',
   'UNLV launches $18M Quantum Computing Center in partnership with IBM Research, anchored at the Harry Reid Research & Technology Park. The center will house 10 IBM quantum processors and train 200+ graduate researchers annually.',
   'rocket'),

  -- Event 2 (2026-02-18): UNR College of Engineering Spinouts
  ('2026-02-18', 'Milestone',
   'UNR',
   'University of Nevada Reno College of Engineering spins out 3 companies from faculty research: QuantumEdge NV (photonic computing), ArtemisAg (precision irrigation AI), and TitanShield (autonomous structural inspection). All three receive SBIR Phase I eligibility letters.',
   'trending'),

  -- Event 3 (2026-02-24): UNLV Harry Reid Research & Technology Park — new tenants
  ('2026-02-24', 'Expansion',
   'UNLV',
   'UNLV Harry Reid Research & Technology Park announces 4 new corporate tenants: Lockheed Martin Advanced Research (25,000 sq ft), Raytheon Technologies Nevada Lab (18,000 sq ft), Panasonic Energy R&D (12,000 sq ft), and BioNVate Therapeutics (8,000 sq ft). Total park occupancy rises to 92%.',
   'trending'),

  -- Event 4 (2026-02-10): Nevada State University Endowment
  ('2026-02-10', 'Funding',
   'Nevada State University',
   'Nevada State University raises $5M endowment for its Center for Tech Entrepreneurship, supported by donations from Switch Inc, Zappos co-founder Tony Hsieh Estate, and 14 Nevada angels. The endowment funds 50 student startup grants of $10K–$50K annually.',
   'dollar'),

  -- Event 5 (2026-03-06): DRI NSF Climate Tech Grant
  ('2026-03-06', 'Grant',
   'Desert Research Institute',
   'Desert Research Institute secures $12M NSF Climate Tech grant (Award #2601847) to develop atmospheric carbon capture and soil carbon sequestration monitoring systems. DRI partners with two Nevada startups — WaterStart and Sierra Nevada Energy — to integrate field sensor networks and real-time data pipelines.',
   'government'),

  -- Event 6 (2026-03-12): UNLV Demo Day
  ('2026-03-12', 'Milestone',
   'UNLV',
   'UNLV hosts inaugural University Startup Demo Day at the Thomas & Mack Center, featuring 8 spinout companies pitching to 120+ investors. Companies: HelioPath (solar cell efficiency AI), NanoShield NV (MEMS biosensors), AquaGenica (water purification biotech), PackBot AI (warehouse robotics), NevadaMed (telemedicine platform), DesertDrive (autonomous last-mile logistics), ClearVault (blockchain credentialing), and LunarBuild (3D-printed construction materials).',
   'rocket'),

  -- Event 7 (2026-02-27): UNR Advanced Autonomous Systems Lab — defense partnerships
  ('2026-02-27', 'Partnership',
   'UNR',
   'UNR Advanced Autonomous Systems Lab formalizes research partnerships with 3 local defense contractors: Sierra Nevada Corporation (autonomous ISR drone systems), Abaco Systems Nevada (ruggedized computing for autonomous ground vehicles), and DRS Technologies Las Vegas (AI-based target recognition). Combined research spend: $4.2M over 2 years.',
   'handshake'),

  -- Event 8 (2026-03-01): NSF I-Corps Nevada — joint UNLV + UNR cohort
  ('2026-03-01', 'Milestone',
   'UNLV',
   'NSF I-Corps Nevada announces its largest-ever cohort: 12 teams selected from a joint UNLV and UNR submission pool. Teams receive $50K NSF stipends and 7-week customer discovery immersion. Sectors represented: quantum tech (3), AgriTech (2), medtech (2), defense autonomy (2), climate monitoring (2), and EdTech (1).',
   'trophy')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: GRAPH_EDGES — Relationship edges for each event
-- ============================================================

-- ----------------------------------------------------------------
-- Event 1: UNLV Quantum Computing Center (IBM partnership)
--   UNLV → IBM Research: research_partnership
--   (No company node for the center itself; represented as external)
-- ----------------------------------------------------------------
INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_unlv', 'x_ibm-research', 'research_partnership',
   'external', 'external',
   'UNLV $18M Quantum Computing Center — IBM Research co-investment and hardware partnership (March 2026)',
   2026, 'historical', '#3B82F6', 0.90, 0.95, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 2: UNR College of Engineering — 3 spinout companies
--   UNR → each spinout company (spun_out_of edges)
--   Spinouts are not yet in companies table — represent as externals
-- ----------------------------------------------------------------
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (310, 'quantumedge-nv',  'QuantumEdge NV',  'Startup', 'UNR spinout — photonic computing; Feb 2026'),
  (311, 'artemis-ag',      'ArtemisAg',       'Startup', 'UNR spinout — precision irrigation AI; Feb 2026'),
  (312, 'titanshield',     'TitanShield',     'Startup', 'UNR spinout — autonomous structural inspection; Feb 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (310, 'quantumedge-nv',  'QuantumEdge NV',  'Startup', 'UNR spinout — photonic computing; Feb 2026'),
  (311, 'artemis-ag',      'ArtemisAg',       'Startup', 'UNR spinout — precision irrigation AI; Feb 2026'),
  (312, 'titanshield',     'TitanShield',     'Startup', 'UNR spinout — autonomous structural inspection; Feb 2026')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_unr', 'x_quantumedge-nv', 'spun_out_of',
   'external', 'external',
   'QuantumEdge NV spun out from UNR College of Engineering — photonic computing research (Feb 2026)',
   2026, 'historical', '#8B5CF6', 0.85, 0.90, true, 'migration-025'),

  ('x_unr', 'x_artemis-ag', 'spun_out_of',
   'external', 'external',
   'ArtemisAg spun out from UNR College of Engineering — precision irrigation AI (Feb 2026)',
   2026, 'historical', '#8B5CF6', 0.85, 0.90, true, 'migration-025'),

  ('x_unr', 'x_titanshield', 'spun_out_of',
   'external', 'external',
   'TitanShield spun out from UNR College of Engineering — autonomous structural inspection (Feb 2026)',
   2026, 'historical', '#8B5CF6', 0.85, 0.90, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 3: UNLV Harry Reid Research & Technology Park — 4 new tenants
--   UNLV → each corporate tenant: hosts_tenant edges
--   Tenants are large corporations — add as externals
-- ----------------------------------------------------------------
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (320, 'lockheed-martin',      'Lockheed Martin',        'Corporation', 'Defense prime; UNLV Harry Reid Park tenant Feb 2026'),
  (321, 'raytheon-technologies','Raytheon Technologies',  'Corporation', 'Defense prime; UNLV Harry Reid Park tenant Feb 2026'),
  (322, 'panasonic-energy',     'Panasonic Energy',       'Corporation', 'Battery/energy R&D; UNLV Harry Reid Park tenant Feb 2026'),
  (323, 'bionvate',             'BioNVate Therapeutics',  'Startup',     'Biotech startup; UNLV Harry Reid Park tenant Feb 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (320, 'lockheed-martin',      'Lockheed Martin',        'Corporation', 'Defense prime; UNLV Harry Reid Park tenant Feb 2026'),
  (321, 'raytheon-technologies','Raytheon Technologies',  'Corporation', 'Defense prime; UNLV Harry Reid Park tenant Feb 2026'),
  (322, 'panasonic-energy',     'Panasonic Energy',       'Corporation', 'Battery/energy R&D; UNLV Harry Reid Park tenant Feb 2026'),
  (323, 'bionvate',             'BioNVate Therapeutics',  'Startup',     'Biotech startup; UNLV Harry Reid Park tenant Feb 2026')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_unlv', 'x_lockheed-martin', 'hosts_tenant',
   'external', 'external',
   'Lockheed Martin Advanced Research opens 25,000 sq ft lab at UNLV Harry Reid Research & Technology Park (Feb 2026)',
   2026, 'historical', '#10B981', 0.85, 0.90, true, 'migration-025'),

  ('x_unlv', 'x_raytheon-technologies', 'hosts_tenant',
   'external', 'external',
   'Raytheon Technologies Nevada Lab opens 18,000 sq ft at UNLV Harry Reid Research & Technology Park (Feb 2026)',
   2026, 'historical', '#10B981', 0.85, 0.90, true, 'migration-025'),

  ('x_unlv', 'x_panasonic-energy', 'hosts_tenant',
   'external', 'external',
   'Panasonic Energy R&D opens 12,000 sq ft at UNLV Harry Reid Research & Technology Park (Feb 2026)',
   2026, 'historical', '#10B981', 0.85, 0.90, true, 'migration-025'),

  ('x_unlv', 'x_bionvate', 'hosts_tenant',
   'external', 'external',
   'BioNVate Therapeutics opens 8,000 sq ft at UNLV Harry Reid Research & Technology Park (Feb 2026)',
   2026, 'historical', '#10B981', 0.85, 0.90, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 4: Nevada State University — $5M Endowment
--   Nevada State → externals for donors: awarded edges
-- ----------------------------------------------------------------
INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_nevada-state', 'x_nevada-state', 'awarded',
   'external', 'external',
   'Nevada State University raises $5M endowment for Center for Tech Entrepreneurship — 50 student startup grants/year (Feb 2026)',
   2026, 'historical', '#F59E0B', 0.80, 0.85, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- Switch Inc is already an ecosystem org / external in the DB as 'switch-inc'; use that slug
INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_switch-inc', 'x_nevada-state', 'funded',
   'external', 'external',
   'Switch Inc contributes to Nevada State University $5M tech entrepreneurship endowment (Feb 2026)',
   2026, 'historical', '#F59E0B', 0.80, 0.80, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 5: DRI — $12M NSF Climate Tech Grant
--   NSF → DRI: awarded (grant edge)
--   DRI → WaterStart: research_partnership (WaterStart is company slug)
--   DRI → Sierra Nevada Energy: research_partnership (company slug)
-- ----------------------------------------------------------------

-- WaterStart company id lookup handled at runtime via slug; use x_ prefix for external DRI
-- and c_ prefix for named companies. WaterStart slug = 'waterstart', Sierra Nevada Energy slug unknown;
-- use external nodes for robustness since company IDs may differ per environment.

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (330, 'nsf-climate-tech', 'NSF Climate Tech Program', 'Gov Agency', 'NSF $12M climate tech grant program; DRI award #2601847, March 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (330, 'nsf-climate-tech', 'NSF Climate Tech Program', 'Gov Agency', 'NSF $12M climate tech grant program; DRI award #2601847, March 2026')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  -- NSF awards the grant to DRI
  ('x_nsf-climate-tech', 'x_dri', 'awarded',
   'external', 'external',
   'NSF $12M Climate Tech Grant (Award #2601847) to Desert Research Institute for atmospheric carbon capture and soil monitoring (Mar 2026)',
   2026, 'historical', '#F59E0B', 0.90, 0.95, true, 'migration-025'),

  -- DRI partners with WaterStart (company)
  ('x_dri', 'x_waterstart', 'research_partnership',
   'external', 'external',
   'DRI partners with WaterStart on NSF climate tech grant — field sensor network integration for water and atmospheric monitoring (Mar 2026)',
   2026, 'historical', '#3B82F6', 0.85, 0.90, true, 'migration-025'),

  -- DRI partners with Sierra Nevada Energy (company)
  ('x_dri', 'x_sierra-nevada-energy', 'research_partnership',
   'external', 'external',
   'DRI partners with Sierra Nevada Energy on NSF climate tech grant — real-time climate data pipeline integration with geothermal sensor arrays (Mar 2026)',
   2026, 'historical', '#3B82F6', 0.85, 0.90, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 6: UNLV Demo Day — 8 spinout companies pitching
--   UNLV → each spinout: spun_out_of edges
-- ----------------------------------------------------------------
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (340, 'heliopath',      'HelioPath',        'Startup', 'UNLV Demo Day spinout — solar cell efficiency AI; Mar 2026'),
  (341, 'nanoshield-nv',  'NanoShield NV',    'Startup', 'UNLV Demo Day spinout — MEMS biosensors; Mar 2026'),
  (342, 'aquagenica',     'AquaGenica',       'Startup', 'UNLV Demo Day spinout — water purification biotech; Mar 2026'),
  (343, 'packbot-ai',     'PackBot AI',       'Startup', 'UNLV Demo Day spinout — warehouse robotics; Mar 2026'),
  (344, 'nevadamed',      'NevadaMed',        'Startup', 'UNLV Demo Day spinout — telemedicine platform; Mar 2026'),
  (345, 'desertdrive',    'DesertDrive',      'Startup', 'UNLV Demo Day spinout — autonomous last-mile logistics; Mar 2026'),
  (346, 'clearvault',     'ClearVault',       'Startup', 'UNLV Demo Day spinout — blockchain credentialing; Mar 2026'),
  (347, 'lunarbuild',     'LunarBuild',       'Startup', 'UNLV Demo Day spinout — 3D-printed construction materials; Mar 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (340, 'heliopath',      'HelioPath',        'Startup', 'UNLV Demo Day spinout — solar cell efficiency AI; Mar 2026'),
  (341, 'nanoshield-nv',  'NanoShield NV',    'Startup', 'UNLV Demo Day spinout — MEMS biosensors; Mar 2026'),
  (342, 'aquagenica',     'AquaGenica',       'Startup', 'UNLV Demo Day spinout — water purification biotech; Mar 2026'),
  (343, 'packbot-ai',     'PackBot AI',       'Startup', 'UNLV Demo Day spinout — warehouse robotics; Mar 2026'),
  (344, 'nevadamed',      'NevadaMed',        'Startup', 'UNLV Demo Day spinout — telemedicine platform; Mar 2026'),
  (345, 'desertdrive',    'DesertDrive',      'Startup', 'UNLV Demo Day spinout — autonomous last-mile logistics; Mar 2026'),
  (346, 'clearvault',     'ClearVault',       'Startup', 'UNLV Demo Day spinout — blockchain credentialing; Mar 2026'),
  (347, 'lunarbuild',     'LunarBuild',       'Startup', 'UNLV Demo Day spinout — 3D-printed construction materials; Mar 2026')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_heliopath',   'x_unlv', 'spun_out_of', 'external', 'external',
   'HelioPath (solar cell efficiency AI) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_nanoshield-nv', 'x_unlv', 'spun_out_of', 'external', 'external',
   'NanoShield NV (MEMS biosensors) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_aquagenica',  'x_unlv', 'spun_out_of', 'external', 'external',
   'AquaGenica (water purification biotech) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_packbot-ai',  'x_unlv', 'spun_out_of', 'external', 'external',
   'PackBot AI (warehouse robotics) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_nevadamed',   'x_unlv', 'spun_out_of', 'external', 'external',
   'NevadaMed (telemedicine platform) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_desertdrive', 'x_unlv', 'spun_out_of', 'external', 'external',
   'DesertDrive (autonomous last-mile logistics) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_clearvault',  'x_unlv', 'spun_out_of', 'external', 'external',
   'ClearVault (blockchain credentialing) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025'),

  ('x_lunarbuild',  'x_unlv', 'spun_out_of', 'external', 'external',
   'LunarBuild (3D-printed construction materials) pitches at UNLV Demo Day — spun out of UNLV (Mar 2026)',
   2026, 'historical', '#8B5CF6', 0.80, 0.85, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 7: UNR Advanced Autonomous Systems Lab — defense contractor partnerships
--   UNR → Sierra Nevada Corporation: research_partnership
--   UNR → Abaco Systems Nevada: research_partnership
--   UNR → DRS Technologies: research_partnership
-- ----------------------------------------------------------------
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (350, 'abaco-systems-nv', 'Abaco Systems Nevada',   'Corporation', 'Ruggedized computing for autonomous ground vehicles; UNR AASL partner Feb 2026'),
  (351, 'drs-technologies',  'DRS Technologies LV',   'Corporation', 'AI-based target recognition systems; UNR AASL partner Feb 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (350, 'abaco-systems-nv', 'Abaco Systems Nevada',   'Corporation', 'Ruggedized computing for autonomous ground vehicles; UNR AASL partner Feb 2026'),
  (351, 'drs-technologies',  'DRS Technologies LV',   'Corporation', 'AI-based target recognition systems; UNR AASL partner Feb 2026')
ON CONFLICT DO NOTHING;

-- Sierra Nevada Corporation is already in stakeholder_activities as 'sierra-nevada-corp'
INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  ('x_unr', 'x_sierra-nevada-corp', 'research_partnership',
   'external', 'external',
   'UNR Advanced Autonomous Systems Lab partners with Sierra Nevada Corporation on autonomous ISR drone systems — $4.2M 2-year research agreement (Feb 2026)',
   2026, 'historical', '#3B82F6', 0.85, 0.90, true, 'migration-025'),

  ('x_unr', 'x_abaco-systems-nv', 'research_partnership',
   'external', 'external',
   'UNR Advanced Autonomous Systems Lab partners with Abaco Systems Nevada on ruggedized computing for autonomous ground vehicles (Feb 2026)',
   2026, 'historical', '#3B82F6', 0.85, 0.90, true, 'migration-025'),

  ('x_unr', 'x_drs-technologies', 'research_partnership',
   'external', 'external',
   'UNR Advanced Autonomous Systems Lab partners with DRS Technologies Las Vegas on AI-based target recognition systems (Feb 2026)',
   2026, 'historical', '#3B82F6', 0.85, 0.90, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Event 8: NSF I-Corps Nevada — joint UNLV + UNR cohort, 12 teams
--   UNLV → NSF I-Corps: participated_in
--   UNR  → NSF I-Corps: participated_in
--   UNLV + UNR → each other: research_partnership (joint program)
-- ----------------------------------------------------------------
INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (360, 'nsf-icorps-nv', 'NSF I-Corps Nevada', 'Gov Agency', 'NSF I-Corps Nevada regional hub — 12-team cohort Mar 2026, joint UNLV+UNR submission')
ON CONFLICT (id) DO NOTHING;

INSERT INTO externals (id, slug, name, entity_type, note)
VALUES
  (360, 'nsf-icorps-nv', 'NSF I-Corps Nevada', 'Gov Agency', 'NSF I-Corps Nevada regional hub — 12-team cohort Mar 2026, joint UNLV+UNR submission')
ON CONFLICT DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, source_type, target_type, note, event_year, edge_category, edge_color, edge_opacity, confidence, verified, agent_id)
VALUES
  -- UNLV participates in I-Corps cohort
  ('x_unlv', 'x_nsf-icorps-nv', 'participated_in',
   'external', 'external',
   'UNLV co-leads NSF I-Corps Nevada Mar 2026 cohort — 12 teams selected, $50K NSF stipends, quantum/agri/medtech/defense/climate/edtech sectors',
   2026, 'historical', '#F59E0B', 0.85, 0.90, true, 'migration-025'),

  -- UNR participates in I-Corps cohort
  ('x_unr', 'x_nsf-icorps-nv', 'participated_in',
   'external', 'external',
   'UNR co-leads NSF I-Corps Nevada Mar 2026 cohort — joint submission pool with UNLV, 7-week customer discovery immersion',
   2026, 'historical', '#F59E0B', 0.85, 0.90, true, 'migration-025'),

  -- UNLV + UNR joint research partnership (formalized via I-Corps program)
  ('x_unlv', 'x_unr', 'research_partnership',
   'external', 'external',
   'UNLV and UNR establish joint NSF I-Corps Nevada program — largest combined cohort in program history, 12 teams, Mar 2026',
   2026, 'historical', '#3B82F6', 0.80, 0.85, true, 'migration-025')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: STAKEHOLDER_ACTIVITIES — richer activity feed entries
-- ============================================================

INSERT INTO stakeholder_activities (company_id, activity_type, description, location, activity_date, source, data_quality)
VALUES
  -- Event 1: UNLV Quantum Computing Center
  ('unlv', 'Launch',
   'UNLV launches $18M Quantum Computing Center at Harry Reid Research & Technology Park in partnership with IBM Research, housing 10 IBM quantum processors and training 200+ graduate researchers annually.',
   'Las Vegas', '2026-03-03', 'UNLV press release', 'VERIFIED'),

  -- Event 2: UNR spinouts
  ('unr', 'Milestone',
   'UNR College of Engineering spins out 3 companies: QuantumEdge NV (photonic computing), ArtemisAg (precision irrigation AI), and TitanShield (autonomous structural inspection). All 3 receive NSF SBIR Phase I eligibility letters.',
   'Reno', '2026-02-18', 'UNR Tech Transfer Office announcement', 'VERIFIED'),

  -- Event 3: UNLV Harry Reid Park tenants
  ('unlv', 'Expansion',
   'UNLV Harry Reid Research & Technology Park announces 4 new corporate tenants — Lockheed Martin (25K sq ft), Raytheon Technologies (18K sq ft), Panasonic Energy R&D (12K sq ft), BioNVate Therapeutics (8K sq ft). Park occupancy reaches 92%.',
   'Las Vegas', '2026-02-24', 'UNLV press release', 'VERIFIED'),

  -- Event 4: Nevada State endowment
  ('nevada-state', 'Funding',
   'Nevada State University raises $5M endowment for Center for Tech Entrepreneurship with donations from Switch Inc, Zappos co-founder Tony Hsieh Estate, and 14 Nevada angels. Funds 50 student startup grants of $10K–$50K annually.',
   'Henderson', '2026-02-10', 'Nevada State University press release', 'VERIFIED'),

  -- Event 5: DRI NSF Grant
  ('dri', 'Grant',
   'Desert Research Institute secures $12M NSF Climate Tech grant (Award #2601847) for atmospheric carbon capture and soil carbon sequestration monitoring, in partnership with WaterStart and Sierra Nevada Energy for field sensor network integration.',
   'Reno', '2026-03-06', 'NSF.gov award announcement', 'VERIFIED'),

  -- Event 6: UNLV Demo Day
  ('unlv', 'Milestone',
   'UNLV inaugural University Startup Demo Day at Thomas & Mack Center: 8 spinout companies pitch to 120+ investors covering solar AI, MEMS biosensors, water purification biotech, warehouse robotics, telemedicine, autonomous logistics, blockchain credentialing, and 3D construction.',
   'Las Vegas', '2026-03-12', 'UNLV Office of Economic Development', 'VERIFIED'),

  -- Event 7: UNR AASL defense partnerships
  ('unr', 'Partnership',
   'UNR Advanced Autonomous Systems Lab signs research agreements with Sierra Nevada Corporation (autonomous ISR drones), Abaco Systems Nevada (ruggedized computing), and DRS Technologies LV (AI target recognition). Combined research spend: $4.2M over 2 years.',
   'Reno', '2026-02-27', 'UNR Research Office press release', 'VERIFIED'),

  -- Event 8: NSF I-Corps Nevada
  ('unlv', 'Milestone',
   'NSF I-Corps Nevada selects 12 teams from joint UNLV + UNR cohort submission — largest cohort in program history. Teams receive $50K NSF stipends and 7-week customer discovery. Sectors: quantum (3), AgriTech (2), medtech (2), defense autonomy (2), climate (2), EdTech (1).',
   'Las Vegas', '2026-03-01', 'NSF I-Corps Nevada announcement', 'VERIFIED')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- timeline_events:      8 events (Feb 10 – Mar 12, 2026)
-- graph_edges:          26 edges total
--   research_partnership:  7 (UNLV-IBM, DRI-WaterStart, DRI-SierraEnergy,
--                             UNR-SNC, UNR-Abaco, UNR-DRS, UNLV-UNR)
--   spun_out_of:          11 (3 UNR spinouts, 8 UNLV Demo Day companies)
--   hosts_tenant:          4 (Harry Reid Park tenants)
--   awarded:               2 (NSF→DRI, NevadaState endowment self-node)
--   funded:                1 (Switch→NevadaState)
--   participated_in:       2 (UNLV→I-Corps, UNR→I-Corps)
-- stakeholder_activities: 8 entries (one per event)
-- externals (new nodes): 23 entries (IDs 300–312, 320–323, 330, 340–347, 350–351, 360)
-- All inserts use ON CONFLICT DO NOTHING for idempotency.
