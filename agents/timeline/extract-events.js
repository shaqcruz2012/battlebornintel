import { extractEvent } from "../lib/llm.js";
import { classifySource } from "../lib/search.js";
import { computeConfidence, shouldQuarantine, isDuplicate } from "../lib/confidence.js";
import { queryAll, run, now } from "../lib/db.js";

export async function extractAndStoreEvents(db, companySearchResults) {
  const existingEvents = queryAll(db, "SELECT * FROM timeline_events");
  let added = 0, quarantined = 0, skipped = 0;

  for (const { company, searchResults } of companySearchResults) {
    if (!searchResults || searchResults.length === 0) continue;

    const extractedForCompany = [];

    for (const result of searchResults) {
      try {
        const event = await extractEvent(company.name, result.description, result.url);
        if (!event) { skipped++; continue; }

        event.company = company.name;

        if (isDuplicate(event, [...existingEvents, ...extractedForCompany])) {
          skipped++;
          continue;
        }

        const sourceCredibility = classifySource(result.url);

        const corroborating = searchResults.filter(r =>
          r.url !== result.url &&
          r.description.toLowerCase().includes(company.name.toLowerCase())
        ).length;

        const confidence = computeConfidence(event, sourceCredibility, corroborating);

        if (shouldQuarantine(confidence)) {
          run(db, `INSERT INTO pending_review (target_table, proposed_data, confidence, sources, agent_id, created_at, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events",
            JSON.stringify(event),
            confidence,
            JSON.stringify([{ url: result.url, title: result.title, credibility: sourceCredibility }]),
            "timeline_v1",
            now(),
            "pending",
          ]);
          quarantined++;
        } else {
          run(db, `INSERT INTO timeline_events (date, type, company, detail, icon, amount, round_type, investors, source_url, confidence, agent_id, created_at, verified)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            event.date,
            event.type,
            company.name,
            event.detail,
            event.icon || "📰",
            event.amount || null,
            event.round_type || null,
            event.investors ? JSON.stringify(event.investors) : null,
            result.url,
            confidence,
            "timeline_v1",
            now(),
            0,
          ]);

          const lastId = queryAll(db, "SELECT last_insert_rowid() as id")[0].id;
          run(db, `INSERT INTO data_sources (record_type, record_id, url, title, published_date, accessed_at, source_credibility, extraction_method)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events",
            lastId,
            result.url,
            result.title,
            result.publishedDate || null,
            now(),
            sourceCredibility,
            "llm",
          ]);

          extractedForCompany.push(event);
          added++;
        }
      } catch (err) {
        console.error(`  Extract error for ${company.name}: ${err.message}`);
      }
    }
  }

  return { added, quarantined, skipped };
}
