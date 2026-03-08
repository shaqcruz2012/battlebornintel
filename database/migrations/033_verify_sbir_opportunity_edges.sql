-- Migration 033: Verify and fix SBIR/STTR opportunity edge confidence and sourcing
-- Audits qualifies_for and fund_opportunity edges for completeness, corrects
-- edge_category, updates confidence scores by program type/agency, adds source
-- attribution columns, and removes orphaned edges.
--
-- Run: psql -U bbi -h localhost -p 5433 -d battlebornintel -f database/migrations/033_verify_sbir_opportunity_edges.sql

-- ============================================================
-- SECTION 1: AUDIT — qualifies_for edge completeness
-- ============================================================
-- 1a. Overall edge field completeness
DO $$
DECLARE
  v_total            INTEGER;
  v_no_score         INTEGER;
  v_wrong_category   INTEGER;
  v_no_color         INTEGER;
  v_no_style         INTEGER;
  v_no_opacity       INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM graph_edges WHERE rel = 'qualifies_for';

  SELECT COUNT(*) INTO v_no_score
  FROM graph_edges WHERE rel = 'qualifies_for' AND matching_score IS NULL;

  SELECT COUNT(*) INTO v_wrong_category
  FROM graph_edges WHERE rel = 'qualifies_for'
    AND (edge_category IS NULL OR edge_category <> 'opportunity');

  SELECT COUNT(*) INTO v_no_color
  FROM graph_edges WHERE rel = 'qualifies_for' AND edge_color IS NULL;

  SELECT COUNT(*) INTO v_no_style
  FROM graph_edges WHERE rel = 'qualifies_for' AND edge_style IS NULL;

  SELECT COUNT(*) INTO v_no_opacity
  FROM graph_edges WHERE rel = 'qualifies_for' AND edge_opacity IS NULL;

  RAISE NOTICE '=== 033 AUDIT: qualifies_for edges ===';
  RAISE NOTICE '  Total qualifies_for edges      : %', v_total;
  RAISE NOTICE '  Missing matching_score          : %', v_no_score;
  RAISE NOTICE '  Wrong/missing edge_category     : %', v_wrong_category;
  RAISE NOTICE '  Missing edge_color              : %', v_no_color;
  RAISE NOTICE '  Missing edge_style              : %', v_no_style;
  RAISE NOTICE '  Missing edge_opacity            : %', v_no_opacity;
END;
$$;

-- 1b. Matching score distribution
SELECT
  CASE
    WHEN matching_score >= 0.85 THEN 'Excellent (>= 0.85)'
    WHEN matching_score >= 0.70 THEN 'Good      (0.70-0.84)'
    WHEN matching_score >= 0.50 THEN 'Fair      (0.50-0.69)'
    ELSE                              'Poor      (< 0.50)'
  END                                    AS score_band,
  COUNT(*)                               AS edge_count,
  ROUND(MIN(matching_score), 2)          AS min_score,
  ROUND(MAX(matching_score), 2)          AS max_score,
  ROUND(AVG(matching_score), 3)          AS avg_score,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct_of_total
FROM graph_edges
WHERE rel = 'qualifies_for'
GROUP BY
  CASE
    WHEN matching_score >= 0.85 THEN 'Excellent (>= 0.85)'
    WHEN matching_score >= 0.70 THEN 'Good      (0.70-0.84)'
    WHEN matching_score >= 0.50 THEN 'Fair      (0.50-0.69)'
    ELSE                              'Poor      (< 0.50)'
  END
ORDER BY MIN(matching_score) DESC;

-- ============================================================
-- SECTION 2: FIX edge_category
-- Ensure all qualifies_for and fund_opportunity edges have
-- edge_category = 'opportunity'.
-- ============================================================
UPDATE graph_edges
SET edge_category = 'opportunity'
WHERE rel IN ('qualifies_for', 'fund_opportunity')
  AND (edge_category IS NULL OR edge_category <> 'opportunity');

-- ============================================================
-- SECTION 3: ADD source attribution columns
-- source_name and source_url do not yet exist on graph_edges.
-- Add them idempotently before populating.
-- ============================================================
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS source_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS source_url  TEXT;

-- ============================================================
-- SECTION 4: UPDATE confidence scores for SBIR/STTR edges
-- Strategy: join edges back to programs via the 'p_<id>' target_id
-- convention, then categorise by program slug to apply the
-- correct confidence tier.
--
-- Tiers (by program type / agency):
--   DOD (DARPA / DOD) SBIR/STTR  → 0.90  (well-defined criteria)
--   DOE SBIR/STTR                 → 0.90
--   NIH SBIR/STTR                 → 0.90
--   SBIR Phase I (matching_score >= 0.70)  → 0.88
--   SBIR Phase II                 → 0.82
--   STTR (any agency)             → 0.85
-- ============================================================

-- 4a. DOD programs (DARPA + dod agency) — confidence 0.90
UPDATE graph_edges ge
SET    confidence = 0.90
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  (p.slug LIKE 'darpa-%' OR p.slug LIKE 'dod-%')
  AND  (p.slug LIKE '%-sbir-%' OR p.slug LIKE '%-sttr-%');

-- 4b. DOE programs — confidence 0.90
UPDATE graph_edges ge
SET    confidence = 0.90
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE 'doe-%'
  AND  (p.slug LIKE '%-sbir-%' OR p.slug LIKE '%-sttr-%');

-- 4c. NIH programs — confidence 0.90
UPDATE graph_edges ge
SET    confidence = 0.90
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE 'nih-%'
  AND  (p.slug LIKE '%-sbir-%' OR p.slug LIKE '%-sttr-%');

-- 4d. STTR programs (any remaining agency not already handled above) — 0.85
-- Applied before the SBIR-generic pass so STTR takes precedence.
UPDATE graph_edges ge
SET    confidence = 0.85
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE '%-sttr-%'
  AND  ge.confidence IS DISTINCT FROM 0.90;  -- skip already-updated DOD/DOE/NIH STTR

-- 4e. SBIR Phase I (general, matching_score >= 0.70) — 0.88
-- Excludes rows already set to 0.90 by agency-specific passes.
UPDATE graph_edges ge
SET    confidence = 0.88
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE '%-sbir-phase-i'
  AND  ge.matching_score >= 0.70
  AND  ge.confidence IS DISTINCT FROM 0.90;

-- 4f. SBIR Phase II (general) — 0.82
-- Excludes rows already set to 0.90 by agency-specific passes.
UPDATE graph_edges ge
SET    confidence = 0.82
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE '%-sbir-phase-ii'
  AND  ge.confidence IS DISTINCT FROM 0.90;

-- ============================================================
-- SECTION 5: SOURCE ATTRIBUTION for SBIR and STTR edges
-- ============================================================

-- 5a. SBIR edges → SBIR.gov
UPDATE graph_edges ge
SET    source_name = 'SBIR.gov',
       source_url  = 'https://www.sbir.gov'
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE '%-sbir-%';

-- 5b. STTR edges → STTR.gov (SBIR.gov/sttr)
-- Overwrite any SBIR attribution on STTR programs
UPDATE graph_edges ge
SET    source_name = 'STTR.gov',
       source_url  = 'https://www.sbir.gov/sttr'
FROM   programs p
WHERE  ge.rel = 'qualifies_for'
  AND  ge.target_id = 'p_' || p.id
  AND  p.slug LIKE '%-sttr-%';

-- ============================================================
-- SECTION 6: VERIFY and FIX visual metadata
-- All opportunity edges must have:
--   edge_style   = '6,4'  (dashed)
--   edge_category = 'opportunity'  (already fixed in section 2)
--   edge_opacity >= 0.50
--   edge_color NOT NULL
-- ============================================================

-- 6a. Fill missing edge_style for any opportunity edge lacking it
UPDATE graph_edges
SET    edge_style = '6,4'
WHERE  edge_category = 'opportunity'
  AND  (edge_style IS NULL OR edge_style <> '6,4');

-- 6b. Fill missing edge_color based on matching_score tiers
UPDATE graph_edges
SET    edge_color = CASE
         WHEN matching_score >= 0.85 THEN '#22C55E'   -- green: excellent
         WHEN matching_score >= 0.70 THEN '#F59E0B'   -- amber: good
         WHEN matching_score >= 0.50 THEN '#9CA3AF'   -- grey:  fair
         ELSE                              '#6B7280'   -- dim:   poor
       END
WHERE  edge_category = 'opportunity'
  AND  edge_color IS NULL;

-- 6c. Fill missing or sub-threshold edge_opacity
-- Ensure minimum 0.50 for all opportunity edges; also backfill NULLs.
UPDATE graph_edges
SET    edge_opacity = CASE
         WHEN matching_score >= 0.85 THEN 0.85
         WHEN matching_score >= 0.70 THEN 0.70
         WHEN matching_score >= 0.50 THEN 0.55
         ELSE                              0.50       -- floor at 0.50
       END
WHERE  edge_category = 'opportunity'
  AND  (edge_opacity IS NULL OR edge_opacity < 0.50);

-- ============================================================
-- SECTION 7: DELETE orphaned opportunity edges
-- Remove qualifies_for edges whose source_id does not resolve
-- to a valid company node (c_<id>) or whose target_id does not
-- resolve to a valid program node (p_<id>).
-- Also remove fund_opportunity edges with dangling fund or
-- company references.
-- ============================================================

-- 7a. qualifies_for edges with non-existent company source
DELETE FROM graph_edges
WHERE  rel = 'qualifies_for'
  AND  source_type = 'company'
  AND  NOT EXISTS (
         SELECT 1
         FROM   companies c
         WHERE  'c_' || c.id = graph_edges.source_id
       );

-- 7b. qualifies_for edges with non-existent program target
DELETE FROM graph_edges
WHERE  rel = 'qualifies_for'
  AND  target_type = 'program'
  AND  NOT EXISTS (
         SELECT 1
         FROM   programs p
         WHERE  'p_' || p.id = graph_edges.target_id
       );

-- 7c. qualifies_for edges whose source_id has an unrecognised
--     prefix (neither c_ nor f_ nor x_) — catch-all safety net
DELETE FROM graph_edges
WHERE  rel = 'qualifies_for'
  AND  source_id NOT LIKE 'c_%'
  AND  source_id NOT LIKE 'f_%'
  AND  source_id NOT LIKE 'x_%';

-- 7d. fund_opportunity edges with non-existent fund source
DELETE FROM graph_edges
WHERE  rel = 'fund_opportunity'
  AND  source_type = 'fund'
  AND  NOT EXISTS (
         SELECT 1
         FROM   funds f
         WHERE  'f_' || f.id = graph_edges.source_id
       );

-- 7e. fund_opportunity edges with non-existent company target
DELETE FROM graph_edges
WHERE  rel = 'fund_opportunity'
  AND  target_type = 'company'
  AND  NOT EXISTS (
         SELECT 1
         FROM   companies c
         WHERE  'c_' || c.id = graph_edges.target_id
       );

-- ============================================================
-- SECTION 8: POST-FIX VERIFICATION REPORT
-- ============================================================
DO $$
DECLARE
  v_total_opp        INTEGER;
  v_sbir_edges       INTEGER;
  v_sttr_edges       INTEGER;
  v_no_color         INTEGER;
  v_no_style         INTEGER;
  v_low_opacity      INTEGER;
  v_wrong_category   INTEGER;
  v_no_source        INTEGER;
  v_no_confidence    INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_opp
  FROM graph_edges WHERE rel IN ('qualifies_for', 'fund_opportunity');

  SELECT COUNT(*) INTO v_sbir_edges
  FROM graph_edges ge
  JOIN programs p ON 'p_' || p.id = ge.target_id
  WHERE ge.rel = 'qualifies_for' AND p.slug LIKE '%-sbir-%';

  SELECT COUNT(*) INTO v_sttr_edges
  FROM graph_edges ge
  JOIN programs p ON 'p_' || p.id = ge.target_id
  WHERE ge.rel = 'qualifies_for' AND p.slug LIKE '%-sttr-%';

  SELECT COUNT(*) INTO v_no_color
  FROM graph_edges
  WHERE edge_category = 'opportunity' AND edge_color IS NULL;

  SELECT COUNT(*) INTO v_no_style
  FROM graph_edges
  WHERE edge_category = 'opportunity' AND (edge_style IS NULL OR edge_style <> '6,4');

  SELECT COUNT(*) INTO v_low_opacity
  FROM graph_edges
  WHERE edge_category = 'opportunity' AND (edge_opacity IS NULL OR edge_opacity < 0.50);

  SELECT COUNT(*) INTO v_wrong_category
  FROM graph_edges
  WHERE rel IN ('qualifies_for', 'fund_opportunity')
    AND (edge_category IS NULL OR edge_category <> 'opportunity');

  SELECT COUNT(*) INTO v_no_source
  FROM graph_edges ge
  JOIN programs p ON 'p_' || p.id = ge.target_id
  WHERE ge.rel = 'qualifies_for'
    AND (p.slug LIKE '%-sbir-%' OR p.slug LIKE '%-sttr-%')
    AND ge.source_name IS NULL;

  SELECT COUNT(*) INTO v_no_confidence
  FROM graph_edges
  WHERE rel = 'qualifies_for' AND confidence IS NULL;

  RAISE NOTICE '=== 033 POST-FIX VERIFICATION ===';
  RAISE NOTICE '  Total opportunity edges (qualifies_for + fund_opportunity): %', v_total_opp;
  RAISE NOTICE '  SBIR qualifies_for edges                                  : %', v_sbir_edges;
  RAISE NOTICE '  STTR qualifies_for edges                                  : %', v_sttr_edges;
  RAISE NOTICE '  Remaining missing edge_color                              : %', v_no_color;
  RAISE NOTICE '  Remaining wrong/missing edge_style                        : %', v_no_style;
  RAISE NOTICE '  Remaining edge_opacity < 0.50                             : %', v_low_opacity;
  RAISE NOTICE '  Remaining wrong/missing edge_category                     : %', v_wrong_category;
  RAISE NOTICE '  SBIR/STTR edges still missing source_name                 : %', v_no_source;
  RAISE NOTICE '  qualifies_for edges still missing confidence              : %', v_no_confidence;
  RAISE NOTICE '  All values above should be 0.';
END;
$$;

-- Confidence distribution breakdown for SBIR/STTR edges post-fix
SELECT
  p.slug                                 AS program_slug,
  CASE
    WHEN p.slug LIKE '%-sttr-%'          THEN 'STTR'
    WHEN p.slug LIKE '%-sbir-phase-i'    THEN 'SBIR Phase I'
    WHEN p.slug LIKE '%-sbir-phase-ii'   THEN 'SBIR Phase II'
    ELSE                                       'Other SBIR'
  END                                    AS program_class,
  ge.confidence,
  ge.source_name,
  COUNT(*)                               AS edge_count
FROM graph_edges ge
JOIN programs p ON 'p_' || p.id = ge.target_id
WHERE ge.rel = 'qualifies_for'
  AND (p.slug LIKE '%-sbir-%' OR p.slug LIKE '%-sttr-%')
GROUP BY p.slug, program_class, ge.confidence, ge.source_name
ORDER BY p.slug, ge.confidence DESC;
