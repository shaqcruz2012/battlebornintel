"""
Graph intelligence engine — faithful port of src/lib/graphIntel.js computeGraphMetrics().

Pure-Python implementations of PageRank, Betweenness Centrality (Brandes),
Community Detection (Label Propagation), and Structural Watchlist scoring.
No numpy dependency — uses plain lists/arrays to match JS Float64Array behaviour.
"""
from __future__ import annotations

import random
from collections import deque
from typing import Any


# ── Community colors (matches JS line 120, resolved from GP constants) ──────
COMM_COLORS: list[str] = [
    "#E8B931",  # GP.gold  (resolved: #C8A55A in constants but JS uses literal list)
    "#4ADE80",  # GP.green
    "#5B8DEF",  # GP.blue
    "#A78BFA",  # GP.purple
    "#F97316",  # GP.orange
    "#EF4444",  # GP.red
    "#22D3EE",  # GP.cyan
    "#EC4899",  # GP.pink
    "#84CC16",  # GP.lime
    "#14B8A6",  # GP.teal
    "#E57373",
    "#64B5F6",
    "#FFD54F",
    "#AED581",
    "#BA68C8",
    "#4DD0E1",
]


def compute_metrics(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Compute graph analytics identical to the JS ``computeGraphMetrics()``.

    Parameters
    ----------
    nodes : list[dict]
        Each node must have at least ``id`` and ``type``.
        Company nodes should also carry ``funding`` and ``label``/``name``.
    edges : list[dict]
        Each edge must have ``source`` and ``target`` (string IDs or dicts
        with an ``id`` key, matching the JS flexibility).

    Returns
    -------
    dict with keys: pagerank, betweenness, communities, numCommunities,
    commColors, watchlist, adj, ids, idx.
    """
    if not nodes:
        return {
            "pagerank": {},
            "betweenness": {},
            "communities": {},
            "watchlist": [],
            "numCommunities": 0,
            "commColors": COMM_COLORS,
            "adj": [],
            "ids": [],
            "idx": {},
        }

    # ── Build index maps (JS lines 5-7) ────────────────────────────────────
    ids: list[str] = [n["id"] for n in nodes]
    idx: dict[str, int] = {nid: i for i, nid in enumerate(ids)}
    n_nodes: int = len(ids)

    # ── Adjacency list (JS lines 9-18) ─────────────────────────────────────
    adj: list[list[int]] = [[] for _ in range(n_nodes)]
    edge_list: list[tuple[int, int]] = []

    for e in edges:
        # Handle both string IDs and object sources (JS line 12-13)
        src = e["source"]
        tgt = e["target"]
        si: int | None = idx.get(src["id"] if isinstance(src, dict) else src)
        ti: int | None = idx.get(tgt["id"] if isinstance(tgt, dict) else tgt)
        if si is not None and ti is not None and si != ti:
            adj[si].append(ti)
            adj[ti].append(si)
            edge_list.append((si, ti))

    # ══════════════════════════════════════════════════════════════════════════
    # PageRank — power iteration, d=0.85, 40 iterations (JS lines 20-38)
    # ══════════════════════════════════════════════════════════════════════════
    damping: float = 0.85
    pr: list[float] = [1.0 / n_nodes] * n_nodes

    for _ in range(40):
        next_pr: list[float] = [(1.0 - damping) / n_nodes] * n_nodes
        for i in range(n_nodes):
            neighbours = adj[i]
            if len(neighbours) > 0:
                share: float = pr[i] / len(neighbours)
                for j in neighbours:
                    next_pr[j] += damping * share
            else:
                # Dangling node — distribute evenly
                dangling_share: float = damping * pr[i] / n_nodes
                for j in range(n_nodes):
                    next_pr[j] += dangling_share
        pr = next_pr

    pr_max: float = max(pr)
    pr_min: float = min(pr)
    pr_range: float = pr_max - pr_min if (pr_max - pr_min) != 0 else 1.0

    pagerank: dict[str, int] = {}
    for i, nid in enumerate(ids):
        pagerank[nid] = round(((pr[i] - pr_min) / pr_range) * 100)

    # ══════════════════════════════════════════════════════════════════════════
    # Betweenness Centrality — Brandes' algorithm (JS lines 40-64)
    # ══════════════════════════════════════════════════════════════════════════
    bc: list[float] = [0.0] * n_nodes

    for s in range(n_nodes):
        stack: list[int] = []
        pred: list[list[int]] = [[] for _ in range(n_nodes)]
        sigma: list[float] = [0.0] * n_nodes
        sigma[s] = 1.0
        dist: list[int] = [-1] * n_nodes
        dist[s] = 0

        # BFS
        queue: deque[int] = deque()
        queue.append(s)
        while queue:
            v: int = queue.popleft()
            stack.append(v)
            for w in adj[v]:
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
                if dist[w] == dist[v] + 1:
                    sigma[w] += sigma[v]
                    pred[w].append(v)

        # Back-propagation of dependencies
        delta: list[float] = [0.0] * n_nodes
        while stack:
            w = stack.pop()
            for v in pred[w]:
                delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w])
            if w != s:
                bc[w] += delta[w]

    bc_max: float = max(bc) if max(bc) != 0 else 1.0

    betweenness: dict[str, int] = {}
    for i, nid in enumerate(ids):
        betweenness[nid] = round((bc[i] / bc_max) * 100)

    # ══════════════════════════════════════════════════════════════════════════
    # Community Detection — Label Propagation, 20 iterations (JS lines 66-88)
    # ══════════════════════════════════════════════════════════════════════════
    labels: list[int] = list(range(n_nodes))

    for _ in range(20):
        changed: bool = False
        # Random ordering per iteration (JS line 70)
        order: list[int] = list(range(n_nodes))
        random.shuffle(order)

        for i in order:
            if len(adj[i]) == 0:
                continue

            # Count label frequencies among neighbours
            freq: dict[int, int] = {}
            for j in adj[i]:
                lbl = labels[j]
                freq[lbl] = freq.get(lbl, 0) + 1

            max_freq: int = max(freq.values())
            candidates: list[int] = [lbl for lbl, f in freq.items() if f == max_freq]
            new_label: int = random.choice(candidates)

            if new_label != labels[i]:
                labels[i] = new_label
                changed = True

        if not changed:
            break

    # Map raw labels to sequential community IDs (JS lines 82-88)
    label_map: dict[int, int] = {}
    next_cid: int = 0
    communities: dict[str, int] = {}

    for i, nid in enumerate(ids):
        raw_label = labels[i]
        if raw_label not in label_map:
            label_map[raw_label] = next_cid
            next_cid += 1
        communities[nid] = label_map[raw_label]

    num_communities: int = next_cid

    # ══════════════════════════════════════════════════════════════════════════
    # Structural Watchlist — company nodes only (JS lines 90-117)
    # ══════════════════════════════════════════════════════════════════════════
    watchlist: list[dict[str, Any]] = []
    node_map: dict[str, dict[str, Any]] = {n["id"]: n for n in nodes}

    for i, nid in enumerate(ids):
        n = node_map.get(nid)
        if not n or n.get("type") != "company":
            continue

        degree: int = len(adj[i])
        pr_score: int = pagerank[nid]
        bc_score: int = betweenness[nid]
        funding: float = n.get("funding") or 0
        signals: list[dict[str, Any]] = []

        # undercovered: funding > 50 AND degree <= 3
        if funding > 50 and degree <= 3:
            signals.append({
                "type": "undercovered",
                "label": "High funding, few connections",
                "severity": min(100, round(funding / 10)),
                "icon": "\U0001f441",  # eye
            })

        # bridge: betweenness > 60
        if bc_score > 60:
            signals.append({
                "type": "bridge",
                "label": "Structural bridge between clusters",
                "severity": bc_score,
                "icon": "\U0001f309",  # bridge at night
            })

        # hidden_influence: pagerank > 50 AND funding < 100
        if pr_score > 50 and funding < 100:
            signals.append({
                "type": "hidden_influence",
                "label": "Structurally important beyond funding",
                "severity": pr_score,
                "icon": "\U0001f52e",  # crystal ball
            })

        # isolated_capital: funding > 200 AND pagerank < 20
        if funding > 200 and pr_score < 20:
            signals.append({
                "type": "isolated_capital",
                "label": "Large funding but low graph connectivity",
                "severity": round(funding / 50),
                "icon": "\U0001f3dd",  # desert island
            })

        # hub: degree >= 8
        if degree >= 8:
            signals.append({
                "type": "hub",
                "label": f"Hub node: {degree} connections",
                "severity": degree * 5,
                "icon": "\u2b50",  # star
            })

        if signals:
            watchlist.append({
                "id": nid,
                "name": n.get("label") or n.get("name", ""),
                "degree": degree,
                "pagerank": pr_score,
                "betweenness": bc_score,
                "funding": funding,
                "signals": signals,
                "priority": sum(sig["severity"] for sig in signals),
            })

    # Sort by descending priority (JS line 117)
    watchlist.sort(key=lambda w: w["priority"], reverse=True)

    return {
        "pagerank": pagerank,
        "betweenness": betweenness,
        "communities": communities,
        "numCommunities": num_communities,
        "commColors": COMM_COLORS,
        "watchlist": watchlist,
        "adj": adj,
        "ids": ids,
        "idx": idx,
    }
