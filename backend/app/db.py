"""
Database connection pool + LISTEN/NOTIFY helpers.
Uses asyncpg for async PostgreSQL access.
"""
import asyncio
import json
import logging
from typing import Optional, Callable, Any

import asyncpg

from .config import settings

logger = logging.getLogger("bbi.db")

pool: Optional[asyncpg.Pool] = None


async def init_pool():
    """Create the asyncpg connection pool on app startup."""
    global pool
    pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=2,
        max_size=10,
        command_timeout=30,
    )
    logger.info("Database pool initialized")


async def close_pool():
    """Close the pool on app shutdown."""
    global pool
    if pool:
        await pool.close()
        pool = None
        logger.info("Database pool closed")


def get_pool() -> asyncpg.Pool:
    """Get the active connection pool."""
    if not pool:
        raise RuntimeError("Database pool not initialized. Call init_pool() first.")
    return pool


async def fetch(query: str, *args) -> list[dict]:
    """Execute a SELECT and return rows as dicts."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(query, *args)
        return [dict(r) for r in rows]


async def fetchrow(query: str, *args) -> Optional[dict]:
    """Execute a SELECT and return a single row as dict."""
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None


async def fetchval(query: str, *args) -> Any:
    """Execute a SELECT and return a single value."""
    async with get_pool().acquire() as conn:
        return await conn.fetchval(query, *args)


async def execute(query: str, *args) -> str:
    """Execute an INSERT/UPDATE/DELETE."""
    async with get_pool().acquire() as conn:
        return await conn.execute(query, *args)


async def executemany(query: str, args: list) -> None:
    """Execute a batch INSERT/UPDATE/DELETE."""
    async with get_pool().acquire() as conn:
        await conn.executemany(query, args)


# ── LISTEN/NOTIFY ──

_listeners: list[Callable] = []


def add_graph_listener(callback: Callable):
    """Register a callback for graph change notifications."""
    _listeners.append(callback)


def remove_graph_listener(callback: Callable):
    """Unregister a graph change callback."""
    _listeners.remove(callback)


async def start_listener():
    """Background task that listens for PostgreSQL NOTIFY events."""
    conn = await asyncpg.connect(settings.database_url)

    def _on_notify(conn, pid, channel, payload):
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            data = {"raw": payload}
        for cb in _listeners:
            asyncio.create_task(_safe_call(cb, data))

    await conn.add_listener("graph_changed", _on_notify)
    logger.info("LISTEN graph_changed — active")

    # Keep connection alive
    try:
        while True:
            await asyncio.sleep(60)
    finally:
        await conn.remove_listener("graph_changed", _on_notify)
        await conn.close()


async def _safe_call(cb: Callable, data: dict):
    """Call a listener callback safely, catching exceptions."""
    try:
        result = cb(data)
        if asyncio.iscoroutine(result):
            await result
    except Exception as e:
        logger.error(f"Listener callback error: {e}")
