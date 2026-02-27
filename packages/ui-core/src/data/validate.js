/**
 * Data validation for BBI platform verticals.
 * Research agents produce data files — this module validates them
 * against the schema contract before they're loaded into a platform.
 *
 * Usage:
 *   import { validateDataPackage } from '@bbi/ui-core';
 *   const result = validateDataPackage(data, config);
 *   if (!result.valid) console.error(result.errors);
 */

const DEFAULT_STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth"];
const DEFAULT_EVENT_TYPES = ["funding", "partnership", "hiring", "launch", "momentum", "grant", "patent", "award"];
const ETYPES = ["Corporation", "VC Firm", "PE Firm", "Government", "University", "Nonprofit", "Accelerator", "Law Firm", "Consulting", "Media"];

function err(path, msg) { return { path, message: msg }; }

function validateCompany(c, i, config) {
  const errors = [];
  const p = `companies[${i}]`;
  if (typeof c.id !== "number") errors.push(err(p, "id must be a number"));
  if (!c.name || typeof c.name !== "string") errors.push(err(p, "name is required"));
  const validStages = config?.stages?.list || DEFAULT_STAGES;
  if (!validStages.includes(c.stage)) errors.push(err(p, `stage must be one of: ${validStages.join(", ")}`));
  if (!Array.isArray(c.sector) || c.sector.length === 0) errors.push(err(p, "sector must be a non-empty array"));
  if (config?.sectorHeat) {
    for (const s of c.sector || []) {
      if (!(s in config.sectorHeat)) errors.push(err(p, `sector "${s}" not in config.sectorHeat`));
    }
  }
  if (!c.city || typeof c.city !== "string") errors.push(err(p, "city is required"));
  if (!c.region || typeof c.region !== "string") errors.push(err(p, "region is required"));
  if (config?.regions) {
    const validRegions = config.regions.map(r => r.id);
    if (!validRegions.includes(c.region)) errors.push(err(p, `region "${c.region}" not in config.regions`));
  }
  if (typeof c.funding !== "number" || c.funding < 0) errors.push(err(p, "funding must be a non-negative number ($M)"));
  if (typeof c.momentum !== "number" || c.momentum < 0 || c.momentum > 100) errors.push(err(p, "momentum must be 0-100"));
  if (typeof c.employees !== "number" || c.employees < 0) errors.push(err(p, "employees must be a non-negative number"));
  if (typeof c.founded !== "number" || c.founded < 1900 || c.founded > new Date().getFullYear()) errors.push(err(p, "founded must be a valid year"));
  if (!c.description || typeof c.description !== "string") errors.push(err(p, "description is required"));
  if (!Array.isArray(c.eligible)) errors.push(err(p, "eligible must be an array of fund IDs"));
  if (typeof c.lat !== "number" || typeof c.lng !== "number") errors.push(err(p, "lat/lng must be numbers"));
  return errors;
}

function validateFund(f, i) {
  const errors = [];
  const p = `funds[${i}]`;
  if (!f.id || typeof f.id !== "string") errors.push(err(p, "id must be a string"));
  if (!f.name || typeof f.name !== "string") errors.push(err(p, "name is required"));
  if (!f.type || typeof f.type !== "string") errors.push(err(p, "type is required"));
  if (f.allocated !== null && typeof f.allocated !== "number") errors.push(err(p, "allocated must be a number or null"));
  if (typeof f.deployed !== "number") errors.push(err(p, "deployed must be a number ($M)"));
  if (f.leverage !== null && typeof f.leverage !== "number") errors.push(err(p, "leverage must be a number or null"));
  if (typeof f.companies !== "number") errors.push(err(p, "companies must be a number"));
  if (!f.thesis || typeof f.thesis !== "string") errors.push(err(p, "thesis is required"));
  return errors;
}

function validateTimelineEvent(e, i, config) {
  const errors = [];
  const p = `timeline[${i}]`;
  const validTypes = config?.eventTypes || DEFAULT_EVENT_TYPES;
  if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) errors.push(err(p, "date must be YYYY-MM-DD"));
  if (!validTypes.includes(e.type)) errors.push(err(p, `type must be one of: ${validTypes.join(", ")}`));
  if (!e.company || typeof e.company !== "string") errors.push(err(p, "company is required"));
  if (!e.detail || typeof e.detail !== "string") errors.push(err(p, "detail is required"));
  if (!e.icon || typeof e.icon !== "string") errors.push(err(p, "icon is required"));
  return errors;
}

function validateEdge(e, i, nodeIds) {
  const errors = [];
  const p = `verifiedEdges[${i}]`;
  if (!e.source || typeof e.source !== "string") errors.push(err(p, "source is required"));
  if (!e.target || typeof e.target !== "string") errors.push(err(p, "target is required"));
  if (!e.rel || typeof e.rel !== "string") errors.push(err(p, "rel is required"));
  if (nodeIds && e.source && !nodeIds.has(e.source)) errors.push(err(p, `source "${e.source}" not found in graph nodes`));
  if (nodeIds && e.target && !nodeIds.has(e.target)) errors.push(err(p, `target "${e.target}" not found in graph nodes`));
  return errors;
}

function validatePerson(p, i) {
  const errors = [];
  const path = `people[${i}]`;
  if (!p.id || typeof p.id !== "string") errors.push(err(path, "id must be a string"));
  if (!p.name || typeof p.name !== "string") errors.push(err(path, "name is required"));
  if (!p.role || typeof p.role !== "string") errors.push(err(path, "role is required"));
  if (p.companyId !== null && typeof p.companyId !== "number") errors.push(err(path, "companyId must be a number or null"));
  return errors;
}

function validateExternal(x, i) {
  const errors = [];
  const p = `externals[${i}]`;
  if (!x.id || typeof x.id !== "string") errors.push(err(p, "id must be a string"));
  if (!x.name || typeof x.name !== "string") errors.push(err(p, "name is required"));
  if (!x.etype || typeof x.etype !== "string") errors.push(err(p, "etype is required"));
  return errors;
}

function validateAccelerator(a, i) {
  const errors = [];
  const p = `accelerators[${i}]`;
  if (!a.id || typeof a.id !== "string") errors.push(err(p, "id must be a string"));
  if (!a.name || typeof a.name !== "string") errors.push(err(p, "name is required"));
  if (!a.atype || typeof a.atype !== "string") errors.push(err(p, "atype is required"));
  if (!a.city || typeof a.city !== "string") errors.push(err(p, "city is required"));
  return errors;
}

/**
 * Validate a complete DataPackage against the schema contract.
 * @param {Object} data - The data package to validate
 * @param {Object} [config] - Optional platform config for cross-validation
 * @returns {{ valid: boolean, errors: Array<{path:string, message:string}>, warnings: Array<{path:string, message:string}>, stats: Object }}
 */
export function validateDataPackage(data, config) {
  const errors = [];
  const warnings = [];

  // --- Required arrays ---
  if (!Array.isArray(data.companies)) errors.push(err("companies", "must be an array"));
  if (!Array.isArray(data.funds)) errors.push(err("funds", "must be an array"));
  if (!Array.isArray(data.timeline)) errors.push(err("timeline", "must be an array"));
  if (!Array.isArray(data.verifiedEdges)) errors.push(err("verifiedEdges", "must be an array"));

  // Stop early if structure is broken
  if (errors.length > 0) return { valid: false, errors, warnings, stats: {} };

  // --- Validate each entity type ---
  const companyIds = new Set();
  for (let i = 0; i < data.companies.length; i++) {
    errors.push(...validateCompany(data.companies[i], i, config));
    if (companyIds.has(data.companies[i].id)) errors.push(err(`companies[${i}]`, `duplicate id: ${data.companies[i].id}`));
    companyIds.add(data.companies[i].id);
  }

  const fundIds = new Set();
  for (let i = 0; i < data.funds.length; i++) {
    errors.push(...validateFund(data.funds[i], i));
    if (fundIds.has(data.funds[i].id)) errors.push(err(`funds[${i}]`, `duplicate id: ${data.funds[i].id}`));
    fundIds.add(data.funds[i].id);
  }

  for (let i = 0; i < data.timeline.length; i++) {
    errors.push(...validateTimelineEvent(data.timeline[i], i, config));
  }

  // --- Graph entities ---
  const nodeIds = new Set();

  // Company nodes use "c_{id}" prefix in edges
  for (const c of data.companies) nodeIds.add(`c_${c.id}`);

  // Fund nodes use "f_{id}" prefix
  if (Array.isArray(data.graphFunds)) {
    for (let i = 0; i < data.graphFunds.length; i++) {
      const gf = data.graphFunds[i];
      if (!gf.id) errors.push(err(`graphFunds[${i}]`, "id is required"));
      nodeIds.add(`f_${gf.id}`);
    }
  }

  if (Array.isArray(data.people)) {
    for (let i = 0; i < data.people.length; i++) {
      errors.push(...validatePerson(data.people[i], i));
      nodeIds.add(data.people[i].id);
    }
  }

  if (Array.isArray(data.externals)) {
    for (let i = 0; i < data.externals.length; i++) {
      errors.push(...validateExternal(data.externals[i], i));
      nodeIds.add(data.externals[i].id);
    }
  }

  if (Array.isArray(data.accelerators)) {
    for (let i = 0; i < data.accelerators.length; i++) {
      errors.push(...validateAccelerator(data.accelerators[i], i));
      nodeIds.add(data.accelerators[i].id);
    }
  }

  if (Array.isArray(data.ecosystemOrgs)) {
    for (let i = 0; i < data.ecosystemOrgs.length; i++) {
      const eo = data.ecosystemOrgs[i];
      if (!eo.id) errors.push(err(`ecosystemOrgs[${i}]`, "id is required"));
      nodeIds.add(eo.id);
    }
  }

  // --- Validate edges against known node IDs ---
  for (let i = 0; i < data.verifiedEdges.length; i++) {
    errors.push(...validateEdge(data.verifiedEdges[i], i, nodeIds));
  }

  // --- Cross-validation: eligible fund IDs exist ---
  for (let i = 0; i < data.companies.length; i++) {
    const c = data.companies[i];
    for (const fid of c.eligible || []) {
      if (!fundIds.has(fid)) warnings.push(err(`companies[${i}].eligible`, `fund "${fid}" not in funds list`));
    }
  }

  // --- Optional enterprise data validation ---
  if (Array.isArray(data.dockets)) {
    for (let i = 0; i < data.dockets.length; i++) {
      const d = data.dockets[i];
      const p = `dockets[${i}]`;
      if (!d.id || typeof d.id !== "string") errors.push(err(p, "id must be a string"));
      if (!d.title || typeof d.title !== "string") errors.push(err(p, "title is required"));
      if (!d.agency || typeof d.agency !== "string") errors.push(err(p, "agency is required"));
      if (d.openDate && !/^\d{4}-\d{2}-\d{2}$/.test(d.openDate)) errors.push(err(p, "openDate must be YYYY-MM-DD"));
      if (d.nextDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(d.nextDeadline)) errors.push(err(p, "nextDeadline must be YYYY-MM-DD"));
      if (!Array.isArray(d.projects)) errors.push(err(p, "projects must be an array"));
      if (Array.isArray(d.filings)) {
        for (let j = 0; j < d.filings.length; j++) {
          const f = d.filings[j];
          if (!f.date || !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) errors.push(err(`${p}.filings[${j}]`, "date must be YYYY-MM-DD"));
          if (!f.filer) errors.push(err(`${p}.filings[${j}]`, "filer is required"));
        }
      }
    }
  }

  if (Array.isArray(data.ppa)) {
    for (let i = 0; i < data.ppa.length; i++) {
      const p = data.ppa[i];
      const path = `ppa[${i}]`;
      if (!p.id || typeof p.id !== "string") errors.push(err(path, "id must be a string"));
      if (!p.project || typeof p.project !== "string") errors.push(err(path, "project is required"));
      if (!p.buyer || typeof p.buyer !== "string") errors.push(err(path, "buyer is required"));
      if (!p.technology || typeof p.technology !== "string") errors.push(err(path, "technology is required"));
      if (p.capacityMW !== undefined && typeof p.capacityMW !== "number") errors.push(err(path, "capacityMW must be a number"));
      if (p.pricePerMWh !== undefined && p.pricePerMWh !== null && typeof p.pricePerMWh !== "number") errors.push(err(path, "pricePerMWh must be a number or null"));
    }
  }

  if (Array.isArray(data.queue)) {
    const validQueueStatuses = ["feasibility_study", "system_impact", "facilities_study", "ia_executed", "withdrawn"];
    for (let i = 0; i < data.queue.length; i++) {
      const q = data.queue[i];
      const p = `queue[${i}]`;
      if (!q.id || typeof q.id !== "string") errors.push(err(p, "id must be a string"));
      if (!q.projectName || typeof q.projectName !== "string") errors.push(err(p, "projectName is required"));
      if (typeof q.requestMW !== "number") errors.push(err(p, "requestMW must be a number"));
      if (q.status && !validQueueStatuses.includes(q.status)) errors.push(err(p, `status must be one of: ${validQueueStatuses.join(", ")}`));
      if (q.applicationDate && !/^\d{4}-\d{2}-\d{2}$/.test(q.applicationDate)) errors.push(err(p, "applicationDate must be YYYY-MM-DD"));
    }
  }

  // --- Warnings for thin data ---
  if (data.companies.length < 10) warnings.push(err("companies", `only ${data.companies.length} companies — consider adding more`));
  if (data.funds.length < 2) warnings.push(err("funds", `only ${data.funds.length} funds — consider adding more`));
  if (data.timeline.length < 5) warnings.push(err("timeline", `only ${data.timeline.length} events — consider adding more`));
  if (data.verifiedEdges.length < data.companies.length) warnings.push(err("verifiedEdges", `fewer edges than companies — graph will be sparse`));

  const stats = {
    companies: data.companies.length,
    funds: data.funds.length,
    timeline: data.timeline.length,
    graphFunds: (data.graphFunds || []).length,
    people: (data.people || []).length,
    externals: (data.externals || []).length,
    accelerators: (data.accelerators || []).length,
    ecosystemOrgs: (data.ecosystemOrgs || []).length,
    listings: (data.listings || []).length,
    verifiedEdges: data.verifiedEdges.length,
    graphNodes: nodeIds.size,
    dockets: (data.dockets || []).length,
    ppa: (data.ppa || []).length,
    queue: (data.queue || []).length,
  };

  return { valid: errors.length === 0, errors, warnings, stats };
}
