"""Base class for statistical model agents (non-LLM)."""

import json
import logging
import time
from abc import ABC, abstractmethod
from datetime import date, datetime, timezone
from typing import Optional

import numpy as np
import pandas as pd

from ..db import get_pool

logger = logging.getLogger(__name__)


class BaseModelAgent(ABC):
    """Base class for statistical/ML model agents.

    Parallels BaseAgent but does not require Claude API calls.
    Reads from metric_snapshots, writes to scenario_results,
    registers models in the models table, and logs runs via
    the existing agent_runs audit trail.
    """

    def __init__(self, agent_name: str, model_version: str = "1.0.0"):
        self.agent_name = agent_name
        self.model_version = model_version
        self.run_id: Optional[int] = None
        self.model_id: Optional[int] = None

    # ------------------------------------------------------------------
    # Execution lifecycle (mirrors BaseAgent.execute)
    # ------------------------------------------------------------------

    async def execute(self, **kwargs):
        """Execute agent with audit trail and duration logging."""
        pool = await get_pool()
        self.run_id = await self._start_run(pool, kwargs)
        t_start = time.perf_counter()
        logger.info(
            "Agent '%s' starting (run_id=%s).",
            self.agent_name,
            self.run_id,
        )
        try:
            result = await self.run(pool, **kwargs)
            elapsed = time.perf_counter() - t_start
            logger.info(
                "Agent '%s' completed in %.2fs (run_id=%s).",
                self.agent_name,
                elapsed,
                self.run_id,
            )
            await self._complete_run(pool, result)
            return result
        except Exception as e:
            elapsed = time.perf_counter() - t_start
            logger.error(
                "Agent '%s' failed after %.2fs (run_id=%s): %s",
                self.agent_name,
                elapsed,
                self.run_id,
                e,
            )
            await self._fail_run(pool, str(e))
            raise

    @abstractmethod
    async def run(self, pool, **kwargs):
        """Implement statistical model logic. Return result dict."""
        ...

    # ------------------------------------------------------------------
    # Data loading helpers
    # ------------------------------------------------------------------

    async def load_panel_data(
        self,
        pool,
        entity_type: str,
        metric_names: list[str],
        date_range: tuple[date, date] | None = None,
    ) -> pd.DataFrame:
        """Load metric_snapshots as a pivoted panel DataFrame.

        Returns a DataFrame with columns:
            entity_id, period_start, period_end, <metric_1>, <metric_2>, ...
        Rows are sorted by (entity_id, period_start).
        """
        query = """
            SELECT entity_id, metric_name, value, period_start, period_end
            FROM metric_snapshots
            WHERE entity_type = $1
              AND metric_name = ANY($2)
        """
        params: list = [entity_type, metric_names]

        if date_range is not None:
            query += " AND period_start >= $3 AND period_end <= $4"
            params.extend([date_range[0], date_range[1]])

        query += " ORDER BY entity_id, period_start"

        rows = await pool.fetch(query, *params)

        if not rows:
            return pd.DataFrame(
                columns=["entity_id", "period_start", "period_end"] + metric_names
            )

        df = pd.DataFrame([dict(r) for r in rows])
        df["value"] = pd.to_numeric(df["value"], errors="coerce")

        # Pivot: one row per (entity_id, period_start, period_end),
        # one column per metric
        pivoted = df.pivot_table(
            index=["entity_id", "period_start", "period_end"],
            columns="metric_name",
            values="value",
            aggfunc="first",
        ).reset_index()
        pivoted.columns.name = None

        return pivoted.sort_values(
            ["entity_id", "period_start"]
        ).reset_index(drop=True)

    async def load_graph_features(
        self,
        pool,
        node_types: list[str] | None = None,
    ) -> pd.DataFrame:
        """Load latest graph metrics as a node feature matrix.

        Returns a DataFrame indexed by node_id with columns:
            pagerank, betweenness, community_id
        Optionally filtered by node prefix (e.g. ['c'] for companies -> 'c_*').
        """
        rows = await pool.fetch(
            """SELECT node_id, pagerank, betweenness, community_id
               FROM graph_metrics_cache
               WHERE computed_at = (
                   SELECT MAX(computed_at) FROM graph_metrics_cache
               )"""
        )

        if not rows:
            return pd.DataFrame(
                columns=["node_id", "pagerank", "betweenness", "community_id"]
            ).set_index("node_id")

        df = pd.DataFrame([dict(r) for r in rows])

        if node_types:
            prefixes = tuple(f"{nt}_" for nt in node_types)
            df = df[df["node_id"].str.startswith(prefixes)]

        df = df.set_index("node_id")
        for col in ["pagerank", "betweenness"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    # ------------------------------------------------------------------
    # Result persistence helpers
    # ------------------------------------------------------------------

    async def save_predictions(
        self,
        pool,
        scenario_id: int,
        predictions_df: pd.DataFrame,
    ) -> int:
        """Write prediction rows to scenario_results.

        predictions_df must have columns:
            entity_type, entity_id, metric_name, value, period
        Optional columns:
            unit, confidence_lo, confidence_hi
        Returns number of rows written.
        """
        required = {"entity_type", "entity_id", "metric_name", "value", "period"}
        missing = required - set(predictions_df.columns)
        if missing:
            raise ValueError(f"predictions_df missing columns: {missing}")

        if predictions_df.empty:
            logger.warning(
                "save_predictions called with empty DataFrame for scenario_id=%s; "
                "skipping DB write.",
                scenario_id,
            )
            return 0

        # Replace inf with NaN for DB compatibility
        predictions_df = predictions_df.replace([np.inf, -np.inf], np.nan)

        # Warn if a significant fraction of values are NaN (data quality signal)
        nan_frac = predictions_df["value"].isna().mean()
        if nan_frac > 0.5:
            logger.warning(
                "save_predictions: %.0f%% of 'value' entries are NaN for "
                "scenario_id=%s — check upstream model output.",
                nan_frac * 100,
                scenario_id,
            )

        count = 0
        for _, row in predictions_df.iterrows():
            period_val = row["period"]
            if not isinstance(period_val, date):
                period_val = pd.Timestamp(period_val).date()

            await pool.execute(
                """INSERT INTO scenario_results
                   (scenario_id, entity_type, entity_id, metric_name,
                    value, unit, period, confidence_lo, confidence_hi)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                   ON CONFLICT (scenario_id, entity_type, entity_id, metric_name, period)
                   DO UPDATE SET value = EXCLUDED.value,
                                 unit = EXCLUDED.unit,
                                 confidence_lo = EXCLUDED.confidence_lo,
                                 confidence_hi = EXCLUDED.confidence_hi""",
                scenario_id,
                str(row["entity_type"]),
                str(row["entity_id"]),
                str(row["metric_name"]),
                float(row["value"]) if pd.notna(row.get("value")) else None,
                row.get("unit"),
                period_val,
                float(row["confidence_lo"]) if pd.notna(row.get("confidence_lo")) else None,
                float(row["confidence_hi"]) if pd.notna(row.get("confidence_hi")) else None,
            )
            count += 1

        return count

    async def register_model(
        self,
        pool,
        name: str,
        objective: str,
        input_vars: list[str],
        output_vars: list[str],
    ) -> int:
        """Upsert an entry in the models table. Returns model id."""
        row = await pool.fetchrow(
            """INSERT INTO models (name, objective, input_variables, output_variables, version)
               VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
               ON CONFLICT (name) DO UPDATE
                 SET objective = EXCLUDED.objective,
                     input_variables = EXCLUDED.input_variables,
                     output_variables = EXCLUDED.output_variables,
                     version = EXCLUDED.version,
                     updated_at = NOW()
               RETURNING id""",
            name,
            objective,
            json.dumps(input_vars),
            json.dumps(output_vars),
            self.model_version,
        )
        self.model_id = row["id"]
        return self.model_id

    async def save_analysis(
        self,
        pool,
        analysis_type: str,
        content: dict,
        entity_type: str | None = None,
        entity_id: str | None = None,
    ):
        """Save analysis result to analysis_results table (JSONB).

        Mirrors BaseAgent.save_analysis but uses the agent name as model_used.
        """
        await pool.execute(
            """INSERT INTO analysis_results
               (analysis_type, entity_type, entity_id, content, model_used, agent_run_id)
               VALUES ($1, $2, $3, $4, $5, $6)""",
            analysis_type,
            entity_type,
            entity_id,
            json.dumps(content, default=str),
            f"{self.agent_name}_v{self.model_version}",
            self.run_id,
        )

    async def create_scenario(
        self,
        pool,
        name: str,
        description: str,
        base_period: date,
        assumptions: dict | None = None,
    ) -> int:
        """Create a scenario entry and return its id."""
        row = await pool.fetchrow(
            """INSERT INTO scenarios
               (name, description, base_period, model_id, assumptions, status, created_by)
               VALUES ($1, $2, $3, $4, $5, 'running', $6)
               RETURNING id""",
            name,
            description,
            base_period,
            self.model_id,
            json.dumps(assumptions or {}),
            self.agent_name,
        )
        return row["id"]

    async def complete_scenario(self, pool, scenario_id: int):
        """Mark a scenario as complete."""
        await pool.execute(
            "UPDATE scenarios SET status = 'complete', updated_at = NOW() WHERE id = $1",
            scenario_id,
        )

    # ------------------------------------------------------------------
    # Audit trail (reuses same agent_runs table as BaseAgent)
    # ------------------------------------------------------------------

    async def _start_run(self, pool, params: dict) -> int:
        row = await pool.fetchrow(
            """INSERT INTO agent_runs (agent_name, status, input_params)
               VALUES ($1, 'running', $2)
               RETURNING id""",
            self.agent_name,
            json.dumps(params, default=str),
        )
        return row["id"]

    async def _complete_run(self, pool, result):
        summary = str(result)[:500] if result else None
        await pool.execute(
            """UPDATE agent_runs
               SET status = 'completed', completed_at = NOW(), output_summary = $2
               WHERE id = $1""",
            self.run_id,
            summary,
        )

    async def _fail_run(self, pool, error: str):
        await pool.execute(
            """UPDATE agent_runs
               SET status = 'failed', completed_at = NOW(), error_message = $2
               WHERE id = $1""",
            self.run_id,
            error[:1000],
        )
