"""
Pydantic models for BBI API requests/responses.
Mirrors the frontend data shapes for seamless integration.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
# CONSTANTS — must match frontend src/lib/constants.js
# ═══════════════════════════════════════════════════════════════

VALID_NODE_TYPES = {
    "company", "fund", "accelerator", "ecosystem",
    "external", "person", "sector", "region", "exchange",
}

VALID_REL_TYPES = {
    "invested_in", "partners_with", "accelerated_by", "competes_with",
    "acquired", "funds", "collaborated_with", "supports", "program_of",
    "housed_at", "manages", "loaned_to", "contracts_with", "won_pitch",
    "grants_to", "approved_by", "filed_with", "eligible_for",
    "operates_in", "headquartered_in", "founder_of", "listed_on",
    "incubated_by",
}

VALID_EDGE_SOURCES = {"seed", "edgar", "sbir", "news", "agent", "manual"}
VALID_EDGE_STATUSES = {"approved", "pending", "rejected"}

VALID_STAGES = {
    "pre_seed", "seed", "series_a", "series_b",
    "series_c_plus", "growth", "public",
}


# ═══════════════════════════════════════════════════════════════
# NODE MODELS
# ═══════════════════════════════════════════════════════════════

class NodeBase(BaseModel):
    id: str
    type: str
    label: str
    data: dict[str, Any] = Field(default_factory=dict)


class NodeCreate(NodeBase):
    confidence: float = 1.0
    source: str = "manual"


class NodeUpdate(BaseModel):
    label: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    confidence: Optional[float] = None


class NodeResponse(NodeBase):
    confidence: float
    source: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════
# EDGE MODELS
# ═══════════════════════════════════════════════════════════════

class EdgeBase(BaseModel):
    source_id: str
    target_id: str
    rel: str
    note: Optional[str] = None
    year: int = 2023


class EdgeProposal(EdgeBase):
    """Proposed edge from ingestion pipeline or agent."""
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)
    source: str = "agent"
    evidence: list[dict[str, Any]] = Field(default_factory=list)


class EdgeReviewRequest(BaseModel):
    action: str  # approved, rejected, needs_info
    confidence: Optional[float] = None
    notes: Optional[str] = None
    reviewer: str = "admin"


class EdgeResponse(EdgeBase):
    id: int
    confidence: float
    source: str
    evidence: list[dict[str, Any]]
    status: str
    reviewed_by: Optional[str]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
# GRAPH RESPONSE (matches frontend buildGraph output)
# ═══════════════════════════════════════════════════════════════

class GraphNode(BaseModel):
    """Node shape expected by frontend buildGraph/cytoscapeAdapter."""
    id: str
    label: str
    type: str
    stage: Optional[str] = None
    funding: float = 0
    momentum: float = 0
    employees: int = 0
    city: Optional[str] = None
    region: Optional[str] = None
    sector: list[str] = Field(default_factory=list)
    fundType: Optional[str] = None
    role: Optional[str] = None
    note: Optional[str] = None
    etype: Optional[str] = None
    atype: Optional[str] = None
    eligible: list[str] = Field(default_factory=list)
    founded: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class GraphEdge(BaseModel):
    """Edge shape expected by frontend."""
    source: str
    target: str
    rel: str
    note: Optional[str] = None
    y: int = 2023


class GraphMetrics(BaseModel):
    pagerank: dict[str, float]
    betweenness: dict[str, float]
    communities: dict[str, int]
    numCommunities: int
    commColors: list[str]
    watchlist: list[dict[str, Any]]


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    metrics: GraphMetrics


# ═══════════════════════════════════════════════════════════════
# AGENT MODELS
# ═══════════════════════════════════════════════════════════════

class AgentRunRequest(BaseModel):
    mode: str  # discovery, verification, enrichment


class AgentRunResponse(BaseModel):
    id: int
    run_type: str
    status: str
    stats: dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
# FILTER MODELS (mirrors frontend filter state)
# ═══════════════════════════════════════════════════════════════

class GraphFilters(BaseModel):
    """Filter parameters matching frontend GraphView state."""
    company: bool = True
    fund: bool = True
    accelerator: bool = True
    sector: bool = False
    region: bool = False
    person: bool = True
    external: bool = True
    ecosystem: bool = True
    exchange: bool = False
    year: int = 2026
    # Relationship filters as comma-separated string of enabled rels
    rels: Optional[str] = None
