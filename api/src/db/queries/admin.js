import pool from '../pool.js';

export async function getAgentStatus() {
  const { rows } = await pool.query(`
    WITH known_agents(agent_name) AS (
      VALUES ('company_analyst'), ('weekly_brief'), ('risk_assessor'),
             ('pattern_detector'), ('panel_forecaster'), ('survival_analyzer'),
             ('freshness_checker'), ('fred_ingestor'), ('bls_ingestor'),
             ('scenario_simulator'), ('causal_evaluator')
    ),
    last_run AS (
      SELECT DISTINCT ON (agent_name)
        agent_name, status AS last_status, started_at AS last_started_at,
        completed_at AS last_completed_at,
        EXTRACT(EPOCH FROM (completed_at - started_at))::INT AS last_duration_seconds,
        error_message AS last_error, output_summary AS last_output
      FROM agent_runs ORDER BY agent_name, started_at DESC
    ),
    window_stats AS (
      SELECT agent_name,
        COUNT(*) AS total_runs_7d,
        COUNT(*) FILTER (WHERE status = 'failed') AS error_count_7d,
        COUNT(*) FILTER (WHERE status = 'completed') AS success_count_7d,
        ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))))::INT AS avg_duration_7d
      FROM agent_runs WHERE started_at >= NOW() - INTERVAL '7 days'
      GROUP BY agent_name
    )
    SELECT ka.agent_name, lr.last_status, lr.last_started_at, lr.last_completed_at,
      lr.last_duration_seconds, lr.last_error, lr.last_output,
      COALESCE(ws.total_runs_7d, 0) AS total_runs_7d,
      COALESCE(ws.error_count_7d, 0) AS error_count_7d,
      COALESCE(ws.success_count_7d, 0) AS success_count_7d,
      ws.avg_duration_7d
    FROM known_agents ka
    LEFT JOIN last_run lr USING (agent_name)
    LEFT JOIN window_stats ws USING (agent_name)
    ORDER BY ka.agent_name;
  `);
  return rows;
}

export async function getDataFreshness() {
  const { rows } = await pool.query(`
    SELECT entity_type,
      COUNT(DISTINCT entity_id) AS entity_count,
      COUNT(*) AS total_snapshots,
      MAX(period_end) AS latest_period_end,
      ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(period_end::TIMESTAMPTZ))) / 3600.0, 1) AS age_hours,
      CASE
        WHEN MAX(period_end) >= CURRENT_DATE - INTERVAL '1 day' THEN 'fresh'
        WHEN MAX(period_end) >= CURRENT_DATE - INTERVAL '7 days' THEN 'stale'
        ELSE 'outdated'
      END AS freshness_status,
      array_agg(DISTINCT metric_name ORDER BY metric_name) AS metric_names
    FROM metric_snapshots GROUP BY entity_type ORDER BY age_hours ASC;
  `);
  return rows;
}
