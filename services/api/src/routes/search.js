import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  const db = getDb();
  const { vertical } = req.params;
  const { q, limit = 20 } = req.query;

  if (!q || q.length < 2) return res.json({ results: [], total: 0 });

  try {
    // FTS5 search
    const rows = db.prepare(`
      SELECT c.* FROM companies_fts fts
      JOIN companies c ON c.rowid = fts.rowid
      WHERE companies_fts MATCH ? AND c.vertical_id = ?
      ORDER BY rank
      LIMIT ?
    `).all(q + '*', vertical, parseInt(limit));

    const results = rows.map(row => ({
      id: row.id, name: row.name, stage: row.stage,
      sector: JSON.parse(row.sector || '[]'),
      city: row.city, region: row.region, funding: row.funding,
      momentum: row.momentum, description: row.description,
    }));

    res.json({ results, total: results.length });
  } catch (e) {
    // Fallback to LIKE search if FTS fails
    const rows = db.prepare(`
      SELECT * FROM companies
      WHERE vertical_id = ? AND (name LIKE ? OR description LIKE ? OR city LIKE ?)
      ORDER BY momentum DESC
      LIMIT ?
    `).all(vertical, `%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit));

    const results = rows.map(row => ({
      id: row.id, name: row.name, stage: row.stage,
      sector: JSON.parse(row.sector || '[]'),
      city: row.city, region: row.region, funding: row.funding,
      momentum: row.momentum, description: row.description,
    }));

    res.json({ results, total: results.length });
  }
});

export default router;
