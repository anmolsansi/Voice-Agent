# System Architecture Explained in Plain Language

## Purpose

This file explains how CheckIn Care should be organized internally.

The word **architecture** means the high-level structure of a software system: which major pieces exist, what each piece is responsible for, how they communicate, and where important information is stored.

Good architecture is not about using the largest number of technologies. It is about making the product understandable, reliable, secure, and changeable.

The recommended direction is to keep the current application and repair it into a clean **modular monolith plus worker** rather than rewrite it into many independent services.

A modular monolith means one main backend application that is divided internally into clear business modules. A worker is a background process that performs scheduled or asynchronous work such as finding due patient calls.

---

# 1. The system at a glance

```text
Patient / Care Team / Administrator
              |
              v
         Web Application
              |
              v
        Backend Application
              |
   +----------+----------+------------------+
   |          |          |                  |
   v          v          v                  v
Database   Job Worker  Telephony         Voice/AI
                         Provider          Provider
   |          |          |                  |
   +----------+----------+------------------+
              |
              v
     Audit, Metrics, Monitoring
```

Every box exists for a specific reason.

---

# 2. Web application

## What it is

The web application is what patients and staff see in their browser.

The current project uses Next.js and React.

## What it should own

The browser should own presentation and user interaction, such as:

- forms,
- tables,
- buttons,
- loading states,
- confirmation dialogs,
- navigation,
- displaying errors in human language.

## What it should not own

The browser should not be trusted to enforce security or important business rules.

For example, hiding an "Export" button from a care coordinator is useful, but the backend must also reject an export request from that user.

A technically skilled user can send requests directly to the backend without using the visible screen.

---

# 3. Backend application

## What it is

The backend is the server-side application under the `src/` area of the repository.

It receives requests, checks identity and permissions, validates data, performs business rules, talks to the database and external providers, and returns results.

## Why it is the source of business truth

Important rules belong here because the backend can enforce them consistently regardless of whether a request came from:

- the main web interface,
- a future mobile interface,
- a client integration,
- a background job,
- an internal admin tool.

---

# 4. Recommended backend modules

The existing code should be reorganized over time around these responsibilities.

## Identity module

Owns:

- users,
- login sessions,
- account state,
- roles,
- permission checks.

It answers:

- Who is this user?
- Is the account active?
- What organization do they belong to?
- What are they allowed to do?

## Organizations module

Owns client organizations.

Examples:

- Northside Urgent Care,
- Lakeview Family Medicine.

It owns:

- organization identity,
- organization-level settings,
- organization status,
- feature availability.

## Patients module

Owns the canonical patient record.

It should not create a second patient store just for voice.

It owns:

- patient identity,
- contact information needed by the product,
- active/inactive state,
- organization ownership,
- communication eligibility,
- external client identifiers.

## Consent module

Owns patient communication permissions and opt-out history.

It answers:

- May this patient be contacted by this channel under the configured workflow?
- When was consent captured?
- Was it revoked?
- Did the patient report a wrong number?

## Care Programs module

Owns approved check-in workflows and versions.

It defines:

- questions,
- timing,
- branching rules,
- escalation rules,
- retry policy,
- completion criteria.

## Scheduling module

Owns when a patient should receive a check-in.

It considers:

- program cadence,
- patient timezone,
- call window,
- active status,
- opt-out,
- previous attempts,
- reschedule requests.

## Calls module

Owns the business lifecycle of check-ins and telephone attempts.

Recommended model:

- `call_session`: the intended patient check-in,
- `call_attempt`: one telephone attempt.

It should own:

- states,
- final outcomes,
- attempt counts,
- provider identifiers,
- retry relationships,
- call detail references.

## Telephony module

Owns communication with the telephone provider.

It should hide provider-specific details from the rest of the product.

The rest of the application should ask:

`Create an outbound call for this approved call attempt.`

It should not need to understand every provider-specific field.

## Voice Runtime module

Owns the live conversation mechanics.

It receives speech-related events and produces approved voice responses.

It coordinates:

- speech recognition,
- conversation state,
- approved AI interpretation,
- response generation,
- speech synthesis,
- interruption handling.

## Safety module

Owns safety-policy evaluation.

It should be separate from the language model so important rules can be tested and controlled.

It decides application actions such as:

- continue,
- clarify,
- request human review,
- create urgent escalation,
- stop autonomous flow.

## Escalations module

Owns human follow-up tasks.

It manages:

- creation,
- priority,
- assignment,
- acknowledgment,
- resolution,
- evidence,
- audit history.

## Reporting module

Owns metric definitions and report queries.

It should calculate the same metric the same way everywhere.

## Audit module

Owns security and important business history.

It records who performed important actions and when.

## Integrations module

Owns client-facing import/export/integration behavior.

Initial responsibilities may include:

- CSV import,
- client webhooks,
- future FHIR/EHR integration.

## Operations module

Owns system health information that helps the team run the product.

It may expose:

- dependency health,
- worker status,
- queue lag,
- provider health,
- deployment version.

---

# 5. Database architecture

## Why one database is enough for V1

The product does not currently need many independent databases.

One well-managed PostgreSQL database is simpler to operate and can safely support the first product milestones.

The important part is schema quality and organization isolation, not database quantity.

---

# 6. Recommended core data relationships

```text
Organization
  |
  +-- Users
  |
  +-- Patients
  |     |
  |     +-- Consent records
  |     +-- Program enrollments
  |     +-- Schedules
  |     +-- Call sessions
  |             |
  |             +-- Call attempts
  |             +-- Call events
  |             +-- Transcript turns
  |             +-- Structured answers
  |             +-- Escalations
  |
  +-- Care Programs
  |       |
  |       +-- Program Versions
  |
  +-- Organization Settings
  |
  +-- Audit Events
```

This structure makes ownership understandable.

---

# 7. Organization ownership

Every important business table should carry or be able to derive an `organization_id`.

This prevents accidental cross-client access.

Example backend query concept:

```text
Find patient where:
patient.id = requested patient
AND patient.organization_id = current user's organization
```

Do not fetch by patient ID first and check ownership only in the browser.

---

# 8. Call session versus call attempt

This distinction should be frozen before more call code is added.

## Call session

Represents the desired check-in.

Example:

`Maria's August 13 post-urgent-care check-in`

It has one final business outcome.

## Call attempt

Represents one telephone attempt.

Example:

```text
Session 1007
  attempt 1 -> no answer
  attempt 2 -> busy
  attempt 3 -> completed
```

Why this is better:

- retries are easy to understand,
- analytics can distinguish patients from attempts,
- provider identifiers belong to attempts,
- the business outcome belongs to the session.

---

# 9. State machines

A **state machine** is a defined list of statuses and which changes are allowed between them.

For a call attempt, a simplified example could be:

```text
Queued
  -> Starting
  -> Ringing
  -> In Progress
  -> Finalizing
  -> Completed
```

Failure paths may include:

```text
Queued -> Failed
Starting -> Failed
Ringing -> No Answer
Ringing -> Busy
In Progress -> Disconnected
```

Once a state is terminal, an old delayed event must not move it backward.

The exact state list should be defined in one central place and reused by API, worker, webhook, and tests.

---

# 10. Background worker

## Why we need it

The web server should not depend on a person clicking a button every minute to place scheduled calls.

A worker performs background work.

Typical cycle:

1. find due schedules,
2. claim the work so another worker does not claim the same schedule,
3. verify patient eligibility,
4. create call session/attempt if needed,
5. ask telephony adapter to start the call,
6. record result,
7. schedule future retry or next normal check-in.

## Worker safety requirements

- idempotency,
- locking or equivalent concurrency control,
- bounded retries,
- failed-job visibility,
- run identifiers,
- metrics,
- crash recovery.

---

# 11. Telephony provider adapter

A provider adapter is a translation layer between CheckIn Care and the chosen telephone vendor.

Recommended application interface:

```text
createOutboundCall(attempt)
cancelCall(providerCallId)
verifyWebhook(request)
normalizeWebhook(request)
getProviderCall(providerCallId)
```

If media streaming is used:

```text
startMediaSession(...)
stopMediaSession(...)
```

Why an adapter matters:

Provider-specific details stay in one place. If the provider changes later, the product does not need to rewrite scheduling, patient, escalation, and reporting logic.

---

# 12. Webhook architecture

A webhook should not directly perform a large amount of work before responding.

Recommended flow:

```text
Provider sends webhook
       |
       v
Verify provider signature
       |
       v
Parse and normalize event
       |
       v
Check duplicate event ID
       |
       v
Persist safe event record
       |
       v
Return success quickly
       |
       v
Process heavier follow-up in worker if needed
```

This makes retries safer and reduces provider timeout problems.

---

# 13. Real-time voice architecture

There are two broad implementation options.

## Option A: one real-time speech-to-speech provider

One provider may handle much of:

- receiving audio,
- speech recognition,
- language reasoning,
- speech generation.

### Advantages

- fewer moving pieces,
- potentially lower conversational latency,
- faster first implementation.

### Risks

- stronger provider dependency,
- provider behavior may be less transparent,
- safety and structured-state boundaries must still remain application-owned.

## Option B: separate STT + LLM + TTS

STT means speech-to-text.

LLM means large language model, the AI component that interprets/generates language.

TTS means text-to-speech.

### Advantages

- each provider can be chosen separately,
- easier to replace one layer,
- potentially more control.

### Risks

- more integration work,
- more network calls,
- higher latency,
- more failure combinations.

## Recommended V1 principle

Choose the simpler reliable option for the first provider, but keep CheckIn Care's business state outside the provider.

The provider must never become the only place that knows:

- whether the patient opted out,
- whether an escalation exists,
- whether the call is complete,
- which program version was used.

---

# 14. Conversation workflow engine

The conversation should follow a controlled program.

Example:

```text
START
  |
  v
INTRODUCTION
  |
  v
AVAILABILITY CHECK
  | yes
  v
QUESTION 1
  |
  v
QUESTION 2
  |
  +--> safety trigger -> ESCALATION PATH
  |
  v
SUMMARY / CLOSING
  |
  v
COMPLETE
```

AI can make transitions sound natural, but it should not invent an entirely different workflow.

---

# 15. Safety pipeline

Recommended order:

```text
Patient utterance
      |
      v
High-priority deterministic checks
      |
      v
Structured interpretation
      |
      v
Schema validation
      |
      v
Safety policy
      |
      v
Conversation action
      |
      v
Response safety check
      |
      v
Speak response
```

A **schema** is the expected structure of data.

For example, if an AI classifier is supposed to return:

```text
intent = callback_request
confidence = 0.90
```

then the backend should reject unrelated or malformed output.

---

# 16. Escalation architecture

Escalations must be durable database records.

Do not treat an escalation only as:

- a log message,
- a temporary popup,
- an email that may fail.

The database record remains the source of truth.

Notifications are delivery methods attached to that record.

If email, SMS, or another notification fails, the escalation still exists and remains open.

---

# 17. Event architecture

An event is a record that something happened.

Examples:

- call requested,
- call answered,
- transcript turn created,
- patient opted out,
- escalation created,
- escalation resolved.

For V1, we do not need a complex event-streaming platform such as Kafka.

We can record durable events in PostgreSQL and use application jobs/queues where needed.

If scale later demands more advanced infrastructure, it can be added based on measured need.

---

# 18. Audit architecture

Audit events are different from ordinary technical logs.

Technical logs help engineers diagnose software.

Audit events prove important user/business actions.

Example audit event:

```text
Actor: user_214
Organization: org_10
Action: ESCALATION_RESOLVED
Resource: escalation_984
Time: 2026-08-13T12:40:02Z
Reason: routine callback completed
```

The audit system should be append-oriented and protected from ordinary editing.

---

# 19. Logging architecture

Logs should include safe technical information:

- request ID,
- call session ID,
- call attempt ID,
- provider event ID,
- status,
- duration,
- retry count,
- safe error code.

Logs should not include raw:

- patient phone numbers,
- transcript text,
- date of birth,
- medication details,
- recording URLs.

---

# 20. Correlation identifiers

A correlation identifier helps connect related activity across systems.

Example:

```text
request_id: req_123
job_run_id: job_456
call_session_id: cs_789
call_attempt_id: ca_790
provider_call_id: provider_abc
```

When something breaks, engineers can follow the chain without searching by patient-sensitive information.

---

# 21. API design

A production API should use consistent resource names and error formats.

Recommended route family:

```text
/api/v1/organizations
/api/v1/users
/api/v1/patients
/api/v1/care-programs
/api/v1/checkin-schedules
/api/v1/call-sessions
/api/v1/escalations
/api/v1/reports
/api/v1/audit-events
```

Not every internal provider webhook must follow the same public structure, but client/business APIs should be predictable.

---

# 22. Error design

A technical error should have a stable code.

Example:

```json
{
  "error": {
    "code": "PATIENT_NOT_CALLABLE",
    "message": "This patient cannot be scheduled for an automated call."
  }
}
```

The code helps the application react consistently.

The message helps humans understand the problem.

Do not expose sensitive stack traces to ordinary users.

---

# 23. File and recording storage

If recordings are enabled, do not store large audio files directly in ordinary database rows.

Use secure object storage.

The database stores metadata such as:

- storage reference,
- provider reference,
- created time,
- retention date,
- access status.

Access should use short-lived authorization rather than permanent public URLs.

If recording is not necessary for the first client, leave it disabled by default.

---

# 24. Configuration architecture

Separate two kinds of configuration.

## Deployment secrets

Examples:

- provider API secret,
- encryption key,
- database password.

These belong in a secret-management system, not the client UI.

## Client business settings

Examples:

- calling hours,
- retry count,
- escalation contacts,
- program configuration.

These belong in the database and should be manageable through the application with permissions and audit events.

---

# 25. Feature flags

A feature flag lets the team turn a feature on or off for a controlled group.

Examples:

- real calling enabled for Organization A,
- new voice provider enabled for test organization only,
- recording disabled for all clients,
- new dashboard enabled for internal testing.

Feature flags reduce launch risk.

---

# 26. Deployment architecture

Recommended environments:

## Local

Developer machine with sandbox providers and synthetic data.

## Test/CI

Automated tests with isolated test database and provider mocks.

## Staging

A deployed environment that behaves like production but uses safe test data and controlled provider configuration.

## Production

Real client environment with production secrets, monitoring, backups, and strict access.

Avoid using production patient information in local development.

---

# 27. Why we should not split into microservices yet

A microservice is a separately deployed service with its own network boundary.

Examples could be separate patient, call, escalation, and reporting services.

That sounds sophisticated but creates extra work:

- service authentication,
- network failures,
- distributed tracing,
- deployment coordination,
- cross-service transactions,
- more infrastructure.

The current team and product do not yet have evidence that these costs are justified.

Clear internal modules provide most of the organizational benefit for V1.

---

# 28. Migration from current repository to target architecture

Do not rewrite everything at once.

Recommended sequence:

1. document current models,
2. choose canonical organization/patient/call/audit models,
3. create forward migrations,
4. add compatibility code where needed,
5. route new development through canonical modules,
6. move dashboard reads from fixtures to real APIs,
7. connect real telephony adapter,
8. connect voice runtime,
9. build escalation workflow,
10. retire duplicate/unused paths after migration and tests.

---

# 29. Architecture rules for future engineers

1. Do not create another patient store.
2. Do not create another call table without architecture approval.
3. Do not put client business settings only in environment variables.
4. Do not trust browser permission checks.
5. Do not let provider-specific state become application truth.
6. Do not make important actions depend only on logs or notifications.
7. Do not log raw patient-sensitive content.
8. Do not call an external provider without timeout/failure behavior.
9. Do not create a scheduled action without idempotency.
10. Do not let AI output directly mutate critical business state without validation and policy checks.

---

# 30. Architecture success test

The architecture is good when a new intern can trace this journey without guessing:

```text
Patient imported
-> patient enrolled in program
-> schedule becomes due
-> worker creates call session/attempt
-> telephony provider places call
-> voice runtime conducts controlled conversation
-> structured result saved
-> safety policy evaluated
-> escalation created if needed
-> care-team user reviews it
-> resolution saved
-> audit event written
-> analytics updated
```

Every arrow should have one clear owner, one clear data contract, and defined failure behavior.
