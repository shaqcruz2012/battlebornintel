-- Migration 005: Metric Snapshots, Scenarios, and Scenario Results
-- Phase 4 — Entirely new tables. No existing objects modified.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/005_metrics_and_scenarios.sql

-- ============================================================
-- METRIC SNAPSHOTS
-- Time-series store for any quantitative metric on any entity.
-- entity_type + entity_id are a polymorphic reference using the
-- same id-prefix convention already used by graph_edges:
--   'company'      -> companies.id       (integer)
--   'vc_firm'      -> vc_firms.id
--   'ssbci_fund'   -> ssbci_funds.id
--   'fund'         -> funds.id (varchar — stored as text)
--   'corporation'  -> corporations.id
--   'university'   -> universities.id
--   'gov_agency'   -> gov_agencies.id
--   'region'       -> regions.id
--   'sector'       -> sectors.id
-- ============================================================
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  entity_type   VARCHAR(30) NOT NULL,
  entity_id     VARCHAR(40) NOT NULL,   -- supports both int and varchar PKs
  metric_name   VARCHAR(80) NOT NULL,
  value         NUMERIC(18,4) NOT NULL,
  unit          VARCHAR(20),            -- 'usd_millions', 'count', 'ratio', 'percent'
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  granularity   VARCHAR(10) NOT NULL DEFAULT 'quarter'
                  CHECK (granularity IN ('day', 'month', 'quarter', 'year')),
  -- provenance
  source_id     INTEGER REFERENCES sources(id),
  agent_id      VARCHAR(60),
  confidence    FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate snapshots for the same metric/period
  UNIQUE (entity_type, entity_id, metric_name, period_start, period_end)
);

-- Primary lookup pattern: all metrics for an entity
CREATE INDEX IF NOT EXISTS idx_metric_entity
  ON metric_snapshots(entity_type, entity_id, metric_name, period_start DESC);

-- Reverse lookup: all entities with a given metric
CREATE INDEX IF NOT EXISTS idx_metric_name_period
  ON metric_snapshots(metric_name, period_start DESC);

-- Partial index: unverified records need review
CREATE INDEX IF NOT EXISTS idx_metric_unverified
  ON metric_snapshots(id) WHERE verified = FALSE;

-- ============================================================
-- SCENARIOS
-- A named set of assumptions used to generate predictions.
-- model_id links to the models table seeded in migration 002.
-- created_by links to a people.id (text PK).
-- ============================================================
CREATE TABLE IF NOT EXISTS scenarios (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  base_period   DATE NOT NULL,           -- the "as of" date for baseline inputs
  model_id      INTEGER REFERENCES models(id),
  -- snapshot of the assumptions used (full JSONB for reproducibility)
  assumptions   JSONB NOT NULL DEFAULT '{}',
  -- status lifecycle
  status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'running', 'complete', 'archived')),
  created_by    VARCHAR(60),           -- agent_id or user identifier (no FK: people table is entity-only)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scenarios_model   ON scenarios(model_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_status  ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_base    ON scenarios(base_period DESC);

-- ============================================================
-- SCENARIO RESULTS
-- Predicted metric values produced by running a scenario model.
-- Uses the same polymorphic entity_type/entity_id pattern as
-- metric_snapshots so results and actuals are trivially joined.
-- ============================================================
CREATE TABLE IF NOT EXISTS scenario_results (
  id            BIGSERIAL PRIMARY KEY,
  scenario_id   INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  entity_type   VARCHAR(30) NOT NULL,
  entity_id     VARCHAR(40) NOT NULL,
  metric_name   VARCHAR(80) NOT NULL,
  value         NUMERIC(18,4) NOT NULL,
  unit          VARCHAR(20),
  period        DATE NOT NULL,           -- the future date being predicted
  confidence_lo NUMERIC(18,4),           -- lower bound of confidence interval
  confidence_hi NUMERIC(18,4),           -- upper bound of confidence interval
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (scenario_id, entity_type, entity_id, metric_name, period)
);

-- Primary query: all results for a scenario
CREATE INDEX IF NOT EXISTS idx_scenario_results_scenario
  ON scenario_results(scenario_id, entity_type, entity_id, metric_name);

-- Cross-scenario comparison for a specific entity+metric
CREATE INDEX IF NOT EXISTS idx_scenario_results_entity
  ON scenario_results(entity_type, entity_id, metric_name, period);
