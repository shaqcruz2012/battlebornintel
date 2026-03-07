import { useState, useMemo } from 'react';
import { buildGraph, computeLayout } from '../../engine/graph-builder';
import { computeGraphMetrics } from '../../engine/graph-metrics';
import { useWindowSize } from '../../hooks/useWindowSize';
import { MainGrid } from '../layout/AppShell';
import { GraphControls } from './GraphControls';
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

const DEFAULT_REL_FILTERS = {
  eligible_for: true,
  operates_in: true,
  headquartered_in: true,
  invested_in: true,
  listed_on: true,
  accelerated_by: true,
  won_pitch: true,
  incubated_by: true,
  program_of: true,
  supports: true,
  housed_at: true,
};

export function GraphView() {
  const { width: winW, height: winH } = useWindowSize();
  const [nodeFilters, setNodeFilters] = useState(DEFAULT_NODE_FILTERS);
  const [colorMode, setColorMode] = useState('type');
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  const toggleNode = (key) =>
    setNodeFilters((f) => ({ ...f, [key]: !f[key] }));

  const w = Math.min(winW - 64, 1200);
  const h = Math.max(500, winH - 280);

  const graphData = useMemo(
    () => buildGraph(nodeFilters, DEFAULT_REL_FILTERS),
    [nodeFilters]
  );

  const layout = useMemo(
    () => computeLayout(graphData, w, h),
    [graphData, w, h]
  );

  const metrics = useMemo(
    () => computeGraphMetrics(graphData.nodes, graphData.edges),
    [graphData]
  );

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        <GraphControls
          nodeFilters={nodeFilters}
          onToggleNode={toggleNode}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
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
