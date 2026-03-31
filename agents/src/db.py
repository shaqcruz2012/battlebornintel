import asyncio

import asyncpg
from .config import DATABASE_URL

_pool = None
_pool_lock = asyncio.Lock()


async def get_pool():
    global _pool
    async with _pool_lock:
        if _pool is None:
            _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        return _pool


async def close_pool():
    global _pool
    async with _pool_lock:
        if _pool:
            await _pool.close()
            _pool = None
