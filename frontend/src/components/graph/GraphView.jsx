import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useGraphLight, useGraph, useGraphMetrics, usePredictedLinks } from '../../api/hooks';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { GraphOverlayControls } from './GraphControls';
import { GraphCanvas } from './GraphCanvas';
import { GraphLegend } from './GraphLegend';
import { NodeDetail } from './NodeDetail';
import { TemporalSlider } from './TemporalSlider';
import { AnalysisOverlayBar } from './AnalysisOverlayBar';
import { OverlayDetailPanel } from './OverlayDetailPanel';
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
  const [nodeFilters, setNodeFilters] = useState(DEFAULT_NODE_FILTERS);
  const [colorMode, setColorMode] = useState('type');
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [opportunityFilter, setOpportunityFilter] = useState('all');
  const [showValues, setShowValues] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [yearMax, setYearMax] = useState(2026);
  const [debouncedYearMax, setDebouncedYearMax] = useState(2026);

  // Analysis overlay toggles
  const [overlays, setOverlays] = useState({
    communities: false,
    capitalFlows: false,
    predictedLinks: false,
    bridges: false,
  });
  const toggleOverlay = useCallback((key) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Debounce yearMax by 300ms so scrubbing the slider doesn't flood API requests
  const yearDebounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(yearDebounceRef.current);
    yearDebounceRef.current = setTimeout(() => setDebouncedYearMax(yearMax), 300);
    return () => clearTimeout(yearDebounceRef.current);
  }, [yearMax]);

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

  // Measure the actual canvas container via ResizeObserver so the D3 layout
  // worker uses the real DOM size instead of a fragile window-based estimate.
  // This eliminates mismatches between worker coordinate space and render size.
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 }); // safe initial fallback
  const debounceRef = useRef(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Seed immediately from DOM measurement
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDims({ w: rect.width, h: rect.height });
    }
    // Track subsequent resizes with debounce
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          setDims((prev) => {
            if (Math.abs(width - prev.w) > 20 || Math.abs(height - prev.h) > 20) {
              return { w: width, h: height };
            }
            return prev;
          });
        }, 200);
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(debounceRef.current);
    };
  }, []); // run once on mount — observer handles subsequent changes

  // Active node types for API query
  const activeNodeTypes = useMemo(
    () => Object.entries(nodeFilters).filter(([, v]) => v).map(([k]) => k),
    [nodeFilters]
  );

  // Fetch lightweight graph data for fast initial render (smaller payload)
  const { data: lightGraphData, isLoading: loadingLightGraph, error: lightGraphError } = useGraphLight(activeNodeTypes, debouncedYearMax, filters.region);

  // Fetch full graph data in background for detail features ($ values, notes, node detail)
  const { data: fullDetailData } = useGraph(activeNodeTypes, debouncedYearMax, filters.region);

  // Use light data for initial render, upgrade to full data when available
  const graphData = fullDetailData || lightGraphData;
  const loadingGraph = loadingLightGraph && !lightGraphData;
  const graphError = lightGraphError;

  // Fetch total edge count (yearMax=2026) for the edge count indicator
  const { data: fullGraphData } = useGraphLight(activeNodeTypes, 2026, filters.region);
  const { data: metricsData, isLoading: loadingMetrics, error: metricsError } = useGraphMetrics(activeNodeTypes);

  // Fetch predicted links only when that overlay is active (lazy load)
  const { data: predictedLinksData } = usePredictedLinks(30, overlays.predictedLinks);

  // Compute D3 layout in Web Worker to keep UI responsive
  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  const metrics = metricsData || { pagerank: {}, betweenness: {}, communities: {}, communityNames: {} };

  // Attach community_id to each node before sending to the layout worker.
  // The worker uses _communityId for community-first clustering (v5 layout).
  // Use metricsData directly (not the fallback) so the dep is referentially stable.
  const communities = metricsData?.communities;
  const nodesWithCommunity = useMemo(() => {
    if (!rawNodes.length || !communities) return rawNodes;
    return rawNodes.map(n => ({
      ...n,
      _communityId: communities[n.id],
    }));
  }, [rawNodes, communities]);

  // isLoading stays true until the worker's final frame — used to gate fitAll.
  const { layout: workerLayout, isLoading: layoutLoading } = useGraphLayout(nodesWithCommunity, rawEdges, { width: dims.w, height: dims.h });

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

  // Show graph shell immediately — controls, legend, and empty canvas render
  // while data loads. The GraphCanvas handles its own empty/loading state.
  // This eliminates the blank white screen during initial data fetch.
  const isInitialLoading = loadingGraph || loadingMetrics;

  // Empty state — data loaded but no visible nodes (only show if not still loading)
  if (!isInitialLoading && rawNodes.length === 0) {
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
        {/* Main column: canvas + overlay detail panel stacked vertically */}
        <div className={styles.mainColumn}>
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
              overlays={overlays}
              predictedLinks={predictedLinksData}
              nodeDegreeMap={nodeDegreeMap}
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
            {/* Analysis overlay toggle bar */}
            <AnalysisOverlayBar overlays={overlays} onToggle={toggleOverlay} />
            {/* Bottom-dock temporal slider */}
            <TemporalSlider
              min={2015}
              max={2026}
              value={yearMax}
              onChange={setYearMax}
              visibleEdges={rawEdges.length}
              totalEdges={fullGraphData?.edges?.length || rawEdges.length}
            />
          </div>

          {/* Overlay detail tables — slides in when overlays active */}
          <OverlayDetailPanel
            overlays={overlays}
            nodes={layout.nodes}
            edges={layout.edges}
            metrics={metrics}
            predictedLinks={predictedLinksData}
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
