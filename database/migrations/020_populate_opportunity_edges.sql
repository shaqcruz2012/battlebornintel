-- Migration 020: Populate Opportunity Edges (company × program "qualifies_for" relationships)
-- Creates graph_edges with rel='qualifies_for' connecting BBV portfolio companies to funding programs.
--
-- Matching score weights:
--   Stage  match: 40% — company.stage in program.target_stages  → 1.0, else → 0.5
--   Sector match: 40% — any overlap → 1.0, else → 0.3 (partial via NULL handling → 0.7)
--   Region match: 20% — exact match → 1.0, Nevada/Statewide in targets → 0.9, else → 0.3
--
-- Edge format:
--   source_id: 'c_<company.id>'      (matches existing graph_edges convention)
--   target_id: 'p_<program.id>'      (new namespace for program nodes)
--   rel:        'qualifies_for'
--
-- Run: psql -U bbi -h localhost -p 5433 -U bbi -d battlebornintel -f database/migrations/020_populate_opportunity_edges.sql

-- ============================================================
-- SECTION 1: Fix v_company_opportunities view to use p_<id> format
-- ============================================================
-- The view created in 018 cast target_id directly to INTEGER.
-- We recreate it using REPLACE to strip the 'p_' prefix before casting.
-- We also preserve the team_match column (NULL) for backward compatibility.
DROP VIEW IF EXISTS v_company_opportunities;
CREATE VIEW v_company_opportunities AS
SELECT
  ge.source_id                                       AS company_id,
  ge.target_id                                       AS program_id,
  p.name                                             AS program_name,
  p.program_type,
  ge.matching_score,
  (ge.matching_criteria->>'stage_match')::NUMERIC    AS stage_match,
  (ge.matching_criteria->>'sector_match')::NUMERIC   AS sector_match,
  (ge.matching_criteria->>'region_match')::NUMERIC   AS region_match,
  NULL::NUMERIC                                      AS team_match,
  ge.matching_criteria->>'estimated_award'           AS estimated_award,
  ge.matching_criteria->>'deadline'                  AS deadline,
  ge.eligible_since,
  ge.eligible_until,
  ge.created_at,
  CASE
    WHEN ge.matching_score >= 0.85 THEN 'Excellent'
    WHEN ge.matching_score >= 0.70 THEN 'Good'
    WHEN ge.matching_score >= 0.50 THEN 'Fair'
    ELSE 'Poor'
  END                                                AS match_quality
FROM graph_edges ge
JOIN programs p
  ON p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
WHERE ge.rel = 'qualifies_for'
  AND (ge.eligible_until IS NULL OR ge.eligible_until >= CURRENT_DATE)
  AND (ge.eligible_since IS NULL OR ge.eligible_since <= CURRENT_DATE);

-- ============================================================
-- SECTION 2: Remove any pre-existing opportunity edges (idempotent)
-- ============================================================
DELETE FROM graph_edges WHERE rel = 'qualifies_for';

-- ============================================================
-- SECTION 3: PL/pgSQL block — calculate and insert opportunity edges
-- ============================================================
DO $$
DECLARE
  v_company         RECORD;
  v_program         RECORD;

  -- Scoring variables
  v_stage_match     NUMERIC(3,2);
  v_sector_match    NUMERIC(3,2);
  v_region_match    NUMERIC(3,2);
  v_final_score     NUMERIC(3,2);

  -- Counters
  v_edges_created   INTEGER := 0;
  v_pairs_evaluated INTEGER := 0;
BEGIN

  -- Loop through every company
  FOR v_company IN
    SELECT id, slug, stage, sectors, region
    FROM companies
    ORDER BY id
  LOOP

    -- Loop through every program
    FOR v_program IN
      SELECT id, slug, name, target_stages, target_sectors, target_regions, end_date
      FROM programs
      ORDER BY id
    LOOP

      v_pairs_evaluated := v_pairs_evaluated + 1;

      -- --------------------------------------------------------
      -- Stage match (weight 40%)
      --   1.0  company stage is explicitly listed in program targets
      --   0.5  program has no stage restriction OR stage not listed
      -- --------------------------------------------------------
      v_stage_match := CASE
        WHEN v_program.target_stages IS NULL
          OR array_length(v_program.target_stages, 1) IS NULL
          THEN 1.0
        WHEN v_company.stage = ANY(v_program.target_stages)
          THEN 1.0
        ELSE 0.5
      END;

      -- --------------------------------------------------------
      -- Sector match (weight 40%)
      --   1.0  any company sector overlaps program target sectors
      --   0.7  program has no sector restriction (open to all)
      --   0.3  no overlap at all
      -- --------------------------------------------------------
      v_sector_match := CASE
        WHEN v_program.target_sectors IS NULL
          OR array_length(v_program.target_sectors, 1) IS NULL
          THEN 0.7
        WHEN v_company.sectors && v_program.target_sectors
          THEN 1.0
        ELSE 0.3
      END;

      -- --------------------------------------------------------
      -- Region match (weight 20%)
      --   1.0  company region is explicitly in program target regions
      --   0.9  'Nevada' or 'Statewide' is in program target regions
      --         (these mean the program covers all Nevada locations)
      --   0.3  company region not covered
      -- --------------------------------------------------------
      -- Note: all federal programs list las_vegas, reno, henderson, other
      -- which covers all 127 companies, so federal programs yield 1.0.
      -- State programs targeting only 3 NV regions exclude 'other' companies.
      v_region_match := CASE
        WHEN v_program.target_regions IS NULL
          OR array_length(v_program.target_regions, 1) IS NULL
          THEN 1.0
        WHEN v_company.region = ANY(v_program.target_regions)
          THEN 1.0
        WHEN 'Nevada'     = ANY(v_program.target_regions)
          THEN 0.9
        WHEN 'Statewide'  = ANY(v_program.target_regions)
          THEN 0.9
        ELSE 0.3
      END;

      -- --------------------------------------------------------
      -- Weighted composite score
      -- --------------------------------------------------------
      v_final_score := ROUND(
        (v_stage_match * 0.40)
        + (v_sector_match * 0.40)
        + (v_region_match * 0.20),
        2
      );

      -- --------------------------------------------------------
      -- Only insert qualifying edges (score >= 0.50)
      -- --------------------------------------------------------
      IF v_final_score >= 0.50 THEN

        INSERT INTO graph_edges (
          source_id,
          target_id,
          rel,
          source_type,
          target_type,
          matching_score,
          matching_criteria,
          eligible_since,
          eligible_until,
          confidence,
          verified,
          agent_id
        ) VALUES (
          'c_' || v_company.id,
          'p_' || v_program.id,
          'qualifies_for',
          'company',
          'program',
          v_final_score,
          jsonb_build_object(
            'stage_match',   v_stage_match,
            'sector_match',  v_sector_match,
            'region_match',  v_region_match,
            'company_stage', v_company.stage,
            'company_region',v_company.region,
            'program_slug',  v_program.slug
          ),
          CURRENT_DATE,
          v_program.end_date,
          v_final_score,
          true,
          'migration-020'
        );

        v_edges_created := v_edges_created + 1;

      END IF;

    END LOOP; -- programs

  END LOOP; -- companies

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration 020 complete';
  RAISE NOTICE '  Company × Program pairs evaluated: %', v_pairs_evaluated;
  RAISE NOTICE '  Opportunity edges created (score >= 0.50): %', v_edges_created;
  RAISE NOTICE '================================================';

END;
$$;

-- ============================================================
-- SECTION 4: Summary report
-- ============================================================

-- 4a. Overall statistics
SELECT
  COUNT(*)                               AS total_opportunity_edges,
  ROUND(AVG(matching_score), 3)          AS avg_matching_score,
  MIN(matching_score)                    AS min_score,
  MAX(matching_score)                    AS max_score
FROM graph_edges
WHERE rel = 'qualifies_for';

-- 4b. Top 10 companies by number of opportunities
SELECT
  ge.source_id                           AS company_node_id,
  c.name                                 AS company_name,
  c.stage,
  c.region,
  COUNT(*)                               AS opportunity_count,
  ROUND(AVG(ge.matching_score), 3)       AS avg_score
FROM graph_edges ge
JOIN companies c ON c.id = CAST(REPLACE(ge.source_id, 'c_', '') AS INTEGER)
WHERE ge.rel = 'qualifies_for'
GROUP BY ge.source_id, c.name, c.stage, c.region
ORDER BY opportunity_count DESC, avg_score DESC
LIMIT 10;

-- 4c. Top 10 programs by number of qualifying companies
SELECT
  ge.target_id                           AS program_node_id,
  p.name                                 AS program_name,
  p.program_type,
  COUNT(*)                               AS qualifying_companies,
  ROUND(AVG(ge.matching_score), 3)       AS avg_score
FROM graph_edges ge
JOIN programs p ON p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
WHERE ge.rel = 'qualifies_for'
GROUP BY ge.target_id, p.name, p.program_type
ORDER BY qualifying_companies DESC, avg_score DESC
LIMIT 10;

-- 4d. Match quality distribution
SELECT
  CASE
    WHEN matching_score >= 0.85 THEN 'Excellent (>= 0.85)'
    WHEN matching_score >= 0.70 THEN 'Good      (0.70–0.84)'
    WHEN matching_score >= 0.50 THEN 'Fair      (0.50–0.69)'
    ELSE                              'Poor      (< 0.50)'
  END                                    AS match_quality,
  COUNT(*)                               AS edge_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM graph_edges
WHERE rel = 'qualifies_for'
GROUP BY
  CASE
    WHEN matching_score >= 0.85 THEN 'Excellent (>= 0.85)'
    WHEN matching_score >= 0.70 THEN 'Good      (0.70–0.84)'
    WHEN matching_score >= 0.50 THEN 'Fair      (0.50–0.69)'
    ELSE                              'Poor      (< 0.50)'
  END
ORDER BY MIN(matching_score) DESC;

-- 4e. Verify v_company_opportunities view returns data
SELECT
  company_id,
  program_name,
  program_type,
  matching_score,
  stage_match,
  sector_match,
  region_match,
  match_quality,
  eligible_since,
  eligible_until
FROM v_company_opportunities
ORDER BY matching_score DESC, company_id
LIMIT 20;
