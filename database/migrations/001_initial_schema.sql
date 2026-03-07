-- BBI Initial Schema
-- Run: psql -U bbi -d battlebornintel -f database/migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS companies (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(40) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  stage         VARCHAR(20) NOT NULL,
  sectors       TEXT[] NOT NULL DEFAULT '{}',
  city          VARCHAR(60) NOT NULL,
  region        VARCHAR(20) NOT NULL,
  funding_m     NUMERIC(10,2) NOT NULL DEFAULT 0,
  momentum      INTEGER NOT NULL DEFAULT 0 CHECK (momentum BETWEEN 0 AND 100),
  employees     INTEGER NOT NULL DEFAULT 0,
  founded       INTEGER,
  description   TEXT,
  eligible      TEXT[] NOT NULL DEFAULT '{}',
  lat           NUMERIC(8,5),
  lng           NUMERIC(9,5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funds (
  id            VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  fund_type     VARCHAR(30) NOT NULL,
  allocated_m   NUMERIC(10,2),
  deployed_m    NUMERIC(10,2) NOT NULL DEFAULT 0,
  leverage      NUMERIC(5,2),
  company_count INTEGER NOT NULL DEFAULT 0,
  thesis        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS graph_edges (
  id            SERIAL PRIMARY KEY,
  source_id     VARCHAR(40) NOT NULL,
  target_id     VARCHAR(40) NOT NULL,
  rel           VARCHAR(30) NOT NULL,
  note          TEXT,
  event_year    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_edges_source ON graph_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON graph_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_rel ON graph_edges(rel);

CREATE TABLE IF NOT EXISTS people (
  id            VARCHAR(30) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(60),
  company_id    INTEGER REFERENCES companies(id),
  note          TEXT
);

CREATE TABLE IF NOT EXISTS externals (
  id            VARCHAR(40) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(30) NOT NULL,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS accelerators (
  id            VARCHAR(30) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  accel_type    VARCHAR(40) NOT NULL,
  city          VARCHAR(60),
  region        VARCHAR(20),
  founded       INTEGER,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS ecosystem_orgs (
  id            VARCHAR(30) PRIMARY KEY,
  name          VARCHAR(60) NOT NULL,
  entity_type   VARCHAR(40) NOT NULL,
  city          VARCHAR(60),
  region        VARCHAR(20),
  note          TEXT
);

CREATE TABLE IF NOT EXISTS graph_funds (
  id            VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  fund_type     VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL REFERENCES companies(id),
  exchange      VARCHAR(20) NOT NULL,
  ticker        VARCHAR(10) NOT NULL,
  UNIQUE(company_id, exchange)
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id            SERIAL PRIMARY KEY,
  event_date    DATE NOT NULL,
  event_type    VARCHAR(20) NOT NULL,
  company_name  VARCHAR(100) NOT NULL,
  detail        TEXT NOT NULL,
  icon          VARCHAR(20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(event_date DESC);

CREATE TABLE IF NOT EXISTS constants (
  key           VARCHAR(40) PRIMARY KEY,
  value         JSONB NOT NULL,
  description   TEXT
);

-- Agent tables
CREATE TABLE IF NOT EXISTS agent_runs (
  id            SERIAL PRIMARY KEY,
  agent_name    VARCHAR(60) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'running',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  input_params  JSONB,
  output_summary TEXT,
  error_message TEXT,
  records_affected INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_name ON agent_runs(agent_name);

CREATE TABLE IF NOT EXISTS analysis_results (
  id            SERIAL PRIMARY KEY,
  analysis_type VARCHAR(40) NOT NULL,
  entity_type   VARCHAR(20),
  entity_id     VARCHAR(40),
  content       JSONB NOT NULL,
  model_used    VARCHAR(40),
  agent_run_id  INTEGER REFERENCES agent_runs(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_analysis_entity ON analysis_results(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_results(analysis_type);

CREATE TABLE IF NOT EXISTS computed_scores (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL REFERENCES companies(id),
  irs_score     INTEGER,
  grade         VARCHAR(3),
  triggers      TEXT[],
  dims          JSONB,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scores_company ON computed_scores(company_id);

CREATE TABLE IF NOT EXISTS graph_metrics_cache (
  id            SERIAL PRIMARY KEY,
  node_id       VARCHAR(40) NOT NULL,
  pagerank      INTEGER,
  betweenness   INTEGER,
  community_id  INTEGER,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_graph_metrics_node ON graph_metrics_cache(node_id);
