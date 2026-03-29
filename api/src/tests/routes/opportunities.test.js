import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/opportunities.js', () => {
  return {
    getOpportunities: vi.fn(),
    getCompanyOpportunities: vi.fn(),
    getOpportunityStats: vi.fn(),
  };
});

import {
  getOpportunities,
  getCompanyOpportunities,
  getOpportunityStats,
} from '../../db/queries/opportunities.js';
import router from '../../routes/opportunities.js';

const app = createApp(router, '/api/opportunities');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/opportunities', () => {
  it('returns opportunity list with meta', async () => {
    getOpportunities.mockResolvedValue({
      opportunities: [
        { id: 1, company: 'Acme', program: 'SSBCI', score: 0.85 },
        { id: 2, company: 'Beta', program: 'SBIR', score: 0.72 },
      ],
      total: 2,
      limit: 100,
      offset: 0,
    });

    const res = await request(app).get('/api/opportunities');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.limit).toBe(100);
    expect(res.body.meta.offset).toBe(0);
    expect(res.body.meta.filters).toBeDefined();
  });

  it('passes quality filter to query function', async () => {
    getOpportunities.mockResolvedValue({
      opportunities: [{ id: 1, score: 0.9 }],
      total: 1,
      limit: 100,
      offset: 0,
    });

    const res = await request(app).get('/api/opportunities?quality=excellent');

    expect(res.status).toBe(200);
    expect(getOpportunities).toHaveBeenCalledOnce();
    expect(getOpportunities.mock.calls[0][0].quality).toBe('excellent');
    expect(res.body.meta.filters.quality).toBe('excellent');
  });

  it('returns 400 for invalid quality param', async () => {
    const res = await request(app).get('/api/opportunities?quality=invalid');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid quality/);
    expect(getOpportunities).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid entityType param', async () => {
    const res = await request(app).get('/api/opportunities?entityType=invalid');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid entityType/);
  });

  it('returns 400 for invalid sortBy param', async () => {
    const res = await request(app).get('/api/opportunities?sortBy=invalid');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid sortBy/);
  });

  it('returns 500 on database error', async () => {
    getOpportunities.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/opportunities');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/opportunities/stats', () => {
  it('returns summary statistics', async () => {
    const stats = {
      total: 50,
      by_quality: { excellent: 10, good: 25, fair: 15 },
      avg_score: 0.68,
    };
    getOpportunityStats.mockResolvedValue(stats);

    const res = await request(app).get('/api/opportunities/stats');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(stats);
    expect(getOpportunityStats).toHaveBeenCalledOnce();
  });

  it('returns 500 on database error', async () => {
    getOpportunityStats.mockRejectedValue(new Error('query timeout'));

    const res = await request(app).get('/api/opportunities/stats');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/opportunities/company/:companyId', () => {
  it('returns opportunities for a specific company', async () => {
    getCompanyOpportunities.mockResolvedValue({
      opportunities: [{ id: 1, program: 'SSBCI', score: 0.85 }],
      summary: { total: 1, avg_score: 0.85 },
    });

    const res = await request(app).get('/api/opportunities/company/5');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.summary).toBeDefined();
    expect(getCompanyOpportunities).toHaveBeenCalledWith(5);
  });

  it('returns 400 for non-numeric companyId', async () => {
    const res = await request(app).get('/api/opportunities/company/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
    expect(getCompanyOpportunities).not.toHaveBeenCalled();
  });

  it('returns 400 for negative companyId', async () => {
    const res = await request(app).get('/api/opportunities/company/-1');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 500 on database error', async () => {
    getCompanyOpportunities.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/opportunities/company/5');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
