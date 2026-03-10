-- Migration 063: Fix graph_data_snapshot unique index and remove bad opportunity edges
--
-- Fix 1 — graph_data_snapshot UNIQUE index:
--   `a_gener8tor` appears in both the `accelerators` table (canonical record,
--   id='a_gener8tor') and the `externals` table (erroneously inserted by
--   migration 055 as entity_type='VC Firm').  Because graph_data_snapshot
--   UNION ALLs both tables, the entity_id 'a_gener8tor' appears twice, which
--   prevented the UNIQUE index from being created.
--
--   Root cause: Migration 055 inserted externals (id='a_gener8tor') to resolve
--   graph_edges references.  However, the `a_` prefix is the canonical namespace
--   for the `accelerators` table.  The graph_edges that use 'a_gener8tor' are
--   resolved by the accelerators UNION branch, and the x_gener8tor /
--   x_gener8tor_109 / x_gener8tor_accel / x_gener8tor_lv rows in externals
--   already cover the x_-prefixed graph edge references.
--
-- Fix 2 — bad fund_opportunity edges pointing to programs:
--   Migration 041 created 21 `fund_opportunity` edges from f_dfv (Desert Forge
--   Ventures) to program IDs (p_1 … p_25) instead of company IDs (c_N).  The
--   `fund_opportunity` relationship is defined as fund → company; fund → program
--   edges with this rel type break /api/opportunities with:
--   "invalid input syntax for type integer: p_1".
--   These edges are semantically incorrect and are removed.
--
-- Safe to re-run: DELETEs are idempotent (rows gone = no-op); index ops use
-- DROP IF EXISTS + CREATE UNIQUE INDEX.

BEGIN;

-- ── Step 1: Remove the erroneous externals entry ─────────────────────────────
-- The a_ prefix belongs to the accelerators table.  The x_gener8tor rows in
-- externals already satisfy all x_-prefixed graph_edges references.

DELETE FROM externals
WHERE id = 'a_gener8tor';

-- ── Step 2: Remove fund_opportunity edges that incorrectly point to programs ──
-- Migration 041 created fund → program edges using rel='fund_opportunity'.
-- The /api/opportunities query expects target_id to be 'c_N' (company) for
-- this rel type.  All 21 such edges originate from f_dfv.

DELETE FROM graph_edges
WHERE rel = 'fund_opportunity'
  AND edge_category = 'opportunity'
  AND target_id LIKE 'p_%';

-- ── Step 3: Refresh the materialized view ────────────────────────────────────
-- Re-populate with the corrected data (no duplicate a_gener8tor).

REFRESH MATERIALIZED VIEW graph_data_snapshot;

-- ── Step 4: Restore UNIQUE index on entity_id ────────────────────────────────
-- Drop the non-unique placeholder index that migration 057 created as a
-- workaround, then recreate it as UNIQUE now that the duplicate is gone.

DROP INDEX IF EXISTS idx_graph_snapshot_entity_id;

CREATE UNIQUE INDEX idx_graph_snapshot_entity_id
    ON graph_data_snapshot (entity_id);

COMMIT;
