-- Migration 089: Enrich stakeholder_activities from verified graph_edges for companies 45-66
-- Source: graph_edges with event_year and note populated
-- Maps: invested_in→Funding, grants_to→Grant, partners_with→Partnership,
--        acquired/acquired_by→Acquisition, accelerated_by→Milestone
-- Stakeholder type derived from source entity prefix:
--   f_*, i_* → risk_capital
--   x_* → corporate
--   u_* → university
--   e_* → gov_policy
--   a_* → ecosystem
--   c_* (company-to-company) → corporate
-- Uses ROW_NUMBER() to stagger dates within (company, activity_type, year) groups
-- to respect unique index on (company_id, activity_type, activity_date).
-- Dedup: NOT EXISTS against existing rows matching (company_id, activity_type, description)
-- Idempotent and safe to re-run.

BEGIN;

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
SELECT
  stg.slug              AS company_id,
  stg.activity_type,
  stg.note              AS description,
  stg.city || ', Nevada' AS location,
  -- Stagger dates: row 1 → month 1 day 15, row 2 → month 2 day 15, etc.
  MAKE_DATE(stg.event_year, LEAST(stg.rn, 12)::int, 15) AS activity_date,
  'graph_edge_enrichment' AS source,
  'INFERRED'            AS data_quality,
  stg.stakeholder_type
FROM (
  SELECT
    sub.*,
    ROW_NUMBER() OVER (
      PARTITION BY sub.slug, sub.activity_type, sub.event_year
      ORDER BY sub.source_id, sub.target_id
    ) AS rn
  FROM (
    SELECT
      c.slug,
      c.city,
      ge.event_year,
      ge.note,
      ge.source_id,
      ge.target_id,
      -- Map relationship types to activity types
      CASE
        WHEN ge.rel = 'invested_in'                    THEN 'Funding'
        WHEN ge.rel = 'grants_to'                      THEN 'Grant'
        WHEN ge.rel IN ('acquired', 'acquired_by')     THEN 'Acquisition'
        WHEN ge.rel = 'accelerated_by'                 THEN 'Milestone'
        WHEN ge.rel = 'partners_with'                  THEN 'Partnership'
      END AS activity_type,
      -- Map stakeholder type from the *other* entity's prefix
      CASE
        -- grants_to is always gov_policy
        WHEN ge.rel = 'grants_to'                      THEN 'gov_policy'
        -- accelerated_by is always ecosystem
        WHEN ge.rel = 'accelerated_by'                 THEN 'ecosystem'
        -- invested_in: derive from source entity prefix
        WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'f_%'  THEN 'risk_capital'
        WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'i_%'  THEN 'risk_capital'
        WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'x_%'  THEN 'corporate'
        WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'u_%'  THEN 'university'
        WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'e_%'  THEN 'gov_policy'
        -- acquired/acquired_by: always corporate
        WHEN ge.rel IN ('acquired', 'acquired_by')               THEN 'corporate'
        -- partners_with: derive from the non-company entity
        WHEN ge.rel = 'partners_with' AND (
               ge.source_id LIKE 'u_%' OR ge.target_id LIKE 'u_%'
             )                                                    THEN 'university'
        WHEN ge.rel = 'partners_with' AND (
               ge.source_id LIKE 'e_%' OR ge.target_id LIKE 'e_%'
             )                                                    THEN 'gov_policy'
        WHEN ge.rel = 'partners_with' AND (
               ge.source_id LIKE 'a_%' OR ge.target_id LIKE 'a_%'
             )                                                    THEN 'ecosystem'
        -- Default for partners_with (x_*, c_* to c_*)
        ELSE 'corporate'
      END AS stakeholder_type
    FROM graph_edges ge
    JOIN companies c ON (
      'c_' || c.id::text = ge.target_id
      OR 'c_' || c.id::text = ge.source_id
    )
    WHERE c.id BETWEEN 45 AND 66
      AND ge.event_year IS NOT NULL
      AND ge.note IS NOT NULL
      AND ge.note <> ''
      AND ge.rel IN (
        'invested_in',
        'grants_to',
        'acquired',
        'acquired_by',
        'accelerated_by',
        'partners_with'
      )
  ) sub
  WHERE sub.activity_type IS NOT NULL
) stg
WHERE NOT EXISTS (
  SELECT 1 FROM stakeholder_activities sa
  WHERE sa.company_id    = stg.slug
    AND sa.activity_type = stg.activity_type
    AND sa.description   = stg.note
);

COMMIT;
