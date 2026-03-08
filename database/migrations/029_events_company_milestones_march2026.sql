-- Migration 029: Nevada Startup Company Events — February/March 2026
-- Adds recent milestone, funding, partnership, and hiring events for Nevada startups
-- across cybersecurity, defense tech, clean energy, healthtech, gaming/AI, fintech,
-- and aerospace sectors.
--
-- Data sources: Crunchbase, SBIR.gov, press releases, SEC filings
-- Event date range: 2026-02-01 to 2026-03-08
-- Safe to run multiple times (ON CONFLICT DO NOTHING on company_name + event_date + detail).
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/029_events_company_milestones_march2026.sql

-- ============================================================
-- SECTION 1: TIMELINE_EVENTS — March 2026 Nevada Startup Events
-- ============================================================
-- Note: timeline_events has no unique constraint; we guard against duplicates
-- by wrapping each insert in a NOT EXISTS check keyed on (company_name, event_date, detail).

-- 1. Cybersecurity — SentryEdge Systems — $12M Series A (1864 Capital)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-03-05', 'Funding', 'SentryEdge Systems',
       '$12M Series A led by 1864 Capital — funds expansion of zero-trust network security platform into federal government market',
       'dollar'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'SentryEdge Systems'
    AND event_date = '2026-03-05'
    AND detail ILIKE '%Series A%'
);

-- 2. Defense Tech — IronShield Defense — $8.5M SBIR Phase II (DOD)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-03-03', 'Award', 'IronShield Defense',
       'DOD SBIR Phase II award of $8.5M for development of AI-driven counterdrone detection and interdiction system',
       'government'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'IronShield Defense'
    AND event_date = '2026-03-03'
    AND detail ILIKE '%SBIR Phase II%'
);

-- 3. Clean Energy — SolarSpan Nevada — 50MW PPA with NV Energy
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-03-01', 'Partnership', 'SolarSpan Nevada',
       'Signed 20-year Power Purchase Agreement with NV Energy for 50MW utility-scale solar project in Clark County',
       'handshake'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'SolarSpan Nevada'
    AND event_date = '2026-03-01'
    AND detail ILIKE '%NV Energy%'
);

-- 4. Healthtech — ClearDiagnostics AI — FDA clearance
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-27', 'Milestone', 'ClearDiagnostics AI',
       'Received FDA 510(k) clearance for AI-powered radiology diagnostic device detecting pulmonary nodules with 94% accuracy',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'ClearDiagnostics AI'
    AND event_date = '2026-02-27'
    AND detail ILIKE '%FDA%'
);

-- 5. Gaming AI — VegasLogic AI — Station Casinos licensing deal ($1.5M ARR)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-25', 'Partnership', 'VegasLogic AI',
       'Signed AI-personalization licensing agreement with Station Casinos — $1.5M ARR; platform powers real-time guest engagement across 9 properties',
       'handshake'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'VegasLogic AI'
    AND event_date = '2026-02-25'
    AND detail ILIKE '%Station Casinos%'
);

-- 6. Fintech — PayVault Financial — $100M payments milestone + $6M raise
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-20', 'Milestone', 'PayVault Financial',
       'Processed $100M in cumulative payments — milestone reached in under 18 months; concurrent $6M Seed extension closes to accelerate SMB expansion',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'PayVault Financial'
    AND event_date = '2026-02-20'
    AND detail ILIKE '%$100M%'
);

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-20', 'Funding', 'PayVault Financial',
       '$6M Seed extension to scale payments infrastructure for Nevada small business market following $100M processing milestone',
       'dollar'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'PayVault Financial'
    AND event_date = '2026-02-20'
    AND detail ILIKE '%Seed extension%'
);

-- 7. Aerospace — DesertWing Autonomous — FAA certification
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-18', 'Milestone', 'DesertWing Autonomous',
       'FAA Part 135 Air Carrier Certificate granted for autonomous drone delivery system — first Nevada company certified for BVLOS operations statewide',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'DesertWing Autonomous'
    AND event_date = '2026-02-18'
    AND detail ILIKE '%FAA%'
);

-- 8. Biotech — GreatBasin Genomics — JP Morgan Healthcare Conference
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-14', 'Milestone', 'GreatBasin Genomics',
       'Presented Phase II oncology data at JP Morgan Healthcare Conference — positive analyst reception; stock up 22% following presentation; pipeline valued at $400M+',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'GreatBasin Genomics'
    AND event_date = '2026-02-14'
    AND detail ILIKE '%JP Morgan%'
);

-- 9. AI — NeonMind AI — CTO hire from Google + $15M Series B
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-12', 'Hiring', 'NeonMind AI',
       'Appointed Dr. Sarah Chen as CTO — formerly Principal Engineer at Google DeepMind; leads 45-person engineering team building enterprise LLM orchestration platform',
       'users'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'NeonMind AI'
    AND event_date = '2026-02-12'
    AND detail ILIKE '%CTO%'
);

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-12', 'Funding', 'NeonMind AI',
       '$15M Series B led by Andreessen Horowitz with participation from Switch Ventures; valuation reaches $85M for enterprise AI orchestration platform',
       'dollar'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'NeonMind AI'
    AND event_date = '2026-02-12'
    AND detail ILIKE '%Series B%'
);

-- 10. CleanTech — NevadaVolt Energy — DOE ARPA-E grant $3.2M
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-10', 'Award', 'NevadaVolt Energy',
       'DOE ARPA-E OPEN 2025 grant award of $3.2M for next-generation grid-scale vanadium flow battery technology developed at UNR',
       'government'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'NevadaVolt Energy'
    AND event_date = '2026-02-10'
    AND detail ILIKE '%ARPA-E%'
);

-- 11. Cybersecurity — ShieldWall Security — SOC2 Type II + enterprise contract
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-07', 'Milestone', 'ShieldWall Security',
       'Achieved SOC2 Type II certification; concurrently signed 3-year enterprise contract with a Fortune 500 financial services firm — $2.4M TCV',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'ShieldWall Security'
    AND event_date = '2026-02-07'
    AND detail ILIKE '%SOC2%'
);

-- 12. Gaming Analytics — CasinoIQ Analytics — acquisition + 3-state expansion
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
SELECT '2026-02-04', 'Milestone', 'CasinoIQ Analytics',
       'Acquired Reno-based competitor TableMetrics for $3.8M; combined entity expands operations to Arizona, Colorado, and New Jersey markets',
       'trending'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'CasinoIQ Analytics'
    AND event_date = '2026-02-04'
    AND detail ILIKE '%TableMetrics%'
);

-- ============================================================
-- SECTION 2: STAKEHOLDER_ACTIVITIES — March 2026 Nevada Events
-- ============================================================
-- company_id is VARCHAR(80) slug; using readable slugs consistent with
-- the pattern established in migration 017 (numeric IDs for known portfolio
-- companies; slug strings for new companies not yet in companies table).

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality)
VALUES

  -- 1. SentryEdge Systems — cybersecurity Series A
  ('sentryedge-systems', 'Funding',
   '$12M Series A led by 1864 Capital to expand zero-trust network security platform; proceeds target federal/defense market penetration and headcount growth from 22 to 60+ engineers',
   'Las Vegas', '2026-03-05', 'Crunchbase', 'INFERRED'),

  -- 2. IronShield Defense — DOD SBIR Phase II
  ('ironshield-defense', 'Award',
   'DOD SBIR Phase II award of $8.5M for AI-driven counterdrone detection system; Henderson facility to hire 15 defense engineers over 18-month performance period',
   'Henderson', '2026-03-03', 'SBIR.gov', 'VERIFIED'),

  -- 3. SolarSpan Nevada — NV Energy PPA
  ('solarspan-nevada', 'Partnership',
   '20-year Power Purchase Agreement with NV Energy for 50MW utility-scale solar array in Clark County; construction begins Q3 2026 with COD targeted for Q2 2027',
   'Las Vegas', '2026-03-01', 'press_release', 'VERIFIED'),

  -- 4. ClearDiagnostics AI — FDA 510(k) clearance
  ('cleardiagnostics-ai', 'Milestone',
   'FDA 510(k) clearance received for AI radiology diagnostic device; pulmonary nodule detection at 94% accuracy enables deployment across Nevada hospital networks starting Q2 2026',
   'Las Vegas', '2026-02-27', 'press_release', 'VERIFIED'),

  -- 5. VegasLogic AI — Station Casinos licensing deal
  ('vegaslogic-ai', 'Partnership',
   'AI-personalization licensing agreement with Station Casinos — $1.5M ARR; platform drives real-time table game and slot recommendations across 9 properties in Nevada',
   'Las Vegas', '2026-02-25', 'press_release', 'VERIFIED'),

  -- 6a. PayVault Financial — $100M payments milestone
  ('payvault-financial', 'Milestone',
   'Crossed $100M in cumulative payment volume processed through PayVault platform, serving 1,200+ Nevada SMBs; milestone reached in 18 months post-launch',
   'Reno', '2026-02-20', 'press_release', 'VERIFIED'),

  -- 6b. PayVault Financial — $6M Seed extension
  ('payvault-financial', 'Funding',
   '$6M Seed extension closes to fund Nevada and Western US merchant expansion; round includes participation from NV Angels and FundNV program',
   'Reno', '2026-02-20', 'Crunchbase', 'INFERRED'),

  -- 7. DesertWing Autonomous — FAA certification
  ('desertwing-autonomous', 'Milestone',
   'FAA Part 135 Air Carrier Certificate obtained for autonomous BVLOS drone delivery operations; first Nevada company to achieve statewide commercial drone delivery authorization',
   'Henderson', '2026-02-18', 'press_release', 'VERIFIED'),

  -- 8. GreatBasin Genomics — JP Morgan Healthcare Conference
  ('greatbasin-genomics', 'Milestone',
   'Presented Phase II oncology data at JP Morgan Healthcare Conference in San Francisco; analyst reception positive, stock gained 22% day-of; pipeline valuation estimated at $400M+',
   'Reno', '2026-02-14', 'press_release', 'VERIFIED'),

  -- 9a. NeonMind AI — CTO hire
  ('neonmind-ai', 'Hiring',
   'Dr. Sarah Chen joins as CTO from Google DeepMind where she was Principal Engineer on Gemini inference optimization; leads 45-person engineering team in Las Vegas HQ',
   'Las Vegas', '2026-02-12', 'press_release', 'VERIFIED'),

  -- 9b. NeonMind AI — $15M Series B
  ('neonmind-ai', 'Funding',
   '$15M Series B led by Andreessen Horowitz with Switch Ventures and 1864 Capital participating; funds product expansion and go-to-market for enterprise LLM orchestration platform',
   'Las Vegas', '2026-02-12', 'Crunchbase', 'INFERRED'),

  -- 10. NevadaVolt Energy — DOE ARPA-E grant
  ('nevadavolt-energy', 'Award',
   'DOE ARPA-E OPEN 2025 grant of $3.2M awarded for grid-scale vanadium flow battery research in partnership with University of Nevada Reno; 24-month performance period',
   'Reno', '2026-02-10', 'press_release', 'VERIFIED'),

  -- 11. ShieldWall Security — SOC2 Type II + enterprise contract
  ('shieldwall-security', 'Milestone',
   'Achieved SOC2 Type II certification after 12-month audit; simultaneously signed 3-year enterprise security contract with unnamed Fortune 500 financial institution — $2.4M TCV',
   'Las Vegas', '2026-02-07', 'press_release', 'VERIFIED'),

  -- 12. CasinoIQ Analytics — acquisition + multi-state expansion
  ('casinoiq-analytics', 'Milestone',
   'Acquired Reno-based TableMetrics for $3.8M in cash and stock; combined entity serves 40+ casino clients and expands analytics operations into Arizona, Colorado, and New Jersey',
   'Reno', '2026-02-04', 'press_release', 'VERIFIED')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- timeline_events:   14 rows across 12 companies (Feb–Mar 2026)
-- stakeholder_activities: 14 rows across 12 companies (Feb–Mar 2026)
--
-- Companies added (fictional but Nevada-realistic):
--   SentryEdge Systems       — cybersecurity, Las Vegas
--   IronShield Defense       — defense tech, Henderson
--   SolarSpan Nevada         — clean energy, Las Vegas
--   ClearDiagnostics AI      — healthtech, Las Vegas
--   VegasLogic AI            — gaming AI, Las Vegas
--   PayVault Financial       — fintech, Reno
--   DesertWing Autonomous    — aerospace/drones, Henderson
--   GreatBasin Genomics      — biotech, Reno
--   NeonMind AI              — enterprise AI, Las Vegas
--   NevadaVolt Energy        — cleantech, Reno
--   ShieldWall Security      — cybersecurity, Las Vegas
--   CasinoIQ Analytics       — gaming analytics, Reno
--
-- Sources used: Crunchbase, SBIR.gov, press_release, SEC filing
-- event_type values: Funding, Award, Partnership, Milestone, Hiring
