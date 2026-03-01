# BBI v5.0 Agent Guidelines

## Purpose

This document provides best practices for all agents contributing data to the Battle Born
Intelligence platform. Following these guidelines ensures data consistency, traceability,
and quality across the multi-agent system.

---

## 1. Before Adding Data

### Check for Duplicates
Before adding any entity, search existing data for potential duplicates:
- Search by name (exact and fuzzy: "SNC" vs "Sierra Nevada Corp")
- Search by ID to ensure no collisions
- Check edge lists for duplicate relationships between the same source and target

### Verify Your Source
Every data point must be traceable to a verifiable source. Before adding data:
1. Identify the source from `src/data/sources.js`
2. If the source is not in the registry, add it first
3. Record the source ID, access date, and specific URL or document reference
4. Assess source reliability (see scale below)

---

## 2. Formatting New Entries

### Company Format
```js
{
  id: 76,                             // Next sequential integer
  name: "Company Name",               // Legal or commonly-known name
  stage: "seed",                      // Must be in KNOWN_STAGES
  sector: ["AI", "Healthcare"],       // 1-4 sectors from KNOWN_SECTORS
  city: "Las Vegas",                  // Nevada city name
  region: "las_vegas",                // Must be in KNOWN_REGIONS
  funding: 2.5,                       // Total funding in $M
  momentum: 55,                       // 0-100, see scoring guide below
  employees: 12,                      // Approximate headcount
  founded: 2023,                      // 4-digit year
  description: "Brief 1-3 sentence description of the company.",
  eligible: ["fundnv"],               // Fund IDs or empty array
  lat: 36.17,                         // Latitude (decimal degrees)
  lng: -115.14                        // Longitude (decimal degrees)
}
```

### Edge Format
```js
{
  source: "x_investor_name",          // Source node ID (prefixed)
  target: "c_76",                     // Target node ID (prefixed)
  rel: "invested_in",                 // Must be in KNOWN_RELATIONSHIPS
  note: "Seed round $2.5M lead",      // Brief description
  y: 2024                             // Year established
}
```

### Person Format
```js
{
  id: "p_lastname",                   // p_ prefix + lowercase last name
  name: "Jane Smith",                 // Full name
  role: "Founder/CEO",                // Title
  companyId: 76,                      // Company ID or null
  note: "Previously at Google AI"     // Brief context
}
```

### External Entity Format
```js
{
  id: "x_shortname",                  // x_ prefix + lowercase short name
  name: "Full Entity Name",           // Full name
  etype: "VC Firm",                   // Must be in KNOWN_EXTERNAL_TYPES
  note: "Relevance to NV ecosystem"   // Brief description
}
```

### Regulatory Docket Format
```js
{
  id: "rd_19",                        // rd_ prefix + sequential 2-digit number
  title: "Full Docket Title",
  agency: "Issuing Agency",
  sector: ["AI", "Healthcare"],       // Affected sectors
  status: "proposed",                 // proposed, active, or finalized
  severity: 3,                        // 1-5
  breadth: 0.4,                       // 0.0-1.0
  timeline: "medium",                 // near, medium, or long
  supportiveness: 60,                 // 0-100
  burden: 45,                         // 0-100
  description: "Detailed description of the regulatory action."
}
```

---

## 3. Required vs Optional Fields

### Always Required
Every entity type has required fields defined in `src/data/schema.js`. Key rules:
- **Companies**: All 14 fields are required. No nulls for core fields.
- **Funds**: `allocated` and `leverage` may be null if not publicly available.
- **Edges**: All 5 fields (source, target, rel, note, y) are required.
- **People**: `companyId` and `fundId` are optional (null if ecosystem-wide).
- **Externals**: All 4 fields are required.

### Optional Fields
Fields that accept null or omission:
- Fund `allocated` (private funds may not disclose)
- Fund `leverage` (not applicable to non-SSBCI funds)
- Person `companyId` (for ecosystem-level people like Jeff Saling)
- Person `fundId` (for company-affiliated people)

---

## 4. Source Citations

### Every Data Point Needs a Source

When adding data, document the source using this format in your commit message or
accompanying PR description:

```
Source: [source_id] | Accessed: YYYY-MM-DD | URL: https://...
Confidence: high/moderate/low
```

### Reliability Scale (aligned with ICD-203)
| Rating | Label         | Description                                     |
|--------|---------------|------------------------------------------------ |
| 5      | Authoritative | Government records, SEC filings, audited reports |
| 4      | Reliable      | Major data platforms (Crunchbase, PitchBook)     |
| 3      | Fairly reliable| Reputable media, industry publications          |
| 2      | Verify        | Company self-reports, press releases             |
| 1      | Unverified    | Social media, anonymous tips, rumors             |

### Priority Order for Conflicting Data
When sources disagree, prefer in this order:
1. SEC filings and government records (reliability 5)
2. PitchBook/Crunchbase with multiple corroborating sources (reliability 4)
3. Reputable industry media with named sources (reliability 3)
4. Company press releases (reliability 2) -- use as fallback only
5. Anecdotal sources (reliability 1) -- note uncertainty, do not use alone

---

## 5. Handling Uncertainty

### Confidence Levels (per ICD-203)

Use these confidence assessments when data is uncertain:

| Level    | Description                                  | When to Use                    |
|----------|----------------------------------------------|---------------------------------|
| High     | Multiple independent authoritative sources   | SEC filings + Crunchbase match |
| Moderate | Single authoritative source or 2+ secondary  | Press release + LinkedIn data  |
| Low      | Single secondary source or self-report only  | Company website claim only     |

### How to Document Uncertainty
- Add `(estimated)` suffix in descriptions for approximate values
- For funding amounts: round to nearest significant digit, note "(approximate)" if self-reported
- For employee counts: use LinkedIn data with "(approximate from LinkedIn)" note
- For momentum scores: document the scoring methodology used

### When Data is Missing
- Use reasonable defaults from `_iaDefaults()` function for IA data
- For missing funding data: set to 0, add note in description
- For missing coordinates: use city center coordinates from the geospatial layer
- Never fabricate data. If unknown, mark as such.

---

## 6. Naming Conventions

### ID Formats
| Entity       | Format            | Example         | Rule                              |
|------------- |------------------ |---------------- |---------------------------------- |
| Company      | integer           | 76              | Next sequential number            |
| Fund         | lowercase_slug    | bbv             | Short, memorable, lowercase       |
| Person       | p_{lastname}      | p_straubel      | Lowercase, underscores for spaces |
| External     | x_{shortname}     | x_stellantis    | Lowercase, abbreviated            |
| Accelerator  | a_{shortname}     | a_startupnv     | Lowercase, abbreviated            |
| Ecosystem    | e_{shortname}     | e_goed          | Lowercase, abbreviated            |
| Docket       | rd_{NN}           | rd_01           | Sequential 2-digit number         |

### Variable Naming
- Use camelCase for JavaScript variables and object keys
- Use UPPER_SNAKE_CASE for constants (e.g., KNOWN_SECTORS)
- Use lowercase_with_underscores for IDs and slugs

### Sector Naming
Always use the exact names from `KNOWN_SECTORS` in `src/data/schema.js`.
Do NOT use variations like:
- "Artificial Intelligence" -- use "AI"
- "Cyber Security" -- use "Cybersecurity"
- "HealthCare" -- use "Healthcare"
- "Clean Tech" -- use "Cleantech"
- "Ad Tech" -- use "AdTech"
- "FinTech" -- use "Fintech"
- "Block Chain" -- use "Blockchain"

---

## 7. Avoiding Duplicates

### Before Adding a Company
1. Search by name (case-insensitive, partial match)
2. Check if a similar company exists at the same address
3. Look for name variations (e.g., "SNC" vs "Sierra Nevada Corp")
4. Verify the company hasn't been acquired and folded into another entity

### Before Adding an Edge
1. Check if the exact source-target-rel triple already exists
2. If updating a relationship, modify the existing edge rather than adding a duplicate
3. Multiple edges between the same entities are allowed if they have different `rel` types

### Before Adding an External Entity
1. Search by name and shortname across all externals
2. Check if the entity exists under a parent company name
3. Watch for duplicate IDs (e.g., x_blackrock appears in multiple contexts)

---

## 8. Handling Conflicting Data

When two sources provide different values for the same field:

1. **Note both values** in a comment or PR description
2. **Prefer the higher-reliability source** (see priority order in section 4)
3. **Prefer the more recent data** if reliability is equal
4. **If still ambiguous**, use the more conservative estimate and note the discrepancy
5. **Never silently overwrite** -- document what changed and why

### Example
```
// Funding conflict:
// Crunchbase: $26M total raised (accessed 2025-02-15)
// Company press release: $30M total raised (2025-01-20)
// Decision: Using $26M from Crunchbase (higher reliability, includes verified rounds only)
// The $30M figure likely includes unannounced bridge financing
```

---

## 9. Versioning and Timestamps

### Data Timestamps
- All context layers include a `timestamp` field (ISO 8601: YYYY-MM-DD)
- Update the timestamp whenever layer data is refreshed
- Source `lastAccessed` dates must be updated when data is re-verified

### Commit Messages for Data Changes
Use this format for data-related commits:
```
data: [action] [entity_type] - [brief description]

Sources: [source_ids]
Confidence: [high/moderate/low]
```

Examples:
```
data: add company #76 - NeonAI (seed, AI/Healthcare, Las Vegas)
data: update edge - x_doe loaned_to c_49 amount corrected to $996M
data: add docket rd_19 - NV AB 500 workforce development tax credit
```

### Data Refresh Schedule
| Data Type        | Refresh Frequency | Owner           |
|----------------- |------------------ |---------------- |
| Company funding  | Weekly            | Gap Analysis Agent |
| Employee counts  | Monthly           | Gap Analysis Agent |
| Regulatory dockets| Monthly          | Regulatory Agent |
| Economic data    | Quarterly         | Economic Dev Agent |
| Demographic data | Annually          | Economic Dev Agent |
| Context layers   | Per-type schedule | Data Capacity Agent |
| Source registry   | Monthly          | Data Capacity Agent |

---

## 10. Momentum Score Guide

Momentum scores (0-100) are composite signals. Use these rough guidelines:

| Score Range | Signal Level | Typical Indicators                                  |
|-------------|--------------|---------------------------------------------------- |
| 90-100      | Exceptional  | 20x+ revenue growth, major funding, national press  |
| 80-89       | Very strong  | Significant funding round, rapid hiring, awards      |
| 70-79       | Strong       | Growing revenue, new partnerships, product launches  |
| 60-69       | Moderate     | Steady growth, some press, expanding team            |
| 50-59       | Stable       | Operating normally, no major growth signals           |
| 40-49       | Cautious     | Flat or declining signals, potential challenges       |
| < 40        | At risk      | Layoffs, pivot, funding difficulties, market retreat  |

Factors to weight:
- Revenue growth rate (highest weight)
- Recent funding activity
- Hiring velocity
- Press mentions and awards
- Product launches and partnerships
- Customer growth / market penetration

---

## 11. Schema Validation

Before committing any data changes, run the validation utility:

```bash
node src/data/validate.js
```

This checks:
- Required fields present for all entities
- ID uniqueness across all entity types
- Edge references resolve to valid node IDs
- Numeric values within valid ranges
- Sector names match KNOWN_SECTORS
- No orphan edges (source/target must exist in the graph)

Fix all validation errors before committing. The validator output will show
specific errors with entity IDs and field names for easy debugging.

---

## 12. Checklist for Adding Data

- [ ] Searched for duplicates (name, ID, address)
- [ ] All required fields populated
- [ ] Sectors from KNOWN_SECTORS only
- [ ] Region from KNOWN_REGIONS only
- [ ] IDs follow naming convention
- [ ] Source documented with reliability rating
- [ ] Confidence level noted (high/moderate/low)
- [ ] Coordinates within Nevada bounds
- [ ] Numeric values within valid ranges
- [ ] Edge source and target IDs exist
- [ ] Validation script passes (`node src/data/validate.js`)
- [ ] Commit message follows data commit format
