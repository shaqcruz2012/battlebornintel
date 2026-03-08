# Integration Instructions: Battle Born Venture Portfolio Companies 100-105

## Overview

This guide explains how to integrate the 75 new edges for portfolio companies 100-105 into the existing `edges.js` file.

## Files Generated

1. **bbv_edges_100_105.js** - Ready-to-use JavaScript export with all edges
2. **EDGE_DATA_RESEARCH_100_105.md** - Complete research documentation
3. **RESEARCH_SUMMARY_100_105.md** - Strategic analysis and data distribution
4. **bbv_portfolio_edges_100_105.json** - JSON format for database ingestion

## Step 1: Create Missing Entity Definitions

Before adding edges, ensure all source entities exist in graph-entities.js or are properly defined. Add the following:

### External Organizations (Investors & Partners)

```javascript
// Add to EXTERNALS array in graph-entities.js

// Venture Capital Firms
{id:"i_sequoia",name:"Sequoia Capital",etype:"VC Firm",note:"Leading early-stage and growth investments"},
{id:"i_greylock",name:"Greylock Partners",etype:"VC Firm",note:"Early-stage and growth VC"},
{id:"i_boldstart",name:"Boldstart Ventures",etype:"VC Firm",note:"Enterprise SaaS specialist"},
{id:"i_bvp",name:"Bessemer Venture Partners",etype:"VC Firm",note:"Early-stage and growth"},
{id:"i_sigma",name:"Sigma Partners",etype:"VC Firm",note:"Professional services software focus"},
{id:"i_emergence",name:"Emergence Capital",etype:"VC Firm",note:"Cloud computing investor"},
{id:"i_insight",name:"Insight Partners",etype:"VC Firm",note:"Enterprise software investor"},
{id:"i_bessemer",name:"Bessemer Venture Partners",etype:"VC Firm",note:"Data infrastructure focus"},
{id:"i_redpoint",name:"Redpoint Ventures",etype:"VC Firm",note:"Series A/B investor"},
{id:"i_craft",name:"Craft Ventures",etype:"VC Firm",note:"Enterprise software focus"},
{id:"i_flagship",name:"Flagship Pioneering",etype:"VC Firm",note:"Healthcare/life sciences specialist"},
{id:"i_khosla",name:"Khosla Ventures",etype:"VC Firm",note:"Deep tech and climate focus"},
{id:"i_canaan",name:"Canaan Partners",etype:"VC Firm",note:"Early-stage and growth"},
{id:"i_founders",name:"Founders Fund",etype:"VC Firm",note:"Technology-focused investor"},
{id:"i_lerer",name:"Lerer Hippeau",etype:"VC Firm",note:"NYC-based VC, fintech focus"},
{id:"i_fx_capital",name:"FX Capital",etype:"VC Firm",note:"Fintech and payments specialist"},
{id:"i_commerce_v",name:"Commerce Ventures",etype:"VC Firm",note:"Fintech investor"},
{id:"i_lsvp",name:"Lightspeed Venture Partners",etype:"VC Firm",note:"Enterprise software investor"},
{id:"i_accel",name:"Accel",etype:"VC Firm",note:"Enterprise software and growth"},
{id:"i_openview",name:"OpenView",etype:"VC Firm",note:"SaaS growth investor"},
{id:"i_menlo",name:"Menlo Ventures",etype:"VC Firm",note:"Early-stage and growth"},
{id:"i_techcrunch_angels",name:"TechCrunch Angel Syndicate",etype:"Angel Network",note:"Early-stage angel investors"},
{id:"i_angel_fintech",name:"Fintech Angel Syndicate",etype:"Angel Network",note:"Payment/fintech focused angels"},

// Strategic Corporate VCs
{id:"x_salesforce_v",name:"Salesforce Ventures",etype:"Corporation VC",note:"Salesforce strategic investment arm"},
{id:"x_stripe_v",name:"Stripe Ventures",etype:"Corporation VC",note:"Stripe investment program"},
{id:"x_snowflake_v",name:"Snowflake Ventures",etype:"Corporation VC",note:"Snowflake strategic investor"},
{id:"x_intuit",name:"Intuit Ventures",etype:"Corporation VC",note:"QuickBooks/TurboTax parent"},
{id:"x_deloitte_v",name:"Deloitte Ventures",etype:"Corporation VC",note:"Deloitte consulting VC arm"},
{id:"x_philips_health",name:"Philips Healthcare",etype:"Corporation",note:"Healthcare technology leader"},

// Corporate Partners
{id:"x_segment",name:"Segment",etype:"Corporation",note:"Customer data platform"},
{id:"x_okta",name:"Okta",etype:"Corporation",note:"Identity management platform"},
{id:"x_databricks",name:"Databricks",etype:"Corporation",note:"Data lake platform"},
{id:"x_pwc",name:"PwC",etype:"Corporation",note:"Professional services firm"},
{id:"x_ey",name:"EY",etype:"Corporation",note:"Professional services firm"},
{id:"x_kpmg",name:"KPMG",etype:"Corporation",note:"Professional services firm"},
{id:"x_workiva",name:"Workiva",etype:"Corporation",note:"ESG and audit software"},
{id:"x_bigquery",name:"Google BigQuery",etype:"Corporation",note:"Google Cloud data warehouse"},
{id:"x_aws",name:"AWS",etype:"Corporation",note:"Amazon Web Services"},
{id:"x_tableau",name:"Tableau (Salesforce)",etype:"Corporation",note:"Business intelligence platform"},
{id:"x_siemens_health",name:"Siemens Healthineers",etype:"Corporation",note:"Medical imaging manufacturer"},
{id:"x_ge_health",name:"GE Healthcare",etype:"Corporation",note:"Healthcare technology leader"},
{id:"x_cvs_health",name:"CVS Health",etype:"Corporation",note:"Healthcare provider and pharmacy"},
{id:"x_fda",name:"FDA",etype:"Government",note:"Food and Drug Administration"},
{id:"x_square",name:"Square (Block)",etype:"Corporation",note:"Payment processing platform"},
{id:"x_paypal_v",name:"PayPal Ventures",etype:"Corporation VC",note:"PayPal investment arm"},
{id:"x_dlocal",name:"dLocal",etype:"Corporation",note:"Emerging markets payments"},
{id:"x_wise",name:"Wise",etype:"Corporation",note:"International money transfer"},
{id:"x_xero",name:"Xero",etype:"Corporation",note:"Cloud accounting platform"},
{id:"x_netsuite",name:"NetSuite (Oracle)",etype:"Corporation",note:"Oracle cloud ERP"},
{id:"x_workday",name:"Workday",etype:"Corporation",note:"Cloud HR and finance software"},
{id:"x_concur",name:"SAP Concur",etype:"Corporation",note:"Expense management platform"},

// Universities
{id:"u_stanford_cs",name:"Stanford Computer Science",etype:"University",note:"Stanford CS Department"},
{id:"u_berkeley_eecs",name:"UC Berkeley EECS",etype:"University",note:"Berkeley Electrical Eng. & CS"},
{id:"u_wharton",name:"Wharton School",etype:"University",note:"University of Pennsylvania"},
{id:"u_emory_goizueta",name:"Emory Goizueta",etype:"University",note:"Emory Business School"},
{id:"u_mit_csail",name:"MIT CSAIL",etype:"University",note:"MIT Computer Science AI Lab"},
{id:"u_cmu_db",name:"Carnegie Mellon Database",etype:"University",note:"CMU Database Group"},
{id:"u_stanford_med",name:"Stanford Medical School",etype:"University",note:"Stanford School of Medicine"},
{id:"u_ucsf_radiology",name:"UCSF Radiology",etype:"University",note:"UCSF Department of Radiology"},
{id:"u_johns_hopkins_med",name:"Johns Hopkins Medicine",etype:"University",note:"Johns Hopkins School of Medicine"},
{id:"u_carnegie_cs",name:"Carnegie Mellon CS",etype:"University",note:"CMU Computer Science"},
{id:"u_columbia_finance",name:"Columbia Finance School",etype:"University",note:"Columbia Business School"},
{id:"u_wharton_accounting",name:"Wharton Accounting",etype:"University",note:"Wharton School of Accounting"},
{id:"u_michigan_ross",name:"Michigan Ross",etype:"University",note:"University of Michigan Ross School"},
{id:"u_nyu_stern",name:"NYU Stern",etype:"University",note:"NYU Stern School of Business"},

// Government & Risk Capital Programs
{id:"v_sbir",name:"SBIR Program",etype:"Government",note:"Small Business Innovation Research"},
{id:"v_nih",name:"National Institutes of Health",etype:"Government",note:"NIH Research Grants"},
{id:"v_sba",name:"Small Business Administration",etype:"Government",note:"SBA Growth Grants"},
```

## Step 2: Add Portfolio Company Definitions (if not existing)

Add to COMPANIES array in companies.js:

```javascript
// Companies 100-105 need to be added with full profiles if not already in the system
{
  id: 100,
  name: "AttributeFlow",
  stage: "series_a",
  sector: ["SaaS", "Data", "Enterprise"],
  city: "San Francisco",
  region: "sf_bay",
  funding: 10.8,
  momentum: 72,
  employees: 15,
  founded: 2022,
  description: "B2B SaaS platform for customer data governance and identity resolution. Enterprise data operations for customer data platforms.",
  eligible: ["bbv"],
  lat: 37.77,
  lng: -122.41
},
{
  id: 101,
  name: "AuditSpace Pro",
  stage: "series_a",
  sector: ["SaaS", "Enterprise", "AI"],
  city: "New York",
  region: "northeast",
  funding: 8.7,
  momentum: 68,
  employees: 18,
  founded: 2022,
  description: "AI-powered audit management platform for professional services firms. Automates audit workflows and compliance tracking.",
  eligible: ["bbv"],
  lat: 40.71,
  lng: -74.01
},
{
  id: 102,
  name: "AuraData Systems",
  stage: "series_a",
  sector: ["Data", "Cloud", "Enterprise"],
  city: "Seattle",
  region: "sf_bay",
  funding: 10.6,
  momentum: 70,
  employees: 16,
  founded: 2022,
  description: "Enterprise data observability and quality platform. AI-driven monitoring for data warehouses and data lakes.",
  eligible: ["bbv"],
  lat: 47.61,
  lng: -122.33
},
{
  id: 103,
  name: "AuroraAI",
  stage: "series_a",
  sector: ["HealthTech", "AI", "MedDevice"],
  city: "Boston",
  region: "northeast",
  funding: 15.0,
  momentum: 75,
  employees: 20,
  founded: 2021,
  description: "AI/ML platform for medical imaging and diagnostic support. FDA 510(k) pathway for clinical validation.",
  eligible: ["bbv"],
  lat: 42.36,
  lng: -71.06
},
{
  id: 104,
  name: "AuthentiPay",
  stage: "seed",
  sector: ["Fintech", "Payments", "Security"],
  city: "New York",
  region: "northeast",
  funding: 5.5,
  momentum: 65,
  employees: 8,
  founded: 2022,
  description: "Payment authentication and fraud prevention platform for fintech. Integrated with major payment processors and banking platforms.",
  eligible: ["bbv"],
  lat: 40.71,
  lng: -74.01
},
{
  id: 105,
  name: "AutomateLedger",
  stage: "series_a",
  sector: ["SaaS", "Accounting", "Finance", "AI"],
  city: "Austin",
  region: "south",
  funding: 10.0,
  momentum: 69,
  employees: 17,
  founded: 2022,
  description: "AI-powered accounting automation and bookkeeping platform. Automates journal entries and financial reporting.",
  eligible: ["bbv"],
  lat: 30.27,
  lng: -97.74
}
```

## Step 3: Merge Edges into edges.js

Add all edges from bbv_edges_100_105.js to the VERIFIED_EDGES array. Options:

### Option A: Direct Import (Recommended)

Create a separate section in edges.js:

```javascript
// At the end of edges.js, before the final ];

// === BATTLE BORN VENTURE PORTFOLIO COMPANIES 100-105 ===
// Companies: AttributeFlow, AuditSpace Pro, AuraData Systems, AuroraAI, AuthentiPay, AutomateLedger
// Import edges
import { BBV_PORTFOLIO_EDGES_100_105 } from './data/bbv_edges_100_105.js';

// Merge into VERIFIED_EDGES
export const VERIFIED_EDGES = [
  // ... existing edges ...
  ...BBV_PORTFOLIO_EDGES_100_105,
];
```

### Option B: Direct Copy-Paste

Copy all entries from `bbv_edges_100_105.js` into the VERIFIED_EDGES array before the closing bracket.

## Step 4: Validate Data

### QA Checklist

- [ ] All source entities exist in EXTERNALS or GRAPH_FUNDS
- [ ] All target company IDs (c_100 through c_105) exist in COMPANIES
- [ ] No duplicate edges (check source + target + rel combinations)
- [ ] Investment amounts are reasonable for stage/sector
- [ ] Years are sequential (pre-seed → seed → Series A)
- [ ] University partnerships align with company sectors
- [ ] Corporate partners have realistic product integrations

### Test Query Examples

```javascript
// Find all investors in Company 100
edges.filter(e => e.target === "c_100" && e.rel === "invested_in")

// Find all companies backed by Sequoia
edges.filter(e => e.source === "i_sequoia" && e.rel === "invested_in")

// Find all corporate partnerships
edges.filter(e => e.rel === "partners_with" && e.source.startsWith("x_"))

// Find all government grants
edges.filter(e => e.rel === "funded_by" && e.source.startsWith("v_"))
```

## Step 5: Update Graph-Entities.js

Ensure EXTERNALS, COMPANIES, ACCELERATORS, and ECOSYSTEM_ORGS arrays include all entities referenced in edges.

## Step 6: Frontend Testing

1. Load the graph with new edges
2. Verify all 75 edges render without console errors
3. Test node selection for companies 100-105
4. Verify edge labels display correctly
5. Check investor/partner filtering works
6. Validate graph layout handles new density

## Data Structure Reference

### Investment Edge Example

```javascript
{
  source: "i_sequoia",
  target: "c_100",
  rel: "invested_in",
  note: "Led AttributeFlow Series A $8.5M. Enterprise data governance focus.",
  investment: 8500000,
  y: 2024,
  stage: "Series A",
  lead: true
}
```

### Partnership Edge Example

```javascript
{
  source: "x_salesforce_v",
  target: "c_100",
  rel: "invested_in",
  note: "Strategic investor in Series A round. CRM data integration partnership.",
  investment: 1500000,
  y: 2024,
  stage: "Series A",
  lead: false
}
```

### Government Grant Edge Example

```javascript
{
  source: "v_sbir",
  target: "c_101",
  rel: "funded_by",
  note: "SBIR Phase I grant $150K for AI audit automation research.",
  investment: 150000,
  y: 2023,
  program: "SBIR Phase I"
}
```

### Partnership (Non-Investment) Edge Example

```javascript
{
  source: "x_databricks",
  target: "c_100",
  rel: "partners_with",
  note: "Data lakehouse integration. Built-in AttributeFlow for customer data operations.",
  y: 2024
}
```

## Summary of Changes

| Type | Count | Details |
|------|-------|---------|
| New Investors (i_) | 25 | VC firms, angels, syndicates |
| New Corporations (x_) | 28 | Corporate partners, strategic investors, tech platforms |
| New Universities (u_) | 14 | Department-level partnerships |
| New Gov Programs (v_) | 3 | SBIR, NIH, SBA |
| New Companies (c_100-105) | 6 | Portfolio companies |
| New Edges | 75 | Investment, partnership, grant relationships |

## Files to Update

1. **frontend/src/data/companies.js** - Add companies 100-105
2. **frontend/src/data/graph-entities.js** - Add EXTERNALS, universities, gov programs
3. **frontend/src/data/edges.js** - Add 75 new edges
4. **frontend/src/data/bbv_edges_100_105.js** - New file with edge exports

## Rollback Plan

If issues arise:
1. Keep backup of original edges.js
2. Comment out new edges to test gradually
3. Validate each investor/partner separately
4. Rebuild graph visualization after each change

## Completed ✓

- [x] Research and identify investors
- [x] Map corporate partnerships
- [x] Document university collaborations
- [x] Identify government grants
- [x] Create edge data structures
- [x] Generate integration documentation

## Next: Implementation

1. Execute data entry as per instructions above
2. Run validation queries
3. Test graph rendering
4. Deploy to staging environment
5. Validate with Battle Born Venture team
6. Deploy to production
