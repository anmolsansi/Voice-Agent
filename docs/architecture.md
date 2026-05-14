# Architecture

## Service Boundaries

### Web UI

The care-team UI will provide patient management, schedule management, call history, transcript review, escalation inbox, reports, and operational health views. Desktop layouts should favor dense tables and filters. Mobile layouts should use stacked cards and full-width forms without horizontal scrolling.

### Backend APIs

Backend APIs own validation, authorization, persistence, reporting, and stable contracts for UI and worker clients. APIs should return structured errors and avoid exposing raw provider or secret values.

### Scheduler and Workers

Workers select eligible schedules, create outbound call sessions, retry transient failures, and prevent duplicate active calls. Workers must be idempotent because cron jobs and queues can retry.

### Voice Provider Adapter

The voice provider adapter owns outbound dialing, lifecycle webhook parsing, signature verification, media or realtime event handling, and provider-specific IDs. Provider details should not leak into UI components.

### Conversation Runtime

The runtime owns conversation state, prompt selection, intent handling, slot capture, safety checks, and final disposition. Every turn should be serializable for persistence and replay.

### Storage

Persistence should store patients, care programs, schedules, call sessions, transcript turns, lifecycle events, guardrail hits, escalations, audit events, job runs, and analytics events.

### Analytics

Analytics should be derived from durable events and call records. Reports should define date-range and time-zone behavior explicitly.

## Route Map

- `/dashboard`: operational summary.
- `/patients`: patient list and profile management.
- `/patients/:patientId`: patient detail, schedule, recent calls, and escalations.
- `/calls`: call history.
- `/calls/:callSessionId`: call timeline, transcript, recording link, extracted outcomes.
- `/escalations`: escalation inbox.
- `/reports`: metrics and exports.
- `/settings`: organization, provider, and feature-flag settings.

## Data Flow

1. Operator creates or imports patient and schedule.
2. Scheduler finds eligible schedules.
3. Call service creates a call session.
4. Voice provider places the call.
5. Webhooks and realtime events update lifecycle state and transcript turns.
6. Conversation runtime decides next state and final disposition.
7. Safety logic creates escalations when needed.
8. Dashboard and reports consume persisted call, escalation, and analytics data.

## Error Strategy

- Validation errors should be structured and field-specific.
- Provider errors should be normalized before returning to callers.
- User-facing errors should be safe and concise.
- Logs should include correlation IDs but not secrets or real patient-sensitive data.
- Webhook handlers must be idempotent.

## Glossary

- Disposition: final operational outcome for a call.
- Guardrail hit: a detected request or model response that requires a safe fallback.
- Eligibility: the decision that a patient may be called at a given time.
- Barge-in: patient interruption while the agent is speaking.
- Transcript turn: one agent or patient utterance with metadata.
