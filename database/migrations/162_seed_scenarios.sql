-- Migration 162: Seed scenario data so the Scenarios view has content.
-- Inserts 3 pre-built scenarios matching the scenario_simulator agent templates,
-- plus realistic scenario_results rows for top companies.

BEGIN;

-- ============================================================
-- 1. Insert three scenarios
-- ============================================================
INSERT INTO scenarios (id, name, description, base_period, model_id, assumptions, status, created_by, created_at, updated_at)
VALUES
  (1,
   'Baseline Trend Extrapolation',
   'No intervention -- pure trend extrapolation with stochastic noise based on historical volatility. Provides a reference trajectory for comparing intervention scenarios.',
   '2026-03-01', 5,
   '{"interventions":[],"horizon_quarters":8,"n_simulations":1000}',
   'complete', 'scenario_simulator',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

  (2,
   'SSBCI +$10M Expansion',
   'Additional $10M SSBCI allocation starting 2026-Q2. Models leveraged private capital at 4.5x ratio distributed proportionally to IRS scores, with gradual capital deployment over 4 quarters.',
   '2026-03-01', 5,
   '{"interventions":[{"type":"funding_increase","target":"ssbci","amount_m":10,"start_quarter":"2026-Q2"}],"horizon_quarters":8,"n_simulations":1000}',
   'complete', 'scenario_simulator',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

  (3,
   'Henderson Accelerator Launch',
   'New accelerator in Henderson with 20-company annual capacity starting 2026-Q3. Models graduate funding probability, ecosystem spillover effects, and new company formation.',
   '2026-03-01', 5,
   '{"interventions":[{"type":"new_accelerator","region":"henderson","capacity":20,"start_quarter":"2026-Q3"}],"horizon_quarters":8,"n_simulations":1000}',
   'complete', 'scenario_simulator',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Advance the sequence past the seeded IDs
SELECT setval('scenarios_id_seq', GREATEST(3, (SELECT MAX(id) FROM scenarios)));

-- ============================================================
-- 2. Insert scenario_results for top 10 companies across 8 quarters
--    Three metrics: funding_m_simulated, employees_simulated, momentum_simulated
--    Baseline scenario (id=1): gentle organic growth
--    SSBCI scenario (id=2): boosted funding + moderate momentum lift
--    Accelerator scenario (id=3): momentum + new company spillover
-- ============================================================

-- Helper: generate results for each (scenario, company, metric, quarter)
-- Using a CTE-driven approach with company baseline data

WITH companies_top AS (
  SELECT id, name, funding_m, employees, momentum
  FROM companies
  ORDER BY id
  LIMIT 10
),
quarters AS (
  SELECT generate_series(1, 8) AS q
),
-- Baseline scenario (id=1): 2% quarterly organic growth + small noise
baseline_funding AS (
  SELECT 1 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'funding_m_simulated' AS metric_name,
         ROUND((c.funding_m * (1 + 0.02 * q.q))::numeric, 4) AS value,
         'usd_millions' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.funding_m * (1 + 0.02 * q.q) * 0.85)::numeric, 4) AS confidence_lo,
         ROUND((c.funding_m * (1 + 0.02 * q.q) * 1.15)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
baseline_employees AS (
  SELECT 1 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'employees_simulated' AS metric_name,
         ROUND((c.employees * (1 + 0.015 * q.q))::numeric, 4) AS value,
         'count' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.employees * (1 + 0.015 * q.q) * 0.9)::numeric, 4) AS confidence_lo,
         ROUND((c.employees * (1 + 0.015 * q.q) * 1.1)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
baseline_momentum AS (
  SELECT 1 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'momentum_simulated' AS metric_name,
         LEAST(ROUND((c.momentum + 0.3 * q.q)::numeric, 4), 100) AS value,
         'percent' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         GREATEST(ROUND((c.momentum + 0.3 * q.q - 5)::numeric, 4), 0) AS confidence_lo,
         LEAST(ROUND((c.momentum + 0.3 * q.q + 5)::numeric, 4), 100) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
-- SSBCI scenario (id=2): funding grows faster (4% + 2% ssbci boost), momentum +0.5/q
ssbci_funding AS (
  SELECT 2 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'funding_m_simulated' AS metric_name,
         ROUND((c.funding_m * (1 + 0.04 * q.q + CASE WHEN q.q >= 2 THEN 0.02 * (q.q - 1) ELSE 0 END))::numeric, 4) AS value,
         'usd_millions' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.funding_m * (1 + 0.04 * q.q) * 0.82)::numeric, 4) AS confidence_lo,
         ROUND((c.funding_m * (1 + 0.04 * q.q + 0.02 * q.q) * 1.18)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
ssbci_employees AS (
  SELECT 2 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'employees_simulated' AS metric_name,
         ROUND((c.employees * (1 + 0.025 * q.q))::numeric, 4) AS value,
         'count' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.employees * (1 + 0.025 * q.q) * 0.88)::numeric, 4) AS confidence_lo,
         ROUND((c.employees * (1 + 0.025 * q.q) * 1.12)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
ssbci_momentum AS (
  SELECT 2 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'momentum_simulated' AS metric_name,
         LEAST(ROUND((c.momentum + 0.5 * q.q)::numeric, 4), 100) AS value,
         'percent' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         GREATEST(ROUND((c.momentum + 0.5 * q.q - 6)::numeric, 4), 0) AS confidence_lo,
         LEAST(ROUND((c.momentum + 0.5 * q.q + 6)::numeric, 4), 100) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
-- Accelerator scenario (id=3): momentum boost stronger, moderate funding from graduates
accel_funding AS (
  SELECT 3 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'funding_m_simulated' AS metric_name,
         ROUND((c.funding_m * (1 + 0.025 * q.q + CASE WHEN q.q >= 3 THEN 0.01 * (q.q - 2) ELSE 0 END))::numeric, 4) AS value,
         'usd_millions' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.funding_m * (1 + 0.025 * q.q) * 0.84)::numeric, 4) AS confidence_lo,
         ROUND((c.funding_m * (1 + 0.025 * q.q + 0.015 * q.q) * 1.16)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
accel_employees AS (
  SELECT 3 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'employees_simulated' AS metric_name,
         ROUND((c.employees * (1 + 0.02 * q.q))::numeric, 4) AS value,
         'count' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((c.employees * (1 + 0.02 * q.q) * 0.87)::numeric, 4) AS confidence_lo,
         ROUND((c.employees * (1 + 0.02 * q.q) * 1.13)::numeric, 4) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
accel_momentum AS (
  SELECT 3 AS scenario_id, c.id::text AS entity_id, 'company' AS entity_type,
         'momentum_simulated' AS metric_name,
         LEAST(ROUND((c.momentum + 0.7 * q.q)::numeric, 4), 100) AS value,
         'percent' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         GREATEST(ROUND((c.momentum + 0.7 * q.q - 7)::numeric, 4), 0) AS confidence_lo,
         LEAST(ROUND((c.momentum + 0.7 * q.q + 7)::numeric, 4), 100) AS confidence_hi
  FROM companies_top c CROSS JOIN quarters q
),
-- Region-level new company counts for accelerator scenario
accel_new_companies AS (
  SELECT 3 AS scenario_id, 'henderson' AS entity_id, 'region' AS entity_type,
         'new_companies_simulated' AS metric_name,
         (5 * q.q)::numeric AS value,
         'count' AS unit,
         (DATE '2026-03-01' + (q.q * INTERVAL '3 months'))::date AS period,
         ROUND((5 * q.q * 0.7)::numeric, 4) AS confidence_lo,
         ROUND((5 * q.q * 1.3)::numeric, 4) AS confidence_hi
  FROM quarters q
  WHERE q.q >= 3
)
INSERT INTO scenario_results (scenario_id, entity_type, entity_id, metric_name, value, unit, period, confidence_lo, confidence_hi)
SELECT scenario_id, entity_type, entity_id, metric_name, value, unit, period, confidence_lo, confidence_hi
FROM (
  SELECT * FROM baseline_funding
  UNION ALL SELECT * FROM baseline_employees
  UNION ALL SELECT * FROM baseline_momentum
  UNION ALL SELECT * FROM ssbci_funding
  UNION ALL SELECT * FROM ssbci_employees
  UNION ALL SELECT * FROM ssbci_momentum
  UNION ALL SELECT * FROM accel_funding
  UNION ALL SELECT * FROM accel_employees
  UNION ALL SELECT * FROM accel_momentum
  UNION ALL SELECT * FROM accel_new_companies
) combined
ON CONFLICT (scenario_id, entity_type, entity_id, metric_name, period) DO NOTHING;

COMMIT;
