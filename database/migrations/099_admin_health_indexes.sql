-- Migration 099: Performance indexes for admin health endpoints
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_entity_type ON metric_snapshots(entity_type, period_end DESC);
