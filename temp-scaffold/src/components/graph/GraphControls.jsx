import { NODE_CFG } from '../../data/constants';
import { FilterChip } from '../shared/FilterChip';
import styles from './GraphControls.module.css';

const NODE_TYPES = Object.entries(NODE_CFG).map(([key, cfg]) => ({
  key,
  label: cfg.label,
}));

const COLOR_MODES = [
  { value: 'type', label: 'By Type' },
  { value: 'community', label: 'Community' },
];

export function GraphControls({
  nodeFilters,
  onToggleNode,
  colorMode,
  onColorModeChange,
  search,
  onSearchChange,
}) {
  return (
    <div className={styles.controls}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search nodes..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <span className={styles.separator} />

      <span className={styles.modeLabel}>Nodes</span>
      {NODE_TYPES.map((t) => (
        <FilterChip
          key={t.key}
          label={t.label}
          active={nodeFilters[t.key]}
          onClick={() => onToggleNode(t.key)}
        />
      ))}

      <span className={styles.separator} />

      <span className={styles.modeLabel}>Color</span>
      {COLOR_MODES.map((m) => (
        <FilterChip
          key={m.value}
          label={m.label}
          active={colorMode === m.value}
          onClick={() => onColorModeChange(m.value)}
        />
      ))}
    </div>
  );
}
