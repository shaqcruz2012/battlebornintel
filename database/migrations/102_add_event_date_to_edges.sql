-- Add event_date column for temporal analytics
-- Backfill from event_year using YYYY-01-01 convention where exact dates unknown

ALTER TABLE graph_edges ADD COLUMN IF NOT EXISTS event_date DATE;

-- Backfill: event_year → YYYY-01-01
UPDATE graph_edges
SET event_date = make_date(event_year, 1, 1)
WHERE event_year IS NOT NULL AND event_date IS NULL;

-- Create index for temporal queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_graph_edges_event_date
ON graph_edges(event_date DESC) WHERE event_date IS NOT NULL;

-- Also populate eligible_since from event_date where empty
UPDATE graph_edges
SET eligible_since = event_date
WHERE eligible_since IS NULL AND event_date IS NOT NULL;
