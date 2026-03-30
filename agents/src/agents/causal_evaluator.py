"""Causal evaluator agent -- treatment effect estimation for ecosystem interventions.

Estimates causal treatment effects using three methods:
1. Accelerator Difference-in-Differences (DiD) with bootstrap CIs
2. SSBCI Fund Impact via Propensity Score Matching (PSM)
3. Network Spillover effects via OLS with neighbor covariates

All results are saved to analysis_results with analysis_type='causal_evaluation'.
"""

import asyncio
import logging
import time
from datetime import date, datetime, timezone

import numpy as np
import pandas as pd

from .base_model_agent import BaseModelAgent
from .constants import (
    BOOTSTRAP_ITERATIONS,
    CALIPER_MULTIPLIER,
    MIN_CONTROL_SAMPLES as MIN_CONTROL,
    MIN_TREATMENT_SAMPLES as MIN_TREATMENT,
    STAGE_ORDER,
)
from .status import AgentStatus

logger = logging.getLogger(__name__)

# Additional sample size thresholds specific to this agent
MIN_MATCHED_PAIRS = 5
MIN_REGRESSION_OBS = 10


class CausalEvaluator(BaseModelAgent):
    """Estimates treatment effects for ecosystem interventions."""

    def __init__(self):
        super().__init__("causal_evaluator", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        """Run causal treatment-effect estimation for ecosystem interventions.

        Executes three analyses:
        1. Accelerator Difference-in-Differences (DiD) with bootstrap CIs
        2. SSBCI Fund Impact via Propensity Score Matching (PSM)
        3. Network Spillover effects via OLS with neighbor covariates

        Results are saved to analysis_results with analysis_type='causal_evaluation'.

        Kwargs:
            None -- all configuration is derived from database state.
        """
        _t0 = time.perf_counter()
        logger.info("CausalEvaluator.run starting.")
        model_id = await self.register_model(
            pool,
            name="causal_evaluator_v1",
            objective="Treatment effect estimation for ecosystem interventions",
            input_vars=[
                "funding_m", "employees", "stage", "sectors", "region",
                "founded", "graph_edges", "pagerank", "betweenness",
            ],
            output_vars=[
                "att_funding", "att_employees", "att_stage",
                "spillover_coef", "balance_diagnostics",
            ],
        )

        # Load company data, graph edges, and graph metrics in parallel
        companies_df, edges_df, graph_df = await asyncio.gather(
            self._load_companies(pool),
            self._load_graph_edges(pool),
            self.load_graph_features(pool, node_types=["c"]),
        )

        # Defensive: remove rows with Inf in key numeric columns before analysis
        if not companies_df.empty:
            num_cols = ["log_funding", "log_employees", "funding_m", "employees", "momentum"]
            available_num_cols = [c for c in num_cols if c in companies_df.columns]
            if available_num_cols:
                inf_mask = np.isinf(
                    companies_df[available_num_cols].select_dtypes(include=[np.number])
                ).any(axis=1)
                if inf_mask.any():
                    logger.warning(
                        "CausalEvaluator: dropping %d rows with Inf values in numeric columns.",
                        int(inf_mask.sum()),
                    )
                    companies_df = companies_df[~inf_mask]

        if companies_df.empty or len(companies_df) < MIN_TREATMENT + MIN_CONTROL:
            logger.warning("Insufficient company data (n=%d).", len(companies_df))
            return {"model_id": model_id, "status": AgentStatus.INSUFFICIENT_DATA}

        results: dict = {
            "analysis_date": datetime.now(timezone.utc).isoformat(),
            "companies_total": len(companies_df),
            "analyses": {},
        }

        # --- Analysis 1: Accelerator DiD ---
        did_result = self._accelerator_did(companies_df, edges_df)
        results["analyses"]["accelerator_did"] = did_result

        # --- Analysis 2: SSBCI Fund Impact (PSM) ---
        psm_result = self._ssbci_psm(companies_df, edges_df)
        results["analyses"]["ssbci_psm"] = psm_result

        # --- Analysis 3: Network Spillover ---
        spillover_result = self._network_spillover(companies_df, edges_df, graph_df)
        results["analyses"]["network_spillover"] = spillover_result

        # Save to analysis_results
        await self.save_analysis(
            pool,
            analysis_type="causal_evaluation",
            content=results,
        )

        elapsed = time.perf_counter() - _t0
        result = {
            "model_id": model_id,
            "companies_analyzed": len(companies_df),
            "analyses_completed": sum(
                1 for a in results["analyses"].values()
                if a.get("status") == AgentStatus.COMPLETED
            ),
            "analyses_skipped": sum(
                1 for a in results["analyses"].values()
                if a.get("status") == AgentStatus.SKIPPED
            ),
            "elapsed_s": round(elapsed, 3),
            "status": AgentStatus.COMPLETED,
        }
        logger.info("CausalEvaluator completed in %.2fs: %s", elapsed, result)
        return result

    # ------------------------------------------------------------------
    # Data loading
    # ------------------------------------------------------------------

    async def _load_companies(self, pool) -> pd.DataFrame:
        """Load company-level covariates."""
        rows = await pool.fetch(
            """SELECT id, name, stage, sectors, employees, funding_m,
                      momentum, founded, city, region, status
               FROM companies
               WHERE founded IS NOT NULL"""
        )
        if not rows:
            return pd.DataFrame()

        df = pd.DataFrame([dict(r) for r in rows])
        df["funding_m"] = pd.to_numeric(df["funding_m"], errors="coerce").fillna(0)
        df["employees"] = pd.to_numeric(df["employees"], errors="coerce").fillna(0)
        df["momentum"] = pd.to_numeric(df["momentum"], errors="coerce").fillna(0)
        df["founded"] = pd.to_numeric(df["founded"], errors="coerce")
        df["stage_num"] = df["stage"].map(STAGE_ORDER).fillna(0).astype(int)
        df["entity_id"] = df["id"].astype(str)
        df["node_id"] = "c_" + df["id"].astype(str)
        df["log_funding"] = np.log1p(df["funding_m"])
        df["log_employees"] = np.log1p(df["employees"])

        # Primary sector
        df["primary_sector"] = df["sectors"].apply(
            lambda s: s[0] if s and len(s) > 0 else "unknown"
        )

        return df

    async def _load_graph_edges(self, pool) -> pd.DataFrame:
        """Load graph edges for relationship types used by causal analyses."""
        rows = await pool.fetch(
            """SELECT source_id, target_id, rel, event_year, matching_score, note
               FROM graph_edges
               WHERE rel IN ('accelerated_by', 'invested_in')"""
        )
        if not rows:
            return pd.DataFrame(
                columns=["source_id", "target_id", "rel", "event_year",
                         "matching_score", "note"]
            )
        df = pd.DataFrame([dict(r) for r in rows])
        df["event_year"] = pd.to_numeric(df["event_year"], errors="coerce")
        return df

    # ------------------------------------------------------------------
    # Analysis 1: Accelerator Difference-in-Differences
    # ------------------------------------------------------------------

    def _accelerator_did(self, companies: pd.DataFrame, edges: pd.DataFrame) -> dict:
        """Estimate accelerator treatment effect using DiD with bootstrap CIs.

        Treatment group: companies with 'accelerated_by' edges.
        Control group: companies without such edges.
        Outcomes: funding_m change, employee change, stage progression.
        """
        if edges.empty:
            return {"status": AgentStatus.SKIPPED, "reason": "no graph edges available"}

        # Find treated companies and their treatment timing
        accel_edges = edges[edges["rel"] == "accelerated_by"].copy()

        # Companies can appear as source or target; extract company node IDs
        treated_info: dict = {}  # node_id -> treatment_year
        for _, edge in accel_edges.iterrows():
            for node_col in ["source_id", "target_id"]:
                node_id = edge[node_col]
                if str(node_id).startswith("c_"):
                    year = edge.get("event_year")
                    if pd.notna(year):
                        # Keep earliest treatment year
                        if node_id not in treated_info or year < treated_info[node_id]:
                            treated_info[node_id] = int(year)

        if len(treated_info) < MIN_TREATMENT:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient treated companies ({len(treated_info)} < {MIN_TREATMENT})",
            }

        # Split into treatment and control
        companies = companies.copy()
        companies["treated"] = companies["node_id"].isin(treated_info).astype(int)
        companies["treatment_year"] = companies["node_id"].map(treated_info)

        treated = companies[companies["treated"] == 1]
        control = companies[companies["treated"] == 0]

        if len(control) < MIN_CONTROL:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient control companies ({len(control)} < {MIN_CONTROL})",
            }

        # Compute outcome differences:
        # For treated: post-treatment change approximated by
        #   years_since_treatment * observable outcomes
        # For control: same observation window
        current_year = date.today().year
        treated = treated.copy()
        treated["years_post"] = current_year - treated["treatment_year"]
        treated["years_post"] = treated["years_post"].clip(lower=0)

        # DiD: compare treated vs control outcomes
        # Use current observables as post-period proxy
        outcomes = ["funding_m", "employees", "stage_num"]
        outcome_labels = ["funding_m", "employees", "stage_progression"]

        att_results: dict = {}
        for outcome, label in zip(outcomes, outcome_labels):
            treated_mean = treated[outcome].mean()
            control_mean = control[outcome].mean()
            att = treated_mean - control_mean

            # Bootstrap 95% CI
            ci_lo, ci_hi = self._bootstrap_ci(
                treated[outcome].values,
                control[outcome].values,
                n_iterations=BOOTSTRAP_ITERATIONS,
            )

            att_results[label] = {
                "cross_sectional_att": float(att),
                "ci_95_lower": float(ci_lo),
                "ci_95_upper": float(ci_hi),
                "treated_mean": float(treated_mean),
                "control_mean": float(control_mean),
                "significant": bool(ci_lo > 0 or ci_hi < 0),
            }

        # Balance diagnostics: standardized mean differences for covariates
        balance_covariates = ["funding_m", "employees", "founded"]
        balance_diagnostics: dict = {}
        for cov in balance_covariates:
            if cov not in companies.columns:
                continue
            t_vals = treated[cov].dropna()
            c_vals = control[cov].dropna()
            if len(t_vals) == 0 or len(c_vals) == 0:
                continue
            t_mean = float(t_vals.mean())
            c_mean = float(c_vals.mean())
            pooled_std = float(np.sqrt((t_vals.var() + c_vals.var()) / 2))
            smd = (t_mean - c_mean) / pooled_std if pooled_std > 0 else 0.0
            balance_diagnostics[cov] = {
                "treated_mean": t_mean,
                "control_mean": c_mean,
                "standardized_mean_diff": float(smd),
                "balanced": bool(abs(smd) < 0.1),
            }

        return {
            "status": AgentStatus.COMPLETED,
            "n_treated": int(len(treated)),
            "n_control": int(len(control)),
            "cross_sectional_att": att_results,
            "balance_diagnostics": balance_diagnostics,
            "methodology_note": (
                "Cross-sectional comparison of treated vs control group outcomes. "
                "True DiD requires pre-treatment and post-treatment observations "
                "for the same units. This estimate may be biased by selection on "
                "unobservables."
            ),
        }

    @staticmethod
    def _bootstrap_ci(
        treated: np.ndarray,
        control: np.ndarray,
        n_iterations: int = 1000,
        alpha: float = 0.05,
    ) -> tuple[float, float]:
        """Compute bootstrap confidence interval for difference in means."""
        rng = np.random.default_rng(seed=42)
        diffs = np.empty(n_iterations)

        for i in range(n_iterations):
            t_sample = rng.choice(treated, size=len(treated), replace=True)
            c_sample = rng.choice(control, size=len(control), replace=True)
            diffs[i] = t_sample.mean() - c_sample.mean()

        lo = float(np.percentile(diffs, 100 * alpha / 2))
        hi = float(np.percentile(diffs, 100 * (1 - alpha / 2)))
        return lo, hi

    # ------------------------------------------------------------------
    # Analysis 2: SSBCI Fund Impact (PSM)
    # ------------------------------------------------------------------

    def _ssbci_psm(self, companies: pd.DataFrame, edges: pd.DataFrame) -> dict:
        """Estimate SSBCI fund impact using propensity score matching.

        Treatment: companies with 'invested_in' edges from SSBCI funds
        (source_id starting with 'f_').
        """
        try:
            from sklearn.linear_model import LogisticRegression
        except ImportError:
            return {"status": AgentStatus.SKIPPED, "reason": "sklearn not available"}

        if edges.empty:
            return {"status": AgentStatus.SKIPPED, "reason": "no graph edges available"}

        # Find SSBCI-invested companies
        ssbci_edges = edges[
            (edges["rel"] == "invested_in")
            & (edges["source_id"].str.startswith("f_", na=False))
        ]

        # The target of an invested_in edge from a fund is the company
        ssbci_company_nodes = set(ssbci_edges["target_id"].unique())

        if len(ssbci_company_nodes) < MIN_TREATMENT:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient SSBCI-invested companies ({len(ssbci_company_nodes)} < {MIN_TREATMENT})",
            }

        companies = companies.copy()
        companies["ssbci_treated"] = companies["node_id"].isin(
            ssbci_company_nodes
        ).astype(int)

        treated = companies[companies["ssbci_treated"] == 1]
        control = companies[companies["ssbci_treated"] == 0]

        if len(control) < MIN_CONTROL:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient control companies ({len(control)} < {MIN_CONTROL})",
            }

        # Propensity score estimation
        covariates = ["log_funding", "log_employees", "momentum", "stage_num"]
        available_covs = [c for c in covariates if c in companies.columns]

        if not available_covs:
            return {"status": AgentStatus.SKIPPED, "reason": "no covariates available"}

        X = companies[available_covs].fillna(0).values
        y = companies["ssbci_treated"].values

        # Check class balance
        if y.sum() < MIN_TREATMENT or (1 - y).sum() < MIN_CONTROL:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": "insufficient class balance for propensity model",
            }

        model = LogisticRegression(penalty="l2", C=1.0, max_iter=500)
        model.fit(X, y)
        pscore = model.predict_proba(X)[:, 1]
        companies["pscore"] = pscore

        # Check logistic regression convergence
        convergence_warning = None
        if hasattr(model, "n_iter_") and model.n_iter_[0] >= model.max_iter:
            convergence_warning = (
                f"Logistic regression did not converge within {model.max_iter} "
                "iterations. Propensity scores may be unreliable."
            )

        # Overlap check: proportion of treated units with pscore in [0.1, 0.9]
        treated_pscores = pscore[y == 1]
        overlap_proportion = float(
            np.mean((treated_pscores >= 0.1) & (treated_pscores <= 0.9))
        )
        overlap_warning = None
        if overlap_proportion < 0.5:
            overlap_warning = (
                f"Only {overlap_proportion:.1%} of treated units have propensity "
                "scores in [0.1, 0.9]. The overlap (positivity) assumption may "
                "be violated, leading to unreliable treatment effect estimates."
            )

        # Nearest-neighbor matching with caliper
        pscore_std = pscore.std()
        if pscore_std == 0:
            return {"status": AgentStatus.SKIPPED, "reason": "zero variance in propensity scores"}

        caliper = CALIPER_MULTIPLIER * pscore_std

        treated_idx = companies[companies["ssbci_treated"] == 1].index
        control_pool = companies[companies["ssbci_treated"] == 0].copy()

        matched_pairs: list[tuple[int, int]] = []
        used_controls: set[int] = set()

        for t_idx in treated_idx:
            t_pscore = companies.loc[t_idx, "pscore"]
            available = control_pool[~control_pool.index.isin(used_controls)]

            if available.empty:
                continue

            distances = np.abs(available["pscore"].values - t_pscore)
            min_idx_pos = np.argmin(distances)
            min_dist = distances[min_idx_pos]

            if min_dist <= caliper:
                c_idx = available.index[min_idx_pos]
                matched_pairs.append((t_idx, c_idx))
                used_controls.add(c_idx)

        if len(matched_pairs) < MIN_MATCHED_PAIRS:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient matched pairs ({len(matched_pairs)} < {MIN_MATCHED_PAIRS})",
            }

        # Extract matched samples
        t_indices = [p[0] for p in matched_pairs]
        c_indices = [p[1] for p in matched_pairs]
        matched_treated = companies.loc[t_indices]
        matched_control = companies.loc[c_indices]

        # Balance diagnostics: standardized mean differences
        balance: dict = {}
        for cov in available_covs:
            t_mean = matched_treated[cov].mean()
            c_mean = matched_control[cov].mean()
            pooled_std = np.sqrt(
                (matched_treated[cov].var() + matched_control[cov].var()) / 2
            )
            smd = (t_mean - c_mean) / pooled_std if pooled_std > 0 else 0.0
            balance[cov] = {
                "treated_mean": float(t_mean),
                "control_mean": float(c_mean),
                "standardized_mean_diff": float(smd),
                "balanced": bool(abs(smd) < 0.1),
            }

        # ATT on outcomes
        outcomes = ["funding_m", "employees", "stage_num"]
        outcome_labels = ["funding_m", "employees", "stage_progression"]
        att_results: dict = {}

        for outcome, label in zip(outcomes, outcome_labels):
            t_vals = matched_treated[outcome].values
            c_vals = matched_control[outcome].values
            att = float(t_vals.mean() - c_vals.mean())

            ci_lo, ci_hi = self._bootstrap_ci(t_vals, c_vals, BOOTSTRAP_ITERATIONS)

            att_results[label] = {
                "att": att,
                "ci_95_lower": float(ci_lo),
                "ci_95_upper": float(ci_hi),
                "treated_mean": float(t_vals.mean()),
                "control_mean": float(c_vals.mean()),
                "significant": bool(ci_lo > 0 or ci_hi < 0),
            }

        # Downgrade confidence when overlap is poor
        confidence_quality = "high"
        if overlap_proportion < 0.3:
            confidence_quality = "low"
        elif overlap_proportion < 0.5:
            confidence_quality = "moderate"

        result = {
            "status": AgentStatus.COMPLETED,
            "n_treated": int(len(matched_treated)),
            "n_control": int(len(matched_control)),
            "n_matched_pairs": len(matched_pairs),
            "caliper": float(caliper),
            "overlap_proportion": overlap_proportion,
            "confidence_quality": confidence_quality,
            "balance_diagnostics": balance,
            "att": att_results,
        }
        if overlap_warning:
            result["overlap_warning"] = overlap_warning
        if convergence_warning:
            result["convergence_warning"] = convergence_warning
        return result

    # ------------------------------------------------------------------
    # Analysis 3: Network Spillover
    # ------------------------------------------------------------------

    def _network_spillover(
        self,
        companies: pd.DataFrame,
        edges: pd.DataFrame,
        graph_df: pd.DataFrame,
    ) -> dict:
        """Estimate network spillover effects via OLS.

        For each company, compute mean PageRank and funding of 1-hop neighbors.
        Regress company outcomes on own covariates + neighbor averages.
        """
        if edges.empty:
            return {"status": AgentStatus.SKIPPED, "reason": "no graph edges available"}

        if graph_df.empty:
            return {"status": AgentStatus.SKIPPED, "reason": "no graph metrics available"}

        # Build neighbor map using vectorized filtering
        company_nodes = set(companies["node_id"].values)
        company_edges = edges[
            edges["source_id"].isin(company_nodes) & edges["target_id"].isin(company_nodes)
        ]
        neighbor_map: dict[str, list[str]] = {n: [] for n in company_nodes}
        for node_id in company_edges["source_id"].unique():
            neighbor_map[node_id] = company_edges[company_edges["source_id"] == node_id]["target_id"].tolist()
        for node_id in company_edges["target_id"].unique():
            neighbor_map.setdefault(node_id, []).extend(
                company_edges[company_edges["target_id"] == node_id]["source_id"].tolist()
            )

        # Compute neighbor averages
        # Merge graph metrics onto companies
        graph_reset = graph_df.reset_index()
        graph_lookup = graph_reset.set_index("node_id")[["pagerank", "betweenness"]].to_dict("index")

        funding_lookup = companies.set_index("node_id")["funding_m"].to_dict()

        neighbor_stats: list[dict] = []
        for _, row in companies.iterrows():
            node_id = row["node_id"]
            neighbors = neighbor_map.get(node_id, [])

            if not neighbors:
                neighbor_stats.append({
                    "node_id": node_id,
                    "neighbor_count": 0,
                    "neighbor_mean_pagerank": 0.0,
                    "neighbor_mean_funding": 0.0,
                })
                continue

            pr_vals = []
            fund_vals = []
            for nb in neighbors:
                if nb in graph_lookup:
                    pr = graph_lookup[nb].get("pagerank")
                    if pr is not None:
                        pr_vals.append(float(pr))
                if nb in funding_lookup:
                    fund_vals.append(float(funding_lookup[nb]))

            neighbor_stats.append({
                "node_id": node_id,
                "neighbor_count": len(neighbors),
                "neighbor_mean_pagerank": float(np.mean(pr_vals)) if pr_vals else 0.0,
                "neighbor_mean_funding": float(np.mean(fund_vals)) if fund_vals else 0.0,
            })

        neighbor_df = pd.DataFrame(neighbor_stats)
        analysis_df = companies.merge(neighbor_df, on="node_id", how="left")

        # Filter to companies with at least one neighbor
        analysis_df = analysis_df[analysis_df["neighbor_count"] > 0].copy()

        if len(analysis_df) < MIN_REGRESSION_OBS:
            return {
                "status": AgentStatus.SKIPPED,
                "reason": f"insufficient observations with neighbors ({len(analysis_df)} < {MIN_REGRESSION_OBS})",
            }

        # OLS regression: outcome ~ own covariates + neighbor averages
        own_covariates = ["log_funding", "log_employees", "momentum", "stage_num"]
        spillover_covariates = ["neighbor_mean_pagerank", "neighbor_mean_funding"]
        all_covs = own_covariates + spillover_covariates

        available_covs = [c for c in all_covs if c in analysis_df.columns]
        spillover_available = [c for c in spillover_covariates if c in available_covs]

        if not spillover_available:
            return {"status": AgentStatus.SKIPPED, "reason": "no spillover covariates available"}

        outcomes = ["funding_m", "employees"]
        outcome_labels = ["funding_m", "employees"]
        spillover_results: dict = {}

        for outcome, label in zip(outcomes, outcome_labels):
            ols_result = self._fit_ols(
                analysis_df, outcome, available_covs, spillover_available
            )
            if ols_result is not None:
                spillover_results[label] = ols_result

        if not spillover_results:
            return {"status": AgentStatus.NO_SPILLOVER_DATA, "reason": "OLS fitting failed for all outcomes"}

        return {
            "status": AgentStatus.COMPLETED,
            "n_observations": int(len(analysis_df)),
            "mean_neighbor_count": float(analysis_df["neighbor_count"].mean()),
            "outcomes": spillover_results,
        }

    @staticmethod
    def _fit_ols(
        df: pd.DataFrame,
        outcome: str,
        covariates: list[str],
        spillover_vars: list[str],
    ) -> dict | None:
        """Fit OLS regression and test spillover coefficient significance.

        Uses numpy lstsq. Returns coefficient estimates with p-values
        computed from t-statistics.
        """
        y = df[outcome].values.astype(float)
        X_raw = df[covariates].fillna(0).values.astype(float)

        n, k = X_raw.shape
        if n <= k + 1:
            return None

        # Add intercept
        X = np.column_stack([np.ones(n), X_raw])
        k_full = X.shape[1]

        try:
            beta, residuals, rank, sv = np.linalg.lstsq(X, y, rcond=None)
        except np.linalg.LinAlgError:
            return None

        y_hat = X @ beta
        resid = y - y_hat
        dof = n - k_full

        if dof <= 0:
            return None

        # Residual standard error
        rse = np.sqrt(np.sum(resid ** 2) / dof)

        # Standard errors of coefficients
        try:
            XtX_inv = np.linalg.inv(X.T @ X)
            se = np.sqrt(np.diag(XtX_inv) * rse ** 2)
        except np.linalg.LinAlgError:
            return None

        # t-statistics and two-sided p-values (normal approximation for large n)
        from scipy import stats as scipy_stats

        t_stats = beta / np.where(se > 0, se, 1e-10)
        p_values = 2 * scipy_stats.t.sf(np.abs(t_stats), df=dof)

        # R-squared
        ss_res = np.sum(resid ** 2)
        ss_tot = np.sum((y - y.mean()) ** 2)
        r_squared = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0

        # Map results: index 0 is intercept, then covariates in order
        covariate_names = ["intercept"] + covariates
        coefficients: dict = {}
        for i, name in enumerate(covariate_names):
            coef = float(beta[i])
            coef_se = float(se[i])
            coefficients[name] = {
                "coef": coef,
                "se": coef_se,
                "t_stat": float(t_stats[i]),
                "p_value": float(p_values[i]),
                "ci_95_lower": coef - 1.96 * coef_se,
                "ci_95_upper": coef + 1.96 * coef_se,
                "significant": bool(p_values[i] < 0.05),
            }

        # Summarize spillover coefficients specifically
        spillover_summary: dict = {}
        for var in spillover_vars:
            if var in coefficients:
                spillover_summary[var] = coefficients[var]

        return {
            "n": int(n),
            "r_squared": float(r_squared),
            "rse": float(rse),
            "dof": int(dof),
            "coefficients": coefficients,
            "spillover_coefficients": spillover_summary,
        }
