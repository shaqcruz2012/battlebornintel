// ============================================================
// BBI v5.0 — Data Source Registry
// Canonical reference for all data sources used across the platform.
// Every data point should trace back to a source in this registry.
// ============================================================

/**
 * Source types:
 *   government  — Federal, state, or local government agencies
 *   academic    — Universities, research institutions, think tanks
 *   commercial  — Commercial data providers, platforms
 *   media       — News outlets, industry publications
 *   self_report — Company-reported data (press releases, websites)
 *   community   — Ecosystem organizations, accelerators
 *
 * Reliability ratings (1-5):
 *   5 = Authoritative primary source (SEC filings, government records)
 *   4 = Highly reliable secondary source (major data platforms, audited reports)
 *   3 = Generally reliable (industry publications, reputable media)
 *   2 = Useful but verify (company self-reports, unaudited claims)
 *   1 = Anecdotal / unverified (social media, anonymous tips)
 */

export const DATA_SOURCES = [
  // --- Federal Government ---
  {
    id: "sec_edgar",
    name: "SEC EDGAR",
    url: "https://www.sec.gov/cgi-bin/browse-edgar",
    type: "government",
    lastAccessed: "2025-02-20",
    refreshFrequency: "weekly",
    reliability: 5,
    coverage: "Public company filings (10-K, 10-Q, S-1, Reg A+), ownership reports (13-F, SC 13D/G), insider transactions. Definitive source for public company financials and ownership."
  },
  {
    id: "us_treasury_ssbci",
    name: "US Treasury SSBCI Program",
    url: "https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci",
    type: "government",
    lastAccessed: "2025-02-15",
    refreshFrequency: "quarterly",
    reliability: 5,
    coverage: "SSBCI allocation data, compliance requirements, tranche disbursements for Nevada. Authoritative for BBV, FundNV, 1864 Fund federal funding."
  },
  {
    id: "doe_lpo",
    name: "DOE Loan Programs Office",
    url: "https://www.energy.gov/lpo/loan-programs-office",
    type: "government",
    lastAccessed: "2025-02-10",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Federal loan commitments for energy and clean technology. Redwood Materials ($2B), Ioneer ($700M conditional), Ormat ($350M). ATVM and Title XVII programs."
  },
  {
    id: "nv_goed",
    name: "Nevada GOED",
    url: "https://goed.nv.gov/",
    type: "government",
    lastAccessed: "2025-02-18",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Nevada economic development programs, SSBCI administration, Knowledge Fund, tax abatements, Battle Born Growth accelerator program. State-level startup ecosystem governance."
  },
  {
    id: "nv_sos",
    name: "Nevada Secretary of State",
    url: "https://www.nvsos.gov/sos/businesses",
    type: "government",
    lastAccessed: "2025-02-01",
    refreshFrequency: "quarterly",
    reliability: 5,
    coverage: "Business entity registrations, annual filings, registered agent records. Confirms company incorporation status in Nevada."
  },
  {
    id: "nv_gaming_control",
    name: "NV Gaming Control Board",
    url: "https://gaming.nv.gov/",
    type: "government",
    lastAccessed: "2025-01-20",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Gaming licenses, revenue reports, regulatory proceedings. Authoritative for gaming-sector companies (Everi, PlayStudios, GAN, Acres Technology)."
  },
  {
    id: "nv_cannabis_board",
    name: "NV Cannabis Compliance Board",
    url: "https://ccb.nv.gov/",
    type: "government",
    lastAccessed: "2025-01-15",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Cannabis licensing, compliance rulings, consumption lounge regulations. Authoritative for Planet 13, Springbig, Curaleaf Tech."
  },
  {
    id: "fda",
    name: "FDA",
    url: "https://www.fda.gov/",
    type: "government",
    lastAccessed: "2025-01-10",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Medical device approvals (Katalyst), drug master files (Filament Health), AI/ML SaMD framework. Clinical trial registrations."
  },
  {
    id: "epa",
    name: "US EPA",
    url: "https://www.epa.gov/",
    type: "government",
    lastAccessed: "2025-01-15",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Environmental regulations, RCRA hazardous waste rules, permitting for battery recycling (Redwood Materials, Aqua Metals, Lyten). NV NDEP state programs."
  },
  {
    id: "blm",
    name: "Bureau of Land Management",
    url: "https://www.blm.gov/",
    type: "government",
    lastAccessed: "2025-01-20",
    refreshFrequency: "quarterly",
    reliability: 5,
    coverage: "Mining permits, NEPA environmental reviews, geothermal leases. Ioneer Rhyolite Ridge, Ormat geothermal plants."
  },
  {
    id: "sbir_gov",
    name: "SBIR.gov",
    url: "https://www.sbir.gov/",
    type: "government",
    lastAccessed: "2025-01-25",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "SBIR/STTR awards database. Nevada Nano, fibrX, WaterStart federal small business grants."
  },

  // --- Commercial Data Platforms ---
  {
    id: "crunchbase",
    name: "Crunchbase",
    url: "https://www.crunchbase.com/",
    type: "commercial",
    lastAccessed: "2025-02-20",
    refreshFrequency: "weekly",
    reliability: 4,
    coverage: "Funding rounds, investor data, company profiles for private and public companies. Primary source for startup funding history, employee estimates, and investor relationships."
  },
  {
    id: "pitchbook",
    name: "PitchBook",
    url: "https://pitchbook.com/",
    type: "commercial",
    lastAccessed: "2025-02-18",
    refreshFrequency: "weekly",
    reliability: 4,
    coverage: "VC/PE deal data, valuations, fund performance, company financials. Premium data on private market transactions and investor portfolios."
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/",
    type: "commercial",
    lastAccessed: "2025-02-15",
    refreshFrequency: "weekly",
    reliability: 3,
    coverage: "Employee count approximations, hiring activity, executive profiles. Useful for headcount and talent flow signals but self-reported."
  },
  {
    id: "nv_dealroom",
    name: "Nevada Dealroom",
    url: "https://nevada.dealroom.co/",
    type: "commercial",
    lastAccessed: "2025-02-10",
    refreshFrequency: "monthly",
    reliability: 4,
    coverage: "Nevada startup ecosystem mapping. Company profiles, funding data, sector analysis. Maintained by Dealroom.co in partnership with LVGEA and EDAWN."
  },

  // --- Academic / Research ---
  {
    id: "unlv_cber",
    name: "UNLV Center for Business and Economic Research",
    url: "https://cber.unlv.edu/",
    type: "academic",
    lastAccessed: "2025-01-30",
    refreshFrequency: "quarterly",
    reliability: 4,
    coverage: "Southern Nevada economic indicators: employment, GDP, population, industry output, tourism, housing. Quarterly and annual reports."
  },
  {
    id: "lincy_institute",
    name: "UNLV Lincy Institute",
    url: "https://www.unlv.edu/lincyinstitute",
    type: "academic",
    lastAccessed: "2025-01-25",
    refreshFrequency: "quarterly",
    reliability: 4,
    coverage: "Demographic data, workforce development, education attainment, health indicators, social equity metrics for Nevada communities."
  },
  {
    id: "unr_econ",
    name: "UNR College of Business",
    url: "https://www.unr.edu/business",
    type: "academic",
    lastAccessed: "2025-01-20",
    refreshFrequency: "quarterly",
    reliability: 4,
    coverage: "Northern Nevada economic data, employment reports, regional economic forecasts. Reno-Sparks economy analysis."
  },
  {
    id: "brookings",
    name: "Brookings Institution",
    url: "https://www.brookings.edu/",
    type: "academic",
    lastAccessed: "2025-01-15",
    refreshFrequency: "quarterly",
    reliability: 4,
    coverage: "Regional innovation economy metrics, technology hub rankings, economic mobility analysis. National context for Nevada positioning."
  },

  // --- Media / Industry Publications ---
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com/",
    type: "media",
    lastAccessed: "2025-02-20",
    refreshFrequency: "daily",
    reliability: 3,
    coverage: "Startup funding announcements, product launches, M&A activity. Fast coverage of breaking deals but may have inaccuracies in early reporting."
  },
  {
    id: "nevada_indy",
    name: "The Nevada Independent",
    url: "https://thenevadaindependent.com/",
    type: "media",
    lastAccessed: "2025-02-18",
    refreshFrequency: "daily",
    reliability: 3,
    coverage: "Nevada policy, legislative activity, economic development news. Authoritative for state politics and regulatory landscape. Covers GOED, SSBCI, mining policy."
  },
  {
    id: "lvsun",
    name: "Las Vegas Sun / Review-Journal",
    url: "https://www.reviewjournal.com/",
    type: "media",
    lastAccessed: "2025-02-15",
    refreshFrequency: "daily",
    reliability: 3,
    coverage: "Local business news, real estate, gaming industry, economic development in Southern Nevada."
  },
  {
    id: "nnbw",
    name: "Northern Nevada Business Weekly",
    url: "https://www.nnbw.com/",
    type: "media",
    lastAccessed: "2025-02-10",
    refreshFrequency: "weekly",
    reliability: 3,
    coverage: "Reno/Sparks/Carson City business news. Manufacturing, cleantech, and workforce development in Northern Nevada."
  },
  {
    id: "this_is_reno",
    name: "This Is Reno",
    url: "https://thisisreno.com/",
    type: "media",
    lastAccessed: "2025-02-05",
    refreshFrequency: "daily",
    reliability: 3,
    coverage: "Northern Nevada community and business news. Tech ecosystem, startup events, economic development."
  },
  {
    id: "techbuzz",
    name: "TechBuzz News",
    url: "https://techbuzznews.com/",
    type: "media",
    lastAccessed: "2025-02-10",
    refreshFrequency: "weekly",
    reliability: 3,
    coverage: "Intermountain West startup ecosystem coverage. Nevada, Utah, Idaho startups. AngelNV, StartUpNV, Fund 1864 events."
  },

  // --- Self-Report / Company Sources ---
  {
    id: "company_press",
    name: "Company Press Releases",
    url: null,
    type: "self_report",
    lastAccessed: "2025-02-20",
    refreshFrequency: "continuous",
    reliability: 2,
    coverage: "Direct company announcements for funding rounds, partnerships, product launches, hiring milestones. Verify key claims against SEC filings or third-party sources."
  },
  {
    id: "company_websites",
    name: "Company Websites",
    url: null,
    type: "self_report",
    lastAccessed: "2025-02-20",
    refreshFrequency: "monthly",
    reliability: 2,
    coverage: "Company descriptions, team pages, product details. Self-reported data useful for descriptions and product features but should be cross-referenced."
  },

  // --- Community / Ecosystem ---
  {
    id: "startupnv",
    name: "StartUpNV",
    url: "https://www.startupnv.com/",
    type: "community",
    lastAccessed: "2025-02-15",
    refreshFrequency: "monthly",
    reliability: 4,
    coverage: "Nevada statewide accelerator. Portfolio company data, FundNV investments, AngelNV pitch competition results, ecosystem events. Authoritative for NV early-stage pipeline."
  },
  {
    id: "angelnv",
    name: "AngelNV",
    url: "https://www.angelnv.com/",
    type: "community",
    lastAccessed: "2025-02-10",
    refreshFrequency: "quarterly",
    reliability: 4,
    coverage: "Angel investor bootcamp cohorts, pitch competition winners and finalists, investment amounts. Annual cycle January-May."
  },
  {
    id: "edawn",
    name: "EDAWN",
    url: "https://edawn.org/",
    type: "community",
    lastAccessed: "2025-01-30",
    refreshFrequency: "monthly",
    reliability: 4,
    coverage: "Economic Development Authority of Western Nevada. Northern Nevada company relocations, expansion announcements, incentive packages."
  },
  {
    id: "lvgea",
    name: "LVGEA",
    url: "https://www.lvgea.org/",
    type: "community",
    lastAccessed: "2025-01-30",
    refreshFrequency: "monthly",
    reliability: 4,
    coverage: "Las Vegas Global Economic Alliance. Southern Nevada economic data, company attraction, workforce development, innovation ecosystem mapping."
  },
  {
    id: "gener8tor",
    name: "gener8tor",
    url: "https://www.gener8tor.com/",
    type: "community",
    lastAccessed: "2025-01-20",
    refreshFrequency: "quarterly",
    reliability: 3,
    coverage: "Battle Born Growth accelerator cohorts (Las Vegas and Reno). Company profiles, investment data, program milestones. SSBCI-funded."
  },
  {
    id: "zero_labs",
    name: "Zero Labs",
    url: "https://zerolabsventures.com/",
    type: "community",
    lastAccessed: "2025-01-15",
    refreshFrequency: "quarterly",
    reliability: 3,
    coverage: "Gaming/hospitality/sports accelerator at Black Fire Innovation. Cohort companies, launchpad events. 76+ startups since 2024."
  },

  // --- Federal Economic Data ---
  {
    id: "bls",
    name: "Bureau of Labor Statistics",
    url: "https://www.bls.gov/",
    type: "government",
    lastAccessed: "2025-02-01",
    refreshFrequency: "monthly",
    reliability: 5,
    coverage: "Employment data, wage statistics, industry employment for Nevada and MSAs (Las Vegas-Henderson-Paradise, Reno-Sparks). QCEW, CES, OES programs."
  },
  {
    id: "census_acs",
    name: "US Census / ACS",
    url: "https://data.census.gov/",
    type: "government",
    lastAccessed: "2025-01-15",
    refreshFrequency: "annually",
    reliability: 5,
    coverage: "Population, demographics, education attainment, household income, industry composition. American Community Survey 1-year and 5-year estimates for Nevada counties and cities."
  },
  {
    id: "bea",
    name: "Bureau of Economic Analysis",
    url: "https://www.bea.gov/",
    type: "government",
    lastAccessed: "2025-01-20",
    refreshFrequency: "quarterly",
    reliability: 5,
    coverage: "GDP by state and MSA, industry output, personal income, trade data. Nevada economic structure and growth rates."
  },
];

/**
 * Look up a source by ID.
 * @param {string} sourceId
 * @returns {object|undefined}
 */
export function getSource(sourceId) {
  return DATA_SOURCES.find(s => s.id === sourceId);
}

/**
 * Get all sources of a given type.
 * @param {string} type - government, academic, commercial, media, self_report, community
 * @returns {object[]}
 */
export function getSourcesByType(type) {
  return DATA_SOURCES.filter(s => s.type === type);
}

/**
 * Get all sources with reliability >= threshold.
 * @param {number} minReliability - Minimum reliability rating (1-5)
 * @returns {object[]}
 */
export function getReliableSources(minReliability = 4) {
  return DATA_SOURCES.filter(s => s.reliability >= minReliability);
}
