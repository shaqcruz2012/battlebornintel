import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/kpis.js', () => ({
  getKpis: vi.fn(),
  getKPIsWithForecasts: vi.fn(),
  getSectorStats: vi.fn(),
  getEcosystemForecastSummary: vi.fn(),
}));

import {
  getKpis,
  getKPIsWithForecasts,
  getSectorStats,
  getEcosystemForecastSummary,
} from '../../db/queries/kpis.js';
import router from '../../routes/kpis.js';

const app = createApp(router, '/api/kpis');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/kpis', () => {
  it('returns KPI data', async () => {
    const rows = [
      { sector: 'tech', total_companies: 12, total_funding_m: 45 },
      { sector: 'health', total_companies: 8, total_funding_m: 22 },
    ];
    getKpis.mockResolvedValue(rows);

    const res = await request(app).get('/api/kpis');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].sector).toBe('tech');
    expect(getKpis).toHaveBeenCalledOnce();
  });

  it('calls enriched query when forecasts=true', async () => {
    const rows = [{ sector: 'tech', total_companies: 12, forecast_funding: 60 }];
    getKPIsWithForecasts.mockResolvedValue(rows);

    const res = await request(app).get('/api/kpis?forecasts=true');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(getKPIsWithForecasts).toHaveBeenCalledWith(undefined);
    expect(getKpis).not.toHaveBeenCalled();
  });

  it('falls back to getKpis when forecasts=true but stage filter present', async () => {
    const rows = [{ sector: 'tech', total_companies: 5 }];
    getKpis.mockResolvedValue(rows);

    const res = await request(app).get('/api/kpis?forecasts=true&stage=seed');

    expect(res.status).toBe(200);
    expect(getKpis).toHaveBeenCalledOnce();
    expect(getKPIsWithForecasts).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    getKpis.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/kpis');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/kpis/sectors', () => {
  it('returns sector statistics', async () => {
    const rows = [
      { sector: 'tech', company_count: 10, avg_momentum: 0.75 },
      { sector: 'health', company_count: 6, avg_momentum: 0.62 },
    ];
    getSectorStats.mockResolvedValue(rows);

    const res = await request(app).get('/api/kpis/sectors');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(getSectorStats).toHaveBeenCalledWith({ region: undefined });
  });

  it('passes region filter', async () => {
    getSectorStats.mockResolvedValue([]);

    const res = await request(app).get('/api/kpis/sectors?region=reno');

    expect(res.status).toBe(200);
    expect(getSectorStats).toHaveBeenCalledWith({ region: 'reno' });
  });
});

describe('GET /api/kpis/ecosystem-forecast', () => {
  it('returns forecast summary', async () => {
    const data = {
      scenario_name: 'baseline',
      metrics: { total_companies: 50, total_funding_m: 120 },
    };
    getEcosystemForecastSummary.mockResolvedValue(data);

    const res = await request(app).get('/api/kpis/ecosystem-forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.scenario_name).toBe('baseline');
  });

  it('returns null when no data available', async () => {
    getEcosystemForecastSummary.mockResolvedValue(null);

    const res = await request(app).get('/api/kpis/ecosystem-forecast');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
    expect(res.body.message).toBe('No completed scenario available');
  });

  it('returns 500 on database error', async () => {
    getEcosystemForecastSummary.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/kpis/ecosystem-forecast');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
