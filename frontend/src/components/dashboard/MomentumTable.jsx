import { memo, useMemo, useRef, useEffect, useState } from 'react';
import { MomentumRow } from './MomentumRow';
import { Tooltip } from '../shared/Tooltip';
import styles from './MomentumTable.module.css';

const SORTS = [
  { value: 'prediction', label: 'Predict' },
  { value: 'irs', label: 'IRS' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'name', label: 'A-Z' },
];

const METHODOLOGY_TEXT =
  'Ranks companies by predicted likelihood of advancing to next funding stage within 12 months. ' +
  'Score combines current performance (40%) with forward-looking signals: trend trajectory, ' +
  'forecast confidence, and network position (60%).';

const SCORE_TOOLTIP =
  'Prediction Score: 40% IRS (backward-looking heuristic) + 60% Forward Score ' +
  '(trend 40%, confidence 20%, causal 15%, network 15%, survival 10%). ' +
  'When forward data is unavailable, IRS is stage-adjusted to produce meaningful spread.';

// Stage adjustment multipliers for when forward_score is null
const STAGE_MULTIPLIERS = {
  pre_seed: 0.70,
  seed: 0.85,
  series_a: 1.0,
  series_b: 1.0,
  series_c_plus: 1.0,
  growth: 1.0,
};

// Compute the display prediction score for a company
function computePredictionScore(company) {
  const irs = company.irs || 0;
  const forward = company.forward_score;

  if (forward != null && typeof forward === 'number') {
    // Weighted blend: 40% IRS + 60% forward
    return Math.round(0.4 * irs + 0.6 * forward);
  }

  // Fallback: stage-adjusted IRS for spread
  const multiplier = STAGE_MULTIPLIERS[company.stage] || 0.85;
  return Math.round(irs * multiplier);
}

// Compute confidence percentage
function computeConfidence(company) {
  // Priority 1: forward_components.confidence
  if (company.forward_components?.confidence != null) {
    return Math.round(company.forward_components.confidence);
  }

  // Priority 2: compute from data completeness
  const fields = [
    company.irs, company.momentum, company.funding,
    company.employees, company.description, company.stage,
    company.city, company.sector?.length > 0 ? true : null,
    company.eligible?.length > 0 ? true : null,
    company.dims,
  ];
  const filled = fields.filter(f => f != null && f !== 0 && f !== '').length;
  return Math.round((filled / fields.length) * 100);
}

// Assign quintile color class based on rank position
function quintileClass(rank, total) {
  const pct = rank / total;
  if (pct <= 0.2) return 'quintileTeal';
  if (pct <= 0.4) return 'quintileGreen';
  if (pct <= 0.6) return 'quintileYellow';
  return 'quintileGray';
}

// Limit to top 10
const MAX_DISPLAY = 10;

// Virtual window configuration
const ROW_HEIGHT = 28;
const BUFFER_SIZE = 3;

export const MomentumTable = memo(function MomentumTable({ companies, sortBy, onSortChange, isFetching, error }) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: MAX_DISPLAY });

  // Enrich and sort companies by prediction score
  const enriched = useMemo(() => {
    const arr = companies.map(c => ({
      ...c,
      predictionScore: computePredictionScore(c),
      confidence: computeConfidence(c),
    }));

    // Sort by active criteria
    const effectiveSort = sortBy === 'prediction' || !sortBy ? 'prediction' : sortBy;
    if (effectiveSort === 'prediction') {
      arr.sort((a, b) => b.predictionScore - a.predictionScore);
    } else if (effectiveSort === 'irs') {
      arr.sort((a, b) => (b.irs || 0) - (a.irs || 0));
    } else if (effectiveSort === 'momentum') {
      arr.sort((a, b) => (b.momentum || 0) - (a.momentum || 0));
    } else if (effectiveSort === 'name') {
      arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return arr.slice(0, MAX_DISPLAY);
  }, [companies, sortBy]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.max(0, Math.floor((scrollTop - ROW_HEIGHT * BUFFER_SIZE) / ROW_HEIGHT));
      const end = Math.min(
        enriched.length,
        Math.ceil((scrollTop + viewportHeight + ROW_HEIGHT * BUFFER_SIZE) / ROW_HEIGHT)
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [enriched.length]);

  const topSpacerHeight = visibleRange.start * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (enriched.length - visibleRange.end) * ROW_HEIGHT);
  const totalHeight = enriched.length * ROW_HEIGHT;

  const visibleCompanies = useMemo(() => {
    return enriched.slice(visibleRange.start, visibleRange.end).map((c, i) => ({
      company: c,
      rank: visibleRange.start + i + 1,
    }));
  }, [enriched, visibleRange]);

  // Map sortBy=prediction to the internal sort handler
  const handleSortChange = (val) => {
    // For "prediction" sort, pass it through; the API sort falls back to irs
    onSortChange(val === 'prediction' ? 'irs' : val);
  };

  // Determine active sort display
  const activeSortDisplay = (!sortBy || sortBy === 'irs') ? 'prediction' : sortBy;

  return (
    <div className={styles.wrapper} role="table" aria-label="Prediction leaderboard table">
      {/* Methodology header */}
      <div className={styles.methodologyHeader}>
        <span className={styles.methodologyText}>{METHODOLOGY_TEXT}</span>
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>
          Prediction Leaderboard
          {isFetching && <span className={styles.fetchingDot} title="Updating..." />}
          <span className={styles.countBadge}>Top {enriched.length}</span>
        </h2>
        <div className={styles.sortControls}>
          {SORTS.map((s) => (
            <button
              key={s.value}
              className={`${styles.sortBtn} ${activeSortDisplay === s.value ? styles.sortActive : ''}`}
              onClick={() => {
                if (s.value === 'prediction') {
                  onSortChange('irs');
                } else {
                  onSortChange(s.value);
                }
              }}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.colHeaders} role="row">
        <span role="columnheader">Company</span>
        <span className={styles.hideMobile} role="columnheader">Stage</span>
        <Tooltip title="Prediction Score" text={SCORE_TOOLTIP} position="below">
          <span className={styles.headerWithTip} role="columnheader">Score</span>
        </Tooltip>
        <span role="columnheader">Conf.</span>
        <span role="columnheader">Trend</span>
        <span role="columnheader">Type</span>
      </div>

      {error ? (
        <div className={styles.empty} role="alert">
          Unable to load prediction data. Try refreshing.
        </div>
      ) : enriched.length === 0 ? (
        <div className={styles.empty}>No companies match current filters</div>
      ) : (
        <div
          ref={containerRef}
          className={styles.virtualContainer}
          role="rowgroup"
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {topSpacerHeight > 0 && (
              <div style={{ height: `${topSpacerHeight}px` }} />
            )}

            {visibleCompanies.map(({ company: c, rank }) => (
              <MomentumRow
                key={c.id}
                company={c}
                rank={rank}
                quintile={quintileClass(rank, enriched.length)}
                totalCount={enriched.length}
              />
            ))}

            {bottomSpacerHeight > 0 && (
              <div style={{ height: `${bottomSpacerHeight}px` }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
});
