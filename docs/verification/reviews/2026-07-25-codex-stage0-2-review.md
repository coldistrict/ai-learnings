# Codex independent review — Stages 0–2

Date: 2026-07-25  
Plan: `ai-enabler-mastery-system-v3`  
Reviewer: Codex  
Verdict: **request-changes**

## Verdict

The implementation is substantially faithful: all requested harnesses produced
the recorded outcomes, the real learning state is still pristine, the three
labs contain stubs rather than solutions, the public scenario bundles are
independently solvable, and the recorded blockers/deviations are honest.

One blocking learning-OS defect remains before a real M0 session: session-lock
acquisition is check-then-write rather than atomic, so simultaneous tutors can
both pass the absence check and create competing sessions. This defeats the
exclusive cross-agent ownership that the transaction is meant to provide. The
provenance validator and M0 skip router also need tightening to match the plan.

## Review method and state-safety

I read, in full and in the required order:

- `docs/RELOCATION.md`
- `/Users/coldistric/source/repos/codex-claude-communication/tasks/2026-07-15-ai-enabler-mastery-system/final-plan.md`
- `/Users/coldistric/source/repos/codex-claude-communication/tasks/2026-07-15-ai-enabler-mastery-system/verification.md`
- `docs/verification/RESULTS.md`
- `learning/DECISIONS.md`

I ran the implementation from an isolated copy under
`/tmp/codex-stage0-2-review.zdAKHY/repo`. This was necessary because
`verify:stage0` rewrites dated evidence files and V1 rewrites the prerequisite
report, while `sources:check` rewrites its dated report. The isolated copy
exercised identical code without modifying the real `learning/` state or any
pre-existing repository file.

No learning session was started, closed, resumed, or aborted against the real
repository. The authoritative task folder and the old CV workspace were not
modified or used as command working directories.

## Findings

### Blocking

#### B1 — `learn:start` does not acquire the exclusive lock atomically

Evidence:

- The plan requires an exclusive lock and says a start fails when a live lock
  exists (`final-plan.md:632-647`).
- `tools/learn/start.js:30-49` checks lock existence and handles any existing
  file, but does not reserve the lock.
- It then constructs the session and hashes the learner manifest
  (`tools/learn/start.js:51-75`), writes the draft
  (`tools/learn/start.js:103-104`), and only afterwards writes the lock with a
  normal, overwrite-capable write (`tools/learn/start.js:105`).
- V2 is sequential: the first start completes at
  `tools/verify/v2.js:11-24` before the second starts at
  `tools/verify/v2.js:27-33`. It cannot prove simultaneous exclusivity.

Impact: two tutors starting at nearly the same time can both observe no lock,
create different drafts, and race to overwrite `active-session.json`. One
draft becomes orphaned and cross-agent ownership is ambiguous. A crash after
the draft write but before the lock write similarly leaves an orphan draft.
This violates the critical §9 continuity guarantee even though the sequential
V2 harness is green.

Required change: acquire `active-session.json` with an atomic exclusive-create
operation before creating the draft, make failed acquisition report the
winning UUID, and roll back the reservation if draft creation fails. Add a
concurrent-start fixture that releases simultaneous processes and proves
exactly one success, one live lock, and one draft.

### Should-fix

#### S1 — Provenance metadata required by §8.5 is documented but not enforced

Evidence:

- The plan requires every tutor edit event to record agent, files/lines,
  reason, consent, and interview-claim impact (`final-plan.md:557-568`).
- The local template repeats `interview_claim_impact` as required
  (`learning/templates/session-draft.md:18-20`).
- Close validation checks only that the keys `agent`, `files`, `reason`, and
  `consent` exist (`tools/learn/lib.js:269-274`). It does not require line
  information, `interview_claim_impact`, non-empty values, a valid tutor
  agent, or affirmative consent.
- Attribution then trusts any path listed by such an event
  (`tools/learn/lib.js:376-384`), and the generated provenance view silently
  substitutes `—` for a missing interview impact
  (`tools/learn/lib.js:513-517`).
- V18 uses complete, affirmative fixture events
  (`tools/verify/v18.js:20-30`), so its 8/8 result does not cover these
  omissions.

Impact: a malformed or non-consented event can allow close to succeed while
losing the exact ownership/claim information the plan uses for portfolio
honesty.

Recommended change: validate non-empty/typed metadata, a valid tutor agent,
affirmative consent, interview-claim impact, and file plus line/range (or an
equally precise change reference). Extend V18 with missing-impact,
empty-reason, false-consent, invalid-agent, and missing-line-reference cases.

#### S2 — The M0 router recommends skipping areas with unknown dimensions

Evidence:

- The plan says unknown/untested evidence remains `unseen`, while skip logic
  applies only to subskills scoring at least 3 (`final-plan.md:129-145`).
- The generator removes null dimensions and treats an area as skippable when
  all *remaining* dimensions are at least 3
  (`tools/diagnostic/gapmap.js:92-99`).
- The supplied sample has `interview-communication` scored
  `{ explain: 3, build_debug: null, judgment: null }`
  (`tools/diagnostic/fixtures/sample-scores.json:15-17`).
- Personal command evidence:
  `node tools/diagnostic/gapmap.js --input tools/diagnostic/fixtures/sample-scores.json --out <scratch>`
  exited 0 and recommended `interview-communication` as a lesson-skip
  candidate despite those two unknown dimensions.

Impact: the first real M0 output can recommend skipping unmeasured work,
contradicting the non-punitive `unseen` rule. The note says gates remain, but
the lesson-routing decision is still unsound.

Recommended change: only suggest a whole-area skip when every applicable
dimension/subskill has evidence at least 3. If dimensions are intentionally
non-applicable, encode that explicitly rather than conflating it with
`null`/unknown.

#### S3 — V11 is correctly recorded as blocked, but its harness reports PASS

Evidence:

- V11 requires a host artifact when a host is present or a blocked outcome
  when absent (`verification.md:189-208`).
- The current environment is honestly recorded with both hosts absent, and
  `docs/verification/RESULTS.md:37` correctly says static PASS plus two live
  `BLOCKED` sub-checks.
- `tools/verify/v11.js:49-58` prints the blocked lines, but
  `tools/verify/v11.js:59` unconditionally records the disposition check as
  true.
- `tools/verify/run-all.js:21-26` maps every zero exit to `PASS` and calls the
  aggregate green. Personal command evidence: `npm run verify:stage0` printed
  `PASS V11` and `14/14 gate harnesses green`.
- If a CLI becomes present, `tools/verify/v11.js:55-56` still only prints a
  deferred note; it does not require the live artifact before returning PASS.

Impact: `RESULTS.md` is honest today, but the executable summary overstates the
full V11 gate and cannot detect a missing host artifact after a CLI is
installed.

Recommended change: represent PASS/FAIL/BLOCKED explicitly in the harness
protocol and aggregate; report V11 as static PASS with blocked host sub-checks
now, and require the live artifact whenever a host prerequisite is present.

### Nit

None.

## Harness results personally observed

All commands below ran in the isolated repository copy.

| Command | Exit | Personally observed result | Comparison with `RESULTS.md` |
|---|---:|---|---|
| `npm run verify:stage0` | 0 | 14/14 scripts green: V1 8/8, V2 8/8, V3 10/10, V4 4/4, V5 28/28, V6 3/3, V7 8/8, V8 5/5, V9 25/25, V10a 13/13, V11 static 11/11, V12 5/5, V18 8/8, V19 5/5 | Matches the recorded harness results. V11 has the tri-state presentation caveat in S3. |
| `npm run sources:check` with sandbox network unavailable | 3 | 12/12 probes returned `NETWORK_ERROR`; final outcome was `BLOCKED(prereq:network)`, explicitly not FAIL | Confirms the recorded V10b blocked semantics. |
| `npm run sources:check` with network enabled | 0 | 12 URLs reachable; 0 HTTP 404/410; five redirect chains listed with target hosts | Matches the recorded V10b PASS. |
| `npm run test:labs` | 1 | TAP: 18 tests, 0 pass, 18 fail, 0 skipped/cancelled/todo; each failure came from the three learner TODO stubs | Matches `RESULTS.md:71-76` and is the required non-solution baseline. |
| Sample `gapmap.js` run in scratch | 0 | Exactly one `selectedPort` (`go`); post-choice check recorded `BLOCKED(prereq:Go)` and did not switch to C# | Confirms the selected-port validation flow; it also exposed S2. |

The V5 output specifically confirmed all four deterministic crash hooks
(`validate`, `rename`, `regen`, `pointer`), 5/5 reference checksum equality
after every recovery, one closed journal for the fixed UUID, stale-lock
cleanup, and zero mastery-row changes on abort. V12 confirmed the required
priority order: resume → remediation → due review → current module/gate.

## Manual audit results

### Stage boundary

PASS.

- No `learning/gap-map.md` or `learning/gap-map.json` exists.
- The only file under `learning/journal/.in-progress/` is `.gitkeep`; there
  are no closed or aborted journal records.
- `learning/state.json:4-9` remains at M0 with
  `last_closed_session: null`, `selected_port: null`, and no live cost cap.
- `learning/COMPETENCY_LEDGER.md:9-18` has all ten areas at `unseen`.
- `docs/verification/RESULTS.md:41-45` records V13 as NOT RUN and does not
  claim it passed.

### Solutions policy and lab anti-spoiler quality

PASS, subject to provenance finding S1.

- A repository-wide filename/content review found no persistent direct
  capstone or milestone solution. `packages/` and `apps/` contain only
  ownership placeholders; the three learner workspaces throw explicit TODO
  errors (`classify.js:12-15`, `adapter.js:9-11`, `policy.js:9-12`).
- `docs/verification/evidence/stage2-solvability-qa.md:7-22` records the
  scratch-only 7/7, 6/6, and 5/5 authoring runs and disposal of the temporary
  implementations. The independent `test:labs` result confirmed the delivered
  stubs remain 0/18.
- Each lab README states scenario, constraints, and complete observable
  criteria; every assertion in the visible tests maps directly to those
  criteria. I found no assertion about private helpers, algorithm shape, or
  implementation order. Evidence:
  `01-structured-output-contract/README.md:16-64` vs
  `tests/acceptance.test.js:27-79`;
  `02-retry-repair-path/README.md:13-62` vs
  `tests/acceptance.test.js:29-84`;
  `03-ratelimit-fallback-costcap/README.md:14-66` vs
  `tests/acceptance.test.js:33-97`.
- The node:test departure from the plan's future vitest choice is explicitly
  scoped and justified in `learning/DECISIONS.md:38-48` (ADR-0003).

### Scenario-pack public solvability and §5.4 rules

PASS.

I compared every public bundle and linked public world document with its
withheld root cause, labels, and red-herring inventory:

- Pack 01 is solvable publicly from the single-column cursor/config evidence
  (`logs.ndjson:7,12,14,22-23`), the 17-row count delta
  (`metrics.json:4-9`), and the composite-cursor standard
  (`world/generated/docs/pagination-cursor-design.md:7-26`).
- Pack 02 is solvable publicly from migration 0142, the missing unique index,
  duplicate same-key writes, and the replay-rate collapse
  (`logs.ndjson:6-10,14`), grounded by
  `world/generated/docs/idempotency-standards.md:8-22`.
- Pack 03 is solvable publicly from the repeating poison message, pinned
  offset, single concurrency, unbounded retries/no DLQ, and zero throughput
  (`logs.ndjson:2-7,13-14`), grounded by
  `world/generated/docs/queue-operations-and-dlq.md:7-24`.

For all three, the withheld labels only grade the six visible AC groups and
do not introduce a seventh requirement. Each pack has logs and metrics, a
ticket thread, doc links, root cause, parseable labels, and at least one
red-herring entry. There are exactly three packs. `world/spec.yaml:20-64`
defines 11 services with owners and dependency arrays; the independent V8 run
confirmed 30 deterministic documents and byte-identical same-seed output.

The timing limitation is not hidden:
`learning/DECISIONS.md:50-75` (ADR-0004) states that the approximately
0.04-hour median is AI-tutor wall time, includes no human curation/review
time, and must be rechecked for later, less repetitive packs before retaining
the 6–8 target.

### Plan fidelity beyond the findings

PASS for the remaining inspected Stage 0–2 scope.

- Close ordering is validate → final frontmatter write → atomic rename →
  regenerate views → update pointer → remove lock
  (`tools/learn/close.js:48-87`), and V5 exercised all named crash points.
- `learn:next` implements the required resolution order
  (`tools/learn/lib.js:560-628`), with fixtures that load lower-priority
  triggers to prove precedence (`tools/verify/v12.js:40-80`).
- The Stage-0 inventory is descriptive and has exactly six entries with no
  port-selection field (`learning/prereq-report.json:1-38`).
- The M0 plans collect posting fit and learner background
  (`diagnostics/m0-session-a.md:16-31`); the gap-map generator then requires
  exactly one C#/Go choice with those inputs and an inventory reference before
  invoking the selected toolchain branch
  (`tools/diagnostic/gapmap.js:62-90,116-120`). The scratch sample recorded Go
  absent as BLOCKED and did not waive or switch V32.
- The Stage 0 list is present: prereq inventory, seven `learn:*` commands,
  templates, three prompts, two generated teach wrappers, fixed world and
  generator, three packs, 12-row SOURCE_LEDGER, README, and START_HERE.
- Stage 1 authoring is present without execution: two 60-minute diagnostic
  plans, fixtures, scoring key, and gap-map generator.
- Stage 2 authoring is present: three learner stubs, visible contracts/tests,
  fake provider, three review rubrics/session plans, and the scheduled delayed
  transfer in `labs/m1-model-contracts/PLAN.md:22-27`.

### Blocker and deviation honesty

PASS.

- The independent V1 run observed Node/npm present and codex CLI, claude CLI,
  Go, and .NET absent. `docs/verification/RESULTS.md:60-69` records the
  resulting host/V32 blockers rather than passing or waiving them.
- `README.md:50-56` repeats the no-session state and host/toolchain limits.
- V11's evidence contains explicit
  `BLOCKED(prereq:claude CLI)` and `BLOCKED(prereq:codex CLI)` lines; no live
  host run is claimed.
- ADR-0003 honestly records the Stage 0–2 `node:test` deviation.
- ADR-0004 honestly records the pack-timing measurement caveat.

## Required re-verification after changes

Before starting the real M0 diagnostic:

1. Add and run a simultaneous-start exclusivity fixture.
2. Extend V18 for complete, affirmative provenance metadata.
3. Add an M0 fixture proving unknown dimensions cannot generate skip
   candidates.
4. Make V11/`run-all` preserve PASS/FAIL/BLOCKED rather than flattening a
   blocked live sub-check into PASS.
5. Re-run `npm run verify:stage0`, `npm run sources:check`, and
   `npm run test:labs`; the last must remain exactly 0 pass / 18 fail.
