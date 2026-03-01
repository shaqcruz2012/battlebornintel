#!/usr/bin/env node
// ============================================================
// BBI v5.0 — Data Validation Utility
// Standalone Node.js script that validates all data in App.jsx
// against the canonical schemas.
//
// Usage:  node src/data/validate.js
//
// Exit codes:
//   0 = all validations pass
//   1 = validation errors found
//
// This script is self-contained (no ES module imports) so it
// runs in any Node.js environment regardless of package.json
// module type settings.
// ============================================================

const fs = require("fs");
const path = require("path");

// ── Known Enumerations (canonical, from schema.js) ──

const KNOWN_STAGES = [
  "pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth"
];

const KNOWN_SECTORS = [
  "AI", "Cybersecurity", "Defense", "Cleantech", "Mining", "Aerospace",
  "Cloud", "Data Center", "Energy", "Solar", "Robotics", "Biotech",
  "Fintech", "Gaming", "Blockchain", "Drones", "Construction", "Logistics",
  "Materials Science", "Real Estate", "Computing", "Water", "Media",
  "Payments", "IoT", "Manufacturing", "Semiconductors", "Hospitality",
  "Cannabis", "Analytics", "Satellite", "Identity", "AdTech", "Education",
  "Healthcare", "Consumer", "Fitness", "Mobile", "Banking", "Retail",
  "HR Tech", "Enterprise"
];

const KNOWN_REGIONS = [
  "las_vegas", "reno", "henderson", "rural"
];

const KNOWN_RELATIONSHIPS = [
  "eligible_for", "operates_in", "headquartered_in", "invested_in",
  "loaned_to", "partners_with", "contracts_with", "acquired",
  "founder_of", "manages", "listed_on", "accelerated_by", "won_pitch",
  "incubated_by", "program_of", "supports", "housed_at",
  "collaborated_with", "funds", "approved_by", "filed_with",
  "competes_with", "grants_to"
];

const KNOWN_EXTERNAL_TYPES = [
  "Corporation", "VC Firm", "PE Firm", "Government", "University",
  "SPAC", "Investment Co", "Foundation"
];

const KNOWN_FUND_TYPES = [
  "SSBCI", "Angel", "Deep Tech VC", "Growth VC", "Accelerator"
];

const KNOWN_ACCELERATOR_TYPES = [
  "Accelerator", "Incubator", "Pre-Accelerator", "Accelerator/Incubator",
  "Military Accelerator", "Incubator/Lab", "Incubator/Fund", "Angel Program"
];

const KNOWN_ECOSYSTEM_ORG_TYPES = [
  "Government", "Economic Development", "University Hub"
];

const KNOWN_DOCKET_STATUSES = [
  "proposed", "active", "finalized"
];

const KNOWN_DOCKET_TIMELINES = [
  "near", "medium", "long"
];

const KNOWN_TIMELINE_EVENT_TYPES = [
  "funding", "partnership", "hiring", "launch", "grant",
  "award", "momentum", "patent"
];

const KNOWN_MATURITY_STAGES = [
  "emerging", "growth", "mature", "declining"
];

const KNOWN_RISK_CATEGORIES = [
  "Regulatory", "Market", "Technology", "Operational",
  "Financing", "Concentration"
];

const KNOWN_EXCHANGES = [
  "Nasdaq", "NYSE", "ASX", "OTC", "TSX", "NYSE American"
];


// ── Helpers ──

const CURRENT_YEAR = new Date().getFullYear();

function inRange(v, min, max) {
  return typeof v === "number" && !isNaN(v) && v >= min && v <= max;
}

function isString(v) {
  return typeof v === "string" && v.length > 0;
}


// ── Data Extraction ──
// Parse data arrays from App.jsx using bracket-matching + eval

function extractData() {
  const appPath = path.join(__dirname, "..", "App.jsx");
  let src;
  try {
    src = fs.readFileSync(appPath, "utf-8");
  } catch (err) {
    console.error("ERROR: Cannot read " + appPath);
    console.error(err.message);
    process.exit(1);
  }

  function extractArray(varName) {
    const regex = new RegExp("const\\s+" + varName + "\\s*=\\s*\\[", "m");
    const match = regex.exec(src);
    if (!match) return null;

    let depth = 0;
    const start = match.index + match[0].length - 1;
    let i = start;
    for (; i < src.length; i++) {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") {
        depth--;
        if (depth === 0) break;
      }
    }
    const block = src.substring(start, i + 1);
    try {
      return (new Function("return " + block))();
    } catch (e) {
      console.warn("  WARNING: Could not parse " + varName + ": " + e.message);
      return null;
    }
  }

  function extractObject(varName) {
    const regex = new RegExp("const\\s+" + varName + "\\s*=\\s*\\{", "m");
    const match = regex.exec(src);
    if (!match) return null;

    let depth = 0;
    const start = match.index + match[0].length - 1;
    let i = start;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const block = src.substring(start, i + 1);
    try {
      return (new Function("return " + block))();
    } catch (e) {
      console.warn("  WARNING: Could not parse " + varName + ": " + e.message);
      return null;
    }
  }

  return {
    companies: extractArray("COMPANIES"),
    funds: extractArray("FUNDS"),
    graphFunds: extractArray("GRAPH_FUNDS"),
    people: extractArray("PEOPLE"),
    externals: extractArray("EXTERNALS"),
    accelerators: extractArray("ACCELERATORS"),
    ecosystemOrgs: extractArray("ECOSYSTEM_ORGS"),
    listings: extractArray("LISTINGS"),
    verifiedEdges: extractArray("VERIFIED_EDGES"),
    timelineEvents: extractArray("TIMELINE_EVENTS"),
    regulatoryDockets: extractArray("REGULATORY_DOCKETS"),
    sectorDynamics: extractObject("SECTOR_DYNAMICS"),
  };
}


// ── Validators ──

function validateCompanies(companies, errors) {
  if (!companies) { errors.push("COMPANIES array not found in App.jsx"); return null; }

  const ids = new Set();

  for (const c of companies) {
    const label = "Company[" + (c.id || "?") + "]";

    // ID
    if (c.id === undefined || c.id === null) errors.push(label + ": missing id");
    else if (!Number.isInteger(c.id) || c.id <= 0) errors.push(label + ": id must be a positive integer");
    else if (ids.has(c.id)) errors.push(label + ": duplicate id " + c.id);
    else ids.add(c.id);

    // Required strings
    if (!isString(c.name)) errors.push(label + ": missing or invalid name");
    if (!isString(c.city)) errors.push(label + ": missing city");
    if (!isString(c.description)) errors.push(label + ": missing description");

    // Stage
    if (!KNOWN_STAGES.includes(c.stage)) errors.push(label + ': invalid stage "' + c.stage + '"');

    // Sector
    if (!Array.isArray(c.sector) || c.sector.length < 1 || c.sector.length > 4) {
      errors.push(label + ": sector must be array of 1-4 items");
    } else {
      for (const s of c.sector) {
        if (!KNOWN_SECTORS.includes(s)) errors.push(label + ': unknown sector "' + s + '"');
      }
    }

    // Region
    if (!KNOWN_REGIONS.includes(c.region)) errors.push(label + ': invalid region "' + c.region + '"');

    // Numerics
    if (typeof c.funding !== "number" || c.funding < 0) errors.push(label + ": funding must be >= 0");
    if (!inRange(c.momentum, 0, 100)) errors.push(label + ": momentum must be 0-100 (got " + c.momentum + ")");
    if (!Number.isInteger(c.employees) || c.employees < 1) errors.push(label + ": employees must be >= 1");
    if (!Number.isInteger(c.founded) || !inRange(c.founded, 1950, CURRENT_YEAR)) {
      errors.push(label + ": invalid founded year " + c.founded);
    }

    // Eligible
    if (!Array.isArray(c.eligible)) errors.push(label + ": eligible must be an array");

    // Coordinates
    if (!inRange(c.lat, 35.0, 42.5)) errors.push(label + ": lat out of NV bounds (" + c.lat + ")");
    if (!inRange(c.lng, -120.5, -114.0)) errors.push(label + ": lng out of NV bounds (" + c.lng + ")");
  }

  return ids;
}

function validateFunds(funds, errors) {
  if (!funds) { errors.push("FUNDS array not found in App.jsx"); return null; }

  const ids = new Set();

  for (const f of funds) {
    const label = "Fund[" + (f.id || "?") + "]";

    if (!isString(f.id)) errors.push(label + ": missing or invalid id");
    else if (ids.has(f.id)) errors.push(label + ': duplicate id "' + f.id + '"');
    else ids.add(f.id);

    if (!isString(f.name)) errors.push(label + ": missing name");
    if (!KNOWN_FUND_TYPES.includes(f.type)) errors.push(label + ': invalid fund type "' + f.type + '"');
    if (f.allocated !== null && f.allocated !== undefined && (typeof f.allocated !== "number" || f.allocated < 0)) {
      errors.push(label + ": allocated must be null or >= 0");
    }
    if (typeof f.deployed !== "number" || f.deployed < 0) errors.push(label + ": deployed must be >= 0");
    if (f.leverage !== null && f.leverage !== undefined && (typeof f.leverage !== "number" || f.leverage < 0)) {
      errors.push(label + ": leverage must be null or >= 0");
    }
    if (!Number.isInteger(f.companies) || f.companies < 0) errors.push(label + ": companies must be integer >= 0");
    if (!isString(f.thesis)) errors.push(label + ": missing thesis");
  }

  return ids;
}

function validatePeople(people, errors) {
  if (!people) { errors.push("PEOPLE array not found in App.jsx"); return null; }

  const ids = new Set();

  for (const p of people) {
    const label = "Person[" + (p.id || "?") + "]";

    if (!isString(p.id)) errors.push(label + ": missing id");
    else if (!p.id.startsWith("p_")) errors.push(label + ': id must start with "p_"');
    else if (ids.has(p.id)) errors.push(label + ": duplicate id");
    else ids.add(p.id);

    if (!isString(p.name)) errors.push(label + ": missing name");
    if (!isString(p.role)) errors.push(label + ": missing role");
    if (!isString(p.note)) errors.push(label + ": missing note");
  }

  return ids;
}

function validateExternals(externals, errors) {
  if (!externals) { errors.push("EXTERNALS array not found in App.jsx"); return null; }

  const ids = new Set();
  const duplicateIds = [];

  for (const x of externals) {
    const label = "External[" + (x.id || "?") + "]";

    if (!isString(x.id)) errors.push(label + ": missing id");
    else if (!x.id.startsWith("x_")) errors.push(label + ': id must start with "x_"');
    else if (ids.has(x.id)) duplicateIds.push(x.id);
    else ids.add(x.id);

    if (!isString(x.name)) errors.push(label + ": missing name");
    if (!KNOWN_EXTERNAL_TYPES.includes(x.etype)) errors.push(label + ': invalid etype "' + x.etype + '"');
    if (!isString(x.note)) errors.push(label + ": missing note");
  }

  // Report duplicates as warnings (some may be intentional re-declarations)
  if (duplicateIds.length > 0) {
    const unique = [...new Set(duplicateIds)];
    for (const id of unique) {
      errors.push("External[" + id + "]: duplicate id (appears multiple times in EXTERNALS)");
    }
  }

  return ids;
}

function validateAccelerators(accelerators, errors) {
  if (!accelerators) { errors.push("ACCELERATORS array not found in App.jsx"); return null; }

  const ids = new Set();

  for (const a of accelerators) {
    const label = "Accelerator[" + (a.id || "?") + "]";

    if (!isString(a.id)) errors.push(label + ": missing id");
    else if (!a.id.startsWith("a_")) errors.push(label + ': id must start with "a_"');
    else if (ids.has(a.id)) errors.push(label + ": duplicate id");
    else ids.add(a.id);

    if (!isString(a.name)) errors.push(label + ": missing name");
    if (!KNOWN_ACCELERATOR_TYPES.includes(a.atype)) errors.push(label + ': invalid atype "' + a.atype + '"');
    if (!isString(a.city)) errors.push(label + ": missing city");
    if (!KNOWN_REGIONS.includes(a.region)) errors.push(label + ': invalid region "' + a.region + '"');
    if (!Number.isInteger(a.founded) || !inRange(a.founded, 1950, CURRENT_YEAR)) {
      errors.push(label + ": invalid founded year");
    }
    if (!isString(a.note)) errors.push(label + ": missing note");
  }

  return ids;
}

function validateEcosystemOrgs(orgs, errors) {
  if (!orgs) { errors.push("ECOSYSTEM_ORGS array not found in App.jsx"); return null; }

  const ids = new Set();

  for (const o of orgs) {
    const label = "EcosystemOrg[" + (o.id || "?") + "]";

    if (!isString(o.id)) errors.push(label + ": missing id");
    else if (!o.id.startsWith("e_")) errors.push(label + ': id must start with "e_"');
    else if (ids.has(o.id)) errors.push(label + ": duplicate id");
    else ids.add(o.id);

    if (!isString(o.name)) errors.push(label + ": missing name");
    if (!KNOWN_ECOSYSTEM_ORG_TYPES.includes(o.etype)) errors.push(label + ': invalid etype "' + o.etype + '"');
    if (!isString(o.city)) errors.push(label + ": missing city");
    if (!KNOWN_REGIONS.includes(o.region)) errors.push(label + ': invalid region "' + o.region + '"');
    if (!isString(o.note)) errors.push(label + ": missing note");
  }

  return ids;
}

function validateListings(listings, companyIds, errors) {
  if (!listings) { errors.push("LISTINGS array not found in App.jsx"); return; }

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const label = "Listing[" + i + "]";

    if (!Number.isInteger(l.companyId) || l.companyId <= 0) errors.push(label + ": invalid companyId");
    else if (companyIds && !companyIds.has(l.companyId)) {
      errors.push(label + ": companyId " + l.companyId + " does not exist in COMPANIES");
    }

    if (!KNOWN_EXCHANGES.includes(l.exchange)) errors.push(label + ': unknown exchange "' + l.exchange + '"');
    if (!isString(l.ticker) || !/^[A-Z0-9.]+$/.test(l.ticker)) {
      errors.push(label + ': invalid ticker "' + l.ticker + '"');
    }
  }
}

function validateTimelineEvents(events, errors) {
  if (!events) { errors.push("TIMELINE_EVENTS array not found in App.jsx"); return; }

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const label = "TimelineEvent[" + i + "]";

    if (!isString(e.date) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
      errors.push(label + ': invalid date format "' + e.date + '"');
    }
    if (!KNOWN_TIMELINE_EVENT_TYPES.includes(e.type)) errors.push(label + ': invalid type "' + e.type + '"');
    if (!isString(e.company)) errors.push(label + ": missing company name");
    if (!isString(e.detail)) errors.push(label + ": missing detail");
    if (typeof e.icon !== "string" || e.icon.length === 0) errors.push(label + ": missing icon");
  }
}

function validateRegulatoryDockets(dockets, errors) {
  if (!dockets) { errors.push("REGULATORY_DOCKETS array not found in App.jsx"); return; }

  const ids = new Set();

  for (const d of dockets) {
    const label = "Docket[" + (d.id || "?") + "]";

    if (!isString(d.id) || !/^rd_\d+$/.test(d.id)) errors.push(label + ": invalid id format");
    else if (ids.has(d.id)) errors.push(label + ": duplicate id");
    else ids.add(d.id);

    if (!isString(d.title)) errors.push(label + ": missing title");
    if (!isString(d.agency)) errors.push(label + ": missing agency");
    if (!Array.isArray(d.sector) || d.sector.length < 1) errors.push(label + ": sector must be non-empty array");
    if (!KNOWN_DOCKET_STATUSES.includes(d.status)) errors.push(label + ': invalid status "' + d.status + '"');
    if (!inRange(d.severity, 1, 5) || !Number.isInteger(d.severity)) errors.push(label + ": severity must be integer 1-5");
    if (!inRange(d.breadth, 0, 1)) errors.push(label + ": breadth must be 0.0-1.0");
    if (!KNOWN_DOCKET_TIMELINES.includes(d.timeline)) errors.push(label + ': invalid timeline "' + d.timeline + '"');
    if (!inRange(d.supportiveness, 0, 100)) errors.push(label + ": supportiveness must be 0-100");
    if (!inRange(d.burden, 0, 100)) errors.push(label + ": burden must be 0-100");
    if (!isString(d.description)) errors.push(label + ": missing description");
  }
}

function validateSectorDynamics(dynamics, errors) {
  if (!dynamics) { errors.push("SECTOR_DYNAMICS object not found in App.jsx"); return; }

  for (const sector of Object.keys(dynamics)) {
    const d = dynamics[sector];
    const label = "SectorDynamics[" + sector + "]";

    if (!inRange(d.growth3YCAGR, -1, 2)) errors.push(label + ": invalid growth3YCAGR");
    if (!inRange(d.dealGrowthYoY, -1, 2)) errors.push(label + ": invalid dealGrowthYoY");
    if (!inRange(d.smartMoneyShare, 0, 1)) errors.push(label + ": invalid smartMoneyShare");

    if (!d.porterScores || typeof d.porterScores !== "object") {
      errors.push(label + ": missing porterScores");
    } else {
      for (const key of ["rivalry", "entrants", "substitutes", "buyerPower", "supplierPower"]) {
        if (!inRange(d.porterScores[key], 1, 5)) errors.push(label + ": porterScores." + key + " must be 1-5");
      }
    }

    if (!KNOWN_MATURITY_STAGES.includes(d.maturityStage)) {
      errors.push(label + ': invalid maturityStage "' + d.maturityStage + '"');
    }
  }
}

function validateEdges(edges, allNodeIds, errors) {
  if (!edges) { errors.push("VERIFIED_EDGES array not found in App.jsx"); return; }

  const orphanSources = [];
  const orphanTargets = [];

  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const label = "Edge[" + i + "](" + e.source + " -> " + e.target + ")";

    if (!isString(e.source)) errors.push(label + ": missing source");
    if (!isString(e.target)) errors.push(label + ": missing target");
    if (!KNOWN_RELATIONSHIPS.includes(e.rel)) errors.push(label + ': unknown relationship "' + e.rel + '"');
    if (!isString(e.note)) errors.push(label + ": missing note");

    // Year field is named 'y' in the data
    const year = e.y;
    if (year !== undefined && (!Number.isInteger(year) || !inRange(year, 1950, CURRENT_YEAR + 1))) {
      errors.push(label + ": invalid year " + year);
    }

    // Check edge references resolve
    if (allNodeIds && isString(e.source) && !allNodeIds.has(e.source)) {
      orphanSources.push({ index: i, source: e.source, target: e.target, rel: e.rel });
    }
    if (allNodeIds && isString(e.target) && !allNodeIds.has(e.target)) {
      orphanTargets.push({ index: i, source: e.source, target: e.target, rel: e.rel });
    }
  }

  // Report orphan edges
  for (const o of orphanSources) {
    errors.push("Edge[" + o.index + "]: source \"" + o.source + "\" not found in any entity collection");
  }
  for (const o of orphanTargets) {
    errors.push("Edge[" + o.index + "]: target \"" + o.target + "\" not found in any entity collection");
  }
}

function validateEligibleRefs(companies, fundIds, errors) {
  if (!companies || !fundIds) return;

  for (const c of companies) {
    if (!Array.isArray(c.eligible)) continue;
    for (const fid of c.eligible) {
      if (!fundIds.has(fid)) {
        errors.push("Company[" + c.id + "]: eligible fund \"" + fid + "\" not found in FUNDS");
      }
    }
  }
}


// ── Main ──

function main() {
  console.log("============================================================");
  console.log("  BBI v5.0 Data Validation");
  console.log("============================================================");
  console.log("");

  console.log("Extracting data from App.jsx...");
  const data = extractData();
  console.log("");

  const errors = [];

  // Validate each entity type
  console.log("Validating Companies...");
  const companyIds = validateCompanies(data.companies, errors);
  console.log("  Found: " + (data.companies ? data.companies.length : 0) + " companies");

  console.log("Validating Funds...");
  const fundIds = validateFunds(data.funds, errors);
  console.log("  Found: " + (data.funds ? data.funds.length : 0) + " funds");

  console.log("Validating People...");
  const personIds = validatePeople(data.people, errors);
  console.log("  Found: " + (data.people ? data.people.length : 0) + " people");

  console.log("Validating Externals...");
  const externalIds = validateExternals(data.externals, errors);
  console.log("  Found: " + (data.externals ? data.externals.length : 0) + " externals");

  console.log("Validating Accelerators...");
  const acceleratorIds = validateAccelerators(data.accelerators, errors);
  console.log("  Found: " + (data.accelerators ? data.accelerators.length : 0) + " accelerators");

  console.log("Validating Ecosystem Orgs...");
  const ecosystemIds = validateEcosystemOrgs(data.ecosystemOrgs, errors);
  console.log("  Found: " + (data.ecosystemOrgs ? data.ecosystemOrgs.length : 0) + " ecosystem orgs");

  console.log("Validating Listings...");
  validateListings(data.listings, companyIds, errors);
  console.log("  Found: " + (data.listings ? data.listings.length : 0) + " listings");

  console.log("Validating Timeline Events...");
  validateTimelineEvents(data.timelineEvents, errors);
  console.log("  Found: " + (data.timelineEvents ? data.timelineEvents.length : 0) + " events");

  console.log("Validating Regulatory Dockets...");
  validateRegulatoryDockets(data.regulatoryDockets, errors);
  console.log("  Found: " + (data.regulatoryDockets ? data.regulatoryDockets.length : 0) + " dockets");

  console.log("Validating Sector Dynamics...");
  validateSectorDynamics(data.sectorDynamics, errors);
  console.log("  Found: " + (data.sectorDynamics ? Object.keys(data.sectorDynamics).length : 0) + " sectors");

  // Build full node ID set for edge validation
  console.log("Building node ID index for edge validation...");
  const allNodeIds = new Set();

  if (companyIds) companyIds.forEach(function(id) { allNodeIds.add("c_" + id); });
  if (fundIds) fundIds.forEach(function(id) { allNodeIds.add("f_" + id); });
  if (data.graphFunds) data.graphFunds.forEach(function(f) { allNodeIds.add("f_" + f.id); });
  if (personIds) personIds.forEach(function(id) { allNodeIds.add(id); });
  if (externalIds) externalIds.forEach(function(id) { allNodeIds.add(id); });
  if (acceleratorIds) acceleratorIds.forEach(function(id) { allNodeIds.add(id); });
  if (ecosystemIds) ecosystemIds.forEach(function(id) { allNodeIds.add(id); });

  // Add sector nodes (derived from companies)
  if (data.companies) {
    const sectors = new Set();
    data.companies.forEach(function(c) {
      (c.sector || []).forEach(function(s) { sectors.add(s); });
    });
    sectors.forEach(function(s) { allNodeIds.add("s_" + s); });
  }

  // Add region nodes
  KNOWN_REGIONS.forEach(function(r) { allNodeIds.add("r_" + r); });

  // Add exchange nodes
  if (data.listings) {
    const exchanges = new Set(data.listings.map(function(l) { return l.exchange; }));
    exchanges.forEach(function(e) { allNodeIds.add("ex_" + e); });
  }

  console.log("  Total node IDs indexed: " + allNodeIds.size);

  console.log("Validating Edges...");
  validateEdges(data.verifiedEdges, allNodeIds, errors);
  console.log("  Found: " + (data.verifiedEdges ? data.verifiedEdges.length : 0) + " edges");

  console.log("Validating eligible fund references...");
  validateEligibleRefs(data.companies, fundIds, errors);

  // ── Orphan Detection ──
  console.log("Detecting orphan entities...");
  if (data.verifiedEdges && data.companies) {
    const companiesInEdges = new Set();
    data.verifiedEdges.forEach(function(e) {
      if (e.source && e.source.startsWith("c_")) companiesInEdges.add(e.source);
      if (e.target && e.target.startsWith("c_")) companiesInEdges.add(e.target);
    });
    const orphanCompanies = data.companies.filter(function(c) {
      return !companiesInEdges.has("c_" + c.id);
    });
    if (orphanCompanies.length > 0) {
      console.log("  WARNING: " + orphanCompanies.length + " companies have zero edges:");
      orphanCompanies.forEach(function(c) {
        console.log("    c_" + c.id + ' "' + c.name + '" (' + c.stage + ", eligible: [" + c.eligible.join(",") + "])");
      });
    }
  }

  // ── Results ──
  console.log("");
  console.log("============================================================");

  if (errors.length === 0) {
    console.log("  RESULT: ALL VALIDATIONS PASSED");
    console.log("============================================================");
    console.log("");
    console.log("Summary:");
    console.log("  Companies:          " + (data.companies ? data.companies.length : 0));
    console.log("  Funds:              " + (data.funds ? data.funds.length : 0));
    console.log("  People:             " + (data.people ? data.people.length : 0));
    console.log("  External Entities:  " + (data.externals ? data.externals.length : 0));
    console.log("  Accelerators:       " + (data.accelerators ? data.accelerators.length : 0));
    console.log("  Ecosystem Orgs:     " + (data.ecosystemOrgs ? data.ecosystemOrgs.length : 0));
    console.log("  Listings:           " + (data.listings ? data.listings.length : 0));
    console.log("  Timeline Events:    " + (data.timelineEvents ? data.timelineEvents.length : 0));
    console.log("  Regulatory Dockets: " + (data.regulatoryDockets ? data.regulatoryDockets.length : 0));
    console.log("  Sector Dynamics:    " + (data.sectorDynamics ? Object.keys(data.sectorDynamics).length : 0));
    console.log("  Verified Edges:     " + (data.verifiedEdges ? data.verifiedEdges.length : 0));
    console.log("  Total Node IDs:     " + allNodeIds.size);
    process.exit(0);
  } else {
    console.log("  RESULT: " + errors.length + " VALIDATION ERROR(S) FOUND");
    console.log("============================================================");
    console.log("");
    for (let i = 0; i < errors.length; i++) {
      console.log("  " + (i + 1) + ". " + errors[i]);
    }
    console.log("");
    console.log("Total errors: " + errors.length);
    process.exit(1);
  }
}

main();
