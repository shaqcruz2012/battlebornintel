import { useState } from 'react';
import { MUTED, BORDER, TEXT, GOLD, CARD } from '../../styles/tokens.js';

/**
 * Reusable horizontal Gantt-style timeline chart.
 *
 * @param {Object} props
 * @param {Array} props.rows - [{label, segments: [{start, end, color, tooltip, opacity?}]}]
 * @param {string} props.minDate - Timeline start (YYYY-MM-DD)
 * @param {string} props.maxDate - Timeline end (YYYY-MM-DD)
 * @param {number} [props.rowHeight=28] - Height of each row
 * @param {boolean} [props.showLabels=true] - Show row labels
 * @param {number} [props.labelWidth=140] - Width of label column
 * @param {Function} [props.onRowClick] - Click handler for rows
 */
export function Gantt({ rows = [], minDate, maxDate, rowHeight = 28, showLabels = true, labelWidth = 140, onRowClick }) {
  const [hover, setHover] = useState(null);

  if (!rows.length) return null;

  // Auto-detect date range if not provided
  let mn = minDate ? new Date(minDate).getTime() : Infinity;
  let mx = maxDate ? new Date(maxDate).getTime() : -Infinity;
  rows.forEach(r => (r.segments || []).forEach(s => {
    if (s.start) mn = Math.min(mn, new Date(s.start).getTime());
    if (s.end) mx = Math.max(mx, new Date(s.end).getTime());
  }));
  if (mn === Infinity) mn = Date.now();
  if (mx === -Infinity) mx = Date.now() + 365 * 24 * 60 * 60 * 1000;

  // Add padding
  const range = mx - mn;
  mn -= range * 0.02;
  mx += range * 0.02;
  const totalRange = mx - mn;

  const chartW = 600;
  const svgW = showLabels ? chartW + labelWidth : chartW;
  const svgH = rows.length * rowHeight + 30;
  const chartX = showLabels ? labelWidth : 0;

  function toX(dateStr) {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return chartX + ((t - mn) / totalRange) * chartW;
  }

  // Generate year markers
  const startYear = new Date(mn).getFullYear();
  const endYear = new Date(mx).getFullYear();
  const yearMarkers = [];
  for (let y = startYear; y <= endYear + 1; y++) {
    const x = toX(`${y}-01-01`);
    if (x >= chartX && x <= chartX + chartW) {
      yearMarkers.push({ x, label: y });
    }
  }

  // Today marker
  const todayX = toX(new Date().toISOString().slice(0, 10));

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: svgW, height: svgH, display: "block" }}>
        {/* Year gridlines */}
        {yearMarkers.map(ym => (
          <g key={ym.label}>
            <line x1={ym.x} y1={0} x2={ym.x} y2={svgH - 20} stroke={BORDER} strokeWidth={0.5} />
            <text x={ym.x} y={svgH - 6} fill={MUTED} fontSize={8} textAnchor="middle">{ym.label}</text>
          </g>
        ))}

        {/* Today line */}
        {todayX >= chartX && todayX <= chartX + chartW && (
          <line x1={todayX} y1={0} x2={todayX} y2={svgH - 20} stroke={GOLD} strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
        )}

        {/* Rows */}
        {rows.map((row, i) => {
          const y = i * rowHeight + 4;
          const isHover = hover === i;
          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onRowClick?.(row, i)}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {/* Row background */}
              {isHover && <rect x={0} y={y} width={svgW} height={rowHeight - 2} fill={BORDER} opacity={0.3} rx={3} />}

              {/* Label */}
              {showLabels && (
                <text x={4} y={y + rowHeight / 2} fill={isHover ? TEXT : MUTED} fontSize={9} dominantBaseline="middle">
                  {(row.label || "").length > 20 ? row.label.slice(0, 18) + "…" : row.label}
                </text>
              )}

              {/* Segments */}
              {(row.segments || []).map((seg, j) => {
                const x1 = toX(seg.start);
                const x2 = toX(seg.end);
                const barW = Math.max(x2 - x1, 3);
                const barH = rowHeight * 0.45;
                const barY = y + (rowHeight - barH) / 2 - 1;
                return (
                  <g key={j}>
                    <rect x={x1} y={barY} width={barW} height={barH} fill={seg.color || GOLD} opacity={seg.opacity || 0.8} rx={2} />
                    {/* Tooltip on hover */}
                    {isHover && seg.tooltip && j === 0 && (
                      <text x={x1 + 3} y={barY - 3} fill={TEXT} fontSize={7}>{seg.tooltip}</text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
