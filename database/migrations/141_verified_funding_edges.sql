-- Migration 141: Verified funding edges and new companies from GOED, BBV,
-- Desert Forge, 1864 Fund, and AngelNV public announcements.
-- Every edge has a source_url pointing to the press release or official page.

BEGIN;

-- ═══ 1. NEW COMPANIES (verified from GOED press releases) ═══════════════════

-- VisionAid — electronic glasses for legally blind
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, location_class, confidence, verified, source_url)
VALUES ('visionaid', 'VisionAid', 'seed', ARRAY['HealthTech','MedDevice','Hardware'], 'Las Vegas', 'las_vegas', 0.5, 55, 8, 2022,
  'Electronic glasses designed to improve visual performance for legally blind and low vision individuals. BBV SSBCI investment recipient.',
  'metro', 0.9, TRUE, 'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/')
ON CONFLICT (slug) DO NOTHING;

-- NeuroReserve — brain health supplements
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, location_class, confidence, verified, source_url)
VALUES ('neuroreserve', 'NeuroReserve', 'seed', ARRAY['HealthTech','Consumer','Biotech'], 'Las Vegas', 'las_vegas', 0.5, 50, 8, 2022,
  'Nutritional supplement company focused on neurological health. ELEVATE brain supplement fills dietary gaps for reducing neurodegenerative disease risk. BBV SSBCI investment.',
  'metro', 0.9, TRUE, 'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/')
ON CONFLICT (slug) DO NOTHING;

-- ═══ 2. BBV SSBCI INVESTMENTS (from goed.nv.gov press release) ══════════════
-- Source: https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/

-- BBV → VisionAid ($125K SSBCI co-investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_bbv', 'c_' || id::TEXT, 'invested_in',
  'BBV SSBCI venture capital program $125K investment', 2024, 0.125,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/'
FROM companies WHERE slug = 'visionaid'
ON CONFLICT DO NOTHING;

-- BBV → NeuroReserve ($125K SSBCI co-investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_bbv', 'c_' || id::TEXT, 'invested_in',
  'BBV SSBCI venture capital program $125K investment', 2024, 0.125,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/'
FROM companies WHERE slug = 'neuroreserve'
ON CONFLICT DO NOTHING;

-- BBV → Adaract ($125K SSBCI co-investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_bbv', 'c_' || id::TEXT, 'invested_in',
  'BBV SSBCI venture capital program $125K investment', 2024, 0.125,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/'
FROM companies WHERE slug = 'adaract'
ON CONFLICT DO NOTHING;

-- BBV → Beloit Kombucha ($125K SSBCI co-investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_bbv', 'c_' || id::TEXT, 'invested_in',
  'BBV SSBCI venture capital program $125K investment — first powdered kombucha product', 2024, 0.125,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://goed.nv.gov/newsroom/ssbci-venture-capital-program-invests-an-additional-500000-into-four-exciting-nevada-startups/'
FROM companies WHERE slug = 'beloit-kombucha'
ON CONFLICT DO NOTHING;

-- ═══ 3. DESERT FORGE VENTURES INVESTMENTS (from desertforgeventures.com, UNLV press) ═══
-- Source: https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum
-- Source: https://www.desertforgeventures.com/portfolio/

-- Desert Forge → WAVR Technologies ($4M seed round participation)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_desert_forge', 'c_' || id::TEXT, 'invested_in',
  'Desert Forge Ventures participated in WAVR $4M Seed Round', 2025,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum'
FROM companies WHERE slug = 'wavr-technologies'
ON CONFLICT DO NOTHING;

-- Desert Forge → TensorWave
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_desert_forge', 'c_' || id::TEXT, 'invested_in',
  'Desert Forge Ventures investment in TensorWave', 2025,
  'capital_flow', 0.9, TRUE, 'historical',
  'https://www.desertforgeventures.com/portfolio/'
FROM companies WHERE slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Desert Forge → Vena Vitals
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_desert_forge', 'c_' || id::TEXT, 'invested_in',
  'Desert Forge Ventures investment in Vena Vitals medtech', 2025,
  'capital_flow', 0.9, TRUE, 'historical',
  'https://www.desertforgeventures.com/portfolio/'
FROM companies WHERE slug = 'vena-vitals'
ON CONFLICT DO NOTHING;

-- ═══ 4. 1864 FUND INVESTMENTS (from nevadabusiness.com, startupnv.org) ══════
-- Source: https://nevadabusiness.com/2025/07/new-nevada-based-seed-stage-venture-capital-fund-makes-its-first-investment/

-- 1864 Fund → Lucihub ($500K first lead investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_1864', 'c_' || id::TEXT, 'invested_in',
  '1864 Fund first lead investment — $500K into Lucihub video production platform', 2025, 0.5,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://nevadabusiness.com/2025/07/new-nevada-based-seed-stage-venture-capital-fund-makes-its-first-investment/'
FROM companies WHERE slug = 'lucihub'
ON CONFLICT DO NOTHING;

-- ═══ 5. FundNV → BuildQ (from thewarrengrouplv.com) ═════════════════════════
-- Source: https://thewarrengrouplv.com/fundnv-makes-its-first-100000-investment-in-buildq-a-las-vegas-based-ai-powered-platform-for-project-financing/

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_fundnv', 'c_' || id::TEXT, 'invested_in',
  'FundNV first $100K investment in BuildQ — AI project financing platform', 2025, 0.1,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://thewarrengrouplv.com/fundnv-makes-its-first-100000-investment-in-buildq-a-las-vegas-based-ai-powered-platform-for-project-financing/'
FROM companies WHERE slug = 'buildq'
ON CONFLICT DO NOTHING;

-- AngelNV → BuildQ ($300K+ winner investment, SSBCI matched to $600K+)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'a_angelnv', 'c_' || id::TEXT, 'invested_in',
  'AngelNV 2025 winner — $300K+ investment, SSBCI matched to $600K+', 2025, 0.6,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/'
FROM companies WHERE slug = 'buildq'
ON CONFLICT DO NOTHING;

-- ═══ 6. WAVR → BBV (BBV also invested in WAVR seed round) ══════════════════
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'f_bbv', 'c_' || id::TEXT, 'invested_in',
  'BBV participated in WAVR Technologies $4M Seed Round', 2025,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum'
FROM companies WHERE slug = 'wavr-technologies'
ON CONFLICT DO NOTHING;

-- ═══ 7. FUNDING ROUNDS — Create discrete round records ══════════════════════

-- WAVR Technologies $4M Seed (2025)
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, lead_investor_id, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'seed', '2025-01-01', 4.0, 'x_desert_forge',
  'WAVR Technologies $4M Seed Round. Investors: Desert Forge Ventures, Battle Born Venture.',
  'https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum',
  0.95, TRUE, 'migration_141'
FROM companies WHERE slug = 'wavr-technologies'
ON CONFLICT DO NOTHING;

-- BuildQ — AngelNV $300K+ (2025)
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, lead_investor_id, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'seed', '2025-03-29', 0.6, NULL,
  'AngelNV 2025 winner — $300K investment + SSBCI match = $600K+ total. FundNV also invested $100K.',
  'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/',
  0.95, TRUE, 'migration_141'
FROM companies WHERE slug = 'buildq'
ON CONFLICT DO NOTHING;

-- Lucihub — 1864 Fund $500K (2025)
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, lead_investor_id, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'seed', '2025-07-01', 0.5, 'f_1864',
  '1864 Fund first lead investment of $500K.',
  'https://nevadabusiness.com/2025/07/new-nevada-based-seed-stage-venture-capital-fund-makes-its-first-investment/',
  0.95, TRUE, 'migration_141'
FROM companies WHERE slug = 'lucihub'
ON CONFLICT DO NOTHING;

-- ═══ 8. TREATMENT ASSIGNMENTS — Track SSBCI as causal treatments ════════════

INSERT INTO treatment_assignments (company_id, treatment_type, assignment_date, cohort_name, dosage_value, dosage_unit, confidence, verified, agent_id)
SELECT id, 'co_investment', '2024-01-01', 'BBV SSBCI 2024', 0.125, 'usd_millions', 0.95, TRUE, 'migration_141'
FROM companies WHERE slug IN ('visionaid', 'neuroreserve', 'adaract', 'beloit-kombucha')
ON CONFLICT DO NOTHING;

-- ═══ 9. ENTITY REGISTRY SYNC ═════════════════════════════════════════════════

INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT 'c_' || id::TEXT, 'company', name, 'companies', id::TEXT, confidence, verified, NOW(), to_tsvector('english', name)
FROM companies WHERE slug IN ('visionaid', 'neuroreserve')
ON CONFLICT (canonical_id) DO NOTHING;

-- ═══ VERIFICATION ════════════════════════════════════════════════════════════

SELECT 'new_companies' as chk, COUNT(*) as c FROM companies WHERE slug IN ('visionaid','neuroreserve');
SELECT 'bbv_investments' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'f_bbv' AND capital_m IS NOT NULL AND capital_m > 0;
SELECT 'desert_forge_investments' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'x_desert_forge' AND rel = 'invested_in';
SELECT 'verified_funding_rounds' as chk, COUNT(*) as c FROM funding_rounds WHERE verified = TRUE;
SELECT 'total_companies' as chk, COUNT(*) as c FROM companies;
SELECT 'total_edges' as chk, COUNT(*) as c FROM graph_edges;
SELECT 'edges_with_capital' as chk, COUNT(*) as c FROM graph_edges WHERE capital_m IS NOT NULL AND capital_m > 0;
SELECT 'edges_with_source_url' as chk, COUNT(*) as c FROM graph_edges WHERE source_url IS NOT NULL AND source_url != '';

COMMIT;
