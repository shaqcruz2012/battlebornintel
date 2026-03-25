import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Graph Traversal API', () => {
  it('GET /api/graph/neighbors/:nodeId returns neighbors', async () => {
    const res = await request(BASE).get('/api/graph/neighbors/c_2');
    expect(res.status).toBe(200);
    expect(res.body.data.center).toBe('c_2');
    expect(Array.isArray(res.body.data.neighbors)).toBe(true);
    expect(res.body.data.neighbors.length).toBeGreaterThan(0);
  });

  it('GET /api/graph/neighbors rejects invalid nodeId', async () => {
    const res = await request(BASE).get("/api/graph/neighbors/'; DROP TABLE--");
    expect(res.status).toBe(400);
  });

  it('GET /api/graph/paths/:source/:target finds paths', async () => {
    const res = await request(BASE).get('/api/graph/paths/c_2/c_3');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('c_2');
    expect(res.body.data.target).toBe('c_3');
    expect(Array.isArray(res.body.data.paths)).toBe(true);
  });

  it('GET /api/graph/similar/:nodeId returns similar nodes', async () => {
    const res = await request(BASE).get('/api/graph/similar/c_2');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/graph/communities returns community data', async () => {
    const res = await request(BASE).get('/api/graph/communities');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('communities');
  });
});
