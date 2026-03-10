-- Migration 081: Generate timeline_events from verified graph_edges (Batch 3: companies 33-48)
--
-- Source: graph_edges with rel types invested_in, grants_to, acquired,
--         accelerated/accelerated_by, partners_with, contracts_with
-- Mapping: invested_in -> Funding, grants_to -> Grant, acquired -> Acquisition,
--          accelerated/accelerated_by -> Milestone, partners_with -> Partnership,
--          contracts_with -> Partnership
-- Icons:   Funding=dollar, Grant=trophy, Partnership=handshake, Acquisition=building, Milestone=star
--
-- All detail text comes directly from graph_edges.note - no fabricated content.
-- Month staggering applied when multiple same-type events share the same year.
-- Idempotent: ON CONFLICT DO NOTHING.
--
-- Run: PGPASSWORD=bbi_dev_password psql -h localhost -p 5433 -U bbi -d battlebornintel -f database/migrations/081_timeline_from_edges_batch3.sql

BEGIN;

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
VALUES

  -- =====================================================================
  -- c_33: Comstock Mining (id=33)
  -- =====================================================================

  -- invested_in -> Funding
  ('2024-06-15', 'Funding', 'Comstock Mining',
   'Marathon Petroleum Series A in Comstock Fuels.',
   'dollar', 33, 0.7, false),

  -- partners_with -> Partnership (2021, 2022, 2023, 2024, 2025 - one per year, no stagger needed)
  ('2021-06-15', 'Partnership', 'Comstock Mining',
   'Comstock 64% stake in LiNiCo.',
   'handshake', 33, 0.7, false),

  ('2022-06-15', 'Partnership', 'Comstock Mining',
   'Connected via LiNiCo.',
   'handshake', 33, 0.7, false),

  ('2023-06-15', 'Partnership', 'Comstock Mining',
   'Bombard solar installs, Comstock recycles panels.',
   'handshake', 33, 0.7, false),

  ('2024-03-15', 'Partnership', 'Comstock Mining',
   'Comstock CEO at UNR on mining.',
   'handshake', 33, 0.7, false),

  ('2025-06-15', 'Partnership', 'Comstock Mining',
   'RWE Clean Energy MSA for solar recycling.',
   'handshake', 33, 0.7, false),

  -- =====================================================================
  -- c_34: Filament Health (id=34)
  -- =====================================================================

  -- invested_in -> Funding (2022 x1, 2023 x2 - stagger 2023)
  ('2022-06-15', 'Funding', 'Filament Health',
   'BBV portfolio company',
   'dollar', 34, 0.7, false),

  ('2023-04-15', 'Funding', 'Filament Health',
   'Wellcome Leap Phase 2 clinical trial funding 2023',
   'dollar', 34, 0.7, false),

  ('2023-08-15', 'Funding', 'Filament Health',
   'Negev Capital Lead psychedelic pharma 2023',
   'dollar', 34, 0.7, false),

  -- =====================================================================
  -- c_35: Amerityre (id=35)
  -- =====================================================================

  -- partners_with -> Partnership
  ('2023-06-15', 'Partnership', 'Amerityre',
   'Both NV manufacturing/cleantech.',
   'handshake', 35, 0.7, false),

  -- =====================================================================
  -- c_36: Tilt AI (id=36)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'Tilt AI',
   'Pitch Day company',
   'star', 36, 0.7, false),

  -- invested_in -> Funding (2023 x2, 2024 x3 - stagger both years)
  ('2023-05-15', 'Funding', 'Tilt AI',
   'FundNV investment in Tilt.',
   'dollar', 36, 0.7, false),

  ('2023-09-15', 'Funding', 'Tilt AI',
   '1864 Fund investment in Tilt.',
   'dollar', 36, 0.7, false),

  ('2024-03-15', 'Funding', 'Tilt AI',
   'Lerer Hippeau Seed co-lead $7.1M 2024',
   'dollar', 36, 0.7, false),

  ('2024-06-15', 'Funding', 'Tilt AI',
   'BBV portfolio — Tilt AI',
   'dollar', 36, 0.7, false),

  ('2024-09-15', 'Funding', 'Tilt AI',
   'Balderton Capital Tilt AI investor 2024',
   'dollar', 36, 0.7, false),

  -- =====================================================================
  -- c_37: Nommi (id=37)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'Nommi',
   'StartUpNV portfolio company.',
   'star', 37, 0.7, false),

  -- invested_in -> Funding (2021 x1, 2023 x2 - stagger 2023)
  ('2021-06-15', 'Funding', 'Nommi',
   'Wavemaker Partners Series B lead $20M Nov 2021',
   'dollar', 37, 0.7, false),

  ('2023-05-15', 'Funding', 'Nommi',
   'FundNV investment in Nommi.',
   'dollar', 37, 0.7, false),

  ('2023-09-15', 'Funding', 'Nommi',
   '1864 Fund investment in Nommi.',
   'dollar', 37, 0.7, false),

  -- partners_with -> Partnership (2021 x2 - stagger)
  ('2021-04-15', 'Partnership', 'Nommi',
   'Iron Chef Masaharu Morimoto equity partnership',
   'handshake', 37, 0.7, false),

  ('2021-08-15', 'Partnership', 'Nommi',
   'C3 (Sam Nazarian) 50/50 partnership robotic kitchen',
   'handshake', 37, 0.7, false),

  -- =====================================================================
  -- c_38: Amira Learning (id=38)
  -- =====================================================================

  -- invested_in -> Funding (2021 x1, 2022 x1, 2023 x2 - stagger 2023)
  ('2021-06-15', 'Funding', 'Amira Learning',
   'Led Amira Learning Series A $11M.',
   'dollar', 38, 0.7, false),

  ('2022-06-15', 'Funding', 'Amira Learning',
   'BBV portfolio company',
   'dollar', 38, 0.7, false),

  ('2023-04-15', 'Funding', 'Amira Learning',
   'Owl Ventures. Amira Learning.',
   'dollar', 38, 0.7, false),

  ('2023-08-15', 'Funding', 'Amira Learning',
   'Amazon Alexa Fund in Amira Learning.',
   'dollar', 38, 0.7, false),

  -- =====================================================================
  -- c_39: Wynn Interactive (id=39)
  -- =====================================================================

  -- partners_with -> Partnership
  ('2022-06-15', 'Partnership', 'Wynn Interactive',
   'Wynn Interactive in NV online sports betting market.',
   'handshake', 39, 0.7, false),

  -- =====================================================================
  -- c_40: betJACK (id=40)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'betJACK',
   'StartUpNV portfolio company.',
   'star', 40, 0.7, false),

  -- invested_in -> Funding (2023 x2 - stagger)
  ('2023-05-15', 'Funding', 'betJACK',
   '1864 Fund investment in betJACK.',
   'dollar', 40, 0.7, false),

  ('2023-09-15', 'Funding', 'betJACK',
   'FundNV investment in betJACK.',
   'dollar', 40, 0.7, false),

  -- =====================================================================
  -- c_41: HiBear (id=41)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2024-06-15', 'Milestone', 'HiBear',
   'Portfolio company, Shark Tank 2024',
   'star', 41, 0.7, false),

  -- invested_in -> Funding (2021 x1, 2022 x1, 2023 x1 - no stagger needed)
  ('2021-06-15', 'Funding', 'HiBear',
   'Reno Seed Fund HiBear co-investor 2021',
   'dollar', 41, 0.7, false),

  ('2022-06-15', 'Funding', 'HiBear',
   'BBV portfolio — HiBear',
   'dollar', 41, 0.7, false),

  ('2023-06-15', 'Funding', 'HiBear',
   'FundNV investment in Hibear.',
   'dollar', 41, 0.7, false),

  -- =====================================================================
  -- c_43: Sapien (id=43)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-03-15', 'Milestone', 'Sapien',
   'StartUpNV portfolio company.',
   'star', 43, 0.7, false),

  -- invested_in -> Funding (2023 x1, 2024 x3 - stagger 2024)
  ('2023-06-15', 'Funding', 'Sapien',
   '1864 Fund investment in Sapien.',
   'dollar', 43, 0.7, false),

  ('2024-03-15', 'Funding', 'Sapien',
   'Variant Seed Round 2 lead $10.5M 2024',
   'dollar', 43, 0.7, false),

  ('2024-06-15', 'Funding', 'Sapien',
   'Animoca Seed Round 1/2 $5M 2024',
   'dollar', 43, 0.7, false),

  ('2024-09-15', 'Funding', 'Sapien',
   'Primitive Ventures Seed Round 1/2 $15.5M 2024',
   'dollar', 43, 0.7, false),

  -- =====================================================================
  -- c_45: Lucihub (id=45)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-02-15', 'Milestone', 'Lucihub',
   'StartUpNV portfolio company.',
   'star', 45, 0.7, false),

  -- invested_in -> Funding (2023 x4 - stagger across year)
  ('2023-03-15', 'Funding', 'Lucihub',
   'BBV portfolio — Lucihub',
   'dollar', 45, 0.7, false),

  ('2023-05-15', 'Funding', 'Lucihub',
   'FundNV investment in Lucihub.',
   'dollar', 45, 0.7, false),

  ('2023-07-15', 'Funding', 'Lucihub',
   '1864 Fund investment in Lucihub.',
   'dollar', 45, 0.7, false),

  ('2023-10-15', 'Funding', 'Lucihub',
   'JAMCO Capital Lucihub Series A $2M 2023',
   'dollar', 45, 0.7, false),

  -- =====================================================================
  -- c_47: Cloudforce Networks (id=47)
  -- =====================================================================

  -- accelerated_by -> Milestone
  ('2023-02-15', 'Milestone', 'Cloudforce Networks',
   'Pitch Day company',
   'star', 47, 0.7, false),

  -- invested_in -> Funding (2023 x2, 2026 x2 - stagger both years)
  ('2023-05-15', 'Funding', 'Cloudforce Networks',
   'FundNV investment in Cloudforce Networks.',
   'dollar', 47, 0.7, false),

  ('2023-09-15', 'Funding', 'Cloudforce Networks',
   '1864 Fund investment in Cloudforce Networks.',
   'dollar', 47, 0.7, false),

  ('2026-04-15', 'Funding', 'Cloudforce Networks',
   'M12 (Microsoft) Cloudforce Series A $10M 2026',
   'dollar', 47, 0.7, false),

  ('2026-08-15', 'Funding', 'Cloudforce Networks',
   'Owl Ventures Cloudforce Networks Series A $10M',
   'dollar', 47, 0.7, false),

  -- =====================================================================
  -- c_48: SiO2 Materials (id=48)
  -- =====================================================================

  -- invested_in -> Funding
  ('2022-06-15', 'Funding', 'SiO2 Materials',
   'BBV portfolio company',
   'dollar', 48, 0.7, false),

  -- partners_with -> Partnership
  ('2023-06-15', 'Partnership', 'SiO2 Materials',
   'Both NV deep-tech materials/sensor companies.',
   'handshake', 48, 0.7, false)

ON CONFLICT ON CONSTRAINT unique_timeline_event DO NOTHING;

-- ============================================================
-- Verify results
-- ============================================================

SELECT company_name, event_type, count(*) as cnt
FROM timeline_events
WHERE company_id BETWEEN 33 AND 48
  AND confidence = 0.7
GROUP BY company_name, event_type
ORDER BY company_name, event_type;

SELECT count(*) as total_new_events
FROM timeline_events
WHERE company_id BETWEEN 33 AND 48
  AND confidence = 0.7
  AND verified = false;

COMMIT;
