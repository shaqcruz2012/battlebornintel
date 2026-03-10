-- Migration 004: Drop redundant indexes on graph_edges
--
-- Problem: 59 indexes (11 MB) on a 6.5 MB table. Most are unused.
--
-- Keeping 7 essential indexes:
--   graph_edges_pkey              (PK)
--   idx_graph_edges_event_year    (event_year queries)
--   idx_graph_edges_source        (source_id lookups/joins)
--   idx_graph_edges_target        (target_id lookups/joins)
--   idx_graph_edges_rel           (rel filtering)
--   idx_graph_edges_verified      (data quality)
--   idx_edges_category            (edge_category filtering)
--
-- Dropping 52 redundant indexes in a single transaction.

BEGIN;

DROP INDEX IF EXISTS idx_edges_accel_rel;
DROP INDEX IF EXISTS idx_edges_accel_source;
DROP INDEX IF EXISTS idx_edges_accel_target;
DROP INDEX IF EXISTS idx_edges_category_rel;
DROP INDEX IF EXISTS idx_edges_co_invested;
DROP INDEX IF EXISTS idx_edges_committed_to;
DROP INDEX IF EXISTS idx_edges_confidence;
DROP INDEX IF EXISTS idx_edges_corporate_partner_2026;
DROP INDEX IF EXISTS idx_edges_data_quality;
DROP INDEX IF EXISTS idx_edges_endorsed_by;
DROP INDEX IF EXISTS idx_edges_event_year;
DROP INDEX IF EXISTS idx_edges_event_year_full;
DROP INDEX IF EXISTS idx_edges_event_year_not_null;
DROP INDEX IF EXISTS idx_edges_event_year_null_recent;
DROP INDEX IF EXISTS idx_edges_fund_opp_score;
DROP INDEX IF EXISTS idx_edges_fund_opportunity;
DROP INDEX IF EXISTS idx_edges_gov_policy_agent;
DROP INDEX IF EXISTS idx_edges_invested_in_source;
DROP INDEX IF EXISTS idx_edges_lp_relationship_stage;
DROP INDEX IF EXISTS idx_edges_lp_source_confidence;
DROP INDEX IF EXISTS idx_edges_lp_type;
DROP INDEX IF EXISTS idx_edges_operates_fund;
DROP INDEX IF EXISTS idx_edges_opportunity_category;
DROP INDEX IF EXISTS idx_edges_opportunity_dates;
DROP INDEX IF EXISTS idx_edges_opportunity_edges;
DROP INDEX IF EXISTS idx_edges_opportunity_score;
DROP INDEX IF EXISTS idx_edges_partners_with_2026;
DROP INDEX IF EXISTS idx_edges_person_rel;
DROP INDEX IF EXISTS idx_edges_person_source;
DROP INDEX IF EXISTS idx_edges_person_target;
DROP INDEX IF EXISTS idx_edges_pilots_with_2026;
DROP INDEX IF EXISTS idx_edges_potential_lp;
DROP INDEX IF EXISTS idx_edges_potential_lp_score;
DROP INDEX IF EXISTS idx_edges_rel;
DROP INDEX IF EXISTS idx_edges_rel_category;
DROP INDEX IF EXISTS idx_edges_rel_year;
DROP INDEX IF EXISTS idx_edges_research_partnership;
DROP INDEX IF EXISTS idx_edges_source;
DROP INDEX IF EXISTS idx_edges_source_id;
DROP INDEX IF EXISTS idx_edges_source_name_gov_uni;
DROP INDEX IF EXISTS idx_edges_source_target;
DROP INDEX IF EXISTS idx_edges_source_target_rel;
DROP INDEX IF EXISTS idx_edges_source_year;
DROP INDEX IF EXISTS idx_edges_target;
DROP INDEX IF EXISTS idx_edges_target_id;
DROP INDEX IF EXISTS idx_edges_target_year;
DROP INDEX IF EXISTS idx_edges_typed_source;
DROP INDEX IF EXISTS idx_edges_typed_target;
DROP INDEX IF EXISTS idx_edges_university_agent;
DROP INDEX IF EXISTS idx_edges_unverified;
DROP INDEX IF EXISTS idx_edges_weight;
DROP INDEX IF EXISTS idx_edges_year_covering;

COMMIT;
