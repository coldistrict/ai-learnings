# Architecture — settlement-service

doc-id: arch-settlement-service

Owner team: payments-core

## Role in the platform
Daily merchant settlement batches and payout files.

## Interfaces
- Synchronous API consumed by: external clients only
- Depends on: ledger-service, reconciliation-scanner, notification-service
- Emits domain events to the event-bus topic `settlement.service.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
