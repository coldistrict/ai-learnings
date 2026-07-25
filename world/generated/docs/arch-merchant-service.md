# Architecture — merchant-service

doc-id: arch-merchant-service

Owner team: merchant-experience

## Role in the platform
Merchant accounts, onboarding state, settlement preferences.

## Interfaces
- Synchronous API consumed by: api-gateway, reconciliation-scanner
- Depends on: ledger-service, notification-service
- Emits domain events to the event-bus topic `merchant.service.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
