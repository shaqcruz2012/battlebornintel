-- Migration 148: Policy Opportunity Scores (RQ2 — Policy Recommendations)
-- T-GNN research: six priority policy interventions scored by impact,
-- feasibility, and expected outcomes.
-- Stores as metric_snapshots with entity_type='policy', registers features.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/148_policy_opportunity_scores.sql

BEGIN;

-- ============================================================
-- 1. Register policy-opportunity features in feature_registry
-- ============================================================
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('policy', 'priority_rank',         'numeric',     'tgnn_analysis', false, 'Policy intervention priority ranking (1=highest)'),
  ('policy', 'impact_score',          'numeric',     'tgnn_analysis', false, 'Expected ecosystem impact score (0-100)'),
  ('policy', 'feasibility_score',     'numeric',     'tgnn_analysis', false, 'Implementation feasibility score (0-100)'),
  ('policy', 'expected_connectivity', 'numeric',     'tgnn_analysis', false, 'Expected connectivity density improvement (multiplier)'),
  ('policy', 'target_cluster',        'text',        'tgnn_analysis', false, 'Target community/cluster for the intervention'),
  ('policy', 'estimated_value_m',     'numeric',     'tgnn_analysis', false, 'Estimated economic value unlocked in millions USD'),
  ('policy', 'structural_hole_ref',   'text',        'tgnn_analysis', false, 'Reference to structural hole entity_id this policy addresses'),
  ('policy', 'intervention_type',     'categorical', 'tgnn_analysis', false, 'Type of policy intervention (capacity/hub/bridge/program/inclusion/pathway)')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- ============================================================
-- 2. Policy opportunity #1: Scale accelerator capacity 3x
--    Expected: double connectivity density
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_1', 'priority_rank',         1,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_1', 'impact_score',          92,     'score',      '2026-03-01', '2026-03-30', 'month', 0.85, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_1', 'feasibility_score',     70,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_1', 'expected_connectivity',  2.0,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 3. Policy opportunity #2: Rural innovation hubs
--    First-ever rural entrepreneur connections
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_2', 'priority_rank',         2,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_2', 'impact_score',          88,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_2', 'feasibility_score',     60,     'score',      '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_2', 'expected_connectivity',  1.0,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 4. Policy opportunity #3: Cross-sector commercialization
--    Bridge CleanTech <-> AI, $5B+ cluster potential
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_3', 'priority_rank',         3,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_3', 'impact_score',          95,     'score',      '2026-03-01', '2026-03-30', 'month', 0.85, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_3', 'feasibility_score',     65,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_3', 'expected_connectivity',  1.5,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_3', 'estimated_value_m',     5000,   'usd_millions', '2026-03-01', '2026-03-30', 'month', 0.60, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 5. Policy opportunity #4: Tech licensing / spinout program
--    University -> growth-stage pipeline
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_4', 'priority_rank',         4,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_4', 'impact_score',          85,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_4', 'feasibility_score',     75,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_4', 'expected_connectivity',  1.8,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 6. Policy opportunity #5: Fund inclusive programs
--    Activate dormant network positions
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_5', 'priority_rank',         5,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_5', 'impact_score',          78,     'score',      '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_5', 'feasibility_score',     80,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_5', 'expected_connectivity',  1.3,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 7. Policy opportunity #6: Dual-use pathway
--    Defense <-> civilian, leverage Nellis/Creech
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('policy', 'gap_6', 'priority_rank',         6,      'rank',       '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_6', 'impact_score',          82,     'score',      '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_6', 'feasibility_score',     55,     'score',      '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_6', 'expected_connectivity',  1.4,   'multiplier', '2026-03-01', '2026-03-30', 'month', 0.65, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 8. Descriptive metadata for each policy gap
--    Stored as text-valued metric_snapshots for queryability
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  -- Structural hole references (encoded as gap number matching migration 147)
  ('policy', 'gap_1', 'structural_hole_ref',    1, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_2', 'structural_hole_ref',    2, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_3', 'structural_hole_ref',    3, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_4', 'structural_hole_ref',    4, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_5', 'structural_hole_ref',    5, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis'),
  ('policy', 'gap_6', 'structural_hole_ref',    6, 'ref',  '2026-03-01', '2026-03-30', 'month', 1.0, true, 'tgnn_policy_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 9. VIEW: v_policy_opportunities
--    Unified view of all policy interventions with scores
-- ============================================================
DROP VIEW IF EXISTS v_policy_opportunities;

CREATE VIEW v_policy_opportunities AS
SELECT
  p.entity_id AS policy_id,
  pr.value::INT AS priority_rank,
  imp.value AS impact_score,
  feas.value AS feasibility_score,
  conn.value AS expected_connectivity_multiplier,
  COALESCE(val.value, 0) AS estimated_value_m,
  CASE p.entity_id
    WHEN 'gap_1' THEN 'Scale accelerator capacity 3x'
    WHEN 'gap_2' THEN 'Rural innovation hubs'
    WHEN 'gap_3' THEN 'Cross-sector commercialization (CleanTech <-> AI)'
    WHEN 'gap_4' THEN 'Tech licensing / spinout program (University -> growth-stage)'
    WHEN 'gap_5' THEN 'Fund inclusive programs'
    WHEN 'gap_6' THEN 'Dual-use pathway (Defense <-> civilian)'
  END AS policy_name,
  CASE p.entity_id
    WHEN 'gap_1' THEN 'capacity'
    WHEN 'gap_2' THEN 'hub'
    WHEN 'gap_3' THEN 'bridge'
    WHEN 'gap_4' THEN 'program'
    WHEN 'gap_5' THEN 'inclusion'
    WHEN 'gap_6' THEN 'pathway'
  END AS intervention_type,
  CASE p.entity_id
    WHEN 'gap_1' THEN 'Double connectivity density via 3x accelerator scaling'
    WHEN 'gap_2' THEN 'First-ever rural entrepreneur connections outside Reno/LV'
    WHEN 'gap_3' THEN 'Bridge $5B+ CleanTech and AI clusters'
    WHEN 'gap_4' THEN 'University tech transfer to growth-stage companies'
    WHEN 'gap_5' THEN 'Activate dormant network positions for underserved founders'
    WHEN 'gap_6' THEN 'Leverage Nellis/Creech for defense-civilian technology transfer'
  END AS expected_outcome
FROM (
  SELECT DISTINCT entity_id
  FROM metric_snapshots
  WHERE entity_type = 'policy'
    AND agent_id = 'tgnn_policy_analysis'
) p
LEFT JOIN metric_snapshots pr   ON pr.entity_type = 'policy'   AND pr.entity_id = p.entity_id   AND pr.metric_name = 'priority_rank'
LEFT JOIN metric_snapshots imp  ON imp.entity_type = 'policy'  AND imp.entity_id = p.entity_id  AND imp.metric_name = 'impact_score'
LEFT JOIN metric_snapshots feas ON feas.entity_type = 'policy' AND feas.entity_id = p.entity_id AND feas.metric_name = 'feasibility_score'
LEFT JOIN metric_snapshots conn ON conn.entity_type = 'policy' AND conn.entity_id = p.entity_id AND conn.metric_name = 'expected_connectivity'
LEFT JOIN metric_snapshots val  ON val.entity_type = 'policy'  AND val.entity_id = p.entity_id  AND val.metric_name = 'estimated_value_m';

COMMENT ON VIEW v_policy_opportunities IS 'T-GNN RQ2: Six priority policy interventions ranked by impact, feasibility, and expected connectivity improvement';

COMMIT;
