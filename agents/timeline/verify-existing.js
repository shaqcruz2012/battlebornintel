import { queryAll, run, now } from "../lib/db.js";
import { searchWeb, classifySource } from "../lib/search.js";
import { verifyEvent } from "../lib/llm.js";

export async function verifyExistingEvents(db, opts = {}) {
  const limit = opts.limit || 10;

  const events = queryAll(db,
    "SELECT * FROM timeline_events WHERE agent_id = 'seed' ORDER BY date DESC LIMIT ?",
    [limit]
  );

  console.log(`Verifying ${events.length} existing events...`);
  let verified = 0, corrected = 0, failed = 0;

  for (const event of events) {
    try {
      const query = `"${event.company}" ${event.type} ${event.date.slice(0, 7)}`;
      const results = await searchWeb(query, { count: 3, freshness: "py" });
      await new Promise(r => setTimeout(r, 1100));

      if (results.length === 0) {
        console.log(`  ${event.company} (${event.date}): no results found`);
        failed++;
        continue;
      }

      const verification = await verifyEvent(event, results);

      if (verification.verified) {
        const bestSource = verification.best_source_index
          ? results[verification.best_source_index - 1]
          : results[0];

        run(db, "UPDATE timeline_events SET verified = 1, source_url = ? WHERE id = ?",
          [bestSource?.url || null, event.id]);

        if (bestSource) {
          run(db, `INSERT INTO data_sources (record_type, record_id, url, title, accessed_at, source_credibility, extraction_method)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events", event.id, bestSource.url, bestSource.title,
            now(), classifySource(bestSource.url), "llm_verify",
          ]);
        }

        verified++;
        console.log(`  ${event.company} (${event.date}): ✅ verified`);
      } else if (verification.corrected_date || verification.corrected_detail) {
        const newDate = verification.corrected_date || event.date;
        const newDetail = verification.corrected_detail || event.detail;
        run(db, "UPDATE timeline_events SET date = ?, detail = ?, verified = 1 WHERE id = ?",
          [newDate, newDetail, event.id]);
        corrected++;
        console.log(`  ${event.company}: 🔧 corrected date ${event.date} → ${newDate}`);
      } else {
        failed++;
        console.log(`  ${event.company} (${event.date}): ❌ could not verify — ${verification.notes}`);
      }
    } catch (err) {
      console.error(`  Verify error for ${event.company}: ${err.message}`);
      failed++;
    }
  }

  return { verified, corrected, failed };
}
