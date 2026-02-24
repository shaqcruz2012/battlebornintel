"""
Edge validation service for BBI data ingestion.

Validates proposed edges and nodes against the graph schema,
checks for duplicates, and provides fuzzy matching for company names.
"""
from __future__ import annotations

import logging
import re
import unicodedata
from typing import Any

from thefuzz import fuzz

from app.models import VALID_REL_TYPES, VALID_NODE_TYPES, VALID_EDGE_STATUSES
from app.db import fetch, fetchval, fetchrow

logger = logging.getLogger("bbi.validator")

# ═══════════════════════════════════════════════════════════════
# EDGE VALIDATION
# ═══════════════════════════════════════════════════════════════

YEAR_MIN = 2000
YEAR_MAX = 2027
CONFIDENCE_MIN = 0.0
CONFIDENCE_MAX = 1.0
FUZZY_MATCH_THRESHOLD = 70  # minimum score to include in results


async def validate_edge_proposal(proposal: dict) -> dict[str, Any]:
    """
    Validate a proposed edge against the BBI graph schema.

    Args:
        proposal: dict with keys: source_id, target_id, rel, year, confidence,
                  and optionally: note, evidence, source.

    Returns:
        dict with {valid: bool, errors: list[str], warnings: list[str]}
    """
    errors: list[str] = []
    warnings: list[str] = []

    source_id = proposal.get("source_id", "")
    target_id = proposal.get("target_id", "")
    rel = proposal.get("rel", "")
    year = proposal.get("year")
    confidence = proposal.get("confidence")

    # ── 1. Relationship type must be valid ──
    if not rel:
        errors.append("rel is required")
    elif rel not in VALID_REL_TYPES:
        errors.append(
            f"Invalid rel '{rel}'. Must be one of: {', '.join(sorted(VALID_REL_TYPES))}"
        )

    # ── 2. Source node must exist ──
    if not source_id:
        errors.append("source_id is required")
    else:
        source_exists = await fetchval(
            "SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)", source_id
        )
        if not source_exists:
            errors.append(f"source_id '{source_id}' does not exist in nodes table")

    # ── 3. Target node must exist ──
    if not target_id:
        errors.append("target_id is required")
    else:
        target_exists = await fetchval(
            "SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)", target_id
        )
        if not target_exists:
            errors.append(f"target_id '{target_id}' does not exist in nodes table")

    # ── 4. No duplicate edge (source + target + rel must be unique) ──
    if source_id and target_id and rel:
        dup_exists = await fetchval(
            "SELECT EXISTS(SELECT 1 FROM edges WHERE source_id = $1 AND target_id = $2 AND rel = $3)",
            source_id,
            target_id,
            rel,
        )
        if dup_exists:
            errors.append(
                f"Duplicate edge: {source_id} --[{rel}]--> {target_id} already exists"
            )

    # ── 5. Year must be in valid range ──
    if year is not None:
        if not isinstance(year, int):
            try:
                year = int(year)
            except (ValueError, TypeError):
                errors.append(f"year must be an integer, got '{year}'")
                year = None
        if year is not None and (year < YEAR_MIN or year > YEAR_MAX):
            errors.append(f"year {year} out of range [{YEAR_MIN}, {YEAR_MAX}]")
    else:
        warnings.append("year not provided, will default to 2023")

    # ── 6. Confidence must be in [0.0, 1.0] ──
    if confidence is not None:
        if not isinstance(confidence, (int, float)):
            try:
                confidence = float(confidence)
            except (ValueError, TypeError):
                errors.append(f"confidence must be a number, got '{confidence}'")
                confidence = None
        if confidence is not None and (
            confidence < CONFIDENCE_MIN or confidence > CONFIDENCE_MAX
        ):
            errors.append(
                f"confidence {confidence} out of range [{CONFIDENCE_MIN}, {CONFIDENCE_MAX}]"
            )
    else:
        warnings.append("confidence not provided, will default to 0.5")

    # ── Additional warnings ──
    if source_id and target_id and source_id == target_id:
        warnings.append("Self-referencing edge: source_id equals target_id")

    if year == 2023:
        warnings.append("year=2023 is the default; verify this is the actual year")

    valid = len(errors) == 0

    return {
        "valid": valid,
        "errors": errors,
        "warnings": warnings,
    }


# ═══════════════════════════════════════════════════════════════
# FUZZY MATCHING
# ═══════════════════════════════════════════════════════════════


async def fuzzy_match_company(name: str) -> list[tuple[str, int]]:
    """
    Fuzzy-match a company name against existing nodes.

    Uses thefuzz library to compare the input name against all node labels
    in the database. Returns matches sorted by score descending.

    Args:
        name: company name to match

    Returns:
        List of (node_id, score) tuples where score >= FUZZY_MATCH_THRESHOLD,
        sorted by score descending.
    """
    if not name or not name.strip():
        return []

    name_clean = name.strip().lower()
    rows = await fetch("SELECT id, label FROM nodes")

    matches: list[tuple[str, int]] = []
    for row in rows:
        label = row["label"]
        # Use token_set_ratio for best partial matching
        # (handles word reordering and extra words)
        score = fuzz.token_set_ratio(name_clean, label.lower())
        if score >= FUZZY_MATCH_THRESHOLD:
            matches.append((row["id"], score))

    # Sort by score descending
    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


# ═══════════════════════════════════════════════════════════════
# ID NORMALIZATION
# ═══════════════════════════════════════════════════════════════

# Prefix map for entity types
_TYPE_PREFIX: dict[str, str] = {
    "company": "c_",
    "fund": "f_",
    "accelerator": "a_",
    "ecosystem": "e_",
    "external": "x_",
    "person": "p_",
    "sector": "s_",
    "region": "r_",
    "exchange": "ex_",
}


def normalize_entity_id(name: str, entity_type: str) -> str:
    """
    Generate a valid BBI entity ID from a human-readable name.

    Applies the appropriate prefix for the entity type, lowercases,
    strips accents, and replaces non-alphanumeric characters with underscores.

    Examples:
        normalize_entity_id("Goldman Sachs", "external") -> "x_goldman_sachs"
        normalize_entity_id("StartUpNV", "accelerator") -> "a_startupnv"
        normalize_entity_id("U.S. DOE", "external")     -> "x_us_doe"

    Args:
        name: human-readable entity name
        entity_type: one of VALID_NODE_TYPES

    Returns:
        Normalized ID string with appropriate prefix.

    Raises:
        ValueError: if entity_type is not valid.
    """
    if entity_type not in VALID_NODE_TYPES:
        raise ValueError(
            f"Invalid entity_type '{entity_type}'. "
            f"Must be one of: {', '.join(sorted(VALID_NODE_TYPES))}"
        )

    prefix = _TYPE_PREFIX.get(entity_type, "x_")

    # Normalize unicode (strip accents)
    normalized = unicodedata.normalize("NFKD", name)
    normalized = "".join(
        c for c in normalized if not unicodedata.combining(c)
    )

    # Lowercase and replace non-alphanumeric with underscores
    normalized = normalized.lower().strip()
    normalized = re.sub(r"[^a-z0-9]+", "_", normalized)

    # Strip leading/trailing underscores
    normalized = normalized.strip("_")

    # Collapse multiple underscores
    normalized = re.sub(r"_+", "_", normalized)

    if not normalized:
        raise ValueError(f"Cannot generate ID from empty/invalid name: '{name}'")

    return f"{prefix}{normalized}"


# ═══════════════════════════════════════════════════════════════
# BATCH VALIDATION
# ═══════════════════════════════════════════════════════════════


async def validate_edge_batch(
    proposals: list[dict],
) -> list[dict[str, Any]]:
    """
    Validate a batch of edge proposals.

    Args:
        proposals: list of edge proposal dicts

    Returns:
        List of validation results in the same order as proposals.
    """
    results = []
    for proposal in proposals:
        result = await validate_edge_proposal(proposal)
        result["proposal"] = proposal
        results.append(result)
    return results


async def validate_node_proposal(proposal: dict) -> dict[str, Any]:
    """
    Validate a proposed node.

    Args:
        proposal: dict with keys: id, type, label, data, confidence

    Returns:
        dict with {valid: bool, errors: list[str], warnings: list[str]}
    """
    errors: list[str] = []
    warnings: list[str] = []

    node_id = proposal.get("id", "")
    node_type = proposal.get("type", "")
    label = proposal.get("label", "")
    confidence = proposal.get("confidence")

    if not node_id:
        errors.append("id is required")
    else:
        # Check if node already exists
        existing = await fetchval(
            "SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)", node_id
        )
        if existing:
            warnings.append(f"Node '{node_id}' already exists; proposal will be skipped")

    if not node_type:
        errors.append("type is required")
    elif node_type not in VALID_NODE_TYPES:
        errors.append(
            f"Invalid type '{node_type}'. "
            f"Must be one of: {', '.join(sorted(VALID_NODE_TYPES))}"
        )

    if not label or not label.strip():
        errors.append("label is required and must not be blank")

    if confidence is not None:
        if not isinstance(confidence, (int, float)):
            try:
                confidence = float(confidence)
            except (ValueError, TypeError):
                errors.append(f"confidence must be a number, got '{confidence}'")
                confidence = None
        if confidence is not None and (
            confidence < CONFIDENCE_MIN or confidence > CONFIDENCE_MAX
        ):
            errors.append(
                f"confidence {confidence} out of range [{CONFIDENCE_MIN}, {CONFIDENCE_MAX}]"
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }
