import { useMemo } from 'react';
import { useRiskAssessments } from '../../api/hooks';
import styles from './RiskAlerts.module.css';

const SEVERITY_MAP = {
  critical: { icon: '!', color: 'var(--status-risk)' },
  high: { icon: '!', color: 'var(--status-risk)' },
  medium: { icon: '\u25B3', color: 'var(--status-warning)' },
  low: { icon: '\u25CB', color: 'var(--text-secondary)' },
};

function deriveAlerts(companies, funds = []) {
  const alerts = [];

  const ssbci = funds.filter((f) => f.type === 'SSBCI');
  const totalAllocated = ssbci.reduce((s, f) => s + (f.allocated || 0), 0);
  const totalDeployed = ssbci.reduce((s, f) => s + (f.deployed || 0), 0);
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

  const stalled = companies.filter(
    (c) => (c.funding || 0) >= 10 && (c.momentum || 0) < 30
  );
  if (stalled.length >= 3) {
    alerts.push({
      severity: 'warning',
      icon: '\u25B3',
      label: 'Portfolio Stall Risk',
      detail: `${stalled.length} funded companies showing low momentum (<30). Review: ${stalled.slice(0, 2).map((c) => c.name).join(', ')}.`,
      color: 'var(--status-warning)',
    });
  }

  const sectorCounts = {};
  companies.forEach((c) => {
    const sectors = Array.isArray(c.sector) ? c.sector : [c.sector].filter(Boolean);
    sectors.forEach((s) => {
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });
  });
  const topSector = Object.entries(sectorCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topSector && topSector[1] / companies.length > 0.25) {
    alerts.push({
      severity: 'warning',
      icon: '\u25C9',
      label: 'Concentration Risk',
      detail: `${topSector[0]} represents ${Math.round((topSector[1] / companies.length) * 100)}% of tracked companies.`,
      color: 'var(--status-warning)',
    });
  }

  return alerts.slice(0, 3);
}

function aiRisksToAlerts(risks) {
  if (!risks || !Array.isArray(risks) || risks.length === 0) return null;
  return risks.slice(0, 3).map((r) => {
    const sev = SEVERITY_MAP[r.severity] || SEVERITY_MAP.medium;
    return {
      severity: r.severity,
      icon: sev.icon,
      label: r.title || r.category,
      detail: r.description,
      color: sev.color,
    };
  });
}

export function RiskAlerts({ companies, funds = [] }) {
  const { data: aiRisks } = useRiskAssessments();

  const aiAlerts = useMemo(() => aiRisksToAlerts(aiRisks), [aiRisks]);
  const fallbackAlerts = useMemo(
    () => deriveAlerts(companies, funds),
    [companies, funds]
  );

  const alerts = aiAlerts || fallbackAlerts;
  const isAI = !!aiAlerts;

  if (alerts.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        Risk Alerts
        {isAI && <span className={styles.aiBadge}>AI</span>}
      </div>
      <div className={styles.list}>
        {alerts.map((a, i) => (
          <div
            key={`alert-${a.severity}-${(a.label || '').slice(0, 20).replace(/\s/g, '-')}`}
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
