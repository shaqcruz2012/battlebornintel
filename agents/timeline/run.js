import "dotenv/config";
import { getDb, saveDb } from "../lib/db.js";
import { searchCompanies } from "./search-companies.js";
import { extractAndStoreEvents } from "./extract-events.js";
import { verifyExistingEvents } from "./verify-existing.js";

async function main() {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`BBI Timeline Agent — ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  const db = await getDb();

  console.log("--- Phase 1: Searching for new events ---");
  const companyResults = await searchCompanies(db);
  const { added, quarantined, skipped } = await extractAndStoreEvents(db, companyResults);
  console.log(`\nNew events: ${added} added, ${quarantined} quarantined, ${skipped} skipped\n`);

  console.log("--- Phase 2: Verifying existing events ---");
  const { verified, corrected, failed } = await verifyExistingEvents(db);
  console.log(`\nVerification: ${verified} verified, ${corrected} corrected, ${failed} failed\n`);

  saveDb(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${"=".repeat(60)}`);
  console.log(`Complete in ${elapsed}s — ${added} new, ${quarantined} quarantined, ${verified} verified`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(err => {
  console.error("Timeline agent failed:", err);
  process.exit(1);
});
