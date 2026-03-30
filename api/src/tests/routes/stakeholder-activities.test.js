import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/stakeholder-activities.js', () => ({
  getStakeholderActivities: vi.fn(),
  getCompanyActivities: vi.fn(),
  getActivitiesByLocationAndDateRange: vi.fn(),
  countActivitiesByType: vi.fn(),
  countActivitiesByLocation: vi.fn(),
}));

import {
  getStakeholderActivities,
  getCompanyActivities,
  getActivitiesByLocationAndDateRange,
  countActivitiesByType,
  countActivitiesByLocation,
} from '../../db/queries/stakeholder-activities.js';
import router from '../../routes/stakeholder-activities.js';

const app = createApp(router, '/api/stakeholder-activities');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/stakeholder-activities', () => {
  it('returns activities with data and meta', async () => {
    const rows = [
      { id: 1, type: 'funding', location: 'las_vegas', description: 'Series A' },
      { id: 2, type: 'partnership', location: 'reno', description: 'Joint venture' },
    ];
    getStakeholderActivities.mockResolvedValue({ rows, totalCount: 2 });

    const res = await request(app).get('/api/stakeholder-activities');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.count).toBe(2);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.limit).toBe(100);
    expect(res.body.meta.hasMore).toBe(false);
    expect(getStakeholderActivities).toHaveBeenCalledOnce();
  });

  it('filters by type query parameter', async () => {
    const rows = [{ id: 1, type: 'funding', location: 'las_vegas' }];
    getStakeholderActivities.mockResolvedValue({ rows, totalCount: 1 });

    const res = await request(app).get('/api/stakeholder-activities?type=funding');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(getStakeholderActivities).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'funding' }),
    );
  });

  it('filters by since and until date parameters', async () => {
    getStakeholderActivities.mockResolvedValue({ rows: [], totalCount: 0 });

    const res = await request(app).get(
      '/api/stakeholder-activities?since=2025-01-01&until=2025-06-30',
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(getStakeholderActivities).toHaveBeenCalledWith(
      expect.objectContaining({ since: '2025-01-01', until: '2025-06-30' }),
    );
  });

  it('returns 400 for invalid since date format', async () => {
    const res = await request(app).get('/api/stakeholder-activities?since=not-a-date');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/since/);
  });

  it('returns 400 for invalid until date format', async () => {
    const res = await request(app).get('/api/stakeholder-activities?until=2025/01/01');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/until/);
  });

  it('returns 500 on database error', async () => {
    getStakeholderActivities.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/stakeholder-activities');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/stakeholder-activities/company/:companyId', () => {
  it('returns company-specific activities', async () => {
    const data = [
      { id: 1, type: 'funding', company_id: 5 },
      { id: 2, type: 'award', company_id: 5 },
    ];
    getCompanyActivities.mockResolvedValue(data);

    const res = await request(app).get('/api/stakeholder-activities/company/5');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.count).toBe(2);
    expect(getCompanyActivities).toHaveBeenCalledWith(5, 20);
  });

  it('returns 400 for invalid companyId', async () => {
    const res = await request(app).get('/api/stakeholder-activities/company/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/companyId/);
    expect(getCompanyActivities).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    getCompanyActivities.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/stakeholder-activities/company/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/stakeholder-activities/location/:location', () => {
  it('returns location activities', async () => {
    const data = [
      { id: 1, type: 'funding', location: 'reno' },
    ];
    getActivitiesByLocationAndDateRange.mockResolvedValue(data);

    const res = await request(app).get('/api/stakeholder-activities/location/reno');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.location).toBe('reno');
    expect(res.body.meta.dateRange).toBeDefined();
    expect(getActivitiesByLocationAndDateRange).toHaveBeenCalledWith(
      'reno',
      expect.any(String),
      expect.any(String),
    );
  });

  it('returns 500 on database error', async () => {
    getActivitiesByLocationAndDateRange.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/stakeholder-activities/location/reno');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/stakeholder-activities/stats/by-type', () => {
  it('returns activity type breakdown', async () => {
    const data = [
      { type: 'funding', count: 15 },
      { type: 'partnership', count: 8 },
      { type: 'award', count: 3 },
    ];
    countActivitiesByType.mockResolvedValue(data);

    const res = await request(app).get('/api/stakeholder-activities/stats/by-type');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(countActivitiesByType).toHaveBeenCalledOnce();
  });

  it('returns 500 on database error', async () => {
    countActivitiesByType.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/stakeholder-activities/stats/by-type');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/stakeholder-activities/stats/by-location', () => {
  it('returns location breakdown', async () => {
    const data = [
      { location: 'las_vegas', count: 20 },
      { location: 'reno', count: 12 },
    ];
    countActivitiesByLocation.mockResolvedValue(data);

    const res = await request(app).get('/api/stakeholder-activities/stats/by-location');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(countActivitiesByLocation).toHaveBeenCalledOnce();
  });

  it('returns 500 on database error', async () => {
    countActivitiesByLocation.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/stakeholder-activities/stats/by-location');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
