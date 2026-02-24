"""
JSON-to-PostgreSQL migration script.

Reads all JSON data files from the frontend src/data/ directory and inserts
them into the PostgreSQL database in the correct order:
  1. nodes: companies, graphFunds, people, externals, accelerators, ecosystem
  2. edges: verified edges from edges.json + listings as listed_on edges

Uses INSERT ... ON CONFLICT DO NOTHING for idempotency — safe to re-run.

Usage:
    python -m app.seed.migrate_json
    python -m app.seed.migrate_json --data-path /path/to/src/data
"""
import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any

from app.config import settings
from app.db import init_pool, close_pool, execute, executemany, fetchval

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("bbi.migrate")


def _load_json(path: Path) -> list[dict]:
    """Load a JSON array file, returning [] if missing."""
    if not path.exists():
        logger.warning(f"File not found, skipping: {path}")
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _json_dumps(obj: Any) -> str:
    """Serialize to JSON string for JSONB columns."""
    return json.dumps(obj, ensure_ascii=False)


async def migrate(data_path: Path) -> dict[str, int]:
    """
    Run the full migration from JSON files to PostgreSQL.
    Returns a summary dict with counts of inserted nodes and edges.
    """
    await init_pool()

    node_count = 0
    edge_count = 0

    try:
        # ════════════════════════════════════════════════════════
        # 1. NODES
        # ════════════════════════════════════════════════════════

        node_insert = """
            INSERT INTO nodes (id, type, label, data, confidence, source)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
        """

        # ── Companies (id = c_{integer_id}) ──
        companies = _load_json(data_path / "companies.json")
        company_args = []
        for c in companies:
            node_id = f"c_{c['id']}"
            label = c["name"]
            data = {
                "stage": c.get("stage"),
                "sector": c.get("sector", []),
                "city": c.get("city"),
                "region": c.get("region"),
                "funding": c.get("funding", 0),
                "momentum": c.get("momentum", 0),
                "employees": c.get("employees", 0),
                "founded": c.get("founded"),
                "description": c.get("description"),
                "eligible": c.get("eligible", []),
                "lat": c.get("lat"),
                "lng": c.get("lng"),
            }
            company_args.append((node_id, "company", label, _json_dumps(data), 1.0, "seed"))
        if company_args:
            await executemany(node_insert, company_args)
            node_count += len(company_args)
            logger.info(f"  Companies: {len(company_args)} rows")

        # ── Funds (id = f_{id}) — from graphFunds.json ──
        graph_funds = _load_json(data_path / "graphFunds.json")
        fund_args = []
        for gf in graph_funds:
            node_id = f"f_{gf['id']}"
            label = gf["name"]
            data = {
                "fundType": gf.get("type"),
            }
            fund_args.append((node_id, "fund", label, _json_dumps(data), 1.0, "seed"))
        if fund_args:
            await executemany(node_insert, fund_args)
            node_count += len(fund_args)
            logger.info(f"  Funds (graph): {len(fund_args)} rows")

        # ── People (id already has p_ prefix) ──
        people = _load_json(data_path / "people.json")
        people_args = []
        for p in people:
            node_id = p["id"]
            label = p["name"]
            data = {
                "role": p.get("role"),
                "companyId": p.get("companyId"),
                "note": p.get("note"),
            }
            people_args.append((node_id, "person", label, _json_dumps(data), 1.0, "seed"))
        if people_args:
            await executemany(node_insert, people_args)
            node_count += len(people_args)
            logger.info(f"  People: {len(people_args)} rows")

        # ── Externals (id already has x_ prefix) ──
        externals = _load_json(data_path / "externals.json")
        external_args = []
        for x in externals:
            node_id = x["id"]
            label = x["name"]
            data = {
                "etype": x.get("etype"),
                "note": x.get("note"),
            }
            external_args.append((node_id, "external", label, _json_dumps(data), 1.0, "seed"))
        if external_args:
            await executemany(node_insert, external_args)
            node_count += len(external_args)
            logger.info(f"  Externals: {len(external_args)} rows")

        # ── Accelerators (id already has a_ prefix) ──
        accelerators = _load_json(data_path / "accelerators.json")
        accel_args = []
        for a in accelerators:
            node_id = a["id"]
            label = a["name"]
            data = {
                "atype": a.get("atype"),
                "city": a.get("city"),
                "region": a.get("region"),
                "founded": a.get("founded"),
                "note": a.get("note"),
            }
            accel_args.append((node_id, "accelerator", label, _json_dumps(data), 1.0, "seed"))
        if accel_args:
            await executemany(node_insert, accel_args)
            node_count += len(accel_args)
            logger.info(f"  Accelerators: {len(accel_args)} rows")

        # ── Ecosystem orgs (id already has e_ prefix) ──
        ecosystem = _load_json(data_path / "ecosystem.json")
        eco_args = []
        for e in ecosystem:
            node_id = e["id"]
            label = e["name"]
            data = {
                "etype": e.get("etype"),
                "city": e.get("city"),
                "region": e.get("region"),
                "note": e.get("note"),
            }
            eco_args.append((node_id, "ecosystem", label, _json_dumps(data), 1.0, "seed"))
        if eco_args:
            await executemany(node_insert, eco_args)
            node_count += len(eco_args)
            logger.info(f"  Ecosystem: {len(eco_args)} rows")

        logger.info(f"Total nodes: {node_count}")

        # ════════════════════════════════════════════════════════
        # 2. EDGES
        # ════════════════════════════════════════════════════════

        edge_insert = """
            INSERT INTO edges (source_id, target_id, rel, note, year, confidence, source, evidence, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT DO NOTHING
        """

        # ── Verified edges from edges.json ──
        edges_data = _load_json(data_path / "edges.json")
        edge_args = []
        for e in edges_data:
            source_id = e["source"]
            target_id = e["target"]
            rel = e["rel"]
            note = e.get("note")
            year = e.get("y", 2023)
            edge_args.append((
                source_id, target_id, rel, note, year,
                1.0, "seed", "[]", "approved",
            ))
        if edge_args:
            await executemany(edge_insert, edge_args)
            edge_count += len(edge_args)
            logger.info(f"  Verified edges: {len(edge_args)} rows")

        # ── Listings as listed_on edges ──
        #    Each listing creates: c_{companyId} --listed_on--> exchange node
        #    We need exchange nodes first
        listings = _load_json(data_path / "listings.json")

        # Create exchange nodes for unique exchanges
        exchanges_seen: set[str] = set()
        exchange_args = []
        for lst in listings:
            ex = lst["exchange"]
            if ex not in exchanges_seen:
                exchanges_seen.add(ex)
                ex_id = f"ex_{ex.lower().replace('/', '_')}"
                exchange_args.append((ex_id, "exchange", ex, _json_dumps({"note": f"{ex} stock exchange"}), 1.0, "seed"))

        if exchange_args:
            await executemany(node_insert, exchange_args)
            node_count += len(exchange_args)
            logger.info(f"  Exchange nodes: {len(exchange_args)} rows")

        # Create listed_on edges
        listing_edge_args = []
        for lst in listings:
            company_id = f"c_{lst['companyId']}"
            ex = lst["exchange"]
            ex_id = f"ex_{ex.lower().replace('/', '_')}"
            ticker = lst.get("ticker", "")
            listing_edge_args.append((
                company_id, ex_id, "listed_on", f"Ticker: {ticker}",
                2023, 1.0, "seed", "[]", "approved",
            ))
        if listing_edge_args:
            await executemany(edge_insert, listing_edge_args)
            edge_count += len(listing_edge_args)
            logger.info(f"  Listing edges: {len(listing_edge_args)} rows")

        logger.info(f"Total edges: {edge_count}")

    finally:
        await close_pool()

    return {"nodes": node_count, "edges": edge_count}


async def main():
    """Entry point for CLI execution."""
    # Determine data path
    data_path: Path

    # Check for --data-path CLI arg
    if "--data-path" in sys.argv:
        idx = sys.argv.index("--data-path")
        if idx + 1 < len(sys.argv):
            data_path = Path(sys.argv[idx + 1])
        else:
            logger.error("--data-path requires a value")
            sys.exit(1)
    elif Path(settings.seed_data_path).exists():
        # Use configured seed_data_path (Docker mount)
        data_path = Path(settings.seed_data_path)
    else:
        # Fall back to ../src/data/ relative to this file
        data_path = Path(__file__).resolve().parent.parent.parent.parent / "src" / "data"

    if not data_path.exists():
        logger.error(f"Data path does not exist: {data_path}")
        sys.exit(1)

    logger.info(f"Migrating JSON data from: {data_path}")

    summary = await migrate(data_path)

    print(f"\n{'=' * 50}")
    print(f"Migration complete!")
    print(f"  {summary['nodes']} nodes inserted")
    print(f"  {summary['edges']} edges inserted")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    asyncio.run(main())
