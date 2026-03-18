"""
TGN Training Scaffold for BBI Link Prediction.

This module loads the temporal edge data exported by export_temporal_data.py
and prepares it for training a Temporal Graph Network (TGN) using
PyTorch Geometric Temporal.

Architecture overview:
  1. Time encoder      — Fourier features from raw Unix timestamps
  2. Message function   — MLP over (source_embed, target_embed, edge_feats, time_enc)
  3. Message aggregator — Mean aggregation over per-node messages
  4. Memory updater     — GRU cell updating per-node memory vectors
  5. Embedding module   — Graph attention over 1-hop neighborhood + memory
  6. Link predictor     — MLP decoder: (src_embed || tgt_embed) -> probability

Task: temporal link prediction
  Given edges up to time t, predict which edges will form at time t+1.

Requires:
  pip install torch torch-geometric-temporal scikit-learn

Usage:
  python -m agents.src.ml.train_tgn
"""

import json
import csv
import numpy as np
from pathlib import Path

DATA_DIR = Path('agents/data/temporal')


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------
def load_temporal_data():
    """
    Load exported CSV files into numpy arrays suitable for TGN.

    Returns dict with keys:
        sources     — int array (E,)  source node indices
        targets     — int array (E,)  target node indices
        timestamps  — int array (E,)  Unix timestamps (sorted ascending)
        edge_feats  — float array (E, D_edge)  rel_idx one-hot + matching_score
        node_feats  — float array (N, D_node)  from node_features.csv
        metadata    — dict from metadata.json
    """
    meta_path = DATA_DIR / 'metadata.json'
    edges_path = DATA_DIR / 'temporal_edges.csv'
    nodes_path = DATA_DIR / 'node_features.csv'

    if not meta_path.exists():
        raise FileNotFoundError(
            f"No exported data found at {DATA_DIR}. "
            "Run export_temporal_data.py first."
        )

    with open(meta_path) as f:
        metadata = json.load(f)

    num_rel_types = metadata['num_rel_types']

    # Load temporal edges
    sources, targets, timestamps = [], [], []
    rel_indices, matching_scores = [], []

    with open(edges_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sources.append(int(row['source']))
            targets.append(int(row['target']))
            timestamps.append(int(row['timestamp']))
            rel_indices.append(int(row['rel_idx']))
            matching_scores.append(float(row['matching_score']))

    sources = np.array(sources, dtype=np.int64)
    targets = np.array(targets, dtype=np.int64)
    timestamps = np.array(timestamps, dtype=np.int64)

    # Edge features: one-hot rel type + matching_score
    E = len(sources)
    edge_feats = np.zeros((E, num_rel_types + 1), dtype=np.float32)
    for i in range(E):
        if rel_indices[i] < num_rel_types:
            edge_feats[i, rel_indices[i]] = 1.0
        edge_feats[i, -1] = matching_scores[i]

    # Load node features
    node_feats = []
    with open(nodes_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            feats = [float(row[k]) for k in sorted(row.keys()) if k != 'node_idx']
            node_feats.append(feats)
    node_feats = np.array(node_feats, dtype=np.float32)

    return {
        'sources': sources,
        'targets': targets,
        'timestamps': timestamps,
        'edge_feats': edge_feats,
        'node_feats': node_feats,
        'metadata': metadata,
    }


# ---------------------------------------------------------------------------
# Temporal train / val / test split
# ---------------------------------------------------------------------------
def temporal_split(data, train_ratio=0.80, val_ratio=0.10):
    """
    Split edges by time into train / val / test.

    Unlike random splits, temporal splits respect causal ordering:
    the model never sees future edges during training.

    Returns (train_data, val_data, test_data) — each a dict with the
    same keys as the input but sliced to the relevant time window.
    """
    E = len(data['sources'])
    train_end = int(E * train_ratio)
    val_end = int(E * (train_ratio + val_ratio))

    def _slice(start, end):
        return {
            'sources': data['sources'][start:end],
            'targets': data['targets'][start:end],
            'timestamps': data['timestamps'][start:end],
            'edge_feats': data['edge_feats'][start:end],
            'node_feats': data['node_feats'],  # shared across splits
            'metadata': data['metadata'],
        }

    return _slice(0, train_end), _slice(train_end, val_end), _slice(val_end, E)


# ---------------------------------------------------------------------------
# Model architecture (scaffold — requires torch + torch-geometric-temporal)
# ---------------------------------------------------------------------------
def build_tgn_model(num_nodes, node_feat_dim, edge_feat_dim, memory_dim=64, time_dim=16, embed_dim=64):
    """
    Build a Temporal Graph Network for link prediction.

    Architecture:
      1. TimeEncoder         — Learnable Fourier features from delta-t
      2. MessageFunction     — MLP: (src_memory || tgt_memory || edge_feat || time_enc) -> message
      3. MessageAggregator   — Mean pooling of messages per node
      4. MemoryUpdater       — GRUCell: (aggregated_message, old_memory) -> new_memory
      5. EmbeddingModule     — GraphAttention over 1-hop neighborhood using memory
      6. LinkPredictor       — MLP: (src_embed || tgt_embed) -> link probability

    Args:
        num_nodes:      Total nodes in graph
        node_feat_dim:  Dimension of static node features
        edge_feat_dim:  Dimension of edge feature vectors
        memory_dim:     Dimension of per-node memory vectors
        time_dim:       Dimension of time encoding
        embed_dim:      Output embedding dimension

    Returns:
        Model object (placeholder until torch is available)
    """
    try:
        import torch
        import torch.nn as nn
    except ImportError:
        print("PyTorch not installed. Returning model config dict.")
        return {
            'architecture': 'TGN',
            'num_nodes': num_nodes,
            'node_feat_dim': node_feat_dim,
            'edge_feat_dim': edge_feat_dim,
            'memory_dim': memory_dim,
            'time_dim': time_dim,
            'embed_dim': embed_dim,
            'components': [
                'TimeEncoder (Fourier)',
                'MessageFunction (MLP)',
                'MessageAggregator (Mean)',
                'MemoryUpdater (GRU)',
                'EmbeddingModule (GraphAttention)',
                'LinkPredictor (MLP)',
            ],
        }

    class TimeEncoder(nn.Module):
        """Learnable Fourier time features."""
        def __init__(self, dim):
            super().__init__()
            self.w = nn.Linear(1, dim)
            # Initialize frequencies with different scales
            nn.init.xavier_uniform_(self.w.weight)

        def forward(self, t):
            # t: (batch,) -> (batch, dim)
            t = t.unsqueeze(-1).float()
            return torch.cos(self.w(t))

    class MessageFunction(nn.Module):
        """Compute messages from source/target memory + edge features + time."""
        def __init__(self, memory_dim, edge_feat_dim, time_dim):
            super().__init__()
            input_dim = 2 * memory_dim + edge_feat_dim + time_dim
            self.mlp = nn.Sequential(
                nn.Linear(input_dim, memory_dim),
                nn.ReLU(),
                nn.Linear(memory_dim, memory_dim),
            )

        def forward(self, src_memory, tgt_memory, edge_feat, time_enc):
            x = torch.cat([src_memory, tgt_memory, edge_feat, time_enc], dim=-1)
            return self.mlp(x)

    class LinkPredictor(nn.Module):
        """MLP decoder: (src_embed || tgt_embed) -> link probability."""
        def __init__(self, embed_dim):
            super().__init__()
            self.mlp = nn.Sequential(
                nn.Linear(2 * embed_dim, embed_dim),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(embed_dim, 1),
            )

        def forward(self, src_embed, tgt_embed):
            x = torch.cat([src_embed, tgt_embed], dim=-1)
            return torch.sigmoid(self.mlp(x)).squeeze(-1)

    class TGNModel(nn.Module):
        """Full TGN model for temporal link prediction."""
        def __init__(self):
            super().__init__()
            self.memory = nn.Parameter(
                torch.zeros(num_nodes, memory_dim), requires_grad=False
            )
            self.time_encoder = TimeEncoder(time_dim)
            self.message_fn = MessageFunction(memory_dim, edge_feat_dim, time_dim)
            self.memory_updater = nn.GRUCell(memory_dim, memory_dim)
            self.node_proj = nn.Linear(node_feat_dim, embed_dim)
            self.link_predictor = LinkPredictor(embed_dim)

        def compute_embedding(self, node_indices, node_feats):
            """Combine static features with learned memory."""
            static = self.node_proj(node_feats[node_indices])
            mem = self.memory[node_indices]
            return static + mem[:, :embed_dim]  # additive fusion

        def forward(self, src, tgt, edge_feat, timestamps, node_feats):
            """Score a batch of (src, tgt) pairs."""
            src_embed = self.compute_embedding(src, node_feats)
            tgt_embed = self.compute_embedding(tgt, node_feats)
            return self.link_predictor(src_embed, tgt_embed)

        def update_memory(self, src, tgt, edge_feat, timestamps):
            """Update node memory after observing edges (call after forward)."""
            time_enc = self.time_encoder(timestamps)
            src_mem = self.memory[src]
            tgt_mem = self.memory[tgt]
            msg = self.message_fn(src_mem, tgt_mem, edge_feat, time_enc)
            # Update source nodes
            new_src_mem = self.memory_updater(msg, src_mem)
            self.memory.data[src] = new_src_mem.detach()
            # Update target nodes (bidirectional)
            msg_rev = self.message_fn(tgt_mem, src_mem, edge_feat, time_enc)
            new_tgt_mem = self.memory_updater(msg_rev, tgt_mem)
            self.memory.data[tgt] = new_tgt_mem.detach()

    model = TGNModel()
    print(f"TGN model created: {sum(p.numel() for p in model.parameters()):,} parameters")
    return model


# ---------------------------------------------------------------------------
# Training loop (scaffold)
# ---------------------------------------------------------------------------
def train_epoch(model, train_data, optimizer, batch_size=200):
    """
    One training epoch: process edges in temporal (causal) order.

    For each batch of positive edges, sample an equal number of negative
    edges (random target replacement) and optimize binary cross-entropy.

    Args:
        model:      TGNModel instance
        train_data: dict from temporal_split()
        optimizer:  torch optimizer
        batch_size: edges per mini-batch

    Returns:
        Average loss for the epoch.
    """
    try:
        import torch
        import torch.nn.functional as F
    except ImportError:
        print("PyTorch required for training. Skipping.")
        return None

    model.train()
    total_loss = 0.0
    num_batches = 0
    E = len(train_data['sources'])
    node_feats_t = torch.tensor(train_data['node_feats'])

    for start in range(0, E, batch_size):
        end = min(start + batch_size, E)
        src = torch.tensor(train_data['sources'][start:end])
        tgt = torch.tensor(train_data['targets'][start:end])
        edge_feat = torch.tensor(train_data['edge_feats'][start:end])
        ts = torch.tensor(train_data['timestamps'][start:end])

        # Positive scores
        pos_score = model(src, tgt, edge_feat, ts, node_feats_t)

        # Negative sampling: random target replacement
        neg_tgt = torch.randint(0, train_data['metadata']['num_nodes'], (len(src),))
        neg_score = model(src, neg_tgt, edge_feat, ts, node_feats_t)

        # Binary cross-entropy loss
        pos_loss = F.binary_cross_entropy(pos_score, torch.ones_like(pos_score))
        neg_loss = F.binary_cross_entropy(neg_score, torch.zeros_like(neg_score))
        loss = pos_loss + neg_loss

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Update memory (detached, no gradient)
        with torch.no_grad():
            model.update_memory(src, tgt, edge_feat, ts)

        total_loss += loss.item()
        num_batches += 1

    return total_loss / max(num_batches, 1)


def evaluate(model, eval_data):
    """
    Evaluate link prediction on val/test set.

    Metrics:
      - AUC-ROC: area under receiver operating characteristic curve
      - AP: average precision (area under precision-recall curve)

    Args:
        model:     TGNModel instance
        eval_data: dict from temporal_split()

    Returns:
        dict with 'auc' and 'ap' scores, or None if torch unavailable.
    """
    try:
        import torch
        from sklearn.metrics import roc_auc_score, average_precision_score
    except ImportError:
        print("PyTorch + scikit-learn required for evaluation. Skipping.")
        return None

    model.eval()
    node_feats_t = torch.tensor(eval_data['node_feats'])

    with torch.no_grad():
        src = torch.tensor(eval_data['sources'])
        tgt = torch.tensor(eval_data['targets'])
        edge_feat = torch.tensor(eval_data['edge_feats'])
        ts = torch.tensor(eval_data['timestamps'])

        pos_score = model(src, tgt, edge_feat, ts, node_feats_t).numpy()

        neg_tgt = torch.randint(0, eval_data['metadata']['num_nodes'], (len(src),))
        neg_score = model(src, neg_tgt, edge_feat, ts, node_feats_t).numpy()

    labels = np.concatenate([np.ones(len(pos_score)), np.zeros(len(neg_score))])
    scores = np.concatenate([pos_score, neg_score])

    return {
        'auc': float(roc_auc_score(labels, scores)),
        'ap': float(average_precision_score(labels, scores)),
    }


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    print("=" * 60)
    print("BBI Temporal Graph Network — Training Scaffold")
    print("=" * 60)

    # Step 1: Load data
    try:
        data = load_temporal_data()
        print(f"\nData loaded:")
        print(f"  Nodes:       {data['metadata']['num_nodes']}")
        print(f"  Edges:       {len(data['sources'])}")
        print(f"  Node feats:  {data['node_feats'].shape}")
        print(f"  Edge feats:  {data['edge_feats'].shape}")
        print(f"  Date range:  {data['metadata']['date_range']}")
    except FileNotFoundError as e:
        print(f"\n{e}")
        print("Run: python -m agents.src.ml.export_temporal_data")
        exit(1)

    # Step 2: Split
    train, val, test = temporal_split(data)
    print(f"\nTemporal split:")
    print(f"  Train: {len(train['sources'])} edges")
    print(f"  Val:   {len(val['sources'])} edges")
    print(f"  Test:  {len(test['sources'])} edges")

    # Step 3: Build model
    model = build_tgn_model(
        num_nodes=data['metadata']['num_nodes'],
        node_feat_dim=data['node_feats'].shape[1],
        edge_feat_dim=data['edge_feats'].shape[1],
    )

    if isinstance(model, dict):
        print(f"\nModel config (torch not available):")
        for k, v in model.items():
            print(f"  {k}: {v}")
        print("\nTo train, install PyTorch:")
        print("  pip install torch torch-geometric-temporal scikit-learn")
    else:
        print("\nModel ready for training.")
        print("Next steps:")
        print("  1. Create optimizer:  optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)")
        print("  2. Training loop:     loss = train_epoch(model, train, optimizer)")
        print("  3. Evaluate:          metrics = evaluate(model, val)")
        print("  4. Save checkpoint:   torch.save(model.state_dict(), 'tgn_bbi_v1.pt')")
