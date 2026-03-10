-- Migration 085: Generate timeline_events from verified graph_edges for companies 97-112
-- Companies: Grantcycle, GRRRL, Heligenics, KnowRisk, Let's Rolo, Longshot Space,
--   Melzi Surgical, Nailstry, NeuroReserve, Nivati, Onboarded, Otsy, Phone2,
--   Prosper Technologies, Quantum Copper, Sarcomatrix
-- Source: graph_edges with event_year and note populated
-- Maps relationship types to timeline event types using note as detail directly
-- Uses ROW_NUMBER() to stagger dates within the same (company, event_type, year)

BEGIN;

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
SELECT
  -- Stagger dates within the same year for the same (company, event_type)
  -- to avoid UNIQUE constraint violations on (company_name, event_type, event_date)
  MAKE_DATE(
    sub.event_year,
    -- Distribute across months: row 1 → Jan 15, row 2 → Feb 15, ..., row 12 → Dec 15
    LEAST(sub.rn, 12)::int,
    15
  ) AS event_date,
  sub.event_type,
  sub.company_name,
  sub.note AS detail,
  sub.icon,
  sub.company_id,
  0.7 AS confidence,
  false AS verified
FROM (
  SELECT
    ge.event_year,
    c.id AS company_id,
    c.name AS company_name,
    ge.note,
    -- Map relationship types to event types and icons
    CASE
      WHEN ge.rel = 'invested_in'                        THEN 'Funding'
      WHEN ge.rel = 'grants_to'                          THEN 'Grant'
      WHEN ge.rel IN ('acquired', 'acquired_by')         THEN 'Acquisition'
      WHEN ge.rel IN ('accelerated', 'accelerated_by')   THEN 'Milestone'
      WHEN ge.rel IN ('partners_with', 'contracts_with') THEN 'Partnership'
      WHEN ge.rel = 'loaned_to'                          THEN 'Funding'
      WHEN ge.rel = 'approved_by'                        THEN 'Milestone'
      WHEN ge.rel = 'collaborated_with'                  THEN 'Partnership'
    END AS event_type,
    CASE
      WHEN ge.rel = 'invested_in'                        THEN '💰'
      WHEN ge.rel = 'grants_to'                          THEN '🏆'
      WHEN ge.rel IN ('acquired', 'acquired_by')         THEN '🏢'
      WHEN ge.rel IN ('accelerated', 'accelerated_by')   THEN '⭐'
      WHEN ge.rel IN ('partners_with', 'contracts_with') THEN '🤝'
      WHEN ge.rel = 'loaned_to'                          THEN '💰'
      WHEN ge.rel = 'approved_by'                        THEN '⭐'
      WHEN ge.rel = 'collaborated_with'                  THEN '🤝'
    END AS icon,
    -- Assign row numbers per (company, mapped_event_type, year) for date staggering
    ROW_NUMBER() OVER (
      PARTITION BY c.id,
        CASE
          WHEN ge.rel = 'invested_in'                        THEN 'Funding'
          WHEN ge.rel = 'grants_to'                          THEN 'Grant'
          WHEN ge.rel IN ('acquired', 'acquired_by')         THEN 'Acquisition'
          WHEN ge.rel IN ('accelerated', 'accelerated_by')   THEN 'Milestone'
          WHEN ge.rel IN ('partners_with', 'contracts_with') THEN 'Partnership'
          WHEN ge.rel = 'loaned_to'                          THEN 'Funding'
          WHEN ge.rel = 'approved_by'                        THEN 'Milestone'
          WHEN ge.rel = 'collaborated_with'                  THEN 'Partnership'
        END,
        ge.event_year
      ORDER BY ge.source_id, ge.target_id
    ) AS rn
  FROM graph_edges ge
  JOIN companies c ON (
    'c_' || c.id::text = ge.target_id
    OR 'c_' || c.id::text = ge.source_id
  )
  WHERE c.id BETWEEN 97 AND 112
    AND ge.event_year IS NOT NULL
    AND ge.note IS NOT NULL
    AND ge.note <> ''
    -- Only map relationship types that correspond to timeline events
    AND ge.rel IN (
      'invested_in',
      'grants_to',
      'acquired',
      'acquired_by',
      'accelerated',
      'accelerated_by',
      'partners_with',
      'contracts_with',
      'loaned_to',
      'approved_by',
      'collaborated_with'
    )
) sub
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

COMMIT;
