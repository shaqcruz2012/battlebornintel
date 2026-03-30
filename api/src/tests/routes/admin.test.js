import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../services/scoringService.js', () => {
  return {
    recomputeAllScores: vi.fn(),
  };
});

vi.mock('../../services/graphService.js', () => {
  return {
    recomputeAndCacheMetrics: vi.fn(),
  };
});

vi.mock('../../db/queries/indicators.js', () => {
  return {
    refreshIndicators: vi.fn(),
  };
});

vi.mock('../../db/queries/admin.js', () => {
  return {
    getAgentStatus: vi.fn(),
    getDataFreshness: vi.fn(),
  };
});

vi.mock('../../middleware/cache.js', () => {
  return {
    clearCache: vi.fn(),
  };
});

import { recomputeAllScores } from '../../services/scoringService.js';
import { recomputeAndCacheMetrics } from '../../services/graphService.js';
import { refreshIndicators } from '../../db/queries/indicators.js';
import { getAgentStatus, getDataFreshness } from '../../db/queries/admin.js';
import { clearCache } from '../../middleware/cache.js';
import router, { resetAdminPostLimit } from '../../routes/admin.js';

const app = createApp(router, '/api/admin');

beforeEach(() => {
  vi.resetAllMocks();
  resetAdminPostLimit();
});

describe('POST /api/admin/recompute-scores', () => {
  it('returns count and clears cache', async () => {
    recomputeAllScores.mockResolvedValue(42);

    const res = await request(app).post('/api/admin/recompute-scores');

    expect(res.status).toBe(200);
    expect(res.body.data.companiesScored).toBe(42);
    expect(res.body.message).toBe('Scores recomputed');
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it('returns 500 on service error', async () => {
    recomputeAllScores.mockRejectedValue(new Error('scoring failed'));

    const res = await request(app).post('/api/admin/recompute-scores');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/admin/recompute-graph', () => {
  it('returns count and clears cache', async () => {
    recomputeAndCacheMetrics.mockResolvedValue(150);

    const res = await request(app).post('/api/admin/recompute-graph');

    expect(res.status).toBe(200);
    expect(res.body.data.nodesCached).toBe(150);
    expect(res.body.message).toBe('Graph metrics recomputed');
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it('returns 500 on service error', async () => {
    recomputeAndCacheMetrics.mockRejectedValue(new Error('graph computation failed'));

    const res = await request(app).post('/api/admin/recompute-graph');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/admin/recompute-all', () => {
  it('runs all recomputes and clears cache', async () => {
    recomputeAllScores.mockResolvedValue(42);
    recomputeAndCacheMetrics.mockResolvedValue(150);
    refreshIndicators.mockResolvedValue();

    const res = await request(app).post('/api/admin/recompute-all');

    expect(res.status).toBe(200);
    expect(res.body.data.companiesScored).toBe(42);
    expect(res.body.data.nodesCached).toBe(150);
    expect(res.body.data.indicatorsRefreshed).toBe(true);
    expect(res.body.message).toBe('All computations complete');
    expect(recomputeAllScores).toHaveBeenCalledOnce();
    expect(recomputeAndCacheMetrics).toHaveBeenCalledOnce();
    expect(refreshIndicators).toHaveBeenCalledOnce();
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it('returns 500 on service error', async () => {
    recomputeAllScores.mockRejectedValue(new Error('scoring failed'));

    const res = await request(app).post('/api/admin/recompute-all');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/admin/refresh-indicators', () => {
  it('refreshes materialized view and clears cache', async () => {
    refreshIndicators.mockResolvedValue();

    const res = await request(app).post('/api/admin/refresh-indicators');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
    expect(res.body.message).toBe('Economic indicators refreshed');
    expect(clearCache).toHaveBeenCalledOnce();
  });

  it('returns 500 on service error', async () => {
    refreshIndicators.mockRejectedValue(new Error('refresh failed'));

    const res = await request(app).post('/api/admin/refresh-indicators');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/admin/agent-status', () => {
  it('returns agent health data', async () => {
    const agents = [
      { name: 'company_analyst', last_run: '2026-03-28', status: 'completed' },
      { name: 'risk_assessor', last_run: '2026-03-29', status: 'completed' },
    ];
    getAgentStatus.mockResolvedValue(agents);

    const res = await request(app).get('/api/admin/agent-status');

    expect(res.status).toBe(200);
    expect(res.body.data.agents).toHaveLength(2);
    expect(res.body.data.generated_at).toBeDefined();
    expect(res.body.data.window_days).toBe(7);
  });

  it('returns 500 on service error', async () => {
    getAgentStatus.mockRejectedValue(new Error('query failed'));

    const res = await request(app).get('/api/admin/agent-status');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/admin/data-freshness', () => {
  it('returns freshness data', async () => {
    const freshness = [
      { entity_type: 'company', latest: '2026-03-28', count: 100 },
      { entity_type: 'fund', latest: '2026-03-27', count: 15 },
    ];
    getDataFreshness.mockResolvedValue(freshness);

    const res = await request(app).get('/api/admin/data-freshness');

    expect(res.status).toBe(200);
    expect(res.body.data.freshness).toHaveLength(2);
    expect(res.body.data.generated_at).toBeDefined();
  });

  it('returns 500 on service error', async () => {
    getDataFreshness.mockRejectedValue(new Error('query failed'));

    const res = await request(app).get('/api/admin/data-freshness');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
