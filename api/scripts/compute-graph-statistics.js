/**
 * compute-graph-statistics.js
 *
 * Computes comprehensive graph statistics, creates a temporal snapshot,
 * and refreshes the graph_metrics_cache (PageRank + community detection).
 *
 * Usage: node scripts/compute-graph-statistics.js
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433', 10),
  user: process.env.PGUSER || 'bbi',
  password: process.env.PGPASSWORD || 'bbi_dev_password',
  database: process.env.PGDATABASE || 'battlebornintel',
});

// ── 1. Graph Statistics ────────────────────────────────────────────────────

async function computeGraphStatistics() {
  console.log('\n═══ Step 1: Computing Graph Statistics ═══\n');

  const [nodeRes, edgeRes, nodeTypesRes, edgeTypesRes, temporalRes, edgesByYearRes] =
    await Promise.all([
      pool.query('SELECT count(*)::int AS total FROM entity_registry'),
      pool.query('SELECT count(*)::int AS total FROM graph_edges'),
      pool.query(
        `SELECT entity_type, count(*)::int AS cnt
         FROM entity_registry GROUP BY entity_type ORDER BY cnt DESC`
      ),
      pool.query(
        `SELECT rel, count(*)::int AS cnt
         FROM graph_edges GROUP BY rel ORDER BY cnt DESC`
      ),
      pool.query(
        `SELECT min(valid_from) AS earliest,
                max(valid_from) AS latest
         FROM graph_edges WHERE valid_from IS NOT NULL`
      ),
      pool.query(
        `SELECT EXTRACT(YEAR FROM valid_from)::int AS yr, count(*)::int AS cnt
         FROM graph_edges WHERE valid_from IS NOT NULL
         GROUP BY yr ORDER BY yr`
      ),
    ]);

  const totalNodes = nodeRes.rows[0].total;
  const totalEdges = edgeRes.rows[0].total;
  const avgDegree = totalNodes > 0 ? (2 * totalEdges) / totalNodes : 0;
  const density =
    totalNodes > 1
      ? (2 * totalEdges) / (totalNodes * (totalNodes - 1))
      : 0;

  const nodeTypeDist = {};
  for (const r of nodeTypesRes.rows) {
    nodeTypeDist[r.entity_type] = r.cnt;
  }

  const edgeTypeDist = {};
  for (const r of edgeTypesRes.rows) {
    edgeTypeDist[r.rel] = r.cnt;
  }

  const earliest = temporalRes.rows[0].earliest;
  const latest = temporalRes.rows[0].latest;

  const edgesByYear = {};
  for (const r of edgesByYearRes.rows) {
    if (r.yr) edgesByYear[r.yr] = r.cnt;
  }

  let avgEdgesPerMonth = 0;
  if (earliest && latest) {
    const months =
      (new Date(latest) - new Date(earliest)) / (1000 * 60 * 60 * 24 * 30.44);
    const totalWithDates = Object.values(edgesByYear).reduce((a, b) => a + b, 0);
    avgEdgesPerMonth = months > 0 ? +(totalWithDates / months).toFixed(2) : 0;
  }

  const temporalCoverage = {
    earliest_edge: earliest ? earliest.toISOString() : null,
    latest_edge: latest ? latest.toISOString() : null,
    edges_by_year: edgesByYear,
    avg_edges_per_month: avgEdgesPerMonth,
  };

  await pool.query(
    `INSERT INTO graph_statistics
       (computed_at, total_nodes, total_edges, avg_degree, density,
        node_type_dist, edge_type_dist, temporal_coverage)
     VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7)`,
    [
      totalNodes,
      totalEdges,
      +avgDegree.toFixed(4),
      +density.toFixed(8),
      JSON.stringify(nodeTypeDist),
      JSON.stringify(edgeTypeDist),
      JSON.stringify(temporalCoverage),
    ]
  );

  console.log(`  Total nodes:  ${totalNodes}`);
  console.log(`  Total edges:  ${totalEdges}`);
  console.log(`  Avg degree:   ${avgDegree.toFixed(4)}`);
  console.log(`  Density:      ${density.toFixed(8)}`);
  console.log(`  Node types:   ${JSON.stringify(nodeTypeDist)}`);
  console.log(`  Edge types:   ${JSON.stringify(edgeTypeDist)}`);
  console.log(`  Temporal:     ${JSON.stringify(temporalCoverage)}`);
  console.log('  -> Inserted into graph_statistics');

  return { totalNodes, totalEdges, avgDegree, density, nodeTypeDist, edgeTypeDist, temporalCoverage };
}

// ── 2. Temporal Snapshot ───────────────────────────────────────────────────

async function createTemporalSnapshot(stats) {
  console.log('\n═══ Step 2: Creating Temporal Snapshot ═══\n');

  const [catRes, verifiedNodesRes, verifiedEdgesRes, avgConfRes, communityRes] =
    await Promise.all([
      pool.query(
        `SELECT edge_category, count(*)::int AS cnt
         FROM graph_edges GROUP BY edge_category`
      ),
      pool.query(
        'SELECT count(*)::int AS cnt FROM entity_registry WHERE verified = true'
      ),
      pool.query(
        'SELECT count(*)::int AS cnt FROM graph_edges WHERE verified = true'
      ),
      pool.query(
        'SELECT ROUND(AVG(confidence)::numeric, 4) AS avg FROM graph_edges WHERE confidence IS NOT NULL'
      ),
      pool.query(
        'SELECT count(DISTINCT community_id)::int AS cnt FROM graph_metrics_cache WHERE community_id IS NOT NULL'
      ),
    ]);

  const edgeCategories = {};
  for (const r of catRes.rows) {
    edgeCategories[r.edge_category || 'unknown'] = r.cnt;
  }

  const historicalEdgeCount = edgeCategories.historical || 0;
  const verifiedNodes = verifiedNodesRes.rows[0].cnt;
  const verifiedEdges = verifiedEdgesRes.rows[0].cnt;
  const avgConfidence = parseFloat(avgConfRes.rows[0].avg) || 0;
  const communities = communityRes.rows[0].cnt;

  const metadata = {
    entity_types: stats.nodeTypeDist,
    edge_categories: edgeCategories,
    verified_nodes: verifiedNodes,
    verified_edges: verifiedEdges,
    avg_confidence: avgConfidence,
    communities,
  };

  await pool.query(
    `INSERT INTO temporal_snapshots
       (snapshot_at, snapshot_type, node_count, edge_count, metadata)
     VALUES (NOW(), 'daily', $1, $2, $3)`,
    [stats.totalNodes, historicalEdgeCount, JSON.stringify(metadata)]
  );

  console.log(`  Node count:       ${stats.totalNodes}`);
  console.log(`  Edge count (hist): ${historicalEdgeCount}`);
  console.log(`  Verified nodes:   ${verifiedNodes}`);
  console.log(`  Verified edges:   ${verifiedEdges}`);
  console.log(`  Avg confidence:   ${avgConfidence}`);
  console.log(`  Communities:      ${communities}`);
  console.log(`  Metadata:         ${JSON.stringify(metadata)}`);
  console.log('  -> Inserted into temporal_snapshots');

  return metadata;
}

// ── 3. Graph Metrics Cache (PageRank + Community Detection) ────────────────

async function refreshGraphMetricsCache() {
  console.log('\n═══ Step 3: Refreshing Graph Metrics Cache ═══\n');

  // Load historical edges only
  const edgesRes = await pool.query(
    `SELECT source_id, target_id FROM graph_edges
     WHERE edge_category = 'historical'`
  );

  // Build adjacency map (undirected)
  const adj = new Map();
  const allNodes = new Set();

  for (const e of edgesRes.rows) {
    allNodes.add(e.source_id);
    allNodes.add(e.target_id);
    if (!adj.has(e.source_id)) adj.set(e.source_id, []);
    if (!adj.has(e.target_id)) adj.set(e.target_id, []);
    adj.get(e.source_id).push(e.target_id);
    adj.get(e.target_id).push(e.source_id);
  }

  // Also include nodes with no historical edges
  const allRegistryRes = await pool.query(
    'SELECT canonical_id FROM entity_registry'
  );
  for (const r of allRegistryRes.rows) {
    allNodes.add(r.canonical_id);
    if (!adj.has(r.canonical_id)) adj.set(r.canonical_id, []);
  }

  const nodes = [...allNodes];
  const N = nodes.length;
  console.log(`  Loaded ${edgesRes.rows.length} historical edges across ${N} nodes`);

  // ── PageRank (20 iterations, damping 0.85) ──
  const damping = 0.85;
  const iterations = 20;
  let pr = new Map();
  const initVal = 1.0 / N;
  for (const n of nodes) pr.set(n, initVal);

  for (let i = 0; i < iterations; i++) {
    const newPr = new Map();
    for (const n of nodes) {
      let incoming = 0;
      const neighbors = adj.get(n) || [];
      for (const nb of neighbors) {
        const nbDeg = (adj.get(nb) || []).length;
        if (nbDeg > 0) incoming += pr.get(nb) / nbDeg;
      }
      newPr.set(n, (1 - damping) / N + damping * incoming);
    }
    pr = newPr;
  }

  // Normalize PageRank to 0-100 integer scale
  let maxPr = 0;
  for (const v of pr.values()) {
    if (v > maxPr) maxPr = v;
  }

  const prScaled = new Map();
  for (const [k, v] of pr) {
    prScaled.set(k, maxPr > 0 ? Math.round((v / maxPr) * 100) : 0);
  }

  // ── Label Propagation Community Detection (10 iterations) ──
  const community = new Map();
  let labelCounter = 0;
  for (const n of nodes) {
    community.set(n, labelCounter++);
  }

  for (let i = 0; i < 10; i++) {
    // Shuffle order each iteration
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    let changed = 0;
    for (const n of shuffled) {
      const neighbors = adj.get(n) || [];
      if (neighbors.length === 0) continue;

      // Count neighbor labels
      const labelCounts = new Map();
      for (const nb of neighbors) {
        const lbl = community.get(nb);
        labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);
      }

      // Pick most frequent label
      let bestLabel = community.get(n);
      let bestCount = 0;
      for (const [lbl, cnt] of labelCounts) {
        if (cnt > bestCount) {
          bestCount = cnt;
          bestLabel = lbl;
        }
      }

      if (community.get(n) !== bestLabel) {
        community.set(n, bestLabel);
        changed++;
      }
    }
    if (changed === 0) {
      console.log(`  Label propagation converged at iteration ${i + 1}`);
      break;
    }
  }

  // Renumber communities to sequential IDs
  const labelMap = new Map();
  let nextId = 1;
  for (const n of nodes) {
    const lbl = community.get(n);
    if (!labelMap.has(lbl)) labelMap.set(lbl, nextId++);
    community.set(n, labelMap.get(lbl));
  }

  const communityCount = labelMap.size;

  // ── Betweenness approximation (degree-based proxy) ──
  // Scale: degree / max_degree * 100
  let maxDegree = 0;
  const degrees = new Map();
  for (const n of nodes) {
    const deg = (adj.get(n) || []).length;
    degrees.set(n, deg);
    if (deg > maxDegree) maxDegree = deg;
  }

  const betweenness = new Map();
  for (const n of nodes) {
    betweenness.set(
      n,
      maxDegree > 0 ? Math.round((degrees.get(n) / maxDegree) * 100) : 0
    );
  }

  // ── Write to database ──
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM graph_metrics_cache');

    // Batch insert in chunks of 200
    const chunkSize = 200;
    for (let i = 0; i < nodes.length; i += chunkSize) {
      const chunk = nodes.slice(i, i + chunkSize);
      const values = [];
      const params = [];
      let idx = 1;
      for (const n of chunk) {
        values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, NOW())`);
        params.push(n, prScaled.get(n), betweenness.get(n), community.get(n));
        idx += 4;
      }
      await client.query(
        `INSERT INTO graph_metrics_cache (node_id, pagerank, betweenness, community_id, computed_at)
         VALUES ${values.join(', ')}`,
        params
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Top 5 hub nodes by PageRank
  const topHubs = [...prScaled.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log(`  Communities detected: ${communityCount}`);
  console.log(`  Nodes cached: ${nodes.length}`);
  console.log('  Top 5 hub nodes (by PageRank):');
  for (const [nodeId, score] of topHubs) {
    const deg = degrees.get(nodeId);
    const comm = community.get(nodeId);
    console.log(`    ${nodeId}  PR=${score}  degree=${deg}  community=${comm}`);
  }
  console.log('  -> Refreshed graph_metrics_cache');

  return { communityCount, topHubs, nodesProcessed: nodes.length };
}

// ── 4. Final Summary ──────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   BattleBornIntel — Graph Statistics Computation         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    const stats = await computeGraphStatistics();
    const snapshotMeta = await createTemporalSnapshot(stats);
    const metricsInfo = await refreshGraphMetricsCache();

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   FINAL SUMMARY                                         ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Total nodes:          ${String(stats.totalNodes).padStart(8)}`);
    console.log(`║  Total edges:          ${String(stats.totalEdges).padStart(8)}`);
    console.log(`║  Avg degree:           ${String(stats.avgDegree.toFixed(4)).padStart(8)}`);
    console.log(`║  Density:              ${String(stats.density.toFixed(8)).padStart(12)}`);
    console.log(`║  Communities:          ${String(metricsInfo.communityCount).padStart(8)}`);
    console.log(`║  Verified nodes:       ${String(snapshotMeta.verified_nodes).padStart(8)}`);
    console.log(`║  Verified edges:       ${String(snapshotMeta.verified_edges).padStart(8)}`);
    console.log(`║  Avg confidence:       ${String(snapshotMeta.avg_confidence).padStart(8)}`);
    console.log(`║  Nodes in cache:       ${String(metricsInfo.nodesProcessed).padStart(8)}`);
    console.log(`║  Elapsed:              ${elapsed}s`);
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║  Schedule note: Run daily via cron or task scheduler     ║');
    console.log('║    crontab: 0 2 * * * node scripts/compute-graph-statistics.js');
    console.log('╚═══════════════════════════════════════════════════════════╝');
  } catch (err) {
    console.error('FATAL:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
