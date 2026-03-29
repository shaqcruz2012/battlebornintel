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

  const res = await fetch(url.toString(), { signal });
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
  getGraph: (nodeTypes, yearMax, region) =>
    fetchJSON(`${BASE}/graph`, {
      nodeTypes: nodeTypes?.join(','),
      yearMax,
      region,
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

  // Stakeholder Activities
  getStakeholderActivities: (params = {}) =>
    fetchJSON(`${BASE}/stakeholder-activities`, params).then((r) => r.data),

  // GOED Summary
  getGoedSummary: () =>
    fetchJSON(`${BASE}/goed/summary`).then((r) => r.data),

  // Economic Indicators
  getIndicatorsSummary: () =>
    fetchJSON(`${BASE}/indicators`).then((r) => r.data),

  getIndicatorHistory: (metric, params = {}) =>
    fetchJSON(`${BASE}/indicators/history/${metric}`, params).then((r) => r.data),

  getMacroIndicators: (params = {}) =>
    fetchJSON(`${BASE}/indicators/macro`, params).then((r) => r.data),

  getRegionalIndicators: (region, params = {}) =>
    fetchJSON(`${BASE}/indicators/regional/${region}`, params).then((r) => r.data),

  // Scenarios
  getScenarios: (params = {}) =>
    fetchJSON(`${BASE}/scenarios`, params).then((r) => r),

  getScenario: (id) =>
    fetchJSON(`${BASE}/scenarios/${id}`).then((r) => r.data),

  getScenarioResults: (id, filters = {}) =>
    fetchJSON(`${BASE}/scenarios/${id}/results`, filters).then((r) => r.data),

  // Forecasts
  getForecasts: (entityType, entityId, params = {}) =>
    fetchJSON(`${BASE}/scenarios/forecasts/${entityType}/${entityId}`, params).then((r) => r.data),

  getEcosystemForecast: () =>
    fetchJSON(`${BASE}/forecasts/ecosystem`).then((r) => r.data),
};
