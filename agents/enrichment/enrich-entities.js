import { run } from "../lib/db.js";
import { extractEntityDetails } from "../lib/llm.js";
import { computeConfidence, shouldQuarantine } from "../lib/confidence.js";
import { classifySource } from "../lib/search.js";

/**
 * Enrich entities with details extracted via LLM from search results.
 * Uses COALESCE pattern: only fills NULL columns, never overwrites.
 *
 * @param {object} db - Database instance
 * @param {Array<{entity, searchResults}>} entityResults - From searchEntities()
 * @returns {{ enriched: number, quarantined: number, skipped: number }}
 */
export async function enrichEntities(db, entityResults) {
  let enriched = 0;
  let quarantined = 0;
  let skipped = 0;

  for (const { entity, searchResults } of entityResults) {
    if (searchResults.length === 0) {
      skipped++;
      continue;
    }

    // Format snippets for LLM
    const snippets = searchResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`)
      .join("\n\n");

    console.log(`  Enriching: ${entity.name} (${entity.etype})`);

    try {
      const details = await extractEntityDetails(entity.name, entity.etype, snippets);

      if (!details) {
        console.log(`    → No enrichment data extracted`);
        skipped++;
        continue;
      }

      // Determine best source credibility from search results
      const bestSource = searchResults.reduce((best, r) => {
        const cred = classifySource(r.url);
        const order = { official: 5, tier1: 4, tier2: 3, tier3: 2, unknown: 1 };
        return (order[cred] || 0) > (order[best] || 0) ? cred : best;
      }, "unknown");

      // Map enrichment_confidence to the extraction format computeConfidence expects
      const confMap = {
        exact: { date_confidence: "exact", amount_confidence: "exact" },
        approximate: { date_confidence: "approximate", amount_confidence: "approximate" },
        inferred: { date_confidence: "inferred", amount_confidence: "inferred" },
      };
      const mapped = confMap[details.enrichment_confidence] || confMap.inferred;
      const confidence = computeConfidence(mapped, bestSource, searchResults.length - 1);

      if (shouldQuarantine(confidence)) {
        // Low confidence — quarantine for human review
        const now = new Date().toISOString();
        run(db,
          `INSERT INTO pending_review (target_table, proposed_data, confidence, sources, agent_id, created_at, status)
           VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [
            "entities",
            JSON.stringify({ entity_id: entity.id, ...details }),
            confidence,
            JSON.stringify(searchResults.map(r => r.url)),
            "enrichment_agent",
            now,
          ]
        );
        console.log(`    → Quarantined (confidence: ${confidence})`);
        quarantined++;
      } else {
        // High enough confidence — apply COALESCE enrichment
        applyEnrichment(db, entity, details);
        console.log(`    → Enriched (confidence: ${confidence})`);
        enriched++;
      }

      // Record provenance for best source
      const bestResult = searchResults[0];
      if (bestResult) {
        const now = new Date().toISOString();
        run(db,
          `INSERT INTO data_sources (record_type, record_id, url, title, published_date, accessed_at, source_credibility, extraction_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            "entity_enrichment",
            entity.id,
            bestResult.url,
            bestResult.title,
            bestResult.publishedDate || null,
            now,
            confidence,
            "llm_extraction",
          ]
        );
      }
    } catch (err) {
      console.error(`    ✗ Enrichment failed for ${entity.name}: ${err.message}`);
      skipped++;
    }
  }

  return { enriched, quarantined, skipped };
}

/**
 * Apply enrichment to an existing entity using COALESCE pattern.
 * Only fills NULL columns; never overwrites existing data.
 * For `note`, only replaces if existing note is NULL or < 50 chars.
 */
function applyEnrichment(db, entity, details) {
  // Build the note from LLM details
  const parts = [];
  if (details.investment_thesis) parts.push(details.investment_thesis);
  if (details.stage_focus && details.stage_focus.length > 0) {
    parts.push(`Stage: ${details.stage_focus.join(", ")}`);
  }
  if (details.sector_focus && details.sector_focus.length > 0) {
    parts.push(`Sectors: ${details.sector_focus.join(", ")}`);
  }
  if (details.fund_size_millions) {
    parts.push(`Fund size: $${details.fund_size_millions}M`);
  }
  if (details.aum_millions) {
    parts.push(`AUM: $${details.aum_millions}M`);
  }
  if (details.key_partners && details.key_partners.length > 0) {
    const names = details.key_partners.map(p => p.name).join(", ");
    parts.push(`Key partners: ${names}`);
  }
  const newNote = parts.join(". ");

  // COALESCE update: only fill NULL fields
  // For note: only replace if existing is NULL or short (< 50 chars)
  run(db,
    `UPDATE entities SET
       city = COALESCE(city, ?),
       region = COALESCE(region, ?),
       founded = COALESCE(founded, ?),
       note = CASE WHEN (note IS NULL OR LENGTH(note) < 50) AND ? != '' THEN ? ELSE note END
     WHERE id = ?`,
    [
      details.hq_city || null,
      details.hq_state || null,
      details.founding_year || null,
      newNote,
      newNote,
      entity.id,
    ]
  );
}
