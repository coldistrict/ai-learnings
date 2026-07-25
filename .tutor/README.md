# .tutor — tutor-only area (plan §5.4, §8.5)

This directory is TUTOR-OWNED and withheld from normal teaching context.

## Layout

- `.tutor/withheld/<NN-slug>/` — per-scenario ground truth: `root-cause.md`,
  machine-readable `labels.json`, `red-herrings.md`. Withheld by learning
  protocol (honesty-framed, not security — the repo belongs to the learner).
- `.tutor/withheld/diagnostic/` — M0 diagnostic scoring key and expected
  observations.
- `.tutor/withheld/<NN-slug>/references/` — OPTIONAL micro-probe references
  (≤ one screen / 60 lines, probe- or repair-class only). None exist at
  Stage 0–2.
- `.tutor/pack-timing.json` — pack-cost measurements (ADR-0004).

## Rules (enforced by learn:check + verification V7)

1. Tutor prompts/sessions MUST NOT read anything under `.tutor/withheld/`
   before the learner's submission review for that exercise/pack.
2. Withheld labels can never add requirements beyond a pack's PUBLIC
   acceptance criteria (`labels_reference_public_criteria_only: true`).
3. No learner-facing file (labs/, scenarios/, prompts/, START_HERE.md,
   skills) may reference withheld paths.
4. No persistent solution implementations for capstone/milestone work exist
   anywhere in the repo (plan §8.5 A1); authoring-time solvability QA is
   scratch-only and discarded, with the QA recorded (DECISIONS ADR-0005).
5. The learner is on their honor not to open `.tutor/withheld/` before
   submitting — pre-reading only degrades their own calibration and the
   value of the program.
