import { useEffect, useCallback, useMemo } from 'react';
import { useCompany, useCompanyAnalysis } from '../../api/hooks';
import { fmt, stageLabel } from '../../engine/formatters';
import { GRADE_COLORS, STAGE_COLORS, REL_CFG } from '../../data/constants';
import { InvestorMatches } from './InvestorMatches';
import { Sparkline, generateMomentumTrail } from '../shared/Sparkline';
import styles from './CompanyDetailDrawer.module.css';

/* ── Grade color coding ── */

const GRADE_BG = {
  A:   'rgba(74, 222, 128, 0.12)',
  'A-':'rgba(134, 239, 172, 0.12)',
  'B+':'rgba(250, 204, 21, 0.12)',
  B:   'rgba(253, 224, 71, 0.12)',
  'B-':'rgba(254, 240, 138, 0.12)',
  'C+':'rgba(251, 146, 60, 0.12)',
  C:   'rgba(253, 186, 116, 0.12)',
  D:   'rgba(248, 113, 113, 0.12)',
};

function gradeStyle(grade) {
  const color = GRADE_COLORS[grade] || 'var(--text-disabled)';
  const bg    = GRADE_BG[grade]    || 'rgba(255,255,255,0.06)';
  return { color, background: bg, border: `1px solid ${color}25` };
}

function irsColor(irs) {
  if (irs >= 75) return 'var(--accent-teal)';
  if (irs >= 50) return 'var(--accent-gold)';
  if (irs >= 25) return '#FB923C';
  return '#F87171';
}

function stageStyle(stage) {
  const color = STAGE_COLORS[stage] || '#5B6170';
  return { color, background: `${color}18`, border: `1px solid ${color}30` };
}

/* ── Section label ── */

function SectionLabel({ children }) {
  return <span className={styles.sectionLabel}>{children}</span>;
}

/* ── Metric box ── */

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

/* ── Edge groups ── */

function groupEdgesByRelType(edges) {
  const groups = {};
  (edges || []).forEach((edge) => {
    const rel = edge.rel || edge.relationship || 'related';
    if (!groups[rel]) groups[rel] = [];
    groups[rel].push(edge);
  });
  return groups;
}

/* ── Loading skeleton for the drawer body ── */

function DrawerSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonSection}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: `${75 - i * 8}%` }} />
        ))}
      </div>
      <div className={styles.skeletonSection}>
        {[1, 2].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: `${60 - i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Main drawer ── */

export function CompanyDetailDrawer({ companyId, onClose }) {
  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: analysis, isLoading: analysisLoading } = useCompanyAnalysis(companyId);

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

  /* Group edges by relationship type */
  const edgeGroups = useMemo(
    () => groupEdgesByRelType(company?.edges),
    [company?.edges]
  );

  const edgeGroupEntries = useMemo(
    () => Object.entries(edgeGroups),
    [edgeGroups]
  );

  const sectors = useMemo(() => {
    if (!company?.sector) return [];
    return Array.isArray(company.sector) ? company.sector : [company.sector];
  }, [company?.sector]);

  /* Render nothing if no id (parent controls mount) */
  if (!companyId) return null;

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
        aria-label={company?.name ? `${company.name} detail` : 'Company detail'}
      >
        {companyLoading ? (
          <DrawerSkeleton />
        ) : (
          <>
            {/* ── Header ── */}
            <div className={styles.header}>
              <div className={styles.headerMeta}>
                <h2 className={styles.companyName}>{company?.name || 'Unknown Company'}</h2>
                <div className={styles.headerBadges}>
                  {company?.stage && (
                    <span className={styles.stageBadge} style={stageStyle(company.stage)}>
                      {stageLabel(company.stage)}
                    </span>
                  )}
                  {company?.city && (
                    <span className={styles.cityLabel}>
                      {'\u25CF'} {company.city}
                    </span>
                  )}
                </div>
                {sectors.length > 0 && (
                  <div className={styles.sectorList}>
                    {sectors.map((s) => (
                      <span key={s} className={styles.sectorTag}>{s}</span>
                    ))}
                  </div>
                )}
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

            {/* ── Body ── */}
            <div className={styles.body}>

              {/* Description */}
              {company?.description && (
                <div className={styles.section}>
                  <p className={styles.description}>{company.description}</p>
                </div>
              )}

              {/* ── IRS Score + Key Metrics ── */}
              <div className={styles.section}>
                <SectionLabel>Performance</SectionLabel>
                <div className={styles.metricGrid}>
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>IRS Score</span>
                    <span
                      className={styles.metricValue}
                      style={company?.irs != null ? { color: irsColor(company.irs) } : undefined}
                    >
                      {company?.irs != null ? company.irs : '\u2014'}
                    </span>
                  </div>
                  {company?.grade && (
                    <div className={styles.metricBox}>
                      <span className={styles.metricLabel}>Grade</span>
                      <span
                        className={styles.gradeValue}
                        style={gradeStyle(company.grade)}
                      >
                        {company.grade}
                      </span>
                    </div>
                  )}
                  <MetricBox
                    label="Funding"
                    value={company?.funding != null ? fmt(company.funding) : '\u2014'}
                  />
                  <MetricBox
                    label="Employees"
                    value={company?.employees}
                  />
                  <div className={styles.metricBox}>
                    <span className={styles.metricLabel}>Momentum</span>
                    <span className={styles.metricValue} style={{ display: 'flex', alignItems: 'center', gap: 6, color: company?.momentum != null ? irsColor(company.momentum) : undefined }}>
                      {company?.momentum != null ? company.momentum : '\u2014'}
                      {company?.momentum != null && (
                        <Sparkline
                          data={generateMomentumTrail(company.id || company.slug || 0, company.momentum)}
                          width={52}
                          height={18}
                          color="auto"
                          showArea={false}
                        />
                      )}
                    </span>
                  </div>
                  {company?.founded && (
                    <MetricBox label="Founded" value={company.founded} />
                  )}
                </div>
              </div>

              {/* ── Fund Eligibility ── */}
              {company?.eligible && company.eligible.length > 0 && (
                <div className={styles.section}>
                  <SectionLabel>Fund Eligibility</SectionLabel>
                  <div className={styles.eligibleList}>
                    {company.eligible.map((fund) => (
                      <span key={fund} className={styles.eligibleTag}>
                        {fund}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Potential Investors ── */}
              <div className={styles.section}>
                <SectionLabel>Potential Investors</SectionLabel>
                <InvestorMatches companyId={companyId} />
              </div>

              {/* ── Graph Edges (grouped by relationship type) ── */}
              {edgeGroupEntries.length > 0 && (
                <div className={styles.section}>
                  <SectionLabel>
                    Relationships
                    <span className={styles.sectionCount}>
                      {company.edges.length}
                    </span>
                  </SectionLabel>
                  <div className={styles.edgeGroups}>
                    {edgeGroupEntries.map(([rel, edges]) => {
                      const relCfg = REL_CFG[rel] || {};
                      const relColor = relCfg.color || 'var(--text-disabled)';
                      return (
                        <div key={rel} className={styles.edgeGroup}>
                          <div
                            className={styles.edgeGroupLabel}
                            style={{ color: relColor }}
                          >
                            {relCfg.label || rel.replace(/_/g, ' ')}
                            <span className={styles.edgeGroupCount}>{edges.length}</span>
                          </div>
                          <div className={styles.edgeList}>
                            {edges.slice(0, 12).map((edge, i) => {
                              const targetName =
                                edge.target_name ||
                                edge.target_label ||
                                edge.label ||
                                edge.target ||
                                'Unknown';
                              return (
                                <div key={i} className={styles.edgeItem}>
                                  <span
                                    className={styles.edgeDot}
                                    style={{ background: relColor }}
                                  />
                                  <span className={styles.edgeName}>{targetName}</span>
                                  {edge.note && (
                                    <span className={styles.edgeNote}>{edge.note}</span>
                                  )}
                                </div>
                              );
                            })}
                            {edges.length > 12 && (
                              <div className={styles.edgeMore}>
                                +{edges.length - 12} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── AI Analysis ── */}
              <div className={styles.section}>
                <SectionLabel>AI Analysis</SectionLabel>
                {analysisLoading ? (
                  <div className={styles.analysisLoading}>Loading analysis&hellip;</div>
                ) : analysis ? (
                  <div className={styles.analysisBody}>
                    {analysis.summary && (
                      <p className={styles.analysisSummary}>{analysis.summary}</p>
                    )}
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div className={styles.analysisList}>
                        <span className={styles.analysisListLabel}>Strengths</span>
                        <ul className={styles.bulletList}>
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className={styles.bulletItem}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.risks && analysis.risks.length > 0 && (
                      <div className={styles.analysisList}>
                        <span className={styles.analysisListLabel} style={{ color: '#FB923C' }}>
                          Risks
                        </span>
                        <ul className={styles.bulletList}>
                          {analysis.risks.map((r, i) => (
                            <li key={i} className={styles.bulletItem}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.recommendation && (
                      <div className={styles.recommendation}>
                        <span className={styles.recommendationLabel}>Recommendation</span>
                        <p className={styles.recommendationText}>{analysis.recommendation}</p>
                      </div>
                    )}
                    {/* Fallback: render raw text if it's a plain string */}
                    {typeof analysis === 'string' && (
                      <p className={styles.analysisSummary}>{analysis}</p>
                    )}
                  </div>
                ) : (
                  <div className={styles.analysisEmpty}>No analysis available.</div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}
