/**
 * Transform raw PUCN scrape results into ESINT docket format.
 *
 * Input:  Raw records from pucn.js scraper
 * Output: Array matching apps/esint/src/data/dockets.js schema
 */

/**
 * @param {Object[]} rawRecords - Raw scraped docket data
 * @returns {Object[]} Docket objects matching ESINT schema
 */
export function toDockets(rawRecords) {
  return rawRecords.map(raw => ({
    id: raw.docketNumber || `dkt-${Date.now()}`,
    title: raw.title || 'Untitled Docket',
    agency: 'PUCN',
    status: mapStatus(raw.status),
    openDate: raw.openDate || null,
    lastActivity: raw.lastActivity || null,
    nextDeadline: raw.nextDeadline || null,
    projects: [], // Cross-reference with companies manually or via project name matching
    filings: (raw.filings || []).map(f => ({
      date: f.date,
      filer: f.filer || 'Unknown',
      type: f.type || 'filing',
      summary: f.summary || '',
    })),
    impact: raw.impact || '',
    url: raw.url || null,
  }));
}

function mapStatus(raw) {
  if (!raw) return 'open';
  const s = raw.toLowerCase();
  if (s.includes('closed') || s.includes('decided')) return 'decided';
  if (s.includes('comment')) return 'comment_period';
  if (s.includes('hearing')) return 'hearing';
  if (s.includes('remand')) return 'remanded';
  return 'open';
}
