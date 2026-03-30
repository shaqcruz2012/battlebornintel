-- Migration 149: Interstate Comparison — Peer State Benchmarking
-- T-GNN Research Analysis RQ4: How does Nevada compare to peer states?
-- Peer states: Utah, Colorado, Arizona (+ Nevada baseline)
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/149_interstate_comparison.sql

BEGIN;

-- ============================================================
-- 1. Add peer state regions (idempotent — skip if name+level exists)
-- ============================================================
-- The regions table has no unique constraint on (name) or (iso_code),
-- so we use WHERE NOT EXISTS to ensure idempotency.

INSERT INTO regions (name, level, iso_code, parent_id, population, gdp_b)
SELECT v.name, v.level, v.iso_code, v.parent_id, v.population, v.gdp_b
FROM (VALUES
  ('Utah',     'state', 'US-UT', NULL::INTEGER, 3417734::BIGINT, 257::NUMERIC(12,2)),
  ('Colorado', 'state', 'US-CO', NULL::INTEGER, 5877610::BIGINT, 484::NUMERIC(12,2)),
  ('Arizona',  'state', 'US-AZ', NULL::INTEGER, 7303398::BIGINT, 446::NUMERIC(12,2))
) AS v(name, level, iso_code, parent_id, population, gdp_b)
WHERE NOT EXISTS (
  SELECT 1 FROM regions r WHERE r.name = v.name AND r.level = v.level
);

-- Update Nevada's population and GDP if not already set
UPDATE regions
SET population = 3194176,
    gdp_b      = 218,
    iso_code   = COALESCE(iso_code, 'US-NV')
WHERE name = 'Nevada' AND level = 'state';

-- ============================================================
-- 2. Store interstate comparison metrics in metric_snapshots
-- ============================================================
-- Uses region id (cast to text) as entity_id per polymorphic convention.
-- Metrics sourced from public data estimates (2025 annual).

INSERT INTO metric_snapshots
  (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id, agent_id)

-- Nevada metrics
SELECT 'region', r.id::TEXT, v.metric_name, v.value, v.unit,
       '2025-01-01'::DATE, '2025-12-31'::DATE, 'year', v.confidence, false, NULL, 'interstate_comparison'
FROM regions r
CROSS JOIN (VALUES
  ('venture_capital_deployed_b',  1.2,    'billion_usd', 0.75),
  ('accelerator_count',          12.0,    'count',       0.85),
  ('university_spinouts_annual',  5.0,    'count',       0.80),
  ('companies_per_accelerator',  12.0,    'ratio',       0.70),
  ('ssbci_allocation_m',         73.0,    'usd_millions', 0.85),
  ('avg_seed_round_m',            2.5,    'usd_millions', 0.75),
  ('tech_workforce_pct',          4.2,    'percent',     0.80),
  ('patent_filings_annual',    1200.0,    'count',       0.75)
) AS v(metric_name, value, unit, confidence)
WHERE r.name = 'Nevada' AND r.level = 'state'

UNION ALL

-- Utah metrics
SELECT 'region', r.id::TEXT, v.metric_name, v.value, v.unit,
       '2025-01-01'::DATE, '2025-12-31'::DATE, 'year', v.confidence, false, NULL, 'interstate_comparison'
FROM regions r
CROSS JOIN (VALUES
  ('venture_capital_deployed_b',  4.8,    'billion_usd', 0.75),
  ('accelerator_count',          35.0,    'count',       0.85),
  ('university_spinouts_annual', 45.0,    'count',       0.80),
  ('companies_per_accelerator',   8.0,    'ratio',       0.70),
  ('ssbci_allocation_m',         45.0,    'usd_millions', 0.85),
  ('avg_seed_round_m',            3.8,    'usd_millions', 0.75),
  ('tech_workforce_pct',          8.1,    'percent',     0.80),
  ('patent_filings_annual',    3500.0,    'count',       0.75)
) AS v(metric_name, value, unit, confidence)
WHERE r.name = 'Utah' AND r.level = 'state'

UNION ALL

-- Colorado metrics
SELECT 'region', r.id::TEXT, v.metric_name, v.value, v.unit,
       '2025-01-01'::DATE, '2025-12-31'::DATE, 'year', v.confidence, false, NULL, 'interstate_comparison'
FROM regions r
CROSS JOIN (VALUES
  ('venture_capital_deployed_b',  3.2,    'billion_usd', 0.75),
  ('accelerator_count',          28.0,    'count',       0.85),
  ('university_spinouts_annual', 30.0,    'count',       0.80),
  ('companies_per_accelerator',   7.0,    'ratio',       0.70),
  ('ssbci_allocation_m',         55.0,    'usd_millions', 0.85),
  ('avg_seed_round_m',            3.5,    'usd_millions', 0.75),
  ('tech_workforce_pct',          7.5,    'percent',     0.80),
  ('patent_filings_annual',    4200.0,    'count',       0.75)
) AS v(metric_name, value, unit, confidence)
WHERE r.name = 'Colorado' AND r.level = 'state'

UNION ALL

-- Arizona metrics
SELECT 'region', r.id::TEXT, v.metric_name, v.value, v.unit,
       '2025-01-01'::DATE, '2025-12-31'::DATE, 'year', v.confidence, false, NULL, 'interstate_comparison'
FROM regions r
CROSS JOIN (VALUES
  ('venture_capital_deployed_b',  1.5,    'billion_usd', 0.75),
  ('accelerator_count',          18.0,    'count',       0.85),
  ('university_spinouts_annual', 20.0,    'count',       0.80),
  ('companies_per_accelerator',   9.0,    'ratio',       0.70),
  ('ssbci_allocation_m',         60.0,    'usd_millions', 0.85),
  ('avg_seed_round_m',            2.8,    'usd_millions', 0.75),
  ('tech_workforce_pct',          5.3,    'percent',     0.80),
  ('patent_filings_annual',    2800.0,    'count',       0.75)
) AS v(metric_name, value, unit, confidence)
WHERE r.name = 'Arizona' AND r.level = 'state'

ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 3. Register comparison features in feature_registry
-- ============================================================
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('region', 'venture_capital_deployed_b', 'numeric', 'public_data',  false, 'Total VC deployed in billions USD (annual)'),
  ('region', 'accelerator_count',          'numeric', 'public_data',  false, 'Number of active accelerators/incubators'),
  ('region', 'university_spinouts_annual', 'numeric', 'public_data',  false, 'University spinout companies per year'),
  ('region', 'companies_per_accelerator',  'numeric', 'computed',     false, 'Average companies per accelerator (density ratio)'),
  ('region', 'ssbci_allocation_m',         'numeric', 'treasury_gov', false, 'SSBCI allocation in millions USD'),
  ('region', 'avg_seed_round_m',           'numeric', 'public_data',  false, 'Average seed-stage round size in millions USD'),
  ('region', 'tech_workforce_pct',         'numeric', 'bls',          false, 'Technology workforce as percent of total employment'),
  ('region', 'patent_filings_annual',      'numeric', 'uspto',        false, 'Annual patent filings originating from the state')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- ============================================================
-- 4. Comparison view — pivot metrics by state for side-by-side
-- ============================================================
CREATE OR REPLACE VIEW v_interstate_comparison AS
SELECT
  ms.metric_name,
  ms.unit,
  MAX(CASE WHEN r.name = 'Nevada'   THEN ms.value END) AS nevada,
  MAX(CASE WHEN r.name = 'Utah'     THEN ms.value END) AS utah,
  MAX(CASE WHEN r.name = 'Colorado' THEN ms.value END) AS colorado,
  MAX(CASE WHEN r.name = 'Arizona'  THEN ms.value END) AS arizona,
  -- Nevada's rank among the four states (1 = highest value)
  RANK() OVER (
    PARTITION BY ms.metric_name
    ORDER BY MAX(CASE WHEN r.name = 'Nevada' THEN ms.value END) DESC
  ) AS nevada_rank,
  -- Gap between Nevada and the peer-state average
  ROUND(
    MAX(CASE WHEN r.name = 'Nevada' THEN ms.value END)
    - AVG(CASE WHEN r.name != 'Nevada' THEN ms.value END),
    4
  ) AS nv_vs_peer_avg,
  ms.period_start,
  ms.period_end
FROM metric_snapshots ms
JOIN regions r
  ON r.id = ms.entity_id::INTEGER
  AND r.level = 'state'
  AND r.name IN ('Nevada', 'Utah', 'Colorado', 'Arizona')
WHERE ms.entity_type = 'region'
  AND ms.agent_id = 'interstate_comparison'
GROUP BY ms.metric_name, ms.unit, ms.period_start, ms.period_end;

COMMENT ON VIEW v_interstate_comparison IS
  'RQ4 peer-state benchmarking: pivoted metrics for NV vs UT, CO, AZ with gap analysis';

COMMIT;
