# CheckIn Care / Voice-Agent

CheckIn Care is a pilot-stage patient intake application for clinic check-in workflows.

It includes:
- a Next.js patient and staff web app
- a small Node.js backend for intake/session APIs, health endpoints, and PDF generation
- PostgreSQL-backed persistence with migrations

The current implementation is suitable for local pilot use and internal evaluation. It is **not production-ready** yet.

## Current status

### What this project is today

This repo contains a working end-to-end intake flow that has been verified locally against PostgreSQL.

Current state:
- **Pilot-ready:** yes
- **Production-ready:** no
- **Latest verified environment:** local development / local pilot setup
- **Persistence model:** PostgreSQL in pilot mode, with explicit in-memory fallback only for allowed local development scenarios

A local pilot smoke test has passed for the full main flow:
- create intake session
- save/update fields
- review answers
- submit intake
- open the staff queue
- review a submitted session
- generate a PDF summary

## What is built

### Patient intake flow

The patient experience currently supports:
- intake session creation
- save/update during intake
- review screen before submission
- final submission flow
- demographics section
- visit reason / chief complaint section
- consent section
- session resume/reload
- QR code and shareable link for continuing the same session on a mobile device

### Voice intake mode

The intake UI includes a prototype voice-assisted mode with:
- manual / voice mode toggle
- field-by-field prompts
- transcript capture
- extraction of transcript content into structured intake fields
- fallback to manual entry at any time

Important note: the current voice implementation is still prototype-grade and relies on browser speech capabilities rather than a hardened production voice pipeline.

### Staff workflow

The staff side currently supports:
- protected staff dashboard
- intake queue view
- session detail view
- mark-reviewed action
- review notes entry
- PDF summary access for submitted sessions

### Persistence and backend behavior

The backend currently includes:
- PostgreSQL-backed persistence
- migration-based schema management
- three committed database migrations
- health and readiness endpoints
- persistence mode signaling in health responses
- fail-closed persistence behavior in non-development environments when the database is unavailable or not configured

### Security and operational baseline

The repo also includes:
- transitional staff auth guard with `STAFF_AUTH_MODE=legacy|jwt`
- per-user JWT staff login support alongside temporary legacy shared-token compatibility
- HTTP-only cookie handling for staff access
- Next.js middleware protection for staff pages and staff API routes
- PHI-safe logging guidance in project docs
- voice-agent MVP blueprint, architecture, and user-flow documentation
- ESLint configuration
- pilot smoke checklist and supporting operational documentation


## Voice-agent MVP planning

The OPE-32 voice-agent MVP target is documented in:

- `docs/voice-agent-mvp.md` for scope, personas, call scenarios, non-goals, UI expectations, API/data boundaries, edge cases, and sequencing
- `docs/architecture.md` for the app-level architecture, route/API/entity maps, telephony and AI service boundaries, and observability baseline
- `docs/user-flows.md` for happy paths, escalation paths, failure paths, and desktop/mobile/loading/empty/error state expectations

## Known limitations

This section is intentionally direct: several important controls are not finished yet.

Current limitations include:
- some deployments may still be on the legacy shared-token staff flow until the JWT rollout is completed
- patient resume links do not yet have signed expiration / TTL enforcement
- audit logging is not implemented beyond schema groundwork and a placeholder endpoint
- rate limiting and request hardening are incomplete
- observability is minimal
- retention and deletion workflows are not implemented
- voice support is prototype-grade
- production deployment procedures are not documented end-to-end

## Tech stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Node.js HTTP server in `src/`
- Express is installed as a dependency, but the current backend is organized around the project's own HTTP routing modules
- PDF generation via `pdfkit`

### Data and infrastructure
- PostgreSQL
- `pg` client
- `node-pg-migrate` for schema migrations

### Other notable libraries
- `qrcode.react` for mobile continuation QR codes

## Repository layout

```text
app/                 Next.js app routes
components/          Patient and staff UI components
lib/                 Frontend/server shared helpers
src/                 Backend server, modules, and tests
db/migrations/       Postgres migrations
docs/                Pilot, schema, voice-agent MVP, and operational documentation
middleware.ts        Staff route protection for Next.js
```

## Local development

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Environment setup

Copy the safe example file, then edit local-only values as needed:

```bash
cp .env.example .env
```

The example file intentionally uses mock providers and placeholder secrets. Real credentials belong only in `.env`, `.env.local`, or your deployment secret store. Never commit real secrets or PHI-bearing test data.

### Environment variable reference

| Variable | Runtime | Required when | Notes |
| --- | --- | --- | --- |
| `APP_URL` | Next.js/server | Always | Public app origin for local links. |
| `INTAKE_API_BASE_URL` | Next.js server routes/scripts | Always | Backend base URL used by API proxy routes and simulation scripts. |
| `FRONTEND_PORT` | Next.js CLI | Local dev/start | Defaults to `3000`. |
| `BACKEND_PORT` / `PORT` | Node backend | Local dev/start | Must be a positive integer; defaults to `3001`. |
| `APP_NAME` | Node backend | Optional | Service name shown in health/readiness responses. |
| `NODE_ENV` | Node/Next.js | Always | `development`, `test`, or `production`. |
| `LOG_LEVEL` | Server/scripts | Optional | `trace`, `debug`, `info`, `warn`, `error`, or `silent`. |
| `DATABASE_URL` | Backend/migrations | Production and durable local dev | Required for migrations and production persistence. |
| `PGSSL` | Backend/migrations | Hosted Postgres requiring SSL | Use `false` for local Postgres. |
| `ALLOW_MEMORY_FALLBACK` | Backend/tests | Explicit local fallback only | Keep `false` for durable local pilot testing. |
| `STAFF_AUTH_MODE` | Next.js staff auth/backend config | Always | `legacy` or `jwt`. |
| `JWT_SECRET` | Staff auth/config | `STAFF_AUTH_MODE=jwt` | Long random secret; do not expose to client code. |
| `STAFF_ACCESS_TOKEN` | Staff auth | Legacy mode, especially production | Shared pilot token for the current legacy dashboard path. |
| `TELEPHONY_PROVIDER` | Backend/scripts | Always | `mock`, `twilio`, or `telnyx`; use `mock` locally. |
| `TELEPHONY_ACCOUNT_SID`, `TELEPHONY_AUTH_TOKEN`, `TELEPHONY_API_KEY`, `TELEPHONY_FROM_NUMBER` | Backend/scripts | Real telephony testing | Provider credentials and sender number. |
| `WEBHOOK_SIGNING_SECRET` | Backend/scripts | Real telephony webhooks | Local scripts use it to generate a test signature header. |
| `WEBHOOK_TUNNEL_URL` | Developer tooling | Webhook tunnel testing | Public tunnel URL when exposing the backend to a provider. |
| `AI_PROVIDER`, `AI_PROVIDER_API_KEY`, `AI_MODEL` | Backend/scripts | Non-mock AI provider | Use `mock` until real extraction/LLM calls are being tested. |
| `TTS_PROVIDER`, `TTS_VOICE`, `TTS_LANGUAGE` | Voice UI/provider config | Voice testing | Browser prototype defaults to Web Speech settings. |
| `STT_PROVIDER`, `STT_MODEL`, `STT_LANGUAGE` | Voice UI/provider config | Voice testing | Browser prototype defaults to Web Speech settings. |
| `STORE_RECORDING_URLS`, `PROVIDER_RECORDING_URLS_ENABLED` | Backend call detail persistence | Recording URL policy allows storage | Keep both `false` unless approved. |
| `FEATURE_VOICE_INTAKE`, `FEATURE_CALL_SIMULATION`, `FEATURE_WEBHOOK_SIMULATION` | Server/scripts | Optional | Boolean feature gates for local workflows. |
| `NEXT_PUBLIC_ENABLE_VOICE_PROTOTYPE` | Browser | Optional | Public flag only; never put secrets in `NEXT_PUBLIC_*` variables. |

Server configuration is validated in `src/config/env.js`. Missing production persistence, malformed URLs, invalid enum values, and missing provider secrets for selected non-mock integrations fail fast with a safe error message that lists variable names but not secret values.

## Install dependencies

```bash
npm install
```

## Create the local database

If needed:

```bash
createdb voice_agent_dev
```

## Run database migrations

```bash
npm run db:migrate
```

This applies pending migrations and creates the `pgmigrations` table.

Current migration count in the repo: **5**.

## Seed the first staff account

Create an initial staff admin before testing staff login flows:

```bash
npm run db:seed-staff -- --email admin@example.com --password 'ChangeMe123!' --display_name 'Clinic Admin' --role admin
```

The current pilot schema still uses the legacy shared-token dashboard path. The seed script validates and echoes the requested local staff defaults without writing a password until the JWT staff-user table lands. Use `STAFF_AUTH_MODE=legacy` with `STAFF_ACCESS_TOKEN` for dashboard access in the current checkout.

## Start the backend

```bash
npm run dev:backend
```

Expected log:

```text
voice-agent-backend listening on port 3001
```

## Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

## Open the app

- Patient app: `http://127.0.0.1:3000`
- Intake start page: `http://127.0.0.1:3000/intake/start`
- Staff dashboard: `http://127.0.0.1:3000/dashboard/intake`
- Backend health: `http://127.0.0.1:3001/health`
- Backend readiness: `http://127.0.0.1:3001/ready`

## Local pilot verification flow

A practical end-to-end verification flow is:

1. Open `http://127.0.0.1:3000/intake/start`
2. Start a new intake session
3. Complete demographics, visit reason, and consent fields
4. Verify save/update behavior during the intake flow
5. Optionally switch between manual and voice mode
6. Review answers before submission
7. Submit the intake
8. Confirm the completion page loads
9. Open `http://127.0.0.1:3000/dashboard/intake`
10. Authenticate with the configured staff auth mode (`legacy` shared token or `jwt` staff-user login)
11. Open the submitted session
12. Add staff notes and mark it reviewed
13. Open `http://127.0.0.1:3000/api/staff/sessions/<publicSessionId>/pdf` and verify the PDF renders or downloads

## Health and readiness behavior

The backend exposes:
- `GET /health`
- `GET /ready`

These endpoints report:
- service name
- environment
- timestamp
- persistence readiness
- persistence mode

Persistence modes currently include:
- `database`
- `memory-fallback`
- `database-required`

In local development, explicit in-memory fallback can be surfaced when the database is not configured. In non-development environments, the app is intended to fail closed rather than silently continue without durable persistence.

## Staff authentication model

The project is in a transition from a shared pilot token to per-user JWT staff authentication.

### Transition modes

Staff authentication is selected with:

```env
STAFF_AUTH_MODE=legacy|jwt
```

#### Legacy mode

When `STAFF_AUTH_MODE=legacy`:
- staff access is gated by `STAFF_ACCESS_TOKEN`
- successful login stores an HTTP-only cookie
- Next middleware protects `/dashboard/*` and protected `/api/staff/*` routes
- unauthorized staff API access returns `401`

This remains available for backward compatibility during rollout.

#### JWT mode

When `STAFF_AUTH_MODE=jwt`:
- staff users authenticate as individual accounts
- the backend uses JWT-backed staff authentication
- staff actions can be attributed to an authenticated actor
- `JWT_SECRET` must be configured

Use JWT mode for new deployments and for existing deployments after staff-user seeding is complete.

For the migration plan and rollout steps, see `docs/auth-upgrade-guide.md`.

## Available scripts

### App runtime

- `npm run dev` - alias for frontend development
- `npm run dev:frontend` - start the Next.js frontend
- `npm run dev:backend` - start the Node backend
- `npm run build` - build the frontend
- `npm run start` - alias for frontend start
- `npm run start:frontend` - run the built frontend
- `npm run start:backend` - run the backend
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript without emitting files
- `npm test` - run Node.js tests

### Database

- `npm run db:migrate` - apply pending migrations
- `npm run db:rollback` - roll back the most recent migration
- `npm run db:rollback:all` - roll back all migrations
- `npm run db:seed-staff -- --email=<email> --password=<password> --display_name=<name> --role=<role>` - validate/echo local staff defaults while the pilot remains on legacy shared-token auth
- `npm run db:create -- <name>` - create a new migration file in `db/migrations`


### Local simulation scripts

- `npm run call:simulate -- --patient-id=local-patient-001 --schedule-id=local-schedule-001` - enqueue a local check-in call through the backend API.
- `npm run webhook:simulate -- --public-call-id=local_call_001` - post a mock provider webhook/call-detail payload, including a local HMAC signature header.

Both scripts read `.env` / `.env.local` and default to `INTAKE_API_BASE_URL` or `http://127.0.0.1:3001`. Start the backend first with `npm run dev:backend`.

## Documentation

Useful project documents:
- `docs/auth-upgrade-guide.md`
- `docs/pilot-smoke-checklist.md`
- `docs/database-migrations.md`
- `docs/phi-safe-logging-redaction-standard.md`
- `docs/mvp-field-schema-freeze.md`
- `docs/mvp-shared-api-data-contracts.md`
- `docs/sprint-1-architecture-boundaries.md`

## Roadmap / production gaps

The highest-priority work to make this suitable for production includes:

1. Complete the JWT staff-auth rollout and remove legacy shared-token support
   - finish migration of remaining `legacy` deployments
   - remove `STAFF_ACCESS_TOKEN` fallback after rollout confidence is established
   - continue toward stronger RBAC / MFA as follow-up hardening

2. Add expiring signed patient session links with TTL enforcement

3. Implement a real audit trail
   - current audit capability is not fully implemented yet

4. Add request protections
   - rate limiting
   - request size limits
   - CSRF hardening

5. Add observability
   - structured logging
   - error monitoring
   - alerting

6. Implement data retention and deletion policy

7. Align HIPAA acknowledgment rules across frontend, backend, and docs

8. Add field-level encryption or stronger PHI protections for stored data

9. Write a real production deployment runbook
   - current documentation is oriented toward local pilot bring-up

10. Add end-to-end browser tests and more security-focused test coverage

11. Replace the current browser-based voice prototype with a more reliable production voice integration

12. Expand staff user lifecycle tooling beyond the seed script
    - self-service password reset
    - admin UI / CLI for activation and role changes
    - safer deactivation flows

13. Define governance and moderation rules for staff notes

14. Add admin, export, and reporting tooling

15. Harden kiosk workflows
   - session expiry
   - reset behavior for shared clinic devices

## Summary

This project is a working pilot implementation of a clinic intake system with patient intake, voice-assisted entry, staff review, and PDF summary generation.

It is in a good state for local pilot evaluation and continued development, but it still needs substantial security, operational, and compliance work before production deployment.