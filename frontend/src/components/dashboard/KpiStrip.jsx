import { useMemo } from 'react';
import { KpiCard } from './KpiCard';
import styles from './KpiStrip.module.css';

const TOOLTIPS = {
  capitalDeployed:
    'Sum of deployed capital across all 8 ecosystem funds — BBV, FundNV, 1864 Fund, AngelNV, Sierra Angels, DCVC, Stripes, and StartUpNV. Includes both SSBCI-backed and private venture funds active in the Nevada ecosystem.',
  privateLeverage:
    'Weighted average private leverage across the 3 SSBCI-backed funds (BBV, FundNV, 1864), weighted by each fund\'s deployed amount. Measures how many private dollars each SSBCI dollar mobilized — the core metric Treasury uses to evaluate program effectiveness.',
  ecosystemCapacity:
    'Total headcount across all tracked portfolio companies. Serves as a proxy for the ecosystem\'s absorptive capacity and direct economic footprint. Filters apply — if you\'ve narrowed by stage or sector, this reflects that subset.',
  innovationIndex:
    'Composite index: 40% average momentum score across companies + 30% share of companies with momentum ≥75 (top performers) + 30% share of companies in sectors with heat score ≥80 (hot sectors). Designed to capture both breadth and depth of ecosystem momentum.',
};

export function KpiStrip({ kpis, funds = [], activeSortBy, onSortChange }) {
  if (!kpis) return null;

  // Synthetic sparkline data (memoized to prevent child re-renders)
  const sparkCapital = useMemo(() => [12, 18, 22, 28, 35, 40, kpis.capitalDeployed.value], [kpis.capitalDeployed.value]);
  const sparkLeverage = useMemo(() => [2, 3.5, 4, 5, 6, kpis.privateLeverage.value], [kpis.privateLeverage.value]);
  const sparkCapacity = useMemo(() => [800, 1200, 1600, 2000, kpis.ecosystemCapacity.value], [kpis.ecosystemCapacity.value]);
  const sparkMomentum = useMemo(() => [40, 50, 55, 60, kpis.innovationIndex.value], [kpis.innovationIndex.value]);

  return (
    <div className={styles.strip}>
      <KpiCard
        label={kpis.capitalDeployed.label}
        value={kpis.capitalDeployed.value}
        prefix="$"
        suffix="M"
        decimals={1}
        secondary={kpis.capitalDeployed.secondary}
        sparkData={sparkCapital}
        active={activeSortBy === 'funding'}
        onClick={() => onSortChange('funding')}
        tooltip={TOOLTIPS.capitalDeployed}
      />
      <KpiCard
        label={kpis.privateLeverage.label}
        value={kpis.privateLeverage.value}
        suffix="x"
        decimals={1}
        secondary={kpis.privateLeverage.secondary}
        sparkData={sparkLeverage}
        sparkColor="var(--accent-gold)"
        active={activeSortBy === 'leverage'}
        onClick={() => onSortChange('irs')}
        tooltip={TOOLTIPS.privateLeverage}
      />
      <KpiCard
        label={kpis.ecosystemCapacity.label}
        value={kpis.ecosystemCapacity.value}
        secondary={kpis.ecosystemCapacity.secondary}
        sparkData={sparkCapacity}
        active={activeSortBy === 'employees'}
        onClick={() => onSortChange('momentum')}
        tooltip={TOOLTIPS.ecosystemCapacity}
      />
      <KpiCard
        label={kpis.innovationIndex.label}
        value={kpis.innovationIndex.value}
        secondary={kpis.innovationIndex.secondary}
        sparkData={sparkMomentum}
        sparkColor="var(--status-success)"
        active={activeSortBy === 'momentum'}
        onClick={() => onSortChange('irs')}
        tooltip={TOOLTIPS.innovationIndex}
      />
    </div>
  );
}
