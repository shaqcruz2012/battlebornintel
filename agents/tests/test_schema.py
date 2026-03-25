"""Test that all required tables and columns exist."""

import pytest

REQUIRED_TABLES = [
    "entity_registry", "graph_edges", "companies", "externals",
    "accelerators", "graph_funds", "people", "programs", "ecosystem_orgs",
    "events", "entity_state_history", "agent_search_log", "agent_runs",
    "analysis_results", "node_features", "edge_features",
    "temporal_snapshots", "graph_statistics", "neo4j_sync_queue",
    "gap_interventions", "graph_metrics_cache",
]

async def test_all_required_tables_exist(pool):
    rows = await pool.fetch(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    )
    tables = {r["tablename"] for r in rows}
    for t in REQUIRED_TABLES:
        assert t in tables, f"Missing table: {t}"

async def test_entity_registry_has_tgnn_columns(pool):
    cols = await pool.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'entity_registry'"
    )
    col_names = {r["column_name"] for r in cols}
    required = {"canonical_id", "entity_type", "label", "confidence", "verified",
                "valid_from", "valid_to", "last_queried_at", "search_vector",
                "display_x", "display_y", "display_size", "display_track"}
    for c in required:
        assert c in col_names, f"entity_registry missing column: {c}"

async def test_graph_edges_has_tgnn_columns(pool):
    cols = await pool.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'graph_edges'"
    )
    col_names = {r["column_name"] for r in cols}
    required = {"source_id", "target_id", "rel", "confidence", "verified",
                "valid_from", "valid_to", "event_date", "impact_type", "weight",
                "bidirectional", "edge_category", "data_quality"}
    for c in required:
        assert c in col_names, f"graph_edges missing column: {c}"

async def test_node_features_has_correct_dimensions(pool):
    row = await pool.fetchrow("SELECT array_length(feature_vector, 1) AS dims FROM node_features LIMIT 1")
    if row:
        assert row["dims"] == 32, f"Expected 32-dim node features, got {row['dims']}"

async def test_edge_features_has_correct_dimensions(pool):
    row = await pool.fetchrow("SELECT array_length(feature_vector, 1) AS dims FROM edge_features LIMIT 1")
    if row:
        assert row["dims"] == 31, f"Expected 31-dim edge features, got {row['dims']}"

async def test_neo4j_views_exist(pool):
    views = await pool.fetch(
        "SELECT viewname FROM pg_views WHERE schemaname = 'public'"
    )
    view_names = {r["viewname"] for r in views}
    assert "v_neo4j_nodes" in view_names
    assert "v_neo4j_relationships" in view_names

async def test_sync_triggers_exist(pool):
    triggers = await pool.fetch(
        "SELECT DISTINCT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE 'trg_%'"
    )
    trigger_names = {r["trigger_name"] for r in triggers}
    # Should have entity sync triggers + neo4j sync + state history
    assert len(trigger_names) >= 15, f"Expected 15+ triggers, found {len(trigger_names)}"
