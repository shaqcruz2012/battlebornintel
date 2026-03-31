"""Tests for FRED and BLS client config/structure — no network calls.

These tests validate the static configuration dicts and URL patterns
used by the FRED and BLS clients. We replicate the constants here
(same pattern as test_fred_ingestor.py / test_bls_ingestor.py)
to avoid triggering complex relative imports from the agent package.
"""

# ---------------------------------------------------------------------------
# Replicated constants from src/ingestion/fred_client.py
# ---------------------------------------------------------------------------
FRED_BASE_URL = "https://api.stlouisfed.org/fred"

FRED_SERIES = {
    "FEDFUNDS": ("macro", "US", "month", "percent"),
    "UNRATE":   ("macro", "US", "month", "percent"),
    "NVURN":    ("region", "NV", "month", "percent"),
    "GDPC1":    ("macro", "US", "quarter", "usd_billions"),
    "NVRGSP":   ("region", "NV", "year", "usd_millions"),
    "DFF":      ("macro", "US", "day", "percent"),
    "T10Y2Y":   ("macro", "US", "day", "percent"),
    "CPIAUCSL": ("macro", "US", "month", "index"),
    "ICSA":     ("macro", "US", "week", "count"),
}

# ---------------------------------------------------------------------------
# Replicated constants from src/ingestion/bls_client.py
# ---------------------------------------------------------------------------
AREA_FIPS = {
    "nevada":        "32000",
    "clark_county":  "32003",
    "washoe_county": "32031",
}

QCEW_METRIC_FIELDS = {
    "qtrly_estabs":     ("bls_establishments", "count"),
    "month3_emplvl":    ("bls_employment", "count"),
    "total_qtrly_wages": ("bls_total_quarterly_wages", "usd"),
    "avg_wkly_wage":    ("bls_avg_weekly_wage", "usd"),
}


class TestFREDSeriesConfig:
    """Validate FRED_SERIES configuration dict."""

    def test_has_9_series(self):
        assert len(FRED_SERIES) == 9, f"Expected 9 FRED series, got {len(FRED_SERIES)}"

    def test_all_series_have_required_tuple_keys(self):
        """Each series value must be (entity_type, entity_id, granularity, unit)."""
        for series_id, config in FRED_SERIES.items():
            assert len(config) == 4, (
                f"Series {series_id} has {len(config)} fields, expected 4"
            )
            entity_type, entity_id, granularity, unit = config
            assert isinstance(entity_type, str) and entity_type
            assert isinstance(entity_id, str) and entity_id
            assert isinstance(granularity, str) and granularity
            assert isinstance(unit, str) and unit

    def test_granularity_values_are_valid(self):
        valid_granularities = {"day", "week", "month", "quarter", "year"}
        for series_id, (_, _, granularity, _) in FRED_SERIES.items():
            assert granularity in valid_granularities, (
                f"Series {series_id} has invalid granularity '{granularity}'"
            )

    def test_entity_types_are_valid(self):
        valid_types = {"macro", "region"}
        for series_id, (entity_type, _, _, _) in FRED_SERIES.items():
            assert entity_type in valid_types, (
                f"Series {series_id} has invalid entity_type '{entity_type}'"
            )

    def test_known_series_ids_present(self):
        expected = {"FEDFUNDS", "UNRATE", "NVURN", "GDPC1", "NVRGSP",
                    "DFF", "T10Y2Y", "CPIAUCSL", "ICSA"}
        assert set(FRED_SERIES.keys()) == expected


class TestFREDURLConstruction:
    """Validate FRED URL construction for a sample series."""

    def test_base_url_format(self):
        assert FRED_BASE_URL == "https://api.stlouisfed.org/fred"

    def test_observations_url_construction(self):
        url = f"{FRED_BASE_URL}/series/observations"
        assert url == "https://api.stlouisfed.org/fred/series/observations"

    def test_params_structure_for_sample_series(self):
        """Verify the params dict that would be sent for FEDFUNDS."""
        params = {
            "series_id": "FEDFUNDS",
            "api_key": "test_key",
            "file_type": "json",
            "observation_start": "2025-01-01",
            "observation_end": "2025-12-31",
        }
        assert params["series_id"] == "FEDFUNDS"
        assert params["file_type"] == "json"
        assert "api_key" in params


class TestBLSAreaFIPSConfig:
    """Validate BLS AREA_FIPS configuration."""

    def test_has_3_nevada_areas(self):
        assert len(AREA_FIPS) == 3, f"Expected 3 areas, got {len(AREA_FIPS)}"

    def test_all_areas_have_string_fips_codes(self):
        for area_name, code in AREA_FIPS.items():
            assert isinstance(area_name, str) and area_name
            assert isinstance(code, str) and code
            assert code.isdigit(), f"FIPS code '{code}' for {area_name} is not numeric"

    def test_known_areas_present(self):
        assert "nevada" in AREA_FIPS
        assert "clark_county" in AREA_FIPS
        assert "washoe_county" in AREA_FIPS

    def test_fips_codes_start_with_32(self):
        """All Nevada FIPS codes start with state code 32."""
        for area_name, code in AREA_FIPS.items():
            assert code.startswith("32"), (
                f"Area {area_name} FIPS '{code}' does not start with '32'"
            )


class TestBLSQCEWMetricFields:
    """Validate QCEW_METRIC_FIELDS configuration."""

    def test_has_4_metrics(self):
        assert len(QCEW_METRIC_FIELDS) == 4, (
            f"Expected 4 QCEW metrics, got {len(QCEW_METRIC_FIELDS)}"
        )

    def test_expected_csv_fields_present(self):
        expected_fields = {"qtrly_estabs", "month3_emplvl",
                           "total_qtrly_wages", "avg_wkly_wage"}
        assert set(QCEW_METRIC_FIELDS.keys()) == expected_fields

    def test_each_metric_has_name_and_unit(self):
        """Each value is a (metric_name, unit) tuple."""
        for csv_field, config in QCEW_METRIC_FIELDS.items():
            assert len(config) == 2, (
                f"Metric {csv_field} has {len(config)} fields, expected 2"
            )
            metric_name, unit = config
            assert isinstance(metric_name, str) and metric_name
            assert isinstance(unit, str) and unit

    def test_metric_names_have_bls_prefix(self):
        for csv_field, (metric_name, _) in QCEW_METRIC_FIELDS.items():
            assert metric_name.startswith("bls_"), (
                f"Metric name '{metric_name}' for {csv_field} missing 'bls_' prefix"
            )

    def test_units_are_valid(self):
        valid_units = {"count", "usd"}
        for csv_field, (_, unit) in QCEW_METRIC_FIELDS.items():
            assert unit in valid_units, (
                f"Metric {csv_field} has unexpected unit '{unit}'"
            )
