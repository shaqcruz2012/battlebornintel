"""Shared audit-trail methods for agent base classes."""

import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class AuditMixin:
    """Mixin providing agent_runs audit trail and analysis persistence."""

    agent_name: str  # Must be set by the concrete class

    def _model_label(self) -> str:
        """Return label for model_used column. Override in subclasses."""
        return "unknown"

    async def _start_run(self, pool, input_params: dict | None = None):
        row = await pool.fetchrow(
            """INSERT INTO agent_runs (agent_name, status, input_params, started_at)
               VALUES ($1, 'running', $2, $3) RETURNING id""",
            self.agent_name,
            json.dumps(input_params or {}, default=str),
            datetime.now(timezone.utc),
        )
        self.run_id = row["id"]

    async def _complete_run(self, pool, output_summary: dict | None = None):
        summary_text = json.dumps(output_summary or {}, default=str)[:4000]
        await pool.execute(
            """UPDATE agent_runs
               SET status = 'completed', output_summary = $1, completed_at = $2
               WHERE id = $3""",
            summary_text,
            datetime.now(timezone.utc),
            self.run_id,
        )

    async def _fail_run(self, pool, error_message: str):
        await pool.execute(
            """UPDATE agent_runs
               SET status = 'failed', error_message = $1, completed_at = $2
               WHERE id = $3""",
            error_message[:2000],
            datetime.now(timezone.utc),
            self.run_id,
        )

    async def save_analysis(
        self,
        pool,
        analysis_type: str,
        content: dict,
        entity_type: str | None = None,
        entity_id: str | None = None,
        model_used: str | None = None,
    ):
        """Save analysis result to database."""
        model_used = model_used or self._model_label()
        await pool.execute(
            """INSERT INTO analysis_results
               (analysis_type, entity_type, entity_id, content, model_used, agent_run_id)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT DO NOTHING""",
            analysis_type,
            entity_type,
            entity_id,
            json.dumps(content, default=str),
            model_used,
            self.run_id,
        )
