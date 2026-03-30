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

/** All funds — optionally filtered by region */
export function useFunds(filters = {}) {
  return useQuery({
    queryKey: ['funds', filters.region],
    queryFn: () => api.getFunds(filters),
    staleTime: 300_000,
  });
}

/** Graph nodes + edges */
export function useGraph(nodeTypes, yearMax, region, opportunities = false) {
  return useQuery({
    queryKey: ['graph', nodeTypes, yearMax, region, opportunities],
    queryFn: () => api.getGraph(nodeTypes, yearMax, region, opportunities),
    staleTime: 300_000,
    placeholderData: (previousData) => previousData,
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
export function useGraphMetrics(nodeTypes) {
  return useQuery({
    queryKey: ['graphMetrics', nodeTypes],
    queryFn: () => api.getGraphMetrics(nodeTypes),
    staleTime: 300_000,
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
export function useSectorStats() {
  return useQuery({
    queryKey: ['sectorStats'],
    queryFn: () => api.getSectorStats(),
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

/** Weekly brief for specific week */
export function useWeeklyBriefWeek(weekStart) {
  return useQuery({
    queryKey: ['analysis', 'brief', weekStart],
    queryFn: () => api.getWeeklyBriefByWeek(weekStart),
    enabled: !!weekStart,
    staleTime: 300_000,
  });
}

/** Weekly brief range (e.g., past year) */
export function useWeeklyBriefRange(startWeek, endWeek) {
  return useQuery({
    queryKey: ['analysis', 'brief', 'range', startWeek, endWeek],
    queryFn: () => api.getWeeklyBriefRange(startWeek, endWeek),
    enabled: !!(startWeek && endWeek),
    staleTime: 300_000,
  });
}

/** Risk assessments */
export function useRiskAssessments() {
  return useQuery({
    queryKey: ['analysis', 'risks'],
    queryFn: () => api.getRiskAssessments(),
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
    queryKey: ['stakeholderActivities', params.region, params.type, params.stakeholderType, params.startDate, params.endDate, params.limit],
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
  };
}
