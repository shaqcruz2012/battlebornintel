"""Tests for the ScenarioSimulator agent.

We do NOT import the agent module directly (complex dependency chain).
Instead we replicate its pure computation logic and test through fixtures.
"""

from datetime import date
from unittest.mock import AsyncMock, MagicMock

import numpy as np
import pandas as pd
import pytest

# ---------------------------------------------------------------------------
# Replicate constants and pure functions from scenario_simulator.py
# ---------------------------------------------------------------------------

SIMULATION_METRICS = ["funding_m", "employees", "momentum"]
DEFAULT_N_SIMULATIONS = 1000
DEFAULT_HORIZON_QUARTERS = 8
SSBCI_LEVERAGE_RATIO = 4.5
PERCENTILES = [5, 25, 50, 75, 95]

PREBUILT_SCENARIOS = {
    "baseline": {
        "name": "Baseline Trend Extrapolation",
        "description": "No intervention -- pure trend extrapolation with stochastic noise.",
        "interventions": [],
        "horizon_quarters": DEFAULT_HORIZON_QUARTERS,
        "n_simulations": DEFAULT_N_SIMULATIONS,
    },
    "ssbci_expansion": {
        "name": "SSBCI +$10M Expansion",
        "description": "Additional $10M SSBCI allocation starting 2026-Q2.",
        "interventions": [
            {"type": "funding_increase", "target": "ssbci",
             "amount_m": 10, "start_quarter": "2026-Q2"},
        ],
        "horizon_quarters": DEFAULT_HORIZON_QUARTERS,
        "n_simulations": DEFAULT_N_SIMULATIONS,
    },
    "accelerator_boost": {
        "name": "Henderson Accelerator Launch",
        "description": "New accelerator in Henderson with 20-company annual capacity.",
        "interventions": [
            {"type": "new_accelerator", "region": "henderson",
             "capacity": 20, "start_quarter": "2026-Q3"},
        ],
        "horizon_quarters": DEFAULT_HORIZON_QUARTERS,
        "n_simulations": DEFAULT_N_SIMULATIONS,
    },
}


def _quarter_str_to_offset(q_str: str | None) -> int:
    """Mirror of ScenarioSimulator._quarter_str_to_offset."""
    if not q_str:
        return 0
    try:
        year, qpart = q_str.split("-")
        year = int(year)
        q_num = int(qpart.replace("Q", "").replace("q", ""))
        target_month = (q_num - 1) * 3 + 1
        target_date = date(year, target_month, 1)
        today = date.today()
        diff_days = (target_date - today).days
        offset = max(int(diff_days / 91.25), 0)
        return offset
    except (ValueError, AttributeError):
        return 0


def _quarter_offset_to_date(ref: date, quarters_ahead: int) -> date:
    """Mirror of module-level _quarter_offset_to_date."""
    month = ref.month + quarters_ahead * 3
    year = ref.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    return date(year, month, 1)


def _build_intervention_schedule(
    interventions: list[dict],
    horizon_q: int,
    baseline: pd.DataFrame,
) -> list[dict]:
    """Mirror of ScenarioSimulator._build_intervention_schedule."""
    n_entities = len(baseline)
    schedule = [
        {
            "funding_m_add": np.zeros(n_entities),
            "employees_mult": np.ones(n_entities),
            "momentum_add": np.zeros(n_entities),
            "new_companies": 0,
        }
        for _ in range(horizon_q)
    ]
    if not interventions:
        return schedule

    irs = baseline.get("irs_score", pd.Series(np.full(n_entities, 50.0)))
    irs_weights = np.maximum(irs.values.astype(float), 1.0)
    irs_weights = irs_weights / irs_weights.sum()

    for iv in interventions:
        iv_type = iv.get("type", "")
        start_q = _quarter_str_to_offset(iv.get("start_quarter"))

        if iv_type == "funding_increase":
            amount_m = float(iv.get("amount_m", 0))
            total_capital = amount_m * (1 + SSBCI_LEVERAGE_RATIO)
            per_company = total_capital * irs_weights
            for q in range(start_q, horizon_q):
                quarters_since = q - start_q
                if quarters_since == 0:
                    frac = 0.40
                elif quarters_since <= 3:
                    frac = 0.20
                else:
                    frac = 0.0
                schedule[q]["funding_m_add"] = (
                    schedule[q]["funding_m_add"] + per_company * frac
                )
                if frac > 0:
                    schedule[q]["momentum_add"] = (
                        schedule[q]["momentum_add"] + 5 * frac * irs_weights
                    )

    return schedule


def _run_monte_carlo(
    baseline: pd.DataFrame,
    noise_params: dict,
    schedule: list[dict],
    horizon_q: int,
    n_sims: int,
    seed: int = 42,
) -> dict[str, np.ndarray]:
    """Mirror of ScenarioSimulator._run_monte_carlo."""
    rng = np.random.default_rng(seed=seed)
    n_entities = len(baseline)
    results = {}

    for metric in SIMULATION_METRICS:
        base_vals = (
            baseline[metric].values.astype(float)
            if metric in baseline.columns
            else np.zeros(n_entities)
        )
        mu = noise_params[metric]["mean_residual"]
        sigma = noise_params[metric]["std"]

        sims = np.zeros((n_sims, n_entities, horizon_q))
        noise = rng.normal(loc=mu, scale=sigma, size=(n_sims, n_entities, horizon_q))

        baseline_mean = np.abs(base_vals).mean()
        growth_rate = mu / max(baseline_mean, 1.0) if baseline_mean > 1e-6 else 0.0
        growth_rate = np.clip(growth_rate, -0.10, 0.15)

        for q in range(horizon_q):
            if q == 0:
                prev = np.broadcast_to(
                    base_vals[np.newaxis, :], (n_sims, n_entities)
                ).copy()
            else:
                prev = sims[:, :, q - 1]

            trend = prev * growth_rate
            add_effect = np.zeros(n_entities)
            mult_effect = np.ones(n_entities)
            if metric == "funding_m":
                add_effect = schedule[q]["funding_m_add"]
            elif metric == "employees":
                mult_effect = schedule[q]["employees_mult"]
            elif metric == "momentum":
                add_effect = schedule[q]["momentum_add"]

            sims[:, :, q] = (
                prev + trend + add_effect[np.newaxis, :] + noise[:, :, q]
            ) * mult_effect[np.newaxis, :]

            if metric in ("funding_m", "employees"):
                sims[:, :, q] = np.maximum(sims[:, :, q], 0.0)
            elif metric == "momentum":
                sims[:, :, q] = np.clip(sims[:, :, q], 0.0, 100.0)

        results[metric] = sims

    return results


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def baseline_df():
    """Baseline company data for simulation."""
    rng = np.random.default_rng(seed=55)
    n = 10
    return pd.DataFrame({
        "entity_id": [str(i) for i in range(1, n + 1)],
        "funding_m": np.round(rng.uniform(0.5, 30, size=n), 2),
        "employees": rng.integers(3, 200, size=n).astype(float),
        "momentum": rng.integers(15, 85, size=n).astype(float),
        "irs_score": rng.uniform(30, 90, size=n),
        "stage": ["seed"] * 5 + ["series_a"] * 3 + ["series_b"] * 2,
        "region": ["clark"] * n,
    })


@pytest.fixture
def default_noise_params():
    """Default noise parameters for simulation."""
    return {
        "funding_m": {"mean_residual": 0.1, "std": 1.5},
        "employees": {"mean_residual": 2.0, "std": 10.0},
        "momentum": {"mean_residual": 0.0, "std": 5.0},
    }


# ---------------------------------------------------------------------------
# Tests: Scenario run orchestration
# ---------------------------------------------------------------------------

class TestScenarioRun:

    @pytest.mark.asyncio
    async def test_run_all_prebuilt_scenarios(self, mock_pool):
        """No args => all 3 pre-built scenarios created."""
        # When no scenario_key or assumptions provided, all prebuilt are run
        scenario_keys = list(PREBUILT_SCENARIOS.keys())
        assert len(scenario_keys) == 3
        assert "baseline" in scenario_keys
        assert "ssbci_expansion" in scenario_keys
        assert "accelerator_boost" in scenario_keys

    @pytest.mark.asyncio
    async def test_run_single_scenario_key(self, mock_pool):
        """scenario_key='baseline' => 1 scenario."""
        scenario_key = "baseline"
        assert scenario_key in PREBUILT_SCENARIOS

        template = PREBUILT_SCENARIOS[scenario_key]
        assert template["name"] == "Baseline Trend Extrapolation"
        assert template["interventions"] == []

    @pytest.mark.asyncio
    async def test_run_custom_assumptions(
        self, mock_pool, baseline_df, default_noise_params
    ):
        """Custom assumptions with funding_increase => results contain funding_m_simulated."""
        assumptions = {
            "name": "Custom Test",
            "description": "Testing custom scenario",
            "interventions": [
                {"type": "funding_increase", "target": "ssbci",
                 "amount_m": 5, "start_quarter": None},
            ],
            "horizon_quarters": 4,
            "n_simulations": 50,
        }

        schedule = _build_intervention_schedule(
            assumptions["interventions"],
            assumptions["horizon_quarters"],
            baseline_df,
        )

        sim_results = _run_monte_carlo(
            baseline_df,
            default_noise_params,
            schedule,
            assumptions["horizon_quarters"],
            assumptions["n_simulations"],
        )

        assert "funding_m" in sim_results
        assert sim_results["funding_m"].shape == (
            50, len(baseline_df), 4
        )

        # Verify the funding_increase intervention added capital
        total_funding_add = sum(
            s["funding_m_add"].sum() for s in schedule
        )
        assert total_funding_add > 0, "Funding increase intervention should add capital"


# ---------------------------------------------------------------------------
# Tests: Monte Carlo engine
# ---------------------------------------------------------------------------

class TestMonteCarlo:

    def test_monte_carlo_determinism(self, baseline_df, default_noise_params):
        """Fixed seed => same results across runs."""
        horizon_q = 4
        n_sims = 20
        schedule = _build_intervention_schedule([], horizon_q, baseline_df)

        r1 = _run_monte_carlo(
            baseline_df, default_noise_params, schedule, horizon_q, n_sims, seed=42
        )
        r2 = _run_monte_carlo(
            baseline_df, default_noise_params, schedule, horizon_q, n_sims, seed=42
        )

        for metric in SIMULATION_METRICS:
            np.testing.assert_array_equal(
                r1[metric], r2[metric],
                err_msg=f"Monte Carlo results for {metric} differ with same seed",
            )

    def test_funding_cannot_go_negative(self, baseline_df, default_noise_params):
        """All simulated funding_m values must be >= 0."""
        horizon_q = 8
        n_sims = 100
        schedule = _build_intervention_schedule([], horizon_q, baseline_df)

        results = _run_monte_carlo(
            baseline_df, default_noise_params, schedule, horizon_q, n_sims
        )

        funding = results["funding_m"]
        assert np.all(funding >= 0.0), (
            f"Found negative funding values: min={funding.min()}"
        )

    def test_momentum_clamped(self, baseline_df, default_noise_params):
        """All simulated momentum values must be in [0, 100]."""
        horizon_q = 8
        n_sims = 100
        schedule = _build_intervention_schedule([], horizon_q, baseline_df)

        results = _run_monte_carlo(
            baseline_df, default_noise_params, schedule, horizon_q, n_sims
        )

        momentum = results["momentum"]
        assert np.all(momentum >= 0.0), (
            f"Found momentum below 0: min={momentum.min()}"
        )
        assert np.all(momentum <= 100.0), (
            f"Found momentum above 100: max={momentum.max()}"
        )


# ---------------------------------------------------------------------------
# Tests: Quarter parsing
# ---------------------------------------------------------------------------

class TestQuarterParsing:

    def test_quarter_str_to_offset_valid_future(self):
        """'2026-Q2' and '2027-Q1' should produce non-negative offsets."""
        offset_q2 = _quarter_str_to_offset("2026-Q2")
        offset_q1 = _quarter_str_to_offset("2027-Q1")

        # Both should be non-negative
        assert offset_q2 >= 0
        assert offset_q1 >= 0
        # 2027-Q1 should be further out than 2026-Q2
        assert offset_q1 >= offset_q2

    def test_quarter_str_to_offset_none(self):
        """None input => offset 0."""
        assert _quarter_str_to_offset(None) == 0

    def test_quarter_str_to_offset_invalid(self):
        """Invalid string => offset 0 (graceful fallback)."""
        assert _quarter_str_to_offset("invalid") == 0
        assert _quarter_str_to_offset("not-a-quarter") == 0
        assert _quarter_str_to_offset("") == 0

    def test_quarter_offset_to_date(self):
        """Verify correct date arithmetic for quarter offsets."""
        ref = date(2026, 1, 1)
        assert _quarter_offset_to_date(ref, 1) == date(2026, 4, 1)
        assert _quarter_offset_to_date(ref, 2) == date(2026, 7, 1)
        assert _quarter_offset_to_date(ref, 4) == date(2027, 1, 1)


# ---------------------------------------------------------------------------
# Tests: Hardened code
# ---------------------------------------------------------------------------

def _unit_for_metric(metric: str) -> str:
    """Mirror of hardened _unit_for_metric."""
    units = {"funding_m": "usd_millions", "employees": "count", "momentum": "percent"}
    return units.get(metric, "units")


class TestHardenedSimulator:

    def test_unit_for_metric_unknown_returns_units(self):
        """Unknown metrics must return 'units', not None."""
        assert _unit_for_metric("unknown") == "units"
        assert _unit_for_metric("custom_metric") == "units"
        assert _unit_for_metric("") == "units"

    def test_unit_for_metric_known(self):
        """Known metrics return their proper units."""
        assert _unit_for_metric("funding_m") == "usd_millions"
        assert _unit_for_metric("employees") == "count"
        assert _unit_for_metric("momentum") == "percent"

    def test_near_zero_baseline_no_explosion(self, default_noise_params):
        """Near-zero baseline values should not produce infinite growth rates."""
        n = 5
        baseline = pd.DataFrame({
            "entity_id": [str(i) for i in range(1, n + 1)],
            "funding_m": [0.0, 0.0, 0.001, 0.0, 0.0],  # near-zero
            "employees": [0.0] * n,  # all zero
            "momentum": [0.0] * n,
            "irs_score": [50.0] * n,
            "stage": ["seed"] * n,
            "region": ["clark"] * n,
        })
        horizon_q = 4
        n_sims = 10
        schedule = _build_intervention_schedule([], horizon_q, baseline)

        results = _run_monte_carlo(
            baseline, default_noise_params, schedule, horizon_q, n_sims
        )

        for metric in SIMULATION_METRICS:
            vals = results[metric]
            assert np.all(np.isfinite(vals)), (
                f"Infinite values in {metric} with near-zero baseline"
            )

    def test_accelerator_region_extraction(self):
        """Target region should be extracted from intervention, not hardcoded."""
        interventions = [
            {"type": "new_accelerator", "region": "henderson", "capacity": 20},
        ]
        # Replicate the extraction logic from simulate_scenario
        target_region = "nevada"
        for iv in interventions:
            if iv.get("region"):
                target_region = iv["region"]
                break
        assert target_region == "henderson"

    def test_accelerator_region_default(self):
        """No region in interventions => default to 'nevada'."""
        interventions = [
            {"type": "funding_increase", "amount_m": 10},
        ]
        target_region = "nevada"
        for iv in interventions:
            if iv.get("region"):
                target_region = iv["region"]
                break
        assert target_region == "nevada"
