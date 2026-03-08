# Data Quality System Implementation Guide

## Quick Start for Developers

### Understanding the System

The data quality system marks every KPI with one of three levels:
- **VERIFIED** (✓): From official sources (SEC, Treasury, fund docs)
- **INFERRED** (~): Estimated or derived from partial data
- **CALCULATED** (=): Derived from formulas combining other values

### Adding Quality Metadata to a New KPI

1. **Backend (api/src/db/queries/kpis.js)**
   ```javascript
   // In getKpis() return object:
   myNewKpi: {
     value: calculatedValue,
     label: 'My New KPI',
     secondary: 'supporting text',
     // Add these three lines:
     quality: DATA_QUALITY.INFERRED,
     dataQualityNote: 'This value is estimated from...',
     sources: ['Data source 1', 'Data source 2'],
   }
   ```

2. **Frontend (frontend/src/engine/kpi.js)**
   ```javascript
   // Same pattern in computeKPIs() return object
   myNewKpi: {
     value: computedValue,
     quality: DATA_QUALITY.INFERRED,
     dataQualityNote: 'Brief explanation of quality level',
   }
   ```

3. **Pass to Component (KpiStrip.jsx)**
   ```jsx
   <KpiCard
     label={kpis.myNewKpi?.label}
     value={kpis.myNewKpi?.value}
     // ... other props ...
     quality={kpis.myNewKpi?.quality}
     dataQualityNote={kpis.myNewKpi?.dataQualityNote}
   />
   ```

### KpiCard Component Props

| Prop | Type | Purpose |
|------|------|---------|
| `quality` | string | One of: 'verified', 'inferred', 'calculated' |
| `dataQualityNote` | string | Brief explanation (e.g., "Verified from SEC filings") |
| `label` | string | Display name |
| `value` | number | KPI numeric value |
| `tooltip` | string | Extended documentation |

### Styling Quality Levels

The component automatically applies opacity and styling based on quality:
- **Verified**: Full opacity (1.0)
- **Inferred**: Reduced opacity (0.85) with amber badge
- **Calculated**: Normal opacity (0.9) with blue badge

Custom CSS classes: `.quality-verified`, `.quality-inferred`, `.quality-calculated`

## Data Source Definitions

### VERIFIED Data Sources

**SEC SBIC Filings**
```javascript
sources: ['SEC SBIC Form 485', 'Annual audited statements']
quality: DATA_QUALITY.VERIFIED
confidence: 0.98
```

**SSBCI Program Records**
```javascript
sources: ['Treasury certification', 'Fund administrator reporting']
quality: DATA_QUALITY.VERIFIED
confidence: 0.98
```

**Fund Administrator Reports**
```javascript
sources: ['Capital call schedules', 'Deployment documentation', 'Investor reports']
quality: DATA_QUALITY.VERIFIED
confidence: 0.95
```

### INFERRED Data Sources

**Crunchbase Data**
```javascript
sources: ['Crunchbase company profiles', 'Community contributions']
quality: DATA_QUALITY.INFERRED
confidence: 0.75
usage: 'Employee counts, funding stages, sector information'
```

**LinkedIn Analysis**
```javascript
sources: ['LinkedIn company pages', 'Employee list scraping']
quality: DATA_QUALITY.INFERRED
confidence: 0.70
usage: 'Employee counts, team composition, hiring signals'
```

**Industry Benchmarks**
```javascript
sources: ['PitchBook', 'CB Insights', 'Industry reports']
quality: DATA_QUALITY.INFERRED
confidence: 0.65
usage: 'Valuation multiples, leverage ratios, growth rates'
```

### CALCULATED Data Examples

**Private Leverage**
```javascript
{
  formula: 'Σ(deployed × leverage) / Σ(deployed)',
  quality: DATA_QUALITY.CALCULATED,
  components: {
    deployed: DATA_QUALITY.VERIFIED,
    leverage: DATA_QUALITY.INFERRED
  },
  confidence: 0.80
}
```

**Innovation Index**
```javascript
{
  formula: '(momentum × 0.4) + (topPerformers × 0.3) + (hotSectors × 0.3)',
  quality: DATA_QUALITY.CALCULATED,
  components: {
    momentum: DATA_QUALITY.INFERRED,
    topPerformers: DATA_QUALITY.INFERRED,
    hotSectors: DATA_QUALITY.INFERRED
  },
  confidence: 0.65
}
```

## Database Integration

### Storing Quality Metadata

```sql
-- Query to log a KPI's quality level
SELECT log_kpi_quality(
  'capitalDeployed',
  'verified',
  ARRAY['SEC SBIC filings', 'Fund administrator reports'],
  jsonb_build_object(
    'sources', ARRAY['SEC', 'Fund docs'],
    'confidence', 0.98,
    'lastVerified', NOW()
  )
);

-- Query quality history
SELECT * FROM kpi_data_quality
WHERE kpi_name = 'capitalDeployed'
ORDER BY created_at DESC;
```

### Analysis Results Integration

```javascript
// When saving analysis results with quality metadata
const result = await pool.query(
  `INSERT INTO analysis_results
   (analysis_type, content, data_source, quality_metadata, data_sources_list, verification_percentage)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING *`,
  [
    'kpi_calculation',
    JSON.stringify(kpiData),
    'verified', // or 'inferred', 'calculated'
    JSON.stringify({
      sources: ['SEC filing', 'Fund report'],
      confidence: 0.98,
      methodology: 'Direct summation of verified deployment amounts'
    }),
    ['SEC SBIC Form 485', 'Fund 10-Q filing'],
    100 // percentage of data verified
  ]
);
```

## Quality Badge Display Logic

### When to Show Each Badge

```jsx
const BADGE_RULES = {
  // Show verified badge for all verified data
  verified: ['capitalDeployed', 'ssbciCapitalDeployed'],

  // Show inferred badge for estimated data
  inferred: ['ecosystemCapacity', 'privateLeverage (leverage component)'],

  // Show calculated badge for formulas
  calculated: ['innovationIndex', 'privateLeverage (overall)']
};
```

### Opacity and Visual Treatment

```css
/* Verified - trust this value */
.quality-verified { opacity: 1.0; }

/* Inferred - use with caution */
.quality-inferred { opacity: 0.85; }

/* Calculated - know the components */
.quality-calculated { opacity: 0.9; }
```

## Testing Quality Levels

### Unit Test Example

```javascript
describe('KPI Data Quality', () => {
  test('capitalDeployed should be marked VERIFIED', () => {
    const kpis = computeKPIs(companies, funds);
    expect(kpis.capitalDeployed.quality).toBe('verified');
    expect(kpis.capitalDeployed.dataQualityNote).toContain('SEC');
  });

  test('ecosystemCapacity should be marked INFERRED', () => {
    const kpis = computeKPIs(companies, funds);
    expect(kpis.ecosystemCapacity.quality).toBe('inferred');
    expect(kpis.ecosystemCapacity.verificationPercentage).toBeLessThan(100);
  });

  test('innovationIndex should be marked CALCULATED', () => {
    const kpis = computeKPIs(companies, funds);
    expect(kpis.innovationIndex.quality).toBe('calculated');
    expect(kpis.innovationIndex.components).toBeDefined();
  });
});
```

### Integration Test Example

```javascript
describe('Data Quality API Response', () => {
  test('GET /kpis should include quality metadata', async () => {
    const response = await request(app).get('/kpis');

    expect(response.body.data.capitalDeployed).toHaveProperty('quality');
    expect(response.body.data.capitalDeployed).toHaveProperty('dataQualityNote');
    expect(response.body.data.capitalDeployed).toHaveProperty('sources');
  });
});
```

## Updating Quality Levels

### Process for Re-verification

1. **Check Source Currency**
   ```javascript
   const daysSinceVerified = Math.floor(
     (Date.now() - lastVerified) / (1000 * 60 * 60 * 24)
   );

   if (daysSinceVerified > 90) {
     console.warn(`${kpiName} data quality may need re-verification`);
   }
   ```

2. **Update Quality Metadata**
   ```sql
   UPDATE kpi_data_quality
   SET
     last_verified = NOW(),
     metadata = metadata || jsonb_build_object(
       'lastReviewDate', NOW(),
       'reviewerNotes', 'Source verified current and accurate'
     )
   WHERE kpi_name = 'capitalDeployed';
   ```

3. **Document Changes**
   ```javascript
   // Log quality assessment changes
   const qualityChange = {
     kpiName: 'capitalDeployed',
     previousQuality: 'verified',
     newQuality: 'verified',
     reason: 'Quarterly re-verification complete',
     reviewer: 'portfolio-team',
     timestamp: new Date()
   };

   await logQualityChange(qualityChange);
   ```

## Common Patterns

### Pattern 1: Verified from Official Sources
```javascript
capitalDeployed: {
  quality: DATA_QUALITY.VERIFIED,
  dataQualityNote: 'Verified from fund deployment records and SEC filings',
  sources: ['Fund administrator reports', 'SEC SBIC filings'],
}
```

### Pattern 2: Inferred with Partial Coverage
```javascript
ecosystemCapacity: {
  quality: DATA_QUALITY.INFERRED,
  dataQualityNote: `${verified}/${total} companies have reported employee counts. Remaining estimates based on funding stage.`,
  verificationPercentage: Math.round((verified / total) * 100),
}
```

### Pattern 3: Calculated with Component Breakdown
```javascript
privateLeverage: {
  quality: DATA_QUALITY.CALCULATED,
  dataQualityNote: 'Calculated from verified deployments and inferred leverage ratios',
  formula: 'Σ(deployed × leverage) / Σ(deployed)',
  breakdown: {
    deployed: DATA_QUALITY.VERIFIED,
    leverage: DATA_QUALITY.INFERRED,
  },
}
```

### Pattern 4: Composite Index
```javascript
innovationIndex: {
  quality: DATA_QUALITY.CALCULATED,
  dataQualityNote: 'Composite: 40% momentum + 30% top performers + 30% hot sectors',
  formula: '(momentum × 0.4) + (topPerformers/n × 100 × 0.3) + (hotSectors/n × 100 × 0.3)',
  components: {
    momentum: { quality: DATA_QUALITY.INFERRED },
    topPerformers: { quality: DATA_QUALITY.INFERRED },
    hotSectors: { quality: DATA_QUALITY.INFERRED },
  },
}
```

## Troubleshooting

### Badge Not Showing

```javascript
// Make sure all three props are passed to KpiCard
<KpiCard
  label={kpis.myKpi?.label}
  value={kpis.myKpi?.value}
  quality={kpis.myKpi?.quality} // ← Required
  dataQualityNote={kpis.myKpi?.dataQualityNote} // ← Required
/>
```

### Wrong Quality Level

1. Check `api/src/db/queries/kpis.js` for correct DATA_QUALITY constant
2. Verify KpiStrip.jsx passes quality props
3. Check browser DevTools to see actual response

### Data Quality Note Not Showing

```javascript
// Ensure dataQualityNote is a string, not undefined
quality: DATA_QUALITY.VERIFIED,
dataQualityNote: 'Never leave this undefined or empty'
```

## Performance Considerations

- Quality badges add minimal overhead (CSS pseudo-elements)
- Metadata stored as JSONB in database (indexed)
- Quality levels computed once during KPI calculation
- Opacity changes use GPU-accelerated CSS transitions

## Accessibility

- Quality badges have title attributes for tooltips
- Color not sole indicator (uses badge text + icons)
- Sufficient contrast ratios for all badge colors
- Screen readers read badge text

## Migration Path

If updating existing KPIs:

1. **Phase 1:** Add quality metadata to API response
2. **Phase 2:** Update frontend components to receive and display quality
3. **Phase 3:** Run database migration to create quality tracking tables
4. **Phase 4:** Deploy legend component on dashboard
5. **Phase 5:** User education and training

## Support and Questions

For questions about data quality levels:
- Check DATA_QUALITY_SYSTEM.md for definitions
- Review specific KPI documentation in kpi_data_quality table
- Contact: Portfolio Analytics Team
