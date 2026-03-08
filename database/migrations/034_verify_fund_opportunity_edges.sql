-- Migration 034: Verify and Fix Fund Opportunity Edges
-- Audits fund_opportunity edges created by migration 022, corrects color/opacity
-- mapping, attribution, confidence values, quality labels, and removes sub-threshold
-- edges.
--
-- Source: migration 022 set incorrect colors (#22C55E/#16A34A/#F59E0B/#9CA3AF),
--         verified = true, confidence = matching_score, and no source attribution.
-- Target spec:
--   Colors   : #4ADE80 (>=0.80), #86EFAC (>=0.65), #FCD34D (>=0.50), #F87171 (<0.50)
--   Opacity  : 0.85 (>=0.75), 0.70 (>=0.60), 0.55 (>=0.45), 0.40 (<0.45)
--   Source   : 'BBI Capital Matching Algorithm v1'
--   Verified : false (algorithmic, not confirmed investments)
--   Confidence: matching_score * 0.9
--   Quality  : weight merged with quality label
--   Threshold: DELETE edges with matching_score < 0.40

-- ============================================================
-- SECTION 1: Audit — counts, score distribution, null checks
-- ============================================================

-- Total fund_opportunity edges and per-fund breakdown
SELECT
  f.id                           AS fund_id,
  f.name                         AS fund_name,
  f.fund_type,
  COUNT(ge.id)                   AS edge_count,
  MIN(ge.matching_score)         AS score_min,
  MAX(ge.matching_score)         AS score_max,
  ROUND(AVG(ge.matching_score), 3) AS score_avg,
  COUNT(*) FILTER (WHERE ge.matching_score IS NULL) AS missing_score,
  COUNT(*) FILTER (WHERE ge.edge_color IS NULL)     AS missing_color,
  COUNT(*) FILTER (WHERE ge.edge_opacity IS NULL)   AS missing_opacity
FROM graph_edges ge
JOIN funds f ON f.id = REPLACE(ge.source_id, 'f_', '')
WHERE ge.rel = 'fund_opportunity'
GROUP BY f.id, f.name, f.fund_type
ORDER BY edge_count DESC;

-- Score band distribution
SELECT
  CASE
    WHEN matching_score >= 0.80 THEN 'excellent (>=0.80)'
    WHEN matching_score >= 0.65 THEN 'good     (>=0.65)'
    WHEN matching_score >= 0.50 THEN 'fair     (>=0.50)'
    WHEN matching_score >= 0.40 THEN 'weak     (>=0.40)'
    ELSE                              'sub-threshold (<0.40)'
  END                              AS band,
  COUNT(*)                         AS edge_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM graph_edges
WHERE rel = 'fund_opportunity'
GROUP BY 1
ORDER BY MIN(matching_score) DESC NULLS LAST;

-- Visual metadata completeness
SELECT
  COUNT(*)                                                      AS total,
  COUNT(*) FILTER (WHERE edge_color IS NOT NULL)                AS has_color,
  COUNT(*) FILTER (WHERE edge_opacity IS NOT NULL)              AS has_opacity,
  COUNT(*) FILTER (WHERE matching_score IS NOT NULL)            AS has_score,
  COUNT(*) FILTER (WHERE verified IS NOT NULL)                  AS has_verified,
  COUNT(*) FILTER (WHERE confidence IS NOT NULL)                AS has_confidence
FROM graph_edges
WHERE rel = 'fund_opportunity';

-- ============================================================
-- SECTION 2: Add source_name column if not present
-- ============================================================

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS source_name VARCHAR(100);

-- ============================================================
-- SECTION 3: Remove sub-threshold edges (matching_score < 0.40)
-- ============================================================
-- These should not exist per migration 022's >= 0.40 guard, but
-- delete any that slipped through (e.g. NULL scores or rounding).

DELETE FROM graph_edges
WHERE rel = 'fund_opportunity'
  AND (matching_score IS NULL OR matching_score < 0.40);

-- ============================================================
-- SECTION 4: Fix edge_color to reflect match quality
-- ============================================================
-- Migration 022 used: #22C55E / #16A34A / #F59E0B / #9CA3AF
-- Correct scheme   : #4ADE80 / #86EFAC / #FCD34D / #F87171

UPDATE graph_edges
SET edge_color = CASE
  WHEN matching_score >= 0.80 THEN '#4ADE80'   -- bright green, excellent match
  WHEN matching_score >= 0.65 THEN '#86EFAC'   -- light green,  good match
  WHEN matching_score >= 0.50 THEN '#FCD34D'   -- yellow,       fair match
  ELSE                              '#F87171'   -- red,          weak match
END
WHERE rel = 'fund_opportunity'
  AND edge_color IS DISTINCT FROM CASE
    WHEN matching_score >= 0.80 THEN '#4ADE80'
    WHEN matching_score >= 0.65 THEN '#86EFAC'
    WHEN matching_score >= 0.50 THEN '#FCD34D'
    ELSE                              '#F87171'
  END;

-- ============================================================
-- SECTION 5: Fix edge_opacity to scale with score
-- ============================================================
-- Migration 022 banded at 0.80/0.65/0.50 with values 0.85/0.70/0.55/0.40.
-- Correct bands : >=0.75 → 0.85, >=0.60 → 0.70, >=0.45 → 0.55, else 0.40

UPDATE graph_edges
SET edge_opacity = CASE
  WHEN matching_score >= 0.75 THEN 0.85
  WHEN matching_score >= 0.60 THEN 0.70
  WHEN matching_score >= 0.45 THEN 0.55
  ELSE                              0.40
END
WHERE rel = 'fund_opportunity'
  AND edge_opacity IS DISTINCT FROM CASE
    WHEN matching_score >= 0.75 THEN 0.85
    WHEN matching_score >= 0.60 THEN 0.70
    WHEN matching_score >= 0.45 THEN 0.55
    ELSE                              0.40
  END;

-- ============================================================
-- SECTION 6: Source attribution
-- ============================================================
-- source_name : BBI Capital Matching Algorithm v1
-- verified    : false  (algorithmic match, not a confirmed investment)
-- confidence  : matching_score * 0.9  (10% algorithmic discount)

UPDATE graph_edges
SET
  source_name = 'BBI Capital Matching Algorithm v1',
  verified    = false,
  confidence  = ROUND((matching_score * 0.9)::NUMERIC, 3)
WHERE rel = 'fund_opportunity'
  AND (
    source_name IS DISTINCT FROM 'BBI Capital Matching Algorithm v1'
    OR verified IS DISTINCT FROM false
    OR confidence IS DISTINCT FROM ROUND((matching_score * 0.9)::NUMERIC, 3)
  );

-- ============================================================
-- SECTION 7: Quality label in weight JSONB
-- ============================================================
-- Merge a 'quality' key into the existing weight payload (or
-- initialise weight as {} if currently NULL).

UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'quality', CASE
    WHEN matching_score >= 0.80 THEN 'excellent'
    WHEN matching_score >= 0.65 THEN 'good'
    WHEN matching_score >= 0.50 THEN 'fair'
    ELSE                              'weak'
  END
)
WHERE rel = 'fund_opportunity'
  AND (
    weight IS NULL
    OR weight->>'quality' IS DISTINCT FROM CASE
      WHEN matching_score >= 0.80 THEN 'excellent'
      WHEN matching_score >= 0.65 THEN 'good'
      WHEN matching_score >= 0.50 THEN 'fair'
      ELSE                              'weak'
    END
  );

-- ============================================================
-- SECTION 8: Post-fix verification selects
-- ============================================================

-- Confirm color distribution matches new scheme
SELECT
  edge_color,
  CASE edge_color
    WHEN '#4ADE80' THEN 'excellent (>=0.80)'
    WHEN '#86EFAC' THEN 'good (>=0.65)'
    WHEN '#FCD34D' THEN 'fair (>=0.50)'
    WHEN '#F87171' THEN 'weak (<0.50)'
    ELSE 'unexpected'
  END AS color_label,
  COUNT(*)                         AS edge_count,
  MIN(matching_score)              AS score_min,
  MAX(matching_score)              AS score_max,
  ROUND(AVG(matching_score), 3)    AS score_avg
FROM graph_edges
WHERE rel = 'fund_opportunity'
GROUP BY edge_color
ORDER BY score_avg DESC;

-- Confirm opacity distribution
SELECT
  edge_opacity,
  COUNT(*)                         AS edge_count,
  MIN(matching_score)              AS score_min,
  MAX(matching_score)              AS score_max
FROM graph_edges
WHERE rel = 'fund_opportunity'
GROUP BY edge_opacity
ORDER BY edge_opacity DESC;

-- Confirm attribution + confidence
SELECT
  source_name,
  verified,
  COUNT(*)                                 AS edge_count,
  MIN(confidence)                          AS conf_min,
  MAX(confidence)                          AS conf_max,
  ROUND(AVG(confidence), 3)               AS conf_avg
FROM graph_edges
WHERE rel = 'fund_opportunity'
GROUP BY source_name, verified;

-- Confirm quality labels in weight JSONB
SELECT
  weight->>'quality'               AS quality_label,
  COUNT(*)                         AS edge_count,
  MIN(matching_score)              AS score_min,
  MAX(matching_score)              AS score_max
FROM graph_edges
WHERE rel = 'fund_opportunity'
GROUP BY weight->>'quality'
ORDER BY score_min DESC NULLS LAST;

-- Final summary
SELECT
  'fund_opportunity' AS rel,
  COUNT(*)                                                     AS total_edges,
  COUNT(*) FILTER (WHERE edge_color     IS NOT NULL)           AS has_color,
  COUNT(*) FILTER (WHERE edge_opacity   IS NOT NULL)           AS has_opacity,
  COUNT(*) FILTER (WHERE source_name    IS NOT NULL)           AS has_source_name,
  COUNT(*) FILTER (WHERE verified = false)                     AS is_unverified,
  COUNT(*) FILTER (WHERE confidence     IS NOT NULL)           AS has_confidence,
  COUNT(*) FILTER (WHERE weight ? 'quality')                   AS has_quality_label,
  COUNT(*) FILTER (WHERE matching_score < 0.40)                AS sub_threshold
FROM graph_edges
WHERE rel = 'fund_opportunity';
