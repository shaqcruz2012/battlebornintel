import json
from abc import ABC, abstractmethod
from datetime import datetime, timezone

import anthropic

from ..db import get_pool


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
        response = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return response.content[0].text

    def call_claude_with_tools(
        self,
        system_prompt: str,
        user_prompt: str,
        tools: list[dict],
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4096,
    ) -> anthropic.types.Message:
        """Call Claude API with tool use for structured extraction."""
        return self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            tools=tools,
            messages=[{"role": "user", "content": user_prompt}],
        )

    # ── Search logging ─────────────────────────────────────────────────────

    async def log_search(
        self,
        pool,
        canonical_id: str,
        search_type: str,
        query_text: str | None = None,
        result_summary: str | None = None,
        sources_checked: list[str] | None = None,
        findings: dict | None = None,
        confidence_before: float | None = None,
        confidence_after: float | None = None,
    ):
        """Log a search/verification to agent_search_log and update rotation timestamp."""
        await pool.execute(
            """INSERT INTO agent_search_log
               (canonical_id, agent_name, search_type, query_text, result_summary,
                sources_checked, findings, confidence_before, confidence_after)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)""",
            canonical_id,
            self.agent_name,
            search_type,
            query_text,
            result_summary,
            sources_checked,
            json.dumps(findings) if findings else None,
            confidence_before,
            confidence_after,
        )
        # Update last_queried_at on entity_registry for rotation tracking
        await pool.execute(
            "UPDATE entity_registry SET last_queried_at = NOW() WHERE canonical_id = $1",
            canonical_id,
        )

    # ── Entity Registry helpers ──────────────────────────────────────────────

    async def resolve_entity(self, pool, canonical_id: str) -> dict | None:
        """Look up a node from the unified entity_registry."""
        row = await pool.fetchrow(
            """SELECT canonical_id, entity_type, label, source_table,
                      source_table_id, confidence, verified
               FROM entity_registry WHERE canonical_id = $1""",
            canonical_id,
        )
        return dict(row) if row else None

    async def search_entities(self, pool, query: str, entity_type: str | None = None, limit: int = 20):
        """Full-text search across all entities."""
        ts_query = " & ".join(query.strip().split())
        if entity_type:
            rows = await pool.fetch(
                """SELECT canonical_id, entity_type, label FROM entity_registry
                   WHERE search_vector @@ to_tsquery('english', $1)
                   AND entity_type = $2
                   ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC
                   LIMIT $3""",
                ts_query, entity_type, limit,
            )
        else:
            rows = await pool.fetch(
                """SELECT canonical_id, entity_type, label FROM entity_registry
                   WHERE search_vector @@ to_tsquery('english', $1)
                   ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC
                   LIMIT $2""",
                ts_query, limit,
            )
        return [dict(r) for r in rows]

    async def create_edge(
        self,
        pool,
        source_id: str,
        target_id: str,
        rel: str,
        *,
        note: str | None = None,
        event_year: int | None = None,
        event_date: str | None = None,
        confidence: float | None = None,
        source_name: str | None = None,
        data_quality: str = "medium",
        edge_category: str = "historical",
    ) -> int:
        """Insert a graph_edge with full provenance."""
        row = await pool.fetchrow(
            """INSERT INTO graph_edges
               (source_id, target_id, rel, note, event_year, event_date,
                confidence, verified, source_name, agent_id, data_quality,
                edge_category, valid_from)
               VALUES ($1, $2, $3, $4, $5, $6::date, $7, FALSE, $8, $9, $10, $11, NOW())
               RETURNING id""",
            source_id, target_id, rel, note, event_year, event_date,
            confidence, source_name, self.agent_name, data_quality, edge_category,
        )
        return row["id"]

    async def log_state_change(
        self,
        pool,
        canonical_id: str,
        change_type: str,
        property_name: str | None = None,
        old_value=None,
        new_value=None,
    ):
        """Record an entity state change for T-GNN temporal features."""
        await pool.execute(
            """INSERT INTO entity_state_history
               (canonical_id, change_type, property_name, old_value, new_value, agent_id)
               VALUES ($1, $2, $3, $4, $5, $6)""",
            canonical_id,
            change_type,
            property_name,
            json.dumps(old_value) if old_value is not None else None,
            json.dumps(new_value) if new_value is not None else None,
            self.agent_name,
        )

    async def queue_ingestion(
        self,
        pool,
        entity_type: str,
        entity_data: dict,
        source: str,
        source_url: str | None = None,
        confidence: float = 0.5,
    ):
        """Write to ingestion_queue for human review before approval."""
        await pool.execute(
            """INSERT INTO ingestion_queue
               (source, source_url, entity_type, entity_data, confidence)
               VALUES ($1, $2, $3, $4, $5)""",
            source, source_url, entity_type,
            json.dumps(entity_data), confidence,
        )

    # ── Existing methods ─────────────────────────────────────────────────────

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
