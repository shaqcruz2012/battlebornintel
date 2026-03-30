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

export function Header() {
  const { filters, setRegion, setStage, setSearch } = useFilters();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.brand}>
        <h1 className={styles.title}>Battle Born Intelligence</h1>
        <span className={styles.subtitle}>Nevada Startup Ecosystem</span>
      </div>

      <nav className={styles.controls} aria-label="Filters">
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search companies..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search companies"
        />
        <span className={styles.divider} />
        {REGIONS.map((r) => (
          <FilterChip
            key={r.value}
            label={r.label}
            active={filters.region === r.value}
            onClick={() => setRegion(r.value)}
          />
        ))}
        <span className={styles.divider} />
        {STAGES.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            active={filters.stage === s.value}
            onClick={() => setStage(s.value)}
          />
        ))}
      </nav>
    </header>
  );
}
