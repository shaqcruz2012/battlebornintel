import "dotenv/config";
import { getDb, saveDb } from "../lib/db.js";
import { loadSparseEntities, searchEntities } from "./search-entities.js";
import { enrichEntities } from "./enrich-entities.js";
import { discoverRelationships } from "./discover-relationships.js";
import { discoverEntities } from "./discover-entities.js";

async function main() {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`BBI Enrichment Agent — ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  const db = await getDb();

  // --- Phase A: Enrich Existing Entities ---
  console.log("--- Phase A: Enriching existing risk capital entities ---\n");

  console.log("Step 1: Loading sparse entities...");
  const entities = loadSparseEntities(db);
  console.log(`  Found ${entities.length} entities to enrich\n`);

  if (entities.length === 0) {
    console.log("No sparse entities found. Skipping enrichment.\n");
    saveDb(db);
    return;
  }

  console.log("Step 2: Searching web for entity information...");
  const entityResults = await searchEntities(db, entities);
  console.log(`  Searched ${entityResults.length} entities\n`);

  console.log("Step 3: Extracting entity details via LLM...");
  const enrichStats = await enrichEntities(db, entityResults);
  console.log(`  Enrichments: ${enrichStats.enriched} applied, ${enrichStats.quarantined} quarantined, ${enrichStats.skipped} skipped\n`);

  console.log("Step 4: Discovering missing relationships...");
  const relStats = await discoverRelationships(db, entityResults);
  console.log(`  Relationships: ${relStats.added} added, ${relStats.quarantined} quarantined, ${relStats.skipped} skipped`);
  console.log(`  Phase B candidates: ${relStats.candidates.length} new names\n`);

  // --- Phase B: Discover New Entities ---
  console.log("--- Phase B: Discovering new entities ---\n");
  const discoverStats = await discoverEntities(db, relStats.candidates);
  console.log(`  Discovered: ${discoverStats.discovered} quarantined, ${discoverStats.discarded} discarded, ${discoverStats.duplicates} duplicates\n`);

  // Save
  saveDb(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${"=".repeat(60)}`);
  console.log(`Complete in ${elapsed}s`);
  console.log(`  Entities enriched: ${enrichStats.enriched} | quarantined: ${enrichStats.quarantined}`);
  console.log(`  Edges added: ${relStats.added} | quarantined: ${relStats.quarantined}`);
  console.log(`  New entities discovered: ${discoverStats.discovered} | discarded: ${discoverStats.discarded}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(err => {
  console.error("Enrichment agent failed:", err);
  process.exit(1);
});
