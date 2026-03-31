-- Migration 145: Institutional investor nodes and LP/co-investment edges
-- Supports RQ1 (Institutional Investor Matching) of the T-GNN research.
-- Adds pension funds, state treasury, PE firms, and family offices as externals
-- with graph_edges representing LP commitments to BBV Fund III.
-- Generated: 2026-03-30

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Institutional investor externals
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nvpers',       'Nevada PERS',                  'Pension Fund',   '$15M LP in BBV Fund III. State pension recycling into NV startups.'),
  ('x_nvtreasurer',  'NV State Treasurer',           'Government',     '$5M LP in BBV Fund III Innovation Fund.'),
  ('x_gs_pe',        'Goldman Sachs PE',             'PE Firm',        '$12M co-investing with Switch Ventures.'),
  ('x_jpmorgan_aa',  'JPMorgan Alternative Assets',  'PE Firm',        '$8M into BBV Fund III.'),
  ('x_wynn_fo',      'Wynn Family Office',           'Family Office',  '$10M anchor LP BBV Fund III. Gaming-to-tech diversification.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. LP and co-investment edges into BBV Fund III (f_bbv)
-- ══════════════════════════════════════════════════════════════════════════════

-- Nevada PERS → BBV Fund III ($15M LP commitment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nvpers', 'f_bbv', 'invested_in', '$15M LP commitment. State pension recycling into NV venture.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- NV State Treasurer → BBV Fund III ($5M LP commitment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nvtreasurer', 'f_bbv', 'invested_in', '$5M LP commitment. State innovation fund allocation.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Goldman Sachs PE → BBV Fund III ($12M co-investment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gs_pe', 'f_bbv', 'invested_in', '$12M co-invest with Switch Ventures. Wall Street validates NV ecosystem.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- JPMorgan Alternative Assets → BBV Fund III ($8M LP commitment)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_jpmorgan_aa', 'f_bbv', 'invested_in', '$8M LP commitment. Institutional validation of SSBCI model.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Wynn Family Office → BBV Fund III ($10M anchor LP)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_wynn_fo', 'f_bbv', 'invested_in', '$10M anchor LP. Gaming-to-tech diversification thesis.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

-- Ozmen Ventures → Sierra Nevada Corp (defense-adjacent, existing external)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ozmen', 'c_51', 'invested_in', 'Defense-adjacent startup investment. Ozmen family ownership.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

COMMIT;
