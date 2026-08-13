# Fastest Path From Today's Repository to Paying Clients

## Purpose

This document answers a commercial question, not only an engineering question:

> What is the shortest honest path from the current CheckIn Care / Voice-Agent repository to a product that a real client can pay for and use repeatedly?

The answer is not "finish every feature." It is also not "deploy the current repository and call it production-ready."

The fastest responsible path is to create a narrow product that solves one painful workflow extremely well, sell it first as a controlled paid pilot, and then convert that pilot into recurring software revenue once the production, security, privacy, and operational controls are proven.

This document is deliberately written as a devil's-advocate plan. It assumes that a buyer will ask difficult questions, a patient will behave unexpectedly, a provider will fail at the worst possible time, and a clinic will not tolerate software that requires the developer to manually repair ordinary workflows.

The commercial goal is:

> Get to the first legitimate paying client as quickly as possible without lying about product readiness, then turn that client into recurring revenue by removing the remaining manual work and proving reliability.

---

# 1. The uncomfortable truth

The current repository cannot honestly be sold today as a finished production healthcare SaaS product.

It contains real and useful software, including a working web intake flow, staff review workflow, PostgreSQL persistence, call-domain groundwork, dashboard work, scheduling concepts, safety helpers, and substantial voice-agent architecture.

However, important parts of the outbound voice product are still prototype, simulated, disconnected, duplicated, or incomplete.

Examples include:

- simulated outbound call behavior,
- incomplete production telephony integration,
- no complete live telephone audio-to-AI-to-audio pipeline,
- hardcoded/sample voice dashboard data,
- overlapping patient/call/audit data models,
- incomplete per-user authorization across all protected routes,
- no complete multi-client organization isolation,
- incomplete consent and communication-preference history,
- incomplete durable escalation workflow,
- incomplete automated test coverage,
- no mature CI/CD release process,
- no proven production monitoring/recovery process,
- no finished client onboarding experience,
- no complete security/compliance launch package.

Therefore there are two different commercial milestones.

## Commercial milestone A: sellable engagement

A client can pay for a controlled implementation/pilot engagement before the full production SaaS is finished.

What you are selling is:

- a defined use case,
- a configured demonstration,
- workflow design,
- implementation/setup work,
- a controlled pilot,
- agreed delivery milestones,
- eventual recurring access if the pilot succeeds.

This can be sold much sooner.

## Commercial milestone B: sellable production SaaS

A client can depend on the system for real patient operations with agreed security, privacy, availability, support, and failure behavior.

This requires the production-readiness work described in the rest of this documentation set.

Do not confuse A and B.

A paid pilot is still revenue.

Pretending A is B creates legal, clinical, security, reputational, and commercial risk.

---

# 2. The first product to sell

Do not sell "AI healthcare automation."

That is too broad.

Do not initially sell:

- full patient engagement,
- full contact-center replacement,
- all urgent-care workflows,
- diagnosis,
- clinical decision support,
- appointment automation,
- medication management,
- EHR replacement,
- omnichannel communication.

Sell one narrow workflow.

## Recommended first sellable workflow

### 48-Hour Post-Visit Follow-Up

The clinic enrolls selected patients after an urgent-care or similar outpatient visit.

The system later contacts the patient and asks a short approved set of non-diagnostic questions.

The system records structured answers and identifies responses that require human follow-up.

The care team receives a prioritized queue and resolves each follow-up item.

Plain-language example:

```text
Patient visits clinic
        |
        v
Patient is enrolled in follow-up program
        |
        v
CheckIn Care schedules follow-up
        |
        v
Patient receives automated phone call
        |
        v
Approved questions are asked
        |
        +---- Routine answers ----> Completed
        |
        +---- Concerning answer --> Human follow-up queue
        |
        +---- No answer ----------> Retry policy
        |
        +---- Stop calling -------> Opt-out
        |
        v
Care team sees result and acts when needed
```

This is narrow enough to build and test properly.

It is also easy for a client to understand.

---

# 3. Why this first use case is commercially better than a generic voice agent

A clinic buyer does not primarily care that the product uses an LLM, STT, TTS, agents, webhooks, embeddings, or orchestration.

They care about operational outcomes.

A first use case should answer questions such as:

- Can we reach more patients without staff manually dialing everyone?
- Can staff quickly see which patients need follow-up?
- Can routine check-ins be handled consistently?
- Can we reduce repetitive phone work?
- Can we prove which patients were contacted?
- Can a staff member see what happened without listening to every call?
- Can patients easily request a human?
- Can the system stop calling people who opt out?
- Can we identify failures instead of silently losing them?

That is what the sales story should focus on.

---

# 4. The immediate revenue strategy

The fastest revenue path should have three commercial stages.

## Stage A: paid design partner

Sell before the product is fully production-ready, but be precise about what is being purchased.

The client buys:

- workflow discovery,
- configuration of one follow-up program,
- demo environment,
- synthetic/test patient scenarios,
- staff workflow design,
- pilot-readiness assessment,
- implementation roadmap,
- reserved founding-client pricing for the eventual live pilot.

This engagement should not require real patient data initially.

The product can use synthetic patients such as:

```text
Maria Garcia
Robert Patel
Evelyn Chen
Sam Wilson
```

with clearly fictional information.

This gives you an honest product you can demonstrate while production controls are being completed.

## Stage B: controlled paid pilot

Once the minimum launch gate is met, run a narrow pilot with:

- one client organization,
- one site or care team,
- one approved care program,
- a small patient cohort,
- one geographic/legal operating model,
- one telephony provider,
- one voice/AI configuration,
- human escalation,
- restricted user roles,
- defined support hours,
- clear stop conditions.

## Stage C: recurring product subscription

After the pilot proves value and stability, convert the client to recurring access.

Recurring value should include:

- staff workspace,
- patient management,
- automated schedules,
- voice check-ins,
- escalation queue,
- reporting,
- audit trail,
- support,
- updates,
- monitoring,
- backups,
- security maintenance.

This is where predictable monthly revenue begins.

---

# 5. What you can sell immediately without misleading anyone

You can sell a "Founding Design Partner Program" before production completion.

The offer could be described in plain English as:

> We work with your care team to configure one automated patient follow-up workflow, demonstrate it with safe test data, validate the staff experience, and prepare a controlled live pilot. The live patient-data phase begins only after the agreed security, privacy, telephony, safety, and operational launch requirements are completed.

The exact commercial price is a business decision.

A sensible structure to test is:

- one-time setup/implementation fee,
- optional paid pilot fee,
- recurring subscription after live launch,
- usage component only if telephony/AI costs materially scale with use.

Do not promise unlimited calling or unlimited AI usage until real costs are measured.

Do not advertise a guaranteed clinical outcome.

Do not claim full production or regulatory readiness until the applicable review is actually completed.

---

# 6. What the client should receive immediately after signing

A paying design partner should receive something concrete within the first engagement, even before live patient use.

Deliverables should include:

1. Their organization created in a non-production or controlled environment.
2. Their logo/name/working hours configured where supported.
3. Their first care program documented.
4. Their approved question list entered into the program design.
5. Their escalation process mapped.
6. Their staff roles mapped.
7. Synthetic patient records configured.
8. Several complete simulated/test scenarios.
9. A staff walkthrough.
10. A written list of remaining live-pilot gates.
11. A target live-pilot configuration.
12. A named support/contact process.

The client should feel that they bought a real implementation engagement, not a promise.

---

# 7. The sellable demo that must exist first

Before outbound sales, build one polished demonstration path.

The demo must not require the developer to change database rows by hand between scenes.

## Demo scene 1: clinic overview

Show:

- today's scheduled check-ins,
- completed calls,
- failed calls,
- open escalations,
- upcoming calls,
- basic system state.

## Demo scene 2: patient profile

Show one patient with:

- contact details,
- consent/callability state,
- care program,
- next check-in,
- recent call history,
- open follow-up state.

## Demo scene 3: scheduled call

Use either:

- a deterministic simulated call in early demos, or
- a real test call to an approved test number once real telephony is ready.

Show the call state move through the system.

## Demo scene 4: normal completion

Show:

- transcript,
- structured answers,
- summary,
- completed status.

## Demo scene 5: concerning response

Show a pre-built safety scenario.

Example:

```text
Patient reports a concerning symptom
        |
        v
System stops routine automation as required
        |
        v
Escalation is created
        |
        v
Care team sees priority/reason/evidence
        |
        v
Operator acknowledges and resolves
```

## Demo scene 6: no-answer retry

Show that no answer is not silently treated as success.

## Demo scene 7: opt-out

Show:

- patient requests no more calls,
- communication state changes,
- future schedule is suppressed,
- audit event exists.

## Demo scene 8: report

Show what management can learn:

- attempted,
- reached,
- completed,
- escalated,
- unresolved,
- opt-outs.

A buyer should understand the product without reading code.

---

# 8. The first buyer profile

Do not start by targeting the largest hospital systems.

Large health systems often have:

- long procurement cycles,
- security reviews,
- legal reviews,
- integration requirements,
- vendor-management requirements,
- complex identity systems,
- architecture boards,
- multiple stakeholders.

That can kill early speed.

## Better early targets

Start with organizations where the decision maker is closer to daily operations, for example:

- independent urgent-care groups,
- small multi-site clinics,
- outpatient practices,
- specialty clinics with repetitive follow-up workflows,
- care-management organizations,
- concierge or membership practices,
- organizations willing to begin with test/synthetic data while procurement is completed.

The ideal early buyer has a painful repetitive phone workflow and an identifiable person who owns that workflow.

Potential champions include:

- operations manager,
- clinic administrator,
- care coordination manager,
- nursing operations leader,
- patient-experience leader,
- medical director interested in operational improvement.

The exact user and buyer need to be validated through interviews.

---

# 9. The discovery questions to ask before building custom features

Do not ask a potential client:

> Would you use an AI voice agent?

That invites vague positive answers.

Ask about current behavior.

Examples:

- Which patient calls does your team make repeatedly every day or week?
- Who makes those calls today?
- Roughly how many are attempted?
- What happens when nobody answers?
- What information do staff collect?
- Which answers require human follow-up?
- How are those follow-ups tracked today?
- Where do calls fall through the cracks?
- How do you document that a patient was contacted?
- What makes this workflow expensive or frustrating?
- Which workflow would you automate first if you trusted the system?
- What information are you unwilling to let automation handle?
- Who must approve a live pilot?
- What security/privacy documents will procurement request?
- What would make you stop a pilot immediately?
- What result would make the pilot clearly worth paying for?

The answers should drive implementation priorities.

---

# 10. Do not build custom features for every prospect

Early clients will ask for many things.

Examples:

- SMS,
- WhatsApp,
- appointment booking,
- Epic,
- Athenahealth,
- custom reports,
- custom roles,
- custom voice,
- ten languages,
- inbound calls,
- insurance workflows,
- billing workflows.

Use this filter:

## Build now if

- it is required for the first narrow workflow to function safely,
- it is likely to be needed by several clients,
- it materially improves conversion or retention,
- it removes recurring manual operations from your team.

## Delay if

- only one prospect asked for it,
- it introduces a major integration before a contract exists,
- it creates clinical or legal scope expansion,
- it turns the product into a custom-services company,
- it makes the architecture significantly more complex without helping the first use case.

A recurring software business is difficult to build if every client receives a different codebase.

---

# 11. Current-state to first polished demo plan

This is the fastest engineering path to something worth showing repeatedly.

## Step 1: freeze the product story

Use one product sentence:

> CheckIn Care automates routine post-visit patient check-ins and gives care teams a prioritized human follow-up queue when automation should not continue alone.

Do not keep changing the pitch every week.

## Step 2: remove misleading demo behavior

The demo must clearly label simulated versus live functionality.

Replace accidental hardcoded/sample behavior with an intentional demo-data system.

For example:

```text
DEMO_MODE=true
```

should load clearly fictional organizations, patients, calls, and escalations.

Do not let hardcoded sample data look like production API data.

## Step 3: create the Today screen

A buyer should immediately see:

- urgent follow-ups,
- routine follow-ups,
- failed/retry-exhausted calls,
- upcoming calls,
- completed calls.

## Step 4: create Patient 360

One screen should explain the patient relationship.

## Step 5: create Call Detail

Make the call explainable from beginning to end.

## Step 6: create Escalations

This is mandatory for the product story.

## Step 7: create one Care Program

Hardcoding one approved initial template is acceptable before a full visual builder, as long as it is versioned and the product knows exactly which version ran.

## Step 8: create one-click demo reset

A salesperson should be able to reset demo state without engineering help.

## Step 9: create demo scripts

Document exactly what to show during a 10-minute, 20-minute, and 45-minute demonstration.

## Step 10: create a public-facing product page or sales deck

The buyer should have something understandable to review after the call.

---

# 12. Current-state to controlled paid pilot plan

A paid pilot requires more than a polished demo.

The minimum engineering scope should include the following.

## Foundation

- canonical organization model,
- organization ownership on protected records,
- canonical patient model,
- canonical call session and call attempt model,
- canonical audit event model,
- migration reconciliation.

## Identity and permissions

- individual user accounts,
- secure sessions,
- server-side authorization,
- required role model,
- disabled-user handling,
- cross-organization isolation tests.

## Patient communication safety

- callability state,
- opt-out,
- wrong number,
- invalid phone,
- pause/resume,
- consent/evidence model appropriate to the approved pilot.

## Telephony

- one real provider,
- outbound calls,
- official webhook verification,
- deduplication,
- allowed state transitions,
- timeout/error handling,
- provider health visibility.

## Voice runtime

- real audio connection,
- speech recognition,
- conversation workflow,
- text-to-speech,
- interruption handling,
- silence handling,
- uncertainty handling,
- safe failure behavior.

## Safety

- deterministic high-priority rules,
- approved AI classification where needed,
- schema validation,
- safe model-output handling,
- human-request handling,
- escalation creation.

## Care-team workflow

- Today queue,
- Patients,
- Patient 360,
- Calls,
- Call Detail,
- Escalations,
- resolution actions,
- audit history.

## Operations

- automated tests,
- CI,
- staging,
- production deployment process,
- structured logs,
- metrics,
- alerts,
- backups,
- restore test,
- rollback,
- emergency outbound-call stop control.

## Client readiness

- onboarding checklist,
- test-user/test-patient process,
- support route,
- client-specific configuration,
- data-retention direction,
- applicable security/privacy/legal/clinical review.

The pilot cannot be considered safe because a happy-path call worked once.

---

# 13. The minimum live-pilot launch gate

Before the first real client depends on the product, the following must be true.

## Organization and access

- [ ] every protected record has correct organization ownership,
- [ ] users have individual accounts,
- [ ] protected APIs require authentication,
- [ ] role/ownership checks run server-side,
- [ ] Clinic A cannot access Clinic B data,
- [ ] disabled users cannot continue accessing the system.

## Patient communication

- [ ] patient phone validation exists,
- [ ] opt-out works from both staff and patient workflow,
- [ ] future calls stop after opt-out,
- [ ] wrong-number flow exists,
- [ ] retry limits exist,
- [ ] call windows/timezones are respected,
- [ ] applicable consent/disclosure approach has been reviewed.

## Real call

- [ ] real outbound call works,
- [ ] provider webhooks are cryptographically/officially verified as applicable,
- [ ] duplicate events do not duplicate business actions,
- [ ] late/out-of-order events do not corrupt final state,
- [ ] provider failure has a visible recovery path.

## Voice

- [ ] ordinary call completes,
- [ ] silence does not create an infinite loop,
- [ ] interruption works acceptably,
- [ ] repeated misunderstanding fails safely,
- [ ] AI/provider failure does not invent medical guidance,
- [ ] partial results survive unexpected disconnect where useful.

## Safety and escalation

- [ ] each approved high-priority synthetic scenario has a deterministic expected outcome,
- [ ] escalation persists in the database,
- [ ] escalation appears in the staff queue,
- [ ] staff can acknowledge/assign/resolve it,
- [ ] unresolved escalations cannot silently disappear,
- [ ] unavailable-human behavior is defined.

## Operations

- [ ] critical automated tests pass,
- [ ] CI is required for changes,
- [ ] staging exists,
- [ ] release process is documented,
- [ ] production can be rolled back,
- [ ] monitoring detects major failures,
- [ ] backups are automated,
- [ ] a restore has actually been tested,
- [ ] emergency pause/stop control works.

## External approval

- [ ] applicable client security requirements are known,
- [ ] applicable privacy/contract requirements are known,
- [ ] applicable telephony/recording rules are reviewed,
- [ ] applicable clinical/safety boundaries are approved,
- [ ] vendor/provider contractual requirements are satisfied for the intended data/use case.

If these conditions are not met, sell the design-partner phase, not the production deployment.

---

# 14. The first pilot should be deliberately small

Do not launch the first live client across an entire organization.

Recommended shape:

```text
1 organization
1 site/team
1 care program
1 small cohort
1 telephony provider
1 voice configuration
1 escalation workflow
limited staff users
short observation period
```

The exact cohort size should be agreed with the client based on operational capacity and safety review.

The purpose of the first pilot is not maximum call volume.

It is to prove:

- the workflow works,
- staff understand it,
- patients can interact with it,
- escalations are manageable,
- failures are visible,
- value can be measured,
- the product can be operated repeatedly.

---

# 15. Define success before the pilot begins

Never run a pilot where success means "the client liked it."

Agree on measurable outcomes.

Possible operational metrics include:

- patients scheduled,
- call attempts,
- patient reach rate,
- completion rate,
- no-answer rate,
- retry success rate,
- opt-out rate,
- escalation rate,
- escalation acknowledgment time,
- escalation resolution time,
- staff-reported time saved,
- staff corrections to AI-produced structure/summary,
- voice failure rate,
- system failure rate.

Do not claim clinical benefit unless the pilot was actually designed and approved to measure that outcome.

For the first commercial case study, operational outcomes are enough.

---

# 16. What makes a pilot convert into recurring revenue

A buyer keeps paying when the system becomes part of a repeated workflow.

Therefore the product should reduce recurring work.

The strongest conversion signals are:

- staff use the Today queue regularly,
- calls happen automatically without manual triggering,
- failed calls are visible and recoverable,
- care-team members resolve escalations inside the product,
- managers use reporting,
- adding new patients does not require engineering,
- adding staff does not require engineering,
- changing safe business configuration does not require engineering,
- support requests decrease rather than increase,
- the client asks to expand the cohort/site/program.

The weakest conversion signal is:

> The demo looked impressive.

Demos create interest.

Repeated operational value creates recurring revenue.

---

# 17. The recurring pricing model should match the value and cost model

Do not over-engineer pricing before the first buyers.

Test a simple model.

Possible structure:

```text
Monthly platform fee
+
usage allowance
+
additional usage if needed
```

or:

```text
Monthly fee based on active patients / completed check-ins / site
```

Avoid pricing based on technical units the buyer does not understand, such as raw tokens.

Track real internal unit economics:

```text
Revenue
- telephony cost
- STT cost
- AI cost
- TTS cost
- infrastructure
- support/operations time
= contribution margin
```

"Contribution margin" means the amount left after the variable costs required to serve the client.

Do not offer a low flat price with unlimited usage until these costs are measured.

---

# 18. Revenue packages to test

The following are packaging hypotheses, not market facts.

## Package 1: Founding Design Partner

Client buys:

- workflow discovery,
- one program design,
- configured demonstration,
- synthetic scenario validation,
- implementation plan,
- reserved pilot slot.

Commercial shape:

- one-time fee.

This gets revenue before real-patient production readiness.

## Package 2: Controlled Pilot

Client buys:

- limited live deployment,
- defined cohort/site/program,
- implementation/configuration,
- onboarding,
- monitoring/support,
- pilot reporting.

Commercial shape:

- setup fee plus pilot fee.

## Package 3: Production Subscription

Client buys:

- ongoing platform access,
- scheduled outreach,
- staff workflow,
- reporting,
- support,
- operational maintenance.

Commercial shape:

- recurring monthly/annual subscription,
- optionally with usage component.

## Package 4: Expansion

Client buys:

- additional sites,
- additional programs,
- larger patient population,
- advanced integrations,
- enterprise identity/integration requirements.

Do not build Package 4 before Packages 1-3 prove demand.

---

# 19. Sales materials that must exist

Engineering alone will not create revenue.

Before serious outreach, create:

## One-page product overview

Explain:

- problem,
- target workflow,
- how it works,
- what the care team sees,
- what automation will and will not do,
- pilot approach.

## Demo script

A repeatable walkthrough.

## Short recorded demo

A buyer should be able to forward it internally.

## Pilot proposal template

Include:

- scope,
- client responsibilities,
- your responsibilities,
- timeline/milestones,
- data assumptions,
- support model,
- success metrics,
- exclusions,
- commercial terms placeholders.

## Security overview

Explain the architecture and current controls truthfully.

## Data-flow diagram

Show where patient data moves.

## FAQ

Answer:

- What happens if the AI fails?
- Can the AI diagnose?
- What happens when a patient requests a human?
- How do opt-outs work?
- Where is data stored?
- Who can access transcripts?
- What happens if a call fails?
- How does your team support the system?

## Client-readiness checklist

Use `10-client-readiness-checklist.md` internally and share an appropriate client-facing version.

---

# 20. Product language to use and language to avoid

## Better language

- automated patient follow-up,
- routine check-in automation,
- care-team follow-up queue,
- human escalation,
- structured patient responses,
- approved care program,
- non-diagnostic workflow,
- operational reporting.

## Risky or misleading language before evidence/approval

Avoid claiming:

- "replaces nurses",
- "diagnoses patients",
- "guarantees patient safety",
- "fully HIPAA compliant" without the required context/review,
- "zero hallucinations",
- "never misses urgent cases",
- "works with every EHR",
- "fully autonomous medical agent",
- "production-ready" before the launch checklist passes.

Trust is an asset in healthcare sales.

Do not sacrifice it for a stronger demo sentence.

---

# 21. The first customer does not need every future feature

The first production client does not need:

- native iOS/Android apps,
- Kafka,
- Kubernetes,
- many microservices,
- custom speech models,
- ten AI providers,
- every EHR,
- dozens of languages,
- predictive models,
- advanced population-health analytics,
- insurance workflows,
- automated diagnosis.

They need one workflow to work reliably.

This is the fastest path to revenue.

---

# 22. The engineering sequence optimized for revenue

This order differs slightly from a purely technical roadmap because it deliberately produces commercial artifacts early.

## Revenue Milestone 0: truth and positioning

Deliver:

- canonical product statement,
- one use case,
- product screenshots/demo path,
- synthetic demo data,
- design-partner offer,
- pilot proposal template.

Engineering goal:

- make existing prototype behavior deliberately demonstrable,
- remove misleading hardcoded state,
- create reliable demo reset.

Commercial outcome:

- begin design-partner outreach.

## Revenue Milestone 1: polished controlled demo

Deliver:

- Today,
- Patient 360,
- Call Detail,
- Escalation queue,
- one care-program story,
- normal / urgent / no-answer / opt-out demo scenarios.

Commercial outcome:

- run repeatable buyer demonstrations without developer improvisation.

## Revenue Milestone 2: production foundations

Deliver:

- organizations,
- users,
- permissions,
- canonical patient,
- consent/callability,
- canonical schedule/call model,
- audit foundation,
- migrations.

Commercial outcome:

- pass deeper technical buyer conversations and prepare controlled live use.

## Revenue Milestone 3: real call

Deliver:

- production telephony adapter,
- verified/deduplicated webhooks,
- live voice runtime,
- structured results,
- call lifecycle.

Commercial outcome:

- demonstrate the actual end-to-end capability using approved test numbers.

## Revenue Milestone 4: safe human handoff

Deliver:

- safety policy,
- human request,
- urgent/concerning scenario handling,
- durable escalation,
- assignment/acknowledgment/resolution.

Commercial outcome:

- unlock serious care-operations pilot conversations.

## Revenue Milestone 5: pilot operations

Deliver:

- client onboarding,
- patient import,
- program enrollment,
- call windows,
- retries,
- reporting,
- monitoring,
- tests,
- CI/CD,
- backups/recovery,
- support/runbooks.

Commercial outcome:

- launch a controlled paid pilot after required approvals.

## Revenue Milestone 6: recurring subscription

Deliver:

- stable production operations,
- self-service routine admin,
- reliable reporting,
- support process,
- billing/subscription operations outside or inside product as appropriate,
- renewal/expansion workflow.

Commercial outcome:

- convert successful pilot into recurring revenue.

---

# 23. A practical 30-day commercial and engineering push

This is an aggressive working plan, not a guarantee.

Parallel work is assumed where possible.

## Days 1-3: make the product easy to sell

Product/business:

- freeze first use case,
- define buyer,
- create design-partner offer,
- create one-page overview,
- create pilot proposal template,
- define demo narrative.

Engineering:

- finish architecture decisions,
- separate demo data from production data,
- build reliable demo reset,
- remove obviously misleading sample behavior,
- make existing flows stable enough for repeated demos.

Sales:

- start outreach to likely design partners immediately.

Do not wait for production completion before customer discovery.

## Days 4-7: create the polished demo surface

Build/connect:

- Today queue,
- Patient list/Profile,
- Call Detail,
- Escalation queue,
- one care-program representation,
- scripted synthetic scenarios.

Sales:

- run discovery calls,
- show controlled demo,
- collect objections,
- record required procurement/security questions.

## Week 2: production foundation

Build:

- organizations,
- users,
- roles,
- server-side authorization,
- canonical patient,
- consent/callability,
- canonical call/schedule entities,
- migration cleanup,
- core audit events.

Commercial:

- aim to sign a design partner or pilot letter/contract subject to launch gates,
- refine proposal based on real objections.

## Week 3: real voice slice

Build:

- one telephony adapter,
- real outbound test calls,
- verified webhooks,
- real voice runtime,
- safe conversation flow,
- structured response persistence.

Test:

- normal completion,
- no answer,
- opt-out,
- interruption,
- AI/provider failure.

Commercial:

- demonstrate real test-number calls to interested design partners.

## Week 4: safety, pilot operations, release foundation

Build:

- deterministic safety rules,
- durable escalation,
- care-team resolution,
- retry policy,
- patient import,
- onboarding,
- core reports,
- CI,
- staging,
- monitoring,
- backups,
- recovery/runbooks.

External:

- complete required security/privacy/telephony/clinical/legal review for the intended live pilot.

Commercial:

- move first qualified design partner toward controlled live-pilot approval.

A real PHI pilot may require more than 30 days because external approvals and vendor/client review are not controlled only by engineering speed.

---

# 24. If revenue is the priority, do sales and engineering in parallel

A common failure mode is:

```text
Build for six months
        |
        v
finally show someone
        |
        v
learn that buyer wanted a different workflow
```

Avoid this.

Instead:

```text
Build narrow demo
        |
        +--> customer discovery
        |
        +--> sales objections
        |
        +--> engineering
        |
        +--> security/procurement learning
        |
        +--> pilot design
        |
        v
repeat
```

Do not let sales requests override safety/architecture gates, but do let real buyer evidence reorder optional product work.

---

# 25. The founder dashboard

Track commercial progress just as seriously as code progress.

Every week track:

## Pipeline

- target organizations identified,
- contacts reached,
- replies,
- discovery calls,
- demos,
- proposals,
- design partners signed,
- pilots approved,
- production subscriptions.

## Product objections

For each lost or delayed deal, record the reason:

- missing integration,
- missing security requirement,
- no budget,
- wrong use case,
- procurement delay,
- unclear ROI,
- no executive sponsor,
- product reliability concern,
- workflow mismatch.

## Product usage

Once pilots begin:

- enrolled patients,
- calls attempted,
- completion,
- escalations,
- operator usage,
- client support requests,
- expansion requests.

This keeps engineering tied to revenue evidence.

---

# 26. The biggest commercial traps

## Trap 1: claiming readiness too early

One security incident can destroy an early healthcare startup.

## Trap 2: building a platform before a workflow

Clients buy outcomes before they buy architecture.

## Trap 3: accepting every custom request

This becomes consulting with a codebase rather than a scalable product.

## Trap 4: underpricing implementation work

Early clients often require significant configuration/support.

Do not pretend that labor is free.

## Trap 5: ignoring support cost

If every failed call needs the founder to inspect logs, the apparent recurring revenue is not truly scalable.

## Trap 6: selling AI instead of operations

AI is the mechanism. The product value is completed follow-up and safe human attention.

## Trap 7: using real patient data to make the demo look impressive

Use synthetic data until the environment and agreements are ready.

## Trap 8: building an EHR integration before a signed need

Integrations can consume weeks and still not produce revenue.

## Trap 9: measuring vanity metrics

"Calls initiated" is not enough. Measure reach, completion, escalations, failure, and staff value.

## Trap 10: confusing a signed pilot with product-market fit

One client proves willingness from one client.

Repeatability across multiple similar clients is stronger evidence.

---

# 27. What must become self-service before the business scales

The first client can receive some founder-assisted setup.

By clients two through five, routine operations must move into the product.

Prioritize self-service for:

- organization setup,
- staff invitation/deactivation,
- patient import,
- patient correction,
- care-program enrollment,
- call pause/resume,
- escalation routing settings,
- retry/call-window settings,
- reports,
- audit search.

Do not make clients edit environment variables or ask the developer to run SQL for normal operations.

---

# 28. When to add integrations

Add integrations after the core workflow works and a client contract justifies them.

Recommended sequence:

## First

CSV import/export.

Why:

- simple,
- understandable,
- fast to implement,
- works across many clients.

## Then

Stable client API and webhooks.

Why:

- lets technical clients automate data exchange,
- creates a reusable integration boundary.

## Then

FHIR where appropriate.

FHIR is a healthcare data exchange standard. It defines common ways healthcare systems represent and exchange information.

## Then

Specific EHR integrations demanded by paying customers.

Do not reverse this order without a signed commercial reason.

---

# 29. When to add more care programs

Do not create ten programs before one works.

Start with one.

After it is stable, create reusable building blocks such as:

- yes/no question,
- numeric scale,
- free response,
- confirmation,
- retry/clarification,
- escalation rule,
- callback request,
- closing instructions.

Then future programs become controlled configurations instead of separate code branches.

Good later candidates may include:

- post-discharge follow-up,
- medication adherence check-in,
- appointment readiness/reminder,
- chronic-care routine check-in,
- procedure follow-up.

Each new program needs appropriate clinical/product review for its intended use.

---

# 30. How the current web intake fits into the commercial product

Do not throw away the existing intake flow.

It can become another patient interaction channel.

Longer-term:

```text
Care Program
     |
     +--> Voice
     |
     +--> Web intake / follow-up
     |
     +--> SMS later if justified
```

The first commercial voice milestone should not require redesigning the entire existing intake experience.

Preserve it and connect shared patient/organization concepts deliberately later.

---

# 31. Client support model for the first paid pilots

Define support before launch.

Clients need to know:

- how to report a problem,
- what counts as urgent,
- when support is available,
- what happens if calling must stop,
- who investigates incidents,
- how they learn about resolution.

For the earliest pilots, a simple documented support channel is acceptable.

The system still needs operational controls so support does not depend on manually editing data.

Create runbooks for at least:

- telephony provider down,
- AI provider down,
- scheduler stuck,
- duplicate call risk,
- escalation routing failure,
- database unavailable,
- suspected data exposure,
- incorrect client configuration,
- emergency stop of outbound automation.

---

# 32. The security and trust package affects sales velocity

Healthcare buyers often need evidence before they can approve a pilot.

Prepare a client trust folder containing, as applicable:

- architecture overview,
- data-flow diagram,
- authentication/authorization overview,
- encryption approach,
- audit approach,
- data retention approach,
- backup/recovery approach,
- incident response plan,
- subprocessor/vendor list,
- secure development process,
- vulnerability management approach,
- support process,
- privacy/security contacts,
- applicable contract templates or review process.

Do not wait until procurement asks for these after the engineering work is done.

Some items require qualified legal, privacy, security, or clinical review.

Engineering documentation does not replace those reviews.

---

# 33. The product must have a kill switch

Before a live pilot, authorized staff or operators need a safe way to stop outbound automation.

Possible controls:

- pause one patient,
- pause one care program,
- pause one organization,
- pause all outbound calls.

The action should be:

- permission-protected,
- auditable,
- visible,
- reversible when appropriate.

If a provider starts behaving incorrectly, the team should not need to deploy code to stop calls.

This is both an engineering and client-trust feature.

---

# 34. The product must explain failures to ordinary users

Do not show a care coordinator:

```text
Webhook 500 / ECONNRESET
```

Show:

```text
Call could not be completed because the calling service was temporarily unavailable.
No additional retry will occur until the configured retry window.
```

Keep technical details available to authorized operations users.

Ordinary users need actionable language.

---

# 35. Definition of "usable"

For this project, usable does not mean the application opens.

It means a client can perform normal work without engineering help.

A usable V1 allows a client to:

1. sign in,
2. access only their organization,
3. add/import patients,
4. understand who can be called,
5. enroll a patient in the approved program,
6. see upcoming check-ins,
7. let the scheduler initiate approved calls automatically,
8. see call outcomes,
9. see and resolve escalations,
10. respect opt-outs,
11. view reports,
12. manage routine staff access,
13. receive understandable failure messages,
14. contact support when needed.

If a developer must manually perform one of these normal steps, that step is not yet productized.

---

# 36. Definition of "sellable"

A product is sellable when a buyer can understand:

- what problem it solves,
- what they receive,
- what it costs,
- what it does not do,
- how they start,
- how success is measured,
- how risks are controlled,
- how support works.

A polished repository alone does not make a product sellable.

The product needs packaging and an implementation path.

---

# 37. Definition of "renewable"

A client will renew when:

- the workflow is used repeatedly,
- staff trust the results,
- failures are manageable,
- the system saves measurable effort or improves operations,
- support is dependable,
- reporting helps justify the spend,
- switching back to the previous manual workflow would feel worse.

Build toward renewability, not only initial sale.

---

# 38. Definition of "scalable revenue"

Revenue is not scalable if every additional client requires the founder to:

- create database rows manually,
- change code,
- deploy a private fork,
- inspect every call,
- manually retry jobs,
- configure secrets by trial and error,
- build a unique integration,
- explain every failure personally.

Scalable revenue requires more client volume without proportional founder work.

That is why organization setup, users, import, configuration, monitoring, and support tools matter commercially.

---

# 39. Stop conditions

A devil's-advocate launch plan needs explicit reasons to pause.

Pause a live pilot if any of the following occurs and the impact is not understood/contained:

- possible cross-client data exposure,
- unexpected repeated/duplicate outbound calls,
- opt-out not respected,
- high-priority escalation not created/routed as expected,
- AI gives disallowed medical guidance,
- call-state corruption causes unsafe retry behavior,
- provider webhook verification fails unexpectedly,
- backup/restore capability is unavailable during a significant incident,
- monitoring shows the team cannot reliably understand what is happening.

A pause is not failure.

Continuing risky automation because a client is paying is failure.

---

# 40. Decision log that must be completed before the live pilot

These decisions cannot be silently invented by coding agents.

## Needs Architect Decision

- canonical organization model,
- canonical patient model,
- canonical call/session/attempt model,
- canonical audit model,
- production deployment architecture,
- first telephony provider,
- voice runtime integration pattern.

## Needs Product/Founder Decision

- exact first use case,
- target buyer,
- pilot scope,
- pricing/package hypothesis,
- support hours,
- initial geography,
- whether recording is a product requirement.

## Needs Clinical/Product Safety Decision

- approved question set,
- disallowed behavior,
- safety trigger categories,
- human escalation expectations,
- unavailable-human behavior,
- language shown/spoken to patients.

## Needs Security/Privacy Decision

- identity/MFA requirements,
- transcript access rules,
- retention,
- recording policy,
- export policy,
- support-access model.

## Needs Legal/Compliance Review

- applicable privacy/security obligations,
- client agreements,
- telephony/consent/disclosure rules,
- recording rules where applicable,
- vendor/subprocessor contractual requirements,
- marketing claims.

---

# 41. The one-line build strategy

If the team forgets everything else in this file, remember this:

> Sell a narrow paid design partnership now, build one end-to-end post-visit follow-up workflow to production quality, launch it with one controlled client, prove operational value, convert it to recurring revenue, and only then expand the platform.

---

# 42. Recommended next engineering actions

In order:

1. Freeze the first commercial workflow.
2. Finalize `docs/repo_context.md` as engineering truth.
3. Freeze canonical organization/patient/call/audit contracts.
4. Separate intentional demo fixtures from production data paths.
5. Build the sellable care-team demo: Today, Patient 360, Call Detail, Escalations.
6. Create one versioned care program.
7. Implement organizations, users, permissions, and tenant isolation.
8. Implement canonical patient/consent/callability.
9. Reconcile schedules/call sessions/call attempts and migrations.
10. Integrate one real telephony provider.
11. Implement the real voice runtime.
12. Implement safety and durable human escalation.
13. Connect all care-team screens to authenticated live APIs.
14. Add client onboarding and CSV import.
15. Add reporting and audit search.
16. Add comprehensive automated tests and AI evaluations.
17. Add CI/CD and staging.
18. Add monitoring, alerts, backup/restore, rollback, and kill switches.
19. Complete applicable external client/security/privacy/legal/clinical review.
20. Run the client-readiness checklist.
21. Launch one small controlled paid pilot.
22. Measure outcomes.
23. Fix repeated operational pain.
24. Convert the pilot to subscription.
25. Repeat with a second similar client before broad product expansion.

---

# 43. What "done" looks like commercially

The first commercial V1 is done when all of this is true:

```text
A new client can be onboarded
        |
        v
Their users can sign in
        |
        v
Their patients are isolated from all other clients
        |
        v
Patients can be imported without engineering
        |
        v
One approved program can be assigned
        |
        v
Calls happen automatically
        |
        v
Real voice interaction works
        |
        v
Routine results are saved
        |
        v
Unsafe/uncertain cases become human work
        |
        v
Staff resolve follow-up inside the product
        |
        v
Opt-outs and failures are handled
        |
        v
Managers can see useful reporting
        |
        v
The engineering team can monitor/recover the system
        |
        v
The client sees enough repeated value to keep paying
```

That is the usable, sellable, renewable product target.

---

# 44. Final devil's-advocate verdict

## Can the current repository be sold today as finished production healthcare software?

No.

## Can the project start generating commercial conversations immediately?

Yes.

## Can a client pay immediately for a transparent design-partner / implementation engagement?

Yes, if the commercial agreement accurately describes what exists, what is being delivered, and when real patient-data/live-operation gates apply.

## Should real PHI be used just to speed up a demo?

No.

## Should the team wait until every production feature is complete before talking to buyers?

No.

## What is the fastest responsible route to regular income?

1. Sell a narrow paid design-partner engagement.
2. Use synthetic/test data first.
3. Build one complete production workflow rather than many partial features.
4. Launch one small controlled paid pilot after the required gates pass.
5. Measure operational value.
6. Convert the pilot to a recurring subscription.
7. Make client two easier to onboard than client one.
8. Expand only when repeated buyer evidence justifies it.

The project's success should not be measured by the number of files, models, services, prompts, or AI features built.

It should be measured by whether a real care team can depend on one workflow, whether patients are handled safely, whether the product can be operated without constant developer intervention, and whether clients continue paying because the workflow is genuinely useful.
