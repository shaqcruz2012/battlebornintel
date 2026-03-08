import { useState, useMemo } from 'react';
import { useFunds, useCompanies } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { FundCard } from './FundCard';
import styles from './FundsView.module.css';

const SORT_OPTIONS = [
  { key: 'deployed', label: 'Deployed' },
  { key: 'companies', label: 'Companies' },
  { key: 'name', label: 'Name' },
];

function formatCurrencyShort(value) {
  if (value == null || value === 0) return '$0';
  if (value >= 1) return `$${value.toFixed(1)}M`;
  return `$${(value * 1000).toFixed(0)}K`;
}

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.loadingWrapper}>
        <div className={styles.skeletonKpi}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonKpiCell}`} />
          ))}
        </div>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      </div>
    </MainGrid>
  );
}

export function FundsView() {
  const { data: funds = [], isLoading: loadingFunds } = useFunds();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();

  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('deployed');

  // Build portfolio map: fund.id -> [company, ...]
  const portfolioMap = useMemo(() => {
    const map = {};
    for (const fund of funds) {
      map[fund.id] = [];
    }
    for (const company of companies) {
      const eligible = company.eligible || [];
      for (const fundId of eligible) {
        if (map[fundId]) {
          map[fundId] = [...map[fundId], company];
        }
      }
    }
    return map;
  }, [funds, companies]);

  // Aggregate KPIs across all funds
  const aggregates = useMemo(() => {
    const totalAllocated = funds.reduce((sum, f) => sum + (f.allocated || 0), 0);
    const totalDeployed = funds.reduce((sum, f) => sum + (f.deployed || 0), 0);
    const totalCompanies = funds.reduce((sum, f) => sum + (f.companies || 0), 0);

    const fundsWithLeverage = funds.filter((f) => f.leverage != null && f.deployed > 0);
    const weightedLeverage = fundsWithLeverage.reduce(
      (sum, f) => sum + f.deployed * f.leverage,
      0,
    );
    const totalLeverageWeight = fundsWithLeverage.reduce(
      (sum, f) => sum + f.deployed,
      0,
    );
    const avgLeverage = totalLeverageWeight > 0
      ? weightedLeverage / totalLeverageWeight
      : 0;

    return { totalAllocated, totalDeployed, avgLeverage, totalCompanies };
  }, [funds]);

  // Sort funds
  const sortedFunds = useMemo(() => {
    const sorted = [...funds];
    switch (sortBy) {
      case 'deployed':
        sorted.sort((a, b) => (b.deployed || 0) - (a.deployed || 0));
        break;
      case 'companies':
        sorted.sort((a, b) => (b.companies || 0) - (a.companies || 0));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [funds, sortBy]);

  const handleToggle = (fundId) => {
    setExpandedId((prev) => (prev === fundId ? null : fundId));
  };

  if (loadingFunds || loadingCompanies) {
    return <LoadingSkeleton />;
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* KPI Strip */}
        <div className={styles.kpiStrip}>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {formatCurrencyShort(aggregates.totalAllocated)}
            </span>
            <span className={styles.kpiLabel}>Total Allocated</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {formatCurrencyShort(aggregates.totalDeployed)}
            </span>
            <span className={styles.kpiLabel}>Total Deployed</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {aggregates.avgLeverage.toFixed(1)}x
            </span>
            <span className={styles.kpiLabel}>Avg Leverage</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {aggregates.totalCompanies}
            </span>
            <span className={styles.kpiLabel}>Total Companies</span>
          </div>
        </div>

        {/* Sort controls */}
        <div className={styles.controls}>
          <span className={styles.controlsLabel}>Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.sortBtn} ${sortBy === opt.key ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Fund cards grid */}
        <div className={styles.fundsGrid}>
          {sortedFunds.map((fund) => (
            <FundCard
              key={fund.id}
              fund={fund}
              portfolio={portfolioMap[fund.id] || []}
              isExpanded={expandedId === fund.id}
              onToggle={() => handleToggle(fund.id)}
            />
          ))}
        </div>
      </div>
    </MainGrid>
  );
}
