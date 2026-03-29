-- Seed the models table so API endpoints return model metadata
-- even before agents have run for the first time.
-- Agents will upsert (ON CONFLICT ... DO UPDATE) when they run.

INSERT INTO models (name, objective, input_variables, output_variables, version, is_active)
VALUES
  (
    'panel_forecaster_v1',
    'Quarterly company metric forecasts with confidence intervals',
    '["funding_m", "employees", "momentum"]'::jsonb,
    '["funding_m_forecast", "employees_forecast", "momentum_forecast"]'::jsonb,
    '1.0.0',
    TRUE
  ),
  (
    'survival_analyzer_v1',
    'Company survival analysis: time-to-milestone and hazard ratios',
    '["stage", "funding_m", "employees", "sectors", "region", "accelerator_participation", "founded"]'::jsonb,
    '["survival_probability", "hazard_ratio", "median_survival_quarters"]'::jsonb,
    '1.0.0',
    TRUE
  ),
  (
    'causal_evaluator_v1',
    'Causal impact estimation for accelerator programs, SSBCI funding, and network spillovers',
    '["stage", "funding_m", "employees", "momentum", "accelerator_participation", "ssbci_funded", "graph_pagerank", "graph_betweenness"]'::jsonb,
    '["accelerator_att", "ssbci_att", "spillover_coefficients"]'::jsonb,
    '1.0.0',
    TRUE
  ),
  (
    'scenario_simulator_v1',
    'Monte Carlo what-if simulation for ecosystem interventions',
    '["funding_m", "employees", "momentum", "irs_score", "stage", "region"]'::jsonb,
    '["funding_m_forecast", "employees_forecast", "momentum_forecast"]'::jsonb,
    '1.0.0',
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  objective = EXCLUDED.objective,
  input_variables = EXCLUDED.input_variables,
  output_variables = EXCLUDED.output_variables,
  updated_at = NOW();
