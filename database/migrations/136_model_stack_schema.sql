-- Migration 136: Full analytical model stack schema
-- Adds tables for funding rounds, outcome tracking, causal inference,
-- regional macro data, model outputs, intervention briefs, and explainability.
-- Supports: baseline forecasting, survival models, graph models,
-- causal inference (DiD/synthetic controls/BSTS), scenario simulation.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FUNDING ROUNDS — Discrete funding events with valuation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS funding_rounds (
  id                    SERIAL PRIMARY KEY,
  company_id            INTEGER NOT NULL REFERENCES companies(id),
  round_type            VARCHAR(30) NOT NULL
    CHECK (round_type IN (
      'pre_seed','seed','series_a','series_b','series_c','series_d_plus',
      'growth','bridge','convertible_note','grant','debt','ipo','secondary','unknown'
    )),
  announced_date        DATE,
  closed_date           DATE,
  raise_amount_m        NUMERIC(12,2),
  post_money_valuation_m NUMERIC(14,2),
  pre_money_valuation_m NUMERIC(14,2),
  lead_investor_id      VARCHAR(80),
  participants          TEXT[],
  round_notes           TEXT,
  source_url            TEXT,
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  source_id             INTEGER,
  agent_id              VARCHAR(60),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fr_company ON funding_rounds(company_id);
CREATE INDEX IF NOT EXISTS idx_fr_date ON funding_rounds(announced_date DESC);
CREATE INDEX IF NOT EXISTS idx_fr_type ON funding_rounds(round_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. OUTCOME EVENTS — Firm-level outcome ground truth
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS outcome_events (
  id                    SERIAL PRIMARY KEY,
  company_id            INTEGER NOT NULL REFERENCES companies(id),
  outcome_type          VARCHAR(30) NOT NULL
    CHECK (outcome_type IN (
      'ipo','acquisition','merger','shutdown','bankruptcy',
      'pivot','downround','still_operating','unknown'
    )),
  outcome_date          DATE,
  outcome_value_m       NUMERIC(14,2),
  acquiring_entity_id   VARCHAR(80),
  notes                 TEXT,
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  source_url            TEXT,
  source_id             INTEGER,
  agent_id              VARCHAR(60),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oe_company ON outcome_events(company_id);
CREATE INDEX IF NOT EXISTS idx_oe_type ON outcome_events(outcome_type);
CREATE INDEX IF NOT EXISTS idx_oe_date ON outcome_events(outcome_date DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TREATMENT ASSIGNMENTS — Causal inference treatment tracking
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treatment_assignments (
  id                    SERIAL PRIMARY KEY,
  company_id            INTEGER NOT NULL REFERENCES companies(id),
  program_id            INTEGER REFERENCES programs(id),
  treatment_type        VARCHAR(30) NOT NULL
    CHECK (treatment_type IN (
      'accelerator','grant','tax_credit','loan','equity_investment',
      'mentorship','incubator','procurement','co_investment','other'
    )),
  assignment_date       DATE,
  completion_date       DATE,
  cohort_name           VARCHAR(100),
  dosage_value          NUMERIC(10,2),
  dosage_unit           VARCHAR(30),
  control_flag          BOOLEAN NOT NULL DEFAULT FALSE,
  propensity_score      FLOAT,
  matching_quality      FLOAT,
  source_url            TEXT,
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  agent_id              VARCHAR(60),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, program_id, assignment_date)
);

CREATE INDEX IF NOT EXISTS idx_ta_company ON treatment_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_ta_program ON treatment_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_ta_type ON treatment_assignments(treatment_type);
CREATE INDEX IF NOT EXISTS idx_ta_date ON treatment_assignments(assignment_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. REGIONAL INDICATORS — BLS/Census/Fed macro data
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS regional_indicators (
  id                    SERIAL PRIMARY KEY,
  region_id             INTEGER REFERENCES regions(id),
  state_code            VARCHAR(2),
  indicator_name        VARCHAR(80) NOT NULL
    CHECK (indicator_name IN (
      'unemployment_rate','avg_weekly_wage','labor_force_size',
      'labor_force_participation','wage_growth_yoy',
      'patent_grants','patent_applications',
      'university_rd_m','stem_graduates',
      'cpi_index','housing_price_index','median_home_price_k',
      'population','population_growth_yoy',
      'gdp_m','gdp_growth_yoy',
      'startup_density','venture_deployed_m',
      'business_formations','business_closures',
      'fed_funds_rate','prime_rate'
    )),
  indicator_value       NUMERIC(14,4),
  unit                  VARCHAR(20),
  period_date           DATE NOT NULL,
  granularity           VARCHAR(10) DEFAULT 'month'
    CHECK (granularity IN ('day','week','month','quarter','year')),
  source_url            TEXT,
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(region_id, state_code, indicator_name, period_date)
);

CREATE INDEX IF NOT EXISTS idx_ri_region ON regional_indicators(region_id);
CREATE INDEX IF NOT EXISTS idx_ri_indicator ON regional_indicators(indicator_name, period_date DESC);
CREATE INDEX IF NOT EXISTS idx_ri_state ON regional_indicators(state_code, indicator_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. MODEL OUTPUTS — Structured forecasts from all model types
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS model_outputs (
  id                    BIGSERIAL PRIMARY KEY,
  model_id              INTEGER REFERENCES models(id),
  model_version         VARCHAR(20),
  entity_type           VARCHAR(30) NOT NULL,
  entity_id             VARCHAR(80) NOT NULL,
  output_type           VARCHAR(40) NOT NULL
    CHECK (output_type IN (
      'forecast','risk_score','opportunity_score',
      'survival_probability','hazard_rate',
      'intervention_recommendation','causal_estimate',
      'network_effect','spillover_score',
      'scenario_projection','anomaly_flag',
      'composite_score','ranking'
    )),
  metric_name           VARCHAR(80),
  value                 NUMERIC(14,4),
  confidence_lo         NUMERIC(14,4),
  confidence_hi         NUMERIC(14,4),
  horizon_date          DATE,
  as_of_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  explanation           JSONB,
  methodology_note      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mo_entity ON model_outputs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_mo_model ON model_outputs(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mo_type ON model_outputs(output_type);
CREATE INDEX IF NOT EXISTS idx_mo_horizon ON model_outputs(horizon_date);
CREATE INDEX IF NOT EXISTS idx_mo_expires ON model_outputs(expires_at)
  WHERE expires_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. INTERVENTION BRIEFS — Decision-ready policy recommendations
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS intervention_briefs (
  id                    SERIAL PRIMARY KEY,
  gap_intervention_id   INTEGER REFERENCES gap_interventions(id),
  model_output_id       BIGINT REFERENCES model_outputs(id),
  brief_type            VARCHAR(30) NOT NULL
    CHECK (brief_type IN (
      'policy_gap','opportunity','risk_alert',
      'scenario_result','program_evaluation','regional_assessment'
    )),
  target_agency         VARCHAR(100),
  target_stakeholder_type VARCHAR(30),
  title                 VARCHAR(200) NOT NULL,
  summary               TEXT NOT NULL,
  methodology_note      TEXT,
  recommended_actions   JSONB,
  scenario_bands        JSONB,
  confidence            FLOAT CHECK (confidence BETWEEN 0 AND 1),
  status                VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived','superseded')),
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ib_gap ON intervention_briefs(gap_intervention_id);
CREATE INDEX IF NOT EXISTS idx_ib_type ON intervention_briefs(brief_type);
CREATE INDEX IF NOT EXISTS idx_ib_agency ON intervention_briefs(target_agency);
CREATE INDEX IF NOT EXISTS idx_ib_status ON intervention_briefs(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. CAUSAL ESTIMATES — Treatment effect results
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS causal_estimates (
  id                    SERIAL PRIMARY KEY,
  treatment_assignment_id INTEGER REFERENCES treatment_assignments(id),
  model_id              INTEGER REFERENCES models(id),
  estimator_type        VARCHAR(30) NOT NULL
    CHECK (estimator_type IN (
      'did','synthetic_control','bsts','iv','matching',
      'regression_discontinuity','propensity_weighting','meta_learner'
    )),
  outcome_metric        VARCHAR(80) NOT NULL,
  ate                   NUMERIC(14,4),
  att                   NUMERIC(14,4),
  confidence_lo         NUMERIC(14,4),
  confidence_hi         NUMERIC(14,4),
  p_value               FLOAT,
  pre_period_start      DATE,
  pre_period_end        DATE,
  post_period_start     DATE,
  post_period_end       DATE,
  parallel_trends_pvalue FLOAT,
  placebo_test_passed   BOOLEAN,
  n_treated             INTEGER,
  n_control             INTEGER,
  methodology_note      TEXT,
  diagnostics           JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ce_treatment ON causal_estimates(treatment_assignment_id);
CREATE INDEX IF NOT EXISTS idx_ce_estimator ON causal_estimates(estimator_type);
CREATE INDEX IF NOT EXISTS idx_ce_outcome ON causal_estimates(outcome_metric);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. FEATURE IMPORTANCE — Model explainability storage
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS feature_importance (
  id                    BIGSERIAL PRIMARY KEY,
  model_output_id       BIGINT REFERENCES model_outputs(id) ON DELETE CASCADE,
  feature_name          VARCHAR(100) NOT NULL,
  importance_value      FLOAT NOT NULL,
  direction             VARCHAR(10) CHECK (direction IN ('positive','negative','mixed')),
  method                VARCHAR(20) NOT NULL
    CHECK (method IN ('shap','permutation','lime','integrated_gradients','attention','built_in')),
  rank                  INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fi_output ON feature_importance(model_output_id);
CREATE INDEX IF NOT EXISTS idx_fi_feature ON feature_importance(feature_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. COLUMN ADDITIONS TO EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Companies: latest round tracking and outcome status
ALTER TABLE companies ADD COLUMN IF NOT EXISTS latest_round_type VARCHAR(30);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS latest_round_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS runway_months INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS outcome_status VARCHAR(20) DEFAULT 'operating'
  CHECK (outcome_status IN ('operating','acquired','ipo','shutdown','pivot','unknown'));

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. ANALYTICAL VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Survival cohorts: companies grouped by founding year for survival analysis
CREATE OR REPLACE VIEW v_survival_cohorts AS
SELECT
  c.founded AS cohort_year,
  c.stage,
  c.location_class,
  COUNT(*) AS cohort_size,
  COUNT(oe.id) FILTER (WHERE oe.outcome_type IN ('acquisition','ipo')) AS positive_exits,
  COUNT(oe.id) FILTER (WHERE oe.outcome_type IN ('shutdown','bankruptcy')) AS failures,
  COUNT(*) - COUNT(oe.id) AS still_operating,
  ROUND(AVG(c.funding_m), 1) AS avg_funding_m,
  ROUND(AVG(EXTRACT(YEAR FROM AGE(
    COALESCE(oe.outcome_date, CURRENT_DATE),
    MAKE_DATE(COALESCE(c.founded, 2020), 1, 1)
  )))::NUMERIC, 1) AS avg_lifespan_years
FROM companies c
LEFT JOIN outcome_events oe ON oe.company_id = c.id
WHERE c.founded IS NOT NULL
GROUP BY c.founded, c.stage, c.location_class
ORDER BY c.founded DESC, c.stage;

-- Treatment effects: joined treatments + outcomes for causal inference
CREATE OR REPLACE VIEW v_treatment_effects AS
SELECT
  ta.id AS treatment_id,
  ta.company_id,
  c.name AS company_name,
  c.stage,
  c.funding_m,
  ta.treatment_type,
  ta.cohort_name,
  ta.assignment_date,
  ta.dosage_value,
  ta.dosage_unit,
  oe.outcome_type,
  oe.outcome_date,
  oe.outcome_value_m,
  (COALESCE(oe.outcome_date, CURRENT_DATE) - ta.assignment_date) AS days_to_outcome,
  ce.estimator_type,
  ce.ate,
  ce.att,
  ce.confidence_lo,
  ce.confidence_hi,
  ce.p_value
FROM treatment_assignments ta
JOIN companies c ON c.id = ta.company_id
LEFT JOIN outcome_events oe ON oe.company_id = ta.company_id
LEFT JOIN causal_estimates ce ON ce.treatment_assignment_id = ta.id
ORDER BY ta.assignment_date DESC;

-- Model leaderboard: latest outputs ranked by entity
CREATE OR REPLACE VIEW v_model_leaderboard AS
SELECT
  mo.entity_type,
  mo.entity_id,
  er.label AS entity_name,
  mo.output_type,
  mo.metric_name,
  mo.value,
  mo.confidence_lo,
  mo.confidence_hi,
  mo.horizon_date,
  mo.as_of_date,
  m.name AS model_name,
  mo.methodology_note,
  mo.explanation
FROM model_outputs mo
JOIN models m ON m.id = mo.model_id
LEFT JOIN entity_registry er ON er.canonical_id = mo.entity_id
WHERE mo.expires_at IS NULL OR mo.expires_at > NOW()
ORDER BY mo.as_of_date DESC, mo.output_type, mo.value DESC;

-- Intervention dashboard: briefs + gaps + causal evidence for stakeholders
CREATE OR REPLACE VIEW v_intervention_dashboard AS
SELECT
  ib.id AS brief_id,
  ib.title,
  ib.brief_type,
  ib.target_agency,
  ib.target_stakeholder_type,
  ib.summary,
  ib.confidence,
  ib.scenario_bands,
  ib.recommended_actions,
  ib.status,
  gi.gap_name,
  gi.severity,
  gi.sector_pair,
  mo.output_type AS model_output_type,
  mo.value AS model_score,
  mo.confidence_lo,
  mo.confidence_hi,
  mo.explanation AS model_explanation
FROM intervention_briefs ib
LEFT JOIN gap_interventions gi ON gi.id = ib.gap_intervention_id
LEFT JOIN model_outputs mo ON mo.id = ib.model_output_id
WHERE ib.status IN ('draft', 'published')
ORDER BY gi.severity ASC, ib.confidence DESC;

COMMIT;
