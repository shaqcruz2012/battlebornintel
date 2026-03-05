// agents/enrichment/discover-entities.js
// Phase B: Discover new entities mentioned in Phase A's LLM outputs
// that aren't in the graph yet, validate them, and quarantine for human review.
import { run } from "../lib/db.js";
import { extractNewEntity } from "../lib/llm.js";
import { searchWeb, classifySource } from "../lib/search.js";
import { computeConfidence } from "../lib/confidence.js";
import { fuzzyMatch, findDuplicates } from "./dedup.js";
import { getAllEntityNames } from "./search-entities.js";

const RATE_LIMIT_MS = 1200;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Phase B: Discover new entities from candidate names.
 *
 * Takes candidate names from Phase A's relationship discovery (names not found
 * in graph), fuzzy-dedups against existing entities, web-searches each remaining
 * candidate, extracts structured entity data via LLM, and quarantines everything
 * for human review. Candidates with zero valid edges are discarded (orphan protection).
 *
 * @param {object} db
 * @param {string[]} candidateNames - Entity names from Phase A not found in graph
 * @returns {{ discovered: number, discarded: number, duplicates: number }}
 */
export async function discoverEntities(db, candidateNames) {
  let discovered = 0;
  let discarded = 0;
  let duplicates = 0;

  if (candidateNames.length === 0) {
    console.log("  No candidates for Phase B");
    return { discovered, discarded, duplicates };
  }

  const existingNames = getAllEntityNames(db);

  // Step 1: Fuzzy dedup — filter out names that match existing entities
  const genuinelyNew = [];
  for (const name of candidateNames) {
    const dupes = findDuplicates(name, existingNames);
    if (dupes.length > 0) {
      console.log(`  Dedup: "${name}" matches "${dupes[0].name}" (${dupes[0].method}, ${dupes[0].score})`);
      duplicates++;
    } else {
      genuinelyNew.push(name);
    }
  }

  console.log(`  ${genuinelyNew.length} candidates after dedup (${duplicates} duplicates removed)`);

  // Step 2: Search + LLM extract each candidate
  for (let i = 0; i < genuinelyNew.length; i++) {
    const candidateName = genuinelyNew[i];
    console.log(`  [${i + 1}/${genuinelyNew.length}] Researching: ${candidateName}`);

    try {
      // Web search
      const searchResults = await searchWeb(
        `${candidateName} venture capital investment fund`,
        { count: 5, freshness: "py" }
      );

      if (searchResults.length === 0) {
        console.log(`    → No search results`);
        discarded++;
        if (i < genuinelyNew.length - 1) await sleep(RATE_LIMIT_MS);
        continue;
      }

      const snippets = searchResults
        .map((r, idx) => `[${idx + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`)
        .join("\n\n");

      // LLM extraction
      const newEntity = await extractNewEntity(candidateName, existingNames, snippets);

      if (!newEntity) {
        console.log(`    → Not a valid risk capital entity`);
        discarded++;
        if (i < genuinelyNew.length - 1) await sleep(RATE_LIMIT_MS);
        continue;
      }

      // Orphan protection: must have at least 1 valid relationship
      const validRelationships = (newEntity.relationships || []).filter(rel => {
        const match = fuzzyMatch(rel.target_name, existingNames);
        return match !== null;
      });

      if (validRelationships.length === 0) {
        console.log(`    → Discarded: no valid edges to existing entities (orphan protection)`);
        discarded++;
        if (i < genuinelyNew.length - 1) await sleep(RATE_LIMIT_MS);
        continue;
      }

      // Compute confidence
      const bestSource = searchResults.reduce((best, r) => {
        const cred = classifySource(r.url);
        const order = { official: 5, tier1: 4, tier2: 3, tier3: 2, unknown: 1 };
        return (order[cred] || 0) > (order[best] || 0) ? cred : best;
      }, "unknown");
      const confidence = computeConfidence(
        { date_confidence: "inferred", amount_confidence: "inferred" },
        bestSource,
        searchResults.length - 1
      );

      // ALWAYS quarantine new entities regardless of confidence
      const now = new Date().toISOString();
      run(db,
        `INSERT INTO pending_review (target_table, proposed_data, confidence, sources, agent_id, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          "new_entity",
          JSON.stringify({
            entity: {
              name: newEntity.name,
              etype: newEntity.etype,
              city: newEntity.city || null,
              region: newEntity.region || null,
              founded: newEntity.founded || null,
              note: newEntity.note || null,
            },
            relationships: validRelationships,
          }),
          confidence,
          JSON.stringify(searchResults.map(r => r.url)),
          "enrichment_agent",
          now,
        ]
      );

      console.log(`    → Quarantined new entity: ${newEntity.name} (${newEntity.etype}) with ${validRelationships.length} edges`);
      discovered++;
    } catch (err) {
      console.error(`    ✗ Discovery failed for ${candidateName}: ${err.message}`);
      discarded++;
    }

    if (i < genuinelyNew.length - 1) await sleep(RATE_LIMIT_MS);
  }

  return { discovered, discarded, duplicates };
}
