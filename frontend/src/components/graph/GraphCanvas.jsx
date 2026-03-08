import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { useWindowSize } from '../../hooks/useWindowSize';
import { fmt } from '../../engine/formatters';
import styles from './GraphCanvas.module.css';

const MIN_R = 3;
const MAX_R = 11;

function nodeRadius(node, pagerank) {
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
  if (e.event_year) return String(e.event_year);
  return '';
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
}) {
  const showLabel = r >= 10 || isSelected || (isConnected && hasSelection);

  return (
    <g opacity={dim ? 0.1 : 1} style={{ transition: 'opacity 300ms ease' }}>
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
      {/* Main node circle — glow filter is applied by the parent wrapper, not here */}
      <circle
        cx={node.x} cy={node.y} r={r}
        fill={fill}
        stroke={
          isSelected
            ? '#fff'
            : isConnected && hasSelection
              ? 'var(--accent-teal)'
              : 'rgba(0,0,0,0.25)'
        }
        strokeWidth={isSelected ? 1.5 : isConnected && hasSelection ? 1 : 0.4}
        style={{
          cursor: 'pointer',
          transition: 'stroke-width 200ms ease, stroke 200ms ease',
        }}
        onClick={onSelect}
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

  // FIX 1: Stable per-node callbacks via a map keyed by node.id so React.memo works.
  // We memoize the maps on every nodes array change (which only happens when layout changes).
  const selectCallbacks = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      map[n.id] = () => onSelectNode?.(n.id === selectedNode ? null : n.id);
    });
    return map;
  }, [nodes, selectedNode, onSelectNode]);

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

  // FIX 3: Count opportunity edges to gate dash animation.
  const opportunityEdgeCount = useMemo(() => {
    if (!showOpportunities) return 0;
    return edges.filter(e =>
      e.edge_category === 'opportunity' || e.rel === 'qualifies_for' ||
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
            const isOpportunity = e.edge_category === 'opportunity' || e.rel === 'qualifies_for' || e.rel === 'fund_opportunity' || e.rel === 'potential_lp';
            if (isOpportunity && !showOpportunities) return null;
            if (isOpportunity && opportunityFilter === 'programs' && e.rel !== 'qualifies_for') return null;
            if (isOpportunity && opportunityFilter === 'funds' && e.rel !== 'fund_opportunity') return null;

            // Use per-edge visual overrides from DB, fall back to REL_CFG
            const edgeColor = e.edge_color || (isHighlighted ? (rc?.color || 'var(--accent-teal)') : (rc?.color || '#333'));
            const edgeDash = e.edge_style ?? (rc?.dash || '');

            // FIX 4: At > 300 nodes, collapse non-selected edge opacity to 0.15 to reduce
            // GPU overdraw from hundreds of semi-transparent overlapping strokes.
            const baseNonSelectedOpacity = tooManyForFullOpacity ? 0.15 : 0.35;
            const edgeOpacity = isOpportunity
              ? (e.edge_opacity ?? (dimEdge ? 0.05 : 0.5))
              : (dimEdge ? 0.06 : isHighlighted ? 0.85 : baseNonSelectedOpacity);
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

          {/* FIX 4: Edge labels — skip entirely when node count > 150 (unreadable anyway) */}
          {selectedNode && !tooManyForEdgeLabels &&
            edges.map((e, i) => {
              if (!highlightedEdges.has(i)) return null;
              const sx = e.source.x || 0;
              const sy = e.source.y || 0;
              const tx = e.target.x || 0;
              const ty = e.target.y || 0;
              const rc = REL_CFG[e.rel];

              return (
                <EdgeLabel
                  key={`label-${i}`}
                  sx={sx} sy={sy} tx={tx} ty={ty}
                  label={edgeLabelText(e)}
                  val={edgeValue(e)}
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

            // FIX 5: Glow filter applied as a <g> wrapper ONLY on the selected node.
            // Previously `filter: url(#nodeGlowStrong)` was an inline style prop on
            // every NodeCircle's inner <circle>, causing the filter string to be part
            // of the memo comparison on every render and applying the blur shader to
            // ALL nodes that have any selection state.
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
                onSelect={selectCallbacks[n.id]}
                onHover={hoverCallbacks[n.id]}
                onLeave={hideTooltip}
              />
            );

            return isSelected
              ? <g key={n.id} filter="url(#nodeGlowStrong)">{inner}</g>
              : inner;
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
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
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
