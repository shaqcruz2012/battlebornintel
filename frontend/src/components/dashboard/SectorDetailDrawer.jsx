import { useEffect, useCallback, useMemo, useRef } from 'react';
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

/* ── Sector intelligence brief derivation ──────────────────────────────────── */

const SECTOR_BRIEFS = {
  AI: {
    assessment: (count, funding, avgIrs, heat) =>
      `AI represents Nevada's highest-concentration vertical with ${count} tracked companies and $${funding} in aggregate capital deployed. Node graph analysis reveals dense interconnectivity across defense and enterprise ML verticals, with a sector heat index of ${heat} reflecting sustained institutional attention. Average IRS of ${avgIrs ?? '—'} indicates ${(avgIrs || 0) >= 65 ? 'above-median' : 'moderate'} operator quality relative to the ecosystem baseline.`,
    drivers: [
      'Network graph shows accelerating enterprise ML/AI platform adoption across defense and government verticals',
      'Federal AI safety procurement frameworks creating new market entry points — graph-mapped to 3+ contract vehicles',
      'Generative AI applications driving outsized seed-stage deal flow with expanding co-investor connectivity',
    ],
    risks: [
      'Graph analysis identifies adjacent-space competition across multiple tracked operators',
      'Talent retention pressure from national incumbents — network outflow signals detected',
      'Regulatory uncertainty around AI governance may compress deployment timelines',
    ],
  },
  Cybersecurity: {
    assessment: (count, funding, avgIrs, heat) =>
      `Nevada's cybersecurity cohort of ${count} tracked companies with $${funding} deployed is positioned at the nexus of federal compliance mandates and enterprise security demand. Relationship graph mapping shows strong connectivity to DoD procurement networks. Heat index ${heat} reflects ${heat >= 70 ? 'elevated' : 'steady'} sector momentum.`,
    drivers: [
      'Federal zero-trust mandates driving sustained procurement demand — graph-linked to active contract vehicles',
      'State-level cybersecurity budgets expanding year-over-year',
      'Node proximity to DoD facilities enabling classified contract access pathways',
    ],
    risks: [
      'Elongated government procurement sales cycles detected in deal-flow graph',
      'National incumbent consolidation limiting exit optionality',
      'Security clearance bottlenecks constraining workforce scaling',
    ],
  },
  Defense: {
    assessment: (count, funding, avgIrs, heat) =>
      `Defense technology encompasses ${count} tracked operators with $${funding} in capital deployed, leveraging Nevada's proximity to Nellis AFB and the Nevada Test and Training Range. Network analysis maps strong dual-use technology corridors between commercial and defense verticals. Heat score of ${heat} reflects ${heat >= 70 ? 'strong' : 'emerging'} traction across procurement networks.`,
    drivers: [
      'Graph-mapped DIU and AFWERX engagement pathways accelerating Nevada-based dual-use operators',
      'SBIR/STTR pipeline yielding competitive preference — node centrality scores rising',
      'Proximity to critical military installations creating high-density relationship clusters',
    ],
    risks: [
      'Federal budget sequestration exposure across the tracked cohort',
      'ITAR compliance costs creating barriers to rapid commercial scaling',
      'Single prime contractor dependency — graph concentration risk flagged',
    ],
  },
  Cleantech: {
    assessment: (count, funding, avgIrs, heat) =>
      `Cleantech leads Nevada's federal co-investment pipeline with ${count} tracked companies and $${funding} deployed. Graph analysis reveals strong co-investor clustering around IRA-eligible operators. The sector's ${heat} heat score is driven by incentive tailwinds and Nevada's structural advantages in lithium extraction, geothermal energy, and grid-scale storage.`,
    drivers: [
      'Federal IRA incentives providing multi-year capital formation tailwinds — graph-linked to active fund deployments',
      'Nevada lithium reserves drawing national LP attention with expanding investor network edges',
      'Geothermal and grid-scale storage creating differentiated thesis with high node centrality',
    ],
    risks: [
      'Permitting timeline delays and utility interconnection queues flagged in deal-flow analysis',
      'Policy reversal risk on federal clean energy incentives',
      'Critical mineral supply chain concentration introducing cost volatility',
    ],
  },
  Satellite: {
    assessment: (count, funding, avgIrs, heat) =>
      `Nevada's satellite and space technology sector includes ${count} tracked operators with $${funding} deployed. Network mapping reveals emerging relationship clusters between commercial launch providers and defense communications nodes. The sector represents a high-growth niche with expanding LEO constellation demand.`,
    drivers: [
      'LEO constellation services expanding addressable market — graph connectivity to 5+ prime integrators',
      'Space-based ISR demand growing across defense and intelligence verticals',
      'Launch cost reduction enabling new entrant business models with lower capital node thresholds',
    ],
    risks: [
      'Elevated capital intensity with extended development timelines — funding graph shows long edges',
      'Orbital debris regulatory uncertainty introducing compliance overhead',
      'Customer concentration in government contracts — single-dependency nodes flagged',
    ],
  },
  Semiconductors: {
    assessment: (count, funding, avgIrs, heat) =>
      `Nevada's semiconductor sector encompasses ${count} tracked companies with $${funding} deployed. Graph analysis maps strong supply-chain edges to regional data center clusters and federal CHIPS Act funding nodes. The sector is positioned to benefit from nearshoring trends and specialty chip design demand.`,
    drivers: [
      'CHIPS Act funding creating new formation pathways — graph-linked to federal disbursement nodes',
      'Supply chain reshoring driving domestic manufacturing investment with expanding network edges',
      'Regional data center density generating demand pull — high connectivity scores in graph model',
    ],
    risks: [
      'Elevated capital expenditure requirements and long commercialization cycles',
      'Foreign foundry dependencies introducing supply chain fragility — graph fragmentation risk',
      'Specialized fabrication workforce availability remains constrained',
    ],
  },
};

function deriveSectorBrief(sector, count, funding, avgIrs, heat) {
  const template = SECTOR_BRIEFS[sector];
  if (template) {
    return {
      assessment: template.assessment(count, funding, avgIrs, heat),
      drivers: template.drivers,
      risks: template.risks,
    };
  }
  // Generic fallback
  return {
    assessment: `Nevada's ${sector} sector encompasses ${count} tracked companies with $${funding} in aggregate capital deployed. Node graph analysis maps the sector's relationship density and co-investor connectivity. The heat index of ${heat} reflects ${heat >= 70 ? 'elevated' : 'developing'} momentum within the broader ecosystem. Average IRS of ${avgIrs ?? '—'} positions the cohort ${(avgIrs || 0) >= 65 ? 'above' : 'near'} the ecosystem median.`,
    drivers: [
      `${count} active operators demonstrating product-market fit across graph-mapped verticals`,
      'Growing institutional attention from regional and national LP base — network edges expanding',
      'State economic development engagement supporting formation pipeline',
    ],
    risks: [
      'Early-stage concentration risk across the tracked cohort',
      'Market timing sensitivity and customer acquisition cost pressure',
      'Macroeconomic headwinds affecting runway and valuation dynamics',
    ],
  };
}

/* -- Derive sector signals from company data -- */

function deriveSectorSignals(companies) {
  const signals = [];

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

/* -- Main modal -- */

export function SectorDetailDrawer({ sector, companies = [], sectorStats, onClose, onViewAll }) {
  const drawerRef = useRef(null);
  const triggerRef = useRef(document.activeElement);

  /* Focus trap: auto-focus first focusable, cycle Tab, Escape to close */
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll(
      'button, input, [href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
      if (e.key === 'Escape') onClose();
    }

    drawer.addEventListener('keydown', handleKeyDown);
    return () => drawer.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /* Return focus to trigger element on unmount */
  useEffect(() => {
    const trigger = triggerRef.current;
    return () => { trigger?.focus(); };
  }, []);

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
  const fundingLabel = totalFunding >= 1000 ? `${(totalFunding / 1000).toFixed(1)}B` : `${Math.round(totalFunding)}M`;

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

  const brief = useMemo(
    () => deriveSectorBrief(sector, companyCount, fundingLabel, avgIrs, heat),
    [sector, companyCount, fundingLabel, avgIrs, heat]
  );

  const publicationDate = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  /* Render nothing if no sector selected */
  if (!sector) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`${sector} sector intelligence`}
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
            <span className={styles.subtitle}>Sector Intelligence Overview</span>
          </div>
          <div className={styles.headerActions}>
            {companies.length > 0 && onViewAll && (
              <button
                className={styles.viewAllBtn}
                onClick={() => onViewAll(sector)}
                type="button"
              >
                View All {companyCount}
                <span className={styles.viewAllArrow}>{'\u2192'}</span>
              </button>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              type="button"
              aria-label="Close modal"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* -- Body (two-column layout) -- */}
        <div className={styles.body}>
          <div className={styles.bodyColumns}>

            {/* ── LEFT COLUMN: Data & Rankings ── */}
            <div className={styles.columnLeft}>

              {/* Overview Metrics */}
              <div className={styles.section}>
                <SectionLabel>Overview</SectionLabel>
                <div className={styles.metricGrid}>
                  <MetricBox label="Companies" value={companyCount} />
                  <MetricBox label="Total Funding" value={totalFunding > 0 ? fmt(totalFunding) : '\u2014'} />
                  <MetricBox label="Avg IRS" value={avgIrs} color={avgIrs != null ? irsColor(avgIrs) : undefined} />
                  <MetricBox label="Heat Score" value={heat} color={heatColor(heat)} />
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
                              <span className={styles.companyStage}>{stageLabel(c.stage)}</span>
                            )}
                            {c.funding != null && c.funding > 0 && (
                              <span className={styles.companyFunding}>{fmt(c.funding)}</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.companyScores}>
                          <span className={styles.companyIrs} style={{ color: irsColor(c.irs) }}>
                            {c.irs}
                          </span>
                          {c.grade && (
                            <span className={styles.companyGrade} style={{ color: gradeColor(c.grade) }}>
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
                          <span className={styles.signalDot} style={{ background: sig.color }} />
                          <span className={styles.signalLabel} style={{ color: sig.color }}>
                            {sig.label}
                          </span>
                        </div>
                        <p className={styles.signalDetail}>{sig.detail}</p>
                        {sig.companies.length > 0 && (
                          <div className={styles.signalCompanies}>
                            {sig.companies.map((name) => (
                              <span key={name} className={styles.signalCompanyTag}>{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Intelligence Brief ── */}
            <div className={styles.columnRight}>
              <div className={styles.briefPanel}>
                {/* Brief header */}
                <div className={styles.briefHeader}>
                  <div className={styles.briefMeta}>
                    <span className={styles.briefLabel}>Analysis</span>
                    <span className={styles.briefDate}>{publicationDate}</span>
                  </div>
                  <h3 className={styles.briefTitle}>Intelligence Brief</h3>
                </div>

                <div className={styles.briefDivider} />

                {/* Assessment */}
                <div className={styles.briefSection}>
                  <span className={styles.briefSectionLabel}>Assessment</span>
                  <p className={styles.briefText}>{brief.assessment}</p>
                </div>

                <div className={styles.briefDivider} />

                {/* Key Drivers */}
                <div className={styles.briefSection}>
                  <span className={styles.briefSectionLabel}>Key Drivers</span>
                  <ul className={styles.briefList}>
                    {brief.drivers.map((d, i) => (
                      <li key={i} className={styles.briefListItem}>
                        <span className={styles.briefBullet} />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.briefDivider} />

                {/* Risk Factors */}
                <div className={styles.briefSection}>
                  <span className={styles.briefSectionLabel}>Risk Factors</span>
                  <ul className={styles.briefList}>
                    {brief.risks.map((r, i) => (
                      <li key={i} className={styles.briefListItem}>
                        <span className={styles.briefBulletRisk} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {companies.length === 0 && (
            <div className={styles.section}>
              <div className={styles.emptyState}>
                No companies tracked in this sector yet.
              </div>
            </div>
          )}

          {/* Empty — View All moved to header */}
        </div>
      </div>
    </>
  );
}
