import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router({ mergeParams: true });

function jsonify(val) {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
  return val;
}

// ==================== Dockets ====================

router.get('/dockets', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM dockets WHERE vertical_id = ?').all(req.params.vertical).map(r => ({
    id: r.id, title: r.title, agency: r.agency, status: r.status,
    openDate: r.open_date, lastActivity: r.last_activity, nextDeadline: r.next_deadline,
    projects: JSON.parse(r.projects || '[]'), filings: JSON.parse(r.filings || '[]'),
    impact: r.impact, url: r.url,
  })));
});

router.post('/dockets', (req, res) => {
  const db = getDb();
  const d = req.body;
  if (!d.id || !d.title || !d.agency) return res.status(400).json({ error: 'id, title, agency required' });
  db.prepare(`INSERT INTO dockets (id, vertical_id, title, agency, status, open_date, last_activity, next_deadline, projects, filings, impact, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    d.id, req.params.vertical, d.title, d.agency, d.status || 'open',
    d.openDate ?? null, d.lastActivity ?? null, d.nextDeadline ?? null,
    jsonify(d.projects || []), jsonify(d.filings || []), d.impact || '', d.url ?? null
  );
  res.status(201).json(d);
});

router.put('/dockets/:id', (req, res) => {
  const db = getDb();
  const { vertical, id } = req.params;
  const d = req.body;
  const updates = {};
  if (d.title !== undefined) updates.title = d.title;
  if (d.agency !== undefined) updates.agency = d.agency;
  if (d.status !== undefined) updates.status = d.status;
  if (d.openDate !== undefined) updates.open_date = d.openDate;
  if (d.lastActivity !== undefined) updates.last_activity = d.lastActivity;
  if (d.nextDeadline !== undefined) updates.next_deadline = d.nextDeadline;
  if (d.projects !== undefined) updates.projects = jsonify(d.projects);
  if (d.filings !== undefined) updates.filings = jsonify(d.filings);
  if (d.impact !== undefined) updates.impact = d.impact;
  if (d.url !== undefined) updates.url = d.url;

  if (Object.keys(updates).length > 0) {
    const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE dockets SET ${sets} WHERE id = ? AND vertical_id = ?`)
      .run(...Object.values(updates), id, vertical);
  }
  res.json({ updated: true });
});

router.delete('/dockets/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM dockets WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

// ==================== PPAs ====================

router.get('/ppas', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM ppas WHERE vertical_id = ?').all(req.params.vertical).map(r => {
    const p = { id: r.id, project: r.project, buyer: r.buyer, technology: r.technology };
    if (r.project_id != null) p.projectId = r.project_id;
    if (r.capacity_mw != null) p.capacityMW = r.capacity_mw;
    if (r.storage_mwh != null) p.storageMWh = r.storage_mwh;
    if (r.price_per_mwh != null) p.pricePerMWh = r.price_per_mwh;
    if (r.term_years != null) p.termYears = r.term_years;
    if (r.execution_date != null) p.executionDate = r.execution_date;
    if (r.cod_date != null) p.codDate = r.cod_date;
    if (r.docket_ref != null) p.docketRef = r.docket_ref;
    if (r.notes != null) p.notes = r.notes;
    return p;
  }));
});

router.post('/ppas', (req, res) => {
  const db = getDb();
  const p = req.body;
  if (!p.id || !p.project) return res.status(400).json({ error: 'id, project required' });
  db.prepare(`INSERT INTO ppas (id, vertical_id, project, project_id, buyer, technology, capacity_mw, storage_mwh, price_per_mwh, term_years, execution_date, cod_date, docket_ref, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    p.id, req.params.vertical, p.project, p.projectId ?? null, p.buyer || '', p.technology || '',
    p.capacityMW ?? null, p.storageMWh ?? null, p.pricePerMWh ?? null, p.termYears ?? null,
    p.executionDate ?? null, p.codDate ?? null, p.docketRef ?? null, p.notes ?? null
  );
  res.status(201).json(p);
});

router.delete('/ppas/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM ppas WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

// ==================== Queue ====================

router.get('/queue', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM queue_entries WHERE vertical_id = ?').all(req.params.vertical).map(r => {
    const q = { id: r.id, projectName: r.project_name, utility: r.utility, requestMW: r.request_mw, type: r.type, substation: r.substation, status: r.status, county: r.county };
    if (r.project_id != null) q.projectId = r.project_id;
    if (r.application_date != null) q.applicationDate = r.application_date;
    if (r.study_complete_date != null) q.studyCompleteDate = r.study_complete_date;
    if (r.estimated_cod != null) q.estimatedCOD = r.estimated_cod;
    if (r.notes != null) q.notes = r.notes;
    return q;
  }));
});

router.post('/queue', (req, res) => {
  const db = getDb();
  const q = req.body;
  if (!q.id || !q.projectName) return res.status(400).json({ error: 'id, projectName required' });
  db.prepare(`INSERT INTO queue_entries (id, vertical_id, project_id, project_name, utility, request_mw, type, substation, status, application_date, study_complete_date, estimated_cod, county, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    q.id, req.params.vertical, q.projectId ?? null, q.projectName, q.utility || '',
    q.requestMW || 0, q.type || '', q.substation || '', q.status || '',
    q.applicationDate ?? null, q.studyCompleteDate ?? null, q.estimatedCOD ?? null,
    q.county || '', q.notes ?? null
  );
  res.status(201).json(q);
});

router.delete('/queue/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM queue_entries WHERE id = ? AND vertical_id = ?').run(req.params.id, req.params.vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

// ==================== Benchmarks ====================

router.get('/benchmarks', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM benchmarks WHERE vertical_id = ?').get(req.params.vertical);
  if (!row) return res.json({});
  res.json(JSON.parse(row.data_json));
});

router.put('/benchmarks', (req, res) => {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO benchmarks (vertical_id, data_json) VALUES (?, ?)')
    .run(req.params.vertical, JSON.stringify(req.body));
  res.json({ updated: true });
});

export default router;
