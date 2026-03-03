# BBI GOED/SSBCI Refocus Design

## Goal

Refocus Battle Born Intelligence from a general startup ecosystem dashboard into an internal GOED tool centered on SSBCI ecosystem intelligence.

## Audience

- SSBCI Program Managers (daily portfolio tracking)
- Economic Development Officers (ecosystem evaluation, company outreach)
- GOED Leadership (periodic reporting, strategic dashboards)

## Approach

Surgical cleanup of the single-file React app (`src/App.jsx`, ~2248 lines). Remove unused views, refocus dashboard KPIs toward SSBCI metrics. No data changes, no branding changes.

## Views (11 -> 9)

### Remove
- **Watchlist** — view, state, toggleWatchlist/isWatched helpers, all star buttons
- **Compare** — view, compareList state, floating compare bar

### Keep (reordered)
1. Dashboard (Home)
2. SSBCI
3. Radar
4. Companies
5. Funds
6. Sectors
7. Graph
8. Timeline (Activity)
9. Map

## Dashboard Refocus

Replace general startup KPIs with SSBCI-first metrics:

1. SSBCI Capital Deployed — sum of deployed across BBV + FundNV + 1864
2. Private Capital Leveraged — deployed x leverage ratio per fund
3. SSBCI Portfolio Companies — count of companies with SSBCI fund eligibility
4. Avg IRS (SSBCI Portfolio) — IRS of SSBCI-affiliated companies only
5. Total Ecosystem Raised — secondary context
6. Companies Tracked — secondary context (75 total)

Top company lists default to SSBCI-affiliated companies first.

## Code Changes

### Remove
- `watchlist` useState, `toggleWatchlist`, `isWatched` functions
- `compareList` useState and related logic
- Watchlist view block (`view === "watchlist"`)
- Compare view block (`view === "compare"`)
- Star buttons in Radar, Companies, Sectors views
- Compare floating bar at bottom of app
- `watchlist` and `compare` entries from VIEWS array

### Modify
- VIEWS array — remove watchlist/compare, reorder with SSBCI after Dashboard
- Dashboard section — replace KPI cards with SSBCI-focused metrics

### No Changes
- Company data (75 companies)
- Fund data (8 funds)
- Graph data (edges, externals, accelerators, ecosystem orgs)
- Timeline events
- IRS computation engine
- Graph builder/layout engine
- All other views (Radar, Companies, Funds, Sectors, Graph, Timeline, SSBCI, Map)
- Branding (BBI name, colors, styling)
