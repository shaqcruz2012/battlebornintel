/**
 * Cytoscape.js Data Adapter
 * Converts buildGraph() output → Cytoscape elements format
 */

export function toCytoscapeElements(graphData) {
  const nodes = graphData.nodes.map(nodeToElement);
  const edges = graphData.edges.map(edgeToElement);
  return [...nodes, ...edges];
}

function nodeToElement(n) {
  return {
    group: 'nodes',
    data: {
      id: n.id,
      label: n.label,
      type: n.type,
      stage: n.stage || null,
      funding: n.funding || 0,
      momentum: n.momentum || 0,
      employees: n.employees || 0,
      city: n.city || null,
      region: n.region || null,
      sector: n.sector || [],
      fundType: n.fundType || null,
      role: n.role || null,
      note: n.note || null,
      etype: n.etype || null,
      atype: n.atype || null,
      eligible: n.eligible || [],
      founded: n.founded || null,
    },
    classes: [n.type, n.stage].filter(Boolean).join(' '),
  };
}

function edgeToElement(e, index) {
  const sid = typeof e.source === 'object' ? e.source.id : e.source;
  const tid = typeof e.target === 'object' ? e.target.id : e.target;
  return {
    group: 'edges',
    data: {
      id: `e_${sid}_${tid}_${e.rel}_${index}`,
      source: sid,
      target: tid,
      rel: e.rel,
      note: e.note || null,
      year: e.y || 2023,
    },
  };
}

/**
 * Build adjacency index: Map<nodeId, Set<neighborId>>
 * Used by progressive expand to find 1-hop neighbors efficiently.
 */
export function buildAdjacencyIndex(elements) {
  const adj = new Map();
  // Initialize all nodes
  elements.forEach(el => {
    if (el.group === 'nodes') {
      adj.set(el.data.id, new Set());
    }
  });
  // Add edges bidirectionally
  elements.forEach(el => {
    if (el.group === 'edges') {
      const s = el.data.source;
      const t = el.data.target;
      if (adj.has(s)) adj.get(s).add(t);
      if (adj.has(t)) adj.get(t).add(s);
    }
  });
  return adj;
}

/**
 * Get neighbor elements (nodes + edges) for a given node.
 * Returns { nodes: Element[], edges: Element[] }
 */
export function getNeighborElements(nodeId, allElements, adjacencyIndex) {
  const neighborIds = adjacencyIndex.get(nodeId) || new Set();
  const nodes = allElements.filter(
    el => el.group === 'nodes' && neighborIds.has(el.data.id)
  );
  const edges = allElements.filter(
    el =>
      el.group === 'edges' &&
      (el.data.source === nodeId || el.data.target === nodeId)
  );
  return { nodes, edges };
}
