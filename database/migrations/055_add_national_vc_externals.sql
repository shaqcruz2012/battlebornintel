-- Migration 055: Add missing external node entries for national VC firms,
-- accelerators, and investor entities referenced in graph_edges but absent
-- from the externals table.
--
-- Strategy: ON CONFLICT DO NOTHING guards against re-running this migration.
-- Only IDs confirmed unresolved by the query:
--   SELECT DISTINCT e.node_id FROM (...) e LEFT JOIN externals x ON x.id = e.node_id
--   WHERE x.id IS NULL AND e.node_id !~ '^x_[0-9]'
-- and classified as VC Firm, Accelerator, or closely related investor entity.
--
-- Note: Many x_UPPER_CASE IDs are legacy graph_edges references that differ
-- from the canonical lowercase IDs already in externals (e.g. x_ANDREESSEN vs
-- a separate x_andreessen entry). Both forms are inserted here so graph lookups
-- resolve regardless of which form appears in source/target columns.

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- National VC Firms (top-tier, unresolved)
-- ──────────────────────────────────────────────────────────────────────────────

-- x_ANDREESSEN — uppercase legacy reference; x_andreessen not yet in externals
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ANDREESSEN',         'Andreessen Horowitz (a16z)',  'VC Firm',     'Top-tier Silicon Valley VC; Series D $170M 2021 growth fund reference.')
ON CONFLICT (id) DO NOTHING;

-- x_andreessen — lowercase canonical form, also unresolved
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_andreessen',         'Andreessen Horowitz (a16z)',  'VC Firm',     'Top-tier Silicon Valley VC; a16z Growth Fund investor.')
ON CONFLICT (id) DO NOTHING;

-- x_balderton — European VC; Tilt AI investor 2024
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_balderton',          'Balderton Capital',           'VC Firm',     'London-based European VC; Tilt AI investor 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_ballistic_ventures — cybersecurity-focused VC
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ballistic_ventures', 'Ballistic Ventures',          'VC Firm',     'Cybersecurity-focused VC; seed round $7M 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_brookfield — Brookfield Growth Partners
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_brookfield',         'Brookfield Growth Partners',  'VC Firm',     'Growth equity arm of Brookfield Asset Management; Series B lead $30M 2019.')
ON CONFLICT (id) DO NOTHING;

-- x_builders_vc — BuildersVC
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_builders_vc',        'BuildersVC',                  'VC Firm',     'SF-based VC; Series A lead $6.5M 2017.')
ON CONFLICT (id) DO NOTHING;

-- x_calibrate_ventures — Calibrate Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_calibrate_ventures', 'Calibrate Ventures',          'VC Firm',     'Nevada-connected VC; Talage Series B 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_canaan_partners — Canaan Partners (distinct from existing x_canaan)
-- x_canaan already exists; this is a differently-keyed reference
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_canaan_partners',    'Canaan Partners',             'VC Firm',     'Early-stage VC; Seed/Series A lead $12.6M.')
ON CONFLICT (id) DO NOTHING;

-- x_cerberus_ventures — Cerberus Ventures (distinct from existing x_cerberus_v)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_cerberus_ventures',  'Cerberus Ventures',           'VC Firm',     'Venture arm of Cerberus Capital; Series A lead $22.5M Nov 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_dragoneer_investment — Dragoneer Investment Group (distinct from x_dragoneer)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_dragoneer_investment','Dragoneer Investment Group', 'VC Firm',     'Growth-stage investor; Series C lead $100M 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_ecosystem_integrity — Ecosystem Integrity Fund (distinct from x_eif)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ecosystem_integrity','Ecosystem Integrity Fund',    'VC Firm',     'Impact VC; Seed/Series A lead.')
ON CONFLICT (id) DO NOTHING;

-- x_emergence — Emergence Capital (distinct from existing i_emergence)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_emergence',          'Emergence Capital',           'VC Firm',     'Enterprise SaaS VC; Prosper Tech seed $5M 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_evolution_equity — Evolution Equity Partners (distinct from x_evolution)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_evolution_equity',   'Evolution Equity Partners',   'VC Firm',     'Cybersecurity-focused VC; Series A $35M + Series B $60M.')
ON CONFLICT (id) DO NOTHING;

-- x_firebrand — Firebrand Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_firebrand',          'Firebrand Ventures',          'VC Firm',     'Utah-based VC; Nivati Series A lead $4M 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_founders_fund — Founders Fund (distinct from i_founders / i_founders_fund)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_founders_fund',      'Founders Fund',               'VC Firm',     'Peter Thiel-founded VC; Series B AI Foundation 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_granite_capital — Granite Capital Partners
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_granite_capital',    'Granite Capital Partners',    'VC Firm',     'Nevada-connected VC; Otsy investor 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_grey_collar — Grey Collar Ventures (distinct from i_grey_collar_ventures)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_grey_collar',        'Grey Collar Ventures',        'VC Firm',     'Seed-stage VC; seed lead 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_homegrown_capital — Homegrown Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_homegrown_capital',  'Homegrown Capital',           'VC Firm',     'Community-focused VC; Coco Coders seed $1.75M 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_iagcapital — IAG Capital (distinct from x_iag)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_iagcapital',         'IAG Capital Partners',        'VC Firm',     'Bridge round 2021 / Series A investor.')
ON CONFLICT (id) DO NOTHING;

-- x_icon_ventures — Icon Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_icon_ventures',      'Icon Ventures',               'VC Firm',     'Enterprise SaaS VC; Series C lead $20M 2014.')
ON CONFLICT (id) DO NOTHING;

-- x_jmi_equity — JMI Equity
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_jmi_equity',         'JMI Equity',                  'VC Firm',     'Growth equity VC focused on software; Vena Series A lead $115M 2019.')
ON CONFLICT (id) DO NOTHING;

-- x_LINSE_CAPITAL — Linse Capital (uppercase legacy reference)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_LINSE_CAPITAL',      'Linse Capital',               'VC Firm',     'Growth-stage VC; Series E lead $230M 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_LIQUID_VENTURE — Liquid Venture Partners (uppercase legacy reference)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_LIQUID_VENTURE',     'Liquid Venture Partners',     'VC Firm',     'Early-stage VC; $6M funding round 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_merus_capital — Merus Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_merus_capital',      'Merus Capital',               'VC Firm',     'Bay Area VC; Talage Series A lead $5M 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_nassau_street — Nassau Street Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nassau_street',      'Nassau Street Ventures',      'VC Firm',     'Seed-stage VC; FanUp seed lead $1M 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_negev — Negev Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_negev',              'Negev Capital',               'VC Firm',     'Psychedelic pharma-focused VC; lead investor 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_okapi_ventures — Okapi Ventures (distinct from x_okapi)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_okapi_ventures',     'Okapi Ventures',              'VC Firm',     'Seed-stage VC; co-lead $4.5M 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_owl_ventures — Owl Ventures (distinct from x_owl)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_owl_ventures',       'Owl Ventures',                'VC Firm',     'EdTech-focused VC; Cloudforce Networks Series A $10M.')
ON CONFLICT (id) DO NOTHING;

-- x_peak_capital — Peak Capital Partners
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_peak_capital',       'Peak Capital Partners',       'VC Firm',     'Utah-based VC; Nivati investor 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_prime_movers_lab — Prime Movers Lab
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_prime_movers_lab',   'Prime Movers Lab',            'VC Firm',     'Deep-tech VC backing breakthrough science; Series B lead $200M 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_primitiveventures — Primitive Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_primitiveventures',  'Primitive Ventures',          'VC Firm',     'Crypto/Web3 VC; Seed Round 1/2 $15.5M 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_right_side — Right Side Capital Management
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_right_side',         'Right Side Capital Management','VC Firm',    'Quantitative seed-stage VC; CareWear investor 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_sfc_capital — SFC Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_sfc_capital',        'SFC Capital',                 'VC Firm',     'UK-based seed VC; CircleIn investor 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_shadow_ventures — Shadow Ventures (distinct from x_shadow)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_shadow_ventures',    'Shadow Ventures',             'VC Firm',     'ConstructionTech / PropTech VC; seed co-lead $4.5M 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_stellar_ventures — Stellar Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_stellar_ventures',   'Stellar Ventures',            'VC Firm',     'Impact VC; Ecoatoms $508K 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_the_bond_fund — The Bond Fund
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_the_bond_fund',      'The Bond Fund',               'VC Firm',     'ZenCentiv Series A investor 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_third_prime — Third Prime (distinct from x_thirdprime)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_third_prime',        'Third Prime',                 'VC Firm',     'Early-stage VC; Series A co-lead $9.8M June 2019.')
ON CONFLICT (id) DO NOTHING;

-- x_tru_skye — Tru Skye Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_tru_skye',           'Tru Skye Ventures',           'VC Firm',     'FanUp Series investor 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_tvc_capital — TVC Capital (distinct from x_tvc)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_tvc_capital',        'TVC Capital',                 'VC Firm',     'San Diego VC; Series B lead $11.5M Aug 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_twobearcapital — Two Bear Capital (distinct from x_twobear)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_twobearcapital',     'Two Bear Capital',            'VC Firm',     'Bozeman MT-based VC; Series A lead $26M 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_variant — Variant Fund
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_variant',            'Variant Fund',                'VC Firm',     'Web3 / crypto VC; Seed Round 2 lead $10.5M 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_warburgpincus — Warburg Pincus (distinct from x_warburg)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_warburgpincus',      'Warburg Pincus',              'VC Firm',     'Global growth equity PE/VC; Series D lead $80M 2018.')
ON CONFLICT (id) DO NOTHING;

-- x_wavemaker — Wavemaker Partners
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_wavemaker',          'Wavemaker Partners',          'VC Firm',     'Asia-Pacific / cross-border VC; Series B lead $20M Nov 2021.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Accelerators & Programs
-- ──────────────────────────────────────────────────────────────────────────────

-- x_techstars — Techstars accelerator (distinct from existing x_techstars entries
--   which are not yet in externals; x_boldstart / x_accel already have rows)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_techstars',          'Techstars',                   'Accelerator',  'Global accelerator network; Techstars NYC Winter 2023 ClothesLyne $220K.')
ON CONFLICT (id) DO NOTHING;

-- x_techstars_health — Techstars Health accelerator cohort
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_techstars_health',   'Techstars Health',            'Accelerator',  'Health-focused Techstars program; Elly Health cohort 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_alchemist — Alchemist Accelerator
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_alchemist',          'Alchemist Accelerator',       'Accelerator',  'Enterprise SaaS accelerator; Terbine cohort 2014.')
ON CONFLICT (id) DO NOTHING;

-- x_black_ambition — Black Ambition Prize / Accelerator
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_black_ambition',     'Black Ambition',              'Accelerator',  'Pharrell Williams-founded accelerator/prize for Black founders; Nailstry 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_gbeta — gBETA Accelerator (gener8tor pre-accelerator)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gbeta',              'gBETA (gener8tor)',            'Accelerator',  'Free 7-week pre-accelerator by gener8tor; crEATe Good Foods 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_gener8tor — gener8tor (main fund; distinct from a_gener8tor which already exists)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gener8tor',          'gener8tor',                   'Accelerator',  'Milwaukee-based accelerator/VC; Beloit Kombucha seed 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_gener8tor_109 — gener8tor Reno cohort reference
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gener8tor_109',      'gener8tor (Reno cohort)',     'Accelerator',  'gener8tor Reno program; Phone2 $100K 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_gener8tor_accel — gener8tor accelerator cohort reference
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gener8tor_accel',    'gener8tor Accelerator',       'Accelerator',  'gener8tor accelerator program; Nailstry $105K 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_gener8tor_lv — gener8tor Las Vegas cohort
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gener8tor_lv',       'gener8tor Las Vegas',         'Accelerator',  'gener8tor Las Vegas program; Dog & Whistle $100K 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_medtech_innovator — MedTech Innovator Accelerator
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_medtech_innovator',  'MedTech Innovator',           'Accelerator',  'Global MedTech accelerator; 2023 cohort participant.')
ON CONFLICT (id) DO NOTHING;

-- x_northwestern_bfa — Northwestern Mutual Black Founder Accelerator
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_northwestern_bfa',   'Northwestern Mutual Black Founder Accelerator', 'Accelerator', 'Corporate accelerator for Black founders; 2022 cohort.')
ON CONFLICT (id) DO NOTHING;

-- x_nvidia_inception — NVIDIA Inception Program
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nvidia_inception',   'NVIDIA Inception',            'Accelerator',  'NVIDIA startup accelerator program; Terbine July 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_pharmstars — PharmStars Accelerator (distinct from i_pharmstars which is VC Firm)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_pharmstars',         'PharmStars',                  'Accelerator',  'Pharma-focused accelerator; $100K award 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_plug_and_play — Plug and Play Tech Center (distinct from i_plug_play)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_plug_and_play',      'Plug and Play Tech Center',   'Accelerator',  'Global accelerator / corporate innovation platform; IoT program 2015.')
ON CONFLICT (id) DO NOTHING;

-- x_snap_yellow — Snap Yellow Accelerator (Snap Inc startup program)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_snap_yellow',        'Snap Yellow Accelerator',     'Accelerator',  'Snap Inc accelerator for AR/camera-first startups; $150K 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_yc_health — Y Combinator Health cohort (distinct from x_yc which exists)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_yc_health',          'Y Combinator (Health cohort)','Accelerator',  'YC S20 health track; 2023 reference.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Angel Investors & Individual Investors
-- ──────────────────────────────────────────────────────────────────────────────

-- x_timdraper — Tim Draper (angel; Draper Associates principal)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_timdraper',          'Tim Draper',                  'Angel',        'Draper Associates founder; Longshot Space investor 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_samaltman — Sam Altman (angel; OpenAI CEO)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_samaltman',          'Sam Altman',                  'Angel',        'OpenAI CEO; Longshot Space seed investor 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_tony_hsieh — Tony Hsieh (Downtown Project)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_tony_hsieh',         'Tony Hsieh',                  'Angel',        'Zappos CEO; Downtown Project Las Vegas 2012.')
ON CONFLICT (id) DO NOTHING;

-- x_keiretsu — Keiretsu Forum (angel network)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_keiretsu',           'Keiretsu Forum',              'Angel',        'Global angel investor network; Melzi Surgical 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_acrew — Acrew Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_acrew',              'Acrew Capital',               'VC Firm',      'Diversity-focused VC; AI security seed 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_animoca — Animoca Brands (Web3 investor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_animoca',            'Animoca Brands',              'VC Firm',      'Web3 / gaming investor; Seed Round $5M 2024.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Nevada-local VC / Seed Funds / Angel Programs
-- ──────────────────────────────────────────────────────────────────────────────

-- x_angelnv — AngelNV program (distinct from i_angelnv)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_angelnv',            'AngelNV',                     'Angel Program', 'Nevada angel network / SSBCI program; Adaract investor.')
ON CONFLICT (id) DO NOTHING;

-- x_angelnv_114 — AngelNV with suffix (separate graph edge node)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_angelnv_114',        'AngelNV',                     'Angel Program', 'Nevada angel network; SurgiStream $125K 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_atw_partners — ATW Partners (distinct from x_atw)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_atw_partners',       'ATW Partners',                'VC Firm',      'Structured equity / growth capital; Kaptyn Series A/B investor.')
ON CONFLICT (id) DO NOTHING;

-- x_battlebornventure — Battle Born Venture (local NV VC, unresolved)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_battlebornventure',  'Battle Born Venture',         'VC Firm',      'Nevada-based early-stage VC; Cuts Clothing 2020, HiBear 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_battlebornventure_107 — Battle Born Venture (suffixed edge reference)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_battlebornventure_107','Battle Born Venture',       'VC Firm',      'Nevada-based early-stage VC; Onboarded seed 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_desert_forge — Desert Forge Ventures
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_desert_forge',       'Desert Forge Ventures',       'VC Firm',      'Nevada-based VC; investment 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_desert_forge_124 — Desert Forge Ventures (suffixed)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_desert_forge_124',   'Desert Forge Ventures',       'VC Firm',      'Nevada-based VC; WAVR seed $4M Aug 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_fundnv — FundNV (Nevada seed fund, distinct from x_FUNDNV uppercase)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_fundnv',             'FundNV',                      'VC Firm',      'Nevada-focused seed fund; KnowRisk $4.2M 2025, Let''s Rolo $82.5K 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_FUNDNV — uppercase legacy reference for same fund
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_FUNDNV',             'FundNV',                      'VC Firm',      'Nevada-focused seed fund; first investment $100K 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_fundnv_108 — FundNV with suffix
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_fundnv_108',         'FundNV',                      'VC Firm',      'Nevada-focused seed fund; Otsy seed 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_rebel_venture — UNLV Rebel Fund
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_rebel_venture',      'UNLV Rebel Fund',             'VC Firm',      'UNLV student-run venture fund; ZenCentiv seed 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_reno_seed — Reno Seed Fund (distinct from i_reno_seed_fund / x_renoseedfund)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_reno_seed',          'Reno Seed Fund',              'VC Firm',      'Northern Nevada seed fund; DayaMed 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_renoseedfund — Reno Seed Fund (alternate ID form)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_renoseedfund',       'Reno Seed Fund',              'VC Firm',      'Northern Nevada seed fund; HiBear co-investor 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_startupnv_113 — StartupNV (Nevada seed + accelerator program)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_startupnv_113',      'StartupNV',                   'Accelerator',  'Nevada-based accelerator + seed fund; Semi Exact seed $600K 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_vegastechfund — VegasTechFund (Tony Hsieh)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_vegastechfund',      'VegasTechFund',               'VC Firm',      'Tony Hsieh Downtown Project fund; Fandeavor $525K 2012.')
ON CONFLICT (id) DO NOTHING;

-- x_vegastechfund_125 — VegasTechFund (suffixed reference)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_vegastechfund_125',  'VegasTechFund',               'VC Firm',      'Tony Hsieh Downtown Project fund; 2014 investment.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Corporate / CVC investors
-- ──────────────────────────────────────────────────────────────────────────────

-- x_awaresuper — Aware Super (Australian pension / LP)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_awaresuper',         'Aware Super',                 'Investment Co', 'Australian superannuation fund; $500M investment 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_bayer_ventures — Bayer Ventures (CVC)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_bayer_ventures',     'Bayer Ventures',              'CVC',          'Bayer AG corporate venture arm; pre-seed lead Elly Health 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_cibc_innovation — CIBC Innovation Banking (venture debt)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_cibc_innovation',    'CIBC Innovation Banking',     'CVC',          'Canadian bank venture debt arm; $25M venture debt 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_citi — Citi Ventures (distinct from x_citi_v)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_citi',               'Citi Ventures',               'CVC',          'Citigroup corporate venture arm; Series D 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_cvs_health_ventures — CVS Health Ventures (distinct from x_cvs / x_cvs_health)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_cvs_health_ventures','CVS Health Ventures',         'CVC',          'CVS Health corporate VC; Series D $100M 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_emerson — Emerson Ventures (CVC arm of Emerson Electric)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_emerson',            'Emerson Ventures',            'CVC',          'Emerson Electric corporate VC; Series C co-lead $30M 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_gs — Goldman Sachs Asset Management (institutional LP / co-investor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gs',                 'Goldman Sachs',               'Investment Co', 'Goldman Sachs growth equity; Series C $775M 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_ifm — IFM Investors (Australian infrastructure fund)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ifm',                'IFM Investors',               'Investment Co', 'Australian infrastructure/PE fund; take-private $11B with DigitalBridge 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_m12 — M12 (Microsoft Ventures)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_m12',                'M12 (Microsoft Ventures)',    'CVC',          'Microsoft corporate venture fund; Cloudforce Series A $10M 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_microsoft_climate — Microsoft Climate Innovation Fund
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_microsoft_climate',  'Microsoft Climate Innovation Fund', 'CVC',    'Microsoft climate-focused fund; Series A $15M investor.')
ON CONFLICT (id) DO NOTHING;

-- x_mgm_resorts — MGM Resorts (strategic corporate investor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_mgm_resorts',        'MGM Resorts International',  'Corporation',  'Hospitality/gaming corp; ~10% stake post-SPAC 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_stellantis_ventures — Stellantis Ventures (distinct from x_stellantis)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_stellantis_ventures','Stellantis Ventures',         'CVC',          'Stellantis automotive CVC; Series B co-investor 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_NVIDIA — NVIDIA Ventures (distinct from x_nventures)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_NVIDIA',             'NVIDIA Ventures',             'CVC',          'NVIDIA corporate venture arm; Series E investor 2023.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- PE / Growth Equity
-- ──────────────────────────────────────────────────────────────────────────────

-- x_apollo_global_management — Apollo Global (distinct from x_apollo)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_apollo_global_management','Apollo Global Management','PE Firm',     'Major PE firm; acquired Everi + IGT Gaming July 2025 $6.3B.')
ON CONFLICT (id) DO NOTHING;

-- x_GOFFCAP — Goff Capital (uppercase legacy; distinct from x_goff)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_GOFFCAP',            'Goff Capital Partners',       'PE Firm',      'Dallas-based PE; co-investor, founder John Goff 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_JACOBS_PE — Jacobs Private Equity
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_JACOBS_PE',          'Jacobs Private Equity',       'PE Firm',      '$1B investment 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_vista_equity — Vista Equity Partners
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_vista_equity',       'Vista Equity Partners',       'PE Firm',      'Enterprise software-focused PE; Vena Solutions Series C $300M 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_VICIP — VICI Properties (real estate investment; distinct from x_vici)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_VICIP',              'VICI Properties',             'PE Firm',      'Gaming/hospitality REIT; $150M preferred equity 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_gkcc — GKCC LLC (debt investor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_gkcc',               'GKCC LLC',                    'Investment Co', 'Senior secured note lender; $10M 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_newbean_115 — Newbean Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_newbean_115',        'Newbean Capital',             'VC Firm',      'AgTech / food VC; Taber Innovations 2017.')
ON CONFLICT (id) DO NOTHING;

-- x_jamcocapital — JAMCO Capital
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_jamcocapital',       'JAMCO Capital',               'VC Firm',      'Early-stage VC; Lucihub Series A $2M 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_wellcome_leap — Wellcome Leap (philanthropic research funder)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_wellcome_leap',      'Wellcome Leap',               'Foundation',   'Wellcome Trust research funding program; Phase 2 clinical trial funding 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_spacefund — Space Fund (space-focused VC)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_spacefund',          'Space Fund',                  'VC Firm',      'Space-focused micro VC; Longshot Space $1.5M 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_apg — APG Partners (distinct from i_apg_partners)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_apg',                'APG Partners',                'VC Firm',      'Access Health Dental investor.')
ON CONFLICT (id) DO NOTHING;

-- x_lerer — Lerer Hippeau (distinct from x_lererhippeau / i_lerer)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lerer',              'Lerer Hippeau',               'VC Firm',      'NYC seed VC; Seed co-lead $7.1M 2024.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Government / Quasi-Government Entities (investor / grant-maker roles)
-- ──────────────────────────────────────────────────────────────────────────────

-- x_army — US Army (contracts)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_army',               'US Army',                     'Government',   'HADES surveillance aircraft contract $991.3M 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_darpa — DARPA
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_darpa',              'DARPA',                       'Government',   'Defense Advanced Research Projects Agency; sensor tech development 2004.')
ON CONFLICT (id) DO NOTHING;

-- x_diu — Defense Innovation Unit
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_diu',                'Defense Innovation Unit (DIU)','Government',  'DoD tech commercialization unit; Unmanned Orbital Outpost 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_dod — Department of Defense
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_dod',                'US Department of Defense',    'Government',   'MPS sensor contract 2004.')
ON CONFLICT (id) DO NOTHING;

-- x_usdepartmentofenergy — US Dept of Energy (distinct from x_doe)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_usdepartmentofenergy','US Department of Energy',    'Government',   'DOE ATVM loan $996M Ioneer Jan 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_hhs_grant — HHS (Dept of Health & Human Services grants)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_hhs_grant',          'US Dept of Health & Human Services', 'Government', 'HHS grants; Vena Vitals 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_nevada_ssbci — Nevada SSBCI program (distinct from x_ssbci)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nevada_ssbci',       'Nevada SSBCI',                'Government',   'Nevada GOED SSBCI capital program; Drain Drawer $500K 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_city_lv — City of Las Vegas (distinct from i_city_of_las_vegas / x_lv-econ-dev)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_city_lv',            'City of Las Vegas',           'Government',   'Municipal government; Heligenics investment 2019.')
ON CONFLICT (id) DO NOTHING;

-- x_fda_approval — FDA (regulatory milestone node)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_fda_approval',       'FDA',                         'Government',   'US Food & Drug Administration; Melzi Surgical registration 2023.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Corporations / Strategic Partners (non-VC, unresolved in graph)
-- ──────────────────────────────────────────────────────────────────────────────

-- x_ACUREN — Acuren (inspection services corp)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ACUREN',             'Acuren',                      'Corporation',  'Industrial inspection services; merged with NV5 $1.7B 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_AXON — Axon Enterprise (technology partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_AXON',               'Axon Enterprise',             'Corporation',  'Public safety technology; partner Series E 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_BMW — BMW (EV / INVENT project partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_BMW',                'BMW',                         'Corporation',  'Automotive OEM; INVENT project partner UC San Diego 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_CURALEAF — Curaleaf (cannabis operator)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_CURALEAF',           'Curaleaf',                    'Corporation',  'Multi-state cannabis operator; Nevada operations tech 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_GOOGLE — Google (uppercase legacy; distinct from x_google)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_GOOGLE',             'Google',                      'Corporation',  'Alphabet subsidiary; 150MW geothermal PPA 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_JBA_CONSULTING — JBA Consulting (acquired by NV5)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_JBA_CONSULTING',     'JBA Consulting',              'Corporation',  'Engineering consultancy acquired by NV5 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_KDDI — KDDI Corporation (Japanese telecom investor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_KDDI',               'KDDI Corporation',            'Corporation',  'Japanese telecom; investor 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_MDU_RESOURCES — MDU Resources (utilities/construction parent)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_MDU_RESOURCES',      'MDU Resources Group',         'Corporation',  'Diversified utility/construction group; acquired Bombard Electric 2005.')
ON CONFLICT (id) DO NOTHING;

-- x_NISSAN — Nissan (EV charging partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_NISSAN',             'Nissan',                      'Corporation',  'Automotive OEM; EV charging INVENT partner 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_NUVVE_IPO — Nuvve (NASDAQ PIPE investor event)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_NUVVE_IPO',          'Nuvve (NASDAQ: NVVE)',        'Corporation',  'EV grid-integration company; PIPE $18M 2021.')
ON CONFLICT (id) DO NOTHING;

-- x_NVERGY — NV Energy (power utility; distinct from x_nvenergy)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_NVERGY',             'NV Energy',                   'Corporation',  'Nevada electric utility; 150MW geothermal PPA 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_PENN_ENTERTAINMENT — Penn Entertainment (gaming/hospitality)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_PENN_ENTERTAINMENT', 'Penn Entertainment',          'Corporation',  'Regional gaming operator; Hollywood Casino ETG partnership 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_SDG_E — San Diego Gas & Electric (INVENT partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_SDG_E',              'San Diego Gas & Electric (SDG&E)', 'Corporation', 'SoCal utility; INVENT power partner 2020.')
ON CONFLICT (id) DO NOTHING;

-- x_SLB — SLB / Schlumberger (energy services)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_SLB',                'SLB (Schlumberger)',          'Corporation',  'Global energy services; Enhanced Geothermal partnership 2025.')
ON CONFLICT (id) DO NOTHING;

-- x_jabil — Jabil (electronics manufacturing partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_jabil',              'Jabil',                       'Corporation',  'Contract electronics manufacturer; medPOD manufacturing partner 2016.')
ON CONFLICT (id) DO NOTHING;

-- x_lifekey — LifeKey (acquirer)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lifekey',            'LifeKey',                     'Corporation',  'Acquired Let''s Rolo 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_morimoto — Masaharu Morimoto (equity partner / brand)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_morimoto',           'Iron Chef Masaharu Morimoto', 'Corporation',  'Celebrity chef equity partner in robotic kitchen venture.')
ON CONFLICT (id) DO NOTHING;

-- x_nasateampleap — NASA TechLeap Prize
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nasateampleap',      'NASA TechLeap Prize',         'Government',   'NASA technology prize program; Ecoatoms 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_premier_inc — Premier Inc (group purchasing org)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_premier_inc',        'Premier Inc',                 'Corporation',  'Healthcare group purchasing organization; Nivati partner 2024.')
ON CONFLICT (id) DO NOTHING;

-- x_republic — Republic (crowdfunding platform; distinct from i_republic)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_republic',           'Republic',                    'Crowdfunding', 'Equity crowdfunding platform; GRRRL $122K Sept 2022.')
ON CONFLICT (id) DO NOTHING;

-- x_roseman — Roseman University (lab partner; distinct from u_roseman_univ)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_roseman',            'Roseman University',          'University',   'Health sciences university; Heligenics wet lab HQ 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_samaltman handled above (Angel section)

-- x_spie_challenge — SPIE Startup Challenge
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_spie_challenge',     'SPIE Startup Challenge',      'Accelerator',  'Optics/photonics startup competition; CareWear 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_stationcasino — Station Casinos (strategic partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_stationcasino',      'Station Casinos',             'Corporation',  'Nevada gaming operator; GameSTACK partnership 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_ucsf_research — UCSF (research collaboration)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ucsf_research',      'UC San Francisco',            'University',   'UCSF research collaboration 2023.')
ON CONFLICT (id) DO NOTHING;

-- x_unlv_foundation — UNLV Foundation (distinct from i_unlv_foundation)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_unlv_foundation',    'UNLV Foundation',             'University',   'UNLV fundraising foundation; Heligenics investment 2019.')
ON CONFLICT (id) DO NOTHING;

-- x_volvo — Volvo (EV battery recycling partner)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_volvo',              'Volvo',                       'Corporation',  'Automotive OEM; EV battery recycling partnership California.')
ON CONFLICT (id) DO NOTHING;

-- x_c3_partners — C3 (Sam Nazarian brand partnership)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_c3_partners',        'C3 (Sam Nazarian)',           'Corporation',  'Hospitality/food brand operator; 50/50 robotic kitchen partnership.')
ON CONFLICT (id) DO NOTHING;

-- x_brookfield already inserted above in VC Firms

-- x_switch-inc — Switch Inc (data center operator / donor)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_switch-inc',         'Switch Inc',                  'Corporation',  'Nevada data center operator; $5M tech entrepreneurship endowment contribution Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_waterstart — WaterStart (Nevada water innovation org; distinct from waterstart without x_)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_waterstart',         'WaterStart',                  'Startup',      'Nevada water innovation consortium; DRI NSF climate tech grant partner Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_sierra-nevada-corp — Sierra Nevada Corporation (defense/aerospace)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_sierra-nevada-corp', 'Sierra Nevada Corporation',   'Corporation',  'Aerospace/defense; UNR AASL autonomous ISR drone research $4.2M 2-year 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_sierra-nevada-energy — Sierra Nevada Energy (distinct from sierra-nevada-corp)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_sierra-nevada-energy','Sierra Nevada Energy',       'Startup',      'Clean energy startup; DRI NSF climate tech grant partner Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_vena-vitals — Vena Vitals (DFV portfolio company node)
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_vena-vitals',        'Vena Vitals',                 'Startup',      'DFV portfolio; continuous blood pressure wearable startup.')
ON CONFLICT (id) DO NOTHING;

-- x_wavr-technologies — WAVR Technologies
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_wavr-technologies',  'WAVR Technologies',           'Startup',      'XR/VR enterprise training platform; DFV $4M seed Aug 2025.')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- UNLV spinouts referenced in graph edges (spun_out_of) but absent from externals
-- ──────────────────────────────────────────────────────────────────────────────

-- x_abaco-systems-nv — same as abaco-systems-nv without x_ prefix; keep x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_abaco-systems-nv',   'Abaco Systems Nevada',        'Corporation',  'Ruggedized computing; UNR AASL partner Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_aquagenica — same entity as aquagenica (no x_); add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_aquagenica',         'AquaGenica',                  'Startup',      'UNLV Demo Day spinout — water purification biotech; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_artemis-ag — same as artemis-ag; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_artemis-ag',         'ArtemisAg',                   'Startup',      'UNR spinout — precision irrigation AI; Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_bionvate — same as bionvate; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_bionvate',           'BioNVate Therapeutics',       'Startup',      'Biotech startup; UNLV Harry Reid Research & Technology Park tenant Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_clearvault — same as clearvault; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_clearvault',         'ClearVault',                  'Startup',      'UNLV Demo Day spinout — blockchain credentialing; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_desertdrive — same as desertdrive; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_desertdrive',        'DesertDrive',                 'Startup',      'UNLV Demo Day spinout — autonomous last-mile logistics; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_dri — same as dri; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_dri',                'Desert Research Institute',   'Research Org', 'Nevada System of Higher Education research branch; climate, water, atmospheric sciences.')
ON CONFLICT (id) DO NOTHING;

-- x_drs-technologies — same as drs-technologies; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_drs-technologies',   'DRS Technologies LV',         'Corporation',  'AI-based target recognition; UNR AASL partner Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_heliopath — same as heliopath; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_heliopath',          'HelioPath',                   'Startup',      'UNLV Demo Day spinout — solar cell efficiency AI; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_ibm-research — same as ibm-research; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ibm-research',       'IBM Research',                'Corporation',  'IBM research division; UNLV $18M Quantum Computing Center partner Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_lockheed-martin — same as lockheed-martin; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lockheed-martin',    'Lockheed Martin',             'Corporation',  'Defense/aerospace; UNLV Harry Reid Research & Technology Park lab Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_lunarbuild — same as lunarbuild; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lunarbuild',         'LunarBuild',                  'Startup',      'UNLV Demo Day spinout — 3D-printed construction materials; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nanoshield-nv — same as nanoshield-nv; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nanoshield-nv',      'NanoShield NV',               'Startup',      'UNLV Demo Day spinout — MEMS biosensors; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nevada-state — same as nevada-state; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nevada-state',       'Nevada State University',     'University',   'NSU $5M endowment for Center for Tech Entrepreneurship; Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nevadamed — same as nevadamed; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nevadamed',          'NevadaMed',                   'Startup',      'UNLV Demo Day spinout — telemedicine platform; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nsf-climate-tech — same as nsf-climate-tech; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nsf-climate-tech',   'NSF Climate Tech Program',    'Gov Agency',   'NSF $12M Climate Tech Grant Award #2601847 to DRI Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nsf-icorps-nv — same as nsf-icorps-nv; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nsf-icorps-nv',      'NSF I-Corps Nevada',          'Gov Agency',   'UNLV/UNR joint I-Corps program; 12-team cohort Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nv-legislature — same as nv-legislature; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nv-legislature',     'Nevada Legislature',          'Government',   'HB 223 Advanced Manufacturing; SB 47 AI Innovation Tax Credit Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_nv-sbir-office — same as nv-sbir-office; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_nv-sbir-office',     'Nevada SBIR/STTR Program Office','Government','InnovateNV Phase 0 spring 2026; 18 companies $5K microgrants.')
ON CONFLICT (id) DO NOTHING;

-- x_packbot-ai — same as packbot-ai; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_packbot-ai',         'PackBot AI',                  'Startup',      'UNLV Demo Day spinout — warehouse robotics; Mar 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_panasonic-energy — same as panasonic-energy; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_panasonic-energy',   'Panasonic Energy',            'Corporation',  'Battery manufacturer; UNLV Harry Reid Research & Technology Park R&D tenant Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_quantumedge-nv — same as quantumedge-nv; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_quantumedge-nv',     'QuantumEdge NV',              'Startup',      'UNR spinout — photonic computing research; Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_raytheon-technologies — same as raytheon-technologies; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_raytheon-technologies','Raytheon Technologies',     'Corporation',  'Defense/aerospace; UNLV Harry Reid Research & Technology Park lab Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_reno-innovation — same as reno-innovation; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_reno-innovation',    'City of Reno Innovation Office','Government', '340-acre University Research Park expansion; $12M co-investment Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_titanshield — same as titanshield; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_titanshield',        'TitanShield',                 'Startup',      'UNR spinout — autonomous structural inspection; Feb 2026.')
ON CONFLICT (id) DO NOTHING;

-- x_unlv — same as unlv; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_unlv',               'University of Nevada, Las Vegas','University', 'UNLV — research, spinouts, and NSF programs hub.')
ON CONFLICT (id) DO NOTHING;

-- x_lv-econ-dev — same as lv-econ-dev; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lv-econ-dev',        'City of Las Vegas Economic Development','Government','Innovation District Phase 2 groundbreaking Mar 2026; 1.2M sq ft tech campus.')
ON CONFLICT (id) DO NOTHING;

-- x_goed-nv — same as goed-nv; add x_ form
INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_goed-nv',            'Governor''s Office of Economic Development (GOED)','Government','Nevada GOED; Q1 2026 SBIR Matching Grant, Innovation District partner.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
