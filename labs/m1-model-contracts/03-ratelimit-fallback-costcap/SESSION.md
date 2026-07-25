# Session plan — m1-03 (tutor-facing; learner: don't pre-read)

module: `m1-03-ratelimit-fallback-costcap` · variant: default (60)
competencies: llm-fundamentals (primary), production-platform (reliability),
enablement-org (cost story)

## START/PRIME (8 — includes the scheduled delayed transfer)
**Delayed transfer probe (timed, ~5 min; authored at Stage 2, due ≥3 days
after lab 01; different context by design):** "Here is an MCP-style tool
boundary: `read_service_logs(args)` with a strict schema (service enum,
time_range pattern, bounded limit, no extra fields). Without looking at your
lab-01 code, write down: the two error codes your validator returns, what
`field` should say for `{service:'refund-service', limit:5000, tenant:'*'}`,
and the first TWO checks your validator runs in order." Grade H0/H1;
success + lab-01 success on different days feeds the §8.6 durability
evidence (different context: tool-ARGUMENT vs provider-OUTPUT validation).
Then one quick retrieval from lab 02: "which provider error must never be
retried?"

## MODEL ↔ PROBE (10)
Model: "Reliability and cost are call-site POLICY: the provider tells you
how to behave (retry_after, error codes); the budget tells you when to stop;
the report is how humans stay in control of spend." Cover: backoff contract,
fallback as taxonomy decision, pre-flight budget checks, why the report
exists on failures (the failed run is the one finance asks about) — and how
this exact cap mechanism becomes the learner-approved live-cost cap in
`learning/state.json` (plan §10.3).
Probes:
1. "429 with retry_after_ms 200 vs PROVIDER_UNAVAILABLE — why do these get
   different treatments mechanically?"
2. "Where must the budget check sit so a cap of $0 provably makes zero
   calls? What breaks if you check after the call?"

## GATE (4)
Learner restates + different-context prediction: "same policy shape for a
paid geocoding API — what changes, what transfers?"

## LAB (33)
`labs/m1-model-contracts/03-ratelimit-fallback-costcap/`. Watch for: real
sleeps instead of the injected one (tests hang), post-hoc budget checks
(AC-4 fails), missing report on failure paths (AC-5), fallback consulted on
RATE_LIMITED (taxonomy confusion). Evidence step before hints.

## DEBRIEF/CLOSE (5)
Retention-3: (1) pre-flight vs post-hoc budget semantics; (2) which errors
route to fallback vs retry; (3) what the report must carry for the M1
live-cost benchmark. Ledger updates + highest hint. Interview bank: "how do
you keep an LLM feature from blowing up the bill?" M1 wrap: the live
benchmark + learner-approved cap (V16/V17) run at Stage 3 with real
consent — schedule it as the next milestone action.
