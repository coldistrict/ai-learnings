# Architecture — webhook-dispatcher

doc-id: arch-webhook-dispatcher

Owner team: integrations

## Role in the platform
Delivers signed webhooks to merchant endpoints with retries.

## Interfaces
- Synchronous API consumed by: payment-orchestrator
- Depends on: event-bus, notification-service
- Emits domain events to the event-bus topic `webhook.dispatcher.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
