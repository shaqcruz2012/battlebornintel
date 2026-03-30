-- Migration 010: Drop redundant indexes on graph_edges
--
-- Problem: 72 indexes (4.7 MB) on a 2.5 MB table (1,938 rows).
-- Index-to-data ratio is nearly 2:1, which hurts write performance
-- and wastes memory.  Migration 004 was never applied; this supersedes it.
--
-- Keeping ONLY the essential indexes (7):
--   graph_edges_pkey                 (PK)
--   uq_graph_edges_src_tgt_rel      (uniqueness constraint)
--   idx_graph_edges_source           (source_id lookups / JOINs)
--   idx_graph_edges_target           (target_id lookups / JOINs)
--   idx_edges_category_year          (event_year + edge_category filter — main graph query)
--   idx_graph_edges_verified         (verified-only queries)
--   idx_graph_edges_event_date       (date-range queries)
--
-- Dropping 65 redundant indexes.

BEGIN;

-- Duplicate source_id indexes (keeping idx_graph_edges_source)
DROP INDEX IF EXISTS idx_edges_source;
DROP INDEX IF EXISTS idx_edges_source_id;

-- Duplicate target_id indexes (keeping idx_graph_edges_target)
DROP INDEX IF EXISTS idx_edges_target;
DROP INDEX IF EXISTS idx_edges_target_id;

-- Duplicate/subsumed composite indexes
DROP INDEX IF EXISTS idx_edges_source_target;
DROP INDEX IF EXISTS idx_edges_source_target_rel;
DROP INDEX IF EXISTS idx_graph_edges_source_target;
DROP INDEX IF EXISTS idx_edges_target_source_rel;

-- Duplicate event_year indexes (keeping idx_edges_category_year)
DROP INDEX IF EXISTS idx_edges_event_year;
DROP INDEX IF EXISTS idx_edges_event_year_full;
DROP INDEX IF EXISTS idx_edges_event_year_not_null;
DROP INDEX IF EXISTS idx_edges_event_year_null_recent;
DROP INDEX IF EXISTS idx_graph_edges_event_year;
DROP INDEX IF EXISTS idx_graph_edges_year;
DROP INDEX IF EXISTS idx_edges_year_covering;
DROP INDEX IF EXISTS idx_edges_source_year;
DROP INDEX IF EXISTS idx_edges_target_year;

-- Duplicate rel indexes (rel is low-cardinality; composite with category is enough)
DROP INDEX IF EXISTS idx_edges_rel;
DROP INDEX IF EXISTS idx_edges_rel_category;
DROP INDEX IF EXISTS idx_edges_rel_year;

-- Duplicate category indexes (keeping idx_edges_category_year)
DROP INDEX IF EXISTS idx_edges_category;
DROP INDEX IF EXISTS idx_edges_category_rel;

-- Narrow partial indexes for specific rel values (too specialized, unused)
DROP INDEX IF EXISTS idx_edges_accel_rel;
DROP INDEX IF EXISTS idx_edges_accel_source;
DROP INDEX IF EXISTS idx_edges_accel_target;
DROP INDEX IF EXISTS idx_edges_co_invested;
DROP INDEX IF EXISTS idx_edges_committed_to;
DROP INDEX IF EXISTS idx_edges_endorsed_by;
DROP INDEX IF EXISTS idx_edges_corporate_partner_2026;
DROP INDEX IF EXISTS idx_edges_gov_policy_agent;
DROP INDEX IF EXISTS idx_edges_invested_in_source;
DROP INDEX IF EXISTS idx_edges_lp_relationship_stage;
DROP INDEX IF EXISTS idx_edges_lp_source_confidence;
DROP INDEX IF EXISTS idx_edges_lp_type;
DROP INDEX IF EXISTS idx_edges_operates_fund;
DROP INDEX IF EXISTS idx_edges_partners_with_2026;
DROP INDEX IF EXISTS idx_edges_person_rel;
DROP INDEX IF EXISTS idx_edges_person_source;
DROP INDEX IF EXISTS idx_edges_person_target;
DROP INDEX IF EXISTS idx_edges_pilots_with_2026;
DROP INDEX IF EXISTS idx_edges_potential_lp;
DROP INDEX IF EXISTS idx_edges_potential_lp_score;
DROP INDEX IF EXISTS idx_edges_research_partnership;
DROP INDEX IF EXISTS idx_edges_source_name_gov_uni;
DROP INDEX IF EXISTS idx_edges_typed_source;
DROP INDEX IF EXISTS idx_edges_typed_target;
DROP INDEX IF EXISTS idx_edges_university_agent;

-- Opportunity-specific indexes (opportunity edges are rare)
DROP INDEX IF EXISTS idx_edges_fund_opp_score;
DROP INDEX IF EXISTS idx_edges_fund_opportunity;
DROP INDEX IF EXISTS idx_edges_opportunity_category;
DROP INDEX IF EXISTS idx_edges_opportunity_dates;
DROP INDEX IF EXISTS idx_edges_opportunity_edges;
DROP INDEX IF EXISTS idx_edges_opportunity_score;

-- Miscellaneous rarely-used indexes
DROP INDEX IF EXISTS idx_edges_bidirectional;
DROP INDEX IF EXISTS idx_edges_capital;
DROP INDEX IF EXISTS idx_edges_confidence;
DROP INDEX IF EXISTS idx_edges_data_quality;
DROP INDEX IF EXISTS idx_edges_expires_at;
DROP INDEX IF EXISTS idx_edges_fund_invested;
DROP INDEX IF EXISTS idx_edges_impact_type;
DROP INDEX IF EXISTS idx_edges_metadata;
DROP INDEX IF EXISTS idx_edges_public_inst;
DROP INDEX IF EXISTS idx_edges_temporal_range;
DROP INDEX IF EXISTS idx_edges_unverified;
DROP INDEX IF EXISTS idx_edges_weight;

COMMIT;

-- Update statistics after index changes
ANALYZE graph_edges;
