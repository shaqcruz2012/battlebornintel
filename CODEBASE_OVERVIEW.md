# BattleBornIntel (BBI) — Codebase Overview

Regional innovation ecosystem intelligence platform for Nevada's startup, venture capital, and economic development landscape. Built to power Temporal Graph Neural Network (T-GNN) analysis of capital flows, institutional investor matching, ecosystem gap detection, and interstate benchmarking.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite)                                         │
│  D3 force graph · TanStack Query · 24 API hooks · Temporal slider   │
│  Port 5173                                                          │
├─────────────────────────────────────────────────────────────────────┤
│  API (Express.js)                                                   │
│  19 route modules · In-memory cache · Rate limiting · Admin key     │
│  Port 3001                                                          │
├─────────────────────────────────────────────────────────────────────┤
│  Agents (Python async)                                              │
│  11 agents · BaseAgent (LLM) + BaseModelAgent (statistical)         │
│  Claude API · statsmodels · lifelines · scikit-learn · networkx     │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL 16 (Docker, port 5433)                                  │
│  149 migrations · 40K+ lines SQL · 10 node types · 21+ edge types  │
│  Connection: postgresql://bbi:bbi_dev_password@localhost:5433/bbi   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
battlebornintel/
├── frontend/src/
│   ├── api/client.js              # API fetch functions
│   ├── api/hooks.js               # 24 TanStack Query hooks
│   ├── components/graph/          # D3 force graph (14 files)
│   │   ├── GraphView.jsx          # Main graph view + temporal slider
│   │   ├── GraphCanvas.jsx        # D3 canvas rendering
│   │   ├── NodeDetail.jsx         # Node detail sidebar
│   │   ├── TemporalSlider.jsx     # Year-based temporal filtering
│   │   ├── PathFinder.jsx         # Multi-hop path analysis
│   │   ├── CommunityPanel.jsx     # Community detection display
│   │   └── NetworkStats.jsx       # Centrality/betweenness stats
│   ├── components/                # dashboard/, companies/, funds/, etc.
│   ├── data/constants.js          # NODE_CFG, REL_CFG, SHEAT scores
│   └── App.jsx                    # Router + layout
│
├── api/src/
│   ├── index.js                   # Express server + middleware
│   ├── routes/                    # 19 route files
│   │   ├── graph.js               # Full graph nodes + edges
│   │   ├── graph-analytics.js     # PageRank, betweenness, communities
│   │   ├── scenarios.js           # Scenario CRUD + results
│   │   ├── forecasts.js           # Entity forecasts
│   │   ├── indicators.js          # FRED/BLS economic indicators
│   │   └── opportunities.js       # Opportunity matching
│   ├── db/queries/                # SQL query functions per domain
│   └── engine/                    # IRS scoring, graph metrics
│
├── agents/src/
│   ├── agents/                    # 11 agent implementations
│   │   ├── base_agent.py          # LLM agent base (Claude API)
│   │   ├── base_model_agent.py    # Statistical agent base
│   │   ├── panel_forecaster.py    # OLS time-series forecasting
│   │   ├── survival_analyzer.py   # Kaplan-Meier + Cox PH
│   │   ├── causal_evaluator.py    # DiD, PSM, spillover
│   │   ├── scenario_simulator.py  # Monte Carlo what-if engine
│   │   ├── company_analyst.py     # LLM company analysis
│   │   ├── weekly_brief.py        # Weekly intelligence brief
│   │   ├── risk_assessor.py       # Risk assessment
│   │   └── pattern_detector.py    # Pattern detection
│   ├── ingestion/                 # External data ingestors
│   │   ├── fred_ingestor.py       # FRED macro data (9 series)
│   │   ├── bls_ingestor.py        # BLS QCEW employment/wages
│   │   ├── sec_ingestor.py        # SEC filings
│   │   ├── uspto_ingestor.py      # Patent data
│   │   └── census_ingestor.py     # Census data
│   └── orchestration/
│       ├── runner.py              # Agent registry + execution
│       └── scheduler.py           # Cron-based scheduling
│
├── database/
│   ├── migrations/                # 149 SQL migrations (see below)
│   └── seeds/seed.js              # Additive seeder (--force for fresh)
│
├── CLAUDE.md                      # AI agent context routing
└── .claude/prompts/               # 8 domain-specific context files
```

---

## Knowledge Graph Schema

### 10 Node Types

| Prefix | Type | Table | Example IDs | Count |
|--------|------|-------|-------------|-------|
| `c_` | Company | `companies` | `c_29` (Lyten), `c_6` (Hubble) | 143 |
| `f_` | Fund | `funds` | `f_bbv`, `f_fundnv`, `f_1864` | 6 |
| `p_` | Person | `people` | `p_cook`, `p_kerslake` | 70+ |
| `x_` | External | `externals` | `x_intel`, `x_valor`, `x_samtman` | 145+ |
| `a_` | Accelerator | `accelerators` | `a_startupnv`, `a_gener8tor_lv` | 12 |
| `e_` | Ecosystem | `ecosystem_orgs` | `e_goed`, `e_edawn`, `e_lvgea` | 5 |
| `s_` | Sector | `sectors` | `s_tech`, `s_clean_energy` | — |
| `r_` | Region | `regions` | `r_nv`, `r_reno`, `r_las_vegas` | — |
| `ex_` | Exchange | `listings` | `ex_nasdaq_dfli`, `ex_nyse_ora` | 15 |
| `pr_` | Program | `programs` | `pr_bbv_ssbci`, `pr_goed_grants` | 22 |

### 21+ Edge Types

| Relationship | Direction | Example |
|---|---|---|
| `invested_in` | Investor → Company | `x_valor → c_128` (Positron AI) |
| `accelerated_by` | Accelerator → Company | `a_startupnv → c_132` (Flawless AI) |
| `founded_by` | Person → Company | `p_cook → c_29` (Lyten) |
| `employed_at` | Person → Org | `p_burns → e_goed` |
| `manages` | Person → Fund | `p_kerslake → f_bbv` |
| `acquired` | Acquirer → Target | — |
| `partners_with` | Entity ↔ Entity | `p_fatih → x_unr` |
| `qualifies_for` | Fund → Company | `f_bbv → c_128` |
| `won_pitch` | Company → Event | — |
| `funds` | Org → Company | `x_goed → c_131` |
| `spun_out` | University → Company | `x_unr → c_141` (Yerka) |
| `lp_investor` | LP → Fund | `x_nv_pers → f_bbv_iii` |

### 3 Edge Categories
- **historical** — Past events with `event_year`
- **opportunity** — Potential future connections (e.g., fund eligibility)
- **projected** — Forward-looking modeled edges

---

## Migration Architecture (149 Migrations)

### Phase 1: Schema Foundation (001–015)
| Range | Purpose |
|-------|---------|
| 001 | Initial schema: companies, graph_edges, funds, timeline_events |
| 002–005 | Reference tables (regions, sectors, programs, universities, vc_firms, corporations, gov_agencies), entity tables, metric_snapshots, scenarios, models |
| 006–008 | Data backfill, views/functions, security/permissions |
| 009 | Data source tracking |
| 010–015 | Performance: indexes, materialized scores, denormalized graph, query caching |

### Phase 2: Feature Development (016–100)
| Range | Purpose |
|-------|---------|
| 016–020 | Stakeholder activities, opportunity edges, SBIR/STTR programs |
| 021–050 | Company enrichment batches (funding, partnerships, expansions) |
| 051–080 | Graph entity batches (new companies, investors, edges) |
| 081–100 | Economic indicators, auth/audit tables, materialized views |

### Phase 3: DB Consolidation (130–135) — Source of Truth Migration
| Migration | Purpose |
|-----------|---------|
| 130 | Seed 127 companies from frontend static data → DB |
| 131 | Seed graph entities: 6 funds, 6 people, 135 externals, 12 accelerators, 5 ecosystem orgs, 15 listings |
| 132 | Seed 735 graph edges from frontend edge data |
| 133 | Seed timeline events + 10 constant categories |
| 134 | Seed 22 verified Nevada programs |
| 135 | Data validation views (orphan edges, duplicates, conflicts, temporal gaps) |

### Phase 4: T-GNN Feature Enrichment (136–140)
| Migration | Purpose |
|-----------|---------|
| 136 | Tech/IP: patent counts, IP moat scores, federal R&D, tech domains for 16 companies |
| 137 | Financial: revenue, valuations, burn rates, growth rates for 20+ companies |
| 138 | Market/competitive: TAM, competitor counts, market position, customer counts for 20 companies |
| 139 | Founder/team: 30+ new people nodes, founder experience years, prior exits |
| 140 | **Critical fix**: node_features materialized view join (`c_` + id, not slug) + enrichment columns |

### Phase 5: New Entity Discovery (141–144)
| Migration | Purpose |
|-----------|---------|
| 141 | 16 new verified companies (IDs 128–143): Positron AI, BRINC Drones, P-1 AI, NeuroGum, Flawless AI, Edison XFC, Decentral AI, Noovo, Blolabel.ai, SorbiForce, X-Regen, Carbo Energy, Metal Light, Yerka Seed, SLEKE, Ghostwryte.ai |
| 142 | 35+ new edges: investors (Valor, DFJ, Radical, Motorola, Sam Altman), accelerator participation, fund eligibility, founder edges |
| 143 | 35 verified people: founders (11), fund managers (7), government (6), university (3), corporate (4) |
| 144 | 50+ people graph edges: founded_by, employed_at, manages, partners_with |

### Phase 6: T-GNN Research Alignment (145–149)
| Migration | Purpose | Research Question |
|-----------|---------|-------------------|
| 145 | Institutional investors: NV PERS, State Treasurer, Goldman Sachs PE, JPMorgan AA, Wynn Family Office as LP investors | RQ1: Investor Matching |
| 146 | Capital flow metrics: SSBCI leverage ratios, capital magnet scores, public vs private source-sink | RQ3: Capital Flow |
| 147 | Structural hole metrics: accelerator connectivity gaps, rural isolation flags, community pair holes | RQ2: Ecosystem Gaps |
| 148 | Policy opportunity scores: 6 priority gaps mapped to report findings | RQ2: Policy |
| 149 | Interstate comparison: NV vs UT/CO/AZ benchmarks (VC, accelerators, spinouts, workforce) | RQ4: Interstate |

---

## T-GNN Research Questions & Data Coverage

The database is designed to support four research questions from the T-GNN analysis:

### RQ1: Institutional Investor Matching
**Method**: Multi-hop graph traversal, centrality metrics, matching scores
**Data**: `graph_edges` (invested_in, lp_investor), `externals` (VC firms, angels), `funds` (BBV, FundNV, 1864), `matching_score` on edges, `metric_snapshots` (capital_magnet_score)
**Key nodes**: `x_nv_pers`, `x_nv_treasurer`, `x_gs_pe`, `x_jpmorgan_aa`, `x_wynn_fo`

### RQ2: Ecosystem Gaps & Policy Opportunities
**Method**: Structural hole detection, triadic closure analysis
**Data**: `metric_snapshots` (accelerator_connectivity_gap, rural_isolation_flag, structural_hole_score), `v_structural_holes` view, policy opportunity scores in `metric_snapshots`
**Finding**: 72% of companies disconnected from accelerators; rural NV isolation

### RQ3: Capital Flow Patterns
**Method**: Weighted PageRank, source-sink analysis
**Data**: `metric_snapshots` (ssbci_leverage_ratio, capital_magnet_score, public_source_pct, private_source_pct), `ssbci_funds` (allocated_m, deployed_m, leverage_ratio)
**Finding**: $1 SSBCI → $3.20 private co-investment; BBV $36M allocated → $115M+

### RQ4: Interstate Comparison
**Method**: k-means clustering, benchmark ratios
**Data**: `metric_snapshots` (vc_deployed_annual_m, accelerator_program_count, university_spinout_rate, tech_workforce_pct) for NV/UT/CO/AZ

---

## Node Features Materialized View

The `node_features` materialized view creates standardized feature vectors for GNN input. Joins `graph_edges` with entity tables and pivots `metric_snapshots` enrichment data.

**Company features** (from companies + metric_snapshots):
- `funding_m`, `employees`, `momentum`, `founded` (base)
- `patent_count`, `ip_moat_score` (tech/IP enrichment)
- `tam_b`, `competitor_count`, `market_position`, `customer_count` (market)
- `revenue_m`, `valuation_m`, `burn_rate_m`, `growth_rate_pct` (financial)
- `founder_experience_years`, `prior_exit_count` (team)

**Graph metrics** (from graph_metrics_cache):
- `pagerank`, `betweenness`, `community_id`

---

## Agent Framework

### LLM Agents (BaseAgent → Claude API)
| Agent | Schedule | Output |
|-------|----------|--------|
| company_analyst | Sun 2 AM | Company narratives → analysis_results |
| weekly_brief | Mon 6 AM | Weekly brief → analysis_results |
| risk_assessor | Daily 3 AM | Risk scores → analysis_results |
| pattern_detector | Sun 4 AM | Pattern alerts → analysis_results |

### Statistical Agents (BaseModelAgent → statsmodels/lifelines/sklearn)
| Agent | Schedule | Output |
|-------|----------|--------|
| panel_forecaster | Sun 5 AM | OLS forecasts → scenario_results |
| survival_analyzer | Sun 6 AM | K-M curves, Cox PH → analysis_results |
| causal_evaluator | 1st/mo 7 AM | DiD, PSM, spillover → analysis_results |
| scenario_simulator | 1st/mo 8 AM | Monte Carlo → scenario_results |

### Ingestion Agents
| Agent | Schedule | Output |
|-------|----------|--------|
| freshness_checker | Daily 1 AM | Freshness audit → analysis_results |
| fred_ingestor | Mon 2 AM | 9 FRED series → metric_snapshots |
| bls_ingestor | 1st/mo 3 AM | QCEW data → metric_snapshots |

---

## API Routes

| Route | Cache | Description |
|-------|-------|-------------|
| `GET /api/companies` | 300s | Company list with IRS scores |
| `GET /api/companies/:id` | 300s | Single company + edges |
| `GET /api/funds` | 300s | Fund deployment data |
| `GET /api/graph` | 300s | Full graph nodes + edges (supports yearMax, nodeTypes, region filters) |
| `GET /api/graph-analytics` | 300s | PageRank, betweenness, communities |
| `GET /api/kpis` | 120s | Aggregate KPIs by sector |
| `GET /api/timeline` | 120s | Timeline events feed |
| `GET /api/analysis` | 60s | AI analysis briefs + risks |
| `GET /api/indicators` | 120s | Economic indicators (FRED/BLS) |
| `GET /api/scenarios` | 120s | Scenario CRUD + results |
| `GET /api/forecasts` | 120s | Entity forecasts from scenario_results |
| `GET /api/opportunities` | 300s | Opportunity matching + scoring |
| `GET /api/stakeholder-activities` | 300s | Stakeholder activity feed |
| `GET /api/dashboard-batch` | 120s | Batched dashboard data |
| `GET /api/constants` | 600s | Static reference data |
| `POST /api/admin/*` | — | Admin ops (recompute, refresh, cache clear) |

---

## Frontend Graph Visualization

### Components
- **GraphView** — Main container with filters, search, temporal controls
- **GraphCanvas** — D3 force-directed layout with canvas edge rendering
- **TemporalSlider** — Filter graph by year range (uses `event_year` on edges)
- **NodeDetail** — Sidebar showing entity details, connections, metrics
- **PathFinder** — Multi-hop path analysis between any two nodes
- **CommunityPanel** — Community detection results (label propagation)
- **NetworkStats** — Centrality and structural metrics display
- **GraphControls** — Node type toggles, layout options
- **GraphLegend** — Color-coded legend for 10 node types

### Node Type Colors (from constants.js NODE_CFG)
- Company: blue, Fund: green, Person: purple, External: orange
- Accelerator: yellow, Ecosystem: teal, Sector: pink, Region: gray
- Exchange: red, Program: brown

---

## Data Patterns

### Idempotent Writes
All migrations use `ON CONFLICT`:
- **Seed data** → `DO NOTHING` (don't overwrite enrichments)
- **Core fields** → `DO UPDATE SET name, slug, ...` (keep in sync)
- **Enrichment data** → `DO NOTHING` (layer on top, never conflict)

### Polymorphic Entity References
`metric_snapshots`, `scenario_results`, `analysis_results` all use:
```sql
entity_type TEXT,  -- 'company', 'fund', 'region', 'sector', etc.
entity_id TEXT     -- 'c_29', 'f_bbv', 'r_nv', etc.
```

### Feature Registry
`feature_registry` catalogs every feature by entity type:
```sql
entity_type, feature_name, data_type, source, migration_id, description
```

### Temporal Granularity
- `graph_edges.event_year` — year-level (graph structure over time)
- `metric_snapshots.period_start/period_end` — day-to-year granularity
- `timeline_events.event_date` — day-level precision
- `stakeholder_activities.activity_date` — day-level precision

---

## Development

```bash
# Database
docker compose up -d db

# API (port 3001)
cd api && npm install && npm run dev

# Frontend (port 5173)
cd frontend && npm install && npm run dev

# Agents
cd agents && pip install -r requirements.txt
python -m src.orchestration.scheduler

# Run migrations
cd database && psql $DATABASE_URL -f migrations/001_initial_schema.sql
# ... through 149_interstate_comparison.sql

# Seed (additive, safe to re-run)
cd database && node seeds/seed.js
# For fresh install: node seeds/seed.js --force
```

---

## Key Files for Common Tasks

| Task | Read First |
|------|-----------|
| Add a new company | `database/migrations/141_new_companies_verified.sql` (pattern) |
| Add graph edges | `database/migrations/142_new_company_edges.sql` (pattern) |
| Add people nodes | `database/migrations/143_people_enrichment_verified.sql` (pattern) |
| Enrich features | `database/migrations/136_tech_ip_enrichment.sql` (metric_snapshots pattern) |
| New API route | `.claude/prompts/api-development.md` |
| New frontend view | `.claude/prompts/frontend-development.md` |
| New Python agent | `.claude/prompts/agent-development.md` |
| Schema questions | `.claude/prompts/database-schema.md` |
| Graph analysis | `api/src/engine/graph-metrics.js` |
