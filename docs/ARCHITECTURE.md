# Architecture

## System Overview

BBI is a three-tier application:

```
React + Vite (SPA)  -->  Express API  -->  PostgreSQL 16
     :5173                 :3001              :5433
```

The frontend is a single-page React app bundled by Vite. It communicates with a stateless Express REST API over JSON. PostgreSQL stores all entities, relationships, timeline events, computed scores, and cached metrics.

## Directory Structure

```
battlebornintel/
  api/
    src/
      db/
        pool.js              # pg Pool singleton
        queries/             # One file per domain (companies, funds, graph, ...)
      engine/
        scoring.js           # IRS score computation
        graph-metrics.js     # PageRank, betweenness, community detection
      middleware/
        cache.js             # In-memory TTL cache middleware
        errorHandler.js      # Centralised error handler
      routes/                # Express routers (one per resource)
      services/              # Business logic (scoringService, graphService)
      config.js              # Env-based configuration
      index.js               # App entry point, route registration
  frontend/
    src/
      api/
        client.js            # Axios instance
        hooks.js             # React Query hooks for all endpoints
      components/
        dashboard/           # Executive dashboard, KPI cards, momentum table
        brief/               # Weekly intelligence brief
        companies/           # Company list and detail
        funds/               # Fund cards and portfolio view
        graph/               # Graph canvas (Canvas 2D), controls, panels
        feed/                # Stakeholder activity feed
        goed/                # GOED government dashboard
        ecosystem/           # Kauffman resource matrix
        search/              # Cmd+K search overlay with fuzzy index
        layout/              # AppShell, Header, ViewTabs
      hooks/
        useFilters.js        # Global filter context
        useGraphLayout.js    # Web Worker bridge for D3 layout
      workers/
        d3-layout.worker.js  # D3 force simulation (off main thread)
      data/
        edges.js             # Static edge definitions (fallback)
        graph-entities.js    # Static node definitions (fallback)
      App.jsx                # Root component, lazy-loaded views
  database/
    migrations/              # 100+ sequential SQL migrations
    seeds/
      seed.js                # Node.js seeder for companies, funds, edges, events
  agents/                    # Python agent scripts (analysis, data extraction)
  docs/                      # Consolidated documentation
    archive/                 # Legacy per-feature docs
  docker-compose.yml         # PostgreSQL 16 service
```

## Data Flow

```
PostgreSQL
  |
  v
db/queries/*.js        SQL queries return row arrays
  |
  v
routes/*.js            Express routers parse params, call queries
  |
  v
cacheMiddleware        In-memory Map with per-route TTL (60s-600s)
  |
  v
HTTP JSON response     Wrapped in { data: ... } or { success, data, meta }
  |
  v
api/hooks.js           React Query hooks (useCompanies, useFunds, useGraph, ...)
  |
  v
Components             Render data; filters flow down via FilterProvider context
```

## Graph Engine

The interactive graph uses a two-layer architecture:

1. **D3 Force Simulation (Web Worker)** — `d3-layout.worker.js` runs a D3 force simulation off the main thread. It uses a "Milky Way cigar" layout with elliptical coordinate zones: companies in a dense core, funds as inner arms, accelerators in a thin band, ecosystem orgs in an outer ring, externals in a halo, and people at the periphery. Deterministic hashing (FNV-1a) ensures stable layouts across runs.

2. **Canvas 2D Renderer** — `GraphCanvas.jsx` renders nodes and edges on an HTML Canvas element using `requestAnimationFrame`. Supports pan/zoom, hover tooltips, click selection, and double-click zoom. Edge labels show dollar values when the "$ Values" toggle is active.

Layout computation flow:
```
GraphView mounts
  -> useGraphLayout posts { nodes, edges, width, height } to Worker
  -> Worker runs D3 forceSimulation with custom forces
  -> Worker posts back positioned nodes on each tick
  -> GraphCanvas renders positioned nodes/edges on Canvas 2D
```

## Scoring Engine

**IRS (Innovation Readiness Score)** is a 0-100 composite score computed per company by `api/src/engine/scoring.js`. Dimensions include funding level, employee count, momentum, sector heat, and stage norms. Results are cached in the `computed_scores` table and exposed via a materialized view `latest_company_scores` for fast joins.

**REAP Metrics** aggregate timeline events into MIT REAP framework categories (Risk Capital, Entrepreneurship, Enablers, Human Capital, etc.) via `GET /api/timeline/reap`.

**Graph Metrics** (PageRank, Betweenness Centrality, Community Detection) are computed by `api/src/engine/graph-metrics.js` and cached in `graph_metrics_cache`. Exposed via `GET /api/graph/metrics`.

## Caching Strategy

### Server-side (Express middleware)
An in-memory `Map`-based cache in `api/src/middleware/cache.js` intercepts `res.json()` on GET requests:

| Route prefix            | Server TTL | Cache-Control header       |
|------------------------|-----------|---------------------------|
| `/api/companies`       | 300s      | `public, max-age=3600`    |
| `/api/funds`           | 300s      | `public, max-age=3600`    |
| `/api/graph`           | 300s      | `public, max-age=3600`    |
| `/api/constants`       | 600s      | `public, max-age=3600`    |
| `/api/opportunities`   | 300s      | `public, max-age=3600`    |
| `/api/kpis`            | 120s      | `public, max-age=120`     |
| `/api/timeline`        | 120s      | `public, max-age=120`     |
| `/api/analysis`        | 60s       | `private, max-age=60`     |
| `/api/stakeholder-activities` | 60s | `private, max-age=60`  |

Cache keys are generated from `method:path?sorted-query-params`. The `X-Cache: HIT|MISS` response header indicates cache status.

### Client-side (React Query)
React Query hooks set `staleTime` per-resource to avoid redundant refetches.

### Database-level
- **Materialized view** `latest_company_scores`: pre-computed DISTINCT ON join, refreshed hourly.
- **graph_metrics_cache table**: stores PageRank/betweenness/community per node.

## Key Design Decisions

- **Canvas over SVG** for the graph renderer: 800+ edges would choke SVG DOM; Canvas 2D with `requestAnimationFrame` throttling keeps interaction smooth.
- **Web Worker for layout**: D3 force simulation is CPU-intensive. Offloading it prevents main-thread jank during initial layout computation.
- **Lazy-loaded views**: All views except Executive Dashboard are `React.lazy()` loaded to keep initial bundle small.
- **No ORM**: Raw SQL queries via `pg` pool for full control over joins and performance.
- **In-memory cache over Redis**: Single-process deployment keeps it simple. The cache auto-expires entries via `setTimeout` timers.
- **Rate limiting without dependencies**: A lightweight in-memory counter map with periodic reset replaces external rate-limit middleware.
- **Polymorphic entity references**: `graph_edges` uses string `source_id`/`target_id` to reference companies, funds, people, externals, accelerators, and ecosystem orgs by their respective ID columns.
