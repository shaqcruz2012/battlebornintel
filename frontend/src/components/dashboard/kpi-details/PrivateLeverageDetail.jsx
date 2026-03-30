import { useMemo } from 'react';
import styles from '../KpiDetailPanel.module.css';
import {
  fmtDollars,
  HorizontalBar,
  AnalystAssessment,
  ActionItem,
  SectionDivider,
} from './shared';

export default function PrivateLeverageDetail({ funds }) {
  const TREASURY_TARGET = 2.0;
  const NATIONAL_AVG = 2.8;

  const ssbciFunds = useMemo(
    () => funds.filter((f) => f.type === 'SSBCI' && f.leverage != null),
    [funds]
  );

  const totalDeployed = useMemo(
    () => ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0),
    [ssbciFunds]
  );

  const weightedAvg = useMemo(() => {
    if (totalDeployed === 0) return 0;
    const weightedSum = ssbciFunds.reduce(
      (s, f) => s + (f.deployed || 0) * (f.leverage || 0),
      0
    );
    return weightedSum / totalDeployed;
  }, [ssbciFunds, totalDeployed]);

  const maxLeverage = useMemo(
    () => Math.max(...ssbciFunds.map((f) => f.leverage || 0), TREASURY_TARGET, NATIONAL_AVG, 1),
    [ssbciFunds]
  );

  const bestFund = useMemo(() => {
    if (ssbciFunds.length === 0) return null;
    return [...ssbciFunds].sort((a, b) => (b.leverage || 0) - (a.leverage || 0))[0];
  }, [ssbciFunds]);

  const status = weightedAvg >= TREASURY_TARGET
    ? (weightedAvg >= NATIONAL_AVG ? 'exceeding' : 'on-track')
    : 'at-risk';

  return (
    <div className={styles.detailContent}>
      <AnalystAssessment
        text={`Nevada's weighted private leverage ratio of ${weightedAvg.toFixed(1)}x ${weightedAvg >= TREASURY_TARGET ? `exceeds the Treasury minimum target of ${TREASURY_TARGET}x` : `falls below the Treasury minimum target of ${TREASURY_TARGET}x`}. ${weightedAvg >= NATIONAL_AVG ? `Performance exceeds the national SSBCI average of ${NATIONAL_AVG}x, positioning Nevada as a top-performing state.` : `The national SSBCI average is ${NATIONAL_AVG}x — Nevada should target fund manager strategies that increase private co-investment per SSBCI dollar.`} This metric is the primary indicator Treasury uses to evaluate program effectiveness.`}
        status={{ key: status, label: status === 'exceeding' ? 'Exceeding Target' : status === 'on-track' ? 'Above Target' : 'Below Target' }}
      />

      <SectionDivider />

      <div className={styles.sectionTitle}>Per-Fund Leverage Performance</div>
      <div className={styles.barChart}>
        {ssbciFunds.map((f) => (
          <HorizontalBar
            key={f.id}
            label={f.name}
            value={f.leverage || 0}
            maxValue={maxLeverage}
            suffix="x"
            color={
              (f.leverage || 0) >= NATIONAL_AVG
                ? 'var(--status-success)'
                : (f.leverage || 0) >= TREASURY_TARGET
                  ? 'var(--accent-teal)'
                  : 'var(--status-risk)'
            }
          />
        ))}
      </div>

      {/* Benchmark lines */}
      <div className={styles.benchmarkLines}>
        <div className={styles.benchmarkLine}>
          <span className={styles.benchmarkLineLabel}>Treasury Minimum</span>
          <span className={styles.benchmarkLineValue} style={{ color: 'var(--accent-gold)' }}>{TREASURY_TARGET}x</span>
        </div>
        <div className={styles.benchmarkLine}>
          <span className={styles.benchmarkLineLabel}>National Average</span>
          <span className={styles.benchmarkLineValue} style={{ color: 'var(--accent-teal)' }}>{NATIONAL_AVG}x</span>
        </div>
        <div className={styles.benchmarkLine}>
          <span className={styles.benchmarkLineLabel}>Nevada Weighted</span>
          <span className={styles.benchmarkLineValue} style={{ color: status === 'at-risk' ? 'var(--status-risk)' : 'var(--status-success)' }}>
            {weightedAvg.toFixed(1)}x
          </span>
        </div>
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Weighted Calculation</div>
      <div className={styles.formulaBlock}>
        <span className={styles.formulaText}>
          {ssbciFunds.map((f) => `(${fmtDollars(f.deployed)} × ${(f.leverage || 0).toFixed(1)}x)`).join(' + ')}
        </span>
        <span className={styles.formulaDivider}>/</span>
        <span className={styles.formulaText}>
          {fmtDollars(totalDeployed)} total deployed
        </span>
        <span className={styles.formulaResult}>= {weightedAvg.toFixed(1)}x</span>
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>GOED Action Items</div>
      <div className={styles.actionList}>
        {weightedAvg < TREASURY_TARGET && (
          <ActionItem
            icon={'\u26A0'}
            text={`Leverage ratio below Treasury ${TREASURY_TARGET}x target — risk of negative program assessment. Prioritize high-leverage co-investment strategies.`}
            priority="high"
          />
        )}
        {bestFund && (
          <ActionItem
            icon={'\u2192'}
            text={`${bestFund.name} leads at ${(bestFund.leverage || 0).toFixed(1)}x — replicate their co-investor acquisition strategy across other fund managers`}
            priority="medium"
          />
        )}
        <ActionItem
          icon={'\u2139'}
          text="Each $1 of SSBCI capital is mobilizing $3.20 in private investment — communicate this multiplier in legislative reporting."
          priority="info"
        />
      </div>
    </div>
  );
}
