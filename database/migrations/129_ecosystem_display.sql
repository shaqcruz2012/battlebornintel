BEGIN;

-- Display configuration for ecosystem map positioning
ALTER TABLE entity_registry
  ADD COLUMN IF NOT EXISTS display_x FLOAT,    -- SME(0) to IDE(10) spectrum
  ADD COLUMN IF NOT EXISTS display_y FLOAT,    -- Stage axis (0=concept, 10=growth)
  ADD COLUMN IF NOT EXISTS display_size FLOAT DEFAULT 2.0,  -- Bubble size (1-8)
  ADD COLUMN IF NOT EXISTS display_category VARCHAR(40),     -- Color category
  ADD COLUMN IF NOT EXISTS display_track VARCHAR(10);         -- IDE, SME, Hybrid

-- Gap interventions tracking
CREATE TABLE IF NOT EXISTS gap_interventions (
  id SERIAL PRIMARY KEY,
  gap_type VARCHAR(30) NOT NULL,          -- 'framework' or 'structural'
  gap_name VARCHAR(100) NOT NULL,
  proposed_bridge_id VARCHAR(80),         -- entity that could bridge the gap
  target_community_a VARCHAR(80),
  target_community_b VARCHAR(80),
  status VARCHAR(20) NOT NULL DEFAULT 'proposed',  -- proposed, in_progress, completed, rejected
  proposed_by VARCHAR(60),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gap_interventions_status ON gap_interventions(status);

-- Backfill display coordinates for ecosystem entities
-- Accelerators: IDE track, various stages
UPDATE entity_registry SET display_track = 'IDE', display_category = 'IDE-Accel'
WHERE entity_type = 'accelerator' AND display_track IS NULL;

UPDATE entity_registry SET display_track = 'Hybrid', display_category = 'Hybrid-Fund'
WHERE entity_type = 'fund' AND display_track IS NULL;

UPDATE entity_registry SET display_track = 'IDE', display_category = 'IDE-Program'
WHERE entity_type = 'program' AND display_track IS NULL;

UPDATE entity_registry SET display_track = 'Hybrid', display_category = 'Ecosystem'
WHERE entity_type = 'ecosystem_org' AND display_track IS NULL;

COMMIT;
