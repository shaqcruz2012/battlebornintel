-- Add duration tracking to agent_runs
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- Add agent_metrics summary table for dashboarding
CREATE TABLE IF NOT EXISTS agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_type VARCHAR(60) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  timed_out_runs INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  p95_duration_ms INTEGER,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (agent_type, period_start, period_end)
);
