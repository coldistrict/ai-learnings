# M6 — Evaluation, observability, and security

Prerequisite: M2 evalkit and the M5 investigation runtime. Outcome: a defensible
release decision with known limitations, calibrated grading, and failure evidence.

## The practical problem

A proposed release produces useful incident drafts on most test cases. One run,
however, uses a record the requester should not see. Would you ship it? This
milestone turns that decision into evidence: what failed, how it happened, which
control should stop it, and what the tests still leave uncertain. You will use
synthetic failure cases to challenge both the assistant and the grader judging it.

## Measure outcomes and diagnose trajectories

An outcome scorer asks whether the final answer or effect was correct. A
trajectory scorer inspects how the system got there: tool arguments, unauthorized
attempts, repeated calls, evidence use, and budgets. A good answer reached through
a leaked document still fails. Conversely, a different valid tool sequence need
not fail merely because it differs from one reference trace.

Use deterministic checks for enforceable contracts. Reserve rubric/model graders
for judgments such as evidence support or clarity that are difficult to encode.
Have humans label a blinded sample before trusting a model grader. Inspect false
passes and false fails by category; a high agreement percentage dominated by easy
cases can hide poor safety judgment. Treat the answer being graded as untrusted
data, including instructions that try to manipulate the grader.

Evaluation design should follow the real task distribution and evolve with
observed failures. Version the task definition, labels, rubric, and grader;
recalibrate after meaningful changes. [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## Worked example: a score is not certainty

A candidate succeeds on 18 of 20 tasks: observed success is 90%. It is misleading
to report “90% reliable” without the sample, task selection, and uncertainty. If
the two failures are unauthorized writes, the candidate fails the safety gate
despite its aggregate score.

Repeat live cases at least three times initially, as the base plan requires.
Report per-case results and variability; three repeats are an initial variance
check, not statistical proof. Compare baseline and candidate on the same cases
and disclose model/configuration changes. For confidence intervals, resample
independent cases (or incident families) rather than pretending repeated runs of
one scenario are many independent tasks.

Use an **ablation** to test a component's contribution: remove reranking or memory
while keeping the cases and other settings fixed, then compare the observed
quality, time, and cost. This is more informative than attributing an improvement
to three simultaneous changes.

Zero observed unsafe events in 20 independent trials does not establish zero
risk. The rough “rule of three” gives an upper 95% rate estimate of 3/20 = 15%
under the binomial assumptions; small, correlated synthetic samples can be even
less informative. Use zero observed violations as a necessary release condition,
with explicit limits on what the test population represents.

## Observability: record enough to explain failures

A **trace** follows one run; **spans** describe its component operations. Record
run/parent IDs, model/prompt/schema/tool/dataset versions, durations, retry reason,
tokens, spending/reservations, tool outcomes, and policy decisions. Distinguish
time to first output, total run latency, and queue wait. Report failed and aborted
runs too. Cost per successful task includes the cost of failed attempts.

Report latency percentiles with the sample size: p50 is the median, and p95
describes the value at or below which approximately 95% of observed durations
fall under the stated calculation method. Averages can hide a slow tail; very
small samples cannot characterize that tail reliably.

Logs should help reconstruct behavior without exposing credentials or unnecessary
content. Store evidence references and safe summaries where raw text is not
needed. Redaction must cover errors, tool arguments/results, traces, and replay
recordings—not just the final response. A generated reasoning narrative is not
an execution trace or a trustworthy account of model internals.

## Security is enforced at action and data boundaries

Threat modeling identifies assets, actors, entry points, trust boundaries, and
abuse paths. **Prompt injection** occurs when attacker-controlled instructions
try to redirect the system, including through retrieved documents or tool output.
**Tool poisoning** uses misleading tool metadata. A **confused deputy** uses a
system's legitimate access to do something the requester was not entitled to do.

Map each threat to a deterministic control where possible: tenant authorization,
narrow tools, outbound network policy, secret isolation, input/output bounds,
operation-scoped approval, sandboxing, and audit. Model guardrails and classifiers
are additional detection layers; they cannot grant permissions or prove safety.
Test the whole path including repair prompts, memory updates, and graders.

Use these course risk classes consistently:

| Class | Operation | Control |
|---|---|---|
| R0 | Public/synthetic read | Input and output limits |
| R1 | Authorized sensitive read | Identity, object access, safe reporting |
| R2 | Local draft | Explicitly local behavior, reviewable artifact |
| R3 | External reversible write | Scoped just-in-time approval and idempotency |
| R4 | Destructive/high-impact effect | Outside core implementation |

## Practice and completion evidence

Publish each red-team case before assessment. Predict the failure, reproduce it
in a synthetic environment, patch the boundary, add a regression, and explain
residual risk. The 12 core categories are direct/indirect injection, tool
poisoning, cross-tenant access, forged/stale approval, duplicate writes, wrong
token audience/passthrough, secret leakage, oversized output, dependency timeout,
fabricated citation, and a supposed draft tool that performs an external effect.
At least 8 land by M6; all 12 by M8. Do not publish withheld scenario solutions.

Deliver V22/V25 evidence, a release scorecard, calibration record, and threat
model. Freeze quality thresholds after the baseline and before candidate
selection; record any deliberate change as a new evaluation version. Rehearse
explaining one failure in terms of its first observable divergence and fix.

sources: OpenAI hosted Evals retirement.
