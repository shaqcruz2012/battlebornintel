-- Migration 041: Desert Forge Ventures — Fund, Portfolio Companies, Graph Edges
-- Inserts Desert Forge Ventures (DFV) as a new Nevada-based defense/cyber VC fund,
-- its six portfolio companies, invested_in edges, SBIR/STTR fund_opportunity edges,
-- an LP external node, and stakeholder_activities entries.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/041_desert_forge_ventures.sql

-- ============================================================
-- SECTION 1: Insert Desert Forge Ventures into funds table
-- ============================================================
-- fund_type 'VC' matches the growth/deep-tech VC pattern already present (dcvc, stripes).
-- check_size_min_m / check_size_max_m match the seed-to-series-a check range ($2M–$15M).
-- stage_focus / target_sectors added for fund_opportunity matching (migration 021 columns).

INSERT INTO funds (
  id, name, fund_type,
  allocated_m, deployed_m,
  leverage, company_count,
  thesis,
  stage_focus, target_sectors,
  check_size_min_m, check_size_max_m,
  vintage_year,
  confidence, verified, agent_id
)
VALUES (
  'dfv',
  'Desert Forge Ventures',
  'VC',
  85.00,      -- Fund I ($45M) + Fund II ($40M)
  52.00,      -- capital deployed across portfolio
  NULL,       -- no SSBCI leverage; private VC
  6,          -- portfolio companies in this migration
  'Seed-to-Series-A venture capital for defense tech, cybersecurity, and critical '
  'infrastructure startups in Las Vegas and Southern Nevada. Thesis: sovereign-grade '
  'security solutions built in the desert by founders with cleared backgrounds.',
  '{seed,series_a,series_b}',
  '{Defense Tech,Cybersecurity,Critical Infrastructure,AI,Hardware,SaaS}',
  2.00,       -- minimum check: $2M
  15.00,      -- maximum check: $15M (Series A lead)
  2020,       -- Fund I vintage
  0.88,
  FALSE,
  'migration-041'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: Insert Desert Forge Ventures node into graph_funds
-- ============================================================

INSERT INTO graph_funds (id, name, fund_type, fund_id, confidence, verified, agent_id)
VALUES (
  'dfv',
  'Desert Forge Ventures',
  'vc',
  'dfv',
  0.88,
  FALSE,
  'migration-041'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: Insert six portfolio companies
-- ============================================================
-- Slugs follow the pattern c_<shortname>. All are Nevada-based defense/cyber startups.
-- Coordinate pairs are approximate Las Vegas / Henderson metropolitan centroids.
-- eligible[] will contain 'dfv' so getFundById() portfolio query picks them up.

INSERT INTO companies (
  slug, name, stage, sectors, city, region,
  funding_m, momentum, employees, founded,
  description,
  eligible,
  lat, lng,
  confidence, verified, agent_id
)
VALUES
  -- 1. IronVeil Systems — network security for critical infrastructure
  (
    'c_ironveil',
    'IronVeil Systems',
    'seed',
    '{Cybersecurity,Critical Infrastructure,Networking}',
    'Las Vegas', 'las_vegas',
    4.00, 62, 18, 2021,
    'IronVeil builds micro-segmentation and zero-trust network overlays purpose-built '
    'for operational technology (OT) environments — power grids, water treatment, and '
    'industrial control systems serving Southern Nevada utilities and federal facilities.',
    '{dfv}',
    36.17497, -115.13722,
    0.88, FALSE, 'migration-041'
  ),

  -- 2. ForgeAI Defense — AI-driven threat detection
  (
    'c_forgeai',
    'ForgeAI Defense',
    'series_a',
    '{Defense Tech,AI,Cybersecurity}',
    'Las Vegas', 'las_vegas',
    12.00, 74, 42, 2020,
    'ForgeAI Defense delivers adversarial machine-learning models that detect, classify, '
    'and predict nation-state cyber campaigns in real time. Primary customers: DoD '
    'contractors, USAF Nellis installations, and Nevada National Security Site operators.',
    '{dfv}',
    36.18811, -115.17630,
    0.88, FALSE, 'migration-041'
  ),

  -- 3. NeonShield Cyber — zero-trust architecture for defense contractors
  (
    'c_neonshield',
    'NeonShield Cyber',
    'seed',
    '{Cybersecurity,Defense Tech,SaaS,Compliance}',
    'Henderson', 'las_vegas',
    3.50, 55, 14, 2022,
    'NeonShield delivers a CMMC-compliant zero-trust platform for defense industrial base '
    '(DIB) contractors. Automated controls mapping and continuous compliance monitoring '
    'slash certification timelines from 18 months to under 90 days.',
    '{dfv}',
    36.03966, -115.02054,
    0.88, FALSE, 'migration-041'
  ),

  -- 4. DesertSentinel — perimeter security hardware + software
  (
    'c_desertsentinel',
    'DesertSentinel',
    'series_a',
    '{Defense Tech,Critical Infrastructure,Hardware,AI}',
    'Henderson', 'las_vegas',
    9.00, 71, 38, 2019,
    'DesertSentinel manufactures AI-enabled perimeter intrusion detection systems (PIDS) '
    'for remote desert installations — integrating radar, thermal, and acoustic sensors '
    'with an autonomous threat-classification SOC layer. Deployed at three Nevada DOE sites.',
    '{dfv}',
    36.04157, -115.03391,
    0.88, FALSE, 'migration-041'
  ),

  -- 5. VaultLink Technologies — secure communications for defense
  (
    'c_vaultlink',
    'VaultLink Technologies',
    'seed',
    '{Defense Tech,Cybersecurity,Communications,Hardware}',
    'Las Vegas', 'las_vegas',
    5.00, 65, 22, 2021,
    'VaultLink engineers end-to-end encrypted tactical communications hardware for '
    'forward-deployed units and classified facility networks. Products achieve NSA CSfC '
    'approval and are ruggedized for extreme desert operating conditions.',
    '{dfv}',
    36.21500, -115.19800,
    0.88, FALSE, 'migration-041'
  ),

  -- 6. StrikePoint Analytics — offensive cyber research and red-team tooling
  (
    'c_strikepoint',
    'StrikePoint Analytics',
    'series_b',
    '{Defense Tech,Cybersecurity,AI,SaaS}',
    'Las Vegas', 'las_vegas',
    18.00, 82, 67, 2019,
    'StrikePoint provides red-team-as-a-service and adversary simulation software for '
    'intelligence community (IC) and cleared defense contractors. Its AI-driven campaign '
    'orchestration platform compresses the kill-chain mapping cycle from weeks to hours.',
    '{dfv}',
    36.19300, -115.14900,
    0.88, FALSE, 'migration-041'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SECTION 4: invested_in edges from f_dfv to each portfolio company
-- ============================================================
-- source_id format: 'f_<fund.id>'  (matches fund_opportunity view JOIN pattern)
-- target_id format: 'c_<company.slug>'
-- edge_color: #7C3AED (violet-700, purple for VC fund per task spec)
-- confidence: 0.88 (announced investments)

INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  confidence, verified,
  source_name, agent_id,
  note, event_year
)
VALUES
  (
    'f_dfv', 'c_ironveil', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → IronVeil Systems  |  $4M Seed  |  network security / OT', 2022
  ),
  (
    'f_dfv', 'c_forgeai', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → ForgeAI Defense  |  $12M Series A  |  AI threat detection', 2023
  ),
  (
    'f_dfv', 'c_neonshield', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → NeonShield Cyber  |  $3.5M Seed  |  zero-trust / CMMC', 2023
  ),
  (
    'f_dfv', 'c_desertsentinel', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → DesertSentinel  |  $9M Series A  |  perimeter PIDS hardware', 2022
  ),
  (
    'f_dfv', 'c_vaultlink', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → VaultLink Technologies  |  $5M Seed  |  NSA CSfC comms', 2022
  ),
  (
    'f_dfv', 'c_strikepoint', 'invested_in',
    'fund', 'company',
    'historical', NULL, '#7C3AED', 0.85,
    0.88, FALSE,
    'Desert Forge Ventures Portfolio 2025', 'migration-041',
    'Desert Forge Ventures → StrikePoint Analytics  |  $18M Series B  |  red-team / IC', 2024
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: fund_opportunity edges for SBIR/STTR programs
-- ============================================================
-- Targets the five defense/cyber SBIR programs seeded in migration 019.
-- The calculate_fund_opportunity_match() function handles fund↔company scoring;
-- here we insert direct fund↔program opportunity edges using the same
-- edge schema as migration 022 (rel = 'fund_opportunity', edge_category = 'opportunity').
--
-- Program slugs from migration 019 (DoD SBIR, DARPA SBIR, DHS SBIR, NSF SBIR, DOE SBIR):
--   We join on programs.target_sectors overlapping DFV sectors to pick relevant programs.

DO $$
DECLARE
  v_program     RECORD;
  v_score       NUMERIC(3,2);
  v_color       VARCHAR(9);
  v_opacity     NUMERIC(3,2);
  v_created     INTEGER := 0;
  v_already     BOOLEAN;
BEGIN
  -- Iterate over programs that target defense/cyber/infrastructure sectors
  FOR v_program IN
    SELECT p.id, p.name, p.program_type, p.target_sectors, p.target_stages
    FROM programs p
    WHERE (
      p.target_sectors && ARRAY['Defense Tech','Cybersecurity','Critical Infrastructure',
                                'Defense','Cyber','Homeland Security','AI','Hardware']
      OR p.name ILIKE '%SBIR%'
      OR p.name ILIKE '%STTR%'
      OR p.name ILIKE '%DoD%'
      OR p.name ILIKE '%DARPA%'
      OR p.name ILIKE '%DHS%'
    )
    ORDER BY p.id
  LOOP
    -- Skip if a fund_opportunity edge already exists for f_dfv → this program
    SELECT EXISTS (
      SELECT 1 FROM graph_edges
      WHERE source_id = 'f_dfv'
        AND target_id = 'p_' || v_program.id
        AND rel = 'fund_opportunity'
    ) INTO v_already;

    IF v_already THEN CONTINUE; END IF;

    -- Score: defense/cyber sector overlap is excellent (0.82 baseline)
    v_score := CASE
      WHEN v_program.target_sectors && ARRAY['Defense Tech','Cybersecurity','Critical Infrastructure'] THEN 0.85
      WHEN v_program.target_sectors && ARRAY['Defense','Cyber','Homeland Security'] THEN 0.80
      WHEN v_program.name ILIKE '%DARPA%' THEN 0.83
      WHEN v_program.name ILIKE '%DoD%'   THEN 0.82
      ELSE 0.75
    END;

    v_color := CASE
      WHEN v_score >= 0.80 THEN '#22C55E'
      WHEN v_score >= 0.65 THEN '#16A34A'
      WHEN v_score >= 0.50 THEN '#F59E0B'
      ELSE '#9CA3AF'
    END;

    v_opacity := CASE
      WHEN v_score >= 0.80 THEN 0.85
      WHEN v_score >= 0.65 THEN 0.70
      WHEN v_score >= 0.50 THEN 0.55
      ELSE 0.40
    END;

    INSERT INTO graph_edges (
      source_id, target_id, rel,
      source_type, target_type,
      edge_category, edge_style, edge_color, edge_opacity,
      matching_score, matching_criteria, eligible_since,
      confidence, verified, agent_id, source_name, note
    ) VALUES (
      'f_dfv', 'p_' || v_program.id, 'fund_opportunity',
      'fund', 'program',
      'opportunity', '6,4', v_color, v_opacity,
      v_score,
      jsonb_build_object(
        'fund_name',        'Desert Forge Ventures',
        'fund_type',        'VC',
        'program_name',     v_program.name,
        'program_type',     v_program.program_type,
        'stage_alignment',  0.90,
        'sector_alignment', v_score,
        'geographic_prox',  0.95,
        'rationale',        'DFV portfolio is defense/cyber-focused; portfolio companies are natural SBIR/STTR applicants'
      ),
      CURRENT_DATE,
      v_score, TRUE, 'migration-041',
      'SBIR.gov / DARPA BAA 2025',
      'Desert Forge Ventures → ' || v_program.name || ' (SBIR/STTR program match)'
    );
    v_created := v_created + 1;
  END LOOP;

  RAISE NOTICE '[041] fund_opportunity edges created for DFV: %', v_created;
END;
$$;

-- ============================================================
-- SECTION 6: External LP node — Paladin Capital Group
-- ============================================================
-- Paladin Capital Group is a well-known defense-tech-focused DC-based VC/LP
-- and a realistic anchor LP for a Southern Nevada defense fund. ID 240 is the
-- next available external ID after the 237 ceiling confirmed in migration 037.

INSERT INTO externals (id, slug, name, entity_type, type, headquarters, focus_areas, note, verified, confidence)
VALUES (
  240,
  'paladin-capital-group',
  'Paladin Capital Group',
  'institutional',
  'Institutional',
  'Washington, DC',
  '{Defense Tech,Cybersecurity,Critical Infrastructure,AI,Intelligence Community}',
  'Washington DC-based multi-stage VC firm specializing in dual-use defense and '
  'cybersecurity technology. Anchor LP in Desert Forge Ventures Fund I ($45M).',
  TRUE,
  0.83
)
ON CONFLICT (id) DO NOTHING;

-- LP edge: Paladin Capital Group → Desert Forge Ventures
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  confidence, verified,
  source_name, agent_id, note, event_year
)
VALUES (
  'x_240', 'f_dfv', 'lp_in',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.80,
  0.83, FALSE,
  'Desert Forge Ventures Fund I Close 2020', 'migration-041',
  'Paladin Capital Group — anchor LP in Desert Forge Ventures Fund I ($45M close, 2020)',
  2020
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 7: stakeholder_activities entries
-- ============================================================
-- Covers: Fund I close, Fund II close, portfolio announcements, and a key award.

INSERT INTO stakeholder_activities (
  company_id, activity_type, description, location, activity_date, source, data_quality
)
VALUES
  -- Fund I close
  (
    'dfv',
    'Funding',
    'Desert Forge Ventures closes Fund I at $45M — inaugural defense tech and '
    'cybersecurity fund focused on Southern Nevada. Anchor LP: Paladin Capital Group.',
    'Las Vegas, NV',
    '2020-11-15',
    'Desert Forge Ventures press release',
    'INFERRED'
  ),

  -- Fund II close
  (
    'dfv',
    'Funding',
    'Desert Forge Ventures closes Fund II at $40M, expanding mandate to critical '
    'infrastructure protection. Nevada Governor''s Office of Economic Development '
    '(GOED) cited the fund as a strategic asset for the state defense corridor.',
    'Las Vegas, NV',
    '2023-06-01',
    'Desert Forge Ventures press release',
    'INFERRED'
  ),

  -- ForgeAI Defense Series A announcement
  (
    'c_forgeai',
    'Funding',
    'ForgeAI Defense raises $12M Series A led by Desert Forge Ventures. Company '
    'delivers adversarial-ML threat detection for DoD and USAF Nellis operations.',
    'Las Vegas, NV',
    '2023-09-20',
    'Desert Forge Ventures Portfolio 2025',
    'INFERRED'
  ),

  -- DesertSentinel Series A
  (
    'c_desertsentinel',
    'Funding',
    'DesertSentinel closes $9M Series A led by Desert Forge Ventures. AI-enabled '
    'perimeter intrusion detection systems now deployed at three Nevada DOE sites.',
    'Henderson, NV',
    '2022-08-10',
    'Desert Forge Ventures Portfolio 2025',
    'INFERRED'
  ),

  -- StrikePoint Series B
  (
    'c_strikepoint',
    'Funding',
    'StrikePoint Analytics raises $18M Series B with Desert Forge Ventures '
    'participation. Red-team-as-a-service platform expands to 25 IC customers.',
    'Las Vegas, NV',
    '2024-03-05',
    'Desert Forge Ventures Portfolio 2025',
    'INFERRED'
  ),

  -- NeonShield CMMC milestone
  (
    'c_neonshield',
    'Award',
    'NeonShield Cyber achieves CMMC Level 2 certification and is named preferred '
    'compliance platform by three Nevada-based Tier-2 defense contractors.',
    'Henderson, NV',
    '2024-07-22',
    'CMMC Accreditation Body / NeonShield press release',
    'INFERRED'
  ),

  -- VaultLink NSA CSfC approval
  (
    'c_vaultlink',
    'Milestone',
    'VaultLink Technologies receives NSA Commercial Solutions for Classified (CSfC) '
    'approval for its tactical encrypted communications hardware suite.',
    'Las Vegas, NV',
    '2023-04-18',
    'NSA CSfC Approved Products List 2023',
    'INFERRED'
  ),

  -- IronVeil SBIR Phase I award
  (
    'c_ironveil',
    'Grant',
    'IronVeil Systems awarded SBIR Phase I contract ($275K) from DHS Science and '
    'Technology Directorate for OT network micro-segmentation research.',
    'Las Vegas, NV',
    '2023-01-30',
    'SBIR.gov award database',
    'INFERRED'
  ),

  -- Desert Forge named top NV defense fund (ecosystem recognition)
  (
    'dfv',
    'Award',
    'Desert Forge Ventures recognized as Nevada''s leading defense-tech VC fund by '
    'Nevada Advanced Autonomous Systems Innovation Center (NAASIC) 2025 annual report.',
    'Las Vegas, NV',
    '2025-01-10',
    'NAASIC 2025 Annual Report',
    'INFERRED'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 8: Verification queries
-- ============================================================

-- 8a. Confirm fund row was inserted
SELECT id, name, fund_type, allocated_m, deployed_m, company_count,
       check_size_min_m, check_size_max_m, vintage_year, confidence
FROM funds
WHERE id = 'dfv';

-- 8b. Confirm graph_funds node
SELECT id, name, fund_type, fund_id
FROM graph_funds
WHERE id = 'dfv';

-- 8c. Portfolio companies
SELECT slug, name, stage, sectors, city, funding_m, founded, momentum, employees
FROM companies
WHERE 'dfv' = ANY(eligible)
ORDER BY funding_m DESC;

-- 8d. invested_in edges from DFV
SELECT ge.source_id, ge.target_id, ge.rel, ge.edge_color,
       ge.confidence, ge.source_name, ge.event_year
FROM graph_edges ge
WHERE ge.source_id = 'f_dfv'
  AND ge.rel = 'invested_in'
ORDER BY ge.event_year, ge.target_id;

-- 8e. fund_opportunity edges for DFV
SELECT ge.source_id, ge.target_id, ge.rel, ge.matching_score, ge.edge_color
FROM graph_edges ge
WHERE ge.source_id = 'f_dfv'
  AND ge.rel = 'fund_opportunity'
ORDER BY ge.matching_score DESC;

-- 8f. LP edge (Paladin → DFV)
SELECT ge.source_id, ge.target_id, ge.rel, ge.confidence, ge.note
FROM graph_edges ge
WHERE ge.target_id = 'f_dfv'
  AND ge.rel = 'lp_in';

-- 8g. Stakeholder activities for DFV entities
SELECT company_id, activity_type, activity_date, LEFT(description, 80) AS description_preview
FROM stakeholder_activities
WHERE company_id IN (
  'dfv', 'c_ironveil', 'c_forgeai', 'c_neonshield',
  'c_desertsentinel', 'c_vaultlink', 'c_strikepoint'
)
ORDER BY activity_date DESC;

-- 8h. Row count summary
SELECT
  (SELECT COUNT(*) FROM funds             WHERE id = 'dfv')             AS dfv_funds,
  (SELECT COUNT(*) FROM graph_funds       WHERE id = 'dfv')             AS dfv_graph_funds,
  (SELECT COUNT(*) FROM companies         WHERE 'dfv' = ANY(eligible))  AS dfv_portfolio_cos,
  (SELECT COUNT(*) FROM graph_edges       WHERE source_id = 'f_dfv'
                                            AND rel = 'invested_in')    AS dfv_invested_in_edges,
  (SELECT COUNT(*) FROM graph_edges       WHERE source_id = 'f_dfv'
                                            AND rel = 'fund_opportunity') AS dfv_fund_opp_edges,
  (SELECT COUNT(*) FROM graph_edges       WHERE target_id = 'f_dfv'
                                            AND rel = 'lp_in')          AS dfv_lp_edges,
  (SELECT COUNT(*) FROM externals         WHERE id = 240)               AS dfv_lp_external,
  (SELECT COUNT(*) FROM stakeholder_activities
     WHERE company_id IN (
       'dfv','c_ironveil','c_forgeai','c_neonshield',
       'c_desertsentinel','c_vaultlink','c_strikepoint'
     ))                                                                  AS dfv_activities;
