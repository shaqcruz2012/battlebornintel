import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

const BASE = 'http://localhost:3001';

describe('Auth API', () => {
  it('rejects registration with missing fields', async () => {
    const res = await request(BASE)
      .post('/api/auth/register')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  it('rejects short password', async () => {
    const res = await request(BASE)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short', name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('8 characters');
  });

  it('rejects login with wrong credentials', async () => {
    const res = await request(BASE)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrongpassword123' });
    expect(res.status).toBe(401);
  });
});
