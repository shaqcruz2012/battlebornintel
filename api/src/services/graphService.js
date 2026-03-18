import pool from '../db/pool.js';
import { getGraphData } from '../db/queries/graph.js';
import { computeGraphMetrics } from '../engine/graph-metrics.js';

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
  return computeGraphMetrics(nodes, edges);
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
  const { pagerank, betweenness, communities, communityNames } = computeGraphMetrics(nodes, edges);

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
    await client.query('COMMIT');
    return nodeIds.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
