-- Migration 118: Create stage_transitions table + backfill, add companies.status
-- Supersedes migration 096 which was never applied.
-- Idempotent: safe to run multiple times.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/118_stage_transitions_and_company_status.sql

BEGIN;

-- ============================================================
-- SECTION 1: CREATE stage_transitions TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stage_transitions (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER NOT NULL REFERENCES companies(id),
  from_stage      VARCHAR(30),
  to_stage        VARCHAR(30) NOT NULL,
  transition_date DATE,
  transition_year INTEGER,
  confidence      NUMERIC(4,2) DEFAULT 0.70,
  evidence_type   VARCHAR(30) DEFAULT 'inferred',   -- 'timeline_event', 'funding_round', 'inferred'
  evidence_source TEXT,
  agent_id        VARCHAR(60) DEFAULT 'migration-118',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_trans_company ON stage_transitions(company_id);
CREATE INDEX IF NOT EXISTS idx_stage_trans_to_stage ON stage_transitions(to_stage);
CREATE INDEX IF NOT EXISTS idx_stage_trans_date ON stage_transitions(transition_date);

-- Unique constraint prevents duplicate stage per company per year
CREATE UNIQUE INDEX IF NOT EXISTS idx_stage_transitions_unique
  ON stage_transitions (company_id, to_stage, COALESCE(transition_year, 0));


-- ============================================================
-- SECTION 2: ADD status COLUMN TO companies
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'status'
  ) THEN
    ALTER TABLE companies
      ADD COLUMN status VARCHAR(20) DEFAULT 'active'
      CHECK (status IN ('active', 'acquired', 'failed', 'ipo', 'inactive'));
  END IF;
END $$;


-- ============================================================
-- SECTION 3: BACKFILL stage_transitions FROM timeline_events
-- ============================================================
-- timeline_events has: event_date, event_type, company_id, detail
-- We pattern-match the detail column for funding round keywords.

-- Pre-seed rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'pre_seed',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.70,
  'timeline_event',
  'timeline_events detail matches pre-seed (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND (te.detail ILIKE '%pre-seed%' OR te.detail ILIKE '%pre seed%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Seed rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'seed',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.75,
  'timeline_event',
  'timeline_events detail matches seed (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND te.detail ILIKE '%seed%'
  AND te.detail NOT ILIKE '%pre-seed%'
  AND te.detail NOT ILIKE '%pre seed%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series A rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_a',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.80,
  'timeline_event',
  'timeline_events detail matches Series A (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND te.detail ILIKE '%series a%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series B rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_b',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.80,
  'timeline_event',
  'timeline_events detail matches Series B (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND te.detail ILIKE '%series b%'
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Series C+ rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'series_c_plus',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.80,
  'timeline_event',
  'timeline_events detail matches Series C/D/E (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND (te.detail ILIKE '%series c%' OR te.detail ILIKE '%series d%' OR te.detail ILIKE '%series e%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;

-- Growth rounds
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (te.company_id)
  te.company_id,
  NULL,
  'growth',
  te.event_date,
  EXTRACT(YEAR FROM te.event_date)::INTEGER,
  0.65,
  'timeline_event',
  'timeline_events detail matches growth funding (event id=' || te.id || ')'
FROM timeline_events te
WHERE te.company_id IS NOT NULL
  AND te.event_type = 'Funding'
  AND te.detail ILIKE '%growth%'
  AND (te.detail ILIKE '%invest%' OR te.detail ILIKE '%round%' OR te.detail ILIKE '%funding%' OR te.detail ILIKE '%raised%')
ORDER BY te.company_id, te.event_date ASC
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: BACKFILL stage_transitions FROM graph_edges
-- ============================================================
-- graph_edges invested_in edges where note mentions round type.
-- target_id format: 'c_<company_id>'

-- Seed from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'seed',
  NULL,
  ge.event_year,
  0.70,
  'funding_round',
  'graph_edges invested_in note matches seed (edge id=' || ge.id || ')'
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%seed%'
  AND ge.note NOT ILIKE '%pre-seed%'
  AND ge.note NOT ILIKE '%pre seed%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series A from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_a',
  NULL,
  ge.event_year,
  0.75,
  'funding_round',
  'graph_edges invested_in note matches Series A (edge id=' || ge.id || ')'
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%series a%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series B from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_b',
  NULL,
  ge.event_year,
  0.75,
  'funding_round',
  'graph_edges invested_in note matches Series B (edge id=' || ge.id || ')'
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND ge.note ILIKE '%series b%'
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;

-- Series C+ from graph_edges
INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT DISTINCT ON (CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
  CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER),
  NULL,
  'series_c_plus',
  NULL,
  ge.event_year,
  0.75,
  'funding_round',
  'graph_edges invested_in note matches Series C/D/E (edge id=' || ge.id || ')'
FROM graph_edges ge
WHERE ge.rel = 'invested_in'
  AND ge.target_id ~ '^c_[0-9]+$'
  AND (ge.note ILIKE '%series c%' OR ge.note ILIKE '%series d%' OR ge.note ILIKE '%series e%')
  AND EXISTS (SELECT 1 FROM companies c WHERE c.id = CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER))
ORDER BY CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER), ge.event_year ASC NULLS LAST
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: BASELINE TRANSITIONS FROM CURRENT COMPANY STAGE
-- ============================================================
-- Every company should have at least one transition record.
-- For companies with no transitions yet, insert their current stage.

INSERT INTO stage_transitions (company_id, from_stage, to_stage, transition_date, transition_year, confidence, evidence_type, evidence_source)
SELECT
  c.id,
  NULL,
  c.stage,
  NULL,
  c.founded,
  0.50,
  'inferred',
  'Baseline from companies.stage; transition_year from companies.founded'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM stage_transitions st
  WHERE st.company_id = c.id
    AND st.to_stage = c.stage
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 6: INFER from_stage FROM CHRONOLOGICAL ORDER
-- ============================================================

UPDATE stage_transitions st
SET from_stage = prev.prev_stage
FROM (
  SELECT
    id,
    LAG(to_stage) OVER (
      PARTITION BY company_id
      ORDER BY
        COALESCE(transition_date, make_date(COALESCE(transition_year, 2000), 1, 1)),
        CASE to_stage
          WHEN 'pre_seed'      THEN 1
          WHEN 'seed'          THEN 2
          WHEN 'series_a'      THEN 3
          WHEN 'series_b'      THEN 4
          WHEN 'series_c_plus' THEN 5
          WHEN 'growth'        THEN 6
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

-- acquired: company is target of 'acquired' edge
UPDATE companies c
SET status = 'acquired'
FROM graph_edges ge
WHERE ge.target_id = 'c_' || c.id::TEXT
  AND ge.rel IN ('acquired', 'acquired_by')
  AND (c.status IS NULL OR c.status = 'active');

-- acquired: company is source of 'acquired_by' edge
UPDATE companies c
SET status = 'acquired'
FROM graph_edges ge
WHERE ge.source_id = 'c_' || c.id::TEXT
  AND ge.rel = 'acquired_by'
  AND (c.status IS NULL OR c.status = 'active');

-- ipo: companies with exchange listings
UPDATE companies c
SET status = 'ipo'
FROM listings l
WHERE l.company_id = c.id
  AND (c.status IS NULL OR c.status = 'active');


-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'stage_transitions total' AS metric, COUNT(*)::TEXT AS value FROM stage_transitions
UNION ALL
SELECT 'transitions from timeline_events', COUNT(*)::TEXT FROM stage_transitions WHERE evidence_type = 'timeline_event'
UNION ALL
SELECT 'transitions from graph_edges', COUNT(*)::TEXT FROM stage_transitions WHERE evidence_type = 'funding_round'
UNION ALL
SELECT 'transitions inferred baseline', COUNT(*)::TEXT FROM stage_transitions WHERE evidence_type = 'inferred'
UNION ALL
SELECT 'companies acquired', COUNT(*)::TEXT FROM companies WHERE status = 'acquired'
UNION ALL
SELECT 'companies ipo', COUNT(*)::TEXT FROM companies WHERE status = 'ipo';

SELECT to_stage, COUNT(*) AS cnt
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

COMMIT;
