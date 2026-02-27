/**
 * GET /api/:vertical/data — Full DataPackage endpoint
 * Returns the exact shape the frontend PlatformContext expects.
 */

import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router({ mergeParams: true });

// -- Row-to-object transformers --

function rowToCompany(row) {
  const obj = {
    id: row.id,
    name: row.name,
    stage: row.stage,
    sector: JSON.parse(row.sector || '[]'),
    city: row.city,
    region: row.region,
    funding: row.funding,
    momentum: row.momentum,
    employees: row.employees,
    founded: row.founded,
    description: row.description,
    eligible: JSON.parse(row.eligible || '[]'),
    lat: row.lat,
    lng: row.lng,
  };
  // Enterprise fields — only include if non-null
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

function rowToFund(row) {
  return {
    id: row.id, name: row.name, type: row.type,
    allocated: row.allocated, deployed: row.deployed,
    leverage: row.leverage, companies: row.companies, thesis: row.thesis,
  };
}

function rowToTimelineEvent(row) {
  return {
    date: row.date, type: row.type, company: row.company,
    companyId: row.company_id, detail: row.detail, icon: row.icon,
  };
}

function rowToGraphFund(row) {
  return { id: row.id, name: row.name, type: row.type };
}

function rowToPerson(row) {
  return {
    id: row.id, name: row.name, role: row.role,
    companyId: row.company_id, note: row.note,
  };
}

function rowToExternal(row) {
  return { id: row.id, name: row.name, etype: row.etype, note: row.note };
}

function rowToAccelerator(row) {
  return {
    id: row.id, name: row.name, atype: row.atype,
    city: row.city, region: row.region, founded: row.founded, note: row.note,
  };
}

function rowToEcosystemOrg(row) {
  return {
    id: row.id, name: row.name, etype: row.etype,
    city: row.city, region: row.region, note: row.note,
  };
}

function rowToListing(row) {
  return { companyId: row.company_id, exchange: row.exchange, ticker: row.ticker };
}

function rowToEdge(row) {
  const e = { source: row.source, target: row.target, rel: row.rel };
  if (row.note != null) e.note = row.note;
  if (row.year != null) e.y = row.year;
  return e;
}

function rowToDocket(row) {
  return {
    id: row.id, title: row.title, agency: row.agency, status: row.status,
    openDate: row.open_date, lastActivity: row.last_activity,
    nextDeadline: row.next_deadline,
    projects: JSON.parse(row.projects || '[]'),
    filings: JSON.parse(row.filings || '[]'),
    impact: row.impact, url: row.url,
  };
}

function rowToPPA(row) {
  const p = {
    id: row.id, project: row.project, buyer: row.buyer, technology: row.technology,
  };
  if (row.project_id != null) p.projectId = row.project_id;
  if (row.capacity_mw != null) p.capacityMW = row.capacity_mw;
  if (row.storage_mwh != null) p.storageMWh = row.storage_mwh;
  if (row.price_per_mwh != null) p.pricePerMWh = row.price_per_mwh;
  if (row.term_years != null) p.termYears = row.term_years;
  if (row.execution_date != null) p.executionDate = row.execution_date;
  if (row.cod_date != null) p.codDate = row.cod_date;
  if (row.docket_ref != null) p.docketRef = row.docket_ref;
  if (row.notes != null) p.notes = row.notes;
  return p;
}

function rowToQueue(row) {
  const q = {
    id: row.id, projectName: row.project_name, utility: row.utility,
    requestMW: row.request_mw, type: row.type, substation: row.substation,
    status: row.status, county: row.county,
  };
  if (row.project_id != null) q.projectId = row.project_id;
  if (row.application_date != null) q.applicationDate = row.application_date;
  if (row.study_complete_date != null) q.studyCompleteDate = row.study_complete_date;
  if (row.estimated_cod != null) q.estimatedCOD = row.estimated_cod;
  if (row.notes != null) q.notes = row.notes;
  return q;
}

// -- Main endpoint --

router.get('/', (req, res) => {
  const { vertical } = req.params;
  const db = getDb();

  // Verify vertical exists
  const v = db.prepare('SELECT * FROM verticals WHERE id = ?').get(vertical);
  if (!v) return res.status(404).json({ error: `Vertical '${vertical}' not found` });

  // Fetch all data (all sync — better-sqlite3 advantage)
  const companies = db.prepare('SELECT * FROM companies WHERE vertical_id = ? ORDER BY id').all(vertical).map(rowToCompany);
  const funds = db.prepare('SELECT * FROM funds WHERE vertical_id = ?').all(vertical).map(rowToFund);
  const timeline = db.prepare('SELECT * FROM timeline_events WHERE vertical_id = ? ORDER BY date DESC').all(vertical).map(rowToTimelineEvent);
  const graphFunds = db.prepare('SELECT * FROM graph_funds WHERE vertical_id = ?').all(vertical).map(rowToGraphFund);
  const people = db.prepare('SELECT * FROM people WHERE vertical_id = ?').all(vertical).map(rowToPerson);
  const externals = db.prepare('SELECT * FROM externals WHERE vertical_id = ?').all(vertical).map(rowToExternal);
  const accelerators = db.prepare('SELECT * FROM accelerators WHERE vertical_id = ?').all(vertical).map(rowToAccelerator);
  const ecosystemOrgs = db.prepare('SELECT * FROM ecosystem_orgs WHERE vertical_id = ?').all(vertical).map(rowToEcosystemOrg);
  const listings = db.prepare('SELECT * FROM listings WHERE vertical_id = ?').all(vertical).map(rowToListing);
  const verifiedEdges = db.prepare('SELECT * FROM edges WHERE vertical_id = ?').all(vertical).map(rowToEdge);

  const data = {
    companies, funds, timeline, graphFunds, people, externals,
    accelerators, ecosystemOrgs, listings, verifiedEdges,
  };

  // Enterprise data (only include if rows exist)
  const docketRows = db.prepare('SELECT * FROM dockets WHERE vertical_id = ?').all(vertical);
  if (docketRows.length > 0) data.dockets = docketRows.map(rowToDocket);

  const ppaRows = db.prepare('SELECT * FROM ppas WHERE vertical_id = ?').all(vertical);
  if (ppaRows.length > 0) data.ppa = ppaRows.map(rowToPPA);

  const queueRows = db.prepare('SELECT * FROM queue_entries WHERE vertical_id = ?').all(vertical);
  if (queueRows.length > 0) data.queue = queueRows.map(rowToQueue);

  const benchRow = db.prepare('SELECT * FROM benchmarks WHERE vertical_id = ?').get(vertical);
  if (benchRow) {
    const parsed = JSON.parse(benchRow.data_json);
    data.benchmarks = parsed.stages || parsed;
    if (parsed.risks) data.riskMultipliers = parsed.risks;
  }

  res.json(data);
});

// -- Config endpoint --

router.get('/config', (req, res) => {
  const { vertical } = req.params;
  const db = getDb();
  const v = db.prepare('SELECT config_json FROM verticals WHERE id = ?').get(vertical);
  if (!v) return res.status(404).json({ error: `Vertical '${vertical}' not found` });
  res.json(JSON.parse(v.config_json));
});

export default router;
