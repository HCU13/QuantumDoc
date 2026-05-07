-- Cost-reduction caches on math_solutions.
-- Two new columns:
--   step_explanations JSONB    — per-step "why?" explanations, keyed by step index as string.
--                                Populated on-demand by the explain mode; re-requests hit the
--                                cache instead of a fresh Haiku call.
--   related_questions TEXT[]   — generated similar questions for this solution. Populated once
--                                and reused for subsequent "generate similar" taps.

ALTER TABLE math_solutions
  ADD COLUMN IF NOT EXISTS step_explanations JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS related_questions TEXT[] NOT NULL DEFAULT '{}';

-- No index needed — these are read by primary key (solution id) in the edge function.
-- JSONB default {} is important so reads never see null and we can merge with || operator.

-- Backfill: existing rows already have the defaults above; no UPDATE required.

COMMENT ON COLUMN math_solutions.step_explanations IS
  'Per-step "why?" explanations keyed by step index (string). e.g. {"0": "...", "1": "..."}';
COMMENT ON COLUMN math_solutions.related_questions IS
  'Generated similar questions for this problem, cached across sessions.';
