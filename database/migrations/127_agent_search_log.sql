-- Migration 127: Agent search log + rotation tracking
-- Tracks every search/verification agents perform, enabling weekly rotation coverage.

CREATE TABLE IF NOT EXISTS agent_search_log (
  id BIGSERIAL PRIMARY KEY,
  canonical_id VARCHAR(80) NOT NULL,
  agent_name VARCHAR(60) NOT NULL,
  search_type VARCHAR(30) NOT NULL,  -- 'verification', 'enrichment', 'source_discovery', 'relationship_scan'
  query_text TEXT,                    -- what was searched/queried
  result_summary TEXT,               -- brief result
  sources_checked TEXT[],            -- URLs/sources checked
  findings JSONB,                    -- structured findings
  confidence_before FLOAT,
  confidence_after FLOAT,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_log_canonical ON agent_search_log(canonical_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_log_agent ON agent_search_log(agent_name, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_log_time ON agent_search_log(searched_at DESC);

-- Add last_queried_at to entity_registry for rotation scheduling
ALTER TABLE entity_registry ADD COLUMN IF NOT EXISTS last_queried_at TIMESTAMPTZ;
