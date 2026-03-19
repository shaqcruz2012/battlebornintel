import { memo, useMemo } from 'react';
import { COMM_COLORS } from '../../data/constants';
import styles from './AnalysisOverlays.module.css';

/* ── Convex hull (Graham scan) ── */

function cross(O, A, B) {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

function convexHull(points) {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const n = sorted.length;
  const lower = [];
  for (let i = 0; i < n; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0)
      lower.pop();
    lower.push(sorted[i]);
  }
  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0)
      upper.pop();
    upper.push(sorted[i]);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function hullPath(hull, pad = 20) {
  if (!hull || hull.length < 2) return '';
  // Expand hull outward by padding
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  const expanded = hull.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + (dx / dist) * pad, y: p.y + (dy / dist) * pad };
  });
  if (expanded.length === 2) {
    // Just draw a line with round caps (ellipse around two points)
    const [a, b] = expanded;
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  // Smooth closed path using quadratic curves through midpoints
  const pts = expanded;
  const n = pts.length;
  let d = `M ${(pts[n - 1].x + pts[0].x) / 2} ${(pts[n - 1].y + pts[0].y) / 2}`;
  for (let i = 0; i < n; i++) {
    const next = pts[(i + 1) % n];
    const midX = (pts[i].x + next.x) / 2;
    const midY = (pts[i].y + next.y) / 2;
    d += ` Q ${pts[i].x} ${pts[i].y} ${midX} ${midY}`;
  }
  d += ' Z';
  return d;
}

/* ── Communities overlay ── */

const CommunitiesOverlay = memo(function CommunitiesOverlay({ nodes, communities, communityNames }) {
  const groups = useMemo(() => {
    if (!communities || !nodes?.length) return [];
    // Group nodes by community_id, also track hub (highest degree proxy via label)
    const map = {};
    const hubMap = {}; // cid -> { label, degree }
    nodes.forEach((n) => {
      const cid = communities[n.id];
      if (cid === undefined) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push({ x: n.x || 0, y: n.y || 0, label: n.label, id: n.id });
    });

    // Track hub node per community (most connected within the group)
    for (const [cid, pts] of Object.entries(map)) {
      // Simple heuristic: the node closest to centroid is usually the hub
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      let closest = pts[0];
      let closestDist = Infinity;
      for (const p of pts) {
        const d = (p.x - cx) ** 2 + (p.y - cy) ** 2;
        if (d < closestDist) { closestDist = d; closest = p; }
      }
      hubMap[cid] = closest?.label || '';
    }

    return Object.entries(map)
      .filter(([, pts]) => pts.length >= 7)
      .map(([cid, pts]) => {
        const color = COMM_COLORS[parseInt(cid) % COMM_COLORS.length];
        const hull = convexHull(pts);
        const path = hullPath(hull, 25);
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const name = communityNames?.[cid] || `Community ${cid}`;
        const hub = hubMap[cid] || '';
        return { cid, color, path, cx, cy, count: pts.length, name, hub };
      });
  }, [nodes, communities, communityNames]);

  if (!groups.length) return null;

  return (
    <g className="overlay-communities" pointerEvents="none">
      {groups.map((g) => (
        <g key={g.cid}>
          <path
            d={g.path}
            fill={g.color + '15'}
            stroke={g.color + '40'}
            strokeWidth={1.5}
            strokeDasharray="8,4"
          />
          {/* Community name label */}
          <text
            x={g.cx} y={g.cy - 5}
            textAnchor="middle"
            fill={g.color + 'CC'}
            fontSize={10}
            fontFamily="var(--font-body)"
            fontWeight="700"
            letterSpacing="0.5"
          >
            {`${g.name} (${g.count})`}
          </text>
          {/* Hub node sub-label */}
          {g.hub && g.hub !== g.name && (
            <text
              x={g.cx} y={g.cy + 7}
              textAnchor="middle"
              fill={g.color + '88'}
              fontSize={7}
              fontFamily="var(--font-mono)"
              fontWeight="400"
              letterSpacing="0.3"
            >
              {g.hub}
            </text>
          )}
        </g>
      ))}
    </g>
  );
});

/* ── Capital flow overlay — animated dots along invested_in edges ── */

const CapitalFlowOverlay = memo(function CapitalFlowOverlay({ edges }) {
  // Collect invested_in edges with positions
  const flowEdges = useMemo(() => {
    if (!edges?.length) return [];
    return edges.filter((e) =>
      e.rel === 'invested_in' || e.rel === 'loaned_to' || e.rel === 'grants_to' || e.rel === 'funds'
    ).map((e) => {
      const sx = e.source?.x ?? 0;
      const sy = e.source?.y ?? 0;
      const tx = e.target?.x ?? 0;
      const ty = e.target?.y ?? 0;
      // Parse dollar value for width scaling
      let val = 0;
      if (e.note) {
        const m = e.note.match(/\$([\d,.]+)([BMK]?)/);
        if (m) {
          val = parseFloat(m[1].replace(/,/g, ''));
          if (m[2] === 'B') val *= 1000;
          else if (m[2] === 'K') val /= 1000;
        }
      }
      return { sx, sy, tx, ty, val };
    }).filter((e) => !(e.sx === 0 && e.sy === 0 && e.tx === 0 && e.ty === 0));
  }, [edges]);

  // Return null early but keep hooks above
  if (!flowEdges.length) return null;

  return (
    <g className="overlay-capital-flow" pointerEvents="none">
      {/* Directional arrows along capital flow edges */}
      <defs>
        <marker id="flowArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <path d="M0,0 L6,2 L0,4" fill="#C8A55A" fillOpacity="0.7" />
        </marker>
      </defs>
      {flowEdges.map((e, i) => {
        const width = Math.max(1, Math.min(4, 1 + Math.log(1 + (e.val || 0)) * 0.4));
        return (
          <g key={`flow-${i}`}>
            {/* Base flow line */}
            <line
              x1={e.sx} y1={e.sy} x2={e.tx} y2={e.ty}
              stroke="#C8A55A"
              strokeWidth={width}
              strokeOpacity={0.25}
              markerEnd="url(#flowArrow)"
            />
            {/* Animated flowing dots */}
            <line
              x1={e.sx} y1={e.sy} x2={e.tx} y2={e.ty}
              stroke="#C8A55A"
              strokeWidth={width * 0.6}
              strokeOpacity={0.6}
              strokeDasharray="3,12"
              className={styles.flowDash}
            />
          </g>
        );
      })}
    </g>
  );
});

/* ── Predicted links overlay ── */

const PredictedLinksOverlay = memo(function PredictedLinksOverlay({ predictions, nodes }) {
  // Map node IDs to positions
  const links = useMemo(() => {
    if (!predictions?.length || !nodes?.length) return [];
    const nodeMap = {};
    nodes.forEach((n) => { nodeMap[n.id] = n; });
    return predictions
      .filter((p) => nodeMap[p.source] && nodeMap[p.target])
      .map((p) => {
        const s = nodeMap[p.source];
        const t = nodeMap[p.target];
        return {
          sx: s.x || 0, sy: s.y || 0,
          tx: t.x || 0, ty: t.y || 0,
          score: p.score || 0,
          reason: p.reason || '',
          sourceLabel: s.label || p.source,
          targetLabel: t.label || p.target,
        };
      });
  }, [predictions, nodes]);

  if (!links.length) return null;

  return (
    <g className="overlay-predicted-links" pointerEvents="none">
      {links.map((l, i) => {
        // Color: teal for high score, grey for low
        const t = Math.max(0, Math.min(1, l.score));
        const r = Math.round(85 + (1 - t) * 80);
        const g = Math.round(215 * t + 130 * (1 - t));
        const b = Math.round(198 * t + 140 * (1 - t));
        const color = `rgb(${r},${g},${b})`;
        const mx = (l.sx + l.tx) / 2;
        const my = (l.sy + l.ty) / 2;
        return (
          <g key={`pred-${i}`}>
            <line
              x1={l.sx} y1={l.sy} x2={l.tx} y2={l.ty}
              stroke={color}
              strokeWidth={1 + t}
              strokeOpacity={0.4 + t * 0.3}
              strokeDasharray="6,4"
            />
            {/* Score label at midpoint */}
            <rect
              x={mx - 18} y={my - 8}
              width={36} height={14}
              rx={2}
              fill="rgba(12, 16, 20, 0.92)"
              stroke={color}
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
            <text
              x={mx} y={my + 3}
              textAnchor="middle"
              fill={color}
              fontSize={7}
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {(l.score * 100).toFixed(0)}%
            </text>
            {/* Hover tooltip area — invisible rect for pointer events */}
            <rect
              x={mx - 30} y={my - 20}
              width={60} height={40}
              fill="transparent"
              pointerEvents="all"
              style={{ cursor: 'help' }}
            >
              <title>{`${l.sourceLabel} - ${l.targetLabel}\nScore: ${(l.score * 100).toFixed(1)}%\n${l.reason}`}</title>
            </rect>
          </g>
        );
      })}
    </g>
  );
});

/* ── Bridge nodes overlay ── */

const BridgesOverlay = memo(function BridgesOverlay({ nodes, betweenness, communities }) {
  const bridges = useMemo(() => {
    if (!betweenness || !nodes?.length) return [];
    // Identify top bridge nodes: high betweenness centrality
    const entries = Object.entries(betweenness)
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
    // Take top 15 or those above a threshold
    const threshold = entries.length > 0 ? entries[0].score * 0.3 : 0;
    const topBridges = entries.filter((e) => e.score >= threshold).slice(0, 15);

    const nodeMap = {};
    nodes.forEach((n) => { nodeMap[n.id] = n; });

    return topBridges
      .filter((b) => nodeMap[b.id])
      .map((b) => {
        const node = nodeMap[b.id];
        return {
          id: b.id,
          x: node.x || 0,
          y: node.y || 0,
          score: b.score,
          label: node.label || b.id,
          communityId: communities?.[b.id],
        };
      });
  }, [nodes, betweenness, communities]);

  // Find community centroids for bridge connection lines
  const commCentroids = useMemo(() => {
    if (!communities || !nodes?.length) return {};
    const map = {};
    nodes.forEach((n) => {
      const cid = communities[n.id];
      if (cid === undefined) return;
      if (!map[cid]) map[cid] = { sx: 0, sy: 0, count: 0 };
      map[cid].sx += n.x || 0;
      map[cid].sy += n.y || 0;
      map[cid].count++;
    });
    const result = {};
    Object.entries(map).forEach(([cid, data]) => {
      result[cid] = { x: data.sx / data.count, y: data.sy / data.count };
    });
    return result;
  }, [nodes, communities]);

  if (!bridges.length) return null;

  return (
    <g className="overlay-bridges" pointerEvents="none">
      <defs>
        <filter id="bridgeGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Faint lines from bridge nodes to community centroids */}
      {bridges.map((b) => {
        return Object.entries(commCentroids).map(([cid, centroid]) => {
          if (parseInt(cid) === b.communityId) return null;
          const dx = centroid.x - b.x;
          const dy = centroid.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 600) return null; // skip distant communities
          return (
            <line
              key={`bridge-line-${b.id}-${cid}`}
              x1={b.x} y1={b.y}
              x2={centroid.x} y2={centroid.y}
              stroke="#E85D5D"
              strokeWidth={0.6}
              strokeOpacity={0.15}
              strokeDasharray="4,6"
            />
          );
        });
      })}
      {/* Glowing rings on bridge nodes */}
      {bridges.map((b) => {
        const maxScore = bridges[0]?.score || 1;
        const normScore = b.score / maxScore;
        const ringR = 12 + normScore * 8;
        return (
          <g key={`bridge-${b.id}`}>
            {/* Outer pulsing glow */}
            <circle
              cx={b.x} cy={b.y} r={ringR + 6}
              fill="none"
              stroke="#E85D5D"
              strokeWidth={1.5}
              strokeOpacity={0.15}
              className={styles.bridgePulse}
            />
            {/* Inner glow ring */}
            <circle
              cx={b.x} cy={b.y} r={ringR}
              fill="#E85D5D"
              fillOpacity={0.06}
              stroke="#E85D5D"
              strokeWidth={1.2}
              strokeOpacity={0.4}
              filter="url(#bridgeGlow)"
            />
            {/* Label */}
            <text
              x={b.x} y={b.y - ringR - 4}
              textAnchor="middle"
              fill="#E85D5D"
              fillOpacity={0.7}
              fontSize={7}
              fontFamily="var(--font-body)"
              fontWeight="600"
              letterSpacing="0.3"
            >
              BRIDGE
            </text>
          </g>
        );
      })}
    </g>
  );
});

/* ── Main overlay wrapper ── */

export const AnalysisOverlays = memo(function AnalysisOverlays({
  overlays,
  nodes,
  edges,
  metrics,
  predictedLinks,
}) {
  const show = overlays || {};

  return (
    <g className="analysis-overlays">
      {show.communities && (
        <CommunitiesOverlay nodes={nodes} communities={metrics?.communities} communityNames={metrics?.communityNames} />
      )}
      {show.capitalFlows && (
        <CapitalFlowOverlay edges={edges} />
      )}
      {show.predictedLinks && (
        <PredictedLinksOverlay predictions={predictedLinks} nodes={nodes} />
      )}
      {show.bridges && (
        <BridgesOverlay
          nodes={nodes}
          betweenness={metrics?.betweenness}
          communities={metrics?.communities}
        />
      )}
    </g>
  );
});
