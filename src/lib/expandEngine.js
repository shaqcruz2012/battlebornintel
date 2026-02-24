/**
 * Progressive Expand Engine
 * Manages visible subset of graph nodes for seed-based exploration
 */

export function createExpandState(allElements, adjacencyIndex) {
  return {
    mode: 'full', // 'full' | 'progressive'
    seedId: null,
    visibleNodeIds: new Set(
      allElements.filter(e => e.group === 'nodes').map(e => e.data.id)
    ),
    expandedNodeIds: new Set(),
    allElements,
    adjacencyIndex,
  };
}

export function initProgressiveMode(state, seedId) {
  return {
    ...state,
    mode: 'progressive',
    seedId,
    visibleNodeIds: new Set([seedId]),
    expandedNodeIds: new Set(),
  };
}

export function expandNode(state, nodeId) {
  if (state.mode !== 'progressive') return state;
  const neighbors = state.adjacencyIndex.get(nodeId);
  if (!neighbors) return state;

  const newVisible = new Set(state.visibleNodeIds);
  const newExpanded = new Set(state.expandedNodeIds);
  neighbors.forEach(nId => newVisible.add(nId));
  newExpanded.add(nodeId);

  return {
    ...state,
    visibleNodeIds: newVisible,
    expandedNodeIds: newExpanded,
  };
}

export function collapseNode(state, nodeId) {
  if (state.mode !== 'progressive') return state;

  const newExpanded = new Set(state.expandedNodeIds);
  newExpanded.delete(nodeId);

  // Rebuild justified set: seed + all expanded nodes + their neighbors
  const justified = new Set([state.seedId]);
  newExpanded.forEach(expId => {
    justified.add(expId);
    const expNeighbors = state.adjacencyIndex.get(expId) || new Set();
    expNeighbors.forEach(nId => justified.add(nId));
  });

  return {
    ...state,
    visibleNodeIds: justified,
    expandedNodeIds: newExpanded,
  };
}

export function expandAll(state) {
  return {
    ...state,
    mode: 'full',
    visibleNodeIds: new Set(
      state.allElements.filter(e => e.group === 'nodes').map(e => e.data.id)
    ),
    expandedNodeIds: new Set(
      state.allElements.filter(e => e.group === 'nodes').map(e => e.data.id)
    ),
  };
}

export function resetToSeed(state) {
  if (!state.seedId) return state;
  return initProgressiveMode(state, state.seedId);
}

export function getVisibleElements(state) {
  if (state.mode === 'full') return state.allElements;
  const vis = state.visibleNodeIds;
  return state.allElements.filter(el => {
    if (el.group === 'nodes') return vis.has(el.data.id);
    if (el.group === 'edges')
      return vis.has(el.data.source) && vis.has(el.data.target);
    return false;
  });
}
