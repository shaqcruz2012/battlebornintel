# Frontend Development Context

Use this when creating or modifying React components in `frontend/src/`.

## Structure
```
frontend/src/
  api/client.js     — API fetch functions (api.getCompanies, etc.)
  api/hooks.js      — TanStack Query hooks (useCompanies, etc.)
  components/       — Reusable UI components
  views/            — Page-level views
  data/constants.js — NODE_CFG, REL_CFG, SHEAT scores, STAGE_NORMS
  App.jsx           — Router + layout
  main.jsx          — Entry point
```

## API Client Pattern (`api/client.js`)
```javascript
export const api = {
  getThings: (filters = {}) =>
    fetchJSON(`${BASE}/things`, filters).then((r) => r.data),
};
```

## Hook Pattern (`api/hooks.js`)
```javascript
import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useThings(filters = {}) {
  return useQuery({
    queryKey: ['things', filters],
    queryFn: () => api.getThings(filters),
    staleTime: 300_000,  // match API cache TTL
  });
}
```

## Available Hooks
| Hook | Data | Stale Time |
|------|------|-----------|
| useCompanies(filters) | Company list with IRS scores | 300s |
| useCompany(id) | Single company + edges | 300s |
| useFunds(filters) | Fund deployment data | 300s |
| useGraph(nodeTypes, yearMax, region) | Graph nodes + edges | 300s |
| useGraphMetrics(nodeTypes) | PageRank, betweenness, communities | 300s |
| useKPIs(sector) | Aggregate KPIs | 120s |
| useTimeline(startWeek, endWeek) | Timeline events | 120s |
| useAnalysisBrief() | Weekly AI brief | 60s |
| useRiskAssessments() | Risk analysis | 300s |
| useStakeholderActivities(params) | Activity feed | 300s |
| useIndicatorsSummary() | Economic indicators overview | 120s |
| useIndicatorHistory(metric, params) | Single indicator time series | 120s |
| useMacroIndicators(params) | FRED macro series | 120s |
| useRegionalIndicators(region) | BLS regional data | 120s |
| useScenarios(params) | Scenario list | 120s |
| useScenario(id) | Single scenario + results | 120s |
| useForecasts(entityType, entityId) | Entity forecasts | 120s |
| useEcosystemForecast() | Ecosystem-wide forecast | 120s |
| useGoedSummary(region) | Composite GOED dashboard | — |

## Graph Visualization
- D3 force-directed graph with canvas edge rendering
- 10 node types with colors defined in `data/constants.js` (NODE_CFG)
- Node ID prefix determines type: c_, f_, s_, r_, p_, x_, ex_, a_, e_, pr_

## Styling
- CSS modules or inline styles (no Tailwind)
- Dark theme support via CSS variables
