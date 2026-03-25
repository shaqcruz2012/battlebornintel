import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainGrid } from '../layout/AppShell';
import { POLICY_GAPS } from '../../data/policyGaps';
import { useEcosystemGaps } from '../../api/hooks.js';
import styles from './EcosystemGaps.module.css';

/* ── API fetch ────────────────────────────────────────────────────────────── */

async function fetchStructuralHoles() {
  const res = await fetch('/api/analytics/structural-holes');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.data;
}

function useStructuralHoles() {
  return useQuery({
    queryKey: ['analytics', 'structural-holes'],
    queryFn: fetchStructuralHoles,
    staleTime: 300_000,
  });
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function severityClass(score) {
  if (score >= 5) return styles.severityHigh;
  if (score >= 2) return styles.severityMed;
  return styles.severityLow;
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function StatsStrip({ stats }) {
  return (
    <div className={styles.statsStrip}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Communities</span>
        <span className={styles.statValue}>{stats.totalCommunities}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Bridge Nodes</span>
        <span className={styles.statValueTeal}>{stats.bridgeCount}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Isolated Groups</span>
        <span className={styles.statValueRed}>{stats.islandCount}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Ecosystem Gaps</span>
        <span className={styles.statValueAmber}>{stats.gapCount}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Avg Constraint</span>
        <span className={styles.statValue}>{stats.avgConstraint}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Nodes / Edges</span>
        <span className={styles.statValue}>
          {stats.totalNodes} / {stats.totalEdges}
        </span>
      </div>
    </div>
  );
}

function BridgeCards({ bridges }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? bridges : bridges.slice(0, 12);

  if (bridges.length === 0) return <p className={styles.sectionDesc}>No bridge nodes detected.</p>;

  return (
    <>
      <div className={styles.bridgeGrid}>
        {visible.map((b) => (
          <div key={b.nodeId} className={styles.bridgeCard}>
            <div className={styles.bridgeTop}>
              <span className={styles.bridgeName} title={b.label}>{b.label}</span>
              <span className={styles.bridgeType}>{b.type}</span>
            </div>
            <div className={styles.bridgeMetrics}>
              <span className={styles.bridgeMetric}>
                <span className={styles.bridgeMetricLabel}>score</span>
                <span className={styles.bridgeMetricValue}>{b.bridgeScore.toFixed(2)}</span>
              </span>
              <span className={styles.bridgeMetric}>
                <span className={styles.bridgeMetricLabel}>constraint</span>
                <span className={styles.bridgeMetricValue}>{b.constraint.toFixed(3)}</span>
              </span>
              <span className={styles.bridgeMetric}>
                <span className={styles.bridgeMetricLabel}>spans</span>
                <span className={styles.bridgeMetricValue}>{b.communities.length} groups</span>
              </span>
            </div>
            <div className={styles.communityPills}>
              {b.communities.map((cid, idx) => (
                <span key={cid} className={styles.communityPill} title={`Community ${cid}`}>
                  {b.communityLabels?.[idx] || `C${cid}`}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {bridges.length > 12 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-teal)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
            marginTop: 'var(--space-sm)',
            alignSelf: 'flex-start',
          }}
        >
          {showAll ? 'Show fewer' : `Show all ${bridges.length} bridges`}
        </button>
      )}
    </>
  );
}

function IslandList({ islands, bridgeNodeIds }) {
  if (islands.length === 0) return <p className={styles.sectionDesc}>No isolated communities found.</p>;

  return (
    <div className={styles.communityMap}>
      {islands.map((island) => (
        <div key={island.communityId} className={styles.communityBoxIsland}>
          <div className={styles.communityBoxHeader}>
            <span className={styles.communityId} title={`Community ${island.communityId}`}>{island.communityName || `Community ${island.communityId}`}</span>
            <span className={styles.communityCount}>
              {island.nodeCount} node{island.nodeCount !== 1 ? 's' : ''}
              {island.externalEdges > 0 ? ` / ${island.externalEdges} ext edge` : ' / isolated'}
            </span>
          </div>
          <div className={styles.communityNodes}>
            {island.members.map((m) => {
              const isBridge = bridgeNodeIds.has(m.nodeId);
              const isHub = m.nodeId === island.hubNode.nodeId;
              const cls = isBridge
                ? styles.communityNodeBridge
                : isHub
                  ? styles.communityNodeHub
                  : styles.communityNode;
              return (
                <span key={m.nodeId} className={cls} title={`${m.label} (${m.type})`}>
                  {m.label}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function GapsTable({ gaps }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? gaps : gaps.slice(0, 20);

  if (gaps.length === 0) return <p className={styles.sectionDesc}>No significant ecosystem gaps detected.</p>;

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.gapsTable}>
          <thead>
            <tr>
              <th>Gap</th>
              <th>Community A</th>
              <th>Community B</th>
              <th>Inter-Edges</th>
              <th>Severity</th>
              <th>Potential Bridges</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((g, i) => (
              <tr key={`${g.communityA}-${g.communityB}`}>
                <td>
                  <span className={styles.gapIndicator}>
                    <span className={styles.gapDot} />
                    <span className={styles.gapLine} />
                    <span className={styles.gapDotRight} />
                  </span>
                </td>
                <td title={`Community ${g.communityA}`}>
                  {g.communityAName || `C${g.communityA}`}{' '}
                  <span style={{ color: 'var(--text-disabled)' }}>({g.communityASize})</span>
                </td>
                <td title={`Community ${g.communityB}`}>
                  {g.communityBName || `C${g.communityB}`}{' '}
                  <span style={{ color: 'var(--text-disabled)' }}>({g.communityBSize})</span>
                </td>
                <td>{g.interEdges}</td>
                <td className={severityClass(g.gapSeverity)}>
                  {g.gapSeverity.toFixed(1)}
                </td>
                <td>
                  <div className={styles.gapBridgeList}>
                    {g.potentialBridges.map((pb) => (
                      <span
                        key={pb.nodeId}
                        className={styles.gapBridgeChip}
                        title={`${pb.label} (${pb.type}) — constraint: ${pb.constraint.toFixed(3)}`}
                      >
                        {pb.label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {gaps.length > 20 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-teal)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
            marginTop: 'var(--space-sm)',
            alignSelf: 'flex-start',
          }}
        >
          {showAll ? 'Show fewer' : `Show all ${gaps.length} gaps`}
        </button>
      )}
    </>
  );
}

/* ── CSV export ──────────────────────────────────────────────────────────── */

function exportGapsCsv(gaps) {
  const rows = [['Gap', 'Severity', 'Communities', 'Inter-Edges', 'Potential Bridges']];
  (gaps ?? []).forEach((g) => {
    rows.push([
      `${g.communityAName} - ${g.communityBName}`,
      g.gapSeverity.toFixed(1),
      `${g.communityASize} + ${g.communityBSize}`,
      g.interEdges,
      g.potentialBridges?.map((b) => b.label).join('; ') ?? '',
    ]);
  });
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ecosystem-gaps.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Framework Gaps (policy overlay) ─────────────────────────────────────── */

function FrameworkGapsSection({ gapMetrics }) {
  return (
    <div>
      <h3 className={styles.sectionHeader}>Framework Gaps (Policy Analysis)</h3>
      <p className={styles.sectionDesc}>
        Research-validated policy gaps from Kauffman, EDA, NSF, SBA, and USDA frameworks.
      </p>
      <div className={styles.frameworkGaps}>
        {POLICY_GAPS.map((gap, i) => {
          const stageData = gapMetrics?.stageDistribution;
          let realCount = null;
          if (gap.id === 'vod' && stageData) {
            realCount = stageData
              .filter((s) => ['pre_seed', 'seed'].includes(s.stage))
              .reduce((sum, s) => sum + (s.underfunded ?? 0), 0);
          } else if (gap.id === 'seriesb' && gapMetrics) {
            realCount = gapMetrics.seriesBCoverage ?? null;
          }

          return (
            <div
              key={gap.id}
              className={styles.frameworkCard}
              style={{ borderLeftColor: gap.color }}
            >
              <div className={styles.frameworkHeader}>
                <span className={styles.frameworkName}>{gap.label}</span>
                <span
                  className={styles.severityBadge}
                  style={{
                    background:
                      gap.severity === 'critical'
                        ? '#E85D5D'
                        : gap.severity === 'moderate'
                          ? '#F5A623'
                          : '#6B6A72',
                  }}
                >
                  {gap.severity}
                </span>
              </div>
              <p className={styles.frameworkDesc}>{gap.description}</p>
              {realCount !== null && (
                <div className={styles.validationRow}>
                  Validated: {realCount} companies affected
                </div>
              )}
              <div className={styles.frameworkSource}>
                Source: {gap.frameworkSource}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */

export function EcosystemGaps() {
  const { data, isLoading, error } = useStructuralHoles();
  const { data: gapMetrics } = useEcosystemGaps();

  const bridges = data?.bridges ?? [];
  const islands = data?.islands ?? [];
  const gaps = data?.gaps ?? [];
  const stats = data?.stats ?? {};

  const bridgeNodeIds = useMemo(
    () => new Set(bridges.map((b) => b.nodeId)),
    [bridges]
  );

  if (isLoading) {
    return (
      <MainGrid>
        <div className={styles.loading}>Analyzing structural holes...</div>
      </MainGrid>
    );
  }

  if (error) {
    return (
      <MainGrid>
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>Analysis unavailable</span>
          <span>{error.message}</span>
        </div>
      </MainGrid>
    );
  }

  if (!data) {
    return (
      <MainGrid>
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>No data</span>
          <span>Structural analysis has not been computed yet.</span>
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Ecosystem Gaps</h2>
          <p className={styles.subtitle}>
            Structural hole analysis — bridges, isolated clusters, and missing connections
          </p>
          <button
            className={styles.exportBtn}
            onClick={() => exportGapsCsv(gaps)}
          >
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <StatsStrip stats={stats} />

        {/* Framework Gaps — research-validated policy gaps */}
        <FrameworkGapsSection gapMetrics={gapMetrics} />

        {/* Bridge nodes */}
        <section>
          <h3 className={styles.sectionHeader}>Bridge Nodes</h3>
          <p className={styles.sectionDesc}>
            Nodes with low Burt constraint spanning 3+ communities — they broker connections across otherwise disconnected groups.
          </p>
          <BridgeCards bridges={bridges} />
        </section>

        {/* Isolated communities */}
        <section>
          <h3 className={styles.sectionHeader}>Isolated Communities</h3>
          <p className={styles.sectionDesc}>
            Clusters with fewer than 2 external edges — potential blind spots in the ecosystem.
          </p>
          <IslandList islands={islands} bridgeNodeIds={bridgeNodeIds} />
        </section>

        {/* Ecosystem gaps */}
        <section>
          <h3 className={styles.sectionHeader}>Missing Connections</h3>
          <p className={styles.sectionDesc}>
            Community pairs with internal density but zero or minimal inter-community edges — structural holes where new connections would have outsized impact.
          </p>
          <GapsTable gaps={gaps} />
        </section>
      </div>
    </MainGrid>
  );
}
