import { FilterChip } from '../shared/FilterChip';
import styles from './StakeholderSelector.module.css';

export function StakeholderSelector({ stakeholders, active, onChange }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>STAKEHOLDERS</span>
      {stakeholders.map((s) => (
        <FilterChip
          key={s.id}
          label={s.label}
          active={active === s.id}
          onClick={() => onChange(s.id)}
        />
      ))}
    </div>
  );
}
