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

  getCompanyDimensions: (id) =>
    fetchJSON(`${BASE}/companies/${id}/dimensions`).then((r) => r.data),

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

  getSectorStats: (params = {}) =>
    fetchJSON(`${BASE}/kpis/sectors`, params).then((r) => r.data),

  // Timeline
  getTimeline: (params = {}) =>
    fetchJSON(`${BASE}/timeline`, params).then((r) => r.data),

  // Constants
  getConstants: () =>
    fetchJSON(`${BASE}/constants`).then((r) => r.data),

  // Analysis
  getCompanyAnalysis: (id) =>
    fetchJSON(`${BASE}/analysis/company/${id}`).then((r) => r.data).catch((e) => {
      if (e.message?.includes('404')) return null;
      throw e;
    }),

  getWeeklyBrief: (params = {}) =>
    fetchJSON(`${BASE}/analysis/brief`, params).then((r) => r).catch((e) => {
      if (e.message?.includes('404')) return { data: null };
      throw e;
    }),

  getRiskAssessments: (params = {}) =>
    fetchJSON(`${BASE}/analysis/risks`, params).then((r) => r.data),

  // Stakeholder Activities
  getStakeholderActivities: (params = {}) =>
    fetchJSON(`${BASE}/stakeholder-activities`, params).then((r) => r.data),

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
    fetchJSON(`${BASE}/scenarios`, params).then((r) => r.data),

  getScenario: (id) =>
    fetchJSON(`${BASE}/scenarios/${id}`).then((r) => r.data),

  getScenarioResults: (id, filters = {}) =>
    fetchJSON(`${BASE}/scenarios/${id}/results`, filters).then((r) => r.data),

  // Forecasts
  getForecasts: (entityType, entityId, params = {}) =>
    fetchJSON(`${BASE}/scenarios/forecasts/${entityType}/${entityId}`, params).then((r) => r.data),

  getEcosystemForecast: () =>
    fetchJSON(`${BASE}/forecasts/ecosystem`).then((r) => r.data),

  // Temporal Graph
  getTemporalGraph: (date, nodeTypes, region) =>
    fetchJSON(`${BASE}/graph/temporal`, {
      date,
      nodeTypes: nodeTypes?.join(','),
      region,
    }).then((r) => r.data),

  getNodeFeatures: () =>
    fetchJSON(`${BASE}/graph/node-features`).then((r) => r.data),

  getNodeMetricsHistory: (nodeId) =>
    fetchJSON(`${BASE}/graph/metrics/${encodeURIComponent(nodeId)}/history`).then((r) => r.data),

  getStageTransitions: (companyId) =>
    fetchJSON(`${BASE}/graph/stage-transitions/${companyId}`).then((r) => r.data),

  // Lightweight graph (same endpoint, smaller payload flag)
  getGraphLight: (nodeTypes, yearMax, region, opportunities) =>
    fetchJSON(`${BASE}/graph`, {
      nodeTypes: nodeTypes?.join(','),
      yearMax,
      region,
      opportunities: opportunities || undefined,
      light: true,
    }).then((r) => r.data),

  // Graph clusters (community or kmeans)
  getGraphClusters: (type = 'community') =>
    fetchJSON(`${BASE}/graph-analytics/clusters`, { type }).then((r) => r.data),

  // Graph analytics summary
  getGraphAnalytics: () =>
    fetchJSON(`${BASE}/graph-analytics/snapshot`).then((r) => r.data),

  // Investor match for a company
  getInvestorMatches: (companyId) =>
    fetchJSON(`${BASE}/analytics/investor-match/${companyId}`).then((r) => r.data),

  // Capital flow analytics
  getCapitalFlows: (params = {}) =>
    fetchJSON(`${BASE}/analytics/capital-flows`, params).then((r) => r.data),

  // Capital magnet rankings
  getCapitalMagnets: (limit = 20) =>
    fetchJSON(`${BASE}/analytics/capital-magnets`, { limit }).then((r) => r.data),

  // Predicted links
  getPredictedLinks: (limit = 30, params = {}) =>
    fetchJSON(`${BASE}/analytics/predicted-links`, { limit, ...params }).then((r) => r.data),

  // Investors
  getInvestors: (params = {}) =>
    fetchJSON(`${BASE}/investors`, params).then((r) => r.data),

  getInvestor: (id) =>
    fetchJSON(`${BASE}/investors/${id}`).then((r) => r.data),

  getInvestorStats: (params = {}) =>
    fetchJSON(`${BASE}/investors/stats`, params).then((r) => r.data),

  // News
  // Return full response { data: [...], meta: {...} } so components can access both
  getNews: (params = {}) =>
    fetchJSON(`${BASE}/news/frontier`, params),

  getNewsNevada: (params = {}) =>
    fetchJSON(`${BASE}/news/nevada`, params),

  getNewsSectors: () =>
    fetchJSON(`${BASE}/news/sectors`).then((r) => r.data),

  refreshNews: () =>
    fetch(`${BASE}/news/refresh`, { method: 'POST' }).then((r) => r.json()),

  // Ecosystem
  getEcosystemMap: (params = {}) =>
    fetchJSON(`${BASE}/ecosystem/map`, params).then((r) => r.data),

  // Structural holes & gaps
  getStructuralHoles: (params = {}) =>
    fetchJSON(`${BASE}/analytics/structural-holes`, params).then((r) => r.data),

  getEcosystemGaps: (params = {}) =>
    fetchJSON(`${BASE}/analytics/ecosystem-gaps`, params).then((r) => r.data),

  // Regional summary
  getRegionalSummary: () =>
    fetchJSON(`${BASE}/regional/summary`).then((r) => r.data),

  // Macro events
  getMacroEvents: () =>
    fetchJSON(`${BASE}/macro-events`).then((r) => r.data),

  // Model outputs leaderboard
  getModelLeaderboard: (outputType = 'composite_score', limit = 20) =>
    fetchJSON(`${BASE}/model-outputs/leaderboard`, { outputType, limit }).then((r) => r.data),

  // Risk signals
  getRiskSignals: (params = {}) =>
    fetchJSON(`${BASE}/risks`, params).then((r) => r.data),
};
