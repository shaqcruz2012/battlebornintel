import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/graph.js', () => ({
  getGraphData: vi.fn(),
  getGraphMetrics: vi.fn(),
}));

vi.mock('../../services/graphService.js', () => ({
  computeAndReturnMetrics: vi.fn(),
}));

vi.mock('../../middleware/cache.js', () => ({
  cacheMiddleware: () => (_req, _res, next) => next(),
}));

import { getGraphData, getGraphMetrics } from '../../db/queries/graph.js';
import { computeAndReturnMetrics } from '../../services/graphService.js';
import router from '../../routes/graph.js';

const app = createApp(router, '/api/graph');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/graph', () => {
  it('returns graph nodes and edges', async () => {
    const graphData = {
      nodes: [
        { id: 'c_1', type: 'company', label: 'Acme' },
        { id: 'f_1', type: 'fund', label: 'BBV' },
      ],
      edges: [
        { source: 'f_1', target: 'c_1', rel: 'invested_in' },
      ],
    };
    getGraphData.mockResolvedValue(graphData);

    const res = await request(app).get('/api/graph');

    expect(res.status).toBe(200);
    expect(res.body.data.nodes).toHaveLength(2);
    expect(res.body.data.edges).toHaveLength(1);
    expect(getGraphData).toHaveBeenCalledWith({
      nodeTypes: ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'],
      yearMax: 2026,
      region: 'all',
    });
  });

  it('passes custom nodeTypes and yearMax', async () => {
    getGraphData.mockResolvedValue({ nodes: [], edges: [] });

    const res = await request(app).get('/api/graph?nodeTypes=company,fund&yearMax=2024&region=reno');

    expect(res.status).toBe(200);
    expect(getGraphData).toHaveBeenCalledWith({
      nodeTypes: ['company', 'fund'],
      yearMax: 2024,
      region: 'reno',
    });
  });

  it('returns 500 on database error', async () => {
    getGraphData.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/graph/metrics', () => {
  it('returns cached graph metrics', async () => {
    const metrics = {
      pagerank: { c_1: 0.15, f_1: 0.25 },
      betweenness: { c_1: 0.1 },
      communities: { c_1: 0, f_1: 1 },
    };
    getGraphMetrics.mockResolvedValue(metrics);

    const res = await request(app).get('/api/graph/metrics');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(metrics);
    expect(res.body.source).toBe('cache');
  });

  it('triggers recompute when cache is empty', async () => {
    getGraphMetrics.mockResolvedValue({ pagerank: {}, betweenness: {}, communities: {} });
    const liveMetrics = {
      pagerank: { c_1: 0.15 },
      betweenness: { c_1: 0.1 },
      communities: { c_1: 0 },
    };
    computeAndReturnMetrics.mockResolvedValue(liveMetrics);

    const res = await request(app).get('/api/graph/metrics');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(liveMetrics);
    expect(res.body.source).toBe('computed');
    expect(computeAndReturnMetrics).toHaveBeenCalledOnce();
  });

  it('returns empty metrics when cache is empty and compute fails', async () => {
    getGraphMetrics.mockResolvedValue({ pagerank: {}, betweenness: {}, communities: {} });
    computeAndReturnMetrics.mockRejectedValue(new Error('compute failed'));

    const res = await request(app).get('/api/graph/metrics');

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('empty');
    expect(res.body.data.pagerank).toEqual({});
  });

  it('returns 500 on database error', async () => {
    getGraphMetrics.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/graph/metrics');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
