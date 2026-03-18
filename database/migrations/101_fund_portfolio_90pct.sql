BEGIN;

-- Sierra Angels: add 2 seed/pre-seed Reno companies to reach 15/15 (100%)
-- Battle Born Beer (seed, Reno) and HiBear (pre_seed, Reno) match Sierra Angels' profile
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year)
SELECT 'f_sierra', 'c_' || c.id::text, 'invested_in', 'Sierra Angels portfolio company', 2024
FROM companies c
WHERE c.id IN (80, 41)
AND NOT EXISTS (
  SELECT 1 FROM graph_edges
  WHERE source_id = 'f_sierra' AND target_id = 'c_' || c.id::text AND rel = 'invested_in'
);

COMMIT;
