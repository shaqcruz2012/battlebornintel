# Agent Development Context

Use this when creating or modifying Python agents in `agents/src/`.

## Base Classes

### BaseAgent (LLM agents) — `agents/src/agents/base_agent.py`
- Constructor: `__init__(agent_name)`
- Lifecycle: `execute(**kwargs)` -> `run(pool, **kwargs)` (abstract)
- LLM call: `self.call_claude(system_prompt, user_prompt, model="claude-sonnet-4-20250514", max_tokens=4096)` -> str
- Persistence: `self.save_analysis(pool, analysis_type, content, entity_type, entity_id)`
- Audit: auto-logged to `agent_runs` table

### BaseModelAgent (statistical agents) — `agents/src/agents/base_model_agent.py`
- Constructor: `__init__(agent_name, model_version="1.0.0")`
- Lifecycle: `execute(**kwargs)` -> `run(pool, **kwargs)` (abstract)
- Data loading:
  - `load_panel_data(pool, entity_type, metric_names, date_range=None)` -> pivoted DataFrame with columns: entity_id, period_start, period_end, <metrics>
  - `load_graph_features(pool, node_types=None)` -> DataFrame indexed by node_id with: pagerank, betweenness, community_id
- Persistence:
  - `save_predictions(pool, scenario_id, predictions_df)` — writes to scenario_results. DataFrame must have: entity_type, entity_id, metric_name, value, period. Optional: unit, confidence_lo, confidence_hi
  - `register_model(pool, name, objective, input_vars, output_vars)` -> model_id
  - `save_analysis(pool, analysis_type, content, entity_type, entity_id)` — writes JSONB to analysis_results
  - `create_scenario(pool, name, description, base_period, assumptions)` -> scenario_id
  - `complete_scenario(pool, scenario_id)` — sets status='complete'
- Audit: auto-logged to `agent_runs` table (same as BaseAgent)

## Registration Checklist

When creating a new agent:
1. Create `agents/src/agents/<agent_name>.py` or `agents/src/ingestion/<agent_name>.py`
2. Import and add to `AGENT_REGISTRY` in `agents/src/orchestration/runner.py`
3. Add schedule entry to `SCHEDULES` in `agents/src/orchestration/scheduler.py`

## Current Agent Registry

| Agent | Class | Schedule |
|-------|-------|----------|
| company_analyst | CompanyAnalyst | Sun 2 AM |
| weekly_brief | WeeklyBrief | Mon 6 AM |
| risk_assessor | RiskAssessor | Daily 3 AM |
| pattern_detector | PatternDetector | Sun 4 AM |
| panel_forecaster | PanelForecaster | Sun 5 AM |
| survival_analyzer | SurvivalAnalyzer | Sun 6 AM |
| causal_evaluator | CausalEvaluator | 1st/mo 7 AM |
| scenario_simulator | ScenarioSimulator | 1st/mo 8 AM |
| freshness_checker | FreshnessChecker | Daily 1 AM |
| fred_ingestor | FredIngestor | Mon 2 AM |
| bls_ingestor | BLSIngestor | 1st/mo 3 AM |

## Python Dependencies
pandas>=2.1, numpy>=1.26, statsmodels>=0.14, lifelines>=0.29, scikit-learn>=1.4, networkx>=3.2, httpx, asyncpg

## DB Connection in Agents
```python
from ..db import get_pool
pool = await get_pool()  # asyncpg pool, auto-configured from DATABASE_URL env
```

## Common Patterns
- All agents return a result dict from `run()` (logged to agent_runs.output_summary)
- Use `pd.to_numeric(df[col], errors="coerce")` for safe numeric conversion
- Use `np.log1p()` for log-transforming financial data (handles zeros)
- Stage ordering: pre_seed=1, seed=2, series_a=3, series_b=4, series_c_plus=5, growth=6, public=7
