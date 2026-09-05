# Course follow-up — 2026-09-05

**Phase A implemented and verified.** Tutor-authored infrastructure and pilot
preparation only. Phase B (learner pilot) and Phase C (remaining chapter redesign)
are pending; no teaching session was started, resumed, closed, aborted or replaced.

## Completed changes and decisions

- Created `codex/course-follow-up-pilot` from the supplied checkout, retaining all
  work. Separated inherited diagnostic/progress evidence from the course refresh.
- Ignored both transient session files together and documented their importance as
  local recovery data in [SESSION_STATE](SESSION_STATE.md). A fresh clone has no
  open session; moving unfinished work between machines needs separate handling.
- Added dated [V20/V34 execution markers](verification/RESULTS.md#execution-amendments-2026-09-05)
  pointing to ADR-0009, with explicitly isolated legacy compatibility behavior.
  Historical result entries and dates remain unchanged.
- Shortened each M1 README's appended limitation section to one linked sentence;
  the guide retains the explanations. Scenarios, constraints, commands and public
  acceptance criteria are byte-identical to the inherited refresh.
- Appended **ADR-0010**: Lab 03's level-4 budget expectation changed from session
  consent to next-call reservations, with probes moving toward positive-budget
  overspend. Assessment changed; executable acceptance did not. Apply the new
  expectation prospectively after teaching, never by retroactive rescoring.
- Appended **ADR-0011**: [scope](../course/SCOPE.md) distinguishes original coverage,
  clarifications, added required bridge/drill work and optional techniques.
  Security, authorization, recovery and spending controls stay required. Optional
  builds do not gate durable mastery. The **108–147-hour** estimate remains
  unvalidated; provisional 2.5–6.5-hour budget pressure is disclosed, with overlap
  unresolved and a future scope/hour decision required after actual observations.
- Appended **ADR-0012** for the ignored recovery pair. `learn:check` diagnoses
  orphaned state; `learn:next` returns resume only with a lock and matching draft
  and does not diagnose every orphan. Session recovery was not redesigned.
- Added [course checker and contract](../tools/course/README.md), canonical scope
  metadata and scratch negative fixtures. All 136 current subskills are classified
  across 41 topics; all ten full chapters remain explicitly pending restructuring.

## Exact pilot entry point

[course/pilots/m1-01-structured-output-contract.md](../course/pilots/m1-01-structured-output-contract.md)

Reachable from the M1 guide, M1-01 session plan, START_HERE, course navigation and
both tutors' normal workflow. The library-hours example develops application
fields, literal illustrative message text, provider request, generated output,
parsing, schema and factual support separately. It provides prediction feedback,
a small review task, an explain-back, gate-mapped required-later topics and
optional exploration. Examples are static offline data; no provider call or
classifier implementation is included. JSON illustrations were parsed in QA.

The pilot acknowledges both orientation requests and the existing H0 repair.
It preserves TypeScript as the learning language and the existing JavaScript
lab interface/toolchain; Go remains the selected portability language. It does
not infer an earlier gate failure or scored baseline. Actual responses, timing,
assistance and clarity/pacing feedback remain to be collected with the learner.

## Checks actually executed

Fresh command output: [check transcripts](verification/evidence/course-follow-up-2026-09-05-checks.txt).

| Command / audit | Result |
|---|---|
| `npm run course:check` | PASS: 41 topics, 136 subskills, valid local sections/source references, hour consistency, ten chapters pending |
| `npm run course:test` | PASS: 36/36; 32 negative fixtures plus valid scratch/date, CLI/read-only, Markdown and pilot-data checks |
| `npm run learn:check` | PASS; original interrupted session recognized, stored prerequisite blockers reported |
| `npm run verify:v10a` | PASS: 13/13; 17 source rows and real strict invariant check |
| `npm run verify:v12` | PASS: 6/6, including scratch priority and unauthored-milestone fixtures |
| `npm run verify:v11` | 10/10 static checks PASS; two live-host subchecks BLOCKED, exit 4 |
| `npm run labs:audit` | PASS: 3 labs, 18 ACs/tests, zero violations or unmatched tests |
| `npm run skills:verify` | PASS; native wrapper shared bodies remain identical/current |
| `npm run learn:next` | Resume UUID `67aae9b3-bd60-485a-809b-ca71930d8a33` |
| `git diff --check` and staged whitespace checks | PASS |
| Preservation and Git boundaries | PASS; details below |

Scripts and imports were inspected first. State-mutating V10a/V12 fixtures use
scratch roots; course fixtures copy teaching metadata/docs only. No broad
regeneration/deletion suite ran against the real open session. The lab audit is
an authoring check, not a claim that the unimplemented learner labs pass.

V11's host blockers come from the dated stored inventory and absent live artifacts,
not a fresh claim that those CLIs are unavailable in every shell. No live-host,
SDK, MCP server, provider benchmark or paid validation was performed. The source
ledger is unchanged: no version-sensitive product claim or source date was
refreshed, and no new official-source recheck is claimed. The new protocol markers
point to the existing amendment, not a newly tested protocol. Structural checks
are not source freshness, semantic completeness or teaching-effectiveness checks.

## Preservation and local history

[SHA-256 evidence](verification/evidence/course-follow-up-2026-09-05-preservation.json)
records identical before/after hashes for **33 protected files**: learner-owned
files, diagnostic/progress artifacts, closed journals, the open pair, lab tests/
fixtures and both external originals. The learner file set is also unchanged.
Existing curriculum rows and the complete competency file are unchanged from the
inherited refresh; old ADR content remains an exact prefix. All three AC sections
also match the original checkout HEAD before the refresh. No scores, mastery,
selected language or null spending consent changed.

Both transient files are ignored and absent from every new commit. Closed journals
remain trackable. Local history uses actual September 5 commit dates; nothing was
backdated, amended, pushed, merged, deployed or published.

| Commit | Scope |
|---|---|
| `22d3c00` | Existing July/August diagnostic journals, August progress/evidence and diagnostic working copy |
| `9ab8390` | Inherited course reference refresh, including shared-file progress/fact updates whose exact earlier snapshots cannot be substantiated |
| `c64080f` | Follow-up decisions, ignored recovery pair, gate markers, shortened notes, scope/checker and prepared pilot |

This report and its fresh evidence are committed separately as **Record course
follow-up verification and pending work**. The inherited refresh commit explains
mixed-date README/START_HERE/SOURCE_LEDGER content; no earlier snapshot was invented.
Inherited V13 wording about 60-minute plans is not measured session duration:
the immutable journals label accelerated variants (34 and 30 recorded phase
minutes). Those historical records were preserved, not rewritten or used as a
pilot timing baseline.

## Pending work

Only on the learner's separate instruction: verify the then-current session,
resume appropriately, run the pilot under the tutoring contract, collect actual
assistance and clarity/pacing feedback, and close only when genuinely complete.
Use that evidence to refine the pilot and decide the remaining chapter approach.
Keep one guide per milestone and required gate-mapped coverage. One pilot can
inform the design; it cannot prove general educational effectiveness.
