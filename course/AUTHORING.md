# Tutor standard — turn the guide into a session

This is teaching infrastructure, not a scored learner artifact. Read only the
current milestone's guide and the sections needed for today's objective. Continue
to use START_HERE, bounded state, the hint ladder, and transactional journals.
The guide supplies explanations; it does not authorize completing learner code.
Apply [adaptive teaching](ADAPTIVE-TEACHING.md) (ADR-0013) throughout the session:
use evidence to choose support and next practice, and persist the reason in the
current journal. A prepared sequence is adjustable teaching guidance.

Apply [scope and migration status](SCOPE.md) (ADR-0011) before planning assessment.
Only [M1-01](pilots/m1-01-structured-output-contract.md) has a prepared teaching
pilot; all full chapter restructuring is pending learner evidence. Three tiers
must change pacing, examples, and explanations, not merely rename headings.

## 1. Prepare a teachable unit

Choose one concept and one observable behavior from the current milestone.
Check prerequisite evidence; do not assume that reading the previous page proves
understanding. Define unfamiliar terms when first used. Start with a small
analogous example outside the assessed incident pack, then connect it to the
application. Explain both the mechanism and the guarantee it does not provide.

Use the [learner profile](LEARNER-PROFILE.md) to prepare the explanation. Before
showing fields, make the person, screen/action, input source, model contribution,
and destination of the output concrete. Connect the unit to a useful capstone
behavior. Chapter openings supply motivation; they are not extra exercises.
Explain what benefit the model adds over the ordinary non-AI approach, and keep
roles and execution permissions consistent throughout the example.

Use a concrete sequence:

1. Orient the learner: purpose, application context, and relevant prior evidence.
2. Teach unfamiliar ideas with a trace, small table, or worked calculation.
3. Change one condition and invite an independent prediction or application;
   wait for the attempt before feedback, then adjust support to the response.
4. Have the learner build, repair, review, or measure one bounded artifact.
5. Ask for an explanation without notes and schedule different-context retrieval.

Use this sequence flexibly: omit redundant explanation when prior evidence
supports application, and repair a prerequisite when a pattern of difficulty
supports that decision. A single answer does not establish overall ability.

These chapters span multiple sessions. Budget approximately 5 minutes retrieval,
12 explanation/probe, 5 gate, 33 practice, and 5 debrief. If a learner cannot
explain the mechanism after two probes, use guided repair or a changed
representation. Do not add another long lecture or lower the acceptance bar.

## 2. Author missing labs before assigning them

Later milestones have guide pages, not preimplemented runnable labs. Before
assigning a coding task, author its tutor-owned scenario, constraints, visible
acceptance criteria, fixtures, test commands, session plan, and rubric. Record
ordered module IDs in `learning/curriculum.json` only once their materials exist.
Do not list every planned lesson as already runnable.

Follow the base plan's anti-spoiler and solvability policy: acceptance tests
assert observable contracts, never private implementation choices; validate a
new exercise using a temporary scratch implementation and discard it; record
the QA. Never write the learner's substantive solution into their workspace.
Public contracts must precede grading. New guide discussion points cannot become
surprise failures in an older lab's acceptance tests.

Each lab needs an entry prerequisite, a visible failure case, a clearly bounded
artifact, a meaningful evaluator, a transfer probe, and an evidence destination.
Author one appropriate exercise at a time from actual learner performance.

## 3. Required bridges between existing labs and milestones

| Milestone | Session authoring focus | Evidence / gates |
|---|---|---|
| M0 | Score first, explain afterward; verify the chosen language prerequisite | Existing diagnostic artifacts / V13 |
| M1 | Three existing labs, then refusal/incomplete streaming, positive-budget reservation and concurrency, provider comparison, consented live benchmark | Contract tests, refusal/stream trace, cost accounting and reservation evidence / V14, V16, V17 |
| M2 | Fixed workflow, narrow tool registry, idempotency, fake/replay/live distinction, scorer negative controls | Evalkit v1 with real failing-before case; build/buy and workflow ADR / V15 |
| M3 | Pin the protocol/client/SDK; current revision request/discovery tests or explicit legacy compatibility; stdio discipline | Automated negatives and Inspector evidence, actual host matrix / V20 |
| M4 | Lexical failure → embedding/hybrid comparison; authorization, freshness, supporting citations | Separate retrieval/answer/citation metrics and adoption ADR / V21 |
| M5 | Context budget, compaction/memory boundaries, bounded loop, approval and resume after uncertain effect; compare one SDK | Two-pack investigation, effect/approval/recovery traces / V23, V24 |
| M6 | Grader calibration, held-out splits, repeated runs, targeted security regressions, redacted observability | Release report, threat model, at least 8 attacks / V22, V25 |
| M7 | Native packaging, hook trust/failure, install/update/uninstall on both hosts | Delta ADR, workshop and smoke evidence / V31 |
| M8 | Remote token negatives, queue/concurrency control, config, cache revocation, migration, rollback | Operations reports and all 12 attacks / V22, V26, V34 |
| M9 | Counterbalanced/matched pilot, adoption, project defense and timed mocks | V27, V28, V32, V33, V35, V36; additional readiness V29 |

Every milestone also produces an enablement artifact and an interview attempt.
V18 provenance, V19 new-lab audit, V27 durability, and V30 handoff remain
cross-cutting. The immutable original gate document is identified in
`docs/RELOCATION.md`; local content amendments are in `learning/DECISIONS.md`.

Before executing V20 or V34, open the local
[execution amendments](../docs/verification/RESULTS.md#execution-amendments-2026-09-05).
Use the pinned protocol's lifecycle contract and explicitly isolated legacy
compatibility tests; historical results must not be relabeled as later checks.

The M1 bridge is necessary because lab 03 cannot bound the next live call with
its current interface. Before claiming live cap enforcement, publish and test
the reservation design with bounded per-call estimates, applicable fees, shared
concurrency, cancellation, and unknown usage. Its tests are new public work;
the existing ACs remain unchanged. No unapproved spending is implied.

## 4. Refresh facts without chasing announcements

For each relevant `sources:` entry, find its exact claim row in SOURCE_LEDGER.
Recheck at a milestone boundary, after a relevant release, or once older than
30 days. Open the primary page and inspect the relevant claim; a search snippet,
fresh date, redirect, or HTTP 200 alone is not verification. Update truth, URL,
date, and verification status together. Distinguish documentation checked from
tested in the actual SDK/host/account. Never refresh dates on unread claims.

Prefer stable conceptual explanations in the guide. Put current model IDs,
SDK versions, request options, prices, and protocol fields in the implementing
lesson's dated source block. A feature announcement is not evidence that the
learner's host or account supports it. Source disagreement is a reason for a
focused compatibility test or an explicit unresolved note.

Choose additions by measured need: prompt/context failures first; retrieval or
reranking experiments for missing/ranked evidence; more reasoning effort for
tasks that improve; programmatic tool calling for coordination overhead; parallel
agents only for independent work that beats the baseline. Fine-tuning, multimodal
evidence, and advanced infrastructure remain bounded optional comparisons.

## 5. Assess explanations as well as artifacts

Use the existing 0–4 scale and record assistance. For each core concept, require
an explanation, an observed build/debug/review result, and a tradeoff prediction.
Test results alone do not promote an entire competency. H5/tutor solution help
caps the affected evidence as the existing contract specifies. Delayed mastery
needs dates, different contexts, and the required evidence classes.

Record concrete misconceptions such as “timeout cancels the bill” or “a valid
citation proves support,” then schedule a different example that reveals whether
the learner's understanding changed. Keep repaired and still-uncertain skills
distinct in the adaptive handoff. Preserve completed journals; this course refresh is not
retroactive evidence of learner progress. Keep failed/blocked/live-untested
results visible when closing the session.
