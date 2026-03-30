"""Monte Carlo scenario simulation agent -- "what-if" forecasting engine.

Generates forward-looking simulations for ecosystem interventions by:
1. Loading baseline company metrics from metric_snapshots (with company table fallback)
2. Applying parameterised intervention effects (funding, accelerators, tax, rates)
3. Running N Monte Carlo simulations with noise sampled from historical residuals
4. Aggregating percentile bands and persisting to scenario_results

Pre-built scenarios: baseline, ssbci_expansion, accelerator_boost.
"""

import json
import logging
import time
from datetime import date, timedelta
from typing import Any

import numpy as np
import pandas as pd

from .base_model_agent import BaseModelAgent
from .constants import unit_for_metric
from .status import AgentStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SIMULATION_METRICS = ["funding_m", "employees", "momentum"]
DEFAULT_N_SIMULATIONS = 1000
DEFAULT_HORIZON_QUARTERS = 8

# Intervention effect parameters (calibrated from literature / historical data)
SSBCI_LEVERAGE_RATIO = 4.5          # $1 SSBCI -> $4.50 private capital
ACCELERATOR_ADVANCE_PROB = 0.40     # P(advance stage) for accelerator grad
ACCELERATOR_FUNDING_PROB = 0.35     # P(raise funding) for accelerator grad
RATE_SENSITIVITY = -0.15            # +100bps -> -15% funding velocity
TAX_FORMATION_ELASTICITY = 1.5      # -1% effective tax -> +1.5% formation rate

# Percentiles to compute
PERCENTILES = [5, 25, 50, 75, 95]

# ---------------------------------------------------------------------------
# Pre-built scenario templates
# ---------------------------------------------------------------------------
PREBUILT_SCENARIOS: dict[str, dict[str, Any]] = {
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
            {
                "type": "funding_increase",
                "target": "ssbci",
                "amount_m": 10,
                "start_quarter": "2026-Q2",
            },
        ],
        "horizon_quarters": DEFAULT_HORIZON_QUARTERS,
        "n_simulations": DEFAULT_N_SIMULATIONS,
    },
    "accelerator_boost": {
        "name": "Henderson Accelerator Launch",
        "description": "New accelerator in Henderson with 20-company annual capacity.",
        "interventions": [
            {
                "type": "new_accelerator",
                "region": "henderson",
                "capacity": 20,
                "start_quarter": "2026-Q3",
            },
        ],
        "horizon_quarters": DEFAULT_HORIZON_QUARTERS,
        "n_simulations": DEFAULT_N_SIMULATIONS,
    },
}


class ScenarioSimulator(BaseModelAgent):
    """Monte Carlo simulation agent for ecosystem intervention scenarios."""

    def __init__(self):
        super().__init__("scenario_simulator", model_version="1.0.0")

    # ==================================================================
    # Main entry point
    # ==================================================================

    async def run(self, pool, **kwargs):
        """Execute one or more Monte Carlo scenario simulations.

        Loads baseline company metrics, applies intervention effects, runs
        N Monte Carlo simulations with stochastic noise, and persists
        percentile-band results to scenario_results.

        Kwargs:
            scenario_key (str, optional): Key into PREBUILT_SCENARIOS
                (e.g. "baseline", "ssbci_expansion", "accelerator_boost").
                Runs only that scenario.
            assumptions (dict, optional): Custom assumptions dict with keys
                ``name``, ``description``, ``interventions`` (list),
                ``horizon_quarters`` (int), and ``n_simulations`` (int).
                Runs a single custom scenario.

        If neither kwarg is provided, all pre-built scenarios are run.
        """
        _t0 = time.perf_counter()
        logger.info("ScenarioSimulator.run starting.")
        model_id = await self.register_model(
            pool,
            name="scenario_simulator_v1",
            objective="Monte Carlo what-if forecasting for ecosystem interventions",
            input_vars=SIMULATION_METRICS + ["irs_score", "stage", "region"],
            output_vars=[f"{m}_simulated" for m in SIMULATION_METRICS],
        )

        scenario_key = kwargs.get("scenario_key")
        assumptions = kwargs.get("assumptions")

        results: list[dict] = []

        if assumptions:
            # Custom one-off scenario
            res = await self.simulate_scenario(pool, assumptions)
            results.append(res)
        elif scenario_key:
            if scenario_key not in PREBUILT_SCENARIOS:
                raise ValueError(
                    f"Unknown scenario key: {scenario_key}. "
                    f"Available: {list(PREBUILT_SCENARIOS.keys())}"
                )
            res = await self.simulate_scenario(
                pool, PREBUILT_SCENARIOS[scenario_key]
            )
            results.append(res)
        else:
            # Run all pre-built scenarios
            for key, template in PREBUILT_SCENARIOS.items():
                logger.info("Running pre-built scenario: %s", key)
                res = await self.simulate_scenario(pool, template)
                results.append(res)

        elapsed = time.perf_counter() - _t0
        total_rows = sum(r.get("rows_written", 0) for r in results)
        summary = {
            "model_id": model_id,
            "scenarios_run": len(results),
            "total_rows_written": total_rows,
            "scenario_ids": [r["scenario_id"] for r in results],
            "elapsed_s": round(elapsed, 3),
            "status": AgentStatus.COMPLETED,
        }
        logger.info("ScenarioSimulator completed in %.2fs: %s", elapsed, summary)
        return summary

    # ==================================================================
    # Core simulation
    # ==================================================================

    async def simulate_scenario(
        self, pool, assumptions: dict
    ) -> dict[str, Any]:
        """Run a full Monte Carlo simulation for one scenario.

        Parameters
        ----------
        pool : asyncpg pool
        assumptions : dict with keys name, description (optional),
            interventions (list), horizon_quarters, n_simulations

        Returns
        -------
        dict with scenario_id, rows_written, summary statistics.
        """
        name = assumptions.get("name", "Custom Scenario")
        description = assumptions.get("description", "")
        interventions = assumptions.get("interventions", [])
        horizon_q = assumptions.get("horizon_quarters", DEFAULT_HORIZON_QUARTERS)
        n_sims = assumptions.get("n_simulations", DEFAULT_N_SIMULATIONS)

        # 1. Load baseline data
        baseline = await self._load_baseline(pool)
        if baseline.empty:
            logger.warning("No baseline data available; skipping scenario '%s'.", name)
            return {"scenario_id": None, "rows_written": 0, "status": AgentStatus.NO_DATA}

        # Defensive: replace Inf values in simulation metrics with NaN, then fill 0
        for metric in SIMULATION_METRICS:
            if metric in baseline.columns:
                inf_count = np.isinf(
                    pd.to_numeric(baseline[metric], errors="coerce")
                ).sum()
                if inf_count:
                    logger.warning(
                        "simulate_scenario '%s': %d Inf values in baseline['%s'] "
                        "replaced with 0.",
                        name, int(inf_count), metric,
                    )
                baseline[metric] = (
                    pd.to_numeric(baseline[metric], errors="coerce")
                    .replace([np.inf, -np.inf], np.nan)
                    .fillna(0)
                )

        # 2. Load historical residuals / volatility for noise model
        noise_params = await self._estimate_noise(pool, baseline)

        # 3. Build intervention schedule
        intervention_schedule = self._build_intervention_schedule(
            interventions, horizon_q, baseline
        )

        # 4. Run vectorised Monte Carlo
        sim_results = self._run_monte_carlo(
            baseline, noise_params, intervention_schedule, horizon_q, n_sims
        )

        # Extract target region from interventions (default to "nevada")
        target_region = "nevada"
        for iv in interventions:
            if iv.get("region"):
                target_region = iv["region"]
                break
        sim_results["_target_region"] = target_region

        # 5. Aggregate across simulations -> percentile bands
        aggregated = self._aggregate_simulations(sim_results, baseline, horizon_q)

        # 6. Persist
        today = date.today()
        scenario_id = await self.create_scenario(
            pool,
            name=name,
            description=description,
            base_period=today,
            assumptions=assumptions,
        )

        rows_written = await self.save_predictions(pool, scenario_id, aggregated)
        await self.complete_scenario(pool, scenario_id)

        logger.info(
            "Scenario '%s' (id=%d): %d result rows written.",
            name, scenario_id, rows_written,
        )
        result = {
            "scenario_id": scenario_id,
            "rows_written": rows_written,
            "n_entities": baseline["entity_id"].nunique(),
            "n_simulations": n_sims,
            "horizon_quarters": horizon_q,
            "status": AgentStatus.COMPLETED,
        }

        # Attach simulation diagnostics if available
        if "_diagnostics" in sim_results:
            result["diagnostics"] = sim_results["_diagnostics"]

        return result

    # ------------------------------------------------------------------
    # Data loading
    # ------------------------------------------------------------------

    async def _load_baseline(self, pool) -> pd.DataFrame:
        """Load current company metrics from metric_snapshots.

        Falls back to the companies table when metric_snapshots is sparse.
        Returns a DataFrame with columns:
            entity_id, funding_m, employees, momentum, irs_score, stage, region
        """
        # Try metric_snapshots first (latest period per company per metric)
        panel = await self.load_panel_data(
            pool, entity_type="company", metric_names=SIMULATION_METRICS
        )

        if not panel.empty:
            # Keep only the latest snapshot per entity
            panel = (
                panel.sort_values("period_start")
                .groupby("entity_id")
                .last()
                .reset_index()
            )

        # Fallback / augment from companies table
        company_rows = await pool.fetch(
            """SELECT c.id::text AS entity_id,
                      c.funding_m, c.employees, c.momentum,
                      c.stage, c.region,
                      COALESCE(cs.irs_score, 50) AS irs_score
               FROM companies c
               LEFT JOIN computed_scores cs ON cs.company_id = c.id"""
        )
        companies_df = pd.DataFrame([dict(r) for r in company_rows])
        if companies_df.empty:
            return panel if not panel.empty else pd.DataFrame()

        # Numeric coercion
        for col in ["funding_m", "employees", "momentum", "irs_score"]:
            if col in companies_df.columns:
                companies_df[col] = pd.to_numeric(
                    companies_df[col], errors="coerce"
                ).fillna(0)

        if panel.empty:
            return companies_df

        # Merge: prefer metric_snapshots values, fill gaps from companies
        merged = companies_df.merge(
            panel[["entity_id"] + SIMULATION_METRICS],
            on="entity_id",
            how="left",
            suffixes=("_co", "_ms"),
        )
        for m in SIMULATION_METRICS:
            co_col = f"{m}_co"
            ms_col = f"{m}_ms"
            if ms_col in merged.columns and co_col in merged.columns:
                merged[m] = merged[ms_col].fillna(merged[co_col])
                merged.drop(columns=[co_col, ms_col], inplace=True)

        return merged

    async def _estimate_noise(
        self, pool, baseline: pd.DataFrame
    ) -> dict[str, dict[str, float]]:
        """Estimate per-metric noise parameters from historical data.

        Returns {metric: {"mean_residual": float, "std": float}}.
        If historical data is insufficient, uses a percentage of the
        baseline mean as a default volatility estimate.
        """
        noise: dict[str, dict[str, float]] = {}

        panel = await self.load_panel_data(
            pool, entity_type="company", metric_names=SIMULATION_METRICS
        )

        for metric in SIMULATION_METRICS:
            if not panel.empty and metric in panel.columns:
                # Compute quarter-over-quarter changes per entity
                panel_sorted = panel.sort_values(
                    ["entity_id", "period_start"]
                )
                panel_sorted[f"{metric}_diff"] = panel_sorted.groupby(
                    "entity_id"
                )[metric].diff()
                diffs = panel_sorted[f"{metric}_diff"].dropna()

                if len(diffs) >= 5:
                    noise[metric] = {
                        "mean_residual": float(diffs.mean()),
                        "std": float(diffs.std()),
                    }
                    continue

            # Fallback: 10-20% of baseline mean as noise std
            base_mean = baseline[metric].mean() if metric in baseline.columns else 1.0
            noise[metric] = {
                "mean_residual": 0.0,
                "std": max(abs(base_mean) * 0.15, 0.01),
            }

        return noise

    # ------------------------------------------------------------------
    # Intervention schedule
    # ------------------------------------------------------------------

    def _build_intervention_schedule(
        self,
        interventions: list[dict],
        horizon_q: int,
        baseline: pd.DataFrame,
    ) -> list[dict]:
        """Parse interventions into a per-quarter schedule of effects.

        Each entry in the returned list corresponds to one quarter offset
        (0-indexed) and contains additive/multiplicative adjustments per
        metric.
        """
        n_entities = len(baseline)
        schedule: list[dict] = [
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

        # IRS score weights for proportional allocation
        irs = baseline.get("irs_score", pd.Series(np.full(n_entities, 50.0)))
        irs_weights = np.maximum(irs.values.astype(float), 1.0)
        irs_weights = irs_weights / irs_weights.sum()

        for iv in interventions:
            iv_type = iv.get("type", "")
            start_q = self._quarter_str_to_offset(iv.get("start_quarter"))

            if iv_type == "funding_increase":
                amount_m = float(iv.get("amount_m", 0))
                total_capital = amount_m * (1 + SSBCI_LEVERAGE_RATIO)
                # Distribute proportional to IRS score across eligible companies
                per_company = total_capital * irs_weights
                for q in range(start_q, horizon_q):
                    # Capital arrives gradually: 40% in first quarter, then
                    # 20% each of the next 3 quarters
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
                    # Momentum boost from receiving capital
                    if frac > 0:
                        schedule[q]["momentum_add"] = (
                            schedule[q]["momentum_add"] + 5 * frac * irs_weights
                        )

            elif iv_type == "new_accelerator":
                capacity = int(iv.get("capacity", 20))
                for q in range(start_q, horizon_q):
                    # Each quarter, a fraction of annual capacity graduates
                    quarterly_grads = max(capacity // 4, 1)
                    schedule[q]["new_companies"] += quarterly_grads
                    # Grads that raise funding inject capital into ecosystem
                    funded_grads = quarterly_grads * ACCELERATOR_FUNDING_PROB
                    schedule[q]["funding_m_add"] = (
                        schedule[q]["funding_m_add"]
                        + funded_grads * 1.5 * irs_weights  # ~$1.5M avg seed
                    )
                    # Existing companies near the accelerator get a
                    # momentum boost (spillover) scaled by advance probability
                    schedule[q]["momentum_add"] = (
                        schedule[q]["momentum_add"]
                        + 2.0 * ACCELERATOR_ADVANCE_PROB * irs_weights
                    )

            elif iv_type == "interest_rate_change":
                bps = float(iv.get("bps", 0))
                multiplier = 1.0 + (bps / 100.0) * RATE_SENSITIVITY
                for q in range(start_q, horizon_q):
                    # Funding velocity scales by multiplier
                    schedule[q]["funding_m_add"] = (
                        schedule[q]["funding_m_add"]
                        * multiplier
                    )
                    schedule[q]["employees_mult"] = (
                        schedule[q]["employees_mult"]
                        * (1.0 + (multiplier - 1.0) * 0.5)
                    )

            elif iv_type == "tax_incentive":
                pct_reduction = float(iv.get("pct_reduction", 0))
                formation_boost = pct_reduction * TAX_FORMATION_ELASTICITY / 100.0
                for q in range(start_q, horizon_q):
                    schedule[q]["new_companies"] += max(
                        int(n_entities * formation_boost / 4), 0
                    )
                    # Survival / momentum boost for existing companies
                    schedule[q]["momentum_add"] = (
                        schedule[q]["momentum_add"]
                        + pct_reduction * 0.1 * irs_weights
                    )

        return schedule

    @staticmethod
    def _quarter_str_to_offset(q_str: str | None) -> int:
        """Convert '2026-Q2' style string to a 0-based quarter offset
        relative to the current date.  Returns 0 if parsing fails.
        """
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

    # ------------------------------------------------------------------
    # Monte Carlo engine (vectorised with numpy)
    # ------------------------------------------------------------------

    def _run_monte_carlo(
        self,
        baseline: pd.DataFrame,
        noise_params: dict[str, dict[str, float]],
        schedule: list[dict],
        horizon_q: int,
        n_sims: int,
    ) -> dict[str, np.ndarray]:
        """Run vectorised Monte Carlo simulations.

        Returns a dict mapping each metric to a 3-D numpy array of shape
        (n_sims, n_entities, horizon_q).
        """
        rng = np.random.default_rng(seed=42)
        n_entities = len(baseline)

        results: dict[str, np.ndarray] = {}

        for metric in SIMULATION_METRICS:
            base_vals = baseline[metric].values.astype(float) if metric in baseline.columns else np.zeros(n_entities)

            mu = noise_params[metric]["mean_residual"]
            sigma = noise_params[metric]["std"]

            # Pre-allocate: (n_sims, n_entities, horizon_q)
            sims = np.zeros((n_sims, n_entities, horizon_q))

            # Random noise: (n_sims, n_entities, horizon_q)
            noise = rng.normal(loc=mu, scale=sigma, size=(n_sims, n_entities, horizon_q))

            # Simple growth rate from baseline (quarterly)
            # Use a small positive drift based on historical mean change
            baseline_mean = np.abs(base_vals).mean()
            growth_rate = mu / max(baseline_mean, 1.0) if baseline_mean > 1e-6 else 0.0
            growth_rate = np.clip(growth_rate, -0.10, 0.15)  # cap extreme growth

            # Forward propagation
            for q in range(horizon_q):
                if q == 0:
                    prev = np.broadcast_to(
                        base_vals[np.newaxis, :], (n_sims, n_entities)
                    ).copy()
                else:
                    prev = sims[:, :, q - 1]

                # Trend component
                trend = prev * growth_rate

                # Intervention additive effects
                add_effect = np.zeros(n_entities)
                mult_effect = np.ones(n_entities)
                if metric == "funding_m":
                    add_effect = schedule[q]["funding_m_add"]
                elif metric == "employees":
                    mult_effect = schedule[q]["employees_mult"]
                elif metric == "momentum":
                    add_effect = schedule[q]["momentum_add"]

                # Combine: prev + trend + intervention + noise
                sims[:, :, q] = (
                    prev + trend + add_effect[np.newaxis, :] + noise[:, :, q]
                ) * mult_effect[np.newaxis, :]

                # Floor: funding and employees cannot go negative
                if metric in ("funding_m", "employees"):
                    sims[:, :, q] = np.maximum(sims[:, :, q], 0.0)
                elif metric == "momentum":
                    sims[:, :, q] = np.clip(sims[:, :, q], 0.0, 100.0)

            results[metric] = sims

        # Handle new companies from accelerator / tax interventions
        total_new = sum(s["new_companies"] for s in schedule)
        if total_new > 0:
            results["_new_company_schedule"] = np.array(
                [s["new_companies"] for s in schedule]
            )

        # Simulation diagnostics
        diagnostics: dict = {}

        # Convergence check: compare median of first 500 sims vs all N sims
        check_n = min(500, n_sims)
        convergence_flags: dict = {}
        for metric in SIMULATION_METRICS:
            if metric not in results:
                continue
            sims = results[metric]  # (n_sims, n_entities, horizon_q)
            last_q = horizon_q - 1
            median_subset = float(np.median(sims[:check_n, :, last_q]))
            median_all = float(np.median(sims[:, :, last_q]))
            if median_all != 0:
                pct_diff = abs(median_subset - median_all) / abs(median_all)
            else:
                pct_diff = abs(median_subset - median_all)
            convergence_flags[metric] = {
                "median_first_500": median_subset,
                "median_all": median_all,
                "pct_difference": float(pct_diff),
                "potentially_unconverged": bool(pct_diff > 0.05),
            }
        diagnostics["convergence_check"] = convergence_flags

        # Skewness of final quarter's distribution
        skewness_flags: dict = {}
        for metric in SIMULATION_METRICS:
            if metric not in results:
                continue
            sims = results[metric]
            last_q = horizon_q - 1
            final_vals = sims[:, :, last_q].flatten()
            n_vals = len(final_vals)
            if n_vals > 2:
                mean_v = float(np.mean(final_vals))
                std_v = float(np.std(final_vals))
                if std_v > 0:
                    skew = float(
                        np.mean(((final_vals - mean_v) / std_v) ** 3)
                    )
                else:
                    skew = 0.0
            else:
                skew = 0.0
            skewness_flags[metric] = {
                "skewness": skew,
                "normal_model_may_be_inappropriate": bool(abs(skew) > 1.0),
            }
        diagnostics["skewness"] = skewness_flags

        results["_diagnostics"] = diagnostics

        return results

    # ------------------------------------------------------------------
    # Aggregation
    # ------------------------------------------------------------------

    def _aggregate_simulations(
        self,
        sim_results: dict[str, np.ndarray],
        baseline: pd.DataFrame,
        horizon_q: int,
    ) -> pd.DataFrame:
        """Aggregate simulation runs into percentile bands.

        For each entity x metric x quarter, computes p5, p25, p50, p75, p95
        and stores the median as `value`, p5 as confidence_lo, p95 as
        confidence_hi.  Additional percentile rows are stored as separate
        metric names (e.g. funding_m_simulated_p25).
        """
        rows: list[dict] = []
        today = date.today()
        entity_ids = baseline["entity_id"].values

        for metric in SIMULATION_METRICS:
            if metric not in sim_results:
                continue

            sims = sim_results[metric]  # (n_sims, n_entities, horizon_q)
            unit = unit_for_metric(metric)

            for q in range(horizon_q):
                period_date = _quarter_offset_to_date(today, q + 1)
                quarter_data = sims[:, :, q]  # (n_sims, n_entities)
                pct_values = np.percentile(quarter_data, PERCENTILES, axis=0)
                # pct_values shape: (len(PERCENTILES), n_entities)

                mean_values = quarter_data.mean(axis=0)

                for i, eid in enumerate(entity_ids):
                    # Primary row: median value with p5/p95 bands
                    rows.append({
                        "entity_type": "company",
                        "entity_id": str(eid),
                        "metric_name": f"{metric}_simulated",
                        "value": float(pct_values[2, i]),  # p50
                        "unit": unit,
                        "period": period_date,
                        "confidence_lo": float(pct_values[0, i]),  # p5
                        "confidence_hi": float(pct_values[4, i]),  # p95
                    })

                    # Mean row
                    rows.append({
                        "entity_type": "company",
                        "entity_id": str(eid),
                        "metric_name": f"{metric}_simulated_mean",
                        "value": float(mean_values[i]),
                        "unit": unit,
                        "period": period_date,
                        "confidence_lo": float(pct_values[1, i]),  # p25
                        "confidence_hi": float(pct_values[3, i]),  # p75
                    })

        # Aggregate new-company pipeline from accelerator / tax interventions
        new_co_schedule = sim_results.get("_new_company_schedule")
        if new_co_schedule is not None:
            cumulative = 0
            for q in range(horizon_q):
                cumulative += int(new_co_schedule[q])
                period_date = _quarter_offset_to_date(today, q + 1)
                rows.append({
                    "entity_type": "region",
                    "entity_id": sim_results.get("_target_region", "nevada"),
                    "metric_name": "new_companies_simulated",
                    "value": float(cumulative),
                    "unit": "count",
                    "period": period_date,
                    "confidence_lo": float(cumulative * 0.7),
                    "confidence_hi": float(cumulative * 1.3),
                })

        return pd.DataFrame(rows) if rows else pd.DataFrame(
            columns=[
                "entity_type", "entity_id", "metric_name",
                "value", "unit", "period", "confidence_lo", "confidence_hi",
            ]
        )


# ======================================================================
# Module-level helpers
# ======================================================================

def _quarter_offset_to_date(ref: date, quarters_ahead: int) -> date:
    """Return the first day of the quarter that is *quarters_ahead* from ref."""
    month = ref.month + quarters_ahead * 3
    year = ref.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    return date(year, month, 1)
