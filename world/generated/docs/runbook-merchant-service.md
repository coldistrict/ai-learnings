# Runbook — merchant-service

doc-id: runbook-merchant-service

Owner team: merchant-experience · On-call: merchant-exp-oncall@nimbuspay.test
Primary dashboard: obsboard/merchant-service · p99 latency target: 264ms · error budget: 0.5%/28d

## What this service does
Merchant accounts, onboarding state, settlement preferences.

## Dependencies
- ledger-service
- notification-service

## Common failure modes
1. A downstream dependency backs up — check the dependency's own
   runbook before restarting anything here.
2. Backlog growth on inbound work: First check queue depth and consumer lag
   on obsboard/merchant-service; a rising queue with flat throughput usually means a stuck
   worker, not load.
3. Elevated error rate after a deploy: compare deploy markers on obsboard/merchant-service
   against the error step-change; roll back per the deployment checklist
   (doc-deployment-and-rollback-checklist) if they align.

## Standard checks
- Start with the service health endpoint and the last 3 deploys.
- Correlate alerts with upstream/downstream services in the dependency list
  above; symptom location is often not cause location.
- Capture evidence (log lines, metric snapshots) BEFORE mitigating; attach it
  to the incident ticket.

## Escalation
Page merchant-exp-oncall@nimbuspay.test. Sev1 also pages platform-oncall@nimbuspay.test.
