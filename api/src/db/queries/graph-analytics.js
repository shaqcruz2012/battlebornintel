import pool from '../pool.js';

export async function getNodeEmbeddings({ modelName, nodeIds } = {}) {
  let sql = `
    SELECT node_id, model_name, embedding, dimension, metadata, computed_at
    FROM node_embeddings
  `;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (modelName) {
    conditions.push(`model_name = $${idx}`);
    params.push(modelName);
    idx++;
  }

  if (nodeIds && nodeIds.length > 0) {
    conditions.push(`node_id = ANY($${idx})`);
    params.push(nodeIds);
    idx++;
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY computed_at DESC`;

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getClusteringResults({ modelName, clusterId } = {}) {
  let sql = `
    SELECT cr.run_id, cr.model_name, cr.node_id, cr.cluster_id,
           cr.distance_to_centroid, cr.membership_confidence, cr.computed_at,
           cr.run_params
    FROM clustering_results cr
  `;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (modelName) {
    conditions.push(`cr.model_name = $${idx}`);
    params.push(modelName);
    idx++;
  }

  if (clusterId !== undefined && clusterId !== null) {
    conditions.push(`cr.cluster_id = $${idx}`);
    params.push(clusterId);
    idx++;
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY cr.computed_at DESC`;

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getClusteringSummary(modelName) {
  const params = [];
  let modelFilter = '';

  if (modelName) {
    params.push(modelName);
    modelFilter = `WHERE model_name = $1`;
  }

  const sql = `
    WITH latest_run AS (
      SELECT DISTINCT ON (model_name) run_id, model_name
      FROM clustering_results
      ${modelFilter}
      ORDER BY model_name, computed_at DESC
    )
    SELECT cr.cluster_id, COUNT(*)::int AS count, cr.model_name, cr.run_id
    FROM clustering_results cr
    INNER JOIN latest_run lr ON lr.run_id = cr.run_id AND lr.model_name = cr.model_name
    GROUP BY cr.cluster_id, cr.model_name, cr.run_id
    ORDER BY cr.cluster_id
  `;

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getNodeTemporalMetrics(nodeId) {
  const sql = `
    SELECT node_id, snapshot_date, pagerank, betweenness,
           clustering_coeff, degree, community_id
    FROM graph_metrics_temporal
    WHERE node_id = $1
    ORDER BY snapshot_date
  `;

  const { rows } = await pool.query(sql, [nodeId]);
  return rows;
}

export async function getGraphSnapshot(snapshotDate) {
  const sql = `
    SELECT node_id, pagerank, betweenness, clustering_coeff, degree, community_id
    FROM graph_metrics_temporal
    WHERE snapshot_date = $1
    ORDER BY node_id
  `;

  const { rows } = await pool.query(sql, [snapshotDate]);
  return rows;
}
