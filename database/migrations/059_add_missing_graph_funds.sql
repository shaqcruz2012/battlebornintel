-- Migration 059: Add missing graph_funds rows and missing u_ externals
--
-- Context:
--   The graph loads graph_funds with node IDs formatted as 'f_' + graph_funds.id
--   (e.g., graph_funds.id = 'dcvc' → graph node 'f_dcvc').
--
--   graph_edges references 3 fund nodes that have no matching graph_funds row:
--     f_dcvc      → funds.id = 'dcvc'   (Deep Tech VC)
--     f_startupnv → funds.id = 'startupnv' (Accelerator)
--     f_stripes   → funds.id = 'stripes'  (Growth VC)
--
--   graph_edges also references 12 u_ university/research-lab nodes that are
--   completely absent from the externals table:
--     u_UCSD, u_ara_lab, u_dri, u_slac, u_uci,
--     u_unlv_biotech, u_unlv_engineering, u_unlv_nanotechnology, u_unlv_rebel,
--     u_unr, u_unr_medical, u_unr_space
--
--   NOTE: No 'g_' prefixed node IDs exist in graph_edges — the 'g_' pattern
--   yielded only 'gov_' nodes (government agencies), which are unrelated to funds.
--   The fund node prefix in use is exclusively 'f_'.

BEGIN;

-- ============================================================
-- 1. Add missing graph_funds rows
--    graph_funds.id must match the suffix after 'f_' in graph_edges
-- ============================================================

INSERT INTO graph_funds (id, name, fund_type, fund_id, verified)
VALUES
  ('dcvc',      'DCVC',      'Deep Tech VC', 'dcvc',      false),
  ('startupnv', 'StartUpNV', 'Accelerator',  'startupnv', false),
  ('stripes',   'Stripes',   'Growth VC',    'stripes',   false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Add missing u_ university / research-lab externals
--    These are referenced in graph_edges but absent from externals
-- ============================================================

INSERT INTO externals (id, name, entity_type, verified)
VALUES
  -- Nevada institutions
  ('u_unlv_biotech',        'UNLV Biotechnology Program',               'University', false),
  ('u_unlv_engineering',    'UNLV Howard R. Hughes College of Engineering', 'University', false),
  ('u_unlv_nanotechnology', 'UNLV Nanofabrication & Nanotechnology',    'University', false),
  ('u_unlv_rebel',          'UNLV Rebel Fund',                          'University', false),
  ('u_unr',                 'University of Nevada, Reno',               'University', false),
  ('u_unr_medical',         'University of Nevada, Reno School of Medicine', 'University', false),
  ('u_unr_space',           'UNR Space Sciences Center',                'University', false),
  ('u_ara_lab',             'UNR Advanced Robotics and Automation Lab', 'University', false),

  -- California / national research institutions
  ('u_UCSD',  'UC San Diego',                      'University', false),
  ('u_uci',   'UC Irvine',                         'University', false),
  ('u_slac',  'SLAC National Accelerator Laboratory', 'University', false),
  ('u_dri',   'Desert Research Institute',          'University', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Optionally requested Nevada higher-ed nodes
--    (u_unlv is already in externals; adding the others per spec)
-- ============================================================

INSERT INTO externals (id, name, entity_type, verified)
VALUES
  ('u_unr_main',      'University of Nevada, Reno',         'University',        false),
  ('u_nsc',           'Nevada State College',               'University',        false),
  ('u_csn',           'College of Southern Nevada',         'University',        false),
  ('u_nevada_system', 'Nevada System of Higher Education',  'University System', false)
ON CONFLICT (id) DO NOTHING;

COMMIT;
