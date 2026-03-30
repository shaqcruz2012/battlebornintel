import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/scenarios.js', () => ({
  listScenarios: vi.fn(),
  getScenario: vi.fn(),
  getScenarioResults: vi.fn(),
  getLatestForecasts: vi.fn(),
  compareScenarios: vi.fn(),
  listModels: vi.fn(),
}));

import {
  listScenarios,
  getScenario,
  getScenarioResults,
  getLatestForecasts,
  compareScenarios,
  listModels,
} from '../../db/queries/scenarios.js';
import router from '../../routes/scenarios.js';

const app = createApp(router, '/api/scenarios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/scenarios', () => {
  it('returns paginated scenarios with meta', async () => {
    const rows = [
      { id: 1, name: 'Base case' },
      { id: 2, name: 'Bull case' },
    ];
    listScenarios.mockResolvedValue({ rows, total: 50 });

    const res = await request(app).get('/api/scenarios');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 50 });
    expect(listScenarios).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('accepts custom page and limit params', async () => {
    listScenarios.mockResolvedValue({ rows: [], total: 0 });

    const res = await request(app).get('/api/scenarios?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 3, limit: 10, total: 0 });
    expect(listScenarios).toHaveBeenCalledWith({ page: 3, limit: 10 });
  });
});

describe('GET /api/scenarios/models', () => {
  it('returns list of models', async () => {
    const models = [
      { id: 1, name: 'Monte Carlo' },
      { id: 2, name: 'Linear Regression' },
    ];
    listModels.mockResolvedValue(models);

    const res = await request(app).get('/api/scenarios/models');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(listModels).toHaveBeenCalledOnce();
  });

  it('returns empty array when no models exist', async () => {
    listModels.mockResolvedValue([]);

    const res = await request(app).get('/api/scenarios/models');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/scenarios/compare', () => {
  it('returns comparison data for given ids and metric', async () => {
    const data = [
      { scenario_id: 1, metric: 'revenue', value: 100 },
      { scenario_id: 2, metric: 'revenue', value: 120 },
    ];
    compareScenarios.mockResolvedValue(data);

    const res = await request(app).get(
      '/api/scenarios/compare?ids=1,2&metric=revenue'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(compareScenarios).toHaveBeenCalledWith([1, 2], 'revenue');
  });

  it('returns 400 when ids param is missing', async () => {
    const res = await request(app).get('/api/scenarios/compare?metric=revenue');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ids/);
  });

  it('returns 400 when metric param is missing', async () => {
    const res = await request(app).get('/api/scenarios/compare?ids=1,2');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/metric/);
  });
});

describe('GET /api/scenarios/:id', () => {
  it('returns a scenario by id', async () => {
    const scenario = { id: 5, name: 'Growth scenario', status: 'complete' };
    getScenario.mockResolvedValue(scenario);

    const res = await request(app).get('/api/scenarios/5');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(scenario);
    expect(getScenario).toHaveBeenCalledWith(5);
  });

  it('returns 404 when scenario not found', async () => {
    getScenario.mockResolvedValue(null);

    const res = await request(app).get('/api/scenarios/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 500 on database error', async () => {
    getScenario.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/scenarios/5');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/scenarios/:id/results', () => {
  it('returns results for a scenario', async () => {
    const results = [
      { metric_name: 'revenue', value: 100 },
      { metric_name: 'employment', value: 500 },
    ];
    getScenarioResults.mockResolvedValue(results);

    const res = await request(app).get('/api/scenarios/3/results');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(getScenarioResults).toHaveBeenCalledWith(3, {
      entityType: undefined,
      metricName: undefined,
      entityId: undefined,
    });
  });

  it('passes filter query params', async () => {
    getScenarioResults.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/scenarios/3/results?entity_type=company&metric=revenue&entity_id=42'
    );

    expect(res.status).toBe(200);
    expect(getScenarioResults).toHaveBeenCalledWith(3, {
      entityType: 'company',
      metricName: 'revenue',
      entityId: '42',
    });
  });
});

describe('GET /api/scenarios/forecasts/:entityType/:entityId', () => {
  it('returns forecasts for an entity', async () => {
    const forecasts = [
      { metric_name: 'revenue', value: 200, period: 'Q1 2026' },
    ];
    getLatestForecasts.mockResolvedValue(forecasts);

    const res = await request(app).get('/api/scenarios/forecasts/company/7');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(getLatestForecasts).toHaveBeenCalledWith({
      entityType: 'company',
      entityId: '7',
      metricNames: undefined,
    });
  });
});
