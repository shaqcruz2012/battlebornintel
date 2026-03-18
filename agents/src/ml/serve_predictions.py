"""
TGN Inference Microservice (FastAPI).

Serves link predictions and node embeddings from a trained TGN model.

Run:
  uvicorn agents.src.ml.serve_predictions:app --port 8000

Endpoints:
  GET /predict/links/{node_id}?limit=20  — Predict future connections
  GET /embeddings/{node_id}              — Return node embedding vector
  GET /health                            — Service health check
"""

import json
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="BBI TGN Predictions",
    description="Temporal Graph Network inference for Battle Born Intel link prediction",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Global state — populated on startup
# ---------------------------------------------------------------------------
MODEL = None
NODE_MAPPING = None
REVERSE_MAPPING = None  # int -> string id
DATA_DIR = Path('agents/data/temporal')


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------
class LinkPrediction(BaseModel):
    target_id: str
    target_name: Optional[str] = None
    score: float
    rel_type: Optional[str] = None


class PredictLinksResponse(BaseModel):
    node_id: str
    predictions: list[LinkPrediction]
    model: str
    status: str


class EmbeddingResponse(BaseModel):
    node_id: str
    embedding: list[float]
    dimension: int
    status: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    num_nodes: int
    model_version: str


# ---------------------------------------------------------------------------
# Startup — load model and mappings
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def load_model():
    """Load TGN model and node mappings on server start."""
    global MODEL, NODE_MAPPING, REVERSE_MAPPING

    mapping_path = DATA_DIR / 'node_mapping.json'
    if mapping_path.exists():
        with open(mapping_path) as f:
            NODE_MAPPING = json.load(f)
        REVERSE_MAPPING = {v: k for k, v in NODE_MAPPING.items()}
        print(f"Loaded node mapping: {len(NODE_MAPPING)} nodes")
    else:
        print(f"Warning: No node mapping found at {mapping_path}")
        NODE_MAPPING = {}
        REVERSE_MAPPING = {}

    # TODO: Load trained TGN model checkpoint
    # model_path = DATA_DIR / 'tgn_bbi_v1.pt'
    # if model_path.exists():
    #     import torch
    #     from .train_tgn import build_tgn_model
    #     MODEL = build_tgn_model(...)
    #     MODEL.load_state_dict(torch.load(model_path))
    #     MODEL.eval()
    #     print("TGN model loaded")

    print("TGN inference service ready (scaffold mode)")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/predict/links/{node_id}", response_model=PredictLinksResponse)
async def predict_links(node_id: str, limit: int = 20):
    """
    Predict likely future connections for a given node.

    Uses the trained TGN model to score all candidate target nodes
    and returns the top-k most likely future links.

    Args:
        node_id: String node identifier (e.g., company slug, fund id)
        limit:   Maximum number of predictions to return
    """
    if NODE_MAPPING is None or node_id not in NODE_MAPPING:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found in graph"
        )

    if MODEL is None:
        # Scaffold mode — return empty predictions with status
        return PredictLinksResponse(
            node_id=node_id,
            predictions=[],
            model="tgn-v0",
            status="scaffold — no trained model loaded",
        )

    # TODO: Full inference pipeline
    # 1. Look up node index from NODE_MAPPING
    # 2. Get current node embedding from model memory
    # 3. Score against all other nodes using LinkPredictor
    # 4. Filter out existing connections
    # 5. Sort by score descending, take top-k
    # 6. Map integer indices back to string IDs via REVERSE_MAPPING

    return PredictLinksResponse(
        node_id=node_id,
        predictions=[],
        model="tgn-v0",
        status="scaffold",
    )


@app.get("/embeddings/{node_id}", response_model=EmbeddingResponse)
async def get_embedding(node_id: str):
    """
    Return the current learned embedding vector for a node.

    The embedding combines static features (type, sector, region, funding)
    with the TGN's dynamic memory, which evolves as new edges are observed.
    """
    if NODE_MAPPING is None or node_id not in NODE_MAPPING:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found in graph"
        )

    if MODEL is None:
        return EmbeddingResponse(
            node_id=node_id,
            embedding=[],
            dimension=0,
            status="scaffold — no trained model loaded",
        )

    # TODO: Extract embedding from model
    # node_idx = NODE_MAPPING[node_id]
    # embedding = model.compute_embedding(node_idx).tolist()

    return EmbeddingResponse(
        node_id=node_id,
        embedding=[],
        dimension=0,
        status="scaffold",
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    """Service health check."""
    return HealthResponse(
        status="ok",
        model_loaded=MODEL is not None,
        num_nodes=len(NODE_MAPPING) if NODE_MAPPING else 0,
        model_version="tgn-v0-scaffold",
    )
