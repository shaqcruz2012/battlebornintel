import asyncio
import logging
import os
from abc import ABC, abstractmethod

import anthropic

from ..db import get_pool
from ._audit_mixin import AuditMixin
from .constants import DEFAULT_LLM_MODEL

_DEFAULT_MODEL = os.environ.get("CLAUDE_MODEL", DEFAULT_LLM_MODEL)
_RETRYABLE_STATUSES = {429, 500, 502, 503}
_MAX_RETRIES = 3
_BASE_BACKOFF = 1  # seconds

logger = logging.getLogger(__name__)


class BaseAgent(AuditMixin, ABC):
    """Base class for all BBI AI agents."""

    def __init__(self, agent_name: str, model: str | None = None):
        self.agent_name = agent_name
        self.model = model or _DEFAULT_MODEL
        self.client = anthropic.Anthropic()
        self.run_id = None

    def _model_label(self) -> str:
        return self.model

    async def execute(self, **kwargs):
        """Execute agent with audit trail."""
        pool = await get_pool()
        await self._start_run(pool, kwargs)
        try:
            result = await self.run(pool, **kwargs)
            await self._complete_run(pool, result)
            return result
        except Exception as e:
            await self._fail_run(pool, str(e))
            raise RuntimeError(f"Agent '{self.agent_name}' failed: {e}") from e

    @abstractmethod
    async def run(self, pool, **kwargs):
        """Implement agent logic. Return result dict."""
        ...

    async def call_claude(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        max_tokens: int = 4096,
    ) -> str:
        """Call Claude API with structured prompts and retry on transient errors."""
        effective_model = model or self.model
        last_exc: Exception | None = None
        for attempt in range(_MAX_RETRIES + 1):
            try:
                response = self.client.messages.create(
                    model=effective_model,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                if not response.content:
                    logger.warning("Claude API returned empty content for agent '%s'", self.agent_name)
                    return ""
                return response.content[0].text
            except anthropic.APIStatusError as e:
                last_exc = e
                if e.status_code in _RETRYABLE_STATUSES and attempt < _MAX_RETRIES:
                    delay = _BASE_BACKOFF * (2 ** attempt)
                    logger.warning(
                        "Claude API returned %d for agent '%s', retrying in %ds (attempt %d/%d)",
                        e.status_code, self.agent_name, delay, attempt + 1, _MAX_RETRIES,
                    )
                    await asyncio.sleep(delay)
                    continue
                logger.error("Claude API call failed for agent '%s': %s", self.agent_name, e)
                raise
            except anthropic.APIConnectionError as e:
                last_exc = e
                if attempt < _MAX_RETRIES:
                    delay = _BASE_BACKOFF * (2 ** attempt)
                    logger.warning(
                        "Claude API connection error for agent '%s', retrying in %ds (attempt %d/%d)",
                        self.agent_name, delay, attempt + 1, _MAX_RETRIES,
                    )
                    await asyncio.sleep(delay)
                    continue
                logger.error("Claude API call failed for agent '%s': %s", self.agent_name, e)
                raise
            except Exception as e:
                logger.error("Claude API call failed for agent '%s': %s", self.agent_name, e)
                raise
        raise last_exc  # type: ignore[misc]

