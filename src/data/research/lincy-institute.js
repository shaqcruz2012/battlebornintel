/**
 * Lincy Institute (UNLV) & Brookings Mountain West Data
 * Source: https://www.unlv.edu/lincy-institute
 * Source: https://www.unlv.edu/brookings-mountain-west
 *
 * The Lincy Institute conducts community-focused research on Southern Nevada's
 * social determinants, demographics, health, education, and policy. Brookings
 * Mountain West (housed at UNLV) provides metropolitan policy analysis.
 *
 * NOTE: Data compiled from Lincy Institute fact sheets, community indicators
 * reports, and Brookings Mountain West publications. Items marked [ESTIMATED]
 * require verification against latest Lincy/Brookings publications.
 *
 * Last research update: 2026-02-28
 */

// ─── Clark County Demographics & Growth ──────────────────────────────────────
// Source: Lincy Institute Community Indicators; Census Bureau ACS
export const CLARK_COUNTY_DEMOGRAPHICS = {
  asOfDate: '2024',
  population: 2320000, // 2.32M [ESTIMATED] — Clark County
  populationGrowthRate: 0.018, // 1.8% annual growth
  nevadaStatePopulation: 3250000, // 3.25M [ESTIMATED]
  clarkCountyShareOfState: 0.714, // 71.4% of state population
  medianAge: 37.8,
  householdSize: 2.72,
  totalHouseholds: 805000, // [ESTIMATED]
  medianHouseholdIncome: 65500, // $65,500 [ESTIMATED]
  perCapitaIncome: 34200, // $34,200 [ESTIMATED]
  povertyRate: 0.122, // 12.2% [ESTIMATED]
  populationByAge: [
    { group: 'Under 18', share: 0.225 },
    { group: '18-24', share: 0.092 },
    { group: '25-34', share: 0.148 },
    { group: '35-44', share: 0.140 },
    { group: '45-54', share: 0.128 },
    { group: '55-64', share: 0.120 },
    { group: '65+', share: 0.147 },
  ],
  populationByRaceEthnicity: [
    { group: 'White (Non-Hispanic)', share: 0.324 },
    { group: 'Hispanic/Latino', share: 0.327 },
    { group: 'Black/African American', share: 0.122 },
    { group: 'Asian', share: 0.112 },
    { group: 'Two or More Races', share: 0.075 },
    { group: 'Native Hawaiian/Pacific Islander', share: 0.018 },
    { group: 'American Indian/Alaska Native', share: 0.010 },
    { group: 'Other', share: 0.012 },
  ],
  migrationTrends: {
    netDomesticMigration2024: 35000, // [ESTIMATED] net in-migration
    topOriginStates: ['California', 'Arizona', 'Texas', 'Washington', 'Illinois'],
    internationalImmigration2024: 12000, // [ESTIMATED]
    topOriginCountries: ['Mexico', 'Philippines', 'Guatemala', 'El Salvador', 'China'],
  },
  projections: {
    population2030: 2600000, // [ESTIMATED]
    population2040: 2900000, // [ESTIMATED]
    growthDriver: 'Domestic in-migration from high-cost Western states',
  },
  source:
    'https://www.unlv.edu/lincy-institute; Census Bureau ACS; Nevada State Demographer',
  confidence: 'medium',
};

// ─── Education Attainment ────────────────────────────────────────────────────
// Source: Lincy Institute Community Indicators; Census Bureau ACS
export const EDUCATION_ATTAINMENT = {
  area: 'Clark County, NV',
  asOfDate: '2024',
  population25Plus: 1580000, // [ESTIMATED]
  attainmentLevels: [
    { level: 'Less than High School', share: 0.142, nationalAvg: 0.110 },
    { level: 'High School Diploma/GED', share: 0.268, nationalAvg: 0.260 },
    { level: 'Some College, No Degree', share: 0.225, nationalAvg: 0.195 },
    { level: 'Associate Degree', share: 0.078, nationalAvg: 0.088 },
    { level: "Bachelor's Degree", share: 0.192, nationalAvg: 0.215 },
    { level: 'Graduate/Professional Degree', share: 0.095, nationalAvg: 0.132 },
  ],
  bachelorOrHigher: 0.287, // 28.7% — below national average of 34.7%
  nationalBachelorOrHigher: 0.347,
  stemDegrees: {
    annualSTEMGrads: 3800, // [ESTIMATED] UNLV + CSN + NSC
    unlvSTEMGrads: 2100, // [ESTIMATED]
    csnSTEMCerts: 1200, // [ESTIMATED]
    growthRate: 0.08, // 8% annual growth in STEM degrees
  },
  keyInstitutions: [
    {
      name: 'University of Nevada, Las Vegas (UNLV)',
      enrollment: 31000,
      classification: 'R1 Research University (Very High Research Activity)',
      notablePrograms: ['Engineering', 'Computer Science', 'Hospitality', 'Health Sciences'],
    },
    {
      name: 'College of Southern Nevada (CSN)',
      enrollment: 34000,
      classification: 'Community College',
      notablePrograms: ['IT Certifications', 'Healthcare', 'Trades', 'Business'],
    },
    {
      name: 'Nevada State University (formerly NSC)',
      enrollment: 7000,
      classification: 'Four-year public university',
      notablePrograms: ['Nursing', 'Education', 'Business', 'Biology'],
    },
    {
      name: 'University of Nevada, Reno (UNR)',
      enrollment: 21000,
      classification: 'R1 Research University',
      notablePrograms: ['Engineering', 'Mining', 'Computer Science', 'Agriculture'],
    },
  ],
  challenges: [
    'Below-national-average bachelor\'s attainment rate',
    'K-12 education outcomes ranked 45-48th nationally',
    'Teacher shortage — especially STEM subjects',
    'Low community college completion rates',
    'Brain drain — graduates leaving for higher-wage markets',
  ],
  source: 'https://www.unlv.edu/lincy-institute; Census Bureau ACS; IPEDS',
  confidence: 'medium',
};

// ─── Healthcare Access Metrics ───────────────────────────────────────────────
// Source: Lincy Institute; Nevada DHHS; County Health Rankings
export const HEALTHCARE_ACCESS = {
  area: 'Clark County, NV',
  asOfDate: '2024',
  metrics: {
    uninsuredRate: 0.115, // 11.5% [ESTIMATED] — above national avg 8.0%
    nationalUninsuredRate: 0.080,
    physiciansPer100k: 195, // [ESTIMATED] — below national avg of 280
    nationalPhysiciansPer100k: 280,
    mentalHealthProvidersPer100k: 180, // [ESTIMATED]
    dentistsPer100k: 55, // [ESTIMATED]
    hospitalBeds: 5200, // [ESTIMATED] in Clark County
    hospitalBedsPer1000: 2.2, // below national avg of 2.8
    federallyQualifiedHealthCenters: 12, // [ESTIMATED]
    emergencyRoomVisitRate: 420, // per 1,000 population [ESTIMATED]
  },
  healthOutcomes: {
    lifeExpectancy: 78.2, // [ESTIMATED]
    infantMortalityPer1000: 5.8, // [ESTIMATED]
    obesityRate: 0.285, // 28.5%
    diabetesPrevalence: 0.105, // 10.5%
    mentalHealthPoorDays: 4.8, // avg poor mental health days per month
  },
  healthTechOpportunities: [
    'Severe physician shortage creates telemedicine demand',
    'Mental health provider gap — telehealth opportunity',
    'Large uninsured population — health access platform opportunity',
    'Rural Nevada healthcare deserts (outside Clark/Washoe)',
    'Aging population driving home health tech demand',
    'UNLV Kirk Kerkorian School of Medicine growing capacity',
  ],
  recentDevelopments: [
    'UNLV Medical School expanding to 120 students per class by 2026',
    'Telehealth adoption accelerated post-COVID — 35% of visits now virtual',
    'Nevada Medicaid expansion covering additional 200K residents',
    'New hospital construction in Henderson and North Las Vegas',
  ],
  source:
    'https://www.unlv.edu/lincy-institute; County Health Rankings; Nevada DHHS; HRSA',
  confidence: 'medium',
};

// ─── Community Indicators (Brookings Mountain West) ──────────────────────────
// Source: https://www.unlv.edu/brookings-mountain-west; Lincy Institute
export const COMMUNITY_INDICATORS = {
  asOfDate: '2024',
  economicWellbeing: {
    medianHouseholdIncome: 65500,
    incomeGrowthYoY: 0.035,
    giniCoefficient: 0.465, // [ESTIMATED] — income inequality measure
    costOfLivingIndex: 103.5, // vs 100 national average [ESTIMATED]
    housingCostBurden: 0.34, // 34% of households spend >30% on housing
    childPovertyRate: 0.168, // 16.8% [ESTIMATED]
    foodInsecurity: 0.125, // 12.5% [ESTIMATED]
  },
  socialMobility: {
    upwardMobilityRank: 'Below average for large metros',
    intergenerationalIncomeElasticity: 0.42, // [ESTIMATED] — higher = less mobility
    communityCollegeEnrollmentRate: 0.38, // 38% of high school grads
    fourYearEnrollmentRate: 0.22, // 22% of high school grads [ESTIMATED]
  },
  civicEngagement: {
    voterTurnout2024: 0.65, // 65% presidential election
    volunteerRate: 0.22, // 22% [ESTIMATED]
    nonprofitsPerCapita: 4.2, // per 1,000 residents [ESTIMATED]
    socialCapitalIndex: 'Below national average',
  },
  infrastructure: {
    transitAccessScore: 38, // out of 100 — car-dependent metro
    walkabilityScore: 42, // Walk Score for Las Vegas proper
    broadbandAccessRate: 0.92, // 92% households with broadband
    parkAccessRate: 0.72, // 72% within 10-min walk of park
    averageCommuteMinutes: 26.5,
    commuteModeSplit: {
      droveAlone: 0.78,
      carpool: 0.10,
      publicTransit: 0.04,
      workFromHome: 0.06,
      other: 0.02,
    },
  },
  environmentalQuality: {
    airQualityDays: { good: 210, moderate: 120, unhealthy: 35 },
    waterStress: 'High — Colorado River dependency',
    renewableEnergyShare: 0.29, // 29% of electricity from renewables [ESTIMATED]
    averageHighTemp: 80, // degrees F annual average
    annualRainfall: 4.2, // inches
  },
  source:
    'https://www.unlv.edu/lincy-institute; https://www.unlv.edu/brookings-mountain-west',
  confidence: 'medium',
};

// ─── Housing Affordability ───────────────────────────────────────────────────
// Source: Lincy Institute; NLIHC; HUD
export const HOUSING_AFFORDABILITY = {
  area: 'Las Vegas-Henderson-Paradise MSA',
  asOfDate: '2024',
  metrics: {
    medianHomePrice: 440000,
    medianRent: 1650,
    medianHouseholdIncome: 65500,
    priceToIncomeRatio: 6.7, // homes cost 6.7x annual income
    rentToIncomeRatio: 0.302, // 30.2% of income goes to rent
    housingWageNeeded: 31.73, // hourly wage needed to afford median 2BR at 30%
    actualMedianHourlyWage: 20.50, // [ESTIMATED]
    affordabilityGap: 11.23, // $11.23/hr gap
  },
  trends: [
    'Home prices up 47% since 2019 vs wage growth of 22%',
    'Rental vacancy tightening — 6.5% in 2024 vs 8% in 2020',
    'New apartment construction partially easing rental pressure',
    'California in-migration bidding up housing prices',
    'First-time homebuyer share declining — from 38% to 28%',
  ],
  policyResponses: [
    'Home is Possible program — down payment assistance',
    'Clark County Affordable Housing Trust Fund',
    'Inclusionary zoning discussions (not yet adopted)',
    'GOED Opportunity Zone incentives for affordable housing',
    'Nevada Housing Division Low-Income Housing Tax Credits',
  ],
  comparisonToOriginMarkets: {
    vsLosAngeles: { lvMedian: 440000, laMedian: 950000, savings: 0.537 },
    vsSanFrancisco: { lvMedian: 440000, sfMedian: 1350000, savings: 0.674 },
    vsSeattle: { lvMedian: 440000, seMedian: 820000, savings: 0.463 },
    vsDenver: { lvMedian: 440000, denMedian: 580000, savings: 0.241 },
    vsPhoenix: { lvMedian: 440000, phxMedian: 420000, savings: -0.048 },
  },
  source:
    'https://www.unlv.edu/lincy-institute; NLIHC Out of Reach Report; HUD Fair Market Rents',
  confidence: 'medium',
};

// ─── Immigration & Diversity ─────────────────────────────────────────────────
// Source: Lincy Institute; Census Bureau ACS
export const IMMIGRATION_DIVERSITY = {
  area: 'Clark County, NV',
  asOfDate: '2024',
  foreignBornPopulation: 510000, // [ESTIMATED]
  foreignBornShare: 0.220, // 22% — well above national average of 14.3%
  nationalForeignBornShare: 0.143,
  naturalizationRate: 0.48, // 48% of eligible foreign-born are naturalized
  languageDiversity: {
    englishOnly: 0.635,
    spanishAtHome: 0.255,
    asianLanguages: 0.065,
    otherLanguages: 0.045,
    limitedEnglishProficiency: 0.115, // 11.5%
  },
  diversityIndex: 0.72, // probability that two random people are different race/ethnicity
  topImmigrantOrigins: [
    { country: 'Mexico', share: 0.38 },
    { country: 'Philippines', share: 0.12 },
    { country: 'Guatemala', share: 0.06 },
    { country: 'El Salvador', share: 0.05 },
    { country: 'China', share: 0.04 },
    { country: 'Cuba', share: 0.03 },
    { country: 'India', share: 0.03 },
    { country: 'Korea', share: 0.02 },
    { country: 'Ethiopia', share: 0.02 },
    { country: 'Other', share: 0.25 },
  ],
  economicContribution: {
    immigrantShareOfWorkforce: 0.26, // 26% of labor force
    immigrantEntrepreneurRate: 0.12, // 12% — above native-born rate
    topIndustriesForImmigrants: [
      'Accommodation & Food Services',
      'Construction',
      'Healthcare Support',
      'Retail Trade',
      'Administrative Services',
    ],
    immigrantHouseholdIncome: 55000, // $55K median [ESTIMATED]
  },
  implications: [
    'Highly diverse workforce — asset for global tech companies',
    'Strong multilingual talent pool',
    'Cultural competency for international business',
    'Immigrant entrepreneurship higher than average',
    'Language access needs for health tech and gov tech',
  ],
  source: 'https://www.unlv.edu/lincy-institute; Census Bureau ACS; Migration Policy Institute',
  confidence: 'medium',
};
