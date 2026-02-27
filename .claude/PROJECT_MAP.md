# BBI Project Map — Where To Find Things

## Quick Task Lookup

| I need to... | Go to |
|---|---|
| Add/edit a company | `apps/{vertical}/src/data/companies.js` |
| Add/edit a fund | `apps/{vertical}/src/data/funds.js` |
| Add graph edges | `apps/{vertical}/src/data/graph.js` → VERIFIED_EDGES |
| Add people/externals | `apps/{vertical}/src/data/graph.js` → PEOPLE, EXTERNALS |
| Add timeline events | `apps/{vertical}/src/data/timeline.js` |
| Add enterprise data | `apps/{vertical}/src/data/dockets.js`, `ppa.js`, `queue.js`, `benchmarks.js` |
| Change vertical config | `apps/{vertical}/src/config.js` |
| Change app entry point | `apps/{vertical}/src/App.jsx` |
| Add/edit a view | `packages/ui-core/src/components/views/` |
| Edit the graph view | `packages/ui-core/src/components/graph/OntologyGraphView.jsx` |
| Edit graph layout | `packages/ui-core/src/engine/graph-layout.js` |
| Edit graph metrics | `packages/ui-core/src/engine/graph-metrics.js` |
| Edit graph builder | `packages/ui-core/src/engine/graph-builder.js` |
| Edit IRS scoring | `packages/ui-core/src/engine/irs.js` |
| Edit forecast engine | `packages/ui-core/src/engine/forecast.js` |
| Change styles/tokens | `packages/ui-core/src/styles/tokens.js`, `graph-tokens.js` |
| Edit shared components | `packages/ui-core/src/components/shared/` |
| Edit the main shell | `packages/ui-core/src/components/BattleBornIntelligence.jsx` |
| Add API endpoint | `services/api/src/routes/` |
| Edit DB schema | `services/api/schema.sql` |
| Edit migration | `services/api/src/migrate.js` |
| Edit data hook | `packages/ui-core/src/hooks/useData.js` |
| Validate data | `node scripts/validate-data.js apps/{vertical}` |
| Check exports | `packages/ui-core/src/index.js` |

## View Registry (19 views)

| View | File | Feature Flag | Data Required |
|---|---|---|---|
| Dashboard | `DashboardView.jsx` | always | companies, funds |
| Companies | `CompaniesView.jsx` | always | companies |
| Investors | `InvestorsView.jsx` | always | funds |
| SSBCI | `SSBCIView.jsx` | always | funds |
| Graph | `GraphView.jsx` (wrapper) | always | full graph data |
| OntologyGraph | `graph/OntologyGraphView.jsx` | always | full graph data |
| Sectors | `SectorsView.jsx` | always | companies |
| Map | `MapView.jsx` | always | companies (lat/lng) |
| Timeline | `TimelineView.jsx` | always | timeline |
| Compare | `CompareView.jsx` | always | companies |
| Radar | `RadarView.jsx` | always | companies |
| Feed | `FeedView.jsx` | always | companies, timeline |
| Intel | `IntelView.jsx` | always | companies, funds |
| Horizon | `HorizonView.jsx` | always | companies, timeline |
| Watchlist | `WatchlistView.jsx` | always | companies |
| Dockets | `DocketsView.jsx` | `features.dockets` | dockets |
| Forecast | `ForecastView.jsx` | `features.forecast` | benchmarks, milestones |
| Queue | `QueueView.jsx` | `features.queue` | queue |
| PPAs | `PPAView.jsx` | `features.ppa` | ppa |
| Alerts | `AlertsView.jsx` | `features.alerts` | enterprise data |

## Engine Functions

| Function | File | Purpose |
|---|---|---|
| `computeIRS(company, sectorHeat)` | `engine/irs.js` | Innovation Readiness Score (0-100) |
| `buildGraph(filters, relFilters, yearFilter, data)` | `engine/graph-builder.js` | Filter data → graph nodes/edges |
| `computeLayout(graphData, w, h)` | `engine/graph-layout.js` | d3-force simulation → positioned nodes |
| `computeGraphMetrics(nodes, edges)` | `engine/graph-metrics.js` | PageRank, betweenness, communities, watchlist |
| `computeForecast(company, benchmarks)` | `engine/forecast.js` | Timeline projection with confidence intervals |
| `computeRiskScore(company)` | `engine/forecast.js` | 0-100 weighted risk score |
| `computeScore(company, config)` | `engine/scoring.js` | Composite scoring |

## Data Flow

```
apps/{vertical}/src/data/*.js  →  migrate.js  →  SQLite (bbi.db)
                                                       ↓
App.jsx → useData(verticalId) → fetch /api/{v}/data → PlatformContext
              ↓ (fallback)                                ↓
         static imports                    BattleBornIntelligence.jsx
                                                ↓
                                    viewProps → *View.jsx components
```

## Port Reference

| Port | Service |
|---|---|
| 3001 | API server (Express + SQLite) |
| 5173 | GOED dev server (Vite) |
| 5174 | ESINT dev server (Vite) |
| 5175 | Template dev server (Vite) |

## Graph Node ID Conventions

| Type | Format | Example |
|---|---|---|
| Company | `c_{id}` | `c_1`, `c_42` |
| Fund | `f_{fundId}` | `f_bbv`, `f_ssbci` |
| Person | `p_{slug}` | `p_straubel`, `p_john_smith` |
| External | `x_{slug}` | `x_doe`, `x_tesla` |
| Accelerator | direct id | `startupnv` |
| EcosystemOrg | direct id | `goed`, `edawn` |
| Sector | `s_{name}` | `s_cleantech` (derived) |
| Region | `r_{name}` | `r_southern_nevada` (derived) |
