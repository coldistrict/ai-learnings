# Ticket INC-4127 — Merchant settlement state stuck at "pending reconciliation"

**Severity:** Sev2 · **Opened:** 2026-07-22 09:14Z · **Status:** investigating

---

**support.kira @ 09:14** — Bluewave Retail (`mrc_2041`) reports dashboard has
said "settlement pending reconciliation" since yesterday morning. Finance
checked: ledger shows their captures as final. Second report just came in
from `mrc_2287`, same wording.

**eng.oncall.tomas @ 09:26** — Looking. Nightly recon scan `scan-20260722-01`
finished `status: success` at 02:03Z, so the scan itself isn't failing.

**eng.oncall.tomas @ 09:33** — Noticed notification-service deployed 2.31.0
at 22:41Z last night (L019). Could be dashboards just aren't getting update
notifications? Asking merchant-experience.

**merchant-exp.dana @ 09:47** — Notification deploy only touched email
templating; dashboard reads `settlement_state` straight from
merchant-service, no notifications involved. Reads confirm the STORED state
is `pending_reconciliation` with `state_as_of 2026-07-20` (L015/L016) — the
data is stale, not the display.

**eng.oncall.tomas @ 09:58** — Also seeing postgres-main CPU alarm at 87%
during the batch window (L021) and warehouse-sync consumer lag (L020). Could
recon be timing out under DB load and silently dropping rows?

**payments-core.ana @ 10:15** — CPU peaks like that every night this month
(see metrics), and the scans through 07-20 were exact-count clean. Something
changed on 07-21. Note the scan has reported `delta:-17` two nights running
(L012 + metrics) while still reporting success. Assigning to payments-core
for investigation. Please produce: cause, evidence chain, remediation class,
and a falsifying check before we post an incident update (per
incident-management-process).
