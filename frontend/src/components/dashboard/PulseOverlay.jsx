import { memo } from 'react';
import styles from './PulseOverlay.module.css';

const TIER_CLASS = {
  LOW: styles.tierLow,
  MODERATE: styles.tierModerate,
  HIGH: styles.tierHigh,
};

export const PulseOverlay = memo(function PulseOverlay({ score, tier }) {
  return (
    <div className={`${styles.readout} ${TIER_CLASS[tier] || styles.tierLow}`}>
      PULSE <span className={styles.score}>{score}</span> // {tier}
    </div>
  );
});
