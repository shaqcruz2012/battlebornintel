import { useState, useMemo, useRef, useEffect } from 'react';
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

  const toggleNode = (key) =>
    setNodeFilters((f) => ({ ...f, [key]: !f[key] }));

  // Debounce dimensions so D3 layout doesn't recompute on every resize pixel
  const rawW = Math.min(winW - 64, 1200);
  const rawH = Math.max(500, winH - 280);
  const [dims, setDims] = useState({ w: rawW, h: rawH });
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDims({ w: rawW, h: rawH }), 200);
    return () => clearTimeout(debounceRef.current);
  }, [rawW, rawH]);
  void dims; // dims state triggers re-renders when window dimensions change

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
  const { layout: workerLayout, isLoading: layoutLoading } = useGraphLayout(rawNodes, rawEdges);

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
              onSelectNode={setSelectedNode}
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
              onToggleOpportunities={() => setShowOpportunities((v) => !v)}
              opportunityFilter={opportunityFilter}
              onOpportunityFilterChange={setOpportunityFilter}
            />
          </div>

          <NodeDetail
            nodeId={selectedNode}
            layout={layout}
            metrics={metrics}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
    </MainGrid>
  );
}
