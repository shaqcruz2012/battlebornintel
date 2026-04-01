import { useMemo, useState, useCallback } from 'react';
import { NODE_CFG, REL_CFG } from '../../data/constants';
import { fmt, stageLabel } from '../../engine/formatters';
import styles from './NodeDetail.module.css';

/* ── Extract URL from note text if present ── */

function extractUrl(note) {
  if (!note) return null;
  const match = note.match(/https?:\/\/[^\s,;)]+/);
  return match ? match[0] : null;
}

/* ── Source link icon for connection rows ── */

function SourceLink({ sourceUrl, note }) {
  // Prefer explicit source_url, fall back to URL embedded in note
  const url = sourceUrl || extractUrl(note);
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.edgeSourceLink}
        title={note || url}
        onClick={(e) => e.stopPropagation()}
      >
        {'\u2197'}
      </a>
    );
  }
  // Note text without URL — show icon with tooltip
  if (note) {
    return (
      <span
        className={styles.edgeSourceLinkDimmed}
        title={note}
      >
        {'\u2197'}
      </span>
    );
  }
  // No note at all — don't render
  return null;
}

/* ── Extract 1-2 word tag from edge note ── */

function extractTag(note, rel, nodeName) {
  if (!note) return null;
  // Skip generic notes like "FundNV investment in X" or "BBV portfolio — X"
  if (/^(FundNV|BBV|1864|AngelNV|Sierra|f_)\s*(investment|portfolio)/i.test(note)) return null;
  if (/^(BBV|AngelNV|FundNV) portfolio/i.test(note)) return null;
  // Try to extract round info: "Series A", "Series B", "Seed", "Phase I"
  const round = note.match(/Series [A-E]\+?|Seed|Phase [I1-3]+|Pre-Seed|SPAC|IPO|merger|grant/i);
  if (round) return round[0];
  // Try dollar context: "$100M co-lead" → "co-lead"
  const context = note.match(/\$[\d,.]+[BMK]?\s+(.{2,15}?)[\s.,;]/);
  if (context) {
    const words = context[1].trim().split(/\s+/).slice(0, 2).join(' ');
    if (words.length <= 15) return words;
  }
  // Try key action words
  const action = note.match(/co-lead|co-invest|anchor|strategic|angel|SBIR|accelerat|tax abate|PPA|merger|acqui/i);
  if (action) return action[0];
  return null;
}

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

/* ── Inner panel content (only rendered when a node is selected) ── */

function PanelContent({ nodeId, layout, metrics, onClose }) {
  const [showAllHistorical, setShowAllHistorical] = useState(false);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
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
        return { rel: e.rel, node: other, note: e.note, source_url: e.source_url, year: e.y, edgeCategory: e.category, matchScore: e.matching_score, capitalM: e.capitalM, impactType: e.impactType };
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

  if (!node) return null;

  const pr = metrics?.pagerank?.[nodeId];
  const bc = metrics?.betweenness?.[nodeId];
  const comm = metrics?.communities?.[nodeId];
  const cfg = NODE_CFG[node.type] || {};

  return (
    <>
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
                {node.locationClass && (
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Location</span>
                    <span className={styles.metricValue}>{node.locationClass}</span>
                  </div>
                )}
                {node.outcomeStatus && (
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Outcome</span>
                    <span className={styles.metricValue}>{node.outcomeStatus}</span>
                  </div>
                )}
              </>
            )}
            {node.type === 'company' && node.confidence != null && (
              <ScoreBar label="Confidence" value={node.confidence} max={1} color="var(--accent-teal)" />
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
                <ScoreBar label="PageRank (importance by connection quality)" value={pr} max={Math.max(pr * 2, 0.01)} color="var(--accent-teal)" />
              )}
              {bc !== undefined && (
                <ScoreBar label="Betweenness (how often this bridges groups)" value={bc} max={Math.max(bc * 2, 0.01)} color="var(--accent-gold)" />
              )}
            </div>
          </CollapsibleSection>
        )}

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
              {groupedConnections.historical.slice(0, showAllHistorical ? undefined : 25).map((c, i) => {
                const rc = REL_CFG[c.rel] || {};
                const dollarMatch = c.note?.match(/\$[\d,.]+[BMK]?/);
                const dollarAmt = dollarMatch ? dollarMatch[0] : null;
                // Extract 1-2 word tag from note (skip generic notes)
                const tag = extractTag(c.note, c.rel, c.node.label);
                return (
                  <div key={`${c.node?.id || c.id}-${c.rel || ''}-${i}`} className={styles.connection}>
                    <span
                      className={styles.connectionDot}
                      style={{ background: NODE_CFG[c.node.type]?.color || '#666' }}
                    />
                    <span className={styles.connectionName}>{c.node.label}</span>
                    {c.capitalM != null && c.capitalM > 0 ? (
                      <span className={styles.oppAmount} style={{ margin: 0, fontSize: '9px', padding: '1px 4px' }}>
                        ${c.capitalM}M
                      </span>
                    ) : dollarAmt ? (
                      <span className={styles.oppAmount} style={{ margin: 0, fontSize: '9px', padding: '1px 4px' }}>
                        {dollarAmt}
                      </span>
                    ) : null}
                    {c.impactType && (
                      <span className={styles.edgeTag}>{c.impactType}</span>
                    )}
                    {c.year && (
                      <span className={styles.edgeYear}>{c.year}</span>
                    )}
                    {tag && !c.impactType && (
                      <span className={styles.edgeTag}>{tag}</span>
                    )}
                    <SourceLink sourceUrl={c.source_url} note={c.note} />
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
                );
              })}
              {!showAllHistorical && groupedConnections.historical.length > 25 && (
                <button
                  className={styles.moreCount}
                  onClick={(e) => { e.stopPropagation(); setShowAllHistorical(true); }}
                  type="button"
                >
                  +{groupedConnections.historical.length - 25} more
                </button>
              )}
              {showAllHistorical && groupedConnections.historical.length > 25 && (
                <button
                  className={styles.moreCount}
                  onClick={(e) => { e.stopPropagation(); setShowAllHistorical(false); }}
                  type="button"
                >
                  Show less
                </button>
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
              {groupedConnections.opportunities.slice(0, showAllOpportunities ? undefined : 15).map((c, i) => {
                const rc = REL_CFG[c.rel] || {};
                const dollarMatch = c.note?.match(/\$[\d,.]+[BMK]?/);
                const dollarAmt = dollarMatch ? dollarMatch[0] : null;
                return (
                  <div key={`${c.node?.id || c.id}-${c.rel || ''}-${i}`} className={styles.oppCard}>
                    <div className={styles.connection}>
                      <span
                        className={styles.connectionDot}
                        style={{ background: NODE_CFG[c.node.type]?.color || '#666' }}
                      />
                      <span className={styles.connectionName}>{c.node.label}</span>
                      <SourceLink sourceUrl={c.source_url} note={c.note} />
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
                    {/* Dollar amount badge — prefer capitalM over parsed note */}
                    {c.capitalM != null && c.capitalM > 0 ? (
                      <div className={styles.oppAmount}>${c.capitalM}M</div>
                    ) : dollarAmt ? (
                      <div className={styles.oppAmount}>{dollarAmt}</div>
                    ) : null}
                    {/* Impact type badge */}
                    {c.impactType && (
                      <div className={styles.edgeTag} style={{ display: 'inline-block', marginBottom: 4 }}>{c.impactType}</div>
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
              {!showAllOpportunities && groupedConnections.opportunities.length > 15 && (
                <button
                  className={styles.moreCount}
                  onClick={(e) => { e.stopPropagation(); setShowAllOpportunities(true); }}
                  type="button"
                >
                  +{groupedConnections.opportunities.length - 15} more
                </button>
              )}
              {showAllOpportunities && groupedConnections.opportunities.length > 15 && (
                <button
                  className={styles.moreCount}
                  onClick={(e) => { e.stopPropagation(); setShowAllOpportunities(false); }}
                  type="button"
                >
                  Show less
                </button>
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
    </>
  );
}

export function NodeDetail({ nodeId, layout, metrics, onClose }) {
  return (
    <>
      <div className={`${styles.panel} ${nodeId ? styles.panelOpen : ''}`}>
        {nodeId && <PanelContent nodeId={nodeId} layout={layout} metrics={metrics} onClose={onClose} />}
      </div>
      {!nodeId && (
        <div className={styles.inspectorRail}>
          <span style={{ fontSize: 11, opacity: 0.3 }}>ⓘ</span>
        </div>
      )}
    </>
  );
}
