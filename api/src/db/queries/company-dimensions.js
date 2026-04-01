import pool from '../pool.js';

/**
 * Enriched dimension score data for a single company.
 * JOINs computed_scores, metric_snapshots, graph_edges, events,
 * scenario_results, and graph_metrics_cache to explain WHY each
 * dimension scores what it does.
 */
export async function getCompanyDimensions(companyId) {
  const nodeId = `c_${companyId}`;

  const [company, scores, metrics, edges, events, forecasts, graphMetrics] = await Promise.all([
    pool.query('SELECT * FROM companies WHERE id = $1', [companyId]),
    pool.query('SELECT * FROM computed_scores WHERE company_id = $1 ORDER BY computed_at DESC LIMIT 1', [companyId]),
    pool.query(
      "SELECT metric_name, value, unit FROM metric_snapshots WHERE entity_type = 'company' AND entity_id = $1",
      [String(companyId)]
    ),
    pool.query(
      'SELECT source_id, target_id, rel, note, source_url FROM graph_edges WHERE (source_id = $1 OR target_id = $1) AND (quarantined IS NULL OR quarantined = false)',
      [nodeId]
    ),
    pool.query(
      'SELECT description, event_type, event_date FROM events WHERE company_id = $1 AND (quarantined IS NULL OR quarantined = false) ORDER BY event_date DESC LIMIT 10',
      [companyId]
    ),
    pool.query(
      'SELECT metric_name, value, confidence_lo, confidence_hi, period FROM scenario_results WHERE entity_id = $1 ORDER BY period LIMIT 20',
      [String(companyId)]
    ),
    pool.query(
      'SELECT pagerank, betweenness, community_id FROM graph_metrics_cache WHERE node_id = $1',
      [nodeId]
    ),
  ]);

  const c = company.rows[0];
  if (!c) return null;

  const dims = scores.rows[0]?.dims || {};
  const metricMap = {};
  metrics.rows.forEach((m) => { metricMap[m.metric_name] = m.value; });
  const gm = graphMetrics.rows[0] || {};

  // Stage norms for funding velocity context
  const STAGE_NORMS = { pre_seed: 1, seed: 3, series_a: 15, series_b: 40, series_c: 100, growth: 200 };
  const stageNorm = STAGE_NORMS[c.stage] || 10;
  const fundingRatio = c.funding_m ? (parseFloat(c.funding_m) / stageNorm) : 0;

  return {
    team: {
      score: dims.team || 0,
      evidence: {
        employees: c.employees,
        founder_experience_years: metricMap.founder_experience_years || null,
        key_people: edges.rows
          .filter((e) => e.rel === 'founded_by' || e.rel === 'employed_at')
          .map((e) => (e.source_id.startsWith('p_') ? e.source_id : e.target_id))
          .slice(0, 5),
      },
      context: c.employees
        ? `Team of ${c.employees}${metricMap.founder_experience_years ? `, ${metricMap.founder_experience_years}yr founder experience` : ''}`
        : 'No team data available',
    },
    hiring: {
      score: dims.hiring || 0,
      evidence: {
        employees: c.employees,
        hiring_events: events.rows.filter((e) => e.event_type === 'hiring').length,
        forecast_employees: forecasts.rows.find((f) => f.metric_name === 'employees_simulated')?.value || null,
        forecast_ci: forecasts.rows.find((f) => f.metric_name === 'employees_simulated')
          ? [
              forecasts.rows.find((f) => f.metric_name === 'employees_simulated').confidence_lo,
              forecasts.rows.find((f) => f.metric_name === 'employees_simulated').confidence_hi,
            ]
          : null,
      },
      context: c.employees
        ? `${c.employees} employees${events.rows.filter((e) => e.event_type === 'hiring').length > 0 ? ', active hiring signals' : ''}`
        : 'No headcount data',
    },
    network: {
      score: dims.network || 0,
      evidence: {
        edge_count: edges.rows.length,
        pagerank: gm.pagerank ? parseFloat(gm.pagerank) : null,
        betweenness: gm.betweenness ? parseFloat(gm.betweenness) : null,
        community_id: gm.community_id || null,
        top_connections: edges.rows
          .filter((e) => e.rel === 'invested_in' || e.rel === 'partners_with' || e.rel === 'accelerated_by')
          .slice(0, 5)
          .map((e) => ({ rel: e.rel, node: e.source_id === nodeId ? e.target_id : e.source_id })),
      },
      context: `Connected to ${edges.rows.length} entities${gm.pagerank ? `, PageRank ${parseFloat(gm.pagerank).toFixed(4)}` : ''}`,
    },
    momentum: {
      score: dims.momentum || c.momentum || 0,
      evidence: {
        current: c.momentum,
        recent_events: events.rows.slice(0, 3).map((e) => ({
          type: e.event_type,
          date: e.event_date,
          desc: e.description?.slice(0, 80),
        })),
      },
      context: c.momentum >= 80
        ? `Momentum ${c.momentum} -- strong recent activity`
        : c.momentum >= 50
          ? `Momentum ${c.momentum} -- moderate activity`
          : `Momentum ${c.momentum || 0} -- limited recent signals`,
    },
    data_quality: {
      score: dims.data_quality || 0,
      evidence: {
        has_description: !!c.description,
        has_funding: !!c.funding_m,
        has_employees: !!c.employees,
        has_sectors: !!(c.sectors?.length),
        has_city: !!c.city,
        sourced_edges: edges.rows.filter((e) => e.source_url?.startsWith('http')).length,
        total_edges: edges.rows.length,
      },
      context: `${[c.description, c.funding_m, c.employees, c.sectors?.length, c.city].filter(Boolean).length}/5 core fields populated, ${edges.rows.filter((e) => e.source_url?.startsWith('http')).length}/${edges.rows.length} edges sourced`,
    },
    market: {
      score: dims.market_timing || 0,
      evidence: {
        sectors: c.sectors,
        tam_b: metricMap.tam_b || null,
        competitor_count: metricMap.competitor_count || null,
      },
      context: c.sectors?.length
        ? `Sectors: ${c.sectors.join(', ')}${metricMap.tam_b ? ` -- $${metricMap.tam_b}B TAM` : ''}`
        : 'No sector data',
    },
    funding_velocity: {
      score: dims.funding_velocity || 0,
      evidence: {
        total_funding_m: c.funding_m ? parseFloat(c.funding_m) : null,
        stage: c.stage,
        stage_norm_m: stageNorm,
        ratio_to_norm: Math.round(fundingRatio * 10) / 10,
        funding_events: events.rows
          .filter((e) => e.event_type === 'funding')
          .slice(0, 3)
          .map((e) => ({ date: e.event_date, desc: e.description?.slice(0, 80) })),
      },
      context: c.funding_m
        ? `$${parseFloat(c.funding_m)}M total -- ${fundingRatio.toFixed(1)}x ${c.stage?.replace(/_/g, ' ')} median ($${stageNorm}M)`
        : 'No funding data',
    },
    forward_outlook: {
      score: scores.rows[0]?.forward_score || 0,
      evidence: {
        survival_probability: forecasts.rows.find((f) => f.metric_name === 'survival_probability')?.value || null,
        funding_forecast: forecasts.rows.find((f) => f.metric_name === 'funding_m_simulated')?.value || null,
      },
      context: forecasts.rows.length > 0
        ? `${forecasts.rows.length} forecast data points available`
        : 'No forecast data -- run scenario simulator',
    },
  };
}
