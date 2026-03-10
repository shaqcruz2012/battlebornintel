-- Migration 090: Enrich stakeholder_activities from verified graph_edges for companies 67-88
-- Source: graph_edges with event_year and note populated
-- Mapping: invested_in→Funding/risk_capital, grants_to→Grant/gov_policy,
--          partners_with→Partnership/corporate, acquired→Acquisition/corporate,
--          accelerated_by→Milestone/ecosystem
-- Uses ROW_NUMBER() to stagger activity_date within (company, activity_type, year)
-- to avoid UNIQUE constraint on (company_id, activity_type, activity_date)
-- Dedup: NOT EXISTS check against existing stakeholder_activities

BEGIN;

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type)
SELECT
  sub.slug AS company_id,
  sub.activity_type,
  sub.note AS description,
  sub.city || ', Nevada' AS location,
  -- Stagger dates: row 1 → month 1 day 15, row 2 → month 2 day 15, etc.
  MAKE_DATE(sub.event_year, LEAST(sub.rn, 12)::int, 15) AS activity_date,
  'graph_edge_enrichment' AS source,
  'INFERRED' AS data_quality,
  sub.stakeholder_type
FROM (
  SELECT
    c.slug,
    c.city,
    ge.event_year,
    ge.note,
    CASE
      WHEN ge.rel = 'invested_in'    THEN 'Funding'
      WHEN ge.rel = 'grants_to'      THEN 'Grant'
      WHEN ge.rel = 'partners_with'  THEN 'Partnership'
      WHEN ge.rel = 'acquired'       THEN 'Acquisition'
      WHEN ge.rel = 'accelerated_by' THEN 'Milestone'
    END AS activity_type,
    CASE
      WHEN ge.rel = 'invested_in'    THEN 'risk_capital'
      WHEN ge.rel = 'grants_to'      THEN 'gov_policy'
      WHEN ge.rel = 'partners_with'  THEN 'corporate'
      WHEN ge.rel = 'acquired'       THEN 'corporate'
      WHEN ge.rel = 'accelerated_by' THEN 'ecosystem'
    END AS stakeholder_type,
    ROW_NUMBER() OVER (
      PARTITION BY c.slug,
        CASE
          WHEN ge.rel = 'invested_in'    THEN 'Funding'
          WHEN ge.rel = 'grants_to'      THEN 'Grant'
          WHEN ge.rel = 'partners_with'  THEN 'Partnership'
          WHEN ge.rel = 'acquired'       THEN 'Acquisition'
          WHEN ge.rel = 'accelerated_by' THEN 'Milestone'
        END,
        ge.event_year
      ORDER BY ge.source_id, ge.target_id
    ) AS rn
  FROM graph_edges ge
  JOIN companies c ON (
    'c_' || c.id::text = ge.target_id
    OR 'c_' || c.id::text = ge.source_id
  )
  WHERE c.id BETWEEN 67 AND 88
    AND ge.event_year IS NOT NULL
    AND ge.note IS NOT NULL
    AND ge.note <> ''
    AND ge.rel IN (
      'invested_in',
      'grants_to',
      'partners_with',
      'acquired',
      'accelerated_by'
    )
) sub
WHERE NOT EXISTS (
  SELECT 1 FROM stakeholder_activities sa
  WHERE sa.company_id = sub.slug
    AND sa.activity_type = sub.activity_type
    AND sa.activity_date = MAKE_DATE(sub.event_year, LEAST(sub.rn, 12)::int, 15)
);

COMMIT;
