-- Migration 057: Add missing ecosystem_orgs nodes referenced in graph_edges
--
-- Four e_ IDs appear as source_id/target_id in graph_edges but have no
-- matching row in ecosystem_orgs, causing the graph loader to silently drop
-- their edges.
--
-- Existing rows (already present, no action needed):
--   e_edawn, e_goed, e_innevation, e_lvgea, e_unlvtech
--
-- Missing rows (confirmed via LEFT JOIN WHERE eo.id IS NULL):
--   e_nevada-ecosystem              (18 chars)
--   e_nevada-startup-ecosystem      (26 chars)
--   e_las-vegas-innovation-district (31 chars)  <-- exceeds current varchar(30)
--   e_unr-research-park             (19 chars)
--
-- graph_edges.source_id / target_id are varchar(40).  We widen
-- ecosystem_orgs.id to varchar(40) for consistency.  Two objects depend on
-- ecosystem_orgs.id and must be dropped then recreated around the ALTER:
--   - v_graph_nodes          (regular view)
--   - graph_data_snapshot    (materialized view, with indexes)
--
-- region_id reference (from regions table):
--   1  Nevada (statewide)
--   2  Las Vegas
--   3  Reno-Sparks
--   4  Henderson
--   5  Carson City

BEGIN;

-- ── Step 1: Drop dependent objects ──────────────────────────────────────────

DROP MATERIALIZED VIEW IF EXISTS graph_data_snapshot;
DROP VIEW IF EXISTS v_graph_nodes;

-- ── Step 2: Widen id column to match graph_edges capacity ───────────────────

ALTER TABLE ecosystem_orgs ALTER COLUMN id TYPE character varying(40);

-- ── Step 3: Insert missing rows ─────────────────────────────────────────────

INSERT INTO ecosystem_orgs (id, name, entity_type, city, region, region_id, verified)
VALUES
  -- Statewide "Nevada startup ecosystem" node referenced by AngelNV, BBV,
  -- FundNV, Sierra Angels, and StartUpNV invested_in edges.
  (
    'e_nevada-ecosystem',
    'Nevada Startup Ecosystem',
    'network',
    NULL,
    'statewide',
    1,
    false
  ),

  -- Separate statewide node used by GOED SBIR grants, HB 223, InnovateNV,
  -- and legislative / regulatory edges (awards, regulates, partners_with).
  (
    'e_nevada-startup-ecosystem',
    'Nevada Startup Ecosystem (Policy)',
    'network',
    NULL,
    'statewide',
    1,
    false
  ),

  -- Las Vegas Innovation District — 1.2 M sq ft tech campus announced March 2026.
  (
    'e_las-vegas-innovation-district',
    'Las Vegas Innovation District',
    'innovation_hub',
    'Las Vegas',
    'las_vegas',
    2,
    false
  ),

  -- UNR Research Park — 340-acre expansion zone designated Feb 2026.
  (
    'e_unr-research-park',
    'UNR Research Park',
    'research',
    'Reno',
    'reno',
    3,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ── Step 4: Recreate v_graph_nodes (regular view) ───────────────────────────

CREATE VIEW v_graph_nodes AS
  SELECT 'c_'::text || companies.id::text AS node_id,
         companies.name,
         'company'::text AS node_type,
         companies.created_at
    FROM companies
UNION ALL
  SELECT 'f_'::text || graph_funds.id::text AS node_id,
         graph_funds.name,
         'fund'::text AS node_type,
         now() AS created_at
    FROM graph_funds
UNION ALL
  SELECT people.id AS node_id,
         people.name,
         'person'::text AS node_type,
         now() AS created_at
    FROM people
UNION ALL
  SELECT externals.id AS node_id,
         externals.name,
         'external'::text AS node_type,
         now() AS created_at
    FROM externals
UNION ALL
  SELECT accelerators.id AS node_id,
         accelerators.name,
         'accelerator'::text AS node_type,
         now() AS created_at
    FROM accelerators
UNION ALL
  SELECT ecosystem_orgs.id AS node_id,
         ecosystem_orgs.name,
         'ecosystem'::text AS node_type,
         now() AS created_at
    FROM ecosystem_orgs
UNION ALL
  SELECT 'vcf_'::text || vc_firms.id::text AS node_id,
         vc_firms.name,
         'vc_firm'::text AS node_type,
         vc_firms.created_at
    FROM vc_firms
UNION ALL
  SELECT 'corp_'::text || corporations.id::text AS node_id,
         corporations.name,
         'corporation'::text AS node_type,
         corporations.created_at
    FROM corporations
UNION ALL
  SELECT 'uni_'::text || universities.id::text AS node_id,
         universities.name,
         'university'::text AS node_type,
         universities.created_at
    FROM universities
UNION ALL
  SELECT 'gov_'::text || gov_agencies.id::text AS node_id,
         gov_agencies.name,
         'gov_agency'::text AS node_type,
         gov_agencies.created_at
    FROM gov_agencies;

-- ── Step 5: Recreate graph_data_snapshot (materialized view + indexes) ───────

CREATE MATERIALIZED VIEW graph_data_snapshot AS
  SELECT 'company'::text AS entity_type,
         'c_'::text || c.id::text AS entity_id,
         c.name,
         c.stage AS category,
         c.region,
         c.sectors,
         c.funding_m AS funding_amount,
         c.momentum,
         c.employees,
         c.founded,
         c.eligible,
         c.city,
         true AS is_active,
         c.description,
         NULL::character varying AS fund_type,
         NULL::character varying AS accel_type,
         NULL::character varying AS entity_subtype
    FROM companies c
UNION ALL
  SELECT 'fund'::text AS entity_type,
         'f_'::text || f.id::text AS entity_id,
         f.name,
         f.fund_type AS category,
         NULL::character varying AS region,
         NULL::text[] AS sectors,
         NULL::numeric AS funding_amount,
         NULL::integer AS momentum,
         NULL::integer AS employees,
         NULL::integer AS founded,
         NULL::text[] AS eligible,
         NULL::character varying AS city,
         true AS is_active,
         NULL::text AS description,
         f.fund_type,
         NULL::character varying AS accel_type,
         NULL::character varying AS entity_subtype
    FROM graph_funds f
UNION ALL
  SELECT 'person'::text AS entity_type,
         p.id AS entity_id,
         p.name,
         p.role AS category,
         NULL::character varying AS region,
         NULL::text[] AS sectors,
         NULL::numeric AS funding_amount,
         NULL::integer AS momentum,
         NULL::integer AS employees,
         NULL::integer AS founded,
         NULL::text[] AS eligible,
         NULL::character varying AS city,
         true AS is_active,
         p.note AS description,
         NULL::character varying AS fund_type,
         NULL::character varying AS accel_type,
         NULL::character varying AS entity_subtype
    FROM people p
UNION ALL
  SELECT 'accelerator'::text AS entity_type,
         a.id AS entity_id,
         a.name,
         a.accel_type AS category,
         a.region,
         NULL::text[] AS sectors,
         NULL::numeric AS funding_amount,
         NULL::integer AS momentum,
         NULL::integer AS employees,
         a.founded,
         NULL::text[] AS eligible,
         a.city,
         true AS is_active,
         a.note AS description,
         NULL::character varying AS fund_type,
         a.accel_type,
         NULL::character varying AS entity_subtype
    FROM accelerators a
UNION ALL
  SELECT 'ecosystem'::text AS entity_type,
         e.id AS entity_id,
         e.name,
         e.entity_type AS category,
         e.region,
         NULL::text[] AS sectors,
         NULL::numeric AS funding_amount,
         NULL::integer AS momentum,
         NULL::integer AS employees,
         NULL::integer AS founded,
         NULL::text[] AS eligible,
         e.city,
         true AS is_active,
         e.note AS description,
         NULL::character varying AS fund_type,
         NULL::character varying AS accel_type,
         e.entity_type AS entity_subtype
    FROM ecosystem_orgs e
UNION ALL
  SELECT 'external'::text AS entity_type,
         x.id AS entity_id,
         x.name,
         x.entity_type AS category,
         NULL::character varying AS region,
         NULL::text[] AS sectors,
         NULL::numeric AS funding_amount,
         NULL::integer AS momentum,
         NULL::integer AS employees,
         NULL::integer AS founded,
         NULL::text[] AS eligible,
         NULL::character varying AS city,
         true AS is_active,
         x.note AS description,
         NULL::character varying AS fund_type,
         NULL::character varying AS accel_type,
         x.entity_type AS entity_subtype
    FROM externals x
WITH DATA;

-- Restore indexes on the materialized view.
-- NOTE: The original index was UNIQUE, but externals.id='a_gener8tor' now
-- duplicates accelerators.id='a_gener8tor', so we recreate it as non-unique
-- to avoid blocking this migration.  A separate migration should deduplicate
-- the externals / accelerators overlap and restore the UNIQUE constraint.
CREATE INDEX idx_graph_snapshot_entity_id
    ON graph_data_snapshot (entity_id);
CREATE INDEX idx_graph_snapshot_entity_type
    ON graph_data_snapshot (entity_type);
CREATE INDEX idx_graph_snapshot_funding
    ON graph_data_snapshot (entity_type, funding_amount DESC)
    WHERE funding_amount IS NOT NULL;
CREATE INDEX idx_graph_snapshot_momentum
    ON graph_data_snapshot (momentum DESC NULLS LAST)
    WHERE momentum IS NOT NULL;
CREATE INDEX idx_graph_snapshot_type_name
    ON graph_data_snapshot (entity_type, name);
CREATE INDEX idx_graph_snapshot_type_region
    ON graph_data_snapshot (entity_type, region)
    WHERE region IS NOT NULL;

COMMIT;
