# BBI v5.0 Data Architecture

## Overview

Battle Born Intelligence (BBI) tracks the Nevada startup ecosystem across companies, funds,
people, organizations, regulatory dockets, and their interconnections. This document defines the
canonical data model, naming conventions, validation rules, and context layer structures that all
agents and contributors must follow.

All data in BBI originates from verifiable public sources (SEC EDGAR, Crunchbase, PitchBook,
press releases, Nevada GOED, US Treasury SSBCI). Every data point should carry a source
reference and confidence level per ICD-203 standards.

---

## Entity Types

### 1. Company

A startup or technology company operating in or headquartered in Nevada.

| Field        | Type       | Required | Description                                         |
|------------- |----------- |--------- |---------------------------------------------------- |
| id           | number     | yes      | Unique integer, sequential (1, 2, 3, ...)           |
| name         | string     | yes      | Legal or commonly-known company name                |
| stage        | enum       | yes      | One of: pre_seed, seed, series_a, series_b, series_c_plus, growth |
| sector       | string[]   | yes      | 1-4 sectors from KNOWN_SECTORS (see below)          |
| city         | string     | yes      | Nevada city (e.g., "Las Vegas", "Reno", "Carson City") |
| region       | enum       | yes      | One of: las_vegas, reno, henderson, rural            |
| funding      | number     | yes      | Total funding raised in $M (millions USD)           |
| momentum     | number     | yes      | Momentum score 0-100 (composite growth signal)      |
| employees    | number     | yes      | Approximate headcount                                |
| founded      | number     | yes      | Year founded (4-digit, e.g. 2017)                    |
| description  | string     | yes      | 1-3 sentence summary of the company                 |
| eligible     | string[]   | yes      | Fund IDs the company is eligible for (e.g., ["bbv","fundnv"]) |
| lat          | number     | yes      | Latitude (decimal degrees, ~36-42 for Nevada)       |
| lng          | number     | yes      | Longitude (decimal degrees, ~-114 to -120 for Nevada) |

### 2. Fund

An investment fund, SSBCI program, angel group, or accelerator fund.

| Field       | Type       | Required | Description                                          |
|------------ |----------- |--------- |----------------------------------------------------- |
| id          | string     | yes      | Lowercase slug (e.g., "bbv", "fundnv", "1864")      |
| name        | string     | yes      | Full fund name                                        |
| type        | enum       | yes      | One of: SSBCI, Angel, Deep Tech VC, Growth VC, Accelerator |
| allocated   | number     | no       | Total allocation in $M (null if not public)          |
| deployed    | number     | yes      | Capital deployed in $M                                |
| leverage    | number     | no       | Leverage ratio (private capital per SSBCI dollar)    |
| companies   | number     | yes      | Number of portfolio companies                         |
| thesis      | string     | yes      | Investment thesis summary                             |

### 3. Edge (Verified Relationship)

A verified connection between two entities in the ontology graph.

| Field    | Type   | Required | Description                                           |
|--------- |------- |--------- |------------------------------------------------------ |
| source   | string | yes      | Source node ID (prefixed: c_1, f_bbv, x_google, etc.) |
| target   | string | yes      | Target node ID                                         |
| rel      | enum   | yes      | Relationship type (see KNOWN_RELATIONSHIPS below)     |
| note     | string | yes      | Brief description of the relationship                 |
| y        | number | yes      | Year the relationship was established or verified     |

Node ID prefixes:
- `c_` = company (e.g., c_1 for Redwood Materials)
- `f_` = fund (e.g., f_bbv for Battle Born Venture)
- `x_` = external entity
- `p_` = person
- `a_` = accelerator
- `e_` = ecosystem org
- `s_` = sector
- `r_` = region
- `ex_` = stock exchange

### 4. Person

A key individual in the Nevada startup ecosystem.

| Field     | Type    | Required | Description                                   |
|---------- |-------- |--------- |---------------------------------------------- |
| id        | string  | yes      | Prefixed ID: p_{lastname} (e.g., "p_straubel") |
| name      | string  | yes      | Full name                                      |
| role      | string  | yes      | Title/role                                     |
| companyId | number  | no       | Company ID if affiliated (null if ecosystem-wide) |
| fundId    | string  | no       | Fund ID if affiliated                          |
| note      | string  | yes      | Brief context                                  |

### 5. External Entity

An entity outside the core Nevada startup ecosystem (investors, corporates, government).

| Field | Type   | Required | Description                                        |
|------ |------- |--------- |--------------------------------------------------- |
| id    | string | yes      | Prefixed ID: x_{shortname} (e.g., "x_stellantis")  |
| name  | string | yes      | Full entity name                                    |
| etype | enum   | yes      | One of: Corporation, VC Firm, PE Firm, Government, University, SPAC, Investment Co, Foundation |
| note  | string | yes      | Brief description of relevance to NV ecosystem      |

### 6. Accelerator

A startup accelerator, incubator, or innovation program.

| Field   | Type   | Required | Description                                        |
|-------- |------- |--------- |--------------------------------------------------- |
| id      | string | yes      | Prefixed ID: a_{shortname} (e.g., "a_startupnv")   |
| name    | string | yes      | Full name                                           |
| atype   | enum   | yes      | One of: Accelerator, Incubator, Pre-Accelerator, Accelerator/Incubator, Military Accelerator, Incubator/Lab, Incubator/Fund, Angel Program |
| city    | string | yes      | Nevada city                                         |
| region  | enum   | yes      | Region (las_vegas, reno, henderson, rural)          |
| founded | number | yes      | Year founded                                        |
| note    | string | yes      | Description                                         |

### 7. Ecosystem Organization

Economic development authorities, university hubs, and government support organizations.

| Field  | Type   | Required | Description                                         |
|------- |------- |--------- |---------------------------------------------------- |
| id     | string | yes      | Prefixed ID: e_{shortname} (e.g., "e_goed")         |
| name   | string | yes      | Full name                                            |
| etype  | enum   | yes      | One of: Government, Economic Development, University Hub |
| city   | string | yes      | Nevada city                                          |
| region | enum   | yes      | Region                                               |
| note   | string | yes      | Description                                          |

### 8. Regulatory Docket

A regulatory action, rulemaking, or compliance requirement affecting the ecosystem.

| Field          | Type   | Required | Description                                     |
|--------------- |------- |--------- |------------------------------------------------ |
| id             | string | yes      | Prefixed ID: rd_{NN} (e.g., "rd_01")            |
| title          | string | yes      | Full title of the regulatory action              |
| agency         | string | yes      | Issuing agency                                   |
| sector         | string[]| yes     | Affected sectors                                 |
| status         | enum   | yes      | One of: proposed, active, finalized              |
| severity       | number | yes      | 1-5 (1=informational, 5=critical)                |
| breadth        | number | yes      | 0.0-1.0 (fraction of ecosystem affected)         |
| timeline       | enum   | yes      | One of: near, medium, long                       |
| supportiveness | number | yes      | 0-100 (how supportive of industry; 100=very supportive) |
| burden         | number | yes      | 0-100 (compliance burden; 100=very burdensome)   |
| description    | string | yes      | Detailed description                             |

### 9. Sector Dynamics

Market intelligence data for each sector tracked.

| Field          | Type   | Required | Description                                      |
|--------------- |------- |--------- |------------------------------------------------- |
| growth3YCAGR   | number | yes      | 3-year CAGR (0.0-1.0, e.g., 0.42 = 42%)         |
| dealGrowthYoY  | number | yes      | Year-over-year deal growth rate                   |
| smartMoneyShare| number | yes      | Share of capital from "smart money" investors     |
| porterScores   | object | yes      | Porter's Five Forces: {rivalry, entrants, substitutes, buyerPower, supplierPower} each 1-5 |
| maturityStage  | enum   | yes      | One of: emerging, growth, mature, declining       |

### 10. Company IA (Inferred Analysis) Data

Intelligence assessment data per company.

| Field              | Type     | Required | Description                                  |
|------------------- |--------- |--------- |--------------------------------------------- |
| trl                | number   | yes      | Technology Readiness Level 1-9 (NASA scale)  |
| mrl                | number   | yes      | Market Readiness Level 1-9                    |
| riskFactors        | object[] | yes      | Array of {category, name, likelihood(1-5), impact(1-5)} |
| ventureQuality     | object   | yes      | {market(1-5), valueProp(1-5), businessModel(1-5), team(1-5)} |
| regulatoryExposure | string[] | yes      | Regulatory bodies with jurisdiction           |
| complianceMaturity | object   | yes      | {governance(1-5), policies(1-5), systems(1-5), monitoring(1-5), training(1-5)} |

### 11. Listing (Public Market)

Public market listing data for publicly traded companies.

| Field     | Type   | Required | Description                     |
|---------- |------- |--------- |-------------------------------- |
| companyId | number | yes      | Company ID                       |
| exchange  | string | yes      | Stock exchange (Nasdaq, NYSE, ASX, OTC, TSX) |
| ticker    | string | yes      | Ticker symbol                    |

### 12. Timeline Event

Activity feed events.

| Field   | Type   | Required | Description                                           |
|-------- |------- |--------- |------------------------------------------------------ |
| date    | string | yes      | ISO date string (YYYY-MM-DD)                          |
| type    | enum   | yes      | One of: funding, partnership, hiring, launch, grant, award, momentum, patent |
| company | string | yes      | Company name (must match a company in COMPANIES)      |
| detail  | string | yes      | Brief event description                                |
| icon    | string | yes      | Emoji icon for visual display                          |

---

## Known Enumerations

### KNOWN_STAGES
```
pre_seed, seed, series_a, series_b, series_c_plus, growth
```

### KNOWN_SECTORS
```
AI, Cybersecurity, Defense, Cleantech, Mining, Aerospace, Cloud, Data Center,
Energy, Solar, Robotics, Biotech, Fintech, Gaming, Blockchain, Drones,
Construction, Logistics, Materials Science, Real Estate, Computing, Water,
Media, Payments, IoT, Manufacturing, Semiconductors, Hospitality, Cannabis,
Analytics, Satellite, Identity, AdTech, Education, Healthcare, Consumer,
Fitness, Mobile, Banking, Retail, HR Tech, Enterprise
```

### KNOWN_REGIONS
```
las_vegas, reno, henderson, rural
```

### KNOWN_RELATIONSHIPS
```
eligible_for, operates_in, headquartered_in, invested_in, loaned_to,
partners_with, contracts_with, acquired, founder_of, manages, listed_on,
accelerated_by, won_pitch, incubated_by, program_of, supports, housed_at,
collaborated_with, funds, approved_by, filed_with, competes_with, grants_to
```

### KNOWN_EXTERNAL_TYPES
```
Corporation, VC Firm, PE Firm, Government, University, SPAC, Investment Co, Foundation
```

### KNOWN_FUND_TYPES
```
SSBCI, Angel, Deep Tech VC, Growth VC, Accelerator
```

### KNOWN_DOCKET_STATUSES
```
proposed, active, finalized
```

### KNOWN_TIMELINE_TYPES
```
funding, partnership, hiring, launch, grant, award, momentum, patent
```

---

## ID Format Conventions

| Entity          | Format               | Example           |
|---------------- |--------------------- |------------------ |
| Company         | numeric integer      | 1, 2, 75          |
| Fund            | lowercase slug       | bbv, fundnv       |
| Person          | p_{lastname}         | p_straubel         |
| External        | x_{shortname}        | x_stellantis       |
| Accelerator     | a_{shortname}        | a_startupnv        |
| Ecosystem Org   | e_{shortname}        | e_goed             |
| Regulatory      | rd_{NN}              | rd_01              |
| Graph Company   | c_{id}               | c_1                |
| Graph Fund      | f_{id}               | f_bbv              |
| Sector Node     | s_{SectorName}       | s_AI               |
| Region Node     | r_{region}           | r_las_vegas        |
| Exchange Node   | ex_{Exchange}        | ex_Nasdaq          |

---

## Data Validation Rules

1. All company IDs must be unique positive integers
2. All string IDs (funds, people, externals, accelerators, ecosystem orgs) must be unique
3. Company funding must be >= 0 (in $M)
4. Company momentum must be 0-100
5. Company employees must be >= 1
6. Company founded must be a valid year (1950-current year)
7. Company lat must be between 35.0 and 42.5 (Nevada bounds)
8. Company lng must be between -120.5 and -114.0 (Nevada bounds)
9. Edge source and target must reference valid node IDs that exist in the data
10. Edge relationship type must be in KNOWN_RELATIONSHIPS
11. All sectors in company sector arrays must be in KNOWN_SECTORS
12. Fund eligible references in company eligible arrays must match valid fund IDs
13. RiskFactor likelihood and impact must be 1-5
14. TRL and MRL must be 1-9
15. Regulatory docket severity must be 1-5
16. Regulatory docket breadth must be 0.0-1.0
17. Regulatory docket supportiveness and burden must be 0-100
18. Porter scores (rivalry, entrants, substitutes, buyerPower, supplierPower) must be 1-5
19. VentureQuality scores (market, valueProp, businessModel, team) must be 1-5
20. ComplianceMaturity scores (governance, policies, systems, monitoring, training) must be 1-5

---

## Context Layer Architecture

Context layers provide multi-dimensional overlays on the core entity data. See
`src/data/context-layers.js` for definitions. Each layer has:

- **layerId**: Unique identifier
- **type**: geospatial | temporal | economic | regulatory | network | demographic
- **source**: Data source and methodology
- **timestamp**: Last updated (ISO 8601)
- **refreshFrequency**: How often the layer should be refreshed
- **data**: Layer-specific payload (varies by type)

---

## File Organization

```
src/data/
  README.md              -- This file (data model documentation)
  AGENT_GUIDELINES.md    -- Best practices for agents adding data
  schema.js              -- JSON schema definitions and validators
  sources.js             -- Data source registry with metadata
  context-layers.js      -- Context layer definitions
  validate.js            -- Standalone validation utility (Node.js)
```

All entity data is currently inline in `src/App.jsx`. As the data layer is extracted,
entities will move to dedicated files within `src/data/entities/` (companies.js, funds.js, etc.).
The schema and validation files here define the contract that all data must satisfy before
being committed.
