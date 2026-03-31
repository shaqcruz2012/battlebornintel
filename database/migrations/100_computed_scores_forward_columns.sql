-- Add forward-score columns to computed_scores for blended IRS
ALTER TABLE computed_scores
  ADD COLUMN IF NOT EXISTS forward_score      INTEGER,
  ADD COLUMN IF NOT EXISTS forward_components JSONB,
  ADD COLUMN IF NOT EXISTS score_type         VARCHAR(10) NOT NULL DEFAULT 'heuristic';
