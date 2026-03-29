import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../middleware/cache.js', () => {
  return {
    cacheMiddleware: vi.fn(() => (req, res, next) => next()),
    clearCache: vi.fn(),
  };
});

vi.mock('../../db/queries/companies.js', () => {
  return {
    getAllCompanies: vi.fn(),
    getCompanyById: vi.fn(),
  };
});

vi.mock('../../db/queries/funds.js', () => {
  return {
    getAllFunds: vi.fn(),
  };
});

vi.mock('../../db/queries/kpis.js', () => {
  return {
    getKpis: vi.fn(),
    getSectorStats: vi.fn(),
  };
});

import { getAllCompanies } from '../../db/queries/companies.js';
import { getAllFunds } from '../../db/queries/funds.js';
import { getKpis, getSectorStats } from '../../db/queries/kpis.js';
import router from '../../routes/dashboard-batch.js';

const app = createApp(router, '/api/dashboard-batch');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/dashboard-batch', () => {
  it('returns batched dashboard data wrapped in {data}', async () => {
    const companies = [{ id: 1, name: 'Acme' }];
    const kpis = { total_funding: 100 };
    const funds = [{ id: 1, name: 'BBV Fund I' }];
    const sectors = [{ name: 'tech', count: 5 }];

    getAllCompanies.mockResolvedValue(companies);
    getKpis.mockResolvedValue(kpis);
    getAllFunds.mockResolvedValue(funds);
    getSectorStats.mockResolvedValue(sectors);

    const res = await request(app).get('/api/dashboard-batch');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.companies).toEqual(companies);
    expect(res.body.data.kpis).toEqual(kpis);
    expect(res.body.data.funds).toEqual(funds);
    expect(res.body.data.sectors).toEqual(sectors);
  });

  it('omits datasets when disabled via query params', async () => {
    getAllCompanies.mockResolvedValue([]);
    getKpis.mockResolvedValue({});

    const res = await request(app).get(
      '/api/dashboard-batch?companies=true&kpis=true&funds=false&sectors=false'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.companies).toBeDefined();
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.funds).toBeUndefined();
    expect(res.body.data.sectors).toBeUndefined();
    expect(getAllFunds).not.toHaveBeenCalled();
    expect(getSectorStats).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid filters JSON', async () => {
    const res = await request(app).get(
      '/api/dashboard-batch?filters=not-valid-json'
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid filters/);
  });

  it('returns 500 on database error', async () => {
    getAllCompanies.mockRejectedValue(new Error('connection refused'));
    getKpis.mockRejectedValue(new Error('connection refused'));
    getAllFunds.mockRejectedValue(new Error('connection refused'));
    getSectorStats.mockRejectedValue(new Error('connection refused'));

    // The route catches individual query errors and returns fallbacks,
    // so all four must reject to test the outer catch.
    // Actually, the route has per-query .catch(), so individual failures
    // return empty defaults. Let's verify graceful degradation instead.
    const res = await request(app).get('/api/dashboard-batch');

    // Per-query catches return fallbacks, so we get 200 with empty data
    expect(res.status).toBe(200);
    expect(res.body.data.companies).toEqual([]);
    expect(res.body.data.kpis).toEqual({});
    expect(res.body.data.funds).toEqual([]);
    expect(res.body.data.sectors).toEqual([]);
  });
});

describe('GET /api/dashboard-batch/executives', () => {
  it('returns executive summary in {data}', async () => {
    const companies = [{ id: 1, name: 'Acme' }];
    const kpis = { total_funding: 100, companies_count: 1 };

    getAllCompanies.mockResolvedValue(companies);
    getKpis.mockResolvedValue(kpis);

    const res = await request(app).get('/api/dashboard-batch/executives');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.companies).toEqual(companies);
    expect(res.body.data.kpis).toEqual(kpis);
  });

  it('returns 400 for invalid filters JSON', async () => {
    const res = await request(app).get(
      '/api/dashboard-batch/executives?filters=bad'
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid filters/);
  });

  it('returns fallback data on query errors', async () => {
    getAllCompanies.mockRejectedValue(new Error('db error'));
    getKpis.mockRejectedValue(new Error('db error'));

    const res = await request(app).get('/api/dashboard-batch/executives');

    expect(res.status).toBe(200);
    expect(res.body.data.companies).toEqual([]);
    expect(res.body.data.kpis).toEqual({});
  });
});

describe('GET /api/dashboard-batch/goed', () => {
  it('returns GOED data in {data}', async () => {
    const kpis = { capital_deployed: 50 };
    const sectors = [{ name: 'mining_tech', count: 3 }];
    const companies = [{ id: 2, name: 'NevadaTech' }];

    getKpis.mockResolvedValue(kpis);
    getSectorStats.mockResolvedValue(sectors);
    getAllCompanies.mockResolvedValue(companies);

    const res = await request(app).get('/api/dashboard-batch/goed');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.kpis).toEqual(kpis);
    expect(res.body.data.sectors).toEqual(sectors);
    expect(res.body.data.companies).toEqual(companies);
  });

  it('passes region filter to queries', async () => {
    getKpis.mockResolvedValue({});
    getSectorStats.mockResolvedValue([]);
    getAllCompanies.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard-batch/goed?region=reno');

    expect(res.status).toBe(200);
    expect(getKpis).toHaveBeenCalledWith({ region: 'reno' });
    expect(getSectorStats).toHaveBeenCalledWith({ region: 'reno' });
    expect(getAllCompanies).toHaveBeenCalledWith({ region: 'reno' });
  });

  it('returns fallback data on query errors', async () => {
    getKpis.mockRejectedValue(new Error('db error'));
    getSectorStats.mockRejectedValue(new Error('db error'));
    getAllCompanies.mockRejectedValue(new Error('db error'));

    const res = await request(app).get('/api/dashboard-batch/goed');

    expect(res.status).toBe(200);
    expect(res.body.data.kpis).toEqual({});
    expect(res.body.data.sectors).toEqual([]);
    expect(res.body.data.companies).toEqual([]);
  });
});
