-- Migration 043: Correct Desert Forge Ventures data with verified sources
-- Migration 041 contained fabricated figures. This migration replaces them with
-- verified data from primary sources.
--
-- SOURCES:
--   [1] UNLV Office of Economic Development — fund profile:
--       https://www.unlv.edu/econdev/desert-forge
--       "Fund Size: Targeted at $20m to $25m"
--   [2] Vegas Inc / Las Vegas Sun (Aug 4, 2025):
--       https://vegasinc.lasvegassun.com/news/2025/aug/04/...
--       ~$4M raised from private LPs; Jessup: "Once we get to about $10M...we'll close it out"
--   [3] Fox5 Vegas (May 16, 2025):
--       https://www.fox5vegas.com/2025/05/16/las-vegas-valley-venture-capital-company-brings-life-funding-local-start-ups/
--       GOED commitment: up to $10M (2 tranches of $5M, dollar-for-dollar match)
--   [4] Las Vegas Review-Journal (May 2025):
--       https://www.reviewjournal.com/business/new-venture-fund-launched-by-former-unlv-president-3369509/
--       Check size: $100K–$1M, pre-seed to Series A Nevada deep tech
--   [5] PitchBook profile: 3 portfolio companies — WAVR Technologies, TensorWave, Vena Vitals

-- ============================================================
-- SECTION 1: Correct funds table — DFV
-- ============================================================
-- Migration 041 used fabricated values:
--   allocated_m = 85   (WRONG — target is $20M-$25M, raised ~$4M as of Aug 2025)
--   deployed_m  = 52   (WRONG — impossible given $4M raised; 3 investments at pre-seed)
--   check_size_min_m = 2.00   (WRONG — verified minimum is $50K-$100K)
--   check_size_max_m = 15.00  (WRONG — verified maximum is $500K-$1M)
--   vintage_year = 2020       (WRONG — fund launched May 2025)
--   target_sectors had wrong focus areas

UPDATE funds SET
  allocated_m        = 20.00,       -- $20M–$25M target for Fund I [source 1]
  deployed_m         = NULL,        -- exact deployed unknown; 3 investments at pre-seed scale [source 5]
  check_size_min_m   = 0.10,        -- $100K minimum [source 4]
  check_size_max_m   = 1.00,        -- $1M maximum [source 4]
  vintage_year       = 2025,        -- launched May 2025 [source 3]
  company_count      = 3,           -- WAVR Technologies, TensorWave, Vena Vitals [source 5]
  thesis             = 'Pre-seed to Series A venture capital for Nevada deep tech startups. '
                    || 'Focus areas: defense tech, cybersecurity, cleantech, and medical devices. '
                    || 'Check size $100K–$1M. Fund I target $20M–$25M with GOED dollar-for-dollar '
                    || 'match up to $10M. Led by former UNLV president Len Jessup.',
  target_sectors     = '{Defense Tech,Cybersecurity,Cleantech,Medical Devices,Deep Tech}',
  stage_focus        = '{pre_seed,seed,series_a}',
  confidence         = 0.92,        -- fund existence and structure verified via multiple primary sources
  verified           = TRUE,        -- verified via UNLV and press sources
  agent_id           = 'migration-043-correction'
WHERE id = 'dfv';

-- ============================================================
-- SECTION 2: Remove fabricated portfolio companies from migration 041
-- ============================================================
-- The six companies below were entirely invented by the agent in migration 041.
-- They have no real-world counterparts. Removing them.

DELETE FROM graph_edges
WHERE source_id = 'f_dfv'
  AND target_id IN ('c_ironveil', 'c_forgeai', 'c_neonshield',
                    'c_desertsentinel', 'c_vaultlink', 'c_strikepoint');

DELETE FROM companies
WHERE id IN (
  SELECT id FROM companies
  WHERE agent_id = 'migration-041'
    AND name IN (
      'IronVeil Systems',
      'ForgeAI Defense',
      'NeonShield Cyber',
      'DesertSentinel',
      'VaultLink Technologies',
      'StrikePoint Analytics'
    )
);

-- ============================================================
-- SECTION 3: Wire real portfolio companies (where they exist in DB)
-- ============================================================
-- TensorWave is in the BBI database (it was in the original 75 companies).
-- WAVR Technologies and Vena Vitals may not be — insert as external nodes
-- rather than full companies since we lack complete profile data.

-- Wire TensorWave to DFV if it exists as a company node
INSERT INTO graph_edges (
  source_id, target_id, rel,
  edge_category, edge_color, edge_opacity, edge_style,
  confidence, verified,
  source_name,
  agent_id, event_year, note
)
SELECT
  'f_dfv', 'c_' || c.id, 'invested_in',
  'historical', '#7C3AED', 0.80, NULL,
  0.90, TRUE,
  'StartupsUnion / BusinessWire — co-investment with Battle Born Venture',
  'migration-043-correction', 2025,
  'Desert Forge Ventures co-invested in TensorWave alongside Battle Born Venture and AMD Ventures'
FROM companies c
WHERE LOWER(c.name) LIKE '%tensorwave%'
ON CONFLICT DO NOTHING;

-- WAVR Technologies (UNLV spinout, cleantech water harvesting) — as external node
INSERT INTO externals (id, name, entity_type, city, region, description)
VALUES (
  'x_wavr-technologies',
  'WAVR Technologies',
  'startup',
  'Las Vegas',
  'las_vegas',
  'UNLV spinout. Atmospheric water harvesting at 10% humidity. '
  'Seed round led by Desert Forge Ventures + Battle Born Venture. '
  'NSF Futures Engine Southwest + WaterStart validated. Source: startupsunion.com'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO graph_edges (
  source_id, target_id, rel,
  edge_category, edge_color, edge_opacity,
  confidence, verified,
  source_name,
  agent_id, event_year, note
)
VALUES (
  'f_dfv', 'x_wavr-technologies', 'invested_in',
  'historical', '#7C3AED', 0.80,
  0.90, TRUE,
  'StartupsUnion (Aug 2025): https://startupsunion.com/wavr-technologies-raises-4m/',
  'migration-043-correction', 2025,
  'DFV led $4M seed round in WAVR Technologies alongside Battle Born Venture'
)
ON CONFLICT DO NOTHING;

-- Vena Vitals (medical monitoring devices, Las Vegas) — as external node
INSERT INTO externals (id, name, entity_type, city, region, description)
VALUES (
  'x_vena-vitals',
  'Vena Vitals',
  'startup',
  'Las Vegas',
  'las_vegas',
  'Medical monitoring devices startup. Nevada-based. DFV portfolio company. '
  'Source: PitchBook DFV profile (pitchbook.com/profiles/investor/773186-05)'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO graph_edges (
  source_id, target_id, rel,
  edge_category, edge_color, edge_opacity,
  confidence, verified,
  source_name,
  agent_id, event_year, note
)
VALUES (
  'f_dfv', 'x_vena-vitals', 'invested_in',
  'historical', '#7C3AED', 0.80,
  0.78, FALSE,
  'PitchBook — DFV investor profile lists Vena Vitals as portfolio company',
  'migration-043-correction', 2025,
  'DFV portfolio company; investment size and date not publicly confirmed'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: Update graph_funds node metadata
-- ============================================================
UPDATE graph_funds SET
  confidence = 0.92,
  verified   = TRUE,
  agent_id   = 'migration-043-correction'
WHERE id = 'dfv';

-- ============================================================
-- SECTION 5: Update stakeholder_activities to remove invented metrics
-- ============================================================
-- Migration 041 inserted 9 stakeholder_activities for DFV with fabricated
-- fund sizes, deployment figures, and portfolio details. Delete and re-insert
-- with only what is publicly verifiable.

DELETE FROM stakeholder_activities
WHERE company_id = 'desert-forge-ventures'
  AND description LIKE '%migration-041%'
   OR (company_id = 'desert-forge-ventures' AND activity_type IN ('Fund Close','Fund Launch'));

-- Re-insert verified events only
INSERT INTO stakeholder_activities (
  company_id, activity_type, activity_date, location,
  description, stakeholder_type
)
VALUES
  (
    'desert-forge-ventures', 'Launch', '2025-05-16', 'Las Vegas',
    'Desert Forge Ventures launched Fund I targeting $20M–$25M, led by former UNLV '
    'president Len Jessup. GOED committed up to $10M in dollar-for-dollar matching '
    'across two $5M tranches. Focus: Nevada deep tech startups at pre-seed to Series A. '
    'Source: Fox5 Las Vegas / LVRJ May 2025.',
    'risk_capital'
  ),
  (
    'desert-forge-ventures', 'Funding', '2025-08-04', 'Las Vegas',
    'Desert Forge Ventures reported ~$4M raised from private LPs toward its $20M–$25M '
    'Fund I target. Third portfolio investment (WAVR Technologies) completed. Portfolio: '
    'WAVR Technologies, TensorWave, Vena Vitals. '
    'Source: Vegas Inc / Las Vegas Sun Aug 2025.',
    'risk_capital'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 6: Verification queries
-- ============================================================
SELECT
  id, name, allocated_m, deployed_m,
  check_size_min_m, check_size_max_m,
  vintage_year, company_count,
  confidence, verified
FROM funds
WHERE id = 'dfv';

SELECT COUNT(*) AS dfv_edges_remaining,
       string_agg(target_id, ', ') AS targets
FROM graph_edges
WHERE source_id = 'f_dfv';

SELECT COUNT(*) AS fabricated_companies_removed
FROM companies
WHERE agent_id = 'migration-041'
  AND name IN ('IronVeil Systems','ForgeAI Defense','NeonShield Cyber',
               'DesertSentinel','VaultLink Technologies','StrikePoint Analytics');
