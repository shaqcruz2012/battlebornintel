import { fmt, formatNumber, formatPercent } from '../../../engine/formatters';
import styles from '../KpiDetailPanel.module.css';

// Null-safe wrappers around centralized formatters
export const fmtDollars = (val) => (val == null ? '--' : fmt(val));
export const fmtPct = (val) => (val == null ? '--' : formatPercent(val, 0));
export const fmtNumber = (val) => (val == null ? '--' : formatNumber(val));

// ── Reusable sub-components ─────────────────────────────────────────────────

export function HorizontalBar({ label, value, maxValue, suffix = '', color = 'var(--accent-teal)', annotation }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.barValue}>
        {typeof value === 'number' ? value.toFixed(1) : value}{suffix}
      </span>
      {annotation && <span className={styles.barAnnotation}>{annotation}</span>}
    </div>
  );
}

export function StatusDot({ status }) {
  const colors = {
    'on-track': 'var(--status-success)',
    'caution': 'var(--accent-gold)',
    'at-risk': 'var(--status-risk)',
    'critical': 'var(--status-risk)',
  };
  return (
    <span
      className={styles.statusDot}
      style={{ background: colors[status] || 'var(--text-disabled)' }}
      title={status}
    />
  );
}

export function StatRow({ label, value, accent = false, status }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.statRight}>
        {status && <StatusDot status={status} />}
        <span className={`${styles.statValue} ${accent ? styles.statAccent : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const statusClass = {
    'on-track': styles.statusOnTrack,
    'caution': styles.statusCaution,
    'at-risk': styles.statusAtRisk,
    'exceeding': styles.statusExceeding,
  }[status] || styles.statusOnTrack;

  return (
    <span className={`${styles.statusBadge} ${statusClass}`}>
      {label || status}
    </span>
  );
}

export function AnalystAssessment({ text, status }) {
  return (
    <div className={styles.assessmentBlock}>
      <div className={styles.assessmentHeader}>
        <span className={styles.assessmentLabel}>Analyst Assessment</span>
        {status && <StatusBadge status={status.key} label={status.label} />}
      </div>
      <p className={styles.assessmentText}>{text}</p>
    </div>
  );
}

export function ActionItem({ icon, text, priority = 'info' }) {
  const priorityClass = {
    high: styles.actionHigh,
    medium: styles.actionMedium,
    info: styles.actionInfo,
  }[priority] || styles.actionInfo;

  return (
    <div className={`${styles.actionItem} ${priorityClass}`}>
      <span className={styles.actionIcon}>{icon}</span>
      <span className={styles.actionText}>{text}</span>
    </div>
  );
}

export function BenchmarkRow({ label, value, benchmark, unit = '' }) {
  const numVal = typeof value === 'number' ? value : 0;
  const numBench = typeof benchmark === 'number' ? benchmark : 0;
  const delta = numBench > 0 ? ((numVal - numBench) / numBench) * 100 : 0;
  const isAbove = delta >= 0;

  return (
    <div className={styles.benchmarkRow}>
      <span className={styles.benchmarkLabel}>{label}</span>
      <span className={styles.benchmarkValue}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
      <span className={`${styles.benchmarkDelta} ${isAbove ? styles.deltaPositive : styles.deltaNegative}`}>
        {isAbove ? '+' : ''}{delta.toFixed(0)}%
      </span>
    </div>
  );
}

export function TrendBadge({ direction, label }) {
  const isUp = direction === 'up';
  return (
    <span className={`${styles.trendBadge} ${isUp ? styles.trendUp : styles.trendDown}`}>
      <span className={styles.trendArrow}>{isUp ? '\u25B2' : '\u25BC'}</span>
      {label}
    </span>
  );
}

export function RiskFlag({ message }) {
  return (
    <div className={styles.riskFlag}>
      <span className={styles.riskIcon}>{'!'}</span>
      <span className={styles.riskText}>{message}</span>
    </div>
  );
}

export function SectionDivider() {
  return <div className={styles.sectionDivider} />;
}
