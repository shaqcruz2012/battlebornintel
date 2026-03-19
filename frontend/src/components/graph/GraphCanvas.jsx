import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { useWindowSize } from '../../hooks/useWindowSize';
import { fmt } from '../../engine/formatters';
import { AnalysisOverlays } from './AnalysisOverlays';
import styles from './GraphCanvas.module.css';

const MIN_R = 3;
const MAX_R = 11;
const DPR = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

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
    return Math.min(MAX_R, 4 + Math.sqrt(Math.max(0, node.funding || 0)) * 0.15);
  }
  // External nodes: 20% smaller than default to reduce visual dominance of the cloud
  if (node.type === 'external') return 4;
  return 5;
}

function nodeColor(node, colorMode, communities) {
  if (colorMode === 'community' && communities) {
    const cid = communities[node.id];
    return cid !== undefined ? COMM_COLORS[cid % COMM_COLORS.length] : '#555';
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
      {/* Selected node stronger glow */}
      <filter id="nodeGlowStrong" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      {/* Hub node (BBV/GOED) persistent glow — reduced blur for performance */}
      <filter id="nodeGlowHub" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );
});

/* ── Memoized sub-components ── */

const EdgeLine = memo(function EdgeLine({ sx, sy, tx, ty, color, strokeWidth, dash, opacity, isOpportunity, isHighlighted, animateDash }) {
  return (
    <line
      x1={sx} y1={sy} x2={tx} y2={ty}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
      opacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      // FIX 3: Only animate dashes when the caller explicitly enables it (showOpportunities + count < 50)
      style={isOpportunity && isHighlighted && animateDash ? {
        animation: 'dashFlow 1.5s linear infinite',
        strokeDashoffset: 0,
      } : undefined}
    />
  );
});

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
const NodeCircle = memo(function NodeCircle({
  node, r, fill, isSelected, isConnected, hasSelection, dim,
  onSelect, onHover, onLeave,
  baseOpacity,  // radial galactic-core opacity (0.68–1.0), applied when not dim/selected
  isHub,        // true for BBV/GOED hub nodes — always full opacity + persistent glow
  suppressLabels, // true when zoom is too low to read labels — skip text SVG elements
  suppressGlowRings, // true at low zoom — skip decorative glow rings to reduce SVG element count
}) {
  const showLabel = !suppressLabels && (r >= 10 || isSelected || (isConnected && hasSelection));

  // Hub nodes are always fully visible; selection states take precedence over radial fade
  const groupOpacity = dim ? 0.3
    : isHub ? 1
    : isSelected || isConnected ? 1
    : (baseOpacity ?? 1);

  // At low zoom, skip decorative glow rings (saves 2-3 SVG elements per connected/hub node)
  const showGlowRings = !suppressGlowRings;

  return (
    <g opacity={groupOpacity} style={{ transition: 'opacity 300ms ease, transform 200ms ease' }} className={!dim ? styles.nodeGroup : undefined}>
      {/* Soft outer glow for connected nodes */}
      {showGlowRings && isConnected && !isSelected && hasSelection && (
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
      {/* Selected node teal glow ring — Palantir-style */}
      {isSelected && (
        <>
          <circle
            cx={node.x} cy={node.y} r={r + 10}
            fill="#45d7c6" fillOpacity={0.06}
          />
          <circle
            cx={node.x} cy={node.y} r={r + 6}
            fill="#45d7c6" fillOpacity={0.10}
          />
          <circle
            cx={node.x} cy={node.y} r={r + 3}
            fill="none" stroke="#45d7c6"
            strokeWidth={2} opacity={0.6}
          />
        </>
      )}
      {/* Hub node (BBV/GOED) persistent ambient glow rings — galactic core effect */}
      {showGlowRings && isHub && !isSelected && (
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
              ? '#45d7c6'
              : isConnected && hasSelection
                ? 'var(--accent-teal)'
                : 'rgba(0,0,0,0.25)'
        }
        strokeWidth={isHub && !isSelected ? 1 : isSelected ? 2 : isConnected && hasSelection ? 1 : 0.4}
        style={{
          cursor: 'pointer',
          transition: 'stroke-width 200ms ease, stroke 200ms ease',
        }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={(e) => onHover(node, e)}
        onMouseLeave={onLeave}
      />
      {/* Node label — Palantir-style: teal for selected, node type color otherwise */}
      {showLabel && (
        <>
          {/* Selected label: dark pill background for contrast */}
          {isSelected && (
            <rect
              x={node.x - (Math.min(node.label?.length || 0, 18) * 3.2 + 10)}
              y={node.y + r + 3}
              width={(Math.min(node.label?.length || 0, 18) * 6.4 + 20)}
              height={16}
              rx={8}
              fill="rgba(10, 14, 20, 0.85)"
              stroke="rgba(69, 215, 198, 0.3)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}
          {/* Label text shadow for readability */}
          <text
            x={node.x} y={node.y + r + 14}
            textAnchor="middle"
            fill="rgba(5, 6, 9, 0.95)"
            fontSize={isSelected ? 10 : 9}
            fontFamily="var(--font-body)"
            fontWeight={isSelected || (isConnected && hasSelection) ? '600' : '400'}
            pointerEvents="none"
            stroke="rgba(5, 6, 9, 0.95)"
            strokeWidth={3}
            strokeLinejoin="round"
          >
            {node.label?.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
          </text>
          <text
            x={node.x} y={node.y + r + 14}
            textAnchor="middle"
            fill={
              isSelected
                ? '#45d7c6'
                : isConnected && hasSelection
                  ? fill
                  : fill
            }
            fontSize={isSelected ? 10 : 9}
            fontFamily="var(--font-body)"
            fontWeight={isSelected || (isConnected && hasSelection) ? '600' : '400'}
            pointerEvents="none"
            style={!isSelected ? { textShadow: '0 1px 4px rgba(0,0,0,0.95)' } : undefined}
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
  // Throttle canvas redraws to max 30fps using RAF guard.
  // We schedule drawing via requestAnimationFrame and store the latest params in a ref.
  const pendingRef = useRef(null);
  const drawParamsRef = useRef(null);

  // Store latest draw params so the RAF callback always has current data
  drawParamsRef.current = { canvasRef, edges, zoom, pan, w, h, selectedNode, highlightedEdges, showOpportunities, opportunityFilter, tooManyForFullOpacity };

  useEffect(() => {
    if (pendingRef.current) return; // already scheduled, skip

    pendingRef.current = requestAnimationFrame(() => {
      pendingRef.current = null;
      const { canvasRef: cRef, edges: curEdges, zoom: curZoom, pan: curPan, w: curW, h: curH,
              selectedNode: curSel, highlightedEdges: curHL, showOpportunities: curShowOpp,
              opportunityFilter: curOppFilter, tooManyForFullOpacity: curTooMany } = drawParamsRef.current;

      const canvas = cRef.current;
      if (!canvas) return;

      // Size canvas to match container (HiDPI-aware)
      canvas.width = curW * DPR;
      canvas.height = curH * DPR;
      canvas.style.width = `${curW}px`;
      canvas.style.height = `${curH}px`;

      const ctx = canvas.getContext('2d');
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, curW, curH);

      if (!curEdges.length) return;

      ctx.save();
      ctx.translate(curPan.x, curPan.y);
      ctx.scale(curZoom, curZoom);

      // Batch edges by color+opacity to minimize context state changes
      const batches = new Map();

      for (let i = 0; i < curEdges.length; i++) {
        const e = curEdges[i];
        const sx = e.source?.x ?? e.source ?? 0;
        const sy = e.source?.y ?? e.source ?? 0;
        const tx = e.target?.x ?? e.target ?? 0;
        const ty = e.target?.y ?? e.target ?? 0;

        if (sx === 0 && sy === 0 && tx === 0 && ty === 0) continue;

        const isOpportunity = e.category === 'opportunity' || e.rel === 'qualifies_for' || e.rel === 'fund_opportunity' || e.rel === 'potential_lp';
        if (isOpportunity && !curShowOpp) continue;
        if (isOpportunity && curOppFilter === 'programs' && e.rel !== 'qualifies_for') continue;
        if (isOpportunity && curOppFilter === 'funds' && e.rel !== 'fund_opportunity') continue;

        const rc = REL_CFG[e.rel];
        const isHighlighted = curHL.has(e);
        const dimEdge = curSel && !isHighlighted;

        const category = e.category || 'operational';
        let categoryOpacity;
        if (category === 'historical') {
          categoryOpacity = curTooMany ? 0.18 : 0.25;
        } else if (category === 'opportunity') {
          categoryOpacity = 0.15;
        } else {
          categoryOpacity = curTooMany ? 0.22 : 0.35;
        }

        const edgeOpacity = isOpportunity
          ? (e.opacity ?? (dimEdge ? 0.05 : 0.5))
          : (dimEdge ? 0.06 : isHighlighted ? 0.85 : categoryOpacity);
        const edgeWidth = isOpportunity ? (isHighlighted ? 1.5 : 0.5) : (isHighlighted ? 2 : 0.5);
        const edgeColor = e.color || (isHighlighted ? (rc?.color || '#45D7C6') : (rc?.color || '#333'));

        const key = `${edgeColor}|${edgeOpacity.toFixed(2)}|${edgeWidth}`;
        if (!batches.has(key)) {
          batches.set(key, { color: edgeColor, opacity: edgeOpacity, width: edgeWidth, lines: [] });
        }
        batches.get(key).lines.push(sx, sy, tx, ty);
      }

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

      ctx.restore();
    });

    return () => {
      if (pendingRef.current) { cancelAnimationFrame(pendingRef.current); pendingRef.current = null; }
    };
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
  // layoutWidth/layoutHeight must match the dimensions passed to the layout worker
  // so that node positions (in worker coordinate space) align with the SVG viewBox.
  layoutWidth,
  layoutHeight,
  overlays = {},
  predictedLinks = null,
}) {
  const containerRef = useRef(null);
  const edgeCanvasRef = useRef(null);
  const { width: winW, height: winH } = useWindowSize();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  // FIX 2: Tooltip state moved to refs — mouse-move no longer triggers React re-renders.
  // We imperatively update a DOM div so the SVG subtree is untouched on hover.
  const tooltipRef = useRef(null);
  const tooltipActiveRef = useRef(false);

  // Use layoutWidth/layoutHeight as the authoritative coordinate system.
  // These are the dimensions the D3 worker used to position nodes, so the SVG
  // viewBox and canvas must use the same values. GraphView measures the actual
  // container via ResizeObserver and passes those dimensions here.
  const w = layoutWidth  ?? Math.min(winW - 16, 1800);
  const h = layoutHeight ?? Math.max(640, winH - 104);

  const fitAll = useCallback(() => {
    const { nodes } = layout;
    if (!nodes || !nodes.length) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < nodes.length; i++) {
      const nx = nodes[i].x || 0;
      const ny = nodes[i].y || 0;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    }
    const padX = 60;
    const padTop = 60;
    const padBottom = 80;  // extra space for TemporalSlider at bottom
    const fitW = Math.max(maxX - minX, 1);
    const fitH = Math.max(maxY - minY, 1);
    // Clamp minimum zoom to 0.15 — prevents near-zero scale when positions are extreme
    const s = Math.max(0.15, Math.min((w - padX * 2) / fitW, (h - padTop - padBottom) / fitH, 2));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setZoom(s);
    // Shift up slightly to center between top and slider, not the full viewport
    setPan({ x: w / 2 - cx * s, y: (h - padBottom + padTop) / 2 - cy * s });
  }, [layout, w, h]);

  // Auto-fit: wait for the D3 worker to finish (layoutSettled) before fitting.
  // Fitting on early interim frames produces near-zero zoom because node positions
  // are still exploding outward from the force simulation's initial state.
  const hasFitRef = useRef(false);
  useEffect(() => {
    if (layout.nodes.length === 0 || !layoutSettled) {
      // Reset so fitAll fires again when the next layout settles
      // (e.g., after a resize triggers a new worker run).
      hasFitRef.current = false;
      return;
    }
    if (!hasFitRef.current) {
      hasFitRef.current = true;
      requestAnimationFrame(fitAll);
    }
  }, [layout.nodes.length, layoutSettled, fitAll]);

  // Focus effect: pan/zoom to a specific node when focusNodeId changes.
  // zoom is intentionally excluded from the dependency array — we read it
  // via a ref below to avoid re-firing every time the user scrolls while the
  // 300 ms focus window is still open (which caused a zoom bounce loop).
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; });

  useEffect(() => {
    if (!focusNodeId) return;
    const node = layout.nodes.find((n) => n.id === focusNodeId);
    if (!node) return;
    const targetZoom = Math.max(zoomRef.current, 1.8);
    setZoom(targetZoom);
    setPan({
      x: w / 2 - (node.x || 0) * targetZoom,
      y: h / 2 - (node.y || 0) * targetZoom,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNodeId, w, h, layout.nodes]);

  const searchLower = searchTerm.toLowerCase();
  const matchesSearch = useCallback(
    (node) =>
      !searchTerm ||
      node.label?.toLowerCase().includes(searchLower) ||
      node.id?.toLowerCase().includes(searchLower),
    [searchTerm, searchLower]
  );

  // Debounced wheel zoom — batches rapid scroll events via RAF to prevent
  // re-rendering on every wheel tick. Accumulates delta and applies once per frame.
  const wheelDeltaRef = useRef(0);
  const wheelRafRef = useRef(null);
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    wheelDeltaRef.current += e.deltaY > 0 ? -0.1 : 0.1;
    if (!wheelRafRef.current) {
      wheelRafRef.current = requestAnimationFrame(() => {
        const delta = wheelDeltaRef.current;
        wheelDeltaRef.current = 0;
        wheelRafRef.current = null;
        setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
      });
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  // RAF-throttled pan — prevents re-rendering on every mousemove during drag
  const panRafRef = useRef(null);
  const pendingPanRef = useRef(null);
  const handleMouseMove = useCallback(
    (e) => {
      if (dragging && dragStart) {
        pendingPanRef.current = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        if (!panRafRef.current) {
          panRafRef.current = requestAnimationFrame(() => {
            panRafRef.current = null;
            if (pendingPanRef.current) {
              setPan(pendingPanRef.current);
              pendingPanRef.current = null;
            }
          });
        }
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
    let metricsHtml = '';

    if (node.type === 'company') {
      const parts = [];
      if (node.funding) parts.push({ label: 'Funding', value: fmt(node.funding) });
      if (node.stage)   parts.push({ label: 'Stage',   value: node.stage.replace(/_/g, ' ') });
      if (node.employees) parts.push({ label: 'Emp',   value: String(node.employees) });
      if (node.momentum)  parts.push({ label: 'MTM',   value: String(node.momentum) });
      metricsHtml = parts.map(m =>
        `<div class="${styles.tooltipMetric}">` +
        `<span class="${styles.tooltipMetricLabel}">${m.label}</span>` +
        `<span class="${styles.tooltipMetricValue}">${m.value}</span>` +
        `</div>`
      ).join('');
    }

    const pr = metrics?.pagerank?.[node.id];
    if (pr !== undefined) {
      metricsHtml +=
        `<div class="${styles.tooltipMetric}">` +
        `<span class="${styles.tooltipMetricLabel}">PR</span>` +
        `<span class="${styles.tooltipMetricValue}">${pr.toFixed(2)}</span>` +
        `</div>`;
    }

    el.innerHTML =
      `<div class="${styles.tooltipHeader}">` +
        `<div class="${styles.tooltipName}">${node.label ?? ''}</div>` +
        `<div class="${styles.tooltipType}" style="color:${typeColor}">` +
          `${NODE_CFG[node.type]?.icon ?? ''} ${NODE_CFG[node.type]?.label ?? node.type}` +
        `</div>` +
      `</div>` +
      (metricsHtml
        ? `<div class="${styles.tooltipMetrics}">${metricsHtml}</div>`
        : '');

    el.style.left = `${clientX + 14}px`;
    el.style.top  = `${clientY - 10}px`;
    el.style.display = 'block';
    tooltipActiveRef.current = true;
  }, [metrics]);

  const hideTooltip = useCallback(() => {
    const el = tooltipRef.current;
    if (el) el.style.display = 'none';
    tooltipActiveRef.current = false;
  }, []);

  // Compute connected node IDs and highlighted edges for selected node.
  // highlightedEdges stores edge object references (not array indices) so it works
  // correctly with both the full edges array and the viewport-filtered visibleEdges.
  const { connectedIds, highlightedEdges } = useMemo(() => {
    if (!selectedNode) return { connectedIds: new Set(), highlightedEdges: new Set() };
    const cIds = new Set();
    const hEdges = new Set();
    edges.forEach((e) => {
      const { sid, tid } = edgeId(e);
      if (sid === selectedNode || tid === selectedNode) {
        cIds.add(sid);
        cIds.add(tid);
        hEdges.add(e);
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

  // H-6: Store the tooltip function in a ref so the hover handler doesn't need
  // nodes in its dep array. A single stable handleNodeHover receives the node
  // object directly from the caller, preserving React.memo on NodeCircle.
  const showTooltipRef = useRef(showTooltip);
  useEffect(() => { showTooltipRef.current = showTooltip; }, [showTooltip]);

  const handleNodeHover = useCallback((node, e) => {
    showTooltipRef.current(node, e.clientX, e.clientY);
  }, []);

  // FIX 3 + FIX 4: Pre-compute display thresholds once.
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

  // FIX 3: Count opportunity edges to gate dash animation.
  const opportunityEdgeCount = useMemo(() => {
    if (!showOpportunities) return 0;
    return edges.filter(e =>
      e.category === 'opportunity' || e.rel === 'qualifies_for' ||
      e.rel === 'fund_opportunity' || e.rel === 'potential_lp'
    ).length;
  }, [edges, showOpportunities]);

  const animateDash = showOpportunities && opportunityEdgeCount < 50;

  // Community labels — always visible as subtle background text (like constellation names).
  // Computed from node positions, grouped by _communityId from the layout worker.
  // When community overlay is toggled ON, labels become brighter.
  const communityLabels = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    const groups = {};
    nodes.forEach(n => {
      const cid = n._communityId ?? metrics?.communities?.[n.id];
      if (cid === undefined || cid === null) return;
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(n);
    });
    return Object.entries(groups)
      .filter(([, members]) => members.length >= 3)
      .map(([cid, members]) => {
        const cx = members.reduce((s, n) => s + (n.x || 0), 0) / members.length;
        const cy = members.reduce((s, n) => s + (n.y || 0), 0) / members.length;
        const name = metrics?.communityNames?.[cid] || `Cluster ${cid}`;
        const fontSize = Math.max(14, Math.min(24, members.length * 1.5));
        const color = COMM_COLORS[parseInt(cid) % COMM_COLORS.length];
        return { cid, cx, cy, name, fontSize, count: members.length, color };
      });
  }, [nodes, metrics?.communities, metrics?.communityNames]);

  // Pre-compute edge dollar values once when edges change (avoids regex per render per edge).
  // Keyed by edge object reference (not index) so lookups work with filtered subsets.
  const edgeValueMap = useMemo(() => {
    const map = new Map();
    edges.forEach((e) => {
      const val = edgeValue(e);
      if (val) map.set(e, val);
    });
    return map;
  }, [edges]);

  // Viewport culling — only render SVG nodes visible in the current pan/zoom viewport.
  // Nodes outside the visible area get no DOM elements, dramatically reducing SVG count.
  // Capped at 400 visible nodes — if more would be visible, keep only highest-degree nodes.
  const MAX_VISIBLE_NODES = 400;

  const { visibleNodes, visibleNodeIds } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { visibleNodes: [], visibleNodeIds: new Set() };
    // Convert viewport bounds to graph coordinate space
    const margin = 40; // extra margin in graph-space pixels to avoid popping
    const invZoom = 1 / (zoom || 1);
    const viewMinX = (-pan.x * invZoom) - margin;
    const viewMinY = (-pan.y * invZoom) - margin;
    const viewMaxX = ((w - pan.x) * invZoom) + margin;
    const viewMaxY = ((h - pan.y) * invZoom) + margin;
    let vNodes = nodes.filter((n) => {
      const nx = n.x || 0;
      const ny = n.y || 0;
      return nx >= viewMinX && nx <= viewMaxX && ny >= viewMinY && ny <= viewMaxY;
    });

    // Cap visible nodes to MAX_VISIBLE_NODES — keep highest-degree nodes + selected/connected
    if (vNodes.length > MAX_VISIBLE_NODES) {
      // Build a quick degree map from edges
      const degMap = {};
      edges.forEach((e) => {
        const sid = typeof e.source === 'object' ? e.source.id : e.source;
        const tid = typeof e.target === 'object' ? e.target.id : e.target;
        degMap[sid] = (degMap[sid] || 0) + 1;
        degMap[tid] = (degMap[tid] || 0) + 1;
      });
      // Always keep selected and connected nodes, hub nodes
      const mustKeep = new Set();
      if (selectedNode) {
        mustKeep.add(selectedNode);
        connectedIds.forEach((id) => mustKeep.add(id));
      }
      HUB_NODE_IDS.forEach((id) => mustKeep.add(id));

      // Sort remaining by degree descending
      vNodes.sort((a, b) => {
        const aPriority = mustKeep.has(a.id) ? 1 : 0;
        const bPriority = mustKeep.has(b.id) ? 1 : 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return (degMap[b.id] || 0) - (degMap[a.id] || 0);
      });
      vNodes = vNodes.slice(0, MAX_VISIBLE_NODES);
    }

    const vIds = new Set(vNodes.map((n) => n.id));
    return { visibleNodes: vNodes, visibleNodeIds: vIds };
  }, [nodes, edges, zoom, pan, w, h, selectedNode, connectedIds]);

  // Filter edges to only include those where BOTH endpoints are viewport-visible.
  // Without this, the canvas draws edges to node positions where no SVG bubble exists
  // (because the node was viewport-culled), causing edge-node misalignment.
  const visibleEdges = useMemo(() => {
    if (!edges || edges.length === 0) return [];
    return edges.filter((e) => {
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      return visibleNodeIds.has(sid) && visibleNodeIds.has(tid);
    });
  }, [edges, visibleNodeIds]);

  // Canvas edge renderer — replaces 5000+ SVG <line> elements with one draw call
  useEdgeCanvas(edgeCanvasRef, visibleEdges, zoom, pan, w, h, {
    selectedNode,
    highlightedEdges,
    showOpportunities,
    opportunityFilter,
    tooManyForFullOpacity,
  });

  if (!nodes || nodes.length === 0) {
    return (
      <div className={styles.canvasWrap} ref={containerRef}>
        <div style={{
          padding: 40,
          color: 'var(--text-disabled)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 12,
        }}>
          {/* Pulsing dot animation for loading state */}
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent-teal, #45d7c6)',
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.6,
          }} />
          <span style={{ fontSize: 12 }}>
            {layoutSettled === false ? 'Computing layout...' : 'No graph data. Enable node types in controls.'}
          </span>
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
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
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
        onClick={() => setSelectedCommunity(null)}
      >
        {/* Only include SVG filter defs when zoom is high enough for them to be visible.
            SVG filters (feGaussianBlur) are GPU-expensive; skipping them at low zoom
            reduces composite cost significantly. */}
        {zoom >= 0.6 && <GlowFilters />}

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

          {/* Edge labels — show for selected node connections, or all edges with $ values when showValues is on */}
          {(!tooManyForEdgeLabels || showValues) && (selectedNode || showValues) &&
            visibleEdges.map((e, i) => {
              const isHighlighted = highlightedEdges.has(e);
              if (selectedNode && !isHighlighted) return null;
              const val = edgeValueMap.get(e) || '';
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

          {/* Community indicators — small clickable dots at each community centroid.
              Click to highlight that community's nodes and show detail popover. */}
          {communityLabels.map(cl => {
            const isSelected = selectedCommunity === cl.cid;
            const color = cl.color || '#45d7c6';
            return (
              <g key={`comm-ind-${cl.cid}`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setSelectedCommunity(isSelected ? null : cl.cid); }}
              >
                {/* Outer ring */}
                <circle cx={cl.cx} cy={cl.cy} r={isSelected ? 18 : 12}
                  fill="none" stroke={color}
                  strokeOpacity={isSelected ? 0.6 : 0.15}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? 'none' : '3,3'}
                />
                {/* Center dot */}
                <circle cx={cl.cx} cy={cl.cy} r={3}
                  fill={color} fillOpacity={isSelected ? 0.8 : 0.25}
                />
                {/* Tiny label — only show on hover/select, not always */}
                {isSelected && (
                  <>
                    <rect
                      x={cl.cx - cl.name.length * 3.2 - 6}
                      y={cl.cy - 28}
                      width={cl.name.length * 6.4 + 12}
                      height={16}
                      rx={3}
                      fill="rgba(10, 14, 20, 0.9)"
                      stroke={color}
                      strokeOpacity={0.4}
                      strokeWidth={1}
                    />
                    <text
                      x={cl.cx} y={cl.cy - 17}
                      textAnchor="middle"
                      fill={color}
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                      letterSpacing="1px"
                    >
                      {cl.name.toUpperCase()}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Selected community detail popover */}
          {selectedCommunity != null && (() => {
            const cl = communityLabels.find(c => c.cid === selectedCommunity);
            if (!cl) return null;
            const commNodes = nodes.filter(n =>
              (n._communityId ?? metrics?.communities?.[n.id]) === selectedCommunity
            );
            const types = {};
            commNodes.forEach(n => { types[n.type] = (types[n.type] || 0) + 1; });
            const topNodes = [...commNodes]
              .sort((a, b) => (metrics?.pagerank?.[b.id] || 0) - (metrics?.pagerank?.[a.id] || 0))
              .slice(0, 6);
            return (
              <foreignObject x={cl.cx + 22} y={cl.cy - 80} width={220} height={200}
                style={{ overflow: 'visible', pointerEvents: 'all' }}>
                <div style={{
                  background: 'rgba(10, 14, 20, 0.95)',
                  border: `1px solid ${cl.color || '#45d7c6'}44`,
                  borderRadius: 4,
                  padding: '8px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: '#d4d0c8',
                  backdropFilter: 'blur(8px)',
                  maxHeight: 180,
                  overflowY: 'auto',
                }}>
                  <div style={{ color: cl.color || '#45d7c6', fontWeight: 700, fontSize: 11, marginBottom: 4, letterSpacing: '1px' }}>
                    {cl.name.toUpperCase()}
                  </div>
                  <div style={{ color: '#6b6a72', fontSize: 9, marginBottom: 6 }}>
                    {cl.count} nodes · {Object.entries(types).map(([t, c]) => `${c} ${t}`).join(', ')}
                  </div>
                  <div style={{ borderTop: '1px solid #1c2733', paddingTop: 4 }}>
                    <div style={{ color: '#4a6070', fontSize: 8, letterSpacing: '1.5px', marginBottom: 3 }}>TOP MEMBERS</div>
                    {topNodes.map(n => (
                      <div key={n.id} style={{
                        display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2,
                        cursor: 'pointer',
                      }} onClick={() => { onSelectNode?.(n.id); setSelectedCommunity(null); }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: NODE_CFG[n.type]?.color || '#888',
                          flexShrink: 0,
                        }} />
                        <span style={{ color: '#d4d0c8', fontSize: 10 }}>{n.label}</span>
                        <span style={{ color: '#4a6070', fontSize: 8, marginLeft: 'auto' }}>{n.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </foreignObject>
            );
          })()}

          {/* Analysis overlay layers — rendered BELOW nodes but ABOVE edges */}
          {(overlays.communities || overlays.capitalFlows || overlays.predictedLinks || overlays.bridges) && (
            <AnalysisOverlays
              overlays={overlays}
              nodes={nodes}
              edges={edges}
              metrics={metrics}
              predictedLinks={predictedLinks}
            />
          )}

          {/* Nodes — viewport-culled: only nodes within visible pan/zoom bounds are rendered */}
          {visibleNodes.map((n) => {
            const r = nodeRadius(n, metrics?.pagerank);
            const fill = nodeColor(n, colorMode, metrics?.communities);
            const isSelected = selectedNode === n.id;
            const isConnected = connectedIds.has(n.id);
            const dimBySearch = searchTerm && !matchesSearch(n);
            const dimBySelection = selectedNode && !isSelected && !isConnected;
            const nodeCommunity = n._communityId ?? metrics?.communities?.[n.id];
            const dimByCommunity = selectedCommunity != null && nodeCommunity !== selectedCommunity;
            const dim = dimBySearch || dimBySelection || dimByCommunity;
            const isHub = HUB_NODE_IDS.has(n.id);

            // Suppress ALL text labels below zoom 0.5 to reduce SVG element count.
            // Only selected/connected nodes get labels at very low zoom.
            const suppressLabels = zoom < 0.5 && !isSelected && !isConnected;

            // Suppress decorative glow rings below zoom 0.6 to reduce SVG element count.
            // Each hub/connected node has 2-3 extra circle elements for glow effects.
            // At low zoom these are sub-pixel and invisible anyway.
            const suppressGlowRings = zoom < 0.6 && !isSelected;

            // Galactic core radial opacity — only computed when graph is large enough
            // and the node is not already highlighted/dimmed by selection/search.
            const baseOpacity = (!dim && !isSelected && !isConnected && maxDist > 0)
              ? radialOpacity(n, centroidX, centroidY, maxDist)
              : 1;

            // FIX 5: Glow filter applied as a <g> wrapper ONLY on the selected node.
            // Hub nodes get a separate persistent glow filter wrapper.
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
                suppressLabels={suppressLabels}
                suppressGlowRings={suppressGlowRings}
              />
            );

            // Only apply expensive SVG glow filters when zoom is high enough to see them
            if (isSelected && zoom >= 0.6) return <g key={n.id} filter="url(#nodeGlowStrong)">{inner}</g>;
            if (isHub && !isSelected && zoom >= 0.6) return <g key={n.id} filter="url(#nodeGlowHub)">{inner}</g>;
            return inner;
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomBtn}
          onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          type="button"
          title="Zoom in"
        >
          +
        </button>
        <button
          className={styles.zoomBtn}
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          type="button"
          title="Zoom out"
        >
          -
        </button>
        <button
          className={styles.zoomBtn}
          onClick={fitAll}
          type="button"
          title="Reset view"
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
