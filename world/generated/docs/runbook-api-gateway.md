# Runbook — api-gateway

doc-id: runbook-api-gateway

Owner team: platform-infra · On-call: platform-oncall@nimbuspay.test
Primary dashboard: obsboard/api-gateway · p99 latency target: 725ms · error budget: 1%/28d

## What this service does
Public API edge: authn, rate limiting, request routing.

## Dependencies
- merchant-service
- payment-orchestrator
- refund-service

## Common failure modes
1. A downstream dependency stalls — check the dependency's own
   runbook before restarting anything here.
2. Backlog growth on inbound work: First check queue depth and consumer lag
   on obsboard/api-gateway; a rising queue with flat throughput usually means a stuck
   worker, not load.
3. Elevated error rate after a deploy: compare deploy markers on obsboard/api-gateway
   against the error step-change; roll back per the deployment checklist
   (doc-deployment-and-rollback-checklist) if they align.

## Standard checks
- Start with the service health endpoint and the last 3 deploys.
- Correlate alerts with upstream/downstream services in the dependency list
  above; symptom location is often not cause location.
- Capture evidence (log lines, metric snapshots) BEFORE mitigating; attach it
  to the incident ticket.

## Escalation
Page platform-oncall@nimbuspay.test. Sev1 also pages platform-oncall@nimbuspay.test.
