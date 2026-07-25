# Architecture — event-bus

doc-id: arch-event-bus

Owner team: platform-infra

## Role in the platform
Kafka-style event backbone (topics, consumer groups, DLQs). Base dependency sink.

## Interfaces
- Synchronous API consumed by: ledger-service, webhook-dispatcher, refund-service, fraud-screening, notification-service
- Depends on: nothing (sink)
- Emits domain events to the event-bus topic `event.bus.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
