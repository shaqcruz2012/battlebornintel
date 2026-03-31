import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/funds.js', () => ({
  getAllFunds: vi.fn(),
  getFundById: vi.fn(),
}));

import { getAllFunds, getFundById } from '../../db/queries/funds.js';
import router from '../../routes/funds.js';

const app = createApp(router, '/api/funds');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/funds', () => {
  it('returns fund list', async () => {
    const funds = [
      { id: 'bbv', name: 'Battle Born Venture', allocated_m: 10, deployed_m: 4 },
      { id: 'ssbci1', name: 'SSBCI Fund I', allocated_m: 50, deployed_m: 20 },
    ];
    getAllFunds.mockResolvedValue(funds);

    const res = await request(app).get('/api/funds');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Battle Born Venture');
    expect(getAllFunds).toHaveBeenCalledOnce();
  });

  it('returns 500 on DB error', async () => {
    getAllFunds.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/funds');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/funds/:id', () => {
  it('returns single fund with portfolio', async () => {
    const fund = {
      id: 'bbv',
      name: 'Battle Born Venture',
      allocated_m: 10,
      deployed_m: 4,
      portfolio: [{ company_id: 1, name: 'Acme Corp' }],
    };
    getFundById.mockResolvedValue(fund);

    const res = await request(app).get('/api/funds/bbv');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Battle Born Venture');
    expect(res.body.data.portfolio).toHaveLength(1);
    expect(getFundById).toHaveBeenCalledWith('bbv');
  });

  it('returns 404 for unknown fund', async () => {
    getFundById.mockResolvedValue(null);

    const res = await request(app).get('/api/funds/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fund not found');
  });

  it('returns 500 on DB error', async () => {
    getFundById.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/funds/bbv');

    expect(res.status).toBe(500);
  });
});
