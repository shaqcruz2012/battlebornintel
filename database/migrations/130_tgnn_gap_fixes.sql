BEGIN;

-- ============================================================
-- GAP 1: Backfill valid_to for edge lifetimes
-- T-GNN needs to know when relationships end
-- ============================================================

-- Opportunity edges expire after 1 year (they're projections)
UPDATE graph_edges SET valid_to = valid_from + INTERVAL '1 year'
WHERE edge_category = 'opportunity' AND valid_to IS NULL AND valid_from IS NOT NULL;

-- Acquisitions/exits end 6 months after event
UPDATE graph_edges SET valid_to = COALESCE(event_date, valid_from) + INTERVAL '6 months'
WHERE rel IN ('acquired', 'acquired_by') AND valid_to IS NULL;

-- Contract edges expire after 2 years
UPDATE graph_edges SET valid_to = COALESCE(event_date, valid_from) + INTERVAL '2 years'
WHERE rel IN ('contracts_with', 'contracted_with') AND valid_to IS NULL;

-- Won_pitch is a point event, not ongoing — valid_to = valid_from + 1 day
UPDATE graph_edges SET valid_to = COALESCE(event_date, valid_from) + INTERVAL '1 day'
WHERE rel = 'won_pitch' AND valid_to IS NULL;

-- Historical investment/partnership edges: no expiry (valid_to stays NULL = still active)
-- This is correct — invested_in, partners_with, accelerated_by are ongoing

-- ============================================================
-- GAP 2: State history triggers for property evolution
-- Log stage, funding, momentum changes on companies
-- ============================================================

CREATE OR REPLACE FUNCTION trg_company_state_changes() RETURNS TRIGGER AS $$
BEGIN
  -- Log stage change
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES ('c_' || NEW.id, 'stage_change', 'stage', to_jsonb(OLD.stage), to_jsonb(NEW.stage), 'system');
  END IF;

  -- Log funding change (only if significant: > $1M difference)
  IF OLD.funding_m IS DISTINCT FROM NEW.funding_m AND ABS(COALESCE(NEW.funding_m, 0) - COALESCE(OLD.funding_m, 0)) >= 1 THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES ('c_' || NEW.id, 'funding', 'funding_m', to_jsonb(OLD.funding_m), to_jsonb(NEW.funding_m), 'system');
  END IF;

  -- Log momentum change (only if > 5 point swing)
  IF OLD.momentum IS DISTINCT FROM NEW.momentum AND ABS(COALESCE(NEW.momentum, 0) - COALESCE(OLD.momentum, 0)) >= 5 THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES ('c_' || NEW.id, 'metric_update', 'momentum', to_jsonb(OLD.momentum), to_jsonb(NEW.momentum), 'system');
  END IF;

  -- Log employee count change (only if > 10% change)
  IF OLD.employees IS DISTINCT FROM NEW.employees
     AND OLD.employees > 0
     AND ABS(NEW.employees - OLD.employees)::float / OLD.employees > 0.1 THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES ('c_' || NEW.id, 'metric_update', 'employees', to_jsonb(OLD.employees), to_jsonb(NEW.employees), 'system');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_company_state_history ON companies;
CREATE TRIGGER trg_company_state_history
  AFTER UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION trg_company_state_changes();

-- Also track edge confidence/verification changes
CREATE OR REPLACE FUNCTION trg_edge_state_changes() RETURNS TRIGGER AS $$
BEGIN
  -- Log verification status changes
  IF OLD.verified IS DISTINCT FROM NEW.verified THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES (NEW.source_id || '->' || NEW.target_id, 'verification', 'edge_verified', to_jsonb(OLD.verified), to_jsonb(NEW.verified), 'system');
  END IF;

  -- Log significant confidence changes (> 0.1 delta)
  IF OLD.confidence IS DISTINCT FROM NEW.confidence
     AND ABS(COALESCE(NEW.confidence, 0) - COALESCE(OLD.confidence, 0)) > 0.1 THEN
    INSERT INTO entity_state_history (canonical_id, change_type, property_name, old_value, new_value, agent_id)
    VALUES (NEW.source_id || '->' || NEW.target_id, 'confidence_change', 'edge_confidence', to_jsonb(OLD.confidence), to_jsonb(NEW.confidence), 'system');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_edge_state_history ON graph_edges;
CREATE TRIGGER trg_edge_state_history
  AFTER UPDATE ON graph_edges
  FOR EACH ROW EXECUTE FUNCTION trg_edge_state_changes();

-- ============================================================
-- GAP 3: Add node feature versioning for temporal snapshots
-- Each snapshot should capture feature vectors at that point in time
-- ============================================================

-- Add snapshot_id to node_features for versioned features
ALTER TABLE node_features DROP CONSTRAINT IF EXISTS node_features_pkey;
ALTER TABLE node_features ADD COLUMN IF NOT EXISTS snapshot_id BIGINT;

-- Recreate PK as composite (canonical_id + version)
-- Keep the latest version easily queryable
CREATE INDEX IF NOT EXISTS idx_node_features_latest ON node_features(canonical_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_node_features_snapshot ON node_features(snapshot_id);

-- Same for edge features
ALTER TABLE edge_features ADD COLUMN IF NOT EXISTS snapshot_id BIGINT;
ALTER TABLE edge_features ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_edge_features_snapshot ON edge_features(snapshot_id);

COMMIT;
