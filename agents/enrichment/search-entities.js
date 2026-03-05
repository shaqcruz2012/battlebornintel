// agents/enrichment/search-entities.js
// Loads sparse risk capital entities from the DB and runs Brave web searches on each.
import { queryAll, run } from "../lib/db.js";
import { searchWeb, classifySource } from "../lib/search.js";

const BATCH_SIZE = 20;
const FRESHNESS_DAYS = 30; // Skip if searched within 30 days
const RATE_LIMIT_MS = 1200; // 1.2s between Brave API calls

const RISK_CAPITAL_ETYPES = ["VC Firm", "PE Firm", "Angel", "Investment Co", "Foundation"];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Count how many non-null "richness" fields an entity has.
 * Fewer = higher priority for enrichment.
 */
function sparsenessScore(entity) {
  let filled = 0;
  if (entity.city) filled++;
  if (entity.founded) filled++;
  if (entity.note && entity.note.length > 50) filled++;
  if (entity.region) filled++;
  return filled; // Lower = sparser = higher priority
}

/**
 * Load sparse risk capital entities, skipping recently searched ones.
 * Returns up to BATCH_SIZE entities sorted by sparseness (most sparse first).
 */
export function loadSparseEntities(db) {
  const cutoff = new Date(Date.now() - FRESHNESS_DAYS * 86400000).toISOString();

  // Get all risk capital entities (from entities table)
  const entities = queryAll(db,
    `SELECT e.id, e.name, e.etype, e.city, e.region, e.founded, e.note
     FROM entities e
     WHERE e.etype IN (${RISK_CAPITAL_ETYPES.map(() => "?").join(",")})
     AND e.id NOT IN (
       SELECT DISTINCT record_id FROM data_sources
       WHERE record_type = 'entity_enrichment'
       AND accessed_at > ?
     )`,
    [...RISK_CAPITAL_ETYPES, cutoff]
  );

  // Also get accelerators
  const accelerators = queryAll(db,
    `SELECT e.id, e.name, 'Accelerator' as etype, e.city, e.region, e.founded, e.note
     FROM entities e
     WHERE e.category = 'accelerator'
     AND e.id NOT IN (
       SELECT DISTINCT record_id FROM data_sources
       WHERE record_type = 'entity_enrichment'
       AND accessed_at > ?
     )`,
    [cutoff]
  );

  const all = [...entities, ...accelerators];

  // Sort by sparseness (most sparse first), then alphabetically for determinism
  all.sort((a, b) => {
    const sa = sparsenessScore(a);
    const sb = sparsenessScore(b);
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });

  return all.slice(0, BATCH_SIZE);
}

/**
 * Search Brave for each entity and collect results.
 * Rate-limited to stay within API budget.
 *
 * @param {object} db - Database instance
 * @param {Array} entities - Entities from loadSparseEntities
 * @returns {Promise<Array<{entity, searchResults}>>}
 */
export async function searchEntities(db, entities) {
  const results = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const query = buildSearchQuery(entity);

    console.log(`  [${i + 1}/${entities.length}] Searching: ${entity.name} (${entity.etype})`);

    try {
      const searchResults = await searchWeb(query, { count: 5, freshness: "py" });

      // Classify each source
      const classified = searchResults.map(r => ({
        ...r,
        credibility: classifySource(r.url),
      }));

      results.push({ entity, searchResults: classified });

      // Record the search in data_sources for freshness tracking
      const now = new Date().toISOString();
      run(db,
        `INSERT INTO data_sources (record_type, record_id, url, title, accessed_at, extraction_method)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ["entity_enrichment", entity.id, `brave:${query}`, `Search: ${entity.name}`, now, "brave_search"]
      );

      console.log(`    -> ${classified.length} results (${classified.map(r => r.credibility).join(", ")})`);
    } catch (err) {
      console.error(`    x Search failed for ${entity.name}: ${err.message}`);
      results.push({ entity, searchResults: [] });
    }

    // Rate limit between searches (skip after last)
    if (i < entities.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  return results;
}

/**
 * Build a search query optimized for finding risk capital entity details.
 */
function buildSearchQuery(entity) {
  const parts = [entity.name];

  // Add type-specific terms to focus results
  if (entity.etype === "VC Firm" || entity.etype === "PE Firm") {
    parts.push("venture capital fund investments portfolio");
  } else if (entity.etype === "Angel") {
    parts.push("angel investor investments");
  } else if (entity.etype === "Accelerator") {
    parts.push("accelerator program startups");
  } else if (entity.etype === "Corporation") {
    parts.push("corporate venture investments");
  } else {
    parts.push("investment fund");
  }

  return parts.join(" ");
}

/**
 * Get all existing entity names (for relationship matching downstream).
 */
export function getAllEntityNames(db) {
  const entities = queryAll(db, `SELECT name FROM entities`);
  const companies = queryAll(db, `SELECT name FROM companies`);
  return [...entities.map(e => e.name), ...companies.map(c => c.name)];
}

/**
 * Get existing edges for an entity (for relationship dedup downstream).
 */
export function getEntityEdges(db, entityId) {
  return queryAll(db,
    `SELECT e.source, e.target, e.rel, t.name as targetName
     FROM edges e
     LEFT JOIN entities t ON e.target = t.id
     LEFT JOIN companies c ON e.target = CAST(c.id AS TEXT)
     WHERE e.source = ?`,
    [entityId]
  );
}
