/**
 * CytoscapeGraph — Canvas-based graph renderer
 * Wraps Cytoscape.js in a React ref-based pattern.
 * Handles: rendering, zoom/pan, per-node drag, events, hover highlight.
 */
import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import cola from 'cytoscape-cola';
import { buildStylesheet } from '../lib/cytoscapeStyles';
import { GP } from '../lib/constants';

// Register extensions once at module level
cytoscape.use(dagre);
cytoscape.use(cola);

const CytoscapeGraph = forwardRef(function CytoscapeGraph(
  {
    elements,
    layoutName,
    layoutConfig,
    colorMode,
    metrics,
    onNodeHover,
    onNodeSelect,
    onNodeContext,
    expandedNodeIds,
    seedId,
  },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const layoutRef = useRef(null);
  const prevElementsRef = useRef([]);

  // Stable callback refs to avoid stale closures in Cytoscape events
  const onNodeHoverRef = useRef(onNodeHover);
  const onNodeSelectRef = useRef(onNodeSelect);
  const onNodeContextRef = useRef(onNodeContext);
  useEffect(() => { onNodeHoverRef.current = onNodeHover; }, [onNodeHover]);
  useEffect(() => { onNodeSelectRef.current = onNodeSelect; }, [onNodeSelect]);
  useEffect(() => { onNodeContextRef.current = onNodeContext; }, [onNodeContext]);

  // Expose cy instance to parent
  useImperativeHandle(ref, () => ({
    getCy: () => cyRef.current,
    fit: () => cyRef.current?.fit(undefined, 40),
    center: () => cyRef.current?.center(),
    zoom: (level) => cyRef.current?.zoom(level),
  }));

  // ── Initialize Cytoscape (once) ──
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: buildStylesheet(colorMode, metrics),
      layout: { name: 'preset' },
      // Interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: false, // CRITICAL: enables per-node dragging
      autounselectify: false,
      selectionType: 'single',
      minZoom: 0.05,
      maxZoom: 5,
      // Performance for 4K-10K nodes
      textureOnViewport: true,
      motionBlur: false,
      hideEdgesOnViewport: false,
      hideLabelsOnViewport: false,
      pixelRatio: 'auto',
    });

    cyRef.current = cy;

    // ── Events (use refs for stable callbacks) ──

    // Hover → highlight 2-hop neighborhood
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      onNodeHoverRef.current?.(node.id());
      applyHoverHighlight(cy, node);
    });

    cy.on('mouseout', 'node', () => {
      onNodeHoverRef.current?.(null);
      clearHighlight(cy);
    });

    // Click → select node
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      onNodeSelectRef.current?.({
        ...node.data(),
        _x: node.position('x'),
        _y: node.position('y'),
      });
    });

    // Click background → deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onNodeSelectRef.current?.(null);
      }
    });

    // Right-click → context (expand in progressive mode)
    cy.on('cxttap', 'node', (evt) => {
      evt.originalEvent.preventDefault();
      onNodeContextRef.current?.(evt.target.id());
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync elements ──
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const prevIds = new Set(prevElementsRef.current.map((e) => e.data.id));
    const nextIds = new Set(elements.map((e) => e.data.id));

    cy.batch(() => {
      // Remove elements no longer present
      cy.elements().forEach((ele) => {
        if (!nextIds.has(ele.id())) ele.remove();
      });

      // Add new elements
      const toAdd = [];
      elements.forEach((elem) => {
        const existing = cy.getElementById(elem.data.id);
        if (existing.length === 0) {
          toAdd.push(elem);
        } else {
          // Update data on existing
          existing.data(elem.data);
          if (elem.classes) existing.classes(elem.classes);
        }
      });

      if (toAdd.length > 0) {
        cy.add(toAdd);
      }
    });

    prevElementsRef.current = elements;

    // Run layout after element change
    runLayout(cy, layoutConfig, layoutName, containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // ── Sync layout when user switches ──
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !cy.nodes().length) return;
    runLayout(cy, layoutConfig, layoutName, containerRef.current);
  }, [layoutName, layoutConfig]);

  // ── Sync stylesheet (colorMode / metrics change) ──
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style().fromJson(buildStylesheet(colorMode, metrics)).update();

    // Store metrics as scratch for style mappers
    if (metrics) {
      cy.nodes().forEach((node) => {
        const id = node.id();
        node.scratch('_pr', metrics.pagerank?.[id] ?? 0);
        node.scratch('_bc', metrics.betweenness?.[id] ?? 0);
        node.scratch('_comm', metrics.communities?.[id] ?? 0);
      });
    }
  }, [colorMode, metrics]);

  // ── Sync progressive expand classes ──
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.nodes().removeClass('cy-expanded cy-seed');
      if (seedId) {
        const seedNode = cy.getElementById(seedId);
        if (seedNode.length) seedNode.addClass('cy-seed');
      }
      if (expandedNodeIds) {
        expandedNodeIds.forEach((nid) => {
          const n = cy.getElementById(nid);
          if (n.length) n.addClass('cy-expanded');
        });
      }
    });
  }, [expandedNodeIds, seedId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 450,
        background: '#050508',
      }}
    />
  );
});

export default CytoscapeGraph;

// ── Helpers ──

function runLayout(cy, config, name, container) {
  if (!cy.nodes().length) return;

  const nodeCount = cy.nodes().length;
  const actualConfig = { ...config };

  // For large graphs, disable animation
  if (nodeCount > 500) {
    actualConfig.animate = false;
  }

  // Constrain geometric layouts to a viewport-proportional bounding box
  // This prevents grid/concentric/breadthfirst from creating huge spreads
  if (container && ['grid', 'concentric', 'breadthfirst'].includes(actualConfig.name)) {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;
    // Scale up proportionally so fit:true zooms to ~0.8-1.0
    const scale = Math.max(1, Math.sqrt(nodeCount / 50));
    actualConfig.boundingBox = { x1: 0, y1: 0, w: w * scale, h: h * scale };
  }

  // Circle layout: reduce spacing for large graphs
  if (actualConfig.name === 'circle' && nodeCount > 100) {
    actualConfig.spacingFactor = Math.max(0.3, 0.6 - (nodeCount - 100) * 0.001);
  }

  try {
    const layout = cy.layout(actualConfig);
    layout.run();
  } catch (e) {
    // Fallback to grid if layout fails
    console.warn(`Layout "${name}" failed, falling back to grid:`, e.message);
    cy.layout({ name: 'grid', animate: false, fit: true, padding: 40 }).run();
  }
}

function applyHoverHighlight(cy, hoveredNode) {
  cy.batch(() => {
    // Clear previous
    cy.elements().removeClass('cy-hover cy-neighbor cy-hop2 cy-dimmed cy-highlight');

    // Mark hovered
    hoveredNode.addClass('cy-hover');

    // 1-hop neighbors
    const hood = hoveredNode.neighborhood();
    hood.nodes().addClass('cy-neighbor');
    hood.edges().addClass('cy-highlight');

    // 2-hop neighbors
    hood.nodes().neighborhood().nodes().not(hoveredNode).not(hood.nodes()).addClass('cy-hop2');

    // Dim everything else
    const allConnected = hoveredNode
      .union(hood.nodes())
      .union(hood.nodes().neighborhood().nodes());
    cy.nodes().not(allConnected).addClass('cy-dimmed');
    cy.edges().not(hood.edges()).addClass('cy-dimmed');
  });
}

function clearHighlight(cy) {
  cy.batch(() => {
    cy.elements().removeClass(
      'cy-hover cy-neighbor cy-hop2 cy-dimmed cy-highlight'
    );
  });
}
