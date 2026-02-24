-- BBI PostgreSQL Schema v1.0
-- All 9 entity types in one table (JSONB for type-specific fields)
-- Confidence-scored edges with audit trail

-- ═══════════════════════════════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  label TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  confidence FLOAT DEFAULT 1.0,
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edges (
  id SERIAL PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  rel TEXT NOT NULL,
  note TEXT,
  year INT DEFAULT 2023,
  confidence FLOAT DEFAULT 1.0,
  source TEXT DEFAULT 'seed',
  evidence JSONB DEFAULT '[]',
  status TEXT DEFAULT 'approved',
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id, rel)
);

CREATE TABLE IF NOT EXISTS edge_reviews (
  id SERIAL PRIMARY KEY,
  edge_id INT REFERENCES edges(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  confidence_before FLOAT,
  confidence_after FLOAT,
  reviewer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id SERIAL PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT DEFAULT 'running',
  stats JSONB DEFAULT '{}',
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_source ON nodes(source);
CREATE INDEX IF NOT EXISTS idx_edges_status ON edges(status);
CREATE INDEX IF NOT EXISTS idx_edges_confidence ON edges(confidence);
CREATE INDEX IF NOT EXISTS idx_edges_source_id ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_id ON edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_year ON edges(year);
CREATE INDEX IF NOT EXISTS idx_edges_rel ON edges(rel);
CREATE INDEX IF NOT EXISTS idx_edges_source_type ON edges(source);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_nodes_data ON nodes USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_edges_evidence ON edges USING GIN(evidence);

-- ═══════════════════════════════════════════════════════════════
-- REAL-TIME NOTIFICATION TRIGGERS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_graph_change() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('graph_changed', json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'id', COALESCE(NEW.id::text, OLD.id::text)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nodes_notify ON nodes;
CREATE TRIGGER nodes_notify
  AFTER INSERT OR UPDATE OR DELETE ON nodes
  FOR EACH ROW EXECUTE FUNCTION notify_graph_change();

DROP TRIGGER IF EXISTS edges_notify ON edges;
CREATE TRIGGER edges_notify
  AFTER INSERT OR UPDATE OR DELETE ON edges
  FOR EACH ROW EXECUTE FUNCTION notify_graph_change();

-- ═══════════════════════════════════════════════════════════════
-- UPDATED_AT AUTO-UPDATE
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nodes_updated_at ON nodes;
CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
