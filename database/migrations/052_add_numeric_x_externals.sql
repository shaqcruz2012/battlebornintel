-- Migration 052: Add missing numeric x_ external nodes (institutional LPs and investors)
--
-- These IDs appear in graph_edges with an x_[0-9] pattern but have no matching
-- row in the externals table. They represent institutional LPs, corporate partners,
-- government bodies, universities, and investor networks referenced by recent
-- Nevada venture activity (Feb–Mar 2026).
--
-- Sources: graph_edges notes and rel fields queried 2026-03-09.

BEGIN;

INSERT INTO externals (id, name, entity_type, note) VALUES

  -- LP investors in BBV Fund III and FundNV
  ('x_200',  'Wynn Family Office',              'Family Office',
   '$10M anchor LP commitment to BBV Fund III.'),

  ('x_207',  'Nevada PERS',                     'Pension Fund',
   'Nevada Public Employees Retirement System. $15M LP commitment to BBV Fund III; $30M LP commitment to FundNV SSBCI Phase 2 — first Nevada pension fund direct LP commitment to a state venture vehicle; approved February 2026.'),

  ('x_208',  'Nevada State Treasurer''s Office', 'Government',
   'State of Nevada. $5M co-investment into BBV Fund III via Nevada Innovation Fund; extended FundNV SSBCI program through 2028 with $45M additional federal match; announced March 2026.'),

  ('x_210',  'JPMorgan Alternative Assets',     'PE Firm',
   '$8M LP commitment to BBV Fund III following Nevada venture roundtable.'),

  -- Co-investors and deal-by-deal participants
  ('x_201',  'Station Casinos Ventures',         'Corporation',
   'Corporate venture arm of Station Casinos LLC. Led $6M seed in ArcadeIQ AI; $10M co-investment syndicate with 1864 Capital for Nevada gaming tech, hospitality AI, and loyalty fintech; live casino deployment access across 9 Station properties; March 2026.'),

  ('x_202',  'Switch Ventures',                  'VC Firm',
   'Venture arm of Switch data center operator. Invested $1.5M in CoolEdge Thermal, $1.8M in NeonCore Systems, $1.7M in VaultGrid Technologies; $6M co-investment with Goldman Sachs PE in Nevada data center thermal management startup; March 2026.'),

  ('x_203',  'Playa Capital Group',              'Family Office',
   '$2M co-investment alongside 1864 Capital in SaaS fintech deal.'),

  ('x_204',  'Intermountain Ventures Group',     'VC Firm',
   'Led $3M seed in PeakHealth Analytics (Reno healthtech).'),

  ('x_209',  'Goldman Sachs PE',                 'PE Firm',
   'Goldman Sachs Private Equity. $12M co-investment with Switch Ventures in Nevada data center thermal management startup; $30M growth equity in QuantumEdge AI at $180M valuation; Goldman''s first direct Nevada tech investment; March 2026.'),

  -- University and academic institutions
  ('x_205',  'UNLV Foundation',                  'University',
   'University of Nevada Las Vegas Foundation. LP commitment to BBV Fund III via Nevada Innovation Endowment; co-manages $5M UNLV Spinout Accelerator Fund with BBV for cleantech, biotech, and enterprise AI spinouts; announced February 2026.'),

  ('x_233',  'UNLV',                             'University',
   'University of Nevada, Las Vegas. Hosts $4M MGM-endowed Hospitality AI Research Center (Harrah Hotel College); joint Battery Innovation Lab with Tesla Gigafactory NV ($8M, 3-year); contributed 8 faculty researchers and campus space.'),

  ('x_232',  'Desert Research Institute',        'University',
   'DRI. 4-year research partnership with NevadaVolt Energy for vanadium flow battery thermal performance testing at high-altitude field stations; 2 postdoctoral positions funded; IP split 60/40 NevadaVolt; co-funded by DOE ARPA-E grant; March 2026.'),

  -- Corporate partners and strategic actors
  ('x_220',  'Switch',                           'Corporation',
   'Switch data center operator (Las Vegas / Prime FIVE campus). 5-year colocation and power agreement for 4,096-GPU AMD MI355X cluster (8 MW); piloted Hubble Network satellite BLE connectivity across 1.2M sq ft build-out; GOED MOU providing subsidized colocation credits up to $50K/year for Nevada AI and cybersecurity startups; 2026.'),

  ('x_221',  'MGM Resorts',                      'Corporation',
   'MGM Resorts International. Guest personalization platform partnership with TensorWave across Bellagio, MGM Grand, and Aria for 40M MGM Rewards members; Kaptyn extended across MGM properties via MGM Tech Labs Cohort 2; $4M endowment for UNLV Harrah Hotel College Hospitality AI Research Center; March 2026.'),

  ('x_222',  'Tesla Gigafactory Nevada',          'Corporation',
   'Tesla Gigafactory NV (Sparks, Nevada). $8M, 3-year Battery Innovation Lab with UNLV Howard R. Hughes College of Engineering for manufacturing process optimization and sustainable materials science; 25 graduate positions created; announced February 2026.'),

  ('x_223',  'Station Casinos LLC',              'Corporation',
   'Station Casinos LLC parent company. Launched $25M corporate venture fund operated through Station Casinos Ventures (x_201), targeting Nevada gaming tech and hospitality AI startups; March 2026.'),

  ('x_224',  'Las Vegas Convention Center',       'Government',
   'LVCC (operated by LVCVA). 90-day smart venue pilot in West Hall with Abnormal AI (AI-driven analytics) and TensorWave (environmental monitoring) targeting 20% energy reduction for NAB Show 2026; March 2026.'),

  ('x_225',  'eBay',                             'Corporation',
   'eBay Inc. Nevada Trust & Safety expansion adding 200 hires at Las Vegas hub (growing to 550+ employees); integrated Socure identity verification for fraud detection pipeline; 2026.'),

  -- Government and economic development
  ('x_230',  'Nevada Governor''s Office',         'Government',
   'Nevada Governor''s Office. Issued SBIR Letter of Support for Nevada Nano DOD SBIR proposal for MEMS gas sensing array; February 2026.'),

  ('x_231',  'Nevada GOED',                      'Government',
   'Nevada Governor''s Office of Economic Development. MOU with Switch providing subsidized colocation credits up to $50K/year for qualifying Nevada AI and cybersecurity startups under GOED Innovation Navigator program; signed February 2026.'),

  -- Angel networks and ecosystem organizations
  ('x_234',  'Sierra Angels',                    'Angel',
   'Northern Nevada angel investor network. Co-hosted inaugural Reno Demo Day with Reno Spark Ecosystem (March 2026); 14 startups, 120+ investors; committed $2M Sierra Angels side vehicle for same-day term sheets; biannual format established.'),

  ('x_235',  'Reno Spark Ecosystem',             'Government',
   'Reno-area startup ecosystem accelerator/initiative. Co-hosted inaugural Reno Demo Day with Sierra Angels (March 2026); 14 startups, 120+ investors.'),

  -- LP in Desert Forge Ventures
  ('x_240',  'Paladin Capital Group',            'PE Firm',
   'Anchor LP in Desert Forge Ventures Fund I ($45M close, 2020).'),

  -- Named non-numeric x_ nodes that lack externals rows
  ('x_1864_fund', '1864 Capital Fund',           'VC Firm',
   'Investment vehicle of 1864 Capital. Invested in KnowRisk seed 2025. Related to SSBCI 1864 Fund (fund id: 1864).'),

  ('x_500_startups', '500 Startups',             'VC Firm',
   'Global micro-VC and accelerator. Invested in Wedgies (2013).'),

  ('x_6K_ENERGY', '6K Energy',                  'Corporation',
   'Multi-year supply agreement with Aqua Metals (2026). Duplicate slug of x_6kenergy; retained for edge resolution.')

ON CONFLICT (id) DO NOTHING;

-- Verification: count remaining unresolved numeric x_ nodes after this migration
-- Expected result: 0 rows (all numeric x_ nodes now have externals entries)
SELECT
  COUNT(*) AS unresolved_numeric_x_nodes,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL — review missing IDs' END AS status
FROM (
  SELECT source_id AS node_id FROM graph_edges WHERE source_id LIKE 'x_%'
  UNION
  SELECT target_id FROM graph_edges WHERE target_id LIKE 'x_%'
) e
LEFT JOIN externals x ON x.id = e.node_id
WHERE x.id IS NULL
  AND e.node_id ~ '^x_[0-9]';

COMMIT;
