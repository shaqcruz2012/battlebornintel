import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

/** Scored, filtered companies */
export function useCompanies(filters = {}) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => api.getCompanies(filters),
    staleTime: 300_000,
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

/** All funds */
export function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: () => api.getFunds(),
    staleTime: 300_000,
  });
}

/** Graph nodes + edges */
export function useGraph(nodeTypes, yearMax, region) {
  return useQuery({
    queryKey: ['graph', nodeTypes, yearMax, region],
    queryFn: () => api.getGraph(nodeTypes, yearMax, region),
    staleTime: 300_000,
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

/** Weekly intelligence brief */
export function useWeeklyBrief() {
  return useQuery({
    queryKey: ['analysis', 'brief'],
    queryFn: () => api.getWeeklyBrief(),
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

/** GOED dashboard summary — composes existing queries */
const GOED_NODE_TYPES = ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];

export function useGoedSummary() {
  const fundsQuery = useFunds();
  const graphQuery = useGraph(GOED_NODE_TYPES, 2026);
  const companiesQuery = useCompanies({});

  return {
    funds: fundsQuery.data || [],
    graph: graphQuery.data || { nodes: [], edges: [] },
    companies: companiesQuery.data || [],
    isLoading:
      fundsQuery.isLoading || graphQuery.isLoading || companiesQuery.isLoading,
  };
}
