# CheckIn Care Product Guide

## Why this documentation exists

This folder explains CheckIn Care in plain English.

It is written so that a person should be able to understand the product even if they:

- have never worked in healthcare software,
- have never written code,
- are a new intern joining the project,
- are a clinic manager evaluating the product,
- are a care-team member trying to understand how the system should help them,
- are an engineer who needs to learn the product before changing code.

The goal is not to make the project sound more advanced than it is. The goal is to make the current state easy to understand and to clearly separate four things:

1. **What CheckIn Care is trying to become.**
2. **What has actually been built and is connected today.**
3. **What exists only as a prototype, simulation, partial implementation, or design document.**
4. **What still needs to be built before a real care team can depend on the product.**

This distinction matters because a screen, database table, helper function, or planning document is not the same as a complete feature. A feature is only complete when the user can use it end to end, the data is stored correctly, access is protected, failures are handled, tests cover important behavior, and the team can understand what went wrong if something breaks.

---

## The product in one paragraph

CheckIn Care is intended to help a healthcare team automatically check in with patients between visits or around important care events. A clinic or care team should be able to add patients, decide when each patient should receive a check-in, choose what questions should be asked, and let the system place an outbound phone call. During the call, the system should collect structured answers without trying to diagnose the patient or change treatment. If the patient says something that may require human attention, asks for help, wants a callback, opts out, or the automated system becomes uncertain, CheckIn Care should create a clear work item for a human care-team member. Staff should then be able to review what happened, follow up with the patient, record what they did, and see an audit history of important actions.

The repository also contains an earlier patient intake product. That intake flow lets a patient complete information through a web experience and lets staff review submitted intake information. The long-term product can keep that intake flow as another patient interaction channel, but the current product-development focus is the outbound check-in and voice-agent workflow.

---

## What "care team" means in these documents

The phrase **care team** is used as a broad term. It means the people responsible for monitoring patient outreach and deciding what human follow-up is needed.

Depending on the organization, that group could include:

- nurses,
- medical assistants,
- care coordinators,
- patient support staff,
- urgent-care operational staff,
- clinic administrators,
- clinicians who review selected escalations.

These documents do **not** assume that the AI system itself is a clinician. The system should support people who provide care; it should not replace medical judgment.

---

## Important product principle

A useful way to think about CheckIn Care is:

> Automation handles routine outreach. Humans keep control of decisions that may affect patient safety.

That means the system may automatically:

- decide that a scheduled check-in is due,
- place an approved outbound call,
- ask an approved set of questions,
- capture the patient's answers,
- summarize routine information,
- detect known conditions that require escalation,
- schedule a retry after a missed call according to an approved policy.

But the system should not independently:

- diagnose a disease,
- tell a patient to start, stop, or change medication,
- claim that an emergency has been handled when no human has accepted responsibility,
- silently ignore a concerning answer,
- grant access to patient information without checking permissions,
- hide failures by pretending a task completed successfully.

---

## Current maturity in simple terms

The repository contains meaningful working software, but the complete outbound voice product is not ready for a real clinic to depend on today.

The easiest way to understand the current state is to split the project into two generations.

### Generation 1: patient intake

The web-based intake product is the more mature part of the repository. It includes a real patient intake flow, session persistence, review and submission behavior, staff review screens, database-backed storage, and PDF output. It is best described as a working pilot rather than a finished production product.

### Generation 2: automated voice check-ins

The voice-agent expansion contains many useful foundations: call records, scheduling ideas, state-handling code, voice-related helpers, safety phrase detection, dashboard designs, analytics work, database migrations, and planning documents. However, important parts are still simulations, hardcoded sample data, or disconnected modules. A real telephone call is not yet the same thing as the current sandbox call flow, and a real-time speech/AI pipeline is not yet fully connected to the application runtime.

For that reason, the current voice product should be described as an **advanced prototype and architecture foundation**, not a production healthcare voice agent.

---

## Documentation map

Read the files in this order if you are new to the project.

### 1. [`01-product-overview.md`](./01-product-overview.md)

Explains the problem, the intended users, what the product should do, what value it provides, and what it deliberately should not do.

### 2. [`02-what-is-built-today.md`](./02-what-is-built-today.md)

Explains what exists in the repository today. It separates working end-to-end behavior from partial, prototype, hardcoded, or planned behavior.

### 3. [`03-what-is-missing.md`](./03-what-is-missing.md)

Lists the major gaps between the current repository and a product that a real care team can safely and reliably use.

### 4. [`04-care-team-and-urgent-care-workflows.md`](./04-care-team-and-urgent-care-workflows.md)

Explains how a nurse, coordinator, urgent-care operations team, clinic administrator, and patient should interact with CheckIn Care.

### 5. [`05-system-architecture-explained.md`](./05-system-architecture-explained.md)

Explains the major pieces of the system and how information moves between them. Technical terms are defined when introduced.

### 6. [`06-security-privacy-and-safety.md`](./06-security-privacy-and-safety.md)

Explains access control, patient-data protection, consent, audit history, safe AI behavior, escalation rules, and what must happen when the system is uncertain or unavailable.

### 7. [`07-client-onboarding-and-daily-operations.md`](./07-client-onboarding-and-daily-operations.md)

Explains what a clinic needs before going live, how staff should be invited and configured, how patients are imported, how check-in programs are set up, and how daily operations should work.

### 8. [`08-testing-observability-and-deployment.md`](./08-testing-observability-and-deployment.md)

Explains how we prove the system works, how we detect failures, how releases should be deployed, how backups and recovery should work, and why "it worked on my laptop" is not an acceptable production standard.

### 9. [`09-production-roadmap.md`](./09-production-roadmap.md)

Turns the gaps into an ordered build plan. It explains what should be done first, what can wait, and what "done" means at each stage.

### 10. [`10-client-readiness-checklist.md`](./10-client-readiness-checklist.md)

A practical gate that must be passed before a real client is allowed to depend on the product.

### 11. [`11-glossary.md`](./11-glossary.md)

Defines technical, healthcare-operations, AI, security, and software-development terms used in the documentation.

### 12. [`../repo_context.md`](../repo_context.md)

A repository-focused map for engineers and interns. It explains the technology stack, important folders, known implementation patterns, major inconsistencies, and areas that require an architecture decision before more code is added.

---

## How to read status words in these documents

To prevent confusion, these documents use the following labels.

### Built and connected

The feature exists in code and is connected to the application flow in a meaningful way.

This does not automatically mean the feature is production-ready.

### Partial

Important parts exist, but the feature is not complete end to end.

Example: a database record may be created, but a real external provider is not connected.

### Prototype

The feature demonstrates an idea but is not reliable or complete enough for production use.

Example: browser speech input or a simplified phrase-matching safety detector.

### Simulated or mock

The system behaves as if an external action occurred without actually performing that external action.

Example: generating a fake provider call identifier instead of placing a real telephone call.

### Hardcoded sample data

The screen displays fixed example values written directly into the application instead of reading current data from the database.

### Planned

The behavior is described in documentation or architecture, but the working implementation does not yet exist.

### Production-ready

A feature is production-ready only when it satisfies more than the happy path. It must have appropriate security, validation, failure handling, tests, monitoring, operational instructions, and user experience for the situations a real client is likely to encounter.

---

## What this documentation does not claim

These documents do not claim that CheckIn Care is currently certified, legally approved, medically validated, or ready to process real patient information in a live client environment.

They also do not claim that every planned healthcare workflow is appropriate for every clinic. Exact clinical responsibilities, consent language, call-recording rules, escalation procedures, retention periods, and legal/compliance requirements need to be decided with the client and qualified legal, security, privacy, and clinical stakeholders before a production launch involving real patient data.

---

## The most important next step

The project should not continue by simply picking the next old backlog ticket and writing more disconnected code.

First, the project needs a short recovery phase that freezes:

- the exact first client use case,
- the organization and user model,
- the canonical patient data model,
- the canonical call model,
- the real telephony provider boundary,
- the real voice/AI boundary,
- safety and escalation rules,
- access-control rules,
- data retention decisions,
- the production definition of done.

Once those foundations are agreed, implementation can continue in small tickets that each produce a verifiable user or system capability.
