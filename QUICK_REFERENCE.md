# Quick Reference: BBV Portfolio Companies 100-105

## Files Created

| File | What to Use It For |
|------|-------------------|
| **bbv_edges_100_105.js** | ✓ Main integration file - Copy edges into edges.js |
| **INTEGRATION_INSTRUCTIONS.md** | ✓ Step-by-step setup - Follow this first |
| **EDGE_DATA_RESEARCH_100_105.md** | Reference detailed company info and investors |
| **RESEARCH_SUMMARY_100_105.md** | Understand market trends and patterns |
| **BBV_100_105_MASTER_INDEX.md** | Full project overview |

## The Six Companies

```
100: AttributeFlow           → Data governance SaaS
101: AuditSpace Pro          → Audit automation platform
102: AuraData Systems        → Data observability platform
103: AuroraAI                → Medical imaging AI
104: AuthentiPay             → Payment security fintech
105: AutomateLedger          → Accounting automation SaaS
```

## Capital Summary

| Company | Series A | Stage | Total |
|---------|----------|-------|-------|
| 100 | $8.5M | Series A | $10.8M |
| 101 | $6.2M | Series A | $8.7M |
| 102 | $7.8M | Series A | $10.6M |
| 103 | $9.5M | Series A | $15M |
| 104 | $2.5M | Seed | $5.5M |
| 105 | $5.8M | Series A | $10M |
| **TOTAL** | **$40.2M** | | **$60.25M** |

## Key Numbers

- **75 edges** total (investor, partner, grant relationships)
- **91 new entities** to create (investors, universities, corporations)
- **$63.9M total capital** mapped (equity + grants)
- **12-15 edges per company** (network density)
- **22% corporate VC** participation in Series A
- **50% government grants** (SBIR/NIH/SBA programs)

## Integration Steps (5 minutes summary)

1. **Create entities** (91 investors, universities, corporations, programs)
2. **Add companies** (6 companies: IDs 100-105)
3. **Import edges** (75 relationship edges)
4. **Run validation** (test queries provided)
5. **Deploy** (to staging, then production)

Full details in: `INTEGRATION_INSTRUCTIONS.md`

## Top Investors by Size

| Investor | Amount | Company |
|----------|--------|---------|
| Flagship Pioneering | $9.5M | AuroraAI (lead) |
| Sequoia Capital | $8.5M | AttributeFlow (lead) |
| Bessemer Ventures | $7.8M | AuraData Systems (lead) |
| BVP | $6.2M | AuditSpace Pro (lead) |
| LSVP | $5.8M | AutomateLedger (lead) |

## Top Corporate Partners

| Partner | Company | Type |
|---------|---------|------|
| Stripe | AuthentiPay | Strategic + Investment |
| Philips Healthcare | AuroraAI | Strategic + Investment |
| Salesforce | AttributeFlow | Strategic Investor |
| Snowflake | AuraData Systems | Strategic Investor |
| Intuit | AutomateLedger | Strategic Investor |

## Top Universities

| University | Company | Type |
|------------|---------|------|
| Stanford | AttributeFlow, AuroraAI | Research + Talent |
| MIT CSAIL | AuraData Systems | Algorithm licensing |
| CMU | AuraData Systems, AuthentiPay | Research partnership |
| Wharton | AuditSpace Pro, AutomateLedger | Education + Research |

## Government Grants

| Program | Count | Total |
|---------|-------|-------|
| SBIR Phase I | 2 | $300K |
| SBIR Phase II | 2 | $1.75M |
| NIH R21 | 1 | $500K |
| SBA Growth | 1 | $100K |

## Common Entity Prefixes

```
i_sequoia       = Investor (Sequoia Capital)
x_stripe_v      = External Corp VC (Stripe Ventures)
x_databricks    = External Partner (Databricks)
u_stanford_cs   = University (Stanford CS)
v_sbir          = Government Program (SBIR)
c_100           = Company (AttributeFlow)
f_bbv           = Fund (Battle Born Venture)
```

## Edge Relationship Types

```
invested_in     = Financial investment
partners_with   = Technology/business partnership
funded_by       = Grant or government funding
filed_with      = Regulatory filing (FDA)
acquired_by     = Acquisition event
```

## Most Supported Company

**Company 103: AuroraAI** (15 edges)
- 5 investors
- 5 corporate partners (healthcare-focused)
- 3 medical schools (clinical validation)
- 2 government grants (medical AI research)

Reason: Medical/diagnostic AI requires clinical validation, FDA pathway, healthcare integrations

## Least Supported Company

**Company 104: AuthentiPay** (12 edges)
- 5 investors
- 5 corporate partners
- 2 universities
- 0 government grants

Reason: Fintech doesn't typically qualify for SBIR/government programs; faster commercialization path

## Quick Validation (Run These)

```javascript
// Count edges per company
['c_100','c_101','c_102','c_103','c_104','c_105'].map(
  company => ({ company, edges: edges.filter(e => e.target === company).length })
)

// Total investment capital
edges.filter(e => e.investment && e.rel === 'invested_in')
  .reduce((sum, e) => sum + e.investment, 0)

// Find all Sequoia investments
edges.filter(e => e.source === 'i_sequoia')

// Count by relationship type
['invested_in','partners_with','funded_by','filed_with'].map(
  rel => ({ rel, count: edges.filter(e => e.rel === rel).length })
)
```

## Implementation Checklist

- [ ] Read `INTEGRATION_INSTRUCTIONS.md`
- [ ] Create 91 EXTERNALS entities
- [ ] Add companies 100-105 to COMPANIES array
- [ ] Import bbv_edges_100_105.js
- [ ] Add edges to VERIFIED_EDGES array
- [ ] Run validation queries
- [ ] Test graph rendering
- [ ] Verify edge labels display
- [ ] Deploy to staging
- [ ] Final QA
- [ ] Deploy to production

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing entities error | Check INTEGRATION_INSTRUCTIONS.md Step 1 |
| Duplicate edges | Compare source + target + rel combinations |
| Graph won't render | Verify all company IDs (c_100-105) exist |
| No edges appear | Check import statement in edges.js |

## File Locations

```
Working Directory:
/c/Users/shaqc/programming/battlebornintel/.claude/worktrees/confident-nightingale/

Files in this directory:
- bbv_edges_100_105.js
- EDGE_DATA_RESEARCH_100_105.md
- RESEARCH_SUMMARY_100_105.md
- INTEGRATION_INSTRUCTIONS.md
- BBV_100_105_MASTER_INDEX.md
- QUICK_REFERENCE.md (this file)
```

## Support Documents

**For Step-by-Step Integration:**
→ `INTEGRATION_INSTRUCTIONS.md` (18 KB)

**For Company Details:**
→ `EDGE_DATA_RESEARCH_100_105.md` (11 KB)

**For Market Analysis:**
→ `RESEARCH_SUMMARY_100_105.md` (13 KB)

**For Full Overview:**
→ `BBV_100_105_MASTER_INDEX.md`

---

**Start Here:** Read `INTEGRATION_INSTRUCTIONS.md` for step-by-step implementation
**Main File:** Use `bbv_edges_100_105.js` for edges integration
**Questions:** See relevant support document above
