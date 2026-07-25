# Session plan — m1-02 (tutor-facing; learner: don't pre-read)

module: `m1-02-retry-repair-path` · variant: default (60)
competencies: llm-fundamentals (primary), tool-workflow-agent,
evals-observability (trace discipline)

## START/PRIME (5)
Due retrieval from lab 01 (same-context, short): "name the two error codes
your classifier returns and what each tells the caller." One prediction:
"if we re-ask the model after a schema failure, what % of the time do you
expect repair to succeed, and what makes that number dangerous to assume?"

## MODEL ↔ PROBE (12)
Model: "Retries are a budgeted, traced policy over an error taxonomy — not
hope. Every attempt is a span; non-retryable means never retried." Cover:
retryable vs non-retryable classes; repair prompts; deadline vs per-attempt
timeout; why the trace is the debugging surface (M6 reports will consume it).
Probes:
1. "maxAttempts 3, all malformed — how many provider calls, what does the
   caller receive, and what does the bill look like vs attempt 1?"
2. "Provider hangs 5s, timeout 100ms — what must be true at 101ms, and what
   is your process still doing at 5s?" (expect: result resolved; orphaned
   promise awareness)

## GATE (5)
Learner restates the model + one different-context prediction: "same policy
at an HTTP client for a flaky internal API — which parts transfer verbatim?"

## LAB (33)
`labs/m1-model-contracts/02-retry-repair-path/`. Watch for: retrying
INVALID_REQUEST (taxonomy miss), trace built only on success paths, awaiting
the hung call (no race), off-by-one attempts. Evidence step before hints.

## DEBRIEF/CLOSE (5)
Retention-3: (1) the retryable/non-retryable split; (2) what a trace span
must carry to be useful later; (3) deadline semantics. Ledger updates +
highest hint. Interview bank: "walk me through your retry policy — when is
retrying wrong?" Next review: lab 03 (includes the scheduled lab-01
delayed transfer).
