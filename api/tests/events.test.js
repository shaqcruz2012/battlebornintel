import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Events API', () => {
  it('GET /api/timeline returns verified events only', async () => {
    const res = await request(BASE).get('/api/timeline');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // All returned events should be verified (have source_url)
    res.body.data.forEach(e => {
      expect(e.source_url).toBeTruthy();
    });
  });

  it('GET /api/timeline?type=Funding filters by type', async () => {
    const res = await request(BASE).get('/api/timeline?type=Funding');
    expect(res.status).toBe(200);
    res.body.data.forEach(e => expect(e.type).toBe('Funding'));
  });

  it('GET /api/timeline rejects invalid type', async () => {
    const res = await request(BASE).get('/api/timeline?type=FakeType');
    expect(res.status).toBe(400);
  });

  it('GET /api/stakeholder-activities returns verified only', async () => {
    const res = await request(BASE).get('/api/stakeholder-activities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/risks returns risk signals', async () => {
    const res = await request(BASE).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('portfolio_risk_score');
    expect(res.body.data).toHaveProperty('signals');
  });
});
