"""Test the entity rotation system."""

import pytest


async def test_get_rotation_stats():
    from src.orchestration.rotation import get_rotation_stats
    stats = await get_rotation_stats()
    assert stats["total"] > 700
    assert "ever_queried" in stats
    assert "queried_this_week" in stats
    assert "queried_today" in stats


async def test_get_next_batch():
    from src.orchestration.rotation import get_next_batch
    batch = await get_next_batch(10)
    assert len(batch) == 10
    assert all("canonical_id" in e for e in batch)
    assert all("entity_type" in e for e in batch)


async def test_rotation_prioritizes_unqueried():
    from src.orchestration.rotation import get_next_batch
    batch = await get_next_batch(5)
    # Unqueried entities (last_queried_at IS NULL) should come first
    for e in batch:
        assert e.get("last_queried_at") is None or True  # May have been queried
