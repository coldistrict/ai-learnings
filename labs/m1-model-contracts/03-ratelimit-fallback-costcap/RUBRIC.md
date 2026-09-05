# Review rubric — m1-03 (tutor-facing)

Same workflow as m1-01 (plan §8.4). Score 0–4 per dimension:

| Dimension | 2 (guided partial) | 3 (independent solid) | 4 (transfer) |
|---|---|---|---|
| Policy correctness | backoff or fallback works; the other leaks | all 5 ACs green at H0–H1; clean RATE_LIMITED/UNAVAILABLE split | + articulates jitter, retry storms, circuit breakers as next steps |
| Budget enforcement | accounting right but checked post-hoc | pre-flight check provably blocks at cap 0 | + explains why positive live caps also need next-call reservations |
| Report discipline | report on success only | complete report on every outcome | + explains failure-report value for cost forensics |
| Injected effects | hand-rolled setTimeout somewhere | all waits via injected sleep (deterministic tests) | + explains why injection matters for eval/replay determinism |

Explain-back prompts:
1. "Why does the failed run need a cost report more than the successful one?"
2. "Why is checking spent-so-far before the call necessary but insufficient
   for a hard positive cap?" (Discussion; unchanged lab ACs.)

Transfer probe (same-session, small): "Add a per-day cap on top of the
per-run cap — where does the state live and who owns it?"

Delayed-transfer scoring (from START/PRIME): H0/H1 success on the tool-args
probe + this lab green counts as the second, different-context evidence
point for llm-fundamentals contract discipline (§8.6) — record dates and
contexts in the ledger change.

Caps: tutor-written workspace code caps build evidence at `developing`; H5
reveal caps at developing + different-context repair scheduled.
