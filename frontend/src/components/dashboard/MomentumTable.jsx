import { MomentumRow } from './MomentumRow';
import { Tooltip } from '../shared/Tooltip';
import styles from './MomentumTable.module.css';

const SORTS = [
  { value: 'irs', label: 'IRS' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'funding', label: 'Funding' },
  { value: 'name', label: 'A-Z' },
];

const IRS_TOOLTIP =
  '8-dimension weighted composite: Momentum (20%) — raw momentum score; Funding Velocity (15%) — funding vs. stage norm, capped at 100; Team (15%) — base 30 + bonuses for headcount >10 and eligible fund access; Hiring Signal (12%) — employee count mapped to 10-80 scale; Base (12%) — floor of 50; Market Timing (10%) — peak sector heat score; Data Quality (8%) — completeness of profile data; Network (8%) — eligible fund count + headcount bonus. Range 0–100.';

const GRADE_TOOLTIP =
  'Letter grade mapped from IRS score: A (≥85), A- (≥78), B+ (≥72), B (≥65), B- (≥58), C+ (≥50), C (≥42), D (<42). Grades are relative to the Nevada ecosystem — a B+ here means strong investment readiness by local standards, not a national benchmark.';

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
        <Tooltip title="Investment Readiness Score" text={IRS_TOOLTIP} position="below">
          <span className={styles.headerWithTip}>IRS</span>
        </Tooltip>
        <Tooltip title="Grade" text={GRADE_TOOLTIP} position="below">
          <span className={styles.headerWithTip}>Grade</span>
        </Tooltip>
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
