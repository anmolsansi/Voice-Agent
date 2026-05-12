# Voice Agent MVP Blueprint

## Purpose

This document defines the CheckIn Care voice-agent MVP target for OPE-32. It is intentionally scoped as a build blueprint: implementation issues should map back to the personas, call scenarios, data contracts, API boundaries, and non-goals below before adding production behavior.

The MVP extends the current CheckIn Care intake and staff workflow with scheduled outbound voice check-ins, call detail persistence, transcript review, and human escalation routing. It should keep the repository's existing stack conventions: Next.js App Router in `app/`, reusable UI in `components/`, Node HTTP modules in `src/modules/`, background jobs in `src/jobs/`, and PostgreSQL migrations in `db/migrations/`.

## MVP personas

| Persona | Primary need | MVP permissions and surfaces |
| --- | --- | --- |
| Patient | Receive a clear, brief call that checks status, symptoms, medication adherence, appointments, and opt-out preferences. | Phone call only for MVP; may be represented in staff UI through the patient profile and call history. |
| Caregiver/contact | Receive fallback context or human follow-up if the patient is unreachable or requests help. | Contact metadata on patient profile; human operator decides whether to call for MVP. Automated caregiver calls are out of scope. |
| Care-team operator | Monitor scheduled calls, review transcripts, triage alerts, resolve escalations, and document follow-up. | Dashboard, alerts queue, patient profile, call detail, transcript view, and resolution actions. |
| Admin | Configure call windows, retries, phone/provider settings, user access, and escalation defaults. | Settings screen and backend settings entities; detailed role-management UI can remain minimal. |

## MVP call scenarios

| Scenario | Trigger | Voice-agent behavior | Expected outcome |
| --- | --- | --- | --- |
| Scheduled check-in | Active `checkin_schedule.next_due_at` is due. | Worker creates an idempotent call attempt; telephony provider starts outbound call; AI follows configured check-in script. | Completed call with outcome summary, transcript, call events, and next schedule decision. |
| Missed-call retry | No answer, busy, voicemail, or provider failure. | Mark attempt failed/missed, increment retry metadata, enqueue another attempt within configured retry limits. | New queued attempt or final alert if retries are exhausted. |
| Symptom/status check | Patient answers scheduled check-in. | Ask status and symptoms using short, non-diagnostic prompts; detect urgent language for escalation. | Structured status fields, transcript turns, and optional alert. |
| Medication/adherence prompt | Patient has medication prompt enabled. | Ask whether medication was taken as directed; capture reason if missed. | Adherence response stored as call outcome metadata; alert for repeated missed doses if configured. |
| Appointment reminder | Appointment metadata exists on schedule/patient. | Remind patient of appointment date/time and ask if they expect to attend. | Appointment acknowledgement stored; alert if patient cannot attend. |
| Escalation to human follow-up | Patient asks for callback, reports concerning status, opt-in rules trigger, or AI/provider fails safely. | End autonomous handling, create alert with transcript summary and recommended next step; do not give medical advice. | Alert queue item assigned/unassigned for operator follow-up. |
| Opt-out | Patient says stop, do not call, wrong number, or admin toggles opt-out. | Confirm opt-out in plain language, mark patient/schedule as opted out or paused, stop future automated calls. | Audit log, setting update, and no future scheduled calls unless admin re-enables. |

## MVP scope

### In scope

- Scheduled outbound check-in orchestration using the existing call-attempt and check-in worker pattern.
- Telephony webhook intake for call lifecycle events, duplicate event protection, status callbacks, and recording/transcript availability notices.
- AI service boundary that can be implemented with a real-time voice provider or a provider-specific speech pipeline while exposing stable app-level events.
- Transcript turn storage, call timeline storage, call summary/outcome storage, recording metadata storage, and PHI-safe redaction defaults.
- Staff-facing screens for care-team dashboard, patient profile, call detail, transcript view, alerts queue, and settings.
- Entities and APIs for patients, schedules, calls, call events, transcript turns, alerts, users, audit logs, and settings.
- Observability baseline: structured logs without raw PHI, request/call correlation IDs, provider event IDs, latency/error metrics, and audit logs for human actions.
- Safe failure behavior: failed AI responses, failed webhooks, duplicate webhooks, invalid phone numbers, interrupted calls, inactive patients, opt-outs, and unavailable human escalation are explicit states.

### Out of scope for MVP

- Emergency dispatch, diagnosis, clinical decision support, medication changes, or any autonomous medical advice.
- Inbound patient support beyond provider webhooks required for outbound calls.
- Automated caregiver calls or SMS follow-ups without human operator review.
- Full EHR integration, claims/billing integration, or bidirectional appointment-booking integrations.
- Multi-language production certification, voice biometrics, identity proofing, or speaker diarization guarantees.
- Production retention/deletion automation beyond documenting the policy hooks and audit requirements.
- Advanced analytics, cohort reporting, model fine-tuning, and A/B prompt experimentation.
- Replacing the existing patient intake flow; the voice-agent MVP is additive.

## UI screens and behavior

### Care-team dashboard

- Desktop: summary cards for due calls, in-progress calls, missed calls, escalations, and unresolved alerts; table of recent calls with patient, status, due time, outcome, and escalation flag.
- Mobile: stacked cards with the highest-priority alert/call first; preserve tap targets for call detail and alert resolution.
- Empty state: explain that no patients or no calls are scheduled yet, with a link to settings or patient import once implemented.
- Loading state: skeleton cards/table rows; do not show stale counts as current.
- Error state: show a retry action and a PHI-safe support code/correlation ID.

### Patient profile

- Desktop: patient demographics, contact/consent state, check-in schedule, opt-out state, call history, active alerts, and notes.
- Mobile: top summary card, then schedule, alerts, and call history as collapsible sections.
- Edge states: inactive patients and invalid phone numbers should be visibly non-callable; opted-out patients should show the opt-out timestamp/source.

### Call detail

- Desktop: call metadata, timeline events, transcript summary, outcome fields, provider IDs, recording availability metadata, and audit trail.
- Mobile: status/outcome header first, then transcript and event timeline tabs/sections.
- Error state: if transcript is delayed or failed, show call metadata and provider event state instead of blocking the page.

### Transcript view

- Desktop: speaker-labeled turns with timestamps, prompt/state IDs when available, and highlighted escalation/opt-out cues.
- Mobile: readable single-column transcript with sticky call outcome/actions.
- Loading/delayed: use `transcriptStatus` and unavailable reason; avoid implying the transcript is lost while provider processing is pending.

### Alerts queue

- Desktop: filterable queue by priority, reason, age, assignee, and status; operator actions for assign, resolve, snooze, or mark human follow-up unavailable.
- Mobile: priority-first list with quick resolve/assign actions.
- Failure state: if escalation routing fails, create/retain an alert with `routing_failed` metadata and surface manual fallback instructions.

### Settings

- Desktop: call windows, timezone defaults, retry limits, provider webhook URLs/secrets, AI prompt/version selection, recording/transcript storage policy, escalation defaults, and opt-out language.
- Mobile: read-mostly settings with critical toggles clearly separated from destructive changes.
- Error state: validation for invalid phone numbers, invalid webhook secrets, missing provider credentials, and unsafe retry windows.

## Data/API requirements

| Entity | MVP fields | Notes |
| --- | --- | --- |
| Patient | id, name, DOB optional, phone, timezone, status, consent/opt-out flags, preferred language, caregiver/contact references, metadata. | Patient records can initially be lightweight and separate from current intake sessions. |
| Check-in schedule | id, patient_id, status, timezone, next_due_at, retry_count, call window, scenario flags, metadata. | Current `checkin_schedules` migration already establishes the core due-call shape. |
| Call / call attempt | id, patient_id, schedule_id, status, attempt_number, provider IDs, transcript_status, outcome, escalation_flag, timestamps, error_details, metadata, idempotency_key. | Current `call_attempts` migration and service cover the initial orchestration record. |
| Call event | id, call_id, provider_event_id, event_type, source, occurred_at, raw_payload_ref, metadata. | Must be idempotent by provider event ID plus call/provider scope. |
| Transcript | call_id, status, unavailable_reason, turns with speaker/text/timestamps/confidence/prompt_id/state_id. | Transcript text is PHI and must follow logging/redaction rules. |
| Alert | id, patient_id, call_id, type, priority, status, reason, summary, assignee, due_at, resolved_at, resolution, routing_error. | Escalations and repeated failures create alerts. |
| User | id, email, display_name, role, status, auth metadata. | Builds on staff auth conventions already in the repo. |
| Audit log | id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at. | Required for call state changes, alert resolution, opt-out, and settings changes. |
| Settings | id/key, scope, value, updated_by, updated_at. | Use for provider config references, call windows, retry policy, prompt version, and recording policy. |

### API boundary map

| Boundary | MVP route shape | Responsibility |
| --- | --- | --- |
| List patients | `GET /api/patients` | Filter/paginate care population for dashboard and patient search. |
| Patient detail | `GET /api/patients/:patientId` | Load profile, schedule, call history, and active alerts. |
| Schedule calls | `POST /api/checkin-schedules` / `PATCH /api/checkin-schedules/:scheduleId` | Create/update/pause scheduled check-ins and opt-out state. |
| Enqueue due calls | `POST /api/jobs/checkins/enqueue` | Cron-compatible job that creates idempotent call attempts. |
| Call attempts | `POST /api/calls`, `GET /api/calls`, `GET /api/calls/:callId`, `POST /api/calls/:callId/status`, `POST /api/calls/:callId/finalize` | Existing backend boundary for queued/in-progress/completed call attempts. |
| Telephony webhooks | `POST /api/webhooks/telephony/:provider/events` | Validate signature, dedupe provider event, update call status/events, return 2xx only after durable handling or safe retry decision. |
| AI session callbacks | `POST /api/ai/voice/sessions/:sessionId/events` | Accept app-normalized transcript/outcome/tool events from the AI boundary. |
| Transcript storage | `POST /api/calls/:publicCallId/detail`, `GET /api/calls/:publicCallId/detail` | Existing call-detail boundary for timeline, transcript, recording metadata, and audit log detail. |
| Alerts | `GET /api/alerts`, `POST /api/alerts/:alertId/assign`, `POST /api/alerts/:alertId/resolve` | Operator queue and resolution actions. |
| Settings | `GET /api/settings/voice-agent`, `PATCH /api/settings/voice-agent` | Admin configuration with audit logging. |

## Edge cases and required behavior

| Edge case | Required MVP behavior |
| --- | --- |
| No patients | Dashboard shows empty state; enqueue job evaluates zero schedules without error. |
| Inactive patient | Schedule is paused/skipped; no call attempt is created. |
| Invalid phone number | Patient is marked non-callable; alert/settings validation explains remediation. |
| Patient opt-out | Confirm opt-out, pause/cancel active schedule, audit change, suppress future calls. |
| Missed calls | Record provider reason; retry only within configured limits/call windows; alert when exhausted. |
| Interrupted calls | Preserve partial transcript/events; mark outcome as interrupted or needs follow-up if clinically ambiguous. |
| Failed AI response | Use safe fallback phrase if possible, end call, mark error retryability, create alert if patient may need follow-up. |
| Failed webhook | Validate signature and return non-2xx only when provider should retry; log correlation ID without raw PHI. |
| Duplicate webhook | Use provider event ID/idempotency key; return 2xx after detecting already-processed event. |
| Human escalation unavailable | Create/retain alert with `human_unavailable`; do not tell patient a specific callback time unless staffing is confirmed. |

## Dependencies and sequencing

1. **Documentation freeze:** keep this MVP blueprint, `docs/architecture.md`, and `docs/user-flows.md` as the reference target for follow-up issues.
2. **Data model migrations:** add patients, alerts, settings, call events, and transcript-turn tables around existing call-attempt tables.
3. **Provider integration:** implement signed telephony webhook intake, event dedupe, outbound-call adapter, and provider status mapping.
4. **AI boundary:** implement a provider-neutral voice session adapter with transcript, outcome, escalation, and tool-call events.
5. **Dashboard UI:** add dashboard, patient profile, call detail/transcript, alerts queue, and settings screens using existing Next.js conventions.
6. **Operational hardening:** add PHI-safe logs, metrics, runbooks, alert routing fallback, retention policy hooks, and smoke tests.
