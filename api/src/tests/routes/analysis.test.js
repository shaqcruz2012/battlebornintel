import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../setup.js';

vi.mock('../../db/queries/analysis.js', () => ({
  getCompanyAnalysis: vi.fn(),
  getWeeklyBrief: vi.fn(),
  getRiskAssessments: vi.fn(),
}));

import {
  getCompanyAnalysis,
  getWeeklyBrief,
  getRiskAssessments,
} from '../../db/queries/analysis.js';
import router from '../../routes/analysis.js';

const app = createApp(router, '/api/analysis');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/analysis/company/:id', () => {
  it('returns analysis for a company', async () => {
    const analysis = {
      content: { summary: 'Strong growth trajectory', score: 85 },
    };
    getCompanyAnalysis.mockResolvedValue(analysis);

    const res = await request(app).get('/api/analysis/company/1');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(analysis.content);
    expect(getCompanyAnalysis).toHaveBeenCalledWith(1);
  });

  it('returns 404 when no analysis exists', async () => {
    getCompanyAnalysis.mockResolvedValue(null);

    const res = await request(app).get('/api/analysis/company/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No analysis available yet');
  });

  it('returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/analysis/company/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/id must be a positive integer/);
  });

  it('returns 500 on DB error', async () => {
    getCompanyAnalysis.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/analysis/company/1');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/analysis/brief', () => {
  it('returns weekly brief', async () => {
    const brief = {
      content: { highlights: ['Fund deployed $2M'] },
      created_at: '2026-03-28T06:00:00Z',
    };
    getWeeklyBrief.mockResolvedValue(brief);

    const res = await request(app).get('/api/analysis/brief');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(brief.content);
    expect(res.body.generatedAt).toBe('2026-03-28T06:00:00Z');
    expect(getWeeklyBrief).toHaveBeenCalledOnce();
  });

  it('returns 404 when no brief generated yet', async () => {
    getWeeklyBrief.mockResolvedValue(null);

    const res = await request(app).get('/api/analysis/brief');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No brief generated yet');
  });

  it('returns 500 on DB error', async () => {
    getWeeklyBrief.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/analysis/brief');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/analysis/risks', () => {
  it('returns risk assessments', async () => {
    const risks = [
      { content: { risk: 'Market downturn', severity: 'high' } },
      { content: { risk: 'Talent shortage', severity: 'medium' } },
    ];
    getRiskAssessments.mockResolvedValue(risks);

    const res = await request(app).get('/api/analysis/risks');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].risk).toBe('Market downturn');
    expect(getRiskAssessments).toHaveBeenCalledOnce();
  });

  it('returns empty array when no risks exist', async () => {
    getRiskAssessments.mockResolvedValue([]);

    const res = await request(app).get('/api/analysis/risks');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    getRiskAssessments.mockRejectedValue(new Error('connection refused'));

    const res = await request(app).get('/api/analysis/risks');

    expect(res.status).toBe(500);
  });
});
