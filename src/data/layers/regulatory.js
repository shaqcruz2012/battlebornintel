// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — REGULATORY CONTEXT LAYER
// Nevada's Regulatory Environment for Startups & Innovation
// Sources: NRS, NAC, Legislature.state.nv.us, GOED, Tax Foundation,
//          Nevada Gaming Control Board, PUC Nevada, DOE, BLM, FAA, NHTSA
// Last updated: 2026-02-28
// ============================================================

// ── TAX & BUSINESS STRUCTURE ──
export const TAX_REGULATIONS = {
  id: "tax_structure",
  title: "Nevada Tax Structure — Business-Friendly Framework",
  summary: "Nevada has no personal income tax, no corporate income tax, and no franchise tax. This makes it one of the most tax-advantaged states for startups, tech workers, and investors.",
  regulations: [
    {
      id: "no_income_tax",
      name: "No Personal Income Tax",
      statute: "Nevada Constitution, Article 10, Section 1(9)",
      effectiveDate: "Constitutional amendment ratified 2014 (codifying existing policy)",
      description: "Nevada's constitution prohibits a personal income tax. This is a permanent constitutional provision requiring voter amendment to change.",
      impact: "Major competitive advantage for recruiting tech talent. Saves $12K-18K/year for typical tech worker earning $150K+ vs. California (13.3% top marginal rate).",
      affectedSectors: ["All"],
      score: 10
    },
    {
      id: "no_corporate_tax",
      name: "No Corporate Income Tax",
      statute: "Nevada has no corporate income tax statute",
      description: "Nevada does not impose a tax on corporate profits. Combined with no personal income tax, creates powerful incentive for business formation and relocation.",
      impact: "Attracts corporate HQs and holding companies. Tech companies retain more earnings for reinvestment.",
      affectedSectors: ["All"],
      score: 10
    },
    {
      id: "commerce_tax",
      name: "Commerce Tax",
      statute: "NRS Chapter 363C",
      effectiveDate: "2015-07-01",
      description: "Gross receipts tax on businesses with $4M+ in Nevada gross revenue. Rates range from 0.051% (mining) to 0.331% (rail transportation). Technology companies typically fall under 'Information' at 0.253%.",
      impact: "Most startups are below the $4M threshold. Growth-stage companies face modest tax. Still far below corporate income tax in most states.",
      affectedSectors: ["Growth-stage companies", "Enterprise tech"],
      threshold: "$4M Nevada gross revenue",
      score: 7
    },
    {
      id: "modified_business_tax",
      name: "Modified Business Tax (Payroll Tax)",
      statute: "NRS Chapter 363B",
      description: "Payroll tax of 1.378% on wages exceeding $50,000 per quarter. Applies to most employers. Rate has been stable since 2015.",
      impact: "Modest impact on tech companies. Lower than payroll taxes in many other states. Partially offset by absence of income tax.",
      affectedSectors: ["All employers"],
      rate: "1.378%",
      score: 6
    },
    {
      id: "opportunity_zones",
      name: "Federal Opportunity Zones in Nevada",
      statute: "Internal Revenue Code Section 1400Z",
      effectiveDate: "2018-01-01",
      description: "Nevada has 61 designated Qualified Opportunity Zones across Clark, Washoe, and rural counties. Capital gains tax deferral and potential elimination for long-term investments in these zones.",
      impact: "Incentivizes real estate and business investment in underserved areas. Downtown Las Vegas, North Las Vegas, parts of Reno have OZ designations.",
      affectedSectors: ["Real estate", "Construction", "Any startup in OZ"],
      zonesCount: 61,
      score: 7
    }
  ]
};

// ── INNOVATION & TECHNOLOGY LEGISLATION ──
export const INNOVATION_REGULATIONS = {
  id: "innovation_legislation",
  title: "Innovation & Technology Legislation",
  summary: "Nevada has passed several forward-thinking technology laws positioning the state as a regulatory sandbox for emerging technologies.",
  regulations: [
    {
      id: "innovation_zones",
      name: "Innovation Zones (AB 75 Framework)",
      statute: "NRS 281A — Nevada Commission on Innovation and Technology",
      effectiveDate: "2019",
      description: "AB 75 created the Nevada Commission on Innovation and Technology (NCIT) to advise the Governor on technology, innovation, and entrepreneurship. The original 'Innovation Zones' concept allowing tech companies to form local governments was proposed in 2021 but was significantly modified. NCIT continues to operate as advisory body.",
      impact: "Signals pro-innovation policy stance. NCIT provides direct channel between tech ecosystem and state government. Blockchains LLC was primary catalyst for innovation zones discussion.",
      affectedSectors: ["All tech", "Blockchain", "Smart cities"],
      status: "Active (NCIT advisory role); Innovation Zones concept tabled",
      score: 6
    },
    {
      id: "blockchain_legislation",
      name: "Blockchain Technology Legislation",
      statute: "NRS 719 — Uniform Electronic Transactions Act (UETA) amendment; SB 398 (2017)",
      effectiveDate: "2017-10-01",
      description: "Nevada was among the first states to pass blockchain-specific legislation. SB 398 (2017) amended the UETA to recognize blockchain electronic records, prohibited local governments from taxing blockchain use, and prevented requiring licenses solely for blockchain use.",
      impact: "Created regulatory clarity for blockchain companies. Attracted Blockchains LLC, Stable, Titan Seal, Sapien, and other blockchain/crypto companies to Nevada.",
      affectedSectors: ["Blockchain", "Fintech", "Identity", "Legal tech"],
      status: "Active",
      score: 8
    },
    {
      id: "autonomous_vehicles",
      name: "Autonomous Vehicle Testing & Operations",
      statute: "NRS 482A — Autonomous Vehicles",
      effectiveDate: "2011 (updated 2017)",
      description: "Nevada was the first US state to authorize the operation of autonomous vehicles (AB 511, 2011). Updated in 2017 to allow fully autonomous vehicles without a human driver. DMV issues testing and deployment licenses.",
      impact: "Positioned Nevada as a pioneer in AV regulation. Las Vegas has hosted multiple AV deployments including Aptiv (now Motional) at CES, AAA autonomous shuttle downtown, and Waymo testing.",
      affectedSectors: ["Autonomous vehicles", "Logistics", "Transportation"],
      status: "Active — fully autonomous vehicles permitted with DMV endorsement",
      score: 9
    },
    {
      id: "drone_regulations",
      name: "Drone / UAS Testing and Operations",
      statute: "NRS 493 — Unmanned Aerial Vehicles; FAA Part 107 integration",
      effectiveDate: "2015 (updated regularly)",
      description: "Nevada has extensive drone testing infrastructure through the Nevada Institute for Autonomous Systems (NIAS) and the Nevada UAS Test Site, one of seven FAA-designated UAS test sites. The NTTR provides massive restricted airspace for military and commercial drone testing.",
      impact: "Attracts defense and commercial drone companies. Skydio Gov, fibrX, and Sierra Nevada Corp all leverage Nevada's drone testing infrastructure. NTTR provides unmatched airspace for counter-UAS testing.",
      affectedSectors: ["Drones/UAS", "Defense", "Logistics", "Agriculture", "Infrastructure inspection"],
      testSites: ["Nevada UAS Test Site (NIAS)", "NTTR restricted airspace", "Boulder City Municipal Airport"],
      status: "Active — FAA Part 107 + BVLOS waivers available",
      score: 8
    },
    {
      id: "sandbox_program",
      name: "Regulatory Sandbox Program",
      statute: "NRS Chapter 604B — Regulatory Sandbox",
      effectiveDate: "2019",
      description: "Nevada created a fintech regulatory sandbox allowing companies to test innovative financial products and services with reduced regulatory burden for up to 24 months. Administered by the Department of Business and Industry.",
      impact: "Enables fintech startups to test products without full licensing. Benefits companies like Stable, Fund Duel, and GBank Financial.",
      affectedSectors: ["Fintech", "Banking", "Insurance", "Blockchain/crypto"],
      status: "Active",
      score: 7
    }
  ]
};

// ── ENERGY & ENVIRONMENTAL REGULATIONS ──
export const ENERGY_REGULATIONS = {
  id: "energy_regulations",
  title: "Energy & Environmental Regulatory Framework",
  summary: "Nevada's energy landscape is shaped by the transition from regulated utility monopoly to partial deregulation, aggressive renewable portfolio standards, and federal clean energy investments.",
  regulations: [
    {
      id: "energy_choice",
      name: "Energy Choice Initiative / Large Customer Opt-Out",
      statute: "NRS 704B — Eligible Customers (Large Customer Opt-Out)",
      effectiveDate: "2001 (opt-out for large customers); 2018 ballot measure for full deregulation failed",
      description: "Large commercial customers (>1 MW demand) can opt out of NV Energy service and purchase electricity on the open market. A 2016/2018 ballot initiative for full energy deregulation passed in 2016 but failed in 2018. Data centers like Switch have used the opt-out to purchase renewable energy directly.",
      impact: "Benefits large tech employers (data centers, manufacturing). Switch, Tesla, Google all utilize the opt-out. Enables corporate renewable energy procurement. Standard residential and small business customers remain with NV Energy.",
      affectedSectors: ["Data centers", "Manufacturing", "Large enterprises"],
      status: "Active — large customer opt-out available; full deregulation rejected by voters",
      score: 7
    },
    {
      id: "renewable_portfolio_standard",
      name: "Renewable Portfolio Standard (RPS)",
      statute: "NRS 704.7821",
      effectiveDate: "1997 (updated to 50% by 2030 in SB 358, 2019)",
      description: "Nevada requires utilities to obtain 50% of electricity from renewable sources by 2030. Governor Sisolak signed SB 358 in 2019 setting the 50% target. Nevada is on track to meet this goal driven by massive solar deployment in Southern Nevada.",
      impact: "Drives demand for solar, geothermal, and wind projects. Benefits Bombard Renewable Energy, Ormat Technologies, and solar installers. Creates clean energy jobs and supply chain.",
      affectedSectors: ["Solar", "Geothermal", "Wind", "Energy storage", "Cleantech"],
      target: "50% by 2030",
      currentProgress: "~35% (2024)",
      status: "Active — on track",
      score: 7
    },
    {
      id: "doe_loan_programs",
      name: "DOE Loan Programs Office (Nevada Impact)",
      statute: "Federal — Title XVII Innovative Clean Energy Loans, ATVM Program",
      description: "The Department of Energy Loan Programs Office has been a transformative funding source for Nevada cleantech companies. Redwood Materials received a $2B loan for battery recycling, and Ioneer received a $700M conditional loan commitment for the Rhyolite Ridge lithium-boron project.",
      impact: "Over $2.7B in DOE loans/commitments directed to Nevada projects. Catalyzes private investment and creates thousands of construction and permanent jobs. Validates Nevada as a national cleantech hub.",
      affectedSectors: ["Battery recycling", "Lithium mining", "Clean energy manufacturing"],
      nevadaLoansBillions: 2.7,
      recipients: [
        { company: "Redwood Materials", amount: 2000, type: "ATVM loan", status: "Active" },
        { company: "Ioneer", amount: 700, type: "Title XVII conditional commitment", status: "Conditional" }
      ],
      status: "Active — additional applications pending",
      score: 9
    },
    {
      id: "blm_land",
      name: "BLM Land Use and Public Lands",
      statute: "Federal — FLPMA, Energy Act of 2020",
      description: "The Bureau of Land Management manages approximately 48 million acres in Nevada (67% of the state). Solar and wind projects require BLM permitting for utility-scale installations on federal land. Mining claims also fall under BLM jurisdiction.",
      impact: "BLM permitting timelines affect solar farm and mining development. Gemini Solar Project required extensive BLM environmental review. Ioneer Rhyolite Ridge permitting involves BLM EIS process. Tiahrt's Paradox: federal land enables massive clean energy but also creates permitting bottlenecks.",
      affectedSectors: ["Solar", "Mining", "Wind", "Geothermal", "Lithium extraction"],
      federalLandPercentage: 67,
      status: "Ongoing — permitting reform discussions active",
      score: 7
    },
    {
      id: "water_rights",
      name: "Water Rights and Conservation",
      statute: "NRS Chapter 533, 534 — Water Law",
      description: "Nevada operates under the prior appropriation doctrine ('first in time, first in right'). Water rights are critical for mining, manufacturing, and data center operations. The Southern Nevada Water Authority (SNWA) manages Las Vegas area water from Lake Mead. Reno draws from the Truckee River system.",
      impact: "Water availability constrains certain industrial development. Data center cooling requires water rights. WaterStart accelerator focuses on water technology innovation. Climate change and Colorado River drought create long-term risk.",
      affectedSectors: ["Mining", "Manufacturing", "Data centers", "Agriculture", "Cleantech"],
      keyAgencies: ["SNWA", "Truckee Meadows Water Authority", "State Engineer"],
      status: "Active — ongoing drought concerns",
      score: 6
    }
  ]
};

// ── CANNABIS REGULATION ──
export const CANNABIS_REGULATIONS = {
  id: "cannabis_regulation",
  title: "Cannabis Industry Regulation",
  summary: "Nevada legalized recreational cannabis in 2017 via ballot measure. The industry generates significant tax revenue and has created a tech-enabled ecosystem of dispensaries, cultivation facilities, and ancillary technology companies.",
  regulations: [
    {
      id: "recreational_cannabis",
      name: "Recreational Cannabis — Question 2 (2016)",
      statute: "NRS Chapter 678A-678D",
      effectiveDate: "2017-07-01 (retail sales)",
      description: "Nevada voters approved recreational cannabis in November 2016. Retail sales began July 2017. Regulated by the Cannabis Compliance Board (CCB). Annual sales exceed $900M with $150M+ in tax revenue.",
      impact: "Created substantial market for cannabis tech companies. Springbig provides CRM/loyalty to 1,000+ NV dispensaries. Planet 13 operates world's largest dispensary. Curaleaf Tech has major NV operations.",
      affectedSectors: ["Cannabis", "Cannabis tech", "Fintech (payment processing)", "Analytics"],
      annualSalesBillions: 0.9,
      annualTaxRevenue: 150, // $M
      licensedDispensaries: 80,
      status: "Active — mature market",
      score: 6
    },
    {
      id: "cannabis_banking",
      name: "Cannabis Banking Challenges",
      statute: "Federal — Controlled Substances Act (cannabis remains Schedule I)",
      description: "Federal prohibition creates banking challenges for cannabis businesses. Most traditional banks won't serve cannabis companies. This has created opportunities for fintech solutions like Springbig and Safe Harbor Financial.",
      impact: "Drives demand for cannabis-specific fintech. Payment processing, compliance, and banking solutions are major opportunities. GBank Financial positioned as cannabis-friendly banking option.",
      affectedSectors: ["Cannabis", "Fintech", "Banking"],
      status: "Ongoing federal issue",
      score: 5
    }
  ]
};

// ── DATA PRIVACY & CYBERSECURITY ──
export const PRIVACY_REGULATIONS = {
  id: "privacy_regulations",
  title: "Data Privacy & Cybersecurity Regulations",
  summary: "Nevada has taken a measured approach to data privacy, passing targeted laws rather than comprehensive frameworks like California's CCPA/CPRA.",
  regulations: [
    {
      id: "sb_220",
      name: "Nevada Internet Privacy Law (SB 220)",
      statute: "NRS 603A.345",
      effectiveDate: "2019-10-01",
      description: "SB 220 gives Nevada consumers the right to opt out of the sale of their personal information by website operators. Predates the California Consumer Privacy Act (CCPA) in implementation. Applies to operators of websites or online services that collect personal information from Nevada consumers.",
      impact: "Relatively narrow scope compared to CCPA/CPRA. Creates compliance requirements for tech companies with Nevada customers. Socure, Abnormal AI, and identity/security companies must account for this law.",
      affectedSectors: ["All tech companies with consumer data", "AdTech", "Identity", "Fintech"],
      status: "Active",
      score: 5
    },
    {
      id: "data_breach_notification",
      name: "Data Breach Notification Law",
      statute: "NRS 603A.010 — 603A.920",
      effectiveDate: "2005 (updated 2017, 2019)",
      description: "Requires businesses to notify Nevada residents of data breaches involving personal information. Encryption safe harbor provisions. Updated to include data disposal requirements.",
      impact: "Standard compliance requirement for all tech companies handling personal data. Cybersecurity companies like Abnormal AI, Nudge Security, and Protect AI help clients meet these requirements.",
      affectedSectors: ["All tech companies", "Healthcare", "Fintech", "Gaming"],
      status: "Active",
      score: 4
    }
  ]
};

// ── GAMING TECHNOLOGY REGULATION ──
export const GAMING_REGULATIONS = {
  id: "gaming_regulations",
  title: "Gaming Technology Regulation",
  summary: "Nevada's Gaming Control Board (GCB) and Gaming Commission regulate all gaming technology. Nevada has the most sophisticated gaming regulatory framework in the world, which both enables and constrains gaming tech innovation.",
  regulations: [
    {
      id: "gaming_control_board",
      name: "Gaming Control Board Licensing",
      statute: "NRS Chapter 463 — Gaming Control",
      description: "All gaming devices, systems, and technology must be tested and approved by the GCB. Equipment manufacturers, operators, and key employees require licensing. The process is rigorous but provides a 'gold standard' seal of approval recognized globally.",
      impact: "Creates high barrier to entry that protects established gaming tech companies. Everi Holdings, GAN Limited, Jackpot Digital, Acres Technology all must maintain GCB licenses. Provides competitive moat for Nevada gaming tech companies.",
      affectedSectors: ["Gaming technology", "iGaming", "Sports betting", "Casino management"],
      status: "Active",
      score: 7
    },
    {
      id: "online_gaming",
      name: "Online Gaming and Sports Betting",
      statute: "NRS 463.745 — Interactive Gaming",
      effectiveDate: "2013 (online poker); 2019 (sports betting expanded)",
      description: "Nevada allows online poker (intrastate) and has a mature sports betting framework. Mobile sports betting permitted via apps linked to licensed sportsbooks. GAN Limited and Wynn Interactive operate under these regulations.",
      impact: "Creates market opportunity for gaming tech companies. Nevada's regulatory expertise attracts companies that can then expand to newly legal states. betJACK, GAN, and Wynn Interactive all benefit from this framework.",
      affectedSectors: ["iGaming", "Sports betting", "Gaming tech"],
      status: "Active — framework expanding",
      score: 6
    },
    {
      id: "cashless_gaming",
      name: "Cashless Gaming Regulations",
      statute: "GCB Regulation 14A",
      effectiveDate: "2021",
      description: "Nevada Gaming Control Board adopted Regulation 14A enabling cashless wagering on casino floors. Digital wallets and mobile payment for slot machines and table games. Acres Technology's Foundation platform is a primary beneficiary.",
      impact: "Opens new market for fintech/gaming tech convergence. Acres Technology, Everi Holdings positioned to capitalize. Reduces cash handling costs for casinos.",
      affectedSectors: ["Gaming tech", "Fintech", "Payments"],
      status: "Active — adoption accelerating",
      score: 6
    }
  ]
};

// ── DEFENSE & AEROSPACE REGULATIONS ──
export const DEFENSE_REGULATIONS = {
  id: "defense_regulations",
  title: "Defense & Aerospace Regulatory Environment",
  summary: "Nevada hosts critical military installations and testing ranges that create unique opportunities and regulatory requirements for defense-tech companies.",
  regulations: [
    {
      id: "nttr_access",
      name: "NTTR and Restricted Airspace Access",
      statute: "Federal — DoD/USAF regulations, FAA restricted airspace",
      description: "Access to the Nevada Test and Training Range requires military authorization and security clearances. Companies testing defense technologies must navigate ITAR, EAR, and DoD contracting requirements.",
      impact: "Creates both opportunity and barrier. Sierra Nevada Corp, Skydio Gov, and fibrX benefit from proximity to testing infrastructure. Security clearance requirements for personnel.",
      affectedSectors: ["Defense", "Aerospace", "Drones/UAS", "Electronic warfare"],
      clearanceRequired: true,
      status: "Active",
      score: 7
    },
    {
      id: "sbir_sttr",
      name: "SBIR/STTR Programs in Nevada",
      statute: "Federal — Small Business Innovation Research / Small Business Technology Transfer",
      description: "Federal SBIR/STTR programs provide non-dilutive funding for R&D. Nevada companies actively compete for DoD, DOE, NSF, and NASA SBIR awards. Phase I ($275K), Phase II ($750K-1.5M), Phase III (commercialization).",
      impact: "Critical funding source for defense-tech and deep-tech startups. Nevada Nano, Skydio Gov, fibrX, and WaterStart have received SBIR awards. GOED provides matching funds for Nevada SBIR winners.",
      affectedSectors: ["Defense", "Cleantech", "Biotech", "Advanced manufacturing"],
      nevadaAwardees: ["Nevada Nano (SBIR Phase II)", "Skydio Gov", "fibrX", "WaterStart"],
      status: "Active — Nevada increasing competitiveness",
      score: 7
    }
  ]
};

// ── LABOR & EMPLOYMENT REGULATIONS ──
export const LABOR_REGULATIONS = {
  id: "labor_regulations",
  title: "Labor & Employment Regulatory Framework",
  summary: "Nevada's labor laws are generally employer-friendly with some notable worker protection provisions.",
  regulations: [
    {
      id: "right_to_work",
      name: "Right to Work (Not Applicable)",
      description: "Nevada is NOT a right-to-work state. Workers can be required to join a union or pay union dues as a condition of employment in unionized workplaces. However, this primarily affects hospitality and construction, not tech sector.",
      impact: "Minimal impact on tech sector, which is largely non-unionized. Hospitality union strength affects hotel/casino labor costs.",
      affectedSectors: ["Hospitality", "Construction"],
      status: "Active — Nevada is NOT right-to-work",
      score: 4
    },
    {
      id: "minimum_wage",
      name: "Nevada Minimum Wage",
      statute: "Nevada Constitution, Article 15, Section 16",
      effectiveDate: "2024-07-01 ($12.00/hour)",
      description: "Nevada minimum wage is $12.00/hour (unified rate as of 2024). Previously had two tiers based on employer-provided health insurance. Constitutional provision adjusts with CPI.",
      impact: "Minimal direct impact on tech companies (salaries well above minimum wage). Affects cost structure for hospitality-adjacent tech companies.",
      affectedSectors: ["Hospitality tech", "Retail", "Service sector"],
      currentRate: 12.00,
      status: "Active",
      score: 3
    },
    {
      id: "noncompete_limits",
      name: "Noncompete Agreement Limitations",
      statute: "NRS 613.195 — Postemployment Restrictive Covenants",
      effectiveDate: "2017 (AB 276, updated 2021)",
      description: "Nevada limits noncompete agreements. They must be reasonable in duration (generally 1 year), scope, and geography. Cannot restrict employees earning hourly wages. Employer must provide consideration beyond at-will employment.",
      impact: "Facilitates worker mobility in tech sector. Makes it easier for startup employees to leave and start competing companies. More permissive than some states but not as free as California's outright ban.",
      affectedSectors: ["All tech", "All employers"],
      status: "Active",
      score: 6
    }
  ]
};

// ── REGULATORY RISK MATRIX ──
export const REGULATORY_RISK_MATRIX = {
  description: "Assessment of regulatory risk and opportunity by sector for Nevada startups",
  sectors: [
    {
      sector: "AI / Machine Learning",
      riskLevel: "Low",
      riskScore: 2,
      opportunities: ["No state AI regulation", "Federal landscape still forming", "Testing-friendly environment"],
      risks: ["Potential federal AI regulation", "Data privacy requirements"],
      outlook: "Favorable — Nevada has no AI-specific regulation, allowing innovation"
    },
    {
      sector: "Fintech",
      riskLevel: "Medium",
      riskScore: 5,
      opportunities: ["Regulatory sandbox program", "No income tax for fintech workers", "Blockchain legislation"],
      risks: ["Federal banking regulation", "State money transmitter licensing", "SEC scrutiny of crypto"],
      outlook: "Moderate — sandbox helps but federal regulation creates uncertainty"
    },
    {
      sector: "Cleantech / Energy",
      riskLevel: "Medium",
      riskScore: 4,
      opportunities: ["DOE loan programs", "RPS driving demand", "Federal IRA incentives"],
      risks: ["BLM permitting delays", "Water rights constraints", "Environmental litigation"],
      outlook: "Favorable — strong federal and state support, but permitting can delay projects"
    },
    {
      sector: "Gaming Technology",
      riskLevel: "Medium",
      riskScore: 5,
      opportunities: ["GCB approval = gold standard", "Cashless gaming opening", "Sports betting expansion"],
      risks: ["Lengthy GCB approval process", "High compliance costs", "Regulatory changes"],
      outlook: "Balanced — high barrier to entry but strong moat once approved"
    },
    {
      sector: "Healthcare / Biotech",
      riskLevel: "Medium-High",
      riskScore: 6,
      opportunities: ["FDA pathways clear", "SBIR funding", "University research partnerships"],
      risks: ["FDA approval timelines", "Clinical trial complexity", "Reimbursement uncertainty"],
      outlook: "Standard — federal regulation dominates, state environment neutral"
    },
    {
      sector: "Defense / Aerospace",
      riskLevel: "Medium",
      riskScore: 5,
      opportunities: ["NTTR testing access", "SBIR/STTR funding", "Proximity to Nellis/Creech AFB"],
      risks: ["Security clearance requirements", "ITAR compliance", "DoD procurement cycles"],
      outlook: "Favorable — unique testing infrastructure provides competitive advantage"
    },
    {
      sector: "Cannabis Tech",
      riskLevel: "High",
      riskScore: 8,
      opportunities: ["Mature state market", "Tech solutions demand", "Revenue scale"],
      risks: ["Federal prohibition", "Banking challenges", "Interstate commerce restrictions"],
      outlook: "Challenging — federal prohibition creates fundamental uncertainty"
    },
    {
      sector: "Blockchain / Crypto",
      riskLevel: "Medium-High",
      riskScore: 6,
      opportunities: ["SB 398 blockchain legislation", "No state crypto taxation", "Regulatory sandbox"],
      risks: ["SEC enforcement actions", "Federal regulatory uncertainty", "Market volatility"],
      outlook: "Mixed — state environment favorable but federal landscape uncertain"
    },
    {
      sector: "Data Centers / Cloud",
      riskLevel: "Low",
      riskScore: 2,
      opportunities: ["Tax abatements", "Energy opt-out for large customers", "Land availability"],
      risks: ["Water constraints for cooling", "Energy price volatility"],
      outlook: "Very favorable — strong state incentives and infrastructure"
    }
  ]
};

// ── HELPER FUNCTIONS ──
export function getRegulationsByAffectedSector(sectorName) {
  const allRegulations = [
    ...TAX_REGULATIONS.regulations,
    ...INNOVATION_REGULATIONS.regulations,
    ...ENERGY_REGULATIONS.regulations,
    ...CANNABIS_REGULATIONS.regulations,
    ...PRIVACY_REGULATIONS.regulations,
    ...GAMING_REGULATIONS.regulations,
    ...DEFENSE_REGULATIONS.regulations,
    ...LABOR_REGULATIONS.regulations
  ];

  return allRegulations.filter(reg =>
    reg.affectedSectors && reg.affectedSectors.some(s =>
      s.toLowerCase().includes(sectorName.toLowerCase()) ||
      sectorName.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase() === "all" ||
      s.toLowerCase() === "all tech" ||
      s.toLowerCase() === "all tech companies" ||
      s.toLowerCase() === "all employers"
    )
  );
}

export function getRegulatoryRisk(sectorName) {
  return REGULATORY_RISK_MATRIX.sectors.find(s =>
    s.sector.toLowerCase().includes(sectorName.toLowerCase()) ||
    sectorName.toLowerCase().includes(s.sector.toLowerCase())
  );
}

export function getAllRegulations() {
  return {
    tax: TAX_REGULATIONS,
    innovation: INNOVATION_REGULATIONS,
    energy: ENERGY_REGULATIONS,
    cannabis: CANNABIS_REGULATIONS,
    privacy: PRIVACY_REGULATIONS,
    gaming: GAMING_REGULATIONS,
    defense: DEFENSE_REGULATIONS,
    labor: LABOR_REGULATIONS
  };
}

export default {
  TAX_REGULATIONS,
  INNOVATION_REGULATIONS,
  ENERGY_REGULATIONS,
  CANNABIS_REGULATIONS,
  PRIVACY_REGULATIONS,
  GAMING_REGULATIONS,
  DEFENSE_REGULATIONS,
  LABOR_REGULATIONS,
  REGULATORY_RISK_MATRIX,
  getRegulationsByAffectedSector,
  getRegulatoryRisk,
  getAllRegulations
};
