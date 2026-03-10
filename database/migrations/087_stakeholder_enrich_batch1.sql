-- Migration 087: Enrich stakeholder_activities from verified graph_edges
-- for companies with IDs 1-22 (batch 1).
-- Maps graph_edges relationship types to stakeholder activity types.
-- Only uses edges with non-NULL note and event_year.
-- Uses DISTINCT ON to pick the longest note per (company, type, year)
-- and ON CONFLICT to skip rows that already exist.

BEGIN;

-- Enrich stakeholder_activities from graph_edges for companies 1-22.
-- Relationship type mapping:
--   invested_in       -> Funding     / risk_capital
--   partners_with     -> Partnership / varies by source prefix
--   corporate_partner -> Partnership / corporate
--   pilots_with       -> Partnership / corporate
--   accelerated_by    -> Milestone   / ecosystem
--   acquired          -> Acquisition / corporate
--   acquired_by       -> Acquisition / corporate
--   loaned_to         -> Grant       / gov_policy
--   approved_by       -> Milestone   / gov_policy
--   collaborated_with -> Partnership / ecosystem

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type)
SELECT DISTINCT ON (company_id, activity_type, activity_date)
  company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type
FROM (
  SELECT
    c.slug                                                          AS company_id,
    CASE ge.rel
      WHEN 'invested_in'       THEN 'Funding'
      WHEN 'partners_with'     THEN 'Partnership'
      WHEN 'corporate_partner' THEN 'Partnership'
      WHEN 'pilots_with'       THEN 'Partnership'
      WHEN 'accelerated_by'    THEN 'Milestone'
      WHEN 'acquired'          THEN 'Acquisition'
      WHEN 'acquired_by'       THEN 'Acquisition'
      WHEN 'loaned_to'         THEN 'Grant'
      WHEN 'approved_by'       THEN 'Milestone'
      WHEN 'collaborated_with' THEN 'Partnership'
    END                                                             AS activity_type,
    ge.note                                                         AS description,
    c.city || ', Nevada'                                            AS location,
    MAKE_DATE(ge.event_year, 6, 15)                                 AS activity_date,
    'graph_edge_enrichment'                                         AS source,
    'INFERRED'                                                      AS data_quality,
    CASE
      WHEN ge.rel = 'invested_in'       THEN 'risk_capital'
      WHEN ge.rel = 'acquired'          THEN 'corporate'
      WHEN ge.rel = 'acquired_by'       THEN 'corporate'
      WHEN ge.rel = 'corporate_partner' THEN 'corporate'
      WHEN ge.rel = 'pilots_with'       THEN 'corporate'
      WHEN ge.rel = 'loaned_to'         THEN 'gov_policy'
      WHEN ge.rel = 'approved_by'       THEN 'gov_policy'
      WHEN ge.rel = 'accelerated_by'    THEN 'ecosystem'
      WHEN ge.rel = 'collaborated_with' THEN 'ecosystem'
      WHEN ge.rel = 'partners_with' THEN
        CASE
          WHEN COALESCE(
                 CASE WHEN ge.source_id = 'c_' || c.id::text THEN ge.target_id ELSE ge.source_id END,
                 ''
               ) LIKE 'e_%' THEN 'gov_policy'
          WHEN COALESCE(
                 CASE WHEN ge.source_id = 'c_' || c.id::text THEN ge.target_id ELSE ge.source_id END,
                 ''
               ) LIKE 'u_%' THEN 'university'
          ELSE 'corporate'
        END
    END                                                             AS stakeholder_type,
    LENGTH(ge.note)                                                 AS note_len
  FROM graph_edges ge
  JOIN companies c
    ON (ge.source_id = 'c_' || c.id::text OR ge.target_id = 'c_' || c.id::text)
  WHERE c.id BETWEEN 1 AND 22
    AND ge.note IS NOT NULL
    AND ge.event_year IS NOT NULL
    AND ge.rel IN (
      'invested_in',
      'partners_with',
      'corporate_partner',
      'pilots_with',
      'accelerated_by',
      'acquired',
      'acquired_by',
      'loaned_to',
      'approved_by',
      'collaborated_with'
    )
) AS edge_activities
ORDER BY company_id, activity_type, activity_date, note_len DESC
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

COMMIT;
