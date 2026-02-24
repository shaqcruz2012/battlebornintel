/**
 * Cytoscape.js Stylesheet — Dark Palantir-Inspired Theme
 * Translates GP palette, NODE_CFG, REL_CFG, GSTAGE_C into Cytoscape selectors
 */
import { GP, NODE_CFG, REL_CFG, GSTAGE_C } from './constants';

export function buildStylesheet(colorMode, metrics) {
  const ss = [];

  // ── Base node style ──
  ss.push({
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'font-size': 8,
      color: GP.muted,
      'text-outline-color': '#050508',
      'text-outline-width': 2,
      'text-outline-opacity': 1,
      'text-max-width': '90px',
      'text-wrap': 'ellipsis',
      'background-opacity': 0.18,
      'border-width': 1,
      'border-opacity': 0.9,
      'min-zoomed-font-size': 7,
      'text-margin-y': 4,
      'overlay-padding': 4,
      'overlay-opacity': 0,
      shape: 'ellipse',
      width: 20,
      height: 20,
      'background-color': GP.muted,
      'border-color': GP.muted,
      'transition-property':
        'background-color, border-color, width, height, opacity, background-opacity',
      'transition-duration': '0.2s',
    },
  });

  // ── Node styles by entity type ──

  // Company nodes — size by funding, color by stage or metric
  ss.push({
    selector: 'node.company',
    style: {
      shape: 'ellipse',
      width: function (ele) {
        if (
          colorMode === 'pagerank' &&
          metrics?.pagerank?.[ele.id()] !== undefined
        )
          return Math.max(12, 8 + metrics.pagerank[ele.id()] * 0.4);
        if (
          colorMode === 'betweenness' &&
          metrics?.betweenness?.[ele.id()] !== undefined
        )
          return Math.max(12, 8 + metrics.betweenness[ele.id()] * 0.4);
        const f = ele.data('funding') || 0;
        return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, f)) * 0.6));
      },
      height: function (ele) {
        if (
          colorMode === 'pagerank' &&
          metrics?.pagerank?.[ele.id()] !== undefined
        )
          return Math.max(12, 8 + metrics.pagerank[ele.id()] * 0.4);
        if (
          colorMode === 'betweenness' &&
          metrics?.betweenness?.[ele.id()] !== undefined
        )
          return Math.max(12, 8 + metrics.betweenness[ele.id()] * 0.4);
        const f = ele.data('funding') || 0;
        return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, f)) * 0.6));
      },
      'background-color': function (ele) {
        return getNodeColor(ele, colorMode, metrics);
      },
      'border-color': function (ele) {
        return getNodeColor(ele, colorMode, metrics);
      },
    },
  });

  // Fund nodes
  ss.push({
    selector: 'node.fund',
    style: {
      shape: 'diamond',
      width: 40,
      height: 40,
      'background-color': NODE_CFG.fund.color,
      'border-color': NODE_CFG.fund.color,
      'font-size': 9,
      'font-weight': 600,
    },
  });

  // Accelerator nodes
  ss.push({
    selector: 'node.accelerator',
    style: {
      shape: 'triangle',
      width: 36,
      height: 36,
      'background-color': NODE_CFG.accelerator.color,
      'border-color': NODE_CFG.accelerator.color,
      'font-size': 9,
      'font-weight': 600,
    },
  });

  // Ecosystem nodes
  ss.push({
    selector: 'node.ecosystem',
    style: {
      shape: 'pentagon',
      width: 30,
      height: 30,
      'background-color': NODE_CFG.ecosystem.color,
      'border-color': NODE_CFG.ecosystem.color,
      'font-size': 8,
      'font-weight': 600,
    },
  });

  // External nodes
  ss.push({
    selector: 'node.external',
    style: {
      shape: 'round-triangle',
      width: 22,
      height: 22,
      'background-color': NODE_CFG.external.color,
      'border-color': NODE_CFG.external.color,
    },
  });

  // Person nodes
  ss.push({
    selector: 'node.person',
    style: {
      shape: 'ellipse',
      width: 18,
      height: 18,
      'background-color': NODE_CFG.person.color,
      'border-color': NODE_CFG.person.color,
    },
  });

  // Sector nodes
  ss.push({
    selector: 'node.sector',
    style: {
      shape: 'round-rectangle',
      width: 26,
      height: 26,
      'background-color': NODE_CFG.sector.color,
      'border-color': NODE_CFG.sector.color,
    },
  });

  // Region nodes
  ss.push({
    selector: 'node.region',
    style: {
      shape: 'round-rectangle',
      width: 28,
      height: 28,
      'background-color': NODE_CFG.region.color,
      'border-color': NODE_CFG.region.color,
    },
  });

  // Exchange nodes
  ss.push({
    selector: 'node.exchange',
    style: {
      shape: 'rectangle',
      width: 22,
      height: 22,
      'background-color': NODE_CFG.exchange.color,
      'border-color': NODE_CFG.exchange.color,
    },
  });

  // ── Base edge style ──
  ss.push({
    selector: 'edge',
    style: {
      width: 0.8,
      'line-color': GP.dim,
      'target-arrow-color': GP.dim,
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.5,
      'curve-style': 'bezier',
      opacity: 0.15,
      'transition-property': 'opacity, width, line-color',
      'transition-duration': '0.15s',
    },
  });

  // ── Edge styles per relationship type ──
  Object.entries(REL_CFG).forEach(([rel, cfg]) => {
    ss.push({
      selector: `edge[rel = "${rel}"]`,
      style: {
        'line-color': cfg.color,
        'target-arrow-color': cfg.color,
        width:
          rel === 'invested_in' || rel === 'acquired'
            ? 2
            : rel === 'loaned_to' || rel === 'funds'
              ? 1.6
              : rel === 'partners_with' || rel === 'contracts_with'
                ? 1.2
                : 0.8,
        'line-style': cfg.dash ? 'dashed' : 'solid',
      },
    });
  });

  // ── Interaction states ──

  // Hovered node
  ss.push({
    selector: 'node.cy-hover',
    style: {
      'border-width': 2.5,
      'background-opacity': 0.45,
      'font-size': 10,
      color: GP.text,
      'font-weight': 700,
      'z-index': 999,
      'overlay-color': GP.gold,
      'overlay-opacity': 0.06,
      'overlay-padding': 10,
    },
  });

  // Highlighted neighbors (1-hop)
  ss.push({
    selector: 'node.cy-neighbor',
    style: {
      opacity: 1,
      'border-width': 1.5,
      'background-opacity': 0.3,
      color: GP.text,
    },
  });

  // Highlighted neighbors (2-hop)
  ss.push({
    selector: 'node.cy-hop2',
    style: {
      opacity: 0.5,
    },
  });

  // Dimmed nodes (not connected to hovered)
  ss.push({
    selector: 'node.cy-dimmed',
    style: {
      opacity: 0.06,
    },
  });

  // Selected node
  ss.push({
    selector: 'node:selected',
    style: {
      'border-width': 2.5,
      'border-color': GP.gold,
      'background-opacity': 0.4,
      'overlay-color': GP.gold,
      'overlay-opacity': 0.1,
      'overlay-padding': 10,
      'font-size': 10,
      color: GP.text,
      'font-weight': 700,
    },
  });

  // Highlighted edges (connected to hovered/selected)
  ss.push({
    selector: 'edge.cy-highlight',
    style: {
      opacity: 0.85,
      width: 3,
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.8,
      'z-index': 100,
    },
  });

  // Dimmed edges
  ss.push({
    selector: 'edge.cy-dimmed',
    style: {
      opacity: 0.03,
    },
  });

  // ── Progressive expand: expanded nodes get a subtle indicator ──
  ss.push({
    selector: 'node.cy-expanded',
    style: {
      'border-style': 'double',
      'border-width': 3,
    },
  });

  // Seed node in progressive mode
  ss.push({
    selector: 'node.cy-seed',
    style: {
      'border-color': GP.gold,
      'border-width': 3,
      'background-opacity': 0.5,
      'overlay-color': GP.gold,
      'overlay-opacity': 0.08,
      'overlay-padding': 12,
    },
  });

  // Note: Cytoscape.js does not support CSS cursor property in its style system.
  // Per-node dragging is enabled via autoungrabify: false in the Cytoscape config.

  return ss;
}

function getNodeColor(ele, colorMode, metrics) {
  const id = ele.id();

  if (colorMode === 'community' && metrics?.communities?.[id] !== undefined) {
    const COMM_COLORS = [
      GP.gold, GP.green, GP.blue, GP.purple, GP.orange, GP.red, GP.cyan,
      GP.pink, GP.lime, GP.teal, '#E57373', '#64B5F6', '#FFD54F', '#AED581',
      '#BA68C8', '#4DD0E1',
    ];
    return COMM_COLORS[metrics.communities[id] % COMM_COLORS.length];
  }

  if (colorMode === 'pagerank' && metrics?.pagerank?.[id] !== undefined) {
    const v = metrics.pagerank[id];
    return v > 75 ? GP.gold : v > 50 ? GP.green : v > 25 ? GP.blue : GP.dim;
  }

  if (colorMode === 'betweenness' && metrics?.betweenness?.[id] !== undefined) {
    const v = metrics.betweenness[id];
    return v > 60 ? GP.red : v > 40 ? GP.orange : v > 20 ? GP.cyan : GP.dim;
  }

  // Default: by stage
  const type = ele.data('type');
  if (type === 'company') {
    return GSTAGE_C[ele.data('stage')] || GP.muted;
  }
  return NODE_CFG[type]?.color || GP.muted;
}
