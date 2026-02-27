import { Router } from 'express';
import { getDb, invalidateMetricsCache } from '../db.js';

const router = Router({ mergeParams: true });

// -- Graph Funds --
router.get('/funds', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM graph_funds WHERE vertical_id = ?').all(req.params.vertical)
    .map(r => ({ id: r.id, name: r.name, type: r.type })));
});

router.post('/funds', (req, res) => {
  const db = getDb();
  const { id, name, type } = req.body;
  if (!id || !name || !type) return res.status(400).json({ error: 'id, name, type required' });
  db.prepare('INSERT INTO graph_funds (id, vertical_id, name, type) VALUES (?, ?, ?, ?)')
    .run(id, req.params.vertical, name, type);
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json({ id, name, type });
});

router.delete('/funds/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM graph_funds WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

// -- People --
router.get('/people', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM people WHERE vertical_id = ?').all(req.params.vertical)
    .map(r => ({ id: r.id, name: r.name, role: r.role, companyId: r.company_id, note: r.note })));
});

router.post('/people', (req, res) => {
  const db = getDb();
  const p = req.body;
  if (!p.id || !p.name) return res.status(400).json({ error: 'id, name required' });
  db.prepare('INSERT INTO people (id, vertical_id, name, role, company_id, note) VALUES (?, ?, ?, ?, ?, ?)')
    .run(p.id, req.params.vertical, p.name, p.role || '', p.companyId ?? null, p.note || '');
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json(p);
});

router.put('/people/:id', (req, res) => {
  const db = getDb();
  const { vertical, id } = req.params;
  const p = req.body;
  const updates = {};
  if (p.name !== undefined) updates.name = p.name;
  if (p.role !== undefined) updates.role = p.role;
  if (p.companyId !== undefined) updates.company_id = p.companyId;
  if (p.note !== undefined) updates.note = p.note;
  if (Object.keys(updates).length > 0) {
    const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE people SET ${sets}, updated_at = datetime('now') WHERE id = ? AND vertical_id = ?`)
      .run(...Object.values(updates), id, vertical);
  }
  const row = db.prepare('SELECT * FROM people WHERE id = ? AND vertical_id = ?').get(id, vertical);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ id: row.id, name: row.name, role: row.role, companyId: row.company_id, note: row.note });
});

router.delete('/people/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM people WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

// -- Externals --
router.get('/externals', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM externals WHERE vertical_id = ?').all(req.params.vertical)
    .map(r => ({ id: r.id, name: r.name, etype: r.etype, note: r.note })));
});

router.post('/externals', (req, res) => {
  const db = getDb();
  const x = req.body;
  if (!x.id || !x.name) return res.status(400).json({ error: 'id, name required' });
  db.prepare('INSERT INTO externals (id, vertical_id, name, etype, note) VALUES (?, ?, ?, ?, ?)')
    .run(x.id, req.params.vertical, x.name, x.etype || '', x.note || '');
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json(x);
});

router.delete('/externals/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM externals WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

// -- Accelerators --
router.get('/accelerators', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM accelerators WHERE vertical_id = ?').all(req.params.vertical)
    .map(r => ({ id: r.id, name: r.name, atype: r.atype, city: r.city, region: r.region, founded: r.founded, note: r.note })));
});

router.post('/accelerators', (req, res) => {
  const db = getDb();
  const a = req.body;
  if (!a.id || !a.name) return res.status(400).json({ error: 'id, name required' });
  db.prepare('INSERT INTO accelerators (id, vertical_id, name, atype, city, region, founded, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(a.id, req.params.vertical, a.name, a.atype || '', a.city || '', a.region || '', a.founded ?? null, a.note || '');
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json(a);
});

router.delete('/accelerators/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM accelerators WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

// -- Ecosystem Orgs --
router.get('/ecosystemOrgs', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM ecosystem_orgs WHERE vertical_id = ?').all(req.params.vertical)
    .map(r => ({ id: r.id, name: r.name, etype: r.etype, city: r.city, region: r.region, note: r.note })));
});

router.post('/ecosystemOrgs', (req, res) => {
  const db = getDb();
  const e = req.body;
  if (!e.id || !e.name) return res.status(400).json({ error: 'id, name required' });
  db.prepare('INSERT INTO ecosystem_orgs (id, vertical_id, name, etype, city, region, note) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(e.id, req.params.vertical, e.name, e.etype || '', e.city || '', e.region || '', e.note || '');
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json(e);
});

router.delete('/ecosystemOrgs/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM ecosystem_orgs WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

// -- Edges --
router.get('/edges', (req, res) => {
  const db = getDb();
  const { source, target, rel } = req.query;
  let sql = 'SELECT * FROM edges WHERE vertical_id = ?';
  const params = [req.params.vertical];
  if (source) { sql += ' AND source = ?'; params.push(source); }
  if (target) { sql += ' AND target = ?'; params.push(target); }
  if (rel) { sql += ' AND rel = ?'; params.push(rel); }
  res.json(db.prepare(sql).all(...params).map(r => {
    const e = { id: r.id, source: r.source, target: r.target, rel: r.rel };
    if (r.note != null) e.note = r.note;
    if (r.year != null) e.y = r.year;
    return e;
  }));
});

router.post('/edges', (req, res) => {
  const db = getDb();
  const e = req.body;
  if (!e.source || !e.target || !e.rel) return res.status(400).json({ error: 'source, target, rel required' });
  const result = db.prepare('INSERT INTO edges (vertical_id, source, target, rel, note, year) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.params.vertical, e.source, e.target, e.rel, e.note ?? null, e.y ?? null);
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json({ id: result.lastInsertRowid, ...e });
});

router.post('/edges/bulk', (req, res) => {
  const db = getDb();
  const edges = req.body;
  if (!Array.isArray(edges)) return res.status(400).json({ error: 'Expected array of edges' });
  const insert = db.prepare('INSERT INTO edges (vertical_id, source, target, rel, note, year) VALUES (?, ?, ?, ?, ?, ?)');
  const insertMany = db.transaction((items) => {
    for (const e of items) {
      insert.run(req.params.vertical, e.source, e.target, e.rel, e.note ?? null, e.y ?? null);
    }
  });
  insertMany(edges);
  invalidateMetricsCache(req.params.vertical);
  res.status(201).json({ inserted: edges.length });
});

router.delete('/edges/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM edges WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  invalidateMetricsCache(req.params.vertical);
  res.json({ deleted: true });
});

export default router;
