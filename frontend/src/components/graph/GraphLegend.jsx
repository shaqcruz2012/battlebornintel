import { NODE_CFG, EDGE_CATEGORY_CFG } from '../../data/constants';
import styles from './GraphLegend.module.css';

export function GraphLegend({ colorMode, nodeFilters, layout }) {
  const items = Object.entries(NODE_CFG)
    .filter(([key]) => nodeFilters[key])
    .map(([key, cfg]) => ({
      key,
      label: cfg.label,
      color: cfg.color,
    }));

  // Compute node/edge counts from layout if available
  const nodeCount = layout?.nodes?.length || 0;
  const edgeCount = layout?.edges?.length || 0;

  return (
    <div className={styles.legend}>
      {/* Node types section */}
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

      {/* Edge types section */}
      <div className={styles.separator} />
      <div className={styles.edgeTitle}>Edge Types</div>
      <div className={styles.edgeItems}>
        <div className={styles.edgeItem}>
          <span className={styles.edgeLineSolid} />
          Historical
        </div>
        <div className={styles.edgeItem}>
          <span className={styles.edgeLineDashed} />
          Operational
        </div>
        <div className={styles.edgeItem}>
          <span className={styles.edgeLineOpportunity} />
          Opportunity
        </div>
      </div>

      {/* Stats footer */}
      {nodeCount > 0 && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Nodes</span>
            <span className={styles.statValue}>{nodeCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Edges</span>
            <span className={styles.statValue}>{edgeCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
