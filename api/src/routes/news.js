import { Router } from 'express';
import pool from '../db/pool.js';
import { getRelevantNews, refreshNewsCache } from '../services/newsAggregator.js';

const router = Router();

// Track last refresh time
let lastRefreshAt = null;

// GET /api/news/frontier?minRelevance=5&limit=30 — cached HN + frontier news
router.get('/frontier', async (req, res, next) => {
  try {
    const minRelevance = parseFloat(req.query.minRelevance) || 5;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const sector = req.query.sector || null;
    const nevadaOnly = req.query.nevadaOnly === 'true';

    let query = `SELECT * FROM frontier_news_cache WHERE relevance >= $1`;
    const params = [minRelevance];
    let idx = 2;

    if (nevadaOnly) {
      query += ` AND nevada_match = true`;
    }

    if (sector) {
      query += ` AND $${idx} = ANY(matched_sectors)`;
      params.push(sector);
      idx++;
    }

    query += ` ORDER BY relevance DESC, score DESC LIMIT $${idx}`;
    params.push(limit);

    const { rows } = await pool.query(query, params);

    res.json({
      data: rows,
      meta: {
        count: rows.length,
        lastRefreshAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/nevada — only Nevada-direct matches
router.get('/nevada', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const { rows } = await pool.query(
      `SELECT * FROM frontier_news_cache
       WHERE nevada_match = true
       ORDER BY relevance DESC, score DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ data: rows, meta: { count: rows.length, lastRefreshAt } });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/sectors — sector heatmap data
router.get('/sectors', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT unnest(matched_sectors) AS sector, COUNT(*) AS count, AVG(relevance) AS avg_relevance
       FROM frontier_news_cache
       WHERE fetched_at > NOW() - INTERVAL '24 hours'
       GROUP BY sector
       ORDER BY count DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/news/refresh — force refresh from HN API (rate limited)
router.post('/refresh', async (req, res, next) => {
  try {
    const count = await refreshNewsCache(pool);
    lastRefreshAt = new Date().toISOString();
    res.json({ success: true, cached: count, refreshedAt: lastRefreshAt });
  } catch (err) {
    next(err);
  }
});

// Export the setter so index.js can update lastRefreshAt after background refresh
export function setLastRefreshAt(ts) {
  lastRefreshAt = ts;
}

export default router;
