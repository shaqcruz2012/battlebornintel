# Data Quality System - Quick Start Guide

## What Changed?

Every KPI now displays a **data quality badge** showing whether the value is:
- **✓ Verified** (from official sources like SEC filings)
- **~ Inferred** (estimated from partial data or benchmarks)
- **= Calculated** (derived from formulas)

## For Dashboard Users

### Reading Quality Badges
```
┌──────────────────────────────────┐
│ Capital Deployed         [✓ VER]  │  ← Badge shows quality level
│ $250M                            │
│ 8 active funds                   │
└──────────────────────────────────┘
```

### Understanding the Symbols
| Symbol | Meaning | Use For |
|--------|---------|---------|
| ✓ | Verified from official sources | Critical decisions, regulatory reporting |
| ~ | Estimated/inferred values | Context, trends, directional insight |
| = | Calculated from formulas | Relative rankings, comparisons |

### Making Better Decisions
1. **Verified data (✓)** → Safe for precision decisions
2. **Inferred data (~)** → Good for context, may vary
3. **Calculated data (=)** → Use for comparisons, not absolutes

### Hovering for Details
Hover over the quality badge to see:
- Which sources the data comes from
- Confidence level (65-98%)
- Any special notes or caveats

## For Developers

### Adding Quality to a New KPI

**Backend** (api/src/db/queries/kpis.js):
```javascript
myKpi: {
  value: 42,
  label: 'My KPI',
  quality: DATA_QUALITY.VERIFIED,  // or INFERRED, CALCULATED
  dataQualityNote: 'Verified from fund reports',
  sources: ['Fund admin', 'SEC filing']
}
```

**Frontend** (frontend/src/components/dashboard/KpiStrip.jsx):
```jsx
<KpiCard
  label={kpis.myKpi?.label}
  value={kpis.myKpi?.value}
  quality={kpis.myKpi?.quality}
  dataQualityNote={kpis.myKpi?.dataQualityNote}
/>
```

### Quality Level Checklist

**Choose VERIFIED when:**
- [ ] Data comes from SEC filings, Treasury records, or regulatory documents
- [ ] Fund administrators or companies have officially certified the data
- [ ] You have independent verification from multiple sources

**Choose INFERRED when:**
- [ ] Data is estimated from samples (e.g., employee counts for 60% of companies)
- [ ] You're using industry benchmarks or comparable companies
- [ ] The data is derived from partial or indirect sources

**Choose CALCULATED when:**
- [ ] The value is the result of a formula or aggregation
- [ ] It combines values of different quality levels
- [ ] It requires transparency about methodology

## Database Changes

### New Table: kpi_data_quality
Tracks documentation for each KPI:
```sql
-- See current quality status
SELECT kpi_name, quality_level, data_sources, last_verified
FROM kpi_data_quality
WHERE kpi_name = 'capitalDeployed';
```

### Enhanced analysis_results Table
New columns:
- `data_source` - Quality level (verified/inferred/calculated)
- `quality_metadata` - JSONB with detailed notes
- `data_sources_list` - Array of source names
- `verification_percentage` - % of data that's verified

## KPI Quality Levels (Reference)

| KPI | Quality | Confidence | Key Sources |
|-----|---------|------------|------------|
| Capital Deployed | Verified | 95% | Fund reports, SEC filings |
| SSBCI Capital | Verified | 98% | Treasury, SSBCI cert |
| Private Leverage | Calculated | 80% | Deployments (verified) + leverage (inferred) |
| Ecosystem Capacity | Inferred | 70% | 60-75% reported, rest estimated |
| Innovation Index | Calculated | 65% | Composite of inferred metrics |

## Testing Quality Metadata

### Check API Response
```bash
curl http://localhost:3001/api/kpis
# Response includes:
# - quality: "verified"
# - dataQualityNote: "explanation"
# - sources: ["source1", "source2"]
```

### Test Component Display
```jsx
<KpiCard
  quality="verified"
  dataQualityNote="Test note"
/>
// Should show: [✓ VER] badge
// Opacity: 1.0 (fully opaque)
```

## Common Scenarios

### Scenario 1: You see ✓ VERIFIED
**What it means:** This number comes from official, authoritative sources
**What to do:** Safe to use for financial decisions, regulatory reporting
**Examples:** Capital deployed, SSBCI amounts

### Scenario 2: You see ~ INFERRED
**What it means:** This is an estimate based on partial or indirect data
**What to do:** Use for context and trends, acknowledge uncertainty
**Examples:** Employee counts, momentum scores

### Scenario 3: You see = CALCULATED
**What it means:** This number is computed from a formula
**What to do:** Know the formula, check components for quality levels
**Examples:** Innovation Index, Private Leverage

## Updating Your Dashboard Integration

### If you're displaying KPIs:
1. Update your fetch to receive quality metadata
2. Pass `quality` and `dataQualityNote` props to KpiCard
3. Import DataQualityLegend component for your dashboard
4. Test badge display and hover tooltips

### If you're creating new KPIs:
1. Determine quality level (verified/inferred/calculated)
2. Document data sources
3. Assign confidence level (65-98%)
4. Add to both frontend and backend
5. Create database entry in kpi_data_quality

## Documentation Links

- **User Guide:** docs/DATA_QUALITY_SYSTEM.md
- **Developer Guide:** docs/DATA_QUALITY_IMPLEMENTATION.md
- **Database Schema:** database/migrations/009_add_data_source_tracking.sql

## Support

### Questions About Data Quality?
- Check the Data Quality Legend on the dashboard
- Read docs/DATA_QUALITY_SYSTEM.md for detailed explanations
- Review specific KPI quality levels in kpi_data_quality table

### Questions About Implementation?
- See docs/DATA_QUALITY_IMPLEMENTATION.md
- Review code examples in KpiCard.jsx and kpi.js
- Check git history for implementation details

## Key Takeaway

**We mark all data with its quality level so you know:**
- ✓ What's true and verified
- ~ What's estimated or inferred
- = What's calculated from formulas

This transparency helps you make better decisions based on data you can trust.
