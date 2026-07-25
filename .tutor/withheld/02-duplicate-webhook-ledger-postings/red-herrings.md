# Red-herring inventory — pack 02 (TUTOR-ONLY)

1. **fraud-screening p99 spike on 2026-07-08 (L111, ticket 11:41).**
   Why tempting: a slow dependency "causing double processing" is a familiar
   narrative and the spike is dramatic (1840ms vs 420ms). Why wrong:
   duplicates began 2026-07-06, two days before the spike; capture
   confirmations don't traverse fraud scoring (authorization-only path); and
   the duplicate mechanism requires a missing uniqueness guarantee, not
   latency.

2. **api-gateway rate-limit raise for acquirer webhooks on 2026-07-07
   (L113, CHG-2291).** Why tempting: a recent config change on the exact
   ingress route. Why wrong: it postdates the first duplicates (07-06), and
   a rate-limit ceiling change cannot create postings — it only admits or
   rejects requests that were already at-least-once.

3. **warehouse-sync consumer lag on ledger.events (L112).** Why tempting:
   "the ledger is behind" sounds related to wrong balances. Why wrong: that
   consumer group feeds analytics; postings are written synchronously by the
   API path, and the audit query counting duplicates reads the postings
   table directly.
