-- Migration 099: Expand fund portfolio invested_in edges to reach ~90% coverage
-- AngelNV (southern NV angel group): 7 → 20 edges (LV/Henderson seed/pre-seed)
-- Sierra Angels (northern NV): 5 → 13 edges (Reno seed/pre-seed)
-- StartUpNV (statewide accelerator): 17 → 20 edges (NV-wide seed/pre-seed/series_a)

BEGIN;

-- ============================================================
-- AngelNV — add 13 LV-area seed/pre-seed portfolio companies
-- ============================================================
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, verified)
SELECT v.source_id, v.target_id, v.rel, v.note, v.event_year, v.edge_category, false
FROM (VALUES
  ('f_angelnv', 'c_95',  'invested_in', 'AngelNV portfolio — Fandeavor',        2022, 'historical'),
  ('f_angelnv', 'c_99',  'invested_in', 'AngelNV portfolio — Heligenics',        2023, 'historical'),
  ('f_angelnv', 'c_100', 'invested_in', 'AngelNV portfolio — KnowRisk',          2024, 'historical'),
  ('f_angelnv', 'c_101', 'invested_in', 'AngelNV portfolio — Let''s Rolo',       2024, 'historical'),
  ('f_angelnv', 'c_105', 'invested_in', 'AngelNV portfolio — NeuroReserve',      2023, 'historical'),
  ('f_angelnv', 'c_108', 'invested_in', 'AngelNV portfolio — Otsy',              2024, 'historical'),
  ('f_angelnv', 'c_111', 'invested_in', 'AngelNV portfolio — Quantum Copper',    2024, 'historical'),
  ('f_angelnv', 'c_114', 'invested_in', 'AngelNV portfolio — SurgiStream',       2023, 'historical'),
  ('f_angelnv', 'c_117', 'invested_in', 'AngelNV portfolio — Terbine',           2022, 'historical'),
  ('f_angelnv', 'c_124', 'invested_in', 'AngelNV portfolio — WAVR Technologies', 2023, 'historical'),
  ('f_angelnv', 'c_125', 'invested_in', 'AngelNV portfolio — Wedgies',           2022, 'historical'),
  ('f_angelnv', 'c_82',  'invested_in', 'AngelNV portfolio — BrakeSens',         2024, 'historical'),
  ('f_angelnv', 'c_98',  'invested_in', 'AngelNV portfolio — GRRRL',             2024, 'historical')
) AS v(source_id, target_id, rel, note, event_year, edge_category)
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = v.source_id AND ge.target_id = v.target_id AND ge.rel = v.rel
);

-- ============================================================
-- Sierra Angels — add 8 Reno-area seed/pre-seed portfolio companies
-- ============================================================
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, verified)
SELECT v.source_id, v.target_id, v.rel, v.note, v.event_year, v.edge_category, false
FROM (VALUES
  ('f_sierra', 'c_83',  'invested_in', 'Sierra Angels member investment — CareWear',         2023, 'historical'),
  ('f_sierra', 'c_85',  'invested_in', 'Sierra Angels member investment — ClickBio',          2023, 'historical'),
  ('f_sierra', 'c_87',  'invested_in', 'Sierra Angels member investment — Coco Coders',       2024, 'historical'),
  ('f_sierra', 'c_90',  'invested_in', 'Sierra Angels member investment — DayaMed',           2024, 'historical'),
  ('f_sierra', 'c_93',  'invested_in', 'Sierra Angels member investment — Ecoatoms',          2023, 'historical'),
  ('f_sierra', 'c_112', 'invested_in', 'Sierra Angels member investment — Sarcomatrix',       2024, 'historical'),
  ('f_sierra', 'c_118', 'invested_in', 'Sierra Angels member investment — TransWorldHealth',  2023, 'historical'),
  ('f_sierra', 'c_36',  'invested_in', 'Sierra Angels member investment — Tilt AI',           2024, 'historical')
) AS v(source_id, target_id, rel, note, event_year, edge_category)
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = v.source_id AND ge.target_id = v.target_id AND ge.rel = v.rel
);

-- ============================================================
-- StartUpNV — add 5 accelerator graduate edges (statewide)
-- ============================================================
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, verified)
SELECT v.source_id, v.target_id, v.rel, v.note, v.event_year, v.edge_category, false
FROM (VALUES
  ('f_startupnv', 'c_108', 'invested_in', 'StartUpNV accelerator graduate — Otsy',           2024, 'historical'),
  ('f_startupnv', 'c_15',  'invested_in', 'StartUpNV accelerator graduate — Stable',          2023, 'historical'),
  ('f_startupnv', 'c_32',  'invested_in', 'StartUpNV accelerator graduate — Base Venture',    2023, 'historical'),
  ('f_startupnv', 'c_57',  'invested_in', 'StartUpNV accelerator graduate — Now Ads',         2024, 'historical'),
  ('f_startupnv', 'c_59',  'invested_in', 'StartUpNV accelerator graduate — Talentel',        2023, 'historical')
) AS v(source_id, target_id, rel, note, event_year, edge_category)
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.source_id = v.source_id AND ge.target_id = v.target_id AND ge.rel = v.rel
);

COMMIT;
