-- Migration 058: Add missing accelerator nodes referenced by graph_edges
--
-- Unresolved a_ node IDs found via:
--   SELECT DISTINCT e.node_id FROM (
--     SELECT source_id AS node_id FROM graph_edges WHERE source_id LIKE 'a_%'
--     UNION
--     SELECT target_id FROM graph_edges WHERE target_id LIKE 'a_%'
--   ) e
--   LEFT JOIN accelerators ac ON ac.id = e.node_id
--   WHERE ac.id IS NULL
--
-- Result: a_gener8tor, a_techstars
--
-- All other candidates from the common Nevada accelerator list
-- (a_startupnv, a_blackfire, a_angelnv, a_gbeta_nv, a_gener8tor_lv,
--  a_zerolabs, a_adamshub, a_afwerx, a_innevator, a_dtp)
-- already exist in the accelerators table.

BEGIN;

INSERT INTO accelerators (id, name, accel_type, city, region, verified)
VALUES
  -- a_gener8tor: generic/national gener8tor node referenced in Beloit Kombucha
  --   seed-round edges; distinct from the Nevada-specific a_gener8tor_lv and
  --   a_gener8tor_reno records that already exist.
  ('a_gener8tor', 'gener8tor', 'accelerator', 'Various', NULL, false),

  -- a_techstars: national Techstars brand referenced in Elly Health edges
  --   (accelerated_by / invested_in); no Nevada-specific Techstars row exists.
  ('a_techstars', 'Techstars', 'accelerator', 'Various', NULL, false)

ON CONFLICT (id) DO NOTHING;

COMMIT;
