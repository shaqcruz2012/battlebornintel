import styles from '../KpiDetailPanel.module.css';
import {
  fmtPct,
  StatRow,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function DealOriginationDetail({ kpi }) {
  const originatedDeals = kpi?.components?.originatedDeals?.value ?? 0;
  const totalFunded = kpi?.components?.totalFundedCompanies?.value ?? 0;
  const rate = kpi?.value || 0;

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`${originatedDeals} of ${totalFunded} funded companies (${rate.toFixed(0)}%) had prior connections to accelerators or ecosystem organizations before receiving institutional capital. This validates the critical role of public institutions as deal originators — they identify, accelerate, and de-risk startups that subsequently attract private investment through co-investment signaling.`}
        status={{ key: rate >= 15 ? 'exceeding' : rate >= 10 ? 'on-track' : 'caution', label: rate >= 15 ? 'Strong Pipeline' : rate >= 10 ? 'Active Pipeline' : 'Needs Growth' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Pipeline Metrics</div>
      <div className={styles.metricsGrid}>
        <StatRow label="Companies via Public Pipeline" value={originatedDeals.toString()} accent />
        <StatRow label="Total Funded Companies" value={totalFunded.toString()} />
        <StatRow label="Origination Rate" value={`${rate.toFixed(1)}%`} accent status={rate >= 15 ? 'on-track' : 'caution'} />
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Methodology</div>
      <div className={styles.actionList}>
        <ActionItem
          icon={'\u25C8'}
          text="Graph multi-hop traversal: accelerator/ecosystem_org → company → fund invested_in edges"
          priority="info"
        />
        <ActionItem
          icon={'\u25B3'}
          text="Includes accelerated_by, supports, grants_to, funded, won_pitch relationship types"
          priority="info"
        />
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        <ActionItem
          icon={'\u2192'}
          text="Strengthen accelerator → investor handoff processes to increase origination rate"
          priority="medium"
        />
        <ActionItem
          icon={'\u2192'}
          text="Track deal attribution more granularly — add lead_source metadata to investment edges"
          priority="medium"
        />
        <ActionItem
          icon={'\u2139'}
          text={`Current rate of ${rate.toFixed(0)}% aligns with T-GNN report estimate of 15–20% deal origination`}
          priority="info"
        />
      </div>
    </div>
  );
}
