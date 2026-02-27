export const COMPANIES = [
  // === OPERATIONAL ===
  { id:1, name:"Gemini Solar + Storage", stage:"operational", sector:["Solar+BESS"], city:"Primm", region:"clark", funding:1000, momentum:95, employees:40, founded:2018, description:"690MW solar + 380MW/1,400MWh battery storage facility located on BLM land near Primm along I-15. At commissioning, Gemini was the largest solar-plus-storage project in the United States. Developed by Quinbrook Infrastructure Partners through its Primergy Solar subsidiary, with Arevia Power as co-developer.\n\nNV Energy holds a 25-year PPA for the full output. The project qualified for the 30% federal Investment Tax Credit and sits on a Bureau of Land Management right-of-way permit. Gemini's storage component provides critical evening peak capacity for southern Nevada, displacing gas peaker reliance during the high-demand summer months.", eligible:["nve_ppa","itc","blm_row"], lat:35.61, lng:-115.38,
    capacityMW:690, storageMWh:1400, acreage:7100, developer:"Quinbrook/Primergy Solar", epc:"Rosendin Electric", estimatedCOD:"2025-Q3",
    docketIds:[], queueIds:["NVE-GEN-2019-001"], ppaIds:["ppa_gemini"],
    keyMilestones:[
      { date:"2017-06-01", event:"BLM ROW application filed", status:"complete" },
      { date:"2019-01-15", event:"Interconnection agreement executed", status:"complete" },
      { date:"2019-06-01", event:"NV Energy PPA executed (25-year)", status:"complete" },
      { date:"2020-03-01", event:"BLM Record of Decision issued", status:"complete" },
      { date:"2021-04-01", event:"Construction begins", status:"complete" },
      { date:"2023-12-01", event:"Phase 1 solar (440MW) operational", status:"complete" },
      { date:"2025-09-01", event:"Full 690MW/380MW commercial operation", status:"complete" },
    ],
    riskFactors:[], permittingScore:100 },

  { id:2, name:"Reid Gardner BESS", stage:"operational", sector:["BESS"], city:"Moapa", region:"clark", funding:200, momentum:85, employees:10, founded:2021, description:"220MW/440MWh standalone battery energy storage system at the former Reid Gardner coal plant site in Moapa. This project represents NV Energy's coal-to-clean transition strategy, repurposing retired fossil fuel infrastructure with grid-scale storage. Energy Vault served as the EPC contractor.\n\nAs a utility-owned asset, Reid Gardner BESS provides NV Energy with direct dispatch control for peak shaving, frequency regulation, and renewable integration. The facility qualified for the 30% ITC and leverages existing transmission interconnection from the former coal plant, significantly reducing development timelines and costs.", eligible:["nve_ppa","itc"], lat:36.65, lng:-114.67,
    capacityMW:220, storageMWh:440, acreage:null, developer:"NV Energy (utility-owned)", epc:"Energy Vault", estimatedCOD:"2025-Q2",
    docketIds:[], queueIds:["NVE-GEN-2021-003"], ppaIds:["ppa_reid_gardner"],
    keyMilestones:[
      { date:"2021-03-01", event:"Interconnection application filed", status:"complete" },
      { date:"2022-03-01", event:"PUCN construction approval", status:"complete" },
      { date:"2023-06-01", event:"Construction begins at former coal site", status:"complete" },
      { date:"2025-04-15", event:"220MW/440MWh fully operational", status:"complete" },
    ],
    riskFactors:[], permittingScore:100 },

  { id:3, name:"Switch Citadel Campus", stage:"operational", sector:["Data_Center"], city:"Reno", region:"storey", funding:2000, momentum:82, employees:800, founded:2000, description:"Massive hyperscale data center campus at the Tahoe-Reno Industrial Center (TRIC) in Storey County. Switch's Citadel Campus has 495MW of planned capacity across multiple buildings, including new AI factory structures (199K and 228K sq ft). Switch maintains a 100% renewable energy commitment across all facilities.\n\nThe campus is one of the largest single-site data center operations in the world and a primary driver of northern Nevada's electrical load growth. Switch received GOED tax abatements (10/20-year property and sales tax reductions) and its expansion plans are a key factor in NV Energy's transmission buildout, particularly the Greenlink North corridor.", eligible:["nv_incentive"], lat:39.53, lng:-119.53,
    capacityMW:null, storageMWh:null, acreage:null, developer:"Switch Ltd", epc:null, estimatedCOD:null,
    docketIds:["24-11045"], queueIds:[], ppaIds:["ppa_switch_renewable"],
    keyMilestones:[
      { date:"2000-01-01", event:"Switch founded", status:"complete" },
      { date:"2017-06-01", event:"Citadel Campus Phase 1 operational", status:"complete" },
      { date:"2023-01-01", event:"AI factory expansion announced", status:"complete" },
    ],
    riskFactors:[], permittingScore:null },

  { id:4, name:"Google TRIC Data Center", stage:"operational", sector:["Data_Center"], city:"Reno", region:"storey", funding:600, momentum:88, employees:200, founded:2018, description:"Google's data center complex at Storey County's TRIC corridor. Google became the first applicant for NV Energy's Clean Transition Tariff (CTT), a premium rate structure that dedicates specific clean energy resources to large-load customers. Google has signed both a 115MW geothermal PPA with Fervo Energy and a 150MW geothermal PPA with Ormat Technologies.\n\nThese geothermal PPAs are central to Google's goal of running on 24/7 carbon-free energy by 2030. The CTT mechanism, under PUCN review (Docket opened Dec 2024), could become a model for how utilities serve hyperscale data center load with dedicated clean resources rather than grid-average renewable energy credits.", eligible:["nve_ppa","nv_incentive"], lat:39.53, lng:-119.54,
    capacityMW:null, storageMWh:null, acreage:null, developer:"Google LLC", epc:null, estimatedCOD:null,
    docketIds:["24-12001","24-11045"], queueIds:[], ppaIds:["ppa_ormat_google_115","ppa_ormat_google_150"],
    keyMilestones:[
      { date:"2018-01-01", event:"Google TRIC facility operational", status:"complete" },
      { date:"2023-09-01", event:"115MW Fervo geothermal PPA signed", status:"complete" },
      { date:"2024-10-15", event:"150MW Ormat geothermal PPA signed", status:"complete" },
      { date:"2024-12-15", event:"First CTT application filed", status:"complete" },
    ],
    riskFactors:[], permittingScore:null },

  { id:5, name:"Ormat McGinness Hills", stage:"operational", sector:["Geothermal"], city:"Austin", region:"lander", funding:300, momentum:72, employees:50, founded:2012, description:"Approximately 160MW geothermal complex in Lander County, making it the largest geothermal facility in Nevada. Operated by Ormat Technologies (NYSE: ORA), the project was developed in three phases and has been reliably generating baseload renewable power since 2012. Expansion potential is under environmental assessment review.\n\nMcGinness Hills demonstrates the scalability of Nevada's conventional hydrothermal resources. Unlike solar, geothermal provides 24/7 baseload generation with capacity factors exceeding 90%. Ormat's Reno headquarters and extensive Nevada portfolio (including Steamboat, Tungsten Mountain, and Jersey Valley) make the company the anchor of Nevada's geothermal sector. The project qualifies for the federal Production Tax Credit.", eligible:["ptc"], lat:39.60, lng:-117.07,
    capacityMW:160, storageMWh:null, acreage:null, developer:"Ormat Technologies", epc:"Ormat Technologies", estimatedCOD:null,
    docketIds:[], queueIds:[], ppaIds:[],
    keyMilestones:[
      { date:"2012-06-01", event:"Phase 1 (30MW) operational", status:"complete" },
      { date:"2015-03-01", event:"Phase 2 (48MW) operational", status:"complete" },
      { date:"2018-09-01", event:"Phase 3 (82MW) operational", status:"complete" },
    ],
    riskFactors:[], permittingScore:100 },

  // === UNDER CONSTRUCTION ===
  { id:6, name:"Sierra Solar + BESS", stage:"under_construction", sector:["Solar+BESS"], city:"Fallon", region:"churchill", funding:1500, momentum:88, employees:500, founded:2023, description:"400MW solar + 400MW/1,600MWh battery storage near Fallon in Churchill County. At $1.5 billion, this is NV Energy's largest self-build project in company history. The BESS component is scheduled for commercial operation in 2026, with solar generation following in 2027.\n\nApproved through the PUCN's 2024 Integrated Resource Plan process (Docket 24-05041), Sierra Solar represents a shift toward utility-owned renewable assets rather than third-party PPAs. The project's 4-hour storage duration provides evening peak capacity, and its location in northern Nevada diversifies NV Energy's generation geography. Greenlink West transmission is critical for delivering this power to southern load centers.", eligible:["nve_ppa","itc"], lat:39.47, lng:-118.78,
    capacityMW:400, storageMWh:1600, acreage:3200, developer:"NV Energy (utility-owned)", epc:null, estimatedCOD:"2027-Q2",
    docketIds:["24-05041"], queueIds:["NVE-GEN-2023-007"], ppaIds:["ppa_sierra"],
    keyMilestones:[
      { date:"2023-02-01", event:"Interconnection application filed", status:"complete" },
      { date:"2024-05-31", event:"Included in 2024 IRP filing", status:"complete" },
      { date:"2024-08-20", event:"Construction begins ($1.5B)", status:"complete" },
      { date:"2025-12-20", event:"PUCN IRP approval", status:"complete" },
      { date:"2026-12-01", event:"BESS commercial operation", status:"in_progress" },
      { date:"2027-06-01", event:"Solar commercial operation", status:"pending" },
    ],
    riskFactors:["transmission_dependent"], permittingScore:85 },

  { id:7, name:"Greenlink West", stage:"under_construction", sector:["Transmission"], city:"Las Vegas", region:"multi_county", funding:2400, momentum:90, employees:2000, founded:2020, description:"472-mile, 525kV/345kV high-voltage transmission line connecting Las Vegas to Yerington through central Nevada. At $2.4 billion, Greenlink West is the largest infrastructure project in NV Energy's history. MasTec (T&D Power subsidiary) is the general contractor, with a target completion of May 2027. BLM issued the right-of-way permit in 2023.\n\nGreenlink West is the backbone enabling Nevada's clean energy transition. Without it, renewable projects in northern and central Nevada (Sierra Solar, Libra Solar, geothermal resources) cannot deliver power to the southern Nevada load center where 75% of the state's electricity demand sits. PUCN approved $4/month rate increases for southern Nevada customers to fund cost recovery. The project also enables future interconnection with California markets.", eligible:["doe_lpo","blm_row"], lat:37.50, lng:-116.50,
    capacityMW:null, storageMWh:null, acreage:null, developer:"NV Energy", epc:"MasTec T&D Power", estimatedCOD:"2027-Q2",
    docketIds:["24-09032","ER24-2847","24-11045","24-05041"], queueIds:[], ppaIds:[],
    keyMilestones:[
      { date:"2020-06-01", event:"Project announced in 2021 IRP", status:"complete" },
      { date:"2023-03-01", event:"BLM ROW permit issued", status:"complete" },
      { date:"2024-06-15", event:"Rate recovery filing (Dkt 24-09032)", status:"complete" },
      { date:"2024-09-25", event:"PUCN approves $4/month rate increase", status:"complete" },
      { date:"2025-07-15", event:"MasTec begins construction", status:"complete" },
      { date:"2027-05-01", event:"Target completion", status:"in_progress" },
    ],
    riskFactors:["interstate_transmission"], permittingScore:90 },

  { id:8, name:"Fervo Corsac Station", stage:"under_construction", sector:["Geothermal"], city:"Winnemucca", region:"pershing", funding:400, momentum:86, employees:150, founded:2023, description:"115MW next-generation enhanced geothermal system (EGS) in Pershing County. Fervo Energy uses horizontal drilling techniques borrowed from the oil and gas industry combined with fiber-optic distributed sensing to create geothermal reservoirs in hot dry rock where no natural hydrothermal system exists. This is the first large-scale EGS plant globally.\n\nGoogle holds the PPA via NV Energy's Clean Transition Tariff, making Corsac Station a cornerstone of Google's 24/7 carbon-free energy strategy. Unlike conventional geothermal (which requires natural hot water reservoirs), EGS can theoretically be deployed anywhere with sufficient subsurface heat, dramatically expanding geothermal's addressable market. Fervo's success at Corsac Station could unlock gigawatts of previously inaccessible geothermal resources across the western US.", eligible:["nve_ppa","doe_lpo","ptc"], lat:40.97, lng:-117.74,
    capacityMW:115, storageMWh:null, acreage:null, developer:"Fervo Energy", epc:"Fervo Energy", estimatedCOD:null,
    docketIds:["24-12001"], queueIds:["NVE-GEN-2023-019"], ppaIds:["ppa_fervo_google"],
    keyMilestones:[
      { date:"2023-05-01", event:"Google PPA signed for CTT delivery", status:"complete" },
      { date:"2023-06-01", event:"Interconnection application filed", status:"complete" },
      { date:"2024-02-01", event:"IA executed", status:"complete" },
      { date:"2024-04-01", event:"Drilling begins at Corsac Station", status:"complete" },
    ],
    riskFactors:[], permittingScore:80 },

  // === APPROVED ===
  { id:9, name:"Dry Lake East", stage:"approved", sector:["Solar+BESS"], city:"Moapa", region:"clark", funding:400, momentum:78, employees:300, founded:2023, description:"200MW solar + 200MW/800MWh battery storage on BLM land northeast of Las Vegas near Moapa. The Bureau of Land Management issued the Record of Decision approving the project, and NV Energy has executed a PPA at competitive rates. Commercial operation is targeted for end of 2026.\n\nDry Lake East is part of the wave of solar+storage projects approved through NV Energy's 2024 IRP procurement cycle. Its proximity to the southern Nevada load center reduces transmission losses and avoids dependence on the Greenlink corridors. The 4-hour storage duration aligns with NV Energy's system needs for evening peak demand management.", eligible:["nve_ppa","itc","blm_row"], lat:36.60, lng:-114.90,
    capacityMW:200, storageMWh:800, acreage:2100, developer:null, epc:null, estimatedCOD:"2026-Q4",
    docketIds:["24-05041","24-RFP-AS"], queueIds:["NVE-GEN-2023-012"], ppaIds:["ppa_dry_lake"],
    keyMilestones:[
      { date:"2023-04-15", event:"Interconnection application filed", status:"complete" },
      { date:"2024-01-20", event:"System impact study completed", status:"complete" },
      { date:"2024-06-01", event:"NV Energy PPA executed", status:"complete" },
      { date:"2024-09-01", event:"BLM Record of Decision issued", status:"complete" },
      { date:"2026-12-01", event:"Target commercial operation", status:"pending" },
    ],
    riskFactors:[], permittingScore:90 },

  { id:10, name:"Rough Hat Clark", stage:"approved", sector:["Solar+BESS"], city:"Pahrump", region:"nye", funding:800, momentum:75, employees:400, founded:2022, description:"400MW solar + 700MW battery storage in Pahrump Valley, Nye County. Co-developed by Candela Renewables and Hamel Renewables. BLM issued the Record of Decision approving the project in December 2024. The project is currently in pre-construction phase with site preparation underway.\n\nRough Hat Clark's oversized storage ratio (700MW storage against 400MW solar) suggests the developer may be targeting capacity-firming and grid services beyond simple solar time-shifting. Pahrump Valley's location provides relatively close proximity to the southern Nevada transmission network. The project's PPA with NV Energy is under final negotiation, with pricing expected to reflect the declining cost trajectory of lithium-ion storage.", eligible:["nve_ppa","itc","blm_row"], lat:36.20, lng:-115.98,
    capacityMW:400, storageMWh:null, acreage:4500, developer:"Candela Renewables / Hamel Renewables", epc:null, estimatedCOD:null,
    docketIds:["BLM-NV-2024-0019","24-05041","24-RFP-AS"], queueIds:["NVE-GEN-2022-009"], ppaIds:["ppa_rough_hat"],
    keyMilestones:[
      { date:"2022-08-01", event:"Interconnection application filed", status:"complete" },
      { date:"2022-11-01", event:"BLM ROW application filed", status:"complete" },
      { date:"2024-06-01", event:"BLM Final EIS published", status:"complete" },
      { date:"2025-01-15", event:"BLM Record of Decision issued", status:"complete" },
      { date:"2025-06-01", event:"PPA negotiation in progress", status:"in_progress" },
    ],
    riskFactors:[], permittingScore:82 },

  { id:11, name:"Boulder Solar III", stage:"approved", sector:["Solar+BESS"], city:"Boulder City", region:"clark", funding:250, momentum:70, employees:200, founded:2024, description:"128MW solar + 128MW/512MWh battery storage near Boulder City in Clark County. Developed by 174 Power Global, a subsidiary of South Korea's Hanwha Group. Commercial operation is targeted for June 2027. The PPA was approved as part of NV Energy's 2024 IRP procurement (Docket 24-05041).\n\nBoulder City has emerged as a solar development hub due to its favorable zoning, existing transmission infrastructure, and proximity to the Hoover Dam substation complex. Boulder Solar III joins earlier phases in the area and benefits from established interconnection pathways that reduce development risk and timeline.", eligible:["nve_ppa","itc"], lat:35.97, lng:-114.83,
    capacityMW:128, storageMWh:512, acreage:1200, developer:"174 Power Global (Hanwha)", epc:null, estimatedCOD:"2027-Q2",
    docketIds:["24-05041","24-RFP-AS"], queueIds:["NVE-GEN-2024-002"], ppaIds:["ppa_boulder_iii"],
    keyMilestones:[
      { date:"2024-01-10", event:"Interconnection application filed", status:"complete" },
      { date:"2024-07-01", event:"Interconnection study completed", status:"complete" },
      { date:"2024-09-01", event:"PPA approved in IRP procurement", status:"complete" },
      { date:"2027-06-01", event:"Target commercial operation", status:"pending" },
    ],
    riskFactors:["existing_interconnection"], permittingScore:78 },

  // === NEPA REVIEW ===
  { id:12, name:"Libra Solar", stage:"nepa_review", sector:["Solar+BESS"], city:"Yerington", region:"lyon", funding:1200, momentum:82, employees:500, founded:2022, description:"700MW solar + 700MW/2,800MWh battery storage on BLM land in Lyon County near Yerington. Developed by Arevia Power, Libra Solar would be the largest single solar+storage project in Nevada upon completion. The BLM published the Final Environmental Impact Statement in November 2024. NV Energy executed a 25-year energy PPA at $34.97/MWh, among the lowest solar+storage rates in the western US.\n\nLibra's completion depends on Greenlink West transmission, which will carry power from the Yerington area to southern Nevada. The project's 4-hour storage component (2,800MWh) represents one of the largest planned battery deployments in the country. Libra Solar is a bellwether for whether Nevada can scale up renewable procurement fast enough to meet surging data center load while maintaining grid reliability during the clean energy transition.", eligible:["nve_ppa","itc","blm_row"], lat:38.80, lng:-119.17,
    capacityMW:700, storageMWh:2800, acreage:7500, developer:"Arevia Power", epc:null, estimatedCOD:null,
    docketIds:["BLM-NV-2023-0045","24-05041"], queueIds:["NVE-GEN-2022-015"], ppaIds:["ppa_libra"],
    keyMilestones:[
      { date:"2022-11-01", event:"Interconnection application filed", status:"complete" },
      { date:"2023-06-01", event:"BLM ROW application filed", status:"complete" },
      { date:"2024-03-01", event:"NV Energy PPA executed ($34.97/MWh)", status:"complete" },
      { date:"2024-03-15", event:"BLM Draft EIS published", status:"complete" },
      { date:"2024-11-01", event:"BLM Final EIS published", status:"complete" },
      { date:"2025-06-15", event:"ROD expected", status:"pending" },
    ],
    riskFactors:["transmission_dependent","large_project"], permittingScore:70 },

  { id:13, name:"Greenlink North", stage:"nepa_review", sector:["Transmission"], city:"Reno", region:"multi_county", funding:1800, momentum:65, employees:1000, founded:2020, description:"235-mile, 525kV transmission line from Yerington to Reno, completing the Greenlink loop that connects northern and southern Nevada's grids. Combined with Greenlink West, this creates a transmission superhighway enabling bidirectional power flow across the state. MasTec is the designated general contractor.\n\nThe BLM's Environmental Impact Statement was remanded for additional review in early 2025, delaying the timeline to an estimated 2028 completion. This delay is significant because Greenlink North is critical for serving the rapidly growing data center load at TRIC (Switch, Google, Microsoft). FERC oversight applies due to interstate transmission implications. Without Greenlink North, northern Nevada faces potential generation constraints as data center demand outpaces local supply.", eligible:["doe_lpo","blm_row"], lat:39.20, lng:-118.50,
    capacityMW:null, storageMWh:null, acreage:null, developer:"NV Energy", epc:"MasTec T&D Power", estimatedCOD:"2028-Q4",
    docketIds:["BLM-NV-2023-0067"], queueIds:[], ppaIds:[],
    keyMilestones:[
      { date:"2023-01-15", event:"BLM ROW application filed", status:"complete" },
      { date:"2024-09-01", event:"BLM Draft EIS published", status:"complete" },
      { date:"2025-02-01", event:"EIS remanded for additional review", status:"in_progress" },
      { date:"2026-03-01", event:"Supplemental EIS expected", status:"pending" },
      { date:"2028-12-01", event:"Target completion (delayed)", status:"pending" },
    ],
    riskFactors:["blm_eis_remand","interstate_transmission","endangered_species"], permittingScore:50 },

  // === IN QUEUE ===
  { id:14, name:"Purple Sage Energy Center", stage:"queue", sector:["Solar+BESS"], city:"TBD", region:"nye", funding:600, momentum:55, employees:200, founded:2024, description:"400MW solar + 1,600MWh battery storage developed by Primergy Solar (Quinbrook subsidiary). Currently in NV Energy's interconnection queue awaiting system impact study completion. Target commercial operation is 2027, though queue position and study timelines introduce uncertainty.\n\nPurple Sage's 4-hour storage duration matches NV Energy's preferred procurement profile for evening peak management. As a Quinbrook/Primergy project, it leverages the developer's experience from the Gemini Solar facility. The project's progress through the interconnection queue will be a key indicator of NV Energy's ability to process the large volume of generation requests in its pipeline.", eligible:["nve_ppa","itc"], lat:36.80, lng:-116.20,
    capacityMW:400, storageMWh:1600, acreage:null, developer:"Primergy Solar (Quinbrook)", epc:null, estimatedCOD:"2027-Q4",
    docketIds:["24-RFP-AS"], queueIds:["NVE-GEN-2024-008"], ppaIds:["ppa_purple_sage"],
    keyMilestones:[
      { date:"2024-03-01", event:"Interconnection application filed", status:"complete" },
      { date:"2025-02-14", event:"All-Source RFP bid submitted", status:"complete" },
      { date:"2025-06-01", event:"System impact study in progress", status:"in_progress" },
    ],
    riskFactors:[], permittingScore:35 },

  { id:15, name:"Ormat Google Portfolio", stage:"queue", sector:["Geothermal"], city:"Multiple", region:"multi_county", funding:500, momentum:78, employees:100, founded:2024, description:"150MW portfolio of geothermal projects under a PPA with Google, with facilities expected online between 2028 and 2030. Includes Diamond Flat (which received a fast-tracked Environmental Assessment) and Pinto Geothermal. Ormat Technologies (NYSE: ORA) is leveraging its existing Nevada resource base to serve Google's growing clean energy demand.\n\nThis portfolio represents the next wave of geothermal development in Nevada, driven by data center operators willing to pay premium rates for 24/7 carbon-free energy. Unlike intermittent solar, geothermal provides baseload generation that aligns with data center load profiles. The Google PPA validates the economic case for new geothermal development at current price points.", eligible:["nve_ppa","ptc"], lat:39.50, lng:-117.50,
    capacityMW:150, storageMWh:null, acreage:null, developer:"Ormat Technologies", epc:"Ormat Technologies", estimatedCOD:"2028-Q2",
    docketIds:[], queueIds:["NVE-GEN-2024-011","NVE-GEN-2024-012"], ppaIds:["ppa_ormat_google_150"],
    keyMilestones:[
      { date:"2024-05-01", event:"Diamond Flat interconnection application", status:"complete" },
      { date:"2024-07-15", event:"Pinto Geothermal interconnection application", status:"complete" },
      { date:"2024-10-15", event:"Google 150MW PPA signed", status:"complete" },
    ],
    riskFactors:[], permittingScore:40 },

  // === PROPOSED ===
  { id:16, name:"Esmeralda Seven Solar", stage:"proposed", sector:["Solar"], city:"Tonopah", region:"esmeralda", funding:5000, momentum:45, employees:0, founded:2025, description:"6,200MW programmatic solar complex across Big Smoky Valley in Esmeralda County, encompassing approximately 118,000 acres of BLM land. Multiple developers have filed applications under a Draft Programmatic EIS process that would evaluate the entire valley for solar development rather than individual projects. This would be the largest proposed solar complex in the United States.\n\nThe programmatic approach is significant because it could streamline NEPA review for multiple projects under a single environmental framework, potentially cutting years off individual project timelines. However, the massive scale raises questions about transmission capacity (the area has limited existing infrastructure), water availability in the desert environment, and cumulative impacts on desert tortoise habitat and other environmental resources.", eligible:["blm_row"], lat:38.20, lng:-117.50,
    capacityMW:6200, storageMWh:null, acreage:118000, developer:"Multiple developers", epc:null, estimatedCOD:null,
    docketIds:["BLM-NV-2024-0012"], queueIds:["NVE-GEN-2024-018"], ppaIds:[],
    keyMilestones:[
      { date:"2024-09-01", event:"BLM initiates programmatic review", status:"complete" },
      { date:"2025-03-10", event:"Draft Programmatic EIS published", status:"complete" },
      { date:"2025-08-30", event:"Comment period deadline", status:"pending" },
    ],
    riskFactors:["programmatic_eis","large_project","transmission_dependent","endangered_species","water_constraints"], permittingScore:15 },

  { id:17, name:"Amargosa Desert BESS", stage:"proposed", sector:["BESS"], city:"Amargosa Valley", region:"nye", funding:300, momentum:40, employees:0, founded:2025, description:"NV Energy development assets within a BLM Solar Energy Zone in Amargosa Valley, Nye County. BLM issued a competitive lease offering for 23,675 acres with 15 applicants responding, indicating strong developer interest. The project is being evaluated as part of NV Energy's 2024 All-Source RFP.\n\nSolar Energy Zones (SEZs) benefit from pre-identified areas with reduced environmental conflict, potentially accelerating the permitting timeline compared to non-SEZ BLM land. The competitive lease format is a newer BLM mechanism designed to ensure fair market value for public land use. Amargosa Valley's proximity to existing transmission corridors and the Nevada National Security Site buffer zone provides relatively unconstrained development conditions.", eligible:["nve_ppa","itc","blm_row"], lat:36.64, lng:-116.40,
    capacityMW:300, storageMWh:null, acreage:23675, developer:null, epc:null, estimatedCOD:null,
    docketIds:["BLM-NV-2024-0008","24-RFP-AS"], queueIds:["NVE-GEN-2024-021"], ppaIds:[],
    keyMilestones:[
      { date:"2024-02-01", event:"BLM competitive lease offering announced", status:"complete" },
      { date:"2024-08-15", event:"Lease application evaluation complete", status:"complete" },
      { date:"2025-12-01", event:"Lease award expected", status:"pending" },
    ],
    riskFactors:["competitive_lease","solar_energy_zone"], permittingScore:20 },

  { id:18, name:"Dodge Flat II", stage:"proposed", sector:["Solar+BESS"], city:"Reno", region:"washoe", funding:200, momentum:35, employees:0, founded:2025, description:"200MW solar + battery storage proposed on BLM land in Washoe County, north of Reno. Currently in BLM scoping stage, the earliest phase of NEPA environmental review. The project targets the growing northern Nevada electrical load driven by data center expansion at TRIC.\n\nDodge Flat II would provide local generation capacity in northern Nevada, reducing dependence on long-distance transmission from southern generation zones. However, Washoe County's proximity to populated areas and recreational lands may introduce additional environmental and community review requirements compared to more remote BLM sites in southern Nevada.", eligible:["blm_row","itc"], lat:39.70, lng:-119.40,
    capacityMW:200, storageMWh:null, acreage:null, developer:null, epc:null, estimatedCOD:null,
    docketIds:["BLM-NV-2025-0003"], queueIds:["NVE-GEN-2025-002"], ppaIds:[],
    keyMilestones:[
      { date:"2025-01-10", event:"BLM ROW application filed", status:"complete" },
      { date:"2025-01-15", event:"Interconnection application filed", status:"complete" },
      { date:"2025-04-01", event:"BLM Notice of Intent published", status:"complete" },
      { date:"2025-07-15", event:"Scoping comment period deadline", status:"pending" },
    ],
    riskFactors:[], permittingScore:10 },
];
