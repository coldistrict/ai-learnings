# Architecture — ledger-service

doc-id: arch-ledger-service

Owner team: payments-core

## Role in the platform
Double-entry ledger; postings API with idempotency keys.

## Interfaces
- Synchronous API consumed by: merchant-service, payment-orchestrator, settlement-service, reconciliation-scanner, refund-service
- Depends on: event-bus
- Emits domain events to the event-bus topic `ledger.service.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
