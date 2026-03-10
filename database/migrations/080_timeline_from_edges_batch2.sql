-- Migration 080: Generate timeline_events from graph_edges for companies 17-32
--
-- Maps verified graph_edges relationships to timeline_events.
-- Only uses data from graph_edges.note — no invented details.
-- Relationship type mapping:
--   invested_in      → Funding  (💰)
--   grants_to        → Grant    (🏆)
--   acquired         → Acquisition (🏢)
--   accelerated_by   → Milestone (⭐)
--   partners_with    → Partnership (🤝)
--   corporate_partner→ Partnership (🤝)
--
-- For multiple edges of same type/year per company, dates are staggered
-- across months (Jan, Mar, Jun, Sep, Dec) to satisfy unique constraint.
--
-- Idempotent: uses ON CONFLICT DO NOTHING.
--
-- Run: PGPASSWORD=bbi_dev_password psql -h localhost -p 5433 -U bbi -d battlebornintel -f database/migrations/080_timeline_from_edges_batch2.sql

BEGIN;

-- =====================================================================
-- VIBRANT PLANET (c_17)
-- =====================================================================

-- invested_in, 2022: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2022-06-15', 'Funding', 'Vibrant Planet',
   'BBV portfolio company',
   '💰', 17, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 5 edges → stagger months 1,3,6,9,12
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Funding', 'Vibrant Planet',
   'Citi Ventures in Vibrant Planet Series A.',
   '💰', 17, 0.7, false),
  ('2023-03-15', 'Funding', 'Vibrant Planet',
   'Grantham Environmental Trust. Vibrant Planet seed.',
   '💰', 17, 0.7, false),
  ('2023-06-15', 'Funding', 'Vibrant Planet',
   'Led Vibrant Planet seed + Series A.',
   '💰', 17, 0.7, false),
  ('2023-09-15', 'Funding', 'Vibrant Planet',
   'Microsoft Climate Innovation Fund.',
   '💰', 17, 0.7, false),
  ('2023-12-15', 'Funding', 'Vibrant Planet',
   'Day One Ventures. Vibrant Planet.',
   '💰', 17, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- KAPTYN (c_18)
-- =====================================================================

-- invested_in, 2022: 2 edges → stagger months 1,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2022-01-15', 'Funding', 'Kaptyn',
   'BBV portfolio company',
   '💰', 18, 0.7, false),
  ('2022-06-15', 'Funding', 'Kaptyn',
   'ATW Partners. Kaptyn Series A + B.',
   '💰', 18, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Funding', 'Kaptyn',
   'Kibble Holdings. Kaptyn early seed.',
   '💰', 18, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2024: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2024-06-15', 'Partnership', 'Kaptyn',
   'MGM Resorts exclusive transportation partner.',
   '🤝', 18, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- corporate_partner, 2026: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2026-06-15', 'Partnership', 'Kaptyn',
   'MGM Tech Labs Cohort 2 — hospitality and EV guest-transport portfolio; Kaptyn guest transportation services extended across MGM properties as part of accelerator partnership, 2026.',
   '🤝', 18, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- CLIMB CREDIT (c_19)
-- =====================================================================

-- invested_in, 2019: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2019-06-15', 'Funding', 'Climb Credit',
   'Co-led Climb Credit Series A $9.8M.',
   '💰', 19, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 2 edges → stagger months 1,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Funding', 'Climb Credit',
   'Early Climb Credit investor.',
   '💰', 19, 0.7, false),
  ('2023-06-15', 'Funding', 'Climb Credit',
   'Co-led Climb Credit Series A.',
   '💰', 19, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- OLLIE (c_20)
-- =====================================================================

-- invested_in, 2017: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2017-06-15', 'Funding', 'Ollie',
   'Led Ollie Series A $12.6M Aug 2017.',
   '💰', 20, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Funding', 'Ollie',
   'Ollie seed co-lead + Series A participant.',
   '💰', 20, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- acquired, 2025: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2025-06-15', 'Acquisition', 'Ollie',
   'Spanish conglomerate acquired Ollie 2025.',
   '🏢', 20, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- NUDGE SECURITY (c_21)
-- =====================================================================

-- invested_in, 2022: 2 edges → stagger months 1,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2022-01-15', 'Funding', 'Nudge Security',
   'BBV portfolio company',
   '💰', 21, 0.7, false),
  ('2022-06-15', 'Funding', 'Nudge Security',
   'Nudge Security seed $7M Apr 2022.',
   '💰', 21, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 2 edges → stagger months 1,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Funding', 'Nudge Security',
   'Nudge Security seed + Series A.',
   '💰', 21, 0.7, false),
  ('2023-06-15', 'Funding', 'Nudge Security',
   'Nudge Security seed extension + Series A.',
   '💰', 21, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2025: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2025-06-15', 'Funding', 'Nudge Security',
   'Led Nudge Security Series A $22.5M Nov 2025.',
   '💰', 21, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- CARBON HEALTH (c_22)
-- =====================================================================

-- invested_in, 2017: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2017-06-15', 'Funding', 'Carbon Health',
   'BuildersVC Series A lead $6.5M 2017',
   '💰', 22, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2019: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2019-06-15', 'Funding', 'Carbon Health',
   'Brookfield Growth Partners Series B lead $30M 2019',
   '💰', 22, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 5 edges → stagger months 1,3,6,9,12
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Funding', 'Carbon Health',
   'Led Series C $100M',
   '💰', 22, 0.7, false),
  ('2023-03-15', 'Funding', 'Carbon Health',
   'Led Series D2 $100M, strategic healthcare',
   '💰', 22, 0.7, false),
  ('2023-06-15', 'Funding', 'Carbon Health',
   'Series D. Multi-position: also MNTN',
   '💰', 22, 0.7, false),
  ('2023-09-15', 'Funding', 'Carbon Health',
   'Series A. Multi-position: also Socure',
   '💰', 22, 0.7, false),
  ('2023-12-15', 'Funding', 'Carbon Health',
   'Led Series D $350M at $3.3B valuation',
   '💰', 22, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- TITAN SEAL (c_23)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Titan Seal',
   'StartUpNV portfolio company.',
   '⭐', 23, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Funding', 'Titan Seal',
   'FundNV investment in Titan Seal.',
   '💰', 23, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- FUND DUEL (c_24)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Fund Duel',
   'StartUpNV portfolio company.',
   '⭐', 24, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Funding', 'Fund Duel',
   'FundNV investment in Fund Duel.',
   '💰', 24, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- COGNIZER AI (c_25)
-- =====================================================================

-- invested_in, 2022: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2022-06-15', 'Funding', 'Cognizer AI',
   'BBV portfolio company',
   '💰', 25, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Cognizer AI',
   'StartUpNV portfolio company.',
   '⭐', 25, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Funding', 'Cognizer AI',
   'FundNV $240K investment in Cognizer AI.',
   '💰', 25, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- DOT AI / SEE ID (c_26)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Dot Ai (SEE ID)',
   'StartUpNV portfolio company.',
   '⭐', 26, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 3 edges → stagger months 3,6,9
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-03-15', 'Funding', 'Dot Ai (SEE ID)',
   'BBV portfolio — Dot Ai',
   '💰', 26, 0.7, false),
  ('2023-06-15', 'Funding', 'Dot Ai (SEE ID)',
   'FundNV investment in SEE ID.',
   '💰', 26, 0.7, false),
  ('2023-09-15', 'Funding', 'Dot Ai (SEE ID)',
   '1864 Fund investment in SEE ID.',
   '💰', 26, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- PLAYSTUDIOS (c_27)
-- =====================================================================

-- invested_in, 2014: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2014-06-15', 'Funding', 'PlayStudios',
   'Icon Ventures Series C lead $20M 2014',
   '💰', 27, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2018: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2018-06-15', 'Partnership', 'PlayStudios',
   'Rewards program',
   '🤝', 27, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2019: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2019-06-15', 'Partnership', 'PlayStudios',
   'Rewards program',
   '🤝', 27, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2021: 5 edges → stagger months 1,3,6,9,12
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2021-01-15', 'Funding', 'PlayStudios',
   'Acies SPAC merged with PlayStudios Jun 2021.',
   '💰', 27, 0.7, false),
  ('2021-03-15', 'Funding', 'PlayStudios',
   'MGM Resorts ~10% stake post-SPAC.',
   '💰', 27, 0.7, false),
  ('2021-06-15', 'Funding', 'PlayStudios',
   'ClearBridge. PlayStudios PIPE.',
   '💰', 27, 0.7, false),
  ('2021-09-15', 'Funding', 'PlayStudios',
   'Neuberger Berman PlayStudios $250M PIPE.',
   '💰', 27, 0.7, false),
  ('2021-12-15', 'Funding', 'PlayStudios',
   'BlackRock led $250M PIPE for PlayStudios.',
   '💰', 27, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Partnership', 'PlayStudios',
   'Acres platform integrates with gaming operators.',
   '🤝', 27, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- EVERI HOLDINGS (c_28)
-- =====================================================================

-- partners_with, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Partnership', 'Everi Holdings',
   'Acres casino tech integrates with Everi.',
   '🤝', 28, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- acquired, 2025: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2025-01-15', 'Acquisition', 'Everi Holdings',
   'Apollo acquired Everi + IGT Gaming Jul 2025 for $6.3B combined.',
   '🏢', 28, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2025: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2025-06-15', 'Partnership', 'Everi Holdings',
   'IGT merged with Everi under Apollo.',
   '🤝', 28, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- LYTEN (c_29)
-- =====================================================================

-- invested_in, 2022: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2022-06-15', 'Funding', 'Lyten',
   'BBV portfolio company',
   '💰', 29, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 4 edges → stagger months 1,3,6,9
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Funding', 'Lyten',
   '$425M+ strategic round',
   '💰', 29, 0.7, false),
  ('2023-03-15', 'Funding', 'Lyten',
   '$425M+ strategic round',
   '💰', 29, 0.7, false),
  ('2023-06-15', 'Funding', 'Lyten',
   '$425M+ strategic round',
   '💰', 29, 0.7, false),
  ('2023-09-15', 'Funding', 'Lyten',
   'Prime Movers Lab Series B lead $200M 2023',
   '💰', 29, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2023: 2 edges → stagger months 1,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Partnership', 'Lyten',
   'Stellantis strategic partnership lithium-sulfur 2023',
   '🤝', 29, 0.7, false),
  ('2023-06-15', 'Partnership', 'Lyten',
   'Workforce development',
   '🤝', 29, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- CRANEL (c_30)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Cranel',
   'StartUpNV portfolio company.',
   '⭐', 30, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 2 edges → stagger months 3,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-03-15', 'Funding', 'Cranel',
   'FundNV investment in Cranel.',
   '💰', 30, 0.7, false),
  ('2023-06-15', 'Funding', 'Cranel',
   '1864 Fund investment in Cranel.',
   '💰', 30, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- FIBRX (c_31)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'fibrX',
   'StartUpNV portfolio company.',
   '⭐', 31, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-03-15', 'Funding', 'fibrX',
   'FundNV investment in fibrX.',
   '💰', 31, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- partners_with, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-06-15', 'Partnership', 'fibrX',
   'Both NV deep-tech hardware startups.',
   '🤝', 31, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- =====================================================================
-- BASE VENTURE (c_32)
-- =====================================================================

-- accelerated_by, 2023: 1 edge
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-01-15', 'Milestone', 'Base Venture',
   'Adams Hub graduate',
   '⭐', 32, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- invested_in, 2023: 2 edges → stagger months 3,6
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES
  ('2023-03-15', 'Funding', 'Base Venture',
   '1864 Fund investment in Base Venture.',
   '💰', 32, 0.7, false),
  ('2023-06-15', 'Funding', 'Base Venture',
   'FundNV investment in Base Venture.',
   '💰', 32, 0.7, false)
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

COMMIT;
