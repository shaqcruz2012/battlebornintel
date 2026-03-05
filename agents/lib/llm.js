import Anthropic from "@anthropic-ai/sdk";

let _client = null;

function getClient() {
  if (_client) return _client;
  _client = new Anthropic();
  return _client;
}

export async function extractEvent(companyName, snippet, sourceUrl) {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a financial data extraction agent for Nevada's startup ecosystem intelligence platform.

Extract a structured event from this text about "${companyName}". Only extract if the text describes a REAL, specific event (funding round, partnership, hire, grant, launch, award, patent, or acquisition).

Source URL: ${sourceUrl}

Text:
${snippet}

Respond with ONLY valid JSON (no markdown, no explanation). If no real event is found, respond with: {"event": null}

If an event is found:
{
  "event": {
    "date": "YYYY-MM-DD",
    "type": "funding|grant|partnership|hiring|momentum|launch|award|patent|acquisition",
    "detail": "One sentence summary of the event",
    "amount": null or number in millions (e.g. 4.5 for $4.5M),
    "round_type": null or "pre_seed|seed|series_a|series_b|series_c_plus|growth|debt|sbir_1|sbir_2|doe|state",
    "investors": [] or ["investor name 1", "investor name 2"],
    "icon": "emoji matching event type",
    "date_confidence": "exact|approximate|inferred",
    "amount_confidence": "exact|approximate|inferred"
  }
}

CRITICAL RULES:
- The date MUST appear in the source text or be derivable from publication date. If you cannot determine the date, set date_confidence to "inferred".
- The amount MUST appear as an exact number in the text. Do NOT estimate or infer amounts. If no exact amount, set amount to null.
- Only extract events directly related to "${companyName}" in Nevada.
- Be conservative. When in doubt, return {"event": null}.`
    }],
  });

  try {
    const text = response.content[0].text.trim();
    const parsed = JSON.parse(text);
    return parsed.event;
  } catch {
    return null;
  }
}

export async function verifyEvent(event, searchResults) {
  const client = getClient();

  const snippets = searchResults.map((r, i) => `[${i+1}] ${r.title}\n${r.description}\nURL: ${r.url}`).join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Verify this timeline event about "${event.company}" against these search results.

Event to verify:
- Date: ${event.date}
- Type: ${event.type}
- Detail: ${event.detail}

Search results:
${snippets}

Respond with ONLY valid JSON:
{
  "verified": true or false,
  "corrected_date": "YYYY-MM-DD" or null (if date is wrong),
  "corrected_detail": "..." or null (if detail needs update),
  "best_source_index": 1-based index of best matching result, or null,
  "notes": "brief explanation"
}`
    }],
  });

  try {
    return JSON.parse(response.content[0].text.trim());
  } catch {
    return { verified: false, notes: "LLM parse error" };
  }
}

export async function extractEntityDetails(entityName, entityType, snippets) {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a risk capital intelligence agent for Nevada's innovation ecosystem.

Extract structured details about "${entityName}" (a ${entityType}) from these search results.

Search results:
${snippets}

Respond with ONLY valid JSON (no markdown, no explanation).
If no relevant information found, respond with: {"enrichment": null}

If details found:
{
  "enrichment": {
    "fund_size_millions": null,
    "aum_millions": null,
    "founding_year": null,
    "hq_city": null,
    "hq_state": null,
    "investment_thesis": null,
    "stage_focus": null,
    "sector_focus": null,
    "key_partners": null,
    "enrichment_confidence": "exact|approximate|inferred"
  }
}

CRITICAL RULES:
- Only extract facts explicitly stated in the source text.
- fund_size_millions and aum_millions MUST appear as exact dollar amounts in the text. Do NOT estimate.
- founding_year must be an explicit year from the text.
- investment_thesis should be one sentence max.
- stage_focus is an array like ["seed", "series_a", "series_b", "growth"].
- sector_focus is an array like ["AI", "Cleantech", "Fintech"].
- key_partners is an array of {"name": "...", "title": "..."} objects (max 3).
- Be conservative. When in doubt, set fields to null.`
    }],
  });

  try {
    const parsed = JSON.parse(response.content[0].text.trim());
    return parsed.enrichment;
  } catch {
    return null;
  }
}

export async function extractRelationships(entityName, entityType, knownEdges, existingEntityNames, snippets) {
  const client = getClient();

  const edgeList = knownEdges.map(e => `  - ${e.rel} → ${e.targetName || e.target}`).join("\n") || "  (none known)";
  const entityList = existingEntityNames.slice(0, 200).join(", ");

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a risk capital intelligence agent for Nevada's innovation ecosystem.

Identify relationships between "${entityName}" (a ${entityType}) and other entities from these search results.

Known relationships for ${entityName}:
${edgeList}

Existing entities in the graph (match target names to these):
${entityList}

Search results:
${snippets}

Respond with ONLY valid JSON. If no new relationships found: {"relationships": []}

{
  "relationships": [
    {
      "target_name": "Name of entity from the existing list above",
      "rel_type": "invested_in|loaned_to|manages|founded|partners_with|accelerated_by|grants_to|acquired",
      "note": "Brief description of the relationship",
      "year": null,
      "deal_size_millions": null,
      "relationship_confidence": "exact|approximate|inferred"
    }
  ]
}

CRITICAL RULES:
- target_name MUST match or closely match a name from the existing entities list above.
- Both entities must be named explicitly in the source text.
- deal_size_millions must appear as an exact dollar amount in the text. Do NOT estimate.
- year must be explicit in the text.
- Do NOT include relationships already listed in "Known relationships".
- Only include relationships relevant to risk capital formation in Nevada.
- Be conservative. When in doubt, omit the relationship.`
    }],
  });

  try {
    const parsed = JSON.parse(response.content[0].text.trim());
    return parsed.relationships || [];
  } catch {
    return [];
  }
}

export async function extractNewEntity(candidateName, existingEntityNames, snippets) {
  const client = getClient();

  const entityList = existingEntityNames.slice(0, 200).join(", ");

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a risk capital intelligence agent for Nevada's innovation ecosystem.

Determine if "${candidateName}" is a real risk capital entity (VC firm, PE firm, angel group, accelerator, or corporate VC) with a verified connection to Nevada's ecosystem.

Existing Nevada ecosystem entities:
${entityList}

Search results about "${candidateName}":
${snippets}

Respond with ONLY valid JSON.
If NOT a real entity or no verified Nevada connection: {"new_entity": null}

If real and connected:
{
  "new_entity": {
    "name": "Exact legal/common name",
    "etype": "VC Firm|PE Firm|Angel|Corporation|Accelerator",
    "city": null,
    "region": null,
    "founded": null,
    "note": "One-sentence description",
    "fund_size_millions": null,
    "investment_thesis": null,
    "relationships": [
      {
        "target_name": "Name from existing entities list",
        "rel_type": "invested_in|partners_with|manages|founded|acquired",
        "note": "Brief description",
        "year": null,
        "deal_size_millions": null
      }
    ]
  }
}

CRITICAL RULES:
- The entity MUST have at least one relationship to an existing entity listed above.
- target_name in relationships MUST match a name from the existing entities list.
- Dollar amounts must appear as exact numbers in the text.
- founding year must be explicit in the text.
- Be conservative. When in doubt, return {"new_entity": null}.`
    }],
  });

  try {
    const parsed = JSON.parse(response.content[0].text.trim());
    return parsed.new_entity;
  } catch {
    return null;
  }
}
