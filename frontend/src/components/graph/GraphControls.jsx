import { useState } from 'react';
import { NODE_CFG } from '../../data/constants';
import { FilterChip } from '../shared/FilterChip';
import { GraphSearchDropdown } from './GraphSearchDropdown';
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
    nodes: { company: true, fund: true, sector: false, region: false, person: true, external: true, exchange: false, accelerator: true, ecosystem: true, program: false },
  },
  {
    id: 'government',
    label: 'Government',
    nodes: { company: true, fund: false, sector: false, region: false, person: false, external: true, exchange: false, accelerator: false, ecosystem: true, program: false },
  },
  {
    id: 'universities',
    label: 'Universities',
    nodes: { company: true, fund: false, sector: false, region: false, person: false, external: false, exchange: false, accelerator: true, ecosystem: true, program: false },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    nodes: { company: true, fund: true, sector: false, region: false, person: false, external: true, exchange: false, accelerator: false, ecosystem: false, program: false },
  },
  {
    id: 'risk_capital',
    label: 'Risk Capital',
    nodes: { company: true, fund: true, sector: false, region: false, person: false, external: false, exchange: false, accelerator: true, ecosystem: false, program: false },
  },
];

function matchesPreset(nodeFilters, preset) {
  return Object.entries(preset.nodes).every(([k, v]) => nodeFilters[k] === v);
}

const OPP_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'programs', label: 'Programs' },
  { value: 'funds', label: 'Funds' },
];

/**
 * GraphOverlayControls — top-right floating panel inside the graph canvas.
 * Includes search, view presets, node type toggles, color mode, and edge filters.
 * Collapses to a single ⚙ icon to maximise canvas space.
 */
export function GraphOverlayControls({
  nodeFilters,
  onToggleNode,
  onSetNodeFilters,
  colorMode,
  onColorModeChange,
  showOpportunities = false,
  onToggleOpportunities,
  opportunityFilter = 'all',
  onOpportunityFilterChange,
  showValues = false,
  onToggleValues,
  search = '',
  onSearchChange,
  nodes = [],
  onFocusNode,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const activePreset = STAKEHOLDER_PRESETS.find((p) => matchesPreset(nodeFilters, p));

  if (collapsed) {
    return (
      <div className={styles.collapsedOverlay}>
        <button
          className={styles.expandBtn}
          onClick={() => setCollapsed(false)}
          title="Expand controls"
          aria-label="Expand graph controls"
        >
          ⚙
        </button>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      {/* Header row: label + collapse button */}
      <div className={styles.overlayHeader}>
        <span className={styles.overlayTitle}>Controls</span>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(true)}
          title="Collapse controls"
          aria-label="Collapse graph controls"
        >
          ×
        </button>
      </div>

      {/* Search input */}
      <div className={styles.overlayRow}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%' }}
            aria-label="Search graph nodes"
          />
          {search && nodes.length > 0 && (
            <GraphSearchDropdown
              nodes={nodes}
              searchTerm={search}
              onSelect={(nodeId) => {
                onFocusNode?.(nodeId);
                onSearchChange('');
              }}
              onClose={() => onSearchChange('')}
            />
          )}
        </div>
      </div>

      {/* View presets */}
      <div className={styles.overlayRow}>
        <span className={styles.overlayLabel}>View</span>
        {STAKEHOLDER_PRESETS.map((p) => (
          <FilterChip
            key={p.id}
            label={p.label}
            active={activePreset?.id === p.id}
            onClick={() => onSetNodeFilters(p.nodes)}
            small
          />
        ))}
      </div>

      {/* Node type toggles */}
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

      {/* Color mode */}
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

      {/* Edge controls */}
      <div className={styles.overlayRow}>
        <span className={styles.overlayLabel}>Edges</span>
        <FilterChip
          label="$ Values"
          active={showValues}
          onClick={onToggleValues}
          small
        />
        <FilterChip
          label="Opportunities"
          active={showOpportunities}
          onClick={onToggleOpportunities}
          small
        />
        {showOpportunities && OPP_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={opportunityFilter === f.value}
            onClick={() => onOpportunityFilterChange?.(f.value)}
            small
          />
        ))}
      </div>
    </div>
  );
}
