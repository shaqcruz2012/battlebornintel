-- Migration 021: Edge Visual Metadata + Fund Opportunity Schema
-- Adds visual distinction columns to graph_edges (dashed vs solid, color by score).
-- Extends funds table with check size range for capital-based matching.

-- ============================================================
-- SECTION 1: Edge Category + Visual Metadata
-- ============================================================

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS edge_category VARCHAR(20)
    DEFAULT 'historical'
    CHECK (edge_category IN ('historical', 'opportunity', 'projected'));

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS edge_style VARCHAR(20);

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS edge_color VARCHAR(9);

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS edge_opacity NUMERIC(3,2)
    CHECK (edge_opacity IS NULL OR edge_opacity BETWEEN 0 AND 1);

-- ============================================================
-- SECTION 2: Backfill edge_category for existing edges
-- ============================================================

UPDATE graph_edges
SET edge_category = 'opportunity',
    edge_style = '6,4',
    edge_color = CASE
      WHEN matching_score >= 0.85 THEN '#22C55E'
      WHEN matching_score >= 0.70 THEN '#F59E0B'
      WHEN matching_score >= 0.50 THEN '#9CA3AF'
      ELSE '#6B7280'
    END,
    edge_opacity = CASE
      WHEN matching_score >= 0.85 THEN 0.85
      WHEN matching_score >= 0.70 THEN 0.70
      WHEN matching_score >= 0.50 THEN 0.55
      ELSE 0.40
    END
WHERE rel = 'qualifies_for'
  AND edge_category IS DISTINCT FROM 'opportunity';

UPDATE graph_edges
SET edge_category = 'historical'
WHERE rel != 'qualifies_for'
  AND (edge_category IS NULL OR edge_category = 'historical');

-- ============================================================
-- SECTION 3: Indexes for edge category filtering
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_edges_category
  ON graph_edges(edge_category);

CREATE INDEX IF NOT EXISTS idx_edges_category_rel
  ON graph_edges(edge_category, rel);

CREATE INDEX IF NOT EXISTS idx_edges_opportunity_category
  ON graph_edges(source_id, target_id, matching_score DESC)
  WHERE edge_category = 'opportunity';

-- ============================================================
-- SECTION 4: Extend funds for capital matching
-- ============================================================

ALTER TABLE funds
  ADD COLUMN IF NOT EXISTS check_size_min_m NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS check_size_max_m NUMERIC(10,2);

-- Backfill fund investment parameters
UPDATE funds SET stage_focus = '{seed,series_a,series_b}',
  target_sectors = '{AI,Cybersecurity,Defense,Cleantech,Fintech,Healthcare,IoT,SaaS,Biotech,Energy,Manufacturing}',
  check_size_min_m = 0.05, check_size_max_m = 1.0
WHERE id = 'bbv' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{pre_seed,seed}',
  target_sectors = '{AI,Fintech,Healthcare,IoT,SaaS,Consumer,Cybersecurity}',
  check_size_min_m = 0.03, check_size_max_m = 0.24
WHERE id = 'fundnv' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{seed,series_a}',
  target_sectors = '{AI,Fintech,SaaS,Healthcare,Cleantech,IoT}',
  check_size_min_m = 0.10, check_size_max_m = 0.50
WHERE id = '1864' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{pre_seed,seed}',
  target_sectors = '{AI,Fintech,Healthcare,IoT,Consumer,SaaS}',
  check_size_min_m = 0.05, check_size_max_m = 0.20
WHERE id = 'angelnv' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{pre_seed,seed}',
  target_sectors = '{AI,Cleantech,IoT,Healthcare,SaaS,Consumer}',
  check_size_min_m = 0.025, check_size_max_m = 0.15
WHERE id = 'sierra' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{seed,series_a,series_b}',
  target_sectors = '{AI,Cleantech,Energy,Materials Science,Manufacturing}',
  check_size_min_m = 1.0, check_size_max_m = 15.0
WHERE id = 'dcvc' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{series_a,series_b,growth}',
  target_sectors = '{Consumer,Fintech,SaaS,Healthcare}',
  check_size_min_m = 5.0, check_size_max_m = 50.0
WHERE id = 'stripes' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

UPDATE funds SET stage_focus = '{pre_seed,seed}',
  target_sectors = '{AI,Fintech,Healthcare,IoT,SaaS,Consumer,Cleantech,Gaming}',
  check_size_min_m = 0.01, check_size_max_m = 0.10
WHERE id = 'startupnv' AND (stage_focus IS NULL OR array_length(stage_focus, 1) IS NULL);

-- ============================================================
-- SECTION 5: Fund opportunity matching function
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_fund_opportunity_match(
  p_fund_id   VARCHAR,
  p_company_id INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_fund    RECORD;
  v_company RECORD;
  v_stage    NUMERIC(4,3);
  v_sector   NUMERIC(4,3);
  v_capital  NUMERIC(4,3);
  v_check    NUMERIC(4,3);
  v_geo      NUMERIC(4,3);
  v_final    NUMERIC(4,3);
  v_dry      NUMERIC(12,2);
  v_max_dry  NUMERIC(12,2);
  v_overlap  INTEGER;
  v_min_len  INTEGER;
BEGIN
  SELECT id, name, fund_type, allocated_m, deployed_m,
         COALESCE(stage_focus, '{}') AS stage_focus,
         COALESCE(target_sectors, '{}') AS target_sectors,
         check_size_min_m, check_size_max_m
  INTO v_fund FROM funds WHERE id = p_fund_id;
  IF v_fund IS NULL THEN RETURN '{"error":"fund_not_found"}'::jsonb; END IF;

  SELECT id, name, stage, COALESCE(sectors, '{}') AS sectors, funding_m, city, region
  INTO v_company FROM companies WHERE id = p_company_id;
  IF v_company IS NULL THEN RETURN '{"error":"company_not_found"}'::jsonb; END IF;

  -- Stage alignment (30%)
  v_stage := CASE
    WHEN array_length(v_fund.stage_focus, 1) IS NULL THEN 0.7
    WHEN v_company.stage = ANY(v_fund.stage_focus) THEN 1.0
    WHEN (v_company.stage = 'pre_seed' AND 'seed' = ANY(v_fund.stage_focus))
      OR (v_company.stage = 'seed' AND ('pre_seed' = ANY(v_fund.stage_focus) OR 'series_a' = ANY(v_fund.stage_focus)))
      OR (v_company.stage = 'series_a' AND ('seed' = ANY(v_fund.stage_focus) OR 'series_b' = ANY(v_fund.stage_focus)))
      OR (v_company.stage = 'series_b' AND ('series_a' = ANY(v_fund.stage_focus) OR 'series_c_plus' = ANY(v_fund.stage_focus)))
      OR (v_company.stage = 'growth' AND 'series_b' = ANY(v_fund.stage_focus))
      THEN 0.4
    ELSE 0.1
  END;

  -- Sector alignment (25%) - Szymkiewicz-Simpson coefficient
  IF array_length(v_fund.target_sectors, 1) IS NULL THEN v_sector := 0.6;
  ELSIF array_length(v_company.sectors, 1) IS NULL THEN v_sector := 0.5;
  ELSE
    SELECT COUNT(*) INTO v_overlap FROM (
      SELECT UNNEST(v_company.sectors) INTERSECT SELECT UNNEST(v_fund.target_sectors)
    ) x;
    v_min_len := LEAST(array_length(v_company.sectors, 1), array_length(v_fund.target_sectors, 1));
    IF v_min_len = 0 THEN v_sector := 0.3;
    ELSE v_sector := GREATEST(0.15, LEAST(1.0, v_overlap::NUMERIC / v_min_len)); END IF;
  END IF;

  -- Deployable capital (20%)
  IF v_fund.allocated_m IS NULL OR v_fund.allocated_m <= 0 THEN v_capital := 0.6;
  ELSE
    v_dry := GREATEST(0, v_fund.allocated_m - COALESCE(v_fund.deployed_m, 0));
    SELECT MAX(GREATEST(0, f.allocated_m - COALESCE(f.deployed_m, 0)))
    INTO v_max_dry FROM funds f WHERE f.allocated_m IS NOT NULL AND f.allocated_m > 0;
    IF v_max_dry IS NULL OR v_max_dry = 0 THEN v_capital := 0.5;
    ELSE v_capital := 0.1 + 0.9 * (v_dry / v_max_dry); END IF;
  END IF;

  -- Check size fit (15%)
  v_check := CASE
    WHEN v_fund.check_size_min_m IS NULL AND v_fund.check_size_max_m IS NULL THEN 0.6
    WHEN v_company.stage = 'pre_seed' AND COALESCE(v_fund.check_size_max_m, 0) >= 0.1 THEN 1.0
    WHEN v_company.stage = 'seed' AND COALESCE(v_fund.check_size_max_m, 0) >= 0.5 THEN 1.0
    WHEN v_company.stage = 'series_a' AND COALESCE(v_fund.check_size_max_m, 0) >= 5.0 THEN 1.0
    WHEN v_company.stage = 'series_b' AND COALESCE(v_fund.check_size_max_m, 0) >= 15.0 THEN 1.0
    WHEN v_company.stage IN ('series_c_plus', 'growth') AND COALESCE(v_fund.check_size_max_m, 0) >= 25.0 THEN 0.8
    WHEN COALESCE(v_fund.check_size_max_m, 0) >= 1.0 THEN 0.5
    ELSE 0.2
  END;

  -- Geographic proximity (10%)
  v_geo := CASE
    WHEN v_fund.fund_type IN ('SSBCI', 'Angel', 'Accelerator') THEN 1.0
    WHEN v_fund.fund_type IN ('Deep Tech VC', 'Growth VC') THEN 0.7
    ELSE 0.5
  END;

  -- Weighted composite
  v_final := ROUND(
    (v_stage * 0.30) + (v_sector * 0.25) + (v_capital * 0.20) + (v_check * 0.15) + (v_geo * 0.10), 3
  );

  RETURN jsonb_build_object(
    'overall_score', v_final,
    'stage_alignment', ROUND(v_stage, 3),
    'sector_alignment', ROUND(v_sector, 3),
    'deployable_capital', ROUND(v_capital, 3),
    'check_size_fit', ROUND(v_check, 3),
    'geographic_prox', ROUND(v_geo, 3),
    'fund_name', v_fund.name,
    'fund_type', v_fund.fund_type,
    'company_name', v_company.name,
    'company_stage', v_company.stage
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- SECTION 6: Updated opportunity view (programs + funds)
-- ============================================================

DROP VIEW IF EXISTS v_company_opportunities;
CREATE VIEW v_company_opportunities AS
  SELECT ge.source_id AS company_id, ge.target_id, p.name AS target_name,
    'program' AS target_type, p.program_type AS sub_type,
    ge.matching_score, ge.matching_criteria, ge.edge_category,
    ge.edge_style, ge.edge_color, ge.eligible_since, ge.eligible_until,
    CASE WHEN ge.matching_score >= 0.85 THEN 'Excellent'
         WHEN ge.matching_score >= 0.70 THEN 'Good'
         WHEN ge.matching_score >= 0.50 THEN 'Fair'
         ELSE 'Poor' END AS match_quality
  FROM graph_edges ge
  JOIN programs p ON p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
  WHERE ge.rel = 'qualifies_for' AND ge.edge_category = 'opportunity'
  UNION ALL
  SELECT ge.target_id AS company_id, ge.source_id AS target_id, f.name AS target_name,
    'fund' AS target_type, f.fund_type AS sub_type,
    ge.matching_score, ge.matching_criteria, ge.edge_category,
    ge.edge_style, ge.edge_color, ge.eligible_since, ge.eligible_until,
    CASE WHEN ge.matching_score >= 0.80 THEN 'Excellent'
         WHEN ge.matching_score >= 0.65 THEN 'Good'
         WHEN ge.matching_score >= 0.50 THEN 'Fair'
         ELSE 'Marginal' END AS match_quality
  FROM graph_edges ge
  JOIN funds f ON f.id = REPLACE(ge.source_id, 'f_', '')
  WHERE ge.rel = 'fund_opportunity' AND ge.edge_category = 'opportunity';

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'graph_edges' AND column_name IN ('edge_category', 'edge_style', 'edge_color', 'edge_opacity');

SELECT edge_category, COUNT(*) FROM graph_edges GROUP BY edge_category;
