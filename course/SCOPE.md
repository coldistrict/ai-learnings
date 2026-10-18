# Coverage, teaching tiers, and pending work

[ADR-0011](../learning/DECISIONS.md#adr-0011--explicit-scope-and-a-single-teaching-pilot-2026-09-05)
sets the scope before the checker encodes it. The original §3/§6/§7.2 requirements
and V1–V36 verification contract remain available through
[RELOCATION](../docs/RELOCATION.md). Existing public lab ACs and the ten competency
areas/depth targets are preserved. A topic-to-gate link is a teaching destination,
not an additional executable acceptance condition or evidence of mastery.

## Required coverage and optional exploration

The canonical [course map](../learning/course-map.json) classifies every current
competency subskill exactly once. A topic may have several destinations, and
several topics can share one exercise. Original requirements are required at
their original depth; awareness is still required understanding, not a required
large implementation. The map's basis distinguishes:

| Basis | Meaning and scope consequence |
|---|---|
| `original` | Directly required in the original plan/gate, including one SDK comparison and embedding/hybrid comparison; adoption may still be optional |
| `clarification` | Explicit explanation of an existing objective: shape versus truth, refusal/streaming outcomes, citation support, score/sample limits, grader controls, access revocation, or dependencies; no new hidden lab failures |
| `added-required` | Concrete additional public exercises for next-call/shared reservations and uncertain-effect recovery; prospective teaching/assessment and time must be planned |
| `optional` | An experiment or implementation outside the core mastery prerequisites; it cannot block durable mastery |

Required security, authorization, consent, budgets and recovery apply even when
an optional technique is adopted. Parallel-agent implementation, programmatic
tool calling, reranking, contextual retrieval, vendor compaction, long-term memory,
ablations, full OAuth servers and automated deletion services are optional.
Required context selection/task state, dependency reasoning, one SDK comparison,
authorization negatives and stale/revoked-data checks remain required. Recognize
fine-tuning tradeoffs and know when to involve a specialist; a fine-tuning build,
foundation-model training and GPU serving are not core build prerequisites.

The map classifies the current inventory; it does not certify that this inventory
captures every original requirement. The original plan and gate contract still
control cross-cutting artifacts, depth and mastery. V22 explicitly retains at
least eight fixtures at M6 and all twelve at M8. V29 is additional interview
readiness. V18/V19/V27/V30 remain cross-cutting, not optional because they are not
a chapter's primary gate. Live or host blockers never become waived passes.

## Three tiers and staged migration

Tiers are relative to a teaching unit, not permanent difficulty rankings:

- **Understand now:** the small concept set needed for today's explanation,
  prediction and task. Prior correct evidence is acknowledged, not retested in full.
- **Required later:** required coverage postponed to a named milestone and gate;
  later can be another session in the same milestone. Teach it before assessment.
- **Optional exploration:** a bounded experiment after an observed need; never a
  prerequisite for a durable competency or a surprise addition to lab acceptance.

Only the [M1-01 pilot](pilots/m1-01-structured-output-contract.md) has a prepared
unit sequence. All ten full chapter restructuring entries are **pending** in the
map, including the remainder of M1. This is intentional: mapping scope does not
make a chapter beginner-friendly. One guide per milestone and its `study_guide`
remain. Do not wrap all dense chapters in three headings and call migration done.

Run the pilot only on the learner's separate instruction. Use actual responses,
assistance, task evidence, explain-back and clarity/pacing feedback to refine it
before deciding whether to expand the approach. No earlier scored gate baseline
exists, and prior exposure limits comparison. One session may inform a design
choice; it cannot establish general teaching effectiveness.

## Hour implications

The current **108–147 hours** remains the unskipped milestone-sum estimate, not a
validated learner completion time. The following are provisional authoring
judgments about possible pressure on those budgets, not measurements or a new
headline total:

| Destination | Work requiring attention | Potential pressure |
|---|---|---:|
| M1 / V16–V17 | Public reservation/concurrency/unknown-usage bridge, integrated with originally required streaming/provider work | 1–2.5 h |
| M5 / V23–V24 | Persisted uncertain-effect recovery drill and context/state explanations | 0.5–1.5 h |
| M6 / V22–V25 | Explicit negative controls, confidence/sample-limit explanations integrated into original calibration | 0.5–1 h |
| M8 / V26/V34 | Extend recovery/revocation checks into the original rollback/operations drills | 0.5–1.5 h |

Potential pressure sums to **2.5–6.5 h** before accounting for overlap with
existing tasks. Some explanations may replace dense teaching; added exercises
may extend execution. Do not assume either effect cancels the other. Record
actual teaching, task, repair and debrief time during the pilot and later bridge
work, then revisit the estimate or scope in an ADR. Do not cut required controls
to fit a calendar. Optional builds remain outside the core estimate.

## Structural verification

Run `npm run course:check` and `npm run course:test`; the
[checker contract](../tools/course/README.md) documents canonical values, the
maintained link surface, migration states and negative fixtures. Passing means
structural consistency and traceability, not semantic completeness, source
freshness, SDK compatibility, learner mastery, or educational effectiveness.
