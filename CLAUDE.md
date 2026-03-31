# BattleBornIntel (BBI)

Regional innovation ecosystem intelligence platform for Nevada's startup/venture landscape.

## Context Routing

> **CRITICAL**: Context exhaustion is the #1 cause of agent failure. Every file read costs tokens that can't be used for output. Route agents to the smallest context file that covers their task.

| Task | Context File | ~Tokens | When to Use |
|------|-------------|---------|-------------|
| SQL, migrations, schema | `.claude/prompts/database-schema.md` | 1.5K | Writing queries, creating migrations, schema questions |
| Python agents | `.claude/prompts/agent-development.md` | 1.5K | New agents, BaseAgent/BaseModelAgent, scheduling |
| Express API | `.claude/prompts/api-development.md` | 2K | New endpoints, query functions, caching, middleware |
| React frontend | `.claude/prompts/frontend-development.md` | 2K | New views, hooks, API client, D3 graph work |
| Data ingestion | `.claude/prompts/ingestion-development.md` | 1.5K | FRED/BLS ingestors, metric_snapshots writes |
| Multi-file tasks | `.claude/prompts/team-pattern.md` | 2K | 4-agent team workflow, context budgets |
| Code quality | `.claude/prompts/optimization-agent.md` | 2K | Best practices, quality scoring, anti-patterns |
| Agent governance | `.claude/prompts/agent-governance.md` | 2K | Autonomy tiers, review patterns, control rules, data doctrine |

### Agent Context Rules
1. **Builders read max 3 files** — more than this causes context exhaustion
2. **Planners research, Builders write** — never combine both in one agent
3. **Pre-digest context** — paste relevant snippets into prompts instead of having agents read files
4. **Multi-domain tasks split per domain** — one agent for Python, another for JS, another for frontend
5. **Schema verification uses migrations** — never trust docs alone, always check actual CREATE TABLE

### Subagent prompt pattern:
```
Read .claude/prompts/<relevant>.md for schema and patterns, then [task description].
```

## Architecture

| Layer | Stack | Directory |
|-------|-------|-----------|
| Frontend | React 18 + Vite, D3 force graph, TanStack Query | `frontend/` |
| API | Express.js, in-memory cache, rate limiting | `api/` |
| Database | PostgreSQL 16 (Docker, port 5433) | `database/migrations/` |
| Agents | Python async, Claude API + statistical models | `agents/` |

**Connection string**: `postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel`

## Database Schema (Key Tables)

### Core entities
- `companies` — id, name, slug, stage, sectors[], employees, funding_m, momentum, founded, city, region, status, eligible
- `graph_edges` — source_id, target_id, rel, event_year, note, weight, matching_score
- `funds` / `ssbci_funds` — fund tracking with allocated_m, deployed_m, leverage_ratio
- `regions` — name, level, fips, iso_code, population, gdp_b, parent_id
- `sectors` — name, slug, naics_codes[], maturity_stage, strategic_priority
- `universities` — name, research_budget_m, tech_transfer_office, spinout_count
- `programs` — name, program_type (grant/loan/equity/accelerator_cohort/...), budget_m

### Analytics tables
- `metric_snapshots` — entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id
- `scenarios` — id, name, description, base_period (DATE), model_id (FK), assumptions (JSONB), status, created_by
- `scenario_results` — scenario_id, entity_type, entity_id, metric_name, value, unit, period (DATE), confidence_lo, confidence_hi
- `models` — id, name, objective, input_variables (JSONB), output_variables (JSONB), version, is_active
- `stage_transitions` — id, company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source, created_at
- `analysis_results` — analysis_type, entity_type, entity_id, content (JSONB), model_used, agent_run_id
- `computed_scores` — company_id, irs_score, dim scores
- `graph_metrics_cache` — node_id, pagerank, betweenness, community_id, computed_at
- `computed_scores_history` — mirrors computed_scores with archived_at for time-series tracking

### Auth & audit tables
- `users` — id, email, password_hash, display_name, role (admin/analyst/viewer/service_account), is_active, mfa_secret, mfa_enabled
- `sessions` — id (UUID), user_id, token_hash, ip_address, user_agent, expires_at
- `audit_log` — id, user_id, action, resource_type, resource_id, ip_address, user_agent, details (JSONB), created_at

### Materialized views
- `economic_indicators_latest` — filtered metric_snapshots for macro series
- `economic_indicators_pivot` — latest value per indicator
- `economic_indicators_summary` — latest + previous + pct_change

## Graph Schema

**10 node types**: company (`c_`), fund (`f_`), sector (`s_`), region (`r_`), person (`p_`), external (`x_`), exchange (`ex_`), accelerator (`a_`), ecosystem (`e_`), program (`pr_`)

**21+ edge types**: invested_in, accelerated_by, founded_by, employed_at, acquired, partners_with, qualifies_for, won_pitch, etc.

**3 edge categories**: historical (past events), opportunity (potential), projected (forward-looking)

## Agent Framework

### Base classes
- `BaseAgent` (`agents/src/agents/base_agent.py`) — LLM-powered agents using Claude API
- `BaseModelAgent` (`agents/src/agents/base_model_agent.py`) — Statistical/ML agents (no LLM)
  - Key methods: `load_panel_data()`, `load_graph_features()`, `save_predictions()`, `register_model()`, `save_analysis()`, `create_scenario()`, `complete_scenario()`

### Agent registry (`agents/src/orchestration/runner.py`)
| Agent | Type | Schedule | Purpose |
|-------|------|----------|---------|
| company_analyst | LLM | Sun 2 AM | Full company analysis |
| weekly_brief | LLM | Mon 6 AM | Weekly intelligence brief |
| risk_assessor | LLM | Daily 3 AM | Risk assessment |
| pattern_detector | LLM | Sun 4 AM | Pattern detection |
| panel_forecaster | Statistical | Sun 5 AM | OLS time-series forecasting |
| survival_analyzer | Statistical | Sun 6 AM | Kaplan-Meier + Cox PH survival |
| causal_evaluator | Statistical | 1st/mo 7 AM | DiD, PSM, spillover analysis |
| scenario_simulator | Statistical | 1st/mo 8 AM | Monte Carlo what-if engine |
| freshness_checker | Ingestion | Daily 1 AM | Data freshness audit |
| fred_ingestor | Ingestion | Mon 2 AM | FRED macro data (9 series) |
| bls_ingestor | Ingestion | 1st/mo 3 AM | BLS QCEW employment/wages |

### Python dependencies
pandas, numpy, statsmodels, lifelines, scikit-learn, networkx, httpx, asyncpg

## API Routes

| Route | Cache TTL | Description |
|-------|-----------|-------------|
| `/api/companies` | 300s | Company list with IRS scores |
| `/api/funds` | 300s | Fund deployment data |
| `/api/graph` | 300s | Full graph nodes + edges |
| `/api/kpis` | 120s | Aggregate KPIs by sector |
| `/api/timeline` | 120s | Timeline events feed |
| `/api/analysis` | 60s | AI analysis briefs + risks |
| `/api/indicators` | 120s | Economic indicators (FRED/BLS) |
| `/api/scenarios` | 120s | Scenario CRUD + results |
| `/api/forecasts` | 120s | Entity forecasts from scenario_results |
| `/api/opportunities` | 300s | Opportunity matching + scoring |
| `/api/stakeholder-activities` | 300s | Stakeholder activity feed |
| `/api/dashboard-batch` | 120s | Batched dashboard data |
| `/api/constants` | 600s | Static reference data |
| `/api/admin` | N/A | Key-gated admin (recompute, refresh, cache clear) |

## Common Patterns

- **Polymorphic entity references**: `entity_type` + `entity_id` used in metric_snapshots, scenario_results, analysis_results
- **Node ID prefixes**: `c_123` (company), `f_bbv` (fund), `s_tech` (sector), `r_nv` (region)
- **Idempotent writes**: All INSERT use `ON CONFLICT DO NOTHING` or `DO UPDATE`
- **Audit trail**: All agent runs logged in `agent_runs` table (status, input_params, output_summary, error_message)

## Development

```bash
# Start DB
docker compose up -d db

# API (port 3001)
cd api && npm install && npm run dev

# Frontend (port 5173)
cd frontend && npm install && npm run dev

# Agents
cd agents && pip install -r requirements.txt
python -m src.orchestration.scheduler  # or run individual agent
```
