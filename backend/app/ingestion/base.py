"""
Base ingestion class for BBI data pipelines.

All ingestion sources (EDGAR, SBIR, News, Agent) inherit from this class.
Provides standardized edge/node proposal submission with confidence-based
auto-approval and consistent stats tracking.
"""
from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.db import execute, fetch, fetchval
from app.services.validator import (
    validate_edge_proposal,
    validate_node_proposal,
    fuzzy_match_company,
    normalize_entity_id,
)

logger = logging.getLogger("bbi.ingestion")


class BaseIngestion(ABC):
    """
    Abstract base class for all BBI ingestion pipelines.

    Subclasses must implement:
        - source_name: str identifying the pipeline (e.g. "edgar", "sbir", "news")
        - run(): the main pipeline execution method

    Provides shared methods for proposing edges and nodes into the graph
    with automatic validation, confidence-based status assignment, and
    stats tracking.
    """

    source_name: str = "unknown"

    def __init__(self):
        self._stats: dict[str, int] = {
            "edges_proposed": 0,
            "edges_approved": 0,
            "edges_pending": 0,
            "edges_rejected": 0,
            "edges_invalid": 0,
            "nodes_proposed": 0,
            "nodes_skipped": 0,
            "errors": 0,
        }
        self._started_at: datetime | None = None
        self._completed_at: datetime | None = None

    @abstractmethod
    async def run(self) -> dict[str, Any]:
        """
        Run the ingestion pipeline.

        Returns:
            Stats dict with pipeline-specific metrics plus the base
            edge/node proposal counters.
        """
        ...

    async def _execute_run(self) -> dict[str, Any]:
        """
        Wrapper that tracks timing and creates an agent_runs record.
        Subclasses call this from their run() implementation.
        """
        self._started_at = datetime.now(timezone.utc)
        run_id = None

        try:
            # Create a run record in agent_runs table
            run_id = await fetchval(
                """INSERT INTO agent_runs (run_type, status, started_at)
                   VALUES ($1, 'running', $2)
                   RETURNING id""",
                f"ingest_{self.source_name}",
                self._started_at,
            )

            # Execute the pipeline
            pipeline_stats = await self.run()

            # Merge pipeline-specific stats with base stats
            merged_stats = {**self._stats, **pipeline_stats}

            self._completed_at = datetime.now(timezone.utc)

            # Update the run record
            if run_id:
                await execute(
                    """UPDATE agent_runs
                       SET status = 'completed',
                           completed_at = $1,
                           stats = $2
                       WHERE id = $3""",
                    self._completed_at,
                    json.dumps(merged_stats),
                    run_id,
                )

            logger.info(
                f"[{self.source_name}] Pipeline completed: {merged_stats}"
            )
            return merged_stats

        except Exception as e:
            self._completed_at = datetime.now(timezone.utc)
            logger.error(f"[{self.source_name}] Pipeline failed: {e}", exc_info=True)

            if run_id:
                await execute(
                    """UPDATE agent_runs
                       SET status = 'failed',
                           completed_at = $1,
                           stats = $2,
                           error = $3
                       WHERE id = $4""",
                    self._completed_at,
                    json.dumps(self._stats),
                    str(e),
                    run_id,
                )

            self._stats["errors"] += 1
            raise

    # ═══════════════════════════════════════════════════════════════
    # EDGE PROPOSALS
    # ═══════════════════════════════════════════════════════════════

    async def propose_edge(
        self,
        source_id: str,
        target_id: str,
        rel: str,
        note: str | None = None,
        year: int = 2023,
        confidence: float = 0.5,
        evidence: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Submit an edge proposal through the standard validation pipeline.

        Confidence determines automatic status assignment:
            - > 0.85 (settings.confidence_auto_approve): status = 'approved'
            - 0.60-0.85 (settings.confidence_review_threshold): status = 'pending'
            - < 0.60: status = 'rejected'

        Args:
            source_id: ID of the source node (must exist in nodes table)
            target_id: ID of the target node (must exist in nodes table)
            rel: relationship type (must be in VALID_REL_TYPES)
            note: optional human-readable note about the edge
            year: year the relationship was established
            confidence: confidence score 0.0-1.0
            evidence: list of evidence dicts (url, title, snippet)

        Returns:
            Dict with {status, edge_id, validation} on success, or
            {status: 'invalid', validation} on validation failure.
        """
        if evidence is None:
            evidence = []

        proposal = {
            "source_id": source_id,
            "target_id": target_id,
            "rel": rel,
            "note": note,
            "year": year,
            "confidence": confidence,
        }

        # Validate first
        validation = await validate_edge_proposal(proposal)
        if not validation["valid"]:
            self._stats["edges_invalid"] += 1
            logger.warning(
                f"[{self.source_name}] Invalid edge proposal "
                f"{source_id} --[{rel}]--> {target_id}: {validation['errors']}"
            )
            return {"status": "invalid", "validation": validation}

        # Determine status based on confidence thresholds
        if confidence >= settings.confidence_auto_approve:
            status = "approved"
            self._stats["edges_approved"] += 1
        elif confidence >= settings.confidence_review_threshold:
            status = "pending"
            self._stats["edges_pending"] += 1
        else:
            status = "rejected"
            self._stats["edges_rejected"] += 1

        # Insert the edge
        edge_id = await fetchval(
            """INSERT INTO edges
               (source_id, target_id, rel, note, year, confidence, source, evidence, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING id""",
            source_id,
            target_id,
            rel,
            note,
            year,
            confidence,
            self.source_name,
            json.dumps(evidence),
            status,
        )

        self._stats["edges_proposed"] += 1
        logger.info(
            f"[{self.source_name}] Edge proposed: "
            f"{source_id} --[{rel}]--> {target_id} "
            f"(confidence={confidence:.2f}, status={status}, id={edge_id})"
        )

        return {
            "status": status,
            "edge_id": edge_id,
            "validation": validation,
        }

    # ═══════════════════════════════════════════════════════════════
    # NODE PROPOSALS
    # ═══════════════════════════════════════════════════════════════

    async def propose_node(
        self,
        id: str,
        type: str,
        label: str,
        data: dict[str, Any] | None = None,
        confidence: float = 0.5,
    ) -> dict[str, Any]:
        """
        Submit a new node proposal.

        If a node with the same ID already exists, the proposal is skipped
        (no upsert). Returns the existing node info in that case.

        Args:
            id: unique node ID with appropriate prefix (c_, f_, x_, etc.)
            type: node type (company, fund, external, etc.)
            label: human-readable label
            data: arbitrary metadata dict
            confidence: confidence score 0.0-1.0

        Returns:
            Dict with {status: 'created'|'exists', node_id, validation}.
        """
        if data is None:
            data = {}

        proposal = {
            "id": id,
            "type": type,
            "label": label,
            "data": data,
            "confidence": confidence,
        }

        validation = await validate_node_proposal(proposal)
        if not validation["valid"]:
            logger.warning(
                f"[{self.source_name}] Invalid node proposal '{id}': {validation['errors']}"
            )
            return {"status": "invalid", "validation": validation}

        # Check if node already exists
        existing = await fetchval(
            "SELECT id FROM nodes WHERE id = $1", id
        )
        if existing:
            self._stats["nodes_skipped"] += 1
            logger.debug(f"[{self.source_name}] Node '{id}' already exists, skipping")
            return {"status": "exists", "node_id": id, "validation": validation}

        # Insert the new node
        await execute(
            """INSERT INTO nodes (id, type, label, data, confidence, source)
               VALUES ($1, $2, $3, $4, $5, $6)""",
            id,
            type,
            label,
            json.dumps(data),
            confidence,
            self.source_name,
        )

        self._stats["nodes_proposed"] += 1
        logger.info(
            f"[{self.source_name}] Node proposed: '{label}' ({type}, id={id})"
        )

        return {"status": "created", "node_id": id, "validation": validation}

    # ═══════════════════════════════════════════════════════════════
    # HELPERS
    # ═══════════════════════════════════════════════════════════════

    async def find_or_create_external(
        self,
        name: str,
        entity_type: str = "external",
        data: dict[str, Any] | None = None,
        confidence: float = 0.7,
    ) -> str | None:
        """
        Find an existing node by fuzzy matching, or create a new external node.

        Args:
            name: entity name to search for
            entity_type: type for new node if created (default: "external")
            data: metadata for new node
            confidence: confidence for the new node

        Returns:
            Node ID of matched or created node, or None if creation failed.
        """
        # Try fuzzy matching first
        matches = await fuzzy_match_company(name)
        if matches and matches[0][1] >= 90:
            # High-confidence match
            node_id, score = matches[0]
            logger.debug(
                f"[{self.source_name}] Fuzzy matched '{name}' -> '{node_id}' (score={score})"
            )
            return node_id

        # No good match — create a new node
        node_id = normalize_entity_id(name, entity_type)

        result = await self.propose_node(
            id=node_id,
            type=entity_type,
            label=name,
            data=data or {},
            confidence=confidence,
        )

        if result["status"] in ("created", "exists"):
            return node_id

        logger.warning(f"[{self.source_name}] Failed to create node for '{name}'")
        return None

    def get_stats(self) -> dict[str, Any]:
        """Return current pipeline stats."""
        return {
            **self._stats,
            "source": self.source_name,
            "started_at": self._started_at.isoformat() if self._started_at else None,
            "completed_at": self._completed_at.isoformat() if self._completed_at else None,
        }
