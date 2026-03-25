import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';

// Instead of importing the full app (which starts listeners),
// test against the running server
const BASE = 'http://localhost:3001';

describe('Health Check', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(BASE).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
  });
});
