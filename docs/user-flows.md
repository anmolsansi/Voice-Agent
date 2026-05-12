# Voice Agent MVP User Flows

## Flow 1: Scheduled check-in happy path

1. Active patient has valid phone, consent, and an active schedule due within the configured call window.
2. Check-in enqueue job evaluates due schedules and creates one queued call attempt with an idempotency key.
3. Telephony adapter starts the outbound call and stores provider call/session IDs.
4. Patient answers; call status moves to `in_progress`.
5. AI voice boundary introduces CheckIn Care, confirms it is a check-in, and asks the configured status/symptom questions.
6. Optional medication and appointment prompts run if enabled for the patient/schedule.
7. AI boundary emits transcript turns and a proposed outcome summary.
8. Backend finalizes call as `completed`, stores transcript/detail data, advances or updates the schedule, and writes audit logs.
9. Operator sees the completed call on the dashboard and can open call detail/transcript.

### UI states covered

- Desktop dashboard shows updated counts and recent completed call row.
- Mobile dashboard shows completed call card with status/outcome first.
- Transcript page handles delayed transcript by showing metadata and a pending transcript message.

## Flow 2: Missed-call retry

1. Job creates queued call attempt for a due schedule.
2. Provider reports no-answer, busy, voicemail, or failed connection.
3. Backend maps provider event to `failed` or `canceled` with retryable error details.
4. Retry policy checks retry count, call window, opt-out state, and inactive/non-callable flags.
5. If retry is allowed, schedule metadata increments retry count and next due time.
6. If retry limit is exhausted, backend creates an alert for operator review.

### Failure states covered

- Duplicate provider callback returns success without creating another retry.
- Invalid phone number marks patient non-callable and creates a remediation alert.
- No patients or no eligible schedules returns an empty enqueue result, not an error.

## Flow 3: Symptom/status check with escalation

1. Patient answers scheduled check-in.
2. AI asks status/symptom prompts and detects concerning language, a callback request, or ambiguity that needs review.
3. AI uses a safe, non-diagnostic response and tells the patient the care team will review/follow up without promising a specific timeframe unless configured.
4. Backend finalizes the call with `escalationFlag=true` and outcome such as `needs_follow_up`.
5. Alert is created with priority, reason, call link, transcript summary, and routing metadata.
6. Operator opens alert queue, reviews transcript/call detail, performs human follow-up, and resolves alert with notes.

### Escalation unavailable path

- If assignment/routing fails, alert remains open with `routing_failed` or `human_unavailable` metadata.
- Dashboard displays manual fallback instructions instead of hiding the escalation.

## Flow 4: Medication/adherence prompt

1. Schedule metadata indicates medication prompt is enabled.
2. AI asks whether the patient took medication as directed using neutral wording.
3. Patient answers yes, no, unsure, or gives a reason.
4. Backend stores the structured response in outcome metadata and transcript detail.
5. If configured thresholds are met (missed dose, repeated missed doses, confusion), backend creates an alert.
6. Operator reviews and resolves as human follow-up; MVP does not recommend medication changes.

## Flow 5: Appointment reminder

1. Schedule/patient metadata includes appointment reminder data.
2. AI reminds patient of appointment date/time and asks whether they expect to attend.
3. Patient confirms, expresses uncertainty, or says they cannot attend.
4. Backend records acknowledgement/cannot-attend outcome.
5. Cannot-attend or uncertain responses create an alert for care-team follow-up.

## Flow 6: Patient opt-out

1. Patient says a stop phrase, wrong number, or asks not to receive calls.
2. AI confirms the preference in plain language and avoids further check-in questions.
3. Backend marks patient/schedule as opted out or paused with source `voice_call` and timestamp.
4. Call finalizes with opt-out outcome and audit log.
5. Future enqueue runs skip the patient/schedule.
6. UI shows opted-out badge on patient profile and schedule controls require admin/operator intent to re-enable.

## Flow 7: Interrupted call or failed AI response

1. Call starts and may have partial transcript.
2. Patient hangs up, network drops, telephony stream fails, or AI response fails.
3. Backend preserves partial transcript/events and marks retryability based on where the failure occurred.
4. If status is clinically ambiguous or the patient asked for help before interruption, create an alert.
5. If retryable and within policy, schedule a retry; otherwise surface failure on dashboard.

## Flow 8: Admin settings update

1. Admin opens voice-agent settings.
2. UI loads current call window, retry limits, provider webhook status, AI prompt version, escalation defaults, and recording policy.
3. Admin edits settings; backend validates required provider/AI references, safe retry windows, and phone/webhook fields.
4. Backend saves settings and writes audit log with actor and changed keys, not secret values.
5. Dashboard and worker use updated settings on subsequent calls.

## Operator review flow

1. Operator opens `/dashboard/alerts` or `/dashboard/voice`.
2. Operator filters by unresolved escalations, failed calls, or transcript failures.
3. Operator opens a call detail page to review status, timeline, outcome, transcript, and audit trail.
4. Operator assigns or resolves alert with resolution notes.
5. Backend writes audit log and updates dashboard counts.

## Loading, empty, and error expectations

| Surface | Loading | Empty | Error |
| --- | --- | --- | --- |
| Dashboard | Skeleton summary cards and table rows. | No scheduled calls/patients message with setup link. | Retry button and correlation ID. |
| Patient profile | Header skeleton and section placeholders. | No calls/alerts/schedules sections explain next setup step. | Non-callable warning for patient-specific errors. |
| Call detail | Metadata skeleton, then transcript placeholder. | No transcript available message tied to transcript status. | Partial detail remains visible if timeline/transcript fails. |
| Alerts queue | Priority-list skeleton. | No unresolved alerts message. | Queue load error keeps manual escalation instructions visible. |
| Settings | Form skeleton with disabled save. | Defaults shown where no custom settings exist. | Inline validation for invalid fields and PHI-safe save error. |

## Follow-up implementation issue sequence

1. Add patient/contact/alert/settings migrations and service modules.
2. Add schedule CRUD APIs and dashboard patient/profile routes.
3. Add telephony provider adapter and signed webhook route.
4. Add AI voice adapter and normalized event handling.
5. Add alerts queue and call detail/transcript UI.
6. Add observability metrics, PHI-safe logging checks, and pilot smoke tests for missed calls, opt-out, webhook duplicates, AI failures, and escalation failures.
