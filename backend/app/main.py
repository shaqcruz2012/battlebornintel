"""
BBI FastAPI Application — Nevada startup ecosystem intelligence platform.

Provides REST + WebSocket API for graph analytics, node/edge CRUD,
ingestion pipelines, and research agents.
"""
import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_pool, close_pool, start_listener, add_graph_listener, remove_graph_listener
from app.routers import graph, nodes, edges, ingest, research

logger = logging.getLogger("bbi.main")

# ── WebSocket connection manager ──

_ws_clients: set[WebSocket] = set()


async def _broadcast_graph_change(data: dict):
    """Forward a PostgreSQL graph_changed NOTIFY to all WebSocket clients."""
    payload = json.dumps(data)
    stale: list[WebSocket] = []
    for ws in _ws_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            stale.append(ws)
    for ws in stale:
        _ws_clients.discard(ws)


# ── Application lifespan ──

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB pool + LISTEN/NOTIFY. Shutdown: close pool."""
    await init_pool()
    add_graph_listener(_broadcast_graph_change)
    listener_task = asyncio.create_task(start_listener())
    logger.info("BBI API started")
    yield
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass
    remove_graph_listener(_broadcast_graph_change)
    await close_pool()
    logger.info("BBI API shut down")


# ── FastAPI app ──

app = FastAPI(
    title="Battle Born Intelligence API",
    description="Nevada startup ecosystem graph analytics platform",
    version="5.2.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(graph.router)
app.include_router(nodes.router)
app.include_router(edges.router)
app.include_router(ingest.router)
app.include_router(research.router)


# ── Health check ──

@app.get("/health", tags=["system"])
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "bbi-api", "version": "5.2.0"}


# ── WebSocket for real-time graph updates ──

@app.websocket("/ws/graph")
async def ws_graph(ws: WebSocket):
    """
    WebSocket endpoint that broadcasts graph change notifications.
    Clients connect here to receive live updates when edges/nodes change.
    """
    await ws.accept()
    _ws_clients.add(ws)
    logger.info(f"WebSocket client connected ({len(_ws_clients)} total)")
    try:
        while True:
            # Keep connection alive; client can send pings or filters
            data = await ws.receive_text()
            # Future: handle client filter messages
            logger.debug(f"WebSocket received: {data}")
    except WebSocketDisconnect:
        pass
    finally:
        _ws_clients.discard(ws)
        logger.info(f"WebSocket client disconnected ({len(_ws_clients)} total)")
