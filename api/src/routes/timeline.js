import { Router } from 'express';
import { getTimeline } from '../db/queries/timeline.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { limit, type } = req.query;
    const data = await getTimeline({
      limit: limit ? parseInt(limit, 10) : 30,
      type,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
