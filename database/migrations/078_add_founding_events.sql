-- Migration 078: Add "Founding" timeline events for companies that lack them
-- 103 companies have no Founding event; all 127 companies have a founded year.
-- Uses ON CONFLICT DO NOTHING for idempotency.

BEGIN;

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon, company_id, confidence, verified)
SELECT
  MAKE_DATE(c.founded, 1, 1),
  'Founding',
  c.name,
  'Founded in ' || c.city || ', Nevada'
    || CASE
         WHEN c.description IS NOT NULL AND c.description != ''
         THEN '. ' || LEFT(c.description, 120)
         ELSE ''
       END,
  'rocket',
  c.id,
  0.9,
  false
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events te
  WHERE LOWER(te.company_name) = LOWER(c.name)
    AND te.event_type = 'Founding'
)
AND c.founded IS NOT NULL
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

COMMIT;
