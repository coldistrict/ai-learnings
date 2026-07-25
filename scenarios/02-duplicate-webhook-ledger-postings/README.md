# Scenario pack 02 — Duplicate ledger postings after acquirer webhook redeliveries

All data in this pack is synthetic (NimbusPay fictional world).

## Scenario

2026-07-09, 11:20. Finance flags merchant **Kite & Anchor** (`mrc_1150`):
their ledger balance is 184,400 cents HIGHER than the acquirer settlement
file. Audit finds pairs of identical capture postings minutes apart.
Acquirer-side payment confirmations arrive as webhooks (at-least-once
delivery — redeliveries are normal), flow through api-gateway to
payment-orchestrator, which posts to ledger-service with an idempotency key.
Duplicates started appearing 2026-07-06; before that, none all quarter.

Produce an investigation write-up with citations.

## Provided materials (public bundle)

- `logs.ndjson` — api-gateway, payment-orchestrator, ledger-service logs for
  one duplicated payment, plus surrounding events (each line has a `log_id`)
- `metrics.json` — redelivery rate, replayed-write rate, duplicate counts
- `ticket-thread.md` — finance/engineering ticket thread
- `doc-links.md` — pointers into the NimbusPay world docs

## Acceptance criteria (visible, complete — nothing hidden)

- AC-1: Name the single causal service.
- AC-2: State the failure mechanism in one paragraph, specific enough to be
  falsifiable and consistent with the provided logs and metrics.
- AC-3: Cite ≥2 world doc ids (from `doc-links.md` targets) that ground the
  mechanism or the remediation standard it violates.
- AC-4: List ≥3 `log_id`s forming the causal evidence chain.
- AC-5: Classify the remediation as one of {code-fix, config-fix,
  data-backfill, infra-scale, process-change}, state the immediate
  remediation, and name one falsifying check you would run before committing
  to the cause.
- AC-6: Identify ≥1 red herring in the materials and say why it is not
  causal.

Grading uses ONLY these criteria. There is no hidden requirement.
