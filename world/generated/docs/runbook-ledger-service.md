# Runbook — ledger-service

doc-id: runbook-ledger-service

Owner team: payments-core · On-call: payments-core-oncall@nimbuspay.test
Primary dashboard: obsboard/ledger-service · p99 latency target: 501ms · error budget: 0.5%/28d

## What this service does
Double-entry ledger; postings API with idempotency keys.

## Dependencies
- event-bus

## Common failure modes
1. A downstream dependency stalls — check the dependency's own
   runbook before restarting anything here.
2. Backlog growth on inbound work: First check queue depth and consumer lag
   on obsboard/ledger-service; a rising queue with flat throughput usually means a stuck
   worker, not load.
3. Elevated error rate after a deploy: compare deploy markers on obsboard/ledger-service
   against the error step-change; roll back per the deployment checklist
   (doc-deployment-and-rollback-checklist) if they align.

## Standard checks
- Start with the service health endpoint and the last 3 deploys.
- Correlate alerts with upstream/downstream services in the dependency list
  above; symptom location is often not cause location.
- Capture evidence (log lines, metric snapshots) BEFORE mitigating; attach it
  to the incident ticket.

## Escalation
Page payments-core-oncall@nimbuspay.test. Sev1 also pages platform-oncall@nimbuspay.test.
