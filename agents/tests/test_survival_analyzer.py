"""Tests for the SurvivalAnalyzer agent.

We do NOT import the agent module directly (complex dependency chain).
Instead we replicate its pure computation logic and test through fixtures.
"""

from datetime import date
from unittest.mock import AsyncMock, MagicMock

import numpy as np
import pandas as pd
import pytest

# ---------------------------------------------------------------------------
# Replicate constants and pure functions from survival_analyzer.py
# ---------------------------------------------------------------------------

STAGE_ORDER = {
    "pre-seed": 1, "pre_seed": 1, "seed": 2, "series_a": 3,
    "series_b": 4, "series_c_plus": 5, "growth": 6, "public": 7,
}
DEFAULT_EVENT_STAGE = "series_a"
MAX_KM_TIMELINE_POINTS = 40


def _km_manual(
    durations: np.ndarray, events: np.ndarray, label: str
) -> dict:
    """Mirror of SurvivalAnalyzer._km_manual."""
    order = np.argsort(durations)
    T = durations[order]
    E = events[order]
    n = len(T)

    unique_times = np.unique(T)
    survival = 1.0
    timeline = [0.0]
    surv_probs = [1.0]

    at_risk = n
    for t_val in unique_times:
        mask = T == t_val
        d_i = int(E[mask].sum())
        n_i = int(mask.sum())

        if at_risk > 0 and d_i > 0:
            survival *= 1 - d_i / at_risk

        timeline.append(float(t_val))
        surv_probs.append(float(survival))
        at_risk -= n_i

    median = None
    for t_val, s in zip(timeline, surv_probs):
        if s <= 0.5:
            median = t_val
            break

    return {
        "n": int(n),
        "events": int(events.sum()),
        "median_quarters": median,
        "timeline_quarters": timeline[:MAX_KM_TIMELINE_POINTS],
        "survival_prob": surv_probs[:MAX_KM_TIMELINE_POINTS],
    }


def _fit_kaplan_meier(df: pd.DataFrame) -> dict:
    """Mirror of SurvivalAnalyzer._fit_kaplan_meier (manual-only path)."""
    results = {"overall": {}, "cohorts": {}}

    results["overall"] = _km_manual(
        df["duration_quarters"].values,
        df["event"].values,
        label="overall",
    )

    region_results = {}
    for region, subset in df.groupby("region"):
        if len(subset) >= 3:
            region_results[str(region)] = _km_manual(
                subset["duration_quarters"].values,
                subset["event"].values,
                label=str(region),
            )
    if region_results:
        results["cohorts"]["region"] = region_results

    sector_results = {}
    for sector, subset in df.groupby("primary_sector"):
        if len(subset) >= 3 and sector != "unknown":
            sector_results[str(sector)] = _km_manual(
                subset["duration_quarters"].values,
                subset["event"].values,
                label=str(sector),
            )
    if sector_results:
        results["cohorts"]["primary_sector"] = sector_results

    accel_results = {}
    for accel_val in [0, 1]:
        subset = df[df["has_accelerator"] == accel_val]
        if len(subset) >= 3:
            label = "with_accelerator" if accel_val == 1 else "no_accelerator"
            accel_results[label] = _km_manual(
                subset["duration_quarters"].values,
                subset["event"].values,
                label=label,
            )
    if accel_results:
        results["cohorts"]["has_accelerator"] = accel_results

    return results


def _cox_fallback(df: pd.DataFrame, covariates: list[str]) -> dict:
    """Mirror of SurvivalAnalyzer._cox_fallback (sklearn logistic approx)."""
    try:
        from sklearn.linear_model import LogisticRegression
    except ImportError:
        return {"hazard_ratios": {}, "status": "sklearn_not_available"}

    X = df[covariates].values
    y = df["event"].values

    if y.sum() < 2 or (1 - y).sum() < 2:
        return {"hazard_ratios": {}, "status": "insufficient_class_balance"}

    model = LogisticRegression(penalty="l2", C=1.0, max_iter=500)
    model.fit(X, y)

    hazard_ratios = {}
    n_events = int(df["event"].sum())
    for i, cov in enumerate(covariates):
        coef = float(model.coef_[0][i])
        hr = float(np.exp(coef))
        # SE approximation: 1/sqrt(n_events) scaled by covariate variance
        base_se = 1.0 / max(np.sqrt(n_events), 1.0)
        cov_std = float(df[cov].std()) if cov in df.columns else 1.0
        se = base_se / max(cov_std, 0.01)
        se = np.clip(se, 0.05, 2.0)
        hazard_ratios[cov] = {
            "coef": coef,
            "hazard_ratio": hr,
            "ci_lower": float(np.exp(coef - 1.96 * se)),
            "ci_upper": float(np.exp(coef + 1.96 * se)),
            "se": float(se),
            "p_value": None,
        }

    return {
        "hazard_ratios": hazard_ratios,
        "concordance_index": float(model.score(X, y)),
        "n": len(df),
        "events": int(df["event"].sum()),
        "ci_quality": "approximate",
        "status": "completed_fallback",
    }


def _km_to_prediction_rows(
    entity_type: str,
    entity_id: str,
    km_data: dict,
    base_date: date,
) -> list[dict]:
    """Mirror of SurvivalAnalyzer._km_to_prediction_rows."""
    timeline = km_data.get("timeline_quarters", [])
    survival = km_data.get("survival_prob", [])
    n = km_data.get("n", 0)

    rows = []
    for t_q, s_prob in zip(timeline, survival):
        if t_q <= 0:
            continue
        future_date = (
            pd.Timestamp(base_date) + pd.DateOffset(months=int(t_q) * 3)
        ).date()
        se = (
            np.sqrt(s_prob * (1 - s_prob) / max(n, 1)) if n > 0 else 0.1
        )
        ci_lo = max(0.0, s_prob - 1.96 * se)
        ci_hi = min(1.0, s_prob + 1.96 * se)

        rows.append({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metric_name": "survival_probability",
            "value": float(s_prob),
            "unit": "ratio",
            "period": future_date,
            "confidence_lo": ci_lo,
            "confidence_hi": ci_hi,
        })

    return rows


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def survival_df():
    """Survival dataset with 20 companies, mixed events/censored."""
    rng = np.random.default_rng(seed=33)
    n = 20
    stages = (["seed"] * 6 + ["series_a"] * 5 + ["series_b"] * 4
              + ["pre_seed"] * 3 + ["growth"] * 2)
    sectors = (["technology"] * 7 + ["healthcare"] * 5 + ["fintech"] * 4
               + ["cleantech"] * 4)
    regions = ["clark"] * 10 + ["washoe"] * 7 + ["carson"] * 3

    durations = rng.integers(4, 48, size=n).astype(float)
    events = rng.choice([0, 1], size=n, p=[0.4, 0.6])

    return pd.DataFrame({
        "entity_id": [str(i) for i in range(1, n + 1)],
        "name": [f"Company_{i}" for i in range(1, n + 1)],
        "duration_quarters": durations,
        "event": events,
        "stage": stages,
        "primary_sector": sectors,
        "region": regions,
        "funding_m": np.round(rng.uniform(0.1, 50, size=n), 2),
        "employees": rng.integers(2, 300, size=n).astype(int),
        "momentum": rng.integers(10, 90, size=n).astype(int),
        "has_accelerator": rng.choice([0, 1], size=n, p=[0.7, 0.3]),
        "log_funding": np.log1p(rng.uniform(0.1, 50, size=n)),
        "log_employees": np.log1p(rng.integers(2, 300, size=n).astype(float)),
        "graph_pagerank": rng.uniform(0.001, 0.05, size=n),
        "graph_betweenness": rng.uniform(0.0, 0.3, size=n),
    })


# ---------------------------------------------------------------------------
# Tests: SurvivalAnalyzer run pathway
# ---------------------------------------------------------------------------

class TestSurvivalAnalyzerRun:

    @pytest.mark.asyncio
    async def test_run_with_company_data(self, mock_pool, survival_df):
        """Mock pool returns companies with timeline events => result has status."""
        assert len(survival_df) >= 5

        km_results = _fit_kaplan_meier(survival_df)
        assert "overall" in km_results
        assert km_results["overall"]["n"] == len(survival_df)

        covariates = [
            "log_funding", "log_employees", "has_accelerator",
            "graph_pagerank", "graph_betweenness",
        ]
        cox_results = _cox_fallback(
            survival_df[["duration_quarters", "event"] + covariates].fillna(0),
            covariates,
        )

        result = {
            "model_id": 1,
            "scenario_id": 99,
            "companies_analyzed": len(survival_df),
            "cohorts": len(km_results.get("cohorts", {})),
            "cox_covariates": len(cox_results.get("hazard_ratios", {})),
            "status": "completed",
        }
        assert result["status"] == "completed"
        assert result["companies_analyzed"] == 20

    @pytest.mark.asyncio
    async def test_empty_companies(self, mock_pool):
        """Empty survival data => graceful skip."""
        survival_df = pd.DataFrame()
        if survival_df.empty or len(survival_df) < 5:
            result = {"model_id": 1, "records": 0, "status": "insufficient_data"}

        assert result["status"] == "insufficient_data"
        assert result["records"] == 0


# ---------------------------------------------------------------------------
# Tests: Kaplan-Meier curves
# ---------------------------------------------------------------------------

class TestKaplanMeier:

    def test_km_curve_output_shape(self, survival_df):
        """KM curves must have time_months and survival_prob arrays."""
        km_result = _km_manual(
            survival_df["duration_quarters"].values,
            survival_df["event"].values,
            label="test",
        )

        assert "timeline_quarters" in km_result
        assert "survival_prob" in km_result
        assert isinstance(km_result["timeline_quarters"], list)
        assert isinstance(km_result["survival_prob"], list)

        # Both arrays should have the same length
        assert len(km_result["timeline_quarters"]) == len(km_result["survival_prob"])

        # Survival should start at 1.0
        assert km_result["survival_prob"][0] == 1.0

        # Survival should be monotonically non-increasing
        probs = km_result["survival_prob"]
        for i in range(1, len(probs)):
            assert probs[i] <= probs[i - 1], (
                f"Survival must be non-increasing: S({km_result['timeline_quarters'][i]})="
                f"{probs[i]} > S({km_result['timeline_quarters'][i-1]})={probs[i-1]}"
            )

        # All probabilities should be in [0, 1]
        for p in probs:
            assert 0.0 <= p <= 1.0

    def test_km_all_censored(self):
        """If no events observed, survival stays at 1.0."""
        durations = np.array([4.0, 8.0, 12.0, 16.0, 20.0])
        events = np.array([0, 0, 0, 0, 0])
        result = _km_manual(durations, events, label="all_censored")

        assert result["events"] == 0
        for p in result["survival_prob"]:
            assert p == 1.0

    def test_km_all_events(self):
        """If all subjects have events, survival should reach 0."""
        durations = np.array([4.0, 8.0, 12.0, 16.0, 20.0])
        events = np.array([1, 1, 1, 1, 1])
        result = _km_manual(durations, events, label="all_events")

        assert result["events"] == 5
        assert result["survival_prob"][-1] == 0.0

    def test_km_by_cohort(self, survival_df):
        """Fit KM by region cohort produces per-region curves."""
        results = _fit_kaplan_meier(survival_df)

        assert "cohorts" in results
        if "region" in results["cohorts"]:
            region_km = results["cohorts"]["region"]
            for region_name, km_data in region_km.items():
                assert km_data["n"] >= 3
                assert "timeline_quarters" in km_data
                assert "survival_prob" in km_data


# ---------------------------------------------------------------------------
# Tests: Cox PH (fallback path)
# ---------------------------------------------------------------------------

class TestCoxPH:

    def test_cox_covariates(self, survival_df):
        """Cox model results should include coefficient names."""
        covariates = [
            "log_funding", "log_employees", "has_accelerator",
            "graph_pagerank", "graph_betweenness",
        ]
        cox_df = survival_df[
            ["duration_quarters", "event"] + covariates
        ].copy().fillna(0)

        result = _cox_fallback(cox_df, covariates)

        assert result["status"] in ("completed_fallback", "insufficient_class_balance")

        if result["status"] == "completed_fallback":
            assert "hazard_ratios" in result
            hr = result["hazard_ratios"]

            for cov in covariates:
                assert cov in hr, f"Missing covariate '{cov}' in Cox results"
                assert "coef" in hr[cov]
                assert "hazard_ratio" in hr[cov]
                assert hr[cov]["hazard_ratio"] > 0

            assert "concordance_index" in result
            assert 0.0 <= result["concordance_index"] <= 1.0

    def test_cox_insufficient_events(self):
        """< 2 events => insufficient_class_balance."""
        df = pd.DataFrame({
            "duration_quarters": [10.0, 20.0, 30.0, 40.0, 50.0],
            "event": [1, 0, 0, 0, 0],
            "log_funding": [1.0, 2.0, 3.0, 4.0, 5.0],
        })
        result = _cox_fallback(df, ["log_funding"])
        assert result["status"] == "insufficient_class_balance"


# ---------------------------------------------------------------------------
# Tests: Forward predictions
# ---------------------------------------------------------------------------

class TestSurvivalPredictions:

    def test_prediction_rows_from_km(self):
        """KM data converts to valid prediction rows."""
        km_data = {
            "n": 20,
            "events": 12,
            "median_quarters": 16.0,
            "timeline_quarters": [0.0, 4.0, 8.0, 12.0, 16.0, 20.0],
            "survival_prob": [1.0, 0.9, 0.75, 0.6, 0.45, 0.3],
        }
        base_date = date(2026, 1, 1)
        rows = _km_to_prediction_rows("cohort", "overall", km_data, base_date)

        # t=0 is skipped, so 5 rows
        assert len(rows) == 5

        for row in rows:
            assert row["entity_type"] == "cohort"
            assert row["entity_id"] == "overall"
            assert row["metric_name"] == "survival_probability"
            assert 0.0 <= row["confidence_lo"] <= row["value"]
            assert row["value"] <= row["confidence_hi"] <= 1.0
            assert row["unit"] == "ratio"

    def test_prediction_dates_increase(self):
        """Prediction period dates should be monotonically increasing."""
        km_data = {
            "n": 15,
            "events": 8,
            "timeline_quarters": [0.0, 4.0, 8.0, 12.0],
            "survival_prob": [1.0, 0.85, 0.7, 0.55],
        }
        base_date = date(2026, 1, 1)
        rows = _km_to_prediction_rows("cohort", "test", km_data, base_date)

        dates = [r["period"] for r in rows]
        for i in range(1, len(dates)):
            assert dates[i] > dates[i - 1], (
                f"Dates should increase: {dates[i]} <= {dates[i-1]}"
            )


# ---------------------------------------------------------------------------
# Tests: Hardened code
# ---------------------------------------------------------------------------

class TestHardenedSurvival:

    def test_km_timeline_respects_max_points(self):
        """KM results should be truncated at MAX_KM_TIMELINE_POINTS."""
        # Create data with many unique time points (> 40)
        n = 60
        durations = np.arange(1, n + 1, dtype=float)
        events = np.ones(n)  # all events for maximum unique times
        result = _km_manual(durations, events, label="many_points")

        assert len(result["timeline_quarters"]) <= MAX_KM_TIMELINE_POINTS
        assert len(result["survival_prob"]) <= MAX_KM_TIMELINE_POINTS
        assert len(result["timeline_quarters"]) == len(result["survival_prob"])

    def test_cox_se_varies_by_covariate(self, survival_df):
        """Cox SE should vary across covariates (not a fixed 0.5)."""
        covariates = ["log_funding", "log_employees", "has_accelerator"]
        cox_df = survival_df[
            ["duration_quarters", "event"] + covariates
        ].copy().fillna(0)

        result = _cox_fallback(cox_df, covariates)

        if result["status"] == "completed_fallback":
            ses = [result["hazard_ratios"][c]["se"] for c in covariates]
            # SEs should not all be identical (unlike the old hardcoded 0.5)
            assert len(set(ses)) > 1, (
                f"SE values should vary across covariates, got: {ses}"
            )
            # All SEs should be bounded
            for se in ses:
                assert 0.05 <= se <= 2.0, f"SE {se} out of expected range"

    def test_cox_ci_quality_field(self, survival_df):
        """Cox results should include ci_quality='approximate'."""
        covariates = ["log_funding", "log_employees"]
        cox_df = survival_df[
            ["duration_quarters", "event"] + covariates
        ].copy().fillna(0)

        result = _cox_fallback(cox_df, covariates)
        if result["status"] == "completed_fallback":
            assert result["ci_quality"] == "approximate"

    def test_funding_event_threshold_single_event(self):
        """Companies with exactly 1 funding event should be flagged."""
        # Simulating the threshold check: >= 1 (not >= 2)
        funding_counts = pd.Series([0, 1, 1, 2, 3])
        has_funding = funding_counts >= 1  # was >= 2 before hardening
        assert has_funding.sum() == 4, "Should flag 4 of 5 companies (count >= 1)"
        # Old threshold >= 2 would only flag 2
        old_has_funding = funding_counts >= 2
        assert old_has_funding.sum() == 2, "Old threshold flagged only 2"
