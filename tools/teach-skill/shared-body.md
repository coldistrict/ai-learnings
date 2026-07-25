## What this skill does

Runs one tutoring session of the AI Enabler Mastery System (plan
`ai-enabler-mastery-system-v3`) when the learner says **"Teach me the next
session."** The plain prompt files in `prompts/` are the canonical fallback;
this skill is their dogfooded wrapper (plan §9.4 D7). It does NOT satisfy the
M7 packaging gate — that gate (V31) requires the capstone `integrations/`
plugins.

## Session protocol

1. **Resolve next.** Run `npm run learn:next`: interrupted session →
   mandatory remediation → due durable check → milestone gate → next module.
2. **Acquire ownership.** `npm run learn:start -- --teacher <claude|codex>
   --mode solo` (use your own product name; `--mode paired` only for a
   declared paired session per `prompts/PAIRED-SESSION-PROMPT.md`). If a live
   lock exists, offer `learn:resume` / `learn:abort` — never bypass it.
3. **Read bounded state only:** `START_HERE.md`,
   `learning/LEARNING_STATE.md`, due rows in
   `learning/COMPETENCY_LEDGER.md`, the last two closed journals, the current
   milestone row in `learning/curriculum.json`, and SOURCE_LEDGER staleness
   (`npm run learn:check -- --strict`). **Never ask the learner to restate
   history** — the files carry continuity across Claude and Codex sessions.
4. **Teach (plan §8.2):** START/PRIME (5, due retrievals) → MODEL↔PROBE
   (10–15, learner predicts before reveals) → GATE (5, learner states the
   model; two misses → guided repair) → LAB (30–35, one substantial task) →
   DEBRIEF/CLOSE (5, retention-3, next review). Never start a >20-minute
   build with <25 minutes left.
5. **Hint ladder H0–H5 (plan §8.3):** free evidence step first; reveal (H5)
   only on explicit request or the stuck policy, then schedule a
   different-context transfer. Record the highest hint per exercise.
6. **Ownership & provenance (plan §8.5):** the learner writes all
   substantive code. Tutor edits to learner-owned files require explicit
   consent (or a named ≤3-line mechanical unblock with a yes) and a COMPLETE
   provenance event in the journal (agent, files/lines, reason, consent
   recorded as yes-explicit | yes-mechanical-unblock, interview-claim impact) — `learn:close` enforces attribution
   against the start-of-session manifest and refuses incomplete events.
7. **Withheld material:** never read withheld tutor fixtures (ground-truth
   labels, red-herring inventories, scoring keys; tutor-only layout is
   documented in `.tutor/README.md`) before the learner's submission review.
8. **Cost consent (plan §10.3):** replay/mock by default; live runs need
   `--allow-live` AND `--max-cost-usd <n>`; the approved cap is
   `live_cost_cap_usd` in `learning/state.json`; record estimated/actual
   spend in the journal.
9. **Close:** fill required frontmatter, run `npm run learn:close`, fix
   anything it names, then **state the next due action** to the learner from
   `npm run learn:next`.
