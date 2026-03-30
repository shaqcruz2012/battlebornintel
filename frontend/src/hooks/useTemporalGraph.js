import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

/**
 * Hook for temporal graph data.
 * Fetches graph filtered to a specific date, falling back to the regular
 * /api/graph endpoint when the temporal endpoint is unavailable.
 *
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {string[]} [nodeTypes] - Node types to include
 * @param {string} [region] - Region filter
 * @returns {{ nodes: Array, edges: Array, isLoading: boolean, error: Error|null }}
 */
export function useTemporalGraph(date, nodeTypes, region) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['graph', 'temporal', date, nodeTypes, region],
    queryFn: async () => {
      try {
        // Try the temporal endpoint first
        const res = await fetch(
          buildUrl('/api/graph/temporal', {
            date,
            nodeTypes: nodeTypes?.join(','),
            region,
          })
        );
        if (res.ok) {
          const json = await res.json();
          return json.data || json;
        }
        // If 404 or other client error, fall back to regular graph filtered by yearMax
        if (res.status >= 400 && res.status < 500) {
          return fallbackGraph(date, nodeTypes, region);
        }
        throw new Error(`API error ${res.status}`);
      } catch (err) {
        // Network errors or fetch failures — try the fallback
        if (err.name === 'TypeError' || err.message?.includes('fetch')) {
          return fallbackGraph(date, nodeTypes, region);
        }
        throw err;
      }
    },
    staleTime: 300_000,
    enabled: !!date,
  });

  return {
    nodes: data?.nodes || [],
    edges: data?.edges || [],
    isLoading,
    error: error || null,
  };
}

/**
 * Fall back to the existing /api/graph endpoint with yearMax derived from date.
 */
async function fallbackGraph(date, nodeTypes, region) {
  const yearMax = date ? new Date(date).getFullYear() : undefined;
  return api.getGraph(nodeTypes, yearMax, region);
}

/**
 * Build a URL with query parameters, filtering out falsy values.
 */
function buildUrl(path, params = {}) {
  const url = new URL(path, window.location.origin);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      url.searchParams.set(key, val);
    }
  }
  return url.toString();
}
