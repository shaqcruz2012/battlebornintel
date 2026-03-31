-- Migration 116: Backfill temporal fields on graph_edges
-- Fills valid_from from event_year, sets valid_to for completed relationships,
-- ensures edge_category correctness, adds temporal constraint, and creates
-- a snapshot view for temporal graph queries.
--
-- Current state: 282 edges, 222 have valid_from, 0 have valid_to, all have edge_category + event_year.
-- All operations are idempotent.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/116_backfill_temporal_graph_edges.sql

BEGIN;

-- ============================================================
-- 1. Backfill valid_from from event_year where NULL
-- ============================================================
-- 60 edges have event_year but no valid_from; derive Jan 1 of that year.

UPDATE graph_edges
SET valid_from = make_date(event_year, 1, 1)
WHERE valid_from IS NULL
  AND event_year IS NOT NULL;

-- ============================================================
-- 2. Set valid_to for completed/bounded relationships
-- ============================================================
-- Only touch rows where valid_to IS NULL and valid_from IS NOT NULL.
-- Ongoing relationships (invested_in, employed_at, worked_at, founded_by,
-- founder_of, partners_with, etc.) deliberately stay NULL (= still active).

-- 2a. Acquisitions are point events: valid_to = valid_from
UPDATE graph_edges
SET valid_to = valid_from
WHERE rel IN ('acquired', 'acquired_by', 'merged_with')
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;

-- 2b. Pitch wins: ~1 year of relevance (prize period / media cycle)
UPDATE graph_edges
SET valid_to = (valid_from + INTERVAL '1 year')::DATE
WHERE rel = 'won_pitch'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;

-- 2c. Accelerator cohorts: typical 6-month program duration
UPDATE graph_edges
SET valid_to = (valid_from + INTERVAL '6 months')::DATE
WHERE rel = 'accelerated_by'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;

-- 2d. Spinouts: point event (the spin-out date)
UPDATE graph_edges
SET valid_to = valid_from
WHERE rel = 'spinout_of'
  AND valid_to IS NULL
  AND valid_from IS NOT NULL;

-- NOTE: invested_in, co_invested, employed_at, worked_at, founded_by,
-- founder_of, mentored, mentors, partners_with, contracts_with,
-- collaborated_with, qualifies_for, potential_lp — all stay valid_to = NULL
-- (ongoing or indeterminate duration).

-- ============================================================
-- 3. Ensure edge_category is correct for all rel types
-- ============================================================
-- Canonical mapping:
--   historical  = past/current factual relationships
--   opportunity = potential/suggested connections
--   projected   = forward-looking model outputs

-- 3a. Historical edges (factual relationships)
UPDATE graph_edges
SET edge_category = 'historical'
WHERE rel IN (
    'invested_in', 'co_invested',
    'acquired', 'acquired_by', 'merged_with',
    'founded_by', 'founder_of',
    'employed_at', 'worked_at',
    'accelerated_by',
    'won_pitch',
    'spinout_of',
    'mentored', 'mentors',
    'partners_with', 'contracts_with', 'collaborated_with'
  )
  AND edge_category IS DISTINCT FROM 'historical';

-- 3b. Opportunity edges (potential connections)
UPDATE graph_edges
SET edge_category = 'opportunity'
WHERE rel IN (
    'qualifies_for',
    'potential_lp'
  )
  AND edge_category IS DISTINCT FROM 'opportunity';

-- 3c. Projected edges (model-generated forecasts)
UPDATE graph_edges
SET edge_category = 'projected'
WHERE rel IN (
    'predicted_investment',
    'predicted_partnership'
  )
  AND edge_category IS DISTINCT FROM 'projected';

-- ============================================================
-- 4. CHECK constraint: valid_from <= valid_to where both set
-- ============================================================
-- Drop first for idempotency, then add.

ALTER TABLE graph_edges
  DROP CONSTRAINT IF EXISTS chk_temporal_ordering;

ALTER TABLE graph_edges
  ADD CONSTRAINT chk_temporal_ordering
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_from <= valid_to);

-- Partial index for temporal range queries (only rows with valid_from)
-- Already exists from migration 106 but ensure it covers valid_to too
CREATE INDEX IF NOT EXISTS idx_graph_edges_temporal_range
  ON graph_edges (valid_from, valid_to)
  WHERE valid_from IS NOT NULL;

-- ============================================================
-- 5. Temporal snapshot view
-- ============================================================
-- Usage from API: SELECT * FROM graph_edges_at WHERE $1 BETWEEN edge_start AND edge_end
-- Or for a point-in-time snapshot: WHERE edge_start <= $1 AND edge_end >= $1

CREATE OR REPLACE VIEW graph_edges_at AS
SELECT
  id,
  source_id,
  target_id,
  rel,
  event_year,
  note,
  weight,
  matching_score,
  edge_category,
  edge_style,
  edge_color,
  edge_opacity,
  edge_weight,
  confidence,
  valid_from  AS edge_start,
  COALESCE(valid_to, CURRENT_DATE) AS edge_end
FROM graph_edges;

COMMENT ON VIEW graph_edges_at IS
  'Temporal graph view. Filter with: WHERE edge_start <= $date AND edge_end >= $date '
  'to get all edges active at a point in time. edge_end defaults to today for open-ended edges.';

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES (run outside transaction)
-- ============================================================

-- valid_from coverage (should be 282/282 if all have event_year)
SELECT
  COUNT(*)                                          AS total_edges,
  COUNT(*) FILTER (WHERE valid_from IS NOT NULL)    AS has_valid_from,
  COUNT(*) FILTER (WHERE valid_to IS NOT NULL)      AS has_valid_to,
  COUNT(*) FILTER (WHERE valid_from IS NULL AND event_year IS NOT NULL) AS missing_valid_from_with_year
FROM graph_edges;

-- valid_to by rel type
SELECT
  rel,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE valid_to IS NOT NULL) AS has_valid_to,
  COUNT(*) FILTER (WHERE valid_to IS NULL) AS open_ended
FROM graph_edges
GROUP BY rel
ORDER BY rel;

-- edge_category distribution
SELECT
  edge_category,
  COUNT(*) AS cnt,
  ARRAY_AGG(DISTINCT rel ORDER BY rel) AS rel_types
FROM graph_edges
GROUP BY edge_category
ORDER BY edge_category;

-- Constraint validation (should return 0)
SELECT COUNT(*) AS temporal_violations
FROM graph_edges
WHERE valid_from IS NOT NULL
  AND valid_to IS NOT NULL
  AND valid_from > valid_to;
