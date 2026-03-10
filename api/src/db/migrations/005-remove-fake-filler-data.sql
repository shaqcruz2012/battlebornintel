-- Migration 005: Remove AI-generated filler data
-- Applied: 2026-03-10
--
-- Removes 88 rows of fabricated data introduced by enrichment agents:
--   - 6 timeline_events for fake companies (Sierra Nevada Energy, Truckee Robotics)
--   - 58 timeline_events (IDs 514-575): AI-generated ecosystem/partnership filler with no company_id
--   - 5 future-dated timeline_events (after 2026-03-10)
--   - 10 stakeholder_activities referencing fake company slugs
--   - 9 future-dated stakeholder_activities (after 2026-03-10)
--
-- Fake companies removed: VegasLogic AI, PayVault Financial, DesertWing Autonomous,
--   GreatBasin Genomics, NeonMind AI, NevadaVolt Energy, ShieldWall Security,
--   CasinoIQ Analytics, Sierra Nevada Energy, Truckee Robotics

BEGIN;

DELETE FROM timeline_events WHERE id IN (444, 445, 446, 451, 452, 453);

DELETE FROM timeline_events WHERE id BETWEEN 514 AND 575;

DELETE FROM timeline_events WHERE event_date > '2026-03-10';

DELETE FROM stakeholder_activities
WHERE company_id IN ('neonmind-ai', 'vegaslogic-ai', 'payvault-financial', 'desertwing-autonomous',
                     'greatbasin-genomics', 'nevadavolt-energy', 'shieldwall-security', 'casinoiq-analytics',
                     'quantumedge-ai', 'arcadeiq-ai', 'neoncore-systems', 'vaultgrid-technologies',
                     'cooledge-thermal', 'peakhealth-analytics', 'sentineledge');

DELETE FROM stakeholder_activities WHERE activity_date > '2026-03-10';

COMMIT;
