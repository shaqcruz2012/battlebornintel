import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/graph-analytics.js', () => ({
  getNodeEmbeddings: vi.fn(),
  getClusteringResults: vi.fn(),
  getClusteringSummary: vi.fn(),
  getNodeTemporalMetrics: vi.fn(),
  getGraphSnapshot: vi.fn(),
}));

import {
  getNodeEmbeddings,
  getClusteringResults,
  getClusteringSummary,
  getNodeTemporalMetrics,
  getGraphSnapshot,
} from '../../db/queries/graph-analytics.js';
import router from '../../routes/graph-analytics.js';

const app = createApp(router, '/api/graph-analytics');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/graph-analytics/embeddings', () => {
  it('returns embeddings without filters', async () => {
    const rows = [
      { node_id: 'c_1', model_name: 'node2vec', embedding: [0.1, 0.2], dimension: 2, metadata: {}, computed_at: '2025-01-01' },
    ];
    getNodeEmbeddings.mockResolvedValue(rows);

    const res = await request(app).get('/api/graph-analytics/embeddings');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
    expect(getNodeEmbeddings).toHaveBeenCalledWith({ modelName: undefined, nodeIds: undefined });
  });

  it('passes model_name and node_ids filters', async () => {
    getNodeEmbeddings.mockResolvedValue([]);

    const res = await request(app).get('/api/graph-analytics/embeddings?model_name=node2vec&node_ids=c_1,c_2');

    expect(res.status).toBe(200);
    expect(getNodeEmbeddings).toHaveBeenCalledWith({ modelName: 'node2vec', nodeIds: ['c_1', 'c_2'] });
  });

  it('returns 400 for invalid node_id', async () => {
    const res = await request(app).get('/api/graph-analytics/embeddings?node_ids=valid_id,!!!bad');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid node_id/);
    expect(getNodeEmbeddings).not.toHaveBeenCalled();
  });

  it('returns 400 for node_id exceeding 40 chars', async () => {
    const longId = 'a'.repeat(41);
    const res = await request(app).get(`/api/graph-analytics/embeddings?node_ids=${longId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid node_id/);
  });

  it('returns 500 on database error', async () => {
    getNodeEmbeddings.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph-analytics/embeddings');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/graph-analytics/clusters', () => {
  it('returns clustering results without filters', async () => {
    const rows = [
      { run_id: 'r1', model_name: 'louvain', node_id: 'c_1', cluster_id: 0, distance_to_centroid: 0.5, membership_confidence: 0.9, computed_at: '2025-01-01', run_params: {} },
    ];
    getClusteringResults.mockResolvedValue(rows);

    const res = await request(app).get('/api/graph-analytics/clusters');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
    expect(getClusteringResults).toHaveBeenCalledWith({ modelName: undefined, clusterId: undefined });
  });

  it('passes model_name and cluster_id filters', async () => {
    getClusteringResults.mockResolvedValue([]);

    const res = await request(app).get('/api/graph-analytics/clusters?model_name=louvain&cluster_id=3');

    expect(res.status).toBe(200);
    expect(getClusteringResults).toHaveBeenCalledWith({ modelName: 'louvain', clusterId: 3 });
  });

  it('returns 400 for non-integer cluster_id', async () => {
    const res = await request(app).get('/api/graph-analytics/clusters?cluster_id=abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cluster_id must be an integer/);
    expect(getClusteringResults).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    getClusteringResults.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph-analytics/clusters');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/graph-analytics/clusters/summary', () => {
  it('returns cluster summary without model_name', async () => {
    const rows = [
      { cluster_id: 0, count: 5, model_name: 'louvain', run_id: 'r1' },
      { cluster_id: 1, count: 3, model_name: 'louvain', run_id: 'r1' },
    ];
    getClusteringSummary.mockResolvedValue(rows);

    const res = await request(app).get('/api/graph-analytics/clusters/summary');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
    expect(getClusteringSummary).toHaveBeenCalledWith(undefined);
  });

  it('passes model_name filter', async () => {
    getClusteringSummary.mockResolvedValue([]);

    const res = await request(app).get('/api/graph-analytics/clusters/summary?model_name=louvain');

    expect(res.status).toBe(200);
    expect(getClusteringSummary).toHaveBeenCalledWith('louvain');
  });

  it('returns 500 on database error', async () => {
    getClusteringSummary.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph-analytics/clusters/summary');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/graph-analytics/temporal/:nodeId', () => {
  it('returns temporal metrics for a valid node', async () => {
    const rows = [
      { node_id: 'c_1', snapshot_date: '2025-01-01', pagerank: 0.15, betweenness: 0.1, clustering_coeff: 0.5, degree: 4, community_id: 0 },
      { node_id: 'c_1', snapshot_date: '2025-02-01', pagerank: 0.18, betweenness: 0.12, clustering_coeff: 0.6, degree: 5, community_id: 0 },
    ];
    getNodeTemporalMetrics.mockResolvedValue(rows);

    const res = await request(app).get('/api/graph-analytics/temporal/c_1');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
    expect(getNodeTemporalMetrics).toHaveBeenCalledWith('c_1');
  });

  it('returns 400 for invalid nodeId with special chars', async () => {
    const res = await request(app).get('/api/graph-analytics/temporal/bad!id');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/alphanumeric/);
    expect(getNodeTemporalMetrics).not.toHaveBeenCalled();
  });

  it('returns 400 for nodeId exceeding 40 chars', async () => {
    const longId = 'a'.repeat(41);
    const res = await request(app).get(`/api/graph-analytics/temporal/${longId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/alphanumeric/);
  });

  it('returns 500 on database error', async () => {
    getNodeTemporalMetrics.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph-analytics/temporal/c_1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/graph-analytics/snapshot', () => {
  it('returns snapshot for a valid date', async () => {
    const rows = [
      { node_id: 'c_1', pagerank: 0.15, betweenness: 0.1, clustering_coeff: 0.5, degree: 4, community_id: 0 },
      { node_id: 'f_1', pagerank: 0.25, betweenness: 0.2, clustering_coeff: 0.3, degree: 6, community_id: 1 },
    ];
    getGraphSnapshot.mockResolvedValue(rows);

    const res = await request(app).get('/api/graph-analytics/snapshot?date=2025-01-01');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
    expect(getGraphSnapshot).toHaveBeenCalledWith('2025-01-01');
  });

  it('returns 400 when date is missing', async () => {
    const res = await request(app).get('/api/graph-analytics/snapshot');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date query parameter required/);
    expect(getGraphSnapshot).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app).get('/api/graph-analytics/snapshot?date=01-01-2025');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/YYYY-MM-DD/);
    expect(getGraphSnapshot).not.toHaveBeenCalled();
  });

  it('returns 400 for non-date string in YYYY-MM-DD format', async () => {
    const res = await request(app).get('/api/graph-analytics/snapshot?date=2025-13-45');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date query parameter required/);
    expect(getGraphSnapshot).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    getGraphSnapshot.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph-analytics/snapshot?date=2025-01-01');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
