// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — GEOSPATIAL CONTEXT LAYER
// Nevada Innovation Zones, Key Infrastructure, and Ecosystem Geography
// Sources: Switch.com, Tesla IR, UNLV, UNR, GOED, EDAWN, LVGEA, Wikipedia,
//          Google Maps, Clark County GIS, Washoe County GIS, public filings
// Last updated: 2026-02-28
// ============================================================

// ── NEVADA INNOVATION ZONES & CORRIDORS ──
export const INNOVATION_ZONES = [
  {
    id: "lv_tech_corridor",
    name: "Las Vegas Tech Corridor",
    type: "tech_corridor",
    description: "Southern Nevada's primary technology and innovation belt stretching from Downtown Las Vegas through Summerlin and into Henderson. Home to the majority of Nevada's startup ecosystem, accelerators, and venture capital activity.",
    regions: [
      {
        name: "Downtown Las Vegas",
        center: { lat: 36.1699, lng: -115.1398 },
        description: "Urban innovation hub anchored by Zappos HQ (now Amazon), Downtown Project revitalization, and growing co-working ecosystem. International Innovation Center at World Market Center.",
        keyFeatures: ["Downtown Project ecosystem", "Zappos/Amazon campus", "Co-working density", "Arts District tech offices"]
      },
      {
        name: "Summerlin",
        center: { lat: 36.1872, lng: -115.3360 },
        description: "Master-planned community in west Las Vegas with growing tech office presence. Home to several gaming technology and enterprise software companies.",
        keyFeatures: ["Howard Hughes Corp master plan", "Tech office parks", "High quality of life for talent attraction"]
      },
      {
        name: "Henderson",
        center: { lat: 36.0395, lng: -114.9817 },
        description: "Second-largest city in Nevada with significant cleantech and advanced manufacturing presence. Henderson Business Resource Center and growing tech corridor along St. Rose Parkway.",
        keyFeatures: ["Henderson Business Resource Center", "Water Street District revitalization", "Amerityre manufacturing", "Drone Logistics Ecosystem"]
      }
    ],
    metrics: {
      estimatedCompanies: 350,
      estimatedTechJobs: 25000,
      averageOfficeRate: 28.50, // $/sqft/year, Class A
      acceleratorsPresent: ["StartUpNV", "AngelNV", "UNLV Black Fire Innovation"]
    }
  },
  {
    id: "reno_tahoe_hub",
    name: "Reno-Tahoe Tech Hub",
    type: "tech_hub",
    description: "Northern Nevada's innovation center spanning UNR, Midtown Reno, and the South Meadows business parks. Known for cleantech, biotech, and the University-driven innovation pipeline.",
    regions: [
      {
        name: "UNR / University District",
        center: { lat: 39.5436, lng: -119.8157 },
        description: "University of Nevada, Reno campus and surrounding innovation ecosystem. Home to the Innevation Center, Nevada Center for Applied Research, and DeLaMare Science & Engineering Library makerspace.",
        keyFeatures: ["Innevation Center coworking", "Nevada Center for Applied Research", "UNR STEM programs", "Knowledge Fund grants"]
      },
      {
        name: "Midtown Reno",
        center: { lat: 39.5150, lng: -119.8100 },
        description: "Walkable urban district with creative tech offices, startup-friendly spaces, and growing density of small tech companies and remote workers.",
        keyFeatures: ["Creative office space", "Startup community density", "Affordable rents vs Bay Area", "Lifestyle appeal for talent"]
      },
      {
        name: "South Meadows",
        center: { lat: 39.4300, lng: -119.7700 },
        description: "Southern Reno business park zone with corporate offices and tech company headquarters including IGT, Ormat Technologies, and growing life sciences presence.",
        keyFeatures: ["Corporate HQ campuses", "IGT global headquarters", "Ormat Technologies HQ", "Proximity to airport"]
      }
    ],
    metrics: {
      estimatedCompanies: 180,
      estimatedTechJobs: 12000,
      averageOfficeRate: 22.75, // $/sqft/year, Class A
      acceleratorsPresent: ["StartUpNV (Reno)", "Sierra Angels", "Ozmen Center for Entrepreneurship"]
    }
  },
  {
    id: "northern_nv_industrial",
    name: "Northern Nevada Industrial Zone",
    type: "industrial_zone",
    description: "Massive industrial corridor along I-80 east of Reno centered on the Tahoe Reno Industrial Center (TRIC) and USA Parkway. Home to Tesla Gigafactory, Switch data centers, and major advanced manufacturing and logistics operations.",
    regions: [
      {
        name: "Tahoe Reno Industrial Center (TRIC)",
        center: { lat: 39.5150, lng: -119.4830 },
        description: "Largest industrial park in the world at over 107,000 acres (166 sq mi) in Storey County. Home to Tesla Gigafactory, Blockchains LLC, Redler Industries, and 100+ companies. Foreign Trade Zone #89.",
        keyFeatures: ["107,000+ acres", "Tesla Gigafactory", "Switch Citadel Campus", "Foreign Trade Zone #89", "Blockchains LLC 67,000 acres"]
      },
      {
        name: "USA Parkway Corridor",
        center: { lat: 39.4600, lng: -119.4200 },
        description: "30-mile corridor connecting I-80 to US-50 through Lyon County. Emerging logistics and distribution hub with proximity to TRIC.",
        keyFeatures: ["I-80 to US-50 connection", "Distribution and logistics", "Emerging industrial development"]
      }
    ],
    metrics: {
      estimatedCompanies: 150,
      estimatedManufacturingJobs: 18000,
      totalAcreage: 107000,
      majorEmployers: ["Tesla", "Switch", "Panasonic Energy", "Blockchains LLC", "Google (data center)"]
    }
  },
  {
    id: "southern_nv_clean_energy",
    name: "Southern Nevada Clean Energy Zone",
    type: "clean_energy_zone",
    description: "Solar energy corridor from Boulder City south to Primm along I-15 and I-11. One of the highest solar irradiance zones in the US, hosting utility-scale solar farms and related clean energy infrastructure.",
    regions: [
      {
        name: "Boulder City Solar Corridor",
        center: { lat: 35.9789, lng: -114.8325 },
        description: "Major solar installation area south of Boulder City. Home to multiple utility-scale solar farms including the 690 MW Gemini Solar Project (one of the largest in the US).",
        keyFeatures: ["Gemini Solar Project (690 MW)", "Copper Mountain Solar", "Boulder Solar", "High solar irradiance"]
      },
      {
        name: "Jean / Primm Solar Fields",
        center: { lat: 35.7900, lng: -115.3200 },
        description: "Southern Nevada solar fields near the California border. Includes multiple planned and active solar installations leveraging BLM land.",
        keyFeatures: ["BLM land solar leases", "I-15 corridor access", "CA-NV grid interconnection proximity"]
      }
    ],
    metrics: {
      totalSolarCapacityMW: 3500,
      majorProjects: ["Gemini Solar (690 MW)", "Copper Mountain Solar (802 MW combined phases)", "Boulder Solar (100 MW)"],
      annualSolarIrradiance: 6.5, // kWh/m2/day average
      blmLandAvailable: "Millions of acres of federal land"
    }
  }
];

// ── KEY INFRASTRUCTURE ──
export const KEY_INFRASTRUCTURE = [
  // Data Centers
  {
    id: "switch_supernap",
    name: "Switch LAS VEGAS SUPERNAP",
    type: "data_center",
    operator: "Switch (DigitalBridge)",
    location: {
      address: "7135 S. Decatur Blvd, Las Vegas, NV 89118",
      lat: 36.0580,
      lng: -115.2090,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "One of the world's largest data center campuses. The SuperNAP facility exceeds 3.5 million square feet with patented cooling (T-SCIF) and 100% renewable energy commitment. Tier IV Gold certified.",
    metrics: {
      squareFootage: 3500000,
      powerCapacityMW: 400,
      tier: "Tier IV Gold",
      pue: 1.18,
      renewableEnergy: true,
      yearOpened: 2000
    },
    ecosystemRelevance: "Critical infrastructure enabling cloud, AI, and enterprise workloads in Nevada. Anchor tenant for Las Vegas tech ecosystem. Powers TensorWave GPU cloud operations.",
    relatedCompanies: ["TensorWave", "CIQ", "Cloudforce Networks"]
  },
  {
    id: "switch_citadel",
    name: "Switch Citadel Campus",
    type: "data_center",
    operator: "Switch (DigitalBridge)",
    location: {
      address: "Tahoe Reno Industrial Center, Storey County, NV",
      lat: 39.5170,
      lng: -119.4830,
      city: "McCarran",
      county: "Storey County"
    },
    description: "Northern Nevada hyperscale data center campus in TRIC. Multi-building campus supporting enterprise, government, and hyperscale cloud customers. Fiber connectivity to Reno and Bay Area.",
    metrics: {
      squareFootage: 1800000,
      powerCapacityMW: 200,
      tier: "Tier IV",
      renewableEnergy: true,
      yearOpened: 2017
    },
    ecosystemRelevance: "Northern Nevada data center anchor. Provides infrastructure for Reno-area tech companies and supports TRIC industrial ecosystem.",
    relatedCompanies: ["Blockchains LLC"]
  },
  {
    id: "switch_reno_tahoe",
    name: "Switch Reno Tahoe",
    type: "data_center",
    operator: "Switch (DigitalBridge)",
    location: {
      address: "6505 S. Virginia St, Reno, NV 89511",
      lat: 39.4540,
      lng: -119.7740,
      city: "Reno",
      county: "Washoe County"
    },
    description: "Reno-area data center facility in South Meadows business district. Edge data center serving Northern Nevada enterprise and tech startups.",
    metrics: {
      squareFootage: 300000,
      tier: "Tier III+",
      renewableEnergy: true,
      yearOpened: 2010
    },
    ecosystemRelevance: "Local data center for Reno-based startups and enterprises.",
    relatedCompanies: []
  },

  // Manufacturing / Industrial
  {
    id: "tesla_gigafactory",
    name: "Tesla Gigafactory Nevada (Giga Nevada)",
    type: "advanced_manufacturing",
    operator: "Tesla / Panasonic Energy",
    location: {
      address: "1 Electric Avenue, Sparks, NV 89434",
      lat: 39.5380,
      lng: -119.4430,
      city: "Sparks",
      county: "Storey County"
    },
    description: "One of the world's largest buildings by footprint (~5.3 million sq ft). Produces lithium-ion battery cells (with Panasonic), battery packs, Tesla Semi electric truck, and energy storage products. Approximately $6.2B invested. Major expansion announced in 2023 for 4680 battery cell production.",
    metrics: {
      squareFootage: 5300000,
      investmentBillions: 6.2,
      employees: 11000,
      annualBatteryCapacityGWh: 37,
      yearOpened: 2016,
      products: ["Battery cells (2170, 4680)", "Battery packs", "Tesla Semi", "Powerwall", "Megapack"]
    },
    ecosystemRelevance: "Anchor of Nevada's advanced manufacturing ecosystem. Catalyst for battery/EV supply chain development. Directly enabled Redwood Materials, attracted lithium mining companies (Ioneer, Lithium Americas). Largest private employer in Northern Nevada.",
    relatedCompanies: ["Redwood Materials", "Dragonfly Energy", "Aqua Metals", "Ioneer", "Lyten"]
  },

  // Universities / Innovation Centers
  {
    id: "unlv_campus",
    name: "University of Nevada, Las Vegas (UNLV)",
    type: "university",
    operator: "Nevada System of Higher Education (NSHE)",
    location: {
      address: "4505 S. Maryland Pkwy, Las Vegas, NV 89154",
      lat: 36.1085,
      lng: -115.1432,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "Carnegie R1 research university with 31,000+ students. Key STEM programs in engineering, computer science, and hospitality management. Home to Black Fire Innovation, the Harry Reid Research & Technology Park, and the International Gaming Institute.",
    metrics: {
      enrollment: 31000,
      stemGraduatesPerYear: 2200,
      researchExpenditureMillions: 145,
      carnegieClassification: "R1: Very High Research Activity"
    },
    ecosystemRelevance: "Primary talent pipeline for Southern Nevada tech ecosystem. Black Fire Innovation provides direct startup-university collaboration.",
    relatedCompanies: ["Amira Learning", "Cognizer AI", "SiO2 Materials"]
  },
  {
    id: "black_fire_innovation",
    name: "Black Fire Innovation",
    type: "innovation_center",
    operator: "UNLV",
    location: {
      address: "8400 W. Sunset Rd, Las Vegas, NV 89113",
      lat: 36.0684,
      lng: -115.2496,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "UNLV's 40,000 sq ft innovation center on the Harry Reid Research & Technology Park. Houses startups, corporate innovation labs, and university-industry R&D partnerships. Focus areas include gaming technology, cybersecurity, autonomous systems, and smart city technology.",
    metrics: {
      squareFootage: 40000,
      yearOpened: 2019,
      tenantsCapacity: 50,
      focusAreas: ["Gaming technology", "Cybersecurity", "Autonomous systems", "Smart cities", "Hospitality tech"]
    },
    ecosystemRelevance: "Bridge between UNLV research and commercial startups. Key incubation space for Southern Nevada innovation ecosystem.",
    relatedCompanies: ["Nevada Nano", "WaterStart"]
  },
  {
    id: "unr_campus",
    name: "University of Nevada, Reno (UNR)",
    type: "university",
    operator: "Nevada System of Higher Education (NSHE)",
    location: {
      address: "1664 N. Virginia St, Reno, NV 89557",
      lat: 39.5436,
      lng: -119.8157,
      city: "Reno",
      county: "Washoe County"
    },
    description: "Nevada's land-grant university and R1 research institution with 21,000+ students. Strong programs in engineering, mining/metallurgy, seismology, and computer science. Home to the Nevada Center for Applied Research (NCAR).",
    metrics: {
      enrollment: 21000,
      stemGraduatesPerYear: 1500,
      researchExpenditureMillions: 180,
      carnegieClassification: "R1: Very High Research Activity"
    },
    ecosystemRelevance: "Primary talent pipeline for Northern Nevada. Strong mining engineering, materials science, and environmental science programs feed cleantech ecosystem.",
    relatedCompanies: ["Filament Health", "Vibrant Planet", "Comstock Mining"]
  },
  {
    id: "innevation_center",
    name: "Innevation Center",
    type: "innovation_center",
    operator: "UNR / powered by Switch",
    location: {
      address: "450 Sinclair St, Reno, NV 89501",
      lat: 39.5288,
      lng: -119.8092,
      city: "Reno",
      county: "Washoe County"
    },
    description: "Northern Nevada's flagship co-working, events, and innovation space powered by Switch. Over 20,000 sq ft of collaborative workspace. Hosts startup events, hackathons, mentor sessions, and community programs. Connected to UNR's entrepreneurship ecosystem.",
    metrics: {
      squareFootage: 20000,
      yearOpened: 2013,
      annualEventsHosted: 200,
      focusAreas: ["Startup community", "Co-working", "Mentorship", "Events"]
    },
    ecosystemRelevance: "Hub of Northern Nevada startup community. Hosts Sierra Angels pitch events, StartUpNV programs, and community meetups.",
    relatedCompanies: ["Base Venture", "Talentel", "Now Ads"]
  },

  // Airports / Logistics
  {
    id: "harry_reid_airport",
    name: "Harry Reid International Airport (LAS)",
    type: "logistics_hub",
    operator: "Clark County Department of Aviation",
    location: {
      address: "5757 Wayne Newton Blvd, Las Vegas, NV 89119",
      lat: 36.0840,
      lng: -115.1537,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "One of the busiest airports in the US with 57+ million annual passengers (2024). Major logistics and connectivity hub for Southern Nevada tech ecosystem. Provides global connectivity for business travel and freight. Formerly McCarran International Airport, renamed in 2021.",
    metrics: {
      annualPassengers: 57000000,
      cargoTonsPerYear: 130000,
      iataCode: "LAS",
      terminals: 2,
      gates: 110
    },
    ecosystemRelevance: "Primary connectivity hub for Las Vegas tech ecosystem. Enables business travel for investors, customers, and partners. CES and trade show logistics.",
    relatedCompanies: ["Kaptyn"]
  },
  {
    id: "reno_tahoe_airport",
    name: "Reno-Tahoe International Airport (RNO)",
    type: "logistics_hub",
    operator: "Reno-Tahoe Airport Authority",
    location: {
      address: "2001 E. Plumb Lane, Reno, NV 89502",
      lat: 39.4991,
      lng: -119.7681,
      city: "Reno",
      county: "Washoe County"
    },
    description: "Northern Nevada's primary commercial airport. Growing passenger volumes with increasing direct flights to tech hubs (SFO, SJC, SEA, LAX). Adjacent to planned Lyten gigafactory at Reno AirLogistics Park.",
    metrics: {
      annualPassengers: 5500000,
      iataCode: "RNO",
      directFlights: 25
    },
    ecosystemRelevance: "Bay Area connectivity for Northern Nevada tech ecosystem. Lyten gigafactory site at adjacent AirLogistics Park.",
    relatedCompanies: ["Lyten"]
  },

  // Logistics Corridors
  {
    id: "i80_corridor",
    name: "I-80 Logistics Corridor",
    type: "logistics_corridor",
    route: "San Francisco Bay Area to Salt Lake City via Reno, TRIC, and Elko",
    coordinates: [
      { lat: 39.5250, lng: -119.8100, label: "Reno" },
      { lat: 39.5150, lng: -119.4830, label: "TRIC" },
      { lat: 39.5297, lng: -118.7764, label: "Lovelock" },
      { lat: 40.8324, lng: -115.7631, label: "Elko" }
    ],
    description: "Critical east-west transportation artery connecting Bay Area markets to TRIC, Reno, and points east. Primary goods movement corridor for Tesla Gigafactory, Amazon distribution, and advanced manufacturing supply chains.",
    ecosystemRelevance: "Enables supply chain operations for TRIC manufacturers. Tesla Semi route. Key distribution corridor for Northern Nevada industrial ecosystem."
  },
  {
    id: "i15_corridor",
    name: "I-15 Logistics Corridor",
    type: "logistics_corridor",
    route: "Los Angeles to Salt Lake City via Las Vegas and Mesquite",
    coordinates: [
      { lat: 35.6100, lng: -115.3900, label: "Primm (CA/NV Border)" },
      { lat: 36.0800, lng: -115.1700, label: "Las Vegas" },
      { lat: 36.8100, lng: -114.0600, label: "Mesquite" }
    ],
    description: "Major north-south corridor connecting Las Vegas to Los Angeles (4 hours) and Salt Lake City (6 hours). Solar energy corridor. Key goods movement route for Southern Nevada.",
    ecosystemRelevance: "LA-Vegas connectivity for tech ecosystem. Solar energy transmission corridor. Key for Bombard Renewable Energy projects."
  },

  // Military / Defense
  {
    id: "nttr",
    name: "Nevada Test and Training Range (NTTR)",
    type: "military_facility",
    operator: "US Air Force / Nellis AFB",
    location: {
      lat: 37.2350,
      lng: -116.0500,
      city: "Nellis AFB vicinity",
      county: "Nye / Lincoln / Clark Counties"
    },
    description: "Largest contiguous air and ground space for peacetime military operations in the free world. Over 12,000 square miles. Used for advanced weapons testing, drone/UAS operations, electronic warfare, and counter-UAS development.",
    metrics: {
      squareMiles: 12000,
      primaryBase: "Nellis AFB",
      capabilities: ["Live fire ranges", "Electronic warfare", "Drone testing", "Counter-UAS", "Red Flag exercises"]
    },
    ecosystemRelevance: "Primary testing ground for Nevada defense-tech startups. Enables Skydio Gov, fibrX, and Sierra Nevada Corp operations and testing.",
    relatedCompanies: ["Sierra Nevada Corp", "Skydio Gov", "fibrX", "Nevada Nano"]
  },
  {
    id: "creech_afb",
    name: "Creech Air Force Base",
    type: "military_facility",
    operator: "US Air Force",
    location: {
      lat: 36.5822,
      lng: -115.6711,
      city: "Indian Springs",
      county: "Clark County"
    },
    description: "Home of the 432nd Wing, the Air Force's premier remotely piloted aircraft (RPA/drone) wing. Primary command and control for MQ-9 Reaper operations worldwide.",
    ecosystemRelevance: "Drone operations expertise hub. Potential customer and partner for Nevada defense-tech companies developing autonomous and counter-UAS systems."
  }
];

// ── ECOSYSTEM HUBS ──
export const ECOSYSTEM_HUBS = [
  {
    id: "startupnv_lv",
    name: "StartUpNV (Las Vegas HQ)",
    type: "accelerator",
    location: {
      lat: 36.1625,
      lng: -115.1490,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "Nevada's statewide nonprofit startup accelerator. Runs FundNV, AngelNV, and statewide startup programs. Over 400 startups supported since founding.",
    programs: ["FundNV", "AngelNV", "Pitch Day", "Mentor Network", "Veterans Accelerator"]
  },
  {
    id: "adams_hub",
    name: "Adams Hub for Innovation",
    type: "accelerator",
    location: {
      lat: 39.1638,
      lng: -119.7674,
      city: "Carson City",
      county: "Carson City"
    },
    description: "Carson City-based startup accelerator and co-working space. Supports early-stage companies in the capital region. Graduates include Base Venture, Now Ads, and Talentel.",
    programs: ["Startup Accelerator", "Co-working", "Mentorship"]
  },
  {
    id: "lvgea",
    name: "Las Vegas Global Economic Alliance (LVGEA)",
    type: "economic_development",
    location: {
      lat: 36.1630,
      lng: -115.1480,
      city: "Las Vegas",
      county: "Clark County"
    },
    description: "Regional economic development organization for Southern Nevada. Assists with business relocation, expansion, and workforce development.",
    programs: ["Business attraction", "Workforce development", "Innovation initiatives"]
  },
  {
    id: "edawn",
    name: "Economic Development Authority of Western Nevada (EDAWN)",
    type: "economic_development",
    location: {
      lat: 39.5296,
      lng: -119.8138,
      city: "Reno",
      county: "Washoe County"
    },
    description: "Regional economic development authority for Washoe County and surrounding areas. Key role in attracting Tesla, Panasonic, Switch, and other major employers to Northern Nevada.",
    programs: ["Business attraction", "Workforce development", "Innovation initiatives", "TRIC coordination"]
  }
];

// ── GEOGRAPHIC BOUNDARIES ──
export const REGION_BOUNDARIES = {
  las_vegas: {
    name: "Greater Las Vegas",
    center: { lat: 36.1699, lng: -115.1398 },
    boundingBox: { north: 36.35, south: 35.90, east: -114.90, west: -115.45 },
    population: 2265000,
    counties: ["Clark County"]
  },
  henderson: {
    name: "Henderson",
    center: { lat: 36.0395, lng: -114.9817 },
    boundingBox: { north: 36.10, south: 35.95, east: -114.85, west: -115.12 },
    population: 320000,
    counties: ["Clark County"]
  },
  reno: {
    name: "Greater Reno-Sparks",
    center: { lat: 39.5296, lng: -119.8138 },
    boundingBox: { north: 39.65, south: 39.40, east: -119.65, west: -119.95 },
    population: 490000,
    counties: ["Washoe County", "Storey County"]
  },
  carson_city: {
    name: "Carson City",
    center: { lat: 39.1638, lng: -119.7674 },
    boundingBox: { north: 39.22, south: 39.10, east: -119.70, west: -119.85 },
    population: 58000,
    counties: ["Carson City (independent city)"]
  },
  rural: {
    name: "Rural Nevada",
    center: { lat: 39.0000, lng: -117.0000 },
    description: "Balance of state including Elko, Nye, Esmeralda, and other counties. Key for mining, energy, and defense/aerospace operations.",
    population: 310000,
    counties: ["Nye", "Elko", "Lyon", "Churchill", "Esmeralda", "Humboldt", "Lander", "White Pine", "Mineral", "Pershing", "Eureka", "Lincoln", "Douglas"]
  }
};

// ── MAP LAYER CONFIGURATION ──
export const MAP_CONFIG = {
  defaultCenter: { lat: 38.5, lng: -117.0 },
  defaultZoom: 7,
  layerColors: {
    innovation_zone: "#C49A38",    // GOLD
    data_center: "#5088A8",        // BLUE
    university: "#8868A8",         // PURPLE
    innovation_center: "#4E9B60",  // GREEN
    logistics_hub: "#D4864A",      // ORANGE
    military_facility: "#C25550",  // RED
    accelerator: "#4E9B60",        // GREEN
    economic_development: "#706C64", // MUTED
    advanced_manufacturing: "#D4864A", // ORANGE
    clean_energy_zone: "#4E9B60",  // GREEN
    logistics_corridor: "#706C64"  // MUTED
  },
  clusterRadius: 50,
  maxZoom: 18,
  minZoom: 6
};

export default {
  INNOVATION_ZONES,
  KEY_INFRASTRUCTURE,
  ECOSYSTEM_HUBS,
  REGION_BOUNDARIES,
  MAP_CONFIG
};
