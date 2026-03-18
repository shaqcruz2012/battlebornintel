/**
 * Structural Hole Analysis — Burt's constraint-based detection.
 *
 * Identifies bridge nodes, isolated communities, and ecosystem gaps
 * by combining constraint scores with community assignment data.
 */

import pool from '../db/pool.js';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';

/* ── 1. Burt's Constraint ─────────────────────────────────────────────────── */

/**
 * Compute Burt's Constraint for every node in the graph.
 *
 * C_i = Σ_j (p_ij + Σ_q p_iq * p_qj)²
 *
 * where p_ij = weight(i→j) / Σ_k weight(i→k)   (proportional tie strength)
 *
 * Low constraint  → node spans a structural hole (broker / bridge)
 * High constraint → node is embedded in a dense, redundant cluster
 *
 * @param {Array} nodes  – [{ id, ... }]
 * @param {Array} edges  – [{ source, target, ... }]
 * @returns {{ [nodeId: string]: number }}  constraint score per node (0–1 range)
 */
export function computeConstraints(nodes, edges) {
  // Build adjacency with weights (count parallel edges as heavier ties)
  const adj = {};       // nodeId → { neighborId: weight }
  const totalW = {};    // nodeId → sum of all edge weights

  for (const n of nodes) {
    adj[n.id] = {};
    totalW[n.id] = 0;
  }

  for (const e of edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    if (s === t) continue;
    if (!adj[s] || !adj[t]) continue;

    adj[s][t] = (adj[s][t] || 0) + 1;
    adj[t][s] = (adj[t][s] || 0) + 1;
    totalW[s] = (totalW[s] || 0) + 1;
    totalW[t] = (totalW[t] || 0) + 1;
  }

  const constraints = {};

  for (const i of Object.keys(adj)) {
    if (totalW[i] === 0) {
      constraints[i] = 1;            // isolated node → max constraint
      continue;
    }

    const neighbors = Object.keys(adj[i]);
    let C_i = 0;

    for (const j of neighbors) {
      const p_ij = adj[i][j] / totalW[i];

      // Indirect path contribution: Σ_q (p_iq * p_qj)  for q ≠ i, q ≠ j
      let indirect = 0;
      for (const q of neighbors) {
        if (q === j) continue;
        const p_iq = adj[i][q] / totalW[i];
        const p_qj = (adj[q] && adj[q][j] && totalW[q])
          ? adj[q][j] / totalW[q]
          : 0;
        indirect += p_iq * p_qj;
      }

      C_i += (p_ij + indirect) ** 2;
    }

    constraints[i] = Math.min(C_i, 1);  // cap at 1
  }

  return constraints;
}

/* ── 2. Inter-community bridges ───────────────────────────────────────────── */

/**
 * Find edges and nodes that bridge different communities.
 *
 * @param {Array}  edges        – [{ source, target }]
 * @param {Object} communities  – { nodeId: communityId }
 * @param {Object} constraints  – { nodeId: constraintScore }
 * @param {Object} nodeMap      – { nodeId: nodeObject }
 * @returns {{ bridgeEdges, bridgeNodes, interCommunityCount }}
 */
export function findBridges(edges, communities, constraints, nodeMap) {
  // Track which communities each node connects to
  const nodeCommunities = {};   // nodeId → Set<communityId>
  // Count inter-community edges per community pair
  const pairCount = {};         // "a:b" → count   (a < b)

  for (const e of edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    const cs = communities[s];
    const ct = communities[t];
    if (cs === undefined || ct === undefined) continue;

    if (!nodeCommunities[s]) nodeCommunities[s] = new Set();
    if (!nodeCommunities[t]) nodeCommunities[t] = new Set();
    nodeCommunities[s].add(cs);
    nodeCommunities[s].add(ct);
    nodeCommunities[t].add(cs);
    nodeCommunities[t].add(ct);

    if (cs !== ct) {
      const key = cs < ct ? `${cs}:${ct}` : `${ct}:${cs}`;
      pairCount[key] = (pairCount[key] || 0) + 1;
    }
  }

  // Bridge nodes: connected to 3+ distinct communities
  const bridgeNodes = [];
  for (const [nodeId, comms] of Object.entries(nodeCommunities)) {
    if (comms.size >= 3) {
      const node = nodeMap[nodeId] || {};
      bridgeNodes.push({
        nodeId,
        label: node.label || nodeId,
        type: node.type || 'unknown',
        constraint: constraints[nodeId] ?? 1,
        communities: [...comms].sort((a, b) => a - b),
        bridgeScore: Math.round((1 - (constraints[nodeId] ?? 1)) * comms.size * 100) / 100,
      });
    }
  }

  bridgeNodes.sort((a, b) => b.bridgeScore - a.bridgeScore);

  return { bridgeNodes, pairCount, nodeCommunities };
}

/* ── 3. Disconnected islands ──────────────────────────────────────────────── */

/**
 * Communities with fewer than 2 edges to any other community.
 *
 * @param {Object} communities  – { nodeId: communityId }
 * @param {Object} pairCount   – { "a:b": edgeCount }
 * @param {Object} nodeMap      – { nodeId: nodeObject }
 * @param {Object} constraints  – { nodeId: constraintScore }
 * @returns {Array<{ communityId, size, nodeCount, externalEdges, hubNode }>}
 */
export function findIslands(communities, pairCount, nodeMap, constraints) {
  // Build community membership lists
  const members = {};  // communityId → [nodeId]
  for (const [nodeId, cid] of Object.entries(communities)) {
    if (!members[cid]) members[cid] = [];
    members[cid].push(nodeId);
  }

  // Count external edges per community
  const externalEdges = {};
  for (const [key, count] of Object.entries(pairCount)) {
    const [a, b] = key.split(':').map(Number);
    externalEdges[a] = (externalEdges[a] || 0) + count;
    externalEdges[b] = (externalEdges[b] || 0) + count;
  }

  const islands = [];
  for (const [cidStr, memberList] of Object.entries(members)) {
    const cid = parseInt(cidStr, 10);
    const ext = externalEdges[cid] || 0;
    if (ext >= 2) continue;   // not an island

    // Find hub node (lowest constraint = most central)
    let hubId = memberList[0];
    let hubConstraint = constraints[hubId] ?? 1;
    for (const nid of memberList) {
      const c = constraints[nid] ?? 1;
      if (c < hubConstraint) {
        hubConstraint = c;
        hubId = nid;
      }
    }

    const hubNode = nodeMap[hubId] || {};
    islands.push({
      communityId: cid,
      size: memberList.length,
      nodeCount: memberList.length,
      externalEdges: ext,
      hubNode: {
        nodeId: hubId,
        label: hubNode.label || hubId,
        type: hubNode.type || 'unknown',
      },
      members: memberList.map((nid) => {
        const n = nodeMap[nid] || {};
        return { nodeId: nid, label: n.label || nid, type: n.type || 'unknown' };
      }),
    });
  }

  islands.sort((a, b) => b.nodeCount - a.nodeCount);
  return islands;
}

/* ── 4. Ecosystem gaps ────────────────────────────────────────────────────── */

/**
 * Identify community pairs that have high internal density but zero or
 * minimal inter-community edges — potential missing bridges.
 *
 * @param {Object} communities   – { nodeId: communityId }
 * @param {Object} pairCount    – { "a:b": edgeCount }
 * @param {Array}  edges         – raw edges
 * @param {Object} nodeMap       – { nodeId: node }
 * @param {Object} constraints   – { nodeId: constraintScore }
 * @returns {Array<{ communityA, communityB, potentialBridges, gapSeverity }>}
 */
export function findGaps(communities, pairCount, edges, nodeMap, constraints) {
  // Community membership
  const members = {};
  for (const [nodeId, cid] of Object.entries(communities)) {
    if (!members[cid]) members[cid] = [];
    members[cid].push(nodeId);
  }

  // Internal edge counts per community
  const internalEdges = {};
  for (const e of edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    const cs = communities[s];
    const ct = communities[t];
    if (cs !== undefined && cs === ct) {
      internalEdges[cs] = (internalEdges[cs] || 0) + 1;
    }
  }

  // Internal density per community: internal_edges / (n*(n-1)/2)
  const density = {};
  for (const [cidStr, memberList] of Object.entries(members)) {
    const cid = parseInt(cidStr, 10);
    const n = memberList.length;
    const maxEdges = (n * (n - 1)) / 2 || 1;
    density[cid] = (internalEdges[cid] || 0) / maxEdges;
  }

  const communityIds = Object.keys(members).map(Number);
  const gaps = [];

  for (let i = 0; i < communityIds.length; i++) {
    for (let j = i + 1; j < communityIds.length; j++) {
      const a = communityIds[i];
      const b = communityIds[j];
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const interEdges = pairCount[key] || 0;

      // Only flag gaps where both communities have meaningful size and density
      // but zero or very low inter-community edges
      if (members[a].length < 2 || members[b].length < 2) continue;
      if (interEdges > 1) continue;

      const avgDensity = (density[a] + density[b]) / 2;
      if (avgDensity < 0.1) continue;   // skip sparse communities

      // Potential bridges: nodes in either community with lowest constraint
      const candidates = [...members[a], ...members[b]]
        .map((nid) => ({
          nodeId: nid,
          label: (nodeMap[nid] || {}).label || nid,
          type: (nodeMap[nid] || {}).type || 'unknown',
          constraint: constraints[nid] ?? 1,
          community: communities[nid],
        }))
        .sort((x, y) => x.constraint - y.constraint)
        .slice(0, 4);

      const gapSeverity = Math.round(
        avgDensity * (members[a].length + members[b].length) * (interEdges === 0 ? 1 : 0.5) * 100
      ) / 100;

      gaps.push({
        communityA: a,
        communityB: b,
        communityASize: members[a].length,
        communityBSize: members[b].length,
        interEdges,
        potentialBridges: candidates,
        gapSeverity,
      });
    }
  }

  gaps.sort((a, b) => b.gapSeverity - a.gapSeverity);
  return gaps;
}

/* ── Main analysis entry point ────────────────────────────────────────────── */

/**
 * Full structural hole analysis.
 *
 * 1. Fetch all edges and community assignments
 * 2. Compute Burt's constraint scores
 * 3. Find bridges and islands
 * 4. Return structured analysis
 *
 * @returns {Promise<{ bridges, islands, gaps, stats }>}
 */
export async function analyzeStructuralHoles() {
  // Fetch the full graph
  const allTypes = [
    'company', 'fund', 'person', 'external', 'accelerator', 'ecosystem',
    'sector', 'region', 'exchange',
  ];
  const { nodes, edges } = await getGraphData({ nodeTypes: allTypes, yearMax: 2026 });

  // Fetch cached community assignments (and pagerank / betweenness)
  const { communities: cachedCommunities } = await getGraphMetrics();

  // Build nodeMap for label lookups
  const nodeMap = {};
  for (const n of nodes) {
    nodeMap[n.id] = n;
  }

  // If cache is empty, compute communities on the fly
  let communities = cachedCommunities;
  if (!communities || Object.keys(communities).length === 0) {
    const { computeGraphMetrics } = await import('./graph-metrics.js');
    const metrics = computeGraphMetrics(nodes, edges);
    communities = metrics.communities;
  }

  // Step 2: Compute Burt's Constraint
  const constraints = computeConstraints(nodes, edges);

  // Step 3: Find bridges
  const { bridgeNodes, pairCount, nodeCommunities } = findBridges(
    edges, communities, constraints, nodeMap
  );

  // Step 3b: Find isolated islands
  const islands = findIslands(communities, pairCount, nodeMap, constraints);

  // Step 4: Find ecosystem gaps
  const gaps = findGaps(communities, pairCount, edges, nodeMap, constraints);

  // Stats
  const communityIds = new Set(Object.values(communities));
  const constraintValues = Object.values(constraints);
  const avgConstraint = constraintValues.length
    ? Math.round((constraintValues.reduce((s, v) => s + v, 0) / constraintValues.length) * 1000) / 1000
    : 0;

  return {
    bridges: bridgeNodes,
    islands,
    gaps,
    stats: {
      totalCommunities: communityIds.size,
      avgConstraint,
      bridgeCount: bridgeNodes.length,
      islandCount: islands.length,
      gapCount: gaps.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
    },
  };
}
