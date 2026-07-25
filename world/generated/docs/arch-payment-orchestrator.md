# Architecture — payment-orchestrator

doc-id: arch-payment-orchestrator

Owner team: payments-core

## Role in the platform
Drives a payment through screening, capture, and posting.

## Interfaces
- Synchronous API consumed by: api-gateway, refund-service
- Depends on: fraud-screening, ledger-service, webhook-dispatcher
- Emits domain events to the event-bus topic `payment.orchestrator.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
