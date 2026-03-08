-- Migration 045: Remove Desert Forge Ventures fabricated Fund I/II events
--
-- Migration 041 inserted stakeholder_activities and timeline_events for DFV
-- using completely invented figures:
--   • Fund I "closed at $45M" (2020-11-15) — WRONG: fund launched May 2025 at $20M–$25M target
--   • Fund II "closed at $40M" (2023-06-01) — WRONG: no Fund II exists
--   • Portfolio company events for ForgeAI Defense, DesertSentinel — WRONG: fabricated companies
--
-- Migration 043 attempted to clean stakeholder_activities but used 'desert-forge-ventures'
-- as company_id; migration 041 actually used 'dfv'. This migration corrects that.
--
-- VERIFIED SOURCES for DFV:
--   Fund I target: $20M–$25M [UNLV econdev], launched May 2025 [Fox5, LVRJ]
--   ~$4M raised as of Aug 2025 [Vegas Inc / LV Sun]
--   No Fund II exists per any verifiable source.

-- ============================================================
-- SECTION 1: Remove fabricated stakeholder_activities for DFV
-- ============================================================
-- Migration 041 inserted these with company_id='dfv' (not 'desert-forge-ventures')
-- and invented dates/figures. Remove all activities that reference Fund I/II closes
-- or the deleted portfolio companies.

DELETE FROM stakeholder_activities
WHERE company_id = 'dfv'
  AND activity_date IN ('2020-11-15', '2023-06-01');

DELETE FROM stakeholder_activities
WHERE company_id IN ('c_forgeai', 'c_desertsentinel', 'c_ironveil', 'c_neonshield',
                     'c_vaultlink', 'c_strikepoint', 'c_sentryedge', 'c_ironshield',
                     'forgeai', 'desertsentinel');

-- ============================================================
-- SECTION 2: Remove fabricated timeline_events for DFV
-- ============================================================
-- Any timeline event describing DFV "Fund II" or citing the old fabricated $85M AUM.

DELETE FROM timeline_events
WHERE (company_name ILIKE '%Desert Forge%' OR company_id ILIKE '%dfv%')
  AND (
    description ILIKE '%Fund II%'
    OR description ILIKE '%$40M%'
    OR description ILIKE '%$45M%'
    OR description ILIKE '%$85M%'
    OR event_date < '2025-01-01'   -- DFV launched May 2025; any earlier date is fabricated
  );

-- ============================================================
-- SECTION 3: Ensure graph_funds entry for DFV has no stale metadata
-- ============================================================
-- Bring graph_funds into sync with the corrected funds table from migration 043.

UPDATE graph_funds SET
  name       = 'Desert Forge Ventures',
  fund_type  = 'VC',
  confidence = 0.92,
  verified   = TRUE,
  agent_id   = 'migration-045-cleanup'
WHERE id = 'dfv';

-- ============================================================
-- SECTION 4: Verification queries
-- ============================================================
SELECT COUNT(*) AS dfv_activities_remaining
FROM stakeholder_activities
WHERE company_id = 'dfv';

SELECT COUNT(*) AS dfv_timeline_events_remaining
FROM timeline_events
WHERE company_name ILIKE '%Desert Forge%' OR company_id ILIKE '%dfv%';

SELECT id, name, allocated_m, vintage_year, company_count, verified
FROM funds
WHERE id = 'dfv';
