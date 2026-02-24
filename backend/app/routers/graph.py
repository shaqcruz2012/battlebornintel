"""
Graph router — assembles the full graph payload with analytics.

GET /api/graph   — full graph (nodes + edges + metrics), filtered
GET /api/metrics — precomputed metrics only (lighter response)
"""
import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.db import fetch, fetchval
from app.models import (
    GraphFilters, GraphNode, GraphEdge, GraphMetrics, GraphResponse,
    VALID_REL_TYPES,
)

logger = logging.getLogger("bbi.routers.graph")

router = APIRouter(prefix="/api", tags=["graph"])


# ═══════════════════════════════════════════════════════════════
# GRAPH BUILDER — assembles nodes + edges from DB
# ═══════════════════════════════════════════════════════════════

async def build_graph(filters: GraphFilters) -> tuple[list[GraphNode], list[GraphEdge]]:
    """
    Query nodes and edges from the database, applying type and year filters.
    Returns (nodes, edges) ready for metric computation.
    """
    # Determine which node types to include based on filter booleans
    enabled_types: list[str] = []
    type_map = {
        "company": "company",
        "fund": "fund",
        "accelerator": "accelerator",
        "sector": "sector",
        "region": "region",
        "person": "person",
        "external": "external",
        "ecosystem": "ecosystem",
        "exchange": "exchange",
    }
    for attr, node_type in type_map.items():
        if getattr(filters, attr, False):
            enabled_types.append(node_type)

    if not enabled_types:
        return [], []

    # Fetch nodes matching enabled types
    node_rows = await fetch(
        "SELECT id, type, label, data FROM nodes WHERE type = ANY($1::text[])",
        enabled_types,
    )

    node_ids = {r["id"] for r in node_rows}

    # Parse rel filter
    enabled_rels: Optional[set[str]] = None
    if filters.rels:
        enabled_rels = {r.strip() for r in filters.rels.split(",") if r.strip() in VALID_REL_TYPES}

    # Fetch edges filtered by year and status
    edge_query = """
        SELECT source_id, target_id, rel, note, year
        FROM edges
        WHERE status = 'approved'
          AND year <= $1
    """
    edge_rows = await fetch(edge_query, filters.year)

    # Assemble GraphNode models
    nodes: list[GraphNode] = []
    for r in node_rows:
        d = r["data"] or {}
        nodes.append(GraphNode(
            id=r["id"],
            label=r["label"],
            type=r["type"],
            stage=d.get("stage"),
            funding=d.get("funding", 0),
            momentum=d.get("momentum", 0),
            employees=d.get("employees", 0),
            city=d.get("city"),
            region=d.get("region"),
            sector=d.get("sector", []),
            fundType=d.get("fundType"),
            role=d.get("role"),
            note=d.get("note"),
            etype=d.get("etype"),
            atype=d.get("atype"),
            eligible=d.get("eligible", []),
            founded=d.get("founded"),
            lat=d.get("lat"),
            lng=d.get("lng"),
        ))

    # Assemble GraphEdge models — only edges between included nodes
    edges: list[GraphEdge] = []
    for r in edge_rows:
        if r["source_id"] not in node_ids or r["target_id"] not in node_ids:
            continue
        if enabled_rels and r["rel"] not in enabled_rels:
            continue
        edges.append(GraphEdge(
            source=r["source_id"],
            target=r["target_id"],
            rel=r["rel"],
            note=r["note"],
            y=r["year"],
        ))

    return nodes, edges


# ═══════════════════════════════════════════════════════════════
# GRAPH INTEL — compute PR, BC, communities, watchlist
# ═══════════════════════════════════════════════════════════════

async def compute_metrics(
    nodes: list[GraphNode],
    edges: list[GraphEdge],
) -> GraphMetrics:
    """
    Compute PageRank, betweenness centrality, community detection,
    and watchlist signals. Mirrors the frontend graphIntel.js logic.
    """
    node_ids = [n.id for n in nodes]
    node_map = {n.id: n for n in nodes}
    n = len(node_ids)

    if n == 0:
        return GraphMetrics(
            pagerank={}, betweenness={}, communities={},
            numCommunities=0, commColors=[], watchlist=[],
        )

    # Build adjacency
    adj: dict[str, set[str]] = {nid: set() for nid in node_ids}
    for e in edges:
        if e.source in adj and e.target in adj:
            adj[e.source].add(e.target)
            adj[e.target].add(e.source)

    # ── PageRank (power iteration, damping=0.85, 40 iters) ──
    damping = 0.85
    pr = {nid: 1.0 / n for nid in node_ids}
    for _ in range(40):
        new_pr: dict[str, float] = {}
        for nid in node_ids:
            rank_sum = sum(
                pr[nbr] / len(adj[nbr]) for nbr in adj[nid] if len(adj[nbr]) > 0
            )
            new_pr[nid] = (1 - damping) / n + damping * rank_sum
        pr = new_pr

    # Normalize to [0, 1]
    max_pr = max(pr.values()) if pr else 1
    if max_pr > 0:
        pr = {k: v / max_pr for k, v in pr.items()}

    # ── Betweenness centrality (Brandes' algorithm) ──
    bc: dict[str, float] = {nid: 0.0 for nid in node_ids}
    for s in node_ids:
        stack: list[str] = []
        pred: dict[str, list[str]] = {nid: [] for nid in node_ids}
        sigma: dict[str, float] = {nid: 0.0 for nid in node_ids}
        sigma[s] = 1.0
        dist: dict[str, int] = {nid: -1 for nid in node_ids}
        dist[s] = 0
        queue: list[str] = [s]
        qi = 0

        while qi < len(queue):
            v = queue[qi]
            qi += 1
            stack.append(v)
            for w in adj[v]:
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
                if dist[w] == dist[v] + 1:
                    sigma[w] += sigma[v]
                    pred[w].append(v)

        delta: dict[str, float] = {nid: 0.0 for nid in node_ids}
        while stack:
            w = stack.pop()
            for v in pred[w]:
                delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
            if w != s:
                bc[w] += delta[w]

    # Normalize
    if n > 2:
        norm = 2.0 / ((n - 1) * (n - 2))
        bc = {k: v * norm for k, v in bc.items()}
    max_bc = max(bc.values()) if bc else 1
    if max_bc > 0:
        bc = {k: v / max_bc for k, v in bc.items()}

    # ── Community detection (label propagation) ──
    communities: dict[str, int] = {nid: i for i, nid in enumerate(node_ids)}
    for _ in range(20):
        changed = False
        for nid in node_ids:
            if not adj[nid]:
                continue
            # Count neighbor labels
            label_counts: dict[int, int] = {}
            for nbr in adj[nid]:
                lbl = communities[nbr]
                label_counts[lbl] = label_counts.get(lbl, 0) + 1
            best_label = max(label_counts, key=lambda l: label_counts[l])
            if communities[nid] != best_label:
                communities[nid] = best_label
                changed = True
        if not changed:
            break

    # Remap community IDs to 0-based
    unique_labels = sorted(set(communities.values()))
    label_remap = {old: new for new, old in enumerate(unique_labels)}
    communities = {k: label_remap[v] for k, v in communities.items()}
    num_communities = len(unique_labels)

    # Community colors (Palantir-inspired palette)
    comm_colors = [
        "#00d4aa", "#4fc3f7", "#ff8a65", "#ba68c8", "#ffd54f",
        "#81c784", "#e57373", "#64b5f6", "#a1887f", "#4db6ac",
        "#f06292", "#aed581", "#7986cb", "#ffb74d", "#90a4ae",
    ]
    while len(comm_colors) < num_communities:
        comm_colors.append("#888888")

    # ── Watchlist signals ──
    watchlist: list[dict] = []
    for nid in node_ids:
        node = node_map[nid]
        degree = len(adj[nid])

        # Hub: 8+ connections
        if degree >= 8:
            watchlist.append({"id": nid, "label": node.label, "signal": "hub", "degree": degree})

        # Bridge: high betweenness
        if bc.get(nid, 0) > 0.3:
            watchlist.append({"id": nid, "label": node.label, "signal": "bridge", "betweenness": round(bc[nid], 3)})

        # Hidden influence: high PageRank despite modest funding
        if pr.get(nid, 0) > 0.4 and node.funding < 50:
            watchlist.append({"id": nid, "label": node.label, "signal": "hidden_influence", "pagerank": round(pr[nid], 3)})

        # Undercovered: high funding, few connections
        if node.funding > 100 and degree <= 2:
            watchlist.append({"id": nid, "label": node.label, "signal": "undercovered", "funding": node.funding, "degree": degree})

        # Isolated capital: big money but low graph connectivity
        if node.funding > 200 and pr.get(nid, 0) < 0.1:
            watchlist.append({"id": nid, "label": node.label, "signal": "isolated_capital", "funding": node.funding, "pagerank": round(pr[nid], 3)})

    return GraphMetrics(
        pagerank={k: round(v, 4) for k, v in pr.items()},
        betweenness={k: round(v, 4) for k, v in bc.items()},
        communities=communities,
        numCommunities=num_communities,
        commColors=comm_colors[:num_communities],
        watchlist=watchlist,
    )


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.get("/graph", response_model=GraphResponse)
async def get_graph(
    company: bool = Query(True),
    fund: bool = Query(True),
    accelerator: bool = Query(True),
    sector: bool = Query(False),
    region: bool = Query(False),
    person: bool = Query(True),
    external: bool = Query(True),
    ecosystem: bool = Query(True),
    exchange: bool = Query(False),
    year: int = Query(2026),
    rels: Optional[str] = Query(None, description="Comma-separated enabled rel types"),
):
    """
    Return the full graph with nodes, edges, and computed metrics.
    Accepts filter query params matching frontend GraphFilters state.
    """
    filters = GraphFilters(
        company=company,
        fund=fund,
        accelerator=accelerator,
        sector=sector,
        region=region,
        person=person,
        external=external,
        ecosystem=ecosystem,
        exchange=exchange,
        year=year,
        rels=rels,
    )

    nodes, edges = await build_graph(filters)
    metrics = await compute_metrics(nodes, edges)

    return GraphResponse(nodes=nodes, edges=edges, metrics=metrics)


@router.get("/metrics", response_model=GraphMetrics)
async def get_metrics(
    year: int = Query(2026),
    rels: Optional[str] = Query(None),
):
    """
    Return precomputed metrics only (faster than full graph endpoint).
    Uses default filters for node types.
    """
    filters = GraphFilters(year=year, rels=rels)
    nodes, edges = await build_graph(filters)
    metrics = await compute_metrics(nodes, edges)
    return metrics
