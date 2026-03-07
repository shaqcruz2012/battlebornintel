import { KpiCard } from '../dashboard/KpiCard';
import styles from './SsbciKpiStrip.module.css';

export function SsbciKpiStrip({ funds }) {
  const ssbci = funds.filter((f) => f.type === 'SSBCI');
  const totalAllocated = ssbci.reduce((s, f) => s + (f.allocated || 0), 0);
  const totalDeployed = ssbci.reduce((s, f) => s + (f.deployed || 0), 0);
  const deploymentRate =
    totalAllocated > 0 ? (totalDeployed / totalAllocated) * 100 : 0;
  const totalCompanies = ssbci.reduce((s, f) => s + (f.companies || 0), 0);

  const weightedLev = ssbci.reduce(
    (s, f) => s + (f.deployed || 0) * (f.leverage || 0),
    0
  );
  const avgLeverage = totalDeployed > 0 ? weightedLev / totalDeployed : 0;

  const sparkDeploy = [2, 5, 8, 11, totalDeployed];
  const sparkLev = [1.5, 2, 2.5, 3, avgLeverage];

  return (
    <div className={styles.strip}>
      <KpiCard
        label="SSBCI Allocated"
        value={totalAllocated}
        prefix="$"
        suffix="M"
        decimals={0}
        secondary={`${ssbci.length} SSBCI funds`}
      />
      <KpiCard
        label="SSBCI Deployed"
        value={totalDeployed}
        prefix="$"
        suffix="M"
        decimals={1}
        secondary={`${Math.round(deploymentRate)}% deployment rate`}
        sparkData={sparkDeploy}
        sparkColor={deploymentRate < 50 ? 'var(--status-risk)' : 'var(--accent-teal)'}
      />
      <KpiCard
        label="Private Leverage"
        value={avgLeverage}
        suffix="x"
        decimals={1}
        secondary="Weighted average"
        sparkData={sparkLev}
        sparkColor="var(--accent-gold)"
      />
      <KpiCard
        label="Portfolio Cos"
        value={totalCompanies}
        secondary="SSBCI-backed startups"
      />
    </div>
  );
}
