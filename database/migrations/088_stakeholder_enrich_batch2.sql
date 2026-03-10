-- Migration 088: Enrich stakeholder_activities from verified graph_edges for companies 23-44
-- Source: graph_edges with event_year and note populated
-- Maps: invested_in -> Funding/risk_capital
--       grants_to   -> Grant/gov_policy
--       partners_with, contracts_with, collaborated_with -> Partnership/corporate
--       acquired, acquired_by -> Acquisition/corporate
--       accelerated_by -> Milestone/ecosystem
-- Uses ROW_NUMBER() to stagger activity_date across months within the same
-- (company_id, activity_type, year) to respect the UNIQUE constraint on
-- (company_id, activity_type, activity_date).

BEGIN;

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type)
SELECT
  sub.slug                AS company_id,
  sub.activity_type,
  sub.note                AS description,
  sub.city || ', Nevada'  AS location,
  MAKE_DATE(
    sub.event_year,
    LEAST(sub.rn, 12)::int,
    15
  )                       AS activity_date,
  'graph_edge_enrichment' AS source,
  'INFERRED'              AS data_quality,
  sub.stakeholder_type
FROM (
  SELECT
    c.slug,
    c.city,
    ge.event_year,
    ge.note,
    -- Map relationship type to activity_type
    CASE
      WHEN ge.rel = 'invested_in'                                              THEN 'Funding'
      WHEN ge.rel = 'grants_to'                                                THEN 'Grant'
      WHEN ge.rel IN ('partners_with', 'contracts_with', 'collaborated_with')  THEN 'Partnership'
      WHEN ge.rel IN ('acquired', 'acquired_by')                               THEN 'Acquisition'
      WHEN ge.rel = 'accelerated_by'                                           THEN 'Milestone'
    END AS activity_type,
    -- Map relationship type to stakeholder_type
    CASE
      WHEN ge.rel = 'invested_in'                                              THEN 'risk_capital'
      WHEN ge.rel = 'grants_to'                                                THEN 'gov_policy'
      WHEN ge.rel IN ('partners_with', 'contracts_with', 'collaborated_with')  THEN 'corporate'
      WHEN ge.rel IN ('acquired', 'acquired_by')                               THEN 'corporate'
      WHEN ge.rel = 'accelerated_by'                                           THEN 'ecosystem'
    END AS stakeholder_type,
    -- Assign row numbers per (company, activity_type, year) for date staggering
    ROW_NUMBER() OVER (
      PARTITION BY c.slug,
        CASE
          WHEN ge.rel = 'invested_in'                                              THEN 'Funding'
          WHEN ge.rel = 'grants_to'                                                THEN 'Grant'
          WHEN ge.rel IN ('partners_with', 'contracts_with', 'collaborated_with')  THEN 'Partnership'
          WHEN ge.rel IN ('acquired', 'acquired_by')                               THEN 'Acquisition'
          WHEN ge.rel = 'accelerated_by'                                           THEN 'Milestone'
        END,
        ge.event_year
      ORDER BY ge.source_id, ge.target_id
    ) AS rn
  FROM graph_edges ge
  JOIN companies c ON (
    'c_' || c.id::text = ge.target_id
    OR 'c_' || c.id::text = ge.source_id
  )
  WHERE c.id BETWEEN 23 AND 44
    AND ge.event_year IS NOT NULL
    AND ge.note IS NOT NULL
    AND ge.note <> ''
    AND ge.rel IN (
      'invested_in',
      'grants_to',
      'partners_with',
      'contracts_with',
      'collaborated_with',
      'acquired',
      'acquired_by',
      'accelerated_by'
    )
) sub
WHERE NOT EXISTS (
  SELECT 1
  FROM stakeholder_activities sa
  WHERE sa.company_id    = sub.slug
    AND sa.activity_type = sub.activity_type
    AND sa.activity_date = MAKE_DATE(sub.event_year, LEAST(sub.rn, 12)::int, 15)
);

COMMIT;
