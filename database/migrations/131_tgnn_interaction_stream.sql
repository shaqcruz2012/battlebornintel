BEGIN;

-- ============================================================
-- 1. Interaction stream materialized view with persistence augmentation
-- Expands ~1,649 edges to ~8,000-12,000 interactions for T-GNN training
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_interaction_stream AS
-- Original edge creation events
SELECT ge.source_id, ge.target_id, ge.valid_from AS event_time, ge.rel,
       'creation' AS interaction_type, ge.id AS edge_id,
       ge.confidence, ge.weight, ge.impact_type, ge.edge_category
FROM graph_edges ge
WHERE ge.valid_from IS NOT NULL

UNION ALL

-- Quarterly persistence pings for ongoing relationships
SELECT ge.source_id, ge.target_id,
       gs::timestamptz AS event_time,
       ge.rel, 'persistence' AS interaction_type, ge.id AS edge_id,
       ge.confidence, ge.weight, ge.impact_type, ge.edge_category
FROM graph_edges ge,
LATERAL generate_series(
  date_trunc('quarter', ge.valid_from) + INTERVAL '3 months',
  COALESCE(ge.valid_to, NOW()),
  INTERVAL '3 months'
) gs
WHERE ge.valid_from IS NOT NULL
  AND ge.edge_category = 'historical'
  AND ge.rel IN ('invested_in', 'partners_with', 'partnered_with',
                  'accelerated_by', 'manages', 'supports', 'funds',
                  'housed_at', 'program_of', 'contracts_with')

UNION ALL

-- Edge dissolution events
SELECT ge.source_id, ge.target_id, ge.valid_to AS event_time, ge.rel,
       'dissolution' AS interaction_type, ge.id AS edge_id,
       ge.confidence, ge.weight, ge.impact_type, ge.edge_category
FROM graph_edges ge
WHERE ge.valid_to IS NOT NULL

UNION ALL

-- Entity state changes as self-loop interactions
SELECT esh.canonical_id AS source_id, esh.canonical_id AS target_id,
       esh.changed_at AS event_time,
       esh.change_type AS rel,
       'state_change' AS interaction_type, NULL::integer AS edge_id,
       NULL::float AS confidence, NULL::numeric AS weight,
       NULL::varchar AS impact_type, NULL::varchar AS edge_category
FROM entity_state_history esh
WHERE esh.change_type != 'created'

ORDER BY event_time ASC;

CREATE INDEX IF NOT EXISTS idx_interaction_stream_time ON mv_interaction_stream(event_time);
CREATE INDEX IF NOT EXISTS idx_interaction_stream_source ON mv_interaction_stream(source_id);
CREATE INDEX IF NOT EXISTS idx_interaction_stream_target ON mv_interaction_stream(target_id);

-- ============================================================
-- 2. Add first_interaction_at to entity_registry for cold start tracking
-- ============================================================
ALTER TABLE entity_registry ADD COLUMN IF NOT EXISTS first_interaction_at TIMESTAMPTZ;

UPDATE entity_registry er SET first_interaction_at = sub.first_at
FROM (
  SELECT canonical_id, MIN(event_time) AS first_at
  FROM (
    SELECT source_id AS canonical_id, valid_from AS event_time FROM graph_edges WHERE valid_from IS NOT NULL
    UNION ALL
    SELECT target_id, valid_from FROM graph_edges WHERE valid_from IS NOT NULL
  ) edges
  GROUP BY canonical_id
) sub
WHERE er.canonical_id = sub.canonical_id AND er.first_interaction_at IS NULL;

-- ============================================================
-- 3. Node type degree view for type-constrained negative sampling
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_node_type_degree AS
SELECT
  er.canonical_id,
  er.entity_type,
  er.valid_from,
  er.valid_to,
  COUNT(ge.id) AS degree
FROM entity_registry er
LEFT JOIN graph_edges ge ON ge.source_id = er.canonical_id OR ge.target_id = er.canonical_id
GROUP BY er.canonical_id, er.entity_type, er.valid_from, er.valid_to;

CREATE INDEX IF NOT EXISTS idx_ntd_type ON mv_node_type_degree(entity_type, degree DESC);

-- ============================================================
-- 4. TGN memory state table for inference persistence
-- ============================================================
CREATE TABLE IF NOT EXISTS tgn_memory_state (
  model_version VARCHAR(20) NOT NULL,
  canonical_id VARCHAR(80) NOT NULL,
  memory_vector FLOAT[] NOT NULL,
  last_update_t BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (model_version, canonical_id)
);

COMMIT;
