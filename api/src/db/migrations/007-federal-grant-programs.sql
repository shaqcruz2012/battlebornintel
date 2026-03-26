-- Migration 007: Federal & State Grant Programs and Funding Flow Edges
-- Maps real federal/state grant ecosystem supporting Nevada's innovation infrastructure
-- All entities are REAL and VERIFIABLE with .gov/.edu source URLs
-- Agent: grant_mapper

BEGIN;

-- ============================================================================
-- 1. NEW FEDERAL PROGRAMS (programs table — trigger syncs to entity_registry)
-- ============================================================================

-- NSF I-Corps Nevada (already exists as external x_nsf-icorps-nv, add as program too)
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nsf-icorps-nevada',
  'NSF I-Corps Nevada',
  'accelerator_cohort',
  'NSF Innovation Corps site at UNR and UNLV. Teaches university researchers lean startup methodology to commercialize federally funded research.',
  ARRAY['deep_tech','biotech','cleantech','advanced_manufacturing'],
  ARRAY['pre_seed','research'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NSF EPSCoR Nevada
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nsf-epscor-nevada',
  'NSF EPSCoR Nevada',
  'grant',
  'NSF Established Program to Stimulate Competitive Research. Builds research capacity at Nevada universities including UNR, UNLV, and DRI.',
  ARRAY['deep_tech','biotech','cleantech','computing'],
  ARRAY['research'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- DOE LPO (Loan Programs Office)
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'doe-lpo',
  'DOE Loan Programs Office',
  'loan',
  'U.S. Department of Energy Loan Programs Office. Provides large-scale loans for energy infrastructure. Funded Redwood Materials $2B conditional commitment.',
  ARRAY['cleantech','energy','advanced_manufacturing'],
  ARRAY['growth','expansion'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- EDA Build Back Better
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'eda-build-back-better',
  'EDA Build Back Better Regional Challenge',
  'grant',
  'U.S. Economic Development Administration regional challenge grants for economic development coalitions. Nevada Tech Hub consortium received Phase 1 and Phase 2 awards.',
  ARRAY['cleantech','advanced_manufacturing','lithium','ev_battery'],
  ARRAY['growth','expansion'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- EDA STEM Talent Challenge
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'eda-stem-talent-challenge',
  'EDA STEM Talent Challenge',
  'grant',
  'U.S. EDA Good Jobs Challenge and STEM Talent Challenge grants for regional workforce development.',
  ARRAY['workforce','stem','advanced_manufacturing'],
  ARRAY['all'],
  0.90, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- USDA RBDG
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'usda-rbdg',
  'USDA Rural Business Development Grants',
  'grant',
  'USDA Rural Business-Cooperative Service grants for rural business development. Available to rural Nevada communities.',
  ARRAY['agriculture','rural_development','small_business'],
  ARRAY['seed','early'],
  0.90, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- SBA SBIC
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'sba-sbic',
  'SBA Small Business Investment Company',
  'equity',
  'SBA-licensed Small Business Investment Companies provide venture capital and long-term loans to small businesses.',
  ARRAY['all'],
  ARRAY['seed','early','growth'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- DOD SBIR
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'dod-sbir',
  'DOD SBIR Program',
  'grant',
  'Department of Defense Small Business Innovation Research program. Funds defense-relevant R&D at small businesses including Nevada companies near Nellis AFB and Creech AFB.',
  ARRAY['defense','autonomous_systems','cybersecurity','aerospace'],
  ARRAY['seed','early'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NASA SBIR (already have nasa-sbir-phase-i, add umbrella)
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nasa-sbir',
  'NASA SBIR/STTR Program',
  'grant',
  'NASA Small Business Innovation Research and Small Business Technology Transfer programs for aerospace and space technology R&D.',
  ARRAY['aerospace','deep_tech','materials','remote_sensing'],
  ARRAY['seed','early'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NIH SBIR/STTR umbrella
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nih-sbir-sttr',
  'NIH SBIR/STTR Program',
  'grant',
  'National Institutes of Health Small Business Innovation Research and Technology Transfer programs for biomedical and health research.',
  ARRAY['biotech','healthcare','life_sciences'],
  ARRAY['seed','early'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- SSBCI program (already have goed-ssbci, ensure umbrella federal program)
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'ssbci-federal',
  'SSBCI Federal Program',
  'equity',
  'State Small Business Credit Initiative. Federal program administered by U.S. Treasury providing capital to states for small business financing. Nevada allocation administered by GOED.',
  ARRAY['all'],
  ARRAY['seed','early','growth'],
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. STATE/REGIONAL PROGRAMS
-- ============================================================================

-- GOED Catalyst Fund (external x_nv_catalyst exists, add program record)
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'goed-catalyst-fund',
  'GOED Catalyst Fund',
  'grant',
  'Nevada GOED Catalyst Fund provides matching grants for startup development and commercialization activities at Nevada companies.',
  ARRAY['all'],
  ARRAY['seed','early'],
  0.90, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NV SBIR/STTR State Match
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nv-sbir-state-match',
  'Nevada SBIR/STTR State Matching',
  'grant',
  'Nevada state matching funds for companies that receive federal SBIR/STTR awards, administered via GOED and InnovateNV.',
  ARRAY['all'],
  ARRAY['seed','early'],
  0.85, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NV Clean Energy Fund
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nv-clean-energy-fund',
  'Nevada Clean Energy Fund',
  'loan',
  'Nevada Clean Energy Fund provides financing for clean energy projects and green infrastructure in Nevada.',
  ARRAY['cleantech','energy','solar','geothermal'],
  ARRAY['growth','expansion'],
  0.85, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- NV OSIT
INSERT INTO programs (slug, name, program_type, description, target_sectors, target_stages, confidence, verified, agent_id)
VALUES (
  'nv-osit',
  'NV Governor''s Office of Science, Innovation & Technology',
  'other',
  'Nevada OSIT coordinates state science, technology, and broadband policy. Administers broadband grants and STEM education programs.',
  ARRAY['broadband','stem','technology'],
  ARRAY['all'],
  0.90, TRUE, 'grant_mapper'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. NEW EXTERNALS (for federal agencies not yet in system)
-- ============================================================================

-- USDA (not yet in system)
INSERT INTO externals (id, name, entity_type, note, website, confidence, verified, agent_id)
VALUES (
  'x_usda',
  'U.S. Department of Agriculture',
  'Government',
  'Federal agency administering RBDG and rural development grants available to Nevada rural communities.',
  'https://www.usda.gov',
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (id) DO NOTHING;

-- NSF EPSCoR Nevada external
INSERT INTO externals (id, name, entity_type, note, website, confidence, verified, agent_id)
VALUES (
  'x_nsf-epscor-nv',
  'NSF EPSCoR Nevada',
  'Government',
  'NSF Established Program to Stimulate Competitive Research — Nevada jurisdiction.',
  'https://www.nsf.gov/od/oia/programs/epscor/',
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (id) DO NOTHING;

-- DOE LPO external
INSERT INTO externals (id, name, entity_type, note, website, confidence, verified, agent_id)
VALUES (
  'x_doe-lpo',
  'DOE Loan Programs Office',
  'Government',
  'U.S. Department of Energy Loan Programs Office. Issued $2B conditional commitment to Redwood Materials.',
  'https://www.energy.gov/lpo',
  0.95, TRUE, 'grant_mapper'
)
ON CONFLICT (id) DO NOTHING;

-- OSIT external
INSERT INTO externals (id, name, entity_type, note, website, confidence, verified, agent_id)
VALUES (
  'x_nv-osit',
  'Nevada OSIT',
  'Government',
  'Nevada Governor''s Office of Science, Innovation & Technology. Coordinates state technology and broadband policy.',
  'https://osit.nv.gov',
  0.90, TRUE, 'grant_mapper'
)
ON CONFLICT (id) DO NOTHING;

-- NV Clean Energy Fund external
INSERT INTO externals (id, name, entity_type, note, website, confidence, verified, agent_id)
VALUES (
  'x_nv-clean-energy',
  'Nevada Clean Energy Fund',
  'Government',
  'State financing program for clean energy and green infrastructure projects in Nevada.',
  'https://nevadacleanenergyfund.org',
  0.85, TRUE, 'grant_mapper'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. KNOWLEDGE FUND FUNDING FLOW EDGES
-- ============================================================================

-- GOED → Knowledge Fund (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_goed', 'e_knowledge_fund', 'funds',
  'GOED administers the Nevada Knowledge Fund, the state signature university commercialization program. $24M+ invested since 2013.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Knowledge Fund → UNR (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_knowledge_fund', 'u_unr', 'funds',
  'Knowledge Fund provides research commercialization grants to UNR. UNR is a primary recipient institution.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Knowledge Fund → UNLV (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_knowledge_fund', 'u_unlv', 'funds',
  'Knowledge Fund provides research commercialization grants to UNLV. UNLV is a primary recipient institution.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Knowledge Fund → DRI (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_knowledge_fund', 'u_dri', 'funds',
  'Knowledge Fund provides research commercialization grants to Desert Research Institute (DRI), an NSHE member institution.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Knowledge Fund → SAGE North (funds, via UNR)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_knowledge_fund', 'a_sage_north', 'funds',
  'Knowledge Fund supports SAGE North at UNR for research commercialization and I-Corps programming.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Knowledge Fund → SAGE South (funds, via UNLV)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'e_knowledge_fund', 'a_sage_south', 'funds',
  'Knowledge Fund supports SAGE South at UNLV for research commercialization and I-Corps programming.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ============================================================================
-- 5. FEDERAL → STATE/UNIVERSITY FUNDING FLOW EDGES
-- ============================================================================

-- NSF → UNR (awards)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf', 'u_unr', 'funds',
  'NSF provides research grants to University of Nevada, Reno across multiple programs including EPSCoR, I-Corps, and individual investigator awards.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/awardsearch/',
  'NSF Award Search'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF → UNLV (awards)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf', 'u_unlv', 'funds',
  'NSF provides research grants to University of Nevada, Las Vegas across multiple programs including EPSCoR, I-Corps, and individual investigator awards.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/awardsearch/',
  'NSF Award Search'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF I-Corps → SAGE North (program_of)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf-icorps-nv', 'a_sage_north', 'program_of',
  'NSF I-Corps Nevada programming is delivered through SAGE North at UNR for northern Nevada researchers.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.nsf.gov/news/special_reports/i-corps/',
  'NSF I-Corps Program'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF I-Corps → SAGE South (program_of)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf-icorps-nv', 'a_sage_south', 'program_of',
  'NSF I-Corps Nevada programming is delivered through SAGE South at UNLV for southern Nevada researchers.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.nsf.gov/news/special_reports/i-corps/',
  'NSF I-Corps Program'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF EPSCoR → UNR (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf-epscor-nv', 'u_unr', 'funds',
  'NSF EPSCoR provides multi-year research infrastructure grants to UNR to build competitive research capacity in Nevada.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/od/oia/programs/epscor/',
  'NSF EPSCoR'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF EPSCoR → UNLV (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf-epscor-nv', 'u_unlv', 'funds',
  'NSF EPSCoR provides multi-year research infrastructure grants to UNLV to build competitive research capacity in Nevada.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/od/oia/programs/epscor/',
  'NSF EPSCoR'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF EPSCoR → DRI (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf-epscor-nv', 'u_dri', 'funds',
  'NSF EPSCoR supports Desert Research Institute research infrastructure as part of Nevada EPSCoR jurisdiction.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/od/oia/programs/epscor/',
  'NSF EPSCoR'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- DOE LPO → Redwood Materials (loaned_to)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_doe-lpo', 'c_1', 'loaned_to',
  'DOE Loan Programs Office issued $2B conditional commitment to Redwood Materials for battery recycling and materials campus in northern Nevada.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.energy.gov/lpo/redwood-materials',
  'DOE LPO Redwood Materials'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- EDA → GOED (awards — via Nevada Tech Hub)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'gov_eda', 'e_goed', 'funds',
  'U.S. EDA awarded Nevada Tech Hub consortium (coordinated by GOED) Build Back Better Regional Challenge funding for lithium/EV/battery ecosystem.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.eda.gov/funding/programs/american-rescue-plan/build-back-better',
  'EDA Build Back Better'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SBA → NV SBDC (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'v_sba', 'x_nv_sbdc', 'funds',
  'SBA funds Nevada Small Business Development Center network for counseling and training services to Nevada small businesses.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.sba.gov/local-assistance/resource-partners/small-business-development-centers-sbdc',
  'SBA SBDC Program'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SBA → NV District Office (manages)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'v_sba', 'x_sba_nv', 'manages',
  'SBA operates the Nevada District Office in Las Vegas serving all of Nevada.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'governance',
  'https://www.sba.gov/district/nevada',
  'SBA Nevada District'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SSBCI → BBV (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'gov_SSBCI', 'f_bbv', 'funds',
  'SSBCI federal allocation to Nevada supports Battle Born Venture fund operations via GOED administration.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci',
  'U.S. Treasury SSBCI'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- DOD → Nellis AFB area funding (DOD SBIR to NV defense ecosystem)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'gov_DOD', 'a_apex', 'funds',
  'DoD Procurement Technical Assistance Cooperative Agreement funds Nevada APEX Accelerator (formerly PTAC) for federal contracting assistance.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.apexaccelerators.us/',
  'APEX Accelerators (DoD)'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ============================================================================
-- 6. ACCELERATOR → PROGRAM CONNECTIONS
-- ============================================================================

-- Zero Labs → Knowledge Fund (funded_by)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'a_zerolabs', 'e_knowledge_fund', 'funded_by',
  'Zero Labs receives support via GOED Knowledge Fund through UNLV Applied Research Center partnership.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  'Nevada GOED Knowledge Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- gener8tor Reno → UNR (partners_with)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'a_gener8tor_reno', 'u_unr', 'partners_with',
  'gener8tor Reno-Tahoe partners with UNR for startup pipeline and mentorship from university researchers and students.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.gener8tor.com/reno-tahoe',
  'gener8tor Reno-Tahoe'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- gener8tor LV → UNLV (partners_with)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'a_gener8tor_lv', 'u_unlv', 'partners_with',
  'gener8tor Las Vegas partners with UNLV for startup pipeline and mentorship from university researchers.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.gener8tor.com/las-vegas',
  'gener8tor Las Vegas'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SAGE North → NSF I-Corps (program_of) — reverse direction for completeness
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'a_sage_north', 'x_nsf-icorps-nv', 'partners_with',
  'SAGE North at UNR delivers NSF I-Corps programming for northern Nevada university researchers.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.unr.edu/research-innovation/sage',
  'UNR SAGE'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SAGE South → NSF I-Corps (partners_with)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'a_sage_south', 'x_nsf-icorps-nv', 'partners_with',
  'SAGE South at UNLV delivers NSF I-Corps programming for southern Nevada university researchers.',
  0.90, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://www.unlv.edu/econdev/sage',
  'UNLV SAGE'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Zero Labs → LVCVA (partners_with) — already exists, skip via ON CONFLICT

-- ============================================================================
-- 7. ADDITIONAL STATE PROGRAM FLOW EDGES
-- ============================================================================

-- OSIT → GOED (partners_with)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nv-osit', 'e_goed', 'partners_with',
  'Nevada OSIT coordinates with GOED on state technology policy, broadband expansion, and innovation ecosystem strategy.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'governance',
  'https://osit.nv.gov',
  'Nevada OSIT'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NV Clean Energy Fund → cleantech ecosystem
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nv-clean-energy', 'e_goed', 'partners_with',
  'Nevada Clean Energy Fund coordinates with GOED on clean energy financing and green infrastructure incentives.',
  0.80, TRUE, 'grant_mapper',
  'historical', 'MEDIUM', 'governance',
  'https://nevadacleanenergyfund.org',
  'Nevada Clean Energy Fund'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF → NSF I-Corps Nevada (program_of)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf', 'x_nsf-icorps-nv', 'funds',
  'NSF funds the I-Corps Nevada site as part of the national Innovation Corps network.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/news/special_reports/i-corps/',
  'NSF I-Corps'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NSF → EPSCoR Nevada (funds)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nsf', 'x_nsf-epscor-nv', 'funds',
  'NSF funds the EPSCoR Nevada program to build research infrastructure capacity.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'capital_flow',
  'https://www.nsf.gov/od/oia/programs/epscor/',
  'NSF EPSCoR'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- USDA → rural NV (general availability)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_usda', 'e_goed', 'partners_with',
  'USDA Rural Business Development Grants available to rural Nevada communities; GOED coordinates state economic development alignment.',
  0.80, TRUE, 'grant_mapper',
  'historical', 'MEDIUM', 'governance',
  'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
  'USDA RBDG'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- DOE → DOE NNSS (manages)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_doe', 'gov_doe_nnss', 'manages',
  'DOE manages the Nevada National Security Site (NNSS), a major federal installation in southern Nevada.',
  0.95, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'governance',
  'https://www.energy.gov/nnsa/nevada-national-security-site',
  'DOE NNSA/NNSS'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- NASA → Nevada companies (general SBIR)
INSERT INTO graph_edges (source_id, target_id, rel, note, confidence, verified, agent_id,
  edge_category, data_quality, impact_type, source_url, source_name)
VALUES (
  'x_nasa', 'x_nv-sbir-office', 'partners_with',
  'NASA SBIR/STTR awards available to Nevada small businesses; Nevada SBIR office assists with applications.',
  0.85, TRUE, 'grant_mapper',
  'historical', 'HIGH', 'knowledge_transfer',
  'https://sbir.nasa.gov/',
  'NASA SBIR'
)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

COMMIT;
