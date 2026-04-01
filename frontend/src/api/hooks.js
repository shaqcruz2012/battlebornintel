import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';

/** Scored, filtered companies */
export function useCompanies(filters = {}) {
  return useQuery({
    queryKey: ['companies', filters.stage, filters.region, filters.sector, filters.search, filters.sortBy],
    queryFn: () => api.getCompanies(filters),
    staleTime: 300_000,
    placeholderData: (previousData) => previousData,
  });
}

/** Single company with edges and listings */
export function useCompany(id) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => api.getCompany(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

/** Enriched dimension scores for a company (lazy — only fetched when enabled) */
export function useCompanyDimensions(id, enabled = false) {
  return useQuery({
    queryKey: ['companyDimensions', id],
    queryFn: () => api.getCompanyDimensions(id),
    enabled: !!id && enabled,
    staleTime: 300_000,
  });
}

/** All funds — optionally filtered by region */
export function useFunds(filters = {}) {
  return useQuery({
    queryKey: ['funds', filters.region],
    queryFn: () => api.getFunds(filters),
    staleTime: 300_000,
  });
}

/** Graph nodes + edges (full detail — deferred until needed) */
export function useGraph(nodeTypes, yearMax, region, opportunities = false, enabled = true) {
  return useQuery({
    queryKey: ['graph', nodeTypes, yearMax, region, opportunities],
    queryFn: () => api.getGraph(nodeTypes, yearMax, region, opportunities),
    staleTime: 300_000,
    placeholderData: (previousData) => previousData,
    enabled,
  });
}

/** Lightweight graph — smaller payload for faster initial render */
export function useGraphLight(nodeTypes, yearMax, region, opportunities = false) {
  return useQuery({
    queryKey: ['graphLight', nodeTypes, yearMax, region, opportunities],
    queryFn: () => api.getGraphLight(nodeTypes, yearMax, region, opportunities),
    staleTime: 300_000,
    placeholderData: (previousData) => previousData,
  });
}

/** Graph metrics (PageRank, Betweenness, Communities, Watchlist) */
export function useGraphMetrics(nodeTypes, enabled = true) {
  return useQuery({
    queryKey: ['graphMetrics', nodeTypes],
    queryFn: () => api.getGraphMetrics(nodeTypes),
    staleTime: 300_000,
    enabled,
  });
}

/** Graph clusters (community or kmeans) */
export function useGraphClusters(type = 'community') {
  return useQuery({
    queryKey: ['graphClusters', type],
    queryFn: () => api.getGraphClusters(type),
    staleTime: 300_000,
  });
}

/** Graph analytics (PageRank, betweenness, kmeans, etc.) */
export function useGraphAnalytics() {
  return useQuery({
    queryKey: ['graphAnalytics'],
    queryFn: () => api.getGraphAnalytics(),
    staleTime: 300_000,
  });
}

/** Aggregate KPIs */
export function useKpis(filters = {}) {
  return useQuery({
    queryKey: ['kpis', filters.stage, filters.region, filters.sector],
    queryFn: () => api.getKpis(filters),
    staleTime: 300_000,
  });
}

/** Sector heat stats */
export function useSectorStats(params = {}) {
  return useQuery({
    queryKey: ['sectorStats', params.region],
    queryFn: () => api.getSectorStats(params),
    staleTime: 300_000,
  });
}

/** Timeline events */
export function useTimeline(params = {}) {
  return useQuery({
    queryKey: ['timeline', params.limit, params.offset, params.type, params.region],
    queryFn: () => api.getTimeline(params),
    staleTime: 300_000,
  });
}

/** UI constants */
export function useConstants() {
  return useQuery({
    queryKey: ['constants'],
    queryFn: () => api.getConstants(),
    staleTime: 600_000,
  });
}

/** AI analysis for a company */
export function useCompanyAnalysis(id) {
  return useQuery({
    queryKey: ['analysis', 'company', id],
    queryFn: () => api.getCompanyAnalysis(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

/** Weekly intelligence brief - current/latest */
export function useWeeklyBrief(params = {}) {
  return useQuery({
    queryKey: ['analysis', 'brief', params.weekStart, params.weekEnd],
    queryFn: () => api.getWeeklyBrief(params),
    staleTime: 300_000,
  });
}

/** Risk assessments */
export function useRiskAssessments(params = {}) {
  return useQuery({
    queryKey: ['analysis', 'risks', params.region],
    queryFn: () => api.getRiskAssessments(params),
    staleTime: 300_000,
  });
}

/** Risk intelligence signals (computed from ecosystem data) */
export function useRiskSignals(params = {}) {
  return useQuery({
    queryKey: ['risks', params.type, params.severity, params.limit],
    queryFn: () => api.getRiskSignals(params),
    staleTime: 120_000,
  });
}

/** Stakeholder activities digest */
export function useStakeholderActivities(params = {}) {
  return useQuery({
    queryKey: ['stakeholderActivities', params.region, params.location, params.type, params.stakeholderType, params.startDate, params.endDate, params.limit],
    queryFn: () => api.getStakeholderActivities(params),
    staleTime: 300_000,
  });
}

/** Investor matches for a company */
export function useInvestorMatches(companyId) {
  return useQuery({
    queryKey: ['analytics', 'investorMatch', companyId],
    queryFn: () => api.getInvestorMatches(companyId),
    enabled: !!companyId,
    staleTime: 300_000,
  });
}

/** Capital flow analytics */
export function useCapitalFlows(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'capital-flows', params.region],
    queryFn: () => api.getCapitalFlows(params),
    staleTime: 300_000,
  });
}

/** Capital magnet rankings */
export function useCapitalMagnets(limit = 20) {
  return useQuery({
    queryKey: ['analytics', 'capital-magnets', limit],
    queryFn: () => api.getCapitalMagnets(limit),
    staleTime: 300_000,
  });
}

/** Predicted links between nodes */
export function usePredictedLinks(limit = 30, enabled = false, params = {}) {
  return useQuery({
    queryKey: ['analytics', 'predicted-links', limit, params.region],
    queryFn: () => api.getPredictedLinks(limit, params),
    staleTime: 300_000,
    enabled,
  });
}

/** All investors (NV funds + external) */
export function useInvestors(params = {}) {
  return useQuery({
    queryKey: ['investors', params.region],
    queryFn: () => api.getInvestors(params),
    staleTime: 300_000,
  });
}

/** Single investor detail */
export function useInvestor(id) {
  return useQuery({
    queryKey: ['investor', id],
    queryFn: () => api.getInvestor(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

/** Investor aggregate stats */
export function useInvestorStats(params = {}) {
  return useQuery({
    queryKey: ['investorStats', params.region],
    queryFn: () => api.getInvestorStats(params),
    staleTime: 300_000,
  });
}

/** Frontier news feed */
export function useNews(params = {}) {
  return useQuery({
    queryKey: ['news', 'frontier', params.minRelevance, params.limit, params.sector, params.search],
    queryFn: () => api.getNews(params),
    staleTime: 120_000,
    refetchInterval: 30 * 60 * 1000, // auto-refresh every 30 min
    refetchIntervalInBackground: false,
  });
}

/** Nevada-only news */
export function useNewsNevada(params = {}) {
  return useQuery({
    queryKey: ['news', 'nevada', params.minRelevance, params.limit, params.sector, params.search],
    queryFn: () => api.getNewsNevada(params),
    staleTime: 120_000,
    refetchIntervalInBackground: false,
  });
}

/** Sector heatmap data */
export function useNewsSectors() {
  return useQuery({
    queryKey: ['news', 'sectors'],
    queryFn: () => api.getNewsSectors(),
    staleTime: 120_000,
  });
}

/** Manual news refresh */
export function useNewsRefresh() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.refreshNews(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['news', 'frontier'] });
      qc.invalidateQueries({ queryKey: ['news', 'nevada'] });
    },
  });
}

/** Ecosystem map entities for ResourceMatrix */
export function useEcosystemMap(params = {}) {
  return useQuery({
    queryKey: ['ecosystemMap', params.region],
    queryFn: () => api.getEcosystemMap(params),
    staleTime: 120_000,
  });
}

/** Structural holes analysis */
export function useStructuralHoles(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'structural-holes', params.region],
    queryFn: () => api.getStructuralHoles(params),
    staleTime: 300_000,
  });
}

/** Ecosystem policy gaps */
export function useEcosystemGaps(params = {}) {
  return useQuery({
    queryKey: ['ecosystemGaps', params.region],
    queryFn: () => api.getEcosystemGaps(params),
    staleTime: 120_000,
  });
}

/** Regional economic indicators summary */
export function useRegionalSummary() {
  return useQuery({
    queryKey: ['regional', 'summary'],
    queryFn: () => api.getRegionalSummary(),
    staleTime: 600_000,
  });
}

/** Macro economic events */
export function useMacroEvents() {
  return useQuery({
    queryKey: ['macroEvents'],
    queryFn: () => api.getMacroEvents(),
    staleTime: 600_000,
  });
}

/** Model outputs leaderboard */
export function useModelLeaderboard(outputType = 'composite_score', limit = 20) {
  return useQuery({
    queryKey: ['modelOutputs', 'leaderboard', outputType, limit],
    queryFn: () => api.getModelLeaderboard(outputType, limit),
    staleTime: 300_000,
  });
}

/** GOED dashboard summary — composes existing queries */
const GOED_NODE_TYPES = ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];

/** Economic indicators summary (latest + trend) */
export function useIndicatorsSummary() {
  return useQuery({
    queryKey: ['indicators', 'summary'],
    queryFn: () => api.getIndicatorsSummary(),
    staleTime: 120_000,
  });
}

/** Time series history for a single indicator */
export function useIndicatorHistory(metric, params = {}) {
  return useQuery({
    queryKey: ['indicators', 'history', metric, params],
    queryFn: () => api.getIndicatorHistory(metric, params),
    enabled: !!metric,
    staleTime: 120_000,
  });
}

/** Macro indicators (FRED series) */
export function useMacroIndicators(params = {}) {
  return useQuery({
    queryKey: ['indicators', 'macro', params],
    queryFn: () => api.getMacroIndicators(params),
    staleTime: 120_000,
  });
}

/** Regional indicators (BLS employment/wages) */
export function useRegionalIndicators(region) {
  return useQuery({
    queryKey: ['indicators', 'regional', region],
    queryFn: () => api.getRegionalIndicators(region),
    enabled: !!region,
    staleTime: 120_000,
  });
}

/** All scenarios (paginated) */
export function useScenarios(params = {}) {
  return useQuery({
    queryKey: ['scenarios', params],
    queryFn: () => api.getScenarios(params),
    staleTime: 120_000,
  });
}

/** Single scenario with results */
export function useScenario(id) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: () => api.getScenario(id),
    enabled: !!id,
    staleTime: 120_000,
  });
}

/** Latest forecasts for an entity */
export function useForecasts(entityType, entityId) {
  return useQuery({
    queryKey: ['forecasts', entityType, entityId],
    queryFn: () => api.getForecasts(entityType, entityId),
    enabled: !!(entityType && entityId),
    staleTime: 120_000,
  });
}

/** Ecosystem-wide forecast summary */
export function useEcosystemForecast() {
  return useQuery({
    queryKey: ['forecasts', 'ecosystem'],
    queryFn: () => api.getEcosystemForecast(),
    staleTime: 120_000,
  });
}

/** Temporal graph snapshot at a specific date */
export function useTemporalGraph(date, nodeTypes, region) {
  return useQuery({
    queryKey: ['graph', 'temporal', date, nodeTypes, region],
    queryFn: () => api.getTemporalGraph(date, nodeTypes, region),
    enabled: !!date,
    staleTime: 300_000,
  });
}

/** Node feature vectors for ML/visualization */
export function useNodeFeatures() {
  return useQuery({
    queryKey: ['graph', 'nodeFeatures'],
    queryFn: () => api.getNodeFeatures(),
    staleTime: 300_000,
  });
}

/** Metrics history time-series for a specific node */
export function useNodeMetricsHistory(nodeId) {
  return useQuery({
    queryKey: ['graph', 'metricsHistory', nodeId],
    queryFn: () => api.getNodeMetricsHistory(nodeId),
    enabled: !!nodeId,
    staleTime: 120_000,
  });
}

/** Stage transitions for a company */
export function useStageTransitions(companyId) {
  return useQuery({
    queryKey: ['stageTransitions', companyId],
    queryFn: () => api.getStageTransitions(companyId),
    enabled: !!companyId,
    staleTime: 120_000,
  });
}

export function useGoedSummary(region) {
  const fundsQuery = useFunds(region && region !== 'all' ? { region } : {});
  const graphQuery = useGraph(GOED_NODE_TYPES, 2026, region);
  const companiesQuery = useCompanies(region ? { region } : {});

  return {
    funds: fundsQuery.data || [],
    graph: graphQuery.data || { nodes: [], edges: [] },
    companies: companiesQuery.data || [],
    isLoading:
      fundsQuery.isLoading || graphQuery.isLoading || companiesQuery.isLoading,
    error: fundsQuery.error || graphQuery.error || companiesQuery.error || null,
  };
}
