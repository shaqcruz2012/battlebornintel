const BASE = '/api';

async function fetchJSON(path, params = {}) {
  const url = new URL(path, window.location.origin);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      url.searchParams.set(key, val);
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Companies
  getCompanies: (filters = {}) =>
    fetchJSON(`${BASE}/companies`, filters).then((r) => r.data),

  getCompany: (id) =>
    fetchJSON(`${BASE}/companies/${id}`).then((r) => r.data),

  // Funds
  getFunds: () =>
    fetchJSON(`${BASE}/funds`).then((r) => r.data),

  getFund: (id) =>
    fetchJSON(`${BASE}/funds/${id}`).then((r) => r.data),

  // Graph
  getGraph: (nodeTypes, yearMax) =>
    fetchJSON(`${BASE}/graph`, {
      nodeTypes: nodeTypes?.join(','),
      yearMax,
    }).then((r) => r.data),

  getGraphMetrics: (nodeTypes) =>
    fetchJSON(`${BASE}/graph/metrics`, {
      nodeTypes: nodeTypes?.join(','),
    }).then((r) => r.data),

  // KPIs
  getKpis: (filters = {}) =>
    fetchJSON(`${BASE}/kpis`, filters).then((r) => r.data),

  getSectorStats: () =>
    fetchJSON(`${BASE}/kpis/sectors`).then((r) => r.data),

  // Timeline
  getTimeline: (params = {}) =>
    fetchJSON(`${BASE}/timeline`, params).then((r) => r.data),

  // Constants
  getConstants: () =>
    fetchJSON(`${BASE}/constants`).then((r) => r.data),

  // Analysis
  getCompanyAnalysis: (id) =>
    fetchJSON(`${BASE}/analysis/company/${id}`).then((r) => r.data),

  getWeeklyBrief: () =>
    fetchJSON(`${BASE}/analysis/brief`).then((r) => r),

  getRiskAssessments: () =>
    fetchJSON(`${BASE}/analysis/risks`).then((r) => r.data),
};
