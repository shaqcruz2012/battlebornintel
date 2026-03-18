import { useState, memo, useMemo } from 'react';
import { fmt, stageLabel } from '../../engine/formatters';
import { GRADE_COLORS, TRIGGER_CFG } from '../../data/constants';
import { StatusBadge } from '../shared/StatusBadge';
import { Sparkline, generateMomentumTrail } from '../shared/Sparkline';
import styles from './MomentumRow.module.css';

const DIM_LABELS = {
  momentum: 'Momentum',
  funding_velocity: 'Funding Vel.',
  market_timing: 'Market',
  hiring: 'Hiring',
  data_quality: 'Data Quality',
  network: 'Network',
  team: 'Team',
};

const ExpandedContent = memo(function ExpandedContent({ company }) {
  const c = company;
  // Memoize trigger configuration lookups
  const triggerConfigs = useMemo(() => {
    if (!c.triggers || c.triggers.length === 0) return [];
    return c.triggers.map((t) => ({
      id: t,
      cfg: TRIGGER_CFG[t],
    })).filter(t => t.cfg);
  }, [c.triggers]);

  return (
    <div className={styles.expandedContent}>
      {c.description && (
        <p className={styles.description}>{c.description}</p>
      )}

      {c.dims && (
        <div className={styles.dims}>
          {Object.entries(c.dims).map(([key, val]) => (
            <div key={key} className={styles.dim}>
              <span className={styles.dimLabel}>
                {DIM_LABELS[key] || key}
              </span>
              <div className={styles.dimBar}>
                <div
                  className={styles.dimFill}
                  style={{
                    width: `${val}%`,
                    background:
                      val >= 70
                        ? 'var(--accent-teal)'
                        : val >= 40
                          ? 'var(--accent-gold)'
                          : 'var(--status-risk)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {triggerConfigs.length > 0 && (
        <div className={styles.triggers}>
          {triggerConfigs.map(({ id, cfg }) => (
            <StatusBadge
              key={id}
              variant={
                cfg.color.includes('EF44') || cfg.color.includes('F971')
                  ? 'risk'
                  : cfg.color.includes('F59E') || cfg.color.includes('F973')
                    ? 'warning'
                    : 'success'
              }
            >
              {cfg.label}
            </StatusBadge>
          ))}
        </div>
      )}
    </div>
  );
});

export const MomentumRow = memo(function MomentumRow({ company, rank }) {
  const [open, setOpen] = useState(false);
  const c = company;

  // Memoize grade color lookup
  const gradeColor = useMemo(
    () => GRADE_COLORS[c.grade] || 'var(--text-disabled)',
    [c.grade]
  );

  const sparkData = useMemo(
    () => c.momentum != null ? generateMomentumTrail(c.id || c.slug || rank, c.momentum) : [],
    [c.id, c.slug, c.momentum, rank]
  );

  return (
    <div className={styles.row}>
      <div className={styles.summary} onClick={() => setOpen(!open)}>
        <div className={styles.nameGroup}>
          <span className={styles.rank}>{rank}</span>
          <div>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.city}> {c.city}</span>
          </div>
        </div>

        <div className={`${styles.metric} ${styles.hideMobile}`}>
          <span className={styles.metricLabel}>Stage</span>
          {stageLabel(c.stage)}
        </div>

        <div className={`${styles.metric} ${styles.hideMobile}`}>
          <span className={styles.metricLabel}>Funding</span>
          {fmt(c.funding)}
        </div>

        <div className={styles.metric}>
          <span className={styles.metricLabel}>IRS</span>
          {c.irs || '—'}
        </div>

        <div className={styles.metric} style={{ display: 'flex', justifyContent: 'center' }}>
          <Sparkline data={sparkData} width={48} height={16} color="auto" showArea={false} />
        </div>

        <span
          className={styles.grade}
          style={{ color: gradeColor }}
        >
          {c.grade || '—'}
        </span>

        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          ▾
        </span>
      </div>

      {open && <ExpandedContent company={c} />}
    </div>
  );
});
