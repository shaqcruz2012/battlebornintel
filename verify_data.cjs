// Data Verification Script for BBI v5.0
// Extracts and validates all data arrays from App.jsx

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');

// Helper: extract a JS array/object from source by variable name
function extractArray(varName) {
  // Find the const declaration
  const pattern = new RegExp(`const ${varName}\\s*=\\s*\\[`);
  const match = pattern.exec(src);
  if (!match) return null;
  let start = match.index + match[0].length - 1; // position of [
  let depth = 0;
  let end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const raw = src.substring(start, end);
  try {
    return eval(raw);
  } catch(e) {
    console.error(`Failed to parse ${varName}:`, e.message);
    return null;
  }
}

function extractEdges() {
  const pattern = /const VERIFIED_EDGES\s*=\s*\[/;
  const match = pattern.exec(src);
  if (!match) return null;
  let start = match.index + match[0].length - 1;
  let depth = 0, end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const raw = src.substring(start, end);
  try { return eval(raw); } catch(e) { console.error('Failed to parse VERIFIED_EDGES:', e.message); return null; }
}

function extractIAKeys() {
  const pattern = /const COMPANY_IA_DATA\s*=\s*\{/;
  const match = pattern.exec(src);
  if (!match) return null;
  let start = match.index + match[0].length - 1;
  let depth = 0, end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const raw = src.substring(start, end);
  try {
    const obj = eval(`(${raw})`);
    return Object.keys(obj).map(Number);
  } catch(e) {
    console.error('Failed to parse COMPANY_IA_DATA:', e.message);
    return null;
  }
}

// Parse data
const COMPANIES = extractArray('COMPANIES');
const FUNDS = extractArray('FUNDS');
const GRAPH_FUNDS = extractArray('GRAPH_FUNDS');
const EXTERNALS = extractArray('EXTERNALS');
const ACCELERATORS = extractArray('ACCELERATORS');
const ECOSYSTEM_ORGS = extractArray('ECOSYSTEM_ORGS');
const PEOPLE = extractArray('PEOPLE');
const LISTINGS = extractArray('LISTINGS');
const VERIFIED_EDGES = extractEdges();
const IA_KEYS = extractIAKeys();

console.log('=== DATA EXTRACTION ===');
console.log(`COMPANIES: ${COMPANIES ? COMPANIES.length : 'FAILED'}`);
console.log(`FUNDS: ${FUNDS ? FUNDS.length : 'FAILED'}`);
console.log(`GRAPH_FUNDS: ${GRAPH_FUNDS ? GRAPH_FUNDS.length : 'FAILED'}`);
console.log(`EXTERNALS: ${EXTERNALS ? EXTERNALS.length : 'FAILED'}`);
console.log(`ACCELERATORS: ${ACCELERATORS ? ACCELERATORS.length : 'FAILED'}`);
console.log(`ECOSYSTEM_ORGS: ${ECOSYSTEM_ORGS ? ECOSYSTEM_ORGS.length : 'FAILED'}`);
console.log(`PEOPLE: ${PEOPLE ? PEOPLE.length : 'FAILED'}`);
console.log(`LISTINGS: ${LISTINGS ? LISTINGS.length : 'FAILED'}`);
console.log(`VERIFIED_EDGES: ${VERIFIED_EDGES ? VERIFIED_EDGES.length : 'FAILED'}`);
console.log(`COMPANY_IA_DATA explicit keys: ${IA_KEYS ? IA_KEYS.length : 'FAILED'}`);
console.log();

// Build valid node ID sets
const companyIds = new Set(COMPANIES.map(c => `c_${c.id}`));
const fundIds = new Set(FUNDS.map(f => `f_${f.id}`));
const externalIds = new Set(EXTERNALS.map(x => x.id));
const acceleratorIds = new Set(ACCELERATORS.map(a => a.id));
const ecosystemIds = new Set(ECOSYSTEM_ORGS.map(e => e.id));
const peopleIds = new Set(PEOPLE.map(p => p.id));
const graphFundIds = new Set(GRAPH_FUNDS.map(f => `f_${f.id}`));

const allValidIds = new Set([...companyIds, ...fundIds, ...externalIds, ...acceleratorIds, ...ecosystemIds, ...peopleIds]);

const issues = [];
const fixes = [];

// ================================================================
// 1. EDGE INTEGRITY
// ================================================================
console.log('=== 1. EDGE INTEGRITY ===');

const badSourceEdges = [];
const badTargetEdges = [];
const duplicateEdges = [];
const edgeSet = new Set();

VERIFIED_EDGES.forEach((e, i) => {
  if (!allValidIds.has(e.source)) {
    badSourceEdges.push({ index: i, source: e.source, target: e.target, rel: e.rel });
  }
  if (!allValidIds.has(e.target)) {
    badTargetEdges.push({ index: i, source: e.source, target: e.target, rel: e.rel });
  }
  const key = `${e.source}|${e.target}|${e.rel}`;
  if (edgeSet.has(key)) {
    duplicateEdges.push({ index: i, source: e.source, target: e.target, rel: e.rel, note: e.note });
  }
  edgeSet.add(key);
});

console.log(`Total edges: ${VERIFIED_EDGES.length}`);
console.log(`Bad source references: ${badSourceEdges.length}`);
badSourceEdges.forEach(e => console.log(`  ISSUE: Edge #${e.index} source "${e.source}" not found (target: ${e.target}, rel: ${e.rel})`));
console.log(`Bad target references: ${badTargetEdges.length}`);
badTargetEdges.forEach(e => console.log(`  ISSUE: Edge #${e.index} target "${e.target}" not found (source: ${e.source}, rel: ${e.rel})`));
console.log(`Duplicate edges: ${duplicateEdges.length}`);
duplicateEdges.forEach(e => console.log(`  ISSUE: Duplicate edge #${e.index}: ${e.source} -> ${e.target} [${e.rel}] "${e.note}"`));

if (badSourceEdges.length) issues.push(...badSourceEdges.map(e => `Bad source: ${e.source} in edge to ${e.target}`));
if (badTargetEdges.length) issues.push(...badTargetEdges.map(e => `Bad target: ${e.target} in edge from ${e.source}`));
if (duplicateEdges.length) issues.push(...duplicateEdges.map(e => `Duplicate: ${e.source} -> ${e.target} [${e.rel}]`));

console.log();

// ================================================================
// 2. COMPANY DATA CONSISTENCY
// ================================================================
console.log('=== 2. COMPANY DATA CONSISTENCY ===');

const VALID_STAGES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth'];
const VALID_REGIONS = ['reno', 'las_vegas', 'henderson', 'rural'];
const requiredFields = ['id', 'name', 'stage', 'sector', 'city', 'region', 'funding', 'momentum', 'employees', 'founded'];

COMPANIES.forEach(c => {
  // Check required fields
  requiredFields.forEach(f => {
    if (c[f] === undefined || c[f] === null) {
      const msg = `Company ${c.id} (${c.name}): missing field "${f}"`;
      console.log(`  ISSUE: ${msg}`);
      issues.push(msg);
    }
  });

  // Check sector is array of strings
  if (!Array.isArray(c.sector)) {
    const msg = `Company ${c.id} (${c.name}): sector is not an array`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  } else {
    c.sector.forEach(s => {
      if (typeof s !== 'string') {
        const msg = `Company ${c.id} (${c.name}): sector value "${s}" is not a string`;
        console.log(`  ISSUE: ${msg}`);
        issues.push(msg);
      }
    });
  }

  // Check stage
  if (!VALID_STAGES.includes(c.stage)) {
    const msg = `Company ${c.id} (${c.name}): invalid stage "${c.stage}"`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  }

  // Check region
  if (!VALID_REGIONS.includes(c.region)) {
    const msg = `Company ${c.id} (${c.name}): invalid region "${c.region}"`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  }

  // Check lat/lng in Nevada range
  if (c.lat !== undefined && c.lng !== undefined) {
    if (c.lat < 35 || c.lat > 42) {
      const msg = `Company ${c.id} (${c.name}): lat ${c.lat} outside Nevada range (35-42)`;
      console.log(`  ISSUE: ${msg}`);
      issues.push(msg);
    }
    if (c.lng < -120 || c.lng > -114) {
      const msg = `Company ${c.id} (${c.name}): lng ${c.lng} outside Nevada range (-120 to -114)`;
      console.log(`  ISSUE: ${msg}`);
      issues.push(msg);
    }
  } else {
    const msg = `Company ${c.id} (${c.name}): missing lat/lng`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  }
});

// Check ID uniqueness and continuity
const companyIdNums = COMPANIES.map(c => c.id).sort((a,b) => a-b);
const expectedIds = Array.from({length: 83}, (_, i) => i + 1);
const missingIds = expectedIds.filter(id => !companyIdNums.includes(id));
const extraIds = companyIdNums.filter(id => !expectedIds.includes(id));
if (missingIds.length) {
  console.log(`  ISSUE: Missing company IDs: ${missingIds.join(', ')}`);
  issues.push(`Missing company IDs: ${missingIds.join(', ')}`);
}
if (extraIds.length) {
  console.log(`  ISSUE: Unexpected company IDs: ${extraIds.join(', ')}`);
}

const dupIds = companyIdNums.filter((id, i, arr) => arr.indexOf(id) !== i);
if (dupIds.length) {
  console.log(`  ISSUE: Duplicate company IDs: ${dupIds.join(', ')}`);
  issues.push(`Duplicate company IDs: ${dupIds.join(', ')}`);
}

console.log(`Companies validated: ${COMPANIES.length}`);
console.log();

// ================================================================
// 3. FUND REFERENCES
// ================================================================
console.log('=== 3. FUND REFERENCES ===');

FUNDS.forEach(f => {
  if (!f.id.match(/^[a-z0-9_]+$/)) {
    const msg = `Fund "${f.name}": ID format "${f.id}" doesn't match expected pattern`;
    console.log(`  WARNING: ${msg}`);
  }
});

// Check edges that reference fund IDs (f_*)
const edgeFundRefs = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('f_')) edgeFundRefs.add(e.source);
  if (e.target.startsWith('f_')) edgeFundRefs.add(e.target);
});

edgeFundRefs.forEach(fRef => {
  if (!fundIds.has(fRef) && !graphFundIds.has(fRef)) {
    const msg = `Fund reference "${fRef}" in edges not found in FUNDS or GRAPH_FUNDS`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  }
});

// Check f_sbir - it's in GRAPH_FUNDS but not in FUNDS
const sbriInFunds = FUNDS.some(f => f.id === 'sbir');
const sbriInGraphFunds = GRAPH_FUNDS.some(f => f.id === 'sbir');
console.log(`f_sbir in FUNDS: ${sbriInFunds}`);
console.log(`f_sbir in GRAPH_FUNDS: ${sbriInGraphFunds}`);

// Check for edges referencing f_sbir (or sbir)
const sbriEdges = VERIFIED_EDGES.filter(e => e.source === 'f_sbir' || e.target === 'f_sbir');
console.log(`Edges referencing f_sbir: ${sbriEdges.length}`);

// Check f_desertforge
const dfInFunds = FUNDS.some(f => f.id === 'desertforge');
const dfInGraphFunds = GRAPH_FUNDS.some(f => f.id === 'desertforge');
console.log(`f_desertforge in FUNDS: ${dfInFunds}`);
console.log(`f_desertforge in GRAPH_FUNDS: ${dfInGraphFunds}`);

// Check f_fundnv2
const fnv2InFunds = FUNDS.some(f => f.id === 'fundnv2');
const fnv2InGraphFunds = GRAPH_FUNDS.some(f => f.id === 'fundnv2');
console.log(`f_fundnv2 in FUNDS: ${fnv2InFunds}`);
console.log(`f_fundnv2 in GRAPH_FUNDS: ${fnv2InGraphFunds}`);

console.log(`Fund edge references: ${[...edgeFundRefs].join(', ')}`);
console.log();

// ================================================================
// 4. COMPANY_IA_DATA Coverage
// ================================================================
console.log('=== 4. COMPANY_IA_DATA COVERAGE ===');

const allCompanyIds = COMPANIES.map(c => c.id);
const missingIA = allCompanyIds.filter(id => !IA_KEYS.includes(id));
console.log(`Companies with explicit IA data: ${IA_KEYS.length}`);
console.log(`Companies using defaults (via forEach loop): ${missingIA.length}`);
if (missingIA.length) {
  console.log(`  IDs using defaults: ${missingIA.join(', ')}`);
}

// Check for IA data referencing non-existent company IDs
const extraIA = IA_KEYS.filter(id => !allCompanyIds.includes(id));
if (extraIA.length) {
  const msg = `IA data references non-existent company IDs: ${extraIA.join(', ')}`;
  console.log(`  ISSUE: ${msg}`);
  issues.push(msg);
}

// Note: The code has a forEach loop that fills in defaults, so coverage is 100%
console.log(`Effective coverage: 100% (defaults auto-generated for missing)`);
console.log();

// ================================================================
// 5. GRAPH_FUNDS vs FUNDS consistency
// ================================================================
console.log('=== 5. GRAPH DATA CONSISTENCY ===');

const fundsMap = new Map(FUNDS.map(f => [f.id, f.name]));
const graphFundsMap = new Map(GRAPH_FUNDS.map(f => [f.id, f.name]));

// Check GRAPH_FUNDS has entries not in FUNDS
GRAPH_FUNDS.forEach(gf => {
  if (!fundsMap.has(gf.id)) {
    const msg = `GRAPH_FUNDS entry "${gf.id}" (${gf.name}) not in FUNDS array`;
    console.log(`  ISSUE: ${msg}`);
    issues.push(msg);
  }
});

// Check FUNDS has entries not in GRAPH_FUNDS
FUNDS.forEach(f => {
  if (!graphFundsMap.has(f.id)) {
    const msg = `FUNDS entry "${f.id}" (${f.name}) not in GRAPH_FUNDS array`;
    console.log(`  WARNING: ${msg}`);
  }
});

// f_sbir is in GRAPH_FUNDS but not FUNDS - check if it's used
console.log();

// Check EXTERNALS consistency - look for duplicates
const externalIdCounts = {};
EXTERNALS.forEach(x => {
  externalIdCounts[x.id] = (externalIdCounts[x.id] || 0) + 1;
});
const dupExternals = Object.entries(externalIdCounts).filter(([, c]) => c > 1);
if (dupExternals.length) {
  console.log(`  Duplicate EXTERNAL IDs:`);
  dupExternals.forEach(([id, count]) => {
    const msg = `Duplicate external ID "${id}" appears ${count} times`;
    console.log(`    ISSUE: ${msg}`);
    issues.push(msg);
  });
}
console.log();

// ================================================================
// 6. ORPHAN DETECTION
// ================================================================
console.log('=== 6. ORPHAN DETECTION ===');

// Companies with zero edges
const companiesInEdges = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('c_')) companiesInEdges.add(e.source);
  if (e.target.startsWith('c_')) companiesInEdges.add(e.target);
});

const orphanCompanies = COMPANIES.filter(c => !companiesInEdges.has(`c_${c.id}`));
console.log(`Companies with ZERO edges (orphans): ${orphanCompanies.length}`);
orphanCompanies.forEach(c => {
  console.log(`  ORPHAN: c_${c.id} "${c.name}" (${c.stage}, ${c.sector.join('/')}, eligible: [${c.eligible.join(',')}])`);
});

// Funds with zero investment edges
const fundsInEdges = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('f_')) fundsInEdges.add(e.source);
  if (e.target.startsWith('f_')) fundsInEdges.add(e.target);
});

const orphanFunds = FUNDS.filter(f => !fundsInEdges.has(`f_${f.id}`));
console.log(`\nFunds with ZERO edges: ${orphanFunds.length}`);
orphanFunds.forEach(f => {
  console.log(`  ORPHAN FUND: f_${f.id} "${f.name}" (type: ${f.type})`);
});

// Accelerators with no edges
const accsInEdges = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('a_')) accsInEdges.add(e.source);
  if (e.target.startsWith('a_')) accsInEdges.add(e.target);
});

const orphanAccs = ACCELERATORS.filter(a => !accsInEdges.has(a.id));
console.log(`\nAccelerators with ZERO edges: ${orphanAccs.length}`);
orphanAccs.forEach(a => {
  console.log(`  ORPHAN ACCELERATOR: ${a.id} "${a.name}" (type: ${a.atype})`);
});

// Externals with no edges
const extsInEdges = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('x_')) extsInEdges.add(e.source);
  if (e.target.startsWith('x_')) extsInEdges.add(e.target);
});

const orphanExts = EXTERNALS.filter(x => !extsInEdges.has(x.id));
console.log(`\nExternals with ZERO edges: ${orphanExts.length}`);
orphanExts.forEach(x => {
  console.log(`  ORPHAN EXTERNAL: ${x.id} "${x.name}" (type: ${x.etype})`);
});

// Ecosystem orgs with no edges
const ecoInEdges = new Set();
VERIFIED_EDGES.forEach(e => {
  if (e.source.startsWith('e_')) ecoInEdges.add(e.source);
  if (e.target.startsWith('e_')) ecoInEdges.add(e.target);
});

const orphanEco = ECOSYSTEM_ORGS.filter(o => !ecoInEdges.has(o.id));
console.log(`\nEcosystem orgs with ZERO edges: ${orphanEco.length}`);
orphanEco.forEach(o => {
  console.log(`  ORPHAN ECO: ${o.id} "${o.name}" (type: ${o.etype})`);
});

console.log();

// ================================================================
// Check for "series_c_plus" stage validity
// ================================================================
console.log('=== STAGE VALUES CHECK ===');
const stageCounts = {};
COMPANIES.forEach(c => { stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1; });
Object.entries(stageCounts).forEach(([stage, count]) => {
  const valid = VALID_STAGES.includes(stage);
  console.log(`  ${stage}: ${count} companies ${valid ? '(valid)' : '*** INVALID ***'}`);
});
console.log();

// ================================================================
// Check edge to c_16 vs c_22 (ThirdWaveRx vs Carbon Health)
// ================================================================
console.log('=== EDGE CONTENT CHECK ===');
const c16edges = VERIFIED_EDGES.filter(e => e.source === 'c_16' || e.target === 'c_16');
console.log(`Edges involving c_16 (ThirdWaveRx): ${c16edges.length}`);
c16edges.forEach(e => console.log(`  ${e.source} -> ${e.target} [${e.rel}] ${e.note}`));

// Check the competes_with edge c_16 vs c_8 (ThirdWaveRx vs Carbon Health)
// c_8 is Blockchains LLC, c_22 is Carbon Health - this looks wrong
const edgeC16C8 = VERIFIED_EDGES.find(e => e.source === 'c_16' && e.target === 'c_8');
if (edgeC16C8) {
  console.log(`\n  NOTE: Edge c_16 (ThirdWaveRx) -> c_8 (Blockchains LLC) [${edgeC16C8.rel}]`);
  console.log(`    Note says: "${edgeC16C8.note}"`);
  console.log(`    But c_8 is Blockchains LLC, NOT Carbon Health (c_22).`);
  console.log(`    This note refers to Carbon Health (c_22) - POSSIBLE DATA ERROR`);
  issues.push(`Edge c_16->c_8 note says "Carbon Health" but c_8 is "Blockchains LLC" - should be c_16->c_22`);
}

console.log();

// ================================================================
// Check the competes_with edge c_18 vs c_10
// ================================================================
const edgeC18C10 = VERIFIED_EDGES.find(e => e.source === 'c_18' && e.target === 'c_10');
if (edgeC18C10) {
  console.log(`  NOTE: Edge c_18 (Kaptyn) -> c_10 (Katalyst) [${edgeC18C10.rel}]`);
  console.log(`    Note: "${edgeC18C10.note}"`);
  console.log(`    Kaptyn (EV transport) vs Katalyst (EMS fitness) - these don't really compete`);
  issues.push(`Questionable competes_with: c_18 (Kaptyn EV transport) vs c_10 (Katalyst fitness) - different sectors`);
}

console.log();

// ================================================================
// SUMMARY REPORT
// ================================================================
console.log('======================================');
console.log('    DATA INTEGRITY REPORT');
console.log('======================================');
console.log(`Total Companies: ${COMPANIES.length}`);
console.log(`Total Funds: ${FUNDS.length}`);
console.log(`Total Externals: ${EXTERNALS.length}`);
console.log(`Total Accelerators: ${ACCELERATORS.length}`);
console.log(`Total Ecosystem Orgs: ${ECOSYSTEM_ORGS.length}`);
console.log(`Total People: ${PEOPLE.length}`);
console.log(`Total Nodes: ${COMPANIES.length + FUNDS.length + EXTERNALS.length + ACCELERATORS.length + ECOSYSTEM_ORGS.length + PEOPLE.length}`);
console.log(`Total Edges: ${VERIFIED_EDGES.length}`);
console.log(`Orphan Companies: ${orphanCompanies.length}`);
console.log(`Orphan Funds: ${orphanFunds.length}`);
console.log(`Orphan Accelerators: ${orphanAccs.length}`);
console.log(`Orphan Externals: ${orphanExts.length}`);
console.log(`Orphan Ecosystem Orgs: ${orphanEco.length}`);
console.log(`Issues Found: ${issues.length}`);
console.log(`\nAll Issues:`);
issues.forEach((issue, i) => console.log(`  ${i+1}. ${issue}`));
console.log('======================================');

// Output fixable issues for the next step
console.log('\n=== FIXABLE ISSUES ===');

// Orphan companies that have eligible funds but no fund edges
orphanCompanies.forEach(c => {
  if (c.eligible && c.eligible.length > 0) {
    console.log(`FIX: Add fund edges for orphan company c_${c.id} (${c.name}), eligible for: [${c.eligible.join(',')}]`);
  }
});

// Check for companies with "sbir" in eligible but no SBIR edges
const sbirEligible = COMPANIES.filter(c => c.eligible.includes('sbir'));
console.log(`\nCompanies eligible for SBIR: ${sbirEligible.length}`);
sbirEligible.forEach(c => {
  const hasEdge = VERIFIED_EDGES.some(e =>
    (e.source === 'f_sbir' && e.target === `c_${c.id}`) ||
    (e.source === `c_${c.id}` && e.target === 'f_sbir')
  );
  console.log(`  c_${c.id} (${c.name}): has SBIR edge = ${hasEdge}`);
});

// Check for companies with accelerator edges in descriptions but none in VERIFIED_EDGES
const accelMentions = COMPANIES.filter(c => {
  const desc = (c.description || '').toLowerCase();
  return desc.includes('startupnv') || desc.includes('angelnv') || desc.includes('gener8tor') || desc.includes('gbeta') || desc.includes('adams hub');
});
console.log(`\nCompanies mentioning accelerators in description: ${accelMentions.length}`);
accelMentions.forEach(c => {
  const hasAccelEdge = VERIFIED_EDGES.some(e =>
    (e.target === `c_${c.id}` && e.rel === 'accelerated_by') ||
    (e.source === `c_${c.id}` && e.rel === 'accelerated_by')
  );
  if (!hasAccelEdge) {
    console.log(`  MISSING ACCEL EDGE: c_${c.id} (${c.name}): "${c.description.substring(0, 100)}..."`);
  }
});
