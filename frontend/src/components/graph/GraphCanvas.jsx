import { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import { NODE_CFG, REL_CFG, COMM_COLORS } from '../../data/constants';
import { useWindowSize } from '../../hooks/useWindowSize';
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

/* ── Memoized sub-components ── */

const EdgeLine = memo(function EdgeLine({ sx, sy, tx, ty, color, strokeWidth, dash, opacity }) {
  return (
    <line
      x1={sx} y1={sy} x2={tx} y2={ty}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
      opacity={opacity}
    />
  );
});

const EdgeLabel = memo(function EdgeLabel({ sx, sy, tx, ty, label, val, relColor }) {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  return (
    <g pointerEvents="none">
      <rect
        x={mx - 40} y={my - 14}
        width={80} height={val ? 24 : 14}
        rx={3}
        fill="var(--bg-card)" fillOpacity={0.85}
        stroke={relColor || 'var(--border-subtle)'} strokeWidth={0.5}
      />
      <text
        x={mx} y={my - 3}
        textAnchor="middle"
        fill={relColor || 'var(--text-secondary)'}
        fontSize={7} fontFamily="var(--font-body)"
        fontWeight="600" letterSpacing="0.3"
      >
        {label.toUpperCase()}
      </text>
      {val && (
        <text
          x={mx} y={my + 7}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize={8} fontFamily="var(--font-heading)" fontWeight="700"
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
    <g opacity={dim ? 0.12 : 1}>
      {isConnected && !isSelected && hasSelection && (
        <circle
          cx={node.x} cy={node.y} r={r + 3}
          fill="none" stroke="var(--accent-teal)"
          strokeWidth={1} opacity={0.4} strokeDasharray="3,2"
        />
      )}
      {isSelected && (
        <circle
          cx={node.x} cy={node.y} r={r + 4}
          fill="none" stroke="var(--accent-teal)"
          strokeWidth={2} opacity={0.6}
        />
      )}
      <circle
        cx={node.x} cy={node.y} r={r}
        fill={fill}
        stroke={isSelected ? '#fff' : isConnected && hasSelection ? 'var(--accent-teal)' : 'rgba(0,0,0,0.3)'}
        strokeWidth={isSelected ? 1.5 : isConnected && hasSelection ? 1 : 0.5}
        style={{ cursor: 'pointer' }}
        onClick={onSelect}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      />
      {showLabel && (
        <text
          x={node.x} y={node.y + r + 12}
          textAnchor="middle"
          fill={isConnected && hasSelection ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={isSelected ? 10 : 9}
          fontFamily="var(--font-body)"
          fontWeight={isConnected && hasSelection ? '600' : 'normal'}
          pointerEvents="none"
        >
          {node.label?.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
        </text>
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
      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges — base layer */}
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
              : (dimEdge ? 0.08 : isHighlighted ? 0.9 : 0.4);
            const edgeWidth = isOpportunity ? (isHighlighted ? 1.5 : 0.5) : (isHighlighted ? 2 : 0.6);

            return (
              <EdgeLine
                key={i}
                sx={sx} sy={sy} tx={tx} ty={ty}
                color={edgeColor}
                strokeWidth={edgeWidth}
                dash={edgeDash}
                opacity={edgeOpacity}
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
                onHover={(e) => setTooltip({ x: e.clientX, y: e.clientY, label: n.label, type: n.type })}
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
        >
          +
        </button>
        <button
          className={styles.zoomBtn}
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          type="button"
        >
          -
        </button>
        <button
          className={styles.zoomBtn}
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          type="button"
        >
          &#x27F2;
        </button>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          <div>{tooltip.label}</div>
          <div className={styles.tooltipType}>{tooltip.type}</div>
        </div>
      )}
    </div>
  );
}
