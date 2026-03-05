import { SOURCE_CREDIBILITY } from "../../packages/ui-core/src/ontology.js";

export function computeConfidence(extraction, sourceCredibility, corroboratingSourceCount = 0) {
  const baseCred = SOURCE_CREDIBILITY[sourceCredibility]?.baseConfidence || 0.30;

  let extractionScore = 1.0;
  if (extraction.date_confidence === "inferred") extractionScore -= 0.30;
  else if (extraction.date_confidence === "approximate") extractionScore -= 0.10;
  if (extraction.amount_confidence === "inferred") extractionScore -= 0.20;
  else if (extraction.amount_confidence === "approximate") extractionScore -= 0.05;

  let confidence = baseCred * extractionScore;

  if (corroboratingSourceCount >= 2) confidence = Math.min(confidence + 0.15, 0.95);
  else if (corroboratingSourceCount >= 1) confidence = Math.min(confidence + 0.10, 0.90);

  return Math.round(confidence * 100) / 100;
}

export function shouldQuarantine(confidence) {
  return confidence < 0.60;
}

export function isDuplicate(newEvent, existingEvents) {
  return existingEvents.some(ex => {
    if (ex.company !== newEvent.company) return false;
    if (ex.type !== newEvent.type) return false;
    const d1 = new Date(ex.date);
    const d2 = new Date(newEvent.date);
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });
}
