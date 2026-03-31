"""Shared utilities for BBI agents.

Provides common helpers used across both LLM-powered (BaseAgent) and
statistical (BaseModelAgent) agents, reducing code duplication and
ensuring consistent behavior for value sanitization, JSON extraction,
prompt loading, and bounded async execution.
"""

import asyncio
import json
import logging
import math
import os
import re
from typing import Any

logger = logging.getLogger(__name__)

# Module-level cache for loaded prompt files.
_prompt_cache: dict[str, str] = {}

# Resolve the prompts directory relative to this file:
# agents/src/agents/utils.py -> agents/prompts/
_PROMPTS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "prompts")
)


# ---------------------------------------------------------------------------
# 1. sanitize_value
# ---------------------------------------------------------------------------

def sanitize_value(v: Any) -> Any:
    """Replace None, NaN, and Inf with None for safe DB insertion.

    Numeric values that are finite are returned as floats. Non-numeric
    values (strings, dates, etc.) pass through unchanged.

    Examples::

        >>> sanitize_value(float("nan"))
        None
        >>> sanitize_value(float("inf"))
        None
        >>> sanitize_value(3.14)
        3.14
        >>> sanitize_value("hello")
        'hello'
    """
    if v is None:
        return None
    try:
        fv = float(v)
        if math.isnan(fv) or math.isinf(fv):
            return None
        return fv
    except (TypeError, ValueError):
        return v


# ---------------------------------------------------------------------------
# 2. sanitize_row
# ---------------------------------------------------------------------------

def sanitize_row(row: dict, numeric_keys: list[str]) -> dict:
    """Apply :func:`sanitize_value` to specified numeric keys in a row dict.

    Returns a **new** dict with the same keys. Only the keys listed in
    *numeric_keys* are sanitized; all other values are copied as-is.

    Args:
        row: Source dictionary (not mutated).
        numeric_keys: Keys whose values should be passed through
            :func:`sanitize_value`.

    Returns:
        A new dict with sanitized numeric values.

    Example::

        >>> sanitize_row({"name": "Acme", "funding": float("inf")}, ["funding"])
        {'name': 'Acme', 'funding': None}
    """
    result = dict(row)
    for key in numeric_keys:
        if key in result:
            result[key] = sanitize_value(result[key])
    return result


# ---------------------------------------------------------------------------
# 3. extract_json
# ---------------------------------------------------------------------------

def extract_json(text: str) -> dict | list | None:
    """Robustly extract JSON from LLM output text.

    Tries multiple strategies in order:

    1. Parse the full string as JSON (it may already be valid).
    2. Look for a JSON block inside markdown fences (``\\`\\`\\`json ... \\`\\`\\``).
    3. Find the outermost ``{...}`` or ``[...]`` block and parse it.
    4. Return ``None`` if all strategies fail.

    Unlike the per-agent ``find("{")`` / ``rfind("}")`` pattern this
    replaces, this function:

    - Handles both object and array JSON.
    - Tries markdown fenced blocks first (common in Claude output).
    - Never silently wraps failures in ``{"raw_analysis": text}``; the
      caller decides how to handle ``None``.

    Args:
        text: Raw string output from an LLM call.

    Returns:
        Parsed JSON as a ``dict`` or ``list``, or ``None`` if extraction
        fails.
    """
    if not text or not text.strip():
        return None

    text = text.strip()

    # Strategy 1: full string is valid JSON.
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        pass

    # Strategy 2: markdown fenced code block (```json ... ``` or ``` ... ```).
    fence_pattern = re.compile(r"```(?:json)?\s*\n?(.*?)\n?\s*```", re.DOTALL)
    for match in fence_pattern.finditer(text):
        try:
            return json.loads(match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            continue

    # Strategy 3: outermost { ... } or [ ... ] block.
    for open_ch, close_ch in [("{", "}"), ("[", "]")]:
        start = text.find(open_ch)
        end = text.rfind(close_ch)
        if start != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except (json.JSONDecodeError, ValueError):
                continue

    # All strategies exhausted.
    logger.warning("extract_json: unable to extract JSON from text (len=%d)", len(text))
    return None


# ---------------------------------------------------------------------------
# 4. validate_json_schema
# ---------------------------------------------------------------------------

def validate_json_schema(data: dict, schema_class: Any = None) -> dict:
    """Optionally validate a dict against a Pydantic BaseModel schema.

    If *schema_class* is ``None`` the data is returned unchanged.

    If validation succeeds the validated (and possibly coerced) dict is
    returned.  If validation fails a warning is logged, and the original
    *data* dict is returned with an extra ``_validation_errors`` key
    containing the error details so callers can detect partial validity.

    Args:
        data: The dictionary to validate.
        schema_class: A Pydantic ``BaseModel`` subclass, or ``None`` to
            skip validation.

    Returns:
        Validated dict on success, or original dict with
        ``_validation_errors`` on failure.
    """
    if schema_class is None:
        return data

    try:
        validated = schema_class.model_validate(data)
        return validated.model_dump()
    except Exception as exc:
        logger.warning(
            "validate_json_schema: validation failed for %s: %s",
            schema_class.__name__,
            exc,
        )
        result = dict(data)
        result["_validation_errors"] = str(exc)
        return result


# ---------------------------------------------------------------------------
# 5. load_prompt
# ---------------------------------------------------------------------------

def load_prompt(name: str) -> str:
    """Load a system prompt from the ``agents/prompts/`` directory.

    Looks for ``{name}.txt`` first, then ``{name}.md``.  Results are
    cached in a module-level dict so repeated calls for the same prompt
    are free.

    Args:
        name: Base name of the prompt file (without extension).

    Returns:
        The file contents as a string, or an empty string if the file
        is not found (a warning is logged in that case).
    """
    if name in _prompt_cache:
        return _prompt_cache[name]

    for ext in (".txt", ".md"):
        path = os.path.join(_PROMPTS_DIR, f"{name}{ext}")
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                _prompt_cache[name] = content
                return content
            except OSError as exc:
                logger.warning("load_prompt: failed to read '%s': %s", path, exc)
                break

    logger.warning(
        "load_prompt: prompt '%s' not found in %s (tried .txt and .md)",
        name,
        _PROMPTS_DIR,
    )
    _prompt_cache[name] = ""
    return ""


# ---------------------------------------------------------------------------
# 6. batch_async
# ---------------------------------------------------------------------------

async def batch_async(
    coro_fn,
    items,
    max_concurrency: int = 5,
) -> list:
    """Execute an async callable over items with bounded concurrency.

    Runs ``coro_fn(item)`` for every element in *items* concurrently,
    but limits the number of simultaneous executions to *max_concurrency*
    using an :class:`asyncio.Semaphore`.

    Results are returned in the **same order** as *items*.

    Args:
        coro_fn: An async callable that takes a single item and returns
            a result.
        items: Iterable of items to process.
        max_concurrency: Maximum number of concurrent invocations
            (default ``5``).

    Returns:
        A list of results corresponding positionally to *items*.

    Example::

        results = await batch_async(fetch_company, company_ids, max_concurrency=10)
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def bounded(item):
        async with semaphore:
            return await coro_fn(item)

    return await asyncio.gather(*[bounded(item) for item in items])
