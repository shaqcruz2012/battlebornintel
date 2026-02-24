"""
BBI Agentic Researcher — autonomous graph intelligence agent.

Uses Claude 3.5 Sonnet with tool-use to discover, verify, and enrich
the Nevada startup ecosystem graph. Three operational modes:

  - discovery: Search the web for new Nevada startups and relationships
  - verification: Research real dates for edges with default timestamps
  - enrichment: Find more connections for under-connected companies

The agent runs in a tool-use loop: send message -> get tool calls ->
execute tools -> send results -> repeat until Claude signals completion.

Cost and rate limiting prevent runaway spending.
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone
from typing import Any

from anthropic import Anthropic

from app.config import settings
from app.agents.tools import TOOLS, execute_tool
from app.agents.prompts import (
    DISCOVERY_PROMPT,
    VERIFICATION_PROMPT,
    ENRICHMENT_PROMPT,
)
from app.db import execute, fetch, fetchval

logger = logging.getLogger("bbi.agents.researcher")

# Model configuration
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096

# Cost tracking (approximate, based on Claude 3.5 Sonnet pricing)
# These are rough estimates and should be updated when pricing changes
COST_PER_INPUT_TOKEN = 3.0 / 1_000_000   # $3 per 1M input tokens
COST_PER_OUTPUT_TOKEN = 15.0 / 1_000_000  # $15 per 1M output tokens

# Mode -> prompt mapping
MODE_PROMPTS = {
    "discovery": DISCOVERY_PROMPT,
    "verification": VERIFICATION_PROMPT,
    "enrichment": ENRICHMENT_PROMPT,
}

# Maximum tool-use loop iterations to prevent infinite loops
MAX_ITERATIONS = 30


class AgentResearcher:
    """
    Autonomous research agent that uses Claude with tool-use to explore
    and expand the BBI graph.
    """

    def __init__(self, mode: str):
        """
        Initialize the researcher.

        Args:
            mode: One of "discovery", "verification", "enrichment".

        Raises:
            ValueError: If mode is invalid.
            RuntimeError: If ANTHROPIC_API_KEY is not set.
        """
        if mode not in MODE_PROMPTS:
            raise ValueError(
                f"Invalid mode '{mode}'. Must be one of: {', '.join(MODE_PROMPTS)}"
            )

        if not settings.anthropic_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY not configured. Set it in .env or environment."
            )

        self.mode = mode
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.system_prompt = MODE_PROMPTS[mode]

        # Cost tracking
        self._input_tokens = 0
        self._output_tokens = 0
        self._estimated_cost = 0.0
        self._max_cost = settings.agent_max_cost_per_run
        self._max_searches = settings.agent_max_searches_per_run
        self._searches_used = 0

        # Stats
        self._tool_calls: list[dict[str, Any]] = []
        self._iterations = 0
        self._started_at: datetime | None = None
        self._completed_at: datetime | None = None
        self._run_id: int | None = None

    async def run(self) -> dict[str, Any]:
        """
        Execute the research agent.

        Creates an agent_runs record, builds the initial prompt,
        then enters the tool-use loop until Claude is done or
        limits are reached.

        Returns:
            Stats dict with tokens used, cost, tool calls, and outcomes.
        """
        self._started_at = datetime.now(timezone.utc)

        # Create run record
        self._run_id = await fetchval(
            """INSERT INTO agent_runs (run_type, status, started_at, stats)
               VALUES ($1, 'running', $2, '{}')
               RETURNING id""",
            self.mode,
            self._started_at,
        )

        try:
            # Build the initial user message based on mode
            initial_message = await self._build_initial_message()

            # Run the tool-use loop
            result = await self._tool_loop(initial_message)

            # Finalize
            self._completed_at = datetime.now(timezone.utc)
            stats = self._build_stats(result)

            await execute(
                """UPDATE agent_runs
                   SET status = 'completed', completed_at = $1, stats = $2
                   WHERE id = $3""",
                self._completed_at,
                json.dumps(stats),
                self._run_id,
            )

            logger.info(
                f"[researcher:{self.mode}] Run completed. "
                f"Iterations: {self._iterations}, "
                f"Tool calls: {len(self._tool_calls)}, "
                f"Cost: ${self._estimated_cost:.4f}"
            )
            return stats

        except Exception as e:
            self._completed_at = datetime.now(timezone.utc)
            error_stats = self._build_stats(str(e))

            await execute(
                """UPDATE agent_runs
                   SET status = 'failed', completed_at = $1, stats = $2, error = $3
                   WHERE id = $4""",
                self._completed_at,
                json.dumps(error_stats),
                str(e),
                self._run_id,
            )

            logger.error(
                f"[researcher:{self.mode}] Run failed: {e}", exc_info=True
            )
            raise

    async def _build_initial_message(self) -> str:
        """
        Build the initial user message for the agent based on mode.

        - discovery: Ask to search for new Nevada startups
        - verification: Provide a batch of edges needing date verification
        - enrichment: Provide a list of under-connected companies
        """
        if self.mode == "discovery":
            return (
                "Begin your research. Search for new Nevada-based startups, "
                "venture funds, and business relationships that should be added "
                "to the BBI graph. Focus on recent activity (2023-2026). "
                "Start with broad searches and drill down into specific companies "
                "and deals you find."
            )

        elif self.mode == "verification":
            batch_size = settings.agent_verify_batch_size
            # Get edges needing verification
            edges = await fetch(
                """SELECT e.id, e.source_id, e.target_id, e.rel, e.year, e.note,
                          s.label as source_label, t.label as target_label
                   FROM edges e
                   JOIN nodes s ON s.id = e.source_id
                   JOIN nodes t ON t.id = e.target_id
                   WHERE e.year = 2023
                     AND e.status = 'approved'
                   ORDER BY random()
                   LIMIT $1""",
                batch_size,
            )

            if not edges:
                return (
                    "No edges with default timestamps found. "
                    "All edges appear to have verified dates."
                )

            edge_list = "\n".join(
                f"- Edge #{e['id']}: {e['source_label']} --[{e['rel']}]--> "
                f"{e['target_label']} (year: {e['year']}, note: {e.get('note', 'none')})"
                for e in edges
            )

            return (
                f"Here are {len(edges)} edges that have the default year=2023 "
                f"and need their real dates verified:\n\n{edge_list}\n\n"
                "For each edge, research the actual date of the relationship. "
                "Use search_web to find supporting evidence, then use propose_edge "
                "to submit the corrected date."
            )

        elif self.mode == "enrichment":
            batch_size = settings.agent_enrich_batch_size
            # Get under-connected companies
            companies = await fetch(
                """SELECT n.id, n.label, n.data,
                          COUNT(DISTINCT e.id) as edge_count
                   FROM nodes n
                   LEFT JOIN edges e
                     ON (e.source_id = n.id OR e.target_id = n.id)
                     AND e.status = 'approved'
                   WHERE n.type = 'company'
                   GROUP BY n.id, n.label, n.data
                   HAVING COUNT(DISTINCT e.id) <= 2
                   ORDER BY random()
                   LIMIT $1""",
                batch_size,
            )

            if not companies:
                return (
                    "No under-connected companies found. "
                    "All companies have adequate connections."
                )

            company_list = "\n".join(
                f"- {c['label']} ({c['id']}): {c['edge_count']} connections"
                for c in companies
            )

            return (
                f"Here are {len(companies)} under-connected companies that need "
                f"more relationships discovered:\n\n{company_list}\n\n"
                "For each company, use query_graph to see existing connections, "
                "then search_web to find additional relationships. "
                "Propose new edges with evidence for each discovery."
            )

        return "Begin your research."

    async def _tool_loop(self, initial_message: str) -> str:
        """
        Execute the Claude tool-use loop.

        Sends messages to Claude, executes tool calls, and repeats
        until Claude responds with text only (no tool calls) or
        limits are reached.

        Args:
            initial_message: The first user message to send.

        Returns:
            The final text response from Claude.
        """
        messages: list[dict[str, Any]] = [
            {"role": "user", "content": initial_message}
        ]

        for iteration in range(MAX_ITERATIONS):
            self._iterations = iteration + 1

            # Check cost limits
            if self._estimated_cost >= self._max_cost:
                logger.warning(
                    f"[researcher:{self.mode}] Cost limit reached: "
                    f"${self._estimated_cost:.4f} >= ${self._max_cost:.2f}"
                )
                return f"Cost limit reached (${self._estimated_cost:.4f}). Stopping."

            # Check search limits
            if self._searches_used >= self._max_searches:
                logger.warning(
                    f"[researcher:{self.mode}] Search limit reached: "
                    f"{self._searches_used} >= {self._max_searches}"
                )
                return f"Search limit reached ({self._searches_used}). Stopping."

            # Call Claude
            try:
                response = self.client.messages.create(
                    model=MODEL,
                    max_tokens=MAX_TOKENS,
                    system=self.system_prompt,
                    tools=TOOLS,
                    messages=messages,
                )
            except Exception as e:
                logger.error(f"[researcher:{self.mode}] Claude API error: {e}")
                return f"Claude API error: {e}"

            # Track token usage
            self._input_tokens += response.usage.input_tokens
            self._output_tokens += response.usage.output_tokens
            self._estimated_cost = (
                self._input_tokens * COST_PER_INPUT_TOKEN
                + self._output_tokens * COST_PER_OUTPUT_TOKEN
            )

            # Update run stats periodically
            if iteration % 5 == 0 and self._run_id:
                await execute(
                    """UPDATE agent_runs SET stats = $1 WHERE id = $2""",
                    json.dumps(self._build_stats("running")),
                    self._run_id,
                )

            # Check stop reason
            if response.stop_reason == "end_turn":
                # Claude is done — extract final text
                final_text = ""
                for block in response.content:
                    if block.type == "text":
                        final_text += block.text
                return final_text

            # Process tool calls
            if response.stop_reason == "tool_use":
                # Add assistant message with all content blocks
                messages.append({
                    "role": "assistant",
                    "content": [self._serialize_block(b) for b in response.content],
                })

                # Execute each tool call and collect results
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        tool_name = block.name
                        tool_input = block.input
                        tool_id = block.id

                        logger.debug(
                            f"[researcher:{self.mode}] Tool call: {tool_name}({json.dumps(tool_input)[:200]})"
                        )

                        # Track search usage
                        if tool_name == "search_web":
                            self._searches_used += 1

                        # Execute the tool
                        start_time = time.monotonic()
                        result_str = await execute_tool(tool_name, tool_input)
                        elapsed = time.monotonic() - start_time

                        # Record the tool call
                        self._tool_calls.append({
                            "tool": tool_name,
                            "input": tool_input,
                            "result_length": len(result_str),
                            "elapsed_seconds": round(elapsed, 2),
                        })

                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": tool_id,
                            "content": result_str,
                        })

                # Add all tool results as a single user message
                messages.append({
                    "role": "user",
                    "content": tool_results,
                })

            else:
                # Unexpected stop reason
                logger.warning(
                    f"[researcher:{self.mode}] Unexpected stop_reason: {response.stop_reason}"
                )
                final_text = ""
                for block in response.content:
                    if block.type == "text":
                        final_text += block.text
                return final_text or f"Stopped: {response.stop_reason}"

        return f"Max iterations ({MAX_ITERATIONS}) reached."

    @staticmethod
    def _serialize_block(block: Any) -> dict[str, Any]:
        """
        Serialize an Anthropic content block to a dict for message history.
        """
        if block.type == "text":
            return {"type": "text", "text": block.text}
        elif block.type == "tool_use":
            return {
                "type": "tool_use",
                "id": block.id,
                "name": block.name,
                "input": block.input,
            }
        else:
            return {"type": block.type}

    def _build_stats(self, result: Any = None) -> dict[str, Any]:
        """Build the stats dict for the run record."""
        duration = None
        if self._started_at:
            end = self._completed_at or datetime.now(timezone.utc)
            duration = (end - self._started_at).total_seconds()

        return {
            "mode": self.mode,
            "iterations": self._iterations,
            "tool_calls_count": len(self._tool_calls),
            "tool_calls": self._tool_calls[-20:],  # Keep last 20 for brevity
            "input_tokens": self._input_tokens,
            "output_tokens": self._output_tokens,
            "estimated_cost_usd": round(self._estimated_cost, 4),
            "searches_used": self._searches_used,
            "max_searches": self._max_searches,
            "max_cost_usd": self._max_cost,
            "duration_seconds": round(duration, 1) if duration else None,
            "result_summary": str(result)[:500] if result else None,
        }


# ═══════════════════════════════════════════════════════════════
# PUBLIC API
# ═══════════════════════════════════════════════════════════════


async def run_agent(mode: str) -> dict[str, Any]:
    """
    Run the BBI research agent in the specified mode.

    This is the main entry point called by API routes.

    Args:
        mode: One of "discovery", "verification", "enrichment".

    Returns:
        Stats dict from the completed run.

    Raises:
        ValueError: If mode is invalid.
        RuntimeError: If API key is not configured.
    """
    agent = AgentResearcher(mode=mode)
    return await agent.run()


async def get_agent_run(run_id: int) -> dict[str, Any] | None:
    """
    Get the status and stats of an agent run.

    Args:
        run_id: The agent_runs table ID.

    Returns:
        Run record dict, or None if not found.
    """
    row = await fetch(
        """SELECT id, run_type, status, started_at, completed_at, stats, error
           FROM agent_runs WHERE id = $1""",
        run_id,
    )
    if not row:
        return None

    run = row[0]
    stats = run.get("stats", "{}")
    if isinstance(stats, str):
        stats = json.loads(stats)

    return {
        "id": run["id"],
        "run_type": run["run_type"],
        "status": run["status"],
        "started_at": run["started_at"],
        "completed_at": run.get("completed_at"),
        "stats": stats,
        "error": run.get("error"),
    }


async def list_agent_runs(limit: int = 20) -> list[dict[str, Any]]:
    """
    List recent agent runs.

    Args:
        limit: Max number of runs to return.

    Returns:
        List of run summary dicts.
    """
    rows = await fetch(
        """SELECT id, run_type, status, started_at, completed_at, stats, error
           FROM agent_runs
           ORDER BY started_at DESC
           LIMIT $1""",
        limit,
    )

    runs = []
    for row in rows:
        stats = row.get("stats", "{}")
        if isinstance(stats, str):
            stats = json.loads(stats)

        runs.append({
            "id": row["id"],
            "run_type": row["run_type"],
            "status": row["status"],
            "started_at": row["started_at"],
            "completed_at": row.get("completed_at"),
            "estimated_cost_usd": stats.get("estimated_cost_usd"),
            "tool_calls_count": stats.get("tool_calls_count"),
            "error": row.get("error"),
        })

    return runs
