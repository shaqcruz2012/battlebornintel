-- Migration 039: Verify and Remediate Event-Edge Alignment
-- Audits the alignment between timeline_events and graph_edges, ensuring every
-- significant Funding, Award, and Grant event in 2026 has a corresponding graph
-- edge.  Also backfills missing event_year values on graph_edges and creates a
-- consolidated view for timeline+edge reporting.
--
-- Sections:
--   1. DIAGNOSTIC  — show timeline events without corresponding edges
--   2. FUNDING     — insert provisional invested_in edges for orphaned Funding events
--   3. AWARD/GRANT — insert awards edges for orphaned SBIR/Grant events
--   4. BACKFILL    — set event_year on graph_edges that are missing it
--   5. VIEW        — create v_events_with_edges consolidated view
--
-- Idempotent: all inserts are guarded by NOT EXISTS; ALTER/UPDATE statements
-- use WHERE guards so re-running is safe.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/039_verify_event_edge_alignment.sql

-- ============================================================
-- SECTION 1: DIAGNOSTIC — timeline events without edges
-- ============================================================
-- Shows Funding, Award, and Grant events from 2026 where no graph_edge
-- exists for the same company in the same year.  This is a pure SELECT;
-- the output pinpoints which events Sections 2 and 3 will remediate.
--
-- Alignment rule:
--   An event is considered "covered" when at least one graph_edge exists
--   whose source_id or target_id contains the company's numeric id
--   prefixed with 'c_', AND whose event_year matches the event year.
--   Government/fund entity events (no companies row) are excluded because
--   they have no c_<id> node and are inherently ecosystem-level edges.

SELECT
    t.id                              AS event_id,
    t.company_name,
    t.event_type,
    t.event_date,
    t.delta_capital_m,
    LEFT(t.detail, 80)                AS detail_preview
FROM timeline_events t
WHERE t.event_type IN ('Funding', 'Award', 'Grant')
  AND t.event_date >= '2026-01-01'
  -- company must exist in companies table (excludes fund/gov actors)
  AND EXISTS (
      SELECT 1
      FROM companies c
      WHERE LOWER(c.name) = LOWER(t.company_name)
         OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
  )
  -- no edge covers this company in the same year
  AND NOT EXISTS (
      SELECT 1
      FROM graph_edges ge
      JOIN companies c
        ON ('c_' || c.id) IN (ge.source_id, ge.target_id)
      WHERE (
          LOWER(c.name) = LOWER(t.company_name)
          OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
      )
        AND ge.event_year = EXTRACT(YEAR FROM t.event_date)::int
  )
ORDER BY t.event_date DESC, t.company_name;


-- ============================================================
-- SECTION 2: FILL IN MISSING FUNDING EDGES
-- ============================================================
-- For each Funding event in 2026 whose company appears in the companies
-- table but has no graph_edge for that year, insert a provisional
-- invested_in edge from the company node to the Nevada ecosystem node.
--
-- Edge semantics:
--   source_id  = 'c_<companies.id>'          (company received investment)
--   target_id  = 'e_nevada-startup-ecosystem' (ecosystem context node)
--   rel        = 'invested_in'
--   confidence = 0.75  (provisional — sourced from timeline event only)
--   source     = 'timeline_event_inferred'
--
-- One edge is created per distinct (company, event_year) pair to avoid
-- flooding the graph with per-event duplicates when a company has
-- multiple funding events in the same year.

INSERT INTO graph_edges (
    source_id,
    target_id,
    rel,
    source_type,
    target_type,
    edge_category,
    event_year,
    note,
    weight,
    confidence,
    verified,
    agent_id
)
SELECT DISTINCT ON (c.id, EXTRACT(YEAR FROM t.event_date)::int)
    'c_' || c.id                                              AS source_id,
    'e_nevada-startup-ecosystem'                              AS target_id,
    'invested_in'                                             AS rel,
    'company'                                                 AS source_type,
    'ecosystem'                                               AS target_type,
    'historical'                                              AS edge_category,
    EXTRACT(YEAR FROM t.event_date)::int                      AS event_year,
    'Provisional edge inferred from timeline_events Funding record: '
        || t.company_name || ' — ' || LEFT(t.detail, 120)    AS note,
    jsonb_build_object(
        'source',          'timeline_event_inferred',
        'source_name',     'timeline_event_inferred',
        'inferred_from',   'timeline_events',
        'event_id',        t.id,
        'deal_size_m',     t.delta_capital_m,
        'event_date',      t.event_date::text
    )                                                         AS weight,
    0.75                                                      AS confidence,
    false                                                     AS verified,
    'migration-039'                                           AS agent_id
FROM timeline_events t
JOIN companies c
  ON LOWER(c.name) = LOWER(t.company_name)
  OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
WHERE t.event_type = 'Funding'
  AND t.event_date >= '2026-01-01'
  -- only insert when no edge already covers this company in 2026
  AND NOT EXISTS (
      SELECT 1
      FROM graph_edges ge
      WHERE ('c_' || c.id) IN (ge.source_id, ge.target_id)
        AND ge.event_year = EXTRACT(YEAR FROM t.event_date)::int
  )
ORDER BY c.id,
         EXTRACT(YEAR FROM t.event_date)::int,
         t.event_date DESC;


-- ============================================================
-- SECTION 3: FILL IN MISSING AWARD / GRANT EDGES
-- ============================================================
-- For each Award or Grant event in 2026 whose company appears in the
-- companies table but has no graph_edge for that year, insert a
-- provisional awards edge from an SBIR/grant office external node to
-- the company node.
--
-- Edge semantics:
--   source_id  = 'x_nv-sbir-office'   (Nevada SBIR/STTR Program Office,
--                                       seeded in migration 024)
--   target_id  = 'c_<companies.id>'
--   rel        = 'awards'
--   confidence = 0.85  (SBIR.gov is considered a reliable source)
--   source     = 'SBIR.gov'
--
-- One edge per distinct (company, event_year) pair.

INSERT INTO graph_edges (
    source_id,
    target_id,
    rel,
    source_type,
    target_type,
    edge_category,
    event_year,
    note,
    weight,
    confidence,
    verified,
    agent_id
)
SELECT DISTINCT ON (c.id, EXTRACT(YEAR FROM t.event_date)::int)
    'x_nv-sbir-office'                                        AS source_id,
    'c_' || c.id                                              AS target_id,
    'awards'                                                   AS rel,
    'external'                                                 AS source_type,
    'company'                                                  AS target_type,
    'historical'                                               AS edge_category,
    EXTRACT(YEAR FROM t.event_date)::int                       AS event_year,
    'Provisional award edge inferred from timeline_events '
        || t.event_type || ' record: '
        || t.company_name || ' — ' || LEFT(t.detail, 120)     AS note,
    jsonb_build_object(
        'source',        'SBIR.gov',
        'source_name',   'SBIR.gov',
        'inferred_from', 'timeline_events',
        'event_id',      t.id,
        'award_amount_m', t.delta_capital_m,
        'event_date',    t.event_date::text,
        'event_type',    t.event_type
    )                                                          AS weight,
    0.85                                                       AS confidence,
    false                                                      AS verified,
    'migration-039'                                            AS agent_id
FROM timeline_events t
JOIN companies c
  ON LOWER(c.name) = LOWER(t.company_name)
  OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
WHERE t.event_type IN ('Award', 'Grant')
  AND t.event_date >= '2026-01-01'
  -- only insert when no edge already covers this company in 2026
  AND NOT EXISTS (
      SELECT 1
      FROM graph_edges ge
      WHERE ('c_' || c.id) IN (ge.source_id, ge.target_id)
        AND ge.event_year = EXTRACT(YEAR FROM t.event_date)::int
  )
ORDER BY c.id,
         EXTRACT(YEAR FROM t.event_date)::int,
         t.event_date DESC;


-- ============================================================
-- SECTION 4: BACKFILL event_year ON GRAPH EDGES
-- ============================================================
-- 4a. Edges created in 2026 (created_at >= 2026-01-01) that have no
--     event_year receive event_year = 2026.
--
-- 4b. Edges created before 2026 that have no event_year are backfilled
--     from weight->>'year' when present, otherwise from the year of
--     created_at.

-- 4a: 2026 rows missing event_year
UPDATE graph_edges
SET    event_year  = 2026,
       agent_id    = COALESCE(agent_id, 'migration-039-backfill')
WHERE  created_at >= '2026-01-01'
  AND  event_year IS NULL;

-- 4b: pre-2026 rows missing event_year — prefer weight->>'year', fall back to created_at year
UPDATE graph_edges
SET    event_year  = COALESCE(
                        NULLIF((weight->>'year'), '')::int,
                        EXTRACT(YEAR FROM created_at)::int
                     ),
       agent_id    = COALESCE(agent_id, 'migration-039-backfill')
WHERE  created_at < '2026-01-01'
  AND  event_year IS NULL;


-- ============================================================
-- SECTION 5: CONSOLIDATED VIEW — v_events_with_edges
-- ============================================================
-- Joins timeline_events to companies to graph_edges so that every
-- timeline event is annotated with the count and types of graph edges
-- that reference the same company in the same year.
--
-- Rows with edge_count = 0 are unmatched events (orphaned).
-- The view covers all years, not only 2026.

CREATE OR REPLACE VIEW v_events_with_edges AS
SELECT
    t.id                                          AS event_id,
    t.company_name,
    t.event_type,
    t.event_date,
    t.detail                                      AS title,
    t.delta_capital_m,
    EXTRACT(YEAR FROM t.event_date)::int          AS event_year,
    -- edge aggregates
    COUNT(ge.id)                                  AS edge_count,
    array_remove(
        array_agg(DISTINCT ge.rel),
        NULL
    )                                             AS edge_rels,
    array_remove(
        array_agg(DISTINCT ge.source_id),
        NULL
    )                                             AS edge_source_ids,
    array_remove(
        array_agg(DISTINCT ge.target_id),
        NULL
    )                                             AS edge_target_ids,
    -- coverage flag: true when at least one edge is matched
    COUNT(ge.id) > 0                              AS has_edge_coverage
FROM timeline_events t
LEFT JOIN companies c
       ON LOWER(c.name) = LOWER(t.company_name)
       OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
LEFT JOIN graph_edges ge
       ON ('c_' || c.id) IN (ge.source_id, ge.target_id)
      AND ge.event_year = EXTRACT(YEAR FROM t.event_date)::int
GROUP BY
    t.id,
    t.company_name,
    t.event_type,
    t.event_date,
    t.detail,
    t.delta_capital_m;

-- Index on companies to accelerate the view join
CREATE INDEX IF NOT EXISTS idx_companies_name_lower
    ON companies (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_companies_slug_lower
    ON companies (LOWER(slug));

-- Index on graph_edges to accelerate year-band alignment queries
CREATE INDEX IF NOT EXISTS idx_graph_edges_event_year
    ON graph_edges (event_year)
    WHERE event_year IS NOT NULL;

-- ============================================================
-- VERIFICATION QUERIES — run after migration to confirm results
-- ============================================================

-- A. Count of provisional edges inserted by this migration
SELECT
    rel,
    COUNT(*)          AS edges_inserted,
    MIN(event_year)   AS year_min,
    MAX(event_year)   AS year_max
FROM graph_edges
WHERE agent_id = 'migration-039'
GROUP BY rel
ORDER BY rel;

-- B. Remaining orphaned Funding/Award/Grant events in 2026
--    (should be zero for companies in the companies table)
SELECT
    t.company_name,
    t.event_type,
    t.event_date,
    LEFT(t.detail, 80) AS detail_preview
FROM timeline_events t
WHERE t.event_type IN ('Funding', 'Award', 'Grant')
  AND t.event_date >= '2026-01-01'
  AND EXISTS (
      SELECT 1 FROM companies c
      WHERE LOWER(c.name) = LOWER(t.company_name)
         OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
  )
  AND NOT EXISTS (
      SELECT 1
      FROM graph_edges ge
      JOIN companies c
        ON ('c_' || c.id) IN (ge.source_id, ge.target_id)
      WHERE (
          LOWER(c.name) = LOWER(t.company_name)
          OR LOWER(c.slug) = LOWER(REPLACE(t.company_name, ' ', '-'))
      )
        AND ge.event_year = EXTRACT(YEAR FROM t.event_date)::int
  )
ORDER BY t.event_date DESC;

-- C. event_year backfill completeness
SELECT
    COUNT(*)                                        AS total_edges,
    COUNT(*) FILTER (WHERE event_year IS NOT NULL)  AS have_event_year,
    COUNT(*) FILTER (WHERE event_year IS NULL)      AS missing_event_year
FROM graph_edges;

-- D. Sample from the consolidated view — 2026 events with coverage status
SELECT
    event_id,
    company_name,
    event_type,
    event_date,
    delta_capital_m,
    edge_count,
    has_edge_coverage,
    edge_rels
FROM v_events_with_edges
WHERE event_year = 2026
  AND event_type IN ('Funding', 'Award', 'Grant')
ORDER BY event_date DESC, company_name
LIMIT 40;
