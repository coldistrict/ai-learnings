# Red-herring inventory — pack 03 (TUTOR-ONLY)

1. **Broker partition rebalance at 08:20 (L212).** Why tempting: 17 minutes
   before the stall; "the queue infrastructure did something." Why wrong:
   the rebalance completed routinely in 2.1s; the stall begins exactly when
   the poison message is ENQUEUED and first processed (08:37, L201/L202),
   and the crash error is an application TypeError, not a broker error.

2. **refund-service deploy 4.8.2 on 2026-06-27 (L210).** Why tempting: most
   recent deploy to the failing service. Why wrong: three clean days ran on
   4.8.2; the deploy touched email copy, not the consumer; and restarts of
   the same version at the same offset reproduce the crash — version isn't
   the variable, the head message is.

3. **postgres-main nightly CPU 88% (L211).** Why tempting: standing habit of
   blaming the database. Why wrong: it's the recurring 02:00 batch window,
   six hours before the stall; a DB load problem would slow processing, not
   produce exactly-zero throughput with a repeating TypeError on one offset.

4. **"Scale the workers out" (ticket 13:18).** Why tempting: backlog ⇒ add
   capacity. Why wrong: the consumer group is deliberately concurrency-1 for
   per-merchant ordering, and the standard states scaling never fixes a
   poison message; more workers would still queue behind offset 884210.
