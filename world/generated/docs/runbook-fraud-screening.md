# Runbook — fraud-screening

doc-id: runbook-fraud-screening

Owner team: risk · On-call: risk-oncall@nimbuspay.test
Primary dashboard: obsboard/fraud-screening · p99 latency target: 536ms · error budget: 0.5%/28d

## What this service does
Synchronous risk scoring with async model-feature updates.

## Dependencies
- event-bus

## Common failure modes
1. A downstream dependency backs up — check the dependency's own
   runbook before restarting anything here.
2. Backlog growth on inbound work: First check queue depth and consumer lag
   on obsboard/fraud-screening; a rising queue with flat throughput usually means a stuck
   worker, not load.
3. Elevated error rate after a deploy: compare deploy markers on obsboard/fraud-screening
   against the error step-change; roll back per the deployment checklist
   (doc-deployment-and-rollback-checklist) if they align.

## Standard checks
- Start with the service health endpoint and the last 3 deploys.
- Correlate alerts with upstream/downstream services in the dependency list
  above; symptom location is often not cause location.
- Capture evidence (log lines, metric snapshots) BEFORE mitigating; attach it
  to the incident ticket.

## Escalation
Page risk-oncall@nimbuspay.test. Sev1 also pages platform-oncall@nimbuspay.test.
