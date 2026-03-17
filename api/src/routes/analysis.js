import { Router } from 'express';
import {
  getCompanyAnalysis,
  getWeeklyBrief,
  getRiskAssessments,
} from '../db/queries/analysis.js';

const router = Router();

router.get('/company/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const data = await getCompanyAnalysis(id);
    if (!data)
      return res.json({ data: null, message: 'No analysis available yet' });
    res.json({ data: data.content });
  } catch (err) {
    next(err);
  }
});

router.get('/brief', async (req, res, next) => {
  try {
    const { weekStart, weekEnd } = req.query;
    const data = await getWeeklyBrief({ weekStart, weekEnd });
    if (!data)
      return res.json({ data: null, message: 'No brief generated yet' });
    res.json({ data: data.content, generatedAt: data.created_at });
  } catch (err) {
    next(err);
  }
});

router.get('/brief/:weekStart', async (req, res, next) => {
  try {
    const { weekStart } = req.params;
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (!ISO_DATE_RE.test(weekStart)) {
      return res.status(400).json({ error: 'weekStart must be ISO format YYYY-MM-DD' });
    }
    const data = await getWeeklyBrief({ weekStart });
    if (!data)
      return res.json({ data: null, message: 'No brief found for that week' });
    res.json({ data: data.content, generatedAt: data.created_at });
  } catch (err) {
    next(err);
  }
});

router.get('/risks', async (req, res, next) => {
  try {
    const data = await getRiskAssessments();
    res.json({ data: data.map((r) => r.content) });
  } catch (err) {
    next(err);
  }
});

export default router;
