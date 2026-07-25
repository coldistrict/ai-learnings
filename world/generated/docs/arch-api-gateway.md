# Architecture — api-gateway

doc-id: arch-api-gateway

Owner team: platform-infra

## Role in the platform
Public API edge: authn, rate limiting, request routing.

## Interfaces
- Synchronous API consumed by: external clients only
- Depends on: merchant-service, payment-orchestrator, refund-service
- Emits domain events to the event-bus topic `api.gateway.events`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
