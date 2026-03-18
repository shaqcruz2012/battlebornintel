// ─────────────────────────────────────────────────────────────────────
// Battle Born Intelligence — Nevada Ecosystem Resource Data
// Source: BBI_Ecosystem_Graph.html (researched & MIT stress-tested)
// Coordinates: x=SME→IDE (0-10), y=ICP stage score (0-10)
// DO NOT edit coordinates manually — see CLAUDE.md for scoring methodology
// ─────────────────────────────────────────────────────────────────────

// Stage 0-3 labels with ICP revenue anchors
export const STAGE_NAMES = [
  'Concept / TRL 1-4 / $0',
  'Validation / MVP / $0-$5K MRR',
  'Early Revenue / PMF / $5K-$100K MRR',
  'Growth / Scale / $100K+ MRR'
];

// Stage band Y-axis boundaries (data space 0-10)
export const STAGE_Y_BANDS = [
  { label: '0 · CONCEPT  /  TRL 1-4  /  $0',           yMin: 0,   yMax: 2.1,  color: 'rgba(77,157,224,0.045)'  },
  { label: '1 · VALIDATION  /  MVP  /  $0-$5K MRR',    yMin: 2.2, yMax: 4.9,  color: 'rgba(126,184,247,0.045)' },
  { label: '2 · EARLY REV  /  PMF  /  $5K-$100K MRR',  yMin: 5.0, yMax: 6.9,  color: 'rgba(0,212,170,0.045)'   },
  { label: '3 · GROWTH  /  SCALE  /  $100K+ MRR',      yMin: 7.0, yMax: 10.0, color: 'rgba(0,245,200,0.07)'    },
];

// Category → color mapping (Palantir terminal palette)
export const COLOR_MAP = {
  'IDE-Research':         '#4d9de0',
  'IDE-Early':            '#7eb8f7',
  'IDE-Growth':           '#00d4aa',
  'IDE-Scale':            '#00f5c8',
  'Hybrid-Ecosystem':     '#f5a623',
  'Hybrid-All':           '#f5a623',
  'Hybrid-GovCon':        '#b07fe8',
  'Hybrid-Manufacturing': '#e07c3a',
  'Hybrid-Export':        '#d4884a',
  'SME-Traditional':      '#3dba6f',
  'Community':            '#e84393',
  'University':           '#9b8af7',
  'Coworking':            '#2ecfa0',
  'SME-Financial':        '#5dd68a',
};

// ── CORE (19 primary + 11 Stage 3 growth orgs) ──────────────────────
export const coreData = [
  // Stage 0 – Concept/Research (y ≈ 0.1–0.4)
  { name:'DRI Technology Transfer', abbr:'DRI', type:'Research Institution', x:8.0, y:0.7, size:2, cat:'IDE-Research', track:'IDE', stageN:0, geo:'Statewide', funding:'Grant/Pre-Seed', industry:'Environmental Science, Water, Renewable Energy', website:'dri.edu' },
  { name:'UNLV Office of Economic Dev.', abbr:'UNLVOED', type:'University Tech Transfer', x:8.5, y:1.3, size:3, cat:'IDE-Research', track:'IDE', stageN:0, geo:'Las Vegas / Southern NV', funding:'Grant/Pre-Seed', industry:'Research Spin-Outs, IP Commercialization', website:'unlv.edu/oed' },
  { name:'UNR NVRIC', abbr:'NVRIC', type:'University Tech Transfer', x:8.5, y:1.6, size:3, cat:'IDE-Research', track:'IDE', stageN:0, geo:'Reno / Northern NV', funding:'Grant/Pre-Seed', industry:'Research Spin-Outs, IP Commercialization', website:'nvric.org' },
  // Stage 1 – Pre-Revenue/Validation (y ≈ 0.5–0.9)
  { name:'Nevada Knowledge Fund', abbr:'NKF', type:'Grant Program', x:7.0, y:3.0, size:4, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:1, geo:'Statewide', funding:'Grant Funding (TRL Advancement)', industry:'Research Commercialization, Deep Tech', website:'goed.nv.gov/knowledge-fund' },
  { name:'gener8tor gBETA', abbr:'gBETA', type:'Accelerator (Free)', x:7.0, y:3.6, size:3, cat:'IDE-Early', track:'IDE', stageN:1, geo:'Reno & Las Vegas', funding:'Pre-Seed', industry:'Technology-Enabled Startups', website:'gener8tor.com/nevada' },
  { name:'Zero Labs Innovation Launchpad', abbr:'ZeroLabs', type:'Accelerator', x:7.2, y:4.6, size:4, cat:'IDE-Early', track:'IDE', stageN:1, geo:'Las Vegas (Statewide)', funding:'Pre-Seed/Seed', industry:'Gaming, Hospitality, Entertainment, Sports Tech', website:'zerolabs.io' },
  { name:'SCORE Nevada', abbr:'SCORE', type:'Mentoring', x:0.8, y:2.8, size:4, cat:'SME-Traditional', track:'SME', stageN:1, geo:'Statewide', funding:'Self-Funded, SBA, Traditional', industry:'Traditional Small Business', website:'score.org/northernnevada' },
  { name:"Nevada Women's Business Center", abbr:'WBC', type:'Business Advising', x:1.1, y:3.0, size:3, cat:'SME-Traditional', track:'SME', stageN:1, geo:'Statewide', funding:'Microloans, SBA, Self-Funded', industry:'All (Women, Minority, Veteran Focus)', website:'nevadawbc.org' },
  { name:'Office of Entrepreneurship (GOED)', abbr:'GOEDOE', type:'Ecosystem Coordination', x:5.2, y:3.8, size:6, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:1, geo:'Statewide', funding:'Ecosystem Connections', industry:'Innovation, Early-Stage, Entrepreneurship', website:'goed.nv.gov' },
  // Stage 2 – Early Revenue (y ≈ 1.0–1.6)
  { name:'StartUpNV AccelerateNV', abbr:'StartUpNV', type:'Accelerator', x:7.5, y:5.5, size:5, cat:'IDE-Early', track:'IDE', stageN:2, geo:'Statewide', funding:'Pre-Seed/Seed', industry:'B2B SaaS, Enterprise Solutions, Technology', website:'startupnv.org' },
  { name:'AngelNV (SSBCI)', abbr:'AngelNV', type:'Angel Investment Network', x:8.5, y:5.7, size:4, cat:'IDE-Growth', track:'IDE', stageN:2, geo:'Statewide', funding:'Angel/Seed $200K–$400K', industry:'Innovation-Driven Enterprises', website:'startupnv.org/angelnv' },
  { name:'FundNV', abbr:'FundNV', type:'Venture Capital Fund', x:9.0, y:5.2, size:5, cat:'IDE-Growth', track:'IDE', stageN:2, geo:'Statewide', funding:'Pre-Seed/Seed $100K–$400K', industry:'Technology, Scalable Startups', website:'fundnv.com' },
  { name:'gener8tor Investment Accelerator', abbr:'g8tor', type:'Accelerator + Investment', x:9.2, y:6.5, size:4, cat:'IDE-Growth', track:'IDE', stageN:2, geo:'Reno & Las Vegas', funding:'Seed/Series A', industry:'Advanced Energy, CleanTech, Battery Tech', website:'gener8tor.com/nevada' },
  { name:'Nevada SBDC', abbr:'SBDC', type:'Business Advising', x:4.0, y:5.3, size:8, cat:'Hybrid-All', track:'Hybrid', stageN:2, geo:'Statewide (Multiple)', funding:'All Types', industry:'All Industries', website:'nevadasbdc.org' },
  { name:'Nevada VBOC', abbr:'VBOC', type:'Business Advising', x:1.0, y:4.0, size:3, cat:'SME-Traditional', track:'SME', stageN:2, geo:'Statewide', funding:'SBA, Self-Funded, Veteran Loans', industry:'All (Veteran, Military Spouse Focus)', website:'nvvboc.org' },
  // Stage 3 – Growth/Scaling (y ≈ 1.7–2.5)
  { name:'1864 Fund', abbr:'1864', type:'Venture Capital Fund', x:9.5, y:7.0, size:5, cat:'IDE-Growth', track:'IDE', stageN:3, geo:'Nevada & Western US', funding:'Seed $250K–$500K', industry:'Scalable Tech, Western US Focus', website:'1864.fund' },
  { name:'Nevada APEX Accelerator', abbr:'APEX', type:'Gov Contracting Support', x:3.5, y:8.4, size:5, cat:'Hybrid-GovCon', track:'Hybrid', stageN:3, geo:'Statewide', funding:'Contract Revenue (Defense/Fed)', industry:'Defense, Federal Contractors, Gov Suppliers', website:'goed.nv.gov' },
  { name:'Manufacture Nevada (MEP)', abbr:'MEP', type:'Manufacturing Support', x:2.2, y:8.6, size:6, cat:'Hybrid-Manufacturing', track:'Hybrid', stageN:3, geo:'Statewide', funding:'Traditional Loans, Revenue-Based', industry:'Manufacturing, Industrial, Supply Chain', website:'manufacturenevada.com' },
  { name:'Nevada STEP Grant Program', abbr:'STEP', type:'Export Grant Program', x:2.0, y:7.8, size:3, cat:'Hybrid-Export', track:'Hybrid', stageN:3, geo:'Statewide', funding:'Grant up to $6K Trade Mission', industry:'Manufacturing, Goods Exporters, International Trade', website:'goed.nv.gov' },
];

export const stage3Data = [
  { name:'Battle Born Venture', abbr:'BBV', type:'State VC Program (GOED)', x:9.0, y:7.8, size:5, cat:'IDE-Growth', track:'IDE', stageN:3, geo:'Statewide', funding:'Equity $100K–$1M (Series A)', industry:'Aerospace, Healthcare, IT, Energy, High-Growth Tech', website:'battlebornventure.com' },
  { name:'Nevada Catalyst Fund (SSBCI)', abbr:'NVCatalyst', type:'State Venture Fund', x:9.0, y:7.8, size:4, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Statewide', funding:'SSBCI Co-Invest $100K–$1M', industry:'High-Growth Tech, Innovation-Driven', website:'nvsmallbiz.org' },
  { name:'Sierra Angels', abbr:'S.Angels', type:'Angel Investor Network', x:8.5, y:6.2, size:4, cat:'IDE-Growth', track:'IDE', stageN:3, geo:'N. Lake Tahoe / Reno / Statewide', funding:'Angel $25K–$500K', industry:'Technology, Cleantech, Various', website:'sierraangels.com' },
  { name:'Ozmen Ventures', abbr:'OzmenV', type:'Venture Capital Firm', x:9.5, y:8.8, size:4, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Reno', funding:'Series A/B Equity Investment', industry:'Tech, Advanced Manufacturing, Deep Tech', website:'ozmenventures.com' },
  { name:'Reno Seed Fund', abbr:'RenoSF', type:'Seed-Stage VC', x:9.0, y:6.8, size:3, cat:'IDE-Growth', track:'IDE', stageN:3, geo:'Reno / Northern NV', funding:'Seed $250K–$1M', industry:'SaaS, FinTech, Life Sciences', website:'renoseedfund.com' },
  { name:'RAA Ventures', abbr:'RAA', type:'Angel/VC (Seed–Series A)', x:8.5, y:8.0, size:3, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Las Vegas', funding:'Seed to Series A+', industry:'Consumer Internet, eCommerce, Mobile Tech', website:'raaventures.com' },
  { name:'SAGE (SBIR/STTR Program)', abbr:'SAGE', type:'Federal Grant Accelerator', x:7.5, y:6.7, size:4, cat:'IDE-Research', track:'IDE', stageN:3, geo:'Statewide (UNR + UNLV)', funding:'SBIR Phase I $225K / Phase II $750K', industry:'Deep Tech, R&D, All Tech Sectors', website:'unr.edu/sage' },
  { name:'Nevada State Dev. Corp (NSDC)', abbr:'NSDC', type:'SBA 504 Loan Provider', x:1.5, y:8.2, size:4, cat:'SME-Financial', track:'SME', stageN:3, geo:'Statewide', funding:'SBA 504 Loans, Commercial Real Estate', industry:'Established SMBs, Expansion-Stage', website:'nsdc.com' },
  { name:'Desert Forge Ventures', abbr:'DFV', type:'Venture Capital Fund', x:9.0, y:8.2, size:3, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Las Vegas', funding:'Seed to Series A', industry:'Tech Diversification, Nevada Economy', website:'desertforgeventures.com' },
  { name:'Access Community Capital (CDFI)', abbr:'ACCDFI', type:'CDFI / Community Lender', x:1.0, y:7.9, size:3, cat:'SME-Financial', track:'SME', stageN:3, geo:'Statewide', funding:'Small Business Loans, Contract Financing', industry:'Underrepresented Entrepreneurs, All SMBs', website:'accesscommunitycapital.org' },
  { name:'Rebel Venture Fund (UNLV)', abbr:'RVF', type:'Student-Run VC (UNLV)', x:7.0, y:5.8, size:3, cat:'IDE-Growth', track:'IDE', stageN:2, geo:'Las Vegas / Southern NV', funding:'Equity, All Stages', industry:'Tech, Hospitality, Community Impact', website:'rebelventurefund.com' },
];

export const expandedData = [
  { name:'Tech Alley', abbr:'TechAlley', type:'Community / Networking Nonprofit', x:4.5, y:3.4, size:4, cat:'Community', track:'Hybrid', stageN:1, geo:'Las Vegas & Reno', funding:'Free Events', industry:'Tech, Startups, All Sectors', website:'techalley.org' },
  { name:'NCET', abbr:'NCET', type:'Networking / Education Nonprofit', x:4.2, y:3.2, size:4, cat:'Community', track:'Hybrid', stageN:1, geo:'Reno / Northern NV', funding:'Membership-Based', industry:'Tech, Business, All Sectors', website:'ncet.org' },
  { name:'StartUp Vegas', abbr:'SUVegas', type:'Community / Events', x:3.0, y:2.5, size:3, cat:'Community', track:'Hybrid', stageN:1, geo:'Las Vegas', funding:'Free Events, Sponsorships', industry:'Tech, Startups, All Sectors', website:'startupvegas.com' },
  { name:'Vegas Young Professionals', abbr:'VYP', type:'Professional Network', x:3.0, y:4.0, size:3, cat:'Community', track:'SME', stageN:1, geo:'Las Vegas', funding:'Membership-Based', industry:'All Industries, Young Professionals', website:'vegyp.com' },
  { name:'EDAWN', abbr:'EDAWN', type:'Regional Dev Authority', x:4.5, y:6.5, size:5, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:2, geo:'Reno / Western NV', funding:'Public-Private Partnership', industry:'Economic Development, Startups, Manufacturing', website:'edawn.org' },
  { name:'LVGEA', abbr:'LVGEA', type:'Regional Dev Authority', x:4.5, y:6.8, size:5, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:2, geo:'Las Vegas / Southern NV', funding:'Public-Private Partnership', industry:'Economic Development, Business Attraction', website:'lvgea.org' },
  { name:'UNLV Blackfire Innovation', abbr:'Blackfire', type:'University Innovation Lab', x:7.0, y:3.2, size:4, cat:'University', track:'IDE', stageN:1, geo:'Las Vegas', funding:'Grant/Pre-Seed', industry:'Hospitality Tech, Gaming, Caesars-UNLV Joint', website:'blackfireinnovation.com' },
  { name:'UNLV Troesh Center', abbr:'Troesh', type:'University Entrepreneurship Ctr', x:6.5, y:1.0, size:3, cat:'University', track:'IDE', stageN:0, geo:'Las Vegas (UNLV)', funding:'Educational / Grant-Backed', industry:'Entrepreneurship Ed, Angel Capital', website:'unlv.edu/business/cfe' },
  { name:'UNR Innevation Center', abbr:'Innevation', type:'University Incubator / Cowork', x:6.5, y:4.4, size:5, cat:'University', track:'IDE', stageN:1, geo:'Reno (UNR)', funding:'Membership / Grant-Backed', industry:'Deep Tech, Research Spin-Outs, All Sectors', website:'unr.edu/innevation' },
  { name:'UNR Office Enterprise & Innovation', abbr:'UNROEI', type:'University Tech Commercialization', x:7.2, y:1.5, size:3, cat:'University', track:'IDE', stageN:0, geo:'Reno (UNR)', funding:'Grant/Pre-Seed', industry:'Research Commercialization, IP Licensing', website:'unr.edu/enterprise-innovation' },
  { name:'Blackstone LaunchPad NV', abbr:'BSLNV', type:'University Student Entrepreneurship', x:6.0, y:0.8, size:3, cat:'University', track:'IDE', stageN:0, geo:'UNLV & UNR', funding:'Blackstone-Funded', industry:'Student Startups, All Sectors', website:'unlv.edu/entrepreneurship' },
  { name:'Innevation Center (Las Vegas)', abbr:'InnevLV', type:'Coworking / Incubator', x:5.0, y:4.2, size:4, cat:'Coworking', track:'Hybrid', stageN:1, geo:'Las Vegas', funding:'Membership-Based', industry:'Tech Startups, Creatives, All Sectors', website:'innevationcenter.com' },
  { name:"Adam's Hub", abbr:'AdamsHub', type:'Startup Incubator / Cowork', x:4.2, y:4.3, size:3, cat:'Coworking', track:'Hybrid', stageN:1, geo:'Carson City', funding:'Membership-Based', industry:'Startups, SMBs, Rural NV', website:'adamshub.com' },
  { name:'Reno Collective', abbr:'RenoColl', type:'Coworking Space', x:2.5, y:2.7, size:3, cat:'Coworking', track:'SME', stageN:1, geo:'Reno (Midtown)', funding:'Membership-Based', industry:'Freelancers, Creatives, Startups', website:'renocollective.com' },
  { name:'Henderson Chamber Launchpad', abbr:'HLaunch', type:'Business Incubator', x:2.3, y:4.0, size:3, cat:'Community', track:'SME', stageN:1, geo:'Henderson', funding:'Low-Cost Incubation', industry:'All Industries, Local SMBs', website:'hendersonchamber.com/launchpad' },
  { name:'Nevada State Bank SBA', abbr:'NSBSBA', type:'SBA Lending', x:1.2, y:5.4, size:3, cat:'SME-Financial', track:'SME', stageN:2, geo:'Statewide', funding:'SBA 7(a), 504 Loans', industry:'All Small Businesses', website:'nsbank.com' },
  { name:'Nevada Microenterprise Initiative', abbr:'NMI', type:'Microloan / CDFI', x:0.6, y:2.3, size:3, cat:'SME-Financial', track:'SME', stageN:1, geo:'Statewide', funding:'Microloans up to $50K', industry:'Microenterprises, Low-Income Founders', website:'nvinitiative.org' },
  { name:'City of Las Vegas Innovation', abbr:'LVInnov', type:'Municipal Innovation Program', x:5.0, y:3.5, size:4, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:1, geo:'Las Vegas (Downtown)', funding:'City-Backed, Grants', industry:'Smart City, Urban Tech, All Sectors', website:'lasvegasnevada.gov/innovation' },
  { name:'Ozmen Center (UNR)', abbr:'OzmenCtr', type:'University Entrepreneurship Hub', x:6.2, y:4.5, size:3, cat:'University', track:'IDE', stageN:1, geo:'Reno (UNR)', funding:'University-Backed', industry:'Entrepreneurship, Mentorship, All Sectors', website:'unr.edu/ozmen' },
  { name:'Reno Startup Week', abbr:'RSW', type:'Annual Startup Event', x:4.0, y:3.5, size:2, cat:'Community', track:'Hybrid', stageN:1, geo:'Reno / Statewide', funding:'Sponsor-Funded Event', industry:'All Startups, Ecosystem Building', website:'renostartupweek.com' },
  { name:'Nevada Partners', abbr:'NVPtnrs', type:'Workforce / Entrepreneurship Program', x:0.7, y:1.0, size:2, cat:'SME-Traditional', track:'SME', stageN:0, geo:'Las Vegas (North LV)', funding:'Federal / Grant-Funded', industry:'Underserved Communities, Microenterprise', website:'nevadapartners.org' },
  { name:'36|86 Conference', abbr:'36|86', type:'Annual Investor Conference', x:7.2, y:5.5, size:3, cat:'Community', track:'IDE', stageN:2, geo:'Las Vegas', funding:'Sponsor-Funded Event', industry:'Early-Stage Startups, Investor Pitching', website:'3686.com' },
  { name:'Greater Nevada Credit Union Biz', abbr:'GNCUBiz', type:'Credit Union / SMB Lending', x:1.0, y:2.5, size:3, cat:'SME-Financial', track:'SME', stageN:1, geo:'Statewide', funding:'Business Loans, Lines of Credit', industry:'All Small Businesses', website:'gncu.org' },
  { name:'Prestamos CDFI Nevada', abbr:'Prestamos', type:'CDFI / Minority Business Lender', x:0.9, y:4.2, size:3, cat:'SME-Financial', track:'SME', stageN:2, geo:'Statewide', funding:'Small Business Loans, Training', industry:'Minority-Owned, Women-Owned SMBs', website:'prestamoscdfi.org' },
  { name:'International Innovation Ctr LV', abbr:'IICLV', type:'City-Backed Innovation Hub', x:5.2, y:3.0, size:3, cat:'Coworking', track:'Hybrid', stageN:1, geo:'Las Vegas (Downtown)', funding:'City of LV Funded', industry:'Tech Startups, Prototype Testing', website:'lasvegasnevada.gov' },

  // ── GAP FILL 1: x:2–5, y:0–2 (Concept / Hybrid-SME zone) ──────────
  { name:'Rural Nevada Dev. Corp (RNDC)', abbr:'RNDC', type:'Rural Dev / CDFI / Revolving Loan', x:2.0, y:0.9, size:3, cat:'SME-Traditional', track:'SME', stageN:0, geo:'Rural Nevada (Statewide)', funding:'USDA Business & Industry Loans, Revolving Funds', industry:'Rural SMBs, Agriculture, Tourism, Manufacturing', website:'rndcnv.org' },
  { name:'TMCC Entrepreneurship (EPIC)', abbr:'TMCC EPIC', type:'Community College Entrepreneurship', x:2.8, y:0.6, size:3, cat:'Community', track:'SME', stageN:0, geo:'Reno (Truckee Meadows CC)', funding:'Educational / Workforce Grants', industry:'Advanced Manufacturing, Logistics, Clean Energy Workforce', website:'tmcc.edu/epic' },
  { name:'Nevada B&I Resource Hub', abbr:'NV B&I', type:'State Business Portal / Resource Aggregator', x:3.0, y:1.2, size:3, cat:'Hybrid-Ecosystem', track:'Hybrid', stageN:0, geo:'Statewide', funding:'No-Cost Navigation & Referrals', industry:'All Businesses, All Stages — concept through growth', website:'business.nv.gov' },
  { name:'SBA Nevada District Office', abbr:'SBA NV', type:'Federal SBA District Office', x:2.5, y:1.5, size:4, cat:'SME-Traditional', track:'SME', stageN:0, geo:'Las Vegas & Carson City', funding:'SBA Programs, Training, Certifications', industry:'All Small Businesses, Federal Contracting, Disaster Recovery', website:'sba.gov/district/nevada' },
  { name:'Nevada Chambers of Commerce Network', abbr:'NV Chambers', type:'Chamber Network / Business Advocacy', x:2.2, y:1.8, size:3, cat:'Community', track:'SME', stageN:0, geo:'Statewide (Elko, Carson Valley, White Pine, etc.)', funding:'Membership Dues, Local Grants', industry:'Rural SMBs, Local Commerce, Tourism, Retail', website:'nvchamber.org' },
  { name:'Audacity Fund Reno', abbr:'Audacity', type:'Inclusive Economy Fund / Accelerator', x:3.5, y:1.5, size:3, cat:'Community', track:'Hybrid', stageN:0, geo:'Reno / Northern NV', funding:'$5M Fund Target, Grants, Microloans', industry:'Underrepresented Tech Entrepreneurs, Inclusive Economy', website:'audacityfund.com' },
  { name:'USDA Rural Dev Nevada', abbr:'USDA RD', type:'Federal Rural Business Financing', x:2.0, y:1.1, size:3, cat:'SME-Traditional', track:'SME', stageN:0, geo:'Rural Nevada', funding:'Business & Industry Loans, Microentrepreneur Assistance', industry:'Rural Agriculture, Manufacturing, Tourism, Small Biz', website:'rd.usda.gov/nv' },

  // ── GAP FILL 2: y:9–10 (Scale-up / Series B+ / National Programs) ──
  { name:'Nevada Tech Hub (EDA)', abbr:'NV TechHub', type:'Federal EDA Tech Hub Initiative', x:6.5, y:9.2, size:5, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Reno / Statewide (UNR-led)', funding:'EDA Tech Hub Federal Designation + Grants', industry:'Battery Tech, EV Supply Chain, Cleantech, Critical Minerals', website:'unr.edu/nevada-tech-hub' },
  { name:'NSF Engines (Futures Engine SW)', abbr:'NSF Engine', type:'NSF Regional Innovation Engine', x:7.5, y:9.5, size:4, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Statewide (UNLV + DRI-led)', funding:'NSF $160M+ Engine Designation', industry:'Deep Tech, Climate, Sustainability, Advanced Materials', website:'nsf.gov/engines' },
  { name:'Recharge Nevada Initiative (UNR)', abbr:'RechargeNV', type:'Federal-State Clean Energy Initiative', x:6.0, y:9.0, size:4, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Northern NV / Statewide', funding:'EDA TechHub + DOE Grant Funding', industry:'Battery Recycling, EV, Lithium, Clean Energy Mfg', website:'unr.edu/recharge-nevada' },
  { name:'Battle Born Growth Microloan', abbr:'BBGrowth', type:'State Working Capital Loan Program', x:3.5, y:9.2, size:3, cat:'SME-Financial', track:'SME', stageN:3, geo:'Statewide', funding:'Loans up to $250K (<$5M rev, <100 employees)', industry:'Growth-Stage SMBs, All Sectors', website:'goed.nv.gov/battle-born-growth' },
  { name:'VTF Capital (VegasTechFund)', abbr:'VTFCap', type:'Seed VC / Corporate Venture', x:9.0, y:9.3, size:3, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Las Vegas', funding:'Seed + Series A, Avg $500K check', industry:'Commerce, Fintech, Marketplaces, Decentralized Tech', website:'vtf.co' },
  { name:'Hard Yaka', abbr:'HardYaka', type:'Venture Capital / Decentralized Tech', x:8.5, y:9.5, size:3, cat:'IDE-Scale', track:'IDE', stageN:3, geo:'Crystal Bay, NV (Statewide)', funding:'Seed–Growth, Avg $500K, 165 cos, 7 unicorns', industry:'Identity, Payments, Decentralized Protocols, Marketplaces', website:'hardyaka.com' },
  { name:'Nevada Business Opportunity Fund', abbr:'NBOF', type:'CDFI / Small Biz Loan Fund', x:2.0, y:9.1, size:3, cat:'SME-Financial', track:'SME', stageN:3, geo:'Statewide', funding:'Loans for Established Biz Expansion', industry:'Established SMBs, Minority-Owned, Expansion-Stage', website:'nevadabusinessopportunityfund.org' },
];


// Convenience: full core dataset (core + stage3)
export const coreAll = [...coreData, ...stage3Data];

// Convenience: full expanded dataset
export const allOrgs = [...coreData, ...stage3Data, ...expandedData];
