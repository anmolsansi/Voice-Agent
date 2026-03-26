# PHI-Safe Logging and Redaction Standard

Task: VA-F0-T04
Status: Sprint 1 baseline standard

## Purpose
Define the logging rules required to keep protected health information (PHI) out of routine application logs while still preserving enough operational detail for debugging, tracing, and audit support.

## Baseline Rule
**Application logs must never contain raw PHI or full patient-submitted free text by default.**

If a value could directly identify a patient or reveal health information, it must be:
- omitted,
- redacted,
- masked, or
- replaced with a low-risk surrogate summary.

## Treat as PHI / Sensitive by Default
The following must not appear in raw form in normal logs:
- first name / last name / full name
- date of birth
- phone number
- email address
- street address / city / ZIP
- chief complaint free text
- symptom descriptions / duration free text when patient-originated
- signature name
- transcript text from voice capture
- any combination of fields that reasonably identifies a patient intake session

## Safe-to-Log Categories
The following are safe to log when needed:
- internal IDs (`sessionId`, `submissionId`, `requestId`, `traceId`)
- event types / action names
- status transitions
- validation result codes
- field keys (but not raw values)
- source mode (`manual`, `voice`, `hybrid`)
- boolean flags indicating presence/absence of a value
- numeric counters / durations / latency / retry counts
- high-level error classes and sanitized error codes

## Required Logging Pattern
Prefer structured logs using key/value pairs.

### Good examples
```json
{
  "event": "field_saved",
  "sessionId": "ses_123",
  "fieldKey": "patient.firstName",
  "source": "manual",
  "valuePresent": true,
  "validationCode": "ok"
}
```

```json
{
  "event": "submission_blocked",
  "sessionId": "ses_123",
  "incompleteRequiredFields": ["consent.hipaaAcknowledgment"],
  "count": 1
}
```

### Bad examples
```json
{
  "event": "field_saved",
  "firstName": "Jane",
  "lastName": "Doe",
  "dob": "1980-02-14"
}
```

```json
{
  "event": "voice_transcript",
  "transcript": "I've had chest pain for three days"
}
```

## Redaction / Masking Rules
- names: never log raw
- DOB: never log raw
- phone: if absolutely needed for support tooling, mask all but last 2 digits; avoid in app logs
- email: mask local-part and domain where possible; avoid in app logs
- address: never log raw
- free text complaint/transcript: never log raw in app logs
- signature name: never log raw

## Validation/Error Logging Rules
Allowed:
- `fieldKey`
- validation code
- whether value was present
- whether validation blocked submission

Not allowed:
- rejected raw input value
- transcript snippets
- raw complaint text

## Voice-Specific Rules
- Do not log raw transcript text in routine logs.
- Do not log model prompts containing patient utterances in routine logs.
- If debugging extraction quality, use a separately controlled secure workflow with explicit approval and transcript minimization.
- Voice logs should prefer:
  - utterance ID
  - extraction field keys
  - confidence values
  - needsConfirmation flag
  - sanitized failure codes

## Staff / Dashboard Rules
- Staff actions may log action metadata, actor ID, session ID, and changed field keys.
- Staff correction logs must not include before/after raw PHI values in normal application logs.
- Full before/after values, if required for compliance review, belong in access-controlled audit storage, not standard logs.

## Audit vs Application Log Separation
- **Application logs**: operational, sanitized, PHI-minimized
- **Audit logs**: access-controlled records of security-relevant/user-relevant actions

Do not use application logs as a substitute for audit records.

## Implementation Standard
All logging helpers should support:
- field-value omission by default
- explicit allowlist for safe keys
- centralized redaction utility for accidental sensitive values
- standard metadata fields: `event`, `sessionId`, `requestId`, `traceId`, `actorType`, `fieldKey`, `status`, `code`

## Minimum Redaction Test Cases
- saving first name does not log the raw first name
- saving phone number does not log the raw phone number
- submission with complaint text does not log raw complaint text
- voice extraction failure does not log transcript text
- validation failure logs codes, not raw rejected values

## Definition of Done
- PHI-sensitive categories explicitly listed
- safe logging patterns defined
- forbidden logging patterns defined
- audit vs app log split defined
- implementers can build logging helpers/middleware without ambiguity
