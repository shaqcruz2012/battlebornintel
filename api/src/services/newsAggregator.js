import cfg from '../config.js';
import logger from '../logger.js';

// Nevada-relevant keywords for filtering
const NEVADA_KEYWORDS = [
  'nevada', 'las vegas', 'reno', 'henderson',
  'gigafactory', 'tahoe', 'ssbci', 'goed',
];

// SBIR agency-to-sector mapping
const SBIR_AGENCY_SECTOR = {
  DOD: 'Defense',
  DOE: 'CleanTech',
  NIH: 'Biotech',
  NSF: 'AI/ML',
  NASA: 'Space',
  DHS: 'Cybersecurity',
};

// Sector/vertical keywords matching our ecosystem clusters
const SECTOR_KEYWORDS = {
  'AI/ML': ['artificial intelligence', 'machine learning', 'llm', 'gpu', 'tensor', 'neural', 'deep learning', 'transformer', 'inference'],
  'CleanTech': ['battery', 'recycling', 'solar', 'renewable', 'ev ', 'electric vehicle', 'lithium', 'clean energy', 'climate tech', 'carbon'],
  'Defense': ['defense tech', 'military', 'dod ', 'darpa', 'sbir', 'sttr', 'dual-use'],
  'Data Centers': ['data center', 'cloud computing', 'colocation', 'hyperscale', 'gpu cloud'],
  'Gaming/Entertainment': ['igaming', 'sports betting', 'casino tech', 'esports', 'entertainment tech'],
  'Biotech': ['biotech', 'pharmaceutical', 'clinical trial', 'fda ', 'drug discovery', 'genomics'],
  'Space': ['space tech', 'launch', 'satellite', 'aerospace', 'rocket'],
  'Water': ['water tech', 'desalination', 'water treatment', 'drought'],
  'Mining/Materials': ['mining', 'lithium', 'rare earth', 'materials science', 'battery materials'],
  'Fintech': ['fintech', 'neobank', 'payment', 'blockchain', 'defi'],
};

// Company names from our database to match against
const TRACKED_COMPANIES = []; // populated from DB at startup

export async function fetchHackerNewsTop(limit = 100) {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const ids = await res.json();

  // Fetch story details in parallel (batch of 30)
  const stories = [];
  for (let i = 0; i < Math.min(ids.length, limit); i += 30) {
    const batch = ids.slice(i, i + 30);
    const details = await Promise.all(
      batch.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.json())
          .catch(() => null)
      )
    );
    stories.push(...details.filter(Boolean));
  }

  return stories.map(s => ({
    id: `hn_${s.id}`,
    source: 'Hacker News',
    title: s.title,
    url: s.url,
    score: s.score,
    comments: s.descendants || 0,
    author: s.by,
    timestamp: new Date(s.time * 1000).toISOString(),
    hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
  }));
}

// ---------- SBIR.gov Awards ----------
export async function fetchSBIRNews() {
  // Correct SBIR API: api.www.sbir.gov/public/api/awards (not www.sbir.gov/api/awards.json)
  // No state filter available — query by firm names of known NV companies
  const urls = [
    'https://api.www.sbir.gov/public/api/awards?agency=DOE&rows=100',
    'https://api.www.sbir.gov/public/api/awards?agency=DOD&rows=100',
    'https://api.www.sbir.gov/public/api/awards?agency=NASA&rows=100',
    'https://api.www.sbir.gov/public/api/awards?agency=NSF&rows=100',
  ];
  const allAwards = [];
  const seenIds = new Set();

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        logger.warn(`[news:sbir] HTTP ${res.status} from ${url}`);
        continue;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        logger.warn('[news:sbir] Non-JSON response, skipping');
        continue;
      }
      const data = await res.json();
      const awards = Array.isArray(data) ? data : (data.results || data.awards || []);
      for (const a of awards) {
        // Filter to Nevada companies only
        const state = (a.state || a.company_state || a.address?.state || '').toUpperCase();
        if (state !== 'NV' && state !== 'NEVADA') continue;
        const id = a.id || a.award_id || a.awardId;
        if (!id || seenIds.has(String(id))) continue;
        seenIds.add(String(id));
        const agency = (a.agency || a.department || '').toUpperCase();
        const sector = SBIR_AGENCY_SECTOR[agency] || null;
        allAwards.push({
          id: `sbir_${id}`,
          source: 'SBIR.gov',
          title: a.title || a.abstract || `SBIR Award ${id}`,
          url: `https://www.sbir.gov/node/${id}`,
          score: 0,
          comments: 0,
          author: a.firm || a.company || null,
          timestamp: a.award_date ? new Date(a.award_date).toISOString() : new Date().toISOString(),
          relevance: 80,
          nevadaMatch: true,
          matchedSectors: sector ? [sector] : [],
          companyMatches: a.firm ? [a.firm] : [],
          tag: 'NEVADA DIRECT',
        });
      }
    } catch (err) {
      logger.warn('[news:sbir] Fetch failed', { error: err.message });
    }
  }

  logger.info(`[news:sbir] Fetched ${allAwards.length} NV SBIR awards`);
  return allAwards;
}

// ---------- Sam.gov Contract Awards ----------
export async function fetchSamGovNews() {
  const stories = [];
  const apiKey = cfg.SAM_GOV_API_KEY || 'DEMO_KEY';

  try {
    const url = `https://api.sam.gov/opportunities/v2/search?keywords=Nevada&limit=20&api_key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!res.ok) {
      logger.warn(`[news:sam] HTTP ${res.status} — API may be restricted`);
      return stories;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      logger.warn('[news:sam] Non-JSON response (possible HTML error page), skipping');
      return stories;
    }

    const data = await res.json();
    const opps = data.opportunitiesData || data.opportunities || data.results || [];

    for (const opp of opps) {
      const id = opp.noticeId || opp.id || opp.solicitationNumber;
      if (!id) continue;

      // Filter for NV relevance
      const perfState = opp.placeOfPerformance?.state?.code || opp.placeOfPerformance?.state || '';
      const desc = (opp.description || opp.title || '').toLowerCase();
      const isNV = perfState === 'NV' || perfState === 'Nevada' ||
        desc.includes('nevada') || desc.includes('las vegas') || desc.includes('reno');

      if (!isNV) continue;

      stories.push({
        id: `sam_${id}`,
        source: 'Sam.gov',
        title: opp.title || `Contract Opportunity ${id}`,
        url: `https://sam.gov/opp/${id}/view`,
        score: 0,
        comments: 0,
        author: opp.department || opp.agency || null,
        timestamp: opp.postedDate ? new Date(opp.postedDate).toISOString() : new Date().toISOString(),
        relevance: 70,
        nevadaMatch: true,
        matchedSectors: opp.department?.toLowerCase().includes('defense') ? ['Defense'] : [],
        companyMatches: [],
        tag: 'NEVADA DIRECT',
      });
    }
  } catch (err) {
    logger.warn('[news:sam] Fetch failed', { error: err.message });
  }

  logger.info(`[news:sam] Fetched ${stories.length} NV Sam.gov opportunities`);
  return stories;
}

// ---------- SEC EDGAR Full-Text Search ----------
export async function fetchSECEdgarNews() {
  const stories = [];

  try {
    const startYear = new Date().getFullYear();
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22Las+Vegas%22+OR+%22Reno%22+OR+%22Nevada%22&forms=8-K&dateRange=custom&startdt=${startYear}-01-01`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'BattleBornIntel/1.0 support@battlebornintel.com' },
    });

    if (!res.ok) {
      logger.warn(`[news:sec] HTTP ${res.status}`);
      return stories;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      logger.warn('[news:sec] Non-JSON response, skipping');
      return stories;
    }

    const data = await res.json();
    const filings = data.hits?.hits || data.filings || data.results || [];

    for (const entry of filings) {
      const filing = entry._source || entry;
      const id = filing.file_num || filing.id || filing.accession_no;
      if (!id) continue;

      const entityName = filing.entity_name || filing.display_names?.[0] || 'Unknown Entity';
      const formType = filing.form_type || filing.file_type || '8-K';
      const fileUrl = filing.file_url || (filing.accession_no
        ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&accession=${filing.accession_no}`
        : `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(entityName)}&CIK=&type=${formType}&owner=include&count=10&action=getcompany`);

      stories.push({
        id: `sec_${String(id).replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        source: 'SEC EDGAR',
        title: `${entityName} — ${formType}`,
        url: fileUrl,
        score: 0,
        comments: 0,
        author: entityName,
        timestamp: filing.file_date ? new Date(filing.file_date).toISOString() : new Date().toISOString(),
        relevance: 75,
        nevadaMatch: true,
        matchedSectors: [],
        companyMatches: [entityName],
        tag: 'NEVADA DIRECT',
      });
    }
  } catch (err) {
    logger.warn('[news:sec] Fetch failed', { error: err.message });
  }

  logger.info(`[news:sec] Fetched ${stories.length} NV SEC filings`);
  return stories;
}

// ---------- GOED Newsroom (RSS / page scrape) ----------
export async function fetchGOEDNews() {
  const stories = [];
  const rssUrls = ['https://goed.nv.gov/feed/', 'https://goed.nv.gov/feed/rss/'];

  for (const rssUrl of rssUrls) {
    try {
      const res = await fetch(rssUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;

      const text = await res.text();
      // Simple XML parsing for RSS <item> elements
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      let idx = 0;
      while ((match = itemRegex.exec(text)) !== null && idx < 30) {
        const itemXml = match[1];
        const getTag = (tag) => {
          const m = itemXml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, 'is'));
          return m ? m[1].trim() : null;
        };

        const title = getTag('title');
        const link = getTag('link');
        const pubDate = getTag('pubDate');
        if (!title) continue;

        stories.push({
          id: `goed_${idx++}`,
          source: 'GOED',
          title,
          url: link || 'https://goed.nv.gov/newsroom/',
          score: 0,
          comments: 0,
          author: 'Governor\'s Office of Economic Development',
          timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          relevance: 90,
          nevadaMatch: true,
          matchedSectors: [],
          companyMatches: [],
          tag: 'NEVADA DIRECT',
        });
      }

      if (stories.length > 0) {
        logger.info(`[news:goed] Fetched ${stories.length} GOED stories from RSS`);
        return stories;
      }
    } catch (err) {
      logger.warn(`[news:goed] RSS fetch failed (${rssUrl})`, { error: err.message });
    }
  }

  // Fallback: try scraping the newsroom page for article links
  try {
    const res = await fetch('https://goed.nv.gov/newsroom/', { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const html = await res.text();
      // Extract article links: <a href="...">title</a> patterns within article/post elements
      const linkRegex = /<a[^>]+href="(https:\/\/goed\.nv\.gov\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let linkMatch;
      let idx = 0;
      const seenUrls = new Set();
      while ((linkMatch = linkRegex.exec(html)) !== null && idx < 20) {
        const [, href, text] = linkMatch;
        // Skip nav/footer links, only keep newsroom-style paths
        if (seenUrls.has(href) || href.includes('/wp-') || text.length < 10) continue;
        seenUrls.add(href);
        stories.push({
          id: `goed_${idx++}`,
          source: 'GOED',
          title: text.trim(),
          url: href,
          score: 0,
          comments: 0,
          author: 'Governor\'s Office of Economic Development',
          timestamp: new Date().toISOString(),
          relevance: 90,
          nevadaMatch: true,
          matchedSectors: [],
          companyMatches: [],
          tag: 'NEVADA DIRECT',
        });
      }
    }
  } catch (err) {
    logger.warn('[news:goed] Page scrape failed', { error: err.message });
  }

  // TODO: If both RSS and scrape fail, consider adding a static fallback or monitoring alert
  logger.info(`[news:goed] Fetched ${stories.length} GOED stories`);
  return stories;
}

export function classifyStory(story) {
  const text = `${story.title} ${story.url || ''}`.toLowerCase();

  // Check Nevada direct mention
  const nevadaMatch = NEVADA_KEYWORDS.some(kw => text.includes(kw));

  // Check sector relevance
  const matchedSectors = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      matchedSectors.push(sector);
    }
  }

  // Check tracked company mentions
  const companyMatches = TRACKED_COMPANIES.filter(c =>
    text.includes(c.name.toLowerCase()) || (c.slug && text.includes(c.slug))
  );

  // Compute relevance score
  let relevance = 0;
  if (nevadaMatch) relevance += 50;
  if (companyMatches.length) relevance += 30 * companyMatches.length;
  if (matchedSectors.length) relevance += 10 * matchedSectors.length;
  // HN score boost (popular = more relevant)
  relevance += Math.min(story.score / 10, 20);

  return {
    ...story,
    nevadaMatch,
    matchedSectors,
    companyMatches: companyMatches.map(c => c.name),
    relevance,
    tag: nevadaMatch ? 'NEVADA DIRECT' : matchedSectors.length ? matchedSectors[0] : null,
  };
}

export async function getRelevantNews({ minRelevance = 5, limit = 50 } = {}) {
  // Fetch from all sources in parallel — one failure won't break others
  const results = await Promise.allSettled([
    fetchHackerNewsTop(200),
    fetchSBIRNews(),
    fetchSamGovNews(),
    fetchSECEdgarNews(),
    fetchGOEDNews(),
  ]);

  const allStories = [];
  const sourceNames = ['Hacker News', 'SBIR.gov', 'Sam.gov', 'SEC EDGAR', 'GOED'];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      allStories.push(...results[i].value);
    } else {
      logger.warn(`[news] ${sourceNames[i]} fetcher failed`, { error: results[i].reason?.message });
    }
  }

  // Classify HN stories (others come pre-classified)
  const classified = allStories.map(s =>
    s.source === 'Hacker News' ? classifyStory(s) : s
  );

  // Deduplicate by title similarity (simple lowercase exact-match + prefix check)
  const seen = new Map();
  const deduped = [];
  for (const s of classified) {
    const normTitle = s.title?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (!normTitle) continue;
    if (seen.has(normTitle)) {
      // Keep the one with higher relevance
      const existing = seen.get(normTitle);
      if (s.relevance > existing.relevance) {
        deduped[deduped.indexOf(existing)] = s;
        seen.set(normTitle, s);
      }
      continue;
    }
    seen.set(normTitle, s);
    deduped.push(s);
  }

  return deduped
    .filter(s => s.relevance >= minRelevance)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// Refresh cache: fetch from HN, classify, batch upsert into DB
export async function refreshNewsCache(pool) {
  const rawStories = await getRelevantNews({ minRelevance: 1, limit: 200 });

  // Deduplicate by ID within the batch — PostgreSQL ON CONFLICT cannot
  // handle the same row appearing twice in one INSERT. Keep highest relevance.
  const deduped = new Map();
  for (const s of rawStories) {
    const existing = deduped.get(s.id);
    if (!existing || s.relevance > existing.relevance) {
      deduped.set(s.id, s);
    }
  }
  const stories = [...deduped.values()].slice(0, 150);

  if (stories.length > 0) {
    // Batch upsert: single query instead of N individual inserts
    const COLS = 13;
    const values = [];
    const placeholders = [];
    for (let i = 0; i < stories.length; i++) {
      const s = stories[i];
      const off = i * COLS;
      placeholders.push(
        `($${off+1},$${off+2},$${off+3},$${off+4},$${off+5},$${off+6},$${off+7},$${off+8},$${off+9},$${off+10},$${off+11},$${off+12},$${off+13},NOW())`
      );
      values.push(
        s.id, s.source, s.title, s.url, s.score, s.comments, s.author,
        s.timestamp, s.relevance, s.nevadaMatch,
        s.matchedSectors, s.companyMatches, s.tag,
      );
    }

    await pool.query(
      `INSERT INTO frontier_news_cache (id, source, title, url, score, comments, author, published_at, relevance, nevada_match, matched_sectors, company_matches, tag, fetched_at)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (id) DO UPDATE SET
         score = EXCLUDED.score,
         comments = EXCLUDED.comments,
         relevance = EXCLUDED.relevance,
         nevada_match = EXCLUDED.nevada_match,
         matched_sectors = EXCLUDED.matched_sectors,
         company_matches = EXCLUDED.company_matches,
         tag = EXCLUDED.tag,
         fetched_at = NOW()`,
      values
    ).catch(err => logger.warn('[news] Batch upsert failed', { error: err }));
  }

  // Prune stories older than 7 days
  await pool.query(
    `DELETE FROM frontier_news_cache WHERE fetched_at < NOW() - INTERVAL '7 days'`
  ).catch(() => {});

  logger.info(`[news] Cached ${stories.length} frontier stories`);
  return stories.length;
}

// Load tracked companies from DB on startup
export async function initTrackedCompanies(pool) {
  try {
    const { rows } = await pool.query('SELECT id, name, slug FROM companies');
    TRACKED_COMPANIES.length = 0;
    TRACKED_COMPANIES.push(...rows);
    logger.info(`[news] Loaded ${rows.length} tracked companies for matching`);
  } catch (err) {
    logger.warn('[news] Failed to load tracked companies', { error: err });
  }
}
