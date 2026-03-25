import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Graph API', () => {
  it('GET /api/graph returns nodes and edges', async () => {
    const res = await request(BASE).get('/api/graph?nodeTypes=company,fund');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.nodes)).toBe(true);
    expect(Array.isArray(res.body.data.edges)).toBe(true);
    expect(res.body.data.nodes.length).toBeGreaterThan(0);
  });

  it('GET /api/graph default excludes opportunity edges', async () => {
    const res = await request(BASE).get('/api/graph?nodeTypes=company,fund');
    expect(res.status).toBe(200);
    const oppEdges = res.body.data.edges.filter(e => e.category === 'opportunity');
    expect(oppEdges.length).toBe(0);
  });

  it('GET /api/graph?opportunities=true includes opportunity edges', async () => {
    const res = await request(BASE).get('/api/graph?nodeTypes=company,fund&opportunities=true');
    expect(res.status).toBe(200);
    const oppEdges = res.body.data.edges.filter(e => e.category === 'opportunity');
    expect(oppEdges.length).toBeGreaterThan(0);
  });

  it('GET /api/graph/light returns lighter payload', async () => {
    const res = await request(BASE).get('/api/graph/light?nodeTypes=company,fund');
    expect(res.status).toBe(200);
    expect(res.body.data.nodes[0]).not.toHaveProperty('eligible');
    expect(res.body.data.nodes[0]).toHaveProperty('id');
    expect(res.body.data.nodes[0]).toHaveProperty('label');
  });

  it('GET /api/graph/metrics returns metrics', async () => {
    const res = await request(BASE).get('/api/graph/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('pagerank');
    expect(res.body.data).toHaveProperty('communities');
  });
});
