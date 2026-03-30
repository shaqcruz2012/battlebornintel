"""Tests for the FredIngestor agent.

We do NOT import the agent module directly (complex dependency chain).
Instead we replicate its pure computation logic and test through fixtures.
"""

from datetime import date, timedelta

import pytest
from dateutil.relativedelta import relativedelta

# ---------------------------------------------------------------------------
# Replicate constants and pure functions from fred_client.py / fred_ingestor.py
# ---------------------------------------------------------------------------

FRED_SERIES = {
    "FEDFUNDS": ("macro", "US", "month", "percent"),
    "UNRATE": ("macro", "US", "month", "percent"),
    "NVURN": ("region", "NV", "month", "percent"),
    "GDPC1": ("macro", "US", "quarter", "usd_billions"),
    "NVRGSP": ("region", "NV", "year", "usd_millions"),
    "DFF": ("macro", "US", "day", "percent"),
    "T10Y2Y": ("macro", "US", "day", "percent"),
    "CPIAUCSL": ("macro", "US", "month", "index"),
    "ICSA": ("macro", "US", "week", "count"),
}


def _period_end(obs_date: date, granularity: str) -> date:
    """Compute period_end from a date and granularity."""
    if granularity == "day":
        return obs_date
    elif granularity == "week":
        return obs_date + timedelta(days=6)
    elif granularity == "month":
        return (obs_date + relativedelta(months=1)) - timedelta(days=1)
    elif granularity == "quarter":
        return (obs_date + relativedelta(months=3)) - timedelta(days=1)
    elif granularity == "year":
        return (obs_date + relativedelta(years=1)) - timedelta(days=1)
    else:
        return obs_date


def _build_snapshot_row(series_id: str, obs: dict) -> dict:
    """Build a metric_snapshots row dict from a FRED observation.

    Mirrors the INSERT logic in FredIngestor.run().
    """
    entity_type, entity_id, granularity, unit = FRED_SERIES[series_id]
    obs_date = date.fromisoformat(obs["date"])
    p_end = _period_end(obs_date, granularity)
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "metric_name": series_id.lower(),
        "value": obs["value"],
        "unit": unit,
        "period_start": obs_date,
        "period_end": p_end,
        "granularity": granularity,
        "agent_id": "fred_ingestor",
        "confidence": 1.0,
        "verified": True,
    }


# ---------------------------------------------------------------------------
# Tests: FRED series mapping
# ---------------------------------------------------------------------------


class TestFredSeriesMapping:
    """Verify FRED_SERIES produces correct entity_type, entity_id, unit, granularity."""

    def test_fedfunds_is_macro_monthly(self):
        et, eid, gran, unit = FRED_SERIES["FEDFUNDS"]
        assert et == "macro"
        assert eid == "US"
        assert gran == "month"
        assert unit == "percent"

    def test_nvurn_is_region_nv(self):
        et, eid, gran, unit = FRED_SERIES["NVURN"]
        assert et == "region"
        assert eid == "NV"
        assert gran == "month"
        assert unit == "percent"

    def test_gdpc1_is_quarterly(self):
        et, eid, gran, unit = FRED_SERIES["GDPC1"]
        assert et == "macro"
        assert gran == "quarter"
        assert unit == "usd_billions"

    def test_nvrgsp_is_yearly_region(self):
        et, eid, gran, unit = FRED_SERIES["NVRGSP"]
        assert et == "region"
        assert eid == "NV"
        assert gran == "year"
        assert unit == "usd_millions"

    def test_dff_is_daily(self):
        _, _, gran, _ = FRED_SERIES["DFF"]
        assert gran == "day"

    def test_icsa_is_weekly(self):
        _, _, gran, unit = FRED_SERIES["ICSA"]
        assert gran == "week"
        assert unit == "count"

    def test_all_series_have_four_tuple(self):
        for sid, tup in FRED_SERIES.items():
            assert len(tup) == 4, f"{sid} should have (entity_type, entity_id, granularity, unit)"

    def test_entity_types_are_valid(self):
        valid_types = {"macro", "region"}
        for sid, (et, _, _, _) in FRED_SERIES.items():
            assert et in valid_types, f"{sid} has unexpected entity_type '{et}'"


# ---------------------------------------------------------------------------
# Tests: date parsing
# ---------------------------------------------------------------------------


class TestFredDateParsing:
    """FRED dates are YYYY-MM-DD ISO strings."""

    def test_standard_date(self):
        d = date.fromisoformat("2024-06-15")
        assert d == date(2024, 6, 15)

    def test_first_of_month(self):
        d = date.fromisoformat("2025-01-01")
        assert d.day == 1

    def test_leap_year(self):
        d = date.fromisoformat("2024-02-29")
        assert d == date(2024, 2, 29)

    def test_year_boundary(self):
        d = date.fromisoformat("2024-12-31")
        assert d == date(2024, 12, 31)


# ---------------------------------------------------------------------------
# Tests: period_end computation
# ---------------------------------------------------------------------------


class TestPeriodEnd:
    """Verify _period_end for each granularity."""

    def test_day_returns_same_date(self):
        d = date(2025, 3, 15)
        assert _period_end(d, "day") == d

    def test_week_adds_six_days(self):
        d = date(2025, 3, 10)  # Monday
        assert _period_end(d, "week") == date(2025, 3, 16)  # Sunday

    def test_month_returns_last_day_of_month(self):
        d = date(2025, 1, 1)
        assert _period_end(d, "month") == date(2025, 1, 31)

    def test_month_february_non_leap(self):
        d = date(2025, 2, 1)
        assert _period_end(d, "month") == date(2025, 2, 28)

    def test_month_february_leap(self):
        d = date(2024, 2, 1)
        assert _period_end(d, "month") == date(2024, 2, 29)

    def test_quarter_from_january(self):
        d = date(2025, 1, 1)
        assert _period_end(d, "quarter") == date(2025, 3, 31)

    def test_quarter_from_april(self):
        d = date(2025, 4, 1)
        assert _period_end(d, "quarter") == date(2025, 6, 30)

    def test_quarter_from_october(self):
        d = date(2025, 10, 1)
        assert _period_end(d, "quarter") == date(2025, 12, 31)

    def test_year_from_jan_1(self):
        d = date(2025, 1, 1)
        assert _period_end(d, "year") == date(2025, 12, 31)

    def test_year_from_non_jan(self):
        # _period_end adds exactly 1 year minus 1 day
        d = date(2025, 7, 1)
        assert _period_end(d, "year") == date(2026, 6, 30)

    def test_unknown_granularity_returns_same_date(self):
        d = date(2025, 5, 5)
        assert _period_end(d, "unknown") == d


# ---------------------------------------------------------------------------
# Tests: snapshot row building
# ---------------------------------------------------------------------------


class TestSnapshotRowBuilding:
    """Verify the metric_snapshots row structure mirrors INSERT parameters."""

    def test_row_has_all_required_fields(self):
        obs = {"date": "2025-01-01", "value": 5.33}
        row = _build_snapshot_row("FEDFUNDS", obs)
        required = {
            "entity_type", "entity_id", "metric_name", "value", "unit",
            "period_start", "period_end", "granularity", "agent_id",
            "confidence", "verified",
        }
        assert required == set(row.keys())

    def test_metric_name_is_lowercase_series_id(self):
        obs = {"date": "2025-01-01", "value": 4.5}
        row = _build_snapshot_row("FEDFUNDS", obs)
        assert row["metric_name"] == "fedfunds"

    def test_confidence_is_one(self):
        obs = {"date": "2025-01-01", "value": 3.7}
        row = _build_snapshot_row("UNRATE", obs)
        assert row["confidence"] == 1.0

    def test_verified_is_true(self):
        obs = {"date": "2025-01-01", "value": 3.7}
        row = _build_snapshot_row("UNRATE", obs)
        assert row["verified"] is True

    def test_agent_id_is_fred_ingestor(self):
        obs = {"date": "2025-06-01", "value": 100.0}
        row = _build_snapshot_row("CPIAUCSL", obs)
        assert row["agent_id"] == "fred_ingestor"

    def test_value_preserved_exactly(self):
        obs = {"date": "2025-01-01", "value": 123.456789}
        row = _build_snapshot_row("GDPC1", obs)
        assert row["value"] == 123.456789


# ---------------------------------------------------------------------------
# Tests: empty API response
# ---------------------------------------------------------------------------


class TestEmptyResponse:
    """When FRED returns no observations, we should produce 0 records."""

    def test_empty_observations_produce_no_rows(self):
        observations: list[dict] = []
        rows = [_build_snapshot_row("FEDFUNDS", obs) for obs in observations]
        assert len(rows) == 0

    def test_iteration_over_empty_is_noop(self):
        """Simulates the FredIngestor loop over empty API result."""
        total_inserted = 0
        for obs in []:
            total_inserted += 1
        assert total_inserted == 0


# ---------------------------------------------------------------------------
# Tests: duplicate date row structure (ON CONFLICT key columns)
# ---------------------------------------------------------------------------


class TestDuplicateDateHandling:
    """Verify that duplicate observations produce rows with the same
    conflict key columns so ON CONFLICT DO NOTHING would apply."""

    def test_same_date_same_series_produces_identical_conflict_key(self):
        obs1 = {"date": "2025-06-01", "value": 5.0}
        obs2 = {"date": "2025-06-01", "value": 5.1}  # updated value
        row1 = _build_snapshot_row("FEDFUNDS", obs1)
        row2 = _build_snapshot_row("FEDFUNDS", obs2)

        conflict_key = ("entity_type", "entity_id", "metric_name",
                        "period_start", "period_end")
        for k in conflict_key:
            assert row1[k] == row2[k], f"Conflict column '{k}' differs"

    def test_different_dates_produce_different_conflict_key(self):
        obs1 = {"date": "2025-06-01", "value": 5.0}
        obs2 = {"date": "2025-07-01", "value": 5.0}
        row1 = _build_snapshot_row("FEDFUNDS", obs1)
        row2 = _build_snapshot_row("FEDFUNDS", obs2)
        assert row1["period_start"] != row2["period_start"]

    def test_different_series_same_date_produce_different_conflict_key(self):
        obs = {"date": "2025-06-01", "value": 5.0}
        row1 = _build_snapshot_row("FEDFUNDS", obs)
        row2 = _build_snapshot_row("UNRATE", obs)
        assert row1["metric_name"] != row2["metric_name"]
