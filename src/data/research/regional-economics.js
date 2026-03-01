/**
 * Regional Economic Data — RCG Economics & Applied Analysis
 * Sources:
 *   - RCG Economics: https://rcgeconomics.com/
 *   - Applied Analysis: https://appliedanalysis.com/
 *
 * RCG Economics provides Nevada-focused economic analysis, industry reports,
 * and fiscal impact studies. Applied Analysis specializes in Las Vegas metro
 * economic data, gaming industry analysis, and municipal fiscal impacts.
 *
 * NOTE: Data compiled from RCG Economics reports, Applied Analysis publications,
 * and supplementary BLS/BEA/Census data. Items marked [ESTIMATED] require
 * verification against latest publications.
 *
 * Last research update: 2026-02-28
 */

// ─── Las Vegas Metro Economic Forecast ───────────────────────────────────────
// Source: RCG Economics Las Vegas Economic Outlook; Applied Analysis
export const LAS_VEGAS_FORECAST = {
  metro: 'Las Vegas-Henderson-Paradise MSA',
  asOfDate: '2025',
  currentMetrics: {
    gdp: 145000, // $145B [ESTIMATED]
    gdpGrowth: 0.034, // 3.4%
    population: 2380000, // 2.38M MSA population
    populationGrowth: 0.018,
    totalEmployment: 1105000,
    employmentGrowth: 0.028,
    unemploymentRate: 0.055,
    medianHouseholdIncome: 65500,
    personalIncomeGrowth: 0.045,
  },
  forecast2026: {
    gdpGrowth: 0.031, // slightly moderating
    employmentGrowth: 0.025,
    populationGrowth: 0.017,
    unemploymentRate: 0.052,
    inflation: 0.030,
    keyDrivers: [
      'Sustained tourism recovery and new attractions',
      'Data center and tech sector expansion',
      'Residential construction to meet population growth',
      'Oakland Athletics relocation — stadium construction and jobs',
      'Continued California out-migration to Las Vegas',
    ],
  },
  forecast2027_2030: {
    avgAnnualGDPGrowth: 0.028,
    avgAnnualJobGrowth: 0.022,
    avgAnnualPopGrowth: 0.016,
    emergingSectors: [
      'Artificial Intelligence / Data Centers',
      'Battery / EV Manufacturing (Northern NV spill into Southern NV)',
      'Sports & Entertainment Technology',
      'Autonomous Vehicles',
      'Health Technology & Telehealth',
    ],
  },
  source: 'https://rcgeconomics.com/; https://appliedanalysis.com/',
  confidence: 'medium',
};

// ─── Reno-Sparks Metro Economic Forecast ─────────────────────────────────────
// Source: RCG Economics; EDAWN (Economic Development Authority of Western Nevada)
export const RENO_FORECAST = {
  metro: 'Reno-Sparks MSA (Washoe County)',
  asOfDate: '2025',
  currentMetrics: {
    gdp: 35000, // $35B [ESTIMATED]
    gdpGrowth: 0.042, // 4.2% — faster than Las Vegas
    population: 510000, // 510K MSA
    populationGrowth: 0.022,
    totalEmployment: 265000,
    employmentGrowth: 0.035,
    unemploymentRate: 0.038, // lower than Las Vegas
    medianHouseholdIncome: 72000,
    personalIncomeGrowth: 0.052,
  },
  forecast2026: {
    gdpGrowth: 0.038,
    employmentGrowth: 0.030,
    populationGrowth: 0.020,
    unemploymentRate: 0.036,
    keyDrivers: [
      'Tesla Gigafactory and battery/EV supply chain',
      'Redwood Materials expansion',
      'Panasonic Energy production ramp',
      'Tech company relocations from Bay Area',
      'UNR research commercialization',
      'Data center construction',
    ],
  },
  competitivePosition: {
    strengths: [
      'Proximity to California tech talent',
      'Lower cost of living vs Bay Area',
      'Growing advanced manufacturing base',
      'UNR R1 research university',
      'Outdoor lifestyle attracting young professionals',
      'Reno-Tahoe International Airport connectivity',
    ],
    challenges: [
      'Housing affordability declining rapidly',
      'Water scarcity concerns',
      'Smaller talent pool than Las Vegas',
      'Limited public transit',
      'Wildfire smoke air quality issues',
    ],
  },
  source: 'https://rcgeconomics.com/; EDAWN annual reports',
  confidence: 'medium',
};

// ─── Industry Sector Analysis ────────────────────────────────────────────────
// Source: RCG Economics; Applied Analysis; BLS QCEW
export const INDUSTRY_SECTOR_ANALYSIS = {
  asOfDate: '2025',
  sectors: [
    {
      name: 'Technology & Information Services',
      employment: 45000, // statewide [ESTIMATED]
      avgAnnualWage: 95000,
      growthRate: 0.065, // 6.5% annual growth
      gdpContribution: 8500, // $8.5B [ESTIMATED]
      keyPlayers: [
        'Switch/DigitalBridge (data centers)',
        'IGT (gaming technology)',
        'Aristocrat Technologies',
        'Scientific Games (now Light & Wonder)',
        'Amazon Web Services (data centers)',
        'Google (data centers)',
        'Microsoft (data centers)',
      ],
      subsectors: [
        { name: 'Data Centers', employment: 5000, growth: 0.12 },
        { name: 'Gaming Technology', employment: 12000, growth: 0.04 },
        { name: 'Software & SaaS', employment: 8000, growth: 0.08 },
        { name: 'IT Services & Consulting', employment: 15000, growth: 0.05 },
        { name: 'Cybersecurity', employment: 2500, growth: 0.10 },
        { name: 'AI/ML', employment: 2500, growth: 0.15 },
      ],
      outlook: 'Strong — data center boom and gaming tech innovation driving growth',
    },
    {
      name: 'Hospitality & Tourism',
      employment: 335000, // statewide [ESTIMATED]
      avgAnnualWage: 38000,
      growthRate: 0.018,
      gdpContribution: 72000, // $72B total economic impact
      keyPlayers: [
        'MGM Resorts International',
        'Caesars Entertainment',
        'Wynn Resorts',
        'Las Vegas Sands (now focused globally)',
        'Station Casinos (Red Rock Resorts)',
      ],
      techIntersection: [
        'Sports betting technology (DraftKings, FanDuel, BetMGM)',
        'Hotel management AI/automation',
        'Convention technology platforms',
        'Cashless gaming systems',
        'Customer analytics and personalization',
      ],
      outlook: 'Stable growth — F1, Sphere, and sports driving new investment',
    },
    {
      name: 'Construction',
      employment: 115000, // statewide [ESTIMATED]
      avgAnnualWage: 58000,
      growthRate: 0.032,
      gdpContribution: 12000,
      majorProjects: [
        'Oakland Athletics Stadium ($1.5B)',
        'Fontainebleau Las Vegas (opened 2023, expansions)',
        'Durango Station Casino (opened 2023)',
        'Residential subdivisions — Summerlin, Henderson, North Las Vegas',
        'Data center construction — multiple projects',
        'Las Vegas Convention Center expansion',
      ],
      outlook: 'Strong through 2028 — major projects pipeline robust',
    },
    {
      name: 'Mining & Natural Resources',
      employment: 18000, // statewide [ESTIMATED]
      avgAnnualWage: 82000,
      growthRate: 0.025,
      gdpContribution: 12500, // $12.5B
      keyResources: [
        { mineral: 'Gold', usRank: 1, productionValue: 8500 },
        { mineral: 'Lithium', usRank: 1, productionValue: 1200, notes: 'Thacker Pass mine development' },
        { mineral: 'Copper', usRank: 4, productionValue: 800 },
        { mineral: 'Diatomite', usRank: 1, productionValue: 150 },
        { mineral: 'Barite', usRank: 1, productionValue: 100 },
      ],
      techIntersection: [
        'Lithium extraction technology (Lithium Americas/Thacker Pass)',
        'Autonomous mining equipment',
        'IoT sensor networks for mine safety',
        'AI-driven mineral exploration',
        'Battery recycling (Redwood Materials)',
      ],
      outlook: 'Strong — lithium demand for EV batteries creating new gold rush',
    },
    {
      name: 'Advanced Manufacturing',
      employment: 32000, // statewide [ESTIMATED]
      avgAnnualWage: 62000,
      growthRate: 0.055,
      gdpContribution: 6500,
      keyPlayers: [
        'Tesla (Gigafactory)',
        'Panasonic Energy',
        'Redwood Materials',
        'Drinkpak (beverage manufacturing)',
        'Ainsworth Game Technology',
      ],
      subsectors: [
        { name: 'Battery/EV Manufacturing', employment: 12000, growth: 0.12 },
        { name: 'Gaming Equipment Manufacturing', employment: 6000, growth: 0.03 },
        { name: 'Food & Beverage Manufacturing', employment: 5000, growth: 0.04 },
        { name: 'Aerospace/Defense Components', employment: 3000, growth: 0.06 },
        { name: 'Other Manufacturing', employment: 6000, growth: 0.02 },
      ],
      outlook: 'Rapid growth — battery/EV cluster is transformative for Northern NV',
    },
    {
      name: 'Clean Energy & Sustainability',
      employment: 15000, // statewide [ESTIMATED]
      avgAnnualWage: 68000,
      growthRate: 0.08,
      gdpContribution: 3500,
      keyPlayers: [
        'NV Energy (renewables portfolio)',
        'First Solar (potential NV operations)',
        'Redwood Materials (battery recycling)',
        'Ormat Technologies (geothermal)',
        'Various solar installers',
      ],
      renewableCapacity: {
        solarGW: 5.8, // installed GW [ESTIMATED]
        geothermalGW: 0.7,
        windGW: 0.15,
        batteryStorageGW: 1.2, // [ESTIMATED]
        rps2030Target: 0.50, // 50% Renewable Portfolio Standard by 2030
      },
      outlook: 'Strong growth driven by RPS mandates and federal IRA incentives',
    },
  ],
  source: 'https://rcgeconomics.com/; https://appliedanalysis.com/; BLS QCEW',
  confidence: 'medium',
};

// ─── Commercial Real Estate Trends ───────────────────────────────────────────
// Source: Applied Analysis; CBRE; Colliers; Cushman & Wakefield
export const COMMERCIAL_REAL_ESTATE = {
  asOfDate: '2025-Q2',
  lasVegas: {
    office: {
      totalInventory: 52000000, // 52M sq ft [ESTIMATED]
      vacancyRate: 0.145, // 14.5% — elevated post-COVID
      avgAskingRent: 26.50, // $/sq ft/yr [ESTIMATED]
      netAbsorption2024: -200000, // slightly negative — WFH impact
      classA: {
        vacancy: 0.125,
        rent: 34.00,
        trend: 'Stable — flight to quality',
      },
      classB: {
        vacancy: 0.165,
        rent: 22.00,
        trend: 'Softening — some conversion to other uses',
      },
    },
    industrial: {
      totalInventory: 165000000, // 165M sq ft [ESTIMATED]
      vacancyRate: 0.065, // 6.5% — tight market
      avgAskingRent: 11.80, // $/sq ft/yr NNN
      netAbsorption2024: 5500000, // 5.5M sq ft positive absorption
      newConstruction2024: 8000000, // 8M sq ft delivered
      keyDrivers: [
        'E-commerce fulfillment (Amazon, Chewy, etc.)',
        'Data center campus development',
        'Third-party logistics growth',
        'Light manufacturing',
      ],
      trend: 'Strong demand — vacancy slowly rising from record lows',
    },
    dataCenter: {
      totalCapacityMW: 650, // [ESTIMATED] total data center capacity in MW
      pipelineMW: 400, // [ESTIMATED] under construction/planned
      majorOperators: ['Switch', 'Google', 'Microsoft', 'Amazon', 'QTS', 'Flexential'],
      avgPowerCostPerKWh: 0.065, // competitive power costs
      advantages: [
        'Low natural disaster risk (no hurricanes, minimal earthquake)',
        'Competitive power costs',
        'Available land for campus-scale development',
        'Dark fiber connectivity',
        'Tax abatements from GOED',
        'Low humidity / good for cooling',
      ],
      keyMarkets: ['Henderson', 'North Las Vegas', 'Reno/Sparks'],
      trend: 'Explosive growth — AI compute demand driving massive expansion',
    },
    retail: {
      totalInventory: 48000000, // 48M sq ft [ESTIMATED]
      vacancyRate: 0.072, // 7.2%
      avgAskingRent: 24.00,
      trend: 'Stable — population growth supporting new retail',
    },
    multifamily: {
      totalUnits: 185000, // [ESTIMATED] apartment units
      vacancyRate: 0.065,
      avgRent: 1450,
      unitsUnderConstruction: 8500,
      trend: 'Strong demand — in-migration driving occupancy',
    },
  },
  reno: {
    industrial: {
      totalInventory: 115000000, // 115M sq ft [ESTIMATED] — massive logistics hub
      vacancyRate: 0.085, // 8.5% — rising from record lows
      avgAskingRent: 9.50,
      keyDrivers: [
        'Tesla/Panasonic supply chain',
        'E-commerce distribution (western US hub)',
        'Redwood Materials campus',
        'Cold storage/food distribution',
      ],
      trend: 'Moderating from peak — but long-term fundamentals strong',
    },
    office: {
      vacancyRate: 0.12,
      avgAskingRent: 24.00,
      trend: 'Stable — tech companies taking small/medium spaces',
    },
    dataCenter: {
      totalCapacityMW: 180, // [ESTIMATED]
      pipelineMW: 120, // [ESTIMATED]
      majorOperators: ['Switch', 'Apple', 'Microsoft'],
      trend: 'Growing — Reno emerging as secondary data center market',
    },
  },
  source:
    'https://appliedanalysis.com/; CBRE Nevada Market Reports; Colliers Las Vegas',
  confidence: 'medium',
};

// ─── Southern NV vs Northern NV Economic Comparison ──────────────────────────
// Source: RCG Economics; DETR; BEA
export const NV_REGIONAL_COMPARISON = {
  asOfDate: '2025',
  metrics: [
    {
      metric: 'MSA Population',
      southernNV: 2380000,
      northernNV: 510000,
      stateTotal: 3250000,
    },
    {
      metric: 'MSA GDP ($M)',
      southernNV: 145000,
      northernNV: 35000,
      stateTotal: 205000,
    },
    {
      metric: 'Total Employment',
      southernNV: 1105000,
      northernNV: 265000,
      stateTotal: 1475000,
    },
    {
      metric: 'Unemployment Rate',
      southernNV: 0.055,
      northernNV: 0.038,
      stateTotal: 0.052,
    },
    {
      metric: 'Median Household Income',
      southernNV: 65500,
      northernNV: 72000,
      stateTotal: 67200,
    },
    {
      metric: 'Median Home Price',
      southernNV: 440000,
      northernNV: 520000,
      stateTotal: 460000,
    },
    {
      metric: 'Population Growth Rate',
      southernNV: 0.018,
      northernNV: 0.022,
      stateTotal: 0.019,
    },
    {
      metric: 'Job Growth Rate',
      southernNV: 0.028,
      northernNV: 0.035,
      stateTotal: 0.030,
    },
    {
      metric: 'Tech Jobs (est.)',
      southernNV: 30000,
      northernNV: 15000,
      stateTotal: 45000,
    },
    {
      metric: 'Manufacturing Jobs',
      southernNV: 12000,
      northernNV: 20000,
      stateTotal: 32000,
    },
  ],
  characterization: {
    southernNV: {
      primaryIndustries: ['Tourism/Hospitality', 'Entertainment', 'Data Centers', 'Construction'],
      econProfile: 'Services-dominated; tourism-dependent; diversifying into tech',
      strengths: 'Scale, airport connectivity, entertainment ecosystem, data centers',
      challenges: 'Tourism dependency, lower wages, education metrics, water scarcity',
    },
    northernNV: {
      primaryIndustries: ['Advanced Manufacturing', 'Mining', 'Logistics', 'Technology'],
      econProfile: 'Manufacturing/logistics hub; EV/battery cluster; tech satellite',
      strengths: 'Manufacturing cluster, Bay Area proximity, higher wages, UNR research',
      challenges: 'Smaller scale, housing costs rising fast, wildfire risk, water',
    },
  },
  source: 'https://rcgeconomics.com/; BEA; BLS; DETR',
  confidence: 'medium',
};

// ─── Gaming Industry Economic Indicators ─────────────────────────────────────
// Source: Applied Analysis; Nevada Gaming Control Board
export const GAMING_INDUSTRY = {
  asOfDate: '2024-12',
  statewide: {
    totalGamingRevenue: 15200, // $15.2B [ESTIMATED]
    growthYoY: 0.025,
    licensedLocations: 2100, // [ESTIMATED]
    gamingEmployees: 175000, // [ESTIMATED] direct gaming employment
    gamingTaxRevenue: 1250, // $1.25B [ESTIMATED] state gaming tax
    sportsBettingHandle: 9500, // $9.5B [ESTIMATED] annual handle
    sportsBettingRevenue: 850, // $850M [ESTIMATED]
    iGamingStatus: 'Not yet legalized for casino games — sports betting only',
  },
  gamingTech: {
    description: 'Nevada is the global epicenter for gaming technology companies',
    majorCompanies: [
      {
        name: 'IGT (International Game Technology)',
        hq: 'Las Vegas (US HQ)',
        employees: 3500, // NV employees [ESTIMATED]
        focus: 'Slot machines, lottery systems, gaming platforms',
      },
      {
        name: 'Light & Wonder (formerly Scientific Games)',
        hq: 'Las Vegas',
        employees: 2500, // NV employees [ESTIMATED]
        focus: 'Gaming content, platforms, iGaming',
      },
      {
        name: 'Aristocrat Technologies',
        hq: 'Las Vegas (US HQ)',
        employees: 2000, // NV employees [ESTIMATED]
        focus: 'Slot machines, gaming content, digital',
      },
      {
        name: 'Everi Holdings',
        hq: 'Las Vegas',
        employees: 1200, // NV employees [ESTIMATED]
        focus: 'Payments, gaming machines, fintech',
      },
      {
        name: 'AGS (PlayAGS)',
        hq: 'Las Vegas',
        employees: 600, // [ESTIMATED]
        focus: 'Electronic gaming machines, table products',
      },
      {
        name: 'Konami Gaming',
        hq: 'Las Vegas',
        employees: 800, // [ESTIMATED]
        focus: 'Slot machines, casino management systems',
      },
    ],
    emergingTrends: [
      'AI-powered responsible gaming tools',
      'Cashless and digital wallet gaming',
      'Skill-based gaming machines',
      'Augmented reality casino experiences',
      'Cloud-based gaming platforms',
      'Cryptocurrency integration (limited)',
      'Esports betting technology',
    ],
    techJobsInGaming: 8000, // [ESTIMATED] tech roles in gaming companies
    avgTechSalaryGaming: 105000, // $105K [ESTIMATED]
  },
  globalHubStatus: {
    globalGamingExposConferences: [
      'G2E (Global Gaming Expo) — Las Vegas, October',
      'CES Gaming Track — Las Vegas, January',
      'ICE London (Nevada companies attend)',
    ],
    regulatoryAdvantage:
      'Nevada Gaming Control Board — gold standard of gaming regulation worldwide',
    licensedJurisdiction: 'Most gaming companies HQ in Las Vegas for regulatory proximity',
  },
  source:
    'https://appliedanalysis.com/; Nevada Gaming Control Board; gaming company public filings',
  confidence: 'medium',
};

// ─── Fiscal Impact of Tech Company Relocations ──────────────────────────────
// Source: Applied Analysis; RCG Economics fiscal impact studies
export const TECH_RELOCATION_FISCAL_IMPACT = {
  description:
    'Estimated fiscal impact of tech company relocations and expansions in Nevada',
  model: {
    avgTechCompanyRelocation: {
      directJobsCreated: 150,
      avgSalary: 95000,
      capitalInvestment: 25, // $25M
      annualEconomicOutput: 45, // $45M
      directTaxImpact: 2.5, // $2.5M annual state/local tax
      indirectJobs: 220, // multiplier effect
      totalEconomicMultiplier: 2.8, // $2.80 total impact per $1 direct
    },
    majorTechHQ: {
      directJobsCreated: 500,
      avgSalary: 110000,
      capitalInvestment: 100, // $100M
      annualEconomicOutput: 180, // $180M
      directTaxImpact: 8.5, // $8.5M
      indirectJobs: 750,
      totalEconomicMultiplier: 3.0,
    },
    dataCenterCampus: {
      directJobsCreated: 80,
      avgSalary: 95000,
      capitalInvestment: 800, // $800M
      annualEconomicOutput: 35, // $35M operating (low jobs but high CapEx)
      directTaxImpact: 12.0, // $12M — property tax heavy
      indirectJobs: 120,
      constructionJobs: 2500, // temporary construction
    },
  },
  cumulativeImpactSince2020: {
    techCompaniesRelocatedOrExpanded: 85, // [ESTIMATED]
    directJobsCreated: 8500, // [ESTIMATED]
    capitalInvested: 4500, // $4.5B [ESTIMATED]
    annualTaxImpact: 180, // $180M [ESTIMATED]
  },
  source: 'https://rcgeconomics.com/; https://appliedanalysis.com/',
  confidence: 'medium',
};
