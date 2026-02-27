import { Router } from 'express';
import { getDb, invalidateMetricsCache } from '../db.js';

const router = Router({ mergeParams: true });

function jsonify(val) {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
  return val;
}

function rowToCompany(row) {
  const obj = {
    id: row.id, name: row.name, stage: row.stage,
    sector: JSON.parse(row.sector || '[]'), city: row.city, region: row.region,
    funding: row.funding, momentum: row.momentum, employees: row.employees,
    founded: row.founded, description: row.description,
    eligible: JSON.parse(row.eligible || '[]'), lat: row.lat, lng: row.lng,
  };
  if (row.capacity_mw != null) obj.capacityMW = row.capacity_mw;
  if (row.storage_mwh != null) obj.storageMWh = row.storage_mwh;
  if (row.acreage != null) obj.acreage = row.acreage;
  if (row.developer != null) obj.developer = row.developer;
  if (row.epc != null) obj.epc = row.epc;
  if (row.estimated_cod != null) obj.estimatedCOD = row.estimated_cod;
  if (row.docket_ids != null) obj.docketIds = JSON.parse(row.docket_ids);
  if (row.queue_ids != null) obj.queueIds = JSON.parse(row.queue_ids);
  if (row.ppa_ids != null) obj.ppaIds = JSON.parse(row.ppa_ids);
  if (row.key_milestones != null) obj.keyMilestones = JSON.parse(row.key_milestones);
  if (row.risk_factors != null) obj.riskFactors = JSON.parse(row.risk_factors);
  if (row.permitting_score != null) obj.permittingScore = row.permitting_score;
  return obj;
}

// GET /api/:vertical/companies
router.get('/', (req, res) => {
  const db = getDb();
  const { vertical } = req.params;
  const { stage, region, search, sort, limit, offset } = req.query;

  let sql = 'SELECT * FROM companies WHERE vertical_id = ?';
  const params = [vertical];

  if (stage) { sql += ' AND stage = ?'; params.push(stage); }
  if (region) { sql += ' AND region = ?'; params.push(region); }
  if (search) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  if (sort === 'funding') sql += ' ORDER BY funding DESC';
  else if (sort === 'momentum') sql += ' ORDER BY momentum DESC';
  else if (sort === 'employees') sql += ' ORDER BY employees DESC';
  else if (sort === 'name') sql += ' ORDER BY name ASC';
  else sql += ' ORDER BY id ASC';

  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
  if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset)); }

  res.json(db.prepare(sql).all(...params).map(rowToCompany));
});

// GET /api/:vertical/companies/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM companies WHERE id = ? AND vertical_id = ?').get(req.params.id, req.params.vertical);
  if (!row) return res.status(404).json({ error: 'Company not found' });
  res.json(rowToCompany(row));
});

// POST /api/:vertical/companies
router.post('/', (req, res) => {
  const db = getDb();
  const c = req.body;
  const { vertical } = req.params;

  if (!c.name || !c.stage) return res.status(400).json({ error: 'name and stage are required' });

  // Auto-assign id if not provided
  const maxId = db.prepare('SELECT MAX(id) as m FROM companies WHERE vertical_id = ?').get(vertical);
  const id = c.id || (maxId.m || 0) + 1;

  db.prepare(`INSERT INTO companies (
    id, vertical_id, name, stage, sector, city, region, funding, momentum, employees,
    founded, description, eligible, lat, lng,
    capacity_mw, storage_mwh, acreage, developer, epc, estimated_cod,
    docket_ids, queue_ids, ppa_ids, key_milestones, risk_factors, permitting_score
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, vertical, c.name, c.stage, jsonify(c.sector || []), c.city || '', c.region || '',
    c.funding || 0, c.momentum || 50, c.employees || 0, c.founded || 2020,
    c.description || '', jsonify(c.eligible || []), c.lat || 0, c.lng || 0,
    c.capacityMW ?? null, c.storageMWh ?? null, c.acreage ?? null,
    c.developer ?? null, c.epc ?? null, c.estimatedCOD ?? null,
    jsonify(c.docketIds), jsonify(c.queueIds), jsonify(c.ppaIds),
    jsonify(c.keyMilestones), jsonify(c.riskFactors), c.permittingScore ?? null
  );

  invalidateMetricsCache(vertical);
  const row = db.prepare('SELECT * FROM companies WHERE id = ? AND vertical_id = ?').get(id, vertical);
  res.status(201).json(rowToCompany(row));
});

// PUT /api/:vertical/companies/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { vertical, id } = req.params;
  const existing = db.prepare('SELECT * FROM companies WHERE id = ? AND vertical_id = ?').get(id, vertical);
  if (!existing) return res.status(404).json({ error: 'Company not found' });

  const c = req.body;
  const updates = {};
  if (c.name !== undefined) updates.name = c.name;
  if (c.stage !== undefined) updates.stage = c.stage;
  if (c.sector !== undefined) updates.sector = jsonify(c.sector);
  if (c.city !== undefined) updates.city = c.city;
  if (c.region !== undefined) updates.region = c.region;
  if (c.funding !== undefined) updates.funding = c.funding;
  if (c.momentum !== undefined) updates.momentum = c.momentum;
  if (c.employees !== undefined) updates.employees = c.employees;
  if (c.founded !== undefined) updates.founded = c.founded;
  if (c.description !== undefined) updates.description = c.description;
  if (c.eligible !== undefined) updates.eligible = jsonify(c.eligible);
  if (c.lat !== undefined) updates.lat = c.lat;
  if (c.lng !== undefined) updates.lng = c.lng;
  if (c.capacityMW !== undefined) updates.capacity_mw = c.capacityMW;
  if (c.storageMWh !== undefined) updates.storage_mwh = c.storageMWh;
  if (c.acreage !== undefined) updates.acreage = c.acreage;
  if (c.developer !== undefined) updates.developer = c.developer;
  if (c.epc !== undefined) updates.epc = c.epc;
  if (c.estimatedCOD !== undefined) updates.estimated_cod = c.estimatedCOD;
  if (c.docketIds !== undefined) updates.docket_ids = jsonify(c.docketIds);
  if (c.queueIds !== undefined) updates.queue_ids = jsonify(c.queueIds);
  if (c.ppaIds !== undefined) updates.ppa_ids = jsonify(c.ppaIds);
  if (c.keyMilestones !== undefined) updates.key_milestones = jsonify(c.keyMilestones);
  if (c.riskFactors !== undefined) updates.risk_factors = jsonify(c.riskFactors);
  if (c.permittingScore !== undefined) updates.permitting_score = c.permittingScore;

  if (Object.keys(updates).length === 0) return res.json(rowToCompany(existing));

  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE companies SET ${sets}, updated_at = datetime('now') WHERE id = ? AND vertical_id = ?`)
    .run(...Object.values(updates), id, vertical);

  invalidateMetricsCache(vertical);
  const row = db.prepare('SELECT * FROM companies WHERE id = ? AND vertical_id = ?').get(id, vertical);
  res.json(rowToCompany(row));
});

// DELETE /api/:vertical/companies/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { vertical, id } = req.params;
  const result = db.prepare('DELETE FROM companies WHERE id = ? AND vertical_id = ?').run(id, vertical);
  if (result.changes === 0) return res.status(404).json({ error: 'Company not found' });
  invalidateMetricsCache(vertical);
  res.json({ deleted: true });
});

export default router;
