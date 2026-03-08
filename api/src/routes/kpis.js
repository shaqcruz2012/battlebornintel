import { Router } from 'express';
import { getKpis, getSectorStats } from '../db/queries/kpis.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { stage, region, sector } = req.query;
    const data = await getKpis({ stage, region, sector });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/sectors', async (req, res, next) => {
  try {
    const { region } = req.query;
    const data = await getSectorStats({ region });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
