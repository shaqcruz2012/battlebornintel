import pool from '../pool.js';

/**
 * Resolve node labels and types from IDs by querying all entity tables.
 * Returns a Map of id -> { id, label, type }.
 */
async function resolveNodes(nodeIds) {
  if (nodeIds.length === 0) return new Map();

  const ids = [...new Set(nodeIds)];
  const nodeMap = new Map();

  // Classify IDs by prefix
  const companyIds = [];
  const fundIds = [];
  const personIds = [];
  const externalIds = [];
  const acceleratorIds = [];
  const ecosystemIds = [];

  for (const id of ids) {
    const pfx = id.split('_')[0];
    switch (pfx) {
      case 'c':   companyIds.push(id.slice(2)); break;
      case 'f':   fundIds.push(id.slice(2)); break;
      case 'p':   if (/^p_\d/.test(id)) break; else personIds.push(id); break;
      case 'a':   acceleratorIds.push(id); break;
      case 'e':   ecosystemIds.push(id); break;
      case 'x': case 'i': case 'u': case 'v': case 'gov':
        externalIds.push(id); break;
    }
  }

  const queries = [];

  if (companyIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name FROM companies WHERE id = ANY($1::int[])`, [companyIds])
        .then(r => r.rows.forEach(row => nodeMap.set(`c_${row.id}`, { id: `c_${row.id}`, label: row.name, type: 'company' })))
    );
  }
  if (fundIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name FROM graph_funds WHERE id = ANY($1::text[])`, [fundIds])
        .then(r => r.rows.forEach(row => nodeMap.set(`f_${row.id}`, { id: `f_${row.id}`, label: row.name, type: 'fund' })))
    );
  }
  if (personIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name FROM people WHERE id = ANY($1::text[])`, [personIds])
        .then(r => r.rows.forEach(row => nodeMap.set(row.id, { id: row.id, label: row.name, type: 'person' })))
    );
  }
  if (externalIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name, entity_type FROM externals WHERE id = ANY($1::text[])`, [externalIds])
        .then(r => r.rows.forEach(row => nodeMap.set(row.id, { id: row.id, label: row.name, type: 'external' })))
    );
  }
  if (acceleratorIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name FROM accelerators WHERE id = ANY($1::text[])`, [acceleratorIds])
        .then(r => r.rows.forEach(row => nodeMap.set(row.id, { id: row.id, label: row.name, type: 'accelerator' })))
    );
  }
  if (ecosystemIds.length > 0) {
    queries.push(
      pool.query(`SELECT id, name FROM ecosystem_orgs WHERE id = ANY($1::text[])`, [ecosystemIds])
        .then(r => r.rows.forEach(row => nodeMap.set(row.id, { id: row.id, label: row.name, type: 'ecosystem' })))
    );
  }

  await Promise.all(queries);

  // Fill in any unresolved IDs with a fallback
  for (const id of ids) {
    if (!nodeMap.has(id)) {
      const pfx = id.split('_')[0];
      const typeMap = { c: 'company', f: 'fund', p: 'person', a: 'accelerator', e: 'ecosystem', x: 'external', i: 'external', u: 'external', v: 'external', gov: 'external', s: 'sector', r: 'region', ex: 'exchange' };
      nodeMap.set(id, { id, label: id, type: typeMap[pfx] || 'unknown' });
    }
  }

  return nodeMap;
}

/**
 * 1. Multi-hop neighborhood traversal using recursive CTE.
 */
export async function getNeighborhood(nodeId, depth = 2) {
  const maxDepth = Math.min(Math.max(depth, 1), 4);

  const neighborResult = await pool.query(
    `WITH RECURSIVE neighborhood AS (
      -- Base: direct neighbors (bidirectional)
      SELECT source_id AS node_id, target_id AS neighbor_id, rel, 1 AS depth
      FROM graph_edges WHERE source_id = $1
      UNION ALL
      SELECT target_id, source_id, rel, 1
      FROM graph_edges WHERE target_id = $1

      UNION ALL

      -- Recursive: expand outward
      SELECT n.neighbor_id,
        CASE WHEN ge.source_id = n.neighbor_id THEN ge.target_id ELSE ge.source_id END,
        ge.rel, n.depth + 1
      FROM neighborhood n
      JOIN graph_edges ge ON ge.source_id = n.neighbor_id OR ge.target_id = n.neighbor_id
      WHERE n.depth < $2
        AND CASE WHEN ge.source_id = n.neighbor_id THEN ge.target_id ELSE ge.source_id END != $1
    )
    SELECT DISTINCT neighbor_id, MIN(depth) as min_depth, array_agg(DISTINCT rel) as rels
    FROM neighborhood
    GROUP BY neighbor_id
    ORDER BY min_depth, neighbor_id`,
    [nodeId, maxDepth]
  );

  // Collect all node IDs to resolve (center + neighbors)
  const allIds = [nodeId, ...neighborResult.rows.map(r => r.neighbor_id)];
  const nodeMap = await resolveNodes(allIds);

  // Get edges between all nodes in the neighborhood
  const nodeIdSet = allIds;
  const edgeResult = await pool.query(
    `SELECT source_id, target_id, rel, event_year, note
     FROM graph_edges
     WHERE source_id = ANY($1::text[]) AND target_id = ANY($1::text[])`,
    [nodeIdSet]
  );

  const neighbors = neighborResult.rows.map(r => {
    const node = nodeMap.get(r.neighbor_id) || { id: r.neighbor_id, label: r.neighbor_id, type: 'unknown' };
    return {
      id: r.neighbor_id,
      label: node.label,
      type: node.type,
      depth: r.min_depth,
      rels: r.rels,
    };
  });

  const edges = edgeResult.rows.map(e => ({
    source: e.source_id,
    target: e.target_id,
    rel: e.rel,
    year: e.event_year,
    note: e.note || undefined,
  }));

  return {
    center: nodeId,
    depth: maxDepth,
    neighbors,
    edges,
  };
}

/**
 * 2. Shortest paths between two nodes using BFS recursive CTE.
 */
export async function getShortestPaths(sourceId, targetId, maxDepth = 4) {
  const limit = Math.min(Math.max(maxDepth, 1), 6);

  const result = await pool.query(
    `WITH RECURSIVE paths AS (
      -- Base: edges from source (bidirectional)
      SELECT source_id AS origin, target_id AS head, rel,
             ARRAY[source_id, target_id] AS path, ARRAY[rel] AS rels, 1 AS depth
      FROM graph_edges WHERE source_id = $1
      UNION ALL
      SELECT source_id AS origin, source_id AS head, rel,
             ARRAY[target_id, source_id] AS path, ARRAY[rel] AS rels, 1 AS depth
      FROM graph_edges WHERE target_id = $1

      UNION ALL

      -- Recursive: extend the frontier by one hop
      SELECT p.origin,
        CASE WHEN ge.source_id = p.head THEN ge.target_id ELSE ge.source_id END AS head,
        ge.rel,
        p.path || CASE WHEN ge.source_id = p.head THEN ge.target_id ELSE ge.source_id END,
        p.rels || ge.rel,
        p.depth + 1
      FROM paths p
      JOIN graph_edges ge ON ge.source_id = p.head OR ge.target_id = p.head
      WHERE p.depth < $3
        AND NOT (CASE WHEN ge.source_id = p.head THEN ge.target_id ELSE ge.source_id END = ANY(p.path))
    )
    SELECT path, rels, depth FROM paths
    WHERE head = $2
    ORDER BY depth
    LIMIT 5`,
    [sourceId, targetId, limit]
  );

  // Collect all node IDs across all paths
  const allIds = new Set();
  for (const row of result.rows) {
    for (const id of row.path) {
      allIds.add(id);
    }
  }

  const nodeMap = await resolveNodes([...allIds]);

  const paths = result.rows.map(row => ({
    nodes: row.path.map(id => {
      const node = nodeMap.get(id) || { id, label: id, type: 'unknown' };
      return { id, label: node.label, type: node.type };
    }),
    edges: row.rels.map((rel, i) => ({
      source: row.path[i],
      target: row.path[i + 1],
      rel,
    })),
    length: row.depth,
  }));

  return {
    source: sourceId,
    target: targetId,
    paths,
  };
}

/**
 * 3. Find structurally similar nodes using Jaccard similarity on neighborhoods.
 */
export async function getSimilarNodes(nodeId, limit = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  // Step 1: Get node type
  const pfx = nodeId.split('_')[0];
  const typeMap = { c: 'company', f: 'fund', p: 'person', a: 'accelerator', e: 'ecosystem', x: 'external', i: 'external', u: 'external', v: 'external', gov: 'external' };
  const nodeType = typeMap[pfx] || 'unknown';
  const prefixes = Object.entries(typeMap).filter(([, v]) => v === nodeType).map(([k]) => k);

  // Step 2: Get immediate neighbors of the target node
  const neighborsResult = await pool.query(
    `SELECT DISTINCT
       CASE WHEN source_id = $1 THEN target_id ELSE source_id END AS neighbor_id
     FROM graph_edges
     WHERE source_id = $1 OR target_id = $1`,
    [nodeId]
  );
  const targetNeighbors = new Set(neighborsResult.rows.map(r => r.neighbor_id));

  if (targetNeighbors.size === 0) {
    return [];
  }

  // Step 3: Find candidate nodes connected to the target's neighbors
  // For each of target's neighbors, find other nodes also connected to that neighbor
  const neighborArr = [...targetNeighbors];
  const candidateResult = await pool.query(
    `SELECT source_id AS node_a, target_id AS node_b
     FROM graph_edges
     WHERE source_id = ANY($1::text[]) OR target_id = ANY($1::text[])`,
    [neighborArr]
  );

  // Build candidate -> shared neighbors map
  const candidateShared = new Map();
  for (const row of candidateResult.rows) {
    // For each edge involving a target neighbor, the OTHER node is a candidate
    const isSourceNeighbor = targetNeighbors.has(row.source_id);
    const isTargetNeighbor = targetNeighbors.has(row.target_id);

    if (isSourceNeighbor) {
      const cid = row.target_id;
      if (cid === nodeId) continue;
      const cPfx = cid.split('_')[0];
      if (!prefixes.includes(cPfx)) continue;
      if (!candidateShared.has(cid)) candidateShared.set(cid, new Set());
      candidateShared.get(cid).add(row.source_id);
    }
    if (isTargetNeighbor) {
      const cid = row.source_id;
      if (cid === nodeId) continue;
      const cPfx = cid.split('_')[0];
      if (!prefixes.includes(cPfx)) continue;
      if (!candidateShared.has(cid)) candidateShared.set(cid, new Set());
      candidateShared.get(cid).add(row.target_id);
    }
  }

  const candidateIds = [...candidateShared.keys()].filter(cid => candidateShared.get(cid).size > 0);
  if (candidateIds.length === 0) return [];

  // Step 4: Get full neighbor sets for candidates
  const candidateNeighborsResult = await pool.query(
    `SELECT source_id, target_id
     FROM graph_edges
     WHERE source_id = ANY($1::text[]) OR target_id = ANY($1::text[])`,
    [candidateIds]
  );

  const candidateNeighborSets = new Map();
  for (const row of candidateNeighborsResult.rows) {
    if (candidateIds.includes(row.source_id)) {
      if (!candidateNeighborSets.has(row.source_id)) candidateNeighborSets.set(row.source_id, new Set());
      candidateNeighborSets.get(row.source_id).add(row.target_id);
    }
    if (candidateIds.includes(row.target_id)) {
      if (!candidateNeighborSets.has(row.target_id)) candidateNeighborSets.set(row.target_id, new Set());
      candidateNeighborSets.get(row.target_id).add(row.source_id);
    }
  }

  // Step 5: Compute Jaccard similarity
  const scored = [];
  for (const [cid, cNeighbors] of candidateNeighborSets) {
    const intersection = [...targetNeighbors].filter(n => cNeighbors.has(n));
    const union = new Set([...targetNeighbors, ...cNeighbors]);
    const similarity = intersection.length / union.size;
    if (similarity > 0) {
      scored.push({
        id: cid,
        similarity: Math.round(similarity * 1000) / 1000,
        commonNeighbors: intersection,
      });
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  const topN = scored.slice(0, safeLimit);

  // Resolve labels
  const nodeMap = await resolveNodes([...topN.map(s => s.id), ...topN.flatMap(s => s.commonNeighbors)]);

  return topN.map(s => {
    const node = nodeMap.get(s.id) || { id: s.id, label: s.id, type: 'unknown' };
    return {
      id: s.id,
      label: node.label,
      type: node.type,
      similarity: s.similarity,
      commonNeighbors: s.commonNeighbors.map(nid => {
        const n = nodeMap.get(nid) || { id: nid, label: nid };
        return { id: nid, label: n.label };
      }),
    };
  });
}

/**
 * 4. Enhanced community detection — community memberships with inter-community edges.
 */
export async function getCommunities() {
  // Get all metrics with community assignments
  const metricsResult = await pool.query(
    `SELECT node_id, pagerank, betweenness, community_id
     FROM graph_metrics_cache
     WHERE computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)`
  );

  if (metricsResult.rows.length === 0) {
    return { communities: [], isolatedCommunities: [] };
  }

  // Build community membership map
  const communityMembers = new Map(); // community_id -> [{ node_id, pagerank }]
  for (const row of metricsResult.rows) {
    const cid = row.community_id;
    if (cid == null) continue;
    if (!communityMembers.has(cid)) communityMembers.set(cid, []);
    communityMembers.get(cid).push({
      node_id: row.node_id,
      pagerank: row.pagerank ?? 0,
      betweenness: row.betweenness ?? 0,
    });
  }

  // Build node -> community lookup
  const nodeCommunity = new Map();
  for (const row of metricsResult.rows) {
    if (row.community_id != null) {
      nodeCommunity.set(row.node_id, row.community_id);
    }
  }

  // Get all edges to count inter-community bridges
  const edgeResult = await pool.query(
    `SELECT source_id, target_id FROM graph_edges`
  );

  // Count inter-community edges per community pair
  const bridgeCounts = new Map(); // community_id -> count of edges to other communities
  const interCommunityPairs = new Map(); // "min_max" -> count

  for (const edge of edgeResult.rows) {
    const srcComm = nodeCommunity.get(edge.source_id);
    const tgtComm = nodeCommunity.get(edge.target_id);
    if (srcComm != null && tgtComm != null && srcComm !== tgtComm) {
      bridgeCounts.set(srcComm, (bridgeCounts.get(srcComm) || 0) + 1);
      bridgeCounts.set(tgtComm, (bridgeCounts.get(tgtComm) || 0) + 1);

      const pairKey = [Math.min(srcComm, tgtComm), Math.max(srcComm, tgtComm)].join('_');
      interCommunityPairs.set(pairKey, (interCommunityPairs.get(pairKey) || 0) + 1);
    }
  }

  // Resolve hub node labels (top 3 by pagerank per community)
  const allHubIds = [];
  const communityHubs = new Map();
  for (const [cid, members] of communityMembers) {
    members.sort((a, b) => b.pagerank - a.pagerank);
    const hubs = members.slice(0, 3);
    communityHubs.set(cid, hubs);
    allHubIds.push(...hubs.map(h => h.node_id));
  }

  const nodeMap = await resolveNodes(allHubIds);

  // Build community objects
  const communities = [];
  for (const [cid, members] of communityMembers) {
    const hubs = (communityHubs.get(cid) || []).map(h => {
      const node = nodeMap.get(h.node_id) || { id: h.node_id, label: h.node_id, type: 'unknown' };
      return { id: h.node_id, label: node.label, type: node.type, pagerank: h.pagerank };
    });

    communities.push({
      id: cid,
      size: members.length,
      hubs,
      bridges: bridgeCounts.get(cid) || 0,
    });
  }

  communities.sort((a, b) => b.size - a.size);

  // Isolated communities: fewer than 2 inter-community edges
  const isolatedCommunities = communities
    .filter(c => c.bridges < 2)
    .map(c => c.id);

  return { communities, isolatedCommunities };
}
