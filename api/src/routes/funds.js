import { Router } from 'express';
import { getAllFunds, getFundById } from '../db/queries/funds.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getAllFunds();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await getFundById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Fund not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
