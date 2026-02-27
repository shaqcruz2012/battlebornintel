import { useState, useEffect } from 'react';

const API_BASE = typeof window !== 'undefined'
  ? (window.__BBI_API_URL__ || import.meta.env?.VITE_API_URL || 'http://localhost:3001')
  : 'http://localhost:3001';

/**
 * Fetch platform data from the BBI API.
 *
 * @param {string} verticalId - 'goed', 'esint', etc.
 * @returns {{ data: object|null, config: object|null, loading: boolean, error: string|null }}
 */
export function useData(verticalId) {
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!verticalId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/api/${verticalId}/data`).then(r => {
        if (!r.ok) throw new Error(`Data fetch failed: ${r.status}`);
        return r.json();
      }),
      fetch(`${API_BASE}/api/${verticalId}/data/config`).then(r => {
        if (!r.ok) throw new Error(`Config fetch failed: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([dataRes, configRes]) => {
        if (cancelled) return;
        setData(dataRes);
        setConfig(configRes);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.warn(`BBI API unavailable (${err.message}), using static data fallback`);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [verticalId]);

  return { data, config, loading, error };
}
