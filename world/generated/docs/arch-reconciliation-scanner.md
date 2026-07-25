# Architecture — reconciliation-scanner

doc-id: arch-reconciliation-scanner

Owner team: payments-core

## Role in the platform
Paginated scans comparing ledger balances to settlement states; marks merchants settled/stale.

## Interfaces
- Synchronous API consumed by: settlement-service
- Depends on: ledger-service, merchant-service
- Emits domain events to the event-bus topic `reconciliation.scanner.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
