"""
Synchronous temporal data export using psycopg2.

Drop-in replacement for export_temporal_data.py when asyncpg is unavailable
(common on Windows). Produces identical output files.

Usage:
  DATABASE_URL=postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel \
    python agents/src/ml/export_temporal_data_sync.py
"""

import psycopg2
import psycopg2.extras
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
NODE_TYPES = [
    'company', 'fund', 'person', 'external', 'accelerator',
    'ecosystem_org', 'vc_firm', 'angel', 'ssbci_fund',
    'corporation', 'university', 'gov_agency', 'program'
]

# ---------------------------------------------------------------------------
# Impact-type and interaction-type vocabularies for edge features
# ---------------------------------------------------------------------------
IMPACT_TYPES = [
    'capital_flow', 'knowledge_transfer', 'market_access',
    'talent_flow', 'infrastructure', 'regulatory'
]
INTERACTION_TYPES = ['creation', 'persistence', 'dissolution', 'state_change']

# Edge feature layout (16-dim):
#   impact_type one-hot (6) + confidence (1) + weight (1)
#   + data_quality_encoded (1) + bidirectional (1) + time_delta (1)
#   + matching_score (1) + interaction_type one-hot (4) = 16
EDGE_FEAT_DIM = len(IMPACT_TYPES) + 1 + 1 + 1 + 1 + 1 + 1 + len(INTERACTION_TYPES)  # 16

# Train/val/test split ratios
SPLIT_TRAIN = 0.70
SPLIT_VAL = 0.15
SPLIT_TEST = 0.15


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


def _query(cur, sql):
    """Execute a query and return all rows as list of dicts."""
    cur.execute(sql)
    if cur.description is None:
        return []
    cols = [desc[0] for desc in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


# ---------------------------------------------------------------------------
# Main export function
# ---------------------------------------------------------------------------
def export_temporal_data(db_url, output_dir='agents/data/temporal'):
    os.makedirs(output_dir, exist_ok=True)
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    try:
        # ------------------------------------------------------------------
        # 1. Build node mapping  (string ID -> integer index)
        #    Now sourced from mv_interaction_stream for full coverage.
        # ------------------------------------------------------------------
        rows = _query(cur, """
            SELECT DISTINCT id FROM (
                SELECT source_id AS id FROM mv_interaction_stream
                UNION
                SELECT target_id AS id FROM mv_interaction_stream
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
        #   [node_type one-hot (13)]
        #   [stage one-hot (7)]         — companies only, else zeros
        #   [region one-hot (8)]        — companies / accelerators / ecosystem_orgs
        #   [funding_m normalized (1)]  — companies
        #   [momentum normalized (1)]   — companies
        #   [employees normalized (1)]  — companies
        #   [deployed_m normalized (1)] — funds
        #   [pagerank normalized (1)]   — from graph_metrics_cache
        #   [betweenness normalized (1)] — from graph_metrics_cache
        #   [community_id encoded (1)]  — from graph_metrics_cache
        #   --- padding to reach target dim ---
        #   [reserved (5)]              — future features
        #
        # Total feature dimension: 13+7+8+4+3+5 = 40
        # ------------------------------------------------------------------
        NODE_FEAT_DIM = 40

        # Fetch entity data
        companies = {
            str(r['id']): r for r in _query(cur,
                "SELECT id, stage, sectors, region, funding_m, momentum, employees FROM companies"
            )
        }
        funds = {
            r['id']: r for r in _query(cur,
                "SELECT id, fund_type, deployed_m FROM funds"
            )
        }
        graph_funds = {
            r['id']: r for r in _query(cur,
                "SELECT id, fund_type FROM graph_funds"
            )
        }
        people = set(
            r['id'] for r in _query(cur, "SELECT id FROM people")
        )
        externals = set(
            r['id'] for r in _query(cur, "SELECT id FROM externals")
        )
        accelerators = {
            r['id']: r for r in _query(cur,
                "SELECT id, region FROM accelerators"
            )
        }
        ecosystem_orgs = {
            r['id']: r for r in _query(cur,
                "SELECT id, region FROM ecosystem_orgs"
            )
        }

        # Fetch graph metrics (pagerank, betweenness, community_id)
        graph_metrics = {}
        try:
            gm_rows = _query(cur, """
                SELECT node_id, pagerank, betweenness, community_id
                FROM graph_metrics_cache
            """)
            graph_metrics = {r['node_id']: r for r in gm_rows}
        except Exception:
            conn.rollback()
            print("  (graph_metrics_cache not available, using zeros)")

        # Normalization ceilings
        max_funding = max((float(c['funding_m'] or 0) for c in companies.values()), default=1)
        max_momentum = 100.0
        max_employees = max((float(c['employees'] or 0) for c in companies.values()), default=1)
        max_deployed = max((float(f['deployed_m'] or 0) for f in funds.values()), default=1)
        max_pagerank = max((float(m.get('pagerank') or 0) for m in graph_metrics.values()), default=1)
        max_betweenness = max((float(m.get('betweenness') or 0) for m in graph_metrics.values()), default=1)
        max_community = max((int(m.get('community_id') or 0) for m in graph_metrics.values()), default=1)

        def _classify_node(node_id):
            """Determine node type from entity tables."""
            if node_id in companies:
                return 'company'
            if node_id in funds:
                return 'fund'
            if node_id in graph_funds:
                return 'fund'
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
            feats = _one_hot(ntype, NODE_TYPES)  # 13

            if ntype == 'company' and node_id in companies:
                c = companies[node_id]
                feats += _one_hot(c['stage'], STAGES)          # 7
                feats += _one_hot(c['region'], REGIONS)        # 8
                feats.append(_normalize(c['funding_m'], max_funding))
                feats.append(_normalize(c['momentum'], max_momentum))
                feats.append(_normalize(c['employees'], max_employees))
                feats.append(0.0)  # deployed_m placeholder
            elif ntype == 'fund' and node_id in funds:
                fu = funds[node_id]
                feats += _one_hot('', STAGES)
                feats += _one_hot('', REGIONS)
                feats.append(0.0)
                feats.append(0.0)
                feats.append(0.0)
                feats.append(_normalize(fu['deployed_m'], max_deployed))
            elif ntype == 'fund' and node_id in graph_funds:
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

            # Graph metrics: pagerank, betweenness, community_id (3 dims)
            gm = graph_metrics.get(node_id, {})
            feats.append(_normalize(gm.get('pagerank', 0), max_pagerank))
            feats.append(_normalize(gm.get('betweenness', 0), max_betweenness))
            feats.append(_normalize(gm.get('community_id', 0), max_community))

            # Padding to reach NODE_FEAT_DIM (5 reserved dims)
            current_len = len(feats)
            if current_len < NODE_FEAT_DIM:
                feats += [0.0] * (NODE_FEAT_DIM - current_len)

            assert len(feats) == NODE_FEAT_DIM, \
                f"Feature dim mismatch: {len(feats)} != {NODE_FEAT_DIM}"
            return feats

        # Write node_features.csv
        feat_header = ['node_idx'] + [f'feat_{i}' for i in range(NODE_FEAT_DIM)]
        with open(os.path.join(output_dir, 'node_features.csv'), 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(feat_header)
            for node_id, idx in sorted(node_map.items(), key=lambda kv: kv[1]):
                writer.writerow([idx] + _build_features(node_id))

        print(f"  node_features.csv: {len(node_map)} rows x {NODE_FEAT_DIM} features")

        # ------------------------------------------------------------------
        # 3. Export temporal edges from mv_interaction_stream
        # ------------------------------------------------------------------
        edges = _query(cur, """
            SELECT source_id, target_id, event_time, rel, interaction_type,
                   edge_id, confidence, weight, impact_type, edge_category
            FROM mv_interaction_stream
            ORDER BY event_time ASC
        """)

        # Build relationship type vocabulary
        rel_types = sorted(set(r['rel'] for r in edges if r['rel']))
        rel_map = {r: i for i, r in enumerate(rel_types)}

        # Compute time deltas for edge features
        timestamps = []
        for e in edges:
            if e['event_time'] and hasattr(e['event_time'], 'timestamp'):
                timestamps.append(int(e['event_time'].timestamp()))
            else:
                timestamps.append(0)
        min_ts = min(timestamps) if timestamps else 0
        max_ts = max(timestamps) if timestamps else 1
        ts_range = max(max_ts - min_ts, 1)

        def _build_edge_features(edge, ts_val):
            """Build 16-dim edge feature vector."""
            feats = _one_hot(edge.get('impact_type') or '', IMPACT_TYPES)  # 6
            feats.append(float(edge.get('confidence') or 0))               # 1
            feats.append(float(edge.get('weight') or 0))                   # 1
            # data_quality_encoded: use confidence as proxy (0-1)
            feats.append(min(float(edge.get('confidence') or 0), 1.0))     # 1
            # bidirectional: 0 or 1 — default 0 (could be enriched later)
            feats.append(0.0)                                              # 1
            # time_delta normalized
            feats.append((ts_val - min_ts) / ts_range if ts_range else 0)  # 1
            # matching_score (from edge weight as proxy)
            feats.append(float(edge.get('weight') or 0))                   # 1
            # interaction_type one-hot
            feats += _one_hot(edge.get('interaction_type') or '', INTERACTION_TYPES)  # 4
            return feats

        # Write temporal_edges.csv with edge features
        edge_header = (
            ['source', 'target', 'timestamp', 'rel_idx']
            + [f'efeat_{i}' for i in range(EDGE_FEAT_DIM)]
        )
        with open(os.path.join(output_dir, 'temporal_edges.csv'), 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(edge_header)
            skipped = 0
            written = 0
            for i, e in enumerate(edges):
                src = node_map.get(e['source_id'])
                tgt = node_map.get(e['target_id'])
                if src is None or tgt is None:
                    skipped += 1
                    continue
                ts = timestamps[i]
                ef = _build_edge_features(e, ts)
                writer.writerow([src, tgt, ts, rel_map.get(e['rel'], 0)] + ef)
                written += 1

        if skipped:
            print(f"  (skipped {skipped} edges with unmapped nodes)")

        print(f"  temporal_edges.csv: {written} interactions, "
              f"{len(rel_types)} relation types, {EDGE_FEAT_DIM}-dim edge features")

        # ------------------------------------------------------------------
        # 4. Compute train/val/test split indices
        # ------------------------------------------------------------------
        n_edges = written
        train_end = int(n_edges * SPLIT_TRAIN)
        val_end = int(n_edges * (SPLIT_TRAIN + SPLIT_VAL))

        split_info = {
            'train': {'start': 0, 'end': train_end, 'ratio': SPLIT_TRAIN},
            'val': {'start': train_end, 'end': val_end, 'ratio': SPLIT_VAL},
            'test': {'start': val_end, 'end': n_edges, 'ratio': SPLIT_TEST},
        }

        # ------------------------------------------------------------------
        # 5. Export metadata
        # ------------------------------------------------------------------
        dated_edges = [e for e in edges if e.get('event_time') is not None]
        ts_values = [
            e['event_time'] for e in dated_edges
            if e['event_time'] is not None
        ]

        meta = {
            'node_types': len(NODE_TYPES),
            'edge_feature_dim': EDGE_FEAT_DIM,
            'node_feature_dim': NODE_FEAT_DIM,
            'interaction_count': written,
            'unique_nodes': len(node_map),
            'relation_types': rel_types,
            'impact_types': IMPACT_TYPES,
            'interaction_types': INTERACTION_TYPES,
            'temporal_range': {
                'start': str(min(ts_values)) if ts_values else None,
                'end': str(max(ts_values)) if ts_values else None,
            },
            'split': {
                'train': SPLIT_TRAIN,
                'val': SPLIT_VAL,
                'test': SPLIT_TEST,
            },
            'split_indices': split_info,
            'rel_map': rel_map,
            'node_type_vocab': NODE_TYPES,
            'stages': STAGES,
            'regions': REGIONS,
            'exported_at': datetime.now().isoformat(),
        }
        with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
            json.dump(meta, f, indent=2, default=str)

        print(f"  metadata.json written")
        print(f"\nExport complete: {written} temporal interactions, "
              f"{len(node_map)} nodes")
        print(f"  Node features: {NODE_FEAT_DIM}-dim | "
              f"Edge features: {EDGE_FEAT_DIM}-dim")
        print(f"  Split: train={train_end} / val={val_end - train_end} / "
              f"test={n_edges - val_end}")
        print(f"Output directory: {output_dir}/")

        return meta

    finally:
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    db_url = os.environ.get(
        'DATABASE_URL',
        'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel',
    )
    print(f"Exporting temporal data from: {db_url.split('@')[1]}")
    export_temporal_data(db_url)
