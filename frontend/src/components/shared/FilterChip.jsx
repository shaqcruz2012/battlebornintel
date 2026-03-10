import styles from './FilterChip.module.css';

export function FilterChip({ label, active = false, count, onClick, small = false }) {
  const cls = [styles.chip, active && styles.active, small && styles.small].filter(Boolean).join(' ');

  return (
    <button className={cls} onClick={onClick} type="button" aria-pressed={active}>
      {label}
      {count !== undefined && <span className={styles.count}>({count})</span>}
    </button>
  );
}
