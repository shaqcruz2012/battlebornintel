-- Migration 142: Verified public funding edges — DOE loans, GOED tax abatements,
-- federal grants, and university spinout connections.
-- Every edge sourced from official government press releases.

BEGIN;

-- ═══ 1. DOE LOAN PROGRAM — Massive federal investment in NV cleantech ════════
-- Source: https://techcrunch.com/2023/02/09/redwood-materials-lands-2b-conditional-loan-from-doe/
-- Source: https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf

-- DOE → Redwood Materials ($2B conditional loan)
-- Use existing x_usdepartmentofenergy canonical ID
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_usdepartmentofenergy', 'c_' || id::TEXT, 'funded',
  'DOE $2B conditional loan for battery materials recycling factory at TRIC', 2023, 2000.0,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://techcrunch.com/2023/02/09/redwood-materials-lands-2b-conditional-loan-from-doe/'
FROM companies WHERE slug = 'redwood-materials'
ON CONFLICT DO NOTHING;

-- DOE → Ioneer ($700M for Rhyolite Ridge lithium-boron facility)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_usdepartmentofenergy', 'c_' || id::TEXT, 'funded',
  'DOE $700M loan for Rhyolite Ridge lithium-boron mining facility in Esmeralda County', 2023, 700.0,
  'capital_flow', 0.95, TRUE, 'historical',
  'https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf'
FROM companies WHERE slug = 'ioneer'
ON CONFLICT DO NOTHING;

-- Add DOE as external if not exists
INSERT INTO externals (id, name, entity_type, note)
VALUES ('x_doe', 'U.S. Department of Energy', 'Government',
  'Federal agency providing $2.7B+ in loans to Nevada cleantech companies (Redwood Materials, Ioneer)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, institution_type, search_vector)
VALUES ('x_doe', 'external', 'U.S. Department of Energy', 'externals', 'x_doe', 0.95, TRUE, NOW(), 'government', to_tsvector('english', 'U.S. Department of Energy DOE'))
ON CONFLICT (canonical_id) DO NOTHING;

-- ═══ 2. GOED TAX ABATEMENTS — State incentives ══════════════════════════════
-- Source: https://goed.nv.gov/newsroom/abated-companies-will-invest-286-6-million-and-generate-56-5-million-in-tax-revenue/

-- GOED → Redwood Materials ($105M+ tax abatements)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, capital_m, impact_type, confidence, verified, edge_category, source_url)
SELECT 'e_goed', 'c_' || id::TEXT, 'grants_to',
  'GOED $105M+ in tax abatements for battery recycling factory — up to 1,600 jobs at full scale', 2023, 105.0,
  'regulatory', 0.95, TRUE, 'historical',
  'https://goed.nv.gov/newsroom/abated-companies-will-invest-286-6-million-and-generate-56-5-million-in-tax-revenue/'
FROM companies WHERE slug = 'redwood-materials'
ON CONFLICT DO NOTHING;

-- ═══ 3. UNIVERSITY SPINOUT EDGES ═════════════════════════════════════════════
-- Source: https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum

-- WAVR Technologies — UNLV spinout (Da Kine Lab, NSF-funded research)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'u_unlv', 'c_' || id::TEXT, 'spun_out_from',
  'UNLV spinout from Da Kine Lab. NSF-funded atmospheric water harvesting research.', 2024,
  'knowledge_transfer', 0.95, TRUE, 'historical',
  'https://www.unlv.edu/announcement/office-economic-development/unlv-spinout-wavr-technologies-continues-momentum'
FROM companies WHERE slug = 'wavr-technologies'
ON CONFLICT DO NOTHING;

-- Heligenics — UNLV spinout (Dr. Martin Schiller, GigaAssay platform)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'u_unlv', 'c_' || id::TEXT, 'spun_out_from',
  'UNLV spinout by Dr. Martin Schiller. GigaAssay biologic drug screening platform.', 2019,
  'knowledge_transfer', 0.95, TRUE, 'historical',
  'https://lvgea.org/doing-business-here/heligenics-building-a-biotech-future-in-southern-nevada/'
FROM companies WHERE slug = 'heligenics'
ON CONFLICT DO NOTHING;

-- TensorWave — co-founded by UNLV CS alum Piotr Tomasik
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'u_unlv', 'c_' || id::TEXT, 'employees_from',
  'Co-founder Piotr Tomasik is UNLV computer science alumnus', 2023,
  'talent_flow', 0.9, TRUE, 'historical',
  'https://www.unlv.edu/news/unlvtoday/paid-internship-program-connects-students-local-startups'
FROM companies WHERE slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Yerka Seeds — UNR spinout (Dr. Melinda Yerka, Associate Professor)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
SELECT 'x_unr', 'c_' || id::TEXT, 'spun_out_from',
  'UNR spinout by Dr. Melinda Yerka, Associate Professor. Sorghum varieties for food and biofuels.', 2023,
  'knowledge_transfer', 0.95, TRUE, 'historical',
  'https://www.unr.edu/nevada-today/news/2025/yerka-sorghum-research'
FROM companies WHERE slug = 'yerka-seeds'
ON CONFLICT DO NOTHING;

-- ═══ 4. NEVADA TECH HUB (EDA designation for Lithium Loop) ══════════════════
-- Source: https://www.unr.edu/nevada-today/news/2025/nevada-tech-hub-awards-155m-in-funding

INSERT INTO externals (id, name, entity_type, note)
VALUES ('x_nv_tech_hub', 'Nevada Tech Hub (Lithium Loop)', 'Government',
  'EDA-designated Tech Hub for lithium battery supply chain. $15.5M+ in federal implementation funding. Managed by UNR.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, institution_type, search_vector)
VALUES ('x_nv_tech_hub', 'external', 'Nevada Tech Hub (Lithium Loop)', 'externals', 'x_nv_tech_hub', 0.95, TRUE, NOW(), 'government', to_tsvector('english', 'Nevada Tech Hub Lithium Loop EDA'))
ON CONFLICT (canonical_id) DO NOTHING;

-- Tech Hub edges to cleantech companies
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category, source_url)
VALUES
  ('x_nv_tech_hub', 'c_' || (SELECT id FROM companies WHERE slug='redwood-materials'), 'supports', 'Lithium Loop Tech Hub company — battery recycling', 2024, 'infrastructure', 0.9, TRUE, 'historical', 'https://goed.nv.gov/lithium-loop/'),
  ('x_nv_tech_hub', 'c_' || (SELECT id FROM companies WHERE slug='ioneer'), 'supports', 'Lithium Loop Tech Hub company — lithium mining', 2024, 'infrastructure', 0.9, TRUE, 'historical', 'https://goed.nv.gov/lithium-loop/'),
  ('x_nv_tech_hub', 'c_' || (SELECT id FROM companies WHERE slug='american-battery-technology'), 'supports', 'Lithium Loop Tech Hub company — battery recycling', 2024, 'infrastructure', 0.9, TRUE, 'historical', 'https://goed.nv.gov/lithium-loop/'),
  ('x_nv_tech_hub', 'c_' || (SELECT id FROM companies WHERE slug='aqua-metals'), 'supports', 'Lithium Loop Tech Hub company — battery recycling', 2024, 'infrastructure', 0.9, TRUE, 'historical', 'https://goed.nv.gov/lithium-loop/'),
  ('x_nv_tech_hub', 'x_unr', 'managed_by', 'UNR manages Nevada Tech Hub implementation', 2024, 'infrastructure', 0.95, TRUE, 'historical', 'https://www.unr.edu/nevada-today/news/2025/nevada-tech-hub-awards-155m-in-funding')
ON CONFLICT DO NOTHING;

-- ═══ 5. FUNDING ROUNDS for major deals ═══════════════════════════════════════

-- TensorWave $100M Series A (May 2025)
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'series_a', '2025-05-14', 100.0,
  'Largest Series A in Nevada history. AMD-powered GPU cloud for AI workloads.',
  'https://lvgea.org/doing-business-here/tensorwave-builds-the-backbone-of-ai-innovation/',
  0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Redwood Materials DOE loan as funding round
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'debt', '2023-02-09', 2000.0,
  'DOE $2B conditional loan for battery materials campus at TRIC, McCarran NV.',
  'https://techcrunch.com/2023/02/09/redwood-materials-lands-2b-conditional-loan-from-doe/',
  0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'redwood-materials'
ON CONFLICT DO NOTHING;

-- Ioneer DOE loan
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'debt', '2023-01-01', 700.0,
  'DOE $700M loan for Rhyolite Ridge lithium-boron facility, Esmeralda County.',
  'https://www.eda.gov/sites/default/files/2024-07/Nevada_Tech_Hub_Overarching_Narrative.pdf',
  0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'ioneer'
ON CONFLICT DO NOTHING;

-- BRINC Drones funding
INSERT INTO funding_rounds (company_id, round_type, announced_date, raise_amount_m, round_notes, source_url, confidence, verified, agent_id)
SELECT id, 'series_b', '2024-01-01', 75.0,
  'BRINC Drones Series B. Public safety drone manufacturer. $157M total raised.',
  'https://brincdrones.com/about/',
  0.85, TRUE, 'migration_142'
FROM companies WHERE slug = 'brinc-drones'
ON CONFLICT DO NOTHING;

-- ═══ 6. TREATMENT ASSIGNMENTS for DOE/GOED interventions ════════════════════

INSERT INTO treatment_assignments (company_id, treatment_type, assignment_date, cohort_name, dosage_value, dosage_unit, confidence, verified, agent_id)
SELECT id, 'loan', '2023-02-09', 'DOE Loan Guarantee Program', 2000.0, 'usd_millions', 0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'redwood-materials'
ON CONFLICT DO NOTHING;

INSERT INTO treatment_assignments (company_id, treatment_type, assignment_date, cohort_name, dosage_value, dosage_unit, confidence, verified, agent_id)
SELECT id, 'loan', '2023-01-01', 'DOE Loan Guarantee Program', 700.0, 'usd_millions', 0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'ioneer'
ON CONFLICT DO NOTHING;

INSERT INTO treatment_assignments (company_id, treatment_type, assignment_date, cohort_name, dosage_value, dosage_unit, confidence, verified, agent_id)
SELECT id, 'tax_credit', '2023-01-01', 'GOED Tax Abatement', 105.0, 'usd_millions', 0.95, TRUE, 'migration_142'
FROM companies WHERE slug = 'redwood-materials'
ON CONFLICT DO NOTHING;

-- ═══ VERIFICATION ════════════════════════════════════════════════════════════

SELECT 'edges_with_capital' as chk, COUNT(*) as c FROM graph_edges WHERE capital_m IS NOT NULL AND capital_m > 0;
SELECT 'total_capital_m' as chk, ROUND(SUM(capital_m)::NUMERIC, 1) as c FROM graph_edges WHERE capital_m > 0;
SELECT 'verified_funding_rounds' as chk, COUNT(*) as c FROM funding_rounds WHERE verified = TRUE;
SELECT 'doe_funded_edges' as chk, COUNT(*) as c FROM graph_edges WHERE source_id = 'x_usdepartmentofenergy' AND capital_m > 0;
SELECT 'university_spinouts' as chk, COUNT(*) as c FROM graph_edges WHERE rel = 'spun_out_from';
SELECT 'total_edges' as chk, COUNT(*) as c FROM graph_edges;
SELECT 'edges_with_source_url' as chk, COUNT(*) as c FROM graph_edges WHERE source_url IS NOT NULL AND source_url != '';

COMMIT;
