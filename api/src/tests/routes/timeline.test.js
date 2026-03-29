import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/timeline.js', () => ({
  getTimeline: vi.fn(),
  getREAPMetrics: vi.fn(),
  getTimelineWeeks: vi.fn(),
  getTimelineWeek: vi.fn(),
}));

import {
  getTimeline,
  getREAPMetrics,
  getTimelineWeeks,
  getTimelineWeek,
} from '../../db/queries/timeline.js';
import router from '../../routes/timeline.js';

const app = createApp(router, '/api/timeline');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/timeline', () => {
  it('returns timeline events', async () => {
    const events = [
      { id: 1, type: 'funding', title: 'Series A raised', event_date: '2026-01-15' },
      { id: 2, type: 'hire', title: 'New CTO hired', event_date: '2026-01-10' },
    ];
    getTimeline.mockResolvedValue(events);

    const res = await request(app).get('/api/timeline');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(getTimeline).toHaveBeenCalledWith({ limit: 30, type: undefined });
  });

  it('filters by type query param', async () => {
    getTimeline.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline?type=funding');

    expect(res.status).toBe(200);
    expect(getTimeline).toHaveBeenCalledWith({ limit: 30, type: 'funding' });
  });

  it('accepts custom limit param', async () => {
    getTimeline.mockResolvedValue([]);

    const res = await request(app).get('/api/timeline?limit=10');

    expect(res.status).toBe(200);
    expect(getTimeline).toHaveBeenCalledWith({ limit: 10, type: undefined });
  });

  it('returns 500 on DB error', async () => {
    getTimeline.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/timeline');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/timeline/reap', () => {
  it('returns REAP metrics', async () => {
    const metrics = { risk_capital: 5, entrepreneurship: 8 };
    getREAPMetrics.mockResolvedValue(metrics);

    const res = await request(app).get('/api/timeline/reap');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(metrics);
    expect(getREAPMetrics).toHaveBeenCalledWith({ since: undefined, until: undefined });
  });

  it('accepts date range params', async () => {
    getREAPMetrics.mockResolvedValue({});

    const res = await request(app).get('/api/timeline/reap?since=2026-01-01&until=2026-03-01');

    expect(res.status).toBe(200);
    expect(getREAPMetrics).toHaveBeenCalledWith({ since: '2026-01-01', until: '2026-03-01' });
  });

  it('returns 400 for invalid since date format', async () => {
    const res = await request(app).get('/api/timeline/reap?since=Jan2026');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/since must be ISO format/);
  });

  it('returns 400 for invalid until date format', async () => {
    const res = await request(app).get('/api/timeline/reap?until=not-a-date');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/until must be ISO format/);
  });

  it('returns 500 on DB error', async () => {
    getREAPMetrics.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/timeline/reap');

    expect(res.status).toBe(500);
  });
});
