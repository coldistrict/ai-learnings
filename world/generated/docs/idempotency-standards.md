# Design standard — idempotency for write APIs

doc-id: idempotency-standards

Every externally-retried write API (webhooks, queue consumers, payment
postings) MUST be idempotent.

## The standard
- Callers send an `Idempotency-Key` header (or event id) per logical write.
- The service persists the key with a UNIQUE constraint in the SAME
  transaction as the write; a duplicate key returns the original result with
  `replayed: true` and performs NO second side effect.
- Application-level "check then insert" without the unique constraint is a
  race, not idempotency.
- Schema migrations must carry idempotency constraints forward; dropping or
  renaming the keyed column/index silently disables protection while requests
  keep succeeding.

## Verification
A duplicate-delivery test (same key, two concurrent requests) belongs in every
consumer's CI. Alert on `replayed=true` rate dropping to zero — it usually
means the constraint stopped being exercised, not that retries stopped.
