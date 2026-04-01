import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { fmt } from '../../engine/formatters';
import { AnalysisOverlays } from './AnalysisOverlays';
import styles from './GraphCanvas.module.css';

// TODO: KMEANS_COLORS is duplicated in GraphLegend.jsx — extract to data/constants.js
const KMEANS_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#82E0AA', '#F0B27A', '#AEB6BF', '#D7BDE2', '#A3E4D7',
];

const MIN_R = 3;
const MAX_R = 11;
const DPR = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
const TIER_LABELS = { cluster: 'CLUSTER', region: 'REGION', detail: 'DETAIL' };

// Hub node IDs that anchor the galactic core — boosted radius + glow prominence
const HUB_NODE_IDS = new Set(['f_bbv', 'goed', 'eco_goed', 'bbv', 'f_dfv', 'dfv']);

function nodeRadius(node, pagerank) {
  // Galactic core anchors: BBV fund and GOED ecosystem get boosted radii
  if (HUB_NODE_IDS.has(node.id)) return 13;
  if (node.type === 'fund' || node.type === 'accelerator') return 8;
  if (node.type === 'sector' || node.type === 'ecosystem' || node.type === 'region') return 6;
  if (node.type === 'company') {
    // Use normalized PageRank (0–1) for log-scaled radius when available,
    // otherwise fall back to funding-based sizing.
    const pr = pagerank?.[node.id];
    if (pr !== undefined) {
      return MIN_R + (MAX_R - MIN_R) * Math.log(1 + pr * 9) / Math.log(10);
    }
    const f = Number(node.funding) || 0;
    return Math.min(MAX_R, 4 + Math.sqrt(Math.max(0, f)) * 0.15);
  }
  // External nodes: 20% smaller than default to reduce visual dominance of the cloud
  if (node.type === 'external') return 4;
  return 5;
}

function nodeColor(node, colorMode, communities, kmeansMap) {
  if (colorMode === 'community' && communities) {
    const cid = communities[node.id];
    return cid !== undefined ? COMM_COLORS[cid % COMM_COLORS.length] : '#555';
  }
  if (colorMode === 'attribute' && kmeansMap) {
    const km = kmeansMap[node.id];
    if (km) return KMEANS_COLORS[km.cluster % KMEANS_COLORS.length];
    return '#555';
  }
  return NODE_CFG[node.type]?.color || '#888';
}

function edgeId(e) {
  const sid = typeof e.source === 'object' ? e.source.id : e.source;
  const tid = typeof e.target === 'object' ? e.target.id : e.target;
  return { sid, tid };
}

function edgeLabelText(e) {
  const rc = REL_CFG[e.rel];
  return rc?.label || e.rel?.replace(/_/g, ' ') || '';
}

function edgeValue(e) {
  if (e.note) {
    const match = e.note.match(/\$[\d,.]+[BMK]?/);
    if (match) return match[0];
  }
  return '';
}

/* ── Radial opacity: nodes near the canvas centroid appear brighter ── */
// Returns an opacity in [0.68, 1.0] — center nodes full opacity, outer nodes 0.68.
// We compute the centroid lazily from the node array passed in.
function radialOpacity(node, centroidX, centroidY, maxDist) {
  if (!maxDist) return 1;
  const dx = (node.x || 0) - centroidX;
  const dy = (node.y || 0) - centroidY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Linear falloff: center=1.0, edge=0.68
  return 1.0 - 0.32 * Math.min(dist / maxDist, 1);
}

/* ── SVG filter definitions for glow effects ── */

const GlowFilters = memo(function GlowFilters() {
  return (
    <defs>
      {/* Node hover/selection glow */}
      <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      {/* Selected node stronger glow — only applied to the single selected node */}
      <filter id="nodeGlowStrong" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      {/* Hub node glow removed — hub nodes use CSS-equivalent concentric circles
          (fillOpacity rings in NodeCircle) which avoid GPU compositing layer overhead */}
    </defs>
  );
});

/* ── Memoized sub-components ── */

const EdgeLabel = memo(function EdgeLabel({ sx, sy, tx, ty, label, val, relColor }) {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const labelWidth = Math.max(60, label.length * 5 + 16);
  const halfW = labelWidth / 2;

  return (
    <g pointerEvents="none">
      {/* Bloomberg-style annotation card */}
      <rect
        x={mx - halfW} y={my - 14}
        width={labelWidth} height={val ? 26 : 16}
        rx={2}
        fill="rgba(12, 16, 20, 0.92)"
        stroke={relColor || 'rgba(255, 255, 255, 0.1)'}
        strokeWidth={0.5}
      />
      <text
        x={mx} y={my - 3}
        textAnchor="middle"
        fill={relColor || 'var(--text-disabled)'}
        fontSize={7} fontFamily="var(--font-body)"
        fontWeight="600" letterSpacing="0.5"
      >
        {label.toUpperCase()}
      </text>
      {val && (
        <text
          x={mx} y={my + 8}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize={8}
          fontFamily="'SF Mono', 'Cascadia Code', 'Consolas', monospace"
          fontWeight="700"
          letterSpacing="-0.2"
        >
          {val}
        </text>
      )}
    </g>
  );
});

// FIX 1 + FIX 5: NodeCircle no longer receives inline arrow callbacks (defeats memo) and
// no longer applies the glow filter via inline style — the parent renders a single
// <g filter="url(#nodeGlowStrong)"> wrapper only for the selected node.
// FIX 8: onHover now receives (nodeId, event) via a single stable callback from parent,
// instead of a per-node closure map that defeated React.memo on every layout frame.
const NodeCircle = memo(function NodeCircle({
  node, r, fill, isSelected, isConnected, hasSelection, dim,
  onSelect, onHover, onLeave,
  baseOpacity,  // radial galactic-core opacity (0.68–1.0), applied when not dim/selected
  isHub,        // true for BBV/GOED hub nodes — always full opacity + persistent glow
  labelMinR = 10, // LOD: minimum radius to show label (varies by zoom tier)
}) {
  const showLabel = r >= labelMinR || isSelected || (isConnected && hasSelection);

  // Hub nodes are always fully visible; selection states take precedence over radial fade
  const groupOpacity = dim ? 0.1
    : isHub ? 1
    : isSelected || isConnected ? 1
    : (baseOpacity ?? 1);

  return (
    <g opacity={groupOpacity} style={{ transition: 'opacity 300ms ease' }}>
      {/* Soft outer glow for connected nodes */}
      {isConnected && !isSelected && hasSelection && (
        <>
          <circle
            cx={node.x} cy={node.y} r={r + 6}
            fill={fill} fillOpacity={0.06}
          />
          <circle
            cx={node.x} cy={node.y} r={r + 3}
            fill="none" stroke="var(--accent-teal)"
            strokeWidth={0.8} opacity={0.35} strokeDasharray="3,2"
          />
        </>
      )}
      {/* Selected node glow ring */}
      {isSelected && (
        <>
          <circle
            cx={node.x} cy={node.y} r={r + 8}
            fill={fill} fillOpacity={0.08}
          />
          <circle
            cx={node.x} cy={node.y} r={r + 4}
            fill="none" stroke="var(--accent-teal)"
            strokeWidth={1.5} opacity={0.5}
          />
        </>
      )}
      {/* Hub node (BBV/GOED) persistent ambient glow rings — galactic core effect */}
      {isHub && !isSelected && (
        <>
          <circle
            cx={node.x} cy={node.y} r={r + 14}
            fill={fill} fillOpacity={0.04}
            pointerEvents="none"
          />
          <circle
            cx={node.x} cy={node.y} r={r + 8}
            fill={fill} fillOpacity={0.08}
            pointerEvents="none"
          />
          <circle
            cx={node.x} cy={node.y} r={r + 3}
            fill="none" stroke={fill}
            strokeWidth={1} opacity={0.3}
            pointerEvents="none"
          />
        </>
      )}
      {/* Main node circle — glow filter is applied by the parent wrapper, not here */}
      <circle
        cx={node.x} cy={node.y} r={r}
        fill={fill}
        stroke={
          isHub && !isSelected
            ? 'rgba(255,255,255,0.35)'
            : isSelected
              ? '#fff'
              : isConnected && hasSelection
                ? 'var(--accent-teal)'
                : 'rgba(0,0,0,0.25)'
        }
        strokeWidth={isHub && !isSelected ? 1 : isSelected ? 1.5 : isConnected && hasSelection ? 1 : 0.4}
        style={{
          cursor: 'pointer',
          transition: 'r 150ms ease, stroke-width 200ms ease, stroke 200ms ease',
        }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={(e) => onHover(node.id, e)}
        onMouseLeave={onLeave}
      />
      {/* Node label */}
      {showLabel && (
        <>
          {/* Label text shadow for readability */}
          <text
            x={node.x} y={node.y + r + 12}
            textAnchor="middle"
            fill="rgba(5, 6, 9, 0.7)"
            fontSize={isSelected ? 10 : 9}
            fontFamily="var(--font-body)"
            fontWeight={isSelected || (isConnected && hasSelection) ? '600' : '400'}
            pointerEvents="none"
            stroke="rgba(5, 6, 9, 0.7)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          >
            {node.label?.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
          </text>
          <text
            x={node.x} y={node.y + r + 12}
            textAnchor="middle"
            fill={
              isSelected
                ? 'var(--text-primary)'
                : isConnected && hasSelection
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)'
            }
            fontSize={isSelected ? 10 : 9}
            fontFamily="var(--font-body)"
            fontWeight={isSelected || (isConnected && hasSelection) ? '600' : '400'}
            pointerEvents="none"
          >
            {node.label?.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
          </text>
        </>
      )}
    </g>
  );
});

/* ── Canvas edge renderer — draws all edges in one GPU-friendly pass ── */

function useEdgeCanvas(canvasRef, edges, zoom, pan, w, h, {
  selectedNode, highlightedEdges, showOpportunities, opportunityFilter,
  tooManyForFullOpacity,
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !edges.length) return;

    // Size canvas to match container (HiDPI-aware)
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Batch edges by color+opacity to minimize context state changes
    const batches = new Map();

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const sx = e.source?.x ?? 0;
      const sy = e.source?.y ?? 0;
      const tx = e.target?.x ?? 0;
      const ty = e.target?.y ?? 0;

      // Skip edges with no valid positions
      if ((sx === 0 && sy === 0 && tx === 0 && ty === 0) || isNaN(sx) || isNaN(sy) || isNaN(tx) || isNaN(ty)) continue;

      const isOpportunity = e.category === 'opportunity' || e.rel === 'qualifies_for' || e.rel === 'fund_opportunity' || e.rel === 'potential_lp';
      if (isOpportunity && !showOpportunities) continue;
      if (isOpportunity && opportunityFilter === 'programs' && e.rel !== 'qualifies_for') continue;
      if (isOpportunity && opportunityFilter === 'funds' && e.rel !== 'fund_opportunity') continue;

      const rc = REL_CFG[e.rel];
      const isHighlighted = highlightedEdges.has(i);
      const dimEdge = selectedNode && !isHighlighted;

      const category = e.category || 'operational';
      let categoryOpacity;
      if (category === 'historical') {
        categoryOpacity = tooManyForFullOpacity ? 0.18 : 0.25;
      } else if (category === 'opportunity') {
        categoryOpacity = 0.15;
      } else {
        categoryOpacity = tooManyForFullOpacity ? 0.22 : 0.35;
      }

      const edgeOpacity = isOpportunity
        ? (e.opacity ?? (dimEdge ? 0.05 : 0.5))
        : (dimEdge ? 0.06 : isHighlighted ? 0.85 : categoryOpacity);
      const edgeWidth = isOpportunity ? (isHighlighted ? 1.5 : 0.5) : (isHighlighted ? 2 : 0.5);
      const edgeColor = e.color || (isHighlighted ? (rc?.color || '#45D7C6') : (rc?.color || '#333'));

      // Batch key: color + opacity + width (rounded)
      const key = `${edgeColor}|${edgeOpacity.toFixed(2)}|${edgeWidth}`;
      if (!batches.has(key)) {
        batches.set(key, { color: edgeColor, opacity: edgeOpacity, width: edgeWidth, lines: [] });
      }
      batches.get(key).lines.push(sx, sy, tx, ty);
    }

    // Draw each batch in a single path
    for (const [, batch] of batches) {
      ctx.globalAlpha = batch.opacity;
      ctx.strokeStyle = batch.color;
      ctx.lineWidth = batch.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const lines = batch.lines;
      for (let j = 0; j < lines.length; j += 4) {
        ctx.moveTo(lines[j], lines[j + 1]);
        ctx.lineTo(lines[j + 2], lines[j + 3]);
      }
      ctx.stroke();
    }

    // ── Galactic core glow ────────────────────────────────────────────────
    // Radial gradient centered on the node centroid simulates the luminous
    // core of the Milky Way. Uses 'screen' blending so it brightens edges
    // near the center without obscuring them.
    if (edges.length > 50) {
      let sumX = 0, sumY = 0, count = 0;
      for (let i = 0; i < edges.length; i++) {
        const sx = edges[i].source?.x; const sy = edges[i].source?.y;
        if (sx != null && sy != null) { sumX += sx; sumY += sy; count++; }
      }
      if (count > 0) {
        const coreCx = sumX / count;
        const coreCy = sumY / count;
        const glowR = Math.min(w, h) * 0.6;
        const gradient = ctx.createRadialGradient(coreCx, coreCy, 0, coreCx, coreCy, glowR);
        gradient.addColorStop(0, 'rgba(255, 220, 150, 0.07)');   // warm gold core
        gradient.addColorStop(0.25, 'rgba(180, 210, 255, 0.04)'); // blue-white disc
        gradient.addColorStop(0.6, 'rgba(100, 140, 200, 0.02)'); // faint blue halo
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');            // transparent edge
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.fillRect(coreCx - glowR, coreCy - glowR, glowR * 2, glowR * 2);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    ctx.restore();
  }, [canvasRef, edges, zoom, pan, w, h, selectedNode, highlightedEdges, showOpportunities, opportunityFilter, tooManyForFullOpacity]);
}

/* ── Main canvas ── */

export function GraphCanvas({
  layout,
  metrics,
  colorMode = 'type',
  selectedNode,
  onSelectNode,
  searchTerm = '',
  showOpportunities = false,
  opportunityFilter = 'all', // 'all' | 'programs' | 'funds'
  showValues = false,
  focusNodeId = null,
  layoutSettled = false,
  // Overlay + clustering props
  overlays = {},
  predictedLinks = null,
  kmeansMap = null,
  selectedCluster = null,
  nodeDegreeMap = {},
  layoutWidth = 1200,
  layoutHeight = 700,
}) {
  const containerRef = useRef(null);
  const edgeCanvasRef = useRef(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // FIX 2: Tooltip state moved to refs — mouse-move no longer triggers React re-renders.
  // We imperatively update a DOM div so the SVG subtree is untouched on hover.
  const tooltipRef = useRef(null);

  // Use the actual container dimensions (from ResizeObserver in GraphView)
  // instead of window-based estimates. This ensures canvas and SVG use the
  // exact same coordinate space as the container they render into.
  const w = layoutWidth;
  const h = layoutHeight;

  const fitAll = useCallback(() => {
    const { nodes } = layout;
    if (!nodes || !nodes.length) return;
    // Single-pass bounds computation — avoids 4 spread operations + 2 temp arrays
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < nodes.length; ++i) {
      const nx = nodes[i].x || 0, ny = nodes[i].y || 0;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    }
    const padX = 60, padY = 60;
    const fitW = Math.max(maxX - minX, 1);
    const fitH = Math.max(maxY - minY, 1);
    // Clamp minimum zoom to 0.15 — prevents near-zero scale when positions are extreme
    const s = Math.max(0.15, Math.min((w - padX * 2) / fitW, (h - padY * 2) / fitH, 2));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setZoom(s);
    setPan({ x: w / 2 - cx * s, y: h / 2 - cy * s });
  }, [layout, w, h]);

  // Auto-fit: wait for the D3 worker to finish (layoutSettled) before fitting.
  // Fitting on early interim frames produces near-zero zoom because node positions
  // are still exploding outward from the force simulation's initial state.
  const hasFitRef = useRef(false);
  useEffect(() => {
    if (layout.nodes.length === 0) {
      hasFitRef.current = false;
      return;
    }
    if (layout.nodes.length > 0 && !hasFitRef.current && layoutSettled) {
      hasFitRef.current = true;
      requestAnimationFrame(fitAll);
    }
  }, [layout.nodes.length, layoutSettled, fitAll]);

  useEffect(() => {
    if (!focusNodeId) return;
    const node = layoutRef.current.nodes.find((n) => n.id === focusNodeId);
    if (!node) return;
    const targetZoom = Math.max(zoom, 1.8);
    setZoom(targetZoom);
    setPan({
      x: w / 2 - (node.x || 0) * targetZoom,
      y: h / 2 - (node.y || 0) * targetZoom,
    });
  }, [focusNodeId, zoom, w, h]);

  const searchLower = searchTerm.toLowerCase();
  const matchesSearch = useCallback(
    (node) =>
      !searchTerm ||
      node.label?.toLowerCase().includes(searchLower) ||
      node.id?.toLowerCase().includes(searchLower),
    [searchTerm, searchLower]
  );

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback(
    (e) => {
      if (dragging && dragStart) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [dragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragStart(null);
  }, []);

  // Double-click zoom — zooms in 2x centered on cursor position
  const handleDoubleClick = useCallback((e) => {
    // Don't zoom when double-clicking on nodes
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setZoom((z) => {
      const newZ = Math.min(3, z * 1.8);
      const factor = newZ / z;
      setPan((p) => ({
        x: cx - (cx - p.x) * factor,
        y: cy - (cy - p.y) * factor,
      }));
      return newZ;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const { nodes, edges } = layout;

  // FIX 2: Imperative tooltip helpers — no setState, no re-renders on hover.
  const showTooltip = useCallback((node, clientX, clientY) => {
    const el = tooltipRef.current;
    if (!el) return;

    const typeColor = NODE_CFG[node.type]?.color || '#888';

    // Build tooltip using DOM API to avoid XSS via innerHTML
    el.textContent = '';

    const header = document.createElement('div');
    header.className = styles.tooltipHeader;

    const nameDiv = document.createElement('div');
    nameDiv.className = styles.tooltipName;
    nameDiv.textContent = node.label ?? '';
    header.appendChild(nameDiv);

    const typeDiv = document.createElement('div');
    typeDiv.className = styles.tooltipType;
    typeDiv.style.color = typeColor;
    typeDiv.textContent = `${NODE_CFG[node.type]?.icon ?? ''} ${NODE_CFG[node.type]?.label ?? node.type}`;
    header.appendChild(typeDiv);

    el.appendChild(header);

    // Collect metric entries
    const metricParts = [];
    if (node.type === 'company') {
      if (node.funding) metricParts.push({ label: 'Funding', value: fmt(node.funding) });
      if (node.stage)   metricParts.push({ label: 'Stage',   value: node.stage.replace(/_/g, ' ') });
      if (node.employees) metricParts.push({ label: 'Emp',   value: String(node.employees) });
      if (node.momentum)  metricParts.push({ label: 'MTM',   value: String(node.momentum) });
    }

    const pr = metrics?.pagerank?.[node.id];
    if (pr !== undefined) {
      metricParts.push({ label: 'PR', value: pr.toFixed(2) });
    }

    if (metricParts.length > 0) {
      const metricsDiv = document.createElement('div');
      metricsDiv.className = styles.tooltipMetrics;
      metricParts.forEach(m => {
        const row = document.createElement('div');
        row.className = styles.tooltipMetric;
        const lbl = document.createElement('span');
        lbl.className = styles.tooltipMetricLabel;
        lbl.textContent = m.label;
        const val = document.createElement('span');
        val.className = styles.tooltipMetricValue;
        val.textContent = m.value;
        row.appendChild(lbl);
        row.appendChild(val);
        metricsDiv.appendChild(row);
      });
      el.appendChild(metricsDiv);
    }

    el.style.left = `${clientX + 14}px`;
    el.style.top  = `${clientY - 10}px`;
    el.style.display = 'block';
  }, [metrics]);

  const hideTooltip = useCallback(() => {
    const el = tooltipRef.current;
    if (el) el.style.display = 'none';
  }, []);

  // Compute connected node IDs and highlighted edges for selected node
  const { connectedIds, highlightedEdges } = useMemo(() => {
    if (!selectedNode) return { connectedIds: new Set(), highlightedEdges: new Set() };
    const cIds = new Set();
    const hEdges = new Set();
    edges.forEach((e, i) => {
      const { sid, tid } = edgeId(e);
      if (sid === selectedNode || tid === selectedNode) {
        cIds.add(sid);
        cIds.add(tid);
        hEdges.add(i);
      }
    });
    return { connectedIds: cIds, highlightedEdges: hEdges };
  }, [selectedNode, edges]);

  // FIX 1: Single stable callback instead of per-node map.
  // NodeCircle calls onSelect(nodeId) and this handler toggles selection.
  // Only depends on selectedNode and onSelectNode — not nodes — so it stays
  // stable across D3 layout frames and preserves React.memo on 710+ nodes.
  const handleNodeSelect = useCallback(
    (nodeId) => onSelectNode?.(nodeId === selectedNode ? null : nodeId),
    [selectedNode, onSelectNode],
  );

  // FIX 8: Single stable hover callback — replaces per-node closure map that
  // defeated React.memo on every layout frame. NodeCircle calls onHover(nodeId, event)
  // and this callback looks up the node from a ref (no closure over `nodes`).
  const nodeByIdRef = useRef(new Map());
  useEffect(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    nodeByIdRef.current = map;
  }, [nodes]);

  const handleNodeHover = useCallback((nodeId, e) => {
    const node = nodeByIdRef.current.get(nodeId);
    if (node) showTooltip(node, e.clientX, e.clientY);
  }, [showTooltip]);

  // FIX 4: Pre-compute display thresholds once.
  const nodeCount = nodes.length;
  const tooManyForEdgeLabels = nodeCount > 150;   // skip edge labels entirely
  const tooManyForFullOpacity = nodeCount > 300;  // reduce non-selected edge opacity

  // Galactic core: compute centroid + max-distance for radial opacity falloff.
  // Only active when graph is large enough to have a meaningful core/halo structure.
  const { centroidX, centroidY, maxDist } = useMemo(() => {
    if (nodeCount < 50) return { centroidX: 0, centroidY: 0, maxDist: 0 };
    let sumX = 0, sumY = 0;
    nodes.forEach((n) => { sumX += n.x || 0; sumY += n.y || 0; });
    const cx = sumX / nodeCount;
    const cy = sumY / nodeCount;
    let maxD = 0;
    nodes.forEach((n) => {
      const dx = (n.x || 0) - cx;
      const dy = (n.y || 0) - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxD) maxD = d;
    });
    return { centroidX: cx, centroidY: cy, maxDist: maxD };
  }, [nodes, nodeCount]);

  // Pre-compute edge dollar values once when edges change (avoids regex per render per edge)
  const edgeValueMap = useMemo(() => {
    const map = new Map();
    edges.forEach((e, i) => {
      const val = edgeValue(e);
      if (val) map.set(i, val);
    });
    return map;
  }, [edges]);

  // ── LOD Zoom Tiers ──────────────────────────────────────────────────────
  // Cluster (<0.6): high-level overview — only hubs + high-degree nodes visible
  // Region (0.6–1.2): all nodes shown, labels on hubs + medium nodes
  // Detail (>1.2): full labels, edge labels for selection, full tooltip detail
  const zoomTier = zoom < 0.6 ? 'cluster' : zoom > 1.2 ? 'detail' : 'region';
  // Progressive LOD — more nodes appear as you zoom in
  const minDegreeForRender = zoom < 0.4 ? 8 : zoom < 0.5 ? 5 : zoom < 0.6 ? 3 : zoom < 0.8 ? 1 : 0;
  const labelMinR = zoom < 0.5 ? 13 : zoom < 0.7 ? 10 : zoom < 1.0 ? 7 : 5;

  // Canvas edge renderer — replaces 5000+ SVG <line> elements with one draw call
  useEdgeCanvas(edgeCanvasRef, edges, zoom, pan, w, h, {
    selectedNode,
    highlightedEdges,
    showOpportunities,
    opportunityFilter,
    tooManyForFullOpacity,
  });

  if (!nodes || nodes.length === 0) {
    return (
      <div className={styles.canvasWrap} ref={containerRef}>
        <div style={{ padding: 40, color: 'var(--text-disabled)', textAlign: 'center' }}>
          No graph data. Enable node types in controls.
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.canvasWrap}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: dragging ? 'grabbing' : undefined }}
    >
      {/* Status indicator — real-time Bloomberg feel */}
      <div className={styles.statusBar}>
        <span className={styles.statusDot} />
        <span>{nodes.length} nodes &middot; {edges.length} edges</span>
      </div>

      {/* Canvas layer for edges — one draw call replaces 5000+ SVG elements */}
      <canvas
        ref={edgeCanvasRef}
        className={styles.edgeCanvas}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />

      <svg
        className={styles.svg}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <GlowFilters />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

          {/* Analysis overlays — rendered BEHIND nodes so hulls/flows appear underneath */}
          <AnalysisOverlays
            overlays={overlays}
            nodes={nodes}
            edges={edges}
            metrics={metrics}
            predictedLinks={predictedLinks}
          />

          {/* Edge labels — only in detail/region view, for selected connections or $ values */}
          {zoomTier !== 'cluster' && (!tooManyForEdgeLabels || showValues) && (selectedNode || showValues) &&
            edges.map((e, i) => {
              const isHighlighted = highlightedEdges.has(i);
              if (selectedNode && !isHighlighted) return null;
              const val = edgeValueMap.get(i) || '';
              if (!selectedNode && showValues && !val) return null;
              const sx = e.source.x || 0;
              const sy = e.source.y || 0;
              const tx = e.target.x || 0;
              const ty = e.target.y || 0;
              const rc = REL_CFG[e.rel];

              return (
                <EdgeLabel
                  key={`label-${i}`}
                  sx={sx} sy={sy} tx={tx} ty={ty}
                  label={selectedNode ? edgeLabelText(e) : ''}
                  val={val}
                  relColor={rc?.color}
                />
              );
            })}

          {/* Nodes — LOD + viewport culled */}
          {nodes.map((n) => {
            const isSelected = selectedNode === n.id;
            const isConnected = connectedIds.has(n.id);
            const isHub = HUB_NODE_IDS.has(n.id);
            const degree = nodeDegreeMap[n.id] || 0;

            // Progressive LOD: degree-based filtering at all zoom levels
            if (!isSelected && !isConnected && !isHub && degree < minDegreeForRender) {
              return null;
            }

            // Viewport culling: skip nodes outside the visible area (with 50px margin)
            // Always render selected, connected, and hub nodes regardless of viewport
            if (!isSelected && !isConnected && !isHub) {
              const screenX = (n.x || 0) * zoom + pan.x;
              const screenY = (n.y || 0) * zoom + pan.y;
              if (screenX < -50 || screenX > w + 50 || screenY < -50 || screenY > h + 50) {
                return null;
              }
            }

            const r = nodeRadius(n, metrics?.pagerank);
            const fill = nodeColor(n, colorMode, metrics?.communities, kmeansMap);
            const dimBySearch = searchTerm && !matchesSearch(n);
            const dimBySelection = selectedNode && !isSelected && !isConnected;
            // Dim nodes not in the selected cluster (when a cluster is selected from overlay)
            const dimByCluster = selectedCluster != null
              && metrics?.communities?.[n.id] !== selectedCluster
              && !isSelected && !isConnected;
            const dim = dimBySearch || dimBySelection || dimByCluster;

            // Galactic core radial opacity — only computed when graph is large enough
            // and the node is not already highlighted/dimmed by selection/search.
            const baseOpacity = (!dim && !isSelected && !isConnected && maxDist > 0)
              ? radialOpacity(n, centroidX, centroidY, maxDist)
              : 1;

            const inner = (
              <NodeCircle
                key={n.id}
                node={n}
                r={r}
                fill={fill}
                isSelected={isSelected}
                isConnected={isConnected}
                hasSelection={!!selectedNode}
                dim={dim}
                onSelect={handleNodeSelect}
                onHover={handleNodeHover}
                onLeave={hideTooltip}
                baseOpacity={baseOpacity}
                isHub={isHub}
                labelMinR={labelMinR}
              />
            );

            if (isSelected) return <g key={n.id} filter="url(#nodeGlowStrong)">{inner}</g>;
            return inner;
          })}
        </g>
      </svg>

      {/* Zoom tier — light text overlay, bottom-right above controls */}
      <div style={{
        position: 'absolute',
        bottom: 108,
        right: 'var(--space-lg, 12px)',
        textAlign: 'right',
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity 300ms ease',
        opacity: 0.7,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.5px',
          color: zoomTier === 'detail' ? '#45D7C6' : zoomTier === 'region' ? '#C8A55A' : '#9B72CF',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
          transition: 'color 300ms ease',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}>
          {TIER_LABELS[zoomTier]}
        </div>
        <div style={{
          fontSize: 8,
          letterSpacing: '0.5px',
          color: 'rgba(255,255,255,0.35)',
          fontFamily: "'SF Mono', 'Cascadia Code', monospace",
          marginTop: 1,
        }}>
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomBtn}
          onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          type="button"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className={styles.zoomBtn}
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          type="button"
          title="Zoom out"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          className={styles.zoomBtn}
          onClick={fitAll}
          type="button"
          title="Reset view"
          aria-label="Reset view"
        >
          &#x27F2;
        </button>
      </div>

      {/* FIX 2: Tooltip rendered as a plain DOM div updated imperatively via ref.
          Mouse-move / mouse-enter no longer triggers setState → no React re-renders. */}
      <div
        ref={tooltipRef}
        className={styles.tooltip}
        style={{ display: 'none', position: 'fixed' }}
      />
    </div>
  );
}
