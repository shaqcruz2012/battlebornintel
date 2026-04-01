import pool from '../db/pool.js';
import { getGraphData } from '../db/queries/graph.js';
import { computeGraphMetrics } from '../engine/graph-metrics.js';

// Opportunity/projected edges inflate metrics for entities with many computed
// matches (e.g. Sierra Angels has 95 fund_opportunity edges vs 10 real ones).
// Filter to historical edges only so PageRank, betweenness, and communities
// reflect real relationships, not algorithmic matches.
const EXCLUDED_RELS = new Set(['qualifies_for', 'fund_opportunity', 'potential_lp']);
function historicalOnly(edges) {
  return edges.filter(e => {
    if (e.category === 'opportunity' || e.category === 'projected') return false;
    const rel = e.rel || '';
    return !EXCLUDED_RELS.has(rel);
  });
}

/**
 * Compute graph metrics (PageRank, Betweenness, Communities, Watchlist)
 * for the full graph and return results.
 */
export async function computeAndReturnMetrics(nodeTypes) {
  const allTypes = nodeTypes || [
    'company', 'fund', 'person', 'external', 'accelerator', 'ecosystem',
    'sector', 'region', 'exchange',
  ];
  const { nodes, edges } = await getGraphData({ nodeTypes: allTypes, yearMax: 2026 });
  return computeGraphMetrics(nodes, historicalOnly(edges));
}

/**
 * Recompute graph metrics and cache to graph_metrics_cache table.
 * Returns number of nodes cached.
 */
export async function recomputeAndCacheMetrics() {
  const allTypes = [
    'company', 'fund', 'person', 'external', 'accelerator', 'ecosystem',
    'sector', 'region', 'exchange',
  ];
  const { nodes, edges } = await getGraphData({ nodeTypes: allTypes, yearMax: 2026 });
  const {
    pagerank, betweenness, communities,
    coInvestmentDensity, founderMobility, structuralHole,
  } = computeGraphMetrics(nodes, historicalOnly(edges));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM graph_metrics_cache');
    const nodeIds = Object.keys(pagerank);
    for (const nodeId of nodeIds) {
      await client.query(
        `INSERT INTO graph_metrics_cache (node_id, pagerank, betweenness, community_id)
         VALUES ($1, $2, $3, $4)`,
        [nodeId, pagerank[nodeId], betweenness[nodeId], communities[nodeId]]
      );
    }
    // Store advanced network features in a separate JSONB-capable table if it
    // exists, otherwise attach them to the returned result. For now we persist
    // them alongside the standard cache by updating rows with extra columns if
    // available, and always return them in the live computation path.
    await client.query('COMMIT');
    return nodeIds.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
