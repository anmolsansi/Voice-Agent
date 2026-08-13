# What Is Built Today

## Why this file is important

This file answers a simple question:

> If we opened the repository today, what can we honestly say has been built?

The answer must be more precise than "the feature exists" or "the ticket was completed."

Software can exist at several levels of completeness:

- a design may exist,
- a database table may exist,
- a helper function may exist,
- a screen may exist with sample data,
- an API route may exist but return `Not Implemented`,
- a simulated provider may make development look like a real integration,
- a complete user journey may actually work from beginning to end.

These are not the same thing.

This document therefore uses five labels:

- **Built and connected**: meaningful end-to-end behavior exists.
- **Partial**: important pieces exist but the user journey is incomplete.
- **Prototype**: the feature demonstrates the idea but is not production quality.
- **Simulated or hardcoded**: development behavior or sample data stands in for a real integration or live data source.
- **Planned**: documentation describes the target but the implementation is not complete.

---

# 1. Product area: patient web intake

## Status: Built and connected, pilot quality

The patient intake flow is currently the strongest part of the product.

### What a patient can do

The repository supports the basic lifecycle of an intake session.

A patient can:

- begin an intake session,
- enter demographic information,
- enter visit-related information,
- provide consent-related answers,
- save or update fields,
- move through a review step,
- receive validation when required information is missing,
- submit the intake,
- reach a completion state,
- resume an existing session,
- continue the same intake through a shareable/resume-style flow.

The repository also contains QR/link continuation behavior intended to make it easier to move between devices.

### Why this matters

This is not merely a static form mockup. The patient flow is connected to backend behavior and persistence.

That makes it a useful reference implementation for future features.

### What still prevents it from being a finished commercial intake product

Even though the flow is meaningful, production work is still required around:

- client onboarding,
- organization isolation,
- mature individual user accounts,
- lifecycle and expiration rules,
- complete accessibility review,
- complete privacy and retention policy,
- production deployment and monitoring,
- client-specific configuration,
- operational support.

So the correct status is **working pilot**, not "finished healthcare SaaS."

---

# 2. Product area: staff intake workflow

## Status: Built and connected, pilot quality

Staff-facing intake behavior includes:

- a protected dashboard area,
- a queue/list of submitted intake sessions,
- a detailed intake view,
- review notes,
- a mark-reviewed action,
- access to a generated PDF summary.

### What this proves

The repository already has the idea of two different user experiences:

- a public or patient-facing experience,
- a protected staff experience.

That separation should be preserved and strengthened for the voice product.

### Limitation

The current access model is transitional and not the final model we should use for a client with multiple staff members and roles.

---

# 3. Product area: PDF generation

## Status: Built and connected

The application can generate a PDF summary for submitted intake information.

A PDF is useful because clinics often need a portable, printable, or reviewable summary outside the immediate screen.

The staff flow includes a protected path for accessing this output.

### What production work still applies

Before treating PDF export as fully production-ready, the project still needs to verify:

- correct permission checks for every export path,
- organization ownership checks,
- sensitive-data handling,
- file lifecycle and retention,
- audit events for access/export where required,
- behavior under large or unusual submissions.

---

# 4. Product area: PostgreSQL persistence

## Status: Built and connected, but the schema needs reconciliation

The application has real PostgreSQL support.

PostgreSQL is the database used to store durable records.

"Durable" means the information should survive an application restart, unlike temporary in-memory values.

The repository includes:

- a database connection layer,
- migration files,
- intake-related persisted records,
- call-related persisted records,
- audit-related records,
- health/readiness behavior that distinguishes database availability.

### Local memory fallback

Some development paths can use temporary in-memory storage.

This is useful when a developer wants to run the project quickly without a full database.

However, a production deployment should never silently fall back to temporary memory if the real database is unavailable. Losing patient or call information because the database was down would be unacceptable.

The project already has some fail-closed thinking around this and should keep that principle.

### Major limitation

The schema has grown through multiple project stages and now contains overlapping concepts. This is described in detail later in this document and in `03-what-is-missing.md`.

---

# 5. Product area: call-attempt backend

## Status: Partial but meaningful foundation

The backend has a real call-attempt service.

This is important because it means the project is not starting from zero.

The current call domain can perform behavior such as:

- create a call-attempt record,
- associate the attempt with patient/schedule-style identifiers,
- use an idempotency value to reduce accidental duplicate creation,
- list calls,
- fetch call details,
- update call state,
- finalize an attempt,
- store outcome-related fields,
- write audit-related records.

### What is an idempotency key?

Suppose the scheduler sends the same instruction twice because a network request was retried.

Without protection, the system might place two calls to the same patient.

An idempotency key is a unique value used to recognize that the second request represents the same intended action.

A production call system should use this idea consistently around all actions that could accidentally happen twice.

### What this does not prove

Creating a call-attempt database record is not the same as successfully placing a real telephone call.

That external integration is still incomplete.

---

# 6. Product area: scheduled check-in job

## Status: Partial

The repository contains job logic that represents the beginning of automatic scheduling.

The intended flow is:

1. identify schedules that are due,
2. decide whether the patient is eligible to be called,
3. create an idempotent call attempt,
4. begin the provider call,
5. process the result,
6. update the next schedule or retry.

The repository has pieces of this flow, including due-call and call-attempt concepts.

### Current limitation

At least one newer scheduled-call path ultimately starts a sandbox call rather than a real external telephone call.

Therefore the current scheduler should be treated as orchestration groundwork, not proof of real automated patient outreach.

### Additional production requirements not yet complete

A real scheduler must also handle:

- time zones,
- daylight-saving changes,
- call windows,
- holidays or closed periods where applicable,
- paused patients,
- inactive patients,
- opt-outs,
- retry limits,
- worker crashes,
- duplicate workers,
- provider rate limits,
- missed jobs,
- safe replay.

---

# 7. Product area: sandbox telephony provider

## Status: Simulated

The repository includes a sandbox provider.

A sandbox is a safe environment used to imitate real behavior during development.

The sandbox provider can create an object that looks like a provider call and can generate a provider-style identifier.

This is useful because developers can test the rest of the application without making real telephone calls.

### What it does not do

It does not prove that the product can:

- dial a patient's telephone number,
- receive real call-answer events,
- stream real audio,
- process telephony provider signatures,
- recover from provider outages,
- handle real voicemail behavior,
- terminate or control a real call.

A sandbox must remain available for tests, but a real provider adapter is required for production.

---

# 8. Product area: telephony webhook helpers

## Status: Prototype / partial

The repository contains generic webhook behavior for voice-provider events.

A webhook is a request an outside service sends to our backend when something happens.

For a phone call, an outside provider might report:

- call queued,
- ringing,
- answered,
- completed,
- failed.

The current helper demonstrates useful ideas such as:

- validating a shared secret/signature-style value,
- mapping provider events into application statuses,
- applying status updates.

### Why it is still incomplete

A real telephony provider typically defines its own exact signature-validation method.

Production behavior must implement that provider's official verification rules rather than rely on a generic homemade signature format.

The current flow also needs stronger protection against:

- malformed payloads,
- repeated events,
- old events arriving after newer events,
- impossible status regression,
- raw patient-sensitive webhook data leaking into logs.

---

# 9. Product area: real-time voice event handling

## Status: Prototype foundation

The repository has a voice turn handler that understands abstract events such as:

- speech started,
- partial transcript,
- final transcript,
- text-to-speech completed.

These event names represent the correct kinds of things a production voice runtime needs to understand.

### What is a partial transcript?

When speech recognition is listening, it may first produce an unfinished guess.

Example:

`"I have been feeling..."`

Later, after the speaker finishes, it may produce a final version:

`"I have been feeling more tired since yesterday."`

The application must know that partial text can change and should not always trigger permanent business actions.

### Why the current handler is not the full voice product

The repository does not yet show a fully connected pipeline where actual telephone audio moves through speech recognition, AI/business logic, speech generation, and back into the telephone call.

The current code is the shape of that future system, not the final external integration.

---

# 10. Product area: intent detection

## Status: Prototype

The repository includes phrase-based intent logic.

An **intent** is the meaning of what a person is trying to communicate.

Examples:

- "please call me later" means callback/reschedule intent,
- "stop calling me" means opt-out intent,
- "I have chest pain" may match an urgent-safety rule,
- "yes, I took it" may represent medication-adherence information.

The current implementation uses deterministic phrase matching for several important categories.

### Why deterministic rules are useful

Deterministic means the same input follows the same defined rule.

These rules are valuable for safety-sensitive phrases because they are easy to inspect and test.

### Why phrase matching alone is not enough

People can express the same idea in many ways.

A production product will likely combine:

- deterministic high-priority rules,
- structured AI classification,
- confidence checks,
- clarification questions,
- human escalation when uncertain.

---

# 11. Product area: safety phrase detection

## Status: Prototype safety layer

The repository includes simple safety-related pattern matching.

This is a good beginning because it shows that the system should not rely only on free-form AI reasoning.

However, production safety requires a much broader policy and test suite.

The project currently does not have enough evidence to claim that urgent or clinically important language will always be handled correctly across natural speech, transcription mistakes, ambiguity, and provider failures.

---

# 12. Product area: voice dashboard

## Status: UI built, operational data partially hardcoded

There is a voice operations dashboard page.

This is valuable because it gives the team a concrete view of the desired care-team experience.

The screen includes operational-style information around calls and outcomes.

### Important limitation

The dashboard's supporting data file currently includes fixed sample patients and fixed metrics.

Examples include sample names and a fixed completion-rate value.

That means the dashboard can look realistic even when it is not reading the current production database.

### Required next step

Replace fixture data with authenticated backend queries for:

- current organization,
- current patients,
- current schedules,
- current calls,
- current escalations,
- current metrics.

Then add loading, empty, error, stale-data, and permission states.

---

# 13. Product area: reporting and analytics UI

## Status: Partial

The repository includes report-oriented pages and analytics work.

This is useful product foundation, but reporting is only trustworthy when the underlying data model and calculations are canonical.

Before client use, every metric needs a written definition.

Example:

### "Completion rate"

Questions that must be answered:

- Is it completed calls divided by all attempts?
- Completed patients divided by scheduled patients?
- Does voicemail count as reached?
- Do retries count separately?
- Does opt-out count as completion?
- What date is used: scheduled date or actual call date?

If two engineers calculate the same metric differently, the dashboard becomes misleading.

---

# 14. Product area: staff authentication

## Status: Partial / transitional

The repository protects important staff-facing areas and has documentation describing an authentication upgrade.

However, the currently inspected runtime still contains shared-token behavior.

### Shared token explained

A shared token is one secret value used by more than one person or system.

This is convenient during a pilot, but weak for a multi-user production client because:

- the system cannot reliably distinguish individual staff members,
- revoking one person's access may require changing the secret for everyone,
- role differences are difficult,
- audit trails become less meaningful.

### Production requirement

Move to individual identities with:

- user accounts,
- secure sessions,
- roles,
- permissions,
- account status,
- session expiration,
- password reset or identity-provider support,
- stronger authentication for privileged users.

---

# 15. Product area: backend authorization

## Status: Inconsistent and incomplete

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this action?

Some intake routes explicitly check staff access.

However, inspected call routes expose sensitive call behavior without an equivalent consistent authorization check.

This is a major production blocker.

A protected dashboard alone is not enough. A person can call backend APIs directly if the backend route itself is not protected.

Production rule:

> Every sensitive API must verify identity, role/permission, and organization ownership on the server.

---

# 16. Product area: staff API placeholders

## Status: Planned / incomplete

Some staff-related server endpoints return a `501 Not Implemented` response.

HTTP status `501` means the server understands the type of capability but does not implement it.

These endpoints must not be counted as completed product functionality.

---

# 17. Product area: audit API placeholders

## Status: Planned / incomplete

An audit-log route exists that returns a not-implemented result.

The database has audit foundations, but a complete operational audit product still needs:

- canonical audit events,
- actor identity,
- organization ownership,
- event search/filtering,
- immutable or protected retention behavior,
- permission checks,
- transcript/view/export access events where required.

---

# 18. Product area: patient service for voice product

## Status: Prototype / disconnected

One newer patient-service implementation uses an in-memory array.

That means the product currently has more than one concept of "patient."

A production application cannot safely continue with separate patient truths for intake, dashboard fixtures, and voice scheduling.

The project needs one canonical patient identity and database model.

---

# 19. Product area: call-detail storage

## Status: Partial, database groundwork exists

The repository contains migrations and code for richer call detail concepts such as:

- calls,
- call events,
- transcript turns,
- recording metadata,
- call audit information.

This is valuable.

However, these concepts overlap with the existing `call_attempts` and general `audit_logs` model.

Before adding more features, the team must decide which model is authoritative and migrate toward it.

---

# 20. Product area: multi-client organization isolation

## Status: Not yet complete

The current core schema does not show a mature organization/clinic ownership model attached consistently to business records.

That means the product is not yet ready to safely host multiple independent clinic clients in one shared application.

The production design should introduce a clear organization boundary and enforce it in every relevant database query and API permission check.

---

# 21. Product area: automated escalation workflow

## Status: Planned / partial foundations

The target documents describe alerts and human escalation.

There are safety/escalation concepts in the newer voice code.

However, the complete care-team workflow is not yet present as one connected feature with:

- persisted escalation record,
- priority,
- reason,
- assignment,
- acknowledgment,
- owner,
- due time or service expectation,
- relevant transcript evidence,
- resolution,
- audit history,
- dashboard queue.

This is one of the most important missing product capabilities.

---

# 22. Product area: client settings

## Status: Planned

Architecture documents describe settings for:

- call windows,
- retry limits,
- provider information,
- AI prompt/version selection,
- recording/transcript policy,
- escalation defaults,
- opt-out language.

These should become first-class product settings owned by the client organization.

They are not yet a complete connected client-admin experience.

---

# 23. Product area: continuous integration

## Status: Missing or not present in the inspected repository state

The audit did not find an existing `.github` workflow configuration.

The current `npm test` script also does not automatically cover every newer voice/service/job module.

Therefore a green local test command cannot yet be treated as proof that the entire application is safe to merge or deploy.

---

# 24. Current status summary

| Area | Current status | Plain-English meaning |
| --- | --- | --- |
| Patient web intake | Built and connected | Real pilot workflow exists. |
| Staff intake review | Built and connected | Real staff pilot workflow exists. |
| PDF generation | Built and connected | Real output exists. |
| PostgreSQL persistence | Built, needs cleanup | Real DB exists, newer schema overlaps. |
| Call-attempt records | Partial | Useful backend orchestration exists. |
| Scheduled-call job | Partial | Due-call logic exists, real provider flow incomplete. |
| Real outbound phone calling | Simulated | Sandbox provider stands in for real telephony. |
| Real-time phone audio | Prototype target | Event handlers exist; complete audio pipeline is not connected. |
| AI conversation pipeline | Partial/prototype | Building blocks exist; production flow incomplete. |
| Safety engine | Prototype | Simple deterministic detection exists. |
| Voice dashboard | UI/prototype | Screen exists; data is partly fixed samples. |
| Patients API for voice product | Planned/partial | No single canonical connected patient API yet. |
| Alerts/escalation queue | Planned/partial | Target exists; full workflow not connected. |
| Voice settings | Planned | Target exists; full client configuration missing. |
| Individual user auth/RBAC | Partial | Transitional staff protection exists, final model missing. |
| Multi-clinic isolation | Missing | No complete tenant model yet. |
| Audit product | Partial | DB ideas exist; full secure operational audit flow missing. |
| CI/CD | Missing/incomplete | Automated merge/deploy quality gate still needed. |
| Production monitoring | Missing/incomplete | Metrics and docs exist as goals, full runtime operation still needed. |

---

# 25. The correct conclusion

The repository contains a serious amount of useful work.

The right response is **not** to throw it away and rewrite everything.

The right response is also **not** to declare the voice agent finished because many planning tickets were marked complete.

The responsible interpretation is:

- preserve the mature intake foundation,
- preserve useful call, job, voice, safety, dashboard, and migration work,
- identify which pieces are only scaffolding,
- reconcile the data model,
- connect the real provider/runtime path,
- add complete security and tenant boundaries,
- replace fixture data with real APIs,
- build the human escalation workflow,
- add tests, monitoring, deployment, and client operations.

That path turns the existing investment into a production product without pretending incomplete features are done.
