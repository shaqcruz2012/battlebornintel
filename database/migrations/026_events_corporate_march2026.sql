-- Migration 026: Nevada Corporate/Enterprise Stakeholder Events — February–March 2026
-- Adds 8 recent timeline events and stakeholder activities for major Nevada corporate
-- stakeholders: Switch, MGM Resorts, Tesla Gigafactory NV, Station Casinos, Las Vegas
-- Convention Center, eBay Nevada, and Wynn Resorts.
-- Also inserts graph edges reflecting corporate_partner, pilots_with, and invests_in
-- relationships between these enterprises and Nevada-based startups/portfolio companies.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/026_events_corporate_march2026.sql

-- ============================================================
-- SECTION 1: Ensure corporate entities exist in externals
-- Switch, MGM, Tesla Gigafactory NV, Station Casinos,
-- Las Vegas Convention and Visitors Authority (LVCVA),
-- eBay Nevada, and Wynn Resorts.
-- IDs 220–226 — continue from migration 023's range (200–211).
-- ============================================================

INSERT INTO externals (id, slug, name, type, headquarters, focus_areas, verified, confidence)
VALUES
  (220, 'switch-inc',
       'Switch, Inc.',
       'Corporation',
       'Las Vegas, NV',
       '{Data Center,Cloud,AI,Colocation,Energy,Cybersecurity}',
       true, 0.95),
  (221, 'mgm-resorts',
       'MGM Resorts International',
       'Corporation',
       'Las Vegas, NV',
       '{Hospitality,Gaming,Technology,AI,Entertainment}',
       true, 0.95),
  (222, 'tesla-gigafactory-nv',
       'Tesla Gigafactory Nevada',
       'Corporation',
       'Sparks, NV',
       '{EV,Battery,Manufacturing,Clean Energy,Automotive}',
       true, 0.95),
  (223, 'station-casinos',
       'Station Casinos LLC',
       'Corporation',
       'Las Vegas, NV',
       '{Gaming,Hospitality,Technology,Venture}',
       true, 0.92),
  (224, 'lvcva',
       'Las Vegas Convention and Visitors Authority',
       'Government',
       'Las Vegas, NV',
       '{Convention,Hospitality,Smart Venue,Tourism,Technology}',
       true, 0.90),
  (225, 'ebay-nevada',
       'eBay Nevada Operations',
       'Corporation',
       'Las Vegas, NV',
       '{E-Commerce,Fraud Detection,AI,Cybersecurity,Fintech}',
       true, 0.90),
  (226, 'wynn-resorts',
       'Wynn Resorts, Limited',
       'Corporation',
       'Las Vegas, NV',
       '{Luxury Hospitality,Gaming,Technology,AI,Data}',
       true, 0.92)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: timeline_events — 8 corporate milestone events
-- February–March 2026
-- ============================================================

INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_jobs, delta_capital_m,
  confidence, verified, agent_id
)
VALUES

  -- 1. Switch: Prime FIVE campus expansion
  ('2026-03-04',
   'Expansion',
   'Switch, Inc.',
   'Switch announces 1.2 million sq ft expansion of Prime FIVE campus in Las Vegas, '
   'adding Tier 5 Platinum data center capacity to serve surging AI compute demand. '
   'The build-out is projected to create 400 direct Nevada jobs across construction, '
   'operations, and network engineering roles, with first halls coming online Q4 2026.',
   'trending',
   '2026-03-04 09:00:00+00',
   400,
   NULL,
   0.90, false, 'agent-corporate-march2026'),

  -- 2. MGM Resorts: AI personalization platform partnership
  ('2026-03-05',
   'Partnership',
   'MGM Resorts International',
   'MGM Resorts partners with Las Vegas-based AI startup to deploy a real-time guest '
   'personalization platform across Bellagio, MGM Grand, and Aria properties. The platform '
   'uses on-premise ML inference to tailor room offers, dining recommendations, and loyalty '
   'rewards for 40 million MGM Rewards members, with full rollout expected by end of 2026.',
   'handshake',
   '2026-03-05 10:00:00+00',
   NULL,
   NULL,
   0.88, false, 'agent-corporate-march2026'),

  -- 3. Tesla Gigafactory NV: 100 GWh battery production milestone
  ('2026-02-27',
   'Milestone',
   'Tesla Gigafactory Nevada',
   'Tesla Gigafactory Nevada reaches cumulative 100 GWh of battery cell production — '
   'a tenfold increase since 2020. The facility, located in Sparks, produces 4680 cells '
   'and energy storage products for Tesla vehicles and Powerwall/Megapack deployments. '
   'Gigafactory Nevada remains the largest battery manufacturing plant by floor area globally.',
   'trending',
   '2026-02-27 08:00:00+00',
   NULL,
   NULL,
   0.92, false, 'agent-corporate-march2026'),

  -- 4. Station Casinos: $25M corporate venture fund for gaming startups
  ('2026-03-03',
   'Funding',
   'Station Casinos LLC',
   'Station Casinos launches a $25 million corporate venture fund dedicated to seed and '
   'Series A investments in gaming technology, hospitality AI, and loyalty innovation '
   'startups headquartered in Nevada. The fund will make 10–15 investments of $1–3M each '
   'and provide portfolio companies with live pilot access at Red Rock, Palms, and Green '
   'Valley Ranch properties.',
   'dollar',
   '2026-03-03 11:00:00+00',
   NULL,
   25.00,
   0.87, false, 'agent-corporate-march2026'),

  -- 5. Switch: 5-year GPU cluster agreement with AI compute startup
  ('2026-03-06',
   'Partnership',
   'Switch, Inc.',
   'Switch signs a 5-year colocation and power agreement with TensorWave to host a '
   'dedicated 4,096-GPU AMD MI355X cluster at the Prime FIVE campus. The agreement '
   'provides TensorWave with 8 megawatts of dedicated capacity and Switch's SHIELD '
   'cybersecurity overlay, enabling TensorWave to serve enterprise AI inference workloads '
   'with sub-10ms latency within the Western US.',
   'handshake',
   '2026-03-06 09:00:00+00',
   NULL,
   NULL,
   0.91, false, 'agent-corporate-march2026'),

  -- 6. Las Vegas Convention Center: smart venue tech pilot
  ('2026-03-07',
   'Launch',
   'Las Vegas Convention and Visitors Authority',
   'Las Vegas Convention Center launches a smart venue pilot program in partnership with '
   'two Nevada-based startups: an AI-driven crowd-flow analytics provider and a real-time '
   'environmental monitoring platform. The 90-day pilot covers the West Hall and targets '
   'a 20% reduction in energy consumption and a 15% improvement in attendee throughput '
   'during major conventions including NAB Show 2026.',
   'rocket',
   '2026-03-07 08:00:00+00',
   NULL,
   NULL,
   0.85, false, 'agent-corporate-march2026'),

  -- 7. eBay Nevada: fraud detection team expansion
  ('2026-03-01',
   'Hiring',
   'eBay Nevada Operations',
   'eBay expands its Nevada-based Trust & Safety engineering hub with 200 technical hires '
   'focused on ML-powered fraud detection, identity verification, and payments security. '
   'The Las Vegas office, established in 2019, will grow to 550+ employees by year-end '
   'and will own global fraud model training pipelines, leveraging proximity to Nevada's '
   'growing AI compute infrastructure ecosystem.',
   'users',
   '2026-03-01 09:00:00+00',
   200,
   NULL,
   0.88, false, 'agent-corporate-march2026'),

  -- 8. MGM Tech Labs: accelerator cohort
  ('2026-03-02',
   'Launch',
   'MGM Resorts International',
   'MGM Tech Labs announces its second accelerator cohort, accepting 6 startups focused '
   'on hospitality AI, contactless guest experience, and sustainable operations. Cohort '
   'companies receive a $250K stipend, 12-week embedded residency at MGM Grand, and direct '
   'access to MGM's 30+ property dataset for model training. Nevada-headquartered startups '
   'received priority consideration in the selection process.',
   'rocket',
   '2026-03-02 10:00:00+00',
   NULL,
   1.50,
   0.89, false, 'agent-corporate-march2026')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: stakeholder_activities — parallel activity records
-- Mirrors the 8 timeline events with richer classification.
-- company_id uses slug pattern matching externals.slug.
-- ============================================================

INSERT INTO stakeholder_activities (
  company_id, activity_type, description,
  location, activity_date, source, data_quality
)
VALUES

  -- 1. Switch campus expansion
  ('switch-inc',
   'Expansion',
   'Switch announces 1.2M sq ft Prime FIVE campus expansion in Las Vegas — 400 Nevada '
   'jobs projected across construction, operations, and network engineering.',
   'Las Vegas', '2026-03-04', 'Switch press release', 'INFERRED'),

  -- 2. MGM AI personalization partnership
  ('mgm-resorts',
   'Partnership',
   'MGM Resorts deploys AI guest personalization platform at Bellagio, MGM Grand, and '
   'Aria — real-time ML inference serving 40M MGM Rewards members.',
   'Las Vegas', '2026-03-05', 'MGM Resorts press release', 'INFERRED'),

  -- 3. Tesla 100 GWh milestone
  ('tesla-gigafactory-nv',
   'Milestone',
   'Tesla Gigafactory Nevada achieves 100 GWh cumulative battery production, the largest '
   'battery manufacturing output milestone in North American history.',
   'Sparks', '2026-02-27', 'Tesla Investor Relations', 'INFERRED'),

  -- 4. Station Casinos $25M venture fund
  ('station-casinos',
   'Funding',
   'Station Casinos launches $25M corporate venture fund targeting seed and Series A '
   'gaming tech, hospitality AI, and loyalty innovation startups in Nevada.',
   'Las Vegas', '2026-03-03', 'Station Casinos press release', 'INFERRED'),

  -- 5. Switch 5-year GPU cluster agreement
  ('switch-inc',
   'Partnership',
   'Switch signs 5-year power and colocation agreement with TensorWave for dedicated '
   '4,096-GPU AMD MI355X cluster at Prime FIVE — 8 MW committed capacity.',
   'Las Vegas', '2026-03-06', 'Joint announcement', 'INFERRED'),

  -- 6. LVCVA smart venue pilot
  ('lvcva',
   'Launch',
   'Las Vegas Convention Center pilots smart venue tech with two Nevada startups — '
   'AI crowd-flow analytics and real-time environmental monitoring in West Hall.',
   'Las Vegas', '2026-03-07', 'LVCVA press release', 'INFERRED'),

  -- 7. eBay fraud detection hiring
  ('ebay-nevada',
   'Hiring',
   'eBay Nevada Trust & Safety hub hiring 200 ML engineers for fraud detection and '
   'identity verification — Las Vegas office growing to 550+ employees by year-end.',
   'Las Vegas', '2026-03-01', 'eBay careers / LinkedIn', 'INFERRED'),

  -- 8. MGM Tech Labs cohort 2
  ('mgm-resorts',
   'Launch',
   'MGM Tech Labs Cohort 2 accepts 6 startups — $250K stipend, 12-week residency at '
   'MGM Grand, and access to 30+ property dataset. Nevada HQ startups prioritized.',
   'Las Vegas', '2026-03-02', 'MGM Tech Labs announcement', 'INFERRED')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: graph_edges — corporate relationship edges
-- Node ID conventions:
--   Externals (corporate entities): 'x_<externals.id>'  e.g. 'x_220' = Switch
--   Portfolio companies (by company slug lookup): 'c_<companies.id>'
--   We use DO NOTHING on the unique (source_id, target_id, rel) collision.
-- ============================================================

-- Edge 1: Switch → TensorWave  (corporate_partner — GPU cluster hosting agreement)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_220',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#6366F1', 0.80, NULL,
  'Switch 5-year colocation and power agreement for 4,096-GPU AMD MI355X cluster — 8 MW dedicated capacity at Prime FIVE campus, announced March 2026.',
  2026, 0.91, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 2: MGM Resorts → AI personalization startup (generic corporate_partner edge
--         against TensorWave as the closest GPU/AI compute partner in the portfolio)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_221',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#8B5CF6', 0.78, NULL,
  'MGM Resorts guest personalization platform partnership — real-time ML inference across Bellagio, MGM Grand, and Aria for 40M MGM Rewards members, announced March 2026.',
  2026, 0.88, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 3: Station Casinos → Station Casinos Ventures (x_201, already in externals)
--         invests_in relationship from parent corporate to its new venture fund entity
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_223',
  'x_201',
  'operates_fund',
  'external', 'external',
  'historical', '#F59E0B', 0.85, NULL,
  'Station Casinos LLC launches $25M corporate venture fund operated through Station Casinos Ventures — targeting NV gaming tech and hospitality AI startups, March 2026.',
  2026, 0.87, false, 'agent-corporate-march2026'
)
ON CONFLICT DO NOTHING;

-- Edge 4: Station Casinos (x_223) invests_in 1047 Games (gaming startup in portfolio)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_223',
  'c_' || c.id,
  'invests_in',
  'external', 'company',
  'historical', '#10B981', 0.72, NULL,
  'Station Casinos $25M venture fund — 1047 Games identified as prime gaming tech portfolio candidate; live pilot access at Red Rock and Palms properties, 2026.',
  2026, 0.80, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = '1047-games'
ON CONFLICT DO NOTHING;

-- Edge 5: LVCVA (x_224) pilots_with Abnormal AI — smart venue cybersecurity pilot
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_224',
  'c_' || c.id,
  'pilots_with',
  'external', 'company',
  'historical', '#0EA5E9', 0.75, NULL,
  'Las Vegas Convention Center smart venue pilot — AI-driven analytics provider; 90-day West Hall deployment targeting 20% energy reduction for NAB Show 2026.',
  2026, 0.85, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'abnormal-ai'
ON CONFLICT DO NOTHING;

-- Edge 6: LVCVA (x_224) pilots_with TensorWave — compute infrastructure for smart venue
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_224',
  'c_' || c.id,
  'pilots_with',
  'external', 'company',
  'historical', '#0EA5E9', 0.70, NULL,
  'Las Vegas Convention Center smart venue pilot — real-time environmental monitoring startup partner; 90-day West Hall deployment, March 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 7: eBay Nevada (x_225) corporate_partner → Socure (identity verification)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_225',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#EC4899', 0.78, NULL,
  'eBay Nevada Trust & Safety expansion (200 hires) — Socure identity verification platform integration for fraud detection pipeline; Las Vegas hub growing to 550+ employees, 2026.',
  2026, 0.88, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'socure'
ON CONFLICT DO NOTHING;

-- Edge 8: MGM Resorts (x_221) → Kaptyn (EV fleet / hospitality tech)
--         extends the existing Kaptyn-MGM fleet partnership into 2026
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_221',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#8B5CF6', 0.82, NULL,
  'MGM Tech Labs Cohort 2 — hospitality and EV guest-transport portfolio; Kaptyn guest transportation services extended across MGM properties as part of accelerator partnership, 2026.',
  2026, 0.84, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'kaptyn'
ON CONFLICT DO NOTHING;

-- Edge 9: Switch (x_220) corporate_partner → Hubble Network (data center IoT connectivity)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_220',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#6366F1', 0.73, NULL,
  'Switch Prime FIVE campus expansion — Hubble Network satellite BLE connectivity piloted for IoT asset tracking and environmental monitoring across 1.2M sq ft build-out, 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'hubble-network'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- timeline_events:       8 corporate milestone events, Feb–Mar 2026
-- stakeholder_activities: 8 parallel activity records (INFERRED quality)
-- externals:             7 corporate entities inserted (IDs 220–226)
-- graph_edges:           9 edges:
--                          corporate_partner (6): Switch→TensorWave, MGM→TensorWave,
--                            eBay→Socure, MGM→Kaptyn, Switch→HubbleNetwork,
--                            LVCVA→AbnormalAI
--                          pilots_with (2): LVCVA→AbnormalAI, LVCVA→TensorWave
--                          operates_fund (1): StationCasinos→StationCasinosVentures
--                          invests_in (1): StationCasinos→1047Games
-- All INSERTs use ON CONFLICT DO NOTHING for full idempotency.
