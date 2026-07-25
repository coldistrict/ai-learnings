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
