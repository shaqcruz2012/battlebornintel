import { CountUp } from '../shared/CountUp';
import { Sparkline } from '../shared/Sparkline';
import styles from './KpiCard.module.css';

export function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  secondary,
  sparkData,
  sparkColor,
  active = false,
  onClick,
}) {
  return (
    <div
      className={`${styles.kpiCard} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <CountUp
          className={styles.value}
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
        {sparkData && (
          <Sparkline
            data={sparkData}
            width={72}
            height={24}
            color={sparkColor || 'var(--accent-teal)'}
          />
        )}
      </div>
      {secondary && <span className={styles.secondary}>{secondary}</span>}
    </div>
  );
}
