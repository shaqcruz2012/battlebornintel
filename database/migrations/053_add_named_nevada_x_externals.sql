-- Migration 053: Add missing named x_ external nodes (Nevada-specific)
-- Resolves graph_edges references to named x_<slug> external nodes that are
-- absent from the externals table, causing broken graph lookups.
--
-- Two kinds of rows are inserted:
--   1. x_<slug> alias rows — for cases where <slug> already exists in externals
--      but graph_edges reference the node as x_<slug> (bare id without prefix).
--   2. Net-new rows — truly missing Nevada-specific external organisations.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/053_add_named_nevada_x_externals.sql

BEGIN;

-- ============================================================
-- PART A: x_<slug> alias rows for externals that already exist
--         under their bare slug but are referenced via x_ in
--         graph_edges.
-- ============================================================

-- x_goed-nv  →  goed-nv (Government)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_goed-nv',
  'Governor''s Office of Economic Development (GOED)',
  'Government',
  'Nevada state agency responsible for economic diversification, SBIR matching grants, tax incentives, and startup ecosystem programs. Alias node for graph_edges referencing x_goed-nv.',
  0.95, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_unlv  →  unlv (University)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_unlv',
  'University of Nevada, Las Vegas',
  'University',
  'R1 research university; Harry Reid Research & Technology Park host; UNLV Foundation. Alias node for graph_edges referencing x_unlv.',
  0.95, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_dri  →  dri (Research Org)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_dri',
  'Desert Research Institute',
  'Research Org',
  'Nevada System of Higher Education research branch; climate, water, and atmospheric sciences. Received NSF $12M Climate Tech Grant (Award #2601847) Mar 2026. Alias node for graph_edges referencing x_dri.',
  0.95, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_lv-econ-dev  →  lv-econ-dev (Government)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_lv-econ-dev',
  'City of Las Vegas Economic Development',
  'Government',
  'City of Las Vegas department overseeing the Las Vegas Innovation District, business attraction, and urban innovation programs. Innovation District Phase 2 groundbreaking Mar 2026. Alias node for graph_edges referencing x_lv-econ-dev.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_reno-innovation  →  reno-innovation (Government)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_reno-innovation',
  'City of Reno Innovation Office',
  'Government',
  'City of Reno office driving the University Research Park expansion, smart city initiatives, and innovation zone designations. $12M infrastructure co-investment fund Feb 2026. Alias node for graph_edges referencing x_reno-innovation.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nv-legislature  →  nv-legislature (Government)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nv-legislature',
  'Nevada Legislature',
  'Government',
  'Nevada state bicameral legislature. SB 47 AI Innovation Tax Credit (15% transferable, Mar 2026) and HB 223 Advanced Manufacturing Incentive Package ($45M, Mar 2026). Alias node for graph_edges referencing x_nv-legislature.',
  0.95, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nv-sbir-office  →  nv-sbir-office (Government)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nv-sbir-office',
  'Nevada SBIR/STTR Program Office',
  'Government',
  'Nevada state program office coordinating SBIR/STTR federal agency outreach, pitch days, and Phase 0 preparation funding. InnovateNV Phase 0 spring 2026: $5K microgrants to 18 Nevada companies. Alias node for graph_edges referencing x_nv-sbir-office.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nsf-climate-tech  →  nsf-climate-tech (Gov Agency)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nsf-climate-tech',
  'NSF Climate Tech Program',
  'Gov Agency',
  'NSF $12M climate tech grant program; DRI award #2601847 for atmospheric carbon capture and soil monitoring, Mar 2026. Alias node for graph_edges referencing x_nsf-climate-tech.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nsf-icorps-nv  →  nsf-icorps-nv (Gov Agency)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nsf-icorps-nv',
  'NSF I-Corps Nevada',
  'Gov Agency',
  'NSF I-Corps Nevada regional hub — 12-team cohort Mar 2026, joint UNLV+UNR submission; $50K NSF stipends across quantum/agri/medtech/defense/climate/edtech sectors. Alias node for graph_edges referencing x_nsf-icorps-nv.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nevada-state  →  nevada-state (University)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nevada-state',
  'Nevada State University',
  'University',
  'Teaching-focused polytechnic university in Henderson, NV; $5M endowment for Center for Tech Entrepreneurship (50 student startup grants/year) Feb 2026. Alias node for graph_edges referencing x_nevada-state.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_waterstart  →  waterstart (Startup / Nevada water-tech non-profit)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_waterstart',
  'WaterStart',
  'Research Org',
  'Nevada water technology accelerator and field-testing hub; DRI NSF climate tech grant partner for field sensor network integration, Mar 2026. Alias node for graph_edges referencing x_waterstart.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_sierra-nevada-energy  →  sierra-nevada-energy (Startup)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_sierra-nevada-energy',
  'Sierra Nevada Energy',
  'Startup',
  'Nevada geothermal and clean energy startup; DRI NSF climate tech grant partner for real-time climate data pipeline integration with geothermal sensor arrays, Mar 2026. Alias node for graph_edges referencing x_sierra-nevada-energy.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_panasonic-energy  →  panasonic-energy (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_panasonic-energy',
  'Panasonic Energy',
  'Corporation',
  'Battery and energy R&D division; 12,000 sq ft lab at UNLV Harry Reid Research & Technology Park, Feb 2026. Alias node for graph_edges referencing x_panasonic-energy.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_ibm-research  →  ibm-research (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_ibm-research',
  'IBM Research',
  'Corporation',
  'IBM Research division; co-investment and hardware partnership for UNLV $18M Quantum Computing Center, March 2026. Alias node for graph_edges referencing x_ibm-research.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_lockheed-martin  →  lockheed-martin (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_lockheed-martin',
  'Lockheed Martin',
  'Corporation',
  'Defense prime contractor; 25,000 sq ft Advanced Research lab at UNLV Harry Reid Research & Technology Park, Feb 2026. Alias node for graph_edges referencing x_lockheed-martin.',
  0.95, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_raytheon-technologies  →  raytheon-technologies (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_raytheon-technologies',
  'Raytheon Technologies',
  'Corporation',
  'Defense prime contractor; 18,000 sq ft Nevada Lab at UNLV Harry Reid Research & Technology Park, Feb 2026. Alias node for graph_edges referencing x_raytheon-technologies.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_abaco-systems-nv  →  abaco-systems-nv (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_abaco-systems-nv',
  'Abaco Systems Nevada',
  'Corporation',
  'Ruggedized computing for autonomous ground vehicles; UNR Advanced Autonomous Systems Lab partner, Feb 2026. Alias node for graph_edges referencing x_abaco-systems-nv.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_drs-technologies  →  drs-technologies (Corporation)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_drs-technologies',
  'DRS Technologies LV',
  'Corporation',
  'AI-based target recognition systems; UNR Advanced Autonomous Systems Lab partner for military AI research, Feb 2026. Alias node for graph_edges referencing x_drs-technologies.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_titanshield  →  titanshield (Startup)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_titanshield',
  'TitanShield',
  'Startup',
  'UNR spinout — autonomous structural inspection systems; Feb 2026. Alias node for graph_edges referencing x_titanshield.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- UNLV spinout aliases
-- x_aquagenica  →  aquagenica
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_aquagenica',
  'AquaGenica',
  'Startup',
  'UNLV Demo Day spinout — water purification biotech; Mar 2026. Alias node for graph_edges referencing x_aquagenica.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_artemis-ag  →  artemis-ag
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_artemis-ag',
  'ArtemisAg',
  'Startup',
  'UNR College of Engineering spinout — precision irrigation AI; Feb 2026. Alias node for graph_edges referencing x_artemis-ag.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_bionvate  →  bionvate
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_bionvate',
  'BioNVate Therapeutics',
  'Startup',
  'Biotech startup; 8,000 sq ft tenant at UNLV Harry Reid Research & Technology Park, Feb 2026. Alias node for graph_edges referencing x_bionvate.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_clearvault  →  clearvault
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_clearvault',
  'ClearVault',
  'Startup',
  'UNLV Demo Day spinout — blockchain credentialing; Mar 2026. Alias node for graph_edges referencing x_clearvault.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_desertdrive  →  desertdrive
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_desertdrive',
  'DesertDrive',
  'Startup',
  'UNLV Demo Day spinout — autonomous last-mile logistics; Mar 2026. Alias node for graph_edges referencing x_desertdrive.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_heliopath  →  heliopath
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_heliopath',
  'HelioPath',
  'Startup',
  'UNLV Demo Day spinout — solar cell efficiency AI; Mar 2026. Alias node for graph_edges referencing x_heliopath.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_lunarbuild  →  lunarbuild
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_lunarbuild',
  'LunarBuild',
  'Startup',
  'UNLV Demo Day spinout — 3D-printed construction materials; Mar 2026. Alias node for graph_edges referencing x_lunarbuild.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nanoshield-nv  →  nanoshield-nv
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nanoshield-nv',
  'NanoShield NV',
  'Startup',
  'UNLV Demo Day spinout — MEMS biosensors; Mar 2026. Alias node for graph_edges referencing x_nanoshield-nv.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nevadamed  →  nevadamed
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nevadamed',
  'NevadaMed',
  'Startup',
  'UNLV Demo Day spinout — telemedicine platform; Mar 2026. Alias node for graph_edges referencing x_nevadamed.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_packbot-ai  →  packbot-ai
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_packbot-ai',
  'PackBot AI',
  'Startup',
  'UNLV Demo Day spinout — warehouse robotics; Mar 2026. Alias node for graph_edges referencing x_packbot-ai.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_quantumedge-nv  →  quantumedge-nv
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_quantumedge-nv',
  'QuantumEdge NV',
  'Startup',
  'UNR College of Engineering spinout — photonic computing research; Feb 2026. Alias node for graph_edges referencing x_quantumedge-nv.',
  0.88, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART B: Net-new Nevada-specific external nodes
--         (truly absent from externals under any key form)
-- ============================================================

-- x_angelnv — AngelNV statewide angel program
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_angelnv',
  'AngelNV',
  'Angel Program',
  'Nevada statewide angel investor program funded through SSBCI; invested in Adaract ($400K award 2023) and SurgiStream ($125K 2022). Key early-stage capital source for Nevada startups.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_angelnv_114 — secondary AngelNV edge node (SurgiStream investment)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_angelnv_114',
  'AngelNV',
  'Angel Program',
  'AngelNV SSBCI-funded investment node; SurgiStream $125K 2022. Indexed variant of x_angelnv for multi-investment edge tracking.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_fundnv — FundNV state venture fund
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_fundnv',
  'FundNV',
  'Government',
  'Nevada state-backed venture fund (GOED/SSBCI vehicle); invested in KnowRisk ($4.2M seed 2025), Let''s Rolo ($82.5K 2022), and first investment $100K 2025. Deploys capital into Nevada-based early-stage companies.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_FUNDNV — uppercase alias used in some graph_edges
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_FUNDNV',
  'FundNV',
  'Government',
  'Uppercase alias for FundNV (x_fundnv); first investment $100K 2025. Normalised from legacy graph_edges data.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_fundnv_108 — indexed FundNV node (Otsy investment)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_fundnv_108',
  'FundNV',
  'Government',
  'FundNV SSBCI-funded investment node; Otsy seed 2022. Indexed variant of x_fundnv for multi-investment edge tracking.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_startupnv_113 — StartupNV accelerator
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_startupnv_113',
  'StartupNV',
  'Gov Agency',
  'Nevada statewide startup accelerator (GOED-affiliated); invested in Semi Exact seed $600K 2022. Coordinates SBIR matching grant outreach through cohort alumni network with GOED.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_nevada_ssbci — Nevada SSBCI program (state small-business capital)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_nevada_ssbci',
  'Nevada SSBCI Program',
  'Government',
  'Nevada''s State Small Business Credit Initiative (SSBCI) program administered through GOED; funds AngelNV and FundNV vehicles. $500K investment in Drain Drawer 2024.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_vegastechfund — VegasTechFund (Tony Hsieh Downtown Project vehicle)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_vegastechfund',
  'VegasTechFund',
  'VC Firm',
  'Las Vegas-based early-stage fund associated with the Tony Hsieh Downtown Project; invested in Fandeavor $525K 2012 and other Downtown LV ecosystem startups.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_vegastechfund_125 — indexed VegasTechFund node
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_vegastechfund_125',
  'VegasTechFund',
  'VC Firm',
  'VegasTechFund investment node; Tony Hsieh Downtown Project 2014. Indexed variant for multi-investment edge tracking.',
  0.85, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_rebel_venture — UNLV Rebel Fund
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_rebel_venture',
  'UNLV Rebel Fund',
  'VC Firm',
  'UNLV student-run venture fund; invested in ZenCentiv seed 2022. University-affiliated early-stage investor supporting UNLV-connected founders.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_unlv_foundation — UNLV Foundation
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_unlv_foundation',
  'UNLV Foundation',
  'Foundation',
  'Philanthropic arm of the University of Nevada, Las Vegas; invested in Heligenics 2019. Supports UNLV research initiatives and tech commercialization programs.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_reno_seed — Reno Seed Fund
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_reno_seed',
  'Reno Seed Fund',
  'VC Firm',
  'Northern Nevada early-stage seed fund; invested in DayaMed 2021. Supports Reno/Northern Nevada startup ecosystem.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_renoseedfund — Reno Seed Fund (alternate slug used in graph_edges)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_renoseedfund',
  'Reno Seed Fund',
  'VC Firm',
  'Northern Nevada early-stage seed fund; HiBear co-investor 2021. Alternate graph_edges slug for x_reno_seed.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_desert_forge — Desert Forge Ventures (fund node)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_desert_forge',
  'Desert Forge Ventures',
  'VC Firm',
  'Las Vegas-based defense tech and cybersecurity VC; Fund I $45M + Fund II $40M. External node for graph_edges not resolved via f_dfv fund node.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_desert_forge_124 — Desert Forge Ventures (WAVR investment edge)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_desert_forge_124',
  'Desert Forge Ventures',
  'VC Firm',
  'Desert Forge Ventures investment node; WAVR seed $4M Aug 2025. Indexed variant for multi-investment edge tracking.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_battlebornventure — Battle Born Venture
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_battlebornventure',
  'Battle Born Venture',
  'VC Firm',
  'Nevada-based early-stage venture fund; invested in Cuts Clothing 2020 and HiBear 2021. Part of the Nevada startup ecosystem.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_battlebornventure_107 — Battle Born Venture (Onboarded investment)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_battlebornventure_107',
  'Battle Born Venture',
  'VC Firm',
  'Battle Born Venture investment node; Onboarded seed 2022. Indexed variant for multi-investment edge tracking.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_stationcasino — Station Casinos
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_stationcasino',
  'Station Casinos',
  'Corporation',
  'Las Vegas-based regional casino operator (Red Rock Resorts subsidiary); GameSTACK technology partnership 2023. Major Nevada hospitality and gaming employer.',
  0.90, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_mgm_resorts — MGM Resorts International
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_mgm_resorts',
  'MGM Resorts International',
  'Corporation',
  'Global hospitality and entertainment corporation headquartered in Las Vegas; ~10% stake post-SPAC 2021. Major Nevada employer and strategic ecosystem partner.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_NVERGY — NV Energy (uppercase alias used in some edges)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_NVERGY',
  'NV Energy',
  'Corporation',
  'Nevada''s primary electric utility; 150MW geothermal Power Purchase Agreement (PPA) partner 2026. Subsidiary of Berkshire Hathaway Energy. Uppercase alias from legacy graph_edges data.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_switch-inc — Switch Inc
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_switch-inc',
  'Switch Inc',
  'Corporation',
  'Las Vegas-based data center and hyperscale campus operator; contributed to Nevada State University $5M tech entrepreneurship endowment Feb 2026. Taken private by DigitalBridge + IFM $11B 2022.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_sierra-nevada-corp — Sierra Nevada Corporation
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_sierra-nevada-corp',
  'Sierra Nevada Corporation',
  'Corporation',
  'Sparks, NV-based aerospace and defense company; UNR Advanced Autonomous Systems Lab partner — $4.2M 2-year research agreement on autonomous ISR drone systems, Feb 2026.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_roseman — Roseman University of Health Sciences
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_roseman',
  'Roseman University of Health Sciences',
  'University',
  'Private health sciences university with campuses in Henderson and South Jordan, UT; hosts Heligenics wet lab headquarters 2023.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_city_lv — City of Las Vegas (investment node)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_city_lv',
  'City of Las Vegas',
  'Government',
  'Municipal government of Las Vegas; direct investment in Heligenics 2019. Supports Innovation District development and startup ecosystem programs.',
  0.92, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_homegrown_capital — Homegrown Capital
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_homegrown_capital',
  'Homegrown Capital',
  'VC Firm',
  'Nevada / Southwest-focused early-stage fund; led Coco Coders seed $1.75M 2024. Invests in underrepresented founders in the Nevada startup ecosystem.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_grey_collar — Grey Collar Ventures
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_grey_collar',
  'Grey Collar Ventures',
  'VC Firm',
  'Nevada-connected early-stage VC; seed lead investor 2023. Focuses on blue-collar technology and workforce-adjacent startups.',
  0.85, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_okapi_ventures — Okapi Venture Capital
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_okapi_ventures',
  'Okapi Venture Capital',
  'VC Firm',
  'Southwest US early-stage VC; seed co-lead $4.5M 2025. Active in Nevada and broader Mountain West tech ecosystem.',
  0.85, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_tru_skye — Tru Skye Ventures
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_tru_skye',
  'Tru Skye Ventures',
  'VC Firm',
  'Nevada-connected venture fund; FanUp Series investor 2025. Early-stage sports and entertainment tech focus.',
  0.82, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_snap_yellow — Snap Yellow Accelerator
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_snap_yellow',
  'Snap Yellow Accelerator',
  'Gov Agency',
  'Nevada-based startup accelerator program; $150K investment in portfolio company 2021. Part of the Southern Nevada startup support infrastructure.',
  0.82, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_gener8tor_lv — gener8tor Las Vegas
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_gener8tor_lv',
  'gener8tor Las Vegas',
  'VC Firm',
  'Las Vegas cohort of the gener8tor national accelerator network; $100K investment in Dog & Whistle 2024. Supports Southern Nevada early-stage founders.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_plug_and_play — Plug and Play Tech Center
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_plug_and_play',
  'Plug and Play Tech Center',
  'VC Firm',
  'Global startup accelerator and corporate innovation platform (Sunnyvale, CA); IoT accelerator participant 2015. Active across Nevada ecosystem partnerships.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_lifekey — LifeKey
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_lifekey',
  'LifeKey',
  'Corporation',
  'Digital health and wellness platform company; acquired Let''s Rolo 2024.',
  0.82, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_negev — Negev Capital
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_negev',
  'Negev Capital',
  'VC Firm',
  'Psychedelic pharma and biotech-focused venture investor; lead round investor in Nevada-connected biotech 2023.',
  0.80, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_microsoft_climate — Microsoft Climate Innovation Fund
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_microsoft_climate',
  'Microsoft Climate Innovation Fund',
  'Corporation',
  'Microsoft''s $1B climate tech investment vehicle; Series A lead $15M in Nevada clean energy/climate startup.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_premier_inc — Premier Inc (healthcare GPO)
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_premier_inc',
  'Premier Inc',
  'Corporation',
  'US healthcare group purchasing and performance improvement organization; group purchasing partnership with Nivati 2024.',
  0.88, TRUE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

-- x_cerberus_ventures — Cerberus Ventures
INSERT INTO externals (id, name, entity_type, note, confidence, verified, agent_id)
VALUES (
  'x_cerberus_ventures',
  'Cerberus Ventures',
  'VC Firm',
  'Series A lead investor; $22.5M round Nov 2025. Nevada ecosystem-connected growth-stage venture fund.',
  0.82, FALSE, 'migration-053'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================
-- Verification: confirm all x_ alias rows now resolve
-- ============================================================
SELECT
  e.node_id,
  x.name,
  x.entity_type,
  CASE WHEN x.id IS NOT NULL THEN 'RESOLVED' ELSE 'STILL MISSING' END AS status
FROM (
  SELECT source_id AS node_id FROM graph_edges WHERE source_id LIKE 'x_%'
  UNION
  SELECT target_id FROM graph_edges WHERE target_id LIKE 'x_%'
) e
LEFT JOIN externals x ON x.id = e.node_id
WHERE e.node_id NOT SIMILAR TO 'x_[0-9]%'
  AND e.node_id IN (
    -- PART A: alias rows
    'x_goed-nv','x_unlv','x_dri','x_lv-econ-dev','x_reno-innovation',
    'x_nv-legislature','x_nv-sbir-office','x_nsf-climate-tech','x_nsf-icorps-nv',
    'x_nevada-state','x_waterstart','x_sierra-nevada-energy','x_panasonic-energy',
    'x_ibm-research','x_lockheed-martin','x_raytheon-technologies','x_abaco-systems-nv',
    'x_drs-technologies','x_titanshield','x_aquagenica','x_artemis-ag','x_bionvate',
    'x_clearvault','x_desertdrive','x_heliopath','x_lunarbuild','x_nanoshield-nv',
    'x_nevadamed','x_packbot-ai','x_quantumedge-nv',
    -- PART B: net-new rows
    'x_angelnv','x_angelnv_114','x_fundnv','x_FUNDNV','x_fundnv_108',
    'x_startupnv_113','x_nevada_ssbci','x_vegastechfund','x_vegastechfund_125',
    'x_rebel_venture','x_unlv_foundation','x_reno_seed','x_renoseedfund',
    'x_desert_forge','x_desert_forge_124','x_battlebornventure','x_battlebornventure_107',
    'x_stationcasino','x_mgm_resorts','x_NVERGY','x_switch-inc','x_sierra-nevada-corp',
    'x_roseman','x_city_lv','x_homegrown_capital','x_grey_collar','x_okapi_ventures',
    'x_tru_skye','x_snap_yellow','x_gener8tor_lv','x_plug_and_play','x_lifekey',
    'x_negev','x_microsoft_climate','x_premier_inc','x_cerberus_ventures'
  )
ORDER BY status DESC, e.node_id;

-- Row count inserted by this migration
SELECT COUNT(*) AS rows_inserted_053
FROM externals
WHERE agent_id = 'migration-053';
