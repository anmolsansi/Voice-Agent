# ADR 0001: Monorepo Scaffold

## Status
Accepted

## Context
The project needs clear boundaries for frontend, backend, and shared contracts while shipping incrementally.

## Decision
Use npm workspaces with:
- `apps/frontend` for intake UI
- `apps/backend` for API/state orchestration
- `packages/shared-types` for shared interfaces

## Consequences
- Small, isolated PRs can target each boundary.
- CI can validate lint/typecheck/test via root scripts.
- Follow-up PRs can add framework-specific setup without restructuring.
