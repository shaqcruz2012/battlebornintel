import pool from '../db/pool.js';
import { getGraphData } from '../db/queries/graph.js';
import { computeGraphMetrics } from '../engine/graph-metrics.js';
import logger from '../logger.js';

// ── K-Means Implementation ──────────────────────────────────────────────────

function kmeans(vectors, k, maxIter = 50) {
  const n = vectors.length;
  const d = vectors[0].length;
  if (n <= k) return vectors.map((_, i) => i);

  // Initialize centroids using k-means++
  const centroids = [vectors[Math.floor(Math.random() * n)].slice()];
  for (let c = 1; c < k; c++) {
    const dists = vectors.map(v => {
      let minD = Infinity;
      for (const cent of centroids) {
        let dist = 0;
        for (let j = 0; j < d; j++) dist += (v[j] - cent[j]) ** 2;
        minD = Math.min(minD, dist);
      }
      return minD;
    });
    const total = dists.reduce((s, x) => s + x, 0);
    let r = Math.random() * total;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) { centroids.push(vectors[i].slice()); break; }
    }
    if (centroids.length <= c) {
      centroids.push(vectors[Math.floor(Math.random() * n)].slice());
    }
  }

  const assignments = new Int32Array(n);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    // Assign each point to nearest centroid
    for (let i = 0; i < n; i++) {
      let bestC = 0, bestD = Infinity;
      for (let c = 0; c < k; c++) {
        let dist = 0;
        for (let j = 0; j < d; j++) dist += (vectors[i][j] - centroids[c][j]) ** 2;
        if (dist < bestD) { bestD = dist; bestC = c; }
      }
      if (assignments[i] !== bestC) { assignments[i] = bestC; changed = true; }
    }
    if (!changed) break;

    // Update centroids
    const counts = new Int32Array(k);
    const sums = Array.from({ length: k }, () => new Float64Array(d));
    for (let i = 0; i < n; i++) {
      counts[assignments[i]]++;
      for (let j = 0; j < d; j++) sums[assignments[i]][j] += vectors[i][j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < d; j++) centroids[c][j] = sums[c][j] / counts[c];
      }
    }
  }

  return Array.from(assignments);
}

// ── Feature Vector Builder ──────────────────────────────────────────────────

// Sector encoding — top 20 sectors get a dimension
const TOP_SECTORS = [
  'AI', 'Cybersecurity', 'Defense', 'Cleantech', 'Biotech', 'Fintech',
  'Healthcare', 'Cloud', 'Data Center', 'Energy', 'Robotics', 'Mining',
  'Gaming', 'Aerospace', 'Satellite', 'Water', 'Identity', 'Analytics',
  'Construction', 'IoT'
];

const STAGE_ORDINAL = {
  'pre_seed': 0, 'seed': 1, 'series_a': 2, 'series_b': 3,
  'series_c_plus': 4, 'growth': 5, 'public': 6,
};

function buildFeatureVector(node, scores) {
  const dims = scores?.dims || {};
  const sectors = Array.isArray(node.sector)
    ? node.sector
    : [node.sector].filter(Boolean);

  // Normalize funding to 0-1 range (log scale, cap at $1B)
  const fundingNorm = node.funding > 0
    ? Math.min(Math.log10(node.funding + 1) / 3, 1)
    : 0;
  const momentumNorm = (node.momentum || 0) / 100;
  const employeesNorm = node.employees > 0
    ? Math.min(Math.log10(node.employees + 1) / 3, 1)
    : 0;
  const irsNorm = (scores?.irs_score || 50) / 100;

  // IRS dimensions (0-100 normalized to 0-1)
  const dimMom = (dims.momentum || 50) / 100;
  const dimFv = (dims.funding_velocity || 50) / 100;
  const dimMkt = (dims.market_timing || 50) / 100;
  const dimHire = (dims.hiring || 50) / 100;
  const dimDq = (dims.data_quality || 50) / 100;
  const dimNet = (dims.network || 50) / 100;
  const dimTeam = (dims.team || 50) / 100;

  // Stage ordinal (0-1)
  const stageVal = (STAGE_ORDINAL[node.stage] ?? 2) / 6;

  // Region one-hot (3 dims: las_vegas, reno, other)
  const region = (node.region || '').toLowerCase();
  const regLV = region.includes('las vegas') || region === 'las_vegas' ? 1 : 0;
  const regReno = region.includes('reno') ? 1 : 0;
  const regOther = (!regLV && !regReno) ? 1 : 0;

  // Sector encoding (top 20 one-hot)
  const sectorVec = TOP_SECTORS.map(s =>
    sectors.some(ns => ns?.toLowerCase() === s.toLowerCase()) ? 1 : 0
  );

  return [
    fundingNorm, momentumNorm, employeesNorm, irsNorm,
    dimMom, dimFv, dimMkt, dimHire, dimDq, dimNet, dimTeam,
    stageVal, regLV, regReno, regOther,
    ...sectorVec,
  ];
}

// ── Cluster Naming ──────────────────────────────────────────────────────────

function nameKmeansCluster(members) {
  const sectorCounts = {};
  const stageCounts = {};
  let totalFunding = 0;

  for (const m of members) {
    const sectors = Array.isArray(m.sector)
      ? m.sector
      : [m.sector].filter(Boolean);
    sectors.forEach(s => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; });
    if (m.stage) stageCounts[m.stage] = (stageCounts[m.stage] || 0) + 1;
    totalFunding += m.funding || 0;
  }

  const topSector = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
  const topStage = Object.entries(stageCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const avgFunding = members.length > 0 ? totalFunding / members.length : 0;
  const fundingLabel = avgFunding >= 100
    ? 'High-Cap'
    : avgFunding >= 20 ? 'Mid-Cap' : 'Early';

  const stageLabel = topStage
    .replace(/_/g, ' ')
    .replace('series ', 'S')
    .replace('plus', '+');
  return `${topSector} ${fundingLabel} (${stageLabel})`.trim();
}

// ── Degree Counting Helper ──────────────────────────────────────────────────

function buildDegreeMap(nodes, edges) {
  const degree = {};
  for (const n of nodes) degree[n.id] = 0;
  for (const e of edges) {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    if (degree[src] !== undefined) degree[src]++;
    if (degree[tgt] !== undefined) degree[tgt]++;
  }
  return degree;
}

// ── Main Compute + Persist ──────────────────────────────────────────────────

export async function recomputeGraphAnalytics() {
  logger.info('[GraphAnalytics] Starting recomputation...');
  const start = Date.now();

  // 1. Load graph data
  const graphData = await getGraphData({
    nodeTypes: ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'],
    yearMax: 2026,
  });
  const { nodes, edges } = graphData;
  logger.info(`[GraphAnalytics] Loaded ${nodes.length} nodes, ${edges.length} edges`);

  // 2. Run existing graph metrics (PageRank, betweenness, community detection)
  const metrics = computeGraphMetrics(nodes, edges);
  logger.info(
    `[GraphAnalytics] Computed metrics: ${Object.keys(metrics.communities).length} community assignments, ${metrics.numCommunities} communities`
  );

  // 3. Load IRS scores for company nodes
  const companyIds = nodes
    .filter(n => n.type === 'company')
    .map(n => {
      const match = n.id.match(/^c_(\d+)$/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(Boolean);

  let scoresMap = {};
  if (companyIds.length > 0) {
    try {
      const { rows: scores } = await pool.query(
        `SELECT company_id, irs_score, dims FROM computed_scores
         WHERE company_id = ANY($1::int[])
         AND computed_at = (
           SELECT MAX(computed_at) FROM computed_scores cs2
           WHERE cs2.company_id = computed_scores.company_id
         )`,
        [companyIds]
      );
      scores.forEach(s => { scoresMap[`c_${s.company_id}`] = s; });
    } catch (err) {
      logger.warn('[GraphAnalytics] Could not load IRS scores', { error: err });
    }
  }

  // 4. Build feature vectors for company nodes and run K-means
  const companyNodes = nodes.filter(n => n.type === 'company');
  const vectors = companyNodes.map(n => buildFeatureVector(n, scoresMap[n.id]));

  // Choose k based on data size: sqrt(n/2) is a reasonable heuristic
  const k = Math.max(3, Math.min(15, Math.round(Math.sqrt(companyNodes.length / 2))));
  logger.info(`[GraphAnalytics] Running K-means with k=${k} on ${companyNodes.length} company nodes`);

  const kmeansAssignments = vectors.length > 0 ? kmeans(vectors, k) : [];

  // Build kmeans cluster map: nodeId -> clusterId
  const kmeansMap = {};
  companyNodes.forEach((n, i) => { kmeansMap[n.id] = kmeansAssignments[i]; });

  // 5. Name K-means clusters
  const kmeansGroups = {};
  companyNodes.forEach((n, i) => {
    const cid = kmeansAssignments[i];
    if (!kmeansGroups[cid]) kmeansGroups[cid] = [];
    kmeansGroups[cid].push(n);
  });
  const kmeansNames = {};
  for (const [cid, members] of Object.entries(kmeansGroups)) {
    kmeansNames[cid] = nameKmeansCluster(members);
  }

  // 6. Pre-compute degree map
  const degreeMap = buildDegreeMap(nodes, edges);

  // 7. Persist to graph_analytics
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM graph_analytics');
    await client.query('DELETE FROM graph_clusters');

    // Insert node analytics in chunks of 100
    const CHUNK = 100;
    for (let i = 0; i < nodes.length; i += CHUNK) {
      const chunk = nodes.slice(i, i + CHUNK);
      const values = [];
      const params = [];
      let pi = 1;

      for (const n of chunk) {
        const pr = metrics.pagerank[n.id] || 0;
        const bc = metrics.betweenness[n.id] || 0;
        const commId = metrics.communities[n.id] ?? null;
        const commName = commId != null
          ? (metrics.communityNames?.[commId] || null)
          : null;
        const km = kmeansMap[n.id] ?? null;
        const kmLabel = km != null ? (kmeansNames[km] || null) : null;
        const degree = degreeMap[n.id] || 0;

        values.push(
          `($${pi}, $${pi+1}, $${pi+2}, $${pi+3}, $${pi+4}, $${pi+5}, $${pi+6}, $${pi+7}, $${pi+8})`
        );
        params.push(n.id, n.type, pr, bc, degree, commId, commName, km, kmLabel);
        pi += 9;
      }

      if (values.length > 0) {
        await client.query(
          `INSERT INTO graph_analytics
             (node_id, node_type, pagerank, betweenness, degree,
              community_id, community_name, kmeans_cluster, kmeans_label)
           VALUES ${values.join(', ')}`,
          params
        );
      }
    }

    // Insert community cluster metadata
    const communityMembers = {};
    nodes.forEach(n => {
      const cid = metrics.communities[n.id];
      if (cid == null) return;
      if (!communityMembers[cid]) communityMembers[cid] = [];
      communityMembers[cid].push(n);
    });

    for (const [cid, members] of Object.entries(communityMembers)) {
      const avgPr = members.reduce((s, m) => s + (metrics.pagerank[m.id] || 0), 0) / members.length;
      const avgBc = members.reduce((s, m) => s + (metrics.betweenness[m.id] || 0), 0) / members.length;
      const companyMembers = members.filter(m => m.type === 'company');
      const avgFunding = companyMembers.length > 0
        ? companyMembers.reduce((s, m) => s + (m.funding || 0), 0) / companyMembers.length
        : 0;
      const sectors = {};
      members.forEach(m => {
        const s = Array.isArray(m.sector) ? m.sector : [m.sector].filter(Boolean);
        s.forEach(sec => { sectors[sec] = (sectors[sec] || 0) + 1; });
      });
      const topSectors = Object.entries(sectors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s]) => s);
      const topMembers = [...members]
        .sort((a, b) => (metrics.pagerank[b.id] || 0) - (metrics.pagerank[a.id] || 0))
        .slice(0, 5)
        .map(m => m.label || m.id);

      await client.query(
        `INSERT INTO graph_clusters
           (cluster_type, cluster_id, name, member_count,
            avg_pagerank, avg_betweenness, avg_funding, top_sectors, top_members)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'community', parseInt(cid),
          metrics.communityNames?.[cid] || `Community ${cid}`,
          members.length, avgPr, avgBc, avgFunding, topSectors, topMembers,
        ]
      );
    }

    // Insert K-means cluster metadata
    for (const [cid, members] of Object.entries(kmeansGroups)) {
      const avgPr = members.reduce((s, m) => s + (metrics.pagerank[m.id] || 0), 0) / members.length;
      const avgFunding = members.reduce((s, m) => s + (m.funding || 0), 0) / members.length;
      const sectors = {};
      members.forEach(m => {
        const s = Array.isArray(m.sector) ? m.sector : [m.sector].filter(Boolean);
        s.forEach(sec => { sectors[sec] = (sectors[sec] || 0) + 1; });
      });
      const topSectors = Object.entries(sectors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s]) => s);
      const topMembers = [...members]
        .sort((a, b) => (b.funding || 0) - (a.funding || 0))
        .slice(0, 5)
        .map(m => m.label || m.id);

      await client.query(
        `INSERT INTO graph_clusters
           (cluster_type, cluster_id, name, member_count,
            avg_pagerank, avg_betweenness, avg_funding, top_sectors, top_members)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        ['kmeans', parseInt(cid), kmeansNames[cid], members.length, avgPr, 0, avgFunding, topSectors, topMembers]
      );
    }

    await client.query('COMMIT');
    const elapsed = Date.now() - start;
    logger.info(
      `[GraphAnalytics] Persisted ${nodes.length} node analytics + ` +
      `${Object.keys(communityMembers).length} communities + ` +
      `${Object.keys(kmeansGroups).length} K-means clusters in ${elapsed}ms`
    );

    return {
      nodes: nodes.length,
      edges: edges.length,
      communities: Object.keys(communityMembers).length,
      kmeansClusters: Object.keys(kmeansGroups).length,
      elapsed,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Read pre-computed analytics ─────────────────────────────────────────────

export async function getNodeAnalytics() {
  const { rows } = await pool.query(
    'SELECT * FROM graph_analytics ORDER BY pagerank DESC'
  );
  return rows;
}

export async function getClusterSummaries(type = 'community') {
  const { rows } = await pool.query(
    'SELECT * FROM graph_clusters WHERE cluster_type = $1 ORDER BY member_count DESC',
    [type]
  );
  return rows;
}
