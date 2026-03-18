import { useState, useMemo } from 'react';
import { useInvestors, useInvestorStats } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import styles from './InvestorsView.module.css';

/* ── Constants ──────────────────────────────────────────────── */

const FUND_TYPE_COLORS = {
  SSBCI: '#8B5CF6',
  Angel: '#F59E0B',
  VC: '#10B981',
  Accelerator: '#3B82F6',
  'Deep Tech VC': '#06B6D4',
  'Growth VC': '#EC4899',
};

const ENTITY_TYPE_COLORS = {
  'VC Firm': '#10B981',
  Angel: '#F59E0B',
  Corporation: '#3B82F6',
  'Family Office': '#A855F7',
};

const SORT_OPTIONS_FUNDS = [
  { key: 'deployed', label: 'Deployed' },
  { key: 'companies', label: 'Portfolio' },
  { key: 'name', label: 'Name' },
];

const SORT_OPTIONS_EXT = [
  { key: 'portfolio', label: 'Portfolio Size' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
];

const EXT_TYPE_FILTERS = ['All', 'VC Firm', 'Angel', 'Corporation', 'Family Office'];

/* ── Helpers ────────────────────────────────────────────────── */

function formatCurrency(value) {
  if (value == null || value === 0) return '$0';
  if (value >= 1) return `$${value.toFixed(1)}M`;
  return `$${(value * 1000).toFixed(0)}K`;
}

function getTypeColor(type) {
  return FUND_TYPE_COLORS[type] || '#6B7280';
}

function getEntityColor(type) {
  return ENTITY_TYPE_COLORS[type] || '#6B7280';
}

/* ── Loading Skeleton ───────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.loadingWrapper}>
        <div className={styles.skeletonKpi}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonKpiCell}`} />
          ))}
        </div>
        <div className={styles.skeletonTable} />
      </div>
    </MainGrid>
  );
}

/* ── NV Fund Card ───────────────────────────────────────────── */

function NVFundCard({ fund, isExpanded, onToggle }) {
  const deployed = fund.deployed ?? 0;
  const deployPercent =
    fund.allocated && fund.allocated > 0
      ? Math.min((deployed / fund.allocated) * 100, 100)
      : 0;

  return (
    <div
      className={`${styles.fundCard} ${isExpanded ? styles.fundCardExpanded : ''}`}
      onClick={onToggle}
    >
      <div className={styles.fundCardHeader}>
        <span className={styles.fundName}>{fund.name}</span>
        <span
          className={styles.typeBadge}
          style={{
            backgroundColor: `${getTypeColor(fund.type)}22`,
            color: getTypeColor(fund.type),
          }}
        >
          {fund.type}
        </span>
      </div>

      {fund.allocated > 0 && (
        <div className={styles.deployBar}>
          <div className={styles.deployFill} style={{ width: `${deployPercent}%` }} />
        </div>
      )}

      <div className={styles.fundStats}>
        <span>
          <span className={styles.fundStatsLabel}>Deploy </span>
          {formatCurrency(fund.deployed)}
        </span>
        {fund.allocated != null && (
          <span>
            <span className={styles.fundStatsLabel}>Alloc </span>
            {formatCurrency(fund.allocated)}
          </span>
        )}
        <span>
          <span className={styles.fundStatsLabel}>Cos </span>
          {fund.companies}
        </span>
      </div>

      {fund.thesis && <p className={styles.thesis}>{fund.thesis}</p>}
    </div>
  );
}

/* ── External Investor Row ──────────────────────────────────── */

function InvestorRow({ investor, isExpanded, onToggle }) {
  const color = getEntityColor(investor.type);

  return (
    <>
      <tr
        className={`${styles.investorRow} ${isExpanded ? styles.investorRowExpanded : ''}`}
        onClick={onToggle}
      >
        <td className={`${styles.investorTd} ${styles.investorName}`}>
          {investor.name}
        </td>
        <td className={styles.investorTd}>
          <span
            className={styles.investorTypeBadge}
            style={{ backgroundColor: `${color}22`, color }}
          >
            {investor.type}
          </span>
        </td>
        <td className={`${styles.investorTd} ${styles.investorPortfolioSize}`}>
          {investor.portfolioSize}
        </td>
        <td className={`${styles.investorTd} ${styles.hideMobile}`}>
          {investor.portfolio
            .slice(0, 3)
            .map((c) => c.name)
            .join(', ')}
          {investor.portfolio.length > 3 && ` +${investor.portfolio.length - 3}`}
        </td>
      </tr>
      {isExpanded &&
        investor.portfolio.map((c, idx) => (
          <tr key={`${investor.id}-${idx}`} className={styles.portfolioRow}>
            <td colSpan={2}>
              <span className={styles.portfolioCompanyName}>{c.name}</span>
            </td>
            <td className={styles.portfolioStage}>{c.stage || '--'}</td>
            <td className={`${styles.portfolioFunding} ${styles.hideMobile}`}>
              {c.funding != null ? formatCurrency(c.funding) : '--'}
            </td>
          </tr>
        ))}
    </>
  );
}

/* ── Main View ──────────────────────────────────────────────── */

export function InvestorsView() {
  const { data, isLoading: loadingInvestors } = useInvestors();
  const { data: stats, isLoading: loadingStats } = useInvestorStats();

  const [expandedFundId, setExpandedFundId] = useState(null);
  const [expandedExtId, setExpandedExtId] = useState(null);
  const [fundSort, setFundSort] = useState('deployed');
  const [extSort, setExtSort] = useState('portfolio');
  const [typeFilter, setTypeFilter] = useState('All');

  const nvFunds = data?.nvFunds || [];
  const externalInvestors = data?.externalInvestors || [];

  // Sort NV funds
  const sortedFunds = useMemo(() => {
    const sorted = [...nvFunds];
    switch (fundSort) {
      case 'deployed':
        sorted.sort((a, b) => (b.deployed ?? 0) - (a.deployed ?? 0));
        break;
      case 'companies':
        sorted.sort((a, b) => b.companies - a.companies);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [nvFunds, fundSort]);

  // Filter + sort external investors
  const filteredExtInvestors = useMemo(() => {
    let list = externalInvestors;
    if (typeFilter !== 'All') {
      list = list.filter((i) => i.type === typeFilter);
    }
    const sorted = [...list];
    switch (extSort) {
      case 'portfolio':
        sorted.sort((a, b) => b.portfolioSize - a.portfolioSize);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type) || b.portfolioSize - a.portfolioSize);
        break;
      default:
        break;
    }
    return sorted;
  }, [externalInvestors, extSort, typeFilter]);

  // Group external investors by type for grouped display
  const groupedExtInvestors = useMemo(() => {
    if (extSort !== 'type') return null;
    const groups = {};
    for (const inv of filteredExtInvestors) {
      if (!groups[inv.type]) groups[inv.type] = [];
      groups[inv.type].push(inv);
    }
    return groups;
  }, [filteredExtInvestors, extSort]);

  if (loadingInvestors || loadingStats) {
    return <LoadingSkeleton />;
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* ── Section 3: KPI Strip ──────────────────────────── */}
        <div className={styles.kpiStrip}>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{stats?.totalUniqueInvestors ?? '--'}</span>
            <span className={styles.kpiLabel}>Total Investors</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{stats?.totalNvFunds ?? '--'}</span>
            <span className={styles.kpiLabel}>NV-Based Funds</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{stats?.totalExternalInvestors ?? '--'}</span>
            <span className={styles.kpiLabel}>Out-of-State w/ NV Nexus</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {stats?.totalDeployed != null ? formatCurrency(stats.totalDeployed) : '--'}
            </span>
            <span className={styles.kpiLabel}>Capital Tracked (NV Funds)</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {stats?.totalAllocated != null ? formatCurrency(stats.totalAllocated) : '--'}
            </span>
            <span className={styles.kpiLabel}>Total Allocated</span>
          </div>
        </div>

        {/* Type breakdown chips */}
        {stats?.typeBreakdown && stats.typeBreakdown.length > 0 && (
          <div className={styles.typeBreakdown}>
            {stats.typeBreakdown.map((t) => (
              <div key={t.type} className={styles.typeChip}>
                <span className={styles.typeChipCount}>{t.count}</span>
                <span className={styles.typeChipLabel}>{t.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Section 1: Nevada-Based Funds ─────────────────── */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Nevada-Based Funds</span>
          <span className={styles.sectionCount}>{nvFunds.length} funds</span>
        </div>

        <div className={styles.controls}>
          <span className={styles.controlsLabel}>Sort</span>
          {SORT_OPTIONS_FUNDS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.sortBtn} ${fundSort === opt.key ? styles.sortBtnActive : ''}`}
              onClick={() => setFundSort(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={styles.fundsGrid}>
          {sortedFunds.map((fund) => (
            <NVFundCard
              key={fund.id}
              fund={fund}
              isExpanded={expandedFundId === fund.id}
              onToggle={() =>
                setExpandedFundId((prev) => (prev === fund.id ? null : fund.id))
              }
            />
          ))}
        </div>

        {/* ── Section 2: Out-of-State Investors ─────────────── */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            Out-of-State Investors with NV Nexus
          </span>
          <span className={styles.sectionCount}>
            {filteredExtInvestors.length} investors
          </span>
        </div>

        <div className={styles.controls}>
          <span className={styles.controlsLabel}>Filter</span>
          {EXT_TYPE_FILTERS.map((tf) => (
            <button
              key={tf}
              className={`${styles.filterBtn} ${typeFilter === tf ? styles.filterBtnActive : ''}`}
              onClick={() => setTypeFilter(tf)}
            >
              {tf}
            </button>
          ))}
          <span className={styles.controlsLabel} style={{ marginLeft: 'auto' }}>
            Sort
          </span>
          {SORT_OPTIONS_EXT.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.sortBtn} ${extSort === opt.key ? styles.sortBtnActive : ''}`}
              onClick={() => setExtSort(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <table className={styles.investorTable}>
          <thead>
            <tr>
              <th className={styles.investorTh}>Investor</th>
              <th className={styles.investorTh}>Type</th>
              <th className={`${styles.investorTh} ${styles.investorThRight}`}>
                NV Investments
              </th>
              <th className={`${styles.investorTh} ${styles.hideMobile}`}>
                Portfolio Companies
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedExtInvestors
              ? Object.entries(groupedExtInvestors).map(([type, investors]) => (
                  <GroupRows
                    key={type}
                    type={type}
                    investors={investors}
                    expandedId={expandedExtId}
                    onToggle={(id) =>
                      setExpandedExtId((prev) => (prev === id ? null : id))
                    }
                  />
                ))
              : filteredExtInvestors.map((inv) => (
                  <InvestorRow
                    key={inv.id}
                    investor={inv}
                    isExpanded={expandedExtId === inv.id}
                    onToggle={() =>
                      setExpandedExtId((prev) =>
                        prev === inv.id ? null : inv.id,
                      )
                    }
                  />
                ))}
            {filteredExtInvestors.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-disabled)',
                    fontStyle: 'italic',
                  }}
                >
                  No investors match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainGrid>
  );
}

/* ── Grouped rows helper ────────────────────────────────────── */

function GroupRows({ type, investors, expandedId, onToggle }) {
  return (
    <>
      <tr className={styles.groupHeader}>
        <td colSpan={4}>
          {type} ({investors.length})
        </td>
      </tr>
      {investors.map((inv) => (
        <InvestorRow
          key={inv.id}
          investor={inv}
          isExpanded={expandedId === inv.id}
          onToggle={() => onToggle(inv.id)}
        />
      ))}
    </>
  );
}
