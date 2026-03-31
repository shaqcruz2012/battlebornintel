-- Migration 096: Stage Transitions table and Company Status column
-- Purpose: Enable survival/hazard analysis (Kaplan-Meier, Cox PH models) by creating
-- a historical record of company stage transitions inferred from existing data.
--
-- Data sources for backfill:
--   1. timeline_events — funding round mentions in the detail column
--   2. graph_edges — invested_in edges with round-type notes (e.g., "Series A lead")
--   3. companies — current stage as a baseline transition
--   4. graph_edges — acquired/acquired_by relationships for company status
--   5. listings — exchange listings indicating IPO status
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/096_stage_transitions_and_company_status.sql

BEGIN;

-- ============================================================
-- SECTION 1: CREATE stage_transitions TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stage_transitions (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER NOT NULL REFERENCES companies(id),
  from_stage      VARCHAR(20),              -- NULL means company entry/founding
  to_stage        VARCHAR(20) NOT NULL,
  transition_date DATE,                     -- best-known date (may be approximate)
  transition_year INTEGER,                  -- fallback when exact date unknown
  evidence_type   VARCHAR(30) NOT NULL DEFAULT 'inferred',  -- 'verified', 'inferred', 'backfilled'
  evidence_source TEXT,                     -- description of how this was determined
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_trans_company ON stage_transitions(company_id);
CREATE INDEX IF NOT EXISTS idx_stage_trans_to_stage ON stage_transitions(to_stage);
CREATE INDEX IF NOT EXISTS idx_stage_trans_date ON stage_transitions(transition_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stage_transitions_unique
  ON stage_transitions (company_id, to_stage, COALESCE(transition_year, 0));


-- ============================================================
-- SECTION 2: ADD status COLUMN TO companies
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'acquired', 'failed', 'ipo', 'merged', 'unknown'));


-- ============================================================
-- SECTION 3: BACKFILL stage_transitions FROM timeline_events
-- ============================================================
-- timeline_events has: event_date, event_type, company_name, detail, company_id
-- We pattern-match the detail column for funding round keywords.
-- Ordering: pre_seed < seed < series_a < series_b < series_c_plus < growth
--
-- Logic: Each matched event becomes a transition TO the detected stage.
-- We cannot reliably determine from_stage from a single event, so we leave
-- it NULL here; a later pass can infer from_stage by ordering transitions
-- per company chronologically.

-- Pre-seed rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'pre_seed',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%pre-seed%'' or ''%pre seed%'' (event id=' || te.id || ')',
  0.7
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND (te.detail ILIKE '%pre-seed%' OR te.detail ILIKE '%pre seed%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Seed rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'seed',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%seed%'' (event id=' || te.id || ')',
  0.75
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.detail ILIKE '%seed%'
  -- Exclude pre-seed matches (already handled above)
  AND te.detail NOT ILIKE '%pre-seed%'
  AND te.detail NOT ILIKE '%pre seed%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series A rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_a',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%series a%'' (event id=' || te.id || ')',
  0.8
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.detail ILIKE '%series a%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series B rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_b',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%series b%'' (event id=' || te.id || ')',
  0.8
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.detail ILIKE '%series b%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series C+ rounds (Series C, D, E, etc.)
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_c_plus',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%series c/d/e%'' (event id=' || te.id || ')',
  0.8
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND (te.detail ILIKE '%series c%' OR te.detail ILIKE '%series d%' OR te.detail ILIKE '%series e%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Growth rounds (explicit "growth" funding mentions, excluding unrelated uses)
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'growth',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail ILIKE ''%growth%'' investment (event id=' || te.id || ')',
  0.65
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.detail ILIKE '%growth%'
  AND (te.detail ILIKE '%invest%' OR te.detail ILIKE '%round%' OR te.detail ILIKE '%funding%' OR te.detail ILIKE '%raised%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- IPO / listing events from timeline
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'growth',  -- IPO implies growth stage
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  'inferred',
  'timeline_events detail mentions IPO/listing (event id=' || te.id || ')',
  0.85
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND (te.detail ILIKE '%ipo%' OR te.detail ILIKE '%nasdaq%' OR te.detail ILIKE '%nyse%' OR te.detail ILIKE '%listing%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: BACKFILL stage_transitions FROM graph_edges
-- ============================================================
-- graph_edges has: source_id, target_id, rel, note, event_year
-- target_id for companies uses format 'c_<id>' (e.g., 'c_4' = companies.id=4)
-- note field contains round type info like "$100M Series A lead", "Seed co-lead"
--
-- We extract company_id by stripping 'c_' prefix from target_id where it matches
-- invested_in edges.

-- Seed rounds from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'seed',
  NULL,
  ge.event_year,
  'inferred',
  'graph_edges invested_in note ILIKE ''%seed%'' (edge id=' || ge.id || ', ' || ge.source_id || ' → ' || ge.target_id || ')',
  0.7
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%seed%'
  AND ge.note NOT ILIKE '%pre-seed%'
  AND ge.note NOT ILIKE '%pre seed%'
  -- Only insert if this company actually exists
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  -- Skip if we already have a seed transition for this company from timeline_events
  AND NOT EXISTS (
    SELECT 1 FROM stage_transitions st
    WHERE st.company_id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER)
      AND st.to_stage = 'seed'
  )
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series A from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_a',
  NULL,
  ge.event_year,
  'inferred',
  'graph_edges invested_in note ILIKE ''%series a%'' (edge id=' || ge.id || ', ' || ge.source_id || ' → ' || ge.target_id || ')',
  0.75
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%series a%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  AND NOT EXISTS (
    SELECT 1 FROM stage_transitions st
    WHERE st.company_id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER)
      AND st.to_stage = 'series_a'
  )
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series B from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_b',
  NULL,
  ge.event_year,
  'inferred',
  'graph_edges invested_in note ILIKE ''%series b%'' (edge id=' || ge.id || ', ' || ge.source_id || ' → ' || ge.target_id || ')',
  0.75
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%series b%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  AND NOT EXISTS (
    SELECT 1 FROM stage_transitions st
    WHERE st.company_id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER)
      AND st.to_stage = 'series_b'
  )
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series C+ from graph_edges (Series C, D, E)
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_c_plus',
  NULL,
  ge.event_year,
  'inferred',
  'graph_edges invested_in note matches Series C/D/E (edge id=' || ge.id || ')',
  0.75
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND (ge.note ILIKE '%series c%' OR ge.note ILIKE '%series d%' OR ge.note ILIKE '%series e%')
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  AND NOT EXISTS (
    SELECT 1 FROM stage_transitions st
    WHERE st.company_id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER)
      AND st.to_stage = 'series_c_plus'
  )
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Growth from graph_edges (notes mentioning "growth")
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'growth',
  NULL,
  ge.event_year,
  'inferred',
  'graph_edges invested_in note ILIKE ''%growth%'' (edge id=' || ge.id || ')',
  0.6
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%growth%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  AND NOT EXISTS (
    SELECT 1 FROM stage_transitions st
    WHERE st.company_id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER)
      AND st.to_stage = 'growth'
  )
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: BACKFILL stage_transitions FROM CURRENT COMPANY STATE
-- ============================================================
-- Every company should have at least ONE transition record: their current stage.
-- For companies with no transition data yet, insert from_stage=NULL → to_stage=current stage.
-- Use companies.founded as the transition_year fallback.
-- This ensures the Kaplan-Meier estimator has an entry point for every company.

INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, evidence_type, evidence_source, confidence)
SELECT
  c.id,
  NULL,
  c.stage,
  NULL,
  c.founded,
  'backfilled',
  'Current companies.stage value as baseline; transition_year from companies.founded',
  0.5
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM stage_transitions st
  WHERE st.company_id = c.id
    AND st.to_stage = c.stage
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 6: BACKFILL from_stage ON EXISTING TRANSITIONS
-- ============================================================
-- Now that all transitions are inserted, we can infer from_stage by looking at
-- the chronologically previous transition for each company.
-- Stage ordering: pre_seed=1, seed=2, series_a=3, series_b=4, series_c_plus=5, growth=6

UPDATE stage_transitions st
SET from_stage = prev.to_stage
FROM (
  SELECT
    id,
    LAG(to_stage) OVER (
      PARTITION BY company_id
      ORDER BY
        COALESCE(transition_date, make_date(COALESCE(transition_year, 2000), 1, 1)),
        CASE to_stage
          WHEN 'pre_seed'     THEN 1
          WHEN 'seed'         THEN 2
          WHEN 'series_a'     THEN 3
          WHEN 'series_b'     THEN 4
          WHEN 'series_c_plus' THEN 5
          WHEN 'growth'       THEN 6
          ELSE 0
        END
    ) AS prev_stage
  FROM stage_transitions
) prev
WHERE st.id = prev.id
  AND prev.prev_stage IS NOT NULL
  AND st.from_stage IS NULL;


-- ============================================================
-- SECTION 7: BACKFILL companies.status FROM graph_edges
-- ============================================================
-- Companies with 'acquired' or 'acquired_by' relationship in graph_edges → status='acquired'
-- target_id format is 'c_<id>' for companies

UPDATE companies c
SET status = 'acquired'
FROM graph_edges ge
WHERE ge.target_id = 'c_' || c.id::TEXT
  AND ge.rel IN ('acquired', 'acquired_by')
  AND c.status = 'active';

-- Also catch cases where the company is the source of an acquired_by edge
-- (e.g., {source:"c_95", target:"x_ticketcity", rel:"acquired_by"})
UPDATE companies c
SET status = 'acquired'
FROM graph_edges ge
WHERE ge.source_id = 'c_' || c.id::TEXT
  AND ge.rel = 'acquired_by'
  AND c.status = 'active';


-- ============================================================
-- SECTION 8: BACKFILL companies.status FROM listings TABLE
-- ============================================================
-- Companies with exchange listings are likely public (IPO).
-- The listings table has company_id (FK to companies.id), exchange, and ticker.

UPDATE companies c
SET status = 'ipo'
FROM listings l
WHERE l.company_id = c.id
  AND c.status = 'active';


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT 'stage_transitions' AS table_name, COUNT(*) AS row_count FROM stage_transitions
UNION ALL
SELECT 'companies with non-active status', COUNT(*) FROM companies WHERE status <> 'active'
UNION ALL
SELECT 'transitions from timeline_events', COUNT(*) FROM stage_transitions WHERE evidence_type = 'inferred' AND evidence_source LIKE 'timeline_events%'
UNION ALL
SELECT 'transitions from graph_edges', COUNT(*) FROM stage_transitions WHERE evidence_type = 'inferred' AND evidence_source LIKE 'graph_edges%'
UNION ALL
SELECT 'transitions backfilled from current stage', COUNT(*) FROM stage_transitions WHERE evidence_type = 'backfilled';

-- Show stage transition distribution
SELECT to_stage, COUNT(*) AS transition_count
FROM stage_transitions
GROUP BY to_stage
ORDER BY
  CASE to_stage
    WHEN 'pre_seed'      THEN 1
    WHEN 'seed'          THEN 2
    WHEN 'series_a'      THEN 3
    WHEN 'series_b'      THEN 4
    WHEN 'series_c_plus' THEN 5
    WHEN 'growth'        THEN 6
    ELSE 7
  END;

-- Show company status distribution
SELECT status, COUNT(*) AS company_count
FROM companies
GROUP BY status
ORDER BY company_count DESC;

COMMIT;
