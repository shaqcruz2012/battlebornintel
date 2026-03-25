-- Migration 122: Entity State History for T-GNN
-- Captures property changes over time so the T-GNN training pipeline
-- can reconstruct the graph state at any historical point.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/122_entity_state_history.sql

BEGIN;

CREATE TABLE IF NOT EXISTS entity_state_history (
  id              BIGSERIAL PRIMARY KEY,
  canonical_id    VARCHAR(80) NOT NULL,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_type     VARCHAR(30) NOT NULL,   -- 'created', 'funding', 'stage_change', 'metric_update', 'status_change'
  property_name   VARCHAR(60),            -- e.g. 'stage', 'funding_m', 'momentum'
  old_value       JSONB,
  new_value       JSONB,
  source_id       INTEGER,
  agent_id        VARCHAR(60)
);

CREATE INDEX IF NOT EXISTS idx_esh_canonical ON entity_state_history(canonical_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_esh_type ON entity_state_history(change_type);
CREATE INDEX IF NOT EXISTS idx_esh_changed_at ON entity_state_history(changed_at);

-- Seed initial 'created' events from entity_registry
INSERT INTO entity_state_history (canonical_id, changed_at, change_type, new_value)
SELECT
  canonical_id,
  valid_from,
  'created',
  jsonb_build_object('label', label, 'entity_type', entity_type)
FROM entity_registry
ON CONFLICT DO NOTHING;

COMMIT;
