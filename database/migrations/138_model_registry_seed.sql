-- Migration 138: Seed model registry with 5 model types
-- These define the analytical model stack. No fabricated data —
-- only model definitions with input/output variable schemas.

BEGIN;

INSERT INTO models (name, objective, input_variables, output_variables, version, is_active)
VALUES
  (
    'hierarchical_timeseries',
    'Baseline forecasting of ecosystem metrics using hierarchical time-series and Bayesian panel models. Produces forward-looking scores for firms, sectors, and regions.',
    '{
      "entity_features": ["funding_m", "employees", "momentum", "stage", "sector", "region"],
      "temporal_features": ["metric_snapshots series", "funding_rounds history", "event_frequency"],
      "hierarchical_levels": ["company", "sector", "region", "state"],
      "exogenous": ["regional_indicators", "fed_funds_rate", "sector_heat"]
    }'::JSONB,
    '{
      "forecasts": ["funding_m_next_12m", "employee_growth_rate", "momentum_trajectory"],
      "confidence_intervals": ["80pct", "95pct"],
      "decomposition": ["trend", "seasonal", "hierarchical_reconciliation"]
    }'::JSONB,
    '1.0',
    TRUE
  ),
  (
    'survival_hazard',
    'Survival and hazard models for firm longevity, milestone progression (stage advancement), and time-to-event analysis. Cox PH and Weibull parameterizations.',
    '{
      "company_features": ["age_years", "stage", "funding_m", "employees", "sector", "location_class"],
      "network_features": ["pagerank", "betweenness", "community_id", "accelerator_connected", "investor_count"],
      "treatment_features": ["treatment_type", "dosage_value", "time_since_treatment"],
      "outcome_events": ["ipo", "acquisition", "shutdown", "stage_change"]
    }'::JSONB,
    '{
      "survival_probability": "P(alive at t | features)",
      "hazard_rate": "instantaneous failure rate at t",
      "milestone_probability": "P(next stage within 12m)",
      "median_survival": "expected time to event",
      "risk_factors": "top contributing features with SHAP values"
    }'::JSONB,
    '1.0',
    TRUE
  ),
  (
    'tgnn_network_effects',
    'Temporal graph neural network for network effects, spillover estimation, and link prediction. Captures how ecosystem connectivity influences firm outcomes.',
    '{
      "node_features": "64-dim vector (company, network, regional, policy features)",
      "edge_features": "16-dim vector (impact_type, confidence, weight, temporal)",
      "interaction_stream": "mv_interaction_stream (creation, persistence, dissolution, state_change)",
      "graph_structure": "adjacency with temporal validity windows"
    }'::JSONB,
    '{
      "link_predictions": "P(edge forms between A and B in next period)",
      "spillover_scores": "estimated effect of neighbor activity on focal node",
      "network_effect_magnitude": "marginal value of one additional connection",
      "community_evolution": "predicted community membership changes",
      "embedding_vectors": "learned node representations for downstream tasks"
    }'::JSONB,
    '1.0',
    TRUE
  ),
  (
    'causal_policy_evaluation',
    'Causal inference for policy evaluation using DiD, synthetic controls, BSTS, and matching estimators. Evaluates impact of accelerator programs, SSBCI investments, grants, and tax incentives.',
    '{
      "treatment_assignments": "program_id, assignment_date, dosage, cohort",
      "outcome_metrics": ["funding_m", "employees", "momentum", "stage_change", "survival"],
      "covariates": ["pre_treatment_trends", "sector", "region", "company_age", "network_features"],
      "instrument_candidates": ["program_capacity_shocks", "policy_timing", "geographic_discontinuities"]
    }'::JSONB,
    '{
      "ate": "average treatment effect",
      "att": "average treatment effect on treated",
      "confidence_intervals": "95pct bounds",
      "parallel_trends_test": "pre-treatment trend equivalence p-value",
      "placebo_tests": "falsification check results",
      "heterogeneous_effects": "CATE by sector, region, stage",
      "dose_response": "effect curve by treatment intensity"
    }'::JSONB,
    '1.0',
    TRUE
  ),
  (
    'scenario_simulator',
    'What-if scenario simulation for intervention planning. Combines baseline forecasts with causal estimates to project counterfactual outcomes under different policy assumptions.',
    '{
      "baseline_forecasts": "from hierarchical_timeseries model",
      "causal_estimates": "from causal_policy_evaluation model",
      "scenario_assumptions": "JSONB: intervention_type, scale, timing, target_population",
      "macro_scenarios": "optimistic, base, pessimistic economic conditions",
      "network_scenarios": "node addition/removal, edge creation simulations"
    }'::JSONB,
    '{
      "scenario_projections": "metric trajectories under each scenario",
      "scenario_bands": "optimistic, base, pessimistic bounds",
      "intervention_briefs": "structured recommendations per gap_intervention",
      "roi_estimates": "expected return per dollar of public investment",
      "sensitivity_analysis": "which assumptions drive the largest variance"
    }'::JSONB,
    '1.0',
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  objective = EXCLUDED.objective,
  input_variables = EXCLUDED.input_variables,
  output_variables = EXCLUDED.output_variables,
  version = EXCLUDED.version,
  is_active = EXCLUDED.is_active;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT name, version, is_active FROM models ORDER BY id;

COMMIT;
