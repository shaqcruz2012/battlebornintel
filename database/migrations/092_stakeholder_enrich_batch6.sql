-- Migration 092: Enrich stakeholder_activities from verified graph_edges
-- for companies with IDs 111-127 (batch 6).
-- Companies: Quantum Copper, Sarcomatrix, Semi Exact, SurgiStream,
--   Taber Innovations, Talage Insurance, Terbine, TransWorldHealth,
--   Ultion, Vena Solutions, Vena Vitals, VisionAid, Vistro,
--   WAVR Technologies, Wedgies, WiseBanyan, ZenCentiv
-- Maps graph_edges relationship types to stakeholder activity types.
-- Only uses edges with non-NULL note and event_year.
-- Uses DISTINCT ON to pick the longest note per (company, type, year)
-- and ON CONFLICT to skip rows that already exist.

BEGIN;

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type)
SELECT DISTINCT ON (company_id, activity_type, activity_date)
  company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type
FROM (
  SELECT
    c.slug                                                          AS company_id,
    CASE ge.rel
      WHEN 'invested_in'    THEN 'Funding'
      WHEN 'grants_to'      THEN 'Grant'
      WHEN 'partners_with'  THEN 'Partnership'
      WHEN 'acquired'       THEN 'Acquisition'
      WHEN 'acquired_by'    THEN 'Acquisition'
      WHEN 'accelerated_by' THEN 'Milestone'
    END                                                             AS activity_type,
    ge.note                                                         AS description,
    c.city || ', Nevada'                                            AS location,
    MAKE_DATE(ge.event_year, 6, 15)                                 AS activity_date,
    'graph_edge_enrichment'                                         AS source,
    'INFERRED'                                                      AS data_quality,
    CASE
      WHEN ge.rel = 'invested_in'    THEN 'risk_capital'
      WHEN ge.rel = 'grants_to'      THEN 'gov_policy'
      WHEN ge.rel = 'accelerated_by' THEN 'ecosystem'
      WHEN ge.rel = 'acquired'       THEN 'corporate'
      WHEN ge.rel = 'acquired_by'    THEN 'corporate'
      WHEN ge.rel = 'partners_with'  THEN 'corporate'
    END                                                             AS stakeholder_type,
    LENGTH(ge.note)                                                 AS note_len
  FROM graph_edges ge
  JOIN companies c
    ON (ge.source_id = 'c_' || c.id::text OR ge.target_id = 'c_' || c.id::text)
  WHERE c.id BETWEEN 111 AND 127
    AND ge.note IS NOT NULL
    AND ge.event_year IS NOT NULL
    AND ge.rel IN (
      'invested_in',
      'grants_to',
      'partners_with',
      'acquired',
      'acquired_by',
      'accelerated_by'
    )
) AS edge_activities
WHERE activity_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stakeholder_activities sa
    WHERE sa.company_id    = edge_activities.company_id
      AND sa.activity_type = edge_activities.activity_type
      AND sa.description   = edge_activities.description
  )
ORDER BY company_id, activity_type, activity_date, note_len DESC
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

COMMIT;
