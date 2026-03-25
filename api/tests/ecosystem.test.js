import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Ecosystem API', () => {
  it('GET /api/ecosystem/map returns entities', async () => {
    const res = await request(BASE).get('/api/ecosystem/map');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('type');
  });

  it('GET /api/ecosystem/gaps returns stage distribution', async () => {
    const res = await request(BASE).get('/api/ecosystem/gaps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.stageDistribution)).toBe(true);
    expect(res.body.data).toHaveProperty('seriesBCoverage');
  });
});
