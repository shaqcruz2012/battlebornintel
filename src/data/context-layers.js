// ============================================================
// BBI v5.0 — Context Layer Definitions
// Multi-dimensional overlays on core entity data.
// Each layer provides a specific analytical lens.
// ============================================================

/**
 * Context Layer Types:
 *   geospatial   — Physical locations, regions, zones, infrastructure
 *   temporal     — Timeline events, milestones, funding rounds
 *   economic     — Employment, GDP, tax revenue, industry output
 *   regulatory   — Docket timelines, compliance, impact scoring
 *   network      — Relationship metadata, influence, communities
 *   demographic  — Population, workforce, education attainment
 */

// ── GEOSPATIAL LAYER ──

export const GEOSPATIAL_LAYER = {
  layerId: "geospatial",
  type: "geospatial",
  source: "US Census, NV GOED, EDAWN, LVGEA, Google Maps",
  timestamp: "2025-02-20",
  refreshFrequency: "quarterly",
  data: {
    // Core Nevada regions with bounding coordinates
    regions: {
      las_vegas: {
        name: "Las Vegas Metro",
        center: { lat: 36.17, lng: -115.14 },
        bounds: { north: 36.35, south: 35.90, east: -114.90, west: -115.40 },
        counties: ["Clark"],
        population: 2300000,
        description: "Southern Nevada metro area including Las Vegas, North Las Vegas, and unincorporated Clark County"
      },
      reno: {
        name: "Reno-Sparks-Tahoe",
        center: { lat: 39.53, lng: -119.81 },
        bounds: { north: 39.75, south: 39.15, east: -119.60, west: -120.10 },
        counties: ["Washoe", "Storey", "Douglas"],
        population: 500000,
        description: "Northern Nevada metro including Reno, Sparks, Carson City, and Incline Village"
      },
      henderson: {
        name: "Henderson",
        center: { lat: 36.04, lng: -115.04 },
        bounds: { north: 36.10, south: 35.95, east: -114.90, west: -115.20 },
        counties: ["Clark"],
        population: 320000,
        description: "Henderson municipality in southern Clark County"
      },
      rural: {
        name: "Rural Nevada",
        center: { lat: 38.80, lng: -117.00 },
        bounds: { north: 42.00, south: 35.00, east: -114.00, west: -120.00 },
        counties: ["Esmeralda", "Nye", "Elko", "Humboldt", "Lander", "Pershing", "Churchill", "Mineral", "Lyon", "White Pine", "Eureka", "Lincoln"],
        population: 300000,
        description: "Counties outside Las Vegas and Reno metros. Mining, energy, and defense operations."
      }
    },

    // Key infrastructure and innovation zones
    innovationZones: [
      {
        id: "tric",
        name: "Tahoe-Reno Industrial Center (TRIC)",
        lat: 39.62, lng: -119.35,
        region: "reno",
        type: "industrial_park",
        tenants: ["Tesla Gigafactory", "Redwood Materials", "Aqua Metals", "Switch"],
        acreage: 107000,
        description: "Largest industrial park in the world. Home to Tesla Gigafactory Nevada, Panasonic, and growing cleantech cluster."
      },
      {
        id: "reno_airlogistics",
        name: "Reno AirLogistics Park",
        lat: 39.50, lng: -119.77,
        region: "reno",
        type: "industrial_park",
        tenants: ["Lyten (planned gigafactory)"],
        acreage: 4000,
        description: "New industrial park adjacent to Reno-Tahoe International. Lyten $1B+ gigafactory under development."
      },
      {
        id: "harry_reid_tech",
        name: "Harry Reid Research & Technology Park",
        lat: 36.07, lng: -115.14,
        region: "las_vegas",
        type: "university_hub",
        tenants: ["Black Fire Innovation", "UNLV Tech Transfer"],
        acreage: 122,
        description: "UNLV research and technology park. Home to Black Fire Innovation gaming/hospitality living lab."
      },
      {
        id: "unr_innevation",
        name: "UNR Innevation Center",
        lat: 39.53, lng: -119.81,
        region: "reno",
        type: "university_hub",
        tenants: ["gener8tor Reno", "InNEVator"],
        acreage: null,
        description: "University of Nevada Reno coworking and incubator space. Hosts accelerator programs."
      },
      {
        id: "switch_supernap",
        name: "Switch SUPERNAP",
        lat: 36.08, lng: -115.15,
        region: "las_vegas",
        type: "data_center",
        tenants: ["Switch Inc"],
        acreage: 500,
        description: "Hyperscale data center campus. One of the world's largest colocation facilities. 2.4M sq ft."
      },
      {
        id: "blockchains_innovation",
        name: "Blockchains Innovation Park",
        lat: 39.53, lng: -119.75,
        region: "reno",
        type: "innovation_zone",
        tenants: ["Blockchains LLC"],
        acreage: 67000,
        description: "Proposed smart city on 67,000 acres in Storey County. Self-funded by Jeffrey Berns."
      },
      {
        id: "nellis_nttr",
        name: "Nellis AFB / NTTR",
        lat: 36.24, lng: -115.04,
        region: "las_vegas",
        type: "military_facility",
        tenants: ["AFWERX", "Skydio Gov"],
        acreage: null,
        description: "Nellis Air Force Base and Nevada Test & Training Range. AFWERX innovation hub. Counter-UAS testing."
      }
    ],

    // City coordinates for mapping
    cities: {
      "Las Vegas":      { lat: 36.17, lng: -115.14, region: "las_vegas" },
      "N. Las Vegas":   { lat: 36.24, lng: -115.12, region: "las_vegas" },
      "Henderson":      { lat: 36.04, lng: -115.04, region: "henderson" },
      "Reno":           { lat: 39.53, lng: -119.81, region: "reno" },
      "Sparks":         { lat: 39.53, lng: -119.75, region: "reno" },
      "Carson City":    { lat: 39.16, lng: -119.77, region: "reno" },
      "Incline Village":{ lat: 39.25, lng: -119.95, region: "reno" },
      "Virginia City":  { lat: 39.31, lng: -119.65, region: "reno" },
    }
  }
};


// ── TEMPORAL LAYER ──

export const TEMPORAL_LAYER = {
  layerId: "temporal",
  type: "temporal",
  source: "SEC EDGAR, Crunchbase, PitchBook, press releases, GOED",
  timestamp: "2025-02-20",
  refreshFrequency: "weekly",
  data: {
    // Key ecosystem milestones (beyond individual company timeline events)
    milestones: [
      { date: "2021-09-01", category: "policy",    title: "SSBCI Reauthorization", description: "American Rescue Plan reauthorized SSBCI with $10B nationally. Nevada allocated $52M across BBV, FundNV, 1864 Fund, and accelerator programs." },
      { date: "2022-01-01", category: "program",   title: "gener8tor Nevada Launch", description: "GOED-funded Battle Born Growth accelerator program launched in Las Vegas and Reno with $100K per company." },
      { date: "2022-10-01", category: "facility",  title: "Redwood Materials Carson City Expansion", description: "Redwood Materials breaks ground on expanded Carson City campus for cathode and anode copper foil production." },
      { date: "2023-01-01", category: "program",   title: "FundNV2 Launch", description: "Second FundNV fund established with SSBCI 1:1 match. First investment in BuildQ ($200K)." },
      { date: "2023-06-01", category: "milestone", title: "Nevada Startup Ecosystem Crosses 100 Companies", description: "Nevada Dealroom tracks 100+ active tech startups across Las Vegas, Reno, and rural areas." },
      { date: "2024-01-01", category: "facility",  title: "Lyten Gigafactory Announced", description: "Lyten announces $1B+ lithium-sulfur battery gigafactory at Reno AirLogistics Park. 1,000+ jobs." },
      { date: "2024-02-01", category: "milestone", title: "TensorWave $100M Series A", description: "Largest Series A in Nevada history. AMD-powered GPU cloud. 8,192 MI325X cluster." },
      { date: "2024-06-01", category: "program",   title: "Zero Labs Scales to 76+ Startups", description: "Zero Labs gaming/hospitality accelerator at Black Fire Innovation surpasses 76 startups supported." },
      { date: "2025-01-01", category: "policy",    title: "DOE Ioneer Rhyolite Ridge Loan", description: "DOE issues $996M loan guarantee for Ioneer lithium-boron project in Esmeralda County." },
      { date: "2025-02-01", category: "milestone", title: "TensorWave $100M+ ARR", description: "TensorWave surpasses $100M annualized run-rate revenue. 20x year-over-year growth." },
    ],

    // Funding round types and typical timelines
    fundingStageTimelines: {
      pre_seed:       { typicalDuration: "6-12 months",  nextStage: "seed",          typicalRaise: "$0.1M-$0.5M" },
      seed:           { typicalDuration: "12-18 months", nextStage: "series_a",      typicalRaise: "$0.5M-$5M" },
      series_a:       { typicalDuration: "18-24 months", nextStage: "series_b",      typicalRaise: "$5M-$30M" },
      series_b:       { typicalDuration: "18-24 months", nextStage: "series_c_plus", typicalRaise: "$30M-$100M" },
      series_c_plus:  { typicalDuration: "24-36 months", nextStage: "growth",        typicalRaise: "$100M+" },
      growth:         { typicalDuration: "ongoing",      nextStage: "IPO/M&A",       typicalRaise: "Variable" },
    }
  }
};


// ── ECONOMIC LAYER ──

export const ECONOMIC_LAYER = {
  layerId: "economic",
  type: "economic",
  source: "BLS, BEA, UNLV CBER, UNR Economics, Census ACS",
  timestamp: "2025-02-01",
  refreshFrequency: "quarterly",
  data: {
    // State-level economic indicators
    stateMetrics: {
      population: 3200000,
      gdp_billions: 200,
      unemployment_rate: 5.2,
      median_household_income: 65000,
      cost_of_living_index: 103,
      state_income_tax: "none",
      corporate_income_tax: "none",
      data_period: "2024-Q4",
    },

    // MSA-level employment by key tech sectors
    techEmployment: {
      las_vegas_msa: {
        name: "Las Vegas-Henderson-Paradise MSA",
        total_employment: 1050000,
        tech_employment: 45000,
        tech_pct: 4.3,
        avg_tech_salary: 95000,
        yoy_tech_growth: 8.2,
        top_sectors: ["Gaming Tech", "AI/ML", "AdTech", "Cybersecurity", "Hospitality Tech"],
        data_period: "2024-Q4",
      },
      reno_msa: {
        name: "Reno-Sparks MSA",
        total_employment: 260000,
        tech_employment: 18000,
        tech_pct: 6.9,
        avg_tech_salary: 88000,
        yoy_tech_growth: 12.4,
        top_sectors: ["Cleantech", "Manufacturing", "Cloud", "Defense", "Energy"],
        data_period: "2024-Q4",
      }
    },

    // Key industry output data
    industryOutput: {
      gaming_revenue_billions: 15.2,
      mining_output_billions: 9.8,
      tourism_visitor_millions: 40.8,
      data_center_investment_billions: 5.0,
      cleantech_investment_billions: 3.2,
      data_period: "2024",
    },

    // SSBCI program metrics
    ssbciMetrics: {
      total_allocation: 52,
      deployed: 18.4,
      leverage_ratio: 3.3,
      companies_funded: 35,
      jobs_created_estimated: 850,
      data_period: "2025-Q1",
    },

    // Tax advantage indicators
    taxAdvantages: [
      "No state personal income tax",
      "No state corporate income tax",
      "No franchise tax",
      "No inventory tax",
      "Foreign trade zones available",
      "Modified business tax on payroll only (1.378%)",
      "GOED tax abatements for qualifying businesses",
      "Opportunity Zones in Las Vegas and Reno",
    ]
  }
};


// ── REGULATORY LAYER ──

export const REGULATORY_LAYER = {
  layerId: "regulatory",
  type: "regulatory",
  source: "Federal Register, NV Legislature, NV Gaming Control Board, SEC, EPA, DOE",
  timestamp: "2025-02-20",
  refreshFrequency: "monthly",
  data: {
    // Regulatory environment scoring by sector
    sectorRegulatorySummary: {
      "AI":           { bodies: ["NIST", "FTC", "SEC"], burden: "moderate",   trend: "increasing",  nv_specific: ["NV AB 431"] },
      "Cybersecurity":{ bodies: ["CISA", "NIST", "FedRAMP"], burden: "moderate", trend: "stable", nv_specific: [] },
      "Gaming":       { bodies: ["NV Gaming Control Board", "NV Gaming Commission"], burden: "high", trend: "stable", nv_specific: ["Cashless gaming standards", "Digital wagering rules"] },
      "Cleantech":    { bodies: ["EPA", "DOE", "BLM"], burden: "high", trend: "supportive", nv_specific: ["NV RPS mandate", "GOED abatements"] },
      "Mining":       { bodies: ["BLM", "EPA", "NV NDEP"], burden: "very_high", trend: "stable", nv_specific: ["NV Mining Tax", "Water rights", "NEPA reviews"] },
      "Cannabis":     { bodies: ["NV Cannabis Compliance Board", "FinCEN"], burden: "very_high", trend: "evolving", nv_specific: ["Consumption lounge rules", "Social equity provisions"] },
      "Healthcare":   { bodies: ["FDA", "CMS", "State Medical Boards"], burden: "high", trend: "stable", nv_specific: ["Telehealth parity law"] },
      "Fintech":      { bodies: ["SEC", "FinCEN", "CFPB"], burden: "high", trend: "increasing", nv_specific: ["NV Money Transmitter Act"] },
      "Defense":      { bodies: ["DoD", "ITAR/EAR", "CFIUS"], burden: "very_high", trend: "stable", nv_specific: ["Nellis AFB presence", "NTTR"] },
      "Data Center":  { bodies: ["NV PUC", "EPA", "DOE"], burden: "moderate", trend: "increasing", nv_specific: ["NV data center energy tariffs", "Water usage reporting"] },
      "IoT":          { bodies: ["FCC", "NIST"], burden: "low", trend: "stable", nv_specific: [] },
      "Blockchain":   { bodies: ["SEC", "FinCEN", "NV SOS"], burden: "moderate", trend: "evolving", nv_specific: ["NV blockchain law (SB 398)"] },
      "Education":    { bodies: ["FTC (COPPA)", "US Dept of Education"], burden: "moderate", trend: "increasing", nv_specific: ["NV student data privacy"] },
    },

    // Docket status distribution (computed from REGULATORY_DOCKETS in App.jsx)
    docketStatusCounts: {
      proposed: 7,
      active: 8,
      finalized: 3,
    },

    // Impact scoring methodology
    impactScoring: {
      description: "Regulatory outlook computed per docket using: severity (1-5) x breadth (0-1) x timeline weight (near=1.0, medium=0.7, long=0.4). Net outlook = supportiveness - burden, scaled 0-100.",
      timelineWeights: { near: 1.0, medium: 0.7, long: 0.4 },
      formula: "RAO = sum(severity * breadth * timelineWeight * netOutlook) / N",
    }
  }
};


// ── NETWORK LAYER ──

export const NETWORK_LAYER = {
  layerId: "network",
  type: "network",
  source: "Ontology graph derived from VERIFIED_EDGES, Crunchbase, PitchBook",
  timestamp: "2025-02-20",
  refreshFrequency: "weekly",
  data: {
    // Network analysis methodology
    methodology: {
      description: "Network metrics computed from the BBI ontology graph using force-directed layout and community detection.",
      algorithms: {
        layout: "D3 force simulation with configurable link distance, charge, and collision",
        community: "Louvain-style modularity optimization for community assignment",
        centrality: "Degree centrality, betweenness centrality, and eigenvector centrality",
        influence: "PageRank-style influence scoring weighted by edge type and funding magnitude",
      }
    },

    // Relationship type weights for influence scoring
    edgeWeights: {
      invested_in:        1.0,
      acquired:           1.0,
      loaned_to:          0.8,
      grants_to:          0.7,
      funds:              0.9,
      contracts_with:     0.6,
      partners_with:      0.5,
      collaborated_with:  0.4,
      accelerated_by:     0.6,
      won_pitch:          0.5,
      incubated_by:       0.5,
      program_of:         0.3,
      supports:           0.3,
      housed_at:          0.2,
      eligible_for:       0.2,
      operates_in:        0.1,
      headquartered_in:   0.1,
      listed_on:          0.3,
      founder_of:         0.8,
      manages:            0.7,
      approved_by:        0.4,
      filed_with:         0.3,
      competes_with:      0.2,
    },

    // Community detection configuration
    communityConfig: {
      minCommunitySize: 3,
      resolution: 1.0,
      maxCommunities: 16,
      colorPalette: [
        "#C8A55A", "#4ECDC4", "#5B8DEF", "#9B72CF", "#E8945A",
        "#E85D5D", "#5BC0DE", "#D46B9E", "#8BC34A", "#26A69A",
        "#E57373", "#64B5F6", "#FFD54F", "#AED581", "#BA68C8", "#4DD0E1"
      ],
    },

    // Key structural holes and bridge nodes (precomputed hints)
    structuralInsights: {
      keyBridgeEntities: [
        { id: "e_goed",       role: "Central hub connecting SSBCI funds, accelerators, and state incentives" },
        { id: "a_startupnv",  role: "Primary pipeline for early-stage companies to FundNV and 1864 Fund" },
        { id: "x_doe",        role: "Federal bridge connecting cleantech companies to loan programs" },
        { id: "a_blackfire",  role: "Innovation hub bridging UNLV, gaming corporations, and accelerators" },
      ],
      denseClusters: [
        { name: "SSBCI Cluster",   nodes: ["f_bbv", "f_fundnv", "f_1864", "x_ssbci", "e_goed"] },
        { name: "Cleantech/Energy", nodes: ["c_1", "c_29", "c_49", "c_50", "c_73", "c_74", "x_doe"] },
        { name: "Gaming/Hospitality", nodes: ["c_27", "c_28", "c_54", "c_69", "c_71", "a_blackfire", "a_zerolabs", "x_caesars", "x_mgm"] },
        { name: "StartUpNV Pipeline", nodes: ["a_startupnv", "f_fundnv", "f_1864", "a_angelnv"] },
      ]
    }
  }
};


// ── DEMOGRAPHIC LAYER ──

export const DEMOGRAPHIC_LAYER = {
  layerId: "demographic",
  type: "demographic",
  source: "US Census ACS, BLS, UNLV Lincy Institute, NV DETR",
  timestamp: "2025-01-15",
  refreshFrequency: "annually",
  data: {
    // Population and growth
    population: {
      state_total: 3200000,
      las_vegas_msa: 2300000,
      reno_msa: 500000,
      henderson: 320000,
      yoy_growth_pct: 1.5,
      median_age: 38.2,
      data_year: 2024,
    },

    // Workforce characteristics
    workforce: {
      labor_force: 1600000,
      labor_force_participation_rate: 62.3,
      unemployment_rate: 5.2,
      stem_workers_pct: 5.8,
      tech_job_openings: 8500,
      avg_commute_minutes: 25,
      remote_work_pct: 18.5,
      data_period: "2024-Q4",
    },

    // Education attainment (age 25+)
    education: {
      high_school_or_higher_pct: 87.5,
      bachelors_or_higher_pct: 26.2,
      graduate_or_professional_pct: 9.8,
      stem_degrees_annual: 4200,
      community_college_enrollment: 85000,
      university_enrollment: 52000,
      data_year: 2024,
      institutions: [
        { name: "UNLV", enrollment: 31000, focus: "Hospitality, Engineering, Health Sciences, Computer Science" },
        { name: "UNR",  enrollment: 21000, focus: "Engineering, Mining, Business, Computer Science" },
        { name: "CSN",  enrollment: 42000, focus: "Technology, Healthcare, Trades" },
        { name: "TMCC", enrollment: 12000, focus: "Advanced Manufacturing, Technology, STEM" },
        { name: "WNC",  enrollment: 4000,  focus: "Trades, Technology" },
        { name: "NSU",  enrollment: 6000,  focus: "Health Sciences, Nursing" },
      ]
    },

    // Diversity and inclusion
    diversity: {
      hispanic_latino_pct: 30.5,
      white_non_hispanic_pct: 45.2,
      black_african_american_pct: 11.8,
      asian_pct: 10.3,
      native_american_pct: 1.4,
      two_or_more_pct: 5.8,
      foreign_born_pct: 20.2,
      data_year: 2024,
    }
  }
};


// ── EXPORTS ──

export const CONTEXT_LAYERS = {
  geospatial: GEOSPATIAL_LAYER,
  temporal: TEMPORAL_LAYER,
  economic: ECONOMIC_LAYER,
  regulatory: REGULATORY_LAYER,
  network: NETWORK_LAYER,
  demographic: DEMOGRAPHIC_LAYER,
};

/**
 * Get a context layer by ID.
 * @param {string} layerId
 * @returns {object|undefined}
 */
export function getLayer(layerId) {
  return CONTEXT_LAYERS[layerId];
}

/**
 * Get all context layer IDs.
 * @returns {string[]}
 */
export function getLayerIds() {
  return Object.keys(CONTEXT_LAYERS);
}
