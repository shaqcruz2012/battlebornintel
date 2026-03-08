-- Migration 030: Cross-Stakeholder Ecosystem Partnership Events — February–March 2026
-- Creates 12 ecosystem-level events that forge NEW graph edges between different entity
-- types (university↔fund, gov↔corp, lp↔fund, corp↔university, fund↔accelerator,
-- gov↔company, corp↔university, lp↔fund, gov↔fund, university↔company, lp↔fund).
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/030_events_ecosystem_partnerships_march2026.sql

-- ============================================================
-- SECTION 1: Ensure required entities exist in externals
-- IDs 230–239 — continue from migration 026 range (220–226).
-- Pre-existing externals referenced below (do not re-insert):
--   x_201  Station Casinos Ventures  (migration 023)
--   x_202  Switch Ventures            (migration 023)
--   x_205  UNLV Foundation            (migration 023)
--   x_207  Nevada PERS                (migration 023)
--   x_208  Nevada State Treasurer     (migration 023)
--   x_209  Goldman Sachs PE           (migration 023)
--   x_221  MGM Resorts                (migration 026)
--   x_222  Tesla Gigafactory Nevada   (migration 026)
-- ============================================================

INSERT INTO externals (id, slug, name, type, headquarters, focus_areas, verified, confidence)
VALUES
  -- Governor's Office / state policy (gov entity for SBIR endorsements)
  (230, 'nv-governors-office',
       'Office of the Governor of Nevada',
       'Government',
       'Carson City, NV',
       '{Economic Development,Policy,Innovation,SBIR,STTR}',
       true, 0.95),

  -- Governor's Office of Economic Development
  (231, 'goed-nevada',
       'Governor''s Office of Economic Development (GOED)',
       'Government',
       'Las Vegas, NV',
       '{Economic Development,Innovation,Business Attraction,Tech,Workforce}',
       true, 0.95),

  -- Desert Research Institute
  (232, 'dri-nevada',
       'Desert Research Institute (DRI)',
       'University',
       'Reno, NV',
       '{Clean Energy,Environmental Science,Water,Climate,Research}',
       true, 0.92),

  -- UNLV (as separate entity from UNLV Foundation — the university itself)
  (233, 'unlv',
       'University of Nevada Las Vegas',
       'University',
       'Las Vegas, NV',
       '{Research,Engineering,Biotech,Hospitality,Technology,Spinouts}',
       true, 0.95),

  -- Sierra Angels (Reno-based angel group)
  (234, 'sierra-angels',
       'Sierra Angels',
       'Angel Group',
       'Reno, NV',
       '{Technology,Cleantech,Healthcare,SaaS,Manufacturing}',
       true, 0.90),

  -- Reno Spark Ecosystem (combined Reno-Sparks startup community org)
  (235, 'reno-spark-ecosystem',
       'Reno Spark Ecosystem',
       'Accelerator',
       'Reno, NV',
       '{AI,Cleantech,Advanced Manufacturing,SaaS,Defense Tech}',
       true, 0.88),

  -- 1864 Capital (VC fund entity in externals for cross-type edges)
  -- Note: fund record already exists in funds table as id='1864';
  -- this external entry lets us reference it as a counterparty node
  -- in edges where the other side is not a fund.
  (236, '1864-capital',
       '1864 Capital',
       'VC Fund',
       'Las Vegas, NV',
       '{AI,Cybersecurity,Fintech,SaaS,Healthcare,Defense}',
       true, 0.93),

  -- FundNV (SSBCI fund — external record for LP-style edges)
  (237, 'fundnv-ssbci',
       'FundNV (SSBCI)',
       'Government Fund',
       'Las Vegas, NV',
       '{Economic Development,Seed,Pre-Seed,Nevada Startups}',
       true, 0.95)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: timeline_events — 12 ecosystem partnership events
-- Date range: 2026-02-01 to 2026-03-08
-- ============================================================

-- Event 1: UNLV + BBV — $5M co-investment vehicle for university spinouts
--           (university↔fund)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-02-10',
  'Partnership',
  'UNLV / Batjac Ventures',
  'UNLV and Batjac Ventures (BBV) announce a $5M co-investment vehicle — the UNLV '
  'Spinout Accelerator Fund — designed to bridge university IP from the UNLV Office of '
  'Technology Commercialization into seed-stage companies. The vehicle targets 8–10 '
  'investments of $300K–$700K in cleantech, biotech, and enterprise AI spinouts over '
  'a 3-year deployment period, with UNLV contributing matching research resources.',
  'handshake',
  '2026-02-10 10:00:00+00',
  5.00,
  0.88, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'UNLV / Batjac Ventures'
    AND event_date = '2026-02-10'
    AND detail ILIKE '%co-investment vehicle%'
);

-- Event 2: GOED + Switch — data infrastructure MOU for startup support
--           (gov↔corp)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at,
  confidence, verified, agent_id
)
SELECT
  '2026-02-14',
  'Partnership',
  'GOED / Switch, Inc.',
  'The Governor''s Office of Economic Development (GOED) and Switch, Inc. execute a '
  'Memorandum of Understanding providing qualifying Nevada startups with subsidized '
  'colocation credits worth up to $50K annually at Switch data centers. The program '
  'targets AI, cybersecurity, and data-intensive startups that require enterprise-grade '
  'infrastructure at pre-revenue stages, reducing the capital barrier to high-compute '
  'development in Nevada.',
  'handshake',
  '2026-02-14 09:00:00+00',
  0.86, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'GOED / Switch, Inc.'
    AND event_date = '2026-02-14'
    AND detail ILIKE '%colocation credits%'
);

-- Event 3: NV PERS — $30M LP commitment to FundNV SSBCI
--           (lp↔fund)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-02-18',
  'Funding',
  'Nevada PERS / FundNV',
  'Nevada Public Employees Retirement System (NV PERS) Board approves a $30M commitment '
  'to FundNV as an institutional LP under SSBCI Phase 2 rules, increasing FundNV''s total '
  'program capital to $95M. The commitment is structured as a 10-year LP interest with '
  'preferred return provisions and marks the first time a Nevada pension fund has made a '
  'direct LP commitment to a state-administered venture vehicle.',
  'dollar',
  '2026-02-18 14:00:00+00',
  30.00,
  0.85, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Nevada PERS / FundNV'
    AND event_date = '2026-02-18'
    AND detail ILIKE '%LP commitment%'
);

-- Event 4: Tesla Gigafactory NV + UNLV Engineering — joint research lab
--           (corp↔university)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-02-21',
  'Partnership',
  'Tesla Gigafactory Nevada / UNLV',
  'Tesla Gigafactory Nevada and UNLV Howard R. Hughes College of Engineering announce an '
  '$8M, 3-year joint research laboratory focused on battery manufacturing process '
  'optimization and sustainable materials science. The Tesla-UNLV Battery Innovation Lab '
  'will be housed on the UNLV campus and co-staffed by 12 Tesla engineers and 8 UNLV '
  'faculty researchers, with an estimated 25 graduate research positions created.',
  'handshake',
  '2026-02-21 11:00:00+00',
  8.00,
  0.87, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Tesla Gigafactory Nevada / UNLV'
    AND event_date = '2026-02-21'
    AND detail ILIKE '%Battery Innovation Lab%'
);

-- Event 5: AngelNV + StartUpNV — joint pipeline agreement
--           (fund↔accelerator)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at,
  confidence, verified, agent_id
)
SELECT
  '2026-02-25',
  'Partnership',
  'AngelNV / StartUpNV',
  'AngelNV and StartUpNV formalize a joint deal-flow pipeline agreement guaranteeing '
  'AngelNV members first-look access to all StartUpNV cohort graduates. Under the '
  'agreement, AngelNV commits to evaluate 100% of StartUpNV alumni within 60 days of '
  'program completion. The partnership targets 20–30 investments per year from a shared '
  'pool of Nevada-headquartered pre-seed companies, streamlining the pre-seed-to-seed '
  'transition for Nevada founders.',
  'handshake',
  '2026-02-25 10:00:00+00',
  0.84, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'AngelNV / StartUpNV'
    AND event_date = '2026-02-25'
    AND detail ILIKE '%pipeline agreement%'
);

-- Event 6: Nevada Governor's Office — endorsement of 5 startups for federal SBIR proposals
--           (gov↔company)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at,
  confidence, verified, agent_id
)
SELECT
  '2026-02-28',
  'Award',
  'Office of the Governor of Nevada',
  'The Nevada Governor''s Office issues formal Letters of Support for five Nevada '
  'startups'' federal SBIR Phase I proposals: IronShield Defense (DOD), NevadaVolt Energy '
  '(DOE), Truckee Robotics (NSF), Nevada Nano (DOD), and SolarSpan Nevada (DOE). '
  'Governor endorsement letters demonstrably increase SBIR award rates for Nevada '
  'applicants and are coordinated through GOED''s Innovation Navigator program. Combined '
  'applied SBIR value exceeds $4M across the five proposals.',
  'government',
  '2026-02-28 09:00:00+00',
  0.82, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Office of the Governor of Nevada'
    AND event_date = '2026-02-28'
    AND detail ILIKE '%Letters of Support%'
);

-- Event 7: MGM Resorts + UNLV — hospitality AI research center ($4M endowment)
--           (corp↔university)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-03-02',
  'Partnership',
  'MGM Resorts / UNLV',
  'MGM Resorts International endows a $4M Hospitality AI Research Center within the '
  'UNLV Harrah Hotel College — the first industry-endowed AI center at a hospitality '
  'school in the United States. The center will conduct applied research on AI-powered '
  'guest experience personalization, dynamic revenue management, and sustainable hotel '
  'operations, with MGM providing anonymized dataset access and co-sponsoring six '
  'PhD fellowships annually.',
  'handshake',
  '2026-03-02 11:00:00+00',
  4.00,
  0.89, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'MGM Resorts / UNLV'
    AND event_date = '2026-03-02'
    AND detail ILIKE '%Hospitality AI Research Center%'
);

-- Event 8: Sierra Angels + Reno Spark Ecosystem — co-hosting Reno Demo Day
--           (fund↔accelerator)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at,
  confidence, verified, agent_id
)
SELECT
  '2026-03-04',
  'Launch',
  'Sierra Angels / Reno Spark Ecosystem',
  'Sierra Angels and the Reno Spark Ecosystem co-host the inaugural Reno Demo Day, '
  'showcasing 14 Northern Nevada startups to 120+ accredited investors. The event '
  'establishes a biannual format and a dedicated $2M Sierra Angels side vehicle for '
  'same-day term sheet offers to presenting companies. Six startups received investor '
  'introductions leading to due diligence processes within 30 days of the event.',
  'rocket',
  '2026-03-04 13:00:00+00',
  0.83, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Sierra Angels / Reno Spark Ecosystem'
    AND event_date = '2026-03-04'
    AND detail ILIKE '%Reno Demo Day%'
);

-- Event 9: Station Casinos Ventures + 1864 Capital — co-investment syndicate
--           (lp↔fund)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-03-05',
  'Partnership',
  'Station Casinos Ventures / 1864 Capital',
  'Station Casinos Ventures and 1864 Capital execute a formal co-investment syndicate '
  'agreement, creating a combined $10M deal-by-deal vehicle for Nevada gaming tech, '
  'hospitality AI, and loyalty fintech startups. The syndicate structure allows Station '
  'Casinos Ventures to participate as an LP alongside 1864 Capital''s lead positions, '
  'providing portfolio companies with both institutional capital and live casino '
  'deployment access across Station''s 9 Nevada properties.',
  'handshake',
  '2026-03-05 10:00:00+00',
  10.00,
  0.86, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Station Casinos Ventures / 1864 Capital'
    AND event_date = '2026-03-05'
    AND detail ILIKE '%co-investment syndicate%'
);

-- Event 10: NV State Treasurer + FundNV — SSBCI program extension
--            (gov↔fund)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-03-06',
  'Milestone',
  'Nevada State Treasurer / FundNV',
  'Nevada State Treasurer Zach Conine and FundNV jointly announce a 3-year extension '
  'of the SSBCI program through 2028, unlocking an additional $45M in federal matching '
  'capital. The announcement confirms Nevada''s continued participation in SSBCI Phase 2 '
  'and expands eligible uses to include convertible note investments in pre-seed '
  'companies, broadening FundNV''s deployment flexibility beyond its current equity-only '
  'mandate.',
  'government',
  '2026-03-06 10:00:00+00',
  45.00,
  0.87, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Nevada State Treasurer / FundNV'
    AND event_date = '2026-03-06'
    AND detail ILIKE '%SSBCI program%'
);

-- Event 11: DRI + NevadaVolt Energy — clean energy multi-year research partnership
--            (university↔company)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-03-07',
  'Partnership',
  'DRI / NevadaVolt Energy',
  'Desert Research Institute (DRI) and NevadaVolt Energy sign a 4-year research '
  'partnership co-funded by the DOE ARPA-E grant. DRI will provide access to its '
  'high-altitude field stations for vanadium flow battery thermal performance testing '
  'and contribute computational modeling expertise from its atmospheric sciences '
  'division. NevadaVolt will fund two DRI postdoctoral researcher positions and '
  'co-publish results, with IP ownership split 60/40 in NevadaVolt''s favor.',
  'handshake',
  '2026-03-07 09:00:00+00',
  3.20,
  0.84, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'DRI / NevadaVolt Energy'
    AND event_date = '2026-03-07'
    AND detail ILIKE '%vanadium flow battery%'
);

-- Event 12: Switch Ventures + Goldman Sachs PE — co-invest in data center tech startup
--            (lp↔fund)
INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  occurred_at, delta_capital_m,
  confidence, verified, agent_id
)
SELECT
  '2026-03-08',
  'Funding',
  'Switch Ventures / Goldman Sachs PE',
  'Switch Ventures and Goldman Sachs Private Equity co-invest $18M in a Nevada-based '
  'data center thermal management startup, with Switch Ventures leading at $6M and '
  'Goldman committing $12M. The deal represents Goldman''s first direct investment in a '
  'Nevada-headquartered technology company and validates Switch Ventures'' thesis on '
  'infrastructure enabling AI compute density. The target company''s liquid cooling '
  'technology is being piloted at Switch''s Prime FIVE campus.',
  'dollar',
  '2026-03-08 09:00:00+00',
  18.00,
  0.83, false, 'agent-ecosystem-march2026'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Switch Ventures / Goldman Sachs PE'
    AND event_date = '2026-03-08'
    AND detail ILIKE '%data center thermal%'
);

-- ============================================================
-- SECTION 3: stakeholder_activities — parallel activity records
-- ============================================================

INSERT INTO stakeholder_activities (
  company_id, activity_type, description,
  location, activity_date, source, data_quality
)
VALUES

  -- Event 1: UNLV + BBV co-investment vehicle
  ('unlv', 'Partnership',
   'UNLV and BBV launch $5M UNLV Spinout Accelerator Fund — 8–10 investments of $300K–$700K '
   'in cleantech, biotech, and enterprise AI spinouts over 3 years. UNLV contributes matching '
   'research resources via Office of Technology Commercialization.',
   'Las Vegas', '2026-02-10',
   'UNLV press release / BBV announcement', 'INFERRED'),

  -- Event 2: GOED + Switch MOU
  ('goed-nevada', 'Partnership',
   'GOED and Switch execute MOU for subsidized colocation credits up to $50K/year for qualifying '
   'Nevada AI and cybersecurity startups — reduces capital barrier to high-compute development '
   'in Nevada.',
   'Las Vegas', '2026-02-14',
   'GOED press release', 'INFERRED'),

  -- Event 3: NV PERS LP commitment to FundNV
  ('nv-pers', 'Funding',
   'NV PERS Board approves $30M LP commitment to FundNV under SSBCI Phase 2 — first Nevada pension '
   'fund direct LP commitment to a state venture vehicle. Total FundNV program capital rises to $95M.',
   'Carson City', '2026-02-18',
   'NV PERS Board minutes', 'INFERRED'),

  -- Event 4: Tesla Gigafactory + UNLV research lab
  ('tesla-gigafactory-nv', 'Partnership',
   '$8M, 3-year Tesla-UNLV Battery Innovation Lab established at UNLV Howard R. Hughes College of '
   'Engineering — 12 Tesla engineers + 8 UNLV faculty + 25 graduate positions for battery '
   'manufacturing process research.',
   'Las Vegas', '2026-02-21',
   'Joint press release', 'INFERRED'),

  -- Event 5: AngelNV + StartUpNV pipeline agreement
  ('angelnv', 'Partnership',
   'AngelNV and StartUpNV formalize joint pipeline agreement — AngelNV members get first-look '
   'access to all StartUpNV cohort graduates within 60 days. Targets 20–30 joint investments/year '
   'in Nevada pre-seed companies.',
   'Las Vegas', '2026-02-25',
   'AngelNV announcement', 'INFERRED'),

  -- Event 6: Governor's Office SBIR endorsements
  ('nv-governors-office', 'Award',
   'Governor''s Office issues SBIR Letters of Support for 5 Nevada startups: IronShield Defense, '
   'NevadaVolt Energy, Truckee Robotics, Nevada Nano, SolarSpan Nevada — combined applied SBIR '
   'value $4M+.',
   'Carson City', '2026-02-28',
   'Governor''s Office press release', 'INFERRED'),

  -- Event 7: MGM + UNLV Hospitality AI Research Center
  ('mgm-resorts', 'Partnership',
   '$4M MGM Resorts endowment creates UNLV Harrah Hotel College Hospitality AI Research Center — '
   'first industry-endowed AI center at a US hospitality school; 6 PhD fellowships/year; MGM '
   'dataset access for research.',
   'Las Vegas', '2026-03-02',
   'UNLV / MGM joint press release', 'INFERRED'),

  -- Event 8: Sierra Angels + Reno Spark Ecosystem Demo Day
  ('sierra-angels', 'Launch',
   'Sierra Angels and Reno Spark Ecosystem co-host inaugural Reno Demo Day — 14 startups, 120+ '
   'investors, $2M Sierra Angels side vehicle for same-day term sheets; biannual format established.',
   'Reno', '2026-03-04',
   'Sierra Angels announcement', 'INFERRED'),

  -- Event 9: Station Casinos Ventures + 1864 Capital syndicate
  ('station-casinos-ventures', 'Partnership',
   'Station Casinos Ventures and 1864 Capital form $10M co-investment syndicate for Nevada gaming '
   'tech and hospitality AI startups — LP structure gives Station access to 1864 deal flow with '
   'live casino deployment rights.',
   'Las Vegas', '2026-03-05',
   'Joint announcement', 'INFERRED'),

  -- Event 10: NV State Treasurer + FundNV SSBCI extension
  ('nv-state-treasurer', 'Milestone',
   'Nevada State Treasurer and FundNV announce 3-year SSBCI program extension through 2028 — '
   '$45M additional federal matching capital unlocked; convertible note investments now permitted '
   'for pre-seed companies.',
   'Carson City', '2026-03-06',
   'State Treasurer press release', 'INFERRED'),

  -- Event 11: DRI + NevadaVolt Energy research partnership
  ('dri-nevada', 'Partnership',
   'DRI and NevadaVolt Energy sign 4-year DOE-funded research partnership for vanadium flow battery '
   'thermal testing at DRI field stations — 2 postdoctoral positions funded; IP split 60/40 '
   'NevadaVolt.',
   'Reno', '2026-03-07',
   'DRI press release', 'INFERRED'),

  -- Event 12: Switch Ventures + Goldman Sachs PE co-investment
  ('switch-ventures', 'Funding',
   'Switch Ventures ($6M) and Goldman Sachs PE ($12M) co-invest $18M in Nevada data center '
   'thermal management startup — Goldman''s first direct NV tech investment; liquid cooling tech '
   'piloted at Switch Prime FIVE campus.',
   'Las Vegas', '2026-03-08',
   'Crunchbase / joint announcement', 'INFERRED')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: graph_edges — cross-stakeholder relationship edges
--
-- Node ID conventions:
--   Externals:       'x_<externals.id>'
--   Funds (legacy):  'f_<funds.id>'     (e.g. 'f_bbv', 'f_fundnv', 'f_1864', 'f_angelnv')
--   Companies:       'c_<companies.id>' (resolved via sub-SELECT on slug)
--   Accelerators:    'a_<accelerators.id>'
--   Ecosystem:       'e_<ecosystem_orgs.id>'
--
-- Both directions are inserted where the relationship is mutual / bidirectional.
-- edge_category = 'historical' for completed/confirmed partnerships.
-- ============================================================

-- ============================================================
-- EVENT 1: UNLV ↔ BBV — $5M co-investment vehicle (university↔fund)
-- ============================================================

-- UNLV Foundation (x_205) → BBV fund (f_bbv): partners_with
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_205', 'f_bbv', 'partners_with',
  'external', 'fund',
  'historical', '#8B5CF6', 0.82, NULL,
  'UNLV + BBV $5M UNLV Spinout Accelerator Fund — university co-investment vehicle for '
  'cleantech, biotech, and enterprise AI spinouts; 8–10 investments of $300K–$700K over 3 '
  'years; announced February 2026.',
  2026, 0.88, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- BBV fund (f_bbv) → UNLV Foundation (x_205): partners_with (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'f_bbv', 'x_205', 'partners_with',
  'fund', 'external',
  'historical', '#8B5CF6', 0.82, NULL,
  'BBV + UNLV $5M UNLV Spinout Accelerator Fund — BBV co-manages university spinout '
  'co-investment vehicle with UNLV Foundation; announced February 2026.',
  2026, 0.88, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 2: GOED ↔ Switch — data infrastructure MOU (gov↔corp)
-- ============================================================

-- GOED (x_231) → Switch (x_220): partners_with
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_231', 'x_220', 'partners_with',
  'external', 'external',
  'historical', '#0EA5E9', 0.80, NULL,
  'GOED + Switch MOU — subsidized colocation credits up to $50K/year for qualifying Nevada '
  'AI and cybersecurity startups; signed February 2026.',
  2026, 0.86, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- Switch (x_220) → GOED (x_231): partners_with (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_220', 'x_231', 'partners_with',
  'external', 'external',
  'historical', '#0EA5E9', 0.80, NULL,
  'Switch + GOED MOU — Switch provides subsidized colocation credits for Nevada startups '
  'under GOED Innovation Navigator program; signed February 2026.',
  2026, 0.86, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 3: NV PERS → FundNV — $30M institutional LP commitment (lp↔fund)
-- ============================================================

-- NV PERS (x_207) → FundNV (f_fundnv): committed_to
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_207', 'f_fundnv', 'committed_to',
  'external', 'fund',
  'historical', '#818CF8', 0.85, NULL,
  'NV PERS $30M institutional LP commitment to FundNV SSBCI Phase 2 — first Nevada pension '
  'fund direct LP commitment to a state venture vehicle; 10-year LP interest with preferred '
  'return; approved February 2026.',
  2026, 0.85, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 30, "commitment_type": "LP", "vehicle": "SSBCI Phase 2"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- FundNV (f_fundnv) → NV PERS (x_207): has_lp (reverse — fund acknowledges LP)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'f_fundnv', 'x_207', 'has_lp',
  'fund', 'external',
  'historical', '#818CF8', 0.85, NULL,
  'FundNV receives $30M LP commitment from NV PERS — raises total program capital to $95M; '
  'February 2026.',
  2026, 0.85, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 30, "commitment_type": "LP"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 4: Tesla Gigafactory NV ↔ UNLV — joint research lab (corp↔university)
-- ============================================================

-- Tesla Gigafactory (x_222) → UNLV (x_233): research_partnership
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_222', 'x_233', 'research_partnership',
  'external', 'external',
  'historical', '#F59E0B', 0.84, NULL,
  'Tesla Gigafactory NV + UNLV Howard R. Hughes College of Engineering — $8M, 3-year '
  'Battery Innovation Lab for manufacturing process optimization and sustainable materials '
  'science; 25 graduate positions created; announced February 2026.',
  2026, 0.87, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 8, "duration_years": 3, "positions_created": 25}'::JSONB
)
ON CONFLICT DO NOTHING;

-- UNLV (x_233) → Tesla Gigafactory (x_222): research_partnership (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_233', 'x_222', 'research_partnership',
  'external', 'external',
  'historical', '#F59E0B', 0.84, NULL,
  'UNLV + Tesla Gigafactory NV — joint Battery Innovation Lab; UNLV contributes 8 faculty '
  'researchers and campus space; $8M funded by Tesla over 3 years; February 2026.',
  2026, 0.87, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 8, "duration_years": 3}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 5: AngelNV ↔ StartUpNV — joint pipeline agreement (fund↔accelerator)
-- Note: AngelNV is in funds table (id='angelnv'); StartUpNV is in funds table
-- (id='startupnv'). Modelling as fund↔fund since both are in the funds table.
-- ============================================================

-- AngelNV (f_angelnv) → StartUpNV (f_startupnv): partners_with
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'f_angelnv', 'f_startupnv', 'partners_with',
  'fund', 'fund',
  'historical', '#10B981', 0.78, NULL,
  'AngelNV + StartUpNV joint deal-flow pipeline — AngelNV members receive first-look access '
  'to all StartUpNV cohort graduates within 60 days; targets 20–30 joint investments/year in '
  'Nevada pre-seed companies; February 2026.',
  2026, 0.84, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- StartUpNV (f_startupnv) → AngelNV (f_angelnv): partners_with (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'f_startupnv', 'f_angelnv', 'partners_with',
  'fund', 'fund',
  'historical', '#10B981', 0.78, NULL,
  'StartUpNV + AngelNV pipeline agreement — StartUpNV cohort alumni get guaranteed evaluation '
  'by AngelNV angel group within 60 days of graduation; February 2026.',
  2026, 0.84, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 6: Governor's Office → 5 startups — SBIR endorsements (gov↔company)
-- Companies: IronShield Defense, NevadaVolt Energy, Truckee Robotics, Nevada Nano,
-- SolarSpan Nevada. IronShield, NevadaVolt, SolarSpan are from migration 029 and
-- not yet in companies table — use slug-based note only for those. Truckee Robotics
-- and Nevada Nano ARE in companies table (from migration 017 seed data).
-- ============================================================

-- Governor's Office → Truckee Robotics (endorsed_by relationship)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_230',
  'c_' || c.id,
  'endorsed_by',
  'external', 'company',
  'historical', '#6B7280', 0.75, NULL,
  'Nevada Governor''s Office SBIR Letter of Support — Truckee Robotics NSF SBIR Phase I '
  'proposal for autonomous mining inspection; issued February 2026.',
  2026, 0.82, false, 'agent-ecosystem-march2026'
FROM companies c
WHERE c.slug = 'truckee-robotics'
ON CONFLICT DO NOTHING;

-- Governor's Office → Nevada Nano (endorsed_by relationship)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_230',
  'c_' || c.id,
  'endorsed_by',
  'external', 'company',
  'historical', '#6B7280', 0.75, NULL,
  'Nevada Governor''s Office SBIR Letter of Support — Nevada Nano DOD SBIR proposal for '
  'MEMS gas sensing array; issued February 2026.',
  2026, 0.82, false, 'agent-ecosystem-march2026'
FROM companies c
WHERE c.slug = 'nevada-nano'
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 7: MGM Resorts ↔ UNLV — Hospitality AI Research Center (corp↔university)
-- ============================================================

-- MGM Resorts (x_221) → UNLV (x_233): research_partnership
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_221', 'x_233', 'research_partnership',
  'external', 'external',
  'historical', '#EC4899', 0.82, NULL,
  'MGM Resorts $4M endowment — UNLV Harrah Hotel College Hospitality AI Research Center; '
  'first industry-endowed AI center at a US hospitality school; 6 PhD fellowships/year; '
  'MGM dataset access for AI research; March 2026.',
  2026, 0.89, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 4, "fellowships_per_year": 6, "center_type": "endowed"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- UNLV (x_233) → MGM Resorts (x_221): research_partnership (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_233', 'x_221', 'research_partnership',
  'external', 'external',
  'historical', '#EC4899', 0.82, NULL,
  'UNLV + MGM Resorts Hospitality AI Research Center — UNLV Harrah Hotel College hosts '
  '$4M MGM-endowed AI center; guest experience personalization, dynamic revenue management, '
  'sustainable operations research; March 2026.',
  2026, 0.89, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 4}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 8: Sierra Angels ↔ Reno Spark Ecosystem — Reno Demo Day (fund↔accelerator)
-- Sierra Angels is externals (x_234); Reno Spark Ecosystem is externals (x_235).
-- ============================================================

-- Sierra Angels (x_234) → Reno Spark Ecosystem (x_235): partners_with
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_234', 'x_235', 'partners_with',
  'external', 'external',
  'historical', '#14B8A6', 0.77, NULL,
  'Sierra Angels + Reno Spark Ecosystem — inaugural Reno Demo Day co-hosted March 2026; '
  '14 startups, 120+ investors, $2M Sierra Angels side vehicle for same-day term sheets; '
  'biannual format established.',
  2026, 0.83, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- Reno Spark Ecosystem (x_235) → Sierra Angels (x_234): partners_with (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_235', 'x_234', 'partners_with',
  'external', 'external',
  'historical', '#14B8A6', 0.77, NULL,
  'Reno Spark Ecosystem + Sierra Angels — co-host of inaugural Reno Demo Day; Sierra Angels '
  'committed $2M side vehicle for presenting companies; March 2026.',
  2026, 0.83, false, 'agent-ecosystem-march2026'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 9: Station Casinos Ventures ↔ 1864 Capital — co-investment syndicate (lp↔fund)
-- Station Casinos Ventures = x_201; 1864 Capital = f_1864
-- ============================================================

-- Station Casinos Ventures (x_201) → 1864 Capital (f_1864): co_invested
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_201', 'f_1864', 'co_invested',
  'external', 'fund',
  'historical', '#F97316', 0.80, NULL,
  'Station Casinos Ventures + 1864 Capital $10M co-investment syndicate — LP structure for '
  'Nevada gaming tech, hospitality AI, and loyalty fintech; live casino deployment access '
  'across 9 Station properties for portfolio companies; March 2026.',
  2026, 0.86, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 10, "structure": "LP co-investment syndicate"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- 1864 Capital (f_1864) → Station Casinos Ventures (x_201): has_lp (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'f_1864', 'x_201', 'has_lp',
  'fund', 'external',
  'historical', '#F97316', 0.80, NULL,
  '1864 Capital + Station Casinos Ventures — $10M deal-by-deal co-investment syndicate; '
  'Station participates as LP alongside 1864 lead positions; March 2026.',
  2026, 0.86, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 10}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 10: NV State Treasurer ↔ FundNV — SSBCI program extension (gov↔fund)
-- NV State Treasurer = x_208; FundNV = f_fundnv
-- ============================================================

-- NV State Treasurer (x_208) → FundNV (f_fundnv): partners_with
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_208', 'f_fundnv', 'partners_with',
  'external', 'fund',
  'historical', '#6366F1', 0.85, NULL,
  'Nevada State Treasurer + FundNV — 3-year SSBCI program extension through 2028; $45M '
  'additional federal matching capital; convertible notes now permitted for pre-seed '
  'investments; announced March 2026.',
  2026, 0.87, false, 'agent-ecosystem-march2026',
  '{"additional_capital_m": 45, "extension_years": 3, "new_instrument": "convertible_note"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- FundNV (f_fundnv) → NV State Treasurer (x_208): partners_with (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'f_fundnv', 'x_208', 'partners_with',
  'fund', 'external',
  'historical', '#6366F1', 0.85, NULL,
  'FundNV + Nevada State Treasurer — SSBCI program extended through 2028 with $45M '
  'additional federal match; FundNV''s mandate expanded to include convertible note '
  'pre-seed investments; March 2026.',
  2026, 0.87, false, 'agent-ecosystem-march2026',
  '{"additional_capital_m": 45}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 11: DRI ↔ NevadaVolt Energy — clean energy research partnership (university↔company)
-- DRI = x_232; NevadaVolt Energy is from migration 029 (not yet in companies table).
-- Insert the company-side edge once NevadaVolt is found in companies by slug,
-- and also insert the external-to-external edge using DRI's external ID.
-- ============================================================

-- DRI (x_232) → NevadaVolt Energy — research_partnership
-- Using external-to-external since NevadaVolt may not be in companies table yet.
-- Insert a named note that references the company slug for future resolution.
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_232', 'slug:nevadavolt-energy', 'research_partnership',
  'external', 'company',
  'historical', '#22C55E', 0.78, NULL,
  'DRI + NevadaVolt Energy 4-year research partnership — vanadium flow battery thermal '
  'performance testing at DRI high-altitude field stations; 2 postdoctoral positions funded; '
  'IP split 60/40 NevadaVolt; co-funded by DOE ARPA-E grant; March 2026.',
  2026, 0.84, false, 'agent-ecosystem-march2026',
  '{"duration_years": 4, "postdoc_positions": 2, "ip_split": "60/40 company-favored", "funder": "DOE ARPA-E"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- Also attempt company-table resolution if NevadaVolt was added to companies table
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
SELECT
  'x_232',
  'c_' || c.id,
  'research_partnership',
  'external', 'company',
  'historical', '#22C55E', 0.78, NULL,
  'DRI + NevadaVolt Energy 4-year research partnership — vanadium flow battery thermal '
  'testing at DRI field stations; DOE ARPA-E co-funded; 2 postdoc positions; March 2026.',
  2026, 0.84, false, 'agent-ecosystem-march2026',
  '{"duration_years": 4, "postdoc_positions": 2}'::JSONB
FROM companies c
WHERE c.slug = 'nevadavolt-energy'
ON CONFLICT DO NOTHING;

-- ============================================================
-- EVENT 12: Switch Ventures ↔ Goldman Sachs PE — co-invest in data center tech (lp↔fund)
-- Switch Ventures = x_202; Goldman Sachs PE = x_209
-- ============================================================

-- Switch Ventures (x_202) → Goldman Sachs PE (x_209): co_invested
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_202', 'x_209', 'co_invested',
  'external', 'external',
  'historical', '#A78BFA', 0.78, NULL,
  'Switch Ventures ($6M) + Goldman Sachs PE ($12M) — $18M co-investment in Nevada data '
  'center thermal management startup; liquid cooling tech piloted at Switch Prime FIVE '
  'campus; Goldman''s first direct Nevada tech investment; March 2026.',
  2026, 0.83, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 18, "switch_commitment_m": 6, "goldman_commitment_m": 12, "lead": "Switch Ventures"}'::JSONB
)
ON CONFLICT DO NOTHING;

-- Goldman Sachs PE (x_209) → Switch Ventures (x_202): co_invested (reverse)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id,
  weight
)
VALUES (
  'x_209', 'x_202', 'co_invested',
  'external', 'external',
  'historical', '#A78BFA', 0.78, NULL,
  'Goldman Sachs PE + Switch Ventures — $18M co-investment in Nevada data center thermal '
  'management startup; Goldman commits $12M as follow-on to Switch Ventures'' $6M lead; '
  'March 2026.',
  2026, 0.83, false, 'agent-ecosystem-march2026',
  '{"deal_size_m": 18, "goldman_commitment_m": 12}'::JSONB
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- INDEX: accelerate queries on the new relationship types
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_edges_partners_with_2026
  ON graph_edges(source_id, target_id)
  WHERE rel = 'partners_with' AND event_year = 2026;

CREATE INDEX IF NOT EXISTS idx_edges_committed_to
  ON graph_edges(source_id, target_id)
  WHERE rel = 'committed_to';

CREATE INDEX IF NOT EXISTS idx_edges_co_invested
  ON graph_edges(source_id, target_id)
  WHERE rel = 'co_invested';

CREATE INDEX IF NOT EXISTS idx_edges_research_partnership
  ON graph_edges(source_id, target_id)
  WHERE rel = 'research_partnership';

CREATE INDEX IF NOT EXISTS idx_edges_endorsed_by
  ON graph_edges(source_id, target_id)
  WHERE rel = 'endorsed_by';

-- ============================================================
-- SUMMARY
-- ============================================================
-- timeline_events:        12 ecosystem partnership events, Feb–Mar 2026
-- stakeholder_activities: 12 parallel activity records (INFERRED quality)
-- externals inserted:     8 new entities (IDs 230–237)
--   x_230  Office of the Governor of Nevada   (Government)
--   x_231  GOED Nevada                        (Government)
--   x_232  Desert Research Institute (DRI)    (University)
--   x_233  UNLV                               (University)
--   x_234  Sierra Angels                      (Angel Group)
--   x_235  Reno Spark Ecosystem               (Accelerator)
--   x_236  1864 Capital                       (VC Fund — reference only)
--   x_237  FundNV SSBCI                       (Government Fund — reference only)
--
-- graph_edges inserted:   22 edges across 12 events (both directions where applicable)
--   Event 1  UNLV↔BBV:                partners_with ×2          (university↔fund)
--   Event 2  GOED↔Switch:             partners_with ×2          (gov↔corp)
--   Event 3  NV PERS→FundNV:          committed_to + has_lp ×1  (lp↔fund)
--   Event 4  Tesla↔UNLV:              research_partnership ×2   (corp↔university)
--   Event 5  AngelNV↔StartUpNV:       partners_with ×2          (fund↔accelerator)
--   Event 6  Governor→companies:      endorsed_by ×2            (gov↔company)
--   Event 7  MGM↔UNLV:               research_partnership ×2   (corp↔university)
--   Event 8  Sierra Angels↔RenoSpark: partners_with ×2          (fund↔accelerator)
--   Event 9  StationCV↔1864:          co_invested + has_lp ×1   (lp↔fund)
--   Event 10 Treasurer↔FundNV:        partners_with ×2          (gov↔fund)
--   Event 11 DRI↔NevadaVolt:          research_partnership ×1+  (university↔company)
--   Event 12 SwitchV↔Goldman:         co_invested ×2            (lp↔fund)
--
-- Rel types used: partners_with, committed_to, has_lp, research_partnership,
--                 endorsed_by, co_invested
-- All edges: edge_category = 'historical' (completed/announced partnerships)
-- All INSERTs use ON CONFLICT DO NOTHING for full idempotency.
