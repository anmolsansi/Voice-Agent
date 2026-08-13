# Definition of Commercially Complete

## Purpose

This file defines one project rule:

> If an agreed delivery contains 10 features, all 10 must be finished before that delivery is called complete.

Engineering progress may be 8/10 or 9/10, but commercial completion is pass/fail against the agreed scope.

---

# 1. Narrow the scope before committing

Completeness does not mean accepting every request.

Before adding a feature to the delivery, decide whether it is:

- required for the main workflow,
- reusable for other clients,
- safe to support,
- realistic to complete in the delivery window,
- necessary now instead of a future expansion.

Features that are not required should be explicitly excluded rather than accepted and left unfinished.

---

# 2. Once included, finish it

If a feature is included in the agreed V1, it remains a blocker until it meets its acceptance criteria.

Example:

| Feature | Included | Status |
|---|---:|---|
| Staff login | Yes | Complete |
| Patient import | Yes | Complete |
| Scheduling | Yes | Complete |
| Real outbound call | Yes | Complete |
| Voice workflow | Yes | Complete |
| Opt-out | Yes | Complete |
| Escalation | Yes | Complete |
| Patient 360 | Yes | Complete |
| Reporting | Yes | Incomplete |
| Audit history | Yes | Incomplete |

This delivery is not complete because two included features remain incomplete.

---

# 3. Feature Definition of Done

A feature is complete only when all applicable layers are finished.

## User experience

- intended user can complete the workflow,
- loading, empty, and error states are understandable,
- required mobile/desktop behavior works.

## Backend

- APIs and services exist,
- validation exists,
- failures are handled.

## Data

- records persist correctly,
- migrations exist,
- ownership and constraints are correct.

## Security

- authentication is enforced,
- authorization is enforced,
- organization ownership is checked,
- sensitive information is handled appropriately.

## Testing

- required unit tests,
- integration tests,
- API tests,
- permission tests,
- critical end-to-end tests.

## Operations

- important failures are detectable,
- support can understand what happened,
- required monitoring exists.

A screen backed only by hardcoded demo data is not a completed live feature.

A sandbox call is not a completed real-calling feature.

---

# 4. Acceptance matrix

Every included feature should have a written acceptance test.

Example:

| ID | Feature | Acceptance evidence |
|---|---|---|
| F01 | User access | Valid user signs in; disabled user is blocked |
| F02 | Tenant isolation | Clinic A cannot read Clinic B records |
| F03 | Patient import | Valid rows import; invalid rows show errors |
| F04 | Scheduling | Due patient creates exactly one intended call |
| F05 | Calling | Approved test number receives a tracked real call |
| F06 | Voice | Approved conversation completes and stores results |
| F07 | Opt-out | Opt-out suppresses future automated calls |
| F08 | Escalation | Safety scenario creates a durable human work item |
| F09 | Reporting | Metrics match a known test dataset |
| F10 | Audit | Important actions show the correct user and time |

The delivery is complete only when all required acceptance rows pass.

---

# 5. Scope changes

New requests after scope freeze should be classified.

## Bug

The implementation does not match the agreed behavior. Fix before completion.

## Clarification

Resolve the intended behavior and update acceptance criteria.

## New feature

Place it in a new scope or future expansion unless the current scope is formally changed.

This prevents an agreed project from growing forever while still protecting the rule that every promised feature must be finished.

---

# 6. Separate complete packages

The product can have separately complete packages.

Example:

## Core V1

- patient import,
- staff accounts,
- scheduling,
- voice check-ins,
- escalation,
- reporting.

## Later Integration Package

- one EHR integration.

## Later Expansion Package

- second care program,
- second site,
- additional language.

Each package has its own scope and Definition of Done.

This is how CheckIn Care stays fast without pretending unfinished work is finished.

---

# 7. Status language

Use these words consistently:

- **Planned**: not implemented.
- **In Progress**: implementation exists but acceptance is incomplete.
- **Prototype**: proves an idea but is not production delivery.
- **Simulated**: uses a fake/test external dependency.
- **Integrated**: connected through the real application layers.
- **Verified**: required tests pass.
- **Client Ready**: complete scope and launch gates pass.
- **Commercially Complete**: every included acceptance item is complete.

Do not use "done" for a feature that is only partially wired.

---

# 8. Exact 10-feature rule

If a client wants 10 features, first decide whether all 10 truly belong in the first version.

If only 8 are necessary, explicitly agree to an 8-feature V1 and move 2 to a later expansion.

If all 10 are accepted into V1, finish all 10.

Do not accept 10, finish 8, and redefine the missing 2 as acceptable unfinished work.

---

# 9. Final rule

> **Save time by keeping the promise small, not by leaving the promise unfinished.**

That is the completion standard for CheckIn Care.