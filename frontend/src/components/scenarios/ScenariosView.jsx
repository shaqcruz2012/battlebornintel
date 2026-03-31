import { useState } from 'react';
import { useScenarios, useScenario } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import styles from './ScenariosView.module.css';

const STATUS_CLASS = {
  completed: styles.statusCompleted,
  running: styles.statusRunning,
  pending: styles.statusPending,
  failed: styles.statusFailed,
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

function ForecastTable({ forecasts }) {
  if (!forecasts || forecasts.length === 0) {
    return <div className={styles.emptyState}>No forecast data available</div>;
  }

  return (
    <table className={styles.forecastTable}>
      <thead>
        <tr>
          <th className={styles.forecastTh}>Metric</th>
          <th className={styles.forecastTh}>Current</th>
          <th className={styles.forecastTh}>Predicted</th>
          <th className={styles.forecastTh}>CI Low</th>
          <th className={styles.forecastTh}>CI High</th>
        </tr>
      </thead>
      <tbody>
        {forecasts.map((f, idx) => {
          const current = f.current_value ?? f.current ?? f.baseline;
          const predicted = f.predicted_value ?? f.predicted ?? f.forecast;
          const ciLow = f.ci_low ?? f.confidence_low ?? f.lower;
          const ciHigh = f.ci_high ?? f.confidence_high ?? f.upper;

          let colorClass = styles.neutral;
          if (current != null && predicted != null) {
            colorClass = predicted > current
              ? styles.positive
              : predicted < current
                ? styles.negative
                : styles.neutral;
          }

          return (
            <tr key={f.metric || f.name || idx}>
              <td className={`${styles.forecastTd} ${styles.forecastMetricName}`}>
                {f.metric || f.name || f.label || `Metric ${idx + 1}`}
              </td>
              <td className={styles.forecastTd}>{formatNumber(current)}</td>
              <td className={`${styles.forecastTd} ${colorClass}`}>
                {formatNumber(predicted)}
              </td>
              <td className={styles.forecastTd}>{formatNumber(ciLow)}</td>
              <td className={styles.forecastTd}>{formatNumber(ciHigh)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ScenarioDetail({ scenarioId }) {
  const { data: scenario, isLoading, isError, error } = useScenario(scenarioId);

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

  const forecasts = scenario.results || scenario.forecasts || scenario.entities || [];

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
        {scenario.type && (
          <span className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>Type</span>
            {scenario.type}
          </span>
        )}
      </div>

      {scenario.description && (
        <p className={styles.detailDesc}>{scenario.description}</p>
      )}

      <div className={styles.forecastSection}>
        <h3 className={styles.forecastHeading}>Entity Forecasts</h3>
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
                Scenarios are Monte Carlo simulations that model "what-if" outcomes for the Nevada ecosystem
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
