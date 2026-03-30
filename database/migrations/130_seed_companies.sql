-- Migration 130: Seed all 127 companies from frontend static data
-- Source: frontend/src/data/companies.js
-- Generated: 2026-03-30

BEGIN;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (1, 'Redwood Materials', 'redwood-materials', 'growth', ARRAY['Cleantech','Energy','Manufacturing'], 'Carson City', 'reno', 4170, 88, 1200, 2017, 'Battery recycling and materials for EVs. Founded by Tesla co-founder JB Straubel. $6B+ valuation. DOE $2B loan. Campuses in NV and SC.', ARRAY['bbv'], 39.16, -119.77)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (2, 'Socure', 'socure', 'series_c_plus', ARRAY['AI','Fintech','Identity'], 'Incline Village', 'reno', 744, 90, 450, 2012, 'Digital identity verification and fraud prevention. $4.5B valuation. Serves 2,000+ enterprise customers including top US banks.', ARRAY['bbv'], 39.25, -119.95)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (3, 'Abnormal AI', 'abnormal-ai', 'series_c_plus', ARRAY['AI','Cybersecurity'], 'Las Vegas', 'las_vegas', 534, 92, 1200, 2018, 'AI-native email security. Behavioral AI detects socially-engineered attacks. $5.1B valuation. 2,000+ enterprise customers.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (4, 'TensorWave', 'tensorwave', 'series_a', ARRAY['AI','Cloud','Data Center'], 'Las Vegas', 'las_vegas', 147, 95, 100, 2023, 'AMD-powered GPU cloud for AI workloads. $100M Series A (largest in NV history). 8,192 MI325X GPU cluster. $100M+ ARR.', ARRAY['bbv','fundnv'], 36.16, -115.17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (5, '1047 Games', '1047-games', 'series_c_plus', ARRAY['Gaming','AI'], 'Las Vegas', 'las_vegas', 120, 72, 100, 2017, 'Game studio behind Splitgate. Founded in Stanford dorm room. Over $120M raised. Fully remote team.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (6, 'Hubble Network', 'hubble-network', 'series_b', ARRAY['IoT','Aerospace','Satellite'], 'Las Vegas', 'las_vegas', 100, 86, 46, 2021, 'Satellite-powered Bluetooth network. First BLE-to-satellite connection ever. 7 satellites in orbit. Partners with Life360/Tile (90M+ devices).', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (7, 'Boxabl', 'boxabl', 'series_a', ARRAY['Construction','Manufacturing'], 'N. Las Vegas', 'las_vegas', 75, 76, 200, 2017, 'Foldable modular housing. The Casita unfolds into a full-size room in under an hour. 100K+ reservation waitlist. Reg A+ offering.', ARRAY['bbv'], 36.24, -115.12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (8, 'Blockchains LLC', 'blockchains-llc', 'growth', ARRAY['Blockchain','Real Estate'], 'Sparks', 'reno', 60, 52, 150, 2018, 'Blockchain-based smart city on 67,000 acres in Storey County. Innovation Park. Digital governance platform development.', '{}', 39.53, -119.75)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (9, 'MNTN', 'mntn', 'series_b', ARRAY['AdTech','AI','Media'], 'Las Vegas', 'las_vegas', 35, 84, 250, 2018, 'Performance TV platform. Self-serve CTV advertising as easy as search and social. Ryan Reynolds is CCO. Fast Company Most Innovative.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (10, 'Katalyst', 'katalyst', 'series_a', ARRAY['Fitness','IoT','Biotech'], 'Las Vegas', 'las_vegas', 26, 78, 50, 2020, 'EMS fitness bodysuit. Full-body electro-muscle stimulation workout in 20 min. FDA-approved. TIME Best Inventions 2023. Series A led by Stripes.', ARRAY['bbv'], 36.06, -115.17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (11, 'CIQ', 'ciq', 'series_a', ARRAY['Cloud','Computing','Cybersecurity'], 'Las Vegas', 'las_vegas', 26, 70, 80, 2016, 'Enterprise Linux infrastructure. Commercial support for Rocky Linux. Cloud, HPC, and container solutions. Founded by Gregory Kurtzer.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (12, 'Springbig', 'springbig', 'growth', ARRAY['Cannabis','Fintech','Analytics'], 'Las Vegas', 'las_vegas', 22, 58, 100, 2017, 'Cannabis industry CRM, loyalty, and payment platform. Publicly traded (Nasdaq: SBIG). Serves 1,000+ dispensaries.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (13, 'Protect AI', 'protect-ai', 'series_b', ARRAY['AI','Cybersecurity'], 'Las Vegas', 'las_vegas', 18.5, 80, 60, 2022, 'AI and ML security platform. Helps organizations manage security risks from AI systems. Huntr bug bounty for AI.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (14, 'MagicDoor', 'magicdoor', 'seed', ARRAY['AI','Real Estate'], 'Las Vegas', 'las_vegas', 6.5, 74, 15, 2023, 'AI-native property management platform. Automates listing, rent collection, maintenance, compliance. Seed co-led by Okapi VC and Shadow Ventures.', ARRAY['fundnv','1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (15, 'Stable', 'stable', 'seed', ARRAY['Blockchain','Fintech','Payments'], 'Las Vegas', 'las_vegas', 5.5, 62, 20, 2022, 'Blockchain for settling transactions with digital dollars. Gas-free peer transfers. Simplifying digital dollar payments.', ARRAY['1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (16, 'ThirdWaveRx', 'thirdwaverx', 'series_a', ARRAY['Healthcare','AI','Analytics'], 'Las Vegas', 'las_vegas', 8, 66, 35, 2019, 'Pharmacy cost management with AI-driven formulary optimization. Serves hospitals, LTC, PBMs. Automated rebate and compliance.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (17, 'Vibrant Planet', 'vibrant-planet', 'series_a', ARRAY['Cleantech','AI','Analytics'], 'Incline Village', 'reno', 34, 74, 52, 2019, 'Cloud platform for wildfire risk + forest restoration. $15M Series A led by EIF. PG&E, Placer County clients. Merged w/ Pyrologix.', ARRAY['bbv'], 39.25, -119.95)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (18, 'Kaptyn', 'kaptyn', 'series_a', ARRAY['Logistics','Energy','IoT'], 'Las Vegas', 'las_vegas', 12, 60, 45, 2015, 'Electric fleet-as-a-service for hospitality and corporate transport. Professional drivers, EV fleet, app-based booking. Las Vegas focus.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (19, 'Climb Credit', 'climb-credit', 'series_a', ARRAY['Fintech','Education'], 'Las Vegas', 'las_vegas', 10, 56, 30, 2014, 'Student payment platform making career-focused education affordable. Partners with coding bootcamps and trade schools.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (20, 'Ollie', 'ollie', 'series_b', ARRAY['Consumer','AI','Logistics'], 'Las Vegas', 'las_vegas', 62, 64, 200, 2016, 'Human-grade fresh dog food delivered. Subscription plans tailored per dog. AI-customized recipes. National DTC delivery.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (21, 'Nudge Security', 'nudge-security', 'series_a', ARRAY['Cybersecurity','AI'], 'Las Vegas', 'las_vegas', 39, 82, 35, 2021, 'SaaS & AI security governance. $22.5M Series A Nov 2025 led by Cerberus Ventures. Tripled ARR 2024. ~200 customers incl Reddit.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (22, 'Carbon Health', 'carbon-health', 'series_c_plus', ARRAY['Healthcare','AI'], 'Reno', 'reno', 350, 65, 3000, 2015, 'Modern healthcare clinics with AI-powered diagnostics. Physical and virtual care. Reno and national presence. Series D at $3B valuation.', '{}', 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (23, 'Titan Seal', 'titan-seal', 'seed', ARRAY['Blockchain','Cybersecurity'], 'Las Vegas', 'las_vegas', 1.2, 45, 8, 2017, 'Blockchain-based document verification and sealing platform for government and legal records.', ARRAY['fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (24, 'Fund Duel', 'fund-duel', 'seed', ARRAY['Fintech','Gaming'], 'Las Vegas', 'las_vegas', 0.8, 42, 6, 2018, 'Fantasy stock market and financial education gaming platform. Gamifies investing for Gen Z.', ARRAY['fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (25, 'Cognizer AI', 'cognizer-ai', 'series_a', ARRAY['AI','Analytics'], 'Las Vegas', 'las_vegas', 19.4, 64, 64, 2018, 'AI-powered business productivity and automation platform. FundNV and GigFounders backed. Enterprise workflow intelligence.', ARRAY['fundnv','bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (26, 'Dot Ai (SEE ID)', 'dot-ai-see-id', 'public', ARRAY['AI','IoT','Hardware'], 'Las Vegas', 'las_vegas', 12, 58, 30, 2020, 'AI-powered asset intelligence and IoT track-and-trace platform. Went public on Nasdaq (DAIC) Jun 2025 via SPAC. Veteran-owned.', ARRAY['fundnv','1864','bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (27, 'PlayStudios', 'playstudios', 'growth', ARRAY['Gaming','Mobile'], 'Las Vegas', 'las_vegas', 250, 55, 500, 2011, 'Free-to-play mobile games with real-world rewards. MGM, Marriott partnerships. Publicly traded (Nasdaq: MYPS). Kingdom Boss and other titles.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (28, 'Everi Holdings', 'everi-holdings', 'growth', ARRAY['Gaming','Fintech','IoT'], 'Las Vegas', 'las_vegas', 180, 60, 2500, 2014, 'Gaming technology and fintech solutions. Slot machines, CashClub, financial compliance. NYSE: EVRI.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (29, 'Lyten', 'lyten', 'growth', ARRAY['Cleantech','Manufacturing','Energy'], 'Reno', 'reno', 425, 92, 200, 2015, 'Lithium-sulfur battery pioneer. $1B+ gigafactory planned at Reno AirLogistics Park. 40% lighter than Li-ion. Backed by Stellantis, FedEx, Honeywell. 1,000+ jobs at full capacity.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (30, 'Cranel', 'cranel', 'seed', ARRAY['Healthcare','Consumer'], 'Las Vegas', 'las_vegas', 0.5, 52, 8, 2023, 'Natural cranberry elixir clinically proven to prevent urinary tract infections. AngelNV 2025 finalist. Direct-to-consumer health and wellness.', ARRAY['fundnv','1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (31, 'fibrX', 'fibrx', 'seed', ARRAY['IoT','AI','Defense'], 'Las Vegas', 'las_vegas', 1.5, 64, 10, 2023, 'Platform-as-a-service combining fiberoptics, AI, and cloud computing for early detection and real-time monitoring of critical infrastructure. AngelNV 2025 finalist.', ARRAY['sbir','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (32, 'Base Venture', 'base-venture', 'seed', ARRAY['Fintech','Analytics'], 'Carson City', 'reno', 2.4, 56, 12, 2021, 'Financial technology platform for small business expansion. Adams Hub accelerator graduate. Raised $2.4M for growth plans.', ARRAY['fundnv','1864'], 39.16, -119.77)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (33, 'Comstock Mining', 'comstock-mining', 'growth', ARRAY['Mining','Cleantech'], 'Virginia City', 'reno', 45, 56, 75, 2008, 'Mineral exploration and cleantech in Storey County. Mercury remediation technology. NYSE American: LODE.', '{}', 39.31, -119.65)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (34, 'Filament Health', 'filament-health', 'series_a', ARRAY['Biotech','Healthcare'], 'Reno', 'reno', 8, 54, 22, 2020, 'Standardized natural psilocybin for clinical trials and pharmaceutical development. Drug master file with FDA.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (35, 'Amerityre', 'amerityre', 'growth', ARRAY['Manufacturing','Materials Science'], 'Henderson', 'henderson', 12, 48, 35, 1999, 'Polyurethane foam tire manufacturer. Flat-free tires for industrial, military, and recreational vehicles.', '{}', 36.04, -115.04)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (36, 'Tilt AI', 'tilt-ai', 'seed', ARRAY['AI','Logistics','SaaS'], 'Reno', 'reno', 1.5, 68, 12, 2024, 'AI-powered Transportation-as-a-Service automating freight brokerage. $26.3M revenue in 2024. Agent network grew from 11 to 80. Targeting $6T global land freight market.', ARRAY['fundnv','1864','bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (37, 'Nommi', 'nommi', 'seed', ARRAY['Robotics','AI','Consumer'], 'Las Vegas', 'las_vegas', 3, 60, 18, 2022, 'Autonomous food delivery robots for the Las Vegas Strip. Hot food vending with robotic kitchen. CES demo.', ARRAY['fundnv','1864'], 36.12, -115.17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (38, 'Amira Learning', 'amira-learning', 'series_b', ARRAY['AI','Education'], 'Las Vegas', 'las_vegas', 41, 76, 150, 2018, 'AI reading tutor for K-8. Merged w/ Istation Jun 2024. Fast Company Most Innovative 2025. 1,800+ school districts. Owl Ventures backed.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (39, 'Wynn Interactive', 'wynn-interactive', 'growth', ARRAY['Gaming','Fintech'], 'Las Vegas', 'las_vegas', 50, 55, 80, 2020, 'Online gaming and sports betting platform from Wynn Resorts. WynnBET app. Licensed in multiple US states.', '{}', 36.13, -115.17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (40, 'betJACK', 'betjack', 'seed', ARRAY['Gaming','AI','Analytics'], 'Las Vegas', 'las_vegas', 4, 58, 15, 2022, 'AI-powered sports betting analytics platform. Real-time odds modeling and bettor risk management.', ARRAY['1864','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (41, 'HiBear', 'hibear', 'pre_seed', ARRAY['Consumer','Hardware'], 'Reno', 'reno', 0.2, 50, 6, 2017, 'All-Day Adventure Flask for pour-over coffee to cocktails. Red Dot Design Award. Kickstarter hit in 45 min. Shark Tank Season 15. Founded by Navy Commander.', ARRAY['fundnv','bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (42, 'nFusz', 'nfusz', 'series_a', ARRAY['AI','AdTech','Analytics'], 'Las Vegas', 'las_vegas', 7, 50, 20, 2015, 'Interactive video platform with AI analytics. Viewer engagement tracking for enterprise sales and marketing.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (43, 'Sapien', 'sapien', 'seed', ARRAY['AI','Blockchain'], 'Las Vegas', 'las_vegas', 3.5, 54, 12, 2020, 'Decentralized human data labeling platform for AI training. Web3-native annotation marketplace.', ARRAY['1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (44, 'SITO Mobile', 'sito-mobile', 'growth', ARRAY['AdTech','Analytics','IoT'], 'Las Vegas', 'las_vegas', 15, 46, 40, 2012, 'Location-based consumer insights and advertising platform. Foot traffic analytics for hospitality and retail.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (45, 'Lucihub', 'lucihub', 'seed', ARRAY['AI','Media','SaaS'], 'Las Vegas', 'las_vegas', 3.2, 62, 20, 2022, 'AI-powered hybrid video production platform. Butterfly AI copilot generates scripts and storyboards. $400K ARR. Microsoft for Startups.', ARRAY['fundnv','1864','bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (46, 'Tokens.com', 'tokens-com', 'growth', ARRAY['Blockchain','Fintech'], 'Las Vegas', 'las_vegas', 14, 42, 20, 2021, 'Publicly traded crypto and metaverse investing company. Staking, DeFi, and digital real estate portfolio.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (47, 'Cloudforce Networks', 'cloudforce-networks', 'seed', ARRAY['Cloud','AI'], 'Las Vegas', 'las_vegas', 0.5, 54, 8, 2023, 'Platform integrating key components of AWS Landing Zones into one accessible interface. Simplifies cloud workload management for enterprises. StartUpNV Pitch Day company.', ARRAY['fundnv','1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (48, 'SiO2 Materials', 'sio2-materials', 'series_a', ARRAY['Materials Science','Manufacturing'], 'Las Vegas', 'las_vegas', 10, 56, 30, 2019, 'Advanced glass vial manufacturing using plasma-deposited SiO2 coating. Pharma and biotech packaging.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (49, 'Ioneer', 'ioneer', 'growth', ARRAY['Mining','Cleantech','Energy'], 'Reno', 'reno', 700, 82, 60, 2017, 'Developing Rhyolite Ridge lithium-boron project in Esmeralda County. $700M DOE conditional loan commitment. Only known combined lithium-boron deposit in North America. ASX: INR.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (50, 'Dragonfly Energy', 'dragonfly-energy', 'growth', ARRAY['Energy','Manufacturing','Cleantech'], 'Reno', 'reno', 120, 58, 200, 2012, 'Lithium-ion battery manufacturer specializing in deep-cycle LiFePO4 batteries. Proprietary dry electrode cell manufacturing. Nasdaq: DFLI. Battle Born Batteries brand.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (51, 'Sierra Nevada Corp', 'sierra-nevada-corp', 'growth', ARRAY['Defense','Aerospace','AI'], 'Sparks', 'reno', 2000, 80, 4500, 1963, 'Global defense and aerospace company. Dream Chaser spaceplane for NASA ISS resupply. Electronic warfare, cybersecurity, autonomous systems. HQ in Sparks.', '{}', 39.53, -119.75)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (52, 'Nevada Nano', 'nevada-nano', 'series_a', ARRAY['Defense','IoT','Semiconductors'], 'Las Vegas', 'las_vegas', 8, 66, 25, 2013, 'MEMS-based environmental sensing chips. Precise gas detection for defense, industrial, and air quality monitoring.', ARRAY['sbir','bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (53, 'Duetto', 'duetto', 'series_c_plus', ARRAY['AI','Hospitality','Analytics'], 'Las Vegas', 'las_vegas', 80, 72, 200, 2012, 'AI-powered hotel revenue management platform. Dynamic pricing for gaming resorts and hospitality. Used by major casino operators worldwide. Las Vegas-based engineering hub.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (54, 'GAN Limited', 'gan-limited', 'growth', ARRAY['Gaming','AI','Fintech'], 'Las Vegas', 'las_vegas', 100, 58, 350, 2002, 'B2B platform powering online casino and sports betting for major US operators. Simulated gaming and real-money iGaming. Nasdaq: GAN. Las Vegas HQ.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (55, 'NEXGEL', 'nexgel', 'growth', ARRAY['Biotech','Manufacturing','Healthcare'], 'Las Vegas', 'las_vegas', 15, 50, 30, 2014, 'Proprietary ultra-gentle hydrogel technology platform. Medical, cosmetic, and consumer wellness applications. Nasdaq: NXGL. Las Vegas manufacturing.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (56, 'WaterStart', 'waterstart', 'series_a', ARRAY['Water','Cleantech','AI'], 'Las Vegas', 'las_vegas', 8, 68, 20, 2018, 'Nevada water innovation cluster backed by Southern Nevada Water Authority. Accelerates water tech commercialization. Pilots desalination, reuse, and conservation technologies statewide.', ARRAY['bbv','sbir'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (57, 'Now Ads', 'now-ads', 'pre_seed', ARRAY['AdTech','AI'], 'Carson City', 'reno', 0.3, 46, 5, 2023, 'Online advertising platform with AI-driven targeting. Adams Hub accelerator company in Carson City. Seeking pre-seed funding for market expansion.', ARRAY['fundnv'], 39.16, -119.77)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (58, 'Switch Inc', 'switch-inc', 'growth', ARRAY['Data Center','Cloud','Energy'], 'Las Vegas', 'las_vegas', 530, 60, 1000, 2000, 'Hyperscale data centers. SUPERNAP campus in Las Vegas is one of the world''s largest. Acquired by DigitalBridge 2022.', '{}', 36.08, -115.15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (59, 'Talentel', 'talentel', 'seed', ARRAY['AI','HR Tech'], 'Carson City', 'reno', 0.5, 48, 6, 2022, 'AI-powered talent matching and workforce development platform. Adams Hub accelerator graduate. Connecting Nevada employers with skilled workers.', ARRAY['fundnv'], 39.16, -119.77)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (60, 'Elicio Therapeutics', 'elicio-therapeutics', 'series_c_plus', ARRAY['Biotech','Healthcare'], 'Las Vegas', 'las_vegas', 100, 62, 60, 2019, 'Immunotherapy platform for cancer vaccines. AMP technology targets lymph nodes. Multiple clinical trials.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (61, 'Canyon Ranch', 'canyon-ranch', 'growth', ARRAY['Healthcare','Hospitality'], 'Las Vegas', 'las_vegas', 30, 50, 500, 1979, 'Integrative wellness destination with precision health and diagnostics programs. Las Vegas and Tucson locations.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (62, 'MiOrganics', 'miorganics', 'seed', ARRAY['AI','Enterprise'], 'Las Vegas', 'las_vegas', 0.5, 50, 10, 2022, 'Custom software development company specializing in innovative business solutions across industries. AngelNV 2025 finalist. Enterprise workflow automation.', ARRAY['fundnv','1864'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (63, 'BuildQ', 'buildq', 'pre_seed', ARRAY['AI','CleanTech','FinTech'], 'Las Vegas', 'las_vegas', 0.2, 68, 5, 2024, 'AI-powered project intelligence platform for financing sustainable energy infrastructure. Accelerates M&A timelines by 40%. AngelNV 2025 winner. Founded by Maryssa Barron (Harvard/Stanford).', ARRAY['fundnv','1864','bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (64, 'Nuvve Corp', 'nuvve-corp', 'growth', ARRAY['Energy','Logistics','IoT'], 'Las Vegas', 'las_vegas', 40, 52, 50, 2019, 'Vehicle-to-grid (V2G) technology for electric buses and fleet vehicles. Smart charging infrastructure.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (65, 'SilverSun Technologies', 'silversun-technologies', 'growth', ARRAY['Cloud','AI','Enterprise'], 'Las Vegas', 'las_vegas', 10, 48, 60, 2002, 'Cloud-based ERP and IT consulting for small and mid-market businesses. Managed IT services and cybersecurity. Nasdaq: SSNT. Las Vegas headquarters.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (66, 'Curaleaf Tech', 'curaleaf-tech', 'growth', ARRAY['Cannabis','Analytics','Logistics'], 'Las Vegas', 'las_vegas', 75, 54, 300, 2010, 'Multi-state cannabis operator with significant Nevada presence. Select brand. Cultivation and retail tech platform.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (67, 'Planet 13', 'planet-13', 'growth', ARRAY['Cannabis','Retail','IoT'], 'Las Vegas', 'las_vegas', 55, 56, 400, 2017, 'Superstore cannabis entertainment complex on Las Vegas Strip. World''s largest dispensary. Publicly traded (OTC: PLNHF).', '{}', 36.14, -115.16)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (68, 'GBank Financial', 'gbank-financial', 'series_a', ARRAY['Fintech','Banking'], 'Las Vegas', 'las_vegas', 8, 50, 25, 2007, 'Digital-first community bank holding company. BankCard Services partnership. Fintech-banking bridge.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (69, 'Acres Technology', 'acres-technology', 'series_a', ARRAY['Gaming','Fintech','IoT'], 'Las Vegas', 'las_vegas', 12, 62, 35, 2013, 'Foundation casino management platform. Cashless gaming, player loyalty, and real-time analytics for slot floors.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (70, 'Bombard Renewable Energy', 'bombard-renewable-energy', 'growth', ARRAY['Solar','Energy','Construction'], 'Las Vegas', 'las_vegas', 25, 62, 500, 2010, 'Nevada''s largest solar electrical contractor. Commercial and utility-scale solar installations across the Southwest. Subsidiary of Bombard Electric. Major Strip resort projects.', '{}', 36.08, -115.18)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (71, 'Jackpot Digital', 'jackpot-digital', 'growth', ARRAY['Gaming','IoT','Fintech'], 'Las Vegas', 'las_vegas', 8, 52, 25, 2013, 'Electronic table games (ETGs) manufacturer. Dealerless blackjack, roulette, baccarat. Installed at casinos across US, Canada, and international markets. TSX: JP.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (72, 'Skydio Gov', 'skydio-gov', 'series_a', ARRAY['Defense','AI','Drones'], 'Las Vegas', 'las_vegas', 10, 74, 30, 2021, 'Government and defense drone operations center supporting autonomous UAS missions at NTTR and Nellis AFB. Counter-UAS testing and AI-powered ISR. Nevada operations hub.', ARRAY['sbir','bbv'], 36.24, -115.04)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (73, 'Aqua Metals', 'aqua-metals', 'growth', ARRAY['Cleantech','Manufacturing'], 'Reno', 'reno', 120, 52, 80, 2014, 'Clean battery recycling with AquaRefining. Non-polluting lead recycling. NYSE American: AQMS. TRIC facility.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (74, 'Ormat Technologies', 'ormat-technologies', 'growth', ARRAY['Energy','Cleantech','Manufacturing'], 'Reno', 'reno', 400, 62, 1400, 1965, 'Global leader in geothermal energy and recovered energy generation. NYSE: ORA. Reno HQ. Operates geothermal plants across Nevada, California, and internationally.', '{}', 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (75, 'NV5 Global', 'nv5-global', 'growth', ARRAY['Construction','Energy','Analytics'], 'Las Vegas', 'las_vegas', 200, 56, 4000, 2011, 'Infrastructure services and consulting firm. Geospatial, environmental, construction QA, energy. Nasdaq: NVEE. Las Vegas HQ with offices across 100+ locations.', '{}', 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (76, 'Access Health Dental', 'access-health-dental', 'growth', ARRAY['HealthTech'], 'Las Vegas', 'las_vegas', 0, 45, 250, 2000, 'Dentist-owned dental practice group with mobile dentistry serving Las Vegas casinos and large employers.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (77, 'Adaract', 'adaract', 'pre_seed', ARRAY['DeepTech','Defense','Hardware'], 'Reno', 'reno', 0.4, 58, 5, 2022, 'Manufacturer of high-performance artificial muscle actuators for bionics, robotics, and aerospace. UNR spinout. AngelNV winner. SBIR Air Force contract.', ARRAY['bbv','fundnv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (78, 'AI Foundation', 'ai-foundation', 'series_b', ARRAY['AI','DeepTech'], 'San Francisco', 'other', 28, 55, 30, 2017, 'AI digital humans and synthetic media detection. Reality Defender deepfake detection platform. Backed by Founders Fund.', ARRAY['bbv','fundnv'], 37.77, -122.42)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (79, 'AIR Corp', 'air-corp', 'pre_seed', ARRAY['AI','Hardware','DeepTech'], 'Reno', 'reno', 0, 52, 5, 2020, 'AI-powered autonomous infrastructure inspection using climbing robots for bridges and dams. UNR Prof. Dr. Hung La. Deployed at NASA Langley.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (80, 'Battle Born Beer', 'battle-born-beer', 'seed', ARRAY['Consumer'], 'Reno', 'reno', 0, 40, 10, 2014, 'Craft brewery producing Nevada''s flagship American lager. 10,000 sq ft Reno facility. Partnered with Parlay 6 Brewing 2025.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (81, 'Beloit Kombucha', 'beloit-kombucha', 'seed', ARRAY['FoodTech','Consumer'], 'Beloit', 'other', 0.8, 38, 3, 2020, 'First powdered kombucha product. Organic probiotic drink mix packets with BC30 probiotics.', ARRAY['bbv'], 42.51, -89.04)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (82, 'BrakeSens', 'brakesens', 'pre_seed', ARRAY['Hardware','DeepTech'], 'Las Vegas', 'las_vegas', 0, 35, 3, 2023, 'Real-time brake wear monitoring sensors for consumer and commercial vehicles. CRP DefenseTech Accelerator 2025.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (83, 'CareWear', 'carewear', 'seed', ARRAY['MedDevice','HealthTech'], 'Reno', 'reno', 4, 62, 9, 2017, 'Wearable FDA-registered LED light therapy patches for pain relief. 67+ patents. Used by 100+ pro sports teams and military.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (84, 'CircleIn', 'circlein', 'seed', ARRAY['EdTech'], 'Washington', 'other', 1.1, 48, 15, 2017, 'Virtual student community platform improving college retention through peer-to-peer collaboration. NSF grant recipient. 30+ colleges.', ARRAY['bbv'], 38.9, -77.04)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (85, 'ClickBio', 'clickbio', 'seed', ARRAY['BioTech','Hardware'], 'Reno', 'reno', 0.6, 45, 6, 2015, 'Automation-friendly lab tools for next-gen sequencing and cell culture robotics. SLAS Innovation Award winner.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (86, 'ClothesLyne', 'clotheslyne', 'seed', ARRAY['Consumer','SaaS'], 'Goshen', 'other', 0.2, 42, 10, 2021, 'On-demand peer-to-peer laundry marketplace. Techstars NYC ''23. Operates in 8 states, 35+ markets.', ARRAY['bbv'], 41.4, -74.32)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (87, 'Coco Coders', 'coco-coders', 'seed', ARRAY['EdTech'], 'Incline Village', 'reno', 2.6, 52, 40, 2020, 'STEM-certified online coding school for kids ages 6-14. 10,000+ students globally. STEM.org accredited 20-level curriculum.', ARRAY['bbv'], 39.25, -119.95)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (88, 'crEATe Good Foods', 'create-good-foods', 'pre_seed', ARRAY['FoodTech'], 'Las Vegas', 'las_vegas', 0, 35, 5, 2023, 'Plant-based meat company making shelf-stable beef, chicken, and fish alternatives from pea protein.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (89, 'Cuts Clothing', 'cuts-clothing', 'growth', ARRAY['Consumer'], 'Culver City', 'other', 24, 72, 142, 2016, 'Premium DTC apparel brand built for the sport of business. Custom Pyca fabric. Nine-figure annual revenue. Nordstrom retail.', ARRAY['bbv'], 34.02, -118.4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (90, 'DayaMed', 'dayamed', 'seed', ARRAY['HealthTech','MedDevice'], 'Reno', 'reno', 0, 48, 15, 2014, 'AI-powered smart pill dispensers for medication adherence. MedPod device showed A1C reduction equivalent to starting diabetes medication.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (91, 'Dog & Whistle', 'dog-whistle', 'pre_seed', ARRAY['FoodTech','Consumer'], 'Las Vegas', 'las_vegas', 0.2, 40, 5, 2019, 'Sustainable pet food upcycling surplus human-grade ingredients. 98% customer retention. Pursuing carbon-neutral manufacturing.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (92, 'Drain Drawer', 'drain-drawer', 'pre_seed', ARRAY['Consumer'], 'Las Vegas', 'las_vegas', 0, 35, 3, 2023, 'Patented eco-friendly plant pot with removable drainage drawer. 2025 TPIE Cool Product Award. Kickstarter funded on Day 1.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (93, 'Ecoatoms', 'ecoatoms', 'seed', ARRAY['SpaceTech','BioTech','DeepTech'], 'Reno', 'reno', 0.5, 56, 5, 2020, 'Space biomanufacturing payloads for microgravity biomedical production. NASA TechLeap Prize winner. Flew on Blue Origin.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (94, 'Elly Health', 'elly-health', 'seed', ARRAY['HealthTech','AI'], 'Los Angeles', 'other', 4.6, 52, 18, 2019, 'Empathetic audio companion for chronic disease patients. Clinical study showed $9K/patient/year cost savings. 86% retention.', ARRAY['bbv'], 34.05, -118.24)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (95, 'Fandeavor', 'fandeavor', 'seed', ARRAY['Consumer','SaaS'], 'Las Vegas', 'las_vegas', 0.5, 30, 5, 2011, 'Online marketplace for curated sports travel and VIP experiences. Founded by ex-Zappos employees. Acquired by TicketCity 2019.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (96, 'FanUp', 'fanup', 'seed', ARRAY['Gaming','Consumer'], 'Philadelphia', 'other', 5, 58, 12, 2019, 'Social fantasy sports and pop culture gaming for Gen Z. 700K+ users, 6M+ social followers. Backed by DraftKings founding investors.', ARRAY['bbv'], 39.95, -75.17)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (97, 'Grantcycle', 'grantcycle', 'seed', ARRAY['SaaS'], 'Bloomington', 'other', 0.1, 32, 1, 2019, 'Grant management platform automating post-award workflows for nonprofits. Targets $400B/year manual grant management market.', ARRAY['bbv'], 39.17, -86.53)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (98, 'GRRRL', 'grrrl', 'seed', ARRAY['Consumer'], 'Las Vegas', 'las_vegas', 0, 50, 15, 2015, 'Women''s activewear brand eliminating traditional sizing. $5M annual revenue. Stores in US, Australia, UK, Canada.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (99, 'Heligenics', 'heligenics', 'seed', ARRAY['BioTech','DeepTech'], 'Las Vegas', 'las_vegas', 6, 58, 7, 2019, 'GigaAssay platform analyzing all genetic mutations simultaneously for drug discovery. First UNLV biotech spinoff. 70K sq ft wet lab.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (100, 'KnowRisk', 'knowrisk', 'seed', ARRAY['InsurTech','AI'], 'Las Vegas', 'las_vegas', 0, 38, 5, 2022, 'AI claims letter automation (Voltaire) for P&C insurance carriers. Generates accurate claims correspondence in 30 seconds.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (101, 'Let''s Rolo', 'let-s-rolo', 'seed', ARRAY['SaaS'], 'Las Vegas', 'las_vegas', 0.1, 30, 5, 2021, 'Micro-CRM with digital business cards. Founded by Piotr Tomasik (later co-founded TensorWave). Acquired by LifeKey 2024.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (102, 'Longshot Space', 'longshot-space', 'seed', ARRAY['SpaceTech','Defense','DeepTech'], 'Oakland', 'other', 6.7, 65, 15, 2021, 'Kinetic ground-based launch system. 500m space gun in Nevada desert for $10/kg launches. Backed by Sam Altman, Tim Draper. MDA $151B SHIELD contract.', ARRAY['bbv'], 37.8, -122.27)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (103, 'Melzi Surgical', 'melzi-surgical', 'series_a', ARRAY['MedDevice'], 'Los Altos', 'other', 4, 52, 14, 2017, 'FDA-registered Melzi Sharps Finder uses magnetic technology to locate lost needles during surgery. 95% detection reliability.', ARRAY['bbv'], 37.38, -122.11)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (104, 'Nailstry', 'nailstry', 'pre_seed', ARRAY['AI','Consumer'], 'Fort Lauderdale', 'other', 0.4, 35, 5, 2018, 'AI virtual fingernail sizing using computer vision. Patent-pending tech eliminates physical sizing kits. Collaborated with Shea Moisture for Target.', ARRAY['bbv'], 26.12, -80.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (105, 'NeuroReserve', 'neuroreserve', 'seed', ARRAY['HealthTech','BioTech'], 'Las Vegas', 'las_vegas', 2.3, 48, 5, 2017, 'RELEVATE supplement based on Mediterranean/MIND dietary patterns for brain health. Proprietary blend of 17 nutrients.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (106, 'Nivati', 'nivati', 'seed', ARRAY['HealthTech','SaaS'], 'Salt Lake City', 'other', 5.5, 55, 50, 2010, 'Employee mental health platform combining AI support with licensed professionals. 65% utilization rate. Inc. 5000 #678.', ARRAY['bbv'], 40.76, -111.89)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (107, 'Onboarded', 'onboarded', 'seed', ARRAY['SaaS','AI'], 'Incline Village', 'reno', 1.2, 50, 16, 2022, 'AI workforce orchestration platform automating onboarding, I-9/E-Verify compliance, and HR workflows via API-first embedded solution.', ARRAY['bbv'], 39.25, -119.95)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (108, 'Otsy', 'otsy', 'seed', ARRAY['AI','Consumer'], 'Las Vegas', 'las_vegas', 0.5, 42, 14, 2021, 'Social travel app integrating travel content with live booking plus AI concierge Ottie for personalized trip planning.', ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (109, 'Phone2', 'phone2', 'pre_seed', ARRAY['SaaS'], 'Henderson', 'henderson', 0.2, 40, 9, 2020, 'Cloud business phone system with branded calling showing company logo and call reason. 4x answer rate increase. Google for Startups backed.', ARRAY['bbv'], 36.04, -115.04)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (110, 'Prosper Technologies', 'prosper-technologies', 'seed', ARRAY['DeepTech','AgTech','CleanTech'], 'Miami', 'other', 2.2, 45, 10, 2012, 'Patented Gas Infusion nanotechnology for supersaturated oxygen in liquids. Agriculture, water treatment, and healthcare applications.', ARRAY['bbv'], 25.76, -80.19)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (111, 'Quantum Copper', 'quantum-copper', 'seed', ARRAY['DeepTech','CleanTech','Hardware'], 'Las Vegas', 'las_vegas', 1.8, 48, 9, 2021, 'Halogen-free ionic polymer fire-retardant components for lithium-ion batteries. NSF Phase I SBIR grant. Targeting EV and eVTOL markets.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (112, 'Sarcomatrix', 'sarcomatrix', 'seed', ARRAY['BioTech'], 'Reno', 'reno', 0.4, 45, 6, 2022, 'First-in-class oral therapeutics for Duchenne muscular dystrophy. UNR Medical School spinout. NIH-backed. S-969 lead candidate.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (113, 'Semi Exact', 'semi-exact', 'seed', ARRAY['Consumer','Hardware'], 'Minden', 'reno', 0.6, 42, 18, 2016, 'Sustainable furniture from 100% recycled steel with in-house metal fabrication, laser cutting, and robotic welding.', ARRAY['bbv'], 39, -119.77)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (114, 'SurgiStream', 'surgistream', 'seed', ARRAY['HealthTech','SaaS'], 'Las Vegas', 'las_vegas', 1.1, 45, 8, 2018, 'Cloud surgical scheduling platform streamlining communication, document handling, and vendor coordination for surgical logistics.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (115, 'Taber Innovations', 'taber-innovations', 'seed', ARRAY['Defense','Hardware','DeepTech'], 'Las Vegas', 'las_vegas', 0, 42, 4, 2015, 'OWL (Over Watch Locator) system for real-time first responder tracking inside structures. Patented LEAP ultra-wideband tech. SDVOSB.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (116, 'Talage Insurance', 'talage-insurance', 'series_b', ARRAY['InsurTech','SaaS'], 'Reno', 'reno', 15.5, 58, 23, 2015, 'AI submission management platform (Wheelhouse) for commercial insurance. Acquired by Mission Underwriters May 2025. SOC 2 Type II.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (117, 'Terbine', 'terbine', 'seed', ARRAY['AI','DeepTech','CleanTech'], 'Las Vegas', 'las_vegas', 6.4, 52, 13, 2016, 'IoT data marketplace with 30K+ sensor feeds from 100+ countries. STRATA platform for autonomous systems and EV charging. NVIDIA Inception.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (118, 'TransWorldHealth', 'transworldhealth', 'seed', ARRAY['HealthTech','SaaS'], 'Reno', 'reno', 5, 42, 5, 2003, 'Healthcare performance improvement platform. Reduced readmission rates from 18% to 5% across 360K safety-net patients.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (119, 'Ultion', 'ultion', 'series_a', ARRAY['CleanTech','Hardware','Defense'], 'Las Vegas', 'las_vegas', 6, 58, 15, 2021, 'Only fully integrated U.S. manufacturer of LFP battery cells and energy storage systems. 100% IRA-compliant. American battery independence.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (120, 'Vena Solutions', 'vena-solutions', 'growth', ARRAY['SaaS','AI','FinTech'], 'Toronto', 'other', 476, 72, 715, 2011, 'AI-powered FP&A platform natively integrated with Microsoft Excel. $100M+ ARR. 2025 Gartner Magic Quadrant Challenger.', ARRAY['bbv'], 43.65, -79.38)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (121, 'Vena Vitals', 'vena-vitals', 'seed', ARRAY['MedDevice','HealthTech'], 'Irvine', 'other', 0.3, 50, 15, 2019, 'Flexible wearable sticker for continuous non-invasive blood pressure monitoring. Y Combinator S20. Tested on 600+ patients.', ARRAY['bbv'], 33.68, -117.83)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (122, 'VisionAid', 'visionaid', 'pre_seed', ARRAY['HealthTech','Hardware','DeepTech'], 'Las Vegas', 'las_vegas', 0, 42, 5, 2021, 'Electronic glasses and XR software to augment vision for legally blind individuals. Eye Disease Simulator trusted by ophthalmologists and MIT.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (123, 'Vistro', 'vistro', 'pre_seed', ARRAY['FoodTech'], 'Reno', 'reno', 0.3, 25, 5, 2021, 'Multi-brand virtual bistro/ghost kitchen operating eight in-house brands from one kitchen. gener8tor graduate. Closed as of late 2025.', ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (124, 'WAVR Technologies', 'wavr-technologies', 'seed', ARRAY['CleanTech','DeepTech','Hardware'], 'Las Vegas', 'las_vegas', 4, 62, 6, 2024, 'Atmospheric water harvesting tech from UNLV spinout. Produces freshwater from air at 10% humidity. 10x yield of competitors. Can integrate with data center waste heat.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (125, 'Wedgies', 'wedgies', 'seed', ARRAY['SaaS','Consumer'], 'Las Vegas', 'las_vegas', 1.2, 20, 5, 2012, 'Social media polling platform. Powered Obama''s 2015 State of the Union polling. Clients: WSJ, P&G, Delta. Company closed.', ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (126, 'WiseBanyan', 'wisebanyan', 'seed', ARRAY['FinTech'], 'New York', 'other', 11, 25, 11, 2013, 'World''s first free robo-advisor. Reached $100M AUM and 25K users. Acquired by Axos Financial Oct 2018 (rebranded Axos Invest).', ARRAY['bbv'], 40.71, -74.01)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES (127, 'ZenCentiv', 'zencentiv', 'seed', ARRAY['SaaS','AI'], 'Miami', 'other', 1.7, 45, 10, 2022, 'AI no-code sales commission automation platform. SOC-1/SOC-2 certified. Backed by UNLV''s student-led Rebel Venture Fund.', ARRAY['bbv','fundnv'], 25.76, -80.19)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, stage = EXCLUDED.stage,
  sectors = EXCLUDED.sectors, funding_m = EXCLUDED.funding_m,
  momentum = EXCLUDED.momentum, employees = EXCLUDED.employees,
  description = EXCLUDED.description;

SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

COMMIT;
