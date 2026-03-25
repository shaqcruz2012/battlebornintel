-- Migration 125: Edge-event linkage and enriched edge metadata
--
-- Adds impact_type, numeric weight, bidirectional flag, expires_at, and metadata
-- to graph_edges. Backfills from existing data. Links events to edges.
--
-- NOTE: The existing JSONB "weight" column is renamed to "metadata" (which is
-- exactly the new metadata column we need). A new NUMERIC weight column is added.
--
-- Run: node -e "..." or psql -U bbi -d battlebornintel -f database/migrations/125_edge_event_linkage.sql

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Schema changes on graph_edges
-- ═══════════════════════════════════════════════════════════════════════════════

-- Rename existing JSONB "weight" → "metadata" (preserves deal_size_m etc.)
ALTER TABLE graph_edges RENAME COLUMN weight TO metadata;

-- New columns
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS impact_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS bidirectional BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add edge_id to events if it doesn't exist yet (safe — another agent may add it)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS edge_id INTEGER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Indexes
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_edges_impact_type ON graph_edges(impact_type);
CREATE INDEX IF NOT EXISTS idx_edges_weight ON graph_edges(weight);
CREATE INDEX IF NOT EXISTS idx_edges_bidirectional ON graph_edges(bidirectional) WHERE bidirectional = TRUE;
CREATE INDEX IF NOT EXISTS idx_edges_expires_at ON graph_edges(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_edges_metadata ON graph_edges USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_events_edge_id ON events(edge_id) WHERE edge_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Backfill impact_type based on rel values
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE graph_edges SET impact_type = CASE
  WHEN rel IN ('invested_in', 'loaned_to', 'funded', 'funded_by', 'funds', 'grants_to') THEN 'capital_flow'
  WHEN rel IN ('accelerated_by', 'won_pitch') THEN 'knowledge_transfer'
  WHEN rel IN ('partners_with', 'partnered_with', 'contracts_with', 'contracted_with', 'collaborated_with') THEN 'market_access'
  WHEN rel IN ('manages') THEN 'talent_flow'
  WHEN rel IN ('supports', 'program_of', 'housed_at') THEN 'infrastructure'
  WHEN rel IN ('filed_with', 'approved_by') THEN 'regulatory'
  WHEN rel IN ('backed_by_founders_of', 'spinout_of', 'spun_out_from', 'employees_from') THEN 'talent_flow'
  WHEN rel IN ('acquired', 'acquired_by') THEN 'capital_flow'
  ELSE NULL
END
WHERE impact_type IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Backfill weight from confidence and data_quality
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE graph_edges SET weight = CASE
  WHEN data_quality = 'HIGH' THEN COALESCE(confidence, 0.5) * 1.0
  WHEN data_quality = 'MEDIUM' THEN COALESCE(confidence, 0.5) * 0.7
  WHEN data_quality = 'LOW' THEN COALESCE(confidence, 0.5) * 0.4
  ELSE 0.5
END;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Set bidirectional flag for symmetric relationships
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE graph_edges SET bidirectional = TRUE
WHERE rel IN ('partners_with', 'partnered_with', 'collaborated_with');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Link events to edges where possible
--    Match on: event entity matches edge target, and event_type maps to rel
-- ═══════════════════════════════════════════════════════════════════════════════

-- Funding events → capital_flow edges (match via entity_registry label)
UPDATE events e SET edge_id = sub.edge_id
FROM (
  SELECT DISTINCT ON (ev.id) ev.id AS event_id, ge.id AS edge_id
  FROM events ev
  JOIN entity_registry er ON LOWER(er.label) = LOWER(ev.company_name)
  JOIN graph_edges ge ON (ge.target_id = er.canonical_id OR ge.source_id = er.canonical_id)
  WHERE ev.edge_id IS NULL
    AND ev.company_name IS NOT NULL
    AND LOWER(ev.event_type) IN ('funding', 'grant', 'award')
    AND ge.rel IN ('invested_in', 'funded', 'funded_by', 'funds', 'grants_to')
    AND (
      ev.event_date IS NULL OR ge.event_date IS NULL
      OR ABS(ev.event_date - ge.event_date) <= 180
    )
  ORDER BY ev.id, ABS(COALESCE(ev.event_date - ge.event_date, 0))
) sub
WHERE e.id = sub.event_id;

-- Partnership events → market_access edges
UPDATE events e SET edge_id = sub.edge_id
FROM (
  SELECT DISTINCT ON (ev.id) ev.id AS event_id, ge.id AS edge_id
  FROM events ev
  JOIN entity_registry er ON LOWER(er.label) = LOWER(ev.company_name)
  JOIN graph_edges ge ON (ge.target_id = er.canonical_id OR ge.source_id = er.canonical_id)
  WHERE ev.edge_id IS NULL
    AND ev.company_name IS NOT NULL
    AND LOWER(ev.event_type) IN ('partnership')
    AND ge.rel IN ('partners_with', 'partnered_with', 'collaborated_with', 'contracts_with', 'contracted_with')
    AND (
      ev.event_date IS NULL OR ge.event_date IS NULL
      OR ABS(ev.event_date - ge.event_date) <= 180
    )
  ORDER BY ev.id, ABS(COALESCE(ev.event_date - ge.event_date, 0))
) sub
WHERE e.id = sub.event_id;

-- Acquisition events → acquired / acquired_by edges
UPDATE events e SET edge_id = sub.edge_id
FROM (
  SELECT DISTINCT ON (ev.id) ev.id AS event_id, ge.id AS edge_id
  FROM events ev
  JOIN entity_registry er ON LOWER(er.label) = LOWER(ev.company_name)
  JOIN graph_edges ge ON (ge.target_id = er.canonical_id OR ge.source_id = er.canonical_id)
  WHERE ev.edge_id IS NULL
    AND ev.company_name IS NOT NULL
    AND LOWER(ev.event_type) IN ('acquisition')
    AND ge.rel IN ('acquired', 'acquired_by')
    AND (
      ev.event_date IS NULL OR ge.event_date IS NULL
      OR ABS(ev.event_date - ge.event_date) <= 365
    )
  ORDER BY ev.id, ABS(COALESCE(ev.event_date - ge.event_date, 0))
) sub
WHERE e.id = sub.event_id;

-- Launch / Milestone events → knowledge_transfer edges
UPDATE events e SET edge_id = sub.edge_id
FROM (
  SELECT DISTINCT ON (ev.id) ev.id AS event_id, ge.id AS edge_id
  FROM events ev
  JOIN entity_registry er ON LOWER(er.label) = LOWER(ev.company_name)
  JOIN graph_edges ge ON (ge.target_id = er.canonical_id OR ge.source_id = er.canonical_id)
  WHERE ev.edge_id IS NULL
    AND ev.company_name IS NOT NULL
    AND LOWER(ev.event_type) IN ('launch', 'milestone')
    AND ge.rel IN ('accelerated_by', 'won_pitch')
    AND (
      ev.event_date IS NULL OR ge.event_date IS NULL
      OR ABS(ev.event_date - ge.event_date) <= 365
    )
  ORDER BY ev.id, ABS(COALESCE(ev.event_date - ge.event_date, 0))
) sub
WHERE e.id = sub.event_id;

COMMIT;
