-- Migration 153: Remove fabricated/unverifiable events from consolidated events table
--
-- AUDIT CONTEXT:
-- Migrations 111/112/115/152 cleaned fabricated ENTITIES (companies, externals).
-- Migrations 044/045/048/050 cleaned some fabricated timeline_events and stakeholder_activities.
-- However, migration 113 consolidated everything into the `events` table, and migration 124
-- re-absorbed from timeline_events/stakeholder_activities. Many fabricated events were absorbed
-- into `events` BEFORE the cleanup migrations ran, so the `events` table still contains
-- fabricated data from the original seeds (migrations 024-030, 042, 093, 133).
--
-- This migration removes ALL remaining fabricated and unverifiable events from the `events`
-- table, keeping only events that reference verified entities with verifiable claims.
--
-- METHODOLOGY: Every event was traced back to its origin migration and cross-referenced
-- against the fabricated entity lists from migrations 112, 115, and 152. Events were also
-- checked for fabricated legislation, fake dollar amounts, fake programs, and unverifiable
-- specific claims.
--
-- CATEGORIES REMOVED:
--
-- A. EVENTS REFERENCING FABRICATED COMPANIES (already deleted from companies/externals):
--    Tilt AI, fibrX, Skydio Gov, Protect AI, Nuvve Corp, SiO2 Materials, Sapien,
--    Cognizer AI, CoolEdge Thermal, NeonCore Systems, VaultGrid Technologies, ArcadeIQ AI,
--    NevadaVolt Energy, PeakHealth Analytics, Truckee Robotics, QuantumEdge NV, ArtemisAg,
--    TitanShield, HelioPath, NanoShield NV, AquaGenica, PackBot AI, NevadaMed, DesertDrive,
--    ClearVault, LunarBuild, BioNVate Therapeutics, Sagebrush Research Consortium,
--    VegasLogic AI, PayVault Financial, DesertWing Autonomous, GreatBasin Genomics,
--    NeonMind AI, ShieldWall Security, CasinoIQ Analytics, TableMetrics, Batjac Ventures,
--    SentryEdge Systems, IronShield Defense, SolarSpan Nevada, ClearDiagnostics AI,
--    ShieldOps, SentinelEdge, QuantumEdge AI
--
-- B. EVENTS REFERENCING FABRICATED EXTERNAL ENTITIES (already deleted):
--    Wynn Family Office (x_200), CalPERS Innovation Fund (x_211),
--    Station Casinos Ventures (x_201), Switch Ventures (x_202),
--    Playa Capital Group (x_203), Reno Spark Ecosystem (x_235)
--
-- C. EVENTS WITH FABRICATED LEGISLATION / PROGRAMS:
--    SB 47 "AI Innovation Tax Credit" -- no such bill
--    HB 223 "Advanced Manufacturing Incentive Package" -- no such bill
--    "InnovateNV Phase 0" -- no such program
--    "Nevada Startup Report 2025" with specific statistics -- fabricated
--    NV Economic Forum "$340M projection" -- fabricated
--    Governor SBIR Letters of Support for fabricated companies
--    "GOED Q1 SBIR Matching Grants $2.1M to 14 companies" -- fabricated specifics
--    "GOED/Switch MOU for colocation credits" -- fabricated
--    NV PERS "$50M venture allocation" -- fabricated specific amount
--    NV State Treasurer "$25M Nevada Innovation Fund" -- fabricated
--    "SSBCI program extension through 2028" -- fabricated
--
-- D. EVENTS WITH UNVERIFIABLE CORPORATE CLAIMS (from migration 026):
--    Switch "Prime FIVE 1.2M sq ft expansion" -- unverifiable specific
--    MGM AI personalization platform (unnamed startup) -- unverifiable
--    Tesla "100 GWh milestone" -- unverifiable specific
--    Station Casinos "$25M venture fund" -- entity fabricated
--    Switch-TensorWave "5-year 4,096-GPU cluster" -- unverifiable
--    LVCVA "smart venue pilot" -- unverifiable
--    eBay "200 Trust & Safety hires" -- unverifiable specifics
--    MGM Tech Labs "Cohort 2" -- unverifiable
--
-- E. EVENTS WITH FABRICATED CROSS-STAKEHOLDER PARTNERSHIPS (from migration 030):
--    All 12 ecosystem partnership events -- either reference fabricated entities
--    or make unverifiable specific claims about dollar amounts and programs
--
-- F. EVENTS WITH FABRICATED RISK CAPITAL DETAILS (from migration 027):
--    BBV Fund III "$42M close" -- unverifiable specific
--    FundNV "$3.2M across 4 companies" -- unverifiable specifics
--    1864 Capital "$8.5M ShieldOps" -- ShieldOps fabricated
--    DCVC/BBV "SentinelEdge $6M" -- SentinelEdge fabricated
--    All other unverifiable specific fund amounts and cohort details
--
-- Safe to run multiple times (all operations are idempotent).

BEGIN;

-- ============================================================
-- PRE-AUDIT: Record event counts
-- ============================================================
DO $$
DECLARE
  ev_count INT;
  ev_verified INT;
  ev_quarantined INT;
BEGIN
  SELECT COUNT(*) INTO ev_count FROM events;
  SELECT COUNT(*) INTO ev_verified FROM events WHERE verified = true;
  SELECT COUNT(*) INTO ev_quarantined FROM events WHERE quarantined = true;
  RAISE NOTICE 'PRE-CLEANUP: events = % (verified=%, quarantined=%)', ev_count, ev_verified, ev_quarantined;
END $$;

-- ============================================================
-- SECTION 1: Remove events referencing fabricated companies
-- These companies were deleted by migrations 112, 115, 044, 152
-- ============================================================

DELETE FROM events
WHERE company_name IN (
  -- From migration 112 (wave 2)
  'CoolEdge Thermal', 'NeonCore Systems', 'VaultGrid Technologies',
  'ArcadeIQ AI', 'ArcadeIQ', 'NevadaVolt Energy', 'NevadaVolt',
  'PeakHealth Analytics', 'Truckee Robotics',
  -- From migration 115 (wave 3) - university spinouts
  'QuantumEdge NV', 'ArtemisAg', 'TitanShield', 'HelioPath',
  'NanoShield NV', 'AquaGenica', 'PackBot AI', 'NevadaMed',
  'DesertDrive', 'ClearVault', 'LunarBuild',
  'BioNVate Therapeutics', 'Sagebrush Research Consortium',
  -- From migration 115 (wave 3) - milestone companies
  'VegasLogic AI', 'PayVault Financial', 'DesertWing Autonomous',
  'GreatBasin Genomics', 'NeonMind AI', 'ShieldWall Security',
  'CasinoIQ Analytics', 'TableMetrics', 'Batjac Ventures',
  -- From migration 044
  'SentryEdge Systems', 'IronShield Defense', 'SolarSpan Nevada', 'SolarSpan',
  'ClearDiagnostics AI', 'ShieldOps', 'SentinelEdge', 'QuantumEdge AI',
  -- From migration 152 (wave 4)
  'Tilt AI', 'fibrX', 'Skydio Gov', 'Protect AI',
  'Nuvve Corp', 'SiO2 Materials', 'Sapien', 'Cognizer AI',
  -- Combined entity names from migration 030
  'DRI / NevadaVolt Energy'
);

-- Also catch events mentioning fabricated companies in description
DELETE FROM events
WHERE description ILIKE ANY(ARRAY[
  '%CoolEdge Thermal%', '%NeonCore Systems%', '%VaultGrid Technologies%',
  '%ArcadeIQ%', '%NevadaVolt Energy%', '%PeakHealth Analytics%',
  '%Truckee Robotics%', '%QuantumEdge NV%', '%ArtemisAg%',
  '%TitanShield%', '%HelioPath%', '%NanoShield NV%', '%AquaGenica%',
  '%PackBot AI%', '%NevadaMed%', '%DesertDrive%', '%ClearVault%',
  '%LunarBuild%', '%BioNVate%', '%Sagebrush Research%',
  '%VegasLogic AI%', '%PayVault Financial%', '%DesertWing Autonomous%',
  '%GreatBasin Genomics%', '%NeonMind AI%', '%ShieldWall Security%',
  '%CasinoIQ Analytics%', '%TableMetrics%', '%Batjac Ventures%',
  '%SentryEdge Systems%', '%IronShield Defense%', '%SolarSpan Nevada%',
  '%ClearDiagnostics AI%', '%ShieldOps%', '%SentinelEdge%', '%QuantumEdge AI%',
  '%Tilt AI%', '%fibrX%', '%Skydio Gov%'
]);

-- ============================================================
-- SECTION 2: Remove events referencing fabricated external entities
-- These externals were deleted by migrations 112, 115, 152
-- ============================================================

-- Wynn Family Office (x_200) - deleted in 152
DELETE FROM events
WHERE company_name = 'Wynn Family Office'
   OR description ILIKE '%Wynn Family Office%anchor LP%';

-- Station Casinos Ventures (x_201) - deleted in 112
DELETE FROM events
WHERE company_name = 'Station Casinos Ventures'
   OR company_name ILIKE 'Station Casinos Ventures%'
   OR description ILIKE '%Station Casinos Ventures%';

-- Switch Ventures (x_202) - deleted in 112
DELETE FROM events
WHERE company_name = 'Switch Ventures'
   OR company_name ILIKE 'Switch Ventures%'
   OR description ILIKE '%Switch Ventures deploys%'
   OR description ILIKE '%Switch Ventures%NeonCore%'
   OR description ILIKE '%Switch Ventures%VaultGrid%'
   OR description ILIKE '%Switch Ventures%CoolEdge%';

-- Playa Capital Group (x_203) - deleted in 112
DELETE FROM events
WHERE company_name = 'Playa Capital Group'
   OR description ILIKE '%Playa Capital Group%';

-- CalPERS Innovation Fund (x_211) - deleted in 152
DELETE FROM events
WHERE company_name = 'CalPERS Innovation Fund'
   OR description ILIKE '%CalPERS Innovation Fund%';

-- Reno Spark Ecosystem (x_235) - deleted in 112
DELETE FROM events
WHERE company_name ILIKE '%Reno Spark Ecosystem%'
   OR description ILIKE '%Reno Spark Ecosystem%';

-- Intermountain Ventures Group investing in PeakHealth (PeakHealth is fabricated)
DELETE FROM events
WHERE company_name = 'Intermountain Ventures Group'
  AND description ILIKE '%PeakHealth%';

-- Goldman Sachs PE investing in QuantumEdge AI (QuantumEdge AI is fabricated)
DELETE FROM events
WHERE company_name = 'Goldman Sachs Private Equity'
  AND description ILIKE '%QuantumEdge AI%';

-- ============================================================
-- SECTION 3: Remove events with fabricated legislation
-- No such bills exist (confirmed by prior audit in migration 115)
-- ============================================================

-- SB 47 "AI Innovation Tax Credit" - fabricated
DELETE FROM events
WHERE description ILIKE '%SB 47%'
   OR description ILIKE '%AI Innovation Tax Credit%';

-- HB 223 "Advanced Manufacturing Incentive Package" - fabricated
DELETE FROM events
WHERE description ILIKE '%HB 223%'
   OR description ILIKE '%Advanced Manufacturing Incentive Package%';

-- ============================================================
-- SECTION 4: Remove fabricated government program events
-- Specific dollar amounts, program names, and statistics are invented
-- ============================================================

-- "GOED Q1 SBIR Matching Grants $2.1M to 14 companies" - fabricated specifics
DELETE FROM events
WHERE description ILIKE '%GOED awards $2.1M in Q1 SBIR%'
   OR description ILIKE '%GOED awards $2.1M in Q1 2026 SBIR%';

-- "InnovateNV Phase 0" - no such program exists
DELETE FROM events
WHERE description ILIKE '%InnovateNV Phase 0%';

-- "Nevada Startup Report 2025" with specific statistics - fabricated
DELETE FROM events
WHERE description ILIKE '%Nevada Startup Report 2025%'
   OR description ILIKE '%127 venture-backed companies%';

-- "NV Economic Forum $340M projection" - fabricated
DELETE FROM events
WHERE description ILIKE '%$340M in startup venture%'
   OR description ILIKE '%Nevada Economic Forum projects%';

-- "Nevada SBIR/STTR Program Office" Federal Pitch Day - fabricated specifics
DELETE FROM events
WHERE description ILIKE '%Nevada SBIR/STTR Program Office hosts Federal Agency Pitch Day%'
   OR description ILIKE '%32 Nevada companies delivered 10-minute pitches%';

-- NV PERS "$50M venture allocation" - fabricated specific amount
DELETE FROM events
WHERE description ILIKE '%NV PERS%$50M venture%'
   OR description ILIKE '%PERS Investment Committee approves $50M%'
   OR (company_name = 'Nevada Public Employees Retirement System'
       AND description ILIKE '%$50M%venture%');

-- NV State Treasurer "$25M Nevada Innovation Fund" - fabricated
DELETE FROM events
WHERE description ILIKE '%$25M Nevada Innovation Fund%'
   OR (company_name = 'Nevada State Treasurer'
       AND description ILIKE '%Nevada Innovation Fund%');

-- "SSBCI program extension through 2028" / "$45M additional" - fabricated
DELETE FROM events
WHERE description ILIKE '%3-year extension%SSBCI program through 2028%'
   OR description ILIKE '%$45M additional federal matching%'
   OR (company_name ILIKE '%Nevada State Treasurer%FundNV%'
       AND description ILIKE '%SSBCI%extension%');

-- NV PERS "$30M LP commitment to FundNV" - fabricated
DELETE FROM events
WHERE description ILIKE '%PERS%$30M%LP commitment%FundNV%'
   OR description ILIKE '%PERS Board approves%$30M%commitment%FundNV%'
   OR company_name = 'Nevada PERS / FundNV';

-- Governor SBIR Letters of Support referencing fabricated companies
DELETE FROM events
WHERE description ILIKE '%Letters of Support for five Nevada%'
   OR description ILIKE '%IronShield Defense%NevadaVolt Energy%Truckee Robotics%';

-- ============================================================
-- SECTION 5: Remove unverifiable corporate events (migration 026)
-- All 8 events from 026 lack source URLs and make specific
-- unverifiable claims
-- ============================================================

-- Switch "Prime FIVE 1.2M sq ft expansion" -- unverifiable specific claim
DELETE FROM events
WHERE company_name = 'Switch, Inc.'
  AND description ILIKE '%1.2 million sq ft expansion of Prime FIVE%'
  AND verified = false;

-- Switch-TensorWave "5-year 4,096-GPU cluster" -- unverifiable
DELETE FROM events
WHERE company_name = 'Switch, Inc.'
  AND description ILIKE '%5-year colocation and power agreement with TensorWave%'
  AND verified = false;

-- MGM AI personalization platform (unnamed startup) -- unverifiable
DELETE FROM events
WHERE company_name = 'MGM Resorts International'
  AND description ILIKE '%real-time guest personalization platform%'
  AND verified = false;

-- Tesla "100 GWh milestone" -- unverifiable specific claim
DELETE FROM events
WHERE company_name = 'Tesla Gigafactory Nevada'
  AND description ILIKE '%cumulative 100 GWh%'
  AND verified = false;

-- Station Casinos "$25M venture fund" -- Station Casinos Ventures is fabricated
DELETE FROM events
WHERE company_name = 'Station Casinos LLC'
  AND description ILIKE '%$25 million corporate venture fund%';

-- LVCVA "smart venue pilot" -- unverifiable
DELETE FROM events
WHERE company_name = 'Las Vegas Convention and Visitors Authority'
  AND description ILIKE '%smart venue pilot%'
  AND verified = false;

-- eBay "200 Trust & Safety hires" -- unverifiable specifics
DELETE FROM events
WHERE company_name = 'eBay Nevada Operations'
  AND description ILIKE '%200 technical hires%'
  AND verified = false;

-- MGM Tech Labs "Cohort 2" -- unverifiable
DELETE FROM events
WHERE company_name = 'MGM Resorts International'
  AND description ILIKE '%MGM Tech Labs%second accelerator cohort%'
  AND verified = false;

-- ============================================================
-- SECTION 6: Remove fabricated cross-stakeholder events (migration 030)
-- All 12 ecosystem partnership events reference fabricated entities
-- or make unverifiable specific claims
-- ============================================================

-- Event 1: UNLV / Batjac Ventures (Batjac is fabricated)
DELETE FROM events
WHERE company_name ILIKE '%Batjac%'
   OR description ILIKE '%Batjac Ventures%'
   OR description ILIKE '%UNLV Spinout Accelerator Fund%';

-- Event 2: GOED / Switch MOU (fabricated agreement)
DELETE FROM events
WHERE company_name = 'GOED / Switch, Inc.'
   OR description ILIKE '%GOED%Switch%Memorandum of Understanding%colocation credits%';

-- Event 4: Tesla / UNLV Battery Innovation Lab (fabricated per 152)
DELETE FROM events
WHERE company_name = 'Tesla Gigafactory Nevada / UNLV'
   OR description ILIKE '%Tesla-UNLV Battery Innovation Lab%'
   OR description ILIKE '%Tesla Gigafactory Nevada and UNLV%$8M%joint research%';

-- Event 5: AngelNV / StartUpNV pipeline (unverifiable specific agreement)
DELETE FROM events
WHERE company_name = 'AngelNV / StartUpNV'
   OR description ILIKE '%AngelNV and StartUpNV formalize%joint deal-flow pipeline%';

-- Event 7: MGM / UNLV Hospitality AI Research Center (unverifiable)
DELETE FROM events
WHERE company_name = 'MGM Resorts / UNLV'
   OR description ILIKE '%$4M Hospitality AI Research Center%'
   OR description ILIKE '%MGM Resorts%endows%Hospitality AI Research Center%';

-- Event 8: Sierra Angels / Reno Spark Ecosystem (Reno Spark fabricated)
DELETE FROM events
WHERE company_name = 'Sierra Angels / Reno Spark Ecosystem'
   OR company_name ILIKE '%Sierra Angels%Reno Spark%';

-- Event 9: Station Casinos Ventures / 1864 Capital (SCV fabricated)
DELETE FROM events
WHERE company_name = 'Station Casinos Ventures / 1864 Capital'
   OR description ILIKE '%Station Casinos Ventures and 1864 Capital%co-investment syndicate%';

-- Event 10: NV State Treasurer / FundNV (already handled in Section 4)
-- Event 11: DRI / NevadaVolt (already handled in Section 1)

-- Event 12: Switch Ventures / Goldman Sachs PE (Switch Ventures fabricated)
DELETE FROM events
WHERE company_name = 'Switch Ventures / Goldman Sachs PE'
   OR description ILIKE '%Switch Ventures%Goldman Sachs%co-invest%data center thermal%';

-- ============================================================
-- SECTION 7: Remove fabricated risk capital events (migration 027)
-- ============================================================

-- BBV Fund III "$42M close" - unverifiable specific
DELETE FROM events
WHERE company_name = 'Battle Born Ventures'
  AND description ILIKE '%Fund III at $42M%'
  AND verified = false;

-- BBV Fund III "$28M first close" - unverifiable specific
DELETE FROM events
WHERE company_name = 'Battle Born Ventures'
  AND description ILIKE '%first institutional close of Fund III at $28M%'
  AND verified = false;

-- FundNV "$3.2M across 4 companies" - unverifiable specifics
DELETE FROM events
WHERE company_name = 'Fund Nevada'
  AND description ILIKE '%$3.2M across 4 new Nevada%'
  AND verified = false;

-- FundNV "Q4 2025 SSBCI compliance report" - unverifiable specifics
DELETE FROM events
WHERE company_name = 'Fund Nevada'
  AND description ILIKE '%Q4 2025 SSBCI compliance report%31 active%'
  AND verified = false;

-- 1864 Capital "$8.5M ShieldOps" - ShieldOps is fabricated
DELETE FROM events
WHERE description ILIKE '%ShieldOps%'
   OR (company_name = '1864 Capital' AND description ILIKE '%$8.5M Series A%Reno%cybersecurity%');

-- DCVC/BBV SentinelEdge - SentinelEdge is fabricated (handled in Section 1)

-- AngelNV "$2.1M across 7 seed" - unverifiable specifics
DELETE FROM events
WHERE company_name = 'AngelNV'
  AND description ILIKE '%$2.1M across 7 seed%'
  AND verified = false;

-- Sierra Angels "Q1 pitch night $1.4M" - unverifiable specifics
DELETE FROM events
WHERE company_name = 'Sierra Angels'
  AND description ILIKE '%$1.4M in term sheets%'
  AND verified = false;

-- StartUpNV "Cohort 12 Demo Day: 14 companies" - unverifiable specifics
DELETE FROM events
WHERE company_name = 'StartUpNV'
  AND description ILIKE '%Cohort 12 Demo Day%14 companies%'
  AND verified = false;

-- 1864 Capital "18 active companies" - unverifiable
DELETE FROM events
WHERE company_name = '1864 Capital'
  AND description ILIKE '%expands Nevada portfolio to 18 active%'
  AND verified = false;

-- DCVC event (SentinelEdge reference already handled)
DELETE FROM events
WHERE company_name = 'DCVC'
  AND description ILIKE '%SentinelEdge%';

-- ============================================================
-- SECTION 8: Remove fabricated university events (migration 025)
-- Most already handled by Section 1, but catch remaining
-- ============================================================

-- UNLV "$18M Quantum Computing Center" with IBM - unverifiable specific
DELETE FROM events
WHERE description ILIKE '%$18M Quantum Computing Center%IBM%'
  AND verified = false;

-- UNR "3 spinout companies" (QuantumEdge NV, ArtemisAg, TitanShield) - all fabricated
DELETE FROM events
WHERE description ILIKE '%QuantumEdge NV%ArtemisAg%TitanShield%';

-- UNLV Harry Reid Park "4 new corporate tenants" - unverifiable specific claims
DELETE FROM events
WHERE description ILIKE '%Lockheed Martin Advanced Research%25,000 sq ft%'
   OR description ILIKE '%Raytheon Technologies Nevada Lab%18,000 sq ft%'
   OR (description ILIKE '%Harry Reid Research%Technology Park%4 new corporate tenants%'
       AND verified = false);

-- Nevada State University "$5M endowment" - unverifiable specific
DELETE FROM events
WHERE company_name = 'Nevada State University'
  AND description ILIKE '%$5M endowment%Center for Tech Entrepreneurship%'
  AND verified = false;

-- DRI "$12M NSF Climate Tech grant (Award #2601847)" - fabricated award number
DELETE FROM events
WHERE description ILIKE '%NSF Climate Tech grant%Award #2601847%';

-- UNLV Demo Day "8 spinout companies" (all fabricated companies)
DELETE FROM events
WHERE description ILIKE '%UNLV%Demo Day%Thomas%Mack%8 spinout%'
   OR description ILIKE '%UNLV inaugural University Startup Demo Day%';

-- UNR "Advanced Autonomous Systems Lab" partnerships - unverifiable
DELETE FROM events
WHERE description ILIKE '%UNR Advanced Autonomous Systems Lab%Sierra Nevada Corporation%Abaco Systems%DRS Technologies%'
  AND verified = false;

-- NSF I-Corps "largest-ever cohort: 12 teams" - unverifiable specifics
DELETE FROM events
WHERE description ILIKE '%NSF I-Corps Nevada%largest-ever cohort%12 teams%'
  AND verified = false;

-- ============================================================
-- SECTION 9: Remove fabricated family office events (migration 028)
-- Many already handled above; catch remaining
-- ============================================================

-- UNLV Foundation "$15M Nevada Innovation Endowment" - unverifiable
DELETE FROM events
WHERE company_name = 'UNLV Foundation'
  AND description ILIKE '%$15M Nevada Innovation Endowment%'
  AND verified = false;

-- JPMorgan "Nevada Family Office Investor Roundtable" - unverifiable
DELETE FROM events
WHERE company_name = 'JPMorgan Alternative Assets'
  AND description ILIKE '%Nevada Family Office Investor Roundtable%'
  AND verified = false;

-- ============================================================
-- SECTION 10: Remove remaining events from migration 093 that
-- reference companies deleted in migration 152
-- ============================================================

-- Tilt AI events (company deleted in 152)
DELETE FROM events
WHERE company_name = 'Tilt AI'
   OR description ILIKE '%Tilt AI%AngelNV 2025 winner%';

-- fibrX events (company deleted in 152)
DELETE FROM events
WHERE company_name = 'fibrX'
   OR description ILIKE '%fibrX%AngelNV 2025 finalist%';

-- Protect AI events (non-Nevada per 152)
DELETE FROM events
WHERE company_name = 'Protect AI'
   AND verified = false;

-- Cognizer AI events (non-Nevada per 152)
DELETE FROM events
WHERE company_name = 'Cognizer AI';

-- BBV leading "$3.5M seed round in Cognizer AI" - Cognizer AI is non-NV
DELETE FROM events
WHERE description ILIKE '%Cognizer AI%'
  AND description NOT ILIKE '%removed%';

-- ============================================================
-- SECTION 11: Clean up the old timeline_events and
-- stakeholder_activities tables (for consistency)
-- ============================================================

-- Remove from timeline_events anything referencing fabricated entities
-- that might have been re-inserted after migration 111 cleanup
DELETE FROM timeline_events
WHERE company_name IN (
  'Wynn Family Office', 'Station Casinos Ventures', 'Switch Ventures',
  'Playa Capital Group', 'CalPERS Innovation Fund',
  'Intermountain Ventures Group', 'Goldman Sachs Private Equity',
  'JPMorgan Alternative Assets', 'Nevada State Treasurer',
  'Nevada Public Employees Retirement System',
  'UNLV Foundation', 'UNLV / Batjac Ventures',
  'GOED / Switch, Inc.', 'Tesla Gigafactory Nevada / UNLV',
  'AngelNV / StartUpNV', 'MGM Resorts / UNLV',
  'Sierra Angels / Reno Spark Ecosystem',
  'Station Casinos Ventures / 1864 Capital',
  'Nevada State Treasurer / FundNV', 'Nevada PERS / FundNV',
  'DRI / NevadaVolt Energy', 'Switch Ventures / Goldman Sachs PE',
  'Office of the Governor of Nevada'
)
AND verified IS NOT TRUE;

-- Remove stakeholder_activities for fabricated entities
DELETE FROM stakeholder_activities
WHERE company_id IN (
  'wynn-family-office', 'station-casinos-ventures', 'switch-ventures',
  'playa-capital', 'intermountain-ventures', 'goldman-psl',
  'jpmorgan-alternatives', 'nv-state-treasurer', 'nv-pers',
  'unlv-foundation', 'nv-governors-office',
  'sentryedge-systems', 'ironshield-defense', 'solarspan-nevada',
  'cleardiagnostics-ai', 'shieldops', 'sentineledge',
  'quantumedge-ai', 'vegaslogic-ai', 'payvault-financial',
  'desertwing-autonomous', 'greatbasin-genomics', 'neonmind-ai',
  'shieldwall-security', 'casinoiq-analytics', 'coolEdge-thermal',
  'neoncore-systems', 'vaultgrid-technologies', 'arcadeiq-ai',
  'nevadavolt-energy', 'peakhealth-analytics', 'truckee-robotics'
);

-- Remove stakeholder_activities referencing fabricated programs/entities
DELETE FROM stakeholder_activities
WHERE description ILIKE '%GOED awards $2.1M%SBIR Matching%'
   OR description ILIKE '%SB 47%AI Innovation Tax Credit%'
   OR description ILIKE '%HB 223%Advanced Manufacturing%'
   OR description ILIKE '%InnovateNV Phase 0%'
   OR description ILIKE '%Nevada Startup Report 2025%'
   OR description ILIKE '%$340M in startup venture%'
   OR description ILIKE '%$50M%venture%allocation%'
   OR description ILIKE '%$25M Nevada Innovation Fund%'
   OR description ILIKE '%$30M%LP commitment%FundNV%'
   OR description ILIKE '%Tesla-UNLV Battery Innovation Lab%'
   OR description ILIKE '%Station Casinos Ventures%'
   OR description ILIKE '%Switch Ventures%NeonCore%'
   OR description ILIKE '%Batjac Ventures%'
   OR description ILIKE '%Reno Spark Ecosystem%';

-- ============================================================
-- SECTION 12: Quarantine remaining unsourced events
-- ============================================================

-- Any events that survived cleanup but have no source_url and are
-- not verified should be quarantined
UPDATE events
SET quarantined = true,
    verification_note = 'No source URL — quarantined by migration 153'
WHERE (source_url IS NULL OR TRIM(source_url) = '')
  AND (source IS NULL OR TRIM(source) = '')
  AND verified = false
  AND quarantined = false;

-- ============================================================
-- POST-AUDIT: Record counts after cleanup
-- ============================================================
DO $$
DECLARE
  ev_count INT;
  ev_verified INT;
  ev_quarantined INT;
  te_count INT;
  sa_count INT;
BEGIN
  SELECT COUNT(*) INTO ev_count FROM events;
  SELECT COUNT(*) INTO ev_verified FROM events WHERE verified = true AND quarantined = false;
  SELECT COUNT(*) INTO ev_quarantined FROM events WHERE quarantined = true;
  SELECT COUNT(*) INTO te_count FROM timeline_events;
  SELECT COUNT(*) INTO sa_count FROM stakeholder_activities;
  RAISE NOTICE 'POST-CLEANUP: events = % (verified=%, quarantined=%)', ev_count, ev_verified, ev_quarantined;
  RAISE NOTICE 'POST-CLEANUP: timeline_events = %, stakeholder_activities = %', te_count, sa_count;
END $$;

-- ============================================================
-- VERIFICATION: Show remaining verified events
-- ============================================================
SELECT 'remaining_verified_events' AS check_name,
  COUNT(*) AS count
FROM events
WHERE verified = true AND quarantined = false;

SELECT 'remaining_unverified_non_quarantined' AS check_name,
  COUNT(*) AS count
FROM events
WHERE verified = false AND quarantined = false;

COMMIT;
