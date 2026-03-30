import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  fmtPct,
  fmtNumber,
  HorizontalBar,
  StatRow,
  TrendBadge,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function EcosystemCapacityDetail({ companies }) {
  const totalEmployees = useMemo(
    () => companies.reduce((s, c) => s + (c.employees || 0), 0),
    [companies]
  );

  const topEmployers = useMemo(() => {
    return [...companies]
      .filter((c) => (c.employees || 0) > 0)
      .sort((a, b) => (b.employees || 0) - (a.employees || 0))
      .slice(0, 5);
  }, [companies]);

  const maxEmployees = useMemo(
    () => (topEmployers.length > 0 ? topEmployers[0].employees : 1),
    [topEmployers]
  );

  const hiringSignals = useMemo(() => {
    return [...companies]
      .filter((c) => (c.momentum || 0) >= 70 && (c.employees || 0) > 0)
      .sort((a, b) => (b.momentum || 0) - (a.momentum || 0))
      .slice(0, 5);
  }, [companies]);

  const sectorDistribution = useMemo(() => {
    const map = {};
    companies.forEach((c) => {
      (c.sector || []).forEach((s) => {
        if (!map[s]) map[s] = 0;
        map[s] += c.employees || 0;
      });
    });
    return Object.entries(map)
      .map(([sector, employees]) => ({ sector, employees }))
      .sort((a, b) => b.employees - a.employees)
      .slice(0, 6);
  }, [companies]);

  const maxSectorEmployees = useMemo(
    () => (sectorDistribution.length > 0 ? sectorDistribution[0].employees : 1),
    [sectorDistribution]
  );

  const companiesWithEmployees = companies.filter((c) => (c.employees || 0) > 0).length;
  const verificationRate = companies.length > 0 ? (companiesWithEmployees / companies.length) * 100 : 0;

  // Estimate jobs created (companies that received funding and have employees)
  const fundedWithEmployees = companies.filter((c) => (c.funding || 0) > 0 && (c.employees || 0) > 0);
  const jobsInFundedCos = fundedWithEmployees.reduce((s, c) => s + (c.employees || 0), 0);

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Nevada's tracked innovation ecosystem employs an estimated ${fmtNumber(totalEmployees)} workers across ${companies.length} companies. ${fundedWithEmployees.length} companies with ecosystem fund backing account for ${fmtNumber(jobsInFundedCos)} direct jobs — a key metric for GOED legislative reporting. ${verificationRate >= 70 ? 'Employee data is well-verified across the cohort.' : `Note: only ${fmtPct(verificationRate)} of companies have verified headcount — remaining are estimated from funding stage and industry benchmarks.`}`}
        status={{ key: verificationRate >= 70 ? 'on-track' : 'caution', label: verificationRate >= 70 ? 'Data Verified' : 'Partial Estimates' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Largest Employers</div>
      <div className={styles.barChart}>
        {topEmployers.map((c) => (
          <HorizontalBar
            key={c.id}
            label={c.name}
            value={c.employees}
            maxValue={maxEmployees}
            suffix=""
            color="var(--accent-teal)"
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>High-Momentum Hiring Signals</div>
      <div className={styles.miniTable}>
        {hiringSignals.length > 0 ? hiringSignals.map((c) => (
          <div key={c.id} className={styles.miniRow}>
            <span className={styles.miniName}>{c.name}</span>
            <span className={styles.miniValue}>{c.employees} emp</span>
            <span className={styles.miniMeta}>
              <TrendBadge direction="up" label={`${c.momentum} momentum`} />
            </span>
          </div>
        )) : (
          <div className={styles.miniRow}>
            <span className={styles.miniMeta}>No high-momentum hiring signals detected</span>
          </div>
        )}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Employment by Sector</div>
      <div className={styles.barChart}>
        {sectorDistribution.map((s) => (
          <HorizontalBar
            key={s.sector}
            label={s.sector}
            value={s.employees}
            maxValue={maxSectorEmployees}
            suffix=""
            color="var(--accent-gold)"
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        {verificationRate < 70 && (
          <ActionItem
            icon={'\u26A0'}
            text={`Only ${fmtPct(verificationRate)} verification rate — request updated headcount from unverified companies for accurate legislative reporting`}
            priority="high"
          />
        )}
        <ActionItem
          icon={'\u2192'}
          text={`${fundedWithEmployees.length} fund-backed companies employ ${fmtNumber(jobsInFundedCos)} workers — use for SSBCI economic impact narrative`}
          priority="medium"
        />
        <ActionItem
          icon={'\u2139'}
          text={`Top sector by employment: ${sectorDistribution[0]?.sector || 'N/A'} (${fmtNumber(sectorDistribution[0]?.employees || 0)} workers)`}
          priority="info"
        />
      </div>
    </div>
  );
}
