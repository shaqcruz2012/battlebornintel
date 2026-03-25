# CLAUDE.md — BattleBornIntel

## Project Overview

BattleBornIntel is a Nevada innovation ecosystem intelligence platform. It tracks companies, funds, investors, stakeholder activities, risk signals, and ecosystem graph relationships across Nevada's tech/business landscape.

**Stack:** React (Vite) frontend + Express API + PostgreSQL 16 (Docker, port 5433)

## Architecture

```
frontend/src/          → React SPA (JSX, CSS Modules, Recharts, D3 force graph)
  components/          → Feature-grouped: dashboard, graph, search, analytics, etc.
  api/                 → client.js (fetch wrapper), hooks.js (React Query)
  workers/             → Web Workers for D3 layout computation

api/src/               → Express REST API
  routes/              → ~20 route files (companies, funds, graph, risks, news, etc.)
  db/pool.js           → pg Pool connection
  db/queries/          → Parameterized SQL query modules
  db/migrations/       → SQL migration files
  engine/              → Risk signals, analysis engines
  services/            → newsAggregator, etc.
  middleware/           → auth, cache, errorHandler

database/              → migrations/ and seeds/
agents/                → Python data agents (scraping, ETL)
```

## Running the Project

```bash
docker compose up -d                    # PostgreSQL on localhost:5433
cd api && npm run dev                   # API on :3001
cd frontend && npm run dev              # Frontend on :5173
```

## Data Integrity (CRITICAL)

- ALL data must be verifiable — no fabricated companies, funds, people, or metrics
- Source URLs must resolve to real pages
- Never invent ecosystem relationships or financial data
- When seeding or ingesting data, every record must trace to a real source

---

## Security Rules

### Mandatory — Every Change

- [ ] No hardcoded secrets (API keys, passwords, tokens) in source
- [ ] Use environment variables or config.js for all credentials
- [ ] All SQL queries use parameterized placeholders (`$1, $2`) — NEVER string concatenation
- [ ] All user/external input validated before use
- [ ] Error responses never leak stack traces, SQL, or internal paths to clients
- [ ] CORS origin is restrictive in production
- [ ] Auth middleware applied to protected routes

### Secret Management

- Secrets go in `.env` (gitignored) or environment variables
- `config.js` reads from `process.env` with safe defaults for dev only
- If a secret is accidentally committed: rotate immediately, then force-remove from history

### SQL Injection Prevention

```javascript
// CORRECT — parameterized
const { rows } = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);

// NEVER — string interpolation
const { rows } = await pool.query(`SELECT * FROM companies WHERE id = ${id}`);
```

### XSS Prevention

- Never use `dangerouslySetInnerHTML` without sanitization
- Validate and escape any user-provided content rendered in JSX
- API responses should not include raw HTML from untrusted sources

---

## Code Quality Standards

### File Organization

- Feature-grouped components (e.g., `components/dashboard/`, `components/graph/`)
- One component per file, file name matches export
- Max ~400 lines per file; split if larger
- Max ~50 lines per function; extract helpers if longer

### Immutability

- Return new objects/arrays, never mutate props, state, or function arguments
- Use spread operators, `.map()`, `.filter()` — not `.push()`, `.splice()`, or direct assignment

### Error Handling

- Every `pool.query()` call must be in a try/catch
- API routes: catch errors, log server-side detail, return safe client message
- Frontend: React Error Boundaries wrap major sections
- Never silently swallow errors — at minimum `console.error()` in dev

### React Patterns

- Correct `useEffect` dependency arrays — no missing deps, no stale closures
- No state updates during render phase
- Lists always have stable `key` props (not array index for dynamic lists)
- Avoid prop drilling — use context or composition for deeply shared state
- Loading and error states for all async data (React Query handles most)

### Node.js / Express Patterns

- All route handlers: validate input, query with params, handle errors
- Use `middleware/cache.js` for expensive queries
- No N+1 query patterns — use JOINs or batch queries
- Set reasonable timeouts on external calls
- Rate limiting on public-facing endpoints

---

## Code Review Checklist

Before considering any change complete:

**Security (blocking)**
- [ ] No credentials in code
- [ ] SQL parameterized
- [ ] Input validated at API boundary
- [ ] Auth checked on protected routes

**Quality (blocking)**
- [ ] No functions > 50 lines
- [ ] No files > 800 lines
- [ ] Errors handled, not swallowed
- [ ] No `console.log` left in committed code (use proper logging)

**React (warning)**
- [ ] useEffect deps correct
- [ ] No render-phase side effects
- [ ] Keys on lists
- [ ] Loading/error states present

**Performance (advisory)**
- [ ] No unnecessary re-renders (memo where heavy)
- [ ] Large lists virtualized if > 100 items
- [ ] API queries bounded (LIMIT, pagination)
- [ ] Web Workers used for heavy computation (D3 layout)

---

## Git Workflow

- Commit messages: `type: description` (fix:, feat:, refactor:, docs:, chore:)
- Keep commits focused — one logical change per commit
- Never commit `.env`, `node_modules/`, or `pgdata/`

## When Uncertain

- Read the existing code before proposing changes
- Match existing patterns and conventions in the file being edited
- Ask rather than guess when data integrity is at stake
