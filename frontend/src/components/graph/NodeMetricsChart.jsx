import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './NodeMetricsChart.module.css';

const CHART_W = 180;
const CHART_H = 48;
const PAD = { top: 4, right: 4, bottom: 14, left: 4 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

/**
 * NodeMetricsChart — small sparkline chart showing a node's PageRank
 * and degree centrality over time. Uses raw SVG, no additional libraries.
 *
 * @param {Object} props
 * @param {string} props.nodeId - Graph node ID (e.g., "c_123")
 */
export function NodeMetricsChart({ nodeId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['graphMetrics', 'history', nodeId],
    queryFn: async () => {
      const res = await fetch(`/api/graph/metrics/${encodeURIComponent(nodeId)}/history`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`API error ${res.status}`);
      }
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!nodeId,
    staleTime: 300_000,
    retry: false,
  });

  const { pagerankPath, degreePath, xLabels } = useMemo(() => {
    if (!data?.points || data.points.length < 2) {
      return { pagerankPath: '', degreePath: '', xLabels: [] };
    }

    const pts = data.points;

    // Normalize each series to [0, 1]
    const prVals = pts.map((p) => p.pagerank ?? 0);
    const degVals = pts.map((p) => p.degree ?? 0);

    const normalize = (vals) => {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 1;
      return vals.map((v) => (v - min) / range);
    };

    const prNorm = normalize(prVals);
    const degNorm = normalize(degVals);

    const toPath = (normed) => {
      return normed
        .map((v, i) => {
          const x = PAD.left + (i / (normed.length - 1)) * INNER_W;
          const y = PAD.top + (1 - v) * INNER_H;
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    };

    // X-axis labels: first, middle, last
    const labels = [];
    const dateStr = (p) => {
      if (p.date) return p.date.slice(0, 4);
      if (p.computed_at) return p.computed_at.slice(0, 4);
      return '';
    };
    if (pts.length >= 2) {
      labels.push({ x: PAD.left, text: dateStr(pts[0]) });
      if (pts.length >= 3) {
        const midIdx = Math.floor(pts.length / 2);
        labels.push({
          x: PAD.left + (midIdx / (pts.length - 1)) * INNER_W,
          text: dateStr(pts[midIdx]),
        });
      }
      labels.push({
        x: PAD.left + INNER_W,
        text: dateStr(pts[pts.length - 1]),
      });
    }

    return {
      pagerankPath: toPath(prNorm),
      degreePath: toPath(degNorm),
      xLabels: labels,
    };
  }, [data]);

  if (!nodeId) return null;
  if (isLoading) {
    return (
      <div className={styles.container}>
        <span className={styles.loading}>Loading metrics...</span>
      </div>
    );
  }
  if (error || !data?.points || data.points.length < 2) {
    return null; // Silently hide if no history available
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Centrality Over Time</div>
      <svg
        className={styles.chart}
        width={CHART_W}
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      >
        {/* PageRank line */}
        <path
          d={pagerankPath}
          fill="none"
          stroke="var(--accent-teal)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Degree line */}
        <path
          d={degreePath}
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3,2"
        />
        {/* X-axis labels */}
        {xLabels.map((lbl, i) => (
          <text
            key={i}
            x={lbl.x}
            y={CHART_H - 1}
            textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
            className={styles.axisLabel}
          >
            {lbl.text}
          </text>
        ))}
      </svg>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--accent-teal)' }} />
          PageRank (importance)
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: 'var(--accent-gold)' }}
          />
          Degree (# connections)
        </span>
      </div>
    </div>
  );
}
