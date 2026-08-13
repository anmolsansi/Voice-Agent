# What Is Missing Before CheckIn Care Is Client-Ready

## Purpose

This file explains the gap between the current repository and a product that a real care team can depend on.

The goal is not to create an endless wish list. The goal is to identify the capabilities that are necessary for the product to be:

- usable by a real care team,
- understandable by non-technical staff,
- safe around sensitive patient workflows,
- reliable when outside providers fail,
- secure when more than one client uses the platform,
- supportable by an engineering or operations team,
- measurable enough to know whether it is working.

The sections are ordered roughly from foundational blockers to later product improvements.

---

# 1. A single agreed product scope

## Current problem

The repository contains both a web intake product and an outbound voice check-in direction.

Both are useful, but the team needs one clear first production promise.

Without that, development can drift into unrelated features.

## What needs to be decided

For the next production milestone, the recommended core promise is:

> CheckIn Care automatically performs approved routine patient check-ins by phone, stores structured results, and routes situations that need human attention to a protected care-team workspace.

The existing web intake flow remains available but should not drive the voice milestone unless a specific client needs it.

## Why this matters

A clear scope helps answer whether a proposed feature belongs in V1.

For example:

- real outbound calling: yes,
- human escalation queue: yes,
- patient billing: no,
- insurance claims: no,
- full EHR replacement: no,
- emergency dispatch: no.

---

# 2. Organization and tenant model

## Current problem

The product does not yet have a complete, consistent organization boundary for every business record.

## What needs to be built

Create an `organizations` concept.

Every client should have its own organization.

Examples:

- `Northside Urgent Care`
- `Lakeview Family Medicine`

Then connect organization ownership to:

- users,
- patients,
- patient contacts,
- patient consent,
- care programs,
- schedules,
- call sessions,
- call attempts,
- transcripts,
- escalations,
- reports,
- settings,
- audit events.

## Why this matters

If two clinics use the same software, Clinic A must never be able to see Clinic B's patient records.

This must be enforced on the server, not only hidden in the user interface.

---

# 3. Individual user accounts and role-based permissions

## Current problem

The current shared-token model is not enough for a real client.

## What needs to be built

Each staff member should have an individual identity.

Possible roles:

- Organization Admin,
- Care Manager,
- Care Coordinator,
- Clinician,
- Read-Only Auditor.

Each role should have explicit permissions.

Example permissions:

- view patient,
- edit patient,
- create schedule,
- cancel call,
- view transcript,
- view recording,
- assign escalation,
- resolve escalation,
- export report,
- manage users,
- change safety settings,
- view audit history.

## Additional requirements

The product should support:

- secure login,
- session expiration,
- logout,
- account disable,
- password reset or a managed identity provider,
- stronger authentication for privileged users,
- login throttling,
- audit events for important access changes.

---

# 4. Canonical patient model

## Current problem

The repository has multiple patient-like representations across intake, newer voice services, and dashboard fixtures.

## What needs to be built

Choose one database-backed patient record as the source of truth.

A V1 patient record may include:

- internal patient ID,
- organization ID,
- first and last name,
- phone number,
- timezone,
- preferred language,
- active/inactive status,
- outreach eligibility,
- opt-out state,
- external client record ID,
- metadata needed for approved workflows.

Sensitive fields should only be added when the product actually needs them.

## Why this matters

A call, schedule, escalation, and report must all refer to the same patient identity.

---

# 5. Patient consent and communication preferences

## Current problem

The voice product needs a much more complete consent and opt-out model.

## What needs to be built

Store communication permissions and preference history such as:

- channel,
- consent scope,
- consent source,
- captured date/time,
- captured by whom,
- policy/disclosure version,
- revoked date/time,
- revocation source,
- temporary pause where appropriate.

The product should understand states such as:

- callable,
- temporarily paused,
- permanently opted out,
- wrong number,
- inactive patient.

## User behavior

If a patient says "stop calling me," the system should:

1. recognize the request,
2. confirm it in simple language,
3. record the opt-out,
4. stop future automated calls,
5. create an audit event,
6. surface the new status to staff.

The exact legal language and consent requirements must be reviewed for the intended geography and client workflow before production launch.

---

# 6. Canonical call model

## Current problem

The repository contains overlapping `calls`, `call_attempts`, detail tables, events, and audit concepts.

## What needs to be decided

Recommended distinction:

### Call session

The intended patient check-in.

Example:

`Weekly Diabetes Check-In for Maria on August 13`

### Call attempt

One telephone attempt made as part of that session.

Example:

- attempt 1: no answer,
- attempt 2: voicemail,
- attempt 3: completed.

## Recommended ownership

A call session owns:

- patient,
- care program version,
- schedule,
- final business outcome,
- escalation relationship,
- overall completion status.

A call attempt owns:

- provider call ID,
- attempt number,
- start/end times,
- telephony status,
- provider error,
- transcript/audio session relationship,
- attempt-specific events.

This makes retry behavior much easier to understand.

---

# 7. Database migration cleanup

## Current problem

There are duplicate migration number prefixes and overlapping data models.

## What needs to be done

Create a migration reconciliation plan.

Do not simply delete migration files that may have been used by other environments.

The plan should:

1. document every existing migration,
2. define the desired final schema,
3. map old fields/tables to new fields/tables,
4. create forward-only migration steps,
5. provide data backfill where needed,
6. validate migration on a copy of representative data,
7. define rollback or restore behavior.

---

# 8. Real telephony provider integration

## Current problem

The current sandbox provider does not make real telephone calls.

## What needs to be built

Define an application-owned provider interface such as:

- `createCall`
- `cancelCall`
- `verifyWebhook`
- `normalizeEvent`
- `getCallStatus`
- `startMediaStream` or equivalent
- `fetchRecordingMetadata` if recording is enabled

Then implement one real provider.

Keep the sandbox adapter for tests and local development.

## Required production behavior

The real adapter must handle:

- authentication to the provider,
- timeouts,
- provider errors,
- safe retries,
- rate limits,
- invalid phone numbers,
- no answer,
- busy,
- voicemail where supported,
- hangup,
- provider outage,
- webhook verification.

---

# 9. Real-time audio pipeline

## Current problem

The repository has event handlers but not the complete production audio path.

## What needs to be built

The end-to-end path is roughly:

```text
Telephone audio
   -> speech recognition
   -> normalized patient utterance
   -> safety checks
   -> workflow / conversation logic
   -> structured AI interpretation where needed
   -> approved response
   -> speech synthesis
   -> telephone audio
```

## Required conversation behaviors

The voice runtime should handle:

- patient interruption,
- silence,
- background noise,
- repeated misunderstanding,
- partial transcript changes,
- low-confidence transcription,
- hangup during a question,
- network delay,
- provider disconnect,
- patient asks to repeat,
- patient asks to call back later,
- wrong person answers,
- patient asks for a human,
- patient opts out.

---

# 10. Care program engine

## Current problem

The product has call scenarios in documentation but not yet a complete client-configurable care-program model.

## What needs to be built

A care program should define:

- name,
- purpose,
- active version,
- patient eligibility,
- schedule pattern,
- call window,
- questions,
- branching rules,
- retry policy,
- escalation rules,
- completion rules,
- assigned team,
- allowed language/voice configuration.

## Versioning

Every published change creates a new version.

Every call records the version it used.

This prevents history from changing when an administrator edits the program later.

---

# 11. Check-in builder

## Current problem

Changing the patient conversation should not require changing source code for every client.

## What needs to be built

Provide an admin-facing builder for controlled question flows.

Question types could include:

- yes/no,
- multiple choice,
- number,
- short text,
- open voice answer,
- rating scale.

Rules could include:

`If patient requests callback -> create routine follow-up escalation`

or

`If approved urgent symptom rule triggers -> stop normal flow and create urgent escalation`

The builder must remain controlled. It should not turn into unrestricted prompt editing by every user.

---

# 12. Safety policy engine

## Current problem

Simple phrase matching is not enough for a production safety model.

## What needs to be built

A safety policy should define categories such as:

- urgent symptom signal,
- medication concern,
- fall/injury concern,
- breathing concern,
- severe pain language,
- confusion,
- mental-health distress where in scope,
- unsupported medical question,
- human requested,
- wrong person,
- unclear identity,
- repeated AI uncertainty.

For every category, define one of a small number of application actions:

- continue,
- clarify,
- create routine review,
- create urgent escalation,
- stop autonomous flow.

## Critical rule

The AI may help classify language, but the application owns the final allowed actions.

---

# 13. Confidence-aware AI behavior

## Current problem

AI output can be uncertain or wrong.

## What needs to be built

Important extracted fields should include a confidence or uncertainty mechanism.

Example:

```json
{
  "callback_requested": true,
  "confidence": 0.72
}
```

Then the application can decide:

- accept high-confidence routine information,
- ask the patient to confirm medium-confidence information,
- route low-confidence important information for human review.

The exact thresholds must be based on evaluation results rather than guessed once and forgotten.

---

# 14. Human escalation system

## Current problem

This is one of the largest product gaps.

## What needs to be built

An escalation should contain:

- patient,
- organization,
- source call,
- reason,
- priority,
- status,
- supporting transcript evidence,
- structured summary,
- rule or model evidence,
- created time,
- assignee,
- acknowledgment time,
- due time if the clinic uses one,
- resolution,
- resolution notes,
- resolved by,
- resolved time.

## Suggested lifecycle

```text
Open
 -> Acknowledged
 -> Assigned
 -> In Progress
 -> Resolved
```

Alternative terminal outcomes can include:

- dismissed with reason,
- duplicate,
- unable to reach,
- transferred to another workflow.

Important: no critical item should disappear simply because a screen was refreshed or a background worker restarted.

---

# 15. Care-team Today queue

## Current problem

The current dashboard is not yet a complete operational workspace.

## What needs to be built

The main screen should prioritize work instead of only showing statistics.

Suggested groups:

### Urgent review

Patients who need immediate human attention according to the organization's approved workflow.

### Routine follow-up

Patients who requested a callback or need staff review.

### Retry exhausted

Patients who could not be reached within the configured retry policy.

### Upcoming

Scheduled calls that will happen soon.

### System problems

Calls blocked because of configuration, provider, consent, or data issues.

---

# 16. Patient 360 page

## Current problem

Staff should not have to visit several disconnected pages to understand one patient.

## What needs to be built

One patient page should show:

- identity/contact summary,
- current communication status,
- consent/opt-out state,
- active care programs,
- next scheduled check-in,
- recent call history,
- active escalations,
- prior resolved escalations,
- recent structured outcomes,
- patient timeline.

Only show fields the user's role is allowed to see.

---

# 17. Complete call detail page

## What needs to be added

The call detail page should show:

- call session,
- individual attempts,
- telephony status,
- provider identifiers for authorized technical users,
- duration,
- program version,
- transcript,
- structured answers,
- safety signals,
- escalation link,
- event timeline,
- recording access if enabled and authorized,
- relevant audit history.

The page should clearly explain failure states instead of displaying raw provider codes to ordinary care-team users.

---

# 18. DTMF fallback

DTMF means the phone keypad tones produced when a caller presses numbers.

## Why it is useful

Voice recognition can fail because of:

- noise,
- accents,
- poor cellular connection,
- microphones,
- speech impairment,
- provider quality.

For simple questions, the call can offer:

> Say yes, or press 1.

Use keypad fallback for narrow actions such as:

- yes/no,
- identity confirmation where appropriate,
- callback request,
- opt-out confirmation.

---

# 19. Call-me-later workflow

## Current problem

A patient should not be forced to either complete the entire call immediately or become a failed call.

## What needs to be built

The patient should be able to say:

- call me in an hour,
- call this afternoon,
- call tomorrow,
- I want a human callback instead.

The system then creates a real scheduling outcome and respects call windows and retry rules.

---

# 20. Client onboarding

## Current problem

The product does not yet provide a complete self-service or guided client setup experience.

## What needs to be built

A first client should be guided through:

1. organization creation,
2. team invitations,
3. roles,
4. calling hours,
5. escalation contacts,
6. care program selection/setup,
7. patient import,
8. consent validation,
9. test calls,
10. launch approval.

The setup should show progress and block launch when a required item is missing.

---

# 21. Patient import

## Recommended V1

Start with a high-quality CSV import rather than immediately building many EHR integrations.

CSV means comma-separated values, a common spreadsheet export format.

## Required import behavior

The user should see:

- number of rows,
- valid rows,
- invalid rows,
- duplicates,
- missing required fields,
- invalid phone numbers,
- timezone problems,
- consent/eligibility problems.

Allow correction before final import.

Imports should be organization-scoped and audited.

---

# 22. Client settings

## What needs to be configurable without code changes

- organization name and approved branding,
- timezone,
- call windows,
- holiday/closed-day behavior,
- retry rules,
- outbound caller configuration,
- care programs,
- escalation contacts,
- recording policy,
- transcript policy,
- retention policy,
- user roles,
- voice/language options that have been approved.

Environment variables should hold secrets and deployment configuration, not ordinary client business settings.

---

# 23. Audit trail

## Current problem

Audit groundwork exists but the production audit product is incomplete.

## What needs to be recorded

Examples:

- patient viewed,
- patient updated,
- transcript viewed,
- recording viewed,
- call manually scheduled,
- call canceled,
- escalation assigned,
- escalation resolved,
- patient opted out,
- report exported,
- user invited,
- role changed,
- sensitive setting changed.

The audit record should include:

- actor,
- action,
- resource,
- time,
- organization,
- correlation identifier,
- safe metadata.

Audit records should be protected from ordinary editing or deletion.

---

# 24. Data retention and deletion

## Current problem

Different kinds of information should not be kept forever by default.

## What needs to be built

Separate retention policies for:

- recordings,
- transcripts,
- structured patient outcomes,
- audit events,
- operational logs,
- exports,
- backups.

The product needs scheduled retention jobs and proof that deletion occurred according to policy.

Exact periods must be decided with the client and applicable legal/compliance guidance.

---

# 25. Privacy-safe logging

## What needs to be enforced

Application logs should not contain raw:

- transcript text,
- phone numbers,
- date of birth,
- medication details,
- recording URLs,
- other unnecessary patient identifiers.

Instead, logs should use internal IDs, safe error codes, status values, durations, and correlation IDs.

A correlation ID is a unique identifier used to connect related technical events without exposing the patient's information.

---

# 26. Provider failure handling

## What needs to be defined for every external service

For telephony, speech, AI, email, storage, or any future integration:

- timeout,
- retry behavior,
- maximum retry count,
- whether retry is safe,
- what user sees,
- what staff sees,
- what gets logged,
- whether an escalation is required,
- how the system recovers after the provider becomes healthy.

---

# 27. AI degradation mode

## Current problem

The product should not become unsafe or completely unusable because one AI provider is unavailable.

## Recommended behavior

For supported programs, design a simpler deterministic fallback where possible.

Example:

- play approved fixed questions,
- accept keypad/simple responses,
- avoid complex interpretation,
- mark the result for human review.

Not every workflow can degrade this way, but each workflow should have a defined failure policy.

---

# 28. Webhook hardening

## Required behavior

Every real provider webhook should:

1. verify the provider signature,
2. reject forged events,
3. deduplicate repeated events,
4. store a safe durable event record,
5. respond quickly,
6. move expensive processing to background work where appropriate,
7. enforce allowed state transitions,
8. tolerate out-of-order events.

---

# 29. Background-job reliability

## What needs to be built

Jobs should support:

- locking or equivalent duplicate-worker protection,
- idempotency,
- retry policies,
- dead-letter or failed-job visibility,
- run identifiers,
- start/end timestamps,
- processed/skipped/failed counts,
- crash recovery.

A dead-letter queue or failed-job store is a place where repeatedly failing work is kept so an operator can investigate it instead of losing it.

---

# 30. Monitoring and alerting

## Current problem

A production system needs to tell the team when it is unhealthy.

## What needs to be measured

Technical health:

- API errors,
- API latency,
- database health,
- job queue delay,
- webhook failure,
- provider failure,
- speech/AI failure.

Voice quality:

- answer rate,
- call connection failure,
- transcription latency,
- response latency,
- repeated clarification,
- interrupted calls.

Care operations:

- scheduled calls,
- completed check-ins,
- retries exhausted,
- open escalations,
- escalation age,
- time to acknowledgment,
- time to resolution.

---

# 31. Service-level objectives

A service-level objective, or SLO, is a measurable target for reliability.

Examples to validate during pilot:

- API availability target,
- webhook processing success target,
- duplicate-call maximum rate,
- escalation delivery success target,
- dashboard response-time target.

The exact numbers should be based on the real pilot and client expectations.

---

# 32. Testing program

The production product needs multiple layers of tests.

### Unit tests

Test individual business rules.

### Database integration tests

Test real PostgreSQL behavior, transactions, relationships, and tenant isolation.

### API tests

Test authenticated routes, validation, permissions, and errors.

### Voice scenario tests

Run deterministic patient scenarios against the conversation/safety engine.

### End-to-end tests

Test complete journeys such as:

patient imported -> scheduled -> call attempted -> result saved -> escalation created -> staff resolves.

### Security tests

Test cross-organization access, forged webhooks, role escalation, export leakage, session tampering, prompt injection, and sensitive logs.

---

# 33. Continuous integration and deployment

## What needs to be added

Every change should automatically run checks before merge.

At minimum:

- dependency installation,
- linting,
- type checking,
- unit tests,
- integration tests,
- build,
- security checks.

Production should be deployed through a defined pipeline, not directly from a developer laptop.

---

# 34. Staging environment

A staging environment is a deployed copy of the application used for final testing before production.

It should use safe test data and test provider configuration where possible.

The team should test migrations, UI, jobs, provider callbacks, and release smoke checks there first.

---

# 35. Backup and recovery

## What needs to be built and tested

- automated database backups,
- restore instructions,
- actual restore tests,
- recovery-time objective,
- recovery-point objective,
- provider outage runbook,
- database outage runbook,
- credential compromise runbook.

A backup that has never been restored is only a hope, not a proven recovery system.

---

# 36. Feature flags

A feature flag is a switch that lets the team enable or disable functionality without immediately removing code.

Useful flags include:

- real outbound calling,
- call recording,
- new AI model,
- new safety model,
- new care program version,
- new client organization.

Flags make staged rollout and emergency rollback safer.

---

# 37. Operational analytics

## What clients are likely to care about

Outreach:

- scheduled,
- attempted,
- reached,
- completed,
- no answer,
- voicemail,
- retry exhausted.

Follow-up:

- escalations created,
- escalation reasons,
- acknowledgment time,
- resolution time.

Patient experience:

- opt-out rate,
- average call duration,
- abandoned calls,
- clarification rate.

AI/system quality:

- low-confidence results,
- fallback usage,
- human corrections,
- safety-rule triggers.

Cost:

- telephony cost,
- AI cost,
- cost per completed check-in.

---

# 38. AI evaluation suite

## What needs to be tested before prompt/model changes

Create a fixed set of scenarios such as:

- routine healthy response,
- callback request,
- patient asks for medical advice,
- urgent symptom language,
- wrong person answers,
- patient opts out,
- patient changes an answer,
- transcription is uncertain,
- provider disconnects,
- model returns malformed output.

Measure:

- correct intent,
- correct state transition,
- correct escalation,
- structured field accuracy,
- unsafe advice rate,
- latency.

A prompt change should not ship only because it sounded good in a few manual calls.

---

# 39. Human quality review

The product should support sampling calls for review.

Example policy:

- review a random sample of routine calls,
- review all urgent escalations,
- review all low-confidence calls,
- review all safety-rule triggers during early pilot.

Reviewers can classify issues such as:

- summary inaccurate,
- concern missed,
- false escalation,
- poor conversation quality,
- workflow configuration issue.

---

# 40. Client security and operations documentation

Before serious client sales, prepare documents explaining:

- system architecture,
- data flow,
- access control,
- encryption approach,
- incident response,
- backup and recovery,
- retention,
- vulnerability management,
- development/release process,
- subprocessors,
- support access.

These documents do not replace legal or compliance review, but clients will expect clear answers.

---

# 41. Support model

## What needs to be decided

- how a client reports a problem,
- who receives production alerts,
- severity levels,
- expected response windows,
- how emergency product shutdown works,
- how support personnel request temporary access,
- how support access is audited.

A client-ready product needs an operating model, not only code.

---

# 42. What should not be added yet

The following can wait unless a paying client proves the need:

- Kubernetes,
- Kafka,
- many independent microservices,
- native mobile apps,
- custom speech models,
- model fine-tuning,
- dozens of EHR integrations,
- insurance/billing workflows,
- advanced autonomous agents,
- many languages before the first language is reliable.

The project currently needs completeness more than architectural novelty.

---

# 43. Priority summary

## P0: blocks a real client pilot

- freeze product scope,
- organization model,
- canonical patient model,
- canonical call model,
- database reconciliation,
- individual auth and roles,
- protect every sensitive API,
- consent/opt-out model,
- real telephony provider,
- real-time voice pipeline,
- safety policy,
- human escalation workflow,
- real dashboard data,
- minimum tests,
- CI,
- staging,
- monitoring,
- backups,
- launch runbook.

## P1: makes the product highly usable

- care programs,
- check-in builder,
- Patient 360,
- Today queue,
- call detail improvements,
- DTMF fallback,
- call-me-later,
- CSV import,
- client settings,
- analytics,
- audit search,
- AI evaluation tools.

## P2: expands the product after the core is proven

- external APIs/webhooks for clients,
- FHIR integration,
- selected EHR integrations,
- additional languages,
- advanced analytics,
- more care-program templates,
- enterprise identity integrations.

---

# 44. Final message

The project does not need hundreds of random new features.

It needs the current pieces turned into one coherent product.

The most important work is to connect the full path:

```text
Client configuration
-> Patient eligibility
-> Schedule
-> Real call
-> Controlled voice workflow
-> Structured result
-> Safety decision
-> Human escalation when needed
-> Staff resolution
-> Audit history
-> Analytics
```

When that path is reliable, protected, tested, observable, and easy for a care team to use, CheckIn Care becomes a real product rather than a collection of promising components.
