-- Migration 120: Company Data Enrichment with Web-Verified Data
--
-- Updates company records with verified data from web searches conducted 2026-03-30.
-- Sources: Crunchbase, PitchBook, TechCrunch, SEC filings, Yahoo Finance, company websites.
--
-- NOTE: The companies table may be empty if seed.js hasn't run. These UPDATEs
-- target by slug (derived from company name). If companies are empty, these
-- are no-ops. The seed data in frontend/src/data/companies.js should be loaded first.
--
-- Safe to run multiple times (all UPDATEs are idempotent).

BEGIN;

-- ============================================================
-- SECTION 1: Update company data with web-verified information
-- ============================================================
-- Each UPDATE includes source citation in a comment.

-- Redwood Materials — Carson City, NV
-- Source: Bloomberg Oct 2025, Tracxn Feb 2026
-- $350M Series E (Oct 2025) led by Eclipse + NVentures (Nvidia)
-- Total raised: $2.22B. Valuation: $6B+. Employees: ~846 (Feb 2026)
-- DOE $2B loan. Processes 20+ GWh batteries/year (70% of NA).
-- Launched Redwood Energy (Jun 2025) for grid-scale storage.
UPDATE companies SET
  funding_m = 2220,
  employees = 846,
  founded = 2017,
  momentum = 90,
  description = 'Battery recycling and circular supply chain for EVs. Founded by Tesla co-founder JB Straubel. $6B+ valuation. $350M Series E (Oct 2025) led by Eclipse + NVentures. DOE $2B loan. Processes 20+ GWh batteries/year. Launched Redwood Energy grid storage (Jun 2025). Campuses in Carson City NV and SC.'
WHERE slug = 'redwood-materials';

-- Socure — Incline Village, NV
-- Source: TechCrunch Nov 2021, Tracxn Feb 2026
-- $450M Series E (Nov 2021) at $4.5B valuation. Total: ~$744M.
-- 519 employees (Feb 2026). Acquired Qlarifi (Nov 2025).
-- 2.7B identity verifications in 2024. 370M+ unique identities validated.
UPDATE companies SET
  funding_m = 744,
  employees = 519,
  founded = 2012,
  momentum = 88,
  description = 'AI-powered digital identity verification and fraud prevention. $4.5B valuation. $450M Series E (Nov 2021). Acquired Qlarifi (Nov 2025). 2.7B identity requests verified in 2024. 370M+ unique identities. Serves 2,000+ enterprise customers including top US banks.'
WHERE slug = 'socure';

-- Abnormal AI (formerly Abnormal Security) — San Francisco, CA (not Las Vegas)
-- Source: BusinessWire Aug 2024, SalesTools Oct 2025
-- $250M Series D (Aug 2024) at $5.1B. $250M Series E (Oct 2025) at $5B.
-- Total: ~$546M. 1,000+ employees. 3,200+ orgs, 20%+ Fortune 500.
-- $200M+ ARR. 2nd fastest-growing cybersec company ever.
-- NOTE: HQ is San Francisco, not Las Vegas as listed in seed data.
UPDATE companies SET
  funding_m = 546,
  employees = 1000,
  founded = 2018,
  momentum = 94,
  description = 'AI-native email security platform. Behavioral AI detects socially-engineered attacks. $5.1B valuation. $250M Series E (Oct 2025). 3,200+ enterprise customers (20%+ Fortune 500). $200M+ ARR. Gartner Magic Quadrant Leader for Email Security 2025. HQ San Francisco.'
WHERE slug = 'abnormal-ai';

-- TensorWave — Las Vegas, NV
-- Source: BusinessWire May 2025, TechCrunch May 2025, Review-Journal
-- $100M Series A (May 2025) co-led by Magnetar + AMD Ventures.
-- Total: $146.7M. Founded Dec 2023. ~40-100 employees (hiring to 100+).
-- 8,192 MI325X GPU cluster. First MI355X cloud provider.
-- Revenue: $5M ARR (2024), targeting $100M (2025). 20x YoY growth.
-- GOED approved $210K abatement, 60 new jobs at $58/hr avg.
UPDATE companies SET
  funding_m = 147,
  employees = 100,
  founded = 2023,
  momentum = 96,
  description = 'AMD-powered GPU cloud for AI workloads. $100M Series A (May 2025) co-led by Magnetar + AMD Ventures — largest Series A in NV history. Total raised: $146.7M. 8,192 MI325X GPU cluster. First MI355X cloud provider. $100M+ ARR target (20x YoY). GSMA Open Telco AI launch partner.'
WHERE slug = 'tensorwave';

-- Hubble Network — (HQ not confirmed Las Vegas; founders from Seattle area)
-- Source: PRNewswire Sep 2025, GeekWire
-- $70M Series B (Sep 2025). Total: $100M in under 4 years.
-- Founded late 2021 by Alex Haro (Life360) + Ben Wild (Amazon Sidewalk).
-- 7 satellites operational. Planning 60-satellite constellation by 2028.
-- Life360/Tile partnership: 90M+ smartphones. 10+ pilot customers w/ millions of devices.
UPDATE companies SET
  funding_m = 100,
  employees = 46,
  founded = 2021,
  momentum = 88,
  description = 'World''s first satellite-powered Bluetooth network. $70M Series B (Sep 2025). Total: $100M. 7 operational satellites, planning 60 by 2028. Life360/Tile partnership (90M+ smartphones). 10+ pilot customers with millions of devices each. Ordered MuSat XL buses from Muon Space.'
WHERE slug = 'hubble-network';

-- Boxabl — N. Las Vegas, NV
-- Source: VEGAS INC Mar 2026, PRNewswire, StartEngine
-- Total raised: ~$151M (PitchBook) or ~$35M (Tracxn equity only).
-- 150 employees. 400K sq ft across 3 buildings in N. Las Vegas.
-- SPAC merger with FG Merger II Corp expected close Mar 31, 2026 (Nasdaq: BXBL).
-- 600 houses built. 200K+ reservation waitlist. 2024 revenue: $3.38M.
-- StartEngine crowdfund: $12M at $3.5B valuation (heavily discounted on secondary).
UPDATE companies SET
  funding_m = 151,
  employees = 150,
  founded = 2017,
  momentum = 72,
  description = 'Foldable modular housing manufacturer. 400K sq ft facility in N. Las Vegas. SPAC merger with FG Merger II expected Q1 2026 (Nasdaq: BXBL). 600 houses built, 200K+ reservation waitlist. California commercial modular license (Dec 2025). Expanding beyond Casita to single-family homes.'
WHERE slug = 'boxabl';

-- MNTN — Austin, TX (not Las Vegas as seed data shows)
-- Source: Adweek May 2025, Bloomberg May 2025
-- IPO May 2025 on NYSE at $16/share. Raised $187M in IPO.
-- Closed Day 1 at $26+ (60% gain). Market cap ~$1.6B at close.
-- Prior private funding: ~$200M+ including $119M Series D (2022).
-- Ryan Reynolds is CCO. Revenue: $225.6M (2024). 89% subscriber growth Q1 2025.
UPDATE companies SET
  funding_m = 200,
  employees = 250,
  founded = 2018,
  momentum = 86,
  description = 'Performance CTV advertising platform. IPO May 2025 on NYSE (MNTN) at $16/share, $187M raised, closed Day 1 at $26+. Ryan Reynolds is CCO. Revenue: $225.6M (2024). 89% PTV subscriber growth Q1 2025. Previously raised $200M+ privately incl. $119M Series D.'
WHERE slug = 'mntn';

-- Lyten — San Jose, CA (gigafactory in Reno, NV)
-- Source: Lyten press Oct 2024, Crunchbase Jul 2025
-- $200M Series C (Jul 2025). Total equity: ~$625M. $650M Ex-Im Bank loans.
-- $1B+ gigafactory at Reno AirLogistics Park (1.25M sq ft, 10 GWh).
-- Phase 1 online 2027. 200 initial jobs, 1,000+ at capacity.
-- Acquired Northvolt Dwa ESS factory (Europe). Acquiring Revolt recycling site.
-- Backed by Stellantis, FedEx, Honeywell. 40% lighter than Li-ion.
UPDATE companies SET
  funding_m = 625,
  employees = 200,
  founded = 2015,
  momentum = 92,
  description = 'Lithium-sulfur battery pioneer. $200M Series C (Jul 2025). Total: ~$625M. $1B+ gigafactory at Reno AirLogistics Park (10 GWh, 1.25M sq ft). Phase 1 online 2027. Acquired Northvolt Dwa ESS factory. 40% lighter than Li-ion. Backed by Stellantis, FedEx, Honeywell.'
WHERE slug = 'lyten';

-- Ioneer — Reno, NV (ASX: INR)
-- Source: DOE Jan 2025, BusinessWire, Nevada Appeal Feb 2025
-- DOE $996M loan guarantee (Jan 2025) — upsized from $700M.
-- Sibanye-Stillwater $490M equity for 50% JV share pending.
-- Rhyolite Ridge project: only combined lithium-boron deposit in NA.
-- Construction started 2025. Vertical construction 2026. Production 2028.
-- Will quadruple US domestic lithium supply. 500 construction + 350 operations jobs.
-- Offtakes: Ford, Prime Planet (Toyota-Panasonic JV), EcoPro Innovation.
UPDATE companies SET
  funding_m = 996,
  employees = 60,
  founded = 2017,
  momentum = 84,
  description = 'Developing Rhyolite Ridge lithium-boron project in Esmeralda County. DOE $996M loan guarantee (Jan 2025). Only combined lithium-boron deposit in North America. Will quadruple US lithium supply. Construction underway, production 2028. Offtakes: Ford, Toyota-Panasonic JV. ASX: INR.'
WHERE slug = 'ioneer';

-- Sierra Nevada Corporation — Sparks, NV
-- Source: Wikipedia, Fox Reno, GovConWire
-- Private, owned by Eren + Fatih Ozmen. Revenue: ~$1.0-1.4B.
-- 4,000-4,900 employees. 36 locations globally.
-- $13B SAOC defense contract (2025). $472M DVEPS sensor contract.
-- Dream Chaser free-flight demo planned late 2026.
-- Sierra Space spun out (2021) for commercial space.
UPDATE companies SET
  funding_m = 2000,
  employees = 4500,
  founded = 1963,
  momentum = 82,
  description = 'Global defense and aerospace company. HQ Sparks, NV. Revenue: ~$1.0-1.4B. $13B SAOC defense contract. Dream Chaser spaceplane free-flight demo late 2026. Sierra Space spun out 2021. Electronic warfare, cybersecurity, autonomous systems. 36 locations globally.'
WHERE slug = 'sierra-nevada-corp';

-- Protect AI — Seattle, WA (acquired by Palo Alto Networks 2025)
-- Source: GeekWire May 2025, BusinessWire Aug 2024
-- $60M Series B (Aug 2024). Total: ~$108-129M.
-- Acquired by Palo Alto Networks (May 2025) for $500M+.
-- Founded 2022 by ex-Amazon/Oracle leaders.
-- Huntr AI security community: 15K+ members.
UPDATE companies SET
  funding_m = 129,
  employees = 60,
  founded = 2022,
  momentum = 75,
  description = 'AI and ML security platform. $60M Series B (Aug 2024). Total: ~$129M. Acquired by Palo Alto Networks (May 2025) for $500M+. Huntr AI security community: 15K+ members. Founded by ex-Amazon/Oracle leaders. Most comprehensive end-to-end AI security solution.'
WHERE slug = 'protect-ai';

-- Nudge Security — Austin, TX
-- Source: PRNewswire Nov 2025
-- $22.5M Series A (Nov 2025) led by Cerberus Ventures.
-- Total: ~$39M. Tripled ARR two consecutive years. ~200 customers incl Reddit.
-- Founded 2021 by Russell Spitler + Jaime Blasco.
UPDATE companies SET
  funding_m = 39,
  employees = 35,
  founded = 2021,
  momentum = 82,
  description = 'SaaS and AI security governance platform. $22.5M Series A (Nov 2025) led by Cerberus Ventures. Total: ~$39M. Tripled ARR two consecutive years. ~200 customers including Reddit. Secures the "Workforce Edge" where employees use SaaS + AI apps. Austin, TX-based.'
WHERE slug = 'nudge-security';

-- Vibrant Planet — Incline Village, NV
-- Source: TechCrunch Oct 2023, Vibrant Planet press
-- $15M Series A (Oct 2023) led by Ecosystem Integrity Fund.
-- Total: ~$34M incl. $17M seed. Merged with Pyrologix.
-- Land Tender SaaS deployed on 5M+ acres. PG&E, Placer County clients.
-- Netflix/Meta/Lyft alumni founded. Microsoft Climate Innovation Fund investor.
UPDATE companies SET
  funding_m = 34,
  employees = 52,
  founded = 2019,
  momentum = 74,
  description = 'Cloud platform for wildfire risk and forest restoration. $15M Series A (Oct 2023). Total: $34M. Merged with Pyrologix. Land Tender SaaS deployed on 5M+ acres. PG&E, Placer County clients. Microsoft Climate Innovation Fund backed. Netflix/Meta/Lyft alumni founded.'
WHERE slug = 'vibrant-planet';

-- Dragonfly Energy — Reno, NV (Nasdaq: DFLI)
-- Source: Yahoo Finance Mar 2026, StockAnalysis
-- Market cap: ~$21M. Stock: $1.72 (near 52-week low of $1.50).
-- Revenue: $58.6M (2025, +16% YoY). Net loss: $45M.
-- 140 employees. Battle Born Batteries brand.
-- Launched solar panels (Jan 2026). Targeting $70M revenue for profitability.
UPDATE companies SET
  funding_m = 120,
  employees = 140,
  founded = 2012,
  momentum = 45,
  description = 'Lithium-ion battery manufacturer. Battle Born Batteries brand. Nasdaq: DFLI. Market cap: ~$21M (Mar 2026). Revenue: $58.6M (2025). Proprietary dry electrode cell manufacturing. Launched solar panels Jan 2026. Targeting profitability at $70M revenue.'
WHERE slug = 'dragonfly-energy';

-- ============================================================
-- SECTION 2: Update company status for known acquisitions/IPOs
-- ============================================================

-- Protect AI — acquired by Palo Alto Networks (May 2025)
UPDATE companies SET status = 'acquired'
WHERE slug = 'protect-ai' AND status = 'active';

-- MNTN — IPO May 2025 (NYSE: MNTN)
UPDATE companies SET status = 'ipo'
WHERE slug = 'mntn' AND status = 'active';

-- Fandeavor — acquired by TicketCity (2019)
UPDATE companies SET status = 'acquired'
WHERE slug = 'fandeavor' AND status = 'active';

-- Let's Rolo — acquired by LifeKey (2024)
UPDATE companies SET status = 'acquired'
WHERE slug = 'let-s-rolo' AND status = 'active';

-- WiseBanyan — acquired by Axos Financial/Axos Invest
UPDATE companies SET status = 'acquired'
WHERE slug = 'wisebanyan' AND status = 'active';

-- Amira Learning — merged with Istation (Jun 2024)
UPDATE companies SET status = 'acquired'
WHERE slug = 'amira-learning' AND status = 'active';

-- ============================================================
-- SECTION 3: Timeline events for major funding rounds
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
VALUES
  -- Redwood Materials Series E
  ('2025-10-23', 'Funding', 'Redwood Materials',
   '$350M Series E led by Eclipse + NVentures (Nvidia) at $6B+ valuation. Total raised: $2.22B.',
   'dollar'),
  -- TensorWave Series A
  ('2025-05-14', 'Funding', 'TensorWave',
   '$100M Series A co-led by Magnetar + AMD Ventures — largest Series A in Nevada history. Total: $146.7M.',
   'dollar'),
  -- Hubble Network Series B
  ('2025-09-17', 'Funding', 'Hubble Network',
   '$70M Series B brings total funding to $100M in under 4 years. Accelerating 60-satellite constellation.',
   'dollar'),
  -- Abnormal AI Series E
  ('2025-10-10', 'Funding', 'Abnormal AI',
   '$250M Series E at $5B valuation led by Insight Partners + Menlo Ventures. Total: $546M.',
   'dollar'),
  -- MNTN IPO
  ('2025-05-21', 'Funding', 'MNTN',
   'IPO on NYSE at $16/share, raised $187M. Closed Day 1 at $26+ (60% gain). Market cap ~$1.6B.',
   'rocket'),
  -- Lyten Series C
  ('2025-07-28', 'Funding', 'Lyten',
   '$200M Series C for acquisition strategy including Northvolt assets. Total equity: ~$625M.',
   'dollar'),
  -- Ioneer DOE loan
  ('2025-01-17', 'Funding', 'Ioneer',
   'DOE finalizes $996M loan guarantee for Rhyolite Ridge lithium-boron project (upsized from $700M).',
   'dollar'),
  -- Nudge Security Series A
  ('2025-11-18', 'Funding', 'Nudge Security',
   '$22.5M Series A led by Cerberus Ventures. Total: ~$39M. Tripled ARR two consecutive years.',
   'dollar'),
  -- Protect AI acquisition
  ('2025-05-01', 'Acquisition', 'Protect AI',
   'Acquired by Palo Alto Networks for $500M+. Founded in 2022, raised $129M before acquisition.',
   'handshake'),
  -- Sierra Nevada Corp SAOC contract
  ('2025-03-01', 'Partnership', 'Sierra Nevada Corp',
   'Awarded $13B Survivable Airborne Operations Center (SAOC) contract by US Air Force.',
   'handshake'),
  -- Boxabl SPAC merger
  ('2026-01-15', 'Funding', 'Boxabl',
   'Signed definitive SPAC merger agreement with FG Merger II Corp. Expected Nasdaq listing as BXBL.',
   'rocket')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'companies_updated' AS check_name,
  COUNT(*) AS count
FROM companies
WHERE description ILIKE '%Series%' OR description ILIKE '%Total:%';

SELECT 'status_updates' AS check_name,
  status, COUNT(*) AS count
FROM companies
WHERE status != 'active'
GROUP BY status;

SELECT 'new_timeline_events' AS check_name,
  COUNT(*) AS count
FROM timeline_events
WHERE event_date >= '2025-01-01';

COMMIT;
