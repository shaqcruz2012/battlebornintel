-- Migration 145: Populate prediction stack tables with derived and historical data.
-- Backfills node_feature_history, macro_events, company financials, and
-- generates baseline model outputs from the prediction features view.

BEGIN;

-- ═══ 1. NODE FEATURE HISTORY — First snapshot from current state ═════════════

INSERT INTO node_feature_history
  (canonical_id, snapshot_date, feature_vector, feature_names,
   funding_m, employees, momentum, stage, pagerank, betweenness, community_id, degree, source)
SELECT
  'c_' || c.id::TEXT,
  CURRENT_DATE,
  ARRAY[
    c.funding_m::FLOAT, c.momentum::FLOAT, COALESCE(c.employees,0)::FLOAT,
    gmc.pagerank::FLOAT, gmc.betweenness::FLOAT, COALESCE(gmc.community_id,0)::FLOAT,
    COALESCE(ec.cnt,0)::FLOAT,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAKE_DATE(COALESCE(c.founded,2020),1,1)))::FLOAT
  ],
  ARRAY['funding_m','momentum','employees','pagerank','betweenness','community_id','degree','age_years'],
  c.funding_m,
  c.employees,
  c.momentum,
  c.stage,
  gmc.pagerank::FLOAT,
  gmc.betweenness::FLOAT,
  gmc.community_id,
  COALESCE(ec.cnt, 0),
  'migration_145'
FROM companies c
LEFT JOIN graph_metrics_cache gmc ON gmc.node_id = 'c_' || c.id::TEXT
LEFT JOIN LATERAL (
  SELECT COUNT(*) as cnt FROM graph_edges ge
  WHERE ge.source_id = 'c_' || c.id::TEXT OR ge.target_id = 'c_' || c.id::TEXT
) ec ON TRUE
ON CONFLICT (canonical_id, snapshot_date) DO NOTHING;

-- ═══ 2. MACRO EVENTS — Real historical shocks affecting Nevada ══════════════
-- All events are real, documented, and sourced.

INSERT INTO macro_events (event_name, event_type, severity, event_date, duration_months, affected_sectors, affected_regions, description, source_url, confidence, verified)
VALUES
  ('COVID-19 Pandemic Nevada Shutdown', 'pandemic', 'critical', '2020-03-17', 18,
   ARRAY['Gaming','Hospitality','Consumer','Tourism'], ARRAY['las_vegas','reno','henderson'],
   'Governor Sisolak ordered closure of all casinos and nonessential businesses. Gaming revenue dropped 99% in April 2020. 300,000+ unemployment claims filed.',
   'https://gov.nv.gov/News/Emergency_Orders/2020/2020-03-17_-_COVID-19_Declaration_of_Emergency_Directive_003/',
   0.99, TRUE),

  ('Fed Rate Hike Cycle 2022-2023', 'rate_change', 'high', '2022-03-16', 18,
   ARRAY['AI','SaaS','Fintech','CleanTech'], ARRAY['las_vegas','reno'],
   'Fed raised rates from 0.25% to 5.50% over 18 months. VC funding nationally dropped 35%. Nevada startups saw elongated fundraising cycles.',
   'https://www.federalreserve.gov/monetarypolicy/openmarket.htm',
   0.95, TRUE),

  ('Silicon Valley Bank Collapse', 'funding_freeze', 'high', '2023-03-10', 3,
   ARRAY['AI','SaaS','Fintech','HealthTech','Biotech'], ARRAY['las_vegas','reno'],
   'SVB collapse triggered banking panic. NV startups with SVB accounts faced liquidity crises. Short-term funding freeze across venture ecosystem.',
   'https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/silicon-valley.html',
   0.95, TRUE),

  ('Nevada SSBCI 2.0 Tranche 1 Approval', 'policy_change', 'high', '2022-10-01', 36,
   ARRAY['AI','CleanTech','Defense','HealthTech','SaaS','Manufacturing'], ARRAY['las_vegas','reno','henderson'],
   'US Treasury approved $34.87M first tranche of $112.9M SSBCI 2.0 allocation for Nevada. Launched BBV, FundNV, gener8tor accelerator programs.',
   'https://nvsmallbiz.org/',
   0.95, TRUE),

  ('Inflation Reduction Act', 'policy_change', 'high', '2022-08-16', 120,
   ARRAY['CleanTech','Energy','Manufacturing','Mining'], ARRAY['reno','las_vegas'],
   'IRA provides $369B in clean energy tax credits. Directly benefits Nevada lithium/battery companies (Redwood, Ioneer, ABTC). 10% critical minerals production credit.',
   'https://www.whitehouse.gov/cleanenergy/inflation-reduction-act-guidebook/',
   0.95, TRUE),

  ('Tesla Gigafactory Nevada Expansion', 'sector_shock', 'medium', '2023-01-01', 24,
   ARRAY['Manufacturing','CleanTech','Energy','Logistics'], ARRAY['reno'],
   'Tesla announced $3.6B expansion of Gigafactory Nevada for Semi truck and 4680 battery cell production. 3,000 new jobs.',
   'https://www.tesla.com/blog/tesla-semi-gigafactory',
   0.9, TRUE),

  ('CHIPS Act Implementation', 'policy_change', 'medium', '2022-08-09', 60,
   ARRAY['Manufacturing','DeepTech','Defense','Hardware'], ARRAY['reno','las_vegas'],
   '$52.7B for semiconductor manufacturing. While Nevada has no fabs, TRIC data centers and advanced manufacturing benefit from supply chain buildout.',
   'https://www.commerce.gov/chips',
   0.85, TRUE),

  ('Nevada AI Regulatory Sandbox (SB 127)', 'regulatory_change', 'medium', '2025-07-01', 24,
   ARRAY['AI','SaaS','HealthTech','Fintech','Gaming'], ARRAY['las_vegas','reno'],
   'SB 127 creates 24-month AI regulatory sandbox for up to 20 companies. Exempts qualified AI companies from certain regulations during pilot period.',
   'https://www.leg.state.nv.us/App/NELIS/REL/83rd2026/Bill/SB127',
   0.9, TRUE),

  ('Data Center Boom — Reno/TRIC', 'sector_shock', 'medium', '2024-01-01', 36,
   ARRAY['AI','Cloud','Infrastructure','Data Center'], ARRAY['reno'],
   'Google, Microsoft, Switch massive data center expansions at TRIC to support AI workloads. 5GW+ planned capacity.',
   'https://tahoereno.com/',
   0.85, TRUE),

  ('Nevada SSBCI 2.0 Tranche 2 Approval', 'policy_change', 'high', '2025-10-01', 36,
   ARRAY['AI','CleanTech','Defense','HealthTech','SaaS'], ARRAY['las_vegas','reno','henderson'],
   'US Treasury approved $38.51M second tranche. Nevada exceeded all federal deployment benchmarks.',
   'https://www.expansionsolutionsmagazine.com/nevada-secures-38-5-million-in-new-ssbci-funding/',
   0.95, TRUE)
ON CONFLICT DO NOTHING;

-- ═══ 3. BACKFILL COMPANY FINANCIALS — Derive from existing data ═════════════

-- last_funding_date from most recent funding_round
UPDATE companies c
SET last_funding_date = fr.latest_date
FROM (
  SELECT company_id, MAX(COALESCE(closed_date, announced_date)) AS latest_date
  FROM funding_rounds
  GROUP BY company_id
) fr
WHERE fr.company_id = c.id AND c.last_funding_date IS NULL;

-- months_since_funding
UPDATE companies
SET months_since_funding = EXTRACT(MONTH FROM AGE(CURRENT_DATE, last_funding_date))::INTEGER
WHERE last_funding_date IS NOT NULL;

-- ═══ 4. GENERATE BASELINE MODEL OUTPUTS — Composite risk scores ═════════════
-- Uses the prediction features view to generate initial scores.
-- These are rule-based baselines, not ML — clearly labeled as such.

INSERT INTO model_outputs
  (model_id, model_version, entity_type, entity_id, output_type, metric_name,
   value, confidence_lo, confidence_hi, horizon_date, as_of_date,
   explanation, methodology_note)
SELECT
  (SELECT id FROM models WHERE name = 'survival_hazard' LIMIT 1),
  '0.1-baseline',
  'company',
  'c_' || pf.id::TEXT,
  'composite_score',
  'ecosystem_readiness_score',
  -- Simple composite: (momentum*0.3 + network_density*0.3 + funding_signal*0.2 + team*0.2)
  ROUND((
    COALESCE(pf.momentum, 0) * 0.3 +
    LEAST(pf.total_edges * 3, 100) * 0.3 +
    CASE WHEN pf.funding_m > 100 THEN 90
         WHEN pf.funding_m > 10 THEN 70
         WHEN pf.funding_m > 1 THEN 50
         WHEN pf.funding_m > 0 THEN 30
         ELSE 10 END * 0.2 +
    CASE WHEN pf.founder_prior_exits > 0 THEN 80
         WHEN pf.serial_founders > 0 THEN 60
         WHEN pf.founder_team_size > 1 THEN 40
         ELSE 20 END * 0.2
  )::NUMERIC, 1),
  -- Confidence bands ±15
  GREATEST(0, ROUND((
    COALESCE(pf.momentum, 0) * 0.3 +
    LEAST(pf.total_edges * 3, 100) * 0.3 +
    CASE WHEN pf.funding_m > 100 THEN 90 WHEN pf.funding_m > 10 THEN 70 WHEN pf.funding_m > 1 THEN 50 WHEN pf.funding_m > 0 THEN 30 ELSE 10 END * 0.2 +
    20 * 0.2
  )::NUMERIC - 15, 1)),
  LEAST(100, ROUND((
    COALESCE(pf.momentum, 0) * 0.3 +
    LEAST(pf.total_edges * 3, 100) * 0.3 +
    CASE WHEN pf.funding_m > 100 THEN 90 WHEN pf.funding_m > 10 THEN 70 WHEN pf.funding_m > 1 THEN 50 WHEN pf.funding_m > 0 THEN 30 ELSE 10 END * 0.2 +
    80 * 0.2
  )::NUMERIC + 15, 1)),
  CURRENT_DATE + INTERVAL '12 months',
  CURRENT_DATE,
  jsonb_build_object(
    'momentum_contribution', ROUND(COALESCE(pf.momentum, 0) * 0.3, 1),
    'network_contribution', ROUND(LEAST(pf.total_edges * 3, 100) * 0.3, 1),
    'funding_signal', pf.funding_m,
    'team_signal', pf.founder_team_size,
    'method', 'rule_based_baseline'
  ),
  'Rule-based baseline composite: 30% momentum + 30% network density + 20% funding stage + 20% team quality. NOT ML — for calibration baseline only.'
FROM v_company_prediction_features pf
WHERE pf.outcome_status = 'operating'
ON CONFLICT DO NOTHING;

-- ═══ 5. GENERATE RISK RANKINGS ══════════════════════════════════════════════

INSERT INTO model_outputs
  (model_id, model_version, entity_type, entity_id, output_type, metric_name,
   value, horizon_date, as_of_date, explanation, methodology_note)
SELECT
  (SELECT id FROM models WHERE name = 'survival_hazard' LIMIT 1),
  '0.1-baseline',
  'company',
  'c_' || pf.id::TEXT,
  'risk_score',
  'baseline_risk',
  -- Risk = inverse of readiness, weighted by vulnerability
  ROUND((
    100 - COALESCE(pf.momentum, 50) * 0.4
    - LEAST(pf.total_edges * 5, 100) * 0.3
    - CASE WHEN pf.funding_m > 50 THEN 30 WHEN pf.funding_m > 5 THEN 20 WHEN pf.funding_m > 0 THEN 10 ELSE 0 END
  )::NUMERIC, 1),
  CURRENT_DATE + INTERVAL '12 months',
  CURRENT_DATE,
  jsonb_build_object(
    'momentum_risk', 100 - COALESCE(pf.momentum, 50),
    'isolation_risk', CASE WHEN pf.total_edges < 3 THEN 'HIGH' WHEN pf.total_edges < 8 THEN 'MEDIUM' ELSE 'LOW' END,
    'funding_risk', CASE WHEN pf.funding_m = 0 THEN 'HIGH' WHEN pf.funding_m < 5 THEN 'MEDIUM' ELSE 'LOW' END,
    'method', 'rule_based_baseline'
  ),
  'Rule-based risk baseline: 40% momentum decay risk + 30% isolation risk + 30% funding risk. NOT ML.'
FROM v_company_prediction_features pf
WHERE pf.outcome_status = 'operating'
ON CONFLICT DO NOTHING;

-- ═══ 6. CHECK GAP INTERVENTIONS ═════════════════════════════════════════════
-- Verify T-GNN report gaps are present
SELECT 'gap_interventions_tgnn' AS chk,
       COUNT(*) AS c
FROM gap_interventions WHERE proposed_by = 'tgnn_report_2026';

-- If zero, they may use different proposed_by
SELECT 'gap_interventions_total' AS chk, COUNT(*) AS c FROM gap_interventions;

-- ═══ VERIFICATION ════════════════════════════════════════════════════════════

SELECT 'node_feature_history' AS tbl, COUNT(*) AS c FROM node_feature_history;
SELECT 'macro_events' AS tbl, COUNT(*) AS c FROM macro_events;
SELECT 'model_outputs' AS tbl, COUNT(*) AS c FROM model_outputs;
SELECT 'companies_with_last_funding' AS tbl, COUNT(*) AS c FROM companies WHERE last_funding_date IS NOT NULL;

-- Model output summary
SELECT output_type, COUNT(*) AS c, ROUND(AVG(value)::NUMERIC, 1) AS avg_score
FROM model_outputs GROUP BY 1 ORDER BY 1;

COMMIT;
