import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtPct,
  HorizontalBar,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function InnovationMomentumDetail({ companies, sectorStats }) {
  const avgMomentum = useMemo(() => {
    if (companies.length === 0) return 0;
    return companies.reduce((s, c) => s + (c.momentum || 0), 0) / companies.length;
  }, [companies]);

  const topPerformers = useMemo(() => {
    return companies.filter((c) => (c.momentum || 0) >= 75).length;
  }, [companies]);

  const topPerformerPct = useMemo(() => {
    if (companies.length === 0) return 0;
    return (topPerformers / companies.length) * 100;
  }, [topPerformers, companies.length]);

  const hotSectorCount = useMemo(() => {
    return companies.filter(
      (c) => (c.sector || []).some((s) => {
        const stat = sectorStats.find((ss) => ss.sector === s);
        return stat && (stat.heat || 0) >= 80;
      })
    ).length;
  }, [companies, sectorStats]);

  const hotSectorPct = useMemo(() => {
    if (companies.length === 0) return 0;
    return (hotSectorCount / companies.length) * 100;
  }, [hotSectorCount, companies.length]);

  const compositeScore = useMemo(() => {
    return Math.round(
      avgMomentum * 0.4 +
      topPerformerPct * 0.3 +
      hotSectorPct * 0.3
    );
  }, [avgMomentum, topPerformerPct, hotSectorPct]);

  const top5Companies = useMemo(() => {
    return [...companies]
      .sort((a, b) => (b.momentum || 0) - (a.momentum || 0))
      .slice(0, 5);
  }, [companies]);

  const sectorHeat = useMemo(() => {
    return [...(sectorStats || [])]
      .filter((s) => (s.heat || 0) >= 50)
      .sort((a, b) => (b.heat || 0) - (a.heat || 0))
      .slice(0, 6);
  }, [sectorStats]);

  const maxHeat = useMemo(
    () => (sectorHeat.length > 0 ? sectorHeat[0].heat : 100),
    [sectorHeat]
  );

  const status = compositeScore >= 70 ? 'exceeding' : compositeScore >= 50 ? 'on-track' : 'caution';

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Nevada's Innovation Momentum Index stands at ${compositeScore}/100, derived from ecosystem-wide signals: average company momentum (${avgMomentum.toFixed(0)}/100), top-performer density (${fmtPct(topPerformerPct)} of companies above 75), and hot-sector exposure (${fmtPct(hotSectorPct)} in high-heat verticals). ${compositeScore >= 70 ? 'The ecosystem is demonstrating strong innovation velocity — a key narrative for federal partnership discussions.' : compositeScore >= 50 ? 'Momentum is steady but there is room to accelerate through targeted sector investments.' : 'Innovation momentum is below optimal — recommend focused interventions in high-potential sectors.'}`}
        status={{ key: status, label: status === 'exceeding' ? 'Strong Momentum' : status === 'on-track' ? 'Steady' : 'Needs Attention' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Index Composition</div>
      <div className={styles.formulaGrid}>
        <div className={styles.formulaCard}>
          <span className={styles.formulaWeight}>40%</span>
          <span className={styles.formulaLabel}>Avg Momentum</span>
          <span className={styles.formulaScore}>{avgMomentum.toFixed(1)}</span>
        </div>
        <div className={styles.formulaCard}>
          <span className={styles.formulaWeight}>30%</span>
          <span className={styles.formulaLabel}>Top Performers</span>
          <span className={styles.formulaScore}>{fmtPct(topPerformerPct)}</span>
        </div>
        <div className={styles.formulaCard}>
          <span className={styles.formulaWeight}>30%</span>
          <span className={styles.formulaLabel}>Hot Sectors</span>
          <span className={styles.formulaScore}>{fmtPct(hotSectorPct)}</span>
        </div>
        <div className={`${styles.formulaCard} ${styles.formulaTotal}`}>
          <span className={styles.formulaWeight}>=</span>
          <span className={styles.formulaLabel}>Composite</span>
          <span className={styles.formulaScore}>{compositeScore}</span>
        </div>
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Top Momentum Companies</div>
      <div className={styles.miniTable}>
        {top5Companies.map((c, i) => (
          <div key={c.id} className={styles.miniRow}>
            <span className={styles.miniRank}>{i + 1}</span>
            <span className={styles.miniName}>{c.name}</span>
            <span className={styles.miniValue}>{c.momentum || 0}</span>
            <span className={styles.miniMeta}>
              {(c.sector || []).slice(0, 2).join(', ')}
            </span>
          </div>
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Sector Heat Map</div>
      <div className={styles.barChart}>
        {sectorHeat.map((s) => (
          <HorizontalBar
            key={s.sector}
            label={s.sector}
            value={s.heat}
            maxValue={maxHeat}
            suffix=""
            color={
              s.heat >= 85
                ? 'var(--status-risk)'
                : s.heat >= 70
                  ? 'var(--accent-gold)'
                  : 'var(--accent-teal)'
            }
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        {topPerformerPct < 20 && (
          <ActionItem
            icon={'\u26A0'}
            text={`Only ${fmtPct(topPerformerPct)} of companies above 75 momentum — identify bottlenecks preventing breakout growth`}
            priority="high"
          />
        )}
        <ActionItem
          icon={'\u2192'}
          text={`${top5Companies[0]?.name || 'Lead company'} leads momentum at ${top5Companies[0]?.momentum || 0}/100 — feature in next GOED report as ecosystem exemplar`}
          priority="medium"
        />
        <ActionItem
          icon={'\u2139'}
          text={`${sectorHeat.filter((s) => s.heat >= 80).length} sectors above 80 heat — these represent primary growth corridors for targeted investment`}
          priority="info"
        />
      </div>
    </div>
  );
}
