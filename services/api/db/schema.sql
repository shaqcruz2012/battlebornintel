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
