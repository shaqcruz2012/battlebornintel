BEGIN;

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  event_date DATE NOT NULL,
  event_type VARCHAR(30) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  company_name VARCHAR(100),
  description TEXT,
  amount_m NUMERIC(10,2),
  location VARCHAR(100),
  stakeholder_type VARCHAR(30),
  source VARCHAR(100),
  source_url TEXT,
  data_quality VARCHAR(20) DEFAULT 'INFERRED',
  confidence FLOAT DEFAULT 0.5,
  verified BOOLEAN DEFAULT false,
  origin VARCHAR(30) NOT NULL, -- 'timeline', 'stakeholder', 'graph_edge'
  origin_id VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_company ON events(company_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_stakeholder ON events(stakeholder_type);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_verified ON events(verified);
CREATE INDEX idx_events_origin ON events(origin);

-- Backfill from timeline_events
INSERT INTO events (event_date, event_type, company_name, company_id, description, source_url, confidence, verified, origin, origin_id)
SELECT event_date, event_type, company_name, company_id, detail, source_url,
  COALESCE(confidence, 0.5), COALESCE(verified, false), 'timeline', 'te_' || id::text
FROM timeline_events;

-- Backfill from stakeholder_activities
INSERT INTO events (event_date, event_type, company_name, description, location, stakeholder_type, source, source_url, data_quality, confidence, verified, origin, origin_id)
SELECT activity_date, activity_type, COALESCE(display_name, company_id), description, location, stakeholder_type, source, source_url,
  COALESCE(data_quality, 'INFERRED'),
  CASE WHEN source_url IS NOT NULL THEN 0.85 ELSE 0.5 END,
  source_url IS NOT NULL,
  'stakeholder', 'sa_' || id::text
FROM stakeholder_activities;

-- Deduplicate: keep the row with the best source quality
DELETE FROM events a USING events b
WHERE a.id > b.id
  AND LOWER(a.company_name) = LOWER(b.company_name)
  AND a.event_date = b.event_date
  AND LOWER(a.event_type) = LOWER(b.event_type)
  AND a.verified <= b.verified;

COMMIT;
