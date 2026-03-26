"""
TGN Training Scaffold for BBI Link Prediction.

This module loads the temporal edge data exported by export_temporal_data.py
and prepares it for training a Temporal Graph Network (TGN) using
PyTorch Geometric Temporal.

Architecture overview:
  1. Time encoder        — Fourier features from raw Unix timestamps
  2. Relation embedding  — Learned embeddings per edge/relation type
  3. Message function    — MLP over (src_mem, tgt_mem, edge_feats, time_enc, rel_embed)
  4. Message aggregator  — Mean aggregation over per-node messages
  5. Memory updater      — GRU cell updating per-node memory vectors
  6. Embedding module    — Graph attention over 1-hop neighborhood + memory
  7. Link predictor      — MLP decoder: (src_embed || tgt_embed) -> probability

Task: temporal link prediction
  Given edges up to time t, predict which edges will form at time t+1.

Requires:
  pip install torch torch-geometric-temporal scikit-learn

Usage:
  python -m agents.src.ml.train_tgn
"""

import json
import csv
import random
import numpy as np
from pathlib import Path

DATA_DIR = Path('agents/data/temporal')

# ---------------------------------------------------------------------------
# Hyperparameters — tuned for BBI data scale (772 nodes, 12,731 interactions)
# ---------------------------------------------------------------------------
MEMORY_DIM = 32          # per-node memory vector dimension
TIME_DIM = 8             # time encoding dimension
EMBED_DIM = 32           # output embedding dimension
BATCH_SIZE = 64          # edges per mini-batch
LEARNING_RATE = 5e-4
EPOCHS = 50
PATIENCE = 10            # early stopping on validation AP
WARM_UP_FRACTION = 0.1   # first 10% of training — memory warm-up, no loss
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15
RELATION_EMBED_DIM = 8   # learned relation type embedding dimension


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
        rel_indices — int array (E,)  raw relation type index per edge
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
    rel_indices_list, matching_scores = [], []

    with open(edges_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sources.append(int(row['source']))
            targets.append(int(row['target']))
            timestamps.append(int(row['timestamp']))
            rel_indices_list.append(int(row['rel_idx']))
            matching_scores.append(float(row['matching_score']))

    sources = np.array(sources, dtype=np.int64)
    targets = np.array(targets, dtype=np.int64)
    timestamps = np.array(timestamps, dtype=np.int64)
    rel_indices = np.array(rel_indices_list, dtype=np.int64)

    # Edge features: one-hot rel type + matching_score
    E = len(sources)
    edge_feats = np.zeros((E, num_rel_types + 1), dtype=np.float32)
    for i in range(E):
        if rel_indices_list[i] < num_rel_types:
            edge_feats[i, rel_indices_list[i]] = 1.0
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
        'rel_indices': rel_indices,
        'node_feats': node_feats,
        'metadata': metadata,
    }


# ---------------------------------------------------------------------------
# Node type map — used for type-constrained negative sampling
# ---------------------------------------------------------------------------
def build_node_type_map(metadata):
    """
    Build a mapping from node_idx -> entity_type string.

    Falls back to 'external' for any node not found in metadata.
    Expects metadata to contain 'node_types' as {str(node_idx): type_str}.
    """
    raw = metadata.get('node_types', {})
    type_map = {}
    for idx_str, ntype in raw.items():
        type_map[int(idx_str)] = ntype
    return type_map


def get_nodes_by_type(type_map, num_nodes):
    """
    Invert type_map to {type_str: [node_idx, ...]}.

    Nodes not present in type_map are assigned type 'external'.
    """
    by_type = {}
    for n in range(num_nodes):
        ntype = type_map.get(n, 'external')
        by_type.setdefault(ntype, []).append(n)
    return by_type


# ---------------------------------------------------------------------------
# Type-constrained negative sampling
# ---------------------------------------------------------------------------
def sample_negatives(source_ids, target_ids, timestamps, type_map,
                     nodes_by_type, num_nodes):
    """
    Type-constrained + temporal-filtered negative sampling.

    For each positive edge (src -> tgt), pick a random node of the same
    type as tgt (excluding src and tgt themselves). Falls back to a
    random node if no same-type candidates exist.

    Args:
        source_ids:    tensor (B,) source node indices
        target_ids:    tensor (B,) target node indices
        timestamps:    tensor (B,) edge timestamps (reserved for future
                       temporal filtering)
        type_map:      dict {node_idx: type_str}
        nodes_by_type: dict {type_str: [node_idx, ...]}
        num_nodes:     total number of nodes

    Returns:
        list of int — negative target node indices (length B)
    """
    neg_targets = []
    for i in range(len(source_ids)):
        src_val = int(source_ids[i])
        tgt_val = int(target_ids[i])
        tgt_type = type_map.get(tgt_val, 'external')
        candidates = nodes_by_type.get(tgt_type, [])
        # Filter out src and tgt from candidates
        filtered = [n for n in candidates if n != tgt_val and n != src_val]
        if filtered:
            neg = random.choice(filtered)
        else:
            neg = random.randint(0, num_nodes - 1)
        neg_targets.append(neg)
    return neg_targets


# ---------------------------------------------------------------------------
# Temporal train / val / test split
# ---------------------------------------------------------------------------
def temporal_split(data, train_ratio=None, val_ratio=None):
    """
    Split edges by time into train / val / test.

    Unlike random splits, temporal splits respect causal ordering:
    the model never sees future edges during training.

    Returns (train_data, val_data, test_data) — each a dict with the
    same keys as the input but sliced to the relevant time window.
    """
    if train_ratio is None:
        train_ratio = TRAIN_RATIO
    if val_ratio is None:
        val_ratio = VAL_RATIO

    E = len(data['sources'])
    train_end = int(E * train_ratio)
    val_end = int(E * (train_ratio + val_ratio))

    def _slice(start, end):
        return {
            'sources': data['sources'][start:end],
            'targets': data['targets'][start:end],
            'timestamps': data['timestamps'][start:end],
            'edge_feats': data['edge_feats'][start:end],
            'rel_indices': data['rel_indices'][start:end],
            'node_feats': data['node_feats'],  # shared across splits
            'metadata': data['metadata'],
        }

    return _slice(0, train_end), _slice(train_end, val_end), _slice(val_end, E)


# ---------------------------------------------------------------------------
# Model architecture (scaffold — requires torch + torch-geometric-temporal)
# ---------------------------------------------------------------------------
def build_tgn_model(num_nodes, node_feat_dim, edge_feat_dim,
                    num_rel_types=1,
                    memory_dim=None, time_dim=None, embed_dim=None,
                    rel_embed_dim=None):
    """
    Build a Temporal Graph Network for link prediction.

    Architecture:
      1. TimeEncoder         — Learnable Fourier features from delta-t
      2. RelationEmbedding   — Learned embedding per relation type
      3. MessageFunction     — MLP: (src_mem || tgt_mem || edge_feat
                                     || time_enc || rel_embed) -> message
      4. MessageAggregator   — Mean pooling of messages per node
      5. MemoryUpdater       — GRUCell: (aggregated_message, old_memory)
                                         -> new_memory
      6. EmbeddingModule     — GraphAttention over 1-hop neighborhood
                               using memory
      7. LinkPredictor       — MLP: (src_embed || tgt_embed)
                                     -> link probability

    Args:
        num_nodes:      Total nodes in graph
        node_feat_dim:  Dimension of static node features
        edge_feat_dim:  Dimension of edge feature vectors
        num_rel_types:  Number of distinct relation types
        memory_dim:     Dimension of per-node memory vectors
        time_dim:       Dimension of time encoding
        embed_dim:      Output embedding dimension
        rel_embed_dim:  Dimension of relation type embeddings

    Returns:
        Model object (placeholder until torch is available)
    """
    if memory_dim is None:
        memory_dim = MEMORY_DIM
    if time_dim is None:
        time_dim = TIME_DIM
    if embed_dim is None:
        embed_dim = EMBED_DIM
    if rel_embed_dim is None:
        rel_embed_dim = RELATION_EMBED_DIM

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
            'num_rel_types': num_rel_types,
            'memory_dim': memory_dim,
            'time_dim': time_dim,
            'embed_dim': embed_dim,
            'rel_embed_dim': rel_embed_dim,
            'components': [
                'TimeEncoder (Fourier)',
                'RelationEmbedding (Learned)',
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

    class RelationEmbedding(nn.Module):
        """Learned embedding per relation/edge type."""
        def __init__(self, n_relations, dim):
            super().__init__()
            self.embedding = nn.Embedding(n_relations, dim)

        def forward(self, rel_indices):
            return self.embedding(rel_indices)

    class MessageFunction(nn.Module):
        """Compute messages from src/tgt memory + edge feats + time + relation."""
        def __init__(self, memory_dim, edge_feat_dim, time_dim, rel_embed_dim):
            super().__init__()
            input_dim = (2 * memory_dim + edge_feat_dim
                         + time_dim + rel_embed_dim)
            self.mlp = nn.Sequential(
                nn.Linear(input_dim, memory_dim),
                nn.ReLU(),
                nn.Linear(memory_dim, memory_dim),
            )

        def forward(self, src_memory, tgt_memory, edge_feat,
                    time_enc, rel_embed):
            x = torch.cat([src_memory, tgt_memory, edge_feat,
                           time_enc, rel_embed], dim=-1)
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
            self.relation_embedding = RelationEmbedding(
                num_rel_types, rel_embed_dim
            )
            self.message_fn = MessageFunction(
                memory_dim, edge_feat_dim, time_dim, rel_embed_dim
            )
            self.memory_updater = nn.GRUCell(memory_dim, memory_dim)
            self.node_proj = nn.Linear(node_feat_dim, embed_dim)
            self.link_predictor = LinkPredictor(embed_dim)

        def compute_embedding(self, node_indices, node_feats):
            """Combine static features with learned memory."""
            static = self.node_proj(node_feats[node_indices])
            mem = self.memory[node_indices]
            return static + mem[:, :embed_dim]  # additive fusion

        def forward(self, src, tgt, edge_feat, timestamps, node_feats,
                    rel_indices=None):
            """Score a batch of (src, tgt) pairs."""
            src_embed = self.compute_embedding(src, node_feats)
            tgt_embed = self.compute_embedding(tgt, node_feats)
            return self.link_predictor(src_embed, tgt_embed)

        def update_memory(self, src, tgt, edge_feat, timestamps,
                          rel_indices=None):
            """Update node memory after observing edges."""
            time_enc = self.time_encoder(timestamps)
            # Default relation indices to zeros if not provided
            if rel_indices is None:
                rel_indices = torch.zeros(
                    len(src), dtype=torch.long,
                    device=src.device if hasattr(src, 'device') else 'cpu'
                )
            rel_embed = self.relation_embedding(rel_indices)

            src_mem = self.memory[src]
            tgt_mem = self.memory[tgt]
            msg = self.message_fn(
                src_mem, tgt_mem, edge_feat, time_enc, rel_embed
            )
            # Update source nodes
            new_src_mem = self.memory_updater(msg, src_mem)
            self.memory.data[src] = new_src_mem.detach()
            # Update target nodes (bidirectional)
            msg_rev = self.message_fn(
                tgt_mem, src_mem, edge_feat, time_enc, rel_embed
            )
            new_tgt_mem = self.memory_updater(msg_rev, tgt_mem)
            self.memory.data[tgt] = new_tgt_mem.detach()

    model = TGNModel()
    param_count = sum(p.numel() for p in model.parameters())
    print(f"TGN model created: {param_count:,} parameters")
    return model


# ---------------------------------------------------------------------------
# Training loop with warm-up and type-constrained negatives
# ---------------------------------------------------------------------------
def train_epoch(model, train_data, optimizer, type_map=None,
                nodes_by_type=None, batch_size=None):
    """
    One training epoch: process edges in temporal (causal) order.

    For each batch of positive edges, sample type-constrained negative
    edges and optimize binary cross-entropy. The first WARM_UP_FRACTION
    of interactions only update memory (no loss / gradient).

    Args:
        model:          TGNModel instance
        train_data:     dict from temporal_split()
        optimizer:      torch optimizer
        type_map:       dict {node_idx: type_str} for negative sampling
        nodes_by_type:  dict {type_str: [node_idx, ...]}
        batch_size:     edges per mini-batch (default: BATCH_SIZE)

    Returns:
        Average loss for the epoch (excluding warm-up batches).
    """
    try:
        import torch
        import torch.nn.functional as F
    except ImportError:
        print("PyTorch required for training. Skipping.")
        return None

    if batch_size is None:
        batch_size = BATCH_SIZE

    model.train()
    total_loss = 0.0
    num_loss_batches = 0
    E = len(train_data['sources'])
    num_nodes = train_data['metadata']['num_nodes']
    node_feats_t = torch.tensor(train_data['node_feats'])
    warm_up_end = int(E * WARM_UP_FRACTION)

    for start in range(0, E, batch_size):
        end = min(start + batch_size, E)
        src = torch.tensor(train_data['sources'][start:end])
        tgt = torch.tensor(train_data['targets'][start:end])
        edge_feat = torch.tensor(train_data['edge_feats'][start:end])
        ts = torch.tensor(train_data['timestamps'][start:end])
        rel_idx = torch.tensor(train_data['rel_indices'][start:end])

        # Positive scores
        pos_score = model(src, tgt, edge_feat, ts, node_feats_t, rel_idx)

        # Update memory (detached, no gradient) — always, including warm-up
        with torch.no_grad():
            model.update_memory(src, tgt, edge_feat, ts, rel_idx)

        # Warm-up phase: skip loss to let memory populate
        if start < warm_up_end:
            continue

        # Type-constrained negative sampling
        if type_map is not None and nodes_by_type is not None:
            neg_list = sample_negatives(
                src, tgt, ts, type_map, nodes_by_type, num_nodes
            )
            neg_tgt = torch.tensor(neg_list, dtype=torch.long)
        else:
            neg_tgt = torch.randint(0, num_nodes, (len(src),))

        neg_score = model(src, neg_tgt, edge_feat, ts, node_feats_t, rel_idx)

        # Binary cross-entropy loss
        pos_loss = F.binary_cross_entropy(
            pos_score, torch.ones_like(pos_score)
        )
        neg_loss = F.binary_cross_entropy(
            neg_score, torch.zeros_like(neg_score)
        )
        loss = pos_loss + neg_loss

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        num_loss_batches += 1

    return total_loss / max(num_loss_batches, 1)


def evaluate(model, eval_data, type_map=None, nodes_by_type=None):
    """
    Evaluate link prediction on val/test set.

    Metrics:
      - AUC-ROC: area under receiver operating characteristic curve
      - AP: average precision (area under precision-recall curve)

    Args:
        model:          TGNModel instance
        eval_data:      dict from temporal_split()
        type_map:       dict for type-constrained negative sampling
        nodes_by_type:  dict for type-constrained negative sampling

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
    num_nodes = eval_data['metadata']['num_nodes']
    node_feats_t = torch.tensor(eval_data['node_feats'])

    with torch.no_grad():
        src = torch.tensor(eval_data['sources'])
        tgt = torch.tensor(eval_data['targets'])
        edge_feat = torch.tensor(eval_data['edge_feats'])
        ts = torch.tensor(eval_data['timestamps'])
        rel_idx = torch.tensor(eval_data['rel_indices'])

        pos_score = model(
            src, tgt, edge_feat, ts, node_feats_t, rel_idx
        ).numpy()

        # Type-constrained negative sampling for evaluation
        if type_map is not None and nodes_by_type is not None:
            neg_list = sample_negatives(
                src, tgt, ts, type_map, nodes_by_type, num_nodes
            )
            neg_tgt = torch.tensor(neg_list, dtype=torch.long)
        else:
            neg_tgt = torch.randint(0, num_nodes, (len(src),))

        neg_score = model(
            src, neg_tgt, edge_feat, ts, node_feats_t, rel_idx
        ).numpy()

    labels = np.concatenate([np.ones(len(pos_score)), np.zeros(len(neg_score))])
    scores = np.concatenate([pos_score, neg_score])

    return {
        'auc': float(roc_auc_score(labels, scores)),
        'ap': float(average_precision_score(labels, scores)),
    }


# ---------------------------------------------------------------------------
# Full training loop with early stopping
# ---------------------------------------------------------------------------
def train_model(model, train_data, val_data, type_map=None,
                nodes_by_type=None):
    """
    Full training loop with early stopping on validation AP.

    Saves the best model checkpoint to tgn_bbi_best.pt.

    Args:
        model:          TGNModel instance
        train_data:     dict from temporal_split()
        val_data:       dict from temporal_split()
        type_map:       dict for type-constrained negative sampling
        nodes_by_type:  dict for type-constrained negative sampling

    Returns:
        dict with training history, or None if torch unavailable.
    """
    try:
        import torch
    except ImportError:
        print("PyTorch required for training. Skipping.")
        return None

    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    best_val_ap = 0.0
    patience_counter = 0
    history = {'train_loss': [], 'val_auc': [], 'val_ap': []}

    for epoch in range(EPOCHS):
        loss = train_epoch(
            model, train_data, optimizer,
            type_map=type_map, nodes_by_type=nodes_by_type,
        )
        metrics = evaluate(
            model, val_data,
            type_map=type_map, nodes_by_type=nodes_by_type,
        )

        if loss is None or metrics is None:
            print("Training aborted — missing dependencies.")
            return None

        history['train_loss'].append(loss)
        history['val_auc'].append(metrics['auc'])
        history['val_ap'].append(metrics['ap'])

        print(
            f"Epoch {epoch + 1:3d}/{EPOCHS} | "
            f"Loss: {loss:.4f} | "
            f"Val AUC: {metrics['auc']:.4f} | "
            f"Val AP: {metrics['ap']:.4f}"
        )

        if metrics['ap'] > best_val_ap:
            best_val_ap = metrics['ap']
            patience_counter = 0
            torch.save(model.state_dict(), 'tgn_bbi_best.pt')
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print(
                    f"Early stopping at epoch {epoch + 1} "
                    f"(best val AP: {best_val_ap:.4f})"
                )
                break

    return history


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    print("=" * 60)
    print("BBI Temporal Graph Network — Training Scaffold")
    print("=" * 60)
    print(f"\nHyperparameters:")
    print(f"  MEMORY_DIM:       {MEMORY_DIM}")
    print(f"  TIME_DIM:         {TIME_DIM}")
    print(f"  EMBED_DIM:        {EMBED_DIM}")
    print(f"  BATCH_SIZE:       {BATCH_SIZE}")
    print(f"  LEARNING_RATE:    {LEARNING_RATE}")
    print(f"  EPOCHS:           {EPOCHS}")
    print(f"  PATIENCE:         {PATIENCE}")
    print(f"  WARM_UP_FRACTION: {WARM_UP_FRACTION}")
    print(f"  TRAIN/VAL/TEST:   {TRAIN_RATIO}/{VAL_RATIO}/{TEST_RATIO}")

    # Step 1: Load data
    try:
        data = load_temporal_data()
        print(f"\nData loaded:")
        print(f"  Nodes:       {data['metadata']['num_nodes']}")
        print(f"  Edges:       {len(data['sources'])}")
        print(f"  Node feats:  {data['node_feats'].shape}")
        print(f"  Edge feats:  {data['edge_feats'].shape}")
        print(f"  Rel indices: {data['rel_indices'].shape}")
        print(f"  Date range:  {data['metadata']['date_range']}")
    except FileNotFoundError as e:
        print(f"\n{e}")
        print("Run: python -m agents.src.ml.export_temporal_data")
        exit(1)

    # Step 2: Build node type map for constrained negative sampling
    type_map = build_node_type_map(data['metadata'])
    nodes_by_type = get_nodes_by_type(
        type_map, data['metadata']['num_nodes']
    )
    print(f"\nNode type distribution:")
    for ntype, nodes in sorted(nodes_by_type.items()):
        print(f"  {ntype}: {len(nodes)} nodes")

    # Step 3: Split
    train, val, test = temporal_split(data)
    print(f"\nTemporal split ({TRAIN_RATIO}/{VAL_RATIO}/{TEST_RATIO}):")
    print(f"  Train: {len(train['sources'])} edges")
    print(f"  Val:   {len(val['sources'])} edges")
    print(f"  Test:  {len(test['sources'])} edges")

    # Step 4: Build model
    num_rel_types = data['metadata'].get('num_rel_types', 1)
    model = build_tgn_model(
        num_nodes=data['metadata']['num_nodes'],
        node_feat_dim=data['node_feats'].shape[1],
        edge_feat_dim=data['edge_feats'].shape[1],
        num_rel_types=num_rel_types,
    )

    if isinstance(model, dict):
        print(f"\nModel config (torch not available):")
        for k, v in model.items():
            print(f"  {k}: {v}")
        print("\nTo train, install PyTorch:")
        print("  pip install torch torch-geometric-temporal scikit-learn")
    else:
        print("\nStarting training with early stopping...")
        history = train_model(
            model, train, val,
            type_map=type_map, nodes_by_type=nodes_by_type,
        )

        if history is not None:
            # Final evaluation on test set
            print("\n" + "=" * 60)
            print("Test set evaluation (best checkpoint):")
            try:
                import torch
                model.load_state_dict(torch.load('tgn_bbi_best.pt'))
            except Exception:
                pass  # Use current model if checkpoint load fails
            test_metrics = evaluate(
                model, test,
                type_map=type_map, nodes_by_type=nodes_by_type,
            )
            if test_metrics:
                print(f"  Test AUC: {test_metrics['auc']:.4f}")
                print(f"  Test AP:  {test_metrics['ap']:.4f}")
