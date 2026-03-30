import { MainGrid } from '../layout/AppShell';
import {
  useRegionalSummary,
  useMacroEvents,
  useModelLeaderboard,
} from '../../api/hooks.js';
import styles from './EconomicsView.module.css';

/* ── Helpers ─────────────────────────────────────────────── */

function formatIndicatorName(raw) {
  return (raw || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val) {
  if (val == null) return '--';
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2);
}

function formatDate(iso) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function severityClass(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'critical') return styles.severityCritical;
  if (s === 'high') return styles.severityHigh;
  if (s === 'medium') return styles.severityMedium;
  return styles.severityLow;
}

function scoreColor(score) {
  if (score > 60) return 'Green';
  if (score >= 30) return 'Amber';
  return 'Red';
}

/* ── Skeleton Loaders ────────────────────────────────────── */

function KpiSkeleton() {
  return (
    <div className={styles.kpiStrip}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles.skeletonKpi}`} />
      ))}
    </div>
  );
}

function RowSkeleton({ count = 6 }) {
  return (
    <div className={styles.skeletonRow}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}

/* ── Section 1: KPI Strip ────────────────────────────────── */

function KpiStrip({ data, isLoading, error }) {
  if (error) {
    return <div className={styles.errorState}>Failed to load regional indicators</div>;
  }
  if (isLoading) return <KpiSkeleton />;
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No regional indicators available</div>;
  }

  return (
    <div className={styles.kpiStrip}>
      {data.map((item) => (
        <div key={item.indicator_name || item.indicator} className={styles.kpiCell}>
          <span className={styles.kpiLabel}>
            {formatIndicatorName(item.indicator_name || item.indicator)}
          </span>
          <span className={styles.kpiValue}>{formatValue(item.indicator_value ?? item.value)}</span>
          {item.unit && <span className={styles.kpiUnit}>{item.unit}</span>}
        </div>
      ))}
    </div>
  );
}

/* ── Section 2: Macro Events Timeline ────────────────────── */

function MacroTimeline({ data, isLoading, error }) {
  if (error) {
    return <div className={styles.errorState}>Failed to load macro events</div>;
  }
  if (isLoading) return <RowSkeleton count={5} />;
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No macro events recorded</div>;
  }

  const sorted = [...data].sort(
    (a, b) => new Date(b.event_date) - new Date(a.event_date)
  );

  return sorted.map((ev) => {
    const sectors = Array.isArray(ev.affected_sectors)
      ? ev.affected_sectors
      : typeof ev.affected_sectors === 'string'
        ? ev.affected_sectors.split(',').map((s) => s.trim())
        : [];

    return (
      <div key={ev.id || ev.event_name + ev.event_date} className={styles.timelineItem}>
        <span className={styles.timelineDate}>{formatDate(ev.event_date)}</span>
        <div className={styles.timelineBody}>
          <div className={styles.timelineNameRow}>
            <span className={styles.timelineName}>{ev.event_name}</span>
            <span className={`${styles.severityBadge} ${severityClass(ev.severity)}`}>
              {(ev.severity || 'unknown').toUpperCase()}
            </span>
          </div>
          {sectors.length > 0 && (
            <div className={styles.sectorChips}>
              {sectors.map((s) => (
                <span key={s} className={styles.sectorChip}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  });
}

/* ── Section 3: Prediction Leaderboard ───────────────────── */

function PredictionLeaderboard({ data, isLoading, error }) {
  if (error) {
    return <div className={styles.errorState}>Failed to load leaderboard</div>;
  }
  if (isLoading) return <RowSkeleton count={8} />;
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No prediction scores available</div>;
  }

  return (
    <table className={styles.leaderboardTable}>
      <thead>
        <tr>
          <th className={`${styles.leaderboardTh} ${styles.leaderboardThCenter}`}>#</th>
          <th className={styles.leaderboardTh}>Company</th>
          <th className={styles.leaderboardTh}>Score</th>
          <th className={`${styles.leaderboardTh} ${styles.leaderboardThRight}`}>Confidence</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => {
          const score = Number(row.score ?? row.value ?? 0);
          const color = scoreColor(score);
          const lo = row.confidence_lo ?? row.lo;
          const hi = row.confidence_hi ?? row.hi;

          return (
            <tr key={row.entity_id || row.company_name || idx} className={styles.leaderboardRow}>
              <td className={styles.leaderboardRank}>{idx + 1}</td>
              <td className={styles.leaderboardName}>
                {row.company_name || row.entity_name || '--'}
              </td>
              <td className={styles.leaderboardScoreCell}>
                <div className={styles.scoreBarWrapper}>
                  <div className={styles.scoreBarTrack}>
                    <div
                      className={`${styles.scoreBarFill} ${styles[`bar${color}`]}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                  <span className={`${styles.scoreValue} ${styles[`score${color}`]}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
              </td>
              <td className={styles.leaderboardConfidence}>
                {lo != null && hi != null
                  ? `${Number(lo).toFixed(1)}-${Number(hi).toFixed(1)}`
                  : '--'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export function EconomicsView() {
  const regional = useRegionalSummary();
  const events = useMacroEvents();
  const leaderboard = useModelLeaderboard('composite_score', 20);

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* KPI Strip */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Regional Economic Indicators</span>
          <span className={styles.sectionMeta}>NV ECON SNAPSHOT</span>
        </div>
        <KpiStrip
          data={regional.data}
          isLoading={regional.isLoading}
          error={regional.error}
        />

        {/* Two-column layout */}
        <div className={styles.columns}>
          {/* Macro Events */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Macro Events</span>
              <span className={styles.sectionMeta}>
                {events.data ? `${events.data.length} EVENTS` : ''}
              </span>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelBody}>
                <MacroTimeline
                  data={events.data}
                  isLoading={events.isLoading}
                  error={events.error}
                />
              </div>
            </div>
          </div>

          {/* Prediction Leaderboard */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Prediction Leaderboard</span>
              <span className={styles.sectionMeta}>COMPOSITE SCORE</span>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelBody}>
                <PredictionLeaderboard
                  data={leaderboard.data}
                  isLoading={leaderboard.isLoading}
                  error={leaderboard.error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainGrid>
  );
}
