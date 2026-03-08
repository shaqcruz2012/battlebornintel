import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useGraph, useGraphMetrics } from '../../api/hooks';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { useWindowSize } from '../../hooks/useWindowSize';
import { MainGrid } from '../layout/AppShell';
import { GraphControls, GraphOverlayControls } from './GraphControls';
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

  // Debounce dimensions so D3 layout doesn't recompute on every resize pixel
  const rawW = Math.min(winW - 64, 1200);
  const rawH = Math.max(500, winH - 280);
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
  // dims is passed to useGraphLayout so the worker re-runs only after the debounce
  // settles (and only when dims actually changed by > 50 px, per the guard above).

  // Active node types for API query
  const activeNodeTypes = useMemo(
    () => Object.entries(nodeFilters).filter(([, v]) => v).map(([k]) => k),
    [nodeFilters]
  );

  // Fetch graph data from API with region filtering
  const { data: graphData, isLoading: loadingGraph } = useGraph(activeNodeTypes, 2026, filters.region);
  const { data: metricsData, isLoading: loadingMetrics } = useGraphMetrics(activeNodeTypes);

  // Compute D3 layout in Web Worker to keep UI responsive
  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];
  // FIX 7b: Pass debounced dims so the worker uses stable viewport dimensions.
  // This is the primary consumer of `dims` state — it prevents D3 from seeing
  // a new width/height on every resize pixel while the debounce is unsettled.
  const { layout: workerLayout, isLoading: layoutLoading } = useGraphLayout(rawNodes, rawEdges, { width: dims.w, height: dims.h });

  // Resolve edge source/target from string IDs to node objects (required by GraphCanvas)
  const layout = useMemo(() => {
    const { nodes, edges } = workerLayout;
    if (!nodes.length) return { nodes: [], edges: [] };
    const nodeById = {};
    nodes.forEach((n) => { nodeById[n.id] = n; });
    const resolvedEdges = edges
      .filter((e) => nodeById[e.source] && nodeById[e.target])
      .map((e) => ({ ...e, source: nodeById[e.source], target: nodeById[e.target] }));
    return { nodes, edges: resolvedEdges };
  }, [workerLayout]);

  const metrics = metricsData || { pagerank: {}, betweenness: {}, communities: {}, watchlist: [] };

  if (loadingGraph || loadingMetrics || layoutLoading) {
    return (
      <MainGrid>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading graph...
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        <GraphControls
          nodeFilters={nodeFilters}
          onSetNodeFilters={setNodeFilters}
          search={search}
          onSearchChange={setSearch}
        />

        <div className={styles.body}>
          <div style={{ position: 'relative', flex: 1 }}>
            <GraphCanvas
              layout={layout}
              metrics={metrics}
              colorMode={colorMode}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
              searchTerm={search}
              showOpportunities={showOpportunities}
              opportunityFilter={opportunityFilter}
            />
            <GraphLegend colorMode={colorMode} nodeFilters={nodeFilters} layout={layout} />
            <GraphOverlayControls
              nodeFilters={nodeFilters}
              onToggleNode={toggleNode}
              colorMode={colorMode}
              onColorModeChange={setColorMode}
              showOpportunities={showOpportunities}
              onToggleOpportunities={handleToggleOpportunities}
              opportunityFilter={opportunityFilter}
              onOpportunityFilterChange={setOpportunityFilter}
            />
          </div>

          <NodeDetail
            nodeId={selectedNode}
            layout={layout}
            metrics={metrics}
            onClose={handleCloseNode}
          />
        </div>
      </div>
    </MainGrid>
  );
}
