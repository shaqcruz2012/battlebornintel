#!/usr/bin/env node
/**
 * BBI Data Pipeline CLI
 *
 * Usage:
 *   node src/index.js --source pucn     # Scrape PUCN dockets
 *   node src/index.js --source blm      # Scrape BLM ePlanning
 *   node src/index.js --source oasis    # Scrape NV Energy OASIS queue
 *   node src/index.js --source all      # Run all scrapers
 *
 * Output: Updates data files in apps/esint/src/data/
 */

import { SOURCES } from './config.js';

const args = process.argv.slice(2);
const sourceFlag = args.indexOf('--source');
const source = sourceFlag !== -1 ? args[sourceFlag + 1] : null;

if (!source) {
  console.log('BBI Data Pipeline v0.1.0');
  console.log('');
  console.log('Usage: node src/index.js --source <name>');
  console.log('');
  console.log('Available sources:');
  for (const [key, cfg] of Object.entries(SOURCES)) {
    console.log(`  ${key.padEnd(10)} ${cfg.name} — ${cfg.description}`);
  }
  process.exit(0);
}

async function run(sourceName) {
  console.log(`[pipeline] Starting ${sourceName} scraper...`);

  switch (sourceName) {
    case 'pucn': {
      const { scrapePUCN } = await import('./scrapers/pucn.js');
      const raw = await scrapePUCN();
      const { toDockets } = await import('./transformers/to-dockets.js');
      const dockets = toDockets(raw);
      console.log(`[pipeline] Scraped ${dockets.length} dockets from PUCN`);
      // TODO: write to OUTPUT_DIR/dockets.js
      break;
    }
    case 'blm':
      console.log('[pipeline] BLM scraper not yet implemented');
      break;
    case 'oasis':
      console.log('[pipeline] OASIS scraper not yet implemented');
      break;
    case 'all':
      for (const s of Object.keys(SOURCES)) {
        await run(s);
      }
      return;
    default:
      console.error(`Unknown source: ${sourceName}`);
      process.exit(1);
  }
}

run(source).catch(err => {
  console.error('[pipeline] Fatal:', err.message);
  process.exit(1);
});
