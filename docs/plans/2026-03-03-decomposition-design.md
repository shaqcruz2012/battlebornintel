# BBI Monorepo Decomposition + SQLite Backend Design

## Goal

Decompose the single-file BBI app (`src/App.jsx`, ~2245 lines) into a pnpm monorepo with an Express + SQLite API backend, and replace the D3 force-directed graph with Cytoscape.js.

## Audience

Same: SSBCI program managers, economic development officers, GOED leadership.

## Monorepo Structure

```
battlebornintel/
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   └── goed/                       # Vite + React 19 frontend
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
│           ├── main.jsx
│           ├── App.jsx             # shell: nav, routing, layout
│           ├── hooks/
│           │   └── useApi.js       # fetch wrapper for API calls
│           ├── views/
│           │   ├── Dashboard.jsx
│           │   ├── SSBCI.jsx
│           │   ├── Radar.jsx
│           │   ├── Companies.jsx
│           │   ├── Funds.jsx
│           │   ├── Sectors.jsx
│           │   ├── Graph.jsx       # Cytoscape wrapper
│           │   ├── Timeline.jsx
│           │   ├── Map.jsx
│           │   └── Brief.jsx
│           └── components/
│               ├── ReapChipBar.jsx
│               ├── Stat.jsx
│               ├── DetailPanel.jsx
│               └── Counter.jsx
├── packages/
│   └── ui-core/                    # shared constants, REAP helpers
│       ├── package.json
│       └── src/
│           ├── constants.js        # colors, VIEWS, REAP_PILLARS, configs
│           ├── reap.js             # getReapPillar, getCompanyReapConnections
│           └── scoring.js          # computeIRS engine
├── services/
│   └── api/                        # Express + SQLite backend
│       ├── package.json
│       ├── server.js               # Express app, CORS, routes
│       ├── db/
│       │   ├── schema.sql          # table definitions
│       │   ├── seed.js             # migrate hardcoded data → SQLite
│       │   └── bbi.db              # SQLite file (gitignored)
│       └── routes/
│           ├── companies.js
│           ├── funds.js
│           ├── graph.js
│           ├── timeline.js
│           └── stats.js
└── docs/plans/
```

## Database Schema

6 tables mirroring current JS data arrays:

### companies (75 rows)
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| stage | TEXT | pre_seed, seed, series_a, series_b, series_c_plus, growth |
| sectors | TEXT | JSON array: ["AI","Fintech"] |
| city | TEXT | |
| region | TEXT | reno, las_vegas, rural |
| funding | REAL | $M raised |
| momentum | INTEGER | 0-100 |
| employees | INTEGER | |
| founded | INTEGER | |
| description | TEXT | |
| eligible | TEXT | JSON array: ["bbv","fundnv"] |
| lat | REAL | |
| lng | REAL | |

### funds (8 rows)
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | "bbv", "fundnv", etc. |
| name | TEXT NOT NULL | |
| type | TEXT | SSBCI, Angel, Deep Tech VC, Growth VC, Accelerator |
| allocated | REAL | |
| deployed | REAL | |
| leverage | REAL | |
| companies | INTEGER | |
| thesis | TEXT | |

### entities (unified: externals + accelerators + ecosystem_orgs + people + graph_funds)
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | "x_stellantis", "a_startupnv", "e_goed", "p_straubel" |
| name | TEXT NOT NULL | |
| category | TEXT | external, accelerator, ecosystem, person, graph_fund |
| etype | TEXT | Corporation, VC Firm, Government, University, etc. |
| atype | TEXT | Accelerator type (accelerators only) |
| role | TEXT | Person role |
| city | TEXT | |
| region | TEXT | |
| founded | INTEGER | |
| company_id | INTEGER | FK for people |
| note | TEXT | |

### edges (~300 rows)
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTO | |
| source | TEXT NOT NULL | entity/company/fund ID |
| target | TEXT NOT NULL | entity/company/fund ID |
| rel | TEXT NOT NULL | invested_in, partners_with, etc. |
| note | TEXT | |
| year | INTEGER | |

### timeline_events (~30 rows)
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AUTO | |
| date | TEXT NOT NULL | ISO date |
| type | TEXT | funding, partnership, hiring, etc. |
| company | TEXT | company name |
| detail | TEXT | |
| icon | TEXT | emoji |

### listings (14 rows)
| Column | Type | Notes |
|--------|------|-------|
| company_id | INTEGER | |
| exchange | TEXT | |
| ticker | TEXT | |
| PK | (company_id, exchange) | |

## API Routes

Read-only REST endpoints:

| Method | Route | Returns |
|--------|-------|---------|
| GET | /api/companies | All companies with computed IRS scores |
| GET | /api/companies/:id | Single company + edges + timeline events |
| GET | /api/funds | All funds with SSBCI summary stats |
| GET | /api/graph | Full graph: entities + edges (for Cytoscape) |
| GET | /api/graph?pillar=X | Graph filtered by REAP pillar |
| GET | /api/timeline | All timeline events, sorted by date desc |
| GET | /api/stats/ssbci | SSBCI KPIs: deployed, leverage, portfolio count, avg IRS |
| GET | /api/stats/ecosystem | Total funding, total jobs, company count |
| GET | /api/entities | All entities (for REAP classification) |

IRS computation in `packages/ui-core/scoring.js` — shared between API and frontend.

## Cytoscape.js Migration

Replace D3 force-directed SVG graph with Cytoscape.js.

### What changes:
- Install cytoscape + cytoscape-cose-bilkent
- New Graph.jsx fetches /api/graph, renders Cytoscape container
- cose-bilkent layout for force-directed clustering
- Node styling: size by degree, color by type (NODE_CFG)
- REAP filter: toggle opacity via Cytoscape classes
- Click → DetailPanel, edge hover → tooltip

### What stays:
- computeGraphMetrics (PageRank, betweenness, community) moves to scoring.js
- Node type colors and relationship configs stay as constants

### What's removed:
- D3 force simulation, SVG rendering, manual zoom/pan
- buildGraph and computeLayout functions

## Migration Strategy

### Phase 1: Scaffold + Backend
- pnpm monorepo setup with workspace config
- Express server + SQLite schema + seed script
- API routes
- Frontend still single-file, swapped to fetch from API

### Phase 2: Frontend Decomposition
- Extract constants/helpers → packages/ui-core/
- Extract views into individual files
- Extract shared components
- App.jsx becomes nav + routing shell
- useApi hook for data fetching

### Phase 3: Cytoscape Graph
- Install cytoscape dependencies
- Build new Graph.jsx
- Move graph metrics to API
- Remove D3

## No Changes

- REAP stakeholder lens (stays, decomposed into components)
- Weekly Brief view (stays, becomes Brief.jsx)
- SSBCI-focused Dashboard KPIs (stays, becomes Dashboard.jsx)
- All 75 companies, 8 funds, ~300 edges — migrated to SQLite unchanged
- BBI branding, colors, styling
