import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM timeline_events WHERE vertical_id = ? ORDER BY date DESC').all(req.params.vertical);
  res.json(rows.map(r => ({
    id: r.id, date: r.date, type: r.type, company: r.company,
    companyId: r.company_id, detail: r.detail, icon: r.icon,
  })));
});

router.post('/', (req, res) => {
  const db = getDb();
  const t = req.body;
  const { vertical } = req.params;
  if (!t.date || !t.type) return res.status(400).json({ error: 'date and type are required' });

  const result = db.prepare('INSERT INTO timeline_events (vertical_id, date, type, company, company_id, detail, icon) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(vertical, t.date, t.type, t.company || '', t.companyId ?? null, t.detail || '', t.icon || '');

  res.status(201).json({ id: result.lastInsertRowid, ...t });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM timeline_events WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
  res.json({ deleted: true });
});

export default router;
