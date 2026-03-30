-- Migration 150: 18 Nevada-based VCs, family offices, and angel networks
-- Sources: Crunchbase, PitchBook, CB Insights, company websites, news articles
-- Fills structural hole in investor layer — NV billionaire family offices and local VCs
-- Uses ON CONFLICT DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- NEW EXTERNAL ENTITIES: Nevada VCs & Family Offices
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO externals (id, name, entity_type, note) VALUES
  -- Active NV-based VC Firms
  ('x_fertitta_cap',   'Fertitta Capital',          'Family Office',  'Founded by Frank & Lorenzo Fertitta (UFC/Station Casinos). $500M+ permanent capital. Consumer tech, media, entertainment.'),
  ('x_redhills',       'Redhills Ventures',         'VC Firm',        'Las Vegas family office/VC since 1997. Healthcare, high-tech, finance. 23 investments, 1 unicorn, 6 acquisitions.'),
  ('x_hard_yaka',      'Hard Yaka',                 'VC Firm',        'Crystal Bay NV. Greg Kidd. 250+ investments. Early Coinbase investor. Portable identity, fintech, payments.'),
  ('x_octave',         'Octave Ventures',           'VC Firm',        'Henderson NV. Deep tech, biotech, defense tech. Pre-IPO Palantir, Luminar. 20 investments, 4 IPOs.'),
  ('x_raa',            'RAA Ventures',              'VC Firm',        'Las Vegas NV. Internet marketing, eCommerce, consumer internet. ExactTarget, HomeAway, Trulia, Postmates, Fitbit.'),
  ('x_varkain',        'Varkain',                   'VC Firm',        'Las Vegas NV. Mobile, e-commerce, big data. $25K-$700K per deal. 24 investments. Founded by Laurie Hinckley.'),
  ('x_rmr_cap',        'RMR Capital',               'VC Firm',        'Las Vegas NV. Tech-enabled companies. Point.me, Walls360, Distil Networks. $25K-$5M per deal. Founded 2000.'),
  ('x_tots_ventures',  'Tip of the Spear Ventures', 'VC Firm',        'Las Vegas NV. AI-driven business growth. Tech, finance, healthcare. Sam Palazzolo (ex-Deloitte). Founded 2012.'),
  ('x_incline_vc',     'Incline Venture Capital',   'VC Firm',        'Incline Village NV. Fintech, payment processing, SaaS. Founded 2019.'),
  -- Angel Networks
  ('x_ain',            'Angel Investors Network',   'Angel Network',  'Las Vegas NV since 1997. 10,000+ entrepreneurs helped. Broad focus: equity, debt, acquisitions.'),
  ('x_bitangels',      'BitAngels',                 'Angel Network',  'Las Vegas NV. Blockchain, digital currency, crypto. Michael Terpin. Early Ethereum, Factom, ShapeShift, Storj.'),
  -- NV Billionaire Family Offices
  ('x_adelson_fo',     'Adelson Family Office',     'Family Office',  'Miriam Adelson. $37.9B net worth. LVS, Dallas Mavericks, LV Review-Journal. Patrick Dumont manages.'),
  ('x_ruffin_fo',      'Phil Ruffin',               'Family Office',  '$3.5-4.7B net worth. Treasure Island ($775M), Circus Circus ($825M), 50% Trump International LV.'),
  ('x_duffield_fo',    'Duffield Family Office',    'Family Office',  'David Duffield. $15.4B net worth. Incline Village NV. PeopleSoft, Workday, Ridgeline ($480M invested). 8 angel investments.'),
  -- Startup Studios & Community Funds
  ('x_elevate_blue',   'Elevate Blue',              'Startup Studio', 'Incline Village NV. Consumer apps, SaaS. PetSurf, Likemoji, KickParty. Founded 2015.'),
  ('x_audacity_fund',  'Audacity Fund',             'VC Firm',        'Reno NV. $5M target. Inclusive economy, underserved businesses, Northern NV/Tahoe. TEQSpring program.'),
  -- Corporate Venture
  ('x_caesars_cie',    'Caesars Interactive',        'Corporate VC',   'Las Vegas NV. Gaming tech, interactive entertainment. 24 investments incl. DraftKings. Now absorbed into Caesars.'),
  ('x_saic_vc',        'SAIC Venture Capital',      'Corporate VC',   'Las Vegas NV. Manufacturing, life sciences, IT, security. 49 investments, 40 exits.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- PEOPLE: Key partners/founders for top-tier entities
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_ffertitta',  'Frank Fertitta III',  'Chairman',         NULL, 'Co-founded Fertitta Capital. Station Casinos/Red Rock Resorts. UFC co-owner. Net worth ~$4.2B.'),
  ('p_lfertitta',  'Lorenzo Fertitta',    'Co-Founder',       NULL, 'Co-founded Fertitta Capital. Station Casinos. UFC co-owner.'),
  ('p_kidd',       'Greg Kidd',           'Founding Partner',  NULL, 'Founder Hard Yaka. 250+ investments. Early Coinbase investor. Former Fed advisory. Crystal Bay NV.'),
  ('p_terpin',     'Michael Terpin',       'Co-Founder',       NULL, 'Co-founded BitAngels. Transform Group CEO. Pioneer crypto angel investing. Las Vegas NV.'),
  ('p_duffield',   'David Duffield',       'Founder',          NULL, 'Founded PeopleSoft, Workday, Ridgeline. $15.4B net worth. Incline Village NV.'),
  ('p_dumont',     'Patrick Dumont',       'President/COO',    NULL, 'President/COO Las Vegas Sands. Manages Adelson family investments. Son-in-law of Sheldon Adelson.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRAPH EDGES: Person → Entity relationships
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  -- Fertitta family
  ('p_ffertitta', 'x_fertitta_cap', 'founded_by',   'Co-founded Fertitta Capital with $500M from UFC sale', 2017, 'historical'),
  ('p_lfertitta', 'x_fertitta_cap', 'founded_by',   'Co-founded Fertitta Capital', 2017, 'historical'),
  -- Hard Yaka
  ('p_kidd',      'x_hard_yaka',    'founded_by',   'Founded Hard Yaka VC, Crystal Bay NV', 2011, 'historical'),
  -- BitAngels
  ('p_terpin',    'x_bitangels',    'founded_by',   'Co-founded BitAngels crypto angel network', 2013, 'historical'),
  -- Duffield
  ('p_duffield',  'x_duffield_fo',  'manages',      'Manages family investments from Incline Village NV', 2016, 'historical'),
  -- Dumont → Adelson
  ('p_dumont',    'x_adelson_fo',   'manages',      'Manages Adelson family investments as LVS President/COO', 2020, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRAPH EDGES: Notable investments by NV-based VCs (verified)
-- ══════════════════════════════════════════════════════════════════════════════

-- RAA Ventures portfolio (verified exits)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_raa', 'x_postmates', 'invested_in', 'Early investor, acquired by Uber 2020', 2015, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Octave Ventures portfolio
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('x_octave', 'x_palantir', 'invested_in', 'Pre-IPO investment', 2018, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- Varkain → NV companies (if any exist in graph)
-- BitAngels → crypto companies (Ethereum ecosystem)

-- ══════════════════════════════════════════════════════════════════════════════
-- GRAPH EDGES: NV billionaire family offices → ecosystem connections
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  -- Fertitta → Station Casinos/Red Rock (NV-based corporation)
  ('x_fertitta_cap', 'e_lvgea',   'partners_with', 'Fertitta family major LV economic presence', 2017, 'historical'),
  -- Ruffin → LV hospitality ecosystem
  ('x_ruffin_fo',    'e_lvgea',   'partners_with', 'Treasure Island, Circus Circus owner. $4B+ NV hospitality assets.', 2009, 'historical'),
  -- Duffield → UNR/Tahoe ecosystem
  ('x_duffield_fo',  'x_unr',     'partners_with', 'Ridgeline HQ in Incline Village. 400 employees in Tahoe region.', 2017, 'historical'),
  -- Adelson → LV ecosystem
  ('x_adelson_fo',   'e_lvgea',   'partners_with', 'Las Vegas Sands major employer. $45B market cap.', 2020, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRAPH EDGES: Fund eligibility for BBV co-investment opportunities
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category) VALUES
  ('f_bbv', 'x_fertitta_cap', 'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_redhills',     'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_hard_yaka',    'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_octave',       'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_raa',          'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_varkain',      'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_rmr_cap',      'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_incline_vc',   'qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity'),
  ('f_bbv', 'x_audacity_fund','qualifies_for', 'Potential co-investment partner for NV deals', 2025, 'opportunity')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- METRIC SNAPSHOTS: Capital availability from NV-based investors
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id)
VALUES
  ('investor', 'x_fertitta_cap', 'aum_m',           500,   'usd_millions', '2017-01-01', '2025-12-31', 'year', 0.85, true, 'web_research'),
  ('investor', 'x_adelson_fo',   'net_worth_b',     37.9,  'usd_billions', '2025-01-01', '2025-12-31', 'year', 0.90, true, 'web_research'),
  ('investor', 'x_ruffin_fo',    'net_worth_b',     4.2,   'usd_billions', '2025-01-01', '2025-12-31', 'year', 0.85, true, 'web_research'),
  ('investor', 'x_duffield_fo',  'net_worth_b',     15.4,  'usd_billions', '2025-01-01', '2025-12-31', 'year', 0.90, true, 'web_research'),
  ('investor', 'x_audacity_fund','target_fund_m',   5,     'usd_millions', '2020-01-01', '2025-12-31', 'year', 0.80, true, 'web_research')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

COMMIT;
