import { Router } from 'express';
import { getKpis, getKPIsWithForecasts, getSectorStats, getEcosystemForecastSummary } from '../db/queries/kpis.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { stage, region, sector, forecasts } = req.query;

    // When forecasts are requested (and no stage/region filters that the
    // forecast query doesn't support), use the enriched query.
    if (forecasts === 'true' && !stage && !region) {
      const data = await getKPIsWithForecasts(sector);
      return res.json({ data });
    }

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

router.get('/ecosystem-forecast', async (req, res, next) => {
  try {
    const data = await getEcosystemForecastSummary();
    if (!data) {
      return res.json({ data: null, message: 'No completed scenario available' });
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
