import { MomentumRow } from './MomentumRow';
import styles from './MomentumTable.module.css';

const SORTS = [
  { value: 'irs', label: 'IRS' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'funding', label: 'Funding' },
  { value: 'name', label: 'A-Z' },
];

export function MomentumTable({ companies, sortBy, onSortChange }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Momentum Rankings</h2>
        <div className={styles.sortControls}>
          {SORTS.map((s) => (
            <button
              key={s.value}
              className={`${styles.sortBtn} ${sortBy === s.value ? styles.sortActive : ''}`}
              onClick={() => onSortChange(s.value)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.colHeaders}>
        <span>Company</span>
        <span className={styles.hideMobile}>Stage</span>
        <span className={styles.hideMobile}>Funding</span>
        <span>IRS</span>
        <span>Grade</span>
        <span />
      </div>

      {companies.length === 0 ? (
        <div className={styles.empty}>No companies match current filters</div>
      ) : (
        companies.map((c, i) => (
          <MomentumRow key={c.id} company={c} rank={i + 1} />
        ))
      )}
    </div>
  );
}
