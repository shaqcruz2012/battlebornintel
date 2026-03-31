-- Dead letter queue for permanently failed agent runs
CREATE TABLE IF NOT EXISTS agent_dead_letters (
  id SERIAL PRIMARY KEY,
  agent_type VARCHAR(60) NOT NULL,
  agent_run_id INTEGER REFERENCES agent_runs(id),
  error_message TEXT,
  error_class VARCHAR(100),  -- 'TimeoutError', 'DatabaseError', etc.
  input_params JSONB,
  attempts INTEGER DEFAULT 0,
  first_failed_at TIMESTAMPTZ NOT NULL,
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dead_letters_unresolved
  ON agent_dead_letters (agent_type, resolved) WHERE resolved = FALSE;
