import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useGraph, useGraphMetrics } from '../../api/hooks';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { useWindowSize } from '../../hooks/useWindowSize';
import { GraphOverlayControls } from './GraphControls';
import { GraphCanvas } from './GraphCanvas';
import { GraphLegend } from './GraphLegend';
import { NodeDetail } from './NodeDetail';
import styles from './GraphView.module.css';

const DEFAULT_NODE_FILTERS = {
  company: true,
  fund: true,
  sector: false,
  region: false,
  person: true,
  external: true,
  exchange: false,
  accelerator: true,
  ecosystem: true,
  program: false,
};

export function GraphView() {
  const { filters } = useFilters();
  const { width: winW, height: winH } = useWindowSize();
  const [nodeFilters, setNodeFilters] = useState(DEFAULT_NODE_FILTERS);
  const [colorMode, setColorMode] = useState('type');
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [opportunityFilter, setOpportunityFilter] = useState('all');
  const [showValues, setShowValues] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState(null);

  // FIX 7a: Wrap in useCallback so GraphOverlayControls gets a stable reference
  // and doesn't re-render on every parent state change.
  const toggleNode = useCallback(
    (key) => setNodeFilters((f) => ({ ...f, [key]: !f[key] })),
    []
  );

  // Stable setSelectedNode wrapper so GraphCanvas's onSelectNode prop is stable.
  const handleSelectNode = useCallback((id) => setSelectedNode(id), []);
  const handleCloseNode = useCallback(() => setSelectedNode(null), []);
  const handleToggleOpportunities = useCallback(() => setShowOpportunities((v) => !v), []);
  const handleToggleValues = useCallback(() => setShowValues((v) => !v), []);

  // Select the node and trigger pan/zoom to it in the canvas.
  const handleFocusNode = useCallback((nodeId) => {
    setSelectedNode(nodeId);   // also select the node
    setFocusNodeId(nodeId);    // trigger pan/zoom in canvas
  }, []);

  // Reset focusNodeId after a short delay so re-focusing the same node works again.
  useEffect(() => {
    if (!focusNodeId) return;
    const t = setTimeout(() => setFocusNodeId(null), 300);
    return () => clearTimeout(t);
  }, [focusNodeId]);

  // Debounce dimensions so D3 layout doesn't recompute on every resize pixel.
  // No controls bar above canvas any more — just header(64) + tabs(40) = 104px overhead.
  const rawW = Math.min(winW - 16, 1800);
  const rawH = Math.max(640, winH - 104);
  const [dims, setDims] = useState({ w: rawW, h: rawH });
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Only update dims when the change is significant (>50px) to avoid
      // unnecessary re-renders from minor resize events.
      setDims((prev) => {
        if (Math.abs(rawW - prev.w) > 50 || Math.abs(rawH - prev.h) > 50) {
          return { w: rawW, h: rawH };
        }
        return prev;
      });
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [rawW, rawH]);

  // Ref to measure the actual canvas container size after mount.
  // Only override dims when the measured size differs by more than 50px from the
  // current estimate — avoids a spurious layout re-run on the first render when
  // the CSS-computed size is nearly identical to the window-based estimate.
  const canvasRef = useRef(null);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDims((prev) => {
        if (Math.abs(rect.width - prev.w) > 50 || Math.abs(rect.height - prev.h) > 50) {
          return { w: rect.width, h: rect.height };
        }
        return prev;
      });
    }
  }, []); // run once on mount

  // Active node types for API query
  const activeNodeTypes = useMemo(
    () => Object.entries(nodeFilters).filter(([, v]) => v).map(([k]) => k),
    [nodeFilters]
  );

  // Fetch graph data from API with region filtering
  const { data: graphData, isLoading: loadingGraph, error: graphError } = useGraph(activeNodeTypes, 2026, filters.region);
  const { data: metricsData, isLoading: loadingMetrics, error: metricsError } = useGraphMetrics(activeNodeTypes);

  // Compute D3 layout in Web Worker to keep UI responsive
  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];
  // isLoading stays true until the worker's final frame — used to gate fitAll.
  const { layout: workerLayout, isLoading: layoutLoading } = useGraphLayout(rawNodes, rawEdges, { width: dims.w, height: dims.h });

  // ── Progressive disclosure ────────────────────────────────────────────────
  // Compute degree from raw edges so we can filter low-degree leaf nodes on
  // initial render. The worker still runs on ALL nodes so positions are stable.
  // Hub nodes (degree ≥ 4) and any selected/focused node are always shown.
  // Isolated nodes (degree 0) are hidden by default — they add visual noise
  // without contributing to the relationship graph.
  //
  // Level 0 (default): degree ≥ 1  — show everything connected
  // This keeps the graph readable for the current dataset size (~700 nodes)
  // while hiding true isolates that have no edges at all.
  const nodeDegreeMap = useMemo(() => {
    const map = {};
    rawEdges.forEach((e) => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      map[s] = (map[s] || 0) + 1;
      map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [rawEdges]);

  // Resolve edge source/target from string IDs to node objects (required by GraphCanvas)
  const layout = useMemo(() => {
    const { nodes, edges } = workerLayout;
    if (!nodes.length) return { nodes: [], edges: [] };
    const nodeById = {};
    nodes.forEach((n) => { nodeById[n.id] = n; });

    // Filter out isolated nodes (degree 0) — they have no edges and only
    // create visual clutter in the periphery. Always keep hub nodes regardless.
    const HUB_RENDER_IDS = new Set(['f_bbv', 'goed', 'eco_goed', 'bbv', 'f_dfv', 'dfv']);
    const searchLower = search?.toLowerCase();
    const visibleNodes = nodes.filter((n) => {
      if (HUB_RENDER_IDS.has(n.id)) return true;
      if (selectedNode === n.id) return true;
      if (searchLower && n.label?.toLowerCase().includes(searchLower)) return true;
      return (nodeDegreeMap[n.id] || 0) >= 1;
    });
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    // At this stage edges from the worker have string IDs for source/target.
    // Only keep edges where both endpoints are visible and resolvable.
    const resolvedEdges = edges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .filter((e) => nodeById[e.source] && nodeById[e.target])
      .map((e) => ({ ...e, source: nodeById[e.source], target: nodeById[e.target] }));
    return { nodes: visibleNodes, edges: resolvedEdges };
  }, [workerLayout, nodeDegreeMap, selectedNode, search]);

  const metrics = metricsData || { pagerank: {}, betweenness: {}, communities: {}, watchlist: [] };

  // Error state — show message with retry button
  if (graphError || metricsError) {
    return (
      <div className={styles.graphPage}>
        <div className={styles.errorState}>
          <h3>Graph data unavailable</h3>
          <p>{graphError?.message || metricsError?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Block render only while raw graph data is being fetched from the API.
  // D3 layout streams interim frames so the canvas renders progressively.
  if (loadingGraph || loadingMetrics) {
    return (
      <div className={styles.graphPage}>
        <div className={styles.loadingCenter}>
          Loading graph...
        </div>
      </div>
    );
  }

  // Empty state — data loaded but no visible nodes
  if (rawNodes.length === 0) {
    return (
      <div className={styles.graphPage}>
        <div className={styles.emptyState}>
          <h3>No graph data available</h3>
          <p>
            The knowledge graph has {rawEdges.length} edge{rawEdges.length !== 1 ? 's' : ''} but
            no visible nodes with current filters.
          </p>
          <p>Try adjusting node type filters to show more data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.graphPage}>
      <div className={styles.body}>
        {/* Canvas area — fills all available space */}
        <div className={styles.canvasOuter} ref={canvasRef}>
          <GraphCanvas
            layout={layout}
            metrics={metrics}
            colorMode={colorMode}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
            searchTerm={search}
            showOpportunities={showOpportunities}
            opportunityFilter={opportunityFilter}
            showValues={showValues}
            focusNodeId={focusNodeId}
            layoutSettled={!layoutLoading}
            layoutWidth={dims.w}
            layoutHeight={dims.h}
          />
          {/* Left overlay: legend (minimizable) */}
          <GraphLegend colorMode={colorMode} nodeFilters={nodeFilters} layout={layout} />
          {/* Right overlay: node/color/edge controls + search (minimizable) */}
          <GraphOverlayControls
            nodeFilters={nodeFilters}
            onToggleNode={toggleNode}
            onSetNodeFilters={setNodeFilters}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            showOpportunities={showOpportunities}
            onToggleOpportunities={handleToggleOpportunities}
            opportunityFilter={opportunityFilter}
            onOpportunityFilterChange={setOpportunityFilter}
            showValues={showValues}
            onToggleValues={handleToggleValues}
            search={search}
            onSearchChange={setSearch}
            nodes={layout.nodes}
            onFocusNode={handleFocusNode}
          />
        </div>

        {/* Node detail sidebar — slides in on node select */}
        <NodeDetail
          nodeId={selectedNode}
          layout={layout}
          metrics={metrics}
          onClose={handleCloseNode}
        />
      </div>
    </div>
  );
}
