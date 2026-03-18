import { useMemo } from 'react';

/**
 * Generate a deterministic 12-point momentum trail from a company's current
 * momentum score. Uses a hash of the id as seed so sparklines are stable
 * across renders.
 */
export function generateMomentumTrail(companyId, currentMomentum) {
  const numId = typeof companyId === 'number' ? companyId : hashStr(String(companyId));
  const seed = (numId * 2654435761) >>> 0;
  const base = Math.max(10, currentMomentum - 30);
  const points = [];
  for (let i = 0; i < 12; i++) {
    const noise = ((seed * (i + 1) * 16807) % 2147483647) / 2147483647;
    const progress = i / 11;
    const value = base + (currentMomentum - base) * progress + (noise - 0.5) * 15;
    points.push(Math.max(0, Math.min(100, Math.round(value))));
  }
  return points;
}

/** Simple string hash for non-numeric IDs */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Resolve "auto" color to trend-based green/red/gray */
function resolveColor(color, data) {
  if (color !== 'auto') return color;
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return '#4ADE80';
  if (last < first) return '#F87171';
  return '#6B7280';
}

export function Sparkline({
  data = [],
  width = 64,
  height = 22,
  color = 'var(--accent-teal)',
  strokeWidth = 1.5,
  showArea = true,
  showDot = true,
}) {
  const resolvedColor = useMemo(() => resolveColor(color, data), [color, data]);

  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) return { linePath: '', areaPath: '' };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padY = 2;

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - ((v - min) / range) * (height - padY * 2) - padY,
    }));

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    const area = showArea
      ? `${line} L${width},${height} L0,${height} Z`
      : '';

    return { linePath: line, areaPath: area };
  }, [data, width, height, showArea]);

  if (data.length < 2) return null;

  // Unique ID for gradient per instance
  const gradientId = useMemo(
    () => `spark-grad-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={resolvedColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea && areaPath && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {showDot && data.length >= 2 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 4) - 2}
          r={2}
          fill={resolvedColor}
        />
      )}
    </svg>
  );
}
