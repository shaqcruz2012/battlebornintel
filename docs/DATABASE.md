# Database Schema

PostgreSQL 16, database `battlebornintel`, user `bbi`, port 5433.

Migrations are in `database/migrations/` and numbered sequentially (001 through 099+).

---

## Core Tables

### companies
Primary entity table. 127 tracked Nevada companies.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | SERIAL PK      |                                    |
| slug          | VARCHAR(40)    | UNIQUE, url-safe identifier        |
| name          | VARCHAR(100)   |                                    |
| stage         | VARCHAR(20)    | seed, series_a, series_b, growth, public |
| sectors       | TEXT[]         | Array of sector slugs              |
| city          | VARCHAR(60)    |                                    |
| region        | VARCHAR(20)    | las_vegas, reno, henderson, etc.   |
| funding_m     | NUMERIC(10,2)  | Total funding in millions USD      |
| momentum      | INTEGER        | 0-100 score                        |
| employees     | INTEGER        |                                    |
| founded       | INTEGER        | Year                               |
| description   | TEXT           |                                    |
| eligible      | TEXT[]         | Eligible programs                  |
| lat, lng      | NUMERIC        | Geocoordinates                     |
| revenue_m     | NUMERIC(12,2)  | Added in migration 004             |
| website       | TEXT           | Added in migration 004             |
| region_id     | FK -> regions  | Normalised region reference        |
| confidence    | FLOAT          | Agent certainty (0-1)              |
| source_id     | FK -> sources  | Data provenance                    |
| verified      | BOOLEAN        | Human-reviewed flag                |
| created_at    | TIMESTAMPTZ    |                                    |
| updated_at    | TIMESTAMPTZ    |                                    |

### funds
8 investment funds tracked.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(20) PK | e.g. "bbv", "ssbci-eq"            |
| name          | VARCHAR(100)   |                                    |
| fund_type     | VARCHAR(30)    | VC, SSBCI, Angel, etc.            |
| allocated_m   | NUMERIC(10,2)  |                                    |
| deployed_m    | NUMERIC(10,2)  |                                    |
| leverage      | NUMERIC(5,2)   |                                    |
| company_count | INTEGER        |                                    |
| thesis        | TEXT           |                                    |

### graph_edges
Relationship graph. 824+ edges linking all entity types.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | SERIAL PK      |                                    |
| source_id     | VARCHAR(40)    | Polymorphic: company slug, fund id, person id, etc. |
| target_id     | VARCHAR(40)    | Same polymorphic reference         |
| rel           | VARCHAR(30)    | invested_in, partner, advisor, accelerated, etc. |
| note          | TEXT           | Dollar amounts, descriptions       |
| event_year    | INTEGER        |                                    |
| amount_usd    | NUMERIC        | Added in migration 021             |
| label         | VARCHAR(120)   | Display label for edge             |

**Indexes:** source_id, target_id, rel

### people
Key people in the ecosystem.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(30) PK | e.g. "p-john-doe"                 |
| name          | VARCHAR(100)   |                                    |
| role          | VARCHAR(60)    |                                    |
| company_id    | FK -> companies|                                    |
| note          | TEXT           |                                    |

### externals
External entities (corporations, universities, gov agencies, national VCs).

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(40) PK | e.g. "x-google", "x-nsf"         |
| name          | VARCHAR(100)   |                                    |
| entity_type   | VARCHAR(30)    | corporation, university, gov_agency, vc, etc. |
| note          | TEXT           |                                    |

### accelerators

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(30) PK |                                    |
| name          | VARCHAR(100)   |                                    |
| accel_type    | VARCHAR(40)    |                                    |
| city          | VARCHAR(60)    |                                    |
| region        | VARCHAR(20)    |                                    |
| founded       | INTEGER        |                                    |

### ecosystem_orgs

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(30) PK |                                    |
| name          | VARCHAR(60)    |                                    |
| entity_type   | VARCHAR(40)    |                                    |
| city          | VARCHAR(60)    |                                    |
| region        | VARCHAR(20)    |                                    |

### graph_funds
Lightweight graph-specific fund records for node rendering.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | VARCHAR(20) PK |                                    |
| name          | VARCHAR(100)   |                                    |
| fund_type     | VARCHAR(30)    |                                    |

---

## Timeline & Activity Tables

### timeline_events

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | SERIAL PK      |                                    |
| event_date    | DATE           |                                    |
| event_type    | VARCHAR(20)    | Funding, Grant, Hiring, Partnership, Launch, Patent, Milestone, Award, Expansion, Acquisition, Founding |
| company_name  | VARCHAR(100)   |                                    |
| company_id    | INTEGER        | Added in migration 077             |
| detail        | TEXT           |                                    |
| icon          | VARCHAR(20)    |                                    |
| display_name  | VARCHAR(150)   | Added in migration 094             |
| source_url    | TEXT           | Added in migration 094             |

**Index:** event_date DESC

### stakeholder_activities
Pre-classified activity feed (migration 016).

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| id            | SERIAL PK      |                                    |
| company_id    | VARCHAR(80)    | Slug or external identifier        |
| activity_type | VARCHAR(30)    | Funding, Partnership, Award, etc.  |
| description   | TEXT           |                                    |
| location      | VARCHAR(100)   | Nevada city                        |
| activity_date | DATE           |                                    |
| source        | VARCHAR(100)   |                                    |
| stakeholder_type | VARCHAR(30) | gov_policy, university, corporate, risk_capital, ecosystem |
| display_name  | VARCHAR(150)   |                                    |
| source_url    | TEXT           |                                    |
| data_quality  | VARCHAR(20)    | VERIFIED, INFERRED, CALCULATED     |

**Indexes:** activity_type, activity_date DESC, company_id, location, stakeholder_type

---

## Reference Tables (migration 002)

### regions
Nevada regions with hierarchy (state -> metro -> city).

### sectors
Sector definitions with NAICS codes and strategic priority scores.

### exchanges
Stock exchanges (NASDAQ, NYSE, OTC) with MIC codes.

### sources
Data provenance tracking for agent-written records. Types: web, sec_filing, press_release, crunchbase, linkedin, pitchbook, internal, manual, agent.

### models
ML/AI model registry for scenario/prediction layer.

---

## Extended Entity Tables (migration 003)

These tables decompose entities from `externals` and `ecosystem_orgs` into typed tables:

- **vc_firms** — VC firm identity with AUM, fund size, stage focus
- **angels** — Angel investors with check sizes and sectors
- **ssbci_funds** — Structured SSBCI fund data with program phases
- **corporations** — Corporations with industry, market cap, NV presence
- **universities** — Universities with research budgets and spinout counts
- **gov_agencies** — Government agencies by jurisdiction level
- **programs** — Grants, accelerator cohorts, loan programs (polymorphic owner)

All include agent metadata columns (confidence, source_id, agent_id, verified, extracted_at).

---

## Scoring & Metrics Tables

### computed_scores
Cached IRS scores per company.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| company_id    | FK -> companies|                                    |
| irs_score     | INTEGER        | 0-100                              |
| grade         | VARCHAR(3)     | A+, A, B+, B, C, etc.            |
| triggers      | TEXT[]         | Score explanation factors           |
| dims          | JSONB          | Dimensional breakdown              |
| computed_at   | TIMESTAMPTZ    |                                    |

### graph_metrics_cache
Cached network analysis metrics per node.

| Column        | Type           | Notes                              |
|---------------|----------------|------------------------------------|
| node_id       | VARCHAR(40)    |                                    |
| pagerank      | INTEGER        |                                    |
| betweenness   | INTEGER        |                                    |
| community_id  | INTEGER        |                                    |

### metric_snapshots (migration 005)
Time-series store for quantitative metrics on any entity. Polymorphic entity reference.

---

## Materialized Views

### latest_company_scores (migration 011)
Pre-computed latest IRS score per company (DISTINCT ON company_id). Refreshed hourly. Unique index on company_id enables `REFRESH MATERIALIZED VIEW CONCURRENTLY`.

---

## Other Tables

- **listings** — Stock exchange listings (company_id, exchange, ticker)
- **constants** — Key-value store for system constants (sector_heat, stage_norms)
- **agent_runs** — Agent execution log
- **analysis_results** — AI-generated analysis content (company analysis, weekly briefs, risk assessments)
- **scenarios** / **scenario_results** (migration 005) — Prediction/scenario modeling

---

## Seed Process

The seeder at `database/seeds/seed.js` populates:
1. Companies (127 records with all fields)
2. Funds (8 records)
3. Graph nodes (people, externals, accelerators, ecosystem_orgs, graph_funds)
4. Graph edges (824+ relationships)
5. Timeline events
6. Constants (sector_heat, stage_norms)
7. Computed scores

Run:
```bash
cd database/seeds && npm install
DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel node seed.js
```

## Key Indexes

Performance-critical indexes (migrations 010-015, 031, 066, 096):
- `companies`: stage, region, funding_m, momentum, sectors (GIN)
- `graph_edges`: source_id, target_id, rel, composite (source_id, target_id, rel)
- `timeline_events`: event_date DESC, event_type, company_id
- `stakeholder_activities`: activity_date DESC, stakeholder_type, company_id
- `computed_scores`: company_id
- `graph_metrics_cache`: node_id
