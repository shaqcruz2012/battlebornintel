// ---------------------------------------------------------------------------
// Economic-Development Ontology Configuration
// Palantir-style type system for risk-capital-formation tracking
// ---------------------------------------------------------------------------

// ── Object (entity) types ──────────────────────────────────────────────────
export const OBJECT_TYPES = {
  company:     { prefix: "c_", label: "Company",     icon: "⬡", requiredProps: ["name", "stage", "city"] },
  vc_firm:     { prefix: "x_", label: "VC Firm",     icon: "◈", requiredProps: ["name"] },
  angel:       { prefix: "x_", label: "Angel Group", icon: "◈", requiredProps: ["name"] },
  ssbci_fund:  { prefix: "f_", label: "SSBCI Fund",  icon: "◈", requiredProps: ["name", "allocated"] },
  accelerator: { prefix: "a_", label: "Accelerator", icon: "▲", requiredProps: ["name"] },
  corporation: { prefix: "x_", label: "Corporation", icon: "△", requiredProps: ["name"] },
  university:  { prefix: "x_", label: "University",  icon: "▣", requiredProps: ["name"] },
  gov_agency:  { prefix: "x_", label: "Gov Agency",  icon: "⊕", requiredProps: ["name"] },
  person:      { prefix: "p_", label: "Person",      icon: "●", requiredProps: ["name", "role"] },
  exchange:    { prefix: "x_", label: "Exchange",     icon: "◧", requiredProps: ["name"] },
};

// ── Link (relationship) types ──────────────────────────────────────────────
export const LINK_TYPES = {
  invested_in:       { label: "Invested In",    validSources: ["vc_firm", "angel", "ssbci_fund", "corporation"], validTargets: ["company"], weightProp: "deal_size" },
  loaned_to:         { label: "Loaned To",      validSources: ["ssbci_fund"], validTargets: ["company"], weightProp: "loan_amount" },
  grants_to:         { label: "Grants To",      validSources: ["gov_agency"], validTargets: ["company"], weightProp: "grant_amount" },
  accelerated_by:    { label: "Accelerated By", validSources: ["company"], validTargets: ["accelerator"], weightProp: "cohort_year" },
  partners_with:     { label: "Partners With",  validSources: ["company", "corporation"], validTargets: ["company", "corporation"], weightProp: null },
  contracts_with:    { label: "Contracts With", validSources: ["company", "corporation"], validTargets: ["company", "corporation"], weightProp: null },
  founded:           { label: "Founded",        validSources: ["person"], validTargets: ["company", "vc_firm"], weightProp: "year" },
  manages:           { label: "Manages",        validSources: ["person"], validTargets: ["vc_firm", "ssbci_fund"], weightProp: null },
  housed_at:         { label: "Housed At",      validSources: ["company"], validTargets: ["university"], weightProp: null },
  supports:          { label: "Supports",       validSources: ["gov_agency", "university"], validTargets: ["company"], weightProp: null },
  competes_with:     { label: "Competes With",  validSources: ["company"], validTargets: ["company"], weightProp: null },
  listed_on:         { label: "Listed On",      validSources: ["company"], validTargets: ["exchange"], weightProp: null },
  acquired:          { label: "Acquired",       validSources: ["company", "corporation"], validTargets: ["company"], weightProp: "deal_size" },
  won_pitch:         { label: "Won Pitch",      validSources: ["company"], validTargets: ["accelerator"], weightProp: null },
  incubated_by:      { label: "Incubated By",   validSources: ["company"], validTargets: ["accelerator"], weightProp: null },
  approved_by:       { label: "Approved By",    validSources: ["company"], validTargets: ["gov_agency"], weightProp: null },
  collaborated_with: { label: "Collaborated",   validSources: ["company", "university"], validTargets: ["company", "university"], weightProp: null },
};

// ── Event types (timeline) ─────────────────────────────────────────────────
export const EVENT_TYPES = {
  funding:     { label: "Funding",     icon: "\u{1F4B0}", roundTypes: ["pre_seed", "seed", "series_a", "series_b", "series_c_plus", "growth", "debt"] },
  grant:       { label: "Grant",       icon: "\u{1F3DB}\uFE0F", roundTypes: ["sbir_1", "sbir_2", "doe", "state", "other"] },
  partnership: { label: "Partnership", icon: "\u{1F91D}", roundTypes: null },
  hiring:      { label: "Hiring",      icon: "\u{1F465}", roundTypes: null },
  momentum:    { label: "Momentum",    icon: "\u{1F4C8}", roundTypes: null },
  launch:      { label: "Launch",      icon: "\u{1F680}", roundTypes: null },
  award:       { label: "Award",       icon: "\u{1F3C6}", roundTypes: null },
  patent:      { label: "Patent",      icon: "\u{1F4DC}", roundTypes: null },
  acquisition: { label: "Acquisition", icon: "\u{1F504}", roundTypes: null },
};

// ── Confidence tiers ───────────────────────────────────────────────────────
export const CONFIDENCE_TIERS = {
  verified:   { min: 1.0,  color: "#4E9B60", label: "Verified",   icon: "\u2705", autoPublish: true },
  high:       { min: 0.85, color: "#5088A8", label: "High",       icon: "\u{1F535}", autoPublish: true },
  medium:     { min: 0.60, color: "#C49A38", label: "Medium",     icon: "\u{1F7E1}", autoPublish: true, tag: "unverified" },
  low:        { min: 0.30, color: "#D4864A", label: "Low",        icon: "\u{1F7E0}", autoPublish: false },
  unverified: { min: 0.0,  color: "#C25550", label: "Unverified", icon: "\u{1F534}", autoPublish: false },
};

/**
 * Return the confidence tier object for a given numeric score (0-1).
 * @param {number} score — confidence value between 0 and 1
 * @returns {object} matching tier from CONFIDENCE_TIERS
 */
export function getConfidenceTier(score) {
  if (score >= 1.0)  return CONFIDENCE_TIERS.verified;
  if (score >= 0.85) return CONFIDENCE_TIERS.high;
  if (score >= 0.60) return CONFIDENCE_TIERS.medium;
  if (score >= 0.30) return CONFIDENCE_TIERS.low;
  return CONFIDENCE_TIERS.unverified;
}

// ── Source credibility ratings ─────────────────────────────────────────────
export const SOURCE_CREDIBILITY = {
  official: { label: "Official Filing", baseConfidence: 0.95, examples: "SEC EDGAR, state filings, company IR" },
  tier1:    { label: "Tier 1 Press",    baseConfidence: 0.85, examples: "Reuters, Bloomberg, WSJ, TechCrunch, PitchBook" },
  tier2:    { label: "Tier 2 Press",    baseConfidence: 0.70, examples: "NNBW, Vegas Inc, RGJ, trade pubs" },
  tier3:    { label: "Tier 3",          baseConfidence: 0.50, examples: "Blogs, social media, press releases" },
  unknown:  { label: "Unknown",         baseConfidence: 0.30, examples: "Unclassified source" },
};
