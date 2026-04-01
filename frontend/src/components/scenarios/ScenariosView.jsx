import { useState, useMemo } from 'react';
import { useScenarios, useScenario } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import styles from './ScenariosView.module.css';

const STATUS_CLASS = {
  complete: styles.statusCompleted,
  completed: styles.statusCompleted,
  running: styles.statusRunning,
  pending: styles.statusPending,
  draft: styles.statusPending,
  failed: styles.statusFailed,
  archived: styles.statusFailed,
};

const METRIC_LABELS = {
  funding_m_simulated: 'Funding ($M)',
  funding_m_simulated_mean: 'Funding ($M) Mean',
  employees_simulated: 'Employees',
  employees_simulated_mean: 'Employees Mean',
  momentum_simulated: 'Momentum',
  momentum_simulated_mean: 'Momentum Mean',
  new_companies_simulated: 'New Companies',
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(val) {
  if (val == null) return '--';
  if (typeof val === 'number') {
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return String(val);
}

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.loadingWrapper}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
        <div className={`skeleton ${styles.skeletonDetail}`} />
      </div>
    </MainGrid>
  );
}

/**
 * Aggregate raw scenario_results rows into a summary per metric.
 * Groups by metric_name, takes the latest-period row, and computes
 * an aggregate across all entities for that metric/period.
 */
function summarizeResults(results) {
  if (!results || results.length === 0) return [];

  // Group by metric_name
  const byMetric = {};
  for (const r of results) {
    const key = r.metric_name;
    if (!byMetric[key]) byMetric[key] = [];
    byMetric[key].push(r);
  }

  // For each metric, find the latest period and aggregate across entities
  const summaries = [];
  for (const [metric, rows] of Object.entries(byMetric)) {
    // Skip _mean variants to avoid duplication -- show only median
    if (metric.endsWith('_mean')) continue;

    // Sort by period descending
    const sorted = [...rows].sort(
      (a, b) => new Date(b.period) - new Date(a.period)
    );
    const latestPeriod = sorted[0].period;
    const latestRows = sorted.filter((r) => r.period === latestPeriod);

    // Aggregate: median of values, min of confidence_lo, max of confidence_hi
    const values = latestRows.map((r) => parseFloat(r.value)).filter((v) => !isNaN(v));
    const ciLows = latestRows.map((r) => parseFloat(r.confidence_lo)).filter((v) => !isNaN(v));
    const ciHighs = latestRows.map((r) => parseFloat(r.confidence_hi)).filter((v) => !isNaN(v));

    if (values.length === 0) continue;

    values.sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];

    // Also find earliest period values for comparison
    const earliestPeriod = sorted[sorted.length - 1].period;
    const earliestRows = sorted.filter((r) => r.period === earliestPeriod);
    const earlyValues = earliestRows.map((r) => parseFloat(r.value)).filter((v) => !isNaN(v));
    earlyValues.sort((a, b) => a - b);
    const earlyMedian = earlyValues.length > 0 ? earlyValues[Math.floor(earlyValues.length / 2)] : null;

    summaries.push({
      metric,
      label: METRIC_LABELS[metric] || metric.replace(/_/g, ' '),
      value: median,
      baseline: earlyMedian,
      ciLow: ciLows.length > 0 ? Math.min(...ciLows) : null,
      ciHigh: ciHighs.length > 0 ? Math.max(...ciHighs) : null,
      entityCount: latestRows.length,
      period: latestPeriod,
      unit: latestRows[0].unit,
    });
  }

  return summaries;
}

function ForecastTable({ forecasts }) {
  if (!forecasts || forecasts.length === 0) {
    return <div className={styles.emptyState}>No forecast data available</div>;
  }

  return (
    <table className={styles.forecastTable}>
      <thead>
        <tr>
          <th className={styles.forecastTh}>Metric</th>
          <th className={styles.forecastTh}>Q1 Median</th>
          <th className={styles.forecastTh}>Final Quarter</th>
          <th className={styles.forecastTh} title="Lower bound (p5) of the confidence interval across all entities at the final forecast quarter">CI Low</th>
          <th className={styles.forecastTh} title="Upper bound (p95) of the confidence interval across all entities at the final forecast quarter">CI High</th>
        </tr>
      </thead>
      <tbody>
        {forecasts.map((f) => {
          let colorClass = styles.neutral;
          if (f.baseline != null && f.value != null) {
            colorClass = f.value > f.baseline
              ? styles.positive
              : f.value < f.baseline
                ? styles.negative
                : styles.neutral;
          }

          return (
            <tr key={f.metric}>
              <td className={`${styles.forecastTd} ${styles.forecastMetricName}`}>
                {f.label}
              </td>
              <td className={styles.forecastTd}>{formatNumber(f.baseline)}</td>
              <td className={`${styles.forecastTd} ${colorClass}`}>
                {formatNumber(f.value)}
              </td>
              <td className={styles.forecastTd}>{formatNumber(f.ciLow)}</td>
              <td className={styles.forecastTd}>{formatNumber(f.ciHigh)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ScenarioDetail({ scenarioId }) {
  const { data: scenario, isLoading, isError, error } = useScenario(scenarioId);

  // useMemo must be called before any conditional returns (React hooks rule)
  const rawResults = scenario?.results || scenario?.forecasts || scenario?.entities || [];
  const forecasts = useMemo(() => summarizeResults(rawResults), [rawResults]);

  if (isLoading) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.emptyState}>Loading scenario details...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.emptyState}>
          Error loading scenario: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.emptyState}>Scenario not found</div>
      </div>
    );
  }

  // Parse assumptions for display
  const assumptions = scenario.assumptions || {};
  const interventions = assumptions.interventions || [];
  const nSims = assumptions.n_simulations;
  const horizonQ = assumptions.horizon_quarters;

  return (
    <div className={styles.detailPanel}>
      <h2 className={styles.detailTitle}>{scenario.name || scenario.title}</h2>

      <div className={styles.detailMeta}>
        {scenario.status && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Status</span>
            <span className={`${styles.statusBadge} ${STATUS_CLASS[scenario.status] || ''}`}>
              {scenario.status}
            </span>
          </span>
        )}
        {(scenario.created_at || scenario.date) && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Created</span>
            {formatDate(scenario.created_at || scenario.date)}
          </span>
        )}
        {scenario.model_name && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Model</span>
            {scenario.model_name}
          </span>
        )}
        {nSims && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Simulations</span>
            {nSims.toLocaleString()}
          </span>
        )}
        {horizonQ && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Horizon</span>
            {horizonQ} quarters
          </span>
        )}
      </div>

      {scenario.description && (
        <p className={styles.detailDesc}>{scenario.description}</p>
      )}

      {interventions.length > 0 && (
        <div className={styles.forecastSection}>
          <h3 className={styles.forecastHeading}>Interventions</h3>
          <div className={styles.interventionList}>
            {interventions.map((iv, i) => (
              <div key={i} className={styles.interventionTag}>
                {iv.type === 'funding_increase' && `+$${iv.amount_m}M ${iv.target || 'funding'} from ${iv.start_quarter}`}
                {iv.type === 'new_accelerator' && `New accelerator in ${iv.region} (${iv.capacity} companies/yr) from ${iv.start_quarter}`}
                {iv.type === 'interest_rate_change' && `Rate change: ${iv.bps > 0 ? '+' : ''}${iv.bps}bps from ${iv.start_quarter}`}
                {iv.type === 'tax_incentive' && `Tax reduction: ${iv.pct_reduction}% from ${iv.start_quarter}`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.forecastSection}>
        <h3 className={styles.forecastHeading}>
          Forecast Summary
          <span className={styles.forecastSubheading}>
            {rawResults.length} data points across {forecasts.length} metrics
          </span>
        </h3>
        <ForecastTable forecasts={forecasts} />
      </div>
    </div>
  );
}

export function ScenariosView() {
  const { data: scenariosData, isLoading, isError, error } = useScenarios();
  const [selectedId, setSelectedId] = useState(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <MainGrid>
        <div className={styles.wrapper}>
          <div className={styles.emptyState}>
            Error loading scenarios: {error?.message || 'Unknown error'}
          </div>
        </div>
      </MainGrid>
    );
  }

  // Handle both { data: [...] } and direct array responses
  const scenarios = Array.isArray(scenariosData)
    ? scenariosData
    : scenariosData?.data || scenariosData?.scenarios || [];

  if (scenarios.length === 0) {
    return (
      <MainGrid>
        <div className={styles.wrapper}>
          <div className={styles.emptyState}>
            <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                No scenarios yet
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                Scenarios use Monte Carlo simulation (running thousands of random scenarios to estimate
                probability ranges) to model &ldquo;what-if&rdquo; outcomes for the Nevada ecosystem
                — such as changes in SSBCI deployment, fund allocation, or sector investment.
                They are generated automatically by the scenario simulator agent on a monthly schedule.
                Check back after the next scheduled run.
              </p>
            </div>
          </div>
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* Scenario cards */}
        <div className={styles.scenarioGrid}>
          {scenarios.map((s) => {
            const id = s.id || s.scenario_id;
            const isActive = selectedId === id;
            return (
              <div
                key={id}
                className={`${styles.scenarioCard} ${isActive ? styles.scenarioCardActive : ''}`}
                onClick={() => setSelectedId(isActive ? null : id)}
              >
                <div className={styles.scenarioHeader}>
                  <span className={styles.scenarioName}>
                    {s.name || s.title || `Scenario ${id}`}
                  </span>
                  {s.status && (
                    <span className={`${styles.statusBadge} ${STATUS_CLASS[s.status] || ''}`}>
                      {s.status}
                    </span>
                  )}
                </div>
                {(s.created_at || s.date) && (
                  <span className={styles.scenarioDate}>
                    {formatDate(s.created_at || s.date)}
                  </span>
                )}
                {s.description && (
                  <p className={styles.scenarioDesc}>{s.description}</p>
                )}
                {s.result_count != null && (
                  <span className={styles.scenarioDate}>
                    {s.result_count} forecast data points
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedId && <ScenarioDetail scenarioId={selectedId} />}
      </div>
    </MainGrid>
  );
}
