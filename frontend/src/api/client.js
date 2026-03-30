const BASE = '/api';

/**
 * Fetch JSON from the API with optional AbortSignal support.
 * @param {string} path  - API path (e.g., '/api/companies')
 * @param {Object} params - Query parameters (falsy values are excluded)
 * @param {Object} [opts] - Options (signal for AbortController)
 */
async function fetchJSON(path, params = {}, { signal } = {}) {
  const url = new URL(path, window.location.origin);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      url.searchParams.set(key, val);
    }
  }

  const headers = {};
  const token = localStorage.getItem('bbi_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { signal, headers, cache: 'no-store' });
  if (res.status === 401) {
    localStorage.removeItem('bbi_token');
    window.dispatchEvent(new Event('auth:expired'));
  }
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
  getFunds: (filters = {}) =>
    fetchJSON(`${BASE}/funds`, filters).then((r) => r.data),

  getFund: (id) =>
    fetchJSON(`${BASE}/funds/${id}`).then((r) => r.data),

  // Graph
  getGraph: (nodeTypes, yearMax, region, opportunities) =>
    fetchJSON(`${BASE}/graph`, {
      nodeTypes: nodeTypes?.join(','),
      yearMax,
      region,
      opportunities: opportunities ? 'true' : undefined,
    }).then((r) => r.data),

  // Lightweight graph — smaller payload for initial render
  getGraphLight: (nodeTypes, yearMax, region, opportunities) =>
    fetchJSON(`${BASE}/graph/light`, {
      nodeTypes: nodeTypes?.join(','),
      yearMax,
      region,
      opportunities: opportunities ? 'true' : undefined,
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

  getWeeklyBrief: (params = {}) =>
    fetchJSON(`${BASE}/analysis/brief`, params).then((r) => r),

  getWeeklyBriefByWeek: (weekStart) =>
    fetchJSON(`${BASE}/analysis/brief/${weekStart}`).then((r) => r.data),

  getWeeklyBriefRange: (startWeek, endWeek) =>
    fetchJSON(`${BASE}/analysis/brief`, {
      weekStart: startWeek,
      weekEnd: endWeek,
    }).then((r) => r),

  getRiskAssessments: () =>
    fetchJSON(`${BASE}/analysis/risks`).then((r) => r.data),

  getRiskSignals: (params = {}) =>
    fetchJSON(`${BASE}/risks`, params).then((r) => r.data),

  // Stakeholder Activities
  getStakeholderActivities: (params = {}) =>
    fetchJSON(`${BASE}/stakeholder-activities`, params).then((r) => r.data),

  // Analytics
  getInvestorMatches: (companyId, params = {}) =>
    fetchJSON(`${BASE}/analytics/investor-match/${companyId}`, params).then((r) => r.data),

  getCapitalFlows: (params = {}) =>
    fetchJSON(`${BASE}/analytics/capital-flows`, params).then((r) => r.data),

  getCapitalMagnets: (limit = 20) =>
    fetchJSON(`${BASE}/analytics/capital-magnets`, { limit }).then((r) => r.data),

  getPredictedLinks: (limit = 30, params = {}) =>
    fetchJSON(`${BASE}/analytics/predicted-links`, { limit, ...params }).then((r) => r.data),

  // Investors
  getInvestors: (params = {}) =>
    fetchJSON(`${BASE}/investors`, params).then((r) => r.data),

  getInvestor: (id) =>
    fetchJSON(`${BASE}/investors/${id}`).then((r) => r.data),

  getInvestorStats: (params = {}) =>
    fetchJSON(`${BASE}/investors/stats`, params).then((r) => r.data),

  // Frontier News
  getNews: (params = {}) =>
    fetchJSON(`${BASE}/news/frontier`, params).then((r) => r),

  getNewsNevada: (params = {}) =>
    fetchJSON(`${BASE}/news/nevada`, params).then((r) => r),

  getNewsSectors: () =>
    fetchJSON(`${BASE}/news/sectors`).then((r) => r.data),

  // Ecosystem map
  getEcosystemMap: (params = {}) =>
    fetchJSON(`${BASE}/ecosystem/map`, params).then((r) => r.data),

  getStructuralHoles: (params = {}) =>
    fetchJSON(`${BASE}/analytics/structural-holes`, params).then((r) => r.data),

  getEcosystemGaps: (params = {}) =>
    fetchJSON(`${BASE}/ecosystem/gaps`, params).then((r) => r.data),

  getGraphClusters: (type = 'community') =>
    fetchJSON(`${BASE}/graph/clusters`, { type }).then((r) => r.data),

  getGraphAnalytics: () =>
    fetchJSON(`${BASE}/graph/analytics`).then((r) => r.data),

  getRegionalSummary: () =>
    fetchJSON(`${BASE}/regional/summary`).then((r) => r.data),

  getMacroEvents: () =>
    fetchJSON(`${BASE}/macro-events`).then((r) => r.data),

  getModelLeaderboard: (outputType = 'composite_score', limit = 20) =>
    fetchJSON(`${BASE}/model-outputs/leaderboard`, {
      output_type: outputType,
      limit,
    }).then((r) => r.data),

  refreshNews: () =>
    fetch(`${BASE}/news/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('bbi_token')
          ? { Authorization: `Bearer ${localStorage.getItem('bbi_token')}` }
          : {}),
      },
    }).then((r) => r.json()),

};
