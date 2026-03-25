import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Companies API', () => {
  it('GET /api/companies returns array', async () => {
    const res = await request(BASE).get('/api/companies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/companies/:id returns a company', async () => {
    const res = await request(BASE).get('/api/companies/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Redwood Materials');
    expect(res.body.data).toHaveProperty('stage');
    expect(res.body.data).toHaveProperty('funding');
  });

  it('GET /api/companies/:id rejects invalid id', async () => {
    const res = await request(BASE).get('/api/companies/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('positive integer');
  });

  it('GET /api/companies/:id returns 404 for missing', async () => {
    const res = await request(BASE).get('/api/companies/99999');
    expect(res.status).toBe(404);
  });

  it('GET /api/companies?stage=seed filters by stage', async () => {
    const res = await request(BASE).get('/api/companies?stage=seed');
    expect(res.status).toBe(200);
    // The API stage filter uses ILIKE so 'seed' also matches 'pre_seed'
    res.body.data.forEach(c => expect(c.stage).toMatch(/seed/i));
  });

  it('GET /api/companies?region=reno filters by region', async () => {
    const res = await request(BASE).get('/api/companies?region=reno');
    expect(res.status).toBe(200);
    res.body.data.forEach(c => expect(c.region).toBe('reno'));
  });
});
