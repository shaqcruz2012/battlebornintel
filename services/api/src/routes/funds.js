import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router({ mergeParams: true });

function rowToFund(row) {
  return {
    id: row.id, name: row.name, type: row.type,
    allocated: row.allocated, deployed: row.deployed,
    leverage: row.leverage, companies: row.companies, thesis: row.thesis,
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM funds WHERE vertical_id = ?').all(req.params.vertical).map(rowToFund));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM funds WHERE id = ? AND vertical_id = ?').get(req.params.id, req.params.vertical);
  if (!row) return res.status(404).json({ error: 'Fund not found' });
  res.json(rowToFund(row));
});

router.post('/', (req, res) => {
  const db = getDb();
  const f = req.body;
  const { vertical } = req.params;
  if (!f.id || !f.name || !f.type) return res.status(400).json({ error: 'id, name, and type are required' });

  db.prepare('INSERT INTO funds (id, vertical_id, name, type, allocated, deployed, leverage, companies, thesis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(f.id, vertical, f.name, f.type, f.allocated ?? null, f.deployed || 0, f.leverage ?? null, f.companies || 0, f.thesis || '');

  const row = db.prepare('SELECT * FROM funds WHERE id = ? AND vertical_id = ?').get(f.id, vertical);
  res.status(201).json(rowToFund(row));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { vertical, id } = req.params;
  const f = req.body;
  const updates = {};
  if (f.name !== undefined) updates.name = f.name;
  if (f.type !== undefined) updates.type = f.type;
  if (f.allocated !== undefined) updates.allocated = f.allocated;
  if (f.deployed !== undefined) updates.deployed = f.deployed;
  if (f.leverage !== undefined) updates.leverage = f.leverage;
  if (f.companies !== undefined) updates.companies = f.companies;
  if (f.thesis !== undefined) updates.thesis = f.thesis;

  if (Object.keys(updates).length === 0) {
    const row = db.prepare('SELECT * FROM funds WHERE id = ? AND vertical_id = ?').get(id, vertical);
    return res.json(rowToFund(row));
  }

  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE funds SET ${sets}, updated_at = datetime('now') WHERE id = ? AND vertical_id = ?`)
    .run(...Object.values(updates), id, vertical);

  const row = db.prepare('SELECT * FROM funds WHERE id = ? AND vertical_id = ?').get(id, vertical);
  res.json(rowToFund(row));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM funds WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Fund not found' });
  res.json({ deleted: true });
});

export default router;
