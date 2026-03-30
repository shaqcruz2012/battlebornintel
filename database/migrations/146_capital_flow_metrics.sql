-- Migration 146: Capital flow metric_snapshots for RQ3 (Capital Flow Patterns)
-- Stores SSBCI leverage ratios, public institution contribution metrics,
-- and capital magnet scores for top Nevada ecosystem companies.
-- Generated: 2026-03-30

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Register new features in feature_registry
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('fund',      'ssbci_allocated',            'numeric', 'ssbci_reports',   false, 'SSBCI allocated capital in millions USD'),
  ('fund',      'ssbci_deployed',             'numeric', 'ssbci_reports',   false, 'SSBCI deployed capital in millions USD'),
  ('fund',      'co_investment_attracted',     'numeric', 'ssbci_reports',   false, 'Co-investment capital attracted in millions USD'),
  ('fund',      'ssbci_leverage_ratio',        'numeric', 'computed',        false, 'SSBCI leverage ratio (co-investment / deployed)'),
  ('ecosystem', 'total_ecosystem_funding',     'numeric', 'computed',        false, 'Total ecosystem funding in millions USD'),
  ('ecosystem', 'public_institution_direct',   'numeric', 'computed',        false, 'Direct public institution funding in millions USD'),
  ('ecosystem', 'public_deal_origination_pct', 'numeric', 'computed',        false, 'Percentage of deals originated by public institutions'),
  ('company',   'capital_magnet_score',        'numeric', 'computed',        false, 'Total capital attracted in millions USD (cumulative funding)')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. SSBCI fund leverage metrics
-- ══════════════════════════════════════════════════════════════════════════════

-- BBV (Battle Born Venture) — f_bbv / graph_funds id = 'bbv'
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  ('fund', 'bbv', 'ssbci_allocated',         36.0,  'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.90, true, NULL),
  ('fund', 'bbv', 'ssbci_deployed',          14.0,  'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.85, true, NULL),
  ('fund', 'bbv', 'co_investment_attracted', 115.0,  'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.80, false, NULL),
  ('fund', 'bbv', 'ssbci_leverage_ratio',     3.2,  'ratio',       '2022-01-01', '2025-12-31', 'cumulative', 0.80, false, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- FundNV
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  ('fund', 'fundnv', 'ssbci_allocated', 3.0, 'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.85, true, NULL),
  ('fund', 'fundnv', 'ssbci_deployed',  2.4, 'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.80, true, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- 1864 Fund
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  ('fund', '1864', 'ssbci_allocated', 10.0, 'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.85, true, NULL),
  ('fund', '1864', 'ssbci_deployed',   1.2, 'million_usd', '2022-01-01', '2025-12-31', 'cumulative', 0.80, true, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Public institution contribution metrics (ecosystem-level)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Total ecosystem funding: $12B
  ('ecosystem', 'nv_innovation', 'total_ecosystem_funding',     12000.0, 'million_usd', '2015-01-01', '2025-12-31', 'cumulative', 0.70, false, NULL),
  -- Public institution direct contribution: ~$47M (0.4% of total)
  ('ecosystem', 'nv_innovation', 'public_institution_direct',      47.0, 'million_usd', '2015-01-01', '2025-12-31', 'cumulative', 0.75, false, NULL),
  -- Public institution deal origination: 15-20% (midpoint 17.5%)
  ('ecosystem', 'nv_innovation', 'public_deal_origination_pct',    17.5, 'percent',     '2015-01-01', '2025-12-31', 'cumulative', 0.65, false, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Capital magnet scores for top companies (total funding attracted, $M)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Redwood Materials (id=1): $4,170M total funding
  ('company', '1',  'capital_magnet_score', 4170.0, 'million_usd', '2017-01-01', '2025-12-31', 'cumulative', 0.85, false, NULL),
  -- Socure (id=2): $744M total funding
  ('company', '2',  'capital_magnet_score',  744.0, 'million_usd', '2012-01-01', '2025-12-31', 'cumulative', 0.85, false, NULL),
  -- Ioneer (id=49): $700M total funding (incl DOE loan commitment)
  ('company', '49', 'capital_magnet_score',  700.0, 'million_usd', '2017-01-01', '2025-12-31', 'cumulative', 0.80, false, NULL),
  -- Abnormal AI (id=3): $534M total funding
  ('company', '3',  'capital_magnet_score',  534.0, 'million_usd', '2018-01-01', '2025-12-31', 'cumulative', 0.85, false, NULL),
  -- Switch Inc (id=58): $530M total funding
  ('company', '58', 'capital_magnet_score',  530.0, 'million_usd', '2000-01-01', '2025-12-31', 'cumulative', 0.80, false, NULL),
  -- Lyten (id=29): $425M total funding
  ('company', '29', 'capital_magnet_score',  425.0, 'million_usd', '2015-01-01', '2025-12-31', 'cumulative', 0.85, false, NULL),
  -- TensorWave (id=4): $147M total funding
  ('company', '4',  'capital_magnet_score',  147.0, 'million_usd', '2023-01-01', '2025-12-31', 'cumulative', 0.85, false, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

COMMIT;
