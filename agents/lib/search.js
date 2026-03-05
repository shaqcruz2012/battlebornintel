const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

export async function searchWeb(query, opts = {}) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error("BRAVE_SEARCH_API_KEY not set");

  const params = new URLSearchParams({
    q: query,
    count: String(opts.count || 5),
    freshness: opts.freshness || "pm",
    text_decorations: "false",
  });

  const res = await fetch(`${BRAVE_ENDPOINT}?${params}`, {
    headers: { "Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave Search error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.web?.results || []).map(r => ({
    title: r.title,
    url: r.url,
    description: r.description,
    publishedDate: r.page_age || null,
    domain: new URL(r.url).hostname,
  }));
}

const TIER1_DOMAINS = new Set([
  "reuters.com","bloomberg.com","wsj.com","techcrunch.com","pitchbook.com",
  "crunchbase.com","sec.gov","nytimes.com","ft.com","theinformation.com",
]);
const TIER2_DOMAINS = new Set([
  "nnbw.com","vegasinc.lasvegassun.com","rgj.com","lasvegassun.com",
  "reviewjournal.com","nevadaappeal.com","businesswire.com","prnewswire.com",
  "venturebeat.com","siliconangle.com","axios.com","wired.com",
]);

export function classifySource(url) {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    if (domain.endsWith(".gov")) return "official";
    if (TIER1_DOMAINS.has(domain)) return "tier1";
    if (TIER2_DOMAINS.has(domain)) return "tier2";
    if (domain.includes("medium.com") || domain.includes("substack.com") ||
        domain.includes("twitter.com") || domain.includes("x.com") ||
        domain.includes("linkedin.com") || domain.includes("reddit.com")) return "tier3";
    return "unknown";
  } catch { return "unknown"; }
}
