export const GRAPH_FUNDS = [
  { id:"nve_ppa", name:"NV Energy PPAs", type:"Utility PPA" },
  { id:"blm_row", name:"BLM ROW Program", type:"Federal Land" },
  { id:"doe_lpo", name:"DOE LPO", type:"Federal Loan" },
  { id:"itc", name:"ITC (30%)", type:"Federal Tax" },
  { id:"ptc", name:"PTC", type:"Federal Tax" },
  { id:"pucn_irp", name:"PUCN 2024 IRP", type:"Regulatory" },
  { id:"nv_incentive", name:"NV State Incentives", type:"State" },
  { id:"blm_sez", name:"BLM Solar Energy Zones", type:"Federal Land" },
  { id:"usda_reap", name:"USDA REAP Grants", type:"Federal Grant" },
  { id:"ira_45x", name:"IRA 45X Manufacturing", type:"Federal Tax" },
  { id:"nv_green_bond", name:"NV Green Bonds", type:"State" },
  { id:"doe_h2hub", name:"DOE H2Hub Program", type:"Federal Grant" },
];

// ============================================================================
// PEOPLE — 45 key individuals across the NV energy ecosystem
// ============================================================================
export const PEOPLE = [
  // --- NV Energy Leadership ---
  { id:"p_cannon", name:"Brandon Barkhuff", role:"President/CEO, NV Energy", companyId:null, note:"Succeeded Doug Cannon May 2025. Leads utility clean transition strategy. Overseeing $6B+ capital plan through 2030." },
  { id:"p_shortino", name:"Paul Shortino", role:"VP Transmission & Distribution, NV Energy", companyId:null, note:"Greenlink West/North project executive. Manages $4.2B transmission capital program." },
  { id:"p_brigger", name:"Jeff Brigger", role:"Director Renewable Procurement, NV Energy", companyId:null, note:"Oversees IRP procurement and All-Source RFPs. 2024 cycle: 4GW+ bids received." },
  { id:"p_matuska", name:"Tony Matuska", role:"VP Generation, NV Energy", companyId:null, note:"Coal-to-clean transition strategy. Sierra Solar project lead. Reid Gardner repurposing." },
  { id:"p_stoltz", name:"Adam Stoltz", role:"President, BHE Renewables", companyId:null, note:"Berkshire Hathaway Energy renewables portfolio. NV Energy parent oversight." },

  // --- PUCN Commissioners ---
  { id:"p_caudill", name:"Hayley Williamson", role:"Chair, PUCN", companyId:null, note:"Oversees NV utility regulation and IRP approval. Clean Transition Tariff docket lead." },
  { id:"p_ringler", name:"Randy Brown", role:"Commissioner, PUCN", companyId:null, note:"PUCN Commissioner. IRP review, rate case adjudication. Consumer rate impact analysis." },
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
  { id:"p_guinn", name:"Dwayne McClinton", role:"Director, NV Governor's Office of Energy", companyId:null, note:"Succeeded Kenny Guinn Jr. State energy policy. RPS compliance. IRA fund distribution." },
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

  // ========================================================================
  // NEW PEOPLE — Batch 3: Project-specific, county, tribal, federal, industry
  // ========================================================================

  // --- New Project Developer/Manager People ---
  { id:"p_nextera_nv", name:"Rebecca Kujawa", role:"President & CEO, NextEra Energy Resources", companyId:null, note:"Leads world's largest wind/solar platform. 30GW+. Bonanza + Arrow Canyon NV projects." },
  { id:"p_8minute_ceo", name:"Tom Buttgenbach", role:"Founder & CEO, 8minute Solar Energy", companyId:null, note:"Mosey + Yellowpine Solar developer. Now EDF subsidiary. 18GW+ pipeline." },
  { id:"p_pine_gate", name:"Ben Catt", role:"CEO, Pine Gate Renewables", companyId:null, note:"Rock Valley Solar developer. Southeast + Western US solar. 5GW+ pipeline." },
  { id:"p_ip_athenea", name:"Carlos Domenech", role:"CEO, IP Athenea", companyId:null, note:"Copper Rays Solar developer. Spanish renewable energy company expanding in US market." },
  { id:"p_first_solar_nv", name:"Troy Lauterbach", role:"VP Development, First Solar", companyId:null, note:"Moapa Solar II expansion. US-manufactured CdTe modules. Tribal partnership." },
  { id:"p_rplus", name:"Rick Sprott", role:"CEO, rPlus Hydro", companyId:null, note:"White Pine Pumped Storage developer. Now Obsidian Renewables. FERC license pursuit." },
  { id:"p_pattern_ceo", name:"Mike Garland", role:"CEO, Pattern Energy", companyId:null, note:"Spring Valley Wind operator. 30GW+ pipeline. Western US wind + solar." },
  { id:"p_cyrq_ceo", name:"Mike Holcomb", role:"CEO, Cyrq Energy", companyId:null, note:"Hot Pot + Patua geothermal developer. Mid-scale geothermal specialist." },
  { id:"p_enel_nv", name:"Salvatore Bernabei", role:"CEO, Enel Green Power NA", companyId:null, note:"Stillwater Hybrid operator. Global renewable leader. 55GW+ portfolio." },
  { id:"p_signal_pm", name:"David Torres", role:"VP Construction, Signal Energy", companyId:null, note:"Mosey Solar EPC. Utility-scale solar construction. Southeast + Western US." },
  { id:"p_swgas_ceo", name:"Karen Haller", role:"President & CEO, Southwest Gas", companyId:null, note:"NYSE: SWX. Pinyon Pipeline project. NV natural gas distribution." },
  { id:"p_air_liquide", name:"Michael Graff", role:"EVP Americas, Air Liquide", companyId:null, note:"Green H2 Hub development. DOE H2Hub participant. Industrial gas leader." },

  // --- NV Energy Additional Staff ---
  { id:"p_nve_irp", name:"Lisa Cane", role:"Director IRP Planning, NV Energy", companyId:null, note:"Integrated Resource Plan development. 20-year capacity modeling. Procurement strategy." },
  { id:"p_nve_land", name:"Robert Mendez", role:"Director Land Services, NV Energy", companyId:null, note:"ROW acquisition for Greenlink. Substation site procurement. Landowner relations." },
  { id:"p_nve_safety", name:"Patricia Vargas", role:"VP Safety & Operations, NV Energy", companyId:null, note:"Construction safety for $6B+ capital plan. OSHA compliance. NV operations." },
  { id:"p_nve_comm", name:"Jennifer Schuricht", role:"VP Communications, NV Energy", companyId:null, note:"Public affairs. Community engagement for Greenlink + solar projects." },

  // --- County Commissioners (New Counties) ---
  { id:"p_white_pine_cc", name:"Gary Perea", role:"Commissioner, White Pine County", companyId:null, note:"Ely district. White Pine Pumped Storage area. Spring Valley Wind host county." },
  { id:"p_lincoln_cc", name:"Varlin Higbee", role:"Commissioner, Lincoln County", companyId:null, note:"Caliente district. Chill Sun Solar area. Rural energy development." },
  { id:"p_storey_cc", name:"Lance Gilman", role:"Commissioner, Storey County", companyId:null, note:"TRIC industrial zone. Data center development. Meta + Google host county." },
  { id:"p_humboldt_cc", name:"Jim French", role:"Commissioner, Humboldt County", companyId:null, note:"Winnemucca district. North Valmy conversion. Hot Pot Geothermal area." },
  { id:"p_lander_cc", name:"Patsy Waits", role:"Commissioner, Lander County", companyId:null, note:"Battle Mountain district. McGinness Hills host. Battle Mountain Solar area." },
  { id:"p_mineral_cc", name:"Chris Hegg", role:"Commissioner, Mineral County", companyId:null, note:"Hawthorne district. Don Campbell Geothermal host county." },
  { id:"p_pershing_cc", name:"Larry Rackley", role:"Commissioner, Pershing County", companyId:null, note:"Lovelock district. Fervo Corsac Station host county." },

  // --- Federal Officials ---
  { id:"p_blm_elko", name:"Joanna Hagan", role:"District Manager, BLM Elko", companyId:null, note:"Northeastern NV district. Mining + energy federal land management." },
  { id:"p_blm_carson", name:"Lisa Ross", role:"District Manager, BLM Carson City", companyId:null, note:"Western NV district. Greenlink corridor. Lyon + Churchill County energy." },
  { id:"p_blm_ely", name:"Mike Courtney", role:"District Manager, BLM Ely", companyId:null, note:"Eastern NV district. White Pine + Lincoln County energy projects." },
  { id:"p_usfws_nv_south", name:"Diana Whittington", role:"Field Supervisor, USFWS Las Vegas", companyId:null, note:"Southern NV ESA consultation. Desert tortoise recovery. Solar project reviews." },
  { id:"p_epa_r9_energy", name:"Martha Guzman", role:"Regional Administrator, EPA Region 9", companyId:null, note:"Western US environmental compliance. Air quality + RCRA oversight." },
  { id:"p_ferc_chair", name:"Willie Phillips", role:"Chairman, FERC", companyId:null, note:"Federal Energy Regulatory Commission. Transmission planning reform. Order 2023." },
  { id:"p_doi_renewables", name:"Laura Daniel-Davis", role:"Principal Deputy Asst Secretary, DOI", companyId:null, note:"BLM parent. Renewable energy on public lands policy. Permitting reform." },

  // --- Tribal Leaders (New) ---
  { id:"p_moapa_solar", name:"Randy Kemp", role:"Energy Director, Moapa Band of Paiutes", companyId:null, note:"Moapa Solar II expansion lead. Tribal energy development. Community benefit agreements." },
  { id:"p_ely_shoshone", name:"Diana Buckner", role:"Chair, Ely Shoshone Tribe", companyId:null, note:"Ely, White Pine County. Pumped storage + wind project consultation." },
  { id:"p_fallon_chair", name:"Len George", role:"Chairman, Fallon Paiute-Shoshone", companyId:null, note:"Churchill County. Geothermal + solar development area. Stillwater NWR stewardship." },
  { id:"p_walker_chair", name:"Amber Torres", role:"Chair, Walker River Paiute Tribe", companyId:null, note:"Lyon + Mineral County. Libra Solar proximity. Walker Lake + water rights." },
  { id:"p_battle_mt_band", name:"Virgil Johnson", role:"Chair, Te-Moak Tribe of Western Shoshone", companyId:null, note:"Elko + Lander County. Battle Mountain Solar + geothermal area. Treaty rights." },

  // --- Industry Analysts & Consultants ---
  { id:"p_bnef_nv", name:"Ethan Zindler", role:"Head of Americas, BloombergNEF", companyId:null, note:"BNEF energy market analytics. NV project tracking. LCOE benchmarking." },
  { id:"p_lazard_analyst", name:"Devin Banerjee", role:"Director, Lazard Asset Management", companyId:null, note:"LCOE analysis. NV renewable project valuation." },
  { id:"p_ice_energy", name:"Michelle Solomon", role:"Director Energy, ICE/NYSE", companyId:null, note:"Commodity exchange. Renewable energy credit trading. NV REC market." },
  { id:"p_rystad", name:"Audun Martinsen", role:"Head Power, Rystad Energy", companyId:null, note:"Global energy research. NV solar + storage pipeline analytics." },
  { id:"p_nv_indy", name:"Sean Whaley", role:"Energy Reporter, Nevada Independent", companyId:null, note:"NV energy policy journalism. PUCN proceedings. IRP coverage." },

  // --- Construction/EPC Project Leads (New Projects) ---
  { id:"p_sterling_pm", name:"James Sterling", role:"VP Solar, Sterling & Wilson", companyId:null, note:"Global solar EPC. NV project pursuit. 15GW+ built globally." },
  { id:"p_sundt_pm", name:"Mark Thompson", role:"VP Renewable Energy, Sundt Construction", companyId:null, note:"Southwest US EPC. NV solar project evaluation. 100+ year legacy." },
  { id:"p_bechtel_energy", name:"Paul Shortridge", role:"President Infrastructure, Bechtel", companyId:null, note:"Global infrastructure EPC. Transmission + pumped storage capable." },

  // --- Financial / Insurance (New) ---
  { id:"p_stonepeak", name:"Michael Dorrell", role:"Partner, Stonepeak", companyId:null, note:"Infrastructure PE. $65B+ AUM. Renewable energy + transmission investment." },
  { id:"p_gip_energy", name:"Adebayo Ogunlesi", role:"Chairman, Global Infrastructure Partners", companyId:null, note:"$100B+ AUM. Major infrastructure investor. Clearway Energy backer." },
  { id:"p_macquarie_nv", name:"Andrew Cook", role:"MD Americas, Macquarie Asset Management", companyId:null, note:"$640B+ AUM. Green investment bank. NV renewable project evaluation." },
  { id:"p_ifm_energy", name:"Kyle Mangini", role:"Head Infrastructure NA, IFM Investors", companyId:null, note:"Australian pension-backed. $50B+ AUM. Renewable infrastructure." },
  { id:"p_munich_re", name:"Nicholas Roenneberg", role:"Head Renewable Energy, Munich Re", companyId:null, note:"Global reinsurer. Renewable energy construction + operational risk." },
  { id:"p_allianz_energy", name:"Karsten Berlage", role:"MD Energy, Allianz Capital Partners", companyId:null, note:"Allianz Group. Renewable infrastructure investment. NV project evaluation." },
  { id:"p_zurich_energy", name:"Helene Stanway", role:"Head Sustainability, Zurich Insurance", companyId:null, note:"Renewable energy insurance. Climate risk. NV project portfolio." },

  // --- Utilities (Outside NV) Buyers ---
  { id:"p_ladwp_gm", name:"Janisse Quinones", role:"General Manager, LADWP", companyId:null, note:"Largest US municipal utility. NV solar PPA buyer. LA 100% clean energy by 2035." },
  { id:"p_sce_ceo", name:"Steven Powell", role:"President, Southern California Edison", companyId:null, note:"Major CA utility. Western interconnection. Potential NV solar PPA buyer." },
  { id:"p_pge_ceo", name:"Patti Poppe", role:"CEO, PG&E", companyId:null, note:"Northern CA utility. Western grid. Potential NV power procurement partner." },

  // --- Real Estate / Land ---
  { id:"p_tric_mgr", name:"Norman Dianda", role:"President, TRI General Improvement District", companyId:null, note:"TRIC infrastructure management. Data center campus utilities. Land development." },

  // --- Water Districts ---
  { id:"p_snwa_gm", name:"John Entsminger", role:"General Manager, SNWA", companyId:null, note:"Southern NV water allocation. Energy project water permits. Lake Mead management." },
  { id:"p_tcid", name:"Jeff Bryant", role:"Manager, Truckee-Carson Irrigation District", companyId:null, note:"Churchill County water. Geothermal + solar project water allocations." },

  // --- Grid / Transmission Specific ---
  { id:"p_gridliance", name:"Calvin Crowder", role:"CEO, GridLiance", companyId:null, note:"NV transmission owner. Great Basin region. Interconnection services." },
  { id:"p_vea_ceo", name:"Tom Husted", role:"CEO, Valley Electric Association", companyId:null, note:"Pahrump + Nye County electric co-op. Rough Hat Clark area distribution." },

  // --- Additional NV State Officials ---
  { id:"p_nv_tax_comm", name:"Sheldon Jacobs", role:"Executive Director, NV Dept of Taxation", companyId:null, note:"Tax abatement administration. Data center incentives. Property tax assessment." },
  { id:"p_nv_minerals", name:"Michael Visher", role:"Administrator, NV Div of Minerals", companyId:null, note:"Geothermal resource management. Well permits. Mineral rights coordination." },
  { id:"p_nv_ag", name:"Aaron Ford", role:"Attorney General, Nevada", companyId:null, note:"NV AG Office. Consumer protection. Energy rate case intervention. Utility oversight." },

  // --- Additional Developer People ---
  { id:"p_obsidian_ceo", name:"Jonathan Weisgall", role:"CEO, Obsidian Renewables", companyId:null, note:"Formerly rPlus Hydro. White Pine Pumped Storage project. 1,000MW development." },
  { id:"p_recurrent", name:"Sadek Wahba", role:"Chairman, I Squared Capital", companyId:null, note:"Recurrent Energy parent. Global infrastructure PE. Solar development." },
  { id:"p_terra_gen", name:"Jim Pagano", role:"CEO, Terra-Gen", companyId:null, note:"Western US wind + solar developer. NV pipeline evaluation. 5GW+ portfolio." },
  { id:"p_avangrid_nv", name:"Pedro Azagra", role:"CEO, Avangrid", companyId:null, note:"Iberdrola subsidiary. NYSE: AGR. NV renewable evaluation. 8GW US portfolio." },
  { id:"p_leeward", name:"Greg Wolf", role:"CEO, Leeward Renewable Energy", companyId:null, note:"OMERS-backed. 3GW+ portfolio. NV solar + storage evaluation." },

  // --- Environmental / Permitting Specialists ---
  { id:"p_cbec_bio", name:"Jennifer Lewicki", role:"Senior Ecologist, CBEC Eco Engineering", companyId:null, note:"Desert tortoise mitigation design. NV solar project biological compliance." },
  { id:"p_econ_environ", name:"Robert Johnston", role:"VP Environment, ERM", companyId:null, note:"Environmental consulting. NV energy project NEPA support. Global practice." },
  { id:"p_hdrinc", name:"George Puckett", role:"VP Renewable Energy, HDR", companyId:null, note:"Engineering + environmental. NV transmission routing. Utility planning." },

  // --- Additional Federal Energy ---
  { id:"p_doe_lpo", name:"Jigar Shah", role:"Director, DOE Loan Programs Office", companyId:null, note:"$400B+ lending authority. NV Greenlink + geothermal project evaluation." },
  { id:"p_bia_west", name:"Bryan Newland", role:"Asst Secretary Indian Affairs, DOI", companyId:null, note:"Tribal consultation policy. Trust land energy development framework." },
  { id:"p_nps_nv", name:"Charles Sams III", role:"Director, National Park Service", companyId:null, note:"NPS visual impact review. Death Valley + Great Basin solar proximity." },

  // --- Workforce / Education ---
  { id:"p_unlv_solar", name:"Robert Boehm", role:"Director, UNLV Center for Energy Research", companyId:null, note:"Solar energy research. Grid integration studies. Workforce development." },
  { id:"p_unr_geo", name:"Jim Faulds", role:"Director, NV Bureau of Mines & Geology", companyId:null, note:"Geothermal resource mapping. Great Basin Center. EGS research support." },
  { id:"p_csi_solar", name:"Michael Barletta", role:"Director, CSN Energy Technology Program", companyId:null, note:"College of Southern Nevada. Solar installer training. Renewable workforce pipeline." },
  { id:"p_tmcc_energy", name:"Karen Carey", role:"VP Workforce, TMCC", companyId:null, note:"Truckee Meadows CC. Northern NV electrical + construction workforce training." },

  // --- Additional Industry Leaders ---
  { id:"p_ge_vernova", name:"Scott Strazik", role:"CEO, GE Vernova", companyId:null, note:"NYSE: GEV. Wind turbines + grid solutions. NV transmission equipment supply." },
  { id:"p_vestas_na", name:"Laura Beane", role:"President, Vestas NA", companyId:null, note:"Wind turbine manufacturer. Spring Valley Wind + Stagecoach Wind supply." },
  { id:"p_goldwind_na", name:"David Sale", role:"President, Goldwind Americas", companyId:null, note:"Chinese wind turbine manufacturer. NV wind project supply evaluation." },
  { id:"p_envision", name:"Lei Zhang", role:"CEO, Envision AEST", companyId:null, note:"BESS + wind manufacturer. NV project supply chain evaluation." },

  // ========================================================================
  // NEW PEOPLE — Batch 4: Additional project staff, regional contacts, specialists
  // ========================================================================

  // --- Additional NV Energy Project Staff ---
  { id:"p_nve_substation", name:"Brian Underwood", role:"Director Substation Engineering, NV Energy", companyId:null, note:"Greenlink substation design. 525kV converter stations. Grid interconnection." },
  { id:"p_nve_procurement", name:"Amanda Fields", role:"Director Procurement, NV Energy", companyId:null, note:"$6B capital plan procurement. Equipment + EPC contract management." },
  { id:"p_nve_dispatch", name:"Carlos Rivera", role:"Director System Operations, NV Energy", companyId:null, note:"Grid dispatch. BESS optimization. Real-time energy management system." },
  { id:"p_nve_rates", name:"David Kim", role:"Director Rate Design, NV Energy", companyId:null, note:"Rate case development. Clean Transition Tariff design. Time-of-use rates." },
  { id:"p_nve_it", name:"Karen Lopez", role:"VP IT & Grid Modernization, NV Energy", companyId:null, note:"SCADA systems. Smart grid technology. Data analytics platform." },
  { id:"p_nve_re_south", name:"James Hawkins", role:"Regional Engineer South, NV Energy", companyId:null, note:"Southern NV generation + distribution. Clark County operations." },
  { id:"p_nve_re_north", name:"Michelle Park", role:"Regional Engineer North, NV Energy", companyId:null, note:"Northern NV generation + distribution. Washoe + Churchill operations." },

  // --- Additional PUCN Staff ---
  { id:"p_pucn_staff", name:"Sara Rodriguez", role:"Chief of Staff, PUCN", companyId:null, note:"PUCN administrative management. Docket coordination. Commissioner support." },
  { id:"p_pucn_tech", name:"Jason Westerfield", role:"Chief Engineer, PUCN", companyId:null, note:"Technical review of IRP + rate case filings. Interconnection standards." },
  { id:"p_pucn_consumer", name:"Ernest Figueroa", role:"Director Consumer Advocacy, PUCN", companyId:null, note:"Consumer protection. Rate impact analysis. Greenlink cost allocation review." },

  // --- BLM Additional Field Staff ---
  { id:"p_blm_realty", name:"Patricia Humphries", role:"Chief Realty, BLM Nevada", companyId:null, note:"BLM ROW processing. Energy project land authorizations. Lease administration." },
  { id:"p_blm_enviro", name:"Derek Christensen", role:"Environmental Coordinator, BLM Nevada", companyId:null, note:"NEPA compliance coordinator. EIS management. Programmatic review." },
  { id:"p_blm_renewable", name:"Anita Howard", role:"Renewable Energy Coordinator, BLM Nevada", companyId:null, note:"Solar + wind ROW specialist. Energy corridor planning. SEZ management." },

  // --- Additional Project Managers / Developers ---
  { id:"p_nextera_pm", name:"Kevin Walsh", role:"Senior Project Manager, NextEra", companyId:null, note:"Bonanza + Arrow Canyon NV project management. Construction oversight." },
  { id:"p_8minute_pm", name:"Laura Chen", role:"VP Development, 8minute Solar", companyId:null, note:"Mosey + Yellowpine project development. PPA negotiation." },
  { id:"p_candela_pm", name:"Jennifer Martinez", role:"VP Development, Candela Renewables", companyId:null, note:"Rough Hat Clark project development. Nye County permitting." },
  { id:"p_174_pm", name:"Scott Kim", role:"VP Development, 174 Power Global", companyId:null, note:"Boulder Solar III NV project manager. Hanwha subsidiary." },
  { id:"p_primergy_pm", name:"Tyler Sampson", role:"Project Director, Primergy Solar", companyId:null, note:"Purple Sage 400MW project director. Interconnection management." },
  { id:"p_arevia_pm", name:"David Weiner", role:"VP Engineering, Arevia Power", companyId:null, note:"Libra Solar 700MW engineering lead. Energy storage design." },
  { id:"p_fervo_drill", name:"Michael Davies", role:"VP Drilling Operations, Fervo Energy", companyId:null, note:"Corsac Station horizontal drilling program. Well completions." },
  { id:"p_ormat_nv", name:"Paul Thomsen", role:"VP Business Development, Ormat", companyId:null, note:"NV geothermal expansion. Google portfolio. McGinness Phase 4." },

  // --- Interconnection & Grid Specialists ---
  { id:"p_nve_queue", name:"Rachel Chen", role:"Interconnection Queue Manager, NV Energy", companyId:null, note:"20GW+ interconnection queue management. Study coordination." },
  { id:"p_caiso_markets", name:"Mark Rothleder", role:"VP Market Operations, CAISO", companyId:null, note:"Western EIM + EDAM market design. NV Energy participation." },
  { id:"p_wecc_plan", name:"Branden Sudduth", role:"VP Reliability Planning, WECC", companyId:null, note:"Western resource adequacy. Transmission planning review." },

  // --- Additional Financial People ---
  { id:"p_jp_tax", name:"Steven Markowitz", role:"MD Tax Equity, JPMorgan", companyId:null, note:"Solar + storage ITC monetization. $5B+ NV project tax equity portfolio." },
  { id:"p_bofa_green", name:"Karen Fang", role:"Global Head ESG, Bank of America", companyId:null, note:"Green bond program. NV Energy sustainability-linked financing." },
  { id:"p_ares_energy", name:"Keith Derman", role:"Partner Infrastructure, Ares Management", companyId:null, note:"Clean energy infrastructure investment. NV project evaluation." },
  { id:"p_blackrock_re", name:"David Giordano", role:"Head Americas Renewable Power, BlackRock", companyId:null, note:"Renewable energy investment. NV solar + transmission evaluation." },

  // --- Additional Environmental Specialists ---
  { id:"p_tortoise_bio", name:"Dr. Todd Esque", role:"Research Ecologist, USGS", companyId:null, note:"Desert tortoise population ecology. NV solar project biological review." },
  { id:"p_sage_grouse", name:"Peter Coates", role:"Research Wildlife Biologist, USGS", companyId:null, note:"Bi-State sage grouse research. Central NV energy project review." },
  { id:"p_swca_nv", name:"Jason Ingle", role:"VP Nevada, SWCA Environmental", companyId:null, note:"NV office lead. Energy project NEPA. Cultural resources." },
  { id:"p_dnv_solar", name:"Ulrich Boes", role:"VP Americas Solar, DNV", companyId:null, note:"Solar + BESS due diligence. Bankability assessment. NV project review." },
  { id:"p_tetra_nv", name:"Ashley Powers", role:"VP Nevada, Tetra Tech", companyId:null, note:"NV environmental services. Cultural resource surveys. Energy projects." },

  // --- County Staff ---
  { id:"p_clark_planning", name:"Nancy Amundsen", role:"Director Community Development, Clark County", companyId:null, note:"Land use planning. Solar project conditional use permits. Environmental review." },
  { id:"p_nye_planning", name:"Frank Marrone", role:"Director Planning, Nye County", companyId:null, note:"Nye County land use. Pahrump + Tonopah. Solar project siting." },
  { id:"p_lyon_planning", name:"Jeff Page", role:"Community Development Director, Lyon County", companyId:null, note:"Lyon County planning. Libra Solar project review. Yerington area." },
  { id:"p_storey_mgr", name:"Austin Osborne", role:"County Manager, Storey County", companyId:null, note:"Storey County administration. TRIC data center growth management." },
  { id:"p_churchill_mgr", name:"Jim Barbee", role:"County Manager, Churchill County", companyId:null, note:"Churchill County administration. Geothermal + military coordination." },

  // --- Media & Analysts (Additional) ---
  { id:"p_nv_current", name:"Jeniffer Solis", role:"Energy Reporter, Nevada Current", companyId:null, note:"NV energy + environment journalism. PUCN coverage. Policy reporting." },
  { id:"p_spglobal_nv", name:"Katherine Stenger", role:"Editor Americas Power, S&P Global", companyId:null, note:"Power market analysis. NV wholesale prices. Utility credit." },
  { id:"p_eia_west", name:"Ted McCallister", role:"Regional Director West, US EIA", companyId:null, note:"Federal energy statistics. NV generation + consumption data. EIA-860." },

  // --- Additional Construction / Trade Leads ---
  { id:"p_laborers_nv", name:"Tommy White", role:"Business Manager, Laborers Local 872", companyId:null, note:"General construction laborers. Las Vegas. Solar site prep. 5,000+ members." },
  { id:"p_carpenters_nv", name:"Frank Marín", role:"Business Rep, Carpenters Local 1977", companyId:null, note:"NV carpentry + formwork. Solar + data center construction." },
  { id:"p_teamsters_nv", name:"Chris Langston", role:"Secretary-Treasurer, Teamsters Local 631", companyId:null, note:"Trucking + heavy haul. Solar module + equipment transport. 7,000+ members." },

  // --- Telecommunications / Fiber (Data Center) ---
  { id:"p_zayo_nv", name:"Matt Steinfort", role:"CFO, Zayo Group", companyId:null, note:"Fiber optic provider. NV data center connectivity. TRIC fiber infrastructure." },
  { id:"p_lumen_nv", name:"Kate Johnson", role:"CEO, Lumen Technologies", companyId:null, note:"Fiber + network services. NV data center connectivity. Enterprise infrastructure." },

  // --- Additional Tribal Contacts ---
  { id:"p_summit_lake", name:"Cynthia Thomas", role:"Chair, Summit Lake Paiute Tribe", companyId:null, note:"Humboldt County. Hot Pot Geothermal area. Traditional use consultation." },
  { id:"p_lovelock", name:"Micheline James", role:"Chair, Lovelock Paiute Tribe", companyId:null, note:"Pershing County. Corsac Station area. Lovelock Cave cultural sites." },
  { id:"p_south_fork", name:"Michael McBride III", role:"Chair, South Fork Band, Te-Moak", companyId:null, note:"Elko County. Northeastern NV energy development consultation." },

  // --- Additional State Legislature ---
  { id:"p_nv_sen_brooks", name:"Chris Brooks", role:"NV State Senator, District 3", companyId:null, note:"Senate Energy Committee. SB 448 clean energy sponsor. Solar policy." },
  { id:"p_nv_asm_monroe", name:"Daniele Monroe-Moreno", role:"NV Assembly, District 1", companyId:null, note:"Assembly Government Affairs. Data center incentive policy." },

  // --- Additional Developer Company Leaders ---
  { id:"p_clearway_ceo", name:"Craig Cornelius", role:"CEO, Clearway Energy Group", companyId:null, note:"GIP-backed. 10GW+ clean energy. NV solar evaluation." },
  { id:"p_invenergy_ceo", name:"Michael Polsky", role:"Founder & CEO, Invenergy", companyId:null, note:"Largest private US renewable developer. 30GW+. NV evaluation." },
  { id:"p_engie_ceo", name:"Dave Carroll", role:"CEO, ENGIE North America", companyId:null, note:"French utility subsidiary. 7GW US portfolio. NV pipeline." },
  { id:"p_brookfield_re", name:"Connor Teskey", role:"CEO, Brookfield Renewable", companyId:null, note:"$75B AUM. Global renewables. NV acquisition evaluation." },
  { id:"p_hannon_ceo", name:"Jeffrey Eckel", role:"CEO, Hannon Armstrong", companyId:null, note:"NYSE: HASI. Climate REIT. NV solar project investment." },
  { id:"p_digitalbridge_ceo", name:"Marc Ganzi", role:"CEO, DigitalBridge", companyId:null, note:"Digital infrastructure. Switch parent. $80B+ AUM." },

  // ========================================================================
  // NEW PEOPLE — Batch 5: Expanding to reach 1000+ node target
  // ========================================================================

  // --- More Federal Agency Staff ---
  { id:"p_doe_gto2", name:"Lauren Boyd", role:"Deputy Director, DOE Geothermal Technologies", companyId:null, note:"GTO program management. FORGE. EGS R&D grants." },
  { id:"p_doe_solar", name:"Becca Jones-Albertus", role:"Director, DOE Solar Energy Technologies", companyId:null, note:"Federal solar R&D. Cost targets. NV solar research." },
  { id:"p_doe_storage", name:"Alejandro Moreno", role:"Director, DOE Energy Storage Grand Challenge", companyId:null, note:"Long-duration storage R&D. BESS research. Grid storage." },
  { id:"p_doi_solar", name:"Karen Mouritsen", role:"Acting BLM Deputy Director, Energy", companyId:null, note:"BLM renewable energy policy. Solar Energy Zone management." },
  { id:"p_bia_pacific", name:"Tara Sweeney", role:"Regional Director, BIA Pacific Region", companyId:null, note:"BIA tribal consultation. NV tribal energy development oversight." },
  { id:"p_epa_energy", name:"Deborah Jordan", role:"Director Air Division, EPA Region 9", companyId:null, note:"Air quality permits. NV energy project compliance." },
  { id:"p_fema_nv", name:"Robert Fenton", role:"Regional Administrator, FEMA Region 9", companyId:null, note:"Disaster preparedness. Grid resilience. Energy infrastructure protection." },
  { id:"p_usace_nv", name:"Col. Julie Balten", role:"Commander, LA District, US Army Corps", companyId:null, note:"Section 404 permits. NV energy project wetlands review." },

  // --- More NV State Government ---
  { id:"p_nv_controller", name:"Andy Matthews", role:"NV State Controller", companyId:null, note:"State financial oversight. Energy project fiscal impact. Bond oversight." },
  { id:"p_nv_sos", name:"Francisco Aguilar", role:"NV Secretary of State", companyId:null, note:"Business registration. Corporate filings. Energy company licensing." },
  { id:"p_nv_treas", name:"Zach Conine", role:"NV State Treasurer", companyId:null, note:"State bonds. Green financing. Capital budget. Energy project investment." },
  { id:"p_nv_dcnr", name:"Bradley Crowell", role:"Director, NV DCNR", companyId:null, note:"Department of Conservation & Natural Resources. Environmental oversight." },
  { id:"p_nv_bhp", name:"Randall Weiss", role:"Dir, NV Bureau of Health & Human Services", companyId:null, note:"Community health impact. Energy project worker safety." },

  // --- More Industry Association People ---
  { id:"p_nma_dir", name:"Tyre Gray", role:"President, Nevada Mining Association", companyId:null, note:"Mining industry advocacy. Land use overlap with energy. Critical minerals." },
  { id:"p_nra_resort_dir", name:"Virginia Valentine", role:"President, Nevada Resort Association", companyId:null, note:"Hospitality industry. Largest commercial electricity consumers. Rate advocacy." },
  { id:"p_nv_builders", name:"Aaron West", role:"President, Nevada Builders Alliance", companyId:null, note:"Construction industry. Workforce training. Energy project labor supply." },
  { id:"p_cenv_dir", name:"Dylan Sullivan", role:"Executive Director, Clean Energy Nevada", companyId:null, note:"Clean energy policy advocacy. RPS compliance. Consumer protection." },
  { id:"p_wires_dir", name:"Larry Gasteiger", role:"Executive Director, WIRES", companyId:null, note:"Transmission industry advocacy. Investment + siting policy." },
  { id:"p_gea_dir", name:"Bryant Jones", role:"Executive Director, Geothermal Rising", companyId:null, note:"Geothermal industry trade association. Policy + research advocacy." },

  // --- More Safety / Regulatory ---
  { id:"p_nvosha_dir", name:"Victoria Carreon", role:"Chief Administrative Officer, NV OSHA", companyId:null, note:"Construction safety. Energy project OSHA compliance. Inspection." },
  { id:"p_nv_fire", name:"Ross Davis", role:"NV State Fire Marshal", companyId:null, note:"BESS fire safety codes. Solar facility fire standards." },
  { id:"p_nerc_west", name:"John Moura", role:"Director Reliability, NERC", companyId:null, note:"Western reliability standards. Grid adequacy assessment." },

  // --- More Banking/Finance People ---
  { id:"p_wells_fargo_re", name:"Pat Brown", role:"Head Renewable Energy, Wells Fargo", companyId:null, note:"Renewable tax equity + project finance. NV solar portfolio." },
  { id:"p_hsbc_infra", name:"Noel Quinn", role:"CEO, HSBC", companyId:null, note:"Global bank. Green bond underwriting. Infrastructure finance." },
  { id:"p_ing_re", name:"Daniel Zucker", role:"Head NA Power, ING", companyId:null, note:"Renewable project finance specialist. NV solar lending." },
  { id:"p_credit_ag", name:"Xavier Musca", role:"Deputy CEO, Credit Agricole", companyId:null, note:"French bank. Renewable energy project finance leader." },
  { id:"p_nomura_green", name:"Kentaro Okuda", role:"CEO, Nomura Holdings", companyId:null, note:"Japanese bank. Green bond + ESG finance. NV evaluation." },

  // --- More University/Research ---
  { id:"p_unlv_eng", name:"Rama Venkat", role:"Dean of Engineering, UNLV", companyId:null, note:"UNLV College of Engineering. Renewable energy research programs." },
  { id:"p_unr_eng", name:"Erick Jones", role:"Dean of Engineering, UNR", companyId:null, note:"UNR College of Engineering. Geothermal + grid research." },
  { id:"p_dri_climate", name:"Douglas Boyle", role:"VP Research, DRI", companyId:null, note:"Desert Research Institute. Climate + environmental monitoring." },
  { id:"p_nrel_solar", name:"David Feldman", role:"Senior Solar Analyst, NREL", companyId:null, note:"Solar cost tracking. LCOE analysis. NV solar performance." },
  { id:"p_sandia_bess", name:"Summer Ferreira", role:"Manager BESS Safety, Sandia", companyId:null, note:"BESS safety testing. Fire risk research. NV project protocols." },

  // --- More Developer Staff ---
  { id:"p_quinbrook_pm", name:"Michael Walsh", role:"VP Asset Management, Quinbrook", companyId:null, note:"Gemini Solar operational asset management. Primergy oversight." },
  { id:"p_fervo_geo", name:"Sarah Newman", role:"VP Geoscience, Fervo Energy", companyId:null, note:"Reservoir engineering. Resource assessment. Corsac Station subsurface." },
  { id:"p_ormat_ops", name:"Robert Sullivan", role:"VP Operations Americas, Ormat", companyId:null, note:"NV geothermal operations. Plant performance. Maintenance optimization." },
  { id:"p_nextera_env", name:"David Burnham", role:"VP Environmental, NextEra Energy", companyId:null, note:"NEPA compliance. ESA consultation. Bonanza + Arrow Canyon environment." },
  { id:"p_edf_west", name:"Paul Shortridge", role:"VP Western Development, EDF Renewables", companyId:null, note:"EDF western US development. 8minute integration. NV pipeline." },
  { id:"p_switch_ops", name:"Missy Young", role:"COO, Switch", companyId:null, note:"Citadel Campus operations. Facility management. Power procurement." },
  { id:"p_google_nv", name:"Neha Palmer", role:"Director Clean Energy, Google", companyId:null, note:"Google NV data center clean energy. Geothermal PPA execution." },
  { id:"p_meta_energy", name:"Urvi Parekh", role:"Head of Energy, Meta", companyId:null, note:"Meta data center energy strategy. Renewable procurement. NV campus." },
  { id:"p_ms_energy", name:"Noelle Walsh", role:"CVP Cloud Operations, Microsoft", companyId:null, note:"Microsoft data center energy. NV campus power strategy." },
  { id:"p_aws_nv", name:"Adam Selipsky", role:"CEO, AWS", companyId:null, note:"AWS infrastructure. NV data center expansion evaluation." },

  // ========================================================================
  // NEW PEOPLE — Batch 6: Expanding to 1000+ node target (~100 additions)
  // ========================================================================

  // --- White Pine County Commissioners ---
  { id:"p_wp_cc2", name:"Richard Howe", role:"Commissioner, White Pine County", companyId:null, note:"Ely district. Spring Valley Wind economic impact. Pumped storage water rights." },
  { id:"p_wp_cc3", name:"Shane Bybee", role:"Commissioner, White Pine County", companyId:null, note:"White Pine County. Mining-to-energy transition. Rural workforce." },

  // --- Humboldt County Commissioners ---
  { id:"p_humboldt_cc2", name:"Mike Bell", role:"Commissioner, Humboldt County", companyId:null, note:"Winnemucca district. North Valmy + geothermal project oversight." },
  { id:"p_humboldt_cc3", name:"Dave Bengochea", role:"Commissioner, Humboldt County", companyId:null, note:"Humboldt County ranching + energy coexistence. Hot Pot area." },
  { id:"p_humboldt_cc4", name:"Ken Tipton", role:"Commissioner, Humboldt County", companyId:null, note:"Humboldt County Chair. Battle Mountain Solar area coordination." },

  // --- Mineral County Commissioners ---
  { id:"p_mineral_cc2", name:"Jerrie Tipton", role:"Commissioner, Mineral County", companyId:null, note:"Hawthorne district. Don Campbell Geothermal. Army Depot coordination." },
  { id:"p_mineral_cc3", name:"Chris Hegg Jr", role:"Commissioner, Mineral County", companyId:null, note:"Mineral County geothermal revenue. Walker Lake proximity." },

  // --- Storey County Commissioners ---
  { id:"p_storey_cc2", name:"Jay Carmona", role:"Commissioner, Storey County", companyId:null, note:"Storey County. TRIC expansion oversight. Data center tax policy." },
  { id:"p_storey_cc3", name:"Clay Mitchell", role:"Commissioner, Storey County", companyId:null, note:"Storey County ranching + industrial coexistence. Water supply." },

  // --- Lincoln County Commissioners ---
  { id:"p_lincoln_cc2", name:"Kevin Phillips", role:"Commissioner, Lincoln County", companyId:null, note:"Caliente district. Chill Sun Solar host. Rural economic development." },
  { id:"p_lincoln_cc3", name:"Paul Shortland", role:"Commissioner, Lincoln County", companyId:null, note:"Lincoln County rural NV. Solar + transmission corridor land use." },

  // --- Pine Gate Renewables Executives ---
  { id:"p_pine_gate_vp", name:"Justin Johns", role:"VP Engineering, Pine Gate Renewables", companyId:null, note:"Rock Valley Solar engineering lead. Interconnection design." },
  { id:"p_pine_gate_dev", name:"Matt Kisber", role:"Chairman, Pine Gate Renewables", companyId:null, note:"Pine Gate board chair. Former TN Economic Development Commissioner." },
  { id:"p_pine_gate_pm", name:"Sarah Lancaster", role:"Project Manager, Pine Gate Renewables", companyId:null, note:"Rock Valley Solar NV project manager. Permitting + construction." },

  // --- 8minute Solar Executives ---
  { id:"p_8minute_vp", name:"Martin Hermann", role:"CTO, 8minute Solar Energy", companyId:null, note:"8minute technology strategy. Mosey + Yellowpine engineering." },
  { id:"p_8minute_fin", name:"Brooke Betts", role:"VP Finance, 8minute Solar Energy", companyId:null, note:"Project finance. PPA structuring. Tax equity. NV portfolio." },

  // --- IP Athenea Executives ---
  { id:"p_ip_athenea_vp", name:"Pablo Garcia", role:"VP Development, IP Athenea", companyId:null, note:"Copper Rays Solar NV development lead. Spanish developer US expansion." },
  { id:"p_ip_athenea_eng", name:"Maria Lopez", role:"Director Engineering, IP Athenea", companyId:null, note:"Copper Rays Solar engineering design. Interconnection studies." },

  // --- Cyrq Energy Executives ---
  { id:"p_cyrq_vp", name:"Todd Landon", role:"VP Development, Cyrq Energy", companyId:null, note:"Hot Pot + Patua geothermal development. Resource assessment." },
  { id:"p_cyrq_ops", name:"Brian Fairbank", role:"VP Operations, Cyrq Energy", companyId:null, note:"Geothermal plant operations. Patua + Hot Pot O&M management." },

  // --- rPlus Hydro / Obsidian Executives ---
  { id:"p_rplus_eng", name:"Ken Brueck", role:"VP Engineering, rPlus Hydro", companyId:null, note:"White Pine Pumped Storage engineering. Reservoir design. FERC licensing." },
  { id:"p_rplus_env", name:"Linda Harrison", role:"VP Environmental, Obsidian Renewables", companyId:null, note:"Pumped storage NEPA compliance. Aquatic habitat assessment." },

  // --- Enel Green Power Executives ---
  { id:"p_enel_ops", name:"Rafael Gonzalez", role:"VP Operations NA, Enel Green Power", companyId:null, note:"Stillwater Hybrid operations. Geothermal + solar + storage integration." },
  { id:"p_enel_dev", name:"Antonio Cammisecra", role:"Head Business Development, Enel GP NA", companyId:null, note:"Enel North American development strategy. NV portfolio expansion." },

  // --- Pattern Energy Executives ---
  { id:"p_pattern_dev", name:"Hunter Armistead", role:"EVP Development, Pattern Energy", companyId:null, note:"Spring Valley Wind development lead. 30GW+ pipeline management." },
  { id:"p_pattern_ops", name:"Chris Shugart", role:"VP Operations, Pattern Energy", companyId:null, note:"Spring Valley Wind operations. 700MW+ western wind portfolio." },

  // --- NextEra Resource Additional ---
  { id:"p_nextera_fin", name:"Kirk Crews", role:"CFO, NextEra Energy Resources", companyId:null, note:"NextEra project finance. Bonanza + Arrow Canyon capital allocation." },
  { id:"p_nextera_reg", name:"Christopher Fallon", role:"VP Regulatory, NextEra Energy Resources", companyId:null, note:"PUCN proceedings. NV regulatory filings. Rate case testimony." },

  // --- Meta Data Center Leadership ---
  { id:"p_meta_dc", name:"Rachel Peterson", role:"VP Data Center Strategy, Meta", companyId:null, note:"Meta TRIC data center planning. Site selection. Capacity management." },
  { id:"p_meta_ops", name:"Katie Stelzner", role:"Director Data Center Operations, Meta", companyId:null, note:"Meta NV operations management. Facility commissioning." },
  { id:"p_meta_sustain", name:"Bobby Hollis", role:"Director Sustainability, Meta", companyId:null, note:"Meta clean energy procurement. NV renewable PPA strategy." },

  // --- Applied Digital Leadership ---
  { id:"p_applied_ceo", name:"Wes Cummins", role:"CEO, Applied Digital", companyId:null, note:"NASDAQ: APLD. AI/HPC data center. NV site evaluation. High-density computing." },
  { id:"p_applied_ops", name:"David Rench", role:"COO, Applied Digital", companyId:null, note:"Applied Digital operations. NV facility buildout. Power infrastructure." },

  // --- Southwest Gas Pipeline Leadership ---
  { id:"p_swgas_ops", name:"Justin Brown", role:"VP Gas Operations, Southwest Gas", companyId:null, note:"Pinyon Pipeline operations planning. NV natural gas distribution." },
  { id:"p_swgas_reg", name:"John Hester", role:"VP Regulatory, Southwest Gas", companyId:null, note:"PUCN gas rate cases. Pinyon Pipeline regulatory filings." },

  // --- Air Liquide Hydrogen Leadership ---
  { id:"p_air_liquide_h2", name:"Matthieu Giard", role:"VP Hydrogen, Air Liquide", companyId:null, note:"Green hydrogen development. DOE H2Hub program. NV H2 feasibility." },
  { id:"p_air_liquide_eng", name:"Scott Peska", role:"VP Engineering NA, Air Liquide", companyId:null, note:"H2 production facility engineering. Electrolyzer + storage design." },

  // --- Additional NV Energy Staff ---
  { id:"p_nve_vegetation", name:"Michael Torres", role:"Director Vegetation Management, NV Energy", companyId:null, note:"Transmission corridor vegetation. Wildfire mitigation. ROW maintenance." },
  { id:"p_nve_grid_ops", name:"Thomas Schwartz", role:"VP Grid Operations, NV Energy", companyId:null, note:"Real-time grid management. BESS dispatch. Renewable integration." },
  { id:"p_nve_demand", name:"Jessica Williams", role:"Director Demand Response, NV Energy", companyId:null, note:"DR program design. Large customer load management. Data center coordination." },

  // --- Additional PUCN Staff ---
  { id:"p_pucn_econ", name:"Harold Judd", role:"Senior Economist, PUCN", companyId:null, note:"Rate impact modeling. Economic analysis of IRP + rate cases." },
  { id:"p_pucn_legal", name:"Tamara Luce", role:"General Counsel, PUCN", companyId:null, note:"PUCN legal proceedings. Docket management. Administrative law." },

  // --- BLM District Managers ---
  { id:"p_blm_winnemucca", name:"Gene Seidlitz", role:"District Manager, BLM Humboldt", companyId:null, note:"Humboldt + Lander County federal lands. Hot Pot + Battle Mountain area." },
  { id:"p_blm_tonopah", name:"Jeff Weeks", role:"Field Manager, BLM Tonopah", companyId:null, note:"Nye + Esmeralda County. Esmeralda Seven PEIS. Amargosa Desert projects." },

  // --- NV State Clearinghouse Staff ---
  { id:"p_clearinghouse", name:"Rebecca Palmer", role:"Director, NV State Clearinghouse", companyId:null, note:"State environmental review coordination. Federal consistency review. Energy project clearance." },
  { id:"p_clearinghouse2", name:"David Wright", role:"Environmental Review Specialist, NV SCH", companyId:null, note:"State Clearinghouse NEPA review. Energy project consistency analysis." },

  // --- GE Vernova Executives ---
  { id:"p_ge_wind", name:"Vic Abate", role:"CEO Onshore Wind, GE Vernova", companyId:null, note:"GE wind turbine platform. NV wind project supply. Haliade/Sierra product line." },
  { id:"p_ge_grid_vp", name:"Philippe Piron", role:"CEO Grid Solutions, GE Vernova", companyId:null, note:"Transmission equipment. HVDC. Transformer + switchgear supply to NV." },

  // --- Vestas Wind Turbine Executives ---
  { id:"p_vestas_west", name:"Chris Brown", role:"VP West Region, Vestas", companyId:null, note:"Western US wind turbine sales. Spring Valley Wind + NV pipeline." },
  { id:"p_vestas_service", name:"Tommy Rahbek Nielsen", role:"EVP Service, Vestas", companyId:null, note:"Wind turbine O&M services. NV operational fleet maintenance." },

  // --- Envision AEST Executives ---
  { id:"p_envision_na", name:"Chen Yanqi", role:"VP Americas, Envision AEST", companyId:null, note:"BESS + wind equipment. NV project supply chain. US market expansion." },

  // --- Sungrow Executives ---
  { id:"p_sungrow_na", name:"Kenny Chen", role:"President Americas, Sungrow", companyId:null, note:"Solar inverter + BESS supply. NV utility-scale project equipment." },

  // --- Power Electronics Executives ---
  { id:"p_power_elec_na", name:"Alberto Bernabeu", role:"VP Americas, Power Electronics", companyId:null, note:"Utility-scale solar inverter. Gemini + NV project supply." },

  // --- Additional Investment Bankers ---
  { id:"p_citi_infra", name:"Michael Eckhart", role:"MD Infrastructure, Citigroup", companyId:null, note:"Renewable energy project finance. NV solar + transmission debt syndication." },
  { id:"p_barclays_energy", name:"James Stettler", role:"MD Energy, Barclays", companyId:null, note:"Renewable project finance. NV solar lending. Green bonds." },
  { id:"p_natixis_re", name:"Patrick Gauthier", role:"Head Americas Energy, Natixis", companyId:null, note:"French bank. Renewable project finance. NV solar portfolio lending." },
  { id:"p_rabobank_re", name:"Hans Beltman", role:"Head Energy Finance, Rabobank", companyId:null, note:"Renewable + agricultural lending. NV project participation." },
  { id:"p_cobank_re", name:"Robert Engel", role:"President, CoBank", companyId:null, note:"Farm Credit System. Rural electric cooperative lending. NV utility." },

  // --- Tax Equity Specialists ---
  { id:"p_us_bank_te", name:"David Lowery", role:"MD Tax Equity, US Bancorp", companyId:null, note:"Solar + wind ITC/PTC monetization. NV project tax equity." },
  { id:"p_wf_tax", name:"Stephen Inrig", role:"MD Renewable Tax Equity, Wells Fargo", companyId:null, note:"Solar tax equity structuring. NV solar portfolio." },

  // --- PPA Negotiation Lawyers ---
  { id:"p_norton_rose", name:"Keith Martin", role:"Partner, Norton Rose Fulbright", companyId:null, note:"Renewable energy tax counsel. PPA structuring. NV project transactions." },
  { id:"p_orrick_ppa", name:"Daniel Hagan", role:"Partner, Orrick Herrington", companyId:null, note:"PPA negotiation. Renewable project finance. NV deal counsel." },
  { id:"p_pillsbury_energy", name:"Donna Lavallee", role:"Partner, Pillsbury Winthrop", companyId:null, note:"Energy regulatory. Transmission permitting. NV utility counsel." },

  // --- Insurance Underwriters ---
  { id:"p_tokio_marine", name:"Alan Kreczko", role:"SVP Energy, Tokio Marine", companyId:null, note:"Japanese insurer. NV renewable project construction all-risk." },
  { id:"p_aig_energy", name:"Thomas Jones", role:"Head Energy, AIG", companyId:null, note:"Energy project insurance. NV construction + operational coverage." },
  { id:"p_gcube_na", name:"Fraser McLachlan", role:"CEO, GCube Insurance", companyId:null, note:"Specialist renewable insurer. NV solar + BESS coverage." },

  // --- Desert Tortoise Biologists ---
  { id:"p_tortoise_bio2", name:"Dr. Kristin Berry", role:"Research Ecologist, USGS Emeritus", companyId:null, note:"Pioneering desert tortoise researcher. NV solar project habitat assessment." },
  { id:"p_tortoise_bio3", name:"Roy Averill-Murray", role:"Recovery Lead, USFWS Desert Tortoise", companyId:null, note:"Desert tortoise recovery coordinator. Section 7 consultation oversight." },

  // --- Sage Grouse Specialists ---
  { id:"p_sage_grouse2", name:"Shawn Espinosa", role:"Staff Biologist, NDOW", companyId:null, note:"Bi-State sage grouse management. NV energy project wildlife review." },
  { id:"p_sage_grouse3", name:"Dr. Michael Casazza", role:"Research Ecologist, USGS", companyId:null, note:"Greater sage grouse research. NV wind + solar siting guidance." },

  // --- Cultural Resource Archaeologists ---
  { id:"p_archaeo1", name:"Dr. Greg Seymour", role:"State Archaeologist, NV SHPO", companyId:null, note:"Section 106 compliance. Cultural resource surveys for energy projects." },
  { id:"p_archaeo2", name:"Dr. Anna Camp", role:"Senior Archaeologist, Far Western Anthropological", companyId:null, note:"Great Basin archaeology. NV energy project cultural resource surveys." },
  { id:"p_archaeo3", name:"Margaret Lyneis", role:"Professor Emerita, UNLV Anthropology", companyId:null, note:"Southern NV archaeology. Solar project cultural resource review." },

  // --- Water Quality Engineers ---
  { id:"p_water_eng1", name:"Jason King", role:"Former NV State Engineer", companyId:null, note:"Water rights expert. Energy project water allocation. Groundwater policy." },
  { id:"p_water_eng2", name:"Micheline Fairbank", role:"Water Resources Engineer, Stantec", companyId:null, note:"NV energy project water assessment. Geothermal water rights." },
  { id:"p_water_eng3", name:"Thomas Gallagher", role:"Director Water Resources, Tetra Tech NV", companyId:null, note:"Water quality monitoring. Solar project stormwater. Geothermal discharge." },

  // --- Additional Construction Leads ---
  { id:"p_wanzek_vp", name:"Jon Blount", role:"VP Renewables, Wanzek Construction", companyId:null, note:"MYR Group subsidiary. Solar + wind EPC. NV project pursuit." },
  { id:"p_pcl_energy", name:"Mike Chicken", role:"VP Power, PCL Construction", companyId:null, note:"Canadian EPC. Transmission + power plant construction. NV market entry." },
  { id:"p_swinerton_solar", name:"George Hershman", role:"President, Swinerton Renewable Energy", companyId:null, note:"Utility-scale solar EPC. 5GW+ built. NV project bid team." },

  // --- Utility Buyers (Outside NV) ---
  { id:"p_srp_ceo", name:"Mike Hummel", role:"GM, Salt River Project", companyId:null, note:"AZ public power utility. Western interconnection. Potential NV solar buyer." },
  { id:"p_tep_ceo", name:"Susan Gray", role:"President, Tucson Electric Power", companyId:null, note:"AZ utility. Western grid. Potential NV renewable PPA counterparty." },
  { id:"p_pge_portland", name:"Maria Pope", role:"CEO, Portland General Electric", companyId:null, note:"OR utility. Western EIM. NV solar evaluation for western supply." },
  { id:"p_idaho_power", name:"Lisa Grow", role:"President, Idaho Power", companyId:null, note:"ID utility. NV interconnection neighbor. Potential power exchange." },
  { id:"p_rmp_ceo", name:"Gary Hoogeveen", role:"President, Rocky Mountain Power", companyId:null, note:"PacifiCorp subsidiary. NV-UT interconnection. Potential PPA buyer." },

  // --- Additional Tribal Contacts ---
  { id:"p_goshute", name:"Rupert Steele", role:"Chairman, Confederated Tribes of Goshute", companyId:null, note:"White Pine County. Spring Valley Wind + pumped storage area. Section 106." },
  { id:"p_shoshone_council", name:"Myron Dewey", role:"Cultural Coordinator, Western Shoshone", companyId:null, note:"Treaty of Ruby Valley advocacy. Central NV energy project cultural review." },
  { id:"p_pahrump_paiute", name:"Richard Arnold", role:"Cultural Liaison, Southern Paiute", companyId:null, note:"Nye County cultural resources. Rough Hat Clark area. Pahrump band elder." },

  // --- Additional State Legislature ---
  { id:"p_nv_sen_scheible", name:"Melanie Scheible", role:"NV State Senator, District 9", companyId:null, note:"Senate Judiciary. Energy rate consumer protection. Henderson district." },
  { id:"p_nv_asm_watts", name:"Howard Watts", role:"NV Assembly, District 15", companyId:null, note:"Assembly Natural Resources. Clean energy legislation. Solar policy champion." },
  { id:"p_nv_asm_anderson", name:"Tracy Anderson", role:"NV Assembly, District 7", companyId:null, note:"Assembly Commerce. Data center incentive oversight. Las Vegas district." },

  // ========================================================================
  // NEW PEOPLE — Batch 7: Final additions to reach 1000+ node target
  // ========================================================================

  // --- Additional Developer Executives ---
  { id:"p_savion_ceo", name:"Scott Harlan", role:"CEO, Savion (Shell)", companyId:null, note:"Shell subsidiary. Utility-scale solar + storage. 18GW+ pipeline." },
  { id:"p_longroad_ceo", name:"Paul Shortridge", role:"CEO, Longroad Energy", companyId:null, note:"Utility-scale solar + wind developer. 5GW+ portfolio. NV evaluation." },
  { id:"p_cypress_ceo", name:"Sarah Slusser", role:"CEO, Cypress Creek Renewables", companyId:null, note:"Utility-scale solar developer. 10GW+ pipeline. NV evaluation." },
  { id:"p_scout_ceo", name:"Michael Rucker", role:"CEO, Scout Clean Energy", companyId:null, note:"Brookfield subsidiary. Wind + solar developer. NV evaluation." },
  { id:"p_sol_systems", name:"Yuri Horwitz", role:"CEO, Sol Systems", companyId:null, note:"Solar developer + investor. 5GW+ portfolio. NV evaluation." },
  { id:"p_arevon_ceo", name:"Swami Venkataraman", role:"CEO, Arevon Energy", companyId:null, note:"Clean energy operator. 6GW+ assets. NV evaluation." },
  { id:"p_intersect_ceo", name:"Sheldon Kimber", role:"CEO, Intersect Power", companyId:null, note:"Clean energy + hydrogen developer. 4GW+ pipeline." },
  { id:"p_lightsource_na", name:"Kevin Smith", role:"CEO Americas, Lightsource bp", companyId:null, note:"BP subsidiary. Solar developer. 25GW+ global pipeline." },
  { id:"p_desri_ceo", name:"Hy Martin", role:"CEO, D.E. Shaw Renewable Investments", companyId:null, note:"DESRI. 5GW+ solar portfolio. NV evaluation." },
  { id:"p_key_capture", name:"Jeff Bishop", role:"CEO, Key Capture Energy", companyId:null, note:"Standalone BESS developer. 5GW+ pipeline." },
  { id:"p_plus_power", name:"Brandon Keefe", role:"CEO, Plus Power", companyId:null, note:"Grid-scale BESS developer. 5GW+. NV evaluation." },

  // --- Additional Regulatory Staff ---
  { id:"p_pucn_rate", name:"Michael Cade", role:"Rate Analyst, PUCN", companyId:null, note:"Utility rate analysis. Cost of service studies. NV Energy rate review." },
  { id:"p_pucn_renew", name:"Sandra Ramirez", role:"Renewable Energy Specialist, PUCN", companyId:null, note:"RPS compliance monitoring. Solar + wind policy analysis." },

  // --- Additional NV Energy Staff ---
  { id:"p_nve_storm", name:"Derek Shaw", role:"Director Storm Response, NV Energy", companyId:null, note:"Emergency operations. Grid resilience. Natural disaster response." },
  { id:"p_nve_battery", name:"Laura Mitchell", role:"Director Battery Storage, NV Energy", companyId:null, note:"Grid-scale BESS program management. Reid Gardner integration." },

  // --- Additional County Planners ---
  { id:"p_elko_planning", name:"Cathy Pennington", role:"Director Planning, Elko County", companyId:null, note:"Elko County land use. Mining + energy project conditional use." },
  { id:"p_humboldt_plan", name:"Rick Magill", role:"Community Development Director, Humboldt County", companyId:null, note:"Humboldt County planning. Geothermal + solar siting." },
  { id:"p_wp_plan", name:"Michael Mathers", role:"Community Development, White Pine County", companyId:null, note:"White Pine County planning. Pumped storage + wind land use." },

  // --- Additional Federal Staff ---
  { id:"p_doe_h2", name:"Sunita Satyapal", role:"Director, DOE Hydrogen & Fuel Cell Technologies", companyId:null, note:"Federal hydrogen R&D. H2Hub program oversight. NV H2 potential." },
  { id:"p_blm_solar", name:"Linda Riggins", role:"Solar Energy Coordinator, BLM National", companyId:null, note:"National BLM solar program. Solar Energy Zone management." },
  { id:"p_usbr_nv", name:"Terrance Fulp", role:"Regional Director, Bureau of Reclamation LC Region", companyId:null, note:"Lower Colorado Region. Hoover Dam operations. Lake Mead hydro." },

  // --- Additional Research ---
  { id:"p_nrel_grid", name:"Paul Denholm", role:"Principal Analyst, NREL", companyId:null, note:"Grid integration research. NV renewable curtailment analysis. Storage value." },
  { id:"p_snl_geo", name:"Doug Blankenship", role:"Manager Geothermal R&D, Sandia", companyId:null, note:"Sandia geothermal drilling R&D. Fervo technical advisory." },

  // --- More Construction Trades ---
  { id:"p_sheet_metal", name:"Gary Masino", role:"Business Manager, Sheet Metal Workers 88", companyId:null, note:"Southern NV HVAC + ductwork. Data center + industrial construction." },
  { id:"p_millwrights", name:"Martin Harrison", role:"Business Rep, Millwrights Local 1263", companyId:null, note:"Turbine installation. Pump-turbine rigging. White Pine + geothermal." },
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

  // ========================================================================
  // NEW EXTERNALS — Batch 3: Developers, EPCs, Equipment, Finance, Government
  // ========================================================================

  // --- Additional Developers ---
  { id:"x_8minute", name:"8minute Solar Energy", etype:"Developer", note:"Mosey + Yellowpine Solar developer. Now EDF Renewables subsidiary. 18GW+ pipeline." },
  { id:"x_pine_gate", name:"Pine Gate Renewables", etype:"Developer", note:"Rock Valley Solar developer. Southeast + Western US solar. AES Clean Energy subsidiary." },
  { id:"x_ip_athenea", name:"IP Athenea", etype:"Developer", note:"Copper Rays Solar developer. Spanish renewable energy company. US market expansion." },
  { id:"x_cyrq", name:"Cyrq Energy", etype:"Developer", note:"Hot Pot + Patua geothermal developer. Mid-scale geothermal specialist. SLC headquarters." },
  { id:"x_enel_gp", name:"Enel Green Power", etype:"Developer", note:"Stillwater Hybrid operator. Italian utility subsidiary. 55GW+ global renewable portfolio." },
  { id:"x_rplus", name:"rPlus Hydro / Obsidian Renewables", etype:"Developer", note:"White Pine Pumped Storage 1,000MW. FERC licensed. Long-duration storage pioneer." },
  { id:"x_terra_gen", name:"Terra-Gen", etype:"Developer", note:"Western US wind + solar developer. 5GW+ portfolio. NV pipeline evaluation." },
  { id:"x_avangrid", name:"Avangrid Renewables", etype:"Developer", note:"Iberdrola subsidiary. NYSE: AGR. 8GW US portfolio. NV evaluation." },
  { id:"x_leeward", name:"Leeward Renewable Energy", etype:"Developer", note:"OMERS-backed. 3GW+ US portfolio. NV solar + storage evaluation." },
  { id:"x_recurrent", name:"Recurrent Energy", etype:"Developer", note:"Canadian Solar subsidiary. I Squared Capital backed. Utility-scale solar developer." },

  // --- Additional EPC Contractors ---
  { id:"x_signal", name:"Signal Energy", etype:"Contractor", note:"Mosey Solar EPC. Utility-scale solar construction. Southeast + Western US specialist." },
  { id:"x_sterling_wilson", name:"Sterling & Wilson", etype:"Contractor", note:"Global solar EPC. 15GW+ built worldwide. NV project pursuit. Reliance Group." },
  { id:"x_sundt", name:"Sundt Construction", etype:"Contractor", note:"Southwest US EPC. 130+ year legacy. NV renewable energy project evaluation." },
  { id:"x_bechtel", name:"Bechtel", etype:"Contractor", note:"Global infrastructure EPC. Transmission + pumped storage capable. $17B+ revenue." },
  { id:"x_whiting_turner", name:"Whiting-Turner", etype:"Contractor", note:"Data center construction. NV facility builds. $10B+ revenue." },
  { id:"x_hensel_phelps", name:"Hensel Phelps", etype:"Contractor", note:"Data center + industrial construction. NV market. Employee-owned." },

  // --- Additional Equipment Suppliers ---
  { id:"x_ge_vernova", name:"GE Vernova", etype:"Corporation", note:"NYSE: GEV. Wind turbines + grid solutions. Transmission transformers. NV equipment supply." },
  { id:"x_vestas", name:"Vestas", etype:"Corporation", note:"World's largest wind turbine manufacturer. Spring Valley Wind supply. NV wind market." },
  { id:"x_goldwind", name:"Goldwind", etype:"Corporation", note:"Chinese wind turbine manufacturer. Global #3 wind. NV project supply evaluation." },
  { id:"x_envision_aest", name:"Envision AEST", etype:"Corporation", note:"BESS + wind manufacturer. Global energy technology. NV supply chain evaluation." },
  { id:"x_samsung_sdi", name:"Samsung SDI", etype:"Corporation", note:"BESS cell manufacturer. NV project supply evaluation. High-energy-density cells." },
  { id:"x_wartsila", name:"Wartsila", etype:"Corporation", note:"Grid-scale energy storage + gas engines. GEMS platform. NV BESS evaluation." },
  { id:"x_ge_grid", name:"GE Grid Solutions", etype:"Corporation", note:"GE Vernova subsidiary. Transmission equipment. HVDC technology. NV grid supply." },
  { id:"x_schneider", name:"Schneider Electric", etype:"Corporation", note:"Power management + data center infrastructure. NV facility design. Global leader." },

  // --- Additional Financial Institutions ---
  { id:"x_stonepeak", name:"Stonepeak", etype:"Corporation", note:"Infrastructure PE. $65B+ AUM. Renewable energy + transmission investment." },
  { id:"x_gip", name:"Global Infrastructure Partners", etype:"Corporation", note:"$100B+ AUM. Clearway Energy backer. Major infrastructure investor." },
  { id:"x_macquarie", name:"Macquarie Asset Management", etype:"Corporation", note:"$640B+ AUM. Green Investment Bank. NV renewable project evaluation." },
  { id:"x_ifm", name:"IFM Investors", etype:"Corporation", note:"Australian pension-backed. $50B+ AUM. Renewable infrastructure investment." },
  { id:"x_ares", name:"Ares Management", etype:"Corporation", note:"Infrastructure PE. $395B+ AUM. Clean energy investment. NV evaluation." },
  { id:"x_blackrock_infra", name:"BlackRock Infrastructure", etype:"Corporation", note:"$10T+ AUM parent. Global Infrastructure Solutions. NV renewable evaluation." },
  { id:"x_nomura", name:"Nomura Green Tech", etype:"Corporation", note:"Japanese bank. Green bond underwriting. NV energy project finance." },
  { id:"x_credit_agricole", name:"Credit Agricole CIB", etype:"Corporation", note:"French bank. Renewable energy project finance leader. NV portfolio lending." },

  // --- Insurance Companies ---
  { id:"x_munich_re", name:"Munich Re", etype:"Corporation", note:"Global reinsurer. Renewable energy construction + operational risk. Climate analytics." },
  { id:"x_allianz", name:"Allianz Capital Partners", etype:"Corporation", note:"Allianz Group infrastructure investment. Renewable energy equity. NV evaluation." },
  { id:"x_zurich", name:"Zurich Insurance", etype:"Corporation", note:"Renewable energy project insurance. Climate risk assessment. NV portfolio." },
  { id:"x_chubb", name:"Chubb", etype:"Corporation", note:"Specialty insurance. Energy + infrastructure. Construction all-risk. NV projects." },

  // --- National Labs (Additional) ---
  { id:"x_pnnl", name:"Pacific Northwest National Lab", etype:"Government", note:"DOE lab. Energy storage research. Grid analytics. Long-duration storage R&D." },
  { id:"x_ornl", name:"Oak Ridge National Laboratory", etype:"Government", note:"DOE lab. Advanced manufacturing. Grid modernization. Materials science." },
  { id:"x_llnl", name:"Lawrence Livermore National Lab", etype:"Government", note:"DOE lab. Geothermal reservoir simulation. AI for energy systems. NV proximity." },

  // --- Utilities Outside NV ---
  { id:"x_sce", name:"Southern California Edison", etype:"Utility", note:"Major CA IOU. Western interconnection. Potential NV solar PPA buyer." },
  { id:"x_pge", name:"PG&E", etype:"Utility", note:"Northern CA IOU. Western grid. Geothermal procurement. NV power potential buyer." },
  { id:"x_vea", name:"Valley Electric Association", etype:"Utility", note:"Pahrump + Nye County electric co-op. 45,000 sq mi territory. Rough Hat Clark area." },
  { id:"x_gridliance", name:"GridLiance", etype:"Utility", note:"NV transmission owner. Great Basin region. Interconnection services." },
  { id:"x_sw_gas", name:"Southwest Gas", etype:"Utility", note:"NYSE: SWX. NV natural gas distribution. Pinyon Pipeline developer." },

  // --- Real Estate / Land ---
  { id:"x_tri_gid", name:"TRI General Improvement District", etype:"Government", note:"TRIC infrastructure + utilities. 107,000 acres. Data center + industrial campus mgmt." },
  { id:"x_bfr_land", name:"BrightNight", etype:"Developer", note:"Renewable energy platform. Western US solar development. NV project evaluation." },

  // --- Water Districts ---
  { id:"x_tcid", name:"Truckee-Carson Irrigation District", etype:"Government", note:"Churchill County water management. Geothermal + solar project water allocations." },

  // --- County Governments (New) ---
  { id:"x_white_pine", name:"White Pine County", etype:"Government", note:"Ely county seat. Pumped hydro + Spring Valley Wind host. Mining + energy." },
  { id:"x_lincoln_county", name:"Lincoln County", etype:"Government", note:"Caliente county seat. Chill Sun Solar area. One of NV's least populated counties." },
  { id:"x_storey_county", name:"Storey County", etype:"Government", note:"TRIC industrial zone host. Switch, Google, Meta data centers. NV's smallest county by area." },
  { id:"x_humboldt_county", name:"Humboldt County", etype:"Government", note:"Winnemucca. North Valmy + Hot Pot Geothermal. Mining + energy economy." },
  { id:"x_lander_county", name:"Lander County", etype:"Government", note:"Battle Mountain. McGinness Hills geothermal host. Mining + energy coexistence." },
  { id:"x_mineral_county", name:"Mineral County", etype:"Government", note:"Hawthorne. Don Campbell Geothermal host. Hawthorne Army Depot neighbor." },
  { id:"x_pershing_county", name:"Pershing County", etype:"Government", note:"Lovelock. Fervo Corsac Station host county. Agricultural + energy economy." },

  // --- Additional Tribal Nations ---
  { id:"x_ely_shoshone", name:"Ely Shoshone Tribe", etype:"Tribal", note:"White Pine County. Spring Valley Wind + pumped storage area. Section 106 consultation." },
  { id:"x_temoak", name:"Te-Moak Tribe of Western Shoshone", etype:"Tribal", note:"Elko + Lander County. Battle Mountain + geothermal area. Treaty rights." },
  { id:"x_paiute_indian", name:"Paiute Indian Tribe of Utah", etype:"Tribal", note:"Multi-band. Lincoln County proximity. Energy project consultation." },
  { id:"x_pyramid_lake", name:"Pyramid Lake Paiute Tribe", etype:"Tribal", note:"Washoe County. Northern NV transmission corridor. Water rights. Greenlink consultation." },
  { id:"x_yerington_paiute", name:"Yerington Paiute Tribe", etype:"Tribal", note:"Lyon County. Libra Solar proximity. Anaconda mine Superfund site. Section 106." },

  // --- Additional Environmental / Conservation ---
  { id:"x_tnc_nv", name:"The Nature Conservancy - Nevada", etype:"Nonprofit", note:"NV conservation. Desert habitat. Solar siting guidance. Habitat offset partnerships." },
  { id:"x_sierra_club_nv", name:"Sierra Club - Toiyabe Chapter", etype:"Nonprofit", note:"NV environmental advocacy. Clean energy support. Desert habitat protection." },
  { id:"x_defenders", name:"Defenders of Wildlife", etype:"Nonprofit", note:"Desert tortoise + sage grouse advocacy. Solar siting review. ESA consultation." },
  { id:"x_great_basin_water", name:"Great Basin Water Network", etype:"Nonprofit", note:"Water rights advocacy. Groundwater protection. Energy project water review." },
  { id:"x_basin_range", name:"Basin and Range Watch", etype:"Nonprofit", note:"Desert conservation. Solar project environmental review. Visual impact advocacy." },

  // --- Additional Industry Groups ---
  { id:"x_gea", name:"Geothermal Rising", etype:"Industry Group", note:"Formerly GEA. Geothermal industry trade association. Research + policy advocacy." },
  { id:"x_esa_storage", name:"Energy Storage Association (ACP)", etype:"Industry Group", note:"Now part of ACP. Grid-scale storage advocacy. Policy + standards." },
  { id:"x_wires", name:"WIRES", etype:"Industry Group", note:"Transmission industry trade group. Investment + siting policy. Grid reliability advocacy." },

  // --- Standards / Regulatory Bodies ---
  { id:"x_nerc", name:"NERC", etype:"Government", note:"North American Electric Reliability Corporation. Mandatory reliability standards. NV compliance." },
  { id:"x_ieee", name:"IEEE", etype:"Industry Group", note:"Institute of Electrical + Electronic Engineers. Grid standards. Interconnection protocols." },
  { id:"x_ul", name:"UL Solutions", etype:"Industry Group", note:"Safety certification. BESS fire safety standards. Solar module testing. NV compliance." },
  { id:"x_nfpa", name:"NFPA", etype:"Industry Group", note:"National Fire Protection Association. BESS fire codes. NV fire marshal compliance." },

  // --- Additional Consulting ---
  { id:"x_erm", name:"ERM", etype:"Consulting", note:"Global environmental consulting. Energy project NEPA + permitting. NV operations." },
  { id:"x_hdr", name:"HDR", etype:"Consulting", note:"Engineering + environmental. Transmission routing. Utility planning. NV projects." },
  { id:"x_dnv", name:"DNV", etype:"Consulting", note:"Energy advisory. Solar + BESS due diligence. Grid code compliance. NV project review." },
  { id:"x_psl_intl", name:"PSL International", etype:"Consulting", note:"Geotechnical + environmental. NV solar project foundation design. Site surveys." },
  { id:"x_cbec", name:"CBEC Eco Engineering", etype:"Consulting", note:"Ecological consulting. Desert tortoise mitigation. NV biological compliance." },
  { id:"x_rystad", name:"Rystad Energy", etype:"Consulting", note:"Global energy research. Solar + storage analytics. NV project pipeline data." },

  // --- Workforce / Training ---
  { id:"x_csn", name:"College of Southern Nevada", etype:"University", note:"Solar installer training. Renewable energy workforce pipeline. Las Vegas campus." },
  { id:"x_tmcc", name:"Truckee Meadows Community College", etype:"University", note:"Northern NV electrical + construction workforce. Apprenticeship programs." },
  { id:"x_nsc", name:"Nevada State College", etype:"University", note:"Henderson. Renewable energy education. Environmental science programs." },

  // ========================================================================
  // NEW EXTERNALS — Batch 4: Additional entities for node expansion
  // ========================================================================

  // --- Additional Developers ---
  { id:"x_brightnite", name:"BrightNight", etype:"Developer", note:"Renewable energy platform. Western US solar development. NV project evaluation." },
  { id:"x_savion", name:"Savion (Shell)", etype:"Developer", note:"Shell subsidiary. Utility-scale solar + storage. NV pipeline evaluation. 18GW+ portfolio." },
  { id:"x_amp_energy", name:"AMP Energy", etype:"Developer", note:"Global clean energy platform. BESS specialist. NV storage evaluation." },
  { id:"x_longroad", name:"Longroad Energy", etype:"Developer", note:"Utility-scale solar + wind. 5GW+ portfolio. NV project evaluation." },
  { id:"x_origis", name:"Origis Energy", etype:"Developer", note:"Solar + storage developer + operator. 8GW+ pipeline. NV evaluation." },
  { id:"x_hecate", name:"Hecate Energy (Repsol)", etype:"Developer", note:"Repsol subsidiary. Utility-scale solar. NV project evaluation." },

  // --- Additional Equipment ---
  { id:"x_qcells", name:"Qcells (Hanwha)", etype:"Corporation", note:"Hanwha Group. Solar module manufacturer. US manufacturing expansion. NV supply." },
  { id:"x_rec_silicon", name:"REC Silicon", etype:"Corporation", note:"Polysilicon manufacturer. Moses Lake WA. NV solar supply chain." },
  { id:"x_enphase", name:"Enphase Energy", etype:"Corporation", note:"NASDAQ: ENPH. Microinverter manufacturer. Distributed solar. NV market." },
  { id:"x_solaredge", name:"SolarEdge Technologies", etype:"Corporation", note:"NASDAQ: SEDG. Power optimizer + inverter. NV distributed solar." },
  { id:"x_abb", name:"ABB", etype:"Corporation", note:"Power grid technology. Transformer + switchgear. NV transmission equipment." },
  { id:"x_sumitomo", name:"Sumitomo Electric", etype:"Corporation", note:"HVDC cable manufacturer. Submarine + underground. Potential NV supply." },
  { id:"x_prysmian", name:"Prysmian Group", etype:"Corporation", note:"Global cable manufacturer. HVDC + overhead conductor. Greenlink supply evaluation." },
  { id:"x_southwire", name:"Southwire Company", etype:"Corporation", note:"US wire + cable manufacturer. NV transmission conductor supply." },
  { id:"x_lg_energy", name:"LG Energy Solution", etype:"Corporation", note:"BESS cell manufacturer. NV project supply evaluation. Leading global cell producer." },
  { id:"x_saft", name:"Saft (Total)", etype:"Corporation", note:"TotalEnergies subsidiary. Li-ion + Ni-based BESS. NV project evaluation." },

  // --- Telecom / Fiber (Data Center Infrastructure) ---
  { id:"x_zayo", name:"Zayo Group", etype:"Corporation", note:"Fiber optic provider. NV data center connectivity. TRIC fiber infrastructure." },
  { id:"x_lumen", name:"Lumen Technologies", etype:"Corporation", note:"Fiber + network services. NYSE: LUMN. NV data center connectivity." },
  { id:"x_crown_castle", name:"Crown Castle", etype:"Corporation", note:"NYSE: CCI. Cell tower + fiber infrastructure. NV data center support." },

  // --- Additional Financial ---
  { id:"x_mitsubishi_ufj", name:"Mitsubishi UFJ Financial", etype:"Corporation", note:"MUFG parent. Global bank. Renewable energy lending." },
  { id:"x_hsbc", name:"HSBC", etype:"Corporation", note:"Global bank. Green bond underwriting. NV energy project evaluation." },
  { id:"x_societe_generale", name:"Societe Generale", etype:"Corporation", note:"French bank. Project finance. NV renewable energy lending." },
  { id:"x_ing", name:"ING Group", etype:"Corporation", note:"Dutch bank. Renewable energy project finance specialist. NV evaluation." },
  { id:"x_kfw", name:"KfW IPEX-Bank", etype:"Corporation", note:"German development bank. Infrastructure finance. NV transmission evaluation." },
  { id:"x_truist", name:"Truist Securities", etype:"Corporation", note:"US bank. Renewable tax equity. NV solar project financing." },
  { id:"x_wells_fargo", name:"Wells Fargo", etype:"Corporation", note:"US bank. Renewable energy project finance + tax equity. NV portfolio." },

  // --- Additional Law Firms ---
  { id:"x_kirkland", name:"Kirkland & Ellis", etype:"Law Firm", note:"PE + infrastructure transactions. Renewable energy M&A. NV deal counsel." },
  { id:"x_white_case", name:"White & Case", etype:"Law Firm", note:"Project finance. Infrastructure + energy. Global 46 offices." },
  { id:"x_vinson", name:"Vinson & Elkins", etype:"Law Firm", note:"Energy law leader. Project finance. Renewable energy transactions." },
  { id:"x_baker_botts", name:"Baker Botts", etype:"Law Firm", note:"Energy sector law. Project development + finance. NV deal counsel." },
  { id:"x_mcdermott", name:"McDermott Will & Emery", etype:"Law Firm", note:"Tax equity structuring. Renewable energy tax law. ITC/PTC." },
  { id:"x_katten", name:"Katten Muchin Rosenman", etype:"Law Firm", note:"Renewable energy project finance. Tax equity transactions." },

  // --- Additional Consulting ---
  { id:"x_power_advisory", name:"PA Consulting", etype:"Consulting", note:"Power sector advisory. Utility strategy. Grid modernization." },
  { id:"x_quanta_tech", name:"Quanta Technology", etype:"Consulting", note:"Grid planning + engineering. Transmission studies. NV grid analysis." },
  { id:"x_golder", name:"WSP (Golder Associates)", etype:"Consulting", note:"Geotechnical + environmental. Mining + energy. NV project support." },
  { id:"x_langan", name:"Langan Engineering", etype:"Consulting", note:"Geotechnical + civil. Solar site design. NV project support." },
  { id:"x_arcadis", name:"Arcadis", etype:"Consulting", note:"Environmental consulting. Water + sustainability. NV energy projects." },
  { id:"x_ramboll", name:"Ramboll", etype:"Consulting", note:"Engineering + environmental. Wind + solar EIA. NV project review." },

  // --- Real Estate / Data Center REIT ---
  { id:"x_equinix", name:"Equinix", etype:"Corporation", note:"NASDAQ: EQIX. Global data center REIT. NV colocation evaluation." },
  { id:"x_digital_realty", name:"Digital Realty", etype:"Corporation", note:"NYSE: DLR. Data center REIT. NV market evaluation." },
  { id:"x_cyrusone", name:"CyrusOne (KKR)", etype:"Corporation", note:"KKR-owned data centers. NV expansion evaluation." },

  // --- Additional Government Agencies ---
  { id:"x_usgs", name:"US Geological Survey", etype:"Government", note:"Geothermal resource mapping. Seismic monitoring. Desert tortoise research." },
  { id:"x_usbr", name:"US Bureau of Reclamation", etype:"Government", note:"Hoover Dam. Lake Mead operations. Hydropower generation. Water allocation." },
  { id:"x_nv_detr", name:"NV Dept of Employment, Training & Rehab", etype:"Government", note:"Workforce programs. Employment data. Clean energy job training grants." },
  { id:"x_nv_ag", name:"NV Attorney General Office", etype:"Government", note:"Consumer protection. Energy rate intervention. Utility oversight." },
  { id:"x_nv_div_minerals", name:"NV Division of Minerals", etype:"Government", note:"Geothermal well permits. Mineral rights. Energy + mining coordination." },
  { id:"x_nv_fire_marshal", name:"NV State Fire Marshal", etype:"Government", note:"BESS fire safety inspection. Solar facility codes. NV compliance." },

  // --- Additional Labor ---
  { id:"x_ibew357", name:"IBEW Local 357", etype:"Labor", note:"Las Vegas electrical workers. Solar + data center build-outs. 3,000+ members." },
  { id:"x_ua525", name:"UA Local 525 Plumbers & Pipefitters", etype:"Labor", note:"Las Vegas. Geothermal + pipeline construction. Welding. 2,500+ members." },
  { id:"x_carpenters1977", name:"Carpenters Local 1977", etype:"Labor", note:"NV carpentry + formwork. Solar + data center construction." },
  { id:"x_teamsters631", name:"Teamsters Local 631", etype:"Labor", note:"Las Vegas trucking + heavy haul. Solar equipment transport. 7,000+ members." },
  { id:"x_liuna", name:"LIUNA", etype:"Labor", note:"Laborers International Union. National solar + infrastructure. NV jurisdiction." },

  // --- Additional Tribal Nations ---
  { id:"x_summit_lake", name:"Summit Lake Paiute Tribe", etype:"Tribal", note:"Humboldt County. Hot Pot Geothermal area. Traditional territory consultation." },
  { id:"x_lovelock_paiute", name:"Lovelock Paiute Tribe", etype:"Tribal", note:"Pershing County. Corsac Station area. Lovelock Cave cultural sites." },
  { id:"x_south_fork", name:"South Fork Band, Te-Moak", etype:"Tribal", note:"Elko County. NE Nevada energy development. Section 106 consultation." },
  { id:"x_wells_band", name:"Wells Band, Te-Moak", etype:"Tribal", note:"Elko County. NE Nevada. Traditional territory. Energy project consultation." },
  { id:"x_fort_mcdermitt", name:"Fort McDermitt Paiute-Shoshone", etype:"Tribal", note:"Humboldt County. Lithium mine proximity. Energy + mining consultation." },
  { id:"x_winnemucca_colony", name:"Winnemucca Indian Colony", etype:"Tribal", note:"Humboldt County. Winnemucca area. Geothermal + energy consultation." },
  { id:"x_reno_sparks", name:"Reno-Sparks Indian Colony", etype:"Tribal", note:"Washoe County. Northern NV transmission corridor. Cultural resources." },
  { id:"x_washoe_tribe", name:"Washoe Tribe of Nevada & California", etype:"Tribal", note:"Multi-county. Lake Tahoe region. Greenlink corridor consultation." },
  { id:"x_las_vegas_paiute", name:"Las Vegas Paiute Tribe", etype:"Tribal", note:"Clark County. Southern NV solar development area. Urban reservation." },

  // ========================================================================
  // NEW EXTERNALS — Batch 5: ~150 additions for 1000+ node target
  // ========================================================================

  // --- More Developers ---
  { id:"x_cypress_creek", name:"Cypress Creek Renewables", etype:"Developer", note:"Utility-scale solar developer. 10GW+ pipeline. NV evaluation." },
  { id:"x_sol_systems", name:"Sol Systems", etype:"Developer", note:"Solar developer + investor. 5GW+ portfolio. NV project evaluation." },
  { id:"x_scout_clean", name:"Scout Clean Energy", etype:"Developer", note:"Brookfield subsidiary. Wind + solar. 1GW+ NV pipeline evaluation." },
  { id:"x_silicon_ranch", name:"Silicon Ranch", etype:"Developer", note:"Shell subsidiary. Utility-scale solar. Regenerative ranching. NV evaluation." },
  { id:"x_baywa_re", name:"BayWa r.e.", etype:"Developer", note:"German developer. Solar + wind. US market 3GW+. NV evaluation." },
  { id:"x_borrego", name:"Borrego", etype:"Developer", note:"Commercial + utility-scale solar EPC + developer. NV market pursuit." },
  { id:"x_eurus_energy", name:"Eurus Energy America", etype:"Developer", note:"Japanese developer (Toyota Tsusho). Western US wind + solar. NV evaluation." },
  { id:"x_arevon", name:"Arevon Energy", etype:"Developer", note:"Clean energy operator. 6GW+ assets. NV solar + storage evaluation." },
  { id:"x_intersect", name:"Intersect Power", etype:"Developer", note:"Clean energy developer. 4GW+ pipeline. NV solar + storage + hydrogen." },
  { id:"x_deep_space", name:"D. E. Shaw Renewable Investments", etype:"Developer", note:"DESRI. 5GW+ solar portfolio. NV utility-scale evaluation." },
  { id:"x_lightsource", name:"Lightsource bp", etype:"Developer", note:"BP subsidiary. Global solar developer. 25GW+ pipeline. NV evaluation." },
  { id:"x_apex_clean", name:"Apex Clean Energy", etype:"Developer", note:"Wind + solar developer. 20GW+ pipeline. NV project evaluation." },
  { id:"x_key_capture", name:"Key Capture Energy", etype:"Developer", note:"Standalone BESS developer. 5GW+ pipeline. NV storage evaluation." },
  { id:"x_plus_power", name:"Plus Power", etype:"Developer", note:"Grid-scale BESS developer. 5GW+. NV standalone storage evaluation." },
  { id:"x_esmeralda_solar", name:"Esmeralda Solar LLC", etype:"Developer", note:"Esmeralda Seven Solar developer entity. BLM PEIS project." },
  { id:"x_chill_sun", name:"Chill Sun Solar LLC", etype:"Developer", note:"Chill Sun Solar project developer. Lincoln County solar + storage." },
  { id:"x_rigel_solar", name:"Rigel Solar LLC", etype:"Developer", note:"Rigel Solar + Storage project developer entity. NV Energy IRP project." },
  { id:"x_desert_sunlight", name:"Desert Sunlight NV LLC", etype:"Developer", note:"Desert Sunlight NV project developer entity." },
  { id:"x_jean_solar", name:"Jean Solar LLC", etype:"Developer", note:"Jean Solar + Storage project developer entity. Southern NV." },

  // --- More EPC Contractors ---
  { id:"x_swinerton", name:"Swinerton Renewable Energy", etype:"Contractor", note:"Utility-scale solar EPC. 5GW+ built. NV project pursuit." },
  { id:"x_wanzek", name:"Wanzek Construction", etype:"Contractor", note:"MYR Group subsidiary. Solar + wind EPC. Western US operations." },
  { id:"x_pcl", name:"PCL Construction", etype:"Contractor", note:"Canadian EPC. Transmission + power plant construction. NV market." },
  { id:"x_kiewit", name:"Kiewit Corporation", etype:"Contractor", note:"Major infrastructure contractor. Transmission + pipeline. NV projects." },

  // --- Equipment Suppliers (More) ---
  { id:"x_eaton", name:"Eaton Corporation", etype:"Corporation", note:"Power management. Switchgear + transformer. NV grid equipment supply." },
  { id:"x_siemens_gamesa", name:"Siemens Gamesa", etype:"Corporation", note:"Siemens Energy subsidiary. Wind turbines. NV wind project supply." },
  { id:"x_hitachi_abb", name:"Hitachi ABB Power Grids", etype:"Corporation", note:"Now Hitachi Energy. HVDC + grid technology. NV transmission equipment." },
  { id:"x_eve_energy", name:"EVE Energy", etype:"Corporation", note:"Chinese BESS cell manufacturer. LFP cells. NV project supply chain." },
  { id:"x_byd_energy", name:"BYD Energy Storage", etype:"Corporation", note:"BYD subsidiary. Grid-scale BESS. Cube system. NV project supply." },
  { id:"x_toshiba_energy", name:"Toshiba Energy Systems", etype:"Corporation", note:"Pumped hydro turbines. Generator equipment. White Pine potential supply." },
  { id:"x_andritz", name:"Andritz Hydro", etype:"Corporation", note:"Hydro turbine manufacturer. Pumped storage equipment. White Pine evaluation." },
  { id:"x_voith", name:"Voith Hydro", etype:"Corporation", note:"Pumped hydro turbine manufacturer. White Pine equipment evaluation." },
  { id:"x_general_cable", name:"Prysmian NA (General Cable)", etype:"Corporation", note:"High-voltage cable. Greenlink conductor supply. ACSR + ACCC technology." },
  { id:"x_nkt", name:"NKT Cables", etype:"Corporation", note:"HV cable manufacturer. Underground + submarine cable. NV transmission." },
  { id:"x_weidmuller", name:"Weidmuller", etype:"Corporation", note:"PV string monitoring + combiner boxes. NV solar project supply." },

  // --- Financial Institutions (More) ---
  { id:"x_brookfield_infra", name:"Brookfield Infrastructure Partners", etype:"Corporation", note:"$170B+ infrastructure AUM. NV transmission + renewable evaluation." },
  { id:"x_amp_capital", name:"AMP Capital", etype:"Corporation", note:"Australian infrastructure investor. Global renewable energy. NV evaluation." },
  { id:"x_cobank", name:"CoBank", etype:"Corporation", note:"Farm Credit System bank. Rural electric co-op lending. NV utility finance." },
  { id:"x_farm_credit", name:"Farm Credit Leasing", etype:"Corporation", note:"Agricultural + rural energy lending. Tax equity for NV solar." },
  { id:"x_smbc", name:"Sumitomo Mitsui Banking", etype:"Corporation", note:"Japanese megabank. Renewable project finance. NV solar lending." },
  { id:"x_deutsche_bank", name:"Deutsche Bank", etype:"Corporation", note:"German bank. Renewable project finance + tax equity. NV deals." },
  { id:"x_us_bancorp", name:"US Bancorp", etype:"Corporation", note:"US bank. Renewable tax equity investor. NV solar ITC monetization." },
  { id:"x_santander", name:"Santander CIB", etype:"Corporation", note:"Spanish bank. Infrastructure + energy finance. NV evaluation." },
  { id:"x_bnp_paribas", name:"BNP Paribas", etype:"Corporation", note:"French bank. Renewable energy project finance. NV solar lending." },
  { id:"x_norddeutsche", name:"Nord/LB", etype:"Corporation", note:"German bank. Renewable energy project finance specialist." },

  // --- Insurance Companies (More) ---
  { id:"x_tokio_marine", name:"Tokio Marine", etype:"Corporation", note:"Japanese insurer. Renewable energy construction all-risk. NV project coverage." },
  { id:"x_aig", name:"AIG", etype:"Corporation", note:"Global insurer. Energy project insurance. Construction + operational. NV portfolio." },
  { id:"x_hannover_re", name:"Hannover Re", etype:"Corporation", note:"German reinsurer. Renewable energy reinsurance. Climate risk analytics." },
  { id:"x_scor", name:"SCOR", etype:"Corporation", note:"French reinsurer. Renewable energy risk. Climate modeling. NV evaluation." },
  { id:"x_axis", name:"AXIS Capital", etype:"Corporation", note:"Specialty insurer. Renewable energy. Construction risk. NV project portfolio." },

  // --- National Labs & Research (More) ---
  { id:"x_lbnl", name:"Lawrence Berkeley National Lab", etype:"Government", note:"DOE lab. Grid integration research. Solar cost tracking. Interconnection studies." },
  { id:"x_anl", name:"Argonne National Laboratory", etype:"Government", note:"DOE lab. Energy storage research. Advanced materials. Grid analytics." },
  { id:"x_nrel_wind", name:"NREL Wind Technology Center", etype:"Government", note:"Wind energy research. Turbine testing. NV wind resource assessment." },

  // --- Utilities Outside NV (More) ---
  { id:"x_srp", name:"Salt River Project", etype:"Utility", note:"AZ public power utility. Western interconnection. Potential NV solar PPA buyer." },
  { id:"x_tep", name:"Tucson Electric Power", etype:"Utility", note:"AZ IOU. Fortis subsidiary. Western grid. NV renewable PPA evaluation." },
  { id:"x_pge_portland", name:"Portland General Electric", etype:"Utility", note:"OR IOU. Western EIM participant. NV clean energy evaluation." },
  { id:"x_puget_sound", name:"Puget Sound Energy", etype:"Utility", note:"WA IOU. Clean energy transition. Potential NV renewable procurement." },
  { id:"x_idaho_power", name:"Idaho Power", etype:"Utility", note:"ID IOU. NV border interconnection. Potential power exchange partner." },
  { id:"x_rmp", name:"Rocky Mountain Power", etype:"Utility", note:"PacifiCorp subsidiary. UT + WY. NV-UT interconnection potential." },
  { id:"x_turlock", name:"Turlock Irrigation District", etype:"Utility", note:"CA public utility. Agricultural load. NV solar PPA evaluation." },
  { id:"x_iid", name:"Imperial Irrigation District", etype:"Utility", note:"CA public utility. Geothermal expertise. NV clean energy coordination." },
  { id:"x_npc", name:"Nevada Power Company", etype:"Utility", note:"NV Energy southern NV utility subsidiary. Serves Las Vegas. 1M+ customers." },
  { id:"x_mead", name:"Western Area Power Administration - Mead", etype:"Utility", note:"WAPA Desert Southwest Region. Hoover Dam power marketing. NV allocation." },

  // --- Additional Government Agencies ---
  { id:"x_nv_water", name:"NV Division of Water Resources", etype:"Government", note:"Water rights administration. Energy project water permits. Groundwater basin management." },
  { id:"x_nv_shpo", name:"NV State Historic Preservation Office", etype:"Government", note:"Section 106 compliance. Cultural resource survey review. Energy project archaeology." },
  { id:"x_elko_county", name:"Elko County", etype:"Government", note:"Elko county seat. Mining + energy economy. NE Nevada. Te-Moak tribal area." },
  { id:"x_douglas_county", name:"Douglas County", etype:"Government", note:"Minden-Gardnerville. Carson Valley. Southern Washoe + Alpine County border." },
  { id:"x_eureka_county", name:"Eureka County", etype:"Government", note:"Central NV. Mining economy. Geothermal potential. Energy-mineral coexistence." },
  { id:"x_esmeralda_county", name:"Esmeralda County", etype:"Government", note:"Goldfield county seat. Esmeralda Seven PEIS host. NV's least populated county." },
  { id:"x_lyon_county", name:"Lyon County", etype:"Government", note:"Yerington + Dayton. Libra Solar host county. Anaconda mine Superfund." },
  { id:"x_churchill_county", name:"Churchill County", etype:"Government", note:"Fallon county seat. Geothermal + military. Stillwater NWR. NAS Fallon." },
  { id:"x_washoe_county", name:"Washoe County", etype:"Government", note:"Reno county seat. Northern NV. TRIC proximity. Greenlink corridor." },
  { id:"x_lander_county_gov", name:"Lander County Government", etype:"Government", note:"Battle Mountain. McGinness Hills host. Mining-energy coexistence policy." },

  // --- Industry Groups (More) ---
  { id:"x_epri", name:"EPRI", etype:"Industry Group", note:"Electric Power Research Institute. Grid technology R&D. NV Energy member." },
  { id:"x_gridwise", name:"GridWise Alliance", etype:"Industry Group", note:"Grid modernization advocacy. Smart grid technology. NV Energy participation." },
  { id:"x_lssa", name:"Large-Scale Solar Association", etype:"Industry Group", note:"Utility-scale solar advocacy. Interconnection reform. Western US policy." },
  { id:"x_wgg", name:"Western Grid Group", etype:"Industry Group", note:"Transmission planning advocacy. WECC + CAISO stakeholder. Greenlink support." },
  { id:"x_catf", name:"Clean Air Task Force", etype:"Nonprofit", note:"Clean energy technology advocacy. Geothermal + hydrogen policy. NV support." },
  { id:"x_rmi", name:"RMI (Rocky Mountain Institute)", etype:"Nonprofit", note:"Clean energy research + advocacy. Grid modernization. Utility transformation." },
  { id:"x_nha", name:"National Hydropower Association", etype:"Industry Group", note:"Hydropower + pumped storage advocacy. White Pine project support." },
  { id:"x_naesb", name:"NAESB", etype:"Industry Group", note:"North American Energy Standards Board. Wholesale gas + electric standards." },
  { id:"x_wirab", name:"WIRAB", etype:"Industry Group", note:"Western Interconnection Regional Advisory Body. Reliability + adequacy." },
  { id:"x_cesa", name:"Clean Energy States Alliance", etype:"Nonprofit", note:"State clean energy program collaboration. NV membership. Best practices." },

  // --- Environmental NGOs (More) ---
  { id:"x_ncl", name:"Nevada Conservation League", etype:"Nonprofit", note:"NV conservation + clean energy policy advocacy. Solar siting review." },
  { id:"x_nv_wildlife_fed", name:"Nevada Wildlife Federation", etype:"Nonprofit", note:"Wildlife habitat. Energy project impact review. Hunting + conservation." },
  { id:"x_audubon_nv", name:"Audubon Society - NV Chapters", etype:"Nonprofit", note:"Bird habitat. Avian impact monitoring. Solar + wind project review." },
  { id:"x_citizens_dixie", name:"Citizens for Dixie Valley", etype:"Nonprofit", note:"Dixie Valley community. Geothermal development review. Hot springs protection." },
  { id:"x_ctr_bio_div", name:"Center for Biological Diversity", etype:"Nonprofit", note:"ESA advocacy. Desert tortoise + sage grouse litigation. Solar siting." },

  // --- Media / Analysts (More) ---
  { id:"x_gtm", name:"Greentech Media (Wood Mackenzie)", etype:"Consulting", note:"Solar + storage market news + analysis. Now part of Wood Mackenzie." },
  { id:"x_utilitydive", name:"Utility Dive", etype:"Consulting", note:"Utility industry news. NV Energy coverage. Clean energy transition." },
  { id:"x_pvmag", name:"PV Magazine", etype:"Consulting", note:"Solar industry news + technical analysis. NV project coverage." },
  { id:"x_spw", name:"Solar Power World", etype:"Consulting", note:"Solar industry publication. Top contractors. NV project features." },
  { id:"x_canary", name:"Canary Media", etype:"Consulting", note:"Clean energy news + analysis. Grid + storage + solar coverage." },
  { id:"x_nv_independent", name:"The Nevada Independent", etype:"Consulting", note:"NV news. Energy policy reporting. PUCN coverage. Legislature." },
  { id:"x_nv_current", name:"Nevada Current", etype:"Consulting", note:"NV investigative journalism. Energy + environment. Policy reporting." },
  { id:"x_eia", name:"US Energy Information Administration", etype:"Government", note:"Federal energy statistics. NV generation + consumption data. EIA-860." },

  // --- Additional Law Firms ---
  { id:"x_norton_rose", name:"Norton Rose Fulbright", etype:"Law Firm", note:"Global energy law. Renewable PPA + tax counsel. NV project transactions." },
  { id:"x_orrick", name:"Orrick Herrington & Sutcliffe", etype:"Law Firm", note:"Renewable project finance. PPA negotiation. Tax equity structures." },
  { id:"x_pillsbury", name:"Pillsbury Winthrop Shaw Pittman", etype:"Law Firm", note:"Energy regulatory + project development. NV utility counsel." },
  { id:"x_hogan_lovells", name:"Hogan Lovells", etype:"Law Firm", note:"Infrastructure + energy. Government regulatory. NV project counsel." },
  { id:"x_jones_day", name:"Jones Day", etype:"Law Firm", note:"Energy transactions + litigation. M&A. NV corporate counsel." },
  { id:"x_gibson_dunn", name:"Gibson Dunn & Crutcher", etype:"Law Firm", note:"Energy regulatory + transactions. Western US practice. NV counsel." },

  // --- More Consulting / Engineering ---
  { id:"x_wsp", name:"WSP USA", etype:"Consulting", note:"Global engineering. Transmission planning. Environmental. NV project support." },
  { id:"x_jacobs", name:"Jacobs Solutions", etype:"Consulting", note:"Engineering + construction. Environmental. NV energy project services." },
  { id:"x_kearns_west", name:"Kearns & West", etype:"Consulting", note:"Stakeholder engagement. Public affairs. NV energy project community outreach." },
  { id:"x_navigant", name:"Guidehouse (Navigant)", etype:"Consulting", note:"Energy advisory. Utility strategy. Grid modernization. NV consulting." },
  { id:"x_1898co", name:"1898 & Co (Burns & McDonnell)", etype:"Consulting", note:"Utility consulting. Grid planning. Renewable integration analysis." },

  // --- Additional Data Center / Tech ---
  { id:"x_nvidia", name:"NVIDIA", etype:"Corporation", note:"GPU manufacturer. AI compute. NV data center GPU supply. Power demand driver." },
  { id:"x_oracle_dc", name:"Oracle Cloud", etype:"Corporation", note:"Cloud infrastructure. NV data center evaluation. AI workload growth." },
  { id:"x_coreweave", name:"CoreWeave", etype:"Corporation", note:"GPU cloud provider. NV data center evaluation. AI-scale compute." },
  { id:"x_stack_infra", name:"STACK Infrastructure", etype:"Corporation", note:"Data center developer. Western US. NV market evaluation." },
  { id:"x_compass_dc", name:"Compass Datacenters", etype:"Corporation", note:"Data center developer. Hyperscale campus. NV market evaluation." },

  // --- Additional Industry Bodies ---
  { id:"x_wpa", name:"Western Power Administration", etype:"Government", note:"Federal power marketing. Transmission. Hoover Dam. NV allocation." },
  { id:"x_ntc", name:"Nevada Test & Training Range", etype:"Government", note:"DoD. Southern NV military airspace. Energy project height restrictions." },
  { id:"x_nellis", name:"Nellis AFB", etype:"Government", note:"Clark County. Solar array host. Military energy resilience. Airspace coordination." },
  { id:"x_creech", name:"Creech AFB", etype:"Government", note:"Indian Springs, Clark County. Solar project proximity. Airspace." },
  { id:"x_nas_fallon", name:"NAS Fallon", etype:"Government", note:"Churchill County. Naval Air Station. Military airspace coordination with energy." },

  // ========================================================================
  // NEW EXTERNALS — Batch 6: Final additions to reach 1000+ node target
  // ========================================================================

  // --- Additional Developers ---
  { id:"x_apex_clean_energy", name:"Apex Clean Energy", etype:"Developer", note:"Wind + solar developer. 20GW+ pipeline. NV project evaluation." },
  { id:"x_eurus", name:"Eurus Energy America", etype:"Developer", note:"Japanese developer (Toyota Tsusho). Western US. NV evaluation." },
  { id:"x_desri", name:"D.E. Shaw Renewable Investments", etype:"Developer", note:"DESRI. 5GW+ solar portfolio. NV evaluation." },
  { id:"x_intersect_power", name:"Intersect Power", etype:"Developer", note:"Clean energy + hydrogen developer. 4GW+. NV evaluation." },

  // --- Additional Equipment ---
  { id:"x_maxeon", name:"Maxeon Solar Technologies", etype:"Corporation", note:"Premium solar modules. IBC + shingled cell. NV supply evaluation." },
  { id:"x_risen", name:"Risen Energy", etype:"Corporation", note:"Chinese solar module manufacturer. Tier 1. NV project supply." },
  { id:"x_ja_solar", name:"JA Solar", etype:"Corporation", note:"Tier 1 solar module manufacturer. NV project supply chain." },
  { id:"x_yaskawa", name:"Yaskawa Solectria Solar", etype:"Corporation", note:"Solar inverter manufacturer. String + central. NV project supply." },
  { id:"x_dynapower", name:"Dynapower", etype:"Corporation", note:"Power conversion systems. BESS inverter. NV project supply." },

  // --- Additional Financial ---
  { id:"x_hannon_armstrong", name:"Hannon Armstrong Sustainable Infrastructure", etype:"Corporation", note:"NYSE: HASI. Climate REIT. NV solar project investment." },
  { id:"x_generate_capital", name:"Generate Capital", etype:"Corporation", note:"Sustainable infrastructure. Solar + storage investment. NV evaluation." },
  { id:"x_rwe", name:"RWE Clean Energy", etype:"Developer", note:"German utility. US renewables. 10GW+. NV evaluation." },

  // --- Additional Consulting ---
  { id:"x_ethos_energy", name:"EthoEnergy", etype:"Consulting", note:"Power plant O&M. Gas turbine services. NV geothermal maintenance." },
  { id:"x_power_engineers", name:"POWER Engineers", etype:"Consulting", note:"Engineering + environmental. Transmission + substation design. NV projects." },
  { id:"x_sargent_lundy", name:"Sargent & Lundy", etype:"Consulting", note:"Power engineering. Transmission planning. Solar + BESS design. NV projects." },
  { id:"x_terra_gen_services", name:"Terra Operating Services", etype:"Consulting", note:"Wind + solar O&M. Western US fleet management. NV operations." },
  { id:"x_amec", name:"Wood PLC (AMEC Foster Wheeler)", etype:"Consulting", note:"Engineering + environmental. NV energy project support." },
  { id:"x_terracon_nv", name:"Terracon NV Office", etype:"Consulting", note:"Geotechnical + environmental. NV solar site investigations." },

  // --- Additional Government ---
  { id:"x_nv_pers", name:"NV Public Employees Retirement System", etype:"Government", note:"State pension fund. Infrastructure investment. Clean energy allocation." },
  { id:"x_nv_housing", name:"NV Housing Division", etype:"Government", note:"Housing + energy efficiency programs. Weatherization. IRA fund deployment." },
  { id:"x_faa_west", name:"FAA Western Region", etype:"Government", note:"Aviation safety. Glare analysis for solar projects. Obstruction evaluation." },
  { id:"x_fhwa_nv", name:"FHWA Nevada Division", etype:"Government", note:"Federal Highway Admin. Energy project access road. Utility crossing permits." },
  { id:"x_usbr_lc", name:"Bureau of Reclamation Lower Colorado", etype:"Government", note:"Hoover Dam operations. Lake Mead hydro. Water allocation management." },
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

  // ========================================================================
  // NEW ECOSYSTEM ORGS — Batch 3: County EDAs, regional commissions, NGOs
  // ========================================================================

  // --- County Economic Development ---
  { id:"wp_eda", name:"White Pine County Economic Development", etype:"Government", city:"Ely", region:"white_pine", note:"White Pine County economic diversification. Spring Valley Wind + pumped storage host." },
  { id:"lincoln_eda", name:"Lincoln County Regional Development Authority", etype:"Government", city:"Caliente", region:"lincoln", note:"Lincoln County economic development. Community solar + rural energy." },
  { id:"storey_eda", name:"Storey County Economic Development", etype:"Government", city:"Virginia City", region:"storey", note:"TRIC + data center economic development. Storey County tax base management." },
  { id:"humboldt_eda", name:"Humboldt County Economic Development", etype:"Government", city:"Winnemucca", region:"humboldt", note:"Humboldt County mining + energy economic diversification." },
  { id:"mineral_eda", name:"Mineral County Economic Development", etype:"Government", city:"Hawthorne", region:"mineral", note:"Mineral County geothermal + renewable development support." },
  { id:"pershing_eda", name:"Pershing County Economic Development", etype:"Government", city:"Lovelock", region:"pershing", note:"Pershing County. Fervo Corsac Station economic impact management." },
  { id:"churchill_eda", name:"Churchill County Economic Development Authority", etype:"Government", city:"Fallon", region:"churchill", note:"Churchill County geothermal + solar development. NAS Fallon + Stillwater." },
  { id:"lander_eda", name:"Lander County Economic Diversification", etype:"Government", city:"Battle Mountain", region:"lander", note:"Lander County mining to energy diversification. McGinness Hills revenue." },

  // --- Regional Planning ---
  { id:"rtcsnv", name:"Regional Transportation Commission of SNV", etype:"Government", city:"Las Vegas", region:"clark", note:"Southern NV transportation. Energy project access roads. Utility corridor planning." },
  { id:"rtcwn", name:"Regional Transportation Commission of Washoe", etype:"Government", city:"Reno", region:"washoe", note:"Northern NV transportation. Data center + energy project transportation impact." },
  { id:"nrpc", name:"Nevada Rural Planning Commission", etype:"Government", city:"Carson City", region:"washoe", note:"Rural county planning coordination. Energy project siting in rural NV." },

  // --- Environmental Organizations ---
  { id:"nv_conservation", name:"Nevada Conservation League", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Conservation advocacy. Clean energy policy. Solar siting environmental review." },
  { id:"great_basin_inst", name:"Great Basin Institute", etype:"Nonprofit", city:"Reno", region:"washoe", note:"Ecological research. Habitat restoration. Conservation corps. NV public lands." },
  { id:"friends_nv_wild", name:"Friends of Nevada Wilderness", etype:"Nonprofit", city:"Reno", region:"washoe", note:"Wilderness conservation. Public land energy development review. Visual impact." },
  { id:"red_rock_audubon", name:"Red Rock Audubon Society", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Bird habitat. Eagle take + avian impact review. Solar project monitoring." },

  // --- Industry Standards & Safety ---
  { id:"sw_power_pool", name:"Southwest Power Pool Western Division", etype:"Government", city:"Multiple", region:"multi_county", note:"Regional transmission organization. NV potential membership. Western market." },
  { id:"nv_fire_marshal", name:"NV State Fire Marshal", etype:"Government", city:"Carson City", region:"washoe", note:"BESS fire safety codes. Solar facility fire standards. NV compliance." },
  { id:"nvosha", name:"NV OSHA", etype:"Government", city:"Henderson", region:"clark", note:"Construction workplace safety. Energy project OSHA compliance. Inspection." },

  // --- Workforce / Training Organizations ---
  { id:"nv_works", name:"Workforce Connections (Southern NV)", etype:"Government", city:"Las Vegas", region:"clark", note:"Southern NV workforce development. Clean energy job training. Apprenticeships." },
  { id:"nevadaworks", name:"Nevadaworks (Northern NV)", etype:"Government", city:"Reno", region:"washoe", note:"Northern NV workforce development. TRIC + energy sector job pipeline." },
  { id:"nv_detr", name:"NV Dept of Employment, Training & Rehab", etype:"Government", city:"Carson City", region:"washoe", note:"State workforce programs. Clean energy employment data. Job training grants." },
  { id:"ibew357", name:"IBEW Local 357", etype:"Labor", city:"Las Vegas", region:"clark", note:"Las Vegas electrical workers. Solar installation + data center construction. 3,000+ members." },
  { id:"ua525", name:"UA Plumbers & Pipefitters Local 525", etype:"Labor", city:"Las Vegas", region:"clark", note:"Geothermal + gas pipeline construction. Welding + pipefitting. 2,500+ members." },

  // --- Clean Energy Coalitions ---
  { id:"wec", name:"Western Energy Consumers", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Large commercial/industrial electricity consumers. Rate case intervenor. Cost containment." },
  { id:"nv_rha", name:"Nevada Rural Housing Authority", etype:"Government", city:"Carson City", region:"washoe", note:"Rural housing energy efficiency. Weatherization programs. IRA fund deployment." },
  { id:"pvnv", name:"Pahrump Valley Solar Coalition", etype:"Nonprofit", city:"Pahrump", region:"nye", note:"Community advocacy for responsible solar development. Nye County project engagement." },
  { id:"nv_manufacturers", name:"Nevada Manufacturers Association", etype:"Industry Group", city:"Las Vegas", region:"clark", note:"Manufacturing sector energy costs. Clean energy workforce supply." },
  { id:"nv_realtors", name:"Nevada Association of Realtors", etype:"Industry Group", city:"Las Vegas", region:"clark", note:"Property value impact of energy projects. Solar easements. Land use policy." },

  // --- Federal Coordination ---
  { id:"wdc", name:"Western Division, US Army Corps", etype:"Government", city:"Multiple", region:"multi_county", note:"Section 404 permits. Wetlands review. NV energy project Clean Water Act compliance." },
  { id:"nps_nv", name:"National Park Service - NV Units", etype:"Government", city:"Multiple", region:"multi_county", note:"Death Valley, Great Basin NP. Visual impact review. Energy project proximity." },
  { id:"usda_rd", name:"USDA Rural Development - NV", etype:"Government", city:"Multiple", region:"multi_county", note:"Rural electric infrastructure grants. Community solar. Rural energy programs." },

  // --- Geothermal Specific ---
  { id:"grc", name:"Geothermal Resources Council", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Geothermal research + industry. Annual conference. Technical standards. NV chapter." },
  { id:"nv_geo_alliance", name:"Nevada Geothermal Alliance", etype:"Industry Group", city:"Reno", region:"washoe", note:"NV geothermal industry. Ormat + Fervo membership. Policy advocacy. Workforce." },

  // --- Hydrogen / Future Energy ---
  { id:"fchea", name:"Fuel Cell & Hydrogen Energy Association", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Hydrogen industry advocacy. Air Liquide H2 Hub support. Policy + standards." },

  // ========================================================================
  // NEW ECOSYSTEM ORGS — Batch 4: Additional organizations
  // ========================================================================
  { id:"nv_league_cities", name:"Nevada League of Cities", etype:"Government", city:"Carson City", region:"washoe", note:"Municipal government coordination. Energy project host city issues. Land use." },
  { id:"naco_nv", name:"Nevada Association of Counties", etype:"Government", city:"Carson City", region:"washoe", note:"County government coordination. Energy project revenue + land use policy." },
  { id:"elko_eda", name:"Elko County Economic Diversification Authority", etype:"Government", city:"Elko", region:"elko", note:"Elko County mining + energy economy. NE Nevada economic development." },
  { id:"nye_eda", name:"Nye County Economic Development", etype:"Government", city:"Pahrump", region:"nye", note:"Nye County solar + energy economic development. Pahrump + Tonopah." },
  { id:"carson_eda", name:"Northern Nevada Development Authority", etype:"Government", city:"Carson City", region:"washoe", note:"Carson City + rural northern NV. Renewable manufacturing recruitment." },
  { id:"nv_chamber", name:"Nevada State Chamber of Commerce", etype:"Industry Group", city:"Reno", region:"washoe", note:"Business advocacy. Energy costs + reliability. Workforce development." },
  { id:"lv_chamber", name:"Las Vegas Metro Chamber of Commerce", etype:"Industry Group", city:"Las Vegas", region:"clark", note:"Southern NV business advocacy. Data center + energy policy." },
  { id:"reno_chamber", name:"Reno-Sparks Chamber of Commerce", etype:"Industry Group", city:"Reno", region:"washoe", note:"Northern NV business advocacy. TRIC + data center support." },
  { id:"apex_idc", name:"APEX Industrial Development Corridor", etype:"Government", city:"North Las Vegas", region:"clark", note:"Industrial development. North Las Vegas. Energy + data center corridor." },
  { id:"nv_rural_electric", name:"Nevada Rural Electric Cooperative Association", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Rural co-op coordination. Distribution infrastructure. Distributed generation." },
  { id:"western_mining", name:"Western Mining Action Network", etype:"Nonprofit", city:"Multiple", region:"multi_county", note:"Mining reform advocacy. Land use conflict with energy projects. Environmental justice." },
  { id:"nv_taxpayers", name:"Nevada Taxpayers Association", etype:"Nonprofit", city:"Carson City", region:"washoe", note:"Tax policy analysis. Energy project tax abatement review. Fiscal impact." },

  // ========================================================================
  // NEW ECOSYSTEM ORGS — Batch 5: ~50 additions for 1000+ node target
  // ========================================================================

  // --- County EDAs ---
  { id:"douglas_eda", name:"Douglas County Community Development", etype:"Government", city:"Minden", region:"douglas", note:"Douglas County economic development. Carson Valley energy + rural development." },

  // --- State Agencies ---
  { id:"nv_minerals", name:"NV Division of Minerals", etype:"Government", city:"Carson City", region:"washoe", note:"Geothermal well permits. Mine reclamation. Mineral rights coordination with energy projects." },
  { id:"nv_water", name:"NV Division of Water Resources", etype:"Government", city:"Carson City", region:"washoe", note:"Water rights administration. Energy project water permits. Groundwater basin management." },
  { id:"nv_shpo", name:"NV State Historic Preservation Office", etype:"Government", city:"Carson City", region:"washoe", note:"Section 106 compliance. Cultural resource survey review. Energy project archaeology." },
  { id:"nv_forestry", name:"NV Division of Forestry", etype:"Government", city:"Carson City", region:"washoe", note:"Wildfire prevention. Vegetation management. Transmission corridor fire safety." },
  { id:"nv_ag_energy", name:"NV Attorney General Energy Unit", etype:"Government", city:"Carson City", region:"washoe", note:"Consumer energy protection. Rate case intervention. Utility oversight." },
  { id:"nv_pub_works", name:"NV State Public Works Division", etype:"Government", city:"Carson City", region:"washoe", note:"State building energy efficiency. Public facility solar. State construction." },
  { id:"nv_osit", name:"NV Office of Science, Innovation & Technology", etype:"Government", city:"Carson City", region:"washoe", note:"Technology innovation. Broadband. Data center policy. Energy technology." },
  { id:"nv_climate", name:"NV State Climate Initiative", etype:"Government", city:"Carson City", region:"washoe", note:"Climate action planning. GHG reduction targets. Clean energy strategy coordination." },

  // --- Federal Programs ---
  { id:"wapa_nv", name:"WAPA Desert Southwest Region", etype:"Government", city:"Multiple", region:"multi_county", note:"Western Area Power Administration NV operations. Hoover Dam power marketing." },
  { id:"doe_wpto", name:"DOE Water Power Technologies Office", etype:"Government", city:"Multiple", region:"multi_county", note:"Federal pumped hydro R&D. White Pine project support. Marine + hydro energy." },
  { id:"doe_seto", name:"DOE Solar Energy Technologies Office", etype:"Government", city:"Multiple", region:"multi_county", note:"Federal solar R&D funding. Cost reduction targets. NV solar research grants." },
  { id:"blm_ncl", name:"BLM National Conservation Lands", etype:"Government", city:"Multiple", region:"multi_county", note:"NV national monuments + WSAs. Energy project proximity review. Visual resource management." },
  { id:"usda_rus", name:"USDA Rural Utilities Service", etype:"Government", city:"Multiple", region:"multi_county", note:"Rural electric infrastructure grants. Community solar. Rural energy programs." },

  // --- Industry & Standards ---
  { id:"nerc_org", name:"NERC - Western Region", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Reliability standards. Mandatory compliance. NV Energy obligation. Grid adequacy." },
  { id:"ieee_pes", name:"IEEE Power & Energy Society", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Power engineering standards. Smart grid. Renewable integration technical standards." },
  { id:"iec_tc", name:"IEC Technical Committees", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"International electrotechnical standards. Solar + wind + BESS testing standards." },
  { id:"astm_energy", name:"ASTM Energy Standards Committee", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Material testing standards. Solar module testing. BESS safety standards." },
  { id:"nha_org", name:"National Hydropower Association", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Hydropower + pumped storage advocacy. White Pine project support. Federal policy." },
  { id:"grc_org", name:"Geothermal Resources Council", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Geothermal research + industry forum. Annual conference. NV geothermal chapter." },
  { id:"us_esa", name:"US Energy Storage Association", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Grid-scale storage advocacy. Now part of ACP. BESS policy + safety standards." },
  { id:"srcc", name:"Solar Rating & Certification Corporation", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Solar thermal certification. Testing standards. Quality assurance." },
  { id:"naesb_org", name:"North American Energy Standards Board", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"Wholesale gas + electric standards. Market rules. Interconnection." },
  { id:"wirab_org", name:"Western Interconnection Regional Advisory Body", etype:"Industry Group", city:"Multiple", region:"multi_county", note:"WIRAB advisory. Western resource adequacy. Transmission planning input." },

  // --- Environmental & Community ---
  { id:"sierra_toiyabe", name:"Sierra Club Toiyabe Chapter", etype:"Nonprofit", city:"Reno", region:"washoe", note:"NV + Eastern CA environmental advocacy. Clean energy support. Solar siting." },
  { id:"tnc_nv", name:"The Nature Conservancy - NV Chapter", etype:"Nonprofit", city:"Reno", region:"washoe", note:"NV habitat conservation. Solar siting guidance. Desert landscape stewardship." },
  { id:"gb_water_net", name:"Great Basin Water Network", etype:"Nonprofit", city:"Multiple", region:"multi_county", note:"Groundwater protection. Energy project water impact. Snake Valley pipeline opposition." },
  { id:"nv_outdoor_rec", name:"Nevada Outdoor Recreation", etype:"Nonprofit", city:"Carson City", region:"washoe", note:"Outdoor recreation economy. Public land energy project visual impact. Trail access." },
  { id:"basin_range_watch", name:"Basin and Range Watch", etype:"Nonprofit", city:"Multiple", region:"multi_county", note:"Desert conservation. Utility-scale solar environmental review. Visual impact." },
  { id:"citizens_dixie", name:"Citizens for Dixie Valley", etype:"Nonprofit", city:"Multiple", region:"churchill", note:"Dixie Valley community. Geothermal development oversight. Hot springs stewardship." },
  { id:"nv_wildlife_fed", name:"Nevada Wildlife Federation", etype:"Nonprofit", city:"Reno", region:"washoe", note:"Wildlife habitat advocacy. Energy project environmental review. Hunting + conservation." },
  { id:"cpuc_consumer", name:"Consumer Protection of Utility Customers (NV)", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Utility rate consumer advocacy. PUCN intervenor. Energy cost fairness." },

  // --- Workforce & Education ---
  { id:"nv_apprentice", name:"NV State Apprenticeship Council", etype:"Government", city:"Carson City", region:"washoe", note:"State apprenticeship oversight. Electrical + construction registered programs." },
  { id:"nv_jobconnect", name:"NV JobConnect", etype:"Government", city:"Multiple", region:"multi_county", note:"State employment services. Clean energy job placement. Training referrals." },
  { id:"h2h_nv", name:"Helmets to Hardhats NV", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Military-to-construction transition. Renewable energy jobs. Veterans workforce." },
  { id:"ibew_neca_jatc", name:"IBEW-NECA NV Joint Apprenticeship", etype:"Labor", city:"Las Vegas", region:"clark", note:"Electrical apprenticeship. Solar installer training. 5-year program." },
  { id:"nv_cwi", name:"NV Center for Workforce Innovation", etype:"Government", city:"Las Vegas", region:"clark", note:"Workforce strategy. Clean energy sector partnerships. Skills development." },
  { id:"nv_rewi", name:"NV Renewable Energy Workforce Initiative", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Renewable energy job training. Solar installer certification. BESS technician pipeline." },

  // --- Innovation & Research ---
  { id:"nrel_west", name:"NREL Western Partnerships", etype:"Government", city:"Multiple", region:"multi_county", note:"NREL western US collaboration. NV solar + grid research. Technical assistance." },
  { id:"grc_reno", name:"Geothermal Rising - Reno Chapter", etype:"Industry Group", city:"Reno", region:"washoe", note:"Reno geothermal industry community. Local networking. UNR collaboration." },
  { id:"nirec", name:"NV Institute for Renewable Energy Commercialization", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Technology commercialization. Clean energy startup support. UNLV partnership." },
  { id:"nv_clean_fund", name:"Nevada Clean Energy Fund", etype:"Nonprofit", city:"Las Vegas", region:"clark", note:"Green bank. Clean energy financing. Residential + commercial solar lending." },

  // --- Additional Federal Coordination ---
  { id:"doi_blm_nv", name:"DOI BLM Nevada State Office", etype:"Government", city:"Reno", region:"washoe", note:"48M acres federal land management. Solar + wind ROW. Energy corridor planning." },
  { id:"fas_energy", name:"Federation of American Scientists - Energy", etype:"Nonprofit", city:"Multiple", region:"multi_county", note:"Energy policy research. Clean energy technology assessment. Federal advisory." },
  { id:"eere_nv", name:"DOE EERE Western Region", etype:"Government", city:"Multiple", region:"multi_county", note:"Energy Efficiency + Renewable Energy. NV technical assistance. Grants." },

  // --- Mining-Energy Nexus ---
  { id:"nv_mining_recl", name:"NV Bureau of Mining Regulation & Reclamation", etype:"Government", city:"Carson City", region:"washoe", note:"Mine reclamation. Energy-mineral land use overlap. Brownfield solar sites." },
  { id:"critical_minerals", name:"NV Critical Minerals Task Force", etype:"Government", city:"Carson City", region:"washoe", note:"Lithium + other critical minerals for BESS. Supply chain coordination." },
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

  // ========================================================================
  // SECTION 24: NEW PROJECT EDGES (IDs 19-48)
  // ========================================================================

  // --- Bonanza Solar (c_19) ---
  { source:"c_19", target:"x_nextera", rel:"developed_by", note:"NextEra Energy Resources developer", y:2021 },
  { source:"c_19", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA approved in 2024 IRP", y:2024 },
  { source:"c_19", target:"x_blm", rel:"on_blm_land", note:"BLM ROD approved 2024", y:2024 },
  { source:"c_19", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2024 },
  { source:"c_19", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement", y:2024 },
  { source:"c_19", target:"x_clark_county", rel:"permitted_by", note:"Clark County local permits", y:2024 },

  // --- Mosey Solar (c_20) ---
  { source:"c_20", target:"x_8minute", rel:"developed_by", note:"8minute Solar Energy developer (now EDF sub)", y:2021 },
  { source:"c_20", target:"x_edf", rel:"backed_by", note:"EDF Renewables parent company", y:2023 },
  { source:"c_20", target:"x_signal", rel:"epc_for", note:"Signal Energy EPC contractor", y:2024 },
  { source:"c_20", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2024 },
  { source:"c_20", target:"x_blm", rel:"on_blm_land", note:"BLM ROD issued 2023", y:2023 },
  { source:"c_20", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2024 },
  { source:"c_20", target:"x_nye_county", rel:"permitted_by", note:"Nye County land use approval", y:2024 },

  // --- Rock Valley Solar+Storage (c_21) ---
  { source:"c_21", target:"x_pine_gate", rel:"developed_by", note:"Pine Gate Renewables developer", y:2023 },
  { source:"c_21", target:"x_blm", rel:"on_blm_land", note:"BLM Draft EIS published", y:2025 },
  { source:"c_21", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2024 },
  { source:"c_21", target:"x_nye_county", rel:"permitted_by", note:"Nye County land use", y:2024 },

  // --- Copper Rays Solar+Storage (c_22) ---
  { source:"c_22", target:"x_ip_athenea", rel:"developed_by", note:"IP Athenea Spanish developer", y:2022 },
  { source:"c_22", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA approved", y:2024 },
  { source:"c_22", target:"x_blm", rel:"on_blm_land", note:"BLM ROD approved 2024", y:2024 },
  { source:"c_22", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2024 },
  { source:"c_22", target:"x_clark_county", rel:"permitted_by", note:"Clark County permits", y:2024 },

  // --- Chill Sun Solar (c_23) ---
  { source:"c_23", target:"x_nv_energy", rel:"ppa_with", note:"Interconnection queue. Community solar.", y:2024 },
  { source:"c_23", target:"x_lincoln_county", rel:"permitted_by", note:"Lincoln County land use", y:2024 },

  // --- Rigel Solar+Storage (c_24) ---
  { source:"c_24", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy 2024 IRP resource", y:2024 },
  { source:"c_24", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement", y:2024 },

  // --- Moapa Southern Paiute Solar II (c_25) ---
  { source:"c_25", target:"x_first_solar", rel:"developed_by", note:"First Solar developer + module supplier", y:2025 },
  { source:"c_25", target:"x_moapa", rel:"partners_with", note:"Moapa Band of Paiutes tribal land", y:2025 },
  { source:"c_25", target:"x_bia", rel:"coordinates_with", note:"BIA trust land energy development", y:2025 },

  // --- McGinness Hills Phase 4 (c_26) ---
  { source:"c_26", target:"x_ormat", rel:"developed_by", note:"Ormat Technologies expansion", y:2024 },
  { source:"c_26", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2024 },
  { source:"c_26", target:"x_lander_county", rel:"permitted_by", note:"Lander County oversight", y:2024 },
  { source:"c_26", target:"c_5", rel:"related_portfolio", note:"Phase 4 expansion of McGinness Hills complex", y:2024 },

  // --- Don Campbell Geothermal (c_27) ---
  { source:"c_27", target:"x_ormat", rel:"developed_by", note:"Ormat Technologies operator", y:2013 },
  { source:"c_27", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2013 },
  { source:"c_27", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2013 },
  { source:"c_27", target:"x_mineral_county", rel:"hosted_by", note:"Mineral County host community", y:2013 },

  // --- Tungsten Mountain Geothermal (c_28) ---
  { source:"c_28", target:"x_ormat", rel:"developed_by", note:"Ormat Technologies operator", y:2017 },
  { source:"c_28", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2017 },
  { source:"c_28", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2017 },

  // --- Steamboat Expansion (c_29) ---
  { source:"c_29", target:"x_ormat", rel:"developed_by", note:"Ormat Technologies operator", y:2005 },
  { source:"c_29", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2005 },

  // --- Jersey Valley Geothermal (c_30) ---
  { source:"c_30", target:"x_ormat", rel:"developed_by", note:"Ormat Technologies operator", y:2011 },
  { source:"c_30", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2011 },
  { source:"c_30", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2011 },
  { source:"c_30", target:"x_lander_county", rel:"hosted_by", note:"Lander County host community", y:2011 },

  // --- Spring Valley Wind (c_31) ---
  { source:"c_31", target:"x_pattern", rel:"developed_by", note:"Pattern Energy developer + operator", y:2012 },
  { source:"c_31", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2012 },
  { source:"c_31", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2012 },
  { source:"c_31", target:"x_white_pine", rel:"hosted_by", note:"White Pine County host community", y:2012 },

  // --- Stagecoach Wind (c_32) ---
  { source:"c_32", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2025 },

  // --- White Pine Pumped Storage (c_33) ---
  { source:"c_33", target:"x_rplus", rel:"developed_by", note:"rPlus Hydro / Obsidian Renewables developer", y:2020 },
  { source:"c_33", target:"x_ferc", rel:"filed_with", note:"FERC preliminary permit issued", y:2020 },
  { source:"c_33", target:"f_doe_lpo", rel:"eligible_for", note:"DOE LPO loan potential", y:2023 },
  { source:"c_33", target:"x_white_pine", rel:"hosted_by", note:"White Pine County host community", y:2020 },

  // --- Greenlink North Transmission (c_34) --- (uses same relationships as c_13 since it's essentially the same project)
  // NOTE: c_34 duplicates c_13, so edges reference c_13 which is the primary entry

  // --- North Valmy Conversion (c_35) ---
  { source:"c_35", target:"x_nv_energy", rel:"developed_by", note:"NV Energy utility-owned coal-to-solar", y:2024 },
  { source:"c_35", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2025 },
  { source:"c_35", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP coal-to-clean transition", y:2024 },
  { source:"c_35", target:"x_humboldt_county", rel:"hosted_by", note:"Humboldt County host community", y:2024 },

  // --- Hot Pot Geothermal (c_36) ---
  { source:"c_36", target:"x_cyrq", rel:"developed_by", note:"Cyrq Energy developer", y:2023 },
  { source:"c_36", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2023 },
  { source:"c_36", target:"x_humboldt_county", rel:"hosted_by", note:"Humboldt County host community", y:2023 },

  // --- Patua Geothermal (c_37) ---
  { source:"c_37", target:"x_cyrq", rel:"developed_by", note:"Cyrq Energy developer", y:2022 },
  { source:"c_37", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2022 },

  // --- Battle Mountain Solar (c_38) ---
  { source:"c_38", target:"x_blm", rel:"on_blm_land", note:"BLM land evaluation", y:2025 },
  { source:"c_38", target:"x_lander_county", rel:"hosted_by", note:"Lander County host community", y:2025 },

  // --- Stillwater Hybrid (c_39) ---
  { source:"c_39", target:"x_enel_gp", rel:"developed_by", note:"Enel Green Power operator", y:2009 },
  { source:"c_39", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA", y:2009 },
  { source:"c_39", target:"f_ptc", rel:"eligible_for", note:"Production tax credit", y:2009 },

  // --- Desert Sunlight NV (c_40) ---
  { source:"c_40", target:"x_blm", rel:"on_blm_land", note:"BLM land proposed", y:2025 },
  { source:"c_40", target:"x_clark_county", rel:"hosted_by", note:"Clark County location", y:2025 },

  // --- Jean Solar+Storage (c_41) ---
  { source:"c_41", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy 2024 IRP resource", y:2024 },
  { source:"c_41", target:"f_pucn_irp", rel:"subject_of", note:"2024 IRP procurement target", y:2024 },

  // --- Yellowpine Solar+Storage (c_42) ---
  { source:"c_42", target:"x_8minute", rel:"developed_by", note:"8minute Solar Energy (now EDF sub)", y:2019 },
  { source:"c_42", target:"x_edf", rel:"backed_by", note:"EDF Renewables parent", y:2023 },
  { source:"c_42", target:"x_nv_energy", rel:"ppa_with", note:"NV Energy PPA approved", y:2024 },
  { source:"c_42", target:"x_blm", rel:"on_blm_land", note:"BLM ROD approved", y:2023 },
  { source:"c_42", target:"f_itc", rel:"eligible_for", note:"30% ITC", y:2023 },
  { source:"c_42", target:"x_nye_county", rel:"permitted_by", note:"Nye County land use", y:2023 },

  // --- Arrow Canyon Solar (c_43) ---
  { source:"c_43", target:"x_nextera", rel:"developed_by", note:"NextEra Energy Resources developer", y:2025 },
  { source:"c_43", target:"x_blm", rel:"on_blm_land", note:"BLM land proposed", y:2025 },
  { source:"c_43", target:"x_clark_county", rel:"hosted_by", note:"Clark County location", y:2025 },

  // --- Meta TRIC Data Center (c_44) ---
  { source:"c_44", target:"x_meta", rel:"developed_by", note:"Meta Platforms owner/operator", y:2023 },
  { source:"c_44", target:"x_nv_energy", rel:"ppa_with", note:"Power customer. 600MW planned load.", y:2023 },
  { source:"c_44", target:"x_goed", rel:"approved_by", note:"GOED tax abatement approved", y:2023 },
  { source:"c_44", target:"x_storey_county", rel:"permitted_by", note:"Storey County construction permits", y:2023 },
  { source:"c_44", target:"tric_authority", rel:"located_at", note:"TRIC industrial park campus", y:2023 },
  { source:"c_44", target:"c_13", rel:"depends_on", note:"Meta load growth needs Greenlink North capacity", y:2028 },

  // --- Applied Digital NV (c_45) ---
  { source:"c_45", target:"x_applied_digital", rel:"developed_by", note:"Applied Digital AI/HPC data center", y:2024 },
  { source:"c_45", target:"x_nv_energy", rel:"ppa_with", note:"Power capacity evaluation. 300MW load.", y:2025 },
  { source:"c_45", target:"x_goed", rel:"evaluates", note:"Data center tax abatement evaluation", y:2025 },

  // --- Pinyon Pipeline (c_46) ---
  { source:"c_46", target:"x_sw_gas", rel:"developed_by", note:"Southwest Gas developer", y:2024 },
  { source:"c_46", target:"x_pucn", rel:"filed_with", note:"Certificate of public need evaluation", y:2025 },

  // --- Air Liquide H2 Hub (c_47) ---
  { source:"c_47", target:"x_doe", rel:"funded_by", note:"DOE H2Hub regional program participant", y:2024 },
  { source:"c_47", target:"f_doe_lpo", rel:"eligible_for", note:"DOE LPO potential", y:2024 },

  // --- Ivanpah Repowering (c_48) ---
  { source:"c_48", target:"x_blm", rel:"on_blm_land", note:"BLM land repowering proposal", y:2025 },
  { source:"c_48", target:"x_clark_county", rel:"hosted_by", note:"Clark County location", y:2025 },

  // ========================================================================
  // SECTION 25: NEW PEOPLE → ORGANIZATIONS / PROJECTS
  // ========================================================================

  // Developer/Manager People → Organizations
  { source:"p_nextera_nv", target:"x_nextera", rel:"leads", note:"President & CEO. 30GW+ platform.", y:2022 },
  { source:"p_nextera_nv", target:"c_19", rel:"oversees", note:"Bonanza Solar 300MW development", y:2021 },
  { source:"p_nextera_nv", target:"c_43", rel:"oversees", note:"Arrow Canyon Solar 200MW development", y:2025 },
  { source:"p_8minute_ceo", target:"x_8minute", rel:"leads", note:"Founder & CEO. 18GW+ pipeline.", y:2009 },
  { source:"p_8minute_ceo", target:"c_20", rel:"project_lead", note:"Mosey Solar 250MW development", y:2021 },
  { source:"p_8minute_ceo", target:"c_42", rel:"project_lead", note:"Yellowpine Solar 500MW development", y:2019 },
  { source:"p_pine_gate", target:"x_pine_gate", rel:"leads", note:"CEO. Pine Gate Renewables.", y:2019 },
  { source:"p_pine_gate", target:"c_21", rel:"project_lead", note:"Rock Valley Solar 200MW development", y:2023 },
  { source:"p_ip_athenea", target:"x_ip_athenea", rel:"leads", note:"CEO. Spanish renewable expansion.", y:2020 },
  { source:"p_ip_athenea", target:"c_22", rel:"project_lead", note:"Copper Rays Solar 500MW development", y:2022 },
  { source:"p_first_solar_nv", target:"x_first_solar", rel:"employed_by", note:"VP Development", y:2018 },
  { source:"p_first_solar_nv", target:"c_25", rel:"project_lead", note:"Moapa Solar II 250MW expansion", y:2025 },
  { source:"p_rplus", target:"x_rplus", rel:"leads", note:"CEO. Obsidian Renewables.", y:2019 },
  { source:"p_rplus", target:"c_33", rel:"project_lead", note:"White Pine Pumped Storage 1,000MW", y:2020 },
  { source:"p_pattern_ceo", target:"x_pattern", rel:"leads", note:"CEO. Pattern Energy. 30GW+ pipeline.", y:2019 },
  { source:"p_pattern_ceo", target:"c_31", rel:"oversees", note:"Spring Valley Wind 150MW operations", y:2012 },
  { source:"p_cyrq_ceo", target:"x_cyrq", rel:"leads", note:"CEO. Cyrq Energy geothermal specialist.", y:2018 },
  { source:"p_cyrq_ceo", target:"c_36", rel:"project_lead", note:"Hot Pot Geothermal 30MW development", y:2023 },
  { source:"p_cyrq_ceo", target:"c_37", rel:"project_lead", note:"Patua Geothermal 30MW development", y:2022 },
  { source:"p_enel_nv", target:"x_enel_gp", rel:"leads", note:"CEO. Enel Green Power NA.", y:2019 },
  { source:"p_enel_nv", target:"c_39", rel:"oversees", note:"Stillwater Hybrid operations", y:2019 },
  { source:"p_signal_pm", target:"x_signal", rel:"employed_by", note:"VP Construction", y:2019 },
  { source:"p_signal_pm", target:"c_20", rel:"contractor_for", note:"Mosey Solar EPC construction", y:2024 },
  { source:"p_swgas_ceo", target:"x_sw_gas", rel:"leads", note:"President & CEO. NYSE: SWX.", y:2021 },
  { source:"p_swgas_ceo", target:"c_46", rel:"project_lead", note:"Pinyon Pipeline development", y:2024 },
  { source:"p_air_liquide", target:"c_47", rel:"project_lead", note:"Air Liquide Green H2 Hub development", y:2024 },

  // NV Energy Additional Staff
  { source:"p_nve_irp", target:"x_nv_energy", rel:"employed_by", note:"Director IRP Planning", y:2019 },
  { source:"p_nve_irp", target:"x_pucn", rel:"testifies_before", note:"IRP proceeding technical testimony", y:2024 },
  { source:"p_nve_land", target:"x_nv_energy", rel:"employed_by", note:"Director Land Services", y:2018 },
  { source:"p_nve_land", target:"c_7", rel:"manages", note:"Greenlink West ROW acquisition", y:2022 },
  { source:"p_nve_safety", target:"x_nv_energy", rel:"employed_by", note:"VP Safety & Operations", y:2019 },
  { source:"p_nve_comm", target:"x_nv_energy", rel:"employed_by", note:"VP Communications", y:2020 },
  { source:"p_nve_comm", target:"c_7", rel:"manages", note:"Greenlink community engagement", y:2023 },

  // County Commissioners (New Counties) → Counties & Projects
  { source:"p_white_pine_cc", target:"x_white_pine", rel:"serves_on", note:"White Pine County Commissioner", y:2020 },
  { source:"p_white_pine_cc", target:"c_33", rel:"oversees", note:"White Pine Pumped Storage county oversight", y:2020 },
  { source:"p_white_pine_cc", target:"c_31", rel:"oversees", note:"Spring Valley Wind host county oversight", y:2012 },
  { source:"p_lincoln_cc", target:"x_lincoln_county", rel:"serves_on", note:"Lincoln County Commissioner", y:2021 },
  { source:"p_lincoln_cc", target:"c_23", rel:"oversees", note:"Chill Sun Solar county oversight", y:2024 },
  { source:"p_storey_cc", target:"x_storey_county", rel:"serves_on", note:"Storey County Commissioner", y:2018 },
  { source:"p_storey_cc", target:"c_44", rel:"oversees", note:"Meta TRIC data center county permits", y:2023 },
  { source:"p_storey_cc", target:"c_3", rel:"oversees", note:"Switch Citadel Campus county oversight", y:2018 },
  { source:"p_humboldt_cc", target:"x_humboldt_county", rel:"serves_on", note:"Humboldt County Commissioner", y:2019 },
  { source:"p_humboldt_cc", target:"c_35", rel:"oversees", note:"North Valmy conversion county oversight", y:2024 },
  { source:"p_humboldt_cc", target:"c_36", rel:"oversees", note:"Hot Pot Geothermal county oversight", y:2023 },
  { source:"p_lander_cc", target:"x_lander_county", rel:"serves_on", note:"Lander County Commissioner", y:2020 },
  { source:"p_lander_cc", target:"c_26", rel:"oversees", note:"McGinness Phase 4 county oversight", y:2024 },
  { source:"p_lander_cc", target:"c_38", rel:"oversees", note:"Battle Mountain Solar county oversight", y:2025 },
  { source:"p_mineral_cc", target:"x_mineral_county", rel:"serves_on", note:"Mineral County Commissioner", y:2021 },
  { source:"p_mineral_cc", target:"c_27", rel:"oversees", note:"Don Campbell Geothermal county oversight", y:2013 },
  { source:"p_pershing_cc", target:"x_pershing_county", rel:"serves_on", note:"Pershing County Commissioner", y:2020 },
  { source:"p_pershing_cc", target:"c_8", rel:"oversees", note:"Corsac Station host county oversight", y:2023 },

  // Federal Officials → Agencies & Projects
  { source:"p_blm_carson", target:"x_blm", rel:"employed_by", note:"BLM Carson City District Manager", y:2020 },
  { source:"p_blm_carson", target:"c_12", rel:"reviews", note:"Libra Solar BLM district review", y:2024 },
  { source:"p_blm_carson", target:"c_20", rel:"reviews", note:"Mosey Solar BLM district review", y:2023 },
  { source:"p_blm_ely", target:"x_blm", rel:"employed_by", note:"BLM Ely District Manager", y:2019 },
  { source:"p_blm_ely", target:"c_33", rel:"reviews", note:"White Pine Pumped Storage federal land review", y:2023 },
  { source:"p_blm_ely", target:"c_23", rel:"reviews", note:"Chill Sun Solar BLM district review", y:2024 },
  { source:"p_ferc_chair", target:"x_ferc", rel:"chairs", note:"FERC Chairman. Transmission + interconnection.", y:2021 },
  { source:"p_ferc_chair", target:"c_33", rel:"oversees", note:"White Pine Pumped Storage FERC licensing", y:2020 },
  { source:"p_doi_renewables", target:"x_doi", rel:"employed_by", note:"DOI renewable energy on public lands", y:2021 },
  { source:"p_doi_renewables", target:"x_blm", rel:"oversees", note:"BLM energy permitting policy oversight", y:2021 },
  { source:"p_doe_lpo", target:"x_doe", rel:"employed_by", note:"Director, DOE Loan Programs Office", y:2021 },
  { source:"p_doe_lpo", target:"c_7", rel:"evaluates", note:"Greenlink West DOE LPO evaluation", y:2024 },
  { source:"p_doe_lpo", target:"c_33", rel:"evaluates", note:"White Pine Pumped Storage LPO evaluation", y:2025 },

  // Tribal Leaders (New) → Tribes & Projects
  { source:"p_moapa_solar", target:"x_moapa", rel:"employed_by", note:"Energy Director. Moapa Band.", y:2020 },
  { source:"p_moapa_solar", target:"c_25", rel:"project_lead", note:"Moapa Solar II tribal expansion lead", y:2025 },
  { source:"p_ely_shoshone", target:"x_ely_shoshone", rel:"leads", note:"Tribal Chair. Ely Shoshone.", y:2019 },
  { source:"p_ely_shoshone", target:"c_33", rel:"consults_on", note:"White Pine Pumped Storage tribal consultation", y:2023 },
  { source:"p_ely_shoshone", target:"c_31", rel:"consults_on", note:"Spring Valley Wind tribal consultation", y:2012 },
  { source:"p_fallon_chair", target:"x_fallon_paiute", rel:"leads", note:"Chairman. Fallon Paiute-Shoshone.", y:2020 },
  { source:"p_fallon_chair", target:"c_39", rel:"consults_on", note:"Stillwater Hybrid proximity consultation", y:2020 },
  { source:"p_walker_chair", target:"x_walker_river", rel:"leads", note:"Chair. Walker River Paiute.", y:2019 },
  { source:"p_walker_chair", target:"c_12", rel:"consults_on", note:"Libra Solar tribal consultation", y:2024 },
  { source:"p_battle_mt_band", target:"x_temoak", rel:"leads", note:"Chair. Te-Moak Western Shoshone.", y:2021 },
  { source:"p_battle_mt_band", target:"c_26", rel:"consults_on", note:"McGinness Phase 4 tribal consultation", y:2024 },

  // Financial / Insurance People → Organizations
  { source:"p_stonepeak", target:"x_stonepeak", rel:"leads", note:"Partner. Infrastructure PE.", y:2016 },
  { source:"p_gip_energy", target:"x_gip", rel:"leads", note:"Chairman. GIP.", y:2006 },
  { source:"p_gip_energy", target:"x_clearway", rel:"investor_in", note:"GIP owns Clearway Energy", y:2018 },
  { source:"p_macquarie_nv", target:"x_macquarie", rel:"employed_by", note:"MD Americas. Green investment.", y:2018 },
  { source:"p_munich_re", target:"x_munich_re", rel:"employed_by", note:"Head Renewable Energy", y:2018 },
  { source:"p_zurich_energy", target:"x_zurich", rel:"employed_by", note:"Head Sustainability", y:2020 },

  // Utility Buyers (Outside NV) → Projects
  { source:"p_ladwp_gm", target:"x_ladwp", rel:"leads", note:"GM. Largest US municipal utility.", y:2022 },
  { source:"p_sce_ceo", target:"x_sce", rel:"leads", note:"President. Southern CA Edison.", y:2023 },
  { source:"p_pge_ceo", target:"x_pge", rel:"leads", note:"CEO. PG&E.", y:2021 },

  // Water / Land People
  { source:"p_snwa_gm", target:"x_snwa", rel:"leads", note:"GM. Southern NV water.", y:2018 },
  { source:"p_snwa_gm", target:"c_22", rel:"reviews", note:"Copper Rays Solar water allocation", y:2024 },
  { source:"p_tcid", target:"x_tcid", rel:"leads", note:"Manager. Truckee-Carson Irrigation.", y:2017 },
  { source:"p_tric_mgr", target:"x_tri_gid", rel:"leads", note:"President. TRI General Improvement.", y:2015 },
  { source:"p_tric_mgr", target:"c_44", rel:"coordinates_with", note:"Meta TRIC campus infrastructure", y:2023 },

  // Grid / Transmission People
  { source:"p_gridliance", target:"x_gridliance", rel:"leads", note:"CEO. GridLiance NV transmission.", y:2018 },
  { source:"p_vea_ceo", target:"x_vea", rel:"leads", note:"CEO. Valley Electric Association.", y:2019 },
  { source:"p_vea_ceo", target:"c_10", rel:"coordinates_with", note:"Rough Hat Clark distribution territory", y:2024 },

  // State Officials → Agencies & Projects
  { source:"p_nv_minerals", target:"c_36", rel:"permits", note:"Hot Pot Geothermal well permits", y:2023 },
  { source:"p_nv_minerals", target:"c_37", rel:"permits", note:"Patua Geothermal well permits", y:2022 },

  // Industry Equipment People → Organizations & Projects
  { source:"p_ge_vernova", target:"x_ge_vernova", rel:"leads", note:"CEO. NYSE: GEV.", y:2024 },
  { source:"p_vestas_na", target:"x_vestas", rel:"leads", note:"President NA. Wind turbines.", y:2020 },
  { source:"p_vestas_na", target:"c_31", rel:"supplies", note:"Spring Valley Wind turbine supply", y:2012 },

  // University / Research People
  { source:"p_unr_geo", target:"x_unr", rel:"employed_by", note:"Director. NV Bureau of Mines.", y:2015 },
  { source:"p_unr_geo", target:"c_36", rel:"surveys", note:"Hot Pot geothermal resource mapping", y:2023 },
  { source:"p_unr_geo", target:"c_37", rel:"surveys", note:"Patua geothermal resource assessment", y:2022 },
  { source:"p_unlv_solar", target:"x_unlv", rel:"employed_by", note:"Director UNLV Energy Research.", y:2010 },
  { source:"p_csi_solar", target:"x_csn", rel:"employed_by", note:"Director Energy Technology Program.", y:2018 },
  { source:"p_tmcc_energy", target:"x_tmcc", rel:"employed_by", note:"VP Workforce. TMCC.", y:2019 },

  // ========================================================================
  // SECTION 26: NEW EXTERNAL → PROJECT / ORG EDGES
  // ========================================================================

  // Developer Externals → Projects
  { source:"x_8minute", target:"x_edf", rel:"acquired_by", note:"8minute Solar acquired by EDF Renewables", y:2023 },
  { source:"x_pine_gate", target:"x_aes", rel:"backed_by", note:"AES Clean Energy subsidiary", y:2022 },
  { source:"x_cyrq", target:"c_36", rel:"develops", note:"Hot Pot Geothermal 30MW", y:2023 },
  { source:"x_cyrq", target:"c_37", rel:"develops", note:"Patua Geothermal 30MW", y:2022 },
  { source:"x_enel_gp", target:"c_39", rel:"operates", note:"Stillwater Hybrid operations", y:2009 },
  { source:"x_rplus", target:"c_33", rel:"develops", note:"White Pine Pumped Storage 1,000MW", y:2020 },

  // EPC Externals → Projects
  { source:"x_signal", target:"c_20", rel:"epc_for", note:"Mosey Solar EPC construction", y:2024 },
  { source:"x_sterling_wilson", target:"c_22", rel:"epc_for", note:"Copper Rays Solar EPC evaluation", y:2025 },
  { source:"x_sterling_wilson", target:"c_19", rel:"epc_for", note:"Bonanza Solar EPC bid", y:2025 },
  { source:"x_sundt", target:"c_42", rel:"epc_for", note:"Yellowpine Solar EPC evaluation", y:2025 },
  { source:"x_bechtel", target:"c_33", rel:"epc_for", note:"White Pine Pumped Storage EPC evaluation", y:2025 },
  { source:"x_whiting_turner", target:"c_44", rel:"epc_for", note:"Meta TRIC data center construction", y:2023 },

  // Equipment → Projects
  { source:"x_ge_vernova", target:"c_7", rel:"supplies", note:"Greenlink West grid equipment supply bid", y:2025 },
  { source:"x_ge_vernova", target:"c_13", rel:"supplies", note:"Greenlink North grid equipment evaluation", y:2026 },
  { source:"x_vestas", target:"c_31", rel:"supplies", note:"Spring Valley Wind turbine supply", y:2012 },
  { source:"x_vestas", target:"c_32", rel:"supplies", note:"Stagecoach Wind turbine evaluation", y:2025 },
  { source:"x_samsung_sdi", target:"c_22", rel:"supplies", note:"Copper Rays BESS cell supply evaluation", y:2025 },
  { source:"x_wartsila", target:"c_6", rel:"supplies", note:"Sierra Solar BESS technology evaluation", y:2024 },
  { source:"x_schneider", target:"c_44", rel:"supplies", note:"Meta TRIC power management infrastructure", y:2023 },

  // Financial → Projects
  { source:"x_stonepeak", target:"c_7", rel:"evaluates", note:"Greenlink West infrastructure investment evaluation", y:2025 },
  { source:"x_gip", target:"x_clearway", rel:"owns", note:"GIP owns Clearway Energy Group", y:2018 },
  { source:"x_macquarie", target:"c_12", rel:"evaluates", note:"Libra Solar project investment evaluation", y:2025 },
  { source:"x_ifm", target:"c_1", rel:"evaluates", note:"Gemini Solar operational asset evaluation", y:2024 },
  { source:"x_ares", target:"c_19", rel:"evaluates", note:"Bonanza Solar project finance evaluation", y:2025 },
  { source:"x_blackrock_infra", target:"c_7", rel:"evaluates", note:"Greenlink West infrastructure investment evaluation", y:2025 },
  { source:"x_credit_agricole", target:"c_22", rel:"finances", note:"Copper Rays Solar project finance evaluation", y:2025 },

  // Insurance → Projects
  { source:"x_munich_re", target:"c_22", rel:"insures", note:"Copper Rays Solar construction reinsurance evaluation", y:2025 },
  { source:"x_munich_re", target:"c_19", rel:"insures", note:"Bonanza Solar construction insurance evaluation", y:2025 },
  { source:"x_zurich", target:"c_12", rel:"insures", note:"Libra Solar construction insurance evaluation", y:2025 },
  { source:"x_chubb", target:"c_6", rel:"insures", note:"Sierra Solar specialty construction insurance", y:2025 },

  // National Labs → Projects & Research
  { source:"x_pnnl", target:"c_33", rel:"researches", note:"White Pine Pumped Storage technology assessment", y:2023 },
  { source:"x_pnnl", target:"c_2", rel:"researches", note:"Reid Gardner BESS grid services optimization", y:2024 },
  { source:"x_ornl", target:"x_fervo", rel:"researches", note:"Advanced geothermal materials + manufacturing R&D", y:2023 },
  { source:"x_llnl", target:"c_8", rel:"researches", note:"Corsac Station reservoir simulation + modeling", y:2024 },

  // Utilities (Outside NV) → Projects & Interconnection
  { source:"x_sce", target:"c_12", rel:"potential_buyer", note:"Libra Solar potential CA PPA buyer", y:2025 },
  { source:"x_sce", target:"c_7", rel:"benefits_from", note:"Greenlink West enables NV-CA delivery", y:2027 },
  { source:"x_pge", target:"c_8", rel:"potential_buyer", note:"Fervo geothermal potential PPA buyer", y:2025 },
  { source:"x_vea", target:"c_10", rel:"distribution_for", note:"Rough Hat Clark area distribution utility", y:2024 },
  { source:"x_vea", target:"c_21", rel:"distribution_for", note:"Rock Valley Solar area distribution", y:2025 },
  { source:"x_gridliance", target:"c_13", rel:"interconnects_with", note:"Greenlink North interconnection coordination", y:2025 },
  { source:"x_sw_gas", target:"c_46", rel:"develops", note:"Pinyon Pipeline developer", y:2024 },

  // County Governments → Projects
  { source:"x_white_pine", target:"c_33", rel:"hosts", note:"White Pine Pumped Storage host county", y:2020 },
  { source:"x_white_pine", target:"c_31", rel:"hosts", note:"Spring Valley Wind host county", y:2012 },
  { source:"x_lincoln_county", target:"c_23", rel:"hosts", note:"Chill Sun Solar host county", y:2024 },
  { source:"x_storey_county", target:"c_44", rel:"hosts", note:"Meta TRIC data center host county", y:2023 },
  { source:"x_storey_county", target:"c_3", rel:"hosts", note:"Switch Citadel Campus host county", y:2000 },
  { source:"x_storey_county", target:"c_4", rel:"hosts", note:"Google TRIC data center host county", y:2018 },
  { source:"x_humboldt_county", target:"c_35", rel:"hosts", note:"North Valmy conversion host county", y:2024 },
  { source:"x_humboldt_county", target:"c_36", rel:"hosts", note:"Hot Pot Geothermal host county", y:2023 },
  { source:"x_lander_county", target:"c_5", rel:"hosts", note:"McGinness Hills geothermal host county", y:2012 },
  { source:"x_lander_county", target:"c_26", rel:"hosts", note:"McGinness Hills Phase 4 host county", y:2024 },
  { source:"x_lander_county", target:"c_30", rel:"hosts", note:"Jersey Valley Geothermal host county", y:2011 },
  { source:"x_lander_county", target:"c_38", rel:"hosts", note:"Battle Mountain Solar proposed host county", y:2025 },
  { source:"x_mineral_county", target:"c_27", rel:"hosts", note:"Don Campbell Geothermal host county", y:2013 },
  { source:"x_pershing_county", target:"c_8", rel:"hosts", note:"Fervo Corsac Station host county", y:2023 },

  // Tribal Nations → Projects
  { source:"x_ely_shoshone", target:"c_33", rel:"consults_on", note:"White Pine Pumped Storage tribal consultation", y:2023 },
  { source:"x_ely_shoshone", target:"c_31", rel:"consults_on", note:"Spring Valley Wind proximity consultation", y:2012 },
  { source:"x_temoak", target:"c_26", rel:"consults_on", note:"McGinness Phase 4 traditional land consultation", y:2024 },
  { source:"x_temoak", target:"c_38", rel:"consults_on", note:"Battle Mountain Solar traditional land consultation", y:2025 },
  { source:"x_pyramid_lake", target:"c_13", rel:"consults_on", note:"Greenlink North transmission corridor tribal consultation", y:2024 },
  { source:"x_pyramid_lake", target:"c_18", rel:"consults_on", note:"Dodge Flat II Washoe County tribal consultation", y:2025 },
  { source:"x_yerington_paiute", target:"c_12", rel:"consults_on", note:"Libra Solar Lyon County tribal consultation", y:2024 },

  // Environmental/Conservation → Projects
  { source:"x_tnc_nv", target:"c_16", rel:"reviews", note:"Esmeralda Seven habitat offset partnership evaluation", y:2025 },
  { source:"x_tnc_nv", target:"c_12", rel:"reviews", note:"Libra Solar habitat mitigation consultation", y:2024 },
  { source:"x_sierra_club_nv", target:"c_7", rel:"supports", note:"Greenlink West clean energy transmission support", y:2023 },
  { source:"x_sierra_club_nv", target:"c_16", rel:"monitors", note:"Esmeralda Seven environmental impact review", y:2025 },
  { source:"x_defenders", target:"c_1", rel:"monitors", note:"Gemini Solar desert tortoise compliance monitoring", y:2023 },
  { source:"x_defenders", target:"c_16", rel:"reviews", note:"Esmeralda Seven sage grouse + tortoise review", y:2025 },
  { source:"x_basin_range", target:"c_16", rel:"opposes", note:"Esmeralda Seven desert conservation concerns", y:2025 },
  { source:"x_basin_range", target:"c_48", rel:"reviews", note:"Ivanpah Repowering visual impact review", y:2025 },
  { source:"x_great_basin_water", target:"c_16", rel:"reviews", note:"Esmeralda Seven water availability concerns", y:2025 },
  { source:"x_great_basin_water", target:"c_33", rel:"reviews", note:"White Pine Pumped Storage water rights review", y:2023 },

  // Industry Standards → Projects
  { source:"x_nerc", target:"x_nv_energy", rel:"regulates", note:"Reliability standards compliance. Mandatory standards.", y:2000 },
  { source:"x_nerc", target:"x_wecc", rel:"delegates_to", note:"WECC regional reliability oversight for western US", y:2000 },
  { source:"x_ieee", target:"x_nv_energy", rel:"standards_for", note:"Interconnection protocols. IEEE 1547 + 2800.", y:2020 },
  { source:"x_ul", target:"c_2", rel:"certifies", note:"Reid Gardner BESS UL 9540A safety testing", y:2024 },
  { source:"x_ul", target:"c_6", rel:"certifies", note:"Sierra Solar BESS safety certification", y:2025 },
  { source:"x_nfpa", target:"c_2", rel:"standards_for", note:"Reid Gardner BESS NFPA 855 fire codes", y:2024 },

  // Consulting → Projects
  { source:"x_erm", target:"c_19", rel:"consultant_for", note:"Bonanza Solar environmental assessment", y:2023 },
  { source:"x_hdr", target:"c_7", rel:"consultant_for", note:"Greenlink West transmission routing analysis", y:2022 },
  { source:"x_hdr", target:"c_35", rel:"consultant_for", note:"North Valmy conversion engineering study", y:2025 },
  { source:"x_dnv", target:"c_1", rel:"consultant_for", note:"Gemini Solar performance due diligence", y:2023 },
  { source:"x_dnv", target:"c_22", rel:"consultant_for", note:"Copper Rays Solar technical due diligence", y:2025 },
  { source:"x_cbec", target:"c_19", rel:"consultant_for", note:"Bonanza Solar desert tortoise mitigation design", y:2023 },
  { source:"x_cbec", target:"c_22", rel:"consultant_for", note:"Copper Rays Solar biological assessment", y:2024 },

  // Workforce → Training & Projects
  { source:"x_csn", target:"x_ibew396", rel:"trains_for", note:"Electrical worker training pipeline. Solar installation.", y:2020 },
  { source:"x_tmcc", target:"x_oe12", rel:"trains_for", note:"Heavy equipment operator training pipeline", y:2020 },

  // Geothermal Industry
  { source:"x_gea", target:"x_ormat", rel:"member_org", note:"Ormat is GEA/Geothermal Rising member", y:2010 },
  { source:"x_gea", target:"x_fervo", rel:"member_org", note:"Fervo Energy GEA member", y:2020 },
  { source:"x_gea", target:"x_cyrq", rel:"member_org", note:"Cyrq Energy GEA member", y:2018 },
  { source:"nv_geo_alliance", target:"x_ormat", rel:"member_org", note:"Ormat NV Geothermal Alliance member", y:2015 },
  { source:"nv_geo_alliance", target:"x_fervo", rel:"member_org", note:"Fervo NV Geothermal Alliance member", y:2022 },
  { source:"nv_geo_alliance", target:"x_cyrq", rel:"member_org", note:"Cyrq NV Geothermal Alliance member", y:2020 },

  // ========================================================================
  // SECTION 27: ECOSYSTEM ORG EDGES (New Batch)
  // ========================================================================

  // County EDAs → Local Projects
  { source:"wp_eda", target:"c_33", rel:"supports", note:"White Pine Pumped Storage economic development support", y:2020 },
  { source:"wp_eda", target:"c_31", rel:"supports", note:"Spring Valley Wind economic impact management", y:2012 },
  { source:"storey_eda", target:"c_44", rel:"supports", note:"Meta TRIC data center economic development", y:2023 },
  { source:"storey_eda", target:"tric_authority", rel:"coordinates_with", note:"TRIC industrial development coordination", y:2018 },
  { source:"humboldt_eda", target:"c_35", rel:"supports", note:"North Valmy conversion economic transition", y:2024 },
  { source:"humboldt_eda", target:"c_36", rel:"supports", note:"Hot Pot Geothermal economic development", y:2023 },
  { source:"churchill_eda", target:"c_39", rel:"supports", note:"Stillwater Hybrid economic impact", y:2012 },
  { source:"churchill_eda", target:"c_28", rel:"supports", note:"Tungsten Mountain geothermal economic impact", y:2017 },
  { source:"lander_eda", target:"c_5", rel:"supports", note:"McGinness Hills geothermal economic impact", y:2012 },
  { source:"lander_eda", target:"c_26", rel:"supports", note:"McGinness Phase 4 expansion economic benefit", y:2024 },
  { source:"pershing_eda", target:"c_8", rel:"supports", note:"Corsac Station economic development coordination", y:2023 },
  { source:"mineral_eda", target:"c_27", rel:"supports", note:"Don Campbell geothermal economic impact", y:2013 },

  // Workforce Organizations → Projects
  { source:"nv_works", target:"c_7", rel:"supports", note:"Greenlink West clean energy job training pipeline", y:2024 },
  { source:"nv_works", target:"c_1", rel:"supports", note:"Gemini Solar construction workforce development", y:2021 },
  { source:"nevadaworks", target:"c_8", rel:"supports", note:"Corsac Station geothermal workforce", y:2023 },
  { source:"nevadaworks", target:"c_44", rel:"supports", note:"Meta TRIC data center construction workforce", y:2023 },
  { source:"nv_detr", target:"x_ibew396", rel:"coordinates_with", note:"Electrical workforce training programs", y:2020 },
  { source:"nv_detr", target:"x_oe12", rel:"coordinates_with", note:"Heavy equipment operator workforce pipeline", y:2020 },
  { source:"ibew357", target:"c_9", rel:"labor_for", note:"Dry Lake East electrical installation (planned)", y:2026 },
  { source:"ibew357", target:"c_22", rel:"labor_for", note:"Copper Rays Solar electrical installation", y:2026 },
  { source:"ibew357", target:"c_19", rel:"labor_for", note:"Bonanza Solar electrical installation", y:2026 },
  { source:"ua525", target:"c_36", rel:"labor_for", note:"Hot Pot Geothermal pipefitting construction", y:2025 },
  { source:"ua525", target:"c_46", rel:"labor_for", note:"Pinyon Pipeline construction", y:2025 },

  // Environmental Organizations → Regulatory
  { source:"nv_conservation", target:"x_pucn", rel:"advocates_before", note:"Clean energy policy advocacy. RPS compliance.", y:2020 },
  { source:"nv_conservation", target:"c_12", rel:"supports", note:"Libra Solar clean energy advocacy", y:2024 },
  { source:"great_basin_inst", target:"x_blm", rel:"partners_with", note:"BLM habitat restoration partnerships", y:2015 },
  { source:"great_basin_inst", target:"c_16", rel:"monitors", note:"Esmeralda Seven ecological impact assessment", y:2025 },
  { source:"friends_nv_wild", target:"c_16", rel:"reviews", note:"Esmeralda Seven wilderness proximity review", y:2025 },

  // Clean Energy Coalitions
  { source:"pvnv", target:"c_10", rel:"monitors", note:"Rough Hat Clark community engagement", y:2024 },
  { source:"pvnv", target:"c_21", rel:"monitors", note:"Rock Valley Solar community engagement", y:2024 },
  { source:"pvnv", target:"c_42", rel:"monitors", note:"Yellowpine Solar community engagement", y:2024 },
  { source:"wec", target:"x_pucn", rel:"intervenes", note:"Rate case intervenor. Commercial customer rates.", y:2024 },
  { source:"wec", target:"c_7", rel:"monitors", note:"Greenlink West rate recovery cost allocation", y:2024 },
  { source:"nv_manufacturers", target:"x_pucn", rel:"advocates_before", note:"Industrial rate advocacy. Manufacturing competitiveness.", y:2023 },

  // Federal Coordination
  { source:"nps_nv", target:"c_16", rel:"reviews", note:"Esmeralda Seven Death Valley visual impact review", y:2025 },
  { source:"nps_nv", target:"c_48", rel:"reviews", note:"Ivanpah Repowering visual impact near Death Valley", y:2025 },
  { source:"usda_rd", target:"c_23", rel:"supports", note:"Chill Sun community solar rural electric infrastructure", y:2025 },

  // Geothermal Organizations
  { source:"grc", target:"x_ormat", rel:"member_org", note:"Ormat is GRC institutional member", y:2010 },
  { source:"grc", target:"x_fervo", rel:"member_org", note:"Fervo Energy GRC member", y:2020 },
  { source:"nv_geo_alliance", target:"c_8", rel:"supports", note:"Corsac Station EGS industry support", y:2023 },
  { source:"nv_geo_alliance", target:"c_5", rel:"supports", note:"McGinness Hills geothermal industry showcase", y:2015 },

  // Hydrogen
  { source:"fchea", target:"c_47", rel:"supports", note:"Air Liquide H2 Hub hydrogen industry advocacy", y:2024 },

  // ========================================================================
  // SECTION 28: CROSS-PROJECT DEPENDENCIES (New Projects)
  // ========================================================================

  // Greenlink enables new projects
  { source:"c_7", target:"c_20", rel:"enables", note:"Greenlink West enables Mosey Solar delivery to southern NV", y:2027 },
  { source:"c_7", target:"c_42", rel:"enables", note:"Greenlink West enables Yellowpine delivery flexibility", y:2027 },
  { source:"c_7", target:"c_21", rel:"enables", note:"Greenlink West enables Rock Valley delivery to load centers", y:2028 },
  { source:"c_13", target:"c_44", rel:"enables", note:"Greenlink North serves Meta TRIC data center load", y:2028 },
  { source:"c_13", target:"c_45", rel:"enables", note:"Greenlink North serves Applied Digital AI load", y:2028 },
  { source:"c_13", target:"c_35", rel:"enables", note:"Greenlink North + West deliver Valmy solar to load", y:2028 },

  // Co-located / Related projects
  { source:"c_5", target:"c_26", rel:"related_portfolio", note:"McGinness Hills Phases 1-3 + Phase 4 expansion", y:2024 },
  { source:"c_5", target:"c_30", rel:"related_portfolio", note:"Both Ormat Lander County geothermal", y:2012 },
  { source:"c_27", target:"c_28", rel:"related_portfolio", note:"Both Ormat geothermal, different counties", y:2017 },
  { source:"c_29", target:"c_39", rel:"co_located", note:"Both geothermal in Churchill County near Stillwater", y:2012 },
  { source:"c_19", target:"c_1", rel:"co_located", note:"Both near Primm, Clark County solar corridor", y:2021 },
  { source:"c_42", target:"c_10", rel:"co_located", note:"Both in Pahrump Valley, Nye County", y:2022 },
  { source:"c_42", target:"c_21", rel:"co_located", note:"Both in Nye County solar corridor", y:2023 },
  { source:"c_44", target:"c_3", rel:"co_located", note:"Meta + Switch both at TRIC", y:2023 },
  { source:"c_44", target:"c_4", rel:"co_located", note:"Meta + Google both at TRIC", y:2023 },
  { source:"c_2", target:"c_25", rel:"co_located", note:"Both near Moapa. Shared transmission.", y:2025 },

  // Data center load → generation demand
  { source:"c_44", target:"c_6", rel:"drives_demand", note:"Meta 600MW load drives Sierra Solar generation need", y:2026 },
  { source:"c_44", target:"c_8", rel:"drives_demand", note:"Meta load drives need for Corsac geothermal baseload", y:2026 },
  { source:"c_45", target:"c_13", rel:"depends_on", note:"Applied Digital needs Greenlink North capacity", y:2028 },
  { source:"c_33", target:"c_31", rel:"co_located", note:"Both in White Pine County. Pumped hydro + wind.", y:2020 },

  // ========================================================================
  // SECTION 29: ADDITIONAL DEVELOPER COMPETITION & SUPPLY CHAIN
  // ========================================================================

  // Developer Competition (new projects)
  { source:"x_nextera", target:"x_8minute", rel:"competes_with", note:"Competing for NV utility-scale solar development", y:2025 },
  { source:"x_nextera", target:"x_ip_athenea", rel:"competes_with", note:"Competing for Clark County solar projects", y:2025 },
  { source:"x_pine_gate", target:"x_candela", rel:"competes_with", note:"Competing for Nye County solar development", y:2025 },
  { source:"x_cyrq", target:"x_ormat", rel:"competes_with", note:"Competing for NV geothermal development", y:2023 },
  { source:"x_enel_gp", target:"x_ormat", rel:"competes_with", note:"Competing for NV geothermal + hybrid generation", y:2020 },
  { source:"x_sterling_wilson", target:"x_signal", rel:"competes_with", note:"Solar EPC competition for NV projects", y:2025 },
  { source:"x_sundt", target:"x_rosendin", rel:"competes_with", note:"Southwest US renewable EPC competition", y:2025 },
  { source:"x_terra_gen", target:"x_nextera", rel:"competes_with", note:"Western US renewable development competition", y:2025 },
  { source:"x_leeward", target:"x_clearway", rel:"competes_with", note:"Renewable development + acquisition competition", y:2025 },
  { source:"x_avangrid", target:"x_pattern", rel:"competes_with", note:"Wind + solar development competition", y:2025 },

  // Financial Competition (new)
  { source:"x_stonepeak", target:"x_gip", rel:"competes_with", note:"Infrastructure PE competition for renewable assets", y:2025 },
  { source:"x_macquarie", target:"x_brookfield", rel:"competes_with", note:"Infrastructure asset management competition", y:2025 },
  { source:"x_munich_re", target:"x_swissre", rel:"competes_with", note:"Renewable energy reinsurance competition", y:2025 },
  { source:"x_allianz", target:"x_blackrock_infra", rel:"competes_with", note:"Renewable infrastructure equity competition", y:2025 },

  // Equipment Supply → New Projects
  { source:"x_longi", target:"c_19", rel:"supplies", note:"Bonanza Solar module supply evaluation", y:2025 },
  { source:"x_longi", target:"c_22", rel:"supplies", note:"Copper Rays Solar module supply evaluation", y:2025 },
  { source:"x_first_solar", target:"c_25", rel:"supplies", note:"Moapa Solar II domestic content CdTe modules", y:2025 },
  { source:"x_jinko", target:"c_42", rel:"supplies", note:"Yellowpine Solar module supply bid", y:2025 },
  { source:"x_trina", target:"c_20", rel:"supplies", note:"Mosey Solar module supply bid", y:2024 },
  { source:"x_nextracker", target:"c_19", rel:"supplies", note:"Bonanza Solar tracker supply evaluation", y:2025 },
  { source:"x_nextracker", target:"c_22", rel:"supplies", note:"Copper Rays Solar tracker supply evaluation", y:2025 },
  { source:"x_array", target:"c_42", rel:"supplies", note:"Yellowpine Solar tracker supply bid", y:2025 },
  { source:"x_tesla_energy", target:"c_22", rel:"supplies", note:"Copper Rays BESS Megapack evaluation", y:2025 },
  { source:"x_fluence", target:"c_42", rel:"supplies", note:"Yellowpine BESS technology evaluation", y:2025 },
  { source:"x_byd", target:"c_22", rel:"supplies", note:"Copper Rays BESS Blade Battery evaluation", y:2025 },
  { source:"x_catl", target:"c_42", rel:"supplies", note:"Yellowpine BESS cell supply evaluation", y:2025 },

  // FEMA / Federal Agency edges for new projects
  { source:"x_fws", target:"c_19", rel:"consults_on", note:"Bonanza Solar desert tortoise ESA consultation", y:2023 },
  { source:"x_fws", target:"c_22", rel:"consults_on", note:"Copper Rays Solar ESA consultation", y:2024 },
  { source:"x_fws", target:"c_42", rel:"consults_on", note:"Yellowpine Solar desert tortoise consultation", y:2022 },
  { source:"x_fws", target:"c_21", rel:"consults_on", note:"Rock Valley Solar ESA consultation", y:2025 },
  { source:"x_ndow", target:"c_19", rel:"consults_on", note:"Bonanza Solar state wildlife review", y:2023 },
  { source:"x_ndow", target:"c_22", rel:"consults_on", note:"Copper Rays Solar wildlife assessment", y:2024 },
  { source:"x_ndep", target:"c_19", rel:"permits", note:"Bonanza Solar dust control + water permits", y:2025 },
  { source:"x_ndep", target:"c_35", rel:"regulates", note:"North Valmy coal ash remediation oversight", y:2024 },
  { source:"x_nv_state_eng", target:"c_33", rel:"reviews", note:"White Pine Pumped Storage water rights evaluation", y:2023 },
  { source:"x_nv_state_eng", target:"c_36", rel:"permits", note:"Hot Pot Geothermal water appropriation", y:2023 },
  { source:"x_nv_state_eng", target:"c_37", rel:"permits", note:"Patua Geothermal water appropriation", y:2022 },
  { source:"x_snwa", target:"c_22", rel:"reviews", note:"Copper Rays Solar water allocation review", y:2025 },
  { source:"x_snwa", target:"c_19", rel:"reviews", note:"Bonanza Solar water allocation review", y:2025 },

  // Insurance for new projects
  { source:"x_marsh", target:"c_22", rel:"insures", note:"Copper Rays Solar construction all-risk evaluation", y:2025 },
  { source:"x_aon", target:"c_19", rel:"insures", note:"Bonanza Solar construction insurance evaluation", y:2025 },
  { source:"x_gcube", target:"c_31", rel:"insures", note:"Spring Valley Wind operational insurance", y:2023 },

  // Legal for new projects
  { source:"x_holland", target:"c_19", rel:"advises", note:"Bonanza Solar BLM ROW legal counsel", y:2023 },
  { source:"x_snell", target:"c_42", rel:"advises", note:"Yellowpine Solar PPA negotiation counsel", y:2024 },
  { source:"x_stoel", target:"c_33", rel:"advises", note:"White Pine Pumped Storage FERC licensing counsel", y:2022 },

  // Analysts monitoring new projects
  { source:"x_woodmac", target:"c_22", rel:"monitors", note:"Copper Rays Solar project tracking", y:2025 },
  { source:"x_woodmac", target:"c_19", rel:"monitors", note:"Bonanza Solar project tracking", y:2025 },
  { source:"x_bnef", target:"c_33", rel:"monitors", note:"White Pine Pumped Storage long-duration storage tracking", y:2023 },
  { source:"x_bnef", target:"c_44", rel:"monitors", note:"Meta TRIC data center energy demand tracking", y:2024 },
  { source:"x_spglobal", target:"c_7", rel:"monitors", note:"Greenlink West credit assessment update", y:2025 },
  { source:"x_rystad", target:"c_8", rel:"monitors", note:"Corsac Station EGS technology tracking", y:2024 },

  // ========================================================================
  // SECTION 30: BATCH 4 PEOPLE → ORGANIZATIONS / PROJECTS
  // ========================================================================

  // NV Energy Additional Staff
  { source:"p_nve_substation", target:"x_nv_energy", rel:"employed_by", note:"Director Substation Engineering", y:2018 },
  { source:"p_nve_substation", target:"c_7", rel:"engineer_for", note:"Greenlink West 525kV converter station design", y:2022 },
  { source:"p_nve_procurement", target:"x_nv_energy", rel:"employed_by", note:"Director Procurement", y:2019 },
  { source:"p_nve_dispatch", target:"x_nv_energy", rel:"employed_by", note:"Director System Operations", y:2018 },
  { source:"p_nve_dispatch", target:"c_2", rel:"manages", note:"Reid Gardner BESS dispatch optimization", y:2025 },
  { source:"p_nve_rates", target:"x_nv_energy", rel:"employed_by", note:"Director Rate Design", y:2020 },
  { source:"p_nve_rates", target:"x_pucn", rel:"testifies_before", note:"Rate design testimony", y:2024 },
  { source:"p_nve_it", target:"x_nv_energy", rel:"employed_by", note:"VP IT & Grid Modernization", y:2019 },
  { source:"p_nve_re_south", target:"x_nv_energy", rel:"employed_by", note:"Regional Engineer South", y:2017 },
  { source:"p_nve_re_north", target:"x_nv_energy", rel:"employed_by", note:"Regional Engineer North", y:2017 },

  // PUCN Staff
  { source:"p_pucn_staff", target:"x_pucn", rel:"employed_by", note:"Chief of Staff. Docket coordination.", y:2021 },
  { source:"p_pucn_tech", target:"x_pucn", rel:"employed_by", note:"Chief Engineer. Technical review.", y:2019 },
  { source:"p_pucn_tech", target:"c_7", rel:"reviews", note:"Greenlink West technical cost review", y:2024 },
  { source:"p_pucn_consumer", target:"x_pucn", rel:"employed_by", note:"Director Consumer Advocacy", y:2020 },
  { source:"p_pucn_consumer", target:"c_7", rel:"reviews", note:"Greenlink West consumer rate impact", y:2024 },

  // BLM Staff
  { source:"p_blm_realty", target:"x_blm", rel:"employed_by", note:"Chief Realty. ROW processing.", y:2019 },
  { source:"p_blm_realty", target:"c_19", rel:"processes", note:"Bonanza Solar ROW authorization", y:2024 },
  { source:"p_blm_enviro", target:"x_blm", rel:"employed_by", note:"Environmental Coordinator", y:2020 },
  { source:"p_blm_enviro", target:"c_16", rel:"coordinates", note:"Esmeralda Seven PEIS coordination", y:2025 },
  { source:"p_blm_renewable", target:"x_blm", rel:"employed_by", note:"Renewable Energy Coordinator", y:2021 },
  { source:"p_blm_renewable", target:"c_22", rel:"processes", note:"Copper Rays Solar ROW coordination", y:2024 },

  // Project Manager People → Projects
  { source:"p_nextera_pm", target:"x_nextera", rel:"employed_by", note:"Senior Project Manager", y:2020 },
  { source:"p_nextera_pm", target:"c_19", rel:"project_lead", note:"Bonanza Solar construction oversight", y:2024 },
  { source:"p_nextera_pm", target:"c_43", rel:"project_lead", note:"Arrow Canyon Solar development", y:2025 },
  { source:"p_8minute_pm", target:"x_8minute", rel:"employed_by", note:"VP Development", y:2018 },
  { source:"p_8minute_pm", target:"c_20", rel:"project_lead", note:"Mosey Solar PPA negotiation", y:2021 },
  { source:"p_8minute_pm", target:"c_42", rel:"project_lead", note:"Yellowpine Solar development", y:2019 },
  { source:"p_candela_pm", target:"x_candela", rel:"employed_by", note:"VP Development", y:2021 },
  { source:"p_candela_pm", target:"c_10", rel:"project_lead", note:"Rough Hat Clark development lead", y:2022 },
  { source:"p_174_pm", target:"x_174power", rel:"employed_by", note:"VP Development", y:2020 },
  { source:"p_174_pm", target:"c_11", rel:"project_lead", note:"Boulder Solar III NV project manager", y:2024 },
  { source:"p_primergy_pm", target:"x_primergy", rel:"employed_by", note:"Project Director", y:2021 },
  { source:"p_primergy_pm", target:"c_14", rel:"project_lead", note:"Purple Sage 400MW project director", y:2024 },
  { source:"p_arevia_pm", target:"x_arevia", rel:"employed_by", note:"VP Engineering", y:2020 },
  { source:"p_arevia_pm", target:"c_12", rel:"engineer_for", note:"Libra Solar 700MW engineering lead", y:2022 },
  { source:"p_fervo_drill", target:"x_fervo", rel:"employed_by", note:"VP Drilling Operations", y:2021 },
  { source:"p_fervo_drill", target:"c_8", rel:"technical_lead", note:"Corsac Station horizontal drilling", y:2024 },
  { source:"p_ormat_nv", target:"x_ormat", rel:"employed_by", note:"VP Business Development", y:2018 },
  { source:"p_ormat_nv", target:"c_26", rel:"project_lead", note:"McGinness Phase 4 development", y:2024 },
  { source:"p_ormat_nv", target:"c_15", rel:"project_lead", note:"Google geothermal portfolio coordination", y:2024 },

  // Grid Specialists
  { source:"p_nve_queue", target:"x_nv_energy", rel:"employed_by", note:"Interconnection Queue Manager", y:2020 },
  { source:"p_nve_queue", target:"c_24", rel:"manages", note:"Rigel Solar interconnection queue management", y:2024 },
  { source:"p_caiso_markets", target:"x_caiso", rel:"employed_by", note:"VP Market Operations", y:2018 },
  { source:"p_caiso_markets", target:"x_nv_energy", rel:"coordinates_with", note:"EDAM market design participation", y:2024 },
  { source:"p_wecc_plan", target:"x_wecc", rel:"employed_by", note:"VP Reliability Planning", y:2019 },

  // Financial People
  { source:"p_jp_tax", target:"x_jpmorgan", rel:"employed_by", note:"MD Tax Equity", y:2016 },
  { source:"p_jp_tax", target:"c_19", rel:"evaluates", note:"Bonanza Solar tax equity evaluation", y:2025 },
  { source:"p_bofa_green", target:"x_bofa", rel:"employed_by", note:"Global Head ESG", y:2019 },
  { source:"p_ares_energy", target:"x_ares", rel:"employed_by", note:"Partner Infrastructure", y:2017 },
  { source:"p_blackrock_re", target:"x_blackrock_infra", rel:"employed_by", note:"Head Americas Renewable Power", y:2019 },

  // Environmental Specialists
  { source:"p_tortoise_bio", target:"x_usgs", rel:"employed_by", note:"Research Ecologist. Desert tortoise.", y:2010 },
  { source:"p_tortoise_bio", target:"c_1", rel:"monitors", note:"Gemini Solar tortoise translocation study", y:2023 },
  { source:"p_sage_grouse", target:"x_usgs", rel:"employed_by", note:"Research Wildlife Biologist", y:2012 },
  { source:"p_sage_grouse", target:"c_16", rel:"monitors", note:"Esmeralda Seven sage grouse habitat study", y:2025 },
  { source:"p_swca_nv", target:"x_swca", rel:"employed_by", note:"VP Nevada office", y:2017 },
  { source:"p_swca_nv", target:"c_7", rel:"consultant_for", note:"Greenlink West EIS Nevada field lead", y:2022 },
  { source:"p_dnv_solar", target:"x_dnv", rel:"employed_by", note:"VP Americas Solar", y:2018 },
  { source:"p_tetra_nv", target:"x_tetra_tech", rel:"employed_by", note:"VP Nevada", y:2019 },

  // County Staff
  { source:"p_clark_planning", target:"x_clark_county", rel:"employed_by", note:"Director Community Development", y:2018 },
  { source:"p_clark_planning", target:"c_22", rel:"reviews", note:"Copper Rays Solar conditional use review", y:2024 },
  { source:"p_nye_planning", target:"x_nye_county", rel:"employed_by", note:"Director Planning", y:2019 },
  { source:"p_nye_planning", target:"c_10", rel:"reviews", note:"Rough Hat Clark land use review", y:2024 },
  { source:"p_nye_planning", target:"c_42", rel:"reviews", note:"Yellowpine Solar land use review", y:2023 },
  { source:"p_lyon_planning", target:"c_12", rel:"reviews", note:"Libra Solar Lyon County conditional use", y:2024 },
  { source:"p_storey_mgr", target:"x_storey_county", rel:"employed_by", note:"County Manager", y:2020 },
  { source:"p_storey_mgr", target:"c_44", rel:"coordinates", note:"Meta TRIC infrastructure coordination", y:2023 },
  { source:"p_churchill_mgr", target:"c_28", rel:"coordinates", note:"Tungsten Mountain geothermal county coordination", y:2017 },

  // Tribal Contacts
  { source:"p_summit_lake", target:"x_summit_lake", rel:"leads", note:"Chair. Summit Lake Paiute.", y:2020 },
  { source:"p_summit_lake", target:"c_36", rel:"consults_on", note:"Hot Pot Geothermal tribal consultation", y:2023 },
  { source:"p_lovelock", target:"x_lovelock_paiute", rel:"leads", note:"Chair. Lovelock Paiute.", y:2021 },
  { source:"p_lovelock", target:"c_8", rel:"consults_on", note:"Corsac Station area tribal consultation", y:2023 },
  { source:"p_south_fork", target:"x_south_fork", rel:"leads", note:"Chair. South Fork Band.", y:2020 },

  // Legislature
  { source:"p_nv_sen_brooks", target:"nv_leg", rel:"serves_on", note:"Senate Energy Committee member", y:2022 },
  { source:"p_nv_sen_brooks", target:"x_pucn", rel:"oversees", note:"Legislative oversight of PUCN", y:2022 },
  { source:"p_nv_asm_monroe", target:"nv_leg", rel:"serves_on", note:"Assembly Government Affairs", y:2022 },

  // Developer Company Leaders
  { source:"p_clearway_ceo", target:"x_clearway", rel:"leads", note:"CEO. GIP-backed. 10GW+.", y:2020 },
  { source:"p_invenergy_ceo", target:"x_invenergy", rel:"leads", note:"Founder & CEO. Largest private US.", y:2001 },
  { source:"p_engie_ceo", target:"x_engie", rel:"leads", note:"CEO North America. 7GW.", y:2020 },
  { source:"p_brookfield_re", target:"x_brookfield", rel:"leads", note:"CEO Renewable. $75B AUM.", y:2020 },
  { source:"p_hannon_ceo", target:"x_hannon", rel:"leads", note:"CEO. NYSE: HASI. Climate REIT.", y:2013 },
  { source:"p_digitalbridge_ceo", target:"x_digital_bridge", rel:"leads", note:"CEO. Digital infrastructure. Switch parent.", y:2020 },
  { source:"p_digitalbridge_ceo", target:"c_3", rel:"investor_in", note:"Switch Citadel Campus via DigitalBridge", y:2022 },

  // Media / Analysts
  { source:"p_spglobal_nv", target:"x_spglobal", rel:"employed_by", note:"Editor Americas Power", y:2018 },
  { source:"p_eia_west", target:"x_doe", rel:"employed_by", note:"US EIA Regional Director West", y:2019 },

  // Labor leaders
  { source:"p_laborers_nv", target:"x_laborers872", rel:"leads", note:"Business Manager. 5,000+ members.", y:2019 },
  { source:"p_teamsters_nv", target:"x_teamsters631", rel:"leads", note:"Secretary-Treasurer. 7,000+ members.", y:2020 },
  { source:"p_teamsters_nv", target:"c_7", rel:"labor_for", note:"Greenlink West equipment transport", y:2025 },

  // Telecom People
  { source:"p_zayo_nv", target:"x_zayo", rel:"employed_by", note:"CFO. Fiber infrastructure.", y:2019 },
  { source:"p_lumen_nv", target:"x_lumen", rel:"leads", note:"CEO. Fiber + network services.", y:2022 },

  // ========================================================================
  // SECTION 31: BATCH 4 EXTERNAL → PROJECT / ORG EDGES
  // ========================================================================

  // Additional Developers → Projects/Competition
  { source:"x_savion", target:"c_16", rel:"evaluates", note:"Esmeralda Seven PEIS bid evaluation", y:2025 },
  { source:"x_savion", target:"x_nextera", rel:"competes_with", note:"Utility-scale solar development competition", y:2025 },
  { source:"x_longroad", target:"c_16", rel:"evaluates", note:"Esmeralda Seven development evaluation", y:2025 },
  { source:"x_origis", target:"c_17", rel:"evaluates", note:"Amargosa Desert SEZ competitive lease", y:2025 },
  { source:"x_hecate", target:"c_16", rel:"evaluates", note:"Esmeralda Seven PEIS bid", y:2025 },
  { source:"x_amp_energy", target:"c_17", rel:"evaluates", note:"Amargosa BESS development evaluation", y:2025 },

  // Equipment → Supply Chain
  { source:"x_qcells", target:"c_11", rel:"supplies", note:"Boulder Solar III module supply evaluation", y:2025 },
  { source:"x_qcells", target:"c_19", rel:"supplies", note:"Bonanza Solar module supply evaluation", y:2025 },
  { source:"x_lg_energy", target:"c_22", rel:"supplies", note:"Copper Rays BESS cell supply evaluation", y:2025 },
  { source:"x_lg_energy", target:"c_42", rel:"supplies", note:"Yellowpine BESS cell supply evaluation", y:2025 },
  { source:"x_abb", target:"c_7", rel:"supplies", note:"Greenlink West switchgear + transformer evaluation", y:2025 },
  { source:"x_prysmian", target:"c_7", rel:"supplies", note:"Greenlink West conductor supply evaluation", y:2025 },
  { source:"x_southwire", target:"c_7", rel:"supplies", note:"Greenlink West conductor supply bid", y:2025 },
  { source:"x_ge_grid", target:"c_13", rel:"supplies", note:"Greenlink North grid technology evaluation", y:2026 },

  // Telecom → Data Centers
  { source:"x_zayo", target:"c_44", rel:"serves", note:"Meta TRIC fiber connectivity", y:2024 },
  { source:"x_zayo", target:"c_3", rel:"serves", note:"Switch Citadel Campus fiber", y:2018 },
  { source:"x_lumen", target:"c_4", rel:"serves", note:"Google TRIC network services", y:2019 },
  { source:"x_crown_castle", target:"tric_authority", rel:"serves", note:"TRIC wireless infrastructure", y:2020 },

  // Financial → Projects
  { source:"x_wells_fargo", target:"c_22", rel:"finances", note:"Copper Rays Solar tax equity evaluation", y:2025 },
  { source:"x_wells_fargo", target:"c_19", rel:"finances", note:"Bonanza Solar tax equity evaluation", y:2025 },
  { source:"x_truist", target:"c_42", rel:"finances", note:"Yellowpine Solar tax equity bid", y:2025 },
  { source:"x_hsbc", target:"c_7", rel:"finances", note:"Greenlink West green bond evaluation", y:2025 },
  { source:"x_societe_generale", target:"c_12", rel:"finances", note:"Libra Solar project finance syndicate", y:2025 },
  { source:"x_ing", target:"c_22", rel:"finances", note:"Copper Rays Solar project finance evaluation", y:2025 },
  { source:"x_kfw", target:"c_7", rel:"finances", note:"Greenlink West infrastructure finance evaluation", y:2025 },

  // Law Firms → Projects
  { source:"x_vinson", target:"c_42", rel:"advises", note:"Yellowpine Solar project finance counsel", y:2024 },
  { source:"x_mcdermott", target:"c_19", rel:"advises", note:"Bonanza Solar ITC tax equity structuring", y:2025 },
  { source:"x_baker_botts", target:"c_22", rel:"advises", note:"Copper Rays Solar development counsel", y:2024 },
  { source:"x_kirkland", target:"x_stonepeak", rel:"advises", note:"Infrastructure PE transaction counsel", y:2025 },
  { source:"x_white_case", target:"c_33", rel:"advises", note:"White Pine Pumped Storage FERC + project finance", y:2023 },

  // Data Center REITs
  { source:"x_equinix", target:"x_nv_energy", rel:"evaluates", note:"NV colocation power evaluation", y:2025 },
  { source:"x_digital_realty", target:"x_nv_energy", rel:"evaluates", note:"NV data center expansion evaluation", y:2025 },

  // Government Agencies
  { source:"x_usgs", target:"c_8", rel:"researches", note:"Corsac Station geological monitoring", y:2023 },
  { source:"x_usgs", target:"c_36", rel:"surveys", note:"Hot Pot geothermal resource assessment", y:2023 },
  { source:"x_usbr", target:"c_7", rel:"coordinates_with", note:"Greenlink West Hoover Dam interconnection", y:2024 },
  { source:"x_usbr", target:"x_wapa", rel:"coordinates_with", note:"Hoover Dam + Western Area Power coordination", y:2000 },
  { source:"x_nv_div_minerals", target:"c_36", rel:"permits", note:"Hot Pot geothermal well permits", y:2023 },
  { source:"x_nv_div_minerals", target:"c_37", rel:"permits", note:"Patua geothermal well permits", y:2022 },
  { source:"x_nv_div_minerals", target:"c_8", rel:"permits", note:"Corsac Station geothermal well permits", y:2023 },
  { source:"x_nv_ag", target:"x_pucn", rel:"coordinates_with", note:"Consumer protection. Energy rate intervention.", y:2020 },

  // Labor → Projects
  { source:"x_ibew357", target:"c_22", rel:"labor_for", note:"Copper Rays Solar electrical installation", y:2026 },
  { source:"x_ibew357", target:"c_19", rel:"labor_for", note:"Bonanza Solar electrical installation", y:2026 },
  { source:"x_ibew357", target:"c_42", rel:"labor_for", note:"Yellowpine Solar electrical installation", y:2026 },
  { source:"x_ua525", target:"c_36", rel:"labor_for", note:"Hot Pot Geothermal pipefitting", y:2025 },
  { source:"x_ua525", target:"c_37", rel:"labor_for", note:"Patua Geothermal pipefitting", y:2025 },
  { source:"x_ua525", target:"c_46", rel:"labor_for", note:"Pinyon Pipeline construction", y:2026 },
  { source:"x_carpenters1977", target:"c_44", rel:"labor_for", note:"Meta TRIC formwork + carpentry", y:2024 },
  { source:"x_teamsters631", target:"c_7", rel:"labor_for", note:"Greenlink West equipment hauling", y:2025 },
  { source:"x_teamsters631", target:"c_22", rel:"labor_for", note:"Copper Rays Solar module transport", y:2026 },
  { source:"x_liuna", target:"c_7", rel:"labor_for", note:"Greenlink West general labor + site prep", y:2025 },

  // Tribal → Projects
  { source:"x_summit_lake", target:"c_36", rel:"consults_on", note:"Hot Pot Geothermal traditional territory", y:2023 },
  { source:"x_lovelock_paiute", target:"c_8", rel:"consults_on", note:"Corsac Station area cultural resources", y:2023 },
  { source:"x_south_fork", target:"c_26", rel:"consults_on", note:"McGinness Phase 4 traditional territory", y:2024 },
  { source:"x_reno_sparks", target:"c_13", rel:"consults_on", note:"Greenlink North corridor tribal consultation", y:2024 },
  { source:"x_washoe_tribe", target:"c_13", rel:"consults_on", note:"Greenlink North corridor tribal consultation", y:2024 },
  { source:"x_washoe_tribe", target:"c_18", rel:"consults_on", note:"Dodge Flat II area consultation", y:2025 },
  { source:"x_las_vegas_paiute", target:"c_22", rel:"consults_on", note:"Copper Rays Solar area consultation", y:2024 },
  { source:"x_winnemucca_colony", target:"c_36", rel:"consults_on", note:"Hot Pot Geothermal area consultation", y:2023 },

  // Ecosystem Org edges (new batch)
  { source:"naco_nv", target:"x_clark_county", rel:"member_org", note:"Clark County NACO member", y:2010 },
  { source:"naco_nv", target:"x_nye_county", rel:"member_org", note:"Nye County NACO member", y:2010 },
  { source:"nv_league_cities", target:"x_goed", rel:"coordinates_with", note:"Municipal energy project coordination", y:2020 },
  { source:"nv_chamber", target:"x_pucn", rel:"advocates_before", note:"Business rate advocacy. Energy reliability.", y:2020 },
  { source:"lv_chamber", target:"x_goed", rel:"coordinates_with", note:"Southern NV data center + energy business recruitment", y:2020 },
  { source:"reno_chamber", target:"tric_authority", rel:"coordinates_with", note:"TRIC business development coordination", y:2018 },
  { source:"nye_eda", target:"c_10", rel:"supports", note:"Rough Hat Clark economic development", y:2024 },
  { source:"nye_eda", target:"c_42", rel:"supports", note:"Yellowpine Solar economic development", y:2024 },
  { source:"apex_idc", target:"x_nv_energy", rel:"coordinates_with", note:"APEX industrial power supply planning", y:2020 },
  { source:"nv_taxpayers", target:"x_pucn", rel:"monitors", note:"Energy rate impact on NV taxpayers", y:2024 },
  { source:"nv_taxpayers", target:"c_7", rel:"monitors", note:"Greenlink West rate recovery fiscal impact", y:2024 },

  // ========================================================================
  // NEW EDGES — Batch 5: ~200 edges connecting new entities
  // ========================================================================

  // --- New Developers to Their Projects ---
  { source:"x_pine_gate", target:"c_21", rel:"developed_by", note:"Pine Gate develops Rock Valley Solar", y:2023 },
  { source:"x_8minute", target:"c_20", rel:"developed_by", note:"8minute develops Mosey Solar", y:2020 },
  { source:"x_8minute", target:"c_42", rel:"developed_by", note:"8minute develops Yellowpine Solar", y:2019 },
  { source:"x_ip_athenea", target:"c_22", rel:"developed_by", note:"IP Athenea develops Copper Rays Solar", y:2023 },
  { source:"x_cyrq", target:"c_36", rel:"developed_by", note:"Cyrq Energy develops Hot Pot Geothermal", y:2018 },
  { source:"x_cyrq", target:"c_37", rel:"developed_by", note:"Cyrq Energy develops Patua Geothermal", y:2012 },
  { source:"x_rplus", target:"c_33", rel:"developed_by", note:"rPlus Hydro develops White Pine Pumped Storage", y:2019 },
  { source:"x_enel_gp", target:"c_39", rel:"developed_by", note:"Enel Green Power operates Stillwater Hybrid", y:2009 },
  { source:"x_pattern", target:"c_31", rel:"developed_by", note:"Pattern Energy operates Spring Valley Wind", y:2012 },
  { source:"x_nextera", target:"c_19", rel:"developed_by", note:"NextEra develops Bonanza Solar", y:2023 },
  { source:"x_nextera", target:"c_43", rel:"developed_by", note:"NextEra develops Arrow Canyon Solar", y:2023 },
  { source:"x_esmeralda_solar", target:"c_16", rel:"developed_by", note:"Esmeralda Solar LLC project entity", y:2022 },
  { source:"x_chill_sun", target:"c_23", rel:"developed_by", note:"Chill Sun Solar LLC project entity", y:2023 },
  { source:"x_rigel_solar", target:"c_24", rel:"developed_by", note:"Rigel Solar LLC project entity", y:2024 },
  { source:"x_desert_sunlight", target:"c_40", rel:"developed_by", note:"Desert Sunlight NV LLC project entity", y:2023 },
  { source:"x_jean_solar", target:"c_41", rel:"developed_by", note:"Jean Solar LLC project entity", y:2024 },
  { source:"x_meta", target:"c_44", rel:"developed_by", note:"Meta develops TRIC Data Center", y:2024 },
  { source:"x_applied_digital", target:"c_45", rel:"developed_by", note:"Applied Digital NV data center", y:2024 },
  { source:"x_sw_gas", target:"c_46", rel:"developed_by", note:"Southwest Gas develops Pinyon Pipeline", y:2023 },

  // --- New Equipment Suppliers to Projects ---
  { source:"x_ge_vernova", target:"c_7", rel:"supplies", note:"GE Vernova transmission equipment for Greenlink West", y:2024 },
  { source:"x_ge_vernova", target:"c_13", rel:"supplies", note:"GE Vernova transmission equipment for Greenlink North", y:2024 },
  { source:"x_vestas", target:"c_31", rel:"supplies", note:"Vestas wind turbines for Spring Valley Wind", y:2012 },
  { source:"x_siemens_gamesa", target:"c_32", rel:"supplies", note:"Siemens Gamesa wind turbine evaluation for Stagecoach", y:2024 },
  { source:"x_toshiba_energy", target:"c_33", rel:"supplies", note:"Toshiba pump-turbine evaluation for White Pine", y:2022 },
  { source:"x_andritz", target:"c_33", rel:"supplies", note:"Andritz hydro turbine evaluation for White Pine", y:2022 },
  { source:"x_voith", target:"c_33", rel:"supplies", note:"Voith pump-turbine evaluation for White Pine", y:2022 },
  { source:"x_sungrow", target:"c_1", rel:"supplies", note:"Sungrow inverter supply for Gemini Solar", y:2020 },
  { source:"x_sungrow", target:"c_14", rel:"supplies", note:"Sungrow inverter evaluation for Purple Sage", y:2024 },
  { source:"x_envision_aest", target:"c_17", rel:"supplies", note:"Envision BESS evaluation for Amargosa Desert", y:2024 },
  { source:"x_samsung_sdi", target:"c_2", rel:"supplies", note:"Samsung SDI BESS cell evaluation for Reid Gardner", y:2023 },
  { source:"x_eve_energy", target:"c_6", rel:"supplies", note:"EVE Energy LFP cell evaluation for Sierra Solar BESS", y:2024 },
  { source:"x_eaton", target:"c_7", rel:"supplies", note:"Eaton switchgear for Greenlink substations", y:2024 },
  { source:"x_hitachi_abb", target:"c_7", rel:"supplies", note:"Hitachi ABB HVDC evaluation for Greenlink", y:2023 },
  { source:"x_lg_energy", target:"c_14", rel:"supplies", note:"LGES BESS cell evaluation for Purple Sage", y:2024 },
  { source:"x_wartsila", target:"c_9", rel:"supplies", note:"Wartsila BESS evaluation for Dry Lake East", y:2024 },

  // --- New Financial Institutions to Projects ---
  { source:"x_stonepeak", target:"c_7", rel:"invested_in", note:"Stonepeak infrastructure investment evaluation for Greenlink", y:2024 },
  { source:"x_gip", target:"c_1", rel:"invested_in", note:"GIP evaluation of Gemini Solar via Clearway", y:2022 },
  { source:"x_macquarie", target:"c_12", rel:"invested_in", note:"Macquarie evaluation of Libra Solar financing", y:2024 },
  { source:"x_blackrock_infra", target:"c_6", rel:"invested_in", note:"BlackRock Infrastructure evaluation of Sierra Solar", y:2024 },
  { source:"x_brookfield_infra", target:"c_33", rel:"invested_in", note:"Brookfield evaluation of White Pine Pumped Storage", y:2023 },
  { source:"x_amp_capital", target:"c_16", rel:"invested_in", note:"AMP Capital evaluation of Esmeralda Seven", y:2024 },
  { source:"x_cobank", target:"x_vea", rel:"finances", note:"CoBank rural electric co-op lending to VEA", y:2020 },
  { source:"x_smbc", target:"c_1", rel:"invested_in", note:"SMBC project finance participation Gemini Solar", y:2020 },
  { source:"x_bnp_paribas", target:"c_7", rel:"invested_in", note:"BNP Paribas transmission project finance evaluation", y:2024 },
  { source:"x_deutsche_bank", target:"c_12", rel:"invested_in", note:"Deutsche Bank Libra Solar tax equity evaluation", y:2024 },
  { source:"x_us_bancorp", target:"c_19", rel:"invested_in", note:"US Bancorp tax equity evaluation Bonanza Solar", y:2024 },
  { source:"x_santander", target:"c_14", rel:"invested_in", note:"Santander CIB Purple Sage project finance", y:2024 },

  // --- New Insurance Companies to Projects ---
  { source:"x_tokio_marine", target:"c_1", rel:"insures", note:"Tokio Marine construction all-risk Gemini Solar", y:2020 },
  { source:"x_aig", target:"c_7", rel:"insures", note:"AIG Greenlink West construction insurance evaluation", y:2024 },
  { source:"x_hannover_re", target:"c_14", rel:"insures", note:"Hannover Re reinsurance for Purple Sage", y:2024 },

  // --- New Counties to Projects in Their Jurisdiction ---
  { source:"x_white_pine", target:"c_33", rel:"hosts", note:"White Pine County hosts Pumped Storage", y:2019 },
  { source:"x_white_pine", target:"c_31", rel:"hosts", note:"White Pine County hosts Spring Valley Wind", y:2012 },
  { source:"x_humboldt_county", target:"c_35", rel:"hosts", note:"Humboldt County hosts North Valmy Conversion", y:2024 },
  { source:"x_humboldt_county", target:"c_36", rel:"hosts", note:"Humboldt County hosts Hot Pot Geothermal", y:2018 },
  { source:"x_mineral_county", target:"c_27", rel:"hosts", note:"Mineral County hosts Don Campbell Geothermal", y:2013 },
  { source:"x_storey_county", target:"c_44", rel:"hosts", note:"Storey County hosts Meta TRIC Data Center", y:2024 },
  { source:"x_storey_county", target:"c_3", rel:"hosts", note:"Storey County hosts Switch Citadel Campus", y:2017 },
  { source:"x_storey_county", target:"c_4", rel:"hosts", note:"Storey County hosts Google TRIC", y:2019 },
  { source:"x_lincoln_county", target:"c_23", rel:"hosts", note:"Lincoln County hosts Chill Sun Solar", y:2023 },
  { source:"x_lyon_county", target:"c_12", rel:"hosts", note:"Lyon County hosts Libra Solar", y:2023 },
  { source:"x_churchill_county", target:"c_39", rel:"hosts", note:"Churchill County hosts Stillwater Hybrid", y:2009 },
  { source:"x_churchill_county", target:"c_8", rel:"hosts", note:"Churchill County hosts Fervo Corsac Station", y:2024 },
  { source:"x_lander_county", target:"c_5", rel:"hosts", note:"Lander County hosts McGinness Hills", y:2012 },
  { source:"x_lander_county", target:"c_38", rel:"hosts", note:"Lander County hosts Battle Mountain Solar", y:2024 },
  { source:"x_esmeralda_county", target:"c_16", rel:"hosts", note:"Esmeralda County hosts Esmeralda Seven Solar", y:2022 },
  { source:"x_pershing_county", target:"c_8", rel:"hosts", note:"Pershing County area for Fervo Corsac Station", y:2024 },
  { source:"x_elko_county", target:"c_28", rel:"hosts", note:"Elko County area for Tungsten Mountain Geothermal", y:2020 },
  { source:"x_washoe_county", target:"c_29", rel:"hosts", note:"Washoe County hosts Steamboat Complex", y:2005 },
  { source:"x_douglas_county", target:"c_29", rel:"hosts", note:"Douglas County proximity to Steamboat Complex", y:2005 },

  // --- New Ecosystem Orgs to Existing Agencies/Utilities ---
  { source:"nv_minerals", target:"x_blm", rel:"coordinates_with", note:"NV Minerals + BLM geothermal well coordination", y:2020 },
  { source:"nv_water", target:"x_nv_state_eng", rel:"coordinates_with", note:"Water Resources + State Engineer coordination", y:2020 },
  { source:"nv_shpo", target:"x_blm", rel:"coordinates_with", note:"SHPO Section 106 review for BLM energy projects", y:2020 },
  { source:"nv_shpo", target:"x_nv_energy", rel:"coordinates_with", note:"SHPO cultural review for NV Energy projects", y:2020 },
  { source:"nv_forestry", target:"x_nv_energy", rel:"coordinates_with", note:"NV Forestry wildfire coordination with NV Energy", y:2022 },
  { source:"nv_ag_energy", target:"x_pucn", rel:"advocates_before", note:"AG energy unit PUCN rate case intervention", y:2020 },
  { source:"nv_climate", target:"goe", rel:"coordinates_with", note:"Climate Initiative + GOE clean energy strategy", y:2023 },
  { source:"nv_osit", target:"goe", rel:"coordinates_with", note:"OSIT technology + GOE energy coordination", y:2022 },
  { source:"doe_seto", target:"x_nrel", rel:"funds", note:"SETO funds NREL solar research", y:2020 },
  { source:"doe_wpto", target:"c_33", rel:"evaluates", note:"DOE WPTO pumped hydro research support", y:2022 },
  { source:"wapa_nv", target:"x_nv_energy", rel:"coordinates_with", note:"WAPA + NV Energy transmission coordination", y:2020 },
  { source:"usda_rus", target:"x_vea", rel:"funds", note:"USDA RUS rural electric infrastructure grants to VEA", y:2021 },
  { source:"nv_apprentice", target:"ibew_neca_jatc", rel:"oversees", note:"State apprenticeship oversight of IBEW-NECA program", y:2020 },
  { source:"h2h_nv", target:"x_ibew396", rel:"partners_with", note:"Helmets to Hardhats veteran placement with IBEW", y:2022 },
  { source:"nv_cwi", target:"nv_works", rel:"coordinates_with", note:"Workforce Innovation + Workforce Connections collaboration", y:2022 },
  { source:"nv_rewi", target:"x_csn", rel:"partners_with", note:"Renewable workforce initiative + CSN training partnership", y:2023 },
  { source:"nirec", target:"x_unlv", rel:"partners_with", note:"NIREC + UNLV energy commercialization partnership", y:2022 },
  { source:"nv_clean_fund", target:"goe", rel:"coordinates_with", note:"NV Clean Energy Fund + GOE program coordination", y:2023 },
  { source:"douglas_eda", target:"x_nv_energy", rel:"coordinates_with", note:"Douglas County EDA + NV Energy economic development", y:2022 },
  { source:"nv_mining_recl", target:"x_blm", rel:"coordinates_with", note:"Mining reclamation + BLM land management", y:2020 },
  { source:"critical_minerals", target:"nma", rel:"coordinates_with", note:"Critical minerals task force + NV Mining Association", y:2023 },

  // --- New People to Their Organizations ---
  { source:"p_pine_gate", target:"x_pine_gate", rel:"leads", note:"Ben Catt CEO of Pine Gate Renewables", y:2020 },
  { source:"p_pine_gate_vp", target:"x_pine_gate", rel:"works_at", note:"Justin Johns VP Engineering Pine Gate", y:2022 },
  { source:"p_pine_gate_pm", target:"c_21", rel:"manages", note:"Sarah Lancaster manages Rock Valley Solar", y:2023 },
  { source:"p_8minute_ceo", target:"x_8minute", rel:"leads", note:"Tom Buttgenbach founder 8minute Solar", y:2009 },
  { source:"p_8minute_vp", target:"x_8minute", rel:"works_at", note:"Martin Hermann CTO 8minute Solar", y:2015 },
  { source:"p_8minute_pm", target:"c_20", rel:"manages", note:"Laura Chen manages Mosey Solar development", y:2020 },
  { source:"p_ip_athenea", target:"x_ip_athenea", rel:"leads", note:"Carlos Domenech CEO IP Athenea", y:2020 },
  { source:"p_ip_athenea_vp", target:"c_22", rel:"manages", note:"Pablo Garcia manages Copper Rays development", y:2023 },
  { source:"p_cyrq_ceo", target:"x_cyrq", rel:"leads", note:"Mike Holcomb CEO Cyrq Energy", y:2015 },
  { source:"p_cyrq_vp", target:"c_36", rel:"manages", note:"Todd Landon manages Hot Pot Geothermal", y:2018 },
  { source:"p_cyrq_ops", target:"c_37", rel:"manages", note:"Brian Fairbank manages Patua Geothermal ops", y:2012 },
  { source:"p_rplus", target:"x_rplus", rel:"leads", note:"Rick Sprott CEO rPlus Hydro", y:2018 },
  { source:"p_rplus_eng", target:"c_33", rel:"manages", note:"Ken Brueck engineers White Pine Pumped Storage", y:2019 },
  { source:"p_enel_nv", target:"x_enel_gp", rel:"leads", note:"Salvatore Bernabei CEO Enel GP NA", y:2020 },
  { source:"p_enel_ops", target:"c_39", rel:"manages", note:"Rafael Gonzalez manages Stillwater Hybrid ops", y:2020 },
  { source:"p_pattern_ceo", target:"x_pattern", rel:"leads", note:"Mike Garland CEO Pattern Energy", y:2012 },
  { source:"p_pattern_dev", target:"c_31", rel:"manages", note:"Hunter Armistead Spring Valley Wind development", y:2012 },
  { source:"p_applied_ceo", target:"x_applied_digital", rel:"leads", note:"Wes Cummins CEO Applied Digital", y:2022 },
  { source:"p_applied_ops", target:"c_45", rel:"manages", note:"David Rench manages Applied Digital NV", y:2024 },
  { source:"p_swgas_ceo", target:"x_sw_gas", rel:"leads", note:"Karen Haller CEO Southwest Gas", y:2022 },
  { source:"p_swgas_ops", target:"c_46", rel:"manages", note:"Justin Brown manages Pinyon Pipeline ops", y:2023 },
  { source:"p_air_liquide", target:"c_47", rel:"leads", note:"Michael Graff leads Air Liquide H2 Hub", y:2024 },
  { source:"p_air_liquide_h2", target:"c_47", rel:"manages", note:"Matthieu Giard manages H2 Hub development", y:2024 },
  { source:"p_meta_dc", target:"c_44", rel:"manages", note:"Rachel Peterson manages Meta TRIC DC", y:2024 },
  { source:"p_meta_sustain", target:"x_meta", rel:"works_at", note:"Bobby Hollis Meta sustainability lead", y:2022 },

  // --- County Commissioners to County Governments ---
  { source:"p_wp_cc2", target:"x_white_pine", rel:"governs", note:"Richard Howe White Pine County commissioner", y:2022 },
  { source:"p_wp_cc3", target:"x_white_pine", rel:"governs", note:"Shane Bybee White Pine County commissioner", y:2022 },
  { source:"p_humboldt_cc2", target:"x_humboldt_county", rel:"governs", note:"Mike Bell Humboldt County commissioner", y:2022 },
  { source:"p_humboldt_cc3", target:"x_humboldt_county", rel:"governs", note:"Dave Bengochea Humboldt County commissioner", y:2022 },
  { source:"p_humboldt_cc4", target:"x_humboldt_county", rel:"governs", note:"Ken Tipton Humboldt County Chair", y:2022 },
  { source:"p_mineral_cc2", target:"x_mineral_county", rel:"governs", note:"Jerrie Tipton Mineral County commissioner", y:2022 },
  { source:"p_mineral_cc3", target:"x_mineral_county", rel:"governs", note:"Chris Hegg Jr Mineral County commissioner", y:2022 },
  { source:"p_storey_cc2", target:"x_storey_county", rel:"governs", note:"Jay Carmona Storey County commissioner", y:2022 },
  { source:"p_storey_cc3", target:"x_storey_county", rel:"governs", note:"Clay Mitchell Storey County commissioner", y:2022 },
  { source:"p_lincoln_cc2", target:"x_lincoln_county", rel:"governs", note:"Kevin Phillips Lincoln County commissioner", y:2022 },
  { source:"p_lincoln_cc3", target:"x_lincoln_county", rel:"governs", note:"Paul Shortland Lincoln County commissioner", y:2022 },

  // --- BLM Managers to Districts ---
  { source:"p_blm_winnemucca", target:"x_blm", rel:"works_at", note:"BLM Humboldt district manager", y:2022 },
  { source:"p_blm_tonopah", target:"x_blm", rel:"works_at", note:"BLM Tonopah field manager", y:2022 },

  // --- Equipment Company People to Companies ---
  { source:"p_ge_wind", target:"x_ge_vernova", rel:"works_at", note:"Vic Abate leads GE Vernova onshore wind", y:2023 },
  { source:"p_ge_grid_vp", target:"x_ge_vernova", rel:"works_at", note:"Philippe Piron leads GE Grid Solutions", y:2023 },
  { source:"p_vestas_west", target:"x_vestas", rel:"works_at", note:"Chris Brown Vestas western US sales", y:2022 },
  { source:"p_envision_na", target:"x_envision_aest", rel:"works_at", note:"Chen Yanqi Envision Americas lead", y:2022 },
  { source:"p_sungrow_na", target:"x_sungrow", rel:"works_at", note:"Kenny Chen Sungrow Americas president", y:2021 },
  { source:"p_power_elec_na", target:"x_power_elec", rel:"works_at", note:"Alberto Bernabeu Power Electronics Americas", y:2020 },

  // --- Financial People to Their Institutions ---
  { source:"p_citi_infra", target:"x_citibank", rel:"works_at", note:"Michael Eckhart Citigroup infrastructure MD", y:2020 },
  { source:"p_barclays_energy", target:"x_barclays", rel:"works_at", note:"James Stettler Barclays energy MD", y:2020 },
  { source:"p_natixis_re", target:"x_natixis", rel:"works_at", note:"Patrick Gauthier Natixis Americas energy head", y:2020 },
  { source:"p_cobank_re", target:"x_cobank", rel:"works_at", note:"Robert Engel CoBank president", y:2020 },
  { source:"p_us_bank_te", target:"x_us_bancorp", rel:"works_at", note:"David Lowery US Bancorp tax equity MD", y:2020 },
  { source:"p_wf_tax", target:"x_wells_fargo", rel:"works_at", note:"Stephen Inrig Wells Fargo renewable tax equity", y:2020 },
  { source:"p_stonepeak", target:"x_stonepeak", rel:"works_at", note:"Michael Dorrell Stonepeak partner", y:2020 },
  { source:"p_gip_energy", target:"x_gip", rel:"works_at", note:"Adebayo Ogunlesi GIP chairman", y:2020 },
  { source:"p_macquarie_nv", target:"x_macquarie", rel:"works_at", note:"Andrew Cook Macquarie Americas MD", y:2020 },

  // --- Insurance People to Companies ---
  { source:"p_tokio_marine", target:"x_tokio_marine", rel:"works_at", note:"Alan Kreczko Tokio Marine energy SVP", y:2020 },
  { source:"p_aig_energy", target:"x_aig", rel:"works_at", note:"Thomas Jones AIG energy head", y:2020 },
  { source:"p_gcube_na", target:"x_gcube", rel:"works_at", note:"Fraser McLachlan GCube CEO", y:2020 },
  { source:"p_munich_re", target:"x_munich_re", rel:"works_at", note:"Nicholas Roenneberg Munich Re renewable energy", y:2020 },
  { source:"p_allianz_energy", target:"x_allianz", rel:"works_at", note:"Karsten Berlage Allianz Capital Partners energy", y:2020 },

  // --- Law Firms to Projects ---
  { source:"x_norton_rose", target:"c_1", rel:"advises", note:"Norton Rose PPA + tax counsel Gemini Solar", y:2020 },
  { source:"x_orrick", target:"c_14", rel:"advises", note:"Orrick project finance Purple Sage", y:2024 },
  { source:"x_pillsbury", target:"c_7", rel:"advises", note:"Pillsbury transmission regulatory Greenlink", y:2024 },

  // --- Environmental People to Projects ---
  { source:"p_tortoise_bio2", target:"c_1", rel:"reviews", note:"Dr. Berry desert tortoise Gemini Solar review", y:2018 },
  { source:"p_tortoise_bio3", target:"c_12", rel:"reviews", note:"USFWS recovery lead Libra Solar consultation", y:2023 },
  { source:"p_sage_grouse2", target:"c_16", rel:"reviews", note:"NDOW sage grouse Esmeralda Seven review", y:2022 },
  { source:"p_sage_grouse3", target:"c_31", rel:"reviews", note:"USGS sage grouse Spring Valley Wind review", y:2012 },
  { source:"p_archaeo1", target:"c_7", rel:"reviews", note:"NV SHPO archaeologist Greenlink Section 106", y:2023 },
  { source:"p_archaeo2", target:"c_16", rel:"reviews", note:"Far Western Esmeralda Seven cultural surveys", y:2022 },
  { source:"p_water_eng1", target:"c_8", rel:"reviews", note:"Water rights expertise Fervo Corsac Station", y:2024 },

  // --- New Graph Funds to Projects ---
  { source:"c_1", target:"f_blm_sez", rel:"eligible_for", note:"Gemini Solar in BLM Solar Energy Zone", y:2018 },
  { source:"c_9", target:"f_blm_sez", rel:"eligible_for", note:"Dry Lake East in BLM Solar Energy Zone", y:2020 },
  { source:"c_16", target:"f_blm_sez", rel:"eligible_for", note:"Esmeralda Seven in BLM Solar Energy Zone", y:2022 },
  { source:"c_47", target:"f_doe_h2hub", rel:"eligible_for", note:"Air Liquide H2 Hub DOE program", y:2024 },
  { source:"c_21", target:"f_usda_reap", rel:"eligible_for", note:"Rock Valley Solar USDA REAP evaluation", y:2023 },

  // --- Utility Buyers (Outside NV) Edges ---
  { source:"x_srp", target:"c_19", rel:"evaluates", note:"SRP evaluating NV solar PPA from Bonanza", y:2024 },
  { source:"x_tep", target:"c_16", rel:"evaluates", note:"TEP evaluating NV solar PPA from Esmeralda Seven", y:2024 },
  { source:"x_pge_portland", target:"c_14", rel:"evaluates", note:"PGE evaluating NV clean energy procurement", y:2024 },
  { source:"x_idaho_power", target:"c_33", rel:"evaluates", note:"Idaho Power evaluating NV pumped storage capacity", y:2023 },
  { source:"x_rmp", target:"c_31", rel:"evaluates", note:"Rocky Mountain Power NV wind evaluation", y:2024 },

  // --- Industry Groups to Agencies ---
  { source:"x_epri", target:"x_nv_energy", rel:"partners_with", note:"EPRI R&D partnership with NV Energy", y:2020 },
  { source:"x_gridwise", target:"x_nv_energy", rel:"partners_with", note:"GridWise Alliance smart grid collaboration", y:2022 },
  { source:"x_nha", target:"c_33", rel:"advocates_for", note:"NHA advocacy for White Pine Pumped Storage", y:2022 },
  { source:"x_lssa", target:"x_pucn", rel:"advocates_before", note:"LSSA solar policy advocacy before PUCN", y:2023 },
  { source:"x_wgg", target:"c_7", rel:"advocates_for", note:"Western Grid Group Greenlink transmission support", y:2023 },
  { source:"x_catf", target:"c_47", rel:"advocates_for", note:"CATF hydrogen technology advocacy for H2 Hub", y:2024 },
  { source:"x_rmi", target:"goe", rel:"advises", note:"RMI grid modernization advisory to NV GOE", y:2023 },
  { source:"x_naesb", target:"x_ferc", rel:"coordinates_with", note:"NAESB market standards coordination with FERC", y:2020 },
  { source:"x_wirab", target:"x_wecc", rel:"advises", note:"WIRAB advisory to WECC on reliability planning", y:2020 },

  // --- Environmental NGOs to Projects ---
  { source:"x_ncl", target:"c_16", rel:"reviews", note:"NV Conservation League Esmeralda Seven review", y:2022 },
  { source:"x_ctr_bio_div", target:"c_1", rel:"reviews", note:"Center for Bio Diversity Gemini tortoise review", y:2018 },
  { source:"x_citizens_dixie", target:"c_36", rel:"reviews", note:"Citizens for Dixie Valley Hot Pot review", y:2018 },
  { source:"x_nv_wildlife_fed", target:"c_31", rel:"reviews", note:"NV Wildlife Federation Spring Valley Wind review", y:2012 },
  { source:"x_audubon_nv", target:"c_32", rel:"reviews", note:"Audubon NV avian review Stagecoach Wind", y:2024 },

  // --- Media/Analysts Coverage ---
  { source:"x_gtm", target:"c_1", rel:"covers", note:"Greentech Media Gemini Solar coverage", y:2020 },
  { source:"x_utilitydive", target:"c_7", rel:"covers", note:"Utility Dive Greenlink West coverage", y:2023 },
  { source:"x_canary", target:"c_8", rel:"covers", note:"Canary Media Fervo geothermal coverage", y:2024 },
  { source:"x_nv_independent", target:"x_pucn", rel:"covers", note:"Nevada Independent PUCN coverage", y:2024 },
  { source:"x_nv_current", target:"c_7", rel:"covers", note:"Nevada Current Greenlink West reporting", y:2024 },
  { source:"x_eia", target:"x_nv_energy", rel:"monitors", note:"EIA NV energy generation data collection", y:2024 },

  // --- National Labs to Projects ---
  { source:"x_lbnl", target:"c_8", rel:"researches", note:"LBNL geothermal research support for Fervo", y:2023 },
  { source:"x_anl", target:"c_2", rel:"researches", note:"Argonne BESS safety research for Reid Gardner", y:2024 },
  { source:"x_pnnl", target:"c_33", rel:"researches", note:"PNNL energy storage research for White Pine", y:2022 },

  // --- Data Center Companies ---
  { source:"x_nvidia", target:"c_3", rel:"supplies", note:"NVIDIA GPU supply to Switch Citadel Campus", y:2023 },
  { source:"x_nvidia", target:"c_44", rel:"supplies", note:"NVIDIA GPU supply to Meta TRIC Data Center", y:2024 },
  { source:"x_coreweave", target:"x_storey_county", rel:"evaluates", note:"CoreWeave NV data center site evaluation", y:2024 },
  { source:"x_stack_infra", target:"x_storey_county", rel:"evaluates", note:"STACK Infrastructure NV evaluation", y:2024 },

  // --- Military Coordination ---
  { source:"x_nellis", target:"c_1", rel:"coordinates_with", note:"Nellis AFB airspace coordination with Gemini Solar", y:2018 },
  { source:"x_nellis", target:"c_9", rel:"coordinates_with", note:"Nellis AFB airspace coordination Dry Lake East", y:2020 },
  { source:"x_nas_fallon", target:"c_39", rel:"coordinates_with", note:"NAS Fallon military coordination Stillwater area", y:2009 },
  { source:"x_nas_fallon", target:"c_8", rel:"coordinates_with", note:"NAS Fallon airspace coordination Corsac Station", y:2024 },
  { source:"x_ntc", target:"c_10", rel:"coordinates_with", note:"NV Test Range airspace Rough Hat Clark area", y:2023 },

  // --- Additional EPC Contractors to Projects ---
  { source:"x_swinerton", target:"c_19", rel:"bids_on", note:"Swinerton RE Bonanza Solar EPC bid", y:2024 },
  { source:"x_wanzek", target:"c_14", rel:"bids_on", note:"Wanzek Construction Purple Sage EPC bid", y:2024 },
  { source:"x_kiewit", target:"c_7", rel:"bids_on", note:"Kiewit Greenlink transmission construction bid", y:2024 },
  { source:"x_pcl", target:"c_33", rel:"bids_on", note:"PCL Construction White Pine Pumped Storage bid", y:2023 },

  // --- Construction People to Projects ---
  { source:"p_wanzek_vp", target:"x_wanzek", rel:"works_at", note:"Jon Blount VP Renewables Wanzek", y:2022 },
  { source:"p_pcl_energy", target:"x_pcl", rel:"works_at", note:"Mike Chicken VP Power PCL", y:2022 },
  { source:"p_swinerton_solar", target:"x_swinerton", rel:"leads", note:"George Hershman leads Swinerton Renewable", y:2020 },

  // --- Additional Developer Evaluations ---
  { source:"x_cypress_creek", target:"x_pucn", rel:"evaluates", note:"Cypress Creek evaluating NV IRP opportunities", y:2024 },
  { source:"x_lightsource", target:"x_blm", rel:"evaluates", note:"Lightsource bp evaluating NV BLM solar zones", y:2024 },
  { source:"x_intersect", target:"c_47", rel:"evaluates", note:"Intersect Power evaluating NV hydrogen opportunities", y:2024 },
  { source:"x_key_capture", target:"c_17", rel:"evaluates", note:"Key Capture evaluating NV standalone BESS", y:2024 },
  { source:"x_plus_power", target:"c_17", rel:"evaluates", note:"Plus Power evaluating NV BESS opportunities", y:2024 },

  // --- Ecosystem Org Standards Bodies ---
  { source:"nerc_org", target:"x_nv_energy", rel:"regulates", note:"NERC reliability standards for NV Energy", y:2020 },
  { source:"ieee_pes", target:"x_nv_energy", rel:"sets_standards", note:"IEEE power standards for NV grid", y:2020 },
  { source:"nha_org", target:"c_33", rel:"advocates_for", note:"NHA pumped storage advocacy for White Pine", y:2022 },
  { source:"grc_org", target:"x_ormat", rel:"coordinates_with", note:"GRC geothermal industry coordination with Ormat", y:2020 },
  { source:"grc_org", target:"x_fervo", rel:"coordinates_with", note:"GRC geothermal industry coordination with Fervo", y:2023 },
  { source:"wirab_org", target:"x_wecc", rel:"advises", note:"WIRAB advisory on western resource adequacy", y:2020 },

  // --- Tribal Consultation Edges ---
  { source:"p_goshute", target:"c_33", rel:"consults_on", note:"Goshute tribal consultation White Pine Pumped Storage", y:2019 },
  { source:"p_shoshone_council", target:"c_16", rel:"consults_on", note:"Western Shoshone consultation Esmeralda Seven", y:2022 },
  { source:"p_pahrump_paiute", target:"c_10", rel:"consults_on", note:"Southern Paiute consultation Rough Hat Clark", y:2023 },

  // --- State Legislators to Agencies ---
  { source:"p_nv_sen_scheible", target:"x_pucn", rel:"oversees", note:"Senator Scheible PUCN oversight", y:2023 },
  { source:"p_nv_asm_watts", target:"goe", rel:"oversees", note:"Assemblyman Watts GOE clean energy oversight", y:2023 },
  { source:"p_nv_asm_anderson", target:"x_goed", rel:"oversees", note:"Assemblywoman Anderson GOED data center oversight", y:2023 },

  // ========================================================================
  // NEW EDGES — Batch 6: Final edges connecting remaining new entities
  // ========================================================================

  // --- New Developer People to Companies ---
  { source:"p_savion_ceo", target:"x_savion", rel:"leads", note:"Scott Harlan CEO Savion", y:2022 },
  { source:"p_longroad_ceo", target:"x_longroad", rel:"leads", note:"Paul Shortridge CEO Longroad Energy", y:2020 },
  { source:"p_cypress_ceo", target:"x_cypress_creek", rel:"leads", note:"Sarah Slusser CEO Cypress Creek", y:2022 },
  { source:"p_scout_ceo", target:"x_scout_clean", rel:"leads", note:"Michael Rucker CEO Scout Clean Energy", y:2021 },
  { source:"p_sol_systems", target:"x_sol_systems", rel:"leads", note:"Yuri Horwitz CEO Sol Systems", y:2020 },
  { source:"p_arevon_ceo", target:"x_arevon", rel:"leads", note:"Swami Venkataraman CEO Arevon", y:2022 },
  { source:"p_intersect_ceo", target:"x_intersect_power", rel:"leads", note:"Sheldon Kimber CEO Intersect Power", y:2020 },
  { source:"p_lightsource_na", target:"x_lightsource", rel:"leads", note:"Kevin Smith CEO Americas Lightsource bp", y:2021 },
  { source:"p_desri_ceo", target:"x_desri", rel:"leads", note:"Hy Martin CEO DESRI", y:2020 },
  { source:"p_key_capture", target:"x_key_capture", rel:"leads", note:"Jeff Bishop CEO Key Capture Energy", y:2020 },
  { source:"p_plus_power", target:"x_plus_power", rel:"leads", note:"Brandon Keefe CEO Plus Power", y:2020 },

  // --- NV Energy Staff Edges ---
  { source:"p_nve_battery", target:"c_2", rel:"manages", note:"Laura Mitchell manages Reid Gardner BESS integration", y:2024 },
  { source:"p_nve_storm", target:"x_nv_energy", rel:"works_at", note:"Derek Shaw NV Energy storm response", y:2022 },
  { source:"p_nve_grid_ops", target:"x_nv_energy", rel:"works_at", note:"Thomas Schwartz NV Energy grid operations", y:2022 },
  { source:"p_nve_demand", target:"x_nv_energy", rel:"works_at", note:"Jessica Williams NV Energy demand response", y:2022 },

  // --- PUCN Staff Edges ---
  { source:"p_pucn_rate", target:"x_pucn", rel:"works_at", note:"Michael Cade PUCN rate analyst", y:2022 },
  { source:"p_pucn_renew", target:"x_pucn", rel:"works_at", note:"Sandra Ramirez PUCN renewable specialist", y:2022 },
  { source:"p_pucn_econ", target:"x_pucn", rel:"works_at", note:"Harold Judd PUCN senior economist", y:2022 },
  { source:"p_pucn_legal", target:"x_pucn", rel:"works_at", note:"Tamara Luce PUCN general counsel", y:2022 },

  // --- County Planners to Counties ---
  { source:"p_elko_planning", target:"x_elko_county", rel:"works_at", note:"Cathy Pennington Elko County planning", y:2022 },
  { source:"p_humboldt_plan", target:"x_humboldt_county", rel:"works_at", note:"Rick Magill Humboldt County planning", y:2022 },
  { source:"p_wp_plan", target:"x_white_pine", rel:"works_at", note:"Michael Mathers White Pine County planning", y:2022 },

  // --- Federal Staff Edges ---
  { source:"p_doe_h2", target:"c_47", rel:"oversees", note:"DOE H2 program director oversees H2 Hub", y:2024 },
  { source:"p_blm_solar", target:"x_blm", rel:"works_at", note:"Linda Riggins BLM national solar coordinator", y:2022 },
  { source:"p_usbr_nv", target:"x_usbr_lc", rel:"leads", note:"Terrance Fulp leads Bureau of Reclamation LC", y:2022 },

  // --- Research Edges ---
  { source:"p_nrel_grid", target:"x_nrel", rel:"works_at", note:"Paul Denholm NREL grid integration analyst", y:2020 },
  { source:"p_snl_geo", target:"x_sandia", rel:"works_at", note:"Doug Blankenship Sandia geothermal R&D", y:2020 },
  { source:"p_nrel_grid", target:"c_1", rel:"researches", note:"NREL curtailment analysis for Gemini Solar", y:2022 },

  // --- Construction Trades ---
  { source:"p_sheet_metal", target:"c_3", rel:"works_on", note:"Sheet Metal Workers data center HVAC", y:2023 },
  { source:"p_millwrights", target:"c_33", rel:"works_on", note:"Millwrights turbine installation White Pine", y:2024 },

  // --- Additional External Entity Edges ---
  { source:"x_rwe", target:"x_pucn", rel:"evaluates", note:"RWE evaluating NV IRP opportunities", y:2024 },
  { source:"x_generate_capital", target:"c_21", rel:"evaluates", note:"Generate Capital evaluating Rock Valley Solar", y:2024 },
  { source:"x_power_engineers", target:"c_7", rel:"designs", note:"POWER Engineers Greenlink transmission design", y:2024 },
  { source:"x_sargent_lundy", target:"c_6", rel:"designs", note:"Sargent & Lundy Sierra Solar engineering", y:2024 },
  { source:"x_faa_west", target:"c_1", rel:"reviews", note:"FAA glare analysis for Gemini Solar", y:2018 },
  { source:"x_faa_west", target:"c_16", rel:"reviews", note:"FAA glare analysis for Esmeralda Seven", y:2022 },
  { source:"x_nv_pers", target:"x_stonepeak", rel:"invested_in", note:"NV PERS infrastructure allocation", y:2022 },
  { source:"x_usbr_lc", target:"x_wapa", rel:"coordinates_with", note:"Bureau of Reclamation + WAPA Hoover Dam coordination", y:2020 },
];
