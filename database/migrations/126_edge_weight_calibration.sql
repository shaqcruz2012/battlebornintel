-- Migration 126: Edge Weight Calibration
-- Calibrates edge_weight across all graph_edges to a consistent 0-2 scale,
-- sets confidence scores based on evidence quality, ensures bidirectional
-- edges for symmetric relationships, and fills missing edge_category values.
--
-- All operations are idempotent — only updates rows where values are NULL
-- or still at the uncalibrated default, preserving any manual overrides.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/126_edge_weight_calibration.sql

BEGIN;

-- ============================================================
-- 1. Calibrate edge_weight by rel type (0-2 scale)
-- ============================================================
-- Only touch rows where edge_weight is NULL or still at the
-- uncalibrated default of 1.0 (set in migration 106).

-- 1a. invested_in — derive weight from dollar amounts in note field
UPDATE graph_edges
SET edge_weight = CASE
    WHEN note ~* '\$\d+(\.\d+)?\s*[Bb]'                              THEN 2.0
    WHEN note ~* '\$\d{3,}(\.\d+)?\s*[Mm]'                           THEN 1.5
    WHEN note ~* '\$[1-9]\d{1,2}(\.\d+)?\s*[Mm]'                     THEN 1.5
    WHEN note ~* '\$\d+(\.\d+)?\s*[Mm]'                               THEN 1.0
    WHEN note ~* '\$[1-9]\d{0,2}(\.\d+)?\s*[Kk]'                     THEN 0.7
    ELSE 0.5
  END
WHERE rel = 'invested_in'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

-- More precise invested_in: parse numeric value from note for finer bucketing.
-- This second pass uses a single regex to extract the number before M/B and
-- classify accordingly, overriding the simpler pass above.
UPDATE graph_edges
SET edge_weight = CASE
    WHEN note ~* '\$[\d,]+(\.\d+)?\s*[Bb]' THEN 2.0
    WHEN note ~* '\$[\d,]+(\.\d+)?\s*[Mm]' THEN
      CASE
        WHEN COALESCE(
               NULLIF(regexp_replace(
                 (regexp_match(note, '\$([\d,]+(?:\.\d+)?)\s*[Mm]', 'i'))[1],
                 ',', '', 'g'
               ), '')::NUMERIC, 0
             ) >= 100 THEN 1.5
        WHEN COALESCE(
               NULLIF(regexp_replace(
                 (regexp_match(note, '\$([\d,]+(?:\.\d+)?)\s*[Mm]', 'i'))[1],
                 ',', '', 'g'
               ), '')::NUMERIC, 0
             ) >= 10 THEN 1.0
        WHEN COALESCE(
               NULLIF(regexp_replace(
                 (regexp_match(note, '\$([\d,]+(?:\.\d+)?)\s*[Mm]', 'i'))[1],
                 ',', '', 'g'
               ), '')::NUMERIC, 0
             ) >= 1 THEN 0.7
        ELSE 0.5
      END
    ELSE 0.5
  END
WHERE rel = 'invested_in'
  AND note IS NOT NULL
  AND note ~* '\$[\d,]'
  AND (edge_weight IS NULL OR edge_weight <= 1.0);

-- 1b. Static weight assignments per rel type
UPDATE graph_edges SET edge_weight = 2.0
WHERE rel IN ('acquired', 'merged')
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 1.8
WHERE rel = 'founded_by'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 1.5
WHERE rel = 'spinout_of'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 1.2
WHERE rel = 'funds'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 1.0
WHERE rel IN ('employed_at', 'program_of')
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 0.8
WHERE rel = 'partners_with'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 0.7
WHERE rel = 'accelerated_by'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 0.6
WHERE rel = 'won_pitch'
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 0.5
WHERE rel IN ('in_sector', 'headquartered_in')
  AND (edge_weight IS NULL OR edge_weight = 1.0);

UPDATE graph_edges SET edge_weight = 0.3
WHERE rel IN ('qualifies_for', 'fund_opportunity', 'potential_lp')
  AND (edge_weight IS NULL OR edge_weight = 1.0);

-- 1c. Default: any remaining uncalibrated edges get 0.5
UPDATE graph_edges SET edge_weight = 0.5
WHERE edge_weight IS NULL;


-- ============================================================
-- 2. Set confidence scores based on evidence quality
-- ============================================================
-- Only update rows where confidence is NULL to avoid overwriting
-- manual or agent-assigned confidence values.

-- Dollar amounts in notes = high confidence (0.95)
UPDATE graph_edges SET confidence = 0.95
WHERE confidence IS NULL
  AND note IS NOT NULL
  AND note ~* '\$[\d,]+(\.\d+)?\s*[KkMmBb]';

-- Opportunity-category edges = lower confidence (0.60)
UPDATE graph_edges SET confidence = 0.60
WHERE confidence IS NULL
  AND edge_category = 'opportunity';

-- Edges with event_year = moderate-high confidence (0.85)
UPDATE graph_edges SET confidence = 0.85
WHERE confidence IS NULL
  AND event_year IS NOT NULL;

-- Everything else = baseline confidence (0.70)
UPDATE graph_edges SET confidence = 0.70
WHERE confidence IS NULL;


-- ============================================================
-- 3. Ensure bidirectional edges for symmetric relationships
-- ============================================================
-- For partners_with and co_invested_with, if (A,B) exists but
-- (B,A) does not, insert the mirror edge.

INSERT INTO graph_edges (source_id, target_id, rel, event_year, note, weight,
                         edge_weight, confidence, edge_category, valid_from, valid_to)
SELECT e.target_id,
       e.source_id,
       e.rel,
       e.event_year,
       e.note,
       e.weight,
       e.edge_weight,
       e.confidence,
       e.edge_category,
       e.valid_from,
       e.valid_to
FROM graph_edges e
WHERE e.rel IN ('partners_with', 'co_invested_with')
  AND NOT EXISTS (
    SELECT 1
    FROM graph_edges e2
    WHERE e2.source_id = e.target_id
      AND e2.target_id = e.source_id
      AND e2.rel = e.rel
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. Fix missing edge_category values
-- ============================================================

-- Opportunity relationship types
UPDATE graph_edges SET edge_category = 'opportunity'
WHERE edge_category IS NULL
  AND rel IN ('qualifies_for', 'fund_opportunity', 'potential_lp');

-- Edges with event_year are historical
UPDATE graph_edges SET edge_category = 'historical'
WHERE edge_category IS NULL
  AND event_year IS NOT NULL;

-- Remaining uncategorized default to historical
UPDATE graph_edges SET edge_category = 'historical'
WHERE edge_category IS NULL;


-- ============================================================
-- 5. Update statistics
-- ============================================================
ANALYZE graph_edges;

COMMIT;
