-- Migration 018: Add opportunity edge tracking for "qualifies_for" relationships
-- This enables companies to be matched against government funding programs (SBIR/STTR, grants, loans, etc.)
-- Run: psql -U bbi -d battlebornintel -f database/migrations/018_add_opportunity_edges.sql

-- ============================================================
-- EXTEND graph_edges FOR OPPORTUNITY MATCHING
-- ============================================================
ALTER TABLE graph_edges 
  ADD COLUMN IF NOT EXISTS matching_score NUMERIC(3,2) CHECK (matching_score BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS matching_criteria JSONB,
  ADD COLUMN IF NOT EXISTS eligible_since DATE,
  ADD COLUMN IF NOT EXISTS eligible_until DATE;

-- Index for efficient opportunity queries
CREATE INDEX IF NOT EXISTS idx_edges_opportunity_edges 
  ON graph_edges(source_id, target_id) 
  WHERE rel = 'qualifies_for';

CREATE INDEX IF NOT EXISTS idx_edges_opportunity_score 
  ON graph_edges(matching_score DESC) 
  WHERE rel = 'qualifies_for';

CREATE INDEX IF NOT EXISTS idx_edges_opportunity_dates 
  ON graph_edges(eligible_since, eligible_until) 
  WHERE rel = 'qualifies_for';

-- ============================================================
-- CREATE OPPORTUNITY MATCHING VIEW
-- ============================================================
-- This view shows all opportunities a company qualifies for
CREATE OR REPLACE VIEW v_company_opportunities AS
SELECT 
  ge.source_id AS company_id,
  ge.target_id AS program_id,
  p.name AS program_name,
  p.program_type,
  ge.matching_score,
  (ge.matching_criteria->>'stage_match')::NUMERIC AS stage_match,
  (ge.matching_criteria->>'sector_match')::NUMERIC AS sector_match,
  (ge.matching_criteria->>'region_match')::NUMERIC AS region_match,
  (ge.matching_criteria->>'team_match')::NUMERIC AS team_match,
  ge.matching_criteria->>'estimated_award' AS estimated_award,
  ge.matching_criteria->>'deadline' AS deadline,
  ge.eligible_since,
  ge.eligible_until,
  ge.created_at,
  CASE 
    WHEN ge.matching_score >= 0.85 THEN 'Excellent'
    WHEN ge.matching_score >= 0.70 THEN 'Good'
    WHEN ge.matching_score >= 0.50 THEN 'Fair'
    ELSE 'Poor'
  END AS match_quality
FROM graph_edges ge
JOIN programs p ON CAST(ge.target_id AS INTEGER) = p.id
WHERE ge.rel = 'qualifies_for'
  AND (ge.eligible_until IS NULL OR ge.eligible_until >= CURRENT_DATE)
  AND (ge.eligible_since IS NULL OR ge.eligible_since <= CURRENT_DATE);

-- ============================================================
-- CREATE COMPANY OPPORTUNITY SCORING FUNCTION
-- ============================================================
-- Calculate matching score based on company attributes vs program requirements
CREATE OR REPLACE FUNCTION calculate_opportunity_match(
  p_company_id VARCHAR,
  p_program_id INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_company RECORD;
  v_program RECORD;
  v_stage_match NUMERIC;
  v_sector_match NUMERIC;
  v_region_match NUMERIC;
  v_final_score NUMERIC;
BEGIN
  -- Get company details
  SELECT stage, sectors, region INTO v_company
  FROM companies WHERE slug = p_company_id;
  
  -- Get program details
  SELECT target_stages, target_sectors, target_regions, budget_m INTO v_program
  FROM programs WHERE id = p_program_id;
  
  -- Calculate stage match (1.0 if stage in program targets, else 0.5)
  v_stage_match := CASE 
    WHEN v_program.target_stages IS NULL OR array_length(v_program.target_stages, 1) IS NULL THEN 1.0
    WHEN v_company.stage = ANY(v_program.target_stages) THEN 1.0
    ELSE 0.5
  END;
  
  -- Calculate sector match (0.5-1.0 based on overlap)
  v_sector_match := CASE 
    WHEN v_program.target_sectors IS NULL OR array_length(v_program.target_sectors, 1) IS NULL THEN 0.8
    WHEN v_company.sectors && v_program.target_sectors THEN 1.0
    ELSE 0.4
  END;
  
  -- Calculate region match (1.0 for same region, 0.7 for Nevada neighbor, 0.3 for outside)
  v_region_match := CASE 
    WHEN v_program.target_regions IS NULL OR array_length(v_program.target_regions, 1) IS NULL THEN 1.0
    WHEN v_company.region = ANY(v_program.target_regions) THEN 1.0
    WHEN 'Nevada' = ANY(v_program.target_regions) THEN 0.9
    WHEN 'Statewide' = ANY(v_program.target_regions) THEN 0.85
    ELSE 0.3
  END;
  
  -- Calculate final score (weighted average)
  v_final_score := (v_stage_match * 0.40 + v_sector_match * 0.40 + v_region_match * 0.20);
  
  RETURN jsonb_build_object(
    'stage_match', v_stage_match,
    'sector_match', v_sector_match,
    'region_match', v_region_match,
    'overall_score', v_final_score
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- EXAMPLE: SEED NSF SBIR/STTR OPPORTUNITIES
-- ============================================================
-- Insert government agencies (NSF, DOE, SBA, DARPA, NIH)
-- Programs will be added via separate data migration

INSERT INTO gov_agencies (slug, name, jurisdiction_level, programs_count, verified, confidence)
VALUES 
  ('nsf', 'National Science Foundation', 'federal', 3, true, 1.0),
  ('doe', 'U.S. Department of Energy', 'federal', 2, true, 1.0),
  ('sba-nv', 'U.S. Small Business Administration - Nevada', 'federal', 4, true, 1.0),
  ('darpa', 'Defense Advanced Research Projects Agency', 'federal', 2, true, 1.0),
  ('nih', 'National Institutes of Health', 'federal', 3, true, 1.0)
ON CONFLICT (slug) DO NOTHING;

