-- Migration 091: Enrich stakeholder_activities from graph_edges for companies 89-110
-- Companies: Cuts Clothing, DayaMed, Dog & Whistle, Drain Drawer, Ecoatoms,
--   Elly Health, Fandeavor, FanUp, Grantcycle, GRRRL, Heligenics, KnowRisk,
--   Let's Rolo, Longshot Space, Melzi Surgical, Nailstry, NeuroReserve, Nivati,
--   Onboarded, Otsy, Phone2, Prosper Technologies
-- Source: graph_edges with event_year and note populated
-- Maps: invested_in→Funding/risk_capital, grants_to→Grant/gov_policy,
--        partners_with→Partnership/corporate, acquired/acquired_by→Acquisition/corporate,
--        accelerated_by→Milestone/ecosystem
-- Stakeholder type derived from source entity prefix:
--   f_*, i_* → risk_capital
--   x_* (corporate investors/partners) → corporate
--   u_* → university
--   e_* → gov_policy
--   a_* → ecosystem
--   c_* (company-to-company) → corporate
-- Uses ROW_NUMBER() to stagger dates within (company, activity_type, year)
--   to avoid unique constraint violations on (company_id, activity_type, activity_date)
-- Dedup: NOT EXISTS against existing rows matching (company_id, activity_type, description)
-- ON CONFLICT DO NOTHING as final safety net.
-- Idempotent and safe to re-run.

BEGIN;

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
SELECT
  sub.slug            AS company_id,
  sub.activity_type,
  sub.note            AS description,
  sub.city || ', Nevada' AS location,
  -- Stagger dates within the same year for the same (company, activity_type)
  -- Row 1 → Jan 15, Row 2 → Feb 15, ..., Row 12 → Dec 15
  MAKE_DATE(sub.event_year, LEAST(sub.rn, 12)::int, 15) AS activity_date,
  'graph_edge_enrichment' AS source,
  'INFERRED'          AS data_quality,
  sub.stakeholder_type
FROM (
  SELECT
    c.slug,
    c.city,
    ge.event_year,
    ge.note,
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
      -- For invested_in: derive from the source entity prefix
      WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'f_%'  THEN 'risk_capital'
      WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'i_%'  THEN 'risk_capital'
      WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'x_%'  THEN 'corporate'
      WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'u_%'  THEN 'university'
      WHEN ge.rel = 'invested_in' AND ge.source_id LIKE 'e_%'  THEN 'gov_policy'
      -- For acquired/acquired_by
      WHEN ge.rel IN ('acquired', 'acquired_by')
           AND ge.source_id LIKE 'x_%'                         THEN 'corporate'
      WHEN ge.rel IN ('acquired', 'acquired_by')               THEN 'corporate'
      -- For partners_with: derive from the non-company entity
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
    END AS stakeholder_type,
    -- Assign row numbers per (company, mapped_activity_type, year) for date staggering
    ROW_NUMBER() OVER (
      PARTITION BY c.slug,
        CASE
          WHEN ge.rel = 'invested_in'                    THEN 'Funding'
          WHEN ge.rel = 'grants_to'                      THEN 'Grant'
          WHEN ge.rel IN ('acquired', 'acquired_by')     THEN 'Acquisition'
          WHEN ge.rel = 'accelerated_by'                 THEN 'Milestone'
          WHEN ge.rel = 'partners_with'                  THEN 'Partnership'
        END,
        ge.event_year
      ORDER BY ge.source_id, ge.target_id
    ) AS rn
  FROM graph_edges ge
  JOIN companies c ON (
    'c_' || c.id::text = ge.target_id
    OR 'c_' || c.id::text = ge.source_id
  )
  WHERE c.id BETWEEN 89 AND 110
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
  AND NOT EXISTS (
    SELECT 1 FROM stakeholder_activities sa
    WHERE sa.company_id   = sub.slug
      AND sa.activity_type = sub.activity_type
      AND sa.description   = sub.note
  )
ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

COMMIT;
