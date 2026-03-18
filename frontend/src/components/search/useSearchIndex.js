import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFilters } from '../../hooks/useFilters.jsx';
import { api } from '../../api/client.js';

const MAX_PER_CATEGORY = 15;
const DEBOUNCE_MS = 300;

/**
 * Normalize a string for case-insensitive fuzzy matching.
 */
function normalize(str) {
  return (str ?? '').toLowerCase().trim();
}

/**
 * Simple fuzzy match: returns true if every character in `needle`
 * appears in `haystack` in order (subsequence check).
 */
function fuzzyMatch(haystack, needle) {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return false;
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    hi = h.indexOf(n[ni], hi);
    if (hi === -1) return false;
    hi++;
  }
  return true;
}

/**
 * Score a match: exact substring match scores higher than fuzzy.
 */
function scoreMatch(haystack, needle) {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (h.startsWith(n)) return 3;
  if (h.includes(n)) return 2;
  if (fuzzyMatch(h, n)) return 1;
  return 0;
}

/**
 * Score a company against a query across name, sectors, and city.
 */
function scoreCompany(company, query) {
  return Math.max(
    scoreMatch(company.name, query),
    scoreMatch(company.city, query),
    ...(company.sectors ?? []).map((s) => scoreMatch(s, query))
  );
}

/**
 * Score a fund against a query across name and region.
 */
function scoreFund(fund, query) {
  return Math.max(
    scoreMatch(fund.name, query),
    scoreMatch(fund.type, query),
    scoreMatch(fund.thesis, query)
  );
}

/**
 * Score a graph node against a query by label and type.
 */
function scoreNode(node, query) {
  return Math.max(
    scoreMatch(node.label ?? node.name, query),
    scoreMatch(node.type, query)
  );
}

/**
 * Custom hook that builds a searchable index from the React Query cache
 * and provides a `search(query)` function returning grouped results.
 *
 * It reads cached data first for instant results, then fires debounced
 * API calls to refresh stale data.
 */
export function useSearchIndex() {
  const queryClient = useQueryClient();
  const { filters } = useFilters();
  const region = filters.region === 'all' ? undefined : filters.region;
  const debounceTimer = useRef(null);

  /**
   * Trigger background API fetches so future searches benefit from fresh data.
   * Debounced to avoid hammering the API while the user is typing.
   */
  const scheduleFetch = useCallback((query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['companies', {}],
            queryFn: () => api.getCompanies({}),
            staleTime: 300_000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['funds', {}],
            queryFn: () => api.getFunds({}),
            staleTime: 300_000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['graph', ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'], 2026, region],
            queryFn: () =>
              api.getGraph(
                ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'],
                2026,
                region
              ),
            staleTime: 300_000,
          }),
        ]);
      } catch {
        // Silently ignore background fetch errors — cached results still shown
      }
    }, DEBOUNCE_MS);
  }, [queryClient, region]);

  /**
   * Read all cached query data and search across companies, funds, and graph nodes.
   * Returns an object with categories: companies, funds, people, organizations.
   */
  const search = useCallback(
    (query) => {
      const q = normalize(query);
      if (!q) {
        return { companies: [], funds: [], people: [], organizations: [] };
      }

      // Schedule a background refresh for the next call
      scheduleFetch(q);

      // --- Companies ---
      const companiesCache = queryClient.getQueryData(['companies', {}]) ?? [];
      const companies = companiesCache
        .map((c) => ({ ...c, _score: scoreCompany(c, q) }))
        .filter((c) => c._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_PER_CATEGORY)
        .map(({ _score: _, ...c }) => ({
          id: c.id ?? c.name,
          category: 'companies',
          name: c.name,
          subtitle: [c.city, ...(c.sectors ?? []).slice(0, 2)].filter(Boolean).join(' · '),
          view: 'companies',
          payload: c,
        }));

      // --- Funds ---
      const fundsCache = queryClient.getQueryData(['funds', {}]) ?? [];
      const funds = fundsCache
        .map((f) => ({ ...f, _score: scoreFund(f, q) }))
        .filter((f) => f._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_PER_CATEGORY)
        .map(({ _score: _, ...f }) => ({
          id: f.id ?? f.name,
          category: 'funds',
          name: f.name,
          subtitle: f.type || '',
          view: 'funds',
          payload: f,
        }));

      // --- Graph nodes (people + orgs) ---
      const GRAPH_KEY = ['graph', ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'], 2026, region];
      const graphCache = queryClient.getQueryData(GRAPH_KEY) ?? { nodes: [] };
      const graphNodes = graphCache.nodes ?? [];

      const people = graphNodes
        .filter((n) => n.type === 'person')
        .map((n) => ({ ...n, _score: scoreNode(n, q) }))
        .filter((n) => n._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_PER_CATEGORY)
        .map(({ _score: _, ...n }) => ({
          id: n.id,
          category: 'people',
          name: n.label ?? n.name,
          subtitle: n.role ?? n.title ?? 'Person',
          view: 'graph',
          payload: n,
        }));

      const ORGANIZATION_TYPES = new Set(['company', 'fund', 'external', 'accelerator', 'ecosystem']);
      const organizations = graphNodes
        .filter((n) => ORGANIZATION_TYPES.has(n.type) && n.type !== 'person')
        .map((n) => ({ ...n, _score: scoreNode(n, q) }))
        .filter((n) => n._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_PER_CATEGORY)
        .map(({ _score: _, ...n }) => ({
          id: n.id,
          category: 'organizations',
          name: n.label ?? n.name,
          subtitle: n.type.charAt(0).toUpperCase() + n.type.slice(1),
          view: 'graph',
          payload: n,
        }));

      return { companies, funds, people, organizations };
    },
    [queryClient, scheduleFetch, region]
  );

  return { search };
}
