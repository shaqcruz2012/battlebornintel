-- Backfill companies.eligible arrays from invested_in graph edges
-- for funds that had edges but were missing from eligible: angelnv, sierra, dcvc, stripes, startupnv

UPDATE companies c
SET eligible = array_cat(
  COALESCE(c.eligible, '{}'),
  ARRAY(
    SELECT REPLACE(ge.source_id, 'f_', '')
    FROM graph_edges ge
    WHERE ge.target_id = 'c_' || c.id::text
    AND ge.rel = 'invested_in'
    AND ge.source_id IN ('f_angelnv', 'f_sierra', 'f_dcvc', 'f_stripes', 'f_startupnv')
    AND NOT (REPLACE(ge.source_id, 'f_', '') = ANY(COALESCE(c.eligible, '{}')))
  )
)
WHERE EXISTS (
  SELECT 1 FROM graph_edges ge
  WHERE ge.target_id = 'c_' || c.id::text
  AND ge.rel = 'invested_in'
  AND ge.source_id IN ('f_angelnv', 'f_sierra', 'f_dcvc', 'f_stripes', 'f_startupnv')
  AND NOT (REPLACE(ge.source_id, 'f_', '') = ANY(COALESCE(c.eligible, '{}')))
);
