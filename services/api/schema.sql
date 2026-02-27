-- BBI Platform Database Schema
-- SQLite with WAL mode for concurrent reads

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ==========================================
-- Core Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS verticals (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  config_json  TEXT NOT NULL,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS companies (
  id            INTEGER NOT NULL,
  vertical_id   TEXT NOT NULL REFERENCES verticals(id),
  name          TEXT NOT NULL,
  stage         TEXT NOT NULL,
  sector        TEXT NOT NULL DEFAULT '[]',
  city          TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL DEFAULT '',
  funding       REAL NOT NULL DEFAULT 0,
  momentum      INTEGER NOT NULL DEFAULT 50,
  employees     INTEGER NOT NULL DEFAULT 0,
  founded       INTEGER NOT NULL DEFAULT 2020,
  description   TEXT NOT NULL DEFAULT '',
  eligible      TEXT NOT NULL DEFAULT '[]',
  lat           REAL NOT NULL DEFAULT 0,
  lng           REAL NOT NULL DEFAULT 0,
  -- Enterprise fields (nullable)
  capacity_mw       REAL,
  storage_mwh       REAL,
  acreage           REAL,
  developer         TEXT,
  epc               TEXT,
  estimated_cod     TEXT,
  docket_ids        TEXT,
  queue_ids         TEXT,
  ppa_ids           TEXT,
  key_milestones    TEXT,
  risk_factors      TEXT,
  permitting_score  INTEGER,
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS funds (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  allocated    REAL,
  deployed     REAL NOT NULL DEFAULT 0,
  leverage     REAL,
  companies    INTEGER NOT NULL DEFAULT 0,
  thesis       TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  date         TEXT NOT NULL,
  type         TEXT NOT NULL,
  company      TEXT NOT NULL DEFAULT '',
  company_id   INTEGER,
  detail       TEXT NOT NULL DEFAULT '',
  icon         TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS graph_funds (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS people (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT '',
  company_id   INTEGER,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS externals (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  etype        TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS accelerators (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  atype        TEXT NOT NULL DEFAULT '',
  city         TEXT NOT NULL DEFAULT '',
  region       TEXT NOT NULL DEFAULT '',
  founded      INTEGER,
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS ecosystem_orgs (
  id           TEXT NOT NULL,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  name         TEXT NOT NULL,
  etype        TEXT NOT NULL DEFAULT '',
  city         TEXT NOT NULL DEFAULT '',
  region       TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS listings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical_id   TEXT NOT NULL REFERENCES verticals(id),
  company_id    INTEGER NOT NULL,
  exchange      TEXT NOT NULL,
  ticker        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS edges (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical_id  TEXT NOT NULL REFERENCES verticals(id),
  source       TEXT NOT NULL,
  target       TEXT NOT NULL,
  rel          TEXT NOT NULL,
  note         TEXT,
  year         INTEGER
);

-- ==========================================
-- Enterprise Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS dockets (
  id             TEXT NOT NULL,
  vertical_id    TEXT NOT NULL REFERENCES verticals(id),
  title          TEXT NOT NULL,
  agency         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'open',
  open_date      TEXT,
  last_activity  TEXT,
  next_deadline  TEXT,
  projects       TEXT NOT NULL DEFAULT '[]',
  filings        TEXT NOT NULL DEFAULT '[]',
  impact         TEXT NOT NULL DEFAULT '',
  url            TEXT,
  created_at     TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS ppas (
  id             TEXT NOT NULL,
  vertical_id    TEXT NOT NULL REFERENCES verticals(id),
  project        TEXT NOT NULL,
  project_id     INTEGER,
  buyer          TEXT NOT NULL DEFAULT '',
  technology     TEXT NOT NULL DEFAULT '',
  capacity_mw    REAL,
  storage_mwh    REAL,
  price_per_mwh  REAL,
  term_years     INTEGER,
  execution_date TEXT,
  cod_date       TEXT,
  docket_ref     TEXT,
  notes          TEXT,
  created_at     TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id                  TEXT NOT NULL,
  vertical_id         TEXT NOT NULL REFERENCES verticals(id),
  project_id          INTEGER,
  project_name        TEXT NOT NULL,
  utility             TEXT NOT NULL DEFAULT '',
  request_mw          REAL NOT NULL DEFAULT 0,
  type                TEXT NOT NULL DEFAULT '',
  substation          TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT '',
  application_date    TEXT,
  study_complete_date TEXT,
  estimated_cod       TEXT,
  county              TEXT NOT NULL DEFAULT '',
  notes               TEXT,
  created_at          TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, vertical_id)
);

CREATE TABLE IF NOT EXISTS benchmarks (
  vertical_id  TEXT PRIMARY KEY REFERENCES verticals(id),
  data_json    TEXT NOT NULL DEFAULT '{}'
);

-- ==========================================
-- Graph Metrics Cache
-- ==========================================

CREATE TABLE IF NOT EXISTS graph_metrics_cache (
  vertical_id      TEXT NOT NULL,
  filter_hash      TEXT NOT NULL,
  metrics_json     TEXT NOT NULL,
  computed_at      TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (vertical_id, filter_hash)
);

-- ==========================================
-- Full-Text Search
-- ==========================================

CREATE VIRTUAL TABLE IF NOT EXISTS companies_fts USING fts5(
  name, description, city, sector,
  content='companies',
  content_rowid='rowid'
);

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_companies_vertical ON companies(vertical_id);
CREATE INDEX IF NOT EXISTS idx_companies_stage ON companies(vertical_id, stage);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(vertical_id, region);
CREATE INDEX IF NOT EXISTS idx_funds_vertical ON funds(vertical_id);
CREATE INDEX IF NOT EXISTS idx_timeline_vertical ON timeline_events(vertical_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_edges_vertical ON edges(vertical_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(vertical_id, source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(vertical_id, target);
CREATE INDEX IF NOT EXISTS idx_edges_rel ON edges(vertical_id, rel);
CREATE INDEX IF NOT EXISTS idx_people_vertical ON people(vertical_id);
CREATE INDEX IF NOT EXISTS idx_externals_vertical ON externals(vertical_id);
CREATE INDEX IF NOT EXISTS idx_dockets_vertical ON dockets(vertical_id);
CREATE INDEX IF NOT EXISTS idx_ppas_vertical ON ppas(vertical_id);
CREATE INDEX IF NOT EXISTS idx_queue_vertical ON queue_entries(vertical_id);
CREATE INDEX IF NOT EXISTS idx_graph_funds_vertical ON graph_funds(vertical_id);
CREATE INDEX IF NOT EXISTS idx_accelerators_vertical ON accelerators(vertical_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_orgs_vertical ON ecosystem_orgs(vertical_id);
CREATE INDEX IF NOT EXISTS idx_listings_vertical ON listings(vertical_id);
