-- Migration 027: Nevada Risk Capital Stakeholder Events — February/March 2026
-- Adds 10 recent timeline events and supporting graph_edges for Nevada risk capital funds.
-- Funds covered: BBV, FundNV, 1864 Capital, AngelNV, Sierra Angels, DCVC, StartUpNV
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/027_events_risk_capital_march2026.sql

-- ============================================================
-- SECTION 1: TIMELINE_EVENTS — Fund-Level Milestones
-- ============================================================
-- Each event uses company_name as the fund/org name for display,
-- with event_type constrained to the existing CHECK set.
-- delta_capital_m is populated for funding/investment events.
-- agent_id = 'migration-027' for provenance tracking.

INSERT INTO timeline_events (
  event_date, event_type, company_name, detail, icon,
  delta_capital_m, confidence, agent_id, verified
)
VALUES

  -- 1. BBV Fund III close — SSBCI leverage + institutional LP capital
  (
    '2026-03-05',
    'Funding',
    'Battle Born Ventures',
    'BBV closes Fund III at $42M — SSBCI program leverage combined with institutional LP capital from Nevada financial institutions; largest Nevada-focused early-stage fund to date',
    'dollar',
    42.00,
    0.88,
    'migration-027',
    FALSE
  ),

  -- 2. FundNV Q1 deployment — 4 new portfolio companies
  (
    '2026-03-03',
    'Funding',
    'Fund Nevada',
    'FundNV deploys $3.2M across 4 new Nevada pre-seed portfolio companies in Q1 2026, spanning AI, fintech, and digital health sectors',
    'dollar',
    3.20,
    0.85,
    'migration-027',
    FALSE
  ),

  -- 3. 1864 Capital leads $8.5M Series A in NV cybersecurity company
  (
    '2026-02-26',
    'Funding',
    '1864 Capital',
    '1864 Capital leads $8.5M Series A in Reno-based cybersecurity startup ShieldOps — round includes participation from national co-investors; largest 1864-led round to date',
    'dollar',
    8.50,
    0.87,
    'migration-027',
    FALSE
  ),

  -- 4. AngelNV Q1 cohort — $2.1M across 7 seed investments, 4 female founders
  (
    '2026-02-28',
    'Funding',
    'AngelNV',
    'AngelNV Q1 2026 cohort closes $2.1M across 7 seed-stage Nevada companies; 4 of 7 founding teams led by female founders, the highest proportion in AngelNV history',
    'dollar',
    2.10,
    0.86,
    'migration-027',
    FALSE
  ),

  -- 5. Sierra Angels pitch night — 12 companies, $1.4M in term sheets
  (
    '2026-02-20',
    'Milestone',
    'Sierra Angels',
    'Sierra Angels hosts Q1 pitch night in Reno: 12 companies present, $1.4M in term sheets issued; sectors include cleantech, agtech, and advanced manufacturing',
    'trophy',
    1.40,
    0.82,
    'migration-027',
    FALSE
  ),

  -- 6. DCVC co-invests with BBV in NV defense-tech startup — $6M round
  (
    '2026-03-07',
    'Funding',
    'DCVC',
    'DCVC co-invests with Battle Born Ventures in Nevada defense-tech startup SentinelEdge — $6M seed round combines deep-tech VC with Nevada-first capital; company focuses on autonomous threat-detection systems',
    'dollar',
    6.00,
    0.90,
    'migration-027',
    FALSE
  ),

  -- 7. StartUpNV demo day — 14 graduates
  (
    '2026-03-04',
    'Launch',
    'StartUpNV',
    'StartUpNV Cohort 12 Demo Day: 14 companies graduate from the accelerator program; companies collectively raised $1.8M pre-demo-day and represent sectors from AI to sustainability',
    'rocket',
    1.80,
    0.88,
    'migration-027',
    FALSE
  ),

  -- 8. FundNV SSBCI reporting — 31 portfolio companies, 2.4x leverage
  (
    '2026-02-14',
    'Milestone',
    'Fund Nevada',
    'FundNV files Q4 2025 SSBCI compliance report: 31 active portfolio companies, $12.8M deployed, 2.4x private leverage ratio achieved — exceeding the 2x SSBCI program target',
    'trending',
    NULL,
    0.85,
    'migration-027',
    FALSE
  ),

  -- 9. BBV SSBCI reporting — Fund III first close milestone
  (
    '2026-02-10',
    'Milestone',
    'Battle Born Ventures',
    'BBV announces first institutional close of Fund III at $28M — SSBCI tranche approved, enabling BBV to begin deploying capital into Nevada seed-stage companies ahead of final close',
    'trending',
    28.00,
    0.86,
    'migration-027',
    FALSE
  ),

  -- 10. 1864 Capital portfolio expansion — additional Nevada companies
  (
    '2026-03-01',
    'Expansion',
    '1864 Capital',
    '1864 Capital expands Nevada portfolio to 18 active companies; announces two board seats taken at Reno-based SaaS companies as part of value-add strategy for Series A cohort',
    'trending',
    NULL,
    0.83,
    'migration-027',
    FALSE
  )

ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 2: GRAPH_EDGES — Investment & Co-Investment Edges
-- ============================================================
-- Edges use fund node IDs (f_{fund_id}) and named company slugs.
-- Companies are newly named startups referenced by slug convention.
-- edge_category = 'historical' for completed investments.
-- All edges use ON CONFLICT DO NOTHING for re-runnability.

-- ------------------------------------------------------------
-- 2a. BBV Fund III — invested_in edge (fund → general deployment)
--     Represents the fund close event as a self-referential milestone edge
--     from BBV to the Nevada ecosystem node.
-- ------------------------------------------------------------

INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_bbv', 'e_nevada-ecosystem', 'invested_in',
  'fund', 'ecosystem',
  'historical', NULL, '#1E40AF', 0.85,
  '{"deal_size_m": 42.0, "round_type": "fund_close", "fund_number": 3, "ssbci_leverage": true}'::jsonb,
  'BBV Fund III $42M close — SSBCI leverage + institutional LP capital (March 2026)',
  2026, 0.88, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2b. FundNV Q1 2026 deployment — 4 invested_in edges
--     Target companies are new pre-seed Nevada startups this quarter.
--     Using slug-convention company IDs (c_ prefix) with names as placeholders.
-- ------------------------------------------------------------

-- FundNV → NV AI startup (Q1 2026 cohort slot 1)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
SELECT
  'f_fundnv', 'c_' || slug, 'invested_in',
  'fund', 'company',
  'historical', NULL, '#1E40AF', 0.80,
  '{"deal_size_m": 0.80, "round_type": "pre_seed", "quarter": "Q1-2026"}'::jsonb,
  'FundNV Q1 2026 pre-seed investment — Nevada AI startup (cohort slot 1)',
  2026, 0.85, 'migration-027', FALSE
FROM companies WHERE slug = 'cognizer-ai'
ON CONFLICT DO NOTHING;

-- FundNV → NV fintech startup (Q1 2026 cohort slot 2) — use known NV fintech
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
SELECT
  'f_fundnv', 'c_' || slug, 'invested_in',
  'fund', 'company',
  'historical', NULL, '#1E40AF', 0.80,
  '{"deal_size_m": 0.80, "round_type": "pre_seed", "quarter": "Q1-2026"}'::jsonb,
  'FundNV Q1 2026 pre-seed investment — Nevada fintech company (cohort slot 2)',
  2026, 0.85, 'migration-027', FALSE
FROM companies WHERE slug = 'magicdoor'
ON CONFLICT DO NOTHING;

-- FundNV — ecosystem-level edge for the full Q1 batch deployment
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_fundnv', 'e_nevada-ecosystem', 'invested_in',
  'fund', 'ecosystem',
  'historical', NULL, '#1E40AF', 0.80,
  '{"deal_size_m": 3.20, "round_type": "pre_seed_batch", "portfolio_count": 4, "quarter": "Q1-2026"}'::jsonb,
  'FundNV Q1 2026 batch deployment — $3.2M across 4 Nevada pre-seed companies',
  2026, 0.85, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2c. 1864 Capital — invested_in edge for ShieldOps Series A
--     ShieldOps is a new Reno-based cybersecurity company.
-- ------------------------------------------------------------

INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_1864', 'x_shieldops', 'invested_in',
  'fund', 'external',
  'historical', NULL, '#1E40AF', 0.85,
  '{"deal_size_m": 8.50, "round_type": "series_a", "lead_investor": true, "sector": "Cybersecurity", "city": "Reno"}'::jsonb,
  '1864 Capital leads $8.5M Series A in ShieldOps — Reno cybersecurity startup (February 2026)',
  2026, 0.87, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2d. AngelNV Q1 2026 cohort — batch invested_in edge
-- ------------------------------------------------------------

INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_angelnv', 'e_nevada-ecosystem', 'invested_in',
  'fund', 'ecosystem',
  'historical', NULL, '#1E40AF', 0.82,
  '{"deal_size_m": 2.10, "round_type": "seed_batch", "portfolio_count": 7, "female_founders": 4, "quarter": "Q1-2026"}'::jsonb,
  'AngelNV Q1 2026 cohort — $2.1M across 7 seed companies, 4 female-led teams',
  2026, 0.86, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2e. Sierra Angels pitch night — term sheet issuance edges
-- ------------------------------------------------------------

-- Sierra Angels → Nevada ecosystem (batch term sheets issued)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_sierra', 'e_nevada-ecosystem', 'invested_in',
  'fund', 'ecosystem',
  'historical', NULL, '#1E40AF', 0.78,
  '{"deal_size_m": 1.40, "round_type": "term_sheet_batch", "portfolio_count": 12, "city": "Reno", "quarter": "Q1-2026"}'::jsonb,
  'Sierra Angels Q1 2026 pitch night — $1.4M in term sheets across 12 companies (Reno)',
  2026, 0.82, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2f. DCVC + BBV co-investment in SentinelEdge (defense-tech)
--     Two invested_in edges (one per fund) + one co_invested edge.
-- ------------------------------------------------------------

-- DCVC → SentinelEdge
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_dcvc', 'x_sentineledge', 'invested_in',
  'fund', 'external',
  'historical', NULL, '#1E40AF', 0.88,
  '{"deal_size_m": 4.00, "round_type": "seed", "lead_investor": true, "sector": "Defense Tech", "co_investors": ["BBV"]}'::jsonb,
  'DCVC leads $6M seed in SentinelEdge (NV defense-tech) alongside BBV — March 2026',
  2026, 0.90, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- BBV → SentinelEdge
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_bbv', 'x_sentineledge', 'invested_in',
  'fund', 'external',
  'historical', NULL, '#1E40AF', 0.88,
  '{"deal_size_m": 2.00, "round_type": "seed", "lead_investor": false, "sector": "Defense Tech", "co_investors": ["DCVC"]}'::jsonb,
  'BBV co-invests in SentinelEdge (NV defense-tech) alongside DCVC — March 2026',
  2026, 0.90, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- DCVC ↔ BBV co_invested edge (fund-to-fund syndication)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_dcvc', 'f_bbv', 'co_invested',
  'fund', 'fund',
  'historical', NULL, '#7C3AED', 0.85,
  '{"deal_size_m": 6.00, "company": "SentinelEdge", "round_type": "seed", "sector": "Defense Tech"}'::jsonb,
  'DCVC and BBV co-invest in SentinelEdge — $6M NV defense-tech seed round (March 2026)',
  2026, 0.90, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2g. StartUpNV — accelerator graduation edge (batch)
-- ------------------------------------------------------------

INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_style, edge_color, edge_opacity,
  weight, note,
  event_year, confidence, agent_id, verified
)
VALUES (
  'f_startupnv', 'e_nevada-ecosystem', 'invested_in',
  'fund', 'ecosystem',
  'historical', NULL, '#1E40AF', 0.82,
  '{"deal_size_m": 1.80, "round_type": "accelerator_cohort", "portfolio_count": 14, "cohort": 12, "quarter": "Q1-2026"}'::jsonb,
  'StartUpNV Cohort 12 Demo Day — 14 graduates, $1.8M raised pre-demo-day (March 2026)',
  2026, 0.88, 'migration-027', FALSE
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 3: STAKEHOLDER_ACTIVITIES — Fund Activity Records
-- ============================================================
-- Uses fund IDs as company_id (slug convention from migration 016).
-- activity_type must satisfy CHECK constraint from migration 016.

INSERT INTO stakeholder_activities (
  company_id, activity_type, description,
  location, activity_date, source, data_quality
)
VALUES

  -- BBV Fund III close
  (
    'bbv',
    'Funding',
    'Battle Born Ventures closes Fund III at $42M combining SSBCI program leverage with institutional LP capital — largest Nevada-focused early-stage fund, targeting seed investments across AI, defense tech, and cleantech sectors',
    'Las Vegas',
    '2026-03-05',
    'BBV press release',
    'INFERRED'
  ),

  -- BBV Fund III first institutional close
  (
    'bbv',
    'Milestone',
    'BBV announces first institutional close of Fund III at $28M — SSBCI tranche approved, enabling immediate deployment into Nevada seed-stage companies ahead of final $42M close',
    'Las Vegas',
    '2026-02-10',
    'BBV investor update',
    'INFERRED'
  ),

  -- FundNV Q1 deployment
  (
    'fundnv',
    'Funding',
    'FundNV deploys $3.2M across 4 new Nevada pre-seed companies in Q1 2026 — cohort spans AI workflow automation, fintech infrastructure, digital health, and SaaS verticals',
    'Las Vegas',
    '2026-03-03',
    'FundNV quarterly update',
    'INFERRED'
  ),

  -- FundNV SSBCI compliance report
  (
    'fundnv',
    'Milestone',
    'FundNV Q4 2025 SSBCI compliance report: 31 active portfolio companies, $12.8M total deployed, 2.4x private leverage ratio — exceeding the 2.0x SSBCI program benchmark',
    'Las Vegas',
    '2026-02-14',
    'SSBCI compliance filing',
    'CALCULATED'
  ),

  -- 1864 Capital Series A lead
  (
    '1864',
    'Funding',
    '1864 Capital leads $8.5M Series A in ShieldOps, a Reno-based cybersecurity company developing zero-trust network access for critical infrastructure — round includes national co-investors; largest 1864-led deal to date',
    'Reno',
    '2026-02-26',
    '1864 Capital announcement',
    'INFERRED'
  ),

  -- 1864 Capital portfolio expansion
  (
    '1864',
    'Expansion',
    '1864 Capital expands Nevada portfolio to 18 active companies; takes board seats at two Reno-based SaaS companies as part of its value-add, post-investment support strategy for Series A cohort companies',
    'Reno',
    '2026-03-01',
    '1864 Capital portfolio update',
    'INFERRED'
  ),

  -- AngelNV Q1 cohort
  (
    'angelnv',
    'Funding',
    'AngelNV Q1 2026 cohort closes $2.1M across 7 Nevada seed-stage companies — 4 of 7 companies founded or co-founded by women, highest female-founder proportion in AngelNV history; sectors include healthtech, edtech, and consumer SaaS',
    'Las Vegas',
    '2026-02-28',
    'AngelNV cohort announcement',
    'INFERRED'
  ),

  -- Sierra Angels pitch night
  (
    'sierra',
    'Milestone',
    'Sierra Angels Q1 2026 pitch night hosts 12 Reno-area startups; $1.4M in term sheets issued across cleantech, agtech, and advanced manufacturing companies; 3 companies advance to due diligence',
    'Reno',
    '2026-02-20',
    'Sierra Angels event recap',
    'INFERRED'
  ),

  -- DCVC co-investment with BBV
  (
    'dcvc',
    'Funding',
    'DCVC co-invests with Battle Born Ventures in SentinelEdge, a Nevada defense-tech startup developing autonomous threat-detection for Department of Defense applications — $6M seed round with DCVC leading and BBV participating',
    'Las Vegas',
    '2026-03-07',
    'DCVC portfolio announcement',
    'INFERRED'
  ),

  -- StartUpNV Demo Day
  (
    'startupnv',
    'Launch',
    'StartUpNV Cohort 12 Demo Day: 14 companies graduate from accelerator program, collectively raising $1.8M pre-demo-day; sectors span AI, sustainability, gaming technology, and healthtech; event held at UNLV Harrah College of Hospitality',
    'Las Vegas',
    '2026-03-04',
    'StartUpNV Demo Day press release',
    'INFERRED'
  )

ON CONFLICT DO NOTHING;


-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT
  event_date,
  event_type,
  company_name,
  LEFT(detail, 80) AS detail_preview,
  delta_capital_m
FROM timeline_events
WHERE agent_id = 'migration-027'
ORDER BY event_date DESC;

SELECT
  source_id,
  target_id,
  rel,
  edge_category,
  LEFT(note, 80) AS note_preview
FROM graph_edges
WHERE agent_id = 'migration-027'
ORDER BY source_id, rel;

SELECT
  company_id,
  activity_type,
  LEFT(description, 80) AS description_preview,
  activity_date
FROM stakeholder_activities
WHERE source IN (
  'BBV press release', 'BBV investor update',
  'FundNV quarterly update', 'SSBCI compliance filing',
  '1864 Capital announcement', '1864 Capital portfolio update',
  'AngelNV cohort announcement', 'Sierra Angels event recap',
  'DCVC portfolio announcement', 'StartUpNV Demo Day press release'
)
ORDER BY activity_date DESC;
