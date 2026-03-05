// agents/enrichment/dedup.js
// Fuzzy name matching module for deduplicating entity names.
// Used by the enrichment agent to detect when differently-formatted names
// refer to the same entity (e.g., "Accel Partners" vs "Accel").

// Common suffixes to strip from entity names for comparison.
// These are legal/structural designators that don't contribute to identity.
const STRIP_SUFFIXES = [
  "incorporated", "inc", "llc", "llp", "lp", "ltd", "limited",
  "partners", "partner", "capital", "ventures", "venture",
  "fund", "funds", "group", "management", "mgmt",
  "holdings", "holding", "corp", "corporation",
  "co", "company", "associates", "advisors", "advisory",
  "investment", "investments", "equity",
];

/**
 * Normalize an entity name for comparison.
 * Lowercases, strips punctuation, removes common business suffixes,
 * and collapses whitespace.
 *
 * @param {string} name - Raw entity name
 * @returns {string} Normalized name
 */
export function normalizeName(name) {
  if (!name) return "";
  let n = name.toLowerCase().trim();
  // Remove punctuation like periods, commas, quotes, parens
  n = n.replace(/[.,'"!?()]/g, "");
  // Strip suffixes (whole-word matches only)
  for (const suffix of STRIP_SUFFIXES) {
    const re = new RegExp(`\\b${suffix}\\b`, "g");
    n = n.replace(re, "");
  }
  // Collapse whitespace and trim
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

/**
 * Split a normalized name into significant tokens.
 * Filters out single-character tokens that are unlikely to be meaningful.
 *
 * @param {string} normalized - A name that has already been normalized
 * @returns {string[]} Array of significant tokens
 */
function tokenize(normalized) {
  return normalized.split(" ").filter((t) => t.length > 1);
}

/**
 * Compute the overlap ratio between two token arrays.
 * Returns the fraction of the shorter token set that appears in the longer one.
 *
 * @param {string[]} tokensA
 * @param {string[]} tokensB
 * @returns {number} Overlap ratio between 0 and 1
 */
function tokenOverlap(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let overlap = 0;
  for (const t of setA) {
    if (setB.has(t)) overlap++;
  }
  const shorter = Math.min(setA.size, setB.size);
  return shorter === 0 ? 0 : overlap / shorter;
}

/**
 * Find the best fuzzy match for a candidate name from a list of existing names.
 * Uses a 3-tier matching strategy:
 *   1. Exact match after normalization (returns immediately)
 *   2. Containment check (one normalized name contains the other)
 *   3. Token overlap >= 60% of the shorter name's significant words
 *
 * @param {string} candidateName - The name to match
 * @param {string[]} existingNames - Array of known names to match against
 * @returns {string|null} The best matching existing name, or null if no match
 */
export function fuzzyMatch(candidateName, existingNames) {
  const normCandidate = normalizeName(candidateName);
  if (!normCandidate) return null;
  const candidateTokens = tokenize(normCandidate);

  let bestMatch = null;
  let bestScore = 0;

  for (const existing of existingNames) {
    const normExisting = normalizeName(existing);
    if (!normExisting) continue;

    // Tier 1: Exact match after normalization
    if (normCandidate === normExisting) {
      return existing; // Perfect match, return immediately
    }

    // Tier 2: Containment check
    if (
      normCandidate.includes(normExisting) ||
      normExisting.includes(normCandidate)
    ) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = existing;
      }
      continue;
    }

    // Tier 3: Token overlap
    const existingTokens = tokenize(normExisting);
    const overlap = tokenOverlap(candidateTokens, existingTokens);
    if (overlap >= 0.6 && overlap > bestScore) {
      bestScore = overlap;
      bestMatch = existing;
    }
  }

  return bestMatch;
}

/**
 * Find ALL potential duplicate matches for a candidate name.
 * Uses the same 3-tier strategy as fuzzyMatch but returns every match
 * instead of just the best one, sorted by score descending.
 *
 * @param {string} candidateName - The name to match
 * @param {string[]} existingNames - Array of known names to match against
 * @returns {Array<{name: string, score: number, method: string}>}
 *   Array of matches with name, score (0-1), and method used
 */
export function findDuplicates(candidateName, existingNames) {
  const normCandidate = normalizeName(candidateName);
  if (!normCandidate) return [];
  const candidateTokens = tokenize(normCandidate);
  const matches = [];

  for (const existing of existingNames) {
    const normExisting = normalizeName(existing);
    if (!normExisting) continue;

    // Exact match
    if (normCandidate === normExisting) {
      matches.push({ name: existing, score: 1.0, method: "exact" });
      continue;
    }

    // Containment
    if (
      normCandidate.includes(normExisting) ||
      normExisting.includes(normCandidate)
    ) {
      matches.push({ name: existing, score: 0.9, method: "containment" });
      continue;
    }

    // Token overlap
    const existingTokens = tokenize(normExisting);
    const overlap = tokenOverlap(candidateTokens, existingTokens);
    if (overlap >= 0.6) {
      matches.push({
        name: existing,
        score: overlap,
        method: "token_overlap",
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches;
}
