import { useMemo } from 'react';
import { NODE_CFG, EDGE_CATEGORY_CFG } from '../../data/constants';
import s from './NetworkStats.module.css';

export default function NetworkStats({ layout, metrics }) {
  const nodes = layout?.nodes ?? [];
  const edges = layout?.edges ?? [];

  const nodeStats = useMemo(() => {
    const byType = {};
    for (const n of nodes) {
      const t = n.type || 'unknown';
      byType[t] = (byType[t] || 0) + 1;
    }
    return { total: nodes.length, byType };
  }, [nodes]);

  const edgeStats = useMemo(() => {
    const byCat = {};
    for (const e of edges) {
      const c = e.category || 'historical';
      byCat[c] = (byCat[c] || 0) + 1;
    }
    return { total: edges.length, byCat };
  }, [edges]);

  const degree = useMemo(() => {
    if (!nodes.length) return { min: 0, max: 0, avg: 0, median: 0 };
    const deg = {};
    for (const n of nodes) deg[n.id] = 0;
    for (const e of edges) {
      if (e.source in deg) deg[e.source]++;
      if (e.target in deg) deg[e.target]++;
      // handle object refs from d3
      if (e.source?.id in deg) deg[e.source.id]++;
      if (e.target?.id in deg) deg[e.target.id]++;
    }
    const vals = Object.values(deg).sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    const median = vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
    const sum = vals.reduce((a, v) => a + v, 0);
    return {
      min: vals[0],
      max: vals[vals.length - 1],
      avg: (sum / vals.length).toFixed(1),
      median: median.toFixed(1),
    };
  }, [nodes, edges]);

  const density = useMemo(() => {
    const n = nodes.length;
    if (n < 2) return 0;
    return edges.length / (n * (n - 1));
  }, [nodes, edges]);

  const communityCount = useMemo(() => {
    const comms = metrics?.communities;
    if (!comms) return 0;
    if (typeof comms === 'number') return comms;
    const ids = new Set(Object.values(comms));
    return ids.size;
  }, [metrics]);

  const leaders = useMemo(() => {
    const pr = metrics?.pagerank;
    if (!pr || !Object.keys(pr).length) return [];
    const nodeMap = {};
    for (const n of nodes) nodeMap[n.id] = n;
    return Object.entries(pr)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, score]) => ({
        id,
        label: nodeMap[id]?.label || nodeMap[id]?.name || id,
        type: nodeMap[id]?.type || 'unknown',
        score,
      }));
  }, [metrics, nodes]);

  const maxPR = leaders.length ? leaders[0].score : 1;

  const health = useMemo(() => {
    const avgDeg = parseFloat(degree.avg);
    if (density > 0.01 && avgDeg > 2) return 'Connected';
    if (density > 0.005) return 'Sparse';
    return 'Fragmented';
  }, [density, degree]);

  const healthClass =
    health === 'Connected' ? s.healthConnected
    : health === 'Sparse' ? s.healthSparse
    : s.healthFragmented;

  if (!nodes.length) return null;

  return (
    <div className={s.panel}>
      {/* Graph Health */}
      <div className={s.statGroup}>
        <div className={s.groupLabel}>Graph Health</div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Status</span>
          <span className={healthClass}><span className={s.healthDot} /> {health}</span>
        </div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Density (% of possible connections that exist)</span>
          <span className={s.statValue}>{(density * 100).toFixed(3)}%</span>
        </div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Communities</span>
          <span className={s.statValue}>{communityCount}</span>
        </div>
      </div>

      {/* Node Stats */}
      <div className={s.statGroup}>
        <div className={s.groupLabel}>Nodes ({nodeStats.total})</div>
        <div className={s.typeGrid}>
          {Object.entries(nodeStats.byType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
              const cfg = NODE_CFG[type];
              return (
                <span key={type} className={s.typeBadge}>
                  <span className={s.typeDot} style={{ background: cfg?.color || '#666' }} />
                  {cfg?.label || type} <span className={s.typeCount}>{count}</span>
                </span>
              );
            })}
        </div>
      </div>

      {/* Edge Stats */}
      <div className={s.statGroup}>
        <div className={s.groupLabel}>Edges ({edgeStats.total})</div>
        {Object.entries(edgeStats.byCat)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => (
            <div key={cat} className={s.statRow}>
              <span className={s.statLabel}>{EDGE_CATEGORY_CFG[cat]?.label || cat}</span>
              <span className={s.statValue}>{count}</span>
            </div>
          ))}
      </div>

      {/* Degree Distribution */}
      <div className={s.statGroup}>
        <div className={s.groupLabel}>Degree Distribution (connections per entity)</div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Min</span>
          <span className={s.statValue}>{degree.min}</span>
        </div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Max</span>
          <span className={s.statValue}>{degree.max}</span>
        </div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Average</span>
          <span className={s.statValue}>{degree.avg}</span>
        </div>
        <div className={s.statRow}>
          <span className={s.statLabel}>Median</span>
          <span className={s.statValue}>{degree.median}</span>
        </div>
      </div>

      {/* Centrality Leaders */}
      {leaders.length > 0 && (
        <div className={s.statGroup}>
          <div className={s.groupLabel}>PageRank Leaders (ranked by connection importance)</div>
          {leaders.map((l) => (
            <div key={l.id} className={s.leaderRow}>
              <span className={s.typeDot} style={{ background: NODE_CFG[l.type]?.color || '#666' }} />
              <span className={s.leaderName}>{l.label}</span>
              <div className={s.barTrack}>
                <div
                  className={s.barFill}
                  style={{
                    width: `${(l.score / maxPR) * 100}%`,
                    '--fill-color': NODE_CFG[l.type]?.color || '#45D7C6',
                  }}
                />
              </div>
              <span className={s.leaderScore}>{l.score.toFixed(3)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
