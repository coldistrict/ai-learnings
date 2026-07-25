# Architecture — notification-service

doc-id: arch-notification-service

Owner team: merchant-experience

## Role in the platform
Email/dashboard notifications to merchants and internal teams.

## Interfaces
- Synchronous API consumed by: merchant-service, settlement-service, webhook-dispatcher
- Depends on: event-bus
- Emits domain events to the event-bus topic `notification.service.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
