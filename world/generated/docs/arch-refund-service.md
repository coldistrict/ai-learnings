# Architecture — refund-service

doc-id: arch-refund-service

Owner team: payments-core

## Role in the platform
Refund intake queue and refund execution workers.

## Interfaces
- Synchronous API consumed by: api-gateway
- Depends on: payment-orchestrator, ledger-service, event-bus
- Emits domain events to the event-bus topic `refund.service.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
