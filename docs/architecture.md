# Voice Agent MVP Architecture

## Architectural stance

The voice-agent MVP should be added to the current CheckIn Care application rather than introduced as a separate app. The repo already has a Next.js App Router frontend, a Node HTTP backend with lightweight route modules, background-job code, PostgreSQL migrations, and call-related service boundaries. New work should follow those conventions so the implementation remains easy to review and deploy.

## System context

```text
Care-team operator/admin
        |
        v
Next.js App Router UI (app/, components/)
        |
        v
Node HTTP backend (src/app.js, src/modules/*/routes.js)
        |
        +--> Patient/check-in/call/alert/settings services
        |       |
        |       v
        |   PostgreSQL (db/migrations/)
        |
        +--> Background worker endpoint/job (src/jobs/checkins.js)
        |
        +--> Telephony provider webhooks and outbound call adapter
        |
        +--> AI voice boundary (speech/session/transcript/outcome events)
        |
        v
Observability and audit logs (PHI-safe structured events, metrics, audit_logs)
```

## Runtime components

| Component | Repo convention | MVP responsibility |
| --- | --- | --- |
| Staff frontend | `app/dashboard/*`, `components/*`, `lib/*` | Dashboard, patient profile, call detail/transcript, alerts queue, and settings screens. |
| Backend router | `src/app.js`, `src/http/*`, `src/modules/*/routes.js` | HTTP route composition, request parsing, JSON responses, and module boundaries. |
| Call orchestration module | `src/modules/calls/*` | Create/list/update/finalize call attempts; persist call detail, transcript, recording metadata, and audit events. |
| Check-in job | `src/jobs/checkins.js` | Evaluate due schedules and enqueue idempotent call attempts. |
| Intake module | `src/modules/intake/*` | Existing patient intake flow; can inform patient profile data but should not be coupled to call execution. |
| Staff/auth module | `src/modules/staff/*`, `middleware.ts`, `lib/staff-auth.ts` | Protect dashboard/API actions and identify operator/admin actors. |
| Database | `db/migrations/*`, `src/lib/db/postgres.js` | Durable persistence for schedules, calls, call events, transcripts, alerts, settings, users, and audit logs. |
| Telephony adapter | New `src/modules/telephony` or provider submodule | Outbound call creation, signed webhook validation, provider event normalization, and retry-safe responses. |
| AI voice adapter | New `src/modules/ai` or `src/lib/voice-agent` | Voice session lifecycle, prompt/script versioning, transcript events, tool-call/outcome events, and safe failure handling. |
| Observability | Existing logging guidance plus new instrumentation | Correlation IDs, provider event IDs, latency/error metrics, call outcome metrics, PHI-safe logs, and audit trails. |

## End-to-end call sequence

```text
1. Cron or operator calls POST /api/jobs/checkins/enqueue.
2. checkins job lists active schedules due at or before now.
3. calls service creates an idempotent queued call attempt per due schedule.
4. outbound telephony adapter starts the provider call and updates provider IDs/status.
5. provider sends signed lifecycle webhooks; backend dedupes and records call events/status.
6. AI voice boundary receives/sends real-time audio/session events through the provider integration.
7. AI boundary emits normalized transcript turns, outcome fields, escalation cues, and errors.
8. backend finalizes the call, stores transcript/detail/audit events, and creates alerts when needed.
9. care-team dashboard lists calls/alerts; operator reviews transcript and resolves follow-up.
```

## Frontend route map

| Route | Current / target | Purpose |
| --- | --- | --- |
| `/` | Current landing shell | Project landing and entry points. |
| `/intake/start`, `/intake/[sessionId]`, `/intake/review`, `/intake/complete` | Current intake routes | Existing patient intake flow; unchanged by voice-agent MVP except possible profile data reuse. |
| `/staff/login` | Current | Staff authentication entry. |
| `/dashboard` | Current redirect/shell | Staff dashboard shell. |
| `/dashboard/intake`, `/dashboard/intake/[id]` | Current | Existing intake queue/detail. |
| `/dashboard/voice` | Target | Voice-agent operations dashboard. |
| `/dashboard/patients` | Target | Patient list/search and empty state. |
| `/dashboard/patients/[patientId]` | Target | Patient profile with schedule, opt-out, call history, and alerts. |
| `/dashboard/calls/[callId]` | Target | Call detail metadata, event timeline, transcript summary, recording metadata, audit trail. |
| `/dashboard/alerts` | Target | Escalation and failure queue. |
| `/dashboard/settings/voice-agent` | Target | Call windows, retries, provider/AI settings, recording policy, escalation defaults. |

## Backend API map

| Route | Current / target | Service owner | Notes |
| --- | --- | --- | --- |
| `GET /health`, `GET /ready` | Current | health | Include dependency readiness as integrations are added. |
| Intake/session routes | Current | intake/submission | Existing intake APIs remain stable. |
| `POST /api/calls` | Current | calls | Creates call attempts when `patientId/scheduleId` are present; persists call detail for detail payloads. |
| `GET /api/calls` | Current | calls | Lists call attempts by patient/schedule/status for dashboard use. |
| `GET /api/calls/:callId` | Current | calls | Returns call attempt and audit events. |
| `POST /api/calls/:callId/status` | Current | calls | Updates queued/starting/in-progress/failure states. |
| `POST /api/calls/:callId/finalize` | Current | calls | Completes call with outcome, transcript status, and escalation flag. |
| `GET /api/calls/:publicCallId/detail` | Current | call detail | Returns transcript/timeline/recording/audit detail by public call ID. |
| `POST /api/jobs/checkins/enqueue` | Current | jobs/calls | Cron-compatible due schedule enqueue endpoint. |
| `GET/POST/PATCH /api/patients...` | Target | patients | Patient profile and contact/opt-out management. |
| `GET/POST/PATCH /api/checkin-schedules...` | Target | schedules | Schedule CRUD separate from enqueue execution. |
| `POST /api/webhooks/telephony/:provider/events` | Target | telephony | Signed provider webhooks and dedupe. |
| `POST /api/ai/voice/sessions/:sessionId/events` | Target | AI boundary | Normalized AI/transcript/outcome event callback if provider integration needs server callbacks. |
| `GET/POST /api/alerts...` | Target | alerts | Queue, assignment, resolution, and escalation fallback. |
| `GET/PATCH /api/settings/voice-agent` | Target | settings | Admin configuration with audit logs. |

## Data model map

| Table/entity | Current / target | Key relationships |
| --- | --- | --- |
| `intake_sessions` and related intake tables | Current | Existing patient intake records. |
| `staff_users` / auth data | Current | Operators/admins for actions and audit metadata. |
| `audit_logs` | Current groundwork | Actions against calls, alerts, opt-outs, settings, and reviews. |
| `checkin_schedules` | Current core | Belongs to patient; produces many call attempts. |
| `call_attempts` | Current core | Belongs to patient and schedule; has provider IDs and status. |
| Call detail tables | Current core from call-detail persistence | Call timeline, transcript turns, recording metadata, and detail audit logs. |
| `patients` | Target | Owns schedules, calls, contacts, alerts, opt-out state. |
| `patient_contacts` | Target | Caregiver/contact references; human follow-up only for MVP. |
| `call_events` | Target/harden | Provider and app-normalized events with provider event idempotency. |
| `alerts` | Target | Created by escalations, missed retry exhaustion, AI failure, invalid phone, and unavailable human escalation. |
| `settings` | Target | Voice-agent configuration values by scope/key. |

## AI service boundary

The app should treat the AI voice system as a bounded adapter, not as the owner of clinical/business state. The adapter may use a real-time speech-to-speech API or a composed STT/LLM/TTS pipeline, but it must emit app-normalized events:

- `session.started`, `session.ended`, `session.failed`
- `transcript.turn.created`
- `prompt.state.changed`
- `patient.intent.detected` for opt-out, callback request, medication response, appointment response, and symptom/status response
- `call.outcome.proposed`
- `escalation.requested`
- `tool.call.requested` only for approved app tools

Business rules stay in backend services: opt-out, escalation creation, call finalization, schedule updates, and alert resolution must be persisted by app-owned APIs with audit logs.

## Telephony webhook boundary

Provider callbacks must be normalized before they touch call state:

- Validate provider signatures/secrets before parsing PHI-bearing fields.
- Dedupe by provider event ID and call/provider ID.
- Map provider statuses to app statuses (`queued`, `starting`, `in_progress`, `completed`, `failed`, `canceled`, `finalizing`).
- Store raw payloads only through approved secure references; do not log raw webhook bodies.
- Return `2xx` for duplicates and already-terminal states; return retryable non-2xx only when durable handling did not happen.

## Observability and compliance baseline

- Attach a correlation ID to each enqueue run, call attempt, webhook event, AI session, and dashboard action.
- Log structured metadata only: IDs, statuses, durations, provider event IDs, retryability, and safe error codes.
- Never log transcript text, recording URLs, patient phone numbers, DOB, or medication details in application logs.
- Metrics: calls enqueued, answer rate, completion rate, missed retries, escalation count, webhook duplicate count, webhook failure count, AI failure count, time to transcript, and alert time-to-resolution.
- Audit logs: settings changes, call status/finalization, opt-out changes, alert assignment/resolution, and transcript access where feasible.
