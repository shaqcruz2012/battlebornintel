-- Graph performance indexes
-- Run with: docker exec -i battlebornintel-postgres-1 psql -U bbi -d battlebornintel < database/migrations/096_graph_performance.sql

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_graph_edges_source_target ON graph_edges(source_id, target_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_computed_scores_company_latest ON computed_scores(company_id, computed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_graph_metrics_latest ON graph_metrics_cache(computed_at DESC);
