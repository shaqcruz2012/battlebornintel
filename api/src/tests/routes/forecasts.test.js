import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/pool.js', () => {
  return {
    default: {
      query: vi.fn(),
    },
  };
});

import pool from '../../db/pool.js';
import router from '../../routes/forecasts.js';

const app = createApp(router, '/api/forecasts');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/forecasts/company/:id', () => {
  it('returns forecast data for a company', async () => {
    const rows = [
      {
        metric_name: 'revenue',
        value: 500,
        unit: 'USD_M',
        period: 'Q1 2026',
        confidence_lo: 450,
        confidence_hi: 550,
        scenario_id: 1,
        scenario_name: 'Base case',
      },
      {
        metric_name: 'employment',
        value: 120,
        unit: 'headcount',
        period: 'Q1 2026',
        confidence_lo: 100,
        confidence_hi: 140,
        scenario_id: 1,
        scenario_name: 'Base case',
      },
    ];
    pool.query.mockResolvedValue({ rows });

    const res = await request(app).get('/api/forecasts/company/10');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledOnce();
    expect(pool.query.mock.calls[0][1]).toEqual(['10']);
  });

  it('returns empty array when no forecasts exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/forecasts/company/999');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/forecasts/company/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/positive integer/);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/forecasts/company/10');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/forecasts/sector/:slug', () => {
  it('returns aggregated sector forecast data', async () => {
    const rows = [
      {
        metric_name: 'revenue',
        period: 'Q1 2026',
        total_value: 5000,
        avg_value: 250,
        min_value: 50,
        max_value: 800,
        unit: 'USD_M',
        entity_count: 20,
      },
    ];
    pool.query.mockResolvedValue({ rows });

    const res = await request(app).get('/api/forecasts/sector/clean-energy');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(pool.query.mock.calls[0][1]).toEqual(['clean-energy']);
  });

  it('returns empty array for unknown sector', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/forecasts/sector/nonexistent');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/forecasts/ecosystem', () => {
  it('returns ecosystem forecast data', async () => {
    const rows = [
      {
        metric_name: 'funding_m_forecast',
        period: 'Q1 2026',
        value: 1200,
        unit: 'USD_M',
        confidence_lo: 1000,
        confidence_hi: 1400,
        scenario_id: 1,
        scenario_name: 'Base case',
      },
      {
        metric_name: 'employment_forecast',
        period: 'Q1 2026',
        value: 50000,
        unit: 'headcount',
        confidence_lo: 45000,
        confidence_hi: 55000,
        scenario_id: 1,
        scenario_name: 'Base case',
      },
    ];
    pool.query.mockResolvedValue({ rows });

    const res = await request(app).get('/api/forecasts/ecosystem');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledOnce();
  });

  it('returns empty array when no ecosystem data exists', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/forecasts/ecosystem');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValue(new Error('query timeout'));

    const res = await request(app).get('/api/forecasts/ecosystem');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
