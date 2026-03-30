import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  HorizontalBar,
  StatRow,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function CapitalDeployedDetail({ funds, companies }) {
  const totalDeployed = useMemo(
    () => funds.reduce((s, f) => s + (f.deployed || 0), 0),
    [funds]
  );

  const totalAllocated = useMemo(
    () => funds.reduce((s, f) => s + (f.allocated || 0), 0),
    [funds]
  );

  const deployRate = totalAllocated > 0 ? (totalDeployed / totalAllocated) * 100 : 0;

  const fundBreakdown = useMemo(() => {
    const sorted = [...funds]
      .filter((f) => (f.deployed || 0) > 0)
      .sort((a, b) => (b.deployed || 0) - (a.deployed || 0));
    return sorted.map((f) => ({
      name: f.name,
      deployed: f.deployed || 0,
      allocated: f.allocated || 0,
      type: f.type || 'Private',
      pct: totalDeployed > 0 ? ((f.deployed || 0) / totalDeployed) * 100 : 0,
    }));
  }, [funds, totalDeployed]);

  const maxDeployed = useMemo(
    () => Math.max(...fundBreakdown.map((f) => f.deployed), 1),
    [fundBreakdown]
  );

  const ssbciCount = funds.filter((f) => f.type === 'SSBCI').length;
  const privateCount = funds.filter((f) => f.type !== 'SSBCI').length;

  const topDeployments = useMemo(() => {
    return [...companies]
      .filter((c) => (c.funding || 0) > 0)
      .sort((a, b) => (b.funding || 0) - (a.funding || 0))
      .slice(0, 5);
  }, [companies]);

  const status = deployRate >= 60 ? 'on-track' : deployRate >= 40 ? 'caution' : 'at-risk';

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Nevada's ecosystem has deployed ${fmtDollars(totalDeployed)} across ${funds.length} active funds (${ssbciCount} SSBCI-backed, ${privateCount} private venture). Deployment velocity is ${deployRate >= 60 ? 'on pace for annual targets' : deployRate >= 40 ? 'tracking below optimal pace — monitor for acceleration in Q2' : 'significantly below target — recommend GOED intervention'}. Capital absorption across ${companies.length} tracked companies indicates ${totalDeployed >= 100 ? 'strong' : 'developing'} ecosystem demand.`}
        status={{ key: status, label: status === 'on-track' ? 'On Track' : status === 'caution' ? 'Monitor' : 'Action Needed' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Fund Deployment Matrix</div>
      <div className={styles.barChart}>
        {fundBreakdown.map((f) => (
          <HorizontalBar
            key={f.name}
            label={f.name}
            value={f.deployed}
            maxValue={maxDeployed}
            suffix="M"
            color={f.type === 'SSBCI' ? 'var(--accent-blue)' : 'var(--accent-teal)'}
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Top Capital Recipients</div>
      <div className={styles.miniTable}>
        {topDeployments.map((c, i) => (
          <div key={c.id || i} className={styles.miniRow}>
            <span className={styles.miniRank}>{i + 1}</span>
            <span className={styles.miniName}>{c.name}</span>
            <span className={styles.miniValue}>{fmtDollars(c.funding)}</span>
            <span className={styles.miniMeta}>
              {c.stage ? c.stage.replace(/_/g, ' ') : '--'}
            </span>
          </div>
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        {deployRate < 50 && (
          <ActionItem
            icon={'\u26A0'}
            text="Deployment pace below 50% — schedule fund manager check-in to assess pipeline velocity"
            priority="high"
          />
        )}
        <ActionItem
          icon={'\u2192'}
          text={`${topDeployments.length > 0 ? topDeployments[0].name : 'Lead company'} represents ${totalDeployed > 0 ? Math.round(((topDeployments[0]?.funding || 0) / totalDeployed) * 100) : 0}% of total deployment — monitor for concentration risk`}
          priority="medium"
        />
        <ActionItem
          icon={'\u2139'}
          text={`${companies.length} companies actively tracked across ecosystem — ${companies.filter((c) => (c.funding || 0) > 0).length} have received capital`}
          priority="info"
        />
      </div>
    </div>
  );
}
