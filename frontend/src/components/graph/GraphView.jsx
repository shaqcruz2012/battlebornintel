import { useState, useMemo, useRef, useEffect } from 'react';
import { computeLayout } from '../../engine/graph-builder';
import { useGraph, useGraphMetrics } from '../../api/hooks';
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
  const { width: winW, height: winH } = useWindowSize();
  const [nodeFilters, setNodeFilters] = useState(DEFAULT_NODE_FILTERS);
  const [colorMode, setColorMode] = useState('type');
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

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
  const { w, h } = dims;

  // Active node types for API query
  const activeNodeTypes = useMemo(
    () => Object.entries(nodeFilters).filter(([, v]) => v).map(([k]) => k),
    [nodeFilters]
  );

  // Fetch graph data from API
  const { data: graphData, isLoading: loadingGraph } = useGraph(activeNodeTypes);
  const { data: metricsData, isLoading: loadingMetrics } = useGraphMetrics(activeNodeTypes);

  // D3 layout stays client-side (needs viewport dimensions)
  const layout = useMemo(
    () => graphData ? computeLayout(graphData, w, h) : { nodes: [], edges: [] },
    [graphData, w, h]
  );

  const metrics = metricsData || { pagerank: {}, betweenness: {}, communities: {}, watchlist: [] };

  if (loadingGraph || loadingMetrics) {
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
            />
            <GraphLegend colorMode={colorMode} nodeFilters={nodeFilters} />
            <GraphOverlayControls
              nodeFilters={nodeFilters}
              onToggleNode={toggleNode}
              colorMode={colorMode}
              onColorModeChange={setColorMode}
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
