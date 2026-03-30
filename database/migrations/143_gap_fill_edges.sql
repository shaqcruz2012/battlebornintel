-- Migration 143: Fill remaining graph gaps — data center incentives, EDAWN
-- relocations, Zero Labs program edges, and accelerator coverage improvements.
-- All edges sourced from official press/web research.

BEGIN;

-- ═══ 1. DATA CENTER TAX ABATEMENTS (from GOED, NV Independent) ══════════════
-- Source: https://thenevadaindependent.com/article/have-data-center-tax-breaks-helped-nevadas-economy-heres-what-we-found
-- Source: https://www.switch.com/nevada-tax-advantages/

-- GOED → Switch (data center tax abatement, 2015 legislation)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'e_goed', 'c_' || id::TEXT, 'grants_to',
  'GOED data center tax abatement program — 75% property tax + 2% sales tax for 20 years', 2015,
  'regulatory', 0.9, TRUE, 'historical',
  'https://thenevadaindependent.com/article/have-data-center-tax-breaks-helped-nevadas-economy-heres-what-we-found'
FROM companies WHERE slug = 'switch'
ON CONFLICT DO NOTHING;

-- GOED → Tesla (Gigafactory incentives package — $1.25B+ in tax abatements)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
VALUES ('e_goed', 'x_222', 'grants_to',
  'GOED $1.25B tax incentive package for Tesla Gigafactory at TRIC — 20-year abatement', 2014, 1250.0,
  'regulatory', 0.95, TRUE, 'historical',
  'https://thenevadaindependent.com/article/have-data-center-tax-breaks-helped-nevadas-economy-heres-what-we-found')
ON CONFLICT DO NOTHING;

-- ═══ 2. EDAWN RECRUITMENT EDGES (from edawn.org, nnbw.com) ══════════════════
-- Source: https://www.edawn.org/site-selector/relocated_companies/
-- Source: https://www.nevadaappeal.com/news/2025/feb/22/edawn-economy-is-strong-and-firing-on-all-cylinders/

-- EDAWN recruited 22 companies in 2024, ~$3B investment, 1,900 jobs
-- Connect key TRIC/Reno companies to EDAWN
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
VALUES
  ('e_edawn', 'c_' || (SELECT id FROM companies WHERE slug='redwood-materials'), 'supports', 'EDAWN assisted Redwood Materials expansion in northern NV', 2023, 'infrastructure', 0.85, TRUE, 'historical', 'https://www.edawn.org/site-selector/relocated_companies/'),
  ('e_edawn', 'c_' || (SELECT id FROM companies WHERE slug='american-battery-technology'), 'supports', 'EDAWN assisted ABTC operations at TRIC', 2023, 'infrastructure', 0.85, TRUE, 'historical', 'https://www.edawn.org/site-selector/relocated_companies/'),
  ('e_edawn', 'c_' || (SELECT id FROM companies WHERE slug='aqua-metals'), 'supports', 'EDAWN assisted Aqua Metals AquaRefinery at TRIC', 2023, 'infrastructure', 0.85, TRUE, 'historical', 'https://www.edawn.org/site-selector/relocated_companies/')
ON CONFLICT DO NOTHING;

-- ═══ 3. ZERO LABS PROGRAM EDGES (from zerolabs.io) ══════════════════════════
-- Source: https://zerolabs.io/innovationlaunchpad
-- Source: https://www.unlv.edu/news/unlvtoday/zero-labs-las-vegas-based-launchpad-worldwide-innovation

-- Zero Labs backed by UNLV OED and GOED
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
VALUES
  ('a_zerolabs', 'e_unlv_econdev', 'partnered_with', 'Zero Labs x UNLV Innovation Launchpad partnership', 2024, 'knowledge_transfer', 0.9, TRUE, 'historical', 'https://www.unlv.edu/news/unlvtoday/zero-labs-las-vegas-based-launchpad-worldwide-innovation'),
  ('a_zerolabs', 'e_goed', 'supported_by', 'GOED supports Zero Labs Innovation Launchpad', 2024, 'infrastructure', 0.85, TRUE, 'historical', 'https://zerolabs.io/innovationlaunchpad'),
  ('a_zerolabs', 'a_blackfire', 'housed_at', 'Zero Labs cohorts held at Black Fire Innovation building', 2024, 'infrastructure', 0.9, TRUE, 'historical', 'https://zerolabs.io/perspectives/the-power-of-innovation-key-insights-from-zero-labs-innovation-launchpad-cohort-4')
ON CONFLICT DO NOTHING;

-- ═══ 4. KNOWLEDGE FUND → PROGRAM EDGES (from goed.nv.gov) ══════════════════
-- Source: https://goed.nv.gov/knowledge-fund/

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
VALUES
  ('e_knowledge_fund', 'a_sage_north', 'funds', 'Knowledge Fund supports SAGE North at UNR', 2024, 'capital_flow', 0.95, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/'),
  ('e_knowledge_fund', 'a_sage_south', 'funds', 'Knowledge Fund supports SAGE South at UNLV', 2024, 'capital_flow', 0.95, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/'),
  ('e_knowledge_fund', 'a_innovatenv', 'funds', 'Knowledge Fund supports InnovateNV SBIR program', 2024, 'capital_flow', 0.95, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/'),
  ('e_knowledge_fund', 'e_ncar', 'funds', 'Knowledge Fund supports Nevada Center for Applied Research', 2024, 'capital_flow', 0.95, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/'),
  ('e_knowledge_fund', 'a_zerolabs', 'funds', 'Knowledge Fund supports Zero Labs via GOED', 2024, 'capital_flow', 0.9, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/'),
  ('e_knowledge_fund', 'a_blackfire', 'funds', 'Knowledge Fund supports Black Fire Innovation', 2024, 'capital_flow', 0.9, TRUE, 'historical', 'https://goed.nv.gov/knowledge-fund/')
ON CONFLICT DO NOTHING;

-- ═══ 5. SSBCI PROGRAM STRUCTURE EDGES ════════════════════════════════════════
-- Source: https://nvsmallbiz.org/accelerators/

-- Battle Born Growth → Accelerator funds
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
VALUES
  ('e_goed', 'f_bbv', 'manages', 'GOED oversees BBV via Nevada Battle Born Growth Escalator Inc', 2022, 'regulatory', 0.95, TRUE, 'historical', 'https://nvsmallbiz.org/vc/'),
  ('e_goed', 'a_gener8tor_lv', 'funds', 'SSBCI funds gener8tor Las Vegas accelerator', 2022, 'capital_flow', 0.95, TRUE, 'historical', 'https://nvsmallbiz.org/accelerators/'),
  ('e_goed', 'a_gener8tor_reno', 'funds', 'SSBCI funds gener8tor Reno-Tahoe accelerator', 2022, 'capital_flow', 0.95, TRUE, 'historical', 'https://nvsmallbiz.org/accelerators/'),
  ('e_goed', 'a_startupnv', 'funds', 'SSBCI funds StartUpNV programs', 2022, 'capital_flow', 0.95, TRUE, 'historical', 'https://nvsmallbiz.org/accelerators/')
ON CONFLICT DO NOTHING;

-- ═══ 6. TREATMENT ASSIGNMENTS for data center incentives ════════════════════

INSERT INTO treatment_assignments (company_id, treatment_type, assignment_date, cohort_name, dosage_value, dosage_unit, confidence, verified, agent_id)
SELECT id, 'tax_credit', '2015-01-01', 'GOED Data Center Tax Abatement', NULL, 'usd_millions', 0.9, TRUE, 'migration_143'
FROM companies WHERE slug = 'switch'
ON CONFLICT DO NOTHING;

-- ═══ VERIFICATION ════════════════════════════════════════════════════════════

SELECT 'total_edges' as chk, COUNT(*) as c FROM graph_edges;
SELECT 'knowledge_fund_edges' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'e_knowledge_fund';
SELECT 'goed_manages_funds' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'e_goed' AND rel IN ('manages','funds');
SELECT 'edawn_supports' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'e_edawn' AND rel = 'supports';
SELECT 'edges_with_capital' as chk, COUNT(*) as c, ROUND(COALESCE(SUM(capital_m),0)::NUMERIC,1) as total_m FROM graph_edges WHERE capital_m > 0;

COMMIT;
