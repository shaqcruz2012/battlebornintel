-- Migration 144: Close feature engineering gaps for predictive model stack
-- Adds: macro events, temporal node snapshots, founder features, customer edges,
-- and network simulation support tables.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. MACRO EVENTS — Shock/scenario event ontology
-- Answers: "What if a recession hits?" "What if interest rates rise 200bps?"
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS macro_events (
  id              SERIAL PRIMARY KEY,
  event_name      VARCHAR(200) NOT NULL,
  event_type      VARCHAR(40) NOT NULL
    CHECK (event_type IN (
      'recession','rate_change','policy_change','ipo_wave','ipo_bust',
      'sector_shock','regulatory_change','natural_disaster','pandemic',
      'trade_war','tech_bubble','tech_bust','layoff_wave','funding_freeze',
      'tax_change','election','geopolitical','supply_chain','other'
    )),
  severity        VARCHAR(10) CHECK (severity IN ('low','medium','high','critical')),
  event_date      DATE NOT NULL,
  duration_months INTEGER,
  affected_sectors TEXT[],
  affected_regions TEXT[],
  description     TEXT,
  economic_impact_m NUMERIC(14,2),
  source_url      TEXT,
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_me_type ON macro_events(event_type);
CREATE INDEX IF NOT EXISTS idx_me_date ON macro_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_me_sectors ON macro_events USING GIN(affected_sectors);

-- Link macro events to company impacts
CREATE TABLE IF NOT EXISTS macro_event_impacts (
  id              SERIAL PRIMARY KEY,
  macro_event_id  INTEGER NOT NULL REFERENCES macro_events(id),
  entity_id       VARCHAR(80) NOT NULL,
  impact_type     VARCHAR(30) NOT NULL
    CHECK (impact_type IN (
      'revenue_decline','funding_freeze','layoffs','shutdown',
      'growth_acceleration','funding_boost','hiring_surge',
      'pivot','market_exit','market_entry','neutral'
    )),
  impact_magnitude FLOAT,
  lag_months      INTEGER,
  notes           TEXT,
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mei_event ON macro_event_impacts(macro_event_id);
CREATE INDEX IF NOT EXISTS idx_mei_entity ON macro_event_impacts(entity_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TEMPORAL NODE FEATURE SNAPSHOTS — Reconstruct features at any time
-- Answers: "What did this company look like 6 months before it got funded?"
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS node_feature_history (
  id              BIGSERIAL PRIMARY KEY,
  canonical_id    VARCHAR(80) NOT NULL,
  snapshot_date   DATE NOT NULL,
  feature_vector  FLOAT[] NOT NULL,
  feature_names   TEXT[] NOT NULL,
  -- Denormalized key features for fast queries without vector parsing
  funding_m       NUMERIC(12,2),
  employees       INTEGER,
  momentum        INTEGER,
  stage           VARCHAR(20),
  pagerank        FLOAT,
  betweenness     FLOAT,
  community_id    INTEGER,
  degree          INTEGER,
  source          VARCHAR(30) DEFAULT 'computed',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(canonical_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_nfh_entity ON node_feature_history(canonical_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_nfh_date ON node_feature_history(snapshot_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FOUNDER FEATURES — Team quality prediction features
-- Answers: "Companies with serial founders exit 3x more often"
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE people ADD COLUMN IF NOT EXISTS education VARCHAR(200);
ALTER TABLE people ADD COLUMN IF NOT EXISTS prior_exits INTEGER DEFAULT 0;
ALTER TABLE people ADD COLUMN IF NOT EXISTS prior_companies INTEGER DEFAULT 0;
ALTER TABLE people ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_technical BOOLEAN;
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_serial_founder BOOLEAN DEFAULT FALSE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS founder_score FLOAT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS bio TEXT;

-- Team quality aggregation per company
CREATE OR REPLACE VIEW v_team_quality AS
SELECT
  p.company_id,
  c.name AS company_name,
  COUNT(*) AS team_size,
  SUM(p.prior_exits) AS total_prior_exits,
  MAX(p.prior_exits) AS max_prior_exits,
  AVG(p.years_experience) AS avg_experience_years,
  COUNT(*) FILTER (WHERE p.is_serial_founder) AS serial_founders,
  COUNT(*) FILTER (WHERE p.is_technical) AS technical_founders,
  MAX(p.founder_score) AS top_founder_score,
  BOOL_OR(p.is_angel) AS has_angel_investor_founder
FROM people p
JOIN companies c ON c.id = p.company_id
WHERE p.role IN ('Founder', 'Co-Founder', 'CEO', 'CTO', 'COO')
GROUP BY p.company_id, c.name;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COMPANY FINANCIAL FEATURES — Cash flow and vulnerability
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE companies ADD COLUMN IF NOT EXISTS monthly_burn_k NUMERIC(10,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS annual_revenue_m NUMERIC(12,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS revenue_growth_yoy FLOAT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gross_margin_pct FLOAT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_funding_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS months_since_funding INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS debt_m NUMERIC(12,2);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CUSTOMER / SUPPLIER EDGES — Business dependency graph
-- Answers: "What if Company X loses its biggest customer?"
-- ═══════════════════════════════════════════════════════════════════════════

-- No new table needed — use graph_edges with new rel types.
-- But we need to ensure the edge type CHECK allows these.
-- graph_edges.rel is VARCHAR with no CHECK, so any value works.
-- Document the new edge types:
COMMENT ON TABLE graph_edges IS
  'Graph edges support these customer/supplier relationship types:
   customer_of — company is a customer of another entity
   supplier_to — company supplies products/services to entity
   depends_on — hard dependency (single-source supplier, key platform)
   competes_with — competitive relationship
   potential_customer — opportunity edge (edge_category=opportunity)';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. SECTOR ELASTICITY — How sensitive are sectors to shocks?
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sector_elasticity (
  id              SERIAL PRIMARY KEY,
  sector_name     VARCHAR(60) NOT NULL,
  shock_type      VARCHAR(40) NOT NULL,
  elasticity      FLOAT NOT NULL,
  lag_quarters    INTEGER DEFAULT 1,
  notes           TEXT,
  source_url      TEXT,
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sector_name, shock_type)
);

-- Seed with estimated sector sensitivities (from economic research)
INSERT INTO sector_elasticity (sector_name, shock_type, elasticity, lag_quarters, notes, confidence)
VALUES
  ('AI', 'rate_change', -0.3, 2, 'AI funding sensitive to rate hikes — VC pullback', 0.7),
  ('AI', 'tech_bust', -0.5, 1, 'AI directly exposed to tech market cycles', 0.7),
  ('AI', 'recession', -0.2, 2, 'Enterprise AI spend resilient but growth slows', 0.6),
  ('CleanTech', 'policy_change', 0.6, 1, 'CleanTech benefits from IRA/tax credits', 0.8),
  ('CleanTech', 'rate_change', -0.4, 2, 'Capital-intensive projects sensitive to rates', 0.7),
  ('Defense', 'recession', 0.1, 1, 'Defense spending counter-cyclical', 0.8),
  ('Defense', 'geopolitical', 0.5, 1, 'Geopolitical tension increases defense spending', 0.8),
  ('HealthTech', 'recession', -0.1, 3, 'Healthcare relatively recession-resistant', 0.7),
  ('HealthTech', 'regulatory_change', -0.3, 2, 'FDA/CMS changes impact medtech', 0.7),
  ('Gaming', 'recession', -0.6, 1, 'Hospitality/gaming highly cyclical', 0.8),
  ('Gaming', 'pandemic', -0.9, 0, 'Pandemic devastates in-person gaming', 0.9),
  ('Fintech', 'rate_change', -0.4, 1, 'Fintech lending margins compress', 0.7),
  ('Fintech', 'regulatory_change', -0.3, 2, 'Banking regulation impacts fintech', 0.7),
  ('SaaS', 'recession', -0.2, 2, 'SaaS revenue resilient but churn increases', 0.7),
  ('Energy', 'policy_change', 0.5, 1, 'Energy policy directly impacts clean energy investment', 0.8),
  ('Manufacturing', 'trade_war', -0.5, 1, 'Manufacturing exposed to tariffs/trade disruption', 0.7),
  ('Manufacturing', 'supply_chain', -0.6, 0, 'Supply chain disruption impacts manufacturing immediately', 0.8),
  ('Mining', 'recession', -0.3, 2, 'Commodity prices drop in recessions', 0.7),
  ('Mining', 'policy_change', 0.3, 1, 'Mining permitting policy changes impact output', 0.7),
  ('Consumer', 'recession', -0.5, 1, 'Consumer spending drops in recessions', 0.8)
ON CONFLICT (sector_name, shock_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. NETWORK SIMULATION SUPPORT — "What if" query infrastructure
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS simulation_runs (
  id              SERIAL PRIMARY KEY,
  simulation_type VARCHAR(40) NOT NULL
    CHECK (simulation_type IN (
      'node_removal','edge_removal','node_addition','edge_addition',
      'funding_injection','shock_propagation','policy_intervention',
      'scenario_comparison'
    )),
  parameters      JSONB NOT NULL,
  baseline_metrics JSONB,
  simulated_metrics JSONB,
  delta_metrics   JSONB,
  affected_nodes  TEXT[],
  affected_edges  INTEGER[],
  narrative       TEXT,
  model_id        INTEGER REFERENCES models(id),
  created_by      VARCHAR(60),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sim_type ON simulation_runs(simulation_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. PREDICTION QUERY INTERFACE — Structured queries for Claude plugin
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prediction_queries (
  id              SERIAL PRIMARY KEY,
  query_text      TEXT NOT NULL,
  query_type      VARCHAR(40) NOT NULL
    CHECK (query_type IN (
      'outcome_prediction','funding_prediction','resilience_analysis',
      'policy_impact','shock_propagation','what_if','comparison',
      'ranking','explanation'
    )),
  entity_ids      TEXT[],
  parameters      JSONB,
  model_outputs_used BIGINT[],
  response        JSONB,
  explanation     TEXT,
  confidence      FLOAT,
  response_time_ms INTEGER,
  user_id         INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pq_type ON prediction_queries(query_type);
CREATE INDEX IF NOT EXISTS idx_pq_date ON prediction_queries(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. ANALYTICAL VIEWS — Prediction-ready data
-- ═══════════════════════════════════════════════════════════════════════════

-- Company prediction features — flattened view for ML
CREATE OR REPLACE VIEW v_company_prediction_features AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.stage,
  c.funding_m,
  c.momentum,
  c.employees,
  c.founded,
  c.location_class,
  c.outcome_status,
  c.confidence,
  c.annual_revenue_m,
  c.revenue_growth_yoy,
  c.monthly_burn_k,
  c.runway_months,
  c.gross_margin_pct,
  c.debt_m,
  c.last_funding_date,
  c.months_since_funding,
  -- Computed age
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAKE_DATE(COALESCE(c.founded, 2020), 1, 1)))::INTEGER AS company_age_years,
  -- Network features
  gmc.pagerank,
  gmc.betweenness,
  gmc.community_id,
  -- Edge counts
  COALESCE(ec.total_edges, 0) AS total_edges,
  COALESCE(ec.investor_edges, 0) AS investor_edges,
  COALESCE(ec.accel_edges, 0) AS accelerator_edges,
  COALESCE(ec.partner_edges, 0) AS partner_edges,
  -- Team quality
  COALESCE(tq.team_size, 0) AS founder_team_size,
  COALESCE(tq.total_prior_exits, 0) AS founder_prior_exits,
  COALESCE(tq.serial_founders, 0) AS serial_founders,
  COALESCE(tq.avg_experience_years, 0) AS avg_founder_experience,
  -- Outcome label
  oe.outcome_type,
  oe.outcome_date,
  oe.outcome_value_m,
  -- Treatment history
  COUNT(DISTINCT ta.id) AS treatment_count,
  ARRAY_AGG(DISTINCT ta.treatment_type) FILTER (WHERE ta.id IS NOT NULL) AS treatment_types
FROM companies c
LEFT JOIN graph_metrics_cache gmc ON gmc.node_id = 'c_' || c.id::TEXT
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_edges,
    SUM(CASE WHEN rel IN ('invested_in','funded','funded_by') THEN 1 ELSE 0 END) AS investor_edges,
    SUM(CASE WHEN rel IN ('accelerated_by','won_pitch') THEN 1 ELSE 0 END) AS accel_edges,
    SUM(CASE WHEN rel IN ('partners_with','partnered_with') THEN 1 ELSE 0 END) AS partner_edges
  FROM graph_edges ge
  WHERE ge.source_id = 'c_' || c.id::TEXT OR ge.target_id = 'c_' || c.id::TEXT
) ec ON TRUE
LEFT JOIN v_team_quality tq ON tq.company_id = c.id
LEFT JOIN outcome_events oe ON oe.company_id = c.id
LEFT JOIN treatment_assignments ta ON ta.company_id = c.id
GROUP BY c.id, c.slug, c.name, c.stage, c.funding_m, c.momentum, c.employees,
         c.founded, c.location_class, c.outcome_status, c.confidence,
         c.annual_revenue_m, c.revenue_growth_yoy, c.monthly_burn_k,
         c.runway_months, c.gross_margin_pct, c.debt_m,
         c.last_funding_date, c.months_since_funding,
         gmc.pagerank, gmc.betweenness, gmc.community_id,
         ec.total_edges, ec.investor_edges, ec.accel_edges, ec.partner_edges,
         tq.team_size, tq.total_prior_exits, tq.serial_founders, tq.avg_experience_years,
         oe.outcome_type, oe.outcome_date, oe.outcome_value_m;

-- Shock exposure view — per-company sensitivity to macro events
CREATE OR REPLACE VIEW v_shock_exposure AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  c.sectors,
  se.shock_type,
  AVG(se.elasticity) AS avg_sector_elasticity,
  MAX(ABS(se.elasticity)) AS max_exposure,
  ARRAY_AGG(DISTINCT se.sector_name) AS exposed_sectors
FROM companies c
CROSS JOIN LATERAL unnest(c.sectors) AS s(sec_name)
JOIN sector_elasticity se ON se.sector_name = s.sec_name
GROUP BY c.id, c.name, c.sectors, se.shock_type;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'macro_events' AS tbl, COUNT(*) AS c FROM macro_events;
SELECT 'sector_elasticity' AS tbl, COUNT(*) AS c FROM sector_elasticity;
SELECT 'v_company_prediction_features' AS tbl, COUNT(*) AS c FROM v_company_prediction_features;
SELECT 'v_shock_exposure' AS tbl, COUNT(*) AS c FROM v_shock_exposure;
SELECT 'new_people_columns' AS tbl, COUNT(*) AS c FROM information_schema.columns WHERE table_name = 'people' AND column_name IN ('education','prior_exits','is_serial_founder','founder_score');
SELECT 'new_company_columns' AS tbl, COUNT(*) AS c FROM information_schema.columns WHERE table_name = 'companies' AND column_name IN ('monthly_burn_k','annual_revenue_m','revenue_growth_yoy','debt_m');

COMMIT;
