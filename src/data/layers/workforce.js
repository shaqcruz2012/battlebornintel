// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — WORKFORCE CONTEXT LAYER
// Nevada Tech Talent Pool, Salaries, Education Pipeline, Migration
// Sources: BLS OES, LinkedIn Economic Graph, CompTIA Cyberstates,
//          DETR, NSHE, Glassdoor, Levels.fyi, Hired.com, CBRE Tech Talent
// Last updated: 2026-02-28
// NOTE: Salary data represents best available estimates. Individual
//       company compensation may vary significantly.
// ============================================================

// ── TECH TALENT POOL OVERVIEW ──
export const TALENT_POOL = {
  totalTechWorkers2025: 54000,
  techWorkersGrowthRate: 5.9, // percent YoY
  techTalentConcentration: 3.8, // percent of total workforce
  nationalAvgConcentration: 5.2, // percent
  talentGap: "Nevada's tech talent concentration (3.8%) trails the national average (5.2%), creating both a challenge for recruiting and an opportunity as the gap narrows through education and migration.",
  historicalGrowth: [
    { year: 2018, techWorkers: 35000, shareOfWorkforce: 2.6 },
    { year: 2019, techWorkers: 38000, shareOfWorkforce: 2.8 },
    { year: 2020, techWorkers: 36500, shareOfWorkforce: 2.9 }, // COVID reduced total workforce more than tech
    { year: 2021, techWorkers: 41000, shareOfWorkforce: 3.1 },
    { year: 2022, techWorkers: 45500, shareOfWorkforce: 3.3 },
    { year: 2023, techWorkers: 48200, shareOfWorkforce: 3.5 },
    { year: 2024, techWorkers: 51000, shareOfWorkforce: 3.7 },
    { year: 2025, techWorkers: 54000, shareOfWorkforce: 3.8 }
  ],
  byRegion2025: {
    clarkCounty: {
      techWorkers: 38000,
      topEmployers: ["Amazon", "Switch", "MNTN", "Abnormal AI", "TensorWave", "Everi Holdings", "NV5 Global"],
      keyHubs: ["Downtown Las Vegas", "Summerlin", "Henderson", "UNLV campus area"]
    },
    washoeCounty: {
      techWorkers: 12000,
      topEmployers: ["Tesla/Panasonic", "Sierra Nevada Corp", "IGT", "Ormat Technologies", "Redwood Materials"],
      keyHubs: ["UNR campus", "South Meadows", "TRIC", "Midtown Reno"]
    },
    carsonCity: {
      techWorkers: 1500,
      topEmployers: ["Redwood Materials", "State of Nevada IT", "Adams Hub companies"],
      keyHubs: ["Adams Hub for Innovation", "State government campus"]
    },
    rural: {
      techWorkers: 2500,
      topEmployers: ["Mining companies (IT)", "DOE facilities", "Military installations"],
      keyHubs: ["Elko (mining tech)", "Hawthorne (defense)", "Esmeralda County (lithium/mining)"]
    }
  }
};

// ── TECH SALARY DATA BY ROLE ──
export const SALARY_DATA = {
  // Source: BLS OES, Glassdoor, Levels.fyi, Hired.com, LinkedIn Salary Insights
  // All figures are annual median salaries for Nevada (2025 estimates)
  description: "Nevada tech salaries are typically 15-25% below Bay Area levels but 5-10% above national median. Combined with no state income tax, effective purchasing power is competitive.",
  byRole: [
    {
      role: "Software Engineer (Junior/Entry)",
      medianSalary: 82000,
      range: { low: 65000, high: 100000 },
      openPositions: 1200,
      demandTrend: "high"
    },
    {
      role: "Software Engineer (Mid-Level)",
      medianSalary: 115000,
      range: { low: 95000, high: 140000 },
      openPositions: 800,
      demandTrend: "high"
    },
    {
      role: "Software Engineer (Senior/Staff)",
      medianSalary: 155000,
      range: { low: 130000, high: 200000 },
      openPositions: 450,
      demandTrend: "very_high"
    },
    {
      role: "Data Scientist",
      medianSalary: 125000,
      range: { low: 95000, high: 165000 },
      openPositions: 350,
      demandTrend: "very_high"
    },
    {
      role: "Machine Learning Engineer",
      medianSalary: 145000,
      range: { low: 115000, high: 195000 },
      openPositions: 280,
      demandTrend: "very_high"
    },
    {
      role: "AI/ML Research Scientist",
      medianSalary: 165000,
      range: { low: 130000, high: 220000 },
      openPositions: 120,
      demandTrend: "very_high"
    },
    {
      role: "DevOps/Cloud Engineer",
      medianSalary: 120000,
      range: { low: 95000, high: 155000 },
      openPositions: 400,
      demandTrend: "high"
    },
    {
      role: "Cybersecurity Analyst",
      medianSalary: 98000,
      range: { low: 75000, high: 130000 },
      openPositions: 500,
      demandTrend: "high"
    },
    {
      role: "Cybersecurity Engineer (Senior)",
      medianSalary: 140000,
      range: { low: 115000, high: 180000 },
      openPositions: 200,
      demandTrend: "very_high"
    },
    {
      role: "Product Manager",
      medianSalary: 128000,
      range: { low: 100000, high: 170000 },
      openPositions: 300,
      demandTrend: "high"
    },
    {
      role: "Engineering Manager",
      medianSalary: 165000,
      range: { low: 135000, high: 210000 },
      openPositions: 150,
      demandTrend: "high"
    },
    {
      role: "UX/UI Designer",
      medianSalary: 92000,
      range: { low: 72000, high: 125000 },
      openPositions: 250,
      demandTrend: "moderate"
    },
    {
      role: "Data Analyst",
      medianSalary: 72000,
      range: { low: 55000, high: 95000 },
      openPositions: 600,
      demandTrend: "high"
    },
    {
      role: "QA/Test Engineer",
      medianSalary: 85000,
      range: { low: 65000, high: 110000 },
      openPositions: 300,
      demandTrend: "moderate"
    },
    {
      role: "Technical Program Manager",
      medianSalary: 140000,
      range: { low: 110000, high: 180000 },
      openPositions: 180,
      demandTrend: "high"
    },
    {
      role: "Systems Administrator",
      medianSalary: 78000,
      range: { low: 60000, high: 100000 },
      openPositions: 350,
      demandTrend: "moderate"
    },
    {
      role: "Network Engineer",
      medianSalary: 88000,
      range: { low: 68000, high: 115000 },
      openPositions: 280,
      demandTrend: "moderate"
    },
    {
      role: "CTO/VP Engineering (Startup)",
      medianSalary: 195000,
      range: { low: 150000, high: 280000 },
      openPositions: 40,
      demandTrend: "high",
      note: "Often includes equity compensation in startup context"
    }
  ],
  comparisonToMajorMarkets: {
    description: "Salary comparison vs. major tech hubs (Nevada median = 100)",
    markets: [
      { market: "Nevada (Las Vegas / Reno)", index: 100 },
      { market: "San Francisco Bay Area", index: 145 },
      { market: "Seattle", index: 135 },
      { market: "New York City", index: 130 },
      { market: "Austin, TX", index: 108 },
      { market: "Denver, CO", index: 110 },
      { market: "Miami, FL", index: 105 },
      { market: "National Average", index: 102 }
    ],
    afterTaxPurchasingPower: {
      description: "When adjusted for no state income tax and lower cost of living, Nevada offers competitive after-tax purchasing power",
      markets: [
        { market: "Nevada (Las Vegas)", index: 100 },
        { market: "San Francisco (after 13.3% state tax + high COL)", index: 78 },
        { market: "Seattle (no state tax, but high COL)", index: 88 },
        { market: "New York City (after 8.82% state + 3.876% city tax + high COL)", index: 72 },
        { market: "Austin, TX (no state tax, moderate COL)", index: 98 },
        { market: "Denver (after 4.4% state tax + moderate COL)", index: 92 },
        { market: "Miami (no state tax, high COL)", index: 85 }
      ]
    }
  }
};

// ── EDUCATION PIPELINE ──
export const EDUCATION_PIPELINE = {
  // Source: NSHE, IPEDS, university annual reports
  description: "Nevada's higher education system produces approximately 3,700 STEM graduates annually from UNR and UNLV combined. Community colleges add workforce-ready tech talent through certificate and associate programs.",
  universities: {
    unlv: {
      name: "University of Nevada, Las Vegas",
      totalEnrollment: 31000,
      stemEnrollment: 6200,
      annualDegrees: {
        bachelorSTEM: 1500,
        masterSTEM: 500,
        doctoralSTEM: 200,
        totalSTEM: 2200
      },
      topPrograms: [
        { program: "Computer Science (BS/MS)", enrollment: 1800, annualGrads: 380, placement: "75% in-state retention" },
        { program: "Electrical Engineering (BS/MS)", enrollment: 600, annualGrads: 120, placement: "65% in-state retention" },
        { program: "Mechanical Engineering (BS/MS)", enrollment: 800, annualGrads: 160, placement: "70% in-state retention" },
        { program: "Civil Engineering (BS/MS)", enrollment: 500, annualGrads: 100, placement: "80% in-state retention" },
        { program: "Data Science (MS)", enrollment: 120, annualGrads: 45, placement: "60% in-state retention" },
        { program: "Cybersecurity (MS)", enrollment: 90, annualGrads: 35, placement: "70% in-state retention" },
        { program: "Hospitality Technology (BS)", enrollment: 200, annualGrads: 60, placement: "85% in-state retention" },
        { program: "Biology/Biochemistry (BS/MS)", enrollment: 1200, annualGrads: 250, placement: "50% in-state retention" }
      ],
      researchCenters: [
        "Black Fire Innovation — startup-university collaboration hub",
        "Harry Reid Research & Technology Park",
        "National Supercomputing Institute for Energy and Environment",
        "Nevada Institute for Autonomous Systems (NIAS)",
        "International Gaming Institute"
      ],
      entrepreneurshipPrograms: [
        "Lee Prize for Entrepreneurship",
        "UNLV Rebel Venture Fund (student VC)",
        "Troesh Center for Entrepreneurship"
      ]
    },
    unr: {
      name: "University of Nevada, Reno",
      totalEnrollment: 21000,
      stemEnrollment: 4800,
      annualDegrees: {
        bachelorSTEM: 1000,
        masterSTEM: 350,
        doctoralSTEM: 150,
        totalSTEM: 1500
      },
      topPrograms: [
        { program: "Computer Science & Engineering (BS/MS/PhD)", enrollment: 1100, annualGrads: 220, placement: "55% in-state retention" },
        { program: "Mining Engineering (BS/MS/PhD)", enrollment: 200, annualGrads: 45, placement: "60% in-state retention", note: "Top-ranked nationally" },
        { program: "Materials Science (BS/MS/PhD)", enrollment: 150, annualGrads: 35, placement: "50% in-state retention" },
        { program: "Mechanical Engineering (BS/MS)", enrollment: 500, annualGrads: 100, placement: "55% in-state retention" },
        { program: "Civil & Environmental Engineering (BS/MS)", enrollment: 400, annualGrads: 80, placement: "65% in-state retention" },
        { program: "Biochemistry/Molecular Biology (BS/MS/PhD)", enrollment: 350, annualGrads: 70, placement: "45% in-state retention" },
        { program: "Geoscience (BS/MS/PhD)", enrollment: 180, annualGrads: 40, placement: "50% in-state retention" },
        { program: "Physics (BS/MS/PhD)", enrollment: 200, annualGrads: 40, placement: "40% in-state retention" }
      ],
      researchCenters: [
        "Nevada Center for Applied Research (NCAR)",
        "Ozmen Center for Entrepreneurship",
        "Nevada Seismological Laboratory",
        "Mackay School of Earth Sciences and Engineering",
        "Center for Advanced Computation and Discovery"
      ],
      entrepreneurshipPrograms: [
        "Ozmen Center for Entrepreneurship — incubator + curriculum",
        "InNEVation Student Startup Program",
        "Wolf Pack Seed Fund"
      ]
    },
    communityColleges: {
      csn: {
        name: "College of Southern Nevada",
        totalEnrollment: 32000,
        techPrograms: [
          { program: "Information Technology (AAS)", annualGrads: 150, description: "Networking, systems admin, help desk" },
          { program: "Cybersecurity (Certificate/AAS)", annualGrads: 80, description: "Security fundamentals, compliance, SOC operations" },
          { program: "Advanced Manufacturing Technology (AAS)", annualGrads: 120, description: "CNC, automation, quality control" },
          { program: "Computer Science Transfer (AA)", annualGrads: 200, description: "Transfer pathway to UNLV/UNR CS programs" },
          { program: "Web Development (Certificate)", annualGrads: 60, description: "Frontend and full-stack development" }
        ],
        workforcePartnerships: ["Amazon technical training", "Switch data center technician", "Tesla manufacturing apprenticeship"]
      },
      tmcc: {
        name: "Truckee Meadows Community College",
        totalEnrollment: 10000,
        techPrograms: [
          { program: "Advanced Manufacturing (AAS)", annualGrads: 80, description: "Aligned with TRIC employer needs" },
          { program: "Welding Technology (Certificate)", annualGrads: 60, description: "Advanced welding for manufacturing" },
          { program: "Information Technology (AAS)", annualGrads: 50, description: "Systems administration and networking" },
          { program: "Industrial Automation (Certificate)", annualGrads: 40, description: "PLC programming, robotics, automation" }
        ],
        workforcePartnerships: ["Tesla Gigafactory technician training", "Panasonic battery manufacturing", "Switch data center operations"]
      }
    }
  },
  totalAnnualTechGraduates: {
    university: 3700,      // UNLV + UNR STEM combined
    communityCollege: 840,  // CSN + TMCC tech programs
    bootcamps: 350,         // Coding bootcamps (Code School of NV, online programs)
    total: 4890,
    estimatedRetention: 0.62, // 62% of graduates stay in Nevada
    estimatedInStateHires: 3032
  }
};

// ── WORKFORCE TRAINING PROGRAMS ──
export const WORKFORCE_TRAINING = {
  // Source: DETR, GOED, NSHE, individual program websites
  description: "Nevada has multiple workforce training initiatives designed to upskill the existing workforce and prepare workers for tech sector jobs.",
  programs: [
    {
      name: "NSHE Workforce Development Programs",
      operator: "Nevada System of Higher Education",
      description: "Statewide coordination of workforce training across community colleges. Aligned with employer needs in advanced manufacturing, IT, healthcare, and clean energy.",
      annualParticipants: 5000,
      fundingSources: ["State general fund", "Federal grants (Perkins, WIOA)"],
      focusAreas: ["Advanced manufacturing", "IT/Cybersecurity", "Healthcare", "Clean energy"]
    },
    {
      name: "DETR — Silver State Works",
      operator: "Department of Employment, Training and Rehabilitation",
      description: "On-the-job training subsidies and placement services for unemployed and underemployed Nevadans. Employers receive wage subsidies for training new workers.",
      annualParticipants: 3000,
      fundingSources: ["Federal WIOA funding", "State general fund"],
      focusAreas: ["Employer-driven training", "On-the-job subsidies", "Career transitions"]
    },
    {
      name: "Tesla START Program",
      operator: "Tesla / NSHE Partnership",
      description: "Manufacturing technician training program preparing students for employment at Tesla Gigafactory. 12-16 week program at CSN and TMCC combining classroom and hands-on training.",
      annualParticipants: 200,
      fundingSources: ["Tesla corporate", "NSHE"],
      focusAreas: ["Battery manufacturing", "Quality control", "Automation", "Safety"],
      placementRate: 0.90
    },
    {
      name: "Code School of Nevada",
      operator: "Code School of NV (independent)",
      description: "Full-stack web development bootcamp in Las Vegas. 12-week intensive program. Partners with local tech companies for placement.",
      annualParticipants: 120,
      fundingSources: ["Tuition", "WIOA scholarships"],
      focusAreas: ["Full-stack web development", "JavaScript/React", "Python", "Cloud"],
      placementRate: 0.78
    },
    {
      name: "Switch ELITE Program",
      operator: "Switch / Innevation Center",
      description: "Executive Leadership in Technology and Engineering program. Trains veterans and transitioning professionals for careers in data center operations and technology.",
      annualParticipants: 50,
      fundingSources: ["Switch corporate", "Veteran affairs"],
      focusAreas: ["Data center operations", "Network engineering", "Cloud infrastructure"],
      placementRate: 0.85
    },
    {
      name: "CompTIA Apprenticeships (NV Partners)",
      operator: "CompTIA / Nevada employers",
      description: "Registered IT apprenticeship programs in Nevada. Combines classroom instruction with on-the-job training at partner employers.",
      annualParticipants: 150,
      fundingSources: ["Federal apprenticeship grants", "Employer investment"],
      focusAreas: ["IT support", "Networking", "Cybersecurity", "Cloud computing"]
    },
    {
      name: "GOED Workforce Innovation Program",
      operator: "Governor's Office of Economic Development",
      description: "State-funded program providing grants to employers for workforce training. Focuses on new-to-Nevada companies and expanding businesses in target sectors.",
      annualParticipants: 1500,
      fundingSources: ["State general fund", "GOED operating budget"],
      focusAreas: ["Tech sector onboarding", "Advanced manufacturing training", "Management development"]
    }
  ]
};

// ── REMOTE WORK & TALENT MIGRATION ──
export const REMOTE_WORK_TRENDS = {
  // Source: Census ACS, LinkedIn Economic Graph, Hired.com, employer surveys
  description: "The COVID-19 pandemic accelerated remote work adoption, driving significant tech talent migration to Nevada from high-cost markets. This trend has moderated but continues to reshape the talent landscape.",
  remoteWorkStatistics: {
    percentFullyRemote2025: 18,  // Percent of NV tech workers fully remote
    percentHybrid2025: 35,       // Percent hybrid
    percentInOffice2025: 47,     // Percent fully in-office
    preCOVIDRemote2019: 5,       // For comparison
    trend: "Hybrid dominant. Fully remote declining from 2021 peak of 45% as companies implement return-to-office policies."
  },
  talentMigrationCorridors: {
    description: "Primary corridors for tech talent moving to Nevada",
    corridors: [
      {
        origin: "San Francisco Bay Area",
        annualTechMigrants: 4500,
        primaryDestination: "Both Reno and Las Vegas",
        drivers: ["No state income tax savings ($15K-25K/year for senior engineers)", "50-60% lower housing costs", "I-80 Reno corridor (3.5 hr drive to SF)", "Remote work policies at Bay Area companies"],
        typicalProfile: "Mid-senior engineers, 28-42 years old, keeping Bay Area remote jobs initially",
        retentionNote: "Many initially keep Bay Area remote jobs then transition to local roles after 1-2 years"
      },
      {
        origin: "Los Angeles / Southern California",
        annualTechMigrants: 2800,
        primaryDestination: "Las Vegas",
        drivers: ["Lower housing costs", "No state income tax", "4-hour drive to LA", "Entertainment and lifestyle alignment"],
        typicalProfile: "Entertainment tech, AdTech, gaming professionals"
      },
      {
        origin: "Seattle / Pacific Northwest",
        annualTechMigrants: 1200,
        primaryDestination: "Reno (primarily)",
        drivers: ["Climate preference", "Outdoor recreation (Tahoe)", "No state income tax (WA already has none, but lower COL)", "Growing tech hub"],
        typicalProfile: "Cloud/data engineers, outdoor enthusiasts, mid-career"
      },
      {
        origin: "Phoenix / Arizona",
        annualTechMigrants: 800,
        primaryDestination: "Las Vegas",
        drivers: ["Proximity (5-hour drive)", "Similar climate", "Gaming/hospitality tech opportunities"],
        typicalProfile: "Fintech and enterprise tech workers"
      },
      {
        origin: "Salt Lake City / Utah",
        annualTechMigrants: 600,
        primaryDestination: "Las Vegas and Reno",
        drivers: ["I-15 and I-80 corridor access", "Tax advantages", "Lifestyle diversity"],
        typicalProfile: "Fintech, SaaS professionals"
      },
      {
        origin: "New York / East Coast",
        annualTechMigrants: 900,
        primaryDestination: "Las Vegas",
        drivers: ["Dramatic cost reduction", "No state/city income tax savings", "Entertainment/hospitality alignment", "Aviation connectivity (LAS is major hub)"],
        typicalProfile: "Fintech, media tech, remote-first workers"
      }
    ],
    totalAnnualTechInMigration: 10800,
    totalAnnualTechOutMigration: 3200,
    netTechTalentGain: 7600
  },
  impactOnEcosystem: {
    positive: [
      "Experienced talent from mature tech ecosystems raising bar for Nevada startups",
      "Network effects — Bay Area connections bring deal flow, partnerships, and customers",
      "Salary benchmarking — incoming talent brings market-rate expectations, pushing salaries up",
      "Entrepreneurial density — more founders starting companies in Nevada",
      "Cultural shift — tech culture becoming more embedded in Nevada communities"
    ],
    challenges: [
      "Housing cost pressure, especially in Reno (up 45% since 2019)",
      "Infrastructure strain (schools, roads, healthcare) in growing communities",
      "Cultural integration with existing non-tech communities",
      "Risk of talent treating Nevada as temporary landing spot rather than permanent home",
      "Some incoming workers keep remote jobs at out-of-state companies, limiting local ecosystem engagement"
    ]
  }
};

// ── DIVERSITY & INCLUSION METRICS ──
export const DIVERSITY_METRICS = {
  // Source: ACS, EEOC data, CompTIA, NCWIT
  description: "Nevada's tech workforce diversity reflects both the state's diverse population and ongoing challenges in representation.",
  statePopulationDiversity: {
    white: 48.1,
    hispanic: 29.5,
    black: 10.3,
    asian: 9.1,
    nativeAmerican: 1.2,
    multiracial: 4.8,
    other: 2.0
  },
  techWorkforceDiversity: {
    white: 52.0,
    hispanic: 18.5,
    black: 7.2,
    asian: 16.8,
    nativeAmerican: 0.8,
    multiracial: 3.5,
    other: 1.2,
    female: 28.0,
    note: "Tech workforce skews whiter and more Asian than state population, with underrepresentation of Hispanic and Black workers"
  },
  initiatives: [
    {
      name: "UNLV Minority Engineering Program",
      description: "Recruitment and retention programs for underrepresented minorities in engineering",
      impact: "UNLV engineering is ~40% URM, significantly above national average"
    },
    {
      name: "Vegas Tech Fund Diversity Initiative",
      description: "Community efforts to increase diversity in Las Vegas tech ecosystem",
      impact: "Mentorship, networking, and scholarship programs"
    },
    {
      name: "StartUpNV Veterans Program",
      description: "Accelerator program for veteran-founded startups in Nevada",
      impact: "8% of StartUpNV portfolio companies are veteran-founded"
    },
    {
      name: "Nevada Women in Tech Coalition",
      description: "Cross-industry coalition promoting women in technology roles",
      impact: "Annual conference, mentorship matching, employer partnerships"
    }
  ]
};

// ── TALENT DEMAND FORECAST ──
export const TALENT_FORECAST = {
  // Source: EMSI/Lightcast, CompTIA, DETR projections
  description: "Projected tech talent demand for Nevada over the next 3 years based on employer growth plans, new facility announcements, and industry trends.",
  projectedDemand: [
    { year: 2026, newPositions: 5500, attritionReplacement: 3200, totalDemand: 8700 },
    { year: 2027, newPositions: 6200, attritionReplacement: 3500, totalDemand: 9700 },
    { year: 2028, newPositions: 7000, attritionReplacement: 3800, totalDemand: 10800 }
  ],
  projectedSupply: [
    { year: 2026, localGraduates: 3100, inMigration: 8000, trainingPrograms: 1200, totalSupply: 12300 },
    { year: 2027, localGraduates: 3300, inMigration: 8500, trainingPrograms: 1400, totalSupply: 13200 },
    { year: 2028, localGraduates: 3500, inMigration: 9000, trainingPrograms: 1600, totalSupply: 14100 }
  ],
  hottest_roles: [
    { role: "AI/ML Engineer", demandGrowth: 35, supplyGrowth: 15, gapSeverity: "critical" },
    { role: "Cybersecurity Engineer", demandGrowth: 25, supplyGrowth: 18, gapSeverity: "high" },
    { role: "Data Center Technician", demandGrowth: 20, supplyGrowth: 22, gapSeverity: "moderate" },
    { role: "Cloud/DevOps Engineer", demandGrowth: 22, supplyGrowth: 16, gapSeverity: "high" },
    { role: "Battery Manufacturing Engineer", demandGrowth: 30, supplyGrowth: 10, gapSeverity: "critical" },
    { role: "Full-Stack Developer", demandGrowth: 15, supplyGrowth: 20, gapSeverity: "low" },
    { role: "Product Manager", demandGrowth: 18, supplyGrowth: 14, gapSeverity: "moderate" }
  ],
  gapAnalysis: "Nevada faces critical talent gaps in AI/ML engineering and battery manufacturing engineering. These gaps are being partially addressed through in-migration from California and targeted training programs, but local education pipeline needs significant expansion to meet demand."
};

// ── HELPER FUNCTIONS ──
export function getSalaryByRole(roleName) {
  return SALARY_DATA.byRole.find(r =>
    r.role.toLowerCase().includes(roleName.toLowerCase())
  );
}

export function getTalentByRegion(regionName) {
  const key = Object.keys(TALENT_POOL.byRegion2025).find(k =>
    k.toLowerCase().includes(regionName.toLowerCase()) ||
    regionName.toLowerCase().includes(k.toLowerCase().replace("county", "").trim())
  );
  return key ? TALENT_POOL.byRegion2025[key] : null;
}

export function getEducationPipeline(schoolName) {
  if (schoolName.toLowerCase().includes("unlv")) return EDUCATION_PIPELINE.universities.unlv;
  if (schoolName.toLowerCase().includes("unr")) return EDUCATION_PIPELINE.universities.unr;
  if (schoolName.toLowerCase().includes("csn")) return EDUCATION_PIPELINE.universities.communityColleges.csn;
  if (schoolName.toLowerCase().includes("tmcc")) return EDUCATION_PIPELINE.universities.communityColleges.tmcc;
  return null;
}

export function getMigrationCorridor(originName) {
  return REMOTE_WORK_TRENDS.talentMigrationCorridors.corridors.find(c =>
    c.origin.toLowerCase().includes(originName.toLowerCase())
  );
}

export default {
  TALENT_POOL,
  SALARY_DATA,
  EDUCATION_PIPELINE,
  WORKFORCE_TRAINING,
  REMOTE_WORK_TRENDS,
  DIVERSITY_METRICS,
  TALENT_FORECAST,
  getSalaryByRole,
  getTalentByRegion,
  getEducationPipeline,
  getMigrationCorridor
};
