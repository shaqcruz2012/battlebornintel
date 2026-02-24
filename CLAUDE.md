# Battle Born Intelligence (BBI)

Nevada startup ecosystem intelligence platform. Tracks 75 companies, 276 verified relationships, and computes structural graph analytics to surface non-obvious investment signals.

## Commands

- `npm run dev`: Start Vite dev server (port 5173)
- `npm run build`: Production build to dist/
- `npm run preview`: Preview production build

## Architecture

Current state: **single-file React monolith** (`src/App.jsx`, 2,249 lines). First priority is decomposition.

### Target Structure

```
src/
  App.jsx              # Shell with view routing, nav, state
  components/
    GraphView.jsx      # OntologyGraphView — SVG force-directed graph
    Dashboard.jsx      # Home view with KPI counters
    CompanyList.jsx     # Companies table + detail panel
    FundView.jsx        # Fund drill-down
    RadarView.jsx       # IRS radar scoring
    TimelineView.jsx    # Activity feed
    MapView.jsx         # Geographic view
  lib/
    graphIntel.js       # PageRank, Betweenness, Community Detection, Watchlist
    graphLayout.js      # buildGraph(), computeLayout() with d3-force
    computeIRS.js       # Investment Readiness Score heuristic
    formatters.js       # fmt(), stageLabel(), shared utils
  data/
    companies.json      # 75 Nevada startups with funding, sector, stage, coords
    edges.json          # 276 verified edges with timestamps (y: 2005-2026)
    externals.json      # 139 external entities (investors, corporates, gov agencies)
    funds.json          # 6 funds (BBV, FundNV, 1864, SBIR, AngelNV, Sierra)
    accelerators.json   # 12 accelerators (StartUpNV, gener8tor, gBETA, Zero Labs, etc.)
    ecosystem.json      # 5 ecosystem orgs (GOED, EDAWN, LVGEA, etc.)
    people.json         # 6 people (founders, fund managers)
    timeline.json       # 30 timeline events
    listings.json       # 14 stock listings (NYSE/Nasdaq)
```

### Key Data Relationships

- Company IDs: `c_1` through `c_75` (integer id in data, string in graph)
- Fund IDs: `f_bbv`, `f_fundnv`, `f_1864`, `f_sbir`, `f_angelnv`, `f_sierra`
- External IDs: `x_` prefix (e.g., `x_goldman`, `x_doe`, `x_boeing`)
- Accelerator IDs: `a_` prefix (e.g., `a_startupnv`, `a_zerolabs`)
- Ecosystem IDs: `e_` prefix (e.g., `e_goed`, `e_lvgea`)
- People IDs: `p_` prefix (e.g., `p_saling`, `p_straubel`)
- Edges reference source/target by these IDs

### Graph Intelligence Engine

Three algorithms run client-side (move to server-side when scaling):

1. **PageRank** — Power iteration, damping=0.85, 40 iterations. Ranks structural importance.
2. **Betweenness Centrality** — Brandes' algorithm. Identifies bridge nodes between clusters.
3. **Community Detection** — Label Propagation. Finds natural clusters.

Five watchlist signal types:
- `undercovered`: High funding, few connections
- `bridge`: High betweenness, structurally critical
- `hidden_influence`: High PageRank despite modest funding
- `isolated_capital`: Big money but low graph connectivity
- `hub`: 8+ connections

### Relationship Types (17 configured in REL_CFG)

invested_in, partners_with, accelerated_by, competes_with, acquired, funds, collaborated_with, supports, program_of, housed_at, manages, loaned_to, contracts_with, won_pitch, grants_to, approved_by, filed_with

## Code Style

- React functional components with hooks
- All styling is inline CSS-in-JS objects (no CSS files)
- d3 used for force simulation layout only (not DOM manipulation)
- SVG for graph rendering with glow filters, bezier edges, directional arrows
- Color palette defined in GP object (Palantir-inspired dark theme)
- All data is static arrays/objects — no API calls yet

## Important Notes

- **Edge timestamps**: Every edge has `y:` field (year). Used by time slider and temporal glow.
- **buildGraph() takes yearFilter**: Edges are filtered by `(e.y || 2023) <= yearFilter`.
- **Node coloring has 4 modes**: default (by stage), pagerank, betweenness, community.
- **Node radius scales** with active metric in PR/BC modes.
- **Fund references must use f_ prefix**: `f_fundnv` not `fundnv`. Previous bug fixed in audit.
- **Rel type must match REL_CFG**: Use `accelerated_by` not `accelerated`. Previous bug fixed.
- **NEVER duplicate edge keys**: source+target+rel must be unique.

## Known Technical Debt

- 152 edges default to y:2023 — need real dates from research
- 25 companies have ≤2 edges (11 have only 1) — need edge expansion
- IRS scoring uses heuristic weights, not ML-derived
- Timeline events are illustrative, not from live feed
- Graph metrics run client-side on every render — fine at 276 edges, will choke at 1K+
- No backend API wired yet (FastAPI scaffold exists separately)

## Data Ingestion Pipeline (Planned)

Python ingestion engine already built in separate project. Sources:
- SEC EDGAR Form D filings (private placements)
- SBIR/STTR federal grant database
- NewsAPI enrichment (optional)
- Job postings (LinkedIn/Indeed) for headcount velocity
- USPTO patent filings

Target: edges.json populated by automated pipeline, graph metrics computed server-side as batch job.

## Additional Context

- See @docs/architecture.md for backend FastAPI design (125 endpoints, PostgreSQL, Docker)
- See @docs/data-sources.md for ingestion engine documentation
- The platform name "Battle Born" references Nevada's state motto
