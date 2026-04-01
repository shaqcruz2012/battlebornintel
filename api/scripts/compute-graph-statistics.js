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

  // Load historical edges with rel type for similarity signals
  const edgesRes = await pool.query(
    `SELECT source_id, target_id, rel FROM graph_edges
     WHERE edge_category = 'historical'`
  );

  // Build adjacency map (undirected) for PageRank
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

  // Load all registry nodes with metadata for similarity signals
  const allRegistryRes = await pool.query(
    `SELECT er.canonical_id, er.entity_type,
            c.sectors, c.region
     FROM entity_registry er
     LEFT JOIN companies c ON er.canonical_id = 'c_' || c.id::text
     ORDER BY er.canonical_id`
  );
  const nodeMetadata = new Map(); // canonical_id -> { type, sectors, region }
  for (const r of allRegistryRes.rows) {
    allNodes.add(r.canonical_id);
    if (!adj.has(r.canonical_id)) adj.set(r.canonical_id, []);
    nodeMetadata.set(r.canonical_id, {
      type: r.entity_type,
      sectors: r.sectors || [],
      region: r.region || '',
    });
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

  // ── Hybrid Multi-Signal Community Detection ──────────────────────────────
  // Build similarity edges from multiple signals, then run Louvain on them
  console.log('  Building multi-signal similarity graph...');

  const simEdges = [];
  const historicalEdges = edgesRes.rows;

  // Signal 1: Historical edges (weight 3.0)
  for (const e of historicalEdges) {
    simEdges.push({ source: e.source_id, target: e.target_id, weight: 3.0 });
  }

  // Signal 2: Shared investor co-investment (weight 2.0)
  const fundPortfolios = {};
  for (const e of historicalEdges) {
    if (e.rel !== 'invested_in' && e.rel !== 'funded' && e.rel !== 'funded_by') continue;
    const fundId = e.source_id.startsWith('f_') ? e.source_id : e.target_id.startsWith('f_') ? e.target_id : null;
    const compId = e.source_id.startsWith('c_') ? e.source_id : e.target_id.startsWith('c_') ? e.target_id : null;
    if (fundId && compId) {
      if (!fundPortfolios[fundId]) fundPortfolios[fundId] = [];
      fundPortfolios[fundId].push(compId);
    }
  }
  let coInvestEdges = 0;
  for (const companies of Object.values(fundPortfolios)) {
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        simEdges.push({ source: companies[i], target: companies[j], weight: 2.0 });
        coInvestEdges++;
      }
    }
  }

  // Signal 3: Shared accelerator (weight 1.5)
  const accelPortfolios = {};
  for (const e of historicalEdges) {
    if (e.rel !== 'accelerated_by') continue;
    const accelId = e.target_id.startsWith('a_') ? e.target_id : e.source_id.startsWith('a_') ? e.source_id : null;
    const compId = e.source_id.startsWith('c_') ? e.source_id : e.target_id.startsWith('c_') ? e.target_id : null;
    if (accelId && compId) {
      if (!accelPortfolios[accelId]) accelPortfolios[accelId] = [];
      accelPortfolios[accelId].push(compId);
    }
  }
  let coAccelEdges = 0;
  for (const companies of Object.values(accelPortfolios)) {
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        simEdges.push({ source: companies[i], target: companies[j], weight: 1.5 });
        coAccelEdges++;
      }
    }
  }

  // Signal 4: Shared sector (weight 1.0, cap 30 per sector)
  const sectorMembers = {};
  for (const n of nodes) {
    const meta = nodeMetadata.get(n);
    if (!meta) continue;
    const sectors = Array.isArray(meta.sectors) ? meta.sectors : [meta.sectors];
    for (const s of sectors) {
      if (!s) continue;
      if (!sectorMembers[s]) sectorMembers[s] = [];
      sectorMembers[s].push(n);
    }
  }
  let sectorEdges = 0;
  for (const members of Object.values(sectorMembers)) {
    const capped = members.slice(0, 30);
    for (let i = 0; i < capped.length; i++) {
      for (let j = i + 1; j < capped.length; j++) {
        simEdges.push({ source: capped[i], target: capped[j], weight: 1.0 });
        sectorEdges++;
      }
    }
  }

  // Signal 5: Same region + same type (weight 0.5, cap 20 per group)
  const regionMembers = {};
  for (const n of nodes) {
    const meta = nodeMetadata.get(n);
    if (!meta) continue;
    const region = meta.region;
    if (!region || region === 'other' || region === 'statewide') continue;
    const key = `${region}_${meta.type}`;
    if (!regionMembers[key]) regionMembers[key] = [];
    regionMembers[key].push(n);
  }
  let regionEdges = 0;
  for (const members of Object.values(regionMembers)) {
    const capped = members.slice(0, 20);
    for (let i = 0; i < capped.length; i++) {
      for (let j = i + 1; j < capped.length; j++) {
        simEdges.push({ source: capped[i], target: capped[j], weight: 0.5 });
        regionEdges++;
      }
    }
  }

  // Deduplicate and sum weights for the same pair
  const pairWeights = new Map();
  for (const e of simEdges) {
    const key = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
    pairWeights.set(key, (pairWeights.get(key) || 0) + e.weight);
  }

  console.log(`  Similarity signals: historical=${historicalEdges.length}, co-invest=${coInvestEdges}, co-accel=${coAccelEdges}, sector=${sectorEdges}, region=${regionEdges}`);
  console.log(`  Deduplicated similarity edges: ${pairWeights.size}`);

  // Build weighted adjacency from similarity edges
  const wAdj = new Map();
  const degree_w = new Map();
  let totalWeight = 0;
  for (const n of nodes) {
    wAdj.set(n, new Map());
    degree_w.set(n, 0);
  }
  for (const [key, w] of pairWeights) {
    const [s, t] = key.split('|');
    if (!wAdj.has(s) || !wAdj.has(t)) continue;
    wAdj.get(s).set(t, (wAdj.get(s).get(t) || 0) + w);
    wAdj.get(t).set(s, (wAdj.get(t).get(s) || 0) + w);
    totalWeight += w;
  }
  for (const n of nodes) {
    let dw = 0;
    for (const w of wAdj.get(n).values()) dw += w;
    degree_w.set(n, dw);
  }
  const m2 = totalWeight || 1;

  function louvainPass(nodeComm, resolution) {
    let improved = true;
    let iterations = 0;
    while (improved && iterations < 50) {
      improved = false;
      iterations++;
      const commDegreeSum = new Map();
      for (const nd of nodes) {
        const c = nodeComm.get(nd);
        commDegreeSum.set(c, (commDegreeSum.get(c) || 0) + degree_w.get(nd));
      }
      const shuffled = [...nodes].sort(() => Math.random() - 0.5);
      for (const n of shuffled) {
        const neighbors = wAdj.get(n);
        if (!neighbors || neighbors.size === 0) continue;
        const currentComm = nodeComm.get(n);
        const ki = degree_w.get(n);
        const commWeights = new Map();
        for (const [nb, w] of neighbors) {
          const c = nodeComm.get(nb);
          commWeights.set(c, (commWeights.get(c) || 0) + w);
        }
        commDegreeSum.set(currentComm, (commDegreeSum.get(currentComm) || 0) - ki);

        let bestComm = currentComm;
        let bestGain = 0;
        for (const [c, wic] of commWeights) {
          if (c === currentComm) continue;
          const gain = wic / m2 - resolution * ki * (commDegreeSum.get(c) || 0) / (m2 * m2);
          const lossCurrent = (commWeights.get(currentComm) || 0) / m2 - resolution * ki * (commDegreeSum.get(currentComm) || 0) / (m2 * m2);
          const netGain = gain - lossCurrent;
          if (netGain > bestGain) {
            bestGain = netGain;
            bestComm = c;
          }
        }
        if (bestComm !== currentComm) {
          nodeComm.set(n, bestComm);
          commDegreeSum.set(bestComm, (commDegreeSum.get(bestComm) || 0) + ki);
          improved = true;
        } else {
          commDegreeSum.set(currentComm, (commDegreeSum.get(currentComm) || 0) + ki);
        }
      }
    }
  }

  function countComms(nodeComm) {
    return new Set(nodeComm.values()).size;
  }

  // Auto-tune resolution for ~12 communities (range 8-15)
  const TARGET_MIN = 8, TARGET_MAX = 15, TARGET = 12;
  let bestCommMap = new Map();
  let bestDist = Infinity;
  // Wide resolution range to handle the denser similarity graph
  let lo = 0.1, hi = 20.0;
  for (let attempt = 0; attempt < 15; attempt++) {
    const res = (lo + hi) / 2;
    const comm = new Map();
    let lc = 0;
    for (const n of nodes) comm.set(n, lc++);
    louvainPass(comm, res);
    const numC = countComms(comm);
    const dist = Math.abs(numC - TARGET);
    if (dist < bestDist) {
      bestDist = dist;
      bestCommMap = new Map(comm);
    }
    if (numC >= TARGET_MIN && numC <= TARGET_MAX) break;
    if (numC < TARGET) lo = res;
    else hi = res;
  }

  // Absorb singletons: assign isolated nodes to the nearest community
  const commSizes = new Map();
  for (const [n, c] of bestCommMap) {
    commSizes.set(c, (commSizes.get(c) || 0) + 1);
  }
  for (const n of nodes) {
    const c = bestCommMap.get(n);
    if (commSizes.get(c) > 1) continue;
    const neighbors = wAdj.get(n);
    if (!neighbors) continue;
    let bestNeighborComm = c;
    let bestW = 0;
    for (const [nb, w] of neighbors) {
      const nc = bestCommMap.get(nb);
      if (w > bestW && commSizes.get(nc) > 1) {
        bestW = w;
        bestNeighborComm = nc;
      }
    }
    if (bestNeighborComm !== c) {
      commSizes.set(c, commSizes.get(c) - 1);
      bestCommMap.set(n, bestNeighborComm);
      commSizes.set(bestNeighborComm, (commSizes.get(bestNeighborComm) || 0) + 1);
    }
  }
  // Second pass: absorb remaining singletons into ANY neighbor
  for (const n of nodes) {
    const c = bestCommMap.get(n);
    if (commSizes.get(c) > 1) continue;
    const neighbors = wAdj.get(n);
    if (!neighbors) continue;
    let bestNeighborComm = c;
    let bestW = 0;
    for (const [nb, w] of neighbors) {
      if (w > bestW) {
        bestW = w;
        bestNeighborComm = bestCommMap.get(nb);
      }
    }
    if (bestNeighborComm !== c) {
      commSizes.set(c, commSizes.get(c) - 1);
      bestCommMap.set(n, bestNeighborComm);
      commSizes.set(bestNeighborComm, (commSizes.get(bestNeighborComm) || 0) + 1);
    }
  }

  // Third pass: merge all small communities (< 3 members) into the largest community
  let largestComm = null;
  let largestSize = 0;
  for (const [c, size] of commSizes) {
    if (size > largestSize) { largestSize = size; largestComm = c; }
  }
  for (const n of nodes) {
    const c = bestCommMap.get(n);
    if (commSizes.get(c) < 3) {
      commSizes.set(c, commSizes.get(c) - 1);
      bestCommMap.set(n, largestComm);
      commSizes.set(largestComm, commSizes.get(largestComm) + 1);
    }
  }

  // Renumber communities to sequential IDs
  const community = new Map();
  const labelMap = new Map();
  let nextId = 1;
  for (const n of nodes) {
    const lbl = bestCommMap.get(n);
    if (!labelMap.has(lbl)) labelMap.set(lbl, nextId++);
    community.set(n, labelMap.get(lbl));
  }

  const communityCount = labelMap.size;
  console.log(`  Louvain converged with ${communityCount} communities (target: ~${TARGET})`);

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
