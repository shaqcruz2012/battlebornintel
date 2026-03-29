"""Shared pytest fixtures for statistical agent tests."""

from unittest.mock import AsyncMock, MagicMock

import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def mock_pool():
    """Async mock of an asyncpg connection pool.

    Provides ``fetch``, ``fetchrow``, and ``execute`` as AsyncMock objects
    so callers can configure return values per-test.
    """
    pool = MagicMock()
    pool.fetch = AsyncMock(return_value=[])
    pool.fetchrow = AsyncMock(return_value=None)
    pool.execute = AsyncMock(return_value="INSERT 0 1")
    return pool


@pytest.fixture
def sample_companies_df() -> pd.DataFrame:
    """DataFrame with 10 fake companies matching the ``companies`` schema."""
    rng = np.random.default_rng(seed=99)

    stages = ["pre_seed", "seed", "seed", "series_a", "series_a",
              "series_b", "series_b", "series_c_plus", "growth", "public"]
    sectors_choices = [
        ["technology"], ["healthcare"], ["fintech"], ["cleantech"],
        ["technology", "ai"], ["aerospace"], ["biotech"],
        ["logistics"], ["saas"], ["edtech"],
    ]
    cities = ["Las Vegas", "Reno", "Henderson", "Sparks", "Carson City",
              "Las Vegas", "Reno", "Henderson", "Las Vegas", "Reno"]
    regions = ["clark", "washoe", "clark", "washoe", "carson",
               "clark", "washoe", "clark", "clark", "washoe"]
    statuses = ["active"] * 7 + ["acquired", "active", "ipo"]

    return pd.DataFrame({
        "id": list(range(1, 11)),
        "name": [f"Company_{i}" for i in range(1, 11)],
        "stage": stages,
        "sectors": sectors_choices,
        "employees": rng.integers(2, 500, size=10).tolist(),
        "funding_m": np.round(rng.uniform(0.1, 50, size=10), 2).tolist(),
        "momentum": rng.integers(10, 95, size=10).tolist(),
        "founded": rng.integers(2010, 2024, size=10).tolist(),
        "city": cities,
        "region": regions,
        "status": statuses,
    })


@pytest.fixture
def sample_edges_df() -> pd.DataFrame:
    """DataFrame with 15 graph edges: 3 accelerated_by, 4 invested_in (2 from f_ funds), 8 misc."""
    edges = [
        # 3 accelerated_by edges
        {"source_id": "c_1", "target_id": "a_startupnv", "rel": "accelerated_by", "event_year": 2020, "matching_score": 0.9, "notes": None},
        {"source_id": "c_2", "target_id": "a_startupnv", "rel": "accelerated_by", "event_year": 2021, "matching_score": 0.85, "notes": None},
        {"source_id": "c_3", "target_id": "a_techstars", "rel": "accelerated_by", "event_year": 2022, "matching_score": 0.88, "notes": None},
        # 4 invested_in edges (2 from f_ funds)
        {"source_id": "f_bbv", "target_id": "c_4", "rel": "invested_in", "event_year": 2021, "matching_score": 0.95, "notes": None},
        {"source_id": "f_ssbci1", "target_id": "c_5", "rel": "invested_in", "event_year": 2022, "matching_score": 0.92, "notes": None},
        {"source_id": "x_sequoia", "target_id": "c_6", "rel": "invested_in", "event_year": 2023, "matching_score": 0.80, "notes": None},
        {"source_id": "x_a16z", "target_id": "c_7", "rel": "invested_in", "event_year": 2023, "matching_score": 0.78, "notes": None},
        # 8 misc edges
        {"source_id": "c_1", "target_id": "c_2", "rel": "partners_with", "event_year": 2022, "matching_score": 0.70, "notes": None},
        {"source_id": "c_3", "target_id": "c_4", "rel": "partners_with", "event_year": 2023, "matching_score": 0.65, "notes": None},
        {"source_id": "p_john", "target_id": "c_5", "rel": "founded_by", "event_year": 2019, "matching_score": 0.99, "notes": None},
        {"source_id": "p_jane", "target_id": "c_6", "rel": "employed_at", "event_year": 2020, "matching_score": 0.90, "notes": None},
        {"source_id": "c_7", "target_id": "s_tech", "rel": "qualifies_for", "event_year": 2022, "matching_score": 0.75, "notes": None},
        {"source_id": "c_8", "target_id": "c_9", "rel": "partners_with", "event_year": 2023, "matching_score": 0.60, "notes": None},
        {"source_id": "c_9", "target_id": "c_10", "rel": "partners_with", "event_year": 2024, "matching_score": 0.55, "notes": None},
        {"source_id": "c_10", "target_id": "c_1", "rel": "partners_with", "event_year": 2024, "matching_score": 0.50, "notes": None},
    ]
    return pd.DataFrame(edges)


@pytest.fixture
def sample_graph_metrics_df() -> pd.DataFrame:
    """DataFrame with graph metrics for 10 company nodes."""
    rng = np.random.default_rng(seed=42)
    return pd.DataFrame({
        "node_id": [f"c_{i}" for i in range(1, 11)],
        "pagerank": np.round(rng.uniform(0.001, 0.05, size=10), 4).tolist(),
        "betweenness": np.round(rng.uniform(0.0, 0.3, size=10), 4).tolist(),
        "community_id": rng.integers(0, 4, size=10).tolist(),
    }).set_index("node_id")
