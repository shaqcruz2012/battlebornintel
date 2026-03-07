import { Router } from 'express';
import { getAllConstants } from '../db/queries/constants.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getAllConstants();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
