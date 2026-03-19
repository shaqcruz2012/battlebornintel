import pool from '../pool.js';

/**
 * Fetch all data needed by the risk signal engine in a single round-trip.
 * Uses CTEs to gather companies (with current + previous IRS scores),
 * event freshness, edge counts, funds, and graph metrics.
 */
export async function getRiskData() {
  const { rows } = await pool.query(`
    WITH latest_scores AS (
      SELECT DISTINCT ON (company_id)
        company_id, irs_score, grade, triggers, dims, computed_at
      FROM computed_scores
      ORDER BY company_id, computed_at DESC
    ),
    prev_scores AS (
      SELECT DISTINCT ON (cs.company_id)
        cs.company_id, cs.irs_score AS prev_irs, cs.computed_at AS prev_at
      FROM computed_scores cs
      INNER JOIN (
        SELECT company_id, MAX(computed_at) AS max_at
        FROM computed_scores
        GROUP BY company_id
      ) latest ON cs.company_id = latest.company_id AND cs.computed_at < latest.max_at
      ORDER BY cs.company_id, cs.computed_at DESC
    ),
    event_freshness AS (
      SELECT company_id,
             MAX(event_date) AS last_event_date,
             COUNT(*) AS event_count
      FROM events
      WHERE company_id IS NOT NULL
        AND event_date > NOW() - INTERVAL '1 year'
      GROUP BY company_id
    ),
    edge_counts AS (
      SELECT node_id, COUNT(*) AS edge_count
      FROM (
        SELECT source_id AS node_id FROM graph_edges
        UNION ALL
        SELECT target_id AS node_id FROM graph_edges
      ) sub
      GROUP BY node_id
    )
    SELECT json_build_object(
      'companies', COALESCE((SELECT json_agg(row_to_json(q)) FROM (
        SELECT c.id, c.name, c.slug, c.stage, c.sectors, c.funding_m,
               c.momentum, c.employees, c.eligible, c.region,
               ls.irs_score, ls.grade, ls.dims, ls.computed_at,
               ps.prev_irs, ps.prev_at,
               ef.last_event_date, ef.event_count
        FROM companies c
        LEFT JOIN latest_scores ls ON ls.company_id = c.id
        LEFT JOIN prev_scores ps ON ps.company_id = c.id
        LEFT JOIN event_freshness ef ON ef.company_id = c.id
      ) q), '[]'::json),
      'funds', COALESCE((SELECT json_agg(row_to_json(f)) FROM funds f), '[]'::json),
      'graph_metrics', COALESCE((SELECT json_agg(row_to_json(gm))
        FROM graph_metrics_cache gm), '[]'::json),
      'edge_counts', COALESCE((SELECT json_agg(row_to_json(ec)) FROM edge_counts ec), '[]'::json)
    ) AS payload
  `);

  return rows[0].payload;
}
