# Database Schema Reference

Use this when writing SQL migrations, queries, or any code touching the database.

## Connection
`postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel`

## Core Entity Tables

### companies
```sql
id SERIAL PK, name TEXT, slug TEXT UNIQUE, stage TEXT, sectors TEXT[],
employees INT, funding_m NUMERIC, momentum NUMERIC, founded INT,
city TEXT, region TEXT, status TEXT (active/acquired/failed/ipo/merged/unknown),
eligible BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### graph_edges
```sql
id SERIAL PK, source_id TEXT, target_id TEXT, rel TEXT,
event_year INT, matching_score NUMERIC, notes TEXT
-- Node ID format: c_123, f_bbv, s_tech, r_nv, a_startupnv, p_john, x_tesla
-- 21+ rel types: invested_in, accelerated_by, founded_by, employed_at, acquired, partners_with, qualifies_for, won_pitch, etc.
```

### regions
```sql
id SERIAL PK, name TEXT, slug TEXT UNIQUE, level TEXT (state/metro/county/city),
fips_code TEXT, population INT, gdp_b NUMERIC, parent_id FK->regions
```

### sectors
```sql
id SERIAL PK, name TEXT, slug TEXT UNIQUE, naics_codes TEXT[],
maturity_stage TEXT (emerging/growth/mature), strategic_priority INT
```

### programs
```sql
id SERIAL PK, name TEXT, slug TEXT UNIQUE,
program_type TEXT (grant/loan/equity/accelerator_cohort/incubator/mentorship/procurement),
start_date DATE, end_date DATE, budget_m NUMERIC,
target_sectors TEXT[], target_stages TEXT[], target_regions TEXT[]
```

### universities
```sql
id SERIAL PK, name TEXT, slug TEXT UNIQUE,
research_budget_m NUMERIC, tech_transfer_office BOOLEAN, spinout_count INT
```

### funds / ssbci_funds / vc_firms
```sql
-- funds: id, name, slug, allocated_m, deployed_m, leverage_ratio
-- ssbci_funds: + program_phase, target_regions, target_sectors
-- vc_firms: + aum_m, fund_size_m, fund_count, thesis, stage_focus
```

## Analytics Tables

### metric_snapshots (time-series store)
```sql
entity_type TEXT, entity_id TEXT, metric_name TEXT, value NUMERIC,
unit TEXT, period_start DATE, period_end DATE,
granularity TEXT (day/week/month/quarter/year),
confidence NUMERIC, verified BOOLEAN, agent_id TEXT, source_id INT
-- UNIQUE(entity_type, entity_id, metric_name, period_start, period_end)
```

### scenarios
```sql
id SERIAL PK, name TEXT, description TEXT, base_period DATE,
model_id INT FK->models, assumptions JSONB, status TEXT (draft/running/complete/failed),
created_by TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### scenario_results
```sql
scenario_id INT FK, entity_type TEXT, entity_id TEXT,
metric_name TEXT, value NUMERIC, unit TEXT, period DATE,
confidence_lo NUMERIC, confidence_hi NUMERIC
-- UNIQUE(scenario_id, entity_type, entity_id, metric_name, period)
```

### models
```sql
id SERIAL PK, name TEXT UNIQUE, objective TEXT,
input_variables JSONB, output_variables JSONB,
version TEXT, is_active BOOLEAN, created_at, updated_at
```

### stage_transitions
```sql
id SERIAL PK, company_id INT FK, from_stage TEXT, to_stage TEXT,
transition_date DATE, transition_year INT, evidence_type TEXT,
evidence_source TEXT, confidence NUMERIC
```

### analysis_results
```sql
id SERIAL PK, analysis_type TEXT, entity_type TEXT, entity_id TEXT,
content JSONB, model_used TEXT, agent_run_id INT FK, created_at
```

### computed_scores
```sql
company_id INT FK, irs_score NUMERIC, dim_* scores, updated_at
```

### graph_metrics_cache
```sql
node_id TEXT, pagerank NUMERIC, betweenness NUMERIC,
community_id INT, computed_at TIMESTAMPTZ
```

## Materialized Views
- `economic_indicators_latest` — metric_snapshots filtered to macro series
- `economic_indicators_pivot` — DISTINCT ON latest per indicator
- `economic_indicators_summary` — latest + previous + pct_change

## Key Constraints
- All INSERTs should use `ON CONFLICT DO NOTHING` or `DO UPDATE` for idempotency
- Entity references use polymorphic pattern: `entity_type` + `entity_id`
- Node IDs have type prefixes: `c_` company, `f_` fund, `s_` sector, `r_` region, `a_` accelerator, `p_` person, `x_` external, `e_` ecosystem, `ex_` exchange, `pr_` program
