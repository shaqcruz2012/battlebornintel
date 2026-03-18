import { useState, useEffect } from 'react';
import { useInvestorMatches } from '../../api/hooks';
import styles from './InvestorMatches.module.css';

function similarityColor(score) {
  if (score > 0.7) return 'var(--accent-teal, #45D7C6)';
  if (score > 0.5) return 'var(--accent-gold, #FACC15)';
  return 'var(--text-disabled, #5B6170)';
}

function similarityTier(score) {
  if (score > 0.7) return 'high';
  if (score > 0.5) return 'medium';
  return 'low';
}

function SimilarityBar({ score }) {
  const pct = Math.round(score * 100);
  const color = similarityColor(score);
  return (
    <div className={styles.barContainer}>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.barLabel} style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function MatchCard({ match }) {
  const [expanded, setExpanded] = useState(false);
  const tier = similarityTier(match.similarity);
  const accentColor = similarityColor(match.similarity);

  return (
    <div
      className={`${styles.matchCard} ${styles[`tier_${tier}`]}`}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
    >
      <div className={styles.matchHeader}>
        <div className={styles.matchInfo}>
          <span className={styles.investorName}>{match.investorName}</span>
          <span className={styles.investorType}>{match.investorType}</span>
        </div>
        <SimilarityBar score={match.similarity} />
      </div>

      <div className={styles.matchMeta}>
        <span className={styles.portfolioSize}>
          {match.portfolioSize} portfolio compan{match.portfolioSize === 1 ? 'y' : 'ies'}
        </span>
        {match.portfolioOverlap.length > 0 && (
          <span className={styles.overlapCount}>
            {match.portfolioOverlap.length} in ecosystem
          </span>
        )}
      </div>

      <p className={styles.reasoning}>{match.reasoning}</p>

      {expanded && match.portfolioOverlap.length > 0 && (
        <div className={styles.overlapSection}>
          <span className={styles.overlapLabel}>Ecosystem overlap</span>
          <div className={styles.overlapList}>
            {match.portfolioOverlap.map((name) => (
              <span key={name} className={styles.overlapTag}>{name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InvestorMatches({ companyId }) {
  const { data, isLoading, error } = useInvestorMatches(companyId);

  if (!companyId) return null;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingDots}>
          <span />
          <span />
          <span />
        </div>
        <span className={styles.loadingText}>Analyzing investor graph...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.empty}>Unable to load investor matches.</div>
    );
  }

  if (!data || !data.matches || data.matches.length === 0) {
    return (
      <div className={styles.empty}>No investor matches found for this company.</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.matchList}>
        {data.matches.map((match) => (
          <MatchCard key={match.investorId} match={match} />
        ))}
      </div>
    </div>
  );
}
