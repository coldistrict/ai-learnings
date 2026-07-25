# Operations standard — queues, retries, and DLQs

doc-id: queue-operations-and-dlq

Applies to all event-bus consumers and worker queues.

## The standard
- Every consumer declares `max_retries` (default 5) and a dead-letter queue
  (DLQ). A message exceeding max_retries moves to the DLQ with the failure
  reason attached; processing continues with the next message.
- A consumer WITHOUT a DLQ turns one poison message into head-of-line
  blocking: the queue depth grows while throughput sits at zero and the same
  message id repeats in the crash logs.
- Ordered (single-concurrency) consumers are the highest-risk shape: order
  guarantees mean one bad message stops everything behind it.

## Diagnosis order
1. Is the SAME message id/offset repeating in consumer logs? → poison message.
2. Is throughput zero while queue depth rises? → blocked head, not load.
3. Only then consider scaling, which never fixes a poison message.

## Remediation
Quarantine the poison message (move to DLQ manually if needed), fix the
validation gap that let it in, add a regression case, then replay the DLQ.
