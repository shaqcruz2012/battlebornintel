import React, { useMemo } from 'react';
import styles from './KpiDetailPanel.module.css';

class DetailErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '20px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '11px' }}>Detail view unavailable. Try refreshing.</div>;
    }
    return this.props.children;
  }
}

// ── Formatters ──────────────────────────────────────────────────────────────

function fmtDollars(val) {
  if (val == null) return '--';
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
  return `$${val.toFixed(1)}M`;
}

function fmtPct(val) {
  if (val == null) return '--';
  return `${Math.round(val)}%`;
}

function fmtNumber(val) {
  if (val == null) return '--';
  return val.toLocaleString();
}

// ── Reusable sub-components ─────────────────────────────────────────────────

function HorizontalBar({ label, value, maxValue, suffix = '', color = 'var(--accent-teal)', annotation }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.barValue}>
        {typeof value === 'number' ? value.toFixed(1) : value}{suffix}
      </span>
      {annotation && <span className={styles.barAnnotation}>{annotation}</span>}
    </div>
  );
}

function StatRow({ label, value, accent = false, status }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <div className={styles.statRight}>
        {status && <StatusDot status={status} />}
        <span className={`${styles.statValue} ${accent ? styles.statAccent : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    'on-track': 'var(--status-success)',
    'caution': 'var(--accent-gold)',
    'at-risk': 'var(--status-risk)',
    'critical': 'var(--status-risk)',
  };
  return (
    <span
      className={styles.statusDot}
      style={{ background: colors[status] || 'var(--text-disabled)' }}
      title={status}
    />
  );
}

function StatusBadge({ status, label }) {
  const statusClass = {
    'on-track': styles.statusOnTrack,
    'caution': styles.statusCaution,
    'at-risk': styles.statusAtRisk,
    'exceeding': styles.statusExceeding,
  }[status] || styles.statusOnTrack;

  return (
    <span className={`${styles.statusBadge} ${statusClass}`}>
      {label || status}
    </span>
  );
}

function AnalystAssessment({ text, status }) {
  return (
    <div className={styles.assessmentBlock}>
      <div className={styles.assessmentHeader}>
        <span className={styles.assessmentLabel}>Analyst Assessment</span>
        {status && <StatusBadge status={status.key} label={status.label} />}
      </div>
      <p className={styles.assessmentText}>{text}</p>
    </div>
  );
}

function ActionItem({ icon, text, priority = 'info' }) {
  const priorityClass = {
    high: styles.actionHigh,
    medium: styles.actionMedium,
    info: styles.actionInfo,
  }[priority] || styles.actionInfo;

  return (
    <div className={`${styles.actionItem} ${priorityClass}`}>
      <span className={styles.actionIcon}>{icon}</span>
      <span className={styles.actionText}>{text}</span>
    </div>
  );
}

function BenchmarkRow({ label, value, benchmark, unit = '' }) {
  const numVal = typeof value === 'number' ? value : 0;
  const numBench = typeof benchmark === 'number' ? benchmark : 0;
  const delta = numBench > 0 ? ((numVal - numBench) / numBench) * 100 : 0;
  const isAbove = delta >= 0;

  return (
    <div className={styles.benchmarkRow}>
      <span className={styles.benchmarkLabel}>{label}</span>
      <span className={styles.benchmarkValue}>{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
      <span className={`${styles.benchmarkDelta} ${isAbove ? styles.deltaPositive : styles.deltaNegative}`}>
        {isAbove ? '+' : ''}{delta.toFixed(0)}%
      </span>
    </div>
  );
}

function TrendBadge({ direction, label }) {
  const isUp = direction === 'up';
  return (
    <span className={`${styles.trendBadge} ${isUp ? styles.trendUp : styles.trendDown}`}>
      <span className={styles.trendArrow}>{isUp ? '\u25B2' : '\u25BC'}</span>
      {label}
    </span>
  );
}

function RiskFlag({ message }) {
  return (
    <div className={styles.riskFlag}>
      <span className={styles.riskIcon}>{'!'}</span>
      <span className={styles.riskText}>{message}</span>
    </div>
  );
}

function SectionDivider() {
  return <div className={styles.sectionDivider} />;
}

// ── Capital Deployed detail ─────────────────────────────────────────────────

function CapitalDeployedDetail({ funds, companies }) {
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

// ── SSBCI Capital detail ────────────────────────────────────────────────────

function SsbciCapitalDetail({ funds }) {
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

// ── Private Leverage detail ─────────────────────────────────────────────────

function PrivateLeverageDetail({ funds }) {
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

// ── Ecosystem Capacity detail ───────────────────────────────────────────────

function EcosystemCapacityDetail({ companies }) {
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

// ── Innovation Momentum detail ──────────────────────────────────────────────

function InnovationMomentumDetail({ companies, sectorStats }) {
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

// ── Panel configuration ─────────────────────────────────────────────────────

const PANEL_CONFIG = {
  capitalDeployed: {
    title: 'Capital Deployed',
    subtitle: 'Ecosystem Fund Deployment Analysis',
    icon: '\u25C8',
    sortKey: 'funding',
  },
  ssbciCapitalDeployed: {
    title: 'SSBCI Capital',
    subtitle: 'Federal Program Compliance & Deployment',
    icon: '\u25A3',
    sortKey: 'ssbci',
  },
  privateLeverage: {
    title: 'Private Leverage',
    subtitle: 'Treasury Co-Investment Multiplier',
    icon: '\u25B3',
    sortKey: 'leverage',
  },
  ecosystemCapacity: {
    title: 'Ecosystem Capacity',
    subtitle: 'Employment & Economic Footprint',
    icon: '\u25CF',
    sortKey: 'employees',
  },
  innovationIndex: {
    title: 'Innovation Momentum',
    subtitle: 'Composite Ecosystem Health Index',
    icon: '\u26A1',
    sortKey: 'momentum',
  },
};

// ── Main export ─────────────────────────────────────────────────────────────

export function KpiDetailPanel({
  activeKpi,
  kpis,
  funds = [],
  companies = [],
  sectorStats = [],
  onClose,
}) {
  if (!activeKpi) return null;

  const config = PANEL_CONFIG[activeKpi] || { title: 'KPI Detail', subtitle: '', icon: '\u25C8' };

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>{config.icon}</span>
            <div className={styles.headerTitleGroup}>
              <span className={styles.headerTitle}>{config.title}</span>
              {config.subtitle && (
                <span className={styles.headerSubtitle}>{config.subtitle}</span>
              )}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close detail panel"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Content — routed by activeKpi */}
        <DetailErrorBoundary>
          {activeKpi === 'capitalDeployed' && (
            <CapitalDeployedDetail funds={funds} companies={companies} />
          )}
          {activeKpi === 'ssbciCapitalDeployed' && (
            <SsbciCapitalDetail funds={funds} />
          )}
          {activeKpi === 'privateLeverage' && (
            <PrivateLeverageDetail funds={funds} />
          )}
          {activeKpi === 'ecosystemCapacity' && (
            <EcosystemCapacityDetail companies={companies} />
          )}
          {activeKpi === 'innovationIndex' && (
            <InnovationMomentumDetail companies={companies} sectorStats={sectorStats} />
          )}
        </DetailErrorBoundary>
      </div>
    </div>
  );
}
