# Scenario pack 01 — Stale merchant settlement after nightly reconciliation

All data in this pack is synthetic (NimbusPay fictional world). Pack ids,
timestamps, and merchants are generated fiction.

## Scenario

2026-07-22, 09:14. Merchant **Bluewave Retail** (`mrc_2041`) writes in:
their dashboard has shown *"settlement pending reconciliation"* since
yesterday, but NimbusPay's ledger shows their captured funds as final. The
nightly reconciliation scan reports success. Support escalated to
engineering after a second merchant (`mrc_2287`) reported the same symptom.

Your job: investigate with the provided materials and produce an
investigation write-up with citations. Draft-quality is fine; asserting an
unconfirmed cause is not (see `incident-management-process` in the world
docs).

## Provided materials (public bundle)

- `logs.ndjson` — reconciliation-scanner structured logs for the 2026-07-22
  scan (each line carries a `log_id`)
- `metrics.json` — scan and settlement-lag metrics around the incident
- `ticket-thread.md` — the support/engineering ticket thread
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
