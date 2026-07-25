# Ground truth — pack 03 (TUTOR-ONLY; never read before submission review)

**Root cause.** A poison message at offset 884210 — refund `rfnd_7731` from
the partner-api path with `amount_cents: null` and unrecognized
`currency: "XXX"` (L201, payload confirmed by the head-inspect L213) —
crashes the refund execution worker on every attempt (`TypeError:
amount_cents is null`, L202–L205, attempts climbing 1 → 3907 on the SAME
offset). The consumer is single-concurrency for per-merchant ordering
(L206) and its configuration declares NO dead-letter queue and unbounded
retries (L207) — a direct violation of `queue-operations-and-dlq` ("a
consumer WITHOUT a DLQ turns one poison message into head-of-line
blocking"). Result: committed offset pinned at 884209, head never advances,
throughput exactly zero while depth grows with intake (L214, metrics).
Restarts resume at the same committed offset and change nothing
(L208/L209) — the documented signature.

**Causal service:** refund-service (its consumer configuration + the
validation gap that admitted the malformed partner refund). The event-bus,
the 08:20 rebalance, the Friday deploy, and DB CPU are not causal.

**Remediation class:** `config-fix` — declare `max_retries` (default 5) and
a DLQ per the standard, then quarantine offset 884210 to the DLQ and let the
backlog drain. Acceptable stated follow-ups: `code-fix` for the partner-path
validation gap (reject null amount/unknown currency at intake) and a
regression case; `process-change` for consumer-config review. "Scale out
workers" is explicitly wrong (ordering group of 1; scaling never fixes a
poison message — the standard says so).

**Falsifying checks (examples that earn AC-5):** confirm the SAME offset/
message id repeats across crash logs and restarts (if offsets advanced, it's
not a poison head); or in a staging replica, move offset 884210 aside and
watch throughput resume immediately.
