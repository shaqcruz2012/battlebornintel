-- Migration 142: Graph edges for 16 new verified companies
-- Connects new companies to existing investor, accelerator, and ecosystem nodes
-- Sources: same as migration 141 (EDAWN, GeekWire, BusinessWire, gener8tor, etc.)
-- Uses ON CONFLICT DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ── New external entities needed for edges ─────────────────────────────────
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_valor', 'Valor Equity Partners', 'VC Firm', 'Led Positron AI Series A. Also Elon Musk backer.'),
  ('x_dfj_growth', 'DFJ Growth', 'VC Firm', 'Positron AI Series A investor.'),
  ('x_flume', 'Flume Ventures', 'VC Firm', 'Led Positron AI seed $23.5M. Scott McNealy co-founder.'),
  ('x_radical', 'Radical Ventures', 'VC Firm', 'Led P-1 AI seed $23M. Deep tech focused.'),
  ('x_index', 'Index Ventures', 'VC Firm', 'BRINC Drones investor.'),
  ('x_motorola', 'Motorola Solutions', 'Corporation', 'BRINC Drones strategic alliance $75M round. Public safety tech.'),
  ('x_samtman', 'Sam Altman', 'Angel', 'BRINC Drones investor. OpenAI CEO.'),
  ('x_aoki', 'Steve Aoki / Aoki Labs', 'Angel', 'NeuroGum investor. DJ/entrepreneur.'),
  ('x_aws_startups', 'AWS Startups', 'Corporation', 'Flawless AI investor. Amazon Web Services.'),
  ('x_google_startups', 'Google for Startups', 'Corporation', 'SorbiForce non-dilutive funding.')
ON CONFLICT (id) DO NOTHING;

-- ── Positron AI (128) edges ────────────────────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_valor',      'c_128', 'invested_in', 'Led Series A $51.6M', 2025, 'historical'),
  ('x_dfj_growth', 'c_128', 'invested_in', 'Series A co-investor', 2025, 'historical'),
  ('x_flume',      'c_128', 'invested_in', 'Led seed $23.5M (Scott McNealy)', 2024, 'historical'),
  ('x_intel',      'c_128', 'partners_with', 'Chips fabricated at Intel Arizona foundry', 2024, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── BRINC Drones (129) edges ───────────────────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_motorola',  'c_129', 'invested_in', 'Strategic alliance + $75M round', 2025, 'historical'),
  ('x_index',     'c_129', 'invested_in', 'Series B investor', 2024, 'historical'),
  ('x_samtman',   'c_129', 'invested_in', 'Angel investor', 2022, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── P-1 AI (130) edges ─────────────────────────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_radical',   'c_130', 'invested_in', 'Led seed $23M', 2025, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── NeuroGum (131) edges ───────────────────────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_aoki',      'c_131', 'invested_in', 'Aoki Labs investor', 2022, 'historical'),
  ('x_goed',      'c_131', 'funds', 'GOED tax abatements for LV HQ relocation', 2023, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── Flawless AI (132) edges ────────────────────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_aws_startups', 'c_132', 'invested_in', 'AWS investor', 2023, 'historical'),
  ('a_startupnv',    'c_132', 'accelerated_by', 'StartUpNV portfolio company', 2022, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── Electrify Nevada cohort edges ──────────────────────────────────────────
-- Edison XFC (133), Decentral AI (134), SorbiForce (137), X-Regen (138), Carbo Energy (139)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('a_gener8tor_lv', 'c_133', 'accelerated_by', 'Electrify Nevada Fall 2025 cohort', 2025, 'historical'),
  ('a_gener8tor_lv', 'c_134', 'accelerated_by', 'Electrify Nevada Fall 2025 cohort', 2025, 'historical'),
  ('a_gener8tor_lv', 'c_137', 'accelerated_by', 'Electrify Nevada Fall 2025 cohort', 2025, 'historical'),
  ('a_gener8tor_lv', 'c_138', 'accelerated_by', 'Electrify Nevada Fall 2025 cohort', 2025, 'historical'),
  ('a_gener8tor_lv', 'c_139', 'accelerated_by', 'Electrify Nevada Fall 2025 cohort', 2025, 'historical'),
  -- Metal Light (140) — Reno cohort
  ('a_gener8tor_reno', 'c_140', 'accelerated_by', 'Electrify Nevada Fall 2025 Reno cohort', 2025, 'historical'),
  -- SorbiForce also received Google for Startups funding
  ('x_google_startups', 'c_137', 'funds', 'Google for Startups non-dilutive funding', 2025, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── gBETA Reno cohort edges ────────────────────────────────────────────────
-- Yerka (141), SLEKE (142), Ghostwryte (143)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('a_gbeta_nv', 'c_141', 'accelerated_by', 'gBETA Reno 2024 cohort', 2024, 'historical'),
  ('a_gbeta_nv', 'c_142', 'accelerated_by', 'gBETA Reno 2024 cohort', 2024, 'historical'),
  ('a_gbeta_nv', 'c_143', 'accelerated_by', 'gBETA Reno 2024 cohort', 2024, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── Yerka Seed Company — UNR spinout edge ──────────────────────────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_unr', 'c_141', 'spun_out', 'UNR spinout — drought-tolerant sorghum technology', 2023, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── Fund eligibility edges (BBV/FundNV for eligible companies) ─────────────
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('f_bbv', 'c_128', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_129', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_130', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_131', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_132', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_133', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_134', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_135', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_136', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_137', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_138', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_139', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_140', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_141', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_142', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity'),
  ('f_bbv', 'c_143', 'qualifies_for', 'BBV-eligible NV company', 2025, 'opportunity')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ── People nodes for key founders ──────────────────────────────────────────
INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_resnick', 'Blake Resnick', 'Founder/CEO', 129, 'Founded BRINC Drones at age 17 after 2017 Las Vegas shooting. Thiel Fellow.'),
  ('p_eremenko', 'Paul Eremenko', 'Co-Founder/CEO', 130, 'Ex-Airbus CTO, ex-DARPA. Building Engineering AGI at P-1 AI.'),
  ('p_gtiramani2', 'Kent Kim', 'Founder/CEO', 128, 'CEO Positron AI. FPGA-based AI inference.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('p_resnick',  'c_129', 'founded_by', 'Founded BRINC at age 17', 2019, 'historical'),
  ('p_eremenko', 'c_130', 'founded_by', 'Co-founded P-1 AI', 2024, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

COMMIT;
