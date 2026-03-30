import pool from '../pool.js';

/**
 * Get community assignments from graph_metrics_cache.
 * Returns nodes grouped by community_id.
 */
export async function getCommunities() {
  const result = await pool.query(`
    SELECT node_id, community_id, pagerank, betweenness
    FROM graph_metrics_cache
    WHERE community_id IS NOT NULL
    ORDER BY community_id, pagerank DESC
  `);

  // Group by community
  const communities = {};
  for (const row of result.rows) {
    const cid = row.community_id;
    if (!communities[cid]) communities[cid] = { id: cid, members: [] };
    communities[cid].members.push({
      nodeId: row.node_id,
      pagerank: parseFloat(row.pagerank),
      betweenness: parseFloat(row.betweenness),
    });
  }
  return Object.values(communities);
}

/**
 * Find shortest path between two nodes using BFS over graph_edges.
 * Returns array of node IDs forming the path.
 */
export async function findShortestPath(sourceId, targetId, maxDepth = 6) {
  // Use a recursive CTE for BFS
  const result = await pool.query(`
    WITH RECURSIVE paths AS (
      -- Base case: start from source
      SELECT
        source_id AS current_node,
        ARRAY[source_id] AS path,
        1 AS depth
      FROM graph_edges
      WHERE source_id = $1

      UNION ALL

      -- Recursive step: follow edges
      SELECT
        e.target_id,
        p.path || e.target_id,
        p.depth + 1
      FROM paths p
      JOIN graph_edges e ON e.source_id = p.current_node
      WHERE p.depth < $3
        AND NOT (e.target_id = ANY(p.path))  -- avoid cycles
        AND p.current_node != $2  -- stop if we found target
    )
    SELECT path, depth
    FROM paths
    WHERE current_node = $2
    ORDER BY depth
    LIMIT 1
  `, [sourceId, targetId, maxDepth]);

  return result.rows[0] || null;
}

/**
 * Get network statistics summary.
 */
export async function getNetworkStats() {
  const [nodeCount, edgeCount, avgDegree, topNodes, categoryDist] = await Promise.all([
    pool.query(`SELECT COUNT(DISTINCT node_id) as cnt FROM (
      SELECT source_id AS node_id FROM graph_edges UNION SELECT target_id FROM graph_edges
    ) n`),
    pool.query(`SELECT COUNT(*) as cnt FROM graph_edges`),
    pool.query(`SELECT AVG(deg)::numeric(6,2) as avg_deg FROM (
      SELECT source_id, COUNT(*) as deg FROM graph_edges GROUP BY source_id
    ) d`),
    pool.query(`
      SELECT node_id, pagerank, betweenness, community_id
      FROM graph_metrics_cache
      ORDER BY pagerank DESC NULLS LAST
      LIMIT 10
    `),
    pool.query(`
      SELECT edge_category, COUNT(*) as cnt
      FROM graph_edges
      GROUP BY edge_category
      ORDER BY cnt DESC
    `),
  ]);

  return {
    nodeCount: parseInt(nodeCount.rows[0]?.cnt || 0),
    edgeCount: parseInt(edgeCount.rows[0]?.cnt || 0),
    avgDegree: parseFloat(avgDegree.rows[0]?.avg_deg || 0),
    topNodes: topNodes.rows.map(r => ({
      nodeId: r.node_id,
      pagerank: parseFloat(r.pagerank),
      betweenness: parseFloat(r.betweenness),
      communityId: r.community_id,
    })),
    edgeCategoryDistribution: categoryDist.rows.map(r => ({
      category: r.edge_category || 'unknown',
      count: parseInt(r.cnt),
    })),
  };
}
