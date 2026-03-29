# 4-Agent Team Pattern

Standard approach for executing non-trivial tasks in BBI. Each task gets a team of 4 specialized agents working in phases.

## Team Roles

| Role | Phase | Purpose | Model |
|------|-------|---------|-------|
| **Planner** | 1 (parallel) | Research codebase, identify files, define contracts, write specs | sonnet |
| **Builder** | 2 (parallel) | Write code per spec. Gets pre-digested context from Planner output. | opus |
| **QA** | 3 (parallel) | Syntax check, import validation, schema alignment, edge case review | sonnet |
| **Optimizer** | 4 (background) | Apply best practices from known repos, refine patterns, flag improvements | sonnet |

## Execution Flow

```
Phase 1: Plan (parallel across all tasks)
  └── Each Planner reads .claude/prompts/<domain>.md + target files
  └── Returns: file list, function signatures, test cases, edge cases

Phase 2: Build (parallel across all tasks)
  └── Each Builder receives Planner output as pre-digested context
  └── Writes files directly (no reading needed — context is in the prompt)

Phase 3: QA (parallel across all tasks)
  └── Each QA agent validates Builder output
  └── Syntax, imports, schema alignment, missing edge cases

Phase 4: Optimize (single background agent)
  └── Reviews all Builder outputs holistically
  └── Applies patterns from best-practice repos
  └── Suggests improvements (doesn't auto-apply breaking changes)
```

## Prompt Template for Each Role

### Planner
```
Read .claude/prompts/<domain>.md for schema and patterns.
Read [specific files needed for context].
Plan the implementation of [task description].
Return:
1. Files to create/modify (with paths)
2. Function signatures and their contracts
3. Key edge cases to handle
4. Test cases (input -> expected output)
Do NOT write code. Research only.
```

### Builder
```
Read .claude/prompts/<domain>.md for schema and patterns.
[Paste Planner output here as pre-digested context]
Write the following files: [file list from Planner]
Follow these contracts: [signatures from Planner]
Handle these edge cases: [from Planner]
```

### QA
```
Read .claude/prompts/<domain>.md for schema reference.
Validate the following files: [file list]
Check:
1. Python: py_compile passes, imports resolve
2. JS: node --check passes
3. Schema: column names match database-schema.md
4. Edge cases: [from Planner] are handled
5. No hardcoded secrets, no SQL injection, no unhandled exceptions
Report issues as a structured list.
```

### Optimizer
```
Read .claude/prompts/<domain>.md for current patterns.
Review these files: [all files from all Builders]
Apply best practices from:
- pytest patterns (parametrize, fixtures, conftest)
- Express testing (supertest, jest)
- Statistical testing (hypothesis testing, property-based)
- Error handling (circuit breaker, retry, graceful degradation)
Suggest improvements. Only modify files if the change is clearly beneficial
and doesn't break existing contracts.
```

## Context Budget Rules
- Planner: Can read up to 5 source files (research phase)
- Builder: Reads 1 prompt file + receives Planner summary (NO source file reads)
- QA: Reads 1 prompt file + validates output files only
- Optimizer: Reads prompt file + all output files from the batch

## When to Use This Pattern
- Any task touching 3+ files
- Any task requiring both code and tests
- Any new agent or API route
- Any migration that modifies schema

## When NOT to Use This Pattern
- Single-file edits
- Documentation-only changes
- Config changes
- Quick bug fixes with obvious solutions
