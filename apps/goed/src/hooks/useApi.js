import { useState, useEffect } from "react";

const API_BASE = "/api";

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}${path}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  return { data, loading, error };
}

export async function fetchApi(path) {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}
