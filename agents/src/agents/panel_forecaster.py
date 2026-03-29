"""Panel forecaster agent -- hierarchical time-series / panel regression.

Loads metric_snapshots for companies (funding_m, employees, momentum by quarter),
fits a simple panel model, and generates forward forecasts with confidence intervals.
Writes results to scenario_results and registers itself in the models table.
"""

import logging
import math
import time
from datetime import date, datetime, timezone

import numpy as np
import pandas as pd

from .base_model_agent import BaseModelAgent
from .status import AgentStatus

logger = logging.getLogger(__name__)

# Metrics to forecast
PANEL_METRICS = ["funding_m", "employees", "momentum"]
FORECAST_QUARTERS = 4  # how many quarters ahead


class PanelForecaster(BaseModelAgent):
    """Runs hierarchical time-series / panel regression on company metrics."""

    def __init__(self):
        super().__init__("panel_forecaster", model_version="1.0.0")

    async def run(self, pool, **kwargs):
        """Run panel forecasting on all entities with sufficient time-series data.

        Fits OLS linear trend models per entity per metric and generates
        quarterly forward forecasts with confidence intervals. Results are
        written to scenario_results.

        Kwargs:
            None -- all configuration is derived from database state.
        """
        _t0 = time.perf_counter()
        logger.info("PanelForecaster.run starting.")
        # Register this model in the models table
        model_id = await self.register_model(
            pool,
            name="panel_forecaster_v1",
            objective="Quarterly company metric forecasts with confidence intervals",
            input_vars=PANEL_METRICS,
            output_vars=[f"{m}_forecast" for m in PANEL_METRICS],
        )

        # Load panel data from metric_snapshots
        panel = await self.load_panel_data(
            pool,
            entity_type="company",
            metric_names=PANEL_METRICS,
        )

        if panel.empty:
            logger.warning("No metric_snapshots data found; returning empty forecast.")
            return {"model_id": model_id, "forecasts": 0, "status": AgentStatus.NO_DATA}

        # Defensive: drop fully-NaN metric rows before fitting
        metric_cols = [m for m in PANEL_METRICS if m in panel.columns]
        before = len(panel)
        panel = panel.dropna(subset=metric_cols, how="all")
        dropped = before - len(panel)
        if dropped:
            logger.warning(
                "PanelForecaster: dropped %d rows with all-NaN metric values.", dropped
            )

        if panel.empty:
            logger.warning("Panel is empty after NaN filtering; no forecasts produced.")
            return {"model_id": model_id, "forecasts": 0, "status": AgentStatus.NO_DATA}

        # Ensure date columns are proper datetime for arithmetic
        panel["period_start"] = pd.to_datetime(panel["period_start"])
        panel["period_end"] = pd.to_datetime(panel["period_end"])

        # Fit per-entity trend models and generate forecasts
        all_predictions: list[dict] = []
        entities = panel["entity_id"].unique()
        entities_modeled = 0

        for entity_id in entities:
            entity_data = panel[panel["entity_id"] == entity_id].copy()
            if len(entity_data) < 2:
                continue

            entity_produced = False
            for metric in PANEL_METRICS:
                if metric not in entity_data.columns:
                    continue
                series = entity_data[["period_start", metric]].dropna()
                if len(series) < 2:
                    continue

                preds = self._forecast_metric(entity_id, metric, series)
                all_predictions.extend(preds)
                entity_produced = True

            if entity_produced:
                entities_modeled += 1

        if not all_predictions:
            logger.warning("Insufficient data to produce any forecasts.")
            return {"model_id": model_id, "forecasts": 0, "status": AgentStatus.INSUFFICIENT_DATA}

        predictions_df = pd.DataFrame(all_predictions)

        # Create a scenario for this forecast run
        today = date.today()
        scenario_id = await self.create_scenario(
            pool,
            name=f"panel_forecast_{today.isoformat()}",
            description="Auto-generated quarterly panel forecast",
            base_period=today,
            assumptions={
                "model": "ols_linear_trend",
                "metrics": PANEL_METRICS,
                "forecast_quarters": FORECAST_QUARTERS,
            },
        )

        rows_written = await self.save_predictions(pool, scenario_id, predictions_df)
        await self.complete_scenario(pool, scenario_id)

        elapsed = time.perf_counter() - _t0
        result = {
            "model_id": model_id,
            "scenario_id": scenario_id,
            "entities_modeled": entities_modeled,
            "forecasts": rows_written,
            "elapsed_s": round(elapsed, 3),
            "status": AgentStatus.COMPLETED,
        }

        logger.info("PanelForecaster completed in %.2fs: %s", elapsed, result)
        return result

    def _forecast_metric(
        self,
        entity_id: str,
        metric: str,
        series: pd.DataFrame,
    ) -> list[dict]:
        """Fit a simple OLS linear trend and produce forecasts with CIs.

        Uses numpy lstsq for minimal dependencies.  Falls back gracefully
        if the data is degenerate.
        """
        series = series.sort_values("period_start").reset_index(drop=True)
        y = series[metric].values.astype(float)
        dates = pd.to_datetime(series["period_start"])

        # Numeric time index (quarters since first observation)
        t0 = dates.iloc[0]
        t = np.array([(d - t0).days / 91.25 for d in dates])
        n = len(y)

        # Stationarity check: coefficient of variation
        y_mean = float(y.mean())
        y_std = float(y.std())
        cv = y_std / abs(y_mean) if y_mean != 0 else float("inf")
        stationarity_warning = bool(cv > 2.0)

        # OLS: y = a + b*t
        trend_not_significant = False
        try:
            X = np.column_stack([np.ones(n), t])
            beta, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
            y_hat = X @ beta
            resid = y - y_hat

            # Residual standard error
            if n > 2:
                rse = float(np.sqrt(np.sum(resid ** 2) / (n - 2)))
            else:
                rse = float(np.abs(y.mean()) * 0.1) if y.mean() != 0 else 1.0

            # Trend significance check: t-statistic for slope coefficient
            if n > 2 and rse > 0:
                try:
                    XtX_inv = np.linalg.inv(X.T @ X)
                    se_beta1 = float(np.sqrt(XtX_inv[1, 1] * rse ** 2))
                    t_stat = float(beta[1] / se_beta1) if se_beta1 > 0 else 0.0
                except np.linalg.LinAlgError:
                    t_stat = 0.0
            else:
                t_stat = 0.0
            trend_not_significant = bool(abs(t_stat) < 1.96)
        except (np.linalg.LinAlgError, ValueError):
            # Fallback: flat forecast at last observed value
            beta = np.array([y[-1], 0.0])
            rse = float(np.abs(y.mean()) * 0.2) if y.mean() != 0 else 1.0
            t_stat = 0.0
            trend_not_significant = True

        # Build metadata for diagnostics
        metadata = {
            "stationarity_warning": stationarity_warning,
            "coefficient_of_variation": float(cv) if np.isfinite(cv) else None,
            "trend_not_significant": trend_not_significant,
            "slope_t_statistic": float(t_stat),
        }

        # Generate future quarters
        last_date = dates.iloc[-1]
        last_t = t[-1]
        predictions: list[dict] = []

        for q in range(1, FORECAST_QUARTERS + 1):
            future_t = last_t + q
            pred = float(beta[0] + beta[1] * future_t)

            # 95% CI: +/- 1.96 * rse * sqrt(1 + 1/n)
            ci_width = 1.96 * rse * np.sqrt(1 + 1.0 / max(n, 1))
            future_date = (last_date + pd.DateOffset(months=3 * q)).date()

            predictions.append({
                "entity_type": "company",
                "entity_id": entity_id,
                "metric_name": f"{metric}_forecast",
                "value": _sanitize_value(pred),
                "unit": _unit_for_metric(metric),
                "period": future_date,
                "confidence_lo": _sanitize_value(pred - ci_width),
                "confidence_hi": _sanitize_value(pred + ci_width),
                "metadata": metadata,
            })

        return predictions


def _sanitize_value(v):
    """Clamp Inf/NaN to None so they don't corrupt the database."""
    if v is None or math.isnan(v) or math.isinf(v):
        return None
    return v


def _unit_for_metric(metric: str) -> str:
    """Map metric names to their units."""
    units = {
        "funding_m": "usd_millions",
        "employees": "count",
        "momentum": "percent",
    }
    return units.get(metric, "units")
