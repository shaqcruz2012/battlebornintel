// Data Quality Levels
export const DATA_QUALITY = {
  VERIFIED: 'verified',
  INFERRED: 'inferred',
  CALCULATED: 'calculated',
};

// Visual styling for each quality level
export const QUALITY_STYLES = {
  [DATA_QUALITY.VERIFIED]: {
    badge: '✓',
    className: 'quality-verified',
    tooltip: 'Verified from authoritative sources (SEC filings, official press releases, investor reports)',
    opacity: 1.0,
  },
  [DATA_QUALITY.INFERRED]: {
    badge: '~',
    className: 'quality-inferred',
    tooltip: 'Inferred or estimated from partial data, trending analysis, or industry benchmarks',
    opacity: 0.75,
  },
  [DATA_QUALITY.CALCULATED]: {
    badge: '=',
    className: 'quality-calculated',
    tooltip: 'Derived from formula, aggregation, or weighted calculation',
    opacity: 0.85,
  },
};

// KPI Data Sources Documentation
export const KPI_SOURCES = {
  capitalDeployed: {
    quality: DATA_QUALITY.VERIFIED,
    sources: [
      'Fund deployment data from official fund documents',
      'SEC SBIC filings for SBA-backed funds',
      'Fund manager certifications',
    ],
    nonVerifiedComponents: {
      regionalAllocations: DATA_QUALITY.INFERRED,
      reason: 'Regional fund allocations estimated from portfolio company locations',
    },
  },
  ssbciCapitalDeployed: {
    quality: DATA_QUALITY.VERIFIED,
    sources: [
      'SSBCI Program certification documents',
      'Treasury Department records',
      'Fund administrator confirmations',
    ],
    note: 'Only includes SSBCI-certified capital deployments',
  },
  privateLeverage: {
    quality: DATA_QUALITY.CALCULATED,
    formula: 'Sum(fund.deployed_m × fund.leverage) / Sum(fund.deployed_m)',
    qualityBreakdown: {
      deployed: DATA_QUALITY.VERIFIED,
      leverage: DATA_QUALITY.INFERRED,
    },
    leverageNote: 'Leverage ratios are estimated based on fund structure and historic performance',
  },
  ecosystemCapacity: {
    quality: DATA_QUALITY.INFERRED,
    sources: [
      'Company self-reported employee counts',
      'Crunchbase data',
      'LinkedIn profile analysis',
      'Press releases and announcements',
    ],
    note: 'Employee counts are point-in-time estimates and may lag actual headcount',
    nonVerifiedReasons: [
      'Partial employee data from earlier reporting periods',
      'Some companies do not publicly report headcount',
      'Estimated based on funding stage and industry benchmarks',
    ],
  },
  innovationIndex: {
    quality: DATA_QUALITY.CALCULATED,
    formula: 'avgMomentum × 0.4 + (topMomentum / n) × 100 × 0.3 + (hotSectors / n) × 100 × 0.3',
    components: {
      avgMomentum: {
        quality: DATA_QUALITY.INFERRED,
        source: 'Proprietary momentum scoring algorithm',
      },
      topMomentum: {
        quality: DATA_QUALITY.INFERRED,
        source: 'Companies with momentum score >= 75',
      },
      hotSectors: {
        quality: DATA_QUALITY.INFERRED,
        source: 'Sector heat scoring (market research, funding trends)',
      },
    },
  },
};

export const DATA_SOURCE_EXPLANATIONS = {
  VERIFIED: 'This value is verified from official sources (SEC filings, regulatory submissions, or certified fund documents).',
  INFERRED: 'This value is inferred or estimated. It may be based on partial data, industry benchmarks, or trending analysis. Treat as directional rather than exact.',
  CALCULATED: 'This is a calculated value derived from a formula or aggregation. Transparency note: individual component values may have different quality levels.',
};
