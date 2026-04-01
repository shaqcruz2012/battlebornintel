/**
 * Graph analytics — PageRank, Betweenness Centrality, Community Detection, Watchlist.
 * Pure computation on (nodes, edges) arrays.
 */

/**
 * Build a synthetic similarity graph from multiple signals so that Louvain
 * produces 10-15 meaningful clusters instead of 154 singletons.
 *
 * Signals (by weight):
 *   1. Historical edges           — 3.0 (strongest, real relationships)
 *   2. Shared investor co-invest  — 2.0
 *   3. Shared accelerator         — 1.5
 *   4. Shared sector membership   — 1.0
 *   5. Same region + same type    — 0.5
 */
function buildSimilarityEdges(nodes, historicalEdges) {
  const simEdges = [];
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Signal 1: Historical edges (weight 3.0 — strongest signal)
  for (const e of historicalEdges) {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    simEdges.push({ source: src, target: tgt, weight: 3.0 });
  }

  // Signal 2: Shared investor — if company A and B are both invested_in by fund F
  const fundPortfolios = {};
  for (const e of historicalEdges) {
    if (e.rel !== 'invested_in' && e.rel !== 'funded' && e.rel !== 'funded_by') continue;
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    const fundId = src.startsWith('f_') ? src : tgt.startsWith('f_') ? tgt : null;
    const compId = src.startsWith('c_') ? src : tgt.startsWith('c_') ? tgt : null;
    if (fundId && compId) {
      if (!fundPortfolios[fundId]) fundPortfolios[fundId] = [];
      fundPortfolios[fundId].push(compId);
    }
  }
  for (const companies of Object.values(fundPortfolios)) {
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        simEdges.push({ source: companies[i], target: companies[j], weight: 2.0 });
      }
    }
  }

  // Signal 3: Shared accelerator (weight 1.5)
  const accelPortfolios = {};
  for (const e of historicalEdges) {
    if (e.rel !== 'accelerated_by') continue;
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    const accelId = tgt.startsWith('a_') ? tgt : src.startsWith('a_') ? src : null;
    const compId = src.startsWith('c_') ? src : tgt.startsWith('c_') ? tgt : null;
    if (accelId && compId) {
      if (!accelPortfolios[accelId]) accelPortfolios[accelId] = [];
      accelPortfolios[accelId].push(compId);
    }
  }
  for (const companies of Object.values(accelPortfolios)) {
    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        simEdges.push({ source: companies[i], target: companies[j], weight: 1.5 });
      }
    }
  }

  // Signal 4: Shared sector membership (weight 1.0, cap 30 members per sector)
  const sectorMembers = {};
  for (const n of nodes) {
    const sectors = n.sectors || n.sector || [];
    const sectorArr = Array.isArray(sectors) ? sectors : [sectors];
    for (const s of sectorArr) {
      if (!s) continue;
      if (!sectorMembers[s]) sectorMembers[s] = [];
      sectorMembers[s].push(n.id);
    }
  }
  for (const members of Object.values(sectorMembers)) {
    const capped = members.slice(0, 30);
    for (let i = 0; i < capped.length; i++) {
      for (let j = i + 1; j < capped.length; j++) {
        simEdges.push({ source: capped[i], target: capped[j], weight: 1.0 });
      }
    }
  }

  // Signal 5: Same region + same node type (weight 0.5, cap 20 per group)
  const regionMembers = {};
  for (const n of nodes) {
    const region = n.region || '';
    if (!region || region === 'other' || region === 'statewide') continue;
    const key = `${region}_${n.type}`;
    if (!regionMembers[key]) regionMembers[key] = [];
    regionMembers[key].push(n.id);
  }
  for (const members of Object.values(regionMembers)) {
    const capped = members.slice(0, 20);
    for (let i = 0; i < capped.length; i++) {
      for (let j = i + 1; j < capped.length; j++) {
        simEdges.push({ source: capped[i], target: capped[j], weight: 0.5 });
      }
    }
  }

  // Deduplicate and sum weights for the same pair
  const pairWeights = {};
  for (const e of simEdges) {
    const key = e.source < e.target ? `${e.source}|${e.target}` : `${e.target}|${e.source}`;
    pairWeights[key] = (pairWeights[key] || 0) + e.weight;
  }

  return Object.entries(pairWeights).map(([key, weight]) => {
    const [source, target] = key.split('|');
    return { source, target, weight };
  });
}

/**
 * Generate human-readable community names from dominant characteristics.
 * Names reflect the most common sector, hub fund/accelerator, and region.
 */
function generateCommunityNames(nodes, edges, communities) {
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Group nodes by community
  const commMembers = {};
  for (const [id, cid] of Object.entries(communities)) {
    if (!commMembers[cid]) commMembers[cid] = [];
    commMembers[cid].push(id);
  }

  // Build edge degree per node within community context
  const nodeDegree = {};
  for (const e of edges) {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    nodeDegree[src] = (nodeDegree[src] || 0) + 1;
    nodeDegree[tgt] = (nodeDegree[tgt] || 0) + 1;
  }

  const communityNames = {};
  for (const [cidStr, members] of Object.entries(commMembers)) {
    const cid = parseInt(cidStr);
    const sectorCounts = {};
    const regionCounts = {};
    let hubNode = null;
    let hubDegree = 0;

    for (const id of members) {
      const n = nodeMap[id];
      if (!n) continue;

      // Count sectors
      const sectors = n.sectors || n.sector || [];
      const sectorArr = Array.isArray(sectors) ? sectors : [sectors];
      for (const s of sectorArr) {
        if (s) sectorCounts[s] = (sectorCounts[s] || 0) + 1;
      }

      // Count regions
      const region = n.region || '';
      if (region && region !== 'other' && region !== 'statewide') {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }

      // Track hub node (fund or accelerator with highest degree)
      if (n.type === 'fund' || n.type === 'accelerator') {
        const deg = nodeDegree[id] || 0;
        if (deg > hubDegree) { hubDegree = deg; hubNode = n; }
      }
    }

    // Pick top sector
    const topSector = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])[0];

    // Pick top region (only if >40% of members share it)
    const topRegion = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const regionConcentrated = topRegion && topRegion[1] > members.length * 0.4;

    // Build name
    const parts = [];
    if (topSector) parts.push(topSector[0]);
    if (regionConcentrated) parts.push(topRegion[0]);
    if (hubNode) parts.push(`(${hubNode.label || hubNode.name || hubNode.id})`);

    communityNames[cid] = parts.length > 0
      ? parts.join(' \u2014 ')
      : `Cluster ${cid}`;
  }

  return communityNames;
}

export function computeGraphMetrics(nodes, edges) {
  if (!nodes.length)
    return { pagerank: {}, betweenness: {}, communities: {}, communityNames: {}, watchlist: [], numCommunities: 0 };

  const ids = nodes.map((n) => n.id);
  const idx = {};
  ids.forEach((id, i) => { idx[id] = i; });
  const N = ids.length;

  // Build adjacency list from original edges (for PageRank, betweenness, watchlist)
  const adj = Array.from({ length: N }, () => []);
  for (const e of edges) {
    const si = idx[typeof e.source === 'object' ? e.source.id : e.source];
    const ti = idx[typeof e.target === 'object' ? e.target.id : e.target];
    if (si !== undefined && ti !== undefined && si !== ti) {
      adj[si].push(ti);
      adj[ti].push(si);
    }
  }

  // PageRank (power iteration, damping=0.85, 40 iterations)
  const d = 0.85;
  let pr = new Float64Array(N).fill(1 / N);
  for (let iter = 0; iter < 40; iter++) {
    const next = new Float64Array(N).fill((1 - d) / N);
    for (let i = 0; i < N; i++) {
      if (adj[i].length > 0) {
        const share = pr[i] / adj[i].length;
        for (const j of adj[i]) next[j] += d * share;
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

  // ── Community Detection (Hybrid multi-signal Louvain) ──────────────────
  // Build similarity edges from multiple signals (edges, co-investment,
  // co-acceleration, shared sector, same region) then run Louvain on them.
  const simEdges = buildSimilarityEdges(nodes, edges);

  // Build weighted adjacency from similarity edges
  const wAdj = Array.from({ length: N }, () => ({}));
  let totalWeight = 0;
  const degree_w = new Float64Array(N);
  for (const e of simEdges) {
    const si = idx[e.source];
    const ti = idx[e.target];
    if (si !== undefined && ti !== undefined && si !== ti) {
      wAdj[si][ti] = (wAdj[si][ti] || 0) + e.weight;
      wAdj[ti][si] = (wAdj[ti][si] || 0) + e.weight;
      totalWeight += e.weight;
    }
  }
  for (let i = 0; i < N; i++) {
    for (const j of Object.keys(wAdj[i])) degree_w[i] += wAdj[i][j];
  }
  const m2 = totalWeight || 1;

  function louvainPass(nodeComm, resolution) {
    let improved = true;
    let iterations = 0;
    while (improved && iterations < 50) {
      improved = false;
      iterations++;
      const commDegreeSum = {};
      for (let k = 0; k < N; k++) {
        const c = nodeComm[k];
        commDegreeSum[c] = (commDegreeSum[c] || 0) + degree_w[k];
      }
      const order = [...Array(N).keys()].sort(() => Math.random() - 0.5);
      for (const i of order) {
        if (Object.keys(wAdj[i]).length === 0) continue;
        const currentComm = nodeComm[i];
        const ki = degree_w[i];
        const commWeights = {};
        for (const jStr of Object.keys(wAdj[i])) {
          const j = parseInt(jStr);
          const c = nodeComm[j];
          commWeights[c] = (commWeights[c] || 0) + wAdj[i][jStr];
        }
        commDegreeSum[currentComm] -= ki;

        let bestComm = currentComm;
        let bestGain = 0;
        for (const cStr of Object.keys(commWeights)) {
          const c = parseInt(cStr);
          if (c === currentComm) continue;
          const gain = (commWeights[cStr] || 0) / m2 - resolution * ki * (commDegreeSum[c] || 0) / (m2 * m2);
          const lossFromCurrent = (commWeights[currentComm] || 0) / m2 - resolution * ki * (commDegreeSum[currentComm] || 0) / (m2 * m2);
          const netGain = gain - lossFromCurrent;
          if (netGain > bestGain) {
            bestGain = netGain;
            bestComm = c;
          }
        }
        if (bestComm !== currentComm) {
          nodeComm[i] = bestComm;
          commDegreeSum[bestComm] = (commDegreeSum[bestComm] || 0) + ki;
          improved = true;
        } else {
          commDegreeSum[currentComm] += ki;
        }
      }
    }
    return nodeComm;
  }

  function countCommunities(nodeComm) {
    return new Set(nodeComm).size;
  }

  // Auto-tune resolution to get ~12 communities (range 8-15)
  const TARGET_MIN = 8;
  const TARGET_MAX = 15;
  const TARGET = 12;
  let bestComm = Array.from({ length: N }, (_, i) => i);
  let bestDist = Infinity;

  // Wide resolution range to handle the denser similarity graph
  let lo = 0.1, hi = 20.0;
  for (let attempt = 0; attempt < 15; attempt++) {
    const res = (lo + hi) / 2;
    const comm = Array.from({ length: N }, (_, i) => i);
    louvainPass(comm, res);
    const numC = countCommunities(comm);
    const dist = Math.abs(numC - TARGET);
    if (dist < bestDist || (dist === bestDist && Math.abs(res - 1.5) < Math.abs((lo + hi) / 2 - 1.5))) {
      bestDist = dist;
      bestComm = [...comm];
    }
    if (numC >= TARGET_MIN && numC <= TARGET_MAX) break;
    if (numC < TARGET) {
      lo = res; // need more communities -> higher resolution
    } else {
      hi = res; // need fewer communities -> lower resolution
    }
  }

  // Absorb singletons: assign isolated nodes to the nearest community
  // (the community of their highest-weight similarity neighbor)
  const commSizes = {};
  for (let i = 0; i < N; i++) {
    commSizes[bestComm[i]] = (commSizes[bestComm[i]] || 0) + 1;
  }
  for (let i = 0; i < N; i++) {
    if (commSizes[bestComm[i]] > 1) continue; // not a singleton
    // Find neighbor with highest similarity weight
    let bestNeighborComm = bestComm[i];
    let bestW = 0;
    for (const jStr of Object.keys(wAdj[i])) {
      const j = parseInt(jStr);
      const w = wAdj[i][jStr];
      if (w > bestW && commSizes[bestComm[j]] > 1) {
        bestW = w;
        bestNeighborComm = bestComm[j];
      }
    }
    if (bestNeighborComm !== bestComm[i]) {
      commSizes[bestComm[i]]--;
      bestComm[i] = bestNeighborComm;
      commSizes[bestNeighborComm]++;
    }
  }

  // Second pass: absorb remaining singletons into ANY neighbor's community
  for (let i = 0; i < N; i++) {
    if (commSizes[bestComm[i]] > 1) continue;
    let bestNeighborComm = bestComm[i];
    let bestW = 0;
    for (const jStr of Object.keys(wAdj[i])) {
      const j = parseInt(jStr);
      const w = wAdj[i][jStr];
      if (w > bestW) {
        bestW = w;
        bestNeighborComm = bestComm[j];
      }
    }
    if (bestNeighborComm !== bestComm[i]) {
      commSizes[bestComm[i]]--;
      bestComm[i] = bestNeighborComm;
      commSizes[bestNeighborComm]++;
    }
  }

  // Third pass: merge small communities (< 3 members) into their nearest
  // non-small neighbor's community — NOT the largest community, which
  // would create a mega-cluster absorbing everything.
  for (let i = 0; i < N; i++) {
    if (commSizes[bestComm[i]] >= 3) continue;
    let bestNeighborComm = bestComm[i];
    let bestW = 0;
    for (const jStr of Object.keys(wAdj[i])) {
      const j = parseInt(jStr);
      const w = wAdj[i][jStr];
      if (w > bestW && commSizes[bestComm[j]] >= 3) {
        bestW = w;
        bestNeighborComm = bestComm[j];
      }
    }
    if (bestNeighborComm !== bestComm[i]) {
      commSizes[bestComm[i]]--;
      bestComm[i] = bestNeighborComm;
      commSizes[bestNeighborComm]++;
    }
  }
  // Final fallback: any remaining tiny communities go to the largest
  let largestComm = bestComm[0];
  let largestSize = 0;
  for (const [c, size] of Object.entries(commSizes)) {
    if (size > largestSize) { largestSize = size; largestComm = parseInt(c); }
  }
  for (let i = 0; i < N; i++) {
    if (commSizes[bestComm[i]] < 2) {
      commSizes[bestComm[i]]--;
      bestComm[i] = largestComm;
      commSizes[largestComm]++;
    }
  }

  // Renumber communities sequentially
  const labelMap = {};
  let nextCid = 0;
  const communities = {};
  ids.forEach((id, i) => {
    if (labelMap[bestComm[i]] === undefined) labelMap[bestComm[i]] = nextCid++;
    communities[id] = labelMap[bestComm[i]];
  });

  // Generate human-readable community names
  const communityNames = generateCommunityNames(nodes, edges, communities);

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

  // --- Co-Investment Density ---
  // For each company node, count how many of its investor neighbors also invest
  // in other companies in the graph.
  const coInvestmentDensity = {};
  // Build a set of investor node indices → set of company indices they invest in
  // "invested_in" edges go from fund/investor → company
  const investorToCompanies = {}; // investorIdx → Set<companyIdx>
  for (const e of edges) {
    if (e.rel !== 'invested_in') continue;
    const si = idx[typeof e.source === 'object' ? e.source.id : e.source];
    const ti = idx[typeof e.target === 'object' ? e.target.id : e.target];
    if (si === undefined || ti === undefined) continue;
    // source = investor, target = company
    const targetNode = nodeMap[ids[ti]];
    if (!targetNode || targetNode.type !== 'company') continue;
    if (!investorToCompanies[si]) investorToCompanies[si] = new Set();
    investorToCompanies[si].add(ti);
  }
  // For each company, find its investors and check co-investment
  ids.forEach((id, i) => {
    const n = nodeMap[id];
    if (!n || n.type !== 'company') return;
    // Find all investors of this company
    const investors = [];
    for (const [invIdx, compSet] of Object.entries(investorToCompanies)) {
      if (compSet.has(i)) investors.push(parseInt(invIdx));
    }
    if (investors.length === 0) { coInvestmentDensity[id] = 0; return; }
    let coInvestors = 0;
    for (const invIdx of investors) {
      const compSet = investorToCompanies[invIdx];
      // Check if this investor invests in OTHER companies (not just this one)
      for (const cIdx of compSet) {
        if (cIdx !== i) { coInvestors++; break; }
      }
    }
    coInvestmentDensity[id] = Math.round((coInvestors / investors.length) * 100) / 100;
  });

  // --- Founder Mobility Score ---
  // For each company, count people connected via founded_by / employed_at edges
  // who also connect to OTHER companies.
  const founderMobility = {};
  // Build person → set of companies they connect to (via founded_by, employed_at)
  const personToCompanies = {}; // personId → Set<companyId>
  for (const e of edges) {
    if (e.rel !== 'founded_by' && e.rel !== 'employed_at' && e.rel !== 'founder_of') continue;
    const srcId = typeof e.source === 'object' ? e.source.id : e.source;
    const tgtId = typeof e.target === 'object' ? e.target.id : e.target;
    const srcNode = nodeMap[srcId];
    const tgtNode = nodeMap[tgtId];
    if (!srcNode || !tgtNode) continue;
    // Determine which is the person and which is the company
    let personId, companyId;
    if (srcNode.type === 'person' && tgtNode.type === 'company') {
      personId = srcId; companyId = tgtId;
    } else if (srcNode.type === 'company' && tgtNode.type === 'person') {
      personId = tgtId; companyId = srcId;
    } else if (srcNode.type === 'company' && tgtNode.type === 'company') {
      // founded_by can link company→company in some schemas; skip
      continue;
    } else {
      continue;
    }
    if (!personToCompanies[personId]) personToCompanies[personId] = new Set();
    personToCompanies[personId].add(companyId);
  }
  ids.forEach((id) => {
    const n = nodeMap[id];
    if (!n || n.type !== 'company') return;
    // Find all people connected to this company
    const people = [];
    for (const [pId, compSet] of Object.entries(personToCompanies)) {
      if (compSet.has(id)) people.push(pId);
    }
    if (people.length === 0) { founderMobility[id] = 0; return; }
    let multiCompanyPeople = 0;
    for (const pId of people) {
      if (personToCompanies[pId].size > 1) multiCompanyPeople++;
    }
    founderMobility[id] = Math.round((multiCompanyPeople / people.length) * 100) / 100;
  });

  // --- Structural Hole Score (Burt's constraint) ---
  // For each node, measure how much it bridges disconnected parts of the network.
  // constraint(i) = sum_j (p_ij + sum_q p_iq * p_qj)^2
  // structural_hole_score = 1 - constraint (normalized to 0-1)
  const structuralHole = {};
  const rawConstraint = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const neighbors = adj[i];
    const deg = neighbors.length;
    if (deg === 0) { rawConstraint[i] = 1; continue; } // isolated = max constraint
    // p_ij = 1 / degree(i) for each neighbor j (unweighted)
    const p_ij = 1 / deg;
    const neighborSet = new Set(neighbors);
    let constraint = 0;
    for (const j of neighbors) {
      // Direct proportion
      let indirect = 0;
      // sum_q p_iq * p_qj where q is a common neighbor of i and j (q != i, q != j)
      for (const q of neighbors) {
        if (q === j) continue;
        // p_qj = 1/degree(q) if j is neighbor of q, else 0
        if (adj[q].includes(j)) {
          indirect += p_ij * (1 / adj[q].length);
        }
      }
      const total = p_ij + indirect;
      constraint += total * total;
    }
    rawConstraint[i] = Math.min(constraint, 1); // clamp to [0,1]
  }
  // Normalize: structural_hole_score = 1 - constraint
  ids.forEach((id, i) => {
    structuralHole[id] = Math.round((1 - rawConstraint[i]) * 100) / 100;
  });

  return {
    pagerank, betweenness, communities, communityNames, watchlist, numCommunities: nextCid,
    coInvestmentDensity, founderMobility, structuralHole,
  };
}
