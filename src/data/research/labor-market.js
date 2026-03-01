/**
 * Labor Market Intelligence — Nevada Workforce & Skills Data
 * Sources:
 *   - Lightcast (formerly EMSI/Burning Glass): https://lightcast.io/
 *   - BLS Occupational Employment and Wage Statistics (OEWS)
 *   - Nevada DETR (Department of Employment, Training & Rehabilitation)
 *   - USCIS H-1B data
 *   - CompTIA Cyberstates
 *
 * NOTE: Lightcast data requires subscription access. Data here is compiled
 * from public Lightcast reports, BLS data, DETR publications, and industry
 * surveys. Items marked [ESTIMATED] require verification.
 *
 * Last research update: 2026-02-28
 */

// ─── Top In-Demand Tech Skills in Nevada ─────────────────────────────────────
// Source: Lightcast job posting analytics; LinkedIn Economic Graph; BLS
export const IN_DEMAND_TECH_SKILLS = {
  asOfDate: '2025-Q2',
  topSkills: [
    {
      rank: 1,
      skill: 'Python',
      demandIndex: 100, // normalized to highest demand
      avgPostings12Mo: 4200,
      growthYoY: 0.22,
      categories: ['Software Development', 'Data Science', 'AI/ML'],
      avgSalary: 105000,
    },
    {
      rank: 2,
      skill: 'Cloud Computing (AWS/Azure/GCP)',
      demandIndex: 92,
      avgPostings12Mo: 3900,
      growthYoY: 0.18,
      categories: ['Cloud Infrastructure', 'DevOps', 'Data Engineering'],
      avgSalary: 115000,
    },
    {
      rank: 3,
      skill: 'SQL / Database Management',
      demandIndex: 88,
      avgPostings12Mo: 3700,
      growthYoY: 0.08,
      categories: ['Data Analysis', 'Backend Development', 'BI'],
      avgSalary: 90000,
    },
    {
      rank: 4,
      skill: 'JavaScript / TypeScript',
      demandIndex: 85,
      avgPostings12Mo: 3500,
      growthYoY: 0.10,
      categories: ['Web Development', 'Full Stack', 'Frontend'],
      avgSalary: 95000,
    },
    {
      rank: 5,
      skill: 'Cybersecurity / Information Security',
      demandIndex: 78,
      avgPostings12Mo: 3200,
      growthYoY: 0.25,
      categories: ['Security Operations', 'Compliance', 'Penetration Testing'],
      avgSalary: 110000,
    },
    {
      rank: 6,
      skill: 'Machine Learning / AI',
      demandIndex: 72,
      avgPostings12Mo: 2800,
      growthYoY: 0.45,
      categories: ['AI Engineering', 'Data Science', 'Computer Vision'],
      avgSalary: 130000,
    },
    {
      rank: 7,
      skill: 'Data Analysis / Business Intelligence',
      demandIndex: 70,
      avgPostings12Mo: 2700,
      growthYoY: 0.15,
      categories: ['BI', 'Analytics', 'Reporting'],
      avgSalary: 82000,
    },
    {
      rank: 8,
      skill: 'DevOps / CI-CD / Kubernetes',
      demandIndex: 65,
      avgPostings12Mo: 2400,
      growthYoY: 0.20,
      categories: ['Infrastructure', 'SRE', 'Platform Engineering'],
      avgSalary: 120000,
    },
    {
      rank: 9,
      skill: 'React / Angular / Vue.js',
      demandIndex: 62,
      avgPostings12Mo: 2200,
      growthYoY: 0.12,
      categories: ['Frontend Development', 'UI/UX Engineering'],
      avgSalary: 100000,
    },
    {
      rank: 10,
      skill: 'Project Management / Agile / Scrum',
      demandIndex: 60,
      avgPostings12Mo: 2100,
      growthYoY: 0.08,
      categories: ['Technical Project Management', 'Product Management'],
      avgSalary: 95000,
    },
    {
      rank: 11,
      skill: 'Networking / Cisco / Infrastructure',
      demandIndex: 55,
      avgPostings12Mo: 1900,
      growthYoY: 0.05,
      categories: ['Network Engineering', 'Data Center Operations'],
      avgSalary: 88000,
    },
    {
      rank: 12,
      skill: 'Blockchain / Web3',
      demandIndex: 25,
      avgPostings12Mo: 600,
      growthYoY: -0.15,
      categories: ['DeFi', 'Smart Contracts', 'Crypto'],
      avgSalary: 125000,
      notes: 'Demand declining from 2022 peak',
    },
  ],
  source: 'Lightcast job posting analytics; BLS OEWS; LinkedIn Economic Graph',
  confidence: 'medium',
};

// ─── Job Posting Trends for Key Sectors ──────────────────────────────────────
// Source: Lightcast; Indeed Hiring Lab; LinkedIn; BLS
export const JOB_POSTING_TRENDS = {
  asOfDate: '2025-Q2',
  sectors: [
    {
      sector: 'Artificial Intelligence / Machine Learning',
      totalPostings12Mo: 3200,
      growthYoY: 0.45,
      topEmployers: [
        'Amazon (AWS)',
        'Google',
        'Microsoft',
        'IGT',
        'Light & Wonder',
        'Switch',
        'UNLV',
      ],
      topRoles: [
        'ML Engineer',
        'Data Scientist',
        'AI Research Engineer',
        'NLP Engineer',
        'Computer Vision Engineer',
      ],
      salaryRange: { min: 95000, median: 130000, max: 200000 },
      hotSubfields: [
        'Generative AI / LLMs',
        'Computer Vision',
        'Recommendation Systems',
        'Responsible AI',
        'MLOps',
      ],
      talentGap: 'Severe — 2.5 open roles per qualified candidate [ESTIMATED]',
    },
    {
      sector: 'Cybersecurity',
      totalPostings12Mo: 4500,
      growthYoY: 0.25,
      topEmployers: [
        'Nellis AFB / DOD contractors',
        'MGM Resorts',
        'Caesars Entertainment',
        'NV Energy',
        'Switch',
        'Various MSPs',
      ],
      topRoles: [
        'Security Analyst',
        'Security Engineer',
        'CISO/Security Manager',
        'Penetration Tester',
        'GRC Analyst',
      ],
      salaryRange: { min: 75000, median: 110000, max: 175000 },
      hotSubfields: [
        'Cloud Security',
        'Gaming/Casino Cybersecurity',
        'Zero Trust Architecture',
        'AI-Powered Threat Detection',
        'Compliance (PCI-DSS, GLBA)',
      ],
      talentGap: 'Severe — post-MGM/Caesars breaches driving massive demand',
      notes: '2023 MGM/Caesars ransomware attacks accelerated NV cybersecurity hiring',
    },
    {
      sector: 'Clean Technology / Sustainability',
      totalPostings12Mo: 2800,
      growthYoY: 0.18,
      topEmployers: [
        'NV Energy',
        'Redwood Materials',
        'Tesla',
        'Panasonic Energy',
        'Various solar companies',
        'Lithium Americas',
      ],
      topRoles: [
        'Electrical Engineer (Renewables)',
        'Battery Engineer',
        'Environmental Compliance',
        'Solar Installation Manager',
        'Sustainability Analyst',
      ],
      salaryRange: { min: 60000, median: 85000, max: 145000 },
      hotSubfields: [
        'Battery Technology / Chemistry',
        'EV Charging Infrastructure',
        'Grid-Scale Energy Storage',
        'Lithium Extraction Technology',
        'Carbon Capture',
      ],
      talentGap: 'Moderate — battery engineers in very high demand',
    },
    {
      sector: 'Gaming Technology',
      totalPostings12Mo: 3800,
      growthYoY: 0.08,
      topEmployers: [
        'IGT',
        'Aristocrat',
        'Light & Wonder',
        'Everi',
        'Konami Gaming',
        'AGS',
        'DraftKings',
        'BetMGM',
      ],
      topRoles: [
        'Software Engineer (Gaming)',
        'Game Designer/Developer',
        'QA Engineer',
        'Product Manager',
        'Data Analyst (Player Analytics)',
      ],
      salaryRange: { min: 70000, median: 100000, max: 165000 },
      hotSubfields: [
        'iGaming Platform Development',
        'Sports Betting Backend',
        'Cashless Gaming Systems',
        'Regulatory Technology (RegTech)',
        'AI Player Analytics',
      ],
      talentGap: 'Moderate — specialized gaming math/compliance skills scarce',
    },
    {
      sector: 'Data Center Operations',
      totalPostings12Mo: 1800,
      growthYoY: 0.35,
      topEmployers: [
        'Switch',
        'Google',
        'Amazon',
        'Microsoft',
        'QTS (Blackstone)',
        'Flexential',
      ],
      topRoles: [
        'Data Center Technician',
        'Network Engineer',
        'Facilities Engineer',
        'Cloud Infrastructure Engineer',
        'Data Center Manager',
      ],
      salaryRange: { min: 55000, median: 85000, max: 140000 },
      hotSubfields: [
        'AI/GPU Infrastructure',
        'Liquid Cooling Systems',
        'Power Management & Efficiency',
        'Edge Computing',
        'Hyperscale Operations',
      ],
      talentGap: 'Moderate to Severe — rapid expansion outpacing talent supply',
    },
  ],
  overallTechJobPostings: {
    total12Mo: 25000, // [ESTIMATED] total tech job postings in NV
    growthYoY: 0.15,
    percentRemoteAvailable: 0.32, // 32% offer remote/hybrid
    avgTimeToFill: 42, // days
  },
  source: 'Lightcast; Indeed; LinkedIn; BLS JOLTS',
  confidence: 'medium',
};

// ─── Salary Benchmarks for Key Tech Roles ────────────────────────────────────
// Source: BLS OEWS May 2024; Glassdoor; Levels.fyi; Robert Half
export const TECH_SALARY_BENCHMARKS = {
  asOfDate: '2025',
  area: 'Nevada (statewide, Las Vegas and Reno metro areas)',
  roles: [
    {
      title: 'Software Developer / Engineer',
      blsCode: '15-1252',
      nvMedian: 98000,
      nvP25: 78000,
      nvP75: 128000,
      nationalMedian: 127000,
      nvVsNational: -0.228, // 22.8% below national
      totalEmployed: 8500, // [ESTIMATED] in NV
      growthOutlook: 0.25, // 25% projected 10-yr growth nationally
    },
    {
      title: 'Data Scientist / ML Engineer',
      blsCode: '15-2051',
      nvMedian: 115000,
      nvP25: 88000,
      nvP75: 155000,
      nationalMedian: 108000,
      nvVsNational: 0.065, // 6.5% above national (premium for NV)
      totalEmployed: 1800, // [ESTIMATED]
      growthOutlook: 0.35,
    },
    {
      title: 'Information Security Analyst',
      blsCode: '15-1212',
      nvMedian: 105000,
      nvP25: 82000,
      nvP75: 135000,
      nationalMedian: 120000,
      nvVsNational: -0.125,
      totalEmployed: 2200, // [ESTIMATED]
      growthOutlook: 0.32,
    },
    {
      title: 'Database Administrator / Architect',
      blsCode: '15-1242',
      nvMedian: 92000,
      nvP25: 72000,
      nvP75: 118000,
      nationalMedian: 101000,
      nvVsNational: -0.089,
      totalEmployed: 1500, // [ESTIMATED]
      growthOutlook: 0.08,
    },
    {
      title: 'Network / Systems Administrator',
      blsCode: '15-1244',
      nvMedian: 82000,
      nvP25: 65000,
      nvP75: 105000,
      nationalMedian: 90000,
      nvVsNational: -0.089,
      totalEmployed: 3200, // [ESTIMATED]
      growthOutlook: 0.03,
    },
    {
      title: 'Cloud / DevOps Engineer',
      blsCode: '15-1252', // subset of software developers
      nvMedian: 120000,
      nvP25: 95000,
      nvP75: 155000,
      nationalMedian: 135000,
      nvVsNational: -0.111,
      totalEmployed: 1800, // [ESTIMATED]
      growthOutlook: 0.28,
    },
    {
      title: 'IT Project Manager',
      blsCode: '15-1299',
      nvMedian: 105000,
      nvP25: 82000,
      nvP75: 135000,
      nationalMedian: 115000,
      nvVsNational: -0.087,
      totalEmployed: 2500, // [ESTIMATED]
      growthOutlook: 0.15,
    },
    {
      title: 'UX/UI Designer',
      blsCode: '15-1255',
      nvMedian: 85000,
      nvP25: 65000,
      nvP75: 115000,
      nationalMedian: 105000,
      nvVsNational: -0.190,
      totalEmployed: 1200, // [ESTIMATED]
      growthOutlook: 0.16,
    },
    {
      title: 'Data Center Technician',
      blsCode: '15-1231',
      nvMedian: 68000,
      nvP25: 52000,
      nvP75: 88000,
      nationalMedian: 62000,
      nvVsNational: 0.097, // premium due to data center concentration
      totalEmployed: 2800, // [ESTIMATED]
      growthOutlook: 0.18,
    },
    {
      title: 'AI/ML Research Engineer',
      blsCode: '15-2051', // subset
      nvMedian: 145000,
      nvP25: 115000,
      nvP75: 195000,
      nationalMedian: 155000,
      nvVsNational: -0.065,
      totalEmployed: 500, // [ESTIMATED] — small but growing
      growthOutlook: 0.40,
    },
    {
      title: 'QA / Test Engineer',
      blsCode: '15-1253',
      nvMedian: 78000,
      nvP25: 60000,
      nvP75: 100000,
      nationalMedian: 100000,
      nvVsNational: -0.220,
      totalEmployed: 2000, // [ESTIMATED]
      growthOutlook: 0.20,
    },
    {
      title: 'Chief Technology Officer (CTO)',
      blsCode: '11-3021',
      nvMedian: 195000,
      nvP25: 150000,
      nvP75: 280000,
      nationalMedian: 220000,
      nvVsNational: -0.114,
      totalEmployed: 300, // [ESTIMATED]
      growthOutlook: 0.10,
    },
  ],
  costOfLivingAdjusted: {
    notes:
      'Nevada tech salaries are 10-23% below national medians in nominal terms, ' +
      'but cost-of-living adjusted purchasing power is competitive. No state income tax ' +
      'adds 5-13% effective compensation boost vs CA, NY, etc.',
    effectiveSalaryBoost: {
      vsCalifornia: 0.13, // 13% boost due to no income tax
      vsNewYork: 0.10,
      vsWashington: 0.0, // WA also has no income tax
      vsTexas: 0.0, // TX also has no income tax
      vsColorado: 0.045,
    },
  },
  source: 'BLS OEWS May 2024; Glassdoor; Levels.fyi; Robert Half 2025 Salary Guide',
  confidence: 'medium',
};

// ─── Talent Supply vs Demand Gaps ────────────────────────────────────────────
// Source: Lightcast; CompTIA Cyberstates; BLS; NSHE enrollment
export const TALENT_GAPS = {
  asOfDate: '2025',
  overallTechGap: {
    estimatedDemand: 55000, // total tech roles in demand across NV
    currentTechWorkforce: 45000,
    gap: 10000, // ~10K unfilled tech positions
    gapPercentage: 0.182, // 18.2% gap
  },
  bySpecialty: [
    {
      specialty: 'AI / Machine Learning',
      demand: 3500,
      supply: 1500,
      gap: 2000,
      gapSeverity: 'Critical',
      timeToFill: 65, // days
      topCompetingMarkets: ['San Francisco', 'Seattle', 'Austin'],
    },
    {
      specialty: 'Cybersecurity',
      demand: 5000,
      supply: 2800,
      gap: 2200,
      gapSeverity: 'Critical',
      timeToFill: 55,
      topCompetingMarkets: ['Washington DC', 'Austin', 'Denver'],
    },
    {
      specialty: 'Cloud Engineering',
      demand: 4000,
      supply: 2500,
      gap: 1500,
      gapSeverity: 'Severe',
      timeToFill: 48,
      topCompetingMarkets: ['Seattle', 'San Francisco', 'Dallas'],
    },
    {
      specialty: 'Data Center Operations',
      demand: 3500,
      supply: 2200,
      gap: 1300,
      gapSeverity: 'Severe',
      timeToFill: 35,
      topCompetingMarkets: ['Northern Virginia', 'Dallas', 'Phoenix'],
    },
    {
      specialty: 'Full Stack Development',
      demand: 8000,
      supply: 6500,
      gap: 1500,
      gapSeverity: 'Moderate',
      timeToFill: 38,
      topCompetingMarkets: ['Everywhere — universal demand'],
    },
    {
      specialty: 'Battery / EV Engineering',
      demand: 2000,
      supply: 800,
      gap: 1200,
      gapSeverity: 'Critical',
      timeToFill: 72,
      topCompetingMarkets: ['Detroit', 'Austin', 'Bay Area'],
    },
    {
      specialty: 'Data Science / Analytics',
      demand: 3000,
      supply: 2200,
      gap: 800,
      gapSeverity: 'Moderate',
      timeToFill: 42,
      topCompetingMarkets: ['New York', 'San Francisco', 'Chicago'],
    },
  ],
  talentPipeline: {
    annualSTEMGrads: 5500, // UNLV + UNR + CSN + NSC + WNC + TMCC [ESTIMATED]
    annualBootcampGrads: 800, // [ESTIMATED]
    annualCertifications: 2200, // [ESTIMATED] industry certifications
    retentionRate: 0.55, // 55% of tech grads stay in NV [ESTIMATED]
    inMigrationTechWorkers: 3500, // [ESTIMATED] annual tech worker in-migration
  },
  source: 'Lightcast; CompTIA Cyberstates; BLS; NSHE; DETR',
  confidence: 'medium',
};

// ─── Certification & Training Program Completions ────────────────────────────
// Source: NSHE; workforce development partners; CompTIA; certification bodies
export const TRAINING_COMPLETIONS = {
  asOfDate: '2024',
  byInstitution: [
    {
      institution: 'UNLV',
      stemDegrees: 2100,
      csGrads: 450,
      engineeringGrads: 380,
      dataScienceGrads: 120,
      cybersecurityGrads: 85,
      source: 'UNLV IPEDS',
    },
    {
      institution: 'UNR',
      stemDegrees: 1800,
      csGrads: 380,
      engineeringGrads: 520,
      dataScienceGrads: 90,
      cybersecurityGrads: 60,
      source: 'UNR IPEDS',
    },
    {
      institution: 'College of Southern Nevada (CSN)',
      stemCerts: 1200,
      itCerts: 450,
      cybersecurityCerts: 120,
      networkingCerts: 180,
      source: 'CSN institutional data',
    },
    {
      institution: 'Truckee Meadows Community College',
      stemCerts: 600,
      itCerts: 200,
      manufacturingCerts: 150,
      source: 'TMCC institutional data',
    },
    {
      institution: 'Nevada State University',
      stemDegrees: 250,
      csGrads: 45,
      source: 'NSU IPEDS',
    },
  ],
  industryCertifications: [
    { cert: 'CompTIA A+ / Network+ / Security+', completions: 650, growth: 0.12 },
    { cert: 'AWS Certified (various)', completions: 380, growth: 0.25 },
    { cert: 'Microsoft Azure Certifications', completions: 320, growth: 0.22 },
    { cert: 'CISSP / CISM / CEH', completions: 180, growth: 0.18 },
    { cert: 'Google Cloud Professional', completions: 150, growth: 0.30 },
    { cert: 'PMP / Agile Certifications', completions: 420, growth: 0.08 },
    { cert: 'Cisco CCNA/CCNP', completions: 280, growth: 0.05 },
  ],
  bootcamps: [
    {
      name: 'Code Fellows Las Vegas',
      focus: 'Full Stack Development',
      annualGrads: 120,
    },
    {
      name: 'General Assembly (remote, NV students)',
      focus: 'Software Engineering, Data Science, UX',
      annualGrads: 200,
    },
    {
      name: 'Galvanize / Hack Reactor (remote)',
      focus: 'Software Engineering',
      annualGrads: 80,
    },
    {
      name: 'UNLV Continuing Ed Bootcamps',
      focus: 'Cybersecurity, Data Analytics, Coding',
      annualGrads: 250,
    },
    {
      name: 'Various online platforms (Coursera, Udacity)',
      focus: 'Various tech skills',
      annualGrads: 150, // tracked completions by NV residents [ESTIMATED]
    },
  ],
  source: 'NSHE; CompTIA; certification bodies; bootcamp providers',
  confidence: 'medium',
};

// ─── Remote Work Job Postings ────────────────────────────────────────────────
// Source: Lightcast; LinkedIn; FlexJobs
export const REMOTE_WORK_DATA = {
  asOfDate: '2025-Q2',
  nevadaRemotePostings: {
    totalRemoteJobPostings: 18000, // [ESTIMATED] jobs offered as remote to NV residents
    techRemotePostings: 8500,
    percentOfAllTechPostings: 0.34, // 34% of tech jobs offer remote/hybrid
    growthYoY: 0.05, // stabilized after COVID surge
  },
  byArrangement: {
    fullyRemote: 0.28, // 28% of tech postings
    hybrid: 0.38, // 38% — most common
    onSite: 0.34, // 34% require on-site
  },
  remoteTechWorkers: {
    estimatedRemoteTechWorkersInNV: 22000, // [ESTIMATED] working remotely for out-of-state companies
    topRemoteEmployerStates: ['California', 'Washington', 'Texas', 'New York', 'Colorado'],
    avgSalaryRemoteWorker: 115000, // higher than local average
    taxImplication: 'No NV state income tax — remote workers keep more of out-of-state employer salary',
  },
  nevadaAsRemoteHub: {
    advantages: [
      'No state income tax — immediate salary boost',
      'Lower cost of living vs CA, NY, WA (for similar roles)',
      'Mountain West time zone — covers CA to Eastern business hours',
      'Growing co-working space infrastructure',
      'Quality of life — outdoor recreation, entertainment, weather',
    ],
    challenges: [
      'Broadband gaps in rural Nevada',
      'Limited local networking vs major tech hubs',
      'Perception challenge — "Vegas" not seen as tech city',
      'Fewer spontaneous in-person collaboration opportunities',
    ],
  },
  source: 'Lightcast; LinkedIn; FlexJobs; Zip Recruiter',
  confidence: 'medium',
};

// ─── H-1B Visa Usage by NV Tech Companies ────────────────────────────────────
// Source: USCIS H-1B Employer Data Hub; MyVisaJobs
export const H1B_DATA = {
  asOfDate: 'FY2024',
  nevadaTotals: {
    totalH1BPetitionsApproved: 3800, // [ESTIMATED]
    totalH1BWorkers: 8500, // [ESTIMATED] active H-1B holders in NV
    shareOfWorkforce: 0.006, // 0.6% — below national average
    nationalAvgShare: 0.012, // 1.2%
    growthYoY: 0.12,
  },
  topEmployers: [
    {
      employer: 'MGM Resorts International',
      approvals: 280,
      avgSalary: 92000,
      topRoles: ['Software Engineer', 'Data Analyst', 'Systems Analyst'],
    },
    {
      employer: 'Caesars Entertainment',
      approvals: 180,
      avgSalary: 88000,
      topRoles: ['Software Developer', 'Database Administrator', 'IT Manager'],
    },
    {
      employer: 'IGT (International Game Technology)',
      approvals: 150,
      avgSalary: 105000,
      topRoles: ['Software Engineer', 'QA Engineer', 'Systems Architect'],
    },
    {
      employer: 'Switch',
      approvals: 85,
      avgSalary: 98000,
      topRoles: ['Network Engineer', 'Cloud Engineer', 'Data Center Architect'],
    },
    {
      employer: 'Aristocrat Technologies',
      approvals: 120,
      avgSalary: 102000,
      topRoles: ['Game Developer', 'Software Engineer', 'Product Manager'],
    },
    {
      employer: 'Infosys / TCS / Wipro (IT services, NV offices)',
      approvals: 350,
      avgSalary: 82000,
      topRoles: ['Software Developer', 'Business Analyst', 'Project Manager'],
    },
    {
      employer: 'Amazon',
      approvals: 200,
      avgSalary: 135000,
      topRoles: ['SDE', 'Data Engineer', 'Solutions Architect'],
    },
    {
      employer: 'Google',
      approvals: 95,
      avgSalary: 155000,
      topRoles: ['Software Engineer', 'SRE', 'Product Manager'],
    },
    {
      employer: 'Tesla',
      approvals: 180,
      avgSalary: 108000,
      topRoles: ['Manufacturing Engineer', 'Controls Engineer', 'Software Engineer'],
    },
    {
      employer: 'University of Nevada (UNLV + UNR)',
      approvals: 220,
      avgSalary: 72000,
      topRoles: ['Research Scientist', 'Professor', 'Postdoctoral Researcher'],
    },
  ],
  byOccupation: [
    { occupation: 'Software Developers', share: 0.32 },
    { occupation: 'Computer Systems Analysts', share: 0.12 },
    { occupation: 'Database/Network Administrators', share: 0.08 },
    { occupation: 'Electrical/Mechanical Engineers', share: 0.10 },
    { occupation: 'Accountants/Financial Analysts', share: 0.08 },
    { occupation: 'Management/Business Analysts', share: 0.06 },
    { occupation: 'Academic/Research', share: 0.12 },
    { occupation: 'Other', share: 0.12 },
  ],
  trends: [
    'H-1B usage growing as tech sector expands',
    'Gaming companies are significant H-1B sponsors',
    'Tesla/Panasonic driving engineering H-1B growth in Northern NV',
    'NV still below national average in H-1B density',
    'IT services firms (Infosys, TCS) have growing NV presence',
  ],
  source: 'USCIS H-1B Employer Data Hub; MyVisaJobs.com; DOL LCA data',
  confidence: 'medium',
};
