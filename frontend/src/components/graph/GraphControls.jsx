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

const STAKEHOLDER_PRESETS = [
  {
    id: 'all',
    label: 'All',
    nodes: { company: true, fund: true, sector: false, region: false, person: true, external: true, exchange: false, accelerator: true, ecosystem: true },
  },
  {
    id: 'government',
    label: 'Government',
    nodes: { company: true, fund: false, sector: false, region: false, person: false, external: true, exchange: false, accelerator: false, ecosystem: true },
  },
  {
    id: 'universities',
    label: 'Universities',
    nodes: { company: true, fund: false, sector: false, region: false, person: false, external: false, exchange: false, accelerator: true, ecosystem: true },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    nodes: { company: true, fund: true, sector: false, region: false, person: false, external: true, exchange: false, accelerator: false, ecosystem: false },
  },
  {
    id: 'risk_capital',
    label: 'Risk Capital',
    nodes: { company: true, fund: true, sector: false, region: false, person: false, external: false, exchange: false, accelerator: true, ecosystem: false },
  },
];

function matchesPreset(nodeFilters, preset) {
  return Object.entries(preset.nodes).every(([k, v]) => nodeFilters[k] === v);
}

export function GraphControls({
  nodeFilters,
  onSetNodeFilters,
  search,
  onSearchChange,
}) {
  const activePreset = STAKEHOLDER_PRESETS.find((p) => matchesPreset(nodeFilters, p));

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

      <span className={styles.modeLabel}>View</span>
      {STAKEHOLDER_PRESETS.map((p) => (
        <FilterChip
          key={p.id}
          label={p.label}
          active={activePreset?.id === p.id}
          onClick={() => onSetNodeFilters(p.nodes)}
        />
      ))}
    </div>
  );
}

export function GraphOverlayControls({
  nodeFilters,
  onToggleNode,
  colorMode,
  onColorModeChange,
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayRow}>
        <span className={styles.overlayLabel}>Nodes</span>
        {NODE_TYPES.map((t) => (
          <FilterChip
            key={t.key}
            label={t.label}
            active={nodeFilters[t.key]}
            onClick={() => onToggleNode(t.key)}
            small
          />
        ))}
      </div>
      <div className={styles.overlayRow}>
        <span className={styles.overlayLabel}>Color</span>
        {COLOR_MODES.map((m) => (
          <FilterChip
            key={m.value}
            label={m.label}
            active={colorMode === m.value}
            onClick={() => onColorModeChange(m.value)}
            small
          />
        ))}
      </div>
    </div>
  );
}
