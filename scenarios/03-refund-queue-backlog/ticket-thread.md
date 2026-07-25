# Ticket INC-4051 — Refunds stuck "processing"; execution queue backing up

**Severity:** Sev2 · **Opened:** 2026-06-30 13:05Z

---

**support.leo @ 13:05** — Nine merchant complaints since noon: refunds
accepted this morning still "processing" (normal <2 min). Oldest affected
refund accepted 08:37.

**eng.oncall.mia @ 13:12** — Intake API is 100% healthy and enqueueing fine
(metrics). Execution queue depth ~1,900 and climbing; throughput flat zero
since 08:37. I restarted the workers at 10:15 and again at 11:40 — no
change either time (L208/L209).

**eng.oncall.mia @ 13:18** — Suspects so far: refund-service deployed 4.8.2
on Friday (L210); postgres-main CPU alarm overnight (L211); and the broker
did a partition rebalance at 08:20 (L212), which is suspiciously close to
08:37. Should we scale the workers out to chew through the backlog?

**payments-core.ana @ 13:26** — Before scaling anything: throughput is ZERO,
not slow — a load problem looks like reduced throughput, not none. Check
what the single consumer is actually doing with the head of the queue and
whether the same message keeps reappearing in the crash logs. Also pull the
consumer's retry/DLQ configuration (see queue-operations-and-dlq for the
diagnosis order).

**payments-core.ana @ 13:30** — Assigning for investigation. Please produce
cause, evidence chain, remediation class, and a falsifying check before we
post an incident update (per incident-management-process). Do NOT manually
delete anything from the queue yet.
