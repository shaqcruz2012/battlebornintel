"""
Graph builder service — faithful port of src/lib/graphLayout.js buildGraph().

Assembles a graph from the unified PostgreSQL `nodes` table, applying
entity-type filters, relationship-type filters, and a year cutoff.
Returns the same shape as the frontend: {"nodes": [...], "edges": [...]}.
"""
from __future__ import annotations

import json
from typing import Any

from app.db import fetch


# ── Region display names (matches JS line 18) ──────────────────────────────
_REGION_NAMES: dict[str, str] = {
    "las_vegas": "Las Vegas",
    "reno": "Reno-Sparks",
    "henderson": "Henderson",
}


async def build_graph(
    filters: dict[str, bool],
    rel_filters: dict[str, bool],
    year_filter: int = 2026,
) -> dict[str, list[dict[str, Any]]]:
    """
    Build a filtered graph from the database.

    Parameters
    ----------
    filters : dict
        Boolean toggles keyed by entity type
        (company, fund, sector, region, person, external,
         accelerator, ecosystem, exchange).
    rel_filters : dict
        Boolean toggles keyed by relationship type.
        A rel whose key is missing is treated as *enabled*;
        only an explicit ``False`` disables it.
    year_filter : int
        Include verified edges whose year <= this value.

    Returns
    -------
    dict with "nodes" and "edges" lists matching the frontend shape.
    """
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    node_set: set[str] = set()

    # ── helpers (mirror JS ``add`` / ``lnk``) ──────────────────────────────
    def _add(node_id: str, label: str, ntype: str, extra: dict[str, Any] | None = None) -> None:
        if node_id not in node_set:
            node_set.add(node_id)
            node: dict[str, Any] = {"id": node_id, "label": label, "type": ntype}
            if extra:
                node.update(extra)
            nodes.append(node)

    def _lnk(source: str, target: str, rel: str, extra: dict[str, Any] | None = None) -> None:
        if source in node_set and target in node_set:
            edge: dict[str, Any] = {"source": source, "target": target, "rel": rel}
            if extra:
                edge.update(extra)
            edges.append(edge)

    def _parse_data(row: dict) -> dict[str, Any]:
        """Parse the JSONB data column, handling both dict and str types."""
        data = row.get("data", {})
        if isinstance(data, str):
            return json.loads(data) if data else {}
        return data or {}

    # ── 1. Query nodes from the unified nodes table ────────────────────────
    # All entity types live in one table; we filter by type column.
    company_rows: list[dict] = []
    fund_rows: list[dict] = []
    person_rows: list[dict] = []
    external_rows: list[dict] = []
    accel_rows: list[dict] = []
    eco_rows: list[dict] = []
    exchange_rows: list[dict] = []

    # Determine which types we need to fetch
    need_companies = (
        filters.get("company") or filters.get("sector")
        or filters.get("region") or filters.get("exchange")
    )

    if need_companies:
        company_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'company'"
        )

    if filters.get("fund"):
        fund_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'fund'"
        )

    if filters.get("person"):
        person_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'person'"
        )

    if filters.get("external"):
        external_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'external'"
        )

    if filters.get("accelerator"):
        accel_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'accelerator'"
        )

    if filters.get("ecosystem"):
        eco_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'ecosystem'"
        )

    if filters.get("exchange"):
        exchange_rows = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'exchange'"
        )

    # ── 2. Add nodes per type (JS lines 15-23) ────────────────────────────

    # Companies (IDs already stored as c_{id} in the nodes table)
    if filters.get("company"):
        for c in company_rows:
            d = _parse_data(c)
            _add(
                c["id"],
                c["label"],
                "company",
                {
                    "stage": d.get("stage"),
                    "funding": d.get("funding", 0),
                    "momentum": d.get("momentum", 0),
                    "employees": d.get("employees", 0),
                    "city": d.get("city"),
                    "region": d.get("region"),
                    "sector": d.get("sector") or [],
                    "eligible": d.get("eligible") or [],
                    "founded": d.get("founded"),
                },
            )

    # Funds
    if filters.get("fund"):
        for f in fund_rows:
            d = _parse_data(f)
            _add(f["id"], f["label"], "fund", {"fundType": d.get("fundType")})

    # Sectors — auto-generated from company sectors where count >= 2
    if filters.get("sector"):
        sec_counts: dict[str, int] = {}
        for c in company_rows:
            d = _parse_data(c)
            for s in d.get("sector") or []:
                sec_counts[s] = sec_counts.get(s, 0) + 1
        for s, n in sec_counts.items():
            if n >= 2:
                _add(f"s_{s}", s, "sector", {"count": n})

    # Regions — unique company regions
    if filters.get("region"):
        seen_regions: set[str] = set()
        for c in company_rows:
            d = _parse_data(c)
            r = d.get("region")
            if r and r not in seen_regions:
                seen_regions.add(r)
                _add(f"r_{r}", _REGION_NAMES.get(r, r), "region")

    # People (IDs already have p_ prefix in DB)
    if filters.get("person"):
        for p in person_rows:
            d = _parse_data(p)
            _add(
                p["id"],
                p["label"],
                "person",
                {
                    "role": d.get("role"),
                    "note": d.get("note"),
                    "companyId": d.get("companyId"),
                },
            )

    # Externals (IDs already have x_ prefix in DB)
    if filters.get("external"):
        for x in external_rows:
            d = _parse_data(x)
            _add(x["id"], x["label"], "external", {"etype": d.get("etype"), "note": d.get("note")})

    # Accelerators (IDs already have a_ prefix in DB)
    if filters.get("accelerator"):
        for a in accel_rows:
            d = _parse_data(a)
            _add(
                a["id"],
                a["label"],
                "accelerator",
                {
                    "atype": d.get("atype"),
                    "city": d.get("city"),
                    "region": d.get("region"),
                    "founded": d.get("founded"),
                    "note": d.get("note"),
                },
            )

    # Ecosystem orgs (IDs already have e_ prefix in DB)
    if filters.get("ecosystem"):
        for o in eco_rows:
            d = _parse_data(o)
            _add(
                o["id"],
                o["label"],
                "ecosystem",
                {
                    "etype": d.get("etype"),
                    "city": d.get("city"),
                    "region": d.get("region"),
                    "note": d.get("note"),
                },
            )

    # Exchanges (IDs already have ex_ prefix in DB)
    if filters.get("exchange"):
        for ex in exchange_rows:
            _add(ex["id"], ex["label"], "exchange")

    # ── 3. Generate derived edges (JS lines 24-28) ─────────────────────────

    # eligible_for: company -> fund
    if rel_filters.get("eligible_for") and filters.get("fund") and filters.get("company"):
        for c in company_rows:
            d = _parse_data(c)
            for f_id in d.get("eligible") or []:
                fund_node_id = f"f_{f_id}"
                if fund_node_id in node_set:
                    _lnk(c["id"], fund_node_id, "eligible_for")

    # operates_in: company -> sector
    if rel_filters.get("operates_in") and filters.get("sector") and filters.get("company"):
        for c in company_rows:
            d = _parse_data(c)
            for s in d.get("sector") or []:
                sector_node_id = f"s_{s}"
                if sector_node_id in node_set:
                    _lnk(c["id"], sector_node_id, "operates_in")

    # headquartered_in: company -> region
    if rel_filters.get("headquartered_in") and filters.get("region") and filters.get("company"):
        for c in company_rows:
            d = _parse_data(c)
            region = d.get("region")
            if region:
                region_node_id = f"r_{region}"
                if region_node_id in node_set:
                    _lnk(c["id"], region_node_id, "headquartered_in")

    # founder_of: person -> company
    if filters.get("person"):
        for p in person_rows:
            d = _parse_data(p)
            company_id = d.get("companyId")
            if company_id:
                company_node_id = f"c_{company_id}"
                if company_node_id in node_set:
                    _lnk(p["id"], company_node_id, "founder_of")

    # listed_on: company -> exchange (from edges table, not derived here)

    # ── 4. Add verified edges from DB (JS line 29) ─────────────────────────
    verified_edges = await fetch(
        "SELECT source_id, target_id, rel, note, year FROM edges "
        "WHERE status = 'approved'"
    )

    for e in verified_edges:
        source = e["source_id"]
        target = e["target_id"]
        rel = e["rel"]
        year = e.get("year") or 2023

        # Skip if either endpoint missing from current graph
        if source not in node_set or target not in node_set:
            continue

        # Skip if this rel type is explicitly disabled
        if rel_filters.get(rel) is False:
            continue

        # Skip if edge year exceeds the year filter
        if year > year_filter:
            continue

        _lnk(source, target, rel, {"note": e.get("note"), "y": year})

    return {"nodes": nodes, "edges": edges}
