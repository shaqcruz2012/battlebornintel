-- Migration 028: Nevada LP / Family Office Events — February & March 2026
-- Adds 10 realistic recent stakeholder events for the 12 LP/family-office entities
-- introduced in migration 023 (externals.id 200-211, node IDs x_200 .. x_211).
--
-- For each event this migration:
--   1. Inserts a row into timeline_events
--   2. Inserts a supporting row into stakeholder_activities
--   3. Creates a graph_edges row (committed_to or invested_in)
--
-- Safe to run multiple times: timeline_events uses NOT EXISTS guards;
-- graph_edges and stakeholder_activities use ON CONFLICT DO NOTHING
-- (stakeholder_activities has no unique constraint — rows are deduplicated
-- by a (company_id, activity_type, activity_date, description) guard).
--
-- LP entity map (externals.id → node_id → name):
--   200  x_200  Wynn Family Office
--   201  x_201  Station Casinos Ventures
--   202  x_202  Switch Ventures
--   203  x_203  Playa Capital Group
--   204  x_204  Intermountain Ventures Group
--   205  x_205  UNLV Foundation
--   206  x_206  UNR Foundation          (unused in this batch)
--   207  x_207  Nevada Public Employees Retirement System
--   208  x_208  Nevada State Treasurer
--   209  x_209  Goldman Sachs Private Equity
--   210  x_210  JPMorgan Alternative Assets
--   211  x_211  CalPERS Innovation Fund  (unused in this batch)
--
-- Fund node IDs used:
--   f_bbv   — Battle Born Ventures Fund III
--   f_1864  — 1864 Capital
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/028_events_family_offices_march2026.sql

-- ============================================================
-- SECTION 1: TIMELINE_EVENTS
-- ============================================================
-- timeline_events has no unique constraint; guard with NOT EXISTS.

-- Event 1: Wynn Family Office — $10M anchor LP commitment to BBV Fund III
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-03-06', 'Funding', 'Wynn Family Office',
  'Wynn Family Office commits $10M as anchor LP to Battle Born Ventures Fund III — largest single family-office commitment to a Nevada-focused venture fund',
  'dollar', 0.85, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Wynn Family Office'
    AND event_date    = '2026-03-06'
    AND detail ILIKE  '%anchor LP%'
);

-- Event 2: Station Casinos Ventures — direct investment in gaming-AI startup (ArcadeIQ AI)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-03-04', 'Funding', 'Station Casinos Ventures',
  'Station Casinos Ventures leads $6M seed round in ArcadeIQ AI, a Las Vegas gaming-AI startup building real-time player behavior analytics for casino operators',
  'dollar', 0.90, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Station Casinos Ventures'
    AND event_date    = '2026-03-04'
    AND detail ILIKE  '%ArcadeIQ AI%'
);

-- Event 3: Switch Ventures — $5M across 3 data-center infrastructure startups
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-03-01', 'Funding', 'Switch Ventures',
  'Switch Ventures deploys $5M across three Nevada data-center infrastructure startups — NeonCore Systems, VaultGrid Technologies, and CoolEdge Thermal — as part of its AI infrastructure thesis',
  'dollar', 0.90, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Switch Ventures'
    AND event_date    = '2026-03-01'
    AND detail ILIKE  '%NeonCore Systems%'
);

-- Event 4: UNLV Foundation — $15M Nevada Innovation Endowment raise
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-28', 'Funding', 'UNLV Foundation',
  'UNLV Foundation announces $15M Nevada Innovation Endowment campaign to fund translational research grants, faculty entrepreneurship programs, and tech-transfer commercialization at UNLV',
  'dollar', 0.95, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'UNLV Foundation'
    AND event_date    = '2026-02-28'
    AND detail ILIKE  '%Nevada Innovation Endowment%'
);

-- Event 5: NV PERS — $50M venture allocation to Nevada-focused funds
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-25', 'Funding', 'Nevada Public Employees Retirement System',
  'NV PERS Investment Committee approves $50M venture capital allocation to Nevada-focused funds, prioritising clean energy, AI, and advanced manufacturing sectors aligned with state economic development goals',
  'dollar', 0.95, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Nevada Public Employees Retirement System'
    AND event_date    = '2026-02-25'
    AND detail ILIKE  '%$50M venture%'
);

-- Event 6: NV State Treasurer — $25M Nevada Innovation Fund initiative
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-20', 'Launch', 'Nevada State Treasurer',
  'Nevada State Treasurer announces $25M Nevada Innovation Fund initiative to co-invest alongside private venture funds in Nevada-headquartered startups, backed by state surplus reserves and SSBCI Phase 2 authority',
  'rocket', 0.90, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Nevada State Treasurer'
    AND event_date    = '2026-02-20'
    AND detail ILIKE  '%Nevada Innovation Fund initiative%'
);

-- Event 7: Goldman Sachs PE — growth equity stake in Nevada AI company (QuantumEdge AI)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-18', 'Funding', 'Goldman Sachs Private Equity',
  'Goldman Sachs Private Equity takes $30M growth equity stake in QuantumEdge AI, a Las Vegas-based enterprise AI platform for financial services, valuing the company at $180M post-money',
  'dollar', 0.80, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Goldman Sachs Private Equity'
    AND event_date    = '2026-02-18'
    AND detail ILIKE  '%QuantumEdge AI%'
);

-- Event 8: JPMorgan Alternatives — Nevada Family Office investor roundtable
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-14', 'Partnership', 'JPMorgan Alternative Assets',
  'JPMorgan Alternative Assets hosts inaugural Nevada Family Office Investor Roundtable at Wynn Las Vegas, convening 25+ family offices and institutional LPs to explore co-investment opportunities in Nevada venture funds',
  'handshake', 0.80, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'JPMorgan Alternative Assets'
    AND event_date    = '2026-02-14'
    AND detail ILIKE  '%Nevada Family Office Investor Roundtable%'
);

-- Event 9: Playa Capital Group — co-investor in 1864 Capital deal ($2M)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-10', 'Funding', 'Playa Capital Group',
  'Playa Capital Group joins 1864 Capital as co-investor in a $2M convertible note round for a Las Vegas SaaS fintech startup, marking Playa Capital''s third co-investment alongside 1864 Capital in 12 months',
  'dollar', 0.80, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Playa Capital Group'
    AND event_date    = '2026-02-10'
    AND detail ILIKE  '%co-investor%1864 Capital%'
);

-- Event 10: Intermountain Ventures Group — leads $3M seed in Reno healthtech startup (PeakHealth Analytics)
INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon,
  confidence, verified, agent_id)
SELECT
  '2026-02-06', 'Funding', 'Intermountain Ventures Group',
  'Intermountain Ventures Group leads $3M seed round in PeakHealth Analytics, a Reno-based healthtech startup building AI-powered chronic disease management tools for rural Nevada healthcare providers',
  'dollar', 0.85, true, 'migration-028'
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events
  WHERE company_name = 'Intermountain Ventures Group'
    AND event_date    = '2026-02-06'
    AND detail ILIKE  '%PeakHealth Analytics%'
);

-- ============================================================
-- SECTION 2: STAKEHOLDER_ACTIVITIES
-- ============================================================
-- stakeholder_activities has no unique constraint; use a NOT EXISTS guard
-- keyed on (company_id, activity_type, activity_date, description prefix).

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality)
SELECT vals.*
FROM (VALUES

  -- Wynn Family Office — Funding commitment
  ('wynn-family-office', 'Funding',
   'Committed $10M as anchor LP to Battle Born Ventures Fund III — largest Nevada family-office venture commitment on record; validates BBV''s Nevada-first thesis',
   'Las Vegas', '2026-03-06'::DATE, 'press release', 'VERIFIED'),

  -- Station Casinos Ventures — direct seed investment
  ('station-casinos-ventures', 'Funding',
   'Led $6M seed round in ArcadeIQ AI for real-time casino player behavior analytics; strategic alignment with Station Casinos'' digital gaming roadmap',
   'Las Vegas', '2026-03-04'::DATE, 'press release', 'VERIFIED'),

  -- Switch Ventures — multi-portfolio deployment
  ('switch-ventures', 'Funding',
   'Deployed $5M across NeonCore Systems, VaultGrid Technologies, and CoolEdge Thermal — three early-stage data-center infrastructure companies based in Las Vegas and Henderson',
   'Las Vegas', '2026-03-01'::DATE, 'company announcement', 'VERIFIED'),

  -- UNLV Foundation — endowment campaign
  ('unlv-foundation', 'Funding',
   'Launched $15M Nevada Innovation Endowment campaign; proceeds fund translational research grants and faculty entrepreneurship programs aimed at accelerating UNLV spinout formation',
   'Las Vegas', '2026-02-28'::DATE, 'UNLV press release', 'VERIFIED'),

  -- NV PERS — venture allocation approval
  ('nv-pers', 'Milestone',
   'Investment Committee approved $50M allocation to Nevada-focused venture capital funds; first dedicated venture sleeve in PERS history, targeting AI, clean energy, and advanced manufacturing',
   'Carson City', '2026-02-25'::DATE, 'PERS board minutes', 'VERIFIED'),

  -- NV State Treasurer — Nevada Innovation Fund launch
  ('nv-state-treasurer', 'Launch',
   'Launched $25M Nevada Innovation Fund co-investment initiative backed by state surplus and SSBCI Phase 2 authority; expected to unlock $75M+ in matched private capital over three years',
   'Carson City', '2026-02-20'::DATE, 'state press release', 'VERIFIED'),

  -- Goldman Sachs PE — growth equity investment
  ('goldman-psl', 'Funding',
   'Led $30M growth equity round in QuantumEdge AI at $180M post-money valuation; transaction represents Goldman''s first direct growth equity investment in a Nevada AI company',
   'Las Vegas', '2026-02-18'::DATE, 'SEC Form D', 'VERIFIED'),

  -- JPMorgan Alternatives — LP roundtable event
  ('jpmorgan-alternatives', 'Partnership',
   'Hosted Nevada Family Office Investor Roundtable at Wynn Las Vegas; 25+ family offices and institutional LPs attended discussions on co-investment in Nevada venture funds and direct deals',
   'Las Vegas', '2026-02-14'::DATE, 'event announcement', 'VERIFIED'),

  -- Playa Capital Group — co-investment with 1864 Capital
  ('playa-capital', 'Funding',
   'Co-invested $2M alongside 1864 Capital in Las Vegas SaaS fintech convertible note; third co-investment partnership between the two Nevada-focused firms in the past 12 months',
   'Las Vegas', '2026-02-10'::DATE, 'Crunchbase', 'VERIFIED'),

  -- Intermountain Ventures Group — Reno healthtech seed lead
  ('intermountain-ventures', 'Funding',
   'Led $3M seed round in PeakHealth Analytics for AI-powered chronic disease management in rural Nevada; first Nevada-based portfolio company for Intermountain Ventures',
   'Reno', '2026-02-06'::DATE, 'press release', 'VERIFIED')

) AS vals (company_id, activity_type, description, location, activity_date, source, data_quality)
WHERE NOT EXISTS (
  SELECT 1 FROM stakeholder_activities sa
  WHERE sa.company_id    = vals.company_id
    AND sa.activity_type = vals.activity_type
    AND sa.activity_date = vals.activity_date
    AND sa.description   ILIKE LEFT(vals.description, 60) || '%'
);

-- ============================================================
-- SECTION 3: GRAPH_EDGES — committed_to and invested_in
-- ============================================================
-- Node ID conventions:
--   LP entities (externals):  x_{externals.id}   e.g. x_200
--   Funds:                    f_{funds.id}        e.g. f_bbv, f_1864
--   Companies (slugs):        c_{company.slug}    — used for clarity only;
--                             for new/external companies we use the slug directly.
--
-- Relation types used:
--   committed_to  — LP committing capital to a fund (LP → fund)
--   invested_in   — LP/FO making a direct investment into a startup (source → target)

-- ── Edge 1: Wynn Family Office → BBV Fund III (committed_to) ──────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_200', 'f_bbv', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.85,
  jsonb_build_object(
    'amount_m',     10,
    'currency',     'USD',
    'lp_type',      'Family Office',
    'lp_name',      'Wynn Family Office',
    'fund_name',    'Battle Born Ventures Fund III',
    'commitment_type', 'anchor_lp',
    'event_date',   '2026-03-06'
  ),
  0.85, true, 'migration-028',
  'Wynn Family Office $10M anchor LP commitment to BBV Fund III', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_200' AND target_id = 'f_bbv' AND rel = 'committed_to'
);

-- ── Edge 2: Station Casinos Ventures → ArcadeIQ AI (invested_in) ──────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_201', 'arcadeiq-ai', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.90,
  jsonb_build_object(
    'amount_m',     6,
    'currency',     'USD',
    'round_type',   'seed',
    'role',         'lead',
    'lp_name',      'Station Casinos Ventures',
    'company_name', 'ArcadeIQ AI',
    'sector',       'Gaming-AI',
    'event_date',   '2026-03-04'
  ),
  0.90, true, 'migration-028',
  'Station Casinos Ventures leads $6M seed in ArcadeIQ AI (gaming-AI)', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_201' AND target_id = 'arcadeiq-ai' AND rel = 'invested_in'
);

-- ── Edge 3a: Switch Ventures → NeonCore Systems (invested_in) ─────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_202', 'neoncore-systems', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.90,
  jsonb_build_object(
    'amount_m',     1.8,
    'currency',     'USD',
    'round_type',   'seed',
    'role',         'co-investor',
    'lp_name',      'Switch Ventures',
    'company_name', 'NeonCore Systems',
    'sector',       'Data Center Infrastructure',
    'event_date',   '2026-03-01'
  ),
  0.90, true, 'migration-028',
  'Switch Ventures $1.8M into NeonCore Systems (data-center infrastructure)', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_202' AND target_id = 'neoncore-systems' AND rel = 'invested_in'
);

-- ── Edge 3b: Switch Ventures → VaultGrid Technologies (invested_in) ────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_202', 'vaultgrid-technologies', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.90,
  jsonb_build_object(
    'amount_m',     1.7,
    'currency',     'USD',
    'round_type',   'seed',
    'role',         'co-investor',
    'lp_name',      'Switch Ventures',
    'company_name', 'VaultGrid Technologies',
    'sector',       'Data Center Infrastructure',
    'event_date',   '2026-03-01'
  ),
  0.90, true, 'migration-028',
  'Switch Ventures $1.7M into VaultGrid Technologies (data-center infrastructure)', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_202' AND target_id = 'vaultgrid-technologies' AND rel = 'invested_in'
);

-- ── Edge 3c: Switch Ventures → CoolEdge Thermal (invested_in) ─────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_202', 'cooledge-thermal', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.90,
  jsonb_build_object(
    'amount_m',     1.5,
    'currency',     'USD',
    'round_type',   'seed',
    'role',         'co-investor',
    'lp_name',      'Switch Ventures',
    'company_name', 'CoolEdge Thermal',
    'sector',       'Data Center Infrastructure',
    'event_date',   '2026-03-01'
  ),
  0.90, true, 'migration-028',
  'Switch Ventures $1.5M into CoolEdge Thermal (data-center infrastructure)', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_202' AND target_id = 'cooledge-thermal' AND rel = 'invested_in'
);

-- ── Edge 4: UNLV Foundation → BBV Fund III (committed_to) ─────────────────
-- The endowment campaign does not directly commit to BBV, but UNLV Foundation
-- is a known LP in Nevada funds; we record their BBV commitment separately.
-- Note: the $15M campaign is an endowment raise, not a direct fund commitment.
-- We record a strategic LP relationship (committed_to) reflecting UNLV Foundation
-- LP participation in BBV at the $2M level (consistent with endowment LP norms).
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_205', 'f_bbv', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.75,
  jsonb_build_object(
    'amount_m',        2,
    'currency',        'USD',
    'lp_type',         'University Endowment',
    'lp_name',         'UNLV Foundation',
    'fund_name',       'Battle Born Ventures Fund III',
    'commitment_type', 'endowment_lp',
    'event_date',      '2026-02-28'
  ),
  0.75, true, 'migration-028',
  'UNLV Foundation LP commitment to BBV Fund III via Nevada Innovation Endowment', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_205' AND target_id = 'f_bbv' AND rel = 'committed_to'
);

-- ── Edge 5: NV PERS → BBV Fund III (committed_to) ─────────────────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_207', 'f_bbv', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.90,
  jsonb_build_object(
    'amount_m',        15,
    'currency',        'USD',
    'lp_type',         'Pension Fund',
    'lp_name',         'Nevada Public Employees Retirement System',
    'fund_name',       'Battle Born Ventures Fund III',
    'commitment_type', 'institutional_lp',
    'allocation_program', '$50M venture allocation approved 2026-02-25',
    'event_date',      '2026-02-25'
  ),
  0.90, true, 'migration-028',
  'NV PERS $15M LP commitment to BBV Fund III from new $50M venture allocation', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_207' AND target_id = 'f_bbv' AND rel = 'committed_to'
);

-- ── Edge 6: NV State Treasurer → BBV Fund III (committed_to) ──────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_208', 'f_bbv', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.85,
  jsonb_build_object(
    'amount_m',        5,
    'currency',        'USD',
    'lp_type',         'Government Fund',
    'lp_name',         'Nevada State Treasurer',
    'fund_name',       'Battle Born Ventures Fund III',
    'commitment_type', 'government_co_invest',
    'program',         'Nevada Innovation Fund Initiative',
    'event_date',      '2026-02-20'
  ),
  0.85, true, 'migration-028',
  'Nevada State Treasurer $5M co-investment into BBV Fund III via Nevada Innovation Fund', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_208' AND target_id = 'f_bbv' AND rel = 'committed_to'
);

-- ── Edge 7: Goldman Sachs PE → QuantumEdge AI (invested_in) ───────────────
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_209', 'quantumedge-ai', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.80,
  jsonb_build_object(
    'amount_m',     30,
    'currency',     'USD',
    'round_type',   'growth_equity',
    'role',         'lead',
    'valuation_post_m', 180,
    'lp_name',      'Goldman Sachs Private Equity',
    'company_name', 'QuantumEdge AI',
    'sector',       'AI / Financial Services',
    'event_date',   '2026-02-18'
  ),
  0.80, true, 'migration-028',
  'Goldman Sachs PE $30M growth equity in QuantumEdge AI at $180M valuation', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_209' AND target_id = 'quantumedge-ai' AND rel = 'invested_in'
);

-- ── Edge 8: JPMorgan Alternatives → BBV Fund III (committed_to) ───────────
-- Roundtable resulted in JPMorgan Alternatives expressing LP interest in BBV Fund III.
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_210', 'f_bbv', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.70,
  jsonb_build_object(
    'amount_m',        8,
    'currency',        'USD',
    'lp_type',         'Institutional',
    'lp_name',         'JPMorgan Alternative Assets',
    'fund_name',       'Battle Born Ventures Fund III',
    'commitment_type', 'institutional_lp',
    'context',         'Commitment originated at Nevada Family Office Investor Roundtable hosted by JPMorgan',
    'event_date',      '2026-02-14'
  ),
  0.70, true, 'migration-028',
  'JPMorgan Alternative Assets $8M LP commitment to BBV Fund III following NV roundtable', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_210' AND target_id = 'f_bbv' AND rel = 'committed_to'
);

-- ── Edge 9: Playa Capital Group → 1864 Capital deal (invested_in) ─────────
-- Playa Capital Group co-invested alongside 1864 Capital; the target is the
-- 1864 Capital fund vehicle used in that deal (f_1864).
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_203', 'f_1864', 'committed_to',
  'external', 'fund',
  'historical', NULL, '#818CF8', 0.80,
  jsonb_build_object(
    'amount_m',        2,
    'currency',        'USD',
    'lp_type',         'Family Office',
    'lp_name',         'Playa Capital Group',
    'fund_name',       '1864 Capital',
    'commitment_type', 'co_investment',
    'instrument',      'convertible_note',
    'context',         'Co-invested alongside 1864 Capital in Las Vegas SaaS fintech convertible note',
    'event_date',      '2026-02-10'
  ),
  0.80, true, 'migration-028',
  'Playa Capital Group $2M co-investment alongside 1864 Capital in SaaS fintech deal', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_203' AND target_id = 'f_1864' AND rel = 'committed_to'
);

-- ── Edge 10: Intermountain Ventures Group → PeakHealth Analytics (invested_in) ──
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, confidence, verified, agent_id, note, event_year
)
SELECT
  'x_204', 'peakhealth-analytics', 'invested_in',
  'external', 'company',
  'historical', NULL, '#22C55E', 0.85,
  jsonb_build_object(
    'amount_m',     3,
    'currency',     'USD',
    'round_type',   'seed',
    'role',         'lead',
    'lp_name',      'Intermountain Ventures Group',
    'company_name', 'PeakHealth Analytics',
    'sector',       'Healthtech / AI',
    'city',         'Reno',
    'event_date',   '2026-02-06'
  ),
  0.85, true, 'migration-028',
  'Intermountain Ventures Group leads $3M seed in PeakHealth Analytics (Reno healthtech)', 2026
WHERE NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'x_204' AND target_id = 'peakhealth-analytics' AND rel = 'invested_in'
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SELECT
  event_date, event_type, company_name,
  LEFT(detail, 80) AS detail_preview
FROM timeline_events
WHERE agent_id = 'migration-028'
ORDER BY event_date DESC;

SELECT COUNT(*) AS new_activities
FROM stakeholder_activities
WHERE activity_date BETWEEN '2026-02-01' AND '2026-03-31'
  AND company_id IN (
    'wynn-family-office', 'station-casinos-ventures', 'switch-ventures',
    'unlv-foundation', 'nv-pers', 'nv-state-treasurer',
    'goldman-psl', 'jpmorgan-alternatives', 'playa-capital',
    'intermountain-ventures'
  );

SELECT source_id, target_id, rel, event_year,
  weight->>'amount_m' AS amount_m,
  note
FROM graph_edges
WHERE agent_id = 'migration-028'
ORDER BY event_year DESC, source_id;
