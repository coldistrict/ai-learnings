# Review rubric — m1-02 (tutor-facing)

Same workflow as m1-01 (plan §8.4). Score 0–4 per dimension:

| Dimension | 2 (guided partial) | 3 (independent solid) | 4 (transfer) |
|---|---|---|---|
| Retry policy correctness | retries work; taxonomy leaks (retries non-retryables or misses exhaustion) | all 6 ACs green at H0–H1 with clean taxonomy | + articulates backoff/jitter omission and when it matters |
| Trace quality | trace exists but gaps on failures | one span per attempt, all outcomes, on every path | + explains how M6 cost/latency reports derive from spans |
| Timeout handling | waits out the hang or leaks rejections | deadline enforced via race/abort; no unhandled rejections | + names the orphaned-work tradeoff and a mitigation |
| Explain-back | needs prompting | states budgeted-traced-policy model unprompted | + transfers to non-LLM RPC clients unasked |

Explain-back prompts:
1. "Why must INVALID_REQUEST never be retried, mechanically and economically?"
2. "What would you add to the trace before shipping this to production?"

Transfer probe (same-session, small): "A webhook delivery client needs this
policy — which outcome labels change, which survive?"

Caps: tutor-written workspace code caps build evidence at `developing`; H5
reveal caps at developing + different-context repair scheduled.
