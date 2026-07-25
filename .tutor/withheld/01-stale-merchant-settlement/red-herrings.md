# Red-herring inventory — pack 01 (TUTOR-ONLY)

1. **notification-service deploy 2.31.0 at 22:41Z (L019, ticket 09:33).**
   Why tempting: deploy the night the symptom appeared; on-call proposes it
   first. Why wrong: dashboards read `settlement_state` directly from
   merchant-service; reads (L015/L016) prove the STORED state is stale — a
   display/notification path cannot explain stale stored data. Also the
   first bad scan (delta −17) predates nothing: it ran 02:00Z on 07-21,
   before this deploy.

2. **postgres-main CPU 87% during the batch window (L021, ticket 09:58).**
   Why tempting: resource pressure "dropping rows" is a familiar story. Why
   wrong: metrics show the same ~85% nightly peak on clean-count days
   (07-19/07-20, delta 0); load did not change when the delta appeared, and
   a load problem would not produce an exactly repeating −17.

3. **warehouse-sync consumer lag 48k on ledger.events (L020).**
   Why tempting: "lag" sounds like staleness. Why wrong: that consumer group
   feeds the analytics warehouse, not merchant settlement state; the recon
   scan reads the ledger directly, and the lag is labeled recurring during
   the nightly window.
