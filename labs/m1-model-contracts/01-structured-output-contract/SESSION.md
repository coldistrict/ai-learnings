# Session plan — m1-01 (tutor-facing; learner: don't pre-read)

module: `m1-01-structured-output-contract` · variant: default (60)
competencies: llm-fundamentals (primary), tool-workflow-agent (secondary)

## START/PRIME (5)
First M1 session — retrieval draws on M0 diagnostic observations: ask the
learner to restate (from memory) the two nondeterminism sources they named
in A2.1 and what constrained decoding does NOT guarantee (A2.2).

## MODEL ↔ PROBE (12)
Model: "A provider call is an unreliable RPC returning a probabilistic
payload; the contract at the boundary — not the prompt — is what makes it
engineering." Cover: untrusted text → typed Result; error taxonomy as API
design; why never-throw matters for callers.
Probes (predict before reveal):
1. "The fake provider returns `{"category":"cursor-pagination", ...}` with
   an extra `severity` field. What SHOULD a strict boundary do, and what
   will most naive implementations do?"
2. "Which malformed outputs can a JSON-schema check catch, and which
   wrong-but-valid outputs can it never catch?" (expect: shape vs truth)

## GATE (5)
Learner states the model in their own words + supports one different-context
prediction: "same discipline at a tool-args boundary — what changes?"
Two misses → LAB becomes guided repair of a provided broken validator
instead of a fresh build.

## LAB (33)
`labs/m1-model-contracts/01-structured-output-contract/` — learner opens
README, runs the failing tests, implements `workspace/classify.js` at H0.
Evidence step required before any hint. Watch for: try/catch around
JSON.parse only (misses value validation); enum case sloppiness; forgetting
strictness (AC-4). Hints follow the H-ladder; log highest hint used.

## DEBRIEF/CLOSE (5)
Retention-3: (1) shape-vs-truth guarantee split; (2) why never-throw;
(3) which AC a real provider would violate most often and why.
Ledger: llm-fundamentals → introduced/developing per performance.
Next review: schedule the delayed transfer probe for session 03 (≥3 days
out) — tool-argument validation context (see 03/SESSION.md).
Interview bank: draft one Q from this lab ("how do you make LLM output safe
to consume?") with the learner's first attempt.
