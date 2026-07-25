# Lab m1-02 — Retry/repair path with attempts, trace, and timeout

## Scenario

Lab 01's boundary rejects malformed model output — but production adapters
get a second chance: re-ask the model with the validation failure attached
and it usually repairs its own output. That retry loop is where budgets and
traces earn their keep, because unbounded "just retry" is how token bills
and latencies explode. You are building the JSON-completion adapter
`completeJson(provider, request, options)` in `workspace/adapter.js` — the
retry/repair spine that `packages/runtime-harness` will later grow around.

## Constraints

- Implement ONLY in `workspace/`. Do not edit tests, fixtures, or the fake
  provider. No network, no new top-level dependencies.
- Signature: `completeJson(provider, request, options)` where `request` is
  `{ system, input }` and `options` is
  `{ maxAttempts = 3, timeoutMs = 2000, validate }`.
  `validate(parsedJson)` is caller-supplied and returns
  `{ ok: true, value }` or `{ ok: false, error }` (your lab-01 validator has
  exactly this shape — reuse the discipline, not necessarily the code).
- Return shape (verbatim; never throw for behaviors covered below):
  - `{ ok: true, value, attempts, trace }`
  - `{ ok: false, error: { code, message }, attempts, trace }`
  - `trace` is an array with ONE entry per provider attempt:
    `{ attempt, outcome }` where `outcome` ∈
    `ok | invalid_json | schema_failed | provider_error | timeout`.
- Retry policy (the contract under test):
  - Parse/validation failures are retryable: re-ask up to `maxAttempts`
    total attempts, telling the model what was wrong (repair prompt content
    is your design; that it retries is the contract).
  - `INVALID_REQUEST` provider errors are NOT retryable: exactly one
    attempt, then `code: INVALID_REQUEST`.
  - Exhausted attempts → `code: RETRIES_EXHAUSTED` with
    `attempts === maxAttempts`.
  - A provider call that exceeds `timeoutMs` resolves the whole run as
    `code: TIMEOUT` (do not wait for the hung call to finish).

Run the visible tests:

```bash
node --test "labs/m1-model-contracts/02-retry-repair-path/tests/*.test.js"
```

## Acceptance criteria

- AC-1: Malformed-then-valid script → `ok: true` with `attempts = 2`.
- AC-2: The trace records every attempt with its outcome — for AC-1's run:
  `invalid_json` then `ok` (≥1 retry span observable).
- AC-3: Always-malformed script → `ok: false`,
  `code: RETRIES_EXHAUSTED`, `attempts = maxAttempts`, and the provider was
  called exactly `maxAttempts` times.
- AC-4: A hung provider call → `ok: false`, `code: TIMEOUT`, resolved well
  before the hang duration (budget enforced, not endured).
- AC-5: `INVALID_REQUEST` → `ok: false`, `code: INVALID_REQUEST`,
  `attempts = 1` (non-retryable errors are never retried).
- AC-6: A schema-failing-then-valid script (parseable JSON that fails
  `validate`, then a valid payload) → `ok: true`, `attempts = 2`, trace
  `schema_failed` then `ok`.

These criteria are the complete grading surface.
