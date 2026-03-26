/**
 * Graph analytics — PageRank, Betweenness Centrality, Community Detection, Watchlist.
 * Pure computation on (nodes, edges) arrays.
 *
 * @param {Array<{ id: string, type: string, label?: string, funding?: number }>} nodes
 * @param {Array<{ source: string|Object, target: string|Object }>} edges
 * @returns {{
 *   pagerank: Record<string, number>,
 *   betweenness: Record<string, number>,
 *   communities: Record<string, number>,
 *   communityNames: Record<string, string>,
 *   watchlist: Array<Object>,
 *   numCommunities: number
 * }}
 */
export function computeGraphMetrics(nodes, edges) {
  if (!nodes.length)
    return { pagerank: {}, betweenness: {}, communities: {}, watchlist: [], numCommunities: 0 };

  const ids = nodes.map((n) => n.id);
  const idx = {};
  ids.forEach((id, i) => { idx[id] = i; });
  const N = ids.length;

  // Build weighted adjacency list (undirected)
  // adj[i] stores neighbor indices; wadj[i] stores {neighbor, weight} for PageRank
  const adj = Array.from({ length: N }, () => []);
  const wadj = Array.from({ length: N }, () => []);  // weighted adjacency
  const outWeightSum = new Float64Array(N).fill(0);   // sum of outgoing weights per node

  for (const e of edges) {
    const si = idx[typeof e.source === 'object' ? e.source.id : e.source];
    const ti = idx[typeof e.target === 'object' ? e.target.id : e.target];
    if (si !== undefined && ti !== undefined && si !== ti) {
      const w = parseFloat(e.weight) || 0.5;
      adj[si].push(ti);
      adj[ti].push(si);
      wadj[si].push({ neighbor: ti, weight: w });
      wadj[ti].push({ neighbor: si, weight: w });
      outWeightSum[si] += w;
      outWeightSum[ti] += w;
    }
  }

  // PageRank (power iteration, damping=0.85, 40 iterations)
  // Distributes rank proportional to edge weight instead of equally
  const d = 0.85;
  let pr = new Float64Array(N).fill(1 / N);
  for (let iter = 0; iter < 40; iter++) {
    const next = new Float64Array(N).fill((1 - d) / N);
    for (let i = 0; i < N; i++) {
      if (wadj[i].length > 0) {
        const totalW = outWeightSum[i];
        for (const { neighbor: j, weight: w } of wadj[i]) {
          next[j] += d * pr[i] * (w / totalW);
        }
      } else {
        for (let j = 0; j < N; j++) next[j] += (d * pr[i]) / N;
      }
    }
    pr = next;
  }
  const prMax = Math.max(...pr);
  const prMin = Math.min(...pr);
  const prRange = prMax - prMin || 1;
  const pagerank = {};
  ids.forEach((id, i) => { pagerank[id] = Math.round(((pr[i] - prMin) / prRange) * 100); });

  // Betweenness Centrality (Brandes' algorithm)
  const bc = new Float64Array(N).fill(0);
  for (let s = 0; s < N; s++) {
    const stack = [];
    const pred = Array.from({ length: N }, () => []);
    const sigma = new Float64Array(N).fill(0);
    sigma[s] = 1;
    const dist = new Int32Array(N).fill(-1);
    dist[s] = 0;
    const queue = [s];
    let qi = 0;
    while (qi < queue.length) {
      const v = queue[qi++];
      stack.push(v);
      for (const w of adj[v]) {
        if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w); }
        if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; pred[w].push(v); }
      }
    }
    const delta = new Float64Array(N).fill(0);
    while (stack.length) {
      const w = stack.pop();
      for (const v of pred[w]) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      if (w !== s) bc[w] += delta[w];
    }
  }
  const bcMax = Math.max(...bc) || 1;
  const betweenness = {};
  ids.forEach((id, i) => { betweenness[id] = Math.round((bc[i] / bcMax) * 100); });

  // Community Detection (Label Propagation)
  const labels = Array.from({ length: N }, (_, i) => i);
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    const order = [...Array(N).keys()].sort(() => Math.random() - 0.5);
    for (const i of order) {
      if (adj[i].length === 0) continue;
      const freq = {};
      for (const j of adj[i]) freq[labels[j]] = (freq[labels[j]] || 0) + 1;
      const maxFreq = Math.max(...Object.values(freq));
      const candidates = Object.entries(freq)
        .filter(([, f]) => f === maxFreq)
        .map(([l]) => parseInt(l));
      const newLabel = candidates[Math.floor(Math.random() * candidates.length)];
      if (newLabel !== labels[i]) { labels[i] = newLabel; changed = true; }
    }
    if (!changed) break;
  }

  const labelMap = {};
  let nextCid = 0;
  const communities = {};
  ids.forEach((id, i) => {
    if (labelMap[labels[i]] === undefined) labelMap[labels[i]] = nextCid++;
    communities[id] = labelMap[labels[i]];
  });

  // Structural Watchlist
  const watchlist = [];
  const nodeMap = {};
  nodes.forEach((n) => { nodeMap[n.id] = n; });

  ids.forEach((id, i) => {
    const n = nodeMap[id];
    if (!n || n.type !== 'company') return;
    const degree = adj[i].length;
    const prScore = pagerank[id];
    const bcScore = betweenness[id];
    const funding = n.funding || 0;
    const signals = [];

    if (funding > 50 && degree <= 3)
      signals.push({ type: 'undercovered', label: 'High funding, few connections', severity: Math.min(100, Math.round(funding / 10)), icon: 'eye' });
    if (bcScore > 60)
      signals.push({ type: 'bridge', label: 'Structural bridge between clusters', severity: bcScore, icon: 'bridge' });
    if (prScore > 50 && funding < 100)
      signals.push({ type: 'hidden_influence', label: 'Structurally important beyond funding', severity: prScore, icon: 'crystal' });
    if (funding > 200 && prScore < 20)
      signals.push({ type: 'isolated_capital', label: 'Large funding but low graph connectivity', severity: Math.round(funding / 50), icon: 'island' });
    if (degree >= 8)
      signals.push({ type: 'hub', label: `Hub node: ${degree} connections`, severity: degree * 5, icon: 'star' });

    if (signals.length > 0) {
      watchlist.push({
        id, name: n.label || n.name, degree, pagerank: prScore,
        betweenness: bcScore, funding, signals,
        priority: signals.reduce((s, sig) => s + sig.severity, 0),
      });
    }
  });

  watchlist.sort((a, b) => b.priority - a.priority);

  // ── Community Naming ──
  // Auto-generate descriptive names for each community based on member attributes.
  const communityMembers = {};  // cid -> [node]
  ids.forEach((id, i) => {
    const cid = communities[id];
    if (!communityMembers[cid]) communityMembers[cid] = [];
    const n = nodeMap[id];
    communityMembers[cid].push({ ...n, degree: adj[i].length });
  });

  const communityNames = {};
  for (const [cid, members] of Object.entries(communityMembers)) {
    communityNames[cid] = nameCommunity(members);
  }

  return { pagerank, betweenness, communities, communityNames, watchlist, numCommunities: nextCid };
}

/* ── Community Naming ── */

/**
 * Generate a human-readable name for a community based on its members.
 *
 * Strategy priority:
 *   1. Dominant sector (most common sector tag across members)
 *   2. Dominant region (most common region)
 *   3. Hub node label (highest degree member)
 *   4. Dominant node type
 *
 * Produces names like: "AI · Las Vegas", "CleanTech · Reno", "BBV Portfolio"
 */
function nameCommunity(members) {
  if (!members || members.length === 0) return 'Empty Cluster';

  // Sector frequency
  const sectorCounts = {};
  members.forEach(m => {
    const sectors = m.sector || m.sectors || [];
    const sArr = Array.isArray(sectors) ? sectors : [sectors];
    sArr.forEach(s => {
      if (s) sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });
  });
  const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];

  // Region frequency
  const regionCounts = {};
  members.forEach(m => {
    if (m.region) regionCounts[m.region] = (regionCounts[m.region] || 0) + 1;
  });
  const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];

  // Hub node (highest degree)
  const sorted = [...members].sort((a, b) => (b.degree || 0) - (a.degree || 0));
  const hubNode = sorted[0];

  // Dominant node type
  const typeCounts = {};
  members.forEach(m => {
    if (m.type) typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  // Region display name mapping
  const regionNames = {
    las_vegas: 'Las Vegas',
    reno: 'Reno',
    henderson: 'Henderson',
    'reno-sparks': 'Reno-Sparks',
    rural: 'Rural NV',
    statewide: 'Statewide',
  };

  const parts = [];
  if (topSector && topSector[1] >= 2) parts.push(topSector[0]);
  if (topRegion && topRegion[1] >= 2) parts.push(regionNames[topRegion[0]] || titleCase(topRegion[0]));

  // If we have nothing descriptive yet, use hub node or dominant type
  if (!parts.length) {
    if (hubNode && hubNode.label && hubNode.label !== hubNode.id) {
      parts.push(hubNode.label);
    } else if (topType) {
      parts.push(titleCase(topType[0]) + ' Group');
    }
  }

  // If still empty, generic fallback
  if (!parts.length) return `Cluster ${members.length}`;

  return parts.join(' \u00B7 ');
}

function titleCase(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
