import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  fmtPct,
  StatRow,
  StatusBadge,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function SsbciCapitalDetail({ funds }) {
  const ssbciFunds = useMemo(
    () => funds.filter((f) => f.type === 'SSBCI'),
    [funds]
  );

  const totalAllocated = useMemo(
    () => ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0),
    [ssbciFunds]
  );

  const totalDeployed = useMemo(
    () => ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0),
    [ssbciFunds]
  );

  const deployRate = totalAllocated > 0 ? (totalDeployed / totalAllocated) * 100 : 0;
  const remaining = totalAllocated - totalDeployed;

  const complianceStatus = deployRate >= 50 ? 'on-track' : 'at-risk';

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`SSBCI Tranche II capital stands at ${fmtPct(deployRate)} deployed (${fmtDollars(totalDeployed)} of ${fmtDollars(totalAllocated)} allocated). ${deployRate >= 50 ? 'Deployment pace meets Treasury compliance thresholds for the current reporting period.' : 'Deployment pace is below Treasury expectations — accelerated deployment recommended to avoid federal clawback provisions.'} ${fmtDollars(remaining)} remains available for new investments across ${ssbciFunds.length} certified funds.`}
        status={{ key: complianceStatus, label: complianceStatus === 'on-track' ? 'Treasury Compliant' : 'Compliance Risk' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Fund-Level Compliance Status</div>
      <div className={styles.barChart}>
        {ssbciFunds.map((f) => {
          const rate = f.allocated > 0 ? ((f.deployed || 0) / f.allocated) * 100 : 0;
          return (
            <div key={f.id} className={styles.ssbciFundRow}>
              <div className={styles.ssbciFundHeader}>
                <span className={styles.barLabel}>{f.name}</span>
                <div className={styles.fundHeaderRight}>
                  <StatusBadge
                    status={rate >= 50 ? 'on-track' : rate >= 25 ? 'caution' : 'at-risk'}
                    label={rate >= 50 ? 'Compliant' : rate >= 25 ? 'Monitor' : 'At Risk'}
                  />
                  <span className={styles.barValue}>
                    {fmtDollars(f.deployed)} / {fmtDollars(f.allocated)}
                  </span>
                </div>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.min(rate, 100)}%`,
                    background: rate >= 50 ? 'var(--accent-blue)' : rate >= 25 ? 'var(--accent-gold)' : 'var(--status-risk)',
                  }}
                />
              </div>
              <span className={styles.miniMeta}>{fmtPct(rate)} deployed</span>
            </div>
          );
        })}
      </div>

      <SectionDivider />

      <div className={styles.metricsGrid}>
        <StatRow label="Total Federal Allocation" value={fmtDollars(totalAllocated)} />
        <StatRow label="Capital Deployed" value={fmtDollars(totalDeployed)} status={complianceStatus} />
        <StatRow label="Available for Deployment" value={fmtDollars(remaining)} />
        <StatRow label="Overall Deployment Rate" value={fmtPct(deployRate)} accent status={complianceStatus} />
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        {deployRate < 50 && (
          <ActionItem
            icon={'\u26A0'}
            text={`Only ${fmtPct(deployRate)} of SSBCI allocation deployed — pace may risk federal clawback. Recommend accelerated deployment review with fund managers.`}
            priority="high"
          />
        )}
        {remaining > 0 && (
          <ActionItem
            icon={'\u2192'}
            text={`${fmtDollars(remaining)} available for new investments — identify pipeline-ready companies for Q2 deployment`}
            priority="medium"
          />
        )}
        <ActionItem
          icon={'\u2139'}
          text="Next Treasury reporting deadline: Q2 2026. Ensure all fund managers submit deployment certifications."
          priority="info"
        />
      </div>
    </div>
  );
}
