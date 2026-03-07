import { useMemo } from 'react';
import { computeKPIs } from '../../engine/kpi';
import { fmt } from '../../engine/formatters';
import { KpiCard } from './KpiCard';
import styles from './KpiStrip.module.css';

export function KpiStrip({ companies, funds, activeSortBy, onSortChange }) {
  const kpis = useMemo(() => computeKPIs(companies, funds), [companies, funds]);

  // Synthetic sparkline data (trending representation)
  const sparkCapital = [12, 18, 22, 28, 35, 40, kpis.capitalDeployed.value];
  const sparkLeverage = [2, 3.5, 4, 5, 6, kpis.privateLeverage.value];
  const sparkCapacity = [800, 1200, 1600, 2000, kpis.ecosystemCapacity.value];
  const sparkMomentum = [40, 50, 55, 60, kpis.innovationIndex.value];

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
      />
      <KpiCard
        label={kpis.ecosystemCapacity.label}
        value={kpis.ecosystemCapacity.value}
        secondary={kpis.ecosystemCapacity.secondary}
        sparkData={sparkCapacity}
        active={activeSortBy === 'employees'}
        onClick={() => onSortChange('momentum')}
      />
      <KpiCard
        label={kpis.innovationIndex.label}
        value={kpis.innovationIndex.value}
        secondary={kpis.innovationIndex.secondary}
        sparkData={sparkMomentum}
        sparkColor="var(--status-success)"
        active={activeSortBy === 'momentum'}
        onClick={() => onSortChange('irs')}
      />
    </div>
  );
}
