-- Migration 060: Add remaining i_ investor nodes to externals
--
-- Purpose: Ensure all i_ investor nodes referenced in graph_edges are present
-- in the externals table. As of 2026-03-09, a pre-migration audit confirmed
-- that all 55 i_ investor nodes are already resolved (migration 046 covered the
-- bulk of them). This migration is a no-op for existing data but is kept for
-- completeness and idempotency in case any new i_ edges are added in the future.
--
-- Audit results (run before authoring this migration):
--   SELECT COUNT(*) FROM externals WHERE id LIKE 'i_%';
--   → 55 rows
--
--   Unresolved i_ nodes in graph_edges (source OR target):
--   → 0 rows
--
-- Other unresolved prefix categories found (NOT covered by this migration):
--   f_  : 3 nodes (f_dcvc, f_startupnv, f_stripes) — fund nodes missing from graph_funds
--   c_  : 3 nodes (c_ford, c_primeplanetsenergy, c_sibanyestillwater) — company nodes missing from companies
--   x_  : 216 edges across ~185 x_ nodes — external/miscellaneous nodes not yet in externals
--   u_  : 13 edges across 12 u_ nodes — university/research nodes not yet in externals
--   gov : 16 edges across 16 gov_ nodes — government agency nodes not yet in externals
--
-- These other categories require separate migrations scoped to their respective
-- entity types.

BEGIN;

-- i_ investor nodes: all already present (ON CONFLICT DO NOTHING for idempotency)
-- The full set of 55 investors was ingested in migration 046_ingest_bbv_portfolio_edges.sql.
-- No new i_ nodes remain unresolved as of this migration.

INSERT INTO externals (id, name, entity_type, note) VALUES
  -- VC Firms
  ('i_accel',               'Accel',                                'VC Firm',       NULL),
  ('i_accomplice_vc',       'Accomplice VC',                        'VC Firm',       NULL),
  ('i_alpha_edison',        'Alpha Edison',                         'VC Firm',       NULL),
  ('i_alumni_ventures',     'Alumni Ventures Group',                'VC Firm',       NULL),
  ('i_apg_partners',        'APG Partners',                         'VC Firm',       NULL),
  ('i_base_ventures',       'Base Ventures',                        'VC Firm',       NULL),
  ('i_bessemer',            'Bessemer Venture Partners',            'VC Firm',       NULL),
  ('i_boldstart',           'Boldstart Ventures',                   'VC Firm',       NULL),
  ('i_bvp',                 'Bessemer Venture Partners',            'VC Firm',       'Alternate slug for i_bessemer'),
  ('i_canaan',              'Canaan Partners',                      'VC Firm',       NULL),
  ('i_capital_factory',     'Capital Factory',                      'VC Firm',       NULL),
  ('i_commerce_v',          'Commerce Ventures',                    'VC Firm',       NULL),
  ('i_craft',               'Craft Ventures',                       'VC Firm',       NULL),
  ('i_elevate_ventures',    'Elevate Ventures',                     'VC Firm',       NULL),
  ('i_emergence',           'Emergence Capital',                    'VC Firm',       NULL),
  ('i_flagship',            'Flagship Pioneering',                  'VC Firm',       NULL),
  ('i_founders',            'Founders Fund',                        'VC Firm',       NULL),
  ('i_founders_fund',       'Founders Fund',                        'VC Firm',       'Alternate slug for i_founders'),
  ('i_fx_capital',          'FX Capital',                           'VC Firm',       NULL),
  ('i_grey_collar_ventures','Grey Collar Ventures',                 'VC Firm',       NULL),
  ('i_greylock',            'Greylock Partners',                    'VC Firm',       NULL),
  ('i_h7_biocapital',       'H7 BioCapital',                       'VC Firm',       NULL),
  ('i_insight',             'Insight Partners',                     'VC Firm',       NULL),
  ('i_khosla',              'Khosla Ventures',                      'VC Firm',       NULL),
  ('i_launch_fund',         'LAUNCH Fund',                          'VC Firm',       NULL),
  ('i_lerer',               'Lerer Hippeau',                        'VC Firm',       NULL),
  ('i_lsvp',                'Lightspeed Venture Partners',          'VC Firm',       NULL),
  ('i_menlo',               'Menlo Ventures',                       'VC Firm',       NULL),
  ('i_openview',            'OpenView Venture Partners',            'VC Firm',       NULL),
  ('i_ozone_ventures',      'Ozone Ventures',                       'VC Firm',       NULL),
  ('i_pharmstars',          'PharmStars',                           'VC Firm',       NULL),
  ('i_plug_play',           'Plug and Play Alberta',                'VC Firm',       NULL),
  ('i_redpoint',            'Redpoint Ventures',                    'VC Firm',       NULL),
  ('i_reno_seed_fund',      'Reno Seed Fund',                       'VC Firm',       NULL),
  ('i_ruttenberg_gordon',   'Ruttenberg Gordon Investments',        'VC Firm',       NULL),
  ('i_sequoia',             'Sequoia Capital',                      'VC Firm',       NULL),
  ('i_sigma',               'Sigma Partners',                       'VC Firm',       NULL),
  ('i_sosv',                'SOSV',                                 'VC Firm',       NULL),
  ('i_value_asset_mgmt',    'Value Asset Management',               'VC Firm',       NULL),
  ('i_vtf_capital',         'VTF Capital (Vegas Tech Fund)',         'VC Firm',       NULL),
  ('i_yellow',              'Yellow',                               'VC Firm',       NULL),
  ('i_you_and_mr_jones',    'You & Mr Jones',                       'VC Firm',       NULL),

  -- Angel investors / programs
  ('i_angel_fintech',       'Angel Fintech Syndicate',              'Angel',         NULL),
  ('i_angelnv',             'AngelNV',                              'Angel Program', NULL),
  ('i_biz_stone',           'Biz Stone',                            'Angel',         NULL),
  ('i_john_albright',       'John Albright',                        'Angel',         NULL),
  ('i_techcrunch',          'TechCrunch Disrupt Syndicate',         'Angel',         NULL),

  -- Family Offices
  ('i_carpenter_family',    'The Carpenter Family',                 'Family Office', NULL),

  -- Corporations / Strategic investors
  ('i_brandtech_group',     'Brandtech Group',                      'Corporation',   NULL),
  ('i_endeavor',            'Endeavor',                             'Corporation',   NULL),
  ('i_ms_ventures',         'Morgan Stanley Inclusive Ventures Lab','Corporation',   NULL),

  -- Government
  ('i_city_of_las_vegas',   'City of Las Vegas',                    'Government',    NULL),

  -- University / endowment
  ('i_unlv_foundation',     'UNLV Foundation',                      'University',    NULL),

  -- Crowdfunding
  ('i_republic',            'Republic',                             'Crowdfunding',  NULL),

  -- Other (does not carry i_ prefix but was grouped with investors in prior migrations)
  ('ibm-research',          'IBM Research',                         'Corporation',   NULL)

ON CONFLICT (id) DO NOTHING;

COMMIT;
