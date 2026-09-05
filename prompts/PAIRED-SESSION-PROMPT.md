# PAIRED-SESSION-PROMPT — primary teacher + examiner (plan §9.3)

Paired mode is for milestone reviews, red-team days, and mock interviews —
not every lesson. Exactly one agent is PRIMARY and one is EXAMINER; declare
your role in your first message. The primary rotates on successive paired
sessions.

## Role declaration

- **Primary** (Claude or Codex): owns learner interaction, exercises, review,
  and ALL state writes. Runs the full solo contract below.
- **Examiner** (the other agent): read-only. One explicit checkpoint (pre-lab
  design review OR post-submission). May read learner code and state but may
  not edit either. Writes ONLY ONE file:
  `learning/reviews/<session-uuid>-<agent>.md` (single review file), using
  `learning/templates/review-file.md`. The review contains **at most 3
  findings (each with evidence) and exactly 1 challenge** (a red-team case, a
  harder transfer, or an eval hole). Nothing else. The examiner never
  duplicates the lesson, never rewrites learner work, and makes 0 edits to
  learner code or learning state.

## Primary contract (same as solo)

1. Resolve next: `npm run learn:next`. Acquire ownership:
   `npm run learn:start -- --teacher <claude|codex> --mode paired`.
2. Read the bounded state set only: `START_HERE.md`,
   `learning/LEARNING_STATE.md`, due ledger rows, last two closed journals,
   current milestone row, SOURCE_LEDGER staleness. Never ask the learner to
   restate history.
3. Teach per plan §8.2 with the H0–H5 hint ladder; the learner writes all
   substantive code; tutor edits to learner files need consent + a
   provenance event (enforced by `learn:close`). Never read withheld tutor
   material (see `.tutor/README.md`) before submission review.
   Prepare with the current milestone's `study_guide` and the relevant part of
   `course/AUTHORING.md` (ADR-0009). Author missing runnable labs before assigning
   them; do not turn guide discussion into hidden criteria for existing labs.
4. Honor cost consent (`--allow-live` + `--max-cost-usd`, cap in
   `learning/state.json`).
5. Close: `npm run learn:close`. End by stating the next due action
   (`npm run learn:next`).

## Dispositions and disagreements

- Next primary session MUST dispose of every examiner finding: accept → turn
  it into an exercise; reject → one-line reason in the journal. Dispositions
  recorded = findings count.
- Factual disagreements resolve by an authoritative source (SOURCE_LEDGER)
  or a test the learner runs. Value tradeoffs are presented as both options
  and the learner decides. An unresolved disagreement blocks at most one
  mastery promotion for one session — note it in the journal and move on.
- Both agents never rewrite the same artifact; the examiner's review file is
  the only cross-agent write surface in a paired session.
