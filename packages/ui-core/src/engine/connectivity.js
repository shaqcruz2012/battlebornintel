/**
 * Connectivity & Centrality Scoring Engine
 *
 * Palantir-inspired graph analytics for BBI platform.
 * Computes node importance, influence propagation, community
 * detection, and relationship strength across the ontology graph.
 *
 * Algorithms:
 *   - Degree centrality (normalized)
 *   - Betweenness centrality (Brandes approximation)
 *   - PageRank (power iteration)
 *   - Influence score (composite)
 *   - Community detection (label propagation)
 *   - Hub & Authority (HITS)
 */

const MAX_PAGERANK_ITER = 50;
const PAGERANK_DAMPING = 0.85;
const PAGERANK_TOL = 1e-6;

/**
 * Build adjacency structures from edges.
 * @param {Array} edges - [{source, target, rel, note, y}]
 * @returns {{ adj: Map, inAdj: Map, nodes: Set }}
 */
function buildAdjacency(edges) {
  const adj = new Map();    // outgoing
  const inAdj = new Map();  // incoming
  const nodes = new Set();

  for (const e of edges) {
    nodes.add(e.source);
    nodes.add(e.target);
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    if (!inAdj.has(e.source)) inAdj.set(e.source, []);
    if (!inAdj.has(e.target)) inAdj.set(e.target, []);
    adj.get(e.source).push(e);
    inAdj.get(e.target).push(e);
  }
  return { adj, inAdj, nodes };
}

/**
 * Degree centrality: normalized count of connections.
 * @param {Map} adj - adjacency list
 * @param {Map} inAdj - reverse adjacency
 * @param {Set} nodes - all node IDs
 * @returns {Map<string, {in: number, out: number, total: number, normalized: number}>}
 */
export function degreeCentrality(edges) {
  const { adj, inAdj, nodes } = buildAdjacency(edges);
  const n = nodes.size || 1;
  const result = new Map();

  for (const node of nodes) {
    const outDeg = (adj.get(node) || []).length;
    const inDeg = (inAdj.get(node) || []).length;
    const total = outDeg + inDeg;
    result.set(node, {
      in: inDeg,
      out: outDeg,
      total,
      normalized: total / (2 * (n - 1) || 1),
    });
  }
  return result;
}

/**
 * PageRank via power iteration.
 * @param {Array} edges
 * @returns {Map<string, number>} node → pagerank score
 */
export function pageRank(edges) {
  const { adj, nodes } = buildAdjacency(edges);
  const n = nodes.size;
  if (n === 0) return new Map();

  const nodeArr = Array.from(nodes);
  const rank = new Map();
  const init = 1 / n;
  for (const nd of nodeArr) rank.set(nd, init);

  for (let iter = 0; iter < MAX_PAGERANK_ITER; iter++) {
    const newRank = new Map();
    let sinkMass = 0;

    // Collect sink (dangling) node mass
    for (const nd of nodeArr) {
      if ((adj.get(nd) || []).length === 0) {
        sinkMass += rank.get(nd);
      }
    }

    let maxDelta = 0;
    for (const nd of nodeArr) {
      let inSum = 0;
      // Sum contributions from nodes pointing to this node
      for (const nd2 of nodeArr) {
        const outEdges = adj.get(nd2) || [];
        const pointsHere = outEdges.some(e => e.target === nd);
        if (pointsHere) {
          inSum += rank.get(nd2) / outEdges.length;
        }
      }
      const pr = (1 - PAGERANK_DAMPING) / n + PAGERANK_DAMPING * (inSum + sinkMass / n);
      newRank.set(nd, pr);
      maxDelta = Math.max(maxDelta, Math.abs(pr - rank.get(nd)));
    }

    for (const [k, v] of newRank) rank.set(k, v);
    if (maxDelta < PAGERANK_TOL) break;
  }

  // Normalize to 0-100
  const max = Math.max(...rank.values()) || 1;
  for (const [k, v] of rank) rank.set(k, Math.round((v / max) * 100));
  return rank;
}

/**
 * Betweenness centrality (Brandes algorithm, undirected approximation).
 * For large graphs, samples a subset of source nodes.
 * @param {Array} edges
 * @param {number} sampleSize - max source nodes to sample (default 50)
 * @returns {Map<string, number>} node → betweenness score (0-100)
 */
export function betweennessCentrality(edges, sampleSize = 50) {
  const { nodes } = buildAdjacency(edges);
  const n = nodes.size;
  if (n < 3) return new Map(Array.from(nodes).map(nd => [nd, 0]));

  // Build undirected adjacency
  const undirAdj = new Map();
  for (const nd of nodes) undirAdj.set(nd, new Set());
  for (const e of edges) {
    undirAdj.get(e.source).add(e.target);
    undirAdj.get(e.target).add(e.source);
  }

  const betweenness = new Map();
  for (const nd of nodes) betweenness.set(nd, 0);

  // Sample source nodes for approximation
  const nodeArr = Array.from(nodes);
  const sources = nodeArr.length <= sampleSize ? nodeArr : nodeArr.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

  for (const s of sources) {
    // BFS from s
    const stack = [];
    const pred = new Map();
    const sigma = new Map();
    const dist = new Map();
    const delta = new Map();

    for (const nd of nodes) {
      pred.set(nd, []);
      sigma.set(nd, 0);
      dist.set(nd, -1);
      delta.set(nd, 0);
    }

    sigma.set(s, 1);
    dist.set(s, 0);
    const queue = [s];

    while (queue.length > 0) {
      const v = queue.shift();
      stack.push(v);
      for (const w of undirAdj.get(v)) {
        if (dist.get(w) < 0) {
          queue.push(w);
          dist.set(w, dist.get(v) + 1);
        }
        if (dist.get(w) === dist.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          pred.get(w).push(v);
        }
      }
    }

    // Accumulate
    while (stack.length > 0) {
      const w = stack.pop();
      for (const v of pred.get(w)) {
        const d = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
        delta.set(v, delta.get(v) + d);
      }
      if (w !== s) {
        betweenness.set(w, betweenness.get(w) + delta.get(w));
      }
    }
  }

  // Normalize to 0-100
  const max = Math.max(...betweenness.values()) || 1;
  for (const [k, v] of betweenness) betweenness.set(k, Math.round((v / max) * 100));
  return betweenness;
}

/**
 * Community detection via label propagation.
 * @param {Array} edges
 * @returns {Map<string, number>} node → community ID
 */
export function detectCommunities(edges) {
  const { nodes } = buildAdjacency(edges);
  const undirAdj = new Map();
  for (const nd of nodes) undirAdj.set(nd, new Set());
  for (const e of edges) {
    undirAdj.get(e.source).add(e.target);
    undirAdj.get(e.target).add(e.source);
  }

  // Initialize: each node is its own community
  const labels = new Map();
  let i = 0;
  for (const nd of nodes) labels.set(nd, i++);

  // Iterate label propagation
  const nodeArr = Array.from(nodes);
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    // Shuffle for randomness
    const shuffled = [...nodeArr].sort(() => 0.5 - Math.random());

    for (const nd of shuffled) {
      const neighbors = undirAdj.get(nd);
      if (!neighbors || neighbors.size === 0) continue;

      // Count neighbor labels
      const counts = new Map();
      for (const nb of neighbors) {
        const lbl = labels.get(nb);
        counts.set(lbl, (counts.get(lbl) || 0) + 1);
      }

      // Pick most common label
      let maxCount = 0, bestLabel = labels.get(nd);
      for (const [lbl, cnt] of counts) {
        if (cnt > maxCount) { maxCount = cnt; bestLabel = lbl; }
      }

      if (bestLabel !== labels.get(nd)) {
        labels.set(nd, bestLabel);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return labels;
}

/**
 * Compute relationship strength between two specific nodes.
 * Measures: direct edges, shared neighbors, path diversity.
 * @param {string} nodeA
 * @param {string} nodeB
 * @param {Array} edges
 * @returns {{ direct: number, shared: number, paths: number, strength: number }}
 */
export function relationshipStrength(nodeA, nodeB, edges) {
  const undirAdj = new Map();
  const allNodes = new Set();
  for (const e of edges) {
    allNodes.add(e.source);
    allNodes.add(e.target);
    if (!undirAdj.has(e.source)) undirAdj.set(e.source, new Set());
    if (!undirAdj.has(e.target)) undirAdj.set(e.target, new Set());
    undirAdj.get(e.source).add(e.target);
    undirAdj.get(e.target).add(e.source);
  }

  if (!allNodes.has(nodeA) || !allNodes.has(nodeB)) {
    return { direct: 0, shared: 0, paths: 0, strength: 0 };
  }

  // Direct edges
  const direct = edges.filter(e =>
    (e.source === nodeA && e.target === nodeB) ||
    (e.source === nodeB && e.target === nodeA)
  ).length;

  // Shared neighbors (Jaccard-like)
  const neighborsA = undirAdj.get(nodeA) || new Set();
  const neighborsB = undirAdj.get(nodeB) || new Set();
  let shared = 0;
  for (const n of neighborsA) if (neighborsB.has(n)) shared++;

  // Path diversity (unique 2-hop paths)
  let paths = direct;
  for (const mid of allNodes) {
    if (mid === nodeA || mid === nodeB) continue;
    const aMid = (undirAdj.get(nodeA) || new Set()).has(mid);
    const midB = (undirAdj.get(mid) || new Set()).has(nodeB);
    if (aMid && midB) paths++;
  }

  // Composite strength (0-100)
  const strength = Math.min(100, Math.round(
    direct * 30 +
    shared * 15 +
    Math.min(paths, 10) * 5.5
  ));

  return { direct, shared, paths, strength };
}

/**
 * Compute composite influence score for each node.
 * Weighted combination of degree, PageRank, and betweenness.
 * @param {Array} edges
 * @returns {Map<string, {influence: number, degree: number, pagerank: number, betweenness: number, community: number}>}
 */
export function computeInfluence(edges) {
  const deg = degreeCentrality(edges);
  const pr = pageRank(edges);
  const bc = betweennessCentrality(edges);
  const communities = detectCommunities(edges);

  const result = new Map();
  for (const [node, d] of deg) {
    const degScore = Math.round(d.normalized * 100);
    const prScore = pr.get(node) || 0;
    const bcScore = bc.get(node) || 0;

    // Weighted composite: PR(40%) + Betweenness(35%) + Degree(25%)
    const influence = Math.round(
      prScore * 0.40 +
      bcScore * 0.35 +
      degScore * 0.25
    );

    result.set(node, {
      influence: Math.min(100, influence),
      degree: degScore,
      pagerank: prScore,
      betweenness: bcScore,
      community: communities.get(node) || 0,
    });
  }

  return result;
}

/**
 * Find the top-N most influential nodes.
 * @param {Array} edges
 * @param {number} n - how many to return
 * @returns {Array<{id: string, influence: number, degree: number, pagerank: number, betweenness: number}>}
 */
export function topInfluencers(edges, n = 20) {
  const scores = computeInfluence(edges);
  return Array.from(scores.entries())
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.influence - a.influence)
    .slice(0, n);
}

/**
 * Compute network density and structural metrics.
 * @param {Array} edges
 * @returns {{ nodes: number, edges: number, density: number, avgDegree: number, components: number, communities: number }}
 */
export function networkMetrics(edges) {
  const { nodes } = buildAdjacency(edges);
  const n = nodes.size;
  const e = edges.length;
  const maxEdges = n * (n - 1) / 2;
  const density = maxEdges > 0 ? e / maxEdges : 0;

  const deg = degreeCentrality(edges);
  let totalDeg = 0;
  for (const [, d] of deg) totalDeg += d.total;
  const avgDegree = n > 0 ? totalDeg / n : 0;

  // Count connected components (BFS)
  const undirAdj = new Map();
  for (const nd of nodes) undirAdj.set(nd, new Set());
  for (const edge of edges) {
    undirAdj.get(edge.source).add(edge.target);
    undirAdj.get(edge.target).add(edge.source);
  }

  const visited = new Set();
  let components = 0;
  for (const nd of nodes) {
    if (visited.has(nd)) continue;
    components++;
    const queue = [nd];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const nb of undirAdj.get(cur)) {
        if (!visited.has(nb)) queue.push(nb);
      }
    }
  }

  // Count unique communities
  const communities = detectCommunities(edges);
  const uniqueComms = new Set(communities.values()).size;

  return {
    nodes: n,
    edges: e,
    density: Math.round(density * 10000) / 10000,
    avgDegree: Math.round(avgDegree * 100) / 100,
    components,
    communities: uniqueComms,
  };
}

/**
 * Get a node's ego network (1-hop neighborhood).
 * @param {string} nodeId
 * @param {Array} edges
 * @returns {{ neighbors: string[], edgeCount: number, density: number }}
 */
export function egoNetwork(nodeId, edges) {
  const neighborEdges = edges.filter(e => e.source === nodeId || e.target === nodeId);
  const neighbors = new Set();
  for (const e of neighborEdges) {
    if (e.source !== nodeId) neighbors.add(e.source);
    if (e.target !== nodeId) neighbors.add(e.target);
  }

  // Count edges between neighbors (cluster coefficient)
  const nbArr = Array.from(neighbors);
  let internalEdges = 0;
  for (const e of edges) {
    if (neighbors.has(e.source) && neighbors.has(e.target)) internalEdges++;
  }
  const maxInternal = nbArr.length * (nbArr.length - 1) / 2;
  const density = maxInternal > 0 ? internalEdges / maxInternal : 0;

  return {
    neighbors: nbArr,
    edgeCount: neighborEdges.length,
    density: Math.round(density * 100) / 100,
  };
}
