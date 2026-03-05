// agents/enrichment/discover-relationships.js
// Phase A, step 2: Uses LLM to discover missing edges between existing entities.
// Validates proposed edges against the ontology, checks for duplicates,
// auto-publishes high-confidence edges, and quarantines low-confidence ones.
// Also collects candidate entity names mentioned in search results but NOT in
// the graph, to feed into Phase B (new entity discovery).

import { queryAll, queryOne, run } from "../lib/db.js";
import { extractRelationships } from "../lib/llm.js";
import { computeConfidence, shouldQuarantine } from "../lib/confidence.js";
import { classifySource } from "../lib/search.js";
import { getEntityEdges, getAllEntityNames } from "./search-entities.js";
import { fuzzyMatch } from "./dedup.js";
import { LINK_TYPES } from "../../packages/ui-core/src/ontology.js";

// ---------------------------------------------------------------------------
// Map display etype strings to ontology keys used in LINK_TYPES
// ---------------------------------------------------------------------------
const ETYPE_TO_ONTOLOGY = {
  "VC Firm": "vc_firm",
  "PE Firm": "vc_firm",       // PE firms use same ontology type as VC
  "Angel": "angel",
  "Corporation": "corporation",
  "Accelerator": "accelerator",
  "Government": "gov_agency",
  "University": "university",
  "Person": "person",
  "Investment Co": "vc_firm",
  "Foundation": "vc_firm",
  "SPAC": "corporation",
  "Economic Development": "gov_agency",
  "University Hub": "university",
};

// Credibility ordering for picking the best source from search results
const CREDIBILITY_ORDER = {
  official: 5,
  tier1: 4,
  tier2: 3,
  tier3: 2,
  unknown: 1,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Discover missing relationships between existing entities.
 *
 * For each entity+searchResults pair:
 *   1. Calls extractRelationships() to get LLM-proposed edges
 *   2. Validates each edge against LINK_TYPES
 *   3. Checks for duplicate edges before inserting
 *   4. Auto-publishes if confidence >= 0.60, else quarantines
 *   5. Collects candidate entity names NOT found in the graph (Phase B input)
 *
 * @param {object} db - sql.js database handle
 * @param {Array<{entity: object, searchResults: object[]}>} entityResults
 *        Output from searchEntities()
 * @returns {Promise<{added: number, quarantined: number, skipped: number, candidates: string[]}>}
 */
export async function discoverRelationships(db, entityResults) {
  let added = 0;
  let quarantined = 0;
  let skipped = 0;
  const candidateNames = new Set(); // Names not in graph -> Phase B candidates

  const existingNames = getAllEntityNames(db);

  for (const { entity, searchResults } of entityResults) {
    if (searchResults.length === 0) continue;

    // Build the snippet block that the LLM will read
    const snippets = searchResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`)
      .join("\n\n");

    const knownEdges = getEntityEdges(db, entity.id);

    console.log(`  Discovering relationships for: ${entity.name}`);

    try {
      const relationships = await extractRelationships(
        entity.name,
        entity.etype,
        knownEdges,
        existingNames,
        snippets,
      );

      if (!relationships || relationships.length === 0) {
        console.log(`    -> No new relationships found`);
        continue;
      }

      for (const rel of relationships) {
        // ------------------------------------------------------------------
        // 1. Resolve target_name to an existing entity via fuzzy match
        // ------------------------------------------------------------------
        const matchedName = fuzzyMatch(rel.target_name, existingNames);

        if (!matchedName) {
          // Name not in graph -- collect as Phase B candidate
          candidateNames.add(rel.target_name);
          console.log(
            `    -> Unknown entity: "${rel.target_name}" (saved for Phase B)`,
          );
          continue;
        }

        // ------------------------------------------------------------------
        // 2. Look up the matched entity's id and etype in the database
        // ------------------------------------------------------------------
        const targetEntity = resolveEntityId(db, matchedName);
        if (!targetEntity) {
          skipped++;
          continue;
        }

        // ------------------------------------------------------------------
        // 3. Validate edge against the ontology's LINK_TYPES
        // ------------------------------------------------------------------
        const sourceOntology = ETYPE_TO_ONTOLOGY[entity.etype];
        const targetOntology =
          ETYPE_TO_ONTOLOGY[targetEntity.etype] ||
          guessOntologyType(targetEntity);
        const linkType = LINK_TYPES[rel.rel_type];

        if (!linkType) {
          console.log(`    -> Invalid rel_type: ${rel.rel_type}`);
          skipped++;
          continue;
        }

        if (
          !linkType.validSources.includes(sourceOntology) ||
          !linkType.validTargets.includes(targetOntology)
        ) {
          console.log(
            `    -> Ontology mismatch: ${sourceOntology} -[${rel.rel_type}]-> ${targetOntology}`,
          );
          skipped++;
          continue;
        }

        // ------------------------------------------------------------------
        // 4. Check for duplicate edge
        // ------------------------------------------------------------------
        const existing = queryOne(
          db,
          `SELECT id FROM edges WHERE source = ? AND target = ? AND rel = ?`,
          [entity.id, targetEntity.id, rel.rel_type],
        );
        if (existing) {
          console.log(
            `    -> Duplicate edge: ${entity.name} -[${rel.rel_type}]-> ${matchedName}`,
          );
          skipped++;
          continue;
        }

        // ------------------------------------------------------------------
        // 5. Compute confidence score
        // ------------------------------------------------------------------
        const bestSource = searchResults.reduce((best, r) => {
          const cred = classifySource(r.url);
          return (CREDIBILITY_ORDER[cred] || 0) >
            (CREDIBILITY_ORDER[best] || 0)
            ? cred
            : best;
        }, "unknown");

        // Map the LLM's relationship_confidence to the extraction shape
        // that computeConfidence() expects (date_confidence + amount_confidence).
        const confMap = {
          exact: { date_confidence: "exact", amount_confidence: "exact" },
          approximate: {
            date_confidence: "approximate",
            amount_confidence: "approximate",
          },
          inferred: {
            date_confidence: "inferred",
            amount_confidence: "inferred",
          },
        };
        const mapped =
          confMap[rel.relationship_confidence] || confMap.inferred;
        const corroboratingCount = Math.max(searchResults.length - 1, 0);
        const confidence = computeConfidence(
          mapped,
          bestSource,
          corroboratingCount,
        );

        // ------------------------------------------------------------------
        // 6. Insert or quarantine
        // ------------------------------------------------------------------
        const now = new Date().toISOString();

        if (shouldQuarantine(confidence)) {
          run(
            db,
            `INSERT INTO pending_review
               (target_table, proposed_data, confidence, sources, agent_id, created_at, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [
              "edges",
              JSON.stringify({
                source: entity.id,
                target: targetEntity.id,
                rel: rel.rel_type,
                note: rel.note || null,
                year: rel.year || null,
              }),
              confidence,
              JSON.stringify(searchResults.map((r) => r.url)),
              "enrichment_agent",
              now,
            ],
          );
          console.log(
            `    -> Quarantined edge: ${entity.name} -[${rel.rel_type}]-> ${matchedName} (${confidence})`,
          );
          quarantined++;
        } else {
          run(
            db,
            `INSERT INTO edges (source, target, rel, note, year)
             VALUES (?, ?, ?, ?, ?)`,
            [
              entity.id,
              targetEntity.id,
              rel.rel_type,
              rel.note || null,
              rel.year || null,
            ],
          );
          console.log(
            `    -> Added edge: ${entity.name} -[${rel.rel_type}]-> ${matchedName} (${confidence})`,
          );
          added++;
        }
      }
    } catch (err) {
      console.error(
        `    x Relationship discovery failed for ${entity.name}: ${err.message}`,
      );
    }
  }

  return { added, quarantined, skipped, candidates: [...candidateNames] };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve an entity name to its {id, etype} in the database.
 * Checks the entities table first, then falls back to companies.
 *
 * @param {object} db
 * @param {string} name
 * @returns {{id: string, etype: string}|null}
 */
function resolveEntityId(db, name) {
  // Check entities table first (has etype column)
  const entity = queryOne(
    db,
    `SELECT id, etype FROM entities WHERE name = ?`,
    [name],
  );
  if (entity) return entity;

  // Companies table — these are always ontology type "company"
  const company = queryOne(
    db,
    `SELECT CAST(id AS TEXT) as id, 'Company' as etype FROM companies WHERE name = ?`,
    [name],
  );
  return company || null;
}

/**
 * Guess ontology type for entities that don't have a mapped etype
 * (e.g., rows from the companies table).
 *
 * @param {{etype: string}} entity
 * @returns {string} ontology key
 */
function guessOntologyType(entity) {
  if (entity.etype === "Company") return "company";
  return ETYPE_TO_ONTOLOGY[entity.etype] || "company";
}
