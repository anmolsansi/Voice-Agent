# CheckIn Care Glossary

## Purpose

This glossary explains words used in CheckIn Care documentation, tickets, code reviews, architecture discussions, and client conversations.

The goal is to make sure a new intern, non-technical stakeholder, or school-going student does not have to guess what a technical term means.

The definitions are intentionally practical and tied to this project.

---

# A

## Access control

Rules that decide who can see or change information.

Example: a care coordinator may be allowed to view a patient but not manage organization users.

## API

API stands for **Application Programming Interface**.

An API is a defined way for one piece of software to ask another piece of software to do something or return information.

Example:

`GET /api/v1/patients/123`

may ask the backend for patient 123.

## API endpoint

One specific API address and action.

Example:

`POST /api/v1/escalations/123/resolve`

may represent resolving escalation 123.

## Application server

The backend process that receives requests, applies business rules, talks to the database/providers, and returns results.

## Audit event

A durable record that an important action occurred.

Example:

`Care Coordinator Jordan resolved escalation 584 at 2:14 PM.`

Audit events are different from ordinary technical logs because they are intended to preserve important business/security history.

## Authentication

The process of proving who a user is.

Example: logging in with an individual account.

## Authorization

The process of deciding what an authenticated user is allowed to do.

A user can be authenticated but still not authorized to export patient data.

---

# B

## Backend

The part of the application that runs on servers rather than in the user's browser.

It handles business logic, permissions, database operations, providers, jobs, and other protected behavior.

## Background job

Work performed by the system without a user waiting on a screen for it to finish.

Example: finding all patient check-ins that are due and creating call attempts.

## Barge-in

Voice-call behavior where the patient starts speaking while the automated system is still talking, and the system stops or reduces its speech so it can listen.

## BAA

BAA commonly means **Business Associate Agreement** in U.S. healthcare privacy contexts.

Whether a BAA is required for a specific client/vendor relationship is a legal/compliance question, not something the codebase can decide by itself.

## Backup

A separate copy of data used for recovery if the main data is lost or damaged.

A backup is only useful if the team has also proved it can restore it.

## Branch

A separate line of development in Git.

A branch lets engineers make changes without immediately changing the main production code line.

---

# C

## Call attempt

One telephone attempt made as part of a patient check-in.

Example:

- attempt 1: no answer,
- attempt 2: busy,
- attempt 3: completed.

## Call session

The overall intended patient check-in, which may require several call attempts.

A call session should normally have one final business outcome.

## Call window

The period during which the system is allowed to call a patient.

Example: weekdays between 9:00 AM and 6:00 PM in the patient's timezone.

## Care program

A versioned definition of a patient check-in workflow.

It can include:

- questions,
- schedule,
- retry policy,
- escalation rules,
- completion rules.

## CI

CI stands for **Continuous Integration**.

It is an automated process that checks code changes before they are merged.

Typical CI checks include tests, linting, type checking, building, and security scans.

## Client

In these documents, a client usually means a healthcare organization that uses CheckIn Care.

Example: an urgent-care clinic.

## Client-ready

Ready for an external organization to use without depending on the engineer who wrote the code for ordinary daily operations.

Client-ready also requires security, failure handling, testing, monitoring, support, and operational procedures.

## Clinical decision support

Software that provides information or recommendations intended to support clinical decisions.

This can create additional safety, validation, legal, and regulatory responsibilities. It is outside the recommended first CheckIn Care voice-agent scope.

## Commit

A saved set of changes in Git with a message explaining what changed.

## Confidence

A measure or representation of how certain a model or speech-recognition system is about a result.

Low confidence should not be ignored for safety-sensitive fields.

## Consent

Permission or agreement related to a specific interaction or data use.

The exact legal meaning depends on the workflow and jurisdiction, so the product should store required evidence but should not invent legal rules.

## Correlation ID

A safe identifier used to connect related technical events across logs and services.

It helps engineers debug one call without searching logs by patient name or phone number.

## CSV

CSV stands for **Comma-Separated Values**.

It is a simple file format commonly exported from spreadsheets.

CheckIn Care can use CSV as the first practical patient-import method.

---

# D

## Data minimization

Collecting only the information needed for the approved purpose instead of collecting extra sensitive information just because it might be useful later.

## Database

A structured system used to store application data.

CheckIn Care uses PostgreSQL as its primary relational database technology.

## Dead-letter queue / failed-job store

A place where repeatedly failing background work is kept for investigation rather than silently discarded.

## Deployment

The process of making a specific application version available in an environment such as staging or production.

## Deterministic rule

A rule that produces a predictable result for the same defined input.

Example: an explicit opt-out phrase always stops future automated calls.

## DTMF

DTMF refers to the tones generated by telephone keypad buttons.

It allows a caller to respond by pressing numbers.

Example:

`Press 1 for yes.`

## Durable data

Information stored so it survives an application restart or server failure.

Database records are intended to be durable. Temporary in-memory arrays are not.

---

# E

## EHR

EHR stands for **Electronic Health Record**.

It is the main clinical record system used by many healthcare organizations.

CheckIn Care should not try to become a full EHR.

## Encryption

A method of protecting information by converting it into a form that cannot be read without the correct key.

Encryption can protect data while stored and while transmitted.

## End-to-end test

A test that follows a full user/system journey across multiple parts of the product.

Example:

patient scheduled -> call completed -> escalation created -> staff resolves escalation.

## Entity

A business object represented in software/data.

Examples:

- Patient,
- Organization,
- Call Session,
- Escalation.

## Escalation

A durable work item created when a patient interaction requires human review or follow-up.

An escalation should have a reason, priority, status, owner/assignee, evidence, and resolution history.

## Event

A record that something happened.

Examples:

- call answered,
- patient opted out,
- transcript turn created,
- escalation resolved.

---

# F

## Fail closed

When something important fails, the system chooses the safer restricted behavior rather than continuing in an unsafe or misleading mode.

Example: if the production database is unavailable, do not silently store patient data only in temporary memory.

## Feature flag

A switch that lets the team enable or disable a feature without immediately deleting or redeploying all related code.

Example: enable real outbound calls only for the pilot organization.

## FHIR

FHIR stands for **Fast Healthcare Interoperability Resources**.

It is a standard used for exchanging healthcare information between systems.

A FHIR integration may be useful later after the core product workflow is proven.

## Foreign key

A database rule that connects one table record to a valid record in another table.

Example: a call session's `patient_id` should point to a real patient.

## Frontend

The part of the application users interact with in the browser.

CheckIn Care's frontend uses Next.js and React.

---

# G

## Graceful degradation

Continuing in a safer, simpler mode when one dependency is unavailable.

Example: if AI is unavailable, an approved program may switch to simple scripted/keypad questions and flag the result for human review instead of crashing.

---

# H

## Hardcoded data

Values written directly into code rather than loaded from the real database or configuration.

Hardcoded sample patients are useful for designing a screen but should not be mistaken for live product integration.

## Health check

An endpoint or test that tells whether the application or one of its dependencies appears healthy.

## Human-in-the-loop

A system design where a human remains responsible for reviewing or approving certain decisions or outcomes.

For CheckIn Care, safety-sensitive follow-up should remain human-owned.

---

# I

## Idempotency

The property that repeating the same intended request does not accidentally repeat an important side effect.

Example: retrying one scheduler request should not create two telephone calls to the same patient.

## Idempotency key

A unique value used to recognize repeated requests that represent the same intended action.

## Incident

A serious problem affecting security, privacy, safety, reliability, or availability.

Example: the scheduler starts creating duplicate patient calls.

## Integration

A connection between CheckIn Care and another system/provider.

Examples:

- telephony provider,
- AI provider,
- EHR,
- email provider.

## Integration test

A test that checks multiple real components together.

Example: backend service plus real test PostgreSQL database.

## Intent

The meaning of what a user is trying to communicate.

Examples:

- callback request,
- opt-out,
- reschedule,
- medication-adherence answer.

---

# J

## Job worker

A process that performs background jobs.

In CheckIn Care, the worker can find due schedules and create approved call work.

## JSON

JSON stands for **JavaScript Object Notation**.

It is a structured text format commonly used by APIs.

Example:

```json
{
  "callbackRequested": true
}
```

---

# L

## Latency

The amount of delay between an action and the result.

In a voice call, high latency can make the conversation feel awkward because the patient waits too long for a response.

## Least privilege

Giving a user or service only the permissions it actually needs.

## LLM

LLM stands for **Large Language Model**.

It is an AI model designed to understand and generate language.

In CheckIn Care, an LLM may help interpret natural speech or produce approved conversational wording, but it should not own security or clinical responsibility.

## Log

A technical record used to understand application behavior.

Logs are different from audit records and should avoid raw patient-sensitive content.

---

# M

## MFA

MFA stands for **Multi-Factor Authentication**.

It requires more than one authentication factor, such as a password plus a one-time code.

## Metric

A numerical measurement collected over time.

Examples:

- call completion rate,
- API error rate,
- escalation resolution time.

## Migration

A versioned change to the database structure or data.

Example: adding an `organizations` table.

## Mock

A fake replacement used during testing or development.

Example: a mock telephony provider returns predictable results without dialing a real patient.

## Modular monolith

One main deployable backend application divided internally into clear modules.

It provides strong separation of responsibilities without the operational complexity of many networked microservices.

## Monitoring

Collecting and displaying information about the running product so problems can be detected.

## Multi-tenant

A software design where several client organizations use the same platform while their data and access remain separated.

---

# N

## Next.js

The web application framework used by CheckIn Care for frontend pages and some web-facing server routes.

## Node.js

A runtime that allows JavaScript to execute on the server.

The CheckIn Care backend uses Node.js.

---

# O

## Observability

The ability to understand what the running system is doing using logs, metrics, traces/correlation IDs, health information, and related evidence.

## Opt-out

A patient request or state that stops future automated communication for the relevant channel/scope.

Opt-out must be durable and checked before future scheduling/dialing.

## Organization

One client account/tenant in CheckIn Care.

Examples:

- one urgent-care company,
- one clinic group.

## ORM

ORM stands for **Object-Relational Mapping**.

It is a software layer that maps program objects to database tables. The current repository uses direct PostgreSQL-related patterns in important areas rather than relying entirely on one large ORM.

---

# P

## Patient 360

A product page that gives staff one coherent view of a patient, including communication status, programs, schedules, calls, escalations, and timeline.

The name does not mean CheckIn Care should store every possible medical record.

## PHI

PHI commonly means **Protected Health Information** in U.S. healthcare privacy contexts.

Whether a particular data element is PHI in a particular situation is a legal/compliance question. The engineering rule should be to treat patient-linked clinical/contact content as sensitive and avoid unnecessary exposure.

## Pilot

A limited real-world trial with controlled scope and explicit limitations.

A pilot is not the same as an unrestricted commercial production launch.

## PostgreSQL

The relational database used by CheckIn Care.

## Production

The environment used for real client operations.

Production should have stronger controls than local development, including secure secrets, monitoring, backups, access control, and release procedures.

## Production-ready

A feature/system is production-ready for a defined use case when it is complete, secure, tested, monitored, supportable, recoverable, and approved for the intended operating conditions.

Production-ready should always be qualified by the use case.

## Prompt

Instructions or context given to an AI model.

Prompts should be versioned and controlled when they affect important product behavior.

## Prompt injection

An attempt to cause an AI system to ignore its intended rules or reveal/perform something unauthorized.

## Provider

An external service used by CheckIn Care.

Examples:

- telephony provider,
- AI provider,
- speech provider.

---

# Q

## Queue

A list of work waiting to be processed.

This can mean:

- a technical job queue,
- or a human care-team queue such as open escalations.

---

# R

## Rate limiting

Restricting how many requests or actions can occur in a time period.

It helps prevent abuse, accidental overload, and excessive provider costs.

## RBAC

RBAC stands for **Role-Based Access Control**.

It means permissions are grouped into roles.

Example: an `Organization Admin` role can manage users while a `Care Coordinator` cannot.

## React

The user-interface library used by the CheckIn Care frontend.

## Recording metadata

Information about a call recording without necessarily storing the audio inside the database.

Examples:

- recording identifier,
- storage reference,
- created time,
- retention date.

## Recovery Point Objective (RPO)

The maximum amount of recent data loss an organization is prepared to tolerate after a disaster.

## Recovery Time Objective (RTO)

The target amount of time allowed to restore service after a serious failure.

## Regression

When a code change breaks behavior that previously worked.

Automated tests help catch regressions.

## Retention

How long data is stored before deletion/archival according to policy.

## Retry

Trying a failed action again.

Retries must be controlled because repeating some actions can cause duplicate side effects.

## Rollback

Returning to a previously safe application state after a bad release.

## Route

A URL path handled by the frontend or backend.

Example:

`/dashboard/voice`

---

# S

## SaaS

SaaS stands for **Software as a Service**.

It means clients use software hosted/operated as a service rather than installing and maintaining everything themselves.

## Sandbox

A controlled development/testing environment or provider implementation that imitates production behavior without performing the real external action.

## Schema

A defined structure.

This can mean:

- database schema: tables/columns/relationships,
- data schema: expected fields and types in an API/AI response.

## Secret

A sensitive credential used by software.

Examples:

- database password,
- API key,
- webhook signing secret.

## Service-level objective (SLO)

A measurable reliability target.

Example: a target for webhook processing success.

## Session

A server-recognized period during which a logged-in user remains authenticated.

## Smoke test

A short set of important checks run after deployment to make sure the application is basically healthy.

## Speech-to-text (STT)

Technology that converts spoken audio into written text.

## State

The current status of a business object.

Example call states:

- queued,
- ringing,
- in progress,
- completed.

## State machine

A defined list of states and allowed transitions between them.

It prevents impossible changes such as a completed call returning to ringing.

## Structured data

Information stored in defined fields rather than only as free-form text.

Example:

`callback_requested = true`

## Structured output

AI output required to follow a defined schema.

Structured output is easier to validate than unrestricted paragraphs.

## Synthetic data

Invented test data that does not represent a real patient.

## System of record / source of truth

The authoritative place where a business concept is stored.

CheckIn Care should have one canonical patient source of truth rather than separate competing patient stores.

---

# T

## Telephony

Technology that connects software to the telephone network.

## Telephony provider

An external service that can place/receive/control phone calls on behalf of an application.

## Tenant

One client organization in a multi-client software platform.

## Tenant isolation

Controls that prevent one tenant/client from accessing another tenant's data.

## Text-to-speech (TTS)

Technology that converts text into spoken audio.

## Timeout

A limit on how long the application waits for an external operation before treating it as failed or uncertain.

## Token

The word token has several meanings.

In authentication, a token may be a credential.

In AI, a token is a unit of text processed by a model.

The meaning should be clear from context.

## Trace

A connected view of work across multiple system components. Even without a full tracing platform, correlation IDs can provide a practical first version.

## Transaction

A group of database operations that succeed or fail together.

## Transcript

Text representation of spoken conversation.

A transcript can contain sensitive patient information and needs controlled access, logging, and retention.

## Type checking

Automatically verifying that program values match the expected data types.

TypeScript provides type checking for much of the frontend code.

---

# U

## Unit test

A small automated test for one isolated rule/function.

## Urgent escalation

A high-priority human work item created because the approved safety policy says the interaction requires urgent review.

The exact meaning of "urgent" must be defined by the client workflow and should not be confused with emergency dispatch unless that capability has been explicitly designed and approved.

---

# V

## Validation

Checking that input/output follows expected rules before using it.

Examples:

- phone number format,
- allowed call state,
- AI structured output schema.

## Versioning

Keeping track of distinct published versions of important configuration.

Example:

- Post-Urgent-Care Program v1,
- Post-Urgent-Care Program v2.

Historical calls should remember which version they used.

## Voice runtime

The part of CheckIn Care that manages the live voice conversation: speech events, conversation state, AI interpretation, response generation, and audio output.

---

# W

## Webhook

An HTTP request an outside provider sends to CheckIn Care to report an event.

Example: a telephony provider reports that a call was answered.

## Webhook signature

Cryptographic or secret-based proof used to verify that a webhook actually came from the expected provider and was not forged.

## Worker

A process that handles background work such as scheduled calls or asynchronous event processing.

---

# Common phrases used in this documentation

## "Built and connected"

The feature exists in code and participates in a meaningful application flow.

It may still require production hardening.

## "Partial"

Some major parts exist but the full feature is not complete.

## "Prototype"

The feature demonstrates the idea but is not ready to rely on in production.

## "Simulated"

A fake implementation imitates a real external action.

Example: creating a fake provider call ID without dialing a telephone.

## "Hardcoded"

Values are written directly into source code instead of coming from the real database/configuration.

## "Planned"

The behavior is described but not fully implemented.

## "Fail safely"

When something goes wrong, the system moves to a known state that avoids dangerous assumptions and preserves appropriate human follow-up.

## "Human escalation"

The automated system creates durable work for a person rather than trying to handle the situation autonomously.

## "No silent failure"

Important failures must be recorded and surfaced to the responsible user/operations team instead of disappearing.

## "One source of truth"

One canonical model/system owns each important business concept.

## "Provider-neutral"

Application logic uses an internal interface so changing an outside vendor does not require rewriting unrelated product behavior.

---

# Final learning rule for new team members

When you see a word you do not understand in code or a ticket, do not treat the word itself as proof that the behavior exists.

For example:

- a file named `telephony-provider` does not prove real calls are placed,
- a folder named `safety` does not prove every safety scenario is handled,
- a table named `audit_logs` does not prove all important actions are audited,
- a route named `/api/patients` does not prove it is authenticated, organization-scoped, tested, and production-ready.

Always trace the complete user/system journey and verify how the feature behaves when something goes wrong.
