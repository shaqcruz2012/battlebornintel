import { useFilters } from '../../hooks/useFilters';
import { FilterChip } from '../shared/FilterChip';
import styles from './Header.module.css';

const REGIONS = [
  { value: 'all', label: 'All Nevada' },
  { value: 'las_vegas', label: 'Las Vegas' },
  { value: 'reno', label: 'Reno-Sparks' },
  { value: 'henderson', label: 'Henderson' },
];

const STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'seed', label: 'Seed' },
  { value: 'early', label: 'Early' },
  { value: 'growth', label: 'Growth' },
];

export function Header({ activeView, onViewChange }) {
  const { filters, setRegion, setStage } = useFilters();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1 className={styles.title}>Battle Born Intelligence</h1>
        <span className={styles.subtitle}>Nevada Startup Ecosystem</span>
      </div>

      <div className={styles.controls}>
        {REGIONS.map((r) => (
          <FilterChip
            key={r.value}
            label={r.label}
            active={filters.region === r.value}
            onClick={() => setRegion(r.value)}
          />
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />
        {STAGES.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            active={filters.stage === s.value}
            onClick={() => setStage(s.value)}
          />
        ))}
      </div>
    </header>
  );
}
