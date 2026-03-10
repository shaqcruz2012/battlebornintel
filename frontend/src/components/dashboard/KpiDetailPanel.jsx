import { useMemo } from 'react';
import styles from './KpiDetailPanel.module.css';

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

// ── Bar component (CSS-only horizontal bar) ─────────────────────────────────

function HorizontalBar({ label, value, maxValue, suffix = '', color = 'var(--accent-teal)' }) {
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
    </div>
  );
}

// ── Stat row (label + value inline) ─────────────────────────────────────────

function StatRow({ label, value, accent = false }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${accent ? styles.statAccent : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ── Trend badge ─────────────────────────────────────────────────────────────

function TrendBadge({ direction, label }) {
  const isUp = direction === 'up';
  return (
    <span className={`${styles.trendBadge} ${isUp ? styles.trendUp : styles.trendDown}`}>
      <span className={styles.trendArrow}>{isUp ? '\u25B2' : '\u25BC'}</span>
      {label}
    </span>
  );
}

// ── Risk flag ───────────────────────────────────────────────────────────────

function RiskFlag({ message }) {
  return (
    <div className={styles.riskFlag}>
      <span className={styles.riskIcon}>!</span>
      <span className={styles.riskText}>{message}</span>
    </div>
  );
}

// ── Compliance badge ────────────────────────────────────────────────────────

function ComplianceBadge({ status }) {
  const isOk = status === 'compliant' || status === 'on-track';
  return (
    <span className={`${styles.complianceBadge} ${isOk ? styles.complianceOk : styles.complianceWarn}`}>
      {isOk ? '\u2713' : '\u25B3'} {status}
    </span>
  );
}

// ── Section divider ─────────────────────────────────────────────────────────

function SectionDivider() {
  return <div className={styles.sectionDivider} />;
}

// ── Capital Deployed detail ─────────────────────────────────────────────────

function CapitalDeployedDetail({ funds, companies }) {
  const totalDeployed = useMemo(
    () => funds.reduce((s, f) => s + (f.deployed || 0), 0),
    [funds]
  );

  const fundBreakdown = useMemo(() => {
    const sorted = [...funds]
      .filter((f) => (f.deployed || 0) > 0)
      .sort((a, b) => (b.deployed || 0) - (a.deployed || 0));
    return sorted.map((f) => ({
      name: f.name,
      deployed: f.deployed || 0,
      pct: totalDeployed > 0 ? ((f.deployed || 0) / totalDeployed) * 100 : 0,
    }));
  }, [funds, totalDeployed]);

  const maxDeployed = useMemo(
    () => Math.max(...fundBreakdown.map((f) => f.deployed), 1),
    [fundBreakdown]
  );

  const topDeployments = useMemo(() => {
    const sorted = [...companies]
      .filter((c) => (c.funding || 0) > 0)
      .sort((a, b) => (b.funding || 0) - (a.funding || 0));
    return sorted.slice(0, 3);
  }, [companies]);

  return (
    <div className={styles.detailContent}>
      <div className={styles.sectionTitle}>Fund Deployment Breakdown</div>
      <div className={styles.barChart}>
        {fundBreakdown.map((f) => (
          <HorizontalBar
            key={f.name}
            label={f.name}
            value={f.deployed}
            maxValue={maxDeployed}
            suffix="M"
            color="var(--accent-teal)"
          />
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Top 3 Largest Portfolio Companies</div>
      <div className={styles.miniTable}>
        {topDeployments.map((c) => (
          <div key={c.id} className={styles.miniRow}>
            <span className={styles.miniName}>{c.name}</span>
            <span className={styles.miniValue}>{fmtDollars(c.funding)}</span>
            <span className={styles.miniMeta}>
              {c.stage ? c.stage.replace(/_/g, ' ') : '--'}
            </span>
          </div>
        ))}
      </div>

      <SectionDivider />

      <div className={styles.trendRow}>
        <span className={styles.trendLabel}>Deployment trend</span>
        <TrendBadge direction="up" label="Active deployment cycle" />
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
  const isUnderDeployed = deployRate < 50;

  const complianceStatus = deployRate >= 50 ? 'on-track' : 'at-risk';

  return (
    <div className={styles.detailContent}>
      <div className={styles.sectionTitle}>SSBCI Fund Breakdown</div>
      <div className={styles.barChart}>
        {ssbciFunds.map((f) => (
          <div key={f.id} className={styles.ssbciFundRow}>
            <div className={styles.ssbciFundHeader}>
              <span className={styles.barLabel}>{f.name}</span>
              <span className={styles.barValue}>
                {fmtDollars(f.deployed)} / {fmtDollars(f.allocated)}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${f.allocated > 0 ? Math.min(((f.deployed || 0) / f.allocated) * 100, 100) : 0}%`,
                  background: 'var(--accent-blue)',
                }}
              />
            </div>
            <span className={styles.miniMeta}>
              {f.allocated > 0 ? fmtPct(((f.deployed || 0) / f.allocated) * 100) : '--'} deployed
            </span>
          </div>
        ))}
      </div>

      <SectionDivider />

      <StatRow label="Total Allocated" value={fmtDollars(totalAllocated)} />
      <StatRow label="Total Deployed" value={fmtDollars(totalDeployed)} />
      <StatRow label="Deployment Rate" value={fmtPct(deployRate)} accent />

      <SectionDivider />

      <div className={styles.complianceRow}>
        <span className={styles.statLabel}>Federal Compliance</span>
        <ComplianceBadge status={complianceStatus} />
      </div>

      {isUnderDeployed && (
        <RiskFlag message={`Only ${fmtPct(deployRate)} of SSBCI allocation deployed. Pace may risk federal clawback provisions.`} />
      )}
    </div>
  );
}

// ── Private Leverage detail ─────────────────────────────────────────────────

function PrivateLeverageDetail({ funds }) {
  const TREASURY_TARGET = 2.0;

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
    () => Math.max(...ssbciFunds.map((f) => f.leverage || 0), TREASURY_TARGET, 1),
    [ssbciFunds]
  );

  const bestFund = useMemo(() => {
    if (ssbciFunds.length === 0) return null;
    return [...ssbciFunds].sort((a, b) => (b.leverage || 0) - (a.leverage || 0))[0];
  }, [ssbciFunds]);

  const worstFund = useMemo(() => {
    if (ssbciFunds.length === 0) return null;
    return [...ssbciFunds].sort((a, b) => (a.leverage || 0) - (b.leverage || 0))[0];
  }, [ssbciFunds]);

  return (
    <div className={styles.detailContent}>
      <div className={styles.sectionTitle}>Per-Fund Leverage Ratios</div>
      <div className={styles.barChart}>
        {ssbciFunds.map((f) => (
          <HorizontalBar
            key={f.id}
            label={f.name}
            value={f.leverage || 0}
            maxValue={maxLeverage}
            suffix="x"
            color={
              (f.leverage || 0) >= TREASURY_TARGET
                ? 'var(--status-success)'
                : 'var(--status-warning)'
            }
          />
        ))}
        {/* Treasury target line */}
        <div className={styles.targetLine}>
          <span className={styles.targetLabel}>Treasury Target</span>
          <span className={styles.targetValue}>{TREASURY_TARGET.toFixed(1)}x</span>
        </div>
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Weighted Average Calculation</div>
      <div className={styles.formulaBlock}>
        <span className={styles.formulaText}>
          {ssbciFunds.map((f) => `(${fmtDollars(f.deployed)} x ${(f.leverage || 0).toFixed(1)}x)`).join(' + ')}
        </span>
        <span className={styles.formulaDivider}>/</span>
        <span className={styles.formulaText}>
          {fmtDollars(totalDeployed)} total deployed
        </span>
        <span className={styles.formulaResult}>= {weightedAvg.toFixed(1)}x</span>
      </div>

      <SectionDivider />

      <StatRow
        label="vs Treasury Target"
        value={
          weightedAvg >= TREASURY_TARGET
            ? `+${(weightedAvg - TREASURY_TARGET).toFixed(1)}x above`
            : `${(TREASURY_TARGET - weightedAvg).toFixed(1)}x below`
        }
        accent
      />
      {bestFund && (
        <StatRow label="Best Performing" value={`${bestFund.name} (${(bestFund.leverage || 0).toFixed(1)}x)`} />
      )}
      {worstFund && worstFund.id !== bestFund?.id && (
        <StatRow label="Lowest Performing" value={`${worstFund.name} (${(worstFund.leverage || 0).toFixed(1)}x)`} />
      )}
    </div>
  );
}

// ── Ecosystem Capacity detail ───────────────────────────────────────────────

function EcosystemCapacityDetail({ companies }) {
  const topEmployers = useMemo(() => {
    const sorted = [...companies]
      .filter((c) => (c.employees || 0) > 0)
      .sort((a, b) => (b.employees || 0) - (a.employees || 0));
    return sorted.slice(0, 5);
  }, [companies]);

  const maxEmployees = useMemo(
    () => (topEmployers.length > 0 ? topEmployers[0].employees : 1),
    [topEmployers]
  );

  const hiringTrend = useMemo(() => {
    // Companies with high momentum and employees as proxy for growth
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

  const companiesWithEmployees = useMemo(
    () => companies.filter((c) => (c.employees || 0) > 0).length,
    [companies]
  );

  return (
    <div className={styles.detailContent}>
      <div className={styles.sectionTitle}>Top 5 Employers in Portfolio</div>
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

      <div className={styles.sectionTitle}>High-Momentum Hiring Signal</div>
      <div className={styles.miniTable}>
        {hiringTrend.map((c) => (
          <div key={c.id} className={styles.miniRow}>
            <span className={styles.miniName}>{c.name}</span>
            <span className={styles.miniValue}>{c.employees} emp</span>
            <span className={styles.miniMeta}>
              <TrendBadge direction="up" label={`${c.momentum} momentum`} />
            </span>
          </div>
        ))}
      </div>

      <SectionDivider />

      <div className={styles.sectionTitle}>Employee Distribution by Sector</div>
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

      <StatRow
        label="Verified / Estimated"
        value={`${companiesWithEmployees} of ${companies.length} companies report headcount`}
      />
      <StatRow
        label="Verification Rate"
        value={fmtPct(companies.length > 0 ? (companiesWithEmployees / companies.length) * 100 : 0)}
        accent
      />
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
      .filter((s) => (s.heat || 0) >= 70)
      .sort((a, b) => (b.heat || 0) - (a.heat || 0))
      .slice(0, 5);
  }, [sectorStats]);

  const maxHeat = useMemo(
    () => (sectorHeat.length > 0 ? sectorHeat[0].heat : 100),
    [sectorHeat]
  );

  return (
    <div className={styles.detailContent}>
      <div className={styles.sectionTitle}>Formula Breakdown</div>
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

      <div className={styles.sectionTitle}>Top 5 Highest Momentum</div>
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

      <div className={styles.sectionTitle}>Sector Heat Contribution</div>
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
    </div>
  );
}

// ── Panel title map ─────────────────────────────────────────────────────────

const PANEL_TITLES = {
  funding: 'Capital Deployed',
  ssbci: 'SSBCI Capital',
  leverage: 'Private Leverage',
  employees: 'Ecosystem Capacity',
  momentum: 'Innovation Momentum',
};

const PANEL_ICONS = {
  funding: '\u25C8',
  ssbci: '\u25A3',
  leverage: '\u25B3',
  employees: '\u25CF',
  momentum: '\u26A1',
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

  const title = PANEL_TITLES[activeKpi] || 'KPI Detail';
  const icon = PANEL_ICONS[activeKpi] || '\u25C8';

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>{icon}</span>
            <span className={styles.headerTitle}>{title}</span>
            <span className={styles.headerBadge}>DETAIL</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close detail panel"
          >
            \u2715
          </button>
        </div>

        {/* Content — routed by activeKpi */}
        {activeKpi === 'funding' && (
          <CapitalDeployedDetail funds={funds} companies={companies} />
        )}
        {activeKpi === 'ssbci' && (
          <SsbciCapitalDetail funds={funds} />
        )}
        {activeKpi === 'leverage' && (
          <PrivateLeverageDetail funds={funds} />
        )}
        {activeKpi === 'employees' && (
          <EcosystemCapacityDetail companies={companies} />
        )}
        {activeKpi === 'momentum' && (
          <InnovationMomentumDetail companies={companies} sectorStats={sectorStats} />
        )}
      </div>
    </div>
  );
}
