import { memo, useMemo } from 'react';
import { Sparkline } from '../shared/Sparkline';
import styles from './FundsView.module.css';

const FUND_TYPE_COLORS = {
  SSBCI: '#8B5CF6',
  Angel: '#F59E0B',
  VC: '#10B981',
  Accelerator: '#3B82F6',
};

const GRADE_COLORS = {
  'A': '#4ADE80',
  'A-': '#4ADE80',
  'B+': '#FACC15',
  'B': '#FACC15',
  'B-': '#FACC15',
  'C+': '#FB923C',
  'C': '#FB923C',
  'D': '#F87171',
};

function getTypeColor(type) {
  return FUND_TYPE_COLORS[type] || '#6B7280';
}

function getGradeColor(grade) {
  return GRADE_COLORS[grade] || '#6B7280';
}

function formatCurrency(value) {
  if (value == null) return '--';
  if (value >= 1) return `$${value.toFixed(1)}M`;
  if (value > 0) return `$${(value * 1000).toFixed(0)}K`;
  return '$0';
}

function DeploymentBar({ allocated, deployed }) {
  const ratio = allocated && allocated > 0
    ? Math.min((deployed / allocated) * 100, 100)
    : 0;

  return (
    <div className={styles.deployBar}>
      <div
        className={styles.deployFill}
        style={{ width: `${ratio}%` }}
      />
    </div>
  );
}

function PortfolioTable({ portfolio }) {
  if (portfolio.length === 0) {
    return (
      <div className={styles.emptyPortfolio}>
        <p>No portfolio companies currently linked to this fund.</p>
        <p className={styles.emptyHint}>Company eligibility is determined by stage, sector, and fund criteria.</p>
      </div>
    );
  }

  return (
    <table className={styles.portfolioTable}>
      <thead>
        <tr>
          <th className={styles.portfolioTh}>Company</th>
          <th className={styles.portfolioTh}>IRS</th>
          <th className={styles.portfolioTh}>Grade</th>
          <th className={styles.portfolioTh}>Funding</th>
          <th className={styles.portfolioTh}>Stage</th>
        </tr>
      </thead>
      <tbody>
        {portfolio.map((company) => (
          <tr key={company.id}>
            <td className={`${styles.portfolioTd} ${styles.portfolioName}`}>
              {company.name}
            </td>
            <td className={styles.portfolioTd}>
              {company.irs != null ? company.irs : '--'}
            </td>
            <td className={styles.portfolioTd}>
              {company.grade ? (
                <span
                  className={styles.portfolioGrade}
                  style={{ color: getGradeColor(company.grade) }}
                >
                  {company.grade}
                </span>
              ) : (
                '--'
              )}
            </td>
            <td className={`${styles.portfolioTd} ${styles.portfolioFunding}`}>
              {formatCurrency(company.funding)}
            </td>
            <td className={styles.portfolioTd}>
              {company.stage || '--'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const FundCard = memo(function FundCard({
  fund,
  portfolio,
  portfolioCount,
  isExpanded,
  onToggle,
}) {
  const deployed = fund.deployed ?? 0;

  const deployPercent = fund.allocated && fund.allocated > 0
    ? Math.min((deployed / fund.allocated) * 100, 100)
    : 0;

  const remaining = fund.allocated != null
    ? Math.max(fund.allocated - deployed, 0)
    : null;

  // Generate a deterministic deployment trajectory sparkline
  const deploySparkData = useMemo(() => {
    if (!fund.allocated || fund.allocated <= 0) return [];
    const id = typeof fund.id === 'number' ? fund.id : (fund.name || '').length;
    const seed = (id * 2654435761) >>> 0;
    const target = deployPercent;
    const points = [];
    for (let i = 0; i < 8; i++) {
      const noise = ((seed * (i + 1) * 16807) % 2147483647) / 2147483647;
      const progress = i / 7;
      const value = target * progress + (noise - 0.5) * 10;
      points.push(Math.max(0, Math.min(100, Math.round(value))));
    }
    return points;
  }, [fund.id, fund.name, fund.allocated, deployPercent]);

  return (
    <div
      className={`${styles.fundCard} ${isExpanded ? styles.expanded : ''}`}
      onClick={onToggle}
    >
      <div className={styles.fundHeader}>
        <span className={styles.fundName}>{fund.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkline data={deploySparkData} width={48} height={16} color="auto" showArea={false} strokeWidth={1.2} />
          <span
            className={styles.typeBadge}
            style={{ backgroundColor: `${getTypeColor(fund.type)}22`, color: getTypeColor(fund.type) }}
          >
            {fund.type}
          </span>
        </div>
      </div>

      <DeploymentBar allocated={fund.allocated} deployed={deployed} />

      <div className={styles.deployStats}>
        <span>
          <span className={styles.deployStatsLabel}>Alloc </span>
          {formatCurrency(fund.allocated)}
        </span>
        <span>
          <span className={styles.deployStatsLabel}>Deploy </span>
          {formatCurrency(fund.deployed)}
        </span>
        <span>
          <span className={styles.deployStatsLabel}>Rem </span>
          {remaining != null ? formatCurrency(remaining) : '--'}
        </span>
      </div>

      <div className={styles.fundMeta}>
        {fund.leverage != null && (
          <span className={styles.leverageTag}>
            {fund.leverage.toFixed(1)}x leverage
          </span>
        )}
        <span className={styles.companyCount}>
          {portfolioCount} {portfolioCount === 1 ? 'company' : 'companies'}
        </span>
      </div>

      {fund.thesis && (
        <p className={styles.thesis}>{fund.thesis}</p>
      )}

      {isExpanded && (
        <PortfolioTable portfolio={portfolio} />
      )}
    </div>
  );
});
