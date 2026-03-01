// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — ECONOMIC CONTEXT LAYER
// Nevada Economic Indicators, VC Investment, Cost Comparisons
// Sources: BLS, BEA, US Census, GOED, DETR, LVRJ, Nevada Treasurer,
//          PitchBook, NVSOS, Tax Foundation, CBRE, Zillow, NSHE
// Last updated: 2026-02-28
// NOTE: Data represents best available from public sources. Some figures
//       are estimates based on trailing data and trend projections.
// ============================================================

// ── NEVADA GDP & ECONOMIC OUTPUT ──
export const GDP_DATA = {
  // Source: BEA GDP by State (current dollars, billions)
  stateGDP: [
    { year: 2018, gdpBillions: 164.9, growthRate: 3.4 },
    { year: 2019, gdpBillions: 172.0, growthRate: 4.3 },
    { year: 2020, gdpBillions: 155.6, growthRate: -9.5 }, // COVID impact
    { year: 2021, gdpBillions: 181.5, growthRate: 16.6 },  // Recovery
    { year: 2022, gdpBillions: 202.2, growthRate: 11.4 },
    { year: 2023, gdpBillions: 211.8, growthRate: 4.8 },
    { year: 2024, gdpBillions: 221.5, growthRate: 4.6 },   // Estimate
    { year: 2025, gdpBillions: 231.0, growthRate: 4.3 },   // Estimate
  ],
  gdpPerCapita2024: 67500, // Estimate
  gdpRankAmongStates: 32,
  keyIndustries: [
    { sector: "Tourism & Hospitality", shareOfGDP: 25.0, description: "Casinos, hotels, conventions, entertainment" },
    { sector: "Mining", shareOfGDP: 5.2, description: "Gold, silver, lithium, copper, diatomite" },
    { sector: "Construction", shareOfGDP: 7.8, description: "Residential and commercial development boom" },
    { sector: "Technology", shareOfGDP: 6.5, description: "Growing rapidly — data centers, AI, cleantech, gaming tech" },
    { sector: "Logistics & Distribution", shareOfGDP: 5.8, description: "I-80 and I-15 corridor warehousing and transport" },
    { sector: "Advanced Manufacturing", shareOfGDP: 4.2, description: "Batteries, aerospace, defense, specialty materials" },
    { sector: "Healthcare", shareOfGDP: 8.5, description: "Growing sector with hospital systems and biotech" }
  ]
};

// ── UNEMPLOYMENT DATA ──
export const UNEMPLOYMENT_DATA = {
  // Source: BLS LAUS (Local Area Unemployment Statistics)
  statewide: [
    { year: 2019, rate: 3.9 },
    { year: 2020, rate: 13.5 }, // COVID - highest in US
    { year: 2021, rate: 6.8 },
    { year: 2022, rate: 5.2 },
    { year: 2023, rate: 5.3 },
    { year: 2024, rate: 5.0 },
    { year: 2025, rate: 4.8 },  // Estimate
  ],
  byRegion2025: {
    clarkCounty: { rate: 5.1, laborForce: 1120000, description: "Las Vegas metro area" },
    washoeCounty: { rate: 3.8, laborForce: 260000, description: "Reno-Sparks metro area" },
    carsonCity: { rate: 4.2, laborForce: 28000, description: "State capital region" },
    rural: { rate: 3.5, laborForce: 85000, description: "Balance of state — mining and agriculture dominant" }
  },
  techUnemployment2025: 2.8, // Tech sector unemployment significantly lower
  nationalComparison2025: {
    nevada: 4.8,
    national: 4.1,
    california: 5.3,
    texas: 4.0,
    florida: 3.4
  }
};

// ── TECH EMPLOYMENT ──
export const TECH_EMPLOYMENT = {
  // Source: CompTIA Cyberstates, BLS QCEW, DETR Nevada
  totalTechEmployment: [
    { year: 2019, jobs: 38000, growth: 4.2 },
    { year: 2020, jobs: 36500, growth: -3.9 },
    { year: 2021, jobs: 41000, growth: 12.3 },
    { year: 2022, jobs: 45500, growth: 11.0 },
    { year: 2023, jobs: 48200, growth: 5.9 },
    { year: 2024, jobs: 51000, growth: 5.8 },
    { year: 2025, jobs: 54000, growth: 5.9 },  // Estimate
  ],
  bySector2025: [
    { sector: "Data Centers & Cloud", jobs: 8500, medianSalary: 95000 },
    { sector: "Gaming Technology", jobs: 7200, medianSalary: 88000 },
    { sector: "Cybersecurity", jobs: 4800, medianSalary: 105000 },
    { sector: "AI / Machine Learning", jobs: 3200, medianSalary: 125000 },
    { sector: "Software Development", jobs: 9500, medianSalary: 98000 },
    { sector: "IT Services & Support", jobs: 11000, medianSalary: 72000 },
    { sector: "Advanced Manufacturing (tech)", jobs: 5500, medianSalary: 68000 },
    { sector: "Fintech", jobs: 2800, medianSalary: 92000 },
    { sector: "Cleantech / Energy Tech", jobs: 1500, medianSalary: 85000 }
  ],
  majorTechEmployers: [
    { name: "Tesla / Panasonic (Giga Nevada)", employees: 11000, sector: "Advanced Manufacturing" },
    { name: "Sierra Nevada Corporation", employees: 4500, sector: "Defense / Aerospace" },
    { name: "Amazon (multiple NV facilities)", employees: 8000, sector: "Cloud / Logistics / Tech" },
    { name: "Switch (DigitalBridge)", employees: 1000, sector: "Data Centers" },
    { name: "IGT (International Game Technology)", employees: 1200, sector: "Gaming Technology" },
    { name: "Redwood Materials", employees: 1200, sector: "Cleantech / Manufacturing" },
    { name: "Abnormal AI", employees: 1200, sector: "AI / Cybersecurity" },
    { name: "Ormat Technologies", employees: 1400, sector: "Geothermal Energy" },
    { name: "NV5 Global", employees: 4000, sector: "Infrastructure / Engineering" }
  ]
};

// ── VENTURE CAPITAL INVESTMENT ──
export const VC_INVESTMENT = {
  // Source: PitchBook, Crunchbase, public filings, press releases
  // Includes all VC/PE investments in NV-headquartered companies
  annualTotals: [
    { year: 2018, totalMillions: 320,  deals: 42,  medianDealMillions: 3.2,  notableDeals: ["Socure Series B", "MNTN seed"] },
    { year: 2019, totalMillions: 480,  deals: 55,  medianDealMillions: 4.1,  notableDeals: ["Socure Series C", "Vibrant Planet seed"] },
    { year: 2020, totalMillions: 620,  deals: 48,  medianDealMillions: 5.5,  notableDeals: ["Redwood Materials Series B", "Socure Series C ext"] },
    { year: 2021, totalMillions: 2100, deals: 78,  medianDealMillions: 8.2,  notableDeals: ["Redwood Materials $700M Series C", "Socure $100M Series D", "Socure $100M Series E"] },
    { year: 2022, totalMillions: 1800, deals: 65,  medianDealMillions: 7.5,  notableDeals: ["Redwood Materials $775M Series D", "Ioneer DOE loan", "Tesla $3.6B expansion"] },
    { year: 2023, totalMillions: 1400, deals: 72,  medianDealMillions: 6.8,  notableDeals: ["Abnormal AI $250M Series D", "Lyten $200M Series B", "Redwood DOE $2B loan"] },
    { year: 2024, totalMillions: 1200, deals: 80,  medianDealMillions: 5.5,  notableDeals: ["Lyten $225M raise", "TensorWave $43M seed", "Nudge Security $22.5M Series A"] },
    { year: 2025, totalMillions: 1600, deals: 85,  medianDealMillions: 6.2,  notableDeals: ["TensorWave $100M Series A", "Redwood $425M Series E", "Hubble Network $70M Series B"] },
  ],
  ssbciImpact: {
    totalAllocated: 91, // $M
    deployedToDate: 18.4, // $M (BBV + FundNV + 1864)
    privateCapitalLeveraged: 58.5, // $M
    leverageRatio: 3.18,
    companiesSupported: 35,
    programs: [
      { name: "Battle Born Venture", allocated: 36, deployed: 14.8, companies: 12, leverage: 3.2 },
      { name: "FundNV", allocated: 3, deployed: 2.4, companies: 18, leverage: 2.8 },
      { name: "1864 Fund", allocated: 10, deployed: 1.2, companies: 5, leverage: 4.1 }
    ]
  },
  byStage2025: {
    preSeed: { deals: 22, totalMillions: 8, avgMillions: 0.36 },
    seed: { deals: 28, totalMillions: 65, avgMillions: 2.32 },
    seriesA: { deals: 18, totalMillions: 280, avgMillions: 15.6 },
    seriesB: { deals: 8, totalMillions: 320, avgMillions: 40.0 },
    seriesCPlus: { deals: 5, totalMillions: 650, avgMillions: 130.0 },
    growth: { deals: 4, totalMillions: 277, avgMillions: 69.3 }
  }
};

// ── COST OF LIVING COMPARISON ──
export const COST_COMPARISON = {
  // Source: C2ER Cost of Living Index, Zillow, CBRE, BLS CPI
  // Index: 100 = national average
  costOfLivingIndex: [
    { metro: "San Francisco, CA", overall: 179.8, housing: 289.5, groceries: 113.2, transportation: 121.4 },
    { metro: "San Jose, CA", overall: 170.2, housing: 267.3, groceries: 112.8, transportation: 119.8 },
    { metro: "Austin, TX", overall: 111.5, housing: 127.8, groceries: 97.4, transportation: 103.2 },
    { metro: "Miami, FL", overall: 123.4, housing: 162.3, groceries: 106.5, transportation: 109.8 },
    { metro: "Denver, CO", overall: 118.6, housing: 143.5, groceries: 104.2, transportation: 107.5 },
    { metro: "Las Vegas, NV", overall: 103.2, housing: 107.5, groceries: 102.8, transportation: 105.1 },
    { metro: "Reno, NV", overall: 108.5, housing: 126.4, groceries: 103.5, transportation: 104.8 },
    { metro: "National Average", overall: 100.0, housing: 100.0, groceries: 100.0, transportation: 100.0 }
  ],
  medianHomePrice2025: {
    lasVegas: 420000,
    reno: 510000,
    henderson: 465000,
    carsonCity: 425000,
    sanFrancisco: 1350000,
    austin: 520000,
    miami: 580000,
    denver: 575000,
    national: 410000
  },
  medianRent1BR2025: {
    lasVegas: 1350,
    reno: 1480,
    sanFrancisco: 3200,
    austin: 1550,
    miami: 2100,
    denver: 1650,
    national: 1450
  },
  savingsVsSF: {
    description: "An engineer making $180K in SF could accept $135K in Las Vegas and maintain the same purchasing power due to no state income tax and lower cost of living.",
    effectiveSalaryBoost: "15-25% more purchasing power vs. Bay Area",
    noStateIncomeTaxSavings: "~$12,000-18,000/year for typical tech worker"
  }
};

// ── TAX ENVIRONMENT ──
export const TAX_ENVIRONMENT = {
  // Source: Tax Foundation, Nevada Department of Taxation, NVSOS
  headline: "Nevada has no personal or corporate income tax, making it one of the most business-friendly tax environments in the US.",
  taxes: {
    personalIncomeTax: {
      rate: 0,
      description: "No personal income tax. One of 9 states with no income tax. Major draw for high-earning tech workers and entrepreneurs."
    },
    corporateIncomeTax: {
      rate: 0,
      description: "No corporate income tax. Nevada does not tax corporate profits at the state level."
    },
    commerceTax: {
      rate: "0.051% to 0.331%",
      threshold: 4000000,
      description: "Commerce Tax applies to businesses with $4M+ in Nevada gross revenue. Rate varies by industry category (0.051% for mining to 0.331% for rail transportation). Most startups are below the threshold.",
      industryRates: [
        { industry: "Mining", rate: 0.051 },
        { industry: "Manufacturing", rate: 0.091 },
        { industry: "Information / Technology", rate: 0.253 },
        { industry: "Professional Services", rate: 0.181 },
        { industry: "Retail Trade", rate: 0.111 },
        { industry: "Finance / Insurance", rate: 0.171 },
        { industry: "Accommodation / Food Services", rate: 0.200 }
      ]
    },
    modifiedBusinessTax: {
      rate: 1.378,
      description: "Modified Business Tax (payroll tax) of 1.378% on wages exceeding $50,000 per quarter. Applies to most employers.",
      threshold: 50000, // quarterly wages threshold
      unit: "percent of taxable wages"
    },
    salesTax: {
      stateRate: 6.85,
      clarkCountyRate: 8.375,
      washoeCountyRate: 8.265,
      description: "Combined state and local sales tax. Manufacturing equipment may be exempt."
    },
    propertyTax: {
      effectiveRate: 0.53,
      description: "Property tax rate is capped at 3% annual increase (AB 489). Effective rate approximately 0.53%, well below national average of 1.1%.",
      abatement: "3% annual cap on property tax increases"
    },
    franchiseTax: {
      rate: 0,
      description: "No franchise tax. Business license fees are minimal."
    }
  },
  taxFoundationRanking: {
    overallBusinessTaxClimate: 7,  // Rank among 50 states (1 = best)
    corporateTax: 1,               // Tied for best — no corporate income tax
    individualIncomeTax: 1,        // Tied for best — no personal income tax
    salesTax: 42,                  // Relatively high sales tax
    propertyTax: 10,               // Low property tax
    unemploymentInsurance: 39      // Higher UI taxes
  },
  incentivePrograms: [
    {
      name: "Sales & Use Tax Abatement",
      description: "Up to 50% abatement for qualifying businesses. Reduced rate of 2% for data centers and manufacturing.",
      eligibility: "Capital investment and job creation thresholds",
      administeredBy: "GOED"
    },
    {
      name: "Modified Business Tax Abatement",
      description: "Reduction in payroll tax for qualifying businesses committing to capital investment and job creation.",
      eligibility: "New or expanding businesses with minimum capital investment",
      administeredBy: "GOED"
    },
    {
      name: "Personal Property Tax Abatement",
      description: "Partial abatement on new personal property (equipment, machinery) for qualifying businesses.",
      eligibility: "Manufacturing, data centers, and technology companies",
      administeredBy: "GOED"
    },
    {
      name: "Opportunity Zone Benefits",
      description: "Federal capital gains tax deferral and reduction for investments in designated Opportunity Zones. Nevada has 61 qualified Opportunity Zones.",
      eligibility: "Investment in designated census tracts",
      administeredBy: "Federal (IRS) with state coordination"
    },
    {
      name: "SSBCI — State Small Business Credit Initiative",
      description: "Federal program providing Nevada $91M for startup and small business investment through venture capital, loan participation, and collateral support programs.",
      eligibility: "Nevada-based startups and small businesses",
      administeredBy: "GOED / BBV / FundNV / 1864 Fund"
    }
  ]
};

// ── POPULATION & MIGRATION ──
export const POPULATION_DATA = {
  // Source: US Census Bureau, ACS, UNLV Lied Center
  statePopulation: [
    { year: 2018, population: 3034000, growthRate: 2.0 },
    { year: 2019, population: 3080000, growthRate: 1.5 },
    { year: 2020, population: 3104614, growthRate: 0.8 }, // Census count
    { year: 2021, population: 3143991, growthRate: 1.3 },
    { year: 2022, population: 3177772, growthRate: 1.1 },
    { year: 2023, population: 3225000, growthRate: 1.5 },
    { year: 2024, population: 3275000, growthRate: 1.5 },
    { year: 2025, population: 3320000, growthRate: 1.4 }  // Estimate
  ],
  migrationPatterns: {
    topInboundStates: [
      { state: "California", annualMigrants: 65000, description: "Largest source. Tech workers, retirees, and cost-of-living refugees." },
      { state: "Arizona", annualMigrants: 12000, description: "Neighboring state cross-migration." },
      { state: "Utah", annualMigrants: 8000, description: "I-15 corridor migration." },
      { state: "Texas", annualMigrants: 7500, description: "Growing bidirectional flow." },
      { state: "Washington", annualMigrants: 5500, description: "Tech workers from Seattle metro." }
    ],
    topOutboundStates: [
      { state: "California", annualMigrants: 25000, description: "Some return migration to CA." },
      { state: "Arizona", annualMigrants: 18000, description: "Retirement and cost migration." },
      { state: "Texas", annualMigrants: 10000, description: "Job-driven outmigration." },
      { state: "Idaho", annualMigrants: 6000, description: "Rural lifestyle seekers." },
      { state: "Utah", annualMigrants: 5500, description: "Neighboring state flow." }
    ],
    netDomesticMigration2024: 35000,
    internationalImmigration2024: 12000,
    totalNetMigration2024: 47000,
    migrationDrivers: [
      "No state income tax (saves $12K-18K/year for tech workers)",
      "Lower cost of living vs. California coastal cities",
      "Remote work flexibility post-COVID",
      "Growing tech job market in Reno and Las Vegas",
      "Lifestyle factors (outdoor recreation, entertainment)",
      "Business-friendly regulatory environment"
    ]
  },
  medianAge: 38.2,
  medianHouseholdIncome: 65000,
  povertyRate: 11.2
};

// ── STEM WORKFORCE & EDUCATION ──
export const STEM_EDUCATION = {
  // Source: NSHE, IPEDS, NSF HERD survey
  higherEducation: {
    unlv: {
      name: "University of Nevada, Las Vegas",
      totalEnrollment: 31000,
      stemEnrollment: 6200,
      annualStemGraduates: 2200,
      keyPrograms: [
        "Howard R. Hughes College of Engineering (CS, EE, ME, CE)",
        "College of Sciences (Math, Physics, Chemistry, Biology)",
        "Lee Business School (Management Information Systems)",
        "School of Public Health (Health Informatics)"
      ],
      researchExpenditure: 145, // $M
      notableResearchCenters: [
        "Black Fire Innovation",
        "Harry Reid Research & Technology Park",
        "International Gaming Institute",
        "National Supercomputing Institute",
        "Nevada Institute for Autonomous Systems"
      ]
    },
    unr: {
      name: "University of Nevada, Reno",
      totalEnrollment: 21000,
      stemEnrollment: 4800,
      annualStemGraduates: 1500,
      keyPrograms: [
        "College of Engineering (CS, EE, ME, Mining, Materials)",
        "College of Science (Math, Physics, Chemistry, Biology, Geoscience)",
        "College of Agriculture, Biotech & Natural Resources",
        "School of Medicine (biomedical research)"
      ],
      researchExpenditure: 180, // $M
      notableResearchCenters: [
        "Nevada Center for Applied Research (NCAR)",
        "Ozmen Center for Entrepreneurship",
        "Nevada Seismological Laboratory",
        "Mackay School of Earth Sciences and Engineering",
        "DeLaMare Science & Engineering Library Makerspace"
      ]
    },
    csn: {
      name: "College of Southern Nevada",
      totalEnrollment: 32000,
      description: "Largest institution in NSHE by enrollment. Key workforce training in IT, advanced manufacturing, healthcare.",
      techPrograms: ["Information Technology", "Cybersecurity", "Advanced Manufacturing", "Computer Science transfer"]
    },
    tmcc: {
      name: "Truckee Meadows Community College",
      totalEnrollment: 10000,
      description: "Northern Nevada community college. Workforce training aligned with TRIC manufacturing needs.",
      techPrograms: ["Advanced Manufacturing", "Welding Technology", "Automation", "IT Networking"]
    },
    nsc: {
      name: "Nevada State College",
      totalEnrollment: 7000,
      description: "Henderson-based state college focused on nursing, education, and applied sciences.",
      techPrograms: ["Data Science", "Environmental Science", "Health Sciences"]
    }
  },
  combinedAnnualStemGraduates: 3700, // UNLV + UNR combined
  pipelineGap: "Nevada produces ~3,700 STEM graduates annually but tech sector demand is estimated at 5,000-6,000 new positions per year, creating a persistent talent gap partially filled by in-migration."
};

// ── ECONOMIC DIVERSIFICATION METRICS ──
export const DIVERSIFICATION_METRICS = {
  description: "Nevada's economy has historically been dominated by tourism and gaming. The state has been actively diversifying into technology, advanced manufacturing, cleantech, and defense since 2014.",
  tourismShareOfGDP: {
    year2010: 30.5,
    year2015: 28.2,
    year2020: 18.0, // COVID impact
    year2025: 25.0  // Recovery but lower share than pre-2015
  },
  techShareOfGDP: {
    year2010: 2.8,
    year2015: 3.5,
    year2020: 4.8,
    year2025: 6.5
  },
  cleanEnergyInvestment: {
    totalPrivateInvestmentBillions: 12.5, // 2020-2025
    doeLoansBillions: 2.7, // Redwood + Ioneer conditional
    jobsCreated: 8500,
    keyProjects: ["Tesla Gigafactory expansion", "Redwood Materials campus", "Lyten gigafactory", "Gemini Solar Project", "Ioneer Rhyolite Ridge"]
  },
  keyDiversificationIndicators: [
    { metric: "Non-gaming revenue share of state tax revenue", value: "68%", trend: "increasing" },
    { metric: "Tech sector jobs as share of total employment", value: "3.8%", trend: "increasing" },
    { metric: "Data center tax revenue contribution", value: "$45M/year", trend: "increasing" },
    { metric: "Advanced manufacturing employment", value: "24,000 jobs", trend: "increasing" },
    { metric: "VC investment annual average (2023-2025)", value: "$1.4B/year", trend: "stable-to-increasing" }
  ]
};

export default {
  GDP_DATA,
  UNEMPLOYMENT_DATA,
  TECH_EMPLOYMENT,
  VC_INVESTMENT,
  COST_COMPARISON,
  TAX_ENVIRONMENT,
  POPULATION_DATA,
  STEM_EDUCATION,
  DIVERSIFICATION_METRICS
};
