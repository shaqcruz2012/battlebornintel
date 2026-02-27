/**
 * PUCN Docket Scraper
 *
 * Scrapes the Nevada Public Utilities Commission docket search
 * for energy-related proceedings. Extracts docket metadata,
 * filing lists, and deadline information.
 *
 * Target: https://pucn.nv.gov/Dockets/Dockets/
 *
 * NOTE: This is a scaffold. The actual scraping logic depends on
 * the PUCN site structure at runtime. The seed data in
 * apps/esint/src/data/dockets.js was hand-curated from
 * publicly available PUCN records.
 */

import { SOURCES } from '../config.js';

/**
 * Scrape PUCN docket search results.
 * @returns {Promise<Object[]>} Raw docket records
 */
export async function scrapePUCN() {
  const cfg = SOURCES.pucn;
  console.log(`[pucn] Fetching from ${cfg.searchUrl}`);

  // TODO: Implement actual scraping
  // 1. Fetch docket search page
  // 2. Parse HTML with cheerio
  // 3. Extract docket numbers, titles, dates, status
  // 4. For each docket, fetch filing list
  // 5. Return structured array

  // Placeholder — returns empty array until scraper is implemented
  console.log('[pucn] Scraper not yet implemented — using seed data');
  return [];
}
