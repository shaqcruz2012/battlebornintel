-- Migration 119: Independent NV Startups Community
-- Adds confirmed out-of-state investors for the 24 Nevada companies with no local fund affiliation.
-- Tags them as independent NV community for graph layout clustering.
--
-- Sources: Crunchbase, SEC filings, press releases, PitchBook (web-researched Mar 2026)

BEGIN;

-- ============================================================
-- 1. Add external investors not already in the DB
-- ============================================================
INSERT INTO externals (id, name, entity_type, note) VALUES
  -- Carbon Health investors (c_22)
  ('x_javelin_vp', 'Javelin Venture Partners', 'VC Firm', 'Carbon Health Series A investor 2017. SF-based seed/early stage.'),
  ('x_bullpen_cap', 'Bullpen Capital', 'VC Firm', 'Carbon Health Series A investor 2017. Post-seed specialist.'),
  ('x_dcvc_ext', 'DCVC', 'VC Firm', 'Carbon Health Series B investor 2019. Deep tech VC.'),
  -- Ollie investors (c_20)
  ('x_primary_vp', 'Primary Venture Partners', 'VC Firm', 'Ollie seed co-lead + Series A. NYC-based seed fund.'),
  ('x_quadrille_cap', 'Quadrille Capital', 'VC Firm', 'Ollie Series B investor. European investment firm.'),
  ('x_ecp_growth', 'ECP Growth', 'VC Firm', 'Ollie Series B investor. Consumer growth fund.'),
  ('x_rosecliff_v', 'Rosecliff Ventures', 'VC Firm', 'Ollie Series A participant. NYC venture fund.'),
  ('x_wme_ventures', 'WME Ventures', 'VC Firm', 'Ollie Series A participant. Entertainment industry VC.'),
  -- Springbig investors (c_12)
  ('x_key_invest', 'Key Investment Partners', 'VC Firm', 'Springbig PIPE investor. Cannabis-focused.'),
  -- Wynn Interactive investors (c_39)
  ('x_austerlitz', 'Austerlitz Acquisition Corp', 'SPAC', 'Bill Foley-led SPAC. WynnBET merger $640M 2021.'),
  -- SilverSun/QXO investors (c_65)
  ('x_sequoia_heritage', 'Sequoia Heritage', 'VC Firm', 'SilverSun/QXO $100M co-investor. Sequoia Capital affiliate.'),
  -- GAN Limited investors (c_54)
  ('x_b2_gaming', 'B2 Digital Gaming Fund', 'VC Firm', 'GAN Limited early B2B gaming investor pre-IPO.'),
  -- Bombard Renewable Energy (c_70)
  ('x_everus', 'Everus Construction', 'Corporation', 'MDU subsidiary. Bombard Electric parent. Construction services.'),
  -- Jackpot Digital (c_71)
  ('x_jp_debenture', 'Jackpot Digital Debenture Holders', 'Investor Group', 'US$1.4M secured debenture financing for ETG manufacturing.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Add invested_in edges for confirmed investors
-- ============================================================

-- Carbon Health (c_22) — additional confirmed investors
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_javelin_vp', 'c_22', 'invested_in', 'Javelin VP Series A $6.5M co-investor 2017', 2017, 'HIGH', true),
  ('x_bullpen_cap', 'c_22', 'invested_in', 'Bullpen Capital Series A $6.5M co-investor 2017', 2017, 'HIGH', true),
  ('x_dcvc_ext', 'c_22', 'invested_in', 'DCVC Series B $30M new investor 2019', 2019, 'HIGH', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Ollie (c_20) — additional confirmed investors
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_primary_vp', 'c_20', 'invested_in', 'Primary Venture Partners seed co-lead $4.4M 2016', 2016, 'HIGH', true),
  ('x_quadrille_cap', 'c_20', 'invested_in', 'Quadrille Capital Series B investor', 2019, 'HIGH', true),
  ('x_ecp_growth', 'c_20', 'invested_in', 'ECP Growth Series B investor', 2019, 'HIGH', true),
  ('x_rosecliff_v', 'c_20', 'invested_in', 'Rosecliff Ventures Series A participant 2017', 2017, 'MEDIUM', true),
  ('x_wme_ventures', 'c_20', 'invested_in', 'WME Ventures Series A participant 2017', 2017, 'MEDIUM', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Springbig (c_12) — additional confirmed investors
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_key_invest', 'c_12', 'invested_in', 'Key Investment Partners Springbig PIPE investor 2022', 2022, 'HIGH', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Wynn Interactive (c_39) — Austerlitz SPAC (Bill Foley)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_austerlitz', 'c_39', 'invested_in', 'Austerlitz SPAC (Bill Foley) merged with Wynn Interactive. $640M cash infusion.', 2021, 'HIGH', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- SilverSun Technologies / QXO (c_65) — Sequoia Heritage co-investor
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_sequoia_heritage', 'c_65', 'invested_in', 'Sequoia Heritage $100M co-investor in SilverSun/QXO $1B round 2024', 2024, 'HIGH', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Bombard Renewable Energy (c_70) — Everus/MDU structure
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_everus', 'c_70', 'invested_in', 'Everus Construction (MDU subsidiary) parent of Bombard Electric', 2005, 'HIGH', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Jackpot Digital (c_71) — debenture financing
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, data_quality, verified)
VALUES
  ('x_jp_debenture', 'c_71', 'invested_in', 'Secured debenture financing US$1.4M for ETG manufacturing', 2023, 'MEDIUM', true)
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ============================================================
-- 3. Tag companies as Independent NV community
-- ============================================================
UPDATE companies
SET description = COALESCE(description, '') || ' [Independent NV — externally funded]'
WHERE id IN (51, 58, 74, 22, 27, 75, 28, 54, 66, 20, 8, 67, 39, 61, 70, 12, 44, 46, 35, 65, 19, 68, 71, 42)
AND description NOT LIKE '%Independent NV%';

COMMIT;
