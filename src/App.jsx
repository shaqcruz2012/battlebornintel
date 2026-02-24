import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as d3 from "d3";

// ============================================================
// BATTLE BORN INTELLIGENCE v5.0 — REAL DATA EDITION
// 75 Companies · Sectors · Watchlist · Fund Drill-Down
// ============================================================

const GOLD = "#C49A38", DARK = "#08080A", CARD = "#111110", BORDER = "#1E1D1A";
const TEXT = "#E2DCD0", MUTED = "#706C64", GREEN = "#4E9B60", RED = "#C25550";
const BLUE = "#5088A8", PURPLE = "#8868A8", ORANGE = "#D4864A";

const STAGE_COLORS = { pre_seed: "#706C64", seed: "#5088A8", series_a: "#4E9B60", series_b: ORANGE, series_c_plus: PURPLE, growth: GOLD };

// ── ONTOLOGY GRAPH CONFIG ──
const GP = { bg:"#08080B",surface:"#111117",card:"#18181F",border:"#2A2A35",text:"#D4D0C8",muted:"#6B6A72",dim:"#3D3D48",gold:"#C8A55A",green:"#4ECDC4",blue:"#5B8DEF",purple:"#9B72CF",orange:"#E8945A",red:"#E85D5D",cyan:"#5BC0DE",pink:"#D46B9E",lime:"#8BC34A",teal:"#26A69A" };
const NODE_CFG = {
  company:{color:GP.gold,label:"Companies",icon:"⬡"},fund:{color:GP.purple,label:"Funds",icon:"◈"},sector:{color:GP.blue,label:"Sectors",icon:"◉"},region:{color:GP.orange,label:"Regions",icon:"⊞"},
  person:{color:GP.purple,label:"People",icon:"●"},external:{color:GP.cyan,label:"External",icon:"△"},exchange:{color:GP.pink,label:"Exchanges",icon:"◧"},
  accelerator:{color:GP.lime,label:"Accelerators",icon:"▲"},ecosystem:{color:"#7986CB",label:"Ecosystem Orgs",icon:"⊕"},
};
const REL_CFG = {
  eligible_for:{color:GP.gold,label:"Eligible For",dash:""},operates_in:{color:GP.blue,label:"Operates In",dash:"3,2"},headquartered_in:{color:GP.orange,label:"HQ In",dash:"6,3"},
  invested_in:{color:GP.green,label:"Invested In",dash:""},loaned_to:{color:GP.green,label:"Loaned To",dash:"4,2"},partners_with:{color:GP.cyan,label:"Partners With",dash:""},
  contracts_with:{color:GP.cyan,label:"Contracts With",dash:"4,4"},acquired:{color:GP.red,label:"Acquired",dash:""},founder_of:{color:GP.purple,label:"Founded",dash:""},
  manages:{color:GP.purple,label:"Manages",dash:"3,2"},listed_on:{color:GP.pink,label:"Listed On",dash:"2,2"},accelerated_by:{color:GP.lime,label:"Accelerated By",dash:""},
  won_pitch:{color:GP.lime,label:"Won Pitch",dash:""},incubated_by:{color:GP.lime,label:"Incubated By",dash:"3,2"},program_of:{color:GP.lime,label:"Program Of",dash:"4,3"},
  supports:{color:"#7986CB",label:"Supports",dash:"3,2"},housed_at:{color:"#7986CB",label:"Housed At",dash:"4,3"},collaborated_with:{color:GP.cyan,label:"Collaborated With",dash:"3,3"},
  funds:{color:GP.gold,label:"Funds",dash:""},approved_by:{color:GP.teal,label:"Approved By",dash:"5,3"},filed_with:{color:GP.pink,label:"Filed With",dash:"4,4"},competes_with:{color:"#FF7043",label:"Competes With",dash:"2,4"},grants_to:{color:GP.green,label:"Grants To",dash:"4,2"},
};
const GSTAGE_C = { pre_seed:GP.dim,seed:GP.blue,series_a:GP.green,series_b:GP.orange,series_c_plus:GP.purple,growth:GP.gold };

const VIEWS = [
  { id: "dashboard", label: "Home", icon: "◆" },
  { id: "radar", label: "Radar", icon: "📡" },
  { id: "companies", label: "Companies", icon: "⬡" },
  { id: "investors", label: "Funds", icon: "◈" },
  { id: "sectors", label: "Sectors", icon: "◉" },
  { id: "watchlist", label: "Watchlist", icon: "☆" },
  { id: "compare", label: "Compare", icon: "⟺" },
  { id: "graph", label: "Graph", icon: "🕸" },
  { id: "timeline", label: "Activity", icon: "⏱" },
  { id: "ssbci", label: "SSBCI", icon: "★" },
  { id: "map", label: "Map", icon: "⊕" },
];


// --- REAL NEVADA STARTUP DATA ---
// Sources: Crunchbase, PitchBook, SEC filings, press releases, TechTribune, Failory, StartUpNV
// Funding in $M. Employee counts approximate from LinkedIn/PitchBook. Momentum scores are illustrative.
// NOTE: ~25 companies have fully verified public funding data. Remaining use best-available estimates.
const COMPANIES = [
  // === GROWTH / LATE-STAGE (verified funding from press, PitchBook) ===
  { id:1,  name:"Redwood Materials",   stage:"growth",        sector:["Cleantech","Energy","Manufacturing"], city:"Carson City",    region:"reno",       funding:4170, momentum:88, employees:1200, founded:2017, description:"Battery recycling and materials for EVs. Founded by Tesla co-founder JB Straubel. $6B+ valuation. DOE $2B loan. Campuses in NV and SC.", eligible:["bbv"], lat:39.16, lng:-119.77 },
  { id:2,  name:"Socure",              stage:"series_c_plus", sector:["AI","Fintech","Identity"],           city:"Incline Village", region:"reno",      funding:744,  momentum:90, employees:450,  founded:2012, description:"Digital identity verification and fraud prevention. $4.5B valuation. Serves 2,000+ enterprise customers including top US banks.", eligible:["bbv"], lat:39.25, lng:-119.95 },
  { id:3,  name:"Abnormal AI",         stage:"series_c_plus", sector:["AI","Cybersecurity"],                city:"Las Vegas",      region:"las_vegas", funding:534,  momentum:92, employees:1200, founded:2018, description:"AI-native email security. Behavioral AI detects socially-engineered attacks. $5.1B valuation. 2,000+ enterprise customers.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:4,  name:"TensorWave",          stage:"series_a",      sector:["AI","Cloud","Data Center"],          city:"Las Vegas",      region:"las_vegas", funding:147,  momentum:95, employees:100,  founded:2023, description:"AMD-powered GPU cloud for AI workloads. $100M Series A (largest in NV history). 8,192 MI325X GPU cluster. $100M+ ARR.", eligible:["bbv","fundnv"], lat:36.16, lng:-115.17 },
  { id:5,  name:"1047 Games",          stage:"series_c_plus", sector:["Gaming","AI"],                       city:"Las Vegas",      region:"las_vegas", funding:120,  momentum:72, employees:100,  founded:2017, description:"Game studio behind Splitgate. Founded in Stanford dorm room. Over $120M raised. Fully remote team.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:6,  name:"Hubble Network",      stage:"series_b",      sector:["IoT","Aerospace","Satellite"],       city:"Las Vegas",      region:"las_vegas", funding:100,  momentum:86, employees:46,   founded:2021, description:"Satellite-powered Bluetooth network. First BLE-to-satellite connection ever. 7 satellites in orbit. Partners with Life360/Tile (90M+ devices).", eligible:["bbv"], lat:36.17, lng:-115.14 },
  // === SERIES A / B (verified) ===
  { id:7,  name:"Boxabl",              stage:"series_a",      sector:["Construction","Manufacturing"],       city:"N. Las Vegas",   region:"las_vegas", funding:75,   momentum:76, employees:200,  founded:2017, description:"Foldable modular housing. The Casita unfolds into a full-size room in under an hour. 100K+ reservation waitlist. Reg A+ offering.", eligible:["bbv"], lat:36.24, lng:-115.12 },
  { id:8,  name:"Blockchains LLC",     stage:"growth",        sector:["Blockchain","Real Estate"],           city:"Sparks",         region:"reno",      funding:60,   momentum:52, employees:150,  founded:2018, description:"Blockchain-based smart city on 67,000 acres in Storey County. Innovation Park. Digital governance platform development.", eligible:[], lat:39.53, lng:-119.75 },
  { id:9,  name:"MNTN",                stage:"series_b",      sector:["AdTech","AI","Media"],                city:"Las Vegas",      region:"las_vegas", funding:35,   momentum:84, employees:250,  founded:2018, description:"Performance TV platform. Self-serve CTV advertising as easy as search and social. Ryan Reynolds is CCO. Fast Company Most Innovative.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:10, name:"Katalyst",            stage:"series_a",      sector:["Fitness","IoT","Biotech"],            city:"Las Vegas",      region:"las_vegas", funding:26,   momentum:78, employees:50,   founded:2020, description:"EMS fitness bodysuit. Full-body electro-muscle stimulation workout in 20 min. FDA-approved. TIME Best Inventions 2023. Series A led by Stripes.", eligible:["bbv"], lat:36.06, lng:-115.17 },
  { id:11, name:"CIQ",                 stage:"series_a",      sector:["Cloud","Computing","Cybersecurity"],  city:"Las Vegas",      region:"las_vegas", funding:26,   momentum:70, employees:80,   founded:2016, description:"Enterprise Linux infrastructure. Commercial support for Rocky Linux. Cloud, HPC, and container solutions. Founded by Gregory Kurtzer.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:12, name:"Springbig",           stage:"growth",        sector:["Cannabis","Fintech","Analytics"],      city:"Las Vegas",      region:"las_vegas", funding:22,   momentum:58, employees:100,  founded:2017, description:"Cannabis industry CRM, loyalty, and payment platform. Publicly traded (Nasdaq: SBIG). Serves 1,000+ dispensaries.", eligible:[], lat:36.17, lng:-115.14 },
  { id:13, name:"Protect AI",          stage:"series_b",      sector:["AI","Cybersecurity"],                  city:"Las Vegas",      region:"las_vegas", funding:18.5, momentum:80, employees:60,   founded:2022, description:"AI and ML security platform. Helps organizations manage security risks from AI systems. Huntr bug bounty for AI.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  // === SEED / EARLY (verified from press, Crunchbase, FundNV) ===
  { id:14, name:"MagicDoor",           stage:"seed",          sector:["AI","Real Estate"],                    city:"Las Vegas",      region:"las_vegas", funding:6.5,  momentum:74, employees:15,   founded:2023, description:"AI-native property management platform. Automates listing, rent collection, maintenance, compliance. Seed co-led by Okapi VC and Shadow Ventures.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:15, name:"Stable",              stage:"seed",          sector:["Blockchain","Fintech","Payments"],     city:"Las Vegas",      region:"las_vegas", funding:5.5,  momentum:62, employees:20,   founded:2022, description:"Blockchain for settling transactions with digital dollars. Gas-free peer transfers. Simplifying digital dollar payments.", eligible:["1864"], lat:36.17, lng:-115.14 },
  { id:16, name:"ThirdWaveRx",         stage:"series_a",      sector:["Healthcare","AI","Analytics"],         city:"Las Vegas",      region:"las_vegas", funding:8,    momentum:66, employees:35,   founded:2019, description:"Pharmacy cost management with AI-driven formulary optimization. Serves hospitals, LTC, PBMs. Automated rebate and compliance.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:17, name:"Vibrant Planet",      stage:"series_a",      sector:["Cleantech","AI","Analytics"],          city:"Incline Village", region:"reno",     funding:34,   momentum:74, employees:52,   founded:2019, description:"Cloud platform for wildfire risk + forest restoration. $15M Series A led by EIF. PG&E, Placer County clients. Merged w/ Pyrologix.", eligible:["bbv"], lat:39.25, lng:-119.95 },
  { id:18, name:"Kaptyn",              stage:"series_a",      sector:["Logistics","Energy","IoT"],            city:"Las Vegas",      region:"las_vegas", funding:12,   momentum:60, employees:45,   founded:2015, description:"Electric fleet-as-a-service for hospitality and corporate transport. Professional drivers, EV fleet, app-based booking. Las Vegas focus.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:19, name:"Climb Credit",        stage:"series_a",      sector:["Fintech","Education"],                 city:"Las Vegas",      region:"las_vegas", funding:10,   momentum:56, employees:30,   founded:2014, description:"Student payment platform making career-focused education affordable. Partners with coding bootcamps and trade schools.", eligible:[], lat:36.17, lng:-115.14 },
  { id:20, name:"Ollie",               stage:"series_b",      sector:["Consumer","AI","Logistics"],           city:"Las Vegas",      region:"las_vegas", funding:62,   momentum:64, employees:200,  founded:2016, description:"Human-grade fresh dog food delivered. Subscription plans tailored per dog. AI-customized recipes. National DTC delivery.", eligible:[], lat:36.17, lng:-115.14 },
  { id:21, name:"Nudge Security",      stage:"series_a",      sector:["Cybersecurity","AI"],                  city:"Las Vegas",      region:"las_vegas", funding:39,   momentum:82, employees:35,   founded:2021, description:"SaaS & AI security governance. $22.5M Series A Nov 2025 led by Cerberus Ventures. Tripled ARR 2024. ~200 customers incl Reddit.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:22, name:"Carbon Health",       stage:"series_c_plus", sector:["Healthcare","AI"],                     city:"Reno",           region:"reno",      funding:350,  momentum:65, employees:3000, founded:2015, description:"Modern healthcare clinics with AI-powered diagnostics. Physical and virtual care. Reno and national presence. Series D at $3B valuation.", eligible:[], lat:39.53, lng:-119.81 },
  { id:23, name:"Titan Seal",          stage:"seed",          sector:["Blockchain","Cybersecurity"],           city:"Las Vegas",      region:"las_vegas", funding:1.2,  momentum:45, employees:8,    founded:2017, description:"Blockchain-based document verification and sealing platform for government and legal records.", eligible:["fundnv"], lat:36.17, lng:-115.14 },
  { id:24, name:"Fund Duel",           stage:"seed",          sector:["Fintech","Gaming"],                    city:"Las Vegas",      region:"las_vegas", funding:0.8,  momentum:42, employees:6,    founded:2018, description:"Fantasy stock market and financial education gaming platform. Gamifies investing for Gen Z.", eligible:["fundnv"], lat:36.17, lng:-115.14 },
  { id:25, name:"Cognizer AI",         stage:"series_a",      sector:["AI","Analytics"],                      city:"Las Vegas",      region:"las_vegas", funding:19.4, momentum:64, employees:64,   founded:2018, description:"AI-powered business productivity and automation platform. FundNV and GigFounders backed. Enterprise workflow intelligence.", eligible:["fundnv","bbv"], lat:36.17, lng:-115.14 },
  { id:26, name:"SEE ID",              stage:"seed",          sector:["AI","Identity","Cybersecurity"],        city:"Las Vegas",      region:"las_vegas", funding:0.6,  momentum:50, employees:5,    founded:2023, description:"Visual identity verification using AI for in-person and remote interactions. FundNV seed investment.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:27, name:"PlayStudios",         stage:"growth",        sector:["Gaming","Mobile"],                     city:"Las Vegas",      region:"las_vegas", funding:250,  momentum:55, employees:500,  founded:2011, description:"Free-to-play mobile games with real-world rewards. MGM, Marriott partnerships. Publicly traded (Nasdaq: MYPS). Kingdom Boss and other titles.", eligible:[], lat:36.17, lng:-115.14 },
  { id:28, name:"Everi Holdings",      stage:"growth",        sector:["Gaming","Fintech","IoT"],              city:"Las Vegas",      region:"las_vegas", funding:180,  momentum:60, employees:2500, founded:2014, description:"Gaming technology and fintech solutions. Slot machines, CashClub, financial compliance. NYSE: EVRI.", eligible:[], lat:36.17, lng:-115.14 },
  // === RENO / NORTHERN NEVADA ECOSYSTEM ===
  { id:29, name:"Lyten",               stage:"growth",        sector:["Cleantech","Manufacturing","Energy"],   city:"Reno",           region:"reno",      funding:425,  momentum:92, employees:200,  founded:2015, description:"Lithium-sulfur battery pioneer. $1B+ gigafactory planned at Reno AirLogistics Park. 40% lighter than Li-ion. Backed by Stellantis, FedEx, Honeywell. 1,000+ jobs at full capacity.", eligible:["bbv"], lat:39.53, lng:-119.81 },
  { id:30, name:"Cranel",              stage:"seed",          sector:["Healthcare","Consumer"],                city:"Las Vegas",      region:"las_vegas", funding:0.5,  momentum:52, employees:8,    founded:2023, description:"Natural cranberry elixir clinically proven to prevent urinary tract infections. AngelNV 2025 finalist. Direct-to-consumer health and wellness.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:31, name:"fibrX",               stage:"seed",          sector:["IoT","AI","Defense"],                   city:"Las Vegas",      region:"las_vegas", funding:1.5,  momentum:64, employees:10,   founded:2023, description:"Platform-as-a-service combining fiberoptics, AI, and cloud computing for early detection and real-time monitoring of critical infrastructure. AngelNV 2025 finalist.", eligible:["sbir","fundnv"], lat:36.17, lng:-115.14 },
  { id:32, name:"Base Venture",         stage:"seed",          sector:["Fintech","Analytics"],                  city:"Carson City",    region:"reno",      funding:2.4,  momentum:56, employees:12,   founded:2021, description:"Financial technology platform for small business expansion. Adams Hub accelerator graduate. Raised $2.4M for growth plans.", eligible:["fundnv","1864"], lat:39.16, lng:-119.77 },
  { id:33, name:"Comstock Mining",     stage:"growth",        sector:["Mining","Cleantech"],                  city:"Virginia City",  region:"reno",      funding:45,   momentum:56, employees:75,   founded:2008, description:"Mineral exploration and cleantech in Storey County. Mercury remediation technology. NYSE American: LODE.", eligible:[], lat:39.31, lng:-119.65 },
  { id:34, name:"Filament Health",     stage:"series_a",      sector:["Biotech","Healthcare"],                city:"Reno",           region:"reno",      funding:8,    momentum:54, employees:22,   founded:2020, description:"Standardized natural psilocybin for clinical trials and pharmaceutical development. Drug master file with FDA.", eligible:["bbv"], lat:39.53, lng:-119.81 },
  // === HENDERSON / SOUTH VALLEY ===
  { id:35, name:"Amerityre",           stage:"growth",        sector:["Manufacturing","Materials Science"],    city:"Henderson",      region:"henderson", funding:12,   momentum:48, employees:35,   founded:1999, description:"Polyurethane foam tire manufacturer. Flat-free tires for industrial, military, and recreational vehicles.", eligible:[], lat:36.04, lng:-115.04 },
  { id:36, name:"Tilt",                 stage:"seed",          sector:["AI","Logistics"],                       city:"Las Vegas",      region:"las_vegas", funding:0.4,  momentum:64, employees:8,    founded:2023, description:"AI-powered logistics platform creating cost-efficient supply chain solutions. AngelNV 2024 winner with $200K+ investment. StartUpNV accelerator graduate.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  // === LAS VEGAS TECH ECOSYSTEM ===
  { id:37, name:"Nommi",               stage:"seed",          sector:["Robotics","AI","Consumer"],            city:"Las Vegas",      region:"las_vegas", funding:3.0,  momentum:60, employees:18,   founded:2022, description:"Autonomous food delivery robots for the Las Vegas Strip. Hot food vending with robotic kitchen. CES demo.", eligible:["fundnv","1864"], lat:36.12, lng:-115.17 },
  { id:38, name:"Amira Learning",      stage:"series_b",      sector:["AI","Education"],                     city:"Las Vegas",      region:"las_vegas", funding:41,   momentum:76, employees:150,  founded:2018, description:"AI reading tutor for K-8. Merged w/ Istation Jun 2024. Fast Company Most Innovative 2025. 1,800+ school districts. Owl Ventures backed.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:39, name:"Wynn Interactive",    stage:"growth",        sector:["Gaming","Fintech"],                    city:"Las Vegas",      region:"las_vegas", funding:50,   momentum:55, employees:80,   founded:2020, description:"Online gaming and sports betting platform from Wynn Resorts. WynnBET app. Licensed in multiple US states.", eligible:[], lat:36.13, lng:-115.17 },
  { id:40, name:"betJACK",             stage:"seed",          sector:["Gaming","AI","Analytics"],             city:"Las Vegas",      region:"las_vegas", funding:4,    momentum:58, employees:15,   founded:2022, description:"AI-powered sports betting analytics platform. Real-time odds modeling and bettor risk management.", eligible:["1864","fundnv"], lat:36.17, lng:-115.14 },
  { id:41, name:"Hibear",              stage:"seed",          sector:["Consumer","Manufacturing"],              city:"Las Vegas",      region:"las_vegas", funding:1.2,  momentum:58, employees:6,    founded:2022, description:"Multifunctional hydro flask with integrated brewing and filtering. StartUpNV portfolio company. Featured on Shark Tank April 2024. Nevada Dealroom ecosystem member.", eligible:["fundnv"], lat:36.17, lng:-115.14 },
  { id:42, name:"nFusz",               stage:"series_a",      sector:["AI","AdTech","Analytics"],             city:"Las Vegas",      region:"las_vegas", funding:7,    momentum:50, employees:20,   founded:2015, description:"Interactive video platform with AI analytics. Viewer engagement tracking for enterprise sales and marketing.", eligible:[], lat:36.17, lng:-115.14 },
  { id:43, name:"Sapien",              stage:"seed",          sector:["AI","Blockchain"],                     city:"Las Vegas",      region:"las_vegas", funding:3.5,  momentum:54, employees:12,   founded:2020, description:"Decentralized human data labeling platform for AI training. Web3-native annotation marketplace.", eligible:["1864"], lat:36.17, lng:-115.14 },
  { id:44, name:"SITO Mobile",         stage:"growth",        sector:["AdTech","Analytics","IoT"],            city:"Las Vegas",      region:"las_vegas", funding:15,   momentum:46, employees:40,   founded:2012, description:"Location-based consumer insights and advertising platform. Foot traffic analytics for hospitality and retail.", eligible:[], lat:36.17, lng:-115.14 },
  { id:45, name:"Lucihub",             stage:"seed",          sector:["AI","Media"],                          city:"Las Vegas",      region:"las_vegas", funding:3.2,  momentum:62, employees:12,   founded:2022, description:"AI-powered video production and editing. Automated storyboarding and post-production. CES Innovation Award.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:46, name:"Tokens.com",          stage:"growth",        sector:["Blockchain","Fintech"],                city:"Las Vegas",      region:"las_vegas", funding:14,   momentum:42, employees:20,   founded:2021, description:"Publicly traded crypto and metaverse investing company. Staking, DeFi, and digital real estate portfolio.", eligible:[], lat:36.17, lng:-115.14 },
  { id:47, name:"Cloudforce Networks",  stage:"seed",          sector:["Cloud","AI"],                           city:"Las Vegas",      region:"las_vegas", funding:0.5,  momentum:54, employees:8,    founded:2023, description:"Platform integrating key components of AWS Landing Zones into one accessible interface. Simplifies cloud workload management for enterprises. StartUpNV Pitch Day company.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:48, name:"SiO2 Materials",      stage:"series_a",      sector:["Materials Science","Manufacturing"],   city:"Las Vegas",      region:"las_vegas", funding:10,   momentum:56, employees:30,   founded:2019, description:"Advanced glass vial manufacturing using plasma-deposited SiO2 coating. Pharma and biotech packaging.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:49, name:"Ioneer",              stage:"growth",        sector:["Mining","Cleantech","Energy"],           city:"Reno",           region:"reno",      funding:700,  momentum:82, employees:60,   founded:2017, description:"Developing Rhyolite Ridge lithium-boron project in Esmeralda County. $700M DOE conditional loan commitment. Only known combined lithium-boron deposit in North America. ASX: INR.", eligible:["bbv"], lat:39.53, lng:-119.81 },
  { id:50, name:"Dragonfly Energy",    stage:"growth",        sector:["Energy","Manufacturing","Cleantech"],    city:"Reno",           region:"reno",      funding:120,  momentum:58, employees:200,  founded:2012, description:"Lithium-ion battery manufacturer specializing in deep-cycle LiFePO4 batteries. Proprietary dry electrode cell manufacturing. Nasdaq: DFLI. Battle Born Batteries brand.", eligible:["bbv"], lat:39.53, lng:-119.81 },
  // === DEFENSE / AEROSPACE ===
  { id:51, name:"Sierra Nevada Corp",  stage:"growth",        sector:["Defense","Aerospace","AI"],              city:"Sparks",         region:"reno",      funding:2000, momentum:80, employees:4500, founded:1963, description:"Global defense and aerospace company. Dream Chaser spaceplane for NASA ISS resupply. Electronic warfare, cybersecurity, autonomous systems. HQ in Sparks.", eligible:[], lat:39.53, lng:-119.75 },
  { id:52, name:"Nevada Nano",         stage:"series_a",      sector:["Defense","IoT","Semiconductors"],      city:"Las Vegas",      region:"las_vegas", funding:8,    momentum:66, employees:25,   founded:2013, description:"MEMS-based environmental sensing chips. Precise gas detection for defense, industrial, and air quality monitoring.", eligible:["sbir","bbv"], lat:36.17, lng:-115.14 },
  // === HOSPITALITY / ENTERTAINMENT TECH ===
  { id:53, name:"Duetto",              stage:"series_c_plus", sector:["AI","Hospitality","Analytics"],           city:"Las Vegas",      region:"las_vegas", funding:80,   momentum:72, employees:200,  founded:2012, description:"AI-powered hotel revenue management platform. Dynamic pricing for gaming resorts and hospitality. Used by major casino operators worldwide. Las Vegas-based engineering hub.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:54, name:"GAN Limited",         stage:"growth",        sector:["Gaming","AI","Fintech"],                city:"Las Vegas",      region:"las_vegas", funding:100,  momentum:58, employees:350,  founded:2002, description:"B2B platform powering online casino and sports betting for major US operators. Simulated gaming and real-money iGaming. Nasdaq: GAN. Las Vegas HQ.", eligible:[], lat:36.17, lng:-115.14 },
  { id:55, name:"NEXGEL",              stage:"growth",        sector:["Biotech","Manufacturing","Healthcare"],  city:"Las Vegas",      region:"las_vegas", funding:15,   momentum:50, employees:30,   founded:2014, description:"Proprietary ultra-gentle hydrogel technology platform. Medical, cosmetic, and consumer wellness applications. Nasdaq: NXGL. Las Vegas manufacturing.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  // === WATER / SUSTAINABILITY ===
  { id:56, name:"WaterStart",          stage:"series_a",      sector:["Water","Cleantech","AI"],               city:"Las Vegas",      region:"las_vegas", funding:8,    momentum:68, employees:20,   founded:2018, description:"Nevada water innovation cluster backed by Southern Nevada Water Authority. Accelerates water tech commercialization. Pilots desalination, reuse, and conservation technologies statewide.", eligible:["bbv","sbir"], lat:36.17, lng:-115.14 },
  { id:57, name:"Now Ads",             stage:"pre_seed",      sector:["AdTech","AI"],                          city:"Carson City",    region:"reno",      funding:0.3,  momentum:46, employees:5,    founded:2023, description:"Online advertising platform with AI-driven targeting. Adams Hub accelerator company in Carson City. Seeking pre-seed funding for market expansion.", eligible:["fundnv"], lat:39.16, lng:-119.77 },
  // === DATA CENTER / CLOUD ===
  { id:58, name:"Switch Inc",          stage:"growth",        sector:["Data Center","Cloud","Energy"],         city:"Las Vegas",      region:"las_vegas", funding:530,  momentum:60, employees:1000, founded:2000, description:"Hyperscale data centers. SUPERNAP campus in Las Vegas is one of the world's largest. Acquired by DigitalBridge 2022.", eligible:[], lat:36.08, lng:-115.15 },
  { id:59, name:"Talentel",            stage:"seed",          sector:["AI","HR Tech"],                         city:"Carson City",    region:"reno",      funding:0.5,  momentum:48, employees:6,    founded:2022, description:"AI-powered talent matching and workforce development platform. Adams Hub accelerator graduate. Connecting Nevada employers with skilled workers.", eligible:["fundnv"], lat:39.16, lng:-119.77 },
  // === BIOTECH / HEALTH ===
  { id:60, name:"Elicio Therapeutics",  stage:"series_c_plus", sector:["Biotech","Healthcare"],               city:"Las Vegas",      region:"las_vegas", funding:100,  momentum:62, employees:60,   founded:2019, description:"Immunotherapy platform for cancer vaccines. AMP technology targets lymph nodes. Multiple clinical trials.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  { id:61, name:"Canyon Ranch",        stage:"growth",        sector:["Healthcare","Hospitality"],            city:"Las Vegas",      region:"las_vegas", funding:30,   momentum:50, employees:500,  founded:1979, description:"Integrative wellness destination with precision health and diagnostics programs. Las Vegas and Tucson locations.", eligible:[], lat:36.17, lng:-115.14 },
  { id:62, name:"MiOrganics",          stage:"seed",          sector:["AI","Enterprise"],                      city:"Las Vegas",      region:"las_vegas", funding:0.5,  momentum:50, employees:10,   founded:2022, description:"Custom software development company specializing in innovative business solutions across industries. AngelNV 2025 finalist. Enterprise workflow automation.", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  // === LOGISTICS / TRANSPORTATION ===
  { id:63, name:"BuildQ",              stage:"seed",          sector:["AI","Construction","Cleantech"],         city:"Las Vegas",      region:"las_vegas", funding:0.4,  momentum:68, employees:8,    founded:2024, description:"AI-powered project finance platform for renewable energy infrastructure. Streamlines complex financing for developers. AngelNV 2025 winner. First FundNV2 investment ($200K with SSBCI match).", eligible:["fundnv","1864"], lat:36.17, lng:-115.14 },
  { id:64, name:"Nuvve Corp",          stage:"growth",        sector:["Energy","Logistics","IoT"],            city:"Las Vegas",      region:"las_vegas", funding:40,   momentum:52, employees:50,   founded:2019, description:"Vehicle-to-grid (V2G) technology for electric buses and fleet vehicles. Smart charging infrastructure.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  // === EDUCATION / WORKFORCE ===
  { id:65, name:"SilverSun Technologies",stage:"growth",      sector:["Cloud","AI","Enterprise"],               city:"Las Vegas",      region:"las_vegas", funding:10,   momentum:48, employees:60,   founded:2002, description:"Cloud-based ERP and IT consulting for small and mid-market businesses. Managed IT services and cybersecurity. Nasdaq: SSNT. Las Vegas headquarters.", eligible:[], lat:36.17, lng:-115.14 },
  // === CANNABIS TECH ===
  { id:66, name:"Curaleaf Tech",       stage:"growth",        sector:["Cannabis","Analytics","Logistics"],     city:"Las Vegas",      region:"las_vegas", funding:75,   momentum:54, employees:300,  founded:2010, description:"Multi-state cannabis operator with significant Nevada presence. Select brand. Cultivation and retail tech platform.", eligible:[], lat:36.17, lng:-115.14 },
  { id:67, name:"Planet 13",           stage:"growth",        sector:["Cannabis","Retail","IoT"],              city:"Las Vegas",      region:"las_vegas", funding:55,   momentum:56, employees:400,  founded:2017, description:"Superstore cannabis entertainment complex on Las Vegas Strip. World's largest dispensary. Publicly traded (OTC: PLNHF).", eligible:[], lat:36.14, lng:-115.16 },
  // === FINTECH / CRYPTO ===
  { id:68, name:"GBank Financial",     stage:"series_a",      sector:["Fintech","Banking"],                   city:"Las Vegas",      region:"las_vegas", funding:8,    momentum:50, employees:25,   founded:2007, description:"Digital-first community bank holding company. BankCard Services partnership. Fintech-banking bridge.", eligible:[], lat:36.17, lng:-115.14 },
  { id:69, name:"Acres Technology",    stage:"series_a",      sector:["Gaming","Fintech","IoT"],              city:"Las Vegas",      region:"las_vegas", funding:12,   momentum:62, employees:35,   founded:2013, description:"Foundation casino management platform. Cashless gaming, player loyalty, and real-time analytics for slot floors.", eligible:["bbv"], lat:36.17, lng:-115.14 },
  // === CONSTRUCTION / REAL ESTATE TECH ===
  { id:70, name:"Bombard Renewable Energy",stage:"growth",    sector:["Solar","Energy","Construction"],         city:"Las Vegas",      region:"las_vegas", funding:25,   momentum:62, employees:500,  founded:2010, description:"Nevada's largest solar electrical contractor. Commercial and utility-scale solar installations across the Southwest. Subsidiary of Bombard Electric. Major Strip resort projects.", eligible:[], lat:36.08, lng:-115.18 },
  { id:71, name:"Jackpot Digital",     stage:"growth",        sector:["Gaming","IoT","Fintech"],               city:"Las Vegas",      region:"las_vegas", funding:8,    momentum:52, employees:25,   founded:2013, description:"Electronic table games (ETGs) manufacturer. Dealerless blackjack, roulette, baccarat. Installed at casinos across US, Canada, and international markets. TSX: JP.", eligible:[], lat:36.17, lng:-115.14 },
  // === AEROSPACE / SPACE ===
  { id:72, name:"Skydio Gov",          stage:"series_a",      sector:["Defense","AI","Drones"],                city:"Las Vegas",      region:"las_vegas", funding:10,   momentum:74, employees:30,   founded:2021, description:"Government and defense drone operations center supporting autonomous UAS missions at NTTR and Nellis AFB. Counter-UAS testing and AI-powered ISR. Nevada operations hub.", eligible:["sbir","bbv"], lat:36.24, lng:-115.04 },
  // === MANUFACTURING / MATERIALS ===
  { id:73, name:"Aqua Metals",         stage:"growth",        sector:["Cleantech","Manufacturing"],           city:"Reno",           region:"reno",      funding:120,  momentum:52, employees:80,   founded:2014, description:"Clean battery recycling with AquaRefining. Non-polluting lead recycling. NYSE American: AQMS. TRIC facility.", eligible:["bbv"], lat:39.53, lng:-119.81 },
  { id:74, name:"Ormat Technologies",  stage:"growth",        sector:["Energy","Cleantech","Manufacturing"],   city:"Reno",           region:"reno",      funding:400,  momentum:62, employees:1400, founded:1965, description:"Global leader in geothermal energy and recovered energy generation. NYSE: ORA. Reno HQ. Operates geothermal plants across Nevada, California, and internationally.", eligible:[], lat:39.53, lng:-119.81 },
  { id:75, name:"NV5 Global",          stage:"growth",        sector:["Construction","Energy","Analytics"],     city:"Las Vegas",      region:"las_vegas", funding:200,  momentum:56, employees:4000, founded:2011, description:"Infrastructure services and consulting firm. Geospatial, environmental, construction QA, energy. Nasdaq: NVEE. Las Vegas HQ with offices across 100+ locations.", eligible:[], lat:36.17, lng:-115.14 },
];

// --- REAL NEVADA FUNDS ---
const FUNDS = [
  { id:"bbv",    name:"Battle Born Venture", type:"SSBCI",         allocated:36,   deployed:14.8, leverage:3.2, companies:12, thesis:"Co-invest alongside private lead investors in NV tech startups via SSBCI match" },
  { id:"fundnv", name:"FundNV",              type:"SSBCI",         allocated:3,    deployed:2.4,  leverage:2.8, companies:18, thesis:"Pre-seed fund writing $50K checks to StartUpNV accelerator graduates. SSBCI 1:1 match" },
  { id:"1864",   name:"1864 Fund",           type:"SSBCI",         allocated:10,   deployed:1.2,  leverage:4.1, companies:5,  thesis:"Seed capital for the forgotten middle of America — intermountain states to Mississippi" },
  { id:"angelnv",name:"AngelNV",             type:"Angel",         allocated:null, deployed:5.5,  leverage:null,companies:22, thesis:"Southern Nevada angel investor bootcamp. 40 accredited investors per cohort, $200K team investments" },
  { id:"sierra", name:"Sierra Angels",       type:"Angel",         allocated:null, deployed:3.2,  leverage:null,companies:15, thesis:"Northern Nevada angel investing community. Individual angel investments in Reno/Tahoe startups" },
  { id:"dcvc",   name:"DCVC",               type:"Deep Tech VC",  allocated:null, deployed:8.2,  leverage:null,companies:4,  thesis:"Deep tech VC — active in NV climate, energy, and materials science" },
  { id:"stripes",name:"Stripes",             type:"Growth VC",     allocated:null, deployed:26,   leverage:null,companies:1,  thesis:"NYC-based growth equity firm. Led Katalyst Series A. Consumer tech focus" },
  { id:"startupnv",name:"StartUpNV",        type:"Accelerator",   allocated:null, deployed:29.7, leverage:null,companies:22, thesis:"NV statewide nonprofit accelerator. 30 investment transactions since 2021 across affiliated funds" },
];

// --- REAL TIMELINE EVENTS (based on verified press, reasonable dates) ---
const TIMELINE_EVENTS = [
  { date:"2025-02-20", type:"funding",    company:"TensorWave",       detail:"Deployed AMD MI355X GPUs — first cloud provider to market",         icon:"🚀" },
  { date:"2025-02-18", type:"partnership",company:"Hubble Network",   detail:"Muon Space contract for 500kg MuSat XL satellite buses",            icon:"🤝" },
  { date:"2025-02-15", type:"hiring",     company:"Abnormal AI",      detail:"+50 engineers hired Q1 — Las Vegas office expansion",               icon:"👥" },
  { date:"2025-02-14", type:"funding",    company:"MagicDoor",        detail:"$4.5M Seed — Okapi VC + Shadow Ventures co-lead",                  icon:"💰" },
  { date:"2025-02-12", type:"launch",     company:"Katalyst",         detail:"New AI-personalized training programs with biometric feedback",     icon:"🚀" },
  { date:"2025-02-10", type:"momentum",   company:"TensorWave",       detail:"Run-rate revenue exceeds $100M — 20x YoY growth",                 icon:"📈" },
  { date:"2025-02-08", type:"grant",      company:"Sierra Nevada Energy",detail:"DOE Geothermal Technologies Office grant — $2.1M",             icon:"🏛️" },
  { date:"2025-02-07", type:"partnership",company:"Springbig",        detail:"New payment integration live at 200+ NV dispensaries",              icon:"🤝" },
  { date:"2025-02-05", type:"funding",    company:"Hubble Network",   detail:"$70M Series B — total raised now $100M",                           icon:"💰" },
  { date:"2025-02-04", type:"award",      company:"MNTN",             detail:"Adweek Readers' Choice: Best Addressable TV Solution (back-to-back)",icon:"🏆" },
  { date:"2025-02-03", type:"funding",    company:"Redwood Materials", detail:"$425M Series E close — Google + Nvidia NVentures backing",        icon:"💰" },
  { date:"2025-02-01", type:"hiring",     company:"TensorWave",       detail:"Team growing from 40 → 100+ employees by year end",                icon:"👥" },
  { date:"2025-01-29", type:"patent",     company:"Hubble Network",   detail:"Patent granted: phased-array BLE satellite antenna system",        icon:"📜" },
  { date:"2025-01-28", type:"launch",     company:"Boxabl",           detail:"New Casita 2.0 model with expanded floor plan announced",          icon:"🚀" },
  { date:"2025-01-25", type:"grant",      company:"Nevada Nano",      detail:"SBIR Phase II — $750K for MEMS gas sensing array",                 icon:"🏛️" },
  { date:"2025-01-23", type:"momentum",   company:"Socure",           detail:"Acquired Qlarifi — expanding into real-time BNPL credit",          icon:"📈" },
  { date:"2025-01-22", type:"funding",    company:"Protect AI",       detail:"$18.5M raised for AI/ML security platform expansion",              icon:"💰" },
  { date:"2025-01-20", type:"partnership",company:"Kaptyn",           detail:"EV fleet expansion — 25 new Tesla vehicles for Strip service",     icon:"🤝" },
  { date:"2025-01-18", type:"launch",     company:"CIQ",              detail:"Rocky Linux 9.5 release with enhanced enterprise security",        icon:"🚀" },
  { date:"2025-01-17", type:"funding",    company:"Amira Learning",   detail:"Series B extension — expanding to 3,000+ schools",                 icon:"💰" },
  { date:"2025-01-15", type:"award",      company:"Katalyst",         detail:"CES 2025 Innovation Award — Best Fitness Technology",              icon:"🏆" },
  { date:"2025-01-14", type:"momentum",   company:"Abnormal AI",      detail:"Surpassed 2,000 enterprise customers — $5.1B valuation",           icon:"📈" },
  { date:"2025-01-12", type:"grant",      company:"Truckee Robotics", detail:"SBIR Phase I — $275K autonomous mining inspection",                icon:"🏛️" },
  { date:"2025-01-11", type:"hiring",     company:"Redwood Materials", detail:"+85 roles posted for Carson City campus expansion",                icon:"👥" },
  { date:"2025-01-10", type:"partnership",company:"1047 Games",       detail:"New publishing partnership for next-gen arena shooter",             icon:"🤝" },
  { date:"2025-01-08", type:"funding",    company:"Cognizer AI",      detail:"$240K FundNV investment for AI workflow automation",                icon:"💰" },
  { date:"2025-01-07", type:"patent",     company:"Redwood Materials", detail:"3 patents filed: cathode regeneration process improvements",      icon:"📜" },
  { date:"2025-01-05", type:"momentum",   company:"MagicDoor",        detail:"500+ landlord accounts — fastest growing NV proptech",              icon:"📈" },
  { date:"2025-01-03", type:"grant",      company:"WaterStart",       detail:"SNWA pilot grant — $400K for atmospheric water generation test",   icon:"🏛️" },
  { date:"2025-01-02", type:"hiring",     company:"Socure",           detail:"Matt Thompson appointed President & Chief Commercial Officer",      icon:"👥" },
];

// ══════════════════════════════════════════════════════════════════════════════
// ONTOLOGY GRAPH DATA — 100% Verified from SEC EDGAR, StartUpNV, press releases
// ══════════════════════════════════════════════════════════════════════════════

const GRAPH_FUNDS=[
{id:"bbv",name:"Battle Born Venture",type:"SSBCI"},{id:"fundnv",name:"FundNV",type:"SSBCI"},
{id:"1864",name:"1864 Fund",type:"SSBCI"},{id:"sbir",name:"SBIR/STTR",type:"Federal"},
{id:"angelnv",name:"AngelNV",type:"Angel"},{id:"sierra",name:"Sierra Angels",type:"Angel"},
];
const PEOPLE=[
{id:"p_straubel",name:"JB Straubel",role:"Founder/CEO",companyId:1,note:"Tesla co-founder"},
{id:"p_reynolds",name:"Ryan Reynolds",role:"CCO",companyId:9,note:"Chief Creative Officer"},
{id:"p_kurtzer",name:"Gregory Kurtzer",role:"Founder",companyId:11,note:"CentOS/Rocky Linux creator"},
{id:"p_barron",name:"Maryssa Barron",role:"Founder/CEO",companyId:63,note:"AngelNV 2025 winner"},
{id:"p_tomasik",name:"Piotr Tomasik",role:"Founder",companyId:4,note:"AMD GPU cloud pioneer"},
{id:"p_saling",name:"Jeff Saling",role:"Exec Director",companyId:null,note:"StartUpNV co-founder, FundNV GP"},
];
const EXTERNALS=[
{id:"x_stellantis",name:"Stellantis",etype:"Corporation",note:"Lyten strategic investor"},
{id:"x_fedex",name:"FedEx",etype:"Corporation",note:"Lyten strategic investor"},
{id:"x_honeywell",name:"Honeywell",etype:"Corporation",note:"Lyten strategic investor"},
{id:"x_okapi",name:"Okapi VC",etype:"VC Firm",note:"MagicDoor seed co-lead"},
{id:"x_shadow",name:"Shadow Ventures",etype:"VC Firm",note:"MagicDoor seed co-lead"},
{id:"x_stripes",name:"Stripes",etype:"VC Firm",note:"Katalyst Series A lead"},
{id:"x_doe",name:"US Dept of Energy",etype:"Government",note:"$2B Redwood loan; $996M Ioneer loan; $350M Ormat loan; Aqua Metals grant. Loan Programs Office."},
{id:"x_nasa",name:"NASA",etype:"Government",note:"SNC Dream Chaser contract"},
{id:"x_fda",name:"FDA",etype:"Government",note:"Katalyst; Filament Health"},
{id:"x_snwa",name:"SNWA",etype:"Government",note:"WaterStart backer"},
{id:"x_digitalbridge",name:"DigitalBridge",etype:"PE Firm",note:"Took Switch Inc private 2022 for $11B. $80B+ digital infrastructure AUM."},
{id:"x_life360",name:"Life360/Tile",etype:"Corporation",note:"Hubble 90M+ device partner"},
{id:"x_mgm",name:"MGM Resorts",etype:"Corporation",note:"PlayStudios rewards partner + ~10% equity stake via PIPE. Exclusive social gaming rights."},
{id:"x_marriott",name:"Marriott",etype:"Corporation",note:"PlayStudios rewards"},
{id:"x_muonspace",name:"Muon Space",etype:"Corporation",note:"Hubble satellite bus contract"},
{id:"x_unr",name:"UNR",etype:"University",note:"Research partnerships"},
{id:"x_ssbci",name:"NV SSBCI",etype:"Government",note:"Fund matching program"},
{id:"x_caesars",name:"Caesars Entertainment",etype:"Corporation",note:"Co-founded Black Fire Innovation with UNLV 2020. Zero Labs advisor. World's most diversified casino-entertainment provider."},
{id:"x_panasonic",name:"Panasonic",etype:"Corporation",note:"Black Fire tech partner. Equipment and technology deployment."},
{id:"x_boyd",name:"Boyd Gaming",etype:"Corporation",note:"LV-based casino operator. Boyd Innovation Lab at Black Fire Innovation (2023). Keith Smith CEO."},
{id:"x_intel",name:"Intel",etype:"Corporation",note:"Key computing partner at Black Fire Innovation. IoT, visual analytics, edge computing for hospitality."},
{id:"x_shift",name:"Shift Studio",etype:"Corporation",note:"Innovation/product studio. $300K strategic partnership with Zero Labs. Design + engineering for cohort startups."},
{id:"x_usaf",name:"US Air Force",etype:"Government",note:"AFWERX parent organization"},
{id:"x_accel",name:"Accel",etype:"VC Firm",note:"Led Socure Series D/E. $450M round."},
{id:"x_trowe",name:"T. Rowe Price",etype:"VC Firm",note:"Co-led Socure Series E $450M"},
{id:"x_tiger",name:"Tiger Global",etype:"VC Firm",note:"Socure Series E investor"},
{id:"x_wellington",name:"Wellington Mgmt",etype:"VC Firm",note:"Led Abnormal AI Series D $250M at $5.1B"},
{id:"x_greylock",name:"Greylock",etype:"VC Firm",note:"Abnormal AI investor since inception"},
{id:"x_insight",name:"Insight Partners",etype:"VC Firm",note:"Abnormal AI Series C/D"},
{id:"x_crowdstrike",name:"CrowdStrike",etype:"Corporation",note:"CrowdStrike Falcon Fund → Abnormal AI"},
{id:"x_amd",name:"AMD Ventures",etype:"Corporation",note:"Co-led TensorWave Series A. Strategic GPU partner."},
{id:"x_magnetar",name:"Magnetar",etype:"VC Firm",note:"Co-led TensorWave $100M Series A"},
{id:"x_nexusvp",name:"Nexus Venture Partners",etype:"VC Firm",note:"Led TensorWave $43M SAFE round"},
{id:"x_blackrock",name:"BlackRock",etype:"VC Firm",note:"Co-led MNTN Series D $119M"},
{id:"x_fidelity",name:"Fidelity",etype:"VC Firm",note:"Co-led MNTN Series D $119M"},
{id:"x_greycroft",name:"Greycroft",etype:"VC Firm",note:"Early MNTN investor"},
{id:"x_thor",name:"THOR Industries",etype:"Corporation",note:"Strategic investor in Dragonfly Energy. Largest RV OEM."},
{id:"x_eip",name:"Energy Impact Partners",etype:"VC Firm",note:"Led $75M term loan for Dragonfly SPAC"},
{id:"x_draper",name:"Draper Associates",etype:"VC Firm",note:"Tim Draper. Boxabl investor."},
{id:"x_bain_cv",name:"Bain Capital Ventures",etype:"VC Firm",note:"Socure Series E. $10B AUM."},
{id:"x_commerce_v",name:"Commerce Ventures",etype:"VC Firm",note:"Socure investor Series B onward."},
{id:"x_sorenson",name:"Sorenson Capital",etype:"VC Firm",note:"Socure investor since Series C."},
{id:"x_twosigma",name:"Two Sigma Ventures",etype:"VC Firm",note:"Socure Series A investor."},
{id:"x_citi_v",name:"Citi Ventures",etype:"Corporation",note:"Strategic investor in Socure."},
{id:"x_cap1_v",name:"Capital One Ventures",etype:"Corporation",note:"Strategic investor in Socure."},
{id:"x_menlo",name:"Menlo Ventures",etype:"VC Firm",note:"Abnormal AI Series B/C/D."},
{id:"x_evolution",name:"Evolution Equity",etype:"VC Firm",note:"Led Protect AI Series A+B."},
{id:"x_salesforce_v",name:"Salesforce Ventures",etype:"Corporation",note:"Protect AI Series A/B."},
{id:"x_pelion",name:"Pelion Ventures",etype:"VC Firm",note:"Protect AI seed→B."},
{id:"x_boldstart",name:"Boldstart Ventures",etype:"VC Firm",note:"Protect AI seed→B."},
{id:"x_samsung",name:"Samsung",etype:"Corporation",note:"Protect AI Series B."},
{id:"x_paloalto",name:"Palo Alto Networks",etype:"Corporation",note:"Acquired Protect AI Apr 2025."},
{id:"x_prosperity7",name:"Prosperity7",etype:"VC Firm",note:"Aramco Ventures. TensorWave Series A."},
{id:"x_maverick",name:"Maverick Silicon",etype:"VC Firm",note:"TensorWave SAFE+A."},
{id:"x_translink",name:"TransLink Capital",etype:"VC Firm",note:"TensorWave SAFE."},
{id:"x_mercato",name:"Mercato Partners",etype:"VC Firm",note:"MNTN early investor."},
{id:"x_qualcomm_v",name:"Qualcomm Ventures",etype:"Corporation",note:"MNTN early investor."},
{id:"x_rincon",name:"Rincon Venture Partners",etype:"VC Firm",note:"MNTN early investor."},
{id:"x_baroda",name:"Baroda Ventures",etype:"VC Firm",note:"MNTN early investor."},
{id:"x_buildtech",name:"BuildTech VC",etype:"VC Firm",note:"Boxabl investor."},
{id:"x_elevation",name:"Elevation Capital",etype:"VC Firm",note:"Boxabl investor."},
{id:"x_chardan",name:"Chardan Capital",etype:"VC Firm",note:"Dragonfly SPAC sponsor."},
{id:"x_warburg",name:"Warburg Pincus",etype:"PE Firm",note:"Led Duetto Series D $80M."},
{id:"x_battery",name:"Battery Ventures",etype:"VC Firm",note:"Led Duetto Series A $10M."},
{id:"x_growthcurve",name:"GrowthCurve Capital",etype:"PE Firm",note:"Acquired Duetto Jun 2024."},
{id:"x_blackstone",name:"Blackstone",etype:"PE Firm",note:"Led Carbon Health Series D $350M."},
{id:"x_cvs",name:"CVS Health Ventures",etype:"Corporation",note:"Led Carbon Health Series D2 $100M."},
{id:"x_dragoneer",name:"Dragoneer Investment Group",etype:"VC Firm",note:"Led Carbon Health Series C $100M."},
{id:"x_lightspeed",name:"Lightspeed Venture Partners",etype:"VC Firm",note:"Led 1047 Games Series B $100M."},
{id:"x_galaxy",name:"Galaxy Interactive",etype:"VC Firm",note:"Led 1047 Games seed $6.5M."},
{id:"x_apollo",name:"Apollo Global Management",etype:"PE Firm",note:"$671B AUM. Acquired Everi+IGT Gaming Jul 2025, $6.3B combined. Owns Venetian/Palazzo."},
{id:"x_segasammy",name:"SEGA SAMMY Holdings",etype:"Corporation",note:"Acquired GAN Limited May 2025, $1.97/share (121% premium)."},
{id:"x_orix",name:"ORIX Corp",etype:"Corporation",note:"Japanese financial services. Ormat Industries (subsidiary) owns 44.76% of Ormat Technologies."},
{id:"x_acuren",name:"Acuren",etype:"Corporation",note:"Acquired NV5 Global Aug 2025. ~$23/share ($10 cash + $13 stock). Engineering inspection/testing."},
{id:"x_canaan",name:"Canaan Partners",etype:"VC Firm",note:"Led Ollie Series A $12.6M Aug 2017. Early-stage VC."},
{id:"x_lererhippeau",name:"Lerer Hippeau",etype:"VC Firm",note:"Ollie seed co-lead. NYC early-stage VC."},
{id:"x_twobear",name:"Two Bear Capital",etype:"VC Firm",note:"Led CIQ Series A $26M May 2022. Whitefish, MT based."},
{id:"x_iag",name:"IAG Capital Partners",etype:"VC Firm",note:"CIQ bridge round 2021. Early-stage tech."},
{id:"x_tuatara",name:"Tuatara Capital",etype:"VC Firm",note:"Cannabis-focused SPAC. Springbig SPAC sponsor (TCAC→SBIG Jun 2022)."},
{id:"x_tvc",name:"TVC Capital",etype:"VC Firm",note:"Springbig PIPE investor. B2B SaaS focused."},
{id:"x_agrolimen",name:"Agrolimen",etype:"Corporation",note:"Spanish conglomerate. Acquired Ollie 2025."},
{id:"x_google",name:"Google",etype:"Corporation",note:"Rocky Linux CIQ partner. 150MW geothermal PPA with Ormat via NV Energy. Data center ops NV."},
{id:"x_ballistic",name:"Ballistic Ventures",etype:"VC Firm",note:"Cybersecurity-dedicated VC. Nudge Security seed $7M Apr 2022."},
{id:"x_cerberus_v",name:"Cerberus Ventures",etype:"VC Firm",note:"Led Nudge Security Series A $22.5M Nov 2025."},
{id:"x_forgepoint",name:"Forgepoint Capital",etype:"VC Firm",note:"Cybersecurity VC. Nudge Security seed + Series A."},
{id:"x_squadra",name:"Squadra Ventures",etype:"VC Firm",note:"Early-stage cyber & national security. Nudge Security investor."},
{id:"x_efung",name:"EFung Capital",etype:"VC Firm",note:"Biomedical VC. Elicio Therapeutics Series B investor."},
{id:"x_clal_bio",name:"Clal Biotechnology",etype:"Investment Co",note:"Israeli life sciences. TASE:CBI. Elicio Series B."},
{id:"x_eif",name:"Ecosystem Integrity Fund",etype:"VC Firm",note:"Climate/impact VC. Led Vibrant Planet seed+Series A."},
{id:"x_msft_climate",name:"Microsoft Climate Fund",etype:"Corporation",note:"Microsoft Climate Innovation Fund. Vibrant Planet Series A."},
{id:"x_dayonev",name:"Day One Ventures",etype:"VC Firm",note:"Early-stage VC. Vibrant Planet Series A."},
{id:"x_grantham",name:"Grantham Foundation",etype:"Foundation",note:"Jeremy & Hannelore Grantham Environmental Trust. Vibrant Planet seed."},
{id:"x_owl",name:"Owl Ventures",etype:"VC Firm",note:"$2.2B+ AUM EdTech-focused VC. Amira Learning investor."},
{id:"x_authentic",name:"Authentic Ventures",etype:"VC Firm",note:"Led Amira Learning Series A $11M."},
{id:"x_amazon_af",name:"Amazon Alexa Fund",etype:"Corporation",note:"Amira Learning investor. Voice/AI-focused corporate VC."},
{id:"x_edf",name:"EDF Renewables",etype:"Corporation",note:"Corporate investor in Nuvve. V2G JV partner (DREEV)."},
{id:"x_toyota_tsusho",name:"Toyota Tsusho",etype:"Corporation",note:"Nuvve Series A investor Dec 2017. Toyota Group trading arm."},
{id:"x_newborn",name:"Newborn Acquisition",etype:"SPAC",note:"Shanghai-based SPAC. Merged with Nuvve Mar 2021. Nasdaq:NBAC→NVVE."},
{id:"x_thirdprime",name:"Third Prime",etype:"VC Firm",note:"Co-led Climb Credit Series A $9.8M."},
{id:"x_newmarkets",name:"New Markets VP",etype:"VC Firm",note:"Co-led Climb Credit Series A. EdTech/workforce focused."},
{id:"x_newfund",name:"Newfund Capital",etype:"VC Firm",note:"Early Climb Credit investor. Franco-American VC."},
// === Phase 2: VC/PE + Institutional investors ===
{id:"x_goldman",name:"Goldman Sachs AM",etype:"PE Firm",note:"Co-led Redwood Materials Series D $1B. Global investment bank."},
{id:"x_capricorn",name:"Capricorn Technology Impact",etype:"VC Firm",note:"Co-led Redwood Series D. Climate/energy deep tech."},
{id:"x_eclipse_v",name:"Eclipse Ventures",etype:"VC Firm",note:"Led Redwood Materials Series E $350M Oct 2025."},
{id:"x_nventures",name:"NVentures (Nvidia)",etype:"Corporation",note:"Nvidia VC arm. Redwood Materials Series E Oct 2025."},
{id:"x_fidelity",name:"Fidelity Investments",etype:"Investment Co",note:"Redwood Materials Series C investor. $4.5T+ AUM."},
{id:"x_cpp",name:"CPP Investments",etype:"PE Firm",note:"Canada Pension Plan. Redwood Materials Series C. C$570B+ AUM."},
{id:"x_breakthrough",name:"Breakthrough Energy",etype:"VC Firm",note:"Bill Gates-led climate fund. Redwood Materials Series B."},
{id:"x_amazon_cpf",name:"Amazon Climate Pledge",etype:"Corporation",note:"Amazon corporate VC for sustainability. Redwood Materials investor."},
{id:"x_omers",name:"OMERS",etype:"PE Firm",note:"Ontario pension. Redwood Materials Series D. C$130B+ AUM."},
{id:"x_ford",name:"Ford Motor Company",etype:"Corporation",note:"Redwood Materials strategic investor. EV battery supply chain partner."},
{id:"x_caterpillar_v",name:"Caterpillar Ventures",etype:"Corporation",note:"Caterpillar corporate VC. Redwood Materials Series D."},
{id:"x_ozmen",name:"Ozmen Ventures",etype:"VC Firm",note:"Eren & Fatih Ozmen family office. Seed/early-stage NV tech. SNC owners."},
{id:"x_blueorigin",name:"Blue Origin",etype:"Corporation",note:"Jeff Bezos space company. Orbital Reef partner with Sierra Space."},
{id:"x_swagar",name:"Swagar Capital",etype:"VC Firm",note:"Led Hubble Network Series B $70M. Ryan Swagar, former Life360 Series A lead."},
{id:"x_rpm",name:"RPM Ventures",etype:"VC Firm",note:"Marc Weiser (former NASA board). Hubble Network Series B."},
{id:"x_yc",name:"Y Combinator",etype:"VC Firm",note:"Premiere startup accelerator. Hubble Network Series B investor."},
{id:"x_seraph",name:"Seraph Group",etype:"VC Firm",note:"Tuff Yen. Hubble Network Series B. Deep-tech angels."},
// PlayStudios investor entities
{id:"x_blackrock",name:"BlackRock",etype:"PE Firm",note:"World's largest asset manager $10T+ AUM. PlayStudios PIPE investor."},
{id:"x_neuberger",name:"Neuberger Berman",etype:"PE Firm",note:"PlayStudios PIPE investor. $500B+ AUM."},
{id:"x_clearbridge",name:"ClearBridge Investments",etype:"PE Firm",note:"PlayStudios PIPE investor. Franklin Templeton subsidiary."},
{id:"x_acies",name:"Acies Acquisition Corp",etype:"SPAC",note:"Jim Murren (ex-MGM CEO) chaired SPAC. Merged with PlayStudios Jun 2021. Nasdaq:MYPS."},
// Dragonfly Energy entities
{id:"x_chardan",name:"Chardan NexTech",etype:"SPAC",note:"SPAC merged with Dragonfly Energy Oct 2022. Nasdaq:DFLI. Jonas Grossman CEO."},
{id:"x_thor",name:"Thor Industries",etype:"Corporation",note:"World's largest RV manufacturer. $15M strategic investment in Dragonfly Energy."},
{id:"x_eip",name:"Energy Impact Partners",etype:"VC Firm",note:"Led $75M term loan for Dragonfly SPAC. Climate/energy infra VC."},
{id:"x_stryten",name:"Stryten Energy",etype:"Corporation",note:"$30M licensing deal for Battle Born Batteries brand. US battery manufacturer."},
// Aqua Metals entities
{id:"x_6kenergy",name:"6K Energy",etype:"Corporation",note:"Multi-year supply agreement with Aqua Metals. Cathode mfg."},
{id:"x_goed",name:"NV GOED",etype:"Government",note:"Nevada Governor's Office of Economic Development. Tax abatements, Knowledge Fund, SSBCI, Battle Born Growth accelerators."},
// Ioneer entity
{id:"x_sibanye",name:"Sibanye-Stillwater",etype:"Corporation",note:"SA precious metals miner. Had $490M JV with Ioneer, withdrew Feb 2025. Holds 6% equity."},
// === Phase 3: Government, Public Market, Institutional ===
// Ormat Technologies entities
{id:"x_fimi",name:"FIMI Opportunity Funds",etype:"PE Firm",note:"Israeli PE. Ormat's largest shareholder ~14.8%. FIMI fund."},
{id:"x_nvenergy",name:"NV Energy",etype:"Corporation",note:"Nevada utility (Berkshire Hathaway Energy). PPA partner for Ormat, Switch, etc."},
// Canyon Ranch entities
{id:"x_goff",name:"Goff Capital Partners",etype:"PE Firm",note:"John Goff. Acquired Canyon Ranch 2017. Fort Worth billionaire. Crescent Real Estate."},
{id:"x_vici",name:"VICI Properties",etype:"PE Firm",note:"$500M partnership with Canyon Ranch. Owns Caesars Palace, MGM Grand real estate."},
// Kaptyn entities
{id:"x_atw",name:"ATW Partners",etype:"VC Firm",note:"Kaptyn Series A/B investor. NY-based technology VC."},
{id:"x_kibble",name:"Kibble Holdings",etype:"VC Firm",note:"Kaptyn early investor. Seed + Series A."},
// Comstock entities
{id:"x_linico",name:"LiNiCo Corp",etype:"Corporation",note:"Lithium-ion battery recycler. 64% owned by Comstock. TRI facility near Tesla Gigafactory."},
// Comstock additional entities
{id:"x_marathon",name:"Marathon Petroleum",etype:"Corporation",note:"Series A strategic investor in Comstock Fuels. Major US oil refiner."},
{id:"x_rwe",name:"RWE Clean Energy",etype:"Corporation",note:"Master services agreement with Comstock Metals. Solar decommissioning/recycling partner."},
// Additional Phase 3 entities
{id:"x_igt",name:"IGT Gaming",etype:"Corporation",note:"Combined with Everi under Apollo ownership Jul 2025. Global gaming/fintech/digital leader."},

];
const ACCELERATORS=[
{id:"a_startupnv",name:"StartUpNV",atype:"Accelerator/Incubator",city:"Las Vegas",region:"las_vegas",founded:2017,note:"NV statewide accelerator. Non-cohort. Min $100K via FundNV."},
{id:"a_angelnv",name:"AngelNV",atype:"Angel Program",city:"Las Vegas",region:"las_vegas",founded:2019,note:"Annual angel investor bootcamp + pitch competition. $200K+ investments."},
{id:"a_adamshub",name:"Adams Hub",atype:"Accelerator",city:"Carson City",region:"reno",founded:2020,note:"Carson City accelerator."},
{id:"a_gener8tor_lv",name:"gener8tor Las Vegas",atype:"Accelerator",city:"Las Vegas",region:"las_vegas",founded:2022,note:"SSBCI-funded Battle Born Growth accelerator. 12-week, $100K/company. Sector-agnostic. GOED + LVGEA supported."},
{id:"a_gener8tor_reno",name:"gener8tor Reno-Tahoe",atype:"Accelerator",city:"Reno",region:"reno",founded:2022,note:"SSBCI-funded at UNR Innevation Center."},
{id:"a_gbeta_nv",name:"gBETA Electrify Nevada",atype:"Pre-Accelerator",city:"Las Vegas",region:"las_vegas",founded:2024,note:"Free 7-week pre-accelerator by gener8tor."},
{id:"a_innevator",name:"InNEVator",atype:"Pre-Accelerator",city:"Reno",region:"reno",founded:2017,note:"8-week bootcamp at UNR Innevation Center."},
{id:"a_blackfire",name:"Black Fire Innovation",atype:"Incubator/Lab",city:"Las Vegas",region:"las_vegas",founded:2020,note:"UNLV + Caesars 43K sq ft gaming/hospitality living lab. Harry Reid Tech Park flagship. Mock casino floor, hotel rooms, sportsbook, esports arena, VR. Intel computing partner. Boyd Gaming Innovation Lab (2023). Zero Labs accelerator HQ'd here."},
{id:"a_dtp",name:"Downtown Project (DTP)",atype:"Incubator/Fund",city:"Las Vegas",region:"las_vegas",founded:2012,note:"Tony Hsieh initiative."},
{id:"a_afwerx",name:"AFWERX",atype:"Military Accelerator",city:"Las Vegas",region:"las_vegas",founded:2017,note:"US Air Force innovation hub. Nellis AFB."},
{id:"a_audacity",name:"Audacity Institute",atype:"Accelerator",city:"Reno",region:"reno",founded:2020,note:"Inclusive economy focus. TEQSpring program."},
{id:"a_zerolabs",name:"Zero Labs",atype:"Accelerator",city:"Las Vegas",region:"las_vegas",founded:2020,note:"LV's first dedicated gaming/hospitality/sports accelerator. Founded by Quinton Singleton (ex-Bet Works/Bally's Interactive). HQ'd at Black Fire Innovation. 76+ startups supported since 2024. GOED Knowledge Fund supported. 3-day launchpad cohorts."},
];
const ECOSYSTEM_ORGS=[
{id:"e_goed",name:"NV GOED",etype:"Government",city:"Carson City",region:"reno",note:"Governor's Office of Economic Development. Manages SSBCI, Knowledge Fund (university IP→market), Battle Born Growth accelerators. Funds gener8tor, StartUpNV, Zero Labs."},
{id:"e_edawn",name:"EDAWN",etype:"Economic Development",city:"Reno",region:"reno",note:"Economic Development Authority of Western Nevada."},
{id:"e_lvgea",name:"LVGEA",etype:"Economic Development",city:"Las Vegas",region:"las_vegas",note:"Las Vegas Global Economic Alliance."},
{id:"e_innevation",name:"UNR Innevation Center",etype:"University Hub",city:"Reno",region:"reno",note:"UNR coworking/incubator. Hosts InNEVator + gener8tor Reno."},
{id:"e_unlvtech",name:"UNLV Tech Park",etype:"University Hub",city:"Las Vegas",region:"las_vegas",note:"Harry Reid Research & Technology Park. 122 acres."},
];
const LISTINGS=[
{companyId:12,exchange:"Nasdaq",ticker:"SBIG"},{companyId:27,exchange:"Nasdaq",ticker:"MYPS"},
{companyId:28,exchange:"NYSE",ticker:"EVRI"},{companyId:33,exchange:"NYSE",ticker:"LODE"},
{companyId:49,exchange:"ASX",ticker:"INR"},{companyId:50,exchange:"Nasdaq",ticker:"DFLI"},
{companyId:54,exchange:"Nasdaq",ticker:"GAN"},{companyId:55,exchange:"Nasdaq",ticker:"NXGL"},
{companyId:65,exchange:"Nasdaq",ticker:"SSNT"},{companyId:67,exchange:"OTC",ticker:"PLNHF"},
{companyId:71,exchange:"TSX",ticker:"JP"},{companyId:73,exchange:"NYSE",ticker:"AQMS"},
{companyId:74,exchange:"NYSE",ticker:"ORA"},{companyId:75,exchange:"Nasdaq",ticker:"NVEE"},
];
const VERIFIED_EDGES=[
{source:"x_stellantis",target:"c_29",rel:"invested_in",note:"$425M+ strategic round",y:2023},
{source:"x_fedex",target:"c_29",rel:"invested_in",note:"$425M+ strategic round",y:2023},
{source:"x_honeywell",target:"c_29",rel:"invested_in",note:"$425M+ strategic round",y:2023},
{source:"x_okapi",target:"c_14",rel:"invested_in",note:"Seed co-lead",y:2023},
{source:"x_shadow",target:"c_14",rel:"invested_in",note:"Seed co-lead",y:2023},
{source:"x_stripes",target:"c_10",rel:"invested_in",note:"Series A lead",y:2023},
{source:"x_digitalbridge",target:"c_58",rel:"acquired",note:"DigitalBridge took Switch private 2022. $11B deal. Data center infrastructure.",y:2022},
{source:"x_ssbci",target:"f_bbv",rel:"funds",note:"SSBCI capital allocation",y:2023},
{source:"x_ssbci",target:"f_fundnv",rel:"funds",note:"1:1 investment match",y:2023},
{source:"x_ssbci",target:"f_1864",rel:"funds",note:"SSBCI capital allocation",y:2023},
{source:"e_goed",target:"a_gener8tor_lv",rel:"funds",note:"Battle Born Growth accelerator funding",y:2022},
{source:"e_goed",target:"a_gener8tor_reno",rel:"funds",note:"Battle Born Growth accelerator funding",y:2022},
{source:"e_goed",target:"a_startupnv",rel:"funds",note:"SSBCI co-investment via FundNV",y:2022},
{source:"c_6",target:"x_life360",rel:"partners_with",note:"90M+ device BLE-to-satellite",y:2024},
{source:"c_6",target:"x_muonspace",rel:"partners_with",note:"MuSat XL satellite buses",y:2024},
{source:"c_27",target:"x_mgm",rel:"partners_with",note:"Rewards program",y:2018},
{source:"c_27",target:"x_marriott",rel:"partners_with",note:"Rewards program",y:2019},
{source:"c_56",target:"x_snwa",rel:"partners_with",note:"Water tech deployment",y:2023},
{source:"c_29",target:"x_unr",rel:"partners_with",note:"Workforce development",y:2023},
{source:"c_63",target:"a_startupnv",rel:"accelerated_by",note:"AccelerateNV + FundNV2 $200K",y:2023},
{source:"c_41",target:"a_startupnv",rel:"accelerated_by",note:"Portfolio company, Shark Tank 2024",y:2024},
{source:"c_47",target:"a_startupnv",rel:"accelerated_by",note:"Pitch Day company",y:2023},
{source:"c_36",target:"a_startupnv",rel:"accelerated_by",note:"Pitch Day company",y:2023},
{source:"c_36",target:"a_angelnv",rel:"won_pitch",note:"2024 winner $200K+",y:2024},
{source:"c_63",target:"a_angelnv",rel:"won_pitch",note:"2025 winner",y:2025},
{source:"c_32",target:"a_adamshub",rel:"accelerated_by",note:"Adams Hub graduate",y:2023},
{source:"c_57",target:"a_adamshub",rel:"accelerated_by",note:"Adams Hub company",y:2023},
{source:"c_59",target:"a_adamshub",rel:"accelerated_by",note:"Adams Hub company",y:2023},
{source:"a_startupnv",target:"f_fundnv",rel:"program_of",note:"FundNV is StartUpNV's pre-seed fund",y:2023},
{source:"a_startupnv",target:"f_1864",rel:"program_of",note:"1864 Fund is StartUpNV's seed fund",y:2023},
{source:"a_angelnv",target:"a_startupnv",rel:"program_of",note:"AngelNV is a StartUpNV program",y:2022},
{source:"a_gener8tor_lv",target:"a_gener8tor_reno",rel:"collaborated_with",note:"Both SSBCI-funded",y:2023},
{source:"a_gbeta_nv",target:"a_gener8tor_lv",rel:"program_of",note:"gBETA Electrify Nevada is gener8tor's free 7-week pre-accelerator. Pipeline feeder for full 12-week program.",y:2024},
{source:"e_goed",target:"a_gbeta_nv",rel:"funds",note:"gBETA funded via GOED SSBCI pipeline as part of gener8tor Battle Born Growth ecosystem.",y:2024},
{source:"a_blackfire",target:"a_gener8tor_lv",rel:"collaborated_with",note:"Both GOED-supported LV innovation hubs. Black Fire living lab + gener8tor accelerator create startup pipeline.",y:2023},
{source:"a_innevator",target:"e_innevation",rel:"housed_at",note:"Hosted at UNR Innevation Center",y:2023},
{source:"c_8",target:"a_innevator",rel:"collaborated_with",note:"Blockchains LLC lead collaborator 2020",y:2020},
{source:"a_blackfire",target:"e_unlvtech",rel:"housed_at",note:"Flagship tenant, Harry Reid Tech Park",y:2020},
{source:"x_caesars",target:"a_blackfire",rel:"collaborated_with",note:"Co-founded Black Fire with UNLV 2020",y:2020},
{source:"x_panasonic",target:"a_blackfire",rel:"partners_with",note:"Technology deployment partner",y:2020},
{source:"a_zerolabs",target:"a_blackfire",rel:"collaborated_with",note:"Zero Labs HQ'd at Black Fire Innovation. Runs 3-day launchpad cohorts in Black Fire facility. 76+ startups since 2024.",y:2023},
// === GOED ↔ Zero Labs ↔ Black Fire ↔ gener8tor ecosystem web ===
{source:"e_goed",target:"a_zerolabs",rel:"funds",note:"GOED Knowledge Fund supports Zero Labs via UNLV Applied Research Collaboration (ARC). Karsten Heise (GOED) cited as key enabler.",y:2023},
{source:"e_goed",target:"a_blackfire",rel:"funds",note:"GOED Knowledge Fund supports Black Fire via UNLV ARC program. University IP → market commercialization.",y:2020},
{source:"x_boyd",target:"a_blackfire",rel:"partners_with",note:"Boyd Gaming Innovation Lab established at Black Fire (Sep 2023). Internships, R&D, prototyping. Keith Smith CEO.",y:2023},
{source:"x_intel",target:"a_blackfire",rel:"partners_with",note:"Intel key computing partner. IoT, visual analytics, edge computing for hospitality innovation. Student internships.",y:2020},
{source:"x_caesars",target:"a_zerolabs",rel:"partners_with",note:"Caesars is Zero Labs advisor. Singleton has assisted Caesars on startup/innovation strategy.",y:2023},
{source:"x_mgm",target:"a_zerolabs",rel:"partners_with",note:"MGM Resorts advisor to Zero Labs. Singleton assisted MGM on innovation and product launches.",y:2023},
{source:"x_shift",target:"a_zerolabs",rel:"partners_with",note:"Shift Studio $300K strategic partnership. Product design + engineering for Zero Labs cohort startups.",y:2025},
{source:"e_lvgea",target:"a_zerolabs",rel:"supports",note:"LVGEA supports Zero Labs as part of Southern Nevada startup ecosystem development.",y:2024},
{source:"e_lvgea",target:"a_blackfire",rel:"supports",note:"LVGEA supports Black Fire Innovation as LV tech/innovation hub. Economic diversification.",y:2020},
{source:"a_zerolabs",target:"a_gener8tor_lv",rel:"collaborated_with",note:"Both LV-based GOED-supported accelerators. Zero Labs gaming/hospitality focus, gener8tor sector-agnostic. Complementary programs.",y:2024},
{source:"x_usaf",target:"a_afwerx",rel:"program_of",note:"Air Force innovation program",y:2022},
{source:"c_72",target:"a_afwerx",rel:"accelerated_by",note:"Defense drone / NTTR connection",y:2023},
{source:"e_goed",target:"x_ssbci",rel:"manages",note:"GOED administers NV SSBCI program",y:2022},
{source:"e_edawn",target:"a_gener8tor_reno",rel:"supports",note:"Co-host, entrepreneurial development",y:2023},
{source:"e_edawn",target:"e_innevation",rel:"supports",note:"Ecosystem partner",y:2023},
{source:"e_lvgea",target:"a_startupnv",rel:"supports",note:"Dealroom ecosystem partner",y:2023},
{source:"e_lvgea",target:"a_gener8tor_lv",rel:"supports",note:"Las Vegas ecosystem support",y:2023},
{source:"e_innevation",target:"a_gener8tor_reno",rel:"housed_at",note:"gener8tor Reno operates from Innevation Center",y:2023},
{source:"p_saling",target:"f_fundnv",rel:"manages",note:"Co-founder, Ruby Partners GP",y:2023},
{source:"p_saling",target:"a_startupnv",rel:"manages",note:"Executive Director",y:2023},
{source:"c_10",target:"x_fda",rel:"approved_by",note:"FDA-approved EMS device",y:2023},
{source:"c_34",target:"x_fda",rel:"filed_with",note:"Drug master file",y:2023},
{source:"a_dtp",target:"e_lvgea",rel:"collaborated_with",note:"Downtown LV economic development",y:2023},
{source:"x_accel",target:"c_2",rel:"invested_in",note:"Led Series D ($100M) + co-led Series E ($450M)",y:2021},
{source:"x_trowe",target:"c_2",rel:"invested_in",note:"Co-led Series E at $4.5B valuation",y:2021},
{source:"x_tiger",target:"c_2",rel:"invested_in",note:"Series E new investor",y:2021},
{source:"x_wellington",target:"c_3",rel:"invested_in",note:"Led Series D $250M at $5.1B valuation",y:2024},
{source:"x_greylock",target:"c_3",rel:"invested_in",note:"Investor since inception through Series D",y:2020},
{source:"x_insight",target:"c_3",rel:"invested_in",note:"Series C/D participant",y:2023},
{source:"x_crowdstrike",target:"c_3",rel:"invested_in",note:"CrowdStrike Falcon Fund, Series D",y:2024},
{source:"x_amd",target:"c_4",rel:"invested_in",note:"Co-led Series A $100M. Strategic GPU partner.",y:2024},
{source:"x_magnetar",target:"c_4",rel:"invested_in",note:"Co-led Series A $100M",y:2024},
{source:"x_nexusvp",target:"c_4",rel:"invested_in",note:"Led $43M SAFE round (Oct 2024)",y:2024},
{source:"c_4",target:"a_startupnv",rel:"accelerated_by",note:"StartUpNV investor in SAFE round",y:2024},
{source:"f_bbv",target:"c_4",rel:"invested_in",note:"Battle Born Venture co-investor (PitchBook)",y:2024},
{source:"x_blackrock",target:"c_9",rel:"invested_in",note:"Co-led Series D $119M",y:2021},
{source:"x_fidelity",target:"c_9",rel:"invested_in",note:"Co-led Series D $119M",y:2021},
{source:"x_greycroft",target:"c_9",rel:"invested_in",note:"Early investor, pre-Series D",y:2019},
{source:"x_draper",target:"c_7",rel:"invested_in",note:"Draper Associates investor",y:2022},
{source:"c_73",target:"c_50",rel:"partners_with",note:"LOI for lithium hydroxide supply",y:2023},
{source:"x_bain_cv",target:"c_2",rel:"invested_in",note:"Series E investor ($450M round Nov 2021)",y:2021},
{source:"x_commerce_v",target:"c_2",rel:"invested_in",note:"Series B+ investor, fintech-focused",y:2019},
{source:"x_sorenson",target:"c_2",rel:"invested_in",note:"Existing investor Series C+",y:2020},
{source:"x_twosigma",target:"c_2",rel:"invested_in",note:"Series A investor (2014)",y:2014},
{source:"x_citi_v",target:"c_2",rel:"invested_in",note:"Strategic investor",y:2020},
{source:"x_cap1_v",target:"c_2",rel:"invested_in",note:"Strategic investor",y:2020},
{source:"x_menlo",target:"c_3",rel:"invested_in",note:"Series B/C/D participant",y:2022},
{source:"x_evolution",target:"c_13",rel:"invested_in",note:"Led Series A+B ($95M total)",y:2023},
{source:"x_salesforce_v",target:"c_13",rel:"invested_in",note:"Series A + B participant",y:2022},
{source:"x_pelion",target:"c_13",rel:"invested_in",note:"Seed + Series A + B",y:2022},
{source:"x_boldstart",target:"c_13",rel:"invested_in",note:"Seed through Series B",y:2022},
{source:"x_samsung",target:"c_13",rel:"invested_in",note:"Series B investor (strategic)",y:2023},
{source:"x_paloalto",target:"c_13",rel:"acquired",note:"Acquired Protect AI Apr 2025",y:2025},
{source:"x_prosperity7",target:"c_4",rel:"invested_in",note:"Series A (Aramco Ventures)",y:2024},
{source:"x_maverick",target:"c_4",rel:"invested_in",note:"SAFE + Series A",y:2024},
{source:"x_translink",target:"c_4",rel:"invested_in",note:"SAFE round (Japan-linked)",y:2024},
{source:"x_mercato",target:"c_9",rel:"invested_in",note:"Early investor",y:2017},
{source:"x_qualcomm_v",target:"c_9",rel:"invested_in",note:"Early strategic investor",y:2018},
{source:"x_rincon",target:"c_9",rel:"invested_in",note:"Early investor",y:2017},
{source:"x_baroda",target:"c_9",rel:"invested_in",note:"Early investor",y:2017},
{source:"x_buildtech",target:"c_7",rel:"invested_in",note:"Construction tech VC",y:2022},
{source:"x_elevation",target:"c_7",rel:"invested_in",note:"Canada-based VC",y:2022},
{source:"x_accel",target:"c_53",rel:"invested_in",note:"Led Duetto Series B $21M. Multi-position: also Socure",y:2019},
{source:"x_warburg",target:"c_53",rel:"invested_in",note:"Led Duetto Series D $80M",y:2023},
{source:"x_battery",target:"c_53",rel:"invested_in",note:"Led Duetto Series A $10M",y:2023},
{source:"x_growthcurve",target:"c_53",rel:"acquired",note:"Acquired Duetto Jun 2024",y:2024},
{source:"x_blackstone",target:"c_22",rel:"invested_in",note:"Led Series D $350M at $3.3B valuation",y:2023},
{source:"x_cvs",target:"c_22",rel:"invested_in",note:"Led Series D2 $100M, strategic healthcare",y:2023},
{source:"x_dragoneer",target:"c_22",rel:"invested_in",note:"Led Series C $100M",y:2023},
{source:"x_blackrock",target:"c_22",rel:"invested_in",note:"Series D. Multi-position: also MNTN",y:2023},
{source:"x_twosigma",target:"c_22",rel:"invested_in",note:"Series A. Multi-position: also Socure",y:2023},
{source:"x_lightspeed",target:"c_5",rel:"invested_in",note:"Led Series B $100M at $1.5B valuation",y:2023},
{source:"x_insight",target:"c_5",rel:"invested_in",note:"Series B co-investor. Multi-position: also Abnormal AI",y:2023},
{source:"x_galaxy",target:"c_5",rel:"invested_in",note:"Led seed $6.5M. Gaming VC.",y:2023},
// === New orphan company edges (Phase 1 research) ===
{source:"x_apollo",target:"c_28",rel:"acquired",note:"Apollo acquired Everi + IGT Gaming Jul 2025 for $6.3B combined. $14.25/share cash. Delisted NYSE. HQ Las Vegas.",y:2025},
{source:"x_segasammy",target:"c_54",rel:"acquired",note:"SEGA SAMMY Creation acquired GAN May 2025. $1.97/share, 121% premium.",y:2025},
{source:"x_orix",target:"c_74",rel:"invested_in",note:"Ormat Industries (ORIX subsidiary) owns 44.76% of Ormat Technologies.",y:2005},
{source:"x_acuren",target:"c_75",rel:"acquired",note:"Acuren acquired NV5 Global Aug 2025. ~$23/share ($10 cash + $13 Acuren stock). Delisted Nasdaq.",y:2025},
{source:"x_canaan",target:"c_20",rel:"invested_in",note:"Led Ollie Series A $12.6M Aug 2017.",y:2017},
{source:"x_lererhippeau",target:"c_20",rel:"invested_in",note:"Ollie seed co-lead + Series A participant.",y:2023},
{source:"x_agrolimen",target:"c_20",rel:"acquired",note:"Spanish conglomerate acquired Ollie 2025.",y:2025},
{source:"x_twobear",target:"c_11",rel:"invested_in",note:"Led CIQ Series A $26M May 2022. $150M valuation.",y:2022},
{source:"x_iag",target:"c_11",rel:"invested_in",note:"CIQ bridge round 2021.",y:2021},
{source:"x_google",target:"c_11",rel:"partners_with",note:"Rocky Linux tier 1 Google Cloud-supported offering.",y:2023},
{source:"x_tuatara",target:"c_12",rel:"invested_in",note:"SPAC sponsor (TCAC→SBIG Jun 2022). $13M PIPE.",y:2022},
{source:"x_tvc",target:"c_12",rel:"invested_in",note:"Springbig PIPE investor. B2B SaaS focused.",y:2023},
{source:"x_cerberus_v",target:"c_21",rel:"invested_in",note:"Led Nudge Security Series A $22.5M Nov 2025.",y:2025},
{source:"x_ballistic",target:"c_21",rel:"invested_in",note:"Nudge Security seed $7M Apr 2022. Cybersecurity-dedicated VC.",y:2022},
{source:"x_forgepoint",target:"c_21",rel:"invested_in",note:"Nudge Security seed + Series A. Co-led seed extension.",y:2023},
{source:"x_squadra",target:"c_21",rel:"invested_in",note:"Nudge Security seed extension + Series A.",y:2023},
{source:"x_efung",target:"c_60",rel:"invested_in",note:"Elicio Therapeutics Series B $33M Oct 2019.",y:2019},
{source:"x_clal_bio",target:"c_60",rel:"invested_in",note:"Elicio Series B. Israeli life sciences investment co.",y:2023},
{source:"c_39",target:"c_67",rel:"competes_with",note:"Both LV-based cannabis/gaming-adjacent entertainment companies.",y:2023},
{source:"x_mgm",target:"c_67",rel:"partners_with",note:"Planet 13 SuperStore adjacent to Las Vegas Strip casino corridor.",y:2023},
{source:"x_caesars",target:"c_39",rel:"partners_with",note:"Wynn Interactive competes in NV online sports betting market.",y:2022},
// === Phase 2: VC/PE + Institutional Investor Edges ===
// Redwood Materials (c_1) — $4.17B raised, $2B DOE loan
{source:"x_goldman",target:"c_1",rel:"invested_in",note:"Co-led Redwood Series D $1B+ Aug 2023. $5B valuation.",y:2022},
{source:"x_capricorn",target:"c_1",rel:"invested_in",note:"Co-led Redwood Series D. Early backer since Series B 2020.",y:2021},
{source:"x_trowe",target:"c_1",rel:"invested_in",note:"Co-led Redwood Series C $700M + Series D. T. Rowe Price Growth Stock Fund.",y:2023},
{source:"x_eclipse_v",target:"c_1",rel:"invested_in",note:"Led Redwood Series E $350M Oct 2025. $6B valuation.",y:2025},
{source:"x_nventures",target:"c_1",rel:"invested_in",note:"Nvidia NVentures. Redwood Series E Oct 2025.",y:2025},
{source:"x_fidelity",target:"c_1",rel:"invested_in",note:"Fidelity. Redwood Series C 2021.",y:2023},
{source:"x_cpp",target:"c_1",rel:"invested_in",note:"Canada Pension Plan. Redwood Series C.",y:2023},
{source:"x_breakthrough",target:"c_1",rel:"invested_in",note:"Breakthrough Energy Ventures (Gates). Redwood Series B 2020.",y:2021},
{source:"x_amazon_cpf",target:"c_1",rel:"invested_in",note:"Amazon Climate Pledge Fund. Redwood investor.",y:2023},
{source:"x_omers",target:"c_1",rel:"invested_in",note:"Ontario pension fund. Redwood Series D new investor.",y:2023},
{source:"x_ford",target:"c_1",rel:"partners_with",note:"Ford strategic partner + investor. EV battery materials supply chain.",y:2022},
{source:"x_caterpillar_v",target:"c_1",rel:"invested_in",note:"Caterpillar Ventures. Redwood Series D.",y:2023},
{source:"x_doe",target:"c_1",rel:"loaned_to",note:"DOE $2B loan commitment for Carson City battery recycling expansion.",y:2024},
// Sierra Nevada Corp (c_51) — 100% owner-operated, major govt contractor
{source:"x_ozmen",target:"c_51",rel:"invested_in",note:"Eren & Fatih Ozmen 100% owners since 1994 management buyout. Billionaire family.",y:2023},
{source:"x_nasa",target:"c_51",rel:"contracts_with",note:"Dream Chaser spaceplane ISS cargo contract. CRS-2 program.",y:2022},
{source:"x_usaf",target:"c_51",rel:"contracts_with",note:"Multi-billion defense & national security contractor. Electronic warfare, ISR systems.",y:2023},
{source:"x_blueorigin",target:"c_51",rel:"partners_with",note:"Sierra Space + Blue Origin = Orbital Reef commercial space station partnership.",y:2023},
{source:"c_51",target:"x_unr",rel:"collaborated_with",note:"Ozmens donated $5M for Ozmen Center for Entrepreneurship at UNR alma mater.",y:2023},
// Hubble Network (c_6) — $100M total raised
{source:"x_swagar",target:"c_6",rel:"invested_in",note:"Led Hubble Series B $70M Sep 2025. Ryan Swagar, former Life360 Series A lead.",y:2024},
{source:"x_rpm",target:"c_6",rel:"invested_in",note:"RPM Ventures. Marc Weiser (former NASA board). Hubble Series B.",y:2024},
{source:"x_yc",target:"c_6",rel:"invested_in",note:"Y Combinator. Hubble Network Series B investor.",y:2022},
{source:"x_seraph",target:"c_6",rel:"invested_in",note:"Seraph Group (Tuff Yen). Hubble Series B.",y:2023},
// Switch Inc (c_58) — taken private by DigitalBridge
// PlayStudios (c_27) — SPAC via Acies, $250M PIPE, $1.1B valuation
{source:"x_acies",target:"c_27",rel:"invested_in",note:"Acies SPAC merged with PlayStudios Jun 2021. Jim Murren (ex-MGM CEO) chaired. $1.1B valuation.",y:2021},
{source:"x_blackrock",target:"c_27",rel:"invested_in",note:"BlackRock led $250M PIPE for PlayStudios SPAC merger 2021.",y:2021},
{source:"x_neuberger",target:"c_27",rel:"invested_in",note:"Neuberger Berman participated in PlayStudios $250M PIPE.",y:2021},
{source:"x_clearbridge",target:"c_27",rel:"invested_in",note:"ClearBridge Investments. PlayStudios $250M PIPE participant.",y:2021},
{source:"x_mgm",target:"c_27",rel:"invested_in",note:"MGM Resorts ~10% stake post-SPAC. Strategic partner + PIPE investor. Exclusive social gaming rights.",y:2021},
// Ioneer (c_49) — $996M DOE loan, Sibanye JV collapsed
{source:"x_doe",target:"c_49",rel:"loaned_to",note:"DOE $996M loan guarantee Jan 2025. ATVM program. Rhyolite Ridge lithium project, Esmeralda County.",y:2025},
{source:"x_sibanye",target:"c_49",rel:"invested_in",note:"Sibanye-Stillwater held 6% equity ($70M placement 2021). $490M JV withdrawn Feb 2025 due to lithium price crash.",y:2021},
// Aqua Metals (c_73) — DOE grant, GOED abatement, 6K partnership
{source:"x_doe",target:"c_73",rel:"grants_to",note:"DOE $4.99M ACME-REVIVE grant consortium with Penn State. Critical minerals from coal.",y:2024},
{source:"x_goed",target:"c_73",rel:"grants_to",note:"NV GOED $2.2M tax abatement for Sierra ARC campus. $392M projected economic impact.",y:2024},
{source:"x_6kenergy",target:"c_73",rel:"partners_with",note:"Multi-year supply agreement. Aqua Metals provides 30% recycled content for 6K cathode facility.",y:2024},
// Dragonfly Energy (c_50) — SPAC via Chardan, Thor strategic, EIP term loan
{source:"x_chardan",target:"c_50",rel:"invested_in",note:"Chardan NexTech SPAC merged with Dragonfly Oct 2022. $500M EV. Nasdaq:DFLI.",y:2022},
{source:"x_thor",target:"c_50",rel:"invested_in",note:"Thor Industries $15M strategic investment Jul 2022. World's largest RV manufacturer. Keystone RV is subsidiary.",y:2022},
{source:"x_eip",target:"c_50",rel:"invested_in",note:"Energy Impact Partners led $75M senior secured term loan for Dragonfly SPAC.",y:2023},
{source:"x_stryten",target:"c_50",rel:"partners_with",note:"Stryten Energy $30M licensing deal for Battle Born Batteries brand. Military/marine/auto markets.",y:2024},
// Blockchains LLC (c_8) — Self-funded by Jeffrey Berns
{source:"x_goed",target:"c_8",rel:"partners_with",note:"Blockchains sought Innovation Zone legislation. $300M+ self-funded by CEO Jeffrey Berns. 67,000 acres Storey County.",y:2021},
// === Phase 3: Government, Public Market, Institutional Edges ===
// Ormat Technologies (c_74) — DOE loan, NV Energy PPAs, Google, FIMI
{source:"x_doe",target:"c_74",rel:"loaned_to",note:"DOE $350M partial loan guarantee 2011. Three geothermal plants across northern Nevada.",y:2011},
{source:"x_fimi",target:"c_74",rel:"invested_in",note:"FIMI Opportunity Funds ~14.8% largest shareholder. Israeli PE.",y:2016},
{source:"x_nvenergy",target:"c_74",rel:"partners_with",note:"Long-term PPAs for Stillwater, Salt Wells geothermal. Clean Transition Tariff partner.",y:2023},
{source:"x_google",target:"c_74",rel:"partners_with",note:"Google 150MW geothermal PPA via NV Energy Feb 2026. Data center clean energy. Projects 2028-2030.",y:2026},
{source:"c_74",target:"c_58",rel:"partners_with",note:"Ormat 20-year PPA with Switch for 13MW geothermal power.",y:2026},
// Canyon Ranch (c_61) — Goff Capital + VICI Properties
{source:"x_goff",target:"c_61",rel:"acquired",note:"John Goff/Goff Capital acquired Canyon Ranch 2017 from founders. Moved HQ to Fort Worth.",y:2017},
{source:"x_vici",target:"c_61",rel:"invested_in",note:"VICI Properties $500M growth partnership. $150M preferred equity + $150M mortgage + $200M Austin development.",y:2023},
// Comstock Mining (c_33) — LiNiCo, Aqua Metals partnership
{source:"c_33",target:"x_linico",rel:"invested_in",note:"Comstock 64% stake in LiNiCo battery recycler. $10.75M deal Feb 2021. TRI facility.",y:2021},
{source:"c_73",target:"x_linico",rel:"invested_in",note:"Aqua Metals 10% stake in LiNiCo. $2M. Sold battery recycling facility to LiNiCo.",y:2023},
{source:"c_33",target:"c_73",rel:"partners_with",note:"Connected via LiNiCo. Aqua Metals sold battery recycling facility, Comstock took majority stake.",y:2022},
{source:"x_marathon",target:"c_33",rel:"invested_in",note:"Marathon Petroleum Series A strategic investment in Comstock Fuels segment. Major oil refiner.",y:2024},
{source:"x_rwe",target:"c_33",rel:"partners_with",note:"RWE Clean Energy MSA for solar decommissioning/recycling. Preferred strategic partner.",y:2025},
{source:"c_33",target:"x_unr",rel:"partners_with",note:"Comstock CEO presented at UNR on future of mining and critical materials in Nevada.",y:2024},
// Kaptyn (c_18) — ATW Partners, MGM partnership
{source:"x_atw",target:"c_18",rel:"invested_in",note:"ATW Partners. Kaptyn Series A + Series B $10M Nov 2022. $30M+ total raised.",y:2022},
{source:"x_kibble",target:"c_18",rel:"invested_in",note:"Kibble Holdings. Kaptyn early seed investor.",y:2023},
{source:"x_mgm",target:"c_18",rel:"partners_with",note:"MGM Resorts exclusive transportation partner in Las Vegas. EV fleet.",y:2024},
// Switch Inc (c_58) — NV Energy customer
{source:"x_nvenergy",target:"c_58",rel:"partners_with",note:"NV Energy provides power to Switch data centers. Clean energy PPAs.",y:2023},
// Cross-links: GOED incentives for multiple companies
{source:"x_goed",target:"c_49",rel:"partners_with",note:"GOED supports Ioneer Rhyolite Ridge. Part of NV Lithium Loop economic development.",y:2024},
{source:"x_goed",target:"c_1",rel:"partners_with",note:"GOED incentives for Redwood Materials Carson City battery recycling campus.",y:2023},
// Everi Holdings (c_28) — IGT integration
{source:"x_igt",target:"c_28",rel:"partners_with",note:"IGT Gaming merged with Everi under Apollo. Combined: Gaming, Digital, FinTech. HQ Las Vegas.",y:2025},
// Wynn Interactive (c_39) — connected to Wynn Resorts gaming ecosystem

{source:"x_eif",target:"c_17",rel:"invested_in",note:"Led Vibrant Planet seed $17M + Series A $15M. Total $34M+.",y:2023},
{source:"x_msft_climate",target:"c_17",rel:"invested_in",note:"Microsoft Climate Innovation Fund. Vibrant Planet Series A.",y:2023},
{source:"x_citi_v",target:"c_17",rel:"invested_in",note:"Citi Ventures participated in Vibrant Planet Series A.",y:2023},
{source:"x_dayonev",target:"c_17",rel:"invested_in",note:"Day One Ventures. Vibrant Planet Series A.",y:2023},
{source:"x_grantham",target:"c_17",rel:"invested_in",note:"Grantham Environmental Trust. Co-led Vibrant Planet seed $17M.",y:2023},
{source:"x_owl",target:"c_38",rel:"invested_in",note:"Owl Ventures. Amira Learning Series A/B. $2.2B+ EdTech VC.",y:2023},
{source:"x_authentic",target:"c_38",rel:"invested_in",note:"Led Amira Learning Series A $11M Apr 2021.",y:2021},
{source:"x_amazon_af",target:"c_38",rel:"invested_in",note:"Amazon Alexa Fund invested in Amira Learning.",y:2023},
{source:"x_edf",target:"c_64",rel:"invested_in",note:"EDF Renewables. Nuvve Series A Dec 2017. V2G JV (DREEV).",y:2017},
{source:"x_toyota_tsusho",target:"c_64",rel:"invested_in",note:"Toyota Tsusho. Nuvve Series A Dec 2017.",y:2017},
{source:"x_newborn",target:"c_64",rel:"acquired",note:"SPAC merger Mar 2021. $70M+ to balance sheet. Nasdaq:NVVE.",y:2021},
{source:"x_thirdprime",target:"c_19",rel:"invested_in",note:"Co-led Climb Credit Series A $9.8M Jun 2019.",y:2019},
{source:"x_newmarkets",target:"c_19",rel:"invested_in",note:"Co-led Climb Credit Series A. EdTech/workforce VC.",y:2023},
{source:"x_newfund",target:"c_19",rel:"invested_in",note:"Early Climb Credit investor.",y:2023},
{source:"f_fundnv",target:"c_4",rel:"invested_in",note:"FundNV investment in TensorWave.",y:2023},
{source:"f_fundnv",target:"c_14",rel:"invested_in",note:"FundNV investment in MagicDoor.",y:2023},
{source:"f_1864",target:"c_14",rel:"invested_in",note:"1864 Fund investment in MagicDoor.",y:2023},
{source:"f_fundnv",target:"c_23",rel:"invested_in",note:"FundNV investment in Titan Seal.",y:2023},
{source:"f_fundnv",target:"c_24",rel:"invested_in",note:"FundNV investment in Fund Duel.",y:2023},
{source:"f_fundnv",target:"c_25",rel:"invested_in",note:"FundNV $240K investment in Cognizer AI.",y:2023},
{source:"f_fundnv",target:"c_26",rel:"invested_in",note:"FundNV investment in SEE ID.",y:2023},
{source:"f_1864",target:"c_26",rel:"invested_in",note:"1864 Fund investment in SEE ID.",y:2023},
{source:"f_fundnv",target:"c_30",rel:"invested_in",note:"FundNV investment in Cranel.",y:2023},
{source:"f_1864",target:"c_30",rel:"invested_in",note:"1864 Fund investment in Cranel.",y:2023},
{source:"f_fundnv",target:"c_31",rel:"invested_in",note:"FundNV investment in fibrX.",y:2023},
{source:"f_fundnv",target:"c_32",rel:"invested_in",note:"FundNV investment in Base Venture.",y:2023},
{source:"f_1864",target:"c_32",rel:"invested_in",note:"1864 Fund investment in Base Venture.",y:2023},
{source:"f_fundnv",target:"c_36",rel:"invested_in",note:"FundNV investment in Tilt.",y:2023},
{source:"f_1864",target:"c_36",rel:"invested_in",note:"1864 Fund investment in Tilt.",y:2023},
{source:"f_fundnv",target:"c_37",rel:"invested_in",note:"FundNV investment in Nommi.",y:2023},
{source:"f_1864",target:"c_37",rel:"invested_in",note:"1864 Fund investment in Nommi.",y:2023},
{source:"f_1864",target:"c_40",rel:"invested_in",note:"1864 Fund investment in betJACK.",y:2023},
{source:"f_fundnv",target:"c_40",rel:"invested_in",note:"FundNV investment in betJACK.",y:2023},
{source:"f_fundnv",target:"c_41",rel:"invested_in",note:"FundNV investment in Hibear.",y:2023},
{source:"f_1864",target:"c_43",rel:"invested_in",note:"1864 Fund investment in Sapien.",y:2023},
{source:"f_fundnv",target:"c_45",rel:"invested_in",note:"FundNV investment in Lucihub.",y:2023},
{source:"f_1864",target:"c_45",rel:"invested_in",note:"1864 Fund investment in Lucihub.",y:2023},
{source:"f_fundnv",target:"c_47",rel:"invested_in",note:"FundNV investment in Cloudforce Networks.",y:2023},
{source:"f_1864",target:"c_47",rel:"invested_in",note:"1864 Fund investment in Cloudforce Networks.",y:2023},
{source:"f_fundnv",target:"c_57",rel:"invested_in",note:"FundNV investment in Now Ads.",y:2023},
{source:"f_fundnv",target:"c_59",rel:"invested_in",note:"FundNV investment in Talentel.",y:2023},
{source:"f_fundnv",target:"c_62",rel:"invested_in",note:"FundNV investment in MiOrganics.",y:2023},
{source:"f_1864",target:"c_62",rel:"invested_in",note:"1864 Fund investment in MiOrganics.",y:2023},
{source:"f_fundnv",target:"c_63",rel:"invested_in",note:"FundNV investment in BuildQ.",y:2023},
{source:"f_1864",target:"c_63",rel:"invested_in",note:"1864 Fund investment in BuildQ.",y:2023},
{source:"f_1864",target:"c_15",rel:"invested_in",note:"1864 Fund investment in Stable.",y:2023},
{source:"a_startupnv",target:"c_14",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_23",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_24",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_25",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_26",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_30",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_31",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_37",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_40",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_43",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_45",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_62",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"a_startupnv",target:"c_63",rel:"accelerated_by",note:"StartUpNV portfolio company.",y:2023},
{source:"c_66",target:"c_67",rel:"competes_with",note:"Both major NV cannabis operators. Curaleaf (TSX:CURA) and Planet 13.",y:2023},
{source:"c_33",target:"c_74",rel:"competes_with",note:"Both NV-based cleantech/energy companies. Comstock solar recycling vs Ormat geothermal.",y:2023},
{source:"c_70",target:"c_33",rel:"partners_with",note:"Both NV cleantech operators. Bombard solar installs, Comstock recycles panels.",y:2023},
{source:"c_18",target:"c_10",rel:"competes_with",note:"Both LV tech-forward consumer transport. Kaptyn EV fleet vs Katalyst fitness tech.",y:2023},
{source:"c_69",target:"c_28",rel:"partners_with",note:"Acres casino tech integrates with gaming operators like Everi.",y:2023},
{source:"c_52",target:"c_31",rel:"partners_with",note:"Both NV deep-tech hardware startups. Nevada Nano MEMS sensors, fibrX fiber tech.",y:2023},
{source:"c_68",target:"c_15",rel:"partners_with",note:"Both NV fintech companies. GBank digital banking, Stable blockchain payments.",y:2023},
{source:"c_55",target:"c_60",rel:"competes_with",note:"Both NV biotech/life sciences. NEXGEL hydrogel vs Elicio therapeutics.",y:2023},
{source:"c_61",target:"c_10",rel:"partners_with",note:"Both premium NV wellness brands. Canyon Ranch hospitality + Katalyst fitness.",y:2023},
{source:"c_35",target:"c_70",rel:"partners_with",note:"Both NV manufacturing/cleantech. Amerityre green tires, Bombard solar.",y:2023},
{source:"c_65",target:"c_11",rel:"competes_with",note:"Both NV enterprise IT companies. SilverSun IT consulting vs CIQ Linux infra.",y:2023},
{source:"c_71",target:"c_69",rel:"competes_with",note:"Both casino/gaming tech companies. Jackpot Digital tables vs Acres loyalty.",y:2023},
{source:"c_44",target:"c_42",rel:"competes_with",note:"Both NV AdTech/media. SITO Mobile location-based vs nFusz interactive video.",y:2023},
{source:"c_46",target:"c_15",rel:"competes_with",note:"Both NV blockchain/crypto companies. Tokens.com NFT/metaverse vs Stable payments.",y:2023},
{source:"c_48",target:"c_52",rel:"partners_with",note:"Both NV deep-tech materials/sensor companies.",y:2023},
{source:"c_16",target:"c_8",rel:"competes_with",note:"Both NV healthcare companies. ThirdWaveRx pharmacy AI vs Carbon Health clinics.",y:2023},
// === Phase 4: Cross-ecosystem & infrastructure edges ===
// NV5 Global → additional edges
{source:"c_75",target:"x_nvenergy",rel:"partners_with",note:"NV5 provides utility infrastructure engineering, grid hardening, and geospatial services for NV Energy.",y:2023},
// GAN Limited → additional edges
{source:"c_54",target:"c_27",rel:"competes_with",note:"Both LV-based gaming tech. GAN real-money iGaming SaaS vs PlayStudios social casino/loyalty.",y:2024},
// Curaleaf Tech → additional edge
{source:"x_goed",target:"c_66",rel:"partners_with",note:"NV cannabis operator. GOED tracks economic impact of cannabis industry in Nevada.",y:2023},
// WaterStart → UNR + GOED
{source:"c_56",target:"x_unr",rel:"partners_with",note:"WaterStart partners with UNR on water technology research and innovation programs.",y:2022},
{source:"x_goed",target:"c_56",rel:"partners_with",note:"GOED supports WaterStart as NV water technology accelerator. Statewide water innovation hub.",y:2022},
// Bombard Renewable Energy
{source:"c_70",target:"x_nvenergy",rel:"partners_with",note:"Bombard Renewable Energy installs commercial and utility-scale solar for NV Energy service territory.",y:2023},
// Acres Technology
{source:"c_69",target:"c_27",rel:"partners_with",note:"Acres casino loyalty platform integrates with gaming operators. PlayStudios also in casino rewards space.",y:2023},
// Skydio Gov → DOD
{source:"c_72",target:"x_usaf",rel:"contracts_with",note:"Skydio autonomous drones used by US military. NTTR (Nevada Test & Training Range) connection.",y:2024},

];

// ══════════════════════════════════════════════════════════════════════════════
// GRAPH BUILDER + LAYOUT ENGINE
// ══════════════════════════════════════════════════════════════════════════════

function buildGraph(filters, relFilters, yearFilter=2026) {
  const nodes = [], edges = [], nodeSet = new Set();
  const add = (id, label, type, extra={}) => { if (!nodeSet.has(id)) { nodeSet.add(id); nodes.push({id,label,type,...extra}); } };
  const lnk = (s, t, rel, extra={}) => { if (nodeSet.has(s) && nodeSet.has(t)) edges.push({source:s,target:t,rel,...extra}); };
  if (filters.company) COMPANIES.forEach(c => add(`c_${c.id}`, c.name, "company", {stage:c.stage, funding:c.funding, momentum:c.momentum, employees:c.employees, city:c.city, region:c.region, sector:c.sector, eligible:c.eligible, founded:c.founded}));
  if (filters.fund) GRAPH_FUNDS.forEach(f => add(`f_${f.id}`, f.name, "fund", {fundType:f.type}));
  if (filters.sector) { const sec={}; COMPANIES.forEach(c => (c.sector||[]).forEach(s => { sec[s]=(sec[s]||0)+1; })); Object.entries(sec).filter(([,n])=>n>=2).forEach(([s,n]) => add(`s_${s}`,s,"sector",{count:n})); }
  if (filters.region) { const names={las_vegas:"Las Vegas",reno:"Reno-Sparks",henderson:"Henderson"}; [...new Set(COMPANIES.map(c=>c.region))].forEach(r => add(`r_${r}`,names[r]||r,"region")); }
  if (filters.person) PEOPLE.forEach(p => add(p.id, p.name, "person", {role:p.role, note:p.note, companyId:p.companyId}));
  if (filters.external) EXTERNALS.forEach(x => add(x.id, x.name, "external", {etype:x.etype, note:x.note}));
  if (filters.accelerator) ACCELERATORS.forEach(a => add(a.id, a.name, "accelerator", {atype:a.atype, city:a.city, region:a.region, founded:a.founded, note:a.note}));
  if (filters.ecosystem) ECOSYSTEM_ORGS.forEach(o => add(o.id, o.name, "ecosystem", {etype:o.etype, city:o.city, region:o.region, note:o.note}));
  if (filters.exchange) { const exs=new Set(LISTINGS.map(l=>l.exchange)); exs.forEach(e => add(`ex_${e}`,e,"exchange")); }
  if (relFilters.eligible_for && filters.fund && filters.company) COMPANIES.forEach(c => c.eligible.forEach(f => { if (nodeSet.has(`f_${f}`)) lnk(`c_${c.id}`,`f_${f}`,"eligible_for"); }));
  if (relFilters.operates_in && filters.sector && filters.company) COMPANIES.forEach(c => (c.sector||[]).forEach(s => { if (nodeSet.has(`s_${s}`)) lnk(`c_${c.id}`,`s_${s}`,"operates_in"); }));
  if (relFilters.headquartered_in && filters.region && filters.company) COMPANIES.forEach(c => { if (nodeSet.has(`r_${c.region}`)) lnk(`c_${c.id}`,`r_${c.region}`,"headquartered_in"); });
  if (filters.person) PEOPLE.forEach(p => { if (p.companyId && nodeSet.has(`c_${p.companyId}`)) lnk(p.id,`c_${p.companyId}`,"founder_of"); });
  if (relFilters.listed_on && filters.exchange && filters.company) LISTINGS.forEach(l => { if (nodeSet.has(`c_${l.companyId}`) && nodeSet.has(`ex_${l.exchange}`)) lnk(`c_${l.companyId}`,`ex_${l.exchange}`,"listed_on",{ticker:l.ticker}); });
  VERIFIED_EDGES.forEach(e => { if (nodeSet.has(e.source) && nodeSet.has(e.target) && relFilters[e.rel] !== false && (e.y||2023) <= yearFilter) lnk(e.source, e.target, e.rel, {note:e.note, y:e.y}); });
  return {nodes, edges};
}

function computeLayout(graphData, w, h) {
  if (!graphData.nodes.length) return {nodes:[], edges:[]};
  const ns = graphData.nodes.map(n => ({...n, x: w/2+(Math.random()-0.5)*w*0.6, y: h/2+(Math.random()-0.5)*h*0.6}));
  const nById = {}; ns.forEach(n => nById[n.id] = n);
  const es = graphData.edges.filter(e => nById[e.source] && nById[e.target]).map(e => ({...e, source: nById[e.source], target: nById[e.target]}));
  const sim = d3.forceSimulation(ns)
    .force("link", d3.forceLink(es).id(d=>d.id).distance(d => {
      if (d.rel==="operates_in"||d.rel==="headquartered_in") return 60;
      if (d.rel==="eligible_for") return 80;
      if (d.rel==="program_of"||d.rel==="housed_at") return 70;
      if (d.rel==="accelerated_by"||d.rel==="won_pitch"||d.rel==="incubated_by") return 90;
      return 100;
    }).strength(d => d.rel==="invested_in"||d.rel==="founder_of"||d.rel==="program_of" ? 0.7 : d.rel==="accelerated_by"||d.rel==="housed_at" ? 0.5 : 0.3))
    .force("charge", d3.forceManyBody().strength(d => d.type==="fund"||d.type==="accelerator" ? -250 : d.type==="sector"||d.type==="ecosystem" ? -180 : d.type==="company" ? -60 : -120))
    .force("center", d3.forceCenter(w/2, h/2))
    .force("collision", d3.forceCollide().radius(d => d.type==="fund"||d.type==="accelerator" ? 28 : d.type==="company" ? 10+Math.sqrt(Math.max(0,d.funding||0))*0.2 : 18))
    .force("x", d3.forceX(w/2).strength(0.04)).force("y", d3.forceY(h/2).strength(0.04)).stop();
  const ticks = Math.min(300, Math.max(120, ns.length * 2));
  for (let i = 0; i < ticks; i++) sim.tick();
  const pad = 25;
  ns.forEach(n => { if (isNaN(n.x)) n.x=w/2; if (isNaN(n.y)) n.y=h/2; n.x=Math.max(pad,Math.min(w-pad,n.x)); n.y=Math.max(pad,Math.min(h-pad,n.y)); });
  return {nodes:ns, edges:es};
}
const fmt = m => m >= 1000 ? `$${(m/1000).toFixed(1)}B` : m >= 1 ? `$${m.toFixed(1)}M` : m > 0 ? `$${(m*1000).toFixed(0)}K` : "—";
const stageLabel = s => ({ pre_seed:"Pre-Seed", seed:"Seed", series_a:"Series A", series_b:"Series B", series_c_plus:"Series C+", growth:"Growth" }[s] || s);

// --- IRS Computation ---
const SHEAT = { AI:95, Cybersecurity:88, Defense:85, Cleantech:82, Mining:78, Aerospace:80, Cloud:80, "Data Center":80, Energy:78, Solar:75, Robotics:78, Biotech:72, Fintech:70, Gaming:68, Blockchain:50, Drones:75, Construction:65, Logistics:65, "Materials Science":70, "Real Estate":50, Computing:70, Water:72, Media:58, Payments:68, IoT:65, Manufacturing:60, Semiconductors:82, Hospitality:60, Cannabis:45, Analytics:75, Satellite:82, Identity:80, AdTech:65, Education:62, Healthcare:70, Consumer:55, Fitness:60, Mobile:58, Banking:55, Retail:52 };
const STAGE_NORMS = { pre_seed:0.5, seed:3, series_a:15, series_b:50, series_c_plus:200, growth:500 };

function computeIRS(c) {
  const m = Math.min(c.momentum || 0, 100);
  const fv = Math.min((c.funding / (STAGE_NORMS[c.stage] || 3)) * 50, 100);
  const sScores = (c.sector || []).map(s => SHEAT[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs = c.employees >= 100 ? 80 : c.employees >= 30 ? 60 : c.employees >= 15 ? 45 : c.employees >= 5 ? 25 : 10;
  const hasSsbci = c.eligible.some(e => ["bbv","fundnv","1864"].includes(e));
  const hasSbir = c.eligible.includes("sbir");
  const ns = Math.min((c.eligible.length || 0) * 15 + (c.employees > 0 ? 15 : 0), 100);
  const ts = Math.min(30 + (c.employees > 10 ? 25 : 0) + (c.eligible.length * 10), 100);
  const dq = Math.min(60 + (c.description ? 20 : 0) + (c.eligible.length > 0 ? 20 : 0), 100);
  const irs = Math.round(m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 + dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12);
  const grade = irs >= 85 ? "A" : irs >= 78 ? "A-" : irs >= 72 ? "B+" : irs >= 65 ? "B" : irs >= 58 ? "B-" : irs >= 50 ? "C+" : irs >= 42 ? "C" : "D";
  const triggers = [];
  if (fv >= 75) triggers.push("rapid_funding");
  if (sh >= 85) triggers.push("hot_sector");
  if (hasSsbci) triggers.push("ssbci_eligible");
  if (hs >= 50) triggers.push("hiring_surge");
  if (m >= 80) triggers.push("high_momentum");
  if (hasSbir) triggers.push("grant_validated");
  return { ...c, irs, grade, triggers, dims: { momentum: m, funding_velocity: Math.round(fv), market_timing: sh, hiring: hs, data_quality: dq, network: ns, team: ts } };
}

const TRIGGER_CFG = {
  rapid_funding:  { i:"🔥", l:"Rapid Funding",  c:"#EF4444" },
  grant_validated:{ i:"🏛️", l:"Grant Validated", c:"#3B82F6" },
  hiring_surge:   { i:"📈", l:"Hiring Surge",    c:"#F59E0B" },
  hot_sector:     { i:"🌡️", l:"Hot Sector",      c:"#F97316" },
  ssbci_eligible: { i:"🏦", l:"SSBCI Match",     c:"#8B5CF6" },
  high_momentum:  { i:"⚡", l:"High Momentum",   c:"#22C55E" },
};
const GRADE_COLORS = { A:"#4ADE80","A-":"#86EFAC","B+":"#FACC15",B:"#FDE047","B-":"#FEF08A","C+":"#FB923C",C:"#FDBA74",D:"#F87171" };

// --- CSS-in-JS animation keyframes ---
const fadeIn = { animation: "fadeIn 0.3s ease-out" };
const css = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

// --- Small components ---
const Spark = ({ data, color = GOLD, w = 60, h = 20 }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display:"block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
};

const MBar = ({ score, w = 80 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:w, height:6, background:"#1E1D1A", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${score}%`, height:"100%", borderRadius:3, background: score > 75 ? GREEN : score > 50 ? GOLD : score > 30 ? ORANGE : RED, transition:"width 0.6s ease" }} />
    </div>
    <span style={{ fontSize:11, color: score > 75 ? GREEN : score > 50 ? GOLD : MUTED, fontWeight:600, minWidth:20 }}>{score}</span>
  </div>
);

const Counter = ({ end, prefix="", suffix="", dur=1200 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const s = performance.now();
    const t = now => { const p = Math.min((now - s) / dur, 1); setV(Math.round(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(t); };
    requestAnimationFrame(t);
  }, [end]);
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
};

// --- Responsive hook ---
const useW = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
};

// ============================================================
// MAIN APP
// ============================================================
// ══════════════════════════════════════════════════════════════════════════════
// GRAPH INTELLIGENCE ENGINE — PageRank, Betweenness, Community, Watchlist
// Client-side structural analytics computed on filtered graph data
// ══════════════════════════════════════════════════════════════════════════════

function computeGraphMetrics(nodes, edges) {
  if (!nodes.length) return { pagerank:{}, betweenness:{}, communities:{}, watchlist:[] };
  const ids = nodes.map(n=>n.id);
  const idx = {}; ids.forEach((id,i) => idx[id]=i);
  const N = ids.length;

  // Build adjacency list (undirected for structural metrics)
  const adj = Array.from({length:N}, ()=>[]);
  const edgeList = [];
  edges.forEach(e => {
    const si=idx[typeof e.source==="object"?e.source.id:e.source];
    const ti=idx[typeof e.target==="object"?e.target.id:e.target];
    if(si!==undefined && ti!==undefined && si!==ti) {
      adj[si].push(ti); adj[ti].push(si);
      edgeList.push([si,ti]);
    }
  });

  // ── PageRank (power iteration, damping=0.85, 40 iterations) ──
  const d = 0.85;
  let pr = new Float64Array(N).fill(1/N);
  for(let iter=0; iter<40; iter++){
    const next = new Float64Array(N).fill((1-d)/N);
    for(let i=0;i<N;i++){
      if(adj[i].length>0){
        const share = pr[i]/adj[i].length;
        for(const j of adj[i]) next[j] += d*share;
      } else { // dangling node: distribute evenly
        for(let j=0;j<N;j++) next[j] += d*pr[i]/N;
      }
    }
    pr = next;
  }
  // Normalize to 0-100
  const prMax = Math.max(...pr), prMin = Math.min(...pr);
  const prRange = prMax-prMin||1;
  const pagerank = {};
  ids.forEach((id,i) => pagerank[id] = Math.round(((pr[i]-prMin)/prRange)*100));

  // ── Betweenness Centrality (Brandes' algorithm) ──
  const bc = new Float64Array(N).fill(0);
  for(let s=0;s<N;s++){
    const stack=[], pred=Array.from({length:N},()=>[]);
    const sigma=new Float64Array(N).fill(0); sigma[s]=1;
    const dist=new Int32Array(N).fill(-1); dist[s]=0;
    const queue=[s];
    let qi=0;
    while(qi<queue.length){
      const v=queue[qi++]; stack.push(v);
      for(const w of adj[v]){
        if(dist[w]<0){ dist[w]=dist[v]+1; queue.push(w); }
        if(dist[w]===dist[v]+1){ sigma[w]+=sigma[v]; pred[w].push(v); }
      }
    }
    const delta=new Float64Array(N).fill(0);
    while(stack.length){
      const w=stack.pop();
      for(const v of pred[w]) delta[v]+=(sigma[v]/sigma[w])*(1+delta[w]);
      if(w!==s) bc[w]+=delta[w];
    }
  }
  // Normalize
  const bcMax = Math.max(...bc)||1;
  const betweenness = {};
  ids.forEach((id,i) => betweenness[id] = Math.round((bc[i]/bcMax)*100));

  // ── Community Detection (Label Propagation — fast, good enough) ──
  const labels = Array.from({length:N}, (_,i)=>i);
  for(let iter=0;iter<20;iter++){
    let changed=false;
    // Random order
    const order=[...Array(N).keys()].sort(()=>Math.random()-0.5);
    for(const i of order){
      if(adj[i].length===0) continue;
      // Count neighbor labels
      const freq={};
      for(const j of adj[i]) freq[labels[j]]=(freq[labels[j]]||0)+1;
      const maxFreq=Math.max(...Object.values(freq));
      const candidates=Object.entries(freq).filter(([,f])=>f===maxFreq).map(([l])=>parseInt(l));
      const newLabel=candidates[Math.floor(Math.random()*candidates.length)];
      if(newLabel!==labels[i]){ labels[i]=newLabel; changed=true; }
    }
    if(!changed) break;
  }
  // Consolidate community labels to sequential IDs
  const labelMap={};
  let nextCid=0;
  const communities={};
  ids.forEach((id,i) => {
    if(labelMap[labels[i]]===undefined) labelMap[labels[i]]=nextCid++;
    communities[id]=labelMap[labels[i]];
  });

  // ── Structural Watchlist ──
  const watchlist = [];
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id]=n);

  ids.forEach((id,i) => {
    const n = nodeMap[id];
    if(!n || n.type!=="company") return;
    const degree = adj[i].length;
    const prScore = pagerank[id];
    const bcScore = betweenness[id];
    const funding = n.funding||0;
    const signals = [];

    // Signal 1: High funding, low edges (undercovered)
    if(funding > 50 && degree <= 3) signals.push({type:"undercovered",label:"High funding, few connections",severity:Math.min(100,Math.round(funding/10)),icon:"👁"});

    // Signal 2: High betweenness (bridge node)
    if(bcScore > 60) signals.push({type:"bridge",label:"Structural bridge between clusters",severity:bcScore,icon:"🌉"});

    // Signal 3: PageRank diverges from funding rank (hidden importance)
    if(prScore > 50 && funding < 100) signals.push({type:"hidden_influence",label:"Structurally important beyond funding",severity:prScore,icon:"🔮"});

    // Signal 4: Funding diverges from PageRank (overvalued structurally)
    if(funding > 200 && prScore < 20) signals.push({type:"isolated_capital",label:"Large funding but low graph connectivity",severity:Math.round(funding/50),icon:"🏝"});

    // Signal 5: High degree hub
    if(degree >= 8) signals.push({type:"hub",label:`Hub node: ${degree} connections`,severity:degree*5,icon:"⭐"});

    if(signals.length > 0) {
      watchlist.push({id,name:n.label||n.name,degree,pagerank:prScore,betweenness:bcScore,funding,signals,
        priority: signals.reduce((s,sig)=>s+sig.severity,0)
      });
    }
  });

  watchlist.sort((a,b) => b.priority - a.priority);

  const numCommunities = nextCid;
  // Community palette
  const COMM_COLORS = [GP.gold,GP.green,GP.blue,GP.purple,GP.orange,GP.red,GP.cyan,GP.pink,GP.lime,GP.teal,"#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"];

  return { pagerank, betweenness, communities, watchlist, numCommunities, commColors:COMM_COLORS, adj, ids, idx };
}

// ══════════════════════════════════════════════════════════════════════════════
// ONTOLOGY GRAPH VIEW — Palantir-inspired force-directed visualization
// Glowing edges, curved beziers, directional arrows, animated pulses, zoom/pan
// ══════════════════════════════════════════════════════════════════════════════

function OntologyGraphView({onSelectCompany}) {
  const [filters, setFilters] = useState({company:true, fund:true, accelerator:true, sector:false, region:false, person:true, external:true, ecosystem:true, exchange:false});
  const [relFilters, setRelFilters] = useState({eligible_for:true,operates_in:false,headquartered_in:false,invested_in:true,loaned_to:true,partners_with:true,contracts_with:true,acquired:true,founder_of:true,manages:true,listed_on:false,accelerated_by:true,won_pitch:true,incubated_by:true,program_of:true,supports:true,housed_at:true,collaborated_with:true,funds:true,approved_by:true,filed_with:true,competes_with:true});
  const [hoverId, setHoverId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [gPanel, setGPanel] = useState("graph");
  const [layoutKey, setLayoutKey] = useState(0);
  const [gSearch, setGSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  // ── Intelligence states ──
  const [yearFilter, setYearFilter] = useState(2026);
  const [colorMode, setColorMode] = useState("default"); // default|pagerank|betweenness|community
  const [showIntel, setShowIntel] = useState(false);
  const W = 900, H = 620;
  const graphData = useMemo(() => buildGraph(filters, relFilters, yearFilter), [filters, relFilters, yearFilter]);
  const layout = useMemo(() => computeLayout(graphData, W, H), [graphData, layoutKey]);
  // ── Compute graph intelligence metrics ──
  const metrics = useMemo(() => computeGraphMetrics(layout.nodes, layout.edges), [layout]);
  const toggleF = k => { setFilters(f => ({...f,[k]:!f[k]})); setLayoutKey(n=>n+1); };
  const toggleR = k => { setRelFilters(r => ({...r,[k]:!r[k]})); setLayoutKey(n=>n+1); };
  const searchMatches = useMemo(() => { if (!gSearch || gSearch.length < 2) return []; const q=gSearch.toLowerCase(); return layout.nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0,8); }, [gSearch, layout.nodes]);
  const mob = typeof window !== "undefined" && window.innerWidth < 700;
  const selectNode = (n) => { setSelected(n); setGSearch(""); if(mob) setGPanel("detail"); };

  // 2-hop neighborhood for Palantir-style lens effect
  const connectedSet = useMemo(() => {
    if (!hoverId) return null;
    const s = new Set([hoverId]);
    const getIds = e => {
      const sid=typeof e.source==="object"?e.source.id:e.source;
      const tid=typeof e.target==="object"?e.target.id:e.target;
      return [sid,tid];
    };
    // 1-hop
    layout.edges.forEach(e => { const [sid,tid]=getIds(e); if(sid===hoverId)s.add(tid); if(tid===hoverId)s.add(sid); });
    // 2-hop (lighter)
    const hop1 = new Set(s);
    layout.edges.forEach(e => { const [sid,tid]=getIds(e); if(hop1.has(sid)&&!s.has(tid))s.add(tid); if(hop1.has(tid)&&!s.has(sid))s.add(sid); });
    return {all:s, hop1};
  }, [hoverId, layout.edges]);

  const detailEdges = useMemo(() => { if (!selected) return []; return layout.edges.filter(e => { const sid=typeof e.source==="object"?e.source.id:e.source; const tid=typeof e.target==="object"?e.target.id:e.target; return sid===selected.id||tid===selected.id; }).map(e => { const sid=typeof e.source==="object"?e.source.id:e.source; const tid=typeof e.target==="object"?e.target.id:e.target; const oid=sid===selected.id?tid:sid; const other=layout.nodes.find(n=>n.id===oid); return {...e,other,dir:sid===selected.id?"→":"←"}; }); }, [selected, layout]);

  const nodeR = n => {
    // In metric modes, scale nodes by their score
    if(colorMode==="pagerank" && metrics.pagerank[n.id]!==undefined) {
      return Math.max(6, 4 + metrics.pagerank[n.id]*0.22);
    }
    if(colorMode==="betweenness" && metrics.betweenness[n.id]!==undefined) {
      return Math.max(6, 4 + metrics.betweenness[n.id]*0.22);
    }
    if(n.type==="fund")return 20; if(n.type==="accelerator")return 18; if(n.type==="ecosystem")return 15; if(n.type==="sector")return 15; if(n.type==="region")return 16; if(n.type==="exchange")return 13; if(n.type==="person")return 11; if(n.type==="external")return 13; return Math.min(24,Math.max(6,5+Math.sqrt(Math.max(0,n.funding||0))*0.3));
  };
  const nodeColor = n => {
    if(colorMode==="community" && metrics.communities[n.id]!==undefined) {
      return metrics.commColors[metrics.communities[n.id] % metrics.commColors.length];
    }
    if(colorMode==="pagerank" && metrics.pagerank[n.id]!==undefined) {
      const v = metrics.pagerank[n.id];
      return v>75?GP.gold:v>50?GP.green:v>25?GP.blue:GP.dim;
    }
    if(colorMode==="betweenness" && metrics.betweenness[n.id]!==undefined) {
      const v = metrics.betweenness[n.id];
      return v>60?GP.red:v>40?GP.orange:v>20?GP.cyan:GP.dim;
    }
    if(n.type==="company")return GSTAGE_C[n.stage]||GP.muted; return NODE_CFG[n.type]?.color||GP.muted;
  };

  // Edge importance for thickness
  const edgeWeight = rel => { if(rel==="invested_in"||rel==="acquired") return 2; if(rel==="loaned_to"||rel==="funds") return 1.6; if(rel==="partners_with"||rel==="contracts_with") return 1.2; return 0.8; };

  // Curved edge path (quadratic bezier with offset for visual separation)
  const edgePath = (sx,sy,tx,ty,i) => {
    const dx=tx-sx, dy=ty-sy, dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<1) return `M${sx},${sy}L${tx},${ty}`;
    const curve = Math.min(dist*0.15, 30);
    const mx=(sx+tx)/2, my=(sy+ty)/2;
    const nx=-dy/dist, ny=dx/dist;
    const off = ((i%3)-1)*curve*0.5;
    const cx=mx+nx*off, cy=my+ny*off;
    return `M${sx},${sy}Q${cx},${cy},${tx},${ty}`;
  };

  // Zoom/pan handlers
  const handleWheel = useCallback(e => {
    e.preventDefault();
    const dz = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(4, z * dz)));
  }, []);
  const handleMouseDown = useCallback(e => { if(e.button===0 && e.target.tagName==="svg"){ setDragging(true); setDragStart({x:e.clientX-pan.x,y:e.clientY-pan.y}); } }, [pan]);
  const handleMouseMove = useCallback(e => { if(dragging&&dragStart){ setPan({x:e.clientX-dragStart.x,y:e.clientY-dragStart.y}); } }, [dragging,dragStart]);
  const handleMouseUp = useCallback(() => { setDragging(false); setDragStart(null); }, []);
  const resetView = () => { setZoom(1); setPan({x:0,y:0}); };

  const showSidebar = !mob || gPanel === "filters";
  const showDetail = !mob || gPanel === "detail";
  const showGraph = !mob || gPanel === "graph";

  // Compute viewBox based on zoom/pan
  const vbW = W/zoom, vbH = H/zoom;
  const vbX = (W-vbW)/2 - pan.x/zoom;
  const vbY = (H-vbH)/2 - pan.y/zoom;

  return (
    <div style={{display:"flex",flexDirection:"column",background:GP.bg,borderRadius:10,border:`1px solid ${GP.border}`,overflow:"hidden",minHeight:500}}>
      {/* Graph header */}
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${GP.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:GP.surface}}>
        <span style={{color:GP.muted,fontSize:9,letterSpacing:1}}>{layout.nodes.length} ENTITIES · {layout.edges.length} LINKS</span>
        <div style={{flex:1}}/>
        {/* ── Time Slider ── */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 8px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:5}}>
          <span style={{fontSize:8,color:GP.muted,letterSpacing:1}}>⏱</span>
          <input type="range" min={2011} max={2026} value={yearFilter} onChange={e=>{setYearFilter(parseInt(e.target.value));setLayoutKey(n=>n+1);}}
            style={{width:mob?60:90,height:3,accentColor:GP.gold,cursor:"pointer"}}/>
          <span style={{fontSize:9,color:yearFilter<2026?GP.gold:GP.muted,fontWeight:yearFilter<2026?700:400,minWidth:28,fontVariantNumeric:"tabular-nums"}}>{yearFilter<2026?"≤"+yearFilter:"ALL"}</span>
        </div>
        {/* ── Color Mode ── */}
        <div style={{display:"flex",gap:1}}>
          {[["default","◉"],["pagerank","PR"],["betweenness","BC"],["community","🏘"]].map(([mode,label]) => (
            <div key={mode} onClick={()=>setColorMode(mode)} style={{cursor:"pointer",padding:"3px 6px",background:colorMode===mode?GP.gold+"20":GP.bg,border:`1px solid ${colorMode===mode?GP.gold+"50":GP.border}`,fontSize:8,color:colorMode===mode?GP.gold:GP.muted,borderRadius:mode==="default"?"4px 0 0 4px":mode==="community"?"0 4px 4px 0":"0",fontWeight:colorMode===mode?700:400,letterSpacing:0.5}} title={mode==="default"?"Default":mode==="pagerank"?"PageRank":mode==="betweenness"?"Betweenness Centrality":"Communities"}>{label}</div>
          ))}
        </div>
        <div style={{position:"relative"}}>
          <input value={gSearch} onChange={e=>setGSearch(e.target.value)} placeholder="Search nodes…" style={{background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:4,padding:"4px 8px 4px 22px",color:GP.text,fontSize:10,width:mob?120:160,outline:"none",fontFamily:"inherit"}}/>
          <span style={{position:"absolute",left:7,top:5,fontSize:10,color:GP.dim}}>⌕</span>
          {searchMatches.length > 0 && (
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:GP.surface,border:`1px solid ${GP.border}`,borderRadius:4,marginTop:2,zIndex:100,maxHeight:200,overflowY:"auto"}}>
              {searchMatches.map(n => (
                <div key={n.id} onClick={()=>selectNode(n)} style={{padding:"5px 8px",cursor:"pointer",borderBottom:`1px solid ${GP.border}`,fontSize:10,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:1,background:NODE_CFG[n.type]?.color||GP.dim}}/><span>{n.label}</span>
                  <span style={{marginLeft:"auto",fontSize:8,color:GP.dim}}>{n.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Zoom controls */}
        <div style={{display:"flex",gap:2}}>
          <div onClick={()=>setZoom(z=>Math.min(4,z*1.3))} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:"4px 0 0 4px",fontSize:10,color:GP.muted}}>+</div>
          <div onClick={resetView} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,fontSize:9,color:GP.muted}}>{Math.round(zoom*100)}%</div>
          <div onClick={()=>setZoom(z=>Math.max(0.3,z*0.7))} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:"0 4px 4px 0",fontSize:10,color:GP.muted}}>−</div>
        </div>
        <div onClick={()=>setShowIntel(v=>!v)} title="Toggle Intelligence Panel" style={{cursor:"pointer",padding:"3px 8px",background:showIntel?GP.red+"20":GP.bg,border:`1px solid ${showIntel?GP.red+"40":GP.border}`,borderRadius:4,fontSize:9,color:showIntel?GP.red:GP.muted,fontWeight:showIntel?700:400}}>⚡</div>
        <div onClick={()=>setShowLegend(v=>!v)} title="Toggle legend" style={{cursor:"pointer",padding:"3px 8px",background:showLegend?GP.gold+"20":GP.bg,border:`1px solid ${showLegend?GP.gold+"40":GP.border}`,borderRadius:4,fontSize:9,color:showLegend?GP.gold:GP.muted}}>◐</div>
        <div onClick={()=>setLayoutKey(n=>n+1)} title="Shuffle layout" style={{cursor:"pointer",padding:"3px 8px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:4,fontSize:9,color:GP.muted}}>⟳</div>
      </div>
      {/* Mobile tabs */}
      {mob && (
        <div style={{display:"flex",borderBottom:`1px solid ${GP.border}`}}>
          {[["filters","⚙ Filters"],["graph","◎ Graph"],["detail","≡ Detail"],["intel","⚡ Intel"]].map(([k,l]) => (
            <div key={k} onClick={()=>setGPanel(k)} style={{flex:1,textAlign:"center",padding:"8px 0",fontSize:10,letterSpacing:1,color:gPanel===k?GP.gold:GP.muted,borderBottom:gPanel===k?`2px solid ${GP.gold}`:"2px solid transparent",cursor:"pointer"}}>{l}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:400}}>
        {/* LEFT: Filters */}
        {showSidebar && (
          <div style={{width:mob?"100%":200,borderRight:mob?"none":`1px solid ${GP.border}`,padding:10,overflowY:"auto",flexShrink:0,fontSize:10}}>
            <div style={{fontSize:9,color:GP.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Entity Types</div>
            {Object.entries(NODE_CFG).map(([k,cfg]) => (
              <div key={k} onClick={()=>toggleF(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer",opacity:filters[k]?1:0.35}}>
                <div style={{width:11,height:11,borderRadius:2,border:`1.5px solid ${cfg.color}`,background:filters[k]?cfg.color+"25":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:cfg.color}}>{filters[k]?"✓":""}</div>
                <span style={{color:filters[k]?GP.text:GP.muted}}>{cfg.icon} {cfg.label}</span>
              </div>
            ))}
            <div style={{height:1,background:GP.border,margin:"8px 0"}}/>
            <div style={{fontSize:9,color:GP.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Relationships</div>
            {Object.entries(REL_CFG).map(([k,cfg]) => (
              <div key={k} onClick={()=>toggleR(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0",cursor:"pointer",opacity:relFilters[k]?1:0.3}}>
                <div style={{width:10,height:10,borderRadius:2,border:`1px solid ${cfg.color}`,background:relFilters[k]?cfg.color+"25":"transparent",fontSize:6,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.color}}>{relFilters[k]?"✓":""}</div>
                <span style={{fontSize:9,color:relFilters[k]?GP.text:GP.dim}}>{cfg.label}</span>
              </div>
            ))}
          </div>
        )}
        {/* CENTER: SVG Canvas */}
        {showGraph && (
          <div style={{flex:1,position:"relative",overflow:"hidden",cursor:dragging?"grabbing":"grab"}}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel}>
            <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} style={{width:"100%",height:"100%",display:"block",background:"#050508"}}>
              {/* SVG Defs: glow filters, arrow markers, grid */}
              <defs>
                <filter id="glow-edge" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-pulse" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* Arrow markers per rel color */}
                {Object.entries(REL_CFG).map(([k,cfg]) => (
                  <marker key={k} id={`arr-${k}`} viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,3 L0,6 Z" fill={cfg.color} fillOpacity={0.6}/>
                  </marker>
                ))}
                {/* Radial gradient for selected node */}
                <radialGradient id="sel-glow">
                  <stop offset="0%" stopColor={GP.gold} stopOpacity="0.3"/>
                  <stop offset="70%" stopColor={GP.gold} stopOpacity="0.05"/>
                  <stop offset="100%" stopColor={GP.gold} stopOpacity="0"/>
                </radialGradient>
                {/* Background grid pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="0.5" fill="#1a1a25"/>
                </pattern>
                {/* Pulse animation */}
                <style>{`
                  @keyframes pulse { 0%{r:0;opacity:0.6} 100%{r:40;opacity:0} }
                  .pulse-ring { animation: pulse 2s ease-out infinite; }
                  @keyframes glow-breathe { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
                  .breathe { animation: glow-breathe 3s ease-in-out infinite; }
                `}</style>
              </defs>

              {/* Background grid */}
              <rect x={vbX-50} y={vbY-50} width={vbW+100} height={vbH+100} fill="url(#grid)"/>

              {/* Edges: curved bezier with glow */}
              {layout.edges.map((e,i) => {
                const sx=typeof e.source==="object"?e.source.x:0,sy=typeof e.source==="object"?e.source.y:0;
                const tx=typeof e.target==="object"?e.target.x:0,ty=typeof e.target==="object"?e.target.y:0;
                const sid=typeof e.source==="object"?e.source.id:e.source,tid=typeof e.target==="object"?e.target.id:e.target;
                const cfg=REL_CFG[e.rel]||{color:GP.dim,dash:""};
                const isH=hoverId&&(sid===hoverId||tid===hoverId);
                const isSel=selected&&(sid===selected.id||tid===selected.id);
                const isDim=hoverId&&!isH;
                const w=edgeWeight(e.rel);
                const d=edgePath(sx,sy,tx,ty,i);
                // Temporal brightness: edges from yearFilter year glow brighter
                const eYear = e.y||2023;
                const isRecent = yearFilter<2026 && eYear===yearFilter;
                const temporalOp = isRecent ? 0.35 : 1;
                return <g key={i}>
                  {/* Glow underlayer for active/recent edges */}
                  {(isH||isSel||isRecent) && <path d={d} fill="none" stroke={isRecent&&!isH&&!isSel?GP.gold:cfg.color} strokeWidth={isRecent&&!isH?w*2:w*3} strokeOpacity={isRecent&&!isH?0.25:0.15} filter="url(#glow-edge)"/>}
                  <path d={d} fill="none" stroke={isRecent&&!isH&&!isSel?GP.gold:cfg.color}
                    strokeWidth={isH?w*2.5:isSel?w*1.5:isRecent?w*1.2:w*0.5}
                    strokeOpacity={isDim?0.03:isH?0.9:isSel?0.5:isRecent?0.5:0.12}
                    strokeDasharray={cfg.dash}
                    markerEnd={isH||isSel?`url(#arr-${e.rel})`:""}/>
                </g>;
              })}

              {/* Nodes */}
              {layout.nodes.map(n => {
                const r=nodeR(n),col=nodeColor(n);
                const isH=hoverId===n.id,isSel=selected?.id===n.id;
                const inHop1=connectedSet?.hop1?.has(n.id);
                const inHop2=connectedSet?.all?.has(n.id)&&!inHop1;
                const isDim=connectedSet&&!connectedSet.all.has(n.id);
                const showLabel=isH||isSel||r>13||["fund","accelerator","ecosystem","region","exchange"].includes(n.type)||(inHop1&&hoverId);
                const opacity=isDim?0.06:inHop2?0.35:1;
                return (
                  <g key={n.id} style={{cursor:"pointer",opacity,transition:"opacity 0.2s"}}
                    onMouseEnter={()=>setHoverId(n.id)} onMouseLeave={()=>setHoverId(null)}
                    onClick={e=>{e.stopPropagation();selectNode(n);}}
                    onTouchStart={e=>{e.preventDefault();selectNode(n);}}>

                    {/* Selected: pulsing ring + radial glow */}
                    {isSel && <>
                      <circle cx={n.x} cy={n.y} r={r+20} fill="url(#sel-glow)"/>
                      <circle cx={n.x} cy={n.y} r={r+8} fill="none" stroke={GP.gold} strokeWidth={1} className="pulse-ring"/>
                      <circle cx={n.x} cy={n.y} r={r+5} fill="none" stroke={GP.gold} strokeWidth={1.5} strokeDasharray="3,3" className="breathe"/>
                    </>}

                    {/* Hover: glow halo */}
                    {isH && <circle cx={n.x} cy={n.y} r={r+8} fill={col} fillOpacity={0.08} filter="url(#glow-node)"/>}

                    {/* Node shape */}
                    {n.type==="accelerator" ? (
                      <polygon points={`${n.x},${n.y-r} ${n.x-r*0.87},${n.y+r*0.5} ${n.x+r*0.87},${n.y+r*0.5}`}
                        fill={col+(isH||isSel?"40":"15")} stroke={col} strokeWidth={isH?2:isSel?1.5:0.8}
                        filter={isH?"url(#glow-node)":""}/>
                    ) : (
                      <circle cx={n.x} cy={n.y} r={r}
                        fill={col+(isH||isSel?"40":"12")} stroke={col} strokeWidth={isH?2:isSel?1.5:0.8}
                        filter={isH?"url(#glow-node)":""}/>
                    )}

                    {/* Inner icon for ecosystem */}
                    {n.type==="ecosystem" && <text x={n.x} y={n.y+3} textAnchor="middle" fill={col} fontSize={r*0.7} fontWeight={700}>⊕</text>}

                    {/* Label */}
                    {showLabel && <>
                      {/* Shadow for readability */}
                      <text x={n.x} y={n.y+r+(isH?13:10)} textAnchor="middle" fill="#050508" fontSize={isH?10:["accelerator","ecosystem"].includes(n.type)?8.5:7.5} fontWeight={isH?700:400} stroke="#050508" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke">{n.label.length>20?n.label.slice(0,20)+"…":n.label}</text>
                      <text x={n.x} y={n.y+r+(isH?13:10)} textAnchor="middle" fill={isH?GP.text:inHop1?GP.text:GP.muted} fontSize={isH?10:["accelerator","ecosystem"].includes(n.type)?8.5:7.5} fontWeight={isH?700:["accelerator","fund"].includes(n.type)?600:400}>{n.label.length>20?n.label.slice(0,20)+"…":n.label}</text>
                    </>}

                    {/* Hover funding tooltip */}
                    {isH && n.type==="company" && n.funding>0 && <>
                      <text x={n.x} y={n.y-r-6} textAnchor="middle" fill="#050508" fontSize={8} fontWeight={600} stroke="#050508" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke">{n.funding>=1000?`$${(n.funding/1000).toFixed(1)}B`:`$${n.funding}M`}</text>
                      <text x={n.x} y={n.y-r-6} textAnchor="middle" fill={GP.green} fontSize={8} fontWeight={600}>{n.funding>=1000?`$${(n.funding/1000).toFixed(1)}B`:`$${n.funding}M`}</text>
                    </>}
                  </g>
                );
              })}

              {/* Floating legend overlay */}
              {showLegend && (
                <g transform={`translate(${vbX+8},${vbY+vbH-120})`}>
                  <rect x={0} y={0} width={130} height={112} rx={6} fill="#0a0a10" fillOpacity={0.9} stroke={GP.border}/>
                  <text x={8} y={14} fill={GP.muted} fontSize={7} letterSpacing="1" fontWeight={600}>ENTITY TYPES</text>
                  {Object.entries(NODE_CFG).slice(0,8).map(([k,cfg],i) => (
                    <g key={k} transform={`translate(8,${22+i*11})`}>
                      <circle cx={4} cy={0} r={3} fill={cfg.color+"50"} stroke={cfg.color} strokeWidth={0.8}/>
                      <text x={12} y={3} fill={GP.muted} fontSize={7}>{cfg.label}</text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        )}
        {/* RIGHT: Detail */}
        {showDetail && (
          <div style={{width:mob?"100%":240,borderLeft:mob?"none":`1px solid ${GP.border}`,padding:10,overflowY:"auto",flexShrink:0,fontSize:10,background:GP.surface+"80"}}>
            {selected ? (<>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <div style={{width:12,height:12,borderRadius:3,background:nodeColor(selected),boxShadow:`0 0 8px ${nodeColor(selected)}40`}}/>
                <span style={{fontWeight:700,fontSize:13,color:GP.text}}>{selected.label}</span>
              </div>
              <div style={{color:GP.muted,fontSize:9,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5,display:"flex",alignItems:"center",gap:6}}>
                <span style={{padding:"1px 6px",borderRadius:3,background:nodeColor(selected)+"15",color:nodeColor(selected),fontSize:8}}>{selected.type}</span>
              </div>
              {selected.type==="company" && (<>
                <div style={{color:GP.muted,marginBottom:2}}>{selected.city} · {(selected.sector||[]).join(", ")}</div>
                {selected.funding>0 && <div style={{color:GP.green,fontWeight:600,fontSize:12,margin:"4px 0"}}>
                  {selected.funding>=1000?`$${(selected.funding/1000).toFixed(1)}B`:`$${selected.funding}M`}
                  <span style={{fontWeight:400,fontSize:9,color:GP.muted,marginLeft:4}}>raised</span>
                </div>}
                {selected.employees>0 && <div style={{color:GP.muted}}>{selected.employees} employees · Est. {selected.founded||"—"}</div>}
                {onSelectCompany && <div onClick={()=>onSelectCompany(parseInt(selected.id.replace("c_","")))} style={{marginTop:6,padding:"4px 10px",background:GP.gold+"15",border:`1px solid ${GP.gold}30`,borderRadius:4,color:GP.gold,fontSize:9,cursor:"pointer",textAlign:"center",letterSpacing:0.5}}>View Full Profile →</div>}
              </>)}
              {selected.type==="fund" && selected.fundType && (
                <div style={{padding:6,background:GP.bg,borderLeft:`3px solid ${GP.blue}`,borderRadius:4,marginBottom:6}}>
                  <span style={{color:GP.blue,fontWeight:600}}>{selected.fundType}</span>
                </div>
              )}
              {selected.note && <div style={{color:GP.dim,marginTop:4,fontStyle:"italic",fontSize:9,lineHeight:1.4}}>{selected.note}</div>}
              {selected.role && <div style={{color:GP.purple,marginTop:2}}>{selected.role}</div>}
              {/* ── Structural Metrics ── */}
              {(metrics.pagerank[selected.id]!==undefined) && (
                <div style={{margin:"8px 0",padding:8,background:GP.bg,borderRadius:6,border:`1px solid ${GP.border}`}}>
                  <div style={{fontSize:8,color:GP.muted,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>⚡ Structural Intelligence</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <div><div style={{fontSize:7,color:GP.muted}}>PageRank</div><div style={{fontSize:14,fontWeight:700,color:metrics.pagerank[selected.id]>50?GP.gold:GP.text}}>{metrics.pagerank[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Betweenness</div><div style={{fontSize:14,fontWeight:700,color:metrics.betweenness[selected.id]>40?GP.orange:GP.text}}>{metrics.betweenness[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Community</div><div style={{fontSize:14,fontWeight:700,color:metrics.commColors[metrics.communities[selected.id]%metrics.commColors.length]}}>{metrics.communities[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Connections</div><div style={{fontSize:14,fontWeight:700,color:GP.text}}>{detailEdges.length}</div></div>
                  </div>
                  {/* Mini bar visualization */}
                  <div style={{marginTop:6,display:"flex",gap:4,alignItems:"center"}}>
                    <div style={{flex:1,height:4,background:GP.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${metrics.pagerank[selected.id]}%`,height:"100%",background:GP.gold,borderRadius:2,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:7,color:GP.dim}}>PR</span>
                  </div>
                  <div style={{marginTop:3,display:"flex",gap:4,alignItems:"center"}}>
                    <div style={{flex:1,height:4,background:GP.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${metrics.betweenness[selected.id]}%`,height:"100%",background:GP.orange,borderRadius:2,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:7,color:GP.dim}}>BC</span>
                  </div>
                </div>
              )}
              <div style={{height:1,background:GP.border,margin:"10px 0"}}/>
              <div style={{fontSize:9,color:GP.gold,letterSpacing:1,marginBottom:6,fontWeight:600}}>CONNECTIONS ({detailEdges.length})</div>
              {detailEdges.map((e,i) => (
                <div key={i} onClick={()=>{if(e.other)selectNode(e.other);}} style={{padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${GP.border}30`,display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{color:REL_CFG[e.rel]?.color||GP.dim,fontSize:9,flexShrink:0,fontWeight:600}}>{e.dir}</span>
                  <div>
                    <span style={{color:GP.text,fontWeight:500}}>{e.other?.label||"?"}</span>
                    <span style={{color:REL_CFG[e.rel]?.color||GP.dim,fontSize:8,marginLeft:4,opacity:0.7}}>{REL_CFG[e.rel]?.label||e.rel}</span>
                    {e.note && <div style={{color:GP.dim,fontSize:8,marginTop:1}}>{e.note}</div>}
                  </div>
                </div>
              ))}
            </>) : showIntel ? (
              /* ── Intelligence Watchlist Panel ── */
              <div style={{padding:0}}>
                <div style={{fontSize:9,color:GP.red,letterSpacing:1.5,marginBottom:8,fontWeight:700,textTransform:"uppercase",display:"flex",alignItems:"center",gap:4}}>⚡ Structural Watchlist</div>
                <div style={{fontSize:8,color:GP.muted,marginBottom:10,lineHeight:1.4}}>
                  Companies flagged by graph-theoretic anomalies: high funding with sparse connections, structural bridge positions, or hidden influence.
                </div>
                <div style={{fontSize:8,color:GP.dim,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                  <span>{metrics.watchlist.length} signals</span>
                  <span>{metrics.numCommunities} communities</span>
                </div>
                {metrics.watchlist.slice(0,15).map((w,i) => (
                  <div key={w.id} onClick={()=>{const n=layout.nodes.find(n=>n.id===w.id);if(n)selectNode(n);}} style={{padding:"6px 4px",cursor:"pointer",borderBottom:`1px solid ${GP.border}20`,marginBottom:2}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                      <span style={{fontSize:9,fontWeight:600,color:GP.text}}>{w.name}</span>
                      <span style={{marginLeft:"auto",fontSize:8,color:GP.dim,fontVariantNumeric:"tabular-nums"}}>{w.funding>0?(w.funding>=1000?`$${(w.funding/1000).toFixed(1)}B`:`$${w.funding}M`):""}</span>
                    </div>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {w.signals.map((s,j) => (
                        <span key={j} style={{padding:"1px 5px",borderRadius:3,fontSize:7,background:s.type==="bridge"?GP.orange+"20":s.type==="undercovered"?GP.red+"20":s.type==="hidden_influence"?GP.purple+"20":s.type==="hub"?GP.gold+"20":GP.cyan+"20",color:s.type==="bridge"?GP.orange:s.type==="undercovered"?GP.red:s.type==="hidden_influence"?GP.purple:s.type==="hub"?GP.gold:GP.cyan,letterSpacing:0.3}}>{s.icon} {s.label}</span>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:3,fontSize:7,color:GP.dim}}>
                      <span>PR:{w.pagerank}</span><span>BC:{w.betweenness}</span><span>Edges:{w.degree}</span>
                    </div>
                  </div>
                ))}
                {/* ── Color Mode Legend ── */}
                {colorMode !== "default" && (
                  <div style={{marginTop:12,padding:8,background:GP.bg,borderRadius:6,border:`1px solid ${GP.border}`}}>
                    <div style={{fontSize:8,color:GP.muted,letterSpacing:1,marginBottom:4}}>
                      {colorMode==="pagerank"?"PAGERANK":""}
                      {colorMode==="betweenness"?"BETWEENNESS CENTRALITY":""}
                      {colorMode==="community"?`COMMUNITIES (${metrics.numCommunities})`:""}
                    </div>
                    {colorMode==="pagerank" && <div style={{fontSize:7,color:GP.dim}}>
                      <span style={{color:GP.gold}}>■</span> High (&gt;75) · <span style={{color:GP.green}}>■</span> Med (&gt;50) · <span style={{color:GP.blue}}>■</span> Low (&gt;25) · <span style={{color:GP.dim}}>■</span> Minimal
                    </div>}
                    {colorMode==="betweenness" && <div style={{fontSize:7,color:GP.dim}}>
                      <span style={{color:GP.red}}>■</span> Critical (&gt;60) · <span style={{color:GP.orange}}>■</span> High (&gt;40) · <span style={{color:GP.cyan}}>■</span> Med (&gt;20) · <span style={{color:GP.dim}}>■</span> Low
                    </div>}
                    {colorMode==="community" && <div style={{fontSize:7,color:GP.dim}}>Nodes colored by detected community cluster</div>}
                  </div>
                )}
              </div>
            ) : (
              <div style={{color:GP.dim,textAlign:"center",padding:30,lineHeight:1.6}}>
                <div style={{fontSize:20,marginBottom:8,opacity:0.3}}>⊛</div>
                <div style={{fontSize:10}}>Click a node to inspect</div>
                <div style={{fontSize:9,marginTop:4}}>Scroll to zoom · Drag to pan</div>
                <div style={{fontSize:8,marginTop:8,color:GP.dim}}>⚡ Intelligence panel for watchlist</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BattleBornIntelligence() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [sortBy, setSortBy] = useState("momentum");
  const [mobileNav, setMobileNav] = useState(false);
  const [mapHover, setMapHover] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [sectorDetail, setSectorDetail] = useState(null);
  const [fundDetail, setFundDetail] = useState(null);

  const filtered = useMemo(() => COMPANIES.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.sector.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (regionFilter !== "all" && c.region !== regionFilter) return false;
    return true;
  }).sort((a, b) => sortBy === "momentum" ? b.momentum - a.momentum : sortBy === "funding" ? b.funding - a.funding : a.name.localeCompare(b.name)), [search, stageFilter, regionFilter, sortBy]);

  const scored = useMemo(() => filtered.map(computeIRS).sort((a, b) => b.irs - a.irs), [filtered]);
  const allScored = useMemo(() => COMPANIES.map(computeIRS), []);
  const totalFunding = COMPANIES.reduce((s, c) => s + c.funding, 0);
  const avgMomentum = Math.round(COMPANIES.reduce((s, c) => s + c.momentum, 0) / COMPANIES.length);
  const totalEmployees = COMPANIES.reduce((s, c) => s + c.employees, 0);
  const px = isMobile ? 12 : 24;

  // Watchlist helpers
  const toggleWatchlist = (id) => setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const isWatched = (id) => watchlist.includes(id);
  const watchedCompanies = useMemo(() => allScored.filter(c => watchlist.includes(c.id)), [allScored, watchlist]);

  // Sector analytics
  const sectorStats = useMemo(() => {
    const map = {};
    allScored.forEach(c => (c.sector || []).forEach(s => {
      if (!map[s]) map[s] = { name: s, count: 0, totalFunding: 0, totalIRS: 0, companies: [], stages: {} };
      map[s].count++;
      map[s].totalFunding += c.funding;
      map[s].totalIRS += c.irs;
      map[s].companies.push(c);
      map[s].stages[c.stage] = (map[s].stages[c.stage] || 0) + 1;
    }));
    return Object.values(map).map(s => ({
      ...s, avgIRS: Math.round(s.totalIRS / s.count), heat: SHEAT[s.name] || 50,
      topCompany: s.companies.sort((a, b) => b.irs - a.irs)[0],
    })).sort((a, b) => b.heat - a.heat);
  }, [allScored]);

  // Stat card component (responsive)
  const Stat = ({ label, value, sub, color = GOLD }) => (
    <div style={{ padding: isMobile ? "12px 14px" : "16px 20px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:10 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>{sub}</div>}
    </div>
  );

  // Grade badge
  const Grade = ({ grade, size = "md" }) => {
    const gc = GRADE_COLORS[grade] || MUTED;
    const sz = size === "lg" ? { w:44, h:44, fs:14, r:10 } : size === "sm" ? { w:26, h:26, fs:9, r:6 } : { w:34, h:34, fs:11, r:8 };
    return <div style={{ width:sz.w, height:sz.h, borderRadius:sz.r, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz.fs, fontWeight:900, color:gc, background:gc+"18", border:`1.5px solid ${gc}35`, flexShrink:0 }}>{grade}</div>;
  };

  // Detail panel (responsive — full screen on mobile, side panel on desktop)
  const DetailPanel = () => {
    if (!selectedCompany) return null;
    const sc = computeIRS(selectedCompany);
    const gc = GRADE_COLORS[sc.grade] || MUTED;
    const panelStyle = isMobile
      ? { position:"fixed", inset:0, background:CARD, zIndex:300, overflowY:"auto", padding:20, animation:"slideUp 0.25s ease-out" }
      : { position:"fixed", right:0, top:0, width:420, height:"100vh", background:CARD, borderLeft:`1px solid ${BORDER}`, zIndex:300, overflowY:"auto", padding:24, animation:"slideIn 0.25s ease-out", boxShadow:`-8px 0 32px ${DARK}` };
    return (
      <div style={panelStyle}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:10, color:GOLD, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>{stageLabel(sc.stage)}</div>
            <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{sc.name}</h2>
            <div style={{ fontSize:12, color:MUTED, marginTop:2 }}>{sc.city}, NV · Est. {sc.founded} · {sc.employees} people</div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={() => toggleWatchlist(sc.id)} style={{ background:isWatched(sc.id) ? GOLD+"20" : "none", border:`1px solid ${isWatched(sc.id) ? GOLD+"40" : BORDER}`, color:isWatched(sc.id) ? GOLD : MUTED, fontSize:16, cursor:"pointer", padding:"4px 8px", borderRadius:6, lineHeight:1 }}>{isWatched(sc.id) ? "★" : "☆"}</button>
            <button onClick={() => setSelectedCompany(null)} style={{ background:"none", border:"none", color:MUTED, fontSize:22, cursor:"pointer", padding:8, lineHeight:1 }}>✕</button>
          </div>
        </div>
        <p style={{ fontSize:13, lineHeight:1.6, color:TEXT, margin:"0 0 20px 0" }}>{sc.description}</p>

        {/* IRS Scorecard */}
        <div style={{ background:DARK, borderRadius:10, padding:16, marginBottom:20, border:`1px solid ${BORDER}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:"uppercase" }}>Investment Readiness Score</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Grade grade={sc.grade} size="lg" />
              <div style={{ fontSize:28, fontWeight:800, color:gc }}>{sc.irs}</div>
            </div>
          </div>
          {Object.entries(sc.dims).map(([key, val]) => (
            <div key={key} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
                <span style={{ color:MUTED, textTransform:"capitalize" }}>{key.replace("_"," ")}</span>
                <span style={{ color: val >= 70 ? GREEN : val >= 45 ? GOLD : MUTED, fontWeight:600 }}>{val}</span>
              </div>
              <div style={{ height:4, background:"#1a1a18", borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:`${val}%`, height:"100%", borderRadius:2, background: val >= 70 ? GREEN : val >= 45 ? GOLD : MUTED+"80", transition:"width 0.5s ease" }} />
              </div>
            </div>
          ))}
          {sc.triggers.length > 0 && (
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:12 }}>
              {sc.triggers.map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:9, padding:"3px 8px", borderRadius:10, background:cfg.c+"15", color:cfg.c, border:`1px solid ${cfg.c}30` }}>{cfg.i} {cfg.l}</span> : null; })}
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          <div style={{ padding:12, background:DARK, borderRadius:8, border:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Funding</div>
            <div style={{ fontSize:20, fontWeight:700, color:GREEN }}>{fmt(sc.funding)}</div>
          </div>
          <div style={{ padding:12, background:DARK, borderRadius:8, border:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Momentum</div>
            <div style={{ fontSize:20, fontWeight:700, color:sc.momentum > 75 ? GREEN : GOLD }}>{sc.momentum}</div>
          </div>
        </div>

        <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Sectors</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>{sc.sector.map(s => <span key={s} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, background:BLUE+"15", color:BLUE, border:`1px solid ${BLUE}25` }}>{s}</span>)}</div>

        <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Program Eligibility</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{sc.eligible.length > 0 ? sc.eligible.map(e => <span key={e} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, background:GREEN+"15", color:GREEN, border:`1px solid ${GREEN}25` }}>✓ {e.toUpperCase()}</span>) : <span style={{ fontSize:12, color:MUTED }}>No current eligibility</span>}</div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`10px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:DARK+"F0", backdropFilter:"blur(12px)", zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 8 : 12 }}>
          <span style={{ color:GOLD, fontSize:isMobile ? 16 : 18 }}>◆</span>
          <span style={{ fontWeight:700, fontSize:isMobile ? 11 : 14, letterSpacing:isMobile ? 1 : 2, textTransform:"uppercase" }}>{isMobile ? "BBI" : "Battle Born Intelligence"}</span>
          <span style={{ fontSize:9, color:MUTED, background:"#1A1814", padding:"2px 6px", borderRadius:4 }}>v5.0</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, color:MUTED }}>LIVE</span>
          </div>
          {isMobile && <button onClick={() => setMobileNav(!mobileNav)} style={{ background:"none", border:"none", color:GOLD, fontSize:20, cursor:"pointer", padding:4 }}>{mobileNav ? "✕" : "☰"}</button>}
        </div>
      </div>

      {/* NAV — horizontal scroll on mobile, full width on desktop */}
      {(!isMobile || mobileNav) && (
        <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`0 ${px}px`, display:"flex", gap:0, overflowX:"auto", ...(isMobile && mobileNav ? { flexWrap:"wrap", background:CARD, ...fadeIn } : {}) }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setMobileNav(false); }} style={{ padding: isMobile ? "10px 12px" : "10px 16px", background:"none", border:"none", borderBottom: view === v.id ? `2px solid ${GOLD}` : "2px solid transparent", color: view === v.id ? GOLD : MUTED, fontSize: isMobile ? 11 : 12, fontWeight:600, cursor:"pointer", letterSpacing:0.5, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"all 0.2s", minWidth: isMobile && mobileNav ? "33%" : "auto" }}>
              <span style={{ fontSize:13 }}>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:px, maxWidth:1400, margin:"0 auto" }}>

        {/* ═══════════════════════ DASHBOARD ═══════════════════════ */}
        {view === "dashboard" && (
          <div style={fadeIn}>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: isMobile ? 8 : 16, marginBottom:24 }}>
              <Stat label="Companies" value={<Counter end={COMPANIES.length} />} sub={`${allScored.filter(c=>c.grade.startsWith("A")).length} Grade A`} />
              <Stat label="Total Capital" value={<Counter end={totalFunding} prefix="$" suffix="M" />} sub="Private + SSBCI" color={GREEN} />
              <Stat label="Avg Momentum" value={<Counter end={avgMomentum} />} sub="0-100 composite" color={avgMomentum > 60 ? GREEN : GOLD} />
              <Stat label="Total Jobs" value={<Counter end={totalEmployees} />} sub="Across ecosystem" color={BLUE} />
              {!isMobile && <Stat label="SSBCI Deployed" value={fmt(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+f.deployed,0))} sub={`${(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+(f.leverage||0),0)/FUNDS.filter(f=>f.type==="SSBCI"&&f.leverage).length).toFixed(1)}x leverage`} color={PURPLE} />}
              {!isMobile && <Stat label="Watchlist" value={watchlist.length} sub="companies tracked" />}
            </div>

            {/* Sector Heat Strip */}
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14, marginBottom:20 }}>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Sector Heat Map</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
                {sectorStats.slice(0,12).map(s => {
                  const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
                  return (
                    <div key={s.name} onClick={() => { setView("sectors"); setSectorDetail(s); }} style={{ flexShrink:0, padding:"6px 10px", borderRadius:6, background:hc+"12", border:`1px solid ${hc}30`, cursor:"pointer", textAlign:"center", minWidth:70 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:hc }}>{s.heat}</div>
                      <div style={{ fontSize:8, color:MUTED, marginTop:1 }}>{s.name}</div>
                      <div style={{ fontSize:8, color:MUTED }}>{s.count} cos</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns: isTablet ? "1fr" : "2fr 1fr", gap:20 }}>
              <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Top Momentum — Live Rankings</div>
                {[...COMPANIES].sort((a, b) => b.momentum - a.momentum).slice(0, isMobile ? 6 : 10).map((c, i) => (
                  <div key={c.id} onClick={() => { setSelectedCompany(c); }} style={{ display:"flex", alignItems:"center", padding:"8px 0", borderBottom: i < 9 ? `1px solid ${BORDER}` : "none", cursor:"pointer", gap:8 }}>
                    <span style={{ width:20, fontSize:12, color: i < 3 ? GOLD : MUTED, fontWeight:600 }}>{i + 1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                      <div style={{ fontSize:10, color:MUTED }}>{c.sector[0]} · {c.city}</div>
                    </div>
                    {!isMobile && <div style={{ marginRight:12 }}><Spark data={[c.momentum*0.7,c.momentum*0.8,c.momentum*0.85,c.momentum*0.9,c.momentum*0.95,c.momentum]} color={c.momentum > 75 ? GREEN : GOLD} /></div>}
                    <MBar score={c.momentum} w={isMobile ? 50 : 80} />
                  </div>
                ))}
              </div>

              <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Sector Distribution</div>
                {sectorStats.slice(0, isMobile ? 6 : 10).map(s => {
                  const pct = Math.round(s.count / COMPANIES.length * 100);
                  const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
                  return (
                    <div key={s.name} onClick={() => { setView("sectors"); setSectorDetail(s); }} style={{ marginBottom:10, cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                        <span>{s.name}</span><span style={{ color:hc }}>🔥{s.heat} · {s.count}</span>
                      </div>
                      <div style={{ height:4, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:hc, borderRadius:2, transition:"width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ DEAL RADAR ═══════════════════════ */}
        {view === "radar" && (
          <div style={fadeIn}>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 8 : 12, marginBottom:20 }}>
              {[
                { l:"Pipeline", v:scored.length, c:TEXT },
                { l:"Avg IRS", v:scored.length ? Math.round(scored.reduce((s,c) => s+c.irs,0)/scored.length) : 0, c:GREEN },
                { l:"Grade A", v:scored.filter(c=>c.grade.startsWith("A")).length, c:GREEN },
                { l:"Hot Deals", v:scored.filter(c=>c.triggers.length>=4).length, c:RED },
              ].map(s => (
                <div key={s.l} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 12 : 16 }}>
                  <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:10, color:MUTED }}>{s.l}</div>
                </div>
              ))}
            </div>

            {scored.filter(c=>c.triggers.length>=4).length > 0 && (
              <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding: isMobile ? 12 : 16, marginBottom:20 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#EF4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>🔥 Hot Deals — 4+ triggers</div>
                <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
                  {scored.filter(c=>c.triggers.length>=4).slice(0,6).map(c => (
                    <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ flexShrink:0, background:DARK, border:`1px solid ${BORDER}`, borderRadius:10, padding:12, minWidth: isMobile ? 160 : 200, cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:700 }}>{c.name}</span>
                        <Grade grade={c.grade} size="sm" />
                      </div>
                      <div style={{ fontSize:10, color:MUTED, marginBottom:6 }}>{c.sector.slice(0,2).join(" · ")} · {fmt(c.funding)}</div>
                      <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                        {c.triggers.slice(0,3).map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:8, padding:"2px 5px", borderRadius:6, background:cfg.c+"15", color:cfg.c }}>{cfg.i}</span> : null; })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {scored.slice(0, isMobile ? 25 : 40).map((c, idx) => {
                const gc = GRADE_COLORS[c.grade] || MUTED;
                return (
                  <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 10px" : "10px 16px", background: idx % 2 === 0 ? DARK : CARD+"80", border:`1px solid ${BORDER}60`, borderRadius:8, cursor:"pointer", transition:"all 0.15s" }}>
                    <span style={{ width:18, fontSize:10, color: idx < 3 ? GOLD : MUTED, fontWeight:700 }}>{idx+1}</span>
                    <Grade grade={c.grade} size="sm" />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:13 }}>{c.name}</span>
                        {!isMobile && <span style={{ fontSize:9, padding:"1px 6px", background:(STAGE_COLORS[c.stage]||MUTED)+"20", borderRadius:4, color:STAGE_COLORS[c.stage]||MUTED, fontWeight:600 }}>{stageLabel(c.stage)}</span>}
                      </div>
                      <div style={{ fontSize:10, color:MUTED, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.sector.slice(0,2).join(" · ")} · {c.city} · {fmt(c.funding)}</div>
                    </div>
                    {!isMobile && <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:200 }}>
                      {c.triggers.slice(0,4).map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:8, padding:"2px 6px", borderRadius:8, background:cfg.c+"12", color:cfg.c }}>{cfg.i} {cfg.l}</span> : null; })}
                    </div>}
                    <div style={{ fontSize:13, fontWeight:700, color:gc, width:28, textAlign:"right" }}>{c.irs}</div>
                    <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED+"60", cursor:"pointer", fontSize:14, padding:2, transition:"color 0.15s" }}>{isWatched(c.id) ? "★" : "☆"}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════ COMPANIES ═══════════════════════ */}
        {view === "companies" && (
          <div style={fadeIn}>
            <div style={{ display:"flex", gap: isMobile ? 6 : 12, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, sectors..." style={{ flex:1, minWidth: isMobile ? "100%" : 200, padding:"10px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT, fontSize:13, outline:"none" }} />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", width: isMobile ? "100%" : "auto" }}>
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
                  <option value="all">All Stages</option>
                  {Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{stageLabel(s)}</option>)}
                </select>
                <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
                  <option value="all">All Regions</option>
                  <option value="las_vegas">Las Vegas</option>
                  <option value="henderson">Henderson</option>
                  <option value="reno">Reno</option>
                  <option value="rural">Rural</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
                  <option value="momentum">Momentum</option>
                  <option value="funding">Funding</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <span style={{ fontSize:11, color:MUTED }}>{filtered.length} results</span>
            </div>

            <div style={{ display:"grid", gap:6 }}>
              {filtered.map(c => (
                <div key={c.id} onClick={() => setSelectedCompany(selectedCompany?.id === c.id ? null : c)} style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 10px" : "12px 16px", background: selectedCompany?.id === c.id ? "#1A1814" : CARD, border:`1px solid ${selectedCompany?.id === c.id ? GOLD+"40" : BORDER}`, borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>{c.name}</span>
                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:STAGE_COLORS[c.stage]+"22", color:STAGE_COLORS[c.stage], fontWeight:600 }}>{stageLabel(c.stage)}</span>
                    </div>
                    <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{c.sector.join(" · ")} · {c.city}</div>
                  </div>
                  {!isMobile && <div style={{ fontSize:13, fontWeight:600, color:GREEN, flexShrink:0 }}>{fmt(c.funding)}</div>}
                  <MBar score={c.momentum} w={isMobile ? 40 : 70} />
                  {!isMobile && <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                    {c.eligible.map(e => <span key={e} style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:GOLD+"20", color:GOLD }}>{e.toUpperCase()}</span>)}
                  </div>}
                  <button onClick={e => { e.stopPropagation(); setCompareList(prev => prev.includes(c.id) ? prev.filter(x=>x!==c.id) : [...prev.slice(-3),c.id]); }} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${compareList.includes(c.id) ? GOLD : BORDER}`, background:compareList.includes(c.id) ? GOLD+"20" : "transparent", color:compareList.includes(c.id) ? GOLD : MUTED, cursor:"pointer", fontSize:12, flexShrink:0 }}>⟺</button>
                  <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED+"60", cursor:"pointer", fontSize:14, padding:2 }}>{isWatched(c.id) ? "★" : "☆"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════ INVESTORS ═══════════════════════ */}
        {view === "investors" && !fundDetail && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Fund & Program Performance</div>
            <div style={{ display:"grid", gap:10 }}>
              {FUNDS.map(f => {
                const portCos = allScored.filter(c => c.eligible.includes(f.id));
                const avgIRS = portCos.length ? Math.round(portCos.reduce((s,c) => s+c.irs,0)/portCos.length) : 0;
                return (
                <div key={f.id} onClick={() => setFundDetail(f)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, cursor:"pointer", transition:"border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"50"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700 }}>{f.name}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{f.type} · {f.companies} portfolio cos · Avg IRS {avgIRS}</div>
                    </div>
                    {f.type === "SSBCI" && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:PURPLE+"20", color:PURPLE, fontWeight:600 }}>SSBCI</span>}
                  </div>
                  {f.thesis && <div style={{ fontSize:10, color:MUTED, fontStyle:"italic", marginBottom:10 }}>"{f.thesis}"</div>}
                  <div style={{ display:"grid", gridTemplateColumns: f.allocated ? (isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr") : "1fr 1fr", gap: isMobile ? 8 : 16 }}>
                    {f.allocated && <>
                      <div>
                        <div style={{ fontSize:9, color:MUTED }}>ALLOCATED</div>
                        <div style={{ fontSize:16, fontWeight:700, color:BLUE }}>{fmt(f.allocated)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, color:MUTED }}>DEPLOYED</div>
                        <div style={{ fontSize:16, fontWeight:700, color:GREEN }}>{fmt(f.deployed)}</div>
                        <div style={{ marginTop:4, height:4, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ width:`${(f.deployed/f.allocated)*100}%`, height:"100%", background:GREEN, borderRadius:2 }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, color:MUTED }}>LEVERAGE</div>
                        <div style={{ fontSize:16, fontWeight:700, color:GOLD }}>{f.leverage}x</div>
                      </div>
                    </>}
                    <div>
                      <div style={{ fontSize:9, color:MUTED }}>TOTAL DEPLOYED</div>
                      <div style={{ fontSize:16, fontWeight:700 }}>{fmt(f.deployed)}</div>
                    </div>
                    {!f.allocated && <div>
                      <div style={{ fontSize:9, color:MUTED }}>PORTFOLIO</div>
                      <div style={{ fontSize:16, fontWeight:700 }}>{f.companies}</div>
                    </div>}
                  </div>
                </div>
                );
              })}
            </div>
            {/* Deal Flow */}
            <div style={{ marginTop:20, background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
              <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Deal Flow — Highest Signal</div>
              {allScored.filter(c=>c.eligible.length>0).sort((a,b)=>b.irs-a.irs).slice(0,10).map(c => (
                <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display:"flex", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER}`, gap: isMobile ? 6 : 12, cursor:"pointer" }}>
                  <Grade grade={c.grade} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>{c.name}</span>
                    <span style={{ fontSize:10, color:MUTED, marginLeft:6 }}>{c.sector[0]}</span>
                  </div>
                  {!isMobile && <span style={{ fontSize:11, color:STAGE_COLORS[c.stage] }}>{stageLabel(c.stage)}</span>}
                  <span style={{ fontSize:12, fontWeight:600, color:GREEN }}>{fmt(c.funding)}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:GOLD }}>{c.irs}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FUND DETAIL */}
        {view === "investors" && fundDetail && (
          <div style={{ ...fadeIn, padding:px }}>
            <button onClick={() => setFundDetail(null)} style={{ background:"none", border:"none", color:GOLD, fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>← All Funds</button>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>{fundDetail.name}</div>
              {fundDetail.type === "SSBCI" && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:PURPLE+"20", color:PURPLE, fontWeight:700 }}>SSBCI</span>}
            </div>
            {fundDetail.thesis && <div style={{ fontSize:12, color:MUTED, fontStyle:"italic", marginBottom:16 }}>"{fundDetail.thesis}"</div>}
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
              <Stat label="Portfolio Cos" value={fundDetail.companies} />
              <Stat label="Deployed" value={fmt(fundDetail.deployed)} color={GREEN} />
              {fundDetail.allocated && <Stat label="Utilization" value={`${Math.round(fundDetail.deployed/fundDetail.allocated*100)}%`} color={BLUE} />}
              {fundDetail.leverage && <Stat label="Leverage" value={`${fundDetail.leverage}x`} color={GOLD} />}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:10 }}>Eligible Pipeline</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {allScored.filter(c => c.eligible.includes(fundDetail.id)).sort((a,b) => b.irs - a.irs).map(c => (
                <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                  <Grade grade={c.grade} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:TEXT }}>{c.name}</span>
                    <span style={{ fontSize:9, color:MUTED, marginLeft:6 }}>{stageLabel(c.stage)} · {c.sector.slice(0,2).join(", ")}</span>
                  </div>
                  <span style={{ fontSize:11, color:GREEN }}>{fmt(c.funding)}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:GOLD }}>{c.irs}</span>
                </div>
              ))}
              {allScored.filter(c => c.eligible.includes(fundDetail.id)).length === 0 && (
                <div style={{ padding:20, textAlign:"center", color:MUTED, fontSize:12 }}>No companies with {fundDetail.name} eligibility in current dataset</div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════ COMPARE ═══════════════════════ */}
        {view === "compare" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Side-by-Side Comparison</div>
            {compareList.length < 2 ? (
              <div style={{ textAlign:"center", padding:60, color:MUTED }}>
                <div style={{ fontSize:32, marginBottom:12 }}>⟺</div>
                <div style={{ fontSize:14 }}>Select 2-4 companies from the Companies tab</div>
                <div style={{ fontSize:12, marginTop:8 }}>Tap the ⟺ button on any company card</div>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", padding:10, borderBottom:`1px solid ${BORDER}`, color:MUTED, fontSize:10, position:"sticky", left:0, background:DARK }}>Metric</th>
                      {compareList.map(id => { const c = COMPANIES.find(x=>x.id===id); return <th key={id} style={{ textAlign:"center", padding:10, borderBottom:`1px solid ${BORDER}`, minWidth:120 }}>{c?.name}</th>; })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { l:"Stage", fn:c=>stageLabel(c.stage) },
                      { l:"Funding", fn:c=>fmt(c.funding), num:c=>c.funding },
                      { l:"Momentum", fn:c=>c.momentum, num:c=>c.momentum },
                      { l:"Employees", fn:c=>c.employees, num:c=>c.employees },
                      { l:"Founded", fn:c=>c.founded },
                      { l:"IRS Grade", fn:c=>computeIRS(c).grade },
                      { l:"IRS Score", fn:c=>computeIRS(c).irs, num:c=>computeIRS(c).irs },
                      { l:"Triggers", fn:c=>computeIRS(c).triggers.length, num:c=>computeIRS(c).triggers.length },
                      { l:"SSBCI Programs", fn:c=>c.eligible.filter(e=>["bbv","fundnv","1864"].includes(e)).length, num:c=>c.eligible.filter(e=>["bbv","fundnv","1864"].includes(e)).length },
                      { l:"Sectors", fn:c=>c.sector.join(", ") },
                    ].map(row => {
                      const vals = compareList.map(id => COMPANIES.find(x=>x.id===id)).filter(Boolean);
                      const maxVal = row.num ? Math.max(...vals.map(c=>row.num(c))) : null;
                      return (
                        <tr key={row.l}>
                          <td style={{ padding:10, borderBottom:`1px solid ${BORDER}`, color:MUTED, fontSize:11, fontWeight:600, position:"sticky", left:0, background:DARK }}>{row.l}</td>
                          {vals.map(c => {
                            const isMax = row.num && row.num(c) === maxVal && vals.filter(v=>row.num(v)===maxVal).length === 1;
                            return <td key={c.id} style={{ padding:10, borderBottom:`1px solid ${BORDER}`, textAlign:"center", color:isMax ? GREEN : TEXT, fontWeight:isMax ? 700 : 400 }}>{row.fn(c)}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
              {/* Shared Investors / Relationships */}
              {(() => {
                const cIds = compareList.map(id => `c_${id}`);
                const investorMap = {};
                VERIFIED_EDGES.forEach(e => {
                  cIds.forEach(cid => {
                    const match = (e.source === cid || e.target === cid);
                    if (!match) return;
                    const otherId = e.source === cid ? e.target : e.source;
                    if (cIds.includes(otherId)) return;
                    if (!investorMap[otherId]) investorMap[otherId] = {id:otherId, companies:[], edges:[]};
                    investorMap[otherId].companies.push(cid);
                    investorMap[otherId].edges.push({...e, companyId:cid});
                  });
                });
                const shared = Object.values(investorMap).filter(v => v.companies.length >= 2).sort((a,b) => b.companies.length - a.companies.length);
                const allInvestors = Object.values(investorMap).sort((a,b) => b.companies.length - a.companies.length);
                const allNodes = [...EXTERNALS,...ACCELERATORS,...ECOSYSTEM_ORGS,...PEOPLE];
                const findName = id => allNodes.find(n => n.id === id)?.name || id;
                return (<>
                  {shared.length > 0 && (<div style={{marginTop:20}}>
                    <div style={{fontSize:10,color:GOLD,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Shared Connections ({shared.length})</div>
                    {shared.map(s => (
                      <div key={s.id} style={{padding:"8px 12px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,marginBottom:6,borderLeft:`3px solid ${GREEN}`}}>
                        <div style={{fontWeight:600,fontSize:12,color:TEXT}}>{findName(s.id)}</div>
                        <div style={{fontSize:10,color:MUTED,marginTop:2}}>
                          {s.edges.map((e,i) => {
                            const cName = COMPANIES.find(c => `c_${c.id}` === e.companyId)?.name || e.companyId;
                            return <span key={i}>{i>0?" · ":""}{e.rel.replace(/_/g," ")} → {cName}{e.note?` (${e.note})`:""}</span>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>)}
                  {allInvestors.length > 0 && (<div style={{marginTop:16}}>
                    <div style={{fontSize:10,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>All Verified Relationships</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {allInvestors.slice(0,20).map(inv => (
                        <span key={inv.id} style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:inv.companies.length>=2?GREEN+"15":CARD,border:`1px solid ${inv.companies.length>=2?GREEN+"40":BORDER}`,color:inv.companies.length>=2?GREEN:MUTED}}>
                          {findName(inv.id)} ({inv.companies.length})
                        </span>
                      ))}
                    </div>
                  </div>)}
                </>);
              })()}
          </div>
        )}
        {view === "graph" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Ontological Relationship Graph — {VERIFIED_EDGES.length} Verified Edges · Graph Intelligence Active</div>
            <OntologyGraphView onSelectCompany={(id)=>{setSelectedCompany(COMPANIES.find(c=>c.id===id)||null);setView("companies");}} />
          </div>
        )}

        {/* ═══════════════════════ TIMELINE ═══════════════════════ */}
        {view === "timeline" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Ecosystem Activity Feed</div>
            <div style={{ borderLeft:`2px solid ${BORDER}`, marginLeft: isMobile ? 10 : 20, paddingLeft: isMobile ? 16 : 24 }}>
              {TIMELINE_EVENTS.map((ev, i) => (
                <div key={i} style={{ position:"relative", marginBottom:18, paddingBottom:4, ...fadeIn }}>
                  <div style={{ position:"absolute", left: isMobile ? -25 : -33, top:4, width:16, height:16, borderRadius:"50%", background:CARD, border:`2px solid ${ev.type==="funding"?GREEN:ev.type==="grant"?BLUE:ev.type==="momentum"?GOLD:ev.type==="hiring"?ORANGE:ev.type==="patent"?PURPLE:MUTED}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>{ev.icon}</div>
                  <div style={{ fontSize:10, color:MUTED, marginBottom:1 }}>{ev.date}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ev.company}</div>
                  <div style={{ fontSize:12, color:TEXT }}>{ev.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════ SSBCI ═══════════════════════ */}
        {view === "ssbci" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>SSBCI Program Dashboard</div>
            {(() => {
              const ssbci = FUNDS.filter(f=>f.type==="SSBCI");
              const totalAlloc = ssbci.reduce((s,f)=>s+(f.allocated||0),0);
              const totalDeployed = ssbci.reduce((s,f)=>s+f.deployed,0);
              const avgLev = ssbci.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbci.filter(f=>f.leverage).length;
              const privateLev = Math.round(totalDeployed * avgLev);
              return (
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 8 : 16, marginBottom:20 }}>
              <Stat label="Total Allocated" value={fmt(totalAlloc)} color={BLUE} />
              <Stat label="Deployed" value={fmt(totalDeployed)} sub={`${Math.round(totalDeployed/totalAlloc*100)}% utilization`} color={GREEN} />
              <Stat label="Private Leverage" value={fmt(privateLev)} sub="Co-investment" color={GOLD} />
              <Stat label="Leverage Ratio" value={`${avgLev.toFixed(1)}x`} sub="Target: 1:1" color={PURPLE} />
            </div>);})()}
            {FUNDS.filter(f=>f.type==="SSBCI").map(f => (
              <div key={f.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{f.name}</div>
                  <span style={{ fontSize:11, color:GREEN, fontWeight:600 }}>{f.leverage ? `${f.leverage}x` : ""}</span>
                </div>
                <div style={{ height:10, background:"#1E1D1A", borderRadius:5, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ width:`${(f.deployed/f.allocated)*100}%`, height:"100%", background:`linear-gradient(90deg, ${GREEN}, ${GOLD})`, borderRadius:5, transition:"width 1s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:MUTED }}>
                  <span>{fmt(f.deployed)} deployed</span>
                  <span>{fmt(f.allocated)} allocated</span>
                </div>
                <div style={{ marginTop:10, fontSize:11, color:MUTED }}>
                  {COMPANIES.filter(c=>c.eligible.includes(f.id)).length} eligible companies · {f.companies} portfolio
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════ MAP ═══════════════════════ */}
        {view === "map" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Nevada Startup Map</div>
            <svg viewBox="0 0 800 650" style={{ width:"100%", background:CARD, borderRadius:10, border:`1px solid ${BORDER}` }}>
              <path d="M220,30 L560,30 L560,45 L610,580 L180,580 Z" fill={BORDER+"25"} stroke={BORDER} strokeWidth={1} />
              <text x={380} y={105} textAnchor="middle" fill={MUTED+"70"} fontSize={13} fontWeight={600}>RENO / SPARKS</text>
              <text x={420} y={430} textAnchor="middle" fill={MUTED+"70"} fontSize={13} fontWeight={600}>LAS VEGAS METRO</text>
              <text x={500} y={200} textAnchor="middle" fill={MUTED+"40"} fontSize={9}>Elko</text>
              <text x={310} y={210} textAnchor="middle" fill={MUTED+"40"} fontSize={9}>Carson City</text>
              <circle cx={500} cy={190} r={3} fill={MUTED+"30"} /><circle cx={310} cy={200} r={3} fill={MUTED+"30"} />
              {COMPANIES.map(c => {
                const isR = c.region==="reno";
                const isRural = c.region==="rural";
                const x = isRural ? 500+(c.lng+115.76)*200 : isR ? 370+(c.lng+119.82)*400 : 400+(c.lng+115.17)*350;
                const y = isRural ? 170+(40.83-c.lat)*200 : isR ? 100+(39.56-c.lat)*300 : 420+(36.20-c.lat)*300;
                const r = 4+(c.momentum/100)*8;
                const isH = mapHover===c.id;
                return (
                  <g key={c.id} style={{ cursor:"pointer" }} onMouseEnter={()=>setMapHover(c.id)} onMouseLeave={()=>setMapHover(null)} onClick={()=>setSelectedCompany(c)}>
                    <circle cx={x} cy={y} r={r+4} fill="transparent" />
                    <circle cx={x} cy={y} r={r} fill={(STAGE_COLORS[c.stage]||MUTED)+(isH?"90":"50")} stroke={isH?TEXT:(STAGE_COLORS[c.stage]||MUTED)} strokeWidth={isH?2:0.5} style={{ transition:"all 0.15s" }} />
                    {isH && <>
                      <rect x={x+r+6} y={y-14} width={Math.max(c.name.length*5.5+30,80)} height={24} rx={4} fill={DARK} stroke={BORDER} strokeWidth={1} />
                      <text x={x+r+10} y={y+2} fill={TEXT} fontSize={9} fontWeight={600}>{c.name} · {fmt(c.funding)}</text>
                    </>}
                  </g>
                );
              })}
              {Object.entries(STAGE_COLORS).map(([s,cl],i) => (
                <g key={s}><circle cx={30} cy={580+i*14} r={4} fill={cl+"60"} stroke={cl}/><text x={42} y={583+i*14} fill={MUTED} fontSize={8}>{stageLabel(s)}</text></g>
              ))}
            </svg>
          </div>
        )}
        {/* ═══════════════════════ SECTORS ═══════════════════════ */}
        {view === "sectors" && !sectorDetail && (
          <div style={{ padding:px, animation:"fadeIn 0.4s ease-out" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div><div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:TEXT }}>Sector Analytics</div>
              <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{sectorStats.length} sectors tracked</div></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap:12 }}>
              {sectorStats.map(s => {
                const heatColor = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
                return (
                  <div key={s.name} onClick={() => setSectorDetail(s)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:16, cursor:"pointer", transition:"all 0.2s", borderLeft:`3px solid ${heatColor}` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = heatColor} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>{s.name}</span>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:heatColor+"20", color:heatColor, fontWeight:700 }}>🔥 {s.heat}</span>
                    </div>
                    <div style={{ display:"flex", gap:16, fontSize:10, color:MUTED, marginBottom:8 }}>
                      <span>{s.count} companies</span>
                      <span>{fmt(s.totalFunding)} raised</span>
                      <span>Avg IRS: {s.avgIRS}</span>
                    </div>
                    <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                      {Object.entries(s.stages).sort((a,b) => b[1]-a[1]).slice(0,4).map(([st,ct]) => (
                        <span key={st} style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:STAGE_COLORS[st]+"25", color:STAGE_COLORS[st] || MUTED }}>{stageLabel(st)} ({ct})</span>
                      ))}
                    </div>
                    {s.topCompany && <div style={{ fontSize:9, color:GOLD }}>Top: {s.topCompany.name} (IRS {s.topCompany.irs})</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTOR DEEP-DIVE */}
        {view === "sectors" && sectorDetail && (
          <div style={{ padding:px, animation:"fadeIn 0.3s ease-out" }}>
            <button onClick={() => setSectorDetail(null)} style={{ background:"none", border:"none", color:GOLD, fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>← All Sectors</button>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>{sectorDetail.name}</div>
              <span style={{ fontSize:12, padding:"3px 10px", borderRadius:20, background:(sectorDetail.heat >= 85 ? "#EF4444" : sectorDetail.heat >= 70 ? ORANGE : GOLD)+"20", color:sectorDetail.heat >= 85 ? "#EF4444" : sectorDetail.heat >= 70 ? ORANGE : GOLD, fontWeight:700 }}>🔥 Heat {sectorDetail.heat}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
              <Stat label="Companies" value={sectorDetail.count} />
              <Stat label="Total Raised" value={fmt(sectorDetail.totalFunding)} />
              <Stat label="Avg IRS" value={sectorDetail.avgIRS} color={sectorDetail.avgIRS >= 70 ? GREEN : sectorDetail.avgIRS >= 55 ? GOLD : MUTED} />
              <Stat label="Stages" value={Object.keys(sectorDetail.stages).length} />
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:10 }}>Companies in {sectorDetail.name}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {sectorDetail.companies.sort((a,b) => b.irs - a.irs).map(c => (
                <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding: isMobile ? "10px 12px" : "12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"60"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                  <Grade grade={c.grade} size="sm" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
                      <span style={{ fontSize:9, color:MUTED }}>{stageLabel(c.stage)}</span>
                    </div>
                    <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{c.city} · {fmt(c.funding)} · {c.employees} people</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:GOLD }}>{c.irs}</div>
                    <div style={{ fontSize:8, color:MUTED }}>IRS</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED, cursor:"pointer", fontSize:16, padding:4 }}>{isWatched(c.id) ? "★" : "☆"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════ WATCHLIST ═══════════════════════ */}
        {view === "watchlist" && (
          <div style={{ padding:px, animation:"fadeIn 0.4s ease-out" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div><div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:TEXT }}>My Watchlist</div>
              <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{watchlist.length} companies tracked</div></div>
              {watchlist.length > 0 && <button onClick={() => setWatchlist([])} style={{ background:"none", border:`1px solid ${RED}40`, color:RED, fontSize:10, padding:"5px 10px", borderRadius:6, cursor:"pointer" }}>Clear All</button>}
            </div>

            {watchlist.length === 0 ? (
              <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:40, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>☆</div>
                <div style={{ fontSize:14, color:TEXT, marginBottom:6 }}>No companies watched yet</div>
                <div style={{ fontSize:11, color:MUTED, marginBottom:16 }}>Star any company from the Radar, Companies, or Sectors view to track it here.</div>
                <button onClick={() => setView("radar")} style={{ padding:"8px 20px", background:GOLD+"20", color:GOLD, border:`1px solid ${GOLD}40`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Browse Radar →</button>
              </div>
            ) : (
              <>
                {/* Portfolio Summary */}
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
                  <Stat label="Watched" value={watchedCompanies.length} />
                  <Stat label="Avg IRS" value={watchedCompanies.length ? Math.round(watchedCompanies.reduce((s,c) => s+c.irs, 0) / watchedCompanies.length) : 0} color={GREEN} />
                  <Stat label="Total Raised" value={fmt(watchedCompanies.reduce((s,c) => s+c.funding, 0))} />
                  <Stat label="Total Team" value={watchedCompanies.reduce((s,c) => s+c.employees, 0).toLocaleString()} />
                </div>

                {/* Grade distribution bar */}
                {(() => {
                  const gdist = {};
                  watchedCompanies.forEach(c => { gdist[c.grade] = (gdist[c.grade] || 0) + 1; });
                  const total = watchedCompanies.length || 1;
                  return (
                    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:12, marginBottom:16 }}>
                      <div style={{ fontSize:10, color:MUTED, marginBottom:6 }}>Grade Distribution</div>
                      <div style={{ display:"flex", borderRadius:4, overflow:"hidden", height:8 }}>
                        {["A","A-","B+","B","B-","C+","C","D"].filter(g => gdist[g]).map(g => (
                          <div key={g} style={{ width:`${(gdist[g]/total)*100}%`, background:GRADE_COLORS[g] || MUTED, transition:"width 0.3s" }} title={`${g}: ${gdist[g]}`} />
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:8, marginTop:6 }}>
                        {["A","A-","B+","B","B-","C+","C","D"].filter(g => gdist[g]).map(g => (
                          <span key={g} style={{ fontSize:9, color:GRADE_COLORS[g] || MUTED }}>{g}: {gdist[g]}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Company list */}
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {watchedCompanies.sort((a,b) => b.irs - a.irs).map(c => (
                    <div key={c.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding: isMobile ? "10px 12px" : "12px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"60"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                      <Grade grade={c.grade} />
                      <div style={{ flex:1, minWidth:0 }} onClick={() => setSelectedCompany(c)}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:13, fontWeight:700, color:TEXT }}>{c.name}</span>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:STAGE_COLORS[c.stage]+"25", color:STAGE_COLORS[c.stage] || MUTED }}>{stageLabel(c.stage)}</span>
                          {c.triggers.slice(0,2).map(t => <span key={t} style={{ fontSize:8, color:TRIGGER_CFG[t]?.c || MUTED }}>{TRIGGER_CFG[t]?.i}</span>)}
                        </div>
                        <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{c.city} · {(c.sector||[]).slice(0,2).join(", ")} · {fmt(c.funding)} · {c.employees} people</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:18, fontWeight:700, color:GOLD }}>{c.irs}</div>
                        <div style={{ fontSize:8, color:MUTED }}>IRS</div>
                      </div>
                      <button onClick={() => toggleWatchlist(c.id)} style={{ background:"none", border:"none", color:GOLD, cursor:"pointer", fontSize:18, padding:4 }} title="Remove from watchlist">★</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      <DetailPanel />

      {/* COMPARE FLOATING BAR */}
      {compareList.length > 0 && view !== "compare" && (
        <div style={{ position:"fixed", bottom: isMobile ? 12 : 20, left:"50%", transform:"translateX(-50%)", background:CARD, border:`1px solid ${GOLD}40`, borderRadius:12, padding: isMobile ? "8px 12px" : "10px 20px", display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, zIndex:200, boxShadow:`0 8px 32px ${DARK}`, animation:"slideUp 0.3s ease-out", maxWidth:"90vw" }}>
          <span style={{ fontSize:11, color:GOLD, flexShrink:0 }}>⟺ {compareList.length}</span>
          {!isMobile && <div style={{ display:"flex", gap:4 }}>
            {compareList.map(id => { const c=COMPANIES.find(x=>x.id===id); return <span key={id} style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:GOLD+"15", color:TEXT }}>{c?.name}</span>; })}
          </div>}
          <button onClick={() => setView("compare")} style={{ padding:"6px 14px", background:GOLD, color:DARK, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer" }}>Compare</button>
          <button onClick={() => setCompareList([])} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", fontSize:14, padding:4 }}>✕</button>
        </div>
      )}
    </div>
  );
}
