import { useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/client.js';
import styles from './ViewTabs.module.css';

const BASE_VIEWS = [
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'companies', label: 'Companies' },
  { id: 'investors', label: 'Investors' },
  { id: 'brief', label: 'Weekly Brief' },
  { id: 'goed', label: 'GOED' },
  { id: 'feed', label: 'Activity Feed' },
  { id: 'graph', label: 'Graph Intelligence' },
  { id: 'ecosystem', label: 'Ecosystem Map' },
  { id: 'ecosystemGaps', label: 'Ecosystem Gaps' },
  { id: 'capitalFlows', label: 'Capital Flows' },
  { id: 'predictions', label: 'Predicted Links' },
  { id: 'frontierNews', label: 'Frontier Intel' },
];

const ADMIN_VIEWS = [
  { id: 'ingestion', label: 'Ingestion Queue', adminOnly: true },
];

const GRAPH_DEFAULT_NODE_TYPES = [
  'company', 'fund', 'person', 'external', 'accelerator', 'ecosystem',
];
const GRAPH_YEAR_MAX = 2026;

export function ViewTabs({ active, onChange }) {
  const queryClient = useQueryClient();
  const tabsRef = useRef(null);
  const { user } = useAuth();

  const VIEWS = useMemo(() => {
    const isPrivileged = user && (user.role === 'admin' || user.role === 'analyst');
    return isPrivileged ? [...BASE_VIEWS, ...ADMIN_VIEWS] : BASE_VIEWS;
  }, [user]);

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

  const handleKeyDown = useCallback(
    (e) => {
      const currentIdx = VIEWS.findIndex((v) => v.id === active);
      let nextIdx = currentIdx;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIdx = (currentIdx + 1) % VIEWS.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIdx = (currentIdx - 1 + VIEWS.length) % VIEWS.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIdx = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIdx = VIEWS.length - 1;
      } else {
        return;
      }

      onChange(VIEWS[nextIdx].id);
      // Focus the newly activated tab
      const tabs = tabsRef.current?.querySelectorAll('[role="tab"]');
      tabs?.[nextIdx]?.focus();
    },
    [active, onChange, VIEWS],
  );

  return (
    <nav
      className={styles.tabs}
      role="tablist"
      aria-label="Dashboard views"
      ref={tabsRef}
      onKeyDown={handleKeyDown}
    >
      {VIEWS.map((v) => (
        <button
          key={v.id}
          className={`${styles.tab} ${active === v.id ? styles.active : ''}`}
          onClick={() => onChange(v.id)}
          onMouseEnter={v.id === 'graph' ? handleGraphTabHover : undefined}
          type="button"
          role="tab"
          aria-selected={active === v.id}
          tabIndex={active === v.id ? 0 : -1}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}
