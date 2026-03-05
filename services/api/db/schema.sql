CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT,
  sectors TEXT,
  city TEXT,
  region TEXT,
  funding REAL,
  momentum INTEGER,
  employees INTEGER,
  founded INTEGER,
  description TEXT,
  eligible TEXT,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS funds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  allocated REAL,
  deployed REAL,
  leverage REAL,
  companies INTEGER,
  thesis TEXT
);

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  etype TEXT,
  atype TEXT,
  role TEXT,
  city TEXT,
  region TEXT,
  founded INTEGER,
  company_id INTEGER,
  note TEXT
);

CREATE TABLE IF NOT EXISTS edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  rel TEXT NOT NULL,
  note TEXT,
  year INTEGER
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  type TEXT,
  company TEXT,
  detail TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS listings (
  company_id INTEGER,
  exchange TEXT,
  ticker TEXT,
  PRIMARY KEY (company_id, exchange)
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
CREATE INDEX IF NOT EXISTS idx_entities_category ON entities(category);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(region);

-- ── Schema v2: provenance, quarantine, sources, snapshots ──────────────

CREATE TABLE IF NOT EXISTS pending_review (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_table TEXT NOT NULL,
  proposed_data TEXT NOT NULL,
  confidence REAL,
  sources TEXT,
  agent_id TEXT,
  created_at TEXT,
  reviewed_at TEXT,
  reviewer TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  url TEXT,
  title TEXT,
  published_date TEXT,
  accessed_at TEXT,
  source_credibility REAL,
  extraction_method TEXT
);

CREATE TABLE IF NOT EXISTS entity_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  period TEXT,
  metrics TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_review_status ON pending_review(status);
CREATE INDEX IF NOT EXISTS idx_pending_review_agent ON pending_review(agent_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_record ON data_sources(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_entity_snapshots_entity ON entity_snapshots(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_snapshots_date ON entity_snapshots(snapshot_date);
