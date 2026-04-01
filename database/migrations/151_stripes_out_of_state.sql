-- Migration 151: Reclassify Stripes as out-of-state investor
--
-- Stripes is a NYC-based growth equity firm, not a Nevada fund.
-- Add is_local column to funds table so the API can distinguish
-- Nevada-based funds from out-of-state investors that happen to
-- have a funds row.

BEGIN;

-- 1. Add is_local flag (defaults TRUE so existing NV funds are unaffected)
ALTER TABLE funds ADD COLUMN IF NOT EXISTS is_local BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Mark Stripes as out-of-state
UPDATE funds SET is_local = FALSE WHERE id = 'stripes';

-- 3. Ensure Stripes exists in externals as an i_ investor so it
--    appears in the "Out-of-State Investors" section.
--    Also insert an invested_in edge from i_stripes -> c_10 (Katalyst).
INSERT INTO externals (id, name, entity_type, note, verified)
VALUES ('i_stripes', 'Stripes', 'VC Firm', 'NYC-based growth equity. Katalyst Series A lead.', true)
ON CONFLICT (id) DO NOTHING;

-- Add invested_in edge for the i_ node so the investors query picks it up
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category)
VALUES ('i_stripes', 'c_10', 'invested_in', 'Series A lead', 2023, 'historical')
ON CONFLICT (source_id, target_id, rel) DO NOTHING;

COMMIT;
