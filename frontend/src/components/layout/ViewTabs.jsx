import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/client.js';
import styles from './ViewTabs.module.css';

const VISIBLE_COUNT = 8;

const BASE_VIEWS = [
  { id: 'graph', label: 'Graph' },
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'companies', label: 'Companies' },
  { id: 'investors', label: 'Investors' },
  { id: 'ecosystem', label: 'Ecosystem Map' },
  { id: 'ecosystemGaps', label: 'Ecosystem Gaps' },
  { id: 'capitalFlows', label: 'Capital Flows' },
  { id: 'predictions', label: 'Predicted Links' },
  { id: 'frontierNews', label: 'Frontier Intel' },
  { id: 'galaxy', label: 'Galaxy View' },
  { id: 'brief', label: 'Weekly Brief' },
  { id: 'goed', label: 'GOED' },
  { id: 'feed', label: 'Activity Feed' },
  { id: 'economics', label: 'Economics' },
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

  const handleInvestorsTabHover = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['investors', undefined],
      queryFn: () => api.getInvestors({}),
      staleTime: 300_000,
    });
    queryClient.prefetchQuery({
      queryKey: ['investorStats', undefined],
      queryFn: () => api.getInvestorStats({}),
      staleTime: 300_000,
    });
  }, [queryClient]);

  const handleCapitalFlowsTabHover = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['analytics', 'capital-flows', undefined],
      queryFn: () => api.getCapitalFlows({}),
      staleTime: 300_000,
    });
  }, [queryClient]);

  const handleExecutiveTabHover = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['kpis', undefined, undefined, undefined],
      queryFn: () => api.getKpis({}),
      staleTime: 300_000,
    });
    queryClient.prefetchQuery({
      queryKey: ['companies', undefined, undefined, undefined, undefined, undefined],
      queryFn: () => api.getCompanies({}),
      staleTime: 300_000,
    });
  }, [queryClient]);

  const TAB_HOVER_HANDLERS = useMemo(() => ({
    graph: handleGraphTabHover,
    investors: handleInvestorsTabHover,
    capitalFlows: handleCapitalFlowsTabHover,
    executive: handleExecutiveTabHover,
  }), [handleGraphTabHover, handleInvestorsTabHover, handleCapitalFlowsTabHover, handleExecutiveTabHover]);

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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const visibleViews = VIEWS.slice(0, VISIBLE_COUNT);
  const overflowViews = VIEWS.slice(VISIBLE_COUNT);

  // If active view is in overflow, swap it into visible
  const activeInOverflow = overflowViews.find(v => v.id === active);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <nav
      className={styles.tabs}
      role="tablist"
      aria-label="Dashboard views"
      ref={tabsRef}
      onKeyDown={handleKeyDown}
    >
      {/* Overflow menu trigger — left of tabs */}
      {overflowViews.length > 0 && (
        <div className={styles.overflowWrap} ref={menuRef}>
          <button
            className={`${styles.tab} ${styles.overflowTrigger} ${menuOpen ? styles.overflowOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            aria-label="More views"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.hamburger}>
              <span /><span /><span />
            </span>
          </button>

          {menuOpen && (
            <div className={styles.overflowMenu} role="menu">
              {overflowViews.map((v) => (
                <button
                  key={v.id}
                  className={`${styles.overflowItem} ${active === v.id ? styles.overflowActive : ''}`}
                  onClick={() => { onChange(v.id); setMenuOpen(false); }}
                  role="menuitem"
                  type="button"
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {visibleViews.map((v) => (
        <button
          key={v.id}
          className={`${styles.tab} ${active === v.id ? styles.active : ''}`}
          onClick={() => onChange(v.id)}
          onMouseEnter={TAB_HOVER_HANDLERS[v.id] || undefined}
          type="button"
          role="tab"
          aria-selected={active === v.id}
          tabIndex={active === v.id ? 0 : -1}
        >
          {v.label}
        </button>
      ))}

      {/* Show active overflow tab inline if selected */}
      {activeInOverflow && (
        <button
          key={activeInOverflow.id}
          className={`${styles.tab} ${styles.active}`}
          onClick={() => onChange(activeInOverflow.id)}
          type="button"
          role="tab"
          aria-selected
          tabIndex={0}
        >
          {activeInOverflow.label}
        </button>
      )}
    </nav>
  );
}
