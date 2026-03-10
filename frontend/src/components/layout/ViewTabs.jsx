import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import styles from './ViewTabs.module.css';

const VIEWS = [
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'companies', label: 'Companies' },
  { id: 'funds', label: 'Funds' },
  { id: 'brief', label: 'Weekly Brief' },
  { id: 'goed', label: 'GOED' },
  { id: 'feed', label: 'Activity Feed' },
  { id: 'graph', label: 'Graph Intelligence' },
];

// Default node types that GraphView uses on first mount.
// Kept in sync with DEFAULT_NODE_FILTERS in GraphView.jsx.
const GRAPH_DEFAULT_NODE_TYPES = [
  'company', 'fund', 'person', 'external', 'accelerator', 'ecosystem',
];
const GRAPH_YEAR_MAX = 2026;

export function ViewTabs({ active, onChange }) {
  const queryClient = useQueryClient();

  // Prefetch graph data and metrics when the user hovers the Graph tab.
  // By the time they click, the data is already in the cache.
  const handleGraphTabHover = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['graph', GRAPH_DEFAULT_NODE_TYPES, GRAPH_YEAR_MAX, undefined],
      queryFn: () => api.getGraph(GRAPH_DEFAULT_NODE_TYPES, GRAPH_YEAR_MAX, undefined),
      staleTime: 300_000,
    });
    queryClient.prefetchQuery({
      queryKey: ['graphMetrics', GRAPH_DEFAULT_NODE_TYPES],
      queryFn: () => api.getGraphMetrics(GRAPH_DEFAULT_NODE_TYPES),
      staleTime: 300_000,
    });
  }, [queryClient]);

  return (
    <nav className={styles.tabs}>
      {VIEWS.map((v) => (
        <button
          key={v.id}
          className={`${styles.tab} ${active === v.id ? styles.active : ''}`}
          onClick={() => onChange(v.id)}
          onMouseEnter={v.id === 'graph' ? handleGraphTabHover : undefined}
          type="button"
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}
