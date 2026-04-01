/**
 * Structural Hole Analysis — Burt's constraint-based detection.
 *
 * Identifies bridge nodes, isolated communities, and ecosystem gaps
 * by combining constraint scores with community assignment data.
 */

import pool from '../db/pool.js';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';
import { resolveNodesFromRegistry } from '../db/queries/entities.js';
import logger from '../logger.js';

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

    // Nodes with degree 1 always have constraint 1.0 (single neighbor)
    if (neighbors.length <= 1) {
      constraints[i] = 1;
      continue;
    }

    // Pre-compute proportional tie strengths (p_iq) once for all neighbors
    const totalWi = totalW[i];
    const p_i = {};  // neighbor -> proportional weight
    for (const q of neighbors) {
      p_i[q] = adj[i][q] / totalWi;
    }

    let C_i = 0;

    for (const j of neighbors) {
      // Indirect path contribution: Σ_q (p_iq * p_qj)  for q ≠ i, q ≠ j
      let indirect = 0;
      for (const q of neighbors) {
        if (q === j) continue;
        const p_qj = (adj[q] && adj[q][j] && totalW[q])
          ? adj[q][j] / totalW[q]
          : 0;
        if (p_qj === 0) continue;
        indirect += p_i[q] * p_qj;
      }

      C_i += (p_i[j] + indirect) ** 2;
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

  // Bridge nodes: connected to 2+ distinct communities
  // (lowered from 3 since hybrid clustering produces fewer, larger communities)
  const bridgeNodes = [];
  for (const [nodeId, comms] of Object.entries(nodeCommunities)) {
    if (comms.size >= 2) {
      const node = nodeMap[nodeId] || {};
      bridgeNodes.push({
        nodeId,
        label: node.label || nodeId,
        type: node.type || 'unknown',
        region: node.region || node.city || null,
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

  // Build nodeMap for label lookups — use entity_registry for complete coverage
  const nodeMap = {};
  for (const n of nodes) {
    nodeMap[n.id] = n;
  }
  // Resolve any edge endpoints missing from the graph node list via entity_registry
  const allEdgeIds = new Set();
  for (const e of edges) {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    if (!nodeMap[src]) allEdgeIds.add(src);
    if (!nodeMap[tgt]) allEdgeIds.add(tgt);
  }
  if (allEdgeIds.size > 0) {
    const resolved = await resolveNodesFromRegistry([...allEdgeIds]);
    for (const [id, node] of resolved) {
      if (!nodeMap[id]) nodeMap[id] = node;
    }
  }

  // Resolve nodes from community assignments that aren't in nodeMap yet
  if (cachedCommunities && Object.keys(cachedCommunities).length > 0) {
    const communityNodeIds = Object.keys(cachedCommunities).filter(id => !nodeMap[id]);
    if (communityNodeIds.length > 0) {
      const communityResolved = await resolveNodesFromRegistry(communityNodeIds);
      for (const [id, node] of communityResolved) {
        if (!nodeMap[id]) nodeMap[id] = node;
      }
    }
  }

  // Filter to historical edges — opportunity edges inflate constraint/bridge calculations
  const EXCLUDED_RELS = new Set(['qualifies_for', 'fund_opportunity', 'potential_lp']);
  const historicalEdges = edges.filter(e => {
    if (e.category === 'opportunity' || e.category === 'projected') return false;
    return !EXCLUDED_RELS.has(e.rel || '');
  });

  // If cache is empty, compute communities on the fly
  let communities = cachedCommunities;
  if (!communities || Object.keys(communities).length === 0) {
    const { computeGraphMetrics } = await import('./graph-metrics.js');
    const metrics = computeGraphMetrics(nodes, historicalEdges);
    communities = metrics.communities;
  }

  // Step 2: Compute Burt's Constraint (historical edges only)
  const constraints = computeConstraints(nodes, historicalEdges);

  // Step 3: Find bridges — use historicalEdges so bridge detection
  // reflects real relationships, not inflated opportunity edges
  const { bridgeNodes, pairCount, nodeCommunities } = findBridges(
    historicalEdges, communities, constraints, nodeMap
  );

  // Step 3b: Find isolated islands
  const islands = findIslands(communities, pairCount, nodeMap, constraints);

  // Step 4: Find ecosystem gaps (historical edges only)
  const gaps = findGaps(communities, pairCount, historicalEdges, nodeMap, constraints);

  // Build community names from node attributes
  const communityMemberMap = {};
  for (const [nodeId, cid] of Object.entries(communities)) {
    if (!communityMemberMap[cid]) communityMemberMap[cid] = [];
    const n = nodeMap[nodeId] || {};
    communityMemberMap[cid].push(n);
  }

  const regionDisplayNames = {
    las_vegas: 'Las Vegas', reno: 'Reno', henderson: 'Henderson',
    'reno-sparks': 'Reno-Sparks', rural: 'Rural NV', statewide: 'Statewide',
  };
  function titleCase(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  const communityNames = {};
  for (const [cid, mems] of Object.entries(communityMemberMap)) {
    const sectorCounts = {};
    const regionCounts = {};
    const typeCounts = {};
    mems.forEach(m => {
      const sectors = m.sector || m.sectors || [];
      (Array.isArray(sectors) ? sectors : [sectors]).forEach(s => {
        if (s) sectorCounts[s] = (sectorCounts[s] || 0) + 1;
      });
      if (m.region) regionCounts[m.region] = (regionCounts[m.region] || 0) + 1;
      if (m.type) typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });
    const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    const parts = [];
    if (topSector && topSector[1] >= 2) parts.push(topSector[0]);
    if (topRegion && topRegion[1] >= 2) parts.push(regionDisplayNames[topRegion[0]] || titleCase(topRegion[0]));
    if (!parts.length) {
      // Use the highest-degree node label as name
      const sortedByDeg = [...mems].filter(m => m.label && m.label !== m.id);
      if (sortedByDeg.length) parts.push(sortedByDeg[0].label);
      else if (topType) parts.push(titleCase(topType[0]) + ' Group');
    }
    communityNames[cid] = parts.length ? parts.join(' \u00B7 ') : `Cluster ${mems.length}`;
  }

  // Annotate islands and gaps with community names
  for (const island of islands) {
    island.communityName = communityNames[island.communityId] || `Community ${island.communityId}`;
  }
  for (const gap of gaps) {
    gap.communityAName = communityNames[gap.communityA] || `Community ${gap.communityA}`;
    gap.communityBName = communityNames[gap.communityB] || `Community ${gap.communityB}`;
  }
  // Annotate bridge community IDs with names
  for (const bridge of bridgeNodes) {
    bridge.communityLabels = bridge.communities.map(cid => communityNames[cid] || `C${cid}`);
  }

  // Stats
  const communityIds = new Set(Object.values(communities));
  const constraintValues = Object.values(constraints);
  const avgConstraint = constraintValues.length
    ? Math.round((constraintValues.reduce((s, v) => s + v, 0) / constraintValues.length) * 1000) / 1000
    : 0;

  const stats = {
    totalCommunities: communityIds.size,
    avgConstraint,
    bridgeCount: bridgeNodes.length,
    islandCount: islands.length,
    gapCount: gaps.length,
    totalNodes: nodes.length,
    totalEdges: edges.length,
  };

  // ── Trend tracking: compare with previous graph_statistics snapshot ──
  let trends = null;
  try {
    // Single query fetches both current and previous snapshot rows
    const snapResult = await pool.query(
      'SELECT total_nodes, total_edges, density, computed_at FROM graph_statistics ORDER BY computed_at DESC LIMIT 2'
    );
    const currStats = { rows: snapResult.rows.length >= 1 ? [snapResult.rows[0]] : [] };
    const prevStats = { rows: snapResult.rows.length >= 2 ? [snapResult.rows[1]] : [] };

    if (prevStats.rows.length > 0 && currStats.rows.length > 0) {
      const prev = prevStats.rows[0];
      const curr = currStats.rows[0];
      const nodeDelta = curr.total_nodes - prev.total_nodes;
      const edgeDelta = curr.total_edges - prev.total_edges;
      const densityDelta = Math.round((curr.density - prev.density) * 1e8) / 1e8;

      // Build interpretation
      const parts = [];
      if (nodeDelta !== 0) parts.push(`${nodeDelta > 0 ? '+' : ''}${nodeDelta} nodes`);
      if (edgeDelta !== 0) parts.push(`${edgeDelta > 0 ? '+' : ''}${edgeDelta} edges`);
      if (densityDelta > 0) parts.push('density increasing');
      else if (densityDelta < 0) parts.push('density decreasing');

      trends = {
        bridgeCount: bridgeNodes.length,
        islandCount: islands.length,
        gapCount: gaps.length,
        avgConstraint,
        nodeDelta,
        edgeDelta,
        densityDelta,
        previousSnapshot: prev.computed_at,
        currentSnapshot: curr.computed_at,
        interpretation: parts.length > 0
          ? `Since last snapshot: ${parts.join(', ')}`
          : 'No significant changes since last snapshot',
      };
    }
  } catch (trendErr) {
    // Non-fatal: trends are informational only
    logger.error('structural-holes: trend computation skipped', { error: trendErr });
  }

  // ── Connect to gap_interventions table ──
  try {
    const interventions = await pool.query(
      'SELECT * FROM gap_interventions WHERE status != $1 ORDER BY created_at DESC',
      ['rejected']
    );

    // Attach matching interventions to each gap
    for (const gap of gaps) {
      gap.interventions = interventions.rows.filter(i =>
        i.target_community_a === String(gap.communityA) ||
        i.target_community_b === String(gap.communityB)
      );
    }

    // Auto-propose interventions for critical gaps without existing ones
    for (const gap of gaps) {
      if (gap.gapSeverity > 7 && (!gap.interventions || gap.interventions.length === 0)) {
        const topBridge = gap.potentialBridges?.[0];
        if (topBridge) {
          await pool.query(
            `INSERT INTO gap_interventions (gap_type, gap_name, proposed_bridge_id, target_community_a, target_community_b, proposed_by, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT DO NOTHING`,
            [
              'structural',
              `${gap.communityAName} \u2194 ${gap.communityBName}`,
              topBridge.nodeId,
              String(gap.communityA),
              String(gap.communityB),
              'auto_detector',
              `Auto-proposed: severity ${gap.gapSeverity.toFixed(1)}, bridge constraint ${topBridge.constraint.toFixed(3)}`,
            ]
          );
        }
      }
    }
  } catch (interventionErr) {
    // Non-fatal: interventions are supplementary
    logger.error('structural-holes: intervention lookup skipped', { error: interventionErr });
  }

  return {
    bridges: bridgeNodes,
    islands,
    gaps,
    communityNames,
    stats,
    trends,
  };
}
