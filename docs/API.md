# API Reference

Base URL: `http://localhost:3001`

All endpoints return JSON. Public endpoints are rate-limited to 300 requests/minute per IP. Admin endpoints require the `X-Admin-Key` header and are limited to 10 requests/minute.

---

## Health

### `GET /api/health`
Returns API and database connection status.

**Response:**
```json
{ "status": "ok", "db": "connected", "version": "1.0.0" }
```

---

## Companies

**Cache:** 300s server, `public, max-age=3600`

### `GET /api/companies`
List all companies with optional filters.

| Query Param | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `stage`     | string | Filter by stage (seed, series_a, etc.) |
| `region`    | string | Filter by region                     |
| `sector`    | string | Filter by sector                     |
| `search`    | string | Free-text search on name/description |
| `sortBy`    | string | Sort field                           |

**Response:** `{ data: Company[] }`

### `GET /api/companies/:id`
Get a single company by integer ID.

**Response:** `{ data: Company }`
**Errors:** 400 (invalid id), 404 (not found)

---

## Funds

**Cache:** 300s server, `public, max-age=3600`

### `GET /api/funds`
List all funds.

**Response:** `{ data: Fund[] }`

### `GET /api/funds/:id`
Get a single fund by string ID.

**Response:** `{ data: Fund }`
**Errors:** 404 (not found)

---

## Graph

**Cache:** 300s server, `public, max-age=3600`

### `GET /api/graph`
Get all graph nodes and edges.

| Query Param | Type   | Default | Description                                          |
|-------------|--------|---------|------------------------------------------------------|
| `nodeTypes` | string | `company,fund,person,external,accelerator,ecosystem` | Comma-separated node types to include |
| `yearMax`   | number | 2026    | Filter edges by event_year <= yearMax                |
| `region`    | string | `all`   | Filter by region                                     |

**Response:** `{ data: { nodes: Node[], edges: Edge[] } }`

### `GET /api/graph/metrics`
Get cached graph metrics (PageRank, betweenness, communities, watchlist). Falls back to live computation if cache is empty.

**Response:**
```json
{
  "data": {
    "pagerank": { "node-id": score, ... },
    "betweenness": { "node-id": score, ... },
    "communities": { "node-id": community_id, ... },
    "watchlist": [],
    "numCommunities": 12
  },
  "source": "cache|computed|empty"
}
```

---

## KPIs

**Cache:** 120s server, `public, max-age=120`

### `GET /api/kpis`
Aggregate KPI metrics.

| Query Param | Type   | Description         |
|-------------|--------|---------------------|
| `stage`     | string | Filter by stage     |
| `region`    | string | Filter by region    |
| `sector`    | string | Filter by sector    |

**Response:** `{ data: KpiAggregates }`

### `GET /api/kpis/sectors`
Sector-level statistics.

| Query Param | Type   | Description      |
|-------------|--------|------------------|
| `region`    | string | Filter by region |

**Response:** `{ data: SectorStat[] }`

---

## Timeline

**Cache:** 120s server, `public, max-age=120`

### `GET /api/timeline`
Recent timeline events.

| Query Param | Type   | Default | Description                                                        |
|-------------|--------|---------|--------------------------------------------------------------------|
| `limit`     | number | 30      | Max events (capped at 500)                                        |
| `type`      | string | —       | Event type: Funding, Grant, Hiring, Partnership, Launch, Patent, Milestone, Award, Expansion, Acquisition, Founding |

**Response:** `{ data: TimelineEvent[] }`

### `GET /api/timeline/weeks`
All weeks with timeline events and counts.

**Response:** `{ data: WeekSummary[] }`

### `GET /api/timeline/reap`
MIT REAP framework metrics aggregated from events.

| Query Param | Type   | Description                     |
|-------------|--------|---------------------------------|
| `since`     | string | Start date (YYYY-MM-DD)        |
| `until`     | string | End date (YYYY-MM-DD)          |

**Response:** `{ data: REAPMetrics }`

### `GET /api/timeline/week/:date`
Events for a specific ISO week.

| Path Param | Type   | Description                        |
|------------|--------|------------------------------------|
| `date`     | string | Monday of the week (YYYY-MM-DD)   |

**Response:** `{ data: TimelineEvent[], weekStart: string, eventCount: number }`

---

## Analysis

**Cache:** 60s server, `private, max-age=60`

### `GET /api/analysis/company/:id`
AI-generated analysis for a company.

**Response:** `{ data: AnalysisContent }` or `{ data: null, message: "No analysis available yet" }`

### `GET /api/analysis/brief`
Latest weekly intelligence brief.

| Query Param | Type   | Description            |
|-------------|--------|------------------------|
| `weekStart` | string | Week start (YYYY-MM-DD)|
| `weekEnd`   | string | Week end (YYYY-MM-DD)  |

**Response:** `{ data: BriefContent, generatedAt: timestamp }`

### `GET /api/analysis/brief/:weekStart`
Brief for a specific week.

**Response:** `{ data: BriefContent, generatedAt: timestamp }`

### `GET /api/analysis/risks`
Risk assessments across companies.

**Response:** `{ data: RiskAssessment[] }`

---

## Stakeholder Activities

**Cache:** 60s server, `private, max-age=60`

### `GET /api/stakeholder-activities`
Activity feed with filters and pagination.

| Query Param       | Type   | Default | Description                                                     |
|--------------------|--------|---------|----------------------------------------------------------------|
| `location`         | string | `all`   | Nevada region (las_vegas, reno, henderson, carson_city)        |
| `since`            | string | —       | Start date (YYYY-MM-DD)                                        |
| `until`            | string | —       | End date (YYYY-MM-DD)                                          |
| `limit`            | number | 100     | Max activities (capped at 500)                                  |
| `type`             | string | —       | Activity type filter                                            |
| `stakeholder_type` | string | —       | gov_policy, university, corporate, risk_capital, ecosystem     |

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": { "count": 50, "total": 234, "limit": 100, "hasMore": true, "filters": {...} }
}
```

### `GET /api/stakeholder-activities/company/:companyId`
Activities for a specific company.

| Query Param | Type   | Default | Description     |
|-------------|--------|---------|-----------------|
| `limit`     | number | 20      | Max activities  |

**Response:** `{ success: true, data: [...], meta: { count } }`

### `GET /api/stakeholder-activities/location/:location`
Activities by location with date range.

| Query Param | Type   | Default       | Description  |
|-------------|--------|---------------|--------------|
| `since`     | string | 90 days ago   | Start date   |
| `until`     | string | today         | End date     |

**Response:** `{ success: true, data: [...], meta: { count, location, dateRange } }`

### `GET /api/stakeholder-activities/stats/by-type`
Activity counts grouped by type.

### `GET /api/stakeholder-activities/stats/by-location`
Activity counts grouped by location.

---

## Opportunities

**Cache:** 300s server, `public, max-age=3600`

### `GET /api/opportunities`
List opportunity edges with filters and pagination.

| Query Param  | Type   | Default | Values                          |
|-------------|--------|---------|---------------------------------|
| `quality`   | string | `all`   | excellent, good, fair, all      |
| `entityType`| string | `all`   | program, fund, all              |
| `sector`    | string | —       | Sector filter                   |
| `stage`     | string | —       | Stage filter                    |
| `search`    | string | —       | Text search                     |
| `sortBy`    | string | `score` | score, company, recent          |
| `limit`     | string | `100`   | Page size                       |
| `offset`    | string | `0`     | Pagination offset               |

**Response:** `{ data: Opportunity[], meta: { total, limit, offset, filters } }`

### `GET /api/opportunities/stats`
Aggregate opportunity statistics.

**Response:** `{ data: OpportunityStats }`

### `GET /api/opportunities/company/:companyId`
All opportunities for a specific company.

**Response:** `{ data: Opportunity[], summary: OpportunitySummary }`

---

## Constants

**Cache:** 600s server, `public, max-age=3600`

### `GET /api/constants`
All system constants (sector heat, stage norms, etc.).

**Response:** `{ data: { key: value, ... } }`

---

## Dashboard Batch

**Cache:** 300s server, `public, max-age=300`

### `GET /api/dashboard-batch`
Fetch multiple dashboard datasets in one request.

| Query Param  | Type    | Default | Description                        |
|-------------|---------|---------|-------------------------------------|
| `companies` | boolean | true    | Include companies list              |
| `kpis`      | boolean | true    | Include KPI aggregates              |
| `funds`     | boolean | true    | Include funds list                  |
| `sectors`   | boolean | true    | Include sector stats                |
| `filters`   | string  | —       | JSON string passed to queries       |

**Response:** `{ companies?, kpis?, funds?, sectors? }`

### `GET /api/dashboard-batch/executives`
Companies + KPIs optimised for the executive dashboard.

**Response:** `{ companies, kpis }`

### `GET /api/dashboard-batch/goed`
KPIs + sectors + companies scoped by region for the GOED dashboard.

| Query Param | Type   | Description      |
|-------------|--------|------------------|
| `region`    | string | Nevada region    |

**Response:** `{ kpis, sectors, companies }`

---

## Admin (requires `X-Admin-Key` header)

### `GET /api/cache-stats`
Current in-memory cache statistics.

**Response:** `{ size: number, keys: string[] }`

### `POST /api/admin/recompute-scores`
Recompute IRS scores for all companies and cache in `computed_scores`.

**Response:** `{ data: { companiesScored: number }, message: "Scores recomputed" }`

### `POST /api/admin/recompute-graph`
Recompute graph metrics (PageRank, betweenness, communities) and cache.

**Response:** `{ data: { nodesCached: number }, message: "Graph metrics recomputed" }`

### `POST /api/admin/recompute-all`
Recompute both scores and graph metrics.

**Response:** `{ data: { companiesScored, nodesCached }, message: "All computations complete" }`
