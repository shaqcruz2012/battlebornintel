import { memo, useMemo } from 'react';
import { fmt, stageLabel } from '../../engine/formatters';
import { TRIGGER_CFG, GRADE_COLORS, STAGE_COLORS } from '../../data/constants';
import { Sparkline, generateMomentumTrail } from '../shared/Sparkline';
import styles from './CompaniesView.module.css';

const DIM_LABELS = {
  momentum: 'Momentum',
  funding_velocity: 'Funding Vel.',
  market_timing: 'Market',
  hiring: 'Hiring',
  data_quality: 'Data Quality',
  network: 'Network',
  team: 'Team',
};

const GRADE_CLASS_MAP = {
  A: styles.gradeA,
  'A-': styles.gradeA,
  'B+': styles.gradeB,
  B: styles.gradeB,
  'B-': styles.gradeB,
  'C+': styles.gradeC,
  C: styles.gradeC,
  D: styles.gradeD,
};

function getGradeClass(grade) {
  return GRADE_CLASS_MAP[grade] || '';
}

function getStageStyle(stage) {
  const color = STAGE_COLORS[stage] || '#5B6170';
  return {
    color,
    background: `${color}18`,
    border: `1px solid ${color}30`,
  };
}

function dimFillColor(val) {
  if (val >= 70) return 'var(--accent-teal)';
  if (val >= 40) return 'var(--accent-gold)';
  return 'var(--status-risk)';
}

const ExpandedDetail = memo(function ExpandedDetail({ company }) {
  const c = company;

  const triggerConfigs = useMemo(() => {
    if (!c.triggers || c.triggers.length === 0) return [];
    return c.triggers
      .map((t) => ({ id: t, cfg: TRIGGER_CFG[t] }))
      .filter((t) => t.cfg);
  }, [c.triggers]);

  const dimEntries = useMemo(() => {
    if (!c.dims) return [];
    return Object.entries(c.dims);
  }, [c.dims]);

  return (
    <tr className={styles.expandedRow}>
      <td colSpan={9}>
        <div className={styles.expandedInner}>
          {c.description && (
            <p className={styles.description}>{c.description}</p>
          )}

          {c.eligible && c.eligible.length > 0 && (
            <details className={styles.detailSection}>
              <summary className={styles.detailLabel}>Fund Opportunities ({c.eligible.length})</summary>
              <div className={styles.eligibleList}>
                {c.eligible.map((fund) => (
                  <span key={fund} className={styles.eligibleTag} style={{opacity: 0.7}}>
                    {fund}
                  </span>
                ))}
              </div>
            </details>
          )}

          {triggerConfigs.length > 0 && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Triggers</span>
              <div className={styles.triggerList}>
                {triggerConfigs.map(({ id, cfg }) => (
                  <span
                    key={id}
                    className={styles.triggerBadge}
                    style={{
                      color: cfg.color,
                      background: `${cfg.color}18`,
                      border: `1px solid ${cfg.color}30`,
                    }}
                  >
                    {cfg.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dimEntries.length > 0 && (
            <div className={styles.detailSection} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.detailLabel}>Dimension Scores</span>
              <div className={styles.dimGrid}>
                {dimEntries.map(([key, val]) => (
                  <div key={key} className={styles.dimItem}>
                    <span className={styles.dimLabel}>
                      {DIM_LABELS[key] || key}
                    </span>
                    <div className={styles.dimBar}>
                      <div
                        className={styles.dimFill}
                        style={{
                          width: `${val}%`,
                          background: dimFillColor(val),
                        }}
                      />
                    </div>
                    <span className={styles.dimValue}>{val.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

export const CompanyRow = memo(function CompanyRow({ company, isExpanded, onToggle, onViewDetail }) {
  const c = company;

  const gradeClass = useMemo(() => getGradeClass(c.grade), [c.grade]);
  const stageStyle = useMemo(() => getStageStyle(c.stage), [c.stage]);

  const gradeColor = useMemo(
    () => GRADE_COLORS[c.grade] || 'var(--text-disabled)',
    [c.grade]
  );

  const sparkData = useMemo(
    () => c.momentum != null ? generateMomentumTrail(c.id || c.slug || 0, c.momentum) : [],
    [c.id, c.slug, c.momentum]
  );

  const primarySectors = useMemo(() => {
    if (!c.sector) return [];
    return Array.isArray(c.sector) ? c.sector.slice(0, 3) : [c.sector];
  }, [c.sector]);

  return (
    <>
      <tr
        className={`${styles.tr} ${isExpanded ? styles.expanded : ''}`}
        onClick={onToggle}
      >
        <td className={styles.td}>
          <span className={styles.name}>{c.name}</span>
        </td>
        <td className={`${styles.td} ${styles.numeric}`}>
          {c.irs != null ? (
            <span style={{ color: gradeColor }}>{c.irs}</span>
          ) : (
            '\u2014'
          )}
        </td>
        <td className={styles.td}>
          {c.grade ? (
            <span className={`${styles.grade} ${gradeClass}`}>{c.grade}</span>
          ) : (
            '\u2014'
          )}
        </td>
        <td className={`${styles.td} ${styles.colStage}`}>
          <span className={styles.stage} style={stageStyle}>
            {stageLabel(c.stage)}
          </span>
        </td>
        <td className={`${styles.td} ${styles.numeric} ${styles.colFunding}`}>
          {fmt(c.funding)}
        </td>
        <td className={`${styles.td} ${styles.numeric} ${styles.colMomentum}`}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {c.momentum != null ? c.momentum : '\u2014'}
            <Sparkline data={sparkData} width={40} height={14} color="auto" showArea={false} strokeWidth={1.2} />
          </span>
        </td>
        <td className={`${styles.td} ${styles.colCity}`}>
          {c.city || '\u2014'}
        </td>
        <td className={`${styles.td} ${styles.colSectors}`}>
          <div className={styles.sectorWrap}>
            {primarySectors.map((s) => (
              <span key={s} className={styles.sectorTag}>
                {s}
              </span>
            ))}
          </div>
        </td>
        <td className={styles.td} style={{ width: 72, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {onViewDetail && (
              <button
                className={styles.viewBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(company.id || company.slug);
                }}
                type="button"
                title="View detail"
              >
                View
              </button>
            )}
            <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
              &#x25BE;
            </span>
          </div>
        </td>
      </tr>
      {isExpanded && <ExpandedDetail company={c} />}
    </>
  );
});
