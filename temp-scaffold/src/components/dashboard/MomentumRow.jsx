import { useState } from 'react';
import { fmt, stageLabel } from '../../engine/formatters';
import { GRADE_COLORS, TRIGGER_CFG } from '../../data/constants';
import { StatusBadge } from '../shared/StatusBadge';
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

export function MomentumRow({ company, rank }) {
  const [open, setOpen] = useState(false);
  const c = company;

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

        <span
          className={styles.grade}
          style={{ color: GRADE_COLORS[c.grade] || 'var(--text-disabled)' }}
        >
          {c.grade || '—'}
        </span>

        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          ▾
        </span>
      </div>

      {open && (
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

          {c.triggers && c.triggers.length > 0 && (
            <div className={styles.triggers}>
              {c.triggers.map((t) => {
                const cfg = TRIGGER_CFG[t];
                return cfg ? (
                  <StatusBadge
                    key={t}
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
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
