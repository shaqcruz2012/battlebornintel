import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/indicators.js', () => ({
  getIndicators: vi.fn(),
  getIndicatorsSummary: vi.fn(),
  getIndicatorHistory: vi.fn(),
  getIndicatorsByEntity: vi.fn(),
}));

import {
  getIndicators,
  getIndicatorsSummary,
  getIndicatorHistory,
  getIndicatorsByEntity,
} from '../../db/queries/indicators.js';
import router from '../../routes/indicators.js';

const app = createApp(router, '/api/indicators');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/indicators', () => {
  it('returns indicator summary data', async () => {
    const rows = [
      { metric: 'gdp', value: 100, trend: 'up' },
      { metric: 'employment', value: 85, trend: 'stable' },
      { metric: 'innovation', value: 72, trend: 'up' },
    ];
    getIndicatorsSummary.mockResolvedValue(rows);

    const res = await request(app).get('/api/indicators');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(getIndicatorsSummary).toHaveBeenCalledOnce();
  });

  it('returns empty array when no indicators exist', async () => {
    getIndicatorsSummary.mockResolvedValue([]);

    const res = await request(app).get('/api/indicators');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error', async () => {
    getIndicatorsSummary.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/indicators');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/indicators/history/:metric', () => {
  it('returns history for a metric with default limit', async () => {
    const rows = [
      { date: '2025-01-01', value: 100 },
      { date: '2025-02-01', value: 105 },
    ];
    getIndicatorHistory.mockResolvedValue(rows);

    const res = await request(app).get('/api/indicators/history/gdp');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(getIndicatorHistory).toHaveBeenCalledWith('gdp', null, 100);
  });

  it('passes entity_id query param', async () => {
    getIndicatorHistory.mockResolvedValue([]);

    const res = await request(app).get('/api/indicators/history/gdp?entity_id=42');

    expect(res.status).toBe(200);
    expect(getIndicatorHistory).toHaveBeenCalledWith('gdp', '42', 100);
  });

  it('passes custom limit param', async () => {
    getIndicatorHistory.mockResolvedValue([]);

    const res = await request(app).get('/api/indicators/history/gdp?limit=50');

    expect(res.status).toBe(200);
    expect(getIndicatorHistory).toHaveBeenCalledWith('gdp', null, 50);
  });

  it('returns 500 on database error', async () => {
    getIndicatorHistory.mockRejectedValue(new Error('query timeout'));

    const res = await request(app).get('/api/indicators/history/gdp');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/indicators/macro', () => {
  it('returns macro indicators without date range', async () => {
    const rows = [{ metric: 'inflation', value: 3.2 }];
    getIndicators.mockResolvedValue(rows);

    const res = await request(app).get('/api/indicators/macro');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(getIndicators).toHaveBeenCalledWith({
      entity_type: 'macro',
      date_range: undefined,
    });
  });

  it('passes start and end date range', async () => {
    getIndicators.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/indicators/macro?start=2025-01-01&end=2025-06-30'
    );

    expect(res.status).toBe(200);
    expect(getIndicators).toHaveBeenCalledWith({
      entity_type: 'macro',
      date_range: { start: '2025-01-01', end: '2025-06-30' },
    });
  });

  it('returns 500 on database error', async () => {
    getIndicators.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/indicators/macro');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/indicators/regional/:region', () => {
  it('returns indicators for a region', async () => {
    const rows = [
      { metric: 'employment', value: 92 },
      { metric: 'gdp', value: 150 },
    ];
    getIndicatorsByEntity.mockResolvedValue(rows);

    const res = await request(app).get('/api/indicators/regional/southwest');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(getIndicatorsByEntity).toHaveBeenCalledWith(
      'region',
      'southwest',
      undefined
    );
  });

  it('returns empty array for unknown region', async () => {
    getIndicatorsByEntity.mockResolvedValue([]);

    const res = await request(app).get('/api/indicators/regional/nowhere');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on database error', async () => {
    getIndicatorsByEntity.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/indicators/regional/southwest');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
