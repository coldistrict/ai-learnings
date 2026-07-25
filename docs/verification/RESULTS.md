# Verification results — Stage 0–2 implementation (2026-07-25)

Plan version: `ai-enabler-mastery-system-v3`. Authoritative checklist:
`verification.md` in the source task folder (see `docs/RELOCATION.md`);
because that file is read-only source material, dated results are recorded
HERE. `$REPO = /Users/coldistric/Documents/ai-learnings` per the authorized
relocation.

Conventions honored: every outcome is PASS / FAIL / BLOCKED(prereq:<name>) /
NOT RUN (not yet due per the stage→gate map). Harness transcripts live in
`docs/verification/evidence/`. Gates exercising the session transaction ran
against scratch copies of the learning root (`LEARN_ROOT`), the same
mechanism verification.md itself prescribes for V5's reference state — the
canonical `learning/` history contains no synthetic test sessions. Exact
flag spellings were finalized at Stage 0 as permitted; observable behaviors,
exit codes, and counts match the checklist verbatim.

Environment (2026-07-25, non-interactive zsh): node v22.22.2, npm 10.9.7
present; **codex CLI, claude CLI, Go, .NET absent from PATH**
(`learning/prereq-report.json`). Nothing was installed (per instruction).

## Stage 0 gates

| Gate | Outcome | Evidence | Notes |
|---|---|---|---|
| V1 prereq inventory [host] | **PASS** (2026-07-25) | `evidence/V1.txt` | `zsh -c 'npm run prereq'` exit 0; exactly 6 entries; PATH recorded; 0 port-selection fields (keys audited); absent CLIs → `learn:check` lists BLOCKED(prereq:codex CLI/claude CLI) gates; 0 blocked gates reported PASS |
| V2 lock exclusivity | **PASS** (2026-07-25) | `evidence/V2.txt` | exit 0 then nonzero; second start names u1 + offers resume/abort; draft count exactly 1 |
| V3 close happy path | **PASS** (2026-07-25) | `evidence/V3.txt` | all file locations/counts as stated; missing-field close refused naming `next_review`, draft retained |
| V4 duplicate close no-op | **PASS** (2026-07-25) | `evidence/V4.txt` | exit 0 + already-closed message; 1 journal file; 3/3 view checksums unchanged |
| V5 crash matrix + abort | **PASS** (2026-07-25) | `evidence/V5.txt` | fixed UUID/clock (`LEARN_FIXED_UUID/TIME`), crash hook `LEARN_CRASH_AFTER` at validate/rename/regen/pointer; 5/5 checksums equal reference after recovery in all 4 phases; journal count 1 in every path; abort changed 0 ledger rows |
| V6 view regen byte-stable | **PASS** (2026-07-25) | `evidence/V6.txt` | 6/6 checksum equalities (twice-in-a-row + delete-and-regen) |
| V7 withheld/solutions isolation | **PASS** (2026-07-25) | `evidence/V7.txt` | 0 learner-facing references to the withheld path; 0 solution/reference files under labs/; 0 oversized micro-probe references (none exist); "withheld" rule present ≥1× in all 3 prompts + both skill files |
| V8 deterministic world | **PASS** (2026-07-25) | `evidence/V8.txt` | identical recursive sha256 across two same-seed runs; 30 docs ∈ [25,40]; 11 services ∈ [8,12]; owner + depends_on present for every service (missing = 0) |
| V9 scenario packs + cost | **PASS** (2026-07-25) | `evidence/V9.txt` | 3 packs; per-pack public (logs+metrics, ticket thread, doc links) and withheld (root cause, parsing labels, ≥1 red herring) complete; labels map only to public AC ids (unmatched = 0); 3 timing records (`.tutor/pack-timing.json`); DECISIONS ADR-0004 states median ≈0.04 h vs 2 h + exactly 1 KEEP decision |
| V10a SOURCE_LEDGER schema/staleness [offline] | **PASS** (2026-07-25) | `evidence/V10A.txt` | 12 rows ≥10, 6/6 columns non-empty, all 6 required topics present; staleness fixture flags exactly the 1 aged row (exit nonzero), restored → exit 0; real repo strict-clean |
| V10b link health [network] | **PASS** (2026-07-25) | `evidence/V10B.txt` | network available; first run found 2 dead links (404) in the seeded ledger — URLs corrected to live official pages, re-run: 12/12 reachable, 404/410 = 0, every redirect listed with target host (`learning/sources-report.json`) |
| V11 prompts + teach skill [host] | **PASS (static)** · **BLOCKED (live host sub-check)** (2026-07-25) | `evidence/V11.txt` | all grep elements present in 3 prompts; PAIRED examiner constraints present; shared skill body 0-diff across hosts. Live "Teach me the next session" run per host: **BLOCKED(prereq:claude CLI)** and **BLOCKED(prereq:codex CLI)** — both absent from PATH — and additionally out of bounds at Stage 2 because running it would start the M0 diagnostic (approved stop boundary). Never recorded as PASS; due at Stage 3 |
| V12 learn:next order | **PASS** (2026-07-25) | `evidence/V12.txt` | 4/4 fixtures, each loaded with all lower-priority triggers, resolve in the required order: resume → remediation → due review → milestone module |
| V18 provenance enforcement [fixture] | **PASS** (2026-07-25) | `evidence/V18.txt` | A and C (unattributed 6-line and 1-line tutor edits) blocked naming the exact file; B and D (consented, with events) close cleanly with exactly 1 matching PROVENANCE.md row each |

## Stage 1 gate

| Gate | Outcome | Notes |
|---|---|---|
| V13 diagnostic gap map [manual+] | **NOT RUN — authoring complete, execution deferred by design** | Both session plans exist with §4 time boxes (60+60), fixtures authored, scoring key withheld, gap-map generator implemented and self-tested on a clearly-labeled SAMPLE fixture into scratch only (no `learning/gap-map.*` exists). The diagnostic itself requires the learner and sits exactly at the approved stop boundary. **V13 is NOT claimed passed.** |

## Stage 2 gate

| Gate | Outcome | Evidence | Notes |
|---|---|---|---|
| V19 visible contracts + criteria-mapped tests | **PASS** (2026-07-25, on the three M1 labs) | `evidence/V19.txt` | 3/3 headers per lab; 0 solution blocks; AC-ids present; every test title maps to a README AC id (unmatched = 0; tests are the labs' only executable checks, so unreferenced hidden checks = 0). Re-runs per lab authored later. |

## Not yet due (stage→gate map)

V14, V16, V17 (Stage 3 pilot / M1 exit), V15 (M2), V20 (M3), V21 (M4),
V22–V25 (M5/M6), V26/V34 (M8), V27/V28/V32/V33/V35/V36 (M9 / core build
complete), V29 (program ready), V30 (first drill during Stage 3), V31 (M7).
None attempted; none claimed.

## Standing blockers (honest inventory)

- **claude CLI / codex CLI absent from non-interactive PATH** → V11 live
  sub-check, V20, V30, V31 host halves BLOCKED until installed (documented,
  never auto-installed).
- **Go and .NET both absent** → whichever `selectedPort` the M0 diagnostic
  records, V32 will be BLOCKED(prereq:<toolchain>) until that toolchain is
  deliberately installed (gap-map generator records this automatically).
- **No provider API key exported in this environment** → live halves of
  V16/V17 will need the learner's key + explicit cost consent at Stage 3.

## Solvability QA (plan §8.5 A1)

Recorded in `evidence/stage2-solvability-qa.md` and DECISIONS ADR-0005:
labs 01/02/03 proven solvable (7/7, 6/6, 5/5) via temporary scratch
implementations, then deleted; committed stubs fail 18/18 (intended failing
baseline); 0 solution artifacts persist in the repo.

## Amendment 1 — Codex review remediation (2026-07-25)

Codex's independent review (`docs/verification/reviews/2026-07-25-codex-stage0-2-review.md`,
verdict request-changes) found four defects; all four were accepted and fixed
(dispositions in DECISIONS ADR-0006):

- **B1 (blocking)** — `learn:start` lock acquisition was check-then-write.
  Now atomic: exclusive-create (`wx`) BEFORE draft creation, losers report
  the winning UUID + resume/abort, reservation rolls back if draft creation
  fails, orphan locks are cleared deliberately via `learn:abort` (never
  auto-cleared by a racing start). New V2 concurrency fixture: 5
  simultaneous starts → exactly 1 success, 1 lock, 1 draft, losers name the
  winner (`evidence/V2.txt`).
- **S1** — provenance events now require complete, typed, affirmative
  metadata (agent ∈ {claude, codex}, non-empty files, lines, reason,
  consent containing an affirmative, interview_claim_impact); the
  PROVENANCE.md view gained a lines column. V18 extended with five negative
  fixtures (missing impact, empty reason, false consent, invalid agent,
  missing lines) — 18/18 (`evidence/V18.txt`).
- **S2** — gap-map lesson-skip suggestions now require measured ≥3 on EVERY
  applicable dimension with zero unknowns; explicit `"n/a"` is the only way
  to exclude a dimension. New machinery fixture `GAPMAP-RULES` (6/6,
  `evidence/GAPMAP-RULES.txt`) proves unknowns can never generate a skip
  candidate.
- **S3** — harness protocol is now tri-state (exit 0 PASS / 4 PASS+BLOCKED /
  1 FAIL); `verify:stage0` reports **V11 as PASS+BLOCKED** instead of
  flattening it, and V11 requires a recorded live artifact
  (`evidence/v11-host-<host>.md`) before its host sub-check can ever PASS.

Post-fix re-verification (2026-07-25): `npm run verify:stage0` → **15/15
harnesses green** (V11 = PASS+BLOCKED on `prereq:claude CLI`,
`prereq:codex CLI`); `npm run sources:check` → 12/12 reachable, 0 dead
links; `npm run test:labs` → exactly 0 pass / 18 fail (stub baseline
preserved). No gate result recorded above was invalidated — the fixes
widened test coverage and tightened enforcement.
