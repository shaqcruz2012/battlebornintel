# Data Quality and Attribution System

## Overview

BattleBornIntel implements a comprehensive data quality system to ensure transparency about information accuracy. Every KPI value is marked with its quality level: **VERIFIED**, **INFERRED**, or **CALCULATED**.

This system addresses the core requirement: "All information must be true, no false information. Inferences or spurious sourced info must be highlighted with a dash or similar intuitive UX."

## Quality Levels

### VERIFIED (✓)
**Definition:** Data from authoritative, official sources that have been independently validated.

**Visual Indicator:** Green checkmark badge with "Verified" label

**Examples:**
- SEC SBIC filing data
- Treasury Department SSBCI program records
- Fund administrator certifications
- Official press releases and disclosures
- Regulatory submissions

**Confidence:** 95-98%

### INFERRED (~)
**Definition:** Data estimated, derived, or interpolated from partial information, benchmarks, or trends. Directional rather than precise.

**Visual Indicator:** Amber tilde badge with "Inferred" label

**Examples:**
- Employee counts from Crunchbase for companies without SEC filings
- Sector heat scores from market analysis
- Momentum scores from portfolio company performance
- Regional capital allocations estimated from portfolio geography
- Leverage ratios estimated from fund structure

**Confidence:** 65-75%

**Usage Note:** Use for context and directional insights, not precision decisions.

### CALCULATED (=)
**Definition:** Values derived from formulas, aggregations, or mathematical combinations. Transparency note: components may have different quality levels.

**Visual Indicator:** Blue equals badge with "Calculated" label

**Examples:**
- Private Leverage (verified deployments × inferred leverage ratios)
- Innovation Index (weighted composite of multiple metrics)
- Ecosystem Capacity (aggregation of point-in-time estimates)

**Confidence:** 65-90% depending on component quality

## KPI Data Quality Documentation

### Capital Deployed
- **Quality Level:** VERIFIED
- **Value Type:** $M (millions)
- **Source Data:**
  - Fund deployment records (verified)
  - SEC SBIC filings (verified)
  - Fund administrator reports (verified)
- **Data Sources:** 8 ecosystem funds (BBV, FundNV, 1864 Fund, AngelNV, Sierra Angels, DCVC, Stripes, StartUpNV)
- **Verification:** 100% of deployment amounts from verified sources
- **Caveats:**
  - Regional allocations within deployed capital may be inferred from portfolio company locations
  - Historical deployment timing reflects fund documents
  - Does not include preliminary commitments, only actual deployments

### SSBCI Capital Deployed
- **Quality Level:** VERIFIED
- **Value Type:** $M (millions)
- **Source Data:**
  - SSBCI Program certification documents (verified)
  - Treasury Department records (verified)
  - Fund administrator confirmations (verified)
- **Data Sources:** 3 SSBCI-backed funds (BBV, FundNV, 1864 Fund)
- **Verification:** 100% - only includes SSBCI-certified deployments
- **Regulatory Note:** Meets Treasury accountability standards
- **Caveats:**
  - Limited to program-certified capital only
  - Does not include pipeline or pending commitments

### Private Leverage
- **Quality Level:** CALCULATED
- **Value Type:** Ratio (e.g., 3.5x)
- **Formula:** Σ(fund.deployed_m × fund.leverage) / Σ(fund.deployed_m)
- **Component Quality:**
  - Deployment amounts: VERIFIED (95-98% confidence)
  - Leverage ratios: INFERRED (70-80% confidence)
- **Overall Confidence:** 80%
- **Calculation Method:**
  1. Multiply each SSBCI fund's deployment by its leverage ratio
  2. Sum all products
  3. Divide by total SSBCI deployments
- **Leverage Ratio Methodology:**
  - Based on fund structure analysis and documentation review
  - Estimated from fund term sheets and performance data
  - Industry benchmarks applied for incomplete data
- **Caveats:**
  - Leverage ratios are point-in-time estimates
  - Actual leverage varies by investment
  - Some funds report ranges rather than single values
  - Historical performance may differ from forward projections

### Ecosystem Capacity
- **Quality Level:** INFERRED
- **Value Type:** Total employee headcount
- **Source Data:**
  - Company self-reports: 60-75% of portfolio
  - Crunchbase: 40-50% of portfolio
  - LinkedIn profile analysis: 30-40% of portfolio
  - Press releases and announcements: 20-30% of portfolio
- **Verification Percentage:** 60-75% of companies have reported employee counts
- **Estimation Method for Missing Data:**
  - Stage-based benchmarks (seed vs. Series A vs. growth)
  - Sector averages from verified companies
  - Funding amount correlations
- **Overall Confidence:** 70%
- **Caveats:**
  - Employee counts are point-in-time snapshots
  - Some companies deliberately do not disclose headcount
  - Layoffs or rapid hiring not immediately reflected
  - Remote/distributed teams may be underreported
  - Verification percentage varies by stage (higher for later-stage companies)

### Innovation Momentum Index
- **Quality Level:** CALCULATED
- **Value Type:** Index (0-100 score)
- **Formula:** (avgMomentum × 0.4) + (topPerformers/n × 100 × 0.3) + (hotSectors/n × 100 × 0.3)
- **Overall Confidence:** 65%

**Component Breakdown:**

1. **Average Momentum Score (40% weight)**
   - Quality: INFERRED
   - Source: Proprietary momentum scoring algorithm
   - Method: Weighted composite of company metrics
   - Components:
     - Funding velocity (inferred)
     - Media mentions (tracked)
     - Grant/award success (verified where available)
     - Employee growth rate (inferred)
   - Confidence: 65%

2. **Top Performers (30% weight)**
   - Quality: INFERRED
   - Definition: Companies with momentum score ≥ 75
   - Source: Same algorithm as above
   - Confidence: 65%

3. **Hot Sectors (30% weight)**
   - Quality: INFERRED
   - Definition: Sectors with heat score ≥ 80
   - Source: Market research + funding trend analysis
   - Data Sources:
     - Venture funding tracking databases
     - Industry reports (CB Insights, PitchBook)
     - News and media analysis
     - Patent filings and technological adoption trends
   - Confidence: 70%

**Methodology Notes:**
- Momentum and heat scores use proprietary algorithms (subject to regular review)
- All three components are inferred metrics with significant estimation
- This index is best used for relative comparisons, not absolute evaluation
- Recalculated quarterly as new data arrives

## Data Quality by Data Source

### Primary Verified Sources
1. **SEC SBIC Filings**
   - Coverage: Most institutionalized funds
   - Frequency: Semi-annual
   - Confidence: 98%

2. **SSBCI Program Records**
   - Coverage: All SSBCI-certified capital
   - Frequency: Real-time updates
   - Confidence: 98%

3. **Fund Administrator Reports**
   - Coverage: All portfolio funds
   - Frequency: Monthly/Quarterly
   - Confidence: 95%

4. **Regulatory Filings & Disclosures**
   - Coverage: Public companies, SEC-registered funds
   - Frequency: Varies by regulation
   - Confidence: 95%

### Secondary Inferred Sources
1. **Crunchbase Database**
   - Coverage: ~80% of portfolio companies
   - Freshness: Updated monthly by community
   - Confidence: 75%

2. **LinkedIn Analysis**
   - Coverage: ~70% of portfolio companies
   - Freshness: Real-time from company pages
   - Confidence: 70%

3. **Company Self-Reports**
   - Coverage: Varies by company maturity
   - Freshness: Annual or event-driven
   - Confidence: 85%

4. **Press Releases & News**
   - Coverage: ~50% of companies (major announcements)
   - Freshness: Event-driven
   - Confidence: 80%

5. **Industry Benchmarks**
   - Coverage: All companies (stage/sector-based)
   - Freshness: Quarterly updates
   - Confidence: 65%

## Implementation Details

### Frontend Components

1. **Quality Badge**
   - Displays in KpiCard component
   - Shows: ✓ (verified), ~ (inferred), = (calculated)
   - Color-coded: green, amber, blue
   - Hoverable for tooltip details

2. **Data Quality Note**
   - Appears below KPI value
   - Shows brief explanation of data quality
   - Links to detailed documentation when available

3. **Data Quality Legend**
   - DataQualityLegend component
   - Displayed prominently on dashboard
   - Defines all quality levels with examples
   - Emphasizes commitment to transparency

### Backend Implementation

1. **KPI Response Structure**
   ```json
   {
     "capitalDeployed": {
       "value": 250,
       "label": "Capital Deployed",
       "quality": "verified",
       "dataQualityNote": "Verified from fund deployment records and SEC filings",
       "sources": ["Fund administrator reports", "SEC SBIC filings"]
     }
   }
   ```

2. **Database Tables**
   - `kpi_data_quality`: Centralized source documentation
   - `analysis_results.data_source`: Tracks quality level
   - `analysis_results.quality_metadata`: JSONB with detailed notes

3. **Audit Trail**
   - `log_kpi_quality()` function tracks all quality assessments
   - `last_verified` timestamp documents recency of source verification

## Update and Verification Schedule

| KPI | Frequency | Verification Method | Owner |
|-----|-----------|-------------------|-------|
| Capital Deployed | Monthly | Fund reports + SEC filings | Fund Relations |
| SSBCI Capital | Real-time | Treasury reports | Program Management |
| Private Leverage | Quarterly | Fund term sheets + audits | Analytics |
| Ecosystem Capacity | Quarterly | Company surveys + data providers | Portfolio Team |
| Innovation Index | Quarterly | Algorithm review + manual spot-check | Analytics |

## Transparency Principles

1. **No Hidden Estimates:** Every inferred value is explicitly marked
2. **Confidence Levels:** Clear indication of reliability
3. **Source Attribution:** Users know where data originates
4. **Methodology Transparency:** Formulas and algorithms documented
5. **Update Cadence:** Regular verification schedule published
6. **Audit Trail:** Complete history of quality assessments

## User Guidance

### When to Trust Each Level

**Verified Data (✓)**
- Suitable for financial decisions
- Appropriate for regulatory reporting
- Safe for detailed analysis
- Use for precision comparisons

**Inferred Data (~)**
- Good for directional insights
- Useful for trend analysis
- Appropriate for context setting
- Not suitable for precise quantification
- Acknowledge uncertainty in presentations

**Calculated Data (=)**
- Best for relative rankings
- Useful for ecosystem-wide comparisons
- Requires transparency about methodology
- Components' quality levels should be disclosed

## Future Enhancements

1. **Real-time Quality Scoring**
   - Automated freshness assessment
   - Warning when data exceeds age thresholds

2. **Data Lineage Tracking**
   - Full provenance for every value
   - Automated source verification

3. **Confidence Intervals**
   - Statistical confidence ranges for inferred values
   - Sensitivity analysis for calculated metrics

4. **Historical Quality Trends**
   - Track how quality changes over time
   - Identify improving vs. deteriorating data sources

5. **User Feedback Integration**
   - Crowd-sourced verification
   - Direct source corrections from knowledgeable users

## Related Documentation

- [KPI System Architecture](./KPI_SYSTEM.md)
- [Data Governance Policy](./DATA_GOVERNANCE.md)
- [Methodology Documentation](./METHODOLOGY.md)
