/**
 * UNLV CBER (Center for Business and Economic Research) Data
 * Source: https://cber.unlv.edu/
 *
 * CBER produces the most authoritative economic data for Southern Nevada,
 * including the Las Vegas Metropolitan Area Economic Indicators series,
 * housing reports, and economic outlook publications.
 *
 * NOTE: Data points sourced from CBER publications, BLS data, and
 * Nevada Department of Employment, Training & Rehabilitation (DETR).
 * Items marked [ESTIMATED] should be verified against latest CBER publications.
 *
 * Last research update: 2026-02-28
 */

// ─── Southern Nevada Economic Outlook ────────────────────────────────────────
// Source: https://cber.unlv.edu/publications/economic-outlook/
export const SOUTHERN_NV_OUTLOOK = {
  year: 2025,
  gdp: {
    lasVegasMSA: 145000, // $145B [ESTIMATED] — Las Vegas-Henderson-Paradise MSA GDP
    growthRate: 0.034, // 3.4% real GDP growth [ESTIMATED]
    nationalComparison: 'Above national average (2.5%)',
    source: 'BEA Regional GDP; CBER Economic Outlook 2025',
    confidence: 'medium',
  },
  employment: {
    totalNonfarmJobs: 1105000, // 1.105M nonfarm jobs in Las Vegas MSA [ESTIMATED]
    yearOverYearGrowth: 0.028, // 2.8% YoY growth
    unemploymentRate: 0.055, // 5.5% (typically above national avg)
    laborForceParticipation: 0.632, // 63.2%
    source: 'BLS CES/LAUS; CBER Monthly Economic Indicators',
    confidence: 'medium',
  },
  outlook: {
    gdpForecast2026: 0.031, // 3.1% projected GDP growth
    employmentForecast2026: 0.025, // 2.5% projected job growth
    keyDrivers: [
      'Tourism & hospitality recovery sustained',
      'Data center and logistics expansion',
      'Population in-migration from California',
      'Sports & entertainment investment (Raiders, F1, Athletics)',
      'Construction activity — residential and commercial',
    ],
    risks: [
      'Interest rate sensitivity in hospitality/construction',
      'Water supply constraints (Colorado River)',
      'Housing affordability squeeze limiting workforce',
      'Over-reliance on tourism/gaming sector',
    ],
    source: 'https://cber.unlv.edu/publications/economic-outlook/',
    confidence: 'medium',
  },
};

// ─── Las Vegas Employment by Industry ────────────────────────────────────────
// Source: BLS Current Employment Statistics (CES); CBER analysis
export const LV_EMPLOYMENT_BY_INDUSTRY = {
  asOfDate: '2025-06',
  totalNonfarm: 1105000,
  industries: [
    {
      sector: 'Leisure & Hospitality',
      jobs: 310000,
      shareOfTotal: 0.281,
      yoyChange: 0.018,
      avgWeeklyWage: 620,
      notes: 'Largest sector; includes hotels, casinos, restaurants, entertainment',
    },
    {
      sector: 'Trade, Transportation & Utilities',
      jobs: 185000,
      shareOfTotal: 0.167,
      yoyChange: 0.032,
      avgWeeklyWage: 880,
      notes: 'Driven by logistics/warehousing growth, Amazon fulfillment',
    },
    {
      sector: 'Professional & Business Services',
      jobs: 155000,
      shareOfTotal: 0.140,
      yoyChange: 0.035,
      avgWeeklyWage: 1250,
      notes: 'Fastest-growing white-collar sector; includes tech services',
    },
    {
      sector: 'Construction',
      jobs: 95000,
      shareOfTotal: 0.086,
      yoyChange: 0.028,
      avgWeeklyWage: 1100,
      notes: 'Stadium projects, residential, data centers driving demand',
    },
    {
      sector: 'Education & Health Services',
      jobs: 105000,
      shareOfTotal: 0.095,
      yoyChange: 0.042,
      avgWeeklyWage: 950,
      notes: 'Healthcare sector growth driven by population increases',
    },
    {
      sector: 'Government',
      jobs: 95000,
      shareOfTotal: 0.086,
      yoyChange: 0.015,
      avgWeeklyWage: 1050,
      notes: 'State/local government; Nellis AFB employment',
    },
    {
      sector: 'Financial Activities',
      jobs: 50000,
      shareOfTotal: 0.045,
      yoyChange: 0.022,
      avgWeeklyWage: 1350,
      notes: 'Banking, insurance, real estate services',
    },
    {
      sector: 'Information (includes Tech)',
      jobs: 15000,
      shareOfTotal: 0.014,
      yoyChange: 0.045,
      avgWeeklyWage: 1800,
      notes: 'Smallest but fastest-growing; data centers, tech companies',
    },
    {
      sector: 'Manufacturing',
      jobs: 32000,
      shareOfTotal: 0.029,
      yoyChange: 0.055,
      avgWeeklyWage: 1150,
      notes: 'Battery/EV manufacturing growth in Northern NV pulling up state totals',
    },
    {
      sector: 'Mining & Logging',
      jobs: 18000,
      shareOfTotal: 0.016,
      yoyChange: 0.012,
      avgWeeklyWage: 1500,
      notes: 'Primarily Northern NV gold/lithium mining; high wages',
    },
    {
      sector: 'Other Services',
      jobs: 45000,
      shareOfTotal: 0.041,
      yoyChange: 0.020,
      avgWeeklyWage: 720,
      notes: 'Personal services, repair, nonprofits',
    },
  ],
  source: 'BLS CES data; https://cber.unlv.edu/ — Monthly Economic Indicators',
  confidence: 'medium — individual sector numbers are estimates; verify with BLS',
};

// ─── Consumer Price Index / Inflation ────────────────────────────────────────
// Source: BLS CPI for Las Vegas-Henderson-Paradise MSA
export const LV_CPI_DATA = {
  area: 'Las Vegas-Henderson-Paradise, NV (BLS CPI Area)',
  asOfDate: '2025-06',
  currentCPI: 312.5, // [ESTIMATED] index value (1982-84=100)
  yearOverYearInflation: 0.033, // 3.3% YoY
  components: [
    { category: 'All Items', yoyChange: 0.033 },
    { category: 'Housing (Shelter)', yoyChange: 0.045, notes: 'Largest contributor to inflation' },
    { category: 'Food', yoyChange: 0.025 },
    { category: 'Energy', yoyChange: -0.02, notes: 'Deflation from lower fuel prices' },
    { category: 'Transportation', yoyChange: 0.018 },
    { category: 'Medical Care', yoyChange: 0.038 },
    { category: 'Education & Communication', yoyChange: 0.015 },
    { category: 'Apparel', yoyChange: 0.008 },
  ],
  historicalTrend: [
    { year: 2020, annualInflation: 0.009 },
    { year: 2021, annualInflation: 0.061 },
    { year: 2022, annualInflation: 0.085 },
    { year: 2023, annualInflation: 0.038 },
    { year: 2024, annualInflation: 0.032 },
    { year: 2025, annualInflation: 0.033, notes: 'annualized through Q2' },
  ],
  vsNational: 'Las Vegas CPI typically runs 0.2-0.5% above national average due to housing costs',
  source: 'BLS CPI data; https://cber.unlv.edu/',
  confidence: 'medium',
};

// ─── Housing Market Data ─────────────────────────────────────────────────────
// Source: CBER Housing Reports; Las Vegas REALTORS; S&P/Case-Shiller
export const LV_HOUSING_DATA = {
  asOfDate: '2025-06',
  medianHomePrice: 465000, // $465K [ESTIMATED]
  medianHomePriceYoY: 0.065, // 6.5% increase
  medianRent: 1650, // $1,650/month [ESTIMATED]
  medianRentYoY: 0.042, // 4.2% increase
  metrics: {
    daysOnMarket: 28, // [ESTIMATED]
    monthsOfSupply: 2.3, // [ESTIMATED] — still a seller's market
    homeownershipRate: 0.545, // 54.5% — below national average of ~66%
    housingAffordabilityIndex: 72, // [ESTIMATED] (100 = median family can afford median home)
    newBuildPermits2024: 14500, // [ESTIMATED] single-family + multi-family
    foreclosureRate: 0.003, // 0.3% — historically low
  },
  historicalPrices: [
    { year: 2019, medianPrice: 300000 },
    { year: 2020, medianPrice: 325000 },
    { year: 2021, medianPrice: 405000 },
    { year: 2022, medianPrice: 445000 },
    { year: 2023, medianPrice: 425000, notes: 'Brief correction' },
    { year: 2024, medianPrice: 440000 },
    { year: 2025, medianPrice: 465000, notes: 'through Q2' },
  ],
  rentalMarket: {
    avgApartmentRent: 1450, // average apartment rent
    vacancyRate: 0.065, // 6.5%
    unitsPipeline: 8500, // [ESTIMATED] units under construction
  },
  source: 'https://cber.unlv.edu/; Las Vegas REALTORS; ATTOM Data',
  confidence: 'medium',
};

// ─── Tourism & Convention Metrics ────────────────────────────────────────────
// Source: LVCVA Visitor Statistics; CBER analysis
export const LV_TOURISM_DATA = {
  asOfDate: '2024-12',
  annualVisitors2024: 42700000, // 42.7M visitors [ESTIMATED]
  visitorGrowthYoY: 0.015, // 1.5% growth
  avgDailyRoomRate: 195, // $195 ADR [ESTIMATED]
  occupancyRate: 0.835, // 83.5%
  conventionAttendance: 6800000, // 6.8M convention attendees [ESTIMATED]
  conventionSpaceTotal: 14000000, // 14M sq ft total convention/meeting space
  avgVisitorSpend: 950, // $950 per trip [ESTIMATED]
  totalEconomicImpact: 72000, // $72B [ESTIMATED] total economic impact of tourism
  revenueBreakdown: {
    gaming: 15200, // $15.2B gaming revenue
    hotelRoom: 8500, // $8.5B room revenue
    foodBeverage: 6200, // $6.2B
    entertainment: 4800, // $4.8B
    retail: 3500, // $3.5B
    convention: 2800, // $2.8B
  },
  trends: [
    'F1 Las Vegas Grand Prix driving November tourism surge',
    'MSG Sphere drawing new visitor demographic',
    'Sports tourism growing (Raiders, Golden Knights, Aces, Athletics relocation)',
    'Convention bookings strong through 2027',
    'International visitor recovery post-COVID at 85% of 2019 levels',
  ],
  source: 'LVCVA Monthly Visitor Statistics; https://cber.unlv.edu/',
  confidence: 'medium',
};

// ─── Tax Revenue Trends ──────────────────────────────────────────────────────
// Source: Nevada Controller; CBER analysis
export const NV_TAX_REVENUE = {
  fiscalYear: 'FY2024',
  generalFundRevenue: 6200, // $6.2B [ESTIMATED]
  revenueGrowthYoY: 0.045, // 4.5%
  majorSources: [
    {
      source: 'Sales & Use Tax',
      revenue: 1850,
      shareOfTotal: 0.298,
      yoyChange: 0.038,
    },
    {
      source: 'Gaming Taxes',
      revenue: 1250,
      shareOfTotal: 0.202,
      yoyChange: 0.025,
    },
    {
      source: 'Modified Business Tax (MBT)',
      revenue: 750,
      shareOfTotal: 0.121,
      yoyChange: 0.052,
    },
    {
      source: 'Commerce Tax',
      revenue: 420,
      shareOfTotal: 0.068,
      yoyChange: 0.035,
    },
    {
      source: 'Insurance Premium Tax',
      revenue: 450,
      shareOfTotal: 0.073,
      yoyChange: 0.028,
    },
    {
      source: 'Mining Tax (Net Proceeds of Minerals)',
      revenue: 280,
      shareOfTotal: 0.045,
      yoyChange: 0.12,
      notes: 'High gold & lithium prices boosting mining tax',
    },
    {
      source: 'Live Entertainment Tax',
      revenue: 220,
      shareOfTotal: 0.035,
      yoyChange: 0.085,
      notes: 'F1, Sphere, concerts driving growth',
    },
    {
      source: 'Other Revenue Sources',
      revenue: 980,
      shareOfTotal: 0.158,
      yoyChange: 0.032,
    },
  ],
  noStateIncomeTax: true,
  noCorporateIncomeTax: true,
  taxClimateRanking: 7, // Tax Foundation State Business Tax Climate Index ranking [ESTIMATED]
  source: 'Nevada Controller; https://cber.unlv.edu/; Tax Foundation',
  confidence: 'medium',
};

// ─── Business Formation Data ─────────────────────────────────────────────────
// Source: Nevada Secretary of State; CBER; Census Bureau Business Formation Statistics
export const NV_BUSINESS_FORMATION = {
  year: 2024,
  newBusinessFilings: 95000, // [ESTIMATED] — Nevada SOS filings
  newBusinessGrowthYoY: 0.035, // 3.5% growth
  llcFilings: 78000, // [ESTIMATED] — majority are LLCs
  corporationFilings: 12000, // [ESTIMATED]
  highPropensityBusinessApps: 32000, // Census Bureau EIN applications [ESTIMATED]
  topSectors: [
    { sector: 'Professional Services', share: 0.22 },
    { sector: 'Real Estate & Construction', share: 0.18 },
    { sector: 'Retail & E-Commerce', share: 0.15 },
    { sector: 'Technology & Information', share: 0.12 },
    { sector: 'Healthcare & Social Services', share: 0.10 },
    { sector: 'Accommodation & Food Services', share: 0.08 },
    { sector: 'Other', share: 0.15 },
  ],
  historicalTrend: [
    { year: 2019, filings: 75000 },
    { year: 2020, filings: 82000, notes: 'Pandemic-era LLC boom' },
    { year: 2021, filings: 98000, notes: 'Record year' },
    { year: 2022, filings: 92000 },
    { year: 2023, filings: 90000 },
    { year: 2024, filings: 95000 },
  ],
  nevadaAdvantages: [
    'No state income tax',
    'No corporate income tax',
    'Strong LLC/corporate privacy protections',
    'Low Commerce Tax threshold ($4M gross revenue)',
    'No franchise tax on S-corps',
    'Business-friendly regulatory environment',
  ],
  source: 'Nevada Secretary of State; Census Bureau BFS; https://cber.unlv.edu/',
  confidence: 'medium',
};
