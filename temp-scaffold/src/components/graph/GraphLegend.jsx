import { NODE_CFG } from '../../data/constants';
import styles from './GraphLegend.module.css';

export function GraphLegend({ colorMode, nodeFilters }) {
  const items = Object.entries(NODE_CFG)
    .filter(([key]) => nodeFilters[key])
    .map(([key, cfg]) => ({
      key,
      label: cfg.label,
      color: cfg.color,
    }));

  return (
    <div className={styles.legend}>
      <div className={styles.title}>
        {colorMode === 'community' ? 'Community Colors' : 'Node Types'}
      </div>
      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.key} className={styles.item}>
            <span className={styles.dot} style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
