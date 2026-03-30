import { memo } from 'react';
import styles from './SignalStrengthBars.module.css';

function tierFromIrs(irs) {
  if (irs >= 85) return { filled: 5, color: '#4ADE80' };
  if (irs >= 72) return { filled: 4, color: '#86EFAC' };
  if (irs >= 58) return { filled: 3, color: '#FACC15' };
  if (irs >= 42) return { filled: 2, color: '#FB923C' };
  return { filled: 1, color: '#6B7280' };
}

export const SignalStrengthBars = memo(function SignalStrengthBars({ irs }) {
  const { filled, color } = tierFromIrs(irs ?? 0);
  return (
    <span className={styles.bars} aria-label={`Signal strength: ${irs ?? 0}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={styles.bar}
          style={{
            height: `${6 + i * 2}px`,
            background: i <= filled ? color : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </span>
  );
});
