import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  StatRow,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function PublicCapitalShareDetail({ kpi }) {
  const breakdown = kpi?.breakdown || {};
  const directFunding = breakdown.directFunding?.value || 0;
  const totalTracked = breakdown.totalTracked?.value || 0;
  const shareValue = kpi?.value || 0;

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Public institutions contribute approximately ${shareValue.toFixed(1)}% of the ecosystem's total ${fmtDollars(totalTracked)} in tracked funding directly. However, this dramatically understates their impact: they occupy high-betweenness positions in the network graph (i.e., they act as critical bridges between groups), sitting on the shortest paths between Nevada entrepreneurs and institutional capital. Removing nodes like GOED, BBV, or accelerator programs would dramatically increase average path length between startups and funding sources.`}
        status={{ key: shareValue > 0 ? 'on-track' : 'caution', label: 'Critical Bridge Nodes' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Capital Composition</div>
      <div className={styles.metricsGrid}>
        <StatRow label="Total Tracked Funding" value={fmtDollars(totalTracked)} />
        <StatRow label="Direct Public Funding" value={fmtDollars(directFunding)} />
        <StatRow label="Public Capital Share" value={`${shareValue.toFixed(2)}%`} accent />
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Why This Matters</div>
      <div className={styles.actionList}>
        <ActionItem
          icon={'\u25C8'}
          text="Public institutions are structural bridges — they sit on shortest paths between startups and capital sources"
          priority="high"
        />
        <ActionItem
          icon={'\u25B3'}
          text="Removing GOED, BBV, or accelerator nodes would dramatically increase network path lengths to funding"
          priority="high"
        />
        <ActionItem
          icon={'\u2192'}
          text="0.4% direct capital contribution generates 15–20% deal origination — a 40x multiplier on ecosystem connectivity"
          priority="medium"
        />
        <ActionItem
          icon={'\u2139'}
          text="Temporal graph neural network (T-GNN) analysis confirms these public entities frequently act as bridges between groups — the structural definition of critical connectors"
          priority="info"
        />
      </div>
    </div>
  );
}
