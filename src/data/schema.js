// ============================================================
// BBI v5.0 — Data Schema Definitions
// Canonical type contracts for all entity types.
// All agents MUST validate data against these schemas before commit.
// ============================================================

// --- Known Enumerations ---

export const KNOWN_STAGES = [
  "pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth"
];

export const KNOWN_SECTORS = [
  "AI", "Cybersecurity", "Defense", "Cleantech", "Mining", "Aerospace",
  "Cloud", "Data Center", "Energy", "Solar", "Robotics", "Biotech",
  "Fintech", "Gaming", "Blockchain", "Drones", "Construction", "Logistics",
  "Materials Science", "Real Estate", "Computing", "Water", "Media",
  "Payments", "IoT", "Manufacturing", "Semiconductors", "Hospitality",
  "Cannabis", "Analytics", "Satellite", "Identity", "AdTech", "Education",
  "Healthcare", "Consumer", "Fitness", "Mobile", "Banking", "Retail",
  "HR Tech", "Enterprise"
];

export const KNOWN_REGIONS = [
  "las_vegas", "reno", "henderson", "rural"
];

export const KNOWN_RELATIONSHIPS = [
  "eligible_for", "operates_in", "headquartered_in", "invested_in",
  "loaned_to", "partners_with", "contracts_with", "acquired",
  "founder_of", "manages", "listed_on", "accelerated_by", "won_pitch",
  "incubated_by", "program_of", "supports", "housed_at",
  "collaborated_with", "funds", "approved_by", "filed_with",
  "competes_with", "grants_to"
];

export const KNOWN_EXTERNAL_TYPES = [
  "Corporation", "VC Firm", "PE Firm", "Government", "University",
  "SPAC", "Investment Co", "Foundation"
];

export const KNOWN_FUND_TYPES = [
  "SSBCI", "Angel", "Deep Tech VC", "Growth VC", "Accelerator"
];

export const KNOWN_ACCELERATOR_TYPES = [
  "Accelerator", "Incubator", "Pre-Accelerator", "Accelerator/Incubator",
  "Military Accelerator", "Incubator/Lab", "Incubator/Fund", "Angel Program"
];

export const KNOWN_ECOSYSTEM_ORG_TYPES = [
  "Government", "Economic Development", "University Hub"
];

export const KNOWN_DOCKET_STATUSES = [
  "proposed", "active", "finalized"
];

export const KNOWN_DOCKET_TIMELINES = [
  "near", "medium", "long"
];

export const KNOWN_TIMELINE_EVENT_TYPES = [
  "funding", "partnership", "hiring", "launch", "grant",
  "award", "momentum", "patent"
];

export const KNOWN_MATURITY_STAGES = [
  "emerging", "growth", "mature", "declining"
];

export const KNOWN_RISK_CATEGORIES = [
  "Regulatory", "Market", "Technology", "Operational",
  "Financing", "Concentration"
];

export const KNOWN_EXCHANGES = [
  "Nasdaq", "NYSE", "ASX", "OTC", "TSX", "NYSE American"
];

// --- Schema Definitions ---
// Each schema describes { field: { type, required, description, validator } }
// Validators are functions that return true if valid, false otherwise.

const isString = v => typeof v === "string" && v.length > 0;
const isNumber = v => typeof v === "number" && !isNaN(v);
const isArray = v => Array.isArray(v);
const isBoolean = v => typeof v === "boolean";
const inRange = (v, min, max) => isNumber(v) && v >= min && v <= max;
const inEnum = (v, values) => values.includes(v);
const isArrayOf = (v, validator) => isArray(v) && v.every(validator);
const isArrayOfEnum = (v, values) => isArrayOf(v, item => inEnum(item, values));

export const CompanySchema = {
  id:          { type: "number",   required: true,  description: "Unique positive integer ID",
                 validate: v => isNumber(v) && v > 0 && Number.isInteger(v) },
  name:        { type: "string",   required: true,  description: "Company name",
                 validate: isString },
  stage:       { type: "enum",     required: true,  description: "Funding stage",
                 validate: v => inEnum(v, KNOWN_STAGES) },
  sector:      { type: "string[]", required: true,  description: "1-4 sectors",
                 validate: v => isArrayOfEnum(v, KNOWN_SECTORS) && v.length >= 1 && v.length <= 4 },
  city:        { type: "string",   required: true,  description: "Nevada city",
                 validate: isString },
  region:      { type: "enum",     required: true,  description: "Region",
                 validate: v => inEnum(v, KNOWN_REGIONS) },
  funding:     { type: "number",   required: true,  description: "Total funding in $M",
                 validate: v => isNumber(v) && v >= 0 },
  momentum:    { type: "number",   required: true,  description: "Momentum score 0-100",
                 validate: v => inRange(v, 0, 100) },
  employees:   { type: "number",   required: true,  description: "Employee count",
                 validate: v => isNumber(v) && v >= 1 && Number.isInteger(v) },
  founded:     { type: "number",   required: true,  description: "Year founded",
                 validate: v => inRange(v, 1950, new Date().getFullYear()) && Number.isInteger(v) },
  description: { type: "string",   required: true,  description: "1-3 sentence description",
                 validate: isString },
  eligible:    { type: "string[]", required: true,  description: "Eligible fund IDs",
                 validate: v => isArray(v) && v.every(item => typeof item === "string") },
  lat:         { type: "number",   required: true,  description: "Latitude (Nevada: 35.0-42.5)",
                 validate: v => inRange(v, 35.0, 42.5) },
  lng:         { type: "number",   required: true,  description: "Longitude (Nevada: -120.5 to -114.0)",
                 validate: v => inRange(v, -120.5, -114.0) },
};

export const FundSchema = {
  id:        { type: "string",  required: true,  description: "Lowercase slug ID",
               validate: v => isString(v) && /^[a-z0-9_]+$/.test(v) },
  name:      { type: "string",  required: true,  description: "Full fund name",
               validate: isString },
  type:      { type: "enum",    required: true,  description: "Fund type",
               validate: v => inEnum(v, KNOWN_FUND_TYPES) },
  allocated: { type: "number",  required: false, description: "Allocation in $M",
               validate: v => v === null || (isNumber(v) && v >= 0) },
  deployed:  { type: "number",  required: true,  description: "Deployed capital in $M",
               validate: v => isNumber(v) && v >= 0 },
  leverage:  { type: "number",  required: false, description: "Leverage ratio",
               validate: v => v === null || (isNumber(v) && v >= 0) },
  companies: { type: "number",  required: true,  description: "Portfolio company count",
               validate: v => isNumber(v) && v >= 0 && Number.isInteger(v) },
  thesis:    { type: "string",  required: true,  description: "Investment thesis",
               validate: isString },
};

export const EdgeSchema = {
  source: { type: "string", required: true,  description: "Source node ID",
            validate: isString },
  target: { type: "string", required: true,  description: "Target node ID",
            validate: isString },
  rel:    { type: "enum",   required: true,  description: "Relationship type",
            validate: v => inEnum(v, KNOWN_RELATIONSHIPS) },
  note:   { type: "string", required: true,  description: "Relationship description",
            validate: isString },
  y:      { type: "number", required: true,  description: "Year established",
            validate: v => inRange(v, 1950, new Date().getFullYear() + 1) && Number.isInteger(v) },
};

export const PersonSchema = {
  id:        { type: "string", required: true,  description: "p_{lastname} format",
               validate: v => isString(v) && v.startsWith("p_") },
  name:      { type: "string", required: true,  description: "Full name",
               validate: isString },
  role:      { type: "string", required: true,  description: "Title/role",
               validate: isString },
  companyId: { type: "number", required: false, description: "Affiliated company ID",
               validate: v => v === null || (isNumber(v) && v > 0) },
  fundId:    { type: "string", required: false, description: "Affiliated fund ID",
               validate: v => v === undefined || v === null || isString(v) },
  note:      { type: "string", required: true,  description: "Brief context",
               validate: isString },
};

export const ExternalSchema = {
  id:    { type: "string", required: true,  description: "x_{shortname} format",
           validate: v => isString(v) && v.startsWith("x_") },
  name:  { type: "string", required: true,  description: "Full entity name",
           validate: isString },
  etype: { type: "enum",   required: true,  description: "Entity type",
           validate: v => inEnum(v, KNOWN_EXTERNAL_TYPES) },
  note:  { type: "string", required: true,  description: "Relevance to NV ecosystem",
           validate: isString },
};

export const AcceleratorSchema = {
  id:      { type: "string", required: true,  description: "a_{shortname} format",
             validate: v => isString(v) && v.startsWith("a_") },
  name:    { type: "string", required: true,  description: "Full name",
             validate: isString },
  atype:   { type: "enum",   required: true,  description: "Accelerator type",
             validate: v => inEnum(v, KNOWN_ACCELERATOR_TYPES) },
  city:    { type: "string", required: true,  description: "Nevada city",
             validate: isString },
  region:  { type: "enum",   required: true,  description: "Region",
             validate: v => inEnum(v, KNOWN_REGIONS) },
  founded: { type: "number", required: true,  description: "Year founded",
             validate: v => inRange(v, 1950, new Date().getFullYear()) && Number.isInteger(v) },
  note:    { type: "string", required: true,  description: "Description",
             validate: isString },
};

export const EcosystemOrgSchema = {
  id:     { type: "string", required: true,  description: "e_{shortname} format",
            validate: v => isString(v) && v.startsWith("e_") },
  name:   { type: "string", required: true,  description: "Full name",
            validate: isString },
  etype:  { type: "enum",   required: true,  description: "Organization type",
            validate: v => inEnum(v, KNOWN_ECOSYSTEM_ORG_TYPES) },
  city:   { type: "string", required: true,  description: "Nevada city",
            validate: isString },
  region: { type: "enum",   required: true,  description: "Region",
            validate: v => inEnum(v, KNOWN_REGIONS) },
  note:   { type: "string", required: true,  description: "Description",
            validate: isString },
};

export const RegulatoryDocketSchema = {
  id:             { type: "string",   required: true,  description: "rd_{NN} format",
                    validate: v => isString(v) && /^rd_\d+$/.test(v) },
  title:          { type: "string",   required: true,  description: "Full title",
                    validate: isString },
  agency:         { type: "string",   required: true,  description: "Issuing agency",
                    validate: isString },
  sector:         { type: "string[]", required: true,  description: "Affected sectors",
                    validate: v => isArray(v) && v.length >= 1 },
  status:         { type: "enum",     required: true,  description: "Docket status",
                    validate: v => inEnum(v, KNOWN_DOCKET_STATUSES) },
  severity:       { type: "number",   required: true,  description: "Severity 1-5",
                    validate: v => inRange(v, 1, 5) && Number.isInteger(v) },
  breadth:        { type: "number",   required: true,  description: "Breadth 0.0-1.0",
                    validate: v => inRange(v, 0, 1) },
  timeline:       { type: "enum",     required: true,  description: "Timeline horizon",
                    validate: v => inEnum(v, KNOWN_DOCKET_TIMELINES) },
  supportiveness: { type: "number",   required: true,  description: "Supportiveness 0-100",
                    validate: v => inRange(v, 0, 100) },
  burden:         { type: "number",   required: true,  description: "Compliance burden 0-100",
                    validate: v => inRange(v, 0, 100) },
  description:    { type: "string",   required: true,  description: "Detailed description",
                    validate: isString },
};

export const SectorDynamicsSchema = {
  growth3YCAGR:   { type: "number", required: true,  description: "3-year CAGR (decimal)",
                    validate: v => inRange(v, -1, 2) },
  dealGrowthYoY:  { type: "number", required: true,  description: "YoY deal growth rate",
                    validate: v => inRange(v, -1, 2) },
  smartMoneyShare:{ type: "number", required: true,  description: "Smart money share (0-1)",
                    validate: v => inRange(v, 0, 1) },
  porterScores:   { type: "object", required: true,  description: "Porter's Five Forces (each 1-5)",
                    validate: v => {
                      if (!v || typeof v !== "object") return false;
                      const keys = ["rivalry", "entrants", "substitutes", "buyerPower", "supplierPower"];
                      return keys.every(k => inRange(v[k], 1, 5) && Number.isInteger(v[k]));
                    }},
  maturityStage:  { type: "enum",   required: true,  description: "Market maturity stage",
                    validate: v => inEnum(v, KNOWN_MATURITY_STAGES) },
};

const riskFactorValidator = v => {
  if (!isArray(v)) return false;
  return v.every(rf =>
    isString(rf.category) && inEnum(rf.category, KNOWN_RISK_CATEGORIES) &&
    isString(rf.name) &&
    inRange(rf.likelihood, 1, 5) && Number.isInteger(rf.likelihood) &&
    inRange(rf.impact, 1, 5) && Number.isInteger(rf.impact)
  );
};

const scoreValidator = (keys) => v => {
  if (!v || typeof v !== "object") return false;
  return keys.every(k => inRange(v[k], 1, 5) && Number.isInteger(v[k]));
};

export const CompanyIADataSchema = {
  trl:                { type: "number",   required: true,  description: "Technology Readiness Level 1-9",
                        validate: v => inRange(v, 1, 9) && Number.isInteger(v) },
  mrl:                { type: "number",   required: true,  description: "Market Readiness Level 1-9",
                        validate: v => inRange(v, 1, 9) && Number.isInteger(v) },
  riskFactors:        { type: "object[]", required: true,  description: "Risk factors [{category, name, likelihood, impact}]",
                        validate: riskFactorValidator },
  ventureQuality:     { type: "object",   required: true,  description: "Venture quality {market, valueProp, businessModel, team} each 1-5",
                        validate: scoreValidator(["market", "valueProp", "businessModel", "team"]) },
  regulatoryExposure: { type: "string[]", required: true,  description: "Regulatory bodies with jurisdiction",
                        validate: v => isArray(v) && v.length >= 1 && v.every(isString) },
  complianceMaturity: { type: "object",   required: true,  description: "Compliance maturity {governance, policies, systems, monitoring, training} each 1-5",
                        validate: scoreValidator(["governance", "policies", "systems", "monitoring", "training"]) },
};

export const ListingSchema = {
  companyId: { type: "number", required: true,  description: "Company ID",
               validate: v => isNumber(v) && v > 0 && Number.isInteger(v) },
  exchange:  { type: "string", required: true,  description: "Stock exchange",
               validate: v => inEnum(v, KNOWN_EXCHANGES) },
  ticker:    { type: "string", required: true,  description: "Ticker symbol",
               validate: v => isString(v) && /^[A-Z0-9.]+$/.test(v) },
};

export const TimelineEventSchema = {
  date:    { type: "string", required: true,  description: "ISO date YYYY-MM-DD",
             validate: v => isString(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) },
  type:    { type: "enum",   required: true,  description: "Event type",
             validate: v => inEnum(v, KNOWN_TIMELINE_EVENT_TYPES) },
  company: { type: "string", required: true,  description: "Company name",
             validate: isString },
  detail:  { type: "string", required: true,  description: "Event description",
             validate: isString },
  icon:    { type: "string", required: true,  description: "Emoji icon",
             validate: v => typeof v === "string" && v.length > 0 },
};

export const ContextLayerSchema = {
  layerId:          { type: "string", required: true,  description: "Unique layer ID",
                      validate: v => isString(v) && /^[a-z_]+$/.test(v) },
  type:             { type: "enum",   required: true,  description: "Layer type",
                      validate: v => inEnum(v, ["geospatial", "temporal", "economic", "regulatory", "network", "demographic"]) },
  source:           { type: "string", required: true,  description: "Data source and methodology",
                      validate: isString },
  timestamp:        { type: "string", required: true,  description: "Last updated ISO 8601",
                      validate: v => isString(v) && /^\d{4}-\d{2}-\d{2}/.test(v) },
  refreshFrequency: { type: "string", required: true,  description: "Refresh cadence",
                      validate: isString },
  data:             { type: "object", required: true,  description: "Layer-specific payload",
                      validate: v => v !== null && typeof v === "object" },
};


// --- Validation Utility ---

/**
 * Validate a single entity against a schema.
 * @param {object} entity - The data object to validate
 * @param {object} schema - The schema definition (e.g., CompanySchema)
 * @param {string} label  - Human-readable label for error messages
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEntity(entity, schema, label = "entity") {
  const errors = [];

  for (const [field, spec] of Object.entries(schema)) {
    const value = entity[field];

    // Check required fields
    if (spec.required && (value === undefined || value === null)) {
      errors.push(`${label}: missing required field "${field}"`);
      continue;
    }

    // Skip validation if optional and not present
    if (value === undefined || value === null) continue;

    // Run validator
    if (spec.validate && !spec.validate(value)) {
      errors.push(`${label}: invalid value for "${field}" (got ${JSON.stringify(value)}, expected ${spec.type}: ${spec.description})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an array of entities against a schema.
 * @param {object[]} entities - Array of data objects
 * @param {object} schema - Schema definition
 * @param {string} entityType - Entity type name for error messages
 * @param {string} [idField="id"] - Field to use for entity identification in errors
 * @returns {{ valid: boolean, errors: string[], counts: { total: number, valid: number, invalid: number } }}
 */
export function validateCollection(entities, schema, entityType, idField = "id") {
  const allErrors = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const label = `${entityType}[${entity[idField] || i}]`;
    const result = validateEntity(entity, schema, label);
    allErrors.push(...result.errors);
  }

  const invalidCount = new Set(
    allErrors.map(e => e.split(":")[0])
  ).size;

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    counts: {
      total: entities.length,
      valid: entities.length - invalidCount,
      invalid: invalidCount,
    },
  };
}
