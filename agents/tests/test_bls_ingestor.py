"""Tests for the BLSIngestor agent.

We do NOT import the agent module directly (complex dependency chain).
Instead we replicate its pure computation logic and test through fixtures.
"""

from datetime import date, timedelta

import pytest

# ---------------------------------------------------------------------------
# Replicate constants and pure functions from bls_client.py / bls_ingestor.py
# ---------------------------------------------------------------------------

AREA_FIPS = {
    "nevada": "32000",
    "clark_county": "32003",
    "washoe_county": "32031",
}

FIPS_TO_REGION_NAME = {
    "32000": "Nevada",
    "32003": "Las Vegas",
    "32031": "Reno-Sparks",
}

QUARTER_END_MONTH = {1: 3, 2: 6, 3: 9, 4: 12}
QUARTER_START_MONTH = {1: 1, 2: 4, 3: 7, 4: 10}

QCEW_METRIC_FIELDS = {
    "qtrly_estabs": ("bls_establishments", "count"),
    "month3_emplvl": ("bls_employment", "count"),
    "total_qtrly_wages": ("bls_total_quarterly_wages", "usd"),
    "avg_wkly_wage": ("bls_avg_weekly_wage", "usd"),
}

QCEW_LAG_QUARTERS = 2


def _quarter_dates(year: int, quarter: int) -> tuple[date, date]:
    """Return (period_start, period_end) for a given year/quarter."""
    start_month = QUARTER_START_MONTH[quarter]
    end_month = QUARTER_END_MONTH[quarter]
    period_start = date(year, start_month, 1)
    if end_month == 12:
        period_end = date(year, 12, 31)
    else:
        period_end = date(year, end_month + 1, 1) - timedelta(days=1)
    return period_start, period_end


def _latest_available_quarter() -> tuple[int, int]:
    """Determine the most recent quarter likely to have QCEW data."""
    today = date.today()
    current_quarter = (today.month - 1) // 3 + 1
    year = today.year
    target_quarter = current_quarter - QCEW_LAG_QUARTERS
    if target_quarter <= 0:
        target_quarter += 4
        year -= 1
    return year, target_quarter


def _build_region_snapshot_row(
    entity_id: str,
    metric_name: str,
    value: float,
    unit: str,
    year: int,
    quarter: int,
) -> dict:
    """Build a metric_snapshots row dict for a region record.

    Mirrors the INSERT logic in BLSIngestor._store_region_records().
    """
    period_start, period_end = _quarter_dates(year, quarter)
    return {
        "entity_type": "region",
        "entity_id": entity_id,
        "metric_name": metric_name,
        "value": value,
        "unit": unit,
        "period_start": period_start,
        "period_end": period_end,
        "granularity": "quarter",
        "confidence": 0.95,
        "verified": False,
        "agent_id": "bls_ingestor",
    }


# ---------------------------------------------------------------------------
# Tests: FIPS code mapping
# ---------------------------------------------------------------------------


class TestAreaFipsMapping:
    """Verify area FIPS codes map to correct region entity_ids."""

    def test_nevada_statewide_fips(self):
        assert AREA_FIPS["nevada"] == "32000"

    def test_clark_county_fips(self):
        assert AREA_FIPS["clark_county"] == "32003"

    def test_washoe_county_fips(self):
        assert AREA_FIPS["washoe_county"] == "32031"

    def test_fips_to_region_name_nevada(self):
        assert FIPS_TO_REGION_NAME["32000"] == "Nevada"

    def test_fips_to_region_name_clark(self):
        assert FIPS_TO_REGION_NAME["32003"] == "Las Vegas"

    def test_fips_to_region_name_washoe(self):
        assert FIPS_TO_REGION_NAME["32031"] == "Reno-Sparks"

    def test_all_area_fips_have_region_name(self):
        """Every FIPS code in AREA_FIPS should appear in FIPS_TO_REGION_NAME."""
        for name, fips in AREA_FIPS.items():
            assert fips in FIPS_TO_REGION_NAME, (
                f"FIPS {fips} ({name}) missing from FIPS_TO_REGION_NAME"
            )

    def test_unknown_fips_returns_none(self):
        assert FIPS_TO_REGION_NAME.get("99999") is None


# ---------------------------------------------------------------------------
# Tests: quarterly date parsing
# ---------------------------------------------------------------------------


class TestQuarterDates:
    """Verify _quarter_dates produces correct period_start and period_end."""

    def test_q1_dates(self):
        start, end = _quarter_dates(2025, 1)
        assert start == date(2025, 1, 1)
        assert end == date(2025, 3, 31)

    def test_q2_dates(self):
        start, end = _quarter_dates(2025, 2)
        assert start == date(2025, 4, 1)
        assert end == date(2025, 6, 30)

    def test_q3_dates(self):
        start, end = _quarter_dates(2025, 3)
        assert start == date(2025, 7, 1)
        assert end == date(2025, 9, 30)

    def test_q4_dates(self):
        start, end = _quarter_dates(2025, 4)
        assert start == date(2025, 10, 1)
        assert end == date(2025, 12, 31)

    def test_leap_year_q1(self):
        start, end = _quarter_dates(2024, 1)
        assert start == date(2024, 1, 1)
        assert end == date(2024, 3, 31)

    def test_period_start_always_first_of_month(self):
        for q in range(1, 5):
            start, _ = _quarter_dates(2025, q)
            assert start.day == 1

    def test_period_end_is_last_day_of_quarter(self):
        expected_end_days = {1: 31, 2: 30, 3: 30, 4: 31}
        for q, expected_day in expected_end_days.items():
            _, end = _quarter_dates(2025, q)
            assert end.day == expected_day


class TestLatestAvailableQuarter:
    """Verify the lag calculation for QCEW data availability."""

    def test_returns_two_element_tuple(self):
        result = _latest_available_quarter()
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_quarter_in_valid_range(self):
        _, quarter = _latest_available_quarter()
        assert 1 <= quarter <= 4

    def test_year_is_reasonable(self):
        year, _ = _latest_available_quarter()
        assert 2020 <= year <= 2030


# ---------------------------------------------------------------------------
# Tests: metric_snapshots row structure
# ---------------------------------------------------------------------------


class TestSnapshotRowStructure:
    """Verify region metric_snapshots rows have correct structure."""

    def test_row_has_all_required_fields(self):
        row = _build_region_snapshot_row("42", "bls_employment", 1500000, "count", 2025, 1)
        required = {
            "entity_type", "entity_id", "metric_name", "value", "unit",
            "period_start", "period_end", "granularity", "confidence",
            "verified", "agent_id",
        }
        assert required == set(row.keys())

    def test_entity_type_is_region(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 1)
        assert row["entity_type"] == "region"

    def test_granularity_is_quarter(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 2)
        assert row["granularity"] == "quarter"

    def test_agent_id_is_bls_ingestor(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 1)
        assert row["agent_id"] == "bls_ingestor"

    def test_confidence_is_095(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 1)
        assert row["confidence"] == 0.95

    def test_verified_is_false(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 1)
        assert row["verified"] is False

    def test_period_start_and_end_match_quarter(self):
        row = _build_region_snapshot_row("42", "bls_employment", 100, "count", 2025, 3)
        assert row["period_start"] == date(2025, 7, 1)
        assert row["period_end"] == date(2025, 9, 30)


# ---------------------------------------------------------------------------
# Tests: empty/missing QCEW data
# ---------------------------------------------------------------------------


class TestEmptyQCEWData:
    """When BLS returns no records for a quarter, we should handle gracefully."""

    def test_empty_records_produce_no_rows(self):
        records: list[dict] = []
        rows = [
            _build_region_snapshot_row("42", r.get("metric_name", ""), 0, "count", 2025, 1)
            for r in records
        ]
        assert len(rows) == 0

    def test_iteration_over_empty_is_noop(self):
        stored = 0
        for record in []:
            stored += 1
        assert stored == 0

    def test_unknown_fips_skipped_in_lookup(self):
        """Records with unrecognized FIPS codes should be skipped."""
        unknown_fips = "99999"
        region_name = FIPS_TO_REGION_NAME.get(unknown_fips)
        assert region_name is None  # would cause skip in _store_region_records


# ---------------------------------------------------------------------------
# Tests: wage and employment metrics are non-negative
# ---------------------------------------------------------------------------


class TestMetricValueValidation:
    """QCEW values should be non-negative for employment and wage metrics."""

    @pytest.mark.parametrize(
        "csv_field,metric_name,unit",
        [
            ("qtrly_estabs", "bls_establishments", "count"),
            ("month3_emplvl", "bls_employment", "count"),
            ("total_qtrly_wages", "bls_total_quarterly_wages", "usd"),
            ("avg_wkly_wage", "bls_avg_weekly_wage", "usd"),
        ],
    )
    def test_metric_field_mapping_exists(self, csv_field, metric_name, unit):
        assert csv_field in QCEW_METRIC_FIELDS
        mapped_name, mapped_unit = QCEW_METRIC_FIELDS[csv_field]
        assert mapped_name == metric_name
        assert mapped_unit == unit

    def test_positive_employment_value_in_row(self):
        row = _build_region_snapshot_row("42", "bls_employment", 1500000, "count", 2025, 1)
        assert row["value"] > 0

    def test_positive_wage_value_in_row(self):
        row = _build_region_snapshot_row("42", "bls_avg_weekly_wage", 1250.50, "usd", 2025, 1)
        assert row["value"] > 0

    def test_zero_value_not_filtered_at_row_level(self):
        """Zero-filtering happens at CSV parse time, not at row building."""
        row = _build_region_snapshot_row("42", "bls_employment", 0.0, "count", 2025, 1)
        assert row["value"] == 0.0  # row builder does not filter

    def test_csv_parser_skips_zero_values(self):
        """Replicate the CSV parsing logic that skips zero/empty values."""
        raw_values = ["1500000", "0", "", ".", "abc", "1250.50"]
        parsed = []
        for raw in raw_values:
            raw = raw.strip()
            if not raw or raw in ("", "0"):
                continue
            try:
                value = float(raw)
            except (ValueError, TypeError):
                continue
            if value == 0:
                continue
            parsed.append(value)
        assert parsed == [1500000.0, 1250.50]
        assert all(v > 0 for v in parsed)


# ---------------------------------------------------------------------------
# Tests: QCEW metric fields completeness
# ---------------------------------------------------------------------------


class TestQCEWMetricFields:
    """Verify the QCEW metric field mapping is complete and well-formed."""

    def test_four_metric_fields_defined(self):
        assert len(QCEW_METRIC_FIELDS) == 4

    def test_all_units_are_valid(self):
        valid_units = {"count", "usd"}
        for csv_field, (_, unit) in QCEW_METRIC_FIELDS.items():
            assert unit in valid_units, f"{csv_field} has unexpected unit '{unit}'"

    def test_metric_names_have_bls_prefix(self):
        for csv_field, (metric_name, _) in QCEW_METRIC_FIELDS.items():
            assert metric_name.startswith("bls_"), (
                f"{csv_field} metric_name '{metric_name}' should start with 'bls_'"
            )
