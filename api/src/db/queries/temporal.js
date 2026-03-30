import pool from '../pool.js';
import { logger } from '../../logger.js';

/**
 * Temporal graph snapshot — returns edges active at a given date.
 * Filters graph_edges by valid_from/valid_to temporal bounds and
 * returns nodes + edges in the same format as getGraphData().
 */
export async function getGraphAtDate(snapshotDate) {
  const nodes = [];
  const nodeSet = new Set();

  const add = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
  };

  // Load all entities and temporally-filtered edges in parallel
  const [
    companyRows,
    fundRows,
    edgeRows,
  ] = await Promise.all([
    pool.query(
      `SELECT id, name, stage, funding_m, momentum, employees, city, region, sectors, eligible, founded
       FROM companies`
    ).then(r => r.rows),
    pool.query(
      `SELECT id, name, fund_type FROM graph_funds`
    ).then(r => r.rows),
    pool.query(
      `SELECT source_id, target_id, rel, event_year, note, matching_score,
              edge_category, edge_style, edge_color, edge_opacity
       FROM graph_edges
       WHERE valid_from <= $1
         AND (valid_to IS NULL OR valid_to >= $1)`,
      [snapshotDate]
    ).then(r => r.rows),
  ]);

  // Index companies and funds by prefixed ID for fast lookup
  const companyById = new Map();
  for (const c of companyRows) {
    companyById.set(`c_${c.id}`, c);
  }
  const fundById = new Map();
  for (const f of fundRows) {
    fundById.set(`f_${f.id}`, f);
  }

  // Only include nodes that participate in at least one active edge
  const edges = [];
  for (const e of edgeRows) {
    // Ensure both endpoints get added as nodes
    for (const nid of [e.source_id, e.target_id]) {
      if (nodeSet.has(nid)) continue;
      const company = companyById.get(nid);
      if (company) {
        add(nid, company.name, 'company', {
          stage: company.stage,
          funding: parseFloat(company.funding_m),
          momentum: company.momentum,
          employees: company.employees,
          city: company.city,
          region: company.region,
          sector: company.sectors,
          eligible: company.eligible,
          founded: company.founded,
        });
        continue;
      }
      const fund = fundById.get(nid);
      if (fund) {
        add(nid, fund.name, 'fund', { fundType: fund.fund_type });
        continue;
      }
      // Unknown endpoint — add placeholder
      add(nid, nid, 'unknown');
    }

    const edge = {
      source: e.source_id,
      target: e.target_id,
      rel: e.rel,
      y: e.event_year,
    };
    if (e.note) edge.note = e.note;
    if (e.matching_score != null) edge.matching_score = parseFloat(e.matching_score);
    if (e.edge_category && e.edge_category !== 'historical') edge.category = e.edge_category;
    if (e.edge_style) edge.style = e.edge_style;
    if (e.edge_color) edge.color = e.edge_color;
    if (e.edge_opacity != null) edge.opacity = e.edge_opacity;
    edges.push(edge);
  }

  logger.info(`[temporal] Snapshot at ${snapshotDate}: ${nodes.length} nodes, ${edges.length} edges`);
  return { nodes, edges, snapshotDate };
}

/**
 * Node features for ML/visualization.
 * Reads from the node_features materialized view which aggregates
 * structural and attribute features per graph node.
 */
export async function getNodeFeatures() {
  const result = await pool.query(
    `SELECT node_id, node_type, label, degree, in_degree, out_degree,
            pagerank, betweenness, community_id, funding_m, momentum,
            employees, stage, founded, sector, region
     FROM node_features
     ORDER BY node_id`
  );
  return result.rows;
}

/**
 * Graph metrics history for a specific node.
 * Returns time-series of centrality metrics from graph_metrics_temporal.
 */
export async function getNodeMetricsHistory(nodeId) {
  const result = await pool.query(
    `SELECT node_id, snapshot_date, pagerank, betweenness, community_id,
            degree, in_degree, out_degree
     FROM graph_metrics_temporal
     WHERE node_id = $1
     ORDER BY snapshot_date`,
    [nodeId]
  );
  return result.rows;
}

/**
 * Stage transitions for a company.
 * Returns chronological list of stage changes with evidence metadata.
 */
export async function getStageTransitions(companyId) {
  const result = await pool.query(
    `SELECT id, company_id, from_stage, to_stage, transition_date,
            transition_year, confidence, evidence_type, evidence_source,
            created_at
     FROM stage_transitions
     WHERE company_id = $1
     ORDER BY transition_date`,
    [companyId]
  );
  return result.rows;
}
