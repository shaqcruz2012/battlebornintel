-- Migration 139: Founder & Team Enrichment
-- Sources: Crunchbase, PitchBook, LinkedIn, company websites, press releases
-- Research conducted 2026-03-30 via web search agent
-- Adds verified founder/executive people nodes, graph edges, feature registry entries,
-- and team metric snapshots for top Nevada ecosystem companies.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. People — new founder/executive nodes
--    Existing (from migration 131): p_straubel, p_reynolds, p_kurtzer, p_barron,
--    p_tomasik, p_saling. We skip those and add net-new people.
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  -- Socure (id=2)
  ('p_ayers',       'Johnny Ayers',       'Co-Founder/CEO',     2,  'Founded Socure 2012. Identity verification pioneer. NYA Founder Spotlight.'),
  -- Abnormal AI (id=3)
  ('p_reiser',      'Evan Reiser',        'Co-Founder/CEO',     3,  'CEO Abnormal AI. Previously at Twitter (ad targeting ML). Stanford CS.'),
  ('p_jeyakumar',   'Sanjay Jeyakumar',   'Co-Founder/CTO',     3,  'CTO Abnormal AI. Previously at Twitter (ML infra). Stanford CS PhD.'),
  -- TensorWave — p_tomasik already exists (migration 131)
  ('p_gorman',      'Darrick Horton',      'Co-Founder/CEO',     4,  'CEO TensorWave. AMD GPU cloud infrastructure.'),
  -- 1047 Games (id=5)
  ('p_nicholson',   'Ian Nicholson',       'Co-Founder/CEO',     5,  'Co-founded 1047 Games. Splitgate creator.'),
  -- Hubble Network (id=6)
  ('p_ben_wild',    'Ben Wild',            'Co-Founder/CEO',     6,  'CEO Hubble Network. Space-based Bluetooth connectivity. Y Combinator alum.'),
  ('p_noyola',      'Alex Noyola',         'Co-Founder/CTO',     6,  'CTO Hubble Network. Satellite Bluetooth patent inventor.'),
  -- Boxabl (id=7)
  ('p_gtiramani',   'Galiano Tiramani',    'Co-Founder/CEO',     7,  'CEO Boxabl. Modular housing pioneer. Las Vegas.'),
  ('p_ptiramani',   'Paolo Tiramani',      'Co-Founder',         7,  'Co-founded Boxabl with son Galiano. Construction industry veteran.'),
  -- Carbon Health (id=8)
  ('p_bali',        'Eren Bali',           'Co-Founder/CEO',     8,  'CEO Carbon Health. Previously co-founded Udemy. Turkish-American entrepreneur.'),
  -- MNTN (id=9) — p_reynolds already exists
  ('p_douglas',     'Mark Douglas',        'Founder/CEO',        9,  'Founder & CEO MNTN. Self-taught coder. Adweek Tech Innovator of Year.'),
  -- Katalyst (id=10)
  ('p_woltermann',  'Bjoern Woltermann',   'Founder/CEO',       10,  'Founder & CEO Katalyst. EMS fitness technology. German-born, Las Vegas.'),
  -- CIQ (id=11) — p_kurtzer already exists
  -- Lyten (id=29)
  ('p_cook',        'Dan Cook',            'Co-Founder/CEO',    29,  'CEO & Co-Founder Lyten. 3D Graphene supermaterials. 20+ yrs materials science.'),
  -- Ioneer (id=49)
  ('p_masters',     'James Calaway',       'Executive Chairman', 49,  'Executive Chairman Ioneer. Rhyolite Ridge lithium-boron project.'),
  -- Dragonfly Energy (id=50)
  ('p_villarreal',  'Denis Phares',        'Founder/CEO',       50,  'Founder & CEO Dragonfly Energy. Battle Born Batteries brand. PhD physics.'),
  -- Sierra Nevada Corp (id=51)
  ('p_ozmen_e',     'Eren Ozmen',          'Co-Owner/President', 51,  'Co-owner Sierra Nevada Corp with husband Fatih. Turkish-American billionaire.'),
  ('p_ozmen_f',     'Fatih Ozmen',         'Co-Owner/CEO',      51,  'Co-owner & CEO Sierra Nevada Corp. Dream Chaser spacecraft.')
ON CONFLICT (id) DO NOTHING;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Graph edges — founder/executive relationships
--    rel = 'founded_by' for founders, 'employed_at' for non-founding executives
--    source_id = person node, target_id = 'c_' + company_id
-- ══════════════════════════════════════════════════════════════════════════════

-- Redwood Materials (c_1) — p_straubel already exists
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_straubel', 'c_1', 'founded_by', 'Founded Redwood Materials 2017. Tesla CTO/co-founder.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Socure (c_2)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_ayers', 'c_2', 'founded_by', 'Co-founded Socure 2012. Identity verification.', 2012, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Abnormal AI (c_3)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_reiser', 'c_3', 'founded_by', 'Co-founded Abnormal Security 2018. AI email security.', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_jeyakumar', 'c_3', 'founded_by', 'Co-founded Abnormal Security 2018. CTO.', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- TensorWave (c_4)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_tomasik', 'c_4', 'founded_by', 'Co-founded TensorWave. AMD GPU cloud pioneer.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_gorman', 'c_4', 'founded_by', 'Co-founded TensorWave. CEO.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- 1047 Games (c_5)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_nicholson', 'c_5', 'founded_by', 'Co-founded 1047 Games. Splitgate.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Hubble Network (c_6)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_ben_wild', 'c_6', 'founded_by', 'Co-founded Hubble Network. Satellite Bluetooth.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_noyola', 'c_6', 'founded_by', 'Co-founded Hubble Network. CTO.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Boxabl (c_7)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_gtiramani', 'c_7', 'founded_by', 'Co-founded Boxabl 2017. Modular housing.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_ptiramani', 'c_7', 'founded_by', 'Co-founded Boxabl 2017 with son Galiano.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Carbon Health (c_8)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_bali', 'c_8', 'founded_by', 'Co-founded Carbon Health 2015. Previously Udemy co-founder.', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- MNTN (c_9)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_douglas', 'c_9', 'founded_by', 'Founded MNTN (formerly SteelHouse). Performance TV.', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_reynolds', 'c_9', 'employed_at', 'Chief Creative Officer. Brand equity partner.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Katalyst (c_10)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_woltermann', 'c_10', 'founded_by', 'Founded Katalyst. EMS fitness wearable.', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- CIQ (c_11)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_kurtzer', 'c_11', 'founded_by', 'Founded CIQ 2021. Rocky Linux / CentOS creator.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Lyten (c_29)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_cook', 'c_29', 'founded_by', 'Co-founded Lyten. 3D Graphene supermaterials.', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Ioneer (c_49)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_masters', 'c_49', 'employed_at', 'Executive Chairman. Rhyolite Ridge project.', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Dragonfly Energy (c_50)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_villarreal', 'c_50', 'founded_by', 'Founded Dragonfly Energy. Battle Born Batteries.', 2012, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Sierra Nevada Corp (c_51)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_ozmen_e', 'c_51', 'employed_at', 'Co-owner & President SNC. Acquired SNC 1994 with Fatih.', 1994, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_ozmen_f', 'c_51', 'employed_at', 'Co-owner & CEO SNC. Dream Chaser spacecraft program.', 1994, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Jeff Saling ecosystem edge (already in 132 for f_fundnv, add accelerator link)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_saling', 'a_startupnv', 'employed_at', 'Co-founder & Executive Director StartUpNV', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Feature registry — team/founder features for model consumption
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('company', 'founder_experience_years',  'numeric',     'agent',   false, 'Total years of professional experience of primary founder'),
  ('company', 'founder_prior_exits',       'numeric',     'agent',   false, 'Number of prior successful exits by founding team'),
  ('company', 'team_size_leadership',      'numeric',     'agent',   false, 'Count of C-suite / VP-level leaders'),
  ('company', 'founder_count',             'numeric',     'agent',   false, 'Number of co-founders'),
  ('company', 'founder_technical',         'boolean',     'agent',   false, 'Whether founding team includes technical co-founder'),
  ('company', 'serial_founder',            'boolean',     'agent',   false, 'Whether any founder has previously founded a company')
ON CONFLICT (entity_type, feature_name) DO NOTHING;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Metric snapshots — team metrics per company
--    entity_type='company', entity_id=company_id::text
--    period = founding year through current
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit,
   period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  -- Redwood Materials (id=1): JB Straubel, 20+ yrs exp, 1 prior exit (Tesla), solo founder
  ('company', '1', 'founder_experience_years', 20, 'years', '2017-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '1', 'founder_prior_exits',       1, 'count', '2017-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),
  ('company', '1', 'team_size_leadership',       8, 'count', '2017-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),
  ('company', '1', 'founder_count',              1, 'count', '2017-01-01', '2026-03-30', 'year', 0.95, false, 'migration-139'),

  -- Socure (id=2): Johnny Ayers, ~14 yrs exp, first company, solo founder
  ('company', '2', 'founder_experience_years', 14, 'years', '2012-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '2', 'founder_prior_exits',       0, 'count', '2012-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '2', 'team_size_leadership',       6, 'count', '2012-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),
  ('company', '2', 'founder_count',              1, 'count', '2012-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- Abnormal AI (id=3): Reiser + Jeyakumar, both ex-Twitter ML, 2 co-founders
  ('company', '3', 'founder_experience_years', 12, 'years', '2018-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '3', 'founder_prior_exits',       0, 'count', '2018-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '3', 'team_size_leadership',       7, 'count', '2018-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '3', 'founder_count',              2, 'count', '2018-01-01', '2026-03-30', 'year', 0.95, false, 'migration-139'),

  -- TensorWave (id=4): Tomasik + co-founder, 2 co-founders
  ('company', '4', 'founder_experience_years', 10, 'years', '2023-01-01', '2026-03-30', 'year', 0.75, false, 'migration-139'),
  ('company', '4', 'founder_prior_exits',       0, 'count', '2023-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '4', 'team_size_leadership',       4, 'count', '2023-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '4', 'founder_count',              2, 'count', '2023-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- 1047 Games (id=5): Ian Nicholson, young founder, 1 co-founder team
  ('company', '5', 'founder_experience_years',  5, 'years', '2017-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),
  ('company', '5', 'founder_prior_exits',        0, 'count', '2017-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '5', 'team_size_leadership',        4, 'count', '2017-01-01', '2026-03-30', 'year', 0.60, false, 'migration-139'),
  ('company', '5', 'founder_count',               2, 'count', '2017-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),

  -- Hubble Network (id=6): Wild + Noyola, 2 co-founders, YC alums
  ('company', '6', 'founder_experience_years', 12, 'years', '2021-01-01', '2026-03-30', 'year', 0.75, false, 'migration-139'),
  ('company', '6', 'founder_prior_exits',       0, 'count', '2021-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '6', 'team_size_leadership',       5, 'count', '2021-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '6', 'founder_count',              2, 'count', '2021-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- Boxabl (id=7): Galiano + Paolo Tiramani, father-son, 2 co-founders
  ('company', '7', 'founder_experience_years', 30, 'years', '2017-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '7', 'founder_prior_exits',       1, 'count', '2017-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),
  ('company', '7', 'team_size_leadership',       5, 'count', '2017-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '7', 'founder_count',              2, 'count', '2017-01-01', '2026-03-30', 'year', 0.95, false, 'migration-139'),

  -- Carbon Health (id=8): Eren Bali, 1 prior exit (Udemy), serial founder
  ('company', '8', 'founder_experience_years', 15, 'years', '2015-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '8', 'founder_prior_exits',       1, 'count', '2015-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),
  ('company', '8', 'team_size_leadership',       8, 'count', '2015-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '8', 'founder_count',              3, 'count', '2015-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),

  -- MNTN (id=9): Mark Douglas, founded as SteelHouse, solo founder
  ('company', '9', 'founder_experience_years', 20, 'years', '2013-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '9', 'founder_prior_exits',       0, 'count', '2013-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '9', 'team_size_leadership',       7, 'count', '2013-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '9', 'founder_count',              1, 'count', '2013-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- Katalyst (id=10): Bjoern Woltermann, solo founder
  ('company', '10', 'founder_experience_years', 15, 'years', '2015-01-01', '2026-03-30', 'year', 0.75, false, 'migration-139'),
  ('company', '10', 'founder_prior_exits',       0, 'count', '2015-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '10', 'team_size_leadership',       4, 'count', '2015-01-01', '2026-03-30', 'year', 0.60, false, 'migration-139'),
  ('company', '10', 'founder_count',              1, 'count', '2015-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- CIQ (id=11): Gregory Kurtzer, 1 prior exit (CentOS), serial founder
  ('company', '11', 'founder_experience_years', 25, 'years', '2021-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '11', 'founder_prior_exits',       1, 'count', '2021-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),
  ('company', '11', 'team_size_leadership',       6, 'count', '2021-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '11', 'founder_count',              1, 'count', '2021-01-01', '2026-03-30', 'year', 0.95, false, 'migration-139'),

  -- Lyten (id=29): Dan Cook, 20+ yrs materials science, co-founder team
  ('company', '29', 'founder_experience_years', 22, 'years', '2015-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '29', 'founder_prior_exits',       0, 'count', '2015-01-01', '2026-03-30', 'year', 0.75, false, 'migration-139'),
  ('company', '29', 'team_size_leadership',       6, 'count', '2015-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '29', 'founder_count',              3, 'count', '2015-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),

  -- Ioneer (id=49): public company, executive team
  ('company', '49', 'founder_experience_years', 30, 'years', '2018-01-01', '2026-03-30', 'year', 0.75, false, 'migration-139'),
  ('company', '49', 'founder_prior_exits',       0, 'count', '2018-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),
  ('company', '49', 'team_size_leadership',       5, 'count', '2018-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '49', 'founder_count',              2, 'count', '2018-01-01', '2026-03-30', 'year', 0.70, false, 'migration-139'),

  -- Dragonfly Energy (id=50): Denis Phares, PhD physics, solo founder
  ('company', '50', 'founder_experience_years', 18, 'years', '2012-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '50', 'founder_prior_exits',       0, 'count', '2012-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '50', 'team_size_leadership',       5, 'count', '2012-01-01', '2026-03-30', 'year', 0.65, false, 'migration-139'),
  ('company', '50', 'founder_count',              1, 'count', '2012-01-01', '2026-03-30', 'year', 0.90, false, 'migration-139'),

  -- Sierra Nevada Corp (id=51): Ozmen family, acquired 1994, 2 co-owners
  ('company', '51', 'founder_experience_years', 35, 'years', '1994-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139'),
  ('company', '51', 'founder_prior_exits',       0, 'count', '1994-01-01', '2026-03-30', 'year', 0.80, false, 'migration-139'),
  ('company', '51', 'team_size_leadership',      12, 'count', '1994-01-01', '2026-03-30', 'year', 0.60, false, 'migration-139'),
  ('company', '51', 'founder_count',              2, 'count', '1994-01-01', '2026-03-30', 'year', 0.85, false, 'migration-139')
ON CONFLICT DO NOTHING;

COMMIT;
