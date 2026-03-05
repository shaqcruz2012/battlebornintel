# BBI Ontology Intelligence Platform — Design Document

> **Phase 1 Implementation** — Graph hover sidebar, ontology schema, agent framework, timeline verification agent, snapshot agent, cron scheduler, confidence/provenance layer.

**Goal:** Transform BBI from a static dashboard into a living intelligence platform with automated, verified data collection — governed by a Palantir-style economic development ontology focused on risk capital formation in Nevada.

**Architecture:** Extend the existing pnpm monorepo with an `agents/` workspace containing hybrid agents (structured API + LLM extraction). Agents run on cron (6:30am + 12:00pm PST), write to the same SQLite database, and are governed by an ontology config and confidence/quarantine system that ensures nothing unverified reaches the dashboard.

**Tech Stack:** Node.js agents, Anthropic Claude SDK (LLM extraction), Brave Search API (web search), node-cron (scheduling), sql.js (shared DB), existing React 19 + Vite 6 frontend.

---

## 1. Graph Node Hover Sidebar

### Interaction
- **Desktop:** Hover (mouseover) a Cytoscape node → floating panel appears positioned near the node. Click to pin it open. Click canvas to dismiss.
- **Mobile:** Tap a node (same as current behavior) → panel appears below graph.

### Panel Content by Node Type

**Company nodes:**
- Name, stage badge, city, founded year
- Sectors (colored chips)
- Funding (formatted), momentum bar, employees
- IRS grade + score
- Program eligibility chips (BBV, FundNV, 1864)
- Confidence indicator on agent-sourced data
- Connected edges count + breakdown by relationship type

**Fund/Investor nodes:**
- Name, type (VC/SSBCI/Accelerator)
- Deployed amount, leverage ratio
- Thesis snippet
- Portfolio company count (connected edges)

**Entity nodes (person, corp, university, gov):**
- Name, category, role/title
- City, region
- Note/description
- Connected edges count

### Implementation
- New component: `apps/goed/src/components/GraphHoverPanel.jsx`
- Cytoscape events: `cy.on("mouseover", "node")` / `cy.on("mouseout", "node")` with 200ms debounce
- Position: absolute, using `node.renderedPosition()` relative to graph container
- Shows confidence dot on every agent-sourced data point
- "View sources" link expands source chain

---

## 2. Ontology Configuration

### File: `packages/ui-core/src/ontology.js`

Shared by agents and frontend. Defines valid object types, link types, and required properties.

### Object Types

| Type | ID Prefix | Description | Key Properties |
|------|-----------|-------------|----------------|
| `company` | `c_` | Portfolio/ecosystem company | stage, funding, momentum, employees, sectors, eligible |
| `vc_firm` | `x_` | Venture capital firm | aum, fund_size, thesis, stage_focus |
| `angel` | `x_` | Angel investor/group | check_size, sectors |
| `ssbci_fund` | `f_` | State SSBCI program | allocated, deployed, leverage |
| `accelerator` | `a_` | Startup accelerator/incubator | program_type, cohort_size |
| `corporation` | `x_` | Strategic corporate player | industry, market_cap, nv_presence |
| `university` | `x_` | Research university | research_budget, tech_transfer |
| `gov_agency` | `x_` | Government body | jurisdiction, programs |
| `person` | `p_` | Key individual | role, affiliations |
| `exchange` | `x_` | Stock exchange/listing venue | — |

### Link Types

| Link | Valid Source → Target | Weight Property |
|------|----------------------|-----------------|
| `invested_in` | vc_firm/angel/ssbci_fund → company | deal_size |
| `loaned_to` | ssbci_fund → company | loan_amount |
| `grants_to` | gov_agency → company | grant_amount |
| `accelerated_by` | company → accelerator | cohort_year |
| `partners_with` | company ↔ corporation | — |
| `founded` | person → company/vc_firm | year |
| `manages` | person → vc_firm/ssbci_fund | — |
| `housed_at` | company → university | — |
| `supports` | gov_agency/university → company | — |
| `competes_with` | company ↔ company | — |
| `contracts_with` | company ↔ corporation | — |
| `listed_on` | company → exchange | — |

---

## 3. Confidence & Source Provenance Layer

### Core Principle
Nothing enters the live database without a source chain and confidence score. Every data point is guilty until proven innocent. False information is destructive to the user given the reporting and policy implications.

### Confidence Tiers

| Tier | Score | Meaning | Display | Auto-publish? |
|------|-------|---------|---------|---------------|
| `verified` | 1.0 | Human-confirmed or official filing (SEC, state records) | ✅ Green | Yes |
| `high` | 0.85+ | Multiple corroborating sources (2+ independent articles) | 🔵 Blue | Yes |
| `medium` | 0.60–0.84 | Single credible source (TechCrunch, PitchBook, local news) | 🟡 Yellow | Yes, with "unverified" tag |
| `low` | 0.30–0.59 | Single source, uncertain extraction | 🟠 Orange | **No — quarantined** |
| `unverified` | <0.30 | LLM inference, no direct source | 🔴 Red | **No — quarantined** |

### Quarantine System

Anything below `medium` confidence goes into `pending_review`, NOT the live tables. Invisible to the dashboard until a human promotes it or a second source corroborates it.

```sql
CREATE TABLE IF NOT EXISTS pending_review (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_table TEXT NOT NULL,       -- 'timeline_events', 'entities', 'edges'
  proposed_data TEXT NOT NULL,       -- JSON blob of the proposed record
  confidence REAL NOT NULL,
  sources TEXT,                      -- JSON array of source objects
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewer TEXT,
  status TEXT DEFAULT 'pending'      -- pending, approved, rejected
);
```

### Source Attribution

```sql
CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_type TEXT NOT NULL,         -- 'timeline_events', 'entities', 'edges'
  record_id INTEGER NOT NULL,
  url TEXT,
  title TEXT,
  published_date TEXT,
  accessed_at TEXT NOT NULL,
  source_credibility TEXT NOT NULL,  -- 'official', 'tier1', 'tier2', 'tier3', 'unknown'
  extraction_method TEXT             -- 'llm', 'api', 'manual'
);
```

### Source Credibility Ratings

- `official` — SEC EDGAR, state filings, company IR page
- `tier1` — Reuters, Bloomberg, WSJ, TechCrunch, PitchBook
- `tier2` — Local news (NNBW, Vegas Inc, RGJ), trade pubs
- `tier3` — Blogs, social media, press releases
- `unknown` — Unclassified source

### Corroboration Logic

- 1 tier1 source → `high` (0.85)
- 1 tier2 source → `medium` (0.70)
- 2+ tier2 sources agreeing → `high` (0.85)
- 1 tier3 source → `low` (0.50) → quarantined
- LLM inference with no URL → `unverified` (0.20) → quarantined

### Verification Rules

- **Amount verification:** Financial figures must appear as exact numbers in source text. LLM-estimated amounts → `low` confidence → quarantined.
- **Date verification:** Dates must appear in source or be derivable from publication date. Guessed dates → `low` confidence.
- **Staleness:** `medium` records not re-verified in 90 days get flagged. `high` records get 180 days. `verified` records don't expire.

---

## 4. Time-Series Layer

### Entity Snapshots Table

```sql
CREATE TABLE IF NOT EXISTS entity_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  period TEXT NOT NULL,              -- 'monthly' or 'quarterly'
  metrics TEXT NOT NULL              -- JSON: { funding, employees, momentum, valuation_band, ... }
);
```

Monthly snapshots capture current state of all tracked entities. Quarterly snapshots add computed aggregates.

### Timeline Events — Enhanced Schema

Add columns to existing `timeline_events`:

```sql
ALTER TABLE timeline_events ADD COLUMN amount REAL;
ALTER TABLE timeline_events ADD COLUMN round_type TEXT;
ALTER TABLE timeline_events ADD COLUMN investors TEXT;      -- JSON array of entity IDs
ALTER TABLE timeline_events ADD COLUMN valuation REAL;
ALTER TABLE timeline_events ADD COLUMN source_url TEXT;
ALTER TABLE timeline_events ADD COLUMN confidence REAL DEFAULT 1.0;
ALTER TABLE timeline_events ADD COLUMN agent_id TEXT;
ALTER TABLE timeline_events ADD COLUMN created_at TEXT;
ALTER TABLE timeline_events ADD COLUMN verified INTEGER DEFAULT 1;
```

Existing seed data gets `confidence: 1.0`, `verified: 1`, `agent_id: 'seed'`.

### Entities & Edges — Enhanced Schema

Add provenance columns:

```sql
ALTER TABLE entities ADD COLUMN confidence REAL DEFAULT 1.0;
ALTER TABLE entities ADD COLUMN source_url TEXT;
ALTER TABLE entities ADD COLUMN agent_id TEXT;
ALTER TABLE entities ADD COLUMN created_at TEXT;
ALTER TABLE entities ADD COLUMN verified INTEGER DEFAULT 1;

ALTER TABLE edges ADD COLUMN confidence REAL DEFAULT 1.0;
ALTER TABLE edges ADD COLUMN source_url TEXT;
ALTER TABLE edges ADD COLUMN agent_id TEXT;
ALTER TABLE edges ADD COLUMN created_at TEXT;
ALTER TABLE edges ADD COLUMN verified INTEGER DEFAULT 1;
```

### Computed Analytics (packages/ui-core/src/timeseries.js)

| Metric | Computation | Grain |
|--------|-------------|-------|
| Capital velocity | Δ funding / Δ time per company | MoM, QoQ |
| Sector inflow | Sum of event amounts per sector | MoM, QoQ, YoY |
| Inter-round gap | Days between sequential funding events | Per company |
| Burstiness | Coefficient of variation of inter-event intervals | Per sector |
| Accel/decel | Slope of momentum snapshots over trailing 3 months | Per company |
| SSBCI leverage delta | Private capital leveraged Δ after each SSBCI deployment | Per fund |
| Policy impact | Ecosystem snapshot diff before/after tagged policy event | Ad-hoc |

---

## 5. Agent Framework

### Directory Structure

```
agents/
├── package.json              # @anthropic-ai/sdk, node-cron, brave-search
├── .env                      # ANTHROPIC_API_KEY, BRAVE_SEARCH_API_KEY
├── lib/
│   ├── db.js                 # Shared DB access (same SQLite file as API)
│   ├── search.js             # Brave Search API wrapper
│   ├── llm.js                # Claude client with structured extraction prompts
│   ├── confidence.js         # Corroboration engine + quarantine logic
│   └── ontology-validator.js # Validates entities/edges against ontology config
├── timeline/
│   ├── run.js                # CLI entry: node agents/timeline/run.js
│   ├── search-companies.js   # For each SSBCI company, search recent mentions
│   ├── extract-events.js     # LLM extracts date, type, amount, detail from articles
│   └── verify-existing.js    # Re-checks existing events for date/detail accuracy
├── snapshot/
│   └── run.js                # Captures monthly/quarterly entity snapshots
├── scheduler.js              # node-cron: 6:30am + 12:00pm PST
└── README.md
```

### Phase 2 Additions (later)

```
agents/
├── graph-expander/
│   ├── run.js                # Orchestrator for REAP sub-agents
│   └── reap/
│       ├── risk-capital.js   # VCs, angels, SSBCI funds
│       ├── corporations.js   # Strategic corporates in NV
│       ├── entrepreneurs.js  # New companies, founders
│       ├── universities.js   # UNR, UNLV, DRI research
│       └── government.js     # GOED, DOE, SBA programs
```

### Timeline Agent Flow

```
1. Load SSBCI-eligible companies from DB (currently 31 BBV companies)
2. For each company:
   a. Search web: "{company_name} Nevada funding 2025 2026"
   b. For each search result (top 5):
      - Fetch article text via Brave Search snippets
      - LLM extract: { date, type, amount, round_type, detail, investors }
      - Score source credibility (tier1/tier2/tier3)
      - Compute confidence = extraction_certainty × source_credibility
   c. Check for corroboration across results
   d. Deduplicate against existing events (same company + date + type = skip)
   e. If confidence >= 0.60 → INSERT into timeline_events + data_sources
   f. If confidence < 0.60 → INSERT into pending_review (quarantined)
3. Run verify-existing: re-check dates/details on existing events
4. Log run summary: { companies_checked, events_added, events_quarantined, errors }
```

### Snapshot Agent Flow

```
1. Check if monthly/quarterly snapshot is due (1st of month / quarter)
2. Load all tracked entities (companies + entities)
3. For each entity, capture current metrics as JSON
4. INSERT into entity_snapshots with snapshot_date and period
5. Log: { entities_snapshotted, period, date }
```

### Cron Schedule

```js
// 6:30am PST (14:30 UTC) — morning intelligence run
cron.schedule('30 14 * * *', () => runTimeline());

// 12:00pm PST (20:00 UTC) — midday refresh
cron.schedule('0 20 * * *', () => runTimeline());

// Monthly snapshot: 1st of month at 6:00am PST (14:00 UTC)
cron.schedule('0 14 1 * *', () => runSnapshot('monthly'));

// Quarterly snapshot: Jan 1, Apr 1, Jul 1, Oct 1
cron.schedule('0 14 1 1,4,7,10 *', () => runSnapshot('quarterly'));
```

### Environment

Two API keys in `agents/.env`:
- `ANTHROPIC_API_KEY` — Claude LLM extraction (Haiku for cost efficiency)
- `BRAVE_SEARCH_API_KEY` — Web search (free tier: 2,000 queries/month)

---

## 6. Frontend Integration

### Graph Hover Panel
- New component: `apps/goed/src/components/GraphHoverPanel.jsx`
- Cytoscape mouseover/mouseout events with 200ms debounce
- Absolute positioning using `node.renderedPosition()`
- Confidence dot on agent-sourced data points
- "View sources" expandable link

### Timeline Enhancements
- Confidence badge on each event (✅/🔵/🟡)
- Click badge → shows source URL + extraction date
- `verified` events visually distinct from `medium`
- Collapsed "Pending Review" section at bottom (admin view)

### New API Endpoints
- `GET /api/timeline/pending` — quarantined events for review
- `POST /api/timeline/:id/verify` — promote pending event to live
- `GET /api/snapshots?entity=c_1&period=monthly` — time-series data
- `GET /api/sources/:record_type/:record_id` — source chain for any record

---

## Phase Summary

### Phase 1 (This Implementation)
1. Graph hover sidebar component
2. Ontology config (`packages/ui-core/src/ontology.js`)
3. Schema extensions (confidence, sources, snapshots, pending_review)
4. Agent framework (`agents/` workspace with shared libs)
5. Timeline verification agent
6. Snapshot agent
7. Cron scheduler (6:30am + 12:00pm PST)
8. Frontend confidence badges + source links

### Phase 2 (Future)
1. Graph expansion agent + 5 REAP sub-agents
2. Time-series visualization (sector inflow charts, velocity sparklines)
3. Policy impact before/after comparison view
4. Pending review admin UI
5. Acceleration/deceleration indicators on company cards
