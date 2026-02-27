#!/usr/bin/env node
/**
 * CLI data validator for BBI platform verticals.
 *
 * Usage:
 *   node scripts/validate-data.js apps/goed
 *   node scripts/validate-data.js apps/template
 *
 * Loads data/*.js and config.js from the given app directory,
 * runs validation, and prints errors/warnings/stats.
 */

import { pathToFileURL } from "url";
import { join, resolve } from "path";

const appDir = process.argv[2];
if (!appDir) {
  console.error("Usage: node scripts/validate-data.js <app-dir>");
  console.error("  e.g. node scripts/validate-data.js apps/goed");
  process.exit(1);
}

const abs = resolve(appDir);

async function load(file) {
  const url = pathToFileURL(join(abs, file)).href;
  return import(url);
}

try {
  const [companiesMod, fundsMod, timelineMod, graphMod, configMod, validateMod] = await Promise.all([
    load("src/data/companies.js"),
    load("src/data/funds.js"),
    load("src/data/timeline.js"),
    load("src/data/graph.js"),
    load("src/config.js"),
    import(pathToFileURL(resolve("packages/ui-core/src/data/validate.js")).href),
  ]);

  const data = {
    companies: companiesMod.COMPANIES,
    funds: fundsMod.FUNDS,
    timeline: timelineMod.TIMELINE_EVENTS,
    graphFunds: graphMod.GRAPH_FUNDS,
    people: graphMod.PEOPLE,
    externals: graphMod.EXTERNALS,
    accelerators: graphMod.ACCELERATORS,
    ecosystemOrgs: graphMod.ECOSYSTEM_ORGS,
    listings: graphMod.LISTINGS,
    verifiedEdges: graphMod.VERIFIED_EDGES,
  };

  // Load optional enterprise data files
  try { const m = await load("src/data/dockets.js"); data.dockets = m.DOCKETS; } catch {}
  try { const m = await load("src/data/ppa.js"); data.ppa = m.PPA_RECORDS; } catch {}
  try { const m = await load("src/data/queue.js"); data.queue = m.QUEUE_ENTRIES; } catch {}

  const config = configMod.default;
  const { validateDataPackage } = validateMod;
  const result = validateDataPackage(data, config);

  console.log(`\n  BBI Data Validation: ${abs}\n`);
  console.log(`  Stats:`);
  for (const [k, v] of Object.entries(result.stats)) {
    console.log(`    ${k.padEnd(16)} ${v}`);
  }

  if (result.warnings.length > 0) {
    console.log(`\n  Warnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.log(`    ⚠  ${w.path}: ${w.message}`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n  Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.log(`    ✗  ${e.path}: ${e.message}`);
    }
    console.log(`\n  INVALID — fix ${result.errors.length} error(s) before deploying.\n`);
    process.exit(1);
  } else {
    console.log(`\n  VALID — all checks passed.\n`);
  }
} catch (e) {
  console.error(`Failed to load app data from ${abs}:`, e.message);
  process.exit(1);
}
