// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — TEMPORAL CONTEXT LAYER
// Nevada Startup Ecosystem Timeline (2015–2026)
// Sources: Crunchbase, PitchBook, SEC filings, press releases, GOED reports,
//          TechTribune, Nevada Independent, LVRJ, RGJ, StartUpNV, AngelNV
// Last updated: 2026-02-28
// ============================================================

// Impact scores: 1-10 scale where 10 = transformative ecosystem event
// Types: funding, exit, infrastructure, legislation, relocation, accelerator,
//        university, acquisition, ipo, partnership, milestone, award

export const ECOSYSTEM_TIMELINE = [
  // ═══════════════════════════════════════════
  // 2015
  // ═══════════════════════════════════════════
  {
    date: "2015-01-01",
    type: "legislation",
    title: "Nevada Innovation Zones Proposed",
    description: "Governor Sandoval proposes innovation zones legislation allowing tech companies to form local governments in undeveloped areas. Blockchains LLC becomes primary proponent.",
    entities: ["State of Nevada", "Blockchains LLC"],
    impact_score: 6
  },
  {
    date: "2015-06-04",
    type: "legislation",
    title: "Nevada Passes Autonomous Vehicle Regulations",
    description: "Nevada becomes one of the first states with comprehensive autonomous vehicle testing regulations, attracting AV companies and establishing the state as a testing destination.",
    entities: ["State of Nevada", "NDOT"],
    impact_score: 7
  },
  {
    date: "2015-09-01",
    type: "relocation",
    title: "Faraday Future Announces North Las Vegas Factory",
    description: "Electric vehicle startup Faraday Future announces $1B factory at APEX industrial park in North Las Vegas. Later scaled back but signaled EV interest in Nevada.",
    entities: ["Faraday Future", "City of North Las Vegas"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2016
  // ═══════════════════════════════════════════
  {
    date: "2016-01-01",
    type: "infrastructure",
    title: "Tesla Gigafactory Begins Battery Production",
    description: "Tesla Gigafactory 1 in Storey County begins battery cell production in partnership with Panasonic. First cells produced for Powerwall and Powerpack energy storage products.",
    entities: ["Tesla", "Panasonic", "Storey County"],
    impact_score: 10
  },
  {
    date: "2016-06-15",
    type: "legislation",
    title: "Nevada Commerce Tax Takes Effect",
    description: "Commerce Tax becomes effective for businesses with $4M+ in Nevada gross revenue. Maintains no personal or corporate income tax while generating state revenue.",
    entities: ["State of Nevada"],
    impact_score: 5
  },
  {
    date: "2016-11-01",
    type: "funding",
    title: "Switch Files for Future IPO",
    description: "Switch, Nevada's hyperscale data center company, begins preparations for public offering, signaling maturity of Nevada's data center ecosystem.",
    entities: ["Switch"],
    impact_score: 6
  },

  // ═══════════════════════════════════════════
  // 2017
  // ═══════════════════════════════════════════
  {
    date: "2017-01-01",
    type: "accelerator",
    title: "StartUpNV Founded",
    description: "StartUpNV launches as Nevada's first statewide startup accelerator and venture catalyst. Founded to build sustainable startup ecosystem infrastructure.",
    entities: ["StartUpNV"],
    impact_score: 8
  },
  {
    date: "2017-07-17",
    type: "funding",
    title: "Redwood Materials Founded by JB Straubel",
    description: "Tesla co-founder JB Straubel founds Redwood Materials in Carson City to recycle lithium-ion batteries and create a circular supply chain for EV batteries.",
    entities: ["Redwood Materials", "JB Straubel"],
    impact_score: 9
  },
  {
    date: "2017-10-06",
    type: "ipo",
    title: "Switch IPO on NYSE",
    description: "Switch Inc goes public on NYSE at $17/share, raising $531M. Valued at approximately $7B. Largest Nevada tech IPO in decades.",
    entities: ["Switch"],
    impact_score: 8
  },
  {
    date: "2017-12-01",
    type: "relocation",
    title: "Boxabl Founded in Las Vegas",
    description: "Boxabl launches in North Las Vegas with mission to revolutionize housing through factory-manufactured foldable homes. The Casita concept begins development.",
    entities: ["Boxabl"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2018
  // ═══════════════════════════════════════════
  {
    date: "2018-01-01",
    type: "infrastructure",
    title: "Tesla Gigafactory Reaches Full Battery Production",
    description: "Gigafactory reaches annualized battery cell production rate of approximately 20 GWh, making it the highest-volume battery plant in the world.",
    entities: ["Tesla", "Panasonic"],
    impact_score: 8
  },
  {
    date: "2018-03-01",
    type: "accelerator",
    title: "AngelNV Launches First Cohort",
    description: "StartUpNV launches AngelNV, an angel investor bootcamp training 40 accredited investors per cohort to invest in Nevada startups. Team-based investing model.",
    entities: ["AngelNV", "StartUpNV"],
    impact_score: 7
  },
  {
    date: "2018-06-01",
    type: "relocation",
    title: "Blockchains LLC Acquires 67,000 Acres in TRIC",
    description: "Blockchains LLC purchases 67,000 acres in Storey County for a planned blockchain-based smart city and innovation park. One of the largest private land purchases in Nevada history.",
    entities: ["Blockchains LLC", "Storey County"],
    impact_score: 7
  },
  {
    date: "2018-09-15",
    type: "funding",
    title: "MNTN Founded in Las Vegas",
    description: "MNTN (formerly SteelHouse) launches performance-connected TV advertising platform in Las Vegas. Ryan Reynolds later joins as Chief Creative Officer.",
    entities: ["MNTN"],
    impact_score: 5
  },
  {
    date: "2018-11-01",
    type: "funding",
    title: "Abnormal Security Founded",
    description: "Abnormal Security (later Abnormal AI) founded with AI-native approach to email security. Initially HQ in San Francisco with Las Vegas engineering presence.",
    entities: ["Abnormal AI"],
    impact_score: 6
  },

  // ═══════════════════════════════════════════
  // 2019
  // ═══════════════════════════════════════════
  {
    date: "2019-03-01",
    type: "university",
    title: "UNLV Black Fire Innovation Opens",
    description: "UNLV opens Black Fire Innovation center at Harry Reid Research & Technology Park. 40,000 sq ft facility bridges university research and commercial startups.",
    entities: ["UNLV", "Black Fire Innovation"],
    impact_score: 7
  },
  {
    date: "2019-06-01",
    type: "legislation",
    title: "AB 75 Passes — Nevada Commission on Innovation & Technology",
    description: "Assembly Bill 75 creates the Nevada Commission on Innovation and Technology (NCI/NCIT) to advise the Governor on technology, innovation, and entrepreneurship policy.",
    entities: ["State of Nevada", "NCI"],
    impact_score: 6
  },
  {
    date: "2019-10-01",
    type: "funding",
    title: "Socure Raises $30M Series B",
    description: "Incline Village-based Socure raises $30M Series B for digital identity verification platform. Signals growing venture activity in Nevada.",
    entities: ["Socure"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2020
  // ═══════════════════════════════════════════
  {
    date: "2020-03-15",
    type: "milestone",
    title: "COVID-19 Devastates Nevada Tourism Economy",
    description: "Casino closures and travel shutdown hit Nevada harder than most states. Accelerates diversification push away from tourism-dependent economy toward tech and innovation.",
    entities: ["State of Nevada"],
    impact_score: 8
  },
  {
    date: "2020-06-01",
    type: "milestone",
    title: "Remote Work Migration to Nevada Begins",
    description: "COVID-driven remote work trend brings significant inflow of tech workers from California to Reno and Las Vegas. No state income tax becomes powerful draw.",
    entities: ["State of Nevada"],
    impact_score: 8
  },
  {
    date: "2020-09-10",
    type: "funding",
    title: "Redwood Materials Raises $40M Series B",
    description: "Redwood Materials raises $40M led by Capricorn Investment Group. Amazon becomes first major collection partner for battery recycling program.",
    entities: ["Redwood Materials", "Amazon"],
    impact_score: 6
  },
  {
    date: "2020-11-01",
    type: "funding",
    title: "Socure Raises $35M Series C",
    description: "Socure raises $35M Series C, accelerating growth of its identity verification platform. Customer base expanding rapidly.",
    entities: ["Socure"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2021
  // ═══════════════════════════════════════════
  {
    date: "2021-01-04",
    type: "legislation",
    title: "Governor Sisolak Proposes Innovation Zones",
    description: "Governor Sisolak announces Innovation Zones legislation allowing tech companies to create local governments in undeveloped land. Blockchains LLC primary proponent.",
    entities: ["State of Nevada", "Blockchains LLC"],
    impact_score: 7
  },
  {
    date: "2021-03-11",
    type: "legislation",
    title: "American Rescue Plan — SSBCI Reauthorized",
    description: "Federal SSBCI (State Small Business Credit Initiative) reauthorized with $10B nationally. Nevada allocated approximately $91M for small business and startup investment programs.",
    entities: ["US Treasury", "State of Nevada", "GOED"],
    impact_score: 9
  },
  {
    date: "2021-05-01",
    type: "funding",
    title: "Socure Raises $100M Series D at $1.3B",
    description: "Socure raises $100M Series D at $1.3B valuation, becoming Nevada's newest unicorn. Accel leads round.",
    entities: ["Socure", "Accel"],
    impact_score: 8
  },
  {
    date: "2021-06-01",
    type: "accelerator",
    title: "FundNV Launches with SSBCI Backing",
    description: "StartUpNV launches FundNV, a pre-seed fund providing $50K checks to accelerator graduates with SSBCI 1:1 matching. First institutionalized pre-seed capital in Nevada.",
    entities: ["FundNV", "StartUpNV", "SSBCI"],
    impact_score: 7
  },
  {
    date: "2021-07-01",
    type: "funding",
    title: "Redwood Materials Raises $700M Series C",
    description: "Redwood Materials raises $700M Series C at $3.7B valuation. Led by Goldman Sachs. Largest private fundraise in Nevada history at the time.",
    entities: ["Redwood Materials", "Goldman Sachs"],
    impact_score: 9
  },
  {
    date: "2021-09-01",
    type: "funding",
    title: "Hubble Network Founded in Las Vegas",
    description: "Hubble Network founded to build satellite-powered Bluetooth connectivity network. Team from SpaceX, Amazon, and Apple.",
    entities: ["Hubble Network"],
    impact_score: 5
  },
  {
    date: "2021-11-15",
    type: "funding",
    title: "Socure Raises $100M Series E at $4.5B",
    description: "Socure raises additional $100M at $4.5B valuation, led by Tiger Global. One of the highest-valued companies in Nevada.",
    entities: ["Socure", "Tiger Global"],
    impact_score: 7
  },

  // ═══════════════════════════════════════════
  // 2022
  // ═══════════════════════════════════════════
  {
    date: "2022-01-04",
    type: "infrastructure",
    title: "Tesla Announces $3.6B Gigafactory Expansion",
    description: "Tesla announces $3.6B expansion of Gigafactory Nevada for 4680 battery cell production and Tesla Semi manufacturing. Expected to add 3,000 jobs.",
    entities: ["Tesla", "Storey County"],
    impact_score: 9
  },
  {
    date: "2022-03-15",
    type: "funding",
    title: "Redwood Materials Raises $775M Series D",
    description: "Redwood Materials raises $775M Series D. Valuation exceeds $6B. Plans announced for massive expansion at Carson City campus.",
    entities: ["Redwood Materials"],
    impact_score: 8
  },
  {
    date: "2022-05-10",
    type: "legislation",
    title: "Nevada SSBCI Capital Program Approved",
    description: "US Treasury approves Nevada's SSBCI capital deployment plan. Battle Born Venture (BBV) to receive $36M, FundNV $3M, 1864 Fund $10M for startup investment.",
    entities: ["Battle Born Venture", "FundNV", "1864 Fund", "GOED", "US Treasury"],
    impact_score: 9
  },
  {
    date: "2022-06-01",
    type: "infrastructure",
    title: "Tesla Semi Production Begins at Giga Nevada",
    description: "Tesla begins production of the Tesla Semi electric truck at Gigafactory Nevada. First deliveries to PepsiCo in December 2022.",
    entities: ["Tesla", "PepsiCo"],
    impact_score: 7
  },
  {
    date: "2022-09-07",
    type: "acquisition",
    title: "DigitalBridge Acquires Switch for $11B",
    description: "DigitalBridge Group acquires Switch in $11B take-private deal. Largest acquisition of a Nevada-headquartered company. Switch delisted from NYSE.",
    entities: ["Switch", "DigitalBridge"],
    impact_score: 9
  },
  {
    date: "2022-10-01",
    type: "funding",
    title: "DOE Offers Ioneer $700M Conditional Loan",
    description: "Department of Energy offers Ioneer a $700M conditional loan commitment for the Rhyolite Ridge lithium-boron project in Esmeralda County, Nevada.",
    entities: ["Ioneer", "DOE", "Rhyolite Ridge"],
    impact_score: 8
  },
  {
    date: "2022-12-01",
    type: "milestone",
    title: "Tesla Semi First Deliveries",
    description: "Tesla delivers first Semi trucks to PepsiCo from Gigafactory Nevada. Marks Nevada as production site for Class 8 electric trucks.",
    entities: ["Tesla", "PepsiCo"],
    impact_score: 6
  },

  // ═══════════════════════════════════════════
  // 2023
  // ═══════════════════════════════════════════
  {
    date: "2023-02-14",
    type: "funding",
    title: "Redwood Materials Receives $2B DOE Loan",
    description: "Department of Energy finalizes $2B loan to Redwood Materials for battery materials recycling expansion at Carson City. One of the largest DOE clean energy loans.",
    entities: ["Redwood Materials", "DOE"],
    impact_score: 10
  },
  {
    date: "2023-03-01",
    type: "accelerator",
    title: "Battle Born Venture (BBV) First Investments",
    description: "Battle Born Venture begins deploying SSBCI capital alongside private lead investors. Co-invest model matches private VC dollars into Nevada startups.",
    entities: ["Battle Born Venture", "SSBCI", "GOED"],
    impact_score: 8
  },
  {
    date: "2023-04-01",
    type: "funding",
    title: "TensorWave Founded in Las Vegas",
    description: "TensorWave founded to build AMD-powered GPU cloud infrastructure for AI workloads. Based in Las Vegas leveraging Switch data center infrastructure.",
    entities: ["TensorWave", "AMD"],
    impact_score: 7
  },
  {
    date: "2023-06-15",
    type: "funding",
    title: "Abnormal AI Raises $250M Series D at $5.1B",
    description: "Abnormal AI raises $250M at $5.1B valuation. One of the most valuable AI cybersecurity companies globally. Las Vegas engineering hub continues growing.",
    entities: ["Abnormal AI"],
    impact_score: 8
  },
  {
    date: "2023-07-01",
    type: "infrastructure",
    title: "Google Announces Nevada Data Center Expansion",
    description: "Google announces major data center expansion in Storey County near TRIC, joining the growing Northern Nevada data center cluster.",
    entities: ["Google", "Storey County"],
    impact_score: 7
  },
  {
    date: "2023-09-01",
    type: "milestone",
    title: "Hubble Network Achieves First BLE-to-Satellite Connection",
    description: "Hubble Network becomes first company to connect a Bluetooth device directly to a satellite in orbit. Technology breakthrough for IoT connectivity.",
    entities: ["Hubble Network"],
    impact_score: 7
  },
  {
    date: "2023-10-15",
    type: "funding",
    title: "Lyten Raises $200M Series B",
    description: "Lithium-sulfur battery maker Lyten raises $200M Series B. Announces plans for $1B+ gigafactory at Reno AirLogistics Park with 1,000+ jobs.",
    entities: ["Lyten", "Stellantis"],
    impact_score: 8
  },
  {
    date: "2023-11-01",
    type: "relocation",
    title: "Catalent Expands to Las Vegas",
    description: "Pharmaceutical CDMO Catalent expands operations to Southern Nevada, adding biotech manufacturing capacity to the region.",
    entities: ["Catalent"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2024
  // ═══════════════════════════════════════════
  {
    date: "2024-01-09",
    type: "award",
    title: "CES 2024 — Nevada Startups Showcase",
    description: "Multiple Nevada startups showcase at CES 2024 in Las Vegas. Katalyst wins Innovation Award. Nommi demonstrates autonomous food delivery. Global tech attention on Nevada ecosystem.",
    entities: ["Katalyst", "Nommi", "CES"],
    impact_score: 6
  },
  {
    date: "2024-02-01",
    type: "funding",
    title: "TensorWave Raises $43M Seed Round",
    description: "TensorWave raises $43M seed round for AMD GPU cloud platform. One of the largest seed rounds in Nevada history.",
    entities: ["TensorWave", "AMD"],
    impact_score: 7
  },
  {
    date: "2024-03-15",
    type: "accelerator",
    title: "AngelNV 2024 — Record Investment Activity",
    description: "AngelNV 2024 cohort deploys record investment capital into Nevada startups. Tilt wins $200K+ investment from angel investors.",
    entities: ["AngelNV", "Tilt", "StartUpNV"],
    impact_score: 6
  },
  {
    date: "2024-04-01",
    type: "award",
    title: "Hibear Appears on Shark Tank",
    description: "Las Vegas startup Hibear, maker of multifunctional hydro flask, appears on Shark Tank in April 2024. StartUpNV portfolio company gains national exposure.",
    entities: ["Hibear", "StartUpNV"],
    impact_score: 4
  },
  {
    date: "2024-05-01",
    type: "infrastructure",
    title: "Lyten Gigafactory Site Selected — Reno AirLogistics Park",
    description: "Lyten confirms Reno-Tahoe International Airport AirLogistics Park as site for $1B+ lithium-sulfur battery gigafactory. Expected to create 1,000+ jobs at full capacity.",
    entities: ["Lyten", "Reno-Tahoe Airport Authority"],
    impact_score: 8
  },
  {
    date: "2024-06-01",
    type: "acquisition",
    title: "Amira Learning Merges with Istation",
    description: "Las Vegas AI tutoring company Amira Learning merges with Istation. Combined company serves 1,800+ school districts with AI-powered reading instruction.",
    entities: ["Amira Learning", "Istation"],
    impact_score: 5
  },
  {
    date: "2024-07-01",
    type: "infrastructure",
    title: "Redwood Materials Carson City Expansion Operational",
    description: "Redwood Materials expanded Carson City campus reaches operational milestones. Processing increasing volumes of end-of-life batteries and manufacturing scrap.",
    entities: ["Redwood Materials"],
    impact_score: 7
  },
  {
    date: "2024-08-15",
    type: "funding",
    title: "Hubble Network Raises $20M Series A",
    description: "Hubble Network raises $20M Series A for satellite-Bluetooth network expansion. Partnerships with Life360/Tile announced (90M+ devices).",
    entities: ["Hubble Network", "Life360"],
    impact_score: 6
  },
  {
    date: "2024-09-01",
    type: "funding",
    title: "Lyten Raises Additional $225M",
    description: "Lyten raises $225M bringing total to $425M. Accelerates Reno gigafactory construction timeline. Backed by Stellantis, FedEx, Honeywell.",
    entities: ["Lyten", "Stellantis", "FedEx", "Honeywell"],
    impact_score: 7
  },
  {
    date: "2024-10-01",
    type: "milestone",
    title: "Nevada Tech Employment Exceeds 50,000",
    description: "Nevada technology sector employment surpasses 50,000 workers for the first time, marking significant growth in the state's economic diversification efforts.",
    entities: ["State of Nevada", "GOED"],
    impact_score: 6
  },
  {
    date: "2024-11-01",
    type: "funding",
    title: "Nudge Security Raises $22.5M Series A",
    description: "Las Vegas SaaS security company Nudge Security raises $22.5M Series A led by Cerberus Ventures. Tripled ARR in 2024 with ~200 customers including Reddit.",
    entities: ["Nudge Security", "Cerberus Ventures"],
    impact_score: 6
  },
  {
    date: "2024-12-01",
    type: "accelerator",
    title: "1864 Fund Begins SSBCI Deployment",
    description: "1864 Fund begins deploying $10M SSBCI allocation for seed-stage companies in intermountain states, with significant Nevada focus.",
    entities: ["1864 Fund", "SSBCI"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2025
  // ═══════════════════════════════════════════
  {
    date: "2025-01-07",
    type: "award",
    title: "CES 2025 — Katalyst Wins Innovation Award",
    description: "Katalyst wins CES 2025 Innovation Award for Best Fitness Technology. Multiple Nevada startups showcase alongside global tech companies.",
    entities: ["Katalyst", "CES"],
    impact_score: 5
  },
  {
    date: "2025-01-15",
    type: "funding",
    title: "TensorWave Raises $100M Series A",
    description: "TensorWave raises $100M Series A, the largest Series A in Nevada history. 8,192 AMD MI325X GPU cluster deployed. Revenue run-rate exceeds $100M.",
    entities: ["TensorWave", "AMD"],
    impact_score: 9
  },
  {
    date: "2025-02-03",
    type: "funding",
    title: "Redwood Materials $425M Series E",
    description: "Redwood Materials closes $425M Series E with backing from Google Ventures and Nvidia NVentures. Total funding exceeds $4B. Valuation above $6B.",
    entities: ["Redwood Materials", "Google Ventures", "Nvidia"],
    impact_score: 8
  },
  {
    date: "2025-02-05",
    type: "funding",
    title: "Hubble Network Closes $70M Series B",
    description: "Hubble Network closes $70M Series B, bringing total funding to $100M. Seven satellites in orbit. Expanding satellite-Bluetooth network globally.",
    entities: ["Hubble Network"],
    impact_score: 7
  },
  {
    date: "2025-02-14",
    type: "funding",
    title: "MagicDoor Raises $4.5M Seed",
    description: "AI property management platform MagicDoor raises $4.5M seed round co-led by Okapi VC and Shadow Ventures. One of the most promising FundNV portfolio companies.",
    entities: ["MagicDoor", "Okapi VC", "Shadow Ventures", "FundNV"],
    impact_score: 5
  },
  {
    date: "2025-03-01",
    type: "accelerator",
    title: "AngelNV 2025 Cohort — Record Applications",
    description: "AngelNV 2025 receives record applications. Finalists include BuildQ, Cranel, fibrX, and MiOrganics. BuildQ wins and becomes first FundNV2 investment with SSBCI match.",
    entities: ["AngelNV", "BuildQ", "Cranel", "fibrX", "MiOrganics", "FundNV"],
    impact_score: 6
  },
  {
    date: "2025-06-01",
    type: "infrastructure",
    title: "Lyten Reno Gigafactory Breaks Ground",
    description: "Lyten begins construction on lithium-sulfur battery gigafactory at Reno AirLogistics Park. Expected $1B+ investment and 1,000+ jobs at full capacity.",
    entities: ["Lyten"],
    impact_score: 8
  },
  {
    date: "2025-09-01",
    type: "milestone",
    title: "Battle Born Venture Surpasses $14.8M Deployed",
    description: "BBV deploys $14.8M across 12 Nevada companies with 3.2x private leverage ratio, exceeding SSBCI requirements. Portfolio includes TensorWave, Socure, Abnormal AI.",
    entities: ["Battle Born Venture", "SSBCI"],
    impact_score: 6
  },
  {
    date: "2025-10-01",
    type: "milestone",
    title: "StartUpNV Portfolio Reaches 400+ Companies",
    description: "StartUpNV's combined portfolio (accelerator, FundNV, AngelNV) surpasses 400 companies supported. 30+ investment transactions since 2021 across affiliated funds.",
    entities: ["StartUpNV", "FundNV", "AngelNV"],
    impact_score: 5
  },

  // ═══════════════════════════════════════════
  // 2026 (Year-to-Date)
  // ═══════════════════════════════════════════
  {
    date: "2026-01-07",
    type: "award",
    title: "CES 2026 — Nevada AI Showcase",
    description: "CES 2026 in Las Vegas features growing contingent of Nevada AI startups. TensorWave, Abnormal AI, and Cognizer AI featured in AI-focused programming.",
    entities: ["CES", "TensorWave", "Abnormal AI", "Cognizer AI"],
    impact_score: 5
  },
  {
    date: "2026-02-01",
    type: "milestone",
    title: "Nevada Cleantech Cluster Reaches Critical Mass",
    description: "Nevada's cleantech cluster — Redwood Materials, Lyten, Ioneer, Dragonfly Energy, Aqua Metals, Ormat — represents $6B+ in combined value, establishing the state as a national cleantech hub.",
    entities: ["Redwood Materials", "Lyten", "Ioneer", "Dragonfly Energy", "Aqua Metals", "Ormat Technologies"],
    impact_score: 7
  }
];

// ── ECOSYSTEM PHASE DEFINITIONS ──
export const ECOSYSTEM_PHASES = [
  {
    id: "foundation",
    name: "Foundation Phase",
    period: "2015-2017",
    description: "Initial infrastructure buildout. Tesla Gigafactory production begins. Switch IPOs. StartUpNV founded. First institutional startup support emerges.",
    keyThemes: ["Infrastructure buildout", "Manufacturing anchor (Tesla)", "First accelerator programs", "Data center growth"],
    catalysts: ["Tesla Gigafactory", "Switch IPO", "StartUpNV founding"]
  },
  {
    id: "emergence",
    name: "Emergence Phase",
    period: "2018-2020",
    description: "Ecosystem institutions form. AngelNV launches. Black Fire Innovation opens. COVID drives remote work migration from California. First unicorns emerge.",
    keyThemes: ["Angel investing matures", "University innovation centers", "Remote work migration", "COVID economic shock"],
    catalysts: ["AngelNV launch", "UNLV Black Fire Innovation", "COVID remote work wave", "Socure unicorn status"]
  },
  {
    id: "acceleration",
    name: "Acceleration Phase",
    period: "2021-2023",
    description: "SSBCI capital deployed. Record venture funding. Major federal loans (DOE). Second gigafactory announced (Lyten). Multiple unicorns. Ecosystem achieves national recognition.",
    keyThemes: ["SSBCI deployment", "Federal loans (DOE)", "Multiple unicorns", "Cleantech cluster formation", "AI/GPU cloud emergence"],
    catalysts: ["SSBCI approval ($91M to Nevada)", "Redwood $2B DOE loan", "TensorWave founding", "Lyten gigafactory announcement"]
  },
  {
    id: "maturation",
    name: "Maturation Phase",
    period: "2024-2026",
    description: "Ecosystem reaches critical mass. Record Series A (TensorWave $100M). Cleantech cluster solidifies. AI and defense-tech verticals emerge. Sustainable deal flow established.",
    keyThemes: ["Record deal sizes", "Vertical specialization", "AI infrastructure", "Defense-tech testing", "Sustainable deal flow"],
    catalysts: ["TensorWave $100M Series A", "Lyten groundbreaking", "50,000+ tech workers", "BBV deployment milestones"]
  }
];

// ── QUARTERLY SUMMARY GENERATOR ──
export function getQuarterlyEvents(year, quarter) {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const startDate = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(endMonth).padStart(2, "0")}-31`;

  return ECOSYSTEM_TIMELINE.filter(e => e.date >= startDate && e.date <= endDate);
}

// ── GET EVENTS BY ENTITY ──
export function getEventsByEntity(entityName) {
  return ECOSYSTEM_TIMELINE.filter(e =>
    e.entities.some(ent => ent.toLowerCase().includes(entityName.toLowerCase()))
  );
}

// ── GET EVENTS BY TYPE ──
export function getEventsByType(type) {
  return ECOSYSTEM_TIMELINE.filter(e => e.type === type);
}

// ── GET EVENTS BY IMPACT ──
export function getHighImpactEvents(minScore = 7) {
  return ECOSYSTEM_TIMELINE.filter(e => e.impact_score >= minScore);
}

// ── GET CURRENT PHASE ──
export function getCurrentPhase(date = new Date()) {
  const year = date.getFullYear();
  if (year <= 2017) return ECOSYSTEM_PHASES[0];
  if (year <= 2020) return ECOSYSTEM_PHASES[1];
  if (year <= 2023) return ECOSYSTEM_PHASES[2];
  return ECOSYSTEM_PHASES[3];
}

export default {
  ECOSYSTEM_TIMELINE,
  ECOSYSTEM_PHASES,
  getQuarterlyEvents,
  getEventsByEntity,
  getEventsByType,
  getHighImpactEvents,
  getCurrentPhase
};
