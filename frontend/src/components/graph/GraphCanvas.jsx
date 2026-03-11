import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { useWindowSize } from '../../hooks/useWindowSize';
import { fmt } from '../../engine/formatters';
import styles from './GraphCanvas.module.css';

const MIN_R = 3;
const MAX_R = 11;

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
  // event_year is mapped as 'y' in the API response
  if (e.y) return String(e.y);
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
      {/* Hub node (BBV/GOED) persistent glow — wider, warmer blur */}
      <filter id="nodeGlowHub" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      {/* Edge anti-aliasing enhancement */}
      <filter id="edgeSmooth">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
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
}) {
  const showLabel = r >= 10 || isSelected || (isConnected && hasSelection);

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
          transition: 'stroke-width 200ms ease, stroke 200ms ease',
        }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={onHover}
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
}) {
  const containerRef = useRef(null);
  const { width: winW, height: winH } = useWindowSize();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // FIX 2: Tooltip state moved to refs — mouse-move no longer triggers React re-renders.
  // We imperatively update a DOM div so the SVG subtree is untouched on hover.
  const tooltipRef = useRef(null);
  const tooltipActiveRef = useRef(false);

  const w = Math.min(winW - 16, 1800);
  const h = Math.max(640, winH - 104); // header(64) + tabs(40)

  const fitAll = useCallback(() => {
    const { nodes } = layout;
    if (!nodes || !nodes.length) return;
    const xs = nodes.map((n) => n.x || 0);
    const ys = nodes.map((n) => n.y || 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
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
    const node = layout.nodes.find((n) => n.id === focusNodeId);
    if (!node) return;
    const targetZoom = Math.max(zoom, 1.8);
    setZoom(targetZoom);
    setPan({
      x: w / 2 - (node.x || 0) * targetZoom,
      y: h / 2 - (node.y || 0) * targetZoom,
    });
  }, [focusNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const hoverCallbacks = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      map[n.id] = (e) => showTooltip(n, e.clientX, e.clientY);
    });
    return map;
  }, [nodes, showTooltip]);

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
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* Status indicator — real-time Bloomberg feel */}
      <div className={styles.statusBar}>
        <span className={styles.statusDot} />
        <span>{nodes.length} nodes &middot; {edges.length} edges</span>
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <GlowFilters />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges — base layer with anti-aliased strokes */}
          {edges.map((e, i) => {
            const sx = e.source.x || 0;
            const sy = e.source.y || 0;
            const tx = e.target.x || 0;
            const ty = e.target.y || 0;
            const rc = REL_CFG[e.rel];
            const isHighlighted = highlightedEdges.has(i);
            const dimEdge = selectedNode && !isHighlighted;

            // Opportunity edge handling
            const isOpportunity = e.category === 'opportunity' || e.rel === 'qualifies_for' || e.rel === 'fund_opportunity' || e.rel === 'potential_lp';
            if (isOpportunity && !showOpportunities) return null;
            if (isOpportunity && opportunityFilter === 'programs' && e.rel !== 'qualifies_for') return null;
            if (isOpportunity && opportunityFilter === 'funds' && e.rel !== 'fund_opportunity') return null;

            // Use per-edge visual overrides from DB, fall back to REL_CFG
            const edgeColor = e.color || (isHighlighted ? (rc?.color || 'var(--accent-teal)') : (rc?.color || '#333'));
            const edgeDash = e.style ?? (rc?.dash || '');

            // Edge category-aware base opacity for galactic aesthetic clarity:
            //   historical  → 0.25  (older structural edges, subdued)
            //   operational → 0.35  (active relationships, moderate weight)
            //   opportunity → 0.15  (speculative, very light — handled separately below)
            // At > 300 nodes we further tighten to prevent GPU overdraw.
            const category = e.category || 'operational';
            let categoryOpacity;
            if (category === 'historical') {
              categoryOpacity = tooManyForFullOpacity ? 0.18 : 0.25;
            } else if (category === 'opportunity') {
              categoryOpacity = 0.15;
            } else {
              // operational / untagged
              categoryOpacity = tooManyForFullOpacity ? 0.22 : 0.35;
            }
            const edgeOpacity = isOpportunity
              ? (e.opacity ?? (dimEdge ? 0.05 : 0.5))
              : (dimEdge ? 0.06 : isHighlighted ? 0.85 : categoryOpacity);
            const edgeWidth = isOpportunity ? (isHighlighted ? 1.5 : 0.5) : (isHighlighted ? 2 : 0.5);

            return (
              <EdgeLine
                key={i}
                sx={sx} sy={sy} tx={tx} ty={ty}
                color={edgeColor}
                strokeWidth={edgeWidth}
                dash={edgeDash}
                opacity={edgeOpacity}
                isOpportunity={isOpportunity}
                isHighlighted={isHighlighted}
                animateDash={animateDash}
              />
            );
          })}

          {/* Edge labels — show for selected node connections, or all edges with $ values when showValues is on */}
          {!tooManyForEdgeLabels && (selectedNode || showValues) &&
            edges.map((e, i) => {
              const isHighlighted = highlightedEdges.has(i);
              // When a node is selected, show labels only for its connections
              // When showValues is on (no selection), show labels for edges with dollar amounts
              if (selectedNode && !isHighlighted) return null;
              const val = edgeValue(e);
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

          {/* Nodes */}
          {nodes.map((n) => {
            const r = nodeRadius(n, metrics?.pagerank);
            const fill = nodeColor(n, colorMode, metrics?.communities);
            const isSelected = selectedNode === n.id;
            const isConnected = connectedIds.has(n.id);
            const dimBySearch = searchTerm && !matchesSearch(n);
            const dimBySelection = selectedNode && !isSelected && !isConnected;
            const dim = dimBySearch || dimBySelection;
            const isHub = HUB_NODE_IDS.has(n.id);

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
                onHover={hoverCallbacks[n.id]}
                onLeave={hideTooltip}
                baseOpacity={baseOpacity}
                isHub={isHub}
              />
            );

            if (isSelected) return <g key={n.id} filter="url(#nodeGlowStrong)">{inner}</g>;
            if (isHub && !isSelected) return <g key={n.id} filter="url(#nodeGlowHub)">{inner}</g>;
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
