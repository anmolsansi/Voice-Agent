# Production Roadmap

## Purpose

This file turns the product gaps into an ordered build plan.

The goal is to prevent the team from adding attractive new features while foundational problems remain unresolved.

A roadmap is not merely a list of tickets. It is the order in which capabilities should become dependable.

The roadmap follows one rule:

> Build the foundations that make later work safe, then connect one complete patient-to-care-team journey, then add polish and expansion.

---

# 1. What we are trying to reach

The target first client-ready workflow is:

```text
Client organization configured
-> staff users invited
-> patient imported
-> patient enrolled in approved care program
-> schedule becomes due
-> real telephone call is placed
-> controlled voice check-in happens
-> structured answers are saved
-> safety policy runs
-> human escalation is created when required
-> care-team member reviews and resolves it
-> audit history records important actions
-> operations team can monitor health and recover from failures
```

The product is not ready until this journey works under normal and expected failure cases.

---

# 2. Roadmap principles

## Principle 1: repair before expansion

Do not add another patient model, call model, or dashboard data source until the existing overlaps are reconciled.

## Principle 2: one complete vertical slice

A vertical slice means one feature that crosses all required layers: user interface, backend, database, security, tests, and operations.

Example:

`Patient opts out during real call -> opt-out persists -> future schedule suppressed -> dashboard updates -> audit event exists.`

That is more valuable than five disconnected helper modules.

## Principle 3: production behavior includes failure behavior

Every external call, job, and AI decision needs a documented failure path.

## Principle 4: keep V1 narrow

Do not add advanced EHR integrations, mobile apps, many languages, or complex microservices before the core voice workflow is proven.

---

# 3. Phase 0: Recovery and architecture reconciliation

## Goal

Create one truthful map of the current product and freeze the architecture decisions that affect everything else.

## Work

- maintain `docs/repo_context.md`,
- classify old completed tickets as actual/partial/prototype/planned,
- define first production use case,
- define organization model,
- define canonical patient model,
- define call session versus call attempt,
- define canonical audit model,
- map existing migrations,
- define migration cleanup strategy,
- choose first telephony provider,
- choose first voice/AI integration pattern,
- define staff roles,
- define recording policy direction,
- define initial geography,
- define escalation promise.

## Deliverables

- current-state architecture diagram,
- target-state architecture diagram,
- canonical entity relationship diagram,
- migration plan,
- permission matrix,
- provider interface contracts,
- revised Linear backlog.

## Exit criteria

No new major implementation ticket depends on an unresolved duplicate patient/call/audit model.

---

# 4. Phase 1: Identity, organizations, and security foundation

## Goal

Make the application capable of knowing which individual staff user is acting and which client organization owns every protected record.

## Work

### Organizations

- organizations table/entity,
- organization status,
- organization settings boundary.

### Users

- individual staff accounts,
- secure authentication,
- session lifecycle,
- account disable,
- role assignment.

### Authorization

- central permission checks,
- server-side resource ownership checks,
- protect all call/patient/escalation/report APIs.

### Security baseline

- rate limits on sensitive routes,
- secret-management pattern,
- safe security logging,
- audit events for privileged actions.

## Tests

- unauthenticated access denied,
- role restrictions,
- cross-organization access denied,
- disabled user blocked,
- report export isolated by organization.

## Exit criteria

A user from Clinic A cannot access any protected Clinic B record through UI or direct API request.

---

# 5. Phase 2: Canonical patient and consent foundation

## Goal

Create one source of truth for patients and whether automated outreach is permitted.

## Work

### Patient model

- organization ownership,
- contact information,
- timezone,
- active/inactive state,
- external ID,
- preferred language where needed.

### Communication state

- callable,
- paused,
- opted out,
- wrong number,
- invalid phone.

### Consent history

- source,
- timestamp,
- scope/channel,
- policy/disclosure version where required,
- revocation history.

### Patient APIs

- list/search,
- detail,
- create/import,
- update,
- communication-state actions.

### Patient UI

- patient list,
- patient profile foundation,
- callability explanation.

## Exit criteria

The product has one database-backed patient identity used by scheduling, calls, and staff UI.

---

# 6. Phase 3: Canonical call and schedule model

## Goal

Make scheduling, retries, and call history understandable and durable.

## Work

### Call session

Represents the intended check-in.

### Call attempts

Represent individual telephone attempts.

### State transitions

Define one central state machine.

### Schedules

Support:

- timezone,
- next due time,
- call window,
- retry policy,
- pause/resume,
- program version,
- patient eligibility.

### Migration cleanup

Move existing call data into the canonical structure using forward migrations.

### Job reliability

- idempotency,
- concurrency control,
- retry/failed-job visibility,
- job-run metrics.

## Exit criteria

A check-in can have several attempts without confusing the final patient-level outcome.

---

# 7. Phase 4: Care program engine

## Goal

Move conversation configuration out of hardcoded code paths into a controlled, versioned business object.

## Work

- care program table/entity,
- program versions,
- questions,
- allowed branching,
- retry policy,
- escalation policy,
- published/draft/retired states,
- program enrollment,
- test versus live status.

## Initial template

Build one narrow approved program first, such as:

`48-Hour Post-Urgent-Care Follow-Up`

## Exit criteria

A completed call can always identify exactly which published program version was used.

---

# 8. Phase 5: Real telephony

## Goal

Replace simulated outbound calling with one real provider behind a stable application interface.

## Work

### Provider interface

- create call,
- cancel/terminate where needed,
- verify webhook,
- normalize event,
- inspect provider call state,
- media-stream support where selected.

### Real provider adapter

- authentication,
- timeout,
- safe retry rules,
- error mapping,
- rate-limit handling,
- phone validation,
- provider identifiers.

### Webhooks

- official signature verification,
- event deduplication,
- event ordering/state protection,
- durable event storage,
- fast response.

### Keep mock provider

The mock/sandbox provider remains for development and deterministic tests.

## Exit criteria

The test organization can place a real approved test call and the application tracks provider lifecycle correctly.

---

# 9. Phase 6: Production voice runtime

## Goal

Connect live telephone audio to the controlled conversation workflow.

## Work

- audio streaming,
- speech recognition,
- partial/final transcript handling,
- conversation state,
- AI interpretation boundary,
- text-to-speech,
- barge-in,
- silence timeout,
- repeated misunderstanding,
- disconnect recovery,
- low-confidence handling,
- latency metrics.

## Architectural rule

The voice provider does not own patient, consent, program, escalation, or final business state.

## Exit criteria

A test patient can complete the entire published program by phone with structured answers saved to the application database.

---

# 10. Phase 7: Safety and escalation

## Goal

Ensure automation stops or hands off correctly when human attention is required.

## Work

### Safety policy

- deterministic high-priority rules,
- structured AI classification,
- confidence handling,
- allowed actions,
- output safety validation.

### Escalations

- durable escalation model,
- priority,
- reason,
- evidence,
- assignment,
- acknowledgment,
- resolution,
- routing status.

### Queue

- urgent and routine filters,
- ownership,
- age,
- status,
- failure routing.

### Failure rules

- AI unavailable,
- human route unavailable,
- call disconnect after safety signal,
- malformed model output.

## Exit criteria

Every approved synthetic safety scenario results in the expected durable human workflow, not merely a log message.

---

# 11. Phase 8: Care-team product experience

## Goal

Replace prototype/sample views with a coherent operational workspace.

## Screens

### Today

- urgent work,
- routine follow-up,
- retries exhausted,
- blocked calls,
- upcoming calls,
- system health summary.

### Patients

- search,
- filters,
- callability state.

### Patient 360

- contact/consent,
- programs,
- schedule,
- call history,
- escalations,
- timeline.

### Call detail

- attempts,
- transcript,
- structured result,
- safety evidence,
- events,
- escalation.

### Escalations

- assign,
- acknowledge,
- resolve,
- audit trail.

### Administration

- users,
- calling policy,
- programs,
- escalation routing,
- approved settings.

## Exit criteria

A care coordinator can handle ordinary daily work without engineer assistance.

---

# 12. Phase 9: Client onboarding and patient import

## Goal

Move a new client from empty organization to controlled pilot using a repeatable product process.

## Work

- onboarding checklist,
- organization setup,
- user invitation,
- CSV patient import,
- import validation,
- test-patient marking,
- program testing,
- launch readiness screen,
- controlled go-live flag.

## Exit criteria

A second client could be onboarded using documented steps without creating custom database records manually.

---

# 13. Phase 10: Reporting and audit product

## Goal

Give clients usable operational evidence and give security/operations teams searchable history.

## Work

### Reporting

- scheduled/attempted/reached/completed,
- retry outcomes,
- escalation counts,
- acknowledgment/resolution time,
- opt-outs,
- system/AI quality indicators,
- provider/AI cost where useful.

### Audit UI

- actor,
- action,
- resource,
- date,
- organization,
- filters.

### Export

- permission-protected,
- organization-isolated,
- audited,
- expiring generated files where relevant.

## Exit criteria

Every displayed metric has one written definition and tests for its calculation.

---

# 14. Phase 11: Automated testing and AI evaluations

## Goal

Turn quality from manual confidence into repeatable evidence.

## Work

- broaden unit-test coverage,
- PostgreSQL integration tests,
- API tests,
- authorization/tenant tests,
- provider mock tests,
- webhook tests,
- voice scenario tests,
- browser end-to-end tests,
- AI evaluation suite,
- prompt/model change gate.

## Exit criteria

Critical patient/care-team journeys run automatically and fail the build when behavior regresses.

---

# 15. Phase 12: CI/CD and release safety

## Goal

Make every merge and deployment repeatable.

## Work

- GitHub Actions or equivalent CI,
- lint,
- typecheck,
- tests,
- build,
- dependency/security scan,
- staging deployment,
- production deployment,
- smoke tests,
- feature flags,
- rollback procedure,
- migration checks.

## Exit criteria

Production cannot be changed through an unreviewed, untested laptop-only process.

---

# 16. Phase 13: Monitoring, incident response, and recovery

## Goal

Ensure the team can run the product after launch.

## Work

- structured logs,
- metrics,
- dashboards,
- alerts,
- dependency health,
- scheduler health,
- provider health,
- escalation-routing alerts,
- automated backups,
- restore testing,
- incident runbooks,
- emergency stop controls.

## Exit criteria

The team can detect major failures, understand affected work, pause risky automation, and follow a recovery procedure.

---

# 17. Phase 14: Client launch readiness

## Goal

Prove product, security, operations, and client workflow are ready together.

## Work

- client test calls,
- safety scenario validation,
- permission review,
- data-retention setup,
- support route,
- security review,
- vendor/provider approval,
- required external legal/compliance/clinical review,
- launch approval record.

## Exit criteria

The checklist in `10-client-readiness-checklist.md` passes.

---

# 18. P0, P1, and P2 view

## P0: must exist before real client dependency

- organization isolation,
- user identity/roles,
- canonical patient/call models,
- consent/opt-out,
- real telephony,
- real voice flow,
- safety policy,
- durable escalation,
- live dashboard data,
- core tests,
- CI,
- staging,
- monitoring,
- backups,
- launch process.

## P1: strongly improves usability and client value

- care-program builder,
- DTMF fallback,
- call-me-later,
- Patient 360 polish,
- audit search,
- CSV import polish,
- richer reports,
- AI QA sampling.

## P2: expansion after first client proof

- client API/webhooks,
- FHIR,
- selected EHR integrations,
- SSO for enterprise clients,
- more languages,
- additional templates,
- advanced analytics.

---

# 19. Suggested engineering epics

The Linear project should be reorganized around these epics rather than a handful of very broad remaining tickets:

1. Recovery & Architecture
2. Identity, Tenancy & Security
3. Patient & Consent Foundation
4. Care Program Engine
5. Scheduling & Call Domain
6. Production Telephony
7. Production Voice Runtime
8. Safety & Escalation
9. Care Team Experience
10. Client Onboarding & Administration
11. Analytics, Reporting & Audit
12. QA & AI Evaluations
13. Observability & Operations
14. Production Deployment
15. Client Launch Readiness

Each epic should then be split into small tickets that can be implemented and verified independently.

---

# 20. Ticket quality standard

A good ticket should state:

- problem,
- user/system value,
- exact scope,
- out of scope,
- affected modules/files when known,
- API/data contract,
- permission behavior,
- validation,
- failure behavior,
- tests,
- acceptance criteria,
- documentation updates.

Avoid tickets such as:

`Make voice production ready.`

That is too large to review or prove.

Prefer tickets such as:

`Implement provider-specific webhook signature verification and duplicate-event protection for outbound call status callbacks.`

---

# 21. Approximate sequencing for one strong engineer using coding agents

This is not a promise. Actual duration depends on provider choice, existing test behavior, deployment platform, client decisions, and review speed.

A reasonable order is:

## Week 1

Recovery, canonical models, migration plan, tenant/auth design.

## Weeks 2-3

Organizations, users, roles, patient/consent, call/schedule model.

## Weeks 3-5

Real telephony, webhooks, scheduler reliability.

## Weeks 5-6

Real-time voice pipeline and controlled program execution.

## Weeks 6-7

Safety and durable escalation.

## Weeks 7-8

Care-team UI connected to live APIs.

## Weeks 8-9

Onboarding, import, admin/settings, reporting.

## Weeks 9-10+

Test expansion, AI evaluations, CI/CD, monitoring, backups, staging, launch hardening.

For a real patient-data client pilot, external security/privacy/clinical/legal review may extend the calendar beyond engineering completion.

---

# 22. What should not interrupt this roadmap

Unless required by a paying pilot, do not divert the team into:

- Kubernetes,
- Kafka,
- many microservices,
- native apps,
- custom STT/TTS models,
- many languages,
- broad EHR marketplace integrations,
- insurance billing,
- advanced autonomous agents.

These can be valuable later, but they do not solve the current completeness gap.

---

# 23. Milestone definitions

## Milestone A: Architecture Ready

Canonical models and security boundaries frozen.

## Milestone B: Real Call Ready

System can make and track a real test call safely.

## Milestone C: End-to-End Voice Ready

Published test program completes by phone and stores structured result.

## Milestone D: Care-Team Ready

Escalation and patient/call workflows are usable by non-engineering staff.

## Milestone E: Pilot Ready

Testing, deployment, monitoring, recovery, onboarding, and external launch decisions are complete for controlled use.

## Milestone F: Reusable Client SaaS Ready

A second client can be onboarded with organization isolation and normal product operations without custom engineering for basic setup.

---

# 24. The most important roadmap rule

Do not measure progress by number of files, commits, or completed tickets.

Measure progress by verified product capabilities.

The best question after every sprint is:

> What can a patient or care-team user reliably do now that they could not reliably do before, and what evidence proves it?
