"""
Export temporal graph data for TGN (Temporal Graph Network) training.

Reads all timestamped edges from PostgreSQL and produces training-ready
files for PyTorch Geometric Temporal:

  temporal_edges.csv  — (source, target, timestamp, rel_idx, matching_score)
  node_features.csv   — (node_idx, feat_0 .. feat_N)
  node_mapping.json   — {string_id: int_index}
  metadata.json       — stats and schema info

Usage:
  DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel \
    python -m agents.src.ml.export_temporal_data
"""

import asyncpg
import json
import csv
import os
import sys
from datetime import datetime

# ---------------------------------------------------------------------------
# Stage / region / fund_type vocabularies — used for one-hot encoding
# ---------------------------------------------------------------------------
STAGES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'public']
REGIONS = ['reno', 'las-vegas', 'vegas', 'carson-city', 'rural', 'tahoe', 'henderson', 'other']
FUND_TYPES = ['SSBCI', 'Angel', 'Accelerator', 'Venture', 'Deep Tech VC', 'Growth VC', 'Micro VC']
NODE_TYPES = ['company', 'fund', 'graph_fund', 'person', 'external', 'accelerator', 'ecosystem_org']


def _one_hot(value, vocab):
    """Return a list of 0/1 floats for the given value against vocab."""
    vec = [0.0] * len(vocab)
    if value in vocab:
        vec[vocab.index(value)] = 1.0
    return vec


def _multi_hot(values, vocab):
    """Return a multi-hot list for an array of values."""
    vec = [0.0] * len(vocab)
    if values:
        for v in values:
            if v in vocab:
                vec[vocab.index(v)] = 1.0
    return vec


def _normalize(value, max_val):
    """Min-max normalize a single value (min assumed 0)."""
    if max_val is None or max_val == 0:
        return 0.0
    return min(float(value or 0) / float(max_val), 1.0)


# ---------------------------------------------------------------------------
# Main export coroutine
# ---------------------------------------------------------------------------
async def export_temporal_data(db_url, output_dir='agents/data/temporal'):
    os.makedirs(output_dir, exist_ok=True)
    conn = await asyncpg.connect(db_url)

    try:
        # ------------------------------------------------------------------
        # 1. Build node mapping  (string ID -> integer index)
        #    TGN requires contiguous integer node indices starting at 0.
        # ------------------------------------------------------------------
        rows = await conn.fetch("""
            SELECT DISTINCT id FROM (
                SELECT source_id AS id FROM graph_edges
                UNION
                SELECT target_id AS id FROM graph_edges
            ) t ORDER BY id
        """)
        node_map = {row['id']: i for i, row in enumerate(rows)}

        with open(os.path.join(output_dir, 'node_mapping.json'), 'w') as f:
            json.dump(node_map, f)

        print(f"  node_mapping.json: {len(node_map)} nodes")

        # ------------------------------------------------------------------
        # 2. Build per-node feature vectors
        #
        # Feature layout (concatenated):
        #   [node_type one-hot (7)]
        #   [stage one-hot (7)]         — companies only, else zeros
        #   [region one-hot (8)]        — companies / accelerators / ecosystem_orgs
        #   [funding_m normalized (1)]  — companies
        #   [momentum normalized (1)]   — companies
        #   [employees normalized (1)]  — companies
        #   [deployed_m normalized (1)] — funds / graph_funds
        #
        # Total feature dimension: 7+7+8+1+1+1+1 = 26
        # ------------------------------------------------------------------
        FEAT_DIM = len(NODE_TYPES) + len(STAGES) + len(REGIONS) + 4  # 26

        # Fetch entity data
        companies = {
            str(r['id']): r for r in await conn.fetch(
                "SELECT id, stage, sectors, region, funding_m, momentum, employees FROM companies"
            )
        }
        funds = {
            r['id']: r for r in await conn.fetch(
                "SELECT id, fund_type, deployed_m FROM funds"
            )
        }
        graph_funds = {
            r['id']: r for r in await conn.fetch(
                "SELECT id, fund_type FROM graph_funds"
            )
        }
        people = set(
            r['id'] for r in await conn.fetch("SELECT id FROM people")
        )
        externals = set(
            r['id'] for r in await conn.fetch("SELECT id FROM externals")
        )
        accelerators = {
            r['id']: r for r in await conn.fetch(
                "SELECT id, region FROM accelerators"
            )
        }
        ecosystem_orgs = {
            r['id']: r for r in await conn.fetch(
                "SELECT id, region FROM ecosystem_orgs"
            )
        }

        # Normalization ceilings
        max_funding = max((float(c['funding_m'] or 0) for c in companies.values()), default=1)
        max_momentum = 100.0
        max_employees = max((float(c['employees'] or 0) for c in companies.values()), default=1)
        max_deployed = max((float(f['deployed_m'] or 0) for f in funds.values()), default=1)

        def _classify_node(node_id):
            """Determine node type from entity tables."""
            if node_id in companies:
                return 'company'
            if node_id in funds:
                return 'fund'
            if node_id in graph_funds:
                return 'graph_fund'
            if node_id in people:
                return 'person'
            if node_id in externals:
                return 'external'
            if node_id in accelerators:
                return 'accelerator'
            if node_id in ecosystem_orgs:
                return 'ecosystem_org'
            # Heuristic fallback by prefix
            if node_id.startswith('f_'):
                return 'fund'
            if node_id.startswith('p_'):
                return 'person'
            if node_id.startswith('x_'):
                return 'external'
            return 'external'  # default

        def _build_features(node_id):
            """Build a fixed-length feature vector for a single node."""
            ntype = _classify_node(node_id)
            feats = _one_hot(ntype, NODE_TYPES)

            if ntype == 'company' and node_id in companies:
                c = companies[node_id]
                feats += _one_hot(c['stage'], STAGES)
                feats += _one_hot(c['region'], REGIONS)
                feats.append(_normalize(c['funding_m'], max_funding))
                feats.append(_normalize(c['momentum'], max_momentum))
                feats.append(_normalize(c['employees'], max_employees))
                feats.append(0.0)  # deployed_m placeholder
            elif ntype == 'fund' and node_id in funds:
                fu = funds[node_id]
                feats += _one_hot('', STAGES)   # no stage
                feats += _one_hot('', REGIONS)  # no region
                feats.append(0.0)
                feats.append(0.0)
                feats.append(0.0)
                feats.append(_normalize(fu['deployed_m'], max_deployed))
            elif ntype == 'graph_fund' and node_id in graph_funds:
                feats += _one_hot('', STAGES)
                feats += _one_hot('', REGIONS)
                feats += [0.0, 0.0, 0.0, 0.0]
            elif ntype == 'accelerator' and node_id in accelerators:
                a = accelerators[node_id]
                feats += _one_hot('', STAGES)
                feats += _one_hot(a['region'] or '', REGIONS)
                feats += [0.0, 0.0, 0.0, 0.0]
            elif ntype == 'ecosystem_org' and node_id in ecosystem_orgs:
                eo = ecosystem_orgs[node_id]
                feats += _one_hot('', STAGES)
                feats += _one_hot(eo['region'] or '', REGIONS)
                feats += [0.0, 0.0, 0.0, 0.0]
            else:
                # Person, external, or unknown — zero-pad
                feats += [0.0] * (len(STAGES) + len(REGIONS) + 4)

            assert len(feats) == FEAT_DIM, f"Feature dim mismatch: {len(feats)} != {FEAT_DIM}"
            return feats

        # Write node_features.csv
        feat_header = ['node_idx'] + [f'feat_{i}' for i in range(FEAT_DIM)]
        with open(os.path.join(output_dir, 'node_features.csv'), 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(feat_header)
            for node_id, idx in sorted(node_map.items(), key=lambda kv: kv[1]):
                writer.writerow([idx] + _build_features(node_id))

        print(f"  node_features.csv: {len(node_map)} rows x {FEAT_DIM} features")

        # ------------------------------------------------------------------
        # 3. Export temporal edges
        #    Only edges with event_date are useful for temporal training.
        #    Ordered by event_date ASC (causal ordering for TGN).
        # ------------------------------------------------------------------
        edges = await conn.fetch("""
            SELECT source_id, target_id, rel, event_date, event_year,
                   matching_score
            FROM graph_edges
            WHERE event_date IS NOT NULL
            ORDER BY event_date ASC
        """)

        # Build relationship type vocabulary
        rel_types = sorted(set(r['rel'] for r in edges))
        rel_map = {r: i for i, r in enumerate(rel_types)}

        with open(os.path.join(output_dir, 'temporal_edges.csv'), 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['source', 'target', 'timestamp', 'rel_idx', 'matching_score'])
            skipped = 0
            for e in edges:
                src = node_map.get(e['source_id'])
                tgt = node_map.get(e['target_id'])
                if src is None or tgt is None:
                    skipped += 1
                    continue
                ts = int(e['event_date'].timestamp()) if hasattr(e['event_date'], 'timestamp') else 0
                writer.writerow([
                    src,
                    tgt,
                    ts,
                    rel_map.get(e['rel'], 0),
                    float(e['matching_score'] or 0),
                ])

        if skipped:
            print(f"  (skipped {skipped} edges with unmapped nodes)")

        print(f"  temporal_edges.csv: {len(edges)} edges, {len(rel_types)} relation types")

        # ------------------------------------------------------------------
        # 4. Export metadata
        # ------------------------------------------------------------------
        dated_edges = [e for e in edges if e['event_date'] is not None]
        meta = {
            'num_nodes': len(node_map),
            'num_edges': len(edges),
            'num_node_features': FEAT_DIM,
            'num_rel_types': len(rel_types),
            'rel_types': rel_types,
            'rel_map': rel_map,
            'node_types': NODE_TYPES,
            'stages': STAGES,
            'regions': REGIONS,
            'exported_at': datetime.now().isoformat(),
            'date_range': {
                'min': str(min(e['event_date'] for e in dated_edges)) if dated_edges else None,
                'max': str(max(e['event_date'] for e in dated_edges)) if dated_edges else None,
            },
        }
        with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
            json.dump(meta, f, indent=2)

        print(f"  metadata.json written")
        print(f"\nExport complete: {len(edges)} temporal edges, {len(node_map)} nodes")
        print(f"Output directory: {output_dir}/")

    finally:
        await conn.close()


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    import asyncio

    db_url = os.environ.get(
        'DATABASE_URL',
        'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel',
    )
    print(f"Exporting temporal data from: {db_url.split('@')[1]}")
    asyncio.run(export_temporal_data(db_url))
