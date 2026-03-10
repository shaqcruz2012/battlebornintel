import { useEffect, useCallback, useMemo } from 'react';
import { fmt, stageLabel } from '../../engine/formatters';
import { GRADE_COLORS, TRIGGER_CFG, SHEAT } from '../../data/constants';
import styles from './SectorDetailDrawer.module.css';

/* -- Heat score color coding -- */

function heatColor(heat) {
  if (heat >= 85) return 'var(--status-risk)';
  if (heat >= 70) return 'var(--accent-gold)';
  if (heat >= 55) return 'var(--accent-teal)';
  return 'var(--text-disabled)';
}

function heatLabel(heat) {
  if (heat >= 85) return 'Critical';
  if (heat >= 70) return 'High';
  if (heat >= 55) return 'Moderate';
  return 'Low';
}

function irsColor(irs) {
  if (irs >= 75) return 'var(--accent-teal)';
  if (irs >= 50) return 'var(--accent-gold)';
  if (irs >= 25) return '#FB923C';
  return '#F87171';
}

function gradeColor(grade) {
  return GRADE_COLORS[grade] || 'var(--text-disabled)';
}

/* -- Section label -- */

function SectionLabel({ children }) {
  return <span className={styles.sectionLabel}>{children}</span>;
}

/* -- Metric box -- */

function MetricBox({ label, value, color }) {
  return (
    <div className={styles.metricBox}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue} style={color ? { color } : undefined}>
        {value ?? '\u2014'}
      </span>
    </div>
  );
}

/* -- Derive sector signals from company data -- */

function deriveSectorSignals(companies) {
  const signals = [];

  // Hiring surges: companies with hiring trigger or high hiring dimension
  const hiringCompanies = companies.filter(
    (c) =>
      (c.triggers || []).includes('hiring_surge') ||
      (c.dims?.hiring && c.dims.hiring >= 70)
  );
  if (hiringCompanies.length > 0) {
    signals.push({
      type: 'hiring_surge',
      label: 'Hiring Surge',
      detail: `${hiringCompanies.length} ${hiringCompanies.length === 1 ? 'company' : 'companies'} actively hiring`,
      color: TRIGGER_CFG.hiring_surge?.color || '#F59E0B',
      companies: hiringCompanies.slice(0, 3).map((c) => c.name),
    });
  }

  // Recent funding: companies with rapid funding trigger or high funding velocity
  const fundingCompanies = companies.filter(
    (c) =>
      (c.triggers || []).includes('rapid_funding') ||
      (c.dims?.funding_velocity && c.dims.funding_velocity >= 70)
  );
  if (fundingCompanies.length > 0) {
    signals.push({
      type: 'rapid_funding',
      label: 'Recent Funding',
      detail: `${fundingCompanies.length} ${fundingCompanies.length === 1 ? 'company' : 'companies'} with rapid funding`,
      color: TRIGGER_CFG.rapid_funding?.color || '#EF4444',
      companies: fundingCompanies.slice(0, 3).map((c) => c.name),
    });
  }

  // Government interest: companies with grant validation or SSBCI eligibility
  const govCompanies = companies.filter(
    (c) =>
      (c.triggers || []).includes('grant_validated') ||
      (c.triggers || []).includes('ssbci_eligible')
  );
  if (govCompanies.length > 0) {
    signals.push({
      type: 'gov_interest',
      label: 'Government Interest',
      detail: `${govCompanies.length} ${govCompanies.length === 1 ? 'company' : 'companies'} grant-validated or SSBCI eligible`,
      color: TRIGGER_CFG.grant_validated?.color || '#3B82F6',
      companies: govCompanies.slice(0, 3).map((c) => c.name),
    });
  }

  // High momentum companies
  const momentumCompanies = companies.filter(
    (c) =>
      (c.triggers || []).includes('high_momentum') ||
      (c.momentum && c.momentum >= 75)
  );
  if (momentumCompanies.length > 0) {
    signals.push({
      type: 'high_momentum',
      label: 'High Momentum',
      detail: `${momentumCompanies.length} ${momentumCompanies.length === 1 ? 'company' : 'companies'} with strong momentum`,
      color: TRIGGER_CFG.high_momentum?.color || '#22C55E',
      companies: momentumCompanies.slice(0, 3).map((c) => c.name),
    });
  }

  return signals;
}

/* -- Main drawer -- */

export function SectorDetailDrawer({ sector, companies = [], sectorStats, onClose, onViewAll }) {

  /* Close on Escape */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Compute derived data */
  const heat = sectorStats?.heat ?? SHEAT[sector] ?? 50;
  const companyCount = sectorStats?.count ?? companies.length;
  const totalFunding = sectorStats?.totalFunding ?? companies.reduce(
    (sum, c) => sum + parseFloat(c.funding_m || c.funding || 0),
    0
  );

  const avgIrs = useMemo(() => {
    const scored = companies.filter((c) => c.irs != null && c.irs > 0);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((s, c) => s + c.irs, 0) / scored.length);
  }, [companies]);

  const topCompanies = useMemo(() => {
    return [...companies]
      .filter((c) => c.irs != null)
      .sort((a, b) => (b.irs || 0) - (a.irs || 0))
      .slice(0, 5);
  }, [companies]);

  const signals = useMemo(
    () => deriveSectorSignals(companies),
    [companies]
  );

  /* Render nothing if no sector selected */
  if (!sector) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`${sector} sector detail`}
      >
        {/* -- Header -- */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <div className={styles.titleRow}>
              <h2 className={styles.sectorName}>{sector}</h2>
              <div
                className={styles.heatBadge}
                style={{
                  color: heatColor(heat),
                  background: `color-mix(in srgb, ${heatColor(heat)} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${heatColor(heat)} 25%, transparent)`,
                }}
              >
                <span className={styles.heatDot} style={{ background: heatColor(heat) }} />
                {heat}
                <span className={styles.heatSuffix}>{heatLabel(heat)}</span>
              </div>
            </div>
            <span className={styles.subtitle}>Sector Intelligence</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close drawer"
          >
            &#x2715;
          </button>
        </div>

        {/* -- Body -- */}
        <div className={styles.body}>

          {/* Overview Metrics */}
          <div className={styles.section}>
            <SectionLabel>Overview</SectionLabel>
            <div className={styles.metricGrid}>
              <MetricBox
                label="Companies"
                value={companyCount}
              />
              <MetricBox
                label="Total Funding"
                value={totalFunding > 0 ? fmt(totalFunding) : '\u2014'}
              />
              <MetricBox
                label="Avg IRS"
                value={avgIrs}
                color={avgIrs != null ? irsColor(avgIrs) : undefined}
              />
              <MetricBox
                label="Heat Score"
                value={heat}
                color={heatColor(heat)}
              />
            </div>
          </div>

          {/* Top Companies */}
          {topCompanies.length > 0 && (
            <div className={styles.section}>
              <SectionLabel>
                Top Companies
                <span className={styles.sectionCount}>{topCompanies.length}</span>
              </SectionLabel>
              <div className={styles.companyList}>
                {topCompanies.map((c, i) => (
                  <div key={c.id || c.name || i} className={styles.companyItem}>
                    <span className={styles.companyRank}>{i + 1}</span>
                    <div className={styles.companyInfo}>
                      <span className={styles.companyItemName}>{c.name}</span>
                      <div className={styles.companyMeta}>
                        {c.stage && (
                          <span className={styles.companyStage}>
                            {stageLabel(c.stage)}
                          </span>
                        )}
                        {c.funding != null && c.funding > 0 && (
                          <span className={styles.companyFunding}>
                            {fmt(c.funding)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.companyScores}>
                      <span
                        className={styles.companyIrs}
                        style={{ color: irsColor(c.irs) }}
                      >
                        {c.irs}
                      </span>
                      {c.grade && (
                        <span
                          className={styles.companyGrade}
                          style={{ color: gradeColor(c.grade) }}
                        >
                          {c.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sector Signals */}
          {signals.length > 0 && (
            <div className={styles.section}>
              <SectionLabel>
                Signals
                <span className={styles.sectionCount}>{signals.length}</span>
              </SectionLabel>
              <div className={styles.signalList}>
                {signals.map((sig) => (
                  <div key={sig.type} className={styles.signalItem}>
                    <div className={styles.signalHeader}>
                      <span
                        className={styles.signalDot}
                        style={{ background: sig.color }}
                      />
                      <span
                        className={styles.signalLabel}
                        style={{ color: sig.color }}
                      >
                        {sig.label}
                      </span>
                    </div>
                    <p className={styles.signalDetail}>{sig.detail}</p>
                    {sig.companies.length > 0 && (
                      <div className={styles.signalCompanies}>
                        {sig.companies.map((name) => (
                          <span key={name} className={styles.signalCompanyTag}>
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {companies.length === 0 && (
            <div className={styles.section}>
              <div className={styles.emptyState}>
                No companies tracked in this sector yet.
              </div>
            </div>
          )}

          {/* View All button */}
          {companies.length > 0 && onViewAll && (
            <div className={styles.footerSection}>
              <button
                className={styles.viewAllBtn}
                onClick={() => onViewAll(sector)}
                type="button"
              >
                View All {companyCount} Companies
                <span className={styles.viewAllArrow}>{'\u2192'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
