-- Migration 137: Backfill outcome_events and treatment_assignments from existing data
-- Derives ground truth from graph_edges, companies, listings, and accelerator connections.
-- All derived data marked confidence < 1.0 and verified = FALSE for review.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. OUTCOME EVENTS — Derive from existing data
-- ═══════════════════════════════════════════════════════════════════════════

-- IPOs: companies with stage='public' and listings
INSERT INTO outcome_events (company_id, outcome_type, outcome_date, notes, confidence, verified)
SELECT
  c.id,
  'ipo',
  COALESCE(c.updated_at::DATE, CURRENT_DATE),
  'Derived: company stage=public with listing on ' || COALESCE(l.exchange, 'unknown'),
  0.8,
  FALSE
FROM companies c
LEFT JOIN listings l ON l.company_id = c.id
WHERE c.stage = 'public'
ON CONFLICT DO NOTHING;

-- Acquisitions: from graph_edges with rel='acquired_by' or 'acquired'
INSERT INTO outcome_events (company_id, outcome_type, outcome_date, acquiring_entity_id, notes, confidence, verified)
SELECT DISTINCT ON (c.id)
  c.id,
  'acquisition',
  ge.event_date,
  CASE WHEN ge.rel = 'acquired_by' THEN ge.target_id ELSE ge.source_id END,
  'Derived from graph edge: ' || ge.rel || ' — ' || COALESCE(ge.note, ''),
  0.7,
  FALSE
FROM companies c
JOIN graph_edges ge ON (
  (ge.source_id = 'c_' || c.id::TEXT AND ge.rel = 'acquired_by')
  OR (ge.target_id = 'c_' || c.id::TEXT AND ge.rel = 'acquired')
)
ORDER BY c.id, ge.event_date DESC
ON CONFLICT DO NOTHING;

-- Still operating: all companies without an outcome event
INSERT INTO outcome_events (company_id, outcome_type, outcome_date, notes, confidence, verified)
SELECT
  c.id,
  'still_operating',
  CURRENT_DATE,
  'Default: no IPO, acquisition, or shutdown detected',
  0.9,
  FALSE
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM outcome_events oe WHERE oe.company_id = c.id
)
ON CONFLICT DO NOTHING;

-- Update companies.outcome_status from outcome_events
UPDATE companies c
SET outcome_status = CASE
  WHEN oe.outcome_type = 'still_operating' THEN 'operating'
  WHEN oe.outcome_type = 'acquisition' THEN 'acquired'
  ELSE oe.outcome_type
END
FROM outcome_events oe
WHERE oe.company_id = c.id
  AND oe.outcome_type NOT IN ('still_operating', 'unknown');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TREATMENT ASSIGNMENTS — Derive from accelerator edges
-- ═══════════════════════════════════════════════════════════════════════════

-- Accelerator treatments: companies connected to accelerators
INSERT INTO treatment_assignments (
  company_id, treatment_type, assignment_date, cohort_name,
  dosage_unit, confidence, verified, agent_id
)
SELECT DISTINCT ON (c.id, ge.source_id)
  c.id,
  'accelerator',
  COALESCE(ge.event_date, ge.valid_from::DATE, c.created_at::DATE),
  er.label,
  'program_months',
  0.75,
  FALSE,
  'migration_137'
FROM companies c
JOIN graph_edges ge ON ge.target_id = 'c_' || c.id::TEXT
  AND ge.rel IN ('accelerated_by', 'won_pitch')
  AND ge.source_id LIKE 'a_%'
LEFT JOIN entity_registry er ON er.canonical_id = ge.source_id
ORDER BY c.id, ge.source_id, ge.event_date DESC
ON CONFLICT DO NOTHING;

-- SSBCI co-investment treatments: companies with BBV/FundNV/1864 invested_in edges
INSERT INTO treatment_assignments (
  company_id, treatment_type, assignment_date, cohort_name,
  dosage_value, dosage_unit, confidence, verified, agent_id
)
SELECT DISTINCT ON (c.id, ge.source_id)
  c.id,
  'co_investment',
  COALESCE(ge.event_date, ge.valid_from::DATE, c.created_at::DATE),
  er.label,
  ge.capital_m,
  'usd_millions',
  0.8,
  FALSE,
  'migration_137'
FROM companies c
JOIN graph_edges ge ON ge.target_id = 'c_' || c.id::TEXT
  AND ge.rel = 'invested_in'
  AND ge.source_id IN ('f_bbv', 'f_fundnv', 'f_1864')
LEFT JOIN entity_registry er ON er.canonical_id = ge.source_id
ORDER BY c.id, ge.source_id, ge.event_date DESC
ON CONFLICT DO NOTHING;

-- Grant treatments: companies connected to grant programs
INSERT INTO treatment_assignments (
  company_id, treatment_type, assignment_date, cohort_name,
  dosage_unit, confidence, verified, agent_id
)
SELECT DISTINCT ON (c.id, ge.source_id)
  c.id,
  'grant',
  COALESCE(ge.event_date, ge.valid_from::DATE, c.created_at::DATE),
  er.label,
  'program_award',
  0.7,
  FALSE,
  'migration_137'
FROM companies c
JOIN graph_edges ge ON ge.target_id = 'c_' || c.id::TEXT
  AND ge.rel IN ('grants_to', 'qualifies_for')
LEFT JOIN entity_registry er ON er.canonical_id = ge.source_id
ORDER BY c.id, ge.source_id, ge.event_date DESC
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

SELECT outcome_type, COUNT(*) AS count
FROM outcome_events GROUP BY outcome_type ORDER BY count DESC;

SELECT treatment_type, COUNT(*) AS count
FROM treatment_assignments GROUP BY treatment_type ORDER BY count DESC;

COMMIT;
