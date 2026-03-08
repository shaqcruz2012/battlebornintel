import { useMemo } from 'react';
import { KpiCard } from './KpiCard';
import styles from './KpiStrip.module.css';

const TOOLTIPS = {
  capitalDeployed:
    'Sum of deployed capital across all 8 ecosystem funds — BBV, FundNV, 1864 Fund, AngelNV, Sierra Angels, DCVC, Stripes, and StartUpNV. Includes both SSBCI-backed and private venture funds active in the Nevada ecosystem.',
  ssbciCapitalDeployed:
    'Sum of deployed capital specifically from the 3 SSBCI-backed funds (BBV, FundNV, 1864 Fund). Represents the total Small Business Subcontractor Capital Initiative capital deployed into the ecosystem.',
  privateLeverage:
    'Weighted average private leverage across the 3 SSBCI-backed funds (BBV, FundNV, 1864), weighted by each fund\'s deployed amount. Measures how many private dollars each SSBCI dollar mobilized — the core metric Treasury uses to evaluate program effectiveness.',
  ecosystemCapacity:
    'Total headcount across all tracked portfolio companies. Serves as a proxy for the ecosystem\'s absorptive capacity and direct economic footprint. Filters apply — if you\'ve narrowed by stage or sector, this reflects that subset.',
  innovationIndex:
    'Composite index: 40% average momentum score across companies + 30% share of companies with momentum ≥75 (top performers) + 30% share of companies in sectors with heat score ≥80 (hot sectors). Designed to capture both breadth and depth of ecosystem momentum.',
};

export function KpiStrip({ kpis, activeSortBy, onSortChange }) {
  // Synthetic sparkline data (memoized to prevent child re-renders)
  const sparkCapital = useMemo(() => [12, 18, 22, 28, 35, 40, kpis?.capitalDeployed?.value || 0], [kpis?.capitalDeployed?.value]);
  const sparkSsbciCapital = useMemo(() => [8, 12, 15, 18, 22, kpis?.ssbciCapitalDeployed?.value || 0], [kpis?.ssbciCapitalDeployed?.value]);
  const sparkLeverage = useMemo(() => [2, 3.5, 4, 5, 6, kpis?.privateLeverage?.value || 0], [kpis?.privateLeverage?.value]);
  const sparkCapacity = useMemo(() => [800, 1200, 1600, 2000, kpis?.ecosystemCapacity?.value || 0], [kpis?.ecosystemCapacity?.value]);
  const sparkMomentum = useMemo(() => [40, 50, 55, 60, kpis?.innovationIndex?.value || 0], [kpis?.innovationIndex?.value]);

  if (!kpis) return null;

  return (
    <div className={styles.strip}>
      <KpiCard
        label={kpis.capitalDeployed?.label || 'Capital Deployed'}
        value={kpis.capitalDeployed?.value || 0}
        prefix="$"
        suffix="M"
        decimals={1}
        secondary={kpis.capitalDeployed?.secondary || ''}
        sparkData={sparkCapital}
        active={activeSortBy === 'funding'}
        onClick={() => onSortChange('funding')}
        tooltip={TOOLTIPS.capitalDeployed}
        quality={kpis.capitalDeployed?.quality}
        dataQualityNote={kpis.capitalDeployed?.dataQualityNote}
      />
      <KpiCard
        label={kpis.ssbciCapitalDeployed?.label || 'SSBCI Capital Deployed'}
        value={kpis.ssbciCapitalDeployed?.value || 0}
        prefix="$"
        suffix="M"
        decimals={1}
        secondary={kpis.ssbciCapitalDeployed?.secondary || ''}
        sparkData={sparkSsbciCapital}
        sparkColor="var(--accent-blue)"
        active={activeSortBy === 'ssbci'}
        onClick={() => onSortChange('ssbci')}
        tooltip={TOOLTIPS.ssbciCapitalDeployed}
        quality={kpis.ssbciCapitalDeployed?.quality}
        dataQualityNote={kpis.ssbciCapitalDeployed?.dataQualityNote}
      />
      <KpiCard
        label={kpis.privateLeverage?.label || 'Private Leverage'}
        value={kpis.privateLeverage?.value || 0}
        suffix="x"
        decimals={1}
        secondary={kpis.privateLeverage?.secondary || ''}
        sparkData={sparkLeverage}
        sparkColor="var(--accent-gold)"
        active={activeSortBy === 'leverage'}
        onClick={() => onSortChange('irs')}
        tooltip={TOOLTIPS.privateLeverage}
        quality={kpis.privateLeverage?.quality}
        dataQualityNote={kpis.privateLeverage?.dataQualityNote}
      />
      <KpiCard
        label={kpis.ecosystemCapacity?.label || 'Ecosystem Capacity'}
        value={kpis.ecosystemCapacity?.value || 0}
        secondary={kpis.ecosystemCapacity?.secondary || ''}
        sparkData={sparkCapacity}
        active={activeSortBy === 'employees'}
        onClick={() => onSortChange('momentum')}
        tooltip={TOOLTIPS.ecosystemCapacity}
        quality={kpis.ecosystemCapacity?.quality}
        dataQualityNote={kpis.ecosystemCapacity?.dataQualityNote}
      />
      <KpiCard
        label={kpis.innovationIndex?.label || 'Innovation Momentum'}
        value={kpis.innovationIndex?.value || 0}
        secondary={kpis.innovationIndex?.secondary || ''}
        sparkData={sparkMomentum}
        sparkColor="var(--status-success)"
        active={activeSortBy === 'momentum'}
        onClick={() => onSortChange('irs')}
        tooltip={TOOLTIPS.innovationIndex}
        quality={kpis.innovationIndex?.quality}
        dataQualityNote={kpis.innovationIndex?.dataQualityNote}
      />
    </div>
  );
}
