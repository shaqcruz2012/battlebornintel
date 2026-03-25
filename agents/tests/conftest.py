import asyncio
import pytest
import asyncpg

DB_URL = "postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel"


@pytest.fixture(scope="session")
def event_loop():
    """Use a single event loop for all tests to avoid pool/loop mismatch on Windows."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def pool():
    p = await asyncpg.create_pool(DB_URL, min_size=1, max_size=3)
    yield p
    await p.close()


@pytest.fixture(autouse=True)
async def reset_global_pool():
    """Reset the cached global pool between tests so it re-creates on the current loop."""
    import src.db as db_mod
    db_mod._pool = None
    yield
    if db_mod._pool is not None:
        await db_mod._pool.close()
        db_mod._pool = None
