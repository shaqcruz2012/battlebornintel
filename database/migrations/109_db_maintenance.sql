-- Automated vacuum/analyze tuning for high-write tables
-- PostgreSQL 16 autovacuum per-table configuration

-- metric_snapshots: highest write volume (ingestion agents run daily/weekly)
ALTER TABLE metric_snapshots SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_cost_delay = 10
);

-- agent_runs: new rows every agent execution, frequent inserts + updates
ALTER TABLE agent_runs SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_cost_delay = 10
);

-- stakeholder_activities: activity feed, append-heavy
ALTER TABLE stakeholder_activities SET (
  autovacuum_vacuum_scale_factor = 0.08,
  autovacuum_analyze_scale_factor = 0.04
);

-- timeline_events: event log, append-heavy
ALTER TABLE timeline_events SET (
  autovacuum_vacuum_scale_factor = 0.08,
  autovacuum_analyze_scale_factor = 0.04
);

-- graph_edges: moderate writes, but statistics matter for join planning
ALTER TABLE graph_edges SET (
  autovacuum_vacuum_scale_factor = 0.10,
  autovacuum_analyze_scale_factor = 0.05
);

-- analysis_results: written by LLM agents, moderate volume
ALTER TABLE analysis_results SET (
  autovacuum_vacuum_scale_factor = 0.10,
  autovacuum_analyze_scale_factor = 0.05
);

-- scenario_results: batch writes during simulation runs
ALTER TABLE scenario_results SET (
  autovacuum_vacuum_scale_factor = 0.10,
  autovacuum_analyze_scale_factor = 0.05
);

-- ============================================================
-- Manual ANALYZE function for key tables
-- Useful for calling after bulk loads or via pg_cron
-- ============================================================

CREATE OR REPLACE FUNCTION maintenance_analyze_key_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  ANALYZE metric_snapshots;
  ANALYZE agent_runs;
  ANALYZE stakeholder_activities;
  ANALYZE timeline_events;
  ANALYZE graph_edges;
  ANALYZE analysis_results;
  ANALYZE scenario_results;
  ANALYZE computed_scores;
  ANALYZE graph_metrics_cache;
  ANALYZE companies;

  -- Refresh materialized views that depend on metric_snapshots
  REFRESH MATERIALIZED VIEW CONCURRENTLY economic_indicators_latest;
  REFRESH MATERIALIZED VIEW CONCURRENTLY economic_indicators_pivot;
  REFRESH MATERIALIZED VIEW CONCURRENTLY economic_indicators_summary;
END;
$$;

COMMENT ON FUNCTION maintenance_analyze_key_tables()
  IS 'ANALYZE high-write tables and refresh economic indicator materialized views. Safe to call anytime.';

-- ============================================================
-- Optional pg_cron scheduling (noop if extension not available)
-- Runs ANALYZE daily at 00:30 UTC, before agent schedules kick in
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;

    -- Upsert: remove existing job with same name before scheduling
    PERFORM cron.unschedule(jobid)
      FROM cron.job
      WHERE jobname = 'nightly_analyze_key_tables';

    PERFORM cron.schedule(
      'nightly_analyze_key_tables',
      '30 0 * * *',
      'SELECT maintenance_analyze_key_tables()'
    );

    RAISE NOTICE 'pg_cron job "nightly_analyze_key_tables" scheduled at 00:30 UTC daily';
  ELSE
    RAISE NOTICE 'pg_cron not available — skipping cron job. Call maintenance_analyze_key_tables() manually or via agent scheduler.';
  END IF;
END;
$$;
