# M1 module — Model contracts + provider boundary (labs 01–03)

Mental model (plan §7.1): **"A provider call is an unreliable RPC returning a
probabilistic payload; contracts + budgets make it engineering."**

Three authored sessions (Stage 2). Each lab: visible README contract
(Scenario / Constraints / Acceptance criteria), learner-owned `workspace/`,
tutor-owned visible tests (`node --test "labs/**/*.test.js"` or per-lab), a
SESSION.md teaching plan, and a RUBRIC.md review guide. Tests assert
observable contracts only — no hidden requirements, no solution code
anywhere. The deterministic fake provider (`tools/fake-provider/`) is the
only provider at this stage; replay and real providers arrive later
(replay at M2 evalkit; real+live cost benchmark closes M1 at Stage 3 under
the V16 consent gates).

| # | Session | Learner builds | Fails like production |
|---|---|---|---|
| 01 | Structured-output contract | schema-validated incident classifier boundary | malformed JSON, wrong enums, extra fields, out-of-range values |
| 02 | Retry/repair path | JSON-completion adapter with attempts, trace, timeout | malformed-then-valid, always-malformed, hangs, non-retryable errors |
| 03 | Rate limit, fallback, cost cap | call policy: backoff, provider fallback, budget enforcement | 429 storms, dead primary, budget blowouts |

**Scheduled delayed transfer (authored now, executed ≥3 days after lab 01):**
session 03's START/PRIME includes a timed transfer probe re-applying the
lab-01 contract discipline to a NEW context (tool-ARGUMENT validation at an
MCP-style boundary instead of provider-OUTPUT validation) — see
`03-ratelimit-fallback-costcap/SESSION.md`. Delayed, different-context
evidence feeds the §8.6 durability rules.

Learner note: don't pre-read SESSION.md files; they contain the probes.
Read each lab's README when the tutor opens the lab.
