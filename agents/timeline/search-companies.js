import { queryAll } from "../lib/db.js";
import { searchWeb } from "../lib/search.js";

export async function searchCompanies(db, opts = {}) {
  const fund = opts.fund || "bbv";
  const companies = queryAll(db, "SELECT * FROM companies").map(r => ({
    ...r, eligible: JSON.parse(r.eligible || "[]"),
  }));

  const eligible = companies.filter(c => c.eligible.includes(fund));
  console.log(`Searching ${eligible.length} ${fund.toUpperCase()}-eligible companies...`);

  const results = [];
  for (const company of eligible) {
    try {
      const query = `"${company.name}" Nevada ${new Date().getFullYear()}`;
      const searchResults = await searchWeb(query, { count: 5, freshness: "pm" });
      results.push({ company, searchResults });
      console.log(`  ${company.name}: ${searchResults.length} results`);
      // Rate limit: 1 req/sec for free tier
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.error(`  ${company.name}: search error — ${err.message}`);
      results.push({ company, searchResults: [], error: err.message });
    }
  }

  return results;
}
