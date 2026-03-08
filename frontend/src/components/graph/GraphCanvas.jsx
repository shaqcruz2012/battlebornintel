import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { useWindowSize } from '../../hooks/useWindowSize';
import { fmt } from '../../engine/formatters';
import styles from './GraphCanvas.module.css';

function nodeRadius(node) {
  if (node.type === 'fund' || node.type === 'accelerator') return 14;
  if (node.type === 'sector' || node.type === 'ecosystem' || node.type === 'region') return 11;
  if (node.type === 'company') return 7 + Math.sqrt(Math.max(0, node.funding || 0)) * 0.3;
  return 8;
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

const EdgeLine = memo(function EdgeLine({ sx, sy, tx, ty, color, strokeWidth, dash, opacity, isOpportunity, isHighlighted }) {
  return (
    <line
      x1={sx} y1={sy} x2={tx} y2={ty}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
      opacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={isOpportunity && isHighlighted ? {
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
      {/* Main node circle */}
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
          filter: isSelected ? 'url(#nodeGlowStrong)' : undefined,
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
  const [tooltip, setTooltip] = useState(null);

  const w = Math.min(winW - 64, 1200);
  const h = Math.max(500, winH - 280);

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

  // Build tooltip data from node properties
  const buildTooltipData = useCallback((node, e) => {
    const data = {
      x: e.clientX,
      y: e.clientY,
      label: node.label,
      type: node.type,
      typeColor: NODE_CFG[node.type]?.color || '#888',
    };

    if (node.type === 'company') {
      data.metrics = [];
      if (node.funding) data.metrics.push({ label: 'Funding', value: fmt(node.funding) });
      if (node.stage) data.metrics.push({ label: 'Stage', value: node.stage.replace(/_/g, ' ') });
      if (node.employees) data.metrics.push({ label: 'Emp', value: String(node.employees) });
      if (node.momentum) data.metrics.push({ label: 'MTM', value: String(node.momentum) });
    }

    // Add graph metric if available
    const pr = metrics?.pagerank?.[node.id];
    if (pr !== undefined) {
      data.metrics = data.metrics || [];
      data.metrics.push({ label: 'PR', value: pr });
    }

    return data;
  }, [metrics]);

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
            const edgeOpacity = isOpportunity
              ? (e.edge_opacity ?? (dimEdge ? 0.05 : 0.5))
              : (dimEdge ? 0.06 : isHighlighted ? 0.85 : 0.35);
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
              />
            );
          })}

          {/* Edge labels — only for highlighted edges */}
          {selectedNode &&
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
            const r = nodeRadius(n);
            const fill = nodeColor(n, colorMode, metrics?.communities);
            const isSelected = selectedNode === n.id;
            const isConnected = connectedIds.has(n.id);
            const dimBySearch = searchTerm && !matchesSearch(n);
            const dimBySelection = selectedNode && !isSelected && !isConnected;
            const dim = dimBySearch || dimBySelection;

            return (
              <NodeCircle
                key={n.id}
                node={n}
                r={r}
                fill={fill}
                isSelected={isSelected}
                isConnected={isConnected}
                hasSelection={!!selectedNode}
                dim={dim}
                onSelect={() => onSelectNode?.(n.id === selectedNode ? null : n.id)}
                onHover={(e) => setTooltip(buildTooltipData(n, e))}
                onLeave={() => setTooltip(null)}
              />
            );
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

      {/* Enhanced tooltip — Palantir data-dense dark card */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className={styles.tooltipHeader}>
            <div className={styles.tooltipName}>{tooltip.label}</div>
            <div className={styles.tooltipType} style={{ color: tooltip.typeColor }}>
              {NODE_CFG[tooltip.type]?.icon} {NODE_CFG[tooltip.type]?.label || tooltip.type}
            </div>
          </div>
          {tooltip.metrics && tooltip.metrics.length > 0 && (
            <div className={styles.tooltipMetrics}>
              {tooltip.metrics.map((m, i) => (
                <div key={i} className={styles.tooltipMetric}>
                  <span className={styles.tooltipMetricLabel}>{m.label}</span>
                  <span className={styles.tooltipMetricValue}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
