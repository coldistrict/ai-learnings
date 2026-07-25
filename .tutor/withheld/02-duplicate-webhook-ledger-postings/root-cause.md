# Ground truth — pack 02 (TUTOR-ONLY; never read before submission review)

**Root cause.** ledger-service schema migration `0142_split_postings_meta`
(applied 2026-07-06 03:12Z, L108) moved `idempotency_key` from the postings
table to the new `posting_meta` table WITHOUT carrying forward the unique
index (`postings_idempotency_key_uidx` existed pre-migration; L109 shows
`posting_meta` has only its primary key). The write path still records the
key, so requests keep succeeding, but nothing enforces uniqueness — exactly
the failure mode called out in `idempotency-standards` ("migrations must
carry idempotency constraints forward; dropping the index silently disables
protection while requests keep succeeding").

Acquirer redeliveries are normal and flat (~2%, metrics; L101–L103 show a
routine connection-reset redelivery). Orchestrator behavior is unchanged
(L104/L105 forward the same key). Post-migration, the second write creates a
SECOND posting with `replayed:false` (L106/L107 → pst_50911/pst_50912), and
`replayed=true` count drops to zero on exactly 2026-07-06 (L114, metrics) —
the standard's own recommended alarm signal. Duplicates begin the same day
(L110, metrics).

**Causal service:** ledger-service (the dropped constraint), NOT the
redelivering acquirer, gateway, or orchestrator.

**Remediation class:** `code-fix` — a follow-up migration restoring the
UNIQUE constraint on the idempotency key (plus the replay-return path
against posting_meta). Acceptable stated follow-ups: `data-backfill`-class
compensation for the 41 duplicates (balanced reversing postings), and a
`process-change` note (migration checklist asserts idempotency constraints).

**Falsifying checks (examples that earn AC-5):** in staging, send the same
capture confirmation twice with one idempotency key and observe two postings
created (protection gone); or diff unique indexes pre/post migration 0142;
or group postings by idempotency_key since 07-06 and show count>1 rows only
after the migration timestamp.
