# Lab m1-03 — Rate limits, provider fallback, and the cost cap

## Scenario

The classifier is about to run on every incoming NimbusPay ticket. Real
providers rate-limit you mid-burst, go down for minutes at a time, and bill
by the token — so the call site needs a policy: back off when told, fail
over when the primary is dead, account for every token, and stop cold when
the budget is spent. You are building
`runWithPolicy(providers, request, options)` in `workspace/policy.js`. This
is also where the program's live-cost consent story (plan §10.3) gets its
mechanical teeth: the same cap semantics later guard real API spend.

## Constraints

- Implement ONLY in `workspace/`. Do not edit tests, fixtures, or the fake
  provider. No network, no new top-level dependencies.
- Signature: `runWithPolicy(providers, request, options)` with
  `providers = { primary, fallback }` (each has `complete(request)` →
  `{ text, usage: { input_tokens, output_tokens } }` or throws an error
  carrying `code` and, for rate limits, `retry_after_ms`), and `options =
  { maxAttempts = 3, maxCostUsd, pricing, sleep }`.
  - `pricing` = `{ input_per_1k_usd, output_per_1k_usd }`
    (fixture: `fixtures/pricing.json` — synthetic numbers).
  - `sleep(ms)` is INJECTED; use it for every backoff wait (tests supply a
    recording fake so nothing actually sleeps).
- Policy contract:
  - `RATE_LIMITED` → wait ≥ `retry_after_ms` via `sleep`, then retry the
    SAME provider (counts as a new attempt, bounded by `maxAttempts`).
  - `PROVIDER_UNAVAILABLE` on the primary → try the fallback provider.
  - Cost accounting: after every completed call, accumulate
    `est_cost_usd = input_tokens/1000 * input_per_1k_usd +
    output_tokens/1000 * output_per_1k_usd`. `maxCostUsd` is the REMAINING
    budget granted to this run (the session cap minus what earlier runs
    spent — the caller passes it in). BEFORE each provider call (including
    retries), if accumulated cost has reached or exceeded `maxCostUsd`, do
    not call — fail the RUN with `BUDGET_EXCEEDED`. A cap of 0 means no
    call is permitted at all.
- Return shape (verbatim; never throw for covered behaviors):
  - `{ ok: true, text, provider_used: 'primary'|'fallback', report }`
  - `{ ok: false, error: { code, message }, provider_used?, report }`
  - `report` = `{ calls, tokens_in, tokens_out, est_cost_usd }` and is
    present on EVERY outcome, success or failure.

Run the visible tests:

```bash
node --test "labs/m1-model-contracts/03-ratelimit-fallback-costcap/tests/*.test.js"
```

## Acceptance criteria

- AC-1: Rate-limited-then-ok on the primary → `ok: true` after backing off:
  the injected `sleep` was called with ≥ the fixture's `retry_after_ms`
  before the retry.
- AC-2: Primary `PROVIDER_UNAVAILABLE` → completes on the fallback with
  `provider_used: "fallback"`.
- AC-3: The report's token and cost totals equal the sum over all completed
  calls, computed from the fixture pricing (exact arithmetic).
- AC-4: With remaining budget already spent (`maxCostUsd: 0`), NO provider
  call is made: `ok: false`, `code: BUDGET_EXCEEDED`, and the provider call
  count is 0 (pre-flight enforcement, not post-hoc accounting).
- AC-5: The `report` object is present and complete on failure outcomes too
  (including AC-4's), not just on success.

These criteria are the complete grading surface.
