import styles from './SectorHeatStrip.module.css';

function heatColor(heat) {
  if (heat >= 85) return 'var(--status-risk)';
  if (heat >= 70) return 'var(--accent-gold)';
  if (heat >= 55) return 'var(--accent-teal)';
  return 'var(--text-disabled)';
}

export function SectorHeatStrip({ sectors = [], activeSector, onSectorChange, onSectorClick }) {
  const handleSectorClick = (sector) => {
    onSectorChange(sector);
    if (onSectorClick) {
      // Toggle: clicking the already-selected sector closes the drawer
      onSectorClick((prev) => (prev === sector ? null : sector));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Sector Heat</div>
      <div className={styles.strip}>
        <button
          className={`${styles.chip} ${activeSector === 'all' ? styles.activeChip : ''}`}
          onClick={() => {
            onSectorChange('all');
            if (onSectorClick) onSectorClick(null);
          }}
          type="button"
        >
          All
        </button>
        {sectors.map((s) => (
          <button
            key={s.sector}
            className={`${styles.chip} ${activeSector === s.sector ? styles.activeChip : ''}`}
            onClick={() => handleSectorClick(s.sector)}
            type="button"
          >
            <span
              className={styles.heatDot}
              style={{ background: heatColor(s.heat) }}
            />
            {s.sector}
            <span className={styles.count}>{s.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
