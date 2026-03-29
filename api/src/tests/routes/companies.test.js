import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/companies.js', () => ({
  getAllCompanies: vi.fn(),
  getCompanyById: vi.fn(),
}));

vi.mock('../../engine/scoring.js', () => ({
  computeForwardScore: vi.fn(),
}));

import { getAllCompanies, getCompanyById } from '../../db/queries/companies.js';
import { computeForwardScore } from '../../engine/scoring.js';
import router from '../../routes/companies.js';

const app = createApp(router, '/api/companies');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/companies', () => {
  it('returns company list with data wrapper', async () => {
    const rows = [
      { id: 1, name: 'Acme Corp', stage: 'seed', momentum: 0.8 },
      { id: 2, name: 'Beta Inc', stage: 'series_a', momentum: 0.6 },
    ];
    getAllCompanies.mockResolvedValue(rows);
    computeForwardScore.mockResolvedValue(null);

    const res = await request(app).get('/api/companies');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Acme Corp');
    expect(res.body.data[0].score_type).toBe('heuristic');
    expect(getAllCompanies).toHaveBeenCalledOnce();
  });

  it('enriches companies with forward score when available', async () => {
    const rows = [{ id: 1, name: 'Acme Corp', stage: 'seed' }];
    getAllCompanies.mockResolvedValue(rows);
    computeForwardScore.mockResolvedValue({
      forward_score: 85,
      components: { growth: 0.9, retention: 0.8 },
    });

    const res = await request(app).get('/api/companies');

    expect(res.status).toBe(200);
    expect(res.body.data[0].forward_score).toBe(85);
    expect(res.body.data[0].score_type).toBe('blended');
  });

  it('passes search query param to getAllCompanies', async () => {
    getAllCompanies.mockResolvedValue([]);
    computeForwardScore.mockResolvedValue(null);

    const res = await request(app).get('/api/companies?search=acme');

    expect(res.status).toBe(200);
    expect(getAllCompanies).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'acme' })
    );
  });

  it('returns 500 on database error', async () => {
    getAllCompanies.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/companies');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/companies/:id', () => {
  it('returns single company', async () => {
    const company = { id: 1, name: 'Acme Corp', stage: 'seed' };
    getCompanyById.mockResolvedValue(company);
    computeForwardScore.mockResolvedValue(null);

    const res = await request(app).get('/api/companies/1');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Acme Corp');
    expect(res.body.data.score_type).toBe('heuristic');
    expect(getCompanyById).toHaveBeenCalledWith(1);
  });

  it('returns 404 for non-existent id', async () => {
    getCompanyById.mockResolvedValue(null);

    const res = await request(app).get('/api/companies/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Company not found');
  });

  it('returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/companies/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('id must be a positive integer');
  });

  it('returns 500 on database error', async () => {
    getCompanyById.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/companies/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
