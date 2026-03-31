import { useState } from 'react';
import { useIndicatorsSummary, useIndicatorHistory } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import styles from './IndicatorsView.module.css';

function formatValue(val) {
  if (val == null) return '--';
  if (typeof val === 'number') {
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return String(val);
}

function formatPctChange(pct) {
  if (pct == null) return '--';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function trendArrow(pct) {
  if (pct == null || pct === 0) return '';
  return pct > 0 ? '\u25B2' : '\u25BC';
}

function changeClass(pct) {
  if (pct == null || pct === 0) return styles.neutral;
  return pct > 0 ? styles.positive : styles.negative;
}

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.loadingWrapper}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonCell}`} />
          ))}
        </div>
        <div className={`skeleton ${styles.skeletonPanel}`} />
      </div>
    </MainGrid>
  );
}

function HistoryPanel({ metric }) {
  const { data: history, isLoading, isError, error } = useIndicatorHistory(metric);

  if (isLoading) {
    return (
      <div className={styles.historyPanel}>
        <div className={styles.emptyState}>Loading history...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.historyPanel}>
        <div className={styles.emptyState}>
          Error loading history: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  const records = Array.isArray(history)
    ? history
    : history?.data || history?.history || [];

  if (records.length === 0) {
    return (
      <div className={styles.historyPanel}>
        <h2 className={styles.historyTitle}>{metric}</h2>
        <div className={styles.emptyState}>No history data available</div>
      </div>
    );
  }

  return (
    <div className={styles.historyPanel}>
      <h2 className={styles.historyTitle}>{metric}</h2>
      <h3 className={styles.historySubtitle}>Historical Values</h3>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th className={styles.historyTh}>Date</th>
            <th className={styles.historyTh}>Value</th>
            <th className={styles.historyTh}>Change</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => {
            const pct = r.pct_change ?? r.change_pct ?? r.change;
            return (
              <tr key={r.date || r.period || idx}>
                <td className={`${styles.historyTd} ${styles.historyDate}`}>
                  {formatDate(r.date || r.period)}
                </td>
                <td className={styles.historyTd}>{formatValue(r.value)}</td>
                <td className={`${styles.historyTd} ${changeClass(pct)}`}>
                  {formatPctChange(pct)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function IndicatorsView() {
  const { data: summaryData, isLoading, isError, error } = useIndicatorsSummary();
  const [selectedMetric, setSelectedMetric] = useState(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <MainGrid>
        <div className={styles.wrapper}>
          <div className={styles.emptyState}>
            Error loading indicators: {error?.message || 'Unknown error'}
          </div>
        </div>
      </MainGrid>
    );
  }

  const indicators = Array.isArray(summaryData)
    ? summaryData
    : summaryData?.data || summaryData?.indicators || [];

  if (indicators.length === 0) {
    return (
      <MainGrid>
        <div className={styles.wrapper}>
          <div className={styles.emptyState}>No economic indicators available</div>
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* Summary cards */}
        <div className={styles.indicatorGrid}>
          {indicators.map((ind) => {
            const metric = ind.metric || ind.name || ind.indicator;
            const value = ind.latest_value ?? ind.value ?? ind.latest;
            const pct = ind.pct_change ?? ind.change_pct ?? ind.change;
            const isActive = selectedMetric === metric;

            return (
              <div
                key={metric}
                className={`${styles.indicatorCard} ${isActive ? styles.indicatorCardActive : ''}`}
                onClick={() => setSelectedMetric(isActive ? null : metric)}
              >
                <span className={styles.indicatorName}>{metric}</span>
                <div className={styles.indicatorValueRow}>
                  <span className={styles.indicatorValue}>{formatValue(value)}</span>
                  <span className={`${styles.indicatorChange} ${changeClass(pct)}`}>
                    <span className={styles.trendArrow}>{trendArrow(pct)}</span>
                    {formatPctChange(pct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* History detail */}
        {selectedMetric && <HistoryPanel metric={selectedMetric} />}
      </div>
    </MainGrid>
  );
}
