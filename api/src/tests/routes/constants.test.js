import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/constants.js', () => ({
  getAllConstants: vi.fn(),
}));

import { getAllConstants } from '../../db/queries/constants.js';
import router from '../../routes/constants.js';

const app = createApp(router, '/api/constants');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/constants', () => {
  it('returns constants data', async () => {
    const constants = {
      stages: ['pre_seed', 'seed', 'series_a'],
      sectors: ['technology', 'healthcare'],
    };
    getAllConstants.mockResolvedValue(constants);

    const res = await request(app).get('/api/constants');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(constants);
    expect(getAllConstants).toHaveBeenCalledOnce();
  });

  it('returns 500 on DB error', async () => {
    getAllConstants.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/constants');

    expect(res.status).toBe(500);
  });
});
