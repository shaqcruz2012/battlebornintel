import cfg from '../config.js';
import logger from '../logger.js';

// Nevada-relevant keywords for filtering
const NEVADA_KEYWORDS = [
  'nevada', 'las vegas', 'reno', 'henderson',
  'gigafactory', 'tahoe', 'ssbci', 'goed',
];

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
  const stories = await fetchHackerNewsTop(200);
  const classified = stories.map(classifyStory);
  return classified
    .filter(s => s.relevance >= minRelevance)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// Refresh cache: fetch from HN, classify, batch upsert into DB
export async function refreshNewsCache(pool) {
  const stories = await getRelevantNews({ minRelevance: 1, limit: 100 });

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
