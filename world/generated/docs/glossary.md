# Glossary

doc-id: glossary

- **Entity**: any persisted domain object (merchant, payment, refund, posting).
- **Posting**: one ledger line; postings come in balanced pairs (double entry).
- **Settlement**: daily batch paying a merchant its captured funds.
- **Reconciliation scan**: paginated comparison of ledger balances vs
  settlement state; marks merchants settled or stale.
- **Stale entity**: an entity whose derived state lags its source of truth
  beyond the freshness SLO.
- **Webhook**: signed HTTP callback to a merchant endpoint, retried on failure.
- **DLQ**: dead-letter queue holding messages that exceeded max_retries.
- **Idempotency key**: caller-supplied unique key making a retried write safe.
