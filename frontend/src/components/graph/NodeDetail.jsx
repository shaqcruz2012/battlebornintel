import { useMemo } from 'react';
import { NODE_CFG, REL_CFG } from '../../data/constants';
import { fmt, stageLabel } from '../../engine/formatters';
import styles from './NodeDetail.module.css';

export function NodeDetail({ nodeId, layout, metrics, onClose }) {
  const { nodes, edges } = layout;

  const node = useMemo(
    () => nodes.find((n) => n.id === nodeId),
    [nodes, nodeId]
  );

  const connections = useMemo(() => {
    if (!nodeId) return [];
    return edges
      .filter(
        (e) =>
          (typeof e.source === 'object' ? e.source.id : e.source) === nodeId ||
          (typeof e.target === 'object' ? e.target.id : e.target) === nodeId
      )
      .map((e) => {
        const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
        const targetId = typeof e.target === 'object' ? e.target.id : e.target;
        const otherId = sourceId === nodeId ? targetId : sourceId;
        const other = nodes.find((n) => n.id === otherId);
        return { rel: e.rel, node: other, note: e.note };
      })
      .filter((c) => c.node);
  }, [edges, nodes, nodeId]);

  if (!nodeId || !node) {
    return (
      <div className={styles.drawer}>
        <div className={styles.placeholder}>
          Click a node to see details
        </div>
      </div>
    );
  }

  const pr = metrics?.pagerank?.[nodeId];
  const bc = metrics?.betweenness?.[nodeId];
  const comm = metrics?.communities?.[nodeId];
  const cfg = NODE_CFG[node.type] || {};

  return (
    <div className={styles.drawer}>
      <div className={styles.header}>
        <div>
          <div className={styles.nodeName}>{node.label}</div>
          <div className={styles.nodeType} style={{ color: cfg.color }}>
            {cfg.icon} {cfg.label || node.type}
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {/* Node-specific metrics */}
        <div className={styles.metricGrid}>
          {node.type === 'company' && (
            <>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Stage</span>
                <span className={styles.metricValue}>{stageLabel(node.stage)}</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Funding</span>
                <span className={styles.metricValue}>{fmt(node.funding)}</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Employees</span>
                <span className={styles.metricValue}>{node.employees || '—'}</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Momentum</span>
                <span className={styles.metricValue}>{node.momentum || '—'}</span>
              </div>
            </>
          )}
          {pr !== undefined && (
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>PageRank</span>
              <span className={styles.metricValue}>{pr}</span>
            </div>
          )}
          {bc !== undefined && (
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Betweenness</span>
              <span className={styles.metricValue}>{bc}</span>
            </div>
          )}
          {comm !== undefined && (
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Community</span>
              <span className={styles.metricValue}>#{comm}</span>
            </div>
          )}
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Connections</span>
            <span className={styles.metricValue}>{connections.length}</span>
          </div>
        </div>

        {node.description && (
          <p className={styles.description}>{node.description}</p>
        )}

        {/* Connections list */}
        {connections.length > 0 && (
          <>
            <span className={styles.sectionLabel}>
              Connections ({connections.length})
            </span>
            <div className={styles.connectionList}>
              {connections.slice(0, 20).map((c, i) => {
                const rc = REL_CFG[c.rel] || {};
                return (
                  <div key={i} className={styles.connection}>
                    <span
                      className={styles.connectionDot}
                      style={{ background: NODE_CFG[c.node.type]?.color || '#666' }}
                    />
                    <span>{c.node.label}</span>
                    <span className={styles.connectionRel}>{rc.label || c.rel}</span>
                  </div>
                );
              })}
              {connections.length > 20 && (
                <span className={styles.connectionRel}>
                  +{connections.length - 20} more
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
