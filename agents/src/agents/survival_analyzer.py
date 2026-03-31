"""Survival analysis agent -- Kaplan-Meier curves and Cox PH models.

Derives stage-transition durations from timeline_events + company covariates,
fits Kaplan-Meier curves by cohort (sector, region, accelerator participation),
fits a Cox Proportional Hazards model, and writes results to analysis_results
(JSONB) and scenario_results (forward survival predictions).
"""

import logging
import time
from datetime import date, datetime, timezone

import numpy as np
import pandas as pd

from .base_model_agent import BaseModelAgent
from .constants import STAGE_ORDER
from .status import AgentStatus

logger = logging.getLogger(__name__)

# Default milestone for survival: "reached Series A"
DEFAULT_EVENT_STAGE = "series_a"

# Maximum KM timeline data points to include in results
MAX_KM_TIMELINE_POINTS = 40


class SurvivalAnalyzer(BaseModelAgent):
    """Fits survival models on company stage-transition data."""

    def __init__(self):
        super().__init__("survival_analyzer", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        """Run survival analysis on company stage transitions.

        Builds a survival dataset from companies and timeline_events, fits
        Kaplan-Meier curves by cohort (region, sector, accelerator participation),
        fits a Cox Proportional Hazards model with network covariates, and
        writes forward survival predictions to scenario_results.

        Kwargs:
            None -- all configuration is derived from database state.
        """
        _t0 = time.perf_counter()
        logger.info("SurvivalAnalyzer.run starting.")
        model_id = await self.register_model(
            pool,
            name="survival_analyzer_v1",
            objective="Company survival analysis: time-to-milestone and hazard ratios",
            input_vars=["stage", "funding_m", "employees", "sectors", "region",
                         "accelerator_participation", "founded"],
            output_vars=["survival_probability", "hazard_ratio",
                         "median_survival_quarters"],
        )

        # Build the survival dataset from companies + timeline_events
        survival_df = await self._build_survival_dataset(pool)

        # Defensive: validate duration and event columns before fitting
        if not survival_df.empty:
            inf_mask = (
                np.isinf(survival_df["duration_quarters"].replace([None], np.nan).astype(float))
                if "duration_quarters" in survival_df.columns else pd.Series([], dtype=bool)
            )
            if inf_mask.any():
                logger.warning(
                    "SurvivalAnalyzer: %d rows with Inf duration_quarters dropped.",
                    int(inf_mask.sum()),
                )
                survival_df = survival_df[~inf_mask]

            nan_dur = survival_df["duration_quarters"].isna().sum()
            if nan_dur:
                logger.warning(
                    "SurvivalAnalyzer: %d rows with NaN duration_quarters dropped.",
                    int(nan_dur),
                )
                survival_df = survival_df.dropna(subset=["duration_quarters"])

        if survival_df.empty or len(survival_df) < 5:
            logger.warning("Insufficient data for survival analysis (n=%d).",
                           len(survival_df))
            return {"model_id": model_id, "records": 0, "status": AgentStatus.INSUFFICIENT_DATA}

        # Load graph features for network covariates
        graph_df = await self.load_graph_features(pool, node_types=["c"])

        # Merge graph features into survival dataset
        if not graph_df.empty:
            graph_reset = graph_df.reset_index()
            graph_reset["entity_id"] = graph_reset["node_id"].str.replace("c_", "", n=1)
            graph_reset = graph_reset.rename(columns={
                "pagerank": "graph_pagerank",
                "betweenness": "graph_betweenness",
            })[["entity_id", "graph_pagerank", "graph_betweenness"]]
            survival_df = survival_df.merge(graph_reset, on="entity_id", how="left")
            survival_df["graph_pagerank"] = survival_df["graph_pagerank"].fillna(0).astype(float)
            survival_df["graph_betweenness"] = survival_df["graph_betweenness"].fillna(0).astype(float)
        else:
            survival_df["graph_pagerank"] = 0.0
            survival_df["graph_betweenness"] = 0.0

        # Fit Kaplan-Meier by cohort
        km_results = self._fit_kaplan_meier(survival_df)

        # Fit Cox PH model
        cox_results = self._fit_cox_ph(survival_df)

        # Save analysis results as JSONB
        analysis_content = {
            "analysis_date": datetime.now(timezone.utc).isoformat(),
            "subjects": len(survival_df),
            "events_observed": int(survival_df["event"].sum()),
            "censored": int((~survival_df["event"].astype(bool)).sum()),
            "milestone": DEFAULT_EVENT_STAGE,
            "kaplan_meier": km_results,
            "cox_ph": cox_results,
        }
        await self.save_analysis(
            pool,
            analysis_type="survival_analysis",
            content=analysis_content,
        )

        # Generate forward survival predictions as scenario_results
        today = date.today()
        scenario_id = await self.create_scenario(
            pool,
            name=f"survival_analysis_{today.isoformat()}",
            description="Survival probabilities by cohort over future quarters",
            base_period=today,
            assumptions={
                "model": "kaplan_meier_cox_ph",
                "stage_order": list(STAGE_ORDER.keys()),
                "milestone": DEFAULT_EVENT_STAGE,
            },
        )

        predictions_df = self._generate_survival_predictions(km_results, today)
        rows_written = 0
        if not predictions_df.empty:
            rows_written = await self.save_predictions(pool, scenario_id, predictions_df)

        await self.complete_scenario(pool, scenario_id)

        elapsed = time.perf_counter() - _t0
        result = {
            "model_id": model_id,
            "scenario_id": scenario_id,
            "companies_analyzed": len(survival_df),
            "cohorts": len(km_results.get("cohorts", {})),
            "cox_covariates": len(cox_results.get("hazard_ratios", {})),
            "predictions_written": rows_written,
            "elapsed_s": round(elapsed, 3),
            "status": AgentStatus.COMPLETED,
        }
        logger.info("SurvivalAnalyzer completed in %.2fs: %s", elapsed, result)
        return result

    # ------------------------------------------------------------------
    # Data construction
    # ------------------------------------------------------------------

    async def _build_survival_dataset(self, pool) -> pd.DataFrame:
        """Build a survival dataset from companies and timeline_events.

        Each row represents a company with:
          - duration_quarters: time observed (founded to last event or now)
          - event: 1 if a stage transition (funding round) was observed, 0 if censored
          - covariates: sector, region, funding_m, employees, has_accelerator
        """
        # Fetch companies with a founding year
        companies = await pool.fetch(
            """SELECT id, slug, name, stage, sectors, region, funding_m,
                      employees, momentum, founded
               FROM companies
               WHERE founded IS NOT NULL"""
        )
        if not companies:
            return pd.DataFrame()

        company_df = pd.DataFrame([dict(c) for c in companies])
        company_df["funding_m"] = pd.to_numeric(
            company_df["funding_m"], errors="coerce"
        ).fillna(0)

        # Fetch funding/milestone events to detect stage transitions
        events = await pool.fetch(
            """SELECT te.company_id, te.event_date, te.event_type, te.detail
               FROM timeline_events te
               WHERE te.company_id IS NOT NULL
                 AND te.event_type IN ('funding', 'milestone', 'launch')
               ORDER BY te.company_id, te.event_date"""
        )
        events_df = (
            pd.DataFrame([dict(e) for e in events]) if events else pd.DataFrame()
        )

        # Check accelerator participation via graph_edges
        accel_companies = await pool.fetch(
            """SELECT DISTINCT
                 CAST(SUBSTRING(ge.source_id FROM 3) AS INTEGER) AS company_id
               FROM graph_edges ge
               WHERE ge.source_id LIKE 'c_\\_%'
                 AND ge.rel IN ('accelerated_by', 'participated_in')
               UNION
               SELECT DISTINCT
                 CAST(SUBSTRING(ge.target_id FROM 3) AS INTEGER) AS company_id
               FROM graph_edges ge
               WHERE ge.target_id LIKE 'c_\\_%'
                 AND ge.rel IN ('accelerated_by', 'participated_in')"""
        )
        accel_ids = (
            {r["company_id"] for r in accel_companies} if accel_companies else set()
        )

        # Build survival records using vectorized pandas operations
        current_year = date.today().year

        # Filter out companies with non-positive duration
        company_df["founded_int"] = company_df["founded"].astype(int)
        company_df["duration_years"] = current_year - company_df["founded_int"]
        company_df = company_df[company_df["duration_years"] > 0].copy()

        if company_df.empty:
            return pd.DataFrame()

        # Cap duration at 15 years (60 quarters)
        company_df["duration_quarters"] = (
            company_df["duration_years"] * 4
        ).clip(upper=60)

        # Vectorized event detection: count funding events per company
        has_funding_event = pd.Series(False, index=company_df.index)
        if (
            not events_df.empty
            and "company_id" in events_df.columns
        ):
            funding_counts = (
                events_df[events_df["event_type"] == "funding"]
                .groupby("company_id")
                .size()
            )
            company_df["_funding_count"] = (
                company_df["id"].map(funding_counts).fillna(0).astype(int)
            )
            has_funding_event = company_df["_funding_count"] >= 1
        else:
            company_df["_funding_count"] = 0

        # Also flag companies whose current stage >= milestone
        milestone_order = STAGE_ORDER.get(DEFAULT_EVENT_STAGE, 3)
        company_df["_stage_order"] = company_df["stage"].map(STAGE_ORDER).fillna(0)
        has_stage_event = company_df["_stage_order"] >= milestone_order

        company_df["event"] = (has_funding_event | has_stage_event).astype(int)

        # Primary sector (first element of sectors array)
        company_df["primary_sector"] = company_df["sectors"].apply(
            lambda s: s[0] if s and len(s) > 0 else "unknown"
        )

        # Accelerator participation
        company_df["has_accelerator"] = company_df["id"].isin(accel_ids).astype(int)

        # Derived numeric columns
        company_df["employees"] = company_df["employees"].fillna(0).astype(int)
        company_df["momentum"] = company_df["momentum"].fillna(0).astype(int)
        company_df["log_funding"] = np.log1p(company_df["funding_m"].astype(float))
        company_df["log_employees"] = np.log1p(company_df["employees"].astype(float))

        # Select and rename columns for the survival dataset
        result = company_df[[
            "id", "name", "duration_quarters", "event", "stage",
            "primary_sector", "region", "funding_m", "employees",
            "momentum", "has_accelerator", "log_funding", "log_employees",
        ]].copy()
        result = result.rename(columns={"id": "entity_id"})
        result["entity_id"] = result["entity_id"].astype(str)
        result["funding_m"] = result["funding_m"].astype(float)

        return result.reset_index(drop=True)

    # ------------------------------------------------------------------
    # Kaplan-Meier
    # ------------------------------------------------------------------

    def _fit_kaplan_meier(self, df: pd.DataFrame) -> dict:
        """Fit Kaplan-Meier survival curves, overall and by cohort."""
        results: dict = {"overall": {}, "cohorts": {}}

        try:
            from lifelines import KaplanMeierFitter
            km_impl = self._km_lifelines
        except ImportError:
            logger.info("lifelines not installed; using manual KM estimator.")
            km_impl = self._km_manual

        # Overall curve
        results["overall"] = km_impl(
            df["duration_quarters"].values,
            df["event"].values,
            label="overall",
        )

        # By region
        region_results: dict = {}
        for region, subset in df.groupby("region"):
            if len(subset) >= 3:
                region_results[str(region)] = km_impl(
                    subset["duration_quarters"].values,
                    subset["event"].values,
                    label=str(region),
                )
        if region_results:
            results["cohorts"]["region"] = region_results

        # By primary sector
        sector_results: dict = {}
        for sector, subset in df.groupby("primary_sector"):
            if len(subset) >= 3 and sector != "unknown":
                sector_results[str(sector)] = km_impl(
                    subset["duration_quarters"].values,
                    subset["event"].values,
                    label=str(sector),
                )
        if sector_results:
            results["cohorts"]["primary_sector"] = sector_results

        # By accelerator participation
        accel_results: dict = {}
        for accel_val in [0, 1]:
            subset = df[df["has_accelerator"] == accel_val]
            if len(subset) >= 3:
                label = "with_accelerator" if accel_val == 1 else "no_accelerator"
                accel_results[label] = km_impl(
                    subset["duration_quarters"].values,
                    subset["event"].values,
                    label=label,
                )
        if accel_results:
            results["cohorts"]["has_accelerator"] = accel_results

        return results

    @staticmethod
    def _km_lifelines(
        durations: np.ndarray, events: np.ndarray, label: str
    ) -> dict:
        """Kaplan-Meier via lifelines."""
        from lifelines import KaplanMeierFitter

        kmf = KaplanMeierFitter()
        kmf.fit(durations, event_observed=events, label=label)

        timeline = kmf.survival_function_.index.tolist()
        survival = kmf.survival_function_[label].tolist()
        median = (
            float(kmf.median_survival_time_)
            if np.isfinite(kmf.median_survival_time_)
            else None
        )

        return {
            "n": int(len(durations)),
            "events": int(events.sum()),
            "median_quarters": median,
            "timeline_quarters": [float(t) for t in timeline[:MAX_KM_TIMELINE_POINTS]],
            "survival_prob": [float(s) for s in survival[:MAX_KM_TIMELINE_POINTS]],
        }

    @staticmethod
    def _km_manual(
        durations: np.ndarray, events: np.ndarray, label: str
    ) -> dict:
        """Simple manual Kaplan-Meier estimator (no lifelines dependency)."""
        order = np.argsort(durations)
        T = durations[order]
        E = events[order]
        n = len(T)

        unique_times = np.unique(T)
        survival = 1.0
        timeline: list[float] = [0.0]
        surv_probs: list[float] = [1.0]

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

    # ------------------------------------------------------------------
    # Cox Proportional Hazards
    # ------------------------------------------------------------------

    def _fit_cox_ph(self, df: pd.DataFrame) -> dict:
        """Fit Cox PH model to estimate hazard ratios for covariates."""
        covariates = [
            "log_funding", "log_employees", "has_accelerator",
            "graph_pagerank", "graph_betweenness",
        ]
        available_covs = [c for c in covariates if c in df.columns]

        if len(available_covs) == 0 or df["event"].sum() < 2:
            return {"hazard_ratios": {}, "status": "insufficient_events"}

        cox_df = df[
            ["duration_quarters", "event"] + available_covs
        ].copy().fillna(0)

        if len(cox_df) < 5:
            return {"hazard_ratios": {}, "status": AgentStatus.INSUFFICIENT_DATA}

        try:
            return self._cox_lifelines(cox_df, available_covs)
        except ImportError:
            logger.info(
                "lifelines not installed; using logistic approximation for Cox PH."
            )
            return self._cox_fallback(cox_df, available_covs)
        except Exception as e:
            logger.warning("Cox PH fitting failed: %s", e)
            return {"hazard_ratios": {}, "status": f"fit_error: {e}"}

    @staticmethod
    def _cox_lifelines(df: pd.DataFrame, covariates: list[str]) -> dict:
        """Cox PH via lifelines."""
        from lifelines import CoxPHFitter

        # Normalize covariates for numerical stability
        fit_df = df.copy()
        for col in covariates:
            col_std = fit_df[col].std()
            if col_std > 0:
                fit_df[col] = (fit_df[col] - fit_df[col].mean()) / col_std

        cph = CoxPHFitter(penalizer=0.1)
        cph.fit(fit_df, duration_col="duration_quarters", event_col="event")

        summary = cph.summary
        hazard_ratios: dict = {}
        for cov in covariates:
            if cov in summary.index:
                row = summary.loc[cov]
                hazard_ratios[cov] = {
                    "coef": float(row["coef"]),
                    "hazard_ratio": float(row["exp(coef)"]),
                    "ci_lower": float(row["exp(coef) lower 95%"]),
                    "ci_upper": float(row["exp(coef) upper 95%"]),
                    "p_value": float(row["p"]),
                }

        return {
            "hazard_ratios": hazard_ratios,
            "concordance_index": float(cph.concordance_index_),
            "n": len(df),
            "events": int(df["event"].sum()),
            "ci_quality": "exact",
            "status": AgentStatus.COMPLETED,
        }

    @staticmethod
    def _cox_fallback(df: pd.DataFrame, covariates: list[str]) -> dict:
        """Approximate hazard ratios using logistic regression (sklearn)."""
        try:
            from sklearn.linear_model import LogisticRegression
        except ImportError:
            return {"hazard_ratios": {}, "status": "sklearn_not_available"}

        X = df[covariates].values
        y = df["event"].values

        if y.sum() < 2 or (1 - y).sum() < 2:
            return {"hazard_ratios": {}, "status": AgentStatus.INSUFFICIENT_CLASS_BALANCE}

        model = LogisticRegression(penalty="l2", C=1.0, max_iter=500)
        model.fit(X, y)

        hazard_ratios: dict = {}
        for i, cov in enumerate(covariates):
            coef = float(model.coef_[0][i])
            hr = float(np.exp(coef))
            # SE approximation: use 1/sqrt(n_events) as baseline,
            # scaled by covariate variance for better coverage
            n_events = int(df["event"].sum())
            base_se = 1.0 / max(np.sqrt(n_events), 1.0)
            # Scale SE by inverse of covariate std (wider CI for low-variance covariates)
            cov_std = float(df[cov].std()) if cov in df.columns else 1.0
            se = base_se / max(cov_std, 0.01)
            se = np.clip(se, 0.05, 2.0)  # bound to reasonable range
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
            "methodology_note": (
                "Confidence intervals computed using approximate SE=0.5. "
                "These are illustrative bounds, not statistically rigorous. "
                "Install lifelines for exact CIs."
            ),
            "status": AgentStatus.COMPLETED_FALLBACK,
        }

    # ------------------------------------------------------------------
    # Forward predictions
    # ------------------------------------------------------------------

    def _generate_survival_predictions(
        self, km_results: dict, base_date: date
    ) -> pd.DataFrame:
        """Generate forward survival probability predictions from KM curves.

        Produces scenario_results rows: one per (cohort, future_quarter).
        """
        rows: list[dict] = []

        # Overall predictions
        overall = km_results.get("overall", {})
        if overall:
            rows.extend(
                self._km_to_prediction_rows("cohort", "overall", overall, base_date)
            )

        # Per-cohort predictions
        for cohort_col, cohort_groups in km_results.get("cohorts", {}).items():
            for group_name, group_data in cohort_groups.items():
                entity_id = f"{cohort_col}:{group_name}"
                rows.extend(
                    self._km_to_prediction_rows(
                        f"cohort_{cohort_col}", entity_id, group_data, base_date
                    )
                )

        if not rows:
            return pd.DataFrame()

        return pd.DataFrame(rows)

    @staticmethod
    def _km_to_prediction_rows(
        entity_type: str,
        entity_id: str,
        km_data: dict,
        base_date: date,
    ) -> list[dict]:
        """Convert a KM curve into prediction rows for scenario_results."""
        timeline = km_data.get("timeline_quarters", [])
        survival = km_data.get("survival_prob", [])
        n = km_data.get("n", 0)

        rows: list[dict] = []
        for t_q, s_prob in zip(timeline, survival):
            if t_q <= 0:
                continue

            future_date = (
                pd.Timestamp(base_date) + pd.DateOffset(months=int(t_q) * 3)
            ).date()

            # Greenwood-style CI approximation
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
