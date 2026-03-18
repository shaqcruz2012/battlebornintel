# BBI Ecosystem Map — Integration Guide

## What This Is

The Nevada Innovation Resource Matrix, converted from a standalone HTML visualization
into a Next.js component ready to drop into the existing `battleborn/` monorepo.

**67 verified organizations** mapped on:
- X-axis: Kauffman SME→IDE track score (0–10)
- Y-axis: ICP stage score (0–10, anchored to revenue benchmarks)
- Bubble size: relative reach/impact

**6 policy gap overlays** based on MIT stress-test analysis:
- Valley of Death, Hybrid Growth Desert, SME Early-Rev Gap,
  Innovation Commons Gap, Series B Cliff, Rural IDE Desert

---

## Files to Add

```
battleborn/
├── frontend/
│   └── src/
│       ├── data/
│       │   ├── ecosystemOrgs.ts        ← All 67 org data (TS constants)
│       │   └── policyGaps.ts           ← 6 gap overlay definitions
│       ├── components/
│       │   ├── ResourceMatrix.tsx      ← Main chart component
│       │   └── ResourceMatrix.module.css
│       └── app/
│           └── ecosystem-map/
│               └── page.tsx            ← Next.js route
```

Drop all 5 files into those paths. No package installs needed.

---

## Implementation Steps

> Paste this prompt into Claude Code pointed at `battleborn/`:

```
Read this file first: ECOSYSTEM_MAP.md

I have 5 new files to integrate into the battleborn/ codebase.
Do the following in order:

1. Create frontend/src/data/ecosystemOrgs.ts — copy content from 
   the ecosystemOrgs.ts file I've provided

2. Create frontend/src/data/policyGaps.ts — copy content from 
   the policyGaps.ts file I've provided

3. Create frontend/src/components/ResourceMatrix.tsx — copy from 
   the ResourceMatrix.tsx file I've provided

4. Create frontend/src/components/ResourceMatrix.module.css — copy from 
   the ResourceMatrix.module.css file I've provided

5. Create frontend/src/app/ecosystem-map/page.tsx — copy from 
   the page.tsx file I've provided

6. Add IBM Plex Mono to the Next.js font config in frontend/src/app/layout.tsx:
   import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
   const ibmMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-mono' })
   Add ibmMono.variable to the body className.

7. Add "Ecosystem Map" to the navigation in frontend/src/components/Navigation.tsx
   (or wherever nav links live). The route is /ecosystem-map.

8. Verify no TypeScript errors: run npx tsc --noEmit from frontend/

Fix any import path issues based on the actual tsconfig.json path aliases.
Do not modify the data files — only fix import paths if needed.
```

---

## Data Architecture

### Why TS Constants (not database)

The 67 org coordinates are ICP-researched scores that change rarely and require
expert judgment to update. Keeping them as TS constants means:
- Zero database migration when org data changes
- Full type safety on coordinate values  
- Version-controlled alongside code (diffs are meaningful)
- No API round-trip to render the chart

### When to DB-ify

Move to PostgreSQL `ecosystem_resources` table when you need:
- Admin UI to update scores without a deploy
- Auto-scraping to update coordinates from live data
- Multi-user annotation (e.g. GOED staff adding notes per org)

Schema is pre-designed in the MIT findings — see `CLAUDE.md` in the monorepo.

---

## Coordinate Scoring Methodology

### X-axis: Kauffman SME→IDE Track (0–10)
```
0.0–1.5  Pure SME:      lifestyle, main-street, traditional small biz
2.0–3.5  SME-Hybrid:    some scalability but not pure venture
4.0–5.5  True Hybrid:   serves both tracks equally  
6.0–7.5  IDE-Leaning:   requires scalable model, some equity orientation
8.0–10.0 Pure IDE:      VC funds, venture-only accelerators
```

### Y-axis: ICP Stage Score (0–10)
```
0.5–2.1  Concept:       TRL 1-4, $0, research/student stage
2.2–4.9  Validation:    $0–$5K MRR or MVP, pre-revenue
5.0–6.9  Early Revenue: $5K–$100K MRR (FundNV ICP: "$5K–$25K MRR")
7.0–10.0 Growth:        $100K+ MRR / Seed / Series A–B
```

**Do not change coordinates without updating this document.**
Coordinates were MIT stress-tested across 12 validity checks.

---

## Policy Gap Overlays

Each gap is togglable via buttons below the chart.
Gap definitions live in `policyGaps.ts` with full framework citations.

| Gap | Color | Framework |
|-----|-------|-----------|
| Valley of Death | Blue | Kauffman |
| Hybrid Growth Desert | Amber | EDA |
| SME Early-Rev Gap | Pink | SBA |
| Innovation Commons Gap | Purple | NSF |
| Series B Cliff | Red | Kauffman |
| Rural IDE Desert | Teal | USDA |

---

## Extending the Dataset

To add a new organization, append to `coreData`, `stage3Data`, or `expandedData`
in `ecosystemOrgs.ts`:

```typescript
{
  name: 'Organization Full Name',
  abbr: 'ShortAbbr',           // max ~10 chars, no spaces
  type: 'Type Description',
  x: 7.5,                      // Kauffman track score
  y: 5.2,                      // ICP stage score  
  size: 4,                     // 2–8, relative to other orgs
  cat: 'IDE-Growth',           // must match COLOR_MAP key
  track: 'IDE',                // 'SME' | 'IDE' | 'Hybrid'
  stageN: 2,                   // 0–3
  geo: 'Las Vegas / Statewide',
  funding: 'Seed $X–$Y',
  industry: 'Tech, Cleantech, ...',
  website: 'example.org',
}
```

---

## Standalone HTML

`BBI_Ecosystem_Graph.html` remains the source of truth for rapid iteration.
When significant changes are made to the HTML version, re-run the extraction
to regenerate the TS files (Claude Code can do this from the HTML).

The HTML also serves as a **no-deploy shareable artifact** — send it to
GOED, legislators, or EDAWN without needing a hosted environment.

