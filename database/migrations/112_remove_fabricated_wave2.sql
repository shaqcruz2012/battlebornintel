-- Migration 112: Remove fabricated entities and relationships (Wave 2)
--
-- Migrations 043/044/050 caught the first wave of AI-fabricated data. This migration
-- removes the SECOND wave of fabricated entities discovered via web-search verification
-- on 2026-03-30.
--
-- METHODOLOGY: Every entity name below was searched on Google, Crunchbase, PitchBook,
-- LinkedIn, and Nevada SOS. Entities with ZERO web presence are marked FABRICATED.
-- Entities with wrong names or fabricated relationships are corrected.
--
-- FABRICATED COMPANIES (zero web presence — confirmed not real):
--   CoolEdge Thermal         — claimed Switch Ventures portfolio; zero results
--   NeonCore Systems         — claimed Switch Ventures portfolio; zero results
--   VaultGrid Technologies   — claimed Switch Ventures portfolio; zero results
--   ArcadeIQ AI              — claimed Station Casinos Ventures portfolio; zero results
--   NevadaVolt Energy        — claimed DRI research partner + DOE ARPA-E grantee; zero results
--   PeakHealth Analytics     — claimed Intermountain Ventures portfolio; zero results
--   Truckee Robotics         — only a high school robotics club, not a startup
--
-- FABRICATED ENTITIES (fake venture arms of real companies):
--   Station Casinos Ventures (x_201) — Red Rock Resorts (RRR) has NO venture subsidiary
--   Switch Ventures (x_202)          — Switch was taken private by DigitalBridge; no venture arm
--   Playa Capital Group (x_203)      — zero web presence; fabricated family office
--   Reno Spark Ecosystem (x_235)     — not a real entity; real orgs: Startup Reno, EDAWN
--
-- FABRICATED RELATIONSHIPS (real entities, fake connections):
--   Intermountain Ventures Group (x_204) — real entity is "Intermountain Ventures" (Utah);
--       fake deal: "Led $3M seed in PeakHealth Analytics"
--   Paladin Capital Group (x_240) — real DC-based cyber VC but NO connection to DFV found
--   Goldman Sachs PE (x_209) — real, but "$30M growth equity in QuantumEdge AI" is fabricated
--   Sierra Angels (x_234) — real (est. 1997, Incline Village), but "Reno Demo Day" is fabricated
--   DRI (x_232) — real, but "NevadaVolt Energy" partnership is fabricated
--
-- REAL ENTITIES VERIFIED (NOT removed):
--   TensorWave          — $43M SAFE + $100M Series A, Las Vegas HQ, AMD GPUs
--   Kaptyn              — all-electric rideshare, Las Vegas, CEO Andrew Meyers
--   Vena Vitals         — YC-backed blood pressure sticker, moving to Las Vegas
--   WAVR Technologies   — UNLV spinout, atmospheric water harvesting, $4M seed
--   Nevada Nano         — Sparks NV, MEMS gas sensors, $18M funding
--   Hubble Network      — satellite BLE IoT (real company, but not Nevada-based)
--   Abnormal AI         — $5.1B cybersecurity (real, HQ San Francisco)
--   Sierra Angels       — real angel group (Incline Village, est. 1997)
--   Desert Research Institute — real (Reno/Las Vegas)
--   Paladin Capital Group — real (DC-based cyber VC)
--   Intermountain Ventures — real (Utah healthcare VC)
--   Goldman Sachs PE    — real
--
-- Safe to run multiple times (all DELETEs are idempotent, UPDATEs use WHERE guards).

BEGIN;

-- ============================================================
-- SECTION 1: Remove timeline_events for fabricated companies
-- ============================================================

DELETE FROM timeline_events
WHERE company_name IN (
  'CoolEdge Thermal',
  'NeonCore Systems',
  'VaultGrid Technologies',
  'ArcadeIQ AI',
  'ArcadeIQ',
  'NevadaVolt Energy',
  'NevadaVolt',
  'PeakHealth Analytics',
  'Truckee Robotics',
  'DRI / NevadaVolt Energy'
);

-- Remove events that mention fabricated companies in detail text
DELETE FROM timeline_events
WHERE detail ILIKE '%CoolEdge Thermal%'
   OR detail ILIKE '%NeonCore Systems%'
   OR detail ILIKE '%VaultGrid Technologies%'
   OR detail ILIKE '%ArcadeIQ%'
   OR detail ILIKE '%NevadaVolt Energy%'
   OR detail ILIKE '%PeakHealth Analytics%'
   OR detail ILIKE '%Truckee Robotics%';

-- Remove fabricated "Reno Demo Day" events
DELETE FROM timeline_events
WHERE detail ILIKE '%Reno Demo Day%';

-- ============================================================
-- SECTION 2: Remove stakeholder_activities for fabricated companies
-- ============================================================

DELETE FROM stakeholder_activities
WHERE company_id IN (
  'cooledge-thermal',
  'neoncore-systems',
  'vaultgrid-technologies',
  'arcadeiq-ai',
  'arcadeiq',
  'nevadavolt-energy',
  'nevadavolt',
  'peakhealth-analytics',
  'truckee-robotics'
);

-- Also remove activities that reference fabricated entities in descriptions
DELETE FROM stakeholder_activities
WHERE description ILIKE '%CoolEdge Thermal%'
   OR description ILIKE '%NeonCore Systems%'
   OR description ILIKE '%VaultGrid Technologies%'
   OR description ILIKE '%ArcadeIQ%'
   OR description ILIKE '%NevadaVolt Energy%'
   OR description ILIKE '%PeakHealth Analytics%'
   OR description ILIKE '%Truckee Robotics%'
   OR description ILIKE '%Reno Demo Day%';

-- Remove Station Casinos Ventures and Switch Ventures activities
DELETE FROM stakeholder_activities
WHERE company_id IN (
  'station-casinos-ventures',
  'switch-ventures'
);

-- ============================================================
-- SECTION 3: Remove graph_edges involving fabricated entities
-- ============================================================

-- Edges TO/FROM fabricated company nodes
DELETE FROM graph_edges
WHERE source_id IN (
  'cooledge-thermal', 'neoncore-systems', 'vaultgrid-technologies',
  'arcadeiq-ai', 'arcadeiq', 'nevadavolt-energy', 'nevadavolt',
  'peakhealth-analytics', 'truckee-robotics',
  'x_cooledge', 'x_neoncore', 'x_vaultgrid',
  'x_arcadeiq', 'x_nevadavolt', 'x_peakhealth',
  'c_cooledge', 'c_neoncore', 'c_vaultgrid',
  'c_arcadeiq', 'c_nevadavolt', 'c_peakhealth'
)
OR target_id IN (
  'cooledge-thermal', 'neoncore-systems', 'vaultgrid-technologies',
  'arcadeiq-ai', 'arcadeiq', 'nevadavolt-energy', 'nevadavolt',
  'peakhealth-analytics', 'truckee-robotics',
  'x_cooledge', 'x_neoncore', 'x_vaultgrid',
  'x_arcadeiq', 'x_nevadavolt', 'x_peakhealth',
  'c_cooledge', 'c_neoncore', 'c_vaultgrid',
  'c_arcadeiq', 'c_nevadavolt', 'c_peakhealth'
);

-- Edges FROM fabricated venture arms
DELETE FROM graph_edges
WHERE source_id IN ('x_201', 'x_202', 'x_203', 'x_235')
   OR target_id IN ('x_201', 'x_202', 'x_203', 'x_235');

-- Edges FROM Paladin as DFV LP (fabricated relationship)
DELETE FROM graph_edges
WHERE source_id = 'x_240' AND target_id = 'f_dfv';
DELETE FROM graph_edges
WHERE source_id = 'f_dfv' AND target_id = 'x_240';

-- Remove edge referencing fabricated PeakHealth from Intermountain (x_204)
DELETE FROM graph_edges
WHERE source_id = 'x_204'
  AND (note ILIKE '%PeakHealth%' OR target_id ILIKE '%peakhealth%');

-- Remove DRI↔NevadaVolt research_partnership edges
DELETE FROM graph_edges
WHERE (source_id = 'x_232' OR target_id = 'x_232')
  AND note ILIKE '%NevadaVolt%';

-- ============================================================
-- SECTION 4: Remove fabricated external nodes
-- ============================================================

-- Completely fabricated entities (zero web presence)
DELETE FROM externals WHERE id = 'x_201';  -- Station Casinos Ventures (fake venture arm)
DELETE FROM externals WHERE id = 'x_202';  -- Switch Ventures (fake venture arm)
DELETE FROM externals WHERE id = 'x_203';  -- Playa Capital Group (fabricated)
DELETE FROM externals WHERE id = 'x_235';  -- Reno Spark Ecosystem (fabricated)

-- Remove fabricated company external nodes if they exist
DELETE FROM externals
WHERE id IN (
  'arcadeiq-ai', 'cooledge-thermal', 'neoncore-systems',
  'vaultgrid-technologies', 'nevadavolt-energy', 'peakhealth-analytics',
  'truckee-robotics'
);

-- ============================================================
-- SECTION 5: Correct note fields on REAL external nodes
-- (Remove fabricated claims from otherwise-real entities)
-- ============================================================

-- x_204: Intermountain Ventures Group → fix name and remove fake deal
UPDATE externals
SET name = 'Intermountain Ventures',
    entity_type = 'VC Firm',
    note = 'Corporate venture arm of Intermountain Health (Salt Lake City, UT). '
        || 'Healthcare-focused VC: Enterprise Enablement, Care Site Optimization, '
        || 'Workforce Transformation, Consumer Experience, Clinical Advancement, Proactive Care. '
        || '51+ investments, 2 unicorns, 3 IPOs, 10 acquisitions per PitchBook. '
        || 'Series A-C, $3M-$5M target. Source: intermountainhealthcare.org/about/ventures'
WHERE id = 'x_204';

-- x_209: Goldman Sachs PE → remove fabricated QuantumEdge AI claim
UPDATE externals
SET note = 'Goldman Sachs Private Equity. Active in growth equity and co-investment.'
WHERE id = 'x_209';

-- x_232: DRI → remove fabricated NevadaVolt partnership claim
UPDATE externals
SET note = 'Desert Research Institute. Nevada system of higher education research institution. '
        || 'Campuses in Reno and Las Vegas. Research: atmospheric sciences, hydrological sciences, '
        || 'earth and ecosystem sciences.'
WHERE id = 'x_232';

-- x_234: Sierra Angels → remove fabricated "Reno Demo Day" claim
UPDATE externals
SET note = 'Northern Nevada angel investor network. Founded 1997, Incline Village NV. '
        || '50+ members, 71+ investments per PitchBook. Certified Established Angel Group (EAG) '
        || 'by Angel Capital Association. Focus: seed stage, <$3M rounds, enterprise B2B. '
        || 'Source: sierraangels.com'
WHERE id = 'x_234';

-- x_240: Paladin Capital Group → remove fabricated DFV LP claim
UPDATE externals
SET note = 'Washington DC-based cybersecurity and national security VC. '
        || 'Founded as investment response to 9/11 by former NSA, CIA, DARPA leaders. '
        || 'Source: paladincapgroup.com'
WHERE id = 'x_240';

-- x_220: Switch → correct description (was taken private)
UPDATE externals
SET note = 'Switch data center operator (Las Vegas, NV). Founded by Rob Roy. '
        || 'Taken private Dec 2022 by DigitalBridge + IFM Investors ($11B). '
        || 'Prime FIVE campus Las Vegas, Citadel campus at TRIC near Reno. '
        || '2M+ sq ft operating data centers. Source: switch.com, Wikipedia'
WHERE id = 'x_220';

-- x_223: Station Casinos LLC → remove fabricated "$25M corporate venture fund" claim
UPDATE externals
SET note = 'Station Casinos LLC (Red Rock Resorts, NASDAQ: RRR). '
        || 'Develops and manages casino and entertainment properties in Las Vegas locals market. '
        || 'Market cap ~$3.5B (March 2026). 9 properties in Las Vegas area. '
        || 'Source: redrockresortsllc.com, Yahoo Finance'
WHERE id = 'x_223';

-- ============================================================
-- SECTION 6: Flag companies that were incorrectly claimed as
-- Nevada-based (carried forward from migration 044 for tracking)
-- ============================================================
-- These were already flagged in migration 044 but noting that
-- migration 052+ added MORE fabricated edges to some of them.
-- No action needed here — just cleanup of edges already handled above.

-- ============================================================
-- SECTION 7: Verification queries
-- ============================================================

-- Confirm fabricated companies are gone from timeline
SELECT COUNT(*) AS remaining_fabricated_timeline
FROM timeline_events
WHERE company_name IN (
  'CoolEdge Thermal', 'NeonCore Systems', 'VaultGrid Technologies',
  'ArcadeIQ AI', 'ArcadeIQ', 'NevadaVolt Energy', 'NevadaVolt',
  'PeakHealth Analytics', 'Truckee Robotics'
);

-- Confirm fabricated externals are gone
SELECT COUNT(*) AS remaining_fabricated_externals
FROM externals
WHERE id IN ('x_201', 'x_202', 'x_203', 'x_235',
             'arcadeiq-ai', 'cooledge-thermal', 'neoncore-systems',
             'vaultgrid-technologies', 'nevadavolt-energy', 'peakhealth-analytics');

-- Confirm no edges reference fabricated nodes
SELECT COUNT(*) AS remaining_fabricated_edges
FROM graph_edges
WHERE source_id IN ('x_201', 'x_202', 'x_203', 'x_235',
                    'arcadeiq-ai', 'cooledge-thermal', 'neoncore-systems',
                    'vaultgrid-technologies', 'nevadavolt-energy', 'peakhealth-analytics')
   OR target_id IN ('x_201', 'x_202', 'x_203', 'x_235',
                    'arcadeiq-ai', 'cooledge-thermal', 'neoncore-systems',
                    'vaultgrid-technologies', 'nevadavolt-energy', 'peakhealth-analytics');

-- Show corrected externals
SELECT id, name, LEFT(note, 80) AS note_preview
FROM externals
WHERE id IN ('x_204', 'x_209', 'x_220', 'x_223', 'x_232', 'x_234', 'x_240')
ORDER BY id;

COMMIT;
