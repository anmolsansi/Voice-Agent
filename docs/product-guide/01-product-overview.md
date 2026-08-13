# CheckIn Care Product Overview

## 1. What problem are we solving?

Healthcare teams often need to contact patients between visits.

The reason may be simple:

- check whether the patient is doing okay,
- ask whether medication was taken,
- remind the patient about an appointment,
- check whether symptoms changed,
- follow up after discharge or a procedure,
- ask whether the patient needs a human callback,
- identify people who did not respond after several outreach attempts.

Today, much of this work can require staff members to manually review patient lists, make repeated phone calls, leave voicemails, document what happened, and decide which patients need faster follow-up.

That work is repetitive, but it is not unimportant. The information collected can affect what a care team does next.

CheckIn Care is intended to automate the routine part while keeping people responsible for safety-sensitive decisions.

---

# 2. Product definition

CheckIn Care should become an **AI-assisted patient outreach and check-in platform for healthcare teams**.

In plain English, that means:

1. a clinic adds or imports patients,
2. staff chooses which check-in program each patient should receive,
3. the system decides when the next approved check-in is due,
4. the system places an outbound call,
5. the patient hears clear questions,
6. the patient answers naturally by voice or, where supported, keypad input,
7. the system stores structured answers and the conversation record allowed by policy,
8. the system checks for known reasons that require human attention,
9. routine calls are marked complete,
10. concerning or unclear situations are sent to a human work queue,
11. staff reviews and resolves follow-up,
12. important actions are recorded in an audit history.

The product should make routine outreach easier without pretending the automated system is a doctor or nurse.

---

# 3. The product promise

A good product promise for CheckIn Care is:

> CheckIn Care helps care teams complete routine patient check-ins automatically and clearly shows staff which patients need human follow-up.

This promise is intentionally narrower than "AI healthcare assistant."

Narrow promises are safer and easier to prove.

The product should be judged by questions such as:

- Did the right patient receive the intended check-in?
- Did the call happen at an appropriate time?
- Were the approved questions asked?
- Were the answers saved correctly?
- Did the patient ask to stop future calls?
- Did the system recognize a situation that required follow-up?
- Did a human actually receive the follow-up task?
- Can the clinic understand what happened later?
- Did the system fail safely when a provider or AI service broke?

---

# 4. Who is the product for?

## Patient

The patient receives the check-in.

The patient should not need to understand AI, software, or the clinic's internal systems.

The experience should feel like a short, understandable automated call with clear boundaries.

The patient may need to:

- confirm that the correct person was reached,
- hear why the call is happening,
- provide or confirm consent where required,
- answer questions,
- ask for repetition,
- say they are unavailable,
- request a later callback,
- ask to speak with a person,
- opt out,
- report something that requires human attention.

## Care coordinator or patient-support operator

This person handles much of the daily work.

They need to know:

- which calls are due,
- which calls completed,
- which patients did not answer,
- which patients requested help,
- which escalations are still unresolved,
- which tasks belong to them,
- what happened during a call,
- what follow-up was already completed.

The product should reduce the need to search across spreadsheets, call logs, and separate notes.

## Nurse or clinician

A nurse or clinician may not review every routine call.

Instead, the system should help direct appropriate cases to them.

They may need to:

- review a concerning transcript section,
- review a structured summary,
- see why the system escalated,
- document follow-up,
- close or reclassify an escalation.

CheckIn Care should support their work, not make medical decisions on their behalf.

## Urgent-care operations team

The phrase "urgent-care team" can mean different things, so the product should not assume one universal workflow.

For this project, an urgent-care operational workflow could mean staff who monitor patient outreach around an urgent-care visit, discharge, follow-up, or unresolved concern.

Examples:

- checking whether a patient can attend follow-up,
- checking whether symptoms have worsened after a visit,
- reminding the patient about next steps that the clinic has already approved,
- routing a concerning answer to a human,
- documenting that contact was attempted.

The automated system should not act as an emergency dispatch service.

## Clinic administrator

An administrator needs to configure the product without editing code.

They may need to manage:

- team members,
- roles,
- calling hours,
- retry rules,
- programs,
- escalation contacts,
- retention settings,
- organization information,
- voice/provider settings,
- patient import settings.

## Internal CheckIn Care support or platform administrator

The software provider may need to manage client organizations and diagnose operational problems.

However, internal support access must not automatically mean unrestricted access to patient information.

Support access should be controlled, time-limited where possible, and audited.

---

# 5. The core user journey

A successful product should support one clear journey from setup to follow-up.

## Step 1: organization setup

A client organization is created.

Example:

`Northside Urgent Care`

The organization has its own:

- users,
- patients,
- programs,
- schedules,
- calls,
- escalations,
- settings,
- audit history.

Data from another organization must never appear here.

## Step 2: team setup

The administrator invites staff members.

Each user receives an individual account and role.

The product should know that `Nurse A` resolved an escalation rather than recording that a generic shared staff account performed the action.

## Step 3: care program setup

The clinic chooses or creates a care program.

A care program is an approved definition of what type of check-in should happen.

Example:

`Post-Urgent-Care 48-Hour Follow-Up`

It may define:

- when the patient should be called,
- approved questions,
- retry limits,
- available callback choices,
- escalation rules,
- whether recording is allowed,
- what outcome counts as complete.

## Step 4: patient enrollment

The patient is added to the program.

The product stores the patient's contact information, status, timezone, and required consent or outreach preferences.

## Step 5: scheduling

The system calculates when the check-in should occur.

It must respect:

- the patient's timezone,
- approved call windows,
- opt-out state,
- organization policy,
- retry policy,
- patient status.

## Step 6: outbound call

The telephony provider places the real telephone call.

A telephony provider is a service that connects software to the telephone network.

The product should track:

- requested call,
- provider call identifier,
- ringing,
- answer,
- no answer,
- busy,
- voicemail if supported,
- completion,
- provider failure.

## Step 7: voice conversation

The system follows the approved program.

The language may sound conversational, but the workflow should remain controlled.

The product may use AI to understand what the patient said and phrase a natural response.

However, the underlying state should remain clear.

For example:

`QUESTION_3_MEDICATION_ADHERENCE`

is safer and easier to audit than one unstructured prompt that lets the AI invent the entire call.

## Step 8: structured result

The conversation is converted into fields the care team can use.

Example:

- patient reached: yes,
- check-in completed: yes,
- medication taken as directed: no,
- callback requested: yes,
- urgent safety signal: no,
- follow-up required: yes.

## Step 9: safety and escalation

The product evaluates whether a human needs to review the interaction.

A human work item should be created when required.

The work item should explain:

- why it was created,
- how urgent it is,
- which patient it concerns,
- which call triggered it,
- which transcript lines are relevant,
- who owns the follow-up,
- whether anyone has acknowledged it.

## Step 10: human resolution

A staff member opens the escalation, reviews the evidence, performs the appropriate human follow-up outside or inside supported tools, and records the resolution.

Nothing important should simply disappear from the queue without a recorded reason.

---

# 6. The role of AI

AI is useful, but it should have a narrow job.

## Good uses of AI

AI can help with:

- understanding a patient's natural-language answer,
- converting speech into structured fields,
- asking a clarification question,
- producing a short summary,
- making approved wording sound less robotic,
- identifying likely intent such as "call me later" or "I want to stop these calls."

## Bad uses of AI

The product should not allow the AI to independently:

- diagnose a patient,
- prescribe treatment,
- change medication,
- decide that a dangerous situation can be ignored,
- invent a clinic policy,
- promise a callback time the clinic has not staffed,
- decide who can view private patient information,
- silently rewrite historical records.

## Why structured AI output matters

Instead of accepting any text the AI produces, the application should ask for a defined structure.

For example:

```json
{
  "callback_requested": true,
  "medication_taken": false,
  "urgent_signal": false,
  "confidence": 0.91
}
```

The application can validate this structure before storing or acting on it.

Validation means checking whether the result has the required fields and allowed values.

---

# 7. What the product should deliberately not do in the first production version

A focused V1 should avoid features that add risk or complexity before the core workflow is reliable.

Do not make the first production version responsible for:

- emergency dispatch,
- diagnosis,
- clinical decision support,
- changing medication,
- insurance claims,
- patient billing,
- full electronic health record replacement,
- autonomous appointment changes across every external system,
- a native mobile app,
- dozens of languages before one language is reliable,
- highly autonomous multi-agent behavior,
- custom speech models,
- predictive medical-risk scoring without separate validation and governance.

The first product should be excellent at one thing: routine check-ins with reliable human escalation.

---

# 8. Care programs: the key product abstraction

The most important product addition beyond the current repository is the concept of a versioned care program.

A care program answers:

- Who should receive this check-in?
- When should it happen?
- What should be asked?
- What is optional?
- What happens after no answer?
- What situations create follow-up?
- Who receives that follow-up?
- When is the program considered complete?

Example program:

## Post-Urgent-Care Follow-Up

**Purpose:** check how the patient is doing after an urgent-care visit and identify cases that require a human callback.

**Timing:** 24 to 48 hours after visit.

**Questions:**

1. Is now a good time for a short follow-up?
2. Are your symptoms improving, unchanged, or getting worse?
3. Are you having any new concerning symptoms?
4. Were you able to follow the discharge instructions?
5. Do you need someone from the care team to call you?

**Possible outcomes:**

- completed, no follow-up,
- routine callback requested,
- concerning answer requiring review,
- patient unavailable,
- wrong number,
- opt-out,
- failed after retry limit.

This program should be versioned.

Versioning means that if the clinic changes question 3 tomorrow, old calls still record which older version they used.

---

# 9. What makes the product trustworthy

A care team will not trust CheckIn Care merely because the AI sounds natural.

Trust comes from predictable behavior.

The product should make it easy to answer:

- Why did this patient get called?
- Which program version was used?
- What exactly did the patient say?
- What structured result was produced?
- Why did the system create an escalation?
- Which rule triggered?
- Which staff member reviewed it?
- What did they do?
- When did they do it?
- Did any provider fail during the process?
- Was anything retried?
- Was the patient opted out afterward?

That is why auditability and operational visibility are core product features, not engineering extras.

---

# 10. What "highly usable" should mean

A highly usable product should let a new care coordinator learn the daily workflow with minimal training.

They should not need to understand:

- database tables,
- provider webhooks,
- AI model names,
- JSON,
- deployment infrastructure.

The interface should use human language.

Instead of:

`provider_status = no_answer`

show:

`Patient did not answer`

Instead of:

`escalation_type = safety_urgent`

show:

`Urgent review needed`

Instead of:

`retry_count = 2/3`

show:

`2 of 3 call attempts used`

Technical details can still exist in an admin or debugging view.

---

# 11. What success looks like for a first client

A first client should be able to:

1. create its organization,
2. invite users,
3. configure basic roles,
4. import a small patient list,
5. create or activate one approved care program,
6. configure call windows and escalation contacts,
7. run a test call,
8. review the test call and transcript,
9. schedule real outreach,
10. see daily call status,
11. see failures and retries,
12. review escalations,
13. assign escalations,
14. record resolutions,
15. view patient history,
16. export approved operational reports,
17. review an audit history,
18. understand whether the system is healthy.

If the client needs an engineer for ordinary daily tasks, the product is not yet client-ready.

---

# 12. Product principles for every future ticket

Every future feature should be checked against these principles.

## Principle 1: patient safety before convenience

When automation and safety conflict, choose the safer path.

## Principle 2: humans own clinical follow-up

The software helps route and document work. It does not replace clinical responsibility.

## Principle 3: no silent failure

If a call, webhook, AI step, escalation route, or database action fails, the product must record and surface it appropriately.

## Principle 4: no mystery automation

A user should be able to understand why an important automated action occurred.

## Principle 5: one source of truth

Do not create multiple competing patient, call, or alert models.

## Principle 6: private by default

Sensitive information should only be visible to people and services that need it.

## Principle 7: configuration should be product behavior

Clients should configure call windows, retry policy, programs, users, and escalation contacts through the product rather than editing environment variables or code.

## Principle 8: prototypes must be labeled honestly

Sample data and simulated calls are useful, but they should never be presented as finished production integrations.

## Principle 9: design for failure

External providers will fail. Networks will fail. Patients will hang up. AI responses will sometimes be uncertain. Production behavior must define what happens next.

## Principle 10: prove before claiming

A feature is not production-ready because the code exists. It is production-ready when the complete user journey, security, tests, monitoring, documentation, and failure behavior are demonstrated.
