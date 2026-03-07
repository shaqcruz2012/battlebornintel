import styles from './ViewTabs.module.css';

const VIEWS = [
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'brief', label: 'Weekly Brief' },
  { id: 'goed', label: 'GOED' },
  { id: 'graph', label: 'Graph Intelligence' },
];

export function ViewTabs({ active, onChange }) {
  return (
    <nav className={styles.tabs}>
      {VIEWS.map((v) => (
        <button
          key={v.id}
          className={`${styles.tab} ${active === v.id ? styles.active : ''}`}
          onClick={() => onChange(v.id)}
          type="button"
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}
