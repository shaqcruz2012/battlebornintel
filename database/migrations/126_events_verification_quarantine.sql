-- Migration 126: Events Verification & Quarantine
-- Quarantines events without source URLs, creates verified-only feed.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/126_events_verification_quarantine.sql

BEGIN;

-- Drop existing views that depend on events columns
DROP VIEW IF EXISTS v_timeline CASCADE;
DROP VIEW IF EXISTS v_stakeholder_feed CASCADE;
DROP VIEW IF EXISTS v_verified_events CASCADE;
DROP VIEW IF EXISTS v_unverified_events CASCADE;

-- Add new columns (verified already exists)
ALTER TABLE events ADD COLUMN IF NOT EXISTS quarantined BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS verification_note TEXT;

CREATE INDEX IF NOT EXISTS idx_events_verified ON events(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_quarantined ON events(quarantined) WHERE quarantined = TRUE;

-- Mark events with source_url as verified
UPDATE events
SET verified = TRUE,
    verification_note = 'Has source URL'
WHERE source_url IS NOT NULL
  AND source_url != ''
  AND verified = FALSE;

-- Quarantine events with NO source at all
UPDATE events
SET quarantined = TRUE,
    verification_note = 'No source attribution — quarantined'
WHERE (source IS NULL OR source = '')
  AND (source_url IS NULL OR source_url = '');

-- Flag source-name-only as needing URLs
UPDATE events
SET verification_note = 'Has source name but no URL — needs source_url'
WHERE source IS NOT NULL
  AND source != ''
  AND (source_url IS NULL OR source_url = '')
  AND quarantined = FALSE
  AND verified = FALSE;

-- Verified-only view for production feeds
CREATE OR REPLACE VIEW v_verified_events AS
SELECT id, event_date, event_type, company_id, company_name,
       description, amount_m, location, stakeholder_type,
       source, source_url, data_quality, confidence,
       entity_id, edge_id, event_category, impact_score, metadata,
       created_at
FROM events
WHERE verified = TRUE AND quarantined = FALSE
ORDER BY event_date DESC;

-- Unverified view (needs source URLs)
CREATE OR REPLACE VIEW v_unverified_events AS
SELECT id, event_date, event_type, company_name,
       description, source, verification_note
FROM events
WHERE verified = FALSE AND quarantined = FALSE
ORDER BY event_date DESC;

-- Backward-compat views excluding quarantined
CREATE OR REPLACE VIEW v_timeline AS
SELECT id, event_date, event_type, company_name,
       description AS detail, created_at, entity_id, event_category,
       verified, source_url
FROM events
WHERE quarantined = FALSE
ORDER BY event_date DESC;

CREATE OR REPLACE VIEW v_stakeholder_feed AS
SELECT id, event_date AS activity_date, event_type AS activity_type,
       company_name, description, location, stakeholder_type,
       source, source_url, data_quality, entity_id, event_category,
       verified
FROM events
WHERE quarantined = FALSE AND stakeholder_type IS NOT NULL
ORDER BY event_date DESC;

COMMIT;
