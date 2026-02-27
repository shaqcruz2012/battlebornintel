/**
 * Stage-duration benchmarks derived from real Nevada energy project timelines.
 * Values in months. p25/median/p75 represent optimistic/expected/pessimistic durations.
 *
 * Sources:
 * - Gemini Solar: proposed 2017 → operational 2024 (~7 years total)
 * - Reid Gardner BESS: approved 2021 → operational 2025 (~4 years)
 * - Sierra Solar: approved 2023 → est. operational 2027 (~4 years)
 * - Greenlink West: proposed 2020 → est. complete 2027 (~7 years)
 * - Fervo Corsac: concept 2021 → under construction 2023 (~2 years to construction)
 * - Typical BLM NEPA timeline: 18-36 months for EIS, 6-12 months for EA
 * - Typical PUCN IRP cycle: 12-18 months from filing to approval
 */
export const STAGE_BENCHMARKS = {
  "Solar+BESS": {
    proposed_to_queue:                { median: 8,  p25: 4,  p75: 14 },
    queue_to_nepa_review:             { median: 10, p25: 6,  p75: 16 },
    nepa_review_to_approved:          { median: 18, p25: 12, p75: 30 },
    approved_to_under_construction:   { median: 8,  p25: 4,  p75: 14 },
    under_construction_to_operational:{ median: 24, p25: 18, p75: 36 },
  },
  "Solar": {
    proposed_to_queue:                { median: 6,  p25: 3,  p75: 12 },
    queue_to_nepa_review:             { median: 8,  p25: 5,  p75: 14 },
    nepa_review_to_approved:          { median: 16, p25: 10, p75: 28 },
    approved_to_under_construction:   { median: 6,  p25: 3,  p75: 12 },
    under_construction_to_operational:{ median: 18, p25: 12, p75: 24 },
  },
  "BESS": {
    proposed_to_queue:                { median: 6,  p25: 3,  p75: 10 },
    queue_to_nepa_review:             { median: 6,  p25: 4,  p75: 10 },
    nepa_review_to_approved:          { median: 12, p25: 8,  p75: 20 },
    approved_to_under_construction:   { median: 6,  p25: 3,  p75: 10 },
    under_construction_to_operational:{ median: 18, p25: 12, p75: 24 },
  },
  "Geothermal": {
    proposed_to_queue:                { median: 12, p25: 8,  p75: 18 },
    queue_to_nepa_review:             { median: 12, p25: 8,  p75: 18 },
    nepa_review_to_approved:          { median: 18, p25: 12, p75: 30 },
    approved_to_under_construction:   { median: 12, p25: 8,  p75: 18 },
    under_construction_to_operational:{ median: 30, p25: 24, p75: 42 },
  },
  "Transmission": {
    proposed_to_queue:                { median: 12, p25: 8,  p75: 18 },
    queue_to_nepa_review:             { median: 12, p25: 8,  p75: 20 },
    nepa_review_to_approved:          { median: 24, p25: 18, p75: 36 },
    approved_to_under_construction:   { median: 12, p25: 6,  p75: 18 },
    under_construction_to_operational:{ median: 30, p25: 24, p75: 42 },
  },
  "Data_Center": {
    proposed_to_queue:                { median: 4,  p25: 2,  p75: 8 },
    queue_to_nepa_review:             { median: 3,  p25: 2,  p75: 6 },
    nepa_review_to_approved:          { median: 6,  p25: 3,  p75: 12 },
    approved_to_under_construction:   { median: 4,  p25: 2,  p75: 8 },
    under_construction_to_operational:{ median: 18, p25: 12, p75: 24 },
  },
  "Wind": {
    proposed_to_queue:                { median: 8,  p25: 5,  p75: 14 },
    queue_to_nepa_review:             { median: 10, p25: 6,  p75: 16 },
    nepa_review_to_approved:          { median: 20, p25: 14, p75: 32 },
    approved_to_under_construction:   { median: 8,  p25: 4,  p75: 14 },
    under_construction_to_operational:{ median: 24, p25: 18, p75: 30 },
  },
  "Pumped Hydro": {
    proposed_to_queue:                { median: 12, p25: 8,  p75: 20 },
    queue_to_nepa_review:             { median: 14, p25: 10, p75: 22 },
    nepa_review_to_approved:          { median: 30, p25: 24, p75: 42 },
    approved_to_under_construction:   { median: 12, p25: 8,  p75: 18 },
    under_construction_to_operational:{ median: 48, p25: 36, p75: 60 },
  },
  "Hydrogen": {
    proposed_to_queue:                { median: 10, p25: 6,  p75: 16 },
    queue_to_nepa_review:             { median: 10, p25: 6,  p75: 16 },
    nepa_review_to_approved:          { median: 18, p25: 12, p75: 28 },
    approved_to_under_construction:   { median: 10, p25: 6,  p75: 16 },
    under_construction_to_operational:{ median: 24, p25: 18, p75: 36 },
  },
  "Gas_Peaker": {
    proposed_to_queue:                { median: 4,  p25: 2,  p75: 8 },
    queue_to_nepa_review:             { median: 4,  p25: 2,  p75: 8 },
    nepa_review_to_approved:          { median: 12, p25: 8,  p75: 18 },
    approved_to_under_construction:   { median: 6,  p25: 3,  p75: 10 },
    under_construction_to_operational:{ median: 18, p25: 12, p75: 24 },
  },
};

/**
 * Risk multipliers applied to benchmark durations.
 * >1.0 means longer timeline, <1.0 means faster.
 */
export const RISK_MULTIPLIERS = {
  transmission_dependent: 1.3,    // Waiting on Greenlink West/North — 30% longer
  blm_eis_remand: 1.5,           // EIS remanded for additional review — 50% longer
  water_constraints: 1.2,        // Desert water availability issues — 20% longer
  large_project: 1.15,           // >500MW projects face additional scrutiny — 15% longer
  utility_owned: 0.85,           // Utility self-builds move faster through IRP process
  competitive_lease: 1.25,       // BLM competitive lease adds procurement complexity
  programmatic_eis: 1.4,         // Programmatic EIS covers wider scope — 40% longer
  interstate_transmission: 1.35, // FERC + multi-state review — 35% longer
  endangered_species: 1.3,       // Desert tortoise or other ESA compliance — 30% longer
  tribal_consultation: 1.2,      // Required tribal consultation adds time
  existing_interconnection: 0.8, // Reusing existing interconnection point — 20% faster
  solar_energy_zone: 0.85,       // BLM SEZ with reduced environmental conflict — 15% faster
};
