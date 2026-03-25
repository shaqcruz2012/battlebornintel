-- 124_consolidate_events_final.sql
-- Finalize events consolidation: add new columns, backfill, create compat views
BEGIN;

-- ── 1. Add new columns to events ────────────────────────────────────────────
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS entity_id      VARCHAR(80),
  ADD COLUMN IF NOT EXISTS edge_id        INTEGER,
  ADD COLUMN IF NOT EXISTS event_category VARCHAR(30),
  ADD COLUMN IF NOT EXISTS impact_score   NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS metadata       JSONB;

-- ── 2. Indexes on new columns ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_entity_id      ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_edge_id        ON events(edge_id);
CREATE INDEX IF NOT EXISTS idx_events_category       ON events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_date_type      ON events(event_date DESC, event_type);

-- ── 3. Backfill entity_id from company_id ───────────────────────────────────
UPDATE events
SET entity_id = 'c_' || company_id::text
WHERE company_id IS NOT NULL
  AND entity_id IS NULL;

-- ── 4. Absorb timeline_events not yet in events ────────────────────────────
INSERT INTO events (
  event_date, event_type, company_name, company_id, description,
  source_url, confidence, verified, origin, origin_id,
  entity_id, data_quality
)
SELECT
  te.event_date,
  te.event_type,
  te.company_name,
  te.company_id,
  te.detail,
  te.source_url,
  COALESCE(te.confidence, 0.5),
  COALESCE(te.verified, false),
  'timeline',
  'te_' || te.id::text,
  CASE WHEN te.company_id IS NOT NULL THEN 'c_' || te.company_id::text END,
  'INFERRED'
FROM timeline_events te
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.origin_id = 'te_' || te.id::text
);

-- ── 5. Absorb stakeholder_activities not yet in events ─────────────────────
INSERT INTO events (
  event_date, event_type, company_name, description, location,
  stakeholder_type, source, source_url, data_quality, confidence,
  verified, origin, origin_id, entity_id
)
SELECT
  sa.activity_date,
  sa.activity_type,
  COALESCE(sa.display_name, sa.company_id),
  sa.description,
  sa.location,
  sa.stakeholder_type,
  sa.source,
  sa.source_url,
  COALESCE(sa.data_quality, 'INFERRED'),
  CASE WHEN sa.source_url IS NOT NULL THEN 0.85 ELSE 0.5 END,
  sa.source_url IS NOT NULL,
  'stakeholder',
  'sa_' || sa.id::text,
  sa.company_id   -- stakeholder_activities.company_id is already varchar
FROM stakeholder_activities sa
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.origin_id = 'sa_' || sa.id::text
);

-- ── 6. Classify event_category based on event_type ─────────────────────────
UPDATE events
SET event_category = CASE
  WHEN LOWER(event_type) IN ('funding', 'investment', 'grant', 'ipo', 'spac', 'acquisition')
    THEN 'capital'
  WHEN LOWER(event_type) IN ('hiring', 'leadership', 'executive', 'board', 'appointment')
    THEN 'talent'
  WHEN LOWER(event_type) IN ('partnership', 'collaboration', 'mou', 'alliance', 'joint_venture')
    THEN 'network'
  WHEN LOWER(event_type) IN ('product', 'launch', 'patent', 'publication', 'research')
    THEN 'output'
  WHEN LOWER(event_type) IN ('expansion', 'relocation', 'milestone', 'founding', 'growth')
    THEN 'growth'
  WHEN LOWER(event_type) IN ('regulatory', 'legal', 'compliance', 'risk', 'warning', 'layoff')
    THEN 'signal'
  ELSE 'other'
END
WHERE event_category IS NULL;

-- ── 7. Normalize event_type casing to InitCap ──────────────────────────────
UPDATE events
SET event_type = INITCAP(REPLACE(event_type, '_', ' '))
WHERE event_type <> INITCAP(REPLACE(event_type, '_', ' '));

-- ── 8. Backward-compatibility views ────────────────────────────────────────

-- v_timeline: mimics the old timeline_events shape
CREATE OR REPLACE VIEW v_timeline AS
SELECT
  id,
  event_date,
  event_type,
  company_name,
  description AS detail,
  NULL::varchar(20) AS icon,
  created_at,
  NULL::timestamptz  AS occurred_at,
  NULL::integer      AS delta_jobs,
  amount_m           AS delta_capital_m,
  NULL::integer      AS region_id,
  company_id,
  confidence,
  NULL::integer      AS source_id,
  NULL::varchar(50)  AS agent_id,
  verified,
  NULL::timestamptz  AS extracted_at,
  source_url
FROM events;

-- v_stakeholder_feed: mimics the old stakeholder_activities shape
CREATE OR REPLACE VIEW v_stakeholder_feed AS
SELECT
  id,
  entity_id         AS company_id,
  event_type        AS activity_type,
  description,
  location,
  event_date        AS activity_date,
  source,
  data_quality,
  created_at,
  stakeholder_type,
  company_name      AS display_name,
  source_url
FROM events;

COMMIT;
