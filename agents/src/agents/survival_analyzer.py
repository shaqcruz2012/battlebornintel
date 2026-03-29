"""Survival analysis agent -- Kaplan-Meier curves and Cox PH models.

Loads stage_transitions + company covariates, fits survival models,
and generates survival probabilities and hazard ratios by cohort.
"""

import json
import logging
from datetime import datetime, timezone

import numpy as np
import pandas as pd

from .base_model_agent import BaseModelAgent

logger = logging.getLogger(__name__)

# Stage ordering for milestone progression
STAGE_ORDER = {
    "pre_seed": 1,
    "seed": 2,
    "series_a": 3,
    "series_b": 4,
    "series_c_plus": 5,
    "growth": 6,
}

# Default milestone for survival: "reached Series A"
DEFAULT_EVENT_STAGE = "series_a"


class SurvivalAnalyzer(BaseModelAgent):
    """Fits survival models on company stage progression data."""

    def __init__(self):
        super().__init__("survival_analyzer")

    async def run(self, pool, **kwargs):
        model_id = await self.register_model(
            pool,
            name="survival_analyzer_v1",
            objective="Company survival analysis: time-to-milestone and hazard ratios",
            input_vars=["stage_transitions", "company_covariates", "graph_metrics"],
            output_vars=["survival_curves", "hazard_ratios", "median_survival"],
        )

        # Load stage transitions
        transitions_df = await self._load_transitions(pool)
        if transitions_df.empty:
            logger.warning("No stage_transitions data found.")
            return {"model_id": model_id, "status": "no_data"}

        # Load company covariates
        covariates_df = await self._load_covariates(pool)

        # Load graph features for network covariates
        graph_df = await self.load_graph_features(pool, node_types=["c"])

        # Build survival dataset
        survival_df = self._build_survival_dataset(
            transitions_df, covariates_df, graph_df
        )

        if survival_df.empty or len(survival_df) < 5:
            logger.warning("Insufficient survival data (need >= 5 subjects).")
            return {"model_id": model_id, "status": "insufficient_data"}

        # Fit Kaplan-Meier by cohort
        km_results = self._fit_kaplan_meier(survival_df)

        # Fit Cox PH (if enough data and lifelines available)
        cox_results = self._fit_cox_ph(survival_df)

        # Combine results
        content = {
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
            content=content,
            model_used="survival_analyzer_v1",
        )

        return {
            "model_id": model_id,
            "subjects": len(survival_df),
            "events": int(survival_df["event"].sum()),
            "cohorts_analyzed": len(km_results.get("cohorts", {})),
            "status": "completed",
        }

    async def _load_transitions(self, pool) -> pd.DataFrame:
        rows = await pool.fetch(
            """SELECT company_id, from_stage, to_stage, transition_date,
                      transition_year, evidence_type, confidence
               FROM stage_transitions
               ORDER BY company_id,
                        COALESCE(transition_date, make_date(COALESCE(transition_year, 2000), 1, 1))"""
        )
        if not rows:
            return pd.DataFrame()
        return pd.DataFrame([dict(r) for r in rows])

    async def _load_covariates(self, pool) -> pd.DataFrame:
        rows = await pool.fetch(
            """SELECT id, stage, sectors, region, funding_m, momentum,
                      employees, founded, status
               FROM companies"""
        )
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame([dict(r) for r in rows])
        df = df.rename(columns={"id": "company_id"})
        return df

    def _build_survival_dataset(
        self,
        transitions_df: pd.DataFrame,
        covariates_df: pd.DataFrame,
        graph_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """Build a survival dataset: one row per company with duration and event indicator.

        Duration = years from founding (or first observation) to reaching the milestone stage.
        Event = 1 if milestone reached, 0 if censored (still at earlier stage).
        """
        records = []
        event_order = STAGE_ORDER.get(DEFAULT_EVENT_STAGE, 3)

        for company_id in transitions_df["company_id"].unique():
            co_trans = transitions_df[transitions_df["company_id"] == company_id]
            co_cov = covariates_df[covariates_df["company_id"] == company_id]

            if co_cov.empty:
                continue

            cov = co_cov.iloc[0]
            founded = cov.get("founded")
            if not founded or pd.isna(founded):
                founded = 2020  # fallback

            # Check if company reached the milestone
            reached = co_trans[
                co_trans["to_stage"].map(lambda s: STAGE_ORDER.get(s, 0)) >= event_order
            ]

            if not reached.empty:
                first_reach = reached.iloc[0]
                event_year = first_reach.get("transition_year")
                if pd.isna(event_year) and pd.notna(first_reach.get("transition_date")):
                    event_year = pd.Timestamp(first_reach["transition_date"]).year
                if pd.isna(event_year):
                    event_year = 2025
                duration = max(event_year - founded, 0.5)
                event = 1
            else:
                # Censored: duration = current year - founded
                duration = max(2026 - founded, 0.5)
                event = 0

            # Covariates
            node_id = f"c_{company_id}"
            pagerank = 0
            betweenness = 0
            if not graph_df.empty and node_id in graph_df.index:
                pagerank = graph_df.loc[node_id].get("pagerank", 0) or 0
                betweenness = graph_df.loc[node_id].get("betweenness", 0) or 0

            primary_sector = ""
            sectors = cov.get("sectors")
            if sectors and len(sectors) > 0:
                primary_sector = sectors[0]

            records.append({
                "company_id": company_id,
                "duration": float(duration),
                "event": int(event),
                "region": cov.get("region", "unknown"),
                "primary_sector": primary_sector,
                "funding_m": float(cov.get("funding_m", 0) or 0),
                "employees": int(cov.get("employees", 0) or 0),
                "momentum": int(cov.get("momentum", 0) or 0),
                "pagerank": float(pagerank),
                "betweenness": float(betweenness),
                "status": cov.get("status", "active"),
            })

        return pd.DataFrame(records)

    def _fit_kaplan_meier(self, df: pd.DataFrame) -> dict:
        """Fit Kaplan-Meier survival curves, overall and by cohort."""
        results = {"overall": {}, "cohorts": {}}

        try:
            from lifelines import KaplanMeierFitter

            kmf = KaplanMeierFitter()

            # Overall curve
            kmf.fit(df["duration"], event_observed=df["event"])
            results["overall"] = {
                "median_survival_years": float(kmf.median_survival_time_)
                if not np.isinf(kmf.median_survival_time_)
                else None,
                "survival_at_3yr": float(kmf.predict(3.0)),
                "survival_at_5yr": float(kmf.predict(5.0)),
                "survival_at_10yr": float(kmf.predict(10.0)),
            }

            # By region
            for region in df["region"].unique():
                subset = df[df["region"] == region]
                if len(subset) >= 3:
                    kmf.fit(subset["duration"], event_observed=subset["event"])
                    results["cohorts"][f"region_{region}"] = {
                        "n": len(subset),
                        "events": int(subset["event"].sum()),
                        "median_survival_years": float(kmf.median_survival_time_)
                        if not np.isinf(kmf.median_survival_time_)
                        else None,
                    }

            # By funding tier
            for tier_name, (lo, hi) in [
                ("unfunded", (0, 0.01)),
                ("seed_funded", (0.01, 5)),
                ("well_funded", (5, 50)),
                ("heavily_funded", (50, 100000)),
            ]:
                subset = df[(df["funding_m"] >= lo) & (df["funding_m"] < hi)]
                if len(subset) >= 3:
                    kmf.fit(subset["duration"], event_observed=subset["event"])
                    results["cohorts"][f"funding_{tier_name}"] = {
                        "n": len(subset),
                        "events": int(subset["event"].sum()),
                        "median_survival_years": float(kmf.median_survival_time_)
                        if not np.isinf(kmf.median_survival_time_)
                        else None,
                    }

        except ImportError:
            logger.warning("lifelines not installed; using numpy fallback for KM.")
            results["overall"] = self._numpy_kaplan_meier(df)

        return results

    def _numpy_kaplan_meier(self, df: pd.DataFrame) -> dict:
        """Simple Kaplan-Meier using numpy only (fallback)."""
        durations = df["duration"].values
        events = df["event"].values

        unique_times = np.sort(np.unique(durations[events == 1]))
        survival = 1.0
        curve = []

        for t in unique_times:
            at_risk = np.sum(durations >= t)
            events_at_t = np.sum((durations == t) & (events == 1))
            if at_risk > 0:
                survival *= 1 - events_at_t / at_risk
            curve.append({"time": float(t), "survival": float(survival)})

        median = None
        for point in curve:
            if point["survival"] <= 0.5:
                median = point["time"]
                break

        return {
            "median_survival_years": median,
            "subjects": len(df),
            "events": int(events.sum()),
            "curve_points": curve[:20],
        }

    def _fit_cox_ph(self, df: pd.DataFrame) -> dict:
        """Fit Cox Proportional Hazards model."""
        try:
            from lifelines import CoxPHFitter

            # Prepare covariates (numeric only)
            cox_df = df[["duration", "event", "funding_m", "employees",
                         "momentum", "pagerank", "betweenness"]].copy()
            cox_df = cox_df.fillna(0)

            # Normalize covariates for numerical stability
            for col in ["funding_m", "employees", "momentum", "pagerank", "betweenness"]:
                col_std = cox_df[col].std()
                if col_std > 0:
                    cox_df[col] = (cox_df[col] - cox_df[col].mean()) / col_std

            cph = CoxPHFitter(penalizer=0.1)
            cph.fit(cox_df, duration_col="duration", event_col="event")

            summary = cph.summary
            hazard_ratios = {}
            for covar in summary.index:
                hazard_ratios[covar] = {
                    "coef": float(summary.loc[covar, "coef"]),
                    "hazard_ratio": float(np.exp(summary.loc[covar, "coef"])),
                    "p_value": float(summary.loc[covar, "p"]),
                    "ci_lower": float(summary.loc[covar, "coef lower 95%"]),
                    "ci_upper": float(summary.loc[covar, "coef upper 95%"]),
                }

            return {
                "concordance": float(cph.concordance_index_),
                "hazard_ratios": hazard_ratios,
                "log_likelihood": float(cph.log_likelihood_),
            }

        except ImportError:
            logger.warning("lifelines not installed; skipping Cox PH.")
            return {"error": "lifelines not installed"}
        except Exception as e:
            logger.error("Cox PH fitting failed: %s", e)
            return {"error": str(e)}
