-- Migration 154: Remove unrecognized programs (IDs 36 and 86)
-- These do not correspond to verified Nevada programs.

BEGIN;

-- Remove graph edges referencing these programs (p_ prefix used in graph_edges)
DELETE FROM graph_edges WHERE source_id IN ('p_36', 'p_86') OR target_id IN ('p_36', 'p_86');

-- Remove any metric snapshots for these programs
DELETE FROM metric_snapshots WHERE entity_type = 'program' AND entity_id IN ('36', '86');

-- Remove the programs themselves
DELETE FROM programs WHERE id IN (36, 86);

COMMIT;
