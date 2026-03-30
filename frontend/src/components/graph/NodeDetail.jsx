import { useMemo, useState, useCallback } from 'react';
import { NODE_CFG, REL_CFG } from '../../data/constants';
import { fmt, stageLabel } from '../../engine/formatters';
import { NodeMetricsChart } from './NodeMetricsChart';
import styles from './NodeDetail.module.css';

/* ── Collapsible section wrapper ── */

function CollapsibleSection({ label, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={handleToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.sectionLabel}>{label}</span>
          {count !== undefined && (
            <span className={styles.sectionCount}>{count}</span>
          )}
        </div>
        <span className={`${styles.sectionChevron} ${open ? styles.sectionChevronOpen : ''}`}>
          &#x25BE;
        </span>
      </div>
      {open && children}
    </div>
  );
}

/* ── Score bar for metric visualization ── */

function ScoreBar({ label, value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (
    pct >= 70 ? 'var(--accent-teal)' : pct >= 40 ? 'var(--accent-gold)' : 'var(--status-risk)'
  );

  return (
    <div className={styles.scoreBar}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{typeof value === 'number' ? value.toFixed(2) : value}</span>
      <div className={styles.scoreBarTrack}>
        <div
          className={styles.scoreBarFill}
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

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
        return { rel: e.rel, node: other, note: e.note, edgeCategory: e.category, matchScore: e.matching_score };
      })
      .filter((c) => c.node);
  }, [edges, nodes, nodeId]);

  // Group connections by edge category for organized display
  const groupedConnections = useMemo(() => {
    const historical = [];
    const opportunities = [];
    connections.forEach((c) => {
      const isOpp = c.edgeCategory === 'opportunity' || c.rel === 'qualifies_for' || c.rel === 'fund_opportunity' || c.rel === 'potential_lp';
      if (isOpp) {
        opportunities.push(c);
      } else {
        historical.push(c);
      }
    });
    return { historical, opportunities };
  }, [connections]);

  if (!nodeId || !node) {
    return (
      <div className={styles.drawer}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>&#x25C9;</div>
          <div className={styles.placeholderText}>
            Select a node on the graph to view detailed intelligence
          </div>
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
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.nodeName}>{node.label}</div>
          <div className={styles.nodeType} style={{ color: cfg.color }}>
            {cfg.icon} {cfg.label || node.type}
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose} type="button" title="Close panel">
          &#x2715;
        </button>
      </div>

      <div className={styles.body}>
        {/* Key Metrics Section */}
        <CollapsibleSection label="Key Metrics" defaultOpen={true}>
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
                  <span className={styles.metricValue}>{node.employees || '\u2014'}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Momentum</span>
                  <span className={styles.metricValue}>{node.momentum || '\u2014'}</span>
                </div>
              </>
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
        </CollapsibleSection>

        {/* Graph Centrality Section — with score bars */}
        {(pr !== undefined || bc !== undefined) && (
          <CollapsibleSection label="Graph Centrality" defaultOpen={true}>
            <div className={styles.metricGrid}>
              {pr !== undefined && (
                <ScoreBar label="PageRank" value={pr} max={Math.max(pr * 2, 0.01)} color="var(--accent-teal)" />
              )}
              {bc !== undefined && (
                <ScoreBar label="Betweenness" value={bc} max={Math.max(bc * 2, 0.01)} color="var(--accent-gold)" />
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Metrics History — sparkline chart */}
        <CollapsibleSection label="Metrics History" defaultOpen={false}>
          <NodeMetricsChart nodeId={nodeId} />
        </CollapsibleSection>

        {/* Description */}
        {node.description && (
          <div className={styles.section}>
            <p className={styles.description}>{node.description}</p>
          </div>
        )}

        {/* Historical Connections */}
        {groupedConnections.historical.length > 0 && (
          <CollapsibleSection
            label="Connections"
            count={groupedConnections.historical.length}
            defaultOpen={true}
          >
            <div className={styles.connectionList}>
              {groupedConnections.historical.slice(0, 20).map((c, i) => {
                const rc = REL_CFG[c.rel] || {};
                const dollarMatch = c.note?.match(/\$[\d,.]+[BMK]?/);
                const dollarAmt = dollarMatch ? dollarMatch[0] : null;
                return (
                  <div key={i}>
                    <div className={styles.connection}>
                      <span
                        className={styles.connectionDot}
                        style={{ background: NODE_CFG[c.node.type]?.color || '#666' }}
                      />
                      <span className={styles.connectionName}>{c.node.label}</span>
                      {dollarAmt && (
                        <span className={styles.oppAmount} style={{ margin: 0, fontSize: '9px', padding: '1px 4px' }}>
                          {dollarAmt}
                        </span>
                      )}
                      <span
                        className={styles.connectionRel}
                        style={rc.color ? {
                          color: rc.color,
                          background: `${rc.color}12`,
                        } : undefined}
                      >
                        {rc.label || c.rel}
                      </span>
                    </div>
                  </div>
                );
              })}
              {groupedConnections.historical.length > 20 && (
                <div className={styles.moreCount}>
                  +{groupedConnections.historical.length - 20} more
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Opportunity Connections — enhanced with match scores and dollar amounts */}
        {groupedConnections.opportunities.length > 0 && (
          <CollapsibleSection
            label="Opportunities"
            count={groupedConnections.opportunities.length}
            defaultOpen={true}
          >
            <div className={styles.connectionList}>
              {groupedConnections.opportunities.slice(0, 15).map((c, i) => {
                const rc = REL_CFG[c.rel] || {};
                const dollarMatch = c.note?.match(/\$[\d,.]+[BMK]?/);
                const dollarAmt = dollarMatch ? dollarMatch[0] : null;
                return (
                  <div key={i} className={styles.oppCard}>
                    <div className={styles.connection}>
                      <span
                        className={styles.connectionDot}
                        style={{ background: NODE_CFG[c.node.type]?.color || '#666' }}
                      />
                      <span className={styles.connectionName}>{c.node.label}</span>
                      <span
                        className={styles.connectionRel}
                        style={rc.color ? {
                          color: rc.color,
                          background: `${rc.color}12`,
                        } : undefined}
                      >
                        {rc.label || c.rel}
                      </span>
                    </div>
                    {/* Dollar amount badge */}
                    {dollarAmt && (
                      <div className={styles.oppAmount}>{dollarAmt}</div>
                    )}
                    {/* Match score bar */}
                    {c.matchScore > 0 && (
                      <div className={styles.oppScoreRow}>
                        <span className={styles.oppScoreLabel}>Match</span>
                        <div className={styles.oppScoreTrack}>
                          <div
                            className={styles.oppScoreFill}
                            style={{
                              width: `${Math.round(c.matchScore * 100)}%`,
                              background: c.matchScore >= 0.85 ? '#22C55E'
                                : c.matchScore >= 0.70 ? '#F59E0B'
                                : '#6B7280',
                            }}
                          />
                        </div>
                        <span className={styles.oppScoreValue}>
                          {Math.round(c.matchScore * 100)}%
                        </span>
                      </div>
                    )}
                    {c.note && (
                      <div className={styles.connectionNote}>{c.note}</div>
                    )}
                  </div>
                );
              })}
              {groupedConnections.opportunities.length > 15 && (
                <div className={styles.moreCount}>
                  +{groupedConnections.opportunities.length - 15} more
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Empty connections state */}
        {connections.length === 0 && (
          <div className={styles.section}>
            <div className={styles.emptyConnections}>No connections found</div>
          </div>
        )}
      </div>
    </div>
  );
}
