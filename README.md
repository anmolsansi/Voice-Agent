# CheckIn Care Voice Agent

CheckIn Care Voice Agent is a planned voice-based patient check-in product. The MVP focuses on scheduled outbound calls, safe scripted check-ins, structured outcomes, human escalation, and care-team review.

## Current Repository Shape

This repository currently contains the project setup foundation:

- Product scope and call flows: `docs/voice-agent-scope.md`
- Architecture and service boundaries: `docs/architecture.md`
- Local setup and developer conventions: `docs/local-development.md`
- Environment variable template: `.env.example`
- Shared domain types: `src/types/voice-agent.ts`
- Mock data and reusable fixtures: `src/lib/mock-data/voice-agent-fixtures.mjs`
- Formatting helpers: `src/lib/formatters/voice-agent-formatters.mjs`

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Fill local, non-production values for required variables.
3. Run validation:

```sh
npm run check
```

The current `build` and `test` scripts run fixture/contract validation until an application framework and test runner are introduced.

## Standard Commands

```sh
npm run check
npm run test
npm run build
```

## Implementation Principles

- Keep synthetic fixture data separate from production data.
- Do not commit real patient data, credentials, recordings, transcripts, or webhook secrets.
- Keep voice-provider and AI-provider integrations behind adapters.
- Persist enough call state to replay and audit decisions.
- Route urgent symptoms and unsupported medical requests to safe escalation paths.
