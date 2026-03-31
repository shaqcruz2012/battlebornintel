-- Migration 143: 35 verified people for Nevada knowledge graph
-- Sources: Crunchbase, LinkedIn, GOED, EDAWN, LVGEA, UNLV, UNR, company websites
-- Categories: Founders (15), Fund Managers (7), Government (6), University (3), Corporate (4)
-- Skips 6 people already in migration 131 + ~30 in migration 139
-- Uses ON CONFLICT (id) DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY 1: STARTUP FOUNDERS/CEOs
-- (p_ayers, p_reiser already added in migration 139 — skip those)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  -- Socure — p_ayers already in 139
  -- Abnormal AI — p_reiser already in 139
  -- Boxabl — p_gtiramani, p_ptiramani already in 139
  ('p_cook',       'Dan Cook',          'Co-Founder/CEO',     29,  'CEO Lyten. Leading $1B+ Reno gigafactory. Li-S battery pioneer.'),
  ('p_haro',       'Alex Haro',         'Co-Founder/CEO',     6,   'CEO Hubble Network. First-ever BLE-to-satellite. Co-founded Life360 (ASX-listed).'),
  ('p_woltermann', 'Bjoern Woltermann', 'Founder',            10,  'Created FDA-cleared EMS bodysuit. TIME Best Inventions 2023. Based at Black Fire Innovation.'),
  ('p_mdouglas',   'Mark Douglas',      'Founder/CEO',        9,   'CEO MNTN. Pioneer of self-serve CTV advertising. Adweek Tech Innovator of the Year.'),
  ('p_phares',     'Dr. Denis Phares',  'Founder/CEO',        50,  'Built Dragonfly Energy to Nasdaq (DFLI). UNR Executive MBA. ~100 patents. TEDxReno.'),
  ('p_pascal',     'Andrew Pascal',     'Founder/CEO',        27,  'CEO PlayStudios (Nasdaq: MYPS). Former President & COO Wynn Las Vegas. Steve Wynn nephew.'),
  ('p_angel',      'Mark Angel',        'Co-Founder/CEO',     38,  'CEO Amira Learning. AI reading tutor for K-8. 2M+ students. Fast Company Most Innovative 2025.'),
  ('p_wolff',      'Allison Wolff',     'Co-Founder/CEO',     17,  'CEO Vibrant Planet. Forbes 50 Over 50 Innovation. Ex-Netflix/Google/Meta. 18M+ acres managed.'),
  ('p_berns',      'Jeffrey Berns',     'Founder/CEO',        8,   'CEO Blockchains LLC. Paid $170M cash for 67,000 acres in Storey County. Former class-action attorney.'),
  ('p_knight',     'David Knight',      'Founder/CEO',        117, 'CEO Terbine. IoT data marketplace, 30K+ sensor feeds, 100+ countries. NVIDIA Inception member.'),
  ('p_proulx',     'Ian Proulx',        'Co-Founder/CEO',     5,   'CEO 1047 Games. Created Splitgate. Stanford CS. $120M+ raised.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY 2: FUND MANAGERS & GPs
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_kerslake',   'Nicola Kerslake',   'Founder/GP',         NULL, 'Founder Newbean Capital. Manages BBV SSBCI program since 2014. CFA. Oxford PPE. Also managed CA SSBCI.'),
  ('p_kristint',   'Kristin Tomasik',   'GP',                 NULL, 'GP Ruby Partners / FundNV. UNLV CS grad. Las Vegas native. Wife of Piotr Tomasik (TensorWave).'),
  ('p_zhou',       'Vicki Zhou',         'GP',                 NULL, 'GP Ruby Partners / FundNV. Co-founded WiseBanyan (acquired by Axos). Johns Hopkins grad.'),
  ('p_hurst',      'Steve Hurst',        'GP',                 NULL, 'GP Granite Partners / 1864 Fund. Patent attorney. UC Berkeley. Co-founder MindMed.'),
  ('p_goff',       'Bob Goff',           'Founder/President',  NULL, 'Founded Sierra Angels 1997 (one of first 5 US angel groups). Stanford. Hans Severiens Award 2005.'),
  ('p_robroy',     'Rob Roy',            'Founder/CEO',        58,  'Founded Switch Inc 2000. 950+ patent claims. SUPERNAP data centers. $11B DigitalBridge acquisition 2022.'),
  ('p_jacres',     'John Acres',         'Founder/CEO',        69,  'Inventor of casino systems tech. Gaming Hall of Fame 2016. 200+ patents. Cashless gaming pioneer.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY 3: GOVERNMENT & ECONOMIC DEVELOPMENT
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_burns',      'Tom Burns',          'Executive Director',  NULL, 'GOED Executive Director. Appointed by Gov. Lombardo Jan 2023. Former Deloitte CPA. Oversees SSBCI.'),
  ('p_lombardo',   'Joe Lombardo',       'Governor',            NULL, '34th Governor of Nevada (2023-present). Nevada Forward Economic Development Policy Reform Act.'),
  ('p_tadams',     'Taylor Adams',       'President/CEO',       NULL, 'EDAWN President & CEO since 2023. 22 companies recruited in 2024 (~$3B investment, 1,900+ jobs).'),
  ('p_casey',      'Danielle Casey',     'President/CEO',       NULL, 'LVGEA President & CEO since June 2025. 20+ years economic development. Ex-Albuquerque AREA.'),
  ('p_miles',      'Zachary Miles',      'SVP Economic Dev',    NULL, 'Founded Black Fire Innovation at UNLV. Runs Nevada SBDC. Former Utah tech transfer deputy.'),
  ('p_shanahan',   'Rebecca Shanahan',   'Executive Director',  56,  'Executive Director WaterStart. Partners with GOED and SNWA for water tech commercialization.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY 4: UNIVERSITY LEADERS
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_sandoval',   'Brian Sandoval',     'President',           NULL, 'UNR President. Former 29th Governor of Nevada (2011-2019). First Hispanic federal judge in NV. Launched WaterStart.'),
  ('p_martin',     'Leith Martin',       'Executive Director',  NULL, 'Dir Troesh Center UNLV. GP Granite Partners / 1864 Fund. Serial entrepreneur. Manages Rebel Venture Fund.'),
  ('p_madison',    'Eric Madison',        'Co-Founder/President', NULL, 'Co-founded StartUpNV with Jeff Saling (2016). UNC Asheville CS.')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY 5: CORPORATE/DEFENSE LEADERS
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO people (id, name, role, company_id, note) VALUES
  ('p_fatih',      'Fatih Ozmen',        'CEO',                 51, 'CEO Sierra Nevada Corp. Acquired SNC 1994 (20→4,500+ employees). Turkish immigrant. UNR MS EE. Billionaire.'),
  ('p_eren',       'Eren Ozmen',         'Chairwoman/Owner',    51, 'Co-owner SNC. UNR MBA. Billionaire. Top woman-owned A&D company. BENS Eisenhower Award.'),
  ('p_blachar',    'Doron Blachar',      'CEO',                 74, 'CEO Ormat Technologies (NYSE: ORA). 150MW Google data center PPA. Tel Aviv University MBA.'),
  ('p_calaway',    'James Calaway',      'Executive Chairman',  49, 'Exec Chairman Ioneer. Leading Rhyolite Ridge Li-B project. $996M DOE loan.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
