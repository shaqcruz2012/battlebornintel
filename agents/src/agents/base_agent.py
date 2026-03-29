import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone

import anthropic

from ..db import get_pool

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all BBI AI agents."""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.client = anthropic.Anthropic()
        self.run_id = None

    async def execute(self, **kwargs):
        """Execute agent with audit trail."""
        pool = await get_pool()
        self.run_id = await self._start_run(pool, kwargs)
        try:
            result = await self.run(pool, **kwargs)
            await self._complete_run(pool, result)
            return result
        except Exception as e:
            await self._fail_run(pool, str(e))
            raise

    @abstractmethod
    async def run(self, pool, **kwargs):
        """Implement agent logic. Return result dict."""
        ...

    def call_claude(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4096,
    ) -> str:
        """Call Claude API with structured prompts."""
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            if not response.content:
                logger.warning("Claude API returned empty content for agent '%s'", self.agent_name)
                return ""
            return response.content[0].text
        except Exception as e:
            logger.error("Claude API call failed for agent '%s': %s", self.agent_name, e)
            raise

    async def save_analysis(
        self,
        pool,
        analysis_type: str,
        content: dict,
        entity_type: str | None = None,
        entity_id: str | None = None,
        model_used: str = "claude-sonnet-4-20250514",
    ):
        """Save analysis result to database."""
        await pool.execute(
            """INSERT INTO analysis_results
               (analysis_type, entity_type, entity_id, content, model_used, agent_run_id)
               VALUES ($1, $2, $3, $4, $5, $6)""",
            analysis_type,
            entity_type,
            entity_id,
            json.dumps(content),
            model_used,
            self.run_id,
        )

    async def _start_run(self, pool, params):
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

    async def _fail_run(self, pool, error):
        await pool.execute(
            """UPDATE agent_runs
               SET status = 'failed', completed_at = NOW(), error_message = $2
               WHERE id = $1""",
            self.run_id,
            error[:1000],
        )
