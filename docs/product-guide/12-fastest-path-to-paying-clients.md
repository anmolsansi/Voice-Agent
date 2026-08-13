# Fastest Path From Today's Repository to a Complete Product Clients Can Buy

## Purpose

This document answers one commercial and engineering question:

> What is the shortest responsible path from the current CheckIn Care / Voice-Agent repository to a complete product that a client can buy, use, and keep paying for?

This plan follows a strict founder rule:

> If a client and CheckIn Care agree that the delivered product contains 10 features, all 10 features must be complete before the product is treated as commercially delivered. We do not deliver 8 features, charge for 8, and promise the remaining 2 later.

This rule changes the previous commercial strategy.

The earlier version of this plan allowed a paid design-partner or partial pilot engagement before the entire agreed product scope was complete. That approach is no longer the recommended commercial model for this project.

We can still talk to prospective clients early. We can still demonstrate prototypes with synthetic data. We can still gather requirements, negotiate contracts, and obtain written intent to buy. But the client should not be charged for an unfinished product if the commercial agreement says the client is buying the completed product.

The goal is therefore not:

```text
Sell something incomplete
-> collect partial revenue
-> finish the rest later
```

The goal is:

```text
Understand the exact client problem
-> freeze a complete scope
-> build every item in that scope
-> test every item
-> pass client-readiness gates
-> demonstrate the completed product
-> obtain client acceptance
-> activate billing for the complete product
-> operate it reliably
-> earn recurring revenue
```

This is deliberately a devil's-advocate plan. It assumes that a buyer will notice missing functionality, a patient will behave unexpectedly, a provider will fail, staff will make mistakes, and a clinic will not accept a product that requires the developer to manually repair ordinary workflows.

---

# 1. The founder's commercial principle

The commercial principle for CheckIn Care is:

## Complete the agreed scope before charging for the delivered product

If the client contract or statement of work says the product includes:

1. patient import,
2. staff accounts,
3. automated scheduling,
4. outbound calls,
5. voice check-ins,
6. safety escalation,
7. call history,
8. Patient 360,
9. reporting,
10. audit history,

then all 10 are part of the product definition.

If items 9 and 10 are unfinished, the product is not 80% commercially complete.

It is incomplete.

The response should not be:

> We completed eight, so pay us 80% and we will finish the other two later.

The response should be:

> Items nine and ten remain blockers. We finish them, test the entire workflow again, obtain acceptance, and then treat the scope as delivered.

This avoids four problems.

### Problem 1: client disappointment

The client bought an outcome, not a progress percentage.

### Problem 2: permanent unfinished work

Partial billing can create a habit where unfinished items remain in the backlog indefinitely.

### Problem 3: trust problems

Healthcare clients need to trust the product and the team. A pattern of "mostly complete" delivery weakens that trust.

### Problem 4: operational fragmentation

If every client is using a different partially completed version, support becomes extremely difficult.

---

# 2. What this rule does not mean

This rule does **not** mean we should blindly build every feature any prospect asks for.

That would create an endless custom-development company.

There are two separate questions:

## Question A: Should we agree to this feature?

This happens before scope is frozen.

We should challenge the request.

We should ask:

- Is this required for the client's main workflow?
- Is it useful to other likely clients?
- Does it create legal or clinical scope we do not want?
- Does it require a large integration that changes the project economics?
- Can we offer a simpler product solution?
- Does it belong in V1 or a separately priced future expansion?

We may say no.

## Question B: Once we agree to the feature, must we finish it?

Yes.

Once it is part of the signed accepted scope, it becomes a delivery obligation.

Do not solve scope-control problems by delivering incomplete work.

Solve them by freezing the right scope before implementation.

---

# 3. The commercial model changes from partial pilot revenue to complete-package revenue

The recommended commercial path is now:

## Stage 0: free or internal discovery

Purpose:

- understand the workflow,
- understand buyer needs,
- understand procurement/security requirements,
- determine whether CheckIn Care fits.

No production-delivery claim is made.

Activities may include:

- discovery calls,
- product walkthroughs,
- synthetic-data demonstrations,
- requirements interviews,
- technical/security discussions,
- pricing conversations,
- scope negotiation.

These activities help us avoid building the wrong product.

## Stage 1: complete-scope agreement

Before building client-specific work, define exactly what the client will receive.

The agreement should contain:

- included features,
- excluded features,
- workflow definition,
- user roles,
- integrations,
- supported patient population,
- supported geography where relevant,
- support model,
- security/privacy assumptions,
- acceptance criteria,
- client responsibilities,
- CheckIn Care responsibilities,
- launch gates,
- commercial terms.

The client may sign an agreement before the product is complete, but billing for the delivered software should follow the commercial structure you choose and must not represent incomplete delivery as complete delivery.

For this project, the recommended default is:

> Product subscription billing begins after the agreed complete scope passes acceptance and is activated for the client.

## Stage 2: complete implementation

Build the entire accepted scope.

No "we will finish this after go-live" for an item that is required for the agreed first release.

## Stage 3: complete acceptance

Run:

- automated tests,
- security tests,
- end-to-end tests,
- client acceptance tests,
- launch checklist,
- applicable external review.

## Stage 4: client activation and billing

Once the product is accepted and safe to activate:

- production access is enabled,
- billing begins,
- monitoring/support begins,
- operational metrics are tracked.

## Stage 5: recurring subscription

The client continues paying because the complete workflow continues creating value.

---

# 4. The first complete product we should sell

Do not sell "AI healthcare automation."

That is too broad and creates an unlimited feature expectation.

The fastest path is to define one **complete product package** around one high-value workflow.

## Recommended first product package

### CheckIn Care Post-Visit Follow-Up

Initial target:

- urgent-care groups,
- outpatient clinics,
- specialty clinics,
- similar care teams that perform repetitive patient follow-up calls.

Product promise:

> CheckIn Care automatically performs approved post-visit patient check-ins and gives the care team a complete, prioritized human follow-up workflow for cases that should not remain automated.

The important word is **complete**.

The product should not merely place a call.

It should cover the entire operational loop.

---

# 5. Complete V1 feature contract

Before seeking the first paying production client, freeze the V1 feature contract.

This is the proposed complete initial feature set.

## 5.1 Organization and client isolation

The product must support:

- organization creation,
- organization status,
- organization configuration,
- every protected record belonging to the correct organization,
- strict prevention of cross-organization access.

Why it matters:

If Clinic A can access Clinic B information, the product is not client-ready.

## 5.2 Staff accounts

The product must support:

- individual users,
- sign-in,
- sign-out,
- secure sessions,
- password/account lifecycle appropriate to the chosen authentication approach,
- disabled users,
- role assignment,
- server-side permission checks.

A shared staff password/token is not sufficient for a commercial multi-user product.

## 5.3 Patient management

The product must support:

- patient list,
- search,
- patient creation/import,
- patient detail,
- phone number,
- timezone,
- active/inactive state,
- communication state,
- external/client patient identifier where needed.

## 5.4 Consent and communication preferences

The product must support the approved communication model, including as applicable:

- consent evidence,
- opt-out,
- wrong number,
- invalid number,
- paused communication,
- revocation history,
- source/timestamp.

The exact legal rules require appropriate review for the intended deployment.

## 5.5 Care program

The first client needs at least one complete, versioned care program.

Example:

`48-Hour Post-Visit Follow-Up v1`

The system must know:

- which questions were approved,
- which version was used,
- which escalation policy was used,
- which patient was enrolled,
- when it was active.

## 5.6 Scheduling

The product must support:

- due time,
- patient timezone,
- allowed calling window,
- retries,
- pause/resume,
- no-answer handling,
- cancellation/opt-out behavior,
- idempotent job execution.

"Idempotent" means repeating the same scheduling job should not accidentally create duplicate calls for the same intended check-in.

## 5.7 Real outbound telephony

The complete product must make actual approved outbound telephone calls using the chosen provider.

It must include:

- real provider adapter,
- provider authentication,
- call creation,
- lifecycle events,
- official webhook verification,
- duplicate event handling,
- late/out-of-order event protection,
- provider failure handling.

The sandbox adapter remains useful for tests, but sandbox calls are not the commercial feature.

## 5.8 Real voice runtime

The system must support:

- telephone audio connection,
- speech recognition,
- conversation flow,
- text-to-speech,
- interruption/barge-in where supported,
- silence handling,
- misunderstanding recovery,
- low-confidence handling,
- disconnect handling,
- AI/provider failure behavior.

## 5.9 Structured results

After the call, the system must save useful structured outcomes rather than only raw conversation text.

Examples:

- call completed or incomplete,
- patient response to approved questions,
- callback requested,
- opt-out requested,
- escalation created,
- retry required,
- summary suitable for staff review.

## 5.10 Safety policy

The system must have defined safety behavior.

AI must not be the only safety mechanism.

Use:

- deterministic high-priority rules,
- structured classification where useful,
- confidence rules,
- schema validation,
- allowed-action rules,
- output validation,
- human handoff.

## 5.11 Durable human escalation

When a case needs a person, the escalation must become real work in the application.

It must have:

- patient,
- source call,
- priority,
- reason,
- evidence,
- assignee,
- status,
- created time,
- acknowledgment,
- resolution,
- resolution note,
- resolver,
- resolved time.

## 5.12 Today / work queue

A care coordinator should open the product and immediately understand:

- urgent cases,
- routine follow-ups,
- retry exhausted cases,
- upcoming calls,
- completed work,
- important system problems.

## 5.13 Patient 360

One page should show:

- patient basics,
- communication/consent state,
- program enrollment,
- next check-in,
- recent calls,
- escalations,
- timeline.

## 5.14 Call detail

A user must be able to understand what happened in one call.

Include:

- call status,
- attempts,
- timing,
- provider state,
- transcript where allowed,
- structured result,
- safety events,
- escalation,
- event timeline,
- relevant audit history.

## 5.15 Escalation queue

Staff must be able to:

- filter,
- assign,
- acknowledge,
- resolve,
- understand age/priority,
- see routing failure.

## 5.16 Patient import

The first production package should not require developer-written SQL to add patients.

CSV import is sufficient for the first version if it includes:

- upload,
- preview,
- validation,
- row-level errors,
- confirmation,
- safe import.

## 5.17 Reporting

Provide useful operational reporting, at minimum:

- scheduled,
- attempted,
- reached,
- completed,
- no answer,
- failed,
- escalated,
- unresolved,
- opt-outs,
- basic escalation timing.

## 5.18 Audit history

Important staff/admin actions should be attributable to a person.

Examples:

- patient viewed/changed,
- opt-out changed,
- schedule changed,
- escalation assigned/resolved,
- settings changed,
- report exported,
- role changed.

## 5.19 Client administration

The client should be able to perform routine operations without the founder changing source code.

At minimum:

- manage routine users,
- configure approved calling settings,
- manage escalation contacts/settings,
- view allowed program/configuration information,
- pause outbound activity through appropriate controls.

## 5.20 Production operations

The product must include:

- automated tests,
- CI,
- staging,
- release procedure,
- monitoring,
- alerts,
- backups,
- restore test,
- rollback,
- runbooks,
- emergency outbound call stop.

If we sell this exact V1 package, these items are not optional afterthoughts. They are part of the complete product.

---

# 6. What is explicitly not part of the first product

Completeness does not require unlimited scope.

The first product does **not** automatically include:

- native iOS app,
- native Android app,
- WhatsApp,
- SMS automation,
- inbound voice contact center,
- every EHR,
- Epic integration,
- Athena integration,
- custom insurance workflows,
- billing/claims,
- diagnosis,
- clinical decision support,
- medication changes,
- custom speech models,
- ten languages,
- predictive population health,
- Kubernetes,
- Kafka,
- many microservices.

These are not "unfinished features" if they were never included in the agreed V1 scope.

That distinction is critical.

A project can be fully complete with a deliberately narrow scope.

---

# 7. The acceptance matrix

Before implementation begins for a paying client, create an acceptance matrix.

Example:

| Feature | Included? | Acceptance test | Status |
|---|---|---|---|
| Staff login | Yes | Valid user can sign in; disabled user cannot | Pending |
| Patient import | Yes | Valid CSV imports; invalid rows show errors | Pending |
| Scheduling | Yes | Due patient generates one call inside allowed window | Pending |
| Real calling | Yes | Approved test number receives call | Pending |
| Voice check-in | Yes | Complete approved conversation successfully | Pending |
| Opt-out | Yes | Patient opt-out suppresses future calls | Pending |
| Escalation | Yes | Safety scenario creates durable queue item | Pending |
| Patient 360 | Yes | User sees live patient history | Pending |
| Reports | Yes | Metrics match test dataset | Pending |
| Audit log | Yes | Sensitive actions appear with correct actor | Pending |

The client scope is commercially complete only when every **Included = Yes** row passes.

Not when most rows pass.

---

# 8. Definition of Complete

Every feature needs more than visible UI.

A feature is complete only when all applicable parts are done.

## Product behavior

- intended user can perform the workflow,
- edge states are understandable,
- errors have useful messages,
- mobile/desktop behavior is acceptable where required.

## Backend

- required API/service behavior exists,
- validation exists,
- permission checks exist,
- external failures are handled.

## Database

- data persists correctly,
- ownership/relationships are correct,
- migrations exist,
- data integrity rules exist.

## Security

- authentication is enforced,
- authorization is enforced,
- organization ownership is checked,
- secrets are protected,
- sensitive logging is avoided.

## Testing

- unit tests where appropriate,
- database/integration tests where appropriate,
- API tests,
- permission tests,
- end-to-end tests for critical workflows.

## Operations

- logs/metrics exist where needed,
- failure is detectable,
- support can identify what happened,
- runbook exists for important failure modes.

## Documentation

- user/admin behavior is documented,
- operational behavior is documented where necessary.

A ticket marked "done" because the React screen exists but the live API is missing is not complete.

A call feature marked "done" because a mock provider returns success is not complete.

---

# 9. The fastest revenue strategy under the complete-scope rule

Because we are not using partial paid delivery, speed comes from four things:

## 9.1 Keep the first product scope narrow

Do not promise 50 features.

Promise the smallest complete workflow that solves a valuable client problem.

## 9.2 Standardize the product

Build one reusable package for similar clinics instead of ten custom versions.

## 9.3 Do buyer discovery while building

You can talk to buyers before billing them.

Use those conversations to validate:

- problem,
- scope,
- buyer,
- objections,
- security requirements,
- procurement requirements,
- willingness to buy after completion.

## 9.4 Parallelize independent engineering work

Once architecture contracts are frozen, separate workstreams can progress together:

- identity/tenancy,
- patient/consent,
- telephony/voice,
- care-team UI,
- testing/operations.

The answer to "ASAP" is not partial delivery.

The answer is **better scope control plus parallel execution**.

---

# 10. The first buyer profile

Do not start with the largest hospital system.

Large systems may require:

- long procurement,
- complex security review,
- enterprise SSO,
- EHR integration,
- vendor governance,
- legal review,
- architecture review,
- many stakeholders.

That can delay the first complete sale even if the software is good.

Better early targets include:

- independent urgent-care groups,
- small multi-site clinics,
- outpatient practices,
- specialty clinics,
- care-management organizations,
- practices with repetitive post-visit calls.

The ideal buyer has:

- a repeated manual phone workflow,
- enough volume that automation matters,
- an operations owner,
- authority to adopt software,
- manageable integration requirements,
- willingness to start with the standard V1 package.

---

# 11. Discovery is allowed before the product is complete

The no-partial-charging rule should not turn into "do not talk to customers until launch."

That would create a different risk: building the wrong complete product.

Use pre-launch conversations for learning.

Ask:

- Which calls do staff repeatedly make?
- How many per day/week?
- What information is collected?
- What happens after no answer?
- Which answers require human follow-up?
- How do you track that follow-up today?
- What makes the workflow frustrating?
- Which users need access?
- What reports matter?
- What security review is required?
- What integrations are mandatory versus nice-to-have?
- What would prevent you from buying the completed product?
- If the agreed complete scope works as demonstrated, who approves the purchase?

The important commercial shift is:

> Use early conversations to define what to finish, not as a reason to charge for unfinished delivery.

---

# 12. How to handle a client who asks for 10 features

This is the exact scenario behind the founder rule.

Suppose a client asks for:

1. patient import,
2. two user roles,
3. automated follow-up scheduling,
4. voice calling,
5. custom question set,
6. opt-out,
7. escalation queue,
8. CSV report,
9. Athena integration,
10. Spanish language support.

Do **not** immediately accept all 10.

First classify them.

## Core product features

Likely reusable:

1. patient import,
2. user roles,
3. scheduling,
4. voice calling,
5. program questions,
6. opt-out,
7. escalation,
8. reporting.

## Expansion features

Potentially larger scope:

9. Athena integration,
10. Spanish production support.

Then negotiate one of two honest scopes.

### Scope A

The client buys the standard V1 with features 1-8.

Features 9-10 are explicitly excluded from the first contract and may be proposed later.

If the client accepts Scope A, delivering features 1-8 is complete delivery.

### Scope B

The client says 9 and 10 are mandatory.

If CheckIn Care agrees, all 10 become the contract.

Then **all 10 must be complete before that agreed product is treated as delivered**.

Do not quietly convert Scope B into Scope A after work begins.

---

# 13. Change-request policy

Scope changes will happen.

The rule should be:

## Before scope freeze

Requirements can change freely while evaluating fit.

## After scope freeze

New requests are not silently inserted into the existing delivery.

A new request should be classified as:

- defect in agreed behavior,
- clarification of agreed behavior,
- new feature,
- future expansion.

### Defect

Fix it before acceptance.

### Clarification

Resolve against the written acceptance criteria.

### New feature

Create a new scope/version. Do not let it indefinitely delay an already agreed complete product unless both parties intentionally amend the agreement.

### Future expansion

Keep it outside current acceptance.

This protects completeness without allowing infinite scope growth.

---

# 14. No prorated feature delivery rule

Default commercial policy:

> We do not reduce a complete-product invoice because agreed features are unfinished. We finish the agreed features first.

This is different from usage billing.

After launch, variable charges for actual telephony/AI usage may still be appropriate because usage is an operating cost model, not a partial-delivery discount.

It is also different from separately purchased add-ons.

If a client bought:

- Core Product, and
- EHR Integration Add-On,

these can be separate complete commercial packages if the contract clearly defines them that way.

But each package should have its own completion criteria.

---

# 15. Sales model before completion

You can still build a pipeline immediately.

The preferred pre-completion sales process is:

```text
Prospect identified
-> discovery
-> product demonstration
-> scope fit
-> security/procurement discovery
-> complete-scope proposal
-> conditional commitment / signed agreement as appropriate
-> implementation to full acceptance
-> production activation
-> billing / recurring subscription
```

The exact contract and billing structure should be reviewed appropriately for the business and jurisdiction.

The product documentation should not pretend to be legal advice.

---

# 16. Demo strategy

A demo can exist before the complete production product.

The demo should use synthetic/test data until real-data handling is approved.

The demo is a sales and requirements tool, not a partially delivered paid product.

## Demo scene 1: Today

Show:

- urgent follow-ups,
- routine follow-ups,
- failed/retry exhausted calls,
- upcoming calls,
- completed calls.

## Demo scene 2: Patient 360

Show:

- contact,
- callability/consent state,
- program,
- next check-in,
- call history,
- escalation history.

## Demo scene 3: real or clearly simulated call

Until real telephony is complete, label simulated behavior clearly.

Once real calling exists, use approved test numbers.

## Demo scene 4: routine completion

Show:

- transcript,
- structured result,
- status,
- staff summary.

## Demo scene 5: escalation

Show:

- concerning response,
- safety rule,
- escalation creation,
- staff queue,
- resolution.

## Demo scene 6: no answer

Show retry behavior.

## Demo scene 7: opt-out

Show future calls being stopped.

## Demo scene 8: reporting

Show management value.

---

# 17. Engineering sequence optimized for full delivery

## Milestone 0: architecture reconciliation

Complete:

- `docs/repo_context.md`,
- canonical organization model,
- canonical patient model,
- canonical call/session/attempt model,
- canonical audit model,
- migration strategy,
- first telephony provider decision,
- voice integration decision,
- role model,
- safety boundary,
- initial client geography/use case.

Exit rule:

No critical production feature starts on top of unresolved duplicate core models.

## Milestone 1: identity and tenancy

Complete:

- organizations,
- users,
- sessions,
- roles,
- server-side authorization,
- tenant ownership checks,
- protected routes,
- cross-organization tests.

Exit rule:

Clinic A cannot access Clinic B protected records through UI or direct API calls.

## Milestone 2: patient and consent

Complete:

- canonical patient,
- contact state,
- callability,
- consent/evidence model,
- opt-out,
- wrong number,
- patient list/search/detail,
- CSV import foundation.

Exit rule:

Scheduling, calls, and staff UI all use the same database-backed patient identity.

## Milestone 3: care program and scheduling

Complete:

- one versioned program,
- enrollment,
- schedule,
- timezone,
- call windows,
- retry rules,
- pause/resume,
- idempotent scheduler,
- job-run visibility.

Exit rule:

A due enrolled patient produces exactly the intended check-in work.

## Milestone 4: production telephony

Complete:

- provider interface,
- real outbound adapter,
- official webhook verification,
- event deduplication,
- state transition protection,
- timeouts/failures,
- test provider retained.

Exit rule:

Approved test numbers can receive real tracked calls reliably.

## Milestone 5: production voice runtime

Complete:

- audio stream,
- STT,
- conversation workflow,
- TTS,
- interruption,
- silence,
- misunderstanding recovery,
- low confidence,
- provider/AI failure,
- structured output.

Exit rule:

A test patient can complete the approved program by telephone and create correct persisted results.

## Milestone 6: safety and escalation

Complete:

- high-priority rules,
- model validation,
- human request,
- escalation model,
- queue,
- assign,
- acknowledge,
- resolve,
- routing failure,
- unavailable human behavior.

Exit rule:

Every approved synthetic safety case results in the expected durable human workflow.

## Milestone 7: care-team product

Complete:

- Today,
- Patients,
- Patient 360,
- Calls,
- Call Detail,
- Escalations,
- Admin settings required for V1,
- understandable error states.

Exit rule:

A care coordinator can perform routine daily work without engineering intervention.

## Milestone 8: onboarding and reporting

Complete:

- client setup,
- user setup,
- patient CSV import,
- program enrollment,
- configuration validation,
- reports,
- audit search,
- launch readiness view/checklist.

Exit rule:

A second similar client could be set up without manually writing database records.

## Milestone 9: tests and AI evaluation

Complete:

- unit tests,
- PostgreSQL integration tests,
- API tests,
- authorization tests,
- webhook tests,
- voice scenarios,
- AI evaluations,
- browser E2E tests.

Exit rule:

Critical journeys fail the automated build when behavior regresses.

## Milestone 10: production operations

Complete:

- CI,
- staging,
- deployment,
- smoke tests,
- feature flags where useful,
- monitoring,
- alerts,
- backups,
- restore test,
- rollback,
- incident runbooks,
- kill switch.

Exit rule:

The team can detect, pause, understand, and recover from major failures.

## Milestone 11: complete client acceptance

Complete:

- every V1 acceptance row,
- security review,
- operational review,
- applicable privacy/legal/telephony/clinical review,
- client UAT,
- launch approval.

Only after this milestone should the agreed production scope be called delivered.

---

# 18. Aggressive 30-day push under the no-partial-delivery rule

This is an aggressive target, not a promise.

The exact duration depends on provider integration, external reviews, existing code quality, and client requirements.

## Days 1-3

Freeze:

- first client package,
- exact V1 feature list,
- acceptance matrix,
- architecture decisions,
- explicit exclusions.

Engineering:

- reconcile canonical models,
- separate demo data from production paths,
- remove misleading completion claims,
- create development branches/tickets around complete vertical slices.

Commercial:

- start buyer discovery,
- show clearly labeled demo,
- collect procurement/security requirements,
- do not invoice for incomplete product delivery.

## Days 4-7

Parallel work:

### Track A

Organizations, users, roles, tenant authorization.

### Track B

Patient, consent, callability, CSV import model.

### Track C

Call/schedule model, scheduler, retry behavior.

### Track D

Care-team live UI architecture and removal of hardcoded production-like sample state.

Goal:

Complete the core data/security foundation quickly enough that later features do not need rewrites.

## Week 2

Build:

- real telephony adapter,
- signed/verified webhook handling,
- real call lifecycle,
- voice runtime vertical slice,
- structured result persistence.

In parallel:

- Today,
- Patient 360,
- Call Detail,
- Escalation UI connected to live APIs.

## Week 3

Finish:

- safety rules,
- durable escalation,
- opt-out,
- no-answer/retry,
- call-me-later if included in frozen scope,
- onboarding,
- CSV validation,
- admin settings required for V1,
- reporting,
- audit.

Begin full-system tests.

## Week 4

Finish:

- missing acceptance rows,
- E2E tests,
- AI evaluations,
- security tests,
- CI/CD,
- staging,
- production monitoring,
- backup/restore,
- rollback,
- runbooks,
- launch checklist,
- client UAT preparation.

If any included V1 feature remains incomplete at day 30, it remains a blocker rather than a reason to prorate the product.

External healthcare/security/legal approvals may extend the calendar. Engineering speed cannot force an external approval to exist.

---

# 19. Parallelization rules

To move faster without lowering completeness:

## Parallelize independent modules

Examples:

- auth/tenancy,
- patient/consent,
- frontend screens,
- telephony adapter,
- tests/CI scaffolding.

## Do not parallelize unresolved contracts

Do not have three engineers independently invent:

- three patient models,
- three call schemas,
- separate status vocabularies.

Freeze shared interfaces first.

## Merge small complete changes

A small commit can be part of a larger feature.

But the feature is not commercially complete until the vertical slice passes its full acceptance criteria.

---

# 20. Ticket strategy

Each ticket should be small enough to execute and review, but tickets must roll up into feature completion.

Example feature:

`Patient opt-out`

Possible tickets:

1. add communication-state schema,
2. add opt-out service action,
3. expose authenticated API,
4. add voice opt-out event handling,
5. suppress future schedules,
6. add staff UI,
7. add audit event,
8. add database/API/E2E tests.

Do not mark the **feature** complete after ticket 3.

All required tickets must pass.

---

# 21. Complete product versus complete company

A complete V1 product does not mean the company has every future capability.

The V1 can be complete while future roadmap items remain.

Example:

```text
V1 COMPLETE
- one post-visit program
- voice channel
- CSV import
- staff operations
- safety/escalation
- reporting

V2 FUTURE
- SMS
- FHIR
- selected EHR
- additional programs
- SSO
- more languages
```

The key is that V2 items were not promised as V1 deliverables.

---

# 22. Pricing after complete delivery

Exact pricing is a founder/market decision.

The model should be simple enough for the first clients.

Possible structure:

```text
Monthly platform subscription
+
Included usage allowance
+
Additional usage if applicable
```

or:

```text
Monthly fee per site / active patient band / completed check-in band
```

Avoid raw-token pricing because buyers generally care about workflows, not model tokens.

Track internal unit economics:

```text
Revenue
- telephony
- STT
- LLM
- TTS
- infrastructure
- support operations
= contribution margin
```

Do not hide incomplete product delivery inside a discount.

Discounts should be intentional commercial decisions, not compensation for missing agreed features.

---

# 23. Complete package options

Instead of partial feature billing, define separate complete packages.

## Package A: Core Post-Visit Follow-Up

A fully completed standard product.

Includes the frozen V1 features.

## Package B: Additional Site Expansion

A complete expansion package for another site/team.

## Package C: Additional Care Program

A complete approved additional care-program package.

## Package D: Integration Add-On

A complete specific integration such as a future EHR/API integration.

Each package should have:

- defined scope,
- defined acceptance criteria,
- clear completion state.

This allows commercial flexibility without selling incomplete pieces of one package.

---

# 24. Client readiness gate

Before billing begins for the production product, verify the complete scope and the broader production conditions.

## Commercial completeness

- [ ] all contracted V1 features are implemented,
- [ ] all contracted V1 features pass acceptance tests,
- [ ] no contracted feature is represented only by a mock unless the contract explicitly defines it as test-only,
- [ ] no contracted staff screen depends on hardcoded demo data,
- [ ] all required client configuration exists,
- [ ] all explicit exclusions remain clearly documented.

## Organization and access

- [ ] every protected record has correct organization ownership,
- [ ] users have individual accounts,
- [ ] APIs require authentication,
- [ ] server-side authorization is enforced,
- [ ] cross-organization access tests pass,
- [ ] disabled-user behavior works.

## Patient communication

- [ ] phone validation,
- [ ] consent/callability model,
- [ ] opt-out,
- [ ] wrong-number handling,
- [ ] retry limits,
- [ ] timezones/call windows,
- [ ] approved disclosure/consent approach where applicable.

## Telephony

- [ ] real calls work,
- [ ] provider callbacks are verified,
- [ ] duplicate callbacks are safe,
- [ ] late callbacks cannot regress state,
- [ ] provider outage behavior is known.

## Voice

- [ ] ordinary conversation works,
- [ ] silence handling,
- [ ] interruption handling,
- [ ] misunderstanding handling,
- [ ] AI/provider failure behavior,
- [ ] structured result persistence.

## Safety/escalation

- [ ] approved safety scenarios pass,
- [ ] escalations persist,
- [ ] escalations reach staff queue,
- [ ] assign/acknowledge/resolve works,
- [ ] unresolved work cannot silently disappear,
- [ ] unavailable-human behavior is defined.

## Operations

- [ ] tests pass,
- [ ] CI protects changes,
- [ ] staging exists,
- [ ] release is repeatable,
- [ ] monitoring is live,
- [ ] alerts are routed,
- [ ] backups are automated,
- [ ] restore test passed,
- [ ] rollback works,
- [ ] emergency call stop works.

## External review

- [ ] applicable client security requirements are satisfied,
- [ ] applicable privacy/legal requirements are satisfied,
- [ ] telephony/recording requirements are reviewed,
- [ ] clinical/safety boundaries are approved where needed,
- [ ] vendor/provider requirements are satisfied.

## Client acceptance

- [ ] UAT completed,
- [ ] acceptance matrix completed,
- [ ] critical defects resolved,
- [ ] agreed sign-off/approval recorded.

---

# 25. What to do when 9 out of 10 features are complete

Do not launch the product as complete solely because 90% sounds high.

Process:

1. Identify the remaining feature.
2. Determine whether it is truly part of agreed scope.
3. If yes, keep the delivery open.
4. Finish implementation.
5. Run feature-level tests.
6. Run regression tests across the full workflow.
7. Update acceptance matrix.
8. Re-run relevant client UAT.
9. Only then close delivery.

If the client voluntarily decides the feature is no longer needed, change the written scope formally.

Do not silently delete it from the definition of done.

---

# 26. Founder dashboard

Track two kinds of progress separately.

## Commercial pipeline

- target organizations,
- contacts,
- replies,
- discovery calls,
- demos,
- proposals,
- complete-scope agreements,
- UAT scheduled,
- activated clients,
- subscriptions,
- renewals,
- expansions.

## Delivery completeness

For each potential/contracted client package:

- total included acceptance rows,
- rows passed,
- rows blocked,
- critical defects,
- external approvals pending,
- UAT status,
- activation status.

Do not report "90% delivered" as though it means "ready to invoice."

Report:

> 9/10 acceptance items pass. One contracted item remains. Delivery is not yet accepted.

That keeps incentives clean.

---

# 27. Biggest commercial traps under this model

## Trap 1: agreeing to too many features

Because we insist on complete delivery, bad scope discipline can destroy speed.

Fix scope before promising it.

## Trap 2: treating a mock as delivery

A simulated provider is useful for development. It is not a real-call feature.

## Trap 3: infinite client changes

Complete delivery does not mean accepting unlimited mid-project additions.

Use the change-request policy.

## Trap 4: hidden manual work

If the founder manually fixes normal client workflows, the feature is not fully productized.

## Trap 5: false completion from UI

A pretty screen connected to hardcoded arrays is not a finished operational feature.

## Trap 6: production without operations

If backups, monitoring, rollback, and support do not exist, the product is not complete for a real client dependency.

## Trap 7: compliance theater

Documentation does not replace applicable legal/security/privacy/clinical review.

## Trap 8: waiting to talk to buyers

You can validate the product before charging. Avoid building the wrong complete product.

---

# 28. Kill switch requirement

Before real client activation, authorized users/operators need a safe way to pause automation.

At minimum consider:

- pause patient,
- pause care program,
- pause organization,
- pause all outbound calls.

Actions must be:

- permission protected,
- auditable,
- visible,
- reversible where appropriate.

If outbound behavior becomes unsafe, we should not need to deploy code to stop it.

---

# 29. Failure messages for ordinary users

A care coordinator should not receive raw engineering errors as the primary explanation.

Bad:

```text
ECONNRESET webhook 500
```

Better:

```text
The calling service was temporarily unavailable. This call was not marked complete. The next retry will follow the configured retry policy.
```

Technical details can remain available to operations/support users.

User-facing failure handling is part of completion.

---

# 30. Definition of usable

A complete V1 is usable when a client can perform ordinary work without engineering intervention.

The client can:

1. sign in,
2. access only its organization,
3. manage routine staff access,
4. import patients,
5. understand patient callability,
6. enroll the patient in the approved program,
7. see upcoming check-ins,
8. allow scheduling to run automatically,
9. receive real voice calls,
10. see outcomes,
11. see and resolve escalations,
12. respect opt-outs,
13. view reports,
14. review audit information required for their workflow,
15. understand failures,
16. contact support,
17. pause automation through approved controls.

---

# 31. Definition of sellable

Under this founder policy, a product is sellable when:

- the buyer understands the exact scope,
- the scope solves a real problem,
- every included feature is complete,
- acceptance criteria pass,
- launch gates pass,
- support/operations are defined,
- the product can be activated without pretending unfinished work is complete.

A product is not sellable merely because a demo is impressive.

---

# 32. Definition of renewable

A client will continue paying when:

- the complete workflow is used repeatedly,
- staff trust the product,
- failures are visible/manageable,
- the system saves measurable effort or improves operations,
- support is dependable,
- reporting justifies the spend,
- replacing the system with the old manual workflow would be painful.

---

# 33. Definition of scalable revenue

Revenue is not scalable if each client requires the founder to:

- create database rows manually,
- change source code for ordinary configuration,
- deploy a private fork,
- inspect every call,
- manually retry normal failures,
- build every client a unique product,
- explain every error personally.

The first client may receive hands-on onboarding, but normal operation must increasingly become productized.

---

# 34. Self-service priorities

Before clients two through five, prioritize:

- organization setup,
- staff invitations/deactivation,
- patient import,
- patient correction,
- care-program enrollment,
- schedule pause/resume,
- call-window settings,
- escalation routing,
- reports,
- audit search.

Complete delivery is easier to repeat when normal configuration is self-service.

---

# 35. Integration sequence

Do not let integrations prevent first complete delivery unless the first client truly requires them.

Preferred order:

## First

CSV import/export.

## Then

Stable external API/webhooks.

## Then

FHIR where useful.

FHIR is a healthcare data exchange standard that defines common resource structures and APIs for exchanging healthcare information.

## Then

Specific EHR integrations justified by committed customers.

If a specific EHR integration is in the signed first-client scope, however, the complete-delivery rule applies and it must be finished before acceptance.

---

# 36. Additional care programs

Do not create ten half-complete programs.

Finish one program.

Then create reusable building blocks:

- yes/no,
- numeric scale,
- free response,
- confirmation,
- clarification/retry,
- escalation rule,
- callback request,
- closing instructions.

Future programs can then be complete configurations instead of separate ad hoc implementations.

---

# 37. Current web intake

Do not throw away the existing intake product.

Longer term:

```text
Care Program
    |
    +--> Voice
    +--> Web intake / follow-up
    +--> SMS later if justified
```

For the first voice product, preserve the existing intake flow and integrate shared patient/organization concepts deliberately rather than redesigning everything at once.

---

# 38. Support model

Before activation, define:

- support contact,
- severity levels,
- support hours,
- incident handling,
- emergency stop process,
- client communication process.

Runbooks should cover at minimum:

- telephony outage,
- AI outage,
- scheduler stuck,
- duplicate call risk,
- escalation routing failure,
- database outage,
- suspected data exposure,
- incorrect client configuration,
- emergency outbound pause.

Support readiness is part of complete delivery.

---

# 39. Trust package

Prepare client-facing material such as:

- architecture overview,
- data-flow diagram,
- authentication/authorization overview,
- encryption approach,
- audit approach,
- retention approach,
- backup/recovery approach,
- incident response,
- subprocessor/vendor list,
- secure-development process,
- vulnerability-management approach,
- support model,
- privacy/security contacts.

Some materials require qualified legal/privacy/security/clinical review.

Do not substitute engineering documentation for required professional review.

---

# 40. Stop conditions after launch

Complete delivery does not mean ignoring incidents because the client is now paying.

Pause relevant automation if an uncontrolled condition includes:

- possible cross-client data exposure,
- repeated duplicate calls,
- opt-out failure,
- high-priority escalation failure,
- disallowed medical guidance,
- corrupt call-state retries,
- webhook authenticity failure,
- inability to understand system state during a major incident.

Continuing unsafe automation to protect revenue is unacceptable.

---

# 41. Decision log

These decisions must be explicitly resolved.

## Needs Architect Decision

- canonical organization model,
- canonical patient model,
- canonical call/session/attempt model,
- canonical audit model,
- migration reconciliation,
- production deployment architecture,
- first telephony provider,
- voice runtime pattern.

## Needs Product/Founder Decision

- exact first product package,
- exact V1 features,
- target buyer,
- initial geography,
- pricing model,
- billing start condition,
- support hours,
- recording requirement,
- expansion-package strategy.

## Needs Clinical/Product Safety Decision

- approved questions,
- prohibited behavior,
- safety categories,
- escalation expectations,
- unavailable-human behavior,
- patient-facing language.

## Needs Security/Privacy Decision

- MFA requirement,
- transcript access,
- retention,
- recording policy,
- export policy,
- support access.

## Needs Legal/Compliance Review

- privacy/security obligations,
- client agreements,
- consent/disclosure rules,
- call recording rules,
- vendor/subprocessor requirements,
- marketing claims,
- final commercial contract structure.

---

# 42. Recommended next engineering actions

In order:

1. Freeze the standard V1 commercial feature set.
2. Create the master V1 acceptance matrix.
3. Freeze canonical organization/patient/call/audit contracts.
4. Reconcile migrations.
5. Implement organizations and tenant isolation.
6. Implement individual users, roles, and centralized authorization.
7. Implement canonical patient, consent, opt-out, and callability.
8. Implement one versioned care program.
9. Implement canonical schedule/call session/call attempt domain.
10. Harden scheduler idempotency and retries.
11. Integrate one real telephony provider.
12. Implement official webhook verification/deduplication/state ordering.
13. Implement real telephone voice runtime.
14. Implement structured response extraction and validation.
15. Implement deterministic safety rules plus approved AI boundary.
16. Implement durable escalation lifecycle.
17. Build Today queue on live APIs.
18. Build Patient list and Patient 360 on live APIs.
19. Build Call Detail on live data.
20. Build Escalation queue/actions on live data.
21. Implement CSV patient import with validation.
22. Implement required client/admin settings.
23. Implement reports.
24. Implement audit search/history.
25. Expand unit/integration/API/permission/webhook/voice tests.
26. Add browser E2E tests.
27. Add AI evaluation suite.
28. Add CI/CD.
29. Add staging.
30. Add monitoring and alerts.
31. Add backups and prove restore.
32. Add rollback and emergency stop controls.
33. Complete applicable external reviews.
34. Run the entire client-readiness checklist.
35. Run client UAT against every included acceptance row.
36. Fix every blocking defect.
37. Obtain acceptance.
38. Activate the client.
39. Begin recurring billing according to the final agreement.
40. Measure operational value and renewal signals.

---

# 43. The one-line strategy

If the team remembers only one sentence, use this:

> Keep the first scope small, but once we promise it, finish every promised part, prove it works end to end, get acceptance, and only then treat it as commercially delivered.

---

# 44. Final devil's-advocate verdict

## Can the current repository be sold today as a finished production healthcare product?

No.

## Should we charge a client for an 8-of-10 feature delivery if the agreement says they are buying all 10?

No.

Finish all 10 or formally change the scope before calling the delivery complete.

## Does this mean we should build everything every prospect asks for?

No.

Challenge and narrow the scope before committing.

## Can we talk to buyers immediately?

Yes.

Use discovery, demos, security conversations, and proposals to validate the product while engineering finishes the standard V1.

## What is the fastest route to regular revenue under this rule?

1. Define the smallest valuable complete product.
2. Freeze its exact feature set and exclusions.
3. Freeze architecture contracts.
4. Parallelize independent implementation.
5. Complete every feature in the package.
6. Pass automated/security/operational/client acceptance tests.
7. Complete applicable external review.
8. Activate the client only when the full agreed scope is ready.
9. Begin recurring billing for the complete product.
10. Reuse the same complete product for the next similar client.
11. Add future expansions as separately defined complete packages.

The commercial advantage of this approach is trust and repeatability.

The cost is that scope discipline becomes extremely important.

If we promise too much, we delay revenue.

Therefore the fastest path is not partial delivery. It is **a deliberately small but fully complete first product**.