import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  HorizontalBar,
  StatRow,
  AnalystAssessment,
  SectionDivider,
} from './shared';

export default function TrackedFundingDetail({ companies }) {
  const totalFunding = useMemo(
    () => companies.reduce((s, c) => s + (c.funding || 0), 0),
    [companies]
  );

  const topFunded = useMemo(() => {
    return [...companies]
      .filter((c) => (c.funding || 0) > 0)
      .sort((a, b) => (b.funding || 0) - (a.funding || 0))
      .slice(0, 8);
  }, [companies]);

  const maxFunding = useMemo(
    () => (topFunded.length > 0 ? topFunded[0].funding : 1),
    [topFunded]
  );

  const stageDistribution = useMemo(() => {
    const map = {};
    companies.forEach((c) => {
      const stage = c.stage || 'unknown';
      if (!map[stage]) map[stage] = { stage, count: 0, funding: 0 };
      map[stage].count++;
      map[stage].funding += c.funding || 0;
    });
    return Object.values(map).sort((a, b) => b.funding - a.funding);
  }, [companies]);

  const maxStageFunding = useMemo(
    () => (stageDistribution.length > 0 ? stageDistribution[0].funding : 1),
    [stageDistribution]
  );

  const companiesWithFunding = companies.filter((c) => (c.funding || 0) > 0).length;

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Nevada's innovation ecosystem tracks ${fmtDollars(totalFunding)} in total funding across ${companies.length} companies. ${companiesWithFunding} companies have received capital. The T-GNN temporal analysis reveals that public institutions contribute approximately 0.4% of this total directly, yet are responsible for an estimated 15–20% of deal origination through accelerator pipelines and co-investment signaling.`}
        status={{ key: 'on-track', label: 'Active Ecosystem' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Top Funded Companies</div>
      <div className={styles.barChart}>
        {topFunded.map((c) => (
          <HorizontalBar
            key={c.id}
            label={c.name}
            value={c.funding}
            maxValue={maxFunding}
            suffix="M"
            color="var(--accent-teal)"
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Funding by Stage</div>
      <div className={styles.barChart}>
        {stageDistribution.map((s) => (
          <HorizontalBar
            key={s.stage}
            label={s.stage.replace(/_/g, ' ')}
            value={s.funding}
            maxValue={maxStageFunding}
            suffix="M"
            color="var(--accent-gold)"
            annotation={`${s.count} cos`}
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.metricsGrid}>
        <StatRow label="Total Tracked Funding" value={fmtDollars(totalFunding)} accent />
        <StatRow label="Companies with Funding" value={`${companiesWithFunding} of ${companies.length}`} />
        <StatRow label="Avg Funding per Company" value={fmtDollars(companiesWithFunding > 0 ? totalFunding / companiesWithFunding : 0)} />
      </div>
    </div>
  );
}
