BEGIN;

-- ============================================================
-- 1. NODE FEATURES — pre-computed feature vectors for T-GNN
-- Recomputed daily by rotation agents. 32-dim vector.
-- ============================================================
CREATE TABLE IF NOT EXISTS node_features (
  canonical_id VARCHAR(80) PRIMARY KEY,
  feature_vector FLOAT[] NOT NULL,
  feature_names TEXT[] NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- 2. EDGE FEATURES — pre-computed per-edge feature vectors
-- ============================================================
CREATE TABLE IF NOT EXISTS edge_features (
  edge_id INTEGER PRIMARY KEY,
  feature_vector FLOAT[] NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TEMPORAL SNAPSHOTS — periodic graph state captures
-- Used for T-GNN batch training data generation
-- ============================================================
CREATE TABLE IF NOT EXISTS temporal_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL,
  snapshot_type VARCHAR(20) NOT NULL DEFAULT 'daily',
  node_count INTEGER,
  edge_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_time ON temporal_snapshots(snapshot_at DESC);

-- ============================================================
-- 4. NEO4J SYNC QUEUE — staging table for Neo4j bulk import
-- Records changes since last sync for incremental updates
-- ============================================================
CREATE TABLE IF NOT EXISTS neo4j_sync_queue (
  id BIGSERIAL PRIMARY KEY,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_scope VARCHAR(15) NOT NULL CHECK (entity_scope IN ('NODE', 'RELATIONSHIP')),
  canonical_id VARCHAR(80),
  edge_id INTEGER,
  properties JSONB NOT NULL,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_neo4j_queue_pending ON neo4j_sync_queue(synced_at) WHERE synced_at IS NULL;

-- ============================================================
-- 5. GRAPH STATISTICS — daily computed metrics for monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS graph_statistics (
  id SERIAL PRIMARY KEY,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_nodes INTEGER,
  total_edges INTEGER,
  avg_degree FLOAT,
  density FLOAT,
  node_type_dist JSONB,
  edge_type_dist JSONB,
  temporal_coverage JSONB
);

-- ============================================================
-- 6. NEO4J EXPORT VIEWS — formatted for neo4j-admin import
-- ============================================================

-- Nodes view with all properties flattened
CREATE OR REPLACE VIEW v_neo4j_nodes AS
SELECT
  er.canonical_id AS node_id,
  er.entity_type AS label,
  er.label AS name,
  er.confidence,
  er.verified,
  er.valid_from,
  er.valid_to,
  er.last_queried_at,
  c.stage,
  c.funding_m,
  c.momentum,
  c.employees,
  c.city,
  c.region,
  array_to_string(c.sectors, ';') AS sectors,
  c.founded,
  c.description
FROM entity_registry er
LEFT JOIN companies c ON er.source_table = 'companies' AND er.source_table_id = c.id::text;

-- Relationships view for Neo4j import
CREATE OR REPLACE VIEW v_neo4j_relationships AS
SELECT
  ge.id AS edge_id,
  ge.source_id,
  ge.target_id,
  ge.rel AS relationship_type,
  ge.confidence,
  ge.weight,
  ge.impact_type,
  ge.edge_category,
  ge.bidirectional,
  ge.valid_from,
  ge.valid_to,
  ge.event_date,
  ge.event_year,
  ge.source_url,
  ge.source_name,
  ge.data_quality,
  ge.note
FROM graph_edges ge;

-- ============================================================
-- 7. TRIGGERS — auto-queue Neo4j sync on entity/edge changes
-- ============================================================

-- Queue node changes for Neo4j sync
CREATE OR REPLACE FUNCTION trg_neo4j_node_sync() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO neo4j_sync_queue (operation, entity_scope, canonical_id, properties)
  VALUES (
    CASE WHEN TG_OP = 'DELETE' THEN 'DELETE' WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END,
    'NODE',
    COALESCE(NEW.canonical_id, OLD.canonical_id),
    jsonb_build_object('entity_type', NEW.entity_type, 'label', NEW.label, 'confidence', NEW.confidence, 'verified', NEW.verified)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_neo4j_entity_sync ON entity_registry;
CREATE TRIGGER trg_neo4j_entity_sync
  AFTER INSERT OR UPDATE OR DELETE ON entity_registry
  FOR EACH ROW EXECUTE FUNCTION trg_neo4j_node_sync();

-- Queue edge changes for Neo4j sync
CREATE OR REPLACE FUNCTION trg_neo4j_edge_sync() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO neo4j_sync_queue (operation, entity_scope, edge_id, properties)
  VALUES (
    CASE WHEN TG_OP = 'DELETE' THEN 'DELETE' WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END,
    'RELATIONSHIP',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('source_id', NEW.source_id, 'target_id', NEW.target_id, 'rel', NEW.rel, 'confidence', NEW.confidence, 'weight', NEW.weight)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_neo4j_edge_sync ON graph_edges;
CREATE TRIGGER trg_neo4j_edge_sync
  AFTER INSERT OR UPDATE OR DELETE ON graph_edges
  FOR EACH ROW EXECUTE FUNCTION trg_neo4j_edge_sync();

COMMIT;
