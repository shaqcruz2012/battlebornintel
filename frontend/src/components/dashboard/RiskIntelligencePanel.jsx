import { memo, useState, useMemo, useEffect } from 'react';
import { useRiskSignals } from '../../api/hooks';
import styles from './RiskIntelligencePanel.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const SIGNAL_ICONS = {
  momentum_decay: '\u2935',         // ⤵
  capital_concentration: '\u25C9',   // ◉
  ssbci_compliance: '\u23F1',        // ⏱
  network_fragility: '\u26A0',       // ⚠
  stale_intelligence: '\u25CC',      // ◌
  investor_flight: '\u2191',         // ↑
  sector_contagion: '\u2623',        // ☣
  ecosystem_velocity: '\u21C5',      // ⇅
  stage_pipeline_health: '\u25A3',   // ▣
  funding_gap: '\u2300',             // ⌀
};

const TEMPORAL_SIGNAL_TYPES = new Set([
  'ecosystem_velocity',
  'stage_pipeline_health',
  'funding_gap',
]);

const SEVERITY_COLORS = {
  critical: '#ff6b6b',
  high: '#f97316',
  medium: '#e5b654',
  low: 'rgba(255,255,255,0.4)',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

// ── Signal Analysis Context ─────────────────────────────────────────────────

const SIGNAL_CONTEXT = {
  ecosystem_velocity: {
    situation:
      'Ecosystem activity has dropped significantly, indicating potential slowdown in deal flow, partnerships, and innovation output. This pattern often precedes funding dry-ups by 2-3 quarters as investor confidence erodes and company formation rates decline.',
    framework:
      'Apply the Ecosystem Lifecycle Framework: classify whether this is a seasonal dip, structural decline, or data collection gap. Compare against national VC activity benchmarks for the same period. Cross-reference with NVSOS filing data and DETR employment figures to distinguish real deceleration from reporting lag.',
    recommendation:
      'Conduct an ecosystem health check with GOED stakeholders. If activity decline is real (not a data artifact), consider launching an emergency deal flow stimulus — accelerator demo days, corporate partnership matchmaking, or innovation challenges to reactivate dormant companies.',
  },
  stage_pipeline_health: {
    situation:
      'A significant number of companies show no stage progression, funding events, or milestone achievements. This suggests companies may be stuck in a "zombie" state — operating but not growing, consuming ecosystem resources without generating returns or employment gains.',
    framework:
      'Use Stage Gate Analysis: segment stalled companies by stage (seed vs. growth) and sector. Seed-stage stalls often indicate mentorship gaps; growth-stage stalls suggest capital access barriers. Map each cohort against time-to-milestone benchmarks from comparable ecosystems (Utah, Colorado).',
    recommendation:
      'Launch targeted intervention programs: for seed-stage stalls, increase mentorship and technical assistance; for growth-stage, facilitate Series A/B investor introductions and consider bridge financing through SSBCI vehicles.',
  },
  funding_gap: {
    situation:
      'Specific funding stages show significantly fewer active investors than expected, creating bottlenecks where companies cannot progress to the next stage regardless of their readiness. These gaps often cascade — a Series A gap today produces a Series B drought 18-24 months later.',
    framework:
      'Apply Capital Stack Analysis: map available capital by stage against company demand. Identify which stages have supply-demand mismatches and whether gaps are structural (no funds targeting that stage) or cyclical (funds paused deployments). Compare Nevada capital density per stage with peer states.',
    recommendation:
      'Work with GOED and fund managers to recruit stage-specific investors. For seed gaps, consider expanding angel network programs; for Series A gaps, create co-investment vehicles that de-risk lead investor positions.',
  },
  sector_contagion: {
    situation:
      'A sector is showing declining metrics across multiple dimensions — company count, funding velocity, hiring, and deal activity. When one sector weakens, it can pull down adjacent sectors through supply chain dependencies and investor sentiment contagion.',
    framework:
      'Apply Sector Dependency Mapping: identify upstream and downstream connections between the declining sector and healthy sectors. Use the ecosystem graph to quantify cross-sector investor overlap and shared talent pools. Determine if decline is sector-specific or macro-driven.',
    recommendation:
      'Isolate the affected sector to prevent contagion. Engage sector-specific advisors to diagnose root causes. If decline is structural (e.g., regulatory shift), facilitate company pivots and workforce retraining programs. If cyclical, maintain support infrastructure so the sector can recover.',
  },
  ssbci_compliance: {
    situation:
      'SSBCI deployment clock is running and fund deployment rates are behind schedule relative to federal milestones. Failure to deploy on time risks clawback of federal matching funds, which would remove a critical component of Nevada\'s early-stage capital stack.',
    framework:
      'Apply Deployment Clock Analysis: calculate remaining capital vs. remaining time, accounting for typical deal velocity. Model best-case and worst-case deployment scenarios. Identify whether the bottleneck is deal flow (not enough qualified companies) or process (slow diligence/closing).',
    recommendation:
      'Convene an emergency SSBCI deployment review with fund managers. If deal flow is the bottleneck, accelerate pipeline development through targeted outreach. If process is the bottleneck, streamline diligence requirements and consider parallel processing of applications.',
  },
  capital_concentration: {
    situation:
      'Portfolio concentration exceeds healthy thresholds — too much capital is deployed into too few companies, sectors, or stages. This creates fragility: if a single large position fails, it can impair the entire portfolio and damage investor confidence in the ecosystem.',
    framework:
      'Apply Portfolio Diversification Analysis: calculate Herfindahl-Hirschman Index (HHI) — a standard measure of concentration where higher values mean capital is more concentrated in fewer places — across sectors, stages, and individual positions. Compare against target allocation ranges. Identify whether concentration is intentional (strategic bets) or accidental (follow-on bias).',
    recommendation:
      'Rebalance new deployments toward underweight sectors and stages. Establish concentration limits in fund mandates (e.g., no single company > 15% of fund, no single sector > 30%). For existing concentrated positions, explore syndication or secondary sales to reduce exposure.',
  },
  momentum_decay: {
    situation:
      'Company-level momentum indicators are declining — hiring has slowed, press mentions have dropped, and product milestones are being missed. Momentum decay is often the earliest signal of a company entering distress, typically appearing 6-9 months before financial metrics deteriorate.',
    framework:
      'Apply the Leading Indicator Framework: weight recent momentum data more heavily than lagging financial metrics. Segment companies by decay severity (mild slowdown vs. full stall) and identify common patterns among decaying companies (sector, stage, investor profile).',
    recommendation:
      'Flag decaying companies for proactive portfolio management. Conduct wellness checks with founders to identify root causes (market, team, capital, product). Deploy targeted support: executive coaching, customer introductions, or bridge capital as appropriate.',
  },
  network_fragility: {
    situation:
      'The ecosystem graph shows structural weakness — key nodes (connector companies, active investors, serial mentors) have reduced their engagement, creating the risk that network partitions could isolate subgroups of companies from deal flow and knowledge sharing.',
    framework:
      'Apply Network Resilience Analysis: compute betweenness centrality (how often each entity acts as a bridge between groups) and identify single points of failure. Model what happens if the top 3-5 connector nodes disengage. Measure clustering coefficient (how tightly each entity\'s contacts are connected to each other) to assess whether subnetworks are self-sustaining or dependent on hub nodes.',
    recommendation:
      'Strengthen network redundancy by cultivating backup connectors in each subcluster. Launch cross-sector networking events to create alternative pathways. Engage disengaging connectors to understand and address their reasons for withdrawal.',
  },
  investor_flight: {
    situation:
      'Active investor count is declining as investors reduce their Nevada-focused activity or exit the ecosystem entirely. Investor flight reduces competition for deals, which counterintuitively hurts companies by lowering valuations and reducing the urgency to close rounds.',
    framework:
      'Apply Investor Retention Analysis: categorize departing investors by type (angel, VC, corporate), investment stage, and reason for departure. Determine whether exits are due to poor returns, better opportunities elsewhere, or ecosystem-specific friction (regulatory, talent, deal flow).',
    recommendation:
      'Conduct exit interviews with departing investors to identify addressable friction points. Launch an investor attraction campaign highlighting recent wins, improved infrastructure, and SSBCI co-investment opportunities. Consider creating a fund-of-funds vehicle to anchor institutional capital.',
  },
  stale_intelligence: {
    situation:
      'A significant portion of tracked entities have not been updated recently, meaning current risk assessments may be based on outdated information. Stale data creates blind spots where emerging risks go undetected until they become crises.',
    framework:
      'Apply Data Freshness Analysis: calculate the age distribution of entity records and identify clusters of staleness. Determine whether staleness is uniform (system-wide collection issue) or concentrated (specific sectors or stages). Assess the impact on risk model confidence intervals (the range where the true value likely falls).',
    recommendation:
      'Prioritize data refresh for high-risk and high-value entities. Investigate and repair any broken data collection pipelines. For entities with chronic staleness, evaluate whether they should be reclassified as inactive or flagged for manual verification.',
  },
};

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

function formatMetricValue(value) {
  if (value == null) return '--';
  return typeof value === 'number' ? value.toLocaleString() : String(value);
}

function thresholdRatio(value, threshold) {
  if (threshold == null || threshold === 0) return 0;
  return Math.min(Math.abs(value) / (Math.abs(threshold) * 2), 1);
}

function SignalAnalysis({ signalType }) {
  const [open, setOpen] = useState(false);
  const ctx = SIGNAL_CONTEXT[signalType];

  if (!ctx) return null;

  function handleToggle(e) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  return (
    <div className={styles.analysisSection}>
      <button
        className={styles.analysisToggle}
        onClick={handleToggle}
        aria-expanded={open}
        type="button"
      >
        <span className={styles.analysisToggleIcon}>{open ? '\u25BE' : '\u25B8'}</span>
        VIEW ANALYSIS
      </button>
      {open && (
        <div className={styles.analysisBody}>
          <div className={styles.analysisBlock}>
            <span className={styles.analysisLabel}>SITUATION</span>
            <p className={styles.analysisText}>{ctx.situation}</p>
          </div>
          <div className={styles.analysisBlock}>
            <span className={styles.analysisLabel}>FRAMEWORK</span>
            <p className={styles.analysisText}>{ctx.framework}</p>
          </div>
          <div className={styles.analysisBlock}>
            <span className={styles.analysisLabel}>RECOMMENDATION</span>
            <p className={styles.analysisText}>{ctx.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, expanded, onToggle }) {
  const color = SEVERITY_COLORS[signal.severity];
  const icon = SIGNAL_ICONS[signal.signal_type] || '\u25CF';
  const metricPct = thresholdRatio(signal.metric_value, signal.threshold) * 100;
  const isTemporal = TEMPORAL_SIGNAL_TYPES.has(signal.signal_type);
  const breached = signal.threshold != null
    && Math.abs(signal.metric_value) >= Math.abs(signal.threshold);

  return (
    <div
      className={`${styles.signalCard} ${expanded ? styles.signalCardExpanded : ''} ${isTemporal ? styles.signalCardTemporal : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
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
        {isTemporal && (
          <span className={styles.temporalBadge}>TEMPORAL</span>
        )}
        {breached && (
          <span className={styles.breachedBadge}>BREACH</span>
        )}
      </div>

      {/* Compact threshold summary visible when collapsed */}
      {!expanded && signal.threshold != null && (
        <div className={styles.signalCompactMetric}>
          <span className={styles.compactValue} style={{ color }}>
            {formatMetricValue(signal.metric_value)}
          </span>
          <span className={styles.compactThreshold}>
            / {formatMetricValue(signal.threshold)} threshold
          </span>
        </div>
      )}

      {expanded && (
        <div className={styles.signalExpanded}>
          <p className={styles.signalDescription}>{signal.description}</p>

          {/* Metric vs Threshold comparison */}
          <div className={styles.signalMetricBar}>
            <span className={styles.metricLabel}>Value</span>
            <div className={styles.metricTrack}>
              <div
                className={styles.metricFill}
                style={{ width: `${metricPct}%`, background: color }}
              />
              {signal.threshold != null && (
                <div
                  className={styles.thresholdMarker}
                  style={{ left: `${Math.min(50, 100)}%` }}
                  title={`Threshold: ${signal.threshold}`}
                />
              )}
            </div>
            <span className={styles.metricValue} style={{ color }}>
              {formatMetricValue(signal.metric_value)}
            </span>
          </div>

          {signal.threshold != null && (
            <div className={styles.thresholdRow}>
              <span className={styles.thresholdLabel}>Threshold:</span>
              <span className={styles.thresholdValue}>{formatMetricValue(signal.threshold)}</span>
              <span className={breached ? styles.thresholdBreached : styles.thresholdOk}>
                {breached ? 'BREACHED' : 'WITHIN'}
              </span>
            </div>
          )}

          {signal.affected_entities && signal.affected_entities.length > 0 && (
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

          {/* Expandable analysis context */}
          <SignalAnalysis signalType={signal.signal_type} />
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
      <details className={styles.heatmapMethodology}>
        <summary className={styles.methodologySummary}>METHODOLOGY &amp; KEY</summary>
        <p>
          The IRS (Investment Readiness Score) is a composite 0-100 metric computed across 7 dimensions.
          Data sources include verified fund reports, company filings, hiring signals, and sector heat indices.
        </p>
        <div className={styles.heatmapMethodologyDims}>
          <span>MOM = Momentum (20%) — Growth velocity from recent activity and market traction</span>
          <span>FV = Funding Velocity (15%) — Capital raised relative to stage benchmarks</span>
          <span>MKT = Market Timing (10%) — Sector heat and market opportunity alignment</span>
          <span>HIRE = Hiring Signal (12%) — Workforce expansion and talent acquisition patterns</span>
          <span>DQ = Data Quality (8%) — Completeness and verifiability of company data</span>
          <span>NET = Network Access (8%) — Connections to funds, accelerators, and ecosystem orgs</span>
          <span>TEAM = Team Strength (15%) — Team size, experience, and leadership indicators</span>
        </div>
      </details>
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

export const RiskIntelligencePanel = memo(function RiskIntelligencePanel({ companies = [] }) {
  const { data, isLoading } = useRiskSignals();
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  // Reset filter when data changes to prevent stale selection
  useEffect(() => { setActiveFilter(null); }, [data]);

  const { filteredSignals, temporalSignals } = useMemo(() => {
    if (!data?.signals) return { filteredSignals: [], temporalSignals: [] };

    const temporal = data.signals.filter((s) => TEMPORAL_SIGNAL_TYPES.has(s.signal_type));
    const standard = data.signals.filter((s) => !TEMPORAL_SIGNAL_TYPES.has(s.signal_type));

    const filtered = activeFilter
      ? standard.filter((s) => s.severity === activeFilter)
      : standard;

    return { filteredSignals: filtered, temporalSignals: temporal };
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
          <div className={styles.loading} role="status" aria-busy="true">COMPUTING RISK SIGNALS...</div>
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
        {data.computed_at && (
          <span className={styles.computedAt}>
            {new Date(data.computed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
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
          {/* ── Temporal Signals (prominent) ── */}
          {temporalSignals.length > 0 && (
            <div className={styles.temporalSection}>
              <div className={styles.temporalHeader}>Temporal Signals</div>
              <div className={styles.temporalList}>
                {temporalSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    expanded={expandedId === signal.id}
                    onToggle={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.filterBar}>
            <button
              className={`${styles.filterPill} ${!activeFilter ? styles.filterPillActive : ''}`}
              onClick={() => setActiveFilter(null)}
            >
              All ({data.signal_counts.total - temporalSignals.length})
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
});
