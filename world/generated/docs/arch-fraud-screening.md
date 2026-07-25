# Architecture — fraud-screening

doc-id: arch-fraud-screening

Owner team: risk

## Role in the platform
Synchronous risk scoring with async model-feature updates.

## Interfaces
- Synchronous API consumed by: payment-orchestrator
- Depends on: event-bus
- Emits domain events to the event-bus topic `fraud.screening.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
