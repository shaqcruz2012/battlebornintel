export const GRAPH_FUNDS = [
  { id:"nve_ppa", name:"NV Energy PPAs", type:"Utility PPA" },
  { id:"blm_row", name:"BLM ROW Program", type:"Federal Land" },
  { id:"doe_lpo", name:"DOE LPO", type:"Federal Loan" },
  { id:"itc", name:"ITC (30%)", type:"Federal Tax" },
  { id:"ptc", name:"PTC", type:"Federal Tax" },
  { id:"pucn_irp", name:"PUCN 2024 IRP", type:"Regulatory" },
  { id:"nv_incentive", name:"NV State Incentives", type:"State" },
];

// ============================================================================
// PEOPLE — 45 key individuals across the NV energy ecosystem
// ============================================================================
export const PEOPLE = [
  // --- NV Energy Leadership ---
  { id:"p_cannon", name:"Doug Cannon", role:"President/CEO, NV Energy", companyId:null, note:"Leads utility clean transition strategy. Overseeing $6B+ capital plan through 2030." },
  { id:"p_shortino", name:"Paul Shortino", role:"VP Transmission & Distribution, NV Energy", companyId:null, note:"Greenlink West/North project executive. Manages $4.2B transmission capital program." },
  { id:"p_brigger", name:"Jeff Brigger", role:"Director Renewable Procurement, NV Energy", companyId:null, note:"Oversees IRP procurement and All-Source RFPs. 2024 cycle: 4GW+ bids received." },
  { id:"p_matuska", name:"Tony Matuska", role:"VP Generation, NV Energy", companyId:null, note:"Coal-to-clean transition strategy. Sierra Solar project lead. Reid Gardner repurposing." },
  { id:"p_stoltz", name:"Adam Stoltz", role:"President, BHE Renewables", companyId:null, note:"Berkshire Hathaway Energy renewables portfolio. NV Energy parent oversight." },

  // --- PUCN Commissioners ---
  { id:"p_caudill", name:"Hayley Caudill", role:"Chair, PUCN", companyId:null, note:"Oversees NV utility regulation and IRP approval. Clean Transition Tariff docket lead." },
  { id:"p_ringler", name:"CJ Ringler", role:"Commissioner, PUCN", companyId:null, note:"IRP review, rate case adjudication. Consumer rate impact analysis." },
  { id:"p_faris", name:"George Faris", role:"Commissioner, PUCN", companyId:null, note:"Rate recovery dockets, consumer advocacy. Greenlink cost allocation review." },
  { id:"p_brown", name:"Tammy Cordova", role:"Commissioner, PUCN", companyId:null, note:"Clean Transition Tariff review panel. Data center load policy." },

  // --- Developer Leadership ---
  { id:"p_latimer", name:"Tim Latimer", role:"CEO, Fervo Energy", companyId:null, note:"Pioneering next-gen enhanced geothermal. MIT PhD. DOE Geothermal Advisory Council." },
  { id:"p_norbeck", name:"Jack Norbeck", role:"CTO, Fervo Energy", companyId:null, note:"Horizontal drilling + fiber optic sensing pioneer. Stanford PhD. 12 patents." },
  { id:"p_blachar", name:"Doron Blachar", role:"CEO, Ormat Technologies", companyId:null, note:"NYSE: ORA. 20+ year Ormat veteran. Oversees 1.2GW global geothermal portfolio." },
  { id:"p_bronczek", name:"David Bronczek", role:"Chair, Ormat Technologies", companyId:null, note:"NYSE: ORA, global geothermal leader. Former FedEx COO." },
  { id:"p_peacher", name:"Bobby Peacher", role:"VP Development, Primergy Solar", companyId:null, note:"Gemini + Purple Sage project lead. 3GW+ development pipeline." },
  { id:"p_mcbride", name:"Sarah McBride", role:"CEO, Arevia Power", companyId:null, note:"Libra Solar 700MW developer. Western US solar-storage. 5GW+ pipeline." },
  { id:"p_hamel", name:"Robert Hamel", role:"Managing Partner, Hamel Renewables", companyId:null, note:"Rough Hat Clark co-developer. 15+ years NV renewable development." },
  { id:"p_hanwha", name:"Jay Moon", role:"CEO, 174 Power Global", companyId:null, note:"Hanwha subsidiary. Boulder Solar III developer. 2GW US portfolio." },
  { id:"p_schoonhoven", name:"Paul Schoonhoven", role:"Managing Director, Quinbrook Infrastructure", companyId:null, note:"Gemini + Purple Sage investor. $8B+ AUM. Global renewables infrastructure." },

  // --- Government & Regulatory ---
  { id:"p_aguilar", name:"Jon Raby", role:"State Director, BLM Nevada", companyId:null, note:"Oversees 48M acres including energy ROWs. Programmatic EIS authority." },
  { id:"p_lombardo", name:"Joe Lombardo", role:"Governor of Nevada", companyId:null, note:"R. Pro-energy, data center incentives. SB 448 clean energy implementation." },
  { id:"p_titus", name:"Dina Titus", role:"US Representative, NV-1", companyId:null, note:"Southern Nevada clean energy advocate. Transmission permitting reform." },
  { id:"p_masto", name:"Catherine Cortez Masto", role:"US Senator, Nevada", companyId:null, note:"Clean energy + transmission champion. IRA implementation oversight." },
  { id:"p_rosen", name:"Jacky Rosen", role:"US Senator, Nevada", companyId:null, note:"Nevada renewable energy + mining champion. Critical minerals policy." },

  // --- Financial & Advisory ---
  { id:"p_foley", name:"Tom Foley", role:"Managing Director, Goldman Sachs", companyId:null, note:"NV Energy project finance advisory. Greenlink West capital markets lead." },
  { id:"p_chen", name:"David Chen", role:"Director, Morgan Stanley Infrastructure", companyId:null, note:"Greenlink West capital markets advisory. Renewable project finance." },
  { id:"p_levy", name:"Marc Levy", role:"Partner, Fennemore Craig", companyId:null, note:"Lead outside counsel NV Energy regulatory. 25+ years NV utility law." },

  // --- Technical & Environmental ---
  { id:"p_boehm", name:"Jim Boehm", role:"VP Grid Services, CAISO", companyId:null, note:"Western interconnection and NV-CA transmission coordination. EIM governance." },
  { id:"p_garcia", name:"Maria Garcia", role:"Regional Director, SWCA Environmental", companyId:null, note:"Greenlink + Libra Solar EIS lead. 20+ years western energy NEPA." },

  // --- Labor ---
  { id:"p_kelly", name:"Tom Kelly", role:"Business Manager, IBEW Local 396", companyId:null, note:"Represents 4,000+ electrical workers in southern NV. Greenlink West labor agreement." },

  // --- Data Center Executives ---
  { id:"p_seibold", name:"Jeff Seibold", role:"VP Energy Strategy, Switch", companyId:null, note:"100% renewable procurement. TRIC campus 495MW expansion. Grid partnership." },
  { id:"p_desmond", name:"Amanda Desmond", role:"Head of Energy, Google Cloud (West)", companyId:null, note:"24/7 CFE strategy. Fervo + Ormat geothermal PPAs. CTT architect." },
  { id:"p_smith", name:"Brian Smith", role:"VP Data Center Development, Microsoft", companyId:null, note:"300 acres near TRIC acquired. NV data center campus planning." },
  { id:"p_vantage_ceo", name:"Sureel Choksi", role:"CEO, Vantage Data Centers", companyId:null, note:"$3B NV data center project. Global colocation + hyperscale operator." },

  // --- Transmission & Grid ---
  { id:"p_mastec_ceo", name:"Jose Mas", role:"CEO, MasTec Inc", companyId:null, note:"NYSE: MTZ. T&D Power subsidiary. $12B+ revenue. Greenlink general contractor." },

  // --- Additional Key Figures ---
  { id:"p_kirkpatrick", name:"Chris Kirkpatrick", role:"Director, NV Bureau of Mines", companyId:null, note:"Geological survey. Geothermal resource assessment. Critical minerals mapping." },
  { id:"p_sandoval", name:"Steve Hill", role:"President/CEO, LVCVA", companyId:null, note:"Former GOED director. Shaped NV energy/economic development policy 2011-2019." },
  { id:"p_guinn", name:"Kenny Guinn Jr", role:"Director, NV Governor's Office of Energy", companyId:null, note:"State energy policy. RPS compliance. IRA fund distribution." },
  { id:"p_amodei", name:"Mark Amodei", role:"US Representative, NV-2", companyId:null, note:"Northern NV. Mining + energy. BLM land use reform advocate." },
  { id:"p_goicoechea", name:"Pete Goicoechea", role:"NV State Senate, District 19", companyId:null, note:"Rural NV energy policy. Nye/Esmeralda/Lincoln counties. Ranching + energy." },

  // --- Additional Industry & Grid ---
  { id:"p_hooker", name:"Scott Hooker", role:"VP Regulatory, NV Energy", companyId:null, note:"PUCN filings strategy. IRP process management. Rate case testimony." },
  { id:"p_weiss", name:"Rachel Weiss", role:"Director Interconnection, NV Energy", companyId:null, note:"Manages 20GW+ interconnection queue. Study process optimization." },
  { id:"p_harmon", name:"Lee Harmon", role:"Regional Director, USFWS Nevada", companyId:null, note:"Endangered Species Act compliance. Desert tortoise consultations. Solar project reviews." },
  { id:"p_rosendin_ceo", name:"Tom Rosendin", role:"CEO, Rosendin Electric", companyId:null, note:"Top US electrical contractor. Gemini Solar EPC. Family-owned since 1919." },
  { id:"p_bettis", name:"Kirk Bettis", role:"VP Western Region, Burns & McDonnell", companyId:null, note:"Greenlink transmission engineering lead. 30+ years transmission planning." },
  { id:"p_wichner", name:"Dan Wichner", role:"Director Grid Modernization, NV Energy", companyId:null, note:"AMI deployment. Distribution automation. Grid-scale BESS integration." },

  // --- NV Energy Additional Leadership ---
  { id:"p_pattaje", name:"Phaneesh Pattaje", role:"VP Regulatory & Government Affairs, NV Energy", companyId:null, note:"Regulatory strategy. Legislative relations. IRA compliance coordination." },
  { id:"p_devito", name:"Mike DeVito", role:"VP Customer Solutions, NV Energy", companyId:null, note:"Demand response programs. Time-of-use tariffs. Data center account management." },
  { id:"p_dwyer", name:"Sara Dwyer", role:"VP Environmental, NV Energy", companyId:null, note:"NEPA compliance. Air quality permits. Coal ash remediation at Reid Gardner." },
  { id:"p_ferris", name:"Kevin Ferris", role:"VP Finance & Treasurer, NV Energy", companyId:null, note:"Capital markets. Green bond issuance. Project finance structuring." },

  // --- BLM Nevada Leadership ---
  { id:"p_raby", name:"Jon Raby", role:"State Director, BLM Nevada", companyId:null, note:"Oversees 48M acres of federal land. ROW permitting for Greenlink, solar zones." },

  // --- County Commissioners ---
  { id:"p_kirkpatrick_cc", name:"Chris Kirkpatrick", role:"Commissioner, Clark County", companyId:null, note:"District F. Southern NV energy project siting. Dry Lake East + Boulder Solar area." },
  { id:"p_jones_cc", name:"Marilyn Kirkpatrick", role:"Commission Chair, Clark County", companyId:null, note:"County Commission Chair. Economic development. Data center corridor policy." },
  { id:"p_wichman", name:"Debra Strickland", role:"Commissioner, Nye County", companyId:null, note:"Pahrump district. Rough Hat Clark + Amargosa projects. Rural energy development." },
  { id:"p_schinhofen", name:"Frank Schinhofen", role:"Commissioner, Nye County", companyId:null, note:"Tonopah district. Esmeralda Seven impact. Mining vs solar land use balance." },
  { id:"p_koenig", name:"Tim Koenig", role:"Commissioner, Esmeralda County", companyId:null, note:"Esmeralda Seven PEIS oversight. Goldfield district. County revenue from solar leases." },
  { id:"p_zander", name:"Rob Gillmore", role:"Commissioner, Churchill County", companyId:null, note:"Fallon district. Geothermal development. Ormat operations in Churchill County." },
  { id:"p_hastings", name:"Ken Gray", role:"Commissioner, Lyon County", companyId:null, note:"Libra Solar project area. County conditional use permitting. Yerington district." },

  // --- Tribal Leaders ---
  { id:"p_anderson_moapa", name:"Darren Daboda", role:"Chairman, Moapa Band of Paiutes", companyId:null, note:"Tribal council chair. Reid Gardner remediation. Moapa Solar expansion. Community benefit agreements." },
  { id:"p_holley", name:"Joseph Holley", role:"Vice Chair, Moapa Band of Paiutes", companyId:null, note:"Infrastructure development. Solar lease negotiations. Environmental remediation oversight." },
  { id:"p_dann", name:"Carrie Dann", role:"Elder, Western Shoshone Defense Project", companyId:null, note:"Treaty of Ruby Valley advocate. Esmeralda + central NV energy project consultation." },
  { id:"p_mckinney", name:"Jerry Charles", role:"Chairman, Timbisha Shoshone Tribe", companyId:null, note:"Death Valley region. Amargosa Desert solar and Nye County energy development consultation." },

  // --- EPC Project Managers ---
  { id:"p_diaz_mastec", name:"Carlos Diaz", role:"Project Director, MasTec T&D", companyId:null, note:"Greenlink West construction director. 500+ crew. $2.4B transmission project." },
  { id:"p_norton", name:"James Norton", role:"VP Renewables, Primoris Services", companyId:null, note:"Utility-scale solar EPC. NV portfolio includes Boulder Solar + IRP projects." },
  { id:"p_stokes", name:"Dan Stokes", role:"VP Solar, McCarthy Building Companies", companyId:null, note:"Large-scale renewable EPC. NV solar project pursuit. Southwest regional lead." },
  { id:"p_ramirez", name:"Elena Ramirez", role:"Project Director, Mortenson", companyId:null, note:"Sierra Solar EPC bid team lead. 20+ utility-scale project completions." },

  // --- Law Firm Partners ---
  { id:"p_mcelwain", name:"Jim McElwain", role:"Partner, Holland & Hart", companyId:null, note:"BLM land use + NEPA counsel. Represents solar developers on public land ROW." },
  { id:"p_hutchison", name:"Sarah Hutchison", role:"Partner, Brownstein Hyatt", companyId:null, note:"NV energy regulatory practice. Utility rate cases. Data center incentive policy." },
  { id:"p_shea", name:"Christopher Shea", role:"Partner, Stoel Rives", companyId:null, note:"Renewable energy project finance. Fervo corporate counsel. Tax equity structures." },
  { id:"p_drake", name:"Timothy Drake", role:"Partner, Snell & Wilmer", companyId:null, note:"NV regulatory practice. PPA negotiation. Solar + storage project counsel." },

  // --- Financial Advisors ---
  { id:"p_williams_laz", name:"George Bilicic", role:"Vice Chairman, Lazard", companyId:null, note:"Head of Power & Energy. LCOE benchmarking. NV Energy M&A and project advisory." },
  { id:"p_schwartz", name:"Michael Schwartz", role:"Managing Director, CohnReznick Capital", companyId:null, note:"Renewable energy tax equity. NV solar ITC monetization. $10B+ closed." },
  { id:"p_harper", name:"Susan Harper", role:"Director, KeyBanc Capital Markets", companyId:null, note:"Renewable energy project finance. NV solar + storage debt syndication." },

  // --- Labor Union Leaders ---
  { id:"p_vranesh", name:"Todd Koch", role:"Business Manager, Operating Engineers Local 12", companyId:null, note:"90,000+ members CA/NV/HI. Heavy equipment for solar + transmission construction." },
  { id:"p_martin_ibew", name:"James Martin", role:"Assistant Business Manager, IBEW Local 357", companyId:null, note:"Las Vegas electrical workers. Solar installation. Data center build-outs." },
  { id:"p_torres_iron", name:"Oscar Torres", role:"Business Agent, Ironworkers Local 433", companyId:null, note:"Structural steel. Solar tracker installation. Transmission tower erection." },

  // --- Grid Operator Contacts ---
  { id:"p_mainzer", name:"Elliot Mainzer", role:"CEO, CAISO", companyId:null, note:"California ISO CEO. Western Day-Ahead Market. NV-CA interconnection oversight." },
  { id:"p_parsons", name:"Melanie Chirolla", role:"VP Western Interconnection, WECC", companyId:null, note:"Reliability standards. NV resource adequacy. Greenlink transmission review." },

  // --- Insurance & Risk ---
  { id:"p_sims", name:"Robert Sims", role:"Managing Director, Marsh Energy Practice", companyId:null, note:"NV renewable energy insurance. Construction all-risk. Parametric weather coverage." },
  { id:"p_kwon", name:"David Kwon", role:"VP Renewable Energy, Swiss Re", companyId:null, note:"Renewable energy reinsurance. NV solar + BESS portfolio. Parametric products." },

  // --- Environmental Review Leads ---
  { id:"p_frey", name:"Jennifer Frey", role:"District Manager, BLM Southern NV", companyId:null, note:"Las Vegas District. Gemini, Dry Lake, Boulder Solar permitting. Solar Energy Zones." },
  { id:"p_reese", name:"Mark Reese", role:"District Manager, BLM Battle Mountain", companyId:null, note:"Central NV district. Geothermal ROW. Esmeralda + Nye County energy projects." },
  { id:"p_navis", name:"Amanda Navis", role:"State Supervisor, USFWS Nevada", companyId:null, note:"ESA Section 7 consultations. Desert tortoise. Bi-State sage grouse. Eagle take permits." },

  // --- National Lab & University ---
  { id:"p_symko_davies", name:"Susan Hamm", role:"Director, DOE Geothermal Technologies Office", companyId:null, note:"Leads federal EGS R&D. Forge + Frontier Observatory. Fervo demonstration funding." },
  { id:"p_zichella", name:"Carl Zichella", role:"Director, Western Grid Group", companyId:null, note:"Transmission planning advocacy. WECC + CAISO stakeholder. Greenlink support." },
  { id:"p_bowen", name:"Thomas Bowen", role:"Senior Researcher, NREL", companyId:null, note:"Grid integration studies. NV solar + storage modeling. Interconnection analysis." },
  { id:"p_bauer", name:"Stephen Bauer", role:"Manager, Sandia Geothermal Research", companyId:null, note:"EGS reservoir characterization. Fervo technology validation. DOE grant oversight." },

  // --- Media / Analysts ---
  { id:"p_ward_wm", name:"Anna Czajkowska", role:"Senior Research Director, Wood Mackenzie", companyId:null, note:"US solar + storage market analysis. NV project tracking. BNEF competitor." },

  // --- Additional Developer & Industry ---
  { id:"p_coppinger", name:"Ed Coppinger", role:"VP Development, NextEra Energy Resources", companyId:null, note:"NV + Western US project origination. Esmeralda Seven evaluation. 30GW+ portfolio." },
  { id:"p_devin", name:"Andres Gluski", role:"President & CEO, AES Corporation", companyId:null, note:"Global clean energy. NYSE: AES. Fluence BESS JV. NV storage evaluation." },
  { id:"p_hogan", name:"Michael Hogan", role:"President, EDF Renewables North America", companyId:null, note:"16GW US portfolio. NV solar + storage pipeline development. European utility subsidiary." },
  { id:"p_swindle", name:"Brandon Swindle", role:"VP, Energy Vault", companyId:null, note:"Reid Gardner BESS project delivery. Grid-scale storage deployment." },
  { id:"p_zhu", name:"Li Zhu", role:"VP Americas, LONGi Green Energy", companyId:null, note:"World's largest solar module manufacturer. NV project supply. Hi-MO 7 technology." },
  { id:"p_widmar", name:"Mark Widmar", role:"CEO, First Solar", companyId:null, note:"NASDAQ: FSLR. US-manufactured CdTe modules. Domestic content ITC bonus. NV supply." },

  // --- State Agency Leaders ---
  { id:"p_ndrep_dir", name:"Greg Lovato", role:"Administrator, NV DEP", companyId:null, note:"NV Division of Environmental Protection. Air quality permits. Water discharge permits for energy." },
  { id:"p_ndow_dir", name:"Tony Wasley", role:"Director, NV Dept of Wildlife", companyId:null, note:"State wildlife management. Sage grouse habitat. Desert tortoise state consultation." },
  { id:"p_state_eng", name:"Adam Sullivan", role:"NV State Engineer", companyId:null, note:"Water rights appropriations for energy projects. Groundwater permits. Solar project water allocations." },

  // --- Additional Key Figures (Batch 2) ---
  { id:"p_hernandez", name:"Miguel Hernandez", role:"VP Americas, JinkoSolar", companyId:null, note:"Top 3 global module supplier. NV project supply. Tiger Neo N-type technology." },
  { id:"p_garcia_trina", name:"Gonzalo de la Viña", role:"President, Trina Solar Americas", companyId:null, note:"Tier 1 module supplier. NV project supply pipeline. Vertex S+ series." },
  { id:"p_wells", name:"Kevin Hostetler", role:"CEO, Array Technologies", companyId:null, note:"NASDAQ: ARRY. Solar tracker manufacturer. DuraTrack NV project supply." },
  { id:"p_perdew", name:"Dan Shugar", role:"CEO, Nextracker", companyId:null, note:"NASDAQ: NXT. #1 solar tracker. TrueCapture AI. Gemini + NV projects." },
  { id:"p_flannery_acp", name:"Jason Grumet", role:"CEO, American Clean Power Association", companyId:null, note:"Wind, solar, storage, transmission trade group. Federal permitting reform advocacy." },
  { id:"p_whitaker", name:"Abigail Ross Hopper", role:"President & CEO, SEIA", companyId:null, note:"Solar Energy Industries Association. ITC/PTC defense. State policy advocacy." },
  { id:"p_gallagher", name:"Ray Gallagher", role:"CEO, Strata Clean Energy", companyId:null, note:"Utility-scale solar EPC. 10GW+ built. NV project pursuit." },
  { id:"p_wetstone", name:"Gregory Wetstone", role:"President & CEO, ACORE", companyId:null, note:"American Council on Renewable Energy. Finance + policy advocacy." },
  { id:"p_palmer", name:"Scott Palmer", role:"Regional Manager, WAPA", companyId:null, note:"Western Area Power Administration. Hoover Dam power. NV transmission." },
  { id:"p_tong", name:"Ryan Tong", role:"VP Origination, LADWP", companyId:null, note:"LA clean energy procurement. NV solar PPA buyer. Greenlink beneficiary." },
  { id:"p_quinn", name:"Patrick Quinn", role:"VP Development, Applied Digital", companyId:null, note:"AI/HPC data center. NV site evaluation. High-density computing." },
  { id:"p_jacobsen", name:"Peter Jacobsen", role:"VP Infrastructure, Meta", companyId:null, note:"Data center siting evaluation. NV clean energy assessment." },
  { id:"p_kava", name:"Peter Kava", role:"VP Data Centers, AWS", companyId:null, note:"AWS infrastructure. NV expansion evaluation. Clean energy PPAs." },
  { id:"p_morales", name:"Arturo Morales", role:"VP Regulatory, PacifiCorp", companyId:null, note:"BHE subsidiary. 6-state utility. Potential NV interconnection coordination." },
  { id:"p_sparks", name:"Robert Sparks", role:"VP Engineering, Quanta Services", companyId:null, note:"NYSE: PWR. Transmission substation construction. NV project pursuit." },
  { id:"p_lynch", name:"Sarah Lynch", role:"VP Permitting, Blattner Energy", companyId:null, note:"Quanta subsidiary. Renewable EPC permitting. NV project coordination." },
  { id:"p_russo", name:"Michael Russo", role:"Partner, Latham & Watkins", companyId:null, note:"Renewable energy project finance. Tax equity transactions. NV deal counsel." },
  { id:"p_chen_milbank", name:"Alice Chen", role:"Partner, Milbank", companyId:null, note:"Transmission project finance. Infrastructure capital markets. NV deals." },
  { id:"p_blackwell", name:"Andrew Blackwell", role:"Director, Parsons Behle & Latimer", companyId:null, note:"NV natural resources + mining. Energy land use coexistence." },
  { id:"p_murata", name:"Ken Murata", role:"MD Renewable Energy, MUFG", companyId:null, note:"Japanese megabank. Renewable project finance. NV solar + transmission." },
];

// ============================================================================
// EXTERNALS — 55 organizations across the NV energy value chain
// ============================================================================
export const EXTERNALS = [
  // --- Utilities & Regulators ---
  { id:"x_nv_energy", name:"NV Energy", etype:"Utility", note:"Berkshire Hathaway Energy subsidiary. Monopoly utility serving 1M+ customers across Nevada. $6B+ capital plan." },
  { id:"x_pucn", name:"PUCN", etype:"Government", note:"Public Utilities Commission of Nevada. Regulates rates, IRPs, PPAs, and tariffs. 3 commissioners." },
  { id:"x_blm", name:"Bureau of Land Management", etype:"Government", note:"Manages 48M acres of Nevada public land. Issues ROW permits for energy projects. Programmatic EIS authority." },
  { id:"x_doe", name:"US Dept of Energy", etype:"Government", note:"Loan Programs Office: $2B Redwood, $996M Ioneer, $350M Ormat. Clean energy catalyst. GTO geothermal." },
  { id:"x_ferc", name:"FERC", etype:"Government", note:"Federal Energy Regulatory Commission. Oversees interstate transmission and interconnection. OATT enforcement." },

  // --- Developers ---
  { id:"x_quinbrook", name:"Quinbrook Infrastructure Partners", etype:"Developer", note:"Gemini Solar+Storage developer. $8B+ AUM. Global renewables fund manager. Primergy parent." },
  { id:"x_arevia", name:"Arevia Power", etype:"Developer", note:"Libra Solar developer. 5GW+ utility-scale solar+storage pipeline in western US." },
  { id:"x_primergy", name:"Primergy Solar", etype:"Developer", note:"Gemini operator, Purple Sage developer. Quinbrook subsidiary. 3GW+ NV pipeline." },
  { id:"x_candela", name:"Candela Renewables", etype:"Developer", note:"Rough Hat Clark developer. Hamel Renewables partnership. Nye County solar+storage." },
  { id:"x_174power", name:"174 Power Global", etype:"Developer", note:"Boulder Solar III developer. Hanwha subsidiary. 2GW US portfolio." },
  { id:"x_fervo", name:"Fervo Energy", etype:"Developer", note:"Next-gen enhanced geothermal. Corsac Station 115MW for Google. $431M raised. DOE demonstration site." },
  { id:"x_ormat", name:"Ormat Technologies", etype:"Developer", note:"Global geothermal leader. NYSE: ORA. Reno HQ. 1.2GW portfolio. 160MW+ McGinness Hills." },
  { id:"x_energy_vault", name:"Energy Vault", etype:"Developer", note:"Reid Gardner BESS EPC contractor. Grid-scale energy storage solutions. NYSE: NRGV." },
  { id:"x_nextera", name:"NextEra Energy Resources", etype:"Developer", note:"World's largest wind/solar company. Evaluating NV projects. 30GW+ operating portfolio." },
  { id:"x_aes", name:"AES Corporation", etype:"Developer", note:"Clean energy + storage. Fluence JV. Evaluating NV storage. NYSE: AES. 35GW global." },
  { id:"x_edf", name:"EDF Renewables", etype:"Developer", note:"European utility subsidiary. Evaluating NV solar + storage pipeline. 16GW US portfolio." },

  // --- Data Center / Large Load ---
  { id:"x_google", name:"Google", etype:"Corporation", note:"TRIC data centers. First Clean Transition Tariff applicant. Fervo + Ormat geothermal PPAs. 24/7 CFE by 2030." },
  { id:"x_switch", name:"Switch", etype:"Corporation", note:"Citadel Campus TRIC. 495MW planned. AI factory buildings. 100% renewable goal. DigitalBridge portfolio." },
  { id:"x_microsoft", name:"Microsoft", etype:"Corporation", note:"Acquired 300 acres near TRIC for data center development. Azure West expansion." },
  { id:"x_vantage", name:"Vantage Data Centers", etype:"Corporation", note:"$3B data center project planned in Nevada. Global colocation + hyperscale operator." },

  // --- EPC Contractors ---
  { id:"x_mastec", name:"MasTec", etype:"Corporation", note:"Greenlink West/North general contractor. T&D Power subsidiary. NYSE: MTZ. $12B+ revenue." },
  { id:"x_rosendin", name:"Rosendin Electric", etype:"Contractor", note:"Gemini Solar EPC. Top US electrical contractor. 100+ years. San Jose HQ." },
  { id:"x_mortenson", name:"Mortenson", etype:"Contractor", note:"Large-scale renewable EPC. Sierra Solar potential. $5B+ annual revenue. 100+ wind/solar projects." },
  { id:"x_sunpower", name:"SunPower", etype:"Contractor", note:"NV residential solar installer. Subsidiary restructured 2024. Distributed generation." },
  { id:"x_burns", name:"Burns & McDonnell", etype:"Contractor", note:"Transmission EPC. Greenlink engineering. Employee-owned. 100+ year legacy." },

  // --- Equipment Suppliers ---
  { id:"x_tesla_energy", name:"Tesla Energy", etype:"Corporation", note:"Megapack battery supplier. Reid Gardner BESS integration. Reno Gigafactory proximity." },
  { id:"x_byd", name:"BYD", etype:"Corporation", note:"Major BESS cell supplier for NV projects. Blade Battery LFP technology. Global #2 EV/BESS." },
  { id:"x_longi", name:"LONGi Green Energy", etype:"Corporation", note:"World's largest solar module manufacturer. Gemini + Libra supplier. Hi-MO series." },
  { id:"x_first_solar", name:"First Solar", etype:"Corporation", note:"US-manufactured CdTe thin-film modules. NV project supplier. NASDAQ: FSLR. Domestic content bonus." },
  { id:"x_siemens", name:"Siemens Energy", etype:"Corporation", note:"525kV HVDC equipment for Greenlink transmission. Gas turbine fleet. Grid technology leader." },
  { id:"x_catl", name:"CATL", etype:"Corporation", note:"World's largest EV/BESS battery manufacturer. Nevada supply chain. LFP + sodium-ion technology." },
  { id:"x_fluence", name:"Fluence", etype:"Corporation", note:"Siemens/AES JV. Grid-scale BESS technology provider. NASDAQ: FLNC. 200+ projects worldwide." },

  // --- Financial Institutions ---
  { id:"x_berkshire", name:"Berkshire Hathaway Energy", etype:"Corporation", note:"NV Energy parent company. Warren Buffett's utility holding. $100B+ energy assets." },
  { id:"x_goldman", name:"Goldman Sachs", etype:"Corporation", note:"NV Energy project finance advisory. Greenlink West capital markets. Renewable tax equity." },
  { id:"x_morgan", name:"Morgan Stanley Infrastructure", etype:"Corporation", note:"Renewable project finance. Tax equity. $45B+ infrastructure AUM." },
  { id:"x_jpmorgan", name:"JPMorgan Chase", etype:"Corporation", note:"Renewable tax equity investor. NV solar+storage portfolio. Largest US bank." },
  { id:"x_bofa", name:"Bank of America", etype:"Corporation", note:"Green bonds. NV Energy sustainability financing. $300B sustainable finance commitment." },

  // --- Law Firms ---
  { id:"x_fennemore", name:"Fennemore Craig", etype:"Law Firm", note:"Lead NV Energy outside counsel. Regulatory and rate cases. Largest AZ/NV firm." },
  { id:"x_holland", name:"Holland & Hart", etype:"Law Firm", note:"BLM land use, NEPA, environmental. Western energy. 15 offices across Mountain West." },
  { id:"x_snell", name:"Snell & Wilmer", etype:"Law Firm", note:"NV regulatory. PPA negotiation. Clean energy finance. 450+ attorneys." },
  { id:"x_stoel", name:"Stoel Rives", etype:"Law Firm", note:"Renewable energy development. Project finance. Pacific NW + NV practice." },

  // --- Environmental Consultants ---
  { id:"x_swca", name:"SWCA Environmental Consultants", etype:"Consulting", note:"Greenlink + Libra Solar EIS contractor. Western energy NEPA specialist. 1,200+ employees." },
  { id:"x_westland", name:"Westland Resources", etype:"Consulting", note:"Biological surveys. Desert tortoise mitigation. NV BLM projects. Tucson HQ." },
  { id:"x_aecom", name:"AECOM", etype:"Consulting", note:"Environmental and engineering services. NV transportation and energy. NYSE: ACM. $14B revenue." },

  // --- Grid & Market Operators ---
  { id:"x_caiso", name:"CAISO", etype:"Government", note:"California ISO. NV-CA interconnection. Western EIM participant. 80GW+ grid operator." },
  { id:"x_wecc", name:"WECC", etype:"Government", note:"Western Electricity Coordinating Council. Reliability standards. 1.8M sq mi service territory." },
  { id:"x_sppc", name:"Sierra Pacific Power Co", etype:"Utility", note:"NV Energy northern NV utility subsidiary. Serves Reno/Sparks/Carson City. 370K customers." },

  // --- Government ---
  { id:"x_goed", name:"GOED", etype:"Government", note:"Governor's Office of Economic Development. Data center abatements and energy incentives. $1.2B+ authorized." },
  { id:"x_snwa", name:"SNWA", etype:"Government", note:"Southern Nevada Water Authority. Water allocations for energy projects. Lake Mead management." },
  { id:"x_clark_county", name:"Clark County Commission", etype:"Government", note:"Southern NV land use. Permits. Environmental compliance. 2.3M population." },
  { id:"x_nye_county", name:"Nye County Commission", etype:"Government", note:"Pahrump, Amargosa. Rough Hat Clark + NTS-adjacent development. Largest NV county by area." },

  // --- Tribal & Community ---
  { id:"x_moapa", name:"Moapa Band of Paiutes", etype:"Tribal", note:"Reid Gardner site. Moapa Solar + tribal land energy development. Reservation borders Clark County." },
  { id:"x_shoshone", name:"Western Shoshone", etype:"Tribal", note:"Traditional lands overlap with central NV energy development zones. Treaty of Ruby Valley 1863." },

  // --- Labor & Trade ---
  { id:"x_ibew396", name:"IBEW Local 396", etype:"Labor", note:"International Brotherhood of Electrical Workers. 4,000+ southern NV members. Greenlink West PLA." },
  { id:"x_oe12", name:"Operating Engineers Local 12", etype:"Labor", note:"Heavy equipment operators. Solar + transmission construction. 90,000+ members CA/NV/HI." },
  { id:"x_naiop", name:"NAIOP Southern Nevada", etype:"Industry Group", note:"Commercial real estate + data center development advocacy. APEX corridor promotion." },

  // --- Insurance & Risk ---
  { id:"x_marsh", name:"Marsh McLennan", etype:"Consulting", note:"NV energy project risk and insurance advisory. Construction all-risk policies. $23B revenue." },
  { id:"x_aon", name:"Aon", etype:"Consulting", note:"Renewable energy insurance. Construction all-risk. NV portfolio. Global #2 insurance broker." },

  // --- Additional EPC Contractors ---
  { id:"x_primoris", name:"Primoris Services", etype:"Contractor", note:"Utility-scale solar EPC. NYSE: PRIM. $5B+ revenue. Boulder Solar + NV IRP project pipeline." },
  { id:"x_mccarthy", name:"McCarthy Building Companies", etype:"Contractor", note:"Large-scale renewable EPC. Southwest region. Solar + BESS construction." },
  { id:"x_quanta", name:"Quanta Services", etype:"Contractor", note:"NYSE: PWR. Largest US specialty contractor. Transmission + substation. $20B+ revenue." },
  { id:"x_blattner", name:"Blattner Energy", etype:"Contractor", note:"Top US renewable EPC. Quanta subsidiary. 35GW+ wind/solar built. NV project pursuit." },
  { id:"x_strata", name:"Strata Clean Energy", etype:"Contractor", note:"Utility-scale solar EPC. 10GW+ built. NV project bids. Duke Energy backed." },

  // --- Additional Environmental Consultants ---
  { id:"x_tetra_tech", name:"Tetra Tech", etype:"Consulting", note:"NASDAQ: TTEK. Environmental engineering. NV BLM project EIS support. Cultural resource surveys." },
  { id:"x_icf", name:"ICF International", etype:"Consulting", note:"NASDAQ: ICFI. Federal EIS contractor. DOI/BLM programmatic NEPA. Esmeralda Seven PEIS support." },
  { id:"x_cardno", name:"Stantec (formerly Cardno)", etype:"Consulting", note:"Environmental + infrastructure consulting. NV biological surveys. Water resource assessments." },

  // --- Additional Law Firms ---
  { id:"x_brownstein", name:"Brownstein Hyatt Farber Schreck", etype:"Law Firm", note:"NV government affairs + energy regulatory. Data center incentive counsel. 12 offices." },
  { id:"x_parsons_behle", name:"Parsons Behle & Latimer", etype:"Law Firm", note:"NV energy + natural resources. BLM land use. Mining + renewable coexistence counsel." },
  { id:"x_latham", name:"Latham & Watkins", etype:"Law Firm", note:"Project finance + tax equity. Renewable energy transactions. NV solar deal counsel." },
  { id:"x_milbank", name:"Milbank", etype:"Law Firm", note:"Project finance. Transmission financing. Greenlink capital markets legal counsel." },

  // --- Additional Financial Institutions ---
  { id:"x_lazard", name:"Lazard", etype:"Corporation", note:"Power & Energy advisory. LCOE benchmarking report. NV Energy strategic advisory." },
  { id:"x_cohnreznick", name:"CohnReznick Capital", etype:"Corporation", note:"Renewable energy tax equity advisory. $10B+ in ITC/PTC monetization. NV solar deals." },
  { id:"x_keybanc", name:"KeyBanc Capital Markets", etype:"Corporation", note:"Renewable energy project finance. Solar + storage debt. NV project syndication." },
  { id:"x_mufg", name:"MUFG", etype:"Corporation", note:"Japanese megabank. Renewable energy project finance. NV solar + transmission lending." },
  { id:"x_natixis", name:"Natixis", etype:"Corporation", note:"French bank. Renewable energy project finance. NV solar + storage portfolio lending." },
  { id:"x_rabobank", name:"Rabobank", etype:"Corporation", note:"Renewable energy lending. Agricultural + clean energy finance. NV project participation." },

  // --- Insurance Companies ---
  { id:"x_swissre", name:"Swiss Re", etype:"Corporation", note:"Global reinsurance leader. Renewable energy risk. NV solar + BESS portfolio coverage." },
  { id:"x_liberty", name:"Liberty Mutual", etype:"Corporation", note:"Energy insurance. Construction all-risk. NV renewable project policies." },
  { id:"x_gcube", name:"GCube Insurance", etype:"Corporation", note:"Specialist renewable energy insurer. Solar + storage operational coverage. NV portfolio." },

  // --- Equipment Manufacturers ---
  { id:"x_jinko", name:"JinkoSolar", etype:"Corporation", note:"Top 3 global solar module manufacturer. NV project supply. Tiger Neo N-type technology." },
  { id:"x_trina", name:"Trina Solar", etype:"Corporation", note:"Tier 1 solar module manufacturer. NV project supply pipeline. Vertex S+ series." },
  { id:"x_canadian_solar", name:"Canadian Solar / e-Storage", etype:"Corporation", note:"Solar modules + BESS. NASDAQ: CSIQ. NV project supply. SolBank BESS platform." },
  { id:"x_nextracker", name:"Nextracker", etype:"Corporation", note:"#1 solar tracker manufacturer. NASDAQ: NXT. NV project tracker supply. TrueCapture AI." },
  { id:"x_array", name:"Array Technologies", etype:"Corporation", note:"NASDAQ: ARRY. Solar tracker manufacturer. NV project supply. DuraTrack system." },
  { id:"x_sungrow", name:"Sungrow", etype:"Corporation", note:"Global inverter + BESS manufacturer. NV project supply. PowerTitan BESS platform." },
  { id:"x_power_elec", name:"Power Electronics", etype:"Corporation", note:"Utility-scale solar inverter manufacturer. Gemini + NV project supply." },
  { id:"x_hitachi", name:"Hitachi Energy", etype:"Corporation", note:"HVDC + grid technology. Transformer manufacturing. NV transmission equipment supply." },

  // --- Federal Agencies ---
  { id:"x_epa", name:"US EPA Region 9", etype:"Government", note:"Environmental compliance. Air quality. RCRA + hazardous waste. NV energy project oversight." },
  { id:"x_fws", name:"US Fish & Wildlife Service", etype:"Government", note:"ESA Section 7 consultation. Desert tortoise. Bi-State sage grouse. Eagle take permits." },
  { id:"x_doi", name:"US Dept of Interior", etype:"Government", note:"BLM parent agency. Solar Energy Zones. Renewable energy ROW on federal land." },
  { id:"x_army_corps", name:"US Army Corps of Engineers", etype:"Government", note:"Clean Water Act Section 404 permits. Wetlands. Waters of the US. NV project compliance." },
  { id:"x_bia", name:"Bureau of Indian Affairs", etype:"Government", note:"Tribal consultation. Moapa Band leasing. Trust land energy development. Section 106 compliance." },

  // --- State Agencies ---
  { id:"x_ndep", name:"NV Division of Environmental Protection", etype:"Government", note:"Air quality permits. Water discharge. Hazardous waste. Coal ash remediation oversight." },
  { id:"x_ndow", name:"NV Dept of Wildlife", etype:"Government", note:"State wildlife consultation. Sage grouse habitat. Desert tortoise. Bat surveys for wind/solar." },
  { id:"x_nv_state_eng", name:"NV State Engineer", etype:"Government", note:"Water rights appropriations. Groundwater permits for energy projects. Solar + geothermal water." },
  { id:"x_nv_lands", name:"NV Division of State Lands", etype:"Government", note:"State land leasing for energy. Right-of-way across state parcels. Land exchange facilitation." },

  // --- Tribal Nations ---
  { id:"x_timbisha", name:"Timbisha Shoshone Tribe", etype:"Tribal", note:"Death Valley homeland. Nye County energy development. Amargosa Desert project consultation." },
  { id:"x_walker_river", name:"Walker River Paiute Tribe", etype:"Tribal", note:"Lyon + Mineral County. Libra Solar proximity. Walker Lake water rights. Section 106 consultation." },
  { id:"x_fallon_paiute", name:"Fallon Paiute-Shoshone Tribe", etype:"Tribal", note:"Churchill County. Geothermal development area. Stillwater NWR. Carson Lake wetlands." },
  { id:"x_duckwater", name:"Duckwater Shoshone Tribe", etype:"Tribal", note:"Nye County. Railroad Valley. Geothermal + solar development zone. Traditional use areas." },

  // --- Universities & Research ---
  { id:"x_unlv", name:"UNLV", etype:"University", note:"Las Vegas. Solar energy research. Harry Reid Center. Renewable workforce training. EPC partnerships." },
  { id:"x_unr", name:"UNR", etype:"University", note:"Reno. Great Basin Center for Geothermal Energy. EGS research. NV Bureau of Mines + Geology." },
  { id:"x_dri", name:"Desert Research Institute", etype:"University", note:"NSHE. Climate science. Solar resource mapping. Environmental monitoring. Air quality." },

  // --- National Labs ---
  { id:"x_nrel", name:"NREL", etype:"Government", note:"National Renewable Energy Lab. Solar + storage integration. NV grid modeling. LCOE analysis." },
  { id:"x_sandia", name:"Sandia National Laboratories", etype:"Government", note:"DOE lab. EGS research. BESS safety testing. Solar reliability. NV Nevada National Security Site." },
  { id:"x_inl", name:"Idaho National Laboratory", etype:"Government", note:"DOE lab. Geothermal research. FORGE EGS test site. Fervo technology validation support." },

  // --- Grid Operators ---
  { id:"x_spp", name:"Southwest Power Pool", etype:"Government", note:"RTO. Potential NV membership. Western electricity market formation. Day-ahead market." },
  { id:"x_wapa", name:"Western Area Power Administration", etype:"Government", note:"Federal power marketing. Hoover Dam power. NV transmission. DOE agency." },

  // --- Industry Associations ---
  { id:"x_seia", name:"SEIA", etype:"Industry Group", note:"Solar Energy Industries Association. Federal + state policy. ITC defense. NV chapter." },
  { id:"x_acp", name:"American Clean Power Association", etype:"Industry Group", note:"Wind, solar, storage, transmission trade group. Permitting reform advocacy. PTC/ITC policy." },
  { id:"x_acore", name:"ACORE", etype:"Industry Group", note:"American Council on Renewable Energy. Finance + policy. Renewable energy tax equity advocacy." },
  { id:"x_esig", name:"ESIG", etype:"Industry Group", note:"Energy Systems Integration Group. Grid integration research. Solar + storage forecasting. Technical." },

  // --- Analysts & Media ---
  { id:"x_woodmac", name:"Wood Mackenzie", etype:"Consulting", note:"Energy market research + analytics. US solar + storage tracker. NV project data. Veritas subsidiary." },
  { id:"x_bnef", name:"BloombergNEF", etype:"Consulting", note:"Energy market analytics. LCOE benchmarking. NV project tracking. Tier 1 module list." },
  { id:"x_spglobal", name:"S&P Global Commodity Insights", etype:"Consulting", note:"Energy market data. Power price forecasts. NV wholesale market analytics." },

  // --- Other Utilities ---
  { id:"x_ladwp", name:"LADWP", etype:"Utility", note:"LA Dept of Water & Power. Largest US municipal utility. NV solar PPA buyer. Greenlink beneficiary." },
  { id:"x_pacificorp", name:"PacifiCorp", etype:"Utility", note:"BHE subsidiary. 6-state utility. Potential NV interconnection. Energy Gateway transmission." },
  { id:"x_aps", name:"Arizona Public Service", etype:"Utility", note:"AZ utility. Western interconnection. NV border projects. Potential PPA counterparty." },

  // --- Data Center / Tech Additional ---
  { id:"x_meta", name:"Meta Platforms", etype:"Corporation", note:"Evaluating NV data center sites. AI/ML compute. Large clean energy procurement program." },
  { id:"x_aws", name:"Amazon Web Services", etype:"Corporation", note:"Evaluating NV data center expansion. Clean energy PPAs. Global renewable procurement leader." },
  { id:"x_digital_bridge", name:"DigitalBridge", etype:"Corporation", note:"Switch parent company via infrastructure fund. Digital infrastructure investor. $80B+ AUM." },
  { id:"x_applied_digital", name:"Applied Digital", etype:"Corporation", note:"AI/HPC data center. Evaluating NV locations. High-density computing. Power-intensive operations." },

  // --- Additional Entities (Batch 2) ---
  { id:"x_ironworkers433", name:"Ironworkers Local 433", etype:"Labor", note:"Structural steel + solar tracker installation. Southern CA/NV jurisdiction. Transmission towers." },
  { id:"x_laborers872", name:"Laborers Local 872", etype:"Labor", note:"General construction laborers. Las Vegas. Solar grading + site prep. 5,000+ members." },
  { id:"x_panasonic", name:"Panasonic Energy", etype:"Corporation", note:"Battery cell manufacturing at TRIC Gigafactory. Tesla partnership. NV BESS supply chain." },
  { id:"x_sempra", name:"Sempra Infrastructure", etype:"Corporation", note:"SoCal Gas + SDG&E parent. Western transmission. Potential NV interconnection partner." },
  { id:"x_pattern", name:"Pattern Energy", etype:"Developer", note:"Western US wind + solar developer. 30GW+ pipeline. NV project evaluation." },
  { id:"x_clearway", name:"Clearway Energy", etype:"Developer", note:"NYSE: CWEN. 10GW+ clean energy. GIP backed. NV solar + storage evaluation." },
  { id:"x_invenergy", name:"Invenergy", etype:"Developer", note:"Largest private US renewable developer. 30GW+. NV utility-scale evaluation." },
  { id:"x_engie", name:"ENGIE North America", etype:"Developer", note:"French utility subsidiary. 7GW US portfolio. NV solar + storage pipeline evaluation." },
  { id:"x_brookfield", name:"Brookfield Renewable Partners", etype:"Developer", note:"$75B AUM. Global renewables. NV project acquisition evaluation." },
  { id:"x_hannon", name:"Hannon Armstrong", etype:"Corporation", note:"NYSE: HASI. Climate solutions REIT. Renewable infrastructure finance. NV project investment." },
  { id:"x_summit_ridge", name:"Summit Ridge Energy", etype:"Developer", note:"Community solar developer. NV distributed generation. Goldman Sachs backed." },
  { id:"x_black_veatch", name:"Black & Veatch", etype:"Contractor", note:"Power infrastructure engineering. Transmission planning. NV grid studies." },
  { id:"x_terracon", name:"Terracon", etype:"Consulting", note:"Geotechnical engineering. Foundation design for solar + transmission. NV project support." },
  { id:"x_barclays", name:"Barclays", etype:"Corporation", note:"Investment bank. Renewable energy project finance. NV solar + transmission debt." },
  { id:"x_citibank", name:"Citigroup", etype:"Corporation", note:"Global bank. Renewable tax equity. NV solar ITC monetization. Project finance." },
];

// ============================================================================
// ACCELERATORS — Energy innovation programs
// ============================================================================
export const ACCELERATORS = [];

// ============================================================================
// ECOSYSTEM ORGS — 12 organizations shaping the NV energy landscape
// ============================================================================
export const ECOSYSTEM_ORGS = [
  // --- Existing ---
  { id:"goe", name:"Governor's Office of Energy", etype:"Government", city:"Carson City", region:"washoe", note:"State energy policy and renewable energy programs. RPS compliance. IRA fund distribution." },
  { id:"nrea", name:"Nevada Rural Electric Association", etype:"Industry Group", city:"Reno", region:"washoe", note:"Represents rural electric co-ops across Nevada. Distribution infrastructure." },
  { id:"nvsea", name:"Nevada Solar Energy Association", etype:"Industry Group", city:"Las Vegas", region:"clark", note:"Solar industry advocacy and policy. Net metering. Distributed generation." },

  // --- New ---
  { id:"wrea", name:"Western Renewable Energy Association", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Regional renewable energy advocacy. Policy and interconnection. Western states coordination." },
  { id:"nma", name:"Nevada Mining Association", etype:"Industry Group", city:"Reno", region:"washoe", note:"Mining and mineral extraction. Land use overlap with energy projects. Critical minerals for BESS." },
  { id:"nra_resort", name:"Nevada Resort Association", etype:"Industry Group", city:"Las Vegas", region:"clark", note:"Hospitality industry. Largest electricity consumers in southern NV. Demand response programs." },
  { id:"dcp", name:"Clark County Desert Conservation Program", etype:"Government", city:"Las Vegas", region:"clark", note:"Desert tortoise mitigation banking. BLM project compliance. MSHCP administration." },
  { id:"irec", name:"Interstate Renewable Energy Council", etype:"Nonprofit", city:"Multiple", region:"multi_county", note:"Interconnection standards. Workforce development. Consumer protection. Model rules." },
  { id:"wga_energy", name:"WGA Energy Council", etype:"Government", city:"Multiple", region:"multi_county", note:"Western Governors' Association energy task force. Transmission siting coordination." },
  { id:"snric", name:"Southern Nevada Regional Industrial Center", etype:"Government", city:"Las Vegas", region:"clark", note:"APEX Industrial Park. Energy and data center development corridor. 12,000+ acres." },
  { id:"nshe", name:"Nevada System of Higher Education", etype:"University", city:"Las Vegas", region:"clark", note:"UNLV/UNR renewable energy research. DRI climate science. Geothermal workforce training." },
  { id:"nsta", name:"Nevada State Treasurer's Office", etype:"Government", city:"Carson City", region:"washoe", note:"Green bonds. Energy project financing. Capital budget oversight. State debt management." },

  // --- Additional Ecosystem Orgs ---
  { id:"lvgea", name:"Las Vegas Global Economic Alliance", etype:"Government", city:"Las Vegas", region:"clark", note:"Southern NV economic development. Data center recruitment. Clean energy business attraction." },
  { id:"edawn", name:"Economic Development Authority of Western Nevada", etype:"Government", city:"Reno", region:"washoe", note:"Northern NV economic development. TRIC promotion. Geothermal + tech business attraction." },
  { id:"nnda", name:"Northern Nevada Development Authority", etype:"Government", city:"Carson City", region:"washoe", note:"Carson City + rural northern NV economic development. Renewable manufacturing recruitment." },
  { id:"nba", name:"Nevada Builders Alliance", etype:"Industry Group", city:"Reno", region:"washoe", note:"Construction industry. Workforce training. Energy project labor supply. Apprenticeship programs." },
  { id:"cenv", name:"Clean Energy Nevada", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Clean energy advocacy. RPS policy. Solar consumer protection. Net metering advocacy." },
  { id:"wieb", name:"Western Interstate Energy Board", etype:"Government", city:"Multiple", region:"multi_county", note:"Western energy coordination. Transmission planning. Governors + PUC representatives. CREPC/WIRAB." },
  { id:"nv_energy_office", name:"Nevada State Energy Office", etype:"Government", city:"Carson City", region:"washoe", note:"Federal energy program administration. IRA fund distribution. Weatherization. Building codes." },
  { id:"nv_leg", name:"NV Legislature Energy Committee", etype:"Government", city:"Carson City", region:"washoe", note:"State energy legislation. SB 448 clean energy. AB 380 transmission. RPS compliance oversight." },
  { id:"scnr", name:"Southern Climate & Natural Resources Committee", etype:"Government", city:"Las Vegas", region:"clark", note:"Clark County climate action. Renewable energy zoning. Environmental overlay districts." },
  { id:"tric_authority", name:"Tahoe Reno Industrial Center", etype:"Government", city:"Sparks", region:"washoe", note:"Largest industrial park in the Americas. 107,000 acres. Tesla, Switch, Google, Panasonic campus." },
];

// ============================================================================
// LISTINGS — Publicly traded companies with NV energy exposure
// ============================================================================
export const LISTINGS = [
  { companyId:5, exchange:"NYSE", ticker:"ORA" },
];

// ============================================================================
// VERIFIED EDGES — 250+ relationships across the NV energy ontology
// ============================================================================
export const VERIFIED_EDGES = [
  // ========================================================================
  // SECTION 1: EXISTING PROJECT EDGES (preserved from original)
  // ========================================================================

  // --- Gemini Solar+Storage (c_1) ---
  { source:"c_1", target:"x_quinbrook", rel:"developed_by", note:"Lead developer and investor", y:2018 },
  { source:"c_1", target:"x_primergy", rel:"developed_by", note:"Operating subsidiary", y:2018 },
  { source:"c_1", target:"x_nv_energy", rel:"ppa_with", note:"25-year PPA", y:2020 },
  { source:"c_1", target:"x_blm", rel:"on_blm_land", note:"BLM ROW permit", y:2019 },
  { source:"c_1", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2020 },
  { source:"c_1", target:"f_nve_ppa", rel:"eligible_for", note:"NV Energy PPA", y:2020 },

  // --- Reid Gardner BESS (c_2) ---
  { source:"c_2", target:"x_nv_energy", rel:"developed_by", note:"Utility-owned asset", y:2021 },
  { source:"c_2", target:"x_energy_vault", rel:"partners_with", note:"EPC contractor", y:2022 },
  { source:"c_2", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2021 },

  // --- Switch Data Center (c_3) ---
  { source:"c_3", target:"x_switch", rel:"developed_by", note:"Owner/operator", y:2000 },
  { source:"c_3", target:"x_nv_energy", rel:"ppa_with", note:"Power customer", y:2000 },
  { source:"c_3", target:"x_goed", rel:"approved_by", note:"Tax abatement", y:2010 },

  // --- Google TRIC (c_4) ---
  { source:"c_4", target:"x_google", rel:"developed_by", note:"Owner/operator", y:2018 },
  { source:"c_4", target:"x_fervo", rel:"partners_with", note:"115MW geothermal PPA", y:2023 },
  { source:"c_4", target:"x_ormat", rel:"partners_with", note:"150MW geothermal PPA", y:2024 },
  { source:"c_4", target:"x_nv_energy", rel:"ppa_with", note:"Clean Transition Tariff applicant", y:2024 },
  { source:"c_4", target:"x_pucn", rel:"filed_with", note:"Clean Transition Tariff docket", y:2024 },

  // --- Ormat McGinness Hills (c_5) ---
  { source:"c_5", target:"x_ormat", rel:"developed_by", note:"Owner/operator", y:2012 },
  { source:"c_5", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2012 },

  // --- Sierra Solar+BESS (c_6) ---
  { source:"c_6", target:"x_nv_energy", rel:"developed_by", note:"Utility self-build $1.5B", y:2023 },
  { source:"c_6", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2023 },
  { source:"c_6", target:"f_pucn_irp", rel:"subject_of", note:"Approved in 2024 IRP", y:2024 },

  // --- Greenlink West (c_7) ---
  { source:"c_7", target:"x_nv_energy", rel:"developed_by", note:"Utility transmission project", y:2020 },
  { source:"c_7", target:"x_mastec", rel:"partners_with", note:"General contractor", y:2024 },
  { source:"c_7", target:"x_blm", rel:"on_blm_land", note:"BLM ROW approved", y:2023 },
  { source:"c_7", target:"x_pucn", rel:"subject_of", note:"Cost recovery docket", y:2024 },
  { source:"c_7", target:"f_doe_lpo", rel:"eligible_for", note:"DOE loan potential", y:2023 },

  // --- Fervo Corsac Station (c_8) ---
  { source:"c_8", target:"x_fervo", rel:"developed_by", note:"Developer/operator", y:2023 },
  { source:"c_8", target:"x_google", rel:"ppa_with", note:"115MW PPA via CTT", y:2023 },
  { source:"c_8", target:"x_nv_energy", rel:"ppa_with", note:"Via Clean Transition Tariff", y:2024 },
  { source:"c_8", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2023 },

  // --- Dry Lake East (c_9) ---
  { source:"c_9", target:"x_nv_energy", rel:"ppa_with", note:"PPA approved in IRP", y:2024 },
  { source:"c_9", target:"x_blm", rel:"on_blm_land", note:"BLM ROD approved", y:2024 },
  { source:"c_9", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement", y:2024 },

  // --- Rough Hat Clark (c_10) ---
  { source:"c_10", target:"x_candela", rel:"developed_by", note:"Co-developer with Hamel", y:2022 },
  { source:"c_10", target:"x_blm", rel:"on_blm_land", note:"BLM ROD approved Dec 2024", y:2024 },
  { source:"c_10", target:"x_nv_energy", rel:"ppa_with", note:"PPA under negotiation", y:2024 },

  // --- Boulder Solar III (c_11) ---
  { source:"c_11", target:"x_174power", rel:"developed_by", note:"Developer (Hanwha sub)", y:2024 },
  { source:"c_11", target:"x_nv_energy", rel:"ppa_with", note:"PPA approved in IRP", y:2024 },
  { source:"c_11", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement", y:2024 },

  // --- Libra Solar (c_12) ---
  { source:"c_12", target:"x_arevia", rel:"developed_by", note:"Lead developer", y:2022 },
  { source:"c_12", target:"x_blm", rel:"on_blm_land", note:"Final EIS published", y:2024 },
  { source:"c_12", target:"x_nv_energy", rel:"ppa_with", note:"$34.97/MWh 25-year PPA", y:2024 },
  { source:"c_12", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement", y:2024 },

  // --- Greenlink North (c_13) ---
  { source:"c_13", target:"x_nv_energy", rel:"developed_by", note:"Utility transmission", y:2020 },
  { source:"c_13", target:"x_blm", rel:"on_blm_land", note:"EIS remanded — additional review", y:2025 },
  { source:"c_13", target:"x_ferc", rel:"filed_with", note:"Interstate transmission", y:2022 },
  { source:"c_13", target:"x_mastec", rel:"partners_with", note:"General contractor", y:2024 },

  // --- Esmeralda Seven (c_16) ---
  { source:"c_16", target:"x_blm", rel:"on_blm_land", note:"Draft Programmatic EIS", y:2025 },

  // --- Amargosa Desert BESS (c_17) ---
  { source:"c_17", target:"x_blm", rel:"on_blm_land", note:"Competitive lease SEZ", y:2024 },
  { source:"c_17", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy development asset in RFP", y:2024 },

  // --- Cross-cutting (existing) ---
  { source:"x_nv_energy", target:"x_berkshire", rel:"backed_by", note:"Parent company", y:2013 },
  { source:"x_nv_energy", target:"x_pucn", rel:"filed_with", note:"Regulated utility", y:2000 },
  { source:"x_goed", target:"x_switch", rel:"grants_to", note:"Data center tax abatements", y:2010 },
  { source:"x_goed", target:"x_google", rel:"grants_to", note:"Data center tax abatements", y:2018 },

  // --- Greenlink enables projects (existing) ---
  { source:"c_7", target:"c_12", rel:"enables", note:"Greenlink West enables Libra Solar delivery", y:2027 },
  { source:"c_7", target:"c_6", rel:"enables", note:"Greenlink West enables Sierra Solar delivery", y:2027 },
  { source:"c_13", target:"c_3", rel:"enables", note:"Greenlink North serves TRIC data center load", y:2028 },
  { source:"c_13", target:"c_4", rel:"enables", note:"Greenlink North serves Google TRIC load", y:2028 },

  // ========================================================================
  // SECTION 2: PEOPLE → ORGANIZATIONS (new)
  // ========================================================================

  // NV Energy Leadership
  { source:"p_cannon", target:"x_nv_energy", rel:"leads", note:"President/CEO since 2020. $6B capital plan.", y:2020 },
  { source:"p_cannon", target:"x_pucn", rel:"testifies_before", note:"IRP proceedings, rate cases, CTT docket", y:2024 },
  { source:"p_cannon", target:"x_berkshire", rel:"reports_to", note:"BHE subsidiary CEO", y:2020 },
  { source:"p_shortino", target:"x_nv_energy", rel:"employed_by", note:"VP Transmission & Distribution", y:2019 },
  { source:"p_shortino", target:"c_7", rel:"project_lead", note:"Greenlink West $2.4B project executive", y:2020 },
  { source:"p_shortino", target:"c_13", rel:"project_lead", note:"Greenlink North $1.8B project executive", y:2020 },
  { source:"p_brigger", target:"x_nv_energy", rel:"employed_by", note:"Director Renewable Procurement", y:2018 },
  { source:"p_brigger", target:"c_6", rel:"project_lead", note:"Sierra Solar $1.5B procurement lead", y:2023 },
  { source:"p_matuska", target:"x_nv_energy", rel:"employed_by", note:"VP Generation. Coal-to-clean strategy.", y:2017 },
  { source:"p_matuska", target:"c_2", rel:"project_lead", note:"Reid Gardner coal-to-BESS conversion", y:2021 },
  { source:"p_stoltz", target:"x_berkshire", rel:"employed_by", note:"President BHE Renewables division", y:2018 },
  { source:"p_stoltz", target:"x_nv_energy", rel:"oversees", note:"BHE renewables portfolio oversight", y:2018 },

  // PUCN Commissioners
  { source:"p_caudill", target:"x_pucn", rel:"chairs", note:"PUCN Chair. IRP and CTT docket lead.", y:2022 },
  { source:"p_caudill", target:"c_7", rel:"adjudicates", note:"Greenlink West cost recovery docket 24-09032", y:2024 },
  { source:"p_ringler", target:"x_pucn", rel:"commissioner_of", note:"IRP review, rate case adjudication", y:2023 },
  { source:"p_ringler", target:"c_6", rel:"adjudicates", note:"Sierra Solar IRP approval 24-05041", y:2024 },
  { source:"p_faris", target:"x_pucn", rel:"commissioner_of", note:"Rate recovery, consumer advocacy", y:2023 },
  { source:"p_faris", target:"c_7", rel:"adjudicates", note:"Greenlink West rate increase review", y:2024 },
  { source:"p_brown", target:"x_pucn", rel:"commissioner_of", note:"Clean Transition Tariff review", y:2023 },
  { source:"p_brown", target:"c_4", rel:"adjudicates", note:"Google CTT application review", y:2024 },

  // Developer Leadership
  { source:"p_latimer", target:"x_fervo", rel:"leads", note:"CEO & co-founder. MIT PhD.", y:2017 },
  { source:"p_latimer", target:"c_8", rel:"project_lead", note:"Corsac Station 115MW EGS development", y:2023 },
  { source:"p_norbeck", target:"x_fervo", rel:"cto_of", note:"CTO. Horizontal drilling + fiber optic sensing pioneer.", y:2017 },
  { source:"p_norbeck", target:"c_8", rel:"technical_lead", note:"Corsac Station drilling technology", y:2023 },
  { source:"p_blachar", target:"x_ormat", rel:"leads", note:"CEO. 20+ year Ormat veteran. NYSE: ORA.", y:2020 },
  { source:"p_blachar", target:"c_5", rel:"oversees", note:"McGinness Hills 160MW operations", y:2020 },
  { source:"p_blachar", target:"c_15", rel:"oversees", note:"Ormat Google 150MW portfolio development", y:2024 },
  { source:"p_bronczek", target:"x_ormat", rel:"chairs", note:"Board Chair. Former FedEx COO.", y:2019 },
  { source:"p_peacher", target:"x_primergy", rel:"employed_by", note:"VP Development. 3GW+ pipeline.", y:2020 },
  { source:"p_peacher", target:"c_1", rel:"project_lead", note:"Gemini Solar 690MW operations oversight", y:2020 },
  { source:"p_peacher", target:"c_14", rel:"project_lead", note:"Purple Sage 400MW development lead", y:2024 },
  { source:"p_mcbride", target:"x_arevia", rel:"leads", note:"CEO. 5GW+ western US pipeline.", y:2019 },
  { source:"p_mcbride", target:"c_12", rel:"project_lead", note:"Libra Solar 700MW developer lead", y:2022 },
  { source:"p_hamel", target:"x_candela", rel:"partners_with", note:"Hamel Renewables co-development", y:2022 },
  { source:"p_hamel", target:"c_10", rel:"project_lead", note:"Rough Hat Clark 400MW co-developer", y:2022 },
  { source:"p_hanwha", target:"x_174power", rel:"leads", note:"CEO. Hanwha subsidiary. 2GW US portfolio.", y:2019 },
  { source:"p_hanwha", target:"c_11", rel:"project_lead", note:"Boulder Solar III 128MW development", y:2024 },
  { source:"p_schoonhoven", target:"x_quinbrook", rel:"leads", note:"Managing Director. $8B+ AUM.", y:2017 },
  { source:"p_schoonhoven", target:"c_1", rel:"investor_in", note:"Gemini Solar lead investor", y:2018 },
  { source:"p_schoonhoven", target:"c_14", rel:"investor_in", note:"Purple Sage via Primergy subsidiary", y:2024 },

  // BLM & Government
  { source:"p_aguilar", target:"x_blm", rel:"leads", note:"NV State Director. 48M acres.", y:2021 },
  { source:"p_aguilar", target:"c_16", rel:"oversees", note:"Esmeralda Seven programmatic EIS authority", y:2025 },
  { source:"p_aguilar", target:"c_7", rel:"permitted", note:"Greenlink West BLM ROW issuance", y:2023 },
  { source:"p_lombardo", target:"x_goed", rel:"oversees", note:"Governor appoints GOED director", y:2023 },
  { source:"p_lombardo", target:"x_pucn", rel:"appoints", note:"Governor appoints PUCN commissioners", y:2023 },
  { source:"p_guinn", target:"goe", rel:"leads", note:"Director, Governor's Office of Energy", y:2023 },

  // Financial & Advisory People
  { source:"p_foley", target:"x_goldman", rel:"employed_by", note:"Managing Director. Project finance.", y:2015 },
  { source:"p_foley", target:"c_7", rel:"advises", note:"Greenlink West capital markets lead", y:2024 },
  { source:"p_chen", target:"x_morgan", rel:"employed_by", note:"Director. Infrastructure team.", y:2018 },
  { source:"p_chen", target:"c_6", rel:"advises", note:"Sierra Solar project finance advisory", y:2024 },
  { source:"p_levy", target:"x_fennemore", rel:"partner_at", note:"Lead NV Energy outside counsel. 25+ years.", y:2000 },
  { source:"p_levy", target:"x_nv_energy", rel:"advises", note:"Regulatory strategy and rate case counsel", y:2000 },

  // Technical & Environmental People
  { source:"p_boehm", target:"x_caiso", rel:"employed_by", note:"VP Grid Services. Western EIM governance.", y:2016 },
  { source:"p_boehm", target:"x_nv_energy", rel:"coordinates_with", note:"NV-CA interconnection planning", y:2020 },
  { source:"p_garcia", target:"x_swca", rel:"leads", note:"NV Regional Director. Western energy NEPA.", y:2015 },
  { source:"p_garcia", target:"c_7", rel:"consultant_for", note:"Greenlink West EIS project manager", y:2021 },
  { source:"p_garcia", target:"c_12", rel:"consultant_for", note:"Libra Solar EIS project manager", y:2023 },

  // Labor People
  { source:"p_kelly", target:"x_ibew396", rel:"leads", note:"Business Manager. 4,000+ members.", y:2019 },
  { source:"p_kelly", target:"c_7", rel:"labor_agreement", note:"Greenlink West Project Labor Agreement", y:2024 },
  { source:"p_kelly", target:"c_6", rel:"labor_agreement", note:"Sierra Solar electrical workforce", y:2024 },

  // Data Center Executives
  { source:"p_seibold", target:"x_switch", rel:"employed_by", note:"VP Energy Strategy. 100% renewable.", y:2018 },
  { source:"p_seibold", target:"c_3", rel:"oversees", note:"Citadel Campus 495MW energy procurement", y:2018 },
  { source:"p_desmond", target:"x_google", rel:"employed_by", note:"Head of Energy, Google Cloud West.", y:2020 },
  { source:"p_desmond", target:"c_4", rel:"oversees", note:"Google TRIC 24/7 CFE strategy", y:2020 },
  { source:"p_desmond", target:"x_fervo", rel:"negotiated_with", note:"115MW geothermal PPA architect", y:2023 },
  { source:"p_desmond", target:"x_ormat", rel:"negotiated_with", note:"150MW geothermal PPA architect", y:2024 },
  { source:"p_smith", target:"x_microsoft", rel:"employed_by", note:"VP Data Center Development.", y:2021 },
  { source:"p_smith", target:"x_goed", rel:"negotiated_with", note:"Data center abatement application", y:2024 },
  { source:"p_vantage_ceo", target:"x_vantage", rel:"leads", note:"CEO. $3B NV project.", y:2020 },
  { source:"p_vantage_ceo", target:"x_goed", rel:"negotiated_with", note:"Data center abatement application", y:2025 },

  // Transmission Contractor
  { source:"p_mastec_ceo", target:"x_mastec", rel:"leads", note:"CEO. NYSE: MTZ. $12B+ revenue.", y:2007 },
  { source:"p_mastec_ceo", target:"c_7", rel:"contractor_for", note:"Greenlink West general contractor", y:2024 },
  { source:"p_mastec_ceo", target:"c_13", rel:"contractor_for", note:"Greenlink North general contractor", y:2024 },

  // Additional Government People
  { source:"p_kirkpatrick", target:"c_8", rel:"surveys", note:"Geothermal resource assessment Pershing County", y:2023 },
  { source:"p_kirkpatrick", target:"c_5", rel:"surveys", note:"McGinness Hills geothermal resource mapping", y:2018 },
  { source:"p_amodei", target:"x_blm", rel:"legislates", note:"BLM land use reform. NV-2 district.", y:2021 },

  // Additional Industry & Grid People
  { source:"p_hooker", target:"x_nv_energy", rel:"employed_by", note:"VP Regulatory. PUCN filings strategy.", y:2016 },
  { source:"p_hooker", target:"x_pucn", rel:"testifies_before", note:"IRP and rate case testimony", y:2024 },
  { source:"p_weiss", target:"x_nv_energy", rel:"employed_by", note:"Director Interconnection. 20GW+ queue.", y:2019 },
  { source:"p_weiss", target:"c_14", rel:"manages", note:"Purple Sage interconnection study management", y:2025 },
  { source:"p_harmon", target:"c_1", rel:"consults_on", note:"Gemini Solar desert tortoise consultation", y:2020 },
  { source:"p_harmon", target:"c_16", rel:"consults_on", note:"Esmeralda Seven ESA compliance review", y:2025 },
  { source:"p_harmon", target:"c_10", rel:"consults_on", note:"Rough Hat Clark biological opinion", y:2024 },
  { source:"p_rosendin_ceo", target:"x_rosendin", rel:"leads", note:"CEO. Family-owned since 1919.", y:2010 },
  { source:"p_rosendin_ceo", target:"c_1", rel:"contractor_for", note:"Gemini Solar 690MW EPC execution", y:2021 },
  { source:"p_bettis", target:"x_burns", rel:"employed_by", note:"VP Western Region.", y:2015 },
  { source:"p_bettis", target:"c_7", rel:"engineer_for", note:"Greenlink West transmission engineering lead", y:2022 },
  { source:"p_wichner", target:"x_nv_energy", rel:"employed_by", note:"Director Grid Modernization.", y:2020 },
  { source:"p_wichner", target:"c_2", rel:"manages", note:"Reid Gardner BESS grid integration", y:2023 },

  // ========================================================================
  // SECTION 3: EQUIPMENT SUPPLY CHAIN (new)
  // ========================================================================

  // Solar Module Supply
  { source:"x_longi", target:"c_1", rel:"supplies", note:"Gemini Solar Hi-MO bifacial modules 690MW", y:2021 },
  { source:"x_longi", target:"c_12", rel:"supplies", note:"Libra Solar module supply agreement 700MW", y:2025 },
  { source:"x_first_solar", target:"c_11", rel:"supplies", note:"Boulder Solar III CdTe thin-film modules. Domestic content bonus.", y:2025 },
  { source:"x_first_solar", target:"c_9", rel:"supplies", note:"Dry Lake East module supply bid", y:2025 },

  // BESS Supply
  { source:"x_tesla_energy", target:"c_2", rel:"supplies", note:"Reid Gardner BESS Megapack integration 440MWh", y:2022 },
  { source:"x_tesla_energy", target:"c_6", rel:"supplies", note:"Sierra Solar BESS Megapack bid 1,600MWh", y:2024 },
  { source:"x_byd", target:"c_9", rel:"supplies", note:"Dry Lake East Blade Battery LFP cells 800MWh", y:2025 },
  { source:"x_byd", target:"c_10", rel:"supplies", note:"Rough Hat Clark BESS cell supply bid", y:2025 },
  { source:"x_fluence", target:"c_6", rel:"supplies", note:"Sierra Solar BESS technology platform", y:2024 },
  { source:"x_fluence", target:"c_14", rel:"supplies", note:"Purple Sage BESS technology evaluation", y:2025 },
  { source:"x_catl", target:"c_17", rel:"supplies", note:"Amargosa Desert BESS cell supply bid", y:2025 },

  // Transmission Equipment
  { source:"x_siemens", target:"c_7", rel:"supplies", note:"Greenlink West 525kV HVDC converter equipment", y:2025 },
  { source:"x_siemens", target:"c_13", rel:"supplies", note:"Greenlink North 525kV HVDC converter equipment", y:2026 },

  // ========================================================================
  // SECTION 4: LEGAL & ADVISORY (new)
  // ========================================================================

  { source:"x_fennemore", target:"x_nv_energy", rel:"advises", note:"Lead outside counsel. Regulatory + rate cases. 25+ year relationship.", y:2000 },
  { source:"x_fennemore", target:"c_7", rel:"advises", note:"Greenlink West rate recovery legal strategy", y:2024 },
  { source:"x_holland", target:"x_blm", rel:"advises", note:"NEPA compliance counsel. Western energy ROW.", y:2015 },
  { source:"x_holland", target:"c_10", rel:"advises", note:"Rough Hat Clark BLM ROW legal counsel", y:2023 },
  { source:"x_snell", target:"c_12", rel:"advises", note:"Libra Solar PPA negotiation + clean energy finance", y:2024 },
  { source:"x_snell", target:"c_9", rel:"advises", note:"Dry Lake East PPA negotiation counsel", y:2024 },
  { source:"x_stoel", target:"c_8", rel:"advises", note:"Fervo Corsac Station project finance + PPA", y:2023 },
  { source:"x_stoel", target:"x_fervo", rel:"advises", note:"Corporate counsel. Series C + project finance.", y:2022 },

  // Financial Advisory
  { source:"x_goldman", target:"c_7", rel:"advises", note:"Greenlink West capital markets advisory. $2.4B project.", y:2024 },
  { source:"x_goldman", target:"x_nv_energy", rel:"advises", note:"Strategic finance advisory. Green bond underwriting.", y:2020 },
  { source:"x_morgan", target:"c_6", rel:"advises", note:"Sierra Solar project finance advisory. $1.5B.", y:2024 },
  { source:"x_morgan", target:"c_1", rel:"advises", note:"Gemini Solar refinancing advisory", y:2023 },
  { source:"x_jpmorgan", target:"c_1", rel:"tax_equity", note:"Gemini Solar 30% ITC monetization. Tax equity investor.", y:2021 },
  { source:"x_jpmorgan", target:"c_9", rel:"tax_equity", note:"Dry Lake East ITC tax equity evaluation", y:2025 },
  { source:"x_jpmorgan", target:"c_11", rel:"tax_equity", note:"Boulder Solar III ITC tax equity bid", y:2025 },
  { source:"x_bofa", target:"x_nv_energy", rel:"finances", note:"Green bond program. Sustainability-linked financing.", y:2022 },
  { source:"x_bofa", target:"c_12", rel:"finances", note:"Libra Solar project finance syndication", y:2025 },

  // ========================================================================
  // SECTION 5: ENVIRONMENTAL & PERMITTING (new)
  // ========================================================================

  { source:"x_swca", target:"c_7", rel:"consultant_for", note:"Greenlink West EIS contractor. 472-mile corridor.", y:2021 },
  { source:"x_swca", target:"c_12", rel:"consultant_for", note:"Libra Solar Final EIS contractor. Lyon County.", y:2023 },
  { source:"x_swca", target:"c_13", rel:"consultant_for", note:"Greenlink North EIS contractor. Remanded for review.", y:2022 },
  { source:"x_swca", target:"c_16", rel:"consultant_for", note:"Esmeralda Seven Programmatic EIS support", y:2025 },
  { source:"x_westland", target:"c_10", rel:"consultant_for", note:"Rough Hat Clark biological surveys. Desert tortoise.", y:2023 },
  { source:"x_westland", target:"c_16", rel:"consultant_for", note:"Esmeralda PEIS biological baseline surveys", y:2025 },
  { source:"x_westland", target:"c_9", rel:"consultant_for", note:"Dry Lake East biological assessment", y:2024 },
  { source:"x_aecom", target:"c_7", rel:"consultant_for", note:"Greenlink West route engineering + environmental", y:2021 },
  { source:"x_aecom", target:"c_13", rel:"consultant_for", note:"Greenlink North route engineering", y:2022 },

  // Desert Conservation / Permitting
  { source:"dcp", target:"c_9", rel:"regulates", note:"Desert tortoise mitigation banking. Clark County MSHCP.", y:2024 },
  { source:"dcp", target:"c_10", rel:"regulates", note:"Desert tortoise mitigation. Nye County border.", y:2024 },
  { source:"dcp", target:"c_1", rel:"regulates", note:"Gemini Solar desert tortoise translocation compliance", y:2020 },
  { source:"dcp", target:"c_11", rel:"regulates", note:"Boulder Solar III habitat assessment", y:2025 },

  // ========================================================================
  // SECTION 6: LABOR & CONSTRUCTION (new)
  // ========================================================================

  // IBEW Local 396
  { source:"x_ibew396", target:"c_7", rel:"labor_for", note:"Greenlink West electrical. PLA signed. 2,000+ workers.", y:2024 },
  { source:"x_ibew396", target:"c_6", rel:"labor_for", note:"Sierra Solar electrical installation", y:2025 },
  { source:"x_ibew396", target:"c_1", rel:"labor_for", note:"Gemini Solar electrical installation", y:2021 },
  { source:"x_ibew396", target:"c_9", rel:"labor_for", note:"Dry Lake East electrical (planned)", y:2026 },

  // Operating Engineers Local 12
  { source:"x_oe12", target:"c_7", rel:"labor_for", note:"Greenlink West heavy equipment operations", y:2025 },
  { source:"x_oe12", target:"c_1", rel:"labor_for", note:"Gemini Solar construction heavy equipment", y:2021 },
  { source:"x_oe12", target:"c_6", rel:"labor_for", note:"Sierra Solar grading and construction", y:2025 },
  { source:"x_oe12", target:"c_12", rel:"labor_for", note:"Libra Solar construction (planned)", y:2026 },

  // EPC Contractors
  { source:"x_rosendin", target:"c_1", rel:"epc_for", note:"Gemini Solar EPC. 690MW. Top US electrical contractor.", y:2021 },
  { source:"x_rosendin", target:"c_9", rel:"epc_for", note:"Dry Lake East EPC bid", y:2025 },
  { source:"x_burns", target:"c_7", rel:"engineer_for", note:"Greenlink West transmission engineering", y:2022 },
  { source:"x_burns", target:"c_13", rel:"engineer_for", note:"Greenlink North transmission engineering", y:2023 },
  { source:"x_mortenson", target:"c_6", rel:"epc_for", note:"Sierra Solar construction EPC bid", y:2024 },
  { source:"x_mortenson", target:"c_12", rel:"epc_for", note:"Libra Solar EPC evaluation", y:2025 },

  // ========================================================================
  // SECTION 7: GRID & MARKET OPERATORS (new)
  // ========================================================================

  { source:"x_caiso", target:"x_nv_energy", rel:"coordinates_with", note:"Western Energy Imbalance Market participant", y:2015 },
  { source:"x_caiso", target:"c_7", rel:"benefits_from", note:"NV-CA interconnection via Greenlink West 525kV", y:2027 },
  { source:"x_caiso", target:"c_13", rel:"benefits_from", note:"Northern NV-CA interconnection via Greenlink North", y:2028 },
  { source:"x_wecc", target:"x_nv_energy", rel:"regulates", note:"Reliability standards. TPL planning. Interconnection-wide.", y:2000 },
  { source:"x_wecc", target:"c_7", rel:"reviews", note:"Greenlink West reliability impact assessment", y:2024 },
  { source:"x_wecc", target:"c_13", rel:"reviews", note:"Greenlink North reliability impact assessment", y:2024 },
  { source:"x_sppc", target:"c_13", rel:"served_by", note:"Northern NV subsidiary serves Greenlink North terminus", y:2020 },
  { source:"x_sppc", target:"c_3", rel:"serves", note:"Switch Citadel Campus power delivery", y:2000 },
  { source:"x_sppc", target:"c_4", rel:"serves", note:"Google TRIC data center power delivery", y:2018 },

  // ========================================================================
  // SECTION 8: TRIBAL & COMMUNITY (new)
  // ========================================================================

  { source:"x_moapa", target:"c_2", rel:"hosts", note:"Reid Gardner on tribal boundary. Former coal plant remediation.", y:2021 },
  { source:"x_moapa", target:"c_9", rel:"neighbors", note:"Dry Lake East proximity. Community benefit agreement.", y:2024 },
  { source:"x_shoshone", target:"c_16", rel:"traditional_land", note:"Esmeralda Valley within Treaty of Ruby Valley territory", y:2025 },
  { source:"x_shoshone", target:"c_5", rel:"traditional_land", note:"McGinness Hills within traditional Shoshone territory", y:2012 },
  { source:"x_clark_county", target:"c_1", rel:"permits", note:"Gemini local permits. Clark County environmental compliance.", y:2020 },
  { source:"x_clark_county", target:"c_9", rel:"permits", note:"Dry Lake East. Clark County conditional use.", y:2024 },
  { source:"x_clark_county", target:"c_11", rel:"permits", note:"Boulder Solar III. Boulder City jurisdiction.", y:2025 },
  { source:"x_nye_county", target:"c_10", rel:"permits", note:"Rough Hat Clark. Nye County conditional use permit.", y:2024 },
  { source:"x_nye_county", target:"c_17", rel:"permits", note:"Amargosa Desert BESS. Nye County land use.", y:2025 },
  { source:"x_nye_county", target:"c_14", rel:"permits", note:"Purple Sage. Nye County conditional use.", y:2025 },

  // ========================================================================
  // SECTION 9: ECOSYSTEM ORG RELATIONSHIPS (new)
  // ========================================================================

  { source:"wrea", target:"x_nv_energy", rel:"member_org", note:"NV Energy is WREA utility member", y:2010 },
  { source:"wrea", target:"x_pucn", rel:"advocates_before", note:"Western renewable policy advocacy", y:2015 },
  { source:"nma", target:"c_16", rel:"opposes", note:"Land use conflict Esmeralda. Mining claims overlap solar PEIS.", y:2025 },
  { source:"nma", target:"x_blm", rel:"advocates_before", note:"Mining claim priority over solar ROW applications", y:2024 },
  { source:"nra_resort", target:"x_nv_energy", rel:"large_customer", note:"Casinos are largest commercial electricity consumers in NV", y:2000 },
  { source:"nra_resort", target:"x_pucn", rel:"intervenes", note:"Rate case intervener. Commercial customer rates.", y:2024 },
  { source:"nshe", target:"x_fervo", rel:"research_partner", note:"UNR geothermal engineering research. EGS technology validation.", y:2022 },
  { source:"nshe", target:"x_ormat", rel:"research_partner", note:"UNR/Ormat geothermal workforce training + R&D", y:2015 },
  { source:"nshe", target:"c_8", rel:"research_partner", note:"Corsac Station fiber optic sensing research collaboration", y:2023 },
  { source:"nsta", target:"x_nv_energy", rel:"finances", note:"Green bond facilitation. State capital markets.", y:2022 },
  { source:"nsta", target:"c_7", rel:"finances", note:"Greenlink West state bond support evaluation", y:2024 },
  { source:"irec", target:"x_pucn", rel:"advises", note:"Interconnection queue reform standards + model rules", y:2023 },
  { source:"irec", target:"x_nv_energy", rel:"advises", note:"Interconnection process improvement recommendations", y:2023 },
  { source:"wga_energy", target:"c_7", rel:"supports", note:"Western transmission siting coordination. Greenlink West.", y:2023 },
  { source:"wga_energy", target:"c_13", rel:"supports", note:"Western transmission siting coordination. Greenlink North.", y:2023 },
  { source:"snric", target:"x_switch", rel:"hosts", note:"APEX Industrial Park data center corridor", y:2015 },
  { source:"snric", target:"x_microsoft", rel:"hosts", note:"Microsoft TRIC-adjacent data center site", y:2024 },
  { source:"snric", target:"x_vantage", rel:"hosts", note:"Vantage Data Centers NV campus site", y:2025 },
  { source:"nvsea", target:"x_pucn", rel:"advocates_before", note:"Solar industry policy. Net metering. RPS compliance.", y:2018 },
  { source:"nvsea", target:"c_12", rel:"supports", note:"Libra Solar advocacy. Largest NV solar project.", y:2024 },
  { source:"nrea", target:"x_nv_energy", rel:"coordinates_with", note:"Rural co-op power supply agreements", y:2010 },
  { source:"goe", target:"x_pucn", rel:"coordinates_with", note:"State energy policy + regulatory alignment", y:2020 },
  { source:"goe", target:"x_doe", rel:"coordinates_with", note:"IRA fund distribution. Federal program implementation.", y:2023 },

  // ========================================================================
  // SECTION 10: DEVELOPER COMPETITION & CO-INVESTMENT (new)
  // ========================================================================

  { source:"x_nextera", target:"c_16", rel:"evaluating", note:"Esmeralda Seven PEIS bid evaluation. World's largest renewable co.", y:2025 },
  { source:"x_nextera", target:"c_17", rel:"evaluating", note:"Amargosa Desert SEZ competitive lease bid", y:2025 },
  { source:"x_aes", target:"c_17", rel:"evaluating", note:"Amargosa SEZ lease bids. Storage technology expertise.", y:2025 },
  { source:"x_aes", target:"x_fluence", rel:"co_owns", note:"AES + Siemens joint venture. BESS technology provider.", y:2018 },
  { source:"x_edf", target:"c_16", rel:"evaluating", note:"Esmeralda Seven bids. 16GW US portfolio.", y:2025 },
  { source:"x_edf", target:"c_12", rel:"evaluating", note:"Libra Solar co-investment evaluation", y:2025 },
  { source:"x_quinbrook", target:"x_primergy", rel:"parent_of", note:"Quinbrook is Primergy Solar parent company", y:2017 },
  { source:"x_174power", target:"c_11", rel:"develops", note:"Boulder Solar III via Hanwha subsidiary. 128MW.", y:2024 },

  // ========================================================================
  // SECTION 11: CROSS-PROJECT DEPENDENCIES (critical intelligence, new)
  // ========================================================================

  { source:"c_7", target:"c_8", rel:"enables", note:"Greenlink West delivers Corsac geothermal to southern NV load", y:2027 },
  { source:"c_7", target:"c_9", rel:"enables", note:"Greenlink West enables Dry Lake East dispatch flexibility", y:2027 },
  { source:"c_7", target:"c_14", rel:"enables", note:"Greenlink West needed for Purple Sage delivery to southern NV", y:2027 },
  { source:"c_3", target:"c_4", rel:"co_located", note:"Switch + Google both at TRIC industrial center", y:2018 },
  { source:"c_3", target:"c_13", rel:"depends_on", note:"Switch load growth needs Greenlink North capacity", y:2028 },
  { source:"c_4", target:"c_8", rel:"customer_of", note:"Google PPA for Corsac Station 115MW geothermal", y:2023 },
  { source:"c_4", target:"c_15", rel:"customer_of", note:"Google PPA for Ormat 150MW geothermal portfolio", y:2024 },
  { source:"c_5", target:"c_15", rel:"related_portfolio", note:"Both Ormat geothermal NV portfolio projects", y:2024 },
  { source:"c_6", target:"c_7", rel:"depends_on", note:"Sierra Solar delivery requires Greenlink West completion", y:2027 },
  { source:"c_12", target:"c_7", rel:"depends_on", note:"Libra Solar 700MW requires Greenlink West for delivery", y:2027 },
  { source:"c_14", target:"c_7", rel:"depends_on", note:"Purple Sage requires Greenlink West interconnection", y:2027 },
  { source:"c_8", target:"c_13", rel:"benefits_from", note:"Corsac Station could use Greenlink North for capacity", y:2028 },
  { source:"c_2", target:"c_9", rel:"co_located", note:"Both near Moapa. Shared transmission infrastructure.", y:2024 },
  { source:"c_16", target:"c_7", rel:"depends_on", note:"Esmeralda 6.2GW requires massive new transmission beyond Greenlink", y:2030 },

  // ========================================================================
  // SECTION 12: INSURANCE & RISK (new)
  // ========================================================================

  { source:"x_marsh", target:"c_7", rel:"insures", note:"Greenlink West construction all-risk. $2.4B insured value.", y:2024 },
  { source:"x_marsh", target:"c_6", rel:"insures", note:"Sierra Solar construction insurance. $1.5B insured value.", y:2024 },
  { source:"x_marsh", target:"c_13", rel:"insures", note:"Greenlink North construction all-risk evaluation", y:2025 },
  { source:"x_aon", target:"c_1", rel:"insures", note:"Gemini operational insurance. 690MW solar+storage.", y:2023 },
  { source:"x_aon", target:"c_12", rel:"insures", note:"Libra Solar construction insurance evaluation. 700MW.", y:2025 },
  { source:"x_aon", target:"c_2", rel:"insures", note:"Reid Gardner BESS operational insurance. 220MW.", y:2025 },

  // ========================================================================
  // SECTION 13: POLITICAL & GOVERNMENT (new)
  // ========================================================================

  { source:"p_titus", target:"c_1", rel:"advocates_for", note:"Federal clean energy policy. Southern NV solar.", y:2020 },
  { source:"p_titus", target:"c_7", rel:"advocates_for", note:"Transmission permitting reform legislation", y:2023 },
  { source:"p_masto", target:"c_7", rel:"advocates_for", note:"Transmission infrastructure. IRA funding champion.", y:2022 },
  { source:"p_masto", target:"c_8", rel:"advocates_for", note:"Enhanced geothermal federal R&D support", y:2023 },
  { source:"p_masto", target:"x_doe", rel:"legislates", note:"IRA implementation. DOE LPO authorization.", y:2022 },
  { source:"p_rosen", target:"c_16", rel:"advocates_for", note:"Esmeralda solar development. Rural NV economy.", y:2025 },
  { source:"p_rosen", target:"x_blm", rel:"legislates", note:"BLM land use reform. Solar permitting.", y:2023 },
  { source:"p_amodei", target:"c_13", rel:"advocates_for", note:"Greenlink North northern NV economic benefit", y:2023 },
  { source:"p_goicoechea", target:"c_16", rel:"monitors", note:"Esmeralda Seven rural county impact assessment", y:2025 },
  { source:"p_goicoechea", target:"c_10", rel:"monitors", note:"Rough Hat Clark Nye County development", y:2024 },

  // GOED Data Center Abatements
  { source:"x_goed", target:"x_microsoft", rel:"grants_to", note:"Data center tax abatement package", y:2024 },
  { source:"x_goed", target:"x_vantage", rel:"grants_to", note:"Data center tax abatement package", y:2025 },

  // DOE Relationships
  { source:"x_doe", target:"x_fervo", rel:"funds", note:"DOE Geothermal Technologies Office. EGS demonstration grants.", y:2020 },
  { source:"x_doe", target:"c_8", rel:"supports", note:"Corsac Station EGS demonstration. DOE GTO funding.", y:2023 },
  { source:"x_doe", target:"c_7", rel:"evaluates", note:"Greenlink West DOE LPO loan application evaluation", y:2024 },
  { source:"x_doe", target:"x_ormat", rel:"funds", note:"$350M DOE loan. Geothermal portfolio expansion.", y:2022 },

  // SNWA Water
  { source:"x_snwa", target:"c_1", rel:"permits", note:"Gemini Solar water allocation. Construction + dust suppression.", y:2020 },
  { source:"x_snwa", target:"c_9", rel:"permits", note:"Dry Lake East water allocation evaluation", y:2025 },
  { source:"x_snwa", target:"c_16", rel:"reviews", note:"Esmeralda Seven water availability assessment. Desert constraints.", y:2025 },

  // ========================================================================
  // SECTION 14: NAIOP & DATA CENTER CORRIDOR (new)
  // ========================================================================

  { source:"x_naiop", target:"x_switch", rel:"promotes", note:"APEX data center corridor advocacy", y:2020 },
  { source:"x_naiop", target:"x_microsoft", rel:"promotes", note:"Microsoft NV data center site advocacy", y:2024 },
  { source:"x_naiop", target:"x_vantage", rel:"promotes", note:"Vantage $3B project site advocacy", y:2025 },

  // ========================================================================
  // SECTION 15: ADDITIONAL CROSS-ENTITY RELATIONSHIPS (new)
  // ========================================================================

  // Ormat NYSE listing edge
  { source:"x_ormat", target:"c_15", rel:"develops", note:"Ormat Google 150MW geothermal portfolio", y:2024 },

  // Energy Vault broader
  { source:"x_energy_vault", target:"c_2", rel:"epc_for", note:"Reid Gardner BESS EPC. Grid-scale storage solutions.", y:2022 },

  // Sunpower distributed
  { source:"x_sunpower", target:"x_nv_energy", rel:"interconnects_with", note:"Distributed generation. Net metering program.", y:2018 },

  // Berkshire Hathaway cascade
  { source:"x_berkshire", target:"x_nv_energy", rel:"owns", note:"100% ownership. Utility holding company.", y:2013 },
  { source:"x_berkshire", target:"x_sppc", rel:"owns", note:"Sierra Pacific Power subsidiary", y:2013 },

  // FERC broader
  { source:"x_ferc", target:"c_7", rel:"jurisdiction", note:"Interstate transmission OATT compliance", y:2024 },
  { source:"x_ferc", target:"x_caiso", rel:"regulates", note:"CAISO market oversight. Western EIM.", y:2000 },
  { source:"x_ferc", target:"x_nv_energy", rel:"regulates", note:"OATT compliance. Interconnection standards.", y:2000 },

  // Data Center demand drivers
  { source:"x_switch", target:"x_nv_energy", rel:"large_customer", note:"495MW planned load. Largest single NV customer.", y:2017 },
  { source:"x_google", target:"x_nv_energy", rel:"large_customer", note:"TRIC data center. CTT applicant. Growing load.", y:2018 },
  { source:"x_microsoft", target:"x_nv_energy", rel:"large_customer", note:"300 acres acquired. Future large load customer.", y:2024 },
  { source:"x_vantage", target:"x_nv_energy", rel:"large_customer", note:"$3B project. Significant future load.", y:2025 },

  // ========================================================================
  // SECTION 16: NEW PEOPLE → ORGANIZATIONS (Batch 1)
  // ========================================================================

  // NV Energy Additional Leadership
  { source:"p_pattaje", target:"x_nv_energy", rel:"employed_by", note:"VP Regulatory & Government Affairs", y:2018 },
  { source:"p_pattaje", target:"x_pucn", rel:"testifies_before", note:"Regulatory filings, rate case testimony, IRP proceedings", y:2024 },
  { source:"p_pattaje", target:"x_goed", rel:"coordinates_with", note:"Data center energy policy. Abatement program coordination.", y:2023 },
  { source:"p_devito", target:"x_nv_energy", rel:"employed_by", note:"VP Customer Solutions. Demand response + data center accounts.", y:2019 },
  { source:"p_devito", target:"x_switch", rel:"account_manages", note:"Switch 495MW load management. Largest single customer.", y:2020 },
  { source:"p_devito", target:"x_google", rel:"account_manages", note:"Google TRIC data center account. CTT coordination.", y:2021 },
  { source:"p_dwyer", target:"x_nv_energy", rel:"employed_by", note:"VP Environmental. NEPA + air quality.", y:2017 },
  { source:"p_dwyer", target:"x_ndep", rel:"coordinates_with", note:"Air quality permit compliance. Reid Gardner remediation.", y:2020 },
  { source:"p_dwyer", target:"c_2", rel:"oversees", note:"Reid Gardner coal ash remediation + BESS environmental compliance", y:2021 },
  { source:"p_ferris", target:"x_nv_energy", rel:"employed_by", note:"VP Finance & Treasurer. Capital markets.", y:2020 },
  { source:"p_ferris", target:"x_goldman", rel:"coordinates_with", note:"Green bond issuance. Greenlink capital markets.", y:2023 },
  { source:"p_ferris", target:"x_bofa", rel:"coordinates_with", note:"Sustainability-linked financing program", y:2022 },

  // BLM Nevada
  { source:"p_raby", target:"x_blm", rel:"leads", note:"BLM Nevada State Director. 48M acres.", y:2022 },
  { source:"p_raby", target:"c_7", rel:"permitted", note:"Greenlink West ROW authorization", y:2023 },
  { source:"p_raby", target:"c_16", rel:"oversees", note:"Esmeralda Seven PEIS process oversight", y:2025 },
  { source:"p_raby", target:"c_12", rel:"permitted", note:"Libra Solar ROD issuance coordination", y:2024 },

  // County Commissioners
  { source:"p_kirkpatrick_cc", target:"x_clark_county", rel:"serves_on", note:"Commissioner District F. Southern NV.", y:2022 },
  { source:"p_kirkpatrick_cc", target:"c_9", rel:"oversees", note:"Dry Lake East county permitting oversight", y:2024 },
  { source:"p_kirkpatrick_cc", target:"c_11", rel:"oversees", note:"Boulder Solar III county permitting oversight", y:2025 },
  { source:"p_jones_cc", target:"x_clark_county", rel:"chairs", note:"Clark County Commission Chair", y:2023 },
  { source:"p_jones_cc", target:"x_goed", rel:"coordinates_with", note:"Data center economic development policy", y:2023 },
  { source:"p_wichman", target:"x_nye_county", rel:"serves_on", note:"Nye County Commissioner. Pahrump district.", y:2021 },
  { source:"p_wichman", target:"c_10", rel:"oversees", note:"Rough Hat Clark county land use approval", y:2024 },
  { source:"p_wichman", target:"c_17", rel:"oversees", note:"Amargosa Desert BESS county land use", y:2025 },
  { source:"p_schinhofen", target:"x_nye_county", rel:"serves_on", note:"Nye County Commissioner. Tonopah district.", y:2019 },
  { source:"p_schinhofen", target:"c_16", rel:"monitors", note:"Esmeralda Seven rural impact on Nye County", y:2025 },
  { source:"p_koenig", target:"c_16", rel:"oversees", note:"Esmeralda Seven county revenue + land use impact", y:2025 },
  { source:"p_zander", target:"c_5", rel:"oversees", note:"McGinness Hills geothermal county oversight", y:2012 },
  { source:"p_hastings", target:"c_12", rel:"oversees", note:"Libra Solar Lyon County conditional use permitting", y:2024 },

  // Tribal Leaders
  { source:"p_anderson_moapa", target:"x_moapa", rel:"leads", note:"Tribal Chairman. Reid Gardner + Moapa Solar.", y:2020 },
  { source:"p_anderson_moapa", target:"c_2", rel:"negotiates", note:"Reid Gardner remediation community benefit agreement", y:2021 },
  { source:"p_anderson_moapa", target:"c_9", rel:"negotiates", note:"Dry Lake East community benefit agreement", y:2024 },
  { source:"p_holley", target:"x_moapa", rel:"serves_on", note:"Vice Chair. Infrastructure development.", y:2020 },
  { source:"p_holley", target:"x_bia", rel:"coordinates_with", note:"BIA trust land leasing + energy development", y:2022 },
  { source:"p_dann", target:"x_shoshone", rel:"represents", note:"Western Shoshone Defense Project elder/advocate", y:2000 },
  { source:"p_dann", target:"c_16", rel:"consults_on", note:"Esmeralda Seven Treaty of Ruby Valley territory", y:2025 },
  { source:"p_mckinney", target:"x_timbisha", rel:"leads", note:"Timbisha Shoshone Chairman. Death Valley region.", y:2021 },
  { source:"p_mckinney", target:"c_17", rel:"consults_on", note:"Amargosa Desert BESS tribal consultation", y:2025 },

  // EPC Project Managers
  { source:"p_diaz_mastec", target:"x_mastec", rel:"employed_by", note:"Project Director, T&D Power segment.", y:2019 },
  { source:"p_diaz_mastec", target:"c_7", rel:"contractor_for", note:"Greenlink West on-site construction director", y:2024 },
  { source:"p_diaz_mastec", target:"c_13", rel:"contractor_for", note:"Greenlink North construction planning", y:2025 },
  { source:"p_norton", target:"x_primoris", rel:"employed_by", note:"VP Renewables. Utility-scale solar EPC.", y:2018 },
  { source:"p_norton", target:"c_11", rel:"contractor_for", note:"Boulder Solar III EPC bid team lead", y:2025 },
  { source:"p_stokes", target:"x_mccarthy", rel:"employed_by", note:"VP Solar. Southwest region.", y:2020 },
  { source:"p_stokes", target:"c_14", rel:"contractor_for", note:"Purple Sage EPC evaluation", y:2025 },
  { source:"p_ramirez", target:"x_mortenson", rel:"employed_by", note:"Project Director. Renewable EPC.", y:2018 },
  { source:"p_ramirez", target:"c_6", rel:"contractor_for", note:"Sierra Solar EPC bid team lead", y:2024 },

  // Law Firm Partners
  { source:"p_mcelwain", target:"x_holland", rel:"partner_at", note:"BLM land use + NEPA practice lead", y:2010 },
  { source:"p_mcelwain", target:"c_10", rel:"advises", note:"Rough Hat Clark BLM ROW legal counsel", y:2023 },
  { source:"p_mcelwain", target:"c_16", rel:"advises", note:"Esmeralda Seven PEIS developer representation", y:2025 },
  { source:"p_hutchison", target:"x_brownstein", rel:"partner_at", note:"NV energy regulatory practice", y:2015 },
  { source:"p_hutchison", target:"x_pucn", rel:"represents_before", note:"Data center tariff + incentive policy", y:2024 },
  { source:"p_hutchison", target:"x_switch", rel:"advises", note:"Switch energy procurement + regulatory counsel", y:2020 },
  { source:"p_shea", target:"x_stoel", rel:"partner_at", note:"Renewable energy project finance", y:2012 },
  { source:"p_shea", target:"x_fervo", rel:"advises", note:"Corporate counsel. Tax equity structuring.", y:2022 },
  { source:"p_drake", target:"x_snell", rel:"partner_at", note:"NV regulatory + PPA practice", y:2014 },
  { source:"p_drake", target:"c_12", rel:"advises", note:"Libra Solar PPA negotiation lead counsel", y:2024 },

  // Financial Advisors
  { source:"p_williams_laz", target:"x_lazard", rel:"employed_by", note:"Vice Chairman. Power & Energy.", y:2010 },
  { source:"p_williams_laz", target:"x_nv_energy", rel:"advises", note:"Strategic advisory. LCOE benchmarking.", y:2022 },
  { source:"p_schwartz", target:"x_cohnreznick", rel:"employed_by", note:"MD. Renewable energy tax equity.", y:2015 },
  { source:"p_schwartz", target:"c_1", rel:"advises", note:"Gemini Solar ITC monetization advisory", y:2021 },
  { source:"p_harper", target:"x_keybanc", rel:"employed_by", note:"Director. Renewable energy project finance.", y:2018 },
  { source:"p_harper", target:"c_12", rel:"advises", note:"Libra Solar project debt syndication", y:2025 },

  // Labor Union Leaders
  { source:"p_vranesh", target:"x_oe12", rel:"leads", note:"Business Manager. 90,000+ members.", y:2018 },
  { source:"p_vranesh", target:"c_7", rel:"labor_agreement", note:"Greenlink West heavy equipment PLA", y:2024 },
  { source:"p_vranesh", target:"c_6", rel:"labor_agreement", note:"Sierra Solar grading + construction PLA", y:2025 },
  { source:"p_martin_ibew", target:"x_ibew396", rel:"employed_by", note:"Assistant Business Manager. Las Vegas.", y:2020 },
  { source:"p_martin_ibew", target:"c_9", rel:"labor_agreement", note:"Dry Lake East electrical workforce planning", y:2026 },
  { source:"p_torres_iron", target:"c_7", rel:"labor_for", note:"Greenlink West transmission tower steel erection", y:2025 },
  { source:"p_torres_iron", target:"c_1", rel:"labor_for", note:"Gemini Solar tracker installation", y:2021 },

  // Grid Operator Contacts
  { source:"p_mainzer", target:"x_caiso", rel:"leads", note:"CEO. Western Day-Ahead Market.", y:2020 },
  { source:"p_mainzer", target:"x_nv_energy", rel:"coordinates_with", note:"Western EIM + EDAM participation", y:2023 },
  { source:"p_parsons", target:"x_wecc", rel:"employed_by", note:"VP Western Interconnection. Reliability.", y:2019 },
  { source:"p_parsons", target:"c_7", rel:"reviews", note:"Greenlink West reliability impact study", y:2024 },

  // Insurance & Risk People
  { source:"p_sims", target:"x_marsh", rel:"employed_by", note:"MD Energy Practice. Renewable insurance.", y:2016 },
  { source:"p_sims", target:"c_7", rel:"insures", note:"Greenlink West construction all-risk policy", y:2024 },
  { source:"p_sims", target:"c_6", rel:"insures", note:"Sierra Solar construction insurance", y:2024 },
  { source:"p_kwon", target:"x_swissre", rel:"employed_by", note:"VP Renewable Energy reinsurance.", y:2018 },
  { source:"p_kwon", target:"c_1", rel:"insures", note:"Gemini Solar operational reinsurance", y:2023 },

  // Environmental Review Leads
  { source:"p_frey", target:"x_blm", rel:"employed_by", note:"BLM Southern NV District Manager", y:2020 },
  { source:"p_frey", target:"c_1", rel:"permitted", note:"Gemini Solar BLM ROW issuance. Southern NV district.", y:2020 },
  { source:"p_frey", target:"c_9", rel:"reviews", note:"Dry Lake East BLM ROW review", y:2024 },
  { source:"p_frey", target:"c_11", rel:"reviews", note:"Boulder Solar III BLM ROW review", y:2025 },
  { source:"p_reese", target:"x_blm", rel:"employed_by", note:"BLM Battle Mountain District Manager", y:2019 },
  { source:"p_reese", target:"c_5", rel:"oversees", note:"McGinness Hills geothermal federal land oversight", y:2019 },
  { source:"p_reese", target:"c_8", rel:"reviews", note:"Corsac Station BLM land review", y:2023 },
  { source:"p_navis", target:"x_fws", rel:"leads", note:"USFWS Nevada State Supervisor", y:2021 },
  { source:"p_navis", target:"c_1", rel:"consults_on", note:"Gemini desert tortoise Section 7 consultation", y:2020 },
  { source:"p_navis", target:"c_16", rel:"consults_on", note:"Esmeralda Seven ESA species review", y:2025 },
  { source:"p_navis", target:"c_10", rel:"consults_on", note:"Rough Hat Clark biological opinion", y:2024 },

  // National Lab & University People
  { source:"p_symko_davies", target:"x_doe", rel:"employed_by", note:"Director GTO. Federal EGS R&D.", y:2019 },
  { source:"p_symko_davies", target:"x_fervo", rel:"funds", note:"DOE GTO demonstration grant oversight", y:2020 },
  { source:"p_symko_davies", target:"c_8", rel:"supports", note:"Corsac Station DOE demonstration project", y:2023 },
  { source:"p_zichella", target:"c_7", rel:"advocates_for", note:"Greenlink West transmission planning advocacy", y:2022 },
  { source:"p_zichella", target:"x_wecc", rel:"advises", note:"Western grid planning stakeholder", y:2020 },
  { source:"p_bowen", target:"x_nrel", rel:"employed_by", note:"Senior Researcher. Grid integration.", y:2016 },
  { source:"p_bowen", target:"c_6", rel:"researches", note:"Sierra Solar grid integration modeling study", y:2024 },
  { source:"p_bowen", target:"c_2", rel:"researches", note:"Reid Gardner BESS dispatch optimization study", y:2023 },
  { source:"p_bauer", target:"x_sandia", rel:"employed_by", note:"Manager. Geothermal research.", y:2015 },
  { source:"p_bauer", target:"x_fervo", rel:"researches", note:"EGS reservoir characterization R&D partnership", y:2021 },
  { source:"p_bauer", target:"c_8", rel:"researches", note:"Corsac Station EGS reservoir monitoring", y:2023 },

  // Media / Analyst People
  { source:"p_ward_wm", target:"x_woodmac", rel:"employed_by", note:"Senior Research Director. US solar+storage.", y:2017 },
  { source:"p_ward_wm", target:"c_1", rel:"monitors", note:"Gemini Solar project tracking + analysis", y:2023 },

  // Additional Developer People
  { source:"p_coppinger", target:"x_nextera", rel:"employed_by", note:"VP Development. Western US.", y:2019 },
  { source:"p_coppinger", target:"c_16", rel:"evaluates", note:"Esmeralda Seven PEIS bid evaluation", y:2025 },
  { source:"p_devin", target:"x_aes", rel:"leads", note:"President & CEO. NYSE: AES.", y:2011 },
  { source:"p_devin", target:"x_fluence", rel:"oversees", note:"AES-Siemens BESS JV oversight", y:2018 },
  { source:"p_hogan", target:"x_edf", rel:"leads", note:"President, EDF Renewables NA. 16GW US.", y:2019 },
  { source:"p_hogan", target:"c_16", rel:"evaluates", note:"Esmeralda Seven bid evaluation", y:2025 },
  { source:"p_swindle", target:"x_energy_vault", rel:"employed_by", note:"VP. Grid-scale storage.", y:2020 },
  { source:"p_swindle", target:"c_2", rel:"project_lead", note:"Reid Gardner BESS project delivery lead", y:2022 },
  { source:"p_zhu", target:"x_longi", rel:"employed_by", note:"VP Americas. Solar module supply.", y:2019 },
  { source:"p_zhu", target:"c_1", rel:"supplies", note:"Gemini Solar module supply management", y:2021 },
  { source:"p_zhu", target:"c_12", rel:"supplies", note:"Libra Solar module supply agreement", y:2025 },
  { source:"p_widmar", target:"x_first_solar", rel:"leads", note:"CEO. US CdTe thin-film.", y:2016 },
  { source:"p_widmar", target:"c_11", rel:"supplies", note:"Boulder Solar III domestic content module supply", y:2025 },

  // State Agency Leaders
  { source:"p_ndrep_dir", target:"x_ndep", rel:"leads", note:"Administrator. NV Division of Environmental Protection.", y:2019 },
  { source:"p_ndrep_dir", target:"c_2", rel:"regulates", note:"Reid Gardner coal ash + remediation oversight", y:2021 },
  { source:"p_ndrep_dir", target:"c_7", rel:"permits", note:"Greenlink West air quality + water permits", y:2024 },
  { source:"p_ndow_dir", target:"x_ndow", rel:"leads", note:"Director. NV Dept of Wildlife.", y:2019 },
  { source:"p_ndow_dir", target:"c_16", rel:"consults_on", note:"Esmeralda Seven sage grouse habitat review", y:2025 },
  { source:"p_ndow_dir", target:"c_10", rel:"consults_on", note:"Rough Hat Clark wildlife assessment", y:2024 },
  { source:"p_state_eng", target:"x_nv_state_eng", rel:"leads", note:"NV State Engineer. Water rights.", y:2020 },
  { source:"p_state_eng", target:"c_1", rel:"permits", note:"Gemini Solar water appropriation", y:2020 },
  { source:"p_state_eng", target:"c_16", rel:"reviews", note:"Esmeralda Seven water availability determination", y:2025 },
  { source:"p_state_eng", target:"c_6", rel:"permits", note:"Sierra Solar construction water allocation", y:2024 },

  // ========================================================================
  // SECTION 17: NEW EXTERNAL → PROJECT / ORG EDGES (Batch 2)
  // ========================================================================

  // Additional EPC Contractors → Projects
  { source:"x_primoris", target:"c_11", rel:"epc_for", note:"Boulder Solar III EPC construction bid", y:2025 },
  { source:"x_primoris", target:"c_14", rel:"epc_for", note:"Purple Sage solar+storage EPC evaluation", y:2025 },
  { source:"x_mccarthy", target:"c_14", rel:"epc_for", note:"Purple Sage EPC evaluation", y:2025 },
  { source:"x_mccarthy", target:"c_10", rel:"epc_for", note:"Rough Hat Clark EPC bid", y:2025 },
  { source:"x_quanta", target:"c_7", rel:"subcontractor_for", note:"Greenlink West substation construction", y:2025 },
  { source:"x_quanta", target:"c_13", rel:"subcontractor_for", note:"Greenlink North substation bid", y:2025 },
  { source:"x_blattner", target:"c_6", rel:"epc_for", note:"Sierra Solar EPC bid. Quanta subsidiary.", y:2025 },
  { source:"x_blattner", target:"c_12", rel:"epc_for", note:"Libra Solar EPC evaluation", y:2025 },
  { source:"x_strata", target:"c_9", rel:"epc_for", note:"Dry Lake East EPC bid evaluation", y:2025 },

  // Environmental Consultants → Projects
  { source:"x_tetra_tech", target:"c_10", rel:"consultant_for", note:"Rough Hat Clark cultural resource survey", y:2023 },
  { source:"x_tetra_tech", target:"c_16", rel:"consultant_for", note:"Esmeralda Seven PEIS cultural resources", y:2025 },
  { source:"x_tetra_tech", target:"c_9", rel:"consultant_for", note:"Dry Lake East environmental compliance", y:2024 },
  { source:"x_icf", target:"c_16", rel:"consultant_for", note:"Esmeralda Seven BLM Programmatic EIS contractor", y:2025 },
  { source:"x_icf", target:"x_blm", rel:"contractor_for", note:"BLM NEPA support contractor. Programmatic EIS.", y:2020 },
  { source:"x_cardno", target:"c_12", rel:"consultant_for", note:"Libra Solar biological survey. Lyon County.", y:2023 },
  { source:"x_cardno", target:"c_14", rel:"consultant_for", note:"Purple Sage environmental baseline", y:2024 },

  // Law Firms → Projects & Agencies
  { source:"x_brownstein", target:"x_switch", rel:"advises", note:"Data center regulatory + incentive counsel", y:2018 },
  { source:"x_brownstein", target:"x_pucn", rel:"represents_before", note:"Data center tariff policy. CTT docket.", y:2024 },
  { source:"x_brownstein", target:"x_goed", rel:"advises", note:"Data center abatement policy counsel", y:2020 },
  { source:"x_parsons_behle", target:"c_16", rel:"advises", note:"Esmeralda Seven mining claim + solar ROW coexistence", y:2025 },
  { source:"x_parsons_behle", target:"x_blm", rel:"represents_before", note:"Mining + renewable land use counsel", y:2020 },
  { source:"x_latham", target:"c_1", rel:"advises", note:"Gemini Solar tax equity financing counsel", y:2021 },
  { source:"x_latham", target:"x_jpmorgan", rel:"advises", note:"Renewable tax equity transaction counsel", y:2020 },
  { source:"x_milbank", target:"c_7", rel:"advises", note:"Greenlink West project finance + capital markets legal", y:2024 },
  { source:"x_milbank", target:"x_goldman", rel:"advises", note:"Transmission project financing legal counsel", y:2024 },

  // Financial Institutions → Projects
  { source:"x_lazard", target:"x_nv_energy", rel:"advises", note:"Strategic M&A + LCOE advisory", y:2022 },
  { source:"x_lazard", target:"c_7", rel:"advises", note:"Greenlink West financial advisory", y:2024 },
  { source:"x_cohnreznick", target:"c_1", rel:"advises", note:"Gemini Solar ITC monetization advisory", y:2021 },
  { source:"x_cohnreznick", target:"c_9", rel:"advises", note:"Dry Lake East tax equity structuring advisory", y:2025 },
  { source:"x_keybanc", target:"c_12", rel:"finances", note:"Libra Solar project debt syndication", y:2025 },
  { source:"x_keybanc", target:"c_14", rel:"finances", note:"Purple Sage project finance evaluation", y:2025 },
  { source:"x_mufg", target:"c_7", rel:"finances", note:"Greenlink West construction lending syndicate member", y:2025 },
  { source:"x_mufg", target:"c_6", rel:"finances", note:"Sierra Solar project finance syndicate", y:2025 },
  { source:"x_natixis", target:"c_12", rel:"finances", note:"Libra Solar project finance. European bank.", y:2025 },
  { source:"x_natixis", target:"c_1", rel:"finances", note:"Gemini Solar refinancing participation", y:2023 },
  { source:"x_rabobank", target:"c_9", rel:"finances", note:"Dry Lake East construction finance evaluation", y:2025 },

  // Insurance → Projects
  { source:"x_swissre", target:"c_1", rel:"insures", note:"Gemini Solar reinsurance. Operational coverage.", y:2023 },
  { source:"x_swissre", target:"c_7", rel:"insures", note:"Greenlink West construction reinsurance layer", y:2025 },
  { source:"x_swissre", target:"c_6", rel:"insures", note:"Sierra Solar construction reinsurance", y:2025 },
  { source:"x_liberty", target:"c_12", rel:"insures", note:"Libra Solar construction all-risk bid", y:2025 },
  { source:"x_liberty", target:"c_9", rel:"insures", note:"Dry Lake East construction insurance bid", y:2025 },
  { source:"x_gcube", target:"c_1", rel:"insures", note:"Gemini Solar operational specialist coverage", y:2023 },
  { source:"x_gcube", target:"c_2", rel:"insures", note:"Reid Gardner BESS specialist storage insurance", y:2025 },

  // Equipment Manufacturers → Projects
  { source:"x_jinko", target:"c_14", rel:"supplies", note:"Purple Sage module supply bid. Tiger Neo N-type.", y:2025 },
  { source:"x_jinko", target:"c_10", rel:"supplies", note:"Rough Hat Clark module supply evaluation", y:2025 },
  { source:"x_trina", target:"c_9", rel:"supplies", note:"Dry Lake East module supply bid. Vertex S+.", y:2025 },
  { source:"x_trina", target:"c_14", rel:"supplies", note:"Purple Sage module supply evaluation", y:2025 },
  { source:"x_canadian_solar", target:"c_17", rel:"supplies", note:"Amargosa BESS SolBank platform evaluation", y:2025 },
  { source:"x_canadian_solar", target:"c_10", rel:"supplies", note:"Rough Hat Clark module + storage supply bid", y:2025 },
  { source:"x_nextracker", target:"c_1", rel:"supplies", note:"Gemini Solar tracking system. TrueCapture AI.", y:2021 },
  { source:"x_nextracker", target:"c_12", rel:"supplies", note:"Libra Solar tracker supply agreement", y:2025 },
  { source:"x_nextracker", target:"c_6", rel:"supplies", note:"Sierra Solar tracker evaluation", y:2024 },
  { source:"x_array", target:"c_9", rel:"supplies", note:"Dry Lake East DuraTrack tracker bid", y:2025 },
  { source:"x_array", target:"c_11", rel:"supplies", note:"Boulder Solar III tracker supply bid", y:2025 },
  { source:"x_sungrow", target:"c_10", rel:"supplies", note:"Rough Hat Clark inverter + BESS bid", y:2025 },
  { source:"x_sungrow", target:"c_14", rel:"supplies", note:"Purple Sage inverter supply evaluation", y:2025 },
  { source:"x_power_elec", target:"c_1", rel:"supplies", note:"Gemini Solar inverter supply. 690MW.", y:2021 },
  { source:"x_power_elec", target:"c_12", rel:"supplies", note:"Libra Solar inverter supply bid", y:2025 },
  { source:"x_hitachi", target:"c_7", rel:"supplies", note:"Greenlink West transformer + HVDC equipment bid", y:2025 },
  { source:"x_hitachi", target:"c_13", rel:"supplies", note:"Greenlink North transformer equipment evaluation", y:2026 },

  // ========================================================================
  // SECTION 18: FEDERAL & STATE AGENCY EDGES (Batch 3)
  // ========================================================================

  // Federal Agencies → Projects
  { source:"x_epa", target:"c_2", rel:"regulates", note:"Reid Gardner coal ash RCRA compliance. Air quality.", y:2021 },
  { source:"x_epa", target:"c_16", rel:"reviews", note:"Esmeralda Seven PEIS EPA comments. Air + water.", y:2025 },
  { source:"x_epa", target:"x_ndep", rel:"coordinates_with", note:"Federal-state environmental compliance coordination", y:2020 },
  { source:"x_fws", target:"c_1", rel:"consults_on", note:"Gemini Solar desert tortoise Section 7 biological opinion", y:2020 },
  { source:"x_fws", target:"c_10", rel:"consults_on", note:"Rough Hat Clark desert tortoise ESA consultation", y:2024 },
  { source:"x_fws", target:"c_16", rel:"consults_on", note:"Esmeralda Seven bi-state sage grouse + desert tortoise", y:2025 },
  { source:"x_fws", target:"c_12", rel:"consults_on", note:"Libra Solar biological assessment review", y:2024 },
  { source:"x_fws", target:"c_9", rel:"consults_on", note:"Dry Lake East desert tortoise consultation", y:2024 },
  { source:"x_doi", target:"x_blm", rel:"oversees", note:"BLM parent department. Solar Energy Zones policy.", y:2000 },
  { source:"x_doi", target:"c_16", rel:"oversees", note:"Esmeralda Seven PEIS. Secretary-level review.", y:2025 },
  { source:"x_army_corps", target:"c_7", rel:"permits", note:"Greenlink West Section 404 permit. Waters of the US.", y:2023 },
  { source:"x_army_corps", target:"c_12", rel:"permits", note:"Libra Solar Section 404 permit evaluation", y:2024 },
  { source:"x_army_corps", target:"c_13", rel:"permits", note:"Greenlink North Section 404 permit review", y:2024 },
  { source:"x_bia", target:"x_moapa", rel:"coordinates_with", note:"Moapa Band trust land energy leasing", y:2020 },
  { source:"x_bia", target:"c_2", rel:"coordinates_with", note:"Reid Gardner tribal boundary remediation coordination", y:2021 },

  // State Agencies → Projects
  { source:"x_ndep", target:"c_2", rel:"regulates", note:"Reid Gardner coal ash + water discharge permits", y:2021 },
  { source:"x_ndep", target:"c_7", rel:"permits", note:"Greenlink West air quality construction permit", y:2024 },
  { source:"x_ndep", target:"c_6", rel:"permits", note:"Sierra Solar dust control + water permits", y:2024 },
  { source:"x_ndep", target:"c_1", rel:"regulates", note:"Gemini Solar dust mitigation compliance", y:2021 },
  { source:"x_ndow", target:"c_16", rel:"consults_on", note:"Esmeralda Seven sage grouse state consultation", y:2025 },
  { source:"x_ndow", target:"c_10", rel:"consults_on", note:"Rough Hat Clark bat + raptor survey review", y:2024 },
  { source:"x_ndow", target:"c_12", rel:"consults_on", note:"Libra Solar wildlife assessment coordination", y:2024 },
  { source:"x_nv_state_eng", target:"c_1", rel:"permits", note:"Gemini Solar groundwater appropriation", y:2020 },
  { source:"x_nv_state_eng", target:"c_16", rel:"reviews", note:"Esmeralda Seven water availability determination", y:2025 },
  { source:"x_nv_state_eng", target:"c_6", rel:"permits", note:"Sierra Solar construction water allocation", y:2024 },
  { source:"x_nv_state_eng", target:"c_8", rel:"permits", note:"Corsac Station geothermal water rights", y:2023 },
  { source:"x_nv_lands", target:"c_7", rel:"permits", note:"Greenlink West state land ROW parcels", y:2023 },
  { source:"x_nv_lands", target:"c_13", rel:"permits", note:"Greenlink North state land easements", y:2024 },

  // Tribal Nations → Projects
  { source:"x_timbisha", target:"c_17", rel:"consults_on", note:"Amargosa Desert BESS tribal consultation. Death Valley region.", y:2025 },
  { source:"x_timbisha", target:"x_blm", rel:"consults_with", note:"BLM Section 106 + government-to-government consultation", y:2020 },
  { source:"x_walker_river", target:"c_12", rel:"consults_on", note:"Libra Solar Lyon County tribal consultation", y:2024 },
  { source:"x_walker_river", target:"x_blm", rel:"consults_with", note:"BLM Section 106 consultation. Walker River region.", y:2020 },
  { source:"x_fallon_paiute", target:"c_5", rel:"consults_on", note:"McGinness Hills geothermal Churchill County consultation", y:2012 },
  { source:"x_fallon_paiute", target:"x_blm", rel:"consults_with", note:"BLM government-to-government consultation. Fallon area.", y:2015 },
  { source:"x_duckwater", target:"c_16", rel:"consults_on", note:"Esmeralda Seven traditional use area consultation", y:2025 },

  // ========================================================================
  // SECTION 19: UNIVERSITIES, LABS, GRID OPERATORS (Batch 4)
  // ========================================================================

  // Universities → Research
  { source:"x_unlv", target:"c_1", rel:"researches", note:"Gemini Solar performance monitoring. Harry Reid Center.", y:2023 },
  { source:"x_unlv", target:"x_nv_energy", rel:"partners_with", note:"Grid modernization research. Smart grid lab.", y:2020 },
  { source:"x_unlv", target:"c_6", rel:"researches", note:"Sierra Solar grid integration analysis", y:2024 },
  { source:"x_unr", target:"x_fervo", rel:"research_partner", note:"EGS reservoir engineering. Geothermal workforce training.", y:2021 },
  { source:"x_unr", target:"c_8", rel:"researches", note:"Corsac Station fiber optic reservoir monitoring R&D", y:2023 },
  { source:"x_unr", target:"x_ormat", rel:"research_partner", note:"Ormat + UNR geothermal research partnership", y:2015 },
  { source:"x_unr", target:"c_5", rel:"researches", note:"McGinness Hills reservoir characterization study", y:2018 },
  { source:"x_dri", target:"c_16", rel:"researches", note:"Esmeralda Seven climate + solar resource assessment", y:2025 },
  { source:"x_dri", target:"x_ndep", rel:"partners_with", note:"Air quality monitoring. Environmental baseline data.", y:2015 },

  // National Labs → Projects & Companies
  { source:"x_nrel", target:"c_6", rel:"researches", note:"Sierra Solar grid integration study. Variable resource modeling.", y:2024 },
  { source:"x_nrel", target:"c_2", rel:"researches", note:"Reid Gardner BESS dispatch optimization modeling", y:2023 },
  { source:"x_nrel", target:"x_nv_energy", rel:"partners_with", note:"Grid reliability + renewable integration studies", y:2020 },
  { source:"x_nrel", target:"c_1", rel:"researches", note:"Gemini Solar performance analysis. 690MW case study.", y:2023 },
  { source:"x_sandia", target:"x_fervo", rel:"researches", note:"EGS reservoir + drilling technology R&D", y:2021 },
  { source:"x_sandia", target:"c_8", rel:"researches", note:"Corsac Station EGS reservoir characterization", y:2023 },
  { source:"x_sandia", target:"c_2", rel:"researches", note:"Reid Gardner BESS safety + performance testing protocols", y:2023 },
  { source:"x_inl", target:"x_fervo", rel:"researches", note:"FORGE EGS validation. Fervo drilling technology.", y:2021 },
  { source:"x_inl", target:"c_8", rel:"supports", note:"Corsac Station DOE demonstration co-research", y:2023 },

  // Grid Operators → Projects & Utilities
  { source:"x_spp", target:"x_nv_energy", rel:"evaluates", note:"NV Energy potential SPP membership for western market", y:2024 },
  { source:"x_spp", target:"c_13", rel:"benefits_from", note:"Greenlink North expands western market interconnection", y:2028 },
  { source:"x_wapa", target:"c_7", rel:"coordinates_with", note:"Hoover Dam transmission + Greenlink West interconnection", y:2024 },
  { source:"x_wapa", target:"x_nv_energy", rel:"coordinates_with", note:"Federal power delivery. Hoover Dam allocation.", y:2000 },

  // Industry Associations → Members & Projects
  { source:"x_seia", target:"x_nv_energy", rel:"advocates_before", note:"IRP solar procurement advocacy. ITC policy.", y:2020 },
  { source:"x_seia", target:"x_pucn", rel:"advocates_before", note:"Solar policy. Net metering. RPS compliance.", y:2020 },
  { source:"x_seia", target:"c_12", rel:"supports", note:"Libra Solar. Largest NV solar project support.", y:2024 },
  { source:"x_acp", target:"c_7", rel:"supports", note:"Greenlink West transmission permitting reform advocacy", y:2023 },
  { source:"x_acp", target:"x_blm", rel:"advocates_before", note:"BLM renewable energy permitting acceleration", y:2023 },
  { source:"x_acp", target:"x_ferc", rel:"advocates_before", note:"FERC transmission planning + interconnection reform", y:2024 },
  { source:"x_acore", target:"x_doe", rel:"advocates_before", note:"IRA implementation. DOE LPO expansion.", y:2023 },
  { source:"x_acore", target:"c_8", rel:"supports", note:"Enhanced geothermal policy support", y:2023 },
  { source:"x_esig", target:"x_nv_energy", rel:"advises", note:"Grid integration best practices. Solar+storage forecasting.", y:2022 },
  { source:"x_esig", target:"c_6", rel:"advises", note:"Sierra Solar variable resource integration study support", y:2024 },

  // Analysts → Market Coverage
  { source:"x_woodmac", target:"c_1", rel:"monitors", note:"Gemini Solar project tracking. US solar market.", y:2023 },
  { source:"x_woodmac", target:"c_12", rel:"monitors", note:"Libra Solar project tracking + analysis", y:2024 },
  { source:"x_woodmac", target:"x_nv_energy", rel:"monitors", note:"NV Energy IRP + procurement tracking", y:2020 },
  { source:"x_bnef", target:"c_8", rel:"monitors", note:"Fervo Corsac Station enhanced geothermal tracking", y:2023 },
  { source:"x_bnef", target:"c_7", rel:"monitors", note:"Greenlink West transmission project tracking", y:2024 },
  { source:"x_bnef", target:"x_longi", rel:"monitors", note:"LONGi Tier 1 module list. Module pricing.", y:2020 },
  { source:"x_spglobal", target:"x_nv_energy", rel:"monitors", note:"NV Energy credit rating. Power price forecasts.", y:2020 },
  { source:"x_spglobal", target:"c_7", rel:"monitors", note:"Greenlink West project credit assessment", y:2024 },

  // Other Utilities → Projects & Interconnection
  { source:"x_ladwp", target:"c_12", rel:"potential_buyer", note:"Libra Solar potential PPA offtake. LA clean energy procurement.", y:2025 },
  { source:"x_ladwp", target:"c_7", rel:"benefits_from", note:"Greenlink West enables NV-to-CA clean energy delivery", y:2027 },
  { source:"x_ladwp", target:"c_16", rel:"potential_buyer", note:"Esmeralda Seven potential CA offtake evaluation", y:2026 },
  { source:"x_pacificorp", target:"c_13", rel:"benefits_from", note:"Greenlink North interconnection. BHE sibling utility.", y:2028 },
  { source:"x_pacificorp", target:"x_berkshire", rel:"backed_by", note:"BHE subsidiary. Sibling to NV Energy.", y:2006 },
  { source:"x_aps", target:"c_9", rel:"potential_buyer", note:"Dry Lake East potential AZ border PPA evaluation", y:2025 },
  { source:"x_aps", target:"c_1", rel:"interconnects_with", note:"Gemini Solar AZ border interconnection point", y:2023 },

  // Data Center Additional → NV Energy
  { source:"x_meta", target:"x_nv_energy", rel:"evaluates", note:"NV data center site evaluation. Clean energy requirements.", y:2025 },
  { source:"x_meta", target:"x_goed", rel:"negotiates_with", note:"Data center tax abatement evaluation", y:2025 },
  { source:"x_aws", target:"x_nv_energy", rel:"evaluates", note:"NV data center expansion evaluation. Clean energy PPAs.", y:2025 },
  { source:"x_aws", target:"x_goed", rel:"negotiates_with", note:"Data center incentive discussions", y:2025 },
  { source:"x_digital_bridge", target:"x_switch", rel:"owns", note:"DigitalBridge infrastructure fund owns Switch", y:2022 },
  { source:"x_digital_bridge", target:"c_3", rel:"investor_in", note:"Switch Citadel Campus via DigitalBridge ownership", y:2022 },
  { source:"x_applied_digital", target:"x_nv_energy", rel:"evaluates", note:"NV high-density AI data center power evaluation", y:2025 },

  // ========================================================================
  // SECTION 20: ECOSYSTEM ORG EDGES (Batch 5)
  // ========================================================================

  // Las Vegas Global Economic Alliance
  { source:"lvgea", target:"x_goed", rel:"coordinates_with", note:"Southern NV economic development. Data center recruitment.", y:2020 },
  { source:"lvgea", target:"x_switch", rel:"recruited", note:"Switch expansion support + workforce development", y:2018 },
  { source:"lvgea", target:"x_vantage", rel:"recruited", note:"Vantage $3B data center project recruitment", y:2025 },

  // EDAWN
  { source:"edawn", target:"x_goed", rel:"coordinates_with", note:"Northern NV economic development. TRIC promotion.", y:2018 },
  { source:"edawn", target:"x_google", rel:"recruited", note:"Google TRIC data center expansion support", y:2018 },
  { source:"edawn", target:"tric_authority", rel:"coordinates_with", note:"TRIC industrial development coordination", y:2015 },

  // NNDA
  { source:"nnda", target:"x_ormat", rel:"supports", note:"Ormat Reno HQ. Geothermal industry support.", y:2015 },
  { source:"nnda", target:"x_fervo", rel:"supports", note:"Fervo Energy NV operations business support", y:2022 },

  // Nevada Builders Alliance
  { source:"nba", target:"x_ibew396", rel:"coordinates_with", note:"Construction workforce coordination. Apprenticeship.", y:2018 },
  { source:"nba", target:"x_oe12", rel:"coordinates_with", note:"Heavy equipment operator workforce pipeline", y:2018 },
  { source:"nba", target:"c_7", rel:"supports", note:"Greenlink West construction workforce development", y:2024 },

  // Clean Energy Nevada
  { source:"cenv", target:"x_pucn", rel:"advocates_before", note:"Clean energy policy. RPS advocacy. Consumer protection.", y:2019 },
  { source:"cenv", target:"nvsea", rel:"partners_with", note:"Solar industry policy coordination", y:2019 },
  { source:"cenv", target:"c_12", rel:"supports", note:"Libra Solar clean energy advocacy", y:2024 },

  // Western Interstate Energy Board
  { source:"wieb", target:"x_wecc", rel:"coordinates_with", note:"Western reliability + transmission planning coordination", y:2010 },
  { source:"wieb", target:"c_7", rel:"supports", note:"Greenlink West interstate transmission coordination", y:2023 },
  { source:"wieb", target:"x_caiso", rel:"coordinates_with", note:"Western market development coordination", y:2020 },

  // NV State Energy Office
  { source:"nv_energy_office", target:"goe", rel:"coordinates_with", note:"State energy policy implementation", y:2020 },
  { source:"nv_energy_office", target:"x_doe", rel:"coordinates_with", note:"IRA fund distribution. Federal program administration.", y:2023 },
  { source:"nv_energy_office", target:"x_nv_energy", rel:"coordinates_with", note:"Utility efficiency programs. Building codes.", y:2020 },

  // NV Legislature Energy Committee
  { source:"nv_leg", target:"x_pucn", rel:"oversees", note:"PUCN oversight. Utility regulation legislation.", y:2020 },
  { source:"nv_leg", target:"x_nv_energy", rel:"legislates", note:"Clean energy mandates. SB 448. Data center policy.", y:2023 },
  { source:"nv_leg", target:"goe", rel:"oversees", note:"Governor's Office of Energy legislative oversight", y:2020 },

  // Southern Climate Committee
  { source:"scnr", target:"x_clark_county", rel:"advises", note:"Climate action + renewable energy zoning", y:2022 },
  { source:"scnr", target:"c_9", rel:"supports", note:"Dry Lake East clean energy project support", y:2024 },

  // TRIC Authority
  { source:"tric_authority", target:"x_switch", rel:"hosts", note:"Switch Citadel Campus at TRIC", y:2000 },
  { source:"tric_authority", target:"x_google", rel:"hosts", note:"Google data center at TRIC", y:2018 },
  { source:"tric_authority", target:"x_microsoft", rel:"hosts", note:"Microsoft TRIC-adjacent acquisition", y:2024 },
  { source:"tric_authority", target:"x_tesla_energy", rel:"hosts", note:"Tesla Gigafactory at TRIC. Energy storage manufacturing.", y:2016 },

  // ========================================================================
  // SECTION 21: CROSS-CUTTING SUPPLY CHAIN & COMPETITIVE EDGES (Batch 6)
  // ========================================================================

  // Competitive Relationships (developers bidding on same projects)
  { source:"x_nextera", target:"x_arevia", rel:"competes_with", note:"Competing for NV utility-scale solar development", y:2025 },
  { source:"x_nextera", target:"x_edf", rel:"competes_with", note:"Competing for Esmeralda Seven PEIS bids", y:2025 },
  { source:"x_aes", target:"x_nextera", rel:"competes_with", note:"Competing for NV BESS + storage development", y:2025 },
  { source:"x_primoris", target:"x_rosendin", rel:"competes_with", note:"EPC competition for NV solar projects", y:2025 },
  { source:"x_primoris", target:"x_mortenson", rel:"competes_with", note:"EPC bid competition", y:2025 },
  { source:"x_blattner", target:"x_mccarthy", rel:"competes_with", note:"Utility-scale solar EPC competition", y:2025 },

  // Equipment Supply Chain Connections
  { source:"x_jinko", target:"x_longi", rel:"competes_with", note:"Solar module supply competition for NV projects", y:2025 },
  { source:"x_trina", target:"x_first_solar", rel:"competes_with", note:"Module supply competition. Domestic vs imported.", y:2025 },
  { source:"x_nextracker", target:"x_array", rel:"competes_with", note:"Solar tracker supply competition for NV projects", y:2025 },
  { source:"x_fluence", target:"x_tesla_energy", rel:"competes_with", note:"BESS technology competition for NV projects", y:2025 },
  { source:"x_sungrow", target:"x_fluence", rel:"competes_with", note:"Inverter + BESS platform competition", y:2025 },
  { source:"x_catl", target:"x_byd", rel:"competes_with", note:"BESS cell supply competition. LFP technology.", y:2025 },
  { source:"x_siemens", target:"x_hitachi", rel:"competes_with", note:"HVDC + transmission equipment competition", y:2025 },

  // Financial Competition
  { source:"x_jpmorgan", target:"x_bofa", rel:"competes_with", note:"Renewable tax equity + project finance competition", y:2025 },
  { source:"x_mufg", target:"x_natixis", rel:"competes_with", note:"Renewable project finance lending competition", y:2025 },
  { source:"x_marsh", target:"x_aon", rel:"competes_with", note:"Renewable energy insurance brokerage competition", y:2025 },
  { source:"x_swissre", target:"x_liberty", rel:"competes_with", note:"Renewable energy insurance underwriting competition", y:2025 },

  // Law Firm Competition
  { source:"x_holland", target:"x_stoel", rel:"competes_with", note:"Western energy law practice competition", y:2025 },
  { source:"x_snell", target:"x_fennemore", rel:"competes_with", note:"NV regulatory practice competition", y:2025 },
  { source:"x_brownstein", target:"x_fennemore", rel:"competes_with", note:"NV government affairs + energy practice", y:2025 },

  // Cross-Sector Dependencies
  { source:"x_tesla_energy", target:"tric_authority", rel:"located_at", note:"Gigafactory at TRIC. BESS manufacturing + NV supply.", y:2016 },
  { source:"x_nrel", target:"x_doe", rel:"funded_by", note:"DOE national lab. Clean energy R&D.", y:2000 },
  { source:"x_sandia", target:"x_doe", rel:"funded_by", note:"DOE national lab. Geothermal + storage research.", y:2000 },
  { source:"x_inl", target:"x_doe", rel:"funded_by", note:"DOE national lab. FORGE EGS program.", y:2000 },
  { source:"x_unlv", target:"nshe", rel:"member_of", note:"NSHE institution. Las Vegas campus.", y:2000 },
  { source:"x_unr", target:"nshe", rel:"member_of", note:"NSHE institution. Reno campus.", y:2000 },
  { source:"x_dri", target:"nshe", rel:"member_of", note:"NSHE institution. Climate + environmental research.", y:2000 },

  // ========================================================================
  // SECTION 22: BATCH 2 PEOPLE → ORGANIZATIONS
  // ========================================================================

  { source:"p_hernandez", target:"x_jinko", rel:"employed_by", note:"VP Americas. Module supply.", y:2019 },
  { source:"p_hernandez", target:"c_14", rel:"supplies", note:"Purple Sage JinkoSolar module supply coordination", y:2025 },
  { source:"p_garcia_trina", target:"x_trina", rel:"leads", note:"President Americas. Vertex S+ series.", y:2020 },
  { source:"p_garcia_trina", target:"c_9", rel:"supplies", note:"Dry Lake East Trina module supply bid", y:2025 },
  { source:"p_wells", target:"x_array", rel:"leads", note:"CEO. NASDAQ: ARRY. DuraTrack.", y:2020 },
  { source:"p_wells", target:"c_9", rel:"supplies", note:"Dry Lake East tracker supply bid management", y:2025 },
  { source:"p_perdew", target:"x_nextracker", rel:"leads", note:"CEO. NASDAQ: NXT. TrueCapture AI.", y:2019 },
  { source:"p_perdew", target:"c_1", rel:"supplies", note:"Gemini Solar tracker supply oversight", y:2021 },
  { source:"p_flannery_acp", target:"x_acp", rel:"leads", note:"CEO. Wind, solar, storage, transmission.", y:2023 },
  { source:"p_flannery_acp", target:"x_ferc", rel:"advocates_before", note:"Transmission planning + interconnection reform", y:2024 },
  { source:"p_whitaker", target:"x_seia", rel:"leads", note:"President & CEO. Solar policy.", y:2017 },
  { source:"p_whitaker", target:"x_pucn", rel:"advocates_before", note:"NV solar policy + RPS compliance advocacy", y:2020 },
  { source:"p_gallagher", target:"x_strata", rel:"leads", note:"CEO. 10GW+ EPC.", y:2018 },
  { source:"p_gallagher", target:"c_9", rel:"contractor_for", note:"Dry Lake East EPC bid team", y:2025 },
  { source:"p_wetstone", target:"x_acore", rel:"leads", note:"President & CEO. Renewable finance advocacy.", y:2016 },
  { source:"p_wetstone", target:"x_doe", rel:"advocates_before", note:"DOE LPO expansion advocacy", y:2023 },
  { source:"p_palmer", target:"x_wapa", rel:"employed_by", note:"Regional Manager. Federal power.", y:2018 },
  { source:"p_palmer", target:"c_7", rel:"coordinates_with", note:"Hoover Dam + Greenlink West interconnection", y:2024 },
  { source:"p_tong", target:"x_ladwp", rel:"employed_by", note:"VP Origination. Clean energy procurement.", y:2019 },
  { source:"p_tong", target:"c_12", rel:"evaluates", note:"Libra Solar potential LADWP PPA offtake", y:2025 },
  { source:"p_quinn", target:"x_applied_digital", rel:"employed_by", note:"VP Development. AI data center.", y:2022 },
  { source:"p_quinn", target:"x_nv_energy", rel:"evaluates", note:"NV power capacity for AI/HPC facility", y:2025 },
  { source:"p_jacobsen", target:"x_meta", rel:"employed_by", note:"VP Infrastructure. Data center siting.", y:2020 },
  { source:"p_jacobsen", target:"x_goed", rel:"negotiates_with", note:"Meta NV data center abatement evaluation", y:2025 },
  { source:"p_kava", target:"x_aws", rel:"employed_by", note:"VP Data Centers. Infrastructure.", y:2019 },
  { source:"p_kava", target:"x_nv_energy", rel:"evaluates", note:"AWS NV data center power evaluation", y:2025 },
  { source:"p_morales", target:"x_pacificorp", rel:"employed_by", note:"VP Regulatory. BHE subsidiary.", y:2018 },
  { source:"p_morales", target:"c_13", rel:"coordinates_with", note:"Greenlink North PacifiCorp interconnection", y:2025 },
  { source:"p_sparks", target:"x_quanta", rel:"employed_by", note:"VP Engineering. Transmission + substation.", y:2017 },
  { source:"p_sparks", target:"c_7", rel:"contractor_for", note:"Greenlink West substation construction bid", y:2025 },
  { source:"p_lynch", target:"x_blattner", rel:"employed_by", note:"VP Permitting. Renewable EPC.", y:2019 },
  { source:"p_lynch", target:"c_6", rel:"contractor_for", note:"Sierra Solar EPC permitting coordination", y:2025 },
  { source:"p_russo", target:"x_latham", rel:"partner_at", note:"Renewable project finance.", y:2012 },
  { source:"p_russo", target:"c_1", rel:"advises", note:"Gemini Solar tax equity transaction counsel", y:2021 },
  { source:"p_chen_milbank", target:"x_milbank", rel:"partner_at", note:"Transmission project finance.", y:2015 },
  { source:"p_chen_milbank", target:"c_7", rel:"advises", note:"Greenlink West capital markets legal counsel", y:2024 },
  { source:"p_blackwell", target:"x_parsons_behle", rel:"partner_at", note:"NV natural resources.", y:2014 },
  { source:"p_blackwell", target:"c_16", rel:"advises", note:"Esmeralda Seven mining + solar coexistence counsel", y:2025 },
  { source:"p_murata", target:"x_mufg", rel:"employed_by", note:"MD Renewable Energy. Project finance.", y:2017 },
  { source:"p_murata", target:"c_7", rel:"finances", note:"Greenlink West construction lending coordination", y:2025 },

  // ========================================================================
  // SECTION 23: BATCH 2 EXTERNAL EDGES
  // ========================================================================

  // Labor
  { source:"x_ironworkers433", target:"c_7", rel:"labor_for", note:"Greenlink West transmission tower erection + steel", y:2025 },
  { source:"x_ironworkers433", target:"c_1", rel:"labor_for", note:"Gemini Solar tracker steel installation", y:2021 },
  { source:"x_ironworkers433", target:"c_6", rel:"labor_for", note:"Sierra Solar tracker installation (planned)", y:2025 },
  { source:"x_laborers872", target:"c_1", rel:"labor_for", note:"Gemini Solar site grading + general labor", y:2021 },
  { source:"x_laborers872", target:"c_7", rel:"labor_for", note:"Greenlink West ROW clearing + general labor", y:2025 },
  { source:"x_laborers872", target:"c_9", rel:"labor_for", note:"Dry Lake East site preparation (planned)", y:2026 },
  { source:"x_laborers872", target:"c_12", rel:"labor_for", note:"Libra Solar site grading (planned)", y:2026 },

  // Panasonic
  { source:"x_panasonic", target:"x_tesla_energy", rel:"partners_with", note:"TRIC Gigafactory cell manufacturing partnership", y:2016 },
  { source:"x_panasonic", target:"tric_authority", rel:"located_at", note:"Panasonic battery cell factory at TRIC", y:2016 },

  // Additional Developers → Projects & Competition
  { source:"x_pattern", target:"c_16", rel:"evaluates", note:"Esmeralda Seven PEIS bid evaluation. Wind + solar.", y:2025 },
  { source:"x_pattern", target:"x_nextera", rel:"competes_with", note:"Western US renewable development competition", y:2025 },
  { source:"x_clearway", target:"c_16", rel:"evaluates", note:"Esmeralda Seven solar + storage evaluation", y:2025 },
  { source:"x_clearway", target:"c_17", rel:"evaluates", note:"Amargosa Desert SEZ competitive lease bid", y:2025 },
  { source:"x_invenergy", target:"c_16", rel:"evaluates", note:"Esmeralda Seven PEIS bid. Largest private dev.", y:2025 },
  { source:"x_invenergy", target:"x_arevia", rel:"competes_with", note:"Utility-scale NV solar development competition", y:2025 },
  { source:"x_engie", target:"c_16", rel:"evaluates", note:"Esmeralda Seven French utility evaluation", y:2025 },
  { source:"x_brookfield", target:"c_1", rel:"evaluates", note:"Gemini Solar potential acquisition evaluation", y:2024 },
  { source:"x_brookfield", target:"c_12", rel:"evaluates", note:"Libra Solar co-investment evaluation", y:2025 },
  { source:"x_hannon", target:"c_9", rel:"finances", note:"Dry Lake East climate REIT investment evaluation", y:2025 },
  { source:"x_hannon", target:"c_11", rel:"finances", note:"Boulder Solar III sustainable infrastructure investment", y:2025 },
  { source:"x_summit_ridge", target:"x_nv_energy", rel:"interconnects_with", note:"Community solar + distributed generation in NV", y:2024 },

  // Engineering & Consulting
  { source:"x_black_veatch", target:"c_7", rel:"consultant_for", note:"Greenlink West transmission planning study", y:2022 },
  { source:"x_black_veatch", target:"x_nv_energy", rel:"consultant_for", note:"Grid modernization + transmission planning studies", y:2020 },
  { source:"x_black_veatch", target:"c_13", rel:"consultant_for", note:"Greenlink North transmission routing analysis", y:2023 },
  { source:"x_terracon", target:"c_1", rel:"consultant_for", note:"Gemini Solar geotechnical foundation engineering", y:2020 },
  { source:"x_terracon", target:"c_12", rel:"consultant_for", note:"Libra Solar geotechnical investigation", y:2024 },

  // Additional Financial
  { source:"x_barclays", target:"c_7", rel:"finances", note:"Greenlink West debt syndication participation", y:2025 },
  { source:"x_barclays", target:"c_6", rel:"finances", note:"Sierra Solar project finance evaluation", y:2025 },
  { source:"x_citibank", target:"c_1", rel:"tax_equity", note:"Gemini Solar ITC tax equity participation", y:2021 },
  { source:"x_citibank", target:"c_12", rel:"tax_equity", note:"Libra Solar ITC tax equity evaluation", y:2025 },
  { source:"x_citibank", target:"c_9", rel:"tax_equity", note:"Dry Lake East tax equity bid", y:2025 },

  // Sempra cross-connections
  { source:"x_sempra", target:"c_7", rel:"benefits_from", note:"Greenlink West NV-CA interconnection benefits SoCal", y:2027 },
  { source:"x_sempra", target:"x_caiso", rel:"coordinates_with", note:"SDG&E CAISO participant. Western grid coordination.", y:2000 },
];
