# Graph Fix + BBV Portfolio Filter Design

**Date**: 2026-03-04
**Status**: Approved

## Problem

1. **Graph view broken**: `Graph.jsx` calls `useApi("/api/graph")` but `useApi` already prepends `/api`, producing `/api/api/graph` → 404.
2. **Company scoping**: Dashboard tracks 75 companies but user wants to focus on Battle Born Venture (BBV) portfolio (31 companies) by default, with a toggle to see the full ecosystem.

## Design

### Fix 1: Graph double-prefix bug

Change `Graph.jsx` line 14 from `useApi("/api/graph")` to `useApi("/graph")`.

### Fix 2: BBV Portfolio Filter

#### API Layer

Add `?fund=bbv` query parameter support to all routes:

- **`/api/companies`** — When `?fund=bbv`, filter to companies where `eligible` JSON contains `"bbv"`. When absent, return all.
- **`/api/graph`** — When `?fund=bbv`, only include company nodes that are BBV-eligible, plus entities/edges connected to those companies. Prune orphan entities.
- **`/api/stats/ssbci`** — When `?fund=bbv`, compute SSBCI metrics only for BBV companies.
- **`/api/stats/ecosystem`** — When `?fund=bbv`, compute totals only for BBV companies.
- **`/api/timeline`** — When `?fund=bbv`, filter events to those referencing BBV companies (by company name match in title/description).
- **`/api/funds`** — No filter needed (funds are funds, not companies).

The `?fund` param accepts: `bbv`, `fundnv`, `1864`, or omitted for all.

#### Frontend Layer

- Add `portfolioFilter` state to `App.jsx`, default `"bbv"`.
- Add a compact toggle in the header: "BBV Portfolio" | "Full Ecosystem".
- Pass `portfolioFilter` as a prop to all views.
- Each view appends `?fund=${portfolioFilter}` to its `useApi()` calls (skip when filter is `"all"`).
- `useApi` hook updated to accept optional query params, or views construct the path with the param.

#### Affected Views

All 10 views receive `portfolioFilter` prop and use it in API calls:
- Dashboard, SSBCI, Radar, Companies, Funds, Sectors, Graph, Timeline, Map, Brief

#### Data Impact

- BBV portfolio: 31 companies
- Full ecosystem: 75 companies
- Default view: BBV portfolio only
