import { useState, useMemo } from 'react';
import { useRiskSignals } from '../../api/hooks';
import styles from './RiskIntelligencePanel.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const SIGNAL_ICONS = {
  momentum_decay: '\u2935',       // ⤵
  capital_concentration: '\u25C9', // ◉
  ssbci_compliance: '\u23F1',      // ⏱
  network_fragility: '\u26A0',     // ⚠
  stale_intelligence: '\u25CC',    // ◌
  investor_flight: '\u2191',       // ↑
  sector_contagion: '\u2623',      // ☣
};

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#e5b654',
  low: 'rgba(255,255,255,0.4)',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

const HEATMAP_DIMS = [
  { key: 'momentum', label: 'MOM' },
  { key: 'funding_velocity', label: 'FV' },
  { key: 'market_timing', label: 'MKT' },
  { key: 'hiring', label: 'HIRE' },
  { key: 'data_quality', label: 'DQ' },
  { key: 'network', label: 'NET' },
  { key: 'team', label: 'TEAM' },
];

function heatColor(value) {
  if (value >= 70) return 'rgba(52, 201, 168, 0.7)';
  if (value >= 40) return 'rgba(229, 182, 84, 0.7)';
  return 'rgba(239, 68, 68, 0.7)';
}

function scoreColor(score) {
  if (score >= 75) return SEVERITY_COLORS.critical;
  if (score >= 50) return SEVERITY_COLORS.high;
  if (score >= 25) return SEVERITY_COLORS.medium;
  return '#34c9a8';
}

function gradeClass(grade) {
  switch (grade) {
    case 'CRITICAL': return styles.gradeCritical;
    case 'ELEVATED': return styles.gradeElevated;
    case 'MODERATE': return styles.gradeModerate;
    default: return styles.gradeLow;
  }
}

function badgeClass(severity) {
  switch (severity) {
    case 'critical': return styles.badgeCritical;
    case 'high': return styles.badgeHigh;
    case 'medium': return styles.badgeMedium;
    default: return styles.badgeLow;
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadges({ counts }) {
  return (
    <div className={styles.severityBadges}>
      {SEVERITY_ORDER.map((sev) => {
        const count = counts[sev] || 0;
        if (count === 0) return null;
        return (
          <span key={sev} className={`${styles.severityBadge} ${badgeClass(sev)}`}>
            {count} {sev.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}

function PortfolioRiskScore({ score, grade }) {
  return (
    <div className={styles.scoreSection}>
      <span className={styles.scoreLabel}>Portfolio Risk</span>
      <span className={styles.scoreValue} style={{ color: scoreColor(score) }}>
        {score}
      </span>
      <span className={`${styles.scoreGrade} ${gradeClass(grade)}`}>
        {grade}
      </span>
      <div className={styles.gradientBar}>
        <div
          className={styles.gradientMarker}
          style={{ left: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function SignalCard({ signal, expanded, onToggle }) {
  const color = SEVERITY_COLORS[signal.severity];
  const icon = SIGNAL_ICONS[signal.signal_type] || '\u25CF';
  const metricPct = Math.min(Math.abs(signal.metric_value) / Math.max(Math.abs(signal.threshold) * 2, 1) * 100, 100);

  return (
    <div
      className={`${styles.signalCard} ${expanded ? styles.signalCardExpanded : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onToggle}
    >
      <div className={styles.signalHeader}>
        <span className={styles.signalIcon} style={{ color }}>{icon}</span>
        <span
          className={styles.signalSeverity}
          style={{ color, background: `${color}15`, border: `1px solid ${color}40` }}
        >
          {signal.severity}
        </span>
        <span className={styles.signalTitle}>{signal.title}</span>
      </div>

      {expanded && (
        <div className={styles.signalExpanded}>
          <p className={styles.signalDescription}>{signal.description}</p>

          <div className={styles.signalMetricBar}>
            <span className={styles.metricLabel}>Value</span>
            <div className={styles.metricTrack}>
              <div
                className={styles.metricFill}
                style={{ width: `${metricPct}%`, background: color }}
              />
            </div>
            <span className={styles.metricValue} style={{ color }}>
              {signal.metric_value}
            </span>
          </div>

          {signal.affected_entities.length > 0 && (
            <div className={styles.signalEntities}>
              {signal.affected_entities.slice(0, 8).map((e, i) => (
                <span key={i} className={styles.entityTag}>{e.name}</span>
              ))}
              {signal.affected_entities.length > 8 && (
                <span className={styles.entityTag}>+{signal.affected_entities.length - 8}</span>
              )}
            </div>
          )}

          <div className={styles.signalRecommendation}>
            {signal.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskHeatmap({ companies }) {
  const top = useMemo(() => {
    if (!companies) return [];
    return companies
      .filter((c) => c.dims)
      .sort((a, b) => (b.irs || 0) - (a.irs || 0))
      .slice(0, 20);
  }, [companies]);

  if (top.length === 0) return null;

  return (
    <div className={styles.heatmapSection}>
      <div className={styles.heatmapTitle}>IRS Dimension Heatmap</div>
      <div className={styles.heatmapGrid}>
        <table className={styles.heatmapTable}>
          <thead>
            <tr>
              <th className={`${styles.heatmapTh} ${styles.heatmapThName}`}>Company</th>
              {HEATMAP_DIMS.map((d) => (
                <th key={d.key} className={styles.heatmapTh}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.id} className={styles.heatmapRow}>
                <td className={styles.heatmapName} title={c.name}>
                  {c.name.length > 14 ? c.name.slice(0, 14) + '\u2026' : c.name}
                </td>
                {HEATMAP_DIMS.map((d) => {
                  const val = c.dims?.[d.key] ?? 0;
                  return (
                    <td key={d.key} className={styles.heatCell}>
                      <span
                        className={styles.heatDot}
                        style={{ background: heatColor(val) }}
                        title={`${d.label}: ${val}`}
                      >
                        {val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function RiskIntelligencePanel({ companies = [] }) {
  const { data, isLoading } = useRiskSignals();
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const filteredSignals = useMemo(() => {
    if (!data?.signals) return [];
    if (!activeFilter) return data.signals;
    return data.signals.filter((s) => s.severity === activeFilter);
  }, [data, activeFilter]);

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>Risk Intelligence</span>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.loading}>COMPUTING RISK SIGNALS...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Risk Intelligence</span>
          <SeverityBadges counts={data.signal_counts} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* ── Portfolio Risk Score ── */}
        <PortfolioRiskScore
          score={data.portfolio_risk_score}
          grade={data.risk_grade}
        />

        {/* ── Signal Cards ── */}
        <div className={styles.signalsSection}>
          <div className={styles.filterBar}>
            <button
              className={`${styles.filterPill} ${!activeFilter ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter(null)}
            >
              All ({data.signal_counts.total})
            </button>
            {SEVERITY_ORDER.map((sev) => {
              const count = data.signal_counts[sev] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={sev}
                  className={`${styles.filterPill} ${activeFilter === sev ? styles.filterPillActive : ''}`}
                  onClick={() => setActiveFilter(activeFilter === sev ? null : sev)}
                  style={activeFilter === sev ? { borderColor: SEVERITY_COLORS[sev], color: SEVERITY_COLORS[sev] } : undefined}
                >
                  {sev} ({count})
                </button>
              );
            })}
          </div>

          <div className={styles.signalList}>
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                expanded={expandedId === signal.id}
                onToggle={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Risk Heatmap ── */}
        <RiskHeatmap companies={companies} />
      </div>
    </div>
  );
}
