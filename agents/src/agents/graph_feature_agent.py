"""Graph feature engineering agent -- computes temporal graph snapshots,
node features, clustering, and embeddings.

Loads graph_edges into a NetworkX DiGraph, computes structural and community
features for each temporal snapshot (by event_year), runs k-means clustering
on the latest snapshot, and persists results to graph_metrics_temporal,
node_embeddings, and clustering_results tables.
"""

import json
import logging
import time
import uuid
from datetime import date
from typing import Optional

import networkx as nx
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from .base_model_agent import BaseModelAgent
from .status import AgentStatus

logger = logging.getLogger(__name__)

# Stage one-hot encoding order (matches project convention)
STAGE_ORDER = [
    "pre_seed", "seed", "series_a", "series_b",
    "series_c_plus", "growth", "public",
]


class GraphFeatureAgent(BaseModelAgent):
    """Computes temporal graph features, node embeddings, and k-means clusters.

    Extends BaseModelAgent with agent_type = "graph_feature_engineer".

    Pipeline:
        1. Load full graph from graph_edges into a NetworkX DiGraph.
        2. Compute temporal snapshots by filtering edges where event_year <= year.
        3. For each snapshot, compute structural features (degree, pagerank, etc.),
           community labels, and merge node attribute features from entity tables.
        4. Build standardized feature matrices per snapshot.
        5. Run k-means clustering (k=3..8, best by silhouette) on the latest snapshot.
        6. Persist: graph_metrics_temporal, node_embeddings, clustering_results.
        7. Register model in the models table.
    """

    agent_type = "graph_feature_engineer"

    def __init__(self):
        super().__init__("graph_feature_engineer", model_version="1.0.0")

    # ------------------------------------------------------------------
    # Main run method
    # ------------------------------------------------------------------

    async def run(self, pool, **kwargs):
        """Run the graph feature engineering pipeline.

        Kwargs:
            snapshot_years: Optional list[int] of years to compute snapshots for.
                If not provided, all distinct event_years in graph_edges are used.

        Returns:
            dict with summary statistics (node_count, edge_count, snapshots,
            best_k, silhouette_score, embeddings_saved, etc.).
        """
        _t0 = time.perf_counter()
        snapshot_years: Optional[list[int]] = kwargs.get("snapshot_years")

        # Step 1: Register model
        logger.info("Registering model in models table.")
        await self.register_model(
            pool,
            name="graph_feature_engineer_v1",
            objective=(
                "Temporal graph feature extraction, node embeddings, "
                "and k-means clustering over the ecosystem graph"
            ),
            input_vars=[
                "graph_edges", "companies", "funds", "universities",
            ],
            output_vars=[
                "degree", "in_degree", "out_degree", "pagerank",
                "betweenness_centrality", "clustering_coefficient",
                "community_label", "funding_m", "employees", "momentum",
                "stage_onehot", "sector_count", "region",
                "kmeans_cluster", "node_embedding",
            ],
        )

        # Step 2: Load full graph
        logger.info("Loading graph edges from database.")
        graph, all_years = await self._load_graph(pool)
        total_nodes = graph.number_of_nodes()
        total_edges = graph.number_of_edges()
        logger.info(
            "Full graph loaded: %d nodes, %d edges.", total_nodes, total_edges
        )

        if total_nodes == 0:
            logger.warning("Graph is empty — nothing to compute.")
            return {
                "status": AgentStatus.NO_DATA,
                "node_count": 0,
                "edge_count": 0,
            }

        # Determine snapshot years
        if snapshot_years is None:
            snapshot_years = sorted(all_years)
        else:
            snapshot_years = sorted(snapshot_years)
        logger.info("Snapshot years: %s", snapshot_years)

        if not snapshot_years:
            logger.warning("No event_year values found — using full graph only.")
            snapshot_years = [None]

        # Step 3: Load node attributes from entity tables
        logger.info("Loading node attributes from entity tables.")
        node_attrs = await self._load_node_attributes(pool)

        # Step 4: Compute features for each temporal snapshot
        snapshot_frames = {}
        for year in snapshot_years:
            logger.info("Computing features for snapshot year=%s.", year)
            subgraph = self._temporal_subgraph(graph, year)
            if subgraph.number_of_nodes() == 0:
                logger.info("Snapshot year=%s has no nodes, skipping.", year)
                continue
            features_df = self._compute_node_features(subgraph, node_attrs)
            snapshot_frames[year] = features_df

        if not snapshot_frames:
            logger.warning("No snapshots produced any features.")
            return {
                "status": AgentStatus.INSUFFICIENT_DATA,
                "node_count": total_nodes,
                "edge_count": total_edges,
                "snapshots": 0,
            }

        # Step 5: Standardize feature matrices
        logger.info("Standardizing feature matrices.")
        standardized_frames = {}
        scalers = {}
        for year, df in snapshot_frames.items():
            std_df, scaler = self._standardize_features(df)
            standardized_frames[year] = std_df
            scalers[year] = scaler

        # Step 6: K-means clustering on the latest snapshot
        latest_year = max(standardized_frames.keys())
        latest_df = standardized_frames[latest_year]
        logger.info(
            "Running k-means clustering on latest snapshot (year=%s, %d nodes).",
            latest_year, len(latest_df),
        )
        best_k, best_score, cluster_labels = self._run_kmeans(latest_df)
        logger.info(
            "Best k=%d with silhouette=%.4f.", best_k, best_score
        )

        # Step 7: Persist results
        logger.info("Saving temporal graph metrics.")
        metrics_saved = await self._save_temporal_metrics(
            pool, snapshot_frames
        )

        logger.info("Saving node embeddings for latest snapshot.")
        embeddings_saved = await self._save_node_embeddings(
            pool, latest_df, latest_year
        )

        logger.info("Saving clustering results.")
        clusters_saved = await self._save_clustering_results(
            pool, cluster_labels, best_k, best_score, latest_year
        )

        elapsed = time.perf_counter() - _t0
        result = {
            "status": AgentStatus.COMPLETED,
            "node_count": total_nodes,
            "edge_count": total_edges,
            "snapshots": len(snapshot_frames),
            "snapshot_years": list(snapshot_frames.keys()),
            "latest_year": latest_year,
            "best_k": best_k,
            "silhouette_score": round(best_score, 4),
            "metrics_saved": metrics_saved,
            "embeddings_saved": embeddings_saved,
            "clusters_saved": clusters_saved,
            "elapsed_s": round(elapsed, 2),
        }
        logger.info("GraphFeatureAgent completed: %s", result)
        return result

    # ------------------------------------------------------------------
    # Graph loading
    # ------------------------------------------------------------------

    async def _load_graph(self, pool) -> tuple[nx.DiGraph, set[int]]:
        """Load all graph_edges into a NetworkX DiGraph.

        Returns:
            (DiGraph, set of distinct event_year values found)
        """
        rows = await pool.fetch(
            """SELECT source_id, target_id, rel, event_year, weight,
                      matching_score, note
               FROM graph_edges"""
        )

        G = nx.DiGraph()
        years = set()

        for row in rows:
            src = row["source_id"]
            tgt = row["target_id"]
            G.add_node(src)
            G.add_node(tgt)

            edge_data = {
                "rel": row["rel"],
                "weight": float(row["weight"]) if row["weight"] is not None else 1.0,
            }
            if row["event_year"] is not None:
                edge_data["event_year"] = int(row["event_year"])
                years.add(int(row["event_year"]))
            if row["matching_score"] is not None:
                edge_data["matching_score"] = float(row["matching_score"])
            if row["note"] is not None:
                edge_data["note"] = row["note"]

            G.add_edge(src, tgt, **edge_data)

        return G, years

    # ------------------------------------------------------------------
    # Temporal subgraph construction
    # ------------------------------------------------------------------

    @staticmethod
    def _temporal_subgraph(G: nx.DiGraph, year: Optional[int]) -> nx.DiGraph:
        """Return a subgraph containing only edges with event_year <= year.

        If year is None, returns the full graph (copy).
        Edges without an event_year are always included.
        """
        if year is None:
            return G.copy()

        sub = nx.DiGraph()
        for u, v, data in G.edges(data=True):
            edge_year = data.get("event_year")
            if edge_year is None or edge_year <= year:
                sub.add_node(u)
                sub.add_node(v)
                sub.add_edge(u, v, **data)

        # Also add isolated nodes that exist in the full graph
        # (they may have attributes even without edges in this window)
        for node in G.nodes():
            if not sub.has_node(node):
                sub.add_node(node)

        return sub

    # ------------------------------------------------------------------
    # Node attribute loading
    # ------------------------------------------------------------------

    async def _load_node_attributes(self, pool) -> dict[str, dict]:
        """Load attributes from companies, funds, and universities tables.

        Returns a dict keyed by node_id (e.g. 'c_123') mapping to attribute dicts.
        """
        attrs = {}

        # Companies
        company_rows = await pool.fetch(
            """SELECT id, funding_m, employees, momentum, stage,
                      sectors, region, status
               FROM companies"""
        )
        for row in company_rows:
            node_id = f"c_{row['id']}"
            attrs[node_id] = {
                "funding_m": float(row["funding_m"]) if row["funding_m"] is not None else np.nan,
                "employees": int(row["employees"]) if row["employees"] is not None else np.nan,
                "momentum": float(row["momentum"]) if row["momentum"] is not None else np.nan,
                "stage": row["stage"],
                "sector_count": len(row["sectors"]) if row["sectors"] else 0,
                "region": row["region"],
                "entity_type": "company",
            }

        # Funds
        fund_rows = await pool.fetch(
            """SELECT id, allocated_m, deployed_m, leverage_ratio
               FROM funds"""
        )
        for row in fund_rows:
            node_id = f"f_{row['id']}"
            attrs[node_id] = {
                "funding_m": float(row["allocated_m"]) if row["allocated_m"] is not None else np.nan,
                "deployed_m": float(row["deployed_m"]) if row["deployed_m"] is not None else np.nan,
                "leverage_ratio": float(row["leverage_ratio"]) if row["leverage_ratio"] is not None else np.nan,
                "entity_type": "fund",
            }

        # Universities
        uni_rows = await pool.fetch(
            """SELECT id, research_budget_m, spinout_count,
                      tech_transfer_office
               FROM universities"""
        )
        for row in uni_rows:
            node_id = f"u_{row['id']}"
            attrs[node_id] = {
                "research_budget_m": float(row["research_budget_m"]) if row["research_budget_m"] is not None else np.nan,
                "spinout_count": int(row["spinout_count"]) if row["spinout_count"] is not None else np.nan,
                "tech_transfer_office": bool(row["tech_transfer_office"]) if row["tech_transfer_office"] is not None else False,
                "entity_type": "university",
            }

        return attrs

    # ------------------------------------------------------------------
    # Feature computation
    # ------------------------------------------------------------------

    def _compute_node_features(
        self, G: nx.DiGraph, node_attrs: dict[str, dict]
    ) -> pd.DataFrame:
        """Compute structural, community, and attribute features for all nodes.

        Returns a DataFrame indexed by node_id with feature columns.
        """
        nodes = list(G.nodes())
        if not nodes:
            return pd.DataFrame()

        # --- Structural features ---
        degree = dict(G.degree())
        in_degree = dict(G.in_degree())
        out_degree = dict(G.out_degree())

        # PageRank (handle disconnected graphs gracefully)
        try:
            pagerank = nx.pagerank(G, max_iter=200, tol=1e-6)
        except nx.PowerIterationFailedConvergence:
            logger.warning("PageRank did not converge; using uniform values.")
            pagerank = {n: 1.0 / len(nodes) for n in nodes}

        # Betweenness centrality (use undirected view for efficiency on large graphs)
        undirected = G.to_undirected()
        betweenness = nx.betweenness_centrality(undirected)

        # Clustering coefficient (on undirected view)
        clustering = nx.clustering(undirected)

        # --- Community detection ---
        community_map = self._detect_communities(undirected)

        # --- Build feature rows ---
        rows = []
        for node in nodes:
            feat = {
                "node_id": node,
                "degree": degree.get(node, 0),
                "in_degree": in_degree.get(node, 0),
                "out_degree": out_degree.get(node, 0),
                "pagerank": pagerank.get(node, 0.0),
                "betweenness_centrality": betweenness.get(node, 0.0),
                "clustering_coefficient": clustering.get(node, 0.0),
                "community_label": community_map.get(node, -1),
            }

            # Merge node attributes if available
            if node in node_attrs:
                na = node_attrs[node]
                feat["funding_m"] = na.get("funding_m", np.nan)
                feat["employees"] = na.get("employees", np.nan)
                feat["momentum"] = na.get("momentum", np.nan)
                feat["sector_count"] = na.get("sector_count", np.nan)

                # One-hot encode stage
                stage = na.get("stage")
                for s in STAGE_ORDER:
                    feat[f"stage_{s}"] = 1.0 if stage == s else 0.0

                # Region as a categorical indicator (hashed to int)
                region = na.get("region")
                feat["region_hash"] = hash(region) % 10000 if region else 0
            else:
                # Fill with NaN for nodes without attributes
                feat["funding_m"] = np.nan
                feat["employees"] = np.nan
                feat["momentum"] = np.nan
                feat["sector_count"] = np.nan
                for s in STAGE_ORDER:
                    feat[f"stage_{s}"] = 0.0
                feat["region_hash"] = 0

            rows.append(feat)

        df = pd.DataFrame(rows).set_index("node_id")
        return df

    @staticmethod
    def _detect_communities(
        G_undirected: nx.Graph,
        target: int = 12,
        target_min: int = 8,
        target_max: int = 15,
    ) -> dict:
        """Detect communities using Louvain with resolution auto-tuning.

        Uses binary search on the resolution parameter to produce ~12
        communities (range 8-15).  Falls back to label propagation only
        if Louvain is entirely unavailable.

        Returns dict mapping node -> community_label (int).
        """
        if G_undirected.number_of_nodes() == 0:
            return {}

        # Try Louvain with resolution tuning
        try:
            best_map: dict = {}
            best_dist = float("inf")
            lo, hi = 0.5, 5.0

            for _ in range(10):
                res = (lo + hi) / 2
                communities = nx.community.louvain_communities(
                    G_undirected, resolution=res, seed=42
                )
                num_c = len(communities)
                dist = abs(num_c - target)
                if dist < best_dist:
                    best_dist = dist
                    best_map = {}
                    for idx, comm in enumerate(communities):
                        for node in comm:
                            best_map[node] = idx

                if target_min <= num_c <= target_max:
                    break
                if num_c < target:
                    lo = res  # more communities -> higher resolution
                else:
                    hi = res

            logger.info(
                "Louvain community detection: %d communities (target ~%d)",
                len(set(best_map.values())),
                target,
            )
            return best_map
        except (AttributeError, Exception) as e:
            logger.info(
                "Louvain not available (%s), falling back to label propagation.",
                e,
            )

        # Fallback: label propagation
        try:
            communities = nx.community.label_propagation_communities(
                G_undirected
            )
            community_map = {}
            for idx, comm in enumerate(communities):
                for node in comm:
                    community_map[node] = idx
            return community_map
        except Exception as e:
            logger.warning("Community detection failed: %s", e)
            return {n: 0 for n in G_undirected.nodes()}

    # ------------------------------------------------------------------
    # Feature standardization
    # ------------------------------------------------------------------

    @staticmethod
    def _standardize_features(
        df: pd.DataFrame,
    ) -> tuple[pd.DataFrame, StandardScaler]:
        """Standardize numeric features using StandardScaler.

        NaN values are imputed with column medians before scaling.
        community_label is excluded from scaling (categorical).

        Returns:
            (standardized DataFrame, fitted StandardScaler)
        """
        # Separate community_label — it's categorical, not scaled
        feature_cols = [c for c in df.columns if c != "community_label"]
        feat_df = df[feature_cols].copy()

        # Impute NaN with column medians
        for col in feat_df.columns:
            median_val = feat_df[col].median()
            if pd.isna(median_val):
                median_val = 0.0
            feat_df[col] = feat_df[col].fillna(median_val)

        scaler = StandardScaler()
        scaled_values = scaler.fit_transform(feat_df.values)

        scaled_df = pd.DataFrame(
            scaled_values, index=df.index, columns=feature_cols
        )
        # Re-attach community_label unscaled
        if "community_label" in df.columns:
            scaled_df["community_label"] = df["community_label"]

        return scaled_df, scaler

    # ------------------------------------------------------------------
    # K-means clustering
    # ------------------------------------------------------------------

    @staticmethod
    def _run_kmeans(
        df: pd.DataFrame, k_range: tuple[int, int] = (3, 9)
    ) -> tuple[int, float, pd.Series]:
        """Run k-means for k in k_range, select best by silhouette score.

        Args:
            df: Standardized feature DataFrame (node_id as index).
            k_range: (min_k, max_k_exclusive). Default tests k=3..8.

        Returns:
            (best_k, best_silhouette_score, Series of cluster labels indexed by node_id)
        """
        # Exclude community_label from clustering features
        cluster_cols = [c for c in df.columns if c != "community_label"]
        X = df[cluster_cols].values

        # Replace any remaining NaN/inf with 0
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

        n_samples = X.shape[0]
        min_k, max_k = k_range

        # Adjust k range if we have fewer samples than max_k
        max_k = min(max_k, n_samples)
        if min_k >= n_samples:
            # Cannot cluster meaningfully
            logger.warning(
                "Too few samples (%d) for k-means clustering.", n_samples
            )
            labels = pd.Series(
                np.zeros(n_samples, dtype=int), index=df.index, name="cluster"
            )
            return 1, 0.0, labels

        best_k = min_k
        best_score = -1.0
        best_labels = None

        if min_k >= max_k:
            # Range is empty (e.g. n_samples=2, min_k=3 -> max_k=2)
            logger.warning(
                "k range empty (min_k=%d >= max_k=%d); assigning all to cluster 0.",
                min_k, max_k,
            )
            labels = pd.Series(
                np.zeros(n_samples, dtype=int), index=df.index, name="cluster"
            )
            return 1, 0.0, labels

        for k in range(min_k, max_k):
            km = KMeans(n_clusters=k, n_init=10, random_state=42)
            labels = km.fit_predict(X)

            # Silhouette requires at least 2 clusters with >1 member
            unique_labels = set(labels)
            if len(unique_labels) < 2:
                continue

            score = silhouette_score(X, labels)
            logger.info("k=%d silhouette=%.4f", k, score)

            if score > best_score:
                best_score = score
                best_k = k
                best_labels = labels

        if best_labels is None:
            best_labels = np.zeros(n_samples, dtype=int)
            best_k = 1
            best_score = 0.0

        label_series = pd.Series(
            best_labels, index=df.index, name="cluster"
        )
        return best_k, best_score, label_series

    # ------------------------------------------------------------------
    # Persistence methods
    # ------------------------------------------------------------------

    async def _save_temporal_metrics(
        self, pool, snapshot_frames: dict[int, pd.DataFrame]
    ) -> int:
        """Save per-snapshot structural metrics to graph_metrics_temporal.

        Uses the schema from migration 106 (snapshot_date DATE, node_id VARCHAR(40)).
        Uses ON CONFLICT for idempotency.

        Returns total rows written.
        """
        total = 0
        for year, df in snapshot_frames.items():
            snapshot_date = date(int(year), 1, 1) if year is not None else date(2020, 1, 1)
            rows = []
            for node_id, row in df.iterrows():
                rows.append((
                    str(node_id),
                    snapshot_date,
                    float(row.get("pagerank", 0.0)) if pd.notna(row.get("pagerank")) else None,
                    float(row.get("betweenness_centrality", 0.0)) if pd.notna(row.get("betweenness_centrality")) else None,
                    float(row.get("clustering_coefficient", 0.0)) if pd.notna(row.get("clustering_coefficient")) else None,
                    int(row.get("degree", 0)) if pd.notna(row.get("degree")) else None,
                    int(row.get("community_label", -1)) if pd.notna(row.get("community_label")) else None,
                ))

            if rows:
                async with pool.acquire() as conn:
                    async with conn.transaction():
                        await conn.executemany(
                            """INSERT INTO graph_metrics_temporal
                               (node_id, snapshot_date, pagerank, betweenness,
                                clustering_coeff, degree, community_id)
                               VALUES ($1, $2, $3, $4, $5, $6, $7)
                               ON CONFLICT (node_id, snapshot_date)
                               DO UPDATE SET
                                 pagerank = EXCLUDED.pagerank,
                                 betweenness = EXCLUDED.betweenness,
                                 clustering_coeff = EXCLUDED.clustering_coeff,
                                 degree = EXCLUDED.degree,
                                 community_id = EXCLUDED.community_id,
                                 computed_at = NOW()""",
                            rows,
                        )
                total += len(rows)

        return total

    async def _save_node_embeddings(
        self, pool, df: pd.DataFrame, snapshot_year: int
    ) -> int:
        """Save standardized feature vectors to node_embeddings table.

        Uses the schema from migration 106 (FLOAT8[] embedding, UNIQUE(node_id, model_name)).
        Snapshot year is stored in the metadata JSONB field.

        Returns number of rows written.
        """
        # Exclude community_label from the embedding vector
        embed_cols = [c for c in df.columns if c != "community_label"]
        model_name = f"graph_feature_engineer_v{self.model_version}"
        metadata = json.dumps({
            "snapshot_year": int(snapshot_year) if snapshot_year is not None else None,
            "feature_columns": embed_cols,
        })

        rows = []
        for node_id, row in df.iterrows():
            vector = row[embed_cols].tolist()
            # Replace any remaining NaN/inf with 0
            vector = [
                0.0 if (v is None or np.isnan(v) or np.isinf(v)) else float(v)
                for v in vector
            ]
            rows.append((
                str(node_id),
                model_name,
                vector,
                len(vector),
                metadata,
            ))

        if rows:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    await conn.executemany(
                        """INSERT INTO node_embeddings
                           (node_id, model_name, embedding, dimension, metadata)
                           VALUES ($1, $2, $3::float8[], $4, $5::jsonb)
                           ON CONFLICT (node_id, model_name)
                           DO UPDATE SET
                             embedding = EXCLUDED.embedding,
                             dimension = EXCLUDED.dimension,
                             metadata = EXCLUDED.metadata,
                             computed_at = NOW()""",
                        rows,
                    )

        return len(rows)

    async def _save_clustering_results(
        self, pool, labels: pd.Series, best_k: int,
        silhouette: float, snapshot_year: int
    ) -> int:
        """Save k-means clustering results to clustering_results table.

        Uses the schema from migration 106 (run_id UUID, cluster_id, run_params JSONB).
        All nodes in one run share the same run_id.

        Returns number of rows written.
        """
        run_id = uuid.uuid4()
        model_name = f"kmeans_k{best_k}_v{self.model_version}"
        run_params = json.dumps({
            "k": best_k,
            "silhouette_score": round(float(silhouette), 4),
            "snapshot_year": int(snapshot_year) if snapshot_year is not None else None,
            "n_init": 10,
            "random_state": 42,
            "agent_run_id": self.run_id,
        })

        rows = []
        for node_id, cluster_label in labels.items():
            rows.append((
                run_id,
                model_name,
                str(node_id),
                int(cluster_label),
                run_params,
            ))

        if rows:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    await conn.executemany(
                        """INSERT INTO clustering_results
                           (run_id, model_name, node_id, cluster_id, run_params)
                           VALUES ($1, $2, $3, $4, $5::jsonb)
                           ON CONFLICT (run_id, node_id)
                           DO UPDATE SET
                             cluster_id = EXCLUDED.cluster_id,
                             run_params = EXCLUDED.run_params,
                             computed_at = NOW()""",
                        rows,
                    )

        return len(rows)
