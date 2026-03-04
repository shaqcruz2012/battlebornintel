import initSqlJs from "sql.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "bbi.db");
const schemaPath = join(__dirname, "schema.sql");

const SQL = await initSqlJs();
const db = new SQL.Database();
db.exec(readFileSync(schemaPath, "utf8"));

// ── DATA ──

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

const GRAPH_FUNDS = [
{id:"bbv",name:"Battle Born Venture",type:"SSBCI"},{id:"fundnv",name:"FundNV",type:"SSBCI"},
{id:"1864",name:"1864 Fund",type:"SSBCI"},{id:"sbir",name:"SBIR/STTR",type:"Federal"},
{id:"angelnv",name:"AngelNV",type:"Angel"},{id:"sierra",name:"Sierra Angels",type:"Angel"},
];

const PEOPLE = [
{id:"p_straubel",name:"JB Straubel",role:"Founder/CEO",companyId:1,note:"Tesla co-founder"},
{id:"p_reynolds",name:"Ryan Reynolds",role:"CCO",companyId:9,note:"Chief Creative Officer"},
{id:"p_kurtzer",name:"Gregory Kurtzer",role:"Founder",companyId:11,note:"CentOS/Rocky Linux creator"},
{id:"p_barron",name:"Maryssa Barron",role:"Founder/CEO",companyId:63,note:"AngelNV 2025 winner"},
{id:"p_tomasik",name:"Piotr Tomasik",role:"Founder",companyId:4,note:"AMD GPU cloud pioneer"},
{id:"p_saling",name:"Jeff Saling",role:"Exec Director",companyId:null,note:"StartUpNV co-founder, FundNV GP"},
];

const EXTERNALS = [
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

const ACCELERATORS = [
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

const ECOSYSTEM_ORGS = [
{id:"e_goed",name:"NV GOED",etype:"Government",city:"Carson City",region:"reno",note:"Governor's Office of Economic Development. Manages SSBCI, Knowledge Fund (university IP→market), Battle Born Growth accelerators. Funds gener8tor, StartUpNV, Zero Labs."},
{id:"e_edawn",name:"EDAWN",etype:"Economic Development",city:"Reno",region:"reno",note:"Economic Development Authority of Western Nevada."},
{id:"e_lvgea",name:"LVGEA",etype:"Economic Development",city:"Las Vegas",region:"las_vegas",note:"Las Vegas Global Economic Alliance."},
{id:"e_innevation",name:"UNR Innevation Center",etype:"University Hub",city:"Reno",region:"reno",note:"UNR coworking/incubator. Hosts InNEVator + gener8tor Reno."},
{id:"e_unlvtech",name:"UNLV Tech Park",etype:"University Hub",city:"Las Vegas",region:"las_vegas",note:"Harry Reid Research & Technology Park. 122 acres."},
];

const LISTINGS = [
{companyId:12,exchange:"Nasdaq",ticker:"SBIG"},{companyId:27,exchange:"Nasdaq",ticker:"MYPS"},
{companyId:28,exchange:"NYSE",ticker:"EVRI"},{companyId:33,exchange:"NYSE",ticker:"LODE"},
{companyId:49,exchange:"ASX",ticker:"INR"},{companyId:50,exchange:"Nasdaq",ticker:"DFLI"},
{companyId:54,exchange:"Nasdaq",ticker:"GAN"},{companyId:55,exchange:"Nasdaq",ticker:"NXGL"},
{companyId:65,exchange:"Nasdaq",ticker:"SSNT"},{companyId:67,exchange:"OTC",ticker:"PLNHF"},
{companyId:71,exchange:"TSX",ticker:"JP"},{companyId:73,exchange:"NYSE",ticker:"AQMS"},
{companyId:74,exchange:"NYSE",ticker:"ORA"},{companyId:75,exchange:"Nasdaq",ticker:"NVEE"},
];

const VERIFIED_EDGES = [
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

// ── SEED FUNCTIONS ──

function seedCompanies(companies) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT OR REPLACE INTO companies (id, name, stage, sectors, city, region, funding, momentum, employees, founded, description, eligible, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const c of companies) {
    stmt.bind([c.id, c.name, c.stage, JSON.stringify(c.sector), c.city, c.region, c.funding, c.momentum, c.employees, c.founded, c.description, JSON.stringify(c.eligible), c.lat, c.lng]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  db.exec("COMMIT");
  console.log(`Seeded ${companies.length} companies`);
}

function seedFunds(funds) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT OR REPLACE INTO funds (id, name, type, allocated, deployed, leverage, companies, thesis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const f of funds) {
    stmt.bind([f.id, f.name, f.type, f.allocated, f.deployed, f.leverage, f.companies, f.thesis]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  db.exec("COMMIT");
  console.log(`Seeded ${funds.length} funds`);
}

function seedEntities(graphFunds, people, externals, accelerators, ecosystemOrgs) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT OR REPLACE INTO entities (id, name, category, etype, atype, role, city, region, founded, company_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const f of graphFunds) { stmt.bind([f.id, f.name, "graph_fund", null, null, null, null, null, null, null, f.type]); stmt.step(); stmt.reset(); }
  for (const p of people) { stmt.bind([p.id, p.name, "person", null, null, p.role, null, null, null, p.companyId, p.note]); stmt.step(); stmt.reset(); }
  for (const x of externals) { stmt.bind([x.id, x.name, "external", x.etype, null, null, null, null, null, null, x.note]); stmt.step(); stmt.reset(); }
  for (const a of accelerators) { stmt.bind([a.id, a.name, "accelerator", null, a.atype, null, a.city, a.region, a.founded, null, a.note]); stmt.step(); stmt.reset(); }
  for (const o of ecosystemOrgs) { stmt.bind([o.id, o.name, "ecosystem", o.etype, null, null, o.city, o.region, null, null, o.note]); stmt.step(); stmt.reset(); }
  stmt.free();
  db.exec("COMMIT");
  const total = graphFunds.length + people.length + externals.length + accelerators.length + ecosystemOrgs.length;
  console.log(`Seeded ${total} entities`);
}

function seedEdges(edges) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT INTO edges (source, target, rel, note, year) VALUES (?, ?, ?, ?, ?)`);
  for (const e of edges) {
    stmt.bind([e.source, e.target, e.rel, e.note, e.y || null]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  db.exec("COMMIT");
  console.log(`Seeded ${edges.length} edges`);
}

function seedTimeline(events) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT INTO timeline_events (date, type, company, detail, icon) VALUES (?, ?, ?, ?, ?)`);
  for (const e of events) {
    stmt.bind([e.date, e.type, e.company, e.detail, e.icon]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  db.exec("COMMIT");
  console.log(`Seeded ${events.length} timeline events`);
}

function seedListings(listings) {
  db.exec("BEGIN");
  const stmt = db.prepare(`INSERT OR REPLACE INTO listings (company_id, exchange, ticker) VALUES (?, ?, ?)`);
  for (const l of listings) {
    stmt.bind([l.companyId, l.exchange, l.ticker]);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  db.exec("COMMIT");
  console.log(`Seeded ${listings.length} listings`);
}

// ── RUN SEED ──
console.log("Seeding BBI database...");
db.exec("DELETE FROM companies; DELETE FROM funds; DELETE FROM entities; DELETE FROM edges; DELETE FROM timeline_events; DELETE FROM listings;");
seedCompanies(COMPANIES);
seedFunds(FUNDS);
seedEntities(GRAPH_FUNDS, PEOPLE, EXTERNALS, ACCELERATORS, ECOSYSTEM_ORGS);
seedEdges(VERIFIED_EDGES);
seedTimeline(TIMELINE_EVENTS);
seedListings(LISTINGS);
writeFileSync(dbPath, Buffer.from(db.export()));
console.log("Done! Database at:", dbPath);
db.close();
