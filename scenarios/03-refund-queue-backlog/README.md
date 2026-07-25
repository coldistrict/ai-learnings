# Scenario pack 03 — Refund queue backlog, refunds delayed for hours

All data in this pack is synthetic (NimbusPay fictional world).

## Scenario

2026-06-30, 13:05. Support is getting merchant complaints: refunds accepted
this morning are still "processing" after 4+ hours (normal is under 2
minutes). The refund intake API is healthy and accepting requests; the
refund execution queue depth has been climbing since 08:37 while refund
throughput sits at zero. On-call restarted the refund workers twice; each
time throughput stayed at zero.

Produce an investigation write-up with citations.

## Provided materials (public bundle)

- `logs.ndjson` — refund-service worker logs, event-bus consumer state, and
  surrounding events (each line has a `log_id`)
- `metrics.json` — queue depth, throughput, restart markers
- `ticket-thread.md` — support/engineering ticket thread
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
