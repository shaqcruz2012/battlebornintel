import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Security', () => {
  it('returns security headers', async () => {
    const res = await request(BASE).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('returns rate limit headers', async () => {
    const res = await request(BASE).get('/api/companies');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
    expect(res.headers['ratelimit-reset']).toBeDefined();
  });

  it('blocks admin routes without key', async () => {
    const res = await request(BASE).get('/api/ingestion/queue');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('blocks admin routes with wrong key', async () => {
    const res = await request(BASE)
      .get('/api/ingestion/queue')
      .set('x-admin-key', 'wrong-key');
    expect(res.status).toBe(403);
  });

  it('SQL injection in company ID returns safe error', async () => {
    const res = await request(BASE).get("/api/companies/1;DROP TABLE companies");
    // parseInt("1;DROP...") = 1, so it returns company 1 safely
    expect([200, 400]).toContain(res.status);
    // Database should still be intact
    const check = await request(BASE).get('/api/companies');
    expect(check.status).toBe(200);
    expect(check.body.data.length).toBeGreaterThan(0);
  });

  it('SQL injection in graph traversal is rejected', async () => {
    const res = await request(BASE).get("/api/graph/neighbors/c_2' OR 1=1--");
    expect(res.status).toBe(400);
  });

  it('rejects oversized JSON body', async () => {
    const bigBody = { data: 'x'.repeat(2_000_000) };
    const res = await request(BASE)
      .post('/api/auth/register')
      .send(bigBody);
    expect(res.status).toBe(413);
  });
});
