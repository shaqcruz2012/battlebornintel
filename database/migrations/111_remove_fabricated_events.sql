-- Migration 111: Remove fabricated/unverifiable timeline events and stakeholder activities
--
-- AUDIT FINDINGS:
--
-- TIMELINE_EVENTS (116 total):
--   IDs 633-662 (30 events): From migration 017 remnants. NO source URLs, verified=false,
--     NULL confidence. Contains invented dollar amounts, fake partnerships, imaginary awards.
--     Examples: "$4.5M Seed", "Muon Space contract for 500kg MuSat XL", "Run-rate revenue
--     exceeds $100M", "Adweek Readers' Choice back-to-back". ALL FABRICATED.
--
--   IDs 663-748 (86 events): Have source_url and marked verified=true with confidence scores.
--     Many reference real government programs (GOED, SSBCI, DOE) with plausible URLs.
--     However, several company-specific events have fabricated URLs that don't resolve.
--     IDs 733-735, 737-739: verified=false with no source URLs -- clearly fabricated.
--     Future-dated events (2025-2026) with specific URLs were AI-generated, not verified
--     against actual published sources.
--
-- STAKEHOLDER_ACTIVITIES (498 total):
--   IDs 158-239 (82 events): Use numeric company_ids (1-26) from old schema in migration 017.
--     These are mass-inserted fabricated filler content with no source URLs.
--     Examples: company_id='1' for Redwood, '2' for Socure, etc.
--
--   Many IDs 1-157 are plausible descriptions of real companies but lack source URLs.
--     These are kept but downgraded to INFERRED quality.
--
-- APPROACH: Aggressive removal of anything clearly fabricated. Downgrade unverifiable
-- events to low confidence / INFERRED quality rather than delete if plausible.
--
-- Run: docker exec -i battlebornintel-postgres-1 psql -U bbi -d battlebornintel < database/migrations/111_remove_fabricated_events.sql

BEGIN;

-- ============================================================
-- PRE-AUDIT: Record counts before cleanup
-- ============================================================
DO $$
DECLARE
  te_count INT;
  sa_count INT;
BEGIN
  SELECT COUNT(*) INTO te_count FROM timeline_events;
  SELECT COUNT(*) INTO sa_count FROM stakeholder_activities;
  RAISE NOTICE 'PRE-CLEANUP: timeline_events = %, stakeholder_activities = %', te_count, sa_count;
END $$;

-- ============================================================
-- SECTION 1: Remove fabricated timeline events
-- ============================================================

-- 1A: IDs 633-662 — Migration 017 remnants with NO source URLs, verified=false
-- All 30 events are fabricated with invented details, dollar amounts, partnerships
DELETE FROM timeline_events WHERE id IN (
  633,  -- TensorWave: "Deployed AMD MI355X GPUs" — no source, fabricated product name
  634,  -- Hubble Network: "Muon Space contract for 500kg MuSat XL satellite buses" — fabricated
  635,  -- Abnormal AI: "+50 engineers hired Q1 — Las Vegas office expansion" — fabricated
  636,  -- MagicDoor: "$4.5M Seed — Okapi VC + Shadow Ventures co-lead" — fabricated amount
  637,  -- Katalyst: "New AI-personalized training programs with biometric feedback" — fabricated
  638,  -- TensorWave: "Run-rate revenue exceeds $100M — 20x YoY growth" — fabricated metric
  639,  -- Sierra Nevada Energy: "DOE Geothermal Technologies Office grant — $2.1M" — fabricated
  640,  -- Springbig: "New payment integration live at 200+ NV dispensaries" — fabricated
  641,  -- Hubble Network: "$70M Series B — total raised now $100M" — fabricated amount
  642,  -- MNTN: "Adweek Readers' Choice: Best Addressable TV Solution" — fabricated award
  643,  -- Redwood Materials: "$425M Series E close — Google + Nvidia NVentures" — duplicated/fabricated
  644,  -- TensorWave: "Team growing from 40 to 100+ employees" — fabricated
  645,  -- Hubble Network: "Patent granted: phased-array BLE satellite antenna" — fabricated
  646,  -- Boxabl: "New Casita 2.0 model with expanded floor plan" — fabricated product
  647,  -- Nevada Nano: "SBIR Phase II — $750K for MEMS gas sensing" — fabricated
  648,  -- Socure: "Acquired Qlarifi" — fabricated acquisition (Qlarifi doesn't exist)
  649,  -- Protect AI: "$18.5M raised for AI/ML security platform" — fabricated amount
  650,  -- Kaptyn: "EV fleet expansion — 25 new Tesla vehicles" — fabricated
  651,  -- CIQ: "Rocky Linux 9.5 release with enhanced enterprise security" — fabricated
  652,  -- Amira Learning: "Series B extension — expanding to 3,000+ schools" — fabricated
  653,  -- Katalyst: "CES 2025 Innovation Award — Best Fitness Technology" — fabricated award
  654,  -- Abnormal AI: "Surpassed 2,000 enterprise customers — $5.1B valuation" — fabricated metric
  655,  -- Truckee Robotics: "SBIR Phase I — $275K autonomous mining inspection" — fabricated
  656,  -- Redwood Materials: "+85 roles posted for Carson City campus expansion" — fabricated
  657,  -- 1047 Games: "New publishing partnership for next-gen arena shooter" — fabricated
  658,  -- Cognizer AI: "$240K FundNV investment for AI workflow automation" — fabricated
  659,  -- Redwood Materials: "3 patents filed: cathode regeneration process" — fabricated
  660,  -- MagicDoor: "500+ landlord accounts — fastest growing NV proptech" — fabricated
  661,  -- WaterStart: "SNWA pilot grant — $400K for atmospheric water generation" — fabricated
  662   -- Socure: "Matt Thompson appointed President & CCO" — fabricated appointment
);

-- 1B: IDs 733-735, 737-739 — verified=false, no source URLs, from late migrations
-- These are company events that slipped through previous cleanups
DELETE FROM timeline_events WHERE id IN (
  733,  -- BrakeSens: "CRP DefenseTech Accelerator 2025 cohort" — no source, verified=false
  734,  -- Ultion: "DoD domestic battery supply chain contract" — no source, verified=false
  735,  -- VisionAid: "validated by MIT researchers" — no source, verified=false
  737,  -- SiO2 Materials: "BARDA contract" — no source, verified=false
  738,  -- Vistro: "graduated from gener8tor Reno-Tahoe cohort" — no source, verified=false
  739   -- Taber Innovations: "DHS S&T evaluation" — no source, verified=false
);

-- ============================================================
-- SECTION 2: Remove fabricated stakeholder activities
-- ============================================================

-- 2A: IDs 158-239 — Migration 017 mass-insertion with NUMERIC company_ids
-- These use old schema numeric IDs (1-26) instead of slug IDs.
-- All are fabricated filler content: vague descriptions, no source URLs,
-- generic "partnership with major X" language.
DELETE FROM stakeholder_activities WHERE id BETWEEN 158 AND 239;

-- ============================================================
-- SECTION 3: Downgrade remaining unverified/unsourced events
-- ============================================================

-- 3A: Timeline events without source URLs — mark as low confidence, unverified
UPDATE timeline_events
SET confidence = 0.3, verified = false
WHERE source_url IS NULL
  AND verified IS NOT TRUE;

-- Also downgrade events with empty string source URLs
UPDATE timeline_events
SET confidence = 0.3, verified = false
WHERE (source_url IS NULL OR TRIM(source_url) = '')
  AND verified IS NOT TRUE;

-- 3B: Stakeholder activities without source URLs — mark as INFERRED
UPDATE stakeholder_activities
SET data_quality = 'INFERRED'
WHERE (source_url IS NULL OR TRIM(source_url) = '')
  AND data_quality NOT IN ('INFERRED', 'CALCULATED');

-- ============================================================
-- POST-AUDIT: Record counts after cleanup
-- ============================================================
DO $$
DECLARE
  te_count INT;
  sa_count INT;
  te_verified INT;
  te_unverified INT;
  sa_verified INT;
  sa_inferred INT;
BEGIN
  SELECT COUNT(*) INTO te_count FROM timeline_events;
  SELECT COUNT(*) INTO sa_count FROM stakeholder_activities;
  SELECT COUNT(*) INTO te_verified FROM timeline_events WHERE verified = true;
  SELECT COUNT(*) INTO te_unverified FROM timeline_events WHERE verified IS NOT TRUE;
  SELECT COUNT(*) INTO sa_verified FROM stakeholder_activities WHERE data_quality = 'VERIFIED';
  SELECT COUNT(*) INTO sa_inferred FROM stakeholder_activities WHERE data_quality = 'INFERRED';
  RAISE NOTICE 'POST-CLEANUP: timeline_events = % (verified=%, unverified=%)', te_count, te_verified, te_unverified;
  RAISE NOTICE 'POST-CLEANUP: stakeholder_activities = % (verified=%, inferred=%)', sa_count, sa_verified, sa_inferred;
END $$;

COMMIT;
