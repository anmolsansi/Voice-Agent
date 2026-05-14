# CheckIn Care Voice Agent Scope

## MVP Goal

Build a voice agent that places scheduled outbound check-in calls, asks safe scripted questions, records structured outcomes, and escalates urgent or unsupported situations to a human care-team workflow.

## Target Users

- Patients who receive scheduled check-in calls.
- Care-team operators who review outcomes, transcripts, missed calls, and escalations.
- Admins or operations leads who configure outreach schedules and monitor performance.

## Primary Call Flows

### Scheduled outbound check-in

1. Scheduler selects an eligible patient.
2. System creates a call session and asks the voice provider to dial.
3. Patient answers.
4. Agent introduces itself, verifies identity, and asks for consent to continue.
5. Agent asks configured check-in questions.
6. Agent captures structured answers and confirms whether follow-up is needed.
7. Call ends with a final disposition of `completed`, `callback_requested`, `escalated`, or `opted_out`.

### No answer or busy

1. Voice provider reports no answer, busy, or timeout.
2. System records the final attempt outcome.
3. Eligibility logic schedules a retry if attempts remain and the patient is still eligible.
4. Dashboard shows the missed call outcome and next retry time.

### Voicemail or answering machine

1. Provider reports voicemail or answering-machine detection.
2. Agent leaves no clinical information unless a future policy explicitly allows a safe voicemail script.
3. Call session is marked `voicemail`.
4. Retry rules determine whether another attempt should be scheduled.

### Human follow-up request

1. Patient asks for a callback or human help.
2. Agent captures the request and preferred callback window when possible.
3. System creates a non-urgent escalation or follow-up task.
4. Dashboard surfaces the task for assignment and resolution.

### Urgent symptom escalation

1. Patient reports severe, urgent, or emergency language.
2. Agent avoids diagnosis and treatment advice.
3. System creates a high-priority escalation with the triggering transcript turn.
4. Agent gives safe fallback language and routes to human follow-up or emergency guidance according to policy.

### Opt-out or withdrawn consent

1. Patient says they do not want calls or does not consent.
2. Agent confirms opt-out intent when needed.
3. System records consent status and disables future schedule eligibility.
4. Dashboard shows the opt-out state.

## Non-Goals

- Diagnosing symptoms.
- Recommending medication, dosage, treatment, or care-plan changes.
- Replacing emergency services or clinical judgment.
- Insurance, billing, claims, or payment workflows.
- Free-form medical chat outside the check-in script.
- Multilingual calls beyond configured supported languages.
- Real patient data in fixtures, tests, screenshots, or examples.

## Core Entities

- Patient: person receiving check-in calls.
- CareProgram: clinical or operational program that determines scripts and cadence.
- CheckInSchedule: cadence and eligibility rules for outbound calls.
- CallSession: lifecycle record for one call attempt.
- TranscriptTurn: ordered agent or patient utterance captured during a call.
- Escalation: human follow-up item created from risk, callback request, or unsupported request.
- User: care-team or admin user.
- Organization: tenant or operational unit for data access boundaries.

## Planned API Areas

- `/api/patients`
- `/api/care-programs`
- `/api/schedules`
- `/api/calls`
- `/api/transcripts`
- `/api/escalations`
- `/api/reports`
- `/api/webhooks/voice`
- `/api/health`

## Edge Cases To Preserve

- Multiple patient phone numbers.
- Revoked or missing consent.
- Unsupported language.
- Quiet-hours restrictions.
- Voicemail, busy, failed, and no-answer outcomes.
- Low speech-recognition confidence.
- Repeated unknown answers.
- Patient interruption while the agent speaks.
- Duplicate or out-of-order provider webhooks.
- Urgent symptoms before identity confirmation.
- Archived patient records.
