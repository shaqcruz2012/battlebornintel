import styles from './PulseOverlay.module.css';

export function PulseOverlay({ velocity, tier, cssVars }) {
  return (
    <div className={styles.pulseReadout} style={cssVars}>
      <span className={styles.pulseDot} />
      <span className={styles.pulseLabel}>PULSE</span>
      <span className={styles.pulseScore}>{velocity}</span>
      <span className={styles.pulseSeparator}>//</span>
      <span className={styles.pulseTier}>{tier}</span>
    </div>
  );
}
