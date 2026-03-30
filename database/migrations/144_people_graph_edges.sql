-- Migration 144: Graph edges for 35 verified people
-- Connects people to companies (founded_by, employed_at), funds (manages),
-- accelerators, ecosystem orgs, and cross-entity relationships
-- Uses ON CONFLICT DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- FOUNDER/CEO → Company edges (founded_by or employed_at)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('p_cook',       'c_29',  'founded_by',  'Co-founded Lyten. CEO.', 2015, 'historical'),
  ('p_haro',       'c_6',   'founded_by',  'Co-founded Hubble Network. CEO. Also co-founded Life360.', 2021, 'historical'),
  ('p_woltermann', 'c_10',  'founded_by',  'Founded Katalyst. No longer at company.', 2020, 'historical'),
  ('p_mdouglas',   'c_9',   'founded_by',  'Founded MNTN. CEO.', 2018, 'historical'),
  ('p_phares',     'c_50',  'founded_by',  'Founded Dragonfly Energy (Nasdaq: DFLI). CEO.', 2012, 'historical'),
  ('p_pascal',     'c_27',  'founded_by',  'Founded PlayStudios (Nasdaq: MYPS). Former Wynn Las Vegas President.', 2011, 'historical'),
  ('p_angel',      'c_38',  'founded_by',  'Co-founded Amira Learning. CEO.', 2018, 'historical'),
  ('p_wolff',      'c_17',  'founded_by',  'Co-founded Vibrant Planet. CEO. Forbes 50 Over 50.', 2019, 'historical'),
  ('p_berns',      'c_8',   'founded_by',  'Founded Blockchains LLC. 67,000 acres in Storey County.', 2018, 'historical'),
  ('p_knight',     'c_117', 'founded_by',  'Founded Terbine. IoT data marketplace.', 2015, 'historical'),
  ('p_proulx',     'c_5',   'founded_by',  'Co-founded 1047 Games. Created Splitgate.', 2017, 'historical'),
  ('p_robroy',     'c_58',  'founded_by',  'Founded Switch Inc 2000. 950+ patent claims.', 2000, 'historical'),
  ('p_jacres',     'c_69',  'founded_by',  'Founded Acres Technology. Gaming Hall of Fame 2016.', 1985, 'historical'),
  ('p_fatih',      'c_51',  'employed_at', 'CEO Sierra Nevada Corp since 1994.', 1994, 'historical'),
  ('p_eren',       'c_51',  'employed_at', 'Chairwoman & Co-Owner SNC.', 1994, 'historical'),
  ('p_blachar',    'c_74',  'employed_at', 'CEO Ormat Technologies.', 2020, 'historical'),
  ('p_calaway',    'c_49',  'employed_at', 'Executive Chairman Ioneer.', 2018, 'historical'),
  ('p_shanahan',   'c_56',  'employed_at', 'Executive Director WaterStart.', 2018, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- FUND MANAGER → Fund edges (manages)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('p_kerslake',  'f_bbv',    'manages', 'Manages BBV SSBCI program via Newbean Capital since 2014.', 2014, 'historical'),
  ('p_saling',    'f_fundnv', 'manages', 'StartUpNV co-founder, FundNV GP.', 2017, 'historical'),
  ('p_kristint',  'f_fundnv', 'manages', 'GP Ruby Partners / FundNV.', 2020, 'historical'),
  ('p_zhou',      'f_fundnv', 'manages', 'GP Ruby Partners / FundNV. Co-founded WiseBanyan.', 2020, 'historical'),
  ('p_hurst',     'f_1864',   'manages', 'GP Granite Partners / 1864 Fund.', 2023, 'historical'),
  ('p_martin',    'f_1864',   'manages', 'GP Granite Partners / 1864 Fund. UNLV Troesh Center.', 2023, 'historical'),
  ('p_goff',      'f_sierra', 'manages', 'Founded Sierra Angels 1997.', 1997, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- GOVERNMENT/ECON DEV → Ecosystem org edges
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('p_burns',    'e_goed',       'employed_at', 'GOED Executive Director since Jan 2023.', 2023, 'historical'),
  ('p_lombardo', 'e_goed',       'employed_at', 'Governor of Nevada. Oversees GOED.', 2023, 'historical'),
  ('p_tadams',   'e_edawn',      'employed_at', 'EDAWN President & CEO since 2023.', 2023, 'historical'),
  ('p_casey',    'e_lvgea',      'employed_at', 'LVGEA President & CEO since June 2025.', 2025, 'historical'),
  ('p_miles',    'a_blackfire',  'founded_by',  'Founded Black Fire Innovation at UNLV.', 2020, 'historical'),
  ('p_miles',    'e_unlvtech',   'employed_at', 'SVP Economic Development, UNLV.', 2018, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- UNIVERSITY LEADERS → Ecosystem/entity edges
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('p_sandoval', 'x_unr',        'employed_at', 'UNR President. Former NV Governor 2011-2019.', 2020, 'historical'),
  ('p_martin',   'e_unlvtech',   'employed_at', 'Dir UNLV Troesh Center for Entrepreneurship.', 2018, 'historical'),
  ('p_madison',  'a_startupnv',  'founded_by',  'Co-founded StartUpNV with Jeff Saling.', 2016, 'historical'),
  ('p_saling',   'a_startupnv',  'founded_by',  'Co-founded StartUpNV.', 2016, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- CROSS-ENTITY CONNECTIONS (Ozmen→UNR, Phares→UNR, etc.)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  -- Ozmen family → UNR connection (alumni, donors, Ozmen Center)
  ('p_fatih',    'x_unr', 'partners_with', 'UNR MS EE graduate. Ozmen Center namesake.', 1994, 'historical'),
  ('p_eren',     'x_unr', 'partners_with', 'UNR MBA graduate. Honorary doctorate.', 1994, 'historical'),
  -- Phares → UNR
  ('p_phares',   'x_unr', 'partners_with', 'UNR Executive MBA.', 2015, 'historical'),
  -- Woltermann → Black Fire Innovation
  ('p_woltermann', 'a_blackfire', 'partners_with', 'Katalyst based at Black Fire Innovation lab.', 2021, 'historical'),
  -- Kerslake → GOED (SSBCI program administration)
  ('p_kerslake', 'e_goed', 'partners_with', 'BBV administered under GOED SSBCI program.', 2014, 'historical'),
  -- Burns → SSBCI
  ('p_burns',    'x_ssbci', 'partners_with', 'Oversees NV SSBCI as GOED director.', 2023, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

COMMIT;
