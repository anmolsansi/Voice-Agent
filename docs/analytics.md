# Voice Agent Analytics Contracts

This document defines the reporting event contract used by the Voice Agent analytics dashboard and report APIs.

## Event Schema

Each analytics event uses this shape:

| Field | Description |
| --- | --- |
| `eventId` | Stable idempotency key. Duplicate event ids are ignored. |
| `type` | One of the supported event types below. |
| `patientId` | Patient record associated with the event. |
| `callSessionId` | Call session id when the event belongs to a call. |
| `scheduleId` | Schedule id when the event came from scheduled outreach. |
| `timestamp` | ISO timestamp in UTC. |
| `metadata` | Event-specific details such as attempt number, disposition, duration, or escalation priority. |
| `source` | Producing subsystem, such as `scheduler`, `voice_provider`, `voice_runtime`, or `care_operations`. |

Supported event types:

- `call_scheduled`
- `call_dialed`
- `call_answered`
- `check_in_completed`
- `call_no_answer`
- `call_voicemail`
- `call_failed`
- `call_escalated`
- `guardrail_hit`
- `callback_requested`
- `patient_opted_out`

## Metric Definitions

| Metric | Formula |
| --- | --- |
| Completion rate | `check_in_completed / call_dialed` |
| Contact rate | `call_answered / call_dialed` |
| Escalation rate | `unique escalated call sessions / call_dialed` |
| Average call duration | `sum(durationSeconds) / calls with measurable duration` |
| No-answer rate | `call_no_answer / call_dialed` |
| Guardrail rate | `unique guardrail-hit call sessions / call_dialed` |

All percentages return `0%` when the denominator is zero.

## Aggregation Contract

Reporting aggregations accept:

- `range`: `7d`, `30d`, or `all`.
- `program`: care program id or `all`.
- `owner`: assigned staff user id or `all`.
- `status`: call disposition or `all`.
- `risk`: patient risk level or `all`.
- `timeZone`: IANA time zone. Current local fixture reporting stores event timestamps in UTC and returns ISO date buckets.

Reporting responses include:

- `metadata`: generated timestamp, request filters, row count, schema version, and redaction policy.
- `metrics`: totals and rates.
- `trends`: daily call outcome buckets.
- `breakdowns`: care program, outcome, and risk-level summaries.
- `escalationSummary`: open, urgent, and owner-level escalation counts.
- `rows`: exportable call outcome rows with PHI-safe redactions.

## Edge Cases

- Duplicate provider events are deduped by `eventId`; when `eventId` is missing, the fallback key is `source:type:patientId:callSessionId:scheduleId:timestamp`.
- Calls crossing midnight are bucketed by the event or call start timestamp in UTC.
- Archived patients remain reportable for historical calls, but filters still use the patient record attached to the event.
- Partial day reporting uses inclusive UTC timestamps from the selected range.
- Unknown filter values produce an empty report rather than a server error, except unsupported `range` values in API requests, which return `400`.
