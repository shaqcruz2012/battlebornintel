import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

/** Scored, filtered companies */
export function useCompanies(filters = {}) {
  return useQuery({
    queryKey: ['companies', filters],
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
    queryKey: ['funds', filters],
    queryFn: () => api.getFunds(filters),
    staleTime: 300_000,
  });
}

/** Graph nodes + edges */
export function useGraph(nodeTypes, yearMax, region) {
  return useQuery({
    queryKey: ['graph', nodeTypes, yearMax, region],
    queryFn: () => api.getGraph(nodeTypes, yearMax, region),
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

/** Aggregate KPIs */
export function useKpis(filters = {}) {
  return useQuery({
    queryKey: ['kpis', filters],
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
    queryKey: ['timeline', params],
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
    queryKey: ['analysis', 'brief', params],
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

/** Stakeholder activities digest */
export function useStakeholderActivities(params = {}) {
  return useQuery({
    queryKey: ['stakeholderActivities', params],
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
export function useCapitalFlows() {
  return useQuery({
    queryKey: ['analytics', 'capital-flows'],
    queryFn: () => api.getCapitalFlows(),
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
export function usePredictedLinks(limit = 30, enabled = false) {
  return useQuery({
    queryKey: ['analytics', 'predicted-links', limit],
    queryFn: () => api.getPredictedLinks(limit),
    staleTime: 300_000,
    enabled,
  });
}

/** All investors (NV funds + external) */
export function useInvestors() {
  return useQuery({
    queryKey: ['investors'],
    queryFn: () => api.getInvestors(),
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
export function useInvestorStats() {
  return useQuery({
    queryKey: ['investorStats'],
    queryFn: () => api.getInvestorStats(),
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
