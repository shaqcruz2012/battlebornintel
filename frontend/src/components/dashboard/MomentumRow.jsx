import { useState, memo, useMemo } from 'react';
import { stageLabel } from '../../engine/formatters';
import { TRIGGER_CFG } from '../../data/constants';
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

// Short stage labels for badge
const STAGE_SHORT = {
  pre_seed: 'PS',
  seed: 'SD',
  series_a: 'A',
  series_b: 'B',
  series_c_plus: 'C+',
  growth: 'GR',
};

// Quintile color map for the score bar
const QUINTILE_COLORS = {
  quintileTeal: 'var(--accent-teal)',
  quintileGreen: '#22c55e',
  quintileYellow: '#eab308',
  quintileGray: 'rgba(255,255,255,0.15)',
};

function ScoreBreakdownTooltip({ company }) {
  const c = company;
  const hasForward = c.forward_score != null && c.forward_components;

  if (!hasForward) {
    return (
      <div className={styles.tooltipContent}>
        <div className={styles.tooltipTitle}>Score Breakdown</div>
        <div className={styles.tooltipRow}>
          <span>IRS (heuristic)</span>
          <span>{c.irs || 0}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span>Stage adj.</span>
          <span>{c.stage ? stageLabel(c.stage) : '--'}</span>
        </div>
        <div className={styles.tooltipDivider} />
        <div className={styles.tooltipNote}>
          No forward model data. Score is stage-adjusted IRS.
        </div>
      </div>
    );
  }

  const fc = c.forward_components;
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipTitle}>Score Breakdown</div>
      <div className={styles.tooltipRow}>
        <span>IRS (40%)</span>
        <span>{c.irs || 0}</span>
      </div>
      <div className={styles.tooltipDivider} />
      <div className={styles.tooltipSubtitle}>Forward Score (60%)</div>
      <div className={styles.tooltipRow}>
        <span>Trend (40%)</span>
        <span>{fc.trend ?? '--'}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Confidence (20%)</span>
        <span>{fc.confidence ?? '--'}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Causal (15%)</span>
        <span>{fc.causal ?? '--'}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Network (15%)</span>
        <span>{fc.network ?? '--'}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Survival (10%)</span>
        <span>{fc.survival ?? '--'}</span>
      </div>
      <div className={styles.tooltipDivider} />
      <div className={styles.tooltipRow}>
        <span><strong>Forward</strong></span>
        <span><strong>{c.forward_score}</strong></span>
      </div>
    </div>
  );
}

const ExpandedContent = memo(function ExpandedContent({ company }) {
  const c = company;
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
          {Object.entries(c.dims).map(([key, val]) => {
            const clamped = Math.min(Math.max(val ?? 0, 0), 100);
            return (
              <div key={key} className={styles.dim}>
                <span className={styles.dimLabel}>
                  {DIM_LABELS[key] || key}
                </span>
                <div className={styles.dimBar}>
                  <div
                    className={styles.dimFill}
                    style={{
                      width: `${clamped}%`,
                      background:
                        clamped >= 70
                          ? 'var(--accent-teal)'
                          : clamped >= 40
                            ? 'var(--accent-gold)'
                            : 'var(--status-risk)',
                    }}
                  />
                </div>
              </div>
            );
          })}
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

export const MomentumRow = memo(function MomentumRow({ company, rank, quintile, totalCount }) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const c = company;

  const sparkData = useMemo(
    () => c.momentum != null ? generateMomentumTrail(c.id || c.slug || rank, c.momentum) : [],
    [c.id, c.slug, c.momentum, rank]
  );

  const scoreColor = QUINTILE_COLORS[quintile] || QUINTILE_COLORS.quintileGray;
  const barWidth = Math.min(c.predictionScore || 0, 100);
  const stageShort = STAGE_SHORT[c.stage] || (c.stage ? c.stage.slice(0, 2).toUpperCase() : '--');
  const scoreTypeLabel = c.score_type === 'blended' ? 'BLD' : 'HEU';

  // Confidence color
  const confVal = c.confidence || 0;
  const confColor = confVal >= 70 ? 'var(--accent-teal)' : confVal >= 40 ? 'var(--accent-gold)' : 'var(--status-risk)';

  return (
    <div className={styles.row} role="row">
      <div
        className={styles.summary}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        {/* Company name + stage badge */}
        <div className={styles.nameGroup} role="cell">
          <span className={styles.rank}>{rank}</span>
          <span className={styles.stageBadge} title={stageLabel(c.stage)}>
            {stageShort}
          </span>
          <div>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.city}> {c.city}</span>
          </div>
        </div>

        {/* Stage (mobile hidden) */}
        <div className={`${styles.metric} ${styles.hideMobile}`} role="cell">
          <span className={styles.metricLabel}>Stage</span>
          {stageLabel(c.stage)}
        </div>

        {/* Prediction Score with bar */}
        <div className={styles.scoreCell} role="cell">
          <span className={styles.scoreValue} style={{ color: scoreColor }}>
            {c.predictionScore || '--'}
          </span>
          <div className={styles.scoreBarTrack}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${barWidth}%`, background: scoreColor }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div className={styles.metric} role="cell">
          <span style={{ color: confColor }}>{confVal}%</span>
        </div>

        {/* Trend sparkline */}
        <div className={styles.metric} role="cell" style={{ display: 'flex', justifyContent: 'center' }}>
          <Sparkline data={sparkData} width={48} height={16} color="auto" showArea={false} />
        </div>

        {/* Score type indicator */}
        <div className={styles.metric} role="cell">
          <span className={`${styles.typeBadge} ${c.score_type === 'blended' ? styles.typeBlended : styles.typeHeuristic}`}>
            {scoreTypeLabel}
          </span>
        </div>
      </div>

      {/* Score breakdown tooltip on hover */}
      {showTooltip && (
        <div className={styles.scoreTooltip}>
          <ScoreBreakdownTooltip company={c} />
        </div>
      )}

      {open && <ExpandedContent company={c} />}
    </div>
  );
});
