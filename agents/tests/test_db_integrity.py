"""Test database integrity — entity registry, edges, features."""

import pytest

async def test_entity_registry_count(pool):
    count = await pool.fetchval("SELECT count(*) FROM entity_registry")
    assert count > 700, f"Expected 700+ entities, got {count}"

async def test_entity_registry_matches_source_tables(pool):
    registry = await pool.fetchval("SELECT count(*) FROM entity_registry")
    sources = await pool.fetchval("""
        SELECT (SELECT count(*) FROM companies) +
               (SELECT count(*) FROM externals) +
               (SELECT count(*) FROM accelerators) +
               (SELECT count(*) FROM graph_funds) +
               (SELECT count(*) FROM people) +
               (SELECT count(*) FROM programs) +
               (SELECT count(*) FROM ecosystem_orgs)
    """)
    assert registry == sources, f"Registry {registry} != sources {sources}"

async def test_no_orphan_edges(pool):
    orphans = await pool.fetchval("""
        SELECT count(*) FROM graph_edges
        WHERE source_id NOT IN (SELECT canonical_id FROM entity_registry)
           OR target_id NOT IN (SELECT canonical_id FROM entity_registry)
    """)
    assert orphans == 0, f"{orphans} orphan edges found"

async def test_all_edges_have_valid_from(pool):
    missing = await pool.fetchval("SELECT count(*) FROM graph_edges WHERE valid_from IS NULL")
    assert missing == 0, f"{missing} edges missing valid_from"

async def test_all_edges_have_confidence(pool):
    missing = await pool.fetchval("SELECT count(*) FROM graph_edges WHERE confidence IS NULL")
    assert missing == 0, f"{missing} edges missing confidence"

async def test_all_edges_have_data_quality(pool):
    missing = await pool.fetchval("SELECT count(*) FROM graph_edges WHERE data_quality IS NULL")
    assert missing == 0, f"{missing} edges missing data_quality"

async def test_no_duplicate_edges(pool):
    dupes = await pool.fetchval("""
        SELECT count(*) FROM (
            SELECT source_id, target_id, rel FROM graph_edges
            GROUP BY source_id, target_id, rel HAVING count(*) > 1
        ) d
    """)
    assert dupes == 0, f"{dupes} duplicate edge groups"

async def test_verified_events_have_source_url(pool):
    bad = await pool.fetchval(
        "SELECT count(*) FROM events WHERE verified = TRUE AND (source_url IS NULL OR source_url = '')"
    )
    assert bad == 0, f"{bad} verified events missing source_url"

async def test_node_features_coverage(pool):
    entities = await pool.fetchval("SELECT count(*) FROM entity_registry")
    features = await pool.fetchval("SELECT count(DISTINCT canonical_id) FROM node_features")
    coverage = features / entities if entities > 0 else 0
    assert coverage >= 0.9, f"Node feature coverage {coverage:.1%} < 90%"

async def test_edge_features_coverage(pool):
    edges = await pool.fetchval("SELECT count(*) FROM graph_edges")
    features = await pool.fetchval("SELECT count(*) FROM edge_features")
    coverage = features / edges if edges > 0 else 0
    assert coverage >= 0.9, f"Edge feature coverage {coverage:.1%} < 90%"

async def test_temporal_snapshots_exist(pool):
    count = await pool.fetchval("SELECT count(*) FROM temporal_snapshots")
    assert count >= 1, "No temporal snapshots found"

async def test_graph_statistics_exist(pool):
    count = await pool.fetchval("SELECT count(*) FROM graph_statistics")
    assert count >= 1, "No graph statistics found"
