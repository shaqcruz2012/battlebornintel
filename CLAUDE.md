# BBI Platform — Claude Code Instructions

## Project Structure

pnpm monorepo with shared UI core, per-vertical apps, and API backend:

```
packages/ui-core/       # @bbi/ui-core — shared components, engine, styles, hooks
apps/goed/              # BBI-GOED — Nevada startup ecosystem (75 companies)
apps/esint/             # BBI-ESINT — Energy Storage & Interconnection in Nevada (18 projects)
apps/template/          # Starter template for new verticals
services/api/           # @bbi/api — Express + SQLite REST API (port 3001)
services/data-pipeline/ # Enterprise data collection scaffold
scripts/                # CLI tools (validate-data.js)
```

## Key Commands

```bash
# Must set Node 20 on this machine:
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"

# Install
npx pnpm@8 install

# Dev servers (frontend)
npx pnpm@8 --filter goed dev        # localhost:5173
npx pnpm@8 --filter esint dev       # localhost:5174
npx pnpm@8 --filter template dev

# API server
node services/api/src/index.js       # localhost:3001

# Build
npx pnpm@8 --filter goed build
npx pnpm@8 --filter esint build

# Database migrations (JSON → SQLite)
node services/api/src/migrate.js --vertical goed --path apps/goed
node services/api/src/migrate.js --vertical esint --path apps/esint

# Validate data
node scripts/validate-data.js apps/goed
node scripts/validate-data.js apps/esint
node scripts/validate-data.js apps/template
```

## API Server (services/api)

SQLite-backed REST API using better-sqlite3 + Express. Multi-tenant via `vertical_id` on every table.

### Architecture

- **Database**: SQLite with WAL mode, FTS5 search, stored at `services/api/bbi.db`
- **Schema**: `services/api/schema.sql` — 15 tables + FTS5 virtual table + indexes
- **Port**: 3001 (configurable via `PORT` env)
- **CORS**: Allows localhost:5173-5175 (Vite dev ports)
- **Frontend integration**: `useData(verticalId)` hook fetches from API, falls back to static imports

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check, lists verticals |
| GET | `/api/:v/data` | Full DataPackage (all entity types) |
| GET | `/api/:v/data/config` | Vertical config object |
| GET/POST/PUT/DELETE | `/api/:v/companies[/:id]` | Company CRUD + filtering |
| GET/POST/DELETE | `/api/:v/funds[/:id]` | Fund CRUD |
| GET/POST/DELETE | `/api/:v/timeline[/:id]` | Timeline event CRUD |
| GET/POST/DELETE | `/api/:v/graph/people[/:id]` | Person CRUD |
| GET/POST/DELETE | `/api/:v/graph/externals[/:id]` | External CRUD |
| GET/POST/DELETE | `/api/:v/graph/accelerators[/:id]` | Accelerator CRUD |
| GET/POST/DELETE | `/api/:v/graph/ecosystemOrgs[/:id]` | EcosystemOrg CRUD |
| GET/POST/DELETE | `/api/:v/graph/funds[/:id]` | GraphFund CRUD |
| GET/POST/DELETE | `/api/:v/graph/edges[/:id]` | Edge CRUD |
| POST | `/api/:v/graph/edges/bulk` | Bulk edge create |
| GET/POST/PUT/DELETE | `/api/:v/enterprise/dockets[/:id]` | Docket CRUD |
| GET/POST/DELETE | `/api/:v/enterprise/ppas[/:id]` | PPA CRUD |
| GET/POST/DELETE | `/api/:v/enterprise/queue[/:id]` | Queue entry CRUD |
| GET/PUT | `/api/:v/enterprise/benchmarks` | Benchmarks get/set |
| GET | `/api/:v/search?q=term` | FTS5 full-text search |
| GET | `/api/:v/graph/metrics` | Graph metrics (cached) |

### Company Filtering

`GET /api/:v/companies` supports query params:
- `?stage=seed` — filter by stage
- `?region=Southern+Nevada` — filter by region
- `?search=lithium` — LIKE search on name/description
- `?sort=momentum` / `?sort=funding` / `?sort=name` — sort order
- `?limit=20&offset=0` — pagination

### Database Schema (key tables)

- `verticals` — id, name, config_json
- `companies` — all Company fields, snake_case columns, JSON for arrays (sector, eligible)
- `funds` — all Fund fields
- `timeline_events` — date-ordered events
- `graph_funds`, `people`, `externals`, `accelerators`, `ecosystem_orgs` — graph nodes
- `edges` — source, target, rel, note, year
- `listings` — company_id, exchange, ticker
- `dockets`, `ppas`, `queue_entries`, `benchmarks` — enterprise data
- `companies_fts` — FTS5 virtual table (name, description, city, sector) with auto-sync triggers
- `graph_metrics_cache` — cached PageRank/betweenness/communities per filter hash

### Migration

The migration script imports static JS data files into SQLite:

```bash
node services/api/src/migrate.js --vertical goed --path apps/goed
# Output: Migrated goed: 75 companies, 8 funds, 529 edges, 84 people, ...
```

- Clears existing data for the vertical before inserting (idempotent)
- Maps camelCase JS → snake_case SQL columns
- JSON.stringify for array fields (sector, eligible, filings, etc.)
- Uses `INSERT OR REPLACE` for graph entities (handles duplicates)
- Transaction-wrapped for atomicity

### Frontend Data Flow

```
App.jsx → useData('goed') → fetch /api/goed/data → PlatformContext → views
                           ↓ (on error)
                    static imports fallback
```

Vite dev servers proxy `/api` to `localhost:3001` — no CORS issues in development.

---

## Data Schema Contract

All data must conform to `packages/ui-core/src/data/schema.js`. Run `validate-data.js` after any data changes.

### Entity Types

| Type | File | ID Format | Required Fields |
|------|------|-----------|-----------------|
| Company | `data/companies.js` | numeric `id` | name, stage, sector[], city, region, funding, momentum, employees, founded, description, eligible[], lat, lng |
| Fund | `data/funds.js` | string `id` | name, type, allocated, deployed, leverage, companies, thesis |
| TimelineEvent | `data/timeline.js` | — | date (YYYY-MM-DD), type, company, detail, icon |
| GraphFund | `data/graph.js` | string `id` | name, type |
| Person | `data/graph.js` | string `id` (p_*) | name, role, companyId, note |
| External | `data/graph.js` | string `id` (x_*) | name, etype, note |
| Accelerator | `data/graph.js` | string `id` | name, atype, city, region, founded, note |
| EcosystemOrg | `data/graph.js` | string `id` | name, etype, city, region, note |
| Listing | `data/graph.js` | — | companyId, exchange, ticker |
| Edge | `data/graph.js` | — | source, target, rel, note?, y? |

### Graph Node ID Conventions
- Companies: `c_{id}` (e.g., `c_1`)
- Funds: `f_{fundId}` (e.g., `f_bbv`)
- People: `p_{slug}` (e.g., `p_straubel`)
- Externals: `x_{slug}` (e.g., `x_doe`)
- Accelerators/Orgs: direct id

### Edge Relationship Types
`invested_in`, `eligible_for`, `backed_by`, `partners_with`, `contract_with`, `grant_from`, `regulates`, `alumni_of`, `located_in`, `founded_by`, `advises`, `board_member`, `co_invested`, `acquired_by`, `spun_out_of`

### Enterprise Data (Optional — ESINT)

| Type | File | ID Format | Required Fields |
|------|------|-----------|-----------------|
| Docket | `data/dockets.js` | string `id` | title, agency, status, openDate, projects[], filings[] |
| PPA | `data/ppa.js` | string `id` | project, buyer, technology |
| QueueEntry | `data/queue.js` | string `id` | projectName, requestMW, type, substation, status, county |
| Benchmarks | `data/benchmarks.js` | — | STAGE_BENCHMARKS[tech][transition] = {p25,median,p75} |

Enterprise fields on Company (all optional): `capacityMW`, `storageMWh`, `acreage`, `developer`, `epc`, `estimatedCOD`, `docketIds[]`, `queueIds[]`, `ppaIds[]`, `keyMilestones[{date,event,status}]`, `riskFactors[]`, `permittingScore`

### Enterprise Views (config.features gated)

| View | Feature Flag | Data Required |
|------|-------------|---------------|
| Dockets | `dockets: true` | `data.dockets` |
| Forecast | `forecast: true` | `data.benchmarks` + company milestones |
| Queue | `queue: true` | `data.queue` |
| PPAs | `ppa: true` | `data.ppa` |
| Alerts | `alerts: true` | any enterprise data |

### Forecast Engine

`computeForecast(company, benchmarks)` — projects timeline with confidence intervals using sector-specific stage-duration benchmarks + risk multipliers.

`computeRiskScore(company)` — 0-100 weighted risk score (regulatory delay, transmission dependency, environmental, stage position, permitting).

### Company Stages
`pre_seed`, `seed`, `series_a`, `series_b`, `series_c_plus`, `growth`

### ESINT Energy Stages
`proposed`, `queue`, `nepa_review`, `approved`, `under_construction`, `operational`, `retired`

### Timeline Event Types
`funding`, `partnership`, `hiring`, `launch`, `momentum`, `grant`, `patent`, `award`

### ESINT Event Types
`filing`, `approval`, `construction`, `operational`, `rfp`, `docket`, `blm`, `partnership`, `funding`

## Creating a New Vertical

1. Copy `apps/template/` to `apps/{vertical}/`
2. Edit `src/config.js` — set branding, views, sectorHeat, regions, features
3. Populate `src/data/` files following schema shapes
4. Run `node scripts/validate-data.js apps/{vertical}`
5. Run `node services/api/src/migrate.js --vertical {vertical} --path apps/{vertical}`
6. Add workspace scripts to root `package.json`

## Research Agent Workflow

When populating data for a new vertical, follow this sequence:

### Phase 1: Landscape Discovery
- Define the vertical scope (geography, industry, company criteria)
- Search for industry reports, state economic development databases, accelerator portfolios
- Build initial company list (aim for 30-75 companies)

### Phase 2: Company Profiling
For each company, research and fill all Company fields:
- **name**: Legal/common name
- **stage**: Map from latest funding round (pre_seed → growth)
- **sector**: 1-3 tags from config.sectorHeat keys
- **city/region**: Map to config.regions entries
- **funding**: Total raised in $M (Crunchbase, PitchBook, press)
- **momentum**: 0-100 score based on recent activity, growth signals, press
- **employees**: Latest headcount (LinkedIn, press)
- **founded**: Year
- **description**: 1-2 sentence summary with key metrics/differentiators
- **eligible**: Fund IDs from funds.js that this company qualifies for
- **lat/lng**: Geocode from city

### Phase 3: Fund & Investor Mapping
- Identify active funds in the region/sector
- Map fund types: SSBCI, Angel, VC, Growth, Federal
- Track allocated, deployed, leverage, portfolio size

### Phase 4: Graph Entity Discovery
- **People**: Key founders, executives, board members (id: `p_slug`)
- **Externals**: Corporations, VCs, government agencies, universities (id: `x_slug`)
- **Accelerators**: Programs, incubators in the region
- **EcosystemOrgs**: EDAs, chambers, industry groups

### Phase 5: Relationship Mapping (Edges)
- Map investment relationships (company → fund)
- Map partnerships (company → external)
- Map government relationships (grants, contracts, regulation)
- Map people → companies (founded_by, advises, board_member)
- Map accelerator alumni
- Each edge needs: source node ID, target node ID, rel type, note, year

### Phase 6: Timeline Events
- Gather recent funding rounds, partnerships, hires, launches, awards
- Date format: YYYY-MM-DD
- Icon suggestions: 💰 funding, 🤝 partnership, 👥 hiring, 🚀 launch, 📈 momentum, 🏆 award, 📋 grant, 🔬 patent

### Phase 7: Validate
```bash
node scripts/validate-data.js apps/{vertical}
```
Fix all errors. Review warnings. Iterate.

## Momentum Score Guide

Score companies 0-100 based on weighted signals:
- Recent funding round: +15-25
- Revenue growth / ARR milestones: +10-20
- Headcount growth (>20% YoY): +10-15
- Major partnership or contract: +5-10
- Press coverage / awards: +5-10
- Product launch or expansion: +5-10
- Deduct for layoffs, down rounds, or stagnation

## Config: sectorHeat Scores

Rate each sector 0-100 based on:
- Regional investment activity
- Policy support and incentives
- Talent pipeline and university programs
- Growth trajectory in the region
- National trends weighted for local relevance
