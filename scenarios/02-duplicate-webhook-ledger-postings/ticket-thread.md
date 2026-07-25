# Ticket INC-4098 — Duplicate capture postings inflating merchant balances

**Severity:** Sev2 (money-adjacent, no external payout yet) · **Opened:** 2026-07-09 11:20Z

---

**finance.ops.mara @ 11:20** — Kite & Anchor (`mrc_1150`) ledger balance is
+184,400 cents vs the acquirer settlement file. Found paired capture
postings with identical amounts minutes apart (e.g. `pst_50911`/`pst_50912`
for `pay_88213`). Daily audit says duplicates started 2026-07-06 and are
growing (41 so far).

**eng.oncall.priya @ 11:41** — fraud-screening p99 spiked yesterday during a
feature refresh (L111) — could slow scoring be making us process
confirmations twice?

**payments-core.jon @ 11:58** — Capture confirmations don't wait on fraud
scoring; that path is only for authorization. Also duplicates began 07-06;
the fraud spike is 07-08. Separately: gateway rate limit for acquirer
webhooks was raised 07-07 (L113, CHG-2291) — after duplicates began, and a
rate limit can't mint postings.

**integrations.sam @ 12:15** — Acquirer redelivery rate is flat ~2% all
window (metrics); redeliveries are normal at-least-once behavior and orchestrator
forwards the event id as the idempotency key exactly as before (L104/L105).
So the question is why the ledger stopped treating the second write as a
replay: note `replayed:false` on BOTH postings (L106/L107) and
replayed=true count falling to zero on exactly 07-06 (L114, metrics).

**payments-core.jon @ 12:30** — Assigning to payments-core. Please produce
cause, evidence chain, remediation class, and a falsifying check before we
post an incident update (per incident-management-process). Do not run
compensation postings until cause is confirmed.
