-- Migration 123: FK constraints on graph_edges → entity_registry
-- PREREQUISITE: Run the orphan audit query below first. If it returns rows,
-- resolve those orphans before applying this migration.
--
-- Orphan audit:
--   SELECT DISTINCT source_id FROM graph_edges
--   WHERE source_id NOT IN (SELECT canonical_id FROM entity_registry)
--   UNION
--   SELECT DISTINCT target_id FROM graph_edges
--   WHERE target_id NOT IN (SELECT canonical_id FROM entity_registry);
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/123_edge_fk_constraints.sql

BEGIN;

-- Only apply if no orphans exist
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM (
    SELECT source_id AS orphan_id FROM graph_edges
    WHERE source_id NOT IN (SELECT canonical_id FROM entity_registry)
    UNION
    SELECT target_id FROM graph_edges
    WHERE target_id NOT IN (SELECT canonical_id FROM entity_registry)
  ) orphans;

  IF orphan_count > 0 THEN
    RAISE NOTICE '% orphan edge IDs found — skipping FK constraints. Resolve orphans first.', orphan_count;
  ELSE
    ALTER TABLE graph_edges
      ADD CONSTRAINT fk_edge_source FOREIGN KEY (source_id)
      REFERENCES entity_registry(canonical_id);

    ALTER TABLE graph_edges
      ADD CONSTRAINT fk_edge_target FOREIGN KEY (target_id)
      REFERENCES entity_registry(canonical_id);

    RAISE NOTICE 'FK constraints applied successfully.';
  END IF;
END $$;

COMMIT;
