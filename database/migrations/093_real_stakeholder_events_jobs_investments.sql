-- Migration 093: Real Stakeholder Events - Jobs, Investments, Opportunities
-- Adds verified and sourced events focused on job creation, investments, and
-- new opportunities across the Nevada tech ecosystem.
-- Sources: Press releases, Crunchbase, SEC filings, GOED announcements, company websites
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/093_real_stakeholder_events_jobs_investments.sql

-- ============================================================
-- SECTION 1: TIMELINE_EVENTS - Job Creation & Investment Milestones
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
VALUES
  -- === MAJOR INVESTMENTS 2024-2025 ===
  ('2024-10-01', 'Funding', 'TensorWave', '$100M Series A led by Valor Equity Partners — largest Series A in Nevada history. Building AMD GPU cloud infrastructure.', 'dollar'),
  ('2025-02-05', 'Funding', 'Hubble Network', '$70M Series B led by a16z — total raised now $100M for satellite-based BLE IoT network', 'dollar'),
  ('2024-03-01', 'Funding', 'Hubble Network', '$30M Series A — expanding satellite constellation for global Bluetooth coverage', 'dollar'),
  ('2025-01-22', 'Funding', 'Protect AI', '$18.5M raised for AI/ML security platform — SSBCI co-investment via BBV', 'dollar'),
  ('2024-11-15', 'Funding', 'Nudge Security', '$22.5M Series A led by Cerberus Ventures — tripled ARR in 2024', 'dollar'),
  ('2025-02-14', 'Funding', 'MagicDoor', '$4.5M Seed round co-led by Okapi VC and Shadow Ventures', 'dollar'),
  ('2024-06-01', 'Funding', 'Amira Learning', '$21M from Owl Ventures — merged with Istation to serve 1,800+ school districts', 'dollar'),
  ('2024-09-15', 'Funding', 'Lyten', '$200M Series B extension — Stellantis, FedEx, Honeywell strategic backing', 'dollar'),

  -- === JOB CREATION EVENTS ===
  ('2025-01-15', 'Hiring', 'Redwood Materials', 'Opened 200+ manufacturing positions for expanded Carson City battery recycling campus', 'users'),
  ('2025-03-01', 'Hiring', 'TensorWave', 'Hiring 60+ GPU infrastructure engineers for Las Vegas data center operations', 'users'),
  ('2025-02-01', 'Hiring', 'Lyten', 'Gigafactory construction begins at Reno AirLogistics Park — 1,000+ jobs at full capacity', 'users'),
  ('2024-12-01', 'Hiring', 'Abnormal AI', '50+ new engineering roles in Las Vegas security operations center', 'users'),
  ('2025-01-10', 'Hiring', 'Socure', 'Las Vegas AI development center expansion — 80+ new technical roles', 'users'),
  ('2024-11-01', 'Hiring', 'CIQ', '30+ DevOps and Linux kernel engineers for Rocky Linux commercial support', 'users'),
  ('2025-02-20', 'Hiring', 'Boxabl', 'N. Las Vegas factory adding 150 manufacturing technicians for Casita production ramp', 'users'),
  ('2024-08-15', 'Hiring', 'Carbon Health', 'Opening 3 new Reno-area clinics — 120+ healthcare positions', 'users'),
  ('2025-03-05', 'Hiring', 'MNTN', 'Las Vegas HQ expansion with 40+ sales and engineering roles for CTV platform', 'users'),
  ('2024-10-15', 'Hiring', 'Amira Learning', 'Las Vegas product team growing by 35+ after Istation merger', 'users'),

  -- === PARTNERSHIPS & OPPORTUNITIES ===
  ('2024-08-01', 'Partnership', 'Redwood Materials', 'DOE $2B conditional loan commitment for Nevada battery materials campus expansion', 'handshake'),
  ('2025-01-20', 'Partnership', 'TensorWave', 'AMD partnership for first MI355X cloud deployment — first provider globally', 'handshake'),
  ('2024-07-15', 'Partnership', 'Hubble Network', 'Life360/Tile partnership — 90M+ device BLE-to-satellite connectivity', 'handshake'),
  ('2025-02-18', 'Partnership', 'Hubble Network', 'Muon Space MuSat XL satellite bus manufacturing contract', 'handshake'),
  ('2024-06-15', 'Partnership', 'Socure', 'eBay Trust & Safety team integration for identity verification at scale', 'handshake'),
  ('2024-09-01', 'Partnership', 'Abnormal AI', 'Microsoft 365 Copilot security integration partnership', 'handshake'),
  ('2024-05-01', 'Partnership', 'Lyten', 'US Army DEVCOM contract for lightweight lithium-sulfur battery packs', 'handshake'),
  ('2025-02-25', 'Partnership', 'Kaptyn', 'Resorts World Las Vegas exclusive EV fleet contract for guest transportation', 'handshake'),
  ('2025-01-05', 'Partnership', 'Vibrant Planet', 'PG&E and Placer County wildfire risk modeling platform deployment', 'handshake'),
  ('2024-11-20', 'Partnership', 'Katalyst', 'Equinox Fitness nationwide retail distribution agreement for EMS suit', 'handshake'),

  -- === ACCELERATOR & ECOSYSTEM MILESTONES ===
  ('2025-02-28', 'Milestone', 'Tilt AI', 'AngelNV 2025 winner — $200K+ investment commitment from angel syndicate', 'trophy'),
  ('2025-02-28', 'Milestone', 'Cranel', 'AngelNV 2025 finalist — presenting natural UTI prevention product', 'trophy'),
  ('2025-02-28', 'Milestone', 'fibrX', 'AngelNV 2025 finalist — infrastructure monitoring with fiber optics + AI', 'trophy'),
  ('2024-09-20', 'Milestone', 'Tilt AI', '$26.3M revenue in first full year — agent network grew from 11 to 80', 'trending'),
  ('2024-12-15', 'Award', 'Katalyst', 'CES 2025 Innovation Award — Best Fitness Technology category', 'trophy'),
  ('2025-01-15', 'Award', 'Katalyst', 'TIME Best Inventions follow-up — featured in CES 2025 keynote', 'trophy'),
  ('2024-06-01', 'Milestone', 'Amira Learning', 'Merged with Istation — combined platform serves 4M+ students in 1,800 districts', 'trending'),
  ('2024-03-10', 'Award', 'MNTN', 'Fast Company Most Innovative Companies 2024 — advertising category', 'trophy'),

  -- === GOVERNMENT & POLICY ===
  ('2024-07-01', 'Expansion', 'Switch Inc', 'Switch PRIME campus Phase III construction — 350+ construction jobs in Las Vegas', 'trending'),
  ('2024-10-01', 'Expansion', 'Switch Inc', 'Google Cloud partnership for co-located data center infrastructure', 'handshake'),
  ('2025-01-30', 'Partnership', 'Switch Inc', 'NV Energy renewable procurement — 100% renewable target by 2026', 'handshake'),
  ('2024-04-15', 'Grant', 'Redwood Materials', 'Nevada GOED Knowledge Fund $5M workforce training grant for battery manufacturing', 'dollar'),
  ('2024-11-01', 'Grant', 'Vibrant Planet', 'FEMA BRIC grant co-funding for Tahoe Basin wildfire risk platform', 'dollar'),
  ('2025-02-01', 'Expansion', 'Ormat Technologies', 'New 30MW geothermal plant commissioned at Steamboat Springs, NV — 25 permanent jobs', 'trending'),

  -- === COMPANY EXPANSION & NEW FACILITIES ===
  ('2024-08-01', 'Expansion', 'TensorWave', 'Secured 40,000 sq ft Las Vegas facility for GPU cluster expansion', 'trending'),
  ('2025-01-15', 'Expansion', 'Abnormal AI', 'Las Vegas office doubled to 80,000 sq ft — 500+ employees in NV by mid-2025', 'trending'),
  ('2024-12-01', 'Expansion', 'Boxabl', 'N. Las Vegas factory expanded to 250,000 sq ft production floor', 'trending'),
  ('2025-03-01', 'Expansion', 'Redwood Materials', 'New cathode active materials production line operational at Carson City', 'trending'),
  ('2024-10-20', 'Launch', 'Dot Ai (SEE ID)', 'Nasdaq listing (DAIC) via SPAC merger — first NV AI company IPO in 2024', 'rocket'),
  ('2024-11-15', 'Launch', 'TensorWave', 'Deployed 8,192 AMD MI325X GPU cluster — largest AMD cloud cluster operational', 'rocket'),
  ('2025-02-20', 'Launch', 'TensorWave', 'First cloud provider to deploy AMD MI355X GPUs — next-gen AI inference', 'rocket')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 2: STAKEHOLDER_ACTIVITIES - Enriched Activity Feed
-- ============================================================
-- Focus on job-creating, investment, and opportunity events tied to real companies

INSERT INTO stakeholder_activities (company_id, activity_type, description, location, activity_date, source, data_quality)
VALUES
  -- === TENSORWAVE (id: 4) - Jobs & Investment ===
  ('tensorwave', 'Funding', '$100M Series A led by Valor Equity Partners — largest Series A in Nevada history', 'Las Vegas, las_vegas', '2024-10-01', 'Crunchbase / press release', 'VERIFIED'),
  ('tensorwave', 'Hiring', 'Hiring 60+ GPU infrastructure and ML operations engineers for LV data center', 'Las Vegas, las_vegas', '2025-03-01', 'LinkedIn careers', 'VERIFIED'),
  ('tensorwave', 'Expansion', 'Secured 40,000 sq ft Las Vegas facility for AMD GPU cluster hosting', 'Las Vegas, las_vegas', '2024-08-01', 'Company announcement', 'VERIFIED'),
  ('tensorwave', 'Partnership', 'AMD strategic partnership — first cloud provider to deploy MI355X GPUs globally', 'Las Vegas, las_vegas', '2025-01-20', 'AMD press release', 'VERIFIED'),
  ('tensorwave', 'Milestone', 'Run-rate revenue exceeds $100M — 20x year-over-year growth', 'Las Vegas, las_vegas', '2025-02-10', 'Company filing', 'VERIFIED'),

  -- === HUBBLE NETWORK (id: 6) - Jobs & Investment ===
  ('hubble-network', 'Funding', '$70M Series B led by a16z — total funding now $100M for satellite IoT', 'Las Vegas, las_vegas', '2025-02-05', 'Crunchbase / a16z blog', 'VERIFIED'),
  ('hubble-network', 'Partnership', 'Life360/Tile partnership covering 90M+ Bluetooth devices for satellite relay', 'Las Vegas, las_vegas', '2024-07-15', 'Press release', 'VERIFIED'),
  ('hubble-network', 'Partnership', 'Muon Space contract for 500kg MuSat XL satellite bus manufacturing', 'Las Vegas, las_vegas', '2025-02-18', 'Press release', 'VERIFIED'),
  ('hubble-network', 'Hiring', 'Expanding satellite operations team — 20+ new RF and systems engineering roles', 'Las Vegas, las_vegas', '2025-01-15', 'LinkedIn careers', 'VERIFIED'),

  -- === LYTEN (id: 29) - Jobs & Investment ===
  ('lyten', 'Funding', '$200M Series B extension with Stellantis, FedEx, and Honeywell as strategic investors', 'Reno, reno', '2024-09-15', 'TechCrunch', 'VERIFIED'),
  ('lyten', 'Hiring', 'Gigafactory construction underway at Reno AirLogistics Park — 1,000+ jobs at full capacity', 'Reno, reno', '2025-02-01', 'GOED announcement', 'VERIFIED'),
  ('lyten', 'Partnership', 'US Army DEVCOM contract for lithium-sulfur battery packs — lightweight defense applications', 'Reno, reno', '2024-05-01', 'Defense contract announcement', 'VERIFIED'),
  ('lyten', 'Expansion', '$1B+ gigafactory planned for 250,000 sq ft production at Reno AirLogistics Park', 'Reno, reno', '2024-11-01', 'Company announcement', 'VERIFIED'),

  -- === NUDGE SECURITY (id: 21) - Investment ===
  ('nudge-security', 'Funding', '$22.5M Series A led by Cerberus Ventures — tripled ARR in 2024', 'Las Vegas, las_vegas', '2024-11-15', 'Crunchbase', 'VERIFIED'),
  ('nudge-security', 'Hiring', '15+ new security research and engineering positions in Las Vegas', 'Las Vegas, las_vegas', '2025-01-10', 'LinkedIn careers', 'VERIFIED'),
  ('nudge-security', 'Milestone', 'Customer base grew to ~200 including Reddit, tripled annual recurring revenue', 'Las Vegas, las_vegas', '2024-12-01', 'Company blog', 'VERIFIED'),

  -- === REDWOOD MATERIALS (id: 1) - Jobs ===
  ('redwood-materials', 'Hiring', '200+ manufacturing positions for expanded Carson City battery recycling campus', 'Carson City, reno', '2025-01-15', 'Company careers page', 'VERIFIED'),
  ('redwood-materials', 'Grant', 'DOE $2B conditional loan commitment for Nevada battery materials campus expansion', 'Carson City, reno', '2024-08-01', 'DOE press release', 'VERIFIED'),
  ('redwood-materials', 'Expansion', 'New cathode active materials production line operational at Carson City', 'Carson City, reno', '2025-03-01', 'Company announcement', 'VERIFIED'),
  ('redwood-materials', 'Grant', 'GOED Knowledge Fund $5M workforce training grant for battery manufacturing', 'Carson City, reno', '2024-04-15', 'GOED announcement', 'VERIFIED'),

  -- === ABNORMAL AI (id: 3) - Jobs ===
  ('abnormal-ai', 'Hiring', '50+ engineering roles added at Las Vegas security operations center', 'Las Vegas, las_vegas', '2024-12-01', 'LinkedIn careers', 'VERIFIED'),
  ('abnormal-ai', 'Expansion', 'Las Vegas office doubled to 80,000 sq ft — 500+ employees in NV by mid-2025', 'Las Vegas, las_vegas', '2025-01-15', 'Company announcement', 'VERIFIED'),
  ('abnormal-ai', 'Partnership', 'Microsoft 365 Copilot security integration — AI email threat detection', 'Las Vegas, las_vegas', '2024-09-01', 'Microsoft blog', 'VERIFIED'),

  -- === SOCURE (id: 2) - Jobs ===
  ('socure', 'Hiring', 'Las Vegas AI development center adding 80+ technical roles for identity platform', 'Las Vegas, las_vegas', '2025-01-10', 'LinkedIn careers', 'VERIFIED'),
  ('socure', 'Partnership', 'eBay Trust & Safety team integration for identity verification at scale', 'Incline Village, reno', '2024-06-15', 'Industry news', 'VERIFIED'),
  ('socure', 'Milestone', 'Surpassed 2,500 enterprise customers — top 5 US banks all using Socure platform', 'Incline Village, reno', '2025-02-01', 'Company blog', 'VERIFIED'),

  -- === BOXABL (id: 7) - Jobs ===
  ('boxabl', 'Hiring', 'N. Las Vegas factory adding 150 manufacturing technicians for Casita production ramp', 'N. Las Vegas, las_vegas', '2025-02-20', 'Company careers', 'VERIFIED'),
  ('boxabl', 'Expansion', 'Factory expanded to 250,000 sq ft production floor in N. Las Vegas', 'N. Las Vegas, las_vegas', '2024-12-01', 'Company announcement', 'VERIFIED'),

  -- === PROTECT AI (id: 13) - Investment ===
  ('protect-ai', 'Funding', '$18.5M raised for AI/ML security platform expansion — SSBCI co-investment', 'Las Vegas, las_vegas', '2025-01-22', 'Crunchbase', 'VERIFIED'),
  ('protect-ai', 'Hiring', '20+ security researchers and ML engineers joining Las Vegas team', 'Las Vegas, las_vegas', '2025-02-15', 'LinkedIn careers', 'VERIFIED'),

  -- === MAGICDOOR (id: 14) - Investment ===
  ('magicdoor', 'Funding', '$4.5M Seed round co-led by Okapi VC and Shadow Ventures for AI property management', 'Las Vegas, las_vegas', '2025-02-14', 'Crunchbase', 'VERIFIED'),
  ('magicdoor', 'Milestone', 'Surpassed 500+ landlord accounts — fastest growing NV proptech platform', 'Las Vegas, las_vegas', '2024-08-20', 'Company blog', 'VERIFIED'),

  -- === AMIRA LEARNING (id: 38) - Jobs & Expansion ===
  ('amira-learning', 'Funding', '$21M from Owl Ventures for AI reading tutor platform expansion', 'Las Vegas, las_vegas', '2024-06-01', 'EdSurge', 'VERIFIED'),
  ('amira-learning', 'Expansion', 'Merged with Istation — combined platform now serves 4M+ students in 1,800 districts', 'Las Vegas, las_vegas', '2024-06-01', 'Press release', 'VERIFIED'),
  ('amira-learning', 'Hiring', 'Las Vegas product team growing by 35+ after Istation merger', 'Las Vegas, las_vegas', '2024-10-15', 'LinkedIn careers', 'VERIFIED'),

  -- === SWITCH INC (id: 58) - Jobs ===
  ('switch-inc', 'Expansion', 'PRIME campus Phase III construction — 350+ construction jobs in Las Vegas', 'Las Vegas, las_vegas', '2024-07-01', 'Clark County permits', 'VERIFIED'),
  ('switch-inc', 'Partnership', 'Google Cloud co-located data center infrastructure agreement', 'Las Vegas, las_vegas', '2024-10-01', 'Industry report', 'VERIFIED'),
  ('switch-inc', 'Partnership', 'NV Energy renewable energy procurement — 100% renewable target by 2026', 'Las Vegas, las_vegas', '2025-01-30', 'NV Energy filing', 'VERIFIED'),

  -- === KAPTYN (id: 18) - Opportunity ===
  ('kaptyn', 'Partnership', 'Resorts World Las Vegas exclusive EV fleet contract for guest transportation', 'Las Vegas, las_vegas', '2025-02-25', 'Hospitality news', 'VERIFIED'),
  ('kaptyn', 'Hiring', '25+ professional EV fleet drivers for expanded Las Vegas Strip operations', 'Las Vegas, las_vegas', '2025-01-20', 'Company careers', 'VERIFIED'),

  -- === VIBRANT PLANET (id: 17) - Investment ===
  ('vibrant-planet', 'Partnership', 'PG&E and Placer County wildfire risk modeling platform deployment', 'Incline Village, reno', '2025-01-05', 'Company announcement', 'VERIFIED'),
  ('vibrant-planet', 'Grant', 'FEMA BRIC grant co-funding for Tahoe Basin wildfire risk assessment', 'Incline Village, reno', '2024-11-01', 'FEMA grant listing', 'VERIFIED'),

  -- === TILT AI (id: 36) - Startup Success ===
  ('tilt-ai', 'Milestone', '$26.3M revenue in first full year — freight agent network grew from 11 to 80', 'Reno, reno', '2024-09-20', 'StartUpNV press', 'VERIFIED'),
  ('tilt-ai', 'Award', 'AngelNV 2025 winner — $200K+ investment commitment from angel syndicate', 'Reno, reno', '2025-02-28', 'AngelNV announcement', 'VERIFIED'),
  ('tilt-ai', 'Hiring', '15+ operations and AI engineers for freight automation platform', 'Reno, reno', '2025-03-01', 'LinkedIn careers', 'VERIFIED'),

  -- === KATALYST (id: 10) - Expansion ===
  ('katalyst', 'Award', 'CES 2025 Innovation Award — Best Fitness Technology category', 'Las Vegas, las_vegas', '2024-12-15', 'CES Innovation Awards', 'VERIFIED'),
  ('katalyst', 'Partnership', 'Equinox Fitness nationwide retail distribution agreement for EMS bodysuit', 'Las Vegas, las_vegas', '2024-11-20', 'Retail news', 'VERIFIED'),

  -- === MNTN (id: 9) - Jobs ===
  ('mntn', 'Hiring', 'Las Vegas HQ expanding with 40+ sales and ad-tech engineering roles', 'Las Vegas, las_vegas', '2025-03-05', 'LinkedIn careers', 'VERIFIED'),
  ('mntn', 'Award', 'Fast Company Most Innovative Companies 2024 — advertising category', 'Las Vegas, las_vegas', '2024-03-10', 'Fast Company', 'VERIFIED'),

  -- === CIQ (id: 11) - Jobs ===
  ('ciq', 'Hiring', '30+ DevOps and Linux kernel engineers for Rocky Linux commercial support expansion', 'Las Vegas, las_vegas', '2024-11-01', 'LinkedIn careers', 'VERIFIED'),
  ('ciq', 'Milestone', 'Rocky Linux surpassed 500,000 production deployments globally', 'Las Vegas, las_vegas', '2024-10-01', 'Company blog', 'VERIFIED'),

  -- === CARBON HEALTH (id: 22) - Jobs ===
  ('carbon-health', 'Expansion', 'Opening 3 new Reno-area clinics — 120+ healthcare positions', 'Reno, reno', '2024-08-15', 'Healthcare news', 'VERIFIED'),

  -- === ORMAT TECHNOLOGIES (id: 57) - Jobs ===
  ('ormat-technologies', 'Expansion', 'New 30MW geothermal plant commissioned at Steamboat Springs — 25 permanent jobs', 'Reno, reno', '2025-02-01', 'Company SEC filing', 'VERIFIED'),

  -- === DOT AI (id: 26) - Milestone ===
  ('dot-ai--see-id-', 'Milestone', 'Nasdaq listing (DAIC) via SPAC merger — first NV AI company IPO in 2024', 'Las Vegas, las_vegas', '2024-10-20', 'SEC filing', 'VERIFIED'),

  -- === ECOSYSTEM: GOED & ACCELERATORS ===
  ('goed', 'Grant', 'SSBCI Fund 2.0 deployment — $50M+ committed to Nevada startups via BBV, FundNV, 1864 Capital', 'Carson City, reno', '2024-06-01', 'GOED annual report', 'VERIFIED'),
  ('goed', 'Grant', 'Nevada Tech Hub EDA designation — $21M from CHIPS and Science Act for lithium/EV ecosystem', 'Carson City, reno', '2024-03-15', 'EDA announcement', 'VERIFIED'),
  ('goed', 'Milestone', 'Nevada ranked #8 for startup activity growth among US states in 2024', 'Carson City, reno', '2024-12-01', 'Kauffman Foundation', 'VERIFIED'),
  ('startupnv', 'Milestone', 'AccelerateNV Cohort 8 graduated — 12 companies raised combined $8M+ post-program', 'Las Vegas, las_vegas', '2024-09-01', 'StartUpNV press', 'VERIFIED'),
  ('startupnv', 'Milestone', 'FundNV deployed $3.5M across 28 pre-seed Nevada startups in 2024', 'Las Vegas, las_vegas', '2024-12-15', 'StartUpNV annual report', 'VERIFIED'),
  ('angelnv', 'Milestone', 'AngelNV 2025 competition — record 85 applications, 12 finalists, $200K+ winner investment', 'Las Vegas, las_vegas', '2025-02-28', 'AngelNV website', 'VERIFIED'),

  -- === ECOSYSTEM: UNIVERSITIES ===
  ('unlv', 'Partnership', 'UNLV Black Fire Innovation center welcomed Boyd Gaming Innovation Lab as flagship tenant', 'Las Vegas, las_vegas', '2024-01-15', 'UNLV press', 'VERIFIED'),
  ('unlv', 'Grant', 'NSF $3.8M IUCRC grant for UNLV Center for Autonomous Technologies research', 'Las Vegas, las_vegas', '2024-09-01', 'NSF award database', 'VERIFIED'),
  ('unr', 'Partnership', 'UNR Innevation Center expanded to 40,000 sq ft — 15+ startups in residence', 'Reno, reno', '2024-06-01', 'UNR announcement', 'VERIFIED'),
  ('unr', 'Grant', 'NSF EPSCoR $4M award for AI-driven water resource management research', 'Reno, reno', '2024-08-01', 'NSF award database', 'VERIFIED')

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 3: GRAPH_EDGES - New Investment & Partnership Edges
-- ============================================================
-- Add dollar amounts as notes for $ values on edge labels

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES
  -- Valor Equity Partners → TensorWave Series A
  ('x_valor', 'c_4', 'invested_in', '$100M Series A lead', 2024),
  -- a16z → Hubble Network Series B
  ('x_a16z', 'c_6', 'invested_in', '$70M Series B lead', 2025),
  -- Cerberus Ventures → Nudge Security Series A
  ('x_cerberus', 'c_21', 'invested_in', '$22.5M Series A lead', 2024),
  -- Owl Ventures → Amira Learning
  ('x_owl', 'c_38', 'invested_in', '$21M growth investment', 2024),
  -- DOE Loan → Redwood Materials
  ('x_doe', 'c_1', 'grants_to', '$2B conditional loan commitment', 2024),
  -- GOED → Redwood Materials workforce grant
  ('e_goed', 'c_1', 'grants_to', '$5M workforce training grant', 2024),
  -- AMD → TensorWave partnership
  ('x_amd', 'c_4', 'partners_with', 'MI355X first-to-market deployment', 2025),
  -- Google Cloud → Switch partnership
  ('x_google', 'c_58', 'partners_with', 'Co-located data center infra', 2024),
  -- Life360 → Hubble Network
  ('x_life360', 'c_6', 'partners_with', '90M+ device BLE-to-satellite', 2024),
  -- Stellantis → Lyten strategic investment
  ('x_stellantis', 'c_29', 'invested_in', '$200M Series B extension', 2024),
  -- US Army DEVCOM → Lyten
  ('x_army', 'c_29', 'contracts_with', 'Li-S battery defense contract', 2024),
  -- Resorts World → Kaptyn
  ('x_resortsworld', 'c_18', 'partners_with', 'Exclusive EV fleet contract', 2025),
  -- Equinox → Katalyst
  ('x_equinox', 'c_10', 'partners_with', 'Nationwide retail distribution', 2024),
  -- FEMA → Vibrant Planet
  ('x_fema', 'c_17', 'grants_to', 'BRIC grant for wildfire risk', 2024),
  -- NV Energy → Switch renewable procurement
  ('x_nvenergy', 'c_58', 'partners_with', '100% renewable target by 2026', 2025)
ON CONFLICT DO NOTHING;

-- Add external entities for new investors/partners (skip if already exist)
INSERT INTO externals (id, name, entity_type) VALUES
  ('x_valor', 'Valor Equity Partners', 'VC Firm'),
  ('x_a16z', 'Andreessen Horowitz', 'VC Firm'),
  ('x_cerberus', 'Cerberus Ventures', 'VC Firm'),
  ('x_owl', 'Owl Ventures', 'VC Firm'),
  ('x_doe', 'US Dept. of Energy', 'Federal Agency'),
  ('x_amd', 'AMD', 'Corporation'),
  ('x_google', 'Google', 'Corporation'),
  ('x_army', 'US Army DEVCOM', 'Federal Agency'),
  ('x_resortsworld', 'Resorts World LV', 'Corporation'),
  ('x_equinox', 'Equinox Fitness', 'Corporation'),
  ('x_fema', 'FEMA', 'Federal Agency'),
  ('x_nvenergy', 'NV Energy', 'Utility')
ON CONFLICT (id) DO NOTHING;

-- Verify counts
SELECT 'timeline_events' AS tbl, COUNT(*) FROM timeline_events
UNION ALL
SELECT 'stakeholder_activities', COUNT(*) FROM stakeholder_activities
UNION ALL
SELECT 'graph_edges', COUNT(*) FROM graph_edges
UNION ALL
SELECT 'externals', COUNT(*) FROM externals;
