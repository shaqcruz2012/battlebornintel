# 4-Agent Team Pattern

Standard approach for executing non-trivial tasks in BBI. Each task gets a team of specialized agents working in phases.

## Core Principle: Context Is the Bottleneck

Every token of context an agent reads is a token it can't use for output. The #1 cause of agent failure in this codebase is **context exhaustion** — agents that read too many files can't write their output. All patterns below are designed to minimize context consumption while maximizing output quality.

## Team Roles

| Role | Phase | Purpose | Context Budget |
|------|-------|---------|----------------|
| **Planner** | 1 (parallel) | Research codebase, identify files, define contracts | 5 files max (~10K tokens) |
| **Builder** | 2 (parallel) | Write code from pre-digested context — NO source reads | 1 prompt file + Planner summary (~3K tokens) |
| **QA** | 3 (parallel) | Syntax check, import validation, run tests | Output files only (~5K tokens) |
| **Optimizer** | 4 (background) | Apply best practices, flag improvements | Output files only (~5K tokens) |

## Execution Flow

```
Phase 1: Plan (parallel across all tasks)
  ├── Each Planner reads ONLY .claude/prompts/<domain>.md + 2-3 target files
  ├── Returns: file list, function signatures, edge cases, test cases
  └── KEY: Planner output becomes the Builder's ENTIRE context

Phase 2: Build (parallel across all tasks)
  ├── Each Builder receives Planner output as pre-digested context
  ├── Reads ONLY .claude/prompts/<domain>.md (never source files)
  ├── Writes files directly using contracts from Planner
  └── KEY: If Builder needs to read source, the Planner failed

Phase 3: QA (parallel across all tasks)
  ├── Validates Builder output only (syntax, imports, schema)
  ├── Runs tests: py_compile, node --check, pytest, vitest
  └── KEY: QA never reads source — only validates output

Phase 4: Optimize (single background agent)
  ├── Reviews all Builder outputs holistically
  ├── Applies patterns from best-practice repos (see optimization-agent.md)
  └── KEY: Suggests only, doesn't auto-apply breaking changes
```

## Context Routing (Critical)

Every agent prompt MUST start with the relevant context file:

| Domain | Context File | Token Budget |
|--------|-------------|-------------|
| Database/SQL | `.claude/prompts/database-schema.md` | ~1.5K |
| Python agents | `.claude/prompts/agent-development.md` | ~1.5K |
| Express API | `.claude/prompts/api-development.md` | ~2K |
| React frontend | `.claude/prompts/frontend-development.md` | ~2K |
| Data ingestion | `.claude/prompts/ingestion-development.md` | ~1.5K |

**Anti-pattern**: Never tell an agent "read the codebase" or "explore the project". Always route to the specific context file.

**Multi-domain tasks**: If a task spans domains (e.g., new agent + API route + frontend), split into separate agents per domain rather than giving one agent all context files.

## Prompt Templates

### Planner (research-only, no code output)
```
Read .claude/prompts/<domain>.md for schema and patterns.
Read [2-3 specific files needed].
Plan the implementation of [task description].
Return:
1. Files to create/modify (with absolute paths)
2. Function signatures with input/output types
3. SQL column names to use (verified against schema)
4. Edge cases: empty data, null values, type mismatches
5. Test cases: input → expected output (3-5 per function)
Do NOT write code. Research only.
```

### Builder (code output, minimal reads)
```
Read .claude/prompts/<domain>.md for schema and patterns.
[Paste Planner output — this is your ENTIRE codebase context]
Write these files: [file list from Planner]
Follow these contracts: [signatures from Planner]
Handle these edge cases: [from Planner]
After writing, run syntax checks and tests.
```

### QA (validation only)
```
Validate these files written by Builder: [file list]
Check:
1. Python: `python -m py_compile <file>` passes
2. JS: `node --check <file>` passes
3. Schema: column names match .claude/prompts/database-schema.md
4. Tests: `pytest tests/<file>` or `npx vitest run <file>` passes
5. No SQL injection, no hardcoded secrets, no unhandled exceptions
Report: PASS/FAIL per file with specific line numbers for failures.
```

### Optimizer (advisory only)
```
Read .claude/prompts/optimization-agent.md for reference patterns.
Review these files: [all files from all Builders]
Score each file 1-10 on: correctness, defensiveness, testability, performance.
For any score < 8, provide specific fix with file:line and old→new text.
Only modify files if the improvement is unambiguous.
```

## Context Exhaustion Recovery

When an agent runs out of context (writes incomplete files or errors):
1. **Don't retry the same agent** — it will hit the same limit
2. **Extract the partial output** — read what it wrote to disk
3. **Split the task** — break into 2 smaller agents with tighter scope
4. **Pre-digest context** — paste the relevant code snippets directly into the prompt instead of having the agent read files

## Lessons Learned (This Codebase)

1. **Agents reading 6+ files exhaust context** — 3 files is the safe maximum for a Builder
2. **Planners that return code waste tokens** — force "research only, no code"
3. **Schema verification prevents false-positive bugs** — always check migrations, not docs
4. **Test builders are the most efficient agents** — they read 1 example + 1 target, then write
5. **Background agents should be fire-and-forget** — don't poll, wait for notification

## When to Use This Pattern
- Any task touching 3+ files
- Any task requiring both code and tests
- Any new agent or API route
- Any migration that modifies schema
- Any cross-layer change (agent → API → frontend)

## When NOT to Use This Pattern
- Single-file edits (just edit directly)
- Documentation-only changes
- Config/env changes
- Quick bug fixes with obvious solutions
- Reading/researching (use Explore agent instead)
