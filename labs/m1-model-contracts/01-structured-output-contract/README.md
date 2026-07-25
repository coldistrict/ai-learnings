# Lab m1-01 — Structured-output contract at the provider boundary

## Scenario

NimbusPay wants incoming incident tickets classified by an LLM into a small
taxonomy so they route to the right team. A model's reply is untrusted text —
your job is the deterministic boundary that turns it into a typed, validated
value or a typed, actionable error. You are building the first piece of
`packages/contracts`-style discipline: the classifier boundary
`classifyIncident(rawText, provider)` in `workspace/classify.js`.

The provider is the deterministic fake (`tools/fake-provider/`): it returns
`{ text, usage }` where `text` is whatever the "model" said — valid JSON,
subtly wrong JSON, or prose. Treat it exactly like a real SDK response.

## Constraints

- Implement ONLY in `workspace/` (learner-owned). Do not edit tests,
  fixtures, or the fake provider.
- No network. No new dependencies outside `workspace/` (hand-rolled
  validation is fine and instructive here; you may add a validation library
  inside `workspace/` if you prefer).
- The function must NEVER throw for any provider behavior covered below —
  every outcome is a returned Result.
- Result shape (verbatim):
  - success: `{ ok: true, value: { category, causal_service, confidence, needs_human } }`
  - failure: `{ ok: false, error: { code, field?, message } }` with `code` ∈
    `SCHEMA_VALIDATION_FAILED` (shape/values wrong) or
    `PROVIDER_OUTPUT_INVALID` (not parseable as a JSON object).
- Contract for `value` (also in `fixtures/contract-schema.json`):
  - `category`: one of `cursor-pagination`, `idempotency`,
    `queue-poisoning`, `other` (exact strings)
  - `causal_service`: one of the 11 NimbusPay service ids, or `null`
  - `confidence`: number in [0, 1] inclusive
  - `needs_human`: boolean
  - no additional fields (strict)
- On `SCHEMA_VALIDATION_FAILED`, `error.field` names the offending field
  (top-level field name; use `$` for whole-payload problems).

Run the visible tests:

```bash
node --test "labs/m1-model-contracts/01-structured-output-contract/tests/*.test.js"
```

## Acceptance criteria

- AC-1: A valid provider payload yields `ok: true` with exactly the four
  contract fields, values passed through unmodified.
- AC-2: A payload missing a required field yields `ok: false`,
  `code: SCHEMA_VALIDATION_FAILED`, and `error.field` naming that field.
- AC-3: A `category` outside the taxonomy is rejected with
  `error.field = "category"`.
- AC-4: An unknown extra field is rejected (strict contract) with
  `error.field` naming the extra field.
- AC-5: Non-JSON provider text yields `ok: false`,
  `code: PROVIDER_OUTPUT_INVALID` — and the function does not throw.
- AC-6: `confidence` outside [0, 1] is rejected with
  `error.field = "confidence"`.
- AC-7: An unknown `causal_service` string is rejected with
  `error.field = "causal_service"`; `null` is accepted.

These criteria are the complete grading surface. Tests assert observable
behavior only; how you implement validation is yours to defend at review.
