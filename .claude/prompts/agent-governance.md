# Agent Governance Doctrine

Operating principles for all BBI agents that observe, interpret, propose, authorize, and execute.

## Five-Stage Loop

Every agent action flows through:

```
OBSERVE → INTERPRET → PROPOSE → AUTHORIZE → EXECUTE
   ↑                                            |
   └──────────── LEARN (compare outcome) ───────┘
```

1. **Observe**: Capture inputs as immutable events in `agent_runs`, `metric_snapshots`, or `timeline_events`
2. **Interpret**: Score, classify, rank, or predict using durable records — never ephemeral prompt context alone
3. **Propose**: Generate structured outputs (`classification`, `recommended_action`, `confidence`, `evidence_refs`) — not prose-first
4. **Authorize**: Apply policy rules (risk tier, confidence floor, data freshness) before any mutation
5. **Execute**: Perform tool calls through the action gateway with idempotency, audit trail, and post-action verification

## Autonomy Tiers

| Tier | Scope | Examples | Authorization |
|------|-------|----------|---------------|
| **0 — Read only** | Summarize, search, compare, answer | Freshness checker, pattern detector analysis | Automatic |
| **1 — Safe internal** | Tag records, update draft fields, queue tasks | Model registration, metric_snapshots writes | Automatic |
| **2 — Conditional** | Send notifications, launch jobs, change workflow state | Scenario creation, score recomputation, cache invalidation | Auto with review triggers |
| **3 — Approval required** | External API calls, financial changes, customer-visible updates | FRED/BLS API ingestion, weekly brief publication | Requires scheduling or explicit trigger |
| **4 — Human only** | Irreversible deletions, privileged approvals, compliance decisions | Schema migrations, data purges, model retirement | Manual only |

**Default**: New capabilities start at Tier 0 and graduate upward only with evidence.

## Agent Roles

Each agent has a narrow constitutional role:

| Role | Responsibility | BBI Examples |
|------|---------------|--------------|
| **Perception** | Ingest external data into structured records | `fred_ingestor`, `bls_ingestor` |
| **Analysis** | Score, classify, extract, forecast | `panel_forecaster`, `survival_analyzer`, `scenario_simulator` |
| **Critic** | Test factual grounding, schema validity, contradiction | `freshness_checker`, optimization agent |
| **Planner** | Generate execution plan with dependencies and approval points | Team pattern Planner agent |
| **Executor** | Perform allowed actions through the action gateway only | Team pattern Builder agent |
| **Escalation** | Route to human when confidence < threshold or risk > threshold | `risk_assessor` flagging |

**Rule**: No agent should both define policy and execute side effects.

## Data Doctrine

- **Raw inputs are immutable.** Never overwrite source data; append corrections as new events.
- **Normalize into canonical entities and events.** Use `entity_type` + `entity_id` polymorphic pattern.
- **Version everything.** Schema (migrations), prompts (.claude/prompts/), models (`models` table), policies.
- **Store quality metadata next to every derived field.** `confidence`, `verified`, `source_id`, `agent_id` on `metric_snapshots`.
- **Make features reproducible from the event log.** Any derived metric should be recomputable from `metric_snapshots` + `timeline_events`.
- **Evaluate decisions, not just predictions.** Track: was the action appropriate? Not just: was the text fluent?

## Review Pattern

For agents that review and act:

```
1. OBSERVE    → Capture as immutable event (agent_runs, metric_snapshots)
2. PROPOSE    → Structured output: {action, confidence, evidence_refs, required_tier}
3. REVIEW     → Deterministic checks first, then LLM critique, then human if thresholds trigger
4. AUTHORIZE  → Policy: risk_tier ≤ agent_max_tier AND confidence ≥ floor AND data_fresh
5. ACT        → Execute via action gateway (ON CONFLICT DO NOTHING, idempotent)
6. LEARN      → Compare proposed vs approved vs actual outcome → improve prompts/policies
```

## Control Rules

### Confidence Floors
| Context | Floor | Below Floor Action |
|---------|-------|--------------------|
| Metric ingestion (FRED/BLS) | 0.95 | Log warning, mark `verified=False` |
| Statistical forecast | 0.50 | Include wide CI bands, flag in output |
| Causal claim | 0.70 | Demote to "suggestive", require human review |
| Risk assessment | 0.60 | Escalate to weekly brief, don't auto-act |

### Freshness Requirements
| Data Source | Max Staleness | Stale Action |
|-------------|---------------|--------------|
| FRED macro series | 7 days | Warning in dashboard |
| BLS QCEW | 1 quarter + lag | Expected, no warning |
| Company snapshots | 30 days | Flag in freshness report |
| Graph metrics | 7 days | Trigger recomputation |

## Event Logging Standard

Every important transition is logged:

```sql
-- Agent run audit trail
INSERT INTO agent_runs (agent_name, status, input_params, started_at)
VALUES ($1, 'running', $2, NOW());

-- On completion
UPDATE agent_runs
SET status = 'completed', completed_at = NOW(),
    output_summary = $2, duration_ms = $3
WHERE id = $1;
```

**What to log**: who proposed, who reviewed, what evidence was used, what policy fired, what changed, what tool executed, duration, token cost.

## Build Standards

- **Typed everywhere**: Schemas for events, tasks, actions, evidence, approvals, outcomes
- **Event sourced**: All meaningful changes append events to `agent_runs` + `metric_snapshots`
- **Policy as code**: Authorization logic lives in constants and tier checks, not in prompts
- **Action gateway only**: No direct tool use outside controlled executors (`executemany` through pool)
- **Review chains**: Deterministic validation → critic pass → human escalation if needed
- **Reproducibility**: Replay any run with same inputs, policy version, and model version
- **Observability**: Every run exposes evidence used, tools called, errors, latency, and outcome
- **Idempotency**: `ON CONFLICT DO NOTHING` / `DO UPDATE` on every write
- **Graceful degradation**: When uncertain, ask, defer, or draft — never improvise

## Anti-Patterns

| Anti-Pattern | Correct Pattern |
|-------------|-----------------|
| Agent reasons from prompt context alone | Agent queries durable records (`metric_snapshots`, `analysis_results`) |
| Same agent proposes and validates | Separate critic/review agent validates proposal |
| Binary autonomy (full auto or full manual) | Tiered autonomy with escalation thresholds |
| Silent overwrites | Append-only events, `ON CONFLICT DO NOTHING` |
| Confidence not tracked | Every derived field has `confidence` + `verified` |
| No audit trail for decisions | Every action logged in `agent_runs` with input/output |
| Agent defines its own policy | Policy lives in constants/config, not in agent prompts |
