import { useMemo } from 'react';
import { FUNDS } from '../../data/funds';
import styles from './RiskAlerts.module.css';

function deriveAlerts(companies) {
  const alerts = [];

  // Check SSBCI deployment pace
  const ssbci = FUNDS.filter((f) => f.type === 'SSBCI');
  const totalAllocated = ssbci.reduce((s, f) => s + f.allocated, 0);
  const totalDeployed = ssbci.reduce((s, f) => s + f.deployed, 0);
  const deployPct = totalAllocated > 0 ? (totalDeployed / totalAllocated) * 100 : 0;

  if (deployPct < 50) {
    alerts.push({
      severity: 'risk',
      icon: '!',
      label: 'SSBCI Deployment Risk',
      detail: `Only ${Math.round(deployPct)}% of SSBCI funds deployed. Pace may risk federal clawback.`,
      color: 'var(--status-risk)',
    });
  }

  // Low momentum companies with high funding
  const stalled = companies.filter(
    (c) => (c.funding || 0) >= 10 && (c.momentum || 0) < 30
  );
  if (stalled.length >= 3) {
    alerts.push({
      severity: 'warning',
      icon: '△',
      label: 'Portfolio Stall Risk',
      detail: `${stalled.length} funded companies showing low momentum (<30). Review: ${stalled.slice(0, 2).map((c) => c.name).join(', ')}.`,
      color: 'var(--status-warning)',
    });
  }

  // Sector concentration risk
  const sectorCounts = {};
  companies.forEach((c) =>
    (c.sector || []).forEach((s) => {
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    })
  );
  const topSector = Object.entries(sectorCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topSector && topSector[1] / companies.length > 0.25) {
    alerts.push({
      severity: 'warning',
      icon: '◉',
      label: 'Concentration Risk',
      detail: `${topSector[0]} represents ${Math.round((topSector[1] / companies.length) * 100)}% of tracked companies.`,
      color: 'var(--status-warning)',
    });
  }

  return alerts.slice(0, 3);
}

export function RiskAlerts({ companies }) {
  const alerts = useMemo(() => deriveAlerts(companies), [companies]);

  if (alerts.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Risk Alerts</div>
      <div className={styles.list}>
        {alerts.map((a, i) => (
          <div
            key={i}
            className={styles.alert}
            style={{ borderLeftColor: a.color }}
          >
            <span className={styles.alertIcon} style={{ color: a.color }}>
              {a.icon}
            </span>
            <div className={styles.alertContent}>
              <span className={styles.alertLabel}>{a.label}</span>
              <span className={styles.alertDetail}>{a.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
