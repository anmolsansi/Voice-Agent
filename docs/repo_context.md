# CheckIn Care Repository Context

## Purpose of this file

This file explains what is actually inside the `anmolsansi/Voice-Agent` repository and how the important pieces relate to each other.

It is deliberately written in plain language. A new intern should be able to read it before touching the code and answer these questions:

- What product are we building?
- Which parts already work?
- Which parts are prototypes or simulations?
- Which folders matter?
- Where is data stored?
- How is the web application protected?
- How are calls represented?
- What important inconsistencies exist?
- What decisions must be made before adding major new features?

This file is also intended to satisfy the repository-audit requirement for future product-building work. New tickets should refer back to this document instead of guessing how the repository works.

---

# 1. Repository identity

Repository: `anmolsansi/Voice-Agent`

Product name used in the repository: **CheckIn Care / Voice-Agent**

The repository currently contains two related product directions:

1. an earlier web-based patient intake and clinic review application,
2. a newer outbound voice-agent check-in product built on top of the same codebase.

The second direction is the long-term product focus, but the first direction currently has the more complete end-to-end implementation.

---

# 2. Technology stack explained

The main technologies currently used are:

## Next.js

Next.js is a web application framework. A framework is a set of conventions and tools that helps developers build an application without writing every low-level web feature from scratch.

In this repository, Next.js is mainly responsible for the user-facing website and dashboard pages.

Important location:

- `app/`

Examples include:

- patient intake pages,
- staff login,
- staff dashboard pages,
- report pages,
- voice operations dashboard pages.

## React

React is the user-interface library used by Next.js. It helps the project build screens from reusable pieces called components.

A component can be something small, such as a button, or something larger, such as a patient information card.

## TypeScript

TypeScript is JavaScript with additional type checking. Type checking helps catch mistakes such as passing the wrong kind of value to a function before the application is running in production.

The Next.js frontend uses TypeScript heavily.

## Node.js

Node.js lets JavaScript run on the server, not only in a browser.

The repository contains a separate backend application under `src/`. That backend handles application programming interfaces, database access, jobs, call orchestration, audit behavior, and other server-side responsibilities.

## PostgreSQL

PostgreSQL is the main relational database technology used by the project.

A relational database stores structured information in tables and lets tables be connected by relationships.

Examples of information that belongs in the database include:

- patients,
- intake sessions,
- answers,
- call attempts,
- schedules,
- transcript turns,
- audit events,
- alerts,
- users.

Database migration files live under:

- `db/migrations/`

A migration is a versioned change to the database structure. For example, adding a new `calls` table should happen through a migration instead of someone manually changing a production database.

## Tailwind CSS

Tailwind CSS is a styling system used by the web interface. It helps developers control layout, spacing, fonts, borders, responsiveness, and other visual details.

## PDFKit

PDFKit is used to generate PDF summaries for submitted patient intake information.

---

# 3. Major folders and what they mean

## `app/`

This is the Next.js application.

It contains pages and browser-facing API routes.

Important areas include:

- `app/intake/` for the patient intake experience,
- `app/staff/` for staff login-related behavior,
- `app/dashboard/` for staff-facing operational screens,
- `app/api/` for Next.js API routes used by the frontend.

The current dashboard tree visibly contains intake, reports, and voice sections. Some other screens described in planning documents, such as full patient management, alerts, and voice-agent settings, are still target behavior rather than complete connected routes.

## `components/`

This folder contains reusable frontend pieces.

A reusable component is a screen element that can be shared instead of copied into many pages.

## `lib/`

This folder contains frontend or shared helper code.

One important caution is that some dashboard data helpers currently contain fixed sample data. A hardcoded helper can make a screen look complete even when it is not connected to the production database.

## `src/app.js`

This is one of the most important backend files.

It assembles the backend application and registers route modules.

A route is a server endpoint such as:

- `GET /health`
- `POST /api/calls`
- `GET /api/calls`

The key lesson for new developers is that creating a new file somewhere under `src/` does not automatically make that code part of the running application. A module must be connected through the actual runtime path.

## `src/modules/`

This is where much of the backend business behavior lives.

Important existing modules include areas such as:

- intake,
- calls,
- staff,
- audit,
- submission,
- health.

The calls module contains meaningful database-backed call-attempt orchestration, but the broader voice product is not yet fully connected through this module structure.

## `src/jobs/`

This folder contains background-job logic.

A background job is work that should happen without a person manually clicking through every step.

For CheckIn Care, a background job may look for scheduled patient check-ins that are due and create call attempts.

## `src/voice/`

This area contains newer voice-agent foundations such as:

- provider abstractions,
- sandbox provider behavior,
- real-time event handling,
- intent detection,
- safety-related helpers.

Important caution: not everything under this folder is connected to a real telephony provider or a real production voice pipeline.

## `src/services/`

This area contains newer service-layer experiments and supporting logic.

Some of these services use in-memory data instead of the main PostgreSQL database and may not be wired into the runtime.

New developers should not assume that a service is canonical just because it has a clean-looking API.

## `db/migrations/`

This folder defines how the PostgreSQL database evolves.

It is one of the most important areas requiring cleanup because the repository currently has overlapping call-related models and migration naming conflicts.

## `docs/`

This folder contains architecture, product, operational, security, and planning documents.

Many of these documents describe the intended target system. They are useful, but they must not be treated as proof that every described feature has been implemented.

---

# 4. Three examples of real application patterns

A new engineer should study real working examples before inventing new patterns.

## Example A: patient intake flow

The intake flow is the best example of a feature that crosses several layers.

Conceptually it looks like this:

1. a patient starts an intake session,
2. the frontend asks the backend to create or load the session,
3. the patient enters information,
4. the backend validates and saves the information,
5. the patient reviews the submission,
6. the session is submitted,
7. staff can later review it,
8. a PDF can be generated for staff.

Why this matters:

It demonstrates how CheckIn Care already handles a real user flow with frontend pages, server APIs, database persistence, and staff review.

## Example B: call-attempt service

The calls module is the best example of backend call orchestration that already persists information.

It includes behavior for creating call attempts, avoiding some duplicate work through idempotency, updating call status, finalizing calls, and reading call history.

The word **idempotency** means that repeating the same request should not accidentally perform the same important action twice.

For example, if a scheduler accidentally sends the same "create this call" request twice, idempotency helps prevent two patient calls from being created.

## Example C: staff-protected intake routes

The repository has staff-only behavior where a request must contain the expected staff access credential before sensitive intake information is returned.

This shows that the project already understands the need to separate public patient actions from protected staff actions.

However, the protection model is not yet consistent across all newer voice/call APIs, and the current shared-token approach is not sufficient for a real multi-user client product.

---

# 5. What is truly built today

The following areas have meaningful implementation and should be preserved rather than rewritten without reason.

## Web patient intake

Built behavior includes:

- creating an intake session,
- entering demographics,
- entering visit information,
- entering consent-related information,
- saving fields,
- validating required information,
- reviewing before submission,
- submitting the intake,
- resuming an existing session,
- using a link or QR-style continuation flow,
- staff-side review,
- PDF generation.

This is the most mature product area.

## PostgreSQL persistence

The repository has a real database path, migrations, and persistence code.

The project also intentionally supports a limited local in-memory fallback for development scenarios, but the design should fail closed rather than quietly use temporary memory storage in a real deployed environment.

## Call-attempt persistence and orchestration foundation

The backend contains real logic for call-attempt records and status handling.

This is useful foundation work, even though a call attempt is not yet equivalent to a fully working outbound phone interaction.

## Voice-agent dashboard shell

The dashboard includes a voice-oriented screen and supporting analytics/reporting work.

The existence of the UI is useful, but some of its data is currently fixed sample data rather than live production data.

## Voice state and intent foundation

The repository contains code for processing normalized voice events and detecting certain patient intents or safety phrases.

This should be considered a foundation for a future real-time voice runtime, not proof that the full speech-to-speech system is connected.

---

# 6. What is partial, simulated, or disconnected

This section is critical.

## Sandbox outbound calling

The sandbox provider creates a simulated provider call identifier and behaves as if an outbound call was started.

That is useful for local development and deterministic testing, but it does not place a real telephone call.

A production telephony provider adapter is still required.

## Real-time voice events

The repository contains handlers for events such as speech starting, partial transcripts, final transcripts, and text-to-speech completion.

However, a handler for these events is not the same as a complete real-time audio pipeline.

A production implementation still needs to connect actual phone audio to:

- speech recognition,
- conversation logic,
- safety checks,
- response generation,
- speech synthesis,
- call audio playback.

## Phrase-based intent and safety detection

Some newer modules detect phrases such as urgent symptoms, callback requests, or opt-out language.

This is a valuable deterministic safety layer, but it is intentionally simple and cannot be treated as a complete medical-safety system.

## Patient service experiments

At least one newer patient-service area works with an in-memory array rather than the canonical PostgreSQL patient model.

This is a sign that the repository has multiple competing representations of the same business concept.

## Dashboard sample data

Parts of the voice dashboard currently show named sample patients, sample calls, and fixed metrics.

These values are useful for demonstrating layout but must be replaced by real backend queries before the dashboard can be used operationally.

---

# 7. Current authentication model

The project has staff-route protection, but the current model is transitional.

One important path relies on a configured shared staff access token.

A shared token means multiple people may effectively use the same secret to gain staff access.

That is not sufficient for a real client because the system needs to know which individual person performed an action.

A production system should have individual users, sessions, roles, account status, password or identity-provider controls, and audit information tied to a specific person.

Another important concern is consistency. Some existing intake routes explicitly check staff credentials, while some call-related APIs do not show equivalent protection.

For production, the rule must be simple:

> Every sensitive backend route is protected by default, and every request is checked for both identity and permission.

---

# 8. Current database concerns

The database needs reconciliation before more major voice features are added.

## Duplicate migration numbering

The migration folder currently contains two different migrations beginning with `004`.

That creates unnecessary uncertainty about migration order and history.

## Overlapping call models

The repository contains both:

- `call_attempts`,
- a separate `calls`-style detail model,
- call events,
- transcript turns,
- recording metadata,
- multiple audit concepts.

The project needs one canonical answer to:

- What is a call session?
- What is a call attempt?
- Which table owns the final outcome?
- Which table owns provider events?
- Which table owns transcript turns?
- Which audit log is authoritative?

## Weak relationships in newer call orchestration tables

Some call/schedule patient identifiers are stored as text rather than strong database foreign-key relationships.

A foreign key is a database rule that says one record must point to a valid record in another table.

Without proper relationships, it is easier to create orphaned or inconsistent data.

## No mature organization ownership model

The current core schema does not yet provide a complete multi-clinic organization boundary.

A client-ready SaaS product should normally attach business data to an organization or tenant so one clinic cannot accidentally see another clinic's records.

The word **tenant** means one customer organization using a shared software platform while remaining logically separated from other customers.

---

# 9. Current API concerns

## Duplicate or overlapping routes

The calls route module contains overlapping call-list behavior that should be cleaned up.

## Missing target APIs

Planning documents describe patient, alert, schedule, settings, telephony webhook, and AI-session APIs. Not all of these exist as fully connected production routes today.

## Placeholder endpoints

Some staff and audit routes return a not-implemented response.

A route that exists but always returns `501 Not Implemented` should never be counted as a completed product feature.

## Weak state-transition enforcement

Call status changes are partially protected, but the system does not yet expose one strict allowed-transition map for every state.

A strict map should prevent impossible transitions such as moving a completed call back to ringing because a delayed provider event arrived.

---

# 10. Current webhook concerns

A webhook is an HTTP request sent by an outside provider to tell our application that something happened.

For example, a phone provider may send:

- call started,
- call answered,
- call ended,
- recording ready.

The current generic webhook helper is useful groundwork, but production behavior needs provider-specific verification.

Important production requirements include:

- verify the provider's signature,
- reject forged events,
- deduplicate repeated events,
- safely parse malformed payloads,
- preserve event ordering rules,
- prevent old events from moving state backward,
- store only approved payload references,
- never log raw patient-sensitive payloads.

---

# 11. Current testing and continuous integration concerns

The package test command does not currently cover every newer `.mjs` voice/service/job module.

That means a successful `npm test` result does not prove that all voice-agent code works.

The repository also did not expose an existing GitHub Actions workflow during the audit.

GitHub Actions is a common continuous integration system. Continuous integration means automatically running checks when code changes so broken code is caught before it is merged.

The production path should eventually require:

- install dependencies,
- lint,
- type checking,
- unit tests,
- database integration tests,
- API tests,
- permission tests,
- end-to-end tests,
- build,
- security scanning.

---

# 12. Architectural decisions that must be frozen

The following items should be treated as explicit decisions, not assumptions hidden inside code.

## Needs Architect Decision: product maturity target

Is the next milestone:

- a portfolio/demo,
- a controlled pilot using synthetic data,
- a real clinic pilot,
- a commercial multi-client SaaS product?

This changes the security, legal, operational, and infrastructure bar.

## Needs Architect Decision: organization model

Should the first production version support one clinic only or true multi-tenant isolation from day one?

Recommended direction: build organization ownership into the data model now, even if the first deployment has only one client.

## Needs Architect Decision: canonical patient model

The original intake patient data and newer voice-patient concepts need one source of truth.

## Needs Architect Decision: canonical call model

Define the difference between a call session and a call attempt, then remove or migrate competing representations.

## Needs Architect Decision: telephony provider

Choose the first real provider and keep the application behind a provider interface so it can be replaced later.

## Needs Architect Decision: voice/AI provider

Choose whether the first implementation uses:

- one real-time speech-to-speech provider,
- or separate speech-to-text, language-model, and text-to-speech services.

## Needs Architect Decision: staff roles

Define exactly which user roles exist and which actions each role can perform.

## Needs Architect Decision: recording policy

Decide whether calls are recorded at all, who can access recordings, and how long they are retained.

## Needs Architect Decision: escalation promise

Define what the product tells a patient after an urgent or concerning response and who is responsible for human follow-up.

The product must never promise a response time that the clinic has not actually staffed.

## Needs Architect Decision: geography

Some current phone validation assumes a United States `+1` number format. Decide whether V1 is intentionally U.S.-only.

---

# 13. Recommended architectural direction

The repository should be repaired, not rewritten.

The recommended shape is a **modular monolith plus worker**.

A modular monolith means one deployable backend application that is internally divided into clear business modules.

This is simpler than splitting the product into many networked microservices too early.

Recommended business modules:

- identity,
- organizations,
- patients,
- consent,
- care programs,
- scheduling,
- calls,
- telephony,
- voice runtime,
- safety,
- escalations,
- reporting,
- audit,
- integrations,
- operations.

The system can be split later if real scale or team boundaries justify it.

---

# 14. What a new intern should do before changing code

Before starting a ticket:

1. Read this file.
2. Read the relevant product-guide document.
3. Find the existing real runtime path for the same type of feature.
4. Confirm whether the target behavior is built, partial, simulated, or only planned.
5. Identify the canonical database table before adding another data model.
6. Identify how the route is authenticated and authorized.
7. Decide how the feature fails.
8. Decide what gets logged and what must never be logged.
9. Add or update tests.
10. Update the relevant documentation when the product behavior changes.

If an unresolved architecture decision affects the ticket, stop implementation and raise the decision instead of silently choosing a permanent design.

---

# 15. Current overall status

## Patient intake

**Status: working pilot**

Meaning: meaningful end-to-end behavior exists, but production hardening and client packaging are still required.

## Outbound voice agent

**Status: advanced prototype / architecture foundation**

Meaning: many useful components exist, but the real telephony, real-time voice, live data integration, safety workflow, permissions, and operations still need substantial work.

## Production healthcare client readiness

**Status: not ready**

The product should not be presented as a fully production-ready healthcare platform until the production-readiness checklist in `docs/product-guide/10-client-readiness-checklist.md` is satisfied.
