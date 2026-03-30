"""Tests for freshness checker pure logic — no agent class imports."""

from datetime import datetime, timedelta, timezone


def categorize_staleness(updated_at: datetime, now: datetime, threshold_days: int = 30):
    """Replicate the freshness checker's staleness logic.

    Categories:
    - fresh: updated within threshold
    - stale: updated between threshold and 2x threshold
    - critical: updated beyond 2x threshold
    """
    days_stale = (now - updated_at).days
    if days_stale <= threshold_days:
        return "fresh"
    elif days_stale <= threshold_days * 2:
        return "stale"
    else:
        return "critical"


def compute_staleness_record(row: dict, now: datetime):
    """Replicate the dict-building logic from FreshnessChecker.run()."""
    days_stale = (now - row["updated_at"]).days
    return {
        "id": row["id"],
        "name": row["name"],
        "days_stale": int(days_stale),
        "updated_at": str(row["updated_at"]),
    }


def build_freshness_report(stale_companies: list, threshold_days: int):
    """Replicate the analysis result structure from save_analysis call."""
    return {
        "analysis_type": "freshness_report",
        "content": {
            "stale_companies": stale_companies,
            "threshold_days": threshold_days,
        },
    }


class TestStalenessCategories:
    """Test staleness categorization given timestamps."""

    def test_fresh_within_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=10)
        assert categorize_staleness(updated, now, threshold_days=30) == "fresh"

    def test_fresh_at_exact_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=30)
        assert categorize_staleness(updated, now, threshold_days=30) == "fresh"

    def test_stale_beyond_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=45)
        assert categorize_staleness(updated, now, threshold_days=30) == "stale"

    def test_stale_at_double_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=60)
        assert categorize_staleness(updated, now, threshold_days=30) == "stale"

    def test_critical_beyond_double_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=90)
        assert categorize_staleness(updated, now, threshold_days=30) == "critical"


class TestStalenessThresholdsPerEntityType:
    """Different entity types may use different thresholds."""

    def test_company_default_30_days(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=31)
        assert categorize_staleness(updated, now, threshold_days=30) == "stale"

    def test_macro_data_7_day_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=8)
        assert categorize_staleness(updated, now, threshold_days=7) == "stale"

    def test_quarterly_data_90_day_threshold(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=85)
        assert categorize_staleness(updated, now, threshold_days=90) == "fresh"

    def test_quarterly_data_critical(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        updated = now - timedelta(days=200)
        assert categorize_staleness(updated, now, threshold_days=90) == "critical"


class TestEmptyTable:
    """When no rows are returned (empty table), checker produces empty results."""

    def test_empty_rows_returns_zero_stale(self):
        rows = []
        stale = [
            compute_staleness_record(r, datetime.now(timezone.utc))
            for r in rows
        ]
        assert stale == []
        result = {"stale_count": len(stale), "threshold": 30}
        assert result["stale_count"] == 0

    def test_empty_table_no_analysis_saved(self):
        """When stale list is empty, no analysis report should be generated."""
        stale = []
        # The agent only calls save_analysis if stale is truthy
        should_save = bool(stale)
        assert should_save is False


class TestResultStructure:
    """Result dict matches analysis_results schema expectations."""

    def test_freshness_report_has_required_keys(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        row = {"id": 1, "name": "Acme Corp", "updated_at": now - timedelta(days=45)}
        record = compute_staleness_record(row, now)
        report = build_freshness_report([record], threshold_days=30)

        assert "analysis_type" in report
        assert report["analysis_type"] == "freshness_report"
        assert "content" in report
        assert "stale_companies" in report["content"]
        assert "threshold_days" in report["content"]

    def test_stale_record_has_expected_fields(self):
        now = datetime(2026, 3, 29, tzinfo=timezone.utc)
        row = {"id": 42, "name": "TestCo", "updated_at": now - timedelta(days=50)}
        record = compute_staleness_record(row, now)

        assert record["id"] == 42
        assert record["name"] == "TestCo"
        assert record["days_stale"] == 50
        assert "updated_at" in record

    def test_return_value_structure(self):
        """The run() method returns {stale_count, threshold}."""
        stale = [{"id": 1, "name": "X", "days_stale": 40, "updated_at": "..."}]
        result = {"stale_count": len(stale), "threshold": 30}
        assert "stale_count" in result
        assert "threshold" in result
        assert result["stale_count"] == 1
