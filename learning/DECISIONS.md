# DECISIONS — append-only ADR log (plan §9.1)

Never rewrite or delete entries; supersede with a new entry.

---

## ADR-0001 — Repository relocation (2026-07-25)

**Status:** accepted (explicit user authorization).
**Context:** The approved plan pair (final-plan.md + verification.md, version
`ai-enabler-mastery-system-v3`) names the target repository
`/Users/coldistric/Documents/become-harness-king-ai-enabler-ai-native-etc`.
That path now contains unrelated CV work.
**Decision:** The learning system lives at
`/Users/coldistric/Documents/ai-learnings`. Every reference to the target
repo or `$REPO` in the authoritative documents is read as this path. This is
an operational relocation only; it amends nothing else. See
`docs/RELOCATION.md` for the authoritative source paths.
**Consequences:** Verification results are recorded in
`docs/verification/RESULTS.md` here (the authoritative verification.md is
read-only source material and is not modified).

## ADR-0002 — Stage 0–2 scaffolding provenance (2026-07-25)

**Status:** accepted.
**Context:** Plan §8.5 requires interview-honest provenance separating
learner work from tutor work.
**Decision:** Everything created during Stages 0–2 — the learning OS
(`tools/`, `learning/`), world generators, scenario packs, diagnostics, lab
scaffolds/tests/fixtures, prompts, and skill wrappers — is **tutor-authored
(agent: claude)**. No substantive capstone or milestone solution code was
generated. The learner-owned areas (`packages/`, `apps/`, lab `workspace/`
dirs) contain only stubs and TODO contracts. From the first session onward,
in-session provenance is enforced by `learn:close` manifests.
**Consequences:** The learner may not claim Stage 0–2 infrastructure as
personal build evidence; portfolio claims start at M1 artifacts.

## ADR-0003 — node:test for tutor-owned lab acceptance tests at Stage 0–2 (2026-07-25)

**Status:** accepted.
**Context:** Plan §6 names vitest for the learner's build. Stage 0–2 must be
dependency-light and runnable offline without an npm install.
**Decision:** Tutor-owned lab acceptance tests use the built-in `node --test`
runner. The learner's own packages adopt vitest (or equivalent) when they
build them at M1+; that remains the plan §6 choice. Test *titles* carry
acceptance-criteria ids either way, so V19 auditing is runner-independent.
**Consequences:** Zero runtime dependencies at Stage 0–2; `npm run test:labs`
works offline on a clean checkout.

## ADR-0004 — Scenario-pack cost measurement and pack-count decision (2026-07-25)

**Status:** accepted (V9 keep/reduce decision).
**Context:** Plan §5.4 sets a cost hypothesis of ≤2 tutor-hours per scenario
pack, measured on the first three packs at Stage 0; if the median exceeds 2h,
pack count is reduced before eval depth.
**Measured authoring times (wall-clock, AI tutor authoring), 2026-07-25,
window 17:08:51Z–17:15:45Z total for world generator + all three packs
(≈0.11 h combined; per-pack boundaries from the authoring transcript,
approximate to the minute):**

- `01-stale-merchant-settlement`: ≈0.06 h
- `02-duplicate-webhook-ledger-postings`: ≈0.04 h
- `03-refund-queue-backlog`: ≈0.03 h
- **Median: ≈0.04 h** vs the 2 h hypothesis. Raw records:
  `.tutor/pack-timing.json`.

Caveat recorded honestly: these packs were authored by an AI tutor in one
continuous sitting, which is far faster than the human-tutor hours the
hypothesis was framed around, and human curation/review time is not yet
included. The measurement still bounds the marginal cost of
generator-assisted pack production far under the hypothesis; the number to
re-check at M4–M6 is whether later packs (which must dodge repetition and
match milestone needs) stay under budget.
**Decision (exactly one):** KEEP the core target of 6–8 packs at
`core build complete` (no reduction).

## ADR-0005 — Stage 2 lab solvability QA (plan §8.5 A1) (2026-07-25)

**Status:** accepted; QA executed.
**Context:** The solutions policy requires exercise solvability to be proven
at authoring time with a temporary implementation in a scratch location,
validated against the public criteria, then discarded — with a record that
the QA ran.
**Decision/Record:** Each of the three M1 labs was validated with a temporary
reference implementation created in the session scratchpad (outside this
repository), run against the lab's visible acceptance tests via the
`LAB_WORKSPACE_DIR` override, observed green, and then deleted. Evidence
transcript: `docs/verification/evidence/stage2-solvability-qa.md`. No
solution implementation persists anywhere in this repository.

## ADR-0006 — Codex Stage 0–2 review dispositions (2026-07-25)

**Status:** accepted; all fixes applied and re-verified.
**Context:** Codex's independent implementation review
(`docs/verification/reviews/2026-07-25-codex-stage0-2-review.md`) returned
request-changes with findings B1 (blocking), S1, S2, S3. Per the paired-mode
discipline, each finding gets an explicit disposition.
**Dispositions (4/4 accepted):**

- **B1 accept** — lock acquisition made atomic (exclusive-create before
  draft; rollback on draft failure; conservative orphan handling via
  `learn:abort`); V2 gained a 5-way simultaneous-start fixture.
- **S1 accept** — provenance events validated for complete, typed,
  affirmative metadata incl. `lines` and `interview_claim_impact`; V18
  gained five negative fixtures; prompts/template/skill body updated.
- **S2 accept** — skip suggestions require measured ≥3 on every applicable
  dimension with zero unknowns; explicit `"n/a"` added; GAPMAP-RULES
  fixture added.
- **S3 accept (with one refinement)** — tri-state harness protocol
  (PASS / PASS+BLOCKED / FAIL); V11 host sub-checks can only PASS via a
  recorded live artifact. Refinement: with a host CLI present but no
  sessions yet, the sub-check maps to BLOCKED(pending Stage-3 live run),
  not FAIL, because producing the artifact requires starting the M0
  diagnostic (stop-boundary).

**Re-verification:** 15/15 harnesses green (V11 PASS+BLOCKED);
`test:labs` 0/18 unchanged; `sources:check` 0 dead links. Recorded in
`docs/verification/RESULTS.md` Amendment 1.

## ADR-0007 — Codex re-review hardening dispositions (2026-07-25)

**Status:** accepted; both items applied and re-verified.
**Context:** Codex's re-review (verdict: approve-with-changes) confirmed
B1/S1/S2/S3 resolved and raised two hardening items plus an
inventory-refresh note.
**Dispositions (2/2 accepted):**

- **Stale-lock removal race — accept.** All removals of
  `learning/active-session.json` now go through `removeLockSerialized`
  (exclusive cleanup mutex + UUID re-verify under the mutex; abandoned
  mutex reclaimed after 30s). Sites: start (stale takeover), close (both
  unlock paths), resume (interrupted-close), regen (pointer/lock repair),
  abort (normal + orphan). New V2 stale-lock 5-racer scenario proves exactly
  one takeover with the closed journal preserved.
- **Consent substring trap — accept.** `consent` is a strict enum
  (`yes-explicit` | `yes-mechanical-unblock`), optional `consent_note` for
  free text; template, prompts, and teach-skill body updated; V18 extended
  to 20/20 incl. the literal "not yes" rejection.

**Inventory refresh:** re-run 2026-07-25; codex CLI still absent from this
environment's non-interactive and login shells (Codex's own session sees
0.146.0-alpha.3.1 — per-context PATH). Report honest; unblocking is a user
PATH action (`~/.zshenv` export or symlink), never automated. claude CLI,
Go, .NET remain absent.
**Re-verification:** 15/15 harnesses green (V11 PASS+BLOCKED); labs baseline
0/18 unchanged. Recorded in RESULTS.md Amendment 2.

## ADR-0008 — start-vs-abort acquisition race disposition (2026-07-25)

**Status:** accepted; fixed and re-verified.
**Context:** Codex's second re-check reproduced deterministically: an abort
issued while a start sat between lock reservation and draft creation cleared
the live lock as an "orphan", leaving an orphan draft.
**Decision:** In-flight acquisitions are distinguished from abandoned locks
by lock-file mtime age: `learn:abort` refuses to clear a draftless lock
younger than 30s (ORPHAN_LOCK_MIN_AGE_MS) and only then applies serialized
UUID-verified removal; `learn:check` labels the young state as possibly
mid-acquisition. A test-only `LEARN_HOLD_AFTER_LOCK_MS` hook makes the
window deterministically testable; V2 gained the exact interleaving
regression plus a backdated abandoned-orphan case (V2 29/29).
**Residual risk (documented):** an acquisition stalled >30s could still be
cleared; the real window is milliseconds and recovery is via learn:check.
**Re-verification:** 15/15 harnesses green; labs baseline 0/18 unchanged.
Recorded in RESULTS.md Amendment 3.

## ADR-0009 — Course content refresh (2026-09-05)

**Status:** accepted under the user's explicit request to analyze, update, and
improve the course using Codex's judgment.
**Context:** The v3 design has strong mastery, evaluation, security, and ownership
rules, but local material mainly consists of a milestone map and three M1 labs.
Introductory progress text is obsolete, M1 retry/cost wording overstates the
fake-provider guarantees, and the original M3 model predates the July MCP revision.

**Decision:** Add `course/` as the local teaching reference: ten milestone guides,
worked examples, glossary, and tutor authoring standard. Link it from the
curriculum, START_HERE, and tutor prompts. Preserve just-in-time executable
exercise authoring, the capstone, gate IDs/learning objectives, learner ownership,
cost consent, and delayed mastery. This supersedes the original plan's “no
pre-generated course” restriction only for reusable concept guides and exercise
briefs, not prewritten learner implementations or pre-scored sessions.

Amend the M3 teaching/verification interpretation for the pinned protocol:
2026-07-28 current request/discovery behavior replaces a universal legacy
initialize/session requirement. V20 still requires correct protocol behavior,
negative tests, Inspector evidence, and actual host compatibility; legacy paths
retain revision-specific tests. This supersedes outdated wording in plan §7.1,
§7.2, §10.1 and V20/V34 only where it assumes one historical lifecycle. The
same rule applies to M8 HTTP tests; audience/scope/passthrough negatives remain.

Clarify M1: repair is conditional and measured; schema validity is not factual
correctness; streaming/refusal and cancellation need explicit treatment. Lab 03
keeps its public ACs but is labeled an exhausted-budget/accounting exercise.
Before V16 live enforcement, author public exercises and tests for conservative
next-call bounds, shared atomic reservations, and uncertain usage reconciliation.
This corrects the claim that current fake-provider semantics alone enforce a
hard positive live cap. It does not waive live evidence or authorize spending.

Integrate context selection/compaction/memory, recovery after uncertain effects,
confidence calibration, grader controls, isolated eval splits, citation support,
cache revocation, and honest pilot design into existing milestone time budgets.
Advanced agent/tool/retrieval techniques remain measured optional experiments.
Correct the unskipped milestone-range sum to **108–147 hours**; elapsed duration
depends on practice, remediation, prerequisites, and delayed reviews.

**Consequences:** `learn:next` must identify an unauthored milestone instead of
claiming its empty module list is complete. Freshness means checked claim content,
not just link health. The source ledger records documentation checks separately
from live tests. Existing learner work, journals, open session, progress, and
external approved documents are preserved. These additions are **tutor-authored
(Codex)** and are not learner portfolio/build evidence. Review and verification
are recorded in `docs/course-review-2026-09-05.md`.

## ADR-0010 — Lab 03 assessment amendment (2026-09-05)

**Status:** accepted under the explicit follow-up implementation request.
**Context:** The inherited refresh preserved Lab 03's public executable ACs and
tests, but changed assessment expectations. The level-4 budget rubric changed
from connecting the cap to session consent/V16 unprompted to explaining why
positive live caps need next-call reservations. The explain-back and session
probe also moved from placement of a spent-so-far check toward positive-budget
overspend. Calling this only a wording clarification would conceal that change.

**Decision:** Retain the corrected expectations and label them at the rubric and
session plan. Teach the distinction before assessing it, and apply it only to
new attempts after teaching. Never rescore historical work. Consent remains a
required V16 control; reservations do not replace permission to spend. The
existing five public ACs remain the complete executable grading surface.

**Consequences:** Explanation/transfer assessment has changed; executable lab
acceptance has not. Public reservation bridge work must be authored and tested
before live enforcement. This decision grants no score, mastery, or spending
consent and does not change the 0–4 scale or durable evidence rules.

## ADR-0011 — Explicit scope and a single teaching pilot (2026-09-05)

**Status:** accepted under the explicit follow-up implementation request.
**Context:** Dense technical guides are useful references, not demonstrated
beginner teaching. The original plan's §3, §6, §7.2 and gate contract distinguish
required depth from awareness, impressive scope, and specialist work. The refresh
made subskills explicit without consistently separating those categories.

**Decision:** Keep all ten competency IDs, depth targets, subskill names, learner
records, public ACs, and mastery rules. Classify coverage in
`learning/course-map.json`, explained in `course/SCOPE.md`. Distinguish original
requirements, clarifications, added required exercises, and optional exploration.
Gate mappings describe destinations and supporting teaching; they do not rewrite
gate acceptance. Required-later topics must name their milestone and relevant
gate. V22 remains at least eight fixtures at M6 and all twelve at M8. Security,
authorization, recovery, spending consent and spending controls remain required.
Optional techniques never become prerequisites for durable mastery.

Pilot the three tiers (understand now, required later, optional exploration) in
M1-01 only. Keep one guide and study_guide mapping per milestone; all full chapter
restructuring remains pending. START_HERE and both tutor workflows point to the
pilot through the current guide/session plan. Preparing materials does not start
or resume a session. Actual learner participation, recorded assistance, and
clarity/pacing feedback must precede any broader rewrite. Prior exposure and the
absence of an earlier scored gate baseline preclude causal before/after claims.

**Hour assessment:** Preserve **108–147 hours** as the original milestone-sum
planning estimate, not an execution-validated total. This supersedes ADR-0009's
assumption that additional required work necessarily fits existing budgets.
Next-call/concurrent reservation exercises and uncertain-effect recovery drills
are concrete added work even where motivated by existing safety objectives.
Provisional authoring estimates in `course/SCOPE.md` identify 2.5–6.5 hours of
potential pressure across M1/M5/M6/M8, with overlap unresolved; do not silently
add that number to the headline or claim it is absorbed. Measure pilot teaching
time and later bridge/drill time, then revisit scope/hours through a new ADR.
Optional builds are outside the core estimate. No extra mandatory calibration
dashboard, parallel-agent build, full OAuth server, or deletion service is added.

**Consequences:** The offline checker verifies structure and traceability only.
Scope classification is complete for the current subskill inventory; lesson
sequencing, semantic completeness, and educational effectiveness are not. New
exercise criteria and any assessment additions must be public before teaching
and assessment, never retroactive. One pilot can inform design, not prove general
teaching effectiveness. Phase B and Phase C remain pending.

## ADR-0012 — Unfinished sessions remain local recovery data (2026-09-05)

**Status:** accepted under the explicit follow-up implementation request.
**Decision:** Ignore both `/learning/active-session.json` and
`/learning/journal/.in-progress/` in Git, while keeping the actual local pair
intact. Closed journals remain trackable and immutable. Operational handling is
documented in `docs/SESSION_STATE.md`; START_HERE links it.
**Consequences:** A fresh clone has no open session. Transferring unfinished work
between machines requires separate handling of both files; Git is not its backup.
Ignored drafts remain important recovery data, not disposable scratch files.
`learn:check` diagnoses orphaned state. `learn:next` returns resume only when the
lock and matching draft exist; it does not diagnose every orphan. No session
recovery redesign, state regeneration, or transaction is authorized by this ADR.
